import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Play, Star } from 'lucide-react'
import { ARABIC_LETTERS, LETTER_NAMES } from '../content/learn'
import { DUAS } from '../content/duas'
import { useQuran } from '../lib/quran'
import { play } from '../lib/audio'
import { tap } from '../lib/feedback'
import Learn from './Learn'

const SHORT_SURAHS = [1, 112, 113, 114, 108, 103, 110, 111, 109, 107, 106, 105]
const KID_DUAS = ['food-before', 'food-after', 'sleep-name', 'wake', 'leave-home', 'toilet']

export default function Kids() {
  const { data } = useQuran()
  const [tab, setTab] = useState<'surahs' | 'letters' | 'duas' | 'learn' | 'quiz'>('surahs')
  const [stars, setStars] = useState(() => Number(localStorage.getItem('noor-kids-stars') ?? 0))
  const addStar = () => { const n = stars + 1; setStars(n); try { localStorage.setItem('noor-kids-stars', String(n)) } catch { /* ignore */ } tap(true) }

  const tabs = [
    { id: 'surahs', label: '📖 Surahs', bg: '#22c55e' },
    { id: 'letters', label: '🔤 Letters', bg: '#3b82f6' },
    { id: 'duas', label: '🤲 Duas', bg: '#f59e0b' },
    { id: 'learn', label: '🌟 Manners', bg: '#ec4899' },
    { id: 'quiz', label: '🎯 Quiz', bg: '#8b5cf6' },
  ] as const

  return (
    <div className="space-y-5">
      <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-amber-300 via-orange-300 to-pink-300 p-6 text-[#3b2400]">
        <div className="absolute -end-6 -top-6 text-8xl opacity-30">🌙</div>
        <p className="text-sm font-semibold">Noor Kids</p>
        <h1 className="text-3xl font-extrabold">Let’s learn together! ✨</h1>
        <p className="mt-2 flex items-center gap-1 font-bold"><Star className="fill-current" size={18} />{stars} stars earned</p>
      </section>
      <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 md:mx-0 md:px-0">
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`shrink-0 rounded-2xl px-4 py-2.5 text-sm font-bold text-white transition active:scale-95 ${tab === t.id ? 'scale-105 shadow-lg' : 'opacity-70'}`} style={{ background: t.bg }}>{t.label}</button>
        ))}
      </div>

      {tab === 'surahs' && data && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {SHORT_SURAHS.map((n, i) => {
            const s = data.surahs[n - 1]
            const colors = ['#22c55e', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6', '#14b8a6']
            return (
              <div key={n} className="overflow-hidden rounded-3xl text-white shadow-md" style={{ background: colors[i % colors.length] }}>
                <Link to={`/quran/${n}`} className="block p-4"><p className="quran text-3xl">{s.name}</p><p className="mt-1 font-bold">{s.tname}</p><p className="text-xs opacity-80">{s.ayas} ayahs</p></Link>
                <button onClick={() => { play(n, 1); addStar() }} className="flex w-full items-center justify-center gap-1.5 bg-black/15 py-2 text-sm font-bold"><Play size={14} />Listen</button>
              </div>
            )
          })}
        </div>
      )}

      {tab === 'letters' && (
        <div className="grid grid-cols-4 gap-3 sm:grid-cols-7" dir="rtl">
          {ARABIC_LETTERS.map((l, i) => (
            <button key={i} onClick={addStar} className="flex aspect-square flex-col items-center justify-center rounded-3xl bg-surface shadow-sm ring-1 ring-line transition hover:-translate-y-1 active:scale-90">
              <span className="quran text-4xl text-brand" style={{ lineHeight: 1.4 }}>{l}</span>
              <span className="text-[11px] font-semibold text-muted" dir="ltr">{LETTER_NAMES[i]}</span>
            </button>
          ))}
        </div>
      )}

      {tab === 'duas' && (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {DUAS.filter((d) => KID_DUAS.includes(d.id)).map((d, i) => (
            <div key={d.id} className="rounded-3xl p-5 text-white shadow-md" style={{ background: ['#f59e0b', '#22c55e', '#3b82f6', '#ec4899', '#8b5cf6', '#14b8a6'][i] }}>
              <p className="text-lg font-bold">{d.title}</p>
              <p className="quran mt-2 text-right text-2xl">{d.ar}</p>
              <p className="mt-2 text-sm opacity-90">{d.en}</p>
              <p className="mt-2 text-xs opacity-75">{d.ref}</p>
            </div>
          ))}
        </div>
      )}

      {tab === 'learn' && <Learn kids />}
      {tab === 'quiz' && <LetterQuiz onRight={addStar} />}
    </div>
  )
}

function LetterQuiz({ onRight }: { onRight: () => void }) {
  const pick = () => Math.floor(Math.random() * ARABIC_LETTERS.length)
  const [target, setTarget] = useState(pick)
  const [opts, setOpts] = useState(() => shuffle(target))
  const [result, setResult] = useState<null | boolean>(null)
  function shuffle(t: number) { const s = new Set([t]); while (s.size < 4) s.add(pick()); return [...s].sort(() => Math.random() - 0.5) }
  function choose(i: number) {
    const ok = i === target
    setResult(ok); if (ok) onRight()
    setTimeout(() => { const t = pick(); setTarget(t); setOpts(shuffle(t)); setResult(null) }, 900)
  }
  return (
    <div className="mx-auto max-w-md text-center">
      <p className="text-lg font-bold">Which letter is <span className="text-brand">{LETTER_NAMES[target]}</span>?</p>
      <div className="mt-5 grid grid-cols-2 gap-3">
        {opts.map((i) => (
          <button key={i} onClick={() => choose(i)} className={`quran rounded-3xl py-6 text-5xl shadow-sm ring-1 ring-line transition active:scale-90 ${result !== null && i === target ? 'bg-green-400 text-white' : 'bg-surface'}`}>{ARABIC_LETTERS[i]}</button>
        ))}
      </div>
      {result !== null && <p className="mt-4 text-2xl font-bold">{result ? '⭐ Great job!' : '💪 Try again!'}</p>}
    </div>
  )
}
