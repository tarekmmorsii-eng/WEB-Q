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
            line.forEach((word, idx) => {
                if (word.verse_key === '4:60') {
                    const isGlyph = word.text_uthmani.charCodeAt(0) >= 0xE000;
                    console.log(`Index in Line: ${idx} | Map Word Num: ${word.word} | Text: [${word.text_uthmani}] | CharType: ${word.char_type_name || word.char_type} | CodeV2: ${word.code_v2}`);
                }
            });
        });
    } else {
        console.log("Page 88 not found in json");
    }

} else {
    console.log('qpc_v2_mushaf.json not found');
}
