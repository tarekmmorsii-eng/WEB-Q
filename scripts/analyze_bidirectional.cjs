const fs = require('fs');
const path = require('path');

// --- Configuration ---
const FOCUS_SURAHS = [2, 3, 4]; // Baqarah, Imran, Nisa
const MIN_WORDS = 4;
const MAX_WORDS = 20;

const COMMON_WORDS = new Set([
    'في', 'من', 'على', 'الي', 'إلي', 'عن', 'ما', 'لا', 'يا', 'ان', 'أن', 'و', 'ف', 'ب', 'ل', 'او', 'أو', 'ثم'
]);

// --- Paths ---
const QURAN_JSON_PATH = path.join(__dirname, '../public/quran.json');
const DATA_DIR = path.join(__dirname, '../src/data/custom_mutashabihat/');

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

function prepareAyah(ayah) {
    let text = ayah.text;
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

    const allSurahs = quranData.data.surahs;
    const focusSurahData = FOCUS_SURAHS.map(num => allSurahs.find(s => s.number === num));

    // We will store matches in a way that we can output A|B and B|A
    const surahMatches = {}; // surahNum -> { "srcAyah": Set("tgtSurah:tgtAyah") }
    FOCUS_SURAHS.forEach(num => surahMatches[num] = {});

    console.log(`🚀 Starting Mirrored Analysis for Surahs ${FOCUS_SURAHS.join(', ')}...`);

    for (const sourceSurah of focusSurahData) {
        console.log(`Processing Source Surah: ${sourceSurah.name}...`);
        const sourceAyahs = sourceSurah.ayahs.map(prepareAyah);

        for (const targetSurah of allSurahs) {
            if (targetSurah.number === sourceSurah.number) continue; // Skip internal here (handled elsewhere)

            const targetAyahs = targetSurah.ayahs.map(prepareAyah);
            const matchesFound = [];

            for (const src of sourceAyahs) {
                const srcLen = src.words.length;
                if (srcLen === 0) continue;

                for (const tgt of targetAyahs) {
                    const tgtLen = tgt.words.length;
                    if (tgtLen === 0) continue;

                    // 1. Exact full-ayah match exception (e.g., "Alif Lam Mim")
                    const srcNorm = src.words.map(w => w.norm).join(' ');
                    const tgtNorm = tgt.words.map(w => w.norm).join(' ');

                    if (srcNorm === tgtNorm) {
                        matchesFound.push({
                            srcAyah: src.num,
                            srcStart: 0,
                            tgtSurah: targetSurah.number,
                            tgtAyah: tgt.num,
                            tgtStart: 0,
                            length: srcLen
                        });
                        continue;
                    }

                    // 2. Sliding window for substantial matches
                    if (srcLen < MIN_WORDS || tgtLen < MIN_WORDS) continue;

                    for (let i = 0; i <= srcLen - MIN_WORDS; i++) {
                        for (let j = 0; j <= tgtLen - MIN_WORDS; j++) {
                            let mismatches = 0;
                            let lastMismatchIdx = -1;
                            const limit = Math.min(MAX_WORDS, srcLen - i, tgtLen - j);

                            let maxExactLen = 0;
                            let maxPartialLen = 0;

                            for (let k = 0; k < limit; k++) {
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
                            if (maxExactLen >= MIN_WORDS) finalLen = maxExactLen;
                            else if (maxPartialLen >= MIN_WORDS) finalLen = maxPartialLen;

                            if (finalLen > 0) {
                                matchesFound.push({
                                    srcAyah: src.num,
                                    srcStart: i,
                                    tgtSurah: targetSurah.number,
                                    tgtAyah: tgt.num,
                                    tgtStart: j,
                                    length: finalLen
                                });
                            }
                        }
                    }
                }
            }

            // Deduplicate for this S->T pair
            matchesFound.sort((a, b) => b.length - a.length);
            const uniqueST = [];
            for (const m of matchesFound) {
                const overlap = uniqueST.some(approved =>
                    approved.srcAyah === m.srcAyah &&
                    approved.tgtAyah === m.tgtAyah &&
                    (m.srcStart < (approved.srcStart + approved.length) &&
                        approved.srcStart < (m.srcStart + m.length))
                );
                if (!overlap) uniqueST.push(m);
            }

            // Record results for S (as source)
            uniqueST.forEach(m => {
                const srcKey = `${sourceSurah.number}:${m.srcAyah}`;
                if (!surahMatches[sourceSurah.number][srcKey]) surahMatches[sourceSurah.number][srcKey] = new Set();
                surahMatches[sourceSurah.number][srcKey].add(`${m.tgtSurah}:${m.tgtAyah}`);

                // Record results for T (as source) IF T is one of our Focus Surahs
                if (FOCUS_SURAHS.includes(m.tgtSurah)) {
                    const tgtKey = `${m.tgtSurah}:${m.tgtAyah}`;
                    if (!surahMatches[m.tgtSurah][tgtKey]) surahMatches[m.tgtSurah][tgtKey] = new Set();
                    surahMatches[m.tgtSurah][tgtKey].add(`${sourceSurah.number}:${m.srcAyah}`);
                }
            });
        }
    }

    // --- Export Files ---
    const names = { 2: 'baqarah', 3: 'imran', 4: 'nisa' };
    for (const num of FOCUS_SURAHS) {
        const filePath = path.join(DATA_DIR, `${names[num]}_generated.txt`);
        const entries = Object.entries(surahMatches[num])
            .sort(([keyA], [keyB]) => {
                const a = parseInt(keyA.split(':')[1]);
                const b = parseInt(keyB.split(':')[1]);
                return a - b;
            })
            .map(([src, targets]) => `${src}|${Array.from(targets).sort().join(',')}`)
            .join('\n');

        fs.writeFileSync(filePath, entries, 'utf8');
        console.log(`✅ Exported ${names[num]}_generated.txt (${Object.keys(surahMatches[num]).length} ayahs)`);
    }
}

runAnalysis();
