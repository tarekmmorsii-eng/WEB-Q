const fs = require('fs');
const data = JSON.parse(fs.readFileSync('public/quran.json', 'utf8'));
const surah114 = data.data.surahs.find(s => s.number === 114);
if (surah114) {
    console.log('Surah 114 Ayah 1:', surah114.ayahs[0].text);
}
