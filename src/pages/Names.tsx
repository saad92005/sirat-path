import { useMemo, useState } from 'react'
import { Grid3x3, Layers, RotateCw, Search, Shuffle } from 'lucide-react'
import { NAMES } from '../lib/names'

export default function Names() {
  const [mode, setMode] = useState<'grid' | 'learn'>('grid')
  const [q, setQ] = useState('')
  const list = useMemo(() => {
    const t = q.trim().toLowerCase()
    return NAMES.map((n, i) => ({ n, i })).filter(({ n }) => !t || n[1].toLowerCase().includes(t) || n[2].toLowerCase().includes(t) || n[0].includes(q.trim()))
  }, [q])

  return (
    <div className="fade-in space-y-5">
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex-1">
          <h1 className="h-page">Al-Asmaʾ al-Husna</h1>
          <p className="text-sm text-muted">The 99 Beautiful Names of Allah</p>
        </div>
        <div className="flex rounded-xl bg-surface-2 p-1 text-sm">
          <button onClick={() => setMode('grid')} className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition ${mode === 'grid' ? 'bg-surface font-semibold shadow-sm' : 'text-muted'}`}><Grid3x3 size={15} />Browse</button>
          <button onClick={() => setMode('learn')} className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition ${mode === 'learn' ? 'bg-surface font-semibold shadow-sm' : 'text-muted'}`}><Layers size={15} />Learn</button>
        </div>
      </div>

      {mode === 'grid' ? (
        <>
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" size={18} />
            <input className="input pl-10" placeholder="Search a name or meaning" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {list.map(({ n: [ar, tr, en], i }) => (
              <div key={i} className="card group relative overflow-hidden p-4 text-center transition hover:-translate-y-0.5 hover:border-brand hover:shadow-lg">
                <span className="absolute left-3 top-2 text-[11px] tabular-nums text-muted">{i + 1}</span>
                <p className="quran mt-2 text-3xl text-brand transition group-hover:scale-110">{ar}</p>
                <p className="mt-2 text-sm font-semibold">{tr}</p>
                <p className="text-xs text-muted">{en}</p>
              </div>
            ))}
          </div>
        </>
      ) : <Flashcards />}

      <p className="text-xs text-muted">Arranged as in the widely circulated list from the narration in Jamiʿ at-Tirmidhi. Scholars’ lists differ slightly. English meanings are brief glosses.</p>
    </div>
  )
}

function Flashcards() {
  const [order, setOrder] = useState(() => NAMES.map((_, i) => i))
  const [pos, setPos] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [known, setKnown] = useState(0)
  const [ar, tr, en] = NAMES[order[pos]]
  const next = (k: boolean) => { if (k) setKnown(known + 1); setFlipped(false); setPos((pos + 1) % order.length) }

  return (
    <div className="mx-auto max-w-md space-y-5">
      <div className="flex items-center justify-between text-sm text-muted">
        <span>Card {pos + 1} / {order.length}</span>
        <span>Knew {known}</span>
        <button className="icon-btn" title="Shuffle" onClick={() => { setOrder([...order].sort(() => Math.random() - 0.5)); setPos(0); setKnown(0); setFlipped(false) }}><Shuffle size={17} /></button>
      </div>
      <button onClick={() => setFlipped(!flipped)} className="relative h-72 w-full [perspective:1000px]">
        <div className={`absolute inset-0 transition-transform duration-500 [transform-style:preserve-3d] ${flipped ? '[transform:rotateY(180deg)]' : ''}`}>
          <div className="pattern absolute inset-0 grid place-items-center rounded-3xl hero shadow-xl [backface-visibility:hidden]">
            <div>
              <p className="quran text-6xl text-accent">{ar}</p>
              <p className="mt-6 flex items-center justify-center gap-1 text-xs text-white/50"><RotateCw size={12} />Tap to reveal</p>
            </div>
          </div>
          <div className="card absolute inset-0 grid place-items-center rounded-3xl p-6 [backface-visibility:hidden] [transform:rotateY(180deg)]">
            <div>
              <p className="text-3xl font-bold">{tr}</p>
              <p className="mt-2 text-lg text-muted">{en}</p>
            </div>
          </div>
        </div>
      </button>
      <div className="grid grid-cols-2 gap-3">
        <button className="btn-ghost" onClick={() => next(false)}>Still learning</button>
        <button className="btn" onClick={() => next(true)}>I knew it</button>
      </div>
    </div>
  )
}
