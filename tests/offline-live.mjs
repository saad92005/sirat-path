import { chromium } from 'playwright'
const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 390, height: 844 } }); const p = await ctx.newPage()
await p.goto('https://siratpath.vercel.app/'); await p.waitForFunction(() => navigator.serviceWorker.controller, null, { timeout: 30000 }).catch(() => {}); await p.reload(); await p.waitForTimeout(3000)
await ctx.setOffline(true)
for (const r of ['/quran/18', '/duas?c=morning', '/prayer', '/learn/salah/salah-steps']) { await p.goto('https://siratpath.vercel.app' + r); await p.waitForTimeout(1500); console.log('offline', r, (await p.locator('main').innerText()).length > 200 ? 'OK' : 'EMPTY') }
console.log('offline banner:', await p.locator('text=Offline').count() > 0)
await b.close()
