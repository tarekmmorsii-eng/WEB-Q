const fs = require('fs');

async function debugPage604() {
    const data = JSON.parse(fs.readFileSync('public/fonts/qpc_v2_mushaf.json', 'utf8'));
    const page604 = data['604'];
    const linesMap = page604.lines;
    const pageNum = 604;

    const rawLinesCache = {};
    for (let i = 1; i <= 15; i++) {
        const wordsV2 = linesMap[i.toString()];
        if (wordsV2) {
            rawLinesCache[i] = wordsV2;
        }
    }

    for (let i = 1; i <= 15; i++) {
        const words = rawLinesCache[i];
        if (words) {
            const isShort = pageNum > 2 && words.length < 11;
            console.log(`Line ${i}: Length ${words.length}, IsShort: ${isShort}`);
        }
    }
}

debugPage604();
