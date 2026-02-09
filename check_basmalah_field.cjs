const fs = require('fs');
const data = JSON.parse(fs.readFileSync('public/quran.json', 'utf8'));

const surah2 = data.data.surahs.find(s => s.number === 2);
console.log('Surah 2 keys:', Object.keys(surah2));
if (surah2.basmalah) {
    console.log('Surah 2 has basmalah field:', surah2.basmalah);
} else {
    console.log('Surah 2 does NOT have basmalah field');
}
