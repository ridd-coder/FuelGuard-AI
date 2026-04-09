import { NextResponse } from 'next/server'
import { STATIONS, getLiveStations, getZoneSummary, getKpiMetrics } from '@/lib/simulation'
import { predictShortageRisk } from '@/lib/ai-engine'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const view = searchParams.get('view') || 'list'

  if (view === 'kpi') {
    return NextResponse.json(getKpiMetrics())
  }

  if (view === 'zones') {
    return NextResponse.json(getZoneSummary())
  }

  const stations = getLiveStations()
  const enriched = await Promise.all(
    stations.map(async s => ({
      ...s,
      risk: await predictShortageRisk(s),
      stockPct: Math.round((s.currentStock / s.maxCapacity) * 100),
    }))
  )

  return NextResponse.json(enriched)
}

export async function POST(request: Request) {
  const body = await request.json()
  const { stationId, newStock, reason } = body

  const station = STATIONS.find(s => s.id === stationId)
  if (!station) {
    return NextResponse.json({ error: 'Station not found' }, { status: 404 })
  }

  // Simulate stock update
  const previousStock = station.currentStock
  station.currentStock = newStock
  station.status = newStock < station.maxCapacity * 0.1 ? 'critical' : newStock === 0 ? 'offline' : 'operational'

  return NextResponse.json({
    success: true,
    stationId,
    previousStock,
    newStock,
    reason,
    timestamp: new Date().toISOString(),
  })
}
