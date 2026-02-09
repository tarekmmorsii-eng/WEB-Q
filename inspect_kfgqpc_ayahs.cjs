const fs = require('fs');
const data = JSON.parse(fs.readFileSync('public/kfgqpc_quran.json', 'utf8'));

const getAyah = (surahNo, ayahNo) => {
    for (const pageNo in data.pages) {
        const page = data.pages[pageNo];
        for (const line of page.lines) {
            for (const segment of line.segments) {
                if (segment.surahNo === surahNo && segment.ayahNo === ayahNo) {
                    return segment;
                }
            }
        }
    }
    return null;
};

console.log('Surah 1 Ayah 1:', getAyah(1, 1));
console.log('Surah 2 Ayah 1:', getAyah(2, 1));
console.log('Surah 2 Ayah 2:', getAyah(2, 2));
