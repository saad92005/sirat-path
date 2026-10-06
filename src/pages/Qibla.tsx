import { useEffect, useState } from 'react'
import { Compass } from 'lucide-react'
import { qiblaBearing } from '../lib/prayer'
import { useSettings } from '../lib/settings'
import LocationPicker from '../components/LocationPicker'

type OrientEvt = DeviceOrientationEvent & { webkitCompassHeading?: number }

export default function QiblaPage() {
  const { location } = useSettings()
  const [heading, setHeading] = useState<number | null>(null)
  const [sensor, setSensor] = useState<'idle' | 'on' | 'unavailable' | 'denied'>('idle')

  useEffect(() => {
    if (sensor !== 'on') return
    let got = false
    const onOrient = (e: OrientEvt) => {
      const h = e.webkitCompassHeading ?? (e.absolute && e.alpha != null ? 360 - e.alpha : null)
      if (h != null) { got = true; setHeading(h) }
    }
    const evt = 'ondeviceorientationabsolute' in window ? 'deviceorientationabsolute' : 'deviceorientation'
    window.addEventListener(evt, onOrient as EventListener)
    const t = setTimeout(() => { if (!got) setSensor('unavailable') }, 3000)
    return () => { window.removeEventListener(evt, onOrient as EventListener); clearTimeout(t) }
  }, [sensor])

  async function start() {
    const DOE = window.DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> } | undefined
    if (!DOE) { setSensor('unavailable'); return }
    if (DOE.requestPermission) {
      try { setSensor((await DOE.requestPermission()) === 'granted' ? 'on' : 'denied') } catch { setSensor('denied') }
    } else setSensor('on')
  }

  if (!location) {
    return (
      <div className="fade-in mx-auto max-w-md space-y-4">
        <h1 className="h-page">Qibla</h1>
        <p className="text-sm text-muted">Set your location to calculate the Qibla direction.</p>
        <LocationPicker />
      </div>
    )
  }

  const bearing = qiblaBearing(location.lat, location.lng)
  const rotation = heading != null ? bearing - heading : bearing
  const aligned = heading != null && Math.abs(((rotation % 360) + 540) % 360 - 180) < 4

  return (
    <div className="fade-in mx-auto max-w-md space-y-6 text-center">
      <h1 className="h-page">Qibla</h1>
      <div className="relative mx-auto aspect-square w-full max-w-80">
        <div className={`absolute inset-0 rounded-full border-8 transition-colors ${aligned ? 'border-brand' : 'border-surface-2'} bg-surface shadow-inner`} />
        <div className="absolute inset-0 transition-transform duration-300 ease-out" style={{ transform: `rotate(${heading != null ? -heading : 0}deg)` }}>
          {['N', 'E', 'S', 'W'].map((d, i) => (
            <span key={d} className={`absolute left-1/2 top-1/2 text-sm font-bold ${d === 'N' ? 'text-red-500' : 'text-muted'}`}
              style={{ transform: `translate(-50%,-50%) rotate(${i * 90}deg) translateY(-118px) rotate(${-i * 90}deg)` }}>{d}</span>
          ))}
        </div>
        <div className="absolute inset-0 transition-transform duration-300 ease-out" style={{ transform: `rotate(${rotation}deg)` }}>
          <div className="absolute left-1/2 top-[8%] h-[42%] w-1.5 -translate-x-1/2 rounded-full bg-gradient-to-t from-transparent to-gold" />
          <div className="absolute left-1/2 top-[3%] grid size-10 -translate-x-1/2 place-items-center rounded-lg bg-[#0b2a24] shadow-lg">
            <div className="h-5 w-6 rounded-sm border-t-4 border-[#d8b261] bg-black" />
          </div>
        </div>
        <div className="absolute left-1/2 top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold" />
      </div>

      <div>
        <p className="text-4xl font-bold tabular-nums">{bearing.toFixed(1)}°</p>
        <p className="text-sm text-muted">from true North, toward the Kaaba</p>
        {aligned && <p className="mt-2 font-semibold text-brand">You are facing the Qibla</p>}
      </div>

      {sensor === 'idle' && <button className="btn mx-auto" onClick={start}><Compass size={16} />Use device compass</button>}
      {sensor === 'on' && heading == null && <p className="text-sm text-muted">Waiting for compass… move your phone in a figure-8 to calibrate.</p>}
      {(sensor === 'unavailable' || sensor === 'denied') && (
        <p className="card p-4 text-sm text-muted">
          {sensor === 'denied' ? 'Compass permission was denied.' : 'No compass sensor detected on this device.'} Use the bearing above: face North, then turn clockwise {bearing.toFixed(0)}°.
        </p>
      )}
      <p className="text-xs text-muted">Keep the phone flat and away from metal or magnets for accuracy.</p>
    </div>
  )
}
