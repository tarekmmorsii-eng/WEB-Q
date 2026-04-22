import React from 'react';
import { Download, HelpCircle, Share2, PlayCircle } from 'lucide-react';
import { useOfflineManager } from '../hooks/useOfflineManager';
import { Language, translations } from '../i18n/translations';
import { Theme } from '../constants/themes';

interface FloatingSideMenuProps {
    currentLanguage: Language;
    currentTheme: Theme;
    onOpenHelp: () => void;
    onOpenOffline: () => void;
    onOpenReciterSelection?: () => void;
    onOpenShare?: () => void;
    isVisible?: boolean;
    isEnabled?: boolean;
    isRTL?: boolean;
}

export default function FloatingSideMenu({
    currentLanguage,
    currentTheme,
    onOpenHelp,
    onOpenOffline,
    onOpenReciterSelection,
    onOpenShare,
    isVisible = true,
    isEnabled = true,
    isRTL = false
}: FloatingSideMenuProps) {
    const t = translations[currentLanguage];
    const {
        isDownloading,
        hasOfflineData,
        isStandalone
    } = useOfflineManager(currentLanguage);

    const handleDownloadClick = () => {
        onOpenOffline();
    };

    if (!isEnabled) return null;

    return (
        <div className={`fixed ${isRTL ? 'left-0' : 'right-0'} top-1/2 -translate-y-1/2 z-[55] flex flex-col gap-2 p-2 transition-all duration-500 ease-in-out ${isVisible ? 'translate-x-0' : isRTL ? '-translate-x-full opacity-0 pointer-events-none' : 'translate-x-full opacity-0 pointer-events-none'}`}>
            {/* Recitation Auto-Play Button */}
            <button
                id="tour-audio-btn-floating"
                onClick={onOpenReciterSelection}
                disabled={!isVisible}
                className={`w-12 h-12 ${isRTL ? 'rounded-r-xl border-y border-r border-amber-500/30' : 'rounded-l-xl border-y border-l border-amber-500/30'} flex items-center justify-center bg-[var(--bg-card)] text-amber-600 shadow-lg hover:bg-[var(--bg-secondary)] transition-all hover:w-14`}
                title={currentLanguage === 'ar' ? 'تلاوة الآيات' : 'Ayah Recitation'}
            >
                <PlayCircle size={24} />
            </button>

            {/* Download Button */}
            <button
                id="tour-download-btn-floating"
                onClick={handleDownloadClick}
                disabled={isDownloading || (isStandalone && hasOfflineData) || !isVisible}
                className={`w-12 h-12 ${isRTL ? 'rounded-r-xl border-y border-r' : 'rounded-l-xl border-y border-l'} border-amber-500/30 flex items-center justify-center shadow-lg transition-all ${isDownloading
                    ? 'bg-amber-100 text-amber-500 cursor-wait'
                    : (isStandalone && hasOfflineData)
                        ? 'bg-emerald-50 text-emerald-600'
                        : 'bg-[var(--bg-card)] text-amber-600 hover:bg-[var(--bg-secondary)] hover:w-14'
                    }`}
                title={t.installAndDownload}
            >
                <Download size={24} className={isDownloading ? 'animate-bounce' : ''} />
            </button>

            {/* Help Button */}
            <button
                id="tour-help-btn-floating"
                onClick={onOpenHelp}
                disabled={!isVisible}
                className={`w-12 h-12 ${isRTL ? 'rounded-r-xl border-y border-r border-indigo-500/30' : 'rounded-l-xl border-y border-l border-indigo-500/30'} flex items-center justify-center bg-[var(--bg-card)] text-indigo-600 shadow-lg hover:bg-[var(--bg-secondary)] transition-all hover:w-14`}
                title={t.help || 'المساعدة'}
            >
                <HelpCircle size={24} />
            </button>

            {/* Share Button */}
            <button
                onClick={onOpenShare}
                disabled={!isVisible}
                className={`w-12 h-12 ${isRTL ? 'rounded-r-xl border-y border-r border-blue-500/30' : 'rounded-l-xl border-y border-l border-blue-500/30'} flex items-center justify-center bg-[var(--bg-card)] text-blue-600 shadow-lg hover:bg-[var(--bg-secondary)] transition-all hover:w-14`}
                title={t.shareApp}
            >
                <Share2 size={24} />
            </button>
        </div>
    );
}
