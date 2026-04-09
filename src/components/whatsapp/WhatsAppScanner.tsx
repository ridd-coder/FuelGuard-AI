'use client'

import { useState, useEffect } from 'react'
import { WHATSAPP_MESSAGES, type SimWhatsAppMessage } from '@/lib/simulation'

export default function WhatsAppScanner() {
  const [messages, setMessages] = useState<SimWhatsAppMessage[]>([])
  const [scanning, setScanning] = useState(false)
  const [scanProgress, setScanProgress] = useState(0)
  const [processing, setProcessing] = useState<string | null>(null)

  // Simulate messages arriving
  useEffect(() => {
    const timer = setInterval(() => {
      setMessages(prev => {
        const nextIdx = prev.length
        if (nextIdx < WHATSAPP_MESSAGES.length) {
          return [...prev, WHATSAPP_MESSAGES[nextIdx]]
        }
        return prev
      })
    }, 1800)
    return () => clearInterval(timer)
  }, [])

  const startScan = () => {
    setScanning(true)
    setScanProgress(0)
    let p = 0
    const interval = setInterval(() => {
      p += Math.random() * 15 + 5
      if (p >= 100) {
        p = 100
        clearInterval(interval)
        setTimeout(() => {
          setScanning(false)
          setScanProgress(0)
          setMessages(WHATSAPP_MESSAGES)
        }, 500)
      }
      setScanProgress(Math.min(p, 100))
    }, 200)
  }

  const processMessage = async (msg: SimWhatsAppMessage) => {
    setProcessing(msg.id)
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'chat', message: msg.message }),
      })
      if (res.ok) {
        const data = await res.json()
        setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, processed: true, reply: data.response } : m))
      } else {
        throw new Error('API request failed')
      }
    } catch (e) {
      setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, processed: true, reply: "Request received... Auto reply failed." } : m))
    }
    setProcessing(null)
  }

  const intentColors: Record<string, string> = {
    availability_check: 'var(--neon-cyan)',
    booking: 'var(--neon-green)',
    credit_check: 'var(--neon-purple)',
    alert_setup: 'var(--neon-yellow)',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* Scanner Header */}
      <div style={{
        background: 'var(--bg-elevated)',
        border: '1px solid rgba(37,211,102,0.2)',
        borderRadius: '10px',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
      }}>
        <div style={{ fontSize: '1.5rem' }}>📱</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            WhatsApp Web Scanner
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            AI-powered automation · Listens for citizen queries
          </div>
        </div>
        {!scanning ? (
          <button className="btn btn-success btn-sm" onClick={startScan} style={{ background: '#25D366', color: 'white', border: 'none' }}>
            ▶ Scan Session
          </button>
        ) : (
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.6875rem', color: '#25D366', marginBottom: 4 }}>Scanning... {Math.round(scanProgress)}%</div>
            <div style={{ width: 120, height: 4, background: 'var(--bg-card)', borderRadius: 4, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${scanProgress}%`, background: '#25D366', transition: 'width 0.2s ease' }}/>
            </div>
          </div>
        )}
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
        {[
          { label: 'Messages Captured', value: messages.length, color: 'var(--neon-cyan)' },
          { label: 'Auto-Processed', value: messages.filter(m => m.processed).length, color: 'var(--neon-green)' },
          { label: 'Pending Reply', value: messages.filter(m => !m.processed).length, color: 'var(--neon-orange)' },
        ].map(s => (
          <div key={s.label} style={{
            background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
            borderRadius: '8px', padding: '10px 12px', textAlign: 'center',
          }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 900, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: '0.625rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* WhatsApp UI */}
      <div className="whatsapp-container">
        <div className="whatsapp-header">
          <div style={{ fontSize: '1.25rem' }}>💬</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'white' }}>FuelGuard Bot</div>
            <div style={{ fontSize: '0.6875rem', color: '#25D366' }}>
              {scanning ? 'Scanning...' : `${messages.length} interactions captured`}
            </div>
          </div>
          <div style={{
            padding: '3px 10px', background: '#25D366', borderRadius: '99px',
            fontSize: '0.625rem', fontWeight: 700, color: 'white',
          }}>
            WEB AUTOMATION
          </div>
        </div>

        <div className="whatsapp-chat-area">
          {messages.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: 40, fontSize: '0.875rem' }}>
              <div style={{ fontSize: '2rem', marginBottom: 8 }}>📡</div>
              Click &quot;Scan Session&quot; to start capturing WhatsApp messages
            </div>
          ) : (
            messages.map(msg => (
              <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {/* Incoming */}
                <div className="wa-message incoming">
                  <div className="wa-sender">{msg.from} · {msg.phone}</div>
                  <div className="wa-text">{msg.message}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{
                      display: 'inline-flex', alignItems: 'center', gap: 4,
                      padding: '2px 6px', borderRadius: '4px', marginTop: 4,
                      background: 'rgba(0,0,0,0.3)',
                      fontSize: '0.6rem', color: intentColors[msg.intent] || 'var(--neon-cyan)',
                      fontWeight: 700, textTransform: 'uppercase',
                    }}>
                      🤖 {msg.intent.replace('_', ' ')}
                    </div>
                    <div className="wa-time">{msg.timestamp}</div>
                  </div>
                </div>

                {/* Outgoing / reply */}
                {msg.processed ? (
                  <div className="wa-message outgoing">
                    <div className="wa-text">{msg.reply}</div>
                    <div className="wa-time">✓✓ Auto-sent</div>
                  </div>
                ) : (
                  <div style={{ alignSelf: 'flex-end', marginTop: '2px' }}>
                    <button
                      className="btn btn-sm"
                      onClick={() => processMessage(msg)}
                      disabled={processing === msg.id}
                      style={{
                        background: '#25D366', color: 'white', border: 'none',
                        fontSize: '0.6875rem', cursor: 'pointer',
                      }}
                    >
                      {processing === msg.id ? '⏳ Processing...' : '▶ Auto-Reply'}
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
