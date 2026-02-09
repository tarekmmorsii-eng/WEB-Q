const fs = require('fs');
const data = JSON.parse(fs.readFileSync('public/quran.json', 'utf8'));

data.data.surahs.forEach(surah => {
    if (surah.number === 9) return;
    const text = surah.ayahs[0].text;
    console.log(`Surah ${surah.number}: ${text.substring(0, 40)}`);
});
