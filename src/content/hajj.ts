// Original step-by-step overview. Rites have detailed fiqh differences (e.g. between Tamattuʿ, Qiran
// and Ifrad Hajj); this guide gives the common outline and encourages learning from a qualified guide.

export type Step = { title: string; when?: string; body: string; dua?: string; ref?: string; checklist?: string[] }

export const UMRAH: Step[] = [
  { title: 'Preparation', body: 'Make sincere intention, settle debts and seek forgiveness from people. Learn the rites before you travel.',
    checklist: ['Passport & visa', 'Ihram garments (men) / modest clothing (women)', 'Unscented toiletries', 'Comfortable sandals', 'Small bag for essentials', 'Copy of duas'] },
  { title: 'Ihram at the Miqat', body: 'Before crossing the miqat, take a bath (ghusl) if possible, wear ihram, and make the intention for Umrah. From now, the restrictions of ihram apply (e.g. no perfume, no cutting hair or nails; men do not cover the head).', ref: 'Sahih al-Bukhari 1524 (the miqats)' },
  { title: 'Talbiyah', body: 'Recite the Talbiyah frequently from ihram until you begin tawaf.', dua: 'talbiyah', ref: 'Sahih al-Bukhari 1549' },
  { title: 'Tawaf', body: 'Circle the Kaʿbah seven times anti-clockwise, starting and ending at the Black Stone, keeping the Kaʿbah on your left. Make dua and dhikr in your own words. Between the Yemeni Corner and the Black Stone it is Sunnah to recite “Rabbana atina…”.', dua: 'rukn-yamani', ref: 'Quran 22:29' },
  { title: 'Two rakʿahs', body: 'Pray two rakʿahs behind Maqam Ibrahim if possible, or anywhere in the mosque.', ref: 'Quran 2:125' },
  { title: 'Saʿi', body: 'Walk seven times between Safa and Marwah, starting at Safa and ending at Marwah (Safa→Marwah counts as one).', ref: 'Quran 2:158' },
  { title: 'Halq or Taqsir', body: 'Men shave the head (preferred) or shorten the hair; women cut a fingertip’s length. Your Umrah is now complete and the ihram restrictions end.', ref: 'Quran 48:27' },
]

export const HAJJ: Step[] = [
  { title: 'Ihram', when: '8 Dhu al-Hijjah (or earlier)', body: 'Enter ihram with the intention of Hajj (according to the type of Hajj you are performing) and recite the Talbiyah.', dua: 'talbiyah' },
  { title: 'Mina', when: '8 Dhu al-Hijjah — Yawm at-Tarwiyah', body: 'Go to Mina and pray Dhuhr, Asr, Maghrib, Isha and the next Fajr there, shortening four-rakʿah prayers.' },
  { title: 'ʿArafah', when: '9 Dhu al-Hijjah', body: 'The essential pillar of Hajj. Stand at ʿArafah from after midday until sunset in dua, dhikr and repentance. “Hajj is ʿArafah.”', ref: 'Tirmidhi 889' },
  { title: 'Muzdalifah', when: 'Night of 10th', body: 'After sunset go to Muzdalifah, pray Maghrib and Isha together, rest, and collect pebbles for the Jamarat.', ref: 'Quran 2:198' },
  { title: 'Jamarat al-ʿAqabah', when: '10 Dhu al-Hijjah — Eid day', body: 'Throw seven pebbles at Jamarat al-ʿAqabah, saying Allahu Akbar with each.' },
  { title: 'Sacrifice', when: '10th (to 13th)', body: 'Offer the hady (sacrifice) if required for your type of Hajj.' },
  { title: 'Halq or Taqsir', when: '10th', body: 'Shave or shorten the hair. Most ihram restrictions are lifted (partial release).' },
  { title: 'Tawaf al-Ifadah & Saʿi', when: '10th or after', body: 'Perform Tawaf al-Ifadah — a pillar of Hajj — and Saʿi if required.', ref: 'Quran 22:29' },
  { title: 'Days of Tashriq', when: '11–13 Dhu al-Hijjah', body: 'Stay in Mina and stone all three Jamarat each day after midday. You may leave after the 12th.', ref: 'Quran 2:203' },
  { title: 'Farewell Tawaf', when: 'Before leaving Makkah', body: 'Perform Tawaf al-Wadaʿ as the last act before departing.', ref: 'Sahih Muslim 1327' },
]
