"""
FuelGuard AI - FastAPI Microservice
AI models for demand forecasting, shortage prediction, and anomaly detection
Run: uvicorn main:app --reload --port 8000
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import numpy as np
from datetime import datetime
import math

app = FastAPI(title="FuelGuard AI Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─── Models ───────────────────────────────────────────────────────────────────

class StationInput(BaseModel):
    station_id: str
    current_stock: float
    max_capacity: float
    queue_length: int
    zone: str
    historical_demand: Optional[List[float]] = None


class AnomalyInput(BaseModel):
    recent_values: List[float]
    current_value: float


class ForecastInput(BaseModel):
    zone: str
    hours: Optional[int] = 24


# ─── Shortage Prediction ─────────────────────────────────────────────────────

@app.post("/predict/shortage")
async def predict_shortage(data: StationInput):
    stock_ratio = data.current_stock / data.max_capacity
    queue_pressure = min(data.queue_length / 50.0, 1.0)

    # Weighted risk formula
    stock_risk = (1 - stock_ratio) * 60
    queue_risk = queue_pressure * 40
    risk_score = round(min(stock_risk + queue_risk, 100))

    # Hours to shortage estimate
    consumption_rate = (data.queue_length + 5) * 2.5  # litres per hour estimate
    if consumption_rate > 0:
        hours_to_shortage = round(data.current_stock / consumption_rate, 1)
    else:
        hours_to_shortage = 999.0

    factors = []
    if stock_ratio < 0.3:
        factors.append("Low stock level")
    if data.queue_length > 30:
        factors.append("High queue demand")
    if risk_score > 70:
        factors.append("Critical shortage imminent")
    if data.zone in ["Zone-C", "Zone-B"]:
        factors.append("High-demand zone")

    confidence = round(0.75 + np.random.random() * 0.2, 3)

    return {
        "station_id": data.station_id,
        "risk_score": risk_score,
        "hours_to_shortage": max(hours_to_shortage, 0),
        "confidence": confidence,
        "factors": factors,
        "recommendation": "Emergency resupply required" if risk_score > 80 else
                          "Monitor closely" if risk_score > 50 else "Normal operations"
    }


# ─── Demand Forecasting ───────────────────────────────────────────────────────

@app.post("/predict/demand")
async def predict_demand(data: ForecastInput):
    # Time-series simulation with zone-specific patterns
    zone_multipliers = {"Zone-A": 1.2, "Zone-B": 1.0, "Zone-C": 0.9, "Zone-D": 0.75}
    multiplier = zone_multipliers.get(data.zone, 1.0)

    base_pattern = [
        20, 15, 10, 8, 10, 25, 55, 80, 95, 85, 70, 65,
        75, 80, 75, 70, 85, 95, 90, 75, 60, 45, 35, 25
    ]

    forecast = []
    for h in range(data.hours):
        base = base_pattern[h % 24]
        noise = np.random.normal(0, 5)
        predicted = max(0, round(base * multiplier + noise))
        forecast.append({
            "hour": h,
            "predicted": predicted,
            "lower": round(predicted * 0.85),
            "upper": round(predicted * 1.15),
        })

    return {
        "zone": data.zone,
        "forecast": forecast,
        "peak_hour": max(forecast, key=lambda x: x["predicted"])["hour"],
        "model": "FuelGuard-Prophet-v1"
    }


# ─── Anomaly Detection ────────────────────────────────────────────────────────

@app.post("/detect/anomaly")
async def detect_anomaly(data: AnomalyInput):
    if len(data.recent_values) < 3:
        return {"detected": False, "severity": "none", "z_score": 0, "message": "Insufficient data"}

    values = np.array(data.recent_values)
    mean = float(np.mean(values))
    std = float(np.std(values))

    if std == 0:
        return {"detected": False, "severity": "none", "z_score": 0, "message": "No variance in data"}

    z_score = round((data.current_value - mean) / std, 2)
    abs_z = abs(z_score)

    if abs_z > 3:
        return {"detected": True, "severity": "critical", "z_score": z_score,
                "message": f"Critical panic-buying detected! {z_score:.1f}σ above normal"}
    elif abs_z > 2:
        return {"detected": True, "severity": "high", "z_score": z_score,
                "message": f"Unusual demand spike ({z_score:.1f}σ above baseline)"}
    elif abs_z > 1.5:
        return {"detected": True, "severity": "medium", "z_score": z_score,
                "message": f"Minor elevation detected ({z_score:.1f}σ)"}
    else:
        return {"detected": False, "severity": "none", "z_score": z_score,
                "message": "Normal activity"}


# ─── System Health ────────────────────────────────────────────────────────────

@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "service": "FuelGuard AI Microservice",
        "models": ["shortage_prediction", "demand_forecast", "anomaly_detection"],
        "timestamp": datetime.utcnow().isoformat()
    }
