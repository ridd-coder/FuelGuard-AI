'use client'

import { useState, useEffect } from 'react'
import Sidebar from '@/components/layout/Sidebar'
import Topbar from '@/components/layout/Topbar'
import { STATIONS } from '@/lib/simulation'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'

interface Booking {
  id: string; stationName: string; slotTime: string
  fuelAmount: number; status: string; qrCode: string; userId: string
}

const MY_STATION = STATIONS[0]

export default function PumpDashboard({ initialTab = 'overview' }: { initialTab?: 'overview' | 'queue' | 'validate' | 'stock' }) {
  const [station, setStation] = useState(MY_STATION)
  const [stockInput, setStockInput] = useState(MY_STATION.currentStock)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [qrInput, setQrInput] = useState('')
  const [validateResult, setValidateResult] = useState<{ valid: boolean; message: string; booking?: Booking } | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'queue' | 'validate' | 'stock'>(initialTab)
  const [stockUpdating, setStockUpdating] = useState(false)

  const [throughputData] = useState(() =>
    ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => ({
      day,
      litres: Math.round(2000 + Math.random() * 3000),
      vehicles: Math.round(80 + Math.random() * 120),
    }))
  )

  useEffect(() => {
    fetch('/api/bookings?stationId=s1').then(r => r.ok && r.json()).then(d => d && setBookings(d))
    const interval = setInterval(() => {
      setStation(prev => ({
        ...prev,
        queueLength: Math.max(0, prev.queueLength + Math.round((Math.random() - 0.4) * 3)),
        currentStock: Math.max(0, prev.currentStock - Math.round(Math.random() * 50)),
      }))
    }, 8000)
    return () => clearInterval(interval)
  }, [])

  const handleStockUpdate = async () => {
    setStockUpdating(true)
    await fetch('/api/stations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stationId: 's1', newStock: stockInput, reason: 'Manual update by operator' }),
    })
    await fetch('/api/blockchain', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'STOCK_UPDATE', data: { stationId: 's1', newStock: stockInput, operator: 'Suresh Singh' } }),
    })
    setStation(prev => ({ ...prev, currentStock: stockInput }))
    setTimeout(() => setStockUpdating(false), 800)
  }

  const handleValidate = async () => {
    if (!qrInput.trim()) return
    const res = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'validate', qrCode: qrInput.trim() }),
    })
    const data = await res.json()
    setValidateResult(data)
    if (data.valid) {
      fetch('/api/blockchain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'QR_VALIDATED', data: { qrCode: qrInput, bookingId: data.booking?.id, stationId: 's1' } }),
      })
      setBookings(prev => prev.map(b => b.qrCode === qrInput ? { ...b, status: 'completed' } : b))
    }
  }

  const handleBookingStatus = async (id: string, status: string) => {
    await fetch('/api/bookings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    })
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b))
  }

  const stockPct = Math.round((station.currentStock / station.maxCapacity) * 100)
  const stockColor = stockPct > 50 ? 'var(--neon-green)' : stockPct > 20 ? 'var(--neon-orange)' : 'var(--neon-red)'

  return (
    <div className="app-shell">
      <Sidebar role="pump" />
      <div className="main-content">
        <Topbar title="Pump Operator Dashboard" subtitle={`${station.name} · ${station.zone}`} crisisLevel="medium" />
        <div className="page-content">

          {/* Station banner */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(0,212,255,0.08), rgba(155,89,255,0.06))',
            border: '1px solid var(--border-default)', borderRadius: '16px',
            padding: '20px 24px', display: 'flex', gap: '24px', alignItems: 'center',
            flexWrap: 'wrap',
          }}>
            <div style={{ fontSize: '2.5rem' }}>⛽</div>
            <div style={{ flex: 1 }}>
              <h2 style={{ fontSize: '1.25rem', marginBottom: '4px' }}>{station.name}</h2>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{station.address} · {station.zone}</div>
            </div>
            <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
              {[
                { label: 'Stock', value: `${stockPct}%`, color: stockColor },
                { label: 'Queue', value: `${station.queueLength} vehicles`, color: 'var(--neon-cyan)' },
                { label: 'Price', value: `₹${station.pricing}/L`, color: 'var(--neon-green)' },
                { label: 'Status', value: station.status, color: station.status === 'operational' ? 'var(--neon-green)' : 'var(--neon-red)' },
              ].map(s => (
                <div key={s.label} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.25rem', fontWeight: 900, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* KPIs */}
          <div className="grid-4">
            {[
              { label: 'Stock Level', value: `${stockPct}%`, icon: '📦', color: stockColor, sub: `${station.currentStock.toFixed(0)}L of ${station.maxCapacity}L` },
              { label: 'Queue Now', value: station.queueLength, icon: '🚗', color: 'var(--neon-cyan)', sub: `~${station.queueLength * 3} min wait` },
              { label: 'Pending Bookings', value: bookings.filter(b => b.status === 'pending').length, icon: '📋', color: 'var(--neon-purple)', sub: 'Awaiting approval' },
              { label: "Today's Throughput", value: '1,842L', icon: '⛽', color: 'var(--neon-green)', sub: '68 vehicles served' },
            ].map(k => (
              <div key={k.label} className="stat-card" style={{ '--accent-color': k.color } as React.CSSProperties}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div className="stat-label">{k.label}</div>
                  <div style={{ fontSize: '1.25rem' }}>{k.icon}</div>
                </div>
                <div className="stat-value" style={{ background: `linear-gradient(135deg, ${k.color}, var(--text-secondary))`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                  {k.value}
                </div>
                <div className="stat-change neutral">{k.sub}</div>
              </div>
            ))}
          </div>

          {/* Stock progress bar */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Live Stock Level</span>
              <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: stockColor }}>{stockPct}% · {station.currentStock.toFixed(0)}L</span>
            </div>
            <div className="progress-bar" style={{ height: '12px' }}>
              <div className={`progress-fill ${stockPct > 50 ? 'green' : stockPct > 20 ? 'orange' : 'red'}`}
                style={{ width: `${stockPct}%`, transition: 'width 1s ease' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              <span>0 (Empty)</span>
              <span>⚠ Critical: 20%</span>
              <span>{station.maxCapacity}L (Full)</span>
            </div>
          </div>

          {/* Tabs */}
          <div className="tabs" style={{ maxWidth: '480px' }}>
            {(['overview', 'queue', 'validate', 'stock'] as const).map(t => (
              <button key={t} className={`tab-btn ${activeTab === t ? 'active' : ''}`} onClick={() => setActiveTab(t)}>
                {t === 'overview' ? '📊 Stats' : t === 'queue' ? '🚗 Queue' : t === 'validate' ? '✅ QR Scan' : '📦 Stock'}
              </button>
            ))}
          </div>

          {activeTab === 'overview' && (
            <div className="grid-2">
              <div className="card">
                <div className="card-header"><span className="card-title">Weekly Throughput</span></div>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={throughputData} margin={{ top: 5, right: 10, bottom: 0, left: -20 }}>
                    <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: '8px', fontSize: '0.75rem' }} />
                    <Bar dataKey="litres" name="Litres Sold" fill="#00d4ff" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="card">
                <div className="card-header"><span className="card-title">Vehicles Served</span></div>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={throughputData} margin={{ top: 5, right: 10, bottom: 0, left: -20 }}>
                    <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: '8px', fontSize: '0.75rem' }} />
                    <Line type="monotone" dataKey="vehicles" stroke="#9b59ff" strokeWidth={2} dot={{ fill: '#9b59ff', r: 4 }} name="Vehicles" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {activeTab === 'queue' && (
            <div className="card">
              <div className="card-header">
                <span className="card-title">Booking Queue Manager</span>
                <span className="badge badge-info">{bookings.length} bookings</span>
              </div>
              <div className="table-container">
                <table>
                  <thead>
                    <tr><th>Booking ID</th><th>Slot Time</th><th>Fuel</th><th>QR Code</th><th>Status</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {bookings.length === 0 ? (
                      <tr><td colSpan={6} style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>No bookings for this station yet</td></tr>
                    ) : bookings.map(b => (
                      <tr key={b.id}>
                        <td style={{ fontFamily: 'monospace', fontSize: '0.8125rem', color: 'var(--neon-cyan)' }}>{b.id}</td>
                        <td>{new Date(b.slotTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</td>
                        <td>{b.fuelAmount}L</td>
                        <td><span style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>{b.qrCode}</span></td>
                        <td>
                          <span className={`badge badge-${b.status === 'confirmed' ? 'info' : b.status === 'completed' ? 'operational' : b.status === 'cancelled' ? 'offline' : 'warning'}`}>
                            {b.status}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            {b.status === 'pending' && (
                              <>
                                <button className="btn btn-success btn-sm" onClick={() => handleBookingStatus(b.id, 'confirmed')} style={{ fontSize: '0.6875rem' }}>✅ Approve</button>
                                <button className="btn btn-danger btn-sm" onClick={() => handleBookingStatus(b.id, 'cancelled')} style={{ fontSize: '0.6875rem' }}>✕</button>
                              </>
                            )}
                            {b.status === 'confirmed' && (
                              <button className="btn btn-ghost btn-sm" style={{ fontSize: '0.6875rem' }} onClick={() => { setQrInput(b.qrCode); setActiveTab('validate') }}>
                                Scan QR
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'validate' && (
            <div className="grid-2" style={{ alignItems: 'start' }}>
              <div className="card">
                <div className="card-header"><span className="card-title">QR Code Validator</span></div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{
                    height: '180px', background: 'var(--bg-elevated)', borderRadius: '12px',
                    border: '2px dashed var(--border-emphasis)',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px',
                    position: 'relative', overflow: 'hidden',
                  }}>
                    <div style={{ fontSize: '3rem' }}>📷</div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Camera Scanner</div>
                    <div style={{
                      position: 'absolute', top: 0, left: 0, right: 0,
                      height: '3px', background: 'linear-gradient(90deg, transparent, var(--neon-cyan), transparent)',
                      animation: 'shimmer 2s infinite',
                    }} />
                  </div>
                  <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>— or enter manually —</div>
                  <div className="form-group">
                    <label className="form-label">QR Code / Booking ID</label>
                    <input className="form-input" value={qrInput} onChange={e => setQrInput(e.target.value)}
                      placeholder="e.g. FG-2085-XA or BK-2085"
                      onKeyDown={e => e.key === 'Enter' && handleValidate()}
                    />
                  </div>
                  <button className="btn btn-primary w-full" onClick={handleValidate} disabled={!qrInput.trim()}>
                    ✅ Validate QR Code
                  </button>

                  {validateResult && (
                    <div style={{
                      padding: '16px', borderRadius: '10px',
                      background: validateResult.valid ? 'rgba(0,255,136,0.08)' : 'rgba(255,51,102,0.08)',
                      border: `1px solid ${validateResult.valid ? 'rgba(0,255,136,0.3)' : 'rgba(255,51,102,0.3)'}`,
                    }}>
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ fontSize: '1.5rem' }}>{validateResult.valid ? '✅' : '❌'}</span>
                        <span style={{ fontWeight: 700, color: validateResult.valid ? 'var(--neon-green)' : 'var(--neon-red)' }}>
                          {validateResult.valid ? 'VALID — Proceed with fueling' : 'INVALID — ' + validateResult.message}
                        </span>
                      </div>
                      {validateResult.booking && (
                        <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.8 }}>
                          <div>⛽ Amount: {validateResult.booking.fuelAmount}L</div>
                          <div>🕐 Slot: {new Date(validateResult.booking.slotTime).toLocaleString('en-IN')}</div>
                          <div>🔑 ID: {validateResult.booking.id}</div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="card">
                <div className="card-header"><span className="card-title">Today&apos;s Validated</span></div>
                <div className="scroll-list">
                  {bookings.filter(b => b.status === 'completed').map(b => (
                    <div key={b.id} style={{ padding: '10px', background: 'rgba(0,255,136,0.06)', border: '1px solid rgba(0,255,136,0.15)', borderRadius: '8px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <span style={{ fontSize: '1.25rem' }}>✅</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>{b.id}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{b.fuelAmount}L · {b.qrCode}</div>
                      </div>
                      <span className="badge badge-operational">Done</span>
                    </div>
                  ))}
                  {bookings.filter(b => b.status === 'completed').length === 0 && (
                    <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px', fontSize: '0.875rem' }}>
                      No validated bookings yet today
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'stock' && (
            <div className="grid-2" style={{ alignItems: 'start' }}>
              <div className="card">
                <div className="card-header"><span className="card-title">Update Stock Level</span></div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>New Stock Level</span>
                      <span style={{ fontSize: '1.25rem', fontWeight: 900, color: stockColor }}>
                        {stockInput.toFixed(0)}L ({Math.round(stockInput / station.maxCapacity * 100)}%)
                      </span>
                    </div>
                    <input type="range" min="0" max={station.maxCapacity} step="100"
                      value={stockInput} onChange={e => setStockInput(Number(e.target.value))}
                      style={{ width: '100%' }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                      <span>0L</span><span>{station.maxCapacity}L</span>
                    </div>
                  </div>

                  {[1000, 3000, 5000, station.maxCapacity].map(v => (
                    <button key={v} className="btn btn-ghost btn-sm" onClick={() => setStockInput(v)} style={{ marginRight: '8px', fontSize: '0.75rem' }}>
                      Set {v >= 10000 ? 'Full' : `${v}L`}
                    </button>
                  ))}

                  <div style={{ height: '1px', background: 'var(--border-subtle)' }} />

                  <div style={{ padding: '12px', background: 'var(--bg-elevated)', borderRadius: '8px', fontSize: '0.875rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Current Stock</span>
                      <span style={{ fontWeight: 600 }}>{station.currentStock.toFixed(0)}L</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ color: 'var(--text-muted)' }}>New Stock</span>
                      <span style={{ fontWeight: 700, color: 'var(--neon-cyan)' }}>{stockInput.toFixed(0)}L</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Difference</span>
                      <span style={{ fontWeight: 700, color: stockInput > station.currentStock ? 'var(--neon-green)' : 'var(--neon-red)' }}>
                        {stockInput > station.currentStock ? '+' : ''}{(stockInput - station.currentStock).toFixed(0)}L
                      </span>
                    </div>
                  </div>

                  <button className="btn btn-primary w-full" onClick={handleStockUpdate} disabled={stockUpdating} style={{ padding: '12px', fontSize: '1rem' }}>
                    {stockUpdating ? '⏳ Updating & Recording on Blockchain...' : '📦 Update Stock + Record on Blockchain'}
                  </button>

                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.5 }}>
                    All stock updates are recorded on the immutable blockchain ledger with timestamp and operator ID for full audit trail.
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="card-header"><span className="card-title">AI Forecasted Need</span></div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ padding: '16px', background: 'var(--bg-elevated)', borderRadius: '10px', border: '1px solid var(--border-default)' }}>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--neon-cyan)', marginBottom: '10px' }}>🤖 AI Prediction</div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                      Based on current queue ({station.queueLength} vehicles) and historical consumption patterns,
                      this station will need a resupply of approximately <strong style={{ color: 'var(--text-primary)' }}>4,200L</strong> by
                      tomorrow morning to avoid shortage risk.
                    </div>
                    <div style={{ marginTop: '12px', padding: '8px', background: 'rgba(0,255,136,0.06)', borderRadius: '6px', fontSize: '0.75rem', color: 'var(--neon-green)' }}>
                      ✅ Recommended order: 5,000L — next available delivery: Thursday 8 AM
                    </div>
                  </div>

                  {[
                    { label: 'Avg Daily Consumption', value: '1,842L', color: 'var(--neon-cyan)' },
                    { label: 'Peak Hour Demand', value: '320L/hr', color: 'var(--neon-orange)' },
                    { label: 'Est. Hours to Shortage', value: `${station.hoursToShortage}h`, color: station.hoursToShortage < 6 ? 'var(--neon-red)' : 'var(--neon-green)' },
                    { label: 'Resupply Recommended', value: 'Thursday 8 AM', color: 'var(--neon-purple)' },
                  ].map(m => (
                    <div key={m.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                      <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{m.label}</span>
                      <span style={{ fontSize: '0.875rem', fontWeight: 700, color: m.color }}>{m.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
