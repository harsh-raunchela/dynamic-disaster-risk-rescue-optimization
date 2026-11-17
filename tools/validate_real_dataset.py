#!/usr/bin/env python3
"""
DisasterX - Real Dataset Validation Script (Phase 1)
Validates the real Dehradun dataset in data/real/ against schema, relational integrity,
geometry accuracy, ML feature compatibility, and emergency/resource mappings.
"""

import os
import sys
import json
import math
import pandas as pd
from collections import Counter, defaultdict

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_REAL_DIR = os.path.join(PROJECT_ROOT, "data", "real")

EXPECTED_FILES = [
    "DATA_SOURCES.txt",
    "locations.csv",
    "roads.csv",
    "road_features.csv",
    "risk_predictions.csv",
    "road_geometry.json",
    "emergencies.csv",
    "resources.csv",
    "model_report.json"
]

EXPECTED_COUNTS = {
    "locations.csv": 1086,
    "roads.csv": 2362,
    "road_features.csv": 2362,
    "risk_predictions.csv": 2362,
    "road_geometry.json": 2362,
    "emergencies.csv": 150,
    "resources.csv": 236
}

# Dehradun bounding box from DATA_SOURCES.txt: (W=77.95, S=29.9, E=78.35, N=30.5)
BBOX_LAT_MIN = 29.85
BBOX_LAT_MAX = 30.55
BBOX_LON_MIN = 77.90
BBOX_LON_MAX = 78.40

def haversine_km(lat1, lon1, lat2, lon2):
    R = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2.0) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(dlon / 2.0) ** 2)
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return R * c

def run_validation():
    print("=" * 80)
    print("DISASTERX REAL DATASET VALIDATION (DEHRADUN) - PHASE 1")
    print(f"Directory: {DATA_REAL_DIR}")
    print("=" * 80)

    report = {
        "files_located": {},
        "record_counts": {},
        "locations_validation": {},
        "roads_validation": {},
        "network_topology": {},
        "road_features_validation": {},
        "risk_predictions_validation": {},
        "geometry_validation": {},
        "emergencies_validation": {},
        "resources_validation": {},
        "ml_feature_compatibility": {},
        "errors": [],
        "warnings": []
    }

    # 1. Check file existence
    print("\n[1/8] Verifying File Existence...")
    all_files_exist = True
    for fname in EXPECTED_FILES:
        fpath = os.path.join(DATA_REAL_DIR, fname)
        exists = os.path.isfile(fpath)
        size = os.path.getsize(fpath) if exists else 0
        report["files_located"][fname] = {
            "exists": exists,
            "size_bytes": size,
            "path": fpath
        }
        status = "FOUND" if exists else "MISSING"
        print(f"  - {fname:<22}: {status} ({size:,} bytes)")
        if not exists:
            all_files_exist = False
            report["errors"].append(f"Missing required file: {fname}")

    if not all_files_exist:
        print("\nFATAL: Some required files are missing in data/real. Stopping.")
        return report

    # 2. Record counts
    print("\n[2/8] Checking Record Counts vs Expected...")
    df_locs = pd.read_csv(os.path.join(DATA_REAL_DIR, "locations.csv"))
    df_roads = pd.read_csv(os.path.join(DATA_REAL_DIR, "roads.csv"))
    df_feats = pd.read_csv(os.path.join(DATA_REAL_DIR, "road_features.csv"))
    df_preds = pd.read_csv(os.path.join(DATA_REAL_DIR, "risk_predictions.csv"))
    df_emg = pd.read_csv(os.path.join(DATA_REAL_DIR, "emergencies.csv"))
    df_res = pd.read_csv(os.path.join(DATA_REAL_DIR, "resources.csv"))
    with open(os.path.join(DATA_REAL_DIR, "road_geometry.json"), "r", encoding="utf-8") as f:
        geom_data = json.load(f)

    actual_counts = {
        "locations.csv": len(df_locs),
        "roads.csv": len(df_roads),
        "road_features.csv": len(df_feats),
        "risk_predictions.csv": len(df_preds),
        "road_geometry.json": len(geom_data),
        "emergencies.csv": len(df_emg),
        "resources.csv": len(df_res)
    }

    for fname, exp in EXPECTED_COUNTS.items():
        act = actual_counts[fname]
        matches = (act == exp)
        report["record_counts"][fname] = {
            "expected": exp,
            "actual": act,
            "matches": matches
        }
        match_str = "MATCH" if matches else f"MISMATCH (diff {act - exp:+d})"
        print(f"  - {fname:<22}: Expected {exp:>5}, Actual {act:>5} -> {match_str}")
        if not matches:
            report["warnings"].append(f"{fname} count mismatch: expected {exp}, got {act}")

    # 3. Locations Validation
    print("\n[3/8] Validating Locations...")
    loc_cols = list(df_locs.columns)
    exp_loc_cols = ["id", "name", "type", "latitude", "longitude", "capacity"]
    loc_cols_ok = (loc_cols == exp_loc_cols)
    print(f"  - Columns: {loc_cols} (Matches expected schema: {loc_cols_ok})")
    
    loc_id_set = set(df_locs["id"])
    loc_id_dups = df_locs["id"].duplicated().sum()
    loc_nulls = df_locs.isnull().sum().to_dict()
    
    lat_min, lat_max = df_locs["latitude"].min(), df_locs["latitude"].max()
    lon_min, lon_max = df_locs["longitude"].min(), df_locs["longitude"].max()
    lat_in_bounds = (lat_min >= BBOX_LAT_MIN and lat_max <= BBOX_LAT_MAX)
    lon_in_bounds = (lon_min >= BBOX_LON_MIN and lon_max <= BBOX_LON_MAX)
    
    type_counts = df_locs["type"].value_counts().to_dict()
    cap_min, cap_max = df_locs["capacity"].min(), df_locs["capacity"].max()
    
    report["locations_validation"] = {
        "columns_match": loc_cols_ok,
        "duplicate_ids": int(loc_id_dups),
        "null_counts": loc_nulls,
        "lat_range": [float(lat_min), float(lat_max)],
        "lon_range": [float(lon_min), float(lon_max)],
        "lat_in_bounds": lat_in_bounds,
        "lon_in_bounds": lon_in_bounds,
        "type_distribution": type_counts,
        "capacity_range": [int(cap_min), int(cap_max)]
    }
    
    print(f"  - Unique IDs: {len(loc_id_set)} / {len(df_locs)} (Duplicates: {loc_id_dups})")
    print(f"  - Latitude: [{lat_min:.6f}, {lat_max:.6f}] (Dehradun bbox ok: {lat_in_bounds})")
    print(f"  - Longitude: [{lon_min:.6f}, {lon_max:.6f}] (Dehradun bbox ok: {lon_in_bounds})")
    print(f"  - Types: {type_counts}")
    print(f"  - Capacity range: [{cap_min}, {cap_max}], any negative: {(df_locs['capacity'] < 0).any()}")

    if loc_id_dups > 0:
        report["errors"].append(f"Found {loc_id_dups} duplicate location IDs in locations.csv")
    if any(loc_nulls.values()):
        report["errors"].append(f"Found null values in locations.csv: {loc_nulls}")

    # 4. Roads Validation
    print("\n[4/8] Validating Roads & Network Topology...")
    road_cols = list(df_roads.columns)
    exp_road_cols = ["id", "source", "destination", "distance", "travel_time", "risk", "traffic", "road_condition", "status"]
    road_cols_ok = (road_cols == exp_road_cols)
    print(f"  - Columns: {road_cols} (Matches expected schema: {road_cols_ok})")

    road_id_set = set(df_roads["id"])
    road_id_dups = df_roads["id"].duplicated().sum()
    road_nulls = df_roads.isnull().sum().to_dict()

    # Foreign key checks
    invalid_sources = df_roads[~df_roads["source"].isin(loc_id_set)]
    invalid_dests = df_roads[~df_roads["destination"].isin(loc_id_set)]
    self_loops = df_roads[df_roads["source"] == df_roads["destination"]]

    # Value ranges and categories
    valid_risks = {"Low", "Medium", "High", "Critical"}
    valid_traffics = {"Low", "Medium", "High", "Severe"}
    valid_conditions = {"Good", "Fair", "Poor", "Damaged", "Severely Damaged"}
    valid_statuses = {"Open", "Closed", "Restricted"}

    risk_counts = df_roads["risk"].value_counts().to_dict()
    traffic_counts = df_roads["traffic"].value_counts().to_dict()
    condition_counts = df_roads["road_condition"].value_counts().to_dict()
    status_counts = df_roads["status"].value_counts().to_dict()

    invalid_risk_rows = df_roads[~df_roads["risk"].isin(valid_risks)]
    invalid_traffic_rows = df_roads[~df_roads["traffic"].isin(valid_traffics)]
    invalid_condition_rows = df_roads[~df_roads["road_condition"].isin(valid_conditions)]
    invalid_status_rows = df_roads[~df_roads["status"].isin(valid_statuses)]

    dist_min, dist_max = df_roads["distance"].min(), df_roads["distance"].max()
    time_min, time_max = df_roads["travel_time"].min(), df_roads["travel_time"].max()

    # Connected locations vs isolated locations
    connected_locs = set(df_roads["source"]).union(set(df_roads["destination"]))
    isolated_locs = loc_id_set - connected_locs

    # Bidirectional edges check
    edge_pairs = set(zip(df_roads["source"], df_roads["destination"]))
    bidirectional_count = 0
    for u, v in edge_pairs:
        if (v, u) in edge_pairs:
            bidirectional_count += 1
    # Each undirected road represented in both directions gives 2 directed pairs
    is_fully_bidirectional = (bidirectional_count == len(edge_pairs))

    # In/out degrees
    in_degree = Counter(df_roads["destination"])
    out_degree = Counter(df_roads["source"])
    total_degree = defaultdict(int)
    for u, v in zip(df_roads["source"], df_roads["destination"]):
        total_degree[u] += 1
        total_degree[v] += 1

    deg_vals = list(total_degree.values())
    avg_deg = sum(deg_vals) / len(deg_vals) if deg_vals else 0
    max_deg = max(deg_vals) if deg_vals else 0
    min_deg = min(deg_vals) if deg_vals else 0

    print(f"  - Unique Road IDs: {len(road_id_set)} / {len(df_roads)} (Duplicates: {road_id_dups})")
    print(f"  - Missing Source Foreign Keys: {len(invalid_sources)}")
    print(f"  - Missing Destination Foreign Keys: {len(invalid_dests)}")
    print(f"  - Self-loops (source == dest): {len(self_loops)}")
    print(f"  - Isolated Locations (degree 0): {len(isolated_locs)}")
    print(f"  - Directed Pairs: {len(edge_pairs)}, Bidirectional symmetric edges: {bidirectional_count} ({bidirectional_count/len(edge_pairs)*100:.1f}%)")
    print(f"  - Degree stats: min={min_deg}, avg={avg_deg:.2f}, max={max_deg}")
    print(f"  - Distance: [{dist_min:.3f}, {dist_max:.3f}] km (any <= 0: {(df_roads['distance'] <= 0).any()})")
    print(f"  - Travel Time: [{time_min:.2f}, {time_max:.2f}] min (any <= 0: {(df_roads['travel_time'] <= 0).any()})")
    print(f"  - Risk distribution: {risk_counts}")
    print(f"  - Traffic distribution: {traffic_counts}")
    print(f"  - Condition distribution: {condition_counts}")
    print(f"  - Status distribution: {status_counts}")

    report["roads_validation"] = {
        "columns_match": road_cols_ok,
        "duplicate_ids": int(road_id_dups),
        "null_counts": road_nulls,
        "invalid_source_count": len(invalid_sources),
        "invalid_destination_count": len(invalid_dests),
        "self_loop_count": len(self_loops),
        "distance_range": [float(dist_min), float(dist_max)],
        "travel_time_range": [float(time_min), float(time_max)],
        "risk_distribution": risk_counts,
        "traffic_distribution": traffic_counts,
        "condition_distribution": condition_counts,
        "status_distribution": status_counts,
        "invalid_risk_count": len(invalid_risk_rows),
        "invalid_traffic_count": len(invalid_traffic_rows),
        "invalid_condition_count": len(invalid_condition_rows),
        "invalid_status_count": len(invalid_status_rows)
    }

    report["network_topology"] = {
        "total_nodes_in_file": len(loc_id_set),
        "connected_nodes": len(connected_locs),
        "isolated_nodes": len(isolated_locs),
        "isolated_node_ids": sorted(list(isolated_locs)),
        "total_directed_edges": len(df_roads),
        "bidirectional_directed_edges": bidirectional_count,
        "bidirectional_percentage": float(bidirectional_count / len(edge_pairs) * 100) if edge_pairs else 0,
        "average_node_degree": float(avg_deg),
        "max_node_degree": int(max_deg)
    }

    if road_id_dups > 0:
        report["errors"].append(f"Found {road_id_dups} duplicate road IDs in roads.csv")
    if len(invalid_sources) > 0:
        report["errors"].append(f"{len(invalid_sources)} roads have unknown source location ID")
    if len(invalid_dests) > 0:
        report["errors"].append(f"{len(invalid_dests)} roads have unknown destination location ID")
    if len(invalid_risk_rows) > 0:
        report["errors"].append(f"{len(invalid_risk_rows)} roads have invalid risk value")

    # 5. Road Features & Risk Predictions Integrity
    print("\n[5/8] Validating Road Features & Risk Predictions Matching...")
    feat_id_set = set(df_feats["id"])
    pred_id_set = set(df_preds["id"])

    feats_roads_diff = feat_id_set.symmetric_difference(road_id_set)
    preds_roads_diff = pred_id_set.symmetric_difference(road_id_set)

    print(f"  - Road Features ID match with Roads: {len(feats_roads_diff) == 0} (diff: {len(feats_roads_diff)})")
    print(f"  - Risk Predictions ID match with Roads: {len(preds_roads_diff) == 0} (diff: {len(preds_roads_diff)})")

    # Check predictions source/destination consistency with roads.csv
    merged_preds = pd.merge(df_roads[["id", "source", "destination"]], df_preds, on="id", suffixes=("_road", "_pred"))
    src_mismatch = (merged_preds["source_road"] != merged_preds["source_pred"]).sum()
    dst_mismatch = (merged_preds["destination_road"] != merged_preds["destination_pred"]).sum()
    print(f"  - Predictions Source Location Mismatch: {src_mismatch}")
    print(f"  - Predictions Destination Location Mismatch: {dst_mismatch}")

    pred_risk_counts = df_preds["predicted_risk"].value_counts().to_dict()
    conf_min, conf_max = df_preds["prediction_confidence"].min(), df_preds["prediction_confidence"].max()
    conf_nulls = df_preds["prediction_confidence"].isnull().sum()
    print(f"  - Predicted Risk Distribution: {pred_risk_counts}")
    print(f"  - Confidence range: [{conf_min:.4f}, {conf_max:.4f}], nulls: {conf_nulls}")

    # Check road features
    feat_cols = list(df_feats.columns)
    hazard_min, hazard_max = df_feats["hazard_index"].min(), df_feats["hazard_index"].max()
    print(f"  - Road features columns: {feat_cols}")
    print(f"  - Hazard index range: [{hazard_min:.4f}, {hazard_max:.4f}]")

    report["road_features_validation"] = {
        "columns": feat_cols,
        "id_match_roads": len(feats_roads_diff) == 0,
        "mismatched_id_count": len(feats_roads_diff),
        "hazard_index_range": [float(hazard_min), float(hazard_max)],
        "null_counts": df_feats.isnull().sum().to_dict(),
        "risk_distribution": df_feats["risk"].value_counts().to_dict(),
        "ml_risk_distribution": df_feats["ml_risk"].value_counts().to_dict()
    }

    report["risk_predictions_validation"] = {
        "id_match_roads": len(preds_roads_diff) == 0,
        "mismatched_id_count": len(preds_roads_diff),
        "source_dest_match": int(src_mismatch) == 0 and int(dst_mismatch) == 0,
        "predicted_risk_distribution": pred_risk_counts,
        "confidence_range": [float(conf_min), float(conf_max)],
        "confidence_nulls": int(conf_nulls)
    }

    # 6. Geometry Validation
    print("\n[6/8] Validating Road Geometry (road_geometry.json)...")
    geom_id_set = set(geom_data.keys())
    geom_roads_diff = geom_id_set.symmetric_difference(road_id_set)
    print(f"  - Total geometry entries: {len(geom_data)}")
    print(f"  - Geometry ID match with Roads: {len(geom_roads_diff) == 0} (diff: {len(geom_roads_diff)})")

    # Point counts & coordinate validation
    loc_lookup = df_locs.set_index("id")[["latitude", "longitude"]].to_dict("index")
    road_lookup = df_roads.set_index("id")[["source", "destination"]].to_dict("index")

    pt_counts = []
    all_lats, all_lons = [], []
    invalid_coords = 0
    start_point_dist_km = []
    end_point_dist_km = []

    for rid, coords in geom_data.items():
        pt_counts.append(len(coords))
        if len(coords) < 2:
            report["warnings"].append(f"Road {rid} geometry has fewer than 2 points: {len(coords)}")
        for pt in coords:
            if not isinstance(pt, list) or len(pt) != 2:
                invalid_coords += 1
                continue
            lat, lon = pt[0], pt[1]
            all_lats.append(lat)
            all_lons.append(lon)
            if not (BBOX_LAT_MIN <= lat <= BBOX_LAT_MAX and BBOX_LON_MIN <= lon <= BBOX_LON_MAX):
                invalid_coords += 1

        # Check endpoints alignment with source/destination locations
        if rid in road_lookup and len(coords) >= 2:
            src_id = road_lookup[rid]["source"]
            dst_id = road_lookup[rid]["destination"]
            if src_id in loc_lookup and dst_id in loc_lookup:
                src_lat, src_lon = loc_lookup[src_id]["latitude"], loc_lookup[src_id]["longitude"]
                dst_lat, dst_lon = loc_lookup[dst_id]["latitude"], loc_lookup[dst_id]["longitude"]

                pt_start = coords[0]
                pt_end = coords[-1]

                # Check normal alignment: start ~ src, end ~ dst
                d_start = haversine_km(pt_start[0], pt_start[1], src_lat, src_lon)
                d_end = haversine_km(pt_end[0], pt_end[1], dst_lat, dst_lon)
                start_point_dist_km.append(d_start)
                end_point_dist_km.append(d_end)

    min_pts = min(pt_counts)
    max_pts = max(pt_counts)
    avg_pts = sum(pt_counts) / len(pt_counts)
    g_lat_min, g_lat_max = min(all_lats), max(all_lats)
    g_lon_min, g_lon_max = min(all_lons), max(all_lons)
    max_start_dist_km = max(start_point_dist_km) if start_point_dist_km else 0
    avg_start_dist_km = sum(start_point_dist_km)/len(start_point_dist_km) if start_point_dist_km else 0
    max_end_dist_km = max(end_point_dist_km) if end_point_dist_km else 0
    avg_end_dist_km = sum(end_point_dist_km)/len(end_point_dist_km) if end_point_dist_km else 0

    print(f"  - Points per road: min={min_pts}, avg={avg_pts:.1f}, max={max_pts}")
    print(f"  - Coordinate Ordering: [latitude, longitude] format (Leaflet L.polyline native)")
    print(f"  - Coordinates Range: Lat [{g_lat_min:.6f}, {g_lat_max:.6f}], Lon [{g_lon_min:.6f}, {g_lon_max:.6f}]")
    print(f"  - Coordinates inside Dehradun Bounding Box: {invalid_coords == 0} (out-of-bounds points: {invalid_coords})")
    print(f"  - Start point distance to Source location: avg={avg_start_dist_km*1000:.1f} meters, max={max_start_dist_km*1000:.1f} meters")
    print(f"  - End point distance to Destination location: avg={avg_end_dist_km*1000:.1f} meters, max={max_end_dist_km*1000:.1f} meters")

    report["geometry_validation"] = {
        "total_roads_in_geometry": len(geom_data),
        "id_match_roads": len(geom_roads_diff) == 0,
        "mismatched_id_count": len(geom_roads_diff),
        "coordinate_ordering": "[latitude, longitude] (Leaflet native)",
        "points_per_road": {
            "min": int(min_pts),
            "avg": float(avg_pts),
            "max": int(max_pts)
        },
        "lat_range": [float(g_lat_min), float(g_lat_max)],
        "lon_range": [float(g_lon_min), float(g_lon_max)],
        "out_of_bounds_points": int(invalid_coords),
        "endpoint_accuracy_meters": {
            "avg_start_offset_m": float(avg_start_dist_km * 1000),
            "max_start_offset_m": float(max_start_dist_km * 1000),
            "avg_end_offset_m": float(avg_end_dist_km * 1000),
            "max_end_offset_m": float(max_end_dist_km * 1000)
        }
    }

    # 7. Emergencies and Resources Validation
    print("\n[7/8] Validating Simulated Operational Data (Emergencies & Resources)...")
    emg_loc_matches = df_emg["location_id"].isin(loc_id_set)
    emg_valid_count = emg_loc_matches.sum()
    emg_invalid_count = (~emg_loc_matches).sum()
    emg_invalid_ids = sorted(df_emg.loc[~emg_loc_matches, "location_id"].unique().tolist())

    res_loc_matches = df_res["location_id"].isin(loc_id_set)
    res_valid_count = res_loc_matches.sum()
    res_invalid_count = (~res_loc_matches).sum()
    res_invalid_ids = sorted(df_res.loc[~res_loc_matches, "location_id"].unique().tolist())

    print(f"  - Emergencies Total: {len(df_emg)}")
    print(f"    * Valid Location IDs (exist in real locations): {emg_valid_count} / {len(df_emg)} ({emg_valid_count/len(df_emg)*100:.1f}%)")
    print(f"    * Invalid Location IDs: {emg_invalid_count} (Unique missing IDs: {len(emg_invalid_ids)})")
    if emg_invalid_ids:
        print(f"      Missing emergency location sample: {emg_invalid_ids[:10]}...")

    print(f"  - Resources Total: {len(df_res)}")
    print(f"    * Valid Location IDs (exist in real locations): {res_valid_count} / {len(df_res)} ({res_valid_count/len(df_res)*100:.1f}%)")
    print(f"    * Invalid Location IDs: {res_invalid_count} (Unique missing IDs: {len(res_invalid_ids)})")
    if res_invalid_ids:
        print(f"      Missing resource location sample: {res_invalid_ids[:10]}...")

    # Check severities, capabilities, types
    emg_severities = df_emg["severity"].value_counts().to_dict()
    res_types = df_res["type"].value_counts().to_dict()
    res_avail = df_res["availability"].value_counts().to_dict()
    print(f"  - Emergency severities: {emg_severities}")
    print(f"  - Resource types: {res_types}")
    print(f"  - Resource availability: {res_avail}")

    report["emergencies_validation"] = {
        "total_records": len(df_emg),
        "valid_location_count": int(emg_valid_count),
        "invalid_location_count": int(emg_invalid_count),
        "invalid_location_ids": emg_invalid_ids,
        "severities": emg_severities,
        "people_affected_range": [int(df_emg["people_affected"].min()), int(df_emg["people_affected"].max())]
    }

    report["resources_validation"] = {
        "total_records": len(df_res),
        "valid_location_count": int(res_valid_count),
        "invalid_location_count": int(res_invalid_count),
        "invalid_location_ids": res_invalid_ids,
        "types": res_types,
        "availability": res_avail
    }

    # 8. ML Feature Compatibility Analysis
    print("\n[8/8] Analyzing ML Feature Compatibility...")
    with open(os.path.join(DATA_REAL_DIR, "model_report.json"), "r", encoding="utf-8") as f:
        model_report = json.load(f)

    report_features = list(model_report.get("feature_importance", {}).keys())
    csv_features = list(df_feats.columns)

    print(f"  - Features in model_report.json (13 features):")
    for feat, imp in model_report.get("feature_importance", {}).items():
        in_csv = "YES" if feat in csv_features else "NO (in engineering pipeline)"
        print(f"    * {feat:<20}: importance={imp:.4f} | Present in road_features.csv: {in_csv}")

    missing_in_csv = [f for f in report_features if f not in csv_features]
    print(f"\n  - Summary of features in model_report.json but not in road_features.csv:")
    print(f"    {missing_in_csv}")

    report["ml_feature_compatibility"] = {
        "model_report_features": report_features,
        "road_features_csv_columns": csv_features,
        "features_missing_in_road_features_csv": missing_in_csv,
        "model_metrics": model_report.get("metrics", {}),
        "model_risk_distribution": model_report.get("risk_distribution", {})
    }

    # Final summary
    print("\n" + "=" * 80)
    print("VALIDATION SUMMARY")
    print("=" * 80)
    print(f"Total Errors  : {len(report['errors'])}")
    print(f"Total Warnings: {len(report['warnings'])}")
    if report["errors"]:
        print("Errors:")
        for err in report["errors"]:
            print(f"  [ERROR] {err}")
    if report["warnings"]:
        print("Warnings:")
        for warn in report["warnings"]:
            print(f"  [WARN]  {warn}")

    def json_serializer(obj):
        if hasattr(obj, "item"):
            return obj.item()
        if hasattr(obj, "isoformat"):
            return obj.isoformat()
        return str(obj)

    out_json = os.path.join(PROJECT_ROOT, "tools", "real_dataset_validation_report.json")
    with open(out_json, "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2, default=json_serializer)
    print(f"\nSaved structured validation report to: {out_json}")
    print("=" * 80)

    return report

if __name__ == "__main__":
    run_validation()
