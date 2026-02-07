
const fs = require('fs');
const path = require('path');

// --- Configuration ---
const SOURCE_SURAH = 2; // Al-Baqarah
const TARGET_SURAH = 3; // Al-Imran
const MIN_WORDS = 3;
// Limit max phrase length to avoid clutter
const MAX_WORDS = 20;

// --- Paths ---
const QURAN_JSON_PATH = path.join(__dirname, '../public/quran.json');
// Changing output to .txt
const REPORT_PATH = path.join(__dirname, 'baqarah_imran_full.txt');

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
    const surah3 = quranData.data.surahs.find(s => s.number === TARGET_SURAH);

    if (!surah2 || !surah3) {
        console.error("Could not find Surah 2 or 3.");
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
    const targetAyahs = surah3.ayahs.map(prepareAyah);

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
                    let k = 0;
                    const limit = Math.min(MAX_WORDS, srcLen - i, tgtLen - j);

                    let maxExactLen = 0;
                    let maxPartialLen = 0;

                    for (k = 0; k < limit; k++) {
                        // Compare normalized forms
                        if (src.words[i + k].norm !== tgt.words[j + k].norm) {
                            mismatches++;
                        }

                        if (mismatches > 1) {
                            break;
                        }

                        if (k + 1 >= MIN_WORDS) {
                            if (mismatches === 0) {
                                maxExactLen = k + 1;
                            } else {
                                maxPartialLen = k + 1;
                            }
                        }
                    }

                    // Prioritize EXACT match if found, otherwise use PARTIAL
                    let finalLen = 0;
                    let finalType = '';

                    if (maxExactLen >= MIN_WORDS) {
                        finalLen = maxExactLen;
                        finalType = 'EXACT';
                        // Re-calculate mismatches for the chosen length (should be 0)
                        mismatches = 0;
                    } else if (maxPartialLen >= MIN_WORDS) {
                        finalLen = maxPartialLen;
                        finalType = 'PARTIAL';
                        // Re-calculate mismatches (should be 1)
                        mismatches = 1;
                    }

                    if (finalLen > 0) {
                        // Reconstruct text using the Raw words from the processed array
                        const matchText = src.words.slice(i, i + finalLen).map(w => w.raw).join(' ');

                        matches.push({
                            type: finalType,
                            text: matchText,
                            source: { surah: 2, ayah: src.num, start: i, text: src.text },
                            target: { surah: 3, ayah: tgt.num, start: j, text: tgt.text },
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
    // 1. Sort: EXACT matches first, then by Length (descending)
    matches.sort((a, b) => {
        if (a.type !== b.type) {
            return a.type === 'EXACT' ? -1 : 1;
        }
        return b.length - a.length;
    });

    const uniqueMatches = [];

    for (const m of matches) {
        // Check if this match overlaps with any already accepted match
        const isOverlapping = uniqueMatches.some(approved =>
            approved.source.ayah === m.source.ayah &&
            approved.target.ayah === m.target.ayah &&
            // Check for overlap in Source Indices
            // (start1 < end2 && start2 < end1)
            (m.source.start < (approved.source.start + approved.length) &&
                approved.source.start < (m.source.start + m.length)) &&
            // Check for overlap in Target Indices
            (m.target.start < (approved.target.start + approved.length) &&
                approved.target.start < (m.target.start + m.length))
        );

        if (!isOverlapping) {
            uniqueMatches.push(m);
        }
    }

    console.log(`Reduced to ${uniqueMatches.length} unique matches (deduplicated & non-overlapping).`);

    // --- Grouping and Reporting (Plain Text) ---
    let reportTxt = `تحليل متشابهات سورة البقرة (2) مع آل عمران (3)\n`;
    reportTxt += `عدد التطابقات: ${uniqueMatches.length}\n`;
    reportTxt += `المعايير: الحد الأدنى 3 كلمات، اختلاف كلمة واحدة بحد أقصى.\n`;
    reportTxt += `==================================================\n\n`;

    // Group by Source Ayah
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
            reportTxt += `\n> [آل عمران:${m.target.ayah}] (${typeStr})\n`;
            reportTxt += `> الجملة المتشابهة: ${m.text}\n`;
            reportTxt += `> نص الآية في آل عمران: ${m.target.text}\n`;
        }
        reportTxt += `\n--------------------------------\n`;
    }

    try {
        fs.writeFileSync(REPORT_PATH, reportTxt, 'utf8');
        console.log(`Report generated at: ${REPORT_PATH}`);
    } catch (e) {
        console.error("Failed to write report:", e);
    }
}

runAnalysis();
