// Original introductory lessons written for this project. They cover points of broad agreement and
// cite Quran/hadith where relevant. Where schools of fiqh differ, the lesson says so rather than ruling.

export type Lesson = { id: string; title: string; minutes: number; body: { h?: string; p: string; ref?: string }[] }
export type Quiz = { q: string; options: string[]; answer: number; why: string }
export type Course = { id: string; title: string; subtitle: string; emoji: string; color: string; lessons: Lesson[]; quiz: Quiz[]; kids?: boolean }

export const COURSES: Course[] = [
  {
    id: 'foundations', title: 'Foundations of Islam', subtitle: 'Islam, Iman and Ihsan', emoji: '🕌', color: '#0f5c4d',
    lessons: [
      { id: 'pillars', title: 'The Five Pillars', minutes: 4, body: [
        { p: 'In the well-known Hadith of Jibril, the Prophet ﷺ described Islam through five pillars — the outward foundation of a Muslim’s practice.', ref: 'Sahih Muslim 8' },
        { h: '1. Shahadah', p: 'Bearing witness that there is no god but Allah and that Muhammad ﷺ is the Messenger of Allah.' },
        { h: '2. Salah', p: 'Establishing the five daily prayers at their times.' },
        { h: '3. Zakat', p: 'Giving the obligatory charity from wealth that reaches the nisab and is held for a lunar year.' },
        { h: '4. Sawm', p: 'Fasting the month of Ramadan from dawn until sunset.', ref: 'Quran 2:183–185' },
        { h: '5. Hajj', p: 'Pilgrimage to the House in Makkah once in a lifetime for those who are able.', ref: 'Quran 3:97' },
      ] },
      { id: 'iman', title: 'The Six Articles of Faith', minutes: 4, body: [
        { p: 'In the same hadith, Iman (faith) is described as belief in six matters.', ref: 'Sahih Muslim 8' },
        { p: 'Belief in Allah · His angels · His revealed books · His messengers · the Last Day · and divine decree (qadar), its good and its bad.' },
        { h: 'In the Quran', p: 'The believers are described as those who believe in Allah, His angels, His books and His messengers.', ref: 'Quran 2:285' },
      ] },
      { id: 'ihsan', title: 'Ihsan — Excellence', minutes: 2, body: [
        { p: 'Ihsan is “to worship Allah as though you see Him, and though you do not see Him, He sees you.” It is the inner quality that perfects outward practice.', ref: 'Sahih Muslim 8' },
      ] },
    ],
    quiz: [
      { q: 'How many pillars of Islam are mentioned in the Hadith of Jibril?', options: ['Four', 'Five', 'Six', 'Seven'], answer: 1, why: 'Shahadah, Salah, Zakat, Sawm and Hajj.' },
      { q: 'Which of these is an article of faith (Iman)?', options: ['Zakat', 'Belief in the angels', 'Hajj', 'Fasting'], answer: 1, why: 'The six articles include belief in the angels.' },
      { q: 'Ihsan means to worship Allah…', options: ['Only in Ramadan', 'As though you see Him', 'In congregation only', 'Silently'], answer: 1, why: 'As described in the Hadith of Jibril.' },
    ],
  },
  {
    id: 'wudu', title: 'Wudu — Purification', subtitle: 'Ablution step by step', emoji: '💧', color: '#1f7a8c',
    lessons: [
      { id: 'wudu-quran', title: 'The command of wudu', minutes: 2, body: [
        { p: 'Allah commands the believers, before prayer, to wash the face and the arms up to the elbows, wipe the head, and wash the feet up to the ankles.', ref: 'Quran 5:6' },
        { p: 'These Quranic acts are agreed to be essential. Scholars of different schools differ on some details, such as whether intention or sequence is obligatory or recommended.' },
      ] },
      { id: 'wudu-steps', title: 'How to make wudu', minutes: 4, body: [
        { h: 'Intention', p: 'Intend in your heart to make wudu for prayer, and say Bismillah.' },
        { h: 'Hands', p: 'Wash both hands up to the wrists, three times.' },
        { h: 'Mouth & nose', p: 'Rinse the mouth, then sniff water into the nose and blow it out — three times each.' },
        { h: 'Face', p: 'Wash the whole face from hairline to chin and ear to ear, three times.' },
        { h: 'Arms', p: 'Wash the right arm then the left, from fingertips up to and including the elbows, three times.' },
        { h: 'Head & ears', p: 'Wipe over the head with wet hands, then wipe the ears.' },
        { h: 'Feet', p: 'Wash the right foot then the left, up to and including the ankles, three times, cleaning between the toes.' },
        { p: 'Washing each part once is valid; three times follows the Sunnah.', ref: 'Sahih al-Bukhari 157–159' },
      ] },
      { id: 'wudu-breakers', title: 'What breaks wudu', minutes: 2, body: [
        { p: 'There is agreement that wudu is broken by: passing urine, stool or wind; deep sleep; and loss of consciousness.' },
        { p: 'Other matters (for example bleeding, or touching the opposite gender) are differed upon between schools. Follow the school or scholar you rely on.' },
      ] },
    ],
    quiz: [
      { q: 'Which ayah contains the command of wudu?', options: ['Quran 2:255', 'Quran 5:6', 'Quran 1:1', 'Quran 112:1'], answer: 1, why: 'Surah al-Maʾidah, ayah 6.' },
      { q: 'The arms are washed up to…', options: ['The wrists', 'The elbows', 'The shoulders', 'Mid-forearm'], answer: 1, why: 'Up to and including the elbows (5:6).' },
      { q: 'Which of these breaks wudu by agreement?', options: ['Eating', 'Deep sleep', 'Reading Quran', 'Walking'], answer: 1, why: 'Deep sleep breaks wudu by agreement.' },
    ],
  },
  {
    id: 'salah', title: 'Salah Essentials', subtitle: 'The five daily prayers', emoji: '🤲', color: '#6b4fa1',
    lessons: [
      { id: 'salah-times', title: 'The five prayers', minutes: 3, body: [
        { p: '“Indeed, prayer has been decreed upon the believers at specified times.”', ref: 'Quran 4:103' },
        { h: 'Obligatory rakʿahs', p: 'Fajr 2 · Dhuhr 4 · Asr 4 · Maghrib 3 · Isha 4. On Friday, the Jumuʿah prayer of 2 rakʿahs with a sermon replaces Dhuhr for those who attend it.' },
      ] },
      { id: 'salah-conditions', title: 'Before you pray', minutes: 3, body: [
        { p: 'Before prayer: be in a state of purity (wudu), wear clean clothing covering the ʿawrah, pray in a clean place, face the Qiblah, and pray once the prayer’s time has entered.' },
        { p: 'Use the Qibla compass and Prayer Times in this app for direction and timings.' },
      ] },
      { id: 'salah-steps', title: 'The outline of a rakʿah', minutes: 4, body: [
        { h: 'Takbir', p: 'Begin by saying “Allahu Akbar”.' },
        { h: 'Standing (qiyam)', p: 'Recite al-Fatihah, then additional Quran in the first two rakʿahs.', ref: 'Sahih al-Bukhari 756' },
        { h: 'Rukuʿ', p: 'Bow, with the back level, glorifying Allah.' },
        { h: 'Standing up', p: 'Rise and stand upright.' },
        { h: 'Two prostrations', p: 'Prostrate, sit briefly, then prostrate again.' },
        { h: 'Tashahhud & Taslim', p: 'Sit for the tashahhud after every two rakʿahs, and end the prayer with the salam to the right and left.' },
        { p: 'Details such as hand position and certain recitations vary between schools; all are based on evidence. Learn the details from a trusted teacher.' },
      ] },
    ],
    quiz: [
      { q: 'How many obligatory rakʿahs are in Maghrib?', options: ['2', '3', '4', '5'], answer: 1, why: 'Maghrib has three rakʿahs.' },
      { q: 'Which surah is recited in every rakʿah?', options: ['Al-Ikhlas', 'Al-Fatihah', 'Al-Kawthar', 'An-Nas'], answer: 1, why: '“There is no prayer for one who does not recite al-Fatihah” (Bukhari 756).' },
      { q: 'Which is a condition before prayer?', options: ['Facing the Qiblah', 'Fasting', 'Being in a mosque', 'Wearing white'], answer: 0, why: 'Facing the Qiblah is a condition of prayer.' },
    ],
  },
  {
    id: 'quran', title: 'Knowing the Quran', subtitle: 'Its structure and revelation', emoji: '📖', color: '#a37a2c',
    lessons: [
      { id: 'quran-structure', title: 'Structure of the Quran', minutes: 3, body: [
        { p: 'The Quran has 114 surahs and 6,236 ayahs (in the common Kufan count used in this app). For reading schedules it is divided into 30 juzʾ and 60 hizb.' },
        { p: 'Surahs are often described as Meccan (revealed before the Hijrah) or Medinan (after it). The label is shown on each surah in the reader.' },
      ] },
      { id: 'quran-revelation', title: 'The first revelation', minutes: 3, body: [
        { p: 'The first ayahs revealed were the opening of Surah al-ʿAlaq: “Read in the name of your Lord who created…”', ref: 'Quran 96:1–5 · Sahih al-Bukhari 3' },
        { p: 'The revelation continued over about 23 years, and Allah has promised to preserve it.', ref: 'Quran 15:9' },
      ] },
    ],
    quiz: [
      { q: 'How many surahs does the Quran have?', options: ['99', '110', '114', '120'], answer: 2, why: '114 surahs.' },
      { q: 'Which surah’s opening was revealed first?', options: ['Al-Fatihah', 'Al-ʿAlaq', 'Al-Baqarah', 'Al-Muddaththir'], answer: 1, why: 'Quran 96:1–5.' },
      { q: 'How many juzʾ is the Quran divided into?', options: ['7', '30', '60', '114'], answer: 1, why: '30 juzʾ.' },
    ],
  },
  {
    id: 'seerah', title: 'Seerah Basics', subtitle: 'Life of the Prophet ﷺ', emoji: '🌴', color: '#2f6f4f',
    lessons: [
      { id: 'seerah-makkah', title: 'The Makkan period', minutes: 3, body: [
        { p: 'The Prophet Muhammad ﷺ was born in Makkah in the Year of the Elephant (about 570 CE). He was known among his people as al-Amin, the trustworthy.' },
        { p: 'At around forty years of age, revelation began in the Cave of Hira. He called people to the worship of Allah alone in Makkah for about thirteen years, facing hardship with patience.' },
      ] },
      { id: 'seerah-madinah', title: 'The Hijrah and Madinah', minutes: 3, body: [
        { p: 'In 622 CE he migrated to Madinah — the Hijrah. The Islamic (Hijri) calendar counts its years from this event.' },
        { p: 'In Madinah the Muslim community was established. He passed away in Madinah in 11 AH (632 CE).' },
        { p: '“There has certainly been for you in the Messenger of Allah an excellent example.”', ref: 'Quran 33:21' },
      ] },
    ],
    quiz: [
      { q: 'The Hijri calendar begins from…', options: ['The birth of the Prophet ﷺ', 'The first revelation', 'The Hijrah to Madinah', 'The conquest of Makkah'], answer: 2, why: 'Years are counted from the Hijrah (622 CE).' },
      { q: 'Where did revelation begin?', options: ['Cave of Hira', 'Madinah', 'Taʾif', 'Cave of Thawr'], answer: 0, why: 'In the Cave of Hira.' },
    ],
  },
  {
    id: 'zakat-fasting', title: 'Zakat & Fasting', subtitle: 'Pillars of giving and restraint', emoji: '🌙', color: '#7a4f2f',
    lessons: [
      { id: 'zakat', title: 'Zakat in brief', minutes: 3, body: [
        { p: 'Zakat is due on wealth that reaches the nisab and is held for a full lunar year (hawl). On cash, gold, silver and trade goods it is commonly 2.5%.' },
        { p: 'The Quran names eight categories of recipients, including the poor, the needy, and those in debt.', ref: 'Quran 9:60' },
        { p: 'Use the Zakat calculator in this app for an estimate, and consult a scholar for your specific situation.' },
      ] },
      { id: 'fasting', title: 'Fasting in Ramadan', minutes: 3, body: [
        { p: 'Fasting was prescribed so that you may attain taqwa (God-consciousness).', ref: 'Quran 2:183' },
        { p: 'The fast is from dawn (Fajr) until sunset (Maghrib), abstaining from food, drink and marital relations.', ref: 'Quran 2:187' },
        { p: 'Those who are ill or travelling may make up the days later.', ref: 'Quran 2:184' },
      ] },
    ],
    quiz: [
      { q: 'The common rate of zakat on cash savings is…', options: ['1%', '2.5%', '5%', '10%'], answer: 1, why: '2.5% once nisab and hawl are met.' },
      { q: 'Which ayah lists the eight categories of zakat recipients?', options: ['Quran 2:183', 'Quran 9:60', 'Quran 5:6', 'Quran 4:103'], answer: 1, why: 'Surah at-Tawbah 9:60.' },
      { q: 'The fast ends at…', options: ['Asr', 'Sunset (Maghrib)', 'Isha', 'Midnight'], answer: 1, why: 'Quran 2:187.' },
    ],
  },
  {
    id: 'kids-manners', title: 'Good Manners', subtitle: 'For young Muslims', emoji: '🌟', color: '#e0a526', kids: true,
    lessons: [
      { id: 'kids-salam', title: 'Saying Salam', minutes: 2, body: [
        { p: 'When we meet someone we say “As-salamu ʿalaykum” — peace be upon you. They reply “Wa ʿalaykumus-salam”.' },
        { p: 'Allah tells us to reply to a greeting with one that is better, or at least the same.', ref: 'Quran 4:86' },
      ] },
      { id: 'kids-parents', title: 'Being kind to parents', minutes: 2, body: [
        { p: 'Allah tells us to be good to our parents and to speak to them with kind, gentle words.', ref: 'Quran 17:23–24' },
      ] },
      { id: 'kids-bismillah', title: 'Starting with Bismillah', minutes: 2, body: [
        { p: 'Before eating we say “Bismillah”, and we eat with our right hand from what is in front of us.', ref: 'Sahih al-Bukhari 5376' },
      ] },
    ],
    quiz: [
      { q: 'What do we say when we meet someone?', options: ['Goodbye', 'As-salamu ʿalaykum', 'Bismillah', 'Ameen'], answer: 1, why: 'We greet with salam.' },
      { q: 'What do we say before eating?', options: ['Alhamdulillah', 'Bismillah', 'SubhanAllah', 'Allahu Akbar'], answer: 1, why: 'We begin with Bismillah.' },
    ],
  },
]

export const ARABIC_LETTERS = 'ا ب ت ث ج ح خ د ذ ر ز س ش ص ض ط ظ ع غ ف ق ك ل م ن ه و ي'.split(' ')
export const LETTER_NAMES = ['Alif', 'Ba', 'Ta', 'Tha', 'Jim', 'Ha', 'Kha', 'Dal', 'Dhal', 'Ra', 'Zay', 'Sin', 'Shin', 'Sad', 'Dad', 'Ta', 'Dha', 'ʿAyn', 'Ghayn', 'Fa', 'Qaf', 'Kaf', 'Lam', 'Mim', 'Nun', 'Ha', 'Waw', 'Ya']
