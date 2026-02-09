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

const baqarah = data.data.surahs.find(s => s.number === 2);
baqarah.ayahs.forEach(a => {
    if (removeTashkeel(a.text).includes("الرحمن")) {
        console.log(`Baqarah ${a.numberInSurah}: ${a.text.substring(0, 50)}`);
    }
});
