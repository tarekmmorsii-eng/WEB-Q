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
                    let text = ayah.text;
                    // Clean Basmalah from first ayah (except Fatiha)
                    if (surahNumber !== 1 && ayahNumber === 1) {
                        const basmalahs = [
                            "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
                            "بِسْمِ اللهِ الرَّحْمَنِ الرَّحِيمِ",
                            "بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ"
                        ];
                        for (const b of basmalahs) {
                            if (text.startsWith(b)) {
                                text = text.replace(b, "").trim();
                                break;
                            }
                        }
                    }
                    return text;
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
                let text = data.data.text;
                // Clean Basmalah from first ayah (except Fatiha)
                if (surahNumber !== 1 && ayahNumber === 1) {
                    const basmalahs = [
                        "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
                        "بِسْمِ اللهِ الرَّحْمَنِ الرَّحِيمِ",
                        "بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ"
                    ];
                    for (const b of basmalahs) {
                        if (text.startsWith(b)) {
                            text = text.replace(b, "").trim();
                            break;
                        }
                    }
                }
                return text;
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

        if (quranDataCache && quranDataCache.data && quranDataCache.data.surahs) {
            // Index cache for fast lookup
            const surahLookup = new Map<number, Map<number, string>>();
            quranDataCache.data.surahs.forEach((s: any) => {
                const ayahMap = new Map<number, string>();
                if (s.ayahs) {
                    s.ayahs.forEach((a: any) => ayahMap.set(a.numberInSurah, a.text));
                }
                surahLookup.set(s.number, ayahMap);
            });

            // Fast lookup
            for (const ref of ayahRefs) {
                let text = surahLookup.get(ref.surahNumber)?.get(ref.ayahNumber);
                if (text) {
                    // Clean Basmalah from first ayah (except Fatiha)
                    if (ref.surahNumber !== 1 && ref.ayahNumber === 1) {
                        const basmalahs = [
                            "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
                            "بِسْم. اللهِ الرَّحْمَنِ الرَّحِيمِ",
                            "بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ"
                        ];
                        for (const b of basmalahs) {
                            if (text.startsWith(b)) {
                                text = text.replace(b, "").trim();
                                break;
                            }
                        }
                    }
                    results.set(`${ref.surahNumber}-${ref.ayahNumber}`, text);
                }
            }
        }
    } catch (error) {
        console.warn('Batch load from cache failed:', error);
    }

    // Fallback: fetch missing ones in parallel if we don't have all results
    const missingRefs = ayahRefs.filter(ref => !results.has(`${ref.surahNumber}-${ref.ayahNumber}`));

    if (missingRefs.length > 0) {
        // Process in chunks of 10 to avoid overwhelming the browser/API
        const CHUNK_SIZE = 10;
        for (let i = 0; i < missingRefs.length; i += CHUNK_SIZE) {
            const chunk = missingRefs.slice(i, i + CHUNK_SIZE);
            await Promise.all(chunk.map(async (ref) => {
                try {
                    const text = await getAyahText(ref.surahNumber, ref.ayahNumber);
                    results.set(`${ref.surahNumber}-${ref.ayahNumber}`, text);
                } catch (e) {
                    console.error(`Failed to fetch ${ref.surahNumber}:${ref.ayahNumber}`, e);
                }
            }));
        }
    }

    return results;
}
