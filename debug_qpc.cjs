
const fs = require('fs');
const path = require('path');

const filePath = path.join('e:\\anti gravety\\X3 5app Q\\public\\qpc_v1_mushaf.json');

fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
        console.error(err);
        return;
    }
    const json = JSON.parse(data);
    // Structure check: array of pages? or linear list of words?
    // It seems to be pages -> lines -> words? Or flat list?
    // From previous view, it looked like { metadata:..., pages: [...] }

    // Let's traverse to find Surah 2 Ayah 7
    // Need to handle different structures based on what we find. 
    // Assuming standard structure based on file name "qpc_v1_mushaf"

    let foundWords = [];

    if (Array.isArray(json)) {
        // Maybe flat array
        foundWords = json.filter(w => w.surah === 2 && w.ayah === 7);
    } else if (json.pages) {
        // Iterate pages
        json.pages.forEach(page => {
            if (page.lines) {
                page.lines.forEach(line => {
                    if (line.words) {
                        line.words.forEach(word => {
                            if (word.surah === 2 && word.ayah === 7) {
                                foundWords.push(word);
                            }
                        });
                    }
                });
            }
        });
    } else if (json.data && json.data.surahs) {
        // quran.json structure
    }

    console.log("Found words for 2:7:", foundWords.length);
    foundWords.forEach((w, i) => {
        console.log(`Word ${i + 1} ID:${w.id}: ${w.text}`);
        // Print codepoints
        const codes = [];
        for (let j = 0; j < w.text.length; j++) {
            codes.push(w.text.charCodeAt(j).toString(16));
        }
        console.log(`Error codes: ${codes.join(' ')}`);
    });
});
