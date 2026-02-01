const fs = require('fs');
const path = require('path');

const mushafPath = path.join(__dirname, 'public', 'fonts', 'qpc_v2_mushaf.json');
if (fs.existsSync(mushafPath)) {
    const data = JSON.parse(fs.readFileSync(mushafPath, 'utf8'));
    console.log("Pages found:", Object.keys(data).slice(0, 20));
}
