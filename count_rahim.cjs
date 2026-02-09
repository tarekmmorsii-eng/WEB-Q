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

const term = "الرحيم";
const normTerm = removeTashkeel(term);

let ayah1Count = 0;
data.data.surahs.forEach(surah => {
    surah.ayahs.forEach(ayah => {
        if (ayah.numberInSurah === 1) {
            const normText = removeTashkeel(ayah.text);
            if (normText.includes(normTerm)) {
                ayah1Count++;
            }
        }
    });
});

console.log(`Matches for "الرحيم" in Ayah 1: ${ayah1Count}`);
