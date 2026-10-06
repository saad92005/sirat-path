import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { Flame, Target, Trash2 } from 'lucide-react'
import { db, today } from '../lib/db'
import { fromAbs, TOTAL_AYAHS, useQuran } from '../lib/quran'
import Loading from '../components/Loading'

const PRESETS = [7, 15, 30, 60, 90, 365]

function streak(days: Set<string>) {
  let n = 0
  const d = new Date()
  if (!days.has(today())) d.setDate(d.getDate() - 1)
  while (days.has(d.toLocaleDateString('en-CA'))) { n++; d.setDate(d.getDate() - 1) }
  return n
}

export default function Khatm() {
  const { data, error } = useQuran()
  const plan = useLiveQuery(() => db.khatm.get('current'))
  const reads = useLiveQuery(() => db.reads.toArray()) ?? []
  const [days, setDays] = useState(30)
  if (!data) return <Loading error={error} />

  if (!plan) {
    return (
      <div className="fade-in mx-auto max-w-lg space-y-5">
        <h1 className="h-page">Khatm Planner</h1>
        <p className="text-muted">Choose how many days you want to complete the Quran in. Sirat Path splits it into daily portions.</p>
        <div className="grid grid-cols-3 gap-2">
          {PRESETS.map((d) => <button key={d} onClick={() => setDays(d)} className={d === days ? 'btn' : 'btn-ghost'}>{d} days</button>)}
        </div>
        <input type="range" min={3} max={365} value={days} onChange={(e) => setDays(+e.target.value)} className="w-full accent-[var(--brand)]" />
        <p className="card p-4 text-center">≈ <b>{Math.ceil(TOTAL_AYAHS / days)}</b> ayahs / day · <b>{(604 / days).toFixed(1)}</b> pages / day</p>
        <button className="btn w-full" onClick={() => db.khatm.put({ id: 'current', startDate: today(), days, startIdx: 0, doneIdx: 0 })}>
          <Target size={16} />Start {days}-day Khatm
        </button>
      </div>
    )
  }

  const elapsed = Math.floor((Date.parse(today()) - Date.parse(plan.startDate)) / 86_400_000) + 1
  const perDay = Math.ceil(TOTAL_AYAHS / plan.days)
  const expected = Math.min(TOTAL_AYAHS, perDay * elapsed)
  const todayTarget = Math.max(0, expected - plan.doneIdx)
  const next = fromAbs(data, Math.min(plan.doneIdx, TOTAL_AYAHS - 1))
  const end = fromAbs(data, Math.min(expected, TOTAL_AYAHS) - 1)
  const pct = plan.doneIdx / TOTAL_AYAHS
  const finished = plan.doneIdx >= TOTAL_AYAHS
  const st = streak(new Set(reads.filter((r) => r.count > 0).map((r) => r.day)))

  return (
    <div className="fade-in mx-auto max-w-lg space-y-5">
      <h1 className="h-page">Khatm Planner</h1>
      <section className="pattern rounded-3xl hero p-6 text-white">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-sm text-white/60">Day {Math.min(elapsed, plan.days)} of {plan.days}</p>
            <p className="text-5xl font-bold tabular-nums">{(pct * 100).toFixed(1)}%</p>
          </div>
          <p className="flex items-center gap-1 text-accent"><Flame size={18} />{st} day streak</p>
        </div>
        <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-white/10">
          <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${pct * 100}%` }} />
        </div>
        <p className="mt-2 text-xs text-white/50">{plan.doneIdx} / {TOTAL_AYAHS} ayahs</p>
      </section>

      {finished ? (
        <p className="card p-5 text-center text-lg font-semibold">🎉 Khatm complete. May Allah accept it.</p>
      ) : (
        <section className="card p-5">
          <p className="text-sm text-muted">Today’s portion</p>
          <p className="mt-1 text-lg font-semibold">
            {todayTarget === 0 ? 'You are on track — read ahead if you like.' : `${todayTarget} ayahs: ${data.surahs[next.s - 1].tname} ${next.s}:${next.a} → ${data.surahs[end.s - 1].tname} ${end.s}:${end.a}`}
          </p>
          <Link className="btn mt-4 w-full" to={`/quran/${next.s}#${next.a}`}>Continue reading</Link>
          <p className="mt-3 text-xs text-muted">Tap the target icon on an ayah in the reader to mark progress up to it.</p>
        </section>
      )}

      <button className="btn-ghost w-full text-red-500" onClick={() => confirm('Delete this Khatm plan?') && db.khatm.delete('current')}>
        <Trash2 size={15} />Reset plan
      </button>
    </div>
  )
}
