import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { Bookmark, BookmarkCheck, ChevronRight, Copy, Image, Search, WifiOff } from 'lucide-react'
import { db, toggleSaved } from '../lib/db'
import { shareAyahImage } from '../lib/shareImage'
import { PageHeader } from '../components/ui'
import ReportButton from '../components/ReportButton'

// Hadith are fetched on demand from the open hadith-api project (jsDelivr CDN) and cached by the
// service worker once viewed. Nothing is bundled with the app. Translations remain the work of
// their respective translators/publishers; see DATA_SOURCES.md.
const API = 'https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1'

export const COLLECTIONS = [
  { id: 'nawawi', name: 'Forty Hadith of an-Nawawi', short: 'Nawawi 40', color: '#0f766e', note: 'A foundational collection of 42 essential hadith' },
  { id: 'qudsi', name: 'Forty Hadith Qudsi', short: 'Qudsi', color: '#7c3aed', note: 'Sayings attributed by the Prophet ﷺ to Allah' },
  { id: 'bukhari', name: 'Sahih al-Bukhari', short: 'Bukhari', color: '#b45309', note: 'The most authenticated collection' },
  { id: 'muslim', name: 'Sahih Muslim', short: 'Muslim', color: '#15803d', note: 'The second of the two Sahihs' },
  { id: 'abudawud', name: 'Sunan Abu Dawud', short: 'Abu Dawud', color: '#1d4ed8', note: 'Focused on legal hadith' },
  { id: 'tirmidhi', name: 'Jamiʿ at-Tirmidhi', short: 'Tirmidhi', color: '#be185d', note: 'Includes the author’s grading remarks' },
  { id: 'nasai', name: 'Sunan an-Nasaʾi', short: 'Nasaʾi', color: '#0369a1', note: 'One of the six major books' },
  { id: 'ibnmajah', name: 'Sunan Ibn Majah', short: 'Ibn Majah', color: '#a16207', note: 'One of the six major books' },
  { id: 'malik', name: 'Muwatta Malik', short: 'Muwatta', color: '#4d7c0f', note: 'Among the earliest compiled collections' },
]

type H = { hadithnumber: number; arabicnumber: number; text: string; grades?: { name: string; grade: string }[]; reference?: { book: number; hadith: number } }
type Info = Record<string, { metadata: { name: string; sections: Record<string, string> } }>

let infoCache: Promise<Info> | null = null
const getInfo = () => (infoCache ??= fetch(`${API}/info.min.json`).then((r) => { if (!r.ok) throw new Error(); return r.json() }).catch((e) => { infoCache = null; throw e }))

export default function Hadith() {
  const { collection, section } = useParams()
  if (collection && section) return <SectionView c={collection} s={section} />
  if (collection) return <CollectionView c={collection} />
  return (
    <div>
      <PageHeader title="Hadith" subtitle="The major collections, with references and grading where available" />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {COLLECTIONS.map((c) => (
          <Link key={c.id} to={`/hadith/${c.id}`} className="card group flex items-center gap-4 p-4 transition hover:-translate-y-0.5 hover:border-brand">
            <span className="grid size-12 shrink-0 place-items-center rounded-2xl text-lg font-bold text-white shadow-sm" style={{ background: c.color }}>{c.short[0]}</span>
            <div className="min-w-0 flex-1"><p className="font-semibold">{c.name}</p><p className="truncate text-xs text-muted">{c.note}</p></div>
            <ChevronRight size={18} className="text-muted rtl:rotate-180" />
          </Link>
        ))}
      </div>
      <SavedHadith />
      <p className="mt-8 text-xs text-muted">Loaded on demand from the open-source hadith-api project and cached on your device after viewing. Grades shown are those recorded by the named scholars; they are not this app’s rulings.</p>
    </div>
  )
}

function SavedHadith() {
  const saved = useLiveQuery(() => db.saved.where('kind').equals('hadith').toArray()) ?? []
  if (!saved.length) return null
  return (
    <section className="mt-6">
      <p className="mb-2 font-semibold">Saved hadith</p>
      <div className="flex flex-wrap gap-2">{saved.map((s) => <Link key={s.id} className="chip hover:text-ink" to={s.ref}>{s.id.replace('hadith:', '').replace(/-/g, ' ')}</Link>)}</div>
    </section>
  )
}

function useFetch<T>(url: string | null, fn?: () => Promise<T>) {
  const [state, setState] = useState<{ data?: T; error?: boolean }>({})
  useEffect(() => {
    let live = true
    setState({})
    ;(fn ? fn() : fetch(url!).then((r) => { if (!r.ok) throw new Error(); return r.json() }))
      .then((d) => live && setState({ data: d }))
      .catch(() => live && setState({ error: true }))
    return () => { live = false }
  }, [url]) // eslint-disable-line react-hooks/exhaustive-deps
  return state
}

function Offline() {
  return <div className="card flex flex-col items-center gap-2 p-10 text-center text-sm text-muted"><WifiOff />This collection hasn’t been opened before and you’re offline. Connect once to view and cache it.</div>
}

function CollectionView({ c }: { c: string }) {
  const meta = COLLECTIONS.find((x) => x.id === c)
  const { data, error } = useFetch<Info>('info', getInfo)
  const [q, setQ] = useState('')
  const sections = data ? Object.entries(data[c]?.metadata.sections ?? {}).filter(([k, v]) => k !== '0' && v) : []
  const shown = sections.filter(([, v]) => v.toLowerCase().includes(q.toLowerCase()))
  return (
    <div>
      <PageHeader title={meta?.name ?? c} subtitle={`${sections.length || '…'} books`} action={<Link to="/hadith" className="btn-ghost">All collections</Link>} />
      {error ? <Offline /> : !data ? <Skeleton /> : (
        <>
          <div className="relative mb-4"><Search className="absolute start-3.5 top-1/2 -translate-y-1/2 text-muted" size={18} /><input className="input ps-10" placeholder="Filter books" value={q} onChange={(e) => setQ(e.target.value)} /></div>
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
            {shown.map(([k, v]) => (
              <Link key={k} to={`/hadith/${c}/${k}`} className="card flex items-center gap-3 px-4 py-3 transition hover:border-brand">
                <span className="w-8 text-sm tabular-nums text-muted">{k}</span><span className="flex-1 text-sm font-medium">{v}</span><ChevronRight size={16} className="text-muted rtl:rotate-180" />
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function SectionView({ c, s }: { c: string; s: string }) {
  const meta = COLLECTIONS.find((x) => x.id === c)
  const en = useFetch<{ metadata: { section: Record<string, string> }; hadiths: H[] }>(`${API}/editions/eng-${c}/sections/${s}.min.json`)
  const ar = useFetch<{ hadiths: H[] }>(`${API}/editions/ara-${c}/sections/${s}.min.json`)
  const [q, setQ] = useState('')
  const arMap = useMemo(() => new Map((ar.data?.hadiths ?? []).map((h) => [h.hadithnumber, h.text])), [ar.data])
  const list = (en.data?.hadiths ?? []).filter((h) => h.text && (!q || h.text.toLowerCase().includes(q.toLowerCase())))

  return (
    <div>
      <PageHeader title={en.data ? Object.values(en.data.metadata.section)[0] : 'Loading…'} subtitle={meta?.name}
        action={<Link to={`/hadith/${c}`} className="btn-ghost">Books</Link>} />
      {en.error ? <Offline /> : !en.data ? <Skeleton /> : (
        <>
          <div className="relative mb-4"><Search className="absolute start-3.5 top-1/2 -translate-y-1/2 text-muted" size={18} /><input className="input ps-10" placeholder="Search in this book" value={q} onChange={(e) => setQ(e.target.value)} /></div>
          <p className="mb-3 text-xs text-muted">{list.length} hadith</p>
          <div className="space-y-4">{list.map((h) => <HadithCard key={h.hadithnumber} h={h} ar={arMap.get(h.hadithnumber)} c={c} s={s} name={meta?.name ?? c} />)}</div>
        </>
      )}
    </div>
  )
}

function HadithCard({ h, ar, c, s, name }: { h: H; ar?: string; c: string; s: string; name: string }) {
  const key = `${c}-${h.hadithnumber}`
  const saved = useLiveQuery(() => db.saved.get(`hadith:${key}`), [key])
  const ref = `${name} ${h.hadithnumber}`
  return (
    <article id={`h${h.hadithnumber}`} className="card p-5 md:p-6">
      <div className="flex items-center gap-1">
        <span className="chip me-auto text-brand">{ref}</span>
        <button className={`icon-btn size-9 ${saved ? 'text-gold' : ''}`} aria-label="Save" onClick={() => toggleSaved('hadith', key, `/hadith/${c}/${s}#h${h.hadithnumber}`)}>{saved ? <BookmarkCheck size={17} /> : <Bookmark size={17} />}</button>
        <button className="icon-btn size-9" aria-label="Copy" onClick={() => navigator.clipboard?.writeText(`${ar ? ar + '\n\n' : ''}${h.text}\n— ${ref}`)}><Copy size={17} /></button>
        {ar && <button className="icon-btn size-9" aria-label="Share as image" onClick={() => shareAyahImage(ar.length > 500 ? ar.slice(0, 500) + '…' : ar, h.text.length > 400 ? h.text.slice(0, 400) + '…' : h.text, ref)}><Image size={17} /></button>}
        <ReportButton item={`Hadith: ${ref}`} />
      </div>
      {ar && <p className="quran mt-4 text-right text-[22px] leading-[2.1]">{ar}</p>}
      <p className="mt-3 whitespace-pre-line text-[15px] leading-relaxed">{h.text}</p>
      {h.grades && h.grades.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {h.grades.map((g) => (
            <span key={g.name} className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${/sahih/i.test(g.grade) ? 'bg-brand/12 text-brand' : /hasan/i.test(g.grade) ? 'bg-gold/15 text-gold' : 'bg-red-500/10 text-red-500'}`}>{g.grade} — {g.name}</span>
          ))}
        </div>
      )}
    </article>
  )
}

function Skeleton() {
  return <div className="space-y-3">{Array.from({ length: 5 }, (_, i) => <div key={i} className="h-24 animate-pulse rounded-2xl bg-surface-2" />)}</div>
}
