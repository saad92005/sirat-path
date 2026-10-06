import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { eventFor, HIJRI_MONTHS, hijriParts, isWhiteDay, upcomingEvents } from '../lib/hijri'
import { useSettings } from '../lib/settings'

const WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function CalendarPage() {
  const { hijriOffset } = useSettings()
  const [cursor, setCursor] = useState(() => { const d = new Date(); d.setDate(1); d.setHours(12, 0, 0, 0); return d })
  const todayKey = new Date().toDateString()

  const cells = useMemo(() => {
    const first = new Date(cursor)
    const days = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate()
    const out: (null | { date: Date; h: ReturnType<typeof hijriParts> })[] = Array(first.getDay()).fill(null)
    for (let i = 1; i <= days; i++) {
      const date = new Date(first.getFullYear(), first.getMonth(), i, 12)
      out.push({ date, h: hijriParts(date, hijriOffset) })
    }
    return out
  }, [cursor, hijriOffset])

  const hMonths = [...new Set(cells.filter(Boolean).map((c) => `${HIJRI_MONTHS[c!.h.month - 1]} ${c!.h.year}`))]
  const upcoming = useMemo(() => upcomingEvents(new Date(), hijriOffset, 7), [hijriOffset])
  const shift = (m: number) => setCursor((c) => new Date(c.getFullYear(), c.getMonth() + m, 1, 12))

  return (
    <div className="fade-in space-y-5">
      <h1 className="h-page">Islamic Calendar</h1>
      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <section className="card overflow-hidden">
          <div className="flex items-center gap-2 border-b border-line p-4">
            <button className="icon-btn" onClick={() => shift(-1)} aria-label="Previous month"><ChevronLeft /></button>
            <div className="flex-1 text-center">
              <p className="text-lg font-bold">{cursor.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</p>
              <p className="text-xs text-gold">{hMonths.join(' – ')} AH</p>
            </div>
            <button className="icon-btn" onClick={() => shift(1)} aria-label="Next month"><ChevronRight /></button>
          </div>
          <div className="grid grid-cols-7 border-b border-line text-center text-[11px] font-semibold uppercase text-muted">
            {WEEK.map((w) => <div key={w} className={`py-2 ${w === 'Fri' ? 'text-brand' : ''}`}>{w}</div>)}
          </div>
          <div className="grid grid-cols-7">
            {cells.map((c, i) => {
              if (!c) return <div key={i} className="aspect-square border-b border-r border-line/50 md:aspect-auto md:h-24" />
              const ev = eventFor(c.h)
              const isToday = c.date.toDateString() === todayKey
              return (
                <div key={i} className={`relative flex aspect-square flex-col border-b border-r border-line/50 p-1 md:aspect-auto md:h-24 md:p-2 ${ev ? (ev.kind === 'eid' ? 'bg-gold/15' : 'bg-brand/10') : ''}`}>
                  <span className={`grid size-7 place-items-center rounded-full text-sm font-semibold ${isToday ? 'bg-brand text-brand-ink' : ''}`}>{c.date.getDate()}</span>
                  <span className={`text-[10px] md:text-xs ${c.h.day === 1 ? 'font-bold text-gold' : 'text-muted'}`}>
                    {c.h.day === 1 ? HIJRI_MONTHS[c.h.month - 1].split(' ')[0] : c.h.day}
                  </span>
                  {isWhiteDay(c.h) && <span className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-gold/70" title="White day" />}
                  {ev && <span className="mt-auto hidden truncate text-[11px] font-semibold text-brand md:block">{ev.name}</span>}
                  {ev && <span className="absolute bottom-1 left-1/2 size-1.5 -translate-x-1/2 rounded-full bg-brand md:hidden" />}
                </div>
              )
            })}
          </div>
          <div className="flex flex-wrap gap-4 p-4 text-xs text-muted">
            <span className="flex items-center gap-1.5"><span className="size-3 rounded bg-gold/30" />Eid</span>
            <span className="flex items-center gap-1.5"><span className="size-3 rounded bg-brand/20" />Notable day</span>
            <span className="flex items-center gap-1.5"><span className="size-1.5 rounded-full bg-gold/70" />White days (13–15)</span>
          </div>
        </section>

        <section className="space-y-3">
          <p className="font-semibold">Upcoming</p>
          {upcoming.map((e) => {
            const days = Math.round((e.date.getTime() - Date.now()) / 86_400_000)
            return (
              <div key={e.date.toISOString()} className="card flex items-center gap-3 p-4">
                <div className={`grid size-12 shrink-0 place-items-center rounded-xl text-center ${e.kind === 'eid' ? 'bg-gold/20 text-gold' : 'bg-brand/10 text-brand'}`}>
                  <div><p className="text-lg font-bold leading-none">{e.date.getDate()}</p><p className="text-[10px] uppercase">{e.date.toLocaleDateString(undefined, { month: 'short' })}</p></div>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{e.name}</p>
                  <p className="text-xs text-muted">{e.hijri.day} {HIJRI_MONTHS[e.hijri.month - 1]} {e.hijri.year}</p>
                </div>
                <span className="chip">{days <= 0 ? 'Today' : `${days}d`}</span>
              </div>
            )
          })}
          <p className="text-xs text-muted">Based on the Umm al-Qura calendar. Local moon sighting may shift dates by a day; adjust in Settings.</p>
        </section>
      </div>
    </div>
  )
}
