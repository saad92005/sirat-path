import { useState } from 'react'
import { Flag, Loader2 } from 'lucide-react'
import { cloudConfigured, reportContent, useCloud } from '../lib/cloud'
import { Sheet } from './ui'

const ISSUES = 'https://github.com/saad92005/sirat-path/issues/new'

/** Lets users flag a possible error in religious content (goes to admin review, or GitHub). */
export default function ReportButton({ item }: { item: string }) {
  const { user } = useCloud()
  const [open, setOpen] = useState(false)
  const [msg, setMsg] = useState('')
  const [src, setSrc] = useState('')
  const [state, setState] = useState<'idle' | 'busy' | 'sent' | string>('idle')
  const viaCloud = cloudConfigured && !!user
  const ghUrl = `${ISSUES}?title=${encodeURIComponent(`Content issue: ${item}`)}&labels=content&body=${encodeURIComponent(`**Item:** ${item}\n\n**Problem:**\n\n**Reliable source:**\n`)}`

  return (
    <>
      <button className="icon-btn size-9" aria-label="Report an issue" title="Report an issue" onClick={() => (viaCloud ? setOpen(true) : window.open(ghUrl, '_blank', 'noopener'))}><Flag size={15} /></button>
      <Sheet open={open} onClose={() => { setOpen(false); setState('idle') }} title="Report a content issue">
        {state === 'sent' ? <p className="rounded-xl bg-brand/10 p-4 text-brand">Thank you — a reviewer will check this. JazakAllahu khayran.</p> : (
          <form className="space-y-3" onSubmit={async (e) => {
            e.preventDefault(); setState('busy')
            try { await reportContent(item, msg, src); setState('sent') } catch (err) { setState((err as Error).message) }
          }}>
            <p className="chip">{item}</p>
            <textarea required minLength={5} maxLength={2000} className="input min-h-28" placeholder="What looks wrong?" value={msg} onChange={(e) => setMsg(e.target.value)} />
            <input maxLength={500} className="input" placeholder="Reliable source (optional)" value={src} onChange={(e) => setSrc(e.target.value)} />
            <button className="btn w-full" disabled={state === 'busy'}>{state === 'busy' && <Loader2 size={16} className="animate-spin" />}Send report</button>
            {state !== 'idle' && state !== 'busy' && <p className="text-sm text-red-500">{state}</p>}
          </form>
        )}
      </Sheet>
    </>
  )
}
