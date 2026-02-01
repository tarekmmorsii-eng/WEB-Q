
const fs = require('fs');
const path = require('path');

// Paths
const MUT_PATH = './public/data/mutashabihat.json';
const QURAN_PATH = './public/quran.json';

// Load Data
console.log("Loading data...");
const mutData = JSON.parse(fs.readFileSync(MUT_PATH, 'utf8'));
const quranData = JSON.parse(fs.readFileSync(QURAN_PATH, 'utf8'));

// Build Maps
const globalIdToRef = new Map(); // ID -> { surah, ayah, text }
let globalIdCounter = 0;

quranData.data.surahs.forEach(surah => {
    surah.ayahs.forEach(ayah => {
        globalIdCounter++; // 1-based Global ID
        globalIdToRef.set(globalIdCounter, {
            surah: surah.number,
            surahName: surah.name,
            ayah: ayah.numberInSurah,
            text: ayah.text
        });
    });
});

// Helper to clean text for comparison? (Optional, maybe later)

// Generate Report for Surah 7 (A'raf)
const TARGET_SURAH = 7;
let output = "# Mutashabihat Audit Report: Surah Al-A'raf (7)\n\n";
output += "| Source Ayah (A'raf) | Linked ID | Linked Ayah Ref | Linked Text | Match Status? |\n";
output += "| --- | --- | --- | --- | --- |\n";

// Flatten mutData for easy lookup: ID -> { muts: [] }
const mutLookup = new Map();
Object.keys(mutData).forEach(juz => {
    mutData[juz].forEach(entry => {
        if (entry.src && entry.src.ayah) {
            mutLookup.set(entry.src.ayah, entry.muts.map(m => m.ayah));
        }
    });
});

// Iterate A'raf ayahs (IDs 955 to 1160 approximately)
// A'raf starts at: Fatiha(7)+Baqara(286)+Imran(200)+Nisa(176)+Maida(120)+Anam(165) = 954.
// So Start ID = 955.
// A'raf has 206 ayahs.
// End ID = 954 + 206 = 1160.

for (let id = 955; id <= 1160; id++) {
    const srcRef = globalIdToRef.get(id);
    if (!srcRef) continue;

    const matches = mutLookup.get(id);
    if (matches && matches.length > 0) {
        matches.forEach(matchId => {
            const targetRef = globalIdToRef.get(matchId);
            if (targetRef) {
                // Formatting
                const srcStr = `Ayah ${srcRef.ayah}: ${srcRef.text.substring(0, 30)}...`;
                const targetStr = `Surah ${targetRef.surah} (${targetRef.surahName}) : ${targetRef.ayah}`;
                const targetText = targetRef.text;

                // Simple strict compare check
                const matchStatus = "❓"; // Manual check implied

                output += `| ${srcStr} | ${matchId} | ${targetStr} | ${targetText} | ${matchStatus} |\n`;
            }
        });
    }
}

fs.writeFileSync('mutashabihat_audit_araf.md', output);
console.log("Report generated.");
