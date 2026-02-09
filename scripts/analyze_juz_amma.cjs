const fs = require('fs');
const data = JSON.parse(fs.readFileSync('c:/antigravity/X3 8app Q/constants/mutashabiha_data_full.json', 'utf8'));

const juzAmmaSurahs = Array.from({ length: 37 }, (_, i) => 78 + i);
let totalInternal = 0;
let totalExternal = 0;
let surahsWithMutashabihat = new Set();
let ayahsWithMutashabihat = new Set();

data.forEach(mut => {
    const srcSurah = mut.sourceAyah.surahNumber;
    if (juzAmmaSurahs.includes(srcSurah)) {
        surahsWithMutashabihat.add(srcSurah);
        ayahsWithMutashabihat.add(`${srcSurah}-${mut.sourceAyah.ayahNumber}`);

        mut.similarAyahs.forEach(sim => {
            if (sim.surahNumber === srcSurah) {
                totalInternal++;
            } else {
                totalExternal++;
            }
        });
    }
});

console.log('Juz Amma Report:');
console.log('Total Surahs in Juz Amma: 37');
console.log('Surahs with recorded mutashabihat:', surahsWithMutashabihat.size);
console.log('Total Ayahs in Juz Amma with mutashabihat:', ayahsWithMutashabihat.size);
console.log('Total Internal Matches (inside same surah):', totalInternal);
console.log('Total External Matches (outside surah):', totalExternal);
