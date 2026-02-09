const fs = require('fs');
const data = JSON.parse(fs.readFileSync('public/quran.json', 'utf8'));

const removeTashkeel = (text) => {
    return text
        .normalize('NFD')
        .replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E8\u06EA-\u06ED]/g, "")
        .replace(/[أإآٱ]/g, "ا")
        .replace(/ى/g, "ي")
        .replace(/ة/g, "ه");
};

const surah3 = data.data.surahs.find(s => s.number === 3);
if (surah3) {
    const text = surah3.ayahs[0].text;
    console.log('Original Text:', text);
    console.log('Normalized Text:', removeTashkeel(text));
    console.log('Contains "الرحمن":', removeTashkeel(text).includes("الرحمن"));
}
const surah2 = data.data.surahs.find(s => s.number === 2);
if (surah2) {
    const text = surah2.ayahs[0].text;
    console.log('Surah 2 Ayah 1 Normalized:', removeTashkeel(text));
    console.log('Surah 2 Ayah 1 Contains "الرحمن":', removeTashkeel(text).includes("الرحمن"));
}
