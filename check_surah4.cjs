const fs = require('fs');
const data = JSON.parse(fs.readFileSync('public/quran.json', 'utf8'));
const surah4 = data.data.surahs.find(s => s.number === 4);
if (surah4) {
    console.log('Surah 4 Ayah 1:', surah4.ayahs[0].text);
}
