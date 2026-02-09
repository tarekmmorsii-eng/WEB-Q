const fs = require('fs');
const data = JSON.parse(fs.readFileSync('public/quran.json', 'utf8'));

const s10 = data.data.surahs.find(s => s.number === 10);
console.log('Surah 10 Ayah 1 Text:', s10.ayahs[0].text);
console.log('Surah 10 Ayah 1 Codes:');
for (let i = 0; i < 30; i++) {
    process.stdout.write(s10.ayahs[0].text.charCodeAt(i).toString(16) + ' ');
}
console.log('');
