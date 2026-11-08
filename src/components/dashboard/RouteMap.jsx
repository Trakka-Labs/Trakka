import { useEffect, useRef } from 'react'
import leaflet from 'leaflet'
import 'leaflet/dist/leaflet.css'

const containerStyle = {
  position: 'absolute',
  inset: 0,
  background: 'var(--color-ink-deep, #eff4ff)',
}

const SETTLED = new Set(['completed', 'delivered', 'failed', 'skipped'])

function pinColor(stop) {
  if (SETTLED.has(stop.status)) return '#168353'
  if (stop.status === 'in_transit') return '#D95A08'
  if (stop.status === 'pickup_in_progress') return '#008EBF'
  return '#45464D'
}

/**
 * Route-run map: numbered stop pins, the planned sequence as a dashed path,
 * the rider's recorded track as a solid line, and a heading arrow for their
 * latest position. The Leaflet instance is created once; only layers and
 * marker positions are replaced on refreshes so 5s polling stays cheap.
 */
export default function RouteMap({
  stops = [],
  track = [],
  position = null,
  className = '',
}) {
  const holderRef = useRef(null)
  const mapRef = useRef(null)
  const planRef = useRef(null)
  const trackRef = useRef(null)
  const stopLayerRef = useRef(null)
  const riderRef = useRef(null)
  const fittedRef = useRef('')

  useEffect(() => {
    if (!holderRef.current || mapRef.current) return undefined
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
    return () => {
      map.remove()
      mapRef.current = null
      // Leaflet removal drops the marker elements; clear the cached handles so
      // a remount (or StrictMode double-invoke) rebuilds them instead of
      // mutating detached markers.
      planRef.current = null
      trackRef.current = null
      stopLayerRef.current = null
      riderRef.current = null
      fittedRef.current = ''
    }
  }, [])

  // Planned sequence (dashed) behind the pins.
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    planRef.current?.remove()
    const points = stops
      .filter((stop) => Number.isFinite(stop.lat) && Number.isFinite(stop.lng))
      .map((stop) => [stop.lat, stop.lng])
    if (points.length < 2) return
    planRef.current = leaflet
      .polyline(points, {
        color: '#45464D',
        weight: 2.5,
        opacity: 0.8,
        dashArray: '3 7',
        lineCap: 'round',
      })
      .addTo(map)
  }, [stops])

  // Recorded rider track (solid).
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    trackRef.current?.remove()
    const points = track
      .filter((point) => Number.isFinite(point.lat) && Number.isFinite(point.lng))
      .map((point) => [point.lat, point.lng])
    if (points.length < 2) return
    trackRef.current = leaflet
      .polyline(points, {
        color: '#008EBF',
        weight: 3,
        opacity: 0.85,
        lineCap: 'round',
      })
      .addTo(map)
  }, [track])

  // Numbered stop pins.
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    stopLayerRef.current?.remove()
    const layer = leaflet.layerGroup()
    stops.forEach((stop, index) => {
      if (!Number.isFinite(stop.lat) || !Number.isFinite(stop.lng)) return
      const colour = pinColor(stop)
      const marker = leaflet.marker([stop.lat, stop.lng], {
        icon: leaflet.divIcon({
          className: 'trakka-route-pin-wrap',
          html: `<span class="trakka-route-pin" style="background:${colour}">${String(
            index + 1,
          ).padStart(2, '0')}</span>`,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        }),
        title: `${index + 1}. ${stop.recipientName ?? 'Stop'} — ${stop.dropoffNeighborhood ?? ''}`,
        zIndexOffset: 200,
      })
      marker.bindTooltip(
        `${index + 1}. ${stop.recipientName ?? 'Stop'}${
          stop.dropoffNeighborhood ? ` · ${stop.dropoffNeighborhood}` : ''
        }`,
      )
      marker.addTo(layer)
    })
    layer.addTo(map)
    stopLayerRef.current = layer
  }, [stops])

  // Live rider arrow.
  useEffect(() => {
    const map = mapRef.current
    
    if (!map) return
    if (!position) {
      riderRef.current?.remove()
      riderRef.current = null
      return
    }
    const heading = position.headingDegrees ?? 0
    const icon = leaflet.divIcon({
      className: 'trakka-route-rider-wrap',
      html: `<span class="trakka-route-rider" style="transform:rotate(${heading}deg)">▲</span>`,
      iconSize: [26, 26],
      iconAnchor: [13, 13],
    })
    if (!riderRef.current || !riderRef.current._map) {
      riderRef.current = leaflet
        .marker([position.lat, position.lng], { icon, title: 'Rider', zIndexOffset: 500 })
        .addTo(map)
    } else {
      riderRef.current.setLatLng([position.lat, position.lng])
      riderRef.current.setIcon(icon)
    }
  }, [position, position?.lat, position?.lng, position?.headingDegrees])

  // Fit only when the route membership changes, so polling does not fight the
  // operator panning around the map.
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    const signature = stops.map((stop) => stop.routeTaskId).join('|')
    if (!signature || signature === fittedRef.current) return
    fittedRef.current = signature
    const points = stops
      .filter((stop) => Number.isFinite(stop.lat) && Number.isFinite(stop.lng))
      .map((stop) => [stop.lat, stop.lng])
    if (position) points.push([position.lat, position.lng])
    if (!points.length) return
    map.fitBounds(leaflet.latLngBounds(points), { padding: [48, 48], maxZoom: 15 })
  }, [stops, position])

  return (
    <div ref={holderRef} style={containerStyle} className={`h-full w-full ${className}`} />
  )
}
