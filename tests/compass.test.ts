import { headingFromEuler, declination, greatCircle, KAABA } from '../src/lib/compass'
import { qiblaBearing } from '../src/lib/prayer'
const near=(a:number,b:number,t=0.5)=>Math.abs(((a-b+540)%360)-180)<t
const cases:[string,boolean][]=[
 ['flat, alpha=0 -> N', near(headingFromEuler(0,0,0),0)],
 ['flat, alpha=90 -> 270', near(headingFromEuler(90,0,0),270)],
 ['flat, alpha=270 -> 90', near(headingFromEuler(270,0,0),90)],
 ['flat tilted gamma=30, alpha=90 -> 270', near(headingFromEuler(90,10,30),270,1)],
 ['upright beta=90, alpha=0 -> N', near(headingFromEuler(0,90,0),0)],
 ['upright beta=90, alpha=90 -> 270', near(headingFromEuler(90,90,0),270)],
]
// Reference Qibla bearings (published values)
const q=[['Multan',30.1575,71.5249,260.47],['London',51.5074,-0.1278,118.99],['New York',40.7128,-74.006,58.48],['Jakarta',-6.2088,106.8456,295.15]] as const
for (const [n,la,lo,ref] of q) cases.push([`qibla ${n} ${qiblaBearing(la,lo).toFixed(2)} vs ${ref}`, near(qiblaBearing(la,lo),ref,1)])
cases.push([`decl London ${declination(51.5,-0.13).toFixed(2)} (~+1)`, Math.abs(declination(51.5,-0.13)-1)<1.5])
cases.push([`decl New York ${declination(40.71,-74).toFixed(2)} (~-12.8)`, Math.abs(declination(40.71,-74)+12.8)<1.5])
const gc=greatCircle({lat:30.16,lng:71.52},KAABA); cases.push(['great circle ends at Kaaba', near(gc.at(-1)![0],KAABA.lat,0.001)&&near(gc.at(-1)![1],KAABA.lng,0.001)])
let fail=0; for (const [n,ok] of cases){ console.log(ok?'✓':'✗',n); if(!ok) fail++ }
process.exit(fail)
