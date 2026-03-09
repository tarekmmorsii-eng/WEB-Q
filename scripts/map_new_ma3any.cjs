/**
 * map_new_ma3any.cjs
 * Extracts word-by-word Quran meanings from Excel files
 * and maps them to their correct positions in each Ayah.
 *
 * Excel structure (per Surah file):
 *   Row format: [rowNum, arabicWord, meaning]
 *   - Rows before the first ayah marker belong to Ayah 1 (or Basmalah)
 *   - "آية رقم X" marks the END of Ayah X's words AND beginning of Ayah X+1
 *   - The tafsir for Ayah X is stored in column 2 of its marker row
 *
 * Output: src/data/ma3any/new_ma3any_pos.json
 *   { "surah:ayah": { "_tafsir": "...", "1": { phrase, meaning }, ... } }
 */

'use strict';

const xlsx = require('xlsx');
const path = require('path');
const fs = require('fs');

// ─── Paths ─────────────────────────────────────────────────────────────────
const EXCEL_DIR = path.join(__dirname, '../public/ma3any/exl');
const QURAN_JSON = path.join(__dirname, '../public/quran.json');
const OUTPUT = path.join(__dirname, '../src/data/ma3any/new_ma3any_pos.json');

// ─── Load Quran ─────────────────────────────────────────────────────────────
const quran = require(QURAN_JSON);

// ─── Normalization ───────────────────────────────────────────────────────────
/**
 * Strips ALL diacritics, tajweed marks, and non-letter symbols.
 * Standardizes Alif, Ya, Waw variants to their plain forms.
 * Removes Hamza for looser matching (helps with composite words).
 */
function norm(text) {
    if (!text) return '';
    return String(text)
        // Dagger Alef (U+0670) and Wasla (U+0671) → plain Alif
        .replace(/[\u0670\u0671]/g, '\u0627')
        // Strip ALL non-letter Arabic characters (harakat, signs, tatweel etc.)
        .replace(/[^\u0621-\u064A]|[\u0640]/g, '')
        // Standardize Alif variants
        .replace(/[\u0622\u0623\u0625\u0671\u0627]/g, '\u0627')   // all alifat → ا
        // Standardize Ya variants
        .replace(/[\u0649\u064A\u0626]/g, '\u064A')                // ى ي ئ → ي
        // Standardize Waw variants
        .replace(/\u0624/g, '\u0648')                              // ؤ → و
        // Ta Marbuta → Ha
        .replace(/\u0629/g, '\u0647')                              // ة → ه
        // Strip standalone Hamza (helps with وأولئك vs أولئك etc.)
        .replace(/\u0621/g, '')                                    // ء → ''
        .trim();
}

// ─── Arabic digit conversion ─────────────────────────────────────────────────
function parseAyahNum(text) {
    // Handles both Eastern Arabic (٣٤) and Western (34) numerals
    const str = String(text).replace(/[\u0660-\u0669]/g, c => c.charCodeAt(0) - 0x0660);
    const m = str.match(/\d+/);
    return m ? parseInt(m[0], 10) : null;
}

// ─── Get Ayah words from Quran JSON ─────────────────────────────────────────
// Unicode ranges for non-word Quranic marks (stop signs, sajda marks, etc.)
const QURAN_MARKS_RE = /^[\u0600-\u061A\u06D6-\u06ED\u06DE\u06DF\u06E9]+$/;

function getAyahWords(surahNum, ayahNum) {
    const surah = quran.data.surahs[surahNum - 1];
    if (!surah) return [];
    const ayah = surah.ayahs[ayahNum - 1];
    if (!ayah) return [];

    let words = ayah.text.split(/\s+/).filter(w => w.length > 0);

    // Strip Basmalah from first verse of all surahs except 1 and 9
    // Basmalah is always the first 4 words: بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
    if (surahNum !== 1 && surahNum !== 9 && ayahNum === 1) {
        const BASMALAH_WORDS = 4;
        const firstFour = words.slice(0, BASMALAH_WORDS).map(norm).join('');
        const normBasm = norm('بسم الله الرحمن الرحيم');
        if (firstFour.includes(normBasm.substring(0, 6))) { // starts with 'بسم' pattern
            words = words.slice(BASMALAH_WORDS);
        }
    }

    // Filter out standalone stop signs and Quranic marks (⌀, ۚ, ۖ etc.)
    words = words.filter(w => !QURAN_MARKS_RE.test(w));

    // ── Merge يا with the following word ─────────────────────────────────────
    // In quran.json, "يَا آدَمُ" is two words but Excel treats them as one entry.
    // We merge them so the mapping sees one unit with combined text.
    const merged = [];
    for (let i = 0; i < words.length; i++) {
        const nw = norm(words[i]);
        if (nw === 'يا' && i + 1 < words.length) {
            // Combine يا + next word into one entry
            merged.push(words[i] + ' ' + words[i + 1]);
            i++; // Skip the next word (already merged)
        } else {
            merged.push(words[i]);
        }
    }
    words = merged;

    return words.map((w, idx) => ({
        pos: idx + 1,  // 1-indexed position
        raw: w,        // original text from quran.json
        n: norm(w),  // normalized for matching
    }));
}


// ─── Core matching ───────────────────────────────────────────────────────────
/**
 * Given a list of Excel word rows and the Quran words for one Ayah,
 * returns a mapping of pos → { phrase, meaning }.
 *
 * Matching rules (in priority order):
 *  1. Exact normalized match
 *  2. Quran word contains Excel word (Excel is a sub-component, e.g. suffixes)
 *  3. Excel word contains Quran word (Excel spans composite, e.g. "يآدم")
 *
 * The pointer only advances FORWARD to guarantee sequential integrity.
 */
function mapWordsToPositions(excelRows, quranWords) {
    const result = {};
    let eIdx = 0; // Current position in excelRows[]
    let qIdx = 0; // Current position in quranWords[]

    while (eIdx < excelRows.length) {
        const { excelWord, meaning } = excelRows[eIdx];
        const nExcel = norm(excelWord);
        if (!nExcel) { eIdx++; continue; }

        // Search ahead up to 4 Quran words
        const limit = Math.min(quranWords.length, qIdx + 4);
        let matched = false;

        for (let i = qIdx; i < limit; i++) {
            const qw = quranWords[i];

            const exactMatch = qw.n === nExcel;
            // Quran word contains Excel word (Excel is a fragment of the Quran word)
            const quranContainsExcel = qw.n.length > nExcel.length && qw.n.includes(nExcel);
            // Excel word contains Quran word (Excel spans composite Quran words)
            const excelContainsQuran = nExcel.length > qw.n.length && nExcel.includes(qw.n);

            if (exactMatch || quranContainsExcel || excelContainsQuran) {
                const pos = String(qw.pos);

                if (exactMatch || quranContainsExcel) {
                    // ── FRAGMENT MERGING ─────────────────────────────────
                    // Collect ALL consecutive Excel rows that also match the SAME Quran word,
                    // so that "يا" + "أيها" → merged meaning for "يَٰٓأَيُّهَا"
                    const combinedPhrases = [excelWord];
                    const combinedMeanings = [meaning];
                    let nextEIdx = eIdx + 1;

                    while (nextEIdx < excelRows.length) {
                        const nextN = norm(excelRows[nextEIdx].excelWord);
                        if (nextN && qw.n.includes(nextN) && nextN.length > 1) {
                            combinedPhrases.push(excelRows[nextEIdx].excelWord);
                            combinedMeanings.push(excelRows[nextEIdx].meaning);
                            nextEIdx++;
                        } else {
                            break;
                        }
                    }

                    if (!result[pos]) {
                        result[pos] = {
                            phrase: qw.raw, // Always use the Quran word's own text
                            meaning: combinedMeanings.join('\n'),
                        };
                    }

                    eIdx = nextEIdx; // Skip all consumed fragments
                    qIdx = i + 1;

                } else {
                    // excelContainsQuran: Excel spans multiple Quran words
                    if (!result[pos]) {
                        result[pos] = { phrase: qw.raw, meaning };
                    }
                    qIdx = i + 1;

                    // Check if the SAME Excel row also covers the next Quran word
                    if (qIdx < quranWords.length) {
                        const nextQw = quranWords[qIdx];
                        if (nextQw.n.length > 1 && nExcel.includes(nextQw.n)) {
                            const nextPos = String(nextQw.pos);
                            if (!result[nextPos]) {
                                result[nextPos] = { phrase: nextQw.raw, meaning };
                            }
                            qIdx++;
                        }
                    }
                    eIdx++;
                }

                matched = true;
                break;
            }
        }

        if (!matched) eIdx++; // No match found, skip this Excel row
    }

    return result;
}

// ─── Process one Surah ───────────────────────────────────────────────────────
function processSurah(filePath, surahNum, output) {
    console.log(`  Surah ${surahNum}...`);

    const wb = xlsx.readFile(filePath);
    const rows = xlsx.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1 });

    // Step 1: Find all Ayah markers and their row indices
    const markers = []; // { rowIdx, ayahNum, tafsir }
    rows.forEach((row, rowIdx) => {
        const cell = String(row[1] || '').trim();
        if (cell.includes('آية رقم')) {
            const n = parseAyahNum(cell);
            if (n !== null) {
                markers.push({
                    rowIdx,
                    ayahNum: n,
                    tafsir: String(row[2] || '').trim(),
                });
            }
        }
    });

    // Sort markers by row index (should already be sorted, but just in case)
    markers.sort((a, b) => a.rowIdx - b.rowIdx);

    // Step 2: For each Ayah, words are the rows BEFORE its marker
    //         (between the previous marker and the current one)
    for (let mIdx = 0; mIdx < markers.length; mIdx++) {
        const marker = markers[mIdx];
        const prevRow = mIdx === 0 ? -1 : markers[mIdx - 1].rowIdx;
        const ayahNum = marker.ayahNum;
        const key = `${surahNum}:${ayahNum}`;

        // Collect raw Excel rows between previous marker and current marker
        const excelRows = [];
        for (let r = prevRow + 1; r < marker.rowIdx; r++) {
            const row = rows[r];
            if (row && row[1] && row[2]) {
                excelRows.push({
                    excelWord: String(row[1]).trim(),
                    meaning: String(row[2]).trim(),
                });
            }
        }

        // Get Quran words for this Ayah
        const quranWords = getAyahWords(surahNum, ayahNum);
        if (quranWords.length === 0) continue;

        // Map Excel words → Quran positions
        const mapped = mapWordsToPositions(excelRows, quranWords);

        // Initialize output entry
        output[key] = { _tafsir: marker.tafsir };

        // Merge mapped results + fill gaps with placeholder
        quranWords.forEach(qw => {
            const pos = String(qw.pos);
            if (mapped[pos]) {
                output[key][pos] = mapped[pos];
            } else {
                output[key][pos] = {
                    phrase: qw.raw,
                    meaning: 'راجع التفسير العام لهذه الآية.',
                    isMissing: true,
                };
            }
        });
    }
}

// ─── Main ────────────────────────────────────────────────────────────────────
console.log('Starting word meanings mapping...');
console.log(`Excel dir : ${EXCEL_DIR}`);
console.log(`Output    : ${OUTPUT}`);

const output = {};

const files = fs.readdirSync(EXCEL_DIR)
    .filter(f => f.endsWith('.xlsx'))
    .sort((a, b) => parseInt(a) - parseInt(b)); // sort numerically

for (const file of files) {
    const surahNum = parseInt(file.replace('.xlsx', ''), 10);
    if (!isNaN(surahNum)) {
        processSurah(path.join(EXCEL_DIR, file), surahNum, output);
    }
}

// Ensure output directory exists
fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
fs.writeFileSync(OUTPUT, JSON.stringify(output, null, 2), 'utf8');

const totalVerses = Object.keys(output).length;
const surahs = [...new Set(Object.keys(output).map(k => k.split(':')[0]))];
console.log(`\nDone! Mapped ${totalVerses} verses across ${surahs.length} surah(s).`);
console.log(`Surahs: ${surahs.join(', ')}`);
