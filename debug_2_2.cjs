const fs = require('fs');
const path = require('path');

const mushafPath = path.join(__dirname, 'public', 'fonts', 'qpc_v2_mushaf.json');
if (fs.existsSync(mushafPath)) {
    const data = JSON.parse(fs.readFileSync(mushafPath, 'utf8'));
    const page2 = data['2'];
    Object.values(page2.lines).forEach(line => {
        line.forEach(word => {
            if (word.verse_key === '2:2') {
                console.log(`Word: [${word.text_uthmani}] Len: ${word.text_uthmani.length} Pos: ${word.position}`);
            }
        });
    });
}
