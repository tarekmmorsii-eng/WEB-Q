
const fs = require('fs');
const path = require('path');

const sourceFile = 'public/fonts/qpc_v2_mushaf.json';
const outputDir = 'public/data/v2/pages';

if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

console.log('📖 Reading mega JSON file...');
const rawData = fs.readFileSync(sourceFile);
const fullData = JSON.parse(rawData);

console.log('🔪 Splitting into 604 pages...');
Object.keys(fullData).forEach(pageNumber => {
    const pageData = fullData[pageNumber];
    const fileName = `${pageNumber}.json`;
    fs.writeFileSync(path.join(outputDir, fileName), JSON.stringify(pageData));
});

console.log('✅ Success! Pages are now stored individually in ' + outputDir);
