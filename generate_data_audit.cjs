
const fs = require('fs');
const path = require('path');

// Paths
const MUT_PATH = './public/data/mutashabihat.json';
const QURAN_PATH = './public/quran.json';

// Load Data
console.log("Loading data...");
try {
    if (!fs.existsSync(MUT_PATH)) throw new Error(`File not found: ${MUT_PATH}`);
    if (!fs.existsSync(QURAN_PATH)) throw new Error(`File not found: ${QURAN_PATH}`);

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

    // Generate Report for Surah 7 (A'raf)
    let output = "# Mutashabihat Audit Report: Surah Al-A'raf (7)\n\n";
    output += "| Source Ayah (A'raf) | Linked ID | Linked Ayah Ref | Linked Text | Match Status? |\n";
    output += "| --- | --- | --- | --- | --- |\n";

    // Flatten mutData for easy lookup: ID -> { muts: [] }
    const mutLookup = new Map();
    // Support structure: { "1": [...], "2": [...] } where keys are Juz
    Object.keys(mutData).forEach(juz => {
        if (Array.isArray(mutData[juz])) {
            mutData[juz].forEach(entry => {
                if (entry.src && entry.src.ayah) {
                    mutLookup.set(entry.src.ayah, entry.muts.map(m => m.ayah));
                }
            });
        }
    });

    // Iterate A'raf ayahs (IDs 955 to 1160 approximately)
    for (let id = 955; id <= 1160; id++) {
        const srcRef = globalIdToRef.get(id);
        if (!srcRef) continue;

        const matches = mutLookup.get(id);
        if (matches && matches.length > 0) {
            matches.forEach(matchId => {
                const targetRef = globalIdToRef.get(matchId);
                if (targetRef) {
                    const srcStr = `Ayah ${srcRef.ayah}: ${srcRef.text.substring(0, 30)}...`;
                    const targetStr = `Surah ${targetRef.surah} (${targetRef.surahName}) : ${targetRef.ayah}`;
                    const targetText = targetRef.text;
                    const matchStatus = "❓";

                    output += `| ${srcStr} | ${matchId} | ${targetStr} | ${targetText} | ${matchStatus} |\n`;
                }
            });
        }
    }

    fs.writeFileSync('mutashabihat_audit_araf.md', output);
    console.log("Report generated: mutashabihat_audit_araf.md");

} catch (e) {
    console.error("Error:", e.message);
}
