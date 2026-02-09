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

let totalCount = 0;
let ayah1Count = 0;
let otherAyahCount = 0;

data.data.surahs.forEach(surah => {
    surah.ayahs.forEach(ayah => {
        const normText = removeTashkeel(ayah.text);
        if (normText.includes(normTerm)) {
            totalCount++;
            if (ayah.numberInSurah === 1) {
                ayah1Count++;
            } else {
                otherAyahCount++;
            }
        }
    });
});

console.log(`Total Matches: ${totalCount}`);
console.log(`Matches in Ayah 1: ${ayah1Count}`);
console.log(`Matches in other Ayahs: ${otherAyahCount}`);

data.data.surahs.forEach(surah => {
    const ayah1 = surah.ayahs.find(a => a.numberInSurah === 1);
    if (ayah1) {
        const normText = removeTashkeel(ayah1.text);
        if (!normText.includes(normTerm) && surah.number !== 9) {
            console.log(`Surah ${surah.number} (${surah.name}) Ayah 1 does NOT contain "${term}": ${ayah1.text.substring(0, 30)}`);
        }
    }
});
