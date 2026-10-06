import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Play } from 'lucide-react'
import { useQuran } from '../lib/quran'
import { play } from '../lib/audio'
import Loading from '../components/Loading'

// Duas are referenced by ayah only; the Arabic and translation are pulled from the verified dataset,
// so nothing here is hand-typed Quran text.
type Dua = { title: string; s: number; from: number; to?: number }
const GROUPS: { name: string; items: Dua[] }[] = [
  {
    name: 'Rabbana — duas of the believers',
    items: [
      { title: 'Good in this world and the next', s: 2, from: 201 },
      { title: 'Accept from us', s: 2, from: 127 },
      { title: 'Do not burden us beyond our capacity', s: 2, from: 286 },
      { title: 'Do not let our hearts deviate', s: 3, from: 8 },
      { title: 'Forgive us our sins', s: 3, from: 16 },
      { title: 'Righteous spouses and children', s: 25, from: 74 },
      { title: 'For those who came before us', s: 59, from: 10 },
      { title: 'Perfect our light', s: 66, from: 8 },
    ],
  },
  {
    name: 'Duas of the Prophets',
    items: [
      { title: 'Adam (AS) — seeking forgiveness', s: 7, from: 23 },
      { title: 'Ibrahim (AS) — establishing prayer', s: 14, from: 40, to: 41 },
      { title: 'Musa (AS) — ease and eloquence', s: 20, from: 25, to: 28 },
      { title: 'Musa (AS) — in need of good', s: 28, from: 24 },
      { title: 'Yunus (AS) — in distress', s: 21, from: 87 },
      { title: 'Nuh (AS) — for parents and believers', s: 71, from: 28 },
    ],
  },
  {
    name: 'Knowledge, family & mercy',
    items: [
      { title: 'Increase me in knowledge', s: 20, from: 114 },
      { title: 'Mercy for parents', s: 17, from: 24 },
      { title: 'The youth of the cave', s: 18, from: 10 },
      { title: 'Best of those who show mercy', s: 23, from: 118 },
      { title: 'Gratitude and righteous offspring', s: 46, from: 15 },
    ],
  },
  {
    name: 'Commonly recited morning & evening',
    items: [
      { title: 'Ayat al-Kursi', s: 2, from: 255 },
      { title: 'Last two ayahs of al-Baqarah', s: 2, from: 285, to: 286 },
      { title: 'Al-Ikhlas', s: 112, from: 1, to: 4 },
      { title: 'Al-Falaq', s: 113, from: 1, to: 5 },
      { title: 'An-Nas', s: 114, from: 1, to: 6 },
    ],
  },
]

export default function Duas() {
  const { data, error } = useQuran()
  const [g, setG] = useState(0)
  if (!data) return <Loading error={error} />
  return (
    <div className="fade-in space-y-4">
      <h1 className="h-page">Duas from the Quran</h1>
      <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4">
        {GROUPS.map((x, i) => (
          <button key={x.name} onClick={() => setG(i)} className={`shrink-0 rounded-full px-4 py-2 text-sm transition ${i === g ? 'bg-brand text-brand-ink font-semibold' : 'bg-surface-2 text-muted'}`}>{x.name}</button>
        ))}
      </div>
      <div className="space-y-3">
        {GROUPS[g].items.map((d) => {
          const surah = data.surahs[d.s - 1]
          const range = Array.from({ length: (d.to ?? d.from) - d.from + 1 }, (_, i) => d.from + i)
          return (
            <article key={d.title} className="card p-5">
              <div className="flex items-center gap-2">
                <p className="flex-1 font-semibold">{d.title}</p>
                <button className="icon-btn size-9" onClick={() => play(d.s, d.from)} aria-label="Play"><Play size={17} /></button>
              </div>
              <p className="quran mt-3 text-right text-[26px]">
                {range.map((a) => <span key={a}>{surah.ayahs[a - 1][0]} <span className="ayah-num">{a}</span> </span>)}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-muted">{range.map((a) => surah.ayahs[a - 1][1]).join(' ')}</p>
              <Link to={`/quran/${d.s}#${d.from}`} className="mt-3 inline-block text-xs font-semibold text-brand">
                {surah.tname} {d.s}:{d.from}{d.to ? `–${d.to}` : ''}
              </Link>
            </article>
          )
        })}
      </div>
    </div>
  )
}
