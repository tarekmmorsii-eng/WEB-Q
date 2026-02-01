
const fs = require('fs');
const path = require('path');

try {
    let content = fs.readFileSync('page3_v2_utf8.json', 'utf8');
    content = content.replace(/^\uFEFF/, '');
    const data = JSON.parse(content);

    // Find ID 8314 (sam'ihim + stop)
    // Actually ID might vary if I'm not careful, but I saw it in the output.
    // Let's search by verse_key 2:7 and check all words with stop signs in Uthmani text.

    const lines = data.lines;
    const words = [];
    Object.values(lines).forEach(lineWords => {
        lineWords.forEach(w => words.push(w));
    });

    const targetWords = words.filter(w => /[\u06D6-\u06DC]/.test(w.text_uthmani));

    console.log("Found " + targetWords.length + " words with stop signs in Uthmani.");

    targetWords.forEach(w => {
        console.log(`Word ID: ${w.id}, Uthmani: ${w.text_uthmani}`);
        console.log(`Code V2: ${w.code_v2} (Len: ${w.code_v2.length})`);
        const codes = [];
        for (let i = 0; i < w.code_v2.length; i++) {
            codes.push(w.code_v2.charCodeAt(i).toString(16).toUpperCase());
        }
        console.log(`Hex Codes: ${codes.join(', ')}`);
        console.log('---');
    });

} catch (e) {
    console.error(e);
}
