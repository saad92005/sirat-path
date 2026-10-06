import { useSettings } from './settings'

// UI strings (not religious content). Add a language by adding a column here.
const STRINGS = {
  home: { en: 'Home', ur: 'ہوم', ar: 'الرئيسية' },
  quran: { en: 'Quran', ur: 'قرآن', ar: 'القرآن' },
  salah: { en: 'Salah', ur: 'نماز', ar: 'الصلاة' },
  duas: { en: 'Duas', ur: 'دعائیں', ar: 'الأدعية' },
  more: { en: 'More', ur: 'مزید', ar: 'المزيد' },
  search: { en: 'Search', ur: 'تلاش', ar: 'بحث' },
  ask: { en: 'Ask Islam', ur: 'سوال کریں', ar: 'اسأل' },
  hadith: { en: 'Hadith', ur: 'حدیث', ar: 'الحديث' },
  learn: { en: 'Learn', ur: 'سیکھیں', ar: 'تعلّم' },
  dhikr: { en: 'Dhikr', ur: 'ذکر', ar: 'الذكر' },
  azkar: { en: 'Azkar', ur: 'اذکار', ar: 'الأذكار' },
  qibla: { en: 'Qibla', ur: 'قبلہ', ar: 'القبلة' },
  calendar: { en: 'Calendar', ur: 'کیلنڈر', ar: 'التقويم' },
  zakat: { en: 'Zakat', ur: 'زکوٰۃ', ar: 'الزكاة' },
  hajj: { en: 'Hajj & Umrah', ur: 'حج و عمرہ', ar: 'الحج والعمرة' },
  ramadan: { en: 'Ramadan', ur: 'رمضان', ar: 'رمضان' },
  kids: { en: 'Kids', ur: 'بچے', ar: 'الأطفال' },
  library: { en: 'Library', ur: 'لائبریری', ar: 'المكتبة' },
  journal: { en: 'Journal', ur: 'ڈائری', ar: 'اليوميات' },
  habits: { en: 'Habits', ur: 'عادات', ar: 'العادات' },
  names: { en: '99 Names', ur: 'اسمائے حسنیٰ', ar: 'الأسماء الحسنى' },
  khatm: { en: 'Khatm Planner', ur: 'ختم منصوبہ', ar: 'خطة الختم' },
  insights: { en: 'Insights', ur: 'جائزہ', ar: 'الإحصاءات' },
  saved: { en: 'Saved', ur: 'محفوظ', ar: 'المحفوظات' },
  settings: { en: 'Settings', ur: 'ترتیبات', ar: 'الإعدادات' },
  sources: { en: 'Sources', ur: 'ماخذ', ar: 'المصادر' },
  nextPrayer: { en: 'Next prayer', ur: 'اگلی نماز', ar: 'الصلاة القادمة' },
  continueReading: { en: 'Continue reading', ur: 'پڑھنا جاری رکھیں', ar: 'تابع القراءة' },
  todaysAzkar: { en: 'Today’s Azkar', ur: 'آج کے اذکار', ar: 'أذكار اليوم' },
  offline: { en: 'Offline — everything you need still works', ur: 'آف لائن — ضروری سب کچھ کام کر رہا ہے', ar: 'غير متصل — كل شيء أساسي يعمل' },
  read: { en: 'Read', ur: 'پڑھیں', ar: 'اقرأ' },
  worship: { en: 'Worship', ur: 'عبادت', ar: 'العبادة' },
  grow: { en: 'Grow', ur: 'ترقی', ar: 'النمو' },
  app: { en: 'App', ur: 'ایپ', ar: 'التطبيق' },
} as const

export type StrKey = keyof typeof STRINGS
export type Lang = 'en' | 'ur' | 'ar'

export function useT() {
  const { lang } = useSettings()
  return (k: StrKey) => STRINGS[k][lang] ?? STRINGS[k].en
}

export const isRtl = (l: Lang) => l === 'ur' || l === 'ar'
