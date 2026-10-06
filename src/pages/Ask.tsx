import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Info, Search } from 'lucide-react'
import { useQuran } from '../lib/quran'
import { search } from '../lib/search'
import { hasWebGPU } from '../lib/ai'
import Loading from '../components/Loading'

const STOP = new Set('what does the quran say about is are a an of to in on for and or how why who when do does i me my you we our it be with from by as at this that'.split(' '))

export default function Ask() {
  const { data, error } = useQuran()
  const [q, setQ] = useState('')
  const [submitted, setSubmitted] = useState('')
  const [gpu, setGpu] = useState<boolean | null>(null)
  useEffect(() => { hasWebGPU().then(setGpu) }, [])

  // Keyword retrieval with OR semantics over the question's meaningful words.
  const hits = useMemo(() => {
    if (!data || !submitted) return []
    const words = submitted.toLowerCase().replace(/[^a-z؀-ۿ\s]/g, ' ').split(/\s+/).filter((w) => w.length > 2 && !STOP.has(w))
    const scores = new Map<string, { s: number; a: number; score: number }>()
    for (const w of words) for (const h of search(data, w, 40)) {
      const k = `${h.s}:${h.a}`
      const cur = scores.get(k)
      scores.set(k, { ...h, score: (cur?.score ?? 0) + h.score })
    }
    return [...scores.values()].sort((a, b) => b.score - a.score).slice(0, 12)
  }, [data, submitted])

  if (!data) return <Loading error={error} />

  return (
    <div className="fade-in space-y-4">
      <h1 className="h-page">Ask</h1>
      <form onSubmit={(e) => { e.preventDefault(); setSubmitted(q) }} className="flex gap-2">
        <input className="input" placeholder="e.g. What does the Quran say about patience?" value={q} onChange={(e) => setQ(e.target.value)} />
        <button className="btn shrink-0"><Search size={16} />Ask</button>
      </form>

      <div className="card flex gap-3 p-4 text-sm">
        <Info size={18} className="mt-0.5 shrink-0 text-gold" />
        <p className="text-muted">
          {gpu === false
            ? 'Local AI is unavailable on this device. '
            : 'On-device AI explanations are not enabled yet. '}
          Sirat Path never sends your questions to a server. Below are the most relevant verified Quranic sources, found on your device.
        </p>
      </div>

      {submitted && hits.length === 0 && <p className="py-8 text-center text-sm text-muted">No matching ayahs. Try different words.</p>}
      <div className="space-y-2.5">
        {hits.map(({ s, a }) => {
          const [ar, en] = data.surahs[s - 1].ayahs[a - 1]
          return (
            <Link key={`${s}:${a}`} to={`/quran/${s}#${a}`} className="card block p-4 transition hover:border-brand">
              <p className="chip">{data.surahs[s - 1].tname} {s}:{a}</p>
              <p className="quran mt-2 text-2xl leading-[2]">{ar}</p>
              <p className="mt-1 text-sm text-muted">{en}</p>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
