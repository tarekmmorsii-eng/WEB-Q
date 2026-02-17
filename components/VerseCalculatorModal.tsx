import React, { useState, useMemo, useEffect } from 'react';
import { X, Calculator, BookOpen, AlertCircle, ChevronRight, Check, CheckCircle2, BarChart3, Layers } from 'lucide-react';
import clsx from 'clsx';
import { SURAHS } from '../constants/surahData';
import { JUZ_BOUNDARIES, HIZB_BOUNDARIES, RUB_BOUNDARIES } from '../constants/structureBoundaries';
import { MemorizationRating } from '../types';
import { translations, Language } from '../i18n/translations';

interface VerseCalculatorModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentLanguage: string;
    memorizationRatings?: any[]; // Using any[] to allow flexibility, but ideally MemorizationRating[]
}

export default function VerseCalculatorModal({ isOpen, onClose, currentLanguage, memorizationRatings = [] }: VerseCalculatorModalProps) {
    const [startSurah, setStartSurah] = useState(1);
    const [startAyah, setStartAyah] = useState(1);
    const [endSurah, setEndSurah] = useState(1);
    const [endAyah, setEndAyah] = useState(7);

    // New Feature State
    const [mode, setMode] = useState<'range' | 'structure'>('structure'); // Default to structure
    const [structureType, setStructureType] = useState<'juz' | 'hizb' | 'rub'>('juz');
    const [structureIndex, setStructureIndex] = useState(1);



    const trans = translations[currentLanguage as Language] || translations['ar'];

    const t = {
        title: trans.verseCalculatorTitle,
        startPoint: trans.startPoint,
        endPoint: trans.endPoint,
        calculate: trans.calculate,
        result: trans.verseCount,
        surah: trans.surah,
        ayah: trans.verse,
        close: trans.close,
        error: trans.invalidRange,
        modeRange: trans.modeRange,
        modeStructure: trans.modeStructure,
        typeJuz: trans.juzType,
        typeHizb: trans.hizbType,
        typeRub: trans.rubType,
        selectStructure: trans.selectStructure,
        statsTitle: trans.memorizationStatsTitle,
        good: trans.strong,
        medium: trans.medium,
        weak: trans.weak,
        unrated: trans.notRated,
    };

    // Helper to get boundary for selected structure
    const getStructureBoundary = () => {
        const index = structureIndex - 1; // 0-based
        if (structureType === 'juz') return JUZ_BOUNDARIES[index];
        if (structureType === 'hizb') return HIZB_BOUNDARIES[index];
        if (structureType === 'rub') return RUB_BOUNDARIES[index];
        return null;
    };

    // Synch range when structure changes
    useEffect(() => {
        if (mode === 'structure') {
            const boundary = getStructureBoundary();
            if (boundary) {
                setStartSurah(boundary.start.surah);
                setStartAyah(boundary.start.ayah);
                setEndSurah(boundary.end.surah);
                setEndAyah(boundary.end.ayah);
            }
        }
    }, [mode, structureType, structureIndex]);

    const calculateCount = () => {
        if (startSurah === endSurah) {
            return endAyah - startAyah + 1;
        }

        // Ensure valid surah indices
        if (!SURAHS[startSurah - 1] || !SURAHS[endSurah - 1]) return 0;

        // First surah remaining ayahs
        let count = SURAHS[startSurah - 1].ayahCount - startAyah + 1;

        // Full intermediate surahs
        for (let i = startSurah + 1; i < endSurah; i++) {
            if (SURAHS[i - 1]) {
                count += SURAHS[i - 1].ayahCount;
            }
        }

        // Last surah ayahs
        count += endAyah;

        return count;
    };

    const count = calculateCount();
    const isValid = count > 0;

    // --- Memorization Statistics Logic ---
    const stats = useMemo(() => {
        if (!isValid) return null;

        const ratingsMap = new Map();
        if (memorizationRatings && memorizationRatings.length > 0) {
            memorizationRatings.forEach((r: any) => ratingsMap.set(r.ayahId, r.rating));
        }

        let good = 0;
        let medium = 0;
        let weak = 0;
        let totalVersesReviewed = 0;

        // Iterate through all verses in the range
        let currentS = startSurah;
        let currentA = startAyah;

        // Safety check to prevent infinite loops if logic is off
        let safetyCounter = 0;
        const maxVerses = 7000; // More than Quran total

        while ((currentS < endSurah || (currentS === endSurah && currentA <= endAyah)) && safetyCounter < maxVerses) {
            const ayahId = `${currentS}-${currentA}`;
            const rating = ratingsMap.get(ayahId);

            if (rating) {
                if (rating === 'good') good++;
                else if (rating === 'medium') medium++;
                else if (rating === 'weak') weak++;
                totalVersesReviewed++;
            }

            // Move to next verse
            if (SURAHS[currentS - 1] && currentA < SURAHS[currentS - 1].ayahCount) {
                currentA++;
            } else {
                if (currentS >= 114) break; // End of Quran
                currentS++;
                currentA = 1;
            }
            safetyCounter++;
        }

        const unrated = count - totalVersesReviewed;

        return { good, medium, weak, unrated, total: count };
    }, [startSurah, startAyah, endSurah, endAyah, memorizationRatings, count, isValid]);

    // Validation for dropdowns
    const maxIndex = structureType === 'juz' ? 30 : structureType === 'hizb' ? 60 : 240;

    // Debug logging
    console.log('VerseCalculatorModal Render:', {
        isOpen,
        mode,
        isValid,
        count,
        stats,
        memorizationRatingsLength: memorizationRatings?.length
    });

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 z-[110] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col border border-amber-500/20">
                {/* Header */}
                <div className="bg-amber-50 dark:bg-slate-800/50 p-4 border-b border-amber-100 dark:border-slate-700 flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-2">
                        <div className="bg-amber-100 dark:bg-amber-900/30 p-2 rounded-lg">
                            <Calculator size={20} className="text-amber-600 dark:text-amber-500" />
                        </div>
                        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">{t.title}</h2>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6 space-y-6 overflow-y-auto">
                    {/* Mode Toggle */}
                    <div className="flex p-1 bg-gray-100 dark:bg-slate-800 rounded-xl relative shrink-0">
                        <button
                            onClick={() => setMode('range')}
                            className={clsx(
                                "flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                                mode === 'range'
                                    ? "bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-sm"
                                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                            )}
                        >
                            <BookOpen size={16} />
                            {t.modeRange}
                        </button>
                        <button
                            onClick={() => setMode('structure')}
                            className={clsx(
                                "flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                                mode === 'structure'
                                    ? "bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-sm"
                                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                            )}
                        >
                            <Layers size={16} />
                            {t.modeStructure}
                        </button>
                    </div>

                    {/* Structure Controls */}
                    {mode === 'structure' && (
                        <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">{t.selectStructure}</label>
                                    <select
                                        value={structureType}
                                        onChange={(e) => {
                                            setStructureType(e.target.value as any);
                                            setStructureIndex(1); // Reset index
                                        }}
                                        className="w-full p-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                                    >
                                        <option value="juz">{t.typeJuz}</option>
                                        <option value="hizb">{t.typeHizb}</option>
                                        <option value="rub">{t.typeRub}</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 opacity-0">#</label>
                                    <select
                                        value={structureIndex}
                                        onChange={(e) => setStructureIndex(Number(e.target.value))}
                                        className="w-full p-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                                    >
                                        {Array.from({ length: maxIndex }, (_, i) => i + 1).map(i => (
                                            <option key={i} value={i}>{i}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Range Inputs (Read-only in structure mode for visual confirmation) */}
                    <div className={clsx(
                        "space-y-4 transition-all duration-300",
                        mode === 'structure' ? "opacity-60 pointer-events-none grayscale" : "opacity-100"
                    )}>
                        {/* Wrapper for range inputs */}
                        <div className="grid grid-cols-[1fr_auto_1fr] gap-2 items-start">
                            {/* Start */}
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-gray-500 dark:text-gray-400">{t.startPoint}</label>
                                <select
                                    value={startSurah}
                                    onChange={(e) => {
                                        const newStart = Number(e.target.value);
                                        setStartSurah(newStart);
                                        setStartAyah(1);
                                        // Auto-correct End Surah if it becomes invalid
                                        if (newStart > endSurah) {
                                            setEndSurah(newStart);
                                            setEndAyah(1); // Reset end ayah to 1 to be safe
                                        }
                                    }}
                                    className="w-full p-2 rounded-lg border bg-white dark:bg-slate-800 text-xs truncate"
                                >
                                    {SURAHS.map(s => (
                                        <option key={s.number} value={s.number}>
                                            {currentLanguage === 'ar' ? `${s.number}. ${s.name}` : `${s.number}. ${s.name}`}
                                        </option>
                                    ))}
                                </select>
                                <select
                                    value={startAyah}
                                    onChange={(e) => setStartAyah(Number(e.target.value))}
                                    className="w-full p-2 rounded-lg border bg-white dark:bg-slate-800 text-xs"
                                >
                                    {SURAHS[startSurah - 1] && Array.from({ length: SURAHS[startSurah - 1].ayahCount }, (_, i) => i + 1).map(i => (
                                        <option key={i} value={i}>{t.ayah} {i}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="pt-8 text-gray-400">
                                <ChevronRight size={16} className={currentLanguage === 'ar' ? 'rotate-180' : ''} />
                            </div>

                            {/* End */}
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-gray-500 dark:text-gray-400">{t.endPoint}</label>
                                <select
                                    value={endSurah}
                                    onChange={(e) => { setEndSurah(Number(e.target.value)); setEndAyah(1); }}
                                    className="w-full p-2 rounded-lg border bg-white dark:bg-slate-800 text-xs truncate"
                                >
                                    {/* Only show Surahs starting from current Start Surah */}
                                    {SURAHS.slice(startSurah - 1).map(s => (
                                        <option key={s.number} value={s.number}>
                                            {currentLanguage === 'ar' ? `${s.number}. ${s.name}` : `${s.number}. ${s.name}`}
                                        </option>
                                    ))}
                                </select>
                                <select
                                    value={endAyah}
                                    onChange={(e) => setEndAyah(Number(e.target.value))}
                                    className="w-full p-2 rounded-lg border bg-white dark:bg-slate-800 text-xs"
                                >
                                    {SURAHS[endSurah - 1] && Array.from({ length: SURAHS[endSurah - 1].ayahCount }, (_, i) => i + 1).map(i => (
                                        <option key={i} value={i}>{t.ayah} {i}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Result Display */}
                    <div className={clsx(
                        "rounded-xl p-4 flex items-center justify-between transition-colors shrink-0",
                        isValid
                            ? "bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/30"
                            : "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/30"
                    )}>
                        <div className="flex items-center gap-3">
                            {isValid ? (
                                <div className="bg-amber-100 dark:bg-amber-900/40 p-2 rounded-full">
                                    <Check size={20} className="text-amber-700 dark:text-amber-500" />
                                </div>
                            ) : (
                                <div className="bg-red-100 dark:bg-red-900/40 p-2 rounded-full">
                                    <AlertCircle size={20} className="text-red-700 dark:text-red-500" />
                                </div>
                            )}
                            <div>
                                <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">
                                    {isValid ? t.result : t.error}
                                </h3>
                                {isValid && SURAHS[startSurah - 1] && SURAHS[endSurah - 1] && (
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                        {t.surah} {SURAHS[startSurah - 1].name} ({startAyah}) - {SURAHS[endSurah - 1].name} ({endAyah})
                                    </p>
                                )}
                            </div>
                        </div>
                        {isValid && (
                            <div className="text-2xl font-black text-amber-600 dark:text-amber-500">
                                {count}
                            </div>
                        )}
                    </div>

                    {/* NEW: Memorization Stats Section */}
                    {isValid && stats && (
                        <div className="pt-2 border-t border-gray-100 dark:border-slate-800">
                            <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
                                <BarChart3 size={16} className="text-amber-500" />
                                {t.statsTitle}
                            </h4>

                            {/* Distribution Bar */}
                            <div className="h-4 w-full bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden flex mb-3 shadow-inner">
                                <div style={{ width: `${(stats.good / stats.total) * 100}%` }} className="h-full bg-green-500 transition-all duration-500" title={t.good} />
                                <div style={{ width: `${(stats.medium / stats.total) * 100}%` }} className="h-full bg-yellow-500 transition-all duration-500" title={t.medium} />
                                <div style={{ width: `${(stats.weak / stats.total) * 100}%` }} className="h-full bg-red-500 transition-all duration-500" title={t.weak} />
                                {/* Unrated is transparent/bg color */}
                            </div>

                            {/* Detailed Counts Grid */}
                            <div className="grid grid-cols-2 gap-2 text-xs">
                                <div className="flex items-center justify-between p-2 rounded-lg bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/20">
                                    <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                                        <span className="w-2 h-2 rounded-full bg-green-500" /> {t.good}
                                    </span>
                                    <span className="font-bold text-green-700 dark:text-green-400">{stats.good}</span>
                                </div>
                                <div className="flex items-center justify-between p-2 rounded-lg bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-100 dark:border-yellow-900/20">
                                    <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                                        <span className="w-2 h-2 rounded-full bg-yellow-500" /> {t.medium}
                                    </span>
                                    <span className="font-bold text-yellow-700 dark:text-yellow-400">{stats.medium}</span>
                                </div>
                                <div className="flex items-center justify-between p-2 rounded-lg bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20">
                                    <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                                        <span className="w-2 h-2 rounded-full bg-red-500" /> {t.weak}
                                    </span>
                                    <span className="font-bold text-red-700 dark:text-red-400">{stats.weak}</span>
                                </div>
                                <div className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700">
                                    <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                                        <span className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600" /> {t.unrated}
                                    </span>
                                    <span className="font-bold text-gray-700 dark:text-gray-400">{stats.unrated}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
