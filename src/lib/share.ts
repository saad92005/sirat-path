// Text sharing — every share carries a link back to the app, so shares double as invites.

export const SITE = 'https://siratpath.vercel.app'

export function shareMessage(body: string, ref: string, path = '/') {
  return `${body.trim()}\n— ${ref}\n\nRead more on Sirat Path (free, no ads): ${SITE}${path}`
}

const isMobile = () => /android|iphone|ipad|ipod/i.test(navigator.userAgent)

/**
 * Phones: hand off straight to the WhatsApp app via its URL scheme. Opening wa.me in a new tab
 * left an empty tab behind, which users saw as a white screen when they came back.
 * Desktop: WhatsApp Web in a new tab.
 */
export function openWhatsApp(text: string) {
  const q = encodeURIComponent(text)
  if (!isMobile()) { window.open(`https://web.whatsapp.com/send?text=${q}`, '_blank', 'noopener'); return }
  let left = false
  const onHide = () => { if (document.hidden) left = true }
  document.addEventListener('visibilitychange', onHide)
  location.href = `whatsapp://send?text=${q}`
  // WhatsApp not installed → the page never hid; fall back to the system share sheet / wa.me.
  setTimeout(() => {
    document.removeEventListener('visibilitychange', onHide)
    if (!left && !document.hidden) location.href = `https://wa.me/?text=${q}`
  }, 1800)
}

export function shareWhatsApp(body: string, ref: string, path = '/') {
  openWhatsApp(shareMessage(body, ref, path))
}

const APP_TEXT = 'Sirat Path — a free, ad-free Islamic companion: Quran, prayer times, adhan, Qibla, duas, hadith and more. Works offline.'

/** Shares the app itself via WhatsApp. */
export function shareAppWhatsApp() { openWhatsApp(`${APP_TEXT}\n${SITE}`) }

/** Native share sheet (any app) when available, else WhatsApp. */
export async function shareApp() {
  if (navigator.share) { try { await navigator.share({ title: 'Sirat Path', text: APP_TEXT, url: SITE }) } catch { /* cancelled */ } return }
  shareAppWhatsApp()
}
