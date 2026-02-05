import { absoluteToSurahAyah, surahAyahToAbsolute } from '../utils/quranHelpers';
import { Mutashabiha, MutashabihaRaw, AyahReference } from '../types';
import { MUTASHABIHAT_DATA_FULL } from '../constants/mutashabihatData';
import { calculateMutashabihatSimilarity, getHighestSimilarity, sortBySimilarity } from './similarityCalculator';
import { getAyahText } from './ayahTextHelper';

/**
 * تحويل البيانات الخام من JSON إلى format معالج مع حساب التشابه
 */
export async function processMutashabihatData(rawData: any): Promise<Mutashabiha[]> {
    const processed: Mutashabiha[] = [];

    // Case 1: New Flat Array Structure (from the book)
    if (Array.isArray(rawData)) {
        for (const entry of rawData) {
            if (!entry.sourceAyah || !entry.similarAyahs) continue;

            // Get source text if missing
            let sourceText = entry.sourceAyah.text || "";
            if (!sourceText) {
                sourceText = await getAyahText(entry.sourceAyah.surahNumber, entry.sourceAyah.ayahNumber);
            }

            const similarAyahs: AyahReference[] = [];
            for (const sim of entry.similarAyahs) {
                let simText = sim.text || "";
                if (!simText) {
                    simText = await getAyahText(sim.surahNumber, sim.ayahNumber);
                }

                similarAyahs.push({
                    ...sim,
                    text: simText,
                    similarity: sim.similarity || calculateMutashabihatSimilarity(sourceText, simText)
                });
            }

            processed.push({
                ...entry,
                sourceAyah: { ...entry.sourceAyah, text: sourceText },
                similarAyahs: sortBySimilarity(similarAyahs),
                highestSimilarity: getHighestSimilarity(similarAyahs.map(a => a.similarity!)) || undefined
            });
        }
        return processed;
    }

    // Case 2: Legacy Juz-based Record Structure
    for (const [juz, mutations] of Object.entries(rawData as Record<string, MutashabihaRaw[]>)) {
        for (const mut of mutations) {
            const srcArray = Array.isArray(mut.src.ayah) ? mut.src.ayah : [mut.src.ayah];
            for (const srcAbsolute of srcArray) {
                const sourceAyah = absoluteToSurahAyah(srcAbsolute);
                const sourceText = await getAyahText(sourceAyah.surahNumber, sourceAyah.ayahNumber);
                const similarAyahs: AyahReference[] = [];

                for (const mutItem of mut.muts) {
                    const mutArray = Array.isArray(mutItem.ayah) ? mutItem.ayah : [mutItem.ayah];
                    for (const mutAbsolute of mutArray) {
                        const similarAyahInfo = absoluteToSurahAyah(mutAbsolute);
                        const similarText = await getAyahText(similarAyahInfo.surahNumber, similarAyahInfo.ayahNumber);
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

                processed.push({
                    id: `base_${srcAbsolute}_${mut.muts[0]?.ayah || 0}`,
                    sourceAyah: { ...sourceAyah, absoluteAyahNumber: srcAbsolute, text: sourceText },
                    similarAyahs: sortBySimilarity(similarAyahs),
                    showContext: mut.ctx === 2,
                    highestSimilarity: getHighestSimilarity(similarAyahs.map(a => a.similarity!)) || undefined
                });
            }
        }
    }

    return processed;
}

/**
 * البحث عن جميع المتشابهات لآية معينة - يدعم الآيات التي لها أكثر من موضع تشابه
 */
export function findAllMutashabihatForAyah(
    surahNumber: number,
    ayahNumber: number,
    mutashabihat: Mutashabiha[]
): Mutashabiha[] {
    if (!mutashabihat) return [];
    return mutashabihat.filter(
        (mut) =>
            (mut.sourceAyah.surahNumber === surahNumber && mut.sourceAyah.ayahNumber === ayahNumber) ||
            mut.similarAyahs.some(s => s.surahNumber === surahNumber && s.ayahNumber === ayahNumber)
    );
}

/**
 * البحث عن متشابهات لآية معينة - يدعم البحث في كلاً من الآية الرئيسية والمتشابهات
 */
export function findMutashabihatForAyah(
    surahNumber: number,
    ayahNumber: number,
    mutashabihat: Mutashabiha[]
): Mutashabiha | null {
    const all = findAllMutashabihatForAyah(surahNumber, ayahNumber, mutashabihat);
    if (all.length === 0) return null;

    // Priority: Group where current ayah is the SOURCE
    const asSource = all.find(m => m.sourceAyah.surahNumber === surahNumber && m.sourceAyah.ayahNumber === ayahNumber);
    return asSource || all[0];
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

/**
 * الحصول على كائن متشابهات مدمج لكافة المجموعات التي تنتمي إليها الآية
 */
export function getMergedMutashabihaForAyah(
    surah: number,
    ayah: number,
    mutashabihat: Mutashabiha[]
): Mutashabiha | null {
    const allMatches = findAllMutashabihatForAyah(surah, ayah, mutashabihat);
    if (allMatches.length === 0) return null;
    if (allMatches.length === 1) return allMatches[0];

    // Identify our target ayah reference from existing data
    let targetRef: AyahReference | undefined;
    for (const m of allMatches) {
        if (m.sourceAyah.surahNumber === surah && m.sourceAyah.ayahNumber === ayah) {
            targetRef = m.sourceAyah;
            break;
        }
        targetRef = m.similarAyahs.find(s => s.surahNumber === surah && s.ayahNumber === ayah);
        if (targetRef) break;
    }

    if (!targetRef) return allMatches[0];

    const combinedSimilar: AyahReference[] = [];
    const seenKeys = new Set<string>();
    seenKeys.add(`${surah}-${ayah}`);

    allMatches.forEach(mut => {
        const isTargetSource = mut.sourceAyah.surahNumber === surah && mut.sourceAyah.ayahNumber === ayah;

        if (isTargetSource) {
            // الآية الحالية هي المصدر، أضف كل المتشابهات المرتبطة بها
            mut.similarAyahs.forEach(s => {
                const key = `${s.surahNumber}-${s.ayahNumber}`;
                if (!seenKeys.has(key)) {
                    combinedSimilar.push(s);
                    seenKeys.add(key);
                }
            });
        } else {
            // الآية الحالية هي أحد المتشابهات، جد نص التشابه (القاعدة) الذي ربطها بالمصدر
            const targetInGroup = mut.similarAyahs.find(s => s.surahNumber === surah && s.ayahNumber === ayah);
            const targetRule = targetInGroup?.rule;

            // أضف آية المصدر الخاصة بالمجموعة
            const sourceKey = `${mut.sourceAyah.surahNumber}-${mut.sourceAyah.ayahNumber}`;
            if (!seenKeys.has(sourceKey)) {
                combinedSimilar.push(mut.sourceAyah);
                seenKeys.add(sourceKey);
            }

            // أضف المتشابهات الأخرى فقط إذا كانت تشترك في نفس نص التشابه
            mut.similarAyahs.forEach(s => {
                const key = `${s.surahNumber}-${s.ayahNumber}`;
                if (seenKeys.has(key)) return;

                if (targetRule && s.rule) {
                    const r1 = targetRule.trim();
                    const r2 = s.rule.trim();
                    // تطابق القواعد يسمح بكلمة واحدة (مثل إذ، تلك)
                    if (r1 === r2 || r1.includes(r2) || r2.includes(r1)) {
                        combinedSimilar.push(s);
                        seenKeys.add(key);
                    }
                }
            });
        }
    });

    return {
        id: `merged_${surah}_${ayah}`,
        sourceAyah: targetRef,
        similarAyahs: combinedSimilar,
        showContext: allMatches.some(m => m.showContext)
    };
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
