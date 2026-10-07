import { useId } from 'react'

/** Sirat Path mark: a road leading through a mihrab arch toward the crescent. */
export default function Logo({ size = 28 }: { size?: number }) {
  const id = useId()
  return (
    <svg width={size} height={size} viewBox="0 0 512 512" aria-hidden>
      <defs>
        <linearGradient id={`${id}g`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#1b7a63" /><stop offset="1" stopColor="#0a3b2f" /></linearGradient>
        <linearGradient id={`${id}r`} x1="0" y1="1" x2="0" y2="0"><stop offset="0" stopColor="#fff" /><stop offset="1" stopColor="#fff" stopOpacity=".55" /></linearGradient>
        <linearGradient id={`${id}a`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#f6dc8c" /><stop offset="1" stopColor="#c99a3b" /></linearGradient>
      </defs>
      <rect width="512" height="512" rx="116" fill={`url(#${id}g)`} />
      <path d="M136 430V236c0-66 54-120 120-150 66 30 120 84 120 150v194" fill="none" stroke={`url(#${id}a)`} strokeWidth="22" strokeLinecap="round" />
      <path d="M176 430c40-70 62-130 74-206h12c12 76 34 136 74 206z" fill={`url(#${id}r)`} />
      <path d="M256 412v-26M256 360v-22M256 314v-18M256 276v-14" stroke="#0f5c4d" strokeWidth="7" strokeLinecap="round" />
      <path d="M272 150a34 34 0 1 1-30-46 27 27 0 1 0 30 46z" fill={`url(#${id}a)`} />
    </svg>
  )
}
