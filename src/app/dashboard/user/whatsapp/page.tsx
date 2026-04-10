'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

const PHONE = '+916374987762'

type Status = 'initializing' | 'qr_ready' | 'authenticated' | 'ready' | 'disconnected'

interface WAMessage {
  id: string
  from: string
  phone: string
  body: string
  timestamp: string
  intent: string
  reply: string
  bookingId?: string
  qrCode?: string
}

interface WABooking {
  id: string
  stationName: string
  slotTime: string
  fuelAmount: number
  status: string
  qrCode: string
  fromPhone: string
  createdAt: string
}

const INTENT_COLORS: Record<string, string> = {
  booking:            '#00ff88',
  availability_check: '#00d4ff',
  credit_check:       '#9b59ff',
  alert_setup:        '#ffd700',
  unknown:            '#aaa',
}
const INTENT_LABELS: Record<string, string> = {
  booking:            '📅 Booking',
  availability_check: '📍 Availability',
  credit_check:       '💳 Credits',
  alert_setup:        '🔔 Alert Setup',
  unknown:            '💬 General',
}

const DEMO_MSGS = [
  { label: 'Book 15L at 10am', msg: 'Book 15L petrol for today at 10am' },
  { label: 'Nearest pump?',    msg: 'Which is the nearest open petrol pump?' },
  { label: 'My credits?',      msg: 'What is my fuel credits balance?' },
  { label: 'Book 20L at 6pm', msg: 'Reserve 20 litres for 6pm today' },
  { label: 'Shortage alert',   msg: 'Notify me before any fuel shortage in North zone' },
]

const STATUS_META: Record<Status, { label: string; color: string; pulse: boolean; desc: string }> = {
  initializing:  { label: '⏳ Initializing',   color: '#ffd700', pulse: false, desc: 'Starting WhatsApp Web client…' },
  qr_ready:      { label: '📱 Scan QR Code',   color: '#25D366', pulse: true,  desc: 'Scan the QR below with the WhatsApp linked to '+PHONE },
  authenticated: { label: '🔐 Authenticated',  color: '#25D366', pulse: false, desc: 'Session authenticated — loading…' },
  ready:         { label: '✅ Connected',       color: '#00ff88', pulse: true,  desc: 'Live — any message to '+PHONE+' appears instantly below' },
  disconnected:  { label: '❌ Disconnected',   color: '#ff3366', pulse: false, desc: 'Session ended. Refresh the page to re-link.' },
}

export default function WhatsAppPage() {
  const [status,    setStatus]    = useState<Status>('initializing')
  const [qrDataUrl, setQrDataUrl] = useState('')
  const [messages,  setMessages]  = useState<WAMessage[]>([])
  const [bookings,  setBookings]  = useState<WABooking[]>([])
  const [customMsg, setCustomMsg] = useState('')
  const [sending,   setSending]   = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/whatsapp')
      if (!res.ok) return
      const d = await res.json()
      setStatus(d.status)
      setQrDataUrl(d.qrDataUrl || '')
      // Filter out empty-body / system messages before displaying
      setMessages((d.messages || []).filter((m: WAMessage) => m.body && m.body.trim().length > 0))
      setBookings(d.bookings || [])
    } catch { /* ignore */ }
  }, [])

  // Poll every 2 s while connecting, 4 s once ready
  useEffect(() => {
    fetchData()
    // Always poll every 2s so real WhatsApp messages appear immediately
    const id = setInterval(fetchData, 2000)
    return () => clearInterval(id)
  }, [fetchData])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendDemo = async (text: string) => {
    if (!text.trim()) return
    setSending(true)
    try {
      await fetch('/api/whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ from: 'Demo User', phone: PHONE, message: text }),
      })
      setCustomMsg('')
      await fetchData()
    } catch { /* ignore */ }
    setSending(false)
  }

  const sm = STATUS_META[status]

  return (
    <div className="dashboard-content">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">WhatsApp Integration</h1>
          <p className="dashboard-subtitle" style={{ marginTop: '0.5rem' }}>
            Link your WhatsApp account — messages to <strong style={{ color: '#25D366' }}>{PHONE}</strong> appear here in real-time
          </p>
        </div>
        {/* Status badge */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: 'rgba(37,211,102,0.08)',
          border: `1px solid ${sm.color}44`,
          borderRadius: 99, padding: '6px 16px',
          fontSize: '0.8125rem', fontWeight: 700, color: sm.color,
        }}>
          {sm.pulse && (
            <span style={{
              width: 8, height: 8, borderRadius: '50%',
              background: sm.color, boxShadow: `0 0 8px ${sm.color}`,
              display: 'inline-block', animation: 'waglow 1.4s ease-in-out infinite',
            }} />
          )}
          {sm.label}
        </div>
      </div>

      {/* ── Stats ───────────────────────────────────────────────────────── */}
      <div className="grid-4" style={{ marginTop: '1.5rem' }}>
        {[
          { label: 'Connection Status', value: sm.label.replace(/^.+? /, ''), color: sm.color,           icon: '📡' },
          { label: 'Messages Received', value: messages.length,              color: '#25D366',            icon: '💬' },
          { label: 'WA Bookings',       value: bookings.length,              color: 'var(--neon-cyan)',   icon: '📅' },
          { label: 'Linked Phone',      value: PHONE,                        color: 'var(--neon-purple)', icon: '📱', small: true },
        ].map(s => (
          <div key={s.label} className="stat-card" style={{ '--accent-color': s.color } as React.CSSProperties}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom: 8 }}>
              <div className="stat-label">{s.label}</div>
              <span style={{ fontSize: '1.25rem' }}>{s.icon}</span>
            </div>
            <div className="stat-value" style={{
              fontSize: (s as {small?:boolean}).small ? '0.9rem' : undefined,
              background: `linear-gradient(135deg, ${s.color}, var(--text-secondary))`,
              WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text',
            }}>
              {s.value}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: 24, marginTop: 24, alignItems: 'start' }}>

        {/* ── Left column: QR + instructions ─────────────────────────── */}
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>

          {/* QR Card */}
          <div className="card" style={{ textAlign:'center', padding:'24px 20px' }}>
            <div style={{
              fontSize:'0.6875rem', fontWeight:800, letterSpacing:'0.12em',
              color:'#25D366', textTransform:'uppercase', marginBottom:14,
            }}>
              📱 WhatsApp Web — Link Device
            </div>

            {/* Status description */}
            <div style={{
              background:'var(--bg-elevated)', borderRadius:8, padding:'8px 12px',
              fontSize:'0.75rem', color:'var(--text-muted)', marginBottom:16, lineHeight:1.55,
            }}>
              {sm.desc}
            </div>

            {/* QR display */}
            {status === 'qr_ready' && qrDataUrl ? (
              <div style={{
                display:'inline-block', padding:12, background:'#fff',
                borderRadius:16, boxShadow:'0 0 40px rgba(37,211,102,0.3)',
                marginBottom:14, animation:'qrpulse 2s ease-in-out infinite',
              }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={qrDataUrl} alt="WhatsApp QR" width={220} height={220}
                  style={{ display:'block', borderRadius:8 }} />
              </div>
            ) : status === 'initializing' ? (
              <div style={{
                width:244, height:244, margin:'0 auto 14px',
                background:'var(--bg-elevated)', borderRadius:16,
                display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
                gap:12,
              }}>
                <div style={{
                  width:40, height:40, border:'3px solid #25D366', borderTopColor:'transparent',
                  borderRadius:'50%', animation:'spin 0.9s linear infinite',
                }} />
                <span style={{ fontSize:'0.75rem', color:'var(--text-muted)' }}>Starting Chromium…</span>
              </div>
            ) : status === 'ready' || status === 'authenticated' ? (
              <div style={{
                width:244, height:244, margin:'0 auto 14px',
                background:'linear-gradient(135deg,rgba(37,211,102,0.1),rgba(0,255,136,0.05))',
                border:'2px solid rgba(37,211,102,0.3)', borderRadius:16,
                display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:8,
              }}>
                <span style={{ fontSize:'3rem' }}>✅</span>
                <span style={{ fontSize:'0.9rem', fontWeight:700, color:'#25D366' }}>WhatsApp Linked!</span>
                <span style={{ fontSize:'0.75rem', color:'var(--text-muted)', textAlign:'center', padding:'0 16px' }}>
                  Messages to {PHONE} will appear in the chat automatically
                </span>
              </div>
            ) : status === 'disconnected' ? (
              <div style={{
                width:244, height:244, margin:'0 auto 14px',
                background:'rgba(255,51,102,0.06)', border:'2px solid rgba(255,51,102,0.25)',
                borderRadius:16, display:'flex', flexDirection:'column',
                alignItems:'center', justifyContent:'center', gap:8,
              }}>
                <span style={{ fontSize:'3rem' }}>❌</span>
                <span style={{ fontSize:'0.85rem', fontWeight:700, color:'#ff3366' }}>Session Ended</span>
                <button className="btn btn-sm" style={{ marginTop:8, background:'#ff3366', color:'white', border:'none' }}
                  onClick={() => window.location.reload()}>
                  Reconnect
                </button>
              </div>
            ) : null}

            <div style={{ fontSize:'0.875rem', fontWeight:700, color:'var(--text-primary)', marginBottom:2 }}>
              FuelGuard AI Bot
            </div>
            <div style={{ fontSize:'0.8125rem', color:'#25D366', fontWeight:600, marginBottom:12 }}>
              {PHONE}
            </div>

            {/* How to scan instructions */}
            {status === 'qr_ready' && (
              <div style={{
                background:'rgba(37,211,102,0.07)', border:'1px solid rgba(37,211,102,0.2)',
                borderRadius:10, padding:'10px 12px', textAlign:'left',
              }}>
                <div style={{ fontSize:'0.6875rem', fontWeight:800, color:'#25D366', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.06em' }}>
                  How to scan:
                </div>
                {[
                  'Open WhatsApp on your phone',
                  'Tap ⋮ (3 dots) → Linked Devices',
                  'Tap "Link a Device"',
                  'Point camera at QR above',
                ].map((step, i) => (
                  <div key={i} style={{ display:'flex', gap:8, fontSize:'0.75rem', color:'var(--text-muted)', marginBottom:4, alignItems:'flex-start' }}>
                    <span style={{ color:'#25D366', fontWeight:800, flexShrink:0 }}>{i+1}.</span>
                    {step}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* How it works */}
          <div className="card">
            <div className="card-header"><span className="card-title">How it works</span></div>
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              {[
                { icon:'1️⃣', title:'Scan the QR Code',   desc:`Open WhatsApp → Linked Devices → Link a Device, then scan.` },
                { icon:'2️⃣', title:'Send a message',     desc:`Anyone texts ${PHONE}: "Book 10L petrol at 5pm"` },
                { icon:'3️⃣', title:'AI parses intent',   desc:'Bot detects booking, extracts litres + time, picks nearest station.' },
                { icon:'4️⃣', title:'Booking confirmed',  desc:'A confirmed booking + QR code are created and appear on this website instantly.' },
                { icon:'5️⃣', title:'Auto-reply sent',    desc:'The phone receives an instant WhatsApp reply with the booking details.' },
              ].map(step => (
                <div key={step.icon} style={{ display:'flex', gap:10, alignItems:'flex-start' }}>
                  <span style={{ fontSize:'1.1rem', flexShrink:0 }}>{step.icon}</span>
                  <div>
                    <div style={{ fontSize:'0.8125rem', fontWeight:600, color:'var(--text-primary)', marginBottom:2 }}>{step.title}</div>
                    <div style={{ fontSize:'0.75rem', color:'var(--text-muted)', lineHeight:1.5 }}>{step.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Right column: Chat + Bookings ──────────────────────────── */}
        <div style={{ display:'flex', flexDirection:'column', gap:20 }}>

          {/* WhatsApp Chat UI */}
          <div className="card" style={{ padding:0, overflow:'hidden' }}>
            {/* Header bar */}
            <div style={{ background:'#075E54', padding:'12px 16px', display:'flex', alignItems:'center', gap:12 }}>
              <div style={{
                width:40, height:40, borderRadius:'50%', background:'#25D366',
                display:'flex', alignItems:'center', justifyContent:'center',
                fontSize:'1.25rem', flexShrink:0,
              }}>⛽</div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:'0.9375rem', fontWeight:700, color:'white' }}>FuelGuard AI Bot</div>
                <div style={{ fontSize:'0.75rem', color:'#a8e6a3' }}>
                  {PHONE} · {status === 'ready' ? '🟢 Live' : status === 'qr_ready' ? '⏳ Waiting for scan' : sm.label}
                </div>
              </div>
              <div style={{
                background: status === 'ready' ? '#25D366' : '#888',
                color:'white', padding:'3px 10px', borderRadius:99,
                fontSize:'0.625rem', fontWeight:800, letterSpacing:'0.08em',
              }}>
                {status === 'ready' ? 'LIVE BOT' : status.toUpperCase().replace('_', ' ')}
              </div>
            </div>

            {/* Chat area */}
            <div style={{
              background:'#ECE5DD', minHeight:340, maxHeight:460,
              overflowY:'auto', padding:'16px 12px',
              display:'flex', flexDirection:'column', gap:10,
            }}>
              <div style={{ textAlign:'center', marginBottom:4 }}>
                <span style={{ background:'rgba(0,0,0,0.1)', color:'#555', padding:'3px 12px', borderRadius:99, fontSize:'0.6875rem' }}>
                  Today · FuelGuard AI — {PHONE}
                </span>
              </div>

              {messages.length === 0 ? (
                <div style={{ textAlign:'center', color:'#888', paddingTop:40 }}>
                  <div style={{ fontSize:'2.5rem', marginBottom:8 }}>
                    {status === 'qr_ready' ? '📱' : status === 'initializing' ? '⏳' : '💬'}
                  </div>
                  <div style={{ fontSize:'0.875rem' }}>
                    {status === 'qr_ready'
                      ? 'Scan the QR code — once linked, messages will appear here'
                      : status === 'initializing'
                        ? 'WhatsApp client starting up…'
                        : 'No messages yet. Try a Quick Send below or text the bot from your phone!'}
                  </div>
                </div>
              ) : (
                [...messages].reverse().map(msg => (
                  <div key={msg.id} style={{ display:'flex', flexDirection:'column', gap:4 }}>
                    {/* Incoming */}
                    <div style={{ display:'flex', justifyContent:'flex-end' }}>
                      <div style={{
                        background:'#DCF8C6', borderRadius:'12px 2px 12px 12px',
                        padding:'8px 12px', maxWidth:'75%',
                        boxShadow:'0 1px 2px rgba(0,0,0,0.12)',
                      }}>
                        <div style={{ fontSize:'0.6875rem', color:'#25D366', fontWeight:700, marginBottom:3, display:'flex', alignItems:'center', gap:6 }}>
                          {/* Real WA messages have id starting with 'wa-' (not 'wa-sim-') */}
                          {!msg.id.startsWith('wa-sim') && (
                            <span style={{
                              background:'#25D366', color:'white',
                              fontSize:'0.55rem', fontWeight:900, padding:'1px 5px',
                              borderRadius:3, letterSpacing:'0.06em',
                            }}>📱 LIVE</span>
                          )}
                          {msg.from} · {msg.phone}
                        </div>
                        <div style={{ fontSize:'0.875rem', color:'#111', lineHeight:1.5 }}>{msg.body}</div>
                        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginTop:4, gap:8 }}>
                          <span style={{
                            fontSize:'0.6rem', fontWeight:700, textTransform:'uppercase',
                            color: INTENT_COLORS[msg.intent] || '#888',
                            background:'rgba(0,0,0,0.06)', padding:'1px 6px', borderRadius:4,
                          }}>
                            {INTENT_LABELS[msg.intent] || '💬 General'}
                          </span>
                          <span style={{ fontSize:'0.6875rem', color:'#9e9e9e' }}>{msg.timestamp} ✓✓</span>
                        </div>
                      </div>
                    </div>

                    {/* Bot reply */}
                    {msg.reply && (
                      <div style={{ display:'flex', justifyContent:'flex-start' }}>
                        <div style={{
                          background:'white', borderRadius:'2px 12px 12px 12px',
                          padding:'8px 12px', maxWidth:'80%',
                          boxShadow:'0 1px 2px rgba(0,0,0,0.12)',
                        }}>
                          <div style={{ fontSize:'0.6875rem', color:'#075E54', fontWeight:700, marginBottom:3 }}>
                            ⛽ FuelGuard AI Bot
                          </div>
                          <div style={{ fontSize:'0.8125rem', color:'#111', lineHeight:1.65, whiteSpace:'pre-line' }}>
                            {msg.reply}
                          </div>
                          {msg.bookingId && (
                            <div style={{
                              marginTop:6, padding:'4px 8px',
                              background:'rgba(37,211,102,0.1)', borderRadius:6,
                              fontSize:'0.7rem', color:'#075E54', fontWeight:700,
                            }}>
                              ✅ Booking created · {msg.bookingId}
                            </div>
                          )}
                          <div style={{ fontSize:'0.6875rem', color:'#9e9e9e', textAlign:'right', marginTop:4 }}>
                            {msg.timestamp} ✓✓
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Quick-send + input */}
            <div style={{ background:'#F0F0F0', padding:'10px 12px', borderTop:'1px solid #d9d9d9' }}>
              <div style={{ fontSize:'0.6875rem', color:'#888', fontWeight:700, marginBottom:6, textTransform:'uppercase', letterSpacing:'0.06em' }}>
                ⚡ Quick Send (Demo)
              </div>
              <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:10 }}>
                {DEMO_MSGS.map(dm => (
                  <button key={dm.label} onClick={() => sendDemo(dm.msg)} disabled={sending}
                    style={{
                      background:'#25D366', color:'white', border:'none', borderRadius:99,
                      padding:'5px 12px', fontSize:'0.75rem', fontWeight:600,
                      cursor: sending ? 'not-allowed' : 'pointer', opacity: sending ? 0.6 : 1,
                      transition:'transform 0.1s',
                    }}
                    onMouseEnter={e => { if (!sending) (e.currentTarget as HTMLButtonElement).style.transform='scale(1.05)' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform='none' }}>
                    {dm.label}
                  </button>
                ))}
              </div>
              <div style={{ display:'flex', gap:8 }}>
                <input type="text"
                  placeholder='Type a message… e.g. "Book 10L at 5pm"'
                  value={customMsg} onChange={e => setCustomMsg(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendDemo(customMsg)}
                  className="form-input"
                  style={{ flex:1, fontSize:'0.875rem', padding:'8px 14px' }} />
                <button onClick={() => sendDemo(customMsg)} disabled={sending || !customMsg.trim()}
                  style={{
                    background:'#25D366', color:'white', border:'none', borderRadius:10,
                    padding:'8px 18px', fontSize:'0.875rem', fontWeight:700,
                    cursor: sending || !customMsg.trim() ? 'not-allowed' : 'pointer',
                    opacity: sending || !customMsg.trim() ? 0.5 : 1,
                  }}>
                  {sending ? '⏳' : '▶'}
                </button>
              </div>
            </div>
          </div>

          {/* WA Bookings */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">📅 Bookings from WhatsApp</span>
              <span className="badge badge-info">{bookings.length} confirmed</span>
            </div>
            {bookings.length === 0 ? (
              <div style={{ textAlign:'center', color:'var(--text-muted)', padding:'28px 0', fontSize:'0.875rem' }}>
                <div style={{ fontSize:'2rem', marginBottom:6 }}>📭</div>
                No WhatsApp bookings yet.{status === 'ready' ? ' Text the bot from your phone!' : ' Try a Quick Send above.'}
              </div>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                {bookings.map(b => (
                  <div key={b.id} style={{
                    background:'var(--bg-elevated)',
                    border:'1px solid rgba(37,211,102,0.2)',
                    borderRadius:10, padding:'12px 14px',
                    display:'flex', flexDirection:'column', gap:6,
                  }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                        <span style={{
                          background:'rgba(37,211,102,0.15)', color:'#25D366',
                          fontSize:'0.6875rem', fontWeight:800, padding:'2px 8px', borderRadius:99,
                        }}>📱 WhatsApp</span>
                        <span style={{ fontSize:'0.8125rem', fontWeight:700, color:'var(--text-primary)' }}>{b.stationName}</span>
                      </div>
                      <span style={{ fontSize:'0.75rem', fontWeight:700, color:'var(--neon-green)' }}>✅ {b.status}</span>
                    </div>
                    <div style={{ display:'flex', gap:16, fontSize:'0.75rem', color:'var(--text-muted)' }}>
                      <span>⛽ {b.fuelAmount}L</span>
                      <span>🕐 {new Date(b.slotTime).toLocaleString('en-IN',{hour:'2-digit',minute:'2-digit',day:'numeric',month:'short'})}</span>
                      <span>📞 {b.fromPhone}</span>
                    </div>
                    <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                      <span style={{
                        fontFamily:'monospace', fontSize:'0.75rem',
                        color:'var(--neon-cyan)', background:'rgba(0,212,255,0.08)',
                        padding:'2px 10px', borderRadius:6, fontWeight:700,
                      }}>🔑 {b.qrCode}</span>
                      <span style={{ fontFamily:'monospace', fontSize:'0.7rem', color:'var(--text-muted)' }}>{b.id}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Keyframe injections */}
      <style>{`
        @keyframes waglow  { 0%,100%{opacity:1;box-shadow:0 0 6px currentColor} 50%{opacity:.5;box-shadow:none} }
        @keyframes qrpulse { 0%,100%{box-shadow:0 0 40px rgba(37,211,102,0.3)} 50%{box-shadow:0 0 60px rgba(37,211,102,0.55)} }
        @keyframes spin    { to{transform:rotate(360deg)} }
      `}</style>
    </div>
  )
}
