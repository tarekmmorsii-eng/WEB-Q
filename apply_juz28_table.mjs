import fs from 'fs';

// Read data
const data = JSON.parse(fs.readFileSync('public/quran.json', 'utf8'));

// The exact table provided by the user for Juz 28:
// Page | Last Surah Number | Last Ayah Number
const pageEndings = [
    { page: 542, surah: 58, ayah: 6 },  // Al-Mujadila
    { page: 543, surah: 58, ayah: 11 }, // Al-Mujadila
    { page: 544, surah: 58, ayah: 21 }, // Al-Mujadila
    { page: 545, surah: 59, ayah: 3 },  // Al-Hashr
    { page: 546, surah: 59, ayah: 9 },  // Al-Hashr
    { page: 547, surah: 59, ayah: 16 }, // Al-Hashr
    { page: 548, surah: 59, ayah: 24 }, // Al-Hashr
    { page: 549, surah: 60, ayah: 5 },  // Al-Mumtahina
    { page: 550, surah: 60, ayah: 11 }, // Al-Mumtahina
    { page: 551, surah: 61, ayah: 5 },  // As-Saff
    { page: 552, surah: 61, ayah: 14 }, // As-Saff
    { page: 553, surah: 62, ayah: 8 },  // Al-Jumu'a
    { page: 554, surah: 63, ayah: 4 },  // Al-Munafiqun
    { page: 555, surah: 63, ayah: 11 }, // Al-Munafiqun
    { page: 556, surah: 64, ayah: 9 },  // At-Taghabun
    { page: 557, surah: 64, ayah: 18 }, // At-Taghabun
    { page: 558, surah: 65, ayah: 5 },  // At-Talaq
    { page: 559, surah: 65, ayah: 12 }, // At-Talaq
    { page: 560, surah: 66, ayah: 7 },  // At-Tahrim
    { page: 561, surah: 66, ayah: 12 }  // At-Tahrim
];

let currentPageIndex = 0;
let currentTarget = pageEndings[currentPageIndex];

console.log('Applying exact page mappings for Juz 28 (Pages 542-561)...');

// Iterate through surahs starting from Al-Mujadila (58)
data.data.surahs.forEach(surah => {
    // Only process surahs starting from 58
    if (surah.number < 58) return;

    // Stop processing if we go beyond Juz 28 range (into Juz 29 which starts at 67 Al-Mulk)
    // Actually our target list ends at 66:12 (end of At-Tahrim), so checking targets is safer.

    surah.ayahs.forEach(ayah => {
        // If we exhausted our targets, stop assigning (to protect Juz 29+)
        if (!currentTarget) return;

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

// Check specifically the LAST page (561) end
const checkPage561 = () => {
    const p561 = [];
    data.data.surahs.forEach(s => s.ayahs.forEach(a => {
        if (a.page === 561) p561.push(`${s.number}:${a.numberInSurah}`);
    }));
    console.log(`Page 561 ends at: ${p561[p561.length - 1]}`);
};
checkPage561();

console.log('Verification check complete.');
