// Translation system for 27 languages
export type Language =
    | 'ar' | 'en' | 'id' | 'ms' | 'ur' | 'bn' | 'tr' | 'fa' | 'ha' | 'fr'
    | 'es' | 'de' | 'ru' | 'sw' | 'zh' | 'ko' | 'ja' | 'bs' | 'sq' | 'uz'
    | 'kk' | 'ku' | 'vi' | 'tl' | 'hi' | 'ta' | 'si' | 'am' | 'yo' | 'om'
    | 'rw';

export interface Translations {
    dir: string;
    index: string;
    search: string;
    memorizationStats: string;
    notifications: string;
    darkMode: string;
    lightMode: string;
    fontSize: string;
    bookmark: string;
    settings: string;
    chooseColor: string;
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
    small: string;
    medium: string;
    large: string;
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
    warmBeige: string;
    coolWhite: string;
    softCream: string;
    darkBlue: string;
    pureBlack: string;
    warmDark: string;
    save: string;
    cancel: string;
    close: string;
    loading: string;
    stop: string;
    repeatMode: string;
    error: string;
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
    page: string;
    surah: string;
    verse: string;
    retry: string;
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
    memorizationStatsTitle: string;
    fromAyahCount: string;
    good: string;
    weak: string;
    notRated: string;
    notificationManagerTitle: string;
    noNotifications: string;
    inAppNotifModalTitle: string;
    inAppNotifNewBadge: string;
    inAppNotifMarkAllRead: string;
    inAppNotifClearAll: string;
    inAppNotifEmpty: string;
    inAppNotifEmptyDesc: string;
    notif_surah_reminder: string;
    notif_surah_kahf_body: string;
    notif_surah_mulk_body: string;
    notif_surah_baqarah_body: string;
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
    hizb: string;
    firstRub: string;
    secondRub: string;
    thirdRub: string;
    fourthRub: string;
    rateAyah: string;
    saveAyah: string;
    ayahOptions: string;
    playAyah: string;
    addBookmark: string;
    removeBookmark: string;
    rateMemorization: string;
    ayahCopied: string;
    errorCopying: string;
    tafsirAyah: string;
    displaySettings: string;
    defaultFontSize: string;
    lineSpacingLabel: string;
    pageMarginsLabel: string;
    prayerMode: string;
    selectTheme: string;
    colorStopSigns: string;
    contact: string;
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
    sideMenu: string;
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
    gestureSettings: string;
    gestureTwoFingerTap: string;
    gestureDoubleTap: string;
    gestureSwipeUp: string;
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
    rateSurah: string;
    rateRange: string;
    fromAyah: string;
    toAyah: string;
    applyRating: string;
    pleaseSelectRating: string;
    ayahNumberBetween: string;
    startMustBeLess: string;
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
    betaVersion: string;
    trialVersion: string;
    quranWordMeanings: string;
    step1: string;
    step2: string;
    appUpdateAvailable: string;
    appIsInstalled: string;
    startingInstall: string;
    clickToInstallLatest: string;
    weWillUpdateCode: string;
    installAppFrame: string;
    mushafFullyUpdated: string;
    browseOfflineNow: string;
    noteInstallationSteps: string;
    exportHeaderJuz: string;
    exportHeaderPage: string;
    exportHeaderSurah: string;
    exportHeaderAyah: string;
    exportUnknown: string;
    viewMutashabihat: string;
    addMutashabihat: string;
    internetRequired: string;
    unknown: string;
    rateEntireSurah: string;
    rateMultipleAyahs: string;
    enableNotification: string;
    disableNotification: string;
    deleteNotification: string;
    fromPageToPage: string;
    tutorialVideoTitle: string;
    tutorialVideoDesc: string;
    installAndDownload: string;
    shareApp: string;
    countryEgypt: string;
    countrySaudi: string;
    countryIndonesia: string;
    countryJordan: string;
    countryMorocco: string;
    liveUpdate: string;
    platformAnalytics: string;
    tourWelcomeTitle: string;
    tourWelcomeSubtitle: string;
    tourWelcomeDesc: string;
    tourBetaNote: string;
    tourStartAction: string;
    tourSkipAction: string;
    tourShowAllTitle: string;
    tourShowAllDesc: string;
    tourHideAllTitle: string;
    tourHideAllDesc: string;
    tourHideAyahsTitle: string;
    tourHideAyahsDesc: string;
    tourHideWordsTitle: string;
    tourHideWordsDesc: string;
    tourFirstWordTitle: string;
    tourFirstWordDesc: string;
    tourLastWordTitle: string;
    tourLastWordDesc: string;
    tourSurahNameTitle: string;
    tourSurahNameDesc: string;
    tourAyahNumberTitle: string;
    tourAyahNumberDesc: string;
    tourAyahColorsTitle: string;
    tourAyahColorsDesc: string;
    tourWeak: string;
    tourMedium: string;
    tourGood: string;
    tourMutashabihatTitle: string;
    tourMutashabihatDesc: string;
    tourSameSurah: string;
    tourOtherSurahs: string;
    tourBoth: string;
    tourLongPressTitle: string;
    tourLongPressDesc: string;
    tourMoreFeaturesTitle: string;
    tourMoreFeaturesDesc: string;
    tourNext: string;
    tourPrevious: string;
    tourFinish: string;
    tourClickAnywhereTitle: string;
    tourClickAnywhereSubtitle: string;
    tourClickAnywhereDesc: string;
    surahNames: string[];
    tourAyahColorsDescText: string;
    tourMutashabihatDescText: string;
    tourHideAyahsDescText: string;
    hideRatedVerses: string;
    shareAppDesc: string;
    followUs: string;
    youtube: string;
    facebook: string;
    tourAyahNumberDescText: string;
    tourMemorizationPwr: string;
    tourBookmarkDesc: string;
    tourMutashabihatDescShort: string;
    tourAssessment: string;
    tourBookmark: string;
    tourViewMutashabihat: string;
    tourAudioPlayerTitle: string;
    tourAudioPlayerDesc: string;
    tourDownloadAppTitle: string;
    tourDownloadAppDesc: string;
    tourTutorialsTitle: string;
    tourTutorialsDesc: string;
    tourPrayerModeTitle: string;
    tourPrayerModeDesc: string;
    recitationSettings: string;
    fromSurah: string;
    toSurah: string;
    ayahText: string;
    playVerseGroup: string;
    playEachAyah: string;
    playbackSpeed: string;
    playOnlySelectedRange: string;
    apply: string;
    reciters: Record<string, string>;
    downloadAudioOptional: string;
    downloadManager: string;
    saveOfflineDesc: string;
    fullRecitations: string;
    wordsAudio: string;
    selectReciter: string;
    alreadyDownloaded: string;
    downloading: string;
    downloadSurah: string;
    downloaded: string;
    downloadAction: string;
    wordMeaningsNote: string;
    ayahRecitation: string;
    interactiveTour: string;
    gotIt: string;
    spaceSavingTip: string;
    clearAudioCache: string;
    confirmDeletion: string;
    confirmDeleteCacheMsg: string;
    yesClearDownloads: string;
    noConnection: string;
    noConnectionRetry: string;
    downloadFailed: string;
    downloadFailedServer: string;
    audioCacheCleared: string;
    failedDownloadWords: string;
    alreadyDownloadedLabel: string;
    shareAppNative: string;
    shareAppDescNative: string;
    shareAppWithFriends: string;
    shareWebsite: string;
    qrCode: string;
    appUpdateAvailableAlt: string;
    appInstalledAlt: string;
    startingInstallAlt: string;
    clickToInstallLatestAlt: string;
    weWillUpdateCodeAlt: string;
    installFrameAlt: string;
    mushafUpdatedSaved: string;
    browseOfflineNowAlt: string;
    mushafApp: string;
    amazingApp: string;
    copyLink: string;
    otherOptions: string;
    linkCopied: string;
    mushafAlMurajaa: string;
    amLabel: string;
    pmLabel: string;
    reciterSectionMurattal: string;
    reciterSectionMujawwad: string;
    confirmDeleteTitle: string;
    internetRequiredDownload: string;
    themeName_classic_mushaf: string;
    themeName_antique_paper: string;
    themeName_calm_night: string;
    themeName_nature: string;
    themeName_almond_paper: string;
    themeName_wheat_paper: string;
    themeName_papyrus: string;
    themeName_clear_sky: string;
    themeName_midnight: string;
    themeName_calm_lake: string;
    themeName_silver_cloud: string;
    themeName_calm_charcoal: string;
    themeName_slate_gray: string;
    themeName_lavender: string;
    themeName_calm_peach: string;
    themeName_morning_sun: string;
    translationAyah: string;
    translationNotAvailable: string;
    translationAyahNotFound: string;
    manageTranslations: string;
    wbwAvailable: string;
    wbwNotAvailable: string;
    wbwFallbackMessage: string;
    downloadedLanguages: string;
    totalLanguages: string;
    hideTooltipHint: string;
}

import ar from '../src/assets/i18n/ar.json';
import en from '../src/assets/i18n/en.json';
import id from '../src/assets/i18n/id.json';
import ms from '../src/assets/i18n/ms.json';
import ur from '../src/assets/i18n/ur.json';
import bn from '../src/assets/i18n/bn.json';
import tr from '../src/assets/i18n/tr.json';
import fa from '../src/assets/i18n/fa.json';
import ha from '../src/assets/i18n/ha.json';
import fr from '../src/assets/i18n/fr.json';
import es from '../src/assets/i18n/es.json';
import de from '../src/assets/i18n/de.json';
import ru from '../src/assets/i18n/ru.json';
import sw from '../src/assets/i18n/sw.json';
import zh from '../src/assets/i18n/zh.json';
import ko from '../src/assets/i18n/ko.json';
import ja from '../src/assets/i18n/ja.json';
import bs from '../src/assets/i18n/bs.json';
import sq from '../src/assets/i18n/sq.json';
import uz from '../src/assets/i18n/uz.json';
import kk from '../src/assets/i18n/kk.json';
import ku from '../src/assets/i18n/ku.json';
import vi from '../src/assets/i18n/vi.json';
import tl from '../src/assets/i18n/tl.json';
import hi from '../src/assets/i18n/hi.json';
import ta from '../src/assets/i18n/ta.json';
import si from '../src/assets/i18n/si.json';
import am from '../src/assets/i18n/am.json';
import yo from '../src/assets/i18n/yo.json';
import om from '../src/assets/i18n/om.json';
import rw from '../src/assets/i18n/rw.json';

export const translations: Record<Language, Translations> = {
    ar: ar as Translations,
    en: en as Translations,
    id: id as Translations,
    ms: ms as Translations,
    ur: ur as Translations,
    bn: bn as Translations,
    tr: tr as Translations,
    fa: fa as Translations,
    ha: ha as Translations,
    fr: fr as Translations,
    es: es as Translations,
    de: de as Translations,
    ru: ru as Translations,
    sw: sw as Translations,
    zh: zh as Translations,
    ko: ko as Translations,
    ja: ja as Translations,
    bs: bs as Translations,
    sq: sq as Translations,
    uz: uz as Translations,
    kk: kk as Translations,
    ku: ku as Translations,
    vi: vi as Translations,
    tl: tl as Translations,
    hi: hi as Translations,
    ta: ta as Translations,
    si: si as Translations,
    am: am as Translations,
    yo: yo as Translations,
    om: om as Translations,
    rw: rw as Translations,
};

/**
 * Format a number based on the current language.
 * Arabic uses Eastern Arabic numerals (١٢٣), others use Western (123).
 */
export function localizeNumber(num: number | string, language: Language): string {
    const str = String(num);
    if (language === 'ar') return str; // Arabic UI already uses ١٢٣ via browser/font
    return str; // All other languages use standard 123
}

/**
 * Locale mapping for Intl.DateTimeFormat
 */
const LOCALE_MAP: Record<Language, string> = {
    ar: 'ar-SA', en: 'en-US', id: 'id-ID', ms: 'ms-MY', ur: 'ur-PK',
    bn: 'bn-BD', tr: 'tr-TR', fa: 'fa-IR', ha: 'ha-NG', fr: 'fr-FR',
    es: 'es-ES', de: 'de-DE', ru: 'ru-RU', sw: 'sw-KE', zh: 'zh-CN',
    ko: 'ko-KR', ja: 'ja-JP', bs: 'bs-BA', sq: 'sq-AL', uz: 'uz-UZ',
    kk: 'kk-KZ', ku: 'ckb-IR', vi: 'vi-VN', tl: 'fil-PH', hi: 'hi-IN',
    ta: 'ta-IN', si: 'si-LK', am: 'am-ET', yo: 'yo-NG', om: 'om-ET',
    rw: 'rw-RW'
};

/**
 * Format a time string (HH:MM) localized for the current language.
 * Uses Intl.DateTimeFormat for proper locale-aware formatting.
 * Arabic: ٥:٣٠ ص | English: 5:30 AM | Bengali: ৫:৩০ AM
 */
export function formatTimeLocalized(time24: string, language: Language, t: Translations): string {
    const [h, m] = time24.split(':').map(Number);
    if (isNaN(h) || isNaN(m)) return time24;

    try {
        const locale = LOCALE_MAP[language] || 'en-US';
        const date = new Date(2000, 0, 1, h, m, 0);
        return new Intl.DateTimeFormat(locale, {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        }).format(date);
    } catch {
        // Fallback: use amLabel/pmLabel from translations
        const amLabel = t.amLabel || 'AM';
        const pmLabel = t.pmLabel || 'PM';
        const period = h >= 12 ? pmLabel : amLabel;
        const displayH = h === 0 ? 12 : h > 12 ? h - 12 : h;
        return `${displayH}:${String(m).padStart(2, '0')} ${period}`;
    }
}

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
    uz: "O'zbekcha",
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
