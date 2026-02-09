const fs = require('fs');
const data = JSON.parse(fs.readFileSync('public/quran.json', 'utf8'));

for (let i = 1; i <= 5; i++) {
    const surah = data.data.surahs.find(s => s.number === i);
    const text = surah.ayahs[0].text;
    const basmalah = text.substring(0, 30);
    console.log(`Surah ${i}: ${basmalah}`);
    for (let j = 0; j < Math.min(basmalah.length, 20); j++) {
        process.stdout.write(basmalah.charCodeAt(j).toString(16) + ' ');
    }
    console.log('\n');
}
