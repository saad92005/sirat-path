// Detects horizontal overflow / off-screen elements on every route at phone, tablet and desktop widths.
import { chromium } from 'playwright'
const U = process.env.U || 'http://localhost:4173'
const routes = ['/','/quran','/quran/2','/search','/prayer','/qibla','/duas','/azkar','/dhikr','/khatm','/saved','/ask','/names','/calendar','/insights','/hadith','/hadith/bukhari','/hadith/bukhari/1','/learn','/learn/salah','/ramadan','/zakat','/hajj','/journal','/habits','/kids','/library','/account','/settings','/more','/about']
const widths = (process.env.W || '320,360,390,768,1024,1280').split(',').map(Number)
const shots = process.env.SHOTS
const b = await chromium.launch()
let bad = 0
for (const w of widths) {
  const ctx = await b.newContext({ viewport: { width: w, height: 800 }, hasTouch: w < 768 })
  await ctx.addInitScript(() => localStorage.setItem('sirat-settings', JSON.stringify({ onboarded: true, location: { lat: 30.16, lng: 71.52, label: 'Multan' } })))
  const p = await ctx.newPage()
  for (const r of routes) {
    await p.goto(U + r); await p.waitForTimeout(r.startsWith('/hadith') ? 2500 : 900)
    const res = await p.evaluate(() => {
      const vw = document.documentElement.clientWidth, out = []
      const docOver = document.documentElement.scrollWidth - vw
      for (const el of document.querySelectorAll('main *, header *, nav *')) {
        const rc = el.getBoundingClientRect()
        if (!rc.width || getComputedStyle(el).position === 'fixed') continue
        // skip things inside an intentional horizontal scroller
        let a = el.parentElement, scroll = false
        while (a) { const o = getComputedStyle(a).overflowX; if (o === 'auto' || o === 'scroll' || o === 'hidden') { scroll = true; break } a = a.parentElement }
        if (scroll) continue
        if (rc.right > vw + 1 || rc.left < -1) out.push(`${el.tagName.toLowerCase()}.${String(el.className).slice(0, 50)} [${Math.round(rc.left)}→${Math.round(rc.right)}] "${(el.textContent || '').trim().slice(0, 30)}"`)
        // text clipped inside its own box
        if (el.children.length === 0 && el.scrollWidth > el.clientWidth + 2 && getComputedStyle(el).overflow === 'visible' && el.clientWidth) out.push(`TEXT-OVERFLOW ${el.tagName.toLowerCase()} "${(el.textContent || '').trim().slice(0, 30)}"`)
      }
      return { docOver, out: [...new Set(out)].slice(0, 6) }
    }).catch(() => null)
    if (!res) continue
    if (res.docOver > 1 || res.out.length) { bad++; console.log(`✗ ${w}px ${r} pageOverflow=${res.docOver}\n   ` + res.out.join('\n   ')) }
    if (shots) await p.screenshot({ path: `${shots}/${w}${r.replace(/\//g, '_') || '_'}.png`, fullPage: true })
  }
  await ctx.close()
}
console.log(bad ? `${bad} problem pages` : 'All routes fit at all widths')
await b.close()
