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
    onPlay?: () => void;
    tafsir?: string;
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
    onOpenMutashabihat,
    onPlay,
    tafsir
}: AyahOptionsModalProps) {
    const [showTafsir, setShowTafsir] = React.useState(false);
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
                className="w-full max-w-sm rounded-2xl shadow-xl border border-[var(--border-primary)] p-6 relative animate-in zoom-in-95 duration-200 bg-[var(--bg-card)] text-[var(--text-primary)]"
            >
                {/* Header */}
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
                        {t.ayahOptions.replace('{ayah}', (() => {
                            if (language === 'ar') return ayahNumber.toLocaleString('ar-EG');
                            if (language === 'ur') return ayahNumber.toLocaleString('ur-PK');
                            if (language === 'fa') return ayahNumber.toLocaleString('fa-IR');
                            return ayahNumber.toString();
                        })())}
                    </h2>
                    <p className="text-[var(--text-primary)] opacity-50 text-sm">{t.rateMemorization}</p>
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
                                    : "bg-[var(--bg-secondary)] border-red-500/20 text-red-500 hover:bg-red-500/10 hover:border-red-500/40"
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
                        <span className={clsx("text-sm font-bold transition-colors", currentRating === 'weak' ? "text-red-500" : "text-[var(--text-primary)] opacity-50")}>
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
                                    : "bg-[var(--bg-secondary)] border-yellow-500/20 text-yellow-500 hover:bg-yellow-500/10 hover:border-yellow-500/40"
                            )}
                        >
                            <span className={clsx("text-2xl transition-transform grayscale-0", currentRating === 'medium' && "scale-110")}>👌</span>
                        </button>
                        <span className={clsx("text-sm font-bold transition-colors", currentRating === 'medium' ? "text-yellow-600" : "text-[var(--text-primary)] opacity-50")}>
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
                                    : "bg-[var(--bg-secondary)] border-green-500/20 text-green-500 hover:bg-green-500/10 hover:border-green-500/40"
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
                        <span className={clsx("text-sm font-bold transition-colors", currentRating === 'good' ? "text-green-600" : "text-[var(--text-primary)] opacity-50")}>
                            {t.good}
                        </span>
                    </div>
                </div>

                <div className="w-full h-px bg-[var(--border-primary)] mb-6 opacity-30" />

                {/* Action Buttons */}
                <div className="flex flex-col gap-3 mb-6">
                    {/* Play Button */}
                    <button
                        onClick={() => {
                            onPlay?.();
                            onClose();
                        }}
                        className="w-full bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white py-4 rounded-xl flex items-center justify-center gap-3 transition-colors font-bold shadow-md"
                    >
                        <span className="text-xl">▶️</span>
                        {t.playAyah}
                    </button>

                    {/* Mutashabihat Button (Always visible) */}
                    <button
                        onClick={() => {
                            onOpenMutashabihat?.();
                            onClose();
                        }}
                        className="w-full bg-amber-600 hover:bg-amber-500 active:bg-amber-700 text-white py-4 rounded-xl flex items-center justify-center gap-3 transition-colors font-bold shadow-md"
                    >
                        <span className="text-xl">📖</span>
                        {hasMutashabihat ? t.viewMutashabihat : t.addMutashabihat}
                    </button>

                    {tafsir && (
                        <button
                            onClick={() => setShowTafsir(!showTafsir)}
                            className="w-full bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white py-4 rounded-xl flex items-center justify-center gap-3 transition-colors font-bold shadow-md"
                        >
                            <span className="text-xl">📜</span>
                            {t.tafsirAyah}
                        </button>
                    )}

                    {/* Bookmark Button */}
                    <button
                        onClick={handleBookmark}
                        className="w-full bg-[var(--bg-secondary)] hover:bg-[var(--bg-primary)] opacity-90 hover:opacity-100 text-[var(--text-primary)] py-4 rounded-xl flex items-center justify-center gap-3 transition-colors font-medium shadow-md border border-[var(--border-primary)]"
                    >
                        <Bookmark size={20} fill={isBookmarked ? "currentColor" : "none"} className={isBookmarked ? "text-amber-400" : ""} />
                        {isBookmarked ? t.removeBookmark : t.addBookmark}
                    </button>
                </div>

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="w-full text-[var(--text-primary)] opacity-50 hover:opacity-100 py-2 transition-colors text-sm font-medium"
                >
                    {t.close}
                </button>

                {/* Tafsir Overlay/Panel */}
                {showTafsir && (
                    <div className="absolute inset-0 bg-[var(--bg-card)] rounded-2xl z-20 flex flex-col p-6 animate-in slide-in-from-bottom-5 duration-300">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-[var(--text-primary)]">{t.tafsirAyah}</h3>
                            <button
                                onClick={() => {
                                    setShowTafsir(false);
                                    onClose();
                                }}
                                className="p-1 rounded-full hover:bg-[var(--bg-secondary)] transition-colors"
                            >
                                <X size={20} className="text-[var(--text-primary)] opacity-40" />
                            </button>
                        </div>
                        <div
                            className={clsx("flex-1 overflow-y-auto text-[var(--text-primary)] opacity-80 leading-relaxed text-xl pb-4 px-1", t.dir === 'rtl' ? "text-right" : "text-left")}
                            dir={t.dir}
                            style={{ fontFamily: "'Amiri', serif" }}
                        >
                            {tafsir}
                        </div>
                        <button
                            onClick={() => {
                                setShowTafsir(false);
                                onClose();
                            }}
                            className="w-full bg-[var(--bg-secondary)] text-[var(--text-primary)] py-3 rounded-xl font-bold transition-colors mt-2 border border-[var(--border-primary)]"
                        >
                            {t.close}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
