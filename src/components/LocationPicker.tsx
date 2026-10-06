import { useState } from 'react'
import { LocateFixed, Loader2 } from 'lucide-react'
import { CITIES } from '../lib/cities'
import { setSettings, useSettings } from '../lib/settings'

export default function LocationPicker() {
  const { location } = useSettings()
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [lat, setLat] = useState(location?.lat.toString() ?? '')
  const [lng, setLng] = useState(location?.lng.toString() ?? '')

  function useDevice() {
    if (!navigator.geolocation) { setErr('Geolocation is not supported here — pick a city instead.'); return }
    setBusy(true); setErr(null)
    navigator.geolocation.getCurrentPosition(
      (p) => {
        const { latitude, longitude } = p.coords
        setSettings({ location: { lat: latitude, lng: longitude, label: `My location (${latitude.toFixed(2)}, ${longitude.toFixed(2)})` } })
        setLat(latitude.toFixed(4)); setLng(longitude.toFixed(4)); setBusy(false)
      },
      (e) => { setErr(e.code === 1 ? 'Permission denied — choose a city or enter coordinates.' : 'Could not get location.'); setBusy(false) },
      { enableHighAccuracy: false, timeout: 15000 },
    )
  }

  return (
    <div className="space-y-3">
      <button className="btn w-full" onClick={useDevice} disabled={busy}>
        {busy ? <Loader2 className="animate-spin" size={16} /> : <LocateFixed size={16} />} Use my location
      </button>
      {err && <p className="text-sm text-red-500">{err}</p>}
      <select className="input" value={CITIES.find((c) => c.label === location?.label)?.label ?? ''}
        onChange={(e) => { const c = CITIES.find((x) => x.label === e.target.value); if (c) { setSettings({ location: c }); setLat(String(c.lat)); setLng(String(c.lng)) } }}>
        <option value="">Or choose a city…</option>
        {CITIES.map((c) => <option key={c.label}>{c.label}</option>)}
      </select>
      <div className="flex gap-2">
        <input className="input" inputMode="decimal" placeholder="Latitude" value={lat} onChange={(e) => setLat(e.target.value)} />
        <input className="input" inputMode="decimal" placeholder="Longitude" value={lng} onChange={(e) => setLng(e.target.value)} />
        <button className="btn-ghost shrink-0" onClick={() => {
          const la = Number(lat), lo = Number(lng)
          if (!lat || !lng || Number.isNaN(la) || Number.isNaN(lo) || Math.abs(la) > 90 || Math.abs(lo) > 180) { setErr('Enter a valid latitude (−90..90) and longitude (−180..180).'); return }
          setErr(null); setSettings({ location: { lat: la, lng: lo, label: `Custom (${la.toFixed(2)}, ${lo.toFixed(2)})` } })
        }}>Set</button>
      </div>
    </div>
  )
}
