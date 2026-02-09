const fs = require('fs');
const data = JSON.parse(fs.readFileSync('public/kfgqpc_quran.json', 'utf8'));

const removeTashkeel = (text) => {
    return text
        .normalize('NFD')
        .replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E8\u06EA-\u06ED]/g, "")
        .replace(/[أإآٱ]/g, "ا")
        .replace(/ى/g, "ي")
        .replace(/ة/g, "ه");
};

const term = "الرحمن";
const normTerm = removeTashkeel(term);

let ayah1Count = 0;
data.forEach(ayah => {
    if (ayah.verse_number === 1) {
        const normText = removeTashkeel(ayah.text);
        if (normText.includes(normTerm)) {
            ayah1Count++;
        }
    }
});

console.log(`kfgqpc_quran.json Matches in Ayah 1: ${ayah1Count}`);
if (data[0]) console.log('First Ayah:', data[0].text);
