const fs = require('fs');
const path = require('path');

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

const QURAN_JSON_PATH = path.join(__dirname, 'public/quran.json');
const quranData = JSON.parse(fs.readFileSync(QURAN_JSON_PATH, 'utf8'));

const b1 = quranData.data.surahs[1].ayahs[0]; // Baqarah 1
const n1 = quranData.data.surahs[3].ayahs[0]; // Nisa 1

console.log("Baqarah 1:", b1.text);
const b1Words = b1.text.split(' ').map(w => ({ raw: w, norm: normalize(w) })).filter(w => w.norm.length > 0);
console.log("Baqarah 1 Norm:", b1Words);

console.log("Nisa 1:", n1.text);
const n1Words = n1.text.split(' ').map(w => ({ raw: w, norm: normalize(w) })).filter(w => w.norm.length > 0);
console.log("Nisa 1 Norm:", n1Words);
