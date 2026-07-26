"""
Model Training Script for AI-Powered Behavioral Anomaly Detection.

This script trains the Isolation Forest and XGBoost classifier models
and saves them to the saved_models/ directory.

Usage:
    python train_models.py [--data-path PATH_TO_DATASET]
"""

import os
import sys
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler
from xgboost import XGBClassifier

# Add the app module to path
sys.path.insert(0, str(Path(__file__).resolve().parent))
from app.ml_pipeline import FEATURE_COLUMNS, SENSITIVE_RESOURCES, engineer_features

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

RANDOM_STATE = 42
MODEL_DIR = Path(__file__).resolve().parent / "saved_models"
DEFAULT_DATA_PATH = Path(__file__).resolve().parent.parent / "behavior_anomaly_training_dataset.xlsx"


def train(data_path: str = None):
    """Train all models and save to disk."""
    data_path = Path(data_path) if data_path else DEFAULT_DATA_PATH

    if not data_path.exists():
        print(f"ERROR: Dataset not found at {data_path}")
        sys.exit(1)

    MODEL_DIR.mkdir(parents=True, exist_ok=True)

    # -----------------------------------------------------------------------
    # 1. Load Data
    # -----------------------------------------------------------------------
    print(f"Loading dataset from: {data_path}")
    df = pd.read_excel(data_path)
    print(f"  Shape: {df.shape}")
    print(f"  Attack rate: {df['label'].mean()*100:.2f}%")

    # -----------------------------------------------------------------------
    # 2. Feature Engineering
    # -----------------------------------------------------------------------
    print("\nApplying feature engineering...")
    df_fe = engineer_features(df)
    print(f"  Features: {FEATURE_COLUMNS}")

    # -----------------------------------------------------------------------
    # 3. Train/Test Split
    # -----------------------------------------------------------------------
    X = df_fe[FEATURE_COLUMNS]
    y = df_fe["label"]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, stratify=y, random_state=RANDOM_STATE
    )
    print(f"\n  Train: {X_train.shape}, attack rate = {y_train.mean()*100:.2f}%")
    print(f"  Test:  {X_test.shape}, attack rate = {y_test.mean()*100:.2f}%")

    # -----------------------------------------------------------------------
    # 4. Feature Scaling
    # -----------------------------------------------------------------------
    scaler = StandardScaler()
    X_train_scaled = pd.DataFrame(
        scaler.fit_transform(X_train), columns=FEATURE_COLUMNS, index=X_train.index
    )
    X_test_scaled = pd.DataFrame(
        scaler.transform(X_test), columns=FEATURE_COLUMNS, index=X_test.index
    )

    scaler_path = MODEL_DIR / "feature_scaler.pkl"
    joblib.dump(scaler, scaler_path)
    print(f"\n  Scaler saved to: {scaler_path}")

    # -----------------------------------------------------------------------
    # 5. Isolation Forest (trained on normal data only)
    # -----------------------------------------------------------------------
    print("\nTraining Isolation Forest...")
    contamination_rate = round(y.mean(), 4)
    normal_train = X_train_scaled[y_train == 0]

    iso_forest = IsolationForest(
        n_estimators=200,
        max_samples="auto",
        contamination=contamination_rate,
        random_state=RANDOM_STATE,
        n_jobs=-1,
    )
    iso_forest.fit(normal_train)

    iso_path = MODEL_DIR / "behavior_model.pkl"
    joblib.dump(iso_forest, iso_path)
    print(f"  Isolation Forest saved to: {iso_path}")
    print(f"  Trained on {len(normal_train)} normal-only samples")
    print(f"  Contamination threshold: {contamination_rate}")

    # Evaluate
    raw_pred = iso_forest.predict(X_test_scaled)
    y_pred_iso = np.where(raw_pred == -1, 1, 0)
    anomaly_score_test = -iso_forest.decision_function(X_test_scaled)

    from sklearn.metrics import precision_score, recall_score, f1_score, roc_auc_score
    print(f"\n  === Isolation Forest Test Performance ===")
    print(f"  Precision: {precision_score(y_test, y_pred_iso):.3f}")
    print(f"  Recall:    {recall_score(y_test, y_pred_iso):.3f}")
    print(f"  F1-score:  {f1_score(y_test, y_pred_iso):.3f}")
    print(f"  ROC AUC:   {roc_auc_score(y_test, anomaly_score_test):.3f}")

    # -----------------------------------------------------------------------
    # 6. XGBoost Attack Type Classifier (trained on attack data only)
    # -----------------------------------------------------------------------
    print("\nTraining XGBoost Attack Classifier...")
    attack_only = df_fe[df_fe["label"] == 1].copy()

    label_encoder = LabelEncoder()
    attack_only["attack_type_enc"] = label_encoder.fit_transform(attack_only["attack_type"])

    Xa = attack_only[FEATURE_COLUMNS]
    ya = attack_only["attack_type_enc"]

    Xa_train, Xa_test, ya_train, ya_test = train_test_split(
        Xa, ya, test_size=0.2, stratify=ya, random_state=RANDOM_STATE
    )

    Xa_train_scaled = pd.DataFrame(scaler.transform(Xa_train), columns=FEATURE_COLUMNS, index=Xa_train.index)
    Xa_test_scaled = pd.DataFrame(scaler.transform(Xa_test), columns=FEATURE_COLUMNS, index=Xa_test.index)

    clf = XGBClassifier(
        n_estimators=300,
        max_depth=4,
        learning_rate=0.05,
        subsample=0.8,
        colsample_bytree=0.8,
        objective="multi:softprob",
        num_class=len(label_encoder.classes_),
        eval_metric="mlogloss",
        random_state=RANDOM_STATE,
        n_jobs=-1,
    )
    clf.fit(Xa_train_scaled, ya_train)

    clf_path = MODEL_DIR / "attack_classifier.pkl"
    joblib.dump(clf, clf_path)
    print(f"  Classifier saved to: {clf_path}")

    encoder_path = MODEL_DIR / "attack_label_encoder.pkl"
    joblib.dump(label_encoder, encoder_path)
    print(f"  Label encoder saved to: {encoder_path}")
    print(f"  Classes: {list(label_encoder.classes_)}")

    # Evaluate
    from sklearn.metrics import accuracy_score
    ya_pred = clf.predict(Xa_test_scaled)
    acc = accuracy_score(ya_test, ya_pred)
    print(f"\n  === Attack Classifier Test Performance ===")
    print(f"  Accuracy: {acc:.3f}")

    print("\n✅ All models trained and saved successfully!")
    print(f"   Model directory: {MODEL_DIR}")


if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="Train anomaly detection models")
    parser.add_argument("--data-path", type=str, default=None, help="Path to training dataset")
    args = parser.parse_args()
    train(args.data_path)
