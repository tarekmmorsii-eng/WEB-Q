const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'public', 'fonts', 'qpc_v2_mushaf.json');

try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    // Page 3 has Surah Baqarah, should have stops.
    const page3 = data['3'];

    if (!page3) {
        console.log("Page 3 not found");
        process.exit(1);
    }

    let foundStops = [];

    Object.values(page3.lines).forEach(line => {
        line.forEach(word => {
            // Check for standard stop signs in uthmani text
            if (/[\u06D6-\u06DC]/.test(word.text_uthmani)) {
                foundStops.push({
                    text_uthmani: word.text_uthmani,
                    code_v2: word.code_v2,
                    length_v2: word.code_v2.length,
                    chars_v2: word.code_v2.split('').map(c => `U+${c.charCodeAt(0).toString(16).toUpperCase()}`)
                });
            }
        });
    });

    console.log("Found Words with Stops:", foundStops.length);
    console.log(JSON.stringify(foundStops.slice(0, 5), null, 2));

} catch (error) {
    console.error("Error:", error.message);
}
