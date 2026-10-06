import { useDeferredValue, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Search as SearchIcon } from 'lucide-react'
import { useQuran } from '../lib/quran'
import { search } from '../lib/search'
import Loading from '../components/Loading'
import { DUAS } from '../content/duas'
import { COURSES } from '../content/learn'
import { NAMES } from '../lib/names'

const SUGGEST = ['mercy', 'patience', 'parents', 'forgive', '2:255', 'الرحمن', 'light']

export default function SearchPage() {
  const { data, error } = useQuran()
  const [params, setParams] = useSearchParams()
  const [q, setQ] = useState(params.get('q') ?? '')
  const dq = useDeferredValue(q)
  const hits = useMemo(() => (data ? search(data, dq) : []), [data, dq])

  if (!data) return <Loading error={error} />
  const update = (v: string) => { setQ(v); setParams(v ? { q: v } : {}, { replace: true }) }

  return (
    <div className="fade-in space-y-4">
      <h1 className="h-page">Search the Quran</h1>
      <div className="relative">
        <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" size={18} />
        <input autoFocus className="input py-3.5 pl-10 text-base" placeholder="Words in English or Arabic, or a reference like 2:255" value={q} onChange={(e) => update(e.target.value)} />
      </div>
      {!q && (
        <div className="flex flex-wrap gap-2">
          {SUGGEST.map((s) => <button key={s} className="chip hover:text-ink" onClick={() => update(s)}>{s}</button>)}
        </div>
      )}
      {q.trim().length > 1 && <Others q={q} />}
      {q && <p className="text-xs text-muted">{hits.length === 60 ? '60+' : hits.length} results · searched on-device</p>}
      <div className="space-y-2.5">
        {hits.map(({ s, a }) => {
          const [ar, en] = data.surahs[s - 1].ayahs[a - 1]
          return (
            <Link key={`${s}:${a}`} to={`/quran/${s}#${a}`} className="card block p-4 transition hover:border-brand">
              <p className="chip">{data.surahs[s - 1].tname} {s}:{a}</p>
              <p className="quran mt-2 text-2xl leading-[2]">{ar}</p>
              <p className="mt-1 text-sm text-muted"><Highlight text={en} q={dq} /></p>
            </Link>
          )
        })}
        {q && hits.length === 0 && <p className="py-10 text-center text-sm text-muted">No ayahs found for “{q}”.</p>}
      </div>
    </div>
  )
}

function Highlight({ text, q }: { text: string; q: string }) {
  const words = q.trim().split(/\s+/).filter((w) => w.length > 1 && /^[a-z]+$/i.test(w))
  if (!words.length) return <>{text}</>
  const re = new RegExp(`(${words.join('|')})`, 'gi')
  return <>{text.split(re).map((p, i) => (i % 2 ? <mark key={i} className="rounded bg-gold/25 px-0.5 text-ink">{p}</mark> : p))}</>
}

function Others({ q }: { q: string }) {
  const t = q.trim().toLowerCase()
  const duas = DUAS.filter((d) => d.title.toLowerCase().includes(t) || d.en?.toLowerCase().includes(t)).slice(0, 6)
  const lessons = COURSES.flatMap((c) => c.lessons.map((l) => ({ c, l }))).filter(({ l }) => l.title.toLowerCase().includes(t) || l.body.some((b) => b.p.toLowerCase().includes(t))).slice(0, 6)
  const names = NAMES.map((n, i) => ({ n, i })).filter(({ n }) => n[1].toLowerCase().includes(t) || n[2].toLowerCase().includes(t)).slice(0, 6)
  if (!duas.length && !lessons.length && !names.length) return null
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
      {duas.length > 0 && <div className="card p-4"><p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gold">Duas</p>{duas.map((d) => <Link key={d.id} to={`/duas?c=${d.cat}#${d.id}`} className="block truncate rounded-lg px-2 py-1.5 text-sm hover:bg-surface-2">{d.title}</Link>)}</div>}
      {lessons.length > 0 && <div className="card p-4"><p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gold">Lessons</p>{lessons.map(({ c, l }) => <Link key={l.id} to={`/learn/${c.id}/${l.id}`} className="block truncate rounded-lg px-2 py-1.5 text-sm hover:bg-surface-2">{l.title} <span className="text-muted">· {c.title}</span></Link>)}</div>}
      {names.length > 0 && <div className="card p-4"><p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gold">Names of Allah</p>{names.map(({ n, i }) => <Link key={i} to="/names" className="flex justify-between rounded-lg px-2 py-1.5 text-sm hover:bg-surface-2"><span>{n[1]} — {n[2]}</span><span className="quran">{n[0]}</span></Link>)}</div>}
    </div>
  )
}
