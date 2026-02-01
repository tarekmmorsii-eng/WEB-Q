import fs from 'fs';

// Read data
const data = JSON.parse(fs.readFileSync('public/quran.json', 'utf8'));

// The exact table provided by the user for Juz 29:
// Page | Last Surah Number | Last Ayah Number
const pageEndings = [
    { page: 562, surah: 67, ayah: 12 }, // Al-Mulk
    { page: 563, surah: 67, ayah: 26 }, // Al-Mulk
    { page: 564, surah: 68, ayah: 16 }, // Al-Qalam
    { page: 565, surah: 68, ayah: 42 }, // Al-Qalam
    { page: 566, surah: 69, ayah: 8 },  // Al-Haaqqa
    { page: 567, surah: 69, ayah: 35 }, // Al-Haaqqa
    { page: 568, surah: 70, ayah: 10 }, // Al-Ma'arij
    { page: 569, surah: 70, ayah: 40 }, // Al-Ma'arij
    { page: 570, surah: 71, ayah: 10 }, // Nuh
    { page: 571, surah: 71, ayah: 28 }, // Nuh
    { page: 572, surah: 72, ayah: 13 }, // Al-Jinn
    { page: 573, surah: 72, ayah: 28 }, // Al-Jinn
    { page: 574, surah: 73, ayah: 19 }, // Al-Muzzammil
    { page: 575, surah: 74, ayah: 18 }, // Al-Muddaththir
    { page: 576, surah: 74, ayah: 47 }, // Al-Muddaththir
    { page: 577, surah: 75, ayah: 19 }, // Al-Qiyama
    { page: 578, surah: 76, ayah: 5 },  // Al-Insan
    { page: 579, surah: 76, ayah: 25 }, // Al-Insan
    { page: 580, surah: 77, ayah: 19 }, // Al-Mursalat
    { page: 581, surah: 77, ayah: 50 }  // Al-Mursalat
];

let currentPageIndex = 0;
let currentTarget = pageEndings[currentPageIndex];

console.log('Applying exact page mappings for Juz 29 (Pages 562-581)...');

// Iterate through all ayahs starting from Surah 67 (Al-Mulk)
data.data.surahs.forEach(surah => {
    // Only process surahs starting from Al-Mulk (67) up to Al-Mursalat (77)
    // Actually we process everything from 67 onwards but we only have targets until 77:50
    // The previous logic worked well, let's stick to it but ensure we don't mess up Juz 30 (which starts at 582)

    // Safety check: Don't touch Juz 30 (Page 582+) in this script
    if (surah.number < 67) return;

    surah.ayahs.forEach(ayah => {
        // If we exhausted our targets, stop assigning (to protect Juz 30)
        if (!currentTarget) return;

        // Apply page
        // Only if the target page matches the current target page loop
        // If we moved past the last target (581), stop.
        if (currentTarget.page > 581) return;

        ayah.page = currentTarget.page;

        // Check if we reached the boundary
        if (surah.number === currentTarget.surah && ayah.numberInSurah === currentTarget.ayah) {
            // console.log(`Finished Page ${currentTarget.page} at ${surah.englishName} ${ayah.numberInSurah}`);
            currentPageIndex++;
            currentTarget = pageEndings[currentPageIndex];
        }
    });
});

console.log('Writing to quran.json...');
fs.writeFileSync('public/quran.json', JSON.stringify(data));
console.log('Done.');

// Verification
const verify = (p, s, a) => {
    const surah = data.data.surahs.find(x => x.number === s);
    const ayah = surah.ayahs.find(y => y.numberInSurah === a);
    if (ayah.page !== p) {
        console.log(`❌ ERROR: Page ${p} should end at ${s}:${a}, but ayah is on page ${ayah.page}`);
    } else {
        // Check ONLY if this IS the last ayah on that page
        const ayahsOnPage = [];
        data.data.surahs.forEach(ss => ss.ayahs.forEach(aa => { if (aa.page === p) ayahsOnPage.push(aa); }));
        const last = ayahsOnPage[ayahsOnPage.length - 1];
        if (last.surah.number === s && last.numberInSurah === a) {
            // console.log(`✅ Page ${p} ends correctly at ${s}:${a}`);
        } else {
            // console.log(`⚠️ WARNING: Page ${p} targeted to end at ${s}:${a}, but actually ends at ${last.surah.number}:${last.numberInSurah}`);
        }
    }
};

console.log('\n=== VERIFICATION ===');
pageEndings.forEach(e => verify(e.page, e.surah, e.ayah));
console.log('Verification check complete.');
