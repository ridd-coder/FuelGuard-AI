/**
 * Simulation helpers — used by POST /api/whatsapp when user presses
 * a "Quick Send" demo button (avoids duplicating logic from the singleton).
 * These are plain functions, not the live WA client.
 */

import { store, type WABooking } from '@/lib/whatsapp-client'

const STATIONS = [
  { id: 's1',  name: 'Delhi Central Pump' },
  { id: 's3',  name: 'Bangalore Tech Park' },
  { id: 's5',  name: 'Chennai Port Fuel' },
  { id: 's7',  name: 'Ahmedabad Highway' },
  { id: 's14', name: 'Chandigarh Sector 17' },
]

export function parseIntentSim(text: string) {
  const t = text.toLowerCase()
  if (/book|reserve|litre|liter|ltr|fuel|petrol|diesel|slot/i.test(t)) return 'booking' as const
  if (/balance|credit|point/i.test(t))                                  return 'credit_check' as const
  if (/nearest|available|open|pump|station|map|kahan|where/i.test(t))   return 'availability_check' as const
  if (/alert|notify|warn|shortage/i.test(t))                            return 'alert_setup' as const
  return 'unknown' as const
}

function parseLitres(text: string) {
  const m = text.match(/(\d+)\s*(?:l|litre|liter|ltr)/i)
  return m ? Math.min(Math.max(parseInt(m[1]), 5), 40) : 10
}

function parseTime(text: string) {
  const m = text.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i)
  if (!m) { const h = new Date().getHours() + 1; return `${String(h).padStart(2, '0')}:00` }
  let hour = parseInt(m[1]); const min = m[2] ?? '00'
  if (m[3]?.toLowerCase() === 'pm' && hour < 12) hour += 12
  if (m[3]?.toLowerCase() === 'am' && hour === 12) hour = 0
  return `${String(hour).padStart(2, '0')}:${min}`
}

export function createBookingSim(body: string, phone: string) {
  const litres  = parseLitres(body)
  const time    = parseTime(body)
  const station = STATIONS[Math.floor(Math.random() * STATIONS.length)]
  const bookingId = `BK-WA-${Math.floor(1000 + Math.random() * 9000)}`
  const qrCode    = `FG-${bookingId.replace('BK-WA-', '')}-WA`
  const today     = new Date().toISOString().split('T')[0]

  const booking: WABooking = {
    id: bookingId, stationId: station.id, stationName: station.name,
    slotTime: `${today}T${time}:00`, fuelAmount: litres, status: 'confirmed',
    qrCode, fromPhone: phone, createdAt: new Date().toISOString(), source: 'whatsapp',
  }
  store.bookings.unshift(booking)

  const gb = globalThis as unknown as { bookings: object[] }
  if (Array.isArray(gb.bookings)) gb.bookings.unshift({ ...booking, userId: phone, creditCost: litres })

  return { booking, bookingId, qrCode }
}

export function makeReplySim(
  intent: ReturnType<typeof parseIntentSim>,
  body: string,
  bookingId?: string,
  qrCode?: string,
) {
  switch (intent) {
    case 'booking': {
      const l = parseLitres(body); const t = parseTime(body)
      const s = STATIONS[Math.floor(Math.random() * STATIONS.length)]
      return `✅ *Booking Confirmed — FuelGuard AI*\n\n📍 Station: ${s.name}\n⛽ Fuel: ${l}L\n🕐 Slot: Today ${t}\n🔑 QR Code: *${qrCode}*\n📋 Booking ID: *${bookingId}*\n\n_Show this code at the pump counter. Safe travels! 🚗_`
    }
    case 'availability_check':
      return `📡 *Live Fuel Map*\n\n🟢 Delhi Central — 8,200L · 12 in queue\n🟠 Mumbai Highway — 3,100L · HIGH DEMAND\n🟢 Bangalore Tech Park — 9,800L\n🔴 Pune Bypass — OFFLINE\n\n_Reply "book 10L at 5pm" to reserve instantly!_`
    case 'credit_check':
      return `💳 *FuelGuard Credits*\n\nBalance: *85 credits*\nUsed: 15 credits · Limit: 100/month\n\n_1 credit = 1 litre. Reply "book 15L" to use them._`
    case 'alert_setup':
      return `🔔 *Alert Activated*\n\nYou'll be notified on shortage warnings in your zone.\n\n_84 stations monitored 24/7 ✓_`
    default:
      return `👋 Hi! I'm *FuelGuard AI Bot*.\n\nSend "book 15L at 10am" to get started!\n\n📍 Availability · 📅 Book · 💳 Credits · 🔔 Alerts`
  }
}
