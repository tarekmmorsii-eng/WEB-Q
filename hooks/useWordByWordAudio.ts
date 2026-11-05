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

export function useWordByWordAudio(playbackErrorMessage?: string) {
    const [activeWord, setActiveWord] = useState<ActiveWord | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const requestRef = useRef(0);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            requestRef.current++;
            if (audioRef.current) {
                audioRef.current.onerror = null;
                audioRef.current.onended = null;
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
        requestRef.current++;
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

    const preCacheWords = useCallback(async (
        words: ActiveWord[],
        onProgress?: (percent: number, message?: string) => void
    ) => {
        // Use IndexedDB Blob Storage — works on mobile browsers
        const BATCH_SIZE = 10;
        const total = words.length;
        let completed = 0;

        try {
            for (let i = 0; i < words.length; i += BATCH_SIZE) {
                const batch = words.slice(i, i + BATCH_SIZE);
                await Promise.allSettled(
                    batch.map(async (w) => {
                        const url = generateAudioUrl(w.surah, w.ayah, w.word);
                        await cacheAudioBlob(url);
                    })
                );
                completed += batch.length;

                // إبلاغ التقدم بعد كل دفعة
                if (onProgress) {
                    const percent = Math.round((completed / total) * 100);
                    onProgress(percent, `${completed} / ${total}`);
                }
            }
        } catch (err) {
            console.error('[preCacheWords] failed:', err);
        }
    }, []);

    const playWordAudio = useCallback(async (surah: number, ayah: number, word: number) => {
        stopAudio();
        const request = requestRef.current;
        const url = generateAudioUrl(surah, ayah, word);

        // ─── Step 1: Try IndexedDB Blob Cache ──────────────────────
        try {
            const cachedBlob = await getAudioBlob(url);
            if (request !== requestRef.current) return;
            
            if (cachedBlob) {
                // ✅ Blob found → create Object URL for guaranteed local playback
                const audio = createAudioFromBlob(cachedBlob);
                audio.onended = () => { if (request === requestRef.current) setActiveWord(null); };
                audio.onerror = () => { if (request === requestRef.current) setActiveWord(null); };
                audioRef.current = audio;
                setActiveWord({ surah, ayah, word });
                try { 
                    await audio.play(); 
                } catch (e) { 
                    console.log('[word play] blob play failed:', e); 
                    if (request === requestRef.current) setActiveWord(null);
                }
                return;
            }
        } catch (err) {
            console.warn('[useWordByWordAudio] IndexedDB lookup failed:', err);
        }

        // ─── Step 2: Not in cache → play from network ─────────────
        if (request !== requestRef.current) return;
        // (لا نعتمد على navigator.onLine لأنها غير موثوقة على بعض الأجهزة،
        //  بل نحاول دائماً ونعرض رسالة عامة عند الفشل الفعلي فقط)
        // Passive Caching: Fetch and cache in the background while playing
        preCacheWords([{ surah, ayah, word }]).catch(() => {});

        // Play directly from network
        const audio = new Audio(url);
        let errorShown = false;
        const fail = (error?: unknown) => {
            if (request !== requestRef.current || audioRef.current !== audio || errorShown) return;
            if ((error as { name?: string })?.name === 'AbortError') return;
            errorShown = true;
            setActiveWord(null);
            window.dispatchEvent(new CustomEvent('showToast', {
                detail: { message: playbackErrorMessage || 'عذراً، تعذّر تشغيل هذا الصوت، تحقق من اتصالك بالإنترنت ثم حاول مرة أخرى.', type: 'error' }
            }));
        };
        audio.onended = () => { if (request === requestRef.current) setActiveWord(null); };
        audio.onerror = () => fail();
        audioRef.current = audio;
        setActiveWord({ surah, ayah, word });
        audio.play().catch(fail);
        return;
    }, [stopAudio, preCacheWords, playbackErrorMessage]);

    return {
        activeWord,
        playWordAudio,
        stopAudio,
        preCacheWords
    };
}
