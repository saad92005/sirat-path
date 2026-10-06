import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { Check, RotateCcw } from 'lucide-react'
import { AZKAR_SESSIONS, DUAS } from '../content/duas'
import { db, today } from '../lib/db'
import { useQuran } from '../lib/quran'
import { tap } from '../lib/feedback'
import DuaCard from '../components/DuaCard'
import Loading from '../components/Loading'
import { PageHeader, Ring } from '../components/ui'
import { useT } from '../lib/i18n'

function defaultSession() {
  const h = new Date().getHours()
  return h < 12 ? 'morning' : h < 20 ? 'evening' : 'sleep'
}

export default function Azkar() {
  const { data, error } = useQuran()
  const [session, setSession] = useState<string>(defaultSession)
  const day = today()
  const t = useT()
  const logs = useLiveQuery(() => db.azkar.where('day').equals(day).toArray(), [day]) ?? []
  if (!data) return <Loading error={error} />

  const items = DUAS.filter((d) => d.cat === session)
  const log = logs.find((l) => l.session === session)
  const doneMap = log?.done ?? {}
  const finished = items.filter((d) => (doneMap[d.id] ?? 0) >= (d.count ?? 1)).length
  const pct = items.length ? finished / items.length : 0

  async function count(id: string, target: number) {
    const done = { ...doneMap, [id]: Math.min(target, (doneMap[id] ?? 0) + 1) }
    const completed = items.every((d) => (done[d.id] ?? 0) >= (d.count ?? 1))
    tap(done[id] >= target)
    await db.azkar.put({ id: `${day}-${session}`, day, session, done, completed })
  }

  return (
    <div>
      <PageHeader title={t('azkar')} subtitle={t('azkarSubtitle')} />
      <div className="mb-5 grid grid-cols-2 gap-2.5 md:grid-cols-4">
        {AZKAR_SESSIONS.map((s) => {
          const l = logs.find((x) => x.session === s.id)
          return (
            <button key={s.id} onClick={() => setSession(s.id)}
              className={`rounded-2xl border p-3 text-start transition active:scale-[.98] ${session === s.id ? 'border-brand bg-brand/10' : 'border-line bg-surface hover:border-brand/50'}`}>
              <p className="flex items-center gap-1.5 text-sm font-semibold">{s.label}{l?.completed && <Check size={15} className="text-brand" />}</p>
              <p className="text-xs text-muted">{s.hint}</p>
            </button>
          )
        })}
      </div>

      <div className="card mb-5 flex items-center gap-4 p-4">
        <Ring pct={pct} size={58}><span className="text-xs font-bold">{finished}/{items.length}</span></Ring>
        <div className="flex-1">
          <p className="font-semibold">{pct >= 1 ? t('completedAccept') : `${items.length - finished} ${t('remaining')}`}</p>
          <p className="text-xs text-muted">Tap the button on each card to count. Progress is saved for today.</p>
        </div>
        {log && <button className="icon-btn" title="Reset" onClick={() => db.azkar.delete(`${day}-${session}`)}><RotateCcw size={17} /></button>}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {items.map((d) => <DuaCard key={d.id} d={d} counter count={doneMap[d.id] ?? 0} onCount={() => count(d.id, d.count ?? 1)} />)}
      </div>
    </div>
  )
}
