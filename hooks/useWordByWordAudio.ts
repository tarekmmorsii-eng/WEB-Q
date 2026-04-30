import { useState, useRef, useEffect, useCallback } from 'react';

export interface ActiveWord {
    surah: number;
    ayah: number;
    word: number;
}

export function useWordByWordAudio() {
    const [activeWord, setActiveWord] = useState<ActiveWord | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.src = '';
                audioRef.current = null;
            }
        };
    }, []);

    const generateAudioUrl = (surah: number, ayah: number, word: number) => {
        const surahStr = String(surah).padStart(3, '0');
        const ayahStr = String(ayah).padStart(3, '0');
        const wordStr = String(word).padStart(3, '0');
        return `https://audio.qurancdn.com/wbw/${surahStr}_${ayahStr}_${wordStr}.mp3`;
    };

    const stopAudio = useCallback(() => {
        if (audioRef.current) {
            audioRef.current.oncanplaythrough = null;
            audioRef.current.onended = null;
            audioRef.current.onerror = null;
            audioRef.current.pause();
            audioRef.current.removeAttribute('src');
            audioRef.current.load();
            audioRef.current = null;
        }
        setActiveWord(null);
    }, []);

    const playWordAudio = useCallback(async (surah: number, ayah: number, word: number) => {
        stopAudio();
        const url = generateAudioUrl(surah, ayah, word);

        if (navigator.onLine) {
            // Online: play directly
            const audio = new Audio(url);
            audio.onended = () => setActiveWord(null);
            audio.onerror = () => { setActiveWord(null); };
            audioRef.current = audio;
            setActiveWord({ surah, ayah, word });
            audio.play().catch(() => setActiveWord(null));
            return;
        }

        // Offline: check quran-audio-v2 directly (caches.match may miss opaque responses)
        let cached: Response | undefined;
        try {
            const cache = await caches.open('quran-audio-v2');
            cached = (await cache.match(url)) ?? undefined;
        } catch { /* ignore */ }

        if (!cached) {
            window.dispatchEvent(new CustomEvent('showToast', {
                detail: { message: 'هذا الصوت غير محمل — يحتاج اتصال بالإنترنت', type: 'error' }
            }));
            return;
        }
        // Pass URL directly — SW intercepts and serves from quran-audio-v2
        // No crossOrigin: opaque responses fail with crossorigin="anonymous"
        const audio = new Audio(url);
        audio.onended = () => setActiveWord(null);
        audio.onerror = () => setActiveWord(null);
        audioRef.current = audio;
        setActiveWord({ surah, ayah, word });
        try { await audio.play(); } catch (e) { console.log('[word play] failed:', e); setActiveWord(null); }
    }, [stopAudio]);

    const preCacheWords = useCallback(async (words: ActiveWord[]) => {
        // audio.qurancdn.com supports CORS ✅
        // We use 'cors' mode to get readable responses (not opaque)
        const CACHE_NAME = 'quran-audio-v2';
        const BATCH_SIZE = 10;
        try {
            const cache = await caches.open(CACHE_NAME);
            for (let i = 0; i < words.length; i += BATCH_SIZE) {
                const batch = words.slice(i, i + BATCH_SIZE);
                await Promise.all(batch.map(async (w) => {
                    const url = generateAudioUrl(w.surah, w.ayah, w.word);
                    try {
                        const existing = await cache.match(url);
                        if (existing) return;

                        const response = await fetch(url, { mode: 'cors' });
                        if (response.ok) {
                            const blob = await response.blob();
                            const fresh = new Response(blob, {
                                status: 200,
                                headers: { 'Content-Type': 'audio/mpeg' }
                            });
                            await cache.put(url, fresh);
                        } else {
                            // Fallback: blind cache if CORS fails for some reason
                            await cache.put(url, response.clone());
                        }
                    } catch (err) {
                        console.error(`[preCacheWords] ${url}:`, err);
                    }
                }));
            }
        } catch (err) {
            console.error('[preCacheWords] failed:', err);
        }
    }, []);

    return {
        activeWord,
        playWordAudio,
        stopAudio,
        preCacheWords
    };
}
