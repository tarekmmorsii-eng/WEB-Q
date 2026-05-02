import { useState, useRef, useEffect, useCallback } from 'react';
import { cacheAudioBlob, getAudioBlob } from '../services/audioCacheService';

export interface ActiveWord {
    surah: number;
    ayah: number;
    word: number;
}

/**
 * Creates an audio element from a Blob using Object URL.
 * Works on ALL mobile browsers — no Range Request issues.
 */
function createAudioFromBlob(blob: Blob): HTMLAudioElement {
    const objectUrl = URL.createObjectURL(blob);
    const audio = new Audio(objectUrl);
    audio.addEventListener('loadeddata', () => {
        URL.revokeObjectURL(objectUrl);
    }, { once: true });
    return audio;
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

    const preCacheWords = useCallback(async (words: ActiveWord[]) => {
        // Use IndexedDB Blob Storage — works on mobile browsers
        const BATCH_SIZE = 10;
        try {
            for (let i = 0; i < words.length; i += BATCH_SIZE) {
                const batch = words.slice(i, i + BATCH_SIZE);
                await Promise.allSettled(
                    batch.map(async (w) => {
                        const url = generateAudioUrl(w.surah, w.ayah, w.word);
                        await cacheAudioBlob(url);
                    })
                );
            }
        } catch (err) {
            console.error('[preCacheWords] failed:', err);
        }
    }, []);

    const playWordAudio = useCallback(async (surah: number, ayah: number, word: number) => {
        stopAudio();
        const url = generateAudioUrl(surah, ayah, word);

        // ─── Step 1: Try IndexedDB Blob Cache ──────────────────────
        try {
            const cachedBlob = await getAudioBlob(url);
            
            if (cachedBlob) {
                // ✅ Blob found → create Object URL for guaranteed local playback
                const audio = createAudioFromBlob(cachedBlob);
                audio.onended = () => setActiveWord(null);
                audio.onerror = () => setActiveWord(null);
                audioRef.current = audio;
                setActiveWord({ surah, ayah, word });
                try { 
                    await audio.play(); 
                } catch (e) { 
                    console.log('[word play] blob play failed:', e); 
                    setActiveWord(null); 
                }
                return;
            }
        } catch (err) {
            console.warn('[useWordByWordAudio] IndexedDB lookup failed:', err);
        }

        // ─── Step 2: Not in cache → check network ─────────────────
        if (navigator.onLine) {
            // Passive Caching: Fetch and cache in the background while playing online
            preCacheWords([{ surah, ayah, word }]).catch(() => {});

            // Online: play directly from network
            const audio = new Audio(url);
            audio.onended = () => setActiveWord(null);
            audio.onerror = () => { setActiveWord(null); };
            audioRef.current = audio;
            setActiveWord({ surah, ayah, word });
            audio.play().catch(() => setActiveWord(null));
            return;
        }

        // Offline and not cached
        window.dispatchEvent(new CustomEvent('showToast', {
            detail: { message: 'هذا الصوت غير محمل — يحتاج اتصال بالإنترنت', type: 'error' }
        }));
    }, [stopAudio, preCacheWords]);

    return {
        activeWord,
        playWordAudio,
        stopAudio,
        preCacheWords
    };
}