const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'public', 'fonts', 'qpc_v2_mushaf.json');

if (fs.existsSync(filePath)) {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const charTypes = new Set();
    Object.values(data).forEach(page => {
        Object.values(page.lines).forEach(line => {
            line.forEach(word => charTypes.add(word.char_type));
        });
    });
    console.log("Char Types found:", Array.from(charTypes));
} else {
    console.log('File not found');
}
