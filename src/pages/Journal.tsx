import { useMemo, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { Lock, Pencil, Plus, Search, Trash2 } from 'lucide-react'
import { db, today, type Journal as Entry } from '../lib/db'
import { Empty, PageHeader, Sheet } from '../components/ui'

const MOODS = ['🤍', '😊', '😌', '🤲', '😔', '😟']
const PROMPTS = [
  'What blessing did you notice today?',
  'Which ayah or reminder stayed with you today?',
  'What is one thing you want to improve tomorrow?',
  'Whom did you help, or who helped you, today?',
  'What are you making dua for right now?',
]

export default function Journal() {
  const entries = useLiveQuery(() => db.journal.orderBy('updatedAt').reverse().toArray()) ?? []
  const [editing, setEditing] = useState<Partial<Entry> | null>(null)
  const [q, setQ] = useState('')
  const prompt = PROMPTS[new Date().getDate() % PROMPTS.length]
  const shown = useMemo(() => entries.filter((e) => !q || `${e.text} ${e.gratitude}`.toLowerCase().includes(q.toLowerCase())), [entries, q])

  async function save() {
    if (!editing) return
    const e = { day: editing.day ?? today(), mood: editing.mood ?? '🤍', gratitude: editing.gratitude ?? '', text: editing.text ?? '', updatedAt: Date.now() }
    if (!e.text.trim() && !e.gratitude.trim()) { setEditing(null); return }
    if (editing.id) await db.journal.update(editing.id, e)
    else await db.journal.add(e)
    setEditing(null)
  }

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Reflection Journal" subtitle="Private — stored only on this device" action={<button className="btn" onClick={() => setEditing({})}><Plus size={16} />New</button>} />
      <button onClick={() => setEditing({ text: '' })} className="hero pattern mb-5 block w-full rounded-3xl p-5 text-start">
        <p className="text-xs uppercase tracking-widest text-accent">Today’s prompt</p>
        <p className="mt-1 text-lg font-semibold">{prompt}</p>
        <p className="mt-2 text-sm text-white/70">Tap to write →</p>
      </button>
      {entries.length > 0 && (
        <div className="relative mb-4"><Search className="absolute start-3.5 top-1/2 -translate-y-1/2 text-muted" size={18} /><input className="input ps-10" placeholder="Search your journal" value={q} onChange={(e) => setQ(e.target.value)} /></div>
      )}
      {entries.length === 0 ? <Empty icon="📔" title="Your journal is empty" hint="Write a short reflection or note what you’re grateful for. Nothing leaves your device." /> : (
        <div className="space-y-3">
          {shown.map((e) => (
            <article key={e.id} className="card p-5">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{e.mood}</span>
                <p className="flex-1 text-sm font-medium text-muted">{new Date(e.day).toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
                <button className="icon-btn size-9" aria-label="Edit" onClick={() => setEditing(e)}><Pencil size={16} /></button>
                <button className="icon-btn size-9" aria-label="Delete" onClick={() => confirm('Delete this entry?') && db.journal.delete(e.id!)}><Trash2 size={16} /></button>
              </div>
              {e.gratitude && <p className="mt-3 rounded-xl bg-gold/10 px-3 py-2 text-sm"><b className="text-gold">Grateful for:</b> {e.gratitude}</p>}
              {e.text && <p className="mt-3 whitespace-pre-wrap leading-relaxed">{e.text}</p>}
            </article>
          ))}
        </div>
      )}
      <p className="mt-6 flex items-center gap-1.5 text-xs text-muted"><Lock size={12} />Journal entries are never sent to any server or AI.</p>

      <Sheet open={!!editing} onClose={() => setEditing(null)} title={editing?.id ? 'Edit entry' : 'New reflection'}>
        {editing && (
          <div className="space-y-3">
            <input type="date" className="input" value={editing.day ?? today()} onChange={(e) => setEditing({ ...editing, day: e.target.value })} />
            <div className="flex gap-2">{MOODS.map((m) => <button key={m} onClick={() => setEditing({ ...editing, mood: m })} className={`grid size-11 place-items-center rounded-xl text-2xl transition ${((editing.mood ?? '🤍') === m) ? 'bg-brand/15 ring-2 ring-brand' : 'bg-surface-2'}`}>{m}</button>)}</div>
            <input className="input" placeholder="Today I’m grateful for…" value={editing.gratitude ?? ''} onChange={(e) => setEditing({ ...editing, gratitude: e.target.value })} />
            <textarea className="input min-h-40" placeholder={prompt} value={editing.text ?? ''} onChange={(e) => setEditing({ ...editing, text: e.target.value })} />
            <button className="btn w-full" onClick={save}>Save</button>
          </div>
        )}
      </Sheet>
    </div>
  )
}
