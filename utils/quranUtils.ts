/**
 * Quranic Text Processing Utilities
 */

export const quranNormalize = (t: string) => {
    if (!t) return "";
    return t.replace(/[\u064B-\u065F\u0670\u0671\u06D6-\u06DC\u06DE-\u06E8\u06EA-\u06ED]/g, "") // Diacritics & Quranic marks
        .replace(/[أإآ]/g, "ا")
        .replace(/ى/g, "ي")
        .replace(/ة/g, "ه")
        .replace(/[۞٭۩\-\/\(\)]/g, ""); // Symbols and common rule separators
};

export const quranStripConjunction = (normalizedWord: string, ruleWord: string) => {
    if (normalizedWord === ruleWord) return { match: true, prefixLen: 0 };

    // Arabic prefixes: و (wa), ف (fa), ك (ka), ل (li), ب (bi)
    const prefixes = ['و', 'ف', 'ك', 'ل', 'ب'];
    for (const p of prefixes) {
        if (normalizedWord.startsWith(p) && normalizedWord.slice(p.length) === ruleWord) {
            return { match: true, prefixLen: p.length };
        }
    }

    // Reverse check for cases where the rule might have the prefix but the text doesn't (less common but possible)
    for (const p of prefixes) {
        if (ruleWord.startsWith(p) && ruleWord.slice(p.length) === normalizedWord) {
            return { match: true, prefixLen: 0 }; // We match, but prefix is in rule not text
        }
    }

    return { match: false, prefixLen: 0 };
};

export const quranIsSymbol = (w: string) => quranNormalize(w).length === 0;

/**
 * Counts the number of real words in a phrase (excluding symbols)
 */
export const getRealWordCount = (phrase: string) => {
    if (!phrase) return 0;
    return phrase.split(/\s+/).filter(w => !quranIsSymbol(w)).length;
};

/**
 * Simple Levenshtein distance for fuzzy matching
 */
export const getLevenshteinDistance = (a: string, b: string): number => {
    const matrix = Array.from({ length: a.length + 1 }, (_, i) => [i]);
    for (let j = 1; j <= b.length; matrix[0][j] = j++);
    for (let i = 1; i <= a.length; i++) {
        for (let j = 1; j <= b.length; j++) {
            matrix[i][j] = a[i - 1] === b[j - 1]
                ? matrix[i - 1][j - 1]
                : Math.min(matrix[i - 1][j - 1], matrix[i][j - 1], matrix[i - 1][j]) + 1;
        }
    }
    return matrix[a.length][b.length];
};

/**
 * Finds shared sequences of words between two texts, skipping symbols.
 */
export const findSharedPhrases = (text1: string, text2: string) => {
    if (!text1 || !text2) return [];

    const words1 = text1.split(/\s+/).filter(w => w.length > 0);
    const words2 = text2.split(/\s+/).filter(w => w.length > 0);

    const realWords1 = words1.map((w, idx) => ({ word: w, norm: quranNormalize(w), originalIdx: idx })).filter(item => item.norm.length > 0);
    const realWords2 = words2.map((w, idx) => ({ word: w, norm: quranNormalize(w), originalIdx: idx })).filter(item => item.norm.length > 0);

    const discoveredPhrases: Array<{ phrase: string }> = [];

    for (let i = 0; i < realWords1.length; i++) {
        for (let j = 0; j < realWords2.length; j++) {
            let k = 0;
            while (i + k < realWords1.length && j + k < realWords2.length) {
                const w1 = realWords1[i + k].norm;
                const w2 = realWords2[j + k].norm;

                const match = (w1 === w2) ||
                    quranStripConjunction(w1, w2).match ||
                    quranStripConjunction(w2, w1).match;

                if (match) {
                    k++;
                } else if (k >= 2) {
                    // Fuzzy match for the word immediately after a 2-word sequence
                    // Helpful for cases like "إليك" vs "إليكم"
                    const distance = getLevenshteinDistance(w1, w2);
                    if (distance <= 2 && w1.length > 3 && w2.length > 3) {
                        k++;
                    }
                    break;
                } else {
                    break;
                }
            }

            if (k >= 2) {
                const startIdx = realWords1[i].originalIdx;
                const endIdx = realWords1[i + k - 1].originalIdx;
                const phrase = words1.slice(startIdx, endIdx + 1).join(' ');

                // Deduplicate and favor longer phrases
                const existingIdx = discoveredPhrases.findIndex(p => phrase.includes(p.phrase) || p.phrase.includes(phrase));
                if (existingIdx === -1) {
                    discoveredPhrases.push({ phrase });
                } else if (phrase.length > discoveredPhrases[existingIdx].phrase.length) {
                    discoveredPhrases[existingIdx] = { phrase };
                }
            }
        }
    }

    return discoveredPhrases;
};
