
const fs = require('fs');
const path = require('path');

const QURAN_JSON_PATH = path.join(__dirname, '../public/quran.json');

function normalize(text) {
    if (!text) return "";
    return text
        .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED\u0610-\u061A]/g, '')
        .replace(/[\u0622\u0623\u0625\u0671]/g, '\u0627')
        .replace(/[\u0649]/g, '\u064A')
        .replace(/[\u0629]/g, '\u0647')
        .replace(/[^\u0621-\u064A\s]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
}

function prepareAyah(ayah) {
    const rawWords = ayah.text.split(' ');
    const processed = [];

    rawWords.forEach(raw => {
        const clean = normalize(raw);
        if (clean.length > 0) {
            processed.push({ raw: raw, norm: clean });
        }
    });

    return {
        num: ayah.numberInSurah,
        words: processed
    };
}

try {
    const raw = fs.readFileSync(QURAN_JSON_PATH, 'utf8');
    const quranData = JSON.parse(raw);
    const baqara = quranData.data.surahs.find(s => s.number === 2);
    const imran = quranData.data.surahs.find(s => s.number === 3);

    const ayat2 = baqara.ayahs.find(a => a.numberInSurah === 2);
    const ayat9 = imran.ayahs.find(a => a.numberInSurah === 9);

    console.log("--- Baqara 2 ---");
    console.log("Text:", ayat2.text);
    const p2 = prepareAyah(ayat2);
    p2.words.forEach((w, i) => console.log(`[${i}] Raw: '${w.raw}' -> Norm: '${w.norm}'`));

    console.log("\n--- Imran 9 ---");
    console.log("Text:", ayat9.text);
    const p9 = prepareAyah(ayat9);
    p9.words.forEach((w, i) => console.log(`[${i}] Raw: '${w.raw}' -> Norm: '${w.norm}'`));

} catch (e) {
    console.error(e);
}
