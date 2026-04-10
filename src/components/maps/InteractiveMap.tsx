'use client'

import { useEffect, useRef, useState } from 'react'
import type { SimStation } from '@/lib/simulation'

interface MapProps {
  stations: SimStation[]
  height?: number | string
  userLocation?: { lat: number; lng: number } | null
}

const STATUS_COLOR: Record<string, string> = {
  operational: '#00ff88',
  critical: '#ff7a30',
  offline: '#ff3366',
}

const STATUS_GLOW: Record<string, string> = {
  operational: '0 0 10px #00ff8880',
  critical: '0 0 10px #ff7a3080',
  offline: '0 0 10px #ff336680',
}

// Tile-layer configs
const TILE_LAYERS = {
  dark: {
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
  },
  satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; <a href="https://www.esri.com/">Esri</a>',
  },
}

export default function InteractiveMap({ stations, height = 420, userLocation }: MapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<import('leaflet').Map | null>(null)
  const markersRef = useRef<import('leaflet').CircleMarker[]>([])
  const userMarkerRef = useRef<import('leaflet').CircleMarker | null>(null)
  const tileRef = useRef<import('leaflet').TileLayer | null>(null)
  const [mapMode, setMapMode] = useState<'dark' | 'satellite'>('dark')
  const [selectedStation, setSelectedStation] = useState<SimStation | null>(null)

  // ── Init map once ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (typeof window === 'undefined' || mapRef.current) return

    import('leaflet').then((L) => {
      if (!containerRef.current || mapRef.current) return

      // Fix default icon path issue with Leaflet + webpack
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: '',
        iconUrl: '',
        shadowUrl: '',
      })

      const map = L.map(containerRef.current!, {
        center: userLocation ? [userLocation.lat, userLocation.lng] : [22.5937, 78.9629],
        zoom: userLocation ? 11 : 5,
        zoomControl: true,
        attributionControl: true,
      })

      // Dark tile layer
      const tile = L.tileLayer(TILE_LAYERS.dark.url, {
        attribution: TILE_LAYERS.dark.attribution,
        subdomains: 'abcd',
        maxZoom: 18,
      }).addTo(map)

      // Style attribution to match dark theme
      const attribEl = map.getContainer().querySelector('.leaflet-control-attribution') as HTMLElement | null
      if (attribEl) {
        attribEl.style.background = 'rgba(10,21,32,0.8)'
        attribEl.style.color = '#555'
        attribEl.style.fontSize = '9px'
      }

      mapRef.current = map
      tileRef.current = tile
    })

    return () => {
      mapRef.current?.remove()
      mapRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Sync tile layer when mode changes ─────────────────────────────────────
  useEffect(() => {
    if (!mapRef.current) return
    import('leaflet').then((L) => {
      if (!mapRef.current) return
      tileRef.current?.remove()
      const cfg = TILE_LAYERS[mapMode]
      tileRef.current = L.tileLayer(cfg.url, {
        attribution: cfg.attribution,
        subdomains: 'abcd',
        maxZoom: 18,
      }).addTo(mapRef.current)
    })
  }, [mapMode])

  // ── Update markers when stations change ───────────────────────────────────
  useEffect(() => {
    if (!mapRef.current) return
    import('leaflet').then((L) => {
      if (!mapRef.current) return

      // Remove old markers
      markersRef.current.forEach((m) => m.remove())
      markersRef.current = []

      stations.forEach((station) => {
        const color = STATUS_COLOR[station.status]
        const radius = station.status === 'critical' ? 11 : station.status === 'offline' ? 8 : 9

        const marker = L.circleMarker([station.lat, station.lng], {
          radius,
          fillColor: color,
          fillOpacity: 0.92,
          color: '#12121f',
          weight: 2,
          // @ts-expect-error – Leaflet extended option for pulsing
          className: station.status === 'critical' ? 'marker-pulse-critical' : station.status === 'offline' ? 'marker-pulse-offline' : 'marker-pulse-operational',
        })

        const popupContent = `
          <div style="
            font-family: Inter, sans-serif;
            min-width: 210px;
            padding: 4px;
          ">
            <div style="font-weight:700;font-size:13px;margin-bottom:4px;color:#111">${station.name}</div>
            <div style="color:#666;font-size:11px;margin-bottom:8px">${station.zone} · ${station.address}</div>
            <div style="background:#f5f5f5;border-radius:6px;padding:8px;font-size:12px;display:flex;flex-direction:column;gap:5px">
              <span style="color:${color};font-weight:800">● ${station.status.toUpperCase()}</span>
              <span>📦 <b>${Math.round(station.currentStock)}L</b> / ${station.maxCapacity}L</span>
              <span>🚗 <b>${station.queueLength}</b> vehicles waiting</span>
              <span style="color:${station.hoursToShortage < 12 ? 'red' : '#333'}">⏱ <b>${station.hoursToShortage}h</b> to shortage</span>
              <span>⚠️ Risk: <b>${station.riskScore}%</b></span>
            </div>
          </div>
        `

        marker.bindPopup(popupContent, { maxWidth: 260, className: 'fg-popup' })
        marker.on('click', () => setSelectedStation(station))
        marker.addTo(mapRef.current!)
        markersRef.current.push(marker)
      })
    })
  }, [stations])

  // ── Update user location marker ────────────────────────────────────────────
  useEffect(() => {
    if (!mapRef.current) return
    import('leaflet').then((L) => {
      if (!mapRef.current) return
      userMarkerRef.current?.remove()
      if (userLocation) {
        userMarkerRef.current = L.circleMarker([userLocation.lat, userLocation.lng], {
          radius: 10,
          fillColor: '#ffffff',
          fillOpacity: 1,
          color: '#00d4ff',
          weight: 4,
        })
          .bindPopup('<b>Your Location</b>')
          .addTo(mapRef.current)

        mapRef.current.flyTo([userLocation.lat, userLocation.lng], 12, { duration: 1.2 })
      }
    })
  }, [userLocation?.lat, userLocation?.lng, userLocation])

  const containerHeight = typeof height === 'number' ? `${height}px` : height

  return (
    <div style={{ position: 'relative', height: containerHeight, borderRadius: '12px', overflow: 'hidden' }}>
      {/* Map */}
      <div
        ref={containerRef}
        id="leaflet-map-container"
        style={{ width: '100%', height: '100%' }}
      />

      {/* Top-right controls */}
      <div style={{
        position: 'absolute', top: 12, right: 12, zIndex: 999,
        display: 'flex', gap: 8, alignItems: 'center',
      }}>
        <button
          onClick={() => setMapMode(m => m === 'dark' ? 'satellite' : 'dark')}
          style={{
            background: 'rgba(10,21,32,0.88)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 8,
            padding: '6px 12px',
            fontSize: '0.6875rem',
            color: '#fff',
            fontWeight: 600,
            cursor: 'pointer',
            backdropFilter: 'blur(8px)',
            letterSpacing: '0.03em',
          }}
        >
          {mapMode === 'dark' ? '🛰️ Satellite' : '🗺️ Dark Map'}
        </button>

        <div style={{
          background: 'rgba(10,21,32,0.88)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: 8,
          padding: '6px 12px',
          fontSize: '0.6875rem',
          color: '#00d4ff',
          fontWeight: 700,
          letterSpacing: '0.08em',
          backdropFilter: 'blur(8px)',
        }}>
          📡 LIVE · {stations.length} STATIONS
        </div>
      </div>

      {/* Legend */}
      <div style={{
        position: 'absolute', bottom: 24, left: 12, zIndex: 999,
        background: 'rgba(10,21,32,0.9)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 8,
        padding: '8px 12px',
        display: 'flex',
        gap: 12,
        alignItems: 'center',
        backdropFilter: 'blur(8px)',
      }}>
        {[
          { label: 'Operational', color: '#00ff88' },
          { label: 'Critical', color: '#ff7a30' },
          { label: 'Offline', color: '#ff3366' },
        ].map(item => (
          <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', color: '#fff', fontWeight: 500 }}>
            <div style={{
              width: 10, height: 10, borderRadius: '50%',
              background: item.color,
              boxShadow: `0 0 6px ${item.color}`,
            }} />
            {item.label}
          </div>
        ))}
      </div>

      {/* Popup style overrides */}
      <style>{`
        .fg-popup .leaflet-popup-content-wrapper {
          border-radius: 10px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.35);
          padding: 0;
        }
        .fg-popup .leaflet-popup-content {
          margin: 12px;
        }
        .fg-popup .leaflet-popup-tip {
          background: #fff;
        }
      `}</style>
    </div>
  )
}
