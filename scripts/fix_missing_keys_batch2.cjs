/*
 * Fix Missing Keys - Batch 2 (SAFE)
 * ---------------------------------
 * Handles remaining missing keys for: yo, si, om, rw
 */

const fs = require('fs');
const path = require('path');

const I18N_DIR = path.join(__dirname, '..', 'src', 'assets', 'i18n');

const TRANSLATIONS = {
    yo: {
        builtInSubtitle: "Ti a fi pamọ • Itonilede Ọrọ-ọrọ nipasẹ Bashir Yunus",
        badgeTafsirWbw: "Tafsir + Itumo Ọrọ",
        badgeTafsirOnly: "Tafsir nikan",
        totalLanguagesLabel: "Awọn Ede Lapapọ",
        downloadedLabel: "Ti gbalẹ",
        translationAyah: "Itumọ Ayah"
    },
    si: {
        translationAyah: "ආයතය පරිවර්තනය"
    },
    om: {
        translationAyah: "Hiikkaa Aayyaa"
    },
    rw: {
        translationAyah: "Ubusobanuro bw'Ige"
    }
};

function processLang(lang, keysToAdd) {
    const file = path.join(I18N_DIR, `${lang}.json`);
    const raw = fs.readFileSync(file, 'utf8');
    const obj = JSON.parse(raw);

    let added = 0;
    for (const [key, value] of Object.entries(keysToAdd)) {
        if (!(key in obj)) {
            obj[key] = value;
            added++;
        }
    }

    if (added === 0) {
        console.log(`  ${lang}: no missing keys found, skipped.`);
        return;
    }

    fs.writeFileSync(file, JSON.stringify(obj, null, 2), 'utf8');
    console.log(`  ${lang}: added ${added} key(s).`);
}

console.log('Processing remaining languages...');
for (const lang of Object.keys(TRANSLATIONS)) {
    processLang(lang, TRANSLATIONS[lang]);
}
console.log('\n✅ Done.');