import React, { useState, useEffect } from 'react';
import { X, Loader2, Trash2, Plus } from 'lucide-react';
import clsx from 'clsx';
import { Mutashabiha } from '../types';
import { getSurahName } from '../utils/quranHelpers';
import { getAyahTexts } from '../utils/ayahTextHelper';
import { getMatchingWords } from '../utils/similarityCalculator';
import { MUTASHABIHAT_DATA_FULL, AYAH_RULE_MAP } from '../constants/mutashabihatData';
import { quranNormalize, quranStripConjunction, quranIsSymbol, findSharedPhrases, getRealWordCount } from '../utils/quranUtils';

/**
 * مكون لعرض النص مع تلوين الكلمات المتطابقة بناءً على القواعد
 */
function HighlightedText({ text, absoluteAyahNumber, manualRules, referenceText }: {
    text: string,
    absoluteAyahNumber?: number,
    manualRules?: any[],
    referenceText?: string | string[]
}) {
    if (!text) return <>{text}</>;

    // Get all rules for this ayah from the global map PLUS any manual rules passed
    const autoRules = absoluteAyahNumber ? (AYAH_RULE_MAP.get(absoluteAyahNumber) || []) : [];
    let allRules = [...autoRules];

    // Add manual rules if not already present
    if (manualRules) {
        manualRules.forEach(mr => {
            if (!allRules.find(r => r.rule === mr.rule)) allRules.push(mr);
        });
    }

    // --- STRICT REQUIREMENT: FILTER OUT SINGLE-WORD RULES ---
    allRules = allRules.filter(r => getRealWordCount(r.rule) >= 2);

    // --- DYNAMIC MATCHING ---
    if (referenceText) {
        const refs = Array.isArray(referenceText) ? referenceText : [referenceText];
        refs.forEach(ref => {
            if (!ref || ref === text) return;
            const shared = findSharedPhrases(text, ref);
            shared.forEach(p => {
                // Double check 2-word minimum
                if (getRealWordCount(p.phrase) < 2) return;

                if (!allRules.some(r => quranNormalize(r.rule).includes(quranNormalize(p.phrase)))) {
                    allRules.push({
                        rule: p.phrase,
                        type: 'MIDDLE',
                        isDynamic: true
                    });
                }
            });
        });
    }

    if (allRules.length === 0) return <span className="text-slate-900 dark:text-slate-100">{text}</span>;

    const rawWords = text.split(/\s+/).filter(w => w.length > 0);
    const wordInfos = new Array(rawWords.length).fill(null).map(() => ({ color: '', type: '', isBold: false, prefixLen: 0 }));

    // Sort rules: Longest first
    const sortedRules = [...allRules].sort((a, b) => {
        const lenA = (a.rule?.length || 0);
        const lenB = (b.rule?.length || 0);
        if (lenA !== lenB) return lenB - lenA;

        const priority: any = { 'START': 1, 'END': 2, 'MIDDLE': 3, 'OTHER': 4 };
        const pa = priority[a.type] || 5;
        const pb = priority[b.type] || 5;
        return pa - pb;
    });

    sortedRules.forEach(rule => {
        if (!rule.rule) return;
        const ruleNormalized = quranNormalize(rule.rule);
        const ruleWords = ruleNormalized.trim().split(/\s+/);
        if (ruleWords.length === 0) return;

        const colors = {
            'START': '#10b981',
            'END': '#ef4444',
            'MIDDLE': '#3b82f6',
            'OTHER': '#d97706'
        };

        for (let i = 0; i <= rawWords.length - ruleWords.length; i++) {
            let match = true;
            let currentPrefixes = new Array(ruleWords.length).fill(0);

            for (let j = 0; j < ruleWords.length; j++) {
                const res = quranStripConjunction(quranNormalize(rawWords[i + j]), ruleWords[j]);
                const resRev = quranStripConjunction(ruleWords[j], quranNormalize(rawWords[i + j]));

                if (res.match) {
                    currentPrefixes[j] = res.prefixLen;
                } else if (resRev.match) {
                    currentPrefixes[j] = 0;
                } else if (quranNormalize(rawWords[i + j]) === ruleWords[j]) {
                    currentPrefixes[j] = 0;
                } else {
                    match = false;
                    break;
                }
            }

            if (match) {
                let isStart = true;
                for (let k = 0; k < i; k++) {
                    if (!quranIsSymbol(rawWords[k])) {
                        isStart = false;
                        break;
                    }
                }

                let isEnd = true;
                for (let k = i + ruleWords.length; k < rawWords.length; k++) {
                    if (!quranIsSymbol(rawWords[k])) {
                        isEnd = false;
                        break;
                    }
                }

                let effectiveType = rule.type;
                if (isStart) effectiveType = 'START';
                else if (isEnd) effectiveType = 'END';
                else effectiveType = 'MIDDLE';

                const effectiveColor = (colors as any)[effectiveType] || colors.OTHER;

                for (let j = 0; j < ruleWords.length; j++) {
                    if (!wordInfos[i + j].color) {
                        wordInfos[i + j].color = effectiveColor;
                        wordInfos[i + j].type = effectiveType;
                        wordInfos[i + j].isBold = true;
                        wordInfos[i + j].prefixLen = currentPrefixes[j];
                    }
                }
            }
        }
    });

    return (
        <div className="flex flex-wrap justify-center gap-x-1.5 gap-y-2" dir="rtl">
            {rawWords.map((word, i) => {
                const info = wordInfos[i];
                if (!info.color) {
                    return <span key={i} className="transition-colors duration-300 rounded px-1 text-slate-900 dark:text-slate-100">{word}</span>;
                }

                if (info.prefixLen > 0) {
                    let splitIdx = info.prefixLen;
                    const prefixPart = word.substring(0, splitIdx);
                    let extra = 0;
                    if (word.length > splitIdx && /[\u064B-\u0652]/.test(word[splitIdx])) extra = 1;

                    const pPart = word.substring(0, splitIdx + extra);
                    const mPart = word.substring(splitIdx + extra);

                    return (
                        <span key={i} className="flex">
                            <span className="text-slate-900 dark:text-slate-100">{pPart}</span>
                            <span
                                className={clsx("transition-colors duration-300 rounded px-1 font-bold")}
                                style={{
                                    color: info.color,
                                    backgroundColor: `${info.color}15`,
                                    textShadow: `0 0 10px ${info.color}25`
                                }}
                            >
                                {mPart}
                            </span>
                        </span>
                    );
                }

                return (
                    <span
                        key={i}
                        className={clsx("transition-colors duration-300 rounded px-1 font-bold")}
                        style={{
                            color: info.color,
                            backgroundColor: `${info.color}15`,
                            textShadow: `0 0 10px ${info.color}25`
                        }}
                    >
                        {word}
                    </span>
                );
            })}
        </div>
    );
}

interface MutashabihatModalProps {
    isOpen: boolean;
    onClose: () => void;
    mutashabiha: Mutashabiha | null;
    language: string;
    onNavigateToAyah?: (surahNumber: number, ayahNumber: number) => void;
    onDeleteSimilarAyah?: (mutashabihaId: string, surahNumber: number, ayahNumber: number) => void;
    onAddSimilarAyah?: (mutashabihaId: string) => void;
}

export default function MutashabihatModal({
    isOpen,
    onClose,
    mutashabiha,
    language,
    onNavigateToAyah,
    onDeleteSimilarAyah,
    onAddSimilarAyah
}: MutashabihatModalProps) {
    const [ayahTexts, setAyahTexts] = useState<Map<string, string>>(new Map());
    const [isLoading, setIsLoading] = useState(false);

    const isArabic = language === 'ar';

    // Load ayah texts when modal opens
    useEffect(() => {
        if (!isOpen || !mutashabiha) {
            setAyahTexts(new Map());
            return;
        }

        const loadTexts = async () => {
            setIsLoading(true);
            try {
                const refs = [
                    { surahNumber: mutashabiha.sourceAyah.surahNumber, ayahNumber: mutashabiha.sourceAyah.ayahNumber },
                    ...mutashabiha.similarAyahs.map(a => ({ surahNumber: a.surahNumber, ayahNumber: a.ayahNumber }))
                ];

                const texts = await getAyahTexts(refs);
                setAyahTexts(texts);
            } catch (error) {
                console.error('Failed to load ayah texts:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadTexts();
    }, [isOpen, mutashabiha]);

    if (!isOpen || !mutashabiha) return null;

    const sourceSurahName = getSurahName(mutashabiha.sourceAyah.surahNumber);
    const sourceKey = `${mutashabiha.sourceAyah.surahNumber}-${mutashabiha.sourceAyah.ayahNumber}`;
    const sourceText = ayahTexts.get(sourceKey) || mutashabiha.sourceAyah.text || '';

    // NO LONGER NEEDED: logic for allSimilarTexts as we use map now

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
            onClick={handleBackdropClick}
            style={{ fontFamily: "'Almarai', sans-serif" }}
        >
            <div
                className="w-full max-w-3xl rounded-2xl shadow-2xl border-2 border-amber-300 dark:border-amber-600 p-6 relative animate-in zoom-in-95 duration-200 max-h-[85vh] overflow-y-auto bg-gradient-to-br from-amber-50 to-orange-50 dark:from-slate-800 dark:to-slate-900"
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 left-4 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors z-10"
                >
                    <X size={20} className="text-gray-600 dark:text-gray-300" />
                </button>

                {/* Header */}
                <div className="text-center mb-6 mt-2">
                    <h2 className="text-2xl font-bold text-amber-800 dark:text-amber-400 mb-2 flex items-center justify-center gap-2">
                        <span className="text-3xl">⚠️</span>
                        {isArabic ? 'تنبيه: متشابهات' : 'Similar Verses Alert'}
                    </h2>
                    <p className="text-slate-600 dark:text-slate-300 text-sm">
                        {isArabic
                            ? 'هذه الآية لها آيات متشابهة معها، احذر من الخلط بينها عند الحفظ'
                            : 'This verse has similar verses, be careful not to confuse them while memorizing'}
                    </p>
                </div>

                {/* Source Ayah */}
                <div className="mb-6 p-5 bg-gradient-to-r from-amber-100 to-orange-100 dark:from-slate-700 dark:to-slate-800 border-2 border-amber-400 dark:border-amber-600 rounded-2xl shadow-md">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-bold text-amber-900 dark:text-amber-300 bg-amber-200 dark:bg-amber-900 px-3 py-1 rounded-full">
                            {isArabic ? '📍 الآية المصدر' : '📍 Source Verse'}
                        </span>
                        <button
                            onClick={() => onNavigateToAyah?.(
                                mutashabiha.sourceAyah.surahNumber,
                                mutashabiha.sourceAyah.ayahNumber
                            )}
                            className="text-xs bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-full transition-all shadow-md hover:shadow-lg active:scale-95"
                        >
                            {isArabic ? 'الذهاب للآية →' : 'Go to Verse →'}
                        </button>
                    </div>

                    <div className="text-center mb-2">
                        <p className="text-base font-bold text-slate-800 dark:text-slate-200">
                            {sourceSurahName} - {isArabic ? 'آية' : 'Ayah'} {mutashabiha.sourceAyah.ayahNumber}
                        </p>
                    </div>

                    {isLoading ? (
                        <div className="flex justify-center items-center py-6">
                            <Loader2 className="animate-spin text-amber-600" size={32} />
                        </div>
                    ) : (
                        <div className="p-5 text-right font-quran text-2xl leading-loose" style={{ direction: 'rtl' }}>
                            <HighlightedText
                                text={sourceText}
                                absoluteAyahNumber={mutashabiha.sourceAyah.absoluteAyahNumber}
                                referenceText={mutashabiha.similarAyahs.map(a => a.text || '')}
                            />
                        </div>
                    )}
                </div>

                {/* Similar Ayahs */}
                <div className="space-y-4">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-2">
                        <span>🔗</span>
                        {isArabic ? 'الآيات المتشابهة:' : 'Similar Verses:'}
                        <span className="text-sm text-slate-500 dark:text-slate-400">({mutashabiha.similarAyahs.length})</span>
                    </h3>

                    {/* Grouped by Rule */}
                    {(() => {
                        // DIRECT FIX: Get rules from raw JSON data using shared map

                        const groups = {
                            'START': [] as typeof mutashabiha.similarAyahs,
                            'END': [] as typeof mutashabiha.similarAyahs,
                            'MIDDLE': [] as typeof mutashabiha.similarAyahs,
                            'FREQ': [] as typeof mutashabiha.similarAyahs,
                            'OTHER': [] as typeof mutashabiha.similarAyahs
                        };

                        mutashabiha.similarAyahs.forEach(a => {
                            // Try to get primary rule from raw data map
                            const directRules = a.absoluteAyahNumber ? (AYAH_RULE_MAP.get(a.absoluteAyahNumber) || []) : [];
                            const primaryRule = directRules[0];

                            // PRIORITY: 1. ruleType, 2. primaryRule.type, 3. 'OTHER'
                            let effectiveType: keyof typeof groups = 'OTHER';

                            if (a.ruleType && groups[a.ruleType as keyof typeof groups]) {
                                effectiveType = a.ruleType as keyof typeof groups;
                            } else if (primaryRule?.type && groups[primaryRule.type as keyof typeof groups]) {
                                effectiveType = primaryRule.type as keyof typeof groups;
                            }

                            groups[effectiveType].push(a);
                        });



                        // Define sections and order
                        const sections = [
                            { key: 'START', labelEn: 'Start of Verse', labelAr: 'بداية الآيات' },
                            { key: 'END', labelEn: 'End of Verse', labelAr: 'نهاية الآيات' },
                            { key: 'MIDDLE', labelEn: 'Middle of Verse', labelAr: 'وسط الآيات' },
                            { key: 'FREQ', labelEn: 'Frequent Words', labelAr: 'كلمات مكررة (نفس السورة)' },
                            { key: 'OTHER', labelEn: 'Other Matches', labelAr: 'متشابهات أخرى' }
                        ];

                        return (
                            <div className="space-y-8">
                                {sections.map(section => {
                                    const items = groups[section.key as keyof typeof groups];
                                    if (items.length === 0) return null;

                                    // Alphabetical sort within section by rule
                                    const sortedItems = [...items].sort((a, b) => {
                                        const ruleA = a.rule || "";
                                        const ruleB = b.rule || "";

                                        if (ruleA !== ruleB) {
                                            // Special case: push "الأمر بذكر الله" to bottom of section
                                            const specialRule = "الأمر بذكر الله";
                                            if (ruleA === specialRule) return 1;
                                            if (ruleB === specialRule) return -1;

                                            return ruleA.localeCompare(ruleB, 'ar');
                                        }
                                        // Then by surah/ayah
                                        if (a.surahNumber !== b.surahNumber) return a.surahNumber - b.surahNumber;
                                        return a.ayahNumber - b.ayahNumber;
                                    });

                                    return (
                                        <div key={section.key} className="space-y-3">
                                            <div className="flex items-center gap-2 border-b border-amber-200 dark:border-slate-700 pb-2 mb-2">
                                                <span className="text-xl">
                                                    {section.key === 'START' && '🟢'}
                                                    {section.key === 'END' && '🔴'}
                                                    {section.key === 'MIDDLE' && '🔵'}
                                                    {section.key === 'FREQ' && '🔄'}
                                                    {section.key === 'OTHER' && '⚪'}
                                                </span>
                                                <h4 className="text-md font-semibold text-slate-700 dark:text-slate-300">
                                                    {isArabic ? section.labelAr : section.labelEn}
                                                    <span className="ml-2 text-xs font-normal text-slate-500">
                                                        ({sortedItems.length})
                                                    </span>
                                                </h4>
                                            </div>

                                            <div className="space-y-4">
                                                {sortedItems.map((ayah, idx) => {
                                                    const similarSurahName = getSurahName(ayah.surahNumber);
                                                    const ayahKey = `${ayah.surahNumber}-${ayah.ayahNumber}`;
                                                    const ayahText = ayahTexts.get(ayahKey) || ayah.text || '';
                                                    const similarity = ayah.similarity;

                                                    return (
                                                        <div
                                                            key={`${ayah.surahNumber}-${ayah.ayahNumber}-${idx}`}
                                                            style={{
                                                                borderColor: ayah.ruleColor || similarity?.color || '#e5e7eb'
                                                            }}
                                                        >
                                                            <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                                                                <div className="flex items-center gap-2 flex-1">
                                                                    <span className="bg-slate-200 dark:bg-slate-700 rounded-full w-6 h-6 flex items-center justify-center text-xs">
                                                                        {idx + 1}
                                                                    </span>

                                                                    {/* Similarity Badge */}
                                                                    {similarity && (
                                                                        <span
                                                                            className="px-3 py-1 rounded-full text-xs font-bold text-white shadow-sm"
                                                                            style={{ backgroundColor: similarity.color }}
                                                                        >
                                                                            {similarity.percentage}% - {isArabic ? similarity.label : similarity.labelEn}
                                                                        </span>
                                                                    )}

                                                                    <p className="font-bold text-slate-700 dark:text-slate-200" dir="rtl">
                                                                        {similarSurahName} - {isArabic ? 'آية' : 'Ayah'} {ayah.ayahNumber}
                                                                    </p>
                                                                </div>

                                                                <div className="flex items-center gap-2">
                                                                    {onDeleteSimilarAyah && (
                                                                        <button
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                onDeleteSimilarAyah(mutashabiha.id, ayah.surahNumber, ayah.ayahNumber);
                                                                            }}
                                                                            className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
                                                                            title={isArabic ? 'حذف' : 'Delete'}
                                                                        >
                                                                            <Trash2 size={16} />
                                                                        </button>
                                                                    )}
                                                                    <button
                                                                        onClick={() => onNavigateToAyah?.(ayah.surahNumber, ayah.ayahNumber)}
                                                                        className="text-xs bg-slate-600 hover:bg-slate-700 text-white px-3 py-1.5 rounded-full transition-all shadow-sm hover:shadow-md active:scale-95"
                                                                    >
                                                                        {isArabic ? 'اذهب' : 'Go'}
                                                                    </button>
                                                                </div>
                                                            </div>

                                                            {!isLoading && (
                                                                <div className="text-lg leading-relaxed text-slate-800 dark:text-slate-200 text-right px-2 py-2" style={{ fontFamily: "'Amiri Quran', serif" }}>
                                                                    <HighlightedText
                                                                        text={ayahText}
                                                                        absoluteAyahNumber={ayah.absoluteAyahNumber}
                                                                        referenceText={[sourceText, ...mutashabiha.similarAyahs.filter(sa => sa.ayahNumber !== ayah.ayahNumber).map(sa => sa.text || '')]}
                                                                    />
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        );
                    })()}
                </div>

                {/* Add New Mutashabiha Button */}
                {onAddSimilarAyah && (
                    <button
                        onClick={() => onAddSimilarAyah(mutashabiha.id)}
                        className="w-full mt-4 p-4 border-2 border-dashed border-amber-300 dark:border-slate-600 rounded-xl flex items-center justify-center gap-2 text-amber-800 dark:text-slate-400 hover:border-amber-500 hover:text-amber-900 dark:hover:text-slate-200 transition-all group"
                    >
                        <Plus size={20} className="group-hover:scale-110 transition-transform" />
                        <span className="font-bold">{isArabic ? 'إضافة آية متشابهة أخرى' : 'Add another similar verse'}</span>
                    </button>
                )}

                {/* Context Indicator */}
                {mutashabiha.showContext && (
                    <div className="mt-5 p-4 bg-blue-50 dark:bg-blue-900/30 border-2 border-blue-300 dark:border-blue-700 rounded-xl">
                        <p className="text-sm text-blue-900 dark:text-blue-200 text-center font-medium">
                            💡 {isArabic
                                ? 'تنبيه: يُنصح بقراءة الآية التالية للسياق والتمييز'
                                : 'Tip: Read the next verse for context and distinction'}
                        </p>
                    </div>
                )}

                {/* Close Button at Bottom */}
                <button
                    onClick={onClose}
                    className="w-full mt-6 py-3 bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white rounded-xl transition-all font-bold shadow-lg hover:shadow-xl active:scale-98"
                >
                    {isArabic ? 'إغلاق' : 'Close'}
                </button>
            </div>
        </div>
    );
}

