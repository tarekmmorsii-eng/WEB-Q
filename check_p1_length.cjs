const fs = require('fs');
const path = require('path');

const mushafPath = path.join(__dirname, 'public', 'fonts', 'qpc_v2_mushaf.json');
if (fs.existsSync(mushafPath)) {
    const data = JSON.parse(fs.readFileSync(mushafPath, 'utf8'));
    const page1 = data['1'];
    Object.values(page1.lines).forEach(line => {
        line.forEach(word => {
            if (word.text_uthmani.length > 1) {
                console.log(`P1 Word: [${word.text_uthmani}] Len: ${word.text_uthmani.length} Type: ${word.char_type} Key: ${word.verse_key}`);
            }
        });
    });
}
