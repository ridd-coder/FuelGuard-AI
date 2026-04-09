// Simulated AI engine for FuelGuard AI
// Falls back to rule-based simulation when FastAPI microservice is unavailable

export interface StationData {
  id: string
  name: string
  currentStock: number
  maxCapacity: number
  queueLength: number
  zone: string
}

export interface ShortageRisk {
  stationId: string
  riskScore: number // 0-100
  hoursToShortage: number
  confidence: number
  factors: string[]
}

export interface DemandForecast {
  hour: number
  predicted: number
  lower: number
  upper: number
}

export interface AnomalyResult {
  detected: boolean
  severity: 'none' | 'low' | 'medium' | 'high'
  zScore: number
  message: string
}

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

// Predict shortage risk via AI service or fallback to simulation
export async function predictShortageRisk(station: StationData): Promise<ShortageRisk> {
  try {
    const res = await fetch(`${AI_SERVICE_URL}/predict/shortage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        station_id: station.id,
        current_stock: station.currentStock,
        max_capacity: station.maxCapacity,
        queue_length: station.queueLength,
        zone: station.zone
      }),
    });
    if (res.ok) {
      const data = await res.json();
      return {
        stationId: data.station_id,
        riskScore: data.risk_score,
        hoursToShortage: data.hours_to_shortage,
        confidence: data.confidence,
        factors: data.factors,
      };
    }
  } catch (err) {
    console.error("AI service shortage risk failed, falling back to simulation:", err);
  }

  const stockRatio = station.currentStock / station.maxCapacity
  const queuePressure = Math.min(station.queueLength / 50, 1)
  const riskScore = Math.round((1 - stockRatio) * 60 + queuePressure * 40)
  const hoursToShortage = stockRatio > 0.1 ? Math.round((stockRatio * station.maxCapacity) / (station.queueLength + 5) * 2) : 1

  const factors: string[] = []
  if (stockRatio < 0.3) factors.push('Low stock level')
  if (station.queueLength > 30) factors.push('High queue demand')
  if (riskScore > 70) factors.push('Critical shortage imminent')

  return {
    stationId: station.id,
    riskScore: Math.min(riskScore, 100),
    hoursToShortage: Math.max(hoursToShortage, 0),
    confidence: 0.78 + Math.random() * 0.18,
    factors,
  }
}

// Simulate demand forecast via AI service or fallback
export async function generateDemandForecast(zone: string): Promise<DemandForecast[]> {
  try {
    const res = await fetch(`${AI_SERVICE_URL}/predict/demand`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        zone,
        hours: 24
      }),
    });
    if (res.ok) {
      const data = await res.json();
      return data.forecast;
    }
  } catch (err) {
     console.error("AI service demand forecast failed, falling back to simulation:", err);
  }

  const basePattern = [
    20, 15, 10, 8, 10, 25, 55, 80, 95, 85, 70, 65,
    75, 80, 75, 70, 85, 95, 90, 75, 60, 45, 35, 25,
  ]
  const zoneMultiplier = zone === 'Zone-A' ? 1.2 : zone === 'Zone-B' ? 1.0 : 0.85

  return basePattern.map((base, hour) => {
    const predicted = Math.round(base * zoneMultiplier + (Math.random() - 0.5) * 10)
    return {
      hour,
      predicted,
      lower: Math.round(predicted * 0.85),
      upper: Math.round(predicted * 1.15),
    }
  })
}

// Anomaly detection via AI service or fallback
export async function detectAnomaly(recentValues: number[], currentValue: number): Promise<AnomalyResult> {
  try {
    const res = await fetch(`${AI_SERVICE_URL}/detect/anomaly`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        recent_values: recentValues,
        current_value: currentValue
      }),
    });
    if (res.ok) {
      const data = await res.json();
      return {
        detected: data.detected,
        severity: data.severity,
        zScore: data.z_score,
        message: data.message
      }
    }
  } catch (err) {
    console.error("AI service anomaly detection failed, falling back to simulation:", err);
  }

  if (recentValues.length < 3) return { detected: false, severity: 'none', zScore: 0, message: 'Insufficient data' }

  const mean = recentValues.reduce((a, b) => a + b, 0) / recentValues.length
  const std = Math.sqrt(recentValues.reduce((sq, n) => sq + Math.pow(n - mean, 2), 0) / recentValues.length)
  const zScore = std === 0 ? 0 : (currentValue - mean) / std

  let severity: AnomalyResult['severity'] = 'none'
  let detected = false
  let message = 'Normal activity'

  if (Math.abs(zScore) > 3) {
    severity = 'high'
    detected = true
    message = `Critical panic-buying detected! Demand is ${zScore.toFixed(1)}σ above normal`
  } else if (Math.abs(zScore) > 2) {
    severity = 'medium'
    detected = true
    message = `Unusual demand spike detected (${zScore.toFixed(1)}σ above baseline)`
  } else if (Math.abs(zScore) > 1.5) {
    severity = 'low'
    detected = true
    message = `Minor demand elevation (${zScore.toFixed(1)}σ above baseline)`
  }

  return { detected, severity, zScore: Math.round(zScore * 100) / 100, message }
}

// Gemini chat simulation (context-aware responses)
export function simulateGeminiResponse(message: string, context?: Record<string, unknown>): string {
  const lower = message.toLowerCase()

  if (lower.includes('shortage') || lower.includes('crisis')) {
    return `🔴 **Shortage Alert:** Based on current AI analysis, Zone-B stations show a 78% shortage risk within the next 6 hours. I recommend booking your slot at **City Center Pump** (Zone-A) which has adequate supply. Your current fuel credit balance allows for a 15L booking.`
  }
  if (lower.includes('book') || lower.includes('slot')) {
    return `✅ **Booking Assistance:** I found 3 available slots today:\n- **10:30 AM** – City Center Pump (15L, 15 credits)\n- **2:15 PM** – North Gate Station (20L, 20 credits)\n- **5:00 PM** – Zone-C Depot (10L, 10 credits)\n\nShall I book the earliest one for you?`
  }
  if (lower.includes('credit') || lower.includes('quota') || lower.includes('balance')) {
    return `💳 **Fuel Credit Status:** You have **85 credits** remaining (out of 100 weekly quota). Current crisis index is **Medium**, so your daily limit is set to 30L. Credits reset every Monday at 00:00 IST. Tip: Book during off-peak hours (after 8PM) to get a 10% credit bonus.`
  }
  if (lower.includes('nearest') || lower.includes('station') || lower.includes('where')) {
    return `📍 **Nearest Stations:** Based on your location (Zone-A):\n1. **City Center Pump** – 0.8 km, ✅ 68% stock, 12 min wait\n2. **Highway Junction** – 2.1 km, ⚠️ 34% stock, 28 min wait\n3. **North Gate Station** – 3.4 km, ✅ 82% stock, 8 min wait\n\nI recommend North Gate for shortest wait time.`
  }
  if (lower.includes('predict') || lower.includes('forecast') || lower.includes('tomorrow')) {
    return `📊 **AI Forecast:** Tomorrow's demand prediction:\n- **Morning peak (8-10 AM):** 94% stations busy, expect 20-40 min queues\n- **Afternoon (2-4 PM):** Moderate demand, 65% capacity utilization\n- **Evening (6-8 PM):** 87% capacity, second peak expected\n\nRecommendation: Book for **early morning (7 AM)** or **late night (9 PM)** slots for fastest service.`
  }
  if (lower.includes('whatsapp') || lower.includes('alert') || lower.includes('notification')) {
    return `📱 **Alert Setup:** You're subscribed to WhatsApp alerts for Zone-A & Zone-B. You'll receive:\n- Shortage warnings (2 hours in advance)\n- Slot confirmation & QR codes\n- Daily availability digest at 7 AM\n\nTo modify alert preferences, say "update my alerts".`
  }
  if (lower.includes('blockchain') || lower.includes('transaction') || lower.includes('fraud')) {
    return `🔗 **Blockchain Transparency:** Every fuel transaction is recorded on our tamper-proof ledger. Your last 3 transactions are verified with SHA-256 hashes on the Analytics dashboard. The system has detected **0 fraud attempts** in the last 24 hours. All distribution records are publicly auditable.`
  }

  return `🤖 **FuelGuard AI:** I'm here to help you navigate the fuel situation. I can assist with:\n- 📍 Finding nearest available stations\n- 📅 Booking fuel slots\n- 💳 Checking your credit balance\n- 📊 Viewing shortage forecasts\n- 🔔 Setting up alerts\n\nWhat would you like to know?`
}
