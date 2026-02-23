import React, { useState } from 'react';
import { X, Globe, Volume2, VolumeX, Palette, Layout, Menu, Search, BarChart3, Bell, Moon, Sun, Download, FileSpreadsheet, Loader2, Maximize, Minimize, MousePointer2, Bookmark, Settings2, ChevronDown, ChevronUp, Mail, HelpCircle, FileWarning, Calculator, MessageSquare, Check } from 'lucide-react';
import { useFeedback } from '../contexts/FeedbackContext';

import clsx from 'clsx';
import { AppSettings, BottomBarSettings } from '../types';
import { THEMES, Theme } from '../constants/themes';
import { translations, LANGUAGE_NAMES, Language } from '../i18n/translations';
import { fetchPage } from '../services/quranService';
import HowToUseGuide from './HowToUseGuide';
import VerseCalculatorModal from './VerseCalculatorModal';
import VisitorCounter from './VisitorCounter';


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
    onOpenMutashabihat?: () => void;
    onOpenColorPicker?: () => void;
    onTogglePageBookmark?: () => void;
    isPageBookmarked?: boolean;
    hasUpdate?: boolean;
    onUpdateApp?: () => void;
    memorizationRatings?: any[]; // Avoiding circular dependency for now, or use MemorizationRating[] if imported
}

export default function Settings({
    isOpen, onClose, settings, onSave, currentLanguage,
    onOpenIndex, onOpenSearch, onOpenMemorization,
    onOpenNotifications, onOpenMutashabihat, onOpenColorPicker,
    onTogglePageBookmark, isPageBookmarked,
    hasUpdate = false,
    onUpdateApp,
    memorizationRatings = []
}: SettingsProps) {
    const [localSettings, setLocalSettings] = useState<AppSettings>(settings);
    const t = translations[currentLanguage];
    const [isExporting, setIsExporting] = useState(false);
    const [showAllSettings, setShowAllSettings] = useState(false);
    const [showHelpModal, setShowHelpModal] = useState(false);

    const [showVerseCalculator, setShowVerseCalculator] = useState(false);
    const { openFeedback } = useFeedback();


    // ---------------------------
    // Offline & PWA Manager
    // ---------------------------
    const [installPrompt, setInstallPrompt] = useState<any>(null);
    const [downloadProgress, setDownloadProgress] = useState<number | null>(null);
    const [isDownloading, setIsDownloading] = useState(false);
    const [isStandalone, setIsStandalone] = useState(false);
    const [isInstalling, setIsInstalling] = useState(false);

    React.useEffect(() => {
        // Check if app is already installed/standalone
        const checkStandalone = () => {
            const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches ||
                (window.navigator as any).standalone === true ||
                document.referrer.includes('android-app://');
            setIsStandalone(isStandaloneMode);
        };

        checkStandalone();
        window.addEventListener('appinstalled', () => setIsStandalone(true));

        return () => window.removeEventListener('appinstalled', () => setIsStandalone(true));
    }, []);

    React.useEffect(() => {
        // 1. Capture install prompt
        const handleBeforeInstallPrompt = (e: any) => {
            e.preventDefault();
            setInstallPrompt(e);
        };
        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        // 2. Listen for SW progress
        const handleMessage = (event: MessageEvent) => {
            const data = event.data;
            if (data.type === 'DOWNLOAD_START') {
                setIsDownloading(true);
                setDownloadProgress(0);
            } else if (data.type === 'DOWNLOAD_PROGRESS') {
                const percent = Math.round((data.count / data.total) * 100);
                setDownloadProgress(percent);
            } else if (data.type === 'DOWNLOAD_COMPLETE') {
                setIsDownloading(false);
                setDownloadProgress(100);
                setTimeout(() => setDownloadProgress(null), 3000); // Hide after 3s
            }
        };

        if (navigator.serviceWorker) {
            navigator.serviceWorker.addEventListener('message', handleMessage);
        }

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
            if (navigator.serviceWorker) {
                navigator.serviceWorker.removeEventListener('message', handleMessage);
            }
        };
    }, []);

    const handleInstallApp = () => {
        if (!installPrompt) {
            // If prompt is missing, show a hint
            alert(currentLanguage === 'ar'
                ? 'عذراً، لا يمكن بدء التثبيت تلقائياً في هذا المتصفح. يرجى استخدام قائمة المتصفح (الثلاث نقاط) واختيار "إضافة إلى الشاشة الرئيسية".'
                : 'Sorry, installation cannot be started automatically in this browser. Please use your browser menu (three dots) and select "Add to Home Screen".');
            return;
        }

        setIsInstalling(true);
        installPrompt.prompt();
        installPrompt.userChoice.then((choiceResult: any) => {
            setIsInstalling(false);
            if (choiceResult.outcome === 'accepted') {
                setInstallPrompt(null);
            }
        }).catch(() => {
            setIsInstalling(false);
        });
    };

    const handleDownloadAllData = () => {
        if (navigator.serviceWorker && navigator.serviceWorker.controller) {
            setIsDownloading(true);
            setDownloadProgress(0);
            navigator.serviceWorker.controller.postMessage('CACHE_ALL_FONTS'); // Still using same message but SW now handles more
        } else {
            alert(currentLanguage === 'ar' ? 'Service Worker غير نشط. يرجى تحديث الصفحة والمحاولة مرة أخرى.' : 'Service Worker is inactive. Please refresh the page and try again.');
        }
    };

    // مزامنة الإعدادات المحلية عند فتح القائمة أو تغيير الإعدادات الخارجية
    // مزامنة الإعدادات المحلية عند تغيير الإعدادات الخارجية
    React.useEffect(() => {
        setLocalSettings(settings);
    }, [settings]);

    // إعادة تعيين واجهة المستخدم عند فتح القائمة
    React.useEffect(() => {
        if (isOpen) {
            setLocalSettings(settings); // Ensure fresh start
            setShowAllSettings(false);
        }
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
        { icon: Search, label: t.search, onClick: onOpenSearch },
        { icon: BarChart3, label: t.memorizationStats, onClick: onOpenMemorization },
        { icon: Bell, label: t.notifications, onClick: onOpenNotifications },
        { icon: FileWarning, label: t.similarVersesAlert, onClick: onOpenMutashabihat },
        { icon: Calculator, label: t.verseCalculatorTitle, onClick: () => setShowVerseCalculator(true), keepOpen: true },
    ];


    return (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-300">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[96vh] md:max-h-[90vh] flex flex-col overflow-hidden border border-amber-200/20 dark:border-slate-700">
                {/* Header - Non-sticky since parent is flex-col */}
                <div className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 p-4 flex justify-between items-center shrink-0 z-10">
                    <div className="flex items-center gap-3">
                        <img
                            src="/final_logo.png"
                            alt="Logo"
                            className="w-10 h-10 rounded-full border border-amber-500/30"
                        />
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
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
                        {currentLanguage === 'ar' ? 'نسخة تجريبية' : 'Beta Version'}
                    </div>

                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                    >
                        <X size={24} className="text-gray-600 dark:text-gray-400" />
                    </button>
                </div>


                {/* Scrollable Content wrapper */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-8 min-h-0">
                    {/* Quick Access Buttons */}
                    <section>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {quickAccessButtons.map((btn, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => {
                                        if (!btn.keepOpen) onClose();
                                        btn.onClick?.();
                                    }}
                                    className="flex flex-col items-center gap-2 p-4 bg-amber-50 dark:bg-slate-800 rounded-lg hover:bg-amber-100 dark:hover:bg-slate-700 transition-colors"
                                >
                                    <btn.icon size={24} className="text-amber-600 dark:text-amber-500" />
                                    <span className="text-sm text-gray-700 dark:text-gray-300">{btn.label}</span>
                                </button>
                            ))}
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
                                className="flex flex-col items-center gap-2 p-4 bg-amber-50 dark:bg-slate-800 rounded-lg hover:bg-amber-100 dark:hover:bg-slate-700 transition-colors"
                            >
                                {currentTheme.isDark ? <Sun size={24} className="text-amber-600 dark:text-amber-500" /> : <Moon size={24} className="text-amber-600 dark:text-amber-500" />}
                                <span className="text-sm text-gray-700 dark:text-gray-300">
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
                                className="flex flex-col items-center gap-2 p-4 bg-amber-50 dark:bg-slate-800 rounded-lg hover:bg-amber-100 dark:hover:bg-slate-700 transition-colors"
                            >
                                <MousePointer2
                                    size={24}
                                    className="text-amber-600 dark:text-amber-500"
                                    fill={localSettings.prayerMode ? "currentColor" : "none"}
                                />
                                <span className="text-sm text-gray-700 dark:text-gray-300">{t.prayerMode}</span>
                            </button>

                            {/* Page Bookmark Toggle */}
                            <button
                                onClick={() => {
                                    onTogglePageBookmark?.();
                                    onClose();
                                }}
                                className="flex flex-col items-center gap-2 p-4 bg-amber-50 dark:bg-slate-800 rounded-lg hover:bg-amber-100 dark:hover:bg-slate-700 transition-colors"
                            >
                                <Bookmark
                                    size={24}
                                    className="text-amber-600 dark:text-amber-500"
                                    fill={isPageBookmarked ? "currentColor" : "none"}
                                />
                                <span className="text-sm text-gray-700 dark:text-gray-300">{t.bookmark}</span>
                            </button>

                            {/* Fullscreen Toggle (hide on iOS) */}
                            {!(/iPad|iPhone|iPod/.test(navigator.userAgent)) && (
                                <button
                                    onClick={() => {
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
                                        onClose();
                                    }}
                                    className="flex flex-col items-center gap-2 p-4 bg-amber-50 dark:bg-slate-800 rounded-lg hover:bg-amber-100 dark:hover:bg-slate-700 transition-colors"
                                >
                                    <Maximize size={24} className="text-amber-600 dark:text-amber-500" />
                                    <span className="text-sm text-gray-700 dark:text-gray-300">{t.fullscreen}</span>
                                </button>
                            )}
                        </div>

                        {/* More Settings Toggle Button */}
                        <button
                            onClick={() => setShowAllSettings(!showAllSettings)}
                            className="w-full mt-4 flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-800 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors group"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white dark:bg-slate-700 rounded-full shadow-sm group-hover:scale-110 transition-transform">
                                    <Settings2 size={20} className="text-gray-600 dark:text-gray-300" />
                                </div>
                                <span className="font-medium text-gray-900 dark:text-white">
                                    {showAllSettings ? t.hideDetailedSettings : t.moreSettings}
                                </span>
                            </div>
                            {showAllSettings ? (
                                <ChevronUp size={20} className="text-gray-500" />
                            ) : (
                                <ChevronDown size={20} className="text-gray-500" />
                            )}
                        </button>
                    </section>

                    {showAllSettings && (
                        <>

                            {/* Language Selection */}
                            <section>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                    <Globe size={20} />
                                    {t.languages}
                                </h3>
                                <select
                                    value={localSettings.language}
                                    onChange={(e) => setLocalSettings(prev => ({ ...prev, language: e.target.value }))}
                                    className="w-full p-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                                >
                                    {Object.entries(LANGUAGE_NAMES).map(([code, name]) => (
                                        <option key={code} value={code}>{name}</option>
                                    ))}
                                </select>
                            </section>



                            {/* Color Themes */}
                            <section>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                    <Palette size={20} />
                                    {t.colorThemes}
                                </h3>
                                <button
                                    onClick={() => {
                                        onClose(); // Close settings modal
                                        onOpenColorPicker?.(); // Open Color Picker Modal
                                    }}
                                    className="w-full p-6 rounded-xl border-2 border-dashed border-gray-300 dark:border-slate-700 hover:border-amber-500 dark:hover:border-amber-400 hover:bg-amber-50 dark:hover:bg-slate-800/50 transition-all flex flex-col items-center justify-center gap-3 group"
                                >
                                    <div className="flex -space-x-2">
                                        <div className="w-8 h-8 rounded-full bg-amber-200 border-2 border-white dark:border-slate-800" />
                                        <div className="w-8 h-8 rounded-full bg-blue-200 border-2 border-white dark:border-slate-800" />
                                        <div className="w-8 h-8 rounded-full bg-green-200 border-2 border-white dark:border-slate-800" />
                                    </div>
                                    <span className="font-medium text-gray-700 dark:text-gray-300 group-hover:text-amber-700 dark:group-hover:text-amber-400">
                                        {t.selectTheme || 'اختر نمط الألوان'}
                                    </span>
                                </button>

                                {/* Color Stop Signs Toggle */}
                                <label className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-800 rounded-lg cursor-pointer mt-4">
                                    <span className="text-gray-900 dark:text-white flex items-center gap-2">
                                        {t.colorStopSigns || 'تلوين علامات الوقف'}
                                        <span className="text-3xl text-amber-600 dark:text-amber-500 font-serif mx-4 gap-4 flex items-center">
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
                                <label className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-800 rounded-lg cursor-pointer mt-3">
                                    <div className="flex items-center gap-4">
                                        <div className="flex flex-col">
                                            <span className="text-gray-900 dark:text-white font-medium">
                                                {currentLanguage === 'ar' ? t.showSimilarVersesIndicators : 'Show Mutashabihat Indicators'}
                                            </span>
                                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                                {currentLanguage === 'ar' ? t.similarVersesIndicatorsDesc : 'Colored lines under ayah numbers'}
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

                            </section>

                            {/* Sound Settings */}
                            <section>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                    {localSettings.soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
                                    {t.soundSettings}
                                </h3>
                                <label className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-800 rounded-lg cursor-pointer">
                                    <span className="text-gray-900 dark:text-white">{t.pageFlipSound}</span>
                                    <input
                                        type="checkbox"
                                        checked={localSettings.soundEnabled}
                                        onChange={(e) => setLocalSettings(prev => ({ ...prev, soundEnabled: e.target.checked }))}
                                        className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                                    />
                                </label>


                            </section>

                            {/* Bottom Bar Customization */}
                            <section>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                    <Layout size={20} />
                                    {t.bottomBarCustomization}
                                </h3>
                                <div className="space-y-2">
                                    {[
                                        { key: 'showIndex' as keyof BottomBarSettings, label: t.index },
                                        { key: 'showSearch' as keyof BottomBarSettings, label: t.search },
                                        { key: 'showMemorization' as keyof BottomBarSettings, label: t.memorizationStats },
                                        { key: 'showNotifications' as keyof BottomBarSettings, label: t.notifications },
                                        { key: 'showDarkMode' as keyof BottomBarSettings, label: t.darkMode + ' / ' + t.lightMode },
                                        { key: 'showBookmark' as keyof BottomBarSettings, label: t.bookmark },
                                        { key: 'showPrayerMode' as keyof BottomBarSettings, label: t.prayerMode },
                                        { key: 'showFullscreen' as keyof BottomBarSettings, label: t.fullscreen },
                                        { key: 'showPageNavigation' as keyof BottomBarSettings, label: t.pageNavigation },
                                    ].map(({ key, label }) => (
                                        <label
                                            key={key}
                                            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-800 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                                        >
                                            <span className="text-gray-900 dark:text-white">{label}</span>
                                            <input
                                                type="checkbox"
                                                checked={localSettings.bottomBar[key]}
                                                onChange={() => toggleBottomBarItem(key)}
                                                className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                                            />
                                        </label>
                                    ))}
                                </div>
                            </section>



                            {/* Offline Manager */}
                            <section>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                    <Download size={20} />
                                    {t.offlineMode}
                                </h3>

                                {hasUpdate && !isStandalone && (
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
                                        {currentLanguage === 'ar'
                                            ? 'ملاحظة: التثبيت يتم على خطوتين: الخطوة الأولى: تثبيت التطبيق والخطوة الثانية: تحديث وحفظ المصحف كاملاً.'
                                            : 'Note: Installation is done in two steps: Step 1: Install the app, and Step 2: Update and save the full Mushaf.'}
                                    </div>

                                    <div className="space-y-3">
                                        {/* Step 1 Label */}
                                        <div className="text-[11px] font-bold text-amber-700 dark:text-amber-500 px-1 uppercase tracking-wider">
                                            {currentLanguage === 'ar' ? 'الخطوة الأولى' : 'Step 1'}
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
                                                        ? (currentLanguage === 'ar' ? 'تحديث التطبيق متوفر' : 'App update available')
                                                        : isStandalone
                                                            ? (currentLanguage === 'ar' ? 'التطبيق مثبت على جهازك' : 'App is installed on your device')
                                                            : (isInstalling ? (currentLanguage === 'ar' ? 'جاري بدء التثبيت...' : 'Starting install...') : t.installApp)
                                                    }
                                                </span>
                                                <span className="text-[10px] opacity-70">
                                                    {hasUpdate
                                                        ? (currentLanguage === 'ar' ? 'اضغط لتثبيت أحدث الميزات والإصلاحات البرمجية' : 'Click to install the latest features and fixes')
                                                        : isStandalone
                                                            ? (currentLanguage === 'ar' ? 'أي كود جديد سنحدثه لك هنا' : 'We will update any new code for you here')
                                                            : (currentLanguage === 'ar' ? 'تثبيت الإطار البرمجي للوصول السريع' : 'Install the app frame for fast access')
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

                                        {/* Step 2 Label */}
                                        <div className="text-[11px] font-bold text-blue-700 dark:text-blue-500 px-1 pt-2 uppercase tracking-wider">
                                            {currentLanguage === 'ar' ? 'الخطوة الثانية' : 'Step 2'}
                                        </div>

                                        {/* Download/Update Mushaf Button */}
                                        <button
                                            onClick={handleDownloadAllData}
                                            disabled={isDownloading}
                                            className={clsx(
                                                "w-full flex items-center justify-between p-4 rounded-lg transition-all border-2",
                                                isDownloading
                                                    ? "bg-gray-100 dark:bg-slate-800 border-gray-200 dark:border-slate-700 cursor-wait"
                                                    : "bg-white dark:bg-slate-800 border-blue-200 dark:border-blue-800 hover:border-blue-500 cursor-pointer active:scale-[0.98]"
                                            )}
                                        >
                                            <div className="flex flex-col items-start">
                                                <span className="font-medium text-gray-900 dark:text-white">
                                                    {isDownloading ? t.updatingMushaf : t.downloadMushaf}
                                                </span>
                                                <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                    {isDownloading
                                                        ? t.waitUpdating.replace('{percent}', downloadProgress?.toString() || '0')
                                                        : t.downloadMushafDescription
                                                    }
                                                </span>
                                            </div>
                                            {isDownloading ? (
                                                <Loader2 size={24} className="animate-spin text-blue-600" />
                                            ) : (
                                                <Download size={24} className="text-blue-600 dark:text-blue-400" />
                                            )}
                                        </button>

                                        {/* Progress Bar */}
                                        {downloadProgress !== null && (
                                            <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2.5 mt-2">
                                                <div
                                                    className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                                                    style={{ width: `${downloadProgress}%` }}
                                                ></div>
                                            </div>
                                        )}

                                        {downloadProgress === 100 && (
                                            <div className="text-center text-green-600 dark:text-green-400 text-sm font-medium animate-pulse">
                                                {t.downloadSuccess}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </section>


                            {/* Help Section */}
                            <section>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                    <HelpCircle size={20} />
                                    {t.help || 'المساعدة والتعليمات'}
                                </h3>
                                <button
                                    onClick={() => setShowHelpModal(true)}
                                    className="w-full flex items-center justify-between p-4 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-900 dark:text-emerald-100 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors border border-emerald-100 dark:border-emerald-800"
                                >
                                    <span className="font-medium text-emerald-800 dark:text-emerald-200">
                                        {t.howToUse || 'كيفية استخدام التطبيق'}
                                    </span>
                                    <HelpCircle size={20} className="text-emerald-600 dark:text-emerald-400" />
                                </button>
                            </section>

                            {/* Contact Section */}
                            <section>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                    <Mail size={20} />
                                    {t.contact || 'للتواصل'}
                                </h3>
                                <div className="p-4 bg-gray-50 dark:bg-slate-800 rounded-lg flex flex-col items-center justify-center gap-2 text-center hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
                                    <a
                                        href="mailto:tarek.m.morsii@gmail.com"
                                        className="text-gray-900 dark:text-white font-medium hover:text-blue-600 dark:hover:text-blue-400 underline decoration-dotted underline-offset-4"
                                    >
                                        tarek.m.morsii@gmail.com
                                    </a>
                                </div>
                            </section>

                            {/* Visitor Counter - Inside More Settings */}
                            <div className="pt-4 border-t border-gray-100 dark:border-slate-800">
                                <VisitorCounter t={t} language={currentLanguage} />

                                <div className="mt-6 pb-2 text-center">
                                    <p className="text-[10px] text-gray-400 dark:text-slate-500 font-mono opacity-50">
                                        Version 1.2.6 • 2026.02.23 • Optimized
                                    </p>
                                </div>
                            </div>
                        </>
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
