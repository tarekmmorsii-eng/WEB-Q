const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'public', 'fonts', 'qpc_v2_mushaf.json');

if (fs.existsSync(filePath)) {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const page3 = data['3'];
    let count = 0;
    Object.values(page3.lines).forEach(line => {
        line.forEach((word) => {
            if (count < 10) {
                console.log(`Word: [${word.text_uthmani}] | Unicode: ${word.text_uthmani.split('').map(c => c.charCodeAt(0).toString(16))}`);
            }
            count++;
        });
    });
}
