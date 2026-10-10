
import os
import pandas as pd
import joblib

from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report


# ==========================================
# 1. DEFINE PROJECT PATHS
# ==========================================

PROJECT_ROOT = os.path.dirname(
    os.path.dirname(os.path.abspath(__file__))
)

DATA_DIR = os.path.join(PROJECT_ROOT, "data")
PYTHON_DIR = os.path.join(PROJECT_ROOT, "python")

ROADS_FILE = os.path.join(DATA_DIR, "roads.csv")
LOCATIONS_FILE = os.path.join(DATA_DIR, "locations.csv")

PREDICTIONS_FILE = os.path.join(
    DATA_DIR, "risk_predictions.csv"
)

MODEL_FILE = os.path.join(
    PYTHON_DIR, "disaster_risk_model.joblib"
)

CONFIG_FILE = os.path.join(
    PYTHON_DIR, "preprocessing_config.joblib"
)


# ==========================================
# 2. LOAD DATA
# ==========================================

roads = pd.read_csv(ROADS_FILE)
locations = pd.read_csv(LOCATIONS_FILE)

print("Roads loaded:", len(roads))
print("Locations loaded:", len(locations))


# ==========================================
# 3. NORMALIZE LOCATION IDS
# ==========================================

def normalize_location_id(location_id):
    location_id = str(location_id).strip()

    if location_id.startswith("LOC_"):
        number = location_id[4:]

        if number.isdigit():
            return f"LOC_{int(number):04d}"

    return location_id


roads["source"] = roads["source"].apply(
    normalize_location_id
)

roads["destination"] = roads["destination"].apply(
    normalize_location_id
)

locations["id"] = locations["id"].apply(
    normalize_location_id
)


# ==========================================
# 4. VERIFY LOCATION IDS
# ==========================================

location_ids = set(locations["id"])

invalid_sources = roads[
    ~roads["source"].isin(location_ids)
]

invalid_destinations = roads[
    ~roads["destination"].isin(location_ids)
]

print("\nInvalid source IDs:", len(invalid_sources))
print("Invalid destination IDs:", len(invalid_destinations))


# ==========================================
# 5. MAP CATEGORICAL VALUES
# ==========================================

traffic_mapping = {
    "Low": 0,
    "Medium": 1,
    "High": 2,
    "Severe": 3
}

condition_mapping = {
    "Good": 0,
    "Fair": 1,
    "Poor": 2,
    "Damaged": 2,
    "Severely Damaged": 3
}

status_mapping = {
    "Open": 0,
    "Closed": 1
}

# Normalize category strings before mapping.
for column in ["traffic", "road_condition", "status"]:
    roads[column] = (
        roads[column]
        .astype("string")
        .str.strip()
        .replace("", pd.NA)
    )

roads["traffic_score"] = roads["traffic"].map(
    traffic_mapping
)

roads["condition_score"] = roads["road_condition"].map(
    condition_mapping
)

roads["status_score"] = roads["status"].map(
    status_mapping
)

# Show categories that were not recognized.
print("\nUnrecognized traffic values:")
print(
    sorted(
        set(roads.loc[
            roads["traffic_score"].isna(), "traffic"
        ].dropna().astype(str))
    )
)

print("\nUnrecognized road condition values:")
print(
    sorted(
        set(roads.loc[
            roads["condition_score"].isna(), "road_condition"
        ].dropna().astype(str))
    )
)

print("\nUnrecognized status values:")
print(
    sorted(
        set(roads.loc[
            roads["status_score"].isna(), "status"
        ].dropna().astype(str))
    )
)


# ==========================================
# 6. VALIDATE NUMERIC FEATURES
# ==========================================

numeric_columns = ["distance", "travel_time"]

for column in numeric_columns:
    roads[column] = pd.to_numeric(
        roads[column], errors="coerce"
    )

# Calculate numeric feature medians.
# Missing numeric values are filled with these medians.
numeric_fill_values = roads[numeric_columns].median()

for column in numeric_columns:
    roads[column] = roads[column].fillna(
        numeric_fill_values[column]
    )

# Fill missing/unrecognized categorical scores using medians.
# This prevents NaN values from reaching the model.
categorical_score_columns = [
    "traffic_score",
    "condition_score",
    "status_score"
]

for column in categorical_score_columns:
    median_value = roads[column].median()

    if pd.isna(median_value):
        raise ValueError(
            f"Cannot calculate a valid median for {column}. "
            "Check the category mappings and source CSV."
        )

    roads[column] = roads[column].fillna(median_value)


# ==========================================
# 7. CALCULATE NORMALIZED SCORES
# ==========================================

distance_min = roads["distance"].min()
distance_max = roads["distance"].max()

if distance_max == distance_min:
    roads["distance_score"] = 0.0
else:
    roads["distance_score"] = (
        (roads["distance"] - distance_min)
        / (distance_max - distance_min)
    ) * 10


time_min = roads["travel_time"].min()
time_max = roads["travel_time"].max()

if time_max == time_min:
    roads["travel_time_score"] = 0.0
else:
    roads["travel_time_score"] = (
        (roads["travel_time"] - time_min)
        / (time_max - time_min)
    ) * 10


# ==========================================
# 8. CALCULATE DISASTER RISK SCORE
# ==========================================

roads["disaster_risk_score"] = (
    (roads["traffic_score"] / 3 * 20)
    + (roads["condition_score"] / 3 * 30)
    + (roads["status_score"] * 30)
    + roads["travel_time_score"]
    + roads["distance_score"]
)


# ==========================================
# 9. CONVERT SCORE TO RISK CLASS
# ==========================================

def classify_risk(score):
    if score <= 25:
        return "Low"
    elif score <= 50:
        return "Medium"
    elif score <= 75:
        return "High"
    else:
        return "Critical"


roads["risk_class"] = roads[
    "disaster_risk_score"
].apply(classify_risk)


# ==========================================
# 10. DISPLAY RISK RESULTS
# ==========================================

print("\nSample risk calculations:")

print(
    roads[
        [
            "id",
            "distance",
            "traffic",
            "road_condition",
            "status",
            "disaster_risk_score",
            "risk_class"
        ]
    ].head(10)
)

print("\nRisk class distribution:")
print(roads["risk_class"].value_counts())


# ==========================================
# 11. PREPARE ML FEATURES
# ==========================================

features = [
    "distance",
    "travel_time",
    "traffic_score",
    "condition_score",
    "status_score"
]

X = roads[features].copy()
y = roads["risk_class"].copy()

print("\nMissing feature values:")
print(X.isnull().sum())

print("\nMissing target values:", y.isnull().sum())


# ==========================================
# 12. CLEAN TRAINING DATA
# ==========================================

dataset = X.copy()
dataset["risk_class"] = y

dataset = dataset.dropna()

X = dataset[features]
y = dataset["risk_class"]

if len(dataset) < 2:
    raise ValueError(
        "Not enough valid samples to train the model."
    )

if y.nunique() < 2:
    raise ValueError(
        "At least two risk classes are required for training."
    )

print("\nValid training dataset rows:", len(dataset))


# ==========================================
# 13. TRAIN / TEST SPLIT
# ==========================================

class_counts = y.value_counts()

# Stratification requires at least two samples per class
# and enough test samples to represent all classes.
number_of_classes = y.nunique()
test_count = max(
    number_of_classes,
    int(len(dataset) * 0.2)
)

can_stratify = (
    class_counts.min() >= 2
    and test_count < len(dataset)
    and len(dataset) - test_count >= number_of_classes
)

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42,
    stratify=y if can_stratify else None
)

print("\nTraining samples:", len(X_train))
print("Testing samples:", len(X_test))


# ==========================================
# 14. TRAIN RANDOM FOREST
# ==========================================

print("\nTraining improved Random Forest model...")

model = RandomForestClassifier(
    n_estimators=150,
    max_depth=10,
    random_state=42,
    class_weight="balanced"
)

model.fit(X_train, y_train)


# ==========================================
# 15. EVALUATE MODEL
# ==========================================

y_pred = model.predict(X_test)

accuracy = accuracy_score(y_test, y_pred)

print(
    "\nImproved Model Accuracy:",
    round(accuracy * 100, 2),
    "%"
)

print("\nClassification Report:")

print(
    classification_report(
        y_test,
        y_pred,
        zero_division=0
    )
)


# ==========================================
# 16. FEATURE IMPORTANCE
# ==========================================

print("\nFeature Importance:")

for feature, importance in zip(
    features,
    model.feature_importances_
):
    print(f"{feature}: {importance:.4f}")


# ==========================================
# 17. SAVE TRAINED MODEL
# ==========================================

joblib.dump(model, MODEL_FILE)

print("\nTrained model saved successfully:")
print(MODEL_FILE)


# ==========================================
# 18. SAVE PREPROCESSING CONFIGURATION
# ==========================================

preprocessing_config = {
    "features": features,
    "traffic_mapping": traffic_mapping,
    "condition_mapping": condition_mapping,
    "status_mapping": status_mapping,
    "numeric_fill_values": numeric_fill_values.to_dict(),
    "categorical_score_fill_values": {
        column: float(roads[column].median())
        for column in categorical_score_columns
    },
    "distance_min": float(distance_min),
    "distance_max": float(distance_max),
    "time_min": float(time_min),
    "time_max": float(time_max),
    "risk_thresholds": {
        "Low": 25,
        "Medium": 50,
        "High": 75,
        "Critical": 100
    }
}

joblib.dump(preprocessing_config, CONFIG_FILE)

print("Preprocessing configuration saved:")
print(CONFIG_FILE)


# ==========================================
# 19. GENERATE PREDICTIONS FOR ALL ROADS
# ==========================================

# Use the trained model to predict all roads.
# Do not train on the test set again.
prediction_features = roads[features].copy()

roads["predicted_risk"] = model.predict(
    prediction_features
)

roads["prediction_confidence"] = (
    model.predict_proba(prediction_features)
    .max(axis=1)
)


# ==========================================
# 20. CREATE OUTPUT CSV
# ==========================================

# Keep the column names expected by the existing
# C++ RiskPredictionLoader.
risk_output = roads[
    [
        "id",
        "source",
        "destination",
        "predicted_risk",
        "prediction_confidence"
    ]
].copy()

risk_output.to_csv(
    PREDICTIONS_FILE,
    index=False
)


# ==========================================
# 21. DISPLAY AND VERIFY OUTPUT
# ==========================================

print("\nRisk predictions generated successfully.")

print("\nSample predictions:")
print(risk_output.head(10))

print("\nPredicted risk distribution:")
print(risk_output["predicted_risk"].value_counts())

print("\nTotal predictions:", len(risk_output))

print("\nSaved predictions to:")
print(PREDICTIONS_FILE)

if len(risk_output) != len(roads):
    raise RuntimeError(
        "Prediction count does not match road count."
    )

if risk_output[
    ["predicted_risk", "prediction_confidence"]
].isnull().any().any():
    raise RuntimeError(
        "Output contains missing prediction values."
    )

print("\n==========================================")
print("PHASE 6.5 COMPLETED SUCCESSFULLY")
print("==========================================")
print("1. Risk scoring completed")
print("2. Random Forest model trained")
print("3. Trained model saved")
print("4. Preprocessing configuration saved")
print("5. Risk predictions exported")
print("==========================================")
