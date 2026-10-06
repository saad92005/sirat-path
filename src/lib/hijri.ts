// Hijri helpers on top of the browser's Umm al-Qura calendar (Intl) — no API, no library.

const fmt = (() => {
  try { return new Intl.DateTimeFormat('en-u-ca-islamic-umalqura-nu-latn', { day: 'numeric', month: 'numeric', year: 'numeric' }) }
  catch { return new Intl.DateTimeFormat('en-u-ca-islamic-nu-latn', { day: 'numeric', month: 'numeric', year: 'numeric' }) }
})()

export const HIJRI_MONTHS = [
  'Muharram', 'Safar', 'Rabiʿ al-Awwal', 'Rabiʿ al-Thani', 'Jumada al-Ula', 'Jumada al-Akhirah',
  'Rajab', 'Shaʿban', 'Ramadan', 'Shawwal', 'Dhu al-Qaʿdah', 'Dhu al-Hijjah',
]

export function hijriParts(date: Date, offset = 0) {
  const d = new Date(date); d.setDate(d.getDate() + offset)
  const parts = fmt.formatToParts(d)
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value)
  return { day: get('day'), month: get('month'), year: parseInt(parts.find((p) => p.type === 'year')!.value) }
}

// Widely observed dates. Actual local dates can differ by a day with moon sighting.
const EVENTS: { m: number; d: number; name: string; kind: 'eid' | 'major' | 'fast' }[] = [
  { m: 1, d: 1, name: 'Islamic New Year', kind: 'major' },
  { m: 1, d: 10, name: 'Day of ʿAshura', kind: 'fast' },
  { m: 9, d: 1, name: 'Ramadan begins', kind: 'major' },
  { m: 10, d: 1, name: 'Eid al-Fitr', kind: 'eid' },
  { m: 12, d: 8, name: 'Hajj begins', kind: 'major' },
  { m: 12, d: 9, name: 'Day of ʿArafah', kind: 'fast' },
  { m: 12, d: 10, name: 'Eid al-Adha', kind: 'eid' },
]

export function eventFor(h: { day: number; month: number }) {
  return EVENTS.find((e) => e.m === h.month && e.d === h.day) ?? null
}

/** White days (13–15) — commonly fasted each lunar month. */
export const isWhiteDay = (h: { day: number }) => h.day >= 13 && h.day <= 15

export function upcomingEvents(from: Date, offset = 0, count = 6) {
  const out: { date: Date; name: string; kind: string; hijri: ReturnType<typeof hijriParts> }[] = []
  const d = new Date(from); d.setHours(12, 0, 0, 0)
  for (let i = 0; i < 400 && out.length < count; i++) {
    const h = hijriParts(d, offset)
    const e = eventFor(h)
    if (e) out.push({ date: new Date(d), name: e.name, kind: e.kind, hijri: h })
    d.setDate(d.getDate() + 1)
  }
  return out
}
