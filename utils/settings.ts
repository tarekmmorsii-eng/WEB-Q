import { AppSettings } from '../types';

export const DEFAULT_SETTINGS: AppSettings = {
    language: 'ar',
    theme: 'warm-beige',
    textBrightness: 100,
    backgroundBrightness: 0,
    soundEnabled: true,
    bottomBar: {
        showIndex: true,
        showSearch: true,
        showMemorization: true,
        showNotifications: false,
        showDarkMode: true,
        showFontSize: false,
        showBookmark: true,
    },
    defaultFontSize: 'small',
    lineSpacing: 1.8,
    pageMargins: 0,
    colorStopSigns: true
};

export const loadSettings = (): AppSettings => {
    try {
        const saved = localStorage.getItem('quran_app_settings');
        if (saved) {
            return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
        }
    } catch (e) {
        console.error('Error loading settings', e);
    }
    return DEFAULT_SETTINGS;
};

export const saveSettings = (settings: AppSettings) => {
    try {
        localStorage.setItem('quran_app_settings', JSON.stringify(settings));
    } catch (e) {
        console.error('Error saving settings', e);
    }
};
