// AI is an optional enhancement. The provider abstraction keeps it swappable and never paid:
//   NoAIProvider     – default; never fabricates answers.
//   LocalAIProvider  – WebLLM on WebGPU, fully on-device, opt-in download, cached by the browser.
// A remote provider could implement the same interface later without touching any page.
import type { MLCEngineInterface, InitProgressReport } from '@mlc-ai/web-llm'

export interface AIProvider {
  id: string
  label: string
  isAvailable(): Promise<{ ok: boolean; reason?: string }>
  explain(question: string, sources: Source[], onToken?: (t: string) => void): Promise<string>
}

export type Source = { ref: string; text: string }

export const NoAIProvider: AIProvider = {
  id: 'none',
  label: 'No AI',
  isAvailable: async () => ({ ok: false, reason: 'Local AI is unavailable on this device.' }),
  explain: async () => { throw new Error('AI unavailable') },
}

export async function hasWebGPU() {
  const gpu = (navigator as Navigator & { gpu?: { requestAdapter(): Promise<unknown> } }).gpu
  if (!gpu) return false
  try { return Boolean(await gpu.requestAdapter()) } catch { return false }
}

export const LOCAL_MODELS = [
  { id: 'Qwen2.5-0.5B-Instruct-q4f16_1-MLC', label: 'Lite — Qwen2.5 0.5B', size: '≈ 300 MB download', licence: 'Apache-2.0' },
  { id: 'Llama-3.2-1B-Instruct-q4f16_1-MLC', label: 'Better — Llama 3.2 1B', size: '≈ 700 MB download', licence: 'Llama 3.2 Community Licence' },
] as const

const SYSTEM = `You are a careful study assistant inside an Islamic app.
Rules:
- Use ONLY the numbered sources provided. Do not add any other verse, hadith, scholar, or fact.
- Never write Arabic Quran text and never quote a verse that is not given.
- Cite sources inline exactly like [2:255] using the references provided.
- Do not issue religious rulings (fatwas). For rulings, advise asking a qualified scholar.
- If the sources do not answer the question, reply exactly: "I don't have enough reliable sources to answer this confidently."
- Be brief: 3–6 sentences, plain and respectful.`

let engine: MLCEngineInterface | null = null
let loadedModel: string | null = null

export async function loadLocalModel(model: string, onProgress: (p: InitProgressReport) => void) {
  if (engine && loadedModel === model) return engine
  const { CreateWebWorkerMLCEngine } = await import('@mlc-ai/web-llm')
  const worker = new Worker(new URL('./ai-worker.ts', import.meta.url), { type: 'module' })
  engine = await CreateWebWorkerMLCEngine(worker, model, { initProgressCallback: onProgress })
  loadedModel = model
  return engine
}

export const isModelLoaded = () => loadedModel

export async function isModelCached(model: string) {
  try { const { hasModelInCache } = await import('@mlc-ai/web-llm'); return await hasModelInCache(model) } catch { return false }
}

export const LocalAIProvider: AIProvider = {
  id: 'local',
  label: 'On-device AI',
  isAvailable: async () => (await hasWebGPU()) ? { ok: true } : { ok: false, reason: 'Local AI is unavailable on this device (WebGPU not supported).' },
  async explain(question, sources, onToken) {
    if (!engine) throw new Error('Model not loaded')
    const ctx = sources.map((s) => `[${s.ref}] ${s.text}`).join('\n')
    const stream = await engine.chat.completions.create({
      stream: true, temperature: 0.2, max_tokens: 320,
      messages: [
        { role: 'system', content: SYSTEM },
        { role: 'user', content: `Sources:\n${ctx}\n\nQuestion: ${question}` },
      ],
    })
    let out = ''
    for await (const chunk of stream) {
      const t = chunk.choices[0]?.delta?.content ?? ''
      out += t; onToken?.(out)
    }
    return out
  },
}

/**
 * Citation validation: keeps only citations that point at retrieved sources and reports any
 * invented ones. If nothing valid is cited, the answer is rejected by the caller.
 */
export function validateCitations(answer: string, sources: Source[]) {
  const allowed = new Set(sources.map((s) => s.ref))
  const cited = [...answer.matchAll(/\[(\d{1,3}:\d{1,3})\]/g)].map((m) => m[1])
  const invalid = cited.filter((c) => !allowed.has(c))
  const cleaned = answer.replace(/\[(\d{1,3}:\d{1,3})\]/g, (m, r) => (allowed.has(r) ? m : ''))
  const declined = /don't have enough reliable sources/i.test(answer)
  return { cleaned, valid: [...new Set(cited.filter((c) => allowed.has(c)))], invalid, declined }
}

/**
 * Free remote provider: our own Vercel function proxies Groq's free tier. Only the question and the
 * verse references are sent; the server re-reads verse text from verified data.
 */
export const FreeRemoteAIProvider = {
  id: 'cloud',
  label: 'Cloud AI (Groq, free)',
  async explain(question: string, refs: string[]): Promise<{ answer: string; model: string | null }> {
    const r = await fetch('/api/ask', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ question, refs }) })
    const d = await r.json().catch(() => ({ error: `HTTP ${r.status}` }))
    if (!r.ok) throw new Error(d.error ?? `HTTP ${r.status}`)
    return d
  },
}
