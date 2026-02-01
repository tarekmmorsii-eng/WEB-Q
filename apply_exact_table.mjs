import fs from 'fs';

// Read data
const data = JSON.parse(fs.readFileSync('public/quran.json', 'utf8'));

// The exact table provided by the user:
// Page | Last Surah Number | Last Ayah Number
const pageEndings = [
    { page: 582, surah: 78, ayah: 30 },
    { page: 583, surah: 79, ayah: 16 },
    { page: 584, surah: 79, ayah: 46 },
    { page: 585, surah: 80, ayah: 40 },
    { page: 586, surah: 81, ayah: 29 },
    { page: 587, surah: 83, ayah: 4 }, // Note: Skips 82 (must be included before this point)
    { page: 588, surah: 83, ayah: 33 },
    { page: 589, surah: 84, ayah: 24 },
    { page: 590, surah: 85, ayah: 22 },
    { page: 591, surah: 87, ayah: 10 }, // Note: Skips 86
    { page: 592, surah: 88, ayah: 22 },
    { page: 593, surah: 89, ayah: 22 },
    { page: 594, surah: 90, ayah: 18 },
    { page: 595, surah: 92, ayah: 9 }, // Note: Skips 91
    { page: 596, surah: 94, ayah: 2 }, // Note: Skips 93
    { page: 597, surah: 96, ayah: 12 }, // Note: Skips 95
    { page: 598, surah: 98, ayah: 5 }, // Note: Skips 97
    { page: 599, surah: 100, ayah: 5 }, // Note: Skips 99
    { page: 600, surah: 102, ayah: 8 }, // Note: Skips 101
    { page: 601, surah: 105, ayah: 5 }, // Note: Skips 103, 104
    { page: 602, surah: 108, ayah: 3 }, // Note: Skips 106, 107
    { page: 603, surah: 111, ayah: 5 }, // Note: Skips 109, 110
    { page: 604, surah: 114, ayah: 6 }  // Note: Skips 112, 113
];

let currentPageIndex = 0;
let currentTarget = pageEndings[currentPageIndex];

console.log('Applying exact page mappings from table...');

// Iterate through all ayahs starting from Surah 78 (Juz 30)
let startProcessing = false;

data.data.surahs.forEach(surah => {
    // Only process Juz 30 surahs (78+)
    if (surah.number < 78) return;

    surah.ayahs.forEach(ayah => {
        // Assign current page
        const oldPage = ayah.page;
        ayah.page = currentTarget.page;

        // Check if we reached the end of the current page
        if (surah.number === currentTarget.surah && ayah.numberInSurah === currentTarget.ayah) {
            // console.log(`Finished Page ${currentTarget.page} at ${surah.englishName} ${ayah.numberInSurah}`);

            // Move to next page target if available
            currentPageIndex++;
            if (currentPageIndex < pageEndings.length) {
                currentTarget = pageEndings[currentPageIndex];
            }
        }
    });
});

console.log('Writing to quran.json...');
fs.writeFileSync('public/quran.json', JSON.stringify(data));
console.log('Done.');

// Verify
console.log('\n=== VERIFICATION ===');
data.data.surahs.forEach(surah => {
    if (surah.number < 78) return;
    surah.ayahs.forEach(ayah => {
        // Check specifically the boundary conditions or random samples
        // Checking just the ones in the table
        const target = pageEndings.find(p => p.surah === surah.number && p.ayah === ayah.numberInSurah);
        if (target) {
            if (ayah.page !== target.page) {
                console.log(`ERROR: ${surah.englishName} ${ayah.numberInSurah} is on page ${ayah.page}, expected ${target.page}`);
            } else {
                // console.log(`OK: ${surah.englishName} ${ayah.numberInSurah} is on page ${ayah.page}`);
            }
        }
    });
});
console.log('Verification check complete.');
