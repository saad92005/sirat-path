import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { Compass, Crosshair, Loader2, Map as MapIcon } from 'lucide-react'
import { qiblaBearing } from '../lib/prayer'
import { setSettings, useSettings } from '../lib/settings'
import { declination, delta, headingFromEuler, KAABA, norm } from '../lib/compass'
import LocationPicker from '../components/LocationPicker'
import { useOnline } from '../lib/online'

const QiblaMap = lazy(() => import('../components/QiblaMap'))

type OrientEvt = DeviceOrientationEvent & { webkitCompassHeading?: number; webkitCompassAccuracy?: number }
type Sensor = 'idle' | 'on' | 'unavailable' | 'denied'

const screenAngle = () => (screen.orientation?.angle ?? (window as unknown as { orientation?: number }).orientation ?? 0)

export default function QiblaPage() {
  const { location } = useSettings()
  const [sensor, setSensor] = useState<Sensor>('idle')
  const [heading, setHeading] = useState<number | null>(null) // unwrapped, true north, smoothed
  const [sensorAcc, setSensorAcc] = useState<number | null>(null)
  const [gps, setGps] = useState<{ busy: boolean; acc: number | null; err: string | null }>({ busy: false, acc: null, err: null })
  const [showMap, setShowMap] = useState(() => !('ontouchstart' in window))
  const decl = location ? declination(location.lat, location.lng) : 0
  const declRef = useRef(decl); declRef.current = decl
  const buzzed = useRef(false)
  const online = useOnline()

  // Compass: tilt-compensated, corrected to true north, screen-rotation aware, low-pass filtered.
  useEffect(() => {
    if (sensor !== 'on') return
    let got = false, raf = 0
    let sx = 0, sy = 0, has = false // smoothed unit vector
    let shown: number | null = null // unwrapped displayed heading
    const onOrient = (e: OrientEvt) => {
      let mag: number | null = null
      if (typeof e.webkitCompassHeading === 'number') { mag = e.webkitCompassHeading; if (e.webkitCompassAccuracy != null) setSensorAcc(e.webkitCompassAccuracy) }
      else if (e.absolute && e.alpha != null && e.beta != null && e.gamma != null) mag = headingFromEuler(e.alpha, e.beta, e.gamma)
      if (mag == null) return
      got = true
      const h = norm(mag + declRef.current + screenAngle()) * Math.PI / 180
      if (!has) { sx = Math.cos(h); sy = Math.sin(h); has = true } else { sx += (Math.cos(h) - sx) * 0.15; sy += (Math.sin(h) - sy) * 0.15 }
    }
    const tick = () => {
      if (has) {
        const target = norm(Math.atan2(sy, sx) * 180 / Math.PI)
        shown = shown == null ? target : shown + delta(norm(shown), target)
        setHeading(Math.round(shown * 10) / 10)
      }
      raf = requestAnimationFrame(tick)
    }
    const evt = 'ondeviceorientationabsolute' in window ? 'deviceorientationabsolute' : 'deviceorientation'
    window.addEventListener(evt, onOrient as EventListener)
    raf = requestAnimationFrame(tick)
    const t = setTimeout(() => { if (!got) setSensor('unavailable') }, 3000)
    return () => { window.removeEventListener(evt, onOrient as EventListener); cancelAnimationFrame(raf); clearTimeout(t) }
  }, [sensor])

  async function start() {
    const DOE = window.DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> } | undefined
    if (!DOE) { setSensor('unavailable'); return }
    if (DOE.requestPermission) {
      try { setSensor((await DOE.requestPermission()) === 'granted' ? 'on' : 'denied') } catch { setSensor('denied') }
    } else setSensor('on')
  }

  function preciseLocation() {
    if (!navigator.geolocation) { setGps({ busy: false, acc: null, err: 'Location is not supported in this browser.' }); return }
    setGps({ busy: true, acc: null, err: null })
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setSettings({ location: { lat: coords.latitude, lng: coords.longitude, label: `My location (${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)})` } })
        setGps({ busy: false, acc: Math.round(coords.accuracy), err: null })
      },
      (e) => setGps({ busy: false, acc: null, err: e.code === 1 ? 'Location permission denied.' : 'Could not get a GPS fix — try near a window or outdoors.' }),
      { enableHighAccuracy: true, maximumAge: 0, timeout: 20000 },
    )
  }

  const bearing = location ? qiblaBearing(location.lat, location.lng) : 0
  const rel = heading != null ? bearing - heading : bearing // needle angle, continuous
  const off = heading != null ? delta(norm(heading), bearing) : null
  const aligned = off != null && Math.abs(off) <= 3

  useEffect(() => {
    if (aligned && !buzzed.current) { buzzed.current = true; navigator.vibrate?.(60) }
    if (!aligned) buzzed.current = false
  }, [aligned])

  if (!location) {
    return (
      <div className="fade-in mx-auto max-w-md space-y-4">
        <h1 className="h-page">Qibla</h1>
        <p className="text-sm text-muted">Set your location to calculate the Qibla direction.</p>
        <button className="btn w-full" onClick={preciseLocation} disabled={gps.busy}>{gps.busy ? <Loader2 size={16} className="animate-spin" /> : <Crosshair size={16} />}Use precise GPS location</button>
        {gps.err && <p className="text-sm text-red-500">{gps.err}</p>}
        <LocationPicker />
      </div>
    )
  }

  const toRad = (d: number) => (d * Math.PI) / 180
  const dLat = toRad(KAABA.lat - location.lat), dLng = toRad(KAABA.lng - location.lng)
  const hav = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(location.lat)) * Math.cos(toRad(KAABA.lat)) * Math.sin(dLng / 2) ** 2
  const distanceKm = 6371 * 2 * Math.atan2(Math.sqrt(hav), Math.sqrt(1 - hav))
  const ticks = Array.from({ length: 72 }, (_, i) => i * 5)

  return (
    <div className="fade-in mx-auto max-w-md space-y-5 text-center lg:max-w-4xl">
      <h1 className="h-page text-start">Qibla</h1>
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 lg:items-start">
        <div className="space-y-5">
          {/* Compass dial */}
          <div className="relative mx-auto aspect-square w-full max-w-80 overflow-hidden rounded-full">
            <div className={`absolute inset-0 rounded-full border-[6px] bg-surface shadow-inner transition-colors ${aligned ? 'border-brand' : 'border-surface-2'}`} />
            <div className="absolute inset-0 will-change-transform" style={{ transform: `rotate(${heading != null ? -heading : 0}deg)` }}>
              {ticks.map((d) => (
                <span key={d} className="absolute inset-y-0 left-1/2 w-0.5 -translate-x-1/2" style={{ transform: `rotate(${d}deg)` }}>
                  <span className={`mx-auto mt-2.5 block w-full rounded-full ${d % 90 === 0 ? 'h-3 bg-ink/60' : d % 30 === 0 ? 'h-2.5 bg-muted' : 'h-1.5 bg-line'}`} />
                </span>
              ))}
              {['N', 'E', 'S', 'W'].map((d, i) => (
                <span key={d} className={`absolute left-1/2 top-1/2 text-sm font-bold ${d === 'N' ? 'text-red-500' : 'text-muted'}`}
                  style={{ transform: `translate(-50%,-50%) rotate(${i * 90}deg) translateY(calc(-1 * min(112px, 34vw))) rotate(${-i * 90}deg)` }}>{d}</span>
              ))}
            </div>
            {/* fixed top marker = the direction the phone is pointing */}
            <div className="absolute left-1/2 top-0 h-4 w-1 -translate-x-1/2 rounded-b bg-ink/70" />
            <div className="absolute inset-0 will-change-transform" style={{ transform: `rotate(${rel}deg)` }}>
              <div className="absolute left-1/2 top-[10%] h-[40%] w-1.5 -translate-x-1/2 rounded-full bg-gradient-to-t from-transparent to-gold" />
              <div className="absolute left-1/2 top-[3%] -translate-x-1/2 text-3xl drop-shadow">🕋</div>
            </div>
            <div className="absolute left-1/2 top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold ring-4 ring-surface" />
          </div>

          <div>
            <p className="text-4xl font-bold tabular-nums">{bearing.toFixed(1)}°</p>
            <p className="text-sm text-muted">from true North toward the Kaʿbah · {Math.round(distanceKm).toLocaleString()} km</p>
            {heading != null && (
              <p className={`mt-2 font-semibold ${aligned ? 'text-brand' : 'text-ink'}`}>
                {aligned ? '✓ You are facing the Qibla' : `Turn ${off! > 0 ? 'right' : 'left'} ${Math.abs(off!).toFixed(0)}°`}
              </p>
            )}
          </div>

          {sensor === 'idle' && <button className="btn mx-auto" onClick={start}><Compass size={16} />Use device compass</button>}
          {sensor === 'on' && heading == null && <p className="text-sm text-muted">Waiting for compass… move your phone in a figure-8 to calibrate.</p>}
          {sensor === 'on' && sensorAcc != null && (sensorAcc < 0 || sensorAcc > 15) && (
            <p className="rounded-xl bg-gold/10 p-3 text-sm text-muted">Compass accuracy is low (±{sensorAcc < 0 ? '?' : Math.round(sensorAcc)}°). Move the phone in a figure-8 and keep away from metal.</p>
          )}
          {(sensor === 'unavailable' || sensor === 'denied') && (
            <p className="card p-4 text-sm text-muted">
              {sensor === 'denied' ? 'Compass permission was denied.' : 'No compass sensor on this device.'} Use the map — it shows the exact line to the Kaʿbah — or face North and turn clockwise {bearing.toFixed(0)}°.
            </p>
          )}
        </div>

        <div className="space-y-3">
          <div className="card space-y-2 p-4 text-start text-sm">
            <p className="font-semibold">Your location</p>
            <p className="text-muted">{location.label} · {location.lat.toFixed(4)}, {location.lng.toFixed(4)}{gps.acc != null && ` · ±${gps.acc} m`}</p>
            <button className="btn-ghost w-full" onClick={preciseLocation} disabled={gps.busy}>{gps.busy ? <Loader2 size={16} className="animate-spin" /> : <Crosshair size={16} />}Use precise GPS location</button>
            {gps.err && <p className="text-red-500">{gps.err}</p>}
            <p className="text-xs text-muted">Magnetic declination here: {decl >= 0 ? '+' : ''}{decl.toFixed(1)}° (corrected automatically, WMM 2025).</p>
          </div>
          {showMap ? (
            <Suspense fallback={<div className="grid h-80 place-items-center rounded-2xl border border-line"><Loader2 className="animate-spin text-muted" /></div>}>
              <QiblaMap lat={location.lat} lng={location.lng} accuracy={gps.acc} />
              {!online && <p className="text-xs text-gold">Offline: map areas you viewed before still show; the compass and bearing above work fully offline.</p>}
              <p className="text-xs text-muted">The gold line is the exact shortest path to the Kaʿbah. Line it up with a street or wall you can see.</p>
            </Suspense>
          ) : (
            <button className="btn-ghost w-full" onClick={() => setShowMap(true)}><MapIcon size={16} />Show Qibla on map</button>
          )}
        </div>
      </div>
      <p className="text-xs text-muted">For best accuracy: hold the phone flat, away from metal, magnets and electronics.</p>
    </div>
  )
}
