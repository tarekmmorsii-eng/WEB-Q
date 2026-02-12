import React, { useState } from 'react';
import { X, ThumbsUp as GoodIcon, ThumbsDown as WeakIcon } from 'lucide-react';
import clsx from 'clsx';
import { translations, Language } from '../i18n/translations';
import { SURAHS } from '../constants/surahData';

interface SurahRatingModalProps {
    isOpen: boolean;
    onClose: () => void;
    surahNumber: number;
    currentRating: 'weak' | 'medium' | 'good' | null;
    onRate: (rating: 'weak' | 'medium' | 'good' | null) => void;
    onRateAyah: (surahNumber: number, ayahNumber: number, rating: 'weak' | 'medium' | 'good' | null) => void;
    ayahCount: number;
    language: string;
}

export default function SurahRatingModal({
    isOpen,
    onClose,
    surahNumber,
    currentRating,
    onRate,
    onRateAyah,
    ayahCount,
    language
}: SurahRatingModalProps) {
    if (!isOpen) return null;

    const t = translations[language as Language] || translations['ar'];
    const isArabic = language === 'ar';
    const surahInfo = SURAHS.find(s => s.number === surahNumber);
    const surahName = isArabic ? (surahInfo ? surahInfo.name : 'غير معروفة') : (t.surahNames[surahNumber - 1] || 'Unknown');

    // State for ayah range rating
    const [fromAyah, setFromAyah] = useState<number>(1);
    const [toAyah, setToAyah] = useState<number>(ayahCount);
    const [rangeRating, setRangeRating] = useState<'weak' | 'medium' | 'good' | null>(null);
    const [errorMessage, setErrorMessage] = useState<string>('');

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    const handleRate = (rating: 'weak' | 'medium' | 'good') => {
        // Toggle logic: if clicking the current rating, clear it (null)
        if (currentRating === rating) {
            onRate(null);
        } else {
            onRate(rating);
        }
        // Close modal after rating
        setTimeout(() => onClose(), 300);
    };

    const handleApplyRangeRating = () => {
        // Validation
        if (!rangeRating) {
            setErrorMessage(t.pleaseSelectRating);
            return;
        }
        if (fromAyah < 1 || fromAyah > ayahCount) {
            setErrorMessage(t.ayahNumberBetween.replace('{count}', ayahCount.toString()));
            return;
        }
        if (toAyah < 1 || toAyah > ayahCount) {
            setErrorMessage(t.ayahNumberBetween.replace('{count}', ayahCount.toString()));
            return;
        }
        if (fromAyah > toAyah) {
            setErrorMessage(t.startMustBeLess);
            return;
        }

        // Clear error
        setErrorMessage('');

        // Apply rating to all ayahs in range
        for (let i = fromAyah; i <= toAyah; i++) {
            onRateAyah(surahNumber, i, rangeRating);
        }

        // Reset and show success
        setRangeRating(null);

        // Don't close modal, just reset the range rating selection
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
            onClick={handleBackdropClick}
            style={{ fontFamily: "'Almarai', sans-serif" }}
        >
            <div
                className="w-full max-w-sm rounded-2xl shadow-xl border border-gray-200 dark:border-slate-800 p-6 relative animate-in zoom-in-95 duration-200 bg-[#f8f9fa] dark:bg-slate-900"
            >
                {/* Header */}
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">
                        {t.rateSurah} {surahName}
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">
                        {isArabic ? 'قيّم مستوى حفظك للسورة بالكامل' : 'Rate your memorization of the entire Surah'}
                    </p>
                </div>

                {/* Rating Buttons */}
                <div className="flex justify-between items-center gap-6 mb-8 px-4">
                    {/* Weak */}
                    <div className="flex flex-col items-center gap-2">
                        <button
                            onClick={() => handleRate('weak')}
                            className={clsx(
                                "w-14 h-14 rounded-full flex items-center justify-center transition-all border-2",
                                currentRating === 'weak'
                                    ? "bg-red-600 border-red-400 text-white shadow-[0_0_20px_rgba(220,38,38,0.4)] scale-110"
                                    : "bg-white dark:bg-slate-800 border-red-200 dark:border-red-900/30 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 hover:border-red-400"
                            )}
                        >
                            <WeakIcon
                                className={clsx(
                                    "transition-transform",
                                    currentRating === 'weak' && "scale-110"
                                )}
                                size={24}
                                strokeWidth={2}
                                fill="currentColor"
                            />
                        </button>
                        <span className={clsx("text-sm font-bold transition-colors", currentRating === 'weak' ? "text-red-500" : "text-gray-500 dark:text-slate-400")}>
                            {t.weak}
                        </span>
                    </div>

                    {/* Medium */}
                    <div className="flex flex-col items-center gap-2">
                        <button
                            onClick={() => handleRate('medium')}
                            className={clsx(
                                "w-14 h-14 rounded-full flex items-center justify-center transition-all border-2",
                                currentRating === 'medium'
                                    ? "bg-yellow-500 border-yellow-300 text-white shadow-[0_0_20px_rgba(234,179,8,0.4)] scale-110"
                                    : "bg-white dark:bg-slate-800 border-yellow-200 dark:border-yellow-900/30 text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-950/30 hover:border-yellow-400"
                            )}
                        >
                            <span className={clsx("text-2xl transition-transform grayscale-0", currentRating === 'medium' && "scale-110")}>👌</span>
                        </button>
                        <span className={clsx("text-sm font-bold transition-colors", currentRating === 'medium' ? "text-yellow-600" : "text-gray-500 dark:text-slate-400")}>
                            {t.medium}
                        </span>
                    </div>

                    {/* Good */}
                    <div className="flex flex-col items-center gap-2">
                        <button
                            onClick={() => handleRate('good')}
                            className={clsx(
                                "w-14 h-14 rounded-full flex items-center justify-center transition-all border-2",
                                currentRating === 'good'
                                    ? "bg-green-600 border-green-400 text-white shadow-[0_0_20px_rgba(22,163,74,0.4)] scale-110"
                                    : "bg-white dark:bg-slate-800 border-green-200 dark:border-green-900/30 text-green-500 hover:bg-green-50 dark:hover:bg-green-950/30 hover:border-green-400"
                            )}
                        >
                            <GoodIcon
                                className={clsx(
                                    "transition-transform",
                                    currentRating === 'good' && "scale-110"
                                )}
                                size={24}
                                strokeWidth={2}
                                fill="currentColor"
                            />
                        </button>
                        <span className={clsx("text-sm font-bold transition-colors", currentRating === 'good' ? "text-green-600" : "text-gray-500 dark:text-slate-400")}>
                            {t.good}
                        </span>
                    </div>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-300 dark:border-slate-800 my-6"></div>

                {/* Ayah Range Rating Section */}
                <div className="mb-6">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-3 text-center">
                        {t.rateRange}
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 text-xs mb-4 text-center">
                        {isArabic ? 'قيّم مجموعة من الآيات بنفس التقييم' : 'Rate multiple ayahs with the same rating'}
                    </p>

                    {/* Input Fields */}
                    <div className="flex gap-3 mb-4 justify-center items-center">
                        <div className="flex flex-col items-center">
                            <label className="text-xs text-slate-600 dark:text-slate-400 mb-1">{t.fromAyah}</label>
                            <input
                                type="number"
                                min="1"
                                max={ayahCount}
                                value={fromAyah}
                                onChange={(e) => setFromAyah(parseInt(e.target.value) || 1)}
                                onFocus={(e) => e.target.select()}
                                className="w-20 px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                            />
                        </div>
                        <span className="text-slate-400 mt-5">←</span>
                        <div className="flex flex-col items-center">
                            <label className="text-xs text-slate-600 dark:text-slate-400 mb-1">{t.toAyah}</label>
                            <input
                                type="number"
                                min="1"
                                max={ayahCount}
                                value={toAyah}
                                onChange={(e) => setToAyah(parseInt(e.target.value) || ayahCount)}
                                onFocus={(e) => e.target.select()}
                                className="w-20 px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                            />
                        </div>
                    </div>

                    {/* Range Rating Buttons */}
                    <div className="flex justify-center items-center gap-4 mb-4">
                        <button
                            onClick={() => setRangeRating('weak')}
                            className={clsx(
                                "w-12 h-12 rounded-full flex items-center justify-center transition-all border-2",
                                rangeRating === 'weak'
                                    ? "bg-red-600 border-red-400 text-white scale-110"
                                    : "bg-white dark:bg-slate-800 border-red-200 dark:border-red-900/30 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
                            )}
                        >
                            <WeakIcon size={20} strokeWidth={2} fill="currentColor" />
                        </button>
                        <button
                            onClick={() => setRangeRating('medium')}
                            className={clsx(
                                "w-12 h-12 rounded-full flex items-center justify-center transition-all border-2",
                                rangeRating === 'medium'
                                    ? "bg-yellow-500 border-yellow-300 text-white scale-110"
                                    : "bg-white dark:bg-slate-800 border-yellow-200 dark:border-yellow-900/30 text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-950/30"
                            )}
                        >
                            <span className="text-xl">👌</span>
                        </button>
                        <button
                            onClick={() => setRangeRating('good')}
                            className={clsx(
                                "w-12 h-12 rounded-full flex items-center justify-center transition-all border-2",
                                rangeRating === 'good'
                                    ? "bg-green-600 border-green-400 text-white scale-110"
                                    : "bg-white dark:bg-slate-800 border-green-200 dark:border-green-900/30 text-green-500 hover:bg-green-50 dark:hover:bg-green-950/30"
                            )}
                        >
                            <GoodIcon size={20} strokeWidth={2} fill="currentColor" />
                        </button>
                    </div>

                    {/* Apply Button */}
                    <button
                        onClick={handleApplyRangeRating}
                        disabled={!rangeRating}
                        className={clsx(
                            "w-full py-2 rounded-lg font-medium transition-all",
                            rangeRating
                                ? "bg-amber-600 text-white hover:bg-amber-700"
                                : "bg-gray-200 dark:bg-slate-800 text-gray-400 dark:text-slate-600 cursor-not-allowed"
                        )}
                    >
                        {t.applyRating}
                    </button>

                    {/* Error Message */}
                    {errorMessage && (
                        <p className="text-red-500 text-xs mt-2 text-center">{errorMessage}</p>
                    )}
                </div>

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="w-full text-gray-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 py-2 transition-colors text-sm font-medium"
                >
                    {t.close}
                </button>
            </div>
        </div>
    );
}
