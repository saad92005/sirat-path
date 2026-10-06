import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { Check, Plus, Trash2 } from 'lucide-react'
import { db, today } from '../lib/db'
import { tap } from '../lib/feedback'
import { PageHeader, Ring, Sheet } from '../components/ui'

const EMOJIS = ['📖', '🤲', '🌅', '📿', '🤝', '🌙', '💧', '🎓', '❤️', '🕌', '✍️', '🍽️']

export default function Habits() {
  const day = today()
  const habits = useLiveQuery(() => db.habits.filter((h) => !h.archived).toArray()) ?? []
  const week = Array.from({ length: 7 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() - (6 - i)); return d.toLocaleDateString('en-CA') })
  const logs = useLiveQuery(() => db.habitLog.where('day').anyOf(week).toArray()) ?? []
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState({ name: '', emoji: '📖', target: 1 })

  const countFor = (id: number, d: string) => logs.find((l) => l.habitId === id && l.day === d)?.count ?? 0
  const doneToday = habits.filter((h) => countFor(h.id!, day) >= h.target).length

  async function inc(id: number, target: number) {
    const c = countFor(id, day)
    const next = c >= target ? 0 : c + 1
    tap(next >= target)
    await db.habitLog.put({ id: `${id}-${day}`, habitId: id, day, count: next })
  }

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Habits" subtitle="Small, consistent deeds — gently tracked" action={<button className="btn" onClick={() => setAdding(true)}><Plus size={16} />Add</button>} />
      <div className="card mb-5 flex items-center gap-4 p-5">
        <Ring pct={habits.length ? doneToday / habits.length : 0} size={70}><span className="text-sm font-bold">{doneToday}/{habits.length}</span></Ring>
        <div><p className="font-semibold">Today</p><p className="text-sm text-muted">“The most beloved deeds to Allah are the most consistent, even if small.”</p><p className="text-xs text-gold">Sahih al-Bukhari 6464</p></div>
      </div>
      <div className="space-y-3">
        {habits.map((h) => {
          const c = countFor(h.id!, day)
          const done = c >= h.target
          return (
            <div key={h.id} className={`card flex items-center gap-3 p-4 transition ${done ? 'border-brand/40 bg-brand/5' : ''}`}>
              <span className="text-2xl">{h.emoji}</span>
              <div className="min-w-0 flex-1">
                <p className="font-medium">{h.name}</p>
                <div className="mt-1.5 flex gap-1">
                  {week.map((d) => <span key={d} title={d} className={`h-1.5 flex-1 rounded-full ${countFor(h.id!, d) >= h.target ? 'bg-brand' : countFor(h.id!, d) > 0 ? 'bg-brand/40' : 'bg-surface-2'}`} />)}
                </div>
              </div>
              {h.target > 1 && <span className="text-xs tabular-nums text-muted">{c}/{h.target}</span>}
              <button onClick={() => inc(h.id!, h.target)} aria-label={`Mark ${h.name}`}
                className={`grid size-11 place-items-center rounded-full border-2 transition active:scale-90 ${done ? 'border-brand bg-brand text-brand-ink' : 'border-line text-muted hover:border-brand'}`}>
                {done ? <Check size={20} /> : <Plus size={18} />}
              </button>
              <button className="icon-btn size-9" aria-label="Remove habit" onClick={() => confirm(`Remove “${h.name}”?`) && db.habits.update(h.id!, { archived: true })}><Trash2 size={15} /></button>
            </div>
          )
        })}
      </div>

      <Sheet open={adding} onClose={() => setAdding(false)} title="New habit">
        <div className="space-y-3">
          <input className="input" placeholder="e.g. Pray Duha, Read 1 page, Call parents" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <div className="flex flex-wrap gap-2">{EMOJIS.map((e) => <button key={e} onClick={() => setForm({ ...form, emoji: e })} className={`grid size-11 place-items-center rounded-xl text-xl ${form.emoji === e ? 'bg-brand/15 ring-2 ring-brand' : 'bg-surface-2'}`}>{e}</button>)}</div>
          <label className="block text-sm text-muted">Times per day<input type="number" min={1} max={20} className="input mt-1" value={form.target} onChange={(e) => setForm({ ...form, target: Math.max(1, +e.target.value || 1) })} /></label>
          <button className="btn w-full" disabled={!form.name.trim()} onClick={async () => { await db.habits.add({ ...form, name: form.name.trim(), createdAt: Date.now() }); setForm({ name: '', emoji: '📖', target: 1 }); setAdding(false) }}>Add habit</button>
        </div>
      </Sheet>
    </div>
  )
}
