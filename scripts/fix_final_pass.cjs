/*
 * Final Pass - Cover ALL Remaining Untranslated Keys (SAFE)
 * ---------------------------------------------------------
 * Handles: hizb, hizbType, juz, juzType, surah, surahPrefix,
 *          mushafAlMurajaa, exportHeaderJuz, notificationJuzHizb,
 *          countryIndonesia, countryJordan, error, guideIndex, index, indexTitle,
 *          themeName_*, and ALL remaining Tour keys for om & rw.
 * Uses JSON.parse/stringify (100% Unicode-safe).
 */

const fs = require('fs');
const path = require('path');

const I18N_DIR = path.join(__dirname, '..', 'src', 'assets', 'i18n');

// Universal translations (same in most languages - Islamic terms)
const ISLAMIC_TERMS = {
    hizb: "Hizb",
    hizbType: "Hizb",
    juz: "Juz",
    juzType: "Juz",
    surah: "Surah",
    surahPrefix: "Surah",
    mushafAlMurajaa: "Mushaf Al-Murajaa",
    exportHeaderJuz: "Juz",
    notificationJuzHizb: "Juz & Hizb",
    rubType: "Rub",
    basmallah: "Basmalah"
};

// Country names by language
const COUNTRIES = {
    countryIndonesia: {
        id: "Indonesia", ms: "Indonesia", ur: "انڈونیشیا", tr: "Endonezya", ha: "Indonesiya",
        fr: "Indonésie", es: "Indonesia", de: "Indonesien", ru: "Индонезия", sw: "Indonesia",
        zh: "印度尼西亚", ko: "인도네시아", ja: "インドネシア", bs: "Indonezija", sq: "Indonezia",
        uz: "Indoneziya", kk: "Индонезия", ku: "ئەندەنیسیا", vi: "Indonesia", tl: "Indonesia",
        hi: "इंडोनेशिया", ta: "இந்தோனேசியா", si: "ඉන්දුනීසියාව", am: "ኢንዶኔዢያ", yo: "Indonesia",
        om: "Indoneeshiyaa", rw: "Indonesiya"
    },
    countryJordan: {
        id: "Yordania", ms: "Jordan", ur: "اردن", tr: "Ürdün", ha: "Jordan",
        fr: "Jordanie", es: "Jordania", de: "Jordanien", ru: "Иордания", sw: "Yordani",
        zh: "约旦", ko: "요르단", ja: "ヨルダン", bs: "Jordan", sq: "Jordania",
        uz: "Iordaniya", kk: "Иордания", ku: "ئوردن", vi: "Jordan", tl: "Jordan",
        hi: "जॉर्डन", ta: "ஜோர்டான்", si: "ජෝර්දානය", am: "ጆርዳን", yo: "Jordani",
        om: "Jordani", rw: "Yorudani"
    },
    countrySaudi: {
        ha: "Saudiyya", sw: "Saudi Arabia", yo: "Saudi Arabia",
        tl: "Saudi Arabia", vi: "Ả Rập Xê Út"
    },
    countryMorocco: {
        tl: "Morocco", vi: "Maroc"
    }
};

// Other keys
const OTHER = {
    error: { es: "Error", tl: "Error" },
    index: { de: "Index", tl: "Index" },
    indexTitle: { de: "Index", tl: "Index" },
    guideIndex: { de: "Index", tl: "Index" },
    rateSurah: { bs: "Ocijeni suru", ms: "Nilai Surah", ha: "Kimanta Sura" },
    bookmark: { tl: "Bookmark" },
    exportHeaderPage: { fr: "Page" },
    page: { fr: "Page" },
    notifications: { fr: "Notifications" },
    inAppNotifModalTitle: { fr: "Notifications" },
    themeName_nature: { fr: "Nature" },
    themeName_papyrus: { fr: "Papyrus", de: "Papyrus" },
    themeName_lavender: { ms: "Lavender" },
    startPagePlaceholder: { de: "Start" },
    downloadCompleteMsg: {
        ta: "✅ {name} - {author} ({count} வசனங்கள், சொற்களின் பொருளுடன்)",
        si: "✅ {name} - {author} ({count} පද්‍ය, වචන තේරුම් සමඟ)"
    },
    downloadingTranslation: {
        ta: "வசனங்களை மொழிபெயர்க்கிறது",
        si: "පද්‍ය පරිවර්තනය කරමින්"
    },
    downloadingMeanings: {
        ta: "சொற்களின் பொருள்கள்",
        si: "වචන තේරුම්"
    },
    hideRatedVerses: {
        om: "Ayayota gadiisiisu:",
        rw: "Hisha amagambo y'ipimirwa:"
    },
    ayahText: {
        yo: "Ayah"
    },
    lineSpacingLabel: {
        tl: "Espasyo ng Linya"
    },
    presetIslamic: {
        tl: "Default (Islamic)"
    },
    tinyUpdate: {
        tl: "Update"
    },
    warmDark: {
        tl: "Mainit na Madilim"
    },
    mutashabihatIndex: {
        ha: "Index na Kamanni"
    },
    platformAnalytics: {
        ha: "Analitik na MyQuran Platform"
    }
};

// Tour keys for om & rw (force update)
const TOUR_OM_RW = {
    om: {
        tourAssessment: "Safuu caqasuu gadiisi:",
        tourAyahColorsDescText: "Halli lakkoofsa aayyaa akka safuu caqasuu atii qabduu jechuutti jira:",
        tourAyahNumberDescText: "Lakkoofsa aayyaarratti cuunfamuuf dalagaa olaanaa arganna:",
        tourBookmark: "Aayyaaf mallattoo galchaa",
        tourHideAyahsDescText: "As cuunfamiif gadiisi aayyaa adda addaa saffisa gadiisi hojjet:",
        tourMutashabihatDescText: "Sarara hallina jalatti lakkoofsa aayyaa Mutashabihat agarsiisa:",
        tourViewMutashabihat: "Mutashabihat aayyaa wajjin argi",
        tourMutashabihatTitle: "Beeksisaa Mutashabihat"
    },
    rw: {
        tourAssessment: "Ibyerekeye gusingiza kwibuka:",
        tourAyahColorsDescText: "Ibara ry'umubare w'ige ryahinduka ukurikije urwego rw'ibuka wageneye:",
        tourAyahNumberDescText: "Kanda k'umubare w'ige kugira ngo ubone ibijyanye byinshi:",
        tourBookmark: "Ongera ikimenyetso ku nteruro",
        tourHideAyahsDescText: "Kanda hano mu guhisha amagambo yihariye mu lpaji ukurikije ibyangombwa:",
        tourMutashabihatDescText: "Umurongo ufite ibara uri hasi y'umubare w'ige kugira ngo werekane ibyemere:",
        tourViewMutashabihat: "Reba ibyemere by'ige",
        tourMutashabihatTitle: "Ibyerekeye Ibyemere"
    }
};

function processLang(langCode) {
    const file = path.join(I18N_DIR, `${langCode}.json`);
    const raw = fs.readFileSync(file, 'utf8');
    const obj = JSON.parse(raw);
    const enRaw = fs.readFileSync(path.join(I18N_DIR, 'en.json'), 'utf8');
    const enObj = JSON.parse(enRaw);

    let updated = 0;

    // 1. Islamic terms (universal)
    for (const [key, value] of Object.entries(ISLAMIC_TERMS)) {
        if (obj[key] === enObj[key]) {
            obj[key] = value;
            updated++;
        }
    }

    // 2. Countries
    for (const [key, langs] of Object.entries(COUNTRIES)) {
        if (!(langCode in langs)) continue;
        if (obj[key] === enObj[key]) {
            obj[key] = langs[langCode];
            updated++;
        }
    }

    // 3. Other keys
    for (const [key, langs] of Object.entries(OTHER)) {
        if (!(langCode in langs)) continue;
        if (obj[key] === enObj[key]) {
            obj[key] = langs[langCode];
            updated++;
        }
    }

    // 4. Tour keys (force update for om & rw)
    if (langCode in TOUR_OM_RW) {
        for (const [key, value] of Object.entries(TOUR_OM_RW[langCode])) {
            if (obj[key] === enObj[key]) {
                obj[key] = value;
                updated++;
            }
        }
    }

    if (updated === 0) return 0;
    fs.writeFileSync(file, JSON.stringify(obj, null, 2), 'utf8');
    console.log(`  ${langCode}: translated ${updated} key(s).`);
    return updated;
}

console.log('Final pass - covering all remaining untranslated keys...\n');

const LANGS = ['id','ms','ur','tr','ha','fr','es','de','ru','sw','zh','ko','ja','bs','sq','uz','kk','ku','vi','tl','hi','ta','si','am','yo','om','rw'];

let total = 0;
for (const lang of LANGS) total += processLang(lang);

console.log(`\n✅ Done. Total keys translated: ${total}`);