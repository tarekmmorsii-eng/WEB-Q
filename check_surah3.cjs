const fs = require('fs');
const data = JSON.parse(fs.readFileSync('public/quran.json', 'utf8'));
const surah3 = data.data.surahs.find(s => s.number === 3);
if (surah3) {
    console.log('Surah 3 Name:', surah3.name);
    console.log('Ayah 1:', surah3.ayahs[0].text);
}
