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
                className="w-full max-w-[280px] rounded-xl shadow-xl border border-[var(--border-primary)] p-3 relative animate-in zoom-in-95 duration-200 bg-[var(--bg-card)]"
            >
                {/* Header */}
                <div className="text-center mb-3">
                    <h2 className="text-base font-bold text-[var(--text-primary)] mb-1">
                        {t.rateSurah} {surahName}
                    </h2>
                    <p className="text-[var(--text-primary)] opacity-60 text-[10px]">
                        {t.rateEntireSurah}
                    </p>
                </div>

                {/* Rating Buttons */}
                <div className="flex justify-between items-center gap-2 mb-3 px-1">
                    {/* Weak */}
                    <div className="flex flex-col items-center gap-1">
                        <button
                            onClick={() => handleRate('weak')}
                            className={clsx(
                                "w-10 h-10 rounded-full flex items-center justify-center transition-all border-2",
                                currentRating === 'weak'
                                    ? "bg-red-600 border-red-400 text-white shadow-[0_0_12px_rgba(220,38,38,0.4)] scale-110"
                                    : "bg-[var(--bg-secondary)] border-red-200 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 hover:border-red-400"
                            )}
                        >
                            <WeakIcon
                                className={clsx(
                                    "transition-transform",
                                    currentRating === 'weak' && "scale-110"
                                )}
                                size={16}
                                strokeWidth={2}
                                fill="currentColor"
                            />
                        </button>
                        <span className={clsx("text-[10px] font-bold transition-colors", currentRating === 'weak' ? "text-red-500" : "text-[var(--text-primary)] opacity-50")}>
                            {t.weak}
                        </span>
                    </div>

                    {/* Medium */}
                    <div className="flex flex-col items-center gap-1">
                        <button
                            onClick={() => handleRate('medium')}
                            className={clsx(
                                "w-10 h-10 rounded-full flex items-center justify-center transition-all border-2",
                                currentRating === 'medium'
                                    ? "bg-yellow-500 border-yellow-300 text-white shadow-[0_0_12px_rgba(234,179,8,0.4)] scale-110"
                                    : "bg-[var(--bg-secondary)] border-yellow-200 text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-950/30 hover:border-yellow-400"
                            )}
                        >
                            <span className={clsx("text-base transition-transform grayscale-0", currentRating === 'medium' && "scale-110")}>👌</span>
                        </button>
                        <span className={clsx("text-[10px] font-bold transition-colors", currentRating === 'medium' ? "text-yellow-600" : "text-[var(--text-primary)] opacity-50")}>
                            {t.medium}
                        </span>
                    </div>

                    {/* Good */}
                    <div className="flex flex-col items-center gap-1">
                        <button
                            onClick={() => handleRate('good')}
                            className={clsx(
                                "w-10 h-10 rounded-full flex items-center justify-center transition-all border-2",
                                currentRating === 'good'
                                    ? "bg-green-600 border-green-400 text-white shadow-[0_0_12px_rgba(22,163,74,0.4)] scale-110"
                                    : "bg-[var(--bg-secondary)] border-green-200 text-green-500 hover:bg-green-50 dark:hover:bg-green-950/30 hover:border-green-400"
                            )}
                        >
                            <GoodIcon
                                className={clsx(
                                    "transition-transform",
                                    currentRating === 'good' && "scale-110"
                                )}
                                size={16}
                                strokeWidth={2}
                                fill="currentColor"
                            />
                        </button>
                        <span className={clsx("text-[10px] font-bold transition-colors", currentRating === 'good' ? "text-green-600" : "text-[var(--text-primary)] opacity-50")}>
                            {t.good}
                        </span>
                    </div>
                </div>

                {/* Divider */}
                <div className="border-t border-[var(--border-primary)] my-3"></div>

                {/* Ayah Range Rating Section */}
                <div className="mb-2">
                    <h3 className="text-xs font-bold text-[var(--text-primary)] mb-1.5 text-center">
                        {t.rateRange}
                    </h3>
                    <p className="text-[var(--text-primary)] opacity-50 text-[9px] mb-2 text-center">
                        {t.rateMultipleAyahs}
                    </p>

                    {/* Input Fields */}
                    <div className="flex gap-2 mb-2 justify-center items-center">
                        <div className="flex flex-col items-center">
                            <label className="text-[9px] text-[var(--text-primary)] opacity-60 mb-0.5">{t.fromAyah}</label>
                            <input
                                type="number"
                                min="1"
                                max={ayahCount}
                                value={fromAyah}
                                onChange={(e) => setFromAyah(parseInt(e.target.value) || 1)}
                                onFocus={(e) => e.target.select()}
                                className="w-14 px-1 py-1 border border-[var(--border-primary)] rounded-md text-center text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 bg-[var(--bg-card)] text-[var(--text-primary)]"
                            />
                        </div>
                        <span className="text-slate-400 mt-3 text-xs">←</span>
                        <div className="flex flex-col items-center">
                            <label className="text-[9px] text-[var(--text-primary)] opacity-60 mb-0.5">{t.toAyah}</label>
                            <input
                                type="number"
                                min="1"
                                max={ayahCount}
                                value={toAyah}
                                onChange={(e) => setToAyah(parseInt(e.target.value) || ayahCount)}
                                onFocus={(e) => e.target.select()}
                                className="w-14 px-1 py-1 border border-[var(--border-primary)] rounded-md text-center text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 bg-[var(--bg-card)] text-[var(--text-primary)]"
                            />
                        </div>
                    </div>

                    {/* Range Rating Buttons */}
                    <div className="flex justify-center items-center gap-2 mb-2">
                        <button
                            onClick={() => setRangeRating('weak')}
                            className={clsx(
                                "w-8 h-8 rounded-full flex items-center justify-center transition-all border-2",
                                rangeRating === 'weak'
                                    ? "bg-red-600 border-red-400 text-white scale-110"
                                    : "bg-[var(--bg-secondary)] border-red-200 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
                            )}
                        >
                            <WeakIcon size={12} strokeWidth={2} fill="currentColor" />
                        </button>
                        <button
                            onClick={() => setRangeRating('medium')}
                            className={clsx(
                                "w-8 h-8 rounded-full flex items-center justify-center transition-all border-2",
                                rangeRating === 'medium'
                                    ? "bg-yellow-500 border-yellow-300 text-white scale-110"
                                    : "bg-[var(--bg-secondary)] border-yellow-200 text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-950/30"
                            )}
                        >
                            <span className="text-xs">👌</span>
                        </button>
                        <button
                            onClick={() => setRangeRating('good')}
                            className={clsx(
                                "w-8 h-8 rounded-full flex items-center justify-center transition-all border-2",
                                rangeRating === 'good'
                                    ? "bg-green-600 border-green-400 text-white scale-110"
                                    : "bg-[var(--bg-secondary)] border-green-200 text-green-500 hover:bg-green-50 dark:hover:bg-green-950/30"
                            )}
                        >
                            <GoodIcon size={12} strokeWidth={2} fill="currentColor" />
                        </button>
                    </div>

                    {/* Apply Button */}
                    <button
                        onClick={handleApplyRangeRating}
                        disabled={!rangeRating}
                        className={clsx(
                            "w-full py-1.5 rounded-md font-medium text-[10px] transition-all",
                            rangeRating
                                ? "bg-amber-600 text-white hover:bg-amber-700"
                                : "bg-[var(--bg-secondary)] text-[var(--text-primary)] opacity-40 cursor-not-allowed"
                        )}
                    >
                        {t.applyRating}
                    </button>

                    {/* Error Message */}
                    {errorMessage && (
                        <p className="text-red-500 text-[9px] mt-1 text-center">{errorMessage}</p>
                    )}
                </div>

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="w-full text-[var(--text-primary)] opacity-60 hover:opacity-100 py-1 transition-colors text-[10px] font-medium"
                >
                    {t.close}
                </button>
            </div>
        </div>
    );
}
