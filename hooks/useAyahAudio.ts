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
    return new Promise((resolve) => {
      // إيقاف أي صوت سابق
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.removeAttribute('src');
      }

      // 1. Determine which bitrate to try
      const cachedBitrate = reciterBestBitrate.current[reciterID];
      const bitratesToTry = cachedBitrate ? [cachedBitrate] : [128, 64];
      
      const tryPlay = (bitrateIndex: number) => {
          if (bitrateIndex >= bitratesToTry.length) {
              console.error(`All bitrates failed for reciter ${reciterID}`);
              resolve();
              return;
          }

          const currentBitrate = bitratesToTry[bitrateIndex];
          const url = `https://cdn.islamic.network/quran/audio/${currentBitrate}/${reciterID}/${globalAyahNumber}.mp3`;
          
          let audio: HTMLAudioElement;
          
          // Use preloaded audio if it matches
          if (preloadAudioRef.current && preloadAudioRef.current.src === url) {
              audio = preloadAudioRef.current;
              preloadAudioRef.current = null;
          } else {
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
              resolve();
          };

          audio.onerror = () => {
              console.warn(`Bitrate ${currentBitrate} failed for ${reciterID}, trying next...`);
              tryPlay(bitrateIndex + 1);
          };

          audioRef.current = audio;
          audio.play().catch((err) => {
              console.warn("Autoplay/Play failed, switching to next bitrate if possible...", err);
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
            
            onAyahChange(current);
            setCurrentGlobalAyah(current);
            
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
        for (const num of ayahGlobalNumbers) {
            const url = `https://cdn.islamic.network/quran/audio/${bitrate}/${reciterID}/${num}.mp3`;
            fetch(url, { mode: 'no-cors' }).then(res => {
                if (res.ok) cache.put(url, res);
            }).catch(() => {});
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
