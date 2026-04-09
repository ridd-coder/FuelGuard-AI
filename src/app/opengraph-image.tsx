import { ImageResponse } from 'next/og'
 
export const runtime = 'edge'
export const alt = 'FuelGuard AI'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'
 
export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #0f1016 0%, #171822 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundImage: 'radial-gradient(circle at 25px 25px, rgba(255, 255, 255, 0.05) 2%, transparent 0%), radial-gradient(circle at 75px 75px, rgba(255, 255, 255, 0.05) 2%, transparent 0%)',
            backgroundSize: '100px 100px',
        }} />
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 160,
          height: 160,
          borderRadius: 40,
          background: 'linear-gradient(135deg, #00d4ff, #9b59ff)',
          color: 'white',
          fontSize: 80,
          marginBottom: 40,
          boxShadow: '0 0 80px rgba(0, 212, 255, 0.4)'
        }}>
          ⛽
        </div>
        <div
          style={{
            fontSize: 72,
            fontWeight: 800,
            background: 'linear-gradient(to right, #ffffff, #888888)',
            backgroundClip: 'text',
            color: 'transparent',
            letterSpacing: '-2px',
            marginBottom: 20,
          }}
        >
          FuelGuard AI
        </div>
        <div
          style={{
            fontSize: 36,
            color: '#a0a0b0',
            fontWeight: 500,
            letterSpacing: '-1px',
            textAlign: 'center',
            maxWidth: 900,
          }}
        >
          Predictive Crisis Intelligence & Smart Distribution
        </div>
      </div>
    ),
    { ...size }
  )
}
