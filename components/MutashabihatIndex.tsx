import React, { useState, useEffect, useMemo } from 'react';
import { X, Search, ChevronRight, ChevronLeft, Filter, BookOpen, AlertCircle, Bookmark } from 'lucide-react';
import clsx from 'clsx';
import { Mutashabiha, Surah } from '../types';
import { SURAHS } from '../constants/surahData';
import { MUTASHABIHAT_DATA_FULL, AYAH_RULE_MAP } from '../constants/mutashabihatData';
import { getAyahText } from '../utils/ayahTextHelper';

import { getMatchingWords } from '../utils/similarityCalculator';

// Temporary reuse of HighlightedText logic if not exported separately.
// Ideally HighlightedText should be its own component file.
// For now, I will inline a version of it here or refactor later.
// Let's create a local version to ensure stability.

function HighlightingText({ text, absoluteAyahNumber, rules: manualRules, onlyRule }: { text: string, absoluteAyahNumber?: number, rules?: any[], onlyRule?: string }) {
    if (!text) return <span className="text-gray-800 dark:text-gray-200">{text}</span>;

    const normalize = (t: string) => {
        return t.replace(/[\u064B-\u065F\u06D6-\u06DC\u06DE-\u06E8\u06EA-\u06ED]/g, "");
    };

    // Get all rules for this ayah from the global map PLUS any manual rules passed
    const autoRules = absoluteAyahNumber ? (AYAH_RULE_MAP.get(absoluteAyahNumber) || []) : [];
    let allRules = [...autoRules];

    // Filter by specific rule if requested
    if (onlyRule) {
        allRules = allRules.filter(r => r.rule === onlyRule);
    }

    // Add manual rules if not already present
    if (manualRules) {
        manualRules.forEach(mr => {
            if (!allRules.find(r => r.rule === mr.rule)) allRules.push(mr);
        });
    }

    if (allRules.length === 0) return <span className="text-gray-800 dark:text-gray-200 text-right w-full" dir="rtl">{text}</span>;

    const rawWords = text.split(/\s+/).filter(w => w.length > 0);
    // Identify non-word symbols to ignore for position detection
    const isSymbol = (w: string) => normalize(w).length === 0;

    const wordInfos = new Array(rawWords.length).fill(null).map(() => ({ color: '', type: '', isBold: false }));

    // Sort rules: START > END > MIDDLE, then by length (longest first)
    const sortedRules = [...allRules].sort((a, b) => {
        const priority: any = { 'START': 1, 'END': 2, 'MIDDLE': 3, 'OTHER': 4 };
        const pa = priority[a.type] || 5;
        const pb = priority[b.type] || 5;
        if (pa !== pb) return pa - pb;
        return (b.rule?.length || 0) - (a.rule?.length || 0);
    });

    // Phrase-based matching
    sortedRules.forEach(rule => {
        if (!rule.rule) return;
        const ruleNormalized = normalize(rule.rule);
        const ruleWords = ruleNormalized.trim().split(/\s+/);
        if (ruleWords.length === 0) return;

        const colors = {
            'START': '#10b981', // Green
            'END': '#ef4444',   // Red
            'MIDDLE': '#3b82f6', // Blue
            'OTHER': '#d97706'  // Amber
        };

        for (let i = 0; i <= rawWords.length - ruleWords.length; i++) {
            let match = true;
            for (let j = 0; j < ruleWords.length; j++) {
                if (normalize(rawWords[i + j]) !== ruleWords[j]) {
                    match = false;
                    break;
                }
            }
            if (match) {
                // Smart Type Detection based on position in this specific ayah text
                // Check if index 'i' is effectively the start (ignoring preceding symbols)
                let isStart = true;
                for (let k = 0; k < i; k++) {
                    if (!isSymbol(rawWords[k])) {
                        isStart = false;
                        break;
                    }
                }

                // Check if it's effectively the end
                let isEnd = true;
                for (let k = i + ruleWords.length; k < rawWords.length; k++) {
                    if (!isSymbol(rawWords[k])) {
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
                    // Only color if not already colored by a higher-priority rule
                    if (!wordInfos[i + j].color) {
                        wordInfos[i + j].color = effectiveColor;
                        wordInfos[i + j].type = effectiveType;
                        wordInfos[i + j].isBold = true;
                    }
                }
            }
        }
    });

    return (
        <div className="flex flex-wrap gap-x-1 gap-y-1 justify-start text-right w-full" dir="rtl">
            {rawWords.map((word, i) => {
                const info = wordInfos[i];
                return (
                    <span
                        key={i}
                        className={clsx(
                            "rounded px-0.5 transition-colors duration-300",
                            info.isBold ? "font-bold" : "opacity-90"
                        )}
                        style={{
                            color: info.color ? info.color : 'currentColor',
                            backgroundColor: info.color ? `${info.color}20` : 'transparent',
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
}

export default function MutashabihatIndex({
    isOpen, onClose, mutashabihatData, isDarkMode
}: MutashabihatIndexProps) {
    const [selectedSurahId, setSelectedSurahId] = useState<number>(1);
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

    // Split into Inside/Outside Surah
    const { inside, outside } = useMemo(() => {
        const insideGroup: { mut: Mutashabiha, targets: any[] }[] = [];
        const outsideGroup: { mut: Mutashabiha, targets: any[] }[] = [];

        const lowerQuery = searchQuery.toLowerCase().trim();

        enrichedMutashabihat.forEach(mut => {
            const sourceMatch = mut.sourceAyah.text?.toLowerCase().includes(lowerQuery);
            const sourceAyahNumMatch = mut.sourceAyah.ayahNumber.toString() === lowerQuery;

            const insideTargets = mut.similarAyahs.filter(s => {
                const targetMatch = s.text?.toLowerCase().includes(lowerQuery) ||
                    s.rule?.toLowerCase().includes(lowerQuery) ||
                    s.ayahNumber.toString() === lowerQuery;
                return s.surahNumber === selectedSurahId && (lowerQuery === "" || targetMatch || sourceMatch || sourceAyahNumMatch);
            });

            const outsideTargets = mut.similarAyahs.filter(s => {
                const surahNameMatch = SURAHS.find(surah => surah.number === s.surahNumber)?.name.includes(lowerQuery);
                const targetMatch = s.text?.toLowerCase().includes(lowerQuery) ||
                    s.rule?.toLowerCase().includes(lowerQuery) ||
                    s.ayahNumber.toString() === lowerQuery ||
                    surahNameMatch;
                return s.surahNumber !== selectedSurahId && (lowerQuery === "" || targetMatch || sourceMatch || sourceAyahNumMatch);
            });

            if (insideTargets.length > 0) {
                insideGroup.push({ mut, targets: insideTargets });
            }
            if (outsideTargets.length > 0) {
                outsideGroup.push({ mut, targets: outsideTargets });
            }
        });

        return { inside: insideGroup, outside: outsideGroup };
    }, [enrichedMutashabihat, selectedSurahId, searchQuery]);

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
                    // Smart Position Detection for the Group Header
                    const textWords = (t.text || "").trim().split(/\s+/).filter(w => w.length > 0);
                    const ruleWords = (t.rule || "").trim().split(/\s+/).filter(w => w.length > 0);

                    let detectedType = t.ruleType || 'OTHER';

                    if (textWords.length > 0 && ruleWords.length > 0) {
                        // Find first occurrence in the target text
                        for (let i = 0; i <= textWords.length - ruleWords.length; i++) {
                            let match = true;
                            for (let j = 0; j < ruleWords.length; j++) {
                                if (textWords[i + j] !== ruleWords[j]) {
                                    match = false;
                                    break;
                                }
                            }
                            if (match) {
                                if (i === 0) detectedType = 'START';
                                else if (i + ruleWords.length === textWords.length) detectedType = 'END';
                                else detectedType = 'MIDDLE';
                                break;
                            }
                        }
                    }

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

                // Add source if it belongs to this rule
                if (mut.sourceAyah.absoluteAyahNumber) {
                    groups[ruleKey].ayahs.set(mut.sourceAyah.absoluteAyahNumber, {
                        ...mut.sourceAyah,
                    });
                }

                // Add target
                if (t.absoluteAyahNumber) {
                    groups[ruleKey].ayahs.set(t.absoluteAyahNumber, {
                        ...t,
                    });
                }
            });
        });

        return Object.values(groups).map(g => ({
            ...g,
            ayahs: Array.from(g.ayahs.values()).sort((a, b) => a.ayahNumber - b.ayahNumber)
        })).sort((a, b) => {
            const ruleA = a.rule || "";
            const ruleB = b.rule || "";

            // Push "الأمر بذكر الله" to the end
            const specialRule = "الأمر بذكر الله";
            if (ruleA === specialRule && ruleB !== specialRule) return 1;
            if (ruleB === specialRule && ruleA !== specialRule) return -1;

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
                        <BookOpen className="text-amber-600" size={24} />
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
                                className="w-full p-2.5 pr-10 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg text-right focus:ring-2 focus:ring-amber-500 outline-none"
                                dir="rtl"
                            />
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
                                <Bookmark className="text-blue-500" size={20} />
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
                                    <InternalGroupSection key={`${group.rule}_${idx}`} group={group} />
                                ))
                            )}
                        </div>

                        {/* Column 2: Outside Surah */}
                        <div className={clsx("space-y-4", { 'hidden md:block': activeTab === 'inside' })}>
                            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-200 dark:border-slate-700">
                                <BookOpen className="text-amber-500" size={20} />
                                <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                                    متشابهات مع سور أخرى
                                    <span className="mr-2 text-sm font-normal text-gray-500 bg-gray-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                                        {outside.length}
                                    </span>
                                </h3>
                            </div>

                            {outside.length === 0 ? (
                                <div className="text-center py-10 text-gray-400 italic">لا توجد متشابهات خارجية مسجلة</div>
                            ) : (
                                outside.map((item, idx) => (
                                    <MutashabihaCard key={`${item.mut.id}_out_${idx}`} item={item} />
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function MutashabihaCard({ item }: { item: { mut: Mutashabiha, targets: any[] } }) {
    const { mut, targets } = item;

    // Use the first target text as reference for the source to create highlights, 
    // or use the source itself if needed.
    // Ideally, we highlight matching words between Source and Target.
    // If multiple targets, we might need a combined mask, but let's compare with the first target for now.
    const refText = targets[0]?.text || "";

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
            {/* Source Verse */}
            <div className="p-4 bg-amber-50/50 dark:bg-slate-800/50 border-b border-gray-100 dark:border-slate-700">
                <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-bold text-amber-700 dark:text-amber-500 bg-amber-100 dark:bg-slate-900 px-2 py-1 rounded">
                        آية {mut.sourceAyah.ayahNumber}
                    </span>
                </div>
                <div className="text-right font-quran text-xl leading-loose text-gray-900 dark:text-white">
                    <HighlightingText text={mut.sourceAyah.text} absoluteAyahNumber={mut.sourceAyah.absoluteAyahNumber} />
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

                    // Group after sorting
                    const groups = {
                        'START': [] as typeof enrichedTargets,
                        'END': [] as typeof enrichedTargets,
                        'MIDDLE': [] as typeof enrichedTargets,
                        'FREQ': [] as typeof enrichedTargets,
                        'OTHER': [] as typeof enrichedTargets
                    };

                    enrichedTargets.forEach(t => {
                        const key = t.effectiveRule as keyof typeof groups;
                        if (groups[key]) {
                            groups[key].push(t);
                        } else {
                            groups['OTHER'].push(t);
                        }
                    });

                    const sections = [
                        { key: 'START', labelEn: 'Start', labelAr: 'بداية الآيات' },
                        { key: 'END', labelEn: 'End', labelAr: 'نهاية الآيات' },
                        { key: 'MIDDLE', labelEn: 'Middle', labelAr: 'وسط الآيات' },
                        { key: 'FREQ', labelEn: 'Frequent', labelAr: 'كلمات مكررة' },
                        { key: 'OTHER', labelEn: 'Other', labelAr: 'أخرى' }
                    ];

                    return (
                        <div className="divide-y divide-gray-100 dark:divide-slate-700">
                            {sections.map(section => {
                                const items = groups[section.key as keyof typeof groups];
                                if (items.length === 0) return null;

                                return (
                                    <div key={section.key} className="bg-white dark:bg-slate-900">
                                        <div className="bg-gray-50 dark:bg-slate-800/50 px-4 py-2 flex items-center gap-2 border-b border-gray-100 dark:border-slate-800">
                                            <span className="text-base">
                                                {section.key === 'START' && '🟢'}
                                                {section.key === 'END' && '🔴'}
                                                {section.key === 'MIDDLE' && '🔵'}
                                                {section.key === 'FREQ' && '🔁'}
                                                {section.key === 'OTHER' && '🔸'}
                                            </span>
                                            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">
                                                {section.labelAr}
                                            </span>
                                        </div>
                                        <div>
                                            {items.map((target, i) => (
                                                <div key={i} className="p-4 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors border-b border-gray-50 dark:border-slate-800/50 last:border-0">
                                                    <div className="flex justify-between items-center mb-2">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xs font-bold text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-slate-600 px-2 py-0.5 rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-700">
                                                                {SURAHS.find(s => s.number === target.surahNumber)?.name} : {target.ayahNumber}
                                                            </span>
                                                            {target.similarity && (
                                                                <span
                                                                    className="text-[10px] px-1.5 py-0.5 rounded text-white"
                                                                    style={{ backgroundColor: target.similarity.color }}
                                                                >
                                                                    {target.similarity.label}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="text-right font-quran text-lg leading-relaxed text-gray-700 dark:text-gray-300">
                                                        <HighlightingText text={target.text} absoluteAyahNumber={target.absoluteAyahNumber} />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    );
                })()}
            </div>
        </div>
    );
}

function InternalGroupSection({ group }: { group: any }) {
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
                    <div key={i} className="p-3 hover:bg-gray-50 dark:hover:bg-slate-800/40 transition-colors">
                        <div className="text-right font-quran text-lg leading-loose text-gray-700 dark:text-gray-300">
                            <HighlightingText
                                text={ayah.text}
                                absoluteAyahNumber={ayah.absoluteAyahNumber}
                                onlyRule={rule}
                            />
                            <span className="inline-flex mr-2 text-sm font-bold text-amber-600 dark:text-amber-500 bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded-full border border-amber-100 dark:border-amber-900/30 whitespace-nowrap">
                                ({ayah.ayahNumber})
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
