# Tarteel Audio Implementation Guide

This document outlines the technical logic and code patterns used to implement the advanced Quran audio features. Use this as a reference for porting these features to other platforms.

## 1. Gapless Playback & Preloading Strategy

To ensure zero-second gaps between ayahs, use a look-ahead preloading mechanism.

### Preloading Logic
Monitor the `ontimeupdate` event of the current audio. Start fetching the next audio file approximately 1.5 - 2 seconds before the current one ends.

```javascript
// Inside the audio setup
audio.ontimeupdate = () => {
    // If the next ayah is known and not yet preloaded
    if (nextGlobalAyah && !preloaded && audio.duration) {
        const timeLeft = audio.duration - audio.currentTime;
        if (timeLeft < 1.5) {
            preloaded = true;
            preloadAudio(nextGlobalAyah, currentReciterId);
        }
    }
};
```

### Eliminating Loop Delays
When iterating through a sequence of ayahs, ensure no explicit `setTimeout` or `delay` exists between the resolution of the current audio's `onended` event and the initiation of the next.

```javascript
// Seamless sequence loop
for (let current = start; current <= end; current++) {
    // await the audio promise which resolves on 'ended'
    await playAyahAudio(current, reciterId);
    
    // CRITICAL: Do NOT add a delay (e.g., setTimeout(50ms)) here.
    // The playAyahAudio promise resolution is sufficient signal.
}
```

## 2. Dynamic UI Context Binding

The UI should reactively display the current surah and ayah number based on the audio engine's state.

### State Management
Expose a `currentGlobalAyah` state from your audio hook/service.

```typescript
// Example State Export
const [currentGlobalAyah, setCurrentGlobalAyah] = useState<number | null>(null);

// In the UI Component
const activeAyahNum = audioEngine.currentGlobalAyah;
const displayContext = useMemo(() => {
    if (!activeAyahNum) return defaultContext;
    const info = getAyahFromGlobal(activeAyahNum);
    return `${info.surahName} - آية ${info.ayahNumber}`;
}, [activeAyahNum]);
```

## 3. Focus Mode Persistence

When playback ends, do not force the UI to reappear if it was hidden. Respect the user's "Distraction-Free" state.

```typescript
// PREVIOUS (BAD) PATTERN:
useEffect(() => {
    if (playbackFinished) setShowUi(true); // Re-shows bars automatically
}, [playbackFinished]);

// RECOMMENDED PATTERN:
// Remove the auto-show trigger completely. Let the user use manual toggle (e.g., tap/click).
```

## 4. Single-Ayah Quick Play from Modals

To allow immediate playback from a context menu/modal, implement a dedicated range-playback handler.

### App Level Handler
```typescript
const handlePlaySingleAyah = (surah, ayah) => {
    audioEngine.stop(); // Stop any pending sequence
    
    // Configure player for a range of ONE ayah
    startPlayback({
        startSurah: surah,
        startAyah: ayah,
        endSurah: surah,
        endAyah: ayah,
        useRangeOnly: true
    });
    
    setShowPlayerBar(true); // Ensure controls are visible
};
```

## 5. Summary of Dependencies
- **State Source**: `currentGlobalAyah` (Source of truth for UI and highlighting).
- **Audio Events**: `onended` (Trigger next) and `ontimeupdate` (Trigger preload).
- **Navigation**: Use `scrollIntoView` centered when an ayah starts to keep it visible for the user.
