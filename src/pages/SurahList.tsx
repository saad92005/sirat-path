import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Search } from 'lucide-react'
import { useQuran } from '../lib/quran'
import { searchSurahs } from '../lib/search'
import Loading from '../components/Loading'

export default function SurahList() {
  const { data, error } = useQuran()
  const [q, setQ] = useState('')
  const [tab, setTab] = useState<'surah' | 'juz'>('surah')
  if (!data) return <Loading error={error} />
  const list = searchSurahs(data, q)

  return (
    <div className="fade-in space-y-4">
      <h1 className="h-page">The Holy Quran</h1>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" size={18} />
          <input className="input pl-10" placeholder="Surah name or number" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <div className="flex rounded-xl bg-surface-2 p-1 text-sm">
          {(['surah', 'juz'] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)} className={`rounded-lg px-3 capitalize transition ${tab === t ? 'bg-surface font-semibold shadow-sm' : 'text-muted'}`}>{t}</button>
          ))}
        </div>
      </div>

      {tab === 'surah' ? (
        <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((s) => (
            <Link key={s.n} to={`/quran/${s.n}`} className="card group flex items-center gap-3 p-3.5 transition hover:-translate-y-0.5 hover:border-brand">
              <span className="grid size-10 shrink-0 rotate-45 place-items-center rounded-lg border border-gold/50 text-sm font-semibold transition group-hover:bg-brand group-hover:text-brand-ink">
                <span className="-rotate-45">{s.n}</span>
              </span>
              <div className="ml-1 min-w-0 flex-1">
                <p className="truncate font-semibold">{s.tname}</p>
                <p className="truncate text-xs text-muted">{s.ename} · {s.ayas} ayahs · {s.type}</p>
              </div>
              <span className="quran text-xl text-gold">{s.name}</span>
            </Link>
          ))}
          {list.length === 0 && <p className="text-sm text-muted">No surah matches “{q}”.</p>}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5">
          {data.juz.map((j, i) => (
            <Link key={i} to={`/quran/${j.s}#${j.a}`} className="card p-4 transition hover:border-brand">
              <p className="text-xs text-muted">Juz</p>
              <p className="text-2xl font-bold">{i + 1}</p>
              <p className="mt-1 truncate text-xs text-muted">{data.surahs[j.s - 1].tname} {j.s}:{j.a}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
