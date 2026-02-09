import React, { useState, useEffect, useMemo } from 'react';
import { X, Search, ChevronRight, ChevronLeft, Filter, BookOpen, AlertCircle, Bookmark } from 'lucide-react';
import clsx from 'clsx';
import { Mutashabiha, Surah } from '../types';
import { SURAHS } from '../constants/surahData';
import { MUTASHABIHAT_DATA_FULL, AYAH_RULE_MAP } from '../constants/mutashabihatData';

import { getAyahText } from '../utils/ayahTextHelper';

import { getMatchingWords } from '../utils/similarityCalculator';
import { quranNormalize, quranStripConjunction, quranIsSymbol, findSharedPhrases, getRealWordCount } from '../utils/quranUtils';

function MutashabihatIcon({
    showGreenLine = false,
    showRedLine = false,
    size = "w-10 h-10",
    number = "١"
}: {
    showGreenLine?: boolean,
    showRedLine?: boolean,
    size?: string,
    number?: string
}) {
    const goldColor = "#d97706"; // Premium Gold

    return (
        <div className={clsx("shrink-0", size)}>
            <svg viewBox="0 0 100 110" className="w-full h-full overflow-visible">
                <g fill="none" stroke={goldColor} strokeWidth="4">
                    <path d="M50,12 C65,12 85,22 88,48 C91,74 72,88 50,88 C28,88 10,72 12,48 C14,24 35,12 50,12 Z" />
                </g>
                <text x="50" y="55" fill={goldColor} fontSize="40" fontWeight="bold" textAnchor="middle" dominantBaseline="central">
                    {number}
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

function HighlightingText({ text, absoluteAyahNumber, rules: manualRules, onlyRule, referenceText, isInsideSurah }: {
    text: string,
    absoluteAyahNumber?: number,
    rules?: any[],
    onlyRule?: string,
    referenceText?: string | string[],
    isInsideSurah?: boolean
}) {
    if (!text) return <span className="text-gray-800 dark:text-gray-200">{text}</span>;

    // Get all rules for this ayah from the global map PLUS any manual rules passed
    const autoRules = absoluteAyahNumber ? (AYAH_RULE_MAP.get(absoluteAyahNumber) || []) : [];
    let allRules = [...autoRules];

    // Filter by specific rule if requested - support multi-part rules like "(A / B / C)"
    if (onlyRule) {
        const cleanOnly = onlyRule.replace(/[\(\)]/g, '');
        // Split by /, -, ..., or unicode ellipsis …
        const parts = cleanOnly.split(/\s*[\/\-]\s*|\s*\.\.\.\s*|\s*…\s*/).filter(p => p.length > 0).map(p => quranNormalize(p));

        const originalRules = [...allRules];
        allRules = originalRules.filter(r => {
            const normR = quranNormalize(r.rule);
            return parts.some(p => normR.includes(p) || p.includes(normR));
        });

        // Add the group's title parts as candidates too, especially for single-word variations
        parts.forEach(p => {
            if (p.length >= 2 && !allRules.some(r => quranNormalize(r.rule).includes(p))) {
                allRules.push({
                    rule: p,
                    type: 'MIDDLE', // Default to blue if not matched in map
                    isDynamic: true
                });
            }
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

    // 2. Dynamic Matching
    if (referenceText) {
        const refs = Array.isArray(referenceText) ? referenceText : [referenceText];
        refs.forEach(ref => {
            if (!ref || ref === text) return;
            const shared = findSharedPhrases(text, ref);
            shared.forEach(p => {
                const phraseNorm = quranNormalize(p.phrase);
                // Only add if it's longer or distinct from existing rules, and at least 2 words
                if (getRealWordCount(p.phrase) >= 2 && !filteredRules.some(r => quranNormalize(r.rule).includes(phraseNorm))) {
                    filteredRules.push({
                        rule: p.phrase,
                        type: 'MIDDLE',
                        isDynamic: true
                    });
                }
            });
        });
    }

    if (filteredRules.length === 0) return <span className="text-gray-800 dark:text-gray-200 text-right w-full" dir="rtl">{text}</span>;

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
    const wordInfos = new Array(rawWords.length).fill(null).map(() => ({ color: '', type: '', isBold: false, prefixLen: 0 }));

    // Sort rules: Longest first
    const sortedRules = [...effectivelySplitRules].sort((a, b) => {
        const lenA = a.rule?.length || 0;
        const lenB = b.rule?.length || 0;
        if (lenA !== lenB) return lenB - lenA;
        return 0;
    });

    sortedRules.forEach(rule => {
        if (!rule.rule) return;
        const ruleNormalized = quranNormalize(rule.rule);
        const ruleWords = ruleNormalized.trim().split(/\s+/);

        // Logical condition for single words: Valid only if Inside Surah AND at Start/End
        const isSingleWord = ruleWords.length === 1;

        const colors = {
            'START': '#10b981', // Green
            'END': '#ef4444',   // Red
            'MIDDLE': '#3b82f6', // Blue
            'OTHER': '#d97706'
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

                // Apply single-word restriction: 
                // Color only if isInsideSurah is true AND it's either START or END
                if (isSingleWord) {
                    if (!isInsideSurah || (!isStart && !isEnd)) {
                        return; // Skip coloring
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
        <div className="flex flex-wrap gap-x-1 gap-y-1 justify-start text-right w-full" dir="rtl">
            {rawWords.map((word, i) => {
                const info = wordInfos[i];
                if (!info.color) {
                    return <span key={i} className="rounded px-0.5 opacity-90 text-gray-800 dark:text-gray-200">{word}</span>;
                }

                if (info.prefixLen > 0) {
                    // Split the prefix (conjunction) from the word
                    let splitIdx = info.prefixLen;
                    // Handle tashkeel optionally? quranStripConjunction tells us raw prefix chars.
                    // To be safe, we look at the raw word for the first splitIdx characters.
                    // But wait, tashkeel might be in between. 
                    // Let's use a simpler approach: finding the first letter that matches the stripped body.
                    const prefixPart = word.substring(0, splitIdx);
                    // Check if there is a Fatha/Damma after prefix (like فَـ or وَـ)
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
}

interface MutashabihatIndexProps {
    isOpen: boolean;
    onClose: () => void;
    mutashabihatData: Mutashabiha[];
    isDarkMode?: boolean;
    onNavigateToAyah?: (surahNumber: number, ayahNumber: number) => void;
    initialSurahId?: number;
    initialAyahId?: number;
}

export default function MutashabihatIndex({
    isOpen, onClose, mutashabihatData, isDarkMode, onNavigateToAyah, initialSurahId, initialAyahId
}: MutashabihatIndexProps) {
    const [selectedSurahId, setSelectedSurahId] = useState<number>(1);

    // Sync selectedSurahId with initialSurahId when it changes and index is open
    useEffect(() => {
        if (isOpen && initialSurahId) {
            setSelectedSurahId(initialSurahId);
        }
    }, [isOpen, initialSurahId]);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeTab, setActiveTab] = useState<'inside' | 'outside'>('inside');
    const [enrichedMutashabihat, setEnrichedMutashabihat] = useState<Mutashabiha[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Filter mutashabihat for the selected Surah
    const currentSurahMutashabihat = useMemo(() => {
        return mutashabihatData.filter(m => m.sourceAyah.surahNumber === selectedSurahId);
    }, [mutashabihatData, selectedSurahId]);

    // Load texts dynamically when Surah changes
    useEffect(() => {
        const loadTexts = async () => {
            // Reset state when surah changes to prevent "ghost" data from previous surah
            setEnrichedMutashabihat([]);

            if (currentSurahMutashabihat.length === 0) {
                setIsLoading(false);
                return;
            }

            setIsLoading(true);

            // Collect all unique aya refs needed
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

            // Batch fetch all texts
            const { getAyahTexts } = await import('../utils/ayahTextHelper');
            const textsMap = await getAyahTexts(uniqueRefs);

            // Enrich the data
            const enriched = currentSurahMutashabihat.map(mut => {
                const sourceKey = `${mut.sourceAyah.surahNumber}-${mut.sourceAyah.ayahNumber}`;
                return {
                    ...mut,
                    sourceAyah: {
                        ...mut.sourceAyah,
                        text: mut.sourceAyah.text || textsMap.get(sourceKey) || ''
                    },
                    similarAyahs: mut.similarAyahs.map(sim => ({
                        ...sim,
                        text: sim.text || textsMap.get(`${sim.surahNumber}-${sim.ayahNumber}`) || ''
                    }))
                };
            });

            setEnrichedMutashabihat(enriched);
            setIsLoading(false);
        };

        if (isOpen) {
            loadTexts();
        }
    }, [currentSurahMutashabihat, isOpen]);

    // SCROLLING LOGIC: Scroll to specific Ayah if initialAyahId is provided
    useEffect(() => {
        if (isOpen && !isLoading && initialAyahId && selectedSurahId) {
            // Small timeout to allow rendering to complete
            const timer = setTimeout(() => {
                const elementId = `mut-ayah-${selectedSurahId}-${initialAyahId}`;
                const element = document.getElementById(elementId);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    // Add temporary highlight
                    element.classList.add('ring-4', 'ring-amber-400', 'ring-opacity-50', 'transition-all', 'duration-1000');
                    setTimeout(() => {
                        element.classList.remove('ring-4', 'ring-amber-400', 'ring-opacity-50');
                    }, 2000);
                }
            }, 500); // 500ms delay to ensure heavy list is rendered
            return () => clearTimeout(timer);
        }
    }, [isOpen, isLoading, initialAyahId, selectedSurahId]);

    const [targetSurahFilter, setTargetSurahFilter] = useState<number | null>(null);

    // Reset target filter when main surah changes
    useEffect(() => {
        setTargetSurahFilter(null);
    }, [selectedSurahId]);

    // Split into Inside/Outside Surah
    const { inside, outside, availableTargetSurahs } = useMemo(() => {
        const insideGroup: { mut: Mutashabiha, targets: any[] }[] = [];
        const outsideGroup: { mut: Mutashabiha, targets: any[] }[] = [];
        const targetSurahsSet = new Set<number>();

        const query = searchQuery.trim();
        const normalizedQuery = quranNormalize(query).toLowerCase();

        enrichedMutashabihat.forEach(mut => {
            const normalizedSourceText = quranNormalize(mut.sourceAyah.text || "").toLowerCase();
            const sourceMatch = normalizedSourceText.includes(normalizedQuery);
            const sourceAyahNumMatch = mut.sourceAyah.ayahNumber.toString() === query;

            const insideTargets = mut.similarAyahs.filter(s => {
                const normalizedTargetText = quranNormalize(s.text || "").toLowerCase();
                const normalizedRule = quranNormalize(s.rule || "").toLowerCase();
                const targetMatch = normalizedTargetText.includes(normalizedQuery) ||
                    normalizedRule.includes(normalizedQuery) ||
                    s.ayahNumber.toString() === query;
                return s.surahNumber === selectedSurahId && (normalizedQuery === "" || targetMatch || sourceMatch || sourceAyahNumMatch);
            });

            const outsideTargets = mut.similarAyahs.filter(s => {
                if (s.surahNumber !== selectedSurahId) {
                    targetSurahsSet.add(s.surahNumber);
                }

                // Apply Surah Filter
                if (targetSurahFilter && s.surahNumber !== targetSurahFilter) return false;

                const surahNameMatch = SURAHS.find(surah => surah.number === s.surahNumber)?.name.includes(query);
                const normalizedTargetText = quranNormalize(s.text || "").toLowerCase();
                const normalizedRule = quranNormalize(s.rule || "").toLowerCase();
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
                // Merge if source already exists to avoid repetition in the UI
                const existing = outsideGroup.find(g => g.mut.sourceAyah.absoluteAyahNumber === mut.sourceAyah.absoluteAyahNumber);
                if (existing) {
                    // Add only new targets
                    existing.targets = [...existing.targets, ...outsideTargets.filter(ot => !existing.targets.some(et => et.absoluteAyahNumber === ot.absoluteAyahNumber))];
                } else {
                    outsideGroup.push({ mut, targets: outsideTargets });
                }
            }
        });

        // Sort both by Source Ayah Number
        insideGroup.sort((a, b) => a.mut.sourceAyah.ayahNumber - b.mut.sourceAyah.ayahNumber);
        outsideGroup.sort((a, b) => a.mut.sourceAyah.ayahNumber - b.mut.sourceAyah.ayahNumber);

        return {
            inside: insideGroup,
            outside: outsideGroup,
            availableTargetSurahs: Array.from(targetSurahsSet).sort((a, b) => a - b)
        };
    }, [enrichedMutashabihat, selectedSurahId, searchQuery, targetSurahFilter]);

    // NEW: Group internal mutashabihat by their rule for the "Book" aesthetic
    const groupedInside = useMemo(() => {
        const groups: Record<string, {
            rule: string,
            ruleType: string,
            ruleColor: string,
            ayahs: Map<number, any> // Use map to ensure unique ayahs by absoluteAyahNumber
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
                                // Use the same conjunction stripping and normalization as HighlightingText
                                const normTarget = quranNormalize(targetRawWords[i + j]);
                                const res = quranStripConjunction(normTarget, ruleWords[j]);
                                if (!res.match) {
                                    match = false;
                                    break;
                                }
                            }
                            if (match) {
                                // Replicate the smart position detection from HighlightingText
                                let isStart = true;
                                for (let k = 0; k < i; k++) {
                                    if (!quranIsSymbol(targetRawWords[k])) {
                                        isStart = false;
                                        break;
                                    }
                                }

                                let isEnd = true;
                                for (let k = i + ruleWords.length; k < targetRawWords.length; k++) {
                                    if (!quranIsSymbol(targetRawWords[k])) {
                                        isEnd = false;
                                        break;
                                    }
                                }

                                if (isStart) detectedType = 'START';
                                else if (isEnd) detectedType = 'END';
                                else detectedType = 'MIDDLE';

                                // Priority Logic: If this rule is ALREADY marked as MIDDLE in another ayah of this group, 
                                // keep it MIDDLE to maintain consistency (User's preference).
                                if (groups[ruleKey] && groups[ruleKey].ruleType === 'MIDDLE') {
                                    detectedType = 'MIDDLE';
                                }

                                break;
                            }
                        }
                    }

                    // FILTER: Group rule itself must be at least 1 word
                    if (getRealWordCount(ruleKey) < 1) return;

                    const colors = {
                        'START': '#10b981',
                        'END': '#ef4444',
                        'MIDDLE': '#3b82f6',
                        'OTHER': '#d97706'
                    };

                    groups[ruleKey] = {
                        rule: t.rule || '',
                        ruleType: detectedType,
                        ruleColor: (colors as any)[detectedType] || colors.OTHER,
                        ayahs: new Map()
                    };
                }

                // TRUST THE DATABASE: If the ayah is linked to this rule in the data, add it.
                // We no longer perform strict text-containment check here because some rules
                // are descriptive categories rather than literal phrases.
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

        // Filter out empty groups and calculate sorting scores
        return Object.values(groups).filter(g => g.ayahs.size > 0).map(g => {
            const ayahsList = Array.from(g.ayahs.values()).map(ayah => {
                // Calculate match scores for sorting
                const ruleNormalized = quranNormalize(g.rule);
                const ruleWords = ruleNormalized.trim().split(/\s+/);
                const targetText = ayah.text || "";
                const targetRawWords = targetText.trim().split(/\s+/).filter(w => w.length > 0);

                let headCount = 0;
                let tailCount = 0;
                let midCount = 0;

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

                // Advanced sorting score: Head priority (weight 1.1), but Tail/Mid wins if >= 2*Head
                let priorityScore = headCount * 1.1;
                if ((tailCount + midCount) >= headCount * 2 && (tailCount + midCount) > 0) {
                    priorityScore = (tailCount + midCount);
                }

                return { ...ayah, priorityScore };
            });

            return {
                ...g,
                ayahs: ayahsList.sort((a, b) => a.ayahNumber - b.ayahNumber)
            };
        }).sort((a, b) => {
            // Sort groups by the minimum ayah number found in each group
            const minA = Math.min(...a.ayahs.map((ay: any) => ay.ayahNumber));
            const minB = Math.min(...b.ayahs.map((ay: any) => ay.ayahNumber));

            if (minA !== minB) return minA - minB;

            const ruleA = a.rule || "";
            const ruleB = b.rule || "";
            return ruleA.localeCompare(ruleB, 'ar');
        });
    }, [inside]);

    if (!isOpen) return null;

    const currentSurah = SURAHS.find(s => s.number === selectedSurahId);

    return (
        <div className="fixed inset-0 bg-gray-50 dark:bg-slate-900 z-[110] flex flex-col animate-in fade-in duration-300">
            {/* Header */}
            <div className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 shadow-sm shrink-0">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg">
                        <X className="text-gray-600 dark:text-gray-300" />
                    </button>

                    <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <MutashabihatIcon showGreenLine showRedLine size="w-8 h-8" />
                        فهرس المتشابهات
                    </h1>

                    <div className="w-10" /> {/* Spacer */}
                </div>

                {/* Controls Bar */}
                <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col md:flex-row gap-4 items-center">
                    {/* Surah Selector */}
                    <div className="relative w-full md:w-64">
                        <select
                            value={selectedSurahId}
                            onChange={(e) => setSelectedSurahId(Number(e.target.value))}
                            className="w-full p-2.5 pr-10 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg appearance-none text-right font-medium text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                            dir="rtl"
                        >
                            {SURAHS.map(surah => (
                                <option key={surah.number} value={surah.number}>
                                    {surah.number}. {surah.name} ({surah.ayahCount} آية)
                                </option>
                            ))}
                        </select>
                        <ChevronLeft className="absolute left-3 top-3 text-gray-400 pointer-events-none" size={16} />
                    </div>

                    {/* Stats */}
                    <div className="flex flex-col md:flex-row gap-4 items-center flex-1 w-full">
                        <div className="relative flex-1 w-full">
                            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="بحث في السورة أو المتشابهات..."
                                className="w-full p-2.5 pr-10 pl-10 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg text-right focus:ring-2 focus:ring-amber-500 outline-none"
                                dir="rtl"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery("")}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                                >
                                    <X size={18} />
                                </button>
                            )}
                        </div>
                        <div className="shrink-0 text-sm text-gray-600 dark:text-gray-400">
                            <span className="flex items-center gap-1">
                                <span className="font-bold text-amber-600">{currentSurahMutashabihat.length}</span> موضع للمتشابهات
                            </span>
                        </div>
                    </div>
                </div>

                {/* Tabs (Mobile Only) */}
                <div className="flex md:hidden border-t border-gray-200 dark:border-slate-700">
                    <button
                        onClick={() => setActiveTab('inside')}
                        className={clsx(
                            "flex-1 p-3 text-sm font-medium text-center border-b-2 transition-colors",
                            activeTab === 'inside'
                                ? "border-amber-600 text-amber-600 bg-amber-50 dark:bg-slate-800"
                                : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400"
                        )}
                    >
                        داخل السورة ({inside.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('outside')}
                        className={clsx(
                            "flex-1 p-3 text-sm font-medium text-center border-b-2 transition-colors",
                            activeTab === 'outside'
                                ? "border-amber-600 text-amber-600 bg-amber-50 dark:bg-slate-800"
                                : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400"
                        )}
                    >
                        خارج السورة ({outside.length})
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-hidden relative">
                {isLoading ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm z-10">
                        <div className="flex flex-col items-center gap-3">
                            <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">جاري تحميل النصوص...</span>
                        </div>
                    </div>
                ) : null}

                <div className="h-full overflow-y-auto p-4 md:p-6">
                    <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 items-start">

                        {/* Column 1: Inside Surah */}
                        <div className={clsx("space-y-4", { 'hidden md:block': activeTab === 'outside' })}>
                            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-200 dark:border-slate-700">
                                <MutashabihatIcon showGreenLine size="w-7 h-7" />
                                <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                                    متشابهات داخل سورة {currentSurah?.name}
                                    <span className="mr-2 text-sm font-normal text-gray-500 bg-gray-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                                        {inside.length}
                                    </span>
                                </h3>
                            </div>

                            {groupedInside.length === 0 ? (
                                <div className="text-center py-10 text-gray-400 italic">لا توجد متشابهات داخلية مسجلة</div>
                            ) : (
                                groupedInside.map((group, idx) => (
                                    <InternalGroupSection
                                        key={`${group.rule}_${idx}`}
                                        group={group}
                                        onNavigateToAyah={onNavigateToAyah}
                                    />
                                ))
                            )}
                        </div>

                        {/* Column 2: Outside Surah */}
                        <div className={clsx("space-y-4", { 'hidden md:block': activeTab === 'inside' })}>
                            <div className="flex flex-col gap-2 mb-4 pb-2 border-b border-gray-200 dark:border-slate-700">
                                <div className="flex items-center gap-2">
                                    <MutashabihatIcon showRedLine size="w-7 h-7" />
                                    <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                                        متشابهات مع سور أخرى
                                        <span className="mr-2 text-sm font-normal text-gray-500 bg-gray-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                                            {outside.length}
                                        </span>
                                    </h3>
                                </div>
                                <div className="flex items-center gap-2">
                                    <select
                                        value={targetSurahFilter || ""}
                                        onChange={(e) => setTargetSurahFilter(e.target.value ? Number(e.target.value) : null)}
                                        className="flex-1 p-2 text-sm bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-amber-500"
                                        dir="rtl"
                                    >
                                        <option value="">كل السور</option>
                                        {availableTargetSurahs.map(sNum => (
                                            <option key={sNum} value={sNum}>
                                                {SURAHS.find(s => s.number === sNum)?.name}
                                            </option>
                                        ))}
                                    </select>
                                    <Filter size={16} className="text-gray-400" />
                                </div>
                            </div>

                            {outside.length === 0 ? (
                                <div className="text-center py-10 text-gray-400 italic">لا توجد متشابهات خارجية مسجلة</div>
                            ) : (
                                outside.map((item, idx) => (
                                    <MutashabihaCard
                                        key={`${item.mut.id}_out_${idx}`}
                                        item={item}
                                        onNavigateToAyah={onNavigateToAyah}
                                    />
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function MutashabihaCard({ item, onNavigateToAyah }: { item: { mut: Mutashabiha, targets: any[] }, onNavigateToAyah?: (s: number, a: number) => void }) {
    const { mut, targets } = item;

    // Use the first target text as reference for the source to create highlights, 
    // or use the source itself if needed.
    // Ideally, we highlight matching words between Source and Target.
    // If multiple targets, we might need a combined mask, but let's compare with the first target for now.
    const refText = targets[0]?.text || "";

    return (
        <div
            id={`mut-ayah-${mut.sourceAyah.surahNumber}-${mut.sourceAyah.ayahNumber}`}
            className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow overflow-hidden scroll-mt-24"
        >
            {/* Source Verse */}
            <div className="p-4 bg-amber-50/50 dark:bg-slate-800/50 border-b border-gray-100 dark:border-slate-700">
                <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-bold text-amber-700 dark:text-amber-500 bg-amber-100 dark:bg-slate-900 px-2 py-1 rounded">
                        آية {mut.sourceAyah.ayahNumber}
                        <span className="mx-1 opacity-60">[{targets.length} مواضع]</span>
                    </span>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onNavigateToAyah?.(mut.sourceAyah.surahNumber, mut.sourceAyah.ayahNumber);
                        }}
                        className="text-[10px] bg-amber-600 hover:bg-amber-700 text-white px-2 py-0.5 rounded transition-colors"
                    >
                        اذهب
                    </button>
                </div>
                <div className="text-right font-quran text-xl leading-loose text-gray-900 dark:text-white">
                    <HighlightingText
                        text={mut.sourceAyah.text}
                        absoluteAyahNumber={mut.sourceAyah.absoluteAyahNumber}
                        referenceText={targets.map(t => t.text)}
                        isInsideSurah={false} // Outside section
                    />
                </div>
            </div>

            {/* Target Verses */}
            <div className="divide-y divide-gray-100 dark:divide-slate-700 bg-white dark:bg-slate-900">
                {/* Grouped & Sorted Targets */}
                {(() => {
                    // Assign effective rule to each target using the shared map
                    const enrichedTargets = targets.map(t => {
                        const ruleFromMap = t.absoluteAyahNumber ? AYAH_RULE_MAP.get(t.absoluteAyahNumber) : undefined;

                        // PRIORITY: 1. ruleType (START/END/MIDDLE), 2. rule (phrase), 3. rule from map
                        let eff = (t.ruleType || t.rule || ruleFromMap || 'OTHER');

                        // Validation: If it's the phrase, and ruleType exists as a category, use it.
                        // For the new data, ruleType is already START/END/MIDDLE.
                        if (eff !== 'START' && eff !== 'END' && eff !== 'MIDDLE' && eff !== 'FREQ') {
                            if (t.ruleType) eff = t.ruleType;
                            else eff = 'OTHER';
                        }

                        return { ...t, effectiveRule: eff };
                    });

                    // Sort:  1. By similarity (highest first - exact matches)
                    //  2. Then by rule priority (START > END > MIDDLE > FREQ > OTHER)
                    const rulePriority = { 'START': 1, 'END': 2, 'MIDDLE': 3, 'FREQ': 4, 'OTHER': 5 };
                    enrichedTargets.sort((a, b) => {
                        // Higher similarity first
                        const simA = a.similarity?.percentage || 0;
                        const simB = b.similarity?.percentage || 0;
                        if (simB !== simA) return simB - simA;

                        // Then by rule priority
                        const prioA = rulePriority[a.effectiveRule as keyof typeof rulePriority] || 99;
                        const prioB = rulePriority[b.effectiveRule as keyof typeof rulePriority] || 99;
                        return prioA - prioB;
                    });

                    return (
                        <div className="divide-y divide-gray-100 dark:divide-slate-700">
                            {enrichedTargets.sort((a, b) => a.ayahNumber - b.ayahNumber).map((target, i) => (
                                <div
                                    key={i}
                                    id={`mut-ayah-${target.surahNumber}-${target.ayahNumber}`}
                                    className="p-4 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors border-b border-gray-50 dark:border-slate-800/50 last:border-0 scroll-mt-24"
                                >
                                    <div className="flex justify-between items-center mb-2">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-slate-600 px-2 py-0.5 rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-700">
                                                {SURAHS.find(s => s.number === target.surahNumber)?.name} : {target.ayahNumber}
                                            </span>
                                            <span className="text-[10px] px-1.5 py-0.5 rounded text-white bg-blue-500">
                                                متشابهة
                                            </span>
                                        </div>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onNavigateToAyah?.(target.surahNumber, target.ayahNumber);
                                            }}
                                            className="text-[10px] bg-amber-600 hover:bg-amber-700 text-white px-2 py-0.5 rounded transition-colors shadow-sm active:scale-95"
                                        >
                                            اذهب
                                        </button>
                                    </div>
                                    <div className="text-right font-quran text-lg leading-relaxed text-gray-700 dark:text-gray-300">
                                        <HighlightingText
                                            text={target.text}
                                            absoluteAyahNumber={target.absoluteAyahNumber}
                                            referenceText={mut.sourceAyah.text}
                                            isInsideSurah={false} // Outside section
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    );
                })()}
            </div>
        </div>
    );
}

function InternalGroupSection({ group, onNavigateToAyah }: { group: any, onNavigateToAyah?: (s: number, a: number) => void }) {
    const { rule, ruleType, ruleColor, ayahs } = group;

    const typeDesc = ruleType === 'START' ? 'اللون الأخضر للمتشابه في بداية الآيات' :
        ruleType === 'END' ? 'اللون الأحمر للمتشابه في نهاية الآيات' :
            ruleType === 'MIDDLE' ? 'اللون الأزرق للمتشابه في وسط الآيات' : '';

    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden mb-6 border-r-4" style={{ borderRightColor: ruleColor }}>
            {/* Group Header - Book Style */}
            <div className="p-3 bg-gray-50/50 dark:bg-slate-800/30 border-b border-gray-100 dark:border-slate-800 flex flex-col gap-1" dir="rtl">
                <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                        <span className="text-xl font-bold" style={{ color: ruleColor }}>*</span>
                        <span className="font-bold text-lg" style={{ color: ruleColor }}>
                            ({rule}) :
                        </span>
                    </div>
                    <span className="text-[10px] font-bold text-gray-400 bg-gray-100 dark:bg-slate-800 px-2 py-0.5 rounded uppercase">
                        {ayahs.length} مواضع
                    </span>
                </div>
                {typeDesc && (
                    <div className="text-[10px] font-medium opacity-70 pr-5" style={{ color: ruleColor }}>
                        {typeDesc}
                    </div>
                )}
            </div>

            {/* Ayahs List */}
            <div className="divide-y divide-gray-50 dark:divide-slate-800/50" dir="rtl">
                {ayahs.map((ayah: any, i: number) => (
                    <div
                        key={i}
                        id={`mut-ayah-${ayah.surahNumber}-${ayah.ayahNumber}`}
                        className="p-3 hover:bg-gray-50 dark:hover:bg-slate-800/40 transition-colors scroll-mt-24"
                    >
                        <div className="text-right font-quran text-lg leading-loose text-gray-700 dark:text-gray-300">
                            <HighlightingText
                                text={ayah.text}
                                absoluteAyahNumber={ayah.absoluteAyahNumber}
                                onlyRule={rule}
                                referenceText={ayahs.map((a: any) => a.text)}
                                isInsideSurah={true} // Inside section
                            />
                            <div className="flex items-center gap-1 mt-1 justify-end">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onNavigateToAyah?.(ayah.surahNumber, ayah.ayahNumber);
                                    }}
                                    className="text-[10px] bg-slate-200 dark:bg-slate-700 hover:bg-amber-100 dark:hover:bg-amber-900/40 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded transition-colors"
                                >
                                    اذهب
                                </button>
                                <span className="inline-flex text-sm font-bold text-amber-600 dark:text-amber-500 bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded-full border border-amber-100 dark:border-amber-900/30 whitespace-nowrap">
                                    ({ayah.ayahNumber})
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
