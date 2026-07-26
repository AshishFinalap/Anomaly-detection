"""
FastAPI Backend for AI-Powered Behavioral Anomaly Detection SOC Dashboard.

Endpoints:
  GET  /health         — Health check
  POST /predict        — Predict a single login event
  GET  /alerts         — Get recent alert history
  GET  /stats          — Get aggregate statistics
  POST /alerts/clear   — Clear alert history
"""

import time
import uuid
from collections import deque
from datetime import datetime, timezone
from typing import Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from .ml_pipeline import predict_event

# ---------------------------------------------------------------------------
# App Setup
# ---------------------------------------------------------------------------

app = FastAPI(
    title="Behavioral Anomaly Detection API",
    description="AI-powered cybersecurity anomaly detection with Isolation Forest + XGBoost",
    version="1.0.0",
)

# Allow React frontend on any port to call the API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory alert store (in production, use Redis/PostgreSQL)
MAX_ALERTS = 500
alert_history: deque = deque(maxlen=MAX_ALERTS)

# ---------------------------------------------------------------------------
# Request / Response Models
# ---------------------------------------------------------------------------


class LoginEvent(BaseModel):
    """Schema for a single login event sent to /predict."""
    login_hour: int = Field(..., ge=0, le=23, description="Hour of login (0–23)")
    failed_attempts: int = Field(..., ge=0, description="Number of failed login attempts")
    new_device: int = Field(..., ge=0, le=1, description="1 if login from new device, else 0")
    country_changed: int = Field(..., ge=0, le=1, description="1 if country changed since last login")
    travel_speed_kmph: int = Field(..., ge=0, description="Travel speed in km/h since last login")
    session_duration_min: int = Field(..., ge=0, description="Session duration in minutes")
    unique_resources: int = Field(..., ge=0, description="Number of unique resources accessed")
    resource: str = Field(..., description="Resource being accessed (e.g., Payroll, CRM, GitLab)")

    class Config:
        json_schema_extra = {
            "example": {
                "login_hour": 3,
                "failed_attempts": 6,
                "new_device": 1,
                "country_changed": 1,
                "travel_speed_kmph": 950,
                "session_duration_min": 12,
                "unique_resources": 9,
                "resource": "Payroll",
            }
        }


class PredictionResponse(BaseModel):
    """Schema for prediction response."""
    id: str
    timestamp: str
    prediction: str
    is_anomaly: bool
    risk_score: int
    confidence: Optional[float]
    reasons: list[str]
    event: dict


class StatsResponse(BaseModel):
    """Schema for aggregate statistics."""
    total_events: int
    total_anomalies: int
    anomaly_rate: float
    attack_type_counts: dict
    avg_risk_score: float
    high_risk_count: int  # risk_score >= 70


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------


@app.get("/health")
def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "timestamp": datetime.now(timezone.utc).isoformat()}


@app.post("/predict", response_model=PredictionResponse)
def predict(event: LoginEvent):
    """
    Predict whether a login event is anomalous.

    Runs the full pipeline:
      1. Feature engineering
      2. Isolation Forest anomaly detection
      3. If anomalous → XGBoost attack classification
      4. Risk score computation with explainable reasons
    """
    try:
        raw_event = event.model_dump()
        result = predict_event(raw_event)
    except FileNotFoundError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

    alert = PredictionResponse(
        id=str(uuid.uuid4()),
        timestamp=datetime.now(timezone.utc).isoformat(),
        prediction=result["prediction"],
        is_anomaly=result["is_anomaly"],
        risk_score=result["risk_score"],
        confidence=result["confidence"],
        reasons=result["reasons"],
        event=raw_event,
    )

    # Store in history
    alert_history.appendleft(alert.model_dump())

    return alert


@app.get("/alerts")
def get_alerts(limit: int = 50, anomaly_only: bool = False):
    """
    Retrieve recent alerts from history.

    Parameters:
      - limit: Maximum number of alerts to return (default: 50)
      - anomaly_only: If true, only return anomalous events
    """
    alerts = list(alert_history)
    if anomaly_only:
        alerts = [a for a in alerts if a["is_anomaly"]]
    return alerts[:limit]


@app.get("/stats", response_model=StatsResponse)
def get_stats():
    """Get aggregate statistics from alert history."""
    alerts = list(alert_history)
    total = len(alerts)

    if total == 0:
        return StatsResponse(
            total_events=0,
            total_anomalies=0,
            anomaly_rate=0.0,
            attack_type_counts={},
            avg_risk_score=0.0,
            high_risk_count=0,
        )

    anomalies = [a for a in alerts if a["is_anomaly"]]
    attack_types: dict = {}
    for a in anomalies:
        t = a["prediction"]
        attack_types[t] = attack_types.get(t, 0) + 1

    risk_scores = [a["risk_score"] for a in alerts]

    return StatsResponse(
        total_events=total,
        total_anomalies=len(anomalies),
        anomaly_rate=round(len(anomalies) / total, 4) if total > 0 else 0.0,
        attack_type_counts=attack_types,
        avg_risk_score=round(sum(risk_scores) / len(risk_scores), 1),
        high_risk_count=sum(1 for s in risk_scores if s >= 70),
    )


@app.post("/alerts/clear")
def clear_alerts():
    """Clear the alert history."""
    alert_history.clear()
    return {"status": "cleared", "timestamp": datetime.now(timezone.utc).isoformat()}
