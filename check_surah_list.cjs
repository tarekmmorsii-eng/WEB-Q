const fs = require('fs');
const data = JSON.parse(fs.readFileSync('public/quran.json', 'utf8'));
console.log('Surah Count:', data.data.surahs.length);
console.log('Surah Numbers:', data.data.surahs.map(s => s.number));
