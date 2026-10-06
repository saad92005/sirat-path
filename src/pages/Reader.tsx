import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import {
  Bookmark, BookmarkCheck, Check, ChevronLeft, ChevronRight, Copy, Download, Languages, Loader2,
  Minus, NotebookPen, Pause, Play, Plus, Target,
} from 'lucide-react'
import { absIndex, juzOf, useQuran } from '../lib/quran'
import { setSettings, useSettings } from '../lib/settings'
import { db, logRead, saveNote, toggleBookmark } from '../lib/db'
import { downloadSurah, isSurahDownloaded, play, toggle, useAudio } from '../lib/audio'
import Loading from '../components/Loading'

export default function Reader() {
  const n = Number(useParams().surah)
  const { hash } = useLocation()
  const { data, error } = useQuran()
  const settings = useSettings()
  const audio = useAudio()
  const bookmarks = useLiveQuery(() => db.bookmarks.where('s').equals(n).toArray(), [n]) ?? []
  const notes = useLiveQuery(() => db.notes.where('s').equals(n).toArray(), [n]) ?? []
  const plan = useLiveQuery(() => db.khatm.get('current'))
  const [noteFor, setNoteFor] = useState<number | null>(null)
  const [dl, setDl] = useState<{ done: number; total: number } | 'done' | 'error' | null>(null)
  const [copied, setCopied] = useState<number | null>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const surah = data?.surahs[n - 1]

  useEffect(() => {
    setDl(null)
    if (data) isSurahDownloaded(n).then((ok) => ok && setDl('done'))
  }, [n, data, settings.reciter])

  // Jump to #ayah on open
  useEffect(() => {
    if (!surah) return
    const a = Number(hash.slice(1))
    if (a > 1) requestAnimationFrame(() => document.getElementById(`a${a}`)?.scrollIntoView({ block: 'center' }))
    else window.scrollTo(0, 0)
  }, [surah, hash])

  // Remember last-read ayah as the reader scrolls.
  useEffect(() => {
    if (!surah || !listRef.current) return
    let timer: ReturnType<typeof setTimeout>
    const io = new IntersectionObserver((entries) => {
      const visible = entries.filter((e) => e.isIntersecting).map((e) => Number((e.target as HTMLElement).dataset.a))
      if (!visible.length) return
      clearTimeout(timer)
      timer = setTimeout(() => setSettings({ lastRead: { s: n, a: Math.min(...visible) } }), 600)
    }, { rootMargin: '-40% 0px -50% 0px' })
    listRef.current.querySelectorAll('[data-a]').forEach((el) => io.observe(el))
    return () => { io.disconnect(); clearTimeout(timer) }
  }, [surah, n])

  // Keep the playing ayah in view.
  useEffect(() => {
    if (audio?.s === n) document.getElementById(`a${audio.a}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [audio?.s, audio?.a, n])

  if (!data || !surah) return <Loading error={error ?? (data ? 'Surah not found' : null)} />

  const isPlayingHere = audio?.s === n
  const fontPx = settings.arabicSize

  async function markRead(a: number) {
    if (!plan || !data) return
    const idx = absIndex(data, n, a) + 1
    if (idx > plan.doneIdx) {
      await db.khatm.update('current', { doneIdx: idx })
      await logRead(idx - plan.doneIdx)
    }
  }

  async function startDownload() {
    try {
      setDl({ done: 0, total: surah!.ayas })
      await downloadSurah(n, (done, total) => setDl({ done, total }))
      setDl('done')
    } catch { setDl('error') }
  }

  return (
    <div className="fade-in">
      <section className="pattern relative overflow-hidden rounded-3xl bg-[#0b2a24] px-6 py-8 text-center text-white">
        <p className="quran text-5xl text-[#d8b261]">{surah.name}</p>
        <h1 className="mt-2 text-xl font-bold">{surah.tname}</h1>
        <p className="text-sm text-white/60">{surah.ename} · {surah.type} · {surah.ayas} ayahs · Juz {juzOf(data, n, 1)}</p>
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          <button onClick={() => (isPlayingHere ? toggle() : play(n, 1))} className="inline-flex items-center gap-2 rounded-full bg-[#d8b261] px-5 py-2 text-sm font-semibold text-[#0b2a24] active:scale-95">
            {isPlayingHere && audio?.playing ? <Pause size={16} /> : <Play size={16} />} {isPlayingHere && audio?.playing ? 'Pause' : 'Play surah'}
          </button>
          <button onClick={startDownload} disabled={dl !== null && dl !== 'error'} className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm active:scale-95 disabled:opacity-80">
            {dl === 'done' ? <><Check size={16} />Offline</> : typeof dl === 'object' && dl ? <><Loader2 size={16} className="animate-spin" />{dl.done}/{dl.total}</> : <><Download size={16} />{dl === 'error' ? 'Retry download' : 'Download audio'}</>}
          </button>
        </div>
      </section>

      <div className="sticky top-14 z-20 -mx-4 mt-3 flex items-center justify-end gap-1 bg-bg/85 px-4 py-2 backdrop-blur-xl">
        <button className={`icon-btn ${settings.showTranslation ? 'text-brand' : ''}`} onClick={() => setSettings({ showTranslation: !settings.showTranslation })} aria-label="Toggle translation"><Languages size={19} /></button>
        <button className="icon-btn" onClick={() => setSettings({ arabicSize: Math.max(20, fontPx - 2) })} aria-label="Smaller text"><Minus size={18} /></button>
        <span className="w-8 text-center text-xs tabular-nums text-muted">{fontPx}</span>
        <button className="icon-btn" onClick={() => setSettings({ arabicSize: Math.min(52, fontPx + 2) })} aria-label="Larger text"><Plus size={18} /></button>
      </div>

      <div ref={listRef} className="divide-y divide-line">
        {surah.ayahs.map(([ar, en], i) => {
          const a = i + 1
          const marked = bookmarks.some((b) => b.a === a)
          const note = notes.find((x) => x.a === a)
          const active = isPlayingHere && audio?.a === a
          const done = plan ? absIndex(data, n, a) < plan.doneIdx : false
          return (
            <article key={a} id={`a${a}`} data-a={a} className={`scroll-mt-32 py-6 transition-colors ${active ? '-mx-4 rounded-2xl bg-brand/8 px-4' : ''}`}>
              <div className="mb-3 flex items-center gap-1 text-muted">
                <span className="chip mr-auto">{n}:{a}{done && <Check size={12} className="text-brand" />}</span>
                <button className={`icon-btn size-9 ${active ? 'text-brand' : ''}`} onClick={() => (active ? toggle() : play(n, a))} aria-label="Play ayah">
                  {active && audio?.playing ? <Pause size={17} /> : <Play size={17} />}
                </button>
                <button className={`icon-btn size-9 ${marked ? 'text-gold' : ''}`} onClick={() => toggleBookmark(n, a)} aria-label="Bookmark">
                  {marked ? <BookmarkCheck size={17} /> : <Bookmark size={17} />}
                </button>
                <button className={`icon-btn size-9 ${note ? 'text-brand' : ''}`} onClick={() => setNoteFor(noteFor === a ? null : a)} aria-label="Note"><NotebookPen size={17} /></button>
                <button className="icon-btn size-9" aria-label="Copy" onClick={async () => {
                  await navigator.clipboard?.writeText(`${ar}\n\n${en}\n— Quran ${n}:${a} (${surah.tname})`)
                  setCopied(a); setTimeout(() => setCopied(null), 1500)
                }}>{copied === a ? <Check size={17} className="text-brand" /> : <Copy size={17} />}</button>
                {plan && <button className="icon-btn size-9" title="Mark read up to here" aria-label="Mark read up to here" onClick={() => markRead(a)}><Target size={17} /></button>}
              </div>
              <p className="quran text-right" style={{ fontSize: fontPx }}>
                {ar} <span className="ayah-num">{a}</span>
              </p>
              {settings.showTranslation && <p className="mt-3 text-[15px] leading-relaxed text-muted">{en}</p>}
              {noteFor === a && <NoteEditor s={n} a={a} initial={note?.text ?? ''} onDone={() => setNoteFor(null)} />}
              {note && noteFor !== a && (
                <p onClick={() => setNoteFor(a)} className="mt-3 cursor-pointer rounded-xl border-l-4 border-brand bg-surface-2 px-4 py-2 text-sm">{note.text}</p>
              )}
            </article>
          )
        })}
      </div>

      <nav className="mt-8 flex justify-between gap-3">
        {n > 1 ? <Link className="btn-ghost" to={`/quran/${n - 1}`}><ChevronLeft size={16} />{data.surahs[n - 2].tname}</Link> : <span />}
        {n < 114 && <Link className="btn-ghost" to={`/quran/${n + 1}`}>{data.surahs[n].tname}<ChevronRight size={16} /></Link>}
      </nav>
      <p className="mt-6 text-center text-xs text-muted">Arabic: Tanzil Uthmani (CC BY 3.0) · English: Pickthall (public domain) · <Link to="/about" className="underline">Sources</Link></p>
    </div>
  )
}

function NoteEditor({ s, a, initial, onDone }: { s: number; a: number; initial: string; onDone: () => void }) {
  const [text, setText] = useState(initial)
  return (
    <div className="fade-in mt-3 space-y-2">
      <textarea autoFocus className="input min-h-24" placeholder="Your reflection on this ayah…" value={text} onChange={(e) => setText(e.target.value)} />
      <div className="flex justify-end gap-2">
        <button className="btn-ghost" onClick={onDone}>Cancel</button>
        <button className="btn" onClick={async () => { await saveNote(s, a, text); onDone() }}>Save note</button>
      </div>
    </div>
  )
}
