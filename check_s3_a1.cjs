const fs = require('fs');
const data = JSON.parse(fs.readFileSync('public/quran.json', 'utf8'));
const s3 = data.data.surahs.find(s => s.number === 3);
const a1 = s3.ayahs[0];
console.log('Surah 3 Ayah 1:', a1.text);
console.log('Codes:', Array.from(a1.text).map(c => c.charCodeAt(0).toString(16)).join(' '));
