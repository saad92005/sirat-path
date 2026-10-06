import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { BookMarked, BookOpen, Compass, HandHeart, MapPin, Sparkles, Target } from 'lucide-react'
import { useLiveQuery } from 'dexie-react-hooks'
import { useQuran, TOTAL_AYAHS, fromAbs } from '../lib/quran'
import { useSettings } from '../lib/settings'
import { fmtCountdown, fmtTime, hijri, nextPrayer, PRAYER_LABEL } from '../lib/prayer'
import { db } from '../lib/db'

function useNow(ms = 1000) {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => { const id = setInterval(() => setNow(new Date()), ms); return () => clearInterval(id) }, [ms])
  return now
}

export default function Home() {
  const s = useSettings()
  const now = useNow()
  const { data } = useQuran()
  const next = nextPrayer(s, now)
  const plan = useLiveQuery(() => db.khatm.get('current'))

  // Verse of the day: deterministic per date, taken straight from the verified dataset.
  const dayNum = Math.floor(now.getTime() / 86_400_000)
  const vod = data ? fromAbs(data, (dayNum * 2654435761) % TOTAL_AYAHS) : null
  const vodAyah = data && vod ? data.surahs[vod.s - 1].ayahs[vod.a - 1] : null

  const greeting = now.getHours() < 12 ? 'Good morning' : now.getHours() < 18 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="fade-in space-y-5">
      <section className="pattern relative overflow-hidden rounded-3xl bg-[#0b2a24] p-6 text-white shadow-lg">
        <p className="text-sm text-white/60">{greeting} · {hijri(now, s.hijriOffset)}</p>
        {next ? (
          <>
            <p className="mt-4 text-sm uppercase tracking-widest text-[#d8b261]">Next · {PRAYER_LABEL[next.name]}</p>
            <p className="mt-1 text-5xl font-bold tabular-nums">{fmtTime(next.at)}</p>
            <p className="mt-2 text-sm text-white/70 tabular-nums">in {fmtCountdown(next.at.getTime() - now.getTime())}</p>
            <p className="mt-4 flex items-center gap-1 text-xs text-white/50"><MapPin size={12} />{s.location!.label}</p>
          </>
        ) : (
          <>
            <p className="mt-4 text-2xl font-semibold">Set your location for prayer times</p>
            <p className="mt-1 text-sm text-white/60">Calculated on your device — nothing is sent anywhere.</p>
            <Link to="/prayer" className="mt-4 inline-flex rounded-xl bg-[#d8b261] px-4 py-2 text-sm font-semibold text-[#0b2a24]">Set location</Link>
          </>
        )}
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        {data && s.lastRead && (
          <Link to={`/quran/${s.lastRead.s}#${s.lastRead.a}`} className="card group flex items-center gap-4 p-5 transition hover:border-brand">
            <div className="grid size-12 place-items-center rounded-2xl bg-brand/10 text-brand"><BookOpen /></div>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-muted">Continue reading</p>
              <p className="truncate font-semibold">{data.surahs[s.lastRead.s - 1].tname} · Ayah {s.lastRead.a}</p>
            </div>
            <span className="quran text-2xl text-gold">{data.surahs[s.lastRead.s - 1].name}</span>
          </Link>
        )}
        {plan && data && (
          <Link to="/khatm" className="card flex items-center gap-4 p-5 transition hover:border-brand">
            <div className="grid size-12 place-items-center rounded-2xl bg-gold/15 text-gold"><Target /></div>
            <div className="flex-1">
              <p className="text-xs text-muted">Khatm progress</p>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface-2">
                <div className="h-full rounded-full bg-gold transition-all" style={{ width: `${(plan.doneIdx / TOTAL_AYAHS) * 100}%` }} />
              </div>
            </div>
            <span className="text-sm font-semibold tabular-nums">{((plan.doneIdx / TOTAL_AYAHS) * 100).toFixed(1)}%</span>
          </Link>
        )}
      </div>

      <section className="grid grid-cols-4 gap-3">
        {[
          { to: '/quran', icon: BookOpen, label: 'Quran' },
          { to: '/qibla', icon: Compass, label: 'Qibla' },
          { to: '/duas', icon: HandHeart, label: 'Duas' },
          { to: '/saved', icon: BookMarked, label: 'Saved' },
        ].map(({ to, icon: Icon, label }) => (
          <Link key={to} to={to} className="card flex flex-col items-center gap-2 py-4 text-xs font-medium transition hover:border-brand active:scale-95">
            <Icon className="text-brand" size={22} />{label}
          </Link>
        ))}
      </section>

      {vod && vodAyah && data && (
        <section className="card p-6">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-gold"><Sparkles size={14} />Verse of the day</p>
          <p className="quran mt-4 text-3xl leading-[2.2]">{vodAyah[0]}</p>
          <p className="mt-3 text-[15px] leading-relaxed text-muted">{vodAyah[1]}</p>
          <Link to={`/quran/${vod.s}#${vod.a}`} className="mt-4 inline-block text-sm font-semibold text-brand">
            {data.surahs[vod.s - 1].tname} {vod.s}:{vod.a} →
          </Link>
        </section>
      )}
    </div>
  )
}
