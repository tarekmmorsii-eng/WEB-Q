const fs = require('fs');
const path = require('path');

const mushafPath = path.join(__dirname, 'public', 'fonts', 'qpc_v2_mushaf.json');
if (fs.existsSync(mushafPath)) {
    const data = JSON.parse(fs.readFileSync(mushafPath, 'utf8'));
    const page88 = data['88'];
    Object.values(page88.lines).forEach(line => {
        line.forEach(word => {
            if (word.text_uthmani.includes('ﱘ')) { // Part of بِهِۦ
                console.log(JSON.stringify(word, null, 2));
            }
        });
    });
}
