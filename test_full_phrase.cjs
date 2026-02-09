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

const fullTerm = "بسم الله الرحمن الرحيم";
const normTerm = removeTashkeel(fullTerm);
const keywords = normTerm.split(/\s+/).filter(k => k.length > 0);

console.log('Keywords:', keywords);

let matchCount = 0;
data.data.surahs.forEach(surah => {
    surah.ayahs.forEach(ayah => {
        const normText = removeTashkeel(ayah.text);
        const isMatch = keywords.every(kw => normText.includes(kw));
        if (isMatch) {
            matchCount++;
            if (ayah.numberInSurah !== 1) {
                console.log(`Match in Surah ${surah.number} Ayah ${ayah.numberInSurah}: ${ayah.text.substring(0, 50)}`);
            }
        }
    });
});

console.log(`Total matches for the whole phrase: ${matchCount}`);
