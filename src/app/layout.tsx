import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'FuelGuard AI',
  description: 'AI-powered Fuel Crisis Management Platform. Real-time predictions, smart distribution & logistics routing.',
  keywords: 'fuel crisis, AI prediction, fuel management, shortage alerts, smart distribution',
  openGraph: {
    title: 'FuelGuard AI',
    description: 'AI-powered, multi-dashboard fuel crisis management system with real-time shortage prediction.',
    url: 'https://fuelguard.vercel.app',
    siteName: 'FuelGuard AI',
    locale: 'en_IN',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
