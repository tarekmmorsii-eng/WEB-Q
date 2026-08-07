/*
 * Fix ALL Untranslated UI Keys (SAFE - Final Pass)
 * ------------------------------------------------
 * Translates every remaining untranslated UI key across all languages.
 * Uses JSON.parse/stringify (100% Unicode-safe).
 * Only updates values that still match the English reference.
 */

const fs = require('fs');
const path = require('path');

const I18N_DIR = path.join(__dirname, '..', 'src', 'assets', 'i18n');

// Master translation map: key -> { langCode: translation }
const T = {
    download: {
        ms: "Muat turun", ur: "ڈاؤن لوڈ", ru: "Загрузить", sw: "Pakua", zh: "下载",
        ko: "다운로드", sq: "Shkarko", uz: "Yuklab olish", kk: "Жүктеу", ku: "داگرتن",
        vi: "Tải xuống", tl: "I-download", ta: "பதிவிறக்கு", si: "බාගත කරන්න",
        am: "አውርድ", yo: "Gbá", om: "Buusi", rw: "Gura", bs: "Preuzmi",
        tr: "İndir", fr: "Télécharger", es: "Descargar", de: "Herunterladen",
        id: "Unduh", ha: "Sauke", hi: "डाउनलोड", ja: "ダウンロード"
    },
    playAyah: {
        ms: "Mainkan Ayat", ur: "آیت چلائیں", ru: "Воспроизвести аят", sw: "Cheza Aya", zh: "播放节经文",
        ko: "구절 재생", sq: "Luaj Ajetin", uz: "Oyatni ijro etish", kk: "Аятты ойнату", ku: "لێدانی ئایەت",
        vi: "Phát câu Kinh", tl: "I-play ang Talata", ta: "வசனத்தை இயக்கு", si: "පද්‍යය වයන්න",
        am: "አንቀጹን አጫውት", yo: "Ìrín Ayah", om: "Taphsi Aayyaa", rw: "Gukina Ige", bs: "Pokreni ajet",
        tr: "Ayeti Çal", fr: "Lire l'ayat", es: "Reproducir ayat", de: "Aya abspielen",
        id: "Putar Ayat", ha: "Kunna Aya", hi: "आयत चलाएं", ja: "節を再生"
    },
    active: {
        ms: "Aktif", ur: "فعال", ru: "Активно", sw: "Hai", zh: "已激活",
        ko: "활성화됨", sq: "Aktiv", uz: "Faol", kk: "Белсенді", ku: "چالاک",
        vi: "Đã bật", tl: "Aktibo", ta: "செயலில்", si: "සක්‍රීය",
        am: "ንቁ", yo: "Ṣiṣẹ", om: "Hojjetu", rw: "Gikora", bs: "Aktivno",
        tr: "Aktif"
    },
    saving: {
        ms: "Menyimpan", ur: "محفوظ ہو رہا ہے", ru: "Сохранение", sw: "Inahifadhiwa", zh: "保存中",
        ko: "저장 중", sq: "Po ruhet", uz: "Saqlanmoqda", kk: "Сақталуда", ku: "پاشەکەوت دەکرێت",
        vi: "Đang lưu", tl: "Nagsasagip", ta: "சேமிக்கிறது", si: "සුරැකෙමින්",
        am: "በማስቀመጥ ላይ", yo: "Ìpamọ́", om: "Olma'anee", rw: "Kubika", bs: "Spremanje",
        tr: "Kaydediliyor"
    },
    arabicLangName: {
        ms: "Bahasa Arab", ur: "عربی", ru: "Арабский", sw: "Kiarabu", zh: "阿拉伯语",
        ko: "아랍어", sq: "Arabisht", uz: "Arab", kk: "Араб", ku: "عەرەبی",
        vi: "Tiếng Ả Rập", tl: "Arabe", ta: "அரபு", si: "අරාබි",
        am: "አረብኛ", yo: "Larubawa", om: "Afaan Arabaa", rw: "Icyarabu", bs: "Arapski",
        tr: "Arapça"
    },
    meaningsWord: {
        ms: "Makna", ur: "معنی", ru: "Значения", sw: "Maana", zh: "释义",
        ko: "의미", sq: "Kuptime", uz: "Ma'nolar", kk: "Мағыналар", ku: "واتاکان",
        vi: "Ý nghĩa", tl: "Kahulugan", ta: "பொருள்கள்", si: "තේරුම්",
        am: "ትርጉሞች", yo: "Ìtumọ̀", om: "Hiika", rw: "Ibisobanuro", bs: "Značenja",
        tr: "Anlamlar"
    },
    translationNotSupported: {
        ms: "Terjemahan tidak tersedia buat masa ini", ur: "ترجمہ فی الحال دستیاب نہیں", ru: "Перевод в настоящее время недоступен", sw: "Tafsiri haipatikani kwa sasa", zh: "目前无翻译",
        ko: "현재 번역을 사용할 수 없습니다", sq: "Përkthimi nuk është i disponueshëm aktualisht", uz: "Tarjima hozirda mavjud emas", kk: "Аударма қазіргі уақытта қолжетімсіз", ku: "وەرگێڕان لە ئێستادا بەردەست نییە",
        vi: "Bản dịch hiện không khả dụng", tl: "Hindi available ang salin sa kasalukuyan", ta: "மொழிபெயர்ப்பு தற்போது கிடைக்கவில்லை", si: "පරිවර්තනය දැනට ලබා ගත නොහැක",
        am: "ትርጉም በአሁኑ ጊዜ የለም", yo: "Ìtumọ̀ kò sí lọ́wọ́lọ́wọ́", om: "Hiikni yeroo ammaa hin jiru", rw: "Ubusobanuro ntabwo buboneka kuri iki gihe", bs: "Prijevod trenutno nije dostupan",
        tr: "Çeviri şu anda mevcut değil"
    },
    basmallah: {
        ms: "Basmalah", ur: "بسم اللہ", sw: "Basmalah", zh: "泰斯米",
        ko: "바스말라", sq: "Besmela", uz: "Basmala", kk: "Басмала", ku: "بەسمەلە",
        vi: "Basmalah", tl: "Basmalah", am: "በስመ", yo: "Basmalah", om: "Basmala", rw: "Basmalah", bs: "Basmala",
        tr: "Besmele", fr: "Basmala", es: "Basmala", de: "Basmala", ha: "Basmala"
    },
    exportHeaderJuz: {
        ms: "Juz", ur: "جزء", sw: "Juzu", zh: "卷",
        ko: "주즈", sq: "Xhuz", uz: "Juz", kk: "Джуз", ku: "بەش",
        vi: "Juz", tl: "Juz", am: "ክፍል", yo: "Juz", om: "Juz", rw: "Juz", bs: "Džuz",
        tr: "Cüz", fr: "Juz", es: "Yuz", de: "Juz", ha: "Juz"
    },
    hizb: {
        ms: "Hizb", ur: "حزب", sw: "Hizb", zh: "赫兹布",
        ko: "히즈브", sq: "Hizb", uz: "Hizb", kk: "Хизб", ku: "حیزب",
        vi: "Hizb", tl: "Hizb", am: "ሐዝብ", yo: "Hizb", om: "Hizb", rw: "Hizb", bs: "Hizb",
        tr: "Hizb", fr: "Hizb", es: "Hizb", de: "Hizb", ha: "Hizb"
    },
    hizbType: {
        ms: "Hizb", ur: "حزب", sw: "Hizb", zh: "赫兹布",
        ko: "히즈브", sq: "Hizb", uz: "Hizb", kk: "Хизб", ku: "حیزب",
        vi: "Hizb", tl: "Hizb", am: "ሐዝብ", yo: "Hizb", om: "Hizb", rw: "Hizb", bs: "Hizb",
        tr: "Hizb", fr: "Hizb", es: "Hizb", de: "Hizb", ha: "Hizb"
    },
    juzType: {
        ms: "Juz", ur: "جزء", sw: "Juzu", zh: "卷",
        ko: "주즈", sq: "Xhuz", uz: "Juz", kk: "Джуз", ku: "بەش",
        vi: "Juz", tl: "Juz", am: "ክፍል", yo: "Juz", om: "Juz", rw: "Juz", bs: "Džuz",
        tr: "Cüz", fr: "Juz", es: "Yuz", de: "Juz", ha: "Juz"
    },
    juz: {
        ms: "Juz", ur: "جزء", sw: "Juzu", zh: "卷",
        ko: "주즈", sq: "Xhuz", uz: "Juz", kk: "Джуз", ku: "بەش",
        vi: "Juz", tl: "Juz", am: "ክፍል", yo: "Juz", om: "Juz", rw: "Juz", bs: "Džuz",
        tr: "Cüz", fr: "Juz", es: "Yuz", de: "Juz", ha: "Juz", id: "Juz"
    },
    surah: {
        ms: "Surah", ur: "سورۃ", sw: "Sura", zh: "苏拉",
        ko: "수라", sq: "Sure", uz: "Sura", kk: "Сүре", ku: "سوورەت",
        vi: "Surah", tl: "Surah", am: "ሱራ", yo: "Surah", om: "Suura", rw: "Sura", bs: "Sura",
        tr: "Sure", fr: "Sourate", es: "Sura", de: "Sure", ha: "Sura", vi2: "Chương"
    },
    surahPrefix: {
        ms: "Surah", ur: "سورۃ", sw: "Sura", zh: "苏拉",
        ko: "수라", sq: "Sure", uz: "Sura", kk: "Сүре", ku: "سوورەت",
        vi: "Surah", tl: "Surah", am: "ሱራ", yo: "Surah", om: "Suura", rw: "Sura", bs: "Sura",
        tr: "Sure", fr: "Sourate", es: "Sura", de: "Sure", ha: "Sura"
    },
    notificationJuzHizb: {
        ms: "Juz & Hizb", ur: "جزء و حزب", sw: "Juzu & Hizb", zh: "卷和赫兹布",
        ko: "주즈 & 히즈브", sq: "Xhuz & Hizb", uz: "Juz va Hizb", kk: "Джуз & Хизб", ku: "بەش و حیزب",
        vi: "Juz & Hizb", tl: "Juz & Hizb", am: "ክፍል & ሐዝብ", yo: "Juz & Hizb", om: "Juz fi Hizb", rw: "Juz & Hizb", bs: "Džuz & Hizb",
        tr: "Cüz & Hizb", fr: "Juz & Hizb", es: "Yuz & Hizb", de: "Juz & Hizb", ha: "Juz & Hizb"
    },
    mushafAlMurajaa: {
        ms: "Mushaf Al-Murajaa", ur: "مصحف المراجعہ", sw: "Mushaf Al-Murajaa", zh: "复习本",
        ko: "무샤프 알-무라자", sq: "Mushaf Al-Murajaa", uz: "Mushaf Al-Murajaa", kk: "Мушаф Ал-Муражаа", ku: "مووشەفی موراجاع",
        vi: "Mushaf Al-Murajaa", tl: "Mushaf Al-Murajaa", am: "ሙሻፍ አል-ሙራጃ", yo: "Mushaf Al-Murajaa", om: "Mushaf Al-Murajaa", rw: "Mushaf Al-Murajaa", bs: "Mushaf Al-Murajaa",
        tr: "Mushaf Al-Murajaa", fr: "Mushaf Al-Murajaa", es: "Mushaf Al-Murajaa", de: "Mushaf Al-Murajaa", ha: "Mushaf Al-Murajaa"
    },
    platformAnalytics: {
        ms: "Analitik Platform MyQuran", ur: "مائی قرآن پلیٹ فارم تجزیات", sw: "Uchambuzi wa Jukwaa la MyQuran", zh: "我的古兰经平台分析",
        ko: "MyQuran 플랫폼 분석", sq: "Analitika e Platformës MyQuran", uz: "MyQuran Platform Tahlili", kk: "MyQuran платформасын талдау", ku: "شیکردنەوەی پلاتفۆڕمی MyQuran",
        vi: "Phân tích Nền tảng MyQuran", tl: "Analytics ng Platform na MyQuran", am: "የMyQuran መድረክ ትንተና", yo: "Ìtupalẹ̀ Platform MyQuran", om: "Qabiyyee MyQuran", rw: "Ibyerekeye Ikibanza MyQuran", bs: "MyQuran Platform Analitika",
        tr: "MyQuran Platform Analitiği", ta: "MyQuran தளப் பகுப்பாய்வு", si: "MyQuran වේදිකා විශ්ලේෂණය"
    },
    downloadCompleteMsg: {
        ms: "✅ {name} - {author} ({count} ayat dengan makna perkataan)", ur: "✅ {name} - {author} ({count} آیات مع الفاظ کے معنی)", sw: "✅ {name} - {author} ({count} ayah na maana za maneno)", zh: "✅ {name} - {author} ({count} 节经文含词汇释义)",
        ko: "✅ {name} - {author} ({count}개 구절, 단어 의미 포함)", sq: "✅ {name} - {author} ({count} ajete me kuptimet e fjalëve)", uz: "✅ {name} - {author} ({count} oyat so'z ma'nolari bilan)", kk: "✅ {name} - {author} ({count} аят, сөздердің мағынасымен)", ku: "✅ {name} - {author} ({count} ئایەت بە واتای وشەکانەوە)",
        vi: "✅ {name} - {author} ({count} câu Kinh có ý nghĩa từ)", tl: "✅ {name} - {author} ({count} talata na may kahulugan ng salita)", am: "✅ {name} - {author} ({count} ንጥፎች ቃላት ትርጉም አላቸው)", yo: "✅ {name} - {author} ({count} ayah pẹlu itumọ ọrọ)", om: "✅ {name} - {author} ({count} aayyaa hiika jechootaa)", rw: "✅ {name} - {author} ({count} amagambo y'ibisobanuro)", bs: "✅ {name} - {author} ({count} ajeta sa značenjima riječi)",
        tr: "✅ {name} - {author} ({count} ayet, kelime anlamlarıyla)", fr: "✅ {name} - {author} ({count} ayats avec significations des mots)", es: "✅ {name} - {author} ({count} ayats con significados de palabras)", de: "✅ {name} - {author} ({count} Ayas mit Wortbedeutungen)", ha: "✅ {name} - {author} ({count} ayoyi da ma'anar kalmomi)", ru: "✅ {name} - {author} ({count} аятов со значениями слов)"
    },
    downloadingTranslation: {
        ms: "Menterjemah Ayat", ur: "آیات کا ترجمہ", sw: "Kutafsiri Aya", zh: "翻译经文",
        ko: "구절 번역 중", sq: "Përkthimi i ajeteve", uz: "Oyatlarni tarjima qilish", kk: "Аяттарды аудару", ku: "وەرگێڕانی ئایەتکان",
        vi: "Đang dịch câu Kinh", tl: "Isinasalin ang Talata", am: "ንጥፎችን መተርጎም", yo: "Ìtumọ̀ Ayah", om: "Hiikkaa Aayyaa", rw: "Guhindura Ige", bs: "Prevod ajeta",
        tr: "Ayetleri çevirme", fr: "Traduire les ayats", es: "Traducir ayats", de: "Ayas übersetzen", ha: "Fassara Ayoyi", ru: "Перевод аятов"
    },
    downloadingMeanings: {
        ms: "Makna Perkataan", ur: "الفاظ کے معنی", sw: "Maana za Maneno", zh: "词汇释义",
        ko: "단어 의미", sq: "Kuptimet e fjalëve", uz: "So'z ma'nolari", kk: "Сөздердің мағынасы", ku: "واتاکانی وشەکان",
        vi: "Ý nghĩa từ", tl: "Kahulugan ng Salita", am: "ቃላት ትርጉም", yo: "Ìtumọ̀ Ọrọ", om: "Hiika Jechootaa", rw: "Ibisobanuro by'amagambo", bs: "Značenja riječi",
        tr: "Kelime anlamları", fr: "Significations des mots", es: "Significados de palabras", de: "Wortbedeutungen", ha: "Ma'anar kalmomi", ru: "Значения слов"
    },
    bookmark: {
        bs: "Zabilješka", ku: "نیشانە"
    },
    coolWhite: {
        bs: "Hladno bijelo", ku: "سپی سارد"
    },
    pureBlack: {
        bs: "Čisto crno", ku: "ڕەشی پەتی"
    },
    softCream: {
        bs: "Mekana krem", ku: "کڕێمی نەرم"
    },
    warmDark: {
        bs: "Toplo tamno", ku: "تاریکی گەرم"
    },
    darkMode: {
        bs: "Tamno"
    },
    lightMode: {
        bs: "Svijetlo"
    },
    firstRub: {
        bs: "Prvi rub"
    },
    secondRub: {
        bs: "Drugi rub"
    },
    thirdRub: {
        bs: "Treći rub"
    },
    fourthRub: {
        bs: "Četvrti rub"
    },
    rubType: {
        bs: "Rub", ha: "Rub"
    },
    hideRandomAyahs: {
        bs: "Slučajni ajeti"
    },
    hideRandomWords: {
        bs: "Slučajne riječi"
    },
    mutashabihatIndex: {
        bs: "Indeks sličnosti", sw: "Hisa ya Kufanana", tl: "Index ng Pagkatulad", ku: "پێڕستی هاوشێوەکان"
    },
    notificationManagerTitle: {
        bs: "Menadžer obavještenja"
    },
    pageBookmarks: {
        bs: "Zabilješke stranica"
    },
    rateAyah: {
        bs: "Ocijeni ajet", tl: "I-rate ang Talata"
    },
    rateMemorization: {
        bs: "Ocijeni memorisanje", tl: "I-rate ang Pagkabisado", ku: "هەڵسەنگاندنی بیرکردنەوە"
    },
    rateSurah: {
        ms: "Nilai Surah", ha: "Kimanta Sura"
    },
    saveAyah: {
        bs: "Spasi ajet", tl: "I-save ang Talata"
    },
    startPoint: {
        bs: "Početna tačka", tl: "Simula"
    },
    stopAlarm: {
        bs: "Zaustavi alarm", ku: "وەستاندنی ئاگادارکردنەوە"
    },
    stopSignsLabel: {
        bs: "Znakovi zaustavljanja"
    },
    toggleLastWord: {
        bs: "Zadnja riječ"
    },
    verseBookmarks: {
        bs: "Zabilješke ajeta", ku: "نیشانەکانی ئایەت"
    },
    verseBookmarksSection: {
        bs: "Zabilješke ajeta", ku: "نیشانەکانی ئایەت"
    },
    verseCalculatorTitle: {
        bs: "Kalkulator ajeta", ku: "ژمێرەری ئایەت", tl: "Calculator ng Talata"
    },
    matchedCount: {
        ha: "wasu", ku: "هاوبەشەکان"
    },
    addMutashabihat: {
        ha: "Ƙara Ayoyin Kamanni"
    },
    countryIndonesia: {
        ms: "Indonesia", ha: "Indonesiya", sw: "Indonesia", es: "Indonesia", vi: "Indonesia", tl: "Indonesia", yo: "Indonesia", id: "Indonesia"
    },
    countryJordan: {
        ms: "Jordan", ha: "Jordan", sw: "Yordani", vi: "Jordan", tl: "Jordan", yo: "Jordani", bs: "Jordan"
    },
    countrySaudi: {
        ha: "Saudiyya", sw: "Saudi", yo: "Saudi Arabia"
    },
    countryMorocco: {
        tl: "Morocco"
    },
    toAyah: {
        ha: "Zuwa Aya"
    },
    searchSurah: {
        ha: "Neman sura..."
    },
    error: {
        es: "Error", tl: "Error"
    },
    similarBadge: {
        es: "Parecido"
    },
    page: {
        fr: "Page"
    },
    notifications: {
        fr: "Notifications", ku: "ئاگادارکردنەوەکان"
    },
    inAppNotifModalTitle: {
        fr: "Notifications", ku: "ئاگادارکردنەوەکان"
    },
    themeName_nature: {
        fr: "Nature"
    },
    themeName_papyrus: {
        fr: "Papyrus", de: "Papyrus"
    },
    startPagePlaceholder: {
        de: "Start"
    },
    index: {
        de: "Index", tl: "Index"
    },
    indexTitle: {
        de: "Index", tl: "Index"
    },
    ayahText: {
        de: "Aya", vi: "Câu Kinh", yo: "Ayah", tl: "Talata"
    },
    hideRatedVerses: {
        zh: "隐藏已评级经文："
    },
    fullscreen: {
        ku: "پڕاوپڕی شاشە"
    },
    languages: {
        ku: "زمانەکان"
    },
    lineSpacingLabel: {
        ku: "بۆشایی هێڵەکان"
    },
    moreSettings: {
        ku: "ڕێکخستنەکانی تر"
    },
    notRated: {
        ku: "هەڵنەسەنگاو"
    },
    settings: {
        ku: "ڕێکخستنەکان"
    },
    settingsTitle: {
        ku: "ڕێکخستنەکان"
    },
    textBrightness: {
        ku: "ڕووناکی دەق"
    },
    guideIndex: {
        de: "Index", tl: "Index"
    },
    guideQuranUI: {
        ha: "Maɓallan Kamanni da Kimanta"
    },
    alarmMode: {
        tl: "🔔 Yanayin Ƙararrawa"
    },
    pageFlipSound: {
        tl: "Tunog ng Pagliko ng Pahina"
    },
    presetIslamic: {
        tl: "Default (Islamic)"
    },
    testAlarm: {
        tl: "Subukan ang Ƙararrawa 🔔"
    },
    tinyUpdate: {
        tl: "Update"
    },
    memorizationStatsTitle: {
        tl: "Istatistika ng Pagkabisado"
    },
    warmBeige: {
        tl: "Mainit na Beige"
    },
    lineSpacing: {
        tl: "Espasyo ng Linya"
    },
    sunday: {
        yo: "Ọjọ́ Àìkú"
    },
    monday: {
        yo: "Ọjọ́ Ajé"
    },
    wednesday: {
        yo: "Ọjọ́ Ẹrìn"
    },
    friday: {
        yo: "Ọjọ́ Ẹtì"
    },
    themeName_lavender: {
        ms: "Lavender"
    }
};

function processLang(langCode) {
    const file = path.join(I18N_DIR, `${langCode}.json`);
    const raw = fs.readFileSync(file, 'utf8');
    const obj = JSON.parse(raw);
    const enRaw = fs.readFileSync(path.join(I18N_DIR, 'en.json'), 'utf8');
    const enObj = JSON.parse(enRaw);

    let updated = 0;
    for (const [key, langs] of Object.entries(T)) {
        if (!(langCode in langs)) continue;
        const newValue = langs[langCode];
        // Only update if current value matches English (still untranslated)
        if (obj[key] === enObj[key]) {
            obj[key] = newValue;
            updated++;
        }
    }

    if (updated === 0) {
        console.log(`  ${langCode}: nothing to update.`);
        return 0;
    }

    fs.writeFileSync(file, JSON.stringify(obj, null, 2), 'utf8');
    console.log(`  ${langCode}: translated ${updated} key(s).`);
    return updated;
}

console.log('Translating ALL remaining untranslated UI keys...\n');

const LANGS = ['id','ms','ur','tr','ha','fr','es','de','ru','sw','zh','ko','ja','bs','sq','uz','kk','ku','vi','tl','hi','ta','si','am','yo','om','rw'];

let totalUpdated = 0;
for (const lang of LANGS) {
    totalUpdated += processLang(lang);
}

console.log(`\n✅ Done. Total keys translated: ${totalUpdated}`);
console.log('Run audit again to verify the final state.');