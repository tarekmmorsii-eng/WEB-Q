import React from 'react';
import { Download, HelpCircle, Share2 } from 'lucide-react';
import { useOfflineManager } from '../hooks/useOfflineManager';
import { Language, translations } from '../i18n/translations';
import { Theme } from '../constants/themes';

interface FloatingSideMenuProps {
    currentLanguage: Language;
    currentTheme: Theme;
    onOpenHelp: () => void;
    isVisible?: boolean;
    isEnabled?: boolean;
}

export default function FloatingSideMenu({
    currentLanguage,
    currentTheme,
    onOpenHelp,
    isVisible = true,
    isEnabled = true
}: FloatingSideMenuProps) {
    const t = translations[currentLanguage];
    const {
        isDownloading,
        hasOfflineData,
        isStandalone,
        handleInstallApp,
        handleDownloadAllData,
        handleShareApp
    } = useOfflineManager(currentLanguage);

    const handleDownloadClick = () => {
        // First try to install the app if not installed
        if (!isStandalone) {
            handleInstallApp();
        }
        // Always try to download mushaf data too if not already downloaded
        if (!hasOfflineData && !isDownloading) {
            handleDownloadAllData();
        }
    };

    if (!isEnabled) return null;

    return (
        <div className={`fixed left-0 top-1/2 -translate-y-1/2 z-[55] flex flex-col gap-2 p-2 transition-all duration-500 ease-in-out ${isVisible ? 'translate-x-0' : '-translate-x-full opacity-0 pointer-events-none'}`}>
            {/* Download Button */}
            <button
                onClick={handleDownloadClick}
                disabled={isDownloading || (isStandalone && hasOfflineData) || !isVisible}
                className={`w-12 h-12 rounded-r-xl flex items-center justify-center shadow-lg transition-all border-y border-r border-amber-500/30 ${isDownloading
                    ? 'bg-amber-100 text-amber-500 cursor-wait'
                    : (isStandalone && hasOfflineData)
                        ? 'bg-emerald-50 text-emerald-600'
                        : 'bg-white dark:bg-slate-800 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-slate-700 hover:w-14'
                    }`}
                title={currentLanguage === 'ar' ? 'تثبيت وتحميل المصحف' : 'Install & Download Mushaf'}
            >
                <Download size={24} className={isDownloading ? 'animate-bounce' : ''} />
            </button>

            {/* Help Button */}
            <button
                onClick={onOpenHelp}
                disabled={!isVisible}
                className={`w-12 h-12 rounded-r-xl flex items-center justify-center bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-lg hover:bg-indigo-50 dark:hover:bg-slate-700 transition-all border-y border-r border-indigo-500/30 hover:w-14`}
                title={t.help || 'المساعدة'}
            >
                <HelpCircle size={24} />
            </button>

            {/* Share Button */}
            <button
                onClick={handleShareApp}
                disabled={!isVisible}
                className={`w-12 h-12 rounded-r-xl flex items-center justify-center bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-lg hover:bg-blue-50 dark:hover:bg-slate-700 transition-all border-y border-r border-blue-500/30 hover:w-14`}
                title={currentLanguage === 'ar' ? 'مشاركة التطبيق' : 'Share App'}
            >
                <Share2 size={24} />
            </button>
        </div>
    );
}
