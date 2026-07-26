import os
import joblib
import json
import sys
import pandas as pd
import numpy as np

def load_models():
    """
    Loads trained Isolation Forest and Random Forest Classifier models.
    """
    iso_model_path = os.path.join("models", "isolation_forest.pkl")
    iso_scaler_path = os.path.join("models", "iso_scaler.pkl")
    rf_model_path = os.path.join("models", "random_forest_classifier.pkl")
    encoder_path = os.path.join("models", "label_encoder.pkl")
    clf_scaler_path = os.path.join("models", "clf_scaler.pkl")

    if not (os.path.exists(iso_model_path) and os.path.exists(rf_model_path)):
        print("Error: Models not found. Run train_behavior_model.py and train_classifier.py first.")
        sys.exit(1)

    iso_model = joblib.load(iso_model_path)
    iso_scaler = joblib.load(iso_scaler_path)
    rf_model = joblib.load(rf_model_path)
    label_encoder = joblib.load(encoder_path)
    clf_scaler = joblib.load(clf_scaler_path)

    return iso_model, iso_scaler, rf_model, label_encoder, clf_scaler

def predict_anomaly(sample_event):
    """
    Runs dual-stage inference:
    1. Unsupervised Anomaly Scoring via Isolation Forest
    2. Multi-class Attack Taxonomy Classification via Random Forest
    """
    iso_model, iso_scaler, rf_model, label_encoder, clf_scaler = load_models()

    feature_cols = [
        'login_hour',
        'failed_attempts',
        'new_device',
        'country_changed',
        'travel_speed_kmph',
        'session_duration_min',
        'unique_resources'
    ]

    # Convert single event dict or list of dicts to DataFrame
    if isinstance(sample_event, dict):
        df = pd.DataFrame([sample_event])
    else:
        df = pd.DataFrame(sample_event)

    X = df[feature_cols]

    # 1. Isolation Forest Inference
    X_iso = iso_scaler.transform(X)
    iso_decision = iso_model.decision_function(X_iso) # Raw anomaly score (negative = anomalous)
    iso_pred = iso_model.predict(X_iso) # -1 for anomaly, 1 for normal

    # Convert raw score to 0 - 100 Risk Score scale
    raw_score = iso_decision[0]
    normalized_risk = max(0, min(100, int((0.2 - raw_score) * 200)))

    # 2. Random Forest Classification
    X_clf = clf_scaler.transform(X)
    rf_pred_idx = rf_model.predict(X_clf)[0]
    rf_probs = rf_model.predict_proba(X_clf)[0]
    predicted_attack_type = label_encoder.inverse_transform([rf_pred_idx])[0]

    confidence = float(np.max(rf_probs))

    output = {
        "is_anomaly": bool(iso_pred[0] == -1 or normalized_risk >= 35),
        "risk_score": normalized_risk,
        "isolation_forest_decision_score": float(raw_score),
        "predicted_attack_type": predicted_attack_type,
        "classification_confidence": round(confidence, 4),
        "risk_level": "Critical" if normalized_risk >= 80 else "High" if normalized_risk >= 60 else "Medium" if normalized_risk >= 35 else "Low"
    }

    return output

if __name__ == "__main__":
    # Test sample prediction
    sample_test_event = {
        'login_hour': 2,
        'failed_attempts': 8,
        'new_device': 1,
        'country_changed': 1,
        'travel_speed_kmph': 1250,
        'session_duration_min': 3,
        'unique_resources': 9
    }

    print("Executing Predict Inference Pipeline...")
    try:
        result = predict_anomaly(sample_test_event)
        print("\n--- Prediction Output ---")
        print(json.dumps(result, indent=2))
    except Exception as e:
        print(f"Prediction execution: {e}")
