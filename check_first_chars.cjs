const fs = require('fs');
const data = JSON.parse(fs.readFileSync('public/quran.json', 'utf8'));

data.data.surahs.forEach(surah => {
    const text = surah.ayahs[0].text;
    const firstCode = text.charCodeAt(0).toString(16);
    if (firstCode !== '628') { // 628 is Arabic letter Be
        console.log(`Surah ${surah.number} starts with unexpected code: ${firstCode} (${text.substring(0, 5)})`);
    }
});
