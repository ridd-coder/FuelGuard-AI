'use client'

import { useState, useEffect, useCallback } from 'react'
import Sidebar from '@/components/layout/Sidebar'
import Topbar from '@/components/layout/Topbar'
import InteractiveMap from '@/components/maps/InteractiveMap'
import GeminiChatbot from '@/components/chatbot/GeminiChatbot'
import WhatsAppScanner from '@/components/whatsapp/WhatsAppScanner'
import EmergencyOverridePanel from '@/components/dashboard/EmergencyOverridePanel'
import { STATIONS } from '@/lib/simulation'
import type { SimStation } from '@/lib/simulation'
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart,
  RadialBarChart, RadialBar, PieChart, Pie, Cell,
} from 'recharts'
import QRCode from 'qrcode'

const STATUS_COLORS: Record<string, string> = {
  operational: '#00ff88', critical: '#ff7a30', offline: '#ff3366',
}

const CREDIT_COLORS = ['#00d4ff', '#0d1e2e']

interface Booking {
  id: string; stationName: string; slotTime: string
  fuelAmount: number; status: string; qrCode: string
}

interface CreditData { balance: number; used: number; limit: number }

function CreditRing({ balance, limit }: { balance: number; limit: number }) {
  const pct = balance / limit
  const r = 54
  const circ = 2 * Math.PI * r
  const dash = circ * pct
  return (
    <div className="credit-ring-container">
      <svg width="140" height="140" className="credit-ring-svg">
        <circle cx="70" cy="70" r={r} fill="none" stroke="var(--bg-elevated)" strokeWidth="10" />
        <circle cx="70" cy="70" r={r} fill="none"
          stroke="url(#creditGrad)" strokeWidth="10"
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 1s ease', filter: 'drop-shadow(0 0 6px rgba(0,212,255,0.6))' }}
        />
        <defs>
          <linearGradient id="creditGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00d4ff" />
            <stop offset="100%" stopColor="#9b59ff" />
          </linearGradient>
        </defs>
        <text x="70" y="65" textAnchor="middle" fill="var(--text-primary)" fontSize="22" fontWeight="900" fontFamily="Inter">{balance}</text>
        <text x="70" y="82" textAnchor="middle" fill="var(--text-muted)" fontSize="10" fontFamily="Inter">/ {limit} credits</text>
      </svg>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Fuel Credits</div>
        <div style={{ fontSize: '0.75rem', color: 'var(--neon-cyan)', marginTop: '2px' }}>{Math.round(pct * 100)}% remaining</div>
      </div>
    </div>
  )
}

export default function UserDashboard({ initialTab = 'overview' }: { initialTab?: 'overview' | 'book' | 'whatsapp' }) {
  const [stations, setStations] = useState<SimStation[]>(STATIONS)
  const [credits, setCredits] = useState<CreditData>({ balance: 85, used: 15, limit: 100 })
  const [bookings, setBookings] = useState<Booking[]>([])
  const [activeTab, setActiveTab] = useState<'overview' | 'book' | 'whatsapp'>(initialTab)
  const [bookForm, setBookForm] = useState({ stationId: 's1', slotTime: '10:30', fuelAmount: 15 })
  const [showQR, setShowQR] = useState<Booking | null>(null)
  const [qrSrc, setQrSrc] = useState<string>('')
  const [alerts, setAlerts] = useState<{ id: string; message: string; severity: string }[]>([])
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null)
  const [nearestStation, setNearestStation] = useState<SimStation | null>(null)
  const [locationStatus, setLocationStatus] = useState<string>('Locating device...')

  const getDistance = useCallback((lat1: number, lon1: number, lat2: number, lon2: number) => {
    const p = 0.017453292519943295;
    const c = Math.cos;
    const a = 0.5 - c((lat2 - lat1) * p)/2 + c(lat1 * p) * c(lat2 * p) * (1 - c((lon2 - lon1) * p))/2;
    return 12742 * Math.asin(Math.sqrt(a));
  }, [])

  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude })
          setLocationStatus('Live Tracking')
        },
        () => setLocationStatus('Location Denied')
      )
    } else {
      setLocationStatus('Unsupported')
    }
  }, [])

  useEffect(() => {
    if (userLocation && stations.length > 0) {
      let closest = stations[0]
      let minDistance = Infinity
      stations.forEach(s => {
        const d = getDistance(userLocation.lat, userLocation.lng, s.lat, s.lng)
        if (d < minDistance) {
          minDistance = d
          closest = s
        }
      })
      setNearestStation(closest)
    }
  }, [userLocation, stations, getDistance])

  useEffect(() => {
    if (showQR?.qrCode) {
      QRCode.toDataURL(showQR.qrCode, { color: { dark: '#00d4ff', light: '#ffffff' }, margin: 2, width: 160 })
        .then(setQrSrc)
        .catch(console.error)
    } else {
      setQrSrc('')
    }
  }, [showQR])

  const [forecast] = useState(() => {
    return Array.from({ length: 12 }, (_, i) => ({
      time: `${8 + i}:00`,
      demand: Math.round(40 + Math.sin(i * 0.5) * 30 + Math.random() * 15),
      supply: Math.round(60 + Math.cos(i * 0.4) * 20),
    }))
  })

  const loadData = useCallback(async () => {
    try {
      const [stRes, crRes, bkRes, alRes] = await Promise.all([
        fetch('/api/stations'),
        fetch('/api/credits?userId=u1'),
        fetch('/api/bookings?userId=u1'),
        fetch('/api/alerts'),
      ])
      if (stRes.ok) setStations(await stRes.json())
      if (crRes.ok) setCredits(await crRes.json())
      if (bkRes.ok) setBookings(await bkRes.json())
      if (alRes.ok) setAlerts(await alRes.json())
    } catch { /* ignore */ }
  }, [])

  useEffect(() => {
    loadData()
    const interval = setInterval(loadData, 15000)
    return () => clearInterval(interval)
  }, [loadData])

  const handleBook = async () => {
    const station = stations.find(s => s.id === bookForm.stationId)
    if (!station) return
    const cost = bookForm.fuelAmount
    if (credits.balance < cost) { alert('Insufficient fuel credits!'); return }

    const res = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: 'u1', stationId: bookForm.stationId,
        stationName: station.name,
        slotTime: `2026-04-09T${bookForm.slotTime}:00`,
        fuelAmount: bookForm.fuelAmount,
      }),
    })
    if (res.ok) {
      await fetch('/api/credits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 'u1', amount: cost, type: 'debit', reason: `Booking at ${station.name}` }),
      })
      // Record on blockchain
      await fetch('/api/blockchain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'BOOKING', data: { stationId: bookForm.stationId, fuelAmount: bookForm.fuelAmount, userId: 'u1' } }),
      })
      await loadData()
    }
  }

  const operationalCount = stations.filter(s => s.status === 'operational').length
  const criticalCount = stations.filter(s => s.status === 'critical').length

  return (
    <div className="app-shell">
      <Sidebar role="user" />
      <div className="main-content">
        <Topbar title="Citizen Dashboard" subtitle="Your personal fuel management portal" crisisLevel="medium" />
        <div className="page-content">

          {/* KPI row */}
          <div className="grid-4">
            {[
              { label: 'Fuel Credits', value: credits.balance, unit: 'pts', color: 'var(--neon-cyan)', icon: '💳', change: '-15 this week' },
              { label: 'Stations Available', value: operationalCount, unit: `/${stations.length}`, color: 'var(--neon-green)', icon: '⛽', change: `${criticalCount} critical` },
              { label: 'Active Bookings', value: bookings.filter(b => b.status !== 'completed').length, unit: '', color: 'var(--neon-purple)', icon: '📅', change: 'Next: 10:30 AM' },
              { label: 'Avg Wait Time', value: 18, unit: 'min', color: 'var(--neon-orange)', icon: '⏱', change: '↑ +5 min peak' },
            ].map(k => (
              <div key={k.label} className="stat-card" style={{ '--accent-color': k.color } as React.CSSProperties}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <div className="stat-label">{k.label}</div>
                  <div style={{ fontSize: '1.25rem' }}>{k.icon}</div>
                </div>
                <div className="stat-value" style={{ background: `linear-gradient(135deg, ${k.color}, var(--text-secondary))`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                  {k.value}<span style={{ fontSize: '1rem', fontWeight: 600 }}>{k.unit}</span>
                </div>
                <div className="stat-change neutral">{k.change}</div>
              </div>
            ))}
          </div>

          {/* Tab switcher */}
          <div className="tabs" style={{ maxWidth: '400px' }}>
            {(['overview', 'book', 'whatsapp'] as const).map(t => (
              <button key={t} className={`tab-btn ${activeTab === t ? 'active' : ''}`} onClick={() => setActiveTab(t)}>
                {t === 'overview' ? '🗺️ Map View' : t === 'book' ? '📅 Book Slot' : '📱 WhatsApp'}
              </button>
            ))}
          </div>

          {activeTab === 'overview' && (
            <>
              <div className="grid-3-1" style={{ alignItems: 'start' }}>
                {/* Map */}
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                  <div className="card-header" style={{ padding: '16px 20px 12px' }}>
                    <span className="card-title">Live Fuel Map</span>
                    <div className="live-badge"><span className="pulse-dot green" />LIVE</div>
                  </div>
                  <InteractiveMap stations={stations} height={380} userLocation={userLocation} />
                </div>

                {/* Right col */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div className="card" style={{ display: 'flex', justifyContent: 'center', padding: '24px 16px' }}>
                    <CreditRing balance={credits.balance} limit={credits.limit} />
                  </div>

                  {/* Nearest Station */}
                  <div className="card">
                    <div className="card-header">
                      <span className="card-title">Nearest to You</span>
                      <span className="badge badge-info">{locationStatus}</span>
                    </div>
                    <div style={{ padding: '4px 0' }}>
                      {nearestStation && userLocation ? (
                        <>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>{nearestStation.name}</div>
                            <span className="pulse-dot" style={{ background: STATUS_COLORS[nearestStation.status], boxShadow: `0 0 6px ${STATUS_COLORS[nearestStation.status]}` }} />
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                            {getDistance(userLocation.lat, userLocation.lng, nearestStation.lat, nearestStation.lng).toFixed(1)} km away · {nearestStation.zone}
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '12px' }}>
                            <div style={{ background: 'var(--bg-elevated)', padding: '6px 10px', borderRadius: '6px', fontSize: '0.75rem' }}>
                                <span style={{ color: 'var(--text-muted)' }}>Stock:</span> <span style={{ color: 'var(--neon-green)', fontWeight: 600 }}>{Math.round(nearestStation.currentStock / nearestStation.maxCapacity * 100)}%</span>
                            </div>
                            <div style={{ background: 'var(--bg-elevated)', padding: '6px 10px', borderRadius: '6px', fontSize: '0.75rem' }}>
                                <span style={{ color: 'var(--text-muted)' }}>Queue:</span> <span style={{ color: 'var(--neon-orange)', fontWeight: 600 }}>{nearestStation.queueLength} cars</span>
                            </div>
                          </div>
                          <button 
                            className="btn btn-ghost btn-sm w-full mt-4" 
                            style={{ border: '1px solid var(--neon-cyan)', color: 'var(--neon-cyan)' }}
                            onClick={() => {
                              setBookForm({ ...bookForm, stationId: nearestStation.id })
                              setActiveTab('book')
                            }}>
                            Book Here
                          </button>
                        </>
                      ) : (
                         <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', padding: '16px' }}>
                           {locationStatus === 'Locating device...' ? 'Finding your nearest pump...' : 'Location unaivalable. Enable GPS.'}
                         </div>
                      )}
                    </div>
                  </div>

                  {/* Shortage risk list */}
                  <div className="card">
                    <div className="card-header">
                      <span className="card-title">Risk Zones</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--neon-orange)' }}>⚠ {criticalCount} critical</span>
                    </div>
                    <div className="scroll-list" style={{ maxHeight: 200 }}>
                      {stations.sort((a, b) => b.riskScore - a.riskScore).slice(0, 5).map(s => (
                        <div key={s.id} style={{ display: 'flex', gap: '10px', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                          <span className="pulse-dot" style={{
                            background: STATUS_COLORS[s.status], boxShadow: `0 0 6px ${STATUS_COLORS[s.status]}`,
                          }} />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.name}</div>
                            <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>{s.zone}</div>
                          </div>
                          <div style={{ textAlign: 'right', flexShrink: 0 }}>
                            <div style={{ fontSize: '0.875rem', fontWeight: 700, color: s.riskScore > 70 ? 'var(--neon-red)' : s.riskScore > 40 ? 'var(--neon-orange)' : 'var(--neon-green)' }}>{s.riskScore}%</div>
                            <div style={{ fontSize: '0.625rem', color: 'var(--text-muted)' }}>risk</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom row */}
              <div className="grid-2">
                {/* Demand chart */}
                <div className="card">
                  <div className="card-header">
                    <span className="card-title">Today&apos;s Demand Forecast</span>
                    <span className="badge badge-info">AI Predicted</span>
                  </div>
                  <ResponsiveContainer width="100%" height={180}>
                    <AreaChart data={forecast} margin={{ top: 5, right: 10, bottom: 0, left: -20 }}>
                      <defs>
                        <linearGradient id="demandGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#00d4ff" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="supplyGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#00ff88" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="#00ff88" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="time" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: '8px', fontSize: '0.75rem' }} />
                      <Area type="monotone" dataKey="demand" stroke="#00d4ff" fill="url(#demandGrad)" strokeWidth={2} dot={false} name="Demand" />
                      <Area type="monotone" dataKey="supply" stroke="#00ff88" fill="url(#supplyGrad)" strokeWidth={2} dot={false} name="Supply" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* Chatbot */}
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                  <GeminiChatbot />
                </div>
              </div>

              {/* Alerts */}
              {alerts.length > 0 && (
                <div className="card">
                  <div className="card-header">
                    <span className="card-title">Active Alerts</span>
                    <span className="badge badge-warning">{alerts.filter(a => !('resolved' in a && a.resolved)).length} open</span>
                  </div>
                  <div className="scroll-list">
                    {alerts.slice(0, 4).map(a => (
                      <div key={a.id} className={`alert-item alert-${a.severity}`}>
                        <span className="alert-icon">{a.severity === 'critical' ? '🔴' : a.severity === 'high' ? '🟠' : a.severity === 'medium' ? '🟡' : '🔵'}</span>
                        <div className="alert-content">
                          <div className="alert-msg">{a.message}</div>
                          <div className="alert-meta"><span className="badge badge-warning" style={{ fontSize: '0.625rem' }}>{a.severity.toUpperCase()}</span></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {activeTab === 'book' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Emergency Priority Override — full width */}
              <EmergencyOverridePanel
                stations={stations}
                creditsBalance={credits.balance}
                onCreditDeducted={loadData}
              />

              {/* Standard booking + bookings list */}
              <div className="grid-2" style={{ alignItems: 'start' }}>
              {/* Booking form */}
              <div className="card">
                <div className="card-header">
                  <span className="card-title">Book a Fuel Slot</span>
                  <span className="badge badge-info">💳 {credits.balance} credits</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Select Station</label>
                    <select className="form-select" value={bookForm.stationId} onChange={e => setBookForm(p => ({ ...p, stationId: e.target.value }))}>
                      {stations.filter(s => s.status !== 'offline').map(s => (
                        <option key={s.id} value={s.id}>{s.name} — {Math.round(s.currentStock / s.maxCapacity * 100)}% stock · {s.queueLength} in queue</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Time Slot</label>
                    <select className="form-select" value={bookForm.slotTime} onChange={e => setBookForm(p => ({ ...p, slotTime: e.target.value }))}>
                      {['07:00', '08:30', '10:00', '10:30', '12:00', '14:15', '16:00', '17:30', '19:00', '20:30'].map(t => (
                        <option key={t} value={t}>{t} {['07:00', '20:30', '19:00'].includes(t) ? '⭐ Low demand' : ''}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Fuel Amount: <strong style={{ color: 'var(--neon-cyan)' }}>{bookForm.fuelAmount}L</strong> = {bookForm.fuelAmount} credits</label>
                    <input type="range" min="5" max="40" step="5" value={bookForm.fuelAmount}
                      onChange={e => setBookForm(p => ({ ...p, fuelAmount: Number(e.target.value) }))}
                      style={{ accentColor: 'var(--neon-cyan)', width: '100%' }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                      <span>5L min</span><span>40L max (AI limit)</span>
                    </div>
                  </div>
                  <div style={{
                    background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)',
                    borderRadius: '8px', padding: '12px',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '6px' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Credit Cost</span>
                      <span style={{ color: 'var(--neon-cyan)', fontWeight: 700 }}>{bookForm.fuelAmount} credits</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Remaining After</span>
                      <span style={{ color: credits.balance - bookForm.fuelAmount < 20 ? 'var(--neon-red)' : 'var(--neon-green)', fontWeight: 700 }}>
                        {credits.balance - bookForm.fuelAmount} credits
                      </span>
                    </div>
                  </div>
                  <button className="btn btn-primary w-full" onClick={handleBook}
                    disabled={credits.balance < bookForm.fuelAmount}
                    style={{ padding: '12px', fontSize: '1rem', fontWeight: 700 }}>
                    📅 Confirm Booking + Generate QR
                  </button>
                </div>
              </div>

              {/* Bookings list */}
              <div className="card">
                <div className="card-header">
                  <span className="card-title">My Bookings</span>
                  <span className="badge badge-info">{bookings.length} total</span>
                </div>
                <div className="scroll-list">
                  {bookings.map(b => (
                    <div key={b.id} style={{
                      padding: '12px', background: 'var(--bg-elevated)',
                      borderRadius: '8px', border: '1px solid var(--border-subtle)',
                      display: 'flex', flexDirection: 'column', gap: '6px',
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>{b.stationName}</span>
                        <span className={`badge badge-${b.status === 'confirmed' ? 'info' : b.status === 'completed' ? 'operational' : 'warning'}`}>
                          {b.status}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        🕐 {new Date(b.slotTime).toLocaleString('en-IN', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })}
                        &nbsp;·&nbsp; ⛽ {b.fuelAmount}L &nbsp;·&nbsp; 💳 {b.fuelAmount} credits
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.6875rem', fontFamily: 'monospace', color: 'var(--neon-cyan)', background: 'var(--neon-cyan-subtle)', padding: '2px 8px', borderRadius: '4px' }}>
                          QR: {b.qrCode}
                        </span>
                        {b.status !== 'completed' && (
                          <button className="btn btn-ghost btn-sm" onClick={() => setShowQR(b)}>View QR</button>
                        )}
                      </div>
                    </div>
                  ))}
                  {bookings.length === 0 && (
                    <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '32px', fontSize: '0.875rem' }}>
                      No bookings yet. Book your first slot above!
                    </div>
                  )}
                </div>
              </div>
              </div>
            </div>
          )}

          {activeTab === 'whatsapp' && (
            <div className="grid-2-1" style={{ alignItems: 'start' }}>
              <div className="card" style={{ padding: '16px' }}>
                <div className="card-header">
                  <span className="card-title">WhatsApp Web Scanner</span>
                  <span className="badge" style={{ background: 'rgba(37,211,102,0.12)', color: '#25D366', border: '1px solid rgba(37,211,102,0.25)' }}>WEB AUTOMATION</span>
                </div>
                <WhatsAppScanner />
              </div>
              <div className="card">
                <div className="card-header"><span className="card-title">Usage Guide</span></div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {[
                    { icon: '1️⃣', title: 'Open WhatsApp Web', desc: 'Scan QR with your phone. The platform captures your session.' },
                    { icon: '2️⃣', title: 'Message the FuelGuard Bot', desc: 'Send queries like "nearest petrol pump" or "book 10L for 5pm"' },
                    { icon: '3️⃣', title: 'AI Processes Intent', desc: 'NLP engine detects intent: availability_check, booking, credit_check, etc.' },
                    { icon: '4️⃣', title: 'Auto-Reply Sent', desc: 'Bot replies with station info, booking confirmation, or QR code link' },
                    { icon: '5️⃣', title: 'Receive Alerts', desc: 'Subscribe to get proactive shortage warnings 2 hours in advance' },
                  ].map(step => (
                    <div key={step.icon} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                      <span style={{ fontSize: '1.25rem', flexShrink: 0 }}>{step.icon}</span>
                      <div>
                        <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '2px' }}>{step.title}</div>
                        <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>{step.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* QR Modal */}
      {showQR && (
        <div className="modal-overlay" onClick={() => setShowQR(null)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>Fuel Booking QR</div>
              {/* QR Render */}
              {qrSrc ? (
                 <img src={qrSrc} alt="QR Code" width={160} height={160} style={{ margin: '0 auto 16px', display: 'block', boxShadow: '0 0 30px rgba(0,212,255,0.3)', borderRadius: '12px', background: 'white', padding: '8px' }} />
              ) : (
                <div style={{
                  width: '160px', height: '160px', margin: '0 auto 16px',
                  background: 'white', borderRadius: '12px', padding: '12px',
                  display: 'grid', gridTemplateColumns: 'repeat(10,1fr)', gap: '2px',
                  boxShadow: '0 0 30px rgba(0,212,255,0.3)',
                }}>
                  {Array.from({ length: 100 }, (_, i) => (
                    <div key={i} style={{ background: Math.random() > 0.5 ? '#000' : '#fff', borderRadius: '1px' }} />
                  ))}
                </div>
              )}
              <div style={{ fontSize: '1.125rem', fontWeight: 900, color: 'var(--neon-cyan)', fontFamily: 'monospace', marginBottom: '8px' }}>{showQR.qrCode}</div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '4px' }}>{showQR.stationName}</div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                {new Date(showQR.slotTime).toLocaleString('en-IN')} · {showQR.fuelAmount}L
              </div>
              <div style={{ marginTop: '20px', padding: '10px', background: 'var(--bg-elevated)', borderRadius: '8px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Show this QR at the fuel station counter for verification
              </div>
              <button className="btn btn-ghost w-full mt-4" onClick={() => setShowQR(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
