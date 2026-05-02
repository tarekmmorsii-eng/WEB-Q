import { useState, useRef, useCallback } from 'react';
import { buildAudioUrl } from '../services/reciterService';
import { cacheAudioBlob, getAudioBlob } from '../services/audioCacheService';


export interface PlayerSettings {
    startGlobalAyah: number;
    endGlobalAyah: number;
    reciterId: string;
    groupRepetitions: number; // -1 for infinity
    ayahRepetitions: number;  // -1 for infinity
    playbackRate: number;
}

export interface UseAyahAudioProps {
    onAudioError?: (msg: string) => void;
}

/**
 * Creates an audio element from a Blob using Object URL.
 * This is the KEY fix for mobile browsers:
 *   - Desktop browsers can play from Cache API via SW interception
 *   - Mobile browsers FAIL with Range Requests through SW
 *   - Object URL (blob:) is 100% local — no network, no Range issues
 */
function createAudioFromBlob(blob: Blob): HTMLAudioElement {
    const objectUrl = URL.createObjectURL(blob);
    const audio = new Audio(objectUrl);
    // When audio loads metadata, revoke the URL to free memory
    // (audio keeps playing even after revoke)
    audio.addEventListener('loadeddata', () => {
        URL.revokeObjectURL(objectUrl);
    }, { once: true });
    return audio;
}

export function useAyahAudio({ onAudioError }: UseAyahAudioProps = {}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const preloadAudioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlayingSeq, setIsPlayingSeq] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const isPlayingRef = useRef(false);
  const [currentGlobalAyah, setCurrentGlobalAyah] = useState<number | null>(null);
  
  // New Ref to handle live-updatable settings during a sequence
  const runtimeSettingsRef = useRef<PlayerSettings | null>(null);

  // Helper: show error message
  const showError = useCallback((msg: string) => {
    if (onAudioError) {
        onAudioError(msg);
    } else {
        window.dispatchEvent(new CustomEvent('showToast', { 
            detail: { message: msg, type: 'error' } 
        }));
    }
  }, [onAudioError]);

  // Helper: reset play state
  const resetPlayState = useCallback(() => {
    setIsPlayingSeq(false);
    isPlayingRef.current = false;
    setIsPaused(false);
  }, []);

  // تشغيل آية واحدة مخصصة (وإرجاع Promise للانتظار)
  const playAyahAudio = useCallback((globalAyahNumber: number, reciterID: string, playbackRate: number = 1.0, nextGlobalAyahNumber?: number): Promise<void> => {
    return new Promise(async (resolve) => {
      // إيقاف أي صوت سابق
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.removeAttribute('src');
      }

      const url = buildAudioUrl(reciterID, globalAyahNumber);
      const nextUrl = nextGlobalAyahNumber ? buildAudioUrl(reciterID, nextGlobalAyahNumber) : null;

      if (!url) {
        showError('رابط الصوت غير متاح لهذا القارئ');
        resetPlayState();
        resolve();
        return;
      }

      const tryPlay = async () => {
          // ─── Step 1: Try IndexedDB Blob Cache ──────────────────────
          // This is the PRIMARY method — works on ALL mobile browsers
          try {
            const cachedBlob = await getAudioBlob(url);
            
            if (cachedBlob) {
                // ✅ Blob found in IndexedDB → create Object URL for guaranteed local playback
                const audio = createAudioFromBlob(cachedBlob);
                audio.playbackRate = playbackRate;
                
                // Preload next ayah in background
                let preloaded = false;
                audio.ontimeupdate = () => {
                    if (nextUrl && !preloaded && audio.duration && (audio.duration - audio.currentTime < 1.5)) {
                        preloaded = true;
                        // Preload next ayah blob
                        getAudioBlob(nextUrl).then(blob => {
                            if (blob) {
                                const nextAudio = createAudioFromBlob(blob);
                                nextAudio.preload = 'auto';
                                nextAudio.load();
                                preloadAudioRef.current = nextAudio;
                            }
                        }).catch(() => {});
                    }
                };

                audio.onended = () => {
                    if (audio.duration === 0 || isNaN(audio.duration)) {
                        showError('الملف الصوتي تالف أو غير متاح');
                        resetPlayState();
                    }
                    resolve();
                };

                audio.onerror = () => {
                    console.warn(`[useAyahAudio] Playback error for cached blob: ${url}`);
                    resetPlayState();
                    resolve();
                };

                audioRef.current = audio;
                try {
                    await audio.play();
                } catch (e) {
                    console.log('[audio.play] failed or interrupted:', e);
                    resetPlayState();
                    resolve();
                }
                return; // Done — played from IndexedDB
            }
          } catch (err) {
            console.warn('[useAyahAudio] IndexedDB lookup failed, falling back:', err);
          }

          // ─── Step 2: Not in cache → check network ─────────────────
          if (!navigator.onLine) {
              showError('لا يوجد إنترنت، وهذا الملف غير محمل مسبقاً');
              resetPlayState();
              resolve();
              return;
          }

          // Online: Play from network + cache in background
          preCacheAudio([globalAyahNumber], reciterID).catch(() => {});
          
          let audio: HTMLAudioElement;
          if (preloadAudioRef.current && preloadAudioRef.current.src) {
              audio = preloadAudioRef.current;
              preloadAudioRef.current = null;
          } else {
              audio = new Audio(url);
          }

          audio.playbackRate = playbackRate;
          
          let preloaded = false;
          audio.ontimeupdate = () => {
              if (nextUrl && !preloaded && audio.duration && (audio.duration - audio.currentTime < 1.5)) {
                  preloaded = true;
                  const nextAudio = new Audio(nextUrl);
                  nextAudio.preload = 'auto';
                  nextAudio.load();
                  preloadAudioRef.current = nextAudio;
              }
          };

          audio.onended = () => {
              if (audio.duration === 0 || isNaN(audio.duration)) {
                  showError('الملف الصوتي تالف أو غير متاح');
                  resetPlayState();
              }
              resolve();
          };

          audio.onerror = () => {
              console.warn(`[useAyahAudio] Audio error for ${url}`);
              resetPlayState();
              if (!navigator.onLine) {
                  showError('لا يوجد إنترنت، وهذا الملف غير محمل مسبقاً');
              } else {
                  showError('عذراً، تلاوة هذا القارئ غير متوفرة حالياً (خطأ في الرابط).');
              }
              resolve();
          };

          audioRef.current = audio;
          try {
              await audio.play();
          } catch (e) {
              console.log('[audio.play] failed or interrupted:', e);
              resetPlayState();
              
              if (!navigator.onLine) {
                  showError('لا يوجد إنترنت، وهذا الملف غير محمل مسبقاً');
              } else {
                  showError('عذراً، تلاوة هذا القارئ غير متوفرة حالياً (خطأ في الرابط).');
              }
              
              resolve();
          }
      };

      tryPlay();
    });
  }, [showError, resetPlayState]);



  const pauseAudio = useCallback(() => {
      if (audioRef.current && !audioRef.current.paused) {
          audioRef.current.pause();
          setIsPaused(true);
      }
  }, []);

  const resumeAudio = useCallback(() => {
      if (audioRef.current && audioRef.current.paused) {
          audioRef.current.play().catch(console.error);
          setIsPaused(false);
      }
  }, []);

  const stopAudio = useCallback(() => {
    isPlayingRef.current = false;
    setIsPlayingSeq(false);
    setIsPaused(false);
    setCurrentGlobalAyah(null);
    runtimeSettingsRef.current = null;
    if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.removeAttribute('src');
        audioRef.current.load();
        audioRef.current = null;
    }
    if (preloadAudioRef.current) {
        preloadAudioRef.current.pause();
        preloadAudioRef.current.removeAttribute('src');
        preloadAudioRef.current.load();
        preloadAudioRef.current = null;
    }
  }, []);

  const updateRuntimeSettings = useCallback((settings: PlayerSettings) => {
    runtimeSettingsRef.current = settings;
  }, []);

  const playSequence = useCallback(async (
      settings: PlayerSettings,
      onAyahChange?: (globalNum: number) => void
  ) => {
    if (isPlayingRef.current) return;
    
    isPlayingRef.current = true;
    setIsPlayingSeq(true);
    setIsPaused(false);
    runtimeSettingsRef.current = settings;

    let groupRep = 0;
    while (isPlayingRef.current && (settings.groupRepetitions === -1 || groupRep < settings.groupRepetitions)) {
        for (let current = settings.startGlobalAyah; isPlayingRef.current && current <= settings.endGlobalAyah; current++) {
            let ayahRep = 0;
            while (isPlayingRef.current && (settings.ayahRepetitions === -1 || ayahRep < settings.ayahRepetitions)) {
                setCurrentGlobalAyah(current);
                if (onAyahChange) onAyahChange(current);
                
                // Read live settings
                const liveSettings = runtimeSettingsRef.current || settings;
                
                let nextAyah: number | undefined;
                if (current < liveSettings.endGlobalAyah) {
                    nextAyah = current + 1;
                } else {
                    if (liveSettings.groupRepetitions === -1 || groupRep + 1 < liveSettings.groupRepetitions) {
                        nextAyah = liveSettings.startGlobalAyah;
                    }
                }

                await playAyahAudio(current, liveSettings.reciterId, liveSettings.playbackRate, nextAyah);
                ayahRep++;
            }
        }
        groupRep++;
    }
    
    setIsPlayingSeq(false);
    isPlayingRef.current = false;
    setIsPaused(false);
    setCurrentGlobalAyah(null);
    runtimeSettingsRef.current = null;
  }, [playAyahAudio]);

  const preCacheAudio = useCallback(async (ayahGlobalNumbers: number[], reciterID: string) => {
      // Use IndexedDB Blob Storage — works on mobile browsers
      for (const num of ayahGlobalNumbers) {
          const url = buildAudioUrl(reciterID, num);
          if (!url) continue;
          await cacheAudioBlob(url);
      }
  }, []);

  return { 
      playAyahAudio, 
      playSequence, 
      pauseAudio, 
      resumeAudio, 
      stopAudio, 
      updateRuntimeSettings,
      preCacheAudio, 
      isPlayingSeq, 
      isPaused,
      setIsPlayingSeq, 
      isPlayingRef, 
      currentGlobalAyah 
  };
}