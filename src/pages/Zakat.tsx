import { useState } from 'react'
import { Info } from 'lucide-react'
import { PageHeader } from '../components/ui'

// Estimates only. Nisab thresholds: 85 g gold / 595 g silver (commonly cited contemporary values).
// The user supplies current metal prices — no price API is used.

const KEY = 'sirat-zakat'
type Form = Record<string, number> & { goldPrice: number; silverPrice: number }
const DEFAULT: Form = { goldPrice: 0, silverPrice: 0, cash: 0, bank: 0, goldGrams: 0, silverGrams: 0, investments: 0, business: 0, receivable: 0, debts: 0 }

const ASSETS = [
  { k: 'cash', label: 'Cash in hand' },
  { k: 'bank', label: 'Bank balances' },
  { k: 'investments', label: 'Shares & investments (zakatable value)' },
  { k: 'business', label: 'Business stock / trade goods' },
  { k: 'receivable', label: 'Money owed to you (likely to be repaid)' },
]

function Field({ k, label, suffix, f, set }: { k: string; label: string; suffix?: string; f: Form; set: (k: string, v: string) => void }) {
  return (
    <label className="block text-sm">
      <span className="text-muted">{label}</span>
      <div className="relative mt-1">
        <input type="number" inputMode="decimal" min={0} className="input pe-14" value={f[k] || ''} placeholder="0" onChange={(e) => set(k, e.target.value)} />
        {suffix && <span className="absolute end-3 top-1/2 -translate-y-1/2 text-xs text-muted">{suffix}</span>}
      </div>
    </label>
  )
}

export default function Zakat() {
  const [f, setF] = useState<Form>(() => { try { return { ...DEFAULT, ...JSON.parse(localStorage.getItem(KEY) ?? '{}') } } catch { return DEFAULT } })
  const [basis, setBasis] = useState<'silver' | 'gold'>('silver')
  const set = (k: string, v: string) => {
    const next = { ...f, [k]: Math.max(0, Number(v) || 0) }
    setF(next); try { localStorage.setItem(KEY, JSON.stringify(next)) } catch { /* ignore */ }
  }
  const goldValue = f.goldGrams * f.goldPrice
  const silverValue = f.silverGrams * f.silverPrice
  const total = f.cash + f.bank + f.investments + f.business + f.receivable + goldValue + silverValue
  const net = Math.max(0, total - f.debts)
  const nisab = basis === 'silver' ? 595 * f.silverPrice : 85 * f.goldPrice
  const hasPrice = basis === 'silver' ? f.silverPrice > 0 : f.goldPrice > 0
  const due = hasPrice && net >= nisab ? net * 0.025 : 0
  const fmt = (n: number) => n.toLocaleString(undefined, { maximumFractionDigits: 2 })

  return (
    <div>
      <PageHeader title="Zakat Calculator" subtitle="An estimate — every number stays on your device" />
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.3fr_1fr]">
        <div className="space-y-5">
          <section className="card space-y-3 p-5">
            <p className="font-semibold">1 · Today’s metal prices <span className="text-xs font-normal text-muted">(per gram, your currency)</span></p>
            <div className="grid grid-cols-2 gap-3"><Field f={f} set={set} k="goldPrice" label="Gold price / g" /><Field f={f} set={set} k="silverPrice" label="Silver price / g" /></div>
            <p className="text-xs text-muted">Enter current local prices from a trusted source. No price service is used.</p>
          </section>
          <section className="card space-y-3 p-5">
            <p className="font-semibold">2 · Your assets</p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {ASSETS.map((a) => <Field f={f} set={set} key={a.k} k={a.k} label={a.label} />)}
              <Field f={f} set={set} k="goldGrams" label="Gold owned" suffix="g" />
              <Field f={f} set={set} k="silverGrams" label="Silver owned" suffix="g" />
            </div>
          </section>
          <section className="card space-y-3 p-5">
            <p className="font-semibold">3 · Deductible liabilities</p>
            <Field f={f} set={set} k="debts" label="Debts due now (e.g. this month’s payments)" />
          </section>
        </div>

        <div className="space-y-4 lg:sticky lg:top-8 lg:self-start">
          <section className="hero pattern rounded-3xl p-6">
            <p className="text-sm text-white/70">Estimated zakat due</p>
            <p className="mt-1 text-4xl font-bold tabular-nums">{fmt(due)}</p>
            <div className="mt-4 space-y-1.5 text-sm">
              <p className="flex justify-between"><span className="text-white/70">Total zakatable assets</span><span className="tabular-nums">{fmt(total)}</span></p>
              <p className="flex justify-between"><span className="text-white/70">Less liabilities</span><span className="tabular-nums">−{fmt(f.debts)}</span></p>
              <p className="flex justify-between font-semibold"><span>Net wealth</span><span className="tabular-nums">{fmt(net)}</span></p>
              <p className="flex justify-between"><span className="text-white/70">Nisab ({basis})</span><span className="tabular-nums">{hasPrice ? fmt(nisab) : 'enter price'}</span></p>
            </div>
            <p className="mt-4 rounded-xl bg-white/12 p-3 text-sm">{!hasPrice ? `Enter the ${basis} price to compare with nisab.` : net >= nisab ? 'Your wealth meets the nisab. Zakat is 2.5% if it has been held for a full lunar year.' : 'Your wealth is below the nisab, so zakat is not due on this estimate.'}</p>
          </section>
          <section className="card p-5">
            <p className="text-sm font-semibold">Nisab basis</p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <button className={basis === 'silver' ? 'btn' : 'btn-ghost'} onClick={() => setBasis('silver')}>Silver · 595 g</button>
              <button className={basis === 'gold' ? 'btn' : 'btn-ghost'} onClick={() => setBasis('gold')}>Gold · 85 g</button>
            </div>
            <p className="mt-3 flex gap-2 text-xs text-muted"><Info size={14} className="shrink-0" />Many contemporary scholars recommend the silver nisab as it benefits more of the poor; others use gold. Rules for investments, jewellery and debts differ between schools. This is an estimate — please consult a qualified scholar. Recipients: Quran 9:60.</p>
          </section>
        </div>
      </div>
    </div>
  )
}
