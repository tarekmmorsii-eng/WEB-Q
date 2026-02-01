import { SURAHS } from '../constants/surahData';

/**
 * Get ayah text from local data or API
 * For now, returns a placeholder. In production, this should fetch from quran.json or API
 */
let quranDataCache: any = null;

/**
 * Get ayah text from local data or API
 */
export async function getAyahText(surahNumber: number, ayahNumber: number): Promise<string> {
    try {
        if (!quranDataCache) {
            const response = await fetch('/quran.json');
            if (response.ok) {
                quranDataCache = await response.json();
            }
        }

        if (quranDataCache) {
            const surah = quranDataCache.data?.surahs?.[surahNumber - 1];
            if (surah) {
                const ayah = surah.ayahs?.find((a: any) => a.numberInSurah === ayahNumber);
                if (ayah && ayah.text) {
                    return ayah.text;
                }
            }
        }
    } catch (error) {
        console.warn('Failed to load from local quran.json, trying API', error);
    }

    // Fallback: Use al-quran.cloud API
    try {
        const response = await fetch(`https://api.alquran.cloud/v1/ayah/${surahNumber}:${ayahNumber}/ar.asad`);
        if (response.ok) {
            const data = await response.json();
            if (data.data && data.data.text) {
                return data.data.text;
            }
        }
    } catch (error) {
        console.error('Failed to fetch from API:', error);
    }

    // Ultimate fallback
    const surahName = SURAHS.find(s => s.number === surahNumber)?.name || '';
    return `${surahName} - آية ${ayahNumber}`;
}

/**
 * Get multiple ayah texts in batch
 */
export async function getAyahTexts(ayahRefs: Array<{ surahNumber: number; ayahNumber: number }>): Promise<Map<string, string>> {
    const results = new Map<string, string>();

    // Try loading from local cache first
    try {
        if (!quranDataCache) {
            const response = await fetch('/quran.json');
            if (response.ok) {
                quranDataCache = await response.json();
            }
        }

        if (quranDataCache) {
            ayahRefs.forEach(ref => {
                const surah = quranDataCache.data?.surahs?.[ref.surahNumber - 1];
                if (surah) {
                    const ayah = surah.ayahs?.find((a: any) => a.numberInSurah === ref.ayahNumber);
                    if (ayah && ayah.text) {
                        results.set(`${ref.surahNumber}-${ref.ayahNumber}`, ayah.text);
                    }
                }
            });

            // If we got all texts, return
            if (results.size === ayahRefs.length) {
                return results;
            }
        }
    } catch (error) {
        console.warn('Batch load from cache failed, will try fallback');
    }

    // Fallback: fetch missing ones individually
    for (const ref of ayahRefs) {
        const key = `${ref.surahNumber}-${ref.ayahNumber}`;
        if (!results.has(key)) {
            const text = await getAyahText(ref.surahNumber, ref.ayahNumber);
            results.set(key, text);
        }
    }

    return results;
}
