'use client'

import { useState, useEffect } from 'react'
import InteractiveMap from '@/components/maps/InteractiveMap'
import { getLiveStations, type SimStation } from '@/lib/simulation'

export default function UserFuelMapPage() {
  const [stations, setStations] = useState<SimStation[]>([])

  useEffect(() => {
    // Initial fetch
    setStations(getLiveStations())

    // Update simulation points every 5 seconds
    const interval = setInterval(() => {
      setStations(getLiveStations())
    }, 5000)
    
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="dashboard-content">
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Live Fuel Map</h1>
          <p className="dashboard-subtitle" style={{ marginTop: '0.5rem' }}>Real-time tracking of fuel availability and active stations in your region.</p>
        </div>
      </div>

      <div className="grid-stack" style={{ marginTop: '1.5rem', height: '100%' }}>
        <div className="card" style={{ padding: 0, overflow: 'hidden', height: 'calc(100vh - 160px)' }}>
          <InteractiveMap stations={stations} height="100%" />
        </div>
      </div>
    </div>
  )
}
