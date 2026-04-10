/**
 * FuelGuard AI — WhatsApp Web Client (singleton)
 * Uses whatsapp-web.js (reverse-engineered WA Web protocol) to:
 *   1. Generate a scan QR code  → user scans with the linked phone
 *   2. Receive messages         → parse intent → create bookings
 *   3. Send auto-replies        → confirm booking with QR code
 *
 * The client is initialised once and kept alive for the lifetime of the
 * process. Hot-reloads reuse the existing authenticated session.
 */

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js')
// eslint-disable-next-line @typescript-eslint/no-require-imports
const qrcode = require('qrcode')

// ─── Shared in-memory store ────────────────────────────────────────────────

export interface WAMessage {
  id: string
  from: string
  phone: string
  body: string
  timestamp: string
  intent: 'booking' | 'availability_check' | 'credit_check' | 'alert_setup' | 'unknown'
  reply: string
  bookingId?: string
  qrCode?: string
}

export interface WABooking {
  id: string
  stationId: string
  stationName: string
  slotTime: string
  fuelAmount: number
  status: 'confirmed'
  qrCode: string
  fromPhone: string
  createdAt: string
  source: 'whatsapp'
}

export type ClientStatus = 'initializing' | 'qr_ready' | 'authenticated' | 'ready' | 'disconnected'

interface WAStore {
  status: ClientStatus
  qrDataUrl: string          // base-64 PNG of the QR code to display in browser
  qrString: string           // raw QR string (for manual display)
  messages: WAMessage[]
  bookings: WABooking[]
  client: ReturnType<typeof Client> | null
  initCalled: boolean
}

const g = globalThis as unknown as { _waStore: WAStore }

if (!g._waStore) {
  g._waStore = {
    status: 'initializing',
    qrDataUrl: '',
    qrString: '',
    messages: [],
    bookings: [],
    client: null,
    initCalled: false,
  }
}

export const store = g._waStore

// ─── Intent parser ─────────────────────────────────────────────────────────

const STATIONS = [
  { id: 's1', name: 'Delhi Central Pump' },
  { id: 's3', name: 'Bangalore Tech Park' },
  { id: 's5', name: 'Chennai Port Fuel' },
  { id: 's7', name: 'Ahmedabad Highway' },
  { id: 's14', name: 'Chandigarh Sector 17' },
]

function parseIntent(text: string): WAMessage['intent'] {
  const t = text.toLowerCase()
  if (/book|reserve|litre|liter|ltr|fuel|petrol|diesel|slot/i.test(t)) return 'booking'
  if (/balance|credit|point/i.test(t)) return 'credit_check'
  if (/nearest|available|open|pump|station|map|kahan|where/i.test(t)) return 'availability_check'
  if (/alert|notify|warn|shortage/i.test(t)) return 'alert_setup'
  return 'unknown'
}

function parseLitres(text: string): number {
  const m = text.match(/(\d+)\s*(?:l|litre|liter|ltr)/i)
  return m ? Math.min(Math.max(parseInt(m[1]), 5), 40) : 10
}

function parseTime(text: string): string {
  const m = text.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i)
  if (!m) {
    const h = new Date().getHours() + 1
    return `${String(h).padStart(2, '0')}:00`
  }
  let hour = parseInt(m[1])
  const min = m[2] ?? '00'
  if (m[3]?.toLowerCase() === 'pm' && hour < 12) hour += 12
  if (m[3]?.toLowerCase() === 'am' && hour === 12) hour = 0
  return `${String(hour).padStart(2, '0')}:${min}`
}

function makeReply(
  intent: WAMessage['intent'],
  body: string,
  bookingId?: string,
  qrCode?: string,
): string {
  switch (intent) {
    case 'booking': {
      const l = parseLitres(body)
      const t = parseTime(body)
      const s = STATIONS[Math.floor(Math.random() * STATIONS.length)]
      return (
        `✅ *Booking Confirmed — FuelGuard AI*\n\n` +
        `📍 Station: ${s.name}\n` +
        `⛽ Fuel: ${l}L\n` +
        `🕐 Slot: Today ${t}\n` +
        `🔑 QR Code: *${qrCode}*\n` +
        `📋 Booking ID: *${bookingId}*\n\n` +
        `_Show this code at the pump counter. Safe travels! 🚗_`
      )
    }
    case 'availability_check':
      return (
        `📡 *Live Fuel Map — FuelGuard AI*\n\n` +
        `🟢 Delhi Central — 8,200L · 12 in queue\n` +
        `🟠 Mumbai Highway — 3,100L · HIGH DEMAND\n` +
        `🟢 Bangalore Tech Park — 9,800L available\n` +
        `🔴 Pune Bypass — OFFLINE\n\n` +
        `_Reply "book 10L at 5pm" to reserve a slot instantly!_`
      )
    case 'credit_check':
      return (
        `💳 *Your FuelGuard Credits*\n\n` +
        `Balance: *85 credits*\n` +
        `Used this month: 15 credits\n` +
        `Monthly limit: 100 credits\n\n` +
        `_1 credit = 1 litre. Reply "book 15L" to use them._`
      )
    case 'alert_setup':
      return (
        `🔔 *Alert Activated — FuelGuard AI*\n\n` +
        `You'll be notified when:\n` +
        `• Stock < 20% in your zone\n` +
        `• Queue > 30 vehicles\n` +
        `• Shortage expected in < 2 hours\n\n` +
        `_84 stations monitored 24/7 ✓_`
      )
    default:
      return (
        `👋 Hi! I'm *FuelGuard AI Bot*.\n\n` +
        `I can help you:\n` +
        `📍 Check fuel availability\n` +
        `📅 Book a fuel slot\n` +
        `💳 Check your credits\n` +
        `🔔 Set shortage alerts\n\n` +
        `_Send "book 15L at 10am" to get started!_`
      )
  }
}

// ─── Create booking ────────────────────────────────────────────────────────

function createBooking(body: string, phone: string): { booking: WABooking; bookingId: string; qrCode: string } {
  const litres = parseLitres(body)
  const time   = parseTime(body)
  const station = STATIONS[Math.floor(Math.random() * STATIONS.length)]

  const bookingId = `BK-WA-${Math.floor(1000 + Math.random() * 9000)}`
  const qrCode    = `FG-${bookingId.replace('BK-WA-', '')}-WA`
  const today     = new Date().toISOString().split('T')[0]

  const booking: WABooking = {
    id: bookingId,
    stationId: station.id,
    stationName: station.name,
    slotTime: `${today}T${time}:00`,
    fuelAmount: litres,
    status: 'confirmed',
    qrCode,
    fromPhone: phone,
    createdAt: new Date().toISOString(),
    source: 'whatsapp',
  }

  store.bookings.unshift(booking)

  // Mirror into the global bookings store used by /api/bookings
  const gb = globalThis as unknown as { bookings: object[] }
  if (Array.isArray(gb.bookings)) {
    gb.bookings.unshift({
      ...booking,
      userId: phone,
      creditCost: litres,
    })
  }

  return { booking, bookingId, qrCode }
}

// ─── WhatsApp client initialiser (idempotent) ──────────────────────────────

export function initWhatsApp() {
  if (store.initCalled) return
  store.initCalled = true

  console.log('[FuelGuard WA] Initialising WhatsApp Web client…')

  const client = new Client({
    authStrategy: new LocalAuth({ dataPath: '.wwebjs_auth' }),
    puppeteer: {
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
      ],
    },
  })

  store.client = client

  // ── QR generated ──────────────────────────────────────────────────────────
  client.on('qr', async (qr: string) => {
    console.log('[FuelGuard WA] QR code received, rendering…')
    store.qrString = qr
    store.status   = 'qr_ready'
    try {
      store.qrDataUrl = await qrcode.toDataURL(qr, {
        width: 280,
        margin: 2,
        color: { dark: '#128C7E', light: '#ffffff' },
        errorCorrectionLevel: 'H',
      })
    } catch (e) {
      console.error('[FuelGuard WA] QR render error:', e)
    }
  })

  // ── Authenticated ─────────────────────────────────────────────────────────
  client.on('authenticated', () => {
    console.log('[FuelGuard WA] Authenticated ✓')
    store.status   = 'authenticated'
    store.qrDataUrl = ''
    store.qrString  = ''
  })

  // ── Ready ─────────────────────────────────────────────────────────────────
  client.on('ready', () => {
    console.log('[FuelGuard WA] Client ready — listening for messages')
    store.status = 'ready'
  })

  // ── Disconnected ──────────────────────────────────────────────────────────
  client.on('disconnected', (reason: string) => {
    console.warn('[FuelGuard WA] Disconnected:', reason)
    store.status    = 'disconnected'
    store.initCalled = false   // allow re-init
  })

  // ── Incoming message ──────────────────────────────────────────────────────
  client.on('message', async (msg: Record<string, unknown>) => {
    const body  = String(msg.body ?? '')
    const from  = String(msg.from ?? '')
    const phone = from.replace('@c.us', '').replace(/\D/g, '')

    console.log(`[FuelGuard WA] Message from ${phone}: "${body}"`)

    const intent = parseIntent(body)
    let bookingId: string | undefined
    let qrCode: string | undefined

    if (intent === 'booking') {
      const result = createBooking(body, `+${phone}`)
      bookingId = result.bookingId
      qrCode    = result.qrCode
    }

    const reply = makeReply(intent, body, bookingId, qrCode)

    const waMsg: WAMessage = {
      id:        `wa-${Date.now()}`,
      from:      String((msg.notifyName as string) ?? phone),
      phone:     `+${phone}`,
      body,
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      intent,
      reply,
      bookingId,
      qrCode,
    }

    store.messages.unshift(waMsg)

    // Auto-reply
    try {
      await (msg as { reply: (r: string) => Promise<void> }).reply(reply)
      console.log(`[FuelGuard WA] Auto-replied to ${phone}`)
    } catch (e) {
      console.error('[FuelGuard WA] Reply error:', e)
    }
  })

  client.initialize()
}
