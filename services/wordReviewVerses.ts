import { normalizeSharedVerseText } from './ayahSharing';
export interface ReviewVerse { text: string; page: number }
let pending: Promise<Record<string, ReviewVerse>> | undefined;
// Read complete verses from the bundled Unicode Quran. Saved QPC glyphs and
// page fragments are never treated as ordinary Arabic verse text.
export function loadWordReviewVerses(): Promise<Record<string, ReviewVerse>> {
    if (!pending) pending = fetch('/quran.json').then(async response => {
        if (!response.ok) throw Error('Quran unavailable');
        const data = await response.json();
        if (!Array.isArray(data.data?.surahs)) throw Error('Invalid Quran data');
        const verses: Record<string, ReviewVerse> = {};
        for (const surah of data.data.surahs) for (const ayah of surah.ayahs) {
            if (typeof ayah.text !== 'string') throw Error('Invalid verse');
            verses[`${surah.number}:${ayah.numberInSurah}`] = {
                text: normalizeSharedVerseText(ayah.text, surah.number, ayah.numberInSurah),
                page: ayah.page,
            };
        }
        return verses;
    }).catch(error => { pending = undefined; throw error; });
    return pending;
}
const fonts = new Map<number, Promise<void>>();
export function loadReviewWordFont(page: number): Promise<void> {
    if (!Number.isInteger(page) || page < 1 || page > 604) return Promise.reject(Error('Invalid page'));
    if (!fonts.has(page)) {
        const font = new FontFace(`review-p${page}-v2`, `url('/fonts/v2/p${page}.woff2')`);
        fonts.set(page, font.load().then(loaded => { document.fonts.add(loaded); }).catch(error => { fonts.delete(page); throw error; }));
    }
    return fonts.get(page)!;
}
