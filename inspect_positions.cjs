const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'public', 'fonts', 'qpc_v2_mushaf.json');

if (fs.existsSync(filePath)) {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const page88 = data['88'];
    Object.values(page88.lines).forEach(line => {
        line.forEach((word) => {
            if (word.verse_key === '4:60') {
                console.log(`Text: [${word.text_uthmani}] | Position: ${word.position} | CharType: ${word.char_type}`);
            }
        });
    });
} else {
    console.log('File not found');
}
