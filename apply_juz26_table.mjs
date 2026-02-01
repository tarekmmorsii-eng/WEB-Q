import fs from 'fs';

// Read data
const data = JSON.parse(fs.readFileSync('public/quran.json', 'utf8'));

// The exact table provided by the user for Juz 26:
// Page | Last Surah Number | Last Ayah Number
const pageEndings = [
    { page: 502, surah: 46, ayah: 5 },  // Al-Ahqaf
    { page: 503, surah: 46, ayah: 14 }, // Al-Ahqaf
    { page: 504, surah: 46, ayah: 20 }, // Al-Ahqaf
    { page: 505, surah: 46, ayah: 28 }, // Al-Ahqaf
    { page: 506, surah: 46, ayah: 35 }, // Al-Ahqaf
    { page: 507, surah: 47, ayah: 11 }, // Muhammad
    { page: 508, surah: 47, ayah: 19 }, // Muhammad
    { page: 509, surah: 47, ayah: 29 }, // Muhammad
    { page: 510, surah: 47, ayah: 38 }, // Muhammad
    { page: 511, surah: 48, ayah: 9 },  // Al-Fath
    { page: 512, surah: 48, ayah: 15 }, // Al-Fath
    { page: 513, surah: 48, ayah: 23 }, // Al-Fath
    { page: 514, surah: 48, ayah: 28 }, // Al-Fath
    { page: 515, surah: 49, ayah: 4 },  // Al-Hujurat
    { page: 516, surah: 49, ayah: 11 }, // Al-Hujurat
    { page: 517, surah: 49, ayah: 18 }, // Al-Hujurat
    { page: 518, surah: 50, ayah: 15 }, // Qaf
    { page: 519, surah: 50, ayah: 35 }, // Qaf
    { page: 520, surah: 51, ayah: 6 },  // Adh-Dhariyat
    { page: 521, surah: 51, ayah: 30 }  // Adh-Dhariyat
];

let currentPageIndex = 0;
let currentTarget = pageEndings[currentPageIndex];

console.log('Applying exact page mappings for Juz 26 (Pages 502-521)...');

// Iterate through surahs starting from Al-Ahqaf (46)
data.data.surahs.forEach(surah => {
    // Only process surahs starting from 46
    if (surah.number < 46) return;

    surah.ayahs.forEach(ayah => {
        // If we exhausted our targets, stop assigning
        if (!currentTarget) return;

        // SKIP if current page target is already past our range
        if (currentTarget.page > 521) return;

        // Apply page
        ayah.page = currentTarget.page;

        // Check if we reached the boundary
        if (surah.number === currentTarget.surah && ayah.numberInSurah === currentTarget.ayah) {
            currentPageIndex++;
            currentTarget = pageEndings[currentPageIndex];
        }
    });
});

console.log('Writing to quran.json...');
fs.writeFileSync('public/quran.json', JSON.stringify(data));
console.log('Done.');

// Verification
console.log('\n=== VERIFICATION ===');
pageEndings.forEach(e => {
    const s = data.data.surahs.find(x => x.number === e.surah);
    if (!s) return;
    const a = s.ayahs.find(y => y.numberInSurah === e.ayah);
    if (!a) return;

    if (a.page !== e.page) {
        console.log(`❌ ERROR: ${s.englishName} ${e.ayah} should be on page ${e.page}, found on ${a.page}`);
    }
});

// Check specifically the LAST page (521) end
const checkPage521 = () => {
    const p521 = [];
    data.data.surahs.forEach(s => s.ayahs.forEach(a => {
        if (a.page === 521) p521.push(`${s.number}:${a.numberInSurah}`);
    }));
    if (p521.length > 0) {
        console.log(`Page 521 ends at: ${p521[p521.length - 1]}`);
    } else {
        console.log('Page 521 is empty!');
    }
};
checkPage521();

console.log('Verification check complete.');
