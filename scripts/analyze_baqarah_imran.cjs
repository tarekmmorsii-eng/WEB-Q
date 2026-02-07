
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
const REPORT_PATH = path.join(__dirname, 'baqarah_imran_report.md');

// --- Helper: Normalize Arabic Text ---
function normalize(text) {
    if (!text) return "";
    return text
        .replace(/[\u064B-\u065F\u0670]/g, '')
        .replace(/[\u0622\u0623\u0625\u0671]/g, '\u0627')
        .replace(/[\u0649]/g, '\u064A')
        .replace(/[\u0629]/g, '\u0647')
        .replace(/[^\u0600-\u06FF\s]/g, '') // Remove punctuation
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

    console.log(`Analyzing: ${surah2.name} (${surah2.ayahs.length} ayahs) vs ${surah3.name} (${surah3.ayahs.length} ayahs)`);

    // Flatten logic: Create a giant array of words for each Surah
    // But keep metadata (ayah number, original text)
    // Structure: [{ word: string, ayahNum: number, ayahText: string, indexInAyah: number }]

    // BUT! We need phrase comparison.
    // Let's create an array of objects for each ayah, pre-split into words.

    const sourceAyahs = surah2.ayahs.map(a => ({
        num: a.numberInSurah,
        text: a.text,
        normalized: normalize(a.text),
        words: normalize(a.text).split(' ')
    }));

    const targetAyahs = surah3.ayahs.map(a => ({
        num: a.numberInSurah,
        text: a.text,
        normalized: normalize(a.text),
        words: normalize(a.text).split(' ')
    }));

    const matches = [];

    // O(N*M) Comparison
    // Iterate through every possible starting word in Source
    console.time("analysis");

    for (const src of sourceAyahs) {
        const srcLen = src.words.length;
        if (srcLen < MIN_WORDS) continue;

        for (let i = 0; i <= srcLen - MIN_WORDS; i++) {

            // For each starting position in Source, scan ALL target ayahs
            for (const tgt of targetAyahs) {
                const tgtLen = tgt.words.length;
                if (tgtLen < MIN_WORDS) continue;

                for (let j = 0; j <= tgtLen - MIN_WORDS; j++) {

                    // Compare words starting at src[i] and tgt[j]
                    let mismatches = 0;
                    let k = 0;

                    // Look ahead up to MAX_WORDS or end of ayah
                    const limit = Math.min(MAX_WORDS, srcLen - i, tgtLen - j);

                    // We need at least MIN_WORDS match with <= 1 mismatch
                    // Let's count length of match sequence that satisfies condition

                    let validLen = 0;

                    for (k = 0; k < limit; k++) {
                        if (src.words[i + k] !== tgt.words[j + k]) {
                            mismatches++;
                        }

                        if (mismatches > 1) {
                            break; // Stop extending this match
                        }

                        // If we are here, we have a valid sequence of length k+1 so far (0-indexed)
                        if (k + 1 >= MIN_WORDS) {
                            validLen = k + 1;
                        }
                    }

                    // If validLen >= MIN_WORDS, we found a match!
                    // We only want the LONGEST valid match starting at i,j
                    if (validLen >= MIN_WORDS) {
                        const phraseWords = src.words.slice(i, i + validLen);
                        const targetPhraseWords = tgt.words.slice(j, j + validLen);

                        const similarityType = mismatches === 0 ? 'EXACT' : 'PARTIAL';

                        matches.push({
                            type: similarityType,
                            text: src.text.split(' ').slice(i, i + validLen).join(' '), // Approximate reconstruction
                            source: { surah: 2, ayah: src.num, start: i, text: src.text },
                            target: { surah: 3, ayah: tgt.num, start: j, text: tgt.text },
                            length: validLen,
                            mismatches: mismatches
                        });
                    }
                }
            }
        }
    }
    console.timeEnd("analysis");

    console.log(`Found ${matches.length} raw matches.`);

    // --- Deduplication ---
    // 1. Sort by length descending
    matches.sort((a, b) => b.length - a.length);

    // 2. Filter subsets
    const uniqueMatches = [];

    for (const m of matches) {
        const isSubset = uniqueMatches.some(parent =>
            parent.source.ayah === m.source.ayah &&
            parent.target.ayah === m.target.ayah &&
            // Check containment
            m.source.start >= parent.source.start &&
            (m.source.start + m.length) <= (parent.source.start + parent.length) &&
            m.target.start >= parent.target.start &&
            (m.target.start + m.length) <= (parent.target.start + parent.length)
        );

        if (!isSubset) {
            uniqueMatches.push(m);
        }
    }

    console.log(`Reduced to ${uniqueMatches.length} unique matches.`);

    // --- Verify Exact vs "1 letter change" ---
    // User requested: "Partial (difference of a letter or word)"
    // Our implementation: "1 word difference".
    // We should filter the partials further: if mismatching word is TOTALLY DIFFERENT?
    // Actually, "1 word difference" covers "1 letter difference" (it's a different word).
    // But we might want to flag if the mismatching word is "close" (Levenshtein) vs "different".
    // For now, let's just list them.

    // --- Grouping and Reporting ---
    let reportMd = `# Analysis: Al-Baqarah (2) vs Al-Imran (3) Mutashabihat\n\n`;
    reportMd += `**Found Matches:** ${uniqueMatches.length}\n`;
    reportMd += `**Criteria:** Min Length: ${MIN_WORDS}, Mismatches: Max 1 word.\n\n`;

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

        // Header for Source Ayah
        reportMd += `### Ayah ${ayahNum} (Al-Baqarah)\n`;
        reportMd += `> ... ${group[0].source.text} ...\n\n`;
        // Note: printing full text might be too long, but let's try.

        for (const m of group) {
            const icon = m.type === 'EXACT' ? '✅' : '⚠️';
            const diffType = m.type === 'EXACT' ? 'Exact' : 'Partial (1 word diff)';
            const phrase = m.source.text.split(' ').slice(m.source.start, m.source.start + m.length).join(' '); // Reconstruct from source

            reportMd += `- ${icon} **[${diffType}]** with **Al-Imran:${m.target.ayah}**: "...${phrase}..."\n`;
            reportMd += `  > *Target:* ... ${m.target.text} ...\n`;
        }
        reportMd += `\n---\n`;
    }

    try {
        fs.writeFileSync(REPORT_PATH, reportMd, 'utf8');
        console.log(`Report generated at: ${REPORT_PATH}`);
    } catch (e) {
        console.error("Failed to write report:", e);
    }
}

runAnalysis();
