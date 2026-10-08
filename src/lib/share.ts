// Text sharing — every share carries a link back to the app, so shares double as invites.

export const SITE = 'https://siratpath.vercel.app'

export function shareMessage(body: string, ref: string, path = '/') {
  return `${body.trim()}\n— ${ref}\n\nRead more on Sirat Path (free, no ads): ${SITE}${path}`
}

/** Opens WhatsApp (app on phones, web on desktop) with the message pre-filled. */
export function shareWhatsApp(body: string, ref: string, path = '/') {
  window.open(`https://wa.me/?text=${encodeURIComponent(shareMessage(body, ref, path))}`, '_blank', 'noopener')
}

/** Shares the app itself — native share sheet when available, else WhatsApp. */
export async function shareApp() {
  const text = 'Sirat Path — a free, ad-free Islamic companion: Quran, prayer times, adhan, Qibla, duas, hadith and more. Works offline.'
  if (navigator.share) { try { await navigator.share({ title: 'Sirat Path', text, url: SITE }); return } catch { return } }
  window.open(`https://wa.me/?text=${encodeURIComponent(`${text}\n${SITE}`)}`, '_blank', 'noopener')
}
