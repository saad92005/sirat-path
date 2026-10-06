import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate, useParams } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import {
  AlignJustify, Bookmark, BookmarkCheck, Brain, Check, ChevronLeft, ChevronRight, Copy, Download, Image, Languages,
  List, Loader2, Minus, NotebookPen, Pause, Play, Plus, Target,
} from 'lucide-react'
import { absIndex, juzOf, useQuran } from '../lib/quran'
import { setSettings, useSettings } from '../lib/settings'
import { db, logRead, saveNote, toggleBookmark, today } from '../lib/db'
import { downloadSurah, isSurahDownloaded, play, skip, toggle, useAudio } from '../lib/audio'
import { shareAyahImage } from '../lib/shareImage'
import Loading from '../components/Loading'

// Ayahs counted toward today's reading stats (once per ayah per day, per session).
const seenToday = new Set<string>()

export default function Reader() {
  const n = Number(useParams().surah)
  const { hash } = useLocation()
  const navigate = useNavigate()
  const { data, error } = useQuran()
  const settings = useSettings()
  const audio = useAudio()
  const bookmarks = useLiveQuery(() => db.bookmarks.where('s').equals(n).toArray(), [n]) ?? []
  const notes = useLiveQuery(() => db.notes.where('s').equals(n).toArray(), [n]) ?? []
  const plan = useLiveQuery(() => db.khatm.get('current'))
  const [noteFor, setNoteFor] = useState<number | null>(null)
  const [dl, setDl] = useState<{ done: number; total: number } | 'done' | 'error' | null>(null)
  const [flash, setFlash] = useState<string | null>(null)
  const [hifz, setHifz] = useState(false)
  const [revealed, setRevealed] = useState<Set<number>>(new Set())
  const [filter, setFilter] = useState('')
  const listRef = useRef<HTMLDivElement>(null)
  const sideRef = useRef<HTMLDivElement>(null)

  const surah = data?.surahs[n - 1]
  const mushaf = settings.readMode === 'mushaf'

  const toast = (m: string) => { setFlash(m); setTimeout(() => setFlash(null), 1800) }

  useEffect(() => { setRevealed(new Set()) }, [n, hifz])

  useEffect(() => {
    setDl(null)
    if (data) isSurahDownloaded(n).then((ok) => ok && setDl('done'))
  }, [n, data, settings.reciter])

  useEffect(() => {
    if (!surah) return
    const a = Number(hash.slice(1))
    if (a > 1) requestAnimationFrame(() => document.getElementById(`a${a}`)?.scrollIntoView({ block: 'center' }))
    else window.scrollTo(0, 0)
    const box = sideRef.current, item = box?.querySelector<HTMLElement>(`[data-s="${n}"]`)
    if (box && item) box.scrollTop = item.offsetTop - box.clientHeight / 2
  }, [surah, hash, n])

  // Track last-read position + count reading for Insights.
  useEffect(() => {
    if (!surah || !listRef.current) return
    let timer: ReturnType<typeof setTimeout>
    const io = new IntersectionObserver((entries) => {
      const visible = entries.filter((e) => e.isIntersecting).map((e) => Number((e.target as HTMLElement).dataset.a))
      if (!visible.length) return
      let fresh = 0
      for (const a of visible) { const k = `${today()}-${n}:${a}`; if (!seenToday.has(k)) { seenToday.add(k); fresh++ } }
      if (fresh) logRead(fresh)
      clearTimeout(timer)
      timer = setTimeout(() => setSettings({ lastRead: { s: n, a: Math.min(...visible) } }), 600)
    }, { rootMargin: '-35% 0px -45% 0px' })
    listRef.current.querySelectorAll('[data-a]').forEach((el) => io.observe(el))
    return () => { io.disconnect(); clearTimeout(timer) }
  }, [surah, n, mushaf])

  useEffect(() => {
    if (audio?.s === n) document.getElementById(`a${audio.a}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [audio?.s, audio?.a, n])

  // Keyboard shortcuts (desktop)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (/INPUT|TEXTAREA|SELECT/.test((e.target as HTMLElement).tagName) || e.ctrlKey || e.metaKey) return
      if (e.key === ' ') { e.preventDefault(); if (audio?.s === n) toggle(); else play(n, settings.lastRead?.s === n ? settings.lastRead.a : 1) }
      else if (e.key === 'ArrowRight' && e.shiftKey && n < 114) navigate(`/quran/${n + 1}`)
      else if (e.key === 'ArrowLeft' && e.shiftKey && n > 1) navigate(`/quran/${n - 1}`)
      else if (e.key === 'j') skip(1)
      else if (e.key === 'k') skip(-1)
      else if (e.key === 't') setSettings({ showTranslation: !settings.showTranslation })
      else if (e.key === 'm') setSettings({ readMode: mushaf ? 'verse' : 'mushaf' })
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [audio, n, settings.lastRead, settings.showTranslation, mushaf, navigate])

  const sideList = useMemo(() => {
    if (!data) return []
    const t = filter.trim().toLowerCase()
    return data.surahs.filter((s) => !t || String(s.n) === t || s.tname.toLowerCase().includes(t) || s.ename.toLowerCase().includes(t))
  }, [data, filter])

  if (!data || !surah) return <Loading error={error ?? (data ? 'Surah not found' : null)} />

  const isPlayingHere = audio?.s === n
  const fontPx = settings.arabicSize

  async function markRead(a: number) {
    if (!plan || !data) return
    const idx = absIndex(data, n, a) + 1
    if (idx > plan.doneIdx) { await db.khatm.update('current', { doneIdx: idx }); toast(`Khatm progress saved to ${n}:${a}`) }
  }

  async function startDownload() {
    try {
      setDl({ done: 0, total: surah!.ayas })
      await downloadSurah(n, (done, total) => setDl({ done, total }))
      setDl('done')
    } catch { setDl('error') }
  }

  const hidden = (a: number) => hifz && !revealed.has(a)
  const reveal = (a: number) => setRevealed((r) => new Set(r).add(a))

  return (
    <div className="fade-in lg:grid lg:grid-cols-[230px_1fr] lg:gap-8">
      {/* Desktop surah navigator */}
      <aside className="hidden lg:block">
        <div className="sticky top-8 flex max-h-[calc(100dvh-4rem)] flex-col rounded-2xl border border-line bg-surface">
          <input className="m-2 rounded-lg border border-line bg-bg px-3 py-2 text-sm outline-none focus:border-brand" placeholder="Filter surahs" value={filter} onChange={(e) => setFilter(e.target.value)} />
          <div ref={sideRef} className="relative flex-1 overflow-y-auto px-2 pb-2">
            {sideList.map((s) => (
              <NavLink key={s.n} data-s={s.n} to={`/quran/${s.n}`}
                className={({ isActive }) => `flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm transition ${isActive ? 'bg-brand text-brand-ink font-semibold' : 'text-muted hover:bg-surface-2 hover:text-ink'}`}>
                <span className="w-6 text-xs tabular-nums opacity-70">{s.n}</span><span className="truncate">{s.tname}</span>
              </NavLink>
            ))}
          </div>
        </div>
      </aside>

      <div className="min-w-0">
        <section className="pattern relative overflow-hidden rounded-3xl bg-[#0b2a24] px-6 py-8 text-center text-white md:py-12">
          <div className="pointer-events-none absolute -right-20 -top-20 size-64 rounded-full bg-[#2fa58a]/20 blur-3xl" />
          <p className="quran text-5xl text-[#d8b261] md:text-6xl">{surah.name}</p>
          <h1 className="mt-2 text-xl font-bold md:text-2xl">{surah.n}. {surah.tname}</h1>
          <p className="text-sm text-white/60">{surah.ename} · {surah.type} · {surah.ayas} ayahs · Juz {juzOf(data, n, 1)} · Revelation order {surah.order}</p>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            <button onClick={() => (isPlayingHere ? toggle() : play(n, 1))} className="inline-flex items-center gap-2 rounded-full bg-[#d8b261] px-5 py-2 text-sm font-semibold text-[#0b2a24] transition hover:brightness-110 active:scale-95">
              {isPlayingHere && audio?.playing ? <Pause size={16} /> : <Play size={16} />} {isPlayingHere && audio?.playing ? 'Pause' : 'Play surah'}
            </button>
            <button onClick={startDownload} disabled={dl !== null && dl !== 'error'} className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm transition hover:bg-white/15 active:scale-95 disabled:opacity-80">
              {dl === 'done' ? <><Check size={16} />Available offline</> : typeof dl === 'object' && dl ? <><Loader2 size={16} className="animate-spin" />{dl.done}/{dl.total}</> : <><Download size={16} />{dl === 'error' ? 'Retry download' : 'Download audio'}</>}
            </button>
          </div>
        </section>

        <div className="sticky top-14 z-20 -mx-4 mt-3 flex items-center gap-1 bg-bg/85 px-4 py-2 backdrop-blur-xl md:top-0 md:-mx-8 md:px-8">
          <div className="flex rounded-xl bg-surface-2 p-1">
            <button title="Verse by verse (M)" onClick={() => setSettings({ readMode: 'verse' })} className={`rounded-lg px-2.5 py-1.5 transition ${!mushaf ? 'bg-surface shadow-sm text-brand' : 'text-muted'}`}><List size={16} /></button>
            <button title="Mushaf flow (M)" onClick={() => setSettings({ readMode: 'mushaf' })} className={`rounded-lg px-2.5 py-1.5 transition ${mushaf ? 'bg-surface shadow-sm text-brand' : 'text-muted'}`}><AlignJustify size={16} /></button>
          </div>
          <button title="Memorisation mode — hide text, tap to reveal" className={`icon-btn ml-1 ${hifz ? 'bg-brand/10 text-brand' : ''}`} onClick={() => setHifz(!hifz)}><Brain size={18} /></button>
          <button title="Translation (T)" className={`icon-btn ${settings.showTranslation ? 'text-brand' : ''}`} onClick={() => setSettings({ showTranslation: !settings.showTranslation })}><Languages size={18} /></button>
          <div className="ml-auto flex items-center">
            <button className="icon-btn" onClick={() => setSettings({ arabicSize: Math.max(20, fontPx - 2) })} aria-label="Smaller text"><Minus size={17} /></button>
            <span className="w-7 text-center text-xs tabular-nums text-muted">{fontPx}</span>
            <button className="icon-btn" onClick={() => setSettings({ arabicSize: Math.min(56, fontPx + 2) })} aria-label="Larger text"><Plus size={17} /></button>
          </div>
        </div>

        {hifz && <p className="mt-2 rounded-xl bg-brand/10 px-4 py-2 text-sm text-brand">Memorisation mode: recite from memory, then tap an ayah to check it. Use repeat in the player to loop each ayah.</p>}

        {mushaf ? (
          <div ref={listRef} className="card mt-4 p-5 md:p-10">
            <p className="quran text-justify" style={{ fontSize: fontPx, lineHeight: 2.4 }}>
              {surah.ayahs.map(([ar], i) => {
                const a = i + 1
                const active = isPlayingHere && audio?.a === a
                return (
                  <span key={a} id={`a${a}`} data-a={a} onClick={() => (hidden(a) ? reveal(a) : play(n, a))}
                    className={`cursor-pointer rounded-lg transition-colors hover:bg-brand/5 ${active ? 'bg-brand/15' : ''} ${hidden(a) ? 'blur-md select-none' : ''}`}>
                    {ar} <span className="ayah-num">{a}</span>{' '}
                  </span>
                )
              })}
            </p>
          </div>
        ) : (
          <div ref={listRef} className="divide-y divide-line">
            {surah.ayahs.map(([ar, en], i) => {
              const a = i + 1
              const marked = bookmarks.some((b) => b.a === a)
              const note = notes.find((x) => x.a === a)
              const active = isPlayingHere && audio?.a === a
              const done = plan ? absIndex(data, n, a) < plan.doneIdx : false
              const ref = `${surah.tname} ${n}:${a}`
              return (
                <article key={a} id={`a${a}`} data-a={a} className={`group scroll-mt-32 py-6 transition-colors md:py-8 ${active ? '-mx-4 rounded-2xl bg-brand/8 px-4' : ''}`}>
                  <div className="mb-3 flex flex-wrap items-center gap-0.5 text-muted">
                    <span className="chip mr-auto">{n}:{a}{done && <Check size={12} className="text-brand" />}</span>
                    <button className={`icon-btn size-9 ${active ? 'text-brand' : ''}`} onClick={() => (active ? toggle() : play(n, a))} aria-label="Play ayah">
                      {active && audio?.playing ? <Pause size={17} /> : <Play size={17} />}
                    </button>
                    <button className={`icon-btn size-9 ${marked ? 'text-gold' : ''}`} onClick={() => { toggleBookmark(n, a); toast(marked ? 'Bookmark removed' : 'Bookmarked') }} aria-label="Bookmark">
                      {marked ? <BookmarkCheck size={17} /> : <Bookmark size={17} />}
                    </button>
                    <button className={`icon-btn size-9 ${note ? 'text-brand' : ''}`} onClick={() => setNoteFor(noteFor === a ? null : a)} aria-label="Note"><NotebookPen size={17} /></button>
                    <button className="icon-btn size-9" aria-label="Copy" onClick={async () => {
                      await navigator.clipboard?.writeText(`${ar}\n\n${en}\n— Quran ${n}:${a} (${surah.tname})`); toast('Copied')
                    }}><Copy size={17} /></button>
                    <button className="icon-btn size-9" aria-label="Share as image" title="Share as image" onClick={async () => {
                      toast('Creating image…'); toast((await shareAyahImage(ar, en, ref)) === 'shared' ? 'Shared' : 'Image saved')
                    }}><Image size={17} /></button>
                    {plan && <button className="icon-btn size-9" title="Mark Khatm progress up to here" aria-label="Mark read up to here" onClick={() => markRead(a)}><Target size={17} /></button>}
                  </div>
                  <p onClick={() => hidden(a) && reveal(a)} className={`quran text-right transition ${hidden(a) ? 'cursor-pointer select-none blur-md' : ''}`} style={{ fontSize: fontPx }}>
                    {ar} <span className="ayah-num">{a}</span>
                  </p>
                  {settings.showTranslation && <p className="mt-3 max-w-3xl text-[15px] leading-relaxed text-muted md:text-base">{en}</p>}
                  {noteFor === a && <NoteEditor s={n} a={a} initial={note?.text ?? ''} onDone={() => setNoteFor(null)} />}
                  {note && noteFor !== a && (
                    <p onClick={() => setNoteFor(a)} className="mt-3 cursor-pointer rounded-xl border-l-4 border-brand bg-surface-2 px-4 py-2 text-sm">{note.text}</p>
                  )}
                </article>
              )
            })}
          </div>
        )}

        <nav className="mt-8 flex justify-between gap-3">
          {n > 1 ? <Link className="btn-ghost" to={`/quran/${n - 1}`}><ChevronLeft size={16} />{data.surahs[n - 2].tname}</Link> : <span />}
          {n < 114 && <Link className="btn-ghost" to={`/quran/${n + 1}`}>{data.surahs[n].tname}<ChevronRight size={16} /></Link>}
        </nav>
        <p className="mt-6 text-center text-xs text-muted">
          Arabic: Tanzil Uthmani (CC BY 3.0) · English: Pickthall (public domain) · <Link to="/about" className="underline">Sources</Link>
          <span className="hidden md:inline"> · Shortcuts: Space play · J/K next/prev ayah · Shift+←/→ surah · T translation · M mode</span>
        </p>
      </div>

      {flash && <div className="fade-in fixed left-1/2 top-20 z-50 -translate-x-1/2 rounded-full bg-ink px-4 py-2 text-sm text-bg shadow-lg md:ml-32">{flash}</div>}
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
