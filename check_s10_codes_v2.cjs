const fs = require('fs');
const data = JSON.parse(fs.readFileSync('public/quran.json', 'utf8'));

const s10 = data.data.surahs.find(s => s.number === 10);
const text = s10.ayahs[0].text;
console.log('Surah 10 Ayah 1 Text:', text.substring(0, 50));
const codes = [];
for (let i = 0; i < Math.min(text.length, 50); i++) {
    codes.push(text.charCodeAt(i).toString(16));
}
console.log('Codes:', codes.join(' '));
