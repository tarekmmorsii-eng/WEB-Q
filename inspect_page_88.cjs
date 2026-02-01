const fs = require('fs');
const path = require('path');

const pageNum = 88;
const pagePath = path.join(__dirname, 'public', 'data', 'v2', 'pages', `${pageNum}.json`);

if (fs.existsSync(pagePath)) {
    const data = JSON.parse(fs.readFileSync(pagePath, 'utf8'));
    console.log(`Loaded Page ${pageNum}`);

    // Look for lines containing Surah 4 (An-Nisa)
    // The screenshot shows ayah 60.

    // Iterate lines
    Object.keys(data.lines).forEach(lineNum => {
        const words = data.lines[lineNum];
        words.forEach(word => {
            if (word.verse_key === '4:60') {
                console.log(`Line ${lineNum}, Word Pos ${word.position}: [${word.text_uthmani}] CodeV2: [${word.code_v2}] char_type: ${word.char_type}`);
                // Log unicode values of text_uthmani to see what the chars are
                const unicodes = word.text_uthmani.split('').map(c => '\\u' + c.charCodeAt(0).toString(16).padStart(4, '0')).join('');
                console.log(`    Unicodes: ${unicodes}`);
            }
        });
    });

} else {
    console.log('Page file not found');
}
