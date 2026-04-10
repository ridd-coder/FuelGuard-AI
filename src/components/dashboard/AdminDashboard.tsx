'use client'

import { useState, useEffect, useCallback } from 'react'
import Sidebar from '@/components/layout/Sidebar'
import Topbar from '@/components/layout/Topbar'
import InteractiveMap from '@/components/maps/InteractiveMap'
import { STATIONS, ALERTS, getZoneSummary } from '@/lib/simulation'
import type { SimStation, SimAlert } from '@/lib/simulation'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, AreaChart, Area, Cell,
  ScatterChart, Scatter, ZAxis,
} from 'recharts'

const ALERT_ICONS: Record<string, string> = {
  shortage: '⛽', panic_buying: '😱', anomaly: '📈', system: '⚙️',
}

const SEVERITY_ORDER = { critical: 0, high: 1, medium: 2, low: 3 }

export default function AdminDashboard({ initialTab = 'command' }: { initialTab?: 'command' | 'distribution' | 'blockchain_view' }) {
  const [stations, setStations] = useState<SimStation[]>(STATIONS)
  const [alerts, setAlerts] = useState<SimAlert[]>(ALERTS)
  const [zones, setZones] = useState(getZoneSummary())
  const [activeAlert, setActiveAlert] = useState<SimAlert | null>(null)
  const [selectedZone, setSelectedZone] = useState('all')
  const [activeTab, setActiveTab] = useState<'command' | 'distribution' | 'blockchain_view'>(initialTab)
  const [crisisBannerState, setCrisisBannerState] = useState<'active' | 'accepted' | 'modifying'>('active')

  const [distributionPlans, setDistributionPlans] = useState([
    { truck: 'FT-101', from: 'West Zone Depot', to: 'BKC Corporate Pump', amount: '8,000L', eta: '45 min', priority: 'URGENT', color: 'var(--neon-red)', status: 'pending' },
    { truck: 'FT-205', from: 'Central Refinery', to: 'South Ex Service Station', amount: '6,000L', eta: '1h 20min', priority: 'HIGH', color: 'var(--neon-orange)', status: 'pending' },
    { truck: 'FT-318', from: 'North Zone Overflow', to: 'Chandni Chowk Depot', amount: '3,500L', eta: '35 min', priority: 'MED', color: 'var(--neon-yellow)', status: 'pending' },
  ])

  const [supplyData] = useState(() =>
    ['North', 'South', 'East', 'West'].map(zone => {
      const zStations = STATIONS.filter(s => s.zone === zone)
      const supply = Math.round(zStations.reduce((a, s) => a + s.currentStock, 0) / zStations.reduce((a, s) => a + s.maxCapacity, 0) * 100)
      const demand = Math.round(supply * (0.8 + Math.random() * 0.6))
      return { zone, supply, demand, risk: 100 - supply }
    })
  )

  const [trendData] = useState(() =>
    Array.from({ length: 14 }, (_, i) => ({
      day: `Apr ${i + 1}`,
      shortage_events: Math.round(Math.random() * 5),
      panic_buying: Math.round(Math.random() * 3),
      resolved: Math.round(Math.random() * 7),
    }))
  )

  const loadData = useCallback(async () => {
    try {
      const [stRes, alRes] = await Promise.all([
        fetch('/api/stations'),
        fetch('/api/alerts'),
      ])
      if (stRes.ok) { const d = await stRes.json(); setStations(d); setZones(getZoneSummary()) }
      if (alRes.ok) setAlerts(await alRes.json())
    } catch { /* ignore */ }
  }, [])

  useEffect(() => { loadData(); const t = setInterval(loadData, 10000); return () => clearInterval(t) }, [loadData])

  const kpis = [
    { label: 'System Stock', value: `${Math.round(stations.reduce((a, s) => a + s.currentStock, 0) / stations.reduce((a, s) => a + s.maxCapacity, 0) * 100)}%`, color: 'var(--neon-cyan)', icon: '📦', change: '↓ -8% today' },
    { label: 'Critical Stations', value: stations.filter(s => s.status === 'critical').length, color: 'var(--neon-red)', icon: '🚨', change: 'Needs attention' },
    { label: 'Active Alerts', value: alerts.filter(a => !a.resolved).length, color: 'var(--neon-orange)', icon: '⚠️', change: '3 unresolved' },
    { label: 'Total Queue', value: stations.reduce((a, s) => a + s.queueLength, 0), color: 'var(--neon-purple)', icon: '🚗', change: 'System-wide' },
  ]

  const sortedAlerts = [...alerts].sort((a, b) => SEVERITY_ORDER[a.severity as keyof typeof SEVERITY_ORDER] - SEVERITY_ORDER[b.severity as keyof typeof SEVERITY_ORDER])
  const filteredAlerts = selectedZone === 'all' ? sortedAlerts : sortedAlerts.filter(a => a.zone === selectedZone)

  return (
    <div className="app-shell">
      <Sidebar role="admin" />
      <div className="main-content">
        <Topbar title="Authority Command Center" subtitle="Live crisis intelligence & distribution control" crisisLevel="high" />
        <div className="page-content">

          {/* Crisis Banner */}
          {crisisBannerState === 'active' && (
            <div style={{
              background: 'linear-gradient(135deg, rgba(255,122,48,0.1), rgba(255,51,102,0.08))',
              border: '1px solid rgba(255,122,48,0.3)',
              borderRadius: '12px', padding: '14px 20px',
              display: 'flex', alignItems: 'center', gap: '16px',
            }}>
              <div style={{ fontSize: '1.5rem', animation: 'pulse-ring 1.5s infinite' }}>🚨</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, color: 'var(--neon-orange)', marginBottom: '2px' }}>
                  HIGH ALERT: East and South Zones under shortage risk
                </div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                  AI Recommendation: Reroute supply truck FT-442 from West Zone depot to East Zone (Ballygunge Circular Fuel) — estimated 45 min ETA
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="btn btn-success btn-sm" onClick={() => setCrisisBannerState('accepted')}>✅ Accept AI Plan</button>
                <button className="btn btn-ghost btn-sm" onClick={() => setCrisisBannerState('modifying')}>Modify</button>
              </div>
            </div>
          )}

          {crisisBannerState === 'accepted' && (
            <div style={{
              background: 'rgba(0, 255, 136, 0.1)',
              border: '1px solid var(--neon-green)',
              borderRadius: '12px', padding: '14px 20px',
              display: 'flex', alignItems: 'center', gap: '16px',
            }}>
              <div style={{ fontSize: '1.5rem' }}>✅</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, color: 'var(--neon-green)', marginBottom: '2px' }}>
                  AI Plan Executed Successfully
                </div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                  Supply truck FT-442 has been successfully rerouted to Ballygunge Circular Fuel. Crisis averted.
                </div>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => setCrisisBannerState('active')}>Reset</button>
            </div>
          )}

          {crisisBannerState === 'modifying' && (
            <div style={{
              background: 'rgba(255, 122, 48, 0.1)',
              border: '1px solid var(--neon-orange)',
              borderRadius: '12px', padding: '14px 20px',
              display: 'flex', alignItems: 'center', gap: '16px',
            }}>
              <div style={{ fontSize: '1.5rem' }}>⚙️</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, color: 'var(--neon-orange)', marginBottom: '2px' }}>
                  Manual Override Mode
                </div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                  Awaiting your custom routing instructions for FT-442...
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="btn btn-success btn-sm" onClick={() => setCrisisBannerState('accepted')}>Confirm Mod</button>
                <button className="btn btn-ghost btn-sm" onClick={() => setCrisisBannerState('active')}>Cancel</button>
              </div>
            </div>
          )}

          {/* KPIs */}
          <div className="grid-4">
            {kpis.map(k => (
              <div key={k.label} className="stat-card" style={{ '--accent-color': k.color } as React.CSSProperties}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div className="stat-label">{k.label}</div>
                  <div style={{ fontSize: '1.25rem' }}>{k.icon}</div>
                </div>
                <div className="stat-value" style={{ background: `linear-gradient(135deg, ${k.color}, var(--text-secondary))`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                  {k.value}
                </div>
                <div className="stat-change down">{k.change}</div>
              </div>
            ))}
          </div>

          {/* Tab bar */}
          <div className="tabs" style={{ maxWidth: '500px' }}>
            <button className={`tab-btn ${activeTab === 'command' ? 'active' : ''}`} onClick={() => setActiveTab('command')}>🗺️ Command View</button>
            <button className={`tab-btn ${activeTab === 'distribution' ? 'active' : ''}`} onClick={() => setActiveTab('distribution')}>🚛 Distribution AI</button>
            <button className={`tab-btn ${activeTab === 'blockchain_view' ? 'active' : ''}`} onClick={() => setActiveTab('blockchain_view')}>📊 Zone Analytics</button>
          </div>

          {activeTab === 'command' && (
            <>
              <div className="grid-2-1" style={{ alignItems: 'start' }}>
                {/* Map + zone heatmap */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    <div className="card-header" style={{ padding: '16px 20px 12px' }}>
                      <span className="card-title">Live Crisis Map</span>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <span className="badge badge-operational">3 OK</span>
                        <span className="badge badge-critical">3 Critical</span>
                        <span className="badge badge-offline">1 Offline</span>
                      </div>
                    </div>
                    <InteractiveMap stations={stations} height={320} />
                  </div>

                  {/* Supply vs Demand bar */}
                  <div className="card">
                    <div className="card-header">
                      <span className="card-title">Supply vs Demand by Zone</span>
                      <span className="badge badge-info">AI Analysis</span>
                    </div>
                    <ResponsiveContainer width="100%" height={160}>
                      <BarChart data={supplyData} barGap={4} margin={{ top: 5, right: 10, bottom: 0, left: -20 }}>
                        <XAxis dataKey="zone" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 10 }} />
                        <Tooltip contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: '8px', fontSize: '0.75rem' }} />
                        <Bar dataKey="supply" name="Supply %" fill="#00d4ff" radius={[3, 3, 0, 0]} />
                        <Bar dataKey="demand" name="Demand %" fill="#ff7a30" radius={[3, 3, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Alert feed */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div className="card">
                    <div className="card-header">
                      <span className="card-title">Alert Feed</span>
                      <select className="form-select btn-sm" value={selectedZone} onChange={e => setSelectedZone(e.target.value)}
                        style={{ padding: '4px 28px 4px 8px', fontSize: '0.75rem' }}>
                        <option value="all">All Zones</option>
                        {['North', 'South', 'East', 'West'].map(z => <option key={z} value={z}>{z}</option>)}
                      </select>
                    </div>
                    <div className="scroll-list">
                      {filteredAlerts.map(a => (
                        <div key={a.id} className={`alert-item alert-${a.severity}`}
                          style={{ cursor: 'pointer' }}
                          onClick={() => setActiveAlert(a)}>
                          <span className="alert-icon">{ALERT_ICONS[a.type]}</span>
                          <div className="alert-content">
                            <div className="alert-msg">{a.message}</div>
                            <div className="alert-meta">
                              <span>{a.zone}</span>
                              <span className={`badge badge-${a.severity === 'critical' ? 'offline' : a.severity === 'high' ? 'critical' : a.severity === 'medium' ? 'warning' : 'info'}`} style={{ fontSize: '0.6rem' }}>
                                {a.severity.toUpperCase()}
                              </span>
                              <span>{a.timeAgo}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Zone cards */}
                  <div className="card">
                    <div className="card-header"><span className="card-title">Zone Status</span></div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {zones.map(z => (
                        <div key={z.zone} style={{ display: 'flex', gap: '10px', alignItems: 'center', padding: '8px', background: 'var(--bg-elevated)', borderRadius: '8px' }}>
                          <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', minWidth: '70px' }}>{z.zone}</div>
                          <div style={{ flex: 1 }}>
                            <div className="progress-bar">
                              <div className={`progress-fill ${z.avgStockPct > 50 ? 'green' : z.avgStockPct > 25 ? 'orange' : 'red'}`}
                                style={{ width: `${z.avgStockPct}%` }} />
                            </div>
                          </div>
                          <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: z.avgStockPct > 50 ? 'var(--neon-green)' : z.avgStockPct > 25 ? 'var(--neon-orange)' : 'var(--neon-red)', minWidth: '36px', textAlign: 'right' }}>
                            {z.avgStockPct}%
                          </div>
                          {z.criticalStations > 0 && (
                            <span className="badge badge-critical" style={{ fontSize: '0.625rem' }}>{z.criticalStations} critical</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Station table */}
              <div className="card">
                <div className="card-header">
                  <span className="card-title">All Stations</span>
                  <span className="badge badge-info">Live Data</span>
                </div>
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Station</th><th>Zone</th><th>Stock</th><th>Queue</th>
                        <th>Risk Score</th><th>Hours Left</th><th>Status</th><th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stations.map(s => (
                        <tr key={s.id}>
                          <td style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{s.name}</td>
                          <td>{s.zone}</td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <div className="progress-bar" style={{ width: '60px' }}>
                                <div className={`progress-fill ${s.status === 'operational' ? 'green' : s.status === 'critical' ? 'orange' : 'red'}`}
                                  style={{ width: `${Math.round(s.currentStock / s.maxCapacity * 100)}%` }} />
                              </div>
                              <span style={{ fontSize: '0.75rem' }}>{Math.round(s.currentStock / s.maxCapacity * 100)}%</span>
                            </div>
                          </td>
                          <td>{s.queueLength}</td>
                          <td>
                            <span style={{ color: s.riskScore > 70 ? 'var(--neon-red)' : s.riskScore > 40 ? 'var(--neon-orange)' : 'var(--neon-green)', fontWeight: 700 }}>
                              {s.riskScore}%
                            </span>
                          </td>
                          <td>{s.status === 'offline' ? '—' : `${s.hoursToShortage}h`}</td>
                          <td>
                            <span className={`badge badge-${s.status === 'operational' ? 'operational' : s.status === 'critical' ? 'critical' : 'offline'}`}>
                              <span className={`pulse-dot ${s.status === 'operational' ? 'green' : s.status === 'critical' ? 'orange' : 'red'}`} />
                              {s.status}
                            </span>
                          </td>
                          <td>
                            {s.status === 'critical' && (
                              <button className="btn btn-danger btn-sm" style={{ fontSize: '0.6875rem' }}>🚛 Dispatch</button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {activeTab === 'distribution' && (
            <div className="grid-2" style={{ alignItems: 'start' }}>
              {/* AI Recommendations */}
              <div className="card">
                <div className="card-header">
                  <span className="card-title">AI Distribution Plan</span>
                  <span className="badge badge-info">Optimized</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {distributionPlans.map((r, i) => (
                    <div key={r.truck} style={{
                      padding: '14px', background: 'var(--bg-elevated)',
                      borderRadius: '10px', border: `1px solid ${r.color}30`,
                      opacity: r.status === 'approved' ? 0.7 : 1,
                      transition: 'all 0.3s ease'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9375rem' }}>{r.truck}</div>
                        <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: r.color, border: `1px solid ${r.color}40`, padding: '2px 8px', borderRadius: '4px' }}>
                          {r.priority}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                        📍 {r.from} → ⛽ {r.to}
                      </div>
                      <div style={{ display: 'flex', gap: '16px', fontSize: '0.8125rem' }}>
                        <span>📦 {r.amount}</span>
                        <span>⏱ ETA: {r.eta}</span>
                      </div>
                      <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                        {r.status === 'approved' ? (
                          <span style={{ color: 'var(--neon-green)', fontSize: '0.8125rem', fontWeight: 600, padding: '4px 0' }}>✅ Dispatch Approved & Running</span>
                        ) : r.status === 'rerouted' ? (
                          <span style={{ color: 'var(--neon-orange)', fontSize: '0.8125rem', fontWeight: 600, padding: '4px 0' }}>🔄 Rerouting Process Initiated...</span>
                        ) : r.status === 'tracking' ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ color: 'var(--neon-cyan)', fontSize: '0.8125rem', fontWeight: 600, padding: '4px 0', animation: 'pulse-ring 1s infinite' }}>📡 Tracking Mode</span>
                            <button className="btn btn-ghost btn-sm" style={{ fontSize: '0.75rem' }} onClick={() => {
                              const newPlans = [...distributionPlans]
                              newPlans[i].status = 'pending'
                              setDistributionPlans(newPlans)
                            }}>Close</button>
                          </div>
                        ) : (
                          <>
                            <button className="btn btn-success btn-sm" style={{ fontSize: '0.75rem' }} onClick={() => {
                              const newPlans = [...distributionPlans]
                              newPlans[i].status = 'approved'
                              setDistributionPlans(newPlans)
                            }}>✅ Approve</button>
                            <button className="btn btn-ghost btn-sm" style={{ fontSize: '0.75rem' }} onClick={() => {
                              const newPlans = [...distributionPlans]
                              newPlans[i].status = 'rerouted'
                              setDistributionPlans(newPlans)
                            }}>Reroute</button>
                            <button className="btn btn-ghost btn-sm" style={{ fontSize: '0.75rem' }} onClick={() => {
                              const newPlans = [...distributionPlans]
                              newPlans[i].status = 'tracking'
                              setDistributionPlans(newPlans)
                            }}>Track</button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Trend chart */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="card">
                  <div className="card-header">
                    <span className="card-title">14-Day Crisis Trend</span>
                  </div>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={trendData} margin={{ top: 5, right: 10, bottom: 0, left: -20 }}>
                      <XAxis dataKey="day" tick={{ fontSize: 9 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: '8px', fontSize: '0.75rem' }} />
                      <Line type="monotone" dataKey="shortage_events" stroke="#ff3366" strokeWidth={2} dot={false} name="Shortage Events" />
                      <Line type="monotone" dataKey="panic_buying" stroke="#ff7a30" strokeWidth={2} dot={false} name="Panic Buying" />
                      <Line type="monotone" dataKey="resolved" stroke="#00ff88" strokeWidth={2} dot={false} name="Resolved" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="card">
                  <div className="card-header"><span className="card-title">AI Quota Adjustments</span></div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {[
                      { zone: 'East Zone', change: '↓ -20%', reason: 'Panic buying detected', color: 'var(--neon-red)' },
                      { zone: 'South Zone', change: '↓ -10%', reason: 'Pre-emptive shortage control', color: 'var(--neon-orange)' },
                      { zone: 'North Zone', change: '+ Stable', reason: 'Normal conditions', color: 'var(--neon-green)' },
                      { zone: 'West Zone', change: '↑ +15%', reason: 'Surplus available for redistribution', color: 'var(--neon-cyan)' },
                    ].map(q => (
                      <div key={q.zone} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 10px', background: 'var(--bg-elevated)', borderRadius: '8px' }}>
                        <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>{q.zone}</span>
                        <span style={{ color: q.color, fontWeight: 700, fontSize: '0.875rem' }}>{q.change}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{q.reason}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'blockchain_view' && (
            <div className="grid-2" style={{ alignItems: 'start' }}>
              <div className="card">
                <div className="card-header">
                  <span className="card-title">Zone Performance</span>
                </div>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={zones.map(z => ({ name: z.zone, stock: z.avgStockPct, risk: z.riskScore }))} margin={{ top: 5, right: 10, bottom: 0, left: -20 }}>
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: '8px', fontSize: '0.75rem' }} />
                    <Bar dataKey="stock" name="Stock %" radius={[4, 4, 0, 0]}>
                      {zones.map((z, i) => (
                        <Cell key={i} fill={z.avgStockPct > 50 ? '#00ff88' : z.avgStockPct > 25 ? '#ff7a30' : '#ff3366'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="card">
                <div className="card-header"><span className="card-title">Equity Score</span></div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '8px' }}>
                  {[
                    { label: 'Distribution Fairness', value: 72, color: 'var(--neon-cyan)' },
                    { label: 'Anti-Hoarding Effectiveness', value: 88, color: 'var(--neon-green)' },
                    { label: 'AI Prediction Accuracy', value: 94, color: 'var(--neon-purple)' },
                    { label: 'Citizen Satisfaction', value: 65, color: 'var(--neon-orange)' },
                    { label: 'System Uptime', value: 99, color: 'var(--neon-cyan)' },
                  ].map(m => (
                    <div key={m.label}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{m.label}</span>
                        <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: m.color }}>{m.value}%</span>
                      </div>
                      <div className="progress-bar">
                        <div className="progress-fill" style={{
                          width: `${m.value}%`,
                          background: `linear-gradient(90deg, ${m.color}, ${m.color}99)`,
                          boxShadow: `0 0 8px ${m.color}40`,
                        }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Alert detail modal */}
      {activeAlert && (
        <div className="modal-overlay" onClick={() => setActiveAlert(null)}>
          <div className="modal-card" onClick={e => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
              <div style={{ fontSize: '2rem' }}>{ALERT_ICONS[activeAlert.type]}</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '1.125rem', color: 'var(--text-primary)', marginBottom: '4px' }}>
                  {activeAlert.type.replace('_', ' ').toUpperCase()}
                </div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{activeAlert.zone} · {activeAlert.timeAgo}</div>
              </div>
            </div>
            <p style={{ fontSize: '0.9375rem', lineHeight: 1.6, marginBottom: '20px' }}>{activeAlert.message}</p>
            <div style={{
              background: 'var(--bg-elevated)', borderRadius: '8px', padding: '12px',
              fontSize: '0.875rem', marginBottom: '20px',
            }}>
              <div style={{ fontWeight: 700, color: 'var(--neon-cyan)', marginBottom: '8px' }}>🤖 AI Recommendation</div>
              <div style={{ color: 'var(--text-secondary)' }}>
                {activeAlert.severity === 'critical'
                  ? 'Immediately dispatch emergency fuel supply. Activate panic-buying restrictions for this zone. Notify local authorities.'
                  : 'Monitor closely and consider pre-emptive quota adjustment. Schedule resupply within 2 hours.'}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="btn btn-success" onClick={() => setActiveAlert(null)}>✅ Acknowledge</button>
              <button className="btn btn-danger" onClick={() => setActiveAlert(null)}>🚛 Emergency Dispatch</button>
              <button className="btn btn-ghost" onClick={() => setActiveAlert(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
