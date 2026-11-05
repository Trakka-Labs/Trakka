import { useEffect, useRef } from 'react'
import leaflet from 'leaflet'
import 'leaflet/dist/leaflet.css'

const containerStyle = {
  position: 'absolute',
  inset: 0,
  background: 'var(--color-ink-deep, #05070a)',
}

/**
 * dependency-light live map: single Leaflet instance, tile layer created
 * once, only marker positions are mutated on updates (no re-init) so
 * re-renders every few seconds are cheap.
 */
export default function LiveMap({ position, stops = [], follow = false }) {
  const holderRef = useRef(null)
  const mapRef = useRef(null)
  const markerRef = useRef(null)
  const balloonRef = useRef(null)
  const stopLayerRef = useRef(null)

  useEffect(() => {
    if (!holderRef.current || mapRef.current) return
    const map = leaflet.map(holderRef.current, {
      center: [6.335, 5.6037],
      zoom: 13,
      zoomControl: true,
      attributionControl: true,
    })
    leaflet
      .tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: '© OpenStreetMap',
      })
      .addTo(map)
    mapRef.current = map
  }, [])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !position) return
    const coords = [position.lat, position.lng]
    if (!markerRef.current) {
      const balloon = leaflet.divIcon({
        className: 'trakka-rider-balloon',
        html: '<span class="trakka-rider-dot"></span>',
        iconSize: [18, 18],
        iconAnchor: [9, 9],
      })
      balloonRef.current = balloon
      markerRef.current = leaflet
        .marker(coords, { icon: balloon, title: 'Rider' })
        .addTo(map)
    } else {
      markerRef.current.setLatLng(coords)
    }
    if (follow) {
      map.setView(coords, map.getZoom(), { animate: true, duration: 0.6 })
    }
  }, [position?.lat, position?.lng, follow, position])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    if (stopLayerRef.current) {
      stopLayerRef.current.remove()
      stopLayerRef.current = null
    }
    const valid = stops.filter(
      (stop) => Number.isFinite(stop.lat) && Number.isFinite(stop.lng),
    )
    if (!valid.length) return
    const layer = leaflet.layerGroup()
    valid.forEach((stop, index) => {
      leaflet
        .circleMarker([stop.lat, stop.lng], {
          radius: 7,
          color: '#f97316',
          fillColor: '#f97316',
          fillOpacity: 0.85,
          weight: 2,
        })
        .bindTooltip(`${index + 1}. ${stop.name ?? 'Stop'}`)
        .addTo(layer)
    })
    layer.addTo(map)
    stopLayerRef.current = layer
  }, [stops])

  return <div ref={holderRef} style={containerStyle} className="h-full w-full" />
}
