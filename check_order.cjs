const fs = require('fs');
const data = JSON.parse(fs.readFileSync('public/quran.json', 'utf8'));

let lastNum = 0;
data.data.surahs.forEach(s => {
    if (s.number < lastNum) {
        console.log(`Surah ${s.number} is out of order (after ${lastNum})`);
    }
    lastNum = s.number;
});
console.log('Order check complete');
