const fs = require('fs');
const path = require('path');

// --- Configuration ---
const INPUT_FILE = path.join(__dirname, 'public', 'quran.json');
const OUTPUT_FILE = path.join(__dirname, 'constants', 'mutashabiha_data_full.json');

// --- Helpers ---
function normalizeText(text) {
    if (!text) return "";
    return text.replace(/[\u064B-\u065F\u06D6-\u06DC\u06DF-\u06E8\u06EA-\u06ED]/g, "");
}

function getWords(text) {
    return normalizeText(text).trim().split(/\s+/).filter(w => w.length > 0);
}

// Generate n-grams from words array
function getNGrams(words, minN, maxN) {
    const grams = [];
    for (let n = minN; n <= maxN; n++) {
        for (let i = 0; i <= words.length - n; i++) {
            grams.push({
                text: words.slice(i, i + n).join(' '),
                startIndex: i,
                length: n
            });
        }
    }
    return grams;
}

try {
    console.log("Loading Quran data...");
    const rawData = fs.readFileSync(INPUT_FILE, 'utf8');
    const quranData = JSON.parse(rawData);

    // Filter for Surah Al-Baqarah (Number 2)
    const baqarah = quranData.data.surahs.find(s => s.number === 2);
    if (!baqarah) throw new Error("Surah Al-Baqarah not found");

    console.log(`Processing Surah Al-Baqarah (${baqarah.ayahs.length} ayahs)...`);

    // Prepare Ayahs
    const ayahs = baqarah.ayahs.map(a => ({
        id: a.number, // Absolute ID
        num: a.numberInSurah,
        text: a.text,
        words: getWords(a.text)
    }));

    // 1. Find all repeated phrases (3-10 words) within the Surah
    const phraseCounts = new Map(); // phrase -> { count, ayahs: Set<id> }

    ayahs.forEach(ayah => {
        // We look for phrases of length 2 to 10 words
        // Reduced min length to 2 to catch distinctive 2-word starts like "يا أيها" if they define a group
        const grams = getNGrams(ayah.words, 2, 12);

        grams.forEach(gram => {
            if (!phraseCounts.has(gram.text)) {
                phraseCounts.set(gram.text, { count: 0, ayahs: new Set(), text: gram.text });
            }
            const entry = phraseCounts.get(gram.text);
            if (!entry.ayahs.has(ayah.id)) {
                entry.count++;
                entry.ayahs.add(ayah.id);
            }
        });
    });

    // 2. Filter significant phrases
    // - Must appear in at least 2 ayahs
    // - If length is 2, must appear at START of ayah (common book style) OR be very frequent??
    //   Actually, let's stick to: Any phrase >= 2 times.
    let significantPhrases = Array.from(phraseCounts.values())
        .filter(p => p.count >= 2);

    console.log(`Found ${significantPhrases.length} raw repeated phrases.`);

    // 3. Remove "sub-phrases" that are just parts of longer phrases repeated in the SAME ayahs
    // Example: "A B C" repeated in ayahs 1,2. "A B" repeated in ayahs 1,2.
    // "A B" is redundant if it only appears where "A B C" appears.

    // Sort by length descending (longest first)
    significantPhrases.sort((a, b) => b.text.length - a.text.length);

    const finalPhrases = [];
    const coverMap = new Map(); // ayahId -> Set<covered_indices> (simplification)

    // A simpler redundancy check:
    // If phrase A is substrings of phrase B, and they share the EXACT SAME Ayah set, discard A.
    // Or if A is contained in B, and A's count == B's count.

    significantPhrases = significantPhrases.filter(p => {
        // Filter out very short phrases unless they are at start?
        // Let's keep data rich for now.
        return true;
    });

    // Strategy: We want "Grouping".
    // We will assign each match to the "Longest Common Phrase".

    const outputData = {};
    const JUZ_NUM = 1; // Al-Baqarah mostly Juz 1-3. We structure by input Juz but here we just fill.
    // Actually output structure is Object<JuzNum, Array<Entries>>.
    // We need to map AyahID to Juz.

    const ayahToJuz = new Map();
    quranData.data.surahs.forEach(s => s.ayahs.forEach(a => ayahToJuz.set(a.number, a.juz)));

    // For every pair of ayahs in Al-Baqarah, find the Longest Common Substring (Phrase)
    let ops = 0;
    for (let i = 0; i < ayahs.length; i++) {
        for (let j = i + 1; j < ayahs.length; j++) {
            const A = ayahs[i];
            const B = ayahs[j];

            // Find longest common phrase
            // Iterate all grams of A, check if in B
            let bestMatch = null;

            // Optimization: check common words first? No, brute force on small set (286 ayahs) is fast.
            // Check substrings
            // We use the pre-calculated n-grams from loop above logic? 
            // Better to re-calculate LCS here for the pair.

            // Find LCS (Longest Common Substring) of words
            let lcs = [];
            for (let startA = 0; startA < A.words.length; startA++) {
                for (let startB = 0; startB < B.words.length; startB++) {
                    let len = 0;
                    while (
                        (startA + len) < A.words.length &&
                        (startB + len) < B.words.length &&
                        A.words[startA + len] === B.words[startB + len]
                    ) {
                        len++;
                    }

                    if (len >= 2) { // Minimal match length
                        if (!bestMatch || len > bestMatch.len) {
                            const txt = A.words.slice(startA, startA + len).join(' ');
                            // Filter short common words (e.g. "الله", "في")
                            if (txt.length > 3) {
                                bestMatch = { len, text: txt };
                            }
                        }
                    }
                }
            }

            if (bestMatch) {
                // Add to output
                [A, B].forEach(source => {
                    const target = source === A ? B : A;
                    const juz = ayahToJuz.get(source.id);

                    if (!outputData[juz]) outputData[juz] = [];
                    let entry = outputData[juz].find(e => e.src.ayah === source.id);
                    if (!entry) {
                        entry = { src: { ayah: source.id }, muts: [] };
                        outputData[juz].push(entry);
                    }

                    // Add target if not exists
                    if (!entry.muts.find(m => m.ayah === target.id)) {
                        entry.muts.push({
                            ayah: target.id,
                            rule: bestMatch.text // USE PHRASE AS RULE
                        });
                    }
                });
            }
            ops++;
        }
    }

    console.log(`Compared ${ops} pairs. Writing output...`);
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(outputData, null, 0)); // Minified for size
    console.log("Done.");

} catch (e) {
    console.error(e);
}
