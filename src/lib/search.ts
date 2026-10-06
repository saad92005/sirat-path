import MiniSearch from 'minisearch'
import type { QuranData } from './quran'

export type Hit = { s: number; a: number; score: number }

// Search-only normalisation: strips harakat/Quranic marks and unifies letter forms so that
// typing plain Arabic finds Uthmani text. Displayed Quran text is never altered.
export function normalizeArabic(t: string) {
  return t
    .replace(/[ؐ-ًؚ-ٰٟۖ-ۭـ]/g, '')
    .replace(/[آأإٱ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
}

const isArabic = (q: string) => /[؀-ۿ]/.test(q)

let index: MiniSearch | null = null

function build(q: QuranData) {
  const ms = new MiniSearch({
    fields: ['en', 'ar'],
    storeFields: ['s', 'a'],
    processTerm: (t) => normalizeArabic(t.toLowerCase()),
    searchOptions: { prefix: true, fuzzy: 0.15, combineWith: 'AND' },
  })
  const docs = []
  for (const s of q.surahs) {
    for (let i = 0; i < s.ayahs.length; i++) docs.push({ id: s.start + i, s: s.n, a: i + 1, en: s.ayahs[i][1], ar: s.ayahs[i][0] })
  }
  ms.addAll(docs)
  return ms
}

export function search(q: QuranData, query: string, limit = 60): Hit[] {
  const t = query.trim()
  if (!t) return []
  // Direct reference e.g. "2:255"
  const ref = t.match(/^(\d{1,3})\s*[:.]\s*(\d{1,3})$/)
  if (ref) {
    const s = +ref[1], a = +ref[2]
    if (s >= 1 && s <= 114 && a >= 1 && a <= q.surahs[s - 1].ayas) return [{ s, a, score: 1 }]
  }
  index ??= build(q)
  return index
    .search(t, { fields: isArabic(t) ? ['ar'] : ['en'] })
    .slice(0, limit)
    .map((r) => ({ s: r.s as number, a: r.a as number, score: r.score }))
}

export function searchSurahs(q: QuranData, query: string) {
  const t = query.trim().toLowerCase().replace(/[-'\s]/g, '')
  if (!t) return q.surahs
  return q.surahs.filter((s) =>
    String(s.n) === t ||
    s.tname.toLowerCase().replace(/[-'\s]/g, '').includes(t) ||
    s.ename.toLowerCase().replace(/[-'\s]/g, '').includes(t) ||
    normalizeArabic(s.name).includes(normalizeArabic(query.trim())),
  )
}
