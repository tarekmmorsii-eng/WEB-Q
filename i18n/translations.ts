// Translation system for 27 languages
export type Language =
    | 'ar' | 'en' | 'id' | 'ms' | 'ur' | 'bn' | 'tr' | 'fa' | 'ha' | 'fr'
    | 'es' | 'de' | 'ru' | 'sw' | 'zh' | 'ko' | 'ja' | 'bs' | 'sq' | 'uz'
    | 'kk' | 'ku' | 'vi' | 'tl' | 'hi' | 'ta' | 'si' | 'am' | 'yo' | 'om'
    | 'rw';

export interface Translations {
    // Bottom Bar
    index: string;
    search: string;
    memorizationStats: string;
    notifications: string;
    darkMode: string;
    lightMode: string;
    fontSize: string;
    bookmark: string;
    settings: string;
    verse: string;

    // Header Buttons
    showAll: string;
    hideAll: string;
    hideAyahs: string;
    hideWords: string;
    hideRandomAyahs: string;
    hideRandomWords: string;
    toggleFirstWord: string;
    toggleLastWord: string;
    ayahs: string;
    stopSignsLabel: string;
    allWords: string;
    hideFirstWord: string;
    showFirstWord: string;
    hideLastWord: string;
    showLastWord: string;

    // Font sizes
    small: string;
    medium: string;
    large: string;

    // Settings
    settingsTitle: string;
    bottomBarCustomization: string;
    showInBottomBar: string;
    colorThemes: string;
    soundSettings: string;
    pageFlipSound: string;
    wordAudioLongPress: string;
    language: string;
    languages: string;
    textBrightness: string;
    backgroundBrightness: string;

    // Theme names
    warmBeige: string;
    coolWhite: string;
    softCream: string;
    darkBlue: string;
    pureBlack: string;
    warmDark: string;

    // Common
    save: string;
    cancel: string;
    close: string;
    loading: string;
    error: string;

    // Toast Messages
    firstWordHidden: string;
    firstWordShown: string;
    lastWordHidden: string;
    lastWordShown: string;
    allAyahsHidden: string;
    ayahsHiddenAtStopSigns: string;
    randomWordsHidden: string;
    allWordsHidden: string;
    randomHidden: string;
    weakAyahsHidden: string;
    mediumAyahsHidden: string;
    goodAyahsHidden: string;
    notMemorizedAyahsHidden: string;
    allAyahsShown: string;

    // Misc
    page: string;
    surah: string;
    retry: string;

    // Surah Index
    juz: string;
    recentPages: string;
    pageBookmarks: string;
    noPageBookmarks: string;
    verseBookmarks: string;
    verseBookmarksSection: string;
    noVerseBookmarks: string;
    delete: string;
    indexTitle: string;
    guideAction: string;
    watchVideo: string;

    // Memorization Stats
    memorizationStatsTitle: string;
    fromAyahCount: string;
    good: string;
    weak: string;
    notRated: string;

    // Notification Manager
    notificationManagerTitle: string;
    noNotifications: string;
    daily: string;
    addNotification: string;
    editNotification: string;
    addNewNotification: string;
    notificationName: string;
    notificationNamePlaceholder: string;
    notificationType: string;
    weekly: string;
    selectDays: string;
    notificationTimes: string;
    addAnotherTime: string;
    sunday: string;
    monday: string;
    tuesday: string;
    wednesday: string;
    thursday: string;
    friday: string;
    saturday: string;

    // Quran Page Renderer
    hizb: string;
    firstRub: string;
    secondRub: string;
    thirdRub: string;
    fourthRub: string;
    rateAyah: string;
    saveAyah: string;

    // Ayah Options
    ayahOptions: string;
    addBookmark: string;
    removeBookmark: string;
    rateMemorization: string;
    ayahCopied: string;
    errorCopying: string;
    tafsirAyah: string;

    // Display Settings Labels
    displaySettings: string;
    defaultFontSize: string;
    lineSpacingLabel: string;
    pageMarginsLabel: string;
    prayerMode: string;
    selectTheme: string;
    colorStopSigns: string;
    contact: string;
    chooseColor: string;
    fullscreen: string;
    exitFullscreen: string;
    minimize: string;
    rub: string;
    dataError: string;
    help: string;
    howToUse: string;
    surahPrefix: string;
    pageNotAvailable: string;
    fontNotLoaded: string;
    offlineLoadNotice: string;
    moreSettings: string;
    hideDetailedSettings: string;
    pageNavigation: string;
    offlineMode: string;
    updateAvailable: string;
    updateDescription: string;
    updateNow: string;
    updateLater: string;
    installApp: string;
    downloadMushaf: string;
    downloadMushafDescription: string;
    updatingMushaf: string;
    waitUpdating: string;
    downloadSuccess: string;
    developerTools: string;
    exportReviewData: string;
    clearAllData: string;
    confirmClearData: string;
    alarmMessage: string;
    stopAlarm: string;
    alarmError: string;
    notificationError: string;
    notificationBodyAlarm: string;
    notificationBodyRegular: string;
    alarmMode: string;
    testAlarm: string;
    testNotification: string;
    testNotificationBody: string;
    permissionRequired: string;
    notificationSound: string;
    presetIslamic: string;
    presetCalm: string;
    customSound: string;
    previewSound: string;
    uploadCustomSound: string;
    errorPlayingSound: string;
    enableAlarmMode: string;
    alarmModeDescription: string;
    deliveryMethod: string;
    browserNotificationTitle: string;
    browserNotificationDescription: string;
    notificationActive: string;
    notificationBlocked: string;
    sendTestNotification: string;
    searchByPage: string;
    searchByAyah: string;
    selectSurah: string;
    enterPageNumber: string;
    go: string;
    searchByWord: string;
    searchPlaceholder: string;
    searching: string;
    resultsFound: string;
    noResultsFound: string;
    clearAllRatings: string;
    confirmClearTitle: string;
    confirmClearMessage: string;
    confirmYes: string;
    cancelMode: string;
    prayerModeTitle: string;
    tinyUpdate: string;
    basmallah: string;

    // Gestures
    gestureSettings: string;
    gestureTwoFingerTap: string;
    gestureDoubleTap: string;
    gestureSwipeUp: string;

    // Mutashabihat
    similarVersesAlert: string;
    similarVersesDescription: string;
    sourceVerse: string;
    openInIndex: string;
    goToVerse: string;
    all: string;
    insideSurah: string;
    outsideSurah: string;
    similarVersesLabel: string;
    noMatchingVerses: string;
    reportError: string;
    report: string;
    addSimilarAyah: string;

    // Verse Calculator
    verseCalculatorTitle: string;
    startPoint: string;
    endPoint: string;
    calculate: string;
    verseCount: string;
    invalidRange: string;
    modeRange: string;
    modeStructure: string;
    selectStructure: string;
    juzType: string;
    hizbType: string;
    rubType: string;
    strong: string;

    // Surah Rating
    rateSurah: string;
    rateRange: string;
    fromAyah: string;
    toAyah: string;
    applyRating: string;
    pleaseSelectRating: string;
    ayahNumberBetween: string;
    startMustBeLess: string;

    // Help Slides
    helpSlide1Title: string;
    helpSlide1Desc: string;
    helpSlide2Title: string;
    helpSlide2Desc: string;
    helpSlide3Title: string;
    helpSlide3Desc: string;
    helpSlide4Title: string;
    helpSlide4Desc: string;

    interfaceTab: string;
    settingsTab: string;
    clickToZoom: string;
    closeGuide: string;
    next: string;
    previous: string;
    guideStart: string;
    guideVerseVisibility: string;
    guideWordVisibility: string;
    guideQuranUI: string;
    guideSettingsTools: string;
    guideIndex: string;
    guideSearch: string;
    guideMemorizationStats: string;
    guideNotifications: string;
    guideMutashabihat: string;
    guideVerseCalculator: string;
    guidePrayerMode: string;
    guideNotes: string;

    showSimilarVersesIndicators: string;
    similarVersesIndicatorsDesc: string;

    // Feedback
    feedback: string;
    sendFeedback: string;
    feedbackInterfaceNotes: string;
    feedbackSettingsNotes: string;
    feedbackBugTech: string;
    feedbackSuggestion: string;
    feedbackSentSuccessfully: string;
    feedbackThanks: string;
    visitorCounter: string;
    visitorDetails: string;
    visitorsFrom: string;
    totalVisitors: string;
    visitorActiveNow: string;
    visitorTopCountries: string;
    feedbackTargetItem: string;
    feedbackSelectTarget: string;
    feedbackTargetSetting: string;
    feedbackSelectSetting: string;
    feedbackDetails: string;
    feedbackPlaceholder: string;
    feedbackSending: string;
    feedbackAttachedData: string;
    feedbackErrorSending: string;

    // Mutashabihat Index
    mutashabihatIndex: string;
    searchMutashabihatPlaceholder: string;
    mutashabihatLocations: string;
    loadingTexts: string;
    insideSurahTitle: string;
    noInternalMutashabihat: string;
    showMoreInternal: string;
    outsideSurahTitle: string;
    allSurahs: string;
    noExternalMutashabihat: string;
    showMoreExternal: string;
    ayahWithPositions: string;
    goAction: string;
    similarBadge: string;
    allPositions: string;
    matchedCount: string;
    startRuleDesc: string;
    endRuleDesc: string;
    middleRuleDesc: string;
    addInternalMutashabiha: string;
    addExternalMutashabiha: string;
    mutashabihatContextTip: string;
    searchSurah: string;
    ayahNumber: string;
    ayahRangeError: string;
    add: string;

    // Notification Manager additions
    notificationCategory: string;
    notificationSurahName: string;
    notificationJuzHizb: string;
    notificationPageNumber: string;
    notificationSelectSurah: string;
    pageNumbersRange: string;
    ayahNumbersRange: string;
    startPagePlaceholder: string;
    invalidRangeError: string;
    fromPage: string;
    toPage: string;
    notificationAlert: string;
    notificationNameLabel: string;
    juzHizbRub: string;
    maxPageLabel: string;
    addNotificationAction: string;
    saveChangesAction: string;

    surahNames: string[];
}

const en: Translations = {
    index: 'Index',
    search: 'Search',
    memorizationStats: 'Memorization',
    notifications: 'Notifications',
    darkMode: 'Dark',
    lightMode: 'Light',
    fontSize: 'Font Size',
    bookmark: 'Bookmark',
    settings: 'Settings',
    chooseColor: 'Choose a color',
    showAll: 'Show All',
    hideAll: 'Hide All',
    hideAyahs: 'Hide Ayahs',
    hideWords: 'Hide Words',
    hideRandomAyahs: 'Random Ayahs',
    hideRandomWords: 'Random Words',
    toggleFirstWord: 'First Word',
    toggleLastWord: 'Last Word',
    ayahs: 'Verses',
    stopSignsLabel: 'Stop Signs',
    allWords: 'All Words',
    hideFirstWord: 'Hide First Word',
    showFirstWord: 'Show First Word',
    hideLastWord: 'Hide Last Word',
    showLastWord: 'Show Last Word',
    small: 'Small',
    medium: 'Medium',
    large: 'Large',
    settingsTitle: 'Settings',
    bottomBarCustomization: 'Bottom Bar Customization',
    showInBottomBar: 'Show in Bottom Bar',
    colorThemes: 'Color Themes',
    soundSettings: 'Sound Settings',
    pageFlipSound: 'Page Flip Sound',
    wordAudioLongPress: 'Word sound on long press',
    language: 'Language',
    languages: 'Languages',
    textBrightness: 'Text Brightness',
    backgroundBrightness: 'Background Brightness',
    warmBeige: 'Warm Beige',
    coolWhite: 'Cool White',
    softCream: 'Soft Cream',
    darkBlue: 'Dark Blue',
    pureBlack: 'Pure Black',
    warmDark: 'Warm Dark',
    save: 'Save',
    cancel: 'Cancel',
    close: 'Close',
    loading: 'Loading...',
    error: 'Error',

    // Toast Messages
    firstWordHidden: 'First word hidden',
    firstWordShown: 'First word shown',
    lastWordHidden: 'Last word hidden',
    lastWordShown: 'Last word shown',
    allAyahsHidden: 'All ayahs hidden',
    ayahsHiddenAtStopSigns: 'Ayahs hidden at stop signs',
    randomWordsHidden: 'Random words hidden',
    allWordsHidden: 'All words hidden',
    randomHidden: 'Random hidden',
    weakAyahsHidden: 'Weak memorization ayahs hidden (Red)',
    mediumAyahsHidden: 'Medium memorization ayahs hidden (Yellow)',
    goodAyahsHidden: 'Good memorization ayahs hidden (Green)',
    notMemorizedAyahsHidden: 'Hide Unreviewed Ayahs',
    allAyahsShown: 'All ayahs shown',

    // Misc
    page: 'Page',
    surah: 'Surah',
    verse: 'Verse',
    retry: 'Retry',

    // Surah Index
    juz: 'Juz',
    recentPages: 'Recent Pages',
    pageBookmarks: 'Page Bookmarks',
    noPageBookmarks: 'No page bookmarks',
    verseBookmarks: 'Verse Bookmarks',
    verseBookmarksSection: 'Verse Bookmarks',
    noVerseBookmarks: 'No verse bookmarks',
    delete: 'Delete',
    indexTitle: 'Index',
    guideAction: 'How to use the app (Images)',
    watchVideo: 'Watch Mushaf Video Tutorial',

    // Memorization Stats
    memorizationStatsTitle: 'Memorization Stats',
    fromAyahCount: '(of {count})',
    good: 'Good',
    weak: 'Weak',
    notRated: 'Not Rated',

    // Notification Manager
    notificationManagerTitle: 'Notification Manager',
    noNotifications: 'No notifications. Tap "Add Notification" to start.',
    daily: 'Daily',
    addNotification: 'Add Notification',
    editNotification: 'Edit Notification',
    addNewNotification: 'Add New Notification',
    notificationName: 'Notification Name',
    notificationNamePlaceholder: 'e.g. Daily Reading',
    notificationType: 'Notification Type',
    weekly: 'Weekly',
    selectDays: 'Select Days',
    notificationTimes: 'Notification Times',
    addAnotherTime: 'Add Another Time',
    sunday: 'Sunday',
    monday: 'Monday',
    tuesday: 'Tuesday',
    wednesday: 'Wednesday',
    thursday: 'Thursday',
    friday: 'Friday',
    saturday: 'Saturday',

    // Quran Page Renderer
    hizb: 'Hizb',
    firstRub: 'First Rub',
    secondRub: 'Second Rub',
    thirdRub: 'Third Rub',
    fourthRub: 'Fourth Rub',
    rateAyah: 'Rate Ayah',
    saveAyah: 'Save Ayah',

    // Ayah Options
    ayahOptions: 'Ayah Options {ayah}',
    addBookmark: 'Add Bookmark',
    removeBookmark: 'Remove Bookmark',
    rateMemorization: 'Rate Memorization',
    ayahCopied: 'Ayah copied to clipboard',
    errorCopying: 'Failed to copy ayah',
    tafsirAyah: 'Verse Tafsir',

    // Display Settings Labels
    displaySettings: 'Display Settings',
    defaultFontSize: 'Default Font Size',
    lineSpacingLabel: 'Line Spacing',
    pageMarginsLabel: 'Page Margins',
    prayerMode: 'Prayer Mode',
    selectTheme: 'Select Theme',
    colorStopSigns: 'Color Stop Signs',
    contact: 'Contact Us',
    fullscreen: 'Full Screen',
    exitFullscreen: 'Exit Full Screen',
    minimize: 'Minimize',
    rub: 'Quarter',
    dataError: 'Error loading data',
    help: 'Help & Tutorials',
    howToUse: 'How to use App',
    surahPrefix: 'Surah',
    pageNotAvailable: 'Page not available',
    fontNotLoaded: 'The font for page {page} was not loaded, and there is no internet connection.',
    offlineLoadNotice: 'Please connect to the internet once to load the page.',
    moreSettings: 'More Settings',
    hideDetailedSettings: 'Hide Detailed Settings',
    pageNavigation: 'Navigation Buttons',
    offlineMode: 'Work Offline',
    updateAvailable: 'New update available 🚀',
    updateDescription: 'Includes important improvements and fixes.',
    updateNow: 'Update Now',
    updateLater: 'Update Later',
    installApp: 'Install app on your device',
    downloadMushaf: 'Update/Save complete Mushaf',
    downloadMushafDescription: 'Includes latest edits and layouts (~150MB)',
    updatingMushaf: 'Updating Mushaf files...',
    waitUpdating: 'Please wait until the update completes ({percent}%)',
    downloadSuccess: '✅ Downloaded successfully! App is ready for offline use.',
    developerTools: 'Review tools (For developers)',
    exportReviewData: 'Export review data (CSV)',
    clearAllData: 'Clear all data and old fonts',
    confirmClearData: 'Are you sure? All settings, bookmarks, history, and cache will be deleted.',
    alarmMessage: 'It is time for your Quranic reading',
    stopAlarm: 'Stop Alarm',
    alarmError: '⚠️ Failed to play alarm sound. Please check browser sound permissions.',
    notificationError: '🔔 Reading time! (Sound failed, check browser settings)',
    notificationBodyAlarm: '⚠️ Alarm! It is time for your Quranic reading',
    notificationBodyRegular: 'It is time for your Quranic reading 📖',
    alarmMode: '🔔 Alarm Mode',
    testAlarm: 'Test Alarm 🔔',
    testNotification: 'Test Notification 📖',
    testNotificationBody: 'Notification activated successfully! 🎉',
    permissionRequired: 'Please enable notification permission first via the button below',
    notificationSound: 'Notification Sound',
    presetIslamic: 'Default (Islamic)',
    presetCalm: 'Calm Alert',
    customSound: 'Custom device sound',
    previewSound: 'Preview Sound',
    uploadCustomSound: 'Upload custom sound from device',
    errorPlayingSound: '⚠️ Failed to play sound. File may be unsupported or browser blocked autoplay.',
    enableAlarmMode: 'Enable Alarm Mode',
    alarmModeDescription: 'Sound will continue until you stop it manually',
    deliveryMethod: 'Delivery Method',
    browserNotificationTitle: 'Send Browser/Mobile Notification',
    browserNotificationDescription: 'Receive even if app is in background (requires permission)',
    notificationActive: 'Activated successfully ✅',
    notificationBlocked: 'Blocked by browser settings ❌',
    sendTestNotification: 'Send test notification (Confirm now)',
    searchByPage: 'Search by Page Number',
    searchByAyah: 'Search by Ayah Number',
    selectSurah: 'Select Surah',
    enterPageNumber: 'Enter page number (1 - {max})',
    go: 'Go',
    searchByWord: 'Search in Quran',
    searchPlaceholder: 'Search for a word, verse or Surah name...',
    searching: 'Searching...',
    resultsFound: 'Found {count} results',
    noResultsFound: 'No results found',
    clearAllRatings: 'Clear All Ratings',
    confirmClearTitle: 'Confirm Clear',
    confirmClearMessage: 'Are you sure you want to clear all memorization rating history? This action cannot be undone.',
    confirmYes: 'Yes, clear all',
    cancelMode: 'Cancel Mode',
    prayerModeTitle: 'Prayer Mode - Tap to reveal next word',
    tinyUpdate: 'Update',
    basmallah: 'Basmallah',

    // Gestures
    gestureSettings: 'Touch Gestures',
    gestureTwoFingerTap: 'Two-finger tap (Toggle UI)',
    gestureDoubleTap: 'Double tap (Next Page)',
    gestureSwipeUp: 'Swipe up (Settings)',

    // Mutashabihat
    similarVersesAlert: 'Similar Verses Alert',
    similarVersesDescription: 'This verse has similar verses, be careful not to confuse them while memorizing',
    sourceVerse: 'Source Verse',
    openInIndex: 'Open in Index',
    goToVerse: 'Go to Verse →',
    all: 'All',
    insideSurah: 'Inside Surah',
    outsideSurah: 'Outside Surah',
    similarVersesLabel: 'Similar Verses:',
    noMatchingVerses: 'No matching verses found',
    reportError: 'Report Error',
    report: 'Report',
    addSimilarAyah: 'Add Similar Ayah',

    // Verse Calculator
    verseCalculatorTitle: 'Verse Calculator',
    startPoint: 'Start Point',
    endPoint: 'End Point',
    calculate: 'Calculate',
    verseCount: 'Verse Count:',
    invalidRange: 'Invalid Range',
    modeRange: 'Custom Range',
    modeStructure: 'Quran Structure',
    selectStructure: 'Select:',
    juzType: 'Juz',
    hizbType: 'Hizb',
    rubType: 'Rub',
    strong: 'Strong',

    // Surah Rating
    rateSurah: 'Rate Surah',
    rateRange: 'Rate Range',
    fromAyah: 'From Ayah',
    toAyah: 'To Ayah',
    applyRating: 'Apply Rating to Range',
    pleaseSelectRating: 'Please select a rating',
    ayahNumberBetween: 'Ayah number must be between 1 and {count}',
    startMustBeLess: 'From must be less than or equal to To',

    // Help Slides
    helpSlide1Title: "Welcome to My Quran",
    helpSlide1Desc: "Your comprehensive tool for memorizing and reviewing the Holy Quran with modern interactive features.",
    helpSlide2Title: "Interact with Verses & Words",
    helpSlide2Desc: "Tap any word to hide it and test your memory. You can hide random verses or use Prayer Mode for recitation.",
    helpSlide3Title: "Complete Customization",
    helpSlide3Desc: "Control font size, colors, brightness, and daily reading notifications from settings to suit your needs.",
    helpSlide4Title: "Ready to Start?",
    helpSlide4Desc: 'Explore more features yourself. We are here to help you in your journey with the Holy Quran.',

    interfaceTab: 'Interface Guide',
    settingsTab: 'Settings Guide',
    clickToZoom: 'Tap image to enlarge',
    closeGuide: 'Close Guide',
    next: 'Next',
    previous: 'Previous',
    guideStart: 'Getting Started',
    guideVerseVisibility: 'Verse Visibility Controls',
    guideWordVisibility: 'Word Visibility Controls',
    guideQuranUI: 'Mutashabihat and Rating Buttons',
    guideSettingsTools: 'Settings & Tools',
    guideIndex: 'Index',
    guideSearch: 'Search in Mushaf',
    guideMemorizationStats: 'Memorization Strength Stats',
    guideNotifications: 'Notifications & Alerts',
    guideMutashabihat: 'Mutashabihat Guide',
    guideVerseCalculator: 'Verse Calculator',
    guidePrayerMode: 'Prayer Mode',
    guideNotes: 'Notes',

    showSimilarVersesIndicators: 'Show Mutashabihat Indicators',
    similarVersesIndicatorsDesc: 'Colored lines under ayah numbers',

    // Feedback
    feedback: 'Feedback',
    sendFeedback: 'Send Feedback',
    feedbackInterfaceNotes: 'Interface Notes',
    feedbackSettingsNotes: 'Settings Notes',
    feedbackBugTech: 'Technical Bug',
    feedbackSuggestion: 'Suggestion / Improvement',
    feedbackSentSuccessfully: 'Sent Successfully!',
    feedbackThanks: 'Thank you for your contribution to improving the app.',
    visitorCounter: 'Visitor Counter',
    visitorDetails: 'Visitor Details',
    visitorsFrom: 'Visitors from',
    totalVisitors: 'Total Visitors',
    visitorActiveNow: 'Active Now',
    visitorTopCountries: 'Top Countries',
    feedbackTargetItem: 'What is the item that has notes?',
    feedbackSelectTarget: 'Select item...',
    feedbackTargetSetting: 'What is the setting causing the problem?',
    feedbackSelectSetting: 'Select setting...',
    feedbackDetails: 'Feedback Details',
    feedbackPlaceholder: 'Explain the problem or suggestion in detail...',
    feedbackSending: 'Sending...',
    feedbackAttachedData: 'Attached Data:',
    feedbackErrorSending: 'An error occurred while sending the feedback. Please try again.',

    // Mutashabihat Index
    mutashabihatIndex: 'Mutashabihat Index',
    searchMutashabihatPlaceholder: 'Search in Surah or Mutashabihat...',
    mutashabihatLocations: '{count} Mutashabihat locations',
    loadingTexts: 'Loading texts...',
    insideSurahTitle: 'Mutashabihat inside Surah {surah}',
    noInternalMutashabihat: 'No internal mutashabihat recorded',
    showMoreInternal: 'Show more internal mutashabihat (+{count})',
    outsideSurahTitle: 'Mutashabihat with other Surahs',
    allSurahs: 'All Surahs',
    noExternalMutashabihat: 'No external mutashabihat recorded',
    showMoreExternal: 'Show more external mutashabihat (+{count})',
    ayahWithPositions: 'Ayah {number} [{count} positions]',
    goAction: 'Go',
    similarBadge: 'Similar',
    allPositions: 'positions',
    matchedCount: 'matches',
    startRuleDesc: 'Green indicates similarity at the beginning of ayahs',
    endRuleDesc: 'Red indicates similarity at the end of ayahs',
    middleRuleDesc: 'Blue indicates similarity in the middle of ayahs',
    addInternalMutashabiha: 'Add internal mutashabiha',
    addExternalMutashabiha: 'Add external mutashabiha',
    mutashabihatContextTip: 'Long press hidden word to reveal sequence up to next stop sign.',
    searchSurah: 'Search surah...',
    ayahNumber: 'Ayah Number',
    ayahRangeError: 'Ayah must be between 1 and {max}',
    add: 'Add',

    // Notification Manager Additions
    notificationCategory: 'Notification Type',
    notificationSurahName: 'Surah Name',
    notificationJuzHizb: 'Juz & Hizb',
    notificationPageNumber: 'Page Number',
    notificationSelectSurah: 'Select Surah',
    pageNumbersRange: 'Page Numbers (from - to)',
    ayahNumbersRange: 'Ayah Numbers (from - to)',
    startPagePlaceholder: 'Start',
    invalidRangeError: 'Invalid',
    fromPage: 'From Page',
    toPage: 'To Page',
    notificationAlert: 'Alert',
    notificationNameLabel: 'Notification Name',
    juzHizbRub: 'Juz / Hizb / Quarter',
    maxPageLabel: 'Page Numbers (604 max)',
    addNotificationAction: 'Add Notification',
    saveChangesAction: 'Save Changes',

    surahNames: [
        'Al-Fatihah', 'Al-Baqarah', 'Ali \'Imran', 'An-Nisa\'', 'Al-Ma\'idah', 'Al-An\'am', 'Al-A\'raf', 'Al-Anfal', 'At-Tawbah', 'Yunus',
        'Hud', 'Yusuf', 'Ar-Ra\'d', 'Ibrahim', 'Al-Hijr', 'An-Nahl', 'Al-Isra\'', 'Al-Kahf', 'Maryam', 'Ta-Ha',
        'Al-Anbiya\'', 'Al-Hajj', 'Al-Mu\'minun', 'An-Nur', 'Al-Furqan', 'Ash-Shu\'ara\'', 'An-Naml', 'Al-Qasas', 'Al-\'Ankabut', 'Ar-Rum',
        'Luqman', 'As-Sajdah', 'Al-Ahzab', 'Saba\'', 'Fatir', 'Ya-Sin', 'As-Saffat', 'Sad', 'Az-Zumar', 'Ghafir',
        'Fussilat', 'Ash-Shura', 'Az-Zukhruf', 'Ad-Dukhan', 'Al-Jathiyah', 'Al-Ahqaf', 'Muhammad', 'Al-Fath', 'Al-Hujurat', 'Qaf',
        'Adh-Dhariyat', 'At-Tur', 'An-Najm', 'Al-Qamar', 'Ar-Rahman', 'Al-Waqi\'ah', 'Al-Hadid', 'Al-Mujadilah', 'Al-Hashr', 'Al-Mumtahanah',
        'As-Saff', 'Al-Jumu\'ah', 'Al-Munafiqun', 'At-Taghabun', 'At-Talaq', 'At-Tahrim', 'Al-Mulk', 'Al-Qalam', 'Al-Haqqah', 'Al-Ma\'arij',
        'Nuh', 'Al-Jinn', 'Al-Muzzammil', 'Al-Muddaththir', 'Al-Qiyamah', 'Al-Insan', 'Al-Mursalat', 'An-Naba\'', 'An-Nazi\'at', '\'Abasa',
        'At-Takwir', 'Al-Infitar', 'Al-Mutaffifin', 'Al-Inshiqaq', 'Al-Buruj', 'At-Tariq', 'Al-A\'la', 'Al-Ghashiyah', 'Al-Fajr', 'Al-Balad',
        'Ash-Shams', 'Al-Layl', 'Ad-Duha', 'Ash-Sharh', 'At-Tin', 'Al-\'Alaq', 'Al-Qadr', 'Al-Bayyinah', 'Az-Zalzalah', 'Al-\'Adiyat',
        'Al-Qari\'ah', 'At-Takathur', 'Al-\'Asr', 'Al-Humazah', 'Al-Fil', 'Quraysh', 'Al-Ma\'un', 'Al-Kawthar', 'Al-Kafirun', 'An-Nasr',
        'Al-Masad', 'Al-Ikhlas', 'Al-Falaq', 'An-Nas'
    ]
};

export const translations: Record<Language, Translations> = {
    ar: {
        index: 'الفهرس',
        search: 'بحث',
        memorizationStats: 'قوة الحفظ',
        notifications: 'إشعارات',
        darkMode: 'ليلي',
        lightMode: 'نهاري',
        fontSize: 'حجم الخط',
        bookmark: 'مرجعية',
        settings: 'الإعدادات',
        chooseColor: 'اختر لوناً',
        showAll: 'ظهور الكل',
        hideAll: 'إخفاء الكل',
        hideAyahs: 'إخفاء آيات',
        hideWords: 'إخفاء الكلمات',
        hideRandomAyahs: 'آيات عشوائية',
        hideRandomWords: 'كلمات عشوائية',
        toggleFirstWord: 'أول كلمة',
        toggleLastWord: 'آخر كلمة',
        ayahs: 'الآيات',
        stopSignsLabel: 'علامات الوقف',
        allWords: 'كل الكلمات',
        hideFirstWord: 'إخفاء أول كلمة',
        showFirstWord: 'إظهار أول كلمة',
        hideLastWord: 'إخفاء آخر كلمة',
        showLastWord: 'إظهار آخر كلمة',
        small: 'صغير',
        medium: 'وسط',
        large: 'كبير',
        settingsTitle: 'الإعدادات',
        bottomBarCustomization: 'تخصيص القائمة السفلية',
        showInBottomBar: 'إظهار في القائمة السفلية',
        colorThemes: 'الألوان والثيمات',
        soundSettings: 'إعدادات الصوت',
        pageFlipSound: 'صوت تقليب الصفحة',
        wordAudioLongPress: 'صوت الكلمة عند الضغط المطول',
        language: 'اللغة',
        languages: 'اللغات',
        textBrightness: 'إضاءة الخط',
        backgroundBrightness: 'إضاءة الخلفية',

        // Gestures
        gestureSettings: 'إيماءات اللمس (للموبايل والتابلت)',
        gestureTwoFingerTap: 'ضغط بإصبعين (ظهور القائمة)',
        gestureDoubleTap: 'ضغط مزدوج (الصفحة التالية)',
        gestureSwipeUp: 'سحب للأعلى (الإعدادات)',
        warmBeige: 'بيج دافئ',
        coolWhite: 'أبيض بارد',
        softCream: 'كريمي ناعم',
        darkBlue: 'أزرق داكن',
        pureBlack: 'أسود نقي',
        warmDark: 'داكن دافئ',
        save: 'حفظ',
        cancel: 'إلغاء',
        close: 'إغلاق',
        loading: 'جاري التحميل...',
        error: 'خطأ',

        // Toast Messages
        firstWordHidden: 'تم إخفاء أول كلمة',
        firstWordShown: 'تم إظهار أول كلمة',
        lastWordHidden: 'تم إخفاء آخر كلمة',
        lastWordShown: 'تم إظهار آخر كلمة',
        allAyahsHidden: 'تم إخفاء جميع الآيات',
        ayahsHiddenAtStopSigns: 'تم إخفاء الآيات عند علامات الوقف',
        randomWordsHidden: 'إخفاء كلمات عشوائيًا',
        allWordsHidden: 'إخفاء كل الكلمات',
        randomHidden: 'إخفاء عشوائي',
        weakAyahsHidden: 'إخفاء الآيات ضعيفة الحفظ (أحمر)',
        mediumAyahsHidden: 'إخفاء الآيات متوسطة الحفظ (أصفر)',
        goodAyahsHidden: 'إخفاء الآيات الجيدة (أخضر)',
        notMemorizedAyahsHidden: 'إخفاء الآيات الغير مراجعة',
        allAyahsShown: 'إظهار جميع الآيات',

        // Misc
        page: 'صفحة',
        surah: 'سورة',
        retry: 'إعادة المحاولة',

        // Surah Index
        juz: 'جزء',
        recentPages: 'آخر المتصفحات',
        pageBookmarks: 'مرجعيات الصفحات',
        noPageBookmarks: 'لا يوجد صفحات محفوظة',
        verseBookmarks: 'مرجعيات',
        verseBookmarksSection: 'مرجعيات الآيات',
        noVerseBookmarks: 'لا يوجد آيات محفوظة',
        delete: 'حذف',
        indexTitle: 'الفهرس',
        guideAction: 'شرح استخدام المصحف (بالصور)',
        watchVideo: 'فيديو شرح المصحف',

        // Memorization Stats
        memorizationStatsTitle: 'إحصائيات قوة الحفظ',
        fromAyahCount: '(من {count})',
        good: 'جيد',
        weak: 'ضعيف',
        notRated: 'غير مقيّم',

        // Notification Manager
        notificationManagerTitle: 'إدارة الإشعارات',
        noNotifications: 'لا توجد إشعارات. اضغط على "إضافة إشعار" للبدء.',
        daily: 'يومي',
        addNotification: 'إضافة إشعار',
        editNotification: 'تعديل الإشعار',
        addNewNotification: 'إضافة إشعار جديد',
        notificationName: 'اسم الإشعار',
        notificationNamePlaceholder: 'مثال: قراءة الورد اليومي',
        notificationType: 'نوع الإشعار',
        weekly: 'أسبوعي',
        selectDays: 'اختر الأيام',
        notificationTimes: 'أوقات الإشعار',
        addAnotherTime: 'إضافة وقت آخر',
        sunday: 'الأحد',
        monday: 'الاثنين',
        tuesday: 'الثلاثاء',
        wednesday: 'الأربعاء',
        thursday: 'الخميس',
        friday: 'الجمعة',
        saturday: 'السبت',

        // Quran Page Renderer
        hizb: 'الحزب',
        firstRub: 'الربع الأول',
        secondRub: 'الربع الثاني',
        thirdRub: 'الربع الثالث',
        fourthRub: 'الربع الرابع',
        rateAyah: 'تقييم الآية',
        saveAyah: 'حفظ الآية',
        verse: 'آية',

        // Ayah Options
        ayahOptions: 'خيارات الآية {ayah}',
        addBookmark: 'إضافة مرجعية',
        removeBookmark: 'إزالة المرجعية',
        rateMemorization: 'تقييم الحفظ',
        ayahCopied: 'تم نسخ الآية للحافظة',
        errorCopying: 'فشل نسخ الآية',
        tafsirAyah: 'تفسير الآية',

        // Display Settings Labels
        displaySettings: 'إعدادات العرض',
        defaultFontSize: 'حجم الخط الافتراضي',
        lineSpacingLabel: 'تباعد الأسطر',
        pageMarginsLabel: 'هوامش الصفحة',
        prayerMode: 'وضع الصلاة',
        selectTheme: 'اختر نمط الألوان',
        colorStopSigns: 'تلوين علامات الوقف',
        contact: 'للتواصل',
        fullscreen: 'ملء الشاشة',
        exitFullscreen: 'خروج من ملء الشاشة',
        minimize: 'تصغير',
        rub: 'الربع',
        dataError: 'خطأ في تحميل البيانات',
        help: 'المساعدة والتعليمات',
        howToUse: 'كيفية استخدام مصحف المراجعة',
        surahPrefix: 'سورة',
        pageNotAvailable: 'الصفحة غير متوفرة',
        fontNotLoaded: 'لم يتم تحميل خط صفحة {page} مسبقاً، ولا يوجد اتصال بالإنترنت حالياً.',
        offlineLoadNotice: 'يرجى الاتصال بالإنترنت لمرة واحدة لتحميل الصفحة.',
        moreSettings: 'المزيد من الإعدادات',
        hideDetailedSettings: 'إخفاء باقي الإعدادات',
        pageNavigation: 'أزرار التصفح',
        offlineMode: 'العمل بدون إنترنت (Offline)',
        updateAvailable: 'يتوفر تحديث جديد للمصحف بدون إنترنت 🚀',
        updateDescription: 'يتضمن تحسينات هامة وإصلاح المشاكل فقط.',
        updateNow: 'تحديث الآن',
        updateLater: 'التحديث لاحقاً',
        installApp: 'تثبيت الموقع على جهازك',
        downloadMushaf: 'تحديث/حفظ المصحف كاملاً',
        downloadMushafDescription: 'يتضمن آخر التعديلات والتنسيقات (~150MB)',
        updatingMushaf: 'جاري تحديث ملفات المصحف...',
        waitUpdating: 'يرجى الانتظار حتى يكتمل التحديث ({percent}%)',
        downloadSuccess: '✅ تم التحميل بنجاح! الموقع جاهز للاستخدام بدون إنترنت.',
        developerTools: 'أدوات المراجعة (للمطورين)',
        exportReviewData: 'تصدير بيانات المراجعة (CSV)',
        clearAllData: 'مسح جميع البيانات والخطوط القديمة',
        confirmClearData: 'هل أنت متأكد؟ سيتم حذف جميع الإعدادات والعلامات المرجعية والسجل وذاكرة التخزين المؤقت.',
        alarmMessage: 'حان الآن الموعد المحدد لوردك القرآني',
        stopAlarm: 'إيقاف المنبه',
        alarmError: '⚠️ فشل تشغيل صوت المنبه. يرجى التأكد من إذن الصوت في المتصفح.',
        notificationError: '🔔 موعد الورد! (فشل تشغيل الصوت، تأكد من إعدادات المتصفح)',
        notificationBodyAlarm: '⚠️ منبه! حان الآن موعد وردك القرآني',
        notificationBodyRegular: 'حان الآن موعد وردك القرآني 📖',
        alarmMode: '🔔 وضع المنبه',
        testAlarm: 'تجربة المنبه 🔔',
        testNotification: 'تجربة الإشعارات 📖',
        testNotificationBody: 'تم تفعيل التنبيه بنجاح! 🎉',
        permissionRequired: 'يرجى تفعيل إذن الإشعارات أولاً عبر الزر في الأسفل',
        notificationSound: 'نغمة التنبيه',
        presetIslamic: 'افتراضي (إسلامي)',
        presetCalm: 'تنبيه هادئ',
        customSound: 'نغمة مخصصة من الجهاز',
        previewSound: 'معاينة الصوت',
        uploadCustomSound: 'رفع نغمة مخصصة من الجهاز',
        errorPlayingSound: '⚠️ فشل تشغيل الصوت. قد يكون الملف غير مدعوم أو المتصفح يمنع التشغيل التلقائي.',
        enableAlarmMode: 'تفعيل وضع المنبه',
        alarmModeDescription: 'سيستمر الصوت في العمل حتى تقوم بإيقافه يدوياً',
        deliveryMethod: 'طريقة الاستلام',
        browserNotificationTitle: 'إرسال إشعار للمتصفح / الموبايل',
        browserNotificationDescription: 'يصلك حتى لو الموقع في الخلفية (يتطلب إذن)',
        notificationActive: 'مفعل بنجاح ✅',
        notificationBlocked: 'محجوب من إعدادات المتصفح ❌',
        sendTestNotification: 'إرسال إشعار تجريبي (تأكد الآن)',
        tinyUpdate: 'تحديث',
        basmallah: 'البسملة',
        searchByPage: 'البحث برقم الصفحة',
        searchByAyah: 'البحث برقم الآية',
        selectSurah: 'اختر السورة',
        enterPageNumber: 'أدخل رقم الصفحة (١ - {max})',
        go: 'انتقال',
        searchByWord: 'البحث في القرآن',
        searchPlaceholder: 'ابحث عن كلمة او اية او اسم السورة...',
        searching: 'جاري البحث...',
        resultsFound: 'تم العثور على {count} نتيجة',
        noResultsFound: 'لم يتم العثور على نتائج',
        clearAllRatings: 'مسح جميع التقييمات',
        confirmClearTitle: 'تأكيد المسح',
        confirmClearMessage: 'هل أنت متأكد من رغبتك في مسح جميع سجلات تقييم الحفظ؟ هذا الإجراء لا يمكن التراجع عنه.',
        confirmYes: 'نعم، امسح الكل',
        cancelMode: 'إلغاء الوضع',
        prayerModeTitle: 'وضع الصلاة - اضغط لكشف الكلمة التالية',

        // Mutashabihat
        similarVersesAlert: 'دليل المتشابهات',
        similarVersesDescription: 'هذه الآية لها آيات متشابهة معها، احذر من الخلط بينها عند الحفظ',
        sourceVerse: 'الآية المصدر',
        openInIndex: 'فتح في الدليل',
        goToVerse: 'الذهاب للآية ←',
        all: 'الكل',
        insideSurah: 'داخل السورة',
        outsideSurah: 'خارج السورة',
        similarVersesLabel: 'الآيات المتشابهة:',
        noMatchingVerses: 'لا توجد آيات مطابقة لهذا التصنيف',
        reportError: 'الإبلاغ عن خطأ',
        report: 'إبلاغ',
        addSimilarAyah: 'إضافة آية متشابهة',
        searchSurah: 'بحث عن سورة...',
        ayahNumber: 'رقم الآية',
        ayahRangeError: 'رقم الآية يجب أن يكون بين ١ و {max}',
        add: 'إضافة',

        // Feedback
        feedback: 'ملاحظات',
        sendFeedback: 'إرسال ملاحظة',
        feedbackInterfaceNotes: 'ملاحظات في الواجهة',
        feedbackSettingsNotes: 'ملاحظات في الإعدادات',
        feedbackBugTech: 'مشكلة تقنية',
        feedbackSuggestion: 'اقتراح / تحسين',
        feedbackSentSuccessfully: 'تم الإرسال بنجاح!',
        feedbackThanks: 'شكرًا لمساهمتك في تحسين الموقع.',
        feedbackTargetItem: 'ما هو العنصر الذي عليه ملاحظة؟',
        feedbackSelectTarget: 'اختر العنصر...',
        feedbackTargetSetting: 'ما هو الإعداد الذي فيه المشكلة؟',
        feedbackSelectSetting: 'اختر الإعداد...',
        feedbackDetails: 'تفاصيل الملاحظة',
        feedbackPlaceholder: 'اشرح المشكلة أو الاقتراح بالتفصيل...',
        feedbackSending: 'جاري الإرسال...',
        feedbackAttachedData: 'بيانات مرفقة:',
        feedbackErrorSending: 'حدث خطأ أثناء إرسال الملاحظة. يرجى المحاولة مرة أخرى.',

        // Mutashabihat Index
        mutashabihatIndex: 'دليل المتشابهات',
        searchMutashabihatPlaceholder: 'بحث في السورة أو المتشابهات...',
        mutashabihatLocations: '{count} موضع للمتشابهات',
        loadingTexts: 'جاري تحميل النصوص...',
        insideSurahTitle: 'متشابهات داخل سورة {surah}',
        noInternalMutashabihat: 'لا توجد متشابهات داخلية مسجلة',
        showMoreInternal: 'إظهار المزيد من المتشابهات الداخلية (+{count})',
        outsideSurahTitle: 'متشابهات مع سور أخرى',
        allSurahs: 'كل السور',
        noExternalMutashabihat: 'لا توجد متشابهات خارجية مسجلة',
        showMoreExternal: 'إظهار المزيد من المتشابهات الخارجية (+{count})',
        ayahWithPositions: 'آية {number} [{count} مواضع]',
        goAction: 'اذهب',
        similarBadge: 'متشابهة',
        allPositions: 'مواضع',
        matchedCount: 'نتيجة',
        startRuleDesc: 'اللون الأخضر للمتشابه في بداية الآيات',
        endRuleDesc: 'اللون الأحمر للمتشابه في نهاية الآيات',
        middleRuleDesc: 'اللون الأزرق للمتشابه في وسط الآيات',
        addInternalMutashabiha: 'إضافة متشابهة داخل السورة',
        addExternalMutashabiha: 'إضافة متشابهة من خارج السورة',
        mutashabihatContextTip: 'اضغط طويلاً على الكلمة المخفية لإظهار السياق حتى علامة الوقف التالية.',

        // Notification Manager Additions
        notificationCategory: 'نوع الإشعار',
        notificationSurahName: 'اسم السورة',
        notificationJuzHizb: 'الجزء والحزب',
        notificationPageNumber: 'رقم الصفحة',
        notificationSelectSurah: 'اختر السورة',
        pageNumbersRange: 'أرقام الصفحات (من - إلى)',
        ayahNumbersRange: 'أرقام الآيات (من - إلى)',
        startPagePlaceholder: 'البداية',
        invalidRangeError: 'غير صحيح',
        fromPage: 'من صفحة',
        toPage: 'إلى صفحة',
        notificationAlert: 'تنبيه',
        notificationNameLabel: 'اسم التنبيه',
        juzHizbRub: 'الجزء / الحزب / الربع',
        maxPageLabel: 'أرقام الصفحات (٦٠٤ صفحة كحد أقصى)',
        addNotificationAction: 'إضافة التنبيه',
        saveChangesAction: 'حفظ التغييرات',

        // Verse Calculator
        verseCalculatorTitle: 'حاسبة الآيات',
        startPoint: 'بداية النطاق',
        endPoint: 'نهاية النطاق',
        calculate: 'حساب',
        verseCount: 'عدد الآيات:',
        invalidRange: 'تأكد من تركيب النطاق الصحيح',
        modeRange: 'نطاق حر',
        modeStructure: 'أجزاء وأحزاب',
        selectStructure: 'اختر:',
        juzType: 'جزء',
        hizbType: 'حزب',
        rubType: 'ربع',
        strong: 'ممتاز',

        // Surah Rating
        rateSurah: 'تقييم السورة',
        rateRange: 'تقييم نطاق',
        fromAyah: 'من آية',
        toAyah: 'إلى آية',
        applyRating: 'تطبيق التقييم على النطاق',
        pleaseSelectRating: 'يرجى اختيار تقييم',
        ayahNumberBetween: 'رقم الآية يجب أن يكون بين 1 و {count}',
        startMustBeLess: 'رقم البداية يجب أن يكون أقل من أو يساوي رقم النهاية',

        // Help Slides
        helpSlide1Title: "مرحباً بك في موقعي (My Quran)",
        helpSlide1Desc: "موقعك الشامل لحفظ ومراجعة القرآن الكريم بمميزات تفاعلية حديثة وتصميم مريح للعين.",
        helpSlide2Title: "تفاعل مع الآيات والكلمات",
        helpSlide2Desc: "اضغط على أي كلمة لإخفائها واختبار حفظك. يمكنك إخفاء الآيات عشوائياً أو استخدام وضع الصلاة للتسميع.",
        helpSlide3Title: "تخصيص كامل",
        helpSlide3Desc: "تحكم في حجم الخط، الألوان، الإضاءة، وإشعارات الورد اليومي من الإعدادات لتناسب احتياجاتك.",
        helpSlide4Title: "جاهز للبدء؟",
        helpSlide4Desc: "استكشف المزيد من المميزات بنفسك. نحن هنا لمساعدتك في رحلتك مع القرآن الكريم.",

        interfaceTab: 'شرح الواجهة',
        settingsTab: 'دليل الإعدادات',
        clickToZoom: 'اضغط على الصورة للتكبير',
        closeGuide: 'إغلاق الدليل',
        next: 'التالي',
        previous: 'السابق',
        guideStart: 'البداية',
        guideVerseVisibility: 'أزرار إخفاء وإظهار الآيات',
        guideWordVisibility: 'أزرار إخفاء وإظهار الكلمات',
        guideQuranUI: 'أزرار المتشابهات والتقييم',
        guideSettingsTools: 'قائمة الإعدادات والأدوات',
        guideIndex: 'الفهرس',
        guideSearch: 'البحث في المصحف',
        guideMemorizationStats: 'إحصائيات قوة الحفظ',
        guideNotifications: 'الإشعارات والتنبيهات',
        guideMutashabihat: 'دليل المتشابهات',
        guideVerseCalculator: 'حاسبة الآيات',
        guidePrayerMode: 'وضع الصلاة',
        guideNotes: 'الملاحظات',
        showSimilarVersesIndicators: 'إظهار علامات المتشابھات',
        similarVersesIndicatorsDesc: 'الخطوط الملونة تحت أرقام الآيات',
        visitorCounter: 'عداد الزوار',
        visitorDetails: 'تفاصيل الزوار',
        visitorsFrom: 'زوار من',
        totalVisitors: 'إجمالي الزوار',
        visitorActiveNow: 'نشط الآن',
        visitorTopCountries: 'أكثر الدول زيارة',
        surahNames: [
            'الفاتحة', 'البقرة', 'آل عمران', 'النساء', 'المائدة', 'الأنعام', 'الأعراف', 'الأنفال', 'التوبة', 'يونس',
            'هود', 'يوسف', 'الرعد', 'إبراهيم', 'الحجر', 'النحل', 'الإسراء', 'الكهف', 'مريم', 'طه',
            'الأنبياء', 'الحج', 'المؤمنون', 'النور', 'الفرقان', 'الشعراء', 'النمل', 'القصص', 'العنكبوت', 'الروم',
            'لقمان', 'السجدة', 'الأحزاب', 'سبأ', 'فاطر', 'يس', 'الصافات', 'ص', 'الزمر', 'غافر',
            'فصلت', 'الشورى', 'الزخرف', 'الدخان', 'الجاثية', 'الأحقاف', 'محمد', 'الفتح', 'الحجرات', 'ق',
            'الذاريات', 'الطور', 'النجم', 'القمر', 'الرحمن', 'الواقعة', 'الحديد', 'المجادلة', 'الحشر', 'الممتحنة',
            'الصف', 'الجمعة', 'المنافقون', 'التغابن', 'الطلاق', 'التحريم', 'الملك', 'القلم', 'الحاقة', 'المعارج',
            'نوح', 'الجن', 'المزمل', 'المدثر', 'القيامة', 'الإنسان', 'المرسلات', 'النبأ', 'النازعات', 'عبس',
            'التكوير', 'الانفطار', 'المطففين', 'الانشقاق', 'البروج', 'الطارق', 'الأعلى', 'الغاشية', 'الفجر', 'البلد',
            'الشمس', 'الليل', 'الضحى', 'الشرح', 'التين', 'العلق', 'القدر', 'البينة', 'الزلزلة', 'العاديات',
            'القارعة', 'التكاثر', 'العصر', 'الهمزة', 'الفيل', 'قريش', 'الماعون', 'الكوثر', 'الكافرون', 'النصر',
            'المسد', 'الإخلاص', 'الفلق', 'الناس'
        ]
    },
    en: en,
    id: {
        ...en,
        index: 'Indeks',
        search: 'Cari',
        memorizationStats: 'Hafalan',
        notifications: 'Pemberitahuan',
        darkMode: 'Gelap',
        lightMode: 'Terang',
        fontSize: 'Ukuran Font',
        bookmark: 'Tandai',
        settings: 'Pengaturan',
        showAll: 'Tampilkan Semua',
        hideAll: 'Sembunyikan Semua',
        hideRandomAyahs: 'Ayat Acak',
        hideRandomWords: 'Kata Acak',
        toggleFirstWord: 'Kata Pertama',
        toggleLastWord: 'Kata Terakhir',
        hideAyahs: 'Sembunyi Ayat',
        hideWords: 'Sembunyi Kata',
        ayahs: 'Ayat',
        stopSignsLabel: 'Tanda Waqaf',
        allWords: 'Semua Kata',
        hideFirstWord: 'Sembunyi Kata Pertama',
        showFirstWord: 'Tampilkan Kata Pertama',
        hideLastWord: 'Sembunyi Kata Terakhir',
        showLastWord: 'Tampilkan Kata Terakhir',
        small: 'Kecil',
        medium: 'Sedang',
        large: 'Besar',
        settingsTitle: 'Pengaturan',
        bottomBarCustomization: 'Kustomisasi Bar Bawah',
        showInBottomBar: 'Tampilkan di Bar Bawah',
        colorThemes: 'Tema Warna',
        soundSettings: 'Pengaturan Suara',
        pageFlipSound: 'Suara Balik Halaman',
        wordAudioLongPress: 'Suara kata pada tekan lama',
        language: 'Bahasa',
        languages: 'Bahasa',
        textBrightness: 'Kecerahan Teks',
        backgroundBrightness: 'Kecerahan Latar',
        warmBeige: 'Beige Hangat',
        coolWhite: 'Putih Sejuk',
        softCream: 'Krim Lembut',
        darkBlue: 'Biru Gelap',
        pureBlack: 'Hitam Murni',
        warmDark: 'Gelap Hangat',
        save: 'Simpan',
        cancel: 'Batal',
        close: 'Tutup',
        loading: 'Memuat...',
        error: 'Kesalahan',
        // Toast Messages
        firstWordHidden: 'Kata pertama disembunyikan',
        firstWordShown: 'Kata pertama ditampilkan',
        lastWordHidden: 'Kata terakhir disembunyikan',
        lastWordShown: 'Kata terakhir ditampilkan',
        allAyahsHidden: 'Semua ayat disembunyikan',
        ayahsHiddenAtStopSigns: 'Ayat disembunyikan di tanda waqaf',
        randomWordsHidden: 'Kata acak disembunyikan',
        allWordsHidden: 'Semua kata disembunyikan',
        randomHidden: 'Acak disembunyikan',
        weakAyahsHidden: 'Ayat hafalan lemah disembunyikan (Merah)',
        mediumAyahsHidden: 'Ayat hafalan sedang disembunyikan (Kuning)',
        goodAyahsHidden: 'Ayat hafalan baik disembunyikan (Hijau)',
        notMemorizedAyahsHidden: 'Sembunyi Ayat Belum Direview',
        allAyahsShown: 'Semua ayat ditampilkan',

        // Misc
        page: 'Halaman',
        surah: 'Surah',
        retry: 'Coba Lagi',

        // Surah Index
        juz: 'Juz',
        recentPages: 'Halaman Terakhir',
        pageBookmarks: 'Penanda Halaman',
        noPageBookmarks: 'Tidak ada penanda halaman',
        verseBookmarks: 'Penanda Ayat',
        noVerseBookmarks: 'Tidak ada penanda ayat',
        delete: 'Hapus',
        indexTitle: 'Indeks',

        // Memorization Stats
        memorizationStatsTitle: 'Statistik Hafalan',
        fromAyahCount: '(dari {count})',
        good: 'Baik',
        weak: 'Lemah',
        notRated: 'Belum Dinilai',

        // Notification Manager
        notificationManagerTitle: 'Manajer Notifikasi',
        noNotifications: 'Tidak ada notifikasi. Ketuk "Tambah Notifikasi" untuk memulai.',
        daily: 'Harian',
        addNotification: 'Tambah Notifikasi',
        editNotification: 'Edit Notifikasi',
        addNewNotification: 'Tambah Notifikasi Baru',
        notificationName: 'Nama Notifikasi',
        notificationNamePlaceholder: 'cth. Bacaan Harian',
        notificationType: 'Jenis Notifikasi',
        weekly: 'Mingguan',
        selectDays: 'Pilih Hari',
        notificationTimes: 'Waktu Notifikasi',
        addAnotherTime: 'Tambah Waktu Lain',
        sunday: 'Minggu',
        monday: 'Senin',
        tuesday: 'Selasa',
        wednesday: 'Rabu',
        thursday: 'Kamis',
        friday: 'Jumat',
        saturday: 'Sabtu',

        // Quran Page Renderer
        hizb: 'Hizb',
        firstRub: 'Rub Pertama',
        secondRub: 'Rub Kedua',
        thirdRub: 'Rub Ketiga',
        fourthRub: 'Rub Keempat',
        rateAyah: 'Nilai Ayat',
        saveAyah: 'Simpan Ayat',

        // Ayah Options
        ayahOptions: 'Opsi Ayat {ayah}',
        addBookmark: 'Tambah Penanda',
        removeBookmark: 'Hapus Penanda',
        rateMemorization: 'Nilai Hafalan',

        // Display Settings Labels
        displaySettings: 'Pengaturan Tampilan',
        defaultFontSize: 'Ukuran Font Default',
        lineSpacingLabel: 'Spasi Baris',
        pageMarginsLabel: 'Margin Halaman',
        prayerMode: 'Mode Shalat',
        rub: 'Rub',
        dataError: 'Kesalahan memuat data',
        help: 'Bantuan',
        howToUse: 'Cara Menggunakan',
        surahPrefix: 'Surah',
        offlineLoadNotice: 'Please connect to the internet once to load the page.',
    },
    ms: {
        ...en,
        index: 'Indeks',
        search: 'Cari',
        memorizationStats: 'Hafazan',
        notifications: 'Pemberitahuan',
        darkMode: 'Gelap',
        lightMode: 'Terang',
        fontSize: 'Saiz Fon',
        bookmark: 'Tanda Buku',
        settings: 'Tetapan',
        showAll: 'Tunjuk Semua',
        hideAll: 'Sorok Semua',
        hideRandomAyahs: 'Ayat Rawak',
        hideRandomWords: 'Perkataan Rawak',
        toggleFirstWord: 'Perkataan Pertama',
        toggleLastWord: 'Perkataan Terakhir',
        hideAyahs: 'Sorok Ayat',
        hideWords: 'Sorok Perkataan',
        ayahs: 'Ayat',
        stopSignsLabel: 'Tanda Waqaf',
        allWords: 'Semua Perkataan',
        hideFirstWord: 'Sorok Perkataan Pertama',
        showFirstWord: 'Tunjuk Perkataan Pertama',
        hideLastWord: 'Sorok Perkataan Terakhir',
        showLastWord: 'Tunjuk Perkataan Terakhir',
        small: 'Kecil',
        medium: 'Sederhana',
        large: 'Besar',
        settingsTitle: 'Tetapan',
        bottomBarCustomization: 'Penyesuaian Bar Bawah',
        showInBottomBar: 'Tunjuk di Bar Bawah',
        colorThemes: 'Tema Warna',
        soundSettings: 'Tetapan Bunyi',
        pageFlipSound: 'Bunyi Laman',
        wordAudioLongPress: 'Bunyi kata pada tekan lama',
        language: 'Bahasa Melayu',
        languages: 'Bahasa',
        textBrightness: 'Kecerahan Teks',
        backgroundBrightness: 'Kecerahan Latar',
        warmBeige: 'Beige Hangat',
        coolWhite: 'Putih Sejuk',
        softCream: 'Krim Lembut',
        darkBlue: 'Biru Gelap',
        pureBlack: 'Hitam Tulen',
        warmDark: 'Gelap Hangat',
        save: 'Simpan',
        cancel: 'Batal',
        close: 'Tutup',
        loading: 'Memuatkan...',
        error: 'Ralat',
        // Toast Messages
        firstWordHidden: 'Perkataan pertama disembunyikan',
        firstWordShown: 'Perkataan pertama ditunjukkan',
        lastWordHidden: 'Perkataan terakhir disembunyikan',
        lastWordShown: 'Perkataan terakhir ditunjukkan',
        allAyahsHidden: 'Semua ayat disembunyikan',
        ayahsHiddenAtStopSigns: 'Ayat disembunyikan pada tanda waqaf',
        randomWordsHidden: 'Perkataan rawak disembunyikan',
        allWordsHidden: 'Semua perkataan disembunyikan',
        randomHidden: 'Rawak disembunyikan',
        weakAyahsHidden: 'Ayat hafalan lemah disembunyikan (Merah)',
        mediumAyahsHidden: 'Ayat hafalan sederhana disembunyikan (Kuning)',
        goodAyahsHidden: 'Ayat hafalan baik disembunyikan (Hijau)',
        notMemorizedAyahsHidden: 'Sorok Ayat Belum Disemak',
        allAyahsShown: 'Semua ayat ditunjukkan',

        // Misc
        page: 'Muka Surat',
        surah: 'Surah',
        retry: 'Cuba Lagi',

        // Surah Index
        juz: 'Juzuk',
        recentPages: 'Muka Surat Terkini',
        pageBookmarks: 'Tanda Buku Muka Surat',
        noPageBookmarks: 'Tiada tanda buku muka surat',
        verseBookmarks: 'Tanda Buku Ayat',
        noVerseBookmarks: 'Tiada tanda buku ayat',
        delete: 'Padam',
        indexTitle: 'Indeks',

        // Memorization Stats
        memorizationStatsTitle: 'Statistik Hafazan',
        fromAyahCount: '(daripada {count})',
        good: 'Baik',
        weak: 'Lemah',
        notRated: 'Belum Dinilai',

        // Notification Manager
        notificationManagerTitle: 'Pengurus Pemberitahuan',
        noNotifications: 'Tiada pemberitahuan. Ketik "Tambah Pemberitahuan" untuk bermula.',
        daily: 'Harian',
        addNotification: 'Tambah Pemberitahuan',
        editNotification: 'Edit Pemberitahuan',
        addNewNotification: 'Tambah Pemberitahuan Baru',
        notificationName: 'Nama Pemberitahuan',
        notificationNamePlaceholder: 'cth. Bacaan Harian',
        notificationType: 'Jenis Pemberitahuan',
        weekly: 'Mingguan',
        selectDays: 'Pilih Hari',
        notificationTimes: 'Waktu Pemberitahuan',
        addAnotherTime: 'Tambah Waktu Lain',
        sunday: 'Ahad',
        monday: 'Isnin',
        tuesday: 'Selasa',
        wednesday: 'Rabu',
        thursday: 'Khamis',
        friday: 'Jumaat',
        saturday: 'Sabtu',

        // Quran Page Renderer
        hizb: 'Hizb',
        firstRub: 'Rub Pertama',
        secondRub: 'Rub Kedua',
        thirdRub: 'Rub Ketiga',
        fourthRub: 'Rub Keempat',
        rateAyah: 'Nilai Ayat',
        saveAyah: 'Simpan Ayat',

        // Ayah Options
        ayahOptions: 'Pilihan Ayat {ayah}',
        addBookmark: 'Tambah Tanda Buku',
        removeBookmark: 'Buang Tanda Buku',
        rateMemorization: 'Nilai Hafazan',

        // Display Settings Labels
        displaySettings: 'Tetapan Paparan',
        defaultFontSize: 'Saiz Fon Lalai',
        lineSpacingLabel: 'Jarak Baris',
        pageMarginsLabel: 'Margin Muka Surat',
        prayerMode: 'Mod Solat',
        rub: 'Rub',
        dataError: 'Ralat memuatkan data',
        surahPrefix: 'Surah',
        offlineLoadNotice: 'Please connect to the internet once to load the page.',
    },
    ur: {
        ...en,
        index: 'فہرست',
        search: 'تلاش',
        memorizationStats: 'حفظ',
        notifications: 'اطلاعات',
        darkMode: 'تاریک',
        lightMode: 'روشن',
        fontSize: 'فونٹ سائز',
        bookmark: 'نشان',
        settings: 'ترتیبات',
        showAll: 'سب دکھائیں',
        hideAll: 'سب چھپائیں',
        hideRandomAyahs: 'بے ترتیب آیات',
        hideRandomWords: 'بے ترتیب الفاظ',
        toggleFirstWord: 'پہلا لفظ',
        toggleLastWord: 'آخری لفظ',
        small: 'چھوٹا',
        medium: 'درمیانہ',
        large: 'بڑا',
        settingsTitle: 'ترتیبات',
        bottomBarCustomization: 'نچلی بار کی تخصیص',
        showInBottomBar: 'نچلی بار میں دکھائیں',
        colorThemes: 'رنگ تھیمز',
        soundSettings: 'آواز کی ترتیبات',
        pageFlipSound: 'صفحہ پلٹنے کی آواز',
        wordAudioLongPress: 'طویل دبانے پر لفظ کی آواز',
        language: 'زبان',
        languages: 'زبانیں',
        textBrightness: 'متن کی روشنی',
        backgroundBrightness: 'پس منظر کی روشنی',
        warmBeige: 'گرم بیج',
        coolWhite: 'ٹھنڈا سفید',
        softCream: 'نرم کریم',
        darkBlue: 'گہرا نیلا',
        pureBlack: 'خالص سیاہ',
        warmDark: 'گرم تاریک',
        save: 'محفوظ کریں',
        cancel: 'منسوخ کریں',
        close: 'بند کریں',
        loading: 'لوڈ ہو رہا ہے...',
        error: 'خرابی',
        // Toast Messages
        firstWordHidden: 'پہلا لفظ چھپا دیا گیا',
        firstWordShown: 'پہلا لفظ دکھایا گیا',
        lastWordHidden: 'آخری لفظ چھپا دیا گیا',
        lastWordShown: 'آخری لفظ دکھایا گیا',
        allAyahsHidden: 'تمام آیات چھپا دی گئیں',
        ayahsHiddenAtStopSigns: 'وقف کے نشانات پر آیات چھپا دی گئیں',
        randomWordsHidden: 'بے ترتیب الفاظ چھپا دیے گئے',
        allWordsHidden: 'تمام الفاظ چھپا دیے گئے',
        randomHidden: 'بے ترتیب چھپا دیا گیا',
        weakAyahsHidden: 'کمزور حفظ والی آیات چھپا دی گئیں (سرخ)',
        mediumAyahsHidden: 'درمیانی حفظ والی آیات چھپا دی گئیں (پیلا)',
        goodAyahsHidden: 'اچھی حفظ والی آیات چھپا دی گئیں (سبز)',
        notMemorizedAyahsHidden: 'غیر محفوظ آیات چھپا دی گئیں',
        allAyahsShown: 'تمام آیات دکھائی گئیں',

        // Misc
        page: 'صفحہ',
        surah: 'سورۃ',
        retry: 'دوبارہ کوشش کریں',

        // Surah Index
        juz: 'پارہ',
        recentPages: 'حالیہ صفحات',
        pageBookmarks: 'صفحہ کے نشانات',
        noPageBookmarks: 'کوئی صفحہ نشان نہیں',
        verseBookmarks: 'آیت کے نشانات',
        noVerseBookmarks: 'کوئی آیت نشان نہیں',
        delete: 'حذف کریں',
        indexTitle: 'فہرست',

        // Memorization Stats
        memorizationStatsTitle: 'حفظ کے اعداد و شمار',
        fromAyahCount: '({count} میں سے)',
        good: 'اچھا',
        weak: 'کمزور',
        notRated: 'غیر درجہ بند',

        // Notification Manager
        notificationManagerTitle: 'نوٹیفکیشن مینیجر',
        noNotifications: 'کوئی نوٹیفکیشن نہیں۔ شروع کرنے کے لیے "نوٹیفکیشن شامل کریں" پر ٹیپ کریں۔',
        daily: 'روزانہ',
        addNotification: 'نوٹیفکیشن شامل کریں',
        editNotification: 'نوٹیفکیشن میں ترمیم کریں',
        addNewNotification: 'نیا نوٹیفکیشن شامل کریں',
        notificationName: 'نوٹیفکیشن کا نام',
        notificationNamePlaceholder: 'مثال: روزانہ تلاوت',
        notificationType: 'نوٹیفکیشن کی قسم',
        weekly: 'ہفتہ وار',
        selectDays: 'دن منتخب کریں',
        notificationTimes: 'نوٹیفکیشن کے اوقات',
        addAnotherTime: 'ایک اور وقت شامل کریں',
        sunday: 'اتوار',
        monday: 'پیر',
        tuesday: 'منگل',
        wednesday: 'بدھ',
        thursday: 'جمعرات',
        friday: 'جمعہ',
        saturday: 'ہفتہ',

        // Quran Page Renderer
        hizb: 'حزب',
        firstRub: 'پہلا ربع',
        secondRub: 'دوسرا ربع',
        thirdRub: 'تیسرا ربع',
        fourthRub: 'چوتھا ربع',
        rateAyah: 'آیت کی درجہ بندی',
        saveAyah: 'آیت محفوظ کریں',

        // Ayah Options
        ayahOptions: 'آیت کے اختیارات {ayah}',
        addBookmark: 'بک مارک شامل کریں',
        removeBookmark: 'بک مارک ہٹائیں',
        rateMemorization: 'حفظ کی درجہ بندی',

        // Display Settings Labels
        displaySettings: 'ڈسپلے کی ترتیبات',
        defaultFontSize: 'ڈیفالٹ فونٹ سائز',
        lineSpacingLabel: 'لائن کی جگہ',
        pageMarginsLabel: 'صفحہ کے حاشیے',
        rub: 'ربع',
        dataError: 'ڈیٹا لوڈ کرنے میں خرابی',
        surahPrefix: 'سورۃ',
        offlineLoadNotice: 'انٹرنیٹ سے ایک بار منسلک ہو کر صفحہ لوڈ کریں۔',
    },
    bn: {
        ...en,
        index: 'সূচি',
        search: 'অনুসন্ধান',
        memorizationStats: 'মুখস্থ',
        notifications: 'বিজ্ঞপ্তি',
        darkMode: 'অন্ধকার',
        lightMode: 'আলো',
        fontSize: 'ফন্ট আকার',
        bookmark: 'বুকমার্ক',
        settings: 'সেটিংস',
        showAll: 'সব দেখান',
        hideAll: 'সব লুকান',
        hideRandomAyahs: 'এলোমেলো আয়াত',
        hideRandomWords: 'এলোমেলো শব্দ',
        toggleFirstWord: 'প্রথম শব্দ',
        toggleLastWord: 'শেষ শব্দ',
        small: 'ছোট',
        medium: 'মাঝারি',
        large: 'বড়',
        settingsTitle: 'সেটিংস',
        bottomBarCustomization: 'নিচের বার কাস্টমাইজেশন',
        showInBottomBar: 'নিচের বারে দেখান',
        colorThemes: 'রঙের থিম',
        soundSettings: 'শব্দ সেটিংস',
        pageFlipSound: 'পৃষ্ঠা ফ্লিপ শব্দ',
        wordAudioLongPress: 'দীর্ঘ প্রেস শব্দ',
        language: 'ভাষা',
        languages: 'ভাষা',
        textBrightness: 'টেক্সট উজ্জ্বলতা',
        backgroundBrightness: 'পটভূমি উজ্জ্বলতা',
        warmBeige: 'উষ্ণ বেইজ',
        coolWhite: 'শীতল সাদা',
        softCream: 'নরম ক্রিম',
        darkBlue: 'গাঢ় নীল',
        pureBlack: 'খাঁটি কালো',
        warmDark: 'উষ্ণ অন্ধকার',
        save: 'সংরক্ষণ',
        cancel: 'বাতিল',
        close: 'বন্ধ',
        loading: 'লোড হচ্ছে...',
        error: 'ত্রুটি',
        // Toast Messages
        firstWordHidden: 'প্রথম শব্দ লুকানো হয়েছে',
        firstWordShown: 'প্রথম শব্দ দেখানো হয়েছে',
        lastWordHidden: 'শেষ শব্দ লুকানো হয়েছে',
        lastWordShown: 'শেষ শব্দ দেখানো হয়েছে',
        allAyahsHidden: 'সব আয়াত লুকানো হয়েছে',
        ayahsHiddenAtStopSigns: 'বিরতি চিহ্নে আয়াত লুকানো হয়েছে',
        randomWordsHidden: 'এলোমেলো শব্দ লুকানো হয়েছে',
        allWordsHidden: 'সব শব্দ লুকানো হয়েছে',
        randomHidden: 'এলোমেলো লুকানো হয়েছে',
        weakAyahsHidden: 'দুর্বল মুখস্থ আয়াত লুকানো হয়েছে (লাল)',
        mediumAyahsHidden: 'মাঝারি মুখস্থ আয়াত লুকানো হয়েছে (হলুদ)',
        goodAyahsHidden: 'ভালো মুখস্থ আয়াত লুকানো হয়েছে (সবুজ)',
        notMemorizedAyahsHidden: 'মুখস্থ না করা আয়াত লুকানো হয়েছে',
        allAyahsShown: 'সব আয়াত দেখানো হয়েছে',

        // Misc
        page: 'পৃষ্ঠা',
        surah: 'সূরা',
        retry: 'পুনরায় চেষ্টা করুন',

        // Surah Index
        juz: 'পারা',
        recentPages: 'সাম্প্রতিক পৃষ্ঠা',
        pageBookmarks: 'পৃষ্ঠা বুকমার্ক',
        noPageBookmarks: 'কোনো পৃষ্ঠা বুকমার্ক নেই',
        verseBookmarks: 'আয়াত বুকমার্ক',
        noVerseBookmarks: 'কোনো আয়াত বুকমার্ক নেই',
        delete: 'মুছুন',
        indexTitle: 'সূচি',

        // Memorization Stats
        memorizationStatsTitle: 'মুখস্থ পরিসংখ্যান',
        fromAyahCount: '({count} এর মধ্যে)',
        good: 'ভালো',
        weak: 'দুর্বল',
        notRated: 'রেট করা হয়নি',

        // Notification Manager
        notificationManagerTitle: 'বিজ্ঞপ্তি ম্যানেজার',
        noNotifications: 'কোনো বিজ্ঞপ্তি নেই। শুরু করতে "বিজ্ঞপ্তি যোগ করুন" এ ট্যাপ করুন।',
        daily: 'দৈনিক',
        addNotification: 'বিজ্ঞপ্তি যোগ করুন',
        editNotification: 'বিজ্ঞপ্তি সম্পাদনা করুন',
        addNewNotification: 'নতুন বিজ্ঞপ্তি যোগ করুন',
        notificationName: 'বিজ্ঞপ্তির নাম',
        notificationNamePlaceholder: 'যেমন: দৈনিক তিলাওয়াত',
        notificationType: 'বিজ্ঞপ্তির ধরন',
        weekly: 'সাপ্তাহিক',
        selectDays: 'দিন নির্বাচন করুন',
        notificationTimes: 'বিজ্ঞপ্তির সময়',
        addAnotherTime: 'আরেকটি সময় যোগ করুন',
        sunday: 'রবিবার',
        monday: 'সোমবার',
        tuesday: 'মঙ্গলবার',
        wednesday: 'বুধবার',
        thursday: 'বৃহস্পতিবার',
        friday: 'শুক্রবার',
        saturday: 'শনিবার',

        // Quran Page Renderer
        hizb: 'হিজব',
        firstRub: 'প্রথম রুব',
        secondRub: 'দ্বিতীয় রুব',
        thirdRub: 'তৃতীয় রুব',
        fourthRub: 'চতুর্থ রুব',
        rateAyah: 'আয়াত রেট করুন',
        saveAyah: 'আয়াত সংরক্ষণ করুন',

        // Ayah Options
        ayahOptions: 'আয়াত বিকল্প {ayah}',
        addBookmark: 'বুকমার্ক যোগ করুন',
        removeBookmark: 'বুকমার্ক সরান',
        rateMemorization: 'মুখস্থ মূল্যায়ন',

        // Display Settings Labels
        displaySettings: 'প্রদর্শন সেটিংস',
        defaultFontSize: 'ডিফল্ট ফন্ট আকার',
        lineSpacingLabel: 'লাইন ব্যবধান',
        pageMarginsLabel: 'পৃষ্ঠা মার্জিন',
        rub: 'রুব',
        dataError: 'ডেটা লোড করতে ত্রুটি',
        surahPrefix: 'সূরা',
        offlineLoadNotice: 'পেজটি লোড করার জন্য দয়া করে একবার ইন্টারনেটে সংযুক্ত হন।',
    },
    tr: {
        ...en,
        index: 'Dizin',
        search: 'Ara',
        memorizationStats: 'Ezber',
        notifications: 'Bildirimler',
        darkMode: 'Karanlık',
        lightMode: 'Aydınlık',
        fontSize: 'Yazı Boyutu',
        bookmark: 'Yer İşareti',
        settings: 'Ayarlar',
        showAll: 'Hepsini Göster',
        hideAll: 'Hepsini Gizle',
        hideRandomAyahs: 'Rastgele Ayetler',
        hideRandomWords: 'Rastgele Kelimeler',
        toggleFirstWord: 'İlk Kelime',
        toggleLastWord: 'Son Kelime',
        small: 'Küçük',
        medium: 'Orta',
        large: 'Büyük',
        settingsTitle: 'Ayarlar',
        bottomBarCustomization: 'Alt Çubuk Özelleştirme',
        showInBottomBar: 'Alt Çubukta Göster',
        colorThemes: 'Renk Temaları',
        soundSettings: 'Ses Ayarları',
        pageFlipSound: 'Sayfa Çevirme Sesi',
        wordAudioLongPress: 'Uzun basışta kelime sesi',
        language: 'Dil',
        languages: 'Diller',
        textBrightness: 'Metin Parlaklığı',
        backgroundBrightness: 'Arka Plan Parlaklığı',
        warmBeige: 'Sıcak Bej',
        coolWhite: 'Serin Beyaz',
        softCream: 'Yumuşak Krem',
        darkBlue: 'Koyu Mavi',
        pureBlack: 'Saf Siyah',
        warmDark: 'Sıcak Karanlık',
        save: 'Kaydet',
        cancel: 'İptal',
        close: 'Kapat',
        loading: 'Yükleniyor...',
        error: 'Hata',
        // Toast Messages
        firstWordHidden: 'İlk kelime gizlendi',
        firstWordShown: 'İlk kelime gösterildi',
        lastWordHidden: 'Son kelime gizlendi',
        lastWordShown: 'Son kelime gösterildi',
        allAyahsHidden: 'Tüm ayetler gizlendi',
        ayahsHiddenAtStopSigns: 'Duraklarda ayetler gizlendi',
        randomWordsHidden: 'Rastgele kelimeler gizlendi',
        allWordsHidden: 'Tüm kelimeler gizlendi',
        randomHidden: 'Rastgele gizlendi',
        weakAyahsHidden: 'Zayıf ezberlenen ayetler gizlendi (Kırmızı)',
        mediumAyahsHidden: 'Orta ezberlenen ayetler gizlendi (Sarı)',
        goodAyahsHidden: 'İyi ezberlenen ayetler gizlendi (Yeşil)',
        notMemorizedAyahsHidden: 'Ezberlenmemiş ayetler gizlendi',
        allAyahsShown: 'Tüm ayetler gösterildi',

        // Misc
        page: 'Sayfa',
        surah: 'Sure',
        retry: 'Tekrar Dene',

        // Surah Index
        juz: 'Cüz',
        recentPages: 'Son Sayfalar',
        pageBookmarks: 'Sayfa Yer İşaretleri',
        noPageBookmarks: 'Sayfa yer işareti yok',
        verseBookmarks: 'Ayet Yer İşaretleri',
        noVerseBookmarks: 'Ayet yer işareti yok',
        delete: 'Sil',
        indexTitle: 'Dizin',

        // Memorization Stats
        memorizationStatsTitle: 'Ezber İstatistikleri',
        fromAyahCount: '({count} içinden)',
        good: 'İyi',
        weak: 'Zayıf',
        notRated: 'Değerlendirilmedi',

        // Notification Manager
        notificationManagerTitle: 'Bildirim Yöneticisi',
        noNotifications: 'Bildirim yok. Başlamak için "Bildirim Ekle"ye dokunun.',
        daily: 'Günlük',
        addNotification: 'Bildirim Ekle',
        editNotification: 'Bildirimi Düzenle',
        addNewNotification: 'Yeni Bildirim Ekle',
        notificationName: 'Bildirim Adı',
        notificationNamePlaceholder: 'Örn. Günlük Okuma',
        notificationType: 'Bildirim Türü',
        weekly: 'Haftalık',
        selectDays: 'Günleri Seç',
        notificationTimes: 'Bildirim Zamanları',
        addAnotherTime: 'Başka Zaman Ekle',
        sunday: 'Pazar',
        monday: 'Pazartesi',
        tuesday: 'Salı',
        wednesday: 'Çarşamba',
        thursday: 'Perşembe',
        friday: 'Cuma',
        saturday: 'Cumartesi',

        // Quran Page Renderer
        hizb: 'Hizb',
        firstRub: 'Birinci Rub',
        secondRub: 'İkinci Rub',
        thirdRub: 'Üçüncü Rub',
        fourthRub: 'Dördüncü Rub',
        rateAyah: 'Ayeti Puanla',
        saveAyah: 'Ayeti Kaydet',

        // Ayah Options
        ayahOptions: 'Ayet Seçenekleri {ayah}',
        addBookmark: 'Yer İşareti Ekle',
        removeBookmark: 'Yer İşaretini Kaldır',
        rateMemorization: 'Ezber Puanla',

        // Display Settings Labels
        displaySettings: 'Görünüm Ayarları',
        defaultFontSize: 'Varsayılan Yazı Boyutu',
        lineSpacingLabel: 'Satır Aralığı',
        pageMarginsLabel: 'Sayfa Kenar Boşlukları',
        rub: 'Rub',
        dataError: 'Veri yükleme hatası',
        surahPrefix: 'Sure',
        offlineLoadNotice: 'Sayfayı yüklemek için lütfen bir kez internete bağlanın.',
    },
    fa: {
        ...en,
        index: 'فهرست',
        search: 'جستجو',
        memorizationStats: 'حفظ',
        notifications: 'اعلان‌ها',
        darkMode: 'تاریک',
        lightMode: 'روشن',
        fontSize: 'اندازه فونت',
        bookmark: 'نشانک',
        settings: 'تنظیمات',
        showAll: 'نمایش همه',
        hideAll: 'پنهان کردن همه',
        hideRandomAyahs: 'آیات تصادفی',
        hideRandomWords: 'کلمات تصادفی',
        toggleFirstWord: 'کلمه اول',
        toggleLastWord: 'کلمه آخر',
        small: 'کوچک',
        medium: 'متوسط',
        large: 'بزرگ',
        settingsTitle: 'تنظیمات',
        bottomBarCustomization: 'سفارشی‌سازی نوار پایین',
        showInBottomBar: 'نمایش در نوار پایین',
        colorThemes: 'تم‌های رنگی',
        soundSettings: 'تنظیمات صدا',
        pageFlipSound: 'صدای ورق زدن',
        wordAudioLongPress: 'صدای کلمه در فشار طولانی',
        language: 'زبان',
        languages: 'زبان‌ها',
        textBrightness: 'روشنایی متن',
        backgroundBrightness: 'روشنایی پس‌زمینه',
        warmBeige: 'بژ گرم',
        coolWhite: 'سفید خنک',
        softCream: 'کرم نرم',
        darkBlue: 'آبی تیره',
        pureBlack: 'سیاه خالص',
        warmDark: 'تاریک گرم',
        save: 'ذخیره',
        cancel: 'لغو',
        close: 'بستن',
        loading: 'در حال بارگذاری...',
        error: 'خطا',

        // Toast Messages
        firstWordHidden: 'کلمه اول پنهان شد',
        firstWordShown: 'کلمه اول نمایش داده شد',
        lastWordHidden: 'کلمه آخر پنهان شد',
        lastWordShown: 'کلمه آخر نمایش داده شد',
        allAyahsHidden: 'همه آیات پنهان شدند',
        ayahsHiddenAtStopSigns: 'آیات در علامت‌های توقف پنهان شدند',
        randomWordsHidden: 'کلمات تصادفی پنهان شدند',
        allWordsHidden: 'همه کلمات پنهان شدند',
        randomHidden: 'تصادفی پنهان شد',
        weakAyahsHidden: 'آیات ضعیف پنهان شدند (قرمز)',
        mediumAyahsHidden: 'آیات متوسط پنهان شدند (زرد)',
        goodAyahsHidden: 'آیات خوب پنهان شدند (سبز)',
        notMemorizedAyahsHidden: 'آیات حفظ نشده پنهان شدند',
        allAyahsShown: 'همه آیات نمایش داده شدند',

        // Misc
        page: 'صفحه',
        surah: 'سوره',
        retry: 'تلاش مجدد',

        // Surah Index
        juz: 'جزء',
        recentPages: 'صفحات اخیر',
        pageBookmarks: 'نشانک‌های صفحه',
        noPageBookmarks: 'نشانک صفحه‌ای وجود ندارد',
        verseBookmarks: 'نشانک‌های آیه',
        noVerseBookmarks: 'نشانک آیه‌ای وجود ندارد',
        delete: 'حذف',
        indexTitle: 'فهرست',

        // Memorization Stats
        memorizationStatsTitle: 'آمار حفظ',
        fromAyahCount: '(از {count})',
        good: 'خوب',
        weak: 'ضعیف',
        notRated: 'ارزیابی نشده',

        // Notification Manager
        notificationManagerTitle: 'مدیریت اعلان‌ها',
        noNotifications: 'اعلانی وجود ندارد. روی "افزودن اعلان" کلیک کنید.',
        daily: 'روزانه',
        addNotification: 'افزودن اعلان',
        editNotification: 'ویرایش اعلان',
        addNewNotification: 'افزودن اعلان جدید',
        notificationName: 'نام اعلان',
        notificationNamePlaceholder: 'مثال: قرائت روزانه',
        notificationType: 'نوع اعلان',
        weekly: 'هفتگی',
        selectDays: 'انتخاب روزها',
        notificationTimes: 'زمان‌های اعلان',
        addAnotherTime: 'افزودن زمان دیگر',
        sunday: 'یکشنبه',
        monday: 'دوشنبه',
        tuesday: 'سه‌شنبه',
        wednesday: 'چهارشنبه',
        thursday: 'پنجشنبه',
        friday: 'جمعه',
        saturday: 'شنبه',

        // Quran Page Renderer
        hizb: 'حزب',
        firstRub: 'ربع اول',
        secondRub: 'ربع دوم',
        thirdRub: 'ربع سوم',
        fourthRub: 'ربع چهارم',
        rateAyah: 'ارزیابی آیه',
        saveAyah: 'ذخیره آیه',

        // Ayah Options
        ayahOptions: 'گزینه‌های آیه {ayah}',
        addBookmark: 'افزودن نشانک',
        removeBookmark: 'حذف نشانک',
        rateMemorization: 'ارزیابی حفظ',

        // Display Settings Labels
        displaySettings: 'تنظیمات نمایش',
        defaultFontSize: 'اندازه پیش‌فرض فونت',
        lineSpacingLabel: 'فاصله خطوط',
        pageMarginsLabel: 'حاشیه صفحه',
        rub: 'ربع',
        dataError: 'خطا در بارگذاری داده‌ها',
        surahPrefix: 'سوره',
        offlineLoadNotice: 'لطفاً برای بارگذاری صفحه یک بار به اینترنت متصل شوید.',
    },
    // Adding remaining languages with English fallback for now
    ha: {
        ...en,
        index: 'Fihirisa',
        search: 'Bincike',
        memorizationStats: 'Haddace',
        notifications: 'Sanarwa',
        darkMode: 'Duhu',
        lightMode: 'Haske',
        fontSize: 'Girman Rubutu',
        bookmark: 'Alamar Littafi',
        settings: 'Saituna',
        showAll: 'Nuna Duka',
        hideAll: 'Boye Duka',
        hideRandomAyahs: 'Ayoyi Masu Bazuwar',
        hideRandomWords: 'Kalmomi Masu Bazuwar',
        toggleFirstWord: 'Kalmar Farko',
        toggleLastWord: 'Kalmar Karshe',
        small: 'Karami',
        medium: 'Matsakaici',
        large: 'Babba',
        settingsTitle: 'Saituna',
        bottomBarCustomization: 'Tsarin Bar na Kasa',
        showInBottomBar: 'Nuna a Bar na Kasa',
        colorThemes: 'Jigogin Launi',
        soundSettings: 'Saitunan Sauti',
        pageFlipSound: 'Sautin Juya Shafi',
        wordAudioLongPress: 'Sautin kalma akan dogon latsawa',
        language: 'Harshe',
        languages: 'Harsuna',
        textBrightness: 'Hasken Rubutu',
        backgroundBrightness: 'Hasken Baya',
        warmBeige: 'Dumi Beige',
        coolWhite: 'Fari Mai Sanyi',
        softCream: 'Kirimi Mai Taushi',
        darkBlue: 'Bulu Mai Duhu',
        pureBlack: 'Baki Tsantsa',
        warmDark: 'Duhu Mai Dumi',
        save: 'Ajiye',
        cancel: 'Soke',
        close: 'Rufe',
        loading: 'Ana lodawa...',
        error: 'Kuskure',

        // Toast Messages
        firstWordHidden: 'Kalmar farko ta boye',
        firstWordShown: 'Kalmar farko ta nuna',
        lastWordHidden: 'Kalmar karshe ta boye',
        lastWordShown: 'Kalmar karshe ta nuna',
        allAyahsHidden: 'Duk ayoyi sun boye',
        ayahsHiddenAtStopSigns: 'Ayoyi sun boye a alamun tsayawa',
        randomWordsHidden: 'Kalmomi masu bazuwar sun boye',
        allWordsHidden: 'Duk kalmomi sun boye',
        randomHidden: 'Bazuwar ta boye',
        weakAyahsHidden: 'Ayoyi masu rauni sun boye (Ja)',
        mediumAyahsHidden: 'Ayoyi masu matsakaici sun boye (Rawaya)',
        goodAyahsHidden: 'Ayoyi masu kyau sun boye (Kore)',
        notMemorizedAyahsHidden: 'Ayoyi da ba a haddace ba sun boye',
        allAyahsShown: 'Duk ayoyi sun nuna',

        // Misc
        page: 'Shafi',
        surah: 'Surah',
        retry: 'Gwada kuma',

        // Surah Index
        juz: 'Juz',
        recentPages: 'Shafukan Kwanan Nan',
        pageBookmarks: 'Alamomin Shafi',
        noPageBookmarks: 'Babu alamomin shafi',
        verseBookmarks: 'Alamomin Aya',
        noVerseBookmarks: 'Babu alamomin aya',
        delete: 'Goge',
        indexTitle: 'Fihirisa',

        // Memorization Stats
        memorizationStatsTitle: 'Kididdigar Haddace',
        fromAyahCount: '(daga {count})',
        good: 'Kyau',
        weak: 'Rauni',
        notRated: 'Ba a kimanta ba',

        // Notification Manager
        notificationManagerTitle: 'Manajan Sanarwa',
        noNotifications: 'Babu sanarwa. Danna "Kara" don farawa.',
        daily: 'Kullum',
        addNotification: 'Kara Sanarwa',
        editNotification: 'Gyara Sanarwa',
        addNewNotification: 'Kara Sabuwar Sanarwa',
        notificationName: 'Sunan Sanarwa',
        notificationNamePlaceholder: 'mis. Karatun Kullum',
        notificationType: 'Nau\'in Sanarwa',
        weekly: 'Mako-mako',
        selectDays: 'Zabi Kwanaki',
        notificationTimes: 'Lokutan Sanarwa',
        addAnotherTime: 'Kara Wani Lokaci',
        sunday: 'Lahadi',
        monday: 'Litinin',
        tuesday: 'Talata',
        wednesday: 'Laraba',
        thursday: 'Alhamis',
        friday: 'Juma\'a',
        saturday: 'Asabar',

        // Quran Page Renderer
        hizb: 'Hizb',
        firstRub: 'Rub na Farko',
        secondRub: 'Rub na Biyu',
        thirdRub: 'Rub na Uku',
        fourthRub: 'Rub na Hudu',
        rateAyah: 'Kimanta Aya',
        saveAyah: 'Ajiye Aya',

        // Ayah Options
        ayahOptions: 'Zabukan Aya {ayah}',
        addBookmark: 'Kara Alamar Littafi',
        removeBookmark: 'Cire Alamar Littafi',
        rateMemorization: 'Kimanta Haddace',

        // Display Settings Labels
        displaySettings: 'Saitunan Nuni',
        defaultFontSize: 'Girman Rubutu na Asali',
        lineSpacingLabel: 'Tazara Tsakanin Layi',
        pageMarginsLabel: 'Gefen Shafi',
        rub: 'Rub',
        dataError: 'Kuskure wajen loda bayanai',
        surahPrefix: 'Surah',
        offlineLoadNotice: 'Please connect to the internet once to load the page.',
    },
    fr: {
        ...en,
        index: 'Index',
        search: 'Rechercher',
        memorizationStats: 'Mémorisation',
        notifications: 'Notifications',
        darkMode: 'Sombre',
        lightMode: 'Clair',
        fontSize: 'Taille Police',
        bookmark: 'Signet',
        settings: 'Paramètres',
        showAll: 'Tout afficher',
        hideAll: 'Tout masquer',
        hideRandomAyahs: 'Ayahs Aléatoires',
        hideRandomWords: 'Mots Aléatoires',
        toggleFirstWord: 'Premier Mot',
        toggleLastWord: 'Dernier Mot',
        small: 'Petit',
        medium: 'Moyen',
        large: 'Grand',
        settingsTitle: 'Paramètres',
        bottomBarCustomization: 'Personnalisation Barre Inférieure',
        showInBottomBar: 'Afficher dans la Barre Inférieure',
        colorThemes: 'Thèmes de Couleur',
        soundSettings: 'Paramètres Sonores',
        pageFlipSound: 'Son Tourne-Page',
        wordAudioLongPress: 'Son du mot sur appui long',
        language: 'Langue',
        languages: 'Langues',
        textBrightness: 'Luminosité Texte',
        backgroundBrightness: 'Luminosité Fond',
        warmBeige: 'Beige Chaud',
        coolWhite: 'Blanc Froid',
        softCream: 'Crème Douce',
        darkBlue: 'Bleu Foncé',
        pureBlack: 'Noir Pur',
        warmDark: 'Sombre Chaud',
        save: 'Enregistrer',
        cancel: 'Annuler',
        close: 'Fermer',
        loading: 'Chargement...',
        error: 'Erreur',

        // Toast Messages
        firstWordHidden: 'Premier mot masqué',
        firstWordShown: 'Premier mot affiché',
        lastWordHidden: 'Dernier mot masqué',
        lastWordShown: 'Dernier mot affiché',
        allAyahsHidden: 'Toutes les ayahs masquées',
        ayahsHiddenAtStopSigns: 'Ayahs masquées aux arrêts',
        randomWordsHidden: 'Mots aléatoires masqués',
        allWordsHidden: 'Tous les mots masqués',
        randomHidden: 'Aléatoire masqué',
        weakAyahsHidden: 'Ayahs faibles masquées (Rouge)',
        mediumAyahsHidden: 'Ayahs moyennes masquées (Jaune)',
        goodAyahsHidden: 'Ayahs bien mémorisées masquées (Vert)',
        notMemorizedAyahsHidden: 'Ayahs non mémorisées masquées',
        allAyahsShown: 'Toutes les ayahs affichées',

        // Misc
        page: 'Page',
        surah: 'Sourate',
        retry: 'Réessayer',

        // Surah Index
        juz: 'Juz',
        recentPages: 'Pages Récentes',
        pageBookmarks: 'Marque-pages',
        noPageBookmarks: 'Aucun marque-page',
        verseBookmarks: 'Marque-pages Versets',
        noVerseBookmarks: 'Aucun marque-page de verset',
        delete: 'Supprimer',
        indexTitle: 'Index',

        // Memorization Stats
        memorizationStatsTitle: 'Statistiques de Mémorisation',
        fromAyahCount: '(sur {count})',
        good: 'Bien',
        weak: 'Faible',
        notRated: 'Non Évalué',

        // Notification Manager
        notificationManagerTitle: 'Gestionnaire de Notifications',
        noNotifications: 'Aucune notification. Appuyez sur "Ajouter" pour commencer.',
        daily: 'Quotidien',
        addNotification: 'Ajouter Notification',
        editNotification: 'Modifier Notification',
        addNewNotification: 'Ajouter Nouvelle Notification',
        notificationName: 'Nom de la Notification',
        notificationNamePlaceholder: 'ex: Lecture Quotidienne',
        notificationType: 'Type de Notification',
        weekly: 'Hebdomadaire',
        selectDays: 'Sélectionner Jours',
        notificationTimes: 'Heures de Notification',
        addAnotherTime: 'Ajouter une autre heure',
        sunday: 'Dimanche',
        monday: 'Lundi',
        tuesday: 'Mardi',
        wednesday: 'Mercredi',
        thursday: 'Jeudi',
        friday: 'Vendredi',
        saturday: 'Samedi',

        // Quran Page Renderer
        hizb: 'Hizb',
        firstRub: 'Premier Rub',
        secondRub: 'Deuxième Rub',
        thirdRub: 'Troisième Rub',
        fourthRub: 'Quatrième Rub',
        rateAyah: 'Noter Ayah',
        saveAyah: 'Sauvegarder Ayah',

        // Ayah Options
        ayahOptions: 'Options de Verset {ayah}',
        addBookmark: 'Ajouter un Signet',
        removeBookmark: 'Supprimer le Signet',
        rateMemorization: 'Évaluer la Mémorisation',

        // Display Settings Labels
        displaySettings: 'Paramètres d\'Affichage',
        defaultFontSize: 'Taille Police Défaut',
        lineSpacingLabel: 'Espacement Lignes',
        pageMarginsLabel: 'Marges Page',
        rub: 'Rub',
        dataError: 'Erreur lors du chargement des données',
        surahPrefix: 'Sourate',
        offlineLoadNotice: 'Veuillez vous connecter à Internet une fois pour charger la page.',
    },
    es: {
        ...en,
        medium: 'Mediano',
        removeBookmark: 'Eliminar Marcador',
        rateMemorization: 'Calificar Memorización',
        rub: 'Cuarta',
        dataError: 'Error al cargar los datos',
        surahPrefix: 'Sura',
        offlineLoadNotice: 'Please connect to the internet once to load the page.',
    },
    de: {
        ...en,
        medium: 'Mittel',
        removeBookmark: 'Lesezeichen entfernen',
        rateMemorization: 'Auswendiglernen bewerten',
        rub: 'Viertel',
        dataError: 'Fehler beim Laden der Daten',
        surahPrefix: 'Sure',
        offlineLoadNotice: 'Sayfayı yüklemek için lütfen bir kez internete bağlanın.',
    },
    ru: {
        ...en,
        medium: 'Средний',
        removeBookmark: 'Удалить закладку',
        rateMemorization: 'Оценить запоминание',
        rub: 'Руб',
        dataError: 'Ошибка загрузки данных',
        surahPrefix: 'Сура',
    },
    sw: {
        ...en,
        medium: 'Kati',
        removeBookmark: 'Ondoa Alama',
        rateMemorization: 'Kadiria Kumbukumbu',
        rub: 'Rubu',
        dataError: 'Hitilafu ya kupakia data',
        surahPrefix: 'Surah',
        offlineLoadNotice: 'Please connect to the internet once to load the page.',
    },
    zh: {
        ...en,
        index: '索引',
        search: '搜索',
        memorizationStats: '背诵',
        notifications: '通知',
        darkMode: '深色',
        lightMode: '浅色',
        fontSize: '字体大小',
        bookmark: '书签',
        settings: '设置',
        showAll: '显示全部',
        hideAll: '隐藏全部',
        hideRandomAyahs: '随机经文',
        hideRandomWords: '随机单词',
        toggleFirstWord: '首词',
        toggleLastWord: '尾词',
        small: '小',
        medium: '中',
        large: '大',
        settingsTitle: '设置',
        bottomBarCustomization: '底部栏自定义',
        showInBottomBar: '在底部栏显示',
        colorThemes: '颜色主题',
        soundSettings: '声音设置',
        pageFlipSound: '翻页声',
        wordAudioLongPress: '长按单词发音',
        language: '语言',
        languages: '语言',
        textBrightness: '文字亮度',
        backgroundBrightness: '背景亮度',
        warmBeige: '暖米色',
        coolWhite: '冷白色',
        softCream: '柔和奶油',
        darkBlue: '深蓝色',
        pureBlack: '纯黑',
        warmDark: '暖深色',
        save: '保存',
        cancel: '取消',
        close: '关闭',
        loading: '加载中...',
        error: '错误',

        // Toast Messages
        firstWordHidden: '首词已隐藏',
        firstWordShown: '首词已显示',
        lastWordHidden: '尾词已隐藏',
        lastWordShown: '尾词已显示',
        allAyahsHidden: '所有经文已隐藏',
        ayahsHiddenAtStopSigns: '停顿处经文已隐藏',
        randomWordsHidden: '随机单词已隐藏',
        allWordsHidden: '所有单词已隐藏',
        randomHidden: '随机隐藏',
        weakAyahsHidden: '弱背诵经文已隐藏 (红)',
        mediumAyahsHidden: '中等背诵经文已隐藏 (黄)',
        goodAyahsHidden: '良好背诵经文已隐藏 (绿)',
        notMemorizedAyahsHidden: '未背诵经文已隐藏',
        allAyahsShown: '所有经文已显示',

        // Misc
        page: '页',
        surah: '章',
        retry: '重试',

        // Surah Index
        juz: '卷',
        recentPages: '最近页面',
        pageBookmarks: '页面书签',
        noPageBookmarks: '无页面书签',
        verseBookmarks: '经文书签',
        noVerseBookmarks: '无经文书签',
        delete: '删除',
        indexTitle: '索引',

        // Memorization Stats
        memorizationStatsTitle: '背诵统计',
        fromAyahCount: '(共 {count})',
        good: '好',
        weak: '弱',
        notRated: '未评级',

        // Notification Manager
        notificationManagerTitle: '通知管理',
        noNotifications: '无通知。点击“添加”开始。',
        daily: '每日',
        addNotification: '添加通知',
        editNotification: '编辑通知',
        addNewNotification: '添加新通知',
        notificationName: '通知名称',
        notificationNamePlaceholder: '例如：每日诵读',
        notificationType: '通知类型',
        weekly: '每周',
        selectDays: '选择日期',
        notificationTimes: '通知时间',
        addAnotherTime: '添加时间',
        sunday: '周日',
        monday: '周一',
        tuesday: '周二',
        wednesday: '周三',
        thursday: '周四',
        friday: '周五',
        saturday: '周六',

        // Quran Page Renderer
        hizb: 'Hizb',
        firstRub: '第一 Rub',
        secondRub: '第二 Rub',
        thirdRub: '第三 Rub',
        fourthRub: '第四 Rub',
        rateAyah: '评价经文',
        saveAyah: '保存经文',

        // Ayah Options
        ayahOptions: '经文选项 {ayah}',
        addBookmark: '添加书签',
        removeBookmark: '删除书签',
        rateMemorization: '评价背诵',

        // Display Settings Labels
        displaySettings: '显示设置',
        defaultFontSize: '默认字体大小',
        lineSpacingLabel: '行间距',
        pageMarginsLabel: '页面边距',
        rub: 'Rub',
        dataError: '数据加载错误',
        surahPrefix: '章',
        offlineLoadNotice: '请连接网络以加载页面。',
    },
    ko: {
        ...en,
        index: '색인',
        search: '검색',
        memorizationStats: '암기',
        notifications: '알림',
        darkMode: '다크',
        lightMode: '라이트',
        fontSize: '글꼴 크기',
        bookmark: '북마크',
        settings: '설정',
        showAll: '모두 표시',
        hideAll: '모두 숨기기',
        hideRandomAyahs: '무작위 구절',
        hideRandomWords: '무작위 단어',
        toggleFirstWord: '첫 단어',
        toggleLastWord: '마지막 단어',
        small: '작게',
        medium: '중간',
        large: '크게',
        settingsTitle: '설정',
        bottomBarCustomization: '하단 바 사용자 지정',
        showInBottomBar: '하단 바에 표시',
        colorThemes: '색상 테마',
        soundSettings: '소리 설정',
        pageFlipSound: '페이지 넘김 소리',
        wordAudioLongPress: '길게 누를 때 단어 소리',
        language: '언어',
        languages: '언어',
        textBrightness: '텍스트 밝기',
        backgroundBrightness: '배경 밝기',
        warmBeige: '웜 베이지',
        coolWhite: '쿨 화이트',
        softCream: '소프트 크림',
        darkBlue: '다크 블루',
        pureBlack: '퓨어 블랙',
        warmDark: '웜 다크',
        save: '저장',
        cancel: '취소',
        close: '닫기',
        loading: '로딩 중...',
        error: '오류',

        // Toast Messages
        firstWordHidden: '첫 단어 숨김',
        firstWordShown: '첫 단어 표시',
        lastWordHidden: '마지막 단어 숨김',
        lastWordShown: '마지막 단어 표시',
        allAyahsHidden: '모든 구절 숨김',
        ayahsHiddenAtStopSigns: '멈춤 표시에 구절 숨김',
        randomWordsHidden: '무작위 단어 숨김',
        allWordsHidden: '모든 단어 숨김',
        randomHidden: '무작위 숨김',
        weakAyahsHidden: '약한 암기 구절 숨김 (빨강)',
        mediumAyahsHidden: '중간 암기 구절 숨김 (노랑)',
        goodAyahsHidden: '잘 암기된 구절 숨김 (초록)',
        notMemorizedAyahsHidden: '암기되지 않은 구절 숨김',
        allAyahsShown: '모든 구절 표시',

        // Misc
        page: '페이지',
        surah: '수라',
        retry: '재시도',

        // Surah Index
        juz: 'Juz',
        recentPages: '최근 페이지',
        pageBookmarks: '페이지 북마크',
        noPageBookmarks: '페이지 북마크 없음',
        verseBookmarks: '구절 북마크',
        noVerseBookmarks: '구절 북마크 없음',
        delete: '삭제',
        indexTitle: '색인',

        // Memorization Stats
        memorizationStatsTitle: '암기 통계',
        fromAyahCount: '({count} 중)',
        good: '좋음',
        weak: '약함',
        notRated: '평가 안 됨',

        // Notification Manager
        notificationManagerTitle: '알림 관리자',
        noNotifications: '알림이 없습니다. "추가"를 탭하여 시작하세요.',
        daily: '매일',
        addNotification: '알림 추가',
        editNotification: '알림 편집',
        addNewNotification: '새 알림 추가',
        notificationName: '알림 이름',
        notificationNamePlaceholder: '예: 매일 읽기',
        notificationType: '알림 유형',
        weekly: '매주',
        selectDays: '요일 선택',
        notificationTimes: '알림 시간',
        addAnotherTime: '시간 추가',
        sunday: '일요일',
        monday: '월요일',
        tuesday: '화요일',
        wednesday: '수요일',
        thursday: '목요일',
        friday: '금요일',
        saturday: '토요일',

        // Quran Page Renderer
        hizb: 'Hizb',
        firstRub: '첫 번째 Rub',
        secondRub: '두 번째 Rub',
        thirdRub: '세 번째 Rub',
        fourthRub: '네 번째 Rub',
        rateAyah: '구절 평가',
        saveAyah: '구절 저장',

        // Ayah Options
        ayahOptions: '구절 옵션 {ayah}',
        addBookmark: '북마크 추가',
        removeBookmark: '북마크 제거',
        rateMemorization: '암기 평가',

        // Display Settings Labels
        displaySettings: '화면 설정',
        defaultFontSize: '기본 글꼴 크기',
        lineSpacingLabel: '줄 간격',
        pageMarginsLabel: '페이지 여백',
    },
    ja: {
        ...en,
        index: '索引',
        search: '検索',
        memorizationStats: '暗記',
        notifications: '通知',
        darkMode: 'ダーク',
        lightMode: 'ライト',
        fontSize: 'フォントサイズ',
        bookmark: 'ブックマーク',
        settings: '設定',
        showAll: 'すべて表示',
        hideAll: 'すべて隠す',
        hideRandomAyahs: 'ランダムなアヤ',
        hideRandomWords: 'ランダムな単語',
        toggleFirstWord: '最初の単語',
        toggleLastWord: '最後の単語',
        small: '小',
        medium: '中',
        large: '大',
        settingsTitle: '設定',
        bottomBarCustomization: '下部バーのカスタマイズ',
        showInBottomBar: '下部バーに表示',
        colorThemes: 'カラーテーマ',
        soundSettings: '音声設定',
        pageFlipSound: 'ページめくり音',
        wordAudioLongPress: '長押しで単語の音',
        language: '言語',
        languages: '言語',
        textBrightness: 'テキストの明るさ',
        backgroundBrightness: '背景の明るさ',
        warmBeige: 'ウォームベージュ',
        coolWhite: 'クールホワイト',
        softCream: 'ソフトクリーム',
        darkBlue: 'ダークブルー',
        pureBlack: 'ピュアブラック',
        warmDark: 'ウォームダーク',
        save: '保存',
        cancel: 'キャンセル',
        close: '閉じる',
        loading: '読み込み中...',
        error: 'エラー',

        // Toast Messages
        firstWordHidden: '最初の単語を隠しました',
        firstWordShown: '最初の単語を表示しました',
        lastWordHidden: '最後の単語を隠しました',
        lastWordShown: '最後の単語を表示しました',
        allAyahsHidden: 'すべてのアヤを隠しました',
        ayahsHiddenAtStopSigns: '停止記号でアヤを隠しました',
        randomWordsHidden: 'ランダムな単語を隠しました',
        allWordsHidden: 'すべての単語を隠しました',
        randomHidden: 'ランダムに隠しました',
        weakAyahsHidden: '苦手なアヤを隠しました（赤）',
        mediumAyahsHidden: '普通のアヤを隠しました（黄）',
        goodAyahsHidden: '得意なアヤを隠しました（緑）',
        notMemorizedAyahsHidden: '未暗記のアヤを隠しました',
        allAyahsShown: 'すべてのアヤを表示しました',

        // Misc
        page: 'ページ',
        surah: 'スーラ',
        retry: '再試行',

        // Surah Index
        juz: 'ジュズ',
        recentPages: '最近のページ',
        pageBookmarks: 'ページブックマーク',
        noPageBookmarks: 'ページブックマークはありません',
        verseBookmarks: 'アヤブックマーク',
        noVerseBookmarks: 'アヤブックマークはありません',
        delete: '削除',
        indexTitle: '索引',

        // Memorization Stats
        memorizationStatsTitle: '暗記統計',
        fromAyahCount: '({count} 中)',
        good: '良い',
        weak: '弱い',
        notRated: '未評価',

        // Notification Manager
        notificationManagerTitle: '通知マネージャー',
        noNotifications: '通知はありません。「追加」をタップして開始します。',
        daily: '毎日',
        addNotification: '通知を追加',
        editNotification: '通知を編集',
        addNewNotification: '新しい通知を追加',
        notificationName: '通知名',
        notificationNamePlaceholder: '例：毎日の読書',
        notificationType: '通知タイプ',
        weekly: '毎週',
        selectDays: '曜日を選択',
        notificationTimes: '通知時間',
        addAnotherTime: '時間を追加',
        sunday: '日曜日',
        monday: '月曜日',
        tuesday: '火曜日',
        wednesday: '水曜日',
        thursday: '木曜日',
        friday: '金曜日',
        saturday: '土曜日',

        // Quran Page Renderer
        hizb: 'Hizb',
        firstRub: '第1 Rub',
        secondRub: '第2 Rub',
        thirdRub: '第3 Rub',
        pageMarginsLabel: 'Mga Margin ng Pahina',
    },
    hi: {
        ...en,
        index: 'सूची',
        search: 'खोजें',
        memorizationStats: 'याद करना',
        notifications: 'सूचनाएं',
        darkMode: 'डार्क',
        lightMode: 'लाइट',
        fontSize: 'फ़ॉन्ट आकार',
        bookmark: 'बुकमार्क',
        settings: 'सेटिंग्स',
        showAll: 'सभी दिखाएं',
        hideAll: 'सभी छिपाएं',
        hideRandomAyahs: 'यादृच्छिक आयतें',
        hideRandomWords: 'यादृच्छिक शब्द',
        toggleFirstWord: 'पहला शब्द',
        toggleLastWord: 'अंतिम शब्द',
        small: 'छोटा',
        medium: 'मध्यम',
        large: 'बड़ा',
        settingsTitle: 'सेटिंग्स',
        bottomBarCustomization: 'निचला बार अनुकूलन',
        showInBottomBar: 'निचले बार में दिखाएं',
        colorThemes: 'रंग थीम',
        soundSettings: 'ध्वनि सेटिंग्स',
        pageFlipSound: 'पृष्ठ पलटने की ध्वनि',
        wordAudioLongPress: 'लंबे प्रेस पर शब्द ध्वनि',
        language: 'भाषा',
        languages: 'भाषाएँ',
        textBrightness: 'पाठ चमक',
        backgroundBrightness: 'पृष्ठभूमि चमक',
        warmBeige: 'वार्म बेज',
        coolWhite: 'कूल व्हाइट',
        softCream: 'सॉफ्ट क्रीम',
        darkBlue: 'डार्क ब्लू',
        pureBlack: 'प्योर ब्लैक',
        warmDark: 'वार्म डार्क',
        save: 'सहेजें',
        cancel: 'रद्द करें',
        close: 'बंद करें',
        loading: 'लोड हो रहा है...',
        error: 'त्रुटि',

        // Toast Messages
        firstWordHidden: 'पहला शब्द छिपा दिया गया',
        firstWordShown: 'पहला शब्द दिखाया गया',
        lastWordHidden: 'अंतिम शब्द छिपा दिया गया',
        lastWordShown: 'अंतिम शब्द दिखाया गया',
        allAyahsHidden: 'सभी आयतें छिपा दी गईं',
        ayahsHiddenAtStopSigns: 'विराम चिह्नों पर आयतें छिपा दी गईं',
        randomWordsHidden: 'यादृच्छिक शब्द छिपा दिए गए',
        allWordsHidden: 'सभी शब्द छिपा दिए गए',
        randomHidden: 'यादृच्छिक छिपा दिया गया',
        weakAyahsHidden: 'कमजोर याद वाली आयतें छिपा दी गईं (लाल)',
        mediumAyahsHidden: 'मध्यम याद वाली आयतें छिपा दी गईं (पीला)',
        goodAyahsHidden: 'अच्छी याद वाली आयतें छिपा दी गईं (हरा)',
        notMemorizedAyahsHidden: 'याद नहीं की गई आयतें छिपा दी गईं',
        allAyahsShown: 'सभी आयतें दिखाई गईं',

        // Misc
        page: 'पृष्ठ',
        surah: 'सूरा',
        retry: 'पुनः प्रयास करें',

        // Surah Index
        juz: 'जुज़',
        recentPages: 'हाल के पृष्ठ',
        pageBookmarks: 'पृष्ठ बुकमार्क',
        noPageBookmarks: 'कोई पृष्ठ बुकमार्क नहीं',
        verseBookmarks: 'आयत बुकमार्क',
        noVerseBookmarks: 'कोई आयत बुकमार्क नहीं',
        delete: 'हटाएं',
        indexTitle: 'सूची',

        // Memorization Stats
        memorizationStatsTitle: 'याद करने के आंकड़े',
        fromAyahCount: '({count} में से)',
        good: 'अच्छा',
        weak: 'कमजोर',
        notRated: 'रेट नहीं किया गया',

        // Notification Manager
        notificationManagerTitle: 'अधिसूचना प्रबंधक',
        noNotifications: 'कोई सूचना नहीं। शुरू करने के लिए "जोड़ें" पर टैप करें।',
        daily: 'दैनिक',
        addNotification: 'सूचना जोड़ें',
        editNotification: 'सूचना संपादित करें',
        addNewNotification: 'नई सूचना जोड़ें',
        notificationName: 'सूचना का नाम',
        notificationNamePlaceholder: 'उदा. दैनिक पठन',
        notificationType: 'सूचना प्रकार',
        weekly: 'साप्ताहिक',
        selectDays: 'दिन चुनें',
        notificationTimes: 'सूचना समय',
        addAnotherTime: 'एक और समय जोड़ें',
        sunday: 'रविवार',
        monday: 'सोमवार',
        tuesday: 'मंगलवार',
        wednesday: 'बुधवार',
        thursday: 'गुरुवार',
        friday: 'शुक्रवार',
        saturday: 'शनिवार',

        // Quran Page Renderer
        hizb: 'हिज़्ब',
        firstRub: 'पहला रुब',
        secondRub: 'दूसरा रुब',
        thirdRub: 'तीसरा रुब',
        fourthRub: 'चौथा रुब',
        rateAyah: 'आयत को रेट करें',
        saveAyah: 'आयत सहेजें',

        // Ayah Options
        ayahOptions: 'आयत विकल्प {ayah}',
        addBookmark: 'बुकमार्क जोड़ें',

        // Display Settings Labels
        displaySettings: 'प्रदर्शन सेटिंग्स',
        defaultFontSize: 'डिफ़ॉल्ट फ़ॉन्ट आकार',
        lineSpacingLabel: 'पंक्ति रिक्ति',
        pageMarginsLabel: 'पृष्ठ मार्जिन',
    },
    ta: {
        ...en,
        index: 'குறியீடு',
        search: 'தேடு',
        memorizationStats: 'நினைவாற்றல்',
        notifications: 'அறிவிப்புகள்',
        darkMode: 'இருண்ட',
        lightMode: 'வெளிச்சம்',
        fontSize: 'எழுத்து அளவு',
        bookmark: 'புத்தகக்குறி',
        settings: 'அமைப்புகள்',
        showAll: 'அனைத்தையும் காட்டு',
        hideAll: 'அனைத்தையும் மறை',
        hideRandomAyahs: 'சீரற்ற வசனங்கள்',
        hideRandomWords: 'சீரற்ற சொற்கள்',
        toggleFirstWord: 'முதல் சொல்',
        toggleLastWord: 'கடைசி சொல்',
        small: 'சிறிய',
        medium: 'நடுத்தர',
        large: 'பெரிய',
        settingsTitle: 'அமைப்புகள்',
        bottomBarCustomization: 'கீழ் பட்டி தனிப்பயனாக்கம்',
        showInBottomBar: 'கீழ் பட்டியில் காட்டு',
        colorThemes: 'வண்ண தீம்கள்',
        soundSettings: 'ஒலி அமைப்புகள்',
        pageFlipSound: 'பக்க திருப்பும் ஒலி',
        wordAudioLongPress: 'நீண்ட அழுத்தத்தில் சொல் ஒலி',
        language: 'மொழி',
        languages: 'மொழிகள்',
        textBrightness: 'உரை வெளிச்சம்',
        backgroundBrightness: 'பின்னணி வெளிச்சம்',
        warmBeige: 'வெப்பமான பீஜ்',
        coolWhite: 'குளிர்ந்த வெள்ளை',
        softCream: 'மென்மையான கிரீம்',
        darkBlue: 'அடர் நீலம்',
        pureBlack: 'தூய கருப்பு',
        warmDark: 'வெப்பமான இருண்ட',
        save: 'சேமி',
        cancel: 'ரத்துசெய்',
        close: 'மூடு',
        loading: 'ஏற்றுகிறது...',
        error: 'பிழை',

        // Toast Messages
        firstWordHidden: 'முதல் சொல் மறைக்கப்பட்டது',
        firstWordShown: 'முதல் சொல் காட்டப்பட்டது',
        lastWordHidden: 'கடைசி சொல் மறைக்கப்பட்டது',
        lastWordShown: 'கடைசி சொல் காட்டப்பட்டது',
        allAyahsHidden: 'அனைத்து வசனங்களும் மறைக்கப்பட்டன',
        ayahsHiddenAtStopSigns: 'நிறுத்தக் குறிகளில் வசனங்கள் மறைக்கப்பட்டன',
        randomWordsHidden: 'சீரற்ற சொற்கள் மறைக்கப்பட்டன',
        allWordsHidden: 'அனைத்து சொற்களும் மறைக்கப்பட்டன',
        randomHidden: 'சீரற்ற முறையில் மறைக்கப்பட்டது',
        weakAyahsHidden: 'பலவீனமான வசனங்கள் மறைக்கப்பட்டன (சிவப்பு)',
        mediumAyahsHidden: 'நடுத்தர வசனங்கள் மறைக்கப்பட்டன (மஞ்சள்)',
        goodAyahsHidden: 'நன்கு மனப்பாடம் செய்யப்பட்ட வசனங்கள் மறைக்கப்பட்டன (பச்சை)',
        notMemorizedAyahsHidden: 'மனப்பாடம் செய்யாத வசனங்கள் மறைக்கப்பட்டன',
        allAyahsShown: 'அனைத்து வசனங்களும் காட்டப்பட்டன',

        // Misc
        page: 'பக்கம்',
        surah: 'சூரா',
        retry: 'மீண்டும் முயற்சி',

        // Surah Index
        juz: 'ஜுஸ்',
        recentPages: 'சமீபத்திய பக்கங்கள்',
        pageBookmarks: 'பக்க புத்தகக்குறிகள்',
        noPageBookmarks: 'பக்க புத்தகக்குறிகள் இல்லை',
        verseBookmarks: 'வசன புத்தகக்குறிகள்',
        noVerseBookmarks: 'வசன புத்தகக்குறிகள் இல்லை',
        delete: 'நீக்கு',
        indexTitle: 'குறியீடு',

        // Memorization Stats
        memorizationStatsTitle: 'நினைவாற்றல் புள்ளிவிவரங்கள்',
        fromAyahCount: '({count} இல்)',
        good: 'நன்று',
        weak: 'பலவீனம்',
        notRated: 'மதிப்பிடப்படவில்லை',

        // Notification Manager
        notificationManagerTitle: 'அறிவிப்பு மேலாளர்',
        noNotifications: 'அறிவிப்புகள் இல்லை. தொடங்க "சேர்" என்பதைத் தட்டவும்.',
        daily: 'தினசரி',
        addNotification: 'அறிவிப்பைச் சேர்',
        editNotification: 'அறிவிப்பைத் திருத்து',
        addNewNotification: 'புதிய அறிவிப்பைச் சேர்',
        notificationName: 'அறிவிப்பு பெயர்',
        notificationNamePlaceholder: 'எ.கா. தினசரி வாசிப்பு',
        notificationType: 'அறிவிப்பு வகை',
        weekly: 'வாராந்திர',
        selectDays: 'நாட்களைத் தேர்ந்தெடு',
        notificationTimes: 'அறிவிப்பு நேரங்கள்',
        addAnotherTime: 'மற்றொரு நேரத்தைச் சேர்',
        sunday: 'ஞாயிறு',
        monday: 'திங்கள்',
        tuesday: 'செவ்வாய்',
        wednesday: 'புதன்',
        thursday: 'வியாழன்',
        friday: 'வெள்ளி',
        saturday: 'சனி',

        // Quran Page Renderer
        hizb: 'ஹிஸ்ப்',
        firstRub: 'முதல் ருப்',
        secondRub: 'இரண்டாம் ருப்',
        thirdRub: 'மூன்றாம் ருப்',
        fourthRub: 'நான்காம் ருப்',
        rateAyah: 'வசனத்தை மதிப்பிடு',
        saveAyah: 'வசனத்தைச் சேமி',

        // Ayah Options
        ayahOptions: 'வசன விருப்பங்கள் {ayah}',
        addBookmark: 'புத்தகக்குறியைச் சேர்',

        // Display Settings Labels
        displaySettings: 'காட்சி அமைப்புகள்',
        defaultFontSize: 'இயல்புநிலை எழுத்து அளவு',
        lineSpacingLabel: 'வரி இடைவெளி',
        pageMarginsLabel: 'பக்க ஓரங்கள்',
    },
    si: {
        ...en,
        index: 'දර්ශකය',
        search: 'සොයන්න',
        memorizationStats: 'මතක තබා ගැනීම',
        notifications: 'දැනුම්දීම්',
        darkMode: 'අඳුරු',
        lightMode: 'ආලෝක',
        fontSize: 'අකුරු ප්‍රමාණය',
        bookmark: 'පොත් සලකුණ',
        settings: 'සැකසීම්',
        showAll: 'සියල්ල පෙන්වන්න',
        hideAll: 'සියල්ල සඟවන්න',
        hideRandomAyahs: 'අහඹු වාක්‍ය',
        hideRandomWords: 'අහඹු වචන',
        toggleFirstWord: 'පළමු වචනය',
        toggleLastWord: 'අවසාන වචනය',
        small: 'කුඩා',
        medium: 'මධ්‍යම',
        large: 'විශාල',
        settingsTitle: 'සැකසීම්',
        bottomBarCustomization: 'පහළ තීරුව සකසන්න',
        showInBottomBar: 'පහළ තීරුවේ පෙන්වන්න',
        colorThemes: 'වර්ණ තේමා',
        soundSettings: 'ශබ්ද සැකසීම්',
        pageFlipSound: 'පිටු පෙරළන ශබ්දය',
        wordAudioLongPress: 'දිගු එබීමේදී වචන ශබ්දය',
        language: 'භාෂාව',
        languages: 'භාෂා',
        textBrightness: 'පෙළ දීප්තිය',
        backgroundBrightness: 'පසුබිම් දීප්තිය',
        warmBeige: 'උණුසුම් බේජ්',
        coolWhite: 'සිසිල් සුදු',
        softCream: 'මෘදු ක්‍රීම්',
        darkBlue: 'තද නිල්',
        pureBlack: 'පිරිසිදු කළු',
        warmDark: 'උණුසුම් අඳුරු',
        save: 'සුරකින්න',
        cancel: 'අවලංගු කරන්න',
        close: 'වසන්න',
        loading: 'පූරණය වෙමින්...',
        error: 'දෝෂයකි',

        // Toast Messages
        firstWordHidden: 'පළමු වචනය සැඟවිණි',
        firstWordShown: 'පළමු වචනය පෙන්වයි',
        lastWordHidden: 'අවසාන වචනය සැඟවිණි',
        lastWordShown: 'අවසාන වචනය පෙන්වයි',
        allAyahsHidden: 'සියලුම වාක්‍ය සැඟවිණි',
        ayahsHiddenAtStopSigns: 'නැවතුම් ලකුණු වලදී වාක්‍ය සැඟවිණි',
        randomWordsHidden: 'අහඹු වචන සැඟවිණි',
        allWordsHidden: 'සියලුම වචන සැඟවිණි',
        randomHidden: 'අහඹු ලෙස සැඟවිණි',
        weakAyahsHidden: 'දුර්වල වාක්‍ය සැඟවිණි (රතු)',
        mediumAyahsHidden: 'මධ්‍යම වාක්‍ය සැඟවිණි (කහ)',
        goodAyahsHidden: 'හොඳ වාක්‍ය සැඟවිණි (කොළ)',
        notMemorizedAyahsHidden: 'මතක තබා නොගත් වාක්‍ය සැඟවිණි',
        allAyahsShown: 'සියලුම වාක්‍ය පෙන්වයි',

        // Misc
        page: 'පිටුව',
        surah: 'සූරතය',
        retry: 'නැවත උත්සාහ කරන්න',

        // Surah Index
        juz: 'ජුස්',
        recentPages: 'මෑත පිටු',
        pageBookmarks: 'පිටු පොත් සලකුණු',
        noPageBookmarks: 'පිටු පොත් සලකුණු නැත',
        verseBookmarks: 'වාක්‍ය පොත් සලකුණු',
        noVerseBookmarks: 'වාක්‍ය පොත් සලකුණු නැත',
        delete: 'මකන්න',
        indexTitle: 'දර්ශකය',

        // Memorization Stats
        memorizationStatsTitle: 'මතක තබා ගැනීමේ සංඛ්‍යාලේඛන',
        fromAyahCount: '({count} න්)',
        good: 'හොඳයි',
        weak: 'දුර්වලයි',
        notRated: 'ශ්‍රේණිගත කර නැත',

        // Notification Manager
        notificationManagerTitle: 'දැනුම්දීම් කළමනාකරු',
        noNotifications: 'දැනුම්දීම් නැත. ආරම්භ කිරීමට "එක් කරන්න" තට්ටු කරන්න.',
        daily: 'දිනපතා',
        addNotification: 'දැනුම්දීම එක් කරන්න',
        editNotification: 'දැනුම්දීම සංස්කරණය',
        addNewNotification: 'නව දැනුම්දීමක් එක් කරන්න',
        notificationName: 'දැනුම්දීමේ නම',
        notificationNamePlaceholder: 'උදා. දිනපතා කියවීම',
        notificationType: 'දැනුම්දීම් වර්ගය',
        weekly: 'සතිපතා',
        selectDays: 'නාட்களைத் தேர்ந்தெடு',
        notificationTimes: 'දැනුම්දීම් වේලාවන්',
        addAnotherTime: 'තවත් වේලාවක් එක් කරන්න',
        sunday: 'ඉරිදා',
        monday: 'සඳුදා',
        tuesday: 'අඟහරුවාදා',
        wednesday: 'බදාදා',
        thursday: 'බ්‍රහස්පතින්දා',
        friday: 'සිකුරාදා',
        saturday: 'සෙනසුරාදා',

        // Quran Page Renderer
        hizb: 'හිස්බ්',
        firstRub: 'පළමු රුබ්',
        secondRub: 'දෙවන රුබ්',
        thirdRub: 'තෙවන රුබ්',
        fourthRub: 'සිව්වන රුබ්',
        rateAyah: 'වාක්‍යය ශ්‍රේණිගත කරන්න',
        saveAyah: 'වාක්‍යය සුරකින්න',

        // Ayah Options
        ayahOptions: 'වාක්‍ය විකල්ප {ayah}',
        addBookmark: 'පොත් සලකුණ එක් කරන්න',

        // Display Settings Labels
        displaySettings: 'දර්ශන සැකසීම්',
        defaultFontSize: 'පෙරනිමි අකුරු ප්‍රමාණය',
        lineSpacingLabel: 'පේළි පරතරය',
        pageMarginsLabel: 'පිටු මායිම්',
    },
    am: {
        ...en,
        index: 'ማውጫ',
        search: 'ፈልግ',
        memorizationStats: 'ማስታወስ',
        notifications: 'ማሳወቂያዎች',
        darkMode: 'ጨለማ',
        lightMode: 'ብርሃን',
        fontSize: 'የፊደል መጠን',
        bookmark: 'ዕልባት',
        settings: 'ቅንብሮች',
        showAll: 'ሁሉንም አሳይ',
        hideAll: 'ሁሉንም ደብቅ',
        hideRandomAyahs: 'የዘፈቀደ አንቀጾች',
        hideRandomWords: 'የዘፈቀደ ቃላት',
        toggleFirstWord: 'የመጀመሪያ ቃል',
        toggleLastWord: 'የመጨረሻ ቃል',
        small: 'ትንሽ',
        medium: 'መካከለኛ',
        large: 'ትልቅ',
        settingsTitle: 'ቅንብሮች',
        bottomBarCustomization: 'የታችኛው አሞሌ ማበጀት',
        showInBottomBar: 'በታችኛው አሞሌ አሳይ',
        colorThemes: 'የቀለም ገጽታዎች',
        soundSettings: 'የድምጽ ቅንብሮች',
        pageFlipSound: 'የገጽ መገልበጥ ድምጽ',
        wordAudioLongPress: 'በረጅሙ ሲጫኑ የቃል ድምጽ',
        language: 'ቋንቋ',
        languages: 'ቋንቋዎች',
        textBrightness: 'የጽሑፍ ብሩህነት',
        backgroundBrightness: 'የጀርባ ብሩህነት',
        warmBeige: 'ሞቅ ያለ ቤዥ',
        coolWhite: 'ቀዝቃዛ ነጭ',
        softCream: 'ለስላሳ ክሬም',
        darkBlue: 'ጥቁር ሰማያዊ',
        pureBlack: 'ንጹህ ጥቁር',
        warmDark: 'ሞቅ ያለ ጨለማ',
        save: 'አስቀምጥ',
        cancel: 'ሰርዝ',
        close: 'ዝጋ',
        loading: 'በመጫን ላይ...',
        error: 'ስህተት',

        // Toast Messages
        firstWordHidden: 'የመጀመሪያው ቃል ተደብቋል',
        firstWordShown: 'የመጀመሪያው ቃል ታይቷል',
        lastWordHidden: 'የመጨረሻው ቃል ተደብቋል',
        lastWordShown: 'የመጨረሻው ቃል ታይቷል',
        allAyahsHidden: 'ሁሉም አንቀጾች ተደብቀዋል',
        ayahsHiddenAtStopSigns: 'አንቀጾች በማቆሚያ ምልክቶች ተደብቀዋል',
        randomWordsHidden: 'የዘፈቀደ ቃላት ተደብቀዋል',
        allWordsHidden: 'ሁሉም ቃላት ተደብቀዋል',
        randomHidden: 'በዘፈቀደ ተደብቋል',
        weakAyahsHidden: 'ደካማ አንቀጾች ተደብቀዋል (ቀይ)',
        mediumAyahsHidden: 'መካከለኛ አንቀጾች ተደብቀዋል (ቢጫ)',
        goodAyahsHidden: 'ጥሩ አንቀጾች ተደብቀዋል (አረንጓዴ)',
        notMemorizedAyahsHidden: 'ያልተያዙ አንቀጾች ተደብቀዋል',
        allAyahsShown: 'ሁሉም አንቀጾች ታይተዋል',

        // Misc
        page: 'ገጽ',
        surah: 'ሱራ',
        retry: 'እንደገና ሞክር',

        // Surah Index
        juz: 'ጁዝ',
        recentPages: 'የቅርብ ጊዜ ገጾች',
        pageBookmarks: 'የገጽ ዕልባቶች',
        noPageBookmarks: 'ምንም የገጽ ዕልባቶች የሉም',
        verseBookmarks: 'የአንቀጽ ዕልባቶች',
        noVerseBookmarks: 'ምንም የአንቀጽ ዕልባቶች የሉም',
        delete: 'ሰርዝ',
        indexTitle: 'ማውጫ',

        // Memorization Stats
        memorizationStatsTitle: 'የማስታወስ ስታቲስቲክስ',
        fromAyahCount: '(ከ {count})',
        good: 'ጥሩ',
        weak: 'ደካማ',
        notRated: 'አልተሰጠም',

        // Notification Manager
        notificationManagerTitle: 'የማሳወቂያ አስተዳዳሪ',
        noNotifications: 'ምንም ማሳወቂያዎች የሉም። ለመጀመር "አክል"ን ይንኩ።',
        daily: 'በየቀኑ',
        addNotification: 'ማሳወቂያ አክል',
        editNotification: 'ማሳወቂያን አርትዕ',
        addNewNotification: 'አዲስ ማሳወቂያ አክል',
        notificationName: 'የማሳወቂያ ስም',
        notificationNamePlaceholder: 'ለምሳሌ. የዕለት ንባብ',
        notificationType: 'የማሳወቂያ አይነት',
        weekly: 'በየሳምንቱ',
        selectDays: 'ቀናትን ይምረጡ',
        notificationTimes: 'የማሳወቂያ ጊዜዎች',
        addAnotherTime: 'ሌላ ጊዜ አክል',
        sunday: 'እሁድ',
        monday: 'ሰኞ',
        tuesday: 'ማክሰኞ',
        wednesday: 'ረቡዕ',
        thursday: 'ሐሙስ',
        friday: 'አርብ',
        saturday: 'ቅዳሜ',

        // Quran Page Renderer
        hizb: 'ሂዝብ',
        firstRub: 'የመጀመሪያ ሩብ',
        secondRub: 'ሁለተኛ ሩብ',
        thirdRub: 'ሶስተኛ ሩብ',
        fourthRub: 'አራተኛ ሩብ',
        rateAyah: 'አንቀጽ ደረጃ ይስጡ',
        saveAyah: 'አንቀጽ አስቀምጥ',

        // Ayah Options
        ayahOptions: 'የአንቀጽ አማራጮች {ayah}',
        addBookmark: 'ዕልባት አክል',

        // Display Settings Labels
        displaySettings: 'የማሳያ ቅንብሮች',
        defaultFontSize: 'ነባሪ የፊደል መጠን',
        lineSpacingLabel: 'የመስመር ክፍተት',
        pageMarginsLabel: 'የገጽ ጠርዞች',
    },
    yo: {
        ...en,
        index: 'Atọka',
        search: 'Wa',
        memorizationStats: 'Iranti',
        notifications: 'Ifitonileti',
        darkMode: 'Dudu',
        lightMode: 'Imọlẹ',
        fontSize: 'Iwọn Fonti',
        bookmark: 'Ami-iwe',
        settings: 'Ètò',
        showAll: 'Ṣe afihan Gbogbo',
        hideAll: 'Tọju Gbogbo',
        hideRandomAyahs: 'Awọn Ayah ID',
        hideRandomWords: 'Awọn Ọrọ ID',
        toggleFirstWord: 'Ọrọ Akọkọ',
        toggleLastWord: 'Ọrọ Ikẹhin',
        small: 'Kekere',
        medium: 'Alabọde',
        large: 'Nla',
        settingsTitle: 'Ètò',
        bottomBarCustomization: 'Isọdi Pẹpẹ Isalẹ',
        showInBottomBar: 'Ṣe afihan ni Pẹpẹ Isalẹ',
        colorThemes: 'Awọn Akori Awọ',
        soundSettings: 'Awọn Eto Ohun',
        pageFlipSound: 'Ohun Yiyi Oju-iwe',
        wordAudioLongPress: 'Ohun ọrọ lori titẹ gigun',
        language: 'Èdè',
        languages: 'Àwọn èdè',
        textBrightness: 'Imọlẹ Ọrọ',
        backgroundBrightness: 'Imọlẹ Lẹhin',
        warmBeige: 'Beige Gbona',
        coolWhite: 'Funfun Tutu',
        softCream: 'Ipara Rirọ',
        darkBlue: 'Bulu Dudu',
        pureBlack: 'Dudu Mimọ',
        warmDark: 'Dudu Gbona',
        save: 'Fipamọ',
        cancel: 'Fagilee',
        close: 'Paade',
        loading: 'Nkojọpọ...',
        error: 'Aṣiṣe',

        // Toast Messages
        firstWordHidden: 'Ọrọ akọkọ ti farapamọ',
        firstWordShown: 'Ọrọ akọkọ han',
        lastWordHidden: 'Ọrọ ikẹhin ti farapamọ',
        lastWordShown: 'Ọrọ ikẹhin han',
        allAyahsHidden: 'Gbogbo awọn ayah ti farapamọ',
        ayahsHiddenAtStopSigns: 'Awọn ayah farapamọ ni awọn ami idaduro',
        randomWordsHidden: 'Awọn ọrọ ID ti farapamọ',
        allWordsHidden: 'Gbogbo awọn ọrọ ti farapamọ',
        randomHidden: 'ID farapamọ',
        weakAyahsHidden: 'Awọn ayah alailagbara farapamọ (Pupa)',
        mediumAyahsHidden: 'Awọn ayah alabọde farapamọ (Sharif)',
        goodAyahsHidden: 'Awọn ayah to dara farapamọ (Alawọ ewe)',
        notMemorizedAyahsHidden: 'Awọn ayah ti ko ranti farapamọ',
        allAyahsShown: 'Gbogbo awọn ayah han',

        // Misc
        page: 'Oju-iwe',
        surah: 'Surah',
        retry: 'Gbiyanju lẹẹkansi',

        // Surah Index
        juz: 'Juz',
        recentPages: 'Awọn Oju-iwe Laipẹ',
        pageBookmarks: 'Awọn Ami-iwe Oju-iwe',
        noPageBookmarks: 'Ko si awọn ami-iwe oju-iwe',
        verseBookmarks: 'Awọn Ami-iwe Ẹsẹ',
        noVerseBookmarks: 'Ko si awọn ami-iwe ẹsẹ',
        delete: 'Paarẹ',
        indexTitle: 'Atọka',

        // Memorization Stats
        memorizationStatsTitle: 'Awọn iṣiro Iranti',
        fromAyahCount: '(lati {count})',
        good: 'O dara',
        weak: 'Ko lagbara',
        notRated: 'Ko ṣe idiyele',

        // Notification Manager
        notificationManagerTitle: 'Oluṣakoso Ifitonileti',
        noNotifications: 'Ko si awọn ifitonileti. Tẹ "Ṣafikun" lati bẹrẹ.',
        daily: 'Ojoojumọ',
        addNotification: 'Ṣafikun Ifitonileti',
        editNotification: 'Ṣatunkọ Ifitonileti',
        addNewNotification: 'Ṣafikun Ifitonileti Tuntun',
        notificationName: 'Orukọ Ifitonileti',
        notificationNamePlaceholder: 'fun apẹẹrẹ. Kika Ojoojumọ',
        notificationType: 'Iru Ifitonileti',
        weekly: 'Ọsẹ',
        selectDays: 'Yan Awọn Ọjọ',
        notificationTimes: 'Awọn Akoko Ifitonileti',
        addAnotherTime: 'Ṣafikun Akoko Miiran',
        sunday: 'Sunday',
        monday: 'Monday',
        tuesday: 'Tuesday',
        wednesday: 'Wednesday',
        thursday: 'Thursday',
        friday: 'Friday',
        saturday: 'Saturday',

        // Quran Page Renderer
        hizb: 'Hizb',
        firstRub: 'Rub Akọkọ',
        secondRub: 'Rub Keji',
        thirdRub: 'Rub Kẹta',
        fourthRub: 'Rub Kẹrin',
        rateAyah: 'Oṣuwọn Ayah',
        saveAyah: 'Fipamọ Ayah',

        // Ayah Options
        ayahOptions: 'Awọn Aṣayan Ayah {ayah}',
        addBookmark: 'Ṣafikun Ami-iwe',

        // Display Settings Labels
        displaySettings: 'Awọn Eto Ifihan',
        defaultFontSize: 'Iwọn Fonti Aiyipada',
        lineSpacingLabel: 'Aye ILA',
        pageMarginsLabel: 'Awọn ala Oju-iwe',
    },
    om: {
        ...en,
        index: 'Tarree',
        search: 'Barbaadi',
        memorizationStats: 'Yaadannoo',
        notifications: 'Beeksisa',
        darkMode: 'Dukkana',
        lightMode: 'Ifaa',
        fontSize: 'Hamma Qubee',
        bookmark: 'Mallattoo',
        settings: 'Qindaa\'ina',
        showAll: 'Hunda Agarsiisi',
        hideAll: 'Hunda Dhoksi',
        hideRandomAyahs: 'Aayatoota Tasaa',
        hideRandomWords: 'Jechi Tasaa',
        toggleFirstWord: 'Jecha Jalqabaa',
        toggleLastWord: 'Jecha Dhumaa',
        small: 'Xiqqaa',
        medium: 'Giddu-galeessa',
        large: 'Guddaa',
        settingsTitle: 'Qindaa\'ina',
        bottomBarCustomization: 'Barruu Gadii Mijeessi',
        showInBottomBar: 'Barruu Gadii Irratti Agarsiisi',
        colorThemes: 'Bifa Halluu',
        soundSettings: 'Qindaa\'ina Sagalee',
        pageFlipSound: 'Sagalee Fuula Garagalchuu',
        wordAudioLongPress: 'Sagalee jecha lakkofsa dheeraa',
        language: 'Afaan',
        languages: 'Afaanota',
        textBrightness: 'Ifa Barruu',
        backgroundBrightness: 'Ifa Duubaa',
        warmBeige: 'Beige Ho\'aa',
        coolWhite: 'Adii Qabbanaawaa',
        softCream: 'Kiriimii Lallaafaa',
        darkBlue: 'Cuquliisa Dukkanaa',
        pureBlack: 'Gurraacha Qulqulluu',
        warmDark: 'Dukkana Ho\'aa',
        save: 'Olkaa\'i',
        cancel: 'Haqi',
        close: 'Cufi',
        loading: 'Fe\'aa jira...',
        error: 'Dogoggora',

        // Toast Messages
        firstWordHidden: 'Jechi jalqabaa dhokateera',
        firstWordShown: 'Jechi jalqabaa mul\'ateera',
        lastWordHidden: 'Jechi dhumaa dhokateera',
        lastWordShown: 'Jechi dhumaa mul\'ateera',
        allAyahsHidden: 'Aayatoonni hundi dhokataniiru',
        ayahsHiddenAtStopSigns: 'Aayatoonni mallattoo dhaabbannaa irratti dhokataniiru',
        randomWordsHidden: 'Jechoonni tasaa dhokataniiru',
        allWordsHidden: 'Jechoonni hundi dhokataniiru',
        randomHidden: 'Tasa dhokateera',
        weakAyahsHidden: 'Aayatoonni dadhaboo dhokataniiru (Diimaa)',
        mediumAyahsHidden: 'Aayatoonni giddu-galeessa dhokataniiru (Keelloo)',
        goodAyahsHidden: 'Aayatoonni gaarii dhokataniiru (Magariisa)',
        notMemorizedAyahsHidden: 'Aayatoonni hin qabamne dhokataniiru',
        allAyahsShown: 'Aayatoonni hundi mul\'ataniiru',

        // Misc
        page: 'Fuula',
        surah: 'Suuraa',
        retry: 'Irra Deebi\'i',

        // Surah Index
        juz: 'Juz',
        recentPages: 'Fuulota Dhihoo',
        pageBookmarks: 'Mallattoo Fuulaa',
        noPageBookmarks: 'Mallattoo fuulaa hin jiru',
        verseBookmarks: 'Mallattoo Aayaa',
        noVerseBookmarks: 'Mallattoo aayaa hin jiru',
        delete: 'Haqi',
        indexTitle: 'Tarree',

        // Memorization Stats
        memorizationStatsTitle: 'Istatistiksii Yaadannoo',
        fromAyahCount: '({count} keessaa)',
        good: 'Gaarii',
        weak: 'Dadhabaa',
        notRated: 'Hin madaalamne',

        // Notification Manager
        notificationManagerTitle: 'Gaggeessaa Beeksisaa',
        noNotifications: 'Beeksisni hin jiru. Jalqabuuf "Dabalata" tuqi.',
        daily: 'Guyyaa Guyyaan',
        addNotification: 'Beeksisa Dabali',
        editNotification: 'Beeksisa Gulaali',
        addNewNotification: 'Beeksisa Haaraa Dabali',
        notificationName: 'Maqaa Beeksisaa',
        notificationNamePlaceholder: 'fkn. Dubbisa Guyyaa',
        notificationType: 'Gosa Beeksisaa',
        weekly: 'Torban Torbaniin',
        selectDays: 'Guyyoota Filadhu',
        notificationTimes: 'Yeroo Beeksisaa',
        addAnotherTime: 'Yeroo Biraa Dabali',
        sunday: 'Dilbata',
        monday: 'Wiixata',
        tuesday: 'Kibxata',
        wednesday: 'Roobii',
        thursday: 'Kamisa',
        friday: 'Jimaata',
        saturday: 'Sanbata',

        // Quran Page Renderer
        hizb: 'Hizb',
        firstRub: 'Rub Jalqabaa',
        secondRub: 'Rub Lammaffaa',
        thirdRub: 'Rub Sadaffaa',
        fourthRub: 'Rub Afraffaa',
        rateAyah: 'Aayaa Madaali',
        saveAyah: 'Aayaa Olkaa\'i',

        // Ayah Options
        ayahOptions: 'Filannoo Aayaa {ayah}',
        addBookmark: 'Mallattoo Dabali',

        // Display Settings Labels
        displaySettings: 'Qindaa\'ina Agarsiisaa',
        defaultFontSize: 'Hamma Qubee Durtii',
        lineSpacingLabel: 'Garaagarummaa Sararaa',
        pageMarginsLabel: 'Daangaa Fuulaa',
    },
    rw: {
        ...en,
        index: 'Urutonde',
        search: 'Shakisha',
        memorizationStats: 'Gufata',
        notifications: 'Amenyesha',
        darkMode: 'Umwijima',
        lightMode: 'Urumuri',
        fontSize: 'Ingano y\'inyandiko',
        bookmark: 'Akamenyetso',
        settings: 'Igenamiterere',
        showAll: 'Erekana Byose',
        hideAll: 'Hisha Byose',
        hideRandomAyahs: 'Ayat Zidasanzwe',
        hideRandomWords: 'Amagambo Adasanzwe',
        toggleFirstWord: 'Ijambo rya Mbere',
        toggleLastWord: 'Ijambo rya Nyuma',
        small: 'Bito',
        medium: 'Hagati',
        large: 'Binini',
        settingsTitle: 'Igenamiterere',
        bottomBarCustomization: 'Guhindura Umurongo wo Hasi',
        showInBottomBar: 'Erekana mu Murongo wo Hasi',
        colorThemes: 'Insanganyamatsiko z\'Amabara',
        soundSettings: 'Igenamiterere ry\'Amajwi',
        pageFlipSound: 'Ijwi ryo guhindura paji',
        wordAudioLongPress: 'Ijwi ry\'ijambo ryo gukanda cyane',
        language: 'Ururimi',
        languages: 'Indimi',
        textBrightness: 'Urumuri rw\'Inyandiko',
        backgroundBrightness: 'Urumuri rw\'Inyuma',
        warmBeige: 'Beige Ishyushye',
        coolWhite: 'Umweru Ukonje',
        softCream: 'Cream Yoroheje',
        darkBlue: 'Ubururu Bwijimye',
        pureBlack: 'Umukara Wuzuye',
        warmDark: 'Umwijima Ushyushye',
        save: 'Bika',
        cancel: 'Kureka',
        close: 'Funga',
        loading: 'Birimo gupakira...',
        error: 'Ikosa',

        // Toast Messages
        firstWordHidden: 'Ijambo rya mbere ryahishwe',
        firstWordShown: 'Ijambo rya mbere ryagaragaye',
        lastWordHidden: 'Ijambo rya nyuma ryahishwe',
        lastWordShown: 'Ijambo rya nyuma ryagaragaye',
        allAyahsHidden: 'Ayat zose zahishwe',
        ayahsHiddenAtStopSigns: 'Ayat zahishwe ku bimenyetso byo guhagarara',
        randomWordsHidden: 'Amagambo adasanzwe yahishwe',
        allWordsHidden: 'Amagambo yose yahishwe',
        randomHidden: 'Byahishwe bidasanzwe',
        weakAyahsHidden: 'Ayat zifite intege nke zahishwe (Umutuku)',
        mediumAyahsHidden: 'Ayat ziciriritse zahishwe (Umuhondo)',
        goodAyahsHidden: 'Ayat nziza zahishwe (Icyatsi)',
        notMemorizedAyahsHidden: 'Ayat zitafashwe mu mutwe zahishwe',
        allAyahsShown: 'Ayat zose zagaragaye',

        // Misc
        page: 'Paji',
        surah: 'Surah',
        retry: 'Gerageza nanone',

        // Surah Index
        juz: 'Juz',
        recentPages: 'Paji za Vuba',
        pageBookmarks: 'Utumenyetso twa Paji',
        noPageBookmarks: 'Nta tumenyetso twa paji',
        verseBookmarks: 'Utumenyetso twa Ayat',
        noVerseBookmarks: 'Nta tumenyetso twa ayat',
        delete: 'Siba',
        indexTitle: 'Urutonde',

        // Memorization Stats
        memorizationStatsTitle: 'Imibare yo gufata mu mutwe',
        fromAyahCount: '(kuri {count})',
        good: 'Byiza',
        weak: 'Intege nke',
        notRated: 'Nta kigero',

        // Notification Manager
        notificationManagerTitle: 'Umuyobozi w\'amenyesha',
        noNotifications: 'Nta menyesha. Kanda "Ongeraho" kugira ngo utangire.',
        daily: 'Buri munsi',
        addNotification: 'Ongeraho Amenyesha',
        editNotification: 'Hindura Amenyesha',
        addNewNotification: 'Ongeraho Amenyesha Mashya',
        notificationName: 'Izina ry\'Amenyesha',
        notificationNamePlaceholder: 'urugero. Gusoma Buri Munsi',
        notificationType: 'Ubwoko bw\'Amenyesha',
        weekly: 'Buri cyumweru',
        selectDays: 'Hitamo Iminsi',
        notificationTimes: 'Ibihe by\'Amenyesha',
        addAnotherTime: 'Ongeraho Igihe Kindi',
        sunday: 'Ku cyumweru',
        monday: 'Kuwa mbere',
        tuesday: 'Kuwa kabiri',
        wednesday: 'Kuwa gatatu',
        thursday: 'Kuwa kane',
        friday: 'Kuwa gatanu',
        saturday: 'Kuwa gatandatu',

        // Quran Page Renderer
        hizb: 'Hizb',
        firstRub: 'Rub ya Mbere',
        secondRub: 'Rub ya Kabiri',
        thirdRub: 'Rub ya Gatatu',
        fourthRub: 'Rub ya Kane',
        rateAyah: 'Tanga amanota kuri Ayat',
        saveAyah: 'Bika Ayat',

        // Ayah Options
        ayahOptions: 'Amahitamo ya Ayat {ayah}',
        addBookmark: 'Ongeraho Akamenyetso',

        // Display Settings Labels
        displaySettings: 'Igenamiterere ry\'Iyerekana',
        defaultFontSize: 'Ingano y\'Inyandiko Isanzwe',
        lineSpacingLabel: 'Intera y\'Imirongo',
        pageMarginsLabel: 'Imbibi za Paji',
    },
    bs: en,
    sq: en,
    uz: en,
    kk: en,
    ku: en,
    vi: en,
    tl: en,
};

export const LANGUAGE_NAMES: Record<Language, string> = {
    ar: 'العربية',
    en: 'English',
    id: 'Bahasa Indonesia',
    ms: 'Bahasa Melayu',
    ur: 'اردو',
    bn: 'বাংলা',
    tr: 'Türkçe',
    fa: 'فارسی',
    ha: 'Hausa',
    fr: 'Français',
    es: 'Español',
    de: 'Deutsch',
    ru: 'Русский',
    sw: 'Kiswahili',
    zh: '中文',
    ko: '한국어',
    ja: '日本語',
    bs: 'Bosanski',
    sq: 'Shqip',
    uz: 'O\'zbekcha',
    kk: 'Қазақша',
    ku: 'Kurdî',
    vi: 'Tiếng Việt',
    tl: 'Tagalog',
    hi: 'हिन्दी',
    ta: 'தமிழ்',
    si: 'සිංහල',
    am: 'አማርኛ',
    yo: 'Yorùbá',
    om: 'Afaan Oromoo',
    rw: 'Kinyarwanda'
};
