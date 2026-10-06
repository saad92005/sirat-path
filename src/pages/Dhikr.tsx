import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { Plus, RotateCcw, Volume2, VolumeX } from 'lucide-react'
import { db } from '../lib/db'
import { tap } from '../lib/feedback'
import { setSettings, useSettings } from '../lib/settings'
import { PageHeader, Sheet, Tabs } from '../components/ui'

type Phrase = { id: string; ar: string; tr: string; en: string; target: number }

const PRESETS: Phrase[] = [
  { id: 'subhanallah', ar: 'سُبْحَانَ ٱللَّٰهِ', tr: 'SubhanAllah', en: 'Glory be to Allah', target: 33 },
  { id: 'alhamdulillah', ar: 'ٱلْحَمْدُ لِلَّٰهِ', tr: 'Alhamdulillah', en: 'All praise is for Allah', target: 33 },
  { id: 'allahuakbar', ar: 'ٱللَّٰهُ أَكْبَرُ', tr: 'Allahu Akbar', en: 'Allah is the Greatest', target: 34 },
  { id: 'tahlil', ar: 'لَا إِلَٰهَ إِلَّا ٱللَّٰهُ', tr: 'La ilaha illallah', en: 'There is no god but Allah', target: 100 },
  { id: 'istighfar', ar: 'أَسْتَغْفِرُ ٱللَّٰهَ', tr: 'Astaghfirullah', en: 'I seek Allah’s forgiveness', target: 100 },
  { id: 'subhanallahwabihamdihi', ar: 'سُبْحَانَ ٱللَّٰهِ وَبِحَمْدِهِ', tr: 'SubhanAllahi wa bihamdihi', en: 'Glory and praise be to Allah', target: 100 },
  { id: 'hawqala', ar: 'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِٱللَّٰهِ', tr: 'La hawla wa la quwwata illa billah', en: 'No power nor strength except by Allah', target: 100 },
  { id: 'salawat', ar: 'ٱللَّٰهُمَّ صَلِّ عَلَىٰ مُحَمَّدٍ', tr: 'Allahumma salli ʿala Muhammad', en: 'O Allah, send blessings upon Muhammad', target: 100 },
]

const CUSTOM_KEY = 'noor-custom-dhikr'
const loadCustom = (): Phrase[] => { try { return JSON.parse(localStorage.getItem(CUSTOM_KEY) ?? '[]') } catch { return [] } }

export default function DhikrPage() {
  const { sound } = useSettings()
  const [custom, setCustom] = useState<Phrase[]>(loadCustom)
  const all = [...PRESETS, ...custom]
  const [sel, setSel] = useState(all[0].id)
  const [adding, setAdding] = useState(false)
  const p = all.find((x) => x.id === sel) ?? all[0]
  const rec = useLiveQuery(() => db.dhikr.get(p.id), [p.id])
  const allRecs = useLiveQuery(() => db.dhikr.toArray()) ?? []
  const count = rec?.count ?? 0
  const total = rec?.total ?? 0
  const rounds = Math.floor(count / p.target)
  const inRound = count % p.target
  const pct = count > 0 && inRound === 0 ? 1 : inRound / p.target
  const R = 120, C = 2 * Math.PI * R

  async function inc() {
    const next = count + 1
    tap(next % p.target === 0)
    await db.dhikr.put({ id: p.id, count: next, total: total + 1 })
  }

  function addCustom(f: FormData) {
    const ph: Phrase = { id: `custom-${Date.now()}`, ar: String(f.get('ar') || ''), tr: String(f.get('tr')), en: String(f.get('en') || ''), target: Number(f.get('target')) || 33 }
    const next = [...custom, ph]
    setCustom(next); try { localStorage.setItem(CUSTOM_KEY, JSON.stringify(next)) } catch { /* ignore */ }
    setSel(ph.id); setAdding(false)
  }

  return (
    <div>
      <PageHeader title="Tasbih" subtitle="Tap anywhere on the circle to count"
        action={<button className="icon-btn" onClick={() => setSettings({ sound: !sound })} aria-label="Toggle sound">{sound ? <Volume2 size={18} /> : <VolumeX size={18} />}</button>} />
      <div className="flex items-center gap-2">
        <div className="min-w-0 flex-1"><Tabs value={sel} onChange={setSel} items={all.map((x) => ({ id: x.id, label: x.tr }))} /></div>
        <button className="icon-btn shrink-0" onClick={() => setAdding(true)} aria-label="Add custom dhikr"><Plus size={18} /></button>
      </div>

      <div className="mt-8 grid items-center gap-8 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <div className="text-center">
            <p className="quran text-4xl text-gold md:text-5xl">{p.ar || p.tr}</p>
            <p className="mt-1 text-sm text-muted">{p.en}</p>
          </div>
          <button onClick={inc} className="relative mx-auto grid aspect-square w-72 select-none place-items-center rounded-full transition active:scale-[.96] md:w-80" aria-label={`Count ${p.tr}`}>
            <svg className="absolute inset-0 -rotate-90" viewBox="0 0 260 260">
              <circle cx="130" cy="130" r={R} fill="none" stroke="var(--surface-2)" strokeWidth="12" />
              <circle cx="130" cy="130" r={R} fill="none" stroke={pct >= 1 ? 'var(--gold)' : 'var(--brand)'} strokeWidth="12" strokeLinecap="round"
                strokeDasharray={C} strokeDashoffset={C * (1 - pct)} style={{ transition: 'stroke-dashoffset .25s ease' }} />
            </svg>
            <div className="hero pattern grid size-[78%] place-items-center rounded-full shadow-2xl">
              <div>
                <p className="text-6xl font-bold tabular-nums">{count > 0 && inRound === 0 ? p.target : inRound}</p>
                <p className="text-sm text-white/70">of {p.target}{rounds > 0 && ` · round ${rounds}`}</p>
              </div>
            </div>
          </button>
          <div className="flex items-center justify-center gap-4 text-sm text-muted">
            <span>Lifetime <b className="tabular-nums text-ink">{total.toLocaleString()}</b></span>
            <button className="btn-ghost" onClick={() => db.dhikr.put({ id: p.id, count: 0, total })}><RotateCcw size={15} />Reset</button>
          </div>
        </div>
        <section className="card p-5">
          <p className="font-semibold">History</p>
          <div className="mt-3 space-y-2">
            {all.map((x) => {
              const r = allRecs.find((a) => a.id === x.id)
              return (
                <button key={x.id} onClick={() => setSel(x.id)} className="flex w-full items-center gap-3 rounded-xl px-2 py-1.5 text-start text-sm hover:bg-surface-2">
                  <span className="flex-1 truncate">{x.tr}</span><span className="tabular-nums text-muted">{(r?.total ?? 0).toLocaleString()}</span>
                </button>
              )
            })}
          </div>
        </section>
      </div>

      <Sheet open={adding} onClose={() => setAdding(false)} title="Custom dhikr">
        <form action={addCustom} className="space-y-3">
          <input name="tr" required className="input" placeholder="Name / transliteration (required)" />
          <input name="ar" dir="rtl" className="input quran text-xl" placeholder="Arabic (optional)" />
          <input name="en" className="input" placeholder="Meaning (optional)" />
          <input name="target" type="number" min={1} defaultValue={33} className="input" />
          <button className="btn w-full">Add</button>
        </form>
      </Sheet>
    </div>
  )
}
