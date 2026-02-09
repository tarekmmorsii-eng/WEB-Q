const fs = require('fs');
const data = JSON.parse(fs.readFileSync('public/quran.json', 'utf8'));
const surah2 = data.data.surahs.find(s => s.number === 2);
if (surah2) {
    console.log('Surah 2 Name:', surah2.name);
    console.log('Ayah 1:', surah2.ayahs[0].text);
} else {
    console.log('Surah 2 not found');
}
