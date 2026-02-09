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
const s19 = data.data.surahs.find(s => s.number === 19);
s19.ayahs.forEach(a => {
    const norm = removeTashkeel(a.text);
    if (norm.includes(removeTashkeel(term))) {
        console.log(`Match in 19:${a.numberInSurah}`);
    } else if (a.text.includes("رحمن") || a.text.includes("الرحمن")) {
        console.log(`MISSED in 19:${a.numberInSurah}: ${a.text}`);
    }
});
