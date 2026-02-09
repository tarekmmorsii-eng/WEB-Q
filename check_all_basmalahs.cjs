const fs = require('fs');
const data = JSON.parse(fs.readFileSync('public/quran.json', 'utf8'));

let count = 0;
data.data.surahs.forEach(surah => {
    if (surah.ayahs[0].text.includes('بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ')) {
        count++;
    } else {
        console.log(`Surah ${surah.number} (${surah.name}) Ayah 1 does NOT contain Basmalah: ${surah.ayahs[0].text.substring(0, 50)}`);
    }
});
console.log(`Total Surahs with Basmalah in Ayah 1: ${count}`);
