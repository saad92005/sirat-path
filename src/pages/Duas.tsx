import { useEffect, useMemo, useState } from 'react'
import { useLocation, useSearchParams } from 'react-router-dom'
import { Search } from 'lucide-react'
import { DUAS, DUA_CATEGORIES } from '../content/duas'
import { useQuran } from '../lib/quran'
import DuaCard from '../components/DuaCard'
import Loading from '../components/Loading'
import { PageHeader } from '../components/ui'

export default function Duas() {
  const { data, error } = useQuran()
  const [params, setParams] = useSearchParams()
  const { hash } = useLocation()
  const cat = params.get('c')
  const [q, setQ] = useState('')

  const list = useMemo(() => {
    const t = q.trim().toLowerCase()
    if (t) return DUAS.filter((d) => d.title.toLowerCase().includes(t) || d.en?.toLowerCase().includes(t) || d.ref.toLowerCase().includes(t))
    return cat ? DUAS.filter((d) => d.cat === cat) : []
  }, [q, cat])

  useEffect(() => { if (hash) requestAnimationFrame(() => document.getElementById(hash.slice(1))?.scrollIntoView({ block: 'center' })) }, [hash, data])

  if (!data) return <Loading error={error} />
  const current = DUA_CATEGORIES.find((c) => c.id === cat)

  return (
    <div>
      <PageHeader title={current ? current.label : 'Duas & Supplications'} subtitle={current ? `${list.length} duas` : 'From the Quran and authentic Sunnah, each with its reference'}
        action={cat && <button className="btn-ghost" onClick={() => setParams({})}>All categories</button>} />
      <div className="relative mb-5">
        <Search className="absolute start-3.5 top-1/2 -translate-y-1/2 text-muted" size={18} />
        <input className="input ps-10" placeholder="Search duas — e.g. travel, anxiety, parents" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>

      {!cat && !q ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {DUA_CATEGORIES.map((c) => {
            const n = DUAS.filter((d) => d.cat === c.id).length
            return (
              <button key={c.id} onClick={() => setParams({ c: c.id })} className="card group flex flex-col items-start gap-3 p-4 text-start transition hover:-translate-y-0.5 hover:border-brand active:scale-[.98]">
                <span className="grid size-11 place-items-center rounded-2xl bg-brand/10 text-2xl transition group-hover:scale-110">{c.icon}</span>
                <span><span className="block font-semibold">{c.label}</span><span className="text-xs text-muted">{n} duas</span></span>
              </button>
            )
          })}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {list.map((d) => <DuaCard key={d.id} d={d} />)}
          {list.length === 0 && <p className="py-10 text-center text-sm text-muted">No duas match “{q}”.</p>}
        </div>
      )}
      <p className="mt-8 text-xs text-muted">Hadith numbers follow the common numbering used on sunnah.com. English renderings are this app’s own. Found an error? Please report it on GitHub.</p>
    </div>
  )
}
