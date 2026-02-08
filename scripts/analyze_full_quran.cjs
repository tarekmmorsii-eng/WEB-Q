const fs = require('fs');
const path = require('path');

// --- Configuration ---
const MIN_WORDS = 3;
const MAX_WORDS = 20;
const JUZ_30_START_SURAH = 78; // An-Naba

// Words to NOT count as 'base' words in short matches
// Words to NOT count as 'base' words in short matches
const COMMON_WORDS = new Set([
    'في', 'من', 'على', 'الي', 'إلي', 'عن', 'ما', 'لا', 'يا', 'ان', 'أن', 'و', 'ف', 'ب', 'ل', 'او', 'أو', 'ثم', 'كان', 'كانت', 'قال', 'قالت', 'قل', 'هم', 'كم', 'تم',
    'بسم', 'الله', 'الرحمن', 'الرحيم' // Added Basmalah words to common filter for stricter short match check
]);

const BASMALAH_TEXT = normalize("بسم الله الرحمن الرحيم");

// --- Paths ---
const QURAN_JSON_PATH = path.join(__dirname, '../public/quran.json');
const REPORT_PATH = path.join(__dirname, 'full_quran_report.txt');
const APP_DATA_PATH = path.join(__dirname, '../src/data/custom_mutashabihat/full_quran_generated.txt');

// --- Helper: Levenshtein Distance ---
function getLevenshteinDistance(a, b) {
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;
    const matrix = [];
    for (let i = 0; i <= b.length; i++) matrix[i] = [i];
    for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) === a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j] + 1);
            }
        }
    }
    return matrix[b.length][a.length];
}

// --- Helper: Normalize Arabic Text ---
function normalize(text) {
    if (!text) return "";
    return text
        // 1. Remove Tashkeel and Madd symbols
        .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED\u0610-\u061A]/g, '')
        // 2. Unify Alefs
        .replace(/[\u0622\u0623\u0625\u0671]/g, '\u0627')
        // 3. Unify Yaa/Alif Maqsura
        .replace(/[\u0649]/g, '\u064A')
        // 4. Unify Ta Marbuta -> Ha
        .replace(/[\u0629]/g, '\u0647')
        // 5. Remove anything that isn't a standard Arabic letter or space
        .replace(/[^\u0621-\u064A\s]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
}

// --- Helper: Prepare Ayah words with Raw/Norm mapping ---
function prepareAyah(ayah) {
    const rawWords = ayah.text.split(' ');
    const processed = [];

    rawWords.forEach(raw => {
        const clean = normalize(raw);
        if (clean.length > 0) {
            processed.push({ raw: raw, norm: clean });
        }
    });

    return {
        num: ayah.numberInSurah,
        text: ayah.text,
        words: processed // Array of {raw, norm}
    };
}

async function runAnalysis() {
    console.log("Loading Quran Data...");
    let quranData;
    try {
        const raw = fs.readFileSync(QURAN_JSON_PATH, 'utf8');
        quranData = JSON.parse(raw);
    } catch (e) {
        console.error("Failed to read quran.json:", e.message);
        return;
    }

    // Filter Surahs (1 to 77)
    const surahs = quranData.data.surahs.filter(s => s.number < JUZ_30_START_SURAH);
    console.log(`Analyzing ${surahs.length} Surahs (1 to ${JUZ_30_START_SURAH - 1})...`);

    // Pre-process all ayahs to avoid repeated normalization
    console.log("Pre-processing Ayahs...");
    const preparedSurahs = surahs.map(s => ({
        number: s.number,
        name: s.name,
        ayahs: s.ayahs.map(prepareAyah)
    }));

    const matches = [];

    console.time("Full Analysis");

    // Compare each Surah with every other Surah (and itself)
    // We strictly use i and j where j > i to avoid duplicate comparisons (A vs B and B vs A)
    // For self-comparison (A vs A), we can include it if needed, but usually 'mutashabihat' implies difference or repetition.
    // Let's include self-comparison but ensure we don't match an ayah with itself.

    let comparisonCount = 0;

    for (let i = 0; i < preparedSurahs.length; i++) {
        const srcSurah = preparedSurahs[i];

        // Progress logging
        if (i % 5 === 0) console.log(`Processing Surah ${srcSurah.number}: ${srcSurah.name}...`);

        for (let j = 0; j < preparedSurahs.length; j++) {
            const tgtSurah = preparedSurahs[j];

            // OPTIMIZATION: Only compare if tgtSurah index >= srcSurah index
            // Actually, we want Full Mesh for the report to be easy (Source -> Targets), 
            // but for generating the unique file, we can just do one way and then flip.
            // However, to keep logic simple and consistent with previous script, let's do one-way (j >= i)
            // and then when generating the file, we ensure we register both directions (A->B and B->A).
            // BUT: The sliding window logic is directional (Source Window vs Target Window). 
            // If we only do A->B, we might miss if A is shorter than B or vice versa? 
            // No, the sliding window checks all sub-windows.
            // Let's stick to j >= i to save 50% time, and then double the results at the end.

            if (j < i) continue;

            // Inner Loop: Compare Ayahs
            for (const src of srcSurah.ayahs) {
                const srcLen = src.words.length;
                if (srcLen < MIN_WORDS) continue;

                for (let x = 0; x <= srcLen - MIN_WORDS; x++) {

                    for (const tgt of tgtSurah.ayahs) {
                        // Avoid matching same ayah in same surah (Self-match)
                        if (i === j && src.num === tgt.num) continue;

                        const tgtLen = tgt.words.length;
                        if (tgtLen < MIN_WORDS) continue;

                        for (let y = 0; y <= tgtLen - MIN_WORDS; y++) {

                            let mismatches = 0;
                            let lastMismatchIdx = -1;
                            let k = 0;
                            const limit = Math.min(MAX_WORDS, srcLen - x, tgtLen - y);

                            let maxExactLen = 0;
                            let maxPartialLen = 0;

                            for (k = 0; k < limit; k++) {
                                if (src.words[x + k].norm !== tgt.words[y + k].norm) {
                                    mismatches++;
                                    lastMismatchIdx = k;
                                }

                                if (mismatches > 1) break;

                                const currentLen = k + 1;

                                // Explicitly check if the potential match is the Basmalah
                                const currentSrcText = src.words.slice(x, x + currentLen).map(w => w.norm).join(' ');
                                if (currentSrcText === BASMALAH_TEXT && src.num === 1 && srcSurah.number !== 1 && srcSurah.number !== 27) {
                                    // Skip Basmalah except in Fatihah (1) and Naml (27) where it's part of the text usually counted
                                    // Actually, in most mishafs, Basmalah is Ayah 1 ONLY in Fatihah.
                                    // In other surahs, it's a header (Ayah 0).
                                    // But quran.json might treat it differently. 
                                    // If src.num is 1 and text is Basmalah, we ignore it UNLESS it's Fatihah.
                                    // User wants to exclude it generally as "mutashabihat".
                                    continue;
                                }

                                if (currentLen >= MIN_WORDS) {
                                    // Base word check
                                    let baseWordsCount = 0;
                                    for (let m = 0; m < currentLen; m++) {
                                        if (!COMMON_WORDS.has(src.words[x + m].norm)) {
                                            baseWordsCount++;
                                        }
                                    }

                                    // Stricter rule: Must have meaningful content
                                    const isSubstantial = (currentLen >= 4 && baseWordsCount >= 3) || (currentLen > 6) || (currentLen === 3 && baseWordsCount >= 3);

                                    // FILTER: If it matches "Alif Lam Mim" or similar disjointed letters perfectly, allow it?
                                    // User said "Al-Fatihah 1 matching Al-Baqarah 1" which is wrong. 
                                    // Al-Fatihah 1 is Basmalah. Al-Baqarah 1 is Alif Lam Mim. They shouldn't match.
                                    // If they matched, it implies a bug in comparison or data.
                                    // The previous logic allowed matches if mismatches <= 1. 
                                    // "Bismillah..." vs "Alif Lam Mim" -> completely different. Mismatches would be high.
                                    // UNLESS the sliding window x/y mapping was wrong.

                                    if (isSubstantial) {
                                        if (mismatches === 0) {
                                            maxExactLen = currentLen;
                                        } else {
                                            const srcWord = src.words[x + lastMismatchIdx].norm;
                                            const tgtWord = tgt.words[y + lastMismatchIdx].norm;
                                            const dist = getLevenshteinDistance(srcWord, tgtWord);
                                            if (dist <= 2) { // Allow minor changes
                                                maxPartialLen = currentLen;
                                            }
                                        }
                                    }
                                }
                            }

                            let finalLen = 0;
                            let finalType = '';
                            let finalMismatches = 0;

                            if (maxExactLen >= MIN_WORDS) {
                                finalLen = maxExactLen;
                                finalType = 'EXACT';
                                finalMismatches = 0;
                            } else if (maxPartialLen >= MIN_WORDS) {
                                finalLen = maxPartialLen;
                                finalType = 'PARTIAL';
                                finalMismatches = 1;
                            }

                            if (finalLen > 0) {
                                const matchText = src.words.slice(x, x + finalLen).map(w => w.raw).join(' ');
                                matches.push({
                                    type: finalType,
                                    text: matchText,
                                    source: { surah: srcSurah.number, ayah: src.num, start: x },
                                    target: { surah: tgtSurah.number, ayah: tgt.num, start: y },
                                    length: finalLen,
                                    mismatches: finalMismatches
                                });
                            }
                        }
                    }
                }
            }
        }
    }
    console.timeEnd("Full Analysis");
    console.log(`Found ${matches.length} raw matches.`);

    // --- Deduplication ---
    // Sort by Quality (Exact > Partial) then Length (Longest first)
    matches.sort((a, b) => {
        if (a.type !== b.type) return a.type === 'EXACT' ? -1 : 1;
        return b.length - a.length;
    });

    const uniqueMatches = [];
    // We need to verify bidirectional uniqueness now.
    // If we have A -> B, we implicitly have B -> A.
    // But since we are generating a file where `Source|Target`, we want to list them under Source.

    // Helper to check overlap
    const isOverlapping = (m1, m2) => {
        return (
            m1.source.surah === m2.source.surah && m1.source.ayah === m2.source.ayah &&
            m1.target.surah === m2.target.surah && m1.target.ayah === m2.target.ayah &&
            (m1.source.start < (m2.source.start + m2.length) && m2.source.start < (m1.source.start + m1.length)) &&
            (m1.target.start < (m2.target.start + m2.length) && m2.target.start < (m1.target.start + m1.length))
        );
    }

    for (const m of matches) {
        if (!uniqueMatches.some(approved => isOverlapping(m, approved))) {
            uniqueMatches.push(m);
        }
    }

    console.log(`Reduced to ${uniqueMatches.length} unique one-way matches.`);

    // --- Export to File ---
    // We need to expand one-way matches to two-way for the file
    // i.e. if 2:10 matches 3:20, we need entries for 2:10->3:20 AND 3:20->2:10

    const exportGrouped = {};

    uniqueMatches.forEach(m => {
        // Forward: Source -> Target
        const keyFwd = `${m.source.surah}:${m.source.ayah}`;
        if (!exportGrouped[keyFwd]) exportGrouped[keyFwd] = new Set();
        exportGrouped[keyFwd].add(`${m.target.surah}:${m.target.ayah}`);

        // Reverse: Target -> Source (if different locations)
        // If it's a self-match within same ayah (shouldn't happen due to logic) we skip reverse
        if (m.source.surah !== m.target.surah || m.source.ayah !== m.target.ayah) {
            const keyRev = `${m.target.surah}:${m.target.ayah}`;
            if (!exportGrouped[keyRev]) exportGrouped[keyRev] = new Set();
            exportGrouped[keyRev].add(`${m.source.surah}:${m.source.ayah}`);
        }
    });

    const appTxt = Object.entries(exportGrouped)
        .sort(([keyA], [keyB]) => {
            const [sA, aA] = keyA.split(':').map(Number);
            const [sB, aB] = keyB.split(':').map(Number);
            return sA !== sB ? sA - sB : aA - aB;
        })
        .map(([src, targetSet]) => {
            const sortedTargets = Array.from(targetSet).sort((tA, tB) => {
                const [ssA, aaA] = tA.split(':').map(Number);
                const [ssB, aaB] = tB.split(':').map(Number);
                return ssA !== ssB ? ssA - ssB : aaA - aaB;
            });
            return `${src}|${sortedTargets.join(',')}`;
        })
        .join('\n');

    try {
        fs.writeFileSync(APP_DATA_PATH, appTxt, 'utf8');
        console.log(`✅ App data exported to: ${APP_DATA_PATH}`);
        console.log(`Total Source Ayahs with Mutashabihat: ${Object.keys(exportGrouped).length}`);
    } catch (e) {
        console.error("Failed to write app data:", e);
    }
}

runAnalysis();
