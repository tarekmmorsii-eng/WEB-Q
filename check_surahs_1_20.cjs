const fs = require('fs');
const data = JSON.parse(fs.readFileSync('public/quran.json', 'utf8'));

for (let i = 1; i <= 20; i++) {
    const surah = data.data.surahs.find(s => s.number === i);
    if (surah) {
        console.log(`Surah ${i}: ${surah.ayahs[0].text.substring(0, 40)}`);
    }
}
