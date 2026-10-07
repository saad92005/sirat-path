import React, { useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

/** Circular progress ring. */
export function Ring({ pct, size = 56, stroke = 6, color = 'var(--brand)', children }: { pct: number; size?: number; stroke?: number; color?: string; children?: ReactNode }) {
  const r = (size - stroke) / 2, c = 2 * Math.PI * r
  return (
    <div className="relative grid shrink-0 place-items-center" style={{ width: size, height: size }}>
      <svg className="absolute inset-0 -rotate-90" width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--surface-2)" strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c * (1 - Math.min(1, pct))} style={{ transition: 'stroke-dashoffset .5s ease' }} />
      </svg>
      {children}
    </div>
  )
}

/** Mobile bottom sheet / desktop dialog. */
export function Sheet({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  useEffect(() => {
    if (!open) return
    const k = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', k); document.body.style.overflow = 'hidden'
    return () => { window.removeEventListener('keydown', k); document.body.style.overflow = '' }
  }, [open, onClose])
  if (!open) return null
  return (
    createPortal(<div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm md:items-center" onClick={onClose} role="dialog" aria-modal aria-label={title}>
      <div className="sheet-in max-h-[88dvh] w-full overflow-y-auto rounded-t-3xl border border-line bg-surface p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] md:max-w-lg md:rounded-3xl" onClick={(e) => e.stopPropagation()}>
        <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-line md:hidden" />
        <div className="mb-4 flex items-center"><h2 className="flex-1 text-lg font-semibold">{title}</h2><button className="icon-btn" onClick={onClose} aria-label="Close"><X size={18} /></button></div>
        {children}
      </div>
    </div>, document.body)
  )
}

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="mb-5 flex items-end gap-3">
      <div className="min-w-0 flex-1"><h1 className="h-page">{title}</h1>{subtitle && <p className="mt-0.5 text-sm text-muted">{subtitle}</p>}</div>
      {action}
    </div>
  )
}

export function Empty({ icon, title, hint, action }: { icon: string; title: string; hint?: string; action?: ReactNode }) {
  return (
    <div className="card flex flex-col items-center px-6 py-12 text-center">
      <span className="text-4xl">{icon}</span>
      <p className="mt-3 font-semibold">{title}</p>
      {hint && <p className="mt-1 max-w-sm text-sm text-muted">{hint}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

export function Tabs<T extends string>({ value, onChange, items }: { value: T; onChange: (v: T) => void; items: { id: T; label: ReactNode }[] }) {
  return (
    <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 md:mx-0 md:px-0" role="tablist">
      {items.map((i) => (
        <button key={i.id} role="tab" aria-selected={i.id === value} onClick={() => onChange(i.id)}
          className={`shrink-0 rounded-full px-4 py-2 text-sm transition active:scale-95 ${i.id === value ? 'bg-brand font-semibold text-brand-ink shadow-sm' : 'bg-surface-2 text-muted hover:text-ink'}`}>{i.label}</button>
      ))}
    </div>
  )
}

/** Jewel-tone gradient pairs for feature icons (light → deep). */
export const GEMS: [string, string][] = [
  ['#34d399', '#047857'], ['#a78bfa', '#6d28d9'], ['#f472b6', '#be185d'], ['#fbbf24', '#b45309'],
  ['#60a5fa', '#1d4ed8'], ['#2dd4bf', '#0f766e'], ['#facc15', '#a16207'], ['#818cf8', '#4338ca'],
  ['#4ade80', '#15803d'], ['#22d3ee', '#0e7490'], ['#fb7185', '#be123c'], ['#c084fc', '#7e22ce'],
  ['#fdba74', '#c2410c'], ['#5eead4', '#115e59'],
]

/** Glossy gradient squircle with a white icon and a faint 8-point star watermark. */
export function FeatureIcon({ icon: Icon, gem, size = 'md' }: { icon: React.ComponentType<{ size?: number; strokeWidth?: number }>; gem: [string, string]; size?: 'md' | 'lg' }) {
  return (
    <span className={`gem-icon ${size === 'lg' ? 'size-14' : 'size-12'}`} style={{ '--g1': gem[0], '--g2': gem[1] } as React.CSSProperties}>
      <Icon size={size === 'lg' ? 25 : 22} strokeWidth={2.1} />
    </span>
  )
}
