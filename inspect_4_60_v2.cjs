const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'public', 'fonts', 'qpc_v2_mushaf.json');

if (fs.existsSync(filePath)) {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const page88 = data['88'];
    let count = 0;
    Object.values(page88.lines).forEach(line => {
        line.forEach((word) => {
            if (word.verse_key === '4:60') {
                count++;
                console.log(`${count}: [${word.text_uthmani}] (Pos: ${word.position}) Code: ${word.code_v2.split('').map(c => c.charCodeAt(0).toString(16))}`);
            }
        });
    });
} else {
    console.log('File not found');
}
