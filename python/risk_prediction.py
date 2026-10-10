import pandas as pd

from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report


# ==========================================
# 1. LOAD DATA
# ==========================================

roads = pd.read_csv("data/roads.csv")
locations = pd.read_csv("data/locations.csv")

print("Roads loaded:", len(roads))
print("Locations loaded:", len(locations))


# ==========================================
# 2. NORMALIZE LOCATION IDs
# ==========================================

def normalize_location_id(location_id):
    location_id = str(location_id)

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


# ==========================================
# 3. VERIFY LOCATION IDs
# ==========================================

location_ids = set(locations["id"])

invalid_sources = roads[
    ~roads["source"].isin(location_ids)
]

invalid_destinations = roads[
    ~roads["destination"].isin(location_ids)
]

print("\nInvalid source IDs:", len(invalid_sources))
print(
    "Invalid destination IDs:",
    len(invalid_destinations)
)


# ==========================================
# 4. CONVERT CATEGORICAL VALUES
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
    "Severely Damaged": 3
}

status_mapping = {
    "Open": 0,
    "Closed": 1
}


roads["traffic_score"] = roads["traffic"].map(
    traffic_mapping
)

roads["condition_score"] = roads["road_condition"].map(
    condition_mapping
)

roads["status_score"] = roads["status"].map(
    status_mapping
)


# ==========================================
# 5. NORMALIZE DISTANCE
# ==========================================

distance_min = roads["distance"].min()
distance_max = roads["distance"].max()

roads["distance_score"] = (
    (roads["distance"] - distance_min)
    /
    (distance_max - distance_min)
) * 10


# ==========================================
# 6. NORMALIZE TRAVEL TIME
# ==========================================

time_min = roads["travel_time"].min()
time_max = roads["travel_time"].max()

roads["travel_time_score"] = (
    (roads["travel_time"] - time_min)
    /
    (time_max - time_min)
) * 10


# ==========================================
# 7. CALCULATE DISASTER RISK SCORE
# ==========================================

roads["disaster_risk_score"] = (

    roads["traffic_score"] / 3 * 20

    +

    roads["condition_score"] / 3 * 30

    +

    roads["status_score"] * 30

    +

    roads["travel_time_score"]

    +

    roads["distance_score"]
)


# ==========================================
# 8. CONVERT SCORE TO RISK CLASS
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
# 9. DISPLAY RISK RESULTS
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

print(
    roads["risk_class"].value_counts()
)


# ==========================================
# 10. PREPARE ML FEATURES
# ==========================================

features = [
    "distance",
    "travel_time",
    "traffic_score",
    "condition_score",
    "status_score"
]

X = roads[features]

y = roads["risk_class"]


# ==========================================
# 11. CHECK MISSING VALUES
# ==========================================

print("\nMissing values:")

print(
    X.isnull().sum()
)

print(
    "\nMissing target values:",
    y.isnull().sum()
)


# ==========================================
# 12. REMOVE INVALID ROWS
# ==========================================

dataset = X.copy()

dataset["risk_class"] = y

dataset = dataset.dropna()


X = dataset.drop(
    "risk_class",
    axis=1
)

y = dataset["risk_class"]


# ==========================================
# 13. TRAIN / TEST SPLIT
# ==========================================

X_train, X_test, y_train, y_test = train_test_split(

    X,
    y,

    test_size=0.2,

    random_state=42,

    stratify=y
)


print(
    "\nTraining samples:",
    len(X_train)
)

print(
    "Testing samples:",
    len(X_test)
)


# ==========================================
# 14. TRAIN RANDOM FOREST
# ==========================================

print("\nTraining improved Random Forest model...")


model = RandomForestClassifier(

    n_estimators=150,

    max_depth=10,

    random_state=42

)


model.fit(
    X_train,
    y_train
)


# ==========================================
# 15. PREDICTIONS
# ==========================================

y_pred = model.predict(
    X_test
)


# ==========================================
# 16. ACCURACY
# ==========================================

accuracy = accuracy_score(
    y_test,
    y_pred
)


print(
    "\nImproved Model Accuracy:",
    round(accuracy * 100, 2),
    "%"
)


# ==========================================
# 17. CLASSIFICATION REPORT
# ==========================================

print("\nClassification Report:")

print(
    classification_report(
        y_test,
        y_pred
    )
)


# ==========================================
# 18. FEATURE IMPORTANCE
# ==========================================

print("\nFeature Importance:")

for feature, importance in zip(

    X.columns,

    model.feature_importances_

):

    print(
        f"{feature}: {importance:.4f}"
    )


# ==========================================
# 19. PHASE 6.3 COMPLETE
# ==========================================

print(
    "\nPhase 6.3 risk scoring and improved ML model completed."
)


# ==========================================
# 20. GENERATE RISK PREDICTIONS
# ==========================================

roads["predicted_risk"] = model.predict(
    roads[features]
)



roads["prediction_confidence"] = (
    model.predict_proba(
        roads[features]
    ).max(axis=1)
)


# ==========================================
# 21. CREATE OUTPUT DATASET
# ==========================================

risk_output = roads[
    [
        "id",
        "source",
        "destination",
        "predicted_risk",
        "predicted_risk_score"
    ]
].copy()


# ==========================================
# 22. SAVE PREDICTIONS
# ==========================================

risk_output.to_csv(
    "data/risk_predictions.csv",
    index=False
)


print("\nRisk predictions generated.")

print(
    risk_output.head(10)
)

print(
    "\nRisk prediction distribution:"
)

print(
    risk_output["predicted_risk"].value_counts()
)

print(
    "\nSaved to: data/risk_predictions.csv"
)