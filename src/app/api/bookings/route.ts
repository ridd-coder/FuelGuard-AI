import { NextResponse } from 'next/server'

// In-memory booking store
interface Booking {
  id: string
  userId: string
  stationId: string
  stationName: string
  slotTime: string
  fuelAmount: number
  creditCost: number
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  qrCode: string
  createdAt: string
}

const globalBookings = globalThis as unknown as { bookings: Booking[] }
if (!globalBookings.bookings) {
  globalBookings.bookings = [
    { id: 'BK-2085', userId: 'u1', stationId: 's1', stationName: 'City Center Pump', slotTime: '2026-04-09T10:30:00', fuelAmount: 15, creditCost: 15, status: 'confirmed', qrCode: 'FG-2085-XA', createdAt: '2026-04-09T09:00:00' },
    { id: 'BK-2086', userId: 'u1', stationId: 's3', stationName: 'North Gate Station', slotTime: '2026-04-09T14:15:00', fuelAmount: 20, creditCost: 20, status: 'pending', qrCode: 'FG-2086-XB', createdAt: '2026-04-09T09:15:00' },
    { id: 'BK-2087', userId: 'u2', stationId: 's1', stationName: 'City Center Pump', slotTime: '2026-04-09T17:00:00', fuelAmount: 10, creditCost: 10, status: 'confirmed', qrCode: 'FG-2087-XK', createdAt: '2026-04-09T09:30:00' },
  ]
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const stationId = searchParams.get('stationId')
  const userId = searchParams.get('userId')

  let bookings = globalBookings.bookings
  if (stationId) bookings = bookings.filter(b => b.stationId === stationId)
  if (userId) bookings = bookings.filter(b => b.userId === userId)

  return NextResponse.json(bookings)
}

export async function POST(request: Request) {
  const body = await request.json()

  if (body.action === 'validate') {
    const booking = globalBookings.bookings.find(
      b => b.qrCode === body.qrCode || b.id === body.qrCode
    )
    if (!booking) return NextResponse.json({ valid: false, message: 'QR code not found' })
    if (booking.status === 'completed') return NextResponse.json({ valid: false, message: 'Already used' })

    booking.status = 'completed'
    return NextResponse.json({ valid: true, booking, message: 'QR validated successfully' })
  }

  // Create new booking
  const id = `BK-${2088 + globalBookings.bookings.length}`
  const qrCode = `FG-${id.replace('BK-', '')}-${Math.random().toString(36).substring(2, 4).toUpperCase()}`

  const newBooking: Booking = {
    id,
    userId: body.userId || 'u1',
    stationId: body.stationId,
    stationName: body.stationName,
    slotTime: body.slotTime,
    fuelAmount: body.fuelAmount,
    creditCost: body.fuelAmount,
    status: 'confirmed',
    qrCode,
    createdAt: new Date().toISOString(),
  }

  globalBookings.bookings.push(newBooking)

  return NextResponse.json({ success: true, booking: newBooking })
}

export async function PATCH(request: Request) {
  const body = await request.json()
  const booking = globalBookings.bookings.find(b => b.id === body.id)
  if (!booking) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  booking.status = body.status
  return NextResponse.json({ success: true, booking })
}
