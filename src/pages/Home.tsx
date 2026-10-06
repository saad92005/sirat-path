import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  BarChart3, BookMarked, BookOpen, CalendarDays, Compass, Flame, HandHeart, MapPin, Search, Share2, Sparkles, Star, Target,
} from 'lucide-react'
import { useLiveQuery } from 'dexie-react-hooks'
import { useQuran, TOTAL_AYAHS, fromAbs } from '../lib/quran'
import { useSettings } from '../lib/settings'
import { computeTimes, fmtCountdown, fmtTime, hijri, nextPrayer, PRAYERS, PRAYER_LABEL } from '../lib/prayer'
import { db } from '../lib/db'
import { upcomingEvents } from '../lib/hijri'
import { NAMES } from '../lib/names'
import { streakOf } from '../lib/stats'
import { shareAyahImage } from '../lib/shareImage'

function useNow(ms = 1000) {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => { const id = setInterval(() => setNow(new Date()), ms); return () => clearInterval(id) }, [ms])
  return now
}

const TILES = [
  { to: '/quran', icon: BookOpen, label: 'Quran' },
  { to: '/qibla', icon: Compass, label: 'Qibla' },
  { to: '/duas', icon: HandHeart, label: 'Duas' },
  { to: '/names', icon: Star, label: '99 Names' },
  { to: '/khatm', icon: Target, label: 'Khatm' },
  { to: '/calendar', icon: CalendarDays, label: 'Calendar' },
  { to: '/insights', icon: BarChart3, label: 'Insights' },
  { to: '/saved', icon: BookMarked, label: 'Saved' },
]

export default function Home() {
  const s = useSettings()
  const now = useNow()
  const { data } = useQuran()
  const next = nextPrayer(s, now)
  const times = computeTimes(s, now)
  const plan = useLiveQuery(() => db.khatm.get('current'))
  const reads = useLiveQuery(() => db.reads.toArray()) ?? []
  const [event] = useState(() => upcomingEvents(new Date(), s.hijriOffset, 1)[0])

  const dayNum = Math.floor((now.getTime() - now.getTimezoneOffset() * 60000) / 86_400_000)
  const vod = data ? fromAbs(data, (dayNum * 2654435761) % TOTAL_AYAHS) : null
  const vodAyah = data && vod ? data.surahs[vod.s - 1].ayahs[vod.a - 1] : null
  const name = NAMES[dayNum % 99]
  const todayCount = reads.find((r) => r.day === now.toLocaleDateString('en-CA'))?.count ?? 0
  const streak = streakOf(reads)

  const hr = now.getHours()
  const greeting = hr < 5 ? 'Peaceful night' : hr < 12 ? 'Good morning' : hr < 18 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="fade-in space-y-5 md:space-y-6">
      <div className="hidden items-end justify-between md:flex">
        <div>
          <p className="text-sm text-muted">{now.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
          <h1 className="text-3xl font-bold tracking-tight">{greeting} <span className="text-gold">·</span> <span className="quran text-3xl">السلام عليكم</span></h1>
        </div>
        <Link to="/search" className="btn-ghost"><Search size={16} />Search the Quran</Link>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Prayer hero */}
        <section className="pattern relative overflow-hidden rounded-3xl bg-[#0b2a24] p-6 text-white shadow-lg md:p-8 lg:col-span-2">
          <div className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-[#2fa58a]/25 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-10 size-60 rounded-full bg-[#d8b261]/10 blur-3xl" />
          <p className="relative text-sm text-white/60"><span className="md:hidden">{greeting} · </span>{hijri(now, s.hijriOffset)}</p>
          {next && times ? (
            <div className="relative">
              <p className="mt-4 text-sm uppercase tracking-widest text-[#d8b261]">Next · {PRAYER_LABEL[next.name]}</p>
              <p className="mt-1 text-5xl font-bold tabular-nums md:text-6xl">{fmtTime(next.at)}</p>
              <p className="mt-2 text-sm text-white/70 tabular-nums">in {fmtCountdown(next.at.getTime() - now.getTime())}</p>
              <div className="mt-6 grid grid-cols-5 gap-1.5 md:gap-2">
                {PRAYERS.filter((p) => p !== 'sunrise').map((p) => {
                  const isNext = p === next.name
                  const past = times.times[p] < now && !isNext
                  return (
                    <div key={p} className={`rounded-xl px-1 py-2 text-center transition md:py-3 ${isNext ? 'bg-[#d8b261] text-[#0b2a24]' : 'bg-white/5'} ${past ? 'opacity-50' : ''}`}>
                      <p className="text-[11px] font-medium md:text-xs">{PRAYER_LABEL[p]}</p>
                      <p className="text-xs font-semibold tabular-nums md:text-sm">{fmtTime(times.times[p]).replace(/\s?[AP]M/i, '')}</p>
                    </div>
                  )
                })}
              </div>
              <p className="mt-4 flex items-center gap-1 text-xs text-white/50"><MapPin size={12} />{s.location!.label}</p>
            </div>
          ) : (
            <div className="relative">
              <p className="mt-4 text-2xl font-semibold">Set your location for prayer times</p>
              <p className="mt-1 text-sm text-white/60">Calculated on your device. Nothing is sent anywhere.</p>
              <Link to="/prayer" className="mt-4 inline-flex rounded-xl bg-[#d8b261] px-4 py-2 text-sm font-semibold text-[#0b2a24]">Set location</Link>
            </div>
          )}
        </section>

        {/* Side stats */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-1 lg:gap-5">
          <Link to="/insights" className="card flex flex-col justify-between p-5 transition hover:border-brand">
            <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted"><Flame size={14} className="text-orange-500" />Streak</p>
            <p className="mt-2 text-3xl font-bold tabular-nums">{streak}<span className="ml-1 text-sm font-normal text-muted">days</span></p>
            <p className="text-xs text-muted">{todayCount} ayahs read today</p>
          </Link>
          {event && (
            <Link to="/calendar" className="card flex flex-col justify-between p-5 transition hover:border-brand">
              <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted"><CalendarDays size={14} className="text-gold" />Upcoming</p>
              <p className="mt-2 text-lg font-bold leading-tight">{event.name}</p>
              <p className="text-xs text-muted">in {Math.max(0, Math.round((event.date.getTime() - now.getTime()) / 86_400_000))} days · {event.date.toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}</p>
            </Link>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {data && s.lastRead && (
          <Link to={`/quran/${s.lastRead.s}#${s.lastRead.a}`} className="card group flex items-center gap-4 p-5 transition hover:-translate-y-0.5 hover:border-brand">
            <div className="grid size-12 place-items-center rounded-2xl bg-brand/10 text-brand transition group-hover:bg-brand group-hover:text-brand-ink"><BookOpen /></div>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-muted">Continue reading</p>
              <p className="truncate font-semibold">{data.surahs[s.lastRead.s - 1].tname} · Ayah {s.lastRead.a}</p>
            </div>
            <span className="quran text-2xl text-gold">{data.surahs[s.lastRead.s - 1].name}</span>
          </Link>
        )}
        {data && (
          plan ? (
            <Link to="/khatm" className="card flex items-center gap-4 p-5 transition hover:-translate-y-0.5 hover:border-brand">
              <div className="grid size-12 place-items-center rounded-2xl bg-gold/15 text-gold"><Target /></div>
              <div className="flex-1">
                <p className="text-xs text-muted">Khatm progress</p>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface-2">
                  <div className="h-full rounded-full bg-gold transition-all" style={{ width: `${(plan.doneIdx / TOTAL_AYAHS) * 100}%` }} />
                </div>
              </div>
              <span className="text-sm font-semibold tabular-nums">{((plan.doneIdx / TOTAL_AYAHS) * 100).toFixed(1)}%</span>
            </Link>
          ) : (
            <Link to="/khatm" className="card flex items-center gap-4 p-5 transition hover:-translate-y-0.5 hover:border-brand">
              <div className="grid size-12 place-items-center rounded-2xl bg-gold/15 text-gold"><Target /></div>
              <div><p className="font-semibold">Plan a Khatm</p><p className="text-xs text-muted">Finish the Quran in 7 to 365 days</p></div>
            </Link>
          )
        )}
      </div>

      <section className="grid grid-cols-4 gap-2.5 md:grid-cols-8 md:gap-3">
        {TILES.map(({ to, icon: Icon, label }) => (
          <Link key={to} to={to} className="card group flex flex-col items-center gap-2 px-1 py-4 text-center text-[11px] font-medium transition hover:-translate-y-0.5 hover:border-brand active:scale-95 md:text-xs">
            <span className="grid size-10 place-items-center rounded-xl bg-brand/10 text-brand transition group-hover:bg-brand group-hover:text-brand-ink"><Icon size={19} /></span>{label}
          </Link>
        ))}
      </section>

      <div className="grid gap-5 lg:grid-cols-3">
        {vod && vodAyah && data && (
          <section className="card p-6 md:p-8 lg:col-span-2">
            <div className="flex items-center">
              <p className="flex flex-1 items-center gap-2 text-xs font-semibold uppercase tracking-widest text-gold"><Sparkles size={14} />Verse of the day</p>
              <button className="icon-btn" title="Share as image" onClick={() => shareAyahImage(vodAyah[0], vodAyah[1], `${data.surahs[vod.s - 1].tname} ${vod.s}:${vod.a}`)}><Share2 size={17} /></button>
            </div>
            <p className="quran mt-4 text-3xl leading-[2.2] md:text-4xl">{vodAyah[0]}</p>
            <p className="mt-3 text-[15px] leading-relaxed text-muted">{vodAyah[1]}</p>
            <Link to={`/quran/${vod.s}#${vod.a}`} className="mt-4 inline-block text-sm font-semibold text-brand">
              {data.surahs[vod.s - 1].tname} {vod.s}:{vod.a} →
            </Link>
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
