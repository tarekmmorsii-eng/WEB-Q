import fs from 'fs';

// Paths
const OFFICIAL_DATA_PATH = 'e:/anti gravety/X3 5app Q/official_data/kfgqpc_hafs_smart_4/kfgqpc_hafs_smart_data/hafs_smart_v8.json';
const TARGET_DATA_PATH = 'public/quran.json';

console.log('--- STARTING QURAN PAGE UPDATE FROM OFFICIAL DATA ---');

// 1. Read Official Data
console.log(`Reading official data from: ${OFFICIAL_DATA_PATH}`);
const officialRaw = fs.readFileSync(OFFICIAL_DATA_PATH, 'utf8');
const officialData = JSON.parse(officialRaw);

// Build a map for fast lookup: "surah:ayah" -> page
const pageMap = new Map();
officialData.forEach(item => {
    // Note: Official data uses 'sura_no' and 'aya_no' and 'page'
    const key = `${item.sura_no}:${item.aya_no}`;
    pageMap.set(key, item.page);
});

console.log(`Loaded ${pageMap.size} ayahs from official data.`);


// 2. Read Target Data (Your app's quran.json)
console.log(`Reading target data from: ${TARGET_DATA_PATH}`);
const targetData = JSON.parse(fs.readFileSync(TARGET_DATA_PATH, 'utf8'));

// 3. Update Pages
console.log('Updating pages in quran.json...');
let updatesCount = 0;
let errorsCount = 0;

targetData.data.surahs.forEach(surah => {
    surah.ayahs.forEach(ayah => {
        const key = `${surah.number}:${ayah.numberInSurah}`;

        if (pageMap.has(key)) {
            const correctPage = pageMap.get(key);

            if (ayah.page !== correctPage) {
                // Uncomment to see details of every change (too verbose for 6000+ ayahs)
                // console.log(`Correction: ${surah.englishName} ${ayah.numberInSurah} | Page ${ayah.page} -> ${correctPage}`);
                ayah.page = correctPage;
                updatesCount++;
            }
        } else {
            console.error(`⚠️ WARNING: Ayah ${key} found in quran.json but NOT in official data!`);
            errorsCount++;
        }
    });
});

console.log('--------------------------------------------------');
console.log(`Total ayahs updated: ${updatesCount}`);
console.log(`Total missing ayahs (errors): ${errorsCount}`);

if (updatesCount > 0) {
    console.log('Saving updated quran.json...');
    fs.writeFileSync(TARGET_DATA_PATH, JSON.stringify(targetData));
    console.log('✅ SAVED SUCCESSFULLY.');
} else {
    console.log('No changes were needed. quran.json is already identical to official data.');
}

// 4. Verification Check (Sample)
console.log('\n--- VERIFICATION SAMPLE ---');
const samples = [
    { s: 1, a: 1 },    // Fatiha start
    { s: 2, a: 1 },    // Baqara start
    { s: 114, a: 6 },  // Nas end
    { s: 58, a: 6 },   // Juz 28 start (checked previously)
    { s: 67, a: 12 },  // Juz 29 start (checked previously)
    { s: 80, a: 40 },  // Abasa 40 (User check)
    { s: 80, a: 41 }   // Abasa 41 (User check)
];

samples.forEach(sample => {
    const key = `${sample.s}:${sample.a}`;
    const correctPage = pageMap.get(key);
    const surah = targetData.data.surahs.find(s => s.number === sample.s);
    const ayah = surah.ayahs.find(a => a.numberInSurah === sample.a);

    console.log(`Surah ${sample.s}:${sample.a} -> Current Page: ${ayah.page} | Official Page: ${correctPage} | Match: ${ayah.page === correctPage ? '✅' : '❌'}`);
});
