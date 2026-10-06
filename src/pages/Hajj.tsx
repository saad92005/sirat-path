import { useState } from 'react'
import { Check, MapPin } from 'lucide-react'
import { HAJJ, UMRAH } from '../content/hajj'
import { DUAS } from '../content/duas'
import DuaCard from '../components/DuaCard'
import { PageHeader, Tabs } from '../components/ui'

const KEY = 'sirat-hajj-checks'

export default function Hajj() {
  const [tab, setTab] = useState<'umrah' | 'hajj'>('umrah')
  const [open, setOpen] = useState(0)
  const [checks, setChecks] = useState<Record<string, boolean>>(() => { try { return JSON.parse(localStorage.getItem(KEY) ?? '{}') } catch { return {} } })
  const steps = tab === 'umrah' ? UMRAH : HAJJ
  const toggle = (k: string) => { const n = { ...checks, [k]: !checks[k] }; setChecks(n); try { localStorage.setItem(KEY, JSON.stringify(n)) } catch { /* ignore */ } }
  const done = steps.filter((_, i) => checks[`${tab}-${i}`]).length

  return (
    <div>
      <PageHeader title="Hajj & Umrah" subtitle="A step-by-step companion — works offline" />
      <Tabs value={tab} onChange={(v) => { setTab(v); setOpen(0) }} items={[{ id: 'umrah', label: '🕋 Umrah' }, { id: 'hajj', label: '⛰️ Hajj' }]} />
      <div className="mt-4 mb-5 flex items-center gap-3">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-2"><div className="h-full rounded-full bg-brand transition-all" style={{ width: `${(done / steps.length) * 100}%` }} /></div>
        <span className="text-xs tabular-nums text-muted">{done}/{steps.length} steps</span>
      </div>
      <ol className="relative space-y-3 ps-6 before:absolute before:inset-y-3 before:start-[11px] before:w-0.5 before:bg-line">
        {steps.map((st, i) => {
          const k = `${tab}-${i}`
          const dua = st.dua ? DUAS.find((d) => d.id === st.dua) : null
          return (
            <li key={k} className="relative">
              <button onClick={() => toggle(k)} aria-label="Mark step done"
                className={`absolute -start-6 top-4 grid size-6 place-items-center rounded-full border-2 transition ${checks[k] ? 'border-brand bg-brand text-brand-ink' : 'border-line bg-bg text-muted'}`}>
                {checks[k] ? <Check size={13} /> : <span className="text-[10px] font-bold">{i + 1}</span>}
              </button>
              <div className={`card ms-3 overflow-hidden transition ${open === i ? 'border-brand/50' : ''}`}>
                <button className="flex w-full items-center gap-3 p-4 text-start" onClick={() => setOpen(open === i ? -1 : i)}>
                  <div className="flex-1"><p className="font-semibold">{st.title}</p>{st.when && <p className="flex items-center gap-1 text-xs text-gold"><MapPin size={11} />{st.when}</p>}</div>
                  <span className={`text-muted transition ${open === i ? 'rotate-180' : ''}`}>▾</span>
                </button>
                {open === i && (
                  <div className="fade-in space-y-3 px-4 pb-4">
                    <p className="text-[15px] leading-relaxed">{st.body}</p>
                    {st.ref && <p className="text-xs font-medium text-gold">— {st.ref}</p>}
                    {st.checklist && (
                      <ul className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                        {st.checklist.map((c) => (
                          <li key={c}><label className="flex items-center gap-2 rounded-lg bg-surface-2 px-3 py-2 text-sm"><input type="checkbox" className="size-4 accent-[var(--brand)]" checked={!!checks[c]} onChange={() => toggle(c)} />{c}</label></li>
                        ))}
                      </ul>
                    )}
                    {dua && <DuaCard d={dua} />}
                  </div>
                )}
              </div>
            </li>
          )
        })}
      </ol>
      <p className="mt-6 text-xs text-muted">A general outline. Rites differ by type of Hajj (Tamattuʿ, Qiran, Ifrad) and by school; travel with a qualified guide and follow the scholars you trust.</p>
    </div>
  )
}
