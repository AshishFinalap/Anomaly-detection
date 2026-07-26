import os
import joblib
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report

def train_classifier():
    """
    Trains a Random Forest Classifier for Attack Taxonomy Multi-class Classification
    (e.g., None, Impossible Travel, Brute Force, Lateral Movement, Device Spoofing, Credential Misuse)
    """
    dataset_path = os.path.join("data", "behavior_anomaly_training_dataset.xlsx")
    if not os.path.exists(dataset_path):
        dataset_path = os.path.join("data", "behavior_anomaly_training_dataset.csv")

    print(f"Loading behavioral dataset from {dataset_path}...")

    try:
        df = pd.read_excel(dataset_path) if dataset_path.endswith('.xlsx') else pd.read_csv(dataset_path)
    except Exception as e:
        print(f"Dataset load warning: {e}")
        df = pd.DataFrame({
            'login_hour': [9, 10, 14, 2, 23, 11],
            'failed_attempts': [0, 0, 1, 8, 12, 0],
            'new_device': [0, 0, 0, 1, 1, 0],
            'country_changed': [0, 0, 0, 1, 1, 0],
            'travel_speed_kmph': [0, 10, 0, 1200, 950, 5],
            'session_duration_min': [45, 120, 30, 2, 180, 60],
            'unique_resources': [2, 3, 1, 8, 12, 2],
            'attack_type': ['None', 'None', 'None', 'Impossible Travel', 'Brute Force', 'None']
        })

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
    y = df['attack_type']

    # Label Encode attack categories
    le = LabelEncoder()
    y_encoded = le.fit_transform(y)

    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    X_train, X_test, y_train, y_test = train_test_split(
        X_scaled, y_encoded, test_size=0.2, random_state=42, stratify=y_encoded
    )

    print("Training Random Forest Classifier...")
    rf_clf = RandomForestClassifier(
        n_estimators=150,
        max_depth=12,
        class_weight='balanced',
        random_state=42,
        n_jobs=-1
    )
    rf_clf.fit(X_train, y_train)

    # Print evaluation
    y_pred = rf_clf.predict(X_test)
    print("\nModel Classification Report:")
    print(classification_report(y_test, y_pred, target_names=le.classes_))

    # Save artifacts
    os.makedirs("models", exist_ok=True)
    clf_path = os.path.join("models", "random_forest_classifier.pkl")
    encoder_path = os.path.join("models", "label_encoder.pkl")
    scaler_path = os.path.join("models", "clf_scaler.pkl")

    joblib.dump(rf_clf, clf_path)
    joblib.dump(le, encoder_path)
    joblib.dump(scaler, scaler_path)

    print(f"Successfully saved Random Forest Classifier to {clf_path}")

if __name__ == "__main__":
    train_classifier()
