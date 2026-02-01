const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'public', 'fonts', 'qpc_v2_mushaf.json');

try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const page3 = data['3'];
    const sampleLine = page3.lines['3']; // Line 3 of page 3
    console.log(JSON.stringify(sampleLine, null, 2));

} catch (error) {
    console.error("Error:", error.message);
}
