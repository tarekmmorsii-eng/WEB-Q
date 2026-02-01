import fs from 'fs';

// Read data
const data = JSON.parse(fs.readFileSync('public/quran.json', 'utf8'));

// The exact table provided by the user for Juz 24:
// Page | Last Surah Number | Last Ayah Number
const pageEndings = [
    { page: 462, surah: 39, ayah: 40 }, // Az-Zumar
    { page: 463, surah: 39, ayah: 47 }, // Az-Zumar
    { page: 464, surah: 39, ayah: 56 }, // Az-Zumar
    { page: 465, surah: 39, ayah: 67 }, // Az-Zumar
    { page: 466, surah: 39, ayah: 74 }, // Az-Zumar
    { page: 467, surah: 40, ayah: 7 },  // Ghafir
    { page: 468, surah: 40, ayah: 16 }, // Ghafir
    { page: 469, surah: 40, ayah: 25 }, // Ghafir
    { page: 470, surah: 40, ayah: 33 }, // Ghafir
    { page: 471, surah: 40, ayah: 40 }, // Ghafir
    { page: 472, surah: 40, ayah: 49 }, // Ghafir
    { page: 473, surah: 40, ayah: 58 }, // Ghafir
    { page: 474, surah: 40, ayah: 66 }, // Ghafir
    { page: 475, surah: 40, ayah: 77 }, // Ghafir
    { page: 476, surah: 40, ayah: 85 }, // Ghafir
    { page: 477, surah: 41, ayah: 11 }, // Fussilat
    { page: 478, surah: 41, ayah: 20 }, // Fussilat
    { page: 479, surah: 41, ayah: 29 }, // Fussilat
    { page: 480, surah: 41, ayah: 38 }, // Fussilat
    { page: 481, surah: 41, ayah: 46 }  // Fussilat
];

let currentPageIndex = 0;
let currentTarget = pageEndings[currentPageIndex];

console.log('Applying exact page mappings for Juz 24 (Pages 462-481)...');

// Iterate through surahs starting from Az-Zumar (39)
data.data.surahs.forEach(surah => {
    // Only process surahs starting from 39 (Az-Zumar)
    if (surah.number < 39) return;

    // Stop processing if we go beyond Surah 41 (Fussilat)
    // Actually we need to be careful not to touch Juz 25 (which starts at 41:47)
    if (surah.number > 41) return;

    surah.ayahs.forEach(ayah => {
        // SPECIAL START CONDITION FOR JUZ 24:
        // Juz 24 starts at Surah 39 Ayah 32.
        // We must NOT change pages for ayahs before 32 (they belong to Juz 23).
        if (surah.number === 39 && ayah.numberInSurah < 32) return;

        // If we exhausted our targets, stop assigning.
        if (!currentTarget) return;

        // SKIP if current page target is already past our range (should stop at 481)
        if (currentTarget.page > 481) return;

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

// Check specifically the LAST page (481) end
const checkPage481 = () => {
    const p481 = [];
    data.data.surahs.forEach(s => s.ayahs.forEach(a => {
        if (a.page === 481) p481.push(`${s.number}:${a.numberInSurah}`);
    }));
    if (p481.length > 0) {
        console.log(`Page 481 ends at: ${p481[p481.length - 1]}`);
    } else {
        console.log('Page 481 is empty!');
    }
};
checkPage481();

console.log('Verification check complete.');
