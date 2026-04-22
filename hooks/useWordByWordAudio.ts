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

    const playWordAudio = useCallback((surah: number, ayah: number, word: number) => {
        // Stop any currently playing audio
        stopAudio();

        const url = generateAudioUrl(surah, ayah, word);
        const audio = new Audio(url);

        audio.onended = () => {
            setActiveWord(null);
        };

        audio.onerror = () => {
            console.error("Audio failed to load:", url);
            setActiveWord(null);
        };

        audioRef.current = audio;
        setActiveWord({ surah, ayah, word });

        audio.play().catch(err => {
            console.error("Audio playback failed:", err);
            setActiveWord(null);
        });

    }, [stopAudio]);

    const preCacheWords = useCallback(async (words: ActiveWord[]) => {
        const CACHE_NAME = 'quran-core-v2026-03-30-V1';
        const BATCH_SIZE = 10;
        
        try {
            const cache = await caches.open(CACHE_NAME);
            
            for (let i = 0; i < words.length; i += BATCH_SIZE) {
                const batch = words.slice(i, i + BATCH_SIZE);
                const promises = batch.map(async (w) => {
                    const surahStr = String(w.surah).padStart(3, '0');
                    const ayahStr = String(w.ayah).padStart(3, '0');
                    const wordStr = String(w.word).padStart(3, '0');
                    const url = `https://audio.qurancdn.com/wbw/${surahStr}_${ayahStr}_${wordStr}.mp3`;
                    
                    try {
                        const response = await caches.match(url);
                        if (!response) {
                            const fetchResponse = await fetch(url);
                            if (fetchResponse.ok) {
                                await cache.put(url, fetchResponse);
                            }
                        }
                    } catch (err) {
                        console.error(`Failed to cache word audio: ${url}`, err);
                    }
                });
                await Promise.all(promises);
            }
        } catch (err) {
            console.error("Failed to open cache or pre-cache words:", err);
        }
    }, []);

    return {
        activeWord,
        playWordAudio,
        stopAudio,
        preCacheWords
    };
}
