import fs from 'fs';

// Read data
const data = JSON.parse(fs.readFileSync('public/quran.json', 'utf8'));

// The exact table provided by the user for Juz 27:
// Page | Last Surah Number | Last Ayah Number
const pageEndings = [
    { page: 522, surah: 51, ayah: 51 }, // Adh-Dhariyat
    { page: 523, surah: 52, ayah: 14 }, // At-Tur
    { page: 524, surah: 52, ayah: 31 }, // At-Tur
    { page: 525, surah: 52, ayah: 49 }, // At-Tur
    { page: 526, surah: 53, ayah: 26 }, // An-Najm
    { page: 527, surah: 53, ayah: 44 }, // An-Najm
    { page: 528, surah: 54, ayah: 6 },  // Al-Qamar
    { page: 529, surah: 54, ayah: 27 }, // Al-Qamar
    { page: 530, surah: 54, ayah: 49 }, // Al-Qamar
    { page: 531, surah: 55, ayah: 18 }, // Ar-Rahman
    { page: 532, surah: 55, ayah: 41 }, // Ar-Rahman
    { page: 533, surah: 55, ayah: 69 }, // Ar-Rahman
    { page: 534, surah: 56, ayah: 16 }, // Al-Waqi'a
    { page: 535, surah: 56, ayah: 50 }, // Al-Waqi'a
    { page: 536, surah: 56, ayah: 76 }, // Al-Waqi'a
    { page: 537, surah: 57, ayah: 3 },  // Al-Hadid
    { page: 538, surah: 57, ayah: 11 }, // Al-Hadid
    { page: 539, surah: 57, ayah: 18 }, // Al-Hadid
    { page: 540, surah: 57, ayah: 24 }, // Al-Hadid
    { page: 541, surah: 57, ayah: 29 }  // Al-Hadid
];

let currentPageIndex = 0;
let currentTarget = pageEndings[currentPageIndex];

console.log('Applying exact page mappings for Juz 27 (Pages 522-541)...');

// Iterate through surahs starting from Adh-Dhariyat (51)
data.data.surahs.forEach(surah => {
    // Only process surahs starting from 51
    if (surah.number < 51) return;

    surah.ayahs.forEach(ayah => {
        // If we exhausted our targets, stop assigning
        if (!currentTarget) return;

        // SKIP if current page target is already past our range
        // This is important so we don't accidentally re-write already corrected Juz 28 pages
        if (currentTarget.page > 541) return;

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

// Check specifically the LAST page (541) end
const checkPage541 = () => {
    const p541 = [];
    data.data.surahs.forEach(s => s.ayahs.forEach(a => {
        if (a.page === 541) p541.push(`${s.number}:${a.numberInSurah}`);
    }));
    if (p541.length > 0) {
        console.log(`Page 541 ends at: ${p541[p541.length - 1]}`);
    } else {
        console.log('Page 541 is empty!');
    }
};
checkPage541();

console.log('Verification check complete.');
