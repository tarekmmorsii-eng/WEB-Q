import { useState, useRef, useCallback } from 'react';
import { buildAudioUrl } from '../services/reciterService';


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

export function useAyahAudio({ onAudioError }: UseAyahAudioProps = {}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const preloadAudioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlayingSeq, setIsPlayingSeq] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const isPlayingRef = useRef(false);
  const [currentGlobalAyah, setCurrentGlobalAyah] = useState<number | null>(null);
  
  // New Ref to handle live-updatable settings during a sequence
  const runtimeSettingsRef = useRef<PlayerSettings | null>(null);
  
  // Cache discovered bitrate for each reciter (e.g. { "ar.alafasy": 128, "ar.hanirifai": 64 })
  const reciterBestBitrate = useRef<Record<string, number>>({});

  // تشغيل آية واحدة مخصصة (وإرجاع Promise للانتظار)
  const playAyahAudio = useCallback((globalAyahNumber: number, reciterID: string, playbackRate: number = 1.0, nextGlobalAyahNumber?: number): Promise<void> => {
    return new Promise(async (resolve) => {
      // إيقاف أي صوت سابق
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.removeAttribute('src');
      }

      // Build URL using Quran.com CDN (CORS-enabled: verses.quran.com)
      const url = buildAudioUrl(reciterID, globalAyahNumber);
      const nextUrl = nextGlobalAyahNumber ? buildAudioUrl(reciterID, nextGlobalAyahNumber) : null;

      // Helper to check if URL is in quran-audio-v2 cache
      const isUrlInCache = async (u: string) => {
        try {
          const cache = await caches.open('quran-audio-v2');
          const match = await cache.match(u);
          return !!match;
        } catch { return false; }
      };
      
      const tryPlay = async () => {
          const inCache = await isUrlInCache(url);

          if (!navigator.onLine && !inCache) {
              if (onAudioError) {
                  onAudioError('لا يوجد إنترنت، وهذا الملف غير محمل مسبقاً');
              } else {
                  window.dispatchEvent(new CustomEvent('showToast', { 
                      detail: { message: 'لا يوجد إنترنت، وهذا الملف غير محمل مسبقاً', type: 'error' } 
                  }));
              }
              setIsPlayingSeq(false);
              isPlayingRef.current = false;
              setIsPaused(false);
              resolve();
              return;
          }

          let audio: HTMLAudioElement;

          if (inCache) {
              audio = new Audio(url); // SW serves cached response
          } else {
              // Passive Caching: Fetch and cache in the background while playing online
              preCacheAudio([globalAyahNumber], reciterID).catch(() => {});
              
              if (preloadAudioRef.current && preloadAudioRef.current.src === url) {
                  audio = preloadAudioRef.current;
                  preloadAudioRef.current = null;
              } else {
                  audio = new Audio(url);
              }
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
              // User explicitly requested to halt on 0-byte (duration 0) cached files
              if (audio.duration === 0 || isNaN(audio.duration)) {
                  if (onAudioError) {
                      onAudioError('الملف الصوتي تالف أو غير متاح');
                  } else {
                      window.dispatchEvent(new CustomEvent('showToast', { 
                          detail: { message: 'الملف الصوتي تالف أو غير متاح', type: 'error' } 
                      }));
                  }
                  setIsPlayingSeq(false);
                  isPlayingRef.current = false;
                  setIsPaused(false);
              }
              resolve();
          };

          audio.onerror = () => {
              console.warn(`[useAyahAudio] Audio error for ${url}`);
              setIsPlayingSeq(false);
              isPlayingRef.current = false;
              setIsPaused(false);
              resolve();
          };

          audioRef.current = audio;
          try {
              await audio.play();
          } catch (e) {
              console.log('[audio.play] failed or interrupted:', e);
              // CRITICAL FIX: Stop highlighting and progression immediately if audio fails
              setIsPlayingSeq(false);
              isPlayingRef.current = false;
              setIsPaused(false);
              if (onAudioError) onAudioError('لا يوجد انترنت و هذا الملف غير محمل مسبقا');
              resolve();
          }
      };

      tryPlay();
    });
  }, []);



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
      // verses.quran.com supports CORS — we can use cors mode and store readable responses
      const audioCache = await caches.open('quran-audio-v2');

      for (const num of ayahGlobalNumbers) {
          const url = buildAudioUrl(reciterID, num);
          try {
              const existing = await audioCache.match(url);
              if (existing) continue;

              const response = await fetch(url, { mode: 'cors' });

              if (response.ok) {
                  // CORS success — store as fresh readable blob response
                  const blob = await response.blob();
                  const fresh = new Response(blob, {
                      status: 200,
                      headers: { 'Content-Type': 'audio/mpeg' }
                  });
                  await audioCache.put(url, fresh);
              } else {
                  // Fallback: store as-is (might be opaque for unknown reciters)
                  await audioCache.put(url, response.clone());
              }
          } catch (err) {
              console.error(`[preCacheAudio] ayah ${num}:`, err);
          }
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
