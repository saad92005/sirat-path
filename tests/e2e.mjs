import { chromium } from 'playwright'
const SP = process.argv[2] ?? 'tests/screens', U = process.env.BASE_URL ?? 'http://localhost:4173'
const ROUTES = ['/', '/account', '/admin', '/quran', '/quran/36', '/prayer', '/duas', '/duas?c=morning', '/azkar', '/dhikr', '/qibla', '/hadith', '/hadith/nawawi/1', '/learn', '/learn/wudu', '/learn/wudu/wudu-steps', '/ramadan', '/zakat', '/hajj', '/journal', '/habits', '/kids', '/library', '/more', '/calendar', '/names', '/insights', '/search?q=patience', '/settings', '/ask', '/khatm', '/saved', '/about']
const b = await chromium.launch()
const errs = []
const seed = (accent, lang) => JSON.stringify({ location: { lat: 31.5204, lng: 74.3587, label: 'Lahore, Pakistan' }, lastRead: { s: 2, a: 142 }, name: 'Saad', accent, lang })
async function sweep(tag, vp, theme, accent, lang, shots) {
  const ctx = await b.newContext({ viewport: vp, colorScheme: theme })
  const p = await ctx.newPage()
  p.on('pageerror', e => errs.push(`${tag} ${p.url()}: ${e.message}`))
  p.on('console', m => m.type() === 'error' && !/404|Failed to load resource/.test(m.text()) && errs.push(`${tag} ${p.url()}: ${m.text()}`))
  await p.goto(U); await p.evaluate(s => localStorage.setItem('sirat-settings', s), seed(accent, lang))
  for (const r of ROUTES) {
    await p.goto(U + r); await p.waitForTimeout(r.startsWith('/hadith/') ? 3500 : 900)
    const ow = await p.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
    if (ow > 1) errs.push(`${tag} ${r} overflow ${ow}px`)
    const bad = await p.locator('text=Something went wrong').count(); if (bad) errs.push(`${tag} ${r} error boundary`)
    if (shots.includes(r)) await p.screenshot({ path: `${SP}/${tag}${r.replace(/[\/?=]/g, '_')}.png` })
  }
  return { ctx, p }
}
const m = await sweep('m', { width: 390, height: 844 }, 'light', 'emerald', 'en', ['/', '/duas', '/azkar', '/prayer', '/learn', '/kids', '/hadith/nawawi/1', '/more'])
const p = m.p
// interactions
await p.goto(U + '/prayer'); await p.waitForTimeout(600); await p.click('[aria-label^="Fajr"]'); await p.waitForTimeout(300)
console.log('salah marked:', await p.locator('[aria-label="Fajr: ontime"]').count())
await p.goto(U + '/azkar'); await p.waitForTimeout(800); const tapBtn = p.locator('button:has-text("Tap ·")').first(); await tapBtn.click(); await p.waitForTimeout(300)
console.log('azkar done count:', await p.locator('button:has-text("Done")').count())
await p.goto(U + '/zakat'); await p.waitForTimeout(500); const inp = p.locator('input[type=number]').nth(1); await inp.click(); await p.keyboard.type('1234'); 
console.log('zakat input value:', await inp.inputValue())
await p.goto(U + '/learn/foundations/quiz'); await p.waitForTimeout(500); await p.locator('button.card').nth(1).click(); await p.waitForTimeout(200)
console.log('quiz feedback:', await p.locator('text=Correct!').count())
await p.goto(U + '/habits'); await p.waitForTimeout(600); console.log('habits seeded:', await p.locator('[aria-label^="Mark "]').count())
// ---- Regression checks for previously fixed bugs ----
await p.goto(U + '/zakat'); await p.waitForTimeout(500)
const z = p.locator('input[type=number]').nth(2); await z.click(); await p.keyboard.type('98765')
if (await z.inputValue() !== '98765') errs.push('REGRESSION: Zakat input loses focus while typing')
await p.goto(U + '/azkar'); await p.waitForTimeout(800)
if (await p.locator('text=Quran · Quran').count()) errs.push('REGRESSION: duplicated "Quran · Quran" label')
await p.goto(U + '/zakat'); await p.waitForTimeout(400)
const bg = await p.evaluate(() => getComputedStyle(document.querySelector('.hero.pattern')).backgroundImage)
if (!/linear-gradient/.test(bg)) errs.push('REGRESSION: hero gradient hidden behind pattern')
await p.goto(U + '/ask'); await p.fill('input.input', 'patience'); await p.click('button:has-text("Ask")'); await p.waitForTimeout(800)
if (!(await p.locator('text=Verified sources').count())) errs.push('Ask: no verified sources shown')
await p.goto(U + '/account'); await p.waitForTimeout(500)
if (!(await p.locator('text=Guest mode').count())) errs.push('Account: guest mode message missing when cloud not configured')
// ---- Quran study tools (online, Quran.com API) ----
await p.goto(U + '/quran/1'); await p.waitForTimeout(1000)
await p.click('[title="Tajweed colours"]'); await p.waitForTimeout(3000)
const colored = await p.locator('article p.quran span[style*="color"]').count()
console.log('tajweed coloured segments:', colored); if (!colored) errs.push('Tajweed colouring did not render')
await p.selectOption('select[aria-label="Second translation"]', '234'); await p.waitForTimeout(3000)
const urdu = await p.locator('p.urdu').count(); console.log('urdu lines:', urdu); if (urdu < 7) errs.push('Urdu translation did not render')
await p.locator('[aria-label="Study: word by word and tafsir"]').nth(1).click(); await p.waitForTimeout(3000)
const words = await p.locator('[role=dialog] .quran.text-2xl').count(); console.log('wbw words:', words); if (!words) errs.push('Word-by-word did not render')
await p.click('[role=dialog] button:has-text("Tafsir")'); await p.waitForTimeout(4000)
const tafsirParas = await p.locator('[role=dialog] .space-y-3 p').count(); console.log('tafsir paragraphs:', tafsirParas); if (!tafsirParas) errs.push('Tafsir did not render')
await p.screenshot({ path: `${SP}/study.png` })
await p.keyboard.press('Escape')
await p.click('[title="Tajweed colours"]'); await p.selectOption('select[aria-label="Second translation"]', '0')
const d = await sweep('dl', { width: 1440, height: 900 }, 'dark', 'lavender', 'en', ['/', '/hadith/nawawi/1', '/ramadan', '/zakat', '/learn'])
const t = await sweep('tu', { width: 390, height: 844 }, 'light', 'teal', 'ur', ['/', '/more'])
console.log('errors:', errs.length ? errs : 'none')
await b.close()
