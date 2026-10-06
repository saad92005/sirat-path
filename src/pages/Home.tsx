import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  BookHeart, BookOpen, Check, ChevronRight, Circle, Compass, GraduationCap, HandCoins, HandHeart, ListChecks, MapPin,
  Moon, NotebookPen, Plane, ScrollText, Share2, Smile, Sparkles, Star, Sunrise, Sunset,
} from 'lucide-react'
import { useLiveQuery } from 'dexie-react-hooks'
import { useQuran, TOTAL_AYAHS, fromAbs } from '../lib/quran'
import { useSettings } from '../lib/settings'
import { computeTimes, fmtCountdown, fmtTime, hijri, nextPrayer, PRAYERS, PRAYER_LABEL } from '../lib/prayer'
import { db, today } from '../lib/db'
import { hijriParts, upcomingEvents } from '../lib/hijri'
import { NAMES } from '../lib/names'
import { streakOf } from '../lib/stats'
import { shareAyahImage } from '../lib/shareImage'
import Skyline from '../components/Skyline'
import { Ring } from '../components/ui'

function useNow(ms = 1000) {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => { const id = setInterval(() => setNow(new Date()), ms); return () => clearInterval(id) }, [ms])
  return now
}

const FEATURES = [
  { to: '/quran', icon: BookOpen, label: 'Quran', tint: '#0f766e' },
  { to: '/hadith', icon: ScrollText, label: 'Hadith', tint: '#7c3aed' },
  { to: '/azkar', icon: BookHeart, label: 'Azkar', tint: '#db2777' },
  { to: '/dhikr', icon: Sparkles, label: 'Tasbih', tint: '#d97706' },
  { to: '/qibla', icon: Compass, label: 'Qibla', tint: '#2563eb' },
  { to: '/learn', icon: GraduationCap, label: 'Learn', tint: '#059669' },
  { to: '/names', icon: Star, label: '99 Names', tint: '#ca8a04' },
  { to: '/ramadan', icon: Moon, label: 'Ramadan', tint: '#4f46e5' },
  { to: '/zakat', icon: HandCoins, label: 'Zakat', tint: '#16a34a' },
  { to: '/hajj', icon: Plane, label: 'Hajj', tint: '#0891b2' },
  { to: '/habits', icon: ListChecks, label: 'Habits', tint: '#e11d48' },
  { to: '/journal', icon: NotebookPen, label: 'Journal', tint: '#9333ea' },
  { to: '/kids', icon: Smile, label: 'Kids', tint: '#f59e0b' },
  { to: '/duas', icon: HandHeart, label: 'Duas', tint: '#0d9488' },
]

export default function Home() {
  const s = useSettings()
  const now = useNow()
  const { data } = useQuran()
  const day = today()
  const next = nextPrayer(s, now)
  const times = computeTimes(s, now)
  const plan = useLiveQuery(() => db.khatm.get('current'))
  const reads = useLiveQuery(() => db.reads.toArray()) ?? []
  const azkar = useLiveQuery(() => db.azkar.where('day').equals(day).toArray(), [day]) ?? []
  const salah = useLiveQuery(() => db.salah.where('day').equals(day).toArray(), [day]) ?? []
  const [event] = useState(() => upcomingEvents(new Date(), s.hijriOffset, 1)[0])

  const dayNum = Math.floor((now.getTime() - now.getTimezoneOffset() * 60000) / 86_400_000)
  const vod = data ? fromAbs(data, (dayNum * 2654435761) % TOTAL_AYAHS) : null
  const vodAyah = data && vod ? data.surahs[vod.s - 1].ayahs[vod.a - 1] : null
  const name = NAMES[dayNum % 99]
  const todayCount = reads.find((r) => r.day === day)?.count ?? 0
  const goalPct = Math.min(1, todayCount / s.dailyAyahGoal)
  const streak = streakOf(reads)
  const isRamadan = hijriParts(now, s.hijriOffset).month === 9
  const done = (id: string) => azkar.some((a) => a.session === id && a.completed)
  const prayed = (p: string) => salah.find((x) => x.prayer === p && x.status !== 'missed')

  return (
    <div className="space-y-5 md:space-y-6">
      {/* Greeting */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-sm text-muted">{now.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })} · {hijri(now, s.hijriOffset)}</p>
          <h1 className="mt-0.5 text-2xl font-bold tracking-tight md:text-3xl">Assalamu Alaikum{s.name ? `, ${s.name}` : ''}</h1>
        </div>
        <span className="quran hidden text-3xl text-gold md:block">السَّلَامُ عَلَيْكُمْ</span>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.6fr_1fr]">
        {/* Prayer hero with skyline */}
        <section className="hero relative overflow-hidden rounded-[28px] p-6 shadow-xl md:p-8">
          <div className="pattern absolute inset-0 opacity-60" />
          <Skyline className="absolute inset-x-0 bottom-0 h-28 w-full text-black/30 md:h-36" />
          {next && times ? (
            <div className="relative">
              <div className="flex items-center gap-2 text-sm text-white/70"><MapPin size={14} />{s.location!.label}</div>
              <p className="mt-5 text-sm font-medium uppercase tracking-[.2em] text-accent">{PRAYER_LABEL[next.name]} in</p>
              <p className="mt-1 text-5xl font-bold tabular-nums tracking-tight md:text-6xl">{fmtCountdown(next.at.getTime() - now.getTime()).replace(/s$/, '')}</p>
              <p className="mt-1 text-sm text-white/70">at {fmtTime(next.at)}</p>
              <div className="relative mt-16 grid grid-cols-5 gap-1.5 md:mt-20">
                {PRAYERS.filter((p) => p !== 'sunrise').map((p) => {
                  const isNext = p === next.name
                  return (
                    <div key={p} className={`rounded-2xl px-1 py-2.5 text-center backdrop-blur-md transition ${isNext ? 'bg-accent text-[var(--hero-a)]' : 'bg-white/12'}`}>
                      <p className="text-[11px] font-medium">{PRAYER_LABEL[p]}</p>
                      <p className="text-[13px] font-bold tabular-nums">{fmtTime(times.times[p]).replace(/\s?[AP]M/i, '')}</p>
                      {prayed(p) && <Check size={12} className="mx-auto mt-0.5" />}
                    </div>
                  )
                })}
              </div>
            </div>
          ) : (
            <div className="relative pb-20">
              <p className="mt-2 text-2xl font-semibold">Set your location</p>
              <p className="mt-1 max-w-xs text-sm text-white/70">Prayer times are calculated on your device. Nothing is sent anywhere.</p>
              <Link to="/prayer" className="mt-5 inline-flex rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-[var(--hero-a)]">Set location</Link>
            </div>
          )}
        </section>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-1 lg:gap-4">
          {/* Daily goal */}
          <Link to="/insights" className="card flex items-center gap-4 p-4 transition hover:border-brand lg:p-5">
            <Ring pct={goalPct} size={56}><span className="text-sm font-bold tabular-nums">{Math.round(goalPct * 100)}%</span></Ring>
            <div className="min-w-0">
              <p className="text-xs text-muted">Quran goal</p>
              <p className="font-semibold">{todayCount}/{s.dailyAyahGoal} ayahs</p>
              <p className="text-xs text-muted">🔥 {streak} day streak</p>
            </div>
          </Link>
          {/* Azkar */}
          <Link to="/azkar" className="card p-4 transition hover:border-brand lg:p-5">
            <p className="text-xs text-muted">Today’s Azkar</p>
            <div className="mt-2 space-y-1.5 text-sm">
              <p className="flex items-center gap-2"><Sunrise size={16} className="text-gold" />Morning <span className="ms-auto">{done('morning') ? <Check size={16} className="text-brand" /> : <Circle size={14} className="text-muted" />}</span></p>
              <p className="flex items-center gap-2"><Sunset size={16} className="text-gold" />Evening <span className="ms-auto">{done('evening') ? <Check size={16} className="text-brand" /> : <Circle size={14} className="text-muted" />}</span></p>
            </div>
          </Link>
          {/* Event / Ramadan */}
          {isRamadan ? (
            <Link to="/ramadan" className="hero col-span-2 rounded-2xl p-4 lg:col-span-1"><p className="text-xs text-white/70">Ramadan Mubarak</p><p className="font-semibold">Open Ramadan mode →</p></Link>
          ) : event && (
            <Link to="/calendar" className="card col-span-2 flex items-center gap-3 p-4 transition hover:border-brand lg:col-span-1">
              <span className="grid size-11 place-items-center rounded-xl bg-gold/15 text-xl">🌙</span>
              <div className="min-w-0 flex-1"><p className="text-xs text-muted">Upcoming</p><p className="truncate font-semibold">{event.name}</p></div>
              <span className="chip">{Math.max(0, Math.round((event.date.getTime() - now.getTime()) / 86_400_000))}d</span>
            </Link>
          )}
        </div>
      </div>

      {/* Continue Quran */}
      {data && (
        <Link to={s.lastRead ? `/quran/${s.lastRead.s}#${s.lastRead.a}` : '/quran/1'} className="card group relative flex items-center gap-4 overflow-hidden p-5 transition hover:border-brand">
          <div className="grid size-14 shrink-0 place-items-center rounded-2xl bg-brand text-brand-ink shadow-md"><BookOpen /></div>
          <div className="min-w-0 flex-1">
            <p className="text-xs text-muted">{s.lastRead ? 'Continue Quran' : 'Start reading'}</p>
            <p className="truncate text-lg font-semibold">{data.surahs[(s.lastRead?.s ?? 1) - 1].tname}{s.lastRead && <span className="text-muted"> · Ayah {s.lastRead.a}</span>}</p>
            {plan && <div className="mt-2 h-1.5 max-w-xs overflow-hidden rounded-full bg-surface-2"><div className="h-full rounded-full bg-gold" style={{ width: `${(plan.doneIdx / TOTAL_AYAHS) * 100}%` }} /></div>}
          </div>
          <span className="quran hidden text-3xl text-gold sm:block">{data.surahs[(s.lastRead?.s ?? 1) - 1].name}</span>
          <ChevronRight className="text-muted transition group-hover:translate-x-1 rtl:rotate-180" />
        </Link>
      )}

      {/* All features */}
      <section>
        <div className="mb-3 flex items-center justify-between"><h2 className="font-semibold">All features</h2><Link to="/more" className="text-sm text-brand">See all</Link></div>
        <div className="grid grid-cols-4 gap-2.5 sm:grid-cols-7">
          {FEATURES.map(({ to, icon: Icon, label, tint }) => (
            <Link key={to} to={to} className="group flex flex-col items-center gap-1.5 rounded-2xl py-2 text-center text-[11px] font-medium transition active:scale-95 md:text-xs">
              <span className="grid size-13 place-items-center rounded-2xl transition group-hover:-translate-y-0.5 group-hover:shadow-md" style={{ background: `${tint}1f`, color: tint }}><Icon size={22} /></span>
              {label}
            </Link>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.6fr_1fr]">
        {vod && vodAyah && data && (
          <section className="card p-6 md:p-8">
            <div className="flex items-center">
              <p className="flex flex-1 items-center gap-2 text-xs font-semibold uppercase tracking-widest text-gold"><Sparkles size={14} />Daily reflection</p>
              <button className="icon-btn" title="Share as image" onClick={() => shareAyahImage(vodAyah[0], vodAyah[1], `${data.surahs[vod.s - 1].tname} ${vod.s}:${vod.a}`)}><Share2 size={17} /></button>
            </div>
            <p className="quran mt-4 text-3xl leading-[2.2] md:text-[34px]">{vodAyah[0]}</p>
            <p className="mt-3 text-[15px] leading-relaxed text-muted">{vodAyah[1]}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link to={`/quran/${vod.s}#${vod.a}`} className="chip text-brand">{data.surahs[vod.s - 1].tname} {vod.s}:{vod.a}</Link>
              <Link to="/journal" className="chip hover:text-ink">✍️ Reflect in journal</Link>
            </div>
          </section>
        )}
        <Link to="/names" className="card pattern flex flex-col items-center justify-center p-6 text-center transition hover:border-brand">
          <p className="text-xs font-semibold uppercase tracking-widest text-gold">Name of the day</p>
          <p className="quran mt-3 text-5xl text-brand">{name[0]}</p>
          <p className="mt-3 font-semibold">{name[1]}</p>
          <p className="text-sm text-muted">{name[2]}</p>
        </Link>
      </div>
    </div>
  )
}
