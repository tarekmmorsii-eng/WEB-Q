const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'public', 'fonts', 'qpc_v2_mushaf.json'); // Adjusted path based on user file list

try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const page570 = data['570']; // Surah Nuh is on 570
    console.log(JSON.stringify(page570, null, 2));
} catch (error) {
    console.error("Error reading file:", error.message);
}
