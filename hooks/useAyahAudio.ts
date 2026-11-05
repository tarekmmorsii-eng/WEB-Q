import { useState, useRef, useCallback, useEffect } from 'react';
import { buildAudioUrl } from '../services/reciterService';
import { cacheAudioBlob, getAudioBlob } from '../services/audioCacheService';
import { softenAudioEdges } from '../services/audioEdgeSmoothing';
import { Capacitor } from '@capacitor/core';
import { BufferedVerseAudio, prepareBufferedVerse, preparePitchPreservedVerse, primeVerseOutput } from '../services/bufferedVerseAudio';
type VerseAudio = HTMLAudioElement | BufferedVerseAudio;


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

// Preloading preserves duration; edge and signal-onset envelopes are applied in memory.
interface PreparedAudio {
    url: string;
    audio: VerseAudio;
    objectUrl?: string;
    fromNetwork: boolean;
    disconnect?: () => void;
}
interface PendingAudio {
    url: string;
    playbackRate: number;
    cancelled: boolean;
    controller: AbortController;
    prepared?: PreparedAudio;
    promise: Promise<PreparedAudio | null>;
}
function disposeAudio(prepared?: PreparedAudio | null) {
    if (!prepared) return;
    const { audio, objectUrl } = prepared;
    audio.onended = null;
    audio.onerror = null;
    audio.onplaying = null;
    audio.pause();
    audio.removeAttribute('src');
    audio.load();
    prepared.disconnect?.();
    if (objectUrl) URL.revokeObjectURL(objectUrl);
}
function cancelPreparation(pending: PendingAudio | null) {
    if (!pending) return;
    pending.cancelled = true;
    pending.controller.abort();
    disposeAudio(pending.prepared);
}
function prepareAudio(url: string, playbackRate: number): PendingAudio {
    const pending: PendingAudio = { url, playbackRate, cancelled: false, controller: new AbortController(), promise: Promise.resolve(null) };
    pending.promise = (async () => {
        const cachedBlob = await getAudioBlob(url).catch(() => null);
        if (pending.cancelled) return null;
        let blob = cachedBlob;
        // Process decoded samples, not timeupdate events/timers, so the 3 ms
        // envelope is accurate and remains present after pause/resume/repeat.
        // Keep only current + next prepared audio; never replace the raw cache.
        const timeout = setTimeout(() => pending.controller.abort(), 12000);
        try {
            if (!blob) {
                const response = await fetch(url, { signal: pending.controller.signal, mode: 'cors' });
                if (!response.ok) throw new Error(`Audio download failed: ${response.status}`);
                blob = await response.blob();
            }
            blob = await softenAudioEdges(blob, pending.controller.signal);
        } catch (error) {
            if (pending.cancelled) return null;
            // If decoding/CORS is unavailable, retain ordinary playback rather
            // than leaving a reading session silent. Original cache stays intact.
            console.warn('[useAyahAudio] Edge smoothing unavailable; using original audio', error);
        } finally {
            clearTimeout(timeout);
        }
        if (pending.cancelled) return null;
        if (blob && Capacitor.isNativePlatform()) {
            try {
                if (playbackRate !== 1) {
                    const media = preparePitchPreservedVerse(blob);
                    pending.prepared = { url, ...media, fromNetwork: !cachedBlob };
                    return pending.prepared;
                }
                const audio = await prepareBufferedVerse(blob);
                if (pending.cancelled) { audio.removeAttribute('src'); return null; }
                pending.prepared = { url, audio, fromNetwork: !cachedBlob };
                return pending.prepared;
            } catch { /* Retain ordinary playback if Web Audio decoding fails. */ }
        }
        const objectUrl = blob ? URL.createObjectURL(blob) : undefined;
        const audio = new Audio(objectUrl || url);
        pending.prepared = { url, audio, objectUrl, fromNetwork: !cachedBlob };
        audio.preservesPitch = true;
        audio.preload = 'auto';
        audio.load();
        return pending.prepared;
    })();
    return pending;
}

export function useAyahAudio({ onAudioError }: UseAyahAudioProps = {}) {
  const audioRef = useRef<VerseAudio | null>(null);
  const currentAudioRef = useRef<PreparedAudio | null>(null);
  const preloadRef = useRef<PendingAudio | null>(null);
  const loadingRef = useRef<PendingAudio | null>(null);
  const requestRef = useRef(0);
  const sequenceRef = useRef(0);
  const pausedRef = useRef(false);
  const [isPlayingSeq, setIsPlayingSeq] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const isPlayingRef = useRef(false);
  const [currentGlobalAyah, setCurrentGlobalAyah] = useState<number | null>(null);
  
  // New Ref to handle live-updatable settings during a sequence
  const runtimeSettingsRef = useRef<PlayerSettings | null>(null);

  // مرجع لتتبع دالة الحل النشطة لوعد تشغيل الآية، حتى نتمكن من حلها يدوياً عند الإيقاف
  const activeResolveRef = useRef<(() => void) | null>(null);

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

  const clearPreload = useCallback(() => {
    cancelPreparation(preloadRef.current);
    preloadRef.current = null;
  }, []);

  const playAyahAudio = useCallback((globalAyahNumber: number, reciterID: string, playbackRate: number = 1.0, nextGlobalAyahNumber?: number): Promise<void> => {
    if (Capacitor.isNativePlatform()) {
        try { primeVerseOutput(); } catch { /* HTML audio remains available. */ }
    }
    const request = ++requestRef.current;
    activeResolveRef.current?.();
    cancelPreparation(loadingRef.current);
    loadingRef.current = null;
    disposeAudio(currentAudioRef.current);
    currentAudioRef.current = null;
    audioRef.current = null;

    return new Promise(resolve => {
      const finish = () => {
        if (activeResolveRef.current === finish) activeResolveRef.current = null;
        resolve();
      };
      activeResolveRef.current = finish;
      const url = buildAudioUrl(reciterID, globalAyahNumber);
      const nextUrl = nextGlobalAyahNumber ? buildAudioUrl(reciterID, nextGlobalAyahNumber) : null;
      const fail = (error: unknown) => {
        if (request !== requestRef.current) return;
        console.warn('[useAyahAudio] Playback failed:', error);
        clearPreload();
        resetPlayState();
        showError('عذراً، تعذّر تشغيل التلاوة، تحقق من اتصالك بالإنترنت أو جرّب قارئاً آخر.');
        finish();
      };
      if (!url) {
        fail('Missing audio URL');
        return;
      }

      const run = async () => {
        // Match by source URL (reader AND ayah), and consume the prepared element
        // before another IndexedDB lookup. Cached and online playback share this path.
        let pending = preloadRef.current;
        preloadRef.current = null;
        if (!pending || pending.url !== url || (pending.playbackRate === 1) !== (playbackRate === 1) || pending.prepared?.audio.error) {
          cancelPreparation(pending);
          pending = prepareAudio(url, playbackRate);
        }
        loadingRef.current = pending;
        const prepared = await pending.promise;
        if (loadingRef.current === pending) loadingRef.current = null;
        if (!prepared || request !== requestRef.current) {
          disposeAudio(prepared);
          finish();
          return;
        }
        const audio = prepared.audio;
        currentAudioRef.current = prepared;
        audioRef.current = audio;
        audio.playbackRate = playbackRate;
        audio.onended = () => {
          if (request !== requestRef.current) return;
          if (!Number.isFinite(audio.duration) || audio.duration === 0) {
            fail('Invalid audio duration');
          } else {
            finish();
          }
        };
        audio.onerror = () => fail(audio.error);
        audio.onplaying = () => {
          if (request !== requestRef.current) return;
          audio.onplaying = null;
          // Start preparing as soon as playback begins, not in its last 1.5 s.
          // This also fetches a missing next ayah when the current one is cached.
          if (nextUrl) {
            clearPreload();
            const next = prepareAudio(nextUrl, runtimeSettingsRef.current?.playbackRate ?? playbackRate);
            preloadRef.current = next;
            void next.promise.catch(() => {
              if (preloadRef.current === next) clearPreload();
            });
          }
          if (prepared.fromNetwork) void cacheAudioBlob(url).catch(() => {});
        };
        if (!pausedRef.current) {
          try {
            await audio.play();
          } catch (error) {
            // A deliberate pause/stop may reject an in-flight play request.
            if (request === requestRef.current && !pausedRef.current) fail(error);
          }
        }
      };
      void run().catch(fail);
    });
  }, [clearPreload, showError, resetPlayState]);

  const pauseAudio = useCallback(() => {
    pausedRef.current = true;
    audioRef.current?.pause();
    setIsPaused(true);
  }, []);

  const resumeAudio = useCallback(() => {
    pausedRef.current = false;
    if (audioRef.current?.paused) audioRef.current.play().catch(console.error);
    setIsPaused(false);
  }, []);

  const stopAudio = useCallback(() => {
    ++requestRef.current;
    ++sequenceRef.current;
    activeResolveRef.current?.();
    activeResolveRef.current = null;
    cancelPreparation(loadingRef.current);
    loadingRef.current = null;
    clearPreload();
    disposeAudio(currentAudioRef.current);
    currentAudioRef.current = null;
    audioRef.current = null;
    pausedRef.current = false;
    isPlayingRef.current = false;
    setIsPlayingSeq(false);
    setIsPaused(false);
    setCurrentGlobalAyah(null);
    runtimeSettingsRef.current = null;
  }, [clearPreload]);

  useEffect(() => () => {
    ++requestRef.current;
    ++sequenceRef.current;
    isPlayingRef.current = false;
    activeResolveRef.current?.();
    cancelPreparation(loadingRef.current);
    clearPreload();
    disposeAudio(currentAudioRef.current);
  }, [clearPreload]);

  const updateRuntimeSettings = useCallback((partialSettings: Partial<PlayerSettings>) => {
    if (runtimeSettingsRef.current) {
      // دمج الإعدادات الجديدة مع الحالية بدلاً من الاستبدال
      runtimeSettingsRef.current = { ...runtimeSettingsRef.current, ...partialSettings };
    }
  }, []);

  const playSequence = useCallback(async (
      settings: PlayerSettings,
      onAyahChange?: (globalNum: number) => void
  ) => {
    if (isPlayingRef.current) return;
    
    const sequence = ++sequenceRef.current;
    pausedRef.current = false;
    isPlayingRef.current = true;
    setIsPlayingSeq(true);
    setIsPaused(false);
    runtimeSettingsRef.current = settings;

    let groupRep = 0;
    while (isPlayingRef.current && sequence === sequenceRef.current) {
        // قراءة الإعدادات الحية في كل دورة
        const liveGroupSettings = runtimeSettingsRef.current || settings;
        if (liveGroupSettings.groupRepetitions !== -1 && groupRep >= liveGroupSettings.groupRepetitions) break;

        for (let current = settings.startGlobalAyah; isPlayingRef.current && sequence === sequenceRef.current && current <= liveGroupSettings.endGlobalAyah; current++) {
            let ayahRep = 0;
            while (isPlayingRef.current && sequence === sequenceRef.current) {
                // قراءة إعدادات التكرار الحية في كل تكرار
                const liveSettings = runtimeSettingsRef.current || settings;
                if (liveSettings.ayahRepetitions !== -1 && ayahRep >= liveSettings.ayahRepetitions) break;

                setCurrentGlobalAyah(current);
                if (onAyahChange) onAyahChange(current);
                
                let nextAyah: number | undefined;
                if (liveSettings.ayahRepetitions === -1 || ayahRep + 1 < liveSettings.ayahRepetitions) {
                    nextAyah = current;
                } else if (current < liveSettings.endGlobalAyah) {
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
    
    if (sequence !== sequenceRef.current) return;
    clearPreload();
    disposeAudio(currentAudioRef.current);
    currentAudioRef.current = null;
    audioRef.current = null;
    setIsPlayingSeq(false);
    isPlayingRef.current = false;
    setIsPaused(false);
    setCurrentGlobalAyah(null);
    runtimeSettingsRef.current = null;
  }, [playAyahAudio, clearPreload]);

  const preCacheAudio = useCallback(async (
      ayahGlobalNumbers: number[],
      reciterID: string,
      onProgress?: (percent: number, message?: string) => void
  ) => {
      // Use IndexedDB Blob Storage — works on mobile browsers
      const total = ayahGlobalNumbers.length;
      let completed = 0;

      for (const num of ayahGlobalNumbers) {
          const url = buildAudioUrl(reciterID, num);
          if (!url) {
              completed++;
              continue;
          }
          await cacheAudioBlob(url);
          completed++;

          // إبلاغ التقدم
          if (onProgress) {
              const percent = Math.round((completed / total) * 100);
              onProgress(percent, `${completed} / ${total}`);
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
