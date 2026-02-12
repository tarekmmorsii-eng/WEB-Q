import React, { useMemo, useState } from 'react';
import { X, Trash2, AlertTriangle } from 'lucide-react';
import clsx from 'clsx';
import { MemorizationRating } from '../types';
import { SURAHS } from '../constants/surahData';
import { Translations } from '../i18n/translations';

interface MemorizationStatsProps {
    isOpen: boolean;
    onClose: () => void;
    ratings: MemorizationRating[];
    onNavigateToSurah: (surahNumber: number) => void;
    onRateSurah: (surahNumber: number) => void;
    onClearAll: () => void;
    t: Translations;
}

export default function MemorizationStats({ isOpen, onClose, ratings, onNavigateToSurah, onRateSurah, onClearAll, t }: MemorizationStatsProps) {
    const [showConfirm, setShowConfirm] = useState(false);

    // Calculate statistics for each Surah
    const surahStats = useMemo(() => {
        return SURAHS.map(surah => {
            const surahRatings = ratings.filter(r => {
                const [surahNum] = r.ayahId.split('-').map(Number);
                return surahNum === surah.number;
            });

            const weak = surahRatings.filter(r => r.rating === 'weak').length;
            const medium = surahRatings.filter(r => r.rating === 'medium').length;
            const good = surahRatings.filter(r => r.rating === 'good').length;
            const unrated = surah.ayahCount - (weak + medium + good);

            return {
                ...surah,
                weak,
                medium,
                good,
                unrated,
                totalRated: weak + medium + good
            };
        });
    }, [ratings]);

    if (!isOpen) return null;

    const handleConfirmClear = () => {
        onClearAll();
        setShowConfirm(false);
        onClose();
    };

    // Helper to detect Arabic
    const isArabic = t.good === 'جيد';

    const toLocale = (n: number) => {
        return isArabic ? n.toLocaleString('ar-EG') : n.toString();
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200" style={{ fontFamily: "'Almarai', sans-serif" }}>
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col relative">

                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-900/50">
                    <div className="flex items-center gap-3">
                        <img
                            src="/final_logo.png"
                            alt="Logo"
                            className="w-10 h-10 rounded-full border border-amber-500/30"
                        />
                        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">{t.memorizationStatsTitle}</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-200 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-500 dark:text-slate-400"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 bg-gray-50/50 dark:bg-slate-950/50">

                    {/* Clear All Button - Top of List */}
                    {ratings.length > 0 && (
                        <div className="mb-6">
                            <button
                                onClick={() => setShowConfirm(true)}
                                className="w-full bg-red-50 dark:bg-red-900/10 hover:bg-red-100 dark:hover:bg-red-900/20 border border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 py-3 rounded-xl flex items-center justify-center gap-2 transition-all font-bold"
                            >
                                <Trash2 size={20} />
                                {t.clearAllRatings}
                            </button>
                        </div>
                    )}

                    <div className="space-y-3">
                        {surahStats.map(surah => (
                            <div
                                key={surah.number}
                                className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-gray-200 dark:border-slate-800 hover:shadow-md transition-all duration-200"
                            >
                                <div className="flex items-center justify-between gap-4 mb-3">
                                    {/* Surah Name - Clickable */}
                                    <button
                                        onClick={() => {
                                            onNavigateToSurah(surah.number);
                                            onClose();
                                        }}
                                        className="text-right font-bold text-lg text-slate-800 dark:text-slate-100 hover:text-amber-600 dark:hover:text-amber-500 transition-colors"
                                    >
                                        <span className="text-amber-500 text-sm ml-2 font-light">{toLocale(surah.number)}</span>
                                        {isArabic ? surah.name : t.surahNames[surah.number - 1]}
                                        <span className="text-xs text-gray-400 mr-2 font-normal">({toLocale(surah.ayahCount)})</span>
                                    </button>

                                    {/* Statistics Badges */}
                                    <div className="flex items-center gap-3">
                                        {/* Simple Stats Pill - Updated Layout - Now Clickable */}
                                        <button
                                            onClick={() => onRateSurah(surah.number)}
                                            className="flex items-center gap-4 text-xs font-bold bg-gray-50 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-gray-100 dark:border-slate-700 hover:bg-amber-50 dark:hover:bg-amber-900/20 hover:border-amber-200 transition-all cursor-pointer"
                                            title={t.rateSurah}
                                        >
                                            <span className="text-green-600">{toLocale(surah.good)}</span>
                                            <span className="text-gray-300">|</span>
                                            <span className="text-yellow-600">{toLocale(surah.medium)}</span>
                                            <span className="text-gray-300">|</span>
                                            <span className="text-red-600">{toLocale(surah.weak)}</span>
                                            <span className="text-gray-300">|</span>
                                            <span className="text-gray-400 dark:text-gray-500">{toLocale(surah.unrated)}</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Progress Bar - Also Clickable for Rating */}
                                <div
                                    onClick={() => onRateSurah(surah.number)}
                                    className="h-2.5 w-full bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden flex cursor-pointer hover:ring-2 hover:ring-amber-500/30 transition-all"
                                    title={t.rateSurah}
                                >
                                    {/* Weak (Red) */}
                                    <div style={{ width: `${(surah.weak / surah.ayahCount) * 100}%` }} className="h-full bg-red-500" />
                                    {/* Medium (Yellow) */}
                                    <div style={{ width: `${(surah.medium / surah.ayahCount) * 100}%` }} className="h-full bg-yellow-500" />
                                    {/* Good (Green) */}
                                    <div style={{ width: `${(surah.good / surah.ayahCount) * 100}%` }} className="h-full bg-green-500" />
                                    {/* Unrated (Transparent/Background) - No bar needed as background implies unrated, or we could add a gray segment if we wanted explicit visualization, but standard progress bars usually fill up. The empty space is unrated. */}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Legend */}
                <div className="p-4 border-t border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-lg z-10">
                    <div className="flex items-center justify-center gap-6 flex-wrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-green-500"></span>
                            <span className="text-slate-600 dark:text-slate-400">{t.good}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
                            <span className="text-slate-600 dark:text-slate-400">{t.medium}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-red-500"></span>
                            <span className="text-slate-600 dark:text-slate-400">{t.weak}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-gray-200 dark:bg-slate-700"></span>
                            <span className="text-slate-600 dark:text-slate-400">{t.notRated}</span>
                        </div>
                    </div>
                </div>

                {/* Confirmation Modal Overlay */}
                {showConfirm && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-in fade-in duration-200">
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-2xl max-w-sm w-full border border-gray-200 dark:border-slate-700 animate-in zoom-in-95">
                            <div className="flex flex-col items-center text-center">
                                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
                                    <AlertTriangle size={32} className="text-red-500" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">
                                    {t.confirmClearTitle}
                                </h3>
                                <p className="text-slate-500 dark:text-slate-400 mb-6">
                                    {t.confirmClearMessage}
                                </p>
                                <div className="flex gap-3 w-full">
                                    <button
                                        onClick={handleConfirmClear}
                                        className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-bold transition-colors"
                                    >
                                        {t.confirmYes}
                                    </button>
                                    <button
                                        onClick={() => setShowConfirm(false)}
                                        className="flex-1 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 py-3 rounded-xl font-bold transition-colors"
                                    >
                                        {t.cancel}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
