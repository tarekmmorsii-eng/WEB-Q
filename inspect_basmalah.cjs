const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'public', 'fonts', 'qpc_v2_mushaf.json');

try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const page1 = data['1'];
    // Look for Verse 1:1 words
    let basmalahWords = [];
    Object.values(page1.lines).forEach(line => {
        line.forEach(word => {
            if (word.verse_key === '1:1') {
                basmalahWords.push(word);
            }
        });
    });

    console.log("Basmalah Words Found:", basmalahWords.length);
    console.log(JSON.stringify(basmalahWords, null, 2));

    // Also print the text concatenation
    const codes = basmalahWords.map(w => w.code_v2).join('');
    console.log("Details:", codes);
    const chars = basmalahWords.map(w => `Word: ${w.text_uthmani} Code: ${w.code_v2}`);
    console.log(chars);

} catch (error) {
    console.error("Error:", error.message);
}
