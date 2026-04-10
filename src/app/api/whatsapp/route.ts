import { NextResponse } from 'next/server'

const BRIDGE = 'http://localhost:3002'

// ─── Inline simulation helpers (used when bridge is unreachable) ────────────

const STATIONS = [
  { id: 's1',  name: 'Delhi Central Pump' },
  { id: 's3',  name: 'Bangalore Tech Park' },
  { id: 's5',  name: 'Chennai Port Fuel' },
  { id: 's7',  name: 'Ahmedabad Highway' },
  { id: 's14', name: 'Chandigarh Sector 17' },
]

function parseIntent(text: string) {
  if (/book|reserve|litre|liter|ltr|fuel|petrol|diesel|slot/i.test(text)) return 'booking'             as const
  if (/balance|credit|point/i.test(text))                                  return 'credit_check'        as const
  if (/nearest|available|open|pump|station|map/i.test(text))               return 'availability_check' as const
  if (/alert|notify|warn|shortage/i.test(text))                            return 'alert_setup'         as const
  return 'unknown' as const
}
type Intent = ReturnType<typeof parseIntent>

function parseLitres(text: string) {
  const m = text.match(/(\d+)\s*(?:l|litre|liter|ltr)/i)
  return m ? Math.min(Math.max(parseInt(m[1]), 5), 40) : 10
}

function parseTime(text: string) {
  const m = text.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i)
  if (!m) { const h = new Date().getHours() + 1; return `${String(h).padStart(2,'0')}:00` }
  let hour = parseInt(m[1]); const min = m[2] ?? '00'
  if (m[3]?.toLowerCase() === 'pm' && hour < 12) hour += 12
  if (m[3]?.toLowerCase() === 'am' && hour === 12) hour = 0
  return `${String(hour).padStart(2,'0')}:${min}`
}

function makeReply(intent: Intent, body: string, bookingId?: string, qrCode?: string): string {
  switch (intent) {
    case 'booking': {
      const l = parseLitres(body); const t = parseTime(body)
      const s = STATIONS[Math.floor(Math.random() * STATIONS.length)]
      return `✅ *Booking Confirmed — FuelGuard AI*\n\n📍 Station: ${s.name}\n⛽ Fuel: ${l}L\n🕐 Slot: Today ${t}\n🔑 QR Code: *${qrCode}*\n📋 Booking ID: *${bookingId}*\n\n_Show this code at the pump counter. Safe travels! 🚗_`
    }
    case 'availability_check':
      return `📡 *Live Fuel Map*\n\n🟢 Delhi Central — 8,200L · 12 in queue\n🟠 Mumbai Highway — 3,100L · HIGH DEMAND\n🟢 Bangalore Tech Park — 9,800L\n🔴 Pune Bypass — OFFLINE\n\n_Reply "book 10L at 5pm" to reserve instantly!_`
    case 'credit_check':
      return `💳 *FuelGuard Credits*\n\nBalance: *85 credits* · Limit: 100/month\n\n_1 credit = 1 litre._`
    case 'alert_setup':
      return `🔔 *Alert Activated*\n\nYou will be notified on shortage warnings.\n\n_84 stations monitored 24/7 ✓_`
    default:
      return `👋 Hi! I'm *FuelGuard AI Bot*.\n\nSend "book 15L at 10am" to get started!`
  }
}

// Fallback in-memory store (used when bridge is offline)
const g = globalThis as unknown as {
  _waFallbackMessages: object[];
  _waFallbackBookings: object[];
}
if (!g._waFallbackMessages) g._waFallbackMessages = []
if (!g._waFallbackBookings) g._waFallbackBookings = []

function createFallbackBooking(body: string, phone: string) {
  const litres    = parseLitres(body)
  const time      = parseTime(body)
  const station   = STATIONS[Math.floor(Math.random() * STATIONS.length)]
  const bookingId = `BK-WA-${Math.floor(1000 + Math.random() * 9000)}`
  const qrCode    = `FG-${bookingId.replace('BK-WA-', '')}-WA`
  const today     = new Date().toISOString().split('T')[0]
  const booking   = {
    id: bookingId, stationId: station.id, stationName: station.name,
    slotTime: `${today}T${time}:00`, fuelAmount: litres,
    status: 'confirmed', qrCode, fromPhone: phone,
    createdAt: new Date().toISOString(), source: 'whatsapp',
  }
  g._waFallbackBookings.unshift(booking)
  const gb = globalThis as unknown as { bookings: object[] }
  if (Array.isArray(gb.bookings)) gb.bookings.unshift({ ...booking, userId: phone, creditCost: litres })
  return { bookingId, qrCode }
}

// ─── GET ────────────────────────────────────────────────────────────────────

export async function GET() {
  try {
    const res = await fetch(`${BRIDGE}/wa/status`, { cache: 'no-store' })
    if (res.ok) {
      const data = await res.json()
      return NextResponse.json(data)
    }
  } catch { /* bridge not running — return demo state */ }

  return NextResponse.json({
    status:    'initializing',
    qrDataUrl: '',
    qrString:  '',
    messages:  g._waFallbackMessages,
    bookings:  g._waFallbackBookings,
    phone:    '+916374987762',
    bridgeOffline: true,
  })
}

// ─── POST ───────────────────────────────────────────────────────────────────

export async function POST(request: Request) {
  const body  = await request.json()
  const text  = String(body.message ?? '')
  const phone = String(body.phone  ?? '+916374987762')
  const from  = String(body.from   ?? 'Demo User')

  // Try bridge first
  try {
    const res = await fetch(`${BRIDGE}/wa/simulate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text, phone, from }),
    })
    if (res.ok) {
      const data = await res.json()
      return NextResponse.json(data)
    }
  } catch { /* bridge offline — fall through to local sim */ }

  // Fallback: simulate locally
  const intent = parseIntent(text)
  let bookingId: string | undefined
  let qrCode: string | undefined
  if (intent === 'booking') {
    const r = createFallbackBooking(text, phone)
    bookingId = r.bookingId; qrCode = r.qrCode
  }

  const reply = makeReply(intent, text, bookingId, qrCode)
  const msg = {
    id: `wa-sim-${Date.now()}`, from, phone, body: text,
    timestamp: new Date().toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit' }),
    intent, reply, processed: true, bookingId, qrCode,
  }
  g._waFallbackMessages.unshift(msg)

  return NextResponse.json({ success: true, message: msg, bookingId, qrCode })
}
