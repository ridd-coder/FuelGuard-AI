import { NextResponse } from 'next/server'

export interface EmergencyOverride {
  id: string
  vehicleType: string
  vehicleReg: string
  emergencyLevel: 'critical' | 'high'
  reason: string
  fuelAmount: number
  stationId: string
  stationName: string
  creditCost: number
  status: 'dispatched' | 'arrived' | 'completed'
  qrCode: string
  dispatchedAt: string
  eta: number          // minutes
  authorisedBy: string
}

const g = globalThis as unknown as { emergencyOverrides: EmergencyOverride[] }
if (!g.emergencyOverrides) {
  g.emergencyOverrides = []
}

// ── GET ────────────────────────────────────────────────────────────────────

export async function GET() {
  return NextResponse.json(g.emergencyOverrides)
}

// ── POST ───────────────────────────────────────────────────────────────────

export async function POST(request: Request) {
  const body = await request.json()

  const id      = `EMG-${Date.now().toString(36).toUpperCase()}`
  const qrCode  = `FG-EMG-${Math.random().toString(36).substring(2, 6).toUpperCase()}`
  const eta     = body.emergencyLevel === 'critical' ? 3 : 8   // minutes

  // Emergency surcharge: CRITICAL = 3× credits, HIGH = 2×
  const multiplier  = body.emergencyLevel === 'critical' ? 3 : 2
  const creditCost  = (body.fuelAmount ?? 20) * multiplier

  const override: EmergencyOverride = {
    id,
    vehicleType:    body.vehicleType,
    vehicleReg:     body.vehicleReg,
    emergencyLevel: body.emergencyLevel,
    reason:         body.reason,
    fuelAmount:     body.fuelAmount ?? 20,
    stationId:      body.stationId,
    stationName:    body.stationName,
    creditCost,
    status: 'dispatched',
    qrCode,
    dispatchedAt: new Date().toISOString(),
    eta,
    authorisedBy: 'FuelGuard AI — Auto-Authorised',
  }

  g.emergencyOverrides.unshift(override)

  // Debit credits from shared store
  const gc = globalThis as unknown as { credits: { balance: number; used: number } }
  if (gc.credits) {
    gc.credits.balance = Math.max(0, gc.credits.balance - creditCost)
    gc.credits.used   += creditCost
  }

  // Simulate arrival after eta minutes (update status)
  setTimeout(() => {
    const found = g.emergencyOverrides.find(e => e.id === id)
    if (found) found.status = 'arrived'
  }, eta * 60 * 1000)

  return NextResponse.json({ success: true, override })
}

// ── PATCH ──────────────────────────────────────────────────────────────────

export async function PATCH(request: Request) {
  const body     = await request.json()
  const override = g.emergencyOverrides.find(e => e.id === body.id)
  if (!override) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  override.status = body.status
  return NextResponse.json({ success: true, override })
}
