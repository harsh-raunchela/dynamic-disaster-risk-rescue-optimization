import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder


# ==========================================
# 1. LOAD DATA
# ==========================================

roads = pd.read_csv("data/roads.csv")
locations = pd.read_csv("data/locations.csv")

print("Roads loaded:", len(roads))
print("Locations loaded:", len(locations))


# ==========================================
# 2. DISPLAY DATA
# ==========================================

print("\nRoad columns:")
print(roads.columns.tolist())

print("\nFirst 5 roads:")
print(roads.head())


# ==========================================
# 3. NORMALIZE LOCATION IDs
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
# 4. VERIFY LOCATION IDs
# ==========================================

location_ids = set(locations["id"])

invalid_sources = roads[
    ~roads["source"].isin(location_ids)
]

invalid_destinations = roads[
    ~roads["destination"].isin(location_ids)
]

print(
    "\nInvalid source IDs:",
    len(invalid_sources)
)

print(
    "Invalid destination IDs:",
    len(invalid_destinations)
)


# ==========================================
# 5. SELECT ML FEATURES
# ==========================================

features = [
    "distance",
    "travel_time",
    "traffic",
    "road_condition",
    "status"
]

target = "risk"


X = roads[features].copy()
y = roads[target].copy()


# ==========================================
# 6. ENCODE CATEGORICAL FEATURES
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

risk_mapping = {
    "Low": 0,
    "Medium": 1,
    "High": 2
}


X["traffic"] = X["traffic"].map(
    traffic_mapping
)

X["road_condition"] = X["road_condition"].map(
    condition_mapping
)

X["status"] = X["status"].map(
    status_mapping
)

y = y.map(risk_mapping)


# ==========================================
# 7. CHECK MISSING VALUES
# ==========================================

print("\nMissing values:")

print(X.isnull().sum())

print("\nMissing target values:")

print(y.isnull().sum())


# ==========================================
# 8. REMOVE INVALID ROWS
# ==========================================

dataset = X.copy()

dataset["risk"] = y

dataset = dataset.dropna()

print(
    "\nFinal ML dataset size:",
    len(dataset)
)


# ==========================================
# 9. SPLIT FEATURES AND TARGET
# ==========================================

X = dataset.drop(
    "risk",
    axis=1
)

y = dataset["risk"]


X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42,
    stratify=y
)


# ==========================================
# 10. DISPLAY RESULT
# ==========================================

print("\nTraining samples:", len(X_train))
print("Testing samples:", len(X_test))

print("\nFeature columns:")
print(X.columns.tolist())

print("\nRisk distribution:")
print(y.value_counts().sort_index())

print("\nPhase 6.1 preprocessing completed.")