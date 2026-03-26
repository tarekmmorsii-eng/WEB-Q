import React from 'react';
import { Download, HelpCircle, Share2 } from 'lucide-react';
import { useOfflineManager } from '../hooks/useOfflineManager';
import { Language, translations } from '../i18n/translations';
import { Theme } from '../constants/themes';

interface FloatingSideMenuProps {
    currentLanguage: Language;
    currentTheme: Theme;
    onOpenHelp: () => void;
    onOpenOffline: () => void;
    isVisible?: boolean;
    isEnabled?: boolean;
    isRTL?: boolean;
}

export default function FloatingSideMenu({
    currentLanguage,
    currentTheme,
    onOpenHelp,
    onOpenOffline,
    isVisible = true,
    isEnabled = true,
    isRTL = false
}: FloatingSideMenuProps) {
    const t = translations[currentLanguage];
    const {
        isDownloading,
        hasOfflineData,
        isStandalone,
        handleShareApp
    } = useOfflineManager(currentLanguage);

    const handleDownloadClick = () => {
        onOpenOffline();
    };

    if (!isEnabled) return null;

    return (
        <div className={`fixed ${isRTL ? 'right-0' : 'left-0'} top-1/2 -translate-y-1/2 z-[55] flex flex-col gap-2 p-2 transition-all duration-500 ease-in-out ${isVisible ? 'translate-x-0' : isRTL ? 'translate-x-full opacity-0 pointer-events-none' : '-translate-x-full opacity-0 pointer-events-none'}`}>
            {/* Download Button */}
            <button
                onClick={handleDownloadClick}
                disabled={isDownloading || (isStandalone && hasOfflineData) || !isVisible}
                className={`w-12 h-12 ${isRTL ? 'rounded-l-xl border-y border-l' : 'rounded-r-xl border-y border-r'} border-amber-500/30 flex items-center justify-center shadow-lg transition-all ${isDownloading
                    ? 'bg-amber-100 text-amber-500 cursor-wait'
                    : (isStandalone && hasOfflineData)
                        ? 'bg-emerald-50 text-emerald-600'
                        : 'bg-white dark:bg-slate-800 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-slate-700 hover:w-14'
                    }`}
                title={t.installAndDownload}
            >
                <Download size={24} className={isDownloading ? 'animate-bounce' : ''} />
            </button>

            {/* Help Button */}
            <button
                onClick={onOpenHelp}
                disabled={!isVisible}
                className={`w-12 h-12 ${isRTL ? 'rounded-l-xl border-y border-l border-indigo-500/30' : 'rounded-r-xl border-y border-r border-indigo-500/30'} flex items-center justify-center bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-lg hover:bg-indigo-50 dark:hover:bg-slate-700 transition-all hover:w-14`}
                title={t.help || 'المساعدة'}
            >
                <HelpCircle size={24} />
            </button>

            {/* Share Button */}
            <button
                onClick={handleShareApp}
                disabled={!isVisible}
                className={`w-12 h-12 ${isRTL ? 'rounded-l-xl border-y border-l border-blue-500/30' : 'rounded-r-xl border-y border-r border-blue-500/30'} flex items-center justify-center bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-lg hover:bg-blue-50 dark:hover:bg-slate-700 transition-all hover:w-14`}
                title={t.shareApp}
            >
                <Share2 size={24} />
            </button>
        </div>
    );
}
