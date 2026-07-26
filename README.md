# AI-Powered Behavioral Anomaly Detection for Cybersecurity

FILE LINK-https://drive.google.com/file/d/1QftsW6xp-PjMpo0Wo3RbAbqdeDCRFMn4/view
Video Walkthrough
A demonstration of the complete solution, including dataset generation, model pipeline, anomaly detection workflow, Streamlit dashboard, and system functionality.
Google Drive:
https://drive.google.com/file/d/19IAM23XWHUa-YVsgry_nj1E6tH0tEgY3/view?usp=sharing
<img width="891" height="423" alt="image" src="https://github.com/user-attachments/assets/9c9aceb1-de07-4c59-8ad9-c61198baac7b" />

A full-stack AI system that detects cybersecurity anomalies in login behavior using a two-stage ML pipeline (Isolation Forest + XGBoost), with SHAP explainability, a risk scoring engine, and a real-time SOC dashboard.
<img width="1600" height="829" alt="image" src="https://github.com/user-attachments/assets/23131ee0-9abe-4dcb-b403-07ec2bb12705" />

## Architecture

```
Login Event → Feature Engineering → Isolation Forest (Anomaly Detection)
                                           │
                                    Normal? → Low Risk Score → Dashboard
                                           │
                                    Anomalous ↓
                                    XGBoost Classifier → Attack Type
                                           │
                                    Risk Score Engine (0-100)
                                           │
                                    SHAP Explainability
                                           │
                                    SOC Alert JSON
                                           │
                                    FastAPI Backend
                                           │
                                    React SOC Dashboard
```
<img width="960" height="430" alt="image" src="https://github.com/user-attachments/assets/a9f1dd1d-b811-4a03-916e-f5b6a4da3b46" />

## Attack Types Detected

| Attack Type       | Description                             |
| ----------------- | --------------------------------------- |
| Brute Force       | Multiple failed login attempts          |
| Credential Misuse | Valid credentials used suspiciously     |
| Device Spoofing   | Login from unrecognized devices         |
| Impossible Travel | Physically implausible location changes |
| Lateral Movement  | Unusual resource access patterns        |

## Project Structure

```
projects/
├── README.md
├── behavior_anomaly_detection.ipynb    # Full ML pipeline notebook
├── behavior_anomaly_training_dataset.xlsx  # Training data (10,000 events)
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                     # FastAPI application
│   │   ├── ml_pipeline.py             # ML inference pipeline
│   │   └── models/
│   ├── saved_models/                   # Trained model artifacts
│   │   ├── behavior_model.pkl          # Isolation Forest
│   │   ├── attack_classifier.pkl       # XGBoost
│   │   ├── feature_scaler.pkl          # StandardScaler
│   │   └── attack_label_encoder.pkl    # LabelEncoder
│   ├── train_models.py                 # Model training script
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── index.js
│   │   ├── App.js                      # Main dashboard app
│   │   ├── App.css                     # Dark theme styles
│   │   └── components/
│   │       ├── RiskGauge.js            # SVG risk score gauge
│   │       ├── StatsCards.js           # Summary metric cards
│   │       ├── AlertTable.js           # Real-time alert table
│   │       ├── AttackAnalytics.js      # Attack type distribution
│   │       └── EventForm.js            # Event submission form
│   ├── package.json
│   └── Dockerfile
└── docker-compose.yml
```

## Quick Start

### Option 1: Docker Compose (Recommended)

```bash
cd projects/
docker-compose up --build
```

- Backend API: http://localhost:8000
- Frontend Dashboard: http://localhost:3000
- API Docs: http://localhost:8000/docs

### Option 2: Manual Setup

**Backend:**

```bash
cd backend/
pip install -r requirements.txt

# Train models (first time only)
python train_models.py

# Start API server
uvicorn app.main:app --reload --port 8000
```

**Frontend:**
<img width="949" height="424" alt="image" src="https://github.com/user-attachments/assets/06420296-afeb-4dde-beaa-147be2157f85" />

```bash
cd frontend/
npm install
npm start
```

## API Endpoints

| Method | Endpoint        | Description                  |
| ------ | --------------- | ---------------------------- |
| GET    | `/health`       | Health check                 |
| POST   | `/predict`      | Predict a single login event |
| GET    | `/alerts`       | Get recent alert history     |
| GET    | `/stats`        | Get aggregate statistics     |
| POST   | `/alerts/clear` | Clear alert history          |

### Example Request

```bash
curl -X POST http://localhost:8000/predict \
  -H "Content-Type: application/json" \
  -d '{
    "login_hour": 3,
    "failed_attempts": 6,
    "new_device": 1,
    "country_changed": 1,
    "travel_speed_kmph": 950,
    "session_duration_min": 12,
    "unique_resources": 9,
    "resource": "Payroll"
  }'
```


### Example Response

```json
{
  "id": "a1b2c3d4-...",
  "timestamp": "2026-07-25T16:53:34.791602+00:00",
  "prediction": "Device Spoofing",
  "is_anomaly": true,
  "risk_score": 61,
  "confidence": 0.44,
  "reasons": [
    "6 failed login attempts",
    "Login from a new/unrecognized device",
    "Country changed since last session",
    "Travel speed physically implausible (950 km/h)",
    "Accessed a sensitive resource (Payroll/Finance)"
  ],
  "event": { ... }
}
```

## Risk Score Engine

The risk score (0–100) combines multiple signals:

| Component                   | Max Points | Signal                                   |
| --------------------------- | ---------- | ---------------------------------------- |
| Anomaly severity            | 35         | How far outside "normal" the event is    |
| Classifier confidence       | 25         | How certain the attack classification is |
| Failed login attempts       | 15         | Direct brute-force indicator             |
| New device + Country change | 15         | Account takeover indicators              |
| Travel speed                | 5          | Physically implausible movement          |
| Sensitive resource access   | 5          | High-value target accessed               |

## Model Performance

| Model              | Metric   | Value |
| ------------------ | -------- | ----- |
| Isolation Forest   | ROC AUC  | 0.769 |
| XGBoost Classifier | Accuracy | 96.7% |
| XGBoost Classifier | Macro F1 | 0.969 |

## Tech Stack

- **ML:** scikit-learn, XGBoost, SHAP, pandas, numpy
- **Backend:** FastAPI, uvicorn, pydantic
- **Frontend:** React 18, CSS Grid, SVG visualizations
- **Deployment:** Docker, Docker Compose

## Dataset

Synthetic login-event dataset with 10,000 records and 19 features:

- ~97% normal logins
- ~3% attack events (5 attack types, ~55-68 samples each)

Features include: login_hour, failed_attempts, new_device, country_changed, travel_speed_kmph, session_duration_min, unique_resources, department, location, device, OS, browser, resource.

## License

This project was built for educational/hackathon purposes.
