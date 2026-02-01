const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'public', 'fonts', 'qpc_v2_mushaf.json');

try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const page3 = data['3'];

    // Find verse 2:7
    let targetWords = [];
    Object.values(page3.lines).forEach(line => {
        line.forEach(word => {
            if (word.verse_key === '2:7') {
                targetWords.push(word);
            }
        });
    });

    console.log("Verse 2:7 Words:");
    targetWords.forEach((word, index) => {
        console.log(`Pos: ${word.position}, Text: ${word.text_uthmani}, CodeV2: ${word.code_v2} (Len: ${word.code_v2.length})`);

        // Detailed char inspection
        for (let i = 0; i < word.code_v2.length; i++) {
            console.log(`  Char ${i}: U+${word.code_v2.charCodeAt(i).toString(16).toUpperCase()}`);
        }
    });

} catch (error) {
    console.error("Error:", error.message);
}
