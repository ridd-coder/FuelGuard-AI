'use client'

import { useState, useCallback, useRef } from 'react'
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api'
import type { SimStation } from '@/lib/simulation'

interface MapProps {
  stations: SimStation[]
  height?: number | string
  userLocation?: { lat: number, lng: number } | null
}

const STATUS_HEX = {
  operational: '#00ff88',
  critical: '#ff7a30',
  offline: '#ff3366',
}

const darkMapStyle = [
  { elementType: "geometry", stylers: [{ color: "#212121" }] },
  { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#212121" }] },
  { featureType: "administrative", elementType: "geometry", stylers: [{ color: "#757575" }] },
  { featureType: "administrative.country", elementType: "labels.text.fill", stylers: [{ color: "#9e9e9e" }] },
  { featureType: "administrative.land_parcel", stylers: [{ visibility: "off" }] },
  { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#bdbdbd" }] },
  { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
  { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#181818" }] },
  { featureType: "poi.park", elementType: "labels.text.fill", stylers: [{ color: "#616161" }] },
  { featureType: "poi.park", elementType: "labels.text.stroke", stylers: [{ color: "#1b1b1b" }] },
  { featureType: "road", elementType: "geometry.fill", stylers: [{ color: "#2c2c2c" }] },
  { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#8a8a8a" }] },
  { featureType: "road.arterial", elementType: "geometry", stylers: [{ color: "#373737" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#3c3c3c" }] },
  { featureType: "road.highway.controlled_access", elementType: "geometry", stylers: [{ color: "#4e4e4e" }] },
  { featureType: "road.local", elementType: "labels.text.fill", stylers: [{ color: "#616161" }] },
  { featureType: "transit", elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#000000" }] },
  { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#3d3d3d" }] }
]

export default function InteractiveMap({ stations, height = 420, userLocation }: MapProps) {
  const [selectedStation, setSelectedStation] = useState<SimStation | null>(null)
  const mapRef = useRef<google.maps.Map | null>(null)
  
  const onMapLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map
  }, [])
  
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''
  })

  const mapContainerStyle = {
    width: '100%',
    height: typeof height === 'number' ? `${height}px` : height,
    borderRadius: '12px',
    overflow: 'hidden',
    border: '1px solid var(--border-subtle)',
    position: 'relative' as const
  }

  // Focus on current location or India initially
  const center = userLocation || {
    lat: 22.5937,
    lng: 78.9629
  }

  if (loadError) return <div style={{ color: 'red', padding: '1rem' }}>Map load error</div>
  if (!isLoaded) return <div style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Loading Real-time Map...</div>

  return (
    <div className="map-wrapper" style={{ height, position: 'relative' }}>
      <GoogleMap
        onLoad={onMapLoad}
        mapContainerStyle={mapContainerStyle}
        zoom={userLocation ? 10 : 5}
        center={center}
        options={{
          styles: darkMapStyle,
          disableDefaultUI: true,
          zoomControl: true,
        }}
      >
        {userLocation && (
          <Marker
            position={userLocation}
            icon={{
              path: window.google.maps.SymbolPath.CIRCLE,
              fillColor: '#ffffff',
              fillOpacity: 1,
              strokeWeight: 4,
              strokeColor: '#00d4ff',
              scale: 8,
            }}
            zIndex={999}
          />
        )}
        {stations.map(station => (
          <Marker
            key={station.id}
            position={{ lat: station.lat, lng: station.lng }}
            onClick={() => {
              setSelectedStation(station)
              if (mapRef.current) {
                mapRef.current.panTo({ lat: station.lat, lng: station.lng })
                mapRef.current.setZoom(13)
              }
            }}
            icon={{
              path: window.google.maps.SymbolPath.CIRCLE,
              fillColor: STATUS_HEX[station.status],
              fillOpacity: 0.9,
              strokeWeight: 2,
              strokeColor: '#ffffff',
              scale: station.status === 'critical' ? 9 : 7,
            }}
          />
        ))}

        {selectedStation && (
          <InfoWindow
            position={{ lat: selectedStation.lat, lng: selectedStation.lng }}
            onCloseClick={() => setSelectedStation(null)}
          >
            <div style={{ color: '#1a1a1a', padding: '8px', minWidth: '220px', fontFamily: 'Inter, sans-serif' }}>
              <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '4px' }}>
                {selectedStation.name}
              </div>
              <div style={{ color: '#666', fontSize: '12px', marginBottom: '8px' }}>
                {selectedStation.zone} · {selectedStation.address}
              </div>
              <div style={{ padding: '8px', background: '#f5f5f5', borderRadius: '4px', fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <span style={{ color: STATUS_HEX[selectedStation.status], fontWeight: 800 }}>
                  ● {selectedStation.status.toUpperCase()}
                </span>
                <span>📦 <b>{selectedStation.currentStock}L</b> / {selectedStation.maxCapacity}L</span>
                <span>🚗 <b>{selectedStation.queueLength}</b> vehicles waiting</span>
                <span style={{ color: selectedStation.hoursToShortage < 12 ? 'red' : '#333' }}>
                  ⏱ <b>{selectedStation.hoursToShortage}h</b> to shortage
                </span>
              </div>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
      
      {/* Map title overlay */}
      <div style={{
        position: 'absolute',
        top: '12px',
        right: '12px',
        background: 'rgba(10,21,32,0.85)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '8px',
        padding: '6px 12px',
        fontSize: '0.6875rem',
        color: 'var(--neon-cyan)',
        fontWeight: 700,
        letterSpacing: '0.08em',
        backdropFilter: 'blur(8px)',
        zIndex: 10
      }}>
        📡 LIVE · {stations.length} STATIONS
      </div>

       {/* Legend overlay */}
       <div style={{
        position: 'absolute',
        bottom: '24px',
        left: '12px',
        background: 'rgba(10,21,32,0.9)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '8px',
        padding: '8px 12px',
        display: 'flex',
        gap: '12px',
        alignItems: 'center',
        backdropFilter: 'blur(8px)',
        zIndex: 10
      }}>
        {[
          { label: 'Operational', color: '#00ff88' },
          { label: 'Critical', color: '#ff7a30' },
          { label: 'Offline', color: '#ff3366' },
        ].map(item => (
          <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#fff', fontWeight: 500 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: item.color, boxShadow: `0 0 6px ${item.color}` }}/>
            {item.label}
          </div>
        ))}
      </div>
    </div>
  )
}
