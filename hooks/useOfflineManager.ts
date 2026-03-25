import { useState, useEffect } from 'react';
import { translations, Language } from '../i18n/translations';

interface OfflineManagerState {
    installPrompt: any;
    downloadProgress: number | null;
    isDownloading: boolean;
    isStandalone: boolean;
    isInstalling: boolean;
    hasOfflineData: boolean;
}

interface OfflineManagerActions {
    handleInstallApp: () => void;
    handleDownloadAllData: () => void;
    handleShareApp: () => Promise<void>;
}

export function useOfflineManager(currentLanguage: Language): OfflineManagerState & OfflineManagerActions {
    const [installPrompt, setInstallPrompt] = useState<any>(null);
    const [downloadProgress, setDownloadProgress] = useState<number | null>(null);
    const [isDownloading, setIsDownloading] = useState(false);
    const [isStandalone, setIsStandalone] = useState(false);
    const [isInstalling, setIsInstalling] = useState(false);
    const [hasOfflineData, setHasOfflineData] = useState(false);

    useEffect(() => {
        // Check if app is already installed/standalone
        const checkStandalone = () => {
            const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches ||
                (window.navigator as any).standalone === true ||
                document.referrer.includes('android-app://');
            setIsStandalone(isStandaloneMode);
        };

        checkStandalone();
        const handleAppInstalled = () => setIsStandalone(true);
        window.addEventListener('appinstalled', handleAppInstalled);

        return () => window.removeEventListener('appinstalled', handleAppInstalled);
    }, []);

    useEffect(() => {
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
            } else if (data.type === 'DOWNLOAD_ERROR') {
                setIsDownloading(false);
                setDownloadProgress(null);
                alert(currentLanguage === 'ar'
                    ? `⚠️ حدث خطأ أثناء التحميل: ${data.error}. يرجى المحاولة مرة أخرى.`
                    : `⚠️ Download error: ${data.error}. Please try again.`);
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
    }, [currentLanguage]);

    useEffect(() => {
        const checkCaches = async () => {
            try {
                if ('caches' in window) {
                    const keys = await caches.keys();
                    const fontCache = keys.find(k => k.includes('quran-fonts'));
                    if (fontCache) {
                        const cache = await caches.open(fontCache);
                        const reqs = await cache.keys();
                        
                        // Check for at least one critical baseline font to ensure download was complete
                        const hasBaseline = reqs.some(r => r.url.includes('KFGQPC_UthmaniHafs_08.ttf'));
                        
                        // 604 pages + 3 baseline fonts = 607 minimum for a perfect download
                        if (reqs.length >= 604 && hasBaseline) {
                            setHasOfflineData(true);
                        }
                    }
                }
            } catch (e) { }
        };
        // Check on mount and also after downloading finishes
        if (!isDownloading) {
            checkCaches();
        }
    }, [isDownloading]);

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
            navigator.serviceWorker.controller.postMessage('CACHE_ALL_FONTS');
        } else {
            alert(currentLanguage === 'ar' ? 'Service Worker غير نشط. يرجى تحديث الصفحة والمحاولة مرة أخرى.' : 'Service Worker is inactive. Please refresh the page and try again.');
        }
    };

    const handleShareApp = async () => {
        const shareData = {
            title: currentLanguage === 'ar' ? 'مصحف المراجعة' : 'Mushaf Al-Murajaa',
            text: currentLanguage === 'ar' ? 'تطبيق مصحف المراجعة: رفيقك في مسيرتك لحفظ القرآن الكريم وتثبيته. يوفر أدوات متقدمة لاختبار الحفظ، ومراجعة المتشابهات اللفظية، ومعرفة معاني الكلمات بسهولة.' : 'Mushaf Al-Murajaa App: Your companion in memorizing and solidifying the Holy Quran. It provides advanced tools for testing memorization, reviewing verbal similarities, and understanding word meanings easily.',
            url: 'https://mushafalmurajaa.com'
        };

        const copyToClipboard = async () => {
            try {
                await navigator.clipboard.writeText(shareData.url);
                alert(currentLanguage === 'ar' ? 'تم نسخ الرابط إلى الحافظة' : 'Link copied to clipboard');
            } catch (err) {
                console.error('Failed to copy link:', err);
            }
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch (err: any) {
                console.error('Error sharing app:', err);
                if (err.name !== 'AbortError') {
                    await copyToClipboard();
                }
            }
        } else {
            await copyToClipboard();
        }
    };

    return {
        installPrompt,
        downloadProgress,
        isDownloading,
        isStandalone,
        isInstalling,
        hasOfflineData,
        handleInstallApp,
        handleDownloadAllData,
        handleShareApp
    };
}
