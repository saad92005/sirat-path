export default function Loading({ error }: { error?: string | null }) {
  if (error) return <p className="py-20 text-center text-sm text-muted">Couldn't load Quran data ({error}). Check your connection and reload.</p>
  return (
    <div className="space-y-3 py-4">
      {Array.from({ length: 6 }, (_, i) => <div key={i} className="h-20 animate-pulse rounded-2xl bg-surface-2" />)}
    </div>
  )
}
