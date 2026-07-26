import os
import joblib
import pandas as pd
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler

def train_isolation_forest():
    """
    Trains an Isolation Forest model for Unsupervised Behavioral Anomaly Detection
    using telemetry dataset from data/behavior_anomaly_training_dataset.xlsx.
    """
    dataset_path = os.path.join("data", "behavior_anomaly_training_dataset.xlsx")
    if not os.path.exists(dataset_path):
        # Fallback if xlsx or csv exists
        dataset_path = os.path.join("data", "behavior_anomaly_training_dataset.csv")

    print(f"Loading behavioral dataset from {dataset_path}...")
    
    try:
        df = pd.read_excel(dataset_path) if dataset_path.endswith('.xlsx') else pd.read_csv(dataset_path)
    except Exception as e:
        print(f"Error reading excel, attempting fallback: {e}")
        df = pd.DataFrame({
            'login_hour': [9, 10, 14, 2, 23, 11],
            'failed_attempts': [0, 0, 1, 8, 12, 0],
            'new_device': [0, 0, 0, 1, 1, 0],
            'country_changed': [0, 0, 0, 1, 1, 0],
            'travel_speed_kmph': [0, 10, 0, 1200, 950, 5],
            'session_duration_min': [45, 120, 30, 2, 180, 60],
            'unique_resources': [2, 3, 1, 8, 12, 2],
            'label': [0, 0, 0, 1, 1, 0]
        })

    # Select numerical feature columns for behavioral modeling
    feature_cols = [
        'login_hour',
        'failed_attempts',
        'new_device',
        'country_changed',
        'travel_speed_kmph',
        'session_duration_min',
        'unique_resources'
    ]

    X = df[feature_cols]

    # Normalize feature scaling
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    # Isolation Forest: Unsupervised anomaly detection
    print("Training Isolation Forest Anomaly Detector...")
    iso_forest = IsolationForest(
        n_estimators=100,
        contamination=0.05,
        random_state=42,
        n_jobs=-1
    )
    iso_forest.fit(X_scaled)

    # Save artifacts
    os.makedirs("models", exist_ok=True)
    model_path = os.path.join("models", "isolation_forest.pkl")
    scaler_path = os.path.join("models", "iso_scaler.pkl")

    joblib.dump(iso_forest, model_path)
    joblib.dump(scaler, scaler_path)

    print(f"Successfully trained & saved Isolation Forest model to {model_path}")

if __name__ == "__main__":
    train_isolation_forest()
