const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'public', 'fonts', 'qpc_v2_mushaf.json');

try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const page1 = data['1'];
    console.log(JSON.stringify(page1, null, 2));
} catch (error) {
    console.error("Error reading file:", error.message);
}
