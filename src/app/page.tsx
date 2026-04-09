'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'

const FEATURES = [
  { icon: '🗺️', title: 'Real-Time Fuel Map', desc: 'Live station status across all zones with AI-predicted shortage zones' },
  { icon: '🤖', title: 'Gemini AI Chatbot', desc: 'Natural language fuel assistance — find stations, book slots, check credits' },
  { icon: '💳', title: 'Smart Fuel Credits', desc: 'Dynamic quota system adjusted by AI based on crisis severity' },
  { icon: '🚨', title: 'Panic Buying Detection', desc: 'Anomaly detection flags hoarding with z-score analysis in real time' },
  { icon: '🔗', title: 'Blockchain Ledger', desc: 'Every transaction SHA-256 hashed and tamper-proofed on-chain' },
  { icon: '📱', title: 'WhatsApp Integration', desc: 'Web-automation scanner — citizens query fuel without installing an app' },
]

const STATS = [
  { value: '8', label: 'Fuel Stations', suffix: '' },
  { value: '94', label: 'AI Accuracy', suffix: '%' },
  { value: '2.4K', label: 'Citizens Served', suffix: '+' },
  { value: '0', label: 'Fraud Attempts', suffix: '' },
]

export default function LandingPage() {
  const [tick, setTick] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setTick(p => p + 1), 2000)
    return () => clearInterval(t)
  }, [])

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', position: 'relative', overflowX: 'hidden' }}>
      {/* Animated background */}
      <div className="hero-bg">
        <div className="hero-grid" />
        <div className="hero-orb hero-orb-1" />
        <div className="hero-orb hero-orb-2" />
        <div className="hero-orb hero-orb-3" />
      </div>

      {/* Nav */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(5,10,15,0.8)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border-subtle)',
        padding: '0 40px', height: '64px',
        display: 'flex', alignItems: 'center', gap: '24px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div className="logo-icon">⛽</div>
          <span style={{ fontWeight: 800, fontSize: '1.125rem', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            FuelGuard <span style={{ color: 'var(--neon-cyan)' }}>AI</span>
          </span>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
          <Link href="/dashboard/user" className="btn btn-ghost btn-sm">Citizen Portal</Link>
          <Link href="/dashboard/admin" className="btn btn-ghost btn-sm">Authority</Link>
          <Link href="/dashboard/pump" className="btn btn-ghost btn-sm">Pump Ops</Link>
          <Link href="/dashboard/analytics" className="btn btn-primary btn-sm">Analytics →</Link>
        </div>
      </nav>

      <main style={{ position: 'relative', zIndex: 1 }}>
        {/* Hero */}
        <section style={{ padding: '80px 40px 60px', maxWidth: '960px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            padding: '6px 16px', borderRadius: '99px',
            background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.2)',
            marginBottom: '24px',
          }}>
            <span className="pulse-dot green" />
            <span style={{ fontSize: '0.8125rem', color: 'var(--neon-cyan)', fontWeight: 600 }}>
              Live Crisis Dashboard Active · {tick % 2 === 0 ? '3 Zones Under Alert' : '2 Stations Critical'}
            </span>
          </div>

          <h1 style={{
            fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
            fontWeight: 900, letterSpacing: '-0.04em',
            lineHeight: 1.05, marginBottom: '24px',
          }}>
            Fuel Crisis{' '}
            <span style={{
              background: 'linear-gradient(135deg, var(--neon-cyan), var(--neon-purple))',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>
              Intelligence
            </span>
            <br />At Government Scale
          </h1>

          <p style={{ fontSize: '1.125rem', color: 'var(--text-secondary)', maxWidth: '640px', margin: '0 auto 40px', lineHeight: 1.7 }}>
            AI-powered platform combining real-time shortage prediction, blockchain transparency, 
            smart fuel credits, and WhatsApp accessibility to manage fuel crises proactively.
          </p>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/dashboard/user" className="btn btn-primary btn-lg">
              🧑 Citizen Dashboard
            </Link>
            <Link href="/dashboard/admin" className="btn btn-lg" style={{
              background: 'linear-gradient(135deg, var(--neon-purple), rgba(120,60,220,0.8))',
              color: 'white', border: 'none',
              boxShadow: '0 4px 15px var(--neon-purple-glow)',
            }}>
              🏛️ Authority Dashboard
            </Link>
            <Link href="/dashboard/analytics" className="btn btn-ghost btn-lg">
              📊 Analytics
            </Link>
          </div>
        </section>

        {/* Stats */}
        <section style={{ padding: '0 40px 60px', maxWidth: '960px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
            {STATS.map(s => (
              <div key={s.label} style={{
                background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
                borderRadius: '16px', padding: '24px', textAlign: 'center',
                boxShadow: 'var(--shadow-card)',
              }}>
                <div style={{
                  fontSize: '2.5rem', fontWeight: 900, letterSpacing: '-0.04em',
                  background: 'linear-gradient(135deg, var(--neon-cyan), var(--neon-purple))',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                }}>
                  {s.value}{s.suffix}
                </div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: '4px' }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section style={{ padding: '0 40px 80px', maxWidth: '960px', margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '40px', color: 'var(--text-secondary)', fontSize: '0.8125rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Platform Capabilities
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            {FEATURES.map((f, i) => (
              <div key={f.title} className="card" style={{ animationDelay: `${i * 0.1}s` }}>
                <div style={{ fontSize: '2rem', marginBottom: '12px' }}>{f.icon}</div>
                <h3 style={{ fontSize: '1rem', marginBottom: '8px' }}>{f.title}</h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Dashboard selector */}
        <section style={{ padding: '0 40px 100px', maxWidth: '960px', margin: '0 auto' }}>
          <div style={{
            background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
            borderRadius: '24px', padding: '40px', textAlign: 'center',
            boxShadow: 'var(--shadow-card)',
          }}>
            <h2 style={{ marginBottom: '8px' }}>Choose Your Dashboard</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '32px', fontSize: '0.9375rem' }}>
              Four specialized views for every stakeholder in the fuel ecosystem
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
              {[
                { href: '/dashboard/user', icon: '👤', title: 'Citizen Portal', desc: 'Find fuel, book slots, chat with AI, manage credits', color: 'var(--neon-cyan)' },
                { href: '/dashboard/admin', icon: '🏛️', title: 'Authority Dashboard', desc: 'Crisis command center, heatmaps, alerts, distribution control', color: 'var(--neon-purple)' },
                { href: '/dashboard/pump', icon: '⛽', title: 'Pump Operator', desc: 'Stock updates, queue management, QR validation', color: 'var(--neon-green)' },
                { href: '/dashboard/analytics', icon: '📊', title: 'Analytics Hub', desc: 'Forecasting, behavioral patterns, blockchain audit trail', color: 'var(--neon-orange)' },
              ].map(d => (
                <Link key={d.href} href={d.href} style={{
                  display: 'flex', gap: '16px', padding: '20px',
                  background: 'var(--bg-elevated)', borderRadius: '12px',
                  border: '1px solid var(--border-subtle)', textDecoration: 'none',
                  transition: 'all 0.25s ease', alignItems: 'flex-start',
                }}
                  onMouseEnter={e => {
                    const el = e.currentTarget as HTMLElement
                    el.style.borderColor = d.color
                    el.style.background = 'var(--bg-card-hover)'
                    el.style.transform = 'translateY(-2px)'
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget as HTMLElement
                    el.style.borderColor = 'var(--border-subtle)'
                    el.style.background = 'var(--bg-elevated)'
                    el.style.transform = 'translateY(0)'
                  }}
                >
                  <div style={{
                    width: '48px', height: '48px', borderRadius: '12px', flexShrink: 0,
                    background: `${d.color}15`, border: `1px solid ${d.color}30`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem',
                  }}>{d.icon}</div>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>{d.title}</div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>{d.desc}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
