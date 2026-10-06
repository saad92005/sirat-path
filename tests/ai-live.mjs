// Live check of Cloud AI on Ask Islam. Run: BASE_URL=https://siratpath.vercel.app node tests/ai-live.mjs
import { chromium } from 'playwright'
const U = process.env.BASE_URL ?? 'https://siratpath.vercel.app'
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 390, height: 844 } })
await p.goto(U + '/ask'); await p.waitForTimeout(1200)
await p.fill('input.input', 'What does the Quran say about patience?'); await p.click('button:has-text("Ask")')
await p.waitForSelector('text=Citations checked', { timeout: 60000 })
console.log('answer:', (await p.locator('section.border-dashed').innerText()).slice(0, 400).replace(/\s+/g, ' '))
await p.screenshot({ path: process.argv[2] ?? 'tests/screens/ai-live.png', fullPage: false })
await b.close()
