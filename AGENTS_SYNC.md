# AGENTS_SYNC.md - Living Architecture Database

This document is the single source of truth and authoritative architecture database for the project. It maps the actual production implementation of the codebase and must be kept in sync with the codebase.

---

# FULL_UI_DISCOVERY_PROTOCOL

When auditing the project:

Do not document only features.

Document every visible UI element including:
* Screens
* Modals
* Drawers
* Sheets
* Tabs
* Cards
* Charts
* Progress Bars
* Forms
* Buttons
* Dropdowns
* Menus
* Tooltips
* Floating Actions
* Hidden Developer Screens
* Experimental Screens

Every discovered UI must be added to:
1. COMPLETE_SCREEN_REGISTRY
2. MODAL_REGISTRY
3. UI_COMPONENT_REGISTRY
4. NAVIGATION_GRAPH

No visible interface may remain undocumented.

---

# Project Identity & Product Domain

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

# Reverse Engineering Audit Directive (Auditor Protocol)

This section documents the explicit instructions that govern the maintenance and audit verification of `AGENTS_SYNC.md`. Any agent modifying this file must adhere strictly to these rules:

* **Role:** Act as a Principal Software Architect and Reverse Engineering Auditor.
* **No Speculation:** Only document what already exists in the production code. Do not assume features or suggest future ideas.
* **Feature Metadata Format:** Every discovered feature must be mapped using these exact 12 indicators:
  1. Feature Name
  2. Current Status
  3. Main Owner File
  4. Supporting Files
  5. User Entry Point
  6. User Flow
  7. Business Rules
  8. Stored Data
  9. Dependencies
  10. Offline Support
  11. Risks
  12. Missing Documentation Status

---

# COMPLETE_SCREEN_REGISTRY

### 1. Main Reading Canvas
* **Screen Name:** Main Reading Canvas
* **Owner File:** [App.tsx](file:///c:/antigravity/X3%208app%20Q/App.tsx) & [QPCV2PageRenderer.tsx](file:///c:/antigravity/X3%208app%20Q/components/QPCV2PageRenderer.tsx)
* **Purpose:** The primary Mushaf view for reading, navigation, and rating.
* **Sections:**
  * **Top Header Navbar:** Displays the sliding side menu drawer toggle, active page details, active Surah title banner, and toggles for full screen/settings indicators.
  * **Central Mushaf Layout:** Swiper container locking a 15-line grid view. Displays decorative frames, Surah titles headers, Basmalah banners, and ayah separator circles with rating status highlights.
  * **Footer Action Bar:** Houses shortcuts for Index navigation, Search overlay, local Alarms creator wizard, settings, and full focus mode toggles.
  * **Floating Audio Player:** Collapsible audio panel displaying progress sliders, play/pause controls, repeating loops selectors, speed multipliers, and option triggers.
* **Visible UI Elements:** 15-line text canvas, ayah separators, borders.
* **Buttons:** Menu icon, search icon, bell alarm icon, settings cog, bookmark flag, prayer mode toggle, exit fullscreen icon, play/pause.
* **Dropdowns:** None.
* **Cards:** WordMeaningTooltip card rendering on click.
* **Charts:** None.
* **Inputs:** Swipe touch gestures (page transitions), double-taps (triggers single word audio playbacks).
* **Business Logic:** Implements exactly 15 lines of calligraphy layout. Renders dynamic styling tags containing WOFF2 coordinates mapping. Tracks active ayah offsets during sequences playbacks.
* **Connected Features:** Visual Page Coordinate Renderer, Ayah audio sequences, masking assessments.
* **Stored Data:** `localStorage.quran_last_page` index, `localStorage.quran_app_settings` configs.
* **Navigation Targets:** FloatingSideMenu drawer, SearchModal, Settings, SurahIndex, AyahOptionsModal.

### 2. Startup Splash Screen
* **Screen Name:** Startup Splash Screen
* **Owner File:** [SplashScreen.tsx](file:///c:/antigravity/X3%208app%20Q/components/SplashScreen.tsx)
* **Purpose:** Initial onboarding entry view during app boot.
* **Sections:**
  * **Centered Logo Branding:** Displays Mushaf Al-Murajaa Arabic logo icon.
  * **Loading Indicator:** Loader spinner or text.
  * **Footer Credits:** Platform version and copyright info.
* **Visible UI Elements:** mushafalmurajaa icon logo, platform credits labels.
* **Buttons:** None.
* **Dropdowns:** None.
* **Cards:** None.
* **Charts:** None.
* **Inputs:** None.
* **Business Logic:** Stays visible for 2.5s while loading IndexedDB database maps and configurations. Triggers onFinish callbacks.
* **Connected Features:** Startup boot lifecycle.
* **Stored Data:** None.
* **Navigation Targets:** Main Reading Canvas.

### 3. Profile & Tools Navigation Drawer
* **Screen Name:** Profile & Tools Navigation Drawer
* **Owner File:** [FloatingSideMenu.tsx](file:///c:/antigravity/X3%208app%20Q/components/FloatingSideMenu.tsx)
* **Purpose:** Left-side or right-side sliding navigation hub.
* **Sections:**
  * **Drawer Header:** Displays app logo and title.
  * **Tools Directory List:** Scrollable list containing: Surah Index, Alarm Scheduler, Memorization Stats, Target Calculator, Audio Offline Downloader, Help Tutorial, Social share, Language Selector, and feedback options.
* **Visible UI Elements:** Header app icon, listings rows, unread notifications counts badge.
* **Buttons:** Close button, Index, Calculator, Statistics, Downloader, Help, Language, Share, Feedback.
* **Dropdowns:** None.
* **Cards:** None.
* **Charts:** None.
* **Inputs:** None.
* **Connected Features:** Navigation overlays.
* **Stored Data:** None.
* **Navigation Targets:** SurahIndex, NotificationManager, MemorizationStats, VerseCalculatorModal, AudioDownloadModal, HelpModal, SocialShareModal, LanguageSelection, FeedbackModal.

### 4. Memorization Strength Statistics
* **Screen Name:** Memorization Strength Statistics
* **Owner File:** [MemorizationStats.tsx](file:///c:/antigravity/X3%208app%20Q/components/MemorizationStats.tsx)
* **Purpose:** Analyzes and visualizes user's memorization strength progress.
* **Sections:**
  * **Header Panel:** Displays logo, statistics title, and close button.
  * **Clear Ratings Panel:** Warning block containing the "Clear All Ratings" trash button to reset stats.
  * **Surahs Progress List:** Scrollable list of all 114 Surahs showing Surah name, verse counts, stats badges pill, and progress segments.
  * **Legend Panel:** Explains color indicators definitions.
  * **Clear Confirmation Modal Overlay:** Dialog double-checking ratings purges.
* **Visible UI Elements:** Global strength summary indicators, stats badges count pills, progress bars, legend items.
* **Metrics:**
  * Good (Strong/Excellent) Count: Verses rated as good.
  * Medium Count: Verses rated as medium.
  * Weak Count: Verses rated as weak.
  * Unrated Count: Total Surah verses minus rated verses.
* **Charts:**
  * Color Progress Bars: Segmented bar charts visual representation.
* **Color Rules:**
  * Green = Good (Excellent/Strong)
  * Yellow = Medium
  * Red = Weak
  * Gray/Transparent = Unrated
* **Data Sources:** `ratings` array (passed from App global state, stored in `localStorage`).
* **Calculations:**
  * `unrated = surah.ayahCount - (weak + medium + good)`
  * Segment percentage = `(count / surah.ayahCount) * 100` (computed per level to scale colored progress segments).
* **User Actions:**
  * Click Surah Card title: Closes statistics drawer and navigates book canvas to the beginning page of that Surah.
  * Click Stats Pill or Progress Bar: Opens the rating unifier modal for the clicked Surah.
  * Click Clear All ratings button: Opens confirmation overlay dialog.
  * Click Confirm Clear: Purges all ratings and closes modal.
* **Connected Features:** Ayah Options Modal, Surah Rating Modal.
* **Stored Data:** localStorage ratings array.
* **Navigation Targets:** None (closes statistics modal).

---

# MODAL_REGISTRY

### 1. Target Revision Calculator Modal
* **Modal:** Target Revision Calculator Modal
* **Owner File:** [VerseCalculatorModal.tsx](file:///c:/antigravity/X3%208app%20Q/components/VerseCalculatorModal.tsx)
* **Opened From:** [FloatingSideMenu.tsx](file:///c:/antigravity/X3%208app%20Q/components/FloatingSideMenu.tsx) (Tools Drawer)
* **Purpose:** Calculates total verses in a selected range or structural section, displaying memorization statistics for that selection.
* **Sections:**
  * **Header:** Title, Calculator icon, and close button.
  * **Mode Toggle Slider:** Toggles range select mode vs. structural boundary mode.
  * **Structure Selectors (when in structure mode):** Type dropdown (Juzu, Hizb, Rub) and Index dropdown (1-30, 1-60, 1-240).
  * **Range Selectors (when in range mode):** Start Surah/Ayah dropdowns, End Surah/Ayah dropdowns.
  * **Result Display Card:** Colored block displaying total calculated count or validation error warnings.
  * **Memorization Stats Panel:** Distribution progress bar (Green/Yellow/Red) and counts summary grid (Good, Medium, Weak, Unrated).
* **Inputs:**
  * Start Surah (dropdown number / Arabic or English title).
  * Start Ayah (dropdown number).
  * End Surah (dropdown number).
  * End Ayah (dropdown number).
  * Mode (`range` vs. `structure`).
  * Structure Type (`juz` | `hizb` | `rub`).
  * Structure Index (number).
* **Outputs:**
  * Total Ayah Count inside the selected boundary.
  * Segmented progress bar (Green/Yellow/Red).
  * Detailed count grid items.
* **Data Sources:**
  * `memorizationRatings` array (passed from App global state, stored in localStorage).
  * `SURAHS` constant structure (surah names, index offsets, and verse counts).
  * `JUZ_BOUNDARIES`, `HIZB_BOUNDARIES`, `RUB_BOUNDARIES` constants (precise structural boundaries).
* **Calculations:**
  * Total Ayah Count:
    * Same Surah: `endAyah - startAyah + 1`.
    * Different Surah: First surah remaining verses (`ayahCount - startAyah + 1`) + full intermediate surahs' verse counts + last surah's end verse number.
  * Stats Distribution (looping through all verses inside the range):
    * Generates `ayahId = "${surah}-${ayah}"` keys.
    * Matches keys against `memorizationRatings` map to count `good`, `medium`, and `weak`.
    * Calculates `unrated = totalCount - totalRated`.
* **Validation Rules:**
  * Range boundaries must resolve to a positive count.
  * End Surah selection list only displays options starting from the selected Start Surah to avoid inverted ranges.
  * Auto-correct: Changing start Surah to a value larger than end Surah automatically updates end Surah to match start Surah.
  * `safetyCounter` limit = 7000 verses maximum to prevent infinite loops during range calculations.

### 2. Surah Index Modal
* **Modal:** Surah Index Modal
* **Owner File:** [SurahIndex.tsx](file:///c:/antigravity/X3%208app%20Q/components/SurahIndex.tsx)
* **Opened From:** Main Header Title Click / [FloatingSideMenu.tsx](file:///c:/antigravity/X3%208app%20Q/components/FloatingSideMenu.tsx)
* **Purpose:** Navigation index directory.
* **Sections:**
  * **Tab Selector:** Toggles: Surahs tab, Juz tab, and Pages tab.
  * **Search Bar:** Text input filtering the active listing.
  * **Directory Grid/List:** Scrollable grids of items matching selected tabs.
* **Inputs:** Search text, active tab type, click item selectors.
* **Outputs:** Sets `currentPage` in `App.tsx` and triggers page turn. Closes overlay.
* **Data Sources:** `SURAHS` constant structure, Juz page offsets.
* **Validation Rules:** Search normalizes Arabic text input. Page list restricts numbers between 1 and 604.

### 3. Search Modal
* **Modal:** Search Modal
* **Owner File:** [SearchModal.tsx](file:///c:/antigravity/X3%208app%20Q/components/SearchModal.tsx)
* **Opened From:** Main Header Search Icon / [FloatingSideMenu.tsx](file:///c:/antigravity/X3%208app%20Q/components/FloatingSideMenu.tsx)
* **Purpose:** Text query filter search and jump portal.
* **Sections:**
  * **Search Input Header:** Input field query matching partial text.
  * **Results List Scroll View:** Vertical list displaying verse number, Surah title, page count, and snippet match text.
* **Inputs:** Character text string, click results.
* **Outputs:** Closes modal, changes `currentPage` and `highlightedAyah` index in `App.tsx`, scrolling book canvas to target ayah and rendering glow.
* **Data Sources:** `fullQuranData` index (loaded on boot from `/quran.json`).
* **Calculations:** normalizes Arabic text inputs (strips diacritics, maps Alif formats) to perform string matches.
* **Validation Rules:** Input must be at least 2 characters to trigger scan.

### 4. Alarm Creator & Manager Modal
* **Modal:** Alarm Creator & Manager Modal
* **Owner File:** [NotificationManager.tsx](file:///c:/antigravity/X3%208app%20Q/components/NotificationManager.tsx)
* **Opened From:** [FloatingSideMenu.tsx](file:///c:/antigravity/X3%208app%20Q/components/FloatingSideMenu.tsx) (Alarms Log) / Settings Alerts Option
* **Contains:** Active Scheduled Reminders Lists, Add Reminder Form.
* **Inputs:** Alarm title, Surah/Page range, Time inputs, Day checkboxes, Alarm sound selectors.
* **Outputs:** Registered alarms configs in storage. Capacitor Local Notification scheduler logs calls.
* **Data Sources:** `localStorage` alarms list configuration objects.
* **Validation Rules:** Maximum active alarms caps. Time picker values must be valid formats. Autocomplete schedules on native reboots.

### 5. Settings Configuration Modal
* **Modal:** Settings Configuration Modal
* **Owner File:** [Settings.tsx](file:///c:/antigravity/X3%208app%20Q/components/Settings.tsx)
* **Opened From:** [FloatingSideMenu.tsx](file:///c:/antigravity/X3%208app%20Q/components/FloatingSideMenu.tsx) / Main Header Settings Icon
* **Contains:** Brightness adjustment sliders, double-tap options selector, margins slider adjustments, accent color picker trigger, translation downloading manager panel launcher.
* **Inputs:** Brightness values, bottomBar visual checkbox flags, translation select dropdown.
* **Outputs:** Sets global `AppSettings` state context.
* **Data Sources:** `localStorage.quran_app_settings`.
* **Validation Rules:** Coordinates variables validations to prevent UI breakdowns.

### 6. Audio Settings Modal
* **Modal:** Audio Settings Modal
* **Owner File:** [AudioSettingsModal.tsx](file:///c:/antigravity/X3%208app%20Q/components/AudioSettingsModal.tsx)
* **Opened From:** Collapsible Footer Audio Player Options Icon
* **Contains:** Reciters lists rows, Speeds controls slider, repetitions counters.
* **Inputs:** Reciter ID, playback speeds rate, repeats integers.
* **Outputs:** Invokes sequence settings update on useAyahAudio sequence tracker.
* **Data Sources:** Reciters constant directory files, speed maps.
* **Validation Rules:** Playback rate must be within 0.5x to 2.0x range limits.

### 7. Audio Offline Downloader Modal
* **Modal:** Audio Offline Downloader Modal
* **Owner File:** [AudioDownloadModal.tsx](file:///c:/antigravity/X3%208app%20Q/components/AudioDownloadModal.tsx)
* **Opened From:** [FloatingSideMenu.tsx](file:///c:/antigravity/X3%208app%20Q/components/FloatingSideMenu.tsx)
* **Contains:** Reciter selector card, download bounds selector, progress downloader indicator.
* **Inputs:** Reciter selector click, Surah ranges dropdown selectors, download triggers.
* **Outputs:** File write requests inside native local device directories.
* **Data Sources:** Offline reciter file structures.
* **Validation Rules:** Blocks concurrent downloading threads. Validates space limits before writing chunks.

### 8. Ayah Options Modal
* **Modal:** Ayah Options Modal
* **Owner File:** [AyahOptionsModal.tsx](file:///c:/antigravity/X3%208app%20Q/components/AyahOptionsModal.tsx)
* **Opened From:** Click Ayah Separator Circle on Book canvas
* **Contains:** Ratings dot selection cards, Bookmarks switch toggle, Notes textarea.
* **Inputs:** Rating selection click, bookmark flag status, notes text area string.
* **Outputs:** Updates localStorage ratings tables. Redraws page canvas markers colors.
* **Data Sources:** localStorage ratings indices.
* **Validation Rules:** Notes text string is trimmed and escape sanitized to prevent execution glitches.

### 9. Surah Rating Modal
* **Modal:** Surah Rating Modal
* **Owner File:** [SurahRatingModal.tsx](file:///c:/antigravity/X3%208app%20Q/components/SurahRatingModal.tsx)
* **Opened From:** Long-Pressing Surah Header Frames / Options
* **Contains:** Bulk rating selection dot choices.
* **Inputs:** Rating value to propagate (Weak, Medium, Strong).
* **Outputs:** Sets ratings for all verses inside Surah indices.
* **Data Sources:** Local database.
* **Validation Rules:** Bulk updates must run atomically to prevent storage corruption.

### 10. Mutashabihat Associations Modal
* **Modal:** Mutashabihat Associations Modal
* **Owner File:** [MutashabihatModal.tsx](file:///c:/antigravity/X3%208app%20Q/components/MutashabihatModal.tsx)
* **Opened From:** Ayah Options Modal / Side drawer index
* **Contains:** Linked similar verses cards, similarity metrics summaries.
* **Inputs:** Verse jump selection click.
* **Outputs:** Closes modal, changes current page book canvas, and draws glowing absolute highlight bounds.
* **Data Sources:** Custom linkages arrays, in-memory matching indices.
* **Validation Rules:** Compares strings dynamically using similarity calculators.

---

# UI_COMPONENT_REGISTRY

### 1. DownloadProgressBar
* **Component:** `DownloadProgressBar`
* **Inputs:**
  * `progress` (number): Value between 0 and 100 representing downloading progress.
  * `label` (string): Title showing status text.
  * `totalSize` (string): String of size data.
  * `onCancel` (function): Triggered when abort button is clicked.
* **Output:** Rendered colored progress slider indicator.
* **Dependencies:** Tailwind styling components.

### 2. WordMeaningTooltip
* **Component:** `WordMeaningTooltip`
* **Inputs:**
  * `word` (string): Active word index details.
  * `meaning` (string): Translation text definitions.
  * `position` (object): Absolute pixel coordinates references.
  * `onClose` (function): Closes tooltip actions.
* **Output:** Floating overlay tooltip card rendering translation details relative to coordinates offsets.
* **Dependencies:** Placements calculation modules.

### 3. SurahFrame
* **Component:** `SurahFrame`
* **Inputs:**
  * `surahNumber` (number): Surah index.
  * `name` (string): Arabic name calligraphy string.
  * `translatedName` (string): Translated name title.
  * `versesCount` (number): Total verses inside Surah.
  * `revelationPlace` (string): Meccan / Medinan indicator.
* **Output:** Decorative traditional banner header drawing surah info on book canvas setup.
* **Dependencies:** Tailwind colors.

### 4. Basmalah
* **Component:** `Basmalah`
* **Inputs:**
  * `theme` (string context class theme).
* **Output:** Centered calligraphy glyph of Basmalah on Quran lines.
* **Dependencies:** Custom uthmanic font classes.

### 5. Toast
* **Component:** `Toast`
* **Inputs:**
  * `message` (string): Text content.
  * `duration` (number): Duration milliseconds before fade.
  * `onClose` (function): Closes toast window action.
* **Output:** Floating warning block fading from screen bottom margins.
* **Dependencies:** CSS fade transitions.

### 6. BetaBadge
* **Component:** `BetaBadge`
* **Inputs:** None (styles context).
* **Output:** Red/Orange badge displaying "Beta" label.
* **Dependencies:** Inline classes.

### 7. VisitorCounter
* **Component:** `VisitorCounter`
* **Inputs:**
  * `t` (translations bundle): Dictionary locale keys.
  * `language` (string): Active language identifier.
* **Output:** Analytics stats dashboard card showing total visitor metrics counters, active now indicators, and country emojis.
* **Dependencies:** ipapi.co query calls, lucide-react icons.

### 8. PrayerModeButton
* **Component:** `PrayerModeButton`
* **Inputs:**
  * `isActive` (boolean): Current toggle state.
  * `onClick` (function): Click trigger action.
* **Output:** Floating overlay switch button.
* **Dependencies:** absolute coordinates styling.

---

# NAVIGATION_GRAPH

```
Main Reading Canvas (App.tsx / QPCV2PageRenderer.tsx)
 ├─ FloatingSideMenu (Navigation Drawer)
 │   ├─ SurahIndex (Index Directory Modal)
 │   ├─ MemorizationStats (Progress Statistics Modal)
 │   ├─ VerseCalculatorModal (Target Calculators Modal)
 │   ├─ AudioDownloadModal (Audio Offline Downloader Modal)
 │   ├─ HelpModal / HowToUseGuide (User Guides)
 │   ├─ SocialShareModal (Screenshots Share Modal)
 │   ├─ LanguageSelection (App Locale Selection Popup)
 │   └─ FeedbackModal (Submit Feedback Modal)
 ├─ SearchModal (Queries Overlay Modal)
 ├─ Settings (Config Parameters Modal)
 │   ├─ ColorPickerModal (Custom UI Accent Picker)
 │   ├─ TranslationManagerModal (Lang Packages Installer)
 │   └─ PushNotificationCenter (FCM Token Subscription Panel)
 ├─ FloatingAudioPlayer (Footer Playback Control Bar)
 │   └─ AudioSettingsModal (Audio Parameters Modal)
 └─ AyahOptionsModal (Individual Verse Config Popup)
     ├─ SurahRatingModal (Bulk Ratings Unifier Modal)
     └─ MutashabihatModal (Linked Verses Comparison Modal)
         └─ MutashabihatSelectorModal (Similarity Links Editor Modal)
```

---

# DATA_OWNERSHIP_MATRIX

| Data Model | Primary Owner (Write) | Consumers (Read) | Stored In |
| :--- | :--- | :--- | :--- |
| **Memorization Ratings** | [AyahOptionsModal.tsx](file:///c:/antigravity/X3%208app%20Q/components/AyahOptionsModal.tsx), [SurahRatingModal.tsx](file:///c:/antigravity/X3%208app%20Q/components/SurahRatingModal.tsx) | [MemorizationStats.tsx](file:///c:/antigravity/X3%208app%20Q/components/MemorizationStats.tsx), [QPCV2PageRenderer.tsx](file:///c:/antigravity/X3%208app%20Q/components/QPCV2PageRenderer.tsx) (Masking), [VerseCalculatorModal.tsx](file:///c:/antigravity/X3%208app%20Q/components/VerseCalculatorModal.tsx) | `localStorage` (`ratings_key`) |
| **App Settings Configs** | [Settings.tsx](file:///c:/antigravity/X3%208app%20Q/components/Settings.tsx), [ColorPickerModal.tsx](file:///c:/antigravity/X3%208app%20Q/components/ColorPickerModal.tsx), [LanguageSelection.tsx](file:///c:/antigravity/X3%208app%20Q/components/LanguageSelection.tsx) | [App.tsx](file:///c:/antigravity/X3%208app%20Q/App.tsx), [QPCV2PageRenderer.tsx](file:///c:/antigravity/X3%208app%20Q/components/QPCV2PageRenderer.tsx) (Margins, Scales), [FloatingAudioPlayer.tsx](file:///c:/antigravity/X3%208app%20Q/components/FloatingAudioPlayer.tsx) | `localStorage.quran_app_settings` |
| **Current Reading Page** | [App.tsx](file:///c:/antigravity/X3%208app%20Q/App.tsx) | [QPCV2PageRenderer.tsx](file:///c:/antigravity/X3%208app%20Q/components/QPCV2PageRenderer.tsx), [FloatingAudioPlayer.tsx](file:///c:/antigravity/X3%208app%20Q/components/FloatingAudioPlayer.tsx) | `localStorage.quran_last_page` |
| **Custom Mutashabihat** | [MutashabihatSelectorModal.tsx](file:///c:/antigravity/X3%208app%20Q/components/MutashabihatSelectorModal.tsx) | [MutashabihatModal.tsx](file:///c:/antigravity/X3%208app%20Q/components/MutashabihatModal.tsx), [MutashabihatIndex.tsx](file:///c:/antigravity/X3%208app%20Q/components/MutashabihatIndex.tsx) | `localStorage.custom_mutashabihat` |
| **Active Reminders** | [NotificationManager.tsx](file:///c:/antigravity/X3%208app%20Q/components/NotificationManager.tsx) | [App.tsx](file:///c:/antigravity/X3%208app%20Q/App.tsx) (Alarm Trigger Overlay) | `localStorage.notification_scheduler_alarms` |
| **Translation Tables** | [TranslationManagerModal.tsx](file:///c:/antigravity/X3%208app%20Q/components/TranslationManagerModal.tsx) | [QPCV2PageRenderer.tsx](file:///c:/antigravity/X3%208app%20Q/components/QPCV2PageRenderer.tsx) (Translation text nodes) | IndexedDB (`QuranTranslationsDB` -> `translations`) |
| **Word Meaning Tooltips** | [TranslationManagerModal.tsx](file:///c:/antigravity/X3%208app%20Q/components/TranslationManagerModal.tsx) | [WordMeaningTooltip.tsx](file:///c:/antigravity/X3%208app%20Q/components/WordMeaningTooltip.tsx) | IndexedDB (`QuranTranslationsDB` -> `wbw_translations`) / Local Memory |

---

# Tech Stack & Configuration Matrix

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

### Compatibility Matrix

| Component | Target Version | Source / Key Reference |
| :--- | :--- | :--- |
| **Android Target SDK** | `34 / 35` (Android 14 / 15) | `android/variables.gradle` |
| **Android Minimum SDK** | `26` (Android 8.0) | `android/variables.gradle` |
| **Capacitor CLI / Core** | `8.3.1` | `package.json` |
| **Node.js Build Runtime**| `^20.0.0` | Build server environment standard |
| **React Core / DOM** | `19.2.0` | `package.json` |
| **TypeScript Compiler** | `~5.8.2` | `package.json` |

---

# Discovered Features Audit (Feature Registry)

### 1. Quran Page Renderer (QPC V2)
* **Feature Name:** Quran Page Renderer (QPC V2)
* **Current Status:** Complete
* **Main Owner File:** [QPCV2PageRenderer.tsx](file:///c:/antigravity/X3%208app%20Q/components/QPCV2PageRenderer.tsx)
* **Supporting Files:** [SurahFrame.tsx](file:///c:/antigravity/X3%208app%20Q/components/SurahFrame.tsx), [Basmalah.tsx](file:///c:/antigravity/X3%208app%20Q/components/Basmalah.tsx), [DecorativePageFrame.tsx](file:///c:/antigravity/X3%208app%20Q/components/DecorativePageFrame.tsx), [quranService.ts](file:///c:/antigravity/X3%208app%20Q/services/quranService.ts), [index.css](file:///c:/antigravity/X3%208app%20Q/index.css)
* **User Entry Point:** Application boot / Main swiper panel.
* **User Flow:** User lands on the page -> component fetches page-specific JSON layouts -> dynamic style sheet is injected -> FontFace API loads woff2 font files -> parses glyph nodes into a strict 15-line grid.
* **Business Rules:** Must render exactly 15 lines of text. Text reflow or glyph wrapping is strictly forbidden. Page margins scale dynamically to device dimensions.
* **Stored Data:** Coordinates cached in IndexedDB `MushafV2DB` under key `'main_data'`, session caches in `(window as any).qpcV2Cache`.
* **Dependencies:** React, Swiper, `quranService.ts`
* **Offline Support:** 100% offline-first. Uses pre-compiled JSON page directories and local font assets.
* **Risks:** High font loading latency on slow WebViews leading to temporary blank pages or flashes of default fallbacks.
* **Missing Documentation Status:** Fully Documented.

### 2. Ayah Playback Sequencer
* **Feature Name:** Ayah Playback Sequencer
* **Current Status:** Complete
* **Main Owner File:** [useAyahAudio.ts](file:///c:/antigravity/X3%208app%20Q/hooks/useAyahAudio.ts)
* **Supporting Files:** [FloatingAudioPlayer.tsx](file:///c:/antigravity/X3%208app%20Q/components/FloatingAudioPlayer.tsx), [AudioSettingsModal.tsx](file:///c:/antigravity/X3%208app%20Q/components/AudioSettingsModal.tsx), [reciterService.ts](file:///c:/antigravity/X3%208app%20Q/services/reciterService.ts), [audioCacheService.ts](file:///c:/antigravity/X3%208app%20Q/services/audioCacheService.ts), [App.tsx](file:///c:/antigravity/X3%208app%20Q/App.tsx)
* **User Entry Point:** Floating audio player button or settings panel play request.
* **User Flow:** Click play -> loads active reciter configuration -> streams MP3 sequence or fetches local files -> automatically highlights playing verse -> page flips automatically when sequence boundaries cross.
* **Business Rules:** Playback continues in the background. Audio setting ranges (speed, repeats) are reset on manual reciter/surah change but survive programmatic page transitions.
* **Stored Data:** Playback rate, repetitions, and range configs are saved in `localStorage.quran_app_settings`, selected reciter ID in `localStorage.selected_reciter_id`.
* **Dependencies:** HTML5 Audio, WakeLock API.
* **Offline Support:** Streams online by default. Falls back to offline mode when reading files pre-fetched by the Downloader Wizard.
* **Risks:** Buffering latency or background playback interruption under device Doze mode constraints.
* **Missing Documentation Status:** Fully Documented.

### 3. Word-by-Word Audio Playback
* **Feature Name:** Word-by-Word Audio Playback
* **Current Status:** Complete
* **Main Owner File:** [useWordByWordAudio.ts](file:///c:/antigravity/X3%208app%20Q/hooks/useWordByWordAudio.ts)
* **Supporting Files:** [QPCV2PageRenderer.tsx](file:///c:/antigravity/X3%208app%20Q/components/QPCV2PageRenderer.tsx)
* **User Entry Point:** Double-tapping a word glyph on the screen.
* **User Flow:** Double-tap word -> hooks interrupts active page audio sequences -> downloads single word MP3 fragment -> plays audio fragment while highlighting active word bounds.
* **Business Rules:** Word double-taps immediately pause or stop normal page/verse audio streams.
* **Stored Data:** None (stateless remote file requests).
* **Dependencies:** HTML5 Audio player instance.
* **Offline Support:** Requires active network connection (fetches audio fragments by word position).
* **Risks:** Network drop causing unresponsive double-tap triggers.
* **Missing Documentation Status:** Fully Documented.

### 4. Text & Jump Search Engine
* **Feature Name:** Text & Jump Search Engine
* **Current Status:** Complete
* **Main Owner File:** [SearchModal.tsx](file:///c:/antigravity/X3%208app%20Q/components/SearchModal.tsx)
* **Supporting Files:** [quranService.ts](file:///c:/antigravity/X3%208app%20Q/services/quranService.ts), [App.tsx](file:///c:/antigravity/X3%208app%20Q/App.tsx)
* **User Entry Point:** Header search button click.
* **User Flow:** Open search modal -> type Arabic characters, Surah name, or Page number -> engine normalizes Arabic inputs (strips diacritics) -> lists matching results -> tap result card -> jumps to page and highlights target ayah.
* **Business Rules:** Normalization strips diacritics and unifies letters (like different shapes of Alif). Matches are highlighted with a glowing overlay on the page.
* **Stored Data:** Temporary memory indices constructed at boot.
* **Dependencies:** In-memory indices from `quran.json`.
* **Offline Support:** 100% offline-ready.
* **Risks:** Minor performance delays on low-spec devices when searching very broad queries.
* **Missing Documentation Status:** Fully Documented.

### 5. Exact Native Alarms & Notifications
* **Feature Name:** Exact Native Alarms & Notifications
* **Current Status:** Complete
* **Main Owner File:** [NotificationManager.tsx](file:///c:/antigravity/X3%208app%20Q/components/NotificationManager.tsx)
* **Supporting Files:** [useNotifications.ts](file:///c:/antigravity/X3%208app%20Q/hooks/useNotifications.ts), [InAppNotificationsModal.tsx](file:///c:/antigravity/X3%208app%20Q/components/InAppNotificationsModal.tsx), [usePushNotifications.ts](file:///c:/antigravity/X3%208app%20Q/hooks/usePushNotifications.ts), [PushNotificationCenter.tsx](file:///c:/antigravity/X3%208app%20Q/components/PushNotificationCenter.tsx), [App.tsx](file:///c:/antigravity/X3%208app%20Q/App.tsx), `capacitor.config.ts`
* **User Entry Point:** Menu side drawer "Notification Logs" / Settings reminder configuration.
* **User Flow:** Setup revision reminder -> App schedules exact alarm via Capacitor -> Device wakes from standby on target time -> rings local looping alert sound -> user clicks notification -> opens application to the revision target page.
* **Business Rules:** Scheduled alarms survive device reboots. Notifications channel is flagged as High Priority. Sounds loop for up to 59 seconds.
* **Stored Data:** Serialized alarms configuration array in `localStorage` under keys `notification_scheduler_alarms`. Logs recorded in in-app notifications store.
* **Dependencies:** Capacitor Local Notifications plugin, Android scheduler.
* **Offline Support:** 100% offline-first.
* **Risks:** Device OEM battery policies suppressing exact alarms.
* **Missing Documentation Status:** Fully Documented.

### 6. Word Meaning Tooltip
* **Feature Name:** Word Meaning Tooltip
* **Current Status:** Complete
* **Main Owner File:** [WordMeaningTooltip.tsx](file:///c:/antigravity/X3%208app%20Q/components/WordMeaningTooltip.tsx)
* **Supporting Files:** [QPCV2PageRenderer.tsx](file:///c:/antigravity/X3%208app%20Q/components/QPCV2PageRenderer.tsx)
* **User Entry Point:** Clicking/long-pressing an Arabic word glyph.
* **User Flow:** User long-presses word glyph -> tool measures word position coordinates -> fetches meanings dictionary -> draws floating popup with word translation.
* **Business Rules:** Dismisses automatically when page is swiped or scrolling occurs.
* **Stored Data:** Meanings parsed from memory object `__ma3anyData` loaded from `/data/new_ma3any_pos.json`.
* **Dependencies:** CSS coordinate placements.
* **Offline Support:** 100% offline.
* **Risks:** Edge case layout issues if tooltip renders near screen borders.
* **Missing Documentation Status:** Fully Documented.

### 7. Assessment Text Masking
* **Feature Name:** Assessment Text Masking
* **Current Status:** Complete
* **Main Owner File:** [QPCV2PageRenderer.tsx](file:///c:/antigravity/X3%208app%20Q/components/QPCV2PageRenderer.tsx)
* **Supporting Files:** [Settings.tsx](file:///c:/antigravity/X3%208app%20Q/components/Settings.tsx), [App.tsx](file:///c:/antigravity/X3%208app%20Q/App.tsx)
* **User Entry Point:** Settings visual toggles ("Hide Weak" / "Hide Weak & Medium").
* **User Flow:** User toggles masking modes -> text blocks match rating criteria and become invisible on screen -> user taps masked area -> text displays momentarily -> hides again after release.
* **Business Rules:** Masking boundaries are defined by active ratings (Weak, Medium, Strong) per verse. Toggling modes recalculates layout.
* **Stored Data:** UI configuration settings. Component-level sets (`revealedIndices` and `randomMasks`).
* **Dependencies:** CSS visibility / opacity layers.
* **Offline Support:** 100% offline.
* **Risks:** Heavy repaints on low-end device screens when masking multiple verses.
* **Missing Documentation Status:** Fully Documented.

### 8. Mutashabihat Index & Links
* **Feature Name:** Mutashabihat Index & Links
* **Current Status:** Beta
* **Main Owner File:** [MutashabihatModal.tsx](file:///c:/antigravity/X3%208app%20Q/components/MutashabihatModal.tsx)
* **Supporting Files:** [MutashabihatIndex.tsx](file:///c:/antigravity/X3%208app%20Q/components/MutashabihatIndex.tsx), [MutashabihatSelectorModal.tsx](file:///c:/antigravity/X3%208app%20Q/components/MutashabihatSelectorModal.tsx), [mutashabihatProcessor.ts](file:///c:/antigravity/X3%208app%20Q/utils/mutashabihatProcessor.ts), [similarityCalculator.ts](file:///c:/antigravity/X3%208app%20Q/utils/similarityCalculator.ts), [App.tsx](file:///c:/antigravity/X3%208app%20Q/App.tsx)
* **User Entry Point:** Ayah options modal / Side menu Mutashabihat Directory.
* **User Flow:** Open Mutashabihat overlay -> select target verse -> displays a list of matching similar verses -> click any item -> jumps directly to the target verse page and highlights the verse.
* **Business Rules:** Matches are pre-compiled but similarity metrics can be computed dynamically. Users can add custom linkages.
* **Stored Data:** Custom links saved in `localStorage.custom_mutashabihat`.
* **Dependencies:** Math similarity formulas.
* **Offline Support:** 100% offline.
* **Risks:** Overlapping index triggers causing multiple rapid page flips.
* **Missing Documentation Status:** Fully Documented.

### 9. Prayer Mode (Focus Mode)
* **Feature Name:** Prayer Mode (Focus Mode)
* **Current Status:** Complete
* **Main Owner File:** [App.tsx](file:///c:/antigravity/X3%208app%20Q/App.tsx)
* **Supporting Files:** [PrayerModeButton.tsx](file:///c:/antigravity/X3%208app%20Q/components/PrayerModeButton.tsx), [FullscreenExitButton.tsx](file:///c:/antigravity/X3%208app%20Q/components/FullscreenExitButton.tsx)
* **User Entry Point:** Bottom menu bar Prayer Mode button.
* **User Flow:** Click button -> UI enters distraction-free layout -> collapses top header and bottom menus -> user slides pages seamlessly -> click overlay button to restore interface.
* **Business Rules:** Closes active settings and feedback modals on initialization. Toggling feedback opens exit modes.
* **Stored Data:** State flag saved in `localStorage.quran_app_settings.prayerMode`.
* **Dependencies:** CSS absolute layouts.
* **Offline Support:** 100% offline.
* **Risks:** Touch boundary conflicts with page-turning swipe gestures on narrow screens.
* **Missing Documentation Status:** Fully Documented.

### 10. Surah & Ayah Memorization Ratings
* **Feature Name:** Surah & Ayah Memorization Ratings
* **Current Status:** Complete
* **Main Owner File:** [SurahRatingModal.tsx](file:///c:/antigravity/X3%208app%20Q/components/SurahRatingModal.tsx)
* **Supporting Files:** [AyahOptionsModal.tsx](file:///c:/antigravity/X3%208app%20Q/components/AyahOptionsModal.tsx), [MemorizationStats.tsx](file:///c:/antigravity/X3%208app%20Q/components/MemorizationStats.tsx)
* **User Entry Point:** Long-press surah headers or individual verse option clicks.
* **User Flow:** Click verse number -> select rating level (Weak, Medium, Strong) -> circle separator color updates. To unify, long-press surah header -> unified Surah rating propagates to all verses.
* **Business Rules:** Ratings are persistent and never auto-expire.
* **Stored Data:** Saved in localStorage bookmarks/ratings.
* **Dependencies:** Local component states.
* **Offline Support:** 100% offline.
* **Risks:** Bulk database synchronization delays.
* **Missing Documentation Status:** Fully Documented.

### 11. Accent Color Schemes Picker
* **Feature Name:** Accent Color Schemes Picker
* **Current Status:** Complete
* **Main Owner File:** [ColorPickerModal.tsx](file:///c:/antigravity/X3%208app%20Q/components/ColorPickerModal.tsx)
* **Supporting Files:** [App.tsx](file:///c:/antigravity/X3%208app%20Q/App.tsx), [Settings.tsx](file:///c:/antigravity/X3%208app%20Q/components/Settings.tsx)
* **User Entry Point:** Settings panel theme accent selector click.
* **User Flow:** Select custom theme color dot -> script updates CSS variable `--accent-color` globally on HTML root element -> UI accents color updates immediately.
* **Business Rules:** Accent values are mapped strictly to hexadecimal variables and injected directly to root stylesheets.
* **Stored Data:** Accent color string saved in `localStorage.quran_app_settings.theme`.
* **Dependencies:** CSS custom properties.
* **Offline Support:** 100% offline.
* **Risks:** Visual contrast issues under dark themes.
* **Missing Documentation Status:** Fully Documented.

### 12. Target & Verse Calculator
* **Feature Name:** Target & Verse Calculator
* **Current Status:** Complete
* **Main Owner File:** [VerseCalculatorModal.tsx](file:///c:/antigravity/X3%208app%20Q/components/VerseCalculatorModal.tsx)
* **Supporting Files:** [FloatingSideMenu.tsx](file:///c:/antigravity/X3%208app%20Q/components/FloatingSideMenu.tsx)
* **User Entry Point:** Sliding side drawer "Target Calculator" option.
* **User Flow:** Open calculator -> input daily page target or select revision date -> script runs split calculation formulas -> displays calculated milestones calendar.
* **Business Rules:** Splits are locked to Quran page limits (604 pages). Calculated values must be non-negative integers.
* **Stored Data:** Component local form states.
* **Dependencies:** Date mathematics helpers.
* **Offline Support:** 100% offline.
* **Risks:** Out-of-bounds date adjustments.
* **Missing Documentation Status:** Fully Documented.

### 13. Audio Offline Downloader Wizard
* **Feature Name:** Audio Offline Downloader Wizard
* **Current Status:** Complete
* **Main Owner File:** [AudioDownloadModal.tsx](file:///c:/antigravity/X3%208app%20Q/components/AudioDownloadModal.tsx)
* **Supporting Files:** [DownloadProgressBar.tsx](file:///c:/antigravity/X3%208app%20Q/components/DownloadProgressBar.tsx), [audioCacheService.ts](file:///c:/antigravity/X3%208app%20Q/services/audioCacheService.ts)
* **User Entry Point:** Floating side menu "Download Audio" option.
* **User Flow:** Choose Reciter -> choose target surah ranges -> click download -> download chunks sequence -> writes downloaded files directly to local storage file blocks -> updates offline logs.
* **Business Rules:** Multi-threading is restricted to prevent network choke. Download queues can be paused or cancelled.
* **Stored Data:** MP3 files saved inside native device directory directories.
* **Dependencies:** Capacitor Filesystem plugin.
* **Offline Support:** Wizard requires active connection to download. Playback operates offline.
* **Risks:** Storage exhaustion on low-spec device profiles.
* **Missing Documentation Status:** Fully Documented.

### 14. Translations Package Manager
* **Feature Name:** Translations Package Manager
* **Current Status:** Complete
* **Main Owner File:** [TranslationManagerModal.tsx](file:///c:/antigravity/X3%208app%20Q/components/TranslationManagerModal.tsx)
* **Supporting Files:** [translationStorageService.ts](file:///c:/antigravity/X3%208app%20Q/services/translationStorageService.ts)
* **User Entry Point:** Settings translation options click.
* **User Flow:** Open manager -> choose language -> downloads JSON translations index -> updates IndexedDB table -> active translation block displays selected text beneath Quranic lines.
* **Business Rules:** Restricts redundant translation languages. Downloads are mapped to standard ISO codes.
* **Stored Data:** Translations structures saved in IndexedDB `QuranTranslationsDB`.
* **Dependencies:** IndexedDB transactions.
* **Offline Support:** Downloads require active network. Access operates completely offline.
* **Risks:** Interrupted downloads causing broken packages in DB.
* **Missing Documentation Status:** Fully Documented.

### 15. In-App Notifications Log
* **Feature Name:** In-App Notifications Log
* **Current Status:** Complete
* **Main Owner File:** [InAppNotificationsModal.tsx](file:///c:/antigravity/X3%208app%20Q/components/InAppNotificationsModal.tsx)
* **Supporting Files:** [useNotifications.ts](file:///c:/antigravity/X3%208app%20Q/hooks/useNotifications.ts), [App.tsx](file:///c:/antigravity/X3%208app%20Q/App.tsx)
* **User Entry Point:** Sliding side menu bell icon click.
* **User Flow:** Tap bell icon -> lists logs of triggered reminders -> user taps log -> closes panels and opens book page for targeted verse.
* **Business Rules:** Opening log unreads set is set to 0. Clears lists on request.
* **Stored Data:** History array in localStorage.
* **Dependencies:** Local notification hooks.
* **Offline Support:** 100% offline.
* **Risks:** Memory expansion if history arrays grow unchecked.
* **Missing Documentation Status:** Fully Documented.

### 16. Guided User Tour Onboarding
* **Feature Name:** Guided User Tour Onboarding
* **Current Status:** Complete
* **Main Owner File:** [TourWelcomeModal.tsx](file:///c:/antigravity/X3%208app%20Q/components/TourWelcomeModal.tsx)
* **Supporting Files:** [TourClickOverlay.tsx](file:///c:/antigravity/X3%208app%20Q/components/TourClickOverlay.tsx), [HowToUseGuide.tsx](file:///c:/antigravity/X3%208app%20Q/components/HowToUseGuide.tsx), [TourManager.ts](file:///c:/antigravity/X3%208app%20Q/utils/TourManager.ts), `driver.js`
* **User Entry Point:** Settings help option / automated first boot setup.
* **User Flow:** Open app -> welcomes user -> driver step-by-step pointers highlight the navbar, settings button, masking toggle, and side menu -> user clicks "Finish".
* **Business Rules:** Saves configuration flag on finish. Resets settings to default target pages on cancel.
* **Stored Data:** State flag saved in `localStorage.tour_welcome_shown`.
* **Dependencies:** driver.js plugin.
* **Offline Support:** 100% offline.
* **Risks:** Visual element mismatches during orientation rotation shifts.
* **Missing Documentation Status:** Fully Documented.

---

# Tech Stack & Configuration Matrix

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

### Compatibility Matrix

| Component | Target Version | Source / Key Reference |
| :--- | :--- | :--- |
| **Android Target SDK** | `34 / 35` (Android 14 / 15) | `android/variables.gradle` |
| **Android Minimum SDK** | `26` (Android 8.0) | `android/variables.gradle` |
| **Capacitor CLI / Core** | `8.3.1` | `package.json` |
| **Node.js Build Runtime**| `^20.0.0` | Build server environment standard |
| **React Core / DOM** | `19.2.0` | `package.json` |
| **TypeScript Compiler** | `~5.8.2` | `package.json` |

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

# Public API Surface

### `quranService.ts`
* `fetchPage(pageNumber: number): Promise<PageData>`
* `getAyahPage(surahNumber: number, ayahNumber: number): Promise<number>`
* `getAyahPageSync(surahNumber: number, ayahNumber: number): number | null`
* `getPageAyahRange(surahNumber: number, pageNumber: number): Promise<{ start: number, end: number } | null>`
* `getSurahsForPages(startPage: number, endPage: number, language?: string): Promise<string>`
* `getJuzForPage(pageNumber: number): number`
* `getSurahStartPage(surahNumber: number): number`

### `translationStorageService.ts`
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

### `useAyahAudio.ts`
* `playAyahAudio(globalAyahNumber: number, reciterId: string, rate: number): Promise<void>`
* `playSequence(settings: AudioSequenceSettings, onAyahChange: (globalNum: number) => void): Promise<void>`
* `stopAudio(): void`
* `pauseAudio(): void`
* `resumeAudio(): void`
* `updateRuntimeSettings(settings: Partial<AudioRuntimeSettings>): void`
* State exports: `isPlayingSeq` (boolean), `isPaused` (boolean), `currentAyahIndex` (number)

---

# ADRs & Architecture Invariants

### ADR-001: Use QPC V2 Dynamic Font rendering instead of Page Images
* **Decision:** Load vector page fonts dynamically (`WOFF2` format) and draw pages client-side using character mapping arrays instead of loading pre-rendered page screenshots.
* **Reason:** Reduces the bundle footprint from hundreds of Megabytes to just 15MB, while permitting word-level click detection, dynamic text masking, and native glow highlights.
* **Consequences:** Layout shift risks and font flicker during rapid page swipes. Mitigated by dynamic style inject triggers inside layout effects.

### ADR-002: Use IndexedDB for Translation caches
* **Decision:** Utilize IndexedDB to store translation files and Word-by-Word data collections instead of using LocalStorage.
* **Reason:** LocalStorage is limited to a strict 5MB quota, which fails when storing translations for multiple languages. IndexedDB supports large database blocks.
* **Consequences:** All database actions are asynchronous. Requires loading indicators when fetching translations at launch.

### ADR-003: Build Native application using Capacitor Core
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

# MISSING_FROM_DOCUMENTATION (Documentation Gap Audit)

Below is an audit mapping features currently active in the codebase that were omitted or incomplete in previous design maps:

### Screens & Overlays
* **Profile Drawer (`FloatingSideMenu.tsx`):** Hidden side navigation drawer acting as the hub for all sub-tools (Index, Settings, Notifications, Statistics, Tours, and Shares).
* **Language Selector Popup (`LanguageSelection.tsx`):** Controls runtime localization strings. Adjusts direction properties (`dir="rtl"` or `dir="ltr"`) dynamically on the `<html>` root node.
* **Color Schemes Picker (`ColorPickerModal.tsx`):** Enables custom user branding accents by mapping selection codes back to root CSS theme colors.

### Modals
* **Ratings Unification (`SurahRatingModal.tsx`):** Allows batch-updating an entire Surah retention score, prompting a choice to unify all Ayah nodes.
* **Audio Download Wizard (`AudioDownloadModal.tsx`):** Manages local caching directories. Calculates size matrices and reports progresses.
* **Translations Download Panel (`TranslationManagerModal.tsx`):** Coordinates background queries to download target language tables directly into local IndexedDB structures.

### Statistics
* **Memorization Strength Index (`MemorizationStats.tsx`):** Aggregates rated ayahs, displaying analytics charts, total counts, and completion bars tracking Good, Medium, and Weak statuses.

### Calculators
* **Target & Verse Calculator (`VerseCalculatorModal.tsx`):** Internal calculator allowing users to schedule and calculate custom revision cycles.

### Audio Features
* **Numpad Audio Controller (`AudioSettingsModal.tsx`):** Local scope forms modifying active speed thresholds, playback sequences, and range limitations.
* **Audio Cache Check (`audioCacheService.ts`):** Exposes direct directory lookup calls checks before fetching remote assets.

### Memorization Features
* **Word Translation Tooltip (`WordMeaningTooltip.tsx`):** Displays single-word translations and highlights targeted phrase scopes dynamically.

### Notifications
* **In-App Notification Logs (`InAppNotificationsModal.tsx`):** Smart logs dashboard exposing details on alarms received while the app is active, permitting direct navigation back to target pages.

### Search
* **Search Engine Parser (`SearchModal.tsx`):** Indexes and normalizes Arabic inputs, matching partial strings.

### Settings
* **Settings Parameters Panel (`Settings.tsx`):** GUI configuring brightness, double-tap options, and WbW translation targets.

---

# EXISTING_FEATURES_NOT_DOCUMENTED (Final Audit Report)

Exhaustive registry of all active subsystems audited in this session:

### 1. Screens
* **`FloatingSideMenu.tsx`**
  * *Purpose:* Sliding drawer providing primary navigation options.
  * *Entry Point:* Header menu button click.
  * *Flow:* Open -> click option (Index, Settings, Help) -> triggers corresponding state -> slides closed.
* **`SplashScreen.tsx`**
  * *Purpose:* Custom startup layout displaying logos and version states.
  * *Entry Point:* Automated application boot lifecycle.
  * *Flow:* Boot -> fade transition -> trigger onFinish.

### 2. Modals
* **`SurahRatingModal.tsx`**
  * *Purpose:* Unifies ratings across all verses inside a Surah.
  * *Entry Point:* Long-press on Surah headers or separator indicators.
  * *Flow:* Select rating -> Confirm -> runs DB write -> update state.
* **`AudioDownloadModal.tsx`**
  * *Purpose:* Offline audio caching wizard.
  * *Entry Point:* Floating side menu "Download Audio" option.
  * *Flow:* Select Reciter -> Fetch details -> click Download -> runs background chunks downloads.
* **`TranslationManagerModal.tsx`**
  * *Purpose:* Downloads translation packages for offline access.
  * *Entry Point:* Settings panel translation downloads option.
  * *Flow:* Select language -> fetch -> update IndexedDB store `translations`.
* **`ColorPickerModal.tsx`**
  * *Purpose:* Pick UI accent color theme.
  * *Entry Point:* Settings theme selector click.
  * *Flow:* Choose color code -> updates `--accent-color` variables on Root DOM.

### 3. Statistics
* **`MemorizationStats.tsx`**
  * *Purpose:* Visualizes current retention metrics.
  * *Entry Point:* Floating side menu "Memorization Progress" option.
  * *Flow:* Calculates rating counts -> compiles SVG charts -> displays retention stats.

### 4. Calculators
* **`VerseCalculatorModal.tsx`**
  * *Purpose:* Custom targets calculations.
  * *Entry Point:* Floating side menu "Target Calculator" option.
  * *Flow:* Enter values -> calculates splits -> returns schedules summaries.

### 5. Audio Features
* **`AudioSettingsModal.tsx`**
  * *Purpose:* Advanced audio settings options.
  * *Entry Point:* Floating Audio Player options button click.
  * *Flow:* Change reciter, speeds, or repetitions -> calls updateRuntimeSettings().
* **`useWordByWordAudio.ts`**
  * *Purpose:* Play single-word audio on tap.
  * *Entry Point:* Word double-tap gesture.
  * *Flow:* Capture word details -> fetch single-word file -> stream play.

### 6. Memorization Features
* **`WordMeaningTooltip.tsx`**
  * *Purpose:* Tooltip showing word-by-word meanings.
  * *Entry Point:* Word click or long-press.
  * *Flow:* Capture word position -> lookup `__ma3anyData` -> draw tooltip overlay.

### 7. Notifications
* **`InAppNotificationsModal.tsx`**
  * *Purpose:* Renders in-app notification logs history.
  * *Entry Point:* Bell icon click on FloatingSideMenu.
  * *Flow:* Opens panel -> marks items as read -> lists alerts -> navigates to target pages on click.

### 8. Search
* **`SearchModal.tsx`**
  * *Purpose:* Fast search overlay.
  * *Entry Point:* Header search button click.
  * *Flow:* Input text -> query index -> list results -> navigate to target page on click.

### 9. Settings
* **`Settings.tsx`**
  * *Purpose:* Configuration dashboard.
  * *Entry Point:* Floating side menu Settings option.
  * *Flow:* Toggles settings options -> calls setSettings() state.

---

# Event Flows & Data Loops

### Page Swipe navigation
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

### Audio playback loop
```
Play Sequence click
  └── App.tsx calls startPagePlayback()
        └── useAyahAudio.ts maps target surah/ayah to global index
              └── HTML5 Audio plays verse mp3
                    └── ended event caught
                          ├── useAyahAudio.ts increments verse index
                          ├── App.tsx programmatically navigates to target page if crossed
                          └── QPCV2PageRenderer.tsx measurements trigger requestAnimationFrame
                                └── hl-ayah-overlay glow overlay repainted around active verse
```

### Notification schedule sequence
```
User schedules Alarm in UI
  └── NotificationManager.tsx captures alarm date/time selection
        └── LocalNotifications.schedule() registers strict timer in Android OS
              └── Device enters standby (Doze mode) -> system triggers high priority alarm
                    └── User taps notification -> App opens target page
                          └── App.tsx launches full-screen Alarm Overlay
                                └── Alarm audio loops (stops automatically after 59s)
```

---

# Changelog

### [2026-06-07]
* **Added:** Significantly enriched `COMPLETE_SCREEN_REGISTRY` and `MODAL_REGISTRY` in `AGENTS_SYNC.md` with explicit details about internal sections, metrics, calculations, validations, inputs, outputs, and user actions.
* **Fixed:** Synchronized all code configurations, dependencies, and rules directly with the current codebase implementation.
