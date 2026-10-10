// hadith-api (github.com/fawazahmed0/hadith-api). jsDelivr is tried first; it refuses some files of
// this large package (Nasa'i and Ibn Majah currently return 403), so the same file is then read from GitHub.
const MIRRORS = [
  'https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1',
  'https://raw.githubusercontent.com/fawazahmed0/hadith-api/1',
]

export async function hadithFetch(path: string): Promise<Response> {
  let last: unknown
  for (const base of MIRRORS) {
    try { const r = await fetch(`${base}/${path}`); if (r.ok) return r; last = new Error(`HTTP ${r.status}`) } catch (e) { last = e }
  }
  throw last
}

export const hadithJson = <T,>(path: string): Promise<T> => hadithFetch(path).then((r) => r.json())

/** Collections that have an Urdu edition in hadith-api. */
export const URDU_COLLECTIONS = new Set(['bukhari', 'muslim', 'abudawud', 'tirmidhi', 'nasai', 'ibnmajah', 'malik'])
