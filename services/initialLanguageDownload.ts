import { getTranslation, getWbwData, saveTranslation, saveWbwData } from './translationStorageService';
import { TRANSLATION_EDITIONS, getAlQuranCloudUrl } from '../utils/translationMapper';

export const LANGUAGE_DATA_UPDATED = 'language-data-updated';
const running = new Map<string, { promise: Promise<void>; percent: number; listeners: Set<(percent: number) => void> }>();
const wordLanguages: Record<string, string> = { en: 'english', ur: 'urdu', bn: 'bengali', id: 'indonesian', tr: 'turkish', hi: 'hindi', ta: 'tamil' };
async function json(url: string) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 30000);
    try {
        const response = await fetch(url, { signal: controller.signal });
        if (!response.ok) throw new Error(`Download failed: ${response.status}`);
        return await response.json();
    } finally { clearTimeout(timer); }
}

export function validTranslation(data: any): boolean {
    return Array.isArray(data?.surahs) && data.surahs.length === 114
        && data.surahs.every((s: any, i: number) => s.number === i + 1 && Array.isArray(s.ayahs)
            && s.ayahs.length > 0 && s.ayahs.every((a: any) => typeof a.text === 'string' && a.text.trim()))
        && data.surahs.reduce((n: number, s: any) => n + s.ayahs.length, 0) === 6236;
}

export async function isLanguageReady(language: string): Promise<boolean> {
    if (language === 'ar') return true;
    if (!validTranslation((await getTranslation(language))?.data)) return false;
    return !TRANSLATION_EDITIONS[language]?.hasWbw || Object.keys((await getWbwData(language))?.data || {}).length === 6236;
}

export function prepareLanguage(language: string, progress: (percent: number) => void, forceTranslationRefresh = false): Promise<void> {
    if (language === 'ar') return Promise.resolve();
    const existing = running.get(language);
    if (existing) {
        existing.listeners.add(progress);
        progress(existing.percent);
        return existing.promise;
    }
    const entry = { promise: Promise.resolve(), percent: 0, listeners: new Set([progress]) };
    entry.promise = Promise.resolve().then(() => download(language, percent => {
        entry.percent = percent;
        entry.listeners.forEach(listener => listener(percent));
    }, forceTranslationRefresh)).finally(() => running.delete(language));
    running.set(language, entry);
    return entry.promise;
}

async function download(language: string, progress: (percent: number) => void, forceTranslationRefresh: boolean) {
    const edition = TRANSLATION_EDITIONS[language];
    if (!edition?.editionId) throw new Error('unavailable');
    progress(0);
    const existing = await getTranslation(language);
    if (forceTranslationRefresh || !validTranslation(existing?.data)) {
        let data: any;
        if (edition.source === 'alquran-cloud') {
            const result = await json(getAlQuranCloudUrl(edition.editionId));
            if (result.code !== 200) throw new Error('Invalid translation');
            data = result.data;
        } else {
            const id = edition.editionId.replace(/_/g, '-');
            const result = await json(`https://raw.githubusercontent.com/fawazahmed0/quran-api/1/editions/${id}.json`);
            if (!Array.isArray(result.quran)) throw new Error('Invalid translation');
            data = { surahs: Array.from({ length: 114 }, (_, i) => ({ number: i + 1,
                ayahs: result.quran.filter((a: any) => a.chapter === i + 1)
                    .map((a: any) => ({ numberInSurah: a.verse, text: a.text })) })) };
        }
        if (!validTranslation(data)) throw new Error('Incomplete translation');
        await saveTranslation({ languageCode: language, languageName: edition.nameAr, timestamp: Date.now(),
            data: { ...data, _meta: { ...edition, downloadedAt: new Date().toISOString() } } });
        window.dispatchEvent(new CustomEvent(LANGUAGE_DATA_UPDATED, { detail: language }));
    }
    progress(35);
    if (edition.hasWbw) {
        const existingWords = await getWbwData(language);
        if (Object.keys(existingWords?.data || {}).length !== 6236) {
            const words: Record<string, any> = {};
            let next = 1, complete = 0, failed = false;
            const results = await Promise.allSettled(Array.from({ length: 4 }, async () => {
              try {
                while (next <= 114 && !failed) {
                    const chapter = next++;
                    let page: number | null = 1;
                    while (page !== null && !failed) {
                        const result = await json(`https://api.quran.com/api/v4/verses/by_chapter/${chapter}?language=${language}&words=true&word_fields=translation&per_page=300&page=${page}`);
                        if (!Array.isArray(result.verses) || !result.verses.length) throw new Error('Incomplete word meanings');
                        for (const verse of result.verses) {
                            const items: Record<string, { translation: string }> = {};
                            for (const word of verse.words || []) {
                                if (word.char_type_name === 'word') {
                                    if (word.translation?.language_name?.toLowerCase() !== wordLanguages[language]) throw new Error('Unexpected word meaning language');
                                    const text = word.translation?.text;
                                    if (typeof text !== 'string' || !text.trim()) throw new Error('Missing word meaning');
                                    items[String(word.position)] = { translation: text };
                                }
                            }
                            if (!Object.keys(items).length) throw new Error('Missing word meanings');
                            words[verse.verse_key] = items;
                        }
                        const following = result.pagination?.next_page;
                        if (following && following <= page) throw new Error('Invalid pagination');
                        page = following || null;
                    }
                    progress(35 + Math.floor(++complete / 114 * 64));
                }
              } catch (error) { failed = true; throw error; }
            }));
            const failure = results.find((r): r is PromiseRejectedResult => r.status === 'rejected');
            if (failure) throw failure.reason;
            if (Object.keys(words).length !== 6236) throw new Error('Incomplete word meanings');
            await saveWbwData({ languageCode: language, data: words, timestamp: Date.now() });
            window.dispatchEvent(new CustomEvent(LANGUAGE_DATA_UPDATED, { detail: language }));
        }
    }
    progress(100);
}
