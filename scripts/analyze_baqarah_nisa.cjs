const fs = require('fs');
const path = require('path');

// --- Configuration ---
const SOURCE_SURAH = 2; // Al-Baqarah
const TARGET_SURAH = 4; // An-Nisa
const MIN_WORDS = 4;
// Limit max phrase length to avoid clutter
const MAX_WORDS = 20;

// Words to NOT count as 'base' words in short matches
const COMMON_WORDS = new Set([
    'في', 'من', 'على', 'الي', 'إلي', 'عن', 'ما', 'لا', 'يا', 'ان', 'أن', 'و', 'ف', 'ب', 'ل', 'او', 'أو', 'ثم'
]);

// --- Paths ---
const QURAN_JSON_PATH = path.join(__dirname, '../public/quran.json');
// Changing output to .txt
const REPORT_PATH = path.join(__dirname, 'baqarah_nisa_full.txt');

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

// --- Main Logic ---

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

    const surah2 = quranData.data.surahs.find(s => s.number === SOURCE_SURAH);
    const surah4 = quranData.data.surahs.find(s => s.number === TARGET_SURAH);

    if (!surah2 || !surah4) {
        console.error("Could not find Surah 2 or 4.");
        return;
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

    const sourceAyahs = surah2.ayahs.map(prepareAyah);
    const targetAyahs = surah4.ayahs.map(prepareAyah);

    const matches = [];

    // O(N*M) Comparison
    console.time("analysis");

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
                        // Compare normalized forms
                        if (src.words[i + k].norm !== tgt.words[j + k].norm) {
                            mismatches++;
                            lastMismatchIdx = k;
                        }

                        if (mismatches > 1) {
                            break;
                        }

                        // Check if sequence length meets requirement
                        const currentLen = k + 1;
                        if (currentLen >= MIN_WORDS) {
                            // Calculate 'base' (significant) words count
                            let baseWordsCount = 0;
                            for (let m = 0; m < currentLen; m++) {
                                if (!COMMON_WORDS.has(src.words[i + m].norm)) {
                                    baseWordsCount++;
                                }
                            }

                            // Filter: at least 3 significant words for shorter matches
                            const isSubstantial = (currentLen >= 4 && baseWordsCount >= 3) || (currentLen > 6);

                            if (isSubstantial) {
                                if (mismatches === 0) {
                                    maxExactLen = currentLen;
                                } else {
                                    // Check type of difference if partial
                                    const srcWord = src.words[i + lastMismatchIdx].norm;
                                    const tgtWord = tgt.words[j + lastMismatchIdx].norm;
                                    const dist = getLevenshteinDistance(srcWord, tgtWord);

                                    // Accept only if it's a character-level change (dist <= 2)
                                    if (dist <= 2) {
                                        maxPartialLen = currentLen;
                                    }
                                }
                            }
                        }
                    }

                    // Prioritize EXACT match if found, otherwise use PARTIAL
                    let finalLen = 0;
                    let finalType = '';

                    if (maxExactLen >= MIN_WORDS) {
                        finalLen = maxExactLen;
                        finalType = 'EXACT';
                        mismatches = 0;
                    } else if (maxPartialLen >= MIN_WORDS) {
                        finalLen = maxPartialLen;
                        finalType = 'PARTIAL';
                        mismatches = 1;
                    }

                    if (finalLen > 0) {
                        const matchText = src.words.slice(i, i + finalLen).map(w => w.raw).join(' ');

                        matches.push({
                            type: finalType,
                            text: matchText,
                            source: { surah: 2, ayah: src.num, start: i, text: src.text },
                            target: { surah: 4, ayah: tgt.num, start: j, text: tgt.text },
                            length: finalLen,
                            mismatches: mismatches
                        });
                    }
                }
            }
        }
    }
    console.timeEnd("analysis");

    console.log(`Found ${matches.length} raw matches.`);

    // --- Deduplication & Overlap Removal ---
    matches.sort((a, b) => {
        if (a.type !== b.type) {
            return a.type === 'EXACT' ? -1 : 1;
        }
        return b.length - a.length;
    });

    const uniqueMatches = [];

    for (const m of matches) {
        const isOverlapping = uniqueMatches.some(approved =>
            approved.source.ayah === m.source.ayah &&
            approved.target.ayah === m.target.ayah &&
            (m.source.start < (approved.source.start + approved.length) &&
                approved.source.start < (m.source.start + m.length)) &&
            (m.target.start < (approved.target.start + approved.length) &&
                approved.target.start < (m.target.start + m.length))
        );

        if (!isOverlapping) {
            uniqueMatches.push(m);
        }
    }

    console.log(`Reduced to ${uniqueMatches.length} unique matches (deduplicated & non-overlapping).`);

    // --- Calculate Stats ---
    const phraseStats = {};
    uniqueMatches.forEach(m => {
        phraseStats[m.text] = (phraseStats[m.text] || 0) + 1;
    });
    const sortedStats = Object.entries(phraseStats).sort(([, a], [, b]) => b - a);

    // --- Grouping and Reporting (Plain Text) ---
    let reportTxt = `تحليل متشابهات سورة البقرة (2) مع النساء (4)\n`;
    reportTxt += `عدد التطابقات الفريدة: ${uniqueMatches.length}\n`;
    reportTxt += `المعايير:\n`;
    reportTxt += `- الحد الأدنى لطول الجملة: ${MIN_WORDS} كلمات.\n`;
    reportTxt += `- التطابق الجزئي يقتصر على تغير أحرف بسيطة (مسافة تعديل <= 2).\n`;
    reportTxt += `- فلترة التطابقات القصيرة المكونة من كلمات شائعة فقط (أقل من 3 كلمات أساسية).\n\n`;

    reportTxt += `--- إحصائيات أكثر الجمل تكراراً ---\n`;
    sortedStats.slice(0, 20).forEach(([phrase, count], idx) => {
        reportTxt += `${idx + 1}. [${count} مرة]: ${phrase}\n`;
    });
    reportTxt += `==================================================\n\n`;

    const grouped = {};
    uniqueMatches.forEach(m => {
        if (!grouped[m.source.ayah]) grouped[m.source.ayah] = [];
        grouped[m.source.ayah].push(m);
    });

    const sortedKeys = Object.keys(grouped).map(Number).sort((a, b) => a - b);

    for (const ayahNum of sortedKeys) {
        const group = grouped[ayahNum];
        group.sort((a, b) => a.target.ayah - b.target.ayah);

        reportTxt += `--- البقرة آية ${ayahNum} ---\n`;
        reportTxt += `${group[0].source.text}\n`;

        for (const m of group) {
            const typeStr = m.type === 'EXACT' ? 'تطابق تام' : 'اختلاف جزئي';
            reportTxt += `\n> [النساء:${m.target.ayah}] (${typeStr})\n`;
            reportTxt += `> الجملة المتشابهة: ${m.text}\n`;
            reportTxt += `> نص الآية في النساء: ${m.target.text}\n`;
        }
        reportTxt += `\n--------------------------------\n`;
    }

    try {
        fs.writeFileSync(REPORT_PATH, reportTxt, 'utf8');
        console.log(`Report generated at: ${REPORT_PATH}`);

        // --- Export for App Integration ---
        const APP_DATA_PATH = path.join(__dirname, '../src/data/custom_mutashabihat/baqarah_nisa_generated.txt');

        const exportGrouped = {};
        uniqueMatches.forEach(m => {
            const key = `${m.source.surah}:${m.source.ayah}`;
            if (!exportGrouped[key]) exportGrouped[key] = new Set();
            exportGrouped[key].add(`${m.target.surah}:${m.target.ayah}`);
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
                // Ensure no self-references or duplicates in target list if any
                return `${src}|${sortedTargets.join(',')}`;
            })
            .join('\n');

        fs.writeFileSync(APP_DATA_PATH, appTxt, 'utf8');
        console.log(`App data exported and sorted to: ${APP_DATA_PATH}`);

    } catch (e) {
        console.error("Failed to write report or app data:", e);
    }
}

runAnalysis();
