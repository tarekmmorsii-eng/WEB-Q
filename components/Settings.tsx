import React, { useState } from 'react';
import { X, Globe, Volume2, VolumeX, Palette, Layout, Menu, Search, BarChart3, Bell, Moon, Sun, Download, FileSpreadsheet, Loader2, Maximize, Minimize, MousePointer2, Bookmark, Settings2, ChevronDown, ChevronUp, Mail, HelpCircle, FileWarning, Calculator, MessageSquare, Check, Facebook, Youtube, Share2, PlayCircle } from 'lucide-react';
import { Capacitor } from '@capacitor/core';
const isNative = Capacitor.isNativePlatform();
import { useFeedback } from '../contexts/FeedbackContext';
import { usePushNotifications } from '../hooks/usePushNotifications';

import clsx from 'clsx';
import { AppSettings, BottomBarSettings } from '../types';
import { THEMES, Theme } from '../constants/themes';
import { translations, LANGUAGE_NAMES, Language } from '../i18n/translations';
import { fetchPage } from '../services/quranService';
import HowToUseGuide from './HowToUseGuide';
import VerseCalculatorModal from './VerseCalculatorModal';
import VisitorCounter from './VisitorCounter';
import { useOfflineManager } from '../hooks/useOfflineManager';
import AudioDownloadModal from './AudioDownloadModal';
import DownloadProgressBar from './DownloadProgressBar';

interface SettingsProps {
    isOpen: boolean;
    onClose: () => void;
    settings: AppSettings;
    onSave: (settings: AppSettings) => void;
    currentLanguage: Language;
    onOpenIndex?: () => void;
    onOpenSearch?: () => void;
    onOpenMemorization?: () => void;
    onOpenNotifications?: () => void;
    notificationUnreadCount?: number;
    onOpenMutashabihat?: () => void;
    onOpenColorPicker?: () => void;
    onOpenReciterSelection?: () => void;
    onTogglePageBookmark?: () => void;
    isPageBookmarked?: boolean;
    hasUpdate?: boolean;
    onUpdateApp?: () => void;
    memorizationRatings?: any[]; // Avoiding circular dependency for now, or use MemorizationRating[] if imported
    onStartInteractiveTour?: () => void;
    highlightHelp?: boolean;
    highlightOffline?: boolean;
    onOpenShare?: () => void;
    onOpenAudioDownload?: () => void;
    onOpenTranslationManager?: () => void;
}

export default function Settings({
    isOpen, onClose, settings, onSave, currentLanguage,
    onOpenIndex, onOpenSearch, onOpenMemorization,
    onOpenNotifications, notificationUnreadCount = 0, onOpenMutashabihat, onOpenColorPicker, onOpenReciterSelection,
    onTogglePageBookmark, isPageBookmarked,
    hasUpdate = false,
    onUpdateApp,
    memorizationRatings = [],
    onStartInteractiveTour,
    highlightHelp = false,
    highlightOffline = false,
    onOpenShare,
    onOpenAudioDownload,
    onOpenTranslationManager
}: SettingsProps) {
    const [localSettings, setLocalSettings] = useState<AppSettings>(settings);
    const t = translations[currentLanguage];
    const isRTL = t.dir === 'rtl';

    const [isExporting, setIsExporting] = useState(false);
    const [showAllSettings, setShowAllSettings] = useState(false);

    const [showHelpModal, setShowHelpModal] = useState(false);
    const [showVerseCalculator, setShowVerseCalculator] = useState(false);
    const [showPushConsentModal, setShowPushConsentModal] = useState(false);

    // Accordion open states for each section
    const [openSound, setOpenSound] = useState(false);
    const [openGestures, setOpenGestures] = useState(false);
    const [openBottomBar, setOpenBottomBar] = useState(false);
    const [openOffline, setOpenOffline] = useState(false);
    const [openHelp, setOpenHelp] = useState(false);

    // حالة وميض أحمر مؤقت لزر "المزيد من الإعدادات"
    const [showMoreSettingsGlow, setShowMoreSettingsGlow] = useState(true);

    const { openFeedback } = useFeedback();

    // هوك الإشعارات الخارجية (Push Notifications)
    const {
        permissionStatus: pushPermission,
        isLoading: isPushLoading,
        fcmToken,
        requestPermission: requestPushPermission,
        isPushSupported
    } = usePushNotifications();

    const {
        installPrompt,
        downloadProgress,
        isDownloading,
        isStandalone,
        isInstalling,
        hasOfflineData,
        handleInstallApp,
        handleDownloadAllData
    } = useOfflineManager(currentLanguage);

    const helpSectionRef = React.useRef<HTMLDivElement>(null);
    const offlineSectionRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        if (isOpen && highlightOffline) {
            setShowAllSettings(true);
            setOpenOffline(true);
            setTimeout(() => {
                if (offlineSectionRef.current) {
                    offlineSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    offlineSectionRef.current.classList.add('ring-4', 'ring-red-500/50', 'ring-offset-2', 'dark:ring-offset-slate-900', 'transition-all', 'duration-500', 'rounded-xl');
                    setTimeout(() => {
                        offlineSectionRef.current?.classList.remove('ring-4', 'ring-red-500/50', 'ring-offset-2', 'dark:ring-offset-slate-900');
                    }, 4000);
                }
            }, 350);
        }
    }, [isOpen, highlightOffline]);

    React.useEffect(() => {
        if (isOpen && highlightHelp) {
            setShowAllSettings(true);
            setOpenHelp(true);
            setTimeout(() => {
                if (helpSectionRef.current) {
                    helpSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    helpSectionRef.current.classList.add('ring-4', 'ring-amber-500', 'ring-opacity-50', 'transition-all', 'duration-500', 'rounded-xl');
                    setTimeout(() => {
                        helpSectionRef.current?.classList.remove('ring-4', 'ring-amber-500', 'ring-opacity-50');
                    }, 2000);
                }
            }, 350);
        }
    }, [isOpen, highlightHelp]);

    // مؤقت لإخفاء الوميض الأحمر بعد 3.5 ثانية — يعمل عند كل فتح للنافذة
    React.useEffect(() => {
        if (isOpen) {
            setShowMoreSettingsGlow(true);
            const timer = setTimeout(() => setShowMoreSettingsGlow(false), 3500);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    // مزامنة الإعدادات المحلية عند فتح القائمة أو تغيير الإعدادات الخارجية
    // مزامنة الإعدادات المحلية عند تغيير الإعدادات الخارجية
    React.useEffect(() => {
        setLocalSettings(settings);
    }, [settings]);

    // إعادة تعيين واجهة المستخدم عند فتح القائمة
    React.useEffect(() => {
        if (isOpen) {
            setLocalSettings(settings); // Ensure fresh start
            if (!highlightHelp && !highlightOffline) {
                setShowAllSettings(false);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSave = () => {
        onSave(localSettings);
        onClose();
    };

    const toggleBottomBarItem = (key: keyof BottomBarSettings) => {
        setLocalSettings(prev => ({
            ...prev,
            bottomBar: {
                ...prev.bottomBar,
                [key]: !prev.bottomBar[key]
            }
        }));
    };



    const handleExportReviewData = async () => {
        setIsExporting(true);
        try {
            let csvContent = "\uFEFF" + (currentLanguage === 'ar' ? "رقم الجزء,رقم الصفحة,اسم آخر سورة,رقم آخر آية" : "Juz,Page,Last Surah,Last Ayah") + "\n";
            for (let i = 1; i <= 604; i++) {
                const pageData = await fetchPage(i);

                // حساب الجزء تقريبي (نفس المستخدم في التذييل)
                const juz = Math.ceil((i * 30) / 604);

                let lastSurahName = "غير معروف";
                let lastAyahNumber = 0;

                if (pageData && pageData.ayahs && pageData.ayahs.length > 0) {
                    const lastAyah = pageData.ayahs[pageData.ayahs.length - 1];
                    const t = translations[currentLanguage] || translations.ar;

                    if (lastAyah.surah) {
                        lastSurahName = t.surahNames[lastAyah.surah.number - 1] || "";
                        lastAyahNumber = lastAyah.numberInSurah;
                    }
                }

                csvContent += `${juz},${i},${lastSurahName},${lastAyahNumber}\n`;
            }

            // تحميل الملف
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement("a");
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", "quran_page_review.csv");
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

        } catch (error) {
            console.error(error);
            alert(translations[currentLanguage]?.error || translations.ar.error);
        } finally {
            setIsExporting(false);
        }
    };

    const handleClearAllData = async () => {
        const confirmed = confirm(t.confirmClearData);

        if (!confirmed) return;

        try {
            // 1. Clear localStorage
            localStorage.clear();

            // 2. Clear Service Worker caches
            if ('caches' in window) {
                const cacheNames = await caches.keys();
                await Promise.all(cacheNames.map(name => caches.delete(name)));
            }

            // 3. Unregister Service Workers
            if ('serviceWorker' in navigator) {
                const registrations = await navigator.serviceWorker.getRegistrations();
                await Promise.all(registrations.map(reg => reg.unregister()));
            }

            // 4. Reload the page to apply changes
            window.location.reload();
        } catch (error) {
            console.error('Error clearing data:', error);
            alert(t.error);
        }
    };

    const currentTheme = THEMES.find(th => th.id === localSettings.theme) || THEMES[0];

    interface QuickAccessButton {
        icon: React.ElementType;
        label: string;
        onClick?: () => void;
        keepOpen?: boolean;
    }

    const quickAccessButtons: QuickAccessButton[] = [
        { icon: Menu, label: t.index, onClick: onOpenIndex },
        { icon: BarChart3, label: t.memorizationStats, onClick: onOpenMemorization },
        { icon: PlayCircle, label: t.ayahRecitation, onClick: onOpenReciterSelection },
        { icon: Bell, label: t.notifications, onClick: onOpenNotifications },
        { icon: FileWarning, label: t.similarVersesAlert, onClick: onOpenMutashabihat },
        { icon: Calculator, label: t.verseCalculatorTitle, onClick: () => setShowVerseCalculator(true), keepOpen: true },
        ...(!isNative && !(/iPad|iPhone|iPod/.test(navigator.userAgent)) ? [{
            icon: Maximize,
            label: t.fullscreen,
            onClick: () => {
                const doc = document as any;
                const docEl = document.documentElement as any;
                const isFullscreen = doc.fullscreenElement || doc.webkitFullscreenElement;
                if (!isFullscreen) {
                    if (docEl.requestFullscreen) docEl.requestFullscreen();
                    else if (docEl.webkitRequestFullscreen) docEl.webkitRequestFullscreen();
                } else {
                    if (doc.exitFullscreen) doc.exitFullscreen();
                    else if (doc.webkitExitFullscreen) doc.webkitExitFullscreen();
                }
            }
        }] : [])
    ];


    return (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-300">
            <div className="bg-[var(--bg-card)] rounded-2xl shadow-2xl max-w-2xl w-full max-h-[96vh] md:max-h-[90vh] flex flex-col overflow-hidden border border-[var(--border-primary)]">
                {/* Header - Non-sticky since parent is flex-col */}
                <div className="bg-[var(--bg-secondary)] border-b border-[var(--border-primary)] p-4 flex justify-between items-center shrink-0 z-10">
                    <div className="flex items-center gap-3">
                        <img
                            src="/mushaf_logo_v2.png?v=10"
                            alt="Logo"
                            className="w-10 h-10 rounded-full border border-amber-500/30"
                        />
                        <h2 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-2">
                            {t.settingsTitle}
                            {hasUpdate && (
                                <div className="flex items-center gap-1.5">
                                    <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                                    <span className="text-[10px] font-bold text-red-500 uppercase tracking-wider animate-pulse select-none">
                                        {t.tinyUpdate}
                                    </span>
                                </div>
                            )}
                        </h2>
                    </div>

                    {/* Middle: Trial Version Label */}
                    <div className="bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 text-[10px] px-3 py-1 rounded-full border border-amber-200 dark:border-amber-700/50 shadow-sm animate-in fade-in zoom-in duration-500 delay-100">
                        {t.trialVersion}
                    </div>

                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-[var(--bg-secondary)] rounded-full transition-colors"
                    >
                        <X size={24} className="text-[var(--text-primary)] opacity-60 hover:opacity-100" />
                    </button>
                </div>


                {/* Scrollable Content wrapper */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-8 min-h-0">
                    {/* Quick Access Buttons */}
                    <section>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {quickAccessButtons.map((btn, idx) => {
                                const isNotifBtn = btn.icon === Bell;
                                return (
                                    <button
                                        key={idx}
                                        onClick={() => {
                                            if (!btn.keepOpen) onClose();
                                            btn.onClick?.();
                                        }}
                                        className="relative flex flex-col items-center gap-2 p-4 bg-[var(--bg-secondary)] rounded-lg hover:bg-[var(--bg-primary)] hover:bg-opacity-20 transition-colors"
                                    >
                                        <div className="relative">
                                            <btn.icon size={24} className="text-amber-600" />
                                            {isNotifBtn && notificationUnreadCount > 0 && (
                                                <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center shadow-sm shadow-red-500/50 animate-pulse px-0.5">
                                                    {notificationUnreadCount > 99 ? '99+' : notificationUnreadCount}
                                                </span>
                                            )}
                                        </div>
                                        <span className="text-sm text-[var(--text-primary)]">{btn.label}</span>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Toggle Buttons Row */}
                        <div className="grid grid-cols-4 gap-3 mt-3">
                            {/* Dark/Light Mode Toggle */}
                            <button
                                onClick={() => {
                                    const currentTheme = THEMES.find(th => th.id === localSettings.theme) || THEMES[0];
                                    const newThemeId = currentTheme.isDark ? 'classic-mushaf' : 'calm-night';
                                    const updatedSettings = { ...localSettings, theme: newThemeId };
                                    setLocalSettings(updatedSettings);
                                    onSave(updatedSettings);
                                    onClose();
                                }}
                                className="flex flex-col items-center gap-2 p-4 bg-[var(--bg-secondary)] rounded-lg hover:bg-[var(--bg-primary)] hover:bg-opacity-20 transition-colors"
                            >
                                {currentTheme.isDark ? <Sun size={24} className="text-amber-600" /> : <Moon size={24} className="text-amber-600" />}
                                <span className="text-sm text-[var(--text-primary)]">
                                    {currentTheme.isDark ? t.lightMode : t.darkMode}
                                </span>
                            </button>

                            {/* Prayer Mode Toggle */}
                            <button
                                onClick={() => {
                                    const updatedSettings = { ...localSettings, prayerMode: !localSettings.prayerMode };
                                    setLocalSettings(updatedSettings);
                                    onSave(updatedSettings);
                                    onClose();
                                }}
                                className="flex flex-col items-center gap-2 p-4 bg-[var(--bg-secondary)] rounded-lg hover:bg-[var(--bg-primary)] hover:bg-opacity-20 transition-colors"
                            >
                                <div className="relative w-6 h-6 flex items-center justify-center mb-0.5">
                                    <div className={clsx(
                                        "absolute inset-0 rounded-full border-2 border-amber-600 transition-all duration-300",
                                        localSettings.prayerMode ? "scale-110" : ""
                                    )} />
                                    <div className={clsx(
                                        "w-2.5 h-2.5 rounded-full bg-amber-600 transition-all duration-300",
                                        localSettings.prayerMode 
                                            ? "shadow-[0_0_8px_rgba(245,158,11,0.6)]" 
                                            : ""
                                    )} />
                                </div>
                                <span className="text-sm text-[var(--text-primary)]">{t.prayerMode}</span>
                            </button>

                            {/* Page Bookmark Toggle */}
                            <button
                                onClick={() => {
                                    onTogglePageBookmark?.();
                                    onClose();
                                }}
                                className="flex flex-col items-center gap-2 p-4 bg-[var(--bg-secondary)] rounded-lg hover:bg-[var(--bg-primary)] hover:bg-opacity-20 transition-colors"
                            >
                                <Bookmark
                                    size={24}
                                    className="text-amber-600"
                                    fill={isPageBookmarked ? "currentColor" : "none"}
                                />
                                <span className="text-sm text-[var(--text-primary)]">{t.bookmark}</span>
                            </button>

                            {/* Search Button (Completes the 4-button row) */}
                            <button
                                onClick={() => {
                                    onClose();
                                    onOpenSearch?.();
                                }}
                                className="flex flex-col items-center gap-2 p-4 bg-[var(--bg-secondary)] rounded-lg hover:bg-[var(--bg-primary)] hover:bg-opacity-20 transition-colors"
                            >
                                <Search size={24} className="text-amber-600" />
                                <span className="text-sm text-[var(--text-primary)]">{t.search}</span>
                            </button>
                        </div>

                        {/* More Settings Toggle Button */}
                        <div className="mt-4 rounded-lg">
                        <button
                            onClick={() => setShowAllSettings(!showAllSettings)}
className={`w-full flex items-center justify-between p-4 bg-[var(--bg-secondary)] rounded-lg hover:bg-[var(--bg-primary)] hover:bg-opacity-20 transition-all duration-1000 ease-in-out group ${showMoreSettingsGlow ? 'ring-2 ring-red-500 shadow-lg shadow-red-500/50' : 'ring-0 shadow-none'}`}
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-[var(--bg-card)] rounded-full shadow-sm group-hover:scale-110 transition-transform">
                                    <Settings2 size={20} className="text-[var(--text-primary)] opacity-60" />
                                </div>
                                <span className="font-medium text-[var(--text-primary)]">
                                    {showAllSettings ? t.hideDetailedSettings : t.moreSettings}
                                </span>
                            </div>
                            {showAllSettings ? (
                                <ChevronUp size={20} className="text-gray-500" />
                            ) : (
                                <ChevronDown size={20} className="text-gray-500" />
                            )}
                        </button>
                        </div>
                    </section>

                    {showAllSettings && (
                        <>

                            {/* Language Selection */}
                            <section>
                                <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                                    <Globe size={20} />
                                    {t.languages}
                                </h3>
                                <select
                                    value={localSettings.language}
                                    onChange={(e) => setLocalSettings(prev => ({ ...prev, language: e.target.value }))}
                                    className="w-full p-3 border border-[var(--border-primary)] rounded-lg bg-[var(--bg-secondary)] text-[var(--text-primary)]"
                                >
                                    {Object.entries(LANGUAGE_NAMES).map(([code, name]) => (
                                        <option key={code} value={code}>{name}</option>
                                    ))}
                                </select>
                            </section>



                            {/* Color Themes */}
                            <section>
                                <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                                    <Palette size={20} />
                                    {t.colorThemes}
                                </h3>
                                <button
                                    onClick={() => {
                                        onClose(); // Close settings modal
                                        onOpenColorPicker?.(); // Open Color Picker Modal
                                    }}
                                    className="w-full p-6 rounded-xl border-2 border-dashed border-[var(--border-primary)] hover:border-amber-500 hover:bg-[var(--bg-secondary)] transition-all flex flex-col items-center justify-center gap-3 group"
                                >
                                    <div className="flex -space-x-2">
                                        <div className="w-8 h-8 rounded-full bg-amber-200 border-2 border-[var(--bg-card)]" />
                                        <div className="w-8 h-8 rounded-full bg-blue-200 border-2 border-[var(--bg-card)]" />
                                        <div className="w-8 h-8 rounded-full bg-green-200 border-2 border-[var(--bg-card)]" />
                                    </div>
                                    <span className="font-medium text-[var(--text-primary)] opacity-70 group-hover:opacity-100">
                                        {t.selectTheme}
                                    </span>
                                </button>

                                {/* Color Stop Signs Toggle */}
                                <label className="flex items-center justify-between p-4 bg-[var(--bg-secondary)] rounded-lg cursor-pointer mt-4">
                                    <span className="text-[var(--text-primary)] flex items-center gap-2">
                                        {t.colorStopSigns}
                                        <span className="text-3xl text-amber-600 font-serif mx-4 gap-4 flex items-center">
                                            <span>ۘ</span> <span>ۚ</span> <span>ۖ</span> <span>ۗ</span> <span>ۙ</span> <span>ۛ</span>
                                        </span>
                                    </span>
                                    <input
                                        type="checkbox"
                                        checked={localSettings.colorStopSigns}
                                        onChange={(e) => {
                                            setLocalSettings(prev => ({ ...prev, colorStopSigns: e.target.checked }));
                                        }}
                                        className="w-5 h-5 text-amber-600 rounded focus:ring-2 focus:ring-amber-500"
                                    />
                                </label>

                                {/* Mutashabihat Indicators Toggle */}
                                <label className="flex items-center justify-between p-4 bg-[var(--bg-secondary)] rounded-lg cursor-pointer mt-3">
                                    <div className="flex items-center gap-4">
                                        <div className="flex flex-col">
                                            <span className="text-[var(--text-primary)] font-medium">
                                                {t.showSimilarVersesIndicators}
                                            </span>
                                            <span className="text-xs text-[var(--text-primary)] opacity-50">
                                                {t.similarVersesIndicatorsDesc}
                                            </span>
                                        </div>

                                        {/* Preview Icon */}
                                        <div className="w-10 h-10 shrink-0">
                                            <svg viewBox="0 0 100 110" className="w-full h-full overflow-visible">
                                                <g fill="none" stroke="#B45309" strokeWidth="4">
                                                    <path d="M50,12 C65,12 85,22 88,48 C91,74 72,88 50,88 C28,88 10,72 12,48 C14,24 35,12 50,12 Z" />
                                                </g>
                                                <text x="50" y="55" fill="#B45309" fontSize="40" fontWeight="bold" textAnchor="middle" dominantBaseline="central">١</text>
                                                <line x1="20" y1="102" x2="50" y2="102" stroke="#22c55e" strokeWidth="12" strokeLinecap="round" />
                                                <line x1="50" y1="102" x2="80" y2="102" stroke="#ef4444" strokeWidth="12" strokeLinecap="round" />
                                            </svg>
                                        </div>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={localSettings.showMutashabihatIndicators}
                                        onChange={(e) => {
                                            setLocalSettings(prev => ({ ...prev, showMutashabihatIndicators: e.target.checked }));
                                        }}
                                        className="w-5 h-5 text-amber-600 rounded focus:ring-2 focus:ring-amber-500"
                                    />
                                </label>

                                <div className="p-4 bg-[var(--bg-secondary)] rounded-lg mt-3 flex flex-col">
                                    <label className="flex items-center justify-between cursor-pointer">
                                        <span className="text-[var(--text-primary)] font-medium">
                                            {t.quranWordMeanings}
                                        </span>
                                        <input
                                            type="checkbox"
                                            checked={localSettings.showWordMeanings !== false}
                                            onChange={(e) => setLocalSettings(prev => ({ ...prev, showWordMeanings: e.target.checked, wordMeaningsSource: 'new' }))}
                                            className="w-5 h-5 text-amber-600 rounded focus:ring-2 focus:ring-amber-500"
                                        />
                                    </label>
                                    <p className="text-xs text-[var(--text-primary)] opacity-60 mt-2">
                                        {t.wordMeaningsNote}
                                    </p>
                                </div>

                                {/* Floating Side Menu Toggle */}
                                <div className="p-4 bg-[var(--bg-secondary)] rounded-lg mt-3">
                                    <label className="flex items-center justify-between cursor-pointer">
                                        <span className="text-[var(--text-primary)] font-medium">
                                            {t.sideMenu}
                                        </span>
                                        <input
                                            type="checkbox"
                                            checked={localSettings.bottomBar.showSideMenu !== false}
                                            onChange={(e) => toggleBottomBarItem('showSideMenu' as keyof BottomBarSettings)}
                                            className="w-5 h-5 text-amber-600 rounded focus:ring-2 focus:ring-amber-500"
                                        />
                                    </label>
                                </div>

                            </section>

                            {/* Sound Settings - Accordion */}
                            <section className="border border-[var(--border-primary)] rounded-xl overflow-hidden">
                                <button
                                    onClick={() => setOpenSound(v => !v)}
                                    className="w-full flex items-center justify-between p-4 bg-[var(--bg-secondary)] hover:bg-[var(--bg-primary)] hover:bg-opacity-10 transition-colors"
                                >
                                    <span className="flex items-center gap-2 font-semibold text-[var(--text-primary)]">
                                        {localSettings.soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
                                        {t.soundSettings}
                                    </span>
                                    {openSound ? <ChevronUp size={18} className="text-gray-500" /> : <ChevronDown size={18} className="text-gray-500" />}
                                </button>
                                {openSound && (
                                    <div className="p-4 space-y-3">
                                        <label className="flex items-center justify-between p-4 bg-[var(--bg-secondary)] rounded-lg cursor-pointer">
                                            <span className="text-[var(--text-primary)]">{t.pageFlipSound}</span>
                                            <input
                                                type="checkbox"
                                                checked={localSettings.soundEnabled}
                                                onChange={(e) => setLocalSettings(prev => ({ ...prev, soundEnabled: e.target.checked }))}
                                                className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                                            />
                                        </label>
                                        <label className="flex items-center justify-between p-4 bg-[var(--bg-secondary)] rounded-lg cursor-pointer">
                                            <span className="text-[var(--text-primary)]">
                                                {t.wordAudioLongPress}
                                                <span className="text-red-500 font-bold mx-1"> {t.internetRequired}</span>
                                            </span>
                                            <input
                                                type="checkbox"
                                                checked={localSettings.enableWordLongPressAudio !== false}
                                                onChange={(e) => setLocalSettings(prev => ({ ...prev, enableWordLongPressAudio: e.target.checked }))}
                                                className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                                            />
                                        </label>
                                    </div>
                                )}
                            </section>

                            {/* Touch Gestures - Accordion */}
                            <section className="border border-[var(--border-primary)] rounded-xl overflow-hidden">
                                <button
                                    onClick={() => setOpenGestures(v => !v)}
                                    className="w-full flex items-center justify-between p-4 bg-[var(--bg-secondary)] hover:bg-[var(--bg-primary)] hover:bg-opacity-10 transition-colors"
                                >
                                    <span className="flex items-center gap-2 font-semibold text-[var(--text-primary)]">
                                        <MousePointer2 size={20} />
                                        {t.gestureSettings}
                                    </span>
                                    {openGestures ? <ChevronUp size={18} className="text-gray-500" /> : <ChevronDown size={18} className="text-gray-500" />}
                                </button>
                                {openGestures && (
                                    <div className="p-4 space-y-3">
                                        <label className="flex items-center justify-between p-4 bg-[var(--bg-secondary)] rounded-lg cursor-pointer">
                                            <span className="text-[var(--text-primary)]">{t.gestureTwoFingerTap}</span>
                                            <input
                                                type="checkbox"
                                                checked={localSettings.gestureTwoFingerTap !== false}
                                                onChange={(e) => setLocalSettings(prev => ({ ...prev, gestureTwoFingerTap: e.target.checked }))}
                                                className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                                            />
                                        </label>
                                        <label className="flex items-center justify-between p-4 bg-[var(--bg-secondary)] rounded-lg cursor-pointer">
                                            <span className="text-[var(--text-primary)]">{t.gestureDoubleTap}</span>
                                            <input
                                                type="checkbox"
                                                checked={localSettings.gestureDoubleTap !== false}
                                                onChange={(e) => setLocalSettings(prev => ({ ...prev, gestureDoubleTap: e.target.checked }))}
                                                className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                                            />
                                        </label>
                                        <label className="flex items-center justify-between p-4 bg-[var(--bg-secondary)] rounded-lg cursor-pointer">
                                            <span className="text-[var(--text-primary)]">{t.gestureSwipeUp}</span>
                                            <input
                                                type="checkbox"
                                                checked={localSettings.gestureSwipeUp !== false}
                                                onChange={(e) => setLocalSettings(prev => ({ ...prev, gestureSwipeUp: e.target.checked }))}
                                                className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                                            />
                                        </label>
                                    </div>
                                )}
                            </section>


                            {/* Bottom Bar Customization - Accordion */}
                            <section className="border border-[var(--border-primary)] rounded-xl overflow-hidden">
                                <button
                                    onClick={() => setOpenBottomBar(v => !v)}
                                    className="w-full flex items-center justify-between p-4 bg-[var(--bg-secondary)] hover:bg-[var(--bg-primary)] hover:bg-opacity-10 transition-colors"
                                >
                                    <span className="flex items-center gap-2 font-semibold text-[var(--text-primary)]">
                                        <Layout size={20} />
                                        {t.bottomBarCustomization}
                                    </span>
                                    {openBottomBar ? <ChevronUp size={18} className="text-gray-500" /> : <ChevronDown size={18} className="text-gray-500" />}
                                </button>
                                {openBottomBar && (
                                    <div className="p-4 space-y-2">
                                        {[
                                            { key: 'showIndex' as keyof BottomBarSettings, label: t.index },
                                            { key: 'showSearch' as keyof BottomBarSettings, label: t.search },
                                            { key: 'showMemorization' as keyof BottomBarSettings, label: t.memorizationStats },
                                            { key: 'showNotifications' as keyof BottomBarSettings, label: t.notifications },
                                            { key: 'showDarkMode' as keyof BottomBarSettings, label: t.darkMode + ' / ' + t.lightMode },
                                            { key: 'showBookmark' as keyof BottomBarSettings, label: t.bookmark },
                                            { key: 'showPrayerMode' as keyof BottomBarSettings, label: t.prayerMode },
                                            ...(!isNative ? [{ key: 'showFullscreen' as keyof BottomBarSettings, label: t.fullscreen }] : []),
                                            { key: 'showPageNavigation' as keyof BottomBarSettings, label: t.pageNavigation },
                                        ].map(({ key, label }) => (
                                            <label
                                                key={key}
                                                className="flex items-center justify-between p-3 bg-[var(--bg-secondary)] rounded-lg cursor-pointer hover:bg-[var(--bg-primary)] hover:bg-opacity-10 transition-colors"
                                            >
                                                <span className="text-[var(--text-primary)]">{label}</span>
                                                <input
                                                    type="checkbox"
                                                    checked={localSettings.bottomBar[key]}
                                                    onChange={() => toggleBottomBarItem(key)}
                                                    className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                                                />
                                            </label>
                                        ))}
                                    </div>
                                )}
                            </section>

                            <section
                                ref={offlineSectionRef}
                                className="border border-gray-100 dark:border-slate-700 rounded-xl overflow-hidden transition-all duration-500"
                            >
                                    <button
                                        onClick={() => setOpenOffline(v => !v)}
                                        className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                                    >
                                        <span className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
                                            <Download size={20} />
                                            {t.offlineMode}
                                            {hasUpdate && (
                                                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse inline-block" />
                                            )}
                                        </span>
                                        {openOffline ? <ChevronUp size={18} className="text-gray-500" /> : <ChevronDown size={18} className="text-gray-500" />}
                                    </button>
                                    {openOffline && (
                                        <div className="p-4 space-y-4">

                                            {!isNative && hasUpdate && !isStandalone && (
                                                <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg animate-in fade-in slide-in-from-top-2 duration-500">
                                                    <div className="flex items-center justify-between gap-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-full">
                                                                <Download size={20} className="text-blue-600 dark:text-blue-400" />
                                                            </div>
                                                            <div>
                                                                <p className="font-bold text-blue-900 dark:text-blue-100 text-sm">{t.updateAvailable}</p>
                                                                <p className="text-xs text-blue-700 dark:text-blue-300">{t.updateDescription}</p>
                                                            </div>
                                                        </div>
                                                        <button
                                                            onClick={onUpdateApp}
                                                            className="px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 shadow-lg active:scale-95 transition-all whitespace-nowrap"
                                                        >
                                                            {t.updateNow}
                                                        </button>
                                                    </div>
                                                </div>
                                            )}

                                            <div className="space-y-4">
                                                {/* Main Note about two-step process */}
                                                <div className="p-3 bg-amber-50/50 dark:bg-amber-900/10 border-r-4 border-amber-500 rounded text-xs text-amber-900 dark:text-amber-100 font-medium">
                                                    {t.noteInstallationSteps}
                                                </div>

                                                <div className="space-y-3">
                                                    {!isNative && (
                                                        <>
                                                            {/* Step 1 Label */}
                                                            <div className="text-[11px] font-bold text-amber-700 dark:text-amber-500 px-1 uppercase tracking-wider">
                                                                {t.step1}
                                                            </div>
                                                            {/* Install App Button - Always persistent per user request */}
                                                            <button
                                                                onClick={hasUpdate && isStandalone ? onUpdateApp : (isStandalone ? undefined : handleInstallApp)}
                                                                disabled={(!hasUpdate && isStandalone) || isInstalling}
                                                                className={clsx(
                                                                    "w-full flex items-center justify-between p-4 rounded-lg transition-all border-2",
                                                                    hasUpdate
                                                                        ? "bg-blue-50 dark:bg-blue-900/20 border-blue-500 text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 active:scale-[0.98]"
                                                                        : isStandalone
                                                                            ? "bg-emerald-50 dark:bg-emerald-900/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400 cursor-default"
                                                                            : "bg-amber-100 dark:bg-amber-900/30 text-amber-900 dark:text-amber-100 hover:bg-amber-200 dark:hover:bg-amber-900/50 border-transparent active:scale-[0.98]",
                                                                    ((!hasUpdate && isStandalone) || isInstalling) && "opacity-60 cursor-not-allowed"
                                                                )}
                                                            >
                                                                <div className="flex flex-col items-start text-right">
                                                                    <span className="font-medium text-amber-900 dark:text-amber-100">
                                                                        {hasUpdate
                                                                            ? t.appUpdateAvailableAlt
                                                                            : isStandalone
                                                                                ? t.appInstalledAlt
                                                                                : (isInstalling ? t.startingInstallAlt : t.installApp)
                                                                        }
                                                                    </span>
                                                                    <span className="text-[10px] opacity-70">
                                                                        {hasUpdate
                                                                            ? t.clickToInstallLatestAlt
                                                                            : isStandalone
                                                                                ? t.weWillUpdateCodeAlt
                                                                                : t.installFrameAlt
                                                                        }
                                                                    </span>
                                                                </div>
                                                                {isInstalling ? (
                                                                    <Loader2 size={24} className="text-amber-600 dark:text-amber-400 animate-spin" />
                                                                ) : hasUpdate ? (
                                                                    <div className="relative">
                                                                        <Download size={24} className="text-blue-600 dark:text-blue-500 animate-bounce" />
                                                                        <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                                                                    </div>
                                                                ) : isStandalone ? (
                                                                    <Check size={24} className="text-emerald-600 dark:text-emerald-500 animate-in zoom-in duration-500" />
                                                                ) : (
                                                                    <Download size={24} className="text-amber-600 dark:text-amber-500" />
                                                                )}
                                                            </button>
                                                        </>
                                                    )}

                                                    {!isNative && (
                                                        <>
                                                            {/* Step 2 Label */}
                                                            <div className="text-[11px] font-bold text-blue-700 dark:text-blue-500 px-1 pt-2 uppercase tracking-wider">
                                                                {t.step2}
                                                            </div>

                                                            {/* Download/Update Mushaf Button */}
                                                            <button
                                                                id="tour-download-btn"
                                                                onClick={handleDownloadAllData}
                                                                disabled={isDownloading || hasOfflineData}
                                                                className={clsx(
                                                                    "w-full flex items-center justify-between p-4 rounded-lg transition-all border-2",
                                                                    isDownloading
                                                                        ? "bg-gray-100 dark:bg-slate-800 border-gray-200 dark:border-slate-700 cursor-wait"
                                                                        : hasOfflineData
                                                                            ? "bg-emerald-50 dark:bg-emerald-900/10 border-emerald-500/30 cursor-default"
                                                                            : "bg-white dark:bg-slate-800 border-blue-200 dark:border-blue-800 hover:border-blue-500 cursor-pointer active:scale-[0.98]"
                                                                )}
                                                            >
                                                                <div className="flex flex-col items-start text-right">
                                                                    <span className={clsx("font-medium", hasOfflineData ? "text-emerald-900 dark:text-emerald-100" : "text-gray-900 dark:text-white")}>
                                                                        {isDownloading ? t.updatingMushaf : (hasOfflineData ? t.mushafUpdatedSaved : t.downloadMushaf)}
                                                                    </span>
                                                                    <span className={clsx("text-xs mt-1", hasOfflineData ? "text-emerald-700 dark:text-emerald-400 opacity-70" : "text-gray-500 dark:text-gray-400")}>
                                                                        {isDownloading
                                                                            ? t.waitUpdating.replace('{percent}', downloadProgress?.toString() || '0')
                                                                            : (hasOfflineData ? t.browseOfflineNowAlt : t.downloadMushafDescription)
                                                                        }
                                                                    </span>
                                                                </div>
                                                                {isDownloading ? (
                                                                    <Loader2 size={24} className="animate-spin text-blue-600" />
                                                                ) : hasOfflineData ? (
                                                                    <Check size={24} className="text-emerald-600 dark:text-emerald-500 animate-in zoom-in duration-500" />
                                                                ) : (
                                                                    <Download size={24} className="text-blue-600 dark:text-blue-400" />
                                                                )}
                                                            </button>

                                                            {/* شريط التحميل الموحد */}
                                                            {downloadProgress !== null && (
                                                                <DownloadProgressBar
                                                                    progress={downloadProgress}
                                                                    message={downloadProgress === 100 ? t.downloadSuccess : undefined}
                                                                    color="blue"
                                                                />
                                                            )}
                                                        </>
                                                    )}
                                                </div>

                                                <div className="border-t border-gray-200 dark:border-slate-700 pt-4 mt-2">
                                                    <button
                                                        onClick={() => {
                                                            onClose();
                                                            onOpenAudioDownload?.();
                                                        }}
                                                        className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:border-amber-500 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-all active:scale-[0.98]"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <Volume2 size={20} className="text-amber-600 dark:text-amber-500" />
                                                            <span className="font-medium text-gray-900 dark:text-white">
                                                                {t.downloadAudioOptional}
                                                            </span>
                                                        </div>
                                                        <ChevronDown size={18} className="text-gray-500 -rotate-90 rtl:rotate-90" />
                                                    </button>
                                                </div>

                                                {/* زر تحميل الترجمة ومعاني الكلمات */}
                                                <button
                                                    onClick={() => {
                                                        onClose();
                                                        onOpenTranslationManager?.();
                                                    }}
                                                    className="w-full flex items-center justify-between p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-all active:scale-[0.98] group"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 bg-amber-100 dark:bg-amber-800/60 rounded-full">
                                                            <Globe size={18} className="text-amber-600 dark:text-amber-400" />
                                                        </div>
                                                        <span className="font-medium text-amber-800 dark:text-amber-200">
                                                            {t.manageTranslations}
                                                        </span>
                                                    </div>
                                                    <ChevronDown size={18} className="text-amber-500 -rotate-90 rtl:rotate-90" />
                                                </button>


                                            </div>
                                        </div>
                                    )}
                            </section>

                            <div className="pt-4 border-t border-gray-100 dark:border-slate-700" />


                            {/* Help Section - Accordion */}
                            <section ref={helpSectionRef} className="scroll-mt-4 border border-gray-100 dark:border-slate-700 rounded-xl overflow-hidden">
                                <button
                                    onClick={() => setOpenHelp(v => !v)}
                                    className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                                >
                                    <span className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
                                        <HelpCircle size={20} />
                                        {t.help}
                                    </span>
                                    {openHelp ? <ChevronUp size={18} className="text-gray-500" /> : <ChevronDown size={18} className="text-gray-500" />}
                                </button>
                                {openHelp && (
                                    <div className="p-4 space-y-3">
                                        <button
                                            onClick={() => {
                                                onClose();
                                                onStartInteractiveTour?.();
                                            }}
                                            className="w-full flex items-center justify-between p-4 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-900 dark:text-indigo-100 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors border border-indigo-100 dark:border-indigo-800 mb-3"
                                        >
                                            <span className="font-medium text-indigo-800 dark:text-indigo-200">
                                                {t.interactiveTour}
                                            </span>
                                            <PlayCircle size={20} className="text-indigo-600 dark:text-indigo-400" />
                                        </button>

                                        <button
                                            id="tour-tutorials-btn"
                                            onClick={() => setShowHelpModal(true)}
                                            className="w-full flex items-center justify-between p-4 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-900 dark:text-emerald-100 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors border border-emerald-100 dark:border-emerald-800"
                                        >
                                            <span className="font-medium text-emerald-800 dark:text-emerald-200">
                                                {t.guideAction}
                                            </span>
                                            <HelpCircle size={20} className="text-emerald-600 dark:text-emerald-400" />
                                        </button>
                                        <a
                                            href="https://youtu.be/t-oQKcEHSpA?si=eZEPZOHSJ8UL1OA4"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-full flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 text-blue-900 dark:text-blue-100 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors border border-blue-100 dark:border-blue-800 mt-3"
                                        >
                                            <span className="font-medium text-blue-800 dark:text-blue-200">
                                                {t.watchVideo}
                                            </span>
                                            <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-white shadow-lg">
                                                <div className="w-0 h-0 border-t-4 border-t-transparent border-l-8 border-l-white border-b-4 border-b-transparent ml-1" />
                                            </div>
                                        </a>
                                    </div>
                                )}
                            </section>

                            {/* Contact Section */}
                            <section>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                    <Mail size={20} />
                                    {t.contact}
                                </h3>
                                <div className="p-4 bg-gray-50 dark:bg-slate-800 rounded-lg flex flex-col items-center justify-center gap-2 text-center hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
                                    <a
                                        href="mailto:Info@mushafalmurajaa.com"
                                        className="text-gray-900 dark:text-white font-medium hover:text-blue-600 dark:hover:text-blue-400 underline decoration-dotted underline-offset-4"
                                    >
                                        Info@mushafalmurajaa.com
                                    </a>
                                </div>
                            </section>

                            {/* Social Media Section */}
                            <section className="mt-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                    <Globe size={20} />
                                    {t.followUs}
                                </h3>
                                <div className="grid grid-cols-2 gap-3">
                                    <a
                                        href="https://youtube.com/@mushafalmurajaa?si=baoDEaZsazg0KpSQ"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex flex-col items-center justify-center p-4 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors border border-red-100 dark:border-red-900/30"
                                    >
                                        <Youtube size={28} className="mb-2" />
<span className="font-medium text-sm">{t.youtube}</span>
                                    </a>
                                    <a
                                        href="https://www.facebook.com/share/1Aodps7HFw/"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex flex-col items-center justify-center p-4 bg-blue-50 dark:bg-blue-900/10 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/20 transition-colors border border-blue-100 dark:border-blue-900/30"
                                    >
                                        <Facebook size={28} className="mb-2" />
<span className="font-medium text-sm">{t.facebook}</span>
                                    </a>
                                </div>
                            </section>

                            {/* ═══════ قسم الإشعارات الخارجية (Push Notifications) ═══════ */}
                            <div className="space-y-3">
                                <h3 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
                                    <Bell size={18} className="text-purple-500" />
                                    {t.pushNotifTitle || 'تفعيل الإشعارات الخارجية'}
                                </h3>

                                <button
                                    onClick={() => {
                                        if (pushPermission !== 'granted') {
                                            setShowPushConsentModal(true);
                                        }
                                    }}
                                    disabled={isPushLoading || pushPermission === 'granted'}
                                    className={clsx(
                                        "w-full flex items-center justify-between p-4 rounded-lg transition-all border",
                                        pushPermission === 'granted'
                                            ? "bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800/30"
                                            : "bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800/40 hover:bg-purple-100 dark:hover:bg-purple-900/30 active:scale-[0.98]"
                                    )}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={clsx(
                                            "p-2 rounded-full",
                                            pushPermission === 'granted'
                                                ? "bg-emerald-100 dark:bg-emerald-800/60"
                                                : "bg-purple-100 dark:bg-purple-800/60"
                                        )}>
                                            {pushPermission === 'granted' ? (
                                                <Check size={18} className="text-emerald-600 dark:text-emerald-400" />
                                            ) : (
                                                <Bell size={18} className="text-purple-600 dark:text-purple-400" />
                                            )}
                                        </div>
                                        <div className="flex flex-col items-start">
                                            <span className={clsx(
                                                "font-medium text-sm",
                                                pushPermission === 'granted'
                                                    ? "text-emerald-800 dark:text-emerald-200"
                                                    : "text-purple-800 dark:text-purple-200"
                                            )}>
                                                {pushPermission === 'granted' ? (t.pushNotifActive || 'الإشعارات مفعّلة ✓') : (t.pushNotifTitle || 'تفعيل الإشعارات الخارجية للمراجعة')}
                                            </span>
                                            <span className="text-[10px] opacity-60 mt-0.5">
                                                {pushPermission === 'granted' ? (t.pushNotifActiveDesc || 'ستصلك تنبيهات المراجعة') : (t.pushNotifDesc || 'لتصلك تنبيهات المراجعة والتحفيز')}
                                            </span>
                                        </div>
                                    </div>
                                    {isPushLoading ? (
                                        <Loader2 size={20} className="animate-spin text-purple-600 dark:text-purple-400" />
                                    ) : pushPermission === 'granted' ? (
                                        <Check size={18} className="text-emerald-500" />
                                    ) : (
                                        <Bell size={18} className="text-purple-500" />
                                    )}
                                </button>
                            </div>

                            {/* Share Section */}
                            <section className="pt-4 border-t border-gray-100 dark:border-slate-700">
                                <button
                                    onClick={async () => {
                                        if (isNative && navigator.share) {
                                            try {
                                                await navigator.share({
                                                    title: t.mushafApp,
                                                    text: t.amazingApp,
                                                    url: window.location.origin
                                                });
                                            } catch (err) {
                                                console.error('Error sharing:', err);
                                                onOpenShare?.();
                                            }
                                        } else {
                                            onOpenShare?.();
                                        }
                                    }}
                                    className="w-full flex items-center justify-between p-4 bg-amber-50 dark:bg-slate-800 border-2 border-amber-500/20 dark:border-slate-700 rounded-xl hover:border-amber-500 dark:hover:border-amber-500 hover:bg-white dark:hover:bg-slate-700 transition-all active:scale-[0.98] shadow-sm group"
                                >
                                    <div className="flex flex-col items-start text-right">
                                        <span className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                            <Share2 size={18} className="text-amber-600 dark:text-amber-500" />
                                            {isNative 
                                                ? t.shareAppNative
                                                : t.shareWebsite}
                                        </span>
                                        <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                            {t.shareAppWithFriends}
                                        </span>
                                    </div>
                                    <div className="p-2 bg-amber-100 dark:bg-amber-900/40 rounded-full group-hover:scale-110 transition-transform">
                                        <Share2 size={24} className="text-amber-600 dark:text-amber-500" />
                                    </div>
                                </button>

                                {/* QR Code Section - Hide on Native */}
                                {!isNative && (
                                    <div className="mt-4 flex flex-col items-center gap-3 p-4 bg-white dark:bg-slate-800/50 rounded-xl border border-gray-100 dark:border-slate-700/50 shadow-sm">
                                        <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                                            {t.qrCode}
                                        </h4>
                                        <div className="relative p-2 bg-white rounded-lg shadow-inner border border-gray-100">
                                            <img 
                                                src="/qr_code.jpg" 
                                                alt="QR Code" 
                                                className="w-48 h-48 object-contain rounded-sm"
                                            />
                                            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-amber-500 rounded-tl-sm -translate-x-1 -translate-y-1" />
                                            <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-amber-500 rounded-tr-sm translate-x-1 -translate-y-1" />
                                            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-amber-500 rounded-bl-sm -translate-x-1 translate-y-1" />
                                            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-amber-500 rounded-br-sm translate-x-1 translate-y-1" />
                                        </div>
                                    </div>
                                )}
                            </section>

                            {!isNative && (
                                <div className="pt-4 border-t border-gray-100 dark:border-slate-700">
                                    <VisitorCounter t={t} language={currentLanguage} />

                                    <div className="mt-6 pb-2 text-center">
                                        <p className="text-[10px] text-gray-400 dark:text-slate-500 font-mono opacity-50">
                                            Version 1.2.7 • 2026.02.24 • Optimized
                                        </p>
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    {/* نافذة التوضيح - Two-Step Consent Modal */}
                    {showPushConsentModal && (
                        <div className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center p-4" style={{ direction: isRTL ? 'rtl' : 'ltr' }}>
                            <div className="bg-[var(--bg-card)] rounded-2xl shadow-2xl max-w-sm w-full p-6 border border-[var(--border-primary)]">
                                <div className="flex flex-col items-center text-center gap-4">
                                    <div className="p-4 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                                        <Bell size={32} className="text-purple-600 dark:text-purple-400" />
                                    </div>
                                    <h3 className="text-lg font-bold text-[var(--text-primary)]">
                                        {t.pushNotifConsentTitle || 'تفعيل الإشعارات'}
                                    </h3>
                                    <p className="text-sm text-[var(--text-primary)] opacity-70 leading-relaxed">
                                        {t.pushNotifConsentBody || 'لتصلك تنبيهات المراجعة، يرجى الموافقة على الطلب الذي سيظهر من المتصفح'}
                                    </p>
                                    <div className="flex gap-3 w-full mt-2">
                                        <button
                                            onClick={() => setShowPushConsentModal(false)}
                                            className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition-all font-medium text-sm"
                                        >
                                            {t.pushNotifConsentCancel || 'إلغاء'}
                                        </button>
                                        <button
                                            onClick={async () => {
                                                setShowPushConsentModal(false);
                                                console.log('[Push] جاري طلب صلاحية الإشعارات...');
                                                const result = await requestPushPermission();
                                                if (result.success && result.token) {
                                                    console.log('[Push] ✅ تم الحصول على FCM Token بنجاح:', result.token);
                                                } else if (result.error) {
                                                    console.warn('[Push] ⚠️ خطأ:', result.error);
                                                }
                                            }}
                                            disabled={isPushLoading}
                                            className="flex-1 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl shadow-lg transition-all font-bold text-sm disabled:opacity-60"
                                        >
                                            {isPushLoading ? (
                                                <Loader2 size={18} className="animate-spin mx-auto" />
                                            ) : (t.pushNotifConsentAgree || 'موافق')}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer - Always visible and pinned to bottom */}
                <div className="p-4 border-t border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-900/50 flex gap-3 justify-end items-center shrink-0 z-10 backdrop-blur-sm">
                    {/* Feedback Button - First */}
                    <button
                        onClick={() => {
                            onClose();
                            openFeedback('settings_notes');
                        }}
                        className="flex-1 mx-2 flex items-center justify-center gap-2 px-4 py-2.5 border border-amber-200 dark:border-amber-800/50 bg-amber-50 dark:bg-amber-900/10 text-amber-700 dark:text-amber-400 rounded-xl hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-all font-medium text-sm active:scale-95"
                    >
                        <MessageSquare size={18} />
                        <span>{t.feedback}</span>
                    </button>

                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 border border-gray-300 dark:border-slate-600 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-slate-800 transition-all font-medium text-sm active:scale-95"
                    >
                        {t.cancel}
                    </button>

                    <button
                        onClick={handleSave}
                        className="px-8 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl shadow-lg shadow-amber-600/20 transition-all font-bold text-sm active:scale-95"
                    >
                        {t.save}
                    </button>
                </div>
            </div>

            <HowToUseGuide isOpen={showHelpModal} onClose={() => setShowHelpModal(false)} language={currentLanguage} />
            <VerseCalculatorModal
                isOpen={showVerseCalculator}
                onClose={() => {
                    setShowVerseCalculator(false);
                    onClose();
                }}
                currentLanguage={currentLanguage}
                memorizationRatings={memorizationRatings}
            />

        </div >

    );
}
