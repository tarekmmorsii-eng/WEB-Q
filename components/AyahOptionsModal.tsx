import React, { useState, useEffect } from 'react';
import { Bookmark, X, ThumbsUp as GoodIcon, Circle as MediumIcon, ThumbsDown as WeakIcon, Settings as SettingsIcon } from 'lucide-react';
import clsx from 'clsx';
import { translations, Language } from '../i18n/translations';
import { getTranslation } from '../services/translationStorageService';
import { TRANSLATION_EDITIONS } from '../utils/translationMapper';

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
    onOpenTranslationManager?: () => void;
}

/**
 * دالة مساعدة لاستخراج نص آية من بيانات الترجمة المحفوظة
 * تدعم هيكلين مختلفين:
 * 1. Al Quran Cloud: { surahs: [{ number, ayahs: [{ numberInSurah, text }] }] }
 * 2. FawazAhmed: { surahs: [{ [ayahKey]: text }] }
 */
function extractAyahText(data: any, surahNumber: number, ayahNumber: number): string | null {
    if (!data || !data.surahs) return null;

    try {
        if (Array.isArray(data.surahs) && data.surahs.length > 0) {
            const surah = data.surahs.find(
                (s: any) => s.number === surahNumber || (s.surah && s.surah.number === surahNumber)
            );

            if (surah) {
                // Al Quran Cloud format
                if (surah.ayahs && Array.isArray(surah.ayahs)) {
                    const ayah = surah.ayahs.find(
                        (a: any) => a.numberInSurah === ayahNumber
                    );
                    if (ayah && ayah.text) return ayah.text;
                }

                // FawazAhmed format: surah object with numbered keys
                const verseKey = String(ayahNumber);
                if (surah[verseKey] !== undefined) {
                    const verse = surah[verseKey];
                    if (typeof verse === 'string') return verse;
                    if (verse && typeof verse === 'object' && verse.text) return verse.text;
                }

                // Nested under surah number key
                const surahKey = String(surahNumber);
                if (surah[surahKey]) {
                    const nestedSurah = surah[surahKey];
                    const vKey = String(ayahNumber);
                    if (nestedSurah[vKey] !== undefined) {
                        const verse = nestedSurah[vKey];
                        if (typeof verse === 'string') return verse;
                        if (verse && typeof verse === 'object' && verse.text) return verse.text;
                    }
                }
            }

            // FawazAhmed: array index = surahNumber - 1
            const surahIndex = surahNumber - 1;
            const surahData = data.surahs[surahIndex];
            if (surahData && typeof surahData === 'object') {
                const verseKey = String(ayahNumber);
                if (surahData[verseKey] !== undefined) {
                    const verse = surahData[verseKey];
                    if (typeof verse === 'string') return verse;
                    if (verse && typeof verse === 'object' && verse.text) return verse.text;
                }
                const surahKey = String(surahNumber);
                if (surahData[surahKey] && surahData[surahKey][verseKey] !== undefined) {
                    const verse = surahData[surahKey][verseKey];
                    if (typeof verse === 'string') return verse;
                    if (verse && typeof verse === 'object' && verse.text) return verse.text;
                }
            }
        }
    } catch (err) {
        console.warn('Error extracting ayah text from translation data:', err);
    }

    return null;
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
    tafsir,
    onOpenTranslationManager
}: AyahOptionsModalProps) {
    const [showTafsir, setShowTafsir] = useState(false);
    const [translatedText, setTranslatedText] = useState<string | null>(null);

    const t = translations[language as Language] || translations['ar'];

    // جلب الترجمة من IndexedDB عند فتح المودال
    useEffect(() => {
        if (!isOpen) return;

        if (language === 'ar') {
            setTranslatedText(tafsir || null);
            return;
        }

        let cancelled = false;

        const fetchTranslation = async () => {
            try {
                const stored = await getTranslation(language);
                if (cancelled) return;

                if (stored && stored.data) {
                    const text = extractAyahText(stored.data, surahNumber, ayahNumber);
                    if (text) {
                        setTranslatedText(text);
                    } else {
                        setTranslatedText('__NOT_FOUND__');
                    }
                } else {
                    setTranslatedText('__NO_TRANSLATION__');
                }
            } catch (err) {
                console.warn('Error fetching translation:', err);
                if (!cancelled) {
                    setTranslatedText('__NO_TRANSLATION__');
                }
            }
        };

        fetchTranslation();

        return () => { cancelled = true; };
    }, [isOpen, surahNumber, ayahNumber, language, tafsir]);

    // إعادة تعيين حالة العرض عند إغلاق المودال
    useEffect(() => {
        if (!isOpen) {
            setShowTafsir(false);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    const handleRate = (rating: 'weak' | 'medium' | 'good') => {
        if (currentRating === rating) {
            onRate(null);
        } else {
            onRate(rating);
        }
    };

    const handleBookmark = () => {
        onBookmark();
    };

    const hasTafsirContent = language === 'ar' ? !!tafsir : !!translatedText;
    const tafsirButtonLabel = language === 'ar' ? t.tafsirAyah : ((t as any).translationAyah || t.tafsirAyah);
    const tafsirPanelTitle = language === 'ar' ? t.tafsirAyah : ((t as any).translationAyah || t.tafsirAyah);

    const editionInfo = TRANSLATION_EDITIONS[language];
    const translationDir = editionInfo?.direction || 'ltr';

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
            onClick={handleBackdropClick}
            style={{ fontFamily: "'Almarai', sans-serif" }}
        >
            <div className="w-full max-w-[280px] rounded-xl shadow-xl border border-[var(--border-primary)] p-3 relative animate-in zoom-in-95 duration-200 bg-[var(--bg-card)] text-[var(--text-primary)]">
                {/* Header */}
                <div className="text-center mb-3">
                    <h2 className="text-base font-bold text-[var(--text-primary)] mb-1">
                        {t.ayahOptions.replace('{ayah}', (() => {
                            if (language === 'ar') return ayahNumber.toLocaleString('ar-EG');
                            if (language === 'ur') return ayahNumber.toLocaleString('ur-PK');
                            if (language === 'fa') return ayahNumber.toLocaleString('fa-IR');
                            return ayahNumber.toString();
                        })())}
                    </h2>
                    <p className="text-[var(--text-primary)] opacity-50 text-[10px]">{t.rateMemorization}</p>
                </div>

                {/* Rating Buttons */}
                <div className="flex justify-between items-center gap-2 mb-3 px-1">
                    <div className="flex flex-col items-center gap-1">
                        <button
                            onClick={() => handleRate('weak')}
                            className={clsx(
                                "w-10 h-10 rounded-full flex items-center justify-center transition-all border-2",
                                currentRating === 'weak'
                                    ? "bg-red-600 border-red-400 text-white shadow-[0_0_12px_rgba(220,38,38,0.4)] scale-110"
                                    : "bg-[var(--bg-secondary)] border-red-500/20 text-red-500 hover:bg-red-500/10 hover:border-red-500/40"
                            )}
                        >
                            <WeakIcon className={clsx("transition-transform", currentRating === 'weak' && "scale-110")} size={16} strokeWidth={2} fill="currentColor" />
                        </button>
                        <span className={clsx("text-[10px] font-bold transition-colors", currentRating === 'weak' ? "text-red-500" : "text-[var(--text-primary)] opacity-50")}>{t.weak}</span>
                    </div>

                    <div className="flex flex-col items-center gap-1">
                        <button
                            onClick={() => handleRate('medium')}
                            className={clsx(
                                "w-10 h-10 rounded-full flex items-center justify-center transition-all border-2",
                                currentRating === 'medium'
                                    ? "bg-yellow-500 border-yellow-300 text-white shadow-[0_0_12px_rgba(234,179,8,0.4)] scale-110"
                                    : "bg-[var(--bg-secondary)] border-yellow-500/20 text-yellow-500 hover:bg-yellow-500/10 hover:border-yellow-500/40"
                            )}
                        >
                            <span className={clsx("text-base transition-transform grayscale-0", currentRating === 'medium' && "scale-110")}>👌</span>
                        </button>
                        <span className={clsx("text-[10px] font-bold transition-colors", currentRating === 'medium' ? "text-yellow-600" : "text-[var(--text-primary)] opacity-50")}>{t.medium}</span>
                    </div>

                    <div className="flex flex-col items-center gap-1">
                        <button
                            onClick={() => handleRate('good')}
                            className={clsx(
                                "w-10 h-10 rounded-full flex items-center justify-center transition-all border-2",
                                currentRating === 'good'
                                    ? "bg-green-600 border-green-400 text-white shadow-[0_0_12px_rgba(22,163,74,0.4)] scale-110"
                                    : "bg-[var(--bg-secondary)] border-green-500/20 text-green-500 hover:bg-green-500/10 hover:border-green-500/40"
                            )}
                        >
                            <GoodIcon className={clsx("transition-transform", currentRating === 'good' && "scale-110")} size={16} strokeWidth={2} fill="currentColor" />
                        </button>
                        <span className={clsx("text-[10px] font-bold transition-colors", currentRating === 'good' ? "text-green-600" : "text-[var(--text-primary)] opacity-50")}>{t.good}</span>
                    </div>
                </div>

                <div className="w-full h-px bg-[var(--border-primary)] mb-3 opacity-30" />

                {/* Action Buttons */}
                <div className="flex flex-col gap-1.5 mb-2">
                    <button
                        onClick={() => { onPlay?.(); onClose(); }}
                        className="w-full bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white py-2 rounded-lg flex items-center justify-center gap-2 transition-colors font-bold text-xs shadow-md"
                    >
                        <span className="text-sm">▶️</span>{t.playAyah}
                    </button>

                    <button
                        onClick={() => { onOpenMutashabihat?.(); onClose(); }}
                        className="w-full bg-amber-600 hover:bg-amber-500 active:bg-amber-700 text-white py-2 rounded-lg flex items-center justify-center gap-2 transition-colors font-bold text-xs shadow-md"
                    >
                        <span className="text-sm">📖</span>
                        {hasMutashabihat ? t.viewMutashabihat : t.addMutashabihat}
                    </button>

                    {hasTafsirContent && (
                        <button
                            onClick={() => setShowTafsir(!showTafsir)}
                            className="w-full bg-purple-600 hover:bg-purple-500 active:bg-purple-700 text-white py-2 rounded-lg flex items-center justify-center gap-2 transition-colors font-bold text-xs shadow-md"
                        >
                            <span className="text-sm">📜</span>
                            {tafsirButtonLabel} <span className="text-red-300">{(() => {
                                if (language === 'ar') return ayahNumber.toLocaleString('ar-EG');
                                if (language === 'ur') return ayahNumber.toLocaleString('ur-PK');
                                if (language === 'fa') return ayahNumber.toLocaleString('fa-IR');
                                return ayahNumber.toString();
                            })()}</span>
                        </button>
                    )}

                    <button
                        onClick={handleBookmark}
                        className="w-full bg-[var(--bg-secondary)] hover:bg-[var(--bg-primary)] opacity-90 hover:opacity-100 text-[var(--text-primary)] py-2 rounded-lg flex items-center justify-center gap-2 transition-colors font-medium text-xs shadow-md border border-[var(--border-primary)]"
                    >
                        <Bookmark size={14} fill={isBookmarked ? "currentColor" : "none"} className={isBookmarked ? "text-amber-400" : ""} />
                        {isBookmarked ? t.removeBookmark : t.addBookmark}
                    </button>
                </div>

                <button onClick={onClose} className="w-full text-[var(--text-primary)] opacity-50 hover:opacity-100 py-1 transition-colors text-[10px] font-medium">
                    {t.close}
                </button>

                {/* Tafsir / Translation Overlay Panel */}
                {showTafsir && (
                    <div className="absolute inset-0 bg-[var(--bg-card)] rounded-xl z-20 flex flex-col p-3 animate-in slide-in-from-bottom-5 duration-300">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="text-sm font-bold text-[var(--text-primary)]">{tafsirPanelTitle} <span className="text-red-500">{(() => {
                                if (language === 'ar') return ayahNumber.toLocaleString('ar-EG');
                                if (language === 'ur') return ayahNumber.toLocaleString('ur-PK');
                                if (language === 'fa') return ayahNumber.toLocaleString('fa-IR');
                                return ayahNumber.toString();
                            })()}</span></h3>
                            <button onClick={() => { setShowTafsir(false); onClose(); }} className="p-1 rounded-full hover:bg-[var(--bg-secondary)] transition-colors">
                                <X size={14} className="text-[var(--text-primary)] opacity-40" />
                            </button>
                        </div>
                        <div
                            className={clsx(
                                "flex-1 overflow-y-auto text-[var(--text-primary)] opacity-80 leading-relaxed text-sm pb-2 px-1",
                                language === 'ar' ? "text-right" : translationDir === 'rtl' ? "text-right" : "text-left"
                            )}
                            dir={language === 'ar' ? 'rtl' : translationDir}
                            style={{ fontFamily: language === 'ar' ? "'Amiri', serif" : "'Almarai', sans-serif" }}
                        >
                            {language === 'ar' ? (
                                tafsir
                            ) : translatedText === '__NO_TRANSLATION__' ? (
                                <div className="flex flex-col items-center justify-center text-center gap-3 py-4">
                                    <span className="text-2xl">📥</span>
                                    <p className="text-xs opacity-70">
                                        {(t as any).translationNotAvailable || 'يرجى تحميل ترجمة هذه اللغة من شاشة الإعدادات لعرضها هنا'}
                                    </p>
                                    {onOpenTranslationManager && (
                                        <button
                                            onClick={() => { setShowTafsir(false); onClose(); onOpenTranslationManager(); }}
                                            className="flex items-center gap-1.5 text-[10px] font-bold text-blue-400 hover:text-blue-300 transition-colors bg-blue-500/10 px-3 py-1.5 rounded-full"
                                        >
                                            <SettingsIcon size={12} />
                                            {(t as any).manageTranslations || 'إدارة التفاسير واللغات'}
                                        </button>
                                    )}
                                </div>
                            ) : translatedText === '__NOT_FOUND__' ? (
                                <div className="flex flex-col items-center justify-center text-center gap-3 py-4">
                                    <span className="text-2xl">⚠️</span>
                                    <p className="text-xs opacity-70">
                                        {(t as any).translationAyahNotFound || 'لم يتم العثور على نص هذه الآية في البيانات المحملة'}
                                    </p>
                                </div>
                            ) : (
                                translatedText
                            )}
                        </div>
                        <button onClick={() => { setShowTafsir(false); onClose(); }} className="w-full bg-[var(--bg-secondary)] text-[var(--text-primary)] py-2 rounded-lg font-bold text-xs transition-colors mt-1 border border-[var(--border-primary)]">
                            {t.close}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}