'use client'

interface TopbarProps {
  title: string
  subtitle?: string
  crisisLevel?: 'low' | 'medium' | 'high' | 'critical'
  actions?: React.ReactNode
}

const crisisLabels = {
  low: '🟢 Crisis Level: Low',
  medium: '🟡 Crisis Level: Medium',
  high: '🟠 Crisis Level: High',
  critical: '🔴 Crisis Level: Critical',
}

import { useState, useEffect } from 'react'

export default function Topbar({ title, subtitle, crisisLevel = 'medium', actions }: TopbarProps) {
  const [now, setNow] = useState<Date | null>(null)

  useEffect(() => {
    setNow(new Date())
    const interval = setInterval(() => setNow(new Date()), 60000)
    return () => clearInterval(interval)
  }, [])

  const timeStr = now ? now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '--:--'
  const dateStr = now ? now.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '---'

  return (
    <header className="topbar">
      <div>
        <div className="topbar-title">{title}</div>
        {subtitle && <div className="topbar-subtitle">{subtitle}</div>}
      </div>

      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div className="live-badge">
          <span className="pulse-dot green" />
          LIVE
        </div>

        <div className={`crisis-indicator ${crisisLevel}`}>
          {crisisLabels[crisisLevel]}
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>{timeStr}</div>
          <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>{dateStr}</div>
        </div>

        {actions}
      </div>
    </header>
  )
}
