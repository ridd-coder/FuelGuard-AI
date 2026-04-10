'use client'

import { useState, useEffect, useCallback } from 'react'
import type { SimStation } from '@/lib/simulation'
import type { EmergencyOverride } from '@/app/api/emergency/route'

interface Props {
  stations: SimStation[]
  creditsBalance: number
  onCreditDeducted: () => void
}

const VEHICLE_TYPES = [
  { value: 'ambulance',    label: '🚑 Ambulance',        priority: 'CRITICAL' },
  { value: 'fire_engine',  label: '🚒 Fire Engine',       priority: 'CRITICAL' },
  { value: 'police',       label: '🚔 Police Vehicle',    priority: 'HIGH' },
  { value: 'military',     label: '🪖 Military Vehicle',  priority: 'CRITICAL' },
  { value: 'disaster',     label: '🆘 Disaster Relief',   priority: 'CRITICAL' },
  { value: 'government',   label: '🏛️ Government Convoy', priority: 'HIGH' },
  { value: 'press',        label: '📡 Press / Media',     priority: 'HIGH' },
]

const LEVEL_META = {
  critical: {
    label:   'CRITICAL',
    color:   '#ff3366',
    glow:    'rgba(255,51,102,0.45)',
    bg:      'rgba(255,51,102,0.08)',
    border:  'rgba(255,51,102,0.35)',
    eta:     3,
    mult:    3,
    desc:    'Immediate dispatch · Bypasses all queues · 3× credit rate',
  },
  high: {
    label:   'HIGH',
    color:   '#ff7a30',
    glow:    'rgba(255,122,48,0.4)',
    bg:      'rgba(255,122,48,0.08)',
    border:  'rgba(255,122,48,0.3)',
    eta:     8,
    mult:    2,
    desc:    'Express lane · Skips normal slots · 2× credit rate',
  },
}

function ETACountdown({ dispatchedAt, etaMinutes, status }: { dispatchedAt: string; etaMinutes: number; status: string }) {
  const [remaining, setRemaining] = useState(0)

  useEffect(() => {
    const calc = () => {
      const elapsed = (Date.now() - new Date(dispatchedAt).getTime()) / 1000
      const totalSecs = etaMinutes * 60
      const rem = Math.max(0, Math.round(totalSecs - elapsed))
      setRemaining(rem)
    }
    calc()
    const id = setInterval(calc, 1000)
    return () => clearInterval(id)
  }, [dispatchedAt, etaMinutes])

  if (status === 'arrived' || status === 'completed') {
    return <span style={{ color: '#00ff88', fontWeight: 800 }}>✅ Arrived</span>
  }

  const mins = Math.floor(remaining / 60)
  const secs = remaining % 60
  const pct  = Math.max(0, Math.min(100, (1 - remaining / (etaMinutes * 60)) * 100))

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{ position: 'relative', width: 36, height: 36 }}>
        <svg width="36" height="36" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx="18" cy="18" r="14" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="3" />
          <circle cx="18" cy="18" r="14" fill="none" stroke="#ff3366" strokeWidth="3"
            strokeDasharray={`${2 * Math.PI * 14}`}
            strokeDashoffset={`${2 * Math.PI * 14 * (1 - pct / 100)}`}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1s linear', filter: 'drop-shadow(0 0 4px #ff3366)' }}
          />
        </svg>
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '0.5rem', fontWeight: 900, color: '#ff3366',
        }}>
          {mins}:{String(secs).padStart(2, '0')}
        </div>
      </div>
      <div>
        <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#ff3366' }}>
          ETA {mins}m {secs}s
        </div>
        <div style={{ fontSize: '0.625rem', color: 'var(--text-muted)' }}>Fuel tanker en route</div>
      </div>
    </div>
  )
}

export default function EmergencyOverridePanel({ stations, creditsBalance, onCreditDeducted }: Props) {
  const [expanded,    setExpanded]    = useState(false)
  const [activating,  setActivating]  = useState(false)
  const [activeAlert, setActiveAlert] = useState<string | null>(null)
  const [overrides,   setOverrides]   = useState<EmergencyOverride[]>([])

  const [form, setForm] = useState({
    vehicleType:    'ambulance',
    vehicleReg:     '',
    emergencyLevel: 'critical' as 'critical' | 'high',
    reason:         '',
    fuelAmount:     20,
    stationId:      stations[0]?.id ?? 's1',
  })

  const fetchOverrides = useCallback(async () => {
    try {
      const res = await fetch('/api/emergency')
      if (res.ok) setOverrides(await res.json())
    } catch { /* ignore */ }
  }, [])

  useEffect(() => {
    fetchOverrides()
    const id = setInterval(fetchOverrides, 5000)
    return () => clearInterval(id)
  }, [fetchOverrides])

  const selectedVehicle = VEHICLE_TYPES.find(v => v.value === form.vehicleType)
  const level   = LEVEL_META[form.emergencyLevel]
  const cost    = form.fuelAmount * level.mult
  const station = stations.find(s => s.id === form.stationId)

  const canActivate = (
    form.vehicleReg.trim().length >= 3 &&
    creditsBalance >= cost &&
    station?.status !== 'offline'
  )

  const activate = async () => {
    if (!canActivate) return
    setActivating(true)
    try {
      const res = await fetch('/api/emergency', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          stationName: station?.name ?? 'Unknown',
        }),
      })
      if (res.ok) {
        const { override } = await res.json()
        setActiveAlert(override.id)
        setExpanded(false)
        onCreditDeducted()
        await fetchOverrides()
      }
    } catch { /* ignore */ }
    setActivating(false)
  }

  const hasActiveOverrides = overrides.some(o => o.status !== 'completed')

  return (
    <div style={{ marginBottom: 0 }}>

      {/* ── Live Active Overrides ─────────────────────────────────────── */}
      {overrides.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
          {overrides.map(ov => {
            const lv = LEVEL_META[ov.emergencyLevel]
            return (
              <div key={ov.id} style={{
                background: lv.bg,
                border: `1px solid ${lv.border}`,
                borderLeft: `4px solid ${lv.color}`,
                borderRadius: 12,
                padding: '14px 16px',
                display: 'flex', flexDirection: 'column', gap: 10,
                boxShadow: `0 0 24px ${lv.glow}`,
                animation: ov.status === 'dispatched' ? 'emergencyglow 2s ease-in-out infinite' : 'none',
              }}>
                {/* Top row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      background: lv.color, borderRadius: 99,
                      padding: '3px 12px',
                      fontSize: '0.6875rem', fontWeight: 900, color: 'white',
                      letterSpacing: '0.08em',
                      boxShadow: `0 0 12px ${lv.glow}`,
                      animation: 'pulselabel 1.5s ease-in-out infinite',
                    }}>
                      🚨 {lv.label} OVERRIDE
                    </div>
                    <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: lv.color, fontWeight: 800 }}>
                      {ov.id}
                    </span>
                  </div>
                  <ETACountdown
                    dispatchedAt={ov.dispatchedAt}
                    etaMinutes={ov.eta}
                    status={ov.status}
                  />
                </div>

                {/* Details grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
                  {[
                    { label: 'Vehicle', value: VEHICLE_TYPES.find(v => v.value === ov.vehicleType)?.label ?? ov.vehicleType },
                    { label: 'Reg No', value: ov.vehicleReg.toUpperCase() },
                    { label: 'Station', value: ov.stationName },
                    { label: 'Fuel', value: `${ov.fuelAmount}L` },
                  ].map(d => (
                    <div key={d.label} style={{
                      background: 'var(--bg-card)', borderRadius: 8,
                      padding: '8px 10px',
                    }}>
                      <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 3 }}>{d.label}</div>
                      <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)' }}>{d.value}</div>
                    </div>
                  ))}
                </div>

                {/* Bottom row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {ov.reason && <span>📋 {ov.reason}</span>}
                  </div>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: lv.color, background: `${lv.color}18`, padding: '2px 10px', borderRadius: 6 }}>
                      🔑 {ov.qrCode}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      💳 {ov.creditCost} credits
                    </span>
                    <span style={{
                      fontSize: '0.6875rem', fontWeight: 700,
                      color: ov.status === 'arrived' ? '#00ff88' : ov.status === 'dispatched' ? lv.color : '#aaa',
                    }}>
                      {ov.status === 'dispatched' ? '🚛 En Route' : ov.status === 'arrived' ? '✅ Arrived' : '✔ Complete'}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── Override Trigger Card ─────────────────────────────────────── */}
      <div style={{
        background: expanded
          ? 'linear-gradient(135deg, rgba(255,51,102,0.07), rgba(255,122,48,0.04))'
          : 'linear-gradient(135deg, rgba(255,51,102,0.05), rgba(10,21,32,0))',
        border: `1px solid ${expanded ? 'rgba(255,51,102,0.35)' : 'rgba(255,51,102,0.2)'}`,
        borderRadius: 14,
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        boxShadow: expanded ? '0 0 40px rgba(255,51,102,0.15)' : 'none',
      }}>

        {/* Header — always visible */}
        <button
          onClick={() => setExpanded(e => !e)}
          style={{
            width: '100%', background: 'none', border: 'none', cursor: 'pointer',
            padding: '16px 20px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            textAlign: 'left',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            {/* Flashing siren icon */}
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: 'linear-gradient(135deg, #ff3366, #ff7a30)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.4rem', flexShrink: 0,
              boxShadow: '0 0 20px rgba(255,51,102,0.5)',
              animation: hasActiveOverrides ? 'sirenFlash 1s ease-in-out infinite' : 'none',
            }}>
              🚨
            </div>
            <div>
              <div style={{ fontSize: '1rem', fontWeight: 900, color: '#ff3366', letterSpacing: '0.02em' }}>
                Emergency Priority Override
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
                Instant fuel access for essential vehicles · Bypasses all queues
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {hasActiveOverrides && (
              <span style={{
                background: '#ff3366', color: 'white',
                fontSize: '0.625rem', fontWeight: 900, padding: '3px 10px',
                borderRadius: 99, letterSpacing: '0.08em',
                boxShadow: '0 0 12px rgba(255,51,102,0.5)',
                animation: 'pulselabel 1.5s ease-in-out infinite',
              }}>
                {overrides.filter(o => o.status !== 'completed').length} ACTIVE
              </span>
            )}
            <div style={{
              width: 28, height: 28, borderRadius: '50%',
              background: 'rgba(255,51,102,0.12)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#ff3366', fontWeight: 900, fontSize: '1rem',
              transition: 'transform 0.25s',
              transform: expanded ? 'rotate(180deg)' : 'none',
            }}>
              ▾
            </div>
          </div>
        </button>

        {/* Expandable form */}
        {expanded && (
          <div style={{ padding: '0 20px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Emergency level selector */}
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
                Emergency Level
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {(['critical', 'high'] as const).map(lvKey => {
                  const lv = LEVEL_META[lvKey]
                  const selected = form.emergencyLevel === lvKey
                  return (
                    <button
                      key={lvKey}
                      onClick={() => setForm(f => ({ ...f, emergencyLevel: lvKey }))}
                      style={{
                        background: selected ? lv.bg : 'var(--bg-elevated)',
                        border: `2px solid ${selected ? lv.color : 'var(--border-subtle)'}`,
                        borderRadius: 10, padding: '12px 14px',
                        cursor: 'pointer', textAlign: 'left',
                        boxShadow: selected ? `0 0 20px ${lv.glow}` : 'none',
                        transition: 'all 0.2s',
                      }}
                    >
                      <div style={{ fontSize: '0.875rem', fontWeight: 900, color: lv.color, marginBottom: 4 }}>
                        {selected ? '◉' : '○'} {lv.label}
                      </div>
                      <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                        {lv.desc}
                      </div>
                      <div style={{ marginTop: 8, fontSize: '0.75rem', fontWeight: 800, color: lv.color }}>
                        ETA {lv.eta} min · {lv.mult}× credits
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Vehicle type */}
            <div className="form-group">
              <label className="form-label">Vehicle Type</label>
              <select className="form-select" value={form.vehicleType}
                onChange={e => {
                  const vt = VEHICLE_TYPES.find(v => v.value === e.target.value)
                  setForm(f => ({
                    ...f,
                    vehicleType: e.target.value,
                    emergencyLevel: (vt?.priority.toLowerCase() ?? 'high') as 'critical' | 'high',
                  }))
                }}>
                {VEHICLE_TYPES.map(v => <option key={v.value} value={v.value}>{v.label}</option>)}
              </select>
            </div>

            {/* Vehicle reg + station */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label className="form-label">Vehicle Registration</label>
                <input
                  type="text" className="form-input"
                  placeholder="MH-01-AB-1234"
                  value={form.vehicleReg}
                  onChange={e => setForm(f => ({ ...f, vehicleReg: e.target.value.toUpperCase() }))}
                  style={{ fontFamily: 'monospace', textTransform: 'uppercase', border: form.vehicleReg.length < 3 ? '1px solid rgba(255,51,102,0.4)' : undefined }}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Nearest Station</label>
                <select className="form-select" value={form.stationId}
                  onChange={e => setForm(f => ({ ...f, stationId: e.target.value }))}>
                  {stations.filter(s => s.status !== 'offline').map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} — {s.queueLength} queue
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Fuel amount slider */}
            <div className="form-group">
              <label className="form-label">
                Fuel Required: <strong style={{ color: '#ff3366' }}>{form.fuelAmount}L</strong>
              </label>
              <input type="range" min="10" max="100" step="5"
                value={form.fuelAmount}
                onChange={e => setForm(f => ({ ...f, fuelAmount: Number(e.target.value) }))}
                style={{ width: '100%', accentColor: '#ff3366' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                <span>10L</span><span>100L (emergency max)</span>
              </div>
            </div>

            {/* Reason */}
            <div className="form-group">
              <label className="form-label">Emergency Reason <span style={{ color: 'var(--text-muted)' }}>(optional)</span></label>
              <input type="text" className="form-input"
                placeholder="e.g. Active fire at industrial zone, patient transport..."
                value={form.reason}
                onChange={e => setForm(f => ({ ...f, reason: e.target.value }))}
              />
            </div>

            {/* Credit breakdown */}
            <div style={{
              background: form.emergencyLevel === 'critical' ? 'rgba(255,51,102,0.08)' : 'rgba(255,122,48,0.08)',
              border: `1px solid ${level.border}`,
              borderRadius: 10, padding: '14px 16px',
            }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: level.color, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
                💳 Credit Breakdown
              </div>
              {[
                { label: 'Base fuel cost', value: `${form.fuelAmount} credits` },
                { label: `Emergency surcharge (${level.mult}×)`, value: `+${form.fuelAmount * (level.mult - 1)} credits`, color: level.color },
                { label: 'Total deduction', value: `${cost} credits`, color: level.color, bold: true },
                { label: 'Balance after', value: `${creditsBalance - cost} credits`, color: creditsBalance - cost < 20 ? '#ff3366' : '#00ff88', bold: true },
              ].map(row => (
                <div key={row.label} style={{
                  display: 'flex', justifyContent: 'space-between',
                  fontSize: row.bold ? '0.875rem' : '0.8125rem',
                  fontWeight: row.bold ? 800 : 500,
                  marginBottom: 5,
                  color: (row as { color?: string }).color ?? 'var(--text-muted)',
                  borderTop: row.bold ? `1px solid ${level.border}` : 'none',
                  paddingTop: row.bold ? 8 : 0,
                }}>
                  <span>{row.label}</span><span>{row.value}</span>
                </div>
              ))}
            </div>

            {/* Activate button */}
            <button
              onClick={activate}
              disabled={!canActivate || activating}
              style={{
                background: canActivate
                  ? 'linear-gradient(135deg, #ff3366 0%, #ff7a30 100%)'
                  : 'var(--bg-elevated)',
                border: 'none', borderRadius: 12,
                padding: '16px 24px',
                fontSize: '1rem', fontWeight: 900,
                color: canActivate ? 'white' : 'var(--text-muted)',
                cursor: canActivate && !activating ? 'pointer' : 'not-allowed',
                letterSpacing: '0.04em',
                boxShadow: canActivate ? '0 4px 32px rgba(255,51,102,0.45)' : 'none',
                transition: 'all 0.2s',
                animation: canActivate && !activating ? 'chargepulse 2s ease-in-out infinite' : 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              }}
              onMouseEnter={e => { if (canActivate) (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'none' }}
            >
              {activating ? (
                <>
                  <span style={{ width: 18, height: 18, border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />
                  Activating Override...
                </>
              ) : (
                <>
                  🚨 ACTIVATE EMERGENCY OVERRIDE
                </>
              )}
            </button>

            {!canActivate && (
              <div style={{ textAlign: 'center', fontSize: '0.75rem', color: '#ff3366', marginTop: -8 }}>
                {creditsBalance < cost
                  ? `⚠ Insufficient credits (need ${cost}, have ${creditsBalance})`
                  : form.vehicleReg.trim().length < 3
                    ? '⚠ Enter a valid vehicle registration number'
                    : '⚠ Selected station is offline'}
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes sirenFlash   { 0%,100%{box-shadow:0 0 20px rgba(255,51,102,0.5)}  50%{box-shadow:0 0 40px rgba(255,51,102,0.9)} }
        @keyframes pulselabel   { 0%,100%{opacity:1} 50%{opacity:0.65} }
        @keyframes emergencyglow{ 0%,100%{box-shadow:0 0 20px rgba(255,51,102,0.2)} 50%{box-shadow:0 0 36px rgba(255,51,102,0.45)} }
        @keyframes chargepulse  { 0%,100%{box-shadow:0 4px 32px rgba(255,51,102,0.45)} 50%{box-shadow:0 4px 48px rgba(255,51,102,0.7)} }
        @keyframes spin         { to{transform:rotate(360deg)} }
      `}</style>
    </div>
  )
}
