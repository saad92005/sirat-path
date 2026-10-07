import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { greatCircle, KAABA } from '../lib/compass'

/** OpenStreetMap with the exact great-circle line from the user to the Kaʿbah. */
export default function QiblaMap({ lat, lng, accuracy }: { lat: number; lng: number; accuracy?: number | null }) {
  const el = useRef<HTMLDivElement>(null)
  const map = useRef<L.Map | null>(null)

  useEffect(() => {
    if (!el.current) return
    const m = L.map(el.current, { zoomControl: true, attributionControl: true })
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '© OpenStreetMap contributors' }).addTo(m)
    map.current = m
    return () => { m.remove(); map.current = null }
  }, [])

  useEffect(() => {
    const m = map.current
    if (!m) return
    const layer = L.layerGroup().addTo(m)
    const brand = getComputedStyle(document.documentElement).getPropertyValue('--gold').trim() || '#c9a227'
    L.polyline(greatCircle({ lat, lng }, KAABA), { color: brand, weight: 4, opacity: 0.95 }).addTo(layer)
    if (accuracy) L.circle([lat, lng], { radius: accuracy, color: '#2563eb', weight: 1, fillOpacity: 0.08 }).addTo(layer)
    L.circleMarker([lat, lng], { radius: 7, color: '#fff', weight: 2, fillColor: '#2563eb', fillOpacity: 1 }).addTo(layer).bindTooltip('You')
    L.marker([KAABA.lat, KAABA.lng], {
      icon: L.divIcon({ className: '', html: '<div style="font-size:26px;line-height:1;transform:translate(-50%,-60%)">🕋</div>' }),
    }).addTo(layer).bindTooltip('Kaʿbah')
    // Start zoomed in on the user so the line's direction relative to streets/buildings is clear.
    m.setView([lat, lng], 16)
    return () => { layer.remove() }
  }, [lat, lng, accuracy])

  return <div ref={el} className="h-80 w-full overflow-hidden rounded-2xl border border-line" aria-label="Map showing the Qibla line" />
}
