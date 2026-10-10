import { chromium } from 'playwright'
const U = process.env.U || 'http://localhost:4173'
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 390, height: 844 } })
for (const c of ['bukhari/1', 'nasai/2']) {
  await p.goto(`${U}/hadith/${c}`); await p.waitForSelector('article', { timeout: 30000 })
  await p.getByRole('radio', { name: 'Both' }).click()
  await p.waitForSelector('article p[lang=ur]', { timeout: 30000 })
  const n = await p.$$eval('article', (a) => a.length), u = await p.$$eval('article p[lang=ur]', (a) => a.length)
  console.log(c, 'cards', n, 'urdu', u, (await p.textContent('article p[lang=ur]')).slice(0, 60))
  await p.getByRole('radio', { name: 'اردو' }).click(); await p.waitForTimeout(300)
  console.log(' urdu-only english paras', await p.$$eval('article p:not([lang]):not(.quran)', (a) => a.length))
  await p.screenshot({ path: `tests/out-${c.replace('/', '-')}.png` })
}
await b.close()
