import { Link } from 'react-router-dom'
import { Loader2, Moon, Pause, Play, Repeat, SkipBack, SkipForward, X } from 'lucide-react'
import { getSleepAt, RECITERS, setRate, setSleep, skip, stop, toggle, useAudio } from '../lib/audio'
import { useQuran } from '../lib/quran'
import { setSettings, useSettings } from '../lib/settings'

const RATES = [0.75, 1, 1.25, 1.5]
const REPEATS = [1, 3, 5, 10]
const SLEEPS = [0, 15, 30, 60]
const cycle = <T,>(arr: T[], v: T) => arr[(arr.indexOf(v) + 1) % arr.length]

export default function AudioBar() {
  const st = useAudio()
  const { data } = useQuran()
  const { reciter, playbackRate, repeat } = useSettings()
  const sleepAt = getSleepAt()
  if (!st || !data) return null
  const surah = data.surahs[st.s - 1]
  const progress = (st.a / surah.ayas) * 100
  return (
    <div className="fixed inset-x-0 bottom-[calc(60px+env(safe-area-inset-bottom))] z-30 px-3 md:bottom-4 md:ps-64">
      <div className="fade-in relative mx-auto flex max-w-2xl items-center gap-1 overflow-hidden rounded-2xl border border-line bg-surface/95 p-2 pl-4 shadow-xl backdrop-blur-xl">
        <div className="absolute inset-x-0 top-0 h-0.5 bg-surface-2"><div className="h-full bg-brand transition-all" style={{ width: `${progress}%` }} /></div>
        <Link to={`/quran/${st.s}#${st.a}`} className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{surah.tname} · {st.s}:{st.a}</p>
          <p className="truncate text-xs text-muted">{st.error ?? RECITERS[reciter]}</p>
        </Link>
        <button className="icon-btn w-auto px-2 text-xs font-semibold tabular-nums" title="Playback speed"
          onClick={() => { const r = cycle(RATES, playbackRate); setSettings({ playbackRate: r }); setRate(r) }}>{playbackRate}×</button>
        <button className={`icon-btn relative hidden sm:inline-grid ${repeat > 1 ? 'text-brand' : ''}`} title="Repeat each ayah"
          onClick={() => setSettings({ repeat: cycle(REPEATS, repeat) })}>
          <Repeat size={17} />{repeat > 1 && <span className="absolute -right-0.5 -top-0.5 rounded-full bg-brand px-1 text-[9px] text-brand-ink">{repeat}</span>}
        </button>
        <button className={`icon-btn relative hidden sm:inline-grid ${sleepAt ? 'text-brand' : ''}`} title="Sleep timer"
          onClick={() => { const cur = sleepAt ? SLEEPS.find((m) => m * 60_000 >= sleepAt - Date.now() - 1000) ?? 60 : 0; setSleep(cycle(SLEEPS, cur)) }}>
          <Moon size={17} />{sleepAt && <span className="absolute -right-1 -top-0.5 rounded-full bg-brand px-1 text-[9px] text-brand-ink">{Math.ceil((sleepAt - Date.now()) / 60_000)}m</span>}
        </button>
        <button className="icon-btn hidden sm:inline-grid" onClick={() => skip(-1)} aria-label="Previous ayah"><SkipBack size={18} /></button>
        <button className="grid size-11 shrink-0 place-items-center rounded-full bg-brand text-brand-ink active:scale-90" onClick={toggle} aria-label={st.playing ? 'Pause' : 'Play'}>
          {st.loading ? <Loader2 className="animate-spin" size={20} /> : st.playing ? <Pause size={20} /> : <Play size={20} />}
        </button>
        <button className="icon-btn" onClick={() => skip(1)} aria-label="Next ayah"><SkipForward size={18} /></button>
        <button className="icon-btn" onClick={stop} aria-label="Close player"><X size={18} /></button>
      </div>
    </div>
  )
}
