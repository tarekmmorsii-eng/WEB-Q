const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'public', 'fonts', 'qpc_v2_mushaf.json');

try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const page604 = data['604'];
    console.log(JSON.stringify(page604, null, 2));
} catch (error) {
    console.error("Error reading file:", error.message);
}
