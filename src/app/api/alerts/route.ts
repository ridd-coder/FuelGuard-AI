import { NextResponse } from 'next/server'
import { ALERTS } from '@/lib/simulation'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const zone = searchParams.get('zone')
  const severity = searchParams.get('severity')

  let alerts = ALERTS
  if (zone) alerts = alerts.filter(a => a.zone === zone)
  if (severity) alerts = alerts.filter(a => a.severity === severity)

  // Add live simulated alert occasionally
  const liveAlerts = [...alerts]
  if (Math.random() > 0.7) {
    liveAlerts.unshift({
      id: `live-${Date.now()}`,
      type: 'anomaly',
      severity: 'medium',
      zone: 'Zone-A',
      message: `Live AI detect: Demand surge at Highway Junction — ${Math.round(150 + Math.random() * 80)}% above baseline`,
      timeAgo: 'Just now',
      resolved: false,
    })
  }

  return NextResponse.json(liveAlerts)
}
