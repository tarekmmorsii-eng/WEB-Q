const fs = require('fs');
const path = require('path');

const data = require('./constants/mutashabiha_data_full.json');

console.log("=== Mutashabihat Statistics ===\n");

// Count per Juz
let totalSourceAyahs = 0;
let totalConnections = 0;

Object.keys(data).forEach(juz => {
    const juzData = data[juz];
    totalSourceAyahs += juzData.length;

    juzData.forEach(entry => {
        totalConnections += entry.muts.length;
    });
});

console.log(`Total Source Ayahs (positions with mutashabihat): ${totalSourceAyahs}`);
console.log(`Total Connections (individual matches): ${totalConnections}`);
console.log(`Average matches per source ayah: ${(totalConnections / totalSourceAyahs).toFixed(1)}`);

// Al-Baqarah analysis (Surah 2, ayahs 1-286, absolute 1-286)
console.log("\n=== Al-Baqarah (Surah 2) Analysis ===");

const quranData = JSON.parse(fs.readFileSync('./public/quran.json', 'utf8'));
const baqarahStart = 1;
const baqarahEnd = 286;

let baqarahSources = 0;
let baqarahConnections = 0;

Object.values(data).forEach(juzData => {
    juzData.forEach(entry => {
        const srcAyah = Array.isArray(entry.src.ayah) ? entry.src.ayah[0] : entry.src.ayah;

        if (srcAyah >= baqarahStart && srcAyah <= baqarahEnd) {
            baqarahSources++;
            baqarahConnections += entry.muts.length;
        }
    });
});

console.log(`Source ayahs in Al-Baqarah: ${baqarahSources}`);
console.log(`Total connections from Al-Baqarah: ${baqarahConnections}`);
console.log(`Average matches per ayah: ${(baqarahConnections / baqarahSources).toFixed(1)}`);

// Sample a few to see rule distribution
console.log("\n=== Sample from Al-Baqarah ===");
let sampleCount = 0;
Object.values(data).forEach(juzData => {
    juzData.forEach(entry => {
        const srcAyah = Array.isArray(entry.src.ayah) ? entry.src.ayah[0] : entry.src.ayah;

        if (srcAyah >= baqarahStart && srcAyah <= baqarahEnd && sampleCount < 3) {
            console.log(`\nAyah ${srcAyah}:`);
            console.log(`  Total matches: ${entry.muts.length}`);

            const ruleCounts = {};
            entry.muts.forEach(mut => {
                ruleCounts[mut.rule || 'NONE'] = (ruleCounts[mut.rule || 'NONE'] || 0) + 1;
            });

            console.log(`  By rule:`, ruleCounts);
            sampleCount++;
        }
    });
});
