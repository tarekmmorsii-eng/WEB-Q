import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BOUNDARIES_PATH = path.join(__dirname, '../constants/structureBoundaries.ts');

// Function to extract array from TS file content
function extractArray(content, name) {
    const regex = new RegExp(`export const ${name}: \\(StructureBoundary \\| null\\)\\[\\] = (\\[[\\s\\S]*?\\]);`);
    const match = content.match(regex);
    if (!match) {
        console.error(`Could not find ${name} in structureBoundaries.ts`);
        return [];
    }
    try {
        return JSON.parse(match[1]);
    } catch (e) {
        console.error(`Failed to parse ${name}:`, e);
        return [];
    }
}

// Read and parse the boundaries file
const content = fs.readFileSync(BOUNDARIES_PATH, 'utf8');
const JUZ_BOUNDARIES = extractArray(content, 'JUZ_BOUNDARIES');
const HIZB_BOUNDARIES = extractArray(content, 'HIZB_BOUNDARIES');
const RUB_BOUNDARIES = extractArray(content, 'RUB_BOUNDARIES');

// Hardcoded counts from component
const VERSE_COUNTS = [
    7, 286, 200, 176, 120, 165, 206, 75, 129, 109, 123, 111, 43, 52, 99, 128, 111, 110, 98, 135,
    112, 78, 118, 64, 77, 227, 93, 88, 69, 60, 34, 30, 73, 54, 45, 83, 182, 88, 75, 85,
    54, 53, 89, 59, 37, 35, 38, 29, 18, 45, 60, 49, 62, 55, 78, 96, 29, 22, 24, 13,
    14, 11, 11, 18, 12, 12, 30, 52, 52, 44, 28, 28, 20, 56, 40, 31, 50, 40, 46, 42,
    29, 19, 36, 25, 22, 17, 19, 26, 30, 20, 15, 21, 11, 8, 8, 19, 5, 8, 8, 11,
    11, 8, 3, 9, 5, 4, 7, 3, 6, 3, 5, 4, 5, 6
];

const calculateRange = (sSurah, sAyah, eSurah, eAyah) => {
    if (sSurah > eSurah) return 0;
    if (sSurah === eSurah) {
        return Math.max(0, eAyah - sAyah + 1);
    }

    let count = 0;
    // Verses in start surah
    count += (VERSE_COUNTS[sSurah - 1] - sAyah + 1);
    // Verses in full surahs between
    for (let i = sSurah + 1; i < eSurah; i++) {
        count += VERSE_COUNTS[i - 1];
    }
    // Verses in end surah
    count += eAyah;
    return count;
};

function verify() {
    console.log('Verifying Verse Calculations...');

    // Test Juz 30
    const juz30 = JUZ_BOUNDARIES[29];
    if (juz30) {
        const count = calculateRange(juz30.start.surah, juz30.start.ayah, juz30.end.surah, juz30.end.ayah);
        console.log(`Juz 30 (${juz30.start.surah}:${juz30.start.ayah} - ${juz30.end.surah}:${juz30.end.ayah}): ${count} verses`);

        // Validation (Approximate check)
        // Juz 30 is roughly 564 verses.
        if (count === 564) {
            console.log('✅ Juz 30 count matches expected (564).');
        } else {
            console.warn('⚠️ Juz 30 count differs from expectation (564). This might be due to Basmalah counting differences or expected variation.');
        }
    } else {
        console.error('❌ Juz 30 boundary not found');
    }

    // Test Juz 1
    const juz1 = JUZ_BOUNDARIES[0];
    if (juz1) {
        const count = calculateRange(juz1.start.surah, juz1.start.ayah, juz1.end.surah, juz1.end.ayah);
        console.log(`Juz 1 (${juz1.start.surah}:${juz1.start.ayah} - ${juz1.end.surah}:${juz1.end.ayah}): ${count} verses`);
        // Fatiha (7) + Baqarah 141 = 148
        if (count === 148) {
            console.log('✅ Juz 1 count matches expected (148).');
        } else {
            console.warn('⚠️ Juz 1 count differs from expectation (148).');
        }
    }

    // Test Hizb 60 (Last Hizb, which is 2nd half of Juz 30)
    // Hizb 60 starts at Surah 87 (Al-Ala) to End.
    const hizb60 = HIZB_BOUNDARIES[59];
    if (hizb60) {
        const count = calculateRange(hizb60.start.surah, hizb60.start.ayah, hizb60.end.surah, hizb60.end.ayah);
        console.log(`Hizb 60 (${hizb60.start.surah}:${hizb60.start.ayah} - ${hizb60.end.surah}:${hizb60.end.ayah}): ${count} verses`);
    } else {
        console.error('❌ Hizb 60 boundary not found');
    }
}

verify();
