import { Link } from 'react-router-dom'
import { SIDEBAR } from '../components/Layout'
import { useT } from '../lib/i18n'
import { FeatureIcon, GEMS } from '../components/ui'


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
              const gem = GEMS[n++ % GEMS.length]
              return (
                <Link key={to} to={to} className="card feature-tile flex min-w-0 flex-col items-center gap-2.5 px-2 py-4 text-center text-xs font-medium">
                  <FeatureIcon icon={Icon} gem={gem} /><span className="w-full truncate">{t(k)}</span>
                </Link>
              )
            })}
          </div>
        </section>
      ))}
    </div>
  )
}
