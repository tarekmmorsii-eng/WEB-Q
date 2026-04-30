import React, { useState, useEffect } from 'react';
import { X, CheckCircle, Download, BookOpen, Volume2 } from 'lucide-react';
import clsx from 'clsx';
import { SURAHS } from '../constants/surahData';
import { useReciters } from '../hooks/useReciters';
import { useAyahAudio } from '../hooks/useAyahAudio';
import { useWordByWordAudio, ActiveWord } from '../hooks/useWordByWordAudio';
import { getAyahTexts } from '../utils/ayahTextHelper';
import { translations, Language } from '../i18n/translations';
import { buildAudioUrl } from '../services/reciterService';





interface AudioDownloadModalProps {
    isOpen: boolean;
    onClose: () => void;
    language: string;
}

export default function AudioDownloadModal({ isOpen, onClose, language }: AudioDownloadModalProps) {
    const t = translations[language as Language] || translations['ar'];
    const isArabic = language === 'ar';
    const { reciters } = useReciters();
    const { preCacheAudio } = useAyahAudio();
    const { preCacheWords } = useWordByWordAudio();

    const [activeTab, setActiveTab] = useState<'full' | 'words'>('full');
    
    // Tab 1 state
    const [selectedReciter, setSelectedReciter] = useState<string>('ar.husary');
    const [selectedSurah, setSelectedSurah] = useState<number>(1);
    const [isDownloadingFull, setIsDownloadingFull] = useState(false);
    const [downloadedFullSurahs, setDownloadedFullSurahs] = useState<Set<number>>(new Set());

    // Tab 2 state
    const [downloadingWordsSurahs, setDownloadingWordsSurahs] = useState<Set<number>>(new Set());
    const [downloadedWordsSurahs, setDownloadedWordsSurahs] = useState<Set<number>>(new Set());
    const [cacheSizeMB, setCacheSizeMB] = useState<string>('0.00');
    const [showConfirmDelete, setShowConfirmDelete] = useState(false);

    const updateCacheSize = async () => {
        try {
            const cache = await caches.open('quran-audio-v2');
            const keys = await cache.keys();
            let totalBytes = 0;
            
            for (const req of keys) {
                const res = await cache.match(req);
                if (res) {
                    const blob = await res.blob();
                    totalBytes += blob.size;
                }
            }
            
            const mb = (totalBytes / (1024 * 1024)).toFixed(2);
            setCacheSizeMB(mb);
        } catch (e) {
            console.error('Failed to calculate cache size', e);
            setCacheSizeMB('0.00');
        }
    };

    // Verify download status against the REAL cache
    useEffect(() => {
        if (!isOpen || activeTab !== 'full') return;

        const verify = async () => {
            try {
                const cache = await caches.open('quran-audio-v2');
                const verified = new Set<number>();
                
                let startGlobal = 1;
                for (let surahNum = 1; surahNum <= 114; surahNum++) {
                    const ayahCount = SURAHS[surahNum - 1].ayahCount;
                    
                    // Create an array of promises for ALL ayahs in this surah
                    const ayahPromises = [];
                    for (let i = 0; i < ayahCount; i++) {
                        const url = buildAudioUrl(selectedReciter, startGlobal + i);
                        ayahPromises.push(cache.match(url, { ignoreSearch: true }));
                    }
                    
                    const results = await Promise.all(ayahPromises);
                    const allFound = results.every(res => res !== undefined);
                    
                    if (allFound) {
                        verified.add(surahNum);
                    }
                    startGlobal += ayahCount;
                }

                setDownloadedFullSurahs(verified);
                updateCacheSize();
            } catch (err) {
                console.error("Cache API failed, cannot verify downloads", err);
            }
        };

        verify();
    }, [selectedReciter, isOpen, activeTab]);



    const checkCacheStatus = async () => {
        // This is now redundant but keeping it empty or removing it to avoid errors if called elsewhere
    };

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    const handleDownloadFull = async () => {
        setIsDownloadingFull(true);
        try {
            const surahInfo = SURAHS.find(s => s.number === selectedSurah);
            if (!surahInfo) return;

            // Guard: must have internet to download
            if (!navigator.onLine) {
                window.dispatchEvent(new CustomEvent('showToast', {
                    detail: { message: 'لا يوجد اتصال بالإنترنت. يرجى الاتصال ثم المحاولة مجدداً.', type: 'error' }
                }));
                return;
            }

            let startGlobal = 1;
            for (let i = 0; i < selectedSurah - 1; i++) {
                startGlobal += SURAHS[i].ayahCount;
            }

            const ayahGlobalNumbers: number[] = [];
            for (let i = 0; i < surahInfo.ayahCount; i++) {
                ayahGlobalNumbers.push(startGlobal + i);
            }

            await preCacheAudio(ayahGlobalNumbers, selectedReciter);

            // Verify the first ayah is in cache (same key as preCacheAudio uses)
            const cache = await caches.open('quran-audio-v2');
            const firstAyahUrl = buildAudioUrl(selectedReciter, startGlobal);
            const confirmed = await cache.match(firstAyahUrl);


            if (confirmed) {
                setDownloadedFullSurahs(prev => new Set(prev).add(selectedSurah));
            } else {
                window.dispatchEvent(new CustomEvent('showToast', {
                    detail: { message: 'فشل التحميل — تحقق من اتصالك بالإنترنت', type: 'error' }
                }));
            }
        } catch (error) {
            console.error("Failed to download full surah", error);
        } finally {
            setIsDownloadingFull(false);
        }
    };

    const handleClearCache = async () => {

        try {
            // Only delete the audio cache as requested
            await caches.delete('quran-audio-v2');

            // Clear legacy audio tracking from localStorage to avoid inconsistency
            for (const key of Object.keys(localStorage)) {
                if (key.includes('downloaded') || key.includes('audio')) {
                    localStorage.removeItem(key);
                }
            }
            
            // Update UI State immediately without reloading
            setDownloadedFullSurahs(new Set());
            setDownloadedWordsSurahs(new Set());
            setCacheSizeMB('0.00');
            setShowConfirmDelete(false);
            
            window.dispatchEvent(new CustomEvent('showToast', {
                detail: { message: isArabic ? 'تم مسح الذاكرة المؤقتة بنجاح' : 'Audio cache cleared successfully', type: 'success' }
            }));
        } catch (e) {
            console.error("Failed to clear caches", e);
        }
    };

    const handleDownloadWords = async (surahNumber: number) => {
        if (!navigator.onLine) {
            window.dispatchEvent(new CustomEvent('showToast', {
                detail: { message: 'لا يوجد اتصال بالإنترنت', type: 'error' }
            }));
            return;
        }
        setDownloadingWordsSurahs(prev => new Set(prev).add(surahNumber));
        try {
            const surahInfo = SURAHS.find(s => s.number === surahNumber);
            if (!surahInfo) return;

            // 1. Get word counts by fetching the text of all ayahs
            const ayahRefs = Array.from({ length: surahInfo.ayahCount }, (_, i) => ({
                surahNumber,
                ayahNumber: i + 1
            }));

            const ayahTexts = await getAyahTexts(ayahRefs);

            // 2. Build words array
            const wordsToCache: ActiveWord[] = [];
            for (let i = 1; i <= surahInfo.ayahCount; i++) {
                const text = ayahTexts.get(`${surahNumber}-${i}`);
                if (text) {
                    // Split by spaces to get approximate word count. 
                    // Add +2 buffer because sometimes audio splits differ slightly from text spaces.
                    const count = text.split(' ').length + 2;
                    for (let w = 1; w <= count; w++) {
                        wordsToCache.push({ surah: surahNumber, ayah: i, word: w });
                    }
                }
            }

            // 3. call preCacheWords
            await preCacheWords(wordsToCache);

            // 4. Update UI
            setDownloadedWordsSurahs(prev => new Set(prev).add(surahNumber));
        } catch (error) {
            console.error("Failed to download words", error);
        } finally {
            setDownloadingWordsSurahs(prev => {
                const newSet = new Set(prev);
                newSet.delete(surahNumber);
                return newSet;
            });
        }
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
            onClick={handleBackdropClick}
            style={{ fontFamily: "'Almarai', sans-serif" }}
            dir={isArabic ? 'rtl' : 'ltr'}
        >
            <div className="w-full max-w-md rounded-2xl shadow-xl border border-[var(--border-primary)] relative animate-in zoom-in-95 duration-200 bg-[var(--bg-card)] overflow-hidden flex flex-col max-h-[85vh]">
                
                {/* Header */}
                <div className="p-6 pb-4 border-b border-[var(--border-primary)] bg-[var(--bg-secondary)] flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold text-[var(--text-primary)]">
                            {t.downloadManager || 'Download Manager'}
                        </h2>
                        <p className="text-[var(--text-primary)] opacity-60 text-xs mt-1">
                            {t.saveOfflineDesc || 'Save files for offline use'}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-[var(--bg-card)] text-[var(--text-primary)] opacity-60 hover:opacity-100 transition-all"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-[var(--border-primary)]">
                    <button
                        onClick={() => setActiveTab('full')}
                        className={clsx(
                            "flex-1 py-3 text-sm font-bold transition-all flex justify-center items-center gap-2",
                            activeTab === 'full'
                                ? "bg-[var(--bg-card)] text-amber-600 border-b-2 border-amber-600"
                                : "bg-[var(--bg-secondary)] text-[var(--text-primary)] opacity-60 hover:opacity-100"
                        )}
                    >
                        <Volume2 size={16} />
                        {t.fullRecitations || 'Full Recitations'}
                    </button>
                    <button
                        onClick={() => setActiveTab('words')}
                        className={clsx(
                            "flex-1 py-3 text-sm font-bold transition-all flex justify-center items-center gap-2",
                            activeTab === 'words'
                                ? "bg-[var(--bg-card)] text-amber-600 border-b-2 border-amber-600"
                                : "bg-[var(--bg-secondary)] text-[var(--text-primary)] opacity-60 hover:opacity-100"
                        )}
                    >
                        <BookOpen size={16} />
                        {t.wordsAudio || 'Words Audio'}
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto flex-1">
                    
                    {/* Tab 1: Full Recitations */}
                    {activeTab === 'full' && (
                        <div className="space-y-5">
                            <div>
                                <label className="block text-sm font-bold text-[var(--text-primary)] mb-2">
                                    {t.selectReciter || 'Select Reciter'}
                                </label>
                                <select
                                    value={selectedReciter}
                                    onChange={(e) => {
                                        setSelectedReciter(e.target.value);
                                        setSelectedSurah(1); // Force immediate reset to Fatiha
                                        setDownloadedFullSurahs(new Set()); // Clear status immediately before rescan
                                    }}
                                    className="w-full bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl px-4 py-3 text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all appearance-none"
                                >
                                    {reciters.map(reciter => (
                                        <option key={reciter.id} value={reciter.id}>
                                            {isArabic ? reciter.nameAr : (t.reciters && t.reciters[reciter.id] ? t.reciters[reciter.id] : reciter.nameEn)}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-[var(--text-primary)] mb-2">
                                    {t.selectSurah || 'Select Surah'}
                                </label>
                                <select
                                    value={selectedSurah}
                                    onChange={(e) => setSelectedSurah(parseInt(e.target.value))}
                                    className="w-full bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl px-4 py-3 text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all appearance-none"
                                >
                                    {SURAHS.map(surah => {
                                        const isDownloaded = downloadedFullSurahs.has(surah.number);
                                        return (
                                            <option key={surah.number} value={surah.number}>
                                                {surah.number}. {isArabic ? surah.name : (t.surahNames[surah.number - 1] || surah.name)}
                                                {isDownloaded ? ` ✓ (${'تم تحميلها'})` : ''}
                                            </option>
                                        );
                                    })}
                                </select>
                            </div>

                            <div className="pt-4">
                                {downloadedFullSurahs.has(selectedSurah) ? (
                                    <div className="w-full py-4 rounded-xl flex items-center justify-center gap-2 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-800">
                                        <CheckCircle size={20} />
                                        <span className="font-bold">{t.alreadyDownloaded || 'Already Downloaded'}</span>
                                    </div>
                                ) : (
                                    <button
                                        onClick={handleDownloadFull}
                                        disabled={isDownloadingFull}
                                        className={clsx(
                                            "w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all",
                                            isDownloadingFull
                                                ? "bg-[var(--bg-secondary)] text-[var(--text-primary)] opacity-50 cursor-not-allowed"
                                                : "bg-amber-600 hover:bg-amber-700 text-white shadow-lg shadow-amber-600/20"
                                        )}
                                    >
                                        {isDownloadingFull ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                {t.downloading || 'Downloading...'}
                                            </>
                                        ) : (
                                            <>
                                                <Download size={20} />
                                                {t.downloadSurah || 'Download Surah'}
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Tab 2: Words Audio */}
                    {activeTab === 'words' && (
                        <div className="space-y-3">
                            {SURAHS.map(surah => {
                                const isDownloaded = downloadedWordsSurahs.has(surah.number);
                                const isDownloading = downloadingWordsSurahs.has(surah.number);

                                return (
                                    <div key={surah.number} className="flex items-center justify-between p-3 rounded-xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] hover:border-amber-500/30 transition-all group">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-[var(--bg-card)] flex items-center justify-center text-xs font-bold text-amber-600 border border-[var(--border-primary)]">
                                                {surah.number}
                                            </div>
                                            <span className="font-bold text-[var(--text-primary)]">
                                                {isArabic ? surah.name : (t.surahNames[surah.number - 1] || surah.name)}
                                            </span>
                                        </div>

                                        {isDownloaded ? (
                                            <div className="flex items-center gap-1 text-green-500 bg-green-50 dark:bg-green-900/30 px-3 py-1.5 rounded-lg border border-green-200 dark:border-green-800/50">
                                                <CheckCircle size={16} />
                                                <span className="text-xs font-bold">{t.downloaded || 'Downloaded'}</span>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => handleDownloadWords(surah.number)}
                                                disabled={isDownloading}
                                                className={clsx(
                                                    "px-3 py-1.5 rounded-lg flex items-center gap-2 text-xs font-bold transition-all",
                                                    isDownloading
                                                        ? "bg-[var(--bg-card)] text-[var(--text-primary)] opacity-50 cursor-wait"
                                                        : "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 hover:bg-amber-200 dark:hover:bg-amber-900/50"
                                                )}
                                            >
                                                {isDownloading ? (
                                                    <div className="w-4 h-4 border-2 border-amber-600/30 border-t-amber-600 rounded-full animate-spin" />
                                                ) : (
                                                    <Download size={14} />
                                                )}
                                                {t.downloadAction || 'Download'}
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                    <div className="mt-8 pt-4 border-t border-[var(--border-primary)]">
                        <button
                            onClick={() => setShowConfirmDelete(true)}
                            className="w-full py-3 rounded-xl border border-red-500/30 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all flex items-center justify-center gap-2 text-sm font-bold"
                        >
                            <X size={18} />
                            {isArabic ? `مسح الذاكرة المؤقتة (${cacheSizeMB} MB)` : `Clear Audio Cache (${cacheSizeMB} MB)`}
                        </button>
                    </div>
                </div>
            </div>

            {/* Custom Confirmation Modal */}
            {showConfirmDelete && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl flex flex-col animate-scale-in">
                        <div className="p-6 text-center">
                            <div className="w-12 h-12 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                <X size={24} />
                            </div>
                            <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">
                                {isArabic ? 'تأكيد الحذف' : 'Confirm Deletion'}
                            </h3>
                            <p className="text-sm text-[var(--text-secondary)]">
                                {isArabic ? 'هل أنت متأكد من مسح جميع التلاوات المحملة؟ ستحتاج إلى إنترنت لتحميلها مجدداً.' : 'Are you sure you want to clear all downloaded audio? You will need internet to download them again.'}
                            </p>
                        </div>
                        <div className="flex border-t border-[var(--border-primary)]">
                            <button
                                onClick={() => setShowConfirmDelete(false)}
                                className="flex-1 py-4 text-sm font-bold text-[var(--text-secondary)] hover:bg-[var(--bg-body)] transition-colors border-l border-[var(--border-primary)]"
                            >
                                {isArabic ? 'إلغاء' : 'Cancel'}
                            </button>
                            <button
                                onClick={handleClearCache}
                                className="flex-1 py-4 text-sm font-bold text-red-500 hover:bg-red-500/10 transition-colors"
                            >
                                {isArabic ? 'نعم، امسح التنزيلات' : 'Yes, clear downloads'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
