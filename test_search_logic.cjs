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

const searchTerm = "الرحمن";
const normalizedSearchTerm = removeTashkeel(searchTerm);
const keywords = normalizedSearchTerm.split(/\s+/).filter(k => k.length > 0);

data.data.surahs.forEach(surah => {
    surah.ayahs.forEach(ayah => {
        const normalizedAyahText = removeTashkeel(ayah.text);
        const isMatch = keywords.every(keyword => normalizedAyahText.includes(keyword));
        if (isMatch && ayah.numberInSurah === 1) {
            console.log(`Match found in Surah ${surah.number} Ayah 1`);
        }
    });
});
