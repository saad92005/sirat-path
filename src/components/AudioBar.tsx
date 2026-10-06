import { Link } from 'react-router-dom'
import { Loader2, Pause, Play, SkipBack, SkipForward, X } from 'lucide-react'
import { RECITERS, skip, stop, toggle, useAudio } from '../lib/audio'
import { useQuran } from '../lib/quran'
import { useSettings } from '../lib/settings'

export default function AudioBar() {
  const st = useAudio()
  const { data } = useQuran()
  const { reciter } = useSettings()
  if (!st || !data) return null
  const surah = data.surahs[st.s - 1]
  return (
    <div className="fixed inset-x-0 bottom-[calc(60px+env(safe-area-inset-bottom))] z-30 px-3 md:bottom-4">
      <div className="fade-in mx-auto flex max-w-xl items-center gap-2 rounded-2xl border border-line bg-surface/95 p-2 pl-4 shadow-xl backdrop-blur-xl">
        <Link to={`/quran/${st.s}#${st.a}`} className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{surah.tname} · {st.s}:{st.a}</p>
          <p className="truncate text-xs text-muted">{st.error ?? RECITERS[reciter]}</p>
        </Link>
        <button className="icon-btn" onClick={() => skip(-1)} aria-label="Previous ayah"><SkipBack size={18} /></button>
        <button className="grid size-11 place-items-center rounded-full bg-brand text-brand-ink active:scale-90" onClick={toggle} aria-label={st.playing ? 'Pause' : 'Play'}>
          {st.loading ? <Loader2 className="animate-spin" size={20} /> : st.playing ? <Pause size={20} /> : <Play size={20} />}
        </button>
        <button className="icon-btn" onClick={() => skip(1)} aria-label="Next ayah"><SkipForward size={18} /></button>
        <button className="icon-btn" onClick={stop} aria-label="Close player"><X size={18} /></button>
      </div>
    </div>
  )
}
