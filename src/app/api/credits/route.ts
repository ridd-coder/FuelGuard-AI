import { NextResponse } from 'next/server'

const globalCredits = globalThis as unknown as {
  credits: Record<string, { balance: number; used: number; limit: number; transactions: unknown[] }>
}
if (!globalCredits.credits) {
  globalCredits.credits = {
    u1: { balance: 85, used: 15, limit: 100, transactions: [
      { id: 't1', type: 'credit', amount: 100, reason: 'Weekly quota reset', balance: 100, ts: '2026-04-07T00:00:00' },
      { id: 't2', type: 'debit', amount: 15, reason: 'Booking BK-2085 - City Center Pump', balance: 85, ts: '2026-04-09T09:00:00' },
    ]},
    u2: { balance: 62, used: 38, limit: 100, transactions: [] },
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId') || 'u1'

  const record = globalCredits.credits[userId] || { balance: 100, used: 0, limit: 100, transactions: [] }
  return NextResponse.json({ userId, ...record })
}

export async function POST(request: Request) {
  const body = await request.json()
  const { userId = 'u1', amount, type, reason } = body

  if (!globalCredits.credits[userId]) {
    globalCredits.credits[userId] = { balance: 100, used: 0, limit: 100, transactions: [] }
  }

  const record = globalCredits.credits[userId]

  if (type === 'debit') {
    if (record.balance < amount) {
      return NextResponse.json({ error: 'Insufficient credits' }, { status: 400 })
    }
    record.balance -= amount
    record.used += amount
  } else {
    record.balance = Math.min(record.limit, record.balance + amount)
    record.used = Math.max(0, record.used - amount)
  }

  const tx = { id: `t${Date.now()}`, type, amount, reason, balance: record.balance, ts: new Date().toISOString() }
  record.transactions.unshift(tx)

  return NextResponse.json({ success: true, ...record })
}
