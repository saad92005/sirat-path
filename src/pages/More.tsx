import { Link } from 'react-router-dom'
import { SIDEBAR } from '../components/Layout'
import { useT } from '../lib/i18n'

const TINTS = ['#0f766e', '#7c3aed', '#db2777', '#d97706', '#2563eb', '#059669', '#ca8a04', '#4f46e5', '#16a34a', '#0891b2', '#e11d48', '#9333ea']

export default function More() {
  const t = useT()
  let n = 0
  return (
    <div className="space-y-6">
      <h1 className="h-page">{t('more')}</h1>
      {SIDEBAR.map((g) => (
        <section key={g.group}>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">{t(g.group)}</p>
          <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4 lg:grid-cols-6">
            {g.items.filter((i) => i.to !== '/').map(({ to, k, icon: Icon }) => {
              const tint = TINTS[n++ % TINTS.length]
              return (
                <Link key={to} to={to} className="card flex flex-col items-center gap-2 px-2 py-4 text-center text-xs font-medium transition hover:-translate-y-0.5 hover:border-brand active:scale-95">
                  <span className="grid size-11 place-items-center rounded-2xl" style={{ background: `${tint}1f`, color: tint }}><Icon size={21} /></span>{t(k)}
                </Link>
              )
            })}
          </div>
        </section>
      ))}
    </div>
  )
}
