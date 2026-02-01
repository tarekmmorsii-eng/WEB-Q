const fs = require('fs');
const path = require('path');

const mushafPath = path.join(__dirname, 'public', 'fonts', 'qpc_v2_mushaf.json');
const stopsPath = path.join(__dirname, 'src', 'generated', 'stopSigns.ts');

if (fs.existsSync(mushafPath)) {
    const data = JSON.parse(fs.readFileSync(mushafPath, 'utf8'));
    const newStops = {};

    Object.values(data).forEach(page => {
        Object.values(page.lines).forEach(line => {
            line.forEach(word => {
                if (word.char_type === 'word' && word.text_uthmani.length > 1) {
                    const [s, a] = word.verse_key.split(/[:\-_]/);
                    const key = `${s}-${a}`;
                    const posIndex = Number(word.position) - 1;
                    if (!newStops[key]) newStops[key] = [];
                    if (!newStops[key].includes(posIndex)) {
                        newStops[key].push(posIndex);
                    }
                }
            });
        });
    });

    // Sort the indices
    Object.keys(newStops).forEach(key => {
        newStops[key].sort((a, b) => a - b);
    });

    const output = `export const STOP_SIGNS: Record<string, number[]> = ${JSON.stringify(newStops, null, 2)};\n`;
    fs.writeFileSync(stopsPath, output);
    console.log(`Generated STOP_SIGNS for ${Object.keys(newStops).length} ayahs.`);
} else {
    console.log('Mushaf JSON not found.');
}
