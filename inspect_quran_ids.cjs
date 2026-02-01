const fs = require('fs');
const path = require('path');

const quranPath = path.join(__dirname, 'public', 'quran.json');

try {
    const rawData = fs.readFileSync(quranPath, 'utf8');
    const quranData = JSON.parse(rawData);
    const surahs = quranData.data.surahs;

    const targetIds = [2965, 2966, 2967, 2968];

    console.log("Searching for IDs:", targetIds);

    let foundCount = 0;

    surahs.forEach(surah => {
        surah.ayahs.forEach(ayah => {
            if (targetIds.includes(ayah.number)) {
                console.log(`\n[ID ${ayah.number}]`);
                console.log(`Surah: ${surah.number} (${surah.name})`);
                console.log(`Ayah in Surah: ${ayah.numberInSurah}`);
                console.log(`Text: ${ayah.text.substring(0, 50)}...`);
                foundCount++;
            }
        });
    });

    if (foundCount === 0) {
        console.log("No IDs found. Note: 'number' field in quran.json is assumed to be absolute ID.");
    }

} catch (err) {
    console.error("Error:", err);
}
