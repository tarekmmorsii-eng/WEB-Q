import React, { useState, useEffect } from 'react';
import { X, Loader2, Plus, Bug } from 'lucide-react';
import clsx from 'clsx';
import { useFeedback } from '../contexts/FeedbackContext';
import { Mutashabiha } from '../types';
import { getSurahName } from '../utils/quranHelpers';
import { getAyahTexts } from '../utils/ayahTextHelper';
import { getMatchingWords } from '../utils/similarityCalculator';
import { MUTASHABIHAT_DATA_FULL, AYAH_RULE_MAP } from '../constants/mutashabihatData';
import { quranNormalize, quranStripConjunction, quranIsSymbol, findSharedPhrases, getRealWordCount } from '../utils/quranUtils';
import { translations, Language } from '../i18n/translations';

import { formatNumber } from '../utils/quranUtils';

function MutashabihatIcon({
    showGreenLine = false,
    showRedLine = false,
    size = "w-10 h-10",
    number = "1",
    language = "ar"
}: {
    showGreenLine?: boolean,
    showRedLine?: boolean,
    size?: string,
    number?: string,
    language?: string
}) {
    const goldColor = "#d97706"; // Premium Gold

    return (
        <div className={clsx("shrink-0", size)}>
            <svg viewBox="0 0 100 110" className="w-full h-full overflow-visible">
                <g fill="none" stroke={goldColor} strokeWidth="4">
                    <path d="M50,12 C65,12 85,22 88,48 C91,74 72,88 50,88 C28,88 10,72 12,48 C14,24 35,12 50,12 Z" />
                </g>
                <text x="50" y="55" fill={goldColor} fontSize="40" fontWeight="bold" textAnchor="middle" dominantBaseline="central">
                    {formatNumber(number, language)}
                </text>

                {/* Underline Logic: Full width if single color, half each if dual */}
                {showGreenLine && !showRedLine && (
                    <line x1="20" y1="102" x2="80" y2="102" stroke="#22c55e" strokeWidth="12" strokeLinecap="round" />
                )}
                {showRedLine && !showGreenLine && (
                    <line x1="20" y1="102" x2="80" y2="102" stroke="#ef4444" strokeWidth="12" strokeLinecap="round" />
                )}
                {showGreenLine && showRedLine && (
                    <>
                        <line x1="20" y1="102" x2="50" y2="102" stroke="#22c55e" strokeWidth="12" strokeLinecap="round" />
                        <line x1="50" y1="102" x2="80" y2="102" stroke="#ef4444" strokeWidth="12" strokeLinecap="round" />
                    </>
                )}
            </svg>
        </div>
    );
}

/**
 * مكون لعرض النص مع تلوين الكلمات المتطابقة بناءً على القواعد
 */
const HighlightedText = React.memo(({ text, absoluteAyahNumber, manualRules, referenceText, forceColor }: {
    text: string,
    absoluteAyahNumber?: number,
    manualRules?: any[],
    referenceText?: string | string[],
    forceColor?: string
}) => {
    if (!text) return <>{text}</>;

    // --- STRICT CONTEXTUAL MATCHING: Only highlight what is shared with reference texts ---
    let allRules: any[] = manualRules ? [...manualRules] : [];
    const candidates = absoluteAyahNumber ? (AYAH_RULE_MAP.get(absoluteAyahNumber) || []) : [];

    // Generate rules ONLY from shared phrases with references
    if (referenceText) {
        const refs = Array.isArray(referenceText) ? referenceText : [referenceText];
        refs.forEach(ref => {
            if (!ref || ref === text) return;
            const shared = findSharedPhrases(text, ref);
            shared.forEach(p => {
                const normP = quranNormalize(p.phrase);
                // Try to find an official metadata (type/color) for this shared phrase
                const official = candidates.find(c => quranNormalize(c.rule).includes(normP) || normP.includes(quranNormalize(c.rule)));

                if (official) {
                    if (!allRules.some(r => r.rule === official.rule)) allRules.push(official);
                } else {
                    if (!allRules.some(r => r.rule === p.phrase)) {
                        allRules.push({
                            rule: p.phrase,
                            type: 'MIDDLE',
                            isDynamic: true
                        });
                    }
                }
            });
        });
    }

    if (allRules.length === 0) return <span className="text-[var(--text-primary)]">{text}</span>;

    // --- RULE SPLITTING ---
    const effectivelySplitRules: any[] = [];
    allRules.forEach(r => {
        if (!r.rule) return;
        // Clean parentheses from the rule before splitting
        const cleanRule = r.rule.replace(/[\(\)]/g, '');
        const parts = cleanRule.split(/\s*[\/\-]\s*|\s*\.\.\.\s*|\s*…\s*/);
        if (parts.length > 1) {
            parts.forEach(p => {
                if (p.trim().length > 0) {
                    effectivelySplitRules.push({ ...r, rule: p.trim() });
                }
            });
        } else {
            effectivelySplitRules.push({ ...r, rule: cleanRule.trim() });
        }
    });

    const rawWords = text.split(/\s+/).filter(w => w.length > 0);
    const wordInfos = new Array(rawWords.length).fill(null).map(() => ({ color: '', type: '', isBold: false, prefixLen: 0 }));

    // Sort rules: Longest first
    const sortedRules = [...effectivelySplitRules].sort((a, b) => {
        const lenA = (a.rule?.length || 0);
        const lenB = (b.rule?.length || 0);
        if (lenA !== lenB) return lenB - lenA;

        const priority: any = { 'START': 1, 'END': 2, 'MIDDLE': 3, 'OTHER': 4 };
        const pa = priority[a.type] || 5;
        const pb = priority[b.type] || 5;
        return pa - pb;
    });

    const normalizedRawWords = rawWords.map(w => quranNormalize(w));

    sortedRules.forEach(rule => {
        if (!rule.rule) return;
        const ruleNormalized = quranNormalize(rule.rule);
        const ruleWords = ruleNormalized.trim().split(/\s+/);
        if (ruleWords.length === 0) return;

        const colors = {
            'START': forceColor || '#d97706',
            'END': forceColor || '#d97706',
            'MIDDLE': forceColor || '#d97706',
            'OTHER': forceColor || '#d97706'
        };

        for (let i = 0; i <= rawWords.length - ruleWords.length; i++) {
            let match = true;
            let currentPrefixes = new Array(ruleWords.length).fill(0);

            for (let j = 0; j < ruleWords.length; j++) {
                const targetNorm = normalizedRawWords[i + j];
                const res = quranStripConjunction(targetNorm, ruleWords[j]);
                const resRev = quranStripConjunction(ruleWords[j], targetNorm);

                if (res.match) {
                    currentPrefixes[j] = res.prefixLen;
                } else if (resRev.match) {
                    currentPrefixes[j] = 0;
                } else if (targetNorm === ruleWords[j]) {
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

                // --- NEW CONDITIONAL HIGHLIGHTING RULE ---
                // If it's a 1-word match and NOT at start or end, skip it
                if (ruleWords.length === 1 && !isStart && !isEnd) {
                    continue;
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
                    return <span key={i} className="transition-colors duration-300 rounded px-1 text-[var(--text-primary)]">{word}</span>;
                }

                if (info.prefixLen > 0) {
                    let splitIdx = info.prefixLen;
                    let extra = 0;
                    if (word.length > splitIdx && /[\u064B-\u0652]/.test(word[splitIdx])) extra = 1;

                    const pPart = word.substring(0, splitIdx + extra);
                    const mPart = word.substring(splitIdx + extra);

                    return (
                        <span key={i} className="flex">
                            <span className="text-[var(--text-primary)]">{pPart}</span>
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
});

interface MutashabihatModalProps {
    isOpen: boolean;
    onClose: () => void;
    mutashabiha: Mutashabiha | null;
    mutashabihatData?: Mutashabiha[]; // Added to allow external data passing
    language?: string;
    onNavigateToAyah?: (surahNumber: number, ayahNumber: number) => void;
    onOpenInIndex?: (surahNumber: number, ayahNumber: number) => void;
    onDeleteSimilarAyah?: (mutId: string, surah: number, ayah: number) => void;
    onAddSimilarAyah?: (mutId: string, isInsideSurah: boolean) => void;
}

import { parseMutashabihatText } from '../utils/mutashabihatProcessor';

export default function MutashabihatModal({
    isOpen,
    onClose,
    mutashabiha,
    mutashabihatData,
    language,
    onNavigateToAyah,
    onOpenInIndex,
    onDeleteSimilarAyah,
    onAddSimilarAyah
}: MutashabihatModalProps) {
    // We can't use useFeedback hook directly if MutashabihatModal is used outside of FeedbackProvider in some tests
    // But since it's child of App, it should be fine.  However, to be safe, let's use the hook.
    // If strict prop passing is preferred, we would pass it. But context is cleaner.
    // We need to import it inside the component file if not already.
    // WAIT: I cannot add imports easily with replace_file_content if they are far away.
    // I will assume I can add the hook usage, but I need to inject the Import first?
    // Actually, I can allow the `useFeedback` to be used if I import it.
    // Let's add the prop approach or just context. 
    // I already Modified Header to use Context. I should modify this file to import it too.

    // Changing approach slightly: I will add the import at the top of file in a separate call if needed, 
    // or just assume I can add it here if I am replacing a big chunk.
    // I will replace the imports section in a separate tool call to be safe.

    // For now, let's just use the hook and I will add the import in next step.
    const { openFeedback: onOpenFeedback } = useFeedback();

    // Use the prop directly since it is already merged and managed by the parent (App.tsx)
    const activeMutashabiha = mutashabiha;
    const [ayahTexts, setAyahTexts] = useState<Map<string, string>>(new Map());
    const [isLoading, setIsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'all' | 'inside' | 'outside'>('inside');

    useEffect(() => {
        if (mutashabiha) {
            const hasInside = mutashabiha.similarAyahs.some(a => a.surahNumber === mutashabiha.sourceAyah.surahNumber);
            if (!hasInside) setActiveTab('all');
            else setActiveTab('inside');
        }
    }, [mutashabiha?.id]);

    const isArabic = language === 'ar';
    const t = translations[language as Language] || translations['ar'];

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

    if (!isOpen || !activeMutashabiha) return null;

    const sourceSurahName = t.surahNames[activeMutashabiha.sourceAyah.surahNumber - 1];
    const sourceKey = `${activeMutashabiha.sourceAyah.surahNumber}-${activeMutashabiha.sourceAyah.ayahNumber}`;
    const sourceText = ayahTexts.get(sourceKey) || activeMutashabiha.sourceAyah.text || '';

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
                className="w-full max-w-3xl rounded-2xl shadow-2xl border border-[var(--border-primary)] p-6 relative animate-in zoom-in-95 duration-200 max-h-[85vh] overflow-y-auto bg-[var(--bg-card)]"
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 left-4 p-2 rounded-full hover:bg-[var(--bg-secondary)] transition-colors z-10"
                >
                    <X size={20} className="text-[var(--text-primary)] opacity-50" />
                </button>

                {/* Report Error Button */}
                <button
                    onClick={() => onOpenFeedback('bug_mutashabihat', { mutashabihaId: activeMutashabiha.id, source: activeMutashabiha.sourceAyah })}
                    className="absolute top-4 right-4 p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 text-red-400 hover:text-red-600 transition-colors z-10 flex items-center gap-1"
                    title={t.reportError}
                >
                    <Bug size={18} />
                    <span className="text-xs font-bold hidden sm:inline">{t.report}</span>
                </button>

                {/* Header */}
                <div className="text-center mb-6 mt-2">
                    <h2 className="text-2xl font-bold text-amber-600 dark:text-amber-400 mb-2 flex items-center justify-center gap-2">
                        <span className="text-3xl">⚠️</span>
                        {t.similarVersesAlert}
                    </h2>
                    <p className="text-[var(--text-primary)] opacity-60 text-sm">
                        {t.similarVersesDescription}
                    </p>
                </div>

                {/* Source Ayah */}
                <div className="mb-6 p-5 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-2xl shadow-md">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-bold text-amber-600 dark:text-amber-400 bg-amber-600/10 px-3 py-1 rounded-full">
                            📍 {t.sourceVerse}
                        </span>
                        <div className="flex gap-2">
                            <button
                                onClick={() => onOpenInIndex?.(mutashabiha.sourceAyah.surahNumber, mutashabiha.sourceAyah.ayahNumber)}
                                className="text-[10px] bg-[var(--bg-card)] hover:bg-[var(--bg-primary)] hover:bg-opacity-10 text-[var(--text-primary)] px-3 py-2 rounded-full transition-all border border-[var(--border-primary)] shadow-sm active:scale-95 flex items-center gap-1.5"
                            >
                                <MutashabihatIcon showGreenLine showRedLine size="w-4 h-4" language={language} />
                                {t.openInIndex}
                            </button>
                            <button
                                onClick={() => onNavigateToAyah?.(
                                    mutashabiha.sourceAyah.surahNumber,
                                    mutashabiha.sourceAyah.ayahNumber
                                )}
                                className="text-xs bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-full transition-all shadow-md hover:shadow-lg active:scale-95"
                            >
                                {t.goToVerse}
                            </button>
                        </div>
                    </div>

                    <div className="text-center mb-2">
                        <p className="text-base font-bold text-[var(--text-primary)]">
                            {sourceSurahName} - {t.verse} {mutashabiha.sourceAyah.ayahNumber}
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
                                manualRules={activeMutashabiha.similarAyahs
                                    .filter(a => {
                                        if (activeTab === 'inside') return a.surahNumber === activeMutashabiha.sourceAyah.surahNumber;
                                        if (activeTab === 'outside') return a.surahNumber !== activeMutashabiha.sourceAyah.surahNumber;
                                        return true;
                                    })
                                    .filter(a => a.rule)
                                    .map(a => ({ rule: a.rule, type: a.ruleType }))
                                }
                                referenceText={activeMutashabiha.similarAyahs
                                    .filter(a => {
                                        if (activeTab === 'inside') return a.surahNumber === activeMutashabiha.sourceAyah.surahNumber;
                                        if (activeTab === 'outside') return a.surahNumber !== activeMutashabiha.sourceAyah.surahNumber;
                                        return true;
                                    })
                                    .map(a => ayahTexts.get(`${a.surahNumber}-${a.ayahNumber}`) || a.text || '')
                                    .filter(t => t && t.length > 0)
                                }
                                forceColor={activeTab === 'outside' ? '#ef4444' : (activeTab === 'inside' ? '#10b981' : undefined)}
                            />
                        </div>
                    )}
                </div>

                {/* Header Tabs */}
                {(() => {
                    const displayMutashabiha = activeMutashabiha || mutashabiha;
                    return (
                        <div className="flex bg-[var(--bg-secondary)] p-1.5 rounded-2xl mb-6 shadow-inner">
                            <button
                                onClick={() => setActiveTab('all')}
                                className={clsx(
                                    "flex-1 py-2.5 px-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2",
                                    activeTab === 'all'
                                        ? "bg-[var(--bg-card)] text-amber-600 dark:text-amber-400 shadow-sm"
                                        : "text-[var(--text-primary)] opacity-50 hover:bg-[var(--bg-card)] hover:bg-opacity-50"
                                )}
                            >
                                <span>🔗</span>
                                {t.all}
                                <span className="text-[10px] bg-[var(--bg-primary)] opacity-20 px-1.5 py-0.5 rounded-full">
                                    {displayMutashabiha.similarAyahs.length}
                                </span>
                            </button>
                            <button
                                onClick={() => setActiveTab('inside')}
                                className={clsx(
                                    "flex-1 py-2.5 px-3 rounded-xl text-sm font-bold transition-all flex flex-col items-center justify-center gap-1.5",
                                    activeTab === 'inside'
                                        ? "bg-[var(--bg-card)] text-[var(--text-primary)] shadow-sm"
                                        : "text-[var(--text-primary)] opacity-50 hover:bg-[var(--bg-card)] hover:bg-opacity-50"
                                )}
                            >
                                <div className="flex items-center gap-2">
                                    <MutashabihatIcon showGreenLine size="w-6 h-6" language={language} />
                                    {t.insideSurah}
                                    <span className="text-[10px] bg-[var(--bg-secondary)] px-1.5 py-0.5 rounded-full">
                                        {displayMutashabiha.similarAyahs.filter(a => a.surahNumber === displayMutashabiha.sourceAyah.surahNumber).length}
                                    </span>
                                </div>
                                <div className="w-12 h-1 rounded-full bg-green-500 opacity-80" />
                            </button>
                            <button
                                onClick={() => setActiveTab('outside')}
                                className={clsx(
                                    "flex-1 py-2.5 px-3 rounded-xl text-sm font-bold transition-all flex flex-col items-center justify-center gap-1.5",
                                    activeTab === 'outside'
                                        ? "bg-[var(--bg-card)] text-[var(--text-primary)] shadow-sm"
                                        : "text-[var(--text-primary)] opacity-50 hover:bg-[var(--bg-card)] hover:bg-opacity-50"
                                )}
                            >
                                <div className="flex items-center gap-2">
                                    <MutashabihatIcon showRedLine size="w-6 h-6" language={language} />
                                    {t.outsideSurah}
                                    <span className="text-[10px] bg-[var(--bg-secondary)] px-1.5 py-0.5 rounded-full">
                                        {displayMutashabiha.similarAyahs.filter(a => a.surahNumber !== displayMutashabiha.sourceAyah.surahNumber).length}
                                    </span>
                                </div>
                                <div className="w-12 h-1 rounded-full bg-red-500 opacity-80" />
                            </button>
                        </div>
                    );
                })()}

                {/* Similar Ayahs */}
                <div className="space-y-4">
                    <h3 className="text-lg font-bold text-[var(--text-primary)] mb-3 flex items-center gap-2">
                        <MutashabihatIcon showGreenLine showRedLine size="w-7 h-7" language={language} />
                        {t.similarVersesLabel}
                        <span className="text-sm text-[var(--text-primary)] opacity-50">({(activeMutashabiha || mutashabiha).similarAyahs.length})</span>
                    </h3>

                    {(() => {
                        const displayData = activeMutashabiha || mutashabiha;
                        const filteredData = (displayData?.similarAyahs || [])
                            .filter(a => {
                                if (activeTab === 'inside') return a.surahNumber === displayData?.sourceAyah.surahNumber;
                                if (activeTab === 'outside') return a.surahNumber !== displayData?.sourceAyah.surahNumber;
                                return true;
                            })
                            .map(ayah => {
                                const ruleText = ayah.rule || displayData?.similarAyahs[0]?.rule || "";
                                const ruleNormalized = quranNormalize(ruleText);
                                const ruleWords = ruleNormalized.trim().split(/\s+/);
                                const targetText = ayahTexts.get(`${ayah.surahNumber}-${ayah.ayahNumber}`) || ayah.text || "";
                                const targetRawWords = targetText.trim().split(/\s+/).filter(w => w.length > 0);

                                let headCount = 0;
                                let tailCount = 0;
                                let midCount = 0;

                                // Logic to calculate matching score for sorting (unchanged)
                                if (targetRawWords.length > 0 && ruleWords.length > 0) {
                                    for (let i = 0; i <= targetRawWords.length - ruleWords.length; i++) {
                                        let match = true;
                                        for (let j = 0; j < ruleWords.length; j++) {
                                            const normTarget = quranNormalize(targetRawWords[i + j]);
                                            const res = quranStripConjunction(normTarget, ruleWords[j]);
                                            if (!res.match) { match = false; break; }
                                        }
                                        if (match) {
                                            let isStart = true;
                                            for (let k = 0; k < i; k++) { if (!quranIsSymbol(targetRawWords[k])) { isStart = false; break; } }
                                            let isEnd = true;
                                            for (let k = i + ruleWords.length; k < targetRawWords.length; k++) { if (!quranIsSymbol(targetRawWords[k])) { isEnd = false; break; } }

                                            if (isStart) headCount = Math.max(headCount, ruleWords.length);
                                            else if (isEnd) tailCount = Math.max(tailCount, ruleWords.length);
                                            else midCount = Math.max(midCount, ruleWords.length);
                                        }
                                    }
                                }

                                let priorityScore = headCount * 1.1;
                                if ((tailCount + midCount) >= headCount * 2 && (tailCount + midCount) > 0) {
                                    priorityScore = (tailCount + midCount);
                                }

                                return { ...ayah, priorityScore, text: targetText };
                            })
                            .sort((a, b) => {
                                if (b.priorityScore !== a.priorityScore) return b.priorityScore - a.priorityScore;
                                return a.ayahNumber - b.ayahNumber;
                            });

                         if (filteredData.length === 0) return (
                            <div className="text-center py-8 text-[var(--text-primary)] opacity-40 italic">
                                {t.noMatchingVerses}
                            </div>
                        );

                        return (
                            <div className="space-y-4">
                                {filteredData.map((ayah, globalIdx) => {
                                    const similarSurahName = t.surahNames[ayah.surahNumber - 1];
                                    const ayahText = ayah.text || '';

                                    return (
                                        <div
                                            key={`${ayah.surahNumber}-${ayah.ayahNumber}-${globalIdx}`}
                                            className="p-4 rounded-xl border-r-4 bg-[var(--bg-secondary)] shadow-sm border-l-0"
                                            style={{
                                                borderColor: ayah.surahNumber !== activeMutashabiha.sourceAyah.surahNumber ? '#ef4444' : '#10b981'
                                            }}
                                        >
                                            <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                                                <div className="flex items-center gap-3 flex-1">
                                                    <span className="bg-[var(--bg-card)] rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold text-[var(--text-primary)]">
                                                        {globalIdx + 1}
                                                    </span>

                                                    <p className="font-bold text-[var(--text-primary)]" dir="rtl">
                                                        {similarSurahName} - {t.verse} {ayah.ayahNumber}
                                                    </p>

                                                    <button
                                                        onClick={() => onOpenInIndex?.(ayah.surahNumber, ayah.ayahNumber)}
                                                        className="text-[10px] bg-[var(--bg-card)] hover:bg-[var(--bg-primary)] hover:bg-opacity-10 text-[var(--text-primary)] opacity-70 px-3 py-1 rounded-full transition-all border border-[var(--border-primary)] shadow-sm active:scale-95 flex items-center gap-1"
                                                    >
                                                        <MutashabihatIcon showGreenLine showRedLine size="w-3 h-3" language={language} />
                                                        {t.openInIndex}
                                                    </button>
                                                    <button
                                                        onClick={() => onNavigateToAyah?.(ayah.surahNumber, ayah.ayahNumber)}
                                                        className="text-xs bg-[var(--bg-card)] hover:bg-amber-100 dark:hover:bg-amber-900/40 text-[var(--text-primary)] px-3 py-1 rounded-full transition-all border border-[var(--border-primary)] shadow-sm active:scale-95"
                                                    >
                                                        {t.goAction}
                                                    </button>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    {onDeleteSimilarAyah && (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                onDeleteSimilarAyah(activeMutashabiha.id, ayah.surahNumber, ayah.ayahNumber);
                                                            }}
                                                            className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
                                                        >
                                                            <X size={16} />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>

                                            {!isLoading && (
                                                <div className="font-quran text-xl leading-loose text-[var(--text-primary)] text-right px-2 py-2">
                                                    <HighlightedText
                                                        text={ayahText}
                                                        absoluteAyahNumber={ayah.absoluteAyahNumber}
                                                        manualRules={ayah.rule ? [{ rule: ayah.rule, type: ayah.ruleType }] : []}
                                                        referenceText={[sourceText]}
                                                        forceColor={activeTab === 'inside' ? '#10b981' : (activeTab === 'outside' ? '#ef4444' : undefined)}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        );
                    })()}
                </div>

                {onAddSimilarAyah && activeTab !== 'all' && (
                    <button
                        onClick={() => onAddSimilarAyah((activeMutashabiha || mutashabiha).id, activeTab === 'inside')}
                        className="w-full mt-4 p-4 border-2 border-dashed border-[var(--border-primary)] rounded-xl flex items-center justify-center gap-2 text-[var(--text-primary)] opacity-50 hover:opacity-100 transition-all group"
                    >
                        <Plus size={20} className="group-hover:scale-110 transition-transform" />
                        <span className="font-bold">
                            {activeTab === 'inside' ? t.addInternalMutashabiha : t.addExternalMutashabiha}
                        </span>
                    </button>
                )}

                 {mutashabiha.showContext && (
                    <div className="mt-5 p-4 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl">
                        <p className="text-sm text-blue-600 dark:text-blue-400 text-center font-medium">
                            💡 {t.mutashabihatContextTip}
                        </p>
                    </div>
                )}

                <button
                    onClick={onClose}
                    className="w-full mt-6 py-3 bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white rounded-xl transition-all font-bold shadow-lg hover:shadow-xl active:scale-98"
                >
                    {t.close}
                </button>
            </div>
        </div>
    );
}
