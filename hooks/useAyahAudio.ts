import { useState, useRef, useCallback } from 'react';

export interface PlayerSettings {
    startGlobalAyah: number;
    endGlobalAyah: number;
    reciterId: string;
    groupRepetitions: number; // -1 for infinity
    ayahRepetitions: number;  // -1 for infinity
    playbackRate: number;
}

export function useAyahAudio() {
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

      // 1. Determine which bitrate to try
      const cachedBitrate = reciterBestBitrate.current[reciterID];
      const bitratesToTry = cachedBitrate ? [cachedBitrate] : [128, 64];

      // Helper to check if a URL is in Cache API
      const isUrlInCache = async (url: string) => {
        try {
          const cache = await caches.open('quran-audio-v2');
          const match = await cache.match(url);
          return !!match;
        } catch (e) { return false; }
      };
      
      const tryPlay = async (bitrateIndex: number) => {
          if (bitrateIndex >= bitratesToTry.length) {
              console.error(`All bitrates failed for reciter ${reciterID}`);
              resolve();
              return;
          }

          const currentBitrate = bitratesToTry[bitrateIndex];
          const url = `https://cdn.islamic.network/quran/audio/${currentBitrate}/${reciterID}/${globalAyahNumber}.mp3`;
          
          // Smart Check: Offline + Not in Cache
          let cachedResponse: Response | undefined;
          try {
              const cache = await caches.open('quran-audio-v2');
              cachedResponse = await cache.match(url);
          } catch (e) { /* ignore */ }

          const inCache = !!cachedResponse;

          if (!navigator.onLine && !inCache) {
              // Dispatch event for App.tsx to show a toast
              window.dispatchEvent(new CustomEvent('showToast', { 
                  detail: { message: 'لا يوجد إنترنت وهذا الملف غير محمل مسبقاً', type: 'error' } 
              }));
              resolve();
              return;
          }

          let audio: HTMLAudioElement;
          let objectUrl: string | null = null;

          if (inCache && cachedResponse) {
              // Priority 1: Play from Cache (100% Offline Priority)
              const blob = await cachedResponse.blob();
              objectUrl = URL.createObjectURL(blob);
              audio = new Audio(objectUrl);
          } else if (preloadAudioRef.current && preloadAudioRef.current.src === url) {
              // Priority 2: Use preloaded audio
              audio = preloadAudioRef.current;
              preloadAudioRef.current = null;
          } else {
              // Priority 3: Fetch from Network
              audio = new Audio(url);
          }
          
          audio.playbackRate = playbackRate;
          
          let preloaded = false;
          audio.ontimeupdate = () => {
              // Gapless Strategy: Preload the next audio file 1.5 seconds before this one ends
              if (nextGlobalAyahNumber && !preloaded && audio.duration && (audio.duration - audio.currentTime < 1.5)) {
                  preloaded = true;
                  // Use the same bitrate for next ayah
                  const nextUrl = `https://cdn.islamic.network/quran/audio/${currentBitrate}/${reciterID}/${nextGlobalAyahNumber}.mp3`;
                  const nextAudio = new Audio(nextUrl);
                  nextAudio.preload = "auto";
                  nextAudio.load();
                  preloadAudioRef.current = nextAudio;
              }
          };

          audio.onended = () => {
              // Success! Remember this bitrate for next time
              reciterBestBitrate.current[reciterID] = currentBitrate;
              if (objectUrl) URL.revokeObjectURL(objectUrl); // Clean up
              resolve();
          };

          audio.onerror = () => {
              console.warn(`Bitrate ${currentBitrate} failed for ${reciterID}, trying next...`);
              if (objectUrl) URL.revokeObjectURL(objectUrl); // Clean up
              tryPlay(bitrateIndex + 1);
          };

          audioRef.current = audio;
          audio.play().catch((err) => {
              console.warn("Autoplay/Play failed, switching to next bitrate if possible...", err);
              if (objectUrl) URL.revokeObjectURL(objectUrl); // Clean up
              tryPlay(bitrateIndex + 1);
          });
      };

      tryPlay(0);
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
        audioRef.current = null;
    }
    if (preloadAudioRef.current) {
        preloadAudioRef.current.removeAttribute('src');
        preloadAudioRef.current = null;
    }
  }, []);

  const updateRuntimeSettings = useCallback((settings: Partial<PlayerSettings>) => {
      if (runtimeSettingsRef.current) {
          runtimeSettingsRef.current = { ...runtimeSettingsRef.current, ...settings };
          // Apply playback rate immediately if audio is playing
          if (audioRef.current && settings.playbackRate !== undefined) {
              audioRef.current.playbackRate = settings.playbackRate;
          }
      }
  }, []);

  const playSequence = useCallback(async (
      settings: PlayerSettings,
      onAyahChange: (globalNum: number) => void
  ) => {
    setIsPlayingSeq(true);
    setIsPaused(false);
    isPlayingRef.current = true;
    runtimeSettingsRef.current = { ...settings };
    
    let groupRep = 0;
    while (isPlayingRef.current) {
        // Use Ref for dynamic repetition count
        const currentSettings = runtimeSettingsRef.current || settings;
        if (currentSettings.groupRepetitions !== -1 && groupRep >= currentSettings.groupRepetitions) break;

        for (let current = currentSettings.startGlobalAyah; current <= currentSettings.endGlobalAyah; current++) {
            if (!isPlayingRef.current) break;
            
            // Smart Highlighting Logic: Check if available before highlighting
            const currentBitrate = reciterBestBitrate.current[currentSettings.reciterId] || 64;
            const url = `https://cdn.islamic.network/quran/audio/${currentBitrate}/${currentSettings.reciterId}/${current}.mp3`;
            
            const checkAvailability = async () => {
                if (navigator.onLine) return true;
                try {
                    const cache = await caches.open('quran-audio-v2');
                    const match = await cache.match(url);
                    return !!match;
                } catch (e) { return false; }
            };

            const isAvailable = await checkAvailability();
            
            if (isAvailable) {
                onAyahChange(current);
                setCurrentGlobalAyah(current);
            }
            
            let ayahRep = 0;
            while (isPlayingRef.current) {
                const liveSettings = runtimeSettingsRef.current || settings;
                if (liveSettings.ayahRepetitions !== -1 && ayahRep >= liveSettings.ayahRepetitions) break;

                let nextAyah: number | undefined = undefined;
                if (liveSettings.ayahRepetitions === -1 || ayahRep === liveSettings.ayahRepetitions - 1) {
                    if (current < liveSettings.endGlobalAyah) {
                        nextAyah = current + 1;
                    } else if (liveSettings.groupRepetitions === -1 || groupRep < liveSettings.groupRepetitions - 1) {
                        nextAyah = liveSettings.startGlobalAyah;
                    }
                } else {
                    nextAyah = current;
                }

                await playAyahAudio(current, liveSettings.reciterId, liveSettings.playbackRate, nextAyah);
                // If it skipped (offline + not in cache), we should break the repetition loop for this ayah
                if (!navigator.onLine && !isAvailable) break;
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
      try {
        const cache = await caches.open('quran-audio-v2');
        const bitrate = reciterBestBitrate.current[reciterID] || 64; // Default to 64 for pre-caching safety
        
        const BATCH_SIZE = 10;
        for (let i = 0; i < ayahGlobalNumbers.length; i += BATCH_SIZE) {
            const batch = ayahGlobalNumbers.slice(i, i + BATCH_SIZE);
            const promises = batch.map(async (num) => {
                const url = `https://cdn.islamic.network/quran/audio/${bitrate}/${reciterID}/${num}.mp3`;
                try {
                    const response = await caches.match(url);
                    if (!response) {
                        const fetchResponse = await fetch(url, { mode: 'no-cors' });
                        if (fetchResponse.type === 'opaque' || fetchResponse.ok) {
                            await cache.put(url, fetchResponse);
                        }
                    }
                } catch (err) {
                    console.error(`Failed to cache audio: ${url}`, err);
                }
            });
            await Promise.all(promises);
        }
      } catch (e) {
          console.error("Caching failed: ", e);
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
