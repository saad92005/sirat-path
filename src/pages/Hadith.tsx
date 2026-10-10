import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { Bookmark, BookmarkCheck, ChevronRight, Copy, Image, Search, WifiOff } from 'lucide-react'
import { db, toggleSaved } from '../lib/db'
import { shareAyahImage } from '../lib/shareImage'
import WhatsAppButton from '../components/WhatsAppButton'
import { PageHeader } from '../components/ui'
import ReportButton from '../components/ReportButton'
import { hadithJson, URDU_COLLECTIONS } from '../lib/hadithApi'
import { setSettings, useSettings } from '../lib/settings'

// Hadith are fetched on demand from the open hadith-api project and cached by the service worker
// once viewed. Nothing is bundled with the app. Translations remain the work of their respective
// translators/publishers; see DATA_SOURCES.md.

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
const getInfo = () => (infoCache ??= hadithJson<Info>('info.min.json').catch((e) => { infoCache = null; throw e }))

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

function useFetch<T>(path: string | null, fn?: () => Promise<T>) {
  const [state, setState] = useState<{ data?: T; error?: boolean }>({})
  useEffect(() => {
    let live = true
    setState({})
    if (!path) return
    ;(fn ? fn() : hadithJson<T>(path))
      .then((d) => live && setState({ data: d }))
      .catch(() => live && setState({ error: true }))
    return () => { live = false }
  }, [path]) // eslint-disable-line react-hooks/exhaustive-deps
  return state
}

function Offline() {
  return <div className="card flex flex-col items-center gap-2 p-10 text-center text-sm text-muted"><WifiOff />You’re offline and this part of the collection isn’t saved yet.<Link to="/settings#offline" className="btn-ghost mt-2">Download collections for offline</Link><span className="text-xs">Settings → Offline downloads saves whole collections to your phone.</span></div>
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
  const settings = useSettings()
  const hasUrdu = URDU_COLLECTIONS.has(c)
  const lang = hasUrdu ? settings.hadithLang : 'en'
  const en = useFetch<{ metadata: { section: Record<string, string> }; hadiths: H[] }>(`editions/eng-${c}/sections/${s}.min.json`)
  const ar = useFetch<{ hadiths: H[] }>(`editions/ara-${c}/sections/${s}.min.json`)
  const ur = useFetch<{ hadiths: H[] }>(lang !== 'en' ? `editions/urd-${c}/sections/${s}.min.json` : null)
  const [q, setQ] = useState('')
  const arMap = useMemo(() => new Map((ar.data?.hadiths ?? []).map((h) => [h.hadithnumber, h.text])), [ar.data])
  const urMap = useMemo(() => new Map((ur.data?.hadiths ?? []).filter((h) => h.text).map((h) => [h.hadithnumber, h.text])), [ur.data])
  const list = (en.data?.hadiths ?? []).filter((h) => h.text && (!q || h.text.toLowerCase().includes(q.toLowerCase()) || urMap.get(h.hadithnumber)?.includes(q)))
  // Urdu-only mode still shows English for any hadith the Urdu edition is missing.
  const showEn = (n: number) => lang !== 'ur' || (!!ur.data && !urMap.has(n)) || !!ur.error

  return (
    <div>
      <PageHeader title={en.data ? Object.values(en.data.metadata.section)[0] : 'Loading…'} subtitle={meta?.name}
        action={<Link to={`/hadith/${c}`} className="btn-ghost">Books</Link>} />
      {en.error ? <Offline /> : !en.data ? <Skeleton /> : (
        <>
          <div className="relative mb-4"><Search className="absolute start-3.5 top-1/2 -translate-y-1/2 text-muted" size={18} /><input className="input ps-10" placeholder="Search in this book" value={q} onChange={(e) => setQ(e.target.value)} /></div>
          {hasUrdu && (
            <div role="radiogroup" aria-label="Translation language" className="mb-3 flex gap-1 rounded-xl bg-surface-2 p-1">
              {([['en', 'English'], ['ur', 'اردو'], ['both', 'Both']] as const).map(([k, l]) => (
                <button key={k} role="radio" aria-checked={lang === k} onClick={() => setSettings({ hadithLang: k })}
                  className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition ${k === 'ur' ? 'urdu' : ''} ${lang === k ? 'bg-brand text-brand-ink shadow-sm' : 'text-muted hover:text-ink'}`}>{l}</button>
              ))}
            </div>
          )}
          {lang !== 'en' && ur.error && <p className="mb-3 text-xs text-red-500">Urdu translation couldn’t be loaded — showing English.</p>}
          <p className="mb-3 text-xs text-muted">{list.length} hadith</p>
          <div className="space-y-4">{list.map((h) => <HadithCard key={h.hadithnumber} h={h} ar={arMap.get(h.hadithnumber)} ur={lang !== 'en' ? urMap.get(h.hadithnumber) : undefined} showEn={showEn(h.hadithnumber)} c={c} s={s} name={meta?.name ?? c} />)}</div>
          {lang !== 'en' && <p className="mt-6 text-xs text-muted">Urdu text is from the hadith-api dataset, matched to the same hadith number as the Arabic and English. The dataset does not name the Urdu translator, so for scholarly use check it against a printed edition or sunnah.com. The Arabic is the primary text.</p>}
        </>
      )}
    </div>
  )
}

function HadithCard({ h, ar, ur, showEn = true, c, s, name }: { h: H; ar?: string; ur?: string; showEn?: boolean; c: string; s: string; name: string }) {
  const key = `${c}-${h.hadithnumber}`
  const saved = useLiveQuery(() => db.saved.get(`hadith:${key}`), [key])
  const ref = `${name} ${h.hadithnumber}`
  const tr = [ur, showEn ? h.text : ''].filter(Boolean).join('\n\n')
  return (
    <article id={`h${h.hadithnumber}`} className="card p-5 md:p-6">
      <div className="flex flex-wrap items-center gap-1">
        <span className="chip me-auto text-brand">{ref}</span>
        <button className={`icon-btn size-10 ${saved ? 'text-gold' : ''}`} aria-label="Save" onClick={() => toggleSaved('hadith', key, `/hadith/${c}/${s}#h${h.hadithnumber}`)}>{saved ? <BookmarkCheck size={20} /> : <Bookmark size={20} />}</button>
        <button className="icon-btn size-10" aria-label="Copy" onClick={() => navigator.clipboard?.writeText(`${ar ? ar + '\n\n' : ''}${tr}\n— ${ref}`)}><Copy size={20} /></button>
        {ar && <button className="icon-btn size-10" aria-label="Share as image" onClick={() => shareAyahImage(ar.length > 500 ? ar.slice(0, 500) + '…' : ar, h.text.length > 400 ? h.text.slice(0, 400) + '…' : h.text, ref)}><Image size={20} /></button>}
        <WhatsAppButton body={tr.length > 1200 ? tr.slice(0, 1200) + '…' : tr} refText={ref} path={`/hadith/${c}/${s}#h${h.hadithnumber}`} />
        <ReportButton item={`Hadith: ${ref}`} />
      </div>
      {ar && <p className="quran mt-4 text-right text-[22px] leading-[2.1]">{ar}</p>}
      {ur && <p dir="rtl" lang="ur" className="urdu mt-3 whitespace-pre-line text-right text-[18px] leading-[2]">{ur}</p>}
      {showEn && <p className="mt-3 whitespace-pre-line text-[15px] leading-relaxed">{h.text}</p>}
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
