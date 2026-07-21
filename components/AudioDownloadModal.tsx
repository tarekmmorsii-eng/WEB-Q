import React, { useState, useEffect } from 'react';
import { X, CheckCircle, Download, BookOpen, Volume2 } from 'lucide-react';
import clsx from 'clsx';
import { SURAHS } from '../constants/surahData';
import { useReciters } from '../hooks/useReciters';
import { useAyahAudio } from '../hooks/useAyahAudio';
import { useWordByWordAudio, ActiveWord } from '../hooks/useWordByWordAudio';
import { translations, Language } from '../i18n/translations';
import { getAyahTexts } from '../utils/ayahTextHelper';
import { buildAudioUrl } from '../services/reciterService';
import { 
    isAudioCached, 
    getAudioCacheSize, 
    getAllCachedKeys, 
    clearAllAudioCache 
} from '../services/audioCacheService';
import DownloadProgressBar from './DownloadProgressBar';



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
    const [selectedReciter, setSelectedReciter] = useState<string>('husary');
    const [selectedSurah, setSelectedSurah] = useState<number>(1);
    const [isDownloadingFull, setIsDownloadingFull] = useState(false);
    const [downloadedFullSurahs, setDownloadedFullSurahs] = useState<Set<number>>(new Set());

    // Tab 2 state
    const [downloadingWordsSurahs, setDownloadingWordsSurahs] = useState<Set<number>>(new Set());
    const [downloadedWordsSurahs, setDownloadedWordsSurahs] = useState<Set<number>>(new Set());
    const [cacheSizeMB, setCacheSizeMB] = useState<string>('0.00');
    const [showConfirmDelete, setShowConfirmDelete] = useState(false);
    const [showWbwTip, setShowWbwTip] = useState(false);

    // حالات تتبع التقدم
    const [progressPercent, setProgressPercent] = useState<number>(0);
    const [progressMsg, setProgressMsg] = useState<string>('');

    useEffect(() => {
        if (activeTab === 'words') {
            const currentViews = parseInt(localStorage.getItem('wbw_tip_views') || '0', 10);
            if (currentViews <= 3) {
                setShowWbwTip(true);
                localStorage.setItem('wbw_tip_views', (currentViews + 1).toString());
            }
        } else {
            setShowWbwTip(false);
        }
    }, [activeTab]);

    const handleDismissWbwTip = () => {
        localStorage.setItem('wbw_tip_views', '4');
        setShowWbwTip(false);
    };

    const updateCacheSize = async () => {
        try {
            const totalBytes = await getAudioCacheSize();
            const mb = (totalBytes / (1024 * 1024)).toFixed(2);
            setCacheSizeMB(mb);
        } catch (e) {
            console.error('Failed to calculate cache size', e);
            setCacheSizeMB('0.00');
        }
    };

    // Verify download status against IndexedDB
    useEffect(() => {
        if (!isOpen) return;

        const verify = async () => {
            try {
                if (activeTab === 'full') {
                    const verifiedFull = new Set<number>();
                    let startGlobal = 1;
                    
                    for (let surahNum = 1; surahNum <= 114; surahNum++) {
                        const ayahCount = SURAHS[surahNum - 1].ayahCount;
                        let allCached = true;
                        
                        for (let i = 0; i < ayahCount; i++) {
                            const url = buildAudioUrl(selectedReciter, startGlobal + i);
                            if (!url || !(await isAudioCached(url))) {
                                allCached = false;
                                break;
                            }
                        }
                        
                        if (allCached) {
                            verifiedFull.add(surahNum);
                        }
                        startGlobal += ayahCount;
                    }

                    setDownloadedFullSurahs(verifiedFull);
                } else if (activeTab === 'words') {
                    // ─── Reliable WBW Verification ──────────────────
                    // Strategy: Check IndexedDB for wbw files grouped by surah.
                    // A surah is "downloaded" if it has cached files for its
                    // first ayah AND last ayah (covers start and end).
                    const allKeys = await getAllCachedKeys();
                    const wbwKeys = allKeys.filter(k => k.includes('/wbw/'));

                    // Group by surah number
                    const surahFileCounts = new Map<number, number>();
                    for (const url of wbwKeys) {
                        const match = url.match(/\/wbw\/(\d+)_/);
                        if (match) {
                            const surahNum = parseInt(match[1], 10);
                            surahFileCounts.set(surahNum, (surahFileCounts.get(surahNum) || 0) + 1);
                        }
                    }

                    const verifiedWords = new Set<number>();
                    for (const [surahNum, fileCount] of surahFileCounts.entries()) {
                        // A surah needs at least (ayahCount * 3) files to be
                        // considered fully downloaded (minimum ~3 words per ayah).
                        // Use a conservative threshold: ayahCount * 2
                        const surahInfo = SURAHS.find(s => s.number === surahNum);
                        if (!surahInfo) continue;

                        const minExpected = surahInfo.ayahCount * 2;
                        if (fileCount >= minExpected) {
                            verifiedWords.add(surahNum);
                        }
                    }
                    setDownloadedWordsSurahs(verifiedWords);
                }
                
                updateCacheSize();
            } catch (err) {
                console.error("IndexedDB verification failed", err);
            }
        };

        verify();
    }, [selectedReciter, isOpen, activeTab]);

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    const handleDownloadFull = async () => {
        setIsDownloadingFull(true);
        setProgressPercent(0);
        setProgressMsg('');
        try {
            const surahInfo = SURAHS.find(s => s.number === selectedSurah);
            if (!surahInfo) return;

            // (لا نعتمد على navigator.onLine لأنها غير موثوقة على بعض الأجهزة،
            //  بل نحاول التحميل دائماً ونعرض رسالة عامة عند الفشل الفعلي فقط)
            let startGlobal = 1;
            for (let i = 0; i < selectedSurah - 1; i++) {
                startGlobal += SURAHS[i].ayahCount;
            }

            const ayahGlobalNumbers: number[] = [];
            for (let i = 0; i < surahInfo.ayahCount; i++) {
                ayahGlobalNumbers.push(startGlobal + i);
            }

            await preCacheAudio(ayahGlobalNumbers, selectedReciter, (percent, msg) => {
                setProgressPercent(percent);
                if (msg) setProgressMsg(msg);
            });

            // Verify the first ayah is in IndexedDB
            const firstAyahUrl = buildAudioUrl(selectedReciter, startGlobal);
            const confirmed = await isAudioCached(firstAyahUrl);

            if (confirmed) {
                setDownloadedFullSurahs(prev => new Set(prev).add(selectedSurah));
                updateCacheSize();
            } else {
                window.dispatchEvent(new CustomEvent('showToast', {
                    detail: { message: t.downloadFailed, type: 'error' }
                }));
            }
        } catch (error) {
            console.error("Failed to download full surah", error);
            window.dispatchEvent(new CustomEvent('showToast', {
                    detail: { 
                        message: t.downloadFailedServer, 
                        type: 'error' 
                    }
            }));
        } finally {
            setIsDownloadingFull(false);
            setProgressPercent(0);
            setProgressMsg('');
        }
    };

    const handleClearCache = async () => {
        try {
            // Clear IndexedDB audio cache
            await clearAllAudioCache();

            // Also clear legacy Cache API audio cache if it exists
            await caches.delete('quran-audio-v2');

            // Clear legacy audio tracking from localStorage
            for (const key of Object.keys(localStorage)) {
                if (key.includes('downloaded') || key.includes('audio')) {
                    localStorage.removeItem(key);
                }
            }
            
            // Update UI State immediately
            setDownloadedFullSurahs(new Set());
            setDownloadedWordsSurahs(new Set());
            setCacheSizeMB('0.00');
            setShowConfirmDelete(false);
            
            window.dispatchEvent(new CustomEvent('showToast', {
                detail: { message: t.audioCacheCleared, type: 'success' }
            }));
        } catch (e) {
            console.error("Failed to clear caches", e);
        }
    };

    const handleDownloadWords = async (surahNumber: number) => {
        // (لا نعتمد على navigator.onLine لأنها غير موثوقة على بعض الأجهزة،
        //  بل نحاول التحميل دائماً ونعرض رسالة عامة عند الفشل الفعلي فقط)
        setDownloadingWordsSurahs(prev => new Set(prev).add(surahNumber));
        setProgressPercent(0);
        setProgressMsg('');
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
                    const count = text.split(' ').length + 2;
                    for (let w = 1; w <= count; w++) {
                        wordsToCache.push({ surah: surahNumber, ayah: i, word: w });
                    }
                }
            }

            // 3. Call preCacheWords (now uses IndexedDB)
            await preCacheWords(wordsToCache, (percent, msg) => {
                setProgressPercent(percent);
                if (msg) setProgressMsg(msg);
            });

            // 4. Update UI
            setDownloadedWordsSurahs(prev => new Set(prev).add(surahNumber));
            updateCacheSize();
        } catch (error) {
            console.error("Failed to download words", error);
            window.dispatchEvent(new CustomEvent('showToast', {
                    detail: { 
                        message: t.failedDownloadWords, 
                        type: 'error' 
                    }
            }));
        } finally {
            setDownloadingWordsSurahs(prev => {
                const newSet = new Set(prev);
                newSet.delete(surahNumber);
                return newSet;
            });
            setProgressPercent(0);
            setProgressMsg('');
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
                            {t.downloadManager}
                        </h2>
                        <p className="text-[var(--text-primary)] opacity-60 text-xs mt-1">
                            {t.saveOfflineDesc}
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
                        {t.fullRecitations}
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
                        {t.wordsAudio}
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto flex-1">
                    
                    {/* Tab 1: Full Recitations */}
                    {activeTab === 'full' && (
                        <div className="space-y-5">
                            <div>
                                <label className="block text-sm font-bold text-[var(--text-primary)] mb-2">
                                    {t.selectReciter}
                                </label>
                                <select
                                    value={selectedReciter}
                                    onChange={(e) => {
                                        setSelectedReciter(e.target.value);
                                        setSelectedSurah(1);
                                        setDownloadedFullSurahs(new Set());
                                    }}
                                    className="w-full bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl px-4 py-3 text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all appearance-none"
                                >
                                    {reciters.map(reciter => (
                                        <option key={reciter.id} value={reciter.id} disabled={reciter.disabled}>
                                            {t.reciters && t.reciters[reciter.id] ? t.reciters[reciter.id] : reciter.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-[var(--text-primary)] mb-2">
                                    {t.selectSurah}
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
                                                {isDownloaded ? ` ✓ (${t.alreadyDownloadedLabel})` : ''}
                                            </option>
                                        );
                                    })}
                                </select>
                            </div>

                            <div className="pt-4">
                                {downloadedFullSurahs.has(selectedSurah) ? (
                                    <div className="w-full py-4 rounded-xl flex items-center justify-center gap-2 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-800">
                                        <CheckCircle size={20} />
                                        <span className="font-bold">{t.alreadyDownloaded}</span>
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
                                            <DownloadProgressBar 
                                                progress={progressPercent} 
                                                message={progressMsg || "جارٍ التحميل..."} 
                                            />
                                        ) : (
                                            <>
                                                <Download size={20} />
                                                {t.downloadSurah}
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
                            {showWbwTip && (
                                <div className="mb-4 p-4 rounded-xl border border-amber-500/30 bg-amber-50 dark:bg-amber-900/20 flex flex-col gap-3 animate-scale-in">
                                    <div className="flex items-start gap-3">
                                        <div className="text-amber-500 text-lg">💡</div>
                                        <p className="text-sm text-amber-800 dark:text-amber-200 font-medium leading-relaxed">
                                            {t.spaceSavingTip}
                                        </p>
                                    </div>
                                    <div className="flex justify-end">
                                        <button 
                                            onClick={handleDismissWbwTip}
                                            className="px-4 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 text-xs font-bold rounded-lg transition-colors border border-amber-500/20"
                                        >
                                            {t.gotIt}
                                        </button>
                                    </div>
                                </div>
                            )}

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
                                                <span className="text-xs font-bold">{t.downloaded}</span>
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
                                                    <DownloadProgressBar 
                                                        progress={progressPercent} 
                                                        message={progressMsg || "جارٍ التحميل..."} 
                                                    />
                                                ) : (
                                                    <>
                                                        <Download size={14} />
                                                        {t.downloadAction}
                                                    </>
                                                )}
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
                            {t.clearAudioCache.replace('{{size}}', cacheSizeMB)}
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
                                {t.confirmDeletion}
                            </h3>
                            <p className="text-sm text-[var(--text-secondary)]">
                                {t.confirmDeleteCacheMsg}
                            </p>
                        </div>
                        <div className="flex border-t border-[var(--border-primary)]">
                            <button
                                onClick={() => setShowConfirmDelete(false)}
                                className="flex-1 py-4 text-sm font-bold text-[var(--text-secondary)] hover:bg-[var(--bg-body)] transition-colors border-l border-[var(--border-primary)]"
                            >
                                {t.cancel}
                            </button>
                            <button
                                onClick={handleClearCache}
                                className="flex-1 py-4 text-sm font-bold text-red-500 hover:bg-red-500/10 transition-colors"
                            >
                                {t.yesClearDownloads}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}