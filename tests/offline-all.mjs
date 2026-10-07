import { chromium } from 'playwright'
const U='https://siratpath.vercel.app'
const routes=['/','/quran','/quran/36','/search','/prayer','/qibla','/duas','/azkar','/dhikr','/khatm','/saved','/ask','/names','/calendar','/insights','/hadith','/hadith/bukhari','/learn','/learn/salah','/ramadan','/zakat','/hajj','/journal','/habits','/kids','/library','/account','/settings','/more','/about']
const b=await chromium.launch(); const ctx=await b.newContext({viewport:{width:390,height:844},geolocation:{latitude:30.16,longitude:71.52},permissions:['geolocation']})
await ctx.addInitScript(()=>{ if(!localStorage.getItem('sirat-settings')) localStorage.setItem('sirat-settings',JSON.stringify({onboarded:true,location:{lat:30.16,lng:71.52,label:'Multan'}})) })
const p=await ctx.newPage()
await p.goto(U); await p.waitForFunction(()=>navigator.serviceWorker.controller,null,{timeout:60000}); await p.waitForTimeout(8000)
await ctx.setOffline(true)
for(const r of routes){ const errs=[]; const h=e=>errs.push(e.message); p.on('pageerror',h)
  await p.goto(U+r).catch(e=>errs.push('NAV '+e.message.slice(0,60))); await p.waitForTimeout(1800)
  const txt=await p.locator('main').innerText().catch(()=>''); const err=/failed|error|couldn.t|could not|unavailable|internet/i.exec(txt)
  console.log(txt.length>150?'OK  ':'EMPTY', r, err?`[mentions: ${txt.slice(Math.max(0,err.index-50),err.index+60).replace(/\s+/g,' ')}]`:'', errs.join('|').slice(0,120)); p.off('pageerror',h) }
await b.close()
