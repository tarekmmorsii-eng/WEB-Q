/**
 * translationMapper.ts
 * خريطة اللغات - تربط رموز لغات التطبيق بمعرفات الترجمات من APIs
 * 
 * المصدر الأساسي: Al Quran Cloud API (https://api.alquran.cloud)
 * المصدر البديل: FawazAhmed API (https://github.com/fawazahmed0/quran-api)
 */

export type ApiSource = 'alquran-cloud' | 'fawazahmed';

export interface EditionInfo {
    /** معرف الإصدار في API */
    editionId: string;
    /** اسم المترجم */
    author: string;
    /** مصدر API */
    source: ApiSource;
    /** اسم اللغة بالعربية */
    nameAr: string;
    /** اسم اللغة بالإنجليزية */
    nameEn: string;
    /** اتجاه النص */
    direction: 'ltr' | 'rtl';
    /** هل تتوفر معاني كلمات (WbW) من Quran.com API لهذه اللغة */
    hasWbw: boolean;
}

/**
 * خريطة ربط رموز اللغات بمعرفات الترجمات
 * مفتاح: رمز اللغة (ISO 639-1)
 * القيمة: معلومات الإصدار
 * 
 * ملاحظة: اللغة العربية (ar) غير موجودة هنا لأنها مدمجة محلياً
 * 
 * hasWbw: اللغات المدعومة بمعاني الكلمات من Quran.com API:
 *   true: en, ur, bn, id, tr, hi, de, ta
 *   false: باقي اللغات (لا تتوفر لها معاني كلمات في API)
 */
export const TRANSLATION_EDITIONS: Record<string, EditionInfo> = {
    // === اللغات المتاحة عبر Al Quran Cloud API ===
    // --- لغات يدعمها WbW (معاني الكلمات من Quran.com API) ---
    en: {
        editionId: 'en.sahih',
        author: 'Saheeh International',
        source: 'alquran-cloud',
        nameAr: 'الإنجليزية',
        nameEn: 'English',
        direction: 'ltr',
        hasWbw: true,
    },
    ur: {
        editionId: 'ur.maududi',
        author: 'Abul Ala Maududi',
        source: 'alquran-cloud',
        nameAr: 'الأردية',
        nameEn: 'اردو',
        direction: 'rtl',
        hasWbw: true,
    },
    bn: {
        editionId: 'bn.hoque',
        author: 'Zohurul Hoque',
        source: 'alquran-cloud',
        nameAr: 'البنغالية',
        nameEn: 'বাংলা',
        direction: 'ltr',
        hasWbw: true,
    },
    tr: {
        editionId: 'tr.diyanet',
        author: 'Diyanet İşleri',
        source: 'alquran-cloud',
        nameAr: 'التركية',
        nameEn: 'Türkçe',
        direction: 'ltr',
        hasWbw: true,
    },
    id: {
        editionId: 'id.indonesian',
        author: 'Indonesian Islamic Affairs Ministry',
        source: 'alquran-cloud',
        nameAr: 'الإندونيسية',
        nameEn: 'Bahasa Indonesia',
        direction: 'ltr',
        hasWbw: true,
    },
    de: {
        editionId: 'de.bubenheim',
        author: 'Frank Bubenheim & Nadeem Elyas',
        source: 'alquran-cloud',
        nameAr: 'الألمانية',
        nameEn: 'Deutsch',
        direction: 'ltr',
        hasWbw: true,
    },
    hi: {
        editionId: 'hi.hindi',
        author: 'Suhel Farooq Khan & Saifur Rahman Nadwi',
        source: 'alquran-cloud',
        nameAr: 'الهندية',
        nameEn: 'हिन्दी',
        direction: 'ltr',
        hasWbw: true,
    },
    ta: {
        editionId: 'ta.tamil',
        author: 'Tamil Translation',
        source: 'alquran-cloud',
        nameAr: 'التاميلية',
        nameEn: 'தமிழ்',
        direction: 'ltr',
        hasWbw: true,
    },

    // --- لغات WITHOUT WbW (تفسير فقط) ---
    fr: {
        editionId: 'fr.hamidullah',
        author: 'Muhammad Hamidullah',
        source: 'alquran-cloud',
        nameAr: 'الفرنسية',
        nameEn: 'Français',
        direction: 'ltr',
        hasWbw: false,
    },
    ms: {
        editionId: 'ms.basmeih',
        author: 'Abdullah Basmeih',
        source: 'alquran-cloud',
        nameAr: 'الماليزية',
        nameEn: 'Bahasa Melayu',
        direction: 'ltr',
        hasWbw: false,
    },
    es: {
        editionId: 'es.cortes',
        author: 'Julio Cortes',
        source: 'alquran-cloud',
        nameAr: 'الإسبانية',
        nameEn: 'Español',
        direction: 'ltr',
        hasWbw: false,
    },
    ru: {
        editionId: 'ru.kuliev',
        author: 'Elmir Kuliev',
        source: 'alquran-cloud',
        nameAr: 'الروسية',
        nameEn: 'Русский',
        direction: 'ltr',
        hasWbw: false,
    },
    zh: {
        editionId: 'zh.jian',
        author: 'Muhammad Makin',
        source: 'alquran-cloud',
        nameAr: 'الصينية',
        nameEn: '中文',
        direction: 'ltr',
        hasWbw: false,
    },
    ja: {
        editionId: 'ja.japanese',
        author: 'Ryoichi Mita',
        source: 'alquran-cloud',
        nameAr: 'اليابانية',
        nameEn: '日本語',
        direction: 'ltr',
        hasWbw: false,
    },
    ko: {
        editionId: 'ko.korean',
        author: 'Hamid Choi',
        source: 'alquran-cloud',
        nameAr: 'الكورية',
        nameEn: '한국어',
        direction: 'ltr',
        hasWbw: false,
    },
    fa: {
        editionId: 'fa.makarem',
        author: 'Nasser Makarem Shirazi',
        source: 'alquran-cloud',
        nameAr: 'الفارسية',
        nameEn: 'فارسی',
        direction: 'rtl',
        hasWbw: false,
    },
    pt: {
        editionId: 'pt.elhayek',
        author: 'Samir El-Hayek',
        source: 'alquran-cloud',
        nameAr: 'البرتغالية',
        nameEn: 'Português',
        direction: 'ltr',
        hasWbw: false,
    },
    it: {
        editionId: 'it.piccardo',
        author: 'Hamza Roberto Piccardo',
        source: 'alquran-cloud',
        nameAr: 'الإيطالية',
        nameEn: 'Italiano',
        direction: 'ltr',
        hasWbw: false,
    },
    nl: {
        editionId: 'nl.leemhuis',
        author: 'Fred Leemhuis',
        source: 'alquran-cloud',
        nameAr: 'الهولندية',
        nameEn: 'Nederlands',
        direction: 'ltr',
        hasWbw: false,
    },
    pl: {
        editionId: 'pl.bielawskiego',
        author: 'Józef Bielawski',
        source: 'alquran-cloud',
        nameAr: 'البولندية',
        nameEn: 'Polski',
        direction: 'ltr',
        hasWbw: false,
    },
    th: {
        editionId: 'th.thai',
        author: 'Society of Quran Translation',
        source: 'alquran-cloud',
        nameAr: 'التايلاندية',
        nameEn: 'ไทย',
        direction: 'ltr',
        hasWbw: false,
    },
    sw: {
        editionId: 'sw.barwani',
        author: 'Ali Muhsin Al-Barwani',
        source: 'alquran-cloud',
        nameAr: 'السواحيلية',
        nameEn: 'Kiswahili',
        direction: 'ltr',
        hasWbw: false,
    },
    ha: {
        editionId: 'ha.gumi',
        author: 'Abubakar Mahmoud Gumi',
        source: 'alquran-cloud',
        nameAr: 'الهوسا',
        nameEn: 'Hausa',
        direction: 'ltr',
        hasWbw: false,
    },
    so: {
        editionId: 'so.abduh',
        author: 'Abdullah Hasan Abu Yahiya',
        source: 'alquran-cloud',
        nameAr: 'الصومالية',
        nameEn: 'Soomaali',
        direction: 'ltr',
        hasWbw: false,
    },
    ku: {
        editionId: 'ku.asan',
        author: 'Muhammad Asan',
        source: 'alquran-cloud',
        nameAr: 'الكردية',
        nameEn: 'Kurdî',
        direction: 'rtl',
        hasWbw: false,
    },
    bs: {
        editionId: 'bs.korkut',
        author: 'Besim Korkut',
        source: 'alquran-cloud',
        nameAr: 'البوسنية',
        nameEn: 'Bosanski',
        direction: 'ltr',
        hasWbw: false,
    },
    sq: {
        editionId: 'sq.ahmeti',
        author: 'Sherif Ahmeti',
        source: 'alquran-cloud',
        nameAr: 'الألبانية',
        nameEn: 'Shqip',
        direction: 'ltr',
        hasWbw: false,
    },
    uz: {
        editionId: 'uz.sodik',
        author: 'Muhammad Sodik Muhammad Yusuf',
        source: 'alquran-cloud',
        nameAr: 'الأوزبكية',
        nameEn: "O'zbekcha",
        direction: 'ltr',
        hasWbw: false,
    },
    si: {
        editionId: 'si.naseemismail',
        author: 'Naseem Ismail',
        source: 'alquran-cloud',
        nameAr: 'السنهالية',
        nameEn: 'සිංහල',
        direction: 'ltr',
        hasWbw: false,
    },
    am: {
        editionId: 'am.sadiq',
        author: 'Muhammed Sadiq',
        source: 'alquran-cloud',
        nameAr: 'الأمهرية',
        nameEn: 'አማርኛ',
        direction: 'ltr',
        hasWbw: false,
    },

    // === اللغات المتاحة عبر FawazAhmed API فقط ===
    vi: {
        editionId: 'vie_hassanabdulkari',
        author: 'Hassan Abdul Karim',
        source: 'fawazahmed',
        nameAr: 'الفيتنامية',
        nameEn: 'Tiếng Việt',
        direction: 'ltr',
        hasWbw: false,
    },
    yo: {
        editionId: 'yor_shaykhaburahima',
        author: 'Shaykh Abu Rahim',
        source: 'fawazahmed',
        nameAr: 'اليوروبا',
        nameEn: 'Yorùbá',
        direction: 'ltr',
        hasWbw: false,
    },
    kk: {
        editionId: 'kaz_khalifahaltai',
        author: 'Khalifa Altay',
        source: 'fawazahmed',
        nameAr: 'الكازاخية',
        nameEn: 'Қазақша',
        direction: 'ltr',
        hasWbw: false,
    },
    om: {
        editionId: 'orm_ghaliapapurapag',
        author: 'Ghali Apapurapaga',
        source: 'fawazahmed',
        nameAr: 'الأورومو',
        nameEn: 'Afaan Oromoo',
        direction: 'ltr',
        hasWbw: false,
    },
    rw: {
        editionId: 'kin_rwandamuslimsas',
        author: 'Rwanda Muslims Association',
        source: 'fawazahmed',
        nameAr: 'الرواندية',
        nameEn: 'Kinyarwanda',
        direction: 'ltr',
        hasWbw: false,
    },
    // التغالوغ - غير متوفرة حالياً في أي API
    tl: {
        editionId: '',
        author: '',
        source: 'fawazahmed',
        nameAr: 'التغالوغ',
        nameEn: 'Filipino',
        direction: 'ltr',
        hasWbw: false,
    },
};

/**
 * الحصول على معلومات الترجمة لرمز لغة معين
 */
export function getEditionInfo(langCode: string): EditionInfo | undefined {
    return TRANSLATION_EDITIONS[langCode];
}

/**
 * الحصول على رابط التحميل الكامل من Al Quran Cloud API
 */
export function getAlQuranCloudUrl(editionId: string): string {
    return `https://api.alquran.cloud/v1/quran/${editionId}`;
}

/**
 * الحصول على رابط سورة من FawazAhmed API
 * الإصدارات في الفرع 1 مقسمة حسب السور
 */
export function getFawazAhmedSurahUrl(editionId: string, surahNumber: number): string {
    // تحويل underscore إلى hyphen (الصيغة المستخدمة في مسارات الملفات)
    const pathId = editionId.replace(/_/g, '-');
    return `https://raw.githubusercontent.com/fawazahmed0/quran-api/1/editions/${pathId}/${surahNumber}.json`;
}

/**
 * التحقق مما إذا كانت الترجمة متاحة للتحميل
 */
export function isTranslationAvailable(langCode: string): boolean {
    const info = TRANSLATION_EDITIONS[langCode];
    if (!info) return false;
    if (info.source === 'fawazahmed' && !info.editionId) return false;
    return true;
}

/**
 * التحقق مما إذا كانت اللغة تدعم معاني الكلمات (WbW)
 */
export function hasWbwSupport(langCode: string): boolean {
    const info = TRANSLATION_EDITIONS[langCode];
    return info?.hasWbw === true;
}

/**
 * قائمة رموز اللغات المتاحة للتحميل
 */
export const AVAILABLE_TRANSLATION_CODES: string[] = Object.keys(TRANSLATION_EDITIONS).filter(
    code => isTranslationAvailable(code)
);