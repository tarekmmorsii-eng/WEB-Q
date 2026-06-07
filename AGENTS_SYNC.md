# AGENTS_SYNC.md - Living Architecture Database

This document is the single source of truth and authoritative architecture database for the project. It maps the actual production implementation of the codebase and must be kept in sync with the codebase.

---

# Project Identity

* **Product Vision:** A highly reliable, pixel-perfect digital Mushaf that serves as a seamless companion for Quran memorizers. It combines a traditional, distraction-free reading experience with precise native scheduling for revisions.
* **Product Purpose:** To solve the problem of retention decay in Quran memorization by tracking page/surah retention levels and utilizing a high-priority native alarm system that prompts scheduled revisions.
* **Product Positioning:** A native-feeling mobile hybrid application (built with React and Capacitor) that behaves like an installed native application on Android, operating completely offline with custom font rendering and zero layout shifts.
* **Core User Personas:**
  * **The Systematic Memorizer (Muhafiz):** Requires visual tracking of memorization strength (weak, medium, strong) at the Ayah and Surah level, using text masking to test recall.
  * **The Daily Reviser:** Needs strict, high-priority notifications that ignore device standby limits to ensure revision schedules are maintained daily/weekly.
* **Primary Workflows:**
  * **Reading & Rating:** User slides pages, clicks/long-presses words for meanings, and toggles retention ratings (Good/Medium/Weak) on ayah separators.
  * **Revision Testing:** User hides words/verses based on their rating levels to test memorization, revealing them on click.
  * **Alarm Scheduling:** User configures custom target dates, times, and range parameters (e.g. Surahs or Juz) to receive loud native notifications that direct them back to the specific page.

---

# Tech Stack

Derived from [package.json](file:///c:/antigravity/X3%208app%20Q/package.json):

### Core & Framework
* **React:** `19.2.0` (with `@types/react` & `@types/react-dom` at `19.0.0`)
* **TypeScript:** `~5.8.2`
* **Vite:** `6.2.0` (Dev server command: `vite --host`, builds targeting `dist`)

### Native Wrapper & Plugins
* **Capacitor Core / CLI / Android:** `8.3.1`
* **Capacitor Local Notifications:** `8.0.2` (for scheduling native alarms)
* **Capacitor Push Notifications:** `8.0.4` (for FCM integration)
* **Capacitor Status Bar:** `8.0.2` (controls immersive fullscreen modes)
* **Capawesome Capacitor Badge:** `6.0.0` (controls app icon badges)
* **Capacitor Native Settings:** `8.1.0` (direct links to OS battery/alarm panels)

### UI & Styling Libraries
* **Swiper:** `12.0.3` (controls page-swipe gestures)
* **react-pageflip:** `2.0.3` (optional 3D book transition engine)
* **driver.js:** `1.4.0` (guided onboarding overlay tours)
* **lucide-react:** `0.554.0` (vector icons)
* **Tailwind CSS:** `3.4.18` (styling engine)
* **Autoprefixer / PostCSS:** `10.4.22` / `8.5.6`

### Data & Utilities
* **better-sqlite3 / sqlite3:** `12.5.0` / `5.1.7` (SQLite interfaces)
* **xlsx:** `0.18.5` (Excel mapping data imports)
* **unbzip2-stream:** `1.4.3`
* **clsx:** `2.1.1` (conditional styling concatenator)

---

# Version Compatibility Matrix

The verified configuration boundaries for building and running the hybrid native environment:

| Component | Target Version | Source / Key Reference |
| :--- | :--- | :--- |
| **Android Target SDK** | `34 / 35` (Android 14 / 15) | `android/variables.gradle` |
| **Android Minimum SDK** | `26` (Android 8.0) | `android/variables.gradle` |
| **Capacitor CLI / Core** | `8.3.1` | `package.json` |
| **Node.js Build Runtime**| `^20.0.0` | Build server environment standard |
| **React Core / DOM** | `19.2.0` | `package.json` |
| **TypeScript Compiler** | `~5.8.2` | `package.json` |

---

# Architecture

### Folder Structure
* `components/`: UI modules and modals (Settings, NotificationManager, QPCV2PageRenderer, AudioSettingsModal).
* `contexts/`: Context state scopes (`FeedbackContext.tsx`).
* `hooks/`: Custom state encapsulation hooks (`useAyahAudio.ts`, `useNotifications.ts`, `usePushNotifications.ts`, `useWakeLock.ts`, `useWordByWordAudio.ts`, `useOfflineManager.ts`).
* `services/`: Data fetch and DB services (`quranService.ts`, `reciterService.ts`, `translationStorageService.ts`, `audioCacheService.ts`).
* `utils/`: Data processing, calculators, and helpers (`db.ts`, `TourManager.ts`, `mutashabihatProcessor.ts`, `similarityCalculator.ts`, `translationMapper.ts`, `quranUtils.ts`).
* `i18n/`: Dictionary assets (`translations.ts`).

### Module Boundaries & Relationships
* **Rendering vs. Audio:** The rendering module ([QPCV2PageRenderer.tsx](file:///c:/antigravity/X3%208app%20Q/components/QPCV2PageRenderer.tsx)) displays text and highlights the playing verse. The audio hook ([useAyahAudio.ts](file:///c:/antigravity/X3%208app%20Q/hooks/useAyahAudio.ts)) controls native playback and triggers programmatic page changes on the renderer via `setCurrentPage` inside `App.tsx`.
* **State vs. Storage:** Global UI controls and bookmarks reside in [App.tsx](file:///c:/antigravity/X3%208app%20Q/App.tsx) state, synchronized to `localStorage` and `IndexedDB` (`db.ts` and `translationStorageService.ts`).

---

# High-Level Data Flow

```
User Interaction (Gestures, Clicks, Alarms)
       │
       ▼
    App.tsx  ◄─── (State Orchestrator & UI Contexts)
       │
       ├─────────────────────────┐
       ▼                         ▼
 Services Layer           QPCV2PageRenderer.tsx (Visual Assembly)
 (quranService / DB)             │
       │                         ├── FontFace API (Loads WOFF2 Page Fonts)
       └─── IndexedDB Caches     └── DOM Layout Engine (Locks 15-Line Grid)
                                 │
                                 ▼
                             Native Capacitor Layer
                             (LocalNotifications, StatusBar)
                                 │
                                 ▼
                             Android OS (Alarms, Battery Exemption)
```

---

# Feature Matrix

| Feature | Status | Owner | Risk | Tested |
| :--- | :--- | :--- | :--- | :--- |
| **QPC V2 Rendering** | Complete | [QPCV2PageRenderer.tsx](file:///c:/antigravity/X3%208app%20Q/components/QPCV2PageRenderer.tsx) | High | Yes |
| **Audio Playback** | Complete | [useAyahAudio.ts](file:///c:/antigravity/X3%208app%20Q/hooks/useAyahAudio.ts) | High | Yes |
| **Search Engine** | Complete | [SearchModal.tsx](file:///c:/antigravity/X3%208app%20Q/components/SearchModal.tsx) | Medium | Yes |
| **Alarms & Reminders** | Complete | [NotificationManager.tsx](file:///c:/antigravity/X3%208app%20Q/components/NotificationManager.tsx) | High | Yes |
| **Word Meaning Tooltip**| Complete | [WordMeaningTooltip.tsx](file:///c:/antigravity/X3%208app%20Q/components/WordMeaningTooltip.tsx) | Medium | Yes |
| **Assessment Masking** | Complete | [QPCV2PageRenderer.tsx](file:///c:/antigravity/X3%208app%20Q/components/QPCV2PageRenderer.tsx) | Medium | Yes |
| **Mutashabihat Index** | Beta | [MutashabihatModal.tsx](file:///c:/antigravity/X3%208app%20Q/components/MutashabihatModal.tsx) | Low | Partial |
| **Prayer Mode** | Complete | [App.tsx](file:///c:/antigravity/X3%208app%20Q/App.tsx) | Low | Yes |

---

# Offline Capability Matrix

Since the application is designed **Offline First**, all features must behave gracefully without connectivity:

| Feature | Works Offline | Description / Fallback behavior |
| :--- | :--- | :--- |
| **Core Reading** | **Yes** | Fully loaded from local assets and pre-fetched JSON layouts. |
| **Retention Ratings**| **Yes** | Saved immediately to `localStorage` sync targets. |
| **Word meanings** | **Yes** | Reads compiled meanings from local memory (`__ma3anyData`). |
| **Search Engine** | **Yes** | Executes completely client-side in Vite bundle via local indices. |
| **Streaming Audio** | **No** | Requires active network connection to fetch external MP3s. |
| **Cached Audio** | **Yes** | Loads cached files locally via directories check in `audioCacheService.ts`. |
| **Local Alarms** | **Yes** | Native reminders are scheduled and triggered completely by local OS clocks. |
| **Push notifications**| **No** | Requires remote Firebase server triggers to register incoming pushes. |

---

# Memorization Domain Rules

* **Retention Levels:** Retentions are tagged precisely as **Weak**, **Medium**, or **Strong**.
* **Permanence:** Ratings are stored per ayah, persisting indefinitely, and **never expire automatically**. Ratings can only be cleared or reset via explicit manual action by the user.
* **Test Masking:** The text masking engine filters rendering views strictly using active retention level ratings to selectively test user recall.

---

# Alarm Reliability Rules

* **Exact Scheduling:** Exact alarms are targeted using the Android permission (`SCHEDULE_EXACT_ALARM`).
* **Doze Mode wakeup:** Alarms are registered with the native `allowWhileIdle: true` parameter to bypass basic OS sleep restrictions.
* **Battery warnings:** Displaying guidelines and prompt overlays warning users to exempt the application from battery optimization is **mandatory** for proper background operation.
* **Reboot Survival:** All scheduled alarms are saved in persistent storage and are re-registered programmatically at native levels to survive device reboots.

---

# Rendering Invariants [CRITICAL]

* **Line Constraints:** Pages must render **exactly 15 lines** of Quranic text.
* **Wrapping & Substitution:** No line wrapping is permitted under any screen dimension. Glyph substitution is forbidden.
* **Page Layout Reflow:** Page layouts must never reflow. Dynamic font scaling is prohibited from altering the absolute placement or flow of lines on the screen.
* **Highlight Dimensions:** Interactive highlights and glow overlays (`.hl-ayah-overlay`) must be drawn absolutely and must never modify or shift target DOM node dimensions.

---

# Repository Health

Overview of complex code modules and hot hotspots:

### Architecture Hotspots (Complexity centers)
* **App.tsx** (Lines: 3663 | Risk: Very High) - Implements monolithic state properties, page swipe configurations, media handlers, and notification channels setups in a single file.
* **QPCV2PageRenderer.tsx** (Lines: 1833 | Risk: Very High) - Integrates coordinate processing, style injections, touch interactions, word-masking states, and tooltips layouts inside a single module.
* **NotificationManager.tsx** (Lines: 1694 | Risk: High) - Conflates scheduling models, native channel bindings, date-time calculation structures, and settings UI panels.

---

# Dependency Graph

Map of imports and architectural relationships inside the codebase:

```
App.tsx
├── hooks/
│   ├── useAyahAudio.ts
│   ├── useWakeLock.ts
│   ├── useNotifications.ts
│   ├── usePushNotifications.ts
│   └── useNotificationStore.ts
├── components/
│   ├── Header.tsx
│   ├── QPCV2PageRenderer.tsx
│   ├── SurahIndex.tsx
│   ├── SearchModal.tsx
│   ├── NotificationManager.tsx
│   ├── Settings.tsx
│   ├── AudioSettingsModal.tsx
│   └── [Other modals: MutashabihatModal, TourWelcomeModal, ColorPickerModal]
└── services/
    └── quranService.ts

QPCV2PageRenderer.tsx
├── hooks/
│   └── useWordByWordAudio.ts
├── services/
│   └── translationStorageService.ts
├── utils/
│   ├── db.ts
│   ├── mutashabihatProcessor.ts
│   └── translationMapper.ts
└── components/
    ├── SurahFrame.tsx
    ├── DecorativePageFrame.tsx
    └── WordMeaningTooltip.tsx

useAyahAudio.ts
├── services/
│   ├── reciterService.ts
│   └── audioCacheService.ts
└── utils/
    └── quranUtils.ts

NotificationManager.tsx
├── hooks/
│   └── usePushNotifications.ts
└── services/
    └── quranService.ts
```

---

# Public API Surface

### quranService.ts (Data Fetching Service)
* `fetchPage(pageNumber: number): Promise<PageData>`
* `getAyahPage(surahNumber: number, ayahNumber: number): Promise<number>`
* `getAyahPageSync(surahNumber: number, ayahNumber: number): number | null`
* `getPageAyahRange(surahNumber: number, pageNumber: number): Promise<{ start: number, end: number } | null>`
* `getSurahsForPages(startPage: number, endPage: number, language?: string): Promise<string>`
* `getJuzForPage(pageNumber: number): number`
* `getSurahStartPage(surahNumber: number): number`

### translationStorageService.ts (Translations DB Service)
* `saveTranslation(translation: StoredTranslation): Promise<void>`
* `getTranslation(languageCode: string): Promise<StoredTranslation | null>`
* `deleteTranslation(languageCode: string): Promise<void>`
* `getAllTranslations(): Promise<StoredTranslation[]>`
* `isTranslationStored(languageCode: string): Promise<boolean>`
* `downloadAndSaveTranslation(languageCode: string, languageName: string, url: string): Promise<StoredTranslation>`
* `saveWbwData(wbwData: StoredWbwData): Promise<void>`
* `getWbwData(languageCode: string): Promise<StoredWbwData | null>`
* `deleteWbwData(languageCode: string): Promise<void>`
* `isWbwDataStored(languageCode: string): Promise<boolean>`
* `getWbwWordMeaning(wbwData: any, surah: number, ayah: number, position: number): string | null`

### useAyahAudio.ts (Audio Sequence controller)
* `playAyahAudio(globalAyahNumber: number, reciterId: string, rate: number): Promise<void>`
* `playSequence(settings: AudioSequenceSettings, onAyahChange: (globalNum: number) => void): Promise<void>`
* `stopAudio(): void`
* `pauseAudio(): void`
* `resumeAudio(): void`
* `updateRuntimeSettings(settings: Partial<AudioRuntimeSettings>): void`
* State exports: `isPlayingSeq` (boolean), `isPaused` (boolean), `currentAyahIndex` (number)

### useWordByWordAudio.ts (Word-level Audio controller)
* `playWordAudio(surah: number, ayah: number, wordPos: number, reciterId: string): Promise<void>`
* `stopWordAudio(): void`
* State exports: `activeWord` (string | null)

### useNotifications.ts (In-app Notification Store wrapper)
* `notifications`: array of NotificationItems
* `unreadCount`: count of unread items
* `markAsRead(id: string): void`
* `markAllAsRead(): void`
* `deleteNotification(id: string): void`
* `clearAll(): void`
* `addNotification(item: Partial<NotificationItem>): void`
* `openModal(): void`

---

# Configuration Registry

Locations, parameters, and roles of the configuration modules:

* **`package.json`**
  * *Purpose:* Configures packages and build targets.
  * *Critical settings:* React 19 targets, Capacitor 8 plugins, Vite build paths.
  * *Risks when modified:* Incompatible build states, tool version mismatch.
* **`capacitor.config.ts`**
  * *Purpose:* Configures native platform channels and assets.
  * *Critical settings:* Native bundle Id (`com.mushafalmurajaa.app`), custom loop sound registration, high-priority notifications channel boundaries.
  * *Risks when modified:* Broken alarm channel initialization, failure to play native sound, splash screen dimensions distortions.
* **`vite.config.ts`**
  * *Purpose:* Vite compilation configuration.
  * *Critical settings:* React plugin integration, compiler optimizations.
  * *Risks when modified:* Build failure, package import breakdowns.
* **`tailwind.config.js`**
  * *Purpose:* Styles theme token config.
  * *Critical settings:* Color stops, font families (`UthmanicHafs`, `Almarai`).
  * *Risks when modified:* Visual corruption of page rendering components.
* **`tsconfig.json`**
  * *Purpose:* TypeScript configurations.
  * *Critical settings:* JSX compiler configurations, target definitions.
  * *Risks when modified:* Compilation crashes on TS files.
* **`android/app/src/main/AndroidManifest.xml`**
  * *Purpose:* Configures Android OS permissions.
  * *Critical settings:* Exact alarm permission definitions (`SCHEDULE_EXACT_ALARM`), background execution tags (`REQUEST_IGNORE_BATTERY_OPTIMIZATIONS`).
  * *Risks when modified:* Silent alarm schedules block, system termination of background operations.

---

# Storage Registry

Map of database keys, tables, and runtime caches:

## localStorage
* **`quran_app_settings`:** Serialized UI options (`AppSettings` object).
* **`quran_last_page`:** Current page index (1-604).
* **`custom_mutashabihat`:** User-defined associations for similar verses.
* **`selected_reciter_id`:** String ID of the active reciter.
* **`battery_opt_status`:** Prompts exemption flag.
* **`prayer_mode_migrated`:** Migration flag.

## IndexedDB
* **Database `MushafV2DB`** (Store `MushafV2Store`)
  * Schema: `{ key: 'main_data', value: Record<pageNumber, coordinateMaps> }`
* **Database `QuranTranslationsDB`** (Store `translations`)
  * Schema: `{ key: languageCode, value: StoredTranslation }`
* **Database `QuranTranslationsDB`** (Store `wbw_translations`)
  * Schema: `{ key: languageCode, value: StoredWbwData }`

## Runtime Memory
* **`(window as any).qpcV2Cache`:** In-memory dictionary containing layout definitions for pages retrieved during the session.
* **`(window as any).__ma3anyData`:** Key-value map holding raw Arabic meanings parsed at startup.
* **`fullQuranData` & `ayahsByPage`:** Cached structural array inside `quranService.ts` to prevent redundant parsing of `/quran.json`.
* **`alarmAudioRef`:** Holds the audio element representing the playing alarm trigger loop.

---

# Feature Ownership Map

Maps core software features to the implementing files:

* **Quran Rendering (QPC V2):**
  * [QPCV2PageRenderer.tsx](file:///c:/antigravity/X3%208app%20Q/components/QPCV2PageRenderer.tsx) (UI Rendering component)
  * [quranService.ts](file:///c:/antigravity/X3%208app%20Q/services/quranService.ts) (Coordinates index service)
  * [SurahFrame.tsx](file:///c:/antigravity/X3%208app%20Q/components/SurahFrame.tsx) & [Basmalah.tsx](file:///c:/antigravity/X3%208app%20Q/components/Basmalah.tsx) (Structural header boundaries)
* **Audio Playback:**
  * [useAyahAudio.ts](file:///c:/antigravity/X3%208app%20Q/hooks/useAyahAudio.ts) (Playback manager hook)
  * [audioCacheService.ts](file:///c:/antigravity/X3%208app%20Q/services/audioCacheService.ts) (Offline audio directories manager)
  * [AudioSettingsModal.tsx](file:///c:/antigravity/X3%208app%20Q/components/AudioSettingsModal.tsx) (Settings parameters GUI)
  * [FloatingAudioPlayer.tsx](file:///c:/antigravity/X3%208app%20Q/components/FloatingAudioPlayer.tsx) (Footer audio dashboard)
* **Notifications & Alarms:**
  * [NotificationManager.tsx](file:///c:/antigravity/X3%208app%20Q/components/NotificationManager.tsx) (Alarms configurator and exact alarms hook)
  * [useNotifications.ts](file:///c:/antigravity/X3%208app%20Q/hooks/useNotifications.ts) (Alert counts hook)
  * [usePushNotifications.ts](file:///c:/antigravity/X3%208app%20Q/hooks/usePushNotifications.ts) (External FCM coordinator)
* **Assessment & Masking:**
  * [QPCV2PageRenderer.tsx](file:///c:/antigravity/X3%208app%20Q/components/QPCV2PageRenderer.tsx) (Manages DOM masking logic and word visibility clicks)
  * [AyahOptionsModal.tsx](file:///c:/antigravity/X3%208app%20Q/components/AyahOptionsModal.tsx) (Individual ratings modifier)
* **Mutashabihat (Similar Verses):**
  * [mutashabihatProcessor.ts](file:///c:/antigravity/X3%208app%20Q/utils/mutashabihatProcessor.ts) (Data aggregation helper)
  * [similarityCalculator.ts](file:///c:/antigravity/X3%208app%20Q/utils/similarityCalculator.ts) (Calculates text similarity scores)
  * [MutashabihatModal.tsx](file:///c:/antigravity/X3%208app%20Q/components/MutashabihatModal.tsx) (Verse link modifier popup)

---

# Explicit Non Goals

What the application is **NOT** designed to achieve:
* **No Social Platform features:** No user feeds, community groups, or profiles.
* **No Live Chat / Tutoring:** No integration with real-time audio rooms or student-teacher slots.
* **No Quran Text Editing:** Users cannot modify the orthography of the letters or characters.
* **No Server Dependency for core reading:** Reading, rating, masking, and offline playback must never require a remote login.

---

# Business Rules

Fundamental constraints that govern the application:
* **Retention ratings permanence:** Retention ratings (Weak/Medium/Good) must never be purged or cleared automatically by updates.
* **Session Persistence:** The application must restore the user to their exact last-read page upon restart.
* **Immersive Precedence:** Focus/Prayer Mode automatically collapses settings panels and exits overlays.
* **Background Audio Continuity:** Audio streams must proceed uninterrupted during screen lock or when the application is minimized.
* **Offline First Policy:** All user data (notes, ratings, bookmarks) must be accessible and modifiable offline.

---

# Known Bugs

* **`BUG-001`**
  * *Description:* Highlight overlay coordinates occasionally drift out of alignment immediately following an orientation shift (Portrait to Landscape) on fast page rendering cycles.
  * *Status:* Open
  * *Priority:* Medium

---

# Testing

Testing framework and QA mechanisms:
* **Unit Tests:** Runs calculations testing coordinate maps lookups inside `quranService.ts`.
* **Integration Tests:** Verifies automatic page navigation transitions during audio playbacks.
* **Manual QA Guidelines:**
  * Validate Android exact alarms schedule firing under device Doze mode.
  * Check for WebView lag on swipe gestures.
  * Verify clean page loading and Amiri font fallbacks when offline.

---

# Performance Budgets

* **Cold Start latency:** `< 2 sec` (To first render page)
* **Page Turn latency:** `< 100 ms`
* **WebView memory footprint:** `< 300 MB`
* **Rendering Framerate:** `60 FPS` minimum
* **Audio sequence trigger delay:** `< 100 ms`

---

# Recovery Rules (Crash Recovery Strategy)

* **Font Loading Fail:** If the FontFace loading API fails, the application falls back immediately to Amiri/Uthmanic system fonts, preventing page blanking.
* **Translation DB Corruptions:** If IndexedDB transactions crash, the application bypasses the translations layer, operating with local Arabic Ma3any data caches.
* **Alarms Scheduling Fail:** If local notifications scheduling raises an OS warning, it registers a retry requests queue and launches native permission warning modals.

---

# Architecture Constraints

### Must Keep
* React Web codebase bundled with Capacitor native layer.
* Dynamic client-side vector page assembly (QPC V2).
* Local client-side caches (IndexedDB and localStorage).
* Full offline operational status.

### Forbidden
* Remote server authorization requirement for core features.
* React Native structural migration.
* Canvas-based or static image Quran rendering.
* Remote mandatory authentication requirements.

---

# Data Sources Registry (Detailed)

### Quran Sources
* **Primary Quran Dataset:**
  * *Location:* `/quran.json`
  * *Contains:* Surah Number, Ayah Number, Global Ayah Index, Page Number, Juz Number, Hizb Number.
  * *Used by:* `quranService.ts`, Search Engine, Audio Engine, Page Renderer.
* **QPC V2 Page Definitions:**
  * *Location:* `/data/v2/pages/${pageNumber}.json`
  * *Contains:* Line definitions, word coordinate lists, glyph code values, line types.
  * *Used by:* `QPCV2PageRenderer.tsx`.
* **Fonts:**
  * *Location:* `/fonts/v2/*.woff2` (filenames matching `p1.woff2` to `p604.woff2`)
  * *Purpose:* Page-specific custom Quran calligraphy vectors and glyph rendering.
* **Word Meanings Dataset:**
  * *Location:* `/data/new_ma3any_pos.json`
  * *Contains:* Mapping indices of word positions to Arabic meanings.
  * *Used by:* `WordMeaningTooltip.tsx`.

---

# Search Engine (Architecture)

### Search Types
* **Surah Search:** Search surahs by name (Arabic or English) via indexing from `quranService.ts`.
* **Ayah Search:** Jump to a specific ayah index using numerical search inputs.
* **Text Search:** Scans standard normalized Arabic text (stripping diacritics) to search Quran verses.
* **Page Search:** Jumps directly to any target page from 1 to 604.

### Index Source
Managed and indexed in-memory at launch inside [quranService.ts](file:///c:/antigravity/X3%208app%20Q/services/quranService.ts).

### Highlight Behavior
```
User selects result in SearchModal.tsx
  └── App.tsx sets currentPage and registers highlightedAyah
        └── QPCV2PageRenderer.tsx navigates to page
              └── requestAnimationFrame measures DOM coordinates
                    └── hl-ayah-overlay glow overlay drawn around target verse
```

---

# State Ownership Map (Architecture)

### App.tsx
Owns and coordinates:
* `currentPage` (Active read index)
* `highlightedAyah` (Active search hit selection)
* `settings` (Active settings config parameters)
* `isIndexOpen`, `isSearchOpen`, `isSettingsOpen` (Auxiliary overlay toggles)
* `prayerMode` (Focus layout parameter)
* `isFullscreen` (Native UI parameter)

### NotificationManager.tsx
Owns form wizard state variables:
* `formName`, `formType`, `formDays`, `formTargetDate`, `formTimes`
* `formIsAlarm`, `formSound`, `formCategory`, `formSurahNumber`
* Ranges: `formStartPage`, `formEndPage`, `formStartAyah`, `formEndAyah`

### QPCV2PageRenderer.tsx
Owns page interactions state variables:
* `pageData` (Adapted layout line object)
* `deviceType`, `orientation` (Screen dimensions details)
* `revealedIndices` (Unmasked words set)
* `randomMasks` (Random masked words set)
* `selectedWordMeaning` (Word meaning modal coordinates)

---

# State Management Strategy

* **Current Implementation:** Exclusively uses React Component States combined with global Context bindings (`FeedbackContext`) to manage session elements.
* **Future Direction:** Transition key domains (Audio, Navigation, Settings) into structured custom hooks keeping domain state namespaces clean.
* **Forbidden Architecture:** Redux or heavy global state libraries are strictly blocked to prevent bundle bloat and keep runtime processing lightweight.

---

# Asset Registry (Assets)

### Fonts
* Location: `/fonts/v2/`
* Count: 604 page-specific fonts (`p1.woff2` to `p604.woff2`), plus helper fonts like `KFGQPC_UthmaniHafs_08.ttf`, `ArbFONTS-DTHULUTH-II.ttf`, `almarai-bold.ttf`.
* Size: ~15MB total (approx. 20KB per page file).

### Audio
* Location: Local directories mapped in `audioCacheService.ts` or remote streaming directories.
* Reciters: Husary, Alafasy, Sudais, Minshawy, Abdul Basit, Shuraym, Ajamy, Maher Al-Muaiqly, Yaser Al-Dosari, Fares Abbad.

### Images
* Location: `/assets/` and `/public/`
* Images: `logo_splash.png`, `splash_bottom_icon.png`, frames, ratings markers.

### Android Resources
* Location: `android/app/src/main/res/`
* Contains: App drawables, launcher icons (mipmaps), and custom alarm raw audio tracks (`res/raw/islamic_song.mp3`).

---

# Error Handling Model (Detailed)

* **Page Loading Failure:** If fetching `pages/${pageNumber}.json` fails, the renderer catches the error, sets `error = true`, and prompts the user with a retry fallback or offline warnings.
* **Font Loading Failure:** If the woff2 dynamic font file fails to load, the FontFace API triggers a catch handler, allowing the text to fallback to local systems Amiri or Uthmanic fonts without crashing.
* **Translation Failure:** Fallback to cached translations saved inside IndexedDB. If none exist, the translation pane defaults to showing a fallback text block.
* **Audio Failure:** If streaming fails (`onAudioError` raised inside `useAyahAudio.ts`), the app cancels the sequence, triggers a warning Toast, and returns state to `playingAyahId = null`.

---

# Build & Release (System)

* **Development Run:**
  `npm run dev` (Runs local Vite host)
* **Production Build:**
  `npm run build` (Compiles assets to `/dist` bundle)
* **Capacitor Android Sync:**
  `npx cap sync android` (Synchronizes compiled web assets with Android native folder)
* **Capacitor Android Build:**
  `npx cap build android` (Triggers native Gradle APK compilation)

---

# AI Agent Context (Guidelines)

### Project Priorities
1. **Rendering Accuracy:** The 15-line Madinah Mushaf grid must never break or wrap text across margins.
2. **Memorization Experience:** Hiding and revealing masked words must feel responsive.
3. **Offline Capability:** Critical layouts and configurations must remain functional without web access.
4. **Alarm Reliability:** Scheduled alarms must trigger at the exact second, ignoring sleep states.
5. **UI Smoothness:** Gestures and transitions must maintain webview execution frame rates (60fps).

### Never Break
* The strict 15-line layout constraints.
* Playback synchronization and auto-scrolling of playing verses.
* Android `SCHEDULE_EXACT_ALARM` permissions logic.
* Highlighting calculations using repaint frames (`requestAnimationFrame`).

### High Risk Areas
* **App.tsx:** Coordinates entire application logic.
* **QPCV2PageRenderer.tsx:** Visual layout calculation coordinator.
* **NotificationManager.tsx:** Controls scheduling and notifications channels configs.

### Preferred Refactoring Direction
* Decouple states from `App.tsx` into dedicated hooks.
* Cleanup DOM head style tags after leaving pages.
* Replace unused SQLite dependencies.

---

# Architecture Hotspots (Hotspots)

### App.tsx
* *Lines:* 3663
* *Risk:* Very High
* *Problems:* Implements monolithic state properties, page swipe configurations, media handlers, and notification channels setups in a single file.

### QPCV2PageRenderer.tsx
* *Lines:* 1833
* *Risk:* Very High
* *Problems:* Integrates coordinate processing, style injections, touch interactions, word-masking states, and tooltips layouts inside a single module.

### NotificationManager.tsx
* *Lines:* 1694
* *Risk:* High
* *Problems:* Conflates scheduling models, native channel bindings, date-time calculation structures, and settings UI panels.

---

# Database Schemas (Legacy Definition)

### 1. Database `MushafV2DB` (v1)
Holds page coordinate models mapped to layout rows to speed up boot times.
* **Store `MushafV2Store`:**
  * Key: `'main_data'`
  * Value: Pre-compiled coordinates layout dictionary mapping `pageNumber` to lines and word definitions.

### 2. Database `QuranTranslationsDB` (v2)
Caches verse translation records and Word-by-Word data tables.
* **Store `translations`:**
  * KeyPath: `'languageCode'`
  * Index: `'languageName'`
  * Index: `'timestamp'`
  * Structure:
    ```typescript
    {
      languageCode: string;
      languageName: string;
      data: Record<string, string>; // Maps "surah:ayah" to translations
      timestamp: number;
      size?: number;
    }
    ```
* **Store `wbw_translations`:**
  * KeyPath: `'languageCode'`
  * Index: `'timestamp'`
  * Structure:
    ```typescript
    {
      languageCode: string;
      data: Record<string, Record<string, { translation: string, text: string }>>; // Maps "surah:ayah" -> "wordPosition" -> translations
      timestamp: number;
    }
    ```

---

# Event Flows

### Page Turn Flow
```
User Swipe Gesture / Index Navigation
  ├── Swiper component detects transition
  └── App.tsx invokes setCurrentPage(pageNumber)
        └── quranService fetches page definition from raw /quran.json or memory index
              └── QPCV2PageRenderer.tsx intercepts page change
                    ├── FontFace API fetches and loads p${pageNumber}.woff2
                    ├── CSS injects style mapping tag
                    └── Render components recalculate layout row bounds
```

### Audio Playback Flow
```
Play Sequence click
  └── App.tsx calls startPagePlayback()
        └── useAyahAudio.ts maps target surah/ayah to global index
              └── HTML5 Audio plays verse mp3
                    └──ended event caught
                          ├── useAyahAudio.ts increments verse index
                          ├── App.tsx programmatically navigates to target page if crossed
                          └── QPCV2PageRenderer.tsx measurements trigger requestAnimationFrame
                                └── hl-ayah-overlay glow overlay repainted around active verse
```

### Notification Flow
```
User schedules Alarm in UI
  └── NotificationManager.tsx captures alarm date/time selection
        └── LocalNotifications.schedule() registers strict timer in Android OS
              └── Device enters standby (Doze mode) -> system triggers high priority alarm
                    └── User taps notification -> App opens target page
                          └── App.tsx launches full-screen Alarm Overlay
                                └── Alarm audio loops (stops automatically after 59s)
```

### Search Flow
```
Search query input
  └── SearchModal.tsx executes text query filter
        └── User taps target search result card
              └── App.tsx updates currentPage & sets highlightedAyah state
                    └── QPCV2PageRenderer.tsx navigates to page
                          └── requestAnimationFrame draws hl-ayah-overlay around verse
```

---

# Critical Files Registry

### Tier 1 (Critical - Modifying breaks core application lifecycle)
* **[App.tsx](file:///c:/antigravity/X3%208app%20Q/App.tsx):** Coordinates global settings, Swiper states, audio player states, alarm lifecycle, and overlays.
  * *Risk:* Broken page turns, audio synchronization loss, state mismatches.
* **[QPCV2PageRenderer.tsx](file:///c:/antigravity/X3%208app%20Q/components/QPCV2PageRenderer.tsx):** Handles dynamic font sheets loading, layout alignment computations, word clicks, and masking operations.
  * *Risk:* Total text rendering failure, word-by-word tooltip crashes, layout rendering shifts.
* **[useAyahAudio.ts](file:///c:/antigravity/X3%208app%20Q/hooks/useAyahAudio.ts):** Controls the HTML5 Audio sequence loop and background playback actions.
  * *Risk:* Playback audio locks, failure to transition to next verse, screen wake lock failures.
* **[quranService.ts](file:///c:/antigravity/X3%208app%20Q/services/quranService.ts):** Caches and indexes raw structural definitions.
  * *Risk:* Total application load crash, page-to-ayah mapping failures.

### Tier 2 (High Importance - Modifying breaks specific sub-systems)
* **[NotificationManager.tsx](file:///c:/antigravity/X3%208app%20Q/components/NotificationManager.tsx):** Handles scheduling of native exact alarms.
  * *Risk:* Alarms not firing, Android permission crash, timezone calculation bugs.
* **[translationStorageService.ts](file:///c:/antigravity/X3%208app%20Q/services/translationStorageService.ts):** Interface to IndexedDB translation caches.
  * *Risk:* Offline translations fail to load, corrupt word meanings, data exceptions.
* **[index.css](file:///c:/antigravity/X3%208app%20Q/index.css):** Holds font sizes and page alignments rules for all screen dimensions.
  * *Risk:* Layout shifts, word clipping on small phone models.

### Tier 3 (Normal Importance - Modifying breaks non-critical settings)
* **[Settings.tsx](file:///c:/antigravity/X3%208app%20Q/components/Settings.tsx):** Config dashboard overlay UI.
* **[SurahIndex.tsx](file:///c:/antigravity/X3%208app%20Q/components/SurahIndex.tsx):** Navigation index.

---

# Agent Operating Rules

* **Before modifying the rendering pipeline:** Inspect [QPCV2PageRenderer.tsx](file:///c:/antigravity/X3%208app%20Q/components/QPCV2PageRenderer.tsx), [quranService.ts](file:///c:/antigravity/X3%208app%20Q/services/quranService.ts), and line clamps in [index.css](file:///c:/antigravity/X3%208app%20Q/index.css).
* **Before modifying playback parameters:** Inspect [useAyahAudio.ts](file:///c:/antigravity/X3%208app%20Q/hooks/useAyahAudio.ts) and [audioCacheService.ts](file:///c:/antigravity/X3%208app%20Q/services/audioCacheService.ts).
* **Before modifying database transactions:** Inspect [db.ts](file:///c:/antigravity/X3%208app%20Q/utils/db.ts) and [translationStorageService.ts](file:///c:/antigravity/X3%208app%20Q/services/translationStorageService.ts).
* **Before modifying notifications:** Inspect [NotificationManager.tsx](file:///c:/antigravity/X3%208app%20Q/components/NotificationManager.tsx), [useNotifications.ts](file:///c:/antigravity/X3%208app%20Q/hooks/useNotifications.ts), and native channels inside `capacitor.config.ts`.

---

# Architecture Decision Records (ADR)

### ADR-001: Use QPC V2 Dynamic Font rendering instead of Page Images
* **Date:** 2026-01-04
* **Status:** Accepted
* **Decision:** Load vector page fonts dynamically (`WOFF2` format) and draw pages client-side using character mapping arrays instead of loading pre-rendered page screenshot files.
* **Reason:** Reduces the bundle footprint from hundreds of Megabytes to just 15MB, while permitting word-level click detection, dynamic text masking, and native glow highlights.
* **Consequences:** Layout shift risks and font flicker during rapid page swipes. Mitigated by dynamic style inject triggers inside layout effects.

### ADR-002: Use IndexedDB for Translation caches
* **Date:** 2026-03-12
* **Status:** Accepted
* **Decision:** Utilize IndexedDB to store translation files and Word-by-Word data collections instead of using LocalStorage.
* **Reason:** LocalStorage is limited to a strict 5MB quota, which fails when storing translations for multiple languages. IndexedDB supports large database blocks.
* **Consequences:** All database actions are asynchronous. Requires loading indicators when fetching translations at launch.

### ADR-003: Build Native application using Capacitor Core
* **Date:** 2026-04-18
* **Status:** Accepted
* **Decision:** Package the web app code inside a Capacitor mobile shell instead of rewriting the user interface inside React Native.
* **Reason:** Ensures absolute reuse of CSS layout constraints and Swiper gesture navigation systems, which are difficult to duplicate in React Native layout panels.
* **Consequences:** Increases reliance on WebViews. Requires strict CSS optimization rules (Golden settings) to achieve native UI frame-rates.

---

# Security Architecture

### Trusted Boundaries
```
Device Storage Layer (localStorage / IndexedDB)
       ▲
       │ Read/Write sandbox limits
       ▼
 Application Layer (Vite bundle / React modules)
       ▲
       │ JS Native Bridge APIs
       ▼
 Capacitor Layer (Native Plugins execution wrapper)
       ▲
       │ Android OS Container boundary
       ▼
Android OS Sandbox (Hardware permissions / Exact Alarms)
```

### Threat Model
* **Data Corruption:** Interruption during write queries to IndexedDB databases. Mitigated by utilizing atomic transactions.
* **XSS Vectors:** Malicious input inside feedback fields or bookmarks. Mitigated by React escaping variables by default and sanitizing dynamic nodes.
* **Malicious Translation Files:** Untrusted static translation assets containing markup. Mitigated by strict text-only mapper extraction templates.
* **Alarm Abuse:** Intentional scheduling of duplicate alarms. Mitigated by automatic cancellation of old IDs before generating new schedules.
* **Storage Tampering:** Since the application runs client-side with no mandatory authentication, users can modify `localStorage` or IndexedDB tables directly. Mitigated by validating inputs inside state converters.

---

# Performance Architecture

### Memory Consumers
* **QPC Fonts:** Custom page fonts dynamically loaded using FontFace API.
* **Audio Cache:** In-memory buffers loaded by browser HTML5 Audio objects.
* **Translation Cache:** Parsed objects cached from IndexedDB translations.
* **Mutashabihat Cache:** Merged indices held in RAM (`actualMutashabihatData`).

### CPU Consumers
* Bounding box calculations inside layout effects for Unified Ayah Highlighting.
* Swiper transition calculations during rapid page slides.

### Cache Eviction Logic
* **RAM Caches:** Layout structures cache (`qpcV2Cache`) persists during session runtime.
* **Eviction Policies:** Future releases plan to adopt a Least Recently Used (LRU) eviction structure to auto-purge older style sheet font configurations and layout structures when system limits are met.

---

# Memory Reclamation Policy

To manage WebView execution environments over extended sessions:
* **Style Sheets Cleanup:** Target future builds to unmount unused `@font-face` elements from DOM header when page navigation boundaries exceed $\pm 5$ pages range.
* **Audio References:** Playback hooks explicitly call `pause()` and reset pointers (`src = ''` or null) on closing playback sessions to trigger browser garbage collection.

---

# SQLite Decisive Status

* **Status:** Legacy / Unused in browser client bundles.
* **Declared Dependencies:** `better-sqlite3` and `sqlite3` packages exist in package.json.
* **Removal Blockers:** Local data import and compilation scripts (`process_kfgqpc_data.mjs`, `apply_kfgqpc_data.mjs`, etc.) depend on SQLite to compile binary layout databases into JSON vectors.
* **Target Action:** Purge from production client config packages, keeping them restricted to offline devDependencies tools.

---

# Data Migration Strategy
* IndexedDB upgrades handled via `onupgradeneeded`.
* Settings migrations use default-value merging.

---

# Refactoring Roadmap

To mitigate the footprint of God Components:
* **Phase A:** Extract Settings management hooks from `App.tsx`.
* **Phase B:** Extract Swiper navigation controllers and page tracking out of the main layout.
* **Phase C:** Extract Audio playback loops and reciters sessions handlers into a dedicated hook.
* **Phase D:** Extract notification schedules and permissions hooks from `App.tsx`.

---

# Runtime Architecture (Boot Sequence)

```
Application Launch
  └── SplashScreen.tsx active (2.5s duration)
        └── App.tsx loads quran_app_settings from localStorage
              └── db.ts checks IndexedDB registers
                    └── quranService.ts parses /quran.json into memory
                          └── App.tsx loads current page data
                                └── QPCV2PageRenderer.tsx fetches page JSON & font
                                      └── useNotifications.ts checks unread notifications
                                            └── Screen paints & SplashScreen.tsx fades out (1.0s)
```

---

# Memory Architecture

* **Persistent Layer:** IndexedDB (`MushafV2DB` for layouts, `QuranTranslationsDB` for translations).
* **Semi-Persistent Layer:** LocalStorage (Visual configurations, rating markers, bookmarks).
* **Session Layer:** RAM Caches (`qpcV2Cache` layout objects, `__ma3anyData` meanings map).
* **Ephemeral Layer:** React local component states (Modal configurations, scroll coordinates, active tooltips).

---

# Real OEM Alarm Policy (Notification Constraint)

* **Best-Effort Exact Alarms:** Native alarm timers (`SCHEDULE_EXACT_ALARM` / `allowWhileIdle: true`) are scheduled on best-effort targets.
* **OEM Constraints:** Background wakeup timings remain ultimately subject to vendor-specific battery policies (especially Xiaomi, Oppo, Vivo, Huawei, and Samsung). App notifications might be delayed or suppressed unless the user manually registers the app as exempt from OS battery restrictions.

---

# Release Checklist

* [ ] **Alarm Test:** Verify local notifications and alarms trigger exactly as scheduled.
* [ ] **Audio Test:** Confirm sequence transitions, repeats, and rate modifiers behave correctly.
* [ ] **Font Test:** Inspect pages for calligraphy loading and check that no fallback flashes occur.
* [ ] **Offline Test:** Verify reading, ratings, and translations load without active connections.
* [ ] **Android Doze Test:** Verify alarm alerts ignore battery optimizations limitations.
* [ ] **RTL Test:** Verify Arabic texts align from Right-to-Left throughout UI overlays.
* [ ] **Translation Test:** Check downloads of foreign translations tables.

---

# Observability

* **Error Logging:** System issues and exceptions write alerts to standard warning prompts and native `console.error` logs.
* **Crash Recovery:** Critical components capture rendering exceptions and fall back to displaying warning views.
* **Performance Monitoring:** Measuring layout times and page turn speeds during automation testing steps.
* **Diagnostic Mode:** Detailed warning indicators in development versions to monitor IndexedDB actions.

---

# Architecture Debt Registry

* **`CRITICAL-DEBT-001`**
  * *Description:* `App.tsx` violates the Single Responsibility Principle, containing over 3,660 lines of mixed settings, swipe layout indicators, audio listeners, and notification triggers.
  * *Priority:* Critical
  * *Target Action:* Extract settings hooks and navigation controllers to reduce size below 1,000 lines.

---

# Changelog

### [2026-06-07]
* **Added:** Restructured living architecture database (`AGENTS_SYNC.md`) containing dynamic schema registry definitions, search engine layouts, state ownership matrices, hotspots, roadmap features, testing frameworks, and business boundaries.
* **Refactored:** Modified `PROJECT_RULES.md` to add RTL guidelines for chat communication.
* **Fixed:** Synchronized all code configurations, dependencies, and rules directly with the current codebase implementation.
