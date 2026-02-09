const fs = require('fs');
const path = require('path');

// --- Configuration ---
const SOURCE_SURAH = 3; // Al-Imran
const SKIP_SURAHS = new Set([2, 3, 4]); // Skip already done or self
const MIN_WORDS = 4;
const MAX_WORDS = 20;

const COMMON_WORDS = new Set([
    'في', 'من', 'على', 'الي', 'إلي', 'عن', 'ما', 'لا', 'يا', 'ان', 'أن', 'و', 'ف', 'ب', 'ل', 'او', 'أو', 'ثم'
]);

// --- Paths ---
const QURAN_JSON_PATH = path.join(__dirname, '../public/quran.json');
const APP_DATA_PATH = path.join(__dirname, '../src/data/custom_mutashabihat/imran_rest_generated.txt');

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

function normalize(text) {
    if (!text) return "";
    return text
        .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED\u0610-\u061A]/g, '')
        .replace(/[\u0622\u0623\u0625\u0671]/g, '\u0627')
        .replace(/[\u0649]/g, '\u064A')
        .replace(/[\u0629]/g, '\u0647')
        .replace(/[^\u0621-\u064A\s]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
}

async function runAnalysis() {
    console.log("⏳ Loading Quran Data...");
    let quranData;
    try {
        const raw = fs.readFileSync(QURAN_JSON_PATH, 'utf8');
        quranData = JSON.parse(raw);
    } catch (e) {
        console.error("Failed to read quran.json:", e.message);
        return;
    }

    const sourceSurahData = quranData.data.surahs.find(s => s.number === SOURCE_SURAH);
    const otherSurahs = quranData.data.surahs.filter(s => !SKIP_SURAHS.has(s.number));

    function prepareAyah(ayah) {
        let text = ayah.text;
        // Strip Bismillah from the first ayah
        if (ayah.numberInSurah === 1 && text.startsWith("بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ")) {
            if (text.length > 39) {
                text = text.substring(39).trim();
            }
        }

        const rawWords = text.split(' ');
        const processed = [];
        rawWords.forEach(raw => {
            const clean = normalize(raw);
            if (clean.length > 0) processed.push({ raw, norm: clean });
        });
        return { num: ayah.numberInSurah, text: text, words: processed };
    }

    console.log("🛠️ Preparing Source Ayahs (Al-Imran)...");
    const sourceAyahs = sourceSurahData.ayahs.map(prepareAyah);

    const matches = [];

    console.log(`🚀 Starting Strict Analysis for Al-Imran against ${otherSurahs.length} Surahs...`);
    console.time("analysis");

    for (const targetSurah of otherSurahs) {
        const targetAyahs = targetSurah.ayahs.map(prepareAyah);

        for (const src of sourceAyahs) {
            const srcLen = src.words.length;
            if (srcLen < MIN_WORDS) continue;

            for (let i = 0; i <= srcLen - MIN_WORDS; i++) {
                for (const tgt of targetAyahs) {
                    const tgtLen = tgt.words.length;
                    if (tgtLen < MIN_WORDS) continue;

                    for (let j = 0; j <= tgtLen - MIN_WORDS; j++) {
                        let mismatches = 0;
                        let lastMismatchIdx = -1;
                        let k = 0;
                        const limit = Math.min(MAX_WORDS, srcLen - i, tgtLen - j);

                        let maxExactLen = 0;
                        let maxPartialLen = 0;

                        for (k = 0; k < limit; k++) {
                            if (src.words[i + k].norm !== tgt.words[j + k].norm) {
                                mismatches++;
                                lastMismatchIdx = k;
                            }
                            if (mismatches > 1) break;

                            const currentLen = k + 1;
                            if (currentLen >= MIN_WORDS) {
                                let baseWordsCount = 0;
                                for (let m = 0; m < currentLen; m++) {
                                    if (!COMMON_WORDS.has(src.words[i + m].norm)) baseWordsCount++;
                                }

                                const isSubstantial = (currentLen >= 4 && baseWordsCount >= 3) || (currentLen > 6);
                                if (isSubstantial) {
                                    if (mismatches === 0) {
                                        maxExactLen = currentLen;
                                    } else {
                                        const dist = getLevenshteinDistance(src.words[i + lastMismatchIdx].norm, tgt.words[j + lastMismatchIdx].norm);
                                        if (dist <= 2) maxPartialLen = currentLen;
                                    }
                                }
                            }
                        }

                        let finalLen = 0;
                        let finalType = '';

                        if (maxExactLen >= MIN_WORDS) {
                            finalLen = maxExactLen;
                            finalType = 'EXACT';
                        } else if (maxPartialLen >= MIN_WORDS) {
                            finalLen = maxPartialLen;
                            finalType = 'PARTIAL';
                        }

                        if (finalLen > 0) {
                            matches.push({
                                type: finalType,
                                source: { surah: SOURCE_SURAH, ayah: src.num, start: i },
                                target: { surah: targetSurah.number, ayah: tgt.num, start: j },
                                length: finalLen
                            });
                        }
                    }
                }
            }
        }
    }
    console.timeEnd("analysis");

    console.log(`Found ${matches.length} matches. Deduplicating...`);

    matches.sort((a, b) => {
        if (a.type !== b.type) return a.type === 'EXACT' ? -1 : 1;
        return b.length - a.length;
    });

    const uniqueMatches = [];
    for (const m of matches) {
        const isOverlapping = uniqueMatches.some(approved =>
            approved.source.ayah === m.source.ayah &&
            approved.target.surah === m.target.surah &&
            approved.target.ayah === m.target.ayah &&
            (m.source.start < (approved.source.start + approved.length) &&
                approved.source.start < (m.source.start + m.length))
        );

        if (!isOverlapping) {
            uniqueMatches.push(m);
        }
    }

    console.log(`Final count: ${uniqueMatches.length} unique matches.`);

    const exportGrouped = {};
    uniqueMatches.forEach(m => {
        const key = `${m.source.surah}:${m.source.ayah}`;
        if (!exportGrouped[key]) exportGrouped[key] = new Set();
        exportGrouped[key].add(`${m.target.surah}:${m.target.ayah}`);
    });

    const appTxt = Object.entries(exportGrouped)
        .sort(([keyA], [keyB]) => {
            const [, aA] = keyA.split(':').map(Number);
            const [, aB] = keyB.split(':').map(Number);
            return aA - aB;
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
        console.log(`✅ Success! Data saved to: ${APP_DATA_PATH}`);
    } catch (e) {
        console.error("❌ Failed to save data:", e.message);
    }
}

runAnalysis();
