/**
 * TranslationManagerModal
 * واجهة مدير التحميلات - إدارة ترجمات اللغات
 * يدعم التحميل الحقيقي من Al Quran Cloud API و FawazAhmed API
 */

import React, { useState, useEffect, useCallback } from 'react';
import { X, Download, Trash2, Check, Loader2, HardDrive, Globe, Wifi, WifiOff, AlertCircle } from 'lucide-react';
import {
    getAllTranslations,
    deleteTranslation,
    saveTranslation,
    StoredTranslation,
    saveWbwData,
    deleteWbwData,
} from '../services/translationStorageService';
import { translations, Language } from '../i18n/translations';
import {
    TRANSLATION_EDITIONS,
    getAlQuranCloudUrl,
    getFawazAhmedSurahUrl,
    isTranslationAvailable,
    EditionInfo
} from '../utils/translationMapper';

interface TranslationManagerModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentLanguage: string;
}

// واجهة عنصر اللغة في القائمة
interface LanguageItem {
    code: string;
    nameAr: string;
    nameEn: string;
    edition: EditionInfo;
    available: boolean;
}

// بناء قائمة اللغات من الخريطة
const AVAILABLE_LANGUAGES: LanguageItem[] = Object.entries(TRANSLATION_EDITIONS)
    .map(([code, edition]) => ({
        code,
        nameAr: edition.nameAr,
        nameEn: edition.nameEn,
        edition,
        available: isTranslationAvailable(code),
    }))
    .sort((a, b) => {
        // اللغات المتاحة أولاً، ثم أبجدياً
        if (a.available && !b.available) return -1;
        if (!a.available && b.available) return 1;
        return a.nameAr.localeCompare(b.nameAr, 'ar');
    });

const TranslationManagerModal: React.FC<TranslationManagerModalProps> = ({
    isOpen,
    onClose,
    currentLanguage
}) => {
    const t: any = translations[currentLanguage as Language] || translations.ar;
    const [storedTranslations, setStoredTranslations] = useState<Map<string, StoredTranslation>>(new Map());
    const [downloadingLang, setDownloadingLang] = useState<string | null>(null);
    const [deletingLang, setDeletingLang] = useState<string | null>(null);
    const [progressMsg, setProgressMsg] = useState<string>('');
    const [progressPercent, setProgressPercent] = useState<number>(0);
    const [errorMsg, setErrorMsg] = useState<string>('');

    // تحميل قائمة الترجمات المحفوظة
    const refreshStored = useCallback(async () => {
        try {
            const all = await getAllTranslations();
            const map = new Map<string, StoredTranslation>();
            all.forEach(item => map.set(item.languageCode, item));
            setStoredTranslations(map);
        } catch (err) {
            console.error('Failed to load stored translations:', err);
        }
    }, []);

    useEffect(() => {
        if (isOpen) refreshStored();
    }, [isOpen, refreshStored]);

    /**
     * جلب بيانات معاني الكلمات (WbW) لسورة واحدة من Quran.com API v4
     * يرجع كائن بالصيغة: { "surah:ayah": { "position": { translation: "..." } } }
     *
     * ملاحظة: Quran.com API v4 يستخدم char_type_name (وليس char_type)
     * ويجب إزالة word_fields أو تضمين translation و char_type_name فيه
     */
    const fetchWbwForSurah = async (surahNum: number, langCode: string): Promise<Record<string, any>> => {
        try {
            // نزيل word_fields المحدود ونطلب كل الحقول بما فيها translation و char_type_name
            const url = `https://api.quran.com/api/v4/verses/by_chapter/${surahNum}?language=${langCode}&words=true&word_fields=translation&per_page=300`;
            console.log(`🔍 [WbW] Fetching surah ${surahNum} for language: ${langCode}`);
            const response = await fetch(url);
            if (!response.ok) {
                console.warn(`⚠️ [WbW] API returned ${response.status} for surah ${surahNum}, lang: ${langCode}`);
                return {};
            }

            const json = await response.json();
            const verses = json.verses || [];
            const result: Record<string, any> = {};

            for (const verse of verses) {
                const verseKey = verse.verse_key; // مثال: "1:1"
                const words = verse.words || [];
                const ayahWords: Record<string, any> = {};

                for (const word of words) {
                    // Quran.com API v4 يستخدم char_type_name وليس char_type
                    const charType = word.char_type_name || word.char_type || '';
                    if (charType === 'word' && word.translation) {
                        const translationText = typeof word.translation === 'string'
                            ? word.translation
                            : word.translation?.text || '';
                        if (translationText) {
                            ayahWords[word.position?.toString()] = { translation: translationText };
                        }
                    }
                }

                if (Object.keys(ayahWords).length > 0) {
                    result[verseKey] = ayahWords;
                }
            }

            console.log(`✅ [WbW] Surah ${surahNum} (${langCode}): ${Object.keys(result).length} ayahs with translations`);
            return result;
        } catch (e) {
            console.warn(`⚠️ [WbW] Fetch failed for surah ${surahNum}:`, e);
            return {};
        }
    };

    /**
     * جلب ترجمة كاملة من Al Quran Cloud API
     * ترجع كائن يحتوي على جميع السور والآيات
     */
    const fetchFromAlQuranCloud = async (editionId: string): Promise<any> => {
        const url = getAlQuranCloudUrl(editionId);
        setProgressPercent(15);

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`API error: ${response.status} ${response.statusText}`);
        }

        setProgressPercent(30);
        const json = await response.json();

        if (json.code !== 200 || !json.data) {
            throw new Error('Invalid API response');
        }

        return json.data;
    };

    /**
     * جلب ترجمة + معاني الكلمات من FawazAhmed API + Quran.com API
     * يطلب 114 سورة ويجمعها في كائن واحد مع WbW
     * التحميل المزدوج داخل نفس الحلقة
     */
    const fetchFromFawazAhmed = async (editionId: string, langCode: string): Promise<{ data: any, wbwData: any }> => {
        const surahs: any[] = [];
        const wbwAllData: Record<string, any> = {};

        for (let i = 1; i <= 114; i++) {
            // 1. جلب ترجمة السورة
            const url = getFawazAhmedSurahUrl(editionId, i);
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`Failed to fetch surah ${i}: ${response.status}`);
            }

            const surahData = await response.json();
            surahs.push(surahData);

            // 2. جلب معاني الكلمات (WbW) لنفس السورة - داخل نفس الحلقة
            const wbwSurah = await fetchWbwForSurah(i, langCode);
            Object.assign(wbwAllData, wbwSurah);

            // تحديث مؤشر التقدم (يحسب كلا العمليتين معاً)
            const percent = Math.round((i / 114) * 100);
            setProgressPercent(10 + percent * 0.7); // 10% -> 80%
            setProgressMsg(`${t.downloading || 'جاري التحميل'}... ${percent}% (ترجمة + معاني)`);
        }

        return { data: { surahs }, wbwData: wbwAllData };
    };

    // تحميل ترجمة حقيقية (مزدوج: ترجمة + معاني كلمات)
    const handleDownload = async (lang: LanguageItem) => {
        if (!lang.available) {
            setErrorMsg(`${lang.nameAr}: ${t.internetRequired || 'غير متاح حالياً'}`);
            setTimeout(() => setErrorMsg(''), 3000);
            return;
        }

        setDownloadingLang(lang.code);
        setErrorMsg('');
        setProgressPercent(5);
        setProgressMsg(`${t.downloading || 'جاري التحميل'}... 0%`);

        try {
            const edition = lang.edition;
            let translationResult: any;
            let wbwAllData: Record<string, any> = {};

            if (edition.source === 'alquran-cloud') {
                // المرحلة 1: تحميل الترجمة من Al Quran Cloud API (5% -> 35%)
                setProgressMsg(`${t.downloading || 'جاري التحميل'}... (ترجمة الآيات)`);
                translationResult = await fetchFromAlQuranCloud(edition.editionId);

                // المرحلة 2: تحميل معاني الكلمات من Quran.com API v4 - فقط إذا كانت اللغة تدعمها
                if (edition.hasWbw) {
                    setProgressMsg(`${t.downloading || 'جاري التحميل'}... (معاني الكلمات)`);
                    for (let i = 1; i <= 114; i++) {
                        const wbwSurah = await fetchWbwForSurah(i, lang.code);
                        Object.assign(wbwAllData, wbwSurah);

                        const percent = Math.round((i / 114) * 100);
                        setProgressPercent(35 + percent * 0.45);
                        setProgressMsg(`${t.downloading || 'جاري التحميل'}... معاني ${percent}%`);
                    }
                } else {
                    // تخطي تحميل WbW - توفير الإنترنت والوقت
                    console.log(`⏭️ [WbW] Skipped for ${lang.code} - language not supported by Quran.com API`);
                    setProgressPercent(80);
                }
            } else {
                // تحميل مزدوج داخل نفس الحلقة: ترجمة + معاني (5% -> 80%)
                const result = await fetchFromFawazAhmed(edition.editionId, lang.code);
                translationResult = result.data;
                wbwAllData = result.wbwData;
            }

            // المرحلة 3: حفظ البيانات (80% -> 100%)
            setProgressPercent(82);
            setProgressMsg(`${t.saving || 'جاري الحفظ'}...`);

            // إضافة بيانات وصفية للترجمة
            const translationData = {
                ...translationResult,
                _meta: {
                    editionId: edition.editionId,
                    author: edition.author,
                    source: edition.source,
                    direction: edition.direction,
                    downloadedAt: new Date().toISOString(),
                }
            };

            // حفظ الترجمة في IndexedDB
            const translation: StoredTranslation = {
                languageCode: lang.code,
                languageName: lang.nameAr,
                data: translationData,
                timestamp: Date.now(),
            };
            await saveTranslation(translation);

            // حفظ معاني الكلمات (WbW) في IndexedDB
            if (Object.keys(wbwAllData).length > 0) {
                setProgressPercent(92);
                setProgressMsg(`${t.saving || 'جاري الحفظ'}... (معاني الكلمات)`);
                await saveWbwData({
                    languageCode: lang.code,
                    data: wbwAllData,
                    timestamp: Date.now(),
                });
                console.log(`✅ WbW data saved for ${lang.code}: ${Object.keys(wbwAllData).length} ayahs`);
            } else {
                console.warn(`⚠️ No WbW data fetched for ${lang.code}`);
            }

            setProgressPercent(100);
            await refreshStored();
            setProgressMsg(`✅ ${lang.nameAr} - ${edition.author} (${Object.keys(wbwAllData).length} آية بمعاني الكلمات)`);
            setTimeout(() => {
                setProgressMsg('');
                setProgressPercent(0);
            }, 3000);

        } catch (err: any) {
            console.error('Download failed:', err);
            const errMsg = err.message || 'Unknown error';

            if (errMsg.includes('Failed to fetch') || errMsg.includes('NetworkError') || errMsg.includes('NetWorkError')) {
                setErrorMsg(`❌ ${t.internetRequiredDownload || 'فشل التحميل، تأكد من اتصالك بالإنترنت'}`);
            } else {
                setErrorMsg(`❌ ${t.downloadFailed || 'فشل التحميل'}: ${errMsg.substring(0, 80)}`);
            }
            setProgressPercent(0);
            setTimeout(() => setErrorMsg(''), 4000);
        }

        setDownloadingLang(null);
        setProgressMsg('');
    };

    // حذف ترجمة + بيانات WbW
    const handleDelete = async (code: string, name: string) => {
        setDeletingLang(code);
        try {
            await deleteTranslation(code);
            await deleteWbwData(code); // حذف بيانات معاني الكلمات أيضاً
            await refreshStored();
        } catch (err) {
            console.error('Delete failed:', err);
        }
        setDeletingLang(null);
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div
                className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-[95vw] max-w-lg max-h-[85vh] flex flex-col overflow-hidden"
                dir={t.dir}
                style={{ fontFamily: "'Almarai', sans-serif" }}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-2">
                        <Globe size={22} className="text-amber-600" />
                        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                            {t.manageTranslations || 'تحميل الترجمة ومعاني الكلمات'}
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    >
                        <X size={20} className="text-slate-500" />
                    </button>
                </div>

                {/* Progress Bar + Message */}
                {(progressMsg || errorMsg) && (
                    <div className="px-4 py-2 space-y-1">
                        {/* Error Message */}
                        {errorMsg && (
                            <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/30 rounded-lg px-3 py-2">
                                <AlertCircle size={16} className="shrink-0" />
                                <span>{errorMsg}</span>
                            </div>
                        )}
                        {/* Progress Message */}
                        {progressMsg && (
                            <div className="space-y-1">
                                <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300 text-sm">
                                    <Loader2 size={14} className="animate-spin shrink-0" />
                                    <span>{progressMsg}</span>
                                </div>
                                {progressPercent > 0 && (
                                    <div className="w-full bg-amber-100 dark:bg-amber-900/40 rounded-full h-1.5 overflow-hidden">
                                        <div
                                            className="bg-amber-500 h-full rounded-full transition-all duration-300 ease-out"
                                            style={{ width: `${progressPercent}%` }}
                                        />
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-3 space-y-2">
                    {/* Arabic - Built-in */}
                    <div className="flex items-center justify-between p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-800/60 flex items-center justify-center">
                                <HardDrive size={16} className="text-amber-600" />
                            </div>
                            <div>
                                <p className="font-bold text-slate-800 dark:text-slate-100 text-sm">العربية</p>
                                <p className="text-xs text-amber-600 dark:text-amber-400">
                                    أساسي - مدمج • كتاب معاني كلمات القران الكريم كلمه بكلمه لبشير يونس
                                </p>
                            </div>
                        </div>
                        <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 rounded-full font-bold">
                            {t.active || 'نشط'}
                        </span>
                    </div>

                    {/* Available Languages */}
                    {AVAILABLE_LANGUAGES.map(lang => {
                        const isStored = storedTranslations.has(lang.code);
                        const stored = storedTranslations.get(lang.code);
                        const isDownloading = downloadingLang === lang.code;
                        const isDeleting = deletingLang === lang.code;
                        const isActive = currentLanguage === lang.code;

                        return (
                            <div
                                key={lang.code}
                                className={`flex items-center justify-between p-3 rounded-xl border transition-colors ${
                                    !lang.available
                                        ? 'bg-slate-50/50 dark:bg-slate-800/30 border-slate-200/50 dark:border-slate-700/30 opacity-60'
                                        : isActive
                                            ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800/40'
                                            : isStored
                                                ? 'bg-green-50/50 dark:bg-green-900/10 border-green-200/50 dark:border-green-800/30'
                                                : 'bg-slate-50 dark:bg-slate-700/40 border-slate-200 dark:border-slate-600/40 hover:bg-slate-100 dark:hover:bg-slate-700/60'
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                        isStored ? 'bg-green-100 dark:bg-green-900/40' : 'bg-slate-100 dark:bg-slate-600/60'
                                    }`}>
                                        {isStored ? (
                                            <Check size={16} className="text-green-600 dark:text-green-400" />
                                        ) : !lang.available ? (
                                            <WifiOff size={16} className="text-slate-300 dark:text-slate-500" />
                                        ) : (
                                            <Globe size={16} className="text-slate-400" />
                                        )}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <p className="font-bold text-slate-800 dark:text-slate-100 text-sm">
                                                {t.dir === 'rtl' ? lang.nameAr : lang.nameEn}
                                            </p>
                                            {/* شارة توفر معاني الكلمات */}
                                            {lang.edition.hasWbw ? (
                                                <span className="text-[10px] px-1.5 py-0.5 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 rounded-full font-medium whitespace-nowrap">
                                                    {t.wbwAvailable || 'تفسير + معاني كلمات'}
                                                </span>
                                            ) : (
                                                <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700/60 text-slate-500 dark:text-slate-400 rounded-full font-medium whitespace-nowrap">
                                                    {t.wbwNotAvailable || 'تفسير فقط'}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                            {isStored
                                                ? <span className="text-green-600 dark:text-green-400">{lang.edition.author}</span>
                                                : !lang.available
                                                    ? <span className="text-[10px] text-slate-300 dark:text-slate-500">{t.translationNotSupported || 'الترجمة غير متوفرة حالياً'}</span>
                                                    : <span>{lang.edition.author}</span>
                                            }
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    {isActive && isStored && (
                                        <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 rounded-full font-bold">
                                            {t.active || 'نشط'}
                                        </span>
                                    )}

                                    {isDownloading ? (
                                        <div className="flex items-center gap-1">
                                            <Loader2 size={20} className="animate-spin text-amber-600" />
                                            {progressPercent > 0 && (
                                                <span className="text-xs text-amber-600 font-bold">{progressPercent}%</span>
                                            )}
                                        </div>
                                    ) : isDeleting ? (
                                        <Loader2 size={20} className="animate-spin text-red-500" />
                                    ) : isStored ? (
                                        <button
                                            onClick={() => handleDelete(lang.code, lang.nameAr)}
                                            className="p-2 rounded-full hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors group"
                                            title={t.delete || 'حذف'}
                                        >
                                            <Trash2 size={18} className="text-red-400 group-hover:text-red-600" />
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => handleDownload(lang)}
                                            disabled={!lang.available}
                                            className={`p-2 rounded-full transition-colors group ${
                                                lang.available
                                                    ? 'hover:bg-amber-100 dark:hover:bg-amber-900/40'
                                                    : 'cursor-not-allowed opacity-40'
                                            }`}
                                            title={lang.available ? (t.download || 'تحميل') : (t.internetRequired || 'غير متاح')}
                                        >
                                            <Download size={18} className="text-amber-500 group-hover:text-amber-700" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Footer */}
                <div className="p-3 border-t border-slate-200 dark:border-slate-700 space-y-1">
                    <div className="flex items-center justify-center gap-4 text-xs text-slate-400 dark:text-slate-500">
                        <span className="flex items-center gap-1">
                            <Wifi size={12} />
                            {storedTranslations.size} {t.downloadedLanguages || 'لغة محملة'}
                        </span>
                        <span>•</span>
                        <span>{AVAILABLE_LANGUAGES.filter(l => l.available).length} {t.totalLanguages || 'إجمالي اللغات'}</span>
                    </div>
                    <p className="text-center text-[10px] text-slate-300 dark:text-slate-600">
                        Powered by Al Quran Cloud & FawazAhmed APIs
                    </p>
                </div>
            </div>
        </div>
    );
};

export default TranslationManagerModal;