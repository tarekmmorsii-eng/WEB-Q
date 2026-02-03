import React from 'react';
import { Bookmark, X, ThumbsUp as GoodIcon, Circle as MediumIcon, ThumbsDown as WeakIcon } from 'lucide-react';
import clsx from 'clsx';
import { translations, Language } from '../i18n/translations';

interface AyahOptionsModalProps {
    isOpen: boolean;
    onClose: () => void;
    surahNumber: number;
    ayahNumber: number;
    currentRating: 'weak' | 'medium' | 'good' | null;
    onRate: (rating: 'weak' | 'medium' | 'good' | null) => void;
    onBookmark: () => void;
    isBookmarked: boolean;
    language: string;
    hasMutashabihat?: boolean;
    onOpenMutashabihat?: () => void;
}

export default function AyahOptionsModal({
    isOpen,
    onClose,
    surahNumber,
    ayahNumber,
    currentRating,
    onRate,
    onBookmark,
    isBookmarked,
    language,
    hasMutashabihat,
    onOpenMutashabihat
}: AyahOptionsModalProps) {
    if (!isOpen) return null;

    const t = translations[language as Language] || translations['ar'];

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
        // Do NOT close the modal automatically
    };

    const handleBookmark = () => {
        onBookmark();
        // Do NOT close the modal automatically
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
            onClick={handleBackdropClick}
            style={{ fontFamily: "'Almarai', sans-serif" }} // Enforce Almarai font
        >
            <div
                className="w-full max-w-sm rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6 relative animate-in zoom-in-95 duration-200"
                style={{ backgroundColor: '#f8f9fa' }} // Fixed light background as requested
            >
                {/* Header */}
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">
                        {t.ayahOptions.replace('{ayah}', language === 'ar' ? ayahNumber.toLocaleString('ar-EG') : ayahNumber.toString())}
                    </h2>
                    <p className="text-slate-500 text-sm">{t.rateMemorization}</p>
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
                                    : "bg-white border-red-200 text-red-500 hover:bg-red-50 hover:border-red-400"
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
                        <span className={clsx("text-sm font-bold transition-colors", currentRating === 'weak' ? "text-red-500" : "text-gray-500")}>
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
                                    : "bg-white border-yellow-200 text-yellow-500 hover:bg-yellow-50 hover:border-yellow-400"
                            )}
                        >
                            <span className={clsx("text-2xl transition-transform grayscale-0", currentRating === 'medium' && "scale-110")}>👌</span>
                        </button>
                        <span className={clsx("text-sm font-bold transition-colors", currentRating === 'medium' ? "text-yellow-600" : "text-gray-500")}>
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
                                    : "bg-white border-green-200 text-green-500 hover:bg-green-50 hover:border-green-400"
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
                        <span className={clsx("text-sm font-bold transition-colors", currentRating === 'good' ? "text-green-600" : "text-gray-500")}>
                            {t.good}
                        </span>
                    </div>
                </div>

                <div className="w-full h-px bg-gray-200 mb-6" />

                {/* Action Buttons */}
                <div className="flex flex-col gap-3 mb-6">
                    {/* Mutashabihat Button (Always visible) */}
                    <button
                        onClick={() => {
                            onOpenMutashabihat?.();
                            onClose();
                        }}
                        className="w-full bg-amber-600 hover:bg-amber-500 active:bg-amber-700 text-white py-4 rounded-xl flex items-center justify-center gap-3 transition-colors font-bold shadow-md"
                    >
                        <span className="text-xl">📖</span>
                        {language === 'ar'
                            ? (hasMutashabihat ? 'عرض المتشابهات' : 'إضافة متشابهة')
                            : (hasMutashabihat ? 'View Mutashabihat' : 'Add Mutashabihat')
                        }
                    </button>

                    {/* Bookmark Button */}
                    <button
                        onClick={handleBookmark}
                        className="w-full bg-slate-800 hover:bg-slate-700 active:bg-slate-900 text-white py-4 rounded-xl flex items-center justify-center gap-3 transition-colors font-medium shadow-md"
                    >
                        <Bookmark size={20} fill={isBookmarked ? "currentColor" : "none"} className={isBookmarked ? "text-amber-400" : ""} />
                        {isBookmarked ? t.removeBookmark : t.addBookmark}
                    </button>
                </div>

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="w-full text-gray-500 hover:text-slate-800 py-2 transition-colors text-sm font-medium"
                >
                    {t.close}
                </button>
            </div>
        </div>
    );
}
