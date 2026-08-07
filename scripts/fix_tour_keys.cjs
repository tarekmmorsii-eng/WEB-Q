/*
 * Fix Tour Keys - Welcome Tour Translations (SAFE)
 * ------------------------------------------------
 * Translates the welcome tour (Tour) keys that are still in English
 * for: zh, rw, om, bs, ku, ms, ha, de
 * Uses JSON.parse/stringify (100% Unicode-safe).
 */

const fs = require('fs');
const path = require('path');

const I18N_DIR = path.join(__dirname, '..', 'src', 'assets', 'i18n');

// Tour translations for each language
const TOUR_TRANSLATIONS = {
    zh: {
        tourAssessment: "记忆强度评级：",
        tourAyahColorsDescText: "节经文编号的颜色会根据您设置的记忆强度而变化：",
        tourAyahNumberDescText: "点击节经文编号以访问高级功能：",
        tourBookmark: "为该节经文添加书签",
        tourHideAyahsDescText: "点击此处根据多项高级标准隐藏页面中的特定经文以测试记忆：",
        tourMutashabihatDescText: "节经文编号下方会出现一条彩色线以指示相似经文：",
        tourViewMutashabihat: "查看与该节经文的相似经文"
    },
    rw: {
        tourAyahNumberTitle: "Umubare w'Ige",
        tourWelcomeTitle: "Ngirwanire",
        tourWelcomeSubtitle: "Tuzamenye uko yakorwa",
        tourWelcomeDesc: "Tugiye kumurikira imiterere y'urubuga n'ibyoroshye byaryo.",
        tourBetaNote: "Icyitonderwa: Uyu mushinga uri mu rwego rwo kugeragezwa.",
        tourStartAction: "Hita tugaragare",
        tourSkipAction: "Hisha",
        tourLongPressTitle: "Kanda ibyagatiyze"
    },
    om: {
        tourAyahNumberTitle: "Lakkoofsa Aayyaa",
        tourWelcomeTitle: "Baga nagaan dhuftan",
        tourWelcomeSubtitle: "Akkaataa itti fayyadama",
        tourWelcomeDesc: "Barbaachisummaa saganta kanaa fi akkamitti akka to'annu si qajeelcha.",
        tourBetaNote: "Iyyadhaa: Saganta kun yeroo ammaa qorannoo jira.",
        tourStartAction: "Eegalii",
        tourSkipAction: "Darbi",
        tourLongPressTitle: "Dhoobbii dabarsaa"
    },
    bs: {
        tourAyahNumberTitle: "Broj ajeta",
        tourLastWordTitle: "Zadnja riječ",
        tourMutashabihatTitle: "Upozorenja o sličnim ajetima"
    },
    ku: {
        tourAyahNumberTitle: "ژمارەی ئایەت",
        tourMutashabihatTitle: "ئاگادارکردنەوەکانی هاوشێوەکان"
    },
    ms: {
        tourAyahNumberTitle: "Nombor Ayat"
    },
    ha: {
        tourMutashabihatTitle: "Faɗar Ayoyin Kamanni"
    },
    de: {
        tourMedium: "Mittel"
    }
};

function processLang(lang, keysToAdd) {
    const file = path.join(I18N_DIR, `${lang}.json`);
    const raw = fs.readFileSync(file, 'utf8');
    const obj = JSON.parse(raw);
    const enRaw = fs.readFileSync(path.join(I18N_DIR, 'en.json'), 'utf8');
    const enObj = JSON.parse(enRaw);

    let updated = 0;
    for (const [key, value] of Object.entries(keysToAdd)) {
        // Only update if current value matches English (still untranslated)
        if (obj[key] === enObj[key]) {
            obj[key] = value;
            updated++;
        }
    }

    if (updated === 0) {
        console.log(`  ${lang}: no tour keys to update.`);
        return;
    }

    fs.writeFileSync(file, JSON.stringify(obj, null, 2), 'utf8');
    console.log(`  ${lang}: translated ${updated} tour key(s).`);
}

console.log('Translating Tour keys...');
for (const lang of Object.keys(TOUR_TRANSLATIONS)) {
    processLang(lang, TOUR_TRANSLATIONS[lang]);
}
console.log('\n✅ Done.');