import { SURAHS } from '../constants/surahData';

/**
 * تحويل رقم الآية المطلق (1-6236) إلى (surahNumber, ayahNumber)
 */
export function absoluteToSurahAyah(absoluteNumber: number): { surahNumber: number; ayahNumber: number } {
    let accumulated = 0;

    for (const surah of SURAHS) {
        if (absoluteNumber <= accumulated + surah.ayahCount) {
            return {
                surahNumber: surah.number,
                ayahNumber: absoluteNumber - accumulated
            };
        }
        accumulated += surah.ayahCount;
    }

    // Fallback
    return { surahNumber: 1, ayahNumber: 1 };
}

/**
 * تحويل (surahNumber, ayahNumber) إلى رقم الآية المطلق
 */
export function surahAyahToAbsolute(surah: number, ayah: number): number {
    let accumulated = 0;

    for (let i = 0; i < surah - 1; i++) {
        accumulated += SURAHS[i].ayahCount;
    }

    return accumulated + ayah;
}

/**
 * الحصول على اسم السورة بالعربية
 */
export function getSurahName(surahNumber: number): string {
    const surah = SURAHS.find(s => s.number === surahNumber);
    return surah ? surah.name : '';
}
