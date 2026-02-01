const fs = require('fs');
const path = require('path');

// Try common locations
const paths = [
    path.join(__dirname, 'public', 'fonts', 'qpc_v2_mushaf.json'),
    path.join(__dirname, 'public', 'qpc_v2_mushaf.json'),
    path.join(__dirname, 'src', 'data', 'qpc_v2_mushaf.json')
];

let filePath = paths.find(p => fs.existsSync(p));

if (filePath) {
    console.log(`Found mushaf data at: ${filePath}`);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    // Check Page 88
    const page88 = data['88'];
    if (page88) {
        Object.values(page88.lines).forEach(line => {
            line.forEach(word => {
                if (word.verse_key === '4:60') {
                    // Check if text_uthmani has regular text
                    const isGlyph = word.text_uthmani.charCodeAt(0) >= 0xE000;
                    console.log(`Word 4:60: [${word.text_uthmani}] IsGlyph: ${isGlyph} Unicode: ${word.text_uthmani.charCodeAt(0).toString(16)}`);

                    // Check for stop signs
                    if (/[\u06D6-\u06DC]/.test(word.text_uthmani)) {
                        console.log("  >>> HAS STOP SIGN STANDARD UNICODE! <<<");
                    }
                }
            });
        });
    } else {
        console.log("Page 88 not found in json");
    }

} else {
    console.log('qpc_v2_mushaf.json not found');
}
