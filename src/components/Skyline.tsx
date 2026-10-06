// Original SVG illustration: mosque silhouette with domes, minarets and a crescent.
export default function Skyline({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 400 140" preserveAspectRatio="xMidYMax slice" aria-hidden>
      <defs>
        <linearGradient id="sk" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="currentColor" stopOpacity=".55" />
          <stop offset="1" stopColor="currentColor" stopOpacity=".95" />
        </linearGradient>
      </defs>
      <g fill="currentColor" opacity=".35">
        <path d="M0 140V110h30v-8h12v8h22V96c0-10 10-18 20-18s20 8 20 18v14h18v30z" />
        <path d="M300 140v-28h18V92c0-12 12-22 24-22s24 10 24 22v20h34v28z" />
      </g>
      <g fill="url(#sk)">
        {/* left minaret */}
        <path d="M112 140V58l4-8 4 8v82z" />
        <rect x="109" y="74" width="14" height="4" rx="1" />
        <path d="M116 44l-3 6h6z" />
        {/* right minaret */}
        <path d="M280 140V58l4-8 4 8v82z" />
        <rect x="277" y="74" width="14" height="4" rx="1" />
        <path d="M284 44l-3 6h6z" />
        {/* main dome & hall */}
        <path d="M150 140v-40h100v40z" />
        <path d="M156 100c0-30 20-48 44-58 24 10 44 28 44 58z" />
        <rect x="198" y="30" width="4" height="12" />
        {/* side domes */}
        <path d="M128 140v-22h22v22z" /><path d="M128 118c0-9 5-14 11-17 6 3 11 8 11 17z" />
        <path d="M250 140v-22h22v22z" /><path d="M250 118c0-9 5-14 11-17 6 3 11 8 11 17z" />
      </g>
      {/* arches */}
      <g fill="var(--hero-a)" opacity=".55">
        <path d="M186 140v-18a14 14 0 0 1 28 0v18z" />
        <path d="M162 140v-14a8 8 0 0 1 16 0v14z" /><path d="M222 140v-14a8 8 0 0 1 16 0v14z" />
      </g>
      {/* crescent */}
      <path d="M200 20a7 7 0 1 0 5 12 6 6 0 1 1-5-12z" fill="var(--accent)" />
    </svg>
  )
}
