import { CalculationMethod, Coordinates, Madhab, PrayerTimes, Qibla, SunnahTimes } from 'adhan'
import type { Settings } from './settings'

export const METHODS: Record<string, string> = {
  MuslimWorldLeague: 'Muslim World League',
  Karachi: 'University of Islamic Sciences, Karachi',
  Egyptian: 'Egyptian General Authority',
  UmmAlQura: 'Umm al-Qura, Makkah',
  NorthAmerica: 'ISNA (North America)',
  Dubai: 'Dubai',
  Qatar: 'Qatar',
  Kuwait: 'Kuwait',
  MoonsightingCommittee: 'Moonsighting Committee',
  Singapore: 'Singapore',
  Turkey: 'Diyanet, Turkey',
  Tehran: 'Tehran',
}

export const PRAYERS = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'] as const
export type PrayerName = (typeof PRAYERS)[number]
export const PRAYER_LABEL: Record<PrayerName, string> = {
  fajr: 'Fajr', sunrise: 'Sunrise', dhuhr: 'Dhuhr', asr: 'Asr', maghrib: 'Maghrib', isha: 'Isha',
}

/** Computed fully on-device with the open-source `adhan` library — no API call. */
export function computeTimes(s: Settings, date = new Date()) {
  if (!s.location) return null
  const coords = new Coordinates(s.location.lat, s.location.lng)
  const factory = (CalculationMethod as unknown as Record<string, () => ReturnType<typeof CalculationMethod.MuslimWorldLeague>>)[s.method]
    ?? CalculationMethod.MuslimWorldLeague
  const params = factory()
  params.madhab = s.madhab === 'Hanafi' ? Madhab.Hanafi : Madhab.Shafi
  Object.assign(params.adjustments, s.adjustments)
  const times = new PrayerTimes(coords, date, params)
  return { times, sunnah: new SunnahTimes(times) }
}

export function nextPrayer(s: Settings, now = new Date()) {
  const today = computeTimes(s, now)
  if (!today) return null
  for (const p of PRAYERS) {
    if (p === 'sunrise') continue
    if (today.times[p] > now) return { name: p, at: today.times[p] }
  }
  const tomorrow = new Date(now); tomorrow.setDate(now.getDate() + 1)
  return { name: 'fajr' as PrayerName, at: computeTimes(s, tomorrow)!.times.fajr }
}

export const qiblaBearing = (lat: number, lng: number) => Qibla(new Coordinates(lat, lng))

export const fmtTime = (d: Date) => d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })

export function fmtCountdown(ms: number) {
  const t = Math.max(0, Math.floor(ms / 1000))
  const h = Math.floor(t / 3600), m = Math.floor((t % 3600) / 60), sec = t % 60
  return `${h}h ${String(m).padStart(2, '0')}m ${String(sec).padStart(2, '0')}s`
}

/** Hijri date via the browser's built-in Umm al-Qura calendar — no library, no API. */
export function hijri(date: Date, offsetDays = 0) {
  const d = new Date(date); d.setDate(d.getDate() + offsetDays)
  try {
    return new Intl.DateTimeFormat('en-u-ca-islamic-umalqura', { day: 'numeric', month: 'long', year: 'numeric' }).format(d)
  } catch {
    return new Intl.DateTimeFormat('en-u-ca-islamic', { day: 'numeric', month: 'long', year: 'numeric' }).format(d)
  }
}
