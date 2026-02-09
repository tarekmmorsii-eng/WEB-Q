const fs = require('fs');
const data = JSON.parse(fs.readFileSync('public/quran.json', 'utf8'));

data.data.surahs.forEach(surah => {
    const zeroAyah = surah.ayahs.find(a => a.numberInSurah === 0);
    if (zeroAyah) {
        console.log(`Surah ${surah.number} has Ayah 0: ${zeroAyah.text}`);
    }
});
