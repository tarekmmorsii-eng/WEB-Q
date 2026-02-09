const fs = require('fs');
const data = JSON.parse(fs.readFileSync('public/quran.json', 'utf8'));

data.data.surahs.forEach(surah => {
    const text = surah.ayahs[0].text;
    if (text.charCodeAt(0) === 0xFEFF) {
        console.log(`Surah ${surah.number} has BOM`);
    }
});
