const fs = require('fs');
const data = JSON.parse(fs.readFileSync('public/quran.json', 'utf8'));

for (let i = 1; i <= 10; i++) {
    const surah = data.data.surahs.find(s => s.number === i);
    if (surah) {
        const text = surah.ayahs[0].text;
        console.log(`Surah ${i}: [${text.substring(0, 40)}]`);
    }
}
