import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle, Bot, Cloud, Cpu, Download, Info, Loader2, Search, ShieldCheck, ShieldOff } from 'lucide-react'
import { useQuran } from '../lib/quran'
import { search } from '../lib/search'
import { FreeRemoteAIProvider, hasWebGPU, isModelCached, isModelLoaded, loadLocalModel, LOCAL_MODELS, LocalAIProvider, validateCitations, type Source } from '../lib/ai'
import Loading from '../components/Loading'
import { PageHeader } from '../components/ui'
import { useOnline } from '../lib/online'

const STOP = new Set('what does the quran say about is are a an of to in on for and or how why who when do does i me my you we our it be with from by as at this that tell explain allah islam'.split(' '))
const MODEL_KEY = 'sirat-ai-model'
const MODE_KEY = 'sirat-ai-mode'
type Mode = 'cloud' | 'local' | 'off'

export default function Ask() {
  const { data, error } = useQuran()
  const [q, setQ] = useState('')
  const [submitted, setSubmitted] = useState('')
  const [gpu, setGpu] = useState<boolean | null>(null)
  const [model, setModel] = useState<string>(() => localStorage.getItem(MODEL_KEY) ?? LOCAL_MODELS[0].id)
  const [cached, setCached] = useState(false)
  const [loading, setLoading] = useState<{ text: string; p: number } | null>(null)
  const [ready, setReady] = useState(() => isModelLoaded() === model)
  const [answer, setAnswer] = useState<{ text: string; done: boolean; valid: string[]; invalid: string[]; declined: boolean } | null>(null)
  const [aiErr, setAiErr] = useState<string | null>(null)
  const [mode, setModeState] = useState<Mode>(() => (localStorage.getItem(MODE_KEY) as Mode) ?? 'cloud')
  const [usedModel, setUsedModel] = useState<string | null>(null)
  const online = useOnline()
  const setMode = (m: Mode) => { setModeState(m); try { localStorage.setItem(MODE_KEY, m) } catch { /* ignore */ } }

  useEffect(() => { hasWebGPU().then((g) => { setGpu(g); if (!g) setModeState((m) => (m === 'local' ? 'cloud' : m)) }) }, [])
  useEffect(() => { isModelCached(model).then(setCached); setReady(isModelLoaded() === model) }, [model])

  // Step 1 — retrieval: verified ayahs only, ranked on-device.
  const hits = useMemo(() => {
    if (!data || !submitted) return []
    const words = submitted.toLowerCase().replace(/[^a-z؀-ۿ\s]/g, ' ').split(/\s+/).filter((w) => w.length > 2 && !STOP.has(w))
    const scores = new Map<string, { s: number; a: number; score: number }>()
    for (const w of words) for (const h of search(data, w, 40)) {
      const k = `${h.s}:${h.a}`
      scores.set(k, { ...h, score: (scores.get(k)?.score ?? 0) + h.score })
    }
    return [...scores.values()].sort((a, b) => b.score - a.score).slice(0, 8)
  }, [data, submitted])

  async function enable() {
    setAiErr(null)
    try {
      localStorage.setItem(MODEL_KEY, model)
      setLoading({ text: 'Starting…', p: 0 })
      await loadLocalModel(model, (r) => setLoading({ text: r.text, p: r.progress }))
      setReady(true); setCached(true)
    } catch (e) {
      console.error("[sirat-path] AI init failed", e); setAiErr(`Could not start the on-device model: ${e instanceof Error ? e.message : typeof e === "object" ? JSON.stringify(e) : String(e)}`)
    } finally { setLoading(null) }
  }

  // Step 2 — generation grounded in the retrieved sources, Step 3 — citation validation.
  useEffect(() => {
    const active = (mode === 'cloud' && online) || (mode === 'local' && ready)
    if (!active || !data || !submitted || hits.length === 0) { setAnswer(null); return }
    let live = true
    const sources: Source[] = hits.slice(0, 6).map(({ s, a }) => ({ ref: `${s}:${a}`, text: data.surahs[s - 1].ayahs[a - 1][1] }))
    const finish = (full: string) => { if (!live) return; const v = validateCitations(full, sources); setAnswer({ text: v.cleaned, done: true, valid: v.valid, invalid: v.invalid, declined: v.declined }) }
    setAnswer({ text: '', done: false, valid: [], invalid: [], declined: false }); setAiErr(null); setUsedModel(null)
    const run = mode === 'cloud'
      ? FreeRemoteAIProvider.explain(submitted, sources.map((x) => x.ref)).then((r) => { if (live) setUsedModel(r.model); return r.answer })
      : LocalAIProvider.explain(submitted, sources, (t) => live && setAnswer({ text: t, done: false, valid: [], invalid: [], declined: false }))
    run.then(finish).catch((e) => { if (live) { setAnswer(null); setAiErr((e as Error).message) } })
    return () => { live = false }
  }, [mode, ready, submitted, hits, data, online])

  if (!data) return <Loading error={error} />
  const rejected = answer?.done && !answer.declined && answer.valid.length === 0

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Ask Islam" subtitle="Answers grounded in verified Quranic sources — never invented" />
      <form onSubmit={(e) => { e.preventDefault(); setSubmitted(q.trim()) }} className="flex gap-2">
        <input className="input" placeholder="e.g. What does the Quran say about patience?" value={q} onChange={(e) => setQ(e.target.value)} />
        <button className="btn shrink-0"><Search size={16} />Ask</button>
      </form>

      {/* AI mode */}
      <section className="card mt-4 space-y-3 p-4 text-sm">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {([
            ['cloud', Cloud, 'Cloud AI', 'Fast answers · free', false],
            ['local', Cpu, 'On-device', gpu === false ? 'Not supported here' : 'Private · offline', gpu === false],
            ['off', ShieldOff, 'Sources only', 'No AI · verses only', false],
          ] as const).map(([m, Icon, label, sub, disabled]) => {
            const on = mode === m
            return (
              <button key={m} type="button" disabled={disabled} onClick={() => setMode(m)} aria-pressed={on}
                className={`flex items-center gap-3 rounded-2xl border-2 p-3 text-start transition ${on ? 'border-brand bg-brand/10 shadow-sm' : 'border-line hover:border-brand/40'} ${disabled ? 'cursor-not-allowed opacity-45' : ''}`}>
                <span className={`grid size-10 shrink-0 place-items-center rounded-xl ${on ? 'bg-brand text-brand-ink' : 'bg-surface-2 text-muted'}`}><Icon size={19} /></span>
                <span className="min-w-0 flex-1">
                  <span className={`block text-sm font-semibold ${on ? 'text-brand' : ''}`}>{label}</span>
                  <span className="block truncate text-xs text-muted">{sub}</span>
                </span>
                <span className={`grid size-5 shrink-0 place-items-center rounded-full border-2 ${on ? 'border-brand' : 'border-line'}`}>{on && <span className="size-2.5 rounded-full bg-brand" />}</span>
              </button>
            )
          })}
        </div>
        {mode === 'cloud' && !online && <p className="flex gap-2 rounded-xl bg-gold/10 p-3 text-muted"><Info size={18} className="shrink-0 text-gold" />You're offline, so Cloud AI is paused. Matching verified verses are still shown below, searched on your device.</p>}
        {mode === 'local' && (gpu === null ? <p className="text-muted">Checking device…</p> : !gpu ? (
          <p className="flex gap-2 rounded-xl bg-gold/10 p-3 text-muted"><Info size={18} className="shrink-0 text-gold" /><span>On-device AI needs WebGPU, which this browser doesn't support. Try the latest Chrome or Edge on a laptop, or use <button className="font-semibold text-brand underline" onClick={() => setMode('cloud')}>Cloud AI</button>.</span></p>
        ) : ready ? (
          <p className="flex items-center gap-2 text-brand"><Cpu size={18} />On-device AI is ready · {LOCAL_MODELS.find((m) => m.id === model)?.label}. Runs privately on your device.</p>
        ) : (
          <div className="space-y-3">
            <p className="flex gap-2"><Bot size={18} className="shrink-0 text-brand" /><span>Runs <b>entirely on your device</b>: no server, fully private. Downloaded once, then works offline.</span></p>
            <div className="flex flex-wrap gap-2">
              <select className="input w-auto py-2" value={model} onChange={(e) => setModel(e.target.value)} disabled={!!loading}>
                {LOCAL_MODELS.map((m) => <option key={m.id} value={m.id}>{m.label} · {m.size}</option>)}
              </select>
              <button className="btn" onClick={enable} disabled={!!loading}>{loading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}{cached ? 'Start AI' : 'Download & enable'}</button>
            </div>
            {loading && (
              <div><div className="h-2 overflow-hidden rounded-full bg-surface-2"><div className="h-full rounded-full bg-brand transition-all" style={{ width: `${Math.round(loading.p * 100)}%` }} /></div><p className="mt-1 truncate text-xs text-muted">{loading.text}</p></div>
            )}
            <p className="text-xs text-muted">Licence: {LOCAL_MODELS.find((m) => m.id === model)?.licence}. Works best on Chrome/Edge with a recent GPU.</p>
          </div>
        ))}
        {aiErr && <p className="text-red-500">{aiErr} — the verified sources below are still available.</p>}
      </section>

      {/* AI answer — clearly labelled and separated from sources */}
      {answer && (
        <section className="mt-4 rounded-2xl border-2 border-dashed border-brand/40 bg-brand/5 p-5">
          <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-brand"><Bot size={14} />AI reflection — not Quran, hadith or a religious ruling</p>
          {rejected ? (
            <p className="flex gap-2 text-sm"><AlertTriangle size={16} className="shrink-0 text-gold" />The AI response did not cite the provided sources, so it was withheld. Please read the verified sources below.</p>
          ) : (
            <p className="whitespace-pre-wrap leading-relaxed">{answer.text || (mode === 'cloud' ? 'Thinking…' : '…')}{!answer.done && <span className="ms-1 inline-block h-4 w-1.5 animate-pulse bg-brand align-middle" />}</p>
          )}
          {answer.done && !rejected && (
            <p className="mt-3 flex flex-wrap items-center gap-1.5 text-xs text-muted"><ShieldCheck size={14} className="text-brand" />Citations checked against retrieved sources:
              {answer.valid.map((r) => <Link key={r} to={`/quran/${r.split(':')[0]}#${r.split(':')[1]}`} className="chip text-brand">{r}</Link>)}
              {answer.invalid.length > 0 && <span className="text-gold">· removed {answer.invalid.length} unsupported citation(s)</span>}
              {usedModel && <span>· {mode === 'cloud' ? 'Groq' : 'on-device'} · {usedModel}</span>}
            </p>
          )}
        </section>
      )}

      {submitted && (
        <>
          <p className="mt-6 mb-2 text-xs font-semibold uppercase tracking-wider text-gold">Verified sources · Quran</p>
          {hits.length === 0 && <p className="py-6 text-center text-sm text-muted">I don't have enough reliable sources to answer this confidently. Try different words.</p>}
          <div className="space-y-2.5">
            {hits.map(({ s, a }) => {
              const [ar, en] = data.surahs[s - 1].ayahs[a - 1]
              return (
                <Link key={`${s}:${a}`} to={`/quran/${s}#${a}`} className="card block p-4 transition hover:border-brand">
                  <p className="chip text-brand">{data.surahs[s - 1].tname} {s}:{a}</p>
                  <p className="quran mt-2 text-2xl leading-[2]">{ar}</p>
                  <p className="mt-1 text-sm text-muted">{en}</p>
                </Link>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
