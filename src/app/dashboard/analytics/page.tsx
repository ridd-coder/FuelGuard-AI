'use client'

import { useState, useEffect, useCallback } from 'react'
import Sidebar from '@/components/layout/Sidebar'
import Topbar from '@/components/layout/Topbar'
import BlockchainLedger from '@/components/blockchain/BlockchainLedger'
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  Cell,
} from 'recharts'

const ZONE_COLORS = ['#00d4ff', '#00ff88', '#ff7a30', '#9b59ff']

function HeatmapGrid() {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const hours = Array.from({ length: 24 }, (_, i) => i)
  const [hovered, setHovered] = useState<{ d: number; h: number } | null>(null)

  const getValue = (d: number, h: number) => {
    const base = h >= 7 && h <= 10 ? 0.85 : h >= 17 && h <= 20 ? 0.9 : h >= 12 && h <= 14 ? 0.65 : 0.2
    const dayFactor = (d === 5 || d === 6) ? 1.2 : 1
    return Math.min(1, base * dayFactor + (Math.random() * 0.15 - 0.07))
  }

  const getColor = (v: number) => {
    if (v < 0.2) return `rgba(0,212,255,0.15)`
    if (v < 0.4) return `rgba(0,212,255,${0.15 + v * 0.5})`
    if (v < 0.6) return `rgba(255,215,0,${v * 0.7})`
    if (v < 0.8) return `rgba(255,122,48,${v * 0.85})`
    return `rgba(255,51,102,${v})`
  }

  return (
    <div style={{ position: 'relative' }}>
      <div style={{ display: 'flex', gap: '2px', marginBottom: '4px', paddingLeft: '32px' }}>
        {days.map(d => (
          <div key={d} style={{ flex: 1, fontSize: '0.625rem', color: 'var(--text-muted)', textAlign: 'center', fontWeight: 700 }}>{d}</div>
        ))}
      </div>
      {hours.map(h => (
        <div key={h} style={{ display: 'flex', gap: '2px', marginBottom: '2px', alignItems: 'center' }}>
          <div style={{ fontSize: '0.5625rem', color: 'var(--text-muted)', width: '28px', textAlign: 'right', paddingRight: '4px', flexShrink: 0 }}>
            {h === 0 ? '12a' : h < 12 ? `${h}a` : h === 12 ? '12p' : `${h - 12}p`}
          </div>
          {days.map((_, d) => {
            const v = getValue(d, h)
            const isHov = hovered?.d === d && hovered?.h === h
            return (
              <div key={d}
                className="heatmap-cell"
                onMouseEnter={() => setHovered({ d, h })}
                onMouseLeave={() => setHovered(null)}
                style={{
                  background: getColor(v),
                  flex: 1, height: '14px',
                  border: isHov ? '1px solid white' : '1px solid transparent',
                  boxShadow: isHov ? `0 0 6px ${getColor(v)}` : 'none',
                }}
              />
            )
          })}
        </div>
      ))}
      {hovered && (
        <div style={{
          position: 'absolute', top: hovered.h * 16 + 20, left: hovered.d * 40 + 80,
          background: 'var(--bg-elevated)', border: '1px solid var(--border-emphasis)',
          borderRadius: '6px', padding: '6px 10px', fontSize: '0.6875rem',
          zIndex: 50, pointerEvents: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
        }}>
          <strong>{days[hovered.d]}</strong> {hovered.h}:00 — {Math.round(getValue(hovered.d, hovered.h) * 100)}% demand
        </div>
      )}
      <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.625rem', color: 'var(--text-muted)' }}>
        <span>Low</span>
        {[0.1, 0.3, 0.5, 0.7, 0.9].map(v => (
          <div key={v} style={{ width: 16, height: 8, background: getColor(v), borderRadius: 2 }} />
        ))}
        <span>High</span>
      </div>
    </div>
  )
}

export default function AnalyticsDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'forecast' | 'behavioral' | 'blockchain'>('overview')
  const [forecast, setForecast] = useState<{ hour: number; predicted: number; lower: number; upper: number }[]>([])

  const [weekData] = useState(() =>
    Array.from({ length: 30 }, (_, i) => ({
      date: `Apr ${i + 1 > 30 ? i - 29 : i + 1}`,
      shortage_index: Math.max(0, 40 + Math.sin(i * 0.4) * 25 + (Math.random() - 0.5) * 15),
      demand_index: 55 + Math.sin(i * 0.3 + 1) * 20 + (Math.random() - 0.5) * 10,
      supply_index: 70 - Math.sin(i * 0.35) * 15 + (Math.random() - 0.5) * 8,
    }))
  )

  const [zoneData] = useState(() => [
    { zone: 'North Zone', demand: 78, supply: 82, efficiency: 91, risk: 18 },
    { zone: 'South Zone', demand: 85, supply: 55, efficiency: 64, risk: 72 },
    { zone: 'East Zone', demand: 92, supply: 29, efficiency: 31, risk: 89 },
    { zone: 'West Zone', demand: 45, supply: 88, efficiency: 95, risk: 12 },
  ])

  const [radarData] = useState(() => [
    { metric: 'Prediction Accuracy', value: 94 },
    { metric: 'Distribution Equity', value: 72 },
    { metric: 'Response Time', value: 88 },
    { metric: 'Citizen Satisfaction', value: 65 },
    { metric: 'Fraud Prevention', value: 99 },
    { metric: 'System Uptime', value: 97 },
  ])

  const loadForecast = useCallback(async () => {
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'forecast', zone: 'North Zone' }),
      })
      const data = await res.json()
      setForecast(data.forecast)
    } catch { /* ignore */ }
  }, [])

  useEffect(() => { loadForecast() }, [loadForecast])

  const forecastChartData = forecast.map(f => ({
    time: `${f.hour}:00`,
    predicted: f.predicted,
    lower: f.lower,
    upper: f.upper,
  }))

  return (
    <div className="app-shell">
      <Sidebar role="admin" />
      <div className="main-content">
        <Topbar title="Analytics Hub" subtitle="System-wide intelligence and performance metrics" crisisLevel="medium" />
        <div className="page-content">

          {/* Header KPIs */}
          <div className="grid-4">
            {[
              { label: 'AI Model Accuracy', value: '94.2%', icon: '🎯', color: 'var(--neon-green)', trend: '↑ +1.4%' },
              { label: 'Blockchain Blocks', value: '—', icon: '🔗', color: 'var(--neon-cyan)', trend: 'Loading...' },
              { label: 'Avg Shortage Duration', value: '4.2h', icon: '⏱', color: 'var(--neon-orange)', trend: '↓ -0.8h' },
              { label: 'Fraud Prevented', value: '31', icon: '🛡', color: 'var(--neon-purple)', trend: 'This month' },
            ].map(k => (
              <div key={k.label} className="stat-card" style={{ '--accent-color': k.color } as React.CSSProperties}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div className="stat-label">{k.label}</div>
                  <div style={{ fontSize: '1.25rem' }}>{k.icon}</div>
                </div>
                <div className="stat-value" style={{ background: `linear-gradient(135deg, ${k.color}, var(--text-secondary))`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                  {k.value}
                </div>
                <div className="stat-change up">{k.trend}</div>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="tabs" style={{ maxWidth: '560px' }}>
            {(['overview', 'forecast', 'behavioral', 'blockchain'] as const).map(t => (
              <button key={t} className={`tab-btn ${activeTab === t ? 'active' : ''}`} onClick={() => setActiveTab(t)}>
                {t === 'overview' ? '📊 Overview' : t === 'forecast' ? '📈 AI Forecast' : t === 'behavioral' ? '🧠 Behavioral' : '🔗 Blockchain'}
              </button>
            ))}
          </div>

          {activeTab === 'overview' && (
            <>
              <div className="card">
                <div className="card-header">
                  <span className="card-title">30-Day System Indices</span>
                  <div style={{ display: 'flex', gap: '12px', fontSize: '0.75rem' }}>
                    <span style={{ color: '#ff3366' }}>● Shortage Index</span>
                    <span style={{ color: '#00d4ff' }}>● Demand Index</span>
                    <span style={{ color: '#00ff88' }}>● Supply Index</span>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={weekData} margin={{ top: 5, right: 10, bottom: 0, left: -20 }}>
                    <defs>
                      {[['#ff3366', 'shortage'], ['#00d4ff', 'demand'], ['#00ff88', 'supply']].map(([color, id]) => (
                        <linearGradient key={id} id={`grad-${id}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={color} stopOpacity={0.25} />
                          <stop offset="95%" stopColor={color} stopOpacity={0} />
                        </linearGradient>
                      ))}
                    </defs>
                    <XAxis dataKey="date" tick={{ fontSize: 9 }} interval={4} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: '8px', fontSize: '0.75rem' }} />
                    <Area type="monotone" dataKey="shortage_index" stroke="#ff3366" fill="url(#grad-shortage)" strokeWidth={2} dot={false} name="Shortage Index" />
                    <Area type="monotone" dataKey="demand_index" stroke="#00d4ff" fill="url(#grad-demand)" strokeWidth={2} dot={false} name="Demand Index" />
                    <Area type="monotone" dataKey="supply_index" stroke="#00ff88" fill="url(#grad-supply)" strokeWidth={2} dot={false} name="Supply Index" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="grid-2">
                <div className="card">
                  <div className="card-header"><span className="card-title">Zone Efficiency Radar</span></div>
                  <ResponsiveContainer width="100%" height={240}>
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="var(--border-subtle)" />
                      <PolarAngleAxis dataKey="metric" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} />
                      <Radar name="Score" dataKey="value" stroke="#00d4ff" fill="#00d4ff" fillOpacity={0.15} strokeWidth={2} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>

                <div className="card">
                  <div className="card-header"><span className="card-title">Zone Comparison</span></div>
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={zoneData} margin={{ top: 5, right: 10, bottom: 0, left: -20 }}>
                      <XAxis dataKey="zone" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: '8px', fontSize: '0.75rem' }} />
                      <Bar dataKey="demand" name="Demand" radius={[3, 3, 0, 0]}>
                        {zoneData.map((_, i) => <Cell key={i} fill={ZONE_COLORS[i]} />)}
                      </Bar>
                      <Bar dataKey="supply" name="Supply" fill="#334455" radius={[3, 3, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </>
          )}

          {activeTab === 'forecast' && (
            <>
              <div className="card">
                <div className="card-header">
                  <span className="card-title">24-Hour Demand Forecast</span>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <span className="badge badge-info">AI Generated</span>
                    <button className="btn btn-ghost btn-sm" onClick={loadForecast}>↺ Refresh</button>
                  </div>
                </div>
                {forecastChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={260}>
                    <AreaChart data={forecastChartData} margin={{ top: 5, right: 10, bottom: 0, left: -20 }}>
                      <defs>
                        <linearGradient id="predGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#00d4ff" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="time" tick={{ fontSize: 9 }} interval={2} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: '8px', fontSize: '0.75rem' }} />
                      <Area type="monotone" dataKey="upper" stroke="transparent" fill="rgba(0,212,255,0.08)" name="Upper Bound" />
                      <Area type="monotone" dataKey="predicted" stroke="#00d4ff" fill="url(#predGrad)" strokeWidth={2.5} dot={false} name="Predicted Demand" />
                      <Area type="monotone" dataKey="lower" stroke="transparent" fill="rgba(0,212,255,0.04)" name="Lower Bound" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div style={{ height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>Loading AI forecast...</div>
                )}
              </div>

              <div className="grid-3">
                {[
                  { time: '7–10 AM', label: 'Morning Peak', demand: 'High (85–95%)', advice: 'Restrict quotas, open queues early', color: 'var(--neon-orange)' },
                  { time: '12–2 PM', label: 'Midday Lull', demand: 'Moderate (55–65%)', advice: 'Normal operations, maintenance window', color: 'var(--neon-cyan)' },
                  { time: '5–8 PM', label: 'Evening Peak', demand: 'High (80–90%)', advice: 'Pre-position supply trucks by 4 PM', color: 'var(--neon-red)' },
                ].map(p => (
                  <div key={p.time} className="card">
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px' }}>{p.time}</div>
                    <h4 style={{ fontSize: '1rem', marginBottom: '8px' }}>{p.label}</h4>
                    <div style={{ fontSize: '0.8125rem', color: p.color, fontWeight: 600, marginBottom: '8px' }}>{p.demand}</div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>{p.advice}</div>
                  </div>
                ))}
              </div>
            </>
          )}

          {activeTab === 'behavioral' && (
            <>
              <div className="card">
                <div className="card-header">
                  <span className="card-title">Demand Heatmap — Hour × Day of Week</span>
                  <span className="badge badge-info">Behavioral Pattern Analysis</span>
                </div>
                <div style={{ overflow: 'auto' }}>
                  <HeatmapGrid />
                </div>
              </div>

              <div className="grid-2">
                <div className="card">
                  <div className="card-header"><span className="card-title">Anomaly Detection Log</span></div>
                  <div className="scroll-list">
                    {[
                      { time: '11:42 AM', zone: 'East Zone', zScore: 3.2, severity: 'critical', msg: 'West Zone Petrol — panic buying confirmed' },
                      { time: '10:15 AM', zone: 'North Zone', zScore: 2.1, severity: 'medium', msg: 'Highway Junction — demand spike +181%' },
                      { time: '08:30 AM', zone: 'South Zone', zScore: 1.8, severity: 'low', msg: 'North Gate Station — minor elevation' },
                      { time: 'Yesterday', zone: 'West Zone', zScore: 2.7, severity: 'high', msg: 'Outer Ring — pre-shortage panic behavior' },
                    ].map((a, i) => (
                      <div key={i} style={{
                        padding: '10px 12px', background: 'var(--bg-elevated)', borderRadius: '8px',
                        border: `1px solid ${a.severity === 'critical' ? 'rgba(255,51,102,0.25)' : a.severity === 'high' ? 'rgba(255,122,48,0.2)' : 'var(--border-subtle)'}`,
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>{a.zone}</span>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--neon-cyan)' }}>z={a.zScore}σ</span>
                            <span style={{ fontSize: '0.625rem', color: 'var(--text-muted)' }}>{a.time}</span>
                          </div>
                        </div>
                        <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{a.msg}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="card">
                  <div className="card-header"><span className="card-title">Credit Usage Patterns</span></div>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={[
                      { range: '0–20', users: 12 }, { range: '21–40', users: 28 }, { range: '41–60', users: 45 },
                      { range: '61–80', users: 38 }, { range: '81–100', users: 22 },
                    ]} margin={{ top: 5, right: 10, bottom: 0, left: -20 }}>
                      <XAxis dataKey="range" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: '8px', fontSize: '0.75rem' }} />
                      <Bar dataKey="users" name="Users" radius={[4, 4, 0, 0]}>
                        {[0, 1, 2, 3, 4].map(i => (
                          <Cell key={i} fill={i < 2 ? '#ff3366' : i < 3 ? '#ffd700' : '#00ff88'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '8px' }}>
                    Credit balance distribution (% of weekly quota remaining)
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'blockchain' && (
            <div className="grid-2-1" style={{ alignItems: 'start' }}>
              <div className="card">
                <div className="card-header">
                  <span className="card-title">Blockchain Transaction Ledger</span>
                  <span className="badge badge-operational">SHA-256 Verified</span>
                </div>
                <BlockchainLedger />
              </div>
              <div className="card">
                <div className="card-header"><span className="card-title">Chain Statistics</span></div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {[
                    { label: 'Hash Algorithm', value: 'SHA-256', color: 'var(--neon-cyan)' },
                    { label: 'Proof of Work', value: 'Difficulty: 2', color: 'var(--neon-green)' },
                    { label: 'Tampering Status', value: '✅ None Detected', color: 'var(--neon-green)' },
                    { label: 'Transaction Types', value: 'Booking, Stock, QR, Credit', color: 'var(--text-secondary)' },
                    { label: 'Avg Mine Time', value: '< 100ms', color: 'var(--neon-purple)' },
                    { label: 'Storage', value: 'In-Memory (Demo)', color: 'var(--text-muted)' },
                  ].map(s => (
                    <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                      <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{s.label}</span>
                      <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: s.color }}>{s.value}</span>
                    </div>
                  ))}
                  <div style={{ marginTop: '8px', padding: '12px', background: 'rgba(0,212,255,0.05)', borderRadius: '8px', border: '1px solid var(--border-subtle)', fontSize: '0.8125rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                    Every booking, stock update, QR validation, and credit transaction is recorded as an immutable block.
                    The chain is verifiable by any stakeholder, preventing fraud and enabling full audit trails.
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
