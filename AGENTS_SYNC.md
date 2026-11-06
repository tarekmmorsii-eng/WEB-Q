## Exact owner-requested Arabic age prompt - latest installed 2026-11-06

Latest APK/mushaf-1.10-reading-test-feedback-message.apk installed over readingtest SamsungA23 R58W21J82EB; live index-DQP8ZPsM.js. Only ar.feedbackForm.ageUnavailable changed to owner's exact wording (register age; under18 requires parents' help); behavior unchanged (nonadult cannot directly send, OK opens age chooser). Native alert readback exact-match passed,0POSTs; draft and unsaved age selection restored, previous scroll/picker fixes retained. Backup artifacts/feedback-message-backup-20261106; localDifferences[],personalDataEqual/standardUnchanged true. Evidence artifacts/feedback-message-phone.json. No site/Play/push.

## Adult age dialog touch scrolling fixed - latest installed 2026-11-06

Latest APK/mushaf-1.10-reading-test-age-scroll.apk installed over readingtest SamsungA23 R58W21J82EB; live index-CotgyFMH.js, APKsha4C26B3E3BDF2D03BFD091012280C0224AA6FD1D348883605B7B3EA9F7579DBEF. Root cause verified with CDP matched styles: modalDesign.css direct-panel selector overflow:hidden overrides section overflow-y-auto by specificity. MeasurementConsent now flex column with inner min-h0/overflow-auto/touch-pan-y content and fixed shrink0 action footer; no global CSS change. Both accept/decline buttons always visible.

6consent tests pass incl actual production CSS small portrait360x640/landscape832x384 scrolling+button visibility. Physical touch scroll0->358.76 with both actions stationary and visible, screenshot visually checked artifacts/age-scroll-phone.png; evidence age-scroll-phone.json. User draft Test and unsaved adult selection restored, dialog left open; actual stored ageunder18 unchanged, no consent/save/send performed. Backup artifacts/age-scroll-backup-20261106; final localDifferences[],personalDataEqual/standardUnchanged true,68blobfiles hash-equal,page30/ar.1837native/static APKentries preserved; compiled UI only. No site/Play/push. Details scripts/feedback_age_gate_review.md.

## Unified nonadult prompt and two age options - latest installed 2026-11-06

APK/mushaf-1.10-reading-test-two-age-groups.apk installed on readingtest/SamsungA23 R58W21J82EB; index-Cwh5nQMs.js, APKsha0073200FF531BB68FC0948095EC9256497F9E81A13247AD7E1A427C271BF5E3A. All nonadult/missing/invalid choices now use same register-age alert + existing age window; removed contact-support branch. Still only adult saved choice permits feedback. MeasurementConsent visible options now under18/adult (plus empty placeholder),31localized under18 labels. Legacy under13/13to17 normalized to under18 on read only, actual stored value unchanged until user saves; measurement still adult+explicitallowed only. Updated privacy description. Existing gallery fixes preserved.

13feedback+5consent tests pass, including31locales and legacy mapping. Physical actual saved under13 now produces unified Arabic alert, opens window with under18 selected and exactly two age choices, draft/image preserved,0POSTs; no mocked age in this check. Evidence artifacts/feedback-two-ages-phone.json. Fresh backup artifacts/feedback-two-ages-backup-20261106; savedstate/personal/originalapp unchanged,68blobfiles preserved,page30/ar. No site/Play/push/new feedback. Details scripts/feedback_age_gate_review.md.

## Feedback opens age selection directly - latest installed trial 2026-11-06

Latest APK/mushaf-1.10-reading-test-feedback-age-dialog.apk installed over readingtest on SamsungA23 R58W21J82EB, same signature. Live index-BtsvrMEH.js, APKshaE7AA2ECE66AB4C6B9CEF4ED2AFA5859285E390307AD53F163951BE7188FD57A1. Unknown/missing/invalid/unreadable age now alerts to register age, then dispatches existing open-measurement-choice after OK. Draft/image/device fields retained; original MeasurementConsent opens above FeedbackModal, reads fresh saved age and displays blank for unknown. User saves age then manually submits; no automatic transmission. Minor-parent block unchanged. Updated ageUnavailable31locales.

12browser tests pass, including actual age modal+draft/image retention+adult submit and newly selected minor blocking. Physical test verified Arabic alert, age modal opened blank, draft and screenshot preserved,0POSTs; simulated unknown getter restored and page reloaded, actual age choice unchanged. Evidence artifacts/feedback-age-dialog-phone.json. Fresh backup artifacts/feedback-age-dialog-backup-20261106; final savedstate/personal/originalapp equal,68blobfiles preserved,page30/ar. No site/Play/push/new real feedback. Details scripts/feedback_age_gate_review.md.

## Feedback age confirmation removed - latest installed trial 2026-11-06

Latest APK/mushaf-1.10-reading-test-feedback-simplified.apk installed over readingtest on SamsungA23 R58W21J82EB; live index-Ch-mJP1d.js. Preserves both native image-picker fixes. Removed repeated window.confirm from feedback submit; requires saved version1 adult age with boolean allowed, either true/false. Known minors blocked with parent message; missing/unknown/malformed/unsupported choices blocked with Settings guidance. Measurement approval remains independent. Shortened screenshotHint to first sentence in all31locales, Arabic now only screenshot-if-helpful sentence. Updated public/privacy.html to describe saved-age eligibility.10browser tests pass, web build passes, phone hint/native plugin verified; no real new submission. Fresh backup artifacts/feedback-copy-backup-20261106, savedstate/personal/originalapp unchanged,68blobfiles preserved. No site/Play/push. Details scripts/feedback_age_gate_review.md.

## Both Android image pickers verified - latest installed trial 2026-11-05

Installed APK/mushaf-1.10-reading-test-both-pickers.apk on readingtest/SamsungA23 R58W21J82EB using install-r, same certificate54a7fc40...1d9f06b; APKshaB047FA7F8B22441E5F38973314BE68EE2720518259CF36A4E8CA10DE177C86CB. Native-only follow-up, existing web bundle index-BOXb7xjY.js unchanged. FeedbackImagesPlugin now defaults ACTION_GET_CONTENT so photo picker is genuinely tested, and handles Files via picker menu Browse through same native content reader; ACTION_OPEN_DOCUMENT fallback/optional files source, ClipData URI support, caught MIME lookup exceptions.

Physical acceptance: original failing screenshot media1000136259 selected first in photo picker, then via More/Browse/Screenshots in Files. Both succeed with zero alerts and exact same preview SHA25604cfd89fd6413552143315bc24c0beb1a16d57c065c718dec80bb8dcd5bf589a/114186bytes/718x1600. Evidence artifacts/feedback-{photo-picker,files-picker}-verification.json. No additional feedback sent this follow-up; previous end-to-end submission below remains valid. Fresh backup artifacts/feedback-both-pickers-backup-20261105; final localDifferences[],personalDataEqual,standardUnchanged true;68originalblobfiles hash-equal;page30/ar preserved,stay-awake restored0. No Play/site/push. Details scripts/FEEDBACK_GALLERY_FIX_2026_11_05.md.

## Native gallery fix installed and full feedback submission verified - 2026-11-05

Latest installed trial: APK/mushaf-1.10-reading-test-gallery-fix.apk, com.mushafalmurajaa.app.readingtest, Samsung A23 R58W21J82EB, 1.10/code10, same debug certificate54a7fc40...1d9f06b, live index-BOXb7xjY.js. APKsha2EC0DAD608A097FD0038428524337C4B735FCB418BF27C035E494BE56DD34C07. Supersedes feedback-fix APK below: FileReader alone did NOT fix actual gallery selection. Reproduced NotReadableError on media1000136259; exact JPEG bytes decode correctly. New FeedbackImagesPlugin reads user-selected ACTION_OPEN_DOCUMENT URI via native ContentResolver, bounded8MiB, then existing frontend JPEG compression. Registered in MainActivity, no new storage permission.

Physical native picker Images/Screenshots selected exact original screenshot413152bytes,1080x2408; preview718x1600/114186bytes. One owner-authorized test submission GALLERY-20261105-01 persisted at23:33:42 Istanbul; row id fadd9bf3-871d-4c69-8525-7af16f07e53e, Drive image1pmB9VtjpoiyUUCs5cEC95Z2b7za3Pbpk. Connector readback confirms row, JPEG image114186bytes. No email-receipt claim. Test record retained. Auto-review initially blocked transmission; user then explicitly approved exact screenshot/test/destination and submission succeeded.

Fresh backup artifacts/feedback-native-device-backup-20261105; final localDifferences[], personalDataEqual true, standardUnchanged true, page30/ar preserved.1299staticAPKasset entries unchanged. Web/native builds and4targeted browser tests pass, including native success/cancel/error/retry. Source changes remain local; no Play upload/production package update/push. Full evidence scripts/FEEDBACK_GALLERY_FIX_2026_11_05.md.

## Feedback screenshot fix installed on test phone - 2026-11-05

Installed APK/mushaf-1.10-reading-test-feedback-fix.apk via adb install -r on Samsung A23 R58W21J82EB, package com.mushafalmurajaa.app.readingtest. Same debug certificate 54a7fc40...1d9f06b, native/static 1837 entries preserved; only compiled web UI replaced. Live index-CcH3oILP.js verified. FileReader data URL + image.onload replaces blob URL + decode; input reset delayed until read completes. Two screenshot selections in actual WebView succeeded with loaded 720x1280 JPEG preview; no feedback POST sent. User gallery-picker acceptance remains for user trial. Website also deployed successfully via commit e40c9eb, Actions42100404620.

Fresh backup artifacts/feedback-device-backup-20261105 contains original APK/current private data/state. Final check localDifferences[], personalDataEqual true, standardUnchanged true, original page29/ar. Opening app changed quran_history timestamp; restored exactly. Evidence artifacts/feedback-phone-verification.json and feedback-package-verification.json. No data clear/uninstall/Play upload.

## Verse dialogs, atomic theme paint and pinch preference — 2026-11-05 (latest installed trial)

Installed APK/mushaf-1.10-reading-test-ui-fixes.apk on readingtest/SamsungA23 R58W21J82EB using install-r, same debug certificate54a7fc40…1d9f06b, v1.10/code10; live index-DGOnnpjm.js. APKsha13D09E6B76EE885213BC533B76AF3DA1EA9AD680C7C1920A72BF4E829DE72659. Native/manifest/resources/Quran/fonts/config1837entries byte-identical; compiled UI only replaced. Standard package unchanged/no Play upload.

AyahOptionsModal tafsir/translation panel now has ModalLogo and amber/white header+footer close buttons. Bookmark action executes callback then closes options. App theme DOM application moved to useLayoutEffect, while settings persistence remains useEffect; temporary mushaf-theme-switching disables only reading-surface color transitions for2rAF, then normal transitions resume. Physical old theme contrast dipped1.02:1; final minimum15.95:1, all glyph nodes connected. QPC pointerDown clears any previous long-press timer before assigning another, preventing an orphan first-finger timer from starting word audio during a pinch.

UI_COMPONENT_REGISTRY addition: Settings → Touch gestures → gesturePinchZoom checkbox, label from readingViewMessages31locale catalogue. Optional boolean/defaulttrue in AppSettings and both settings defaults; persisted through existing settings save. Ref-gated original outward-pinch entry and enlarged pinch resizing; manual controls remain available. No storage migration or scripture/font modifications. Existing dialog registrations remain; no new screen.

Validation: new6/6, touch/audio5/5, hide/page/rotation7/7 pass; final locale coverage rechecked. Scoped App typecheck50baseline/50current,0new diagnostics. Real device checks tafsir logo/colors, bookmark saved+closed, pinch disabled in both views/re-enabled live, and atomic theme contrast pass on final build. Fresh backup at artifacts/ui-fixes-device-backup-20261105 reflects current user data, not older snapshots; restored page29/ar/original/SHOW_ALL/calm-night and all saved localStorage values. Personal data hash equal; all68backed-up blob files hash-equal; originalAPKsha7f55ef4f…a18793a3 unchanged. Details scripts/UI_FIXES_2026_11_05_AR.md. Previous performance-only APK retained separately.

## Interaction latency trial installed — 2026-11-05 (previous device verification)

Installed APK/mushaf-1.10-reading-test-performance.apk with adb install-r on SamsungA23 R58W21J82EB, package com.mushafalmurajaa.app.readingtest, v1.10/code10; actual loaded index-D9uou4uF.js. Same debug certificate54a7fc40…1d9f06b. Repackaged backed-up installed trial, replacing ONLY public/index.html and public/assets compiled UI;1837other entries byte-identical, including nativeDEX/manifest/resources/Quran/fonts/Capacitor config. Alignment/signature checks pass. NewAPKsha831384157E618344AF86313DAC5E83B59DDE3AC484CBF0CAA599EC9F271875E1. Standard com.mushafalmurajaa.app APKsha7f55ef4f…a18793a3 unchanged. No uninstall/data clear/Play upload.

Physical before/after warm page100,3samples/mode: medians hide-all1251->769ms(39%), randomayah801->592(26%), randomword660->445(33%), firstword889->359(60%), lastword934->338(64%). Four navigation transitions518->399ms median; real touch/cancelled drag pass both builds. Page604 all5modes checked; all20before/after mode snapshots have identical words/colors/line dimensions/shadow geometry;0JSerrors. Timings are option-to-two-rAF, not full color-transition visual latency; small-sample device results only.

Backed up previousAPK, private WebView/database/files/shared_prefs/no_backup tar, localStorage and personal records under artifacts/performance-device-backup-20261105. Restored user's page16/ar/original/SHOW_ALL and saved settings/history; final independent check localDifferences[], personal12records hash-equal, original package unchanged. All63backed-up IndexedDB blob files hash-equal on device; audio store count63->64 from app/test activity, no original file lost/deleted. Temporary USB stay-awake restored to original0. NewAPK contains no user data. Evidence scripts/INTERACTION_PERFORMANCE_PHONE_AR.md, artifacts/performance-phone-{before,after,summary}.json, backup/check-verification.json and blob-verification.json. Supersedes source-only/native-validation-pending status below.

## Interaction latency improvements — 2026-11-05 (source only, historical)

QPCV2PageRenderer now memoizes per-verse rating/bookmark/similarity decorations by their source inputs, preserving existing lookup precedence and live invalidation. Reveal restoration and empty resets retain equivalent Sets; unused empty random masks avoid a duplicate commit on ordinary pages. Centered ayah lines retain the original settling commit: page604 parity testing caught prematurely measured narrow shadows, so this optimization is explicitly gated by line structure, not page number. Shadow offsetParent positioning now happens before layout reads. No Quran/font/CSS/App/Swiper/native/storage-schema changes in this task; no APK installed or production upload.

Final production web build index-D9uou4uF.js succeeds. New acceptance7/7 covers all15hide options in both views, metadata updates, reveal/re-hide/reset/cache, edge pages1/2/604 with rotation/dark mode, real touch/cancelled drag and reload page identity. Existing regression7pass plus word-review2pass on current and2pass on pre-change reference after repairing stale test color expectations to inherit the dialog palette (no product colors changed). Scoped typecheck32baseline/32current,0new diagnostics. Final balanced warm local comparison on page100: hide option median829->486ms (41%,6samples/build), Script232->95ms, Layout291->140ms; transition+saved-page median422->412ms (4/build, no meaningful speed claim). All measured hides138words/20overlays,0JSerrors. Physical WebView replacement experiment failed its build-marker check and is NOT accepted native validation; routing/cache overrides removed and saved trial state restored. Source improvements still require actual APK/device trial.

Evidence and commands: scripts/INTERACTION_PERFORMANCE_IMPROVEMENTS_AR.md; artifacts/interaction-focused-guarded-{final,summary}.json; tests/interaction-performance.config.ts; artifacts/interaction-typecheck.json. Pre-change renderer snapshot artifacts/interaction-baseline-renderer.tsx preserves pre-existing user changes; App SHA256 remainsDCAD90FA…B56362F. No blanket reset of existing workspace changes.

## Rotation comparison follow-up — 2026-11-04
User prefers enlarged-reading rotation and explicitly authorizes keeping v5 if an equally smooth ordinary layout cannot be achieved. Reversible on-device prototype removed the transformed carousel visually (active slide only, no wrapper transform) and disabled native snapshot cover, retaining original QPC fixed-line layout. Native screenrecord still showed a stale narrow/oversized raster during rotation; prototype did not meet the requested equivalence. No application source or APK changes made in this follow-up; installed v5 remains. Temporary style removed, original rotation gate restored according to current mode. User's original page477 and enlarged reading mode restored and confirmed live; bundle index-GxGCcjpz.js unchanged. Capture artifacts/rotation-direct-prototype.mp4, rotation-direct-prototype-original.png. Initial capture was in enlarged mode (not ordinary) and is NOT evidence for ordinary layout. A restoration helper timed out because the sidebar toggle was disabled with controls hidden; manual test dispatch to main then enabled toggle restored enlarged mode, verified again afterward. This records the outcome honestly: no equally smooth direct ordinary-layout solution established, user-approved fallback retained.

## Rotation visual correction — 2026-11-04 (latest installed trial)
Latest APK/mushaf-1.10-reading-test-rotation-v5.apk installed-r on Samsung A23 R58W21J82EB, matching prior trial certificate54a7fc40…1d9f06b. Live bundle index-GxGCcjpz.js. Supersedes v2/v3/v4 rotation trials. Page identity fix retained.
DOM geometry alone missed Chromium displaying a stale raster: native before.mp4 showed narrow portrait text in landscape and enlarged/cropped landscape text in portrait until repaint. Final changes: original CSS orientation rules use viewport media queries instead of delayed data-orientation attributes; slide width follows100% container immediately; inactive virtual pages defer React/device resize work until activation. MainActivity holds an in-memory snapshot with FIT_CENTER (preserves proportions, short letterboxed preview) during ORIGINAL-view rotation and releases it after two JS animation frames plus WebView.postVisualStateCallback. Enlarged reading opts out via setOriginalLayout. Generation guard handles rapid rotations; 2s fail-open timeout prevents a stuck overlay. Snapshot is not saved by app. Existing system bar/IME policy unchanged. JS bridge generation uses getInt for JSON numeric IDs (getLong returns null for Integer).
Verification: production web build and native build pass; current-CSS browser tests5/5 (3original render parity, page-preserving real Swiper rotation, stale orientation attribute/inline geometry regression) plus enlarged reflow/swipe tests2/2 pass. Native final4pages(4,36,70,476):786frames, zero page/index drift and zero slide/viewport-width discrepancies. Recorder now waits for deferred localStorage page effect before measuring; earlier2false failures were pre-rotation old saved-page values. Original page477 and automatic rotation restored. Final video/contact sheet artifacts/rotation-native-v5-final.{mp4,png}: no anisotropic intermediate text; proportional preview is visible briefly before new layout. User visual acceptance still pending, especially preference for this preview. No Play upload or production APK rebuild.

Reading UI localization follow-up2026-11-03: user found untranslated original-view button. Added i18n/readingViewMessages.json exhaustive31locale×8keys=248labels, typed readingViewText adapter; covers original Mushaf button, open/close, increase/decrease/size, previous/next and sidebar accessibility/title. No renderer/CSS/Quran changes or legacy translation file changes. Coverage equality and nonempty text checks pass; existing notes verifier confirms32originaltranslationfiles still byte-identical. Existing original-page parity/compact-header tests2pass41.2s, actual label switch test all31locales passes53.9s. Native build22s, matching signature54a7fc40…1d9f06b verified; latest APK/mushaf-1.10-reading-test-reading-all-languages.apk. No Play upload/production candidate changes.

## Notes and sharing localization — 2026-11-03

1. Feature Name: Complete UI localization of verse notes, sharing and Settings notes library.
2. Current Status: 31 supported locales, dedicated catalogue; local test APK, no Play upload.
3. Main Owner File: i18n/notesMessages.json.
4. Supporting Files: i18n/ayahToolsText.ts, NotesLibrary, AyahToolsModal, AyahOptionsModal, Settings, ayahSharing, scripts/verify-notes-i18n.cjs, locale browser tests.
5. User Entry Point: Existing notes/share buttons and Settings My notes; labels use selected UI language.
6. User Flow: Same behavior; localized editor/help/errors/status/deletion/undo/pins/search/filter/order/share content labels/native chooser title/accessibility labels and localized surah names.
7. Business Rules: Exhaustive typed Record<Language,...> catalogue, 53 strings per locale. No English fallback for supported locales; unknown language alone falls back to English. Proper shared loanwords explicitly allowed by audit. User notes and Quran text never translated or rewritten.
8. Stored Data: No note schema/content changes. Existing language settings reused.
9. Dependencies: Existing supported Language union and localized proper surah/reciter names. Dedicated direction helper ar/ur/fa/ku RTL, all others LTR, avoiding malformed legacy dir values without modifying those files.
10. Offline Support: All UI strings bundled locally.
11. Risks: UI localization does not supply missing scripture translations/WBW/tafsir data; selected-language availability rules remain. Preexisting broad TypeScript failures are separately recorded; no new scoped messages.
12. Missing Documentation Status: Coverage, original-byte hashes, tests and trial artifact recorded in release handoff.

Registry changes: all three notes/share screens now use notesMessages for their labels; native Share.share title/dialogTitle use selected language; back icon follows direction. Existing 31 src/assets/i18n JSON files and i18n/translations.ts remain byte-identical to pre-task hashes. Verification script checks locale/key equality, missing/empty/corrupt strings, explicit English fallback exceptions for actual shared words, and original-file hashes.

## Notes library — local implementation 2026-11-03

1. Feature Name: All personal verse notes.
2. Current Status: Implemented for local user trial; no Play upload.
3. Main Owner File: components/NotesLibrary.tsx.
4. Supporting Files: components/Settings.tsx, App.tsx, services/ayahNotes.ts, existing AyahToolsModal.tsx, tests/e2e/ayah-tools.spec.ts.
5. User Entry Point: Settings quick access → My notes, next to memorization/index/calculator tools.
6. User Flow: List all saved notes → search/filter/sort → pin, expand, edit, delete-confirm/undo, or navigate to verse. Editor reuses single-field note modal and reloads library after save/back.
7. Business Rules: One text record per verse, existing notes immediately included; pinned first then last edit/Quran order. Delete requires confirmation; undo restores prior record only if absent to avoid replacing newly written text. No file/backup UI added.
8. Stored Data: Existing IndexedDB MushafPersonalNotes v1 notes store; optional pinned boolean on same record, retained during note edits. No migration, login or cloud sync. Note timestamp unchanged by pinning. Undo retains exact record/timestamp/pin.
9. Dependencies: Existing local Quran JSON for verse preview/page, SURAHS metadata, existing Android keyboard-settle method for edit/navigation/close. Lazy library loaded only after user opens it.
10. Offline Support: All library actions and verse previews use local files and IndexedDB.
11. Risks: Local application data independent of production package; uninstall/clear-data can remove notes. Failed storage operations retain UI and show error; no message or network upload. Original Quran renderer/fonts/data untouched.
12. Missing Documentation Status: Tests, native trial package and acceptance limits recorded in scripts/RELEASE_CURRENT_HANDOFF.md.

Registry additions: COMPLETE_SCREEN_REGISTRY — NotesLibrary. MODAL_REGISTRY — library delete confirmation and reused AyahToolsModal editor. UI_COMPONENT_REGISTRY — settings note button, count, search, surah filter, recent/Quran order, pin star, verse preview, expansion, navigation/edit/delete, undo, empty/no-results/error states. NAVIGATION_GRAPH — Settings → NotesLibrary → AyahToolsModal → NotesLibrary; NotesLibrary → highlighted Quran verse; NotesLibrary close → Settings.

Native-height verification delivered: tests13/13 pass2.2m; build32s, matching trial certificate verified, adb -r install Success R58W21J82EB. Repeated actual IME opening: inner832->474, visualViewport832->115->474 remains transient, but panel top24/bottom366.844 and textarea top182.133 stayed IDENTICAL on every captured frame (artifacts/notes-ime-motion-after.json). Before panel bottom366->99->366; fixed. No text edits during native measurement. Latest APK/mushaf-1.10-reading-test-notes-native-height.apk installed. Separate text/audio action state tested both orders via mocks, no actual recipient message sent. No Play upload/production candidate changes.

Native notes IME measured fix2026-11-03: CDP on A23 reproduced huge bounce; before samples innerHeight832->474, visualViewport832->115->474, panel top24 stable but bottom366->99->366 (artifacts/notes-ime-motion-before.json). Android native insets already shrink WebView; visualViewport transiently double-subtracts keyboard. readNotesViewport now uses innerHeight/top0 on Android only; browser visualViewport retained; no native geometry/Quran renderer changes. User also reverts guided two-step flow: text button then audio controls BELOW text preview/button, independent audio checkbox loading. Separate share text/audio buttons mark completed action; first keeps modal, second closes in either order; cancellations/clipboard copy not counted, manual close available. Original Mushaf unchanged, no Play. Target APK/mushaf-1.10-reading-test-notes-native-height.apk.

Notes anchor/badge and two-step sharing2026-11-03: User reports one large movement when IME opens. Notes overlay now top-aligned24physicalpx instead of vertically re-centered on resized viewport; same compact content bounds and keyboard-settled close. AyahOptionsModal queries saved note at open/verse/tools return with cancellation guard; Check icon+data-has-note beside notes label; false for deleted/empty. Audio+text combined Android intent already contained EXTRA_TEXT but target audio MIME may discard text. User rejected video then explicitly accepted two sequential messages. New flow audio checkbox prepares file in background; unified button Share text first -> await native result -> keep overlay and switch Share audio now -> audio-only native intent -> close on success. Cancel/error retains current step, no automatic message or recipient selection, user must choose same conversation twice. No new video/hosting/storage migration. Latest target APK/mushaf-1.10-reading-test-notes-anchor-two-step.apk; no Play upload, original Mushaf unchanged.

Notes IME dismissal fix2026-11-03: User reports Quran squeezed briefly after Save. Root cause notes onClose ran after IndexedDB save while Android WebView still at IME-reduced height. AyahToolsModal now blurs editor and awaits existing MushafSystemBars.hideKeyboard (IME hidden, no animation, WebView stable4frames) before close/back/save removes overlay. This reuses SearchModal mechanism; no changes to native geometry, Quran renderer, fonts, or data. Failure retains notes overlay and stored note rather than exposing reduced page. Latest target APK/mushaf-1.10-reading-test-notes-keyboard-stable.apk. No Play upload.

Single-field notes follow-up2026-11-03: User requests same field for display/edit, Save closes notes, share closes after completion. AyahToolsModal loads existing note into sole textarea; removed saved display card/edit mode, persist replaces same stored note rather than appending. Delete confirmation retained. Save awaits IndexedDB write before onClose; failure stays open. Share awaits shareVerse then onClose for opened result; rejection/cancel stays open, clipboard fallback remains with copied status. Android Capacitor SharePlugin rejects canceled chooser; selection success is handoff, not proof of delivery. Original Mushaf untouched; no Play action. Latest target APK/mushaf-1.10-reading-test-notes-single.apk.

Notes edit/delete and share follow-up 2026-11-03: AyahToolsModal adds edit-existing mode (replace, not append), cancel editing, delete-confirm/cancel. Notes retained in same IndexedDB schema; no migration. Optional unchecked personal-note share checkbox includes saved note in preview only after explicit selection (user wording message interpreted as note, async clarification pending). Audio checkbox among content options triggers independent abortable download; options stay usable, unified Share selected content disabled while selected audio unavailable; deselection cancels; reciter changes rebuild audio. Removed bottom prepare/audio/both buttons. Error allows deselecting audio to share text; retry by toggling audio checkbox. No sending to recipient; original Mushaf unchanged; no Play upload. Latest target APK/mushaf-1.10-reading-test-notes-edit-share.apk.

Notes compact follow-up 2026-11-03: User rejected full-height notes panel and all backup/file UI inside it. AyahToolsModal now uses content-height, max-width28rem, max-height min(560,visualViewport/scale minus margins), centered overlay. Removed all import/export controls and their component dependencies (storage/native backup services retained unused). Explicit save appends nonempty draft to existing verse note, clears composer after successful storage, reopens with empty composer and saved text above; empty close/save never deletes saved data. No per-keystroke persistence; Back/Close still flush nonempty drafts. Local help text reflects Save action. Original Mushaf renderer unchanged. Latest trial target APK/mushaf-1.10-reading-test-notes-compact.apk; production candidates unchanged, no Play upload.

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

## Local 1.10 trial: personal verse notes and sharing preview (2026-11-03)

1. Feature Name: Personal verse notes and verse sharing preview.
2. Current Status: Implemented in local test APK; no Google Play upload. Browser tests and phone save/reopen/audio preparation/sharesheet verified; backup save confirmed on the phone.
3. Main Owner File: `components/AyahToolsModal.tsx`.
4. Supporting Files: `components/AyahOptionsModal.tsx`, `services/ayahNotes.ts`, `services/ayahSharing.ts`, `i18n/ayahToolsText.ts`, native `AyahFilesPlugin.java`, `tests/e2e/ayah-tools.spec.ts`.
5. User Entry Point: Verse-number options → My notes or Share verse.
6. User Flow: Notes → serialized automatic local writes / export via system document picker / validate import → explicit merge or replacement; Share → choose available explanation, similarities and word meanings → inspect exact preview → optionally prepare selected-reciter MP3 → system sharesheet.
7. Business Rules: Notes excluded from sharing. Missing foreign data never replaced with Arabic. Imported verse references and note lengths validated; existing notes preserved unless replacement selected. Sharesheet requires a separate user tap after audio preparation; no recipient selected automatically.
8. Stored Data: IndexedDB `MushafPersonalNotes` / `notes`, keyed surah:ayah; user-selected JSON backup; temporary audio files in app cache for FileProvider sharing. Last reciter uses existing app state.
9. Dependencies: Bundled quran.json, current similarity groups, installed translation/WBW data, existing audio cache and EveryAyah URL mapping, Capacitor Share, Android document picker/FileProvider. Arabic/English UI with English fallback for other UI languages; content uses selected-language availability.
10. Offline Support: Notes, local backup, verse text and installed language data; audio sharing if its existing blob is cached, otherwise requires download.
11. Risks: Target apps determine text-plus-audio support; no message sent to a recipient during testing. Local notes have no automatic cloud backup; uninstall/clear-data may remove them. Export/import must be explicitly chosen. Android import picker and target-app delivery are left for user trial; validation/merge are covered in browser tests.
12. Missing Documentation Status: Verification and artifact snapshot are recorded in the current handoff and final release README. First-verse share text follows the existing helper's unnumbered-basmalah separation, preserving Fatiha 1:1.

Notes UI follow-up (2026-11-03): saved note appears above the bottom composer; save confirmation with check mark beside the composer, editor and save remain outside scrolling backup area. VisualViewport resize/scroll + window resize constrain only this notes overlay, accounting for ReadingUiScale; subscription immediately measures to cover keyboard-open races. Backup tools live in a collapsed, explained details section; no file is required for everyday notes. Nine focused browser checks passed including scaled keyboard-sized viewport. Original Mushaf renderer untouched.

Registry additions: COMPLETE_SCREEN_REGISTRY — Personal verse notes; Verse share preview. MODAL_REGISTRY — AyahToolsModal, with notes/share modes. UI_COMPONENT_REGISTRY — note editor, save, backup export, backup import preview and replacement checkbox, content selection and preview, prepare audio, text/audio/combined share buttons. NAVIGATION_GRAPH — AyahOptionsModal → AyahToolsModal(notes/share) → back or close; notes export → Android create-document picker; sharing → Android sharesheet.

## Private Juz-one tajweed trial (2026-10-30)

This entry describes opt-in local trial code, not a production feature.

1. Feature Name: Juz-one word-by-word tajweed.
2. Current Status: Development / `tajweed-trial` build only; not scientifically approved for publication.
3. Main Owner File: `components/JuzOneTajweedModal.tsx`.
4. Supporting Files: `services/juzOneTajweed.ts`, `components/AyahOptionsModal.tsx`, `tests/e2e/juz-one-tajweed.spec.ts`.
5. User Entry Point: Ayah number menu → Tajweed, for 1:1–1:7 and 2:1–2:141.
6. User Flow: Verse words → selected word cards or all source annotations in order → return to words/menu; legacy 2:22 comparisons remain independent.
7. Business Rules: Exact source text; mismatched spans not colored; source definitions distinguished from contextual notes; stop/join labels; production gate.
8. Stored Data: In-memory response only; no persistent source cache.
9. Dependencies: QuranHub v1 online ayah and Arabic definition APIs.
10. Offline Support: None for this trial; network error and retry.
11. Risks: Unresolved source licensing/scientific provenance, 77 span mismatches in audited juz, incomplete per-location reasons.
12. Missing Documentation Status: Detailed limits and audit in `artifacts/juz-one-tajweed-implementation.md`.

Registry additions: COMPLETE_SCREEN_REGISTRY — Juz-one trial verse view; MODAL_REGISTRY — JuzOneTajweedModal; UI_COMPONENT_REGISTRY — clickable words, rule cards, all-annotations toggle, return-to-words, retry, legacy-comparison entry; NAVIGATION_GRAPH — AyahOptionsModal → JuzOneTajweedModal → word/all cards or legacy TajweedModal → back/close.

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

## Rotation layout correction — 2026-11-04
Original Mushaf main/pager containers now transition colors only, so orientation changes do not animate layout dimensions for 500ms. Swiper virtual slide sizes and offsets refresh in the next animation frame instead of after a 550ms delay. QPC line fitting observes actual container width and invalidates/refits before paint instead of relying on a delayed corrective timer. Existing manual line overrides remain respected. Production Vite build and original-layout raster comparisons for pages 1, 4 and 604 pass. Full-application rotation validation could not reach the renderer: local application page data remained loading until timeout; native phone verification remains outstanding. No native package or production deployment performed.

Reading rotation delivery2026-11-04: trial APK built and verified as com.mushafalmurajaa.app.readingtest, certificate matches prior trial, current web bundle verified inside APK. File APK/mushaf-1.10-reading-test-rotation-fix.apk. Phone not connected in adb; no installation performed. Native rotation verification pending.

Rotation trial installation2026-11-04: install-r Success R58W21J82EB, readingtest launched. Live bundle index-DV8QEiQE.js and main/pager color-only transitions verified via CDP. Physical rotation acceptance pending user; data preserved.

## Original pager rotation v2 — 2026-11-04
Main owner App.tsx; helper utils/resizeMushafPager.ts. Logical currentPageRef is preserved while synchronously resizing the virtual grid; slideTo anchor precedes virtual.update(true). Independent Swiper auto-resize/observer disabled to prevent races, main observer/window resize handled under callback guard. Original native repro476→220 with old translate182400/new833px grid. Browser four-page rotation regression passes; Samsung A23 four-page469frames zero index/page drift and zero squeezed slide widths. Reading view unchanged. APK/mushaf-1.10-reading-test-rotation-v2.apk installed-r, matching trial signature; live bundle index-CosKDpr_.js. Device automatic rotation/original page476 restored. Supersedes first rotation-fix trial; no Play/production changes.

## Reminders crash fix — 2026-11-04
Device crash buffer confirmed repeated fatal IllegalStateException from PushNotificationsPlugin.register: default FirebaseApp absent in readingtest. Added SafePushNotificationsPlugin, registered after auto-loaded plugins through MainActivity.initialPlugins. Inherits existing permissions/listeners/delivery, catches native IllegalStateException on register and rejects FIREBASE_UNAVAILABLE so existing JS error handling runs; unregister without Firebase safely resolves. Local notification permissions and reminders remain independent. No Firebase credentials introduced, no web asset changes. assembleBetaDebug offline passed; APK/mushaf-1.10-reading-test-reminders-fix.apk signature matches existing trial54a7fc40…1d9f06b; adb install-r Success on R58W21J82EB. Native Settings→Reminders repeated3cycles and add form opened; direct register rejects FIREBASE_UNAVAILABLE, local display permission granted, no JS errors, process7724 remains alive and no new crash. Evidence artifacts/reminders-fix-device.json. No reminders saved/deleted or user data cleared; no Play upload/production artifact update.
