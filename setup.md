# Setup Instructions

## AI Agent Instructions for Running the System

These instructions are designed to be followed by an AI assistant or automated system to set up and run the complete AI-Powered Behavioral Anomaly Detection system.

---

## Prerequisites

The following must be installed on the system:
- Python 3.10+ (tested with 3.11, 3.14)
- Node.js 18+
- npm 8+
- pip (Python package manager)
- brew (macOS) or apt (Linux) for system dependencies

---

## Step 1: Install System Dependencies

### macOS:
```bash
brew install libomp
```

### Linux (Ubuntu/Debian):
```bash
sudo apt-get update && sudo apt-get install -y libgomp1
```

### Windows:
No additional system dependencies needed — XGBoost bundles OpenMP.

---

## Step 2: Install Backend Python Dependencies

```bash
cd projects/backend/
pip install -r requirements.txt
```

**If `pip` is restricted (PEP 668 / managed environment):**
```bash
pip install --break-system-packages -r requirements.txt
```

**Or use a virtual environment (recommended):**
```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### Dependencies installed:
- fastapi >= 0.104.0
- uvicorn[standard] >= 0.24.0
- pydantic >= 2.0.0
- numpy >= 1.24.0
- pandas >= 2.0.0
- scikit-learn >= 1.3.0
- xgboost >= 2.0.0
- joblib >= 1.3.0
- openpyxl >= 3.1.0
- shap >= 0.43.0

---

## Step 3: Train the ML Models

```bash
cd projects/backend/
python3 train_models.py
```

**Expected output:**
```
Loading dataset from: .../behavior_anomaly_training_dataset.xlsx
  Shape: (10000, 19)
  Attack rate: 2.99%
Applying feature engineering...
Training Isolation Forest...
  Isolation Forest saved to: .../saved_models/behavior_model.pkl
Training XGBoost Attack Classifier...
  Classifier saved to: .../saved_models/attack_classifier.pkl
  Accuracy: 0.967
✅ All models trained and saved successfully!
```

**Verify models exist:**
```bash
ls projects/backend/saved_models/
# Expected: behavior_model.pkl  attack_classifier.pkl  feature_scaler.pkl  attack_label_encoder.pkl
```

---

## Step 4: Start the FastAPI Backend

```bash
cd projects/backend/
python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```

**Verify backend is running:**
```bash
curl http://localhost:8000/health
# Expected: {"status": "healthy", "timestamp": "..."}
```

**Test a prediction:**
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

**Expected response:**
```json
{
  "id": "...",
  "timestamp": "...",
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
  ]
}
```

---

## Step 5: Install Frontend Dependencies

```bash
cd projects/frontend/
npm install
```

---

## Step 6: Start the React Frontend

```bash
cd projects/frontend/
BROWSER=none npm start
```

**Expected output:**
```
Compiled successfully!
You can now view soc-dashboard in the browser.
  Local: http://localhost:3000
```

---

## Step 7: Verify Full System

Open in browser: **http://localhost:3000**

The dashboard should show:
- ✅ "Connected" status badge (green) — means frontend reached backend
- Stats cards (initially all zeros)
- Event submission form with preset scenarios
- Empty alert table

**Test the full pipeline:**
1. Click the "🔨 Brute Force" preset button
2. Click "🔍 Analyze Event"
3. Observe:
   - Risk Gauge updates with high score
   - Alert appears in the table with "Brute Force" prediction
   - Attack Analytics bar chart shows 1 Brute Force event
   - Stats cards update

---

## Alternative: Docker Compose (One Command)

If Docker is available:

```bash
cd projects/
docker-compose up --build
```

This will:
1. Build the backend image (installs deps + trains models)
2. Build the frontend image (compiles React + serves via nginx)
3. Start both services

Access:
- Dashboard: http://localhost:3000
- API: http://localhost:8000
- API Docs: http://localhost:8000/docs

---

## API Endpoints Reference

| Method | URL | Description |
|---|---|---|
| GET | `http://localhost:8000/health` | Health check |
| POST | `http://localhost:8000/predict` | Submit login event for prediction |
| GET | `http://localhost:8000/alerts?limit=50` | Get recent alerts |
| GET | `http://localhost:8000/alerts?anomaly_only=true` | Get anomalies only |
| GET | `http://localhost:8000/stats` | Get aggregate statistics |
| POST | `http://localhost:8000/alerts/clear` | Clear alert history |
| GET | `http://localhost:8000/docs` | Interactive Swagger UI |

---

## Troubleshooting

| Problem | Solution |
|---|---|
| `ModuleNotFoundError: No module named 'joblib'` | Run `pip install -r requirements.txt` |
| XGBoost `libomp.dylib` error (macOS) | Run `brew install libomp` |
| Backend port 8000 already in use | Kill existing process: `lsof -i :8000` then `kill <PID>` |
| Frontend port 3000 already in use | Kill existing process: `lsof -i :3000` then `kill <PID>` |
| `FileNotFoundError: Model file not found` | Run `python3 train_models.py` first |
| Frontend shows "Disconnected" | Ensure backend is running on port 8000 |
| CORS errors in browser | Backend already has `allow_origins=["*"]` — restart backend |

---

## File Structure

```
projects/
├── DOCUMENTATION.md          # Full technical documentation
├── README.md                 # Quick start + architecture overview
├── setup.md                  # This file (AI setup instructions)
├── docker-compose.yml        # One-command deployment
├── behavior_anomaly_detection.ipynb    # ML notebook (EDA + training)
├── behavior_anomaly_training_dataset.xlsx  # Training dataset
├── backend/
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── requirements.txt
│   ├── train_models.py       # Model training script
│   ├── saved_models/         # Trained model artifacts (generated)
│   │   ├── behavior_model.pkl
│   │   ├── attack_classifier.pkl
│   │   ├── feature_scaler.pkl
│   │   └── attack_label_encoder.pkl
│   └── app/
│       ├── __init__.py
│       ├── main.py           # FastAPI application
│       └── ml_pipeline.py    # ML inference pipeline
└── frontend/
    ├── Dockerfile
    ├── .dockerignore
    ├── .env                  # API URL config
    ├── nginx.conf
    ├── package.json
    ├── public/
    │   └── index.html
    └── src/
        ├── index.js
        ├── App.js            # Main dashboard
        ├── App.css           # Dark theme styles
        └── components/
            ├── RiskGauge.js
            ├── StatsCards.js
            ├── AlertTable.js
            ├── AttackAnalytics.js
            └── EventForm.js
```

---

## Quick Commands Summary

```bash
# Full setup from scratch:
cd projects/backend && pip install -r requirements.txt && python3 train_models.py

# Start backend:
cd projects/backend && python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8000

# Start frontend (separate terminal):
cd projects/frontend && npm install && npm start

# Or with Docker:
cd projects && docker-compose up --build
```
