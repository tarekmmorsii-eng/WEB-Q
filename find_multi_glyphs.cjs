const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'public', 'fonts', 'qpc_v2_mushaf.json');

if (fs.existsSync(filePath)) {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const candidates = [];
    Object.entries(data).forEach(([pageNum, page]) => {
        Object.values(page.lines).forEach(line => {
            line.forEach(word => {
                if (word.char_type === 'word' && word.text_uthmani.length > 1) {
                    candidates.push({
                        page: pageNum,
                        key: word.verse_key,
                        pos: word.position,
                        text: word.text_uthmani,
                        codes: word.code_v2.split('').map(c => c.charCodeAt(0).toString(16))
                    });
                }
            });
        });
    });
    console.log(`Found ${candidates.length} multi-glyph words.`);
    console.log(JSON.stringify(candidates.slice(0, 20), null, 2));
}
