// Optional Quran study layer, fetched on demand from the public Quran.com API (v4) and cached by the
// service worker. Nothing here is bundled. Core reading always uses the verified local Tanzil text.
const API = 'https://api.quran.com/api/v4'

export const STUDY_TRANSLATIONS = [
  { id: 234, name: 'Fateh Muhammad Jalandhari', lang: 'ur' },
  { id: 54, name: 'Muhammad Junagarhi', lang: 'ur' },
  { id: 97, name: 'Tafheem-ul-Quran (Maududi)', lang: 'ur' },
  { id: 158, name: 'Bayan-ul-Quran (Israr Ahmad)', lang: 'ur' },
  { id: 819, name: 'Wahiduddin Khan', lang: 'ur' },
] as const

export const TAFSIRS = [
  { id: 169, name: 'Ibn Kathir (Abridged)', lang: 'en' },
  { id: 168, name: 'Maʿarif al-Quran', lang: 'en' },
  { id: 160, name: 'Tafsir Ibn Kathir', lang: 'ur' },
  { id: 159, name: 'Bayan ul Quran', lang: 'ur' },
  { id: 16, name: 'Tafsir al-Muyassar', lang: 'ar' },
] as const

const mem = new Map<string, Promise<unknown>>()
function get<T>(path: string): Promise<T> {
  if (!mem.has(path)) {
    mem.set(path, fetch(API + path).then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json() }).catch((e) => { mem.delete(path); throw e }))
  }
  return mem.get(path) as Promise<T>
}

/** HTML → plain text (keeps paragraph breaks, drops footnote markers). No HTML is ever injected. */
export function htmlToText(html: string) {
  const doc = new DOMParser().parseFromString(html.replace(/<sup[^>]*>.*?<\/sup>/g, ''), 'text/html')
  const blocks = [...doc.body.querySelectorAll('p, h1, h2, h3, h4, li')]
  if (!blocks.length) return [doc.body.textContent?.trim() ?? '']
  return blocks.map((b) => b.textContent?.trim() ?? '').filter(Boolean)
}

export async function chapterTranslation(chapter: number, id: number) {
  const d = await get<{ verses: { verse_number: number; translations: { text: string }[] }[] }>(
    `/verses/by_chapter/${chapter}?translations=${id}&per_page=300&fields=verse_number`)
  return new Map(d.verses.map((v) => [v.verse_number, htmlToText(v.translations[0]?.text ?? '').join(' ')]))
}

export type Word = { position: number; text: string; tr: string; translit: string; isEnd: boolean }
export async function wordByWord(s: number, a: number): Promise<Word[]> {
  const d = await get<{ verse: { words: { position: number; char_type_name: string; text_uthmani: string; translation: { text: string }; transliteration: { text: string | null } }[] } }>(
    `/verses/by_key/${s}:${a}?words=true&word_fields=text_uthmani&word_translation_language=en`)
  return d.verse.words.map((w) => ({ position: w.position, text: w.text_uthmani, tr: w.translation?.text ?? '', translit: w.transliteration?.text ?? '', isEnd: w.char_type_name === 'end' }))
}

export async function tafsir(id: number, s: number, a: number) {
  const d = await get<{ tafsir: { text: string; resource_name?: string } }>(`/tafsirs/${id}/by_ayah/${s}:${a}`)
  return htmlToText(d.tafsir.text)
}

// ---------- Tajweed ----------
export type TajSeg = { t: string; rule?: string }
export const TAJWEED_RULES: Record<string, { label: string; color: string }> = {
  ham_wasl: { label: 'Hamzat al-wasl', color: '#9ca3af' },
  laam_shamsiyah: { label: 'Lam shamsiyyah', color: '#9ca3af' },
  slnt: { label: 'Silent', color: '#9ca3af' },
  madda_normal: { label: 'Madd (2)', color: '#537fff' },
  madda_permissible: { label: 'Madd jaʾiz (2/4/6)', color: '#4050ff' },
  madda_necessary: { label: 'Madd lazim (6)', color: '#000ebc' },
  madda_obligatory: { label: 'Madd wajib (4/5)', color: '#2144c1' },
  qalaqah: { label: 'Qalqalah', color: '#dd0008' },
  ikhafa_shafawi: { label: 'Ikhfaʾ shafawi', color: '#d500b7' },
  ikhafa: { label: 'Ikhfaʾ', color: '#9400a8' },
  idgham_shafawi: { label: 'Idgham shafawi', color: '#58b800' },
  iqlab: { label: 'Iqlab', color: '#26bffd' },
  idgham_ghunnah: { label: 'Idgham with ghunnah', color: '#169777' },
  idgham_wo_ghunnah: { label: 'Idgham without ghunnah', color: '#169200' },
  idgham_mutajanisayn: { label: 'Idgham mutajanisayn', color: '#a1a1a1' },
  idgham_mutaqaribayn: { label: 'Idgham mutaqaribayn', color: '#a1a1a1' },
  ghunnah: { label: 'Ghunnah', color: '#ff7e1e' },
}

/** Parses Quran.com tajweed markup into plain segments (safe — no HTML rendering). */
export function parseTajweed(src: string): TajSeg[] {
  const out: TajSeg[] = []
  const clean = src.replace(/<span class=end>.*?<\/span>/g, '').trim()
  const re = /<tajweed class=([a-z_]+)>(.*?)<\/tajweed>/g
  let last = 0, m: RegExpExecArray | null
  while ((m = re.exec(clean))) {
    if (m.index > last) out.push({ t: clean.slice(last, m.index) })
    out.push({ t: m[2], rule: m[1] })
    last = m.index + m[0].length
  }
  if (last < clean.length) out.push({ t: clean.slice(last) })
  return out.map((s) => ({ ...s, t: s.t.replace(/<[^>]+>/g, '') }))
}

export async function chapterTajweed(chapter: number) {
  const d = await get<{ verses: { verse_key: string; text_uthmani_tajweed: string }[] }>(`/quran/verses/uthmani_tajweed?chapter_number=${chapter}`)
  return new Map(d.verses.map((v) => [Number(v.verse_key.split(':')[1]), parseTajweed(v.text_uthmani_tajweed)]))
}
