import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { BookOpen, HandCoins, Moon, Sparkles, Star, Sunrise, Sunset } from 'lucide-react'
import { db, type RamadanDay } from '../lib/db'
import { hijriParts, upcomingEvents } from '../lib/hijri'
import { computeTimes, fmtCountdown, fmtTime } from '../lib/prayer'
import { useSettings } from '../lib/settings'
import { tap } from '../lib/feedback'
import { DUAS } from '../content/duas'
import DuaCard from '../components/DuaCard'
import Skyline from '../components/Skyline'
import { PageHeader } from '../components/ui'

const FIELDS: { k: keyof Pick<RamadanDay, 'fasted' | 'quran' | 'taraweeh' | 'sadaqah'>; label: string; icon: typeof Moon }[] = [
  { k: 'fasted', label: 'Fasted', icon: Moon },
  { k: 'quran', label: 'Quran', icon: BookOpen },
  { k: 'taraweeh', label: 'Taraweeh', icon: Star },
  { k: 'sadaqah', label: 'Sadaqah', icon: HandCoins },
]

export default function Ramadan() {
  const s = useSettings()
  const [now, setNow] = useState(() => new Date())
  useEffect(() => { const id = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(id) }, [])
  const h = hijriParts(now, s.hijriOffset)
  const inRamadan = h.month === 9
  const year = inRamadan ? h.year : h.month < 9 ? h.year : h.year + 1
  const days = useLiveQuery(() => db.ramadan.where('year').equals(year).toArray(), [year]) ?? []
  const [sel, setSel] = useState(inRamadan ? h.day : 1)
  const start = upcomingEvents(now, s.hijriOffset, 7).find((e) => e.name === 'Ramadan begins')
  const times = computeTimes(s, now)
  const tomorrow = new Date(now); tomorrow.setDate(now.getDate() + 1)
  const suhoorAt = times && times.times.fajr > now ? times.times.fajr : computeTimes(s, tomorrow)?.times.fajr
  const iftarAt = times?.times.maghrib

  const rec = (d: number) => days.find((x) => x.day === d)
  async function toggle(d: number, k: (typeof FIELDS)[number]['k']) {
    const cur = rec(d) ?? { id: `${year}-${d}`, year, day: d, fasted: false, sadaqah: false, quran: false, taraweeh: false }
    tap(!cur[k])
    await db.ramadan.put({ ...cur, [k]: !cur[k] })
  }
  const fastedCount = days.filter((d) => d.fasted).length
  const selRec = rec(sel)

  return (
    <div>
      <PageHeader title="Ramadan" subtitle={`${year} AH`} />
      <section className="hero relative mb-5 overflow-hidden rounded-[28px] p-6 md:p-8">
        <div className="pattern absolute inset-0 opacity-60" />
        <Skyline className="absolute inset-x-0 bottom-0 h-28 w-full text-black/30" />
        <div className="relative pb-16">
          {inRamadan ? (
            <>
              <p className="text-sm text-white/70">Day {h.day} of Ramadan</p>
              <p className="mt-1 text-3xl font-bold md:text-4xl">Ramadan Mubarak 🌙</p>
              {s.location && iftarAt && suhoorAt ? (
                <div className="mt-5 grid max-w-md grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-white/12 p-3 backdrop-blur"><p className="flex items-center gap-1.5 text-xs text-white/70"><Sunrise size={13} />Suhoor ends</p><p className="text-xl font-bold tabular-nums">{fmtTime(suhoorAt)}</p><p className="text-xs tabular-nums text-accent">{fmtCountdown(suhoorAt.getTime() - now.getTime())}</p></div>
                  <div className="rounded-2xl bg-white/12 p-3 backdrop-blur"><p className="flex items-center gap-1.5 text-xs text-white/70"><Sunset size={13} />Iftar</p><p className="text-xl font-bold tabular-nums">{fmtTime(iftarAt)}</p><p className="text-xs tabular-nums text-accent">{iftarAt > now ? fmtCountdown(iftarAt.getTime() - now.getTime()) : 'Iftar time has passed'}</p></div>
                </div>
              ) : <Link to="/prayer" className="mt-4 inline-block text-sm underline">Set your location for Suhoor & Iftar times</Link>}
            </>
          ) : (
            <>
              <p className="text-sm text-white/70">Ramadan {year} AH begins in</p>
              <p className="mt-1 text-5xl font-bold tabular-nums">{start ? Math.max(0, Math.ceil((start.date.getTime() - now.getTime()) / 86_400_000)) : '—'}<span className="ms-2 text-xl font-medium">days</span></p>
              <p className="mt-1 text-sm text-white/70">{start?.date.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} (expected, subject to moon sighting)</p>
              <p className="mt-3 text-sm text-white/80">Prepare now — plan a Khatm and practise your tracker below.</p>
            </>
          )}
        </div>
      </section>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.4fr_1fr]">
        <section className="card p-5">
          <div className="flex items-center"><p className="flex-1 font-semibold">30-day tracker</p><span className="chip">{fastedCount}/30 fasts</span></div>
          <div className="mt-4 grid grid-cols-6 gap-2 sm:grid-cols-10">
            {Array.from({ length: 30 }, (_, i) => i + 1).map((d) => {
              const r = rec(d)
              const n = r ? FIELDS.filter((f) => r[f.k]).length : 0
              const last10 = d >= 21
              return (
                <button key={d} onClick={() => setSel(d)} className={`relative aspect-square rounded-xl text-sm font-semibold transition active:scale-90 ${sel === d ? 'ring-2 ring-brand' : ''} ${r?.fasted ? 'bg-brand text-brand-ink' : 'bg-surface-2'} ${inRamadan && d === h.day ? 'outline-2 outline-gold' : ''}`}>
                  {d}
                  {last10 && <Star size={8} className={`absolute end-1 top-1 ${r?.fasted ? 'text-brand-ink' : 'text-gold'}`} />}
                  {n > 1 && <span className="absolute inset-x-0 bottom-1 mx-auto flex justify-center gap-0.5">{Array.from({ length: n - (r?.fasted ? 1 : 0) }, (_, k) => <span key={k} className="size-1 rounded-full bg-current opacity-70" />)}</span>}
                </button>
              )
            })}
          </div>
          <div className="mt-5 rounded-2xl bg-surface-2 p-4">
            <p className="text-sm font-semibold">Day {sel}{sel >= 21 && ' · last ten nights'}</p>
            <div className="mt-3 grid grid-cols-4 gap-2">
              {FIELDS.map(({ k, label, icon: Icon }) => (
                <button key={k} onClick={() => toggle(sel, k)} className={`flex flex-col items-center gap-1 rounded-xl py-3 text-xs font-medium transition active:scale-95 ${selRec?.[k] ? 'bg-brand text-brand-ink' : 'bg-surface text-muted'}`}>
                  <Icon size={18} />{label}
                </button>
              ))}
            </div>
          </div>
        </section>
        <div className="space-y-4">
          <Link to="/khatm" className="card flex items-center gap-3 p-4 transition hover:border-brand"><span className="text-2xl">📖</span><div><p className="font-semibold">Ramadan Khatm</p><p className="text-xs text-muted">Plan to finish the Quran in 30 days</p></div></Link>
          <div className="card p-4"><p className="flex items-center gap-2 font-semibold"><Sparkles size={16} className="text-gold" />Laylat al-Qadr</p><p className="mt-1 text-sm text-muted">“The Night of Decree is better than a thousand months.” Seek it in the odd nights of the last ten.</p><p className="mt-1 text-xs text-gold">Quran 97:3 · Sahih al-Bukhari 2017</p></div>
          {DUAS.filter((d) => d.cat === 'ramadan').slice(0, 2).map((d) => <DuaCard key={d.id} d={d} />)}
        </div>
      </div>
    </div>
  )
}
