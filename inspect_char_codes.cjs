const fs = require('fs');
const data = JSON.parse(fs.readFileSync('public/quran.json', 'utf8'));
const surah2 = data.data.surahs.find(s => s.number === 2);
if (surah2) {
    const text = surah2.ayahs[0].text;
    console.log('Text:', text);
    for (let i = 0; i < text.length; i++) {
        console.log(text[i], text.charCodeAt(i).toString(16));
    }
}
