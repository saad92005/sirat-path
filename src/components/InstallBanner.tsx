import { useState } from 'react'
import { Download, Share, Share2, X } from 'lucide-react'
import { isStandalone, useInstall } from '../lib/install'
import { shareApp, shareAppWhatsApp } from '../lib/share'
import { WhatsAppIcon } from './WhatsAppButton'

const KEY = 'sp-install-dismissed'
const isIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)

function readDismissed() { try { return Number(localStorage.getItem(KEY) ?? 0) > Date.now() } catch { return false } }

/** Home-screen install nudge (Chrome/Android/Edge one-tap; iOS gets Share → Add to Home Screen steps) + share-the-app. */
export default function InstallBanner() {
  const install = useInstall()
  const [hidden, setHidden] = useState(readDismissed)
  const standalone = isStandalone()
  const ios = isIOS()
  const canInstall = !standalone && (install || ios)

  const dismiss = () => {
    try { localStorage.setItem(KEY, String(Date.now() + 14 * 864e5)) } catch { /* private mode */ }
    setHidden(true)
  }

  if (hidden && !standalone) return null
  return (
    <section className="card flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
      <div className="min-w-0 flex-1">
        {canInstall ? (
          <>
            <p className="font-semibold">Install Sirat Path on your {ios ? 'iPhone' : 'device'}</p>
            <p className="text-sm text-muted">
              {install ? 'Opens like a normal app, works offline and gives adhan reminders.' : <>Tap <Share size={13} className="inline -mt-0.5" /> <b>Share</b> in Safari, then <b>Add to Home Screen</b>.</>}
            </p>
          </>
        ) : (
          <>
            <p className="font-semibold">Know someone who'd benefit?</p>
            <p className="text-sm text-muted">Share Sirat Path — free, no ads. Every share is sadaqah jariyah, in sha Allah.</p>
          </>
        )}
      </div>
      <div className="flex shrink-0 flex-wrap items-center gap-2">
        {install && !standalone && <button className="btn" onClick={install}><Download size={16} />Install app</button>}
        <button className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-[#25D366] px-4 text-sm font-semibold text-white shadow-sm active:scale-95" onClick={shareAppWhatsApp}><WhatsAppIcon size={20} />WhatsApp</button>
        <button className="icon-btn size-10" aria-label="Share via other apps" title="Other apps" onClick={shareApp}><Share2 size={20} /></button>
        {!standalone && <button className="icon-btn" aria-label="Dismiss" onClick={dismiss}><X size={17} /></button>}
      </div>
    </section>
  )
}
