// Dua & Azkar library.
// - Quranic duas reference ayahs only; their text is pulled from the verified Tanzil dataset.
// - Sunnah duas carry a hadith reference (collection + number as in the common numbering used by
//   sunnah.com). Arabic is the well-known wording; English renderings are this project's own.
// - Nothing here is AI-generated. See RELIGIOUS_CONTENT_POLICY.md. Report errors via GitHub issues.

export type Dua = {
  id: string
  cat: string
  title: string
  /** Quranic source — text loaded from the verified dataset */
  quran?: { s: number; from: number; to?: number }
  ar?: string
  tr?: string
  en?: string
  ref: string
  count?: number
  note?: string
}

export const DUA_CATEGORIES: { id: string; label: string; icon: string }[] = [
  { id: 'morning', label: 'Morning', icon: '🌅' },
  { id: 'evening', label: 'Evening', icon: '🌇' },
  { id: 'after-salah', label: 'After Salah', icon: '🤲' },
  { id: 'sleep', label: 'Sleep & Waking', icon: '🌙' },
  { id: 'home', label: 'Home & Mosque', icon: '🏠' },
  { id: 'food', label: 'Food & Drink', icon: '🍽️' },
  { id: 'travel', label: 'Travel', icon: '🧭' },
  { id: 'anxiety', label: 'Anxiety & Distress', icon: '💚' },
  { id: 'forgiveness', label: 'Forgiveness', icon: '✨' },
  { id: 'knowledge', label: 'Knowledge & Study', icon: '📖' },
  { id: 'family', label: 'Parents & Family', icon: '🏡' },
  { id: 'ramadan', label: 'Ramadan', icon: '🌙' },
  { id: 'hajj', label: 'Hajj & Umrah', icon: '🕋' },
  { id: 'quranic', label: 'Rabbana (Quranic)', icon: '📜' },
]

const MORNING_EVENING = (cat: 'morning' | 'evening'): Dua[] => {
  const m = cat === 'morning'
  return [
    { id: `${cat}-kursi`, cat, title: 'Ayat al-Kursi', quran: { s: 2, from: 255 }, ref: 'Quran 2:255', count: 1 },
    { id: `${cat}-ikhlas`, cat, title: 'Al-Ikhlas', quran: { s: 112, from: 1, to: 4 }, ref: 'Quran 112 · recited 3× (Abu Dawud 5082, Tirmidhi 3575)', count: 3 },
    { id: `${cat}-falaq`, cat, title: 'Al-Falaq', quran: { s: 113, from: 1, to: 5 }, ref: 'Quran 113 · recited 3× (Abu Dawud 5082)', count: 3 },
    { id: `${cat}-nas`, cat, title: 'An-Nas', quran: { s: 114, from: 1, to: 6 }, ref: 'Quran 114 · recited 3× (Abu Dawud 5082)', count: 3 },
    {
      id: `${cat}-asbahna`, cat, title: m ? 'We have reached the morning' : 'We have reached the evening', count: 1,
      ar: m
        ? 'أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ، رَبِّ أَسْأَلُكَ خَيْرَ مَا فِي هَٰذَا الْيَوْمِ وَخَيْرَ مَا بَعْدَهُ، وَأَعُوذُ بِكَ مِنْ شَرِّ مَا فِي هَٰذَا الْيَوْمِ وَشَرِّ مَا بَعْدَهُ، رَبِّ أَعُوذُ بِكَ مِنَ الْكَسَلِ وَسُوءِ الْكِبَرِ، رَبِّ أَعُوذُ بِكَ مِنْ عَذَابٍ فِي النَّارِ وَعَذَابٍ فِي الْقَبْرِ'
        : 'أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ، رَبِّ أَسْأَلُكَ خَيْرَ مَا فِي هَٰذِهِ اللَّيْلَةِ وَخَيْرَ مَا بَعْدَهَا، وَأَعُوذُ بِكَ مِنْ شَرِّ مَا فِي هَٰذِهِ اللَّيْلَةِ وَشَرِّ مَا بَعْدَهَا، رَبِّ أَعُوذُ بِكَ مِنَ الْكَسَلِ وَسُوءِ الْكِبَرِ، رَبِّ أَعُوذُ بِكَ مِنْ عَذَابٍ فِي النَّارِ وَعَذَابٍ فِي الْقَبْرِ',
      tr: m ? 'Asbahna wa asbahal-mulku lillah…' : 'Amsayna wa amsal-mulku lillah…',
      en: `We have reached the ${m ? 'morning' : 'evening'} and the dominion belongs to Allah. All praise is for Allah. There is no god but Allah alone, without partner; His is the dominion and His is the praise, and He is capable of all things. My Lord, I ask You for the good of this ${m ? 'day' : 'night'} and what follows it, and I seek refuge in You from its evil and the evil of what follows it. My Lord, I seek refuge in You from laziness and the misery of old age; I seek refuge in You from punishment in the Fire and in the grave.`,
      ref: 'Sahih Muslim 2723',
    },
    {
      id: `${cat}-bika`, cat, title: m ? 'By You we enter the morning' : 'By You we enter the evening', count: 1,
      ar: m
        ? 'اللَّهُمَّ بِكَ أَصْبَحْنَا، وَبِكَ أَمْسَيْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ النُّشُورُ'
        : 'اللَّهُمَّ بِكَ أَمْسَيْنَا، وَبِكَ أَصْبَحْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ الْمَصِيرُ',
      tr: m ? 'Allahumma bika asbahna, wa bika amsayna, wa bika nahya, wa bika namutu, wa ilaykan-nushur' : 'Allahumma bika amsayna, wa bika asbahna, wa bika nahya, wa bika namutu, wa ilaykal-masir',
      en: m ? 'O Allah, by You we enter the morning and by You the evening, by You we live and by You we die, and to You is the resurrection.' : 'O Allah, by You we enter the evening and by You the morning, by You we live and by You we die, and to You is the final return.',
      ref: 'Jamiʿ at-Tirmidhi 3391',
    },
    {
      id: `${cat}-istighfar`, cat, title: 'Sayyid al-Istighfar — master of seeking forgiveness', count: 1,
      ar: 'اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَٰهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَىٰ عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي، فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ',
      tr: 'Allahumma anta rabbi la ilaha illa ant, khalaqtani wa ana ʿabduk…',
      en: 'O Allah, You are my Lord; there is no god but You. You created me and I am Your servant, and I keep Your covenant and promise as best I can. I seek refuge in You from the evil of what I have done. I acknowledge Your favour upon me and I acknowledge my sin, so forgive me, for none forgives sins except You.',
      ref: 'Sahih al-Bukhari 6306',
    },
    {
      id: `${cat}-bismillah`, cat, title: 'Protection by the Name of Allah', count: 3,
      ar: 'بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ',
      tr: 'Bismillahil-ladhi la yadurru maʿasmihi shayʾun fil-ardi wa la fis-samaʾ, wa huwas-Samiʿul-ʿAlim',
      en: 'In the Name of Allah, with whose Name nothing on earth or in heaven can cause harm, and He is the All-Hearing, the All-Knowing.',
      ref: 'Abu Dawud 5088, Tirmidhi 3388',
    },
    {
      id: `${cat}-subhan100`, cat, title: 'Glory and praise', count: 100,
      ar: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ', tr: 'SubhanAllahi wa bihamdihi', en: 'Glory be to Allah and praise be to Him.',
      ref: 'Sahih Muslim 2692',
    },
  ]
}

export const DUAS: Dua[] = [
  ...MORNING_EVENING('morning'),
  ...MORNING_EVENING('evening'),

  { id: 'salah-istighfar', cat: 'after-salah', title: 'Seeking forgiveness and peace', count: 1,
    ar: 'أَسْتَغْفِرُ اللَّهَ (ثَلَاثًا)، اللَّهُمَّ أَنْتَ السَّلَامُ وَمِنْكَ السَّلَامُ، تَبَارَكْتَ يَا ذَا الْجَلَالِ وَالْإِكْرَامِ',
    tr: 'Astaghfirullah (3×). Allahumma antas-salam wa minkas-salam, tabarakta ya dhal-jalali wal-ikram',
    en: 'I seek Allah’s forgiveness (three times). O Allah, You are Peace and from You is peace. Blessed are You, O Possessor of Majesty and Honour.',
    ref: 'Sahih Muslim 591' },
  { id: 'salah-subhanallah', cat: 'after-salah', title: 'SubhanAllah', ar: 'سُبْحَانَ اللَّهِ', tr: 'SubhanAllah', en: 'Glory be to Allah.', ref: 'Sahih Muslim 597', count: 33 },
  { id: 'salah-alhamdulillah', cat: 'after-salah', title: 'Alhamdulillah', ar: 'الْحَمْدُ لِلَّهِ', tr: 'Alhamdulillah', en: 'All praise is for Allah.', ref: 'Sahih Muslim 597', count: 33 },
  { id: 'salah-allahuakbar', cat: 'after-salah', title: 'Allahu Akbar', ar: 'اللَّهُ أَكْبَرُ', tr: 'Allahu Akbar', en: 'Allah is the Greatest.', ref: 'Sahih Muslim 597', count: 33 },
  { id: 'salah-tahlil', cat: 'after-salah', title: 'Completing the hundred', count: 1,
    ar: 'لَا إِلَٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ',
    tr: 'La ilaha illallahu wahdahu la sharika lah, lahul-mulku wa lahul-hamdu wa huwa ʿala kulli shayʾin qadir',
    en: 'There is no god but Allah alone, without partner. His is the dominion and His is the praise, and He is capable of all things.',
    ref: 'Sahih Muslim 597' },
  { id: 'salah-fajr-ilm', cat: 'after-salah', title: 'After Fajr — beneficial knowledge', count: 1,
    ar: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ عِلْمًا نَافِعًا، وَرِزْقًا طَيِّبًا، وَعَمَلًا مُتَقَبَّلًا',
    tr: 'Allahumma inni asʾaluka ʿilman nafiʿan, wa rizqan tayyiban, wa ʿamalan mutaqabbalan',
    en: 'O Allah, I ask You for beneficial knowledge, good provision, and accepted deeds.', ref: 'Sunan Ibn Majah 925' },

  { id: 'sleep-name', cat: 'sleep', title: 'Before sleeping', ar: 'بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا', tr: 'Bismika Allahumma amutu wa ahya', en: 'In Your Name, O Allah, I die and I live.', ref: 'Sahih al-Bukhari 6324' },
  { id: 'sleep-kursi', cat: 'sleep', title: 'Ayat al-Kursi before sleep', quran: { s: 2, from: 255 }, ref: 'Quran 2:255 · Sahih al-Bukhari 2311' },
  { id: 'sleep-baqarah', cat: 'sleep', title: 'Last two ayahs of al-Baqarah at night', quran: { s: 2, from: 285, to: 286 }, ref: 'Quran 2:285–286 · Sahih al-Bukhari 5009' },
  { id: 'wake', cat: 'sleep', title: 'Upon waking', ar: 'الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ', tr: 'Alhamdu lillahil-ladhi ahyana baʿda ma amatana wa ilayhin-nushur', en: 'All praise is for Allah who gave us life after causing us to die, and to Him is the resurrection.', ref: 'Sahih al-Bukhari 6324' },

  { id: 'leave-home', cat: 'home', title: 'Leaving home', ar: 'بِسْمِ اللَّهِ، تَوَكَّلْتُ عَلَى اللَّهِ، وَلَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ', tr: 'Bismillah, tawakkaltu ʿalallah, wa la hawla wa la quwwata illa billah', en: 'In the Name of Allah, I place my trust in Allah, and there is no power nor strength except with Allah.', ref: 'Abu Dawud 5095, Tirmidhi 3426' },
  { id: 'enter-masjid', cat: 'home', title: 'Entering the mosque', ar: 'اللَّهُمَّ افْتَحْ لِي أَبْوَابَ رَحْمَتِكَ', tr: 'Allahummaf-tah li abwaba rahmatik', en: 'O Allah, open for me the gates of Your mercy.', ref: 'Sahih Muslim 713' },
  { id: 'leave-masjid', cat: 'home', title: 'Leaving the mosque', ar: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ مِنْ فَضْلِكَ', tr: 'Allahumma inni asʾaluka min fadlik', en: 'O Allah, I ask You of Your bounty.', ref: 'Sahih Muslim 713' },
  { id: 'toilet', cat: 'home', title: 'Entering the washroom', ar: 'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْخُبُثِ وَالْخَبَائِثِ', tr: 'Allahumma inni aʿudhu bika minal-khubuthi wal-khabaʾith', en: 'O Allah, I seek refuge in You from evil and evil beings.', ref: 'Sahih al-Bukhari 142' },
  { id: 'rain', cat: 'home', title: 'When it rains', ar: 'اللَّهُمَّ صَيِّبًا نَافِعًا', tr: 'Allahumma sayyiban nafiʿa', en: 'O Allah, make it a beneficial rain.', ref: 'Sahih al-Bukhari 1032' },

  { id: 'food-before', cat: 'food', title: 'Before eating', ar: 'بِسْمِ اللَّهِ', tr: 'Bismillah', en: 'In the Name of Allah.', ref: 'Abu Dawud 3767, Tirmidhi 1858', note: 'If you forget at the start, say: بِسْمِ اللَّهِ أَوَّلَهُ وَآخِرَهُ (In the Name of Allah, at its beginning and its end).' },
  { id: 'food-after', cat: 'food', title: 'After eating', ar: 'الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنِي هَٰذَا وَرَزَقَنِيهِ مِنْ غَيْرِ حَوْلٍ مِنِّي وَلَا قُوَّةٍ', tr: 'Alhamdu lillahil-ladhi atʿamani hadha wa razaqanihi min ghayri hawlin minni wa la quwwah', en: 'All praise is for Allah who fed me this and provided it for me without any power or strength on my part.', ref: 'Abu Dawud 4023, Tirmidhi 3458' },

  { id: 'travel', cat: 'travel', title: 'Beginning a journey', ar: 'اللَّهُ أَكْبَرُ، اللَّهُ أَكْبَرُ، اللَّهُ أَكْبَرُ، سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَٰذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ، وَإِنَّا إِلَىٰ رَبِّنَا لَمُنْقَلِبُونَ', tr: 'Allahu akbar (3×). Subhanal-ladhi sakhkhara lana hadha wa ma kunna lahu muqrinin, wa inna ila rabbina lamunqalibun', en: 'Allah is the Greatest (three times). Glory be to Him who has subjected this to us, and we could not have done it ourselves, and to our Lord we will surely return.', ref: 'Sahih Muslim 1342 (includes Quran 43:13–14)', note: 'Opening portion of the travel supplication; the full narration continues.' },
  { id: 'travel-quran', cat: 'travel', title: 'Riding — the Quranic words', quran: { s: 43, from: 13, to: 14 }, ref: 'Quran 43:13–14' },

  { id: 'anxiety', cat: 'anxiety', title: 'From worry and grief', ar: 'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ، وَالْعَجْزِ وَالْكَسَلِ، وَالْبُخْلِ وَالْجُبْنِ، وَضَلَعِ الدَّيْنِ وَغَلَبَةِ الرِّجَالِ', tr: 'Allahumma inni aʿudhu bika minal-hammi wal-hazan, wal-ʿajzi wal-kasal, wal-bukhli wal-jubn, wa dalaʿid-dayni wa ghalabatir-rijal', en: 'O Allah, I seek refuge in You from worry and grief, from incapacity and laziness, from miserliness and cowardice, and from the burden of debt and being overpowered by others.', ref: 'Sahih al-Bukhari 6369' },
  { id: 'distress', cat: 'anxiety', title: 'In times of distress', ar: 'لَا إِلَٰهَ إِلَّا اللَّهُ الْعَظِيمُ الْحَلِيمُ، لَا إِلَٰهَ إِلَّا اللَّهُ رَبُّ الْعَرْشِ الْعَظِيمِ، لَا إِلَٰهَ إِلَّا اللَّهُ رَبُّ السَّمَاوَاتِ وَرَبُّ الْأَرْضِ وَرَبُّ الْعَرْشِ الْكَرِيمِ', tr: 'La ilaha illallahul-ʿAzimul-Halim…', en: 'There is no god but Allah, the Magnificent, the Forbearing. There is no god but Allah, Lord of the Magnificent Throne. There is no god but Allah, Lord of the heavens, Lord of the earth, and Lord of the Noble Throne.', ref: 'Sahih al-Bukhari 6346, Sahih Muslim 2730' },
  { id: 'yunus', cat: 'anxiety', title: 'The supplication of Yunus (AS)', quran: { s: 21, from: 87 }, ref: 'Quran 21:87' },
  { id: 'sick-visit', cat: 'anxiety', title: 'Visiting the sick', ar: 'لَا بَأْسَ، طَهُورٌ إِنْ شَاءَ اللَّهُ', tr: 'La baʾs, tahurun in shaʾAllah', en: 'No harm — it is a purification, if Allah wills.', ref: 'Sahih al-Bukhari 3616' },

  { id: 'forgive-adam', cat: 'forgiveness', title: 'Adam (AS) seeking forgiveness', quran: { s: 7, from: 23 }, ref: 'Quran 7:23' },
  { id: 'forgive-3-16', cat: 'forgiveness', title: 'Forgive us our sins', quran: { s: 3, from: 16 }, ref: 'Quran 3:16' },
  { id: 'forgive-istighfar', cat: 'forgiveness', title: 'Sayyid al-Istighfar', ar: 'اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَٰهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَىٰ عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي، فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ', en: 'O Allah, You are my Lord; there is no god but You… so forgive me, for none forgives sins except You.', ref: 'Sahih al-Bukhari 6306' },

  { id: 'ilm', cat: 'knowledge', title: 'Increase me in knowledge', quran: { s: 20, from: 114 }, ref: 'Quran 20:114' },
  { id: 'musa', cat: 'knowledge', title: 'Ease and clear speech (before exams)', quran: { s: 20, from: 25, to: 28 }, ref: 'Quran 20:25–28' },

  { id: 'parents', cat: 'family', title: 'Mercy for parents', quran: { s: 17, from: 24 }, ref: 'Quran 17:24' },
  { id: 'parents-ibrahim', cat: 'family', title: 'Forgiveness for parents and believers', quran: { s: 14, from: 41 }, ref: 'Quran 14:41' },
  { id: 'spouses', cat: 'family', title: 'Comfort in spouses and children', quran: { s: 25, from: 74 }, ref: 'Quran 25:74' },
  { id: 'offspring', cat: 'family', title: 'Righteous offspring', quran: { s: 46, from: 15 }, ref: 'Quran 46:15' },

  { id: 'iftar', cat: 'ramadan', title: 'At breaking the fast', ar: 'ذَهَبَ الظَّمَأُ وَابْتَلَّتِ الْعُرُوقُ وَثَبَتَ الْأَجْرُ إِنْ شَاءَ اللَّهُ', tr: 'Dhahabadh-dhamaʾu wabtallatil-ʿuruqu wa thabatal-ajru in shaʾAllah', en: 'The thirst has gone, the veins are moistened, and the reward is confirmed, if Allah wills.', ref: 'Abu Dawud 2357' },
  { id: 'qadr', cat: 'ramadan', title: 'Laylat al-Qadr', ar: 'اللَّهُمَّ إِنَّكَ عَفُوٌّ تُحِبُّ الْعَفْوَ فَاعْفُ عَنِّي', tr: 'Allahumma innaka ʿafuwwun tuhibbul-ʿafwa faʿfu ʿanni', en: 'O Allah, You are Pardoning and love to pardon, so pardon me.', ref: 'Jamiʿ at-Tirmidhi 3513' },
  { id: 'fasting-quran', cat: 'ramadan', title: 'The verse of fasting', quran: { s: 2, from: 183 }, ref: 'Quran 2:183' },

  { id: 'talbiyah', cat: 'hajj', title: 'Talbiyah', ar: 'لَبَّيْكَ اللَّهُمَّ لَبَّيْكَ، لَبَّيْكَ لَا شَرِيكَ لَكَ لَبَّيْكَ، إِنَّ الْحَمْدَ وَالنِّعْمَةَ لَكَ وَالْمُلْكَ، لَا شَرِيكَ لَكَ', tr: 'Labbayk Allahumma labbayk, labbayka la sharika laka labbayk, innal-hamda wan-niʿmata laka wal-mulk, la sharika lak', en: 'Here I am, O Allah, here I am. Here I am, You have no partner, here I am. All praise, blessings and dominion are Yours. You have no partner.', ref: 'Sahih al-Bukhari 1549, Sahih Muslim 1184' },
  { id: 'rukn-yamani', cat: 'hajj', title: 'Between the Yemeni Corner and the Black Stone', quran: { s: 2, from: 201 }, ref: 'Quran 2:201 · Abu Dawud 1892' },

  { id: 'q-2-201', cat: 'quranic', title: 'Good in this world and the next', quran: { s: 2, from: 201 }, ref: 'Quran 2:201' },
  { id: 'q-2-127', cat: 'quranic', title: 'Accept from us', quran: { s: 2, from: 127 }, ref: 'Quran 2:127' },
  { id: 'q-2-286', cat: 'quranic', title: 'Do not burden us beyond our capacity', quran: { s: 2, from: 286 }, ref: 'Quran 2:286' },
  { id: 'q-3-8', cat: 'quranic', title: 'Do not let our hearts deviate', quran: { s: 3, from: 8 }, ref: 'Quran 3:8' },
  { id: 'q-3-193', cat: 'quranic', title: 'We heard the caller to faith', quran: { s: 3, from: 193 }, ref: 'Quran 3:193' },
  { id: 'q-18-10', cat: 'quranic', title: 'Mercy and right guidance', quran: { s: 18, from: 10 }, ref: 'Quran 18:10' },
  { id: 'q-23-118', cat: 'quranic', title: 'Best of those who show mercy', quran: { s: 23, from: 118 }, ref: 'Quran 23:118' },
  { id: 'q-28-24', cat: 'quranic', title: 'In need of any good You send', quran: { s: 28, from: 24 }, ref: 'Quran 28:24' },
  { id: 'q-59-10', cat: 'quranic', title: 'For those who came before us', quran: { s: 59, from: 10 }, ref: 'Quran 59:10' },
  { id: 'q-66-8', cat: 'quranic', title: 'Perfect our light', quran: { s: 66, from: 8 }, ref: 'Quran 66:8' },
]

export const AZKAR_SESSIONS: { id: 'morning' | 'evening' | 'after-salah' | 'sleep'; label: string; hint: string }[] = [
  { id: 'morning', label: 'Morning Azkar', hint: 'After Fajr until sunrise' },
  { id: 'evening', label: 'Evening Azkar', hint: 'After Asr until Maghrib' },
  { id: 'after-salah', label: 'After Salah', hint: 'After each obligatory prayer' },
  { id: 'sleep', label: 'Before Sleep', hint: 'When going to bed' },
]
