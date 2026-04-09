'use client'

import { useState, useEffect } from 'react'

interface Block {
  index: number
  timestamp: string
  data: Record<string, unknown>
  previousHash: string
  hash: string
  nonce: number
}

export default function BlockchainLedger() {
  const [chain, setChain] = useState<Block[]>([])
  const [isValid, setIsValid] = useState(true)
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<number | null>(null)

  useEffect(() => {
    fetchChain()
    const interval = setInterval(fetchChain, 15000)
    return () => clearInterval(interval)
  }, [])

  const fetchChain = async () => {
    try {
      const res = await fetch('/api/blockchain')
      const data = await res.json()
      setChain(data.chain.slice(-8).reverse()) // Show last 8 blocks
      setIsValid(data.isValid)
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  const addBlock = async (type: string) => {
    await fetch('/api/blockchain', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type,
        data: {
          stationId: 's1',
          amount: Math.round(Math.random() * 30 + 10),
          userId: 'u1',
          note: `${type} transaction`,
        },
      }),
    })
    fetchChain()
  }

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <div style={{ color: 'var(--neon-cyan)', fontSize: '0.875rem' }}>⛓ Loading blockchain...</div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* Chain status header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '12px',
        padding: '10px 14px', borderRadius: '8px',
        background: isValid ? 'rgba(0,255,136,0.06)' : 'rgba(255,51,102,0.06)',
        border: `1px solid ${isValid ? 'rgba(0,255,136,0.2)' : 'rgba(255,51,102,0.2)'}`,
      }}>
        <span style={{ fontSize: '1.25rem' }}>{isValid ? '✅' : '❌'}</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '0.875rem', fontWeight: 700, color: isValid ? 'var(--neon-green)' : 'var(--neon-red)' }}>
            Chain {isValid ? 'VALID' : 'TAMPERED'}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {chain.length} blocks shown · SHA-256 proof-of-work · Difficulty: 2
          </div>
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button className="btn btn-ghost btn-sm" onClick={() => addBlock('BOOKING')}>+ Booking</button>
          <button className="btn btn-ghost btn-sm" onClick={() => addBlock('STOCK_UPDATE')}>+ Stock</button>
        </div>
      </div>

      {/* Blocks */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '420px', overflowY: 'auto' }}>
        {chain.map(block => (
          <div key={block.index}
            className="blockchain-block"
            onClick={() => setExpanded(expanded === block.index ? null : block.index)}
            style={{ cursor: 'pointer' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  background: block.index === 0 ? 'var(--neon-purple)' : 'var(--neon-cyan)',
                  color: 'var(--bg-base)', fontWeight: 900, fontSize: '0.6875rem',
                  padding: '2px 8px', borderRadius: '4px',
                }}>
                  #{block.index}
                </div>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.6875rem' }}>
                  {block.index === 0 ? '🧬 GENESIS' : (block.data.type as string || 'TRANSACTION')}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span className="block-verified">✓ VERIFIED</span>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.625rem' }}>
                  nonce: {block.nonce}
                </span>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                  {expanded === block.index ? '▲' : '▼'}
                </span>
              </div>
            </div>

            <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
              {new Date(block.timestamp).toLocaleString('en-IN')}
            </div>

            <div style={{ marginBottom: '6px' }}>
              <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginBottom: 2 }}>HASH</div>
              <div className="block-hash" style={{ fontSize: '0.6875rem' }}>
                {block.hash.substring(0, 32)}...
              </div>
            </div>

            {expanded === block.index && (
              <div style={{
                marginTop: '8px', padding: '8px', background: 'var(--bg-elevated)',
                borderRadius: '6px', fontSize: '0.6875rem', lineHeight: 1.8,
              }}>
                <div><span style={{ color: 'var(--text-muted)' }}>PREV HASH:</span> <span className="block-hash">{block.previousHash.substring(0, 48)}...</span></div>
                <div><span style={{ color: 'var(--text-muted)' }}>FULL HASH:</span> <span className="block-hash">{block.hash}</span></div>
                <div style={{ marginTop: '4px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>DATA:</span>
                  <pre style={{ color: 'var(--neon-cyan)', marginTop: '4px', fontSize: '0.6875rem', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                    {JSON.stringify(block.data, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
