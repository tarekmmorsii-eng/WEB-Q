# Comprehensive Project Documentation: Quran Memorizer App (X3 8app Q)

## Introduction
This document provides a technical overview of the "Quran Memorizer" application. It is designed for a Tech Lead taking over the project to understand the architecture, key features, and critical solutions implemented during development.

---

## 1. Tech Stack
The application is built using a modern, performance-oriented stack:

*   **Core Framework**: [React 19](https://react.dev/) with [Vite 6](https://vitejs.dev/) for fast development and optimized builds.
*   **Language**: [TypeScript](https://www.typescriptlang.org/) for type safety and improved developer experience.
*   **Styling**: [Tailwind CSS](https://tailwindcss.com/) for a utility-first, responsive UI design.
*   **Mobile Support**: [Capacitor](https://capacitorjs.com/) (targeting Android) to package the web app as a native mobile application.
*   **PWA & Offline**: [Vite-plugin-pwa](https://vite-pwa-org.netlify.app/) and [Workbox](https://developer.chrome.com/docs/workbox/) for Service Worker management and offline capabilities.
*   **Key Libraries**:
    *   `react-pageflip`: For the realistic Mushaf page-turning effect.
    *   `swiper`: Used for fluid transitions in various UI components.
    *   `lucide-react`: A comprehensive set of modern icons.
    *   `driver.js`: For interactive user tours and onboarding.

---

## 2. Folder Structure
The project follows a standard React organization, optimized for modularity:

*   `components/`: React components (UI elements, modals, Mushaf renderer).
*   `contexts/`: Global state management using React Context API (e.g., Settings, Feedback).
*   `services/`: Core business logic and API interactions (Quran data, Reciter mapping).
*   `hooks/`: Reusable custom hooks (e.g., `useOfflineManager`, `useWordByWordAudio`).
*   `utils/`: Helper functions and utility logic.
*   `constants/`: Static data (Surah info, Themes, Language translations).
*   `public/`: Static assets, fonts (KFGQPC V2), and the Service Worker (`sw.js`).
*   `android/`: Capacitor Android project files.

---

## 3. Audio Engine Architecture
The audio system is designed for a "Verse-by-Verse" experience, crucial for memorization and review.

### Verse-by-Verse Engine
*   **Logic**: Managed primarily in `FloatingAudioPlayer.tsx` and `reciterService.ts`.
*   **Playback**: Uses the HTML5 `Audio` API. Each verse (ayah) is fetched as an individual MP3 file.
*   **Sequencing**: The engine tracks the current verse and automatically progresses to the next one, handling page flips when necessary.
*   **Interaction**: Users can click on any verse to play it or long-press on a word for word-by-word audio (powered by `audio.qurancdn.com`).

### Caching & Offline Mode (Service Worker)
*   **Service Worker (`public/sw.js`)**: A custom implementation that gives full control over the caching lifecycle.
*   **Multi-Tier Caching**:
    *   **Core Cache**: Stores JS, CSS, and essential UI assets.
    *   **Font Cache**: Specifically for KFGQPC V2 page fonts (fetched dynamically page-by-page).
    *   **Audio Cache**: CORS-enabled caching for MP3 files to ensure offline playback.
*   **Batch Downloading**: The app includes an "Offline Mode" setup that downloads all 604 pages (JSON + Fonts) in concurrent batches to ensure the entire Mushaf is available without internet.

---

## 4. Robustness & Security (Crash Immunity)
Several defensive programming techniques were implemented to ensure the app's stability.

### Crash Immunity (Error Boundaries & try/catch)
*   **Defensive Logic**: Critical paths such as audio URL generation (`buildAudioUrl`) and data fetching are wrapped in `try/catch` blocks to prevent the entire app from crashing if a single resource is missing or a network error occurs.
*   **Service Worker Resilience**: The `fetchWithRetry` helper in `sw.js` ensures that temporary network glitches don't break the caching process.

### Prevention of "Blind Caching"
One of the most critical fixes was preventing the Service Worker from caching "Fake Data" (like 404 HTML error pages) as if they were valid audio or JSON files.
*   **Validation**: In `sw.js`, the fetch handler explicitly checks `response.ok` and the `Content-Type` header.
*   **Filter**: If a response has `status !== 200` or contains `text/html` when an audio/JSON file was expected, it is rejected and not stored in the cache.
*   **Self-Healing**: A manifest verification step runs after bulk downloads to check for missing or corrupt files and re-download them automatically.

---

## 5. Reciters Database
The application relies on high-quality, stable audio sources.

*   **Primary Server**: [EveryAyah.com](https://everyayah.com), known for its stable verse-by-verse library.
*   **Filtered Selection**: The database is filtered to include approximately **48 high-quality reciters**.
*   **Criteria**: Only reciters with complete Qurans and high-fidelity audio (typically 128kbps or 192kbps) were selected to ensure a premium user experience.
*   **Mapping**: Internal IDs are mapped to the specific directory structures on the EveryAyah server in `reciterService.ts`.

---

## 6. Unique & Premium Features
The app is tailored specifically for Hifz (memorization) and Muraja'ah (review).

*   **Review Mode (وضع المراجعة)**:
    *   Enables users to rate their memorization strength (Weak, Medium, Good) for each verse.
    *   Visual indicators (colored circles) appear around ayah separators to track progress.
*   **Word Masking (إخفاء الكلمات)**:
    *   A unique feature that allows users to hide words and reveal them one by one (or randomly) to test their memorization.
*   **Mutashabihat (المتشابهات)**:
    *   A dedicated system (`MutashabihatModal.tsx`) that alerts users to similar verses across the Quran.
    *   Includes visual underlines/indicators on the page to warn the reciter of potential confusion points.
*   **Arabic UI & RTL**:
    *   Full support for Arabic as the primary language, with a carefully crafted RTL layout that respects Quranic aesthetics.
*   **Advanced Mushaf Renderer**:
    *   Uses **KFGQPC V2** data, ensuring the exact script and line-breaks of the Madinah Mushaf.
    *   Dynamic font injection ensures high-performance rendering of page-specific glyphs.

---

**End of Documentation**  
*Prepared by Antigravity (Advanced AI Coding Assistant)*
