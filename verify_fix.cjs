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

data.data.surahs.forEach(surah => {
    surah.ayahs.forEach(ayah => {
        let ayahText = ayah.text;
        const isFirstAyah = ayah.numberInSurah === 1;
        const basmalahText = 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ';
        const hasBasmalahPrefix = isFirstAyah && surah.number !== 1 && surah.number !== 9 && ayahText.includes(basmalahText);

        if (hasBasmalahPrefix) {
            const actualAyahText = ayahText.replace(basmalahText, '').trim();

            const normBasmalah = removeTashkeel(basmalahText);
            if (keywords.every(kw => normBasmalah.includes(kw))) {
                results.push({ surah: surah.number, ayah: 0, text: basmalahText });
            }

            if (actualAyahText) {
                const normActual = removeTashkeel(actualAyahText);
                if (keywords.every(kw => normActual.includes(kw))) {
                    results.push({ surah: surah.number, ayah: 1, text: actualAyahText });
                }
            }
        } else {
            const normText = removeTashkeel(ayahText);
            if (keywords.every(kw => normText.includes(kw))) {
                results.push({ surah: surah.number, ayah: ayah.numberInSurah, text: ayahText });
            }
        }
    });
});

console.log('Total Results:', results.length);
console.log('First 5 results:', results.slice(0, 5));
console.log('Matches for Surah 2:', results.filter(r => r.surah === 2));
console.log('Matches for Surah 3:', results.filter(r => r.surah === 3));

// Test prefix normalization
console.log('Normalization test "للرحمن":', removeTashkeel("للرحمن"));
