import { chromium } from 'playwright'
const U='https://siratpath.vercel.app'
const b=await chromium.launch(); const ctx=await b.newContext({viewport:{width:390,height:844}})
await ctx.addInitScript(()=>{ if(!localStorage.getItem('sirat-settings')) localStorage.setItem('sirat-settings',JSON.stringify({onboarded:true,location:{lat:30.16,lng:71.52,label:'Multan'}})) })
const p=await ctx.newPage(); p.on('pageerror',e=>console.log('ERR',e.message))
await p.goto(U); await p.waitForFunction(()=>navigator.serviceWorker.controller,null,{timeout:60000}); await p.waitForTimeout(6000)
await p.goto(U+'/settings#offline'); await p.waitForTimeout(1500)
const row=n=>p.locator('#offline li',{hasText:n})
console.log('panel rows', await p.locator('#offline li').count(), '| storage chip:', await p.locator('#offline .chip').allInnerTexts())
for (const n of ['Forty Hadith of an-Nawawi','Fateh Muhammad Jalandhari']) { await row(n).locator('button').click(); await row(n).getByText('Saved').waitFor({timeout:180000}); console.log('downloaded:',n) }
await ctx.setOffline(true)
await p.goto(U+'/hadith/nawawi'); await p.waitForTimeout(1500); const sec=await p.locator('main a[href^="/hadith/nawawi/"]').first().getAttribute('href').catch(()=>null); console.log('nawawi books offline:', sec)
if(sec){ await p.goto(U+sec); await p.waitForTimeout(2000); console.log('hadith text offline:', (await p.locator('main').innerText()).length, 'chars', (await p.locator('text=isn’t saved yet').count())?'NOT SAVED':'OK') }
// Urdu translation offline in reader
await p.evaluate(()=>{ const s=JSON.parse(localStorage.getItem('sirat-settings')); s.secondTranslation=234; localStorage.setItem('sirat-settings',JSON.stringify(s)) })
await p.goto(U+'/quran/112'); await p.waitForTimeout(2500); console.log('urdu offline:', await p.locator('.urdu').count(), 'urdu blocks')
await p.goto(U+'/ask'); await p.locator('input.input').first().fill('patience'); await p.locator('input.input').first().press('Enter'); await p.waitForTimeout(1500)
console.log('ask offline note:', await p.getByText("Cloud AI is paused").count(), '| sources:', await p.locator('main a[href^="/quran/"]').count())
await p.reload(); await p.waitForTimeout(2000); console.log('hard reload offline:', (await p.locator('main').innerText()).length>100?'OK':'FAIL')
await b.close()
