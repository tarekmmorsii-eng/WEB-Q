const fs = require('fs');
const data = JSON.parse(fs.readFileSync('public/quran.json', 'utf8'));

const removeTashkeel = (text) => {
    let normalized = text
        .normalize('NFD') // Decomposed characters
        .replace(/[\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E8\u06EA-\u06ED]/g, "")
        .replace(/[أإآٱ]/g, "ا")
        .replace(/ى/g, "ي")
        .replace(/ة/g, "ه");

    return normalized
        .replace(/(^|\s)لل/g, "$1ال");
};

const keywords = ["الرحمن"];
let results = [];

const basmalahText = 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ';

data.data.surahs.slice(0, 10).forEach(surah => {
    surah.ayahs.forEach(ayah => {
        let ayahText = ayah.text;
        const isFirstAyah = ayah.numberInSurah === 1;
        // Optimization: check normalized if marks differ
        const hasBasmalahPrefix = isFirstAyah && surah.number !== 1 && surah.number !== 9 && ayahText.startsWith(basmalahText);

        if (hasBasmalahPrefix) {
            results.push({ surah: surah.number, ayah: 0, tag: 'BASMALAH' });
            const actualAyahText = ayahText.substring(basmalahText.length).trim();
            if (actualAyahText) {
                const normActual = removeTashkeel(actualAyahText);
                if (keywords.every(kw => normActual.includes(kw))) {
                    results.push({ surah: surah.number, ayah: 1, tag: 'AYAH' });
                }
            }
        } else {
            const normText = removeTashkeel(ayahText);
            if (keywords.every(kw => normText.includes(kw))) {
                results.push({ surah: surah.number, ayah: ayah.numberInSurah, tag: 'AYAH' });
            }
        }
    });
});

console.log('Results for first 10 surahs:', results);
console.log('Lil-Rahman matches Rahman:', removeTashkeel("للرحمن").includes(removeTashkeel("الرحمن")));
