'use client'

import { useState, useRef, useEffect } from 'react'

interface Message {
  id: string
  role: 'user' | 'ai'
  content: string
  timestamp: Date
}

const QUICK_PROMPTS = [
  'Nearest available station',
  'Check my credits',
  'Shortage forecast',
  'Book a slot',
]

export default function GeminiChatbot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      role: 'ai',
      content: '🤖 **FuelGuard AI Assistant** online. I can help you find fuel stations, check shortages, manage bookings, and track your credits. What do you need?',
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (text?: string) => {
    const msg = text || input.trim()
    if (!msg) return

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: msg,
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'chat', message: msg }),
      })
      const data = await res.json()

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: data.response,
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, aiMsg])
    } catch {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: '⚠️ Connection error. Please try again.',
        timestamp: new Date(),
      }])
    } finally {
      setLoading(false)
    }
  }

  const formatContent = (content: string) => {
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br/>')
  }

  return (
    <div className="chatbot-container">
      <div className="chatbot-header">
        <div style={{
          width: 32, height: 32, borderRadius: '8px',
          background: 'linear-gradient(135deg, #00d4ff, #9b59ff)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1rem', boxShadow: '0 0 12px rgba(0,212,255,0.3)',
        }}>🤖</div>
        <div>
          <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            FuelGuard AI
          </div>
          <div style={{ fontSize: '0.6875rem', color: 'var(--neon-green)', display: 'flex', alignItems: 'center', gap: 4 }}>
            <span className="pulse-dot green" style={{ width: 5, height: 5 }}/>
            Gemini-powered · Always available
          </div>
        </div>
        <div style={{ marginLeft: 'auto', fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
          {messages.length - 1} messages
        </div>
      </div>

      {/* Quick prompts */}
      <div style={{ padding: '8px 12px', display: 'flex', gap: '6px', flexWrap: 'wrap', borderBottom: '1px solid var(--border-subtle)' }}>
        {QUICK_PROMPTS.map(p => (
          <button key={p} onClick={() => sendMessage(p)}
            style={{
              padding: '3px 10px', borderRadius: '99px', border: '1px solid var(--border-default)',
              background: 'var(--bg-elevated)', color: 'var(--text-secondary)', fontSize: '0.6875rem',
              cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s ease',
            }}
            onMouseEnter={e => { (e.target as HTMLElement).style.borderColor = 'var(--neon-cyan)'; (e.target as HTMLElement).style.color = 'var(--neon-cyan)'; }}
            onMouseLeave={e => { (e.target as HTMLElement).style.borderColor = 'var(--border-default)'; (e.target as HTMLElement).style.color = 'var(--text-secondary)'; }}
          >
            {p}
          </button>
        ))}
      </div>

      <div className="chatbot-messages">
        {messages.map(msg => (
          <div key={msg.id} className={`chat-message ${msg.role}`}>
            {msg.role === 'ai' && (
              <div style={{ width: 28, height: 28, borderRadius: '8px', background: 'linear-gradient(135deg, #00d4ff, #9b59ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', flexShrink: 0, marginTop: 2 }}>🤖</div>
            )}
            <div className={`chat-bubble ${msg.role}`}
              dangerouslySetInnerHTML={{ __html: formatContent(msg.content) }}
            />
          </div>
        ))}

        {loading && (
          <div className="chat-message ai">
            <div style={{ width: 28, height: 28, borderRadius: '8px', background: 'linear-gradient(135deg, #00d4ff, #9b59ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', flexShrink: 0 }}>🤖</div>
            <div className="chat-bubble ai" style={{ display: 'flex', gap: '4px', alignItems: 'center', padding: '12px 16px' }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{
                  width: 6, height: 6, borderRadius: '50%', background: 'var(--neon-cyan)',
                  animation: `pulse-ring 1s ease infinite`,
                  animationDelay: `${i * 0.2}s`,
                }}/>
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef}/>
      </div>

      <div className="chatbot-input-row">
        <input
          className="chatbot-input"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !loading && sendMessage()}
          placeholder="Ask about fuel, stations, credits..."
          disabled={loading}
        />
        <button
          className="btn btn-primary btn-sm"
          onClick={() => sendMessage()}
          disabled={loading || !input.trim()}
          style={{ flexShrink: 0 }}
        >
          Send ↗
        </button>
      </div>
    </div>
  )
}
