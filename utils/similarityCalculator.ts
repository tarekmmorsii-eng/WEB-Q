/**
 * نظام حساب التشابه بين آيات القرآن
 * يستخدم خوارزميات متعددة لتحديد نسبة التشابه بدقة
 */

export interface SimilarityInfo {
    percentage: number;      // 0-100
    grade: 1 | 2 | 3 | 4 | 5;
    color: string;           // hex color
    label: string;           // 'متطابقة', 'تشابه عالي', etc.
    labelEn: string;         // English label
}

/**
 * تنظيف النص العربي للمقارنة الصحيحة
 * - إزالة التشكيل
 * - توحيد الهمزات
 * - توحيد التاء المربوطة والهاء
 */
export function cleanArabicText(text: string): string {
    return text
        // إزالة التشكيل
        .replace(/[\u064B-\u0652]/g, '')
        // إزالة أرقام الآيات (۞) وعلامات أخرى
        .replace(/[۞٭۩]/g, '')
        // توحيد الهمزات
        .replace(/[أإآ]/g, 'ا')
        .replace(/ؤ/g, 'و')
        .replace(/ئ/g, 'ي')
        // توحيد التاء والهاء
        .replace(/ة/g, 'ه')
        // توحيد الألف المقصورة
        .replace(/ى/g, 'ي')
        // إزالة المسافات الزائدة
        .trim()
        .replace(/\s+/g, ' ');
}

/**
 * حساب التشابه على مستوى الكلمات
 * يقارن الكلمات في نفس المواقع
 */
export function calculateWordSimilarity(text1: string, text2: string): number {
    const clean1 = cleanArabicText(text1);
    const clean2 = cleanArabicText(text2);

    const words1 = clean1.split(/\s+/).filter(w => w.length > 0);
    const words2 = clean2.split(/\s+/).filter(w => w.length > 0);

    if (words1.length === 0 && words2.length === 0) return 100;
    if (words1.length === 0 || words2.length === 0) return 0;

    let matches = 0;
    const minLen = Math.min(words1.length, words2.length);
    const maxLen = Math.max(words1.length, words2.length);

    // حساب الكلمات المتطابقة في نفس المواقع
    for (let i = 0; i < minLen; i++) {
        if (words1[i] === words2[i]) {
            matches++;
        }
    }

    return (matches / maxLen) * 100;
}

/**
 * حساب Levenshtein Distance (مسافة التحرير)
 */
function levenshteinDistance(str1: string, str2: string): number {
    const len1 = str1.length;
    const len2 = str2.length;

    // Create matrix
    const matrix: number[][] = [];

    for (let i = 0; i <= len1; i++) {
        matrix[i] = [i];
    }

    for (let j = 0; j <= len2; j++) {
        matrix[0][j] = j;
    }

    // Fill matrix
    for (let i = 1; i <= len1; i++) {
        for (let j = 1; j <= len2; j++) {
            const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
            matrix[i][j] = Math.min(
                matrix[i - 1][j] + 1,      // deletion
                matrix[i][j - 1] + 1,      // insertion
                matrix[i - 1][j - 1] + cost // substitution
            );
        }
    }

    return matrix[len1][len2];
}

/**
 * حساب التشابه على مستوى الحروف
 * يستخدم Levenshtein Distance
 */
export function calculateCharacterSimilarity(text1: string, text2: string): number {
    const clean1 = cleanArabicText(text1);
    const clean2 = cleanArabicText(text2);

    if (clean1 === clean2) return 100;
    if (clean1.length === 0 && clean2.length === 0) return 100;
    if (clean1.length === 0 || clean2.length === 0) return 0;

    const distance = levenshteinDistance(clean1, clean2);
    const maxLength = Math.max(clean1.length, clean2.length);

    return ((maxLength - distance) / maxLength) * 100;
}

/**
 * حساب التشابه النهائي مع التصنيف
 * يجمع بين word-level و character-level similarity
 */
export function calculateMutashabihatSimilarity(
    sourceText: string,
    targetText: string
): SimilarityInfo {
    // 1. Word-level similarity (70% weight)
    const wordSim = calculateWordSimilarity(sourceText, targetText);

    // 2. Character-level similarity (30% weight)
    const charSim = calculateCharacterSimilarity(sourceText, targetText);

    // Weighted average
    const similarity = (wordSim * 0.7) + (charSim * 0.3);

    // التصنيف حسب النسبة
    let grade: 1 | 2 | 3 | 4 | 5;
    let color: string;
    let label: string;
    let labelEn: string;

    if (similarity >= 95) {
        grade = 1;
        color = '#22c55e'; // green-500
        label = 'متطابقة';
        labelEn = 'Identical';
    } else if (similarity >= 85) {
        grade = 2;
        color = '#3b82f6'; // blue-500
        label = 'تشابه عالي';
        labelEn = 'Very High';
    } else if (similarity >= 75) {
        grade = 3;
        color = '#eab308'; // yellow-500
        label = 'تشابه جيد';
        labelEn = 'High';
    } else if (similarity >= 65) {
        grade = 4;
        color = '#f97316'; // orange-500
        label = 'تشابه متوسط';
        labelEn = 'Medium';
    } else {
        grade = 5;
        color = '#ef4444'; // red-500
        label = 'تشابه ضعيف';
        labelEn = 'Low';
    }

    return {
        percentage: Math.round(similarity),
        grade,
        color,
        label,
        labelEn
    };
}

/**
 * الحصول على أعلى نسبة تشابه من مصفوفة similarities
 */
export function getHighestSimilarity(similarities: SimilarityInfo[]): SimilarityInfo | null {
    if (similarities.length === 0) return null;

    return similarities.reduce((highest, current) =>
        current.percentage > highest.percentage ? current : highest
    );
}

/**
 * فلترة المتشابهات حسب النسبة الدنيا
 */
export function filterByMinSimilarity(
    similarities: Array<{ similarity: SimilarityInfo }>,
    minPercentage: number
): Array<{ similarity: SimilarityInfo }> {
    return similarities.filter(item => item.similarity.percentage >= minPercentage);
}

/**
 * تحديد الكلمات المتطابقة بين نصين
 * @returns مصفوفة قيم منطقية لكل كلمة في النص المراد تلوينه
 */
export function getMatchingWords(textToHighlight: string, referenceText: string): boolean[] {
    const cleanReference = cleanArabicText(referenceText);
    const refWords = new Set(cleanReference.split(/\s+/).filter(w => w.length > 0));

    // تقسيم النص الأصلي مع الحفاظ على المسافات/التشكيل للعرض
    const wordsToHighlight = textToHighlight.split(/\s+/).filter(w => w.length > 0);

    return wordsToHighlight.map(word => {
        const cleanW = cleanArabicText(word);
        return refWords.has(cleanW);
    });
}

/**
 * ترتيب حسب النسبة (الأعلى أولاً)
 */
export function sortBySimilarity<T extends { similarity?: SimilarityInfo }>(
    items: T[]
): T[] {
    return [...items].sort((a, b) => {
        const simA = a.similarity?.percentage || 0;
        const simB = b.similarity?.percentage || 0;
        return simB - simA; // descending
    });
}
