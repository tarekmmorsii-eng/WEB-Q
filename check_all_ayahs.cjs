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

data.data.surahs.forEach(surah => {
    const text = surah.ayahs[0].text;
    const norm = removeTashkeel(text);
    if (!norm.startsWith('بسم الله') && surah.number !== 9) {
        console.log(`Surah ${surah.number} (${surah.name}) Ayah 1 does NOT start with Basmalah: ${text.substring(0, 30)}`);
    }
});
