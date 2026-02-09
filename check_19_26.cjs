const fs = require('fs');
const data = JSON.parse(fs.readFileSync('public/quran.json', 'utf8'));
const s19 = data.data.surahs.find(s => s.number === 19);
const a26 = s19.ayahs.find(a => a.numberInSurah === 26);
console.log('19:26 Text:', a26.text);
for (let i = 0; i < a26.text.length; i++) {
    process.stdout.write(a26.text[i] + '(' + a26.text.charCodeAt(i).toString(16) + ') ');
}
console.log('');
