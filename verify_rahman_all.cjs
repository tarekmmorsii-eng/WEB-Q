const fs = require('fs');
const data = JSON.parse(fs.readFileSync('public/quran.json', 'utf8'));

const removeTashkeel = (text) => {
    return text
        .normalize('NFD')
        .replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E8\u06EA-\u06ED]/g, "")
        .replace(/[أإآٱ]/g, "ا")
        .replace(/ى/g, "ي")
        .replace(/ة/g, "ه");
};

const term = "الرحمن";
const normTerm = removeTashkeel(term);

data.data.surahs.forEach(surah => {
    if (surah.number === 9) return;
    const text = surah.ayahs[0].text;
    const norm = removeTashkeel(text);
    if (!norm.includes(normTerm)) {
        console.log(`Surah ${surah.number} Ayah 1 does NOT contain "الرحمن": ${text.substring(0, 50)}`);
    }
});
