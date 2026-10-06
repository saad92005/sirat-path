// Converts the verbatim Tanzil source files in data-src/ into the JSON the app loads.
// Quran text is copied byte-for-byte — never modified. Run: npm run data
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import vm from 'node:vm'

const src = (f) => readFileSync(new URL(`../data-src/${f}`, import.meta.url), 'utf8')

function parsePipe(text) {
  const out = new Map()
  for (const line of text.split('\n')) {
    if (!line || line.startsWith('#')) continue
    const [s, a, ...rest] = line.split('|')
    out.set(`${s}:${a}`, rest.join('|').replace(/\r$/, ''))
  }
  return out
}

const ar = parsePipe(src('tanzil-quran-uthmani.txt'))
const en = parsePipe(src('en.pickthall.txt'))
if (ar.size !== 6236 || en.size !== 6236) throw new Error(`bad counts ar=${ar.size} en=${en.size}`)

const ctx = {}
vm.runInNewContext(src('tanzil-quran-data.js') + ';this.QuranData=QuranData', ctx)
const Q = ctx.QuranData

const surahs = []
for (let i = 1; i <= 114; i++) {
  const [start, ayas, order, rukus, name, tname, ename, type] = Q.Sura[i]
  const ayahs = []
  for (let a = 1; a <= ayas; a++) ayahs.push([ar.get(`${i}:${a}`), en.get(`${i}:${a}`)])
  surahs.push({ n: i, start, ayas, order, rukus, name, tname, ename, type, ayahs })
}

const juz = Q.Juz.slice(1, 31).map(([s, a]) => ({ s, a }))
const sajda = Q.Sajda.slice(1).map(([s, a]) => ({ s, a }))

const sources = [
  {
    id: 'quran-uthmani', kind: 'quran-text', name: 'Tanzil Quran Text (Uthmani, v1.1)',
    author: 'Tanzil Project', license: 'CC BY 3.0 — verbatim copies only, changing not allowed',
    language: 'ar', url: 'https://tanzil.net',
  },
  {
    id: 'en.pickthall', kind: 'translation', name: 'The Meaning of the Glorious Koran',
    author: 'Mohammed Marmaduke William Pickthall (1930)', license: 'Public domain (author d. 1936); text via Tanzil.net',
    language: 'en', url: 'https://tanzil.net/trans/',
  },
  {
    id: 'quran-metadata', kind: 'metadata', name: 'Tanzil Quran Metadata v1.0',
    author: 'Tanzil Project', license: 'CC BY 3.0', language: 'en', url: 'https://tanzil.net',
  },
]

mkdirSync(new URL('../public/data', import.meta.url), { recursive: true })
writeFileSync(
  new URL('../public/data/quran.json', import.meta.url),
  JSON.stringify({ version: 1, translation: 'en.pickthall', sources, juz, sajda, surahs }),
)
console.log('wrote public/data/quran.json')
