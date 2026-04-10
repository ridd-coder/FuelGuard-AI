/**
 * FuelGuard AI — WhatsApp Bridge Server  (fixed v2)
 * Run with: node wa-bridge.js
 *
 * Fixes vs v1:
 *  ✓ Filter group / broadcast / status messages  (only @c.us direct messages)
 *  ✓ Filter empty / media-only messages
 *  ✓ Filter messages sent FROM the bot itself (msg.fromMe)
 *  ✓ Use msg.reply() instead of client.sendMessage() → avoids "No LID" errors
 *  ✓ Safer phone number extraction
 */

const http   = require('http')
const { Client, LocalAuth } = require('whatsapp-web.js')
const qrcode = require('qrcode')

// ─── Store ───────────────────────────────────────────────────────────────────

let waStatus  = 'initializing'
let qrDataUrl = ''
let qrString  = ''
const messages = []
const bookings = []

// ─── Helpers ─────────────────────────────────────────────────────────────────

const STATIONS = [
  { id: 's1',  name: 'Delhi Central Pump' },
  { id: 's3',  name: 'Bangalore Tech Park' },
  { id: 's5',  name: 'Chennai Port Fuel' },
  { id: 's7',  name: 'Ahmedabad Highway' },
  { id: 's14', name: 'Chandigarh Sector 17' },
]

function parseIntent(text) {
  if (/book|reserve|litre|liter|ltr|fuel|petrol|diesel|slot/i.test(text)) return 'booking'
  if (/balance|credit|point/i.test(text))                                  return 'credit_check'
  if (/nearest|available|open|pump|station|map/i.test(text))               return 'availability_check'
  if (/alert|notify|warn|shortage/i.test(text))                            return 'alert_setup'
  return 'unknown'
}

function parseLitres(text) {
  const m = text.match(/(\d+)\s*(?:l|litre|liter|ltr)/i)
  return m ? Math.min(Math.max(parseInt(m[1]), 5), 40) : 10
}

function parseTime(text) {
  const m = text.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i)
  if (!m) { const h = new Date().getHours() + 1; return `${String(h).padStart(2,'0')}:00` }
  let hour = parseInt(m[1]); const min = m[2] || '00'
  if (m[3]?.toLowerCase() === 'pm' && hour < 12) hour += 12
  if (m[3]?.toLowerCase() === 'am' && hour === 12) hour = 0
  return `${String(hour).padStart(2,'0')}:${min}`
}

function makeReply(intent, body, bookingId, qrCode) {
  switch (intent) {
    case 'booking': {
      const l = parseLitres(body)
      const t = parseTime(body)
      const s = STATIONS[Math.floor(Math.random() * STATIONS.length)]
      return `✅ *Booking Confirmed — FuelGuard AI*\n\n📍 Station: ${s.name}\n⛽ Fuel: ${l}L\n🕐 Slot: Today ${t}\n🔑 QR Code: *${qrCode}*\n📋 Booking ID: *${bookingId}*\n\n_Show this QR at the pump counter. Safe travels! 🚗_`
    }
    case 'availability_check':
      return `📡 *Live Fuel Map — FuelGuard AI*\n\n🟢 Delhi Central — 8,200L · 12 in queue\n🟠 Mumbai Highway — 3,100L · HIGH DEMAND\n🟢 Bangalore Tech Park — 9,800L\n🔴 Pune Bypass — OFFLINE\n\n_Reply "book 10L at 5pm" to reserve instantly!_`
    case 'credit_check':
      return `💳 *FuelGuard Credits*\n\nBalance: *85 credits*\nUsed this month: 15\nLimit: 100/month\n\n_1 credit = 1 litre. Reply "book 15L" to use._`
    case 'alert_setup':
      return `🔔 *Shortage Alert Activated*\n\nYou'll get warnings when:\n• Stock < 20% in your zone\n• Queue > 30 vehicles\n• Shortage expected < 2 hrs\n\n_84 stations monitored 24/7 ✓_`
    default:
      return `👋 Hi! I'm *FuelGuard AI Bot*.\n\nI can help you:\n📅 Book fuel slots\n📍 Check availability\n💳 Check credits\n🔔 Set shortage alerts\n\n_Try: "book 15L at 10am"_`
  }
}

function createBooking(body, phone) {
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
  bookings.unshift(booking)
  return { bookingId, qrCode, booking }
}

// ─── Main message handler ─────────────────────────────────────────────────────

async function handleMessage(displayName, phoneStr, body, msgObj) {
  const text = (body || '').trim()
  console.log(`[WA] ✉  From: ${phoneStr} | Name: ${displayName} | Body: "${text.slice(0,80)}"`)

  const intent = parseIntent(text)
  let bookingId, qrCode

  if (intent === 'booking') {
    const r = createBooking(text, phoneStr)
    bookingId = r.bookingId
    qrCode    = r.qrCode
    console.log(`[WA]   → Booking created: ${bookingId}`)
  }

  const reply = makeReply(intent, text, bookingId, qrCode)

  const record = {
    id:        `wa-${Date.now()}-${Math.random().toString(36).slice(2,5)}`,
    from:      displayName,
    phone:     phoneStr,
    body:      text,
    timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    intent,
    reply,
    processed: true,
    bookingId,
    qrCode,
  }

  messages.unshift(record)

  // Auto-reply using msg.reply() to avoid LID errors on newer WA versions
  if (msgObj && waStatus === 'ready') {
    try {
      await msgObj.reply(reply)
      console.log(`[WA]   → Auto-replied ✓`)
    } catch (e) {
      console.error(`[WA]   → Reply error: ${e.message}`)
    }
  }
}

// ─── WhatsApp client ──────────────────────────────────────────────────────────

const client = new Client({
  authStrategy: new LocalAuth({ dataPath: '.wwebjs_auth' }),
  puppeteer: {
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
  },
})

client.on('qr', async (qr) => {
  console.log('\n[WA] ━━━ QR CODE READY ━━━')
  console.log('[WA] Open http://localhost:3000/dashboard/user/whatsapp')
  console.log('[WA] Scan with WhatsApp → Linked Devices → Link a Device\n')
  qrString = qr
  waStatus = 'qr_ready'
  try {
    qrDataUrl = await qrcode.toDataURL(qr, {
      width: 280, margin: 2,
      color: { dark: '#128C7E', light: '#ffffff' },
      errorCorrectionLevel: 'H',
    })
  } catch (e) { console.error('[WA] QR render error:', e) }
})

client.on('authenticated', () => {
  console.log('[WA] ✓ Authenticated')
  waStatus  = 'authenticated'
  qrDataUrl = ''
  qrString  = ''
})

client.on('ready', () => {
  console.log('[WA] ✅ Ready — listening for messages on +916374987762')
  waStatus = 'ready'
})

client.on('auth_failure', (msg) => {
  console.error('[WA] ✗ Auth failure:', msg)
  waStatus = 'disconnected'
})

client.on('disconnected', (reason) => {
  console.warn('[WA] ⚠ Disconnected:', reason)
  waStatus = 'disconnected'
})

// ── Message event — ONLY direct (personal) messages ──────────────────────────
client.on('message', async (msg) => {
  // Skip messages sent by the bot / linked device itself
  if (msg.fromMe) {
    console.log('[WA] Skipping own message')
    return
  }

  // Skip group, broadcast, status messages (they have @g.us or @broadcast)
  const from = String(msg.from || '')
  if (!from.endsWith('@c.us')) {
    console.log(`[WA] Skipping non-direct message from: ${from}`)
    return
  }

  // Skip empty / media-only messages
  const body = (msg.body || '').trim()
  if (!body) {
    console.log(`[WA] Skipping empty body from: ${from}`)
    return
  }

  // Extract clean phone number
  const phone = '+' + from.replace('@c.us', '').replace(/\D/g, '')
  const displayName = msg.notifyName || phone

  await handleMessage(displayName, phone, body, msg)
})

client.initialize()

// ─── HTTP server ──────────────────────────────────────────────────────────────

const PORT = 3002

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  res.setHeader('Content-Type', 'application/json')

  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return }

  // GET /wa/status
  if (req.url === '/wa/status' && req.method === 'GET') {
    res.writeHead(200)
    res.end(JSON.stringify({
      status: waStatus, qrDataUrl, qrString,
      messages, bookings, phone: '+916374987762',
    }))
    return
  }

  // POST /wa/simulate  — demo mode, inject a fake incoming message
  if (req.url === '/wa/simulate' && req.method === 'POST') {
    let raw = ''
    req.on('data', c => { raw += c })
    req.on('end', async () => {
      try {
        const b    = JSON.parse(raw)
        const text = String(b.message || '').trim()
        const phone = '+' + String(b.phone || '916374987762').replace(/\D/g, '')
        const from  = String(b.from || 'Demo User')
        if (!text) { res.writeHead(400); res.end(JSON.stringify({ error: 'Empty message' })); return }
        await handleMessage(from, phone, text, null)
        res.writeHead(200)
        res.end(JSON.stringify({ success: true, message: messages[0] }))
      } catch (e) {
        res.writeHead(400)
        res.end(JSON.stringify({ error: e.message }))
      }
    })
    return
  }

  res.writeHead(404)
  res.end(JSON.stringify({ error: 'Not found. Use GET /wa/status or POST /wa/simulate' }))
})

server.listen(PORT, '0.0.0.0', () => {
  console.log(`\n[WA Bridge] ━━━ HTTP server on http://localhost:${PORT} ━━━`)
  console.log('[WA Bridge] Starting WhatsApp Web client...\n')
})
