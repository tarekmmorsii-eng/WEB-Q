/*
 * Fix Tour Keys - Force Update for om & rw (SAFE)
 * ------------------------------------------------
 * Forces tour key updates for Oromo and Kinyarwanda regardless
 * of current value (handles empty/incorrect values).
 */

const fs = require('fs');
const path = require('path');

const I18N_DIR = path.join(__dirname, '..', 'src', 'assets', 'i18n');

const TOUR_TRANSLATIONS = {
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
    }
};

function processLang(lang, keysToAdd) {
    const file = path.join(I18N_DIR, `${lang}.json`);
    const raw = fs.readFileSync(file, 'utf8');
    const obj = JSON.parse(raw);

    let updated = 0;
    for (const [key, value] of Object.entries(keysToAdd)) {
        obj[key] = value;
        updated++;
    }

    fs.writeFileSync(file, JSON.stringify(obj, null, 2), 'utf8');
    console.log(`  ${lang}: force-updated ${updated} tour key(s).`);
}

console.log('Force-updating Tour keys for om & rw...');
for (const lang of Object.keys(TOUR_TRANSLATIONS)) {
    processLang(lang, TOUR_TRANSLATIONS[lang]);
}
console.log('\n✅ Done.');