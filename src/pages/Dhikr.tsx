import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { RotateCcw } from 'lucide-react'
import { db } from '../lib/db'

const PHRASES = [
  { id: 'subhanallah', ar: 'سُبْحَانَ ٱللَّٰهِ', tr: 'SubhanAllah', en: 'Glory be to Allah', target: 33 },
  { id: 'alhamdulillah', ar: 'ٱلْحَمْدُ لِلَّٰهِ', tr: 'Alhamdulillah', en: 'All praise is for Allah', target: 33 },
  { id: 'allahuakbar', ar: 'ٱللَّٰهُ أَكْبَرُ', tr: 'Allahu Akbar', en: 'Allah is the Greatest', target: 34 },
  { id: 'tahlil', ar: 'لَا إِلَٰهَ إِلَّا ٱللَّٰهُ', tr: 'La ilaha illallah', en: 'There is no god but Allah', target: 100 },
  { id: 'istighfar', ar: 'أَسْتَغْفِرُ ٱللَّٰهَ', tr: 'Astaghfirullah', en: 'I seek Allah’s forgiveness', target: 100 },
  { id: 'subhanallahwabihamdihi', ar: 'سُبْحَانَ ٱللَّٰهِ وَبِحَمْدِهِ', tr: 'SubhanAllahi wa bihamdihi', en: 'Glory and praise be to Allah', target: 100 },
  { id: 'hawqala', ar: 'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِٱللَّٰهِ', tr: 'La hawla wa la quwwata illa billah', en: 'There is no power nor strength except by Allah', target: 100 },
  { id: 'salawat', ar: 'ٱللَّٰهُمَّ صَلِّ عَلَىٰ مُحَمَّدٍ', tr: 'Allahumma salli ‘ala Muhammad', en: 'O Allah, send blessings upon Muhammad', target: 100 },
]

export default function DhikrPage() {
  const [sel, setSel] = useState(0)
  const p = PHRASES[sel]
  const rec = useLiveQuery(() => db.dhikr.get(p.id), [p.id])
  const count = rec?.count ?? 0
  const total = rec?.total ?? 0
  const pct = Math.min(1, count / p.target)
  const R = 120, C = 2 * Math.PI * R

  async function tap() {
    const next = count + 1
    if (next === p.target) navigator.vibrate?.([60, 40, 60])
    else navigator.vibrate?.(8)
    await db.dhikr.put({ id: p.id, count: next, total: total + 1 })
  }

  return (
    <div className="fade-in space-y-6">
      <h1 className="h-page">Dhikr</h1>
      <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4">
        {PHRASES.map((x, i) => (
          <button key={x.id} onClick={() => setSel(i)} className={`shrink-0 rounded-full px-4 py-2 text-sm transition ${i === sel ? 'bg-brand font-semibold text-brand-ink' : 'bg-surface-2 text-muted'}`}>{x.tr}</button>
        ))}
      </div>

      <div className="text-center">
        <p className="quran text-4xl text-gold">{p.ar}</p>
        <p className="mt-1 text-sm text-muted">{p.en}</p>
      </div>

      <button onClick={tap} className="relative mx-auto grid aspect-square w-72 select-none place-items-center rounded-full transition active:scale-[.96]" aria-label="Count">
        <svg className="absolute inset-0 -rotate-90" viewBox="0 0 260 260">
          <circle cx="130" cy="130" r={R} fill="none" stroke="var(--surface-2)" strokeWidth="12" />
          <circle cx="130" cy="130" r={R} fill="none" stroke={pct >= 1 ? 'var(--gold)' : 'var(--brand)'} strokeWidth="12" strokeLinecap="round"
            strokeDasharray={C} strokeDashoffset={C * (1 - pct)} style={{ transition: 'stroke-dashoffset .25s ease' }} />
        </svg>
        <div className="pattern grid size-56 place-items-center rounded-full bg-[#0b2a24] text-white shadow-2xl">
          <div>
            <p className="text-6xl font-bold tabular-nums">{count}</p>
            <p className="text-sm text-white/60">of {p.target}{pct >= 1 && ' ✓'}</p>
          </div>
        </div>
      </button>

      <div className="flex items-center justify-center gap-6 text-sm text-muted">
        <span>Lifetime: <b className="text-ink tabular-nums">{total}</b></span>
        <button className="btn-ghost" onClick={() => db.dhikr.put({ id: p.id, count: 0, total })}><RotateCcw size={15} />Reset</button>
      </div>
    </div>
  )
}
