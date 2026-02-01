const fs = require('fs');
const path = require('path');

// --- Configuration ---
const INPUT_FILE = path.join(__dirname, 'public', 'quran.json');
const OUTPUT_FILE = path.join(__dirname, 'constants', 'mutashabiha_data_full.json');

// --- Helper Functions ---

function normalizeText(text) {
    if (!text) return "";
    return text.replace(/[\u064B-\u065F\u06D6-\u06DC\u06DF-\u06E8\u06EA-\u06ED]/g, "");
}

function getWords(text) {
    return normalizeText(text).trim().split(/\s+/).filter(w => w.length > 0);
}

function getNGrams(words, n) {
    const grams = new Set();
    for (let i = 0; i <= words.length - n; i++) {
        grams.add(words.slice(i, i + n).join('|'));
    }
    return grams;
}

// --- Rule Checkers ---

function checkStartMatch(words1, words2) {
    // Check for longest matching prefix (up to 4 words)
    let maxMatch = 0;
    let matchText = '';

    for (let len = Math.min(4, words1.length, words2.length); len >= 1; len--) {
        let match = true;
        for (let i = 0; i < len; i++) {
            if (words1[i] !== words2[i]) {
                match = false;
                break;
            }
        }
        if (match) {
            maxMatch = len;
            matchText = words1.slice(0, len).join(' ');
            break;
        }
    }

    if (maxMatch > 0) {
        return { type: 'START', score: maxMatch, match: matchText };
    }
    return null;
}

function checkEndMatch(words1, words2) {
    // Check for longest matching suffix (up to 4 words)
    const l1 = words1.length;
    const l2 = words2.length;
    let maxMatch = 0;
    let matchText = '';

    for (let len = Math.min(4, l1, l2); len >= 1; len--) {
        let match = true;
        for (let i = 0; i < len; i++) {
            if (words1[l1 - len + i] !== words2[l2 - len + i]) {
                match = false;
                break;
            }
        }
        if (match) {
            maxMatch = len;
            matchText = words1.slice(l1 - len).join(' ');
            break;
        }
    }

    if (maxMatch > 0) {
        return { type: 'END', score: maxMatch, match: matchText };
    }
    return null;
}

function checkMiddleMatch(words1, grams2, grams3, grams4) {
    // Check for longest consecutive match (2-4 words) in middle
    // Priority: 4-grams > 3-grams > 2-grams

    // Check 4-grams
    for (let i = 0; i <= words1.length - 4; i++) {
        const gram = words1.slice(i, i + 4).join('|');
        if (grams4.has(gram)) {
            return { type: 'MIDDLE', score: 4, match: gram.replace(/\|/g, ' ') };
        }
    }

    // Check 3-grams
    for (let i = 0; i <= words1.length - 3; i++) {
        const gram = words1.slice(i, i + 3).join('|');
        if (grams3.has(gram)) {
            return { type: 'MIDDLE', score: 3, match: gram.replace(/\|/g, ' ') };
        }
    }

    // Check 2-grams (bigrams)
    for (let i = 0; i <= words1.length - 2; i++) {
        const gram = words1.slice(i, i + 2).join('|');
        if (grams2.has(gram)) {
            return { type: 'MIDDLE', score: 2, match: gram.replace(/\|/g, ' ') };
        }
    }

    return null;
}

// --- Main Execution ---

try {
    console.log("Loading Quran data...");
    const rawData = fs.readFileSync(INPUT_FILE, 'utf8');
    const quranData = JSON.parse(rawData);

    let allAyahs = [];
    quranData.data.surahs.forEach(surah => {
        surah.ayahs.forEach(ayah => {
            const w = getWords(ayah.text);
            allAyahs.push({
                id: ayah.number,
                surah: surah.number,
                ayahNum: ayah.numberInSurah,
                text: ayah.text,
                words: w,
                bigrams: getNGrams(w, 2),
                trigrams: getNGrams(w, 3),
                tetragrams: getNGrams(w, 4)
            });
        });
    });

    console.log(`Loaded ${allAyahs.length} Ayahs. Pre-calculating word frequencies...`);

    // Calculate word frequencies per Surah (≥4 characters, ≥3 occurrences)
    const surahWordCounts = new Map();
    allAyahs.forEach(a => {
        if (!surahWordCounts.has(a.surah)) surahWordCounts.set(a.surah, new Map());
        const counts = surahWordCounts.get(a.surah);
        a.words.forEach(w => {
            if (w.length >= 4) {
                counts.set(w, (counts.get(w) || 0) + 1);
            }
        });
    });

    // Mark frequent words for each ayah
    allAyahs.forEach(a => {
        const counts = surahWordCounts.get(a.surah);
        a.frequentWords = new Set();
        a.words.forEach(w => {
            if (counts.get(w) >= 3) a.frequentWords.add(w);
        });
    });

    const outputData = {};
    const ayahJuzMap = new Map();
    quranData.data.surahs.forEach(s => {
        s.ayahs.forEach(a => {
            ayahJuzMap.set(a.number, a.juz);
        });
    });

    function addMatch(srcId, targetId, ruleType, matchText) {
        const juz = ayahJuzMap.get(srcId);
        if (!outputData[juz]) outputData[juz] = [];

        let entry = outputData[juz].find(e => e.src.ayah === srcId);

        if (!entry) {
            entry = { src: { ayah: srcId }, muts: [] };
            outputData[juz].push(entry);
        }

        const exists = entry.muts.find(m => m.ayah === targetId);
        if (!exists) {
            entry.muts.push({
                ayah: targetId,
                _rule: ruleType,
                _match: matchText
            });
        }
    }

    console.log("Processing matches (with expanded rules)...");

    let matchCount = 0;
    const start = Date.now();

    for (let i = 0; i < allAyahs.length; i++) {
        const A = allAyahs[i];

        if (i % 1000 === 0) {
            console.log(`  Processing ayah ${i}/${allAyahs.length}...`);
        }

        for (let j = 0; j < allAyahs.length; j++) {
            if (i === j) continue;
            const B = allAyahs[j];

            if (A.words.length < 2 || B.words.length < 2) continue;

            let bestMatch = null;

            // Rule 1: Start (up to 4 words)
            const startM = checkStartMatch(A.words, B.words);
            if (startM && (!bestMatch || startM.score > bestMatch.score)) {
                bestMatch = startM;
            }

            // Rule 2: End (up to 4 words)
            const endM = checkEndMatch(A.words, B.words);
            if (endM && (!bestMatch || endM.score > bestMatch.score)) {
                bestMatch = endM;
            }

            // Rule 3: Middle (2-4 word consecutive phrases)
            if (!startM && !endM) { // Only check middle if no start/end found
                const midM = checkMiddleMatch(A.words, B.bigrams, B.trigrams, B.tetragrams);
                if (midM && (!bestMatch || midM.score > bestMatch.score)) {
                    bestMatch = midM;
                }
            }

            // Rule 4: Frequent Words (same Surah only, ≥3 times, ≥4 chars)
            if (!bestMatch && A.surah === B.surah) {
                for (let w of A.frequentWords) {
                    if (B.frequentWords.has(w)) {
                        bestMatch = { type: 'FREQ', score: 0.5, match: w };
                        break;
                    }
                }
            }

            if (bestMatch) {
                addMatch(A.id, B.id, bestMatch.type, bestMatch.match);
                matchCount++;
            }
        }
    }

    const elapsed = ((Date.now() - start) / 1000).toFixed(1);
    console.log(`Found ${matchCount} total matches in ${elapsed}s`);

    // Sort matches within each entry by rule priority
    const rulePriority = { 'START': 1, 'END': 2, 'MIDDLE': 3, 'FREQ': 4 };
    Object.values(outputData).forEach(juzData => {
        juzData.forEach(entry => {
            entry.muts.sort((a, b) => {
                const prioA = rulePriority[a._rule] || 99;
                const prioB = rulePriority[b._rule] || 99;
                return prioA - prioB;
            });

            // Assign final rule property
            entry.muts.forEach(m => {
                m.rule = m._rule;
                delete m._rule;
                delete m._match; // Optional: remove match text to save space
            });
        });
    });

    console.log("Writing output...");
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(outputData, null, 0));

    // Statistics
    let totalSourceAyahs = 0;
    let totalConnections = 0;
    Object.values(outputData).forEach(juzData => {
        totalSourceAyahs += juzData.length;
        juzData.forEach(entry => {
            totalConnections += entry.muts.length;
        });
    });

    console.log("\n=== Generation Complete ===");
    console.log(`Total source ayahs: ${totalSourceAyahs}`);
    console.log(`Total connections: ${totalConnections}`);
    console.log(`Average matches per source: ${(totalConnections / totalSourceAyahs).toFixed(1)}`);
    console.log(`Output saved to: ${OUTPUT_FILE}`);

} catch (error) {
    console.error("Error:", error);
    process.exit(1);
}
