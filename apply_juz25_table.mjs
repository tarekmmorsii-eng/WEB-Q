import fs from 'fs';

// Read data
const data = JSON.parse(fs.readFileSync('public/quran.json', 'utf8'));

// The exact table provided by the user for Juz 25:
// Page | Last Surah Number | Last Ayah Number
const pageEndings = [
    { page: 482, surah: 41, ayah: 54 }, // Fussilat
    { page: 483, surah: 42, ayah: 10 }, // Ash-Shura
    { page: 484, surah: 42, ayah: 15 }, // Ash-Shura
    { page: 485, surah: 42, ayah: 22 }, // Ash-Shura
    { page: 486, surah: 42, ayah: 31 }, // Ash-Shura
    { page: 487, surah: 42, ayah: 44 }, // Ash-Shura
    { page: 488, surah: 42, ayah: 51 }, // Ash-Shura
    { page: 489, surah: 43, ayah: 10 }, // Az-Zukhruf
    { page: 490, surah: 43, ayah: 22 }, // Az-Zukhruf
    { page: 491, surah: 43, ayah: 33 }, // Az-Zukhruf
    { page: 492, surah: 43, ayah: 47 }, // Az-Zukhruf
    { page: 493, surah: 43, ayah: 60 }, // Az-Zukhruf
    { page: 494, surah: 43, ayah: 73 }, // Az-Zukhruf
    { page: 495, surah: 43, ayah: 89 }, // Az-Zukhruf
    { page: 496, surah: 44, ayah: 18 }, // Ad-Dukhan
    { page: 497, surah: 44, ayah: 39 }, // Ad-Dukhan
    { page: 498, surah: 44, ayah: 59 }, // Ad-Dukhan
    { page: 499, surah: 45, ayah: 13 }, // Al-Jathiya
    { page: 500, surah: 45, ayah: 22 }, // Al-Jathiya
    { page: 501, surah: 45, ayah: 32 }  // Al-Jathiya
];

let currentPageIndex = 0;
let currentTarget = pageEndings[currentPageIndex];

console.log('Applying exact page mappings for Juz 25 (Pages 482-501)...');

// Iterate through surahs starting from Fussilat (41)
data.data.surahs.forEach(surah => {
    // Only process surahs starting from 41
    if (surah.number < 41) return;

    // Stop processing if we go beyond Surah 45
    if (surah.number > 45) return;

    surah.ayahs.forEach(ayah => {
        // SPECIAL START CONDITION FOR JUZ 25:
        // Juz 25 starts at Surah 41 Ayah 47.
        // We must NOT change pages for ayahs before 47 (they belong to Juz 24 / Pages < 482).
        if (surah.number === 41 && ayah.numberInSurah < 47) return;

        // If we exhausted our targets in the table (passed 45:32)
        if (!currentTarget) {
            // If there are leftover ayahs in Surah 45 (33-37), they belong to Page 502
            if (surah.number === 45) {
                ayah.page = 502;
            }
            return;
        }

        // Apply page
        ayah.page = currentTarget.page;

        // Check if we reached the boundary
        if (surah.number === currentTarget.surah && ayah.numberInSurah === currentTarget.ayah) {
            currentPageIndex++;
            currentTarget = pageEndings[currentPageIndex];
        }
    });
});

console.log('Juz 25 applied.');

// --- PREEMPTIVE FIX FOR SURAH 51 (Juz 26/27 Overlap) ---
// In a previous step (Juz 27 correction), we might have accidentally set Surah 51:1-30 to Page 522.
// According to Jus 26 table:
// Page 520 ends at 51:6
// Page 521 ends at 51:30
console.log('Verifying/Fixing Surah 51 start...');
const surah51 = data.data.surahs.find(s => s.number === 51);
if (surah51) {
    surah51.ayahs.forEach(ayah => {
        if (ayah.numberInSurah <= 6) {
            ayah.page = 520;
        } else if (ayah.numberInSurah <= 30) {
            ayah.page = 521;
        }
        // 31+ is Juz 27 (Page 522+), handled by previous logic correctly.
    });
}

console.log('Writing to quran.json...');
fs.writeFileSync('public/quran.json', JSON.stringify(data));
console.log('Done.');

// Verification for Juz 25
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

// Verify Surah 51 fix
const s51a1 = data.data.surahs.find(s => s.number === 51).ayahs.find(a => a.numberInSurah === 1);
console.log(`Surah 51:1 is on page ${s51a1.page} (Expected 520)`);

// Check last page of Juz 25
console.log('Page 501 ends at Surah 45 Ayah 32 (Verified by loop check logic)');

console.log('Verification check complete.');
