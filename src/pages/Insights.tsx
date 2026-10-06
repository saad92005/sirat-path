import { useMemo } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { BookMarked, BookOpen, Flame, NotebookPen, Sparkles, Trophy } from 'lucide-react'
import { db } from '../lib/db'
import { longestStreak, streakOf } from '../lib/stats'
import { TOTAL_AYAHS } from '../lib/quran'

const WEEKS = 26

export default function Insights() {
  const reads = useLiveQuery(() => db.reads.toArray()) ?? []
  const bookmarks = useLiveQuery(() => db.bookmarks.count()) ?? 0
  const notes = useLiveQuery(() => db.notes.count()) ?? 0
  const dhikr = useLiveQuery(() => db.dhikr.toArray()) ?? []
  const plan = useLiveQuery(() => db.khatm.get('current'))

  const map = useMemo(() => new Map(reads.map((r) => [r.day, r.count])), [reads])
  const total = reads.reduce((a, r) => a + r.count, 0)
  const dhikrTotal = dhikr.reduce((a, d) => a + d.total, 0)

  // Heatmap grid: columns are weeks, rows are weekdays.
  const grid = useMemo(() => {
    const end = new Date(); end.setHours(12, 0, 0, 0)
    const start = new Date(end); start.setDate(end.getDate() - (WEEKS * 7 - 1) - end.getDay())
    const cols: { day: string; count: number; future: boolean }[][] = []
    const d = new Date(start)
    for (let w = 0; w <= WEEKS; w++) {
      const col = []
      for (let i = 0; i < 7; i++) {
        const k = d.toLocaleDateString('en-CA')
        col.push({ day: k, count: map.get(k) ?? 0, future: d > end })
        d.setDate(d.getDate() + 1)
      }
      cols.push(col)
    }
    return cols
  }, [map])

  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i))
    return { label: d.toLocaleDateString(undefined, { weekday: 'short' }), count: map.get(d.toLocaleDateString('en-CA')) ?? 0 }
  })
  const max7 = Math.max(1, ...last7.map((d) => d.count))

  const level = (c: number) => (c === 0 ? 'bg-surface-2' : c < 10 ? 'bg-brand/30' : c < 30 ? 'bg-brand/55' : c < 80 ? 'bg-brand/80' : 'bg-brand')

  const stats = [
    { icon: Flame, label: 'Current streak', value: `${streakOf(reads)} d`, color: 'text-orange-500' },
    { icon: Trophy, label: 'Longest streak', value: `${longestStreak(reads)} d`, color: 'text-gold' },
    { icon: BookOpen, label: 'Ayahs read', value: total.toLocaleString(), color: 'text-brand' },
    { icon: Sparkles, label: 'Dhikr count', value: dhikrTotal.toLocaleString(), color: 'text-brand' },
    { icon: BookMarked, label: 'Bookmarks', value: bookmarks, color: 'text-gold' },
    { icon: NotebookPen, label: 'Notes', value: notes, color: 'text-brand' },
  ]

  return (
    <div className="fade-in space-y-5">
      <h1 className="h-page">Insights</h1>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        {stats.map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="card p-4">
            <Icon size={18} className={color} />
            <p className="mt-3 text-2xl font-bold tabular-nums">{value}</p>
            <p className="text-xs text-muted">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
        <section className="card min-w-0 p-5">
          <p className="font-semibold">Reading activity · last 6 months</p>
          <div ref={(el) => { if (el) el.scrollLeft = el.scrollWidth }} className="no-scrollbar mt-4 overflow-x-auto">
            <div className="flex w-max gap-[3px]">
              {grid.map((col, i) => (
                <div key={i} className="flex flex-col gap-[3px]">
                  {col.map((c) => <div key={c.day} title={`${c.day}: ${c.count} ayahs`} className={`size-3 rounded-[3px] md:size-3.5 ${c.future ? 'opacity-0' : level(c.count)}`} />)}
                </div>
              ))}
            </div>
          </div>
          <div className="mt-3 flex items-center justify-end gap-1 text-[11px] text-muted">
            Less {[0, 5, 20, 50, 100].map((c) => <span key={c} className={`size-3 rounded-[3px] ${level(c)}`} />)} More
          </div>
        </section>

        <section className="card p-5">
          <p className="font-semibold">This week</p>
          <div className="mt-4 flex h-40 items-end gap-2">
            {last7.map((d, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-1">
                <span className="text-[10px] tabular-nums text-muted">{d.count || ''}</span>
                <div className="w-full rounded-t-lg bg-brand transition-all" style={{ height: `${(d.count / max7) * 100}%`, minHeight: 3, opacity: d.count ? 1 : 0.2 }} />
                <span className="text-[11px] text-muted">{d.label}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      {plan && (
        <section className="card p-5">
          <p className="font-semibold">Khatm</p>
          <div className="mt-3 h-3 overflow-hidden rounded-full bg-surface-2"><div className="h-full rounded-full bg-gold" style={{ width: `${(plan.doneIdx / TOTAL_AYAHS) * 100}%` }} /></div>
          <p className="mt-2 text-sm text-muted">{plan.doneIdx.toLocaleString()} of {TOTAL_AYAHS.toLocaleString()} ayahs · {plan.days}-day plan started {plan.startDate}</p>
        </section>
      )}
      <p className="text-xs text-muted">Ayahs are counted when they scroll into view in the reader. All statistics are stored only on this device.</p>
    </div>
  )
}
