import { useLiveQuery } from 'dexie-react-hooks'
import { Check, Clock3, Users, X } from 'lucide-react'
import { db, today, type SalahLog } from '../lib/db'
import { tap } from '../lib/feedback'

const FARD = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'] as const
const LABEL: Record<string, string> = { fajr: 'Fajr', dhuhr: 'Dhuhr', asr: 'Asr', maghrib: 'Maghrib', isha: 'Isha' }
const ORDER: (SalahLog['status'] | null)[] = [null, 'ontime', 'jamaah', 'late', 'missed']
const STYLE: Record<string, string> = {
  ontime: 'bg-brand text-brand-ink', jamaah: 'bg-gold text-white', late: 'bg-amber-500/80 text-white', missed: 'bg-red-500/80 text-white',
}
const ICON = { ontime: Check, jamaah: Users, late: Clock3, missed: X }

export default function SalahTracker() {
  const day = today()
  const week = Array.from({ length: 7 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() - (6 - i)); return d })
  const logs = useLiveQuery(() => db.salah.where('day').anyOf(week.map((d) => d.toLocaleDateString('en-CA'))).toArray()) ?? []
  const get = (d: string, p: string) => logs.find((l) => l.day === d && l.prayer === p)
  const isFriday = new Date().getDay() === 5

  async function cycle(p: string) {
    const cur = get(day, p)?.status ?? null
    const next = ORDER[(ORDER.indexOf(cur) + 1) % ORDER.length]
    tap(next === 'ontime' || next === 'jamaah')
    if (next) await db.salah.put({ id: `${day}-${p}`, day, prayer: p, status: next })
    else await db.salah.delete(`${day}-${p}`)
  }

  const prayedToday = FARD.filter((p) => { const s = get(day, p)?.status; return s && s !== 'missed' }).length

  return (
    <section className="card p-5">
      <div className="flex items-center">
        <p className="flex-1 font-semibold">Today’s Salah</p>
        <span className="chip">{prayedToday}/5 prayed</span>
      </div>
      <div className="mt-4 grid grid-cols-5 gap-2">
        {FARD.map((p) => {
          const st = get(day, p)?.status
          const Icon = st ? ICON[st] : null
          return (
            <button key={p} onClick={() => cycle(p)} className="flex flex-col items-center gap-1.5 text-xs font-medium active:scale-95" aria-label={`${LABEL[p]}: ${st ?? 'not marked'}`}>
              <span className={`grid size-12 place-items-center rounded-2xl border transition ${st ? `${STYLE[st]} border-transparent` : 'border-dashed border-line text-muted'}`}>
                {Icon ? <Icon size={20} /> : <span className="text-lg">○</span>}
              </span>
              {p === 'dhuhr' && isFriday ? 'Jumuʿah' : LABEL[p]}
            </button>
          )
        })}
      </div>
      <p className="mt-3 text-xs text-muted">Tap to cycle: on time → in jamaʿah → late → missed → clear.</p>

      <div className="mt-5 overflow-x-auto">
        <table className="w-full text-center text-[11px]">
          <thead><tr className="text-muted"><th />{week.map((d) => <th key={+d} className="pb-1 font-medium">{d.toLocaleDateString(undefined, { weekday: 'narrow' })}</th>)}</tr></thead>
          <tbody>
            {FARD.map((p) => (
              <tr key={p}>
                <td className="pe-2 text-start text-muted">{LABEL[p]}</td>
                {week.map((d) => {
                  const st = get(d.toLocaleDateString('en-CA'), p)?.status
                  return <td key={+d} className="p-0.5"><span className={`mx-auto block size-4 rounded-md ${st ? STYLE[st] : 'bg-surface-2'}`} /></td>
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
