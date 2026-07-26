"""
ML Pipeline for AI-Powered Behavioral Anomaly Detection.

This module encapsulates the full inference pipeline:
  Raw Event → Feature Engineering → Isolation Forest → XGBoost Classifier → Risk Score + Reasons

It loads pre-trained models (Isolation Forest, XGBoost, StandardScaler, LabelEncoder)
and provides a predict_event() function that produces SOC-style alert JSON.
"""

import json
import os
from pathlib import Path

import joblib
import numpy as np
import pandas as pd

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

SENSITIVE_RESOURCES = {"Payroll", "Finance Portal"}

FEATURE_COLUMNS = [
    "login_hour",
    "failed_attempts",
    "new_device",
    "country_changed",
    "travel_speed_kmph",
    "session_duration_min",
    "unique_resources",
    "is_off_hours",
    "sensitive_resource_access",
]

MODEL_DIR = Path(os.environ.get("MODEL_DIR", str(Path(__file__).resolve().parent.parent / "saved_models")))

# ---------------------------------------------------------------------------
# Feature Engineering (mirrors the notebook logic exactly)
# ---------------------------------------------------------------------------


def engineer_features(raw_df: pd.DataFrame) -> pd.DataFrame:
    """Apply feature engineering to a raw events dataframe.

    This is the SINGLE source of truth for feature logic, used identically
    at training time and at inference time to avoid train/serve skew.
    """
    out = raw_df.copy()

    if "attack_type" in out.columns:
        out["attack_type"] = out["attack_type"].fillna("Normal")

    # Off-hours flag: midnight–5 AM
    out["is_off_hours"] = out["login_hour"].apply(lambda h: 1 if h < 5 else 0)

    # Sensitive resource access flag
    out["sensitive_resource_access"] = out["resource"].apply(
        lambda r: 1 if r in SENSITIVE_RESOURCES else 0
    )

    cols = FEATURE_COLUMNS + (["attack_type", "label"] if "label" in out.columns else [])
    return out[[c for c in cols if c in out.columns]]


# ---------------------------------------------------------------------------
# Risk Score Engine
# ---------------------------------------------------------------------------


def compute_risk_score(
    anomaly_score_raw: float,
    confidence: float,
    feature_row: dict,
) -> tuple:
    """Combine model outputs and raw signals into a 0–100 enterprise risk score.

    Returns
    -------
    tuple(int, list[str])
        (risk_score clipped to [0, 100], list of human-readable reasons)
    """
    reasons: list[str] = []
    score = 0.0

    # 1) Isolation Forest severity
    severity = float(np.clip((anomaly_score_raw + 0.1) / 0.4, 0, 1))
    score += severity * 35
    if severity > 0.5:
        reasons.append("Strong behavioral deviation from normal baseline")

    # 2) Classifier confidence
    score += confidence * 25
    if confidence > 0.7:
        reasons.append(f"High classifier confidence ({confidence:.0%})")

    # 3) Failed attempts
    fa = min(feature_row.get("failed_attempts", 0), 10) / 10
    score += fa * 15
    if feature_row.get("failed_attempts", 0) >= 3:
        reasons.append(f"{feature_row['failed_attempts']} failed login attempts")

    # 4) New device + country changed
    if feature_row.get("new_device", 0):
        score += 7.5
        reasons.append("Login from a new/unrecognized device")
    if feature_row.get("country_changed", 0):
        score += 7.5
        reasons.append("Country changed since last session")

    # 5) Travel speed
    if feature_row.get("travel_speed_kmph", 0) > 800:
        score += 5
        reasons.append(f"Travel speed physically implausible ({feature_row['travel_speed_kmph']} km/h)")

    # 6) Sensitive resource access
    if feature_row.get("sensitive_resource_access", 0):
        score += 5
        reasons.append("Accessed a sensitive resource (Payroll/Finance)")

    return int(np.clip(round(score), 0, 100)), reasons


# ---------------------------------------------------------------------------
# Model Loading
# ---------------------------------------------------------------------------

_models_cache: dict = {}


def _load_models():
    """Load pre-trained models into memory (cached)."""
    if _models_cache:
        return _models_cache

    iso_path = MODEL_DIR / "behavior_model.pkl"
    clf_path = MODEL_DIR / "attack_classifier.pkl"
    scaler_path = MODEL_DIR / "feature_scaler.pkl"
    encoder_path = MODEL_DIR / "attack_label_encoder.pkl"

    for p in [iso_path, clf_path, scaler_path, encoder_path]:
        if not p.exists():
            raise FileNotFoundError(
                f"Model file not found: {p}. "
                "Please run the training notebook or train_models.py first."
            )

    _models_cache["iso_forest"] = joblib.load(iso_path)
    _models_cache["classifier"] = joblib.load(clf_path)
    _models_cache["scaler"] = joblib.load(scaler_path)
    _models_cache["label_encoder"] = joblib.load(encoder_path)

    return _models_cache


# ---------------------------------------------------------------------------
# Inference Entry-point
# ---------------------------------------------------------------------------


def predict_event(raw_event: dict) -> dict:
    """Run a single raw login event through the full detection pipeline.

    Parameters
    ----------
    raw_event : dict
        Raw event fields: login_hour, failed_attempts, new_device, country_changed,
        travel_speed_kmph, session_duration_min, unique_resources, resource.

    Returns
    -------
    dict
        SOC-style alert: prediction, risk_score, confidence, reasons, is_anomaly.
    """
    models = _load_models()
    iso_forest = models["iso_forest"]
    classifier = models["classifier"]
    scaler = models["scaler"]
    label_encoder = models["label_encoder"]

    # Feature engineering
    raw_df = pd.DataFrame([raw_event])
    fe = engineer_features(raw_df)[FEATURE_COLUMNS]
    fe_scaled = pd.DataFrame(scaler.transform(fe), columns=FEATURE_COLUMNS)

    # Stage 1: Isolation Forest
    anomaly_flag = iso_forest.predict(fe_scaled)[0]  # -1 = anomaly
    anomaly_score_raw = float(-iso_forest.decision_function(fe_scaled)[0])
    is_anomaly = anomaly_flag == -1

    feature_row = fe.iloc[0].to_dict()

    if not is_anomaly:
        risk_score, reasons = compute_risk_score(anomaly_score_raw, 0.0, feature_row)
        return {
            "prediction": "Normal",
            "is_anomaly": False,
            "risk_score": risk_score,
            "confidence": None,
            "reasons": reasons if reasons else ["No significant deviation from baseline behavior"],
        }

    # Stage 2: Attack type classification
    probs = classifier.predict_proba(fe_scaled)[0]
    top_idx = int(np.argmax(probs))
    attack_type = label_encoder.inverse_transform([top_idx])[0]
    confidence = float(probs[top_idx])

    risk_score, reasons = compute_risk_score(anomaly_score_raw, confidence, feature_row)

    return {
        "prediction": attack_type,
        "is_anomaly": True,
        "risk_score": risk_score,
        "confidence": round(confidence, 2),
        "reasons": reasons,
    }
