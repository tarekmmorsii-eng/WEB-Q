import { absoluteToSurahAyah, surahAyahToAbsolute } from '../utils/quranHelpers';
import { Mutashabiha, MutashabihaRaw, AyahReference } from '../types';
import { MUTASHABIHAT_DATA_FULL } from '../constants/mutashabihatData';
import { calculateMutashabihatSimilarity, getHighestSimilarity, sortBySimilarity } from './similarityCalculator';
import { getAyahText } from './ayahTextHelper';

/**
 * تحويل البيانات الخام من JSON إلى format معالج مع حساب التشابه
 */
export async function processMutashabihatData(rawData: Record<string, MutashabihaRaw[]>): Promise<Mutashabiha[]> {
    const processed: Mutashabiha[] = [];
    let idCounter = 0;

    // DEBUG: Check if raw data has rule property
    const firstJuz = Object.keys(rawData)[0];
    if (rawData[firstJuz]?.[0]?.muts?.[0]) {
        console.log('🔍 PROCESSOR: Sample raw mut:', rawData[firstJuz][0].muts[0]);
    }

    for (const [juz, mutations] of Object.entries(rawData)) {
        for (const mut of mutations) {
            // Process source ayah
            const srcArray = Array.isArray(mut.src.ayah) ? mut.src.ayah : [mut.src.ayah];

            for (const srcAbsolute of srcArray) {
                const sourceAyah = absoluteToSurahAyah(srcAbsolute);

                // Get source text for similarity calculation
                const sourceText = await getAyahText(sourceAyah.surahNumber, sourceAyah.ayahNumber);

                // Process similar ayahs
                const similarAyahs: AyahReference[] = [];

                for (const mutItem of mut.muts) {
                    const mutArray = Array.isArray(mutItem.ayah) ? mutItem.ayah : [mutItem.ayah];
                    const ruleType = mutItem.rule; // Capture rule

                    // DEBUG: Log rule extraction
                    if (idCounter === 1) {
                        console.log('🚀 RULE EXTRACTION TEST:', {
                            rawRule: mutItem.rule,
                            extracted: ruleType,
                            hasProperty: 'rule' in mutItem
                        });
                    }

                    for (const mutAbsolute of mutArray) {
                        const similarAyahInfo = absoluteToSurahAyah(mutAbsolute);

                        // Get similar ayah text
                        const similarText = await getAyahText(similarAyahInfo.surahNumber, similarAyahInfo.ayahNumber);

                        // Calculate similarity
                        const similarity = calculateMutashabihatSimilarity(sourceText, similarText);

                        similarAyahs.push({
                            ...similarAyahInfo,
                            absoluteAyahNumber: mutAbsolute,
                            text: similarText,
                            similarity,
                            rule: mutItem.rule,
                            ruleType: mutItem.type as any,
                            ruleColor: mutItem.color
                        });
                    }
                }

                // Sort by similarity (highest first)
                const sortedSimilarAyahs = sortBySimilarity(similarAyahs);

                // Get highest similarity for quick reference
                const highestSimilarity = getHighestSimilarity(
                    sortedSimilarAyahs.map(a => a.similarity!)
                );

                processed.push({
                    id: `mut_${idCounter++}`,
                    sourceAyah: {
                        ...sourceAyah,
                        absoluteAyahNumber: srcAbsolute,
                        text: sourceText
                    },
                    similarAyahs: sortedSimilarAyahs,
                    showContext: mut.ctx === 2,
                    highestSimilarity: highestSimilarity || undefined
                });
            }
        }
    }

    return processed;
}

/**
 * البحث عن متشابهات لآية معينة - يدعم البحث في كلاً من الآية الرئيسية والمتشابهات
 */
export function findMutashabihatForAyah(
    surahNumber: number,
    ayahNumber: number,
    mutashabihat: Mutashabiha[]
): Mutashabiha | null {
    if (!mutashabihat) return null;
    return mutashabihat.find(
        (mut) =>
            (mut.sourceAyah.surahNumber === surahNumber && mut.sourceAyah.ayahNumber === ayahNumber) ||
            mut.similarAyahs.some(s => s.surahNumber === surahNumber && s.ayahNumber === ayahNumber)
    ) || null;
}

/**
 * الحصول على عدد المتشابهات في سورة
 */
export function getMutashabihatCountInSurah(
    surahNumber: number,
    mutashabihat: Mutashabiha[]
): number {
    return mutashabihat.filter(
        (mut) => mut.sourceAyah.surahNumber === surahNumber
    ).length;
}

// Note: PROCESSED_MUTASHABIHAT is now async and will be initialized in App.tsx
let cachedProcessedMutashabihat: Mutashabiha[] | null = null;

// Helper to parse "Surah:Ayah" string to absolute ID
const parseRef = (ref: string): AyahReference | null => {
    try {
        const [s, a] = ref.trim().split(':').map(Number);
        if (!s || !a) return null;
        const abs = surahAyahToAbsolute(s, a);
        return {
            surahNumber: s,
            ayahNumber: a,
            absoluteAyahNumber: abs,
            text: ""
        };
    } catch { return null; }
};

/**
 * Parsing function for text content
 */
function parseMutashabihatText(text: string, sourceIdPrefix: string, startIndex: number): { processed: Mutashabiha[], nextIndex: number } {
    const results: Mutashabiha[] = [];
    let counter = startIndex;

    text.split('\n').forEach(line => {
        line = line.trim();
        if (!line || line.startsWith('#') || !line.includes('|')) return;

        const parts = line.split('|');
        if (parts.length < 2) return;

        const left = parts[0];
        const right = parts[1];

        const sourceRefs = left.split(',').map(parseRef).filter(Boolean) as AyahReference[];

        const targetStr = right.replace(/\\n/g, '').replace(/\/$/, '');
        const targetRefs = targetStr.split(/[,/]/)
            .map(parseRef)
            .filter(Boolean) as AyahReference[];

        if (sourceRefs.length === 0 || targetRefs.length === 0) return;

        sourceRefs.forEach(src => {
            results.push({
                id: `${sourceIdPrefix}_${counter++}`,
                sourceAyah: src,
                similarAyahs: targetRefs
                    .filter(t => !(t.surahNumber === src.surahNumber && t.ayahNumber === src.ayahNumber))
                    .map(t => ({
                        ...t,
                        similarity: {
                            percentage: 85,
                            grade: 2,
                            color: "#3b82f6",
                            label: "متشابهة",
                            labelEn: "Similar"
                        }
                    })),
                showContext: line.includes('\\n')
            });
        });
    });

    return { processed: results, nextIndex: counter };
}

/**
 * Get processed mutashabihat from:
 * 1. Core TXT files (1.txt to 30.txt)
 * 2. Custom TXT files in src/data/custom_mutashabihat/
 */
export async function getProcessedMutashabihat(): Promise<Mutashabiha[]> {
    if (cachedProcessedMutashabihat && cachedProcessedMutashabihat.length > 0) return cachedProcessedMutashabihat;

    let allMutashabihat: Mutashabiha[] = [];
    let idCounter = 0;

    console.log("⏳ Loading mutashabihat...");

    try {
        // 1. Load Core Data (Juz 1-30)
        const corePromises = Array.from({ length: 30 }, (_, i) => i + 1).map(async (juz) => {
            try {
                const response = await fetch(`/data/txts/${juz}.txt`);
                if (!response.ok) return [];
                const text = await response.text();
                const { processed } = parseMutashabihatText(text, `core_${juz}`, 0); // IDs will be unique via prefix
                return processed;
            } catch (e) {
                return [];
            }
        });

        // 2. Load Custom Data (Dynamically from src/data/custom_mutashabihat/*.txt)
        const customModules = import.meta.glob('/src/data/custom_mutashabihat/*.txt', { as: 'raw', eager: true });
        const customData: Mutashabiha[] = [];

        Object.entries(customModules).forEach(([path, content]) => {
            if (path.includes('README')) return; // Ignore README files
            console.log(`📂 Loading custom file: ${path}`);
            const { processed } = parseMutashabihatText(content as string, `custom_${path.split('/').pop()}`, 0);
            customData.push(...processed);
        });

        // 3. Load Generated JSON Data (New Baqarah Data)
        console.log("📂 Processing new JSON mutashabihat data...");
        const jsonData = await processMutashabihatData(MUTASHABIHAT_DATA_FULL as any);

        // const coreResults = await Promise.all(corePromises);
        allMutashabihat = [...jsonData, ...customData];

        console.log(`✅ Loaded ${allMutashabihat.length} total associations (${jsonData.length} from JSON).`);
        cachedProcessedMutashabihat = allMutashabihat;
        return allMutashabihat;

    } catch (error) {
        console.error("❌ Data Processing Error:", error);
        return [];
    }
}

export const PROCESSED_MUTASHABIHAT: Mutashabiha[] = [];
