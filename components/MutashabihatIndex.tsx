import React, { useState, useEffect, useMemo } from 'react';
import { X, Search, ChevronRight, ChevronLeft, Filter, BookOpen, AlertCircle, Bookmark, Loader2 } from 'lucide-react';
import clsx from 'clsx';
import { Mutashabiha, Surah } from '../types';
import { SURAHS } from '../constants/surahData';
import { MUTASHABIHAT_DATA_FULL, AYAH_RULE_MAP } from '../constants/mutashabihatData';

import { getAyahText, getAyahTexts } from '../utils/ayahTextHelper';

import { getMatchingWords } from '../utils/similarityCalculator';
import { quranNormalize, quranStripConjunction, quranIsSymbol, findSharedPhrases, getRealWordCount } from '../utils/quranUtils';

import { formatNumber } from '../utils/quranUtils';
import { translations } from '../i18n/translations';

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
const HighlightingText = React.memo(({ text, absoluteAyahNumber, rules: manualRules, onlyRule, referenceText, isInsideSurah, t }: {
    text: string,
    absoluteAyahNumber?: number,
    rules?: any[],
    onlyRule?: string,
    referenceText?: string | string[],
    isInsideSurah?: boolean,
    t: any
}) => {
    if (!text) return <span className="text-gray-800 dark:text-gray-200">{text}</span>;

    // Get all rules for this ayah from the global map PLUS any manual rules passed
    const autoRules = absoluteAyahNumber ? (AYAH_RULE_MAP.get(absoluteAyahNumber) || []) : [];
    let allRules = [...autoRules, ...(manualRules || [])];

    // Filter by specific rule if requested - support multi-part rules like "(A / B / C)"
    if (onlyRule) {
        const cleanOnly = onlyRule.replace(/[\(\)]/g, '');
        // Split by /, -, ..., or unicode ellipsis …
        const parts = cleanOnly.split(/\s*[\/\-]\s*|\s*\.\.\.\s*|\s*…\s*/).filter(p => p.length > 0);

        const originalRules = [...allRules];
        
        // Strategy: For each part of the rule, find if there's a shared phrase in the current text
        parts.forEach(p => {
            const pNorm = quranNormalize(p);
            // 1. Precise match in existing rules
            const exists = originalRules.some(r => quranNormalize(r.rule).includes(pNorm) || pNorm.includes(quranNormalize(r.rule)));
            
            if (!exists) {
                // 2. Dynamic discovery: Find what sequence in 'text' best matches this rule part 'p'
                const shared = findSharedPhrases(text, p);
                shared.forEach(sh => {
                    // Only add if it's a significant match (2+ real words)
                    if (getRealWordCount(sh.phrase) >= 2) {
                        allRules.push({
                            rule: sh.phrase,
                            type: 'MIDDLE',
                            isDynamic: true
                        });
                    }
                });
                
                // 3. Fallback: Literal match (original behavior)
                if (shared.length === 0 && pNorm.length >= 2) {
                    allRules.push({
                        rule: pNorm,
                        type: 'MIDDLE',
                        isDynamic: true
                    });
                }
            }
        });
        
        // Keep original matching rules too
        allRules = allRules.filter(r => {
            const normR = quranNormalize(r.rule);
            return parts.some(p => {
                const pn = quranNormalize(p);
                return normR.includes(pn) || pn.includes(normR);
            }) || r.isDynamic;
        });
    }

    const normalizedText = quranNormalize(text).toLowerCase();

    // 1. Filter manual rules: Only keep those relevant to the current comparison (if referenceText provided)
    let filteredRules = [...allRules];
    if (referenceText) {
        const refs = Array.isArray(referenceText) ? referenceText : [referenceText];
        const normalizedRefs = refs.map(r => quranNormalize(r).toLowerCase());

        filteredRules = filteredRules.filter(r => {
            if (r.isDynamic) return true; // Already derived from comparison
            const ruleNorm = quranNormalize(r.rule).toLowerCase();
            // A rule is relevant if it exists in BOTH the text and at least one reference text
            return normalizedText.includes(ruleNorm) && normalizedRefs.some(ref => ref.includes(ruleNorm));
        });
    }

    // 2. Dynamic Matching - DISABLED FOR PERFORMANCE if list is large or refs is array
    // Only use for explicit single comparison if not too heavy
    if (referenceText && !Array.isArray(referenceText) && text.length < 200) {
        const ref = referenceText;
        if (ref !== text) {
            const shared = findSharedPhrases(text, ref);
            shared.forEach(p => {
                const phraseNorm = quranNormalize(p.phrase);
                if (getRealWordCount(p.phrase) >= 2 && !filteredRules.some(r => quranNormalize(r.rule).includes(phraseNorm))) {
                    filteredRules.push({
                        rule: p.phrase,
                        type: 'MIDDLE',
                        isDynamic: true
                    });
                }
            });
        }
    }

    if (filteredRules.length === 0) return <span className={clsx("text-gray-800 dark:text-gray-200 w-full", t.dir === 'ltr' ? "text-left" : "text-right")} dir="rtl">{text}</span>;

    // --- RULE SPLITTING ---
    const effectivelySplitRules: any[] = [];
    filteredRules.forEach(r => {
        if (!r.rule) return;
        const cleanRule = r.rule.replace(/[\(\)]/g, '');
        const parts = cleanRule.split(/\s*[\/\-]\s*|\s*\.\.\.\s*|\s*…\s*/);
        parts.forEach(p => {
            if (p.trim().length > 0) {
                effectivelySplitRules.push({ ...r, rule: p.trim() });
            }
        });
    });

    const rawWords = text.split(/\s+/).filter(w => w.length > 0);
    const wordInfos = rawWords.map(() => ({ color: '', type: '', isBold: false, prefixLen: 0 }));

    // Sort rules: Longest first
    const sortedRules = [...effectivelySplitRules].sort((a, b) => {
        const lenA = a.rule?.length || 0;
        const lenB = b.rule?.length || 0;
        return lenB - lenA;
    });

    sortedRules.forEach(rule => {
        if (!rule.rule) return;
        const ruleNormalized = quranNormalize(rule.rule);
        const ruleWords = ruleNormalized.trim().split(/\s+/);

        const isSingleWord = ruleWords.length === 1;

        const colors = {
            'START': isInsideSurah ? '#10b981' : '#ef4444',
            'END': isInsideSurah ? '#10b981' : '#ef4444',
            'MIDDLE': isInsideSurah ? '#10b981' : '#ef4444',
            'OTHER': isInsideSurah ? '#10b981' : '#ef4444'
        };

        const realWordIndices = rawWords.map((w, idx) => ({ norm: quranNormalize(w), idx })).filter(item => item.norm.length > 0);

        for (let i = 0; i <= realWordIndices.length - ruleWords.length; i++) {
            let match = true;
            let currentPrefixes = new Array(ruleWords.length).fill(0);
            let matchedRawIndices: number[] = [];

            for (let j = 0; j < ruleWords.length; j++) {
                const targetRealWord = realWordIndices[i + j];
                const res = quranStripConjunction(targetRealWord.norm, ruleWords[j]);
                const resRev = quranStripConjunction(ruleWords[j], targetRealWord.norm);

                if (res.match) {
                    currentPrefixes[j] = res.prefixLen;
                    matchedRawIndices.push(targetRealWord.idx);
                } else if (resRev.match) {
                    currentPrefixes[j] = 0;
                    matchedRawIndices.push(targetRealWord.idx);
                } else if (targetRealWord.norm === ruleWords[j]) {
                    currentPrefixes[j] = 0;
                    matchedRawIndices.push(targetRealWord.idx);
                } else {
                    match = false;
                    break;
                }
            }

            if (match) {
                const startRawIdx = matchedRawIndices[0];
                const endRawIdx = matchedRawIndices[matchedRawIndices.length - 1];

                let isStart = true;
                for (let k = 0; k < startRawIdx; k++) {
                    if (!quranIsSymbol(rawWords[k])) {
                        isStart = false;
                        break;
                    }
                }

                let isEnd = true;
                for (let k = endRawIdx + 1; k < rawWords.length; k++) {
                    if (!quranIsSymbol(rawWords[k])) {
                        isEnd = false;
                        break;
                    }
                }

                let effectiveType = rule.type;
                if (isStart) effectiveType = 'START';
                else if (isEnd) effectiveType = 'END';
                else effectiveType = 'MIDDLE';

                if (isSingleWord) {
                    if (!isInsideSurah || (!isStart && !isEnd)) {
                        continue;
                    }
                }

                const effectiveColor = (colors as any)[effectiveType] || colors.OTHER;

                for (let j = 0; j < matchedRawIndices.length; j++) {
                    const rawIdx = matchedRawIndices[j];
                    if (!wordInfos[rawIdx].color) {
                        wordInfos[rawIdx].color = effectiveColor;
                        wordInfos[rawIdx].type = effectiveType;
                        wordInfos[rawIdx].isBold = true;
                        wordInfos[rawIdx].prefixLen = currentPrefixes[j];
                    }
                }
            }
        }
    });

    return (
        <div className={clsx("flex flex-wrap gap-x-1 gap-y-1 w-full", t.dir === 'ltr' ? "justify-start text-left" : "justify-start text-right")} dir="rtl">
            {rawWords.map((word, i) => {
                const info = wordInfos[i];
                if (!info.color) {
                    return <span key={i} className="rounded px-0.5 opacity-90 text-gray-800 dark:text-gray-200">{word}</span>;
                }

                if (info.prefixLen > 0) {
                    const splitIdx = info.prefixLen;
                    let extra = 0;
                    if (word.length > splitIdx && /[\u064B-\u0652]/.test(word[splitIdx])) extra = 1;

                    const pPart = word.substring(0, splitIdx + extra);
                    const mPart = word.substring(splitIdx + extra);

                    return (
                        <span key={i} className="flex">
                            <span className="text-gray-800 dark:text-gray-200">{pPart}</span>
                            <span
                                className={clsx("rounded px-0.5 font-bold")}
                                style={{
                                    color: info.color,
                                    backgroundColor: `${info.color}20`,
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
                        className={clsx("rounded px-0.5 font-bold")}
                        style={{
                            color: info.color,
                            backgroundColor: `${info.color}20`,
                        }}
                    >
                        {word}
                    </span>
                );
            })}
        </div>
    );
});

interface MutashabihatIndexProps {
    isOpen: boolean;
    onClose: () => void;
    mutashabihatData: Mutashabiha[];
    isDarkMode?: boolean;
    onNavigateToAyah?: (surahNumber: number, ayahNumber: number) => void;
    initialSurahId?: number;
    initialAyahId?: number;
    t: any;
    language: string;
}

export default function MutashabihatIndex({
    isOpen, onClose, mutashabihatData, isDarkMode, onNavigateToAyah, initialSurahId, initialAyahId, t, language
}: MutashabihatIndexProps) {
    const [selectedSurahId, setSelectedSurahId] = useState<number>(1);

    const surahNameMap = useMemo(() => {
        const map: Record<number, string> = {};
        SURAHS.forEach(s => { map[s.number] = t.surahNames[s.number - 1]; });
        return map;
    }, []);

    useEffect(() => {
        if (isOpen && initialSurahId) {
            setSelectedSurahId(initialSurahId);
        }
    }, [isOpen, initialSurahId]);

    const [searchQuery, setSearchQuery] = useState("");
    const [activeTab, setActiveTab] = useState<'inside' | 'outside'>('inside');
    const [enrichedMutashabihat, setEnrichedMutashabihat] = useState<Mutashabiha[]>([]);
    const [visibleCount, setVisibleCount] = useState(15);
    const [isLoading, setIsLoading] = useState(false);

    const currentSurahMutashabihat = useMemo(() => {
        return mutashabihatData.filter(m => m.sourceAyah.surahNumber === selectedSurahId);
    }, [mutashabihatData, selectedSurahId]);

    // Reset visible count when Surah changes to keep rendering light
    useEffect(() => {
        setVisibleCount(15);
    }, [selectedSurahId]);

    useEffect(() => {
        let isMounted = true;
        const loadTexts = async () => {
            if (!isOpen) return;

            if (currentSurahMutashabihat.length === 0) {
                setEnrichedMutashabihat([]);
                setIsLoading(false);
                return;
            }
            setIsLoading(true);

            try {
                const refsSet = new Set<string>();
                const uniqueRefs: Array<{ surahNumber: number; ayahNumber: number }> = [];

                currentSurahMutashabihat.forEach(mut => {
                    const sKey = `${mut.sourceAyah.surahNumber}-${mut.sourceAyah.ayahNumber}`;
                    if (!refsSet.has(sKey)) {
                        refsSet.add(sKey);
                        uniqueRefs.push({ surahNumber: mut.sourceAyah.surahNumber, ayahNumber: mut.sourceAyah.ayahNumber });
                    }
                    mut.similarAyahs.forEach(sim => {
                        const simKey = `${sim.surahNumber}-${sim.ayahNumber}`;
                        if (!refsSet.has(simKey)) {
                            refsSet.add(simKey);
                            uniqueRefs.push({ surahNumber: sim.surahNumber, ayahNumber: sim.ayahNumber });
                        }
                    });
                });

                const textsMap = await getAyahTexts(uniqueRefs);

                if (!isMounted) return;

                const enriched = currentSurahMutashabihat.map(mut => {
                    const sourceKey = `${mut.sourceAyah.surahNumber}-${mut.sourceAyah.ayahNumber}`;
                    const rawText = mut.sourceAyah.text || textsMap.get(sourceKey) || '';
                    return {
                        ...mut,
                        sourceAyah: {
                            ...mut.sourceAyah,
                            text: rawText,
                            normalizedText: quranNormalize(rawText).toLowerCase()
                        },
                        similarAyahs: mut.similarAyahs.map(sim => {
                            const simRawText = sim.text || textsMap.get(`${sim.surahNumber}-${sim.ayahNumber}`) || '';
                            return {
                                ...sim,
                                text: simRawText,
                                normalizedText: quranNormalize(simRawText).toLowerCase(),
                                normalizedRule: quranNormalize(sim.rule || "").toLowerCase()
                            };
                        })
                    };
                });

                setEnrichedMutashabihat(enriched);
            } catch (error) {
                console.error("Failed to load mutashabihat texts:", error);
            } finally {
                if (isMounted) setIsLoading(false);
            }
        };

        loadTexts();
        return () => { isMounted = false; };
    }, [currentSurahMutashabihat.length, selectedSurahId, isOpen]);

    useEffect(() => {
        if (isOpen && !isLoading && initialAyahId && selectedSurahId) {
            const timer = setTimeout(() => {
                const elementId = `mut-ayah-${selectedSurahId}-${initialAyahId}`;
                const element = document.getElementById(elementId);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    element.classList.add('ring-4', 'ring-amber-400', 'ring-opacity-50', 'transition-all', 'duration-1000');
                    setTimeout(() => {
                        element.classList.remove('ring-4', 'ring-amber-400', 'ring-opacity-50');
                    }, 2000);
                }
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [isOpen, isLoading, initialAyahId, selectedSurahId]);

    const [targetSurahFilter, setTargetSurahFilter] = useState<number | null>(null);

    useEffect(() => {
        setTargetSurahFilter(null);
    }, [selectedSurahId]);

    const { inside, outside, availableTargetSurahs } = useMemo(() => {
        const insideGroup: { mut: Mutashabiha, targets: any[] }[] = [];
        const outsideGroup: { mut: Mutashabiha, targets: any[] }[] = [];
        const targetSurahsSet = new Set<number>();

        const query = searchQuery.trim();
        const normalizedQuery = quranNormalize(query).toLowerCase();

        enrichedMutashabihat.forEach(mut => {
            const normalizedSourceText = (mut.sourceAyah as any).normalizedText;
            const sourceMatch = normalizedSourceText.includes(normalizedQuery);
            const sourceAyahNumMatch = mut.sourceAyah.ayahNumber.toString() === query;

            const insideTargets = mut.similarAyahs.filter(s => {
                const normalizedTargetText = (s as any).normalizedText;
                const normalizedRule = (s as any).normalizedRule;
                const targetMatch = normalizedTargetText.includes(normalizedQuery) ||
                    normalizedRule.includes(normalizedQuery) ||
                    s.ayahNumber.toString() === query;
                return s.surahNumber === selectedSurahId && (normalizedQuery === "" || targetMatch || sourceMatch || sourceAyahNumMatch);
            });

            const outsideTargets = mut.similarAyahs.filter(s => {
                if (s.surahNumber !== selectedSurahId) {
                    targetSurahsSet.add(s.surahNumber);
                }
                if (targetSurahFilter && s.surahNumber !== targetSurahFilter) return false;

                const surahNameMatch = surahNameMap[s.surahNumber]?.includes(query);
                const normalizedTargetText = (s as any).normalizedText;
                const normalizedRule = (s as any).normalizedRule;
                const targetMatch = normalizedTargetText.includes(normalizedQuery) ||
                    normalizedRule.includes(normalizedQuery) ||
                    s.ayahNumber.toString() === query ||
                    surahNameMatch;
                return s.surahNumber !== selectedSurahId && (normalizedQuery === "" || targetMatch || sourceMatch || sourceAyahNumMatch);
            });

            if (insideTargets.length > 0) {
                insideGroup.push({ mut, targets: insideTargets });
            }
            if (outsideTargets.length > 0) {
                const existing = outsideGroup.find(g => g.mut.sourceAyah.absoluteAyahNumber === mut.sourceAyah.absoluteAyahNumber);
                if (existing) {
                    existing.targets = [...existing.targets, ...outsideTargets.filter(ot => !existing.targets.some(et => et.absoluteAyahNumber === ot.absoluteAyahNumber))];
                } else {
                    outsideGroup.push({ mut, targets: outsideTargets });
                }
            }
        });

        insideGroup.sort((a, b) => a.mut.sourceAyah.ayahNumber - b.mut.sourceAyah.ayahNumber);
        outsideGroup.sort((a, b) => a.mut.sourceAyah.ayahNumber - b.mut.sourceAyah.ayahNumber);

        return {
            inside: insideGroup,
            outside: outsideGroup,
            availableTargetSurahs: Array.from(targetSurahsSet).sort((a, b) => a - b)
        };
    }, [enrichedMutashabihat, selectedSurahId, searchQuery, targetSurahFilter]);

    const groupedInside = useMemo(() => {
        const groups: Record<string, {
            rule: string,
            ruleType: string,
            ruleColor: string,
            ayahs: Map<number, any>
        }> = {};

        inside.forEach(item => {
            const { mut, targets } = item;
            targets.forEach(t => {
                const ruleKey = t.rule || 'OTHER';
                if (!groups[ruleKey]) {
                    const ruleNormalized = quranNormalize(ruleKey);
                    const ruleWords = ruleNormalized.trim().split(/\s+/);
                    const targetRawWords = (t.text || "").trim().split(/\s+/).filter(w => w.length > 0);

                    let detectedType = t.ruleType || 'OTHER';

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

                                if (isStart) detectedType = 'START';
                                else if (isEnd) detectedType = 'END';
                                else detectedType = 'MIDDLE';

                                if (groups[ruleKey] && groups[ruleKey].ruleType === 'MIDDLE') {
                                    detectedType = 'MIDDLE';
                                }
                                break;
                            }
                        }
                    }

                    if (getRealWordCount(ruleKey) < 1) return;

                    const colors = {
                        'START': '#10b981',
                        'END': '#10b981',
                        'MIDDLE': '#10b981',
                        'OTHER': '#10b981'
                    };

                    groups[ruleKey] = {
                        rule: t.rule || '',
                        ruleType: detectedType,
                        ruleColor: (colors as any)[detectedType] || colors.OTHER,
                        ayahs: new Map()
                    };
                }

                if (mut.sourceAyah.absoluteAyahNumber) {
                    groups[ruleKey].ayahs.set(mut.sourceAyah.absoluteAyahNumber, {
                        ...mut.sourceAyah,
                        isSource: true
                    });
                }
                if (t.absoluteAyahNumber) {
                    groups[ruleKey].ayahs.set(t.absoluteAyahNumber, { ...t });
                }
            });
        });

        return Object.values(groups).filter(g => g.ayahs.size > 0).map(g => {
            return {
                ...g,
                ayahs: Array.from(g.ayahs.values()).sort((a, b) => a.ayahNumber - b.ayahNumber)
            };
        }).sort((a, b) => {
            const minA = Math.min(...a.ayahs.map((ay: any) => ay.ayahNumber));
            const minB = Math.min(...b.ayahs.map((ay: any) => ay.ayahNumber));
            if (minA !== minB) return minA - minB;
            return (a.rule || "").localeCompare(b.rule || "", 'ar');
        });
    }, [inside]);

    if (!isOpen) return null;

    const currentSurahName = surahNameMap[selectedSurahId];
    const currentSurah = SURAHS.find(s => s.number === selectedSurahId);

    return (
        <div className="fixed inset-0 bg-gray-50 dark:bg-slate-900 z-[110] flex flex-col animate-in fade-in duration-300" dir={t.dir}>
            {/* Header */}
            <div className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 shadow-sm shrink-0">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg">
                        <X className="text-gray-600 dark:text-gray-300" />
                    </button>

                    <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <MutashabihatIcon showGreenLine showRedLine size="w-8 h-8" />
                        {t.mutashabihatIndex}
                    </h1>

                    <div className="w-10" />
                </div>

                <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col md:flex-row gap-4 items-center">
                    <div className="relative w-full md:w-64">
                        <select
                            value={selectedSurahId}
                            onChange={(e) => setSelectedSurahId(Number(e.target.value))}
                            className="w-full p-2.5 pr-10 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg appearance-none text-right font-medium text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                            dir="rtl"
                        >
                            {SURAHS.map(surah => (
                                <option key={surah.number} value={surah.number}>
                                    {surah.number}. {t.surahNames[surah.number - 1]} ({surah.ayahCount} {t.ayahs})
                                </option>
                            ))}
                        </select>
                        {t.dir === 'rtl' ? (
                            <ChevronLeft className="absolute left-3 top-3 text-gray-400 pointer-events-none" size={16} />
                        ) : (
                            <ChevronRight className="absolute right-3 top-3 text-gray-400 pointer-events-none" size={16} />
                        )}
                    </div>

                    <div className="flex flex-col md:flex-row gap-4 items-center flex-1 w-full">
                        <div className="relative flex-1 w-full">
                            <Search className={clsx("absolute top-1/2 -translate-y-1/2 text-gray-400", t.dir === 'rtl' ? "right-3" : "left-3")} size={18} />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder={t.searchMutashabihatPlaceholder}
                                className={clsx(
                                    "w-full p-2.5 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none",
                                    t.dir === 'rtl' ? "pr-10 pl-10 text-right" : "pl-10 pr-10 text-left"
                                )}
                                dir={t.dir}
                            />
                            {searchQuery && (
                                <button onClick={() => setSearchQuery("")} className={clsx("absolute top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors", t.dir === 'rtl' ? "left-3" : "right-3")}>
                                    <X size={18} />
                                </button>
                            )}
                        </div>
                        <div className="shrink-0 text-sm text-gray-600 dark:text-gray-400">
                            <span className="flex items-center gap-1">
                                <span className="font-bold text-amber-600">{currentSurahMutashabihat.length}</span> {t.mutashabihatLocations.replace('{count}', '')}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex md:hidden border-t border-gray-200 dark:border-slate-700">
                    <button
                        onClick={() => setActiveTab('inside')}
                        className={clsx(
                            "flex-1 p-3 text-sm font-medium text-center border-b-2 transition-colors",
                            activeTab === 'inside' ? "border-amber-600 text-amber-600 bg-amber-50 dark:bg-slate-800" : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400"
                        )}
                    >
                        {t.insideSurahCounted?.replace('{count}', inside.length.toString()) || `${t.insideSurah} (${inside.length})`}
                    </button>
                    <button
                        onClick={() => setActiveTab('outside')}
                        className={clsx(
                            "flex-1 p-3 text-sm font-medium text-center border-b-2 transition-colors",
                            activeTab === 'outside' ? "border-amber-600 text-amber-600 bg-amber-50 dark:bg-slate-800" : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400"
                        )}
                    >
                        {t.outsideSurahCounted?.replace('{count}', outside.length.toString()) || `${t.outsideSurah} (${outside.length})`}
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-hidden relative">
                {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm z-10">
                        <div className="flex flex-col items-center gap-3">
                            <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">{t.loadingTexts}</span>
                        </div>
                    </div>
                )}

                <div className="h-full overflow-y-auto p-4 md:p-6">
                    <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                        <div className={clsx("space-y-4", { 'hidden md:block': activeTab === 'outside' })}>
                            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-200 dark:border-slate-700">
                                <MutashabihatIcon showGreenLine size="w-7 h-7" language={language} />
                                <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                                    {t.insideSurahTitle.replace('{surah}', t.surahNames[selectedSurahId - 1])}
                                    <span className={clsx("text-sm font-normal text-gray-500 bg-gray-100 dark:bg-slate-800 px-2 py-0.5 rounded-full", language === 'ar' ? "mr-2" : "ml-2")}>
                                        {inside.length}
                                    </span>
                                </h3>
                            </div>

                            {groupedInside.length === 0 ? (
                                <div className="text-center py-10 text-gray-400 italic">{t.noInternalMutashabihat}</div>
                            ) : (
                                <>
                                    {groupedInside.slice(0, visibleCount).map((group, idx) => (
                                        <InternalGroupSection key={`${group.rule}_${idx}`} group={group} onNavigateToAyah={onNavigateToAyah} t={t} />
                                    ))}
                                    {groupedInside.length > visibleCount && (
                                        <button
                                            onClick={() => setVisibleCount(prev => prev + 15)}
                                            className="w-full py-3 bg-amber-50 dark:bg-slate-800 text-amber-700 dark:text-amber-500 font-bold rounded-xl border border-amber-100 dark:border-slate-700 hover:bg-amber-100 dark:hover:bg-slate-700 transition-all"
                                        >
                                            {t.showMoreInternal.replace('{count}', Math.min(15, groupedInside.length - visibleCount).toString())}
                                        </button>
                                    )}
                                </>
                            )}
                        </div>

                        <div className={clsx("space-y-4", { 'hidden md:block': activeTab === 'inside' })}>
                            <div className="flex flex-col gap-2 mb-4 pb-2 border-b border-gray-200 dark:border-slate-700">
                                <div className="flex items-center gap-2">
                                    <MutashabihatIcon showRedLine size="w-7 h-7" language={language} />
                                    <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                                        {t.outsideSurahTitle}
                                        <span className={clsx("text-sm font-normal text-gray-500 bg-gray-100 dark:bg-slate-800 px-2 py-0.5 rounded-full", t.dir === 'rtl' ? "mr-2" : "ml-2")}>
                                            {outside.length}
                                        </span>
                                    </h3>
                                </div>
                                <div className="flex items-center gap-2">
                                    <select
                                        value={targetSurahFilter || ""}
                                        onChange={(e) => setTargetSurahFilter(e.target.value ? Number(e.target.value) : null)}
                                        className="flex-1 p-2 text-sm bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-amber-500"
                                    >
                                        <option value="">{t.allSurahs}</option>
                                        {availableTargetSurahs.map(sNum => (
                                            <option key={sNum} value={sNum}>{t.surahNames[sNum - 1]}</option>
                                        ))}
                                    </select>
                                    <Filter size={16} className="text-gray-400" />
                                </div>
                            </div>

                            {outside.length === 0 ? (
                                <div className="text-center py-10 text-gray-400 italic">{t.noExternalMutashabihat}</div>
                            ) : (
                                <>
                                    {outside.slice(0, visibleCount).map((item, idx) => (
                                        <MutashabihaCard
                                            key={`${item.mut.id}_out_${idx}`}
                                            item={item}
                                            onNavigateToAyah={onNavigateToAyah}
                                            t={t}
                                        />
                                    ))}
                                    {outside.length > visibleCount && (
                                        <button
                                            onClick={() => setVisibleCount(prev => prev + 15)}
                                            className="w-full py-3 bg-red-50 dark:bg-slate-800 text-red-700 dark:text-red-500 font-bold rounded-xl border border-red-100 dark:border-slate-700 hover:bg-red-100 dark:hover:bg-slate-700 transition-all"
                                        >
                                            {t.showMoreExternal.replace('{count}', Math.min(15, outside.length - visibleCount).toString())}
                                        </button>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

const SimilarAyahCard = React.memo(({ item, onNavigateToAyah, t }: { item: any, onNavigateToAyah?: (s: number, a: number) => void, t: any }) => {
    const { mut, targets } = item;
    return (
        <div id={`mut-ayah-${mut.sourceAyah.surahNumber}-${mut.sourceAyah.ayahNumber}`} className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow overflow-hidden scroll-mt-24">
            <div className="p-4 bg-amber-50/50 dark:bg-slate-800/50 border-b border-gray-100 dark:border-slate-700">
                <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-bold text-amber-700 dark:text-amber-500 bg-amber-100 dark:bg-slate-900 px-2 py-1 rounded">
                        {t.ayahWithPositions.replace('{number}', mut.sourceAyah.ayahNumber.toString()).replace('{count}', targets.length.toString())}
                    </span>
                    <button onClick={() => onNavigateToAyah?.(mut.sourceAyah.surahNumber, mut.sourceAyah.ayahNumber)} className="text-[10px] bg-amber-600 hover:bg-amber-700 text-white px-2 py-0.5 rounded transition-colors">{t.goAction}</button>
                </div>
                <div className="text-right font-quran text-xl leading-loose text-gray-900 dark:text-white">
                    <HighlightingText text={mut.sourceAyah.text} absoluteAyahNumber={mut.sourceAyah.absoluteAyahNumber} referenceText={targets.map(t => t.text)} isInsideSurah={false} t={t} />
                </div>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-slate-700 bg-white dark:bg-slate-900">
                {targets.sort((a, b) => a.ayahNumber - b.ayahNumber).map((target, i) => (
                    <div key={i} id={`mut-ayah-${target.surahNumber}-${target.ayahNumber}`} className="p-4 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors border-b border-gray-50 dark:border-slate-800/50 last:border-0 scroll-mt-24">
                        <div className="flex justify-between items-center mb-2">
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-slate-600 px-2 py-0.5 rounded">
                                    {t.surahNames[target.surahNumber - 1]} : {target.ayahNumber}
                                </span>
                                <span className="text-[10px] px-1.5 py-0.5 rounded text-white bg-blue-500">{t.similarBadge}</span>
                            </div>
                            <button onClick={() => onNavigateToAyah?.(target.surahNumber, target.ayahNumber)} className="text-[10px] bg-amber-600 hover:bg-amber-700 text-white px-2 py-0.5 rounded shadow-sm">{t.goAction}</button>
                        </div>
                        <div className="text-right font-quran text-lg leading-relaxed text-gray-700 dark:text-gray-300">
                            <HighlightingText text={target.text} absoluteAyahNumber={target.absoluteAyahNumber} referenceText={mut.sourceAyah.text} isInsideSurah={false} t={t} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
});

const MutashabihaCard = React.memo(({ item, onNavigateToAyah, t }: {
    item: { mut: Mutashabiha, targets: any[] },
    onNavigateToAyah?: (s: number, a: number) => void,
    t: any
}) => {
    return <SimilarAyahCard item={item} onNavigateToAyah={onNavigateToAyah} t={t} />;
});

const InternalGroupSection = React.memo(({ group, onNavigateToAyah, t }: { group: any, onNavigateToAyah?: (s: number, a: number) => void, t: any }) => {
    const { rule, ruleType, ruleColor, ayahs } = group;
    // Descriptions for color coded rules (START, END, MIDDLE)
    const typeDesc = '';

    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden mb-6 border-r-4" style={{ borderRightColor: ruleColor }}>
            <div className="p-3 bg-gray-50/50 dark:bg-slate-800/30 border-b border-gray-100 dark:border-slate-800 flex flex-col gap-1">
                <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                        <span className="text-xl font-bold" style={{ color: ruleColor }}>*</span>
                        <span className="font-bold text-lg" style={{ color: ruleColor }}>({rule}) :</span>
                    </div>
                    <span className="text-[10px] font-bold text-gray-400 bg-gray-100 dark:bg-slate-800 px-2 py-0.5 rounded uppercase">
                        {t.allPositions.includes('{count}') ? t.allPositions.replace('{count}', ayahs.length.toString()) : `${ayahs.length} ${t.allPositions}`}
                    </span>
                </div>

            </div>
            <div className="divide-y divide-gray-50 dark:divide-slate-800/50">
                {ayahs.map((ayah: any, i: number) => (
                    <div key={i} id={`mut-ayah-${ayah.surahNumber}-${ayah.ayahNumber}`} className="p-3 hover:bg-gray-50 dark:hover:bg-slate-800/40 transition-colors scroll-mt-24">
                        <div className="text-right font-quran text-lg leading-loose text-gray-700 dark:text-gray-300">
                            <HighlightingText text={ayah.text} absoluteAyahNumber={ayah.absoluteAyahNumber} onlyRule={rule} referenceText={ayahs.map((a: any) => a.text)} isInsideSurah={true} t={t} />
                            <div className="flex items-center gap-1 mt-1 justify-end">
                                <button onClick={() => onNavigateToAyah?.(ayah.surahNumber, ayah.ayahNumber)} className="text-[10px] bg-slate-200 dark:bg-slate-700 hover:bg-amber-100 dark:hover:bg-amber-900/40 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded">{t.goAction}</button>
                                <span className="inline-flex text-sm font-bold text-amber-600 dark:text-amber-500 bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded-full border border-amber-100 dark:border-amber-900/30 whitespace-nowrap">({ayah.ayahNumber})</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
});
