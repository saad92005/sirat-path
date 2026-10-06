// Vercel serverless function (free tier): grounded Q&A via Groq's free API.
// The Groq key lives only in Vercel's encrypted env (GROQ_API_KEY) and never reaches the browser.
// Integrity: the client sends verse *references* only; the verse text is looked up server-side
// from the app's own verified Tanzil-derived data, so a client cannot inject fake "sources".

type Quran = { surahs: { tname: string; ayas: number; ayahs: [string, string][] }[] }

const MODELS = ['openai/gpt-oss-120b', 'openai/gpt-oss-20b']
const ALLOWED_ORIGINS = [/^https:\/\/siratpath\.vercel\.app$/, /^https:\/\/siratpath-[a-z0-9-]+\.vercel\.app$/, /^http:\/\/localhost:\d+$/]

const SYSTEM = `You are a careful study assistant inside an Islamic app.
Rules:
- Use ONLY the numbered Quran sources provided (English meaning by Pickthall). Do not add any other verse, hadith, scholar, story or fact.
- Never write Arabic Quran text and never quote a verse that is not provided.
- Cite sources inline exactly like [2:255], using only the references provided.
- Do not issue religious rulings (fatwas). For rulings, advise asking a qualified scholar.
- If the sources do not address the question, reply exactly: "I don't have enough reliable sources to answer this confidently."
- Be brief: 3–6 sentences, plain and respectful.`

let quran: Quran | null = null
const hits = new Map<string, number[]>()

function rateLimited(ip: string) {
  const now = Date.now(), win = 10 * 60_000, max = 20
  const list = (hits.get(ip) ?? []).filter((t) => now - t < win)
  list.push(now); hits.set(ip, list)
  return list.length > max
}

const json = (body: unknown, status = 200, origin = '') =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json', ...(origin ? { 'access-control-allow-origin': origin, vary: 'origin' } : {}) } })

export async function POST(req: Request) {
  const origin = req.headers.get('origin') ?? ''
  const sameSite = !origin || ALLOWED_ORIGINS.some((r) => r.test(origin))
  if (!sameSite) return json({ error: 'Forbidden origin' }, 403)

  const key = process.env.GROQ_API_KEY
  if (!key) return json({ error: 'AI is not configured on this deployment.' }, 503, origin)

  const ip = (req.headers.get('x-forwarded-for') ?? 'unknown').split(',')[0].trim()
  if (rateLimited(ip)) return json({ error: 'Too many questions — please wait a few minutes.' }, 429, origin)

  let body: { question?: unknown; refs?: unknown }
  try { body = await req.json() } catch { return json({ error: 'Invalid JSON' }, 400, origin) }
  const question = typeof body.question === 'string' ? body.question.trim() : ''
  const refs = Array.isArray(body.refs) ? body.refs.filter((r): r is string => typeof r === 'string' && /^\d{1,3}:\d{1,3}$/.test(r)).slice(0, 8) : []
  if (question.length < 3 || question.length > 500) return json({ error: 'Question must be 3–500 characters.' }, 400, origin)
  if (refs.length === 0) return json({ answer: "I don't have enough reliable sources to answer this confidently.", model: null }, 200, origin)

  // Load verified text from this deployment's own static data.
  if (!quran) {
    const base = new URL(req.url).origin
    const r = await fetch(`${base}/data/quran.json`)
    if (!r.ok) return json({ error: 'Could not load Quran data' }, 500, origin)
    quran = await r.json() as Quran
  }
  const sources = refs.flatMap((ref) => {
    const [s, a] = ref.split(':').map(Number)
    const surah = quran!.surahs[s - 1]
    if (!surah || a < 1 || a > surah.ayas) return []
    return [`[${ref}] (${surah.tname}) ${surah.ayahs[a - 1][1]}`]
  })
  if (!sources.length) return json({ answer: "I don't have enough reliable sources to answer this confidently.", model: null }, 200, origin)

  for (const model of MODELS) {
    const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { authorization: `Bearer ${key}`, 'content-type': 'application/json' },
      body: JSON.stringify({
        model, temperature: 0.2, max_tokens: 700,
        messages: [
          { role: 'system', content: SYSTEM },
          { role: 'user', content: `Sources:\n${sources.join('\n')}\n\nQuestion: ${question}` },
        ],
      }),
    })
    if (r.status === 429 || r.status >= 500) continue // try the fallback model
    if (!r.ok) return json({ error: `AI service error (${r.status})` }, 502, origin)
    const d = await r.json() as { choices: { message: { content: string } }[] }
    const answer = d.choices?.[0]?.message?.content?.trim() ?? ''
    return json({ answer, model }, 200, origin)
  }
  return json({ error: 'The free AI service is busy — please try again shortly.' }, 503, origin)
}
