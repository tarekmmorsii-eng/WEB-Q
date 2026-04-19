import React, { useState, useEffect } from 'react';
import { X, Search as SearchIcon, Loader2 } from 'lucide-react';
import clsx from 'clsx';

interface SearchResult {
    page: number;
    surahName: string;
    ayahNumber: number;
    text: string;
    juz: number;
    isSurahResult?: boolean;
}

interface SearchModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectPage: (page: number) => void;
    onSelectResult?: (page: number, surah: number, ayah: number) => void;
    totalPages: number;
    language: string;
    t: any;
}

// Utility to remove Tashkeel (Diacritics) for normalization and standardize letters
const removeTashkeel = (text: string, pure = false) => {
    let normalized = text
        .normalize('NFD') // Decompose characters
        // Remove Tashkeel and Honorifics
        .replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E8\u06EA-\u06ED]/g, "")
        // Normalize Alephs (أ، إ، آ، ٱ -> ا)
        .replace(/[أإآٱ]/g, "ا")
        // Normalize Ya/Aleph Maqsura (ى -> ي)
        .replace(/ى/g, "ي")
        // Normalize Ta Marbuta (ة -> ه)
        .replace(/ة/g, "ه");

    if (pure) return normalized;

    // Advanced: Handle "Li-" prefix (e.g., "Lil-Rahman" -> "Al-Rahman")
    return normalized.replace(/(^|\s)لل/g, "$1ال");
};

// Helper: Highlight search term in text
const HighlightText = ({ text, highlight }: { text: string; highlight: string }) => {
    if (!highlight.trim()) return <>{text}</>;

    const normalizedHighlight = removeTashkeel(highlight);
    if (!normalizedHighlight) return <>{text}</>;

    const normalizedTextArray: { char: string, index: number }[] = [];
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const normalizedChar = removeTashkeel(char, true);
        if (normalizedChar) {
            normalizedTextArray.push({ char: normalizedChar, index: i });
        }
    }

    const normalizedFullText = normalizedTextArray.map(item => item.char).join('');

    const matches: { start: number, end: number }[] = [];
    let pos = 0;
    while (pos < normalizedFullText.length) {
        const idx = normalizedFullText.indexOf(normalizedHighlight, pos);
        if (idx === -1) break;
        matches.push({ start: idx, end: idx + normalizedHighlight.length });
        pos = idx + 1;
    }

    if (matches.length === 0) return <>{text}</>;

    const resultElements: React.ReactNode[] = [];
    let lastOriginalIndex = 0;

    matches.forEach((match, i) => {
        const originalStart = normalizedTextArray[match.start].index;
        let originalEnd = text.length;
        if (match.end < normalizedTextArray.length) {
            originalEnd = normalizedTextArray[match.end].index;
        }

        if (originalStart > lastOriginalIndex) {
            resultElements.push(text.substring(lastOriginalIndex, originalStart));
        }

        resultElements.push(
            <span key={i} className="highlighted-word">
                {text.substring(originalStart, originalEnd)}
            </span>
        );

        lastOriginalIndex = originalEnd;
    });

    if (lastOriginalIndex < text.length) {
        resultElements.push(text.substring(lastOriginalIndex));
    }

    return <>{resultElements}</>;
};

const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose, onSelectPage, onSelectResult, totalPages, language, t }) => {
    const isArabic = language === 'ar';
    const formatNum = (n: number | string) => {
        if (!isArabic) return n.toString();
        return n.toLocaleString('ar-EG');
    };
    const [searchMode, setSearchMode] = useState<'page' | 'text'>('page');
    const [pageInput, setPageInput] = useState('');
    const [textInput, setTextInput] = useState('');
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const [selectedSurah, setSelectedSurah] = useState(1);
    const [ayahInput, setAyahInput] = useState('');
    // State to store the full Quran data in memory
    const [quranData, setQuranData] = useState<any>(null);

    useEffect(() => {
        if (!isOpen) {
            setPageInput('');
            setTextInput('');
            setSearchResults([]);
            setHasSearched(false);
            setAyahInput('');
            setSelectedSurah(1);
        }
    }, [isOpen]);

    // Load Quran data if not already loaded - needed for search and ayah navigation
    useEffect(() => {
        if (isOpen && !quranData) {
            const loadData = async () => {
                try {
                    const response = await fetch('/quran.json');
                    const json = await response.json();
                    if (json.code === 200 && json.data) {
                        setQuranData(json.data);
                    }
                } catch (err) {
                    console.error("Auto-load quran.json failed", err);
                }
            };
            loadData();
        }
    }, [isOpen, quranData]);

    const handlePageSearch = () => {
        const pageNum = parseInt(pageInput, 10);
        if (pageNum >= 1 && pageNum <= totalPages) {
            onSelectPage(pageNum);
            onClose();
        }
    };


    const handleTextSearch = async () => {
        if (!textInput.trim()) return;

        setIsSearching(true);
        setHasSearched(true);
        setSearchResults([]);

        try {
            // Load Quran data locally if not already loaded
            let data = quranData;
            if (!data) {
                try {
                    const response = await fetch('/quran.json');
                    const json = await response.json();
                    if (json.code === 200 && json.data) {
                        data = json.data;
                        setQuranData(data);
                    } else {
                        throw new Error("Invalid Quran data format");
                    }
                } catch (err) {
                    console.error("Failed to load local quran.json", err);
                    // Fallback or error handling
                    setIsSearching(false);
                    return;
                }
            }

            const surahResults: SearchResult[] = [];
            const ayahResults: SearchResult[] = [];

            const searchTerm = textInput.trim();
            const normalizedSearchTerm = removeTashkeel(searchTerm);
            // Remove "سورة" from search term to handle "سورة يوسف" -> "يوسف"
            const searchTermForSurah = normalizedSearchTerm.replace(/^سوره\s+|^سورة\s+/, '').trim();
            const keywords = normalizedSearchTerm.split(/\s+/).filter(k => k.length > 0);

            if (data && data.surahs) {
                data.surahs.forEach((surah: any) => {
                    // 1. Search by Surah Name (Prioritized)
                    const normalizedSurahName = removeTashkeel(surah.name);
                    const normalizedEnglishName = surah.englishName ? surah.englishName.toLowerCase() : "";

                    // Check if exact match or contained, handling the "Surah" prefix removal
                    // We check if Surah Name contains the cleaned term (e.g. "Yusuf" contains "Yusuf")
                    // OR if the cleaned term contains the Surah Name (e.g. "Surah Yusuf" contains "Yusuf" - rare but possible reversely)
                    if (searchTermForSurah.length > 0 && (normalizedSurahName.includes(searchTermForSurah) || normalizedEnglishName.includes(searchTermForSurah))) {
                        // Add the first Ayah of this Surah as a result
                        const firstAyah = surah.ayahs[0];
                        if (firstAyah) {
                            surahResults.push({
                                page: surah.startPage || firstAyah.page,
                                surahName: surah.name,
                                ayahNumber: 0,
                                text: surah.name, // Fixed: duplicate "Surah" removed
                                juz: firstAyah.juz,
                                // @ts-ignore
                                surahNumber: surah.number,
                                isSurahResult: true
                            });
                        }
                    }

                    // 2. Search in Ayahs
                    surah.ayahs.forEach((ayah: any) => {
                        let textToSearch = ayah.text;
                        const isFirstAyah = ayah.numberInSurah === 1;
                        const basmalahPrefix = 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ';

                        // Strip Basmalah for search/display in surahs 2-114 (excluding at-Tawba)
                        if (isFirstAyah && surah.number !== 1 && surah.number !== 9 && textToSearch.includes(basmalahPrefix)) {
                            textToSearch = textToSearch.replace(basmalahPrefix, '').trim();
                        }

                        if (!textToSearch) return;

                        const normalizedAyahText = removeTashkeel(textToSearch);
                        const isMatch = keywords.every(keyword => normalizedAyahText.includes(keyword));

                        if (isMatch) {
                            ayahResults.push({
                                page: ayah.page,
                                surahName: surah.name,
                                ayahNumber: ayah.numberInSurah,
                                text: textToSearch,
                                juz: ayah.juz,
                                // @ts-ignore
                                surahNumber: surah.number
                            });
                        }
                    });
                });
            }

            setSearchResults([...surahResults, ...ayahResults]);
        } catch (error) {
            console.error('Search error:', error);
        } finally {
            setIsSearching(false);
        }
    };

    const handleAyahSearch = () => {
        const ayahNum = parseInt(ayahInput, 10);
        if (isNaN(ayahNum)) return;

        if (quranData && quranData.surahs) {
            const surah = quranData.surahs.find((s: any) => s.number === selectedSurah);
            if (surah) {
                // Check if ayah exists
                const ayah = surah.ayahs.find((a: any) => a.numberInSurah === ayahNum);
                if (ayah) {
                    if (onSelectResult) {
                        onSelectResult(ayah.page, selectedSurah, ayahNum);
                    } else {
                        onSelectPage(ayah.page);
                    }
                    onClose();
                }
            }
        }
    };

    const handleResultClick = (result: SearchResult) => {
        // Use extended result with surahNumber if possible
        const surahNum = (result as any).surahNumber;
        if (onSelectResult && surahNum) {
            onSelectResult(result.page, surahNum, result.ayahNumber);
        } else {
            onSelectPage(result.page);
        }
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
            style={{ fontFamily: "'Almarai', sans-serif" }}
        >
            <div className="bg-[var(--bg-card)] rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden border border-[var(--border-primary)]">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-[var(--border-primary)] bg-[var(--bg-secondary)] shrink-0">
                    <h2 className="text-xl font-bold text-[var(--text-primary)] flex items-center gap-2">
                        <SearchIcon size={20} className="text-amber-600" />
                        {t.search}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-[var(--bg-secondary)] rounded-full transition-colors text-[var(--text-primary)] opacity-50"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">

                    {/* Section 1: Page Search */}
                    <div className="space-y-3">
                        <h3 className="text-base font-bold text-[var(--text-primary)] opacity-70 flex items-center gap-2">
                            <span className="w-1 h-4 bg-amber-500 rounded-full"></span>
                            {t.searchByPage}
                        </h3>
                        <div className="flex gap-2">
                            <input
                                type="number"
                                min="1"
                                max={totalPages}
                                value={pageInput}
                                onChange={(e) => {
                                    const val = parseInt(e.target.value, 10);
                                    if (isNaN(val)) {
                                        setPageInput('');
                                    } else {
                                        setPageInput(Math.min(val, totalPages).toString());
                                    }
                                }}
                                onKeyDown={(e) => {
                                    e.stopPropagation();
                                    if (e.key === 'Enter') handlePageSearch();
                                }}
                                className="flex-1 px-4 py-3 border border-[var(--border-primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 bg-[var(--bg-card)] text-[var(--text-primary)] text-lg placeholder-[var(--text-primary)] placeholder-opacity-40 transition-all font-sans"
                                placeholder={t.enterPageNumber.replace('{max}', formatNum(totalPages).toString())}
                            />
                            <button
                                onClick={handlePageSearch}
                                disabled={!pageInput}
                                className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all font-bold text-lg shadow-sm active:scale-95"
                            >
                                {t.go}
                            </button>
                        </div>
                    </div>

                    {/* Divider */}
                    <hr className="border-t border-[var(--border-primary)] my-2" />

                    {/* Section 1.5: Ayah Search */}
                    <div className="space-y-3">
                        <h3 className="text-base font-bold text-[var(--text-primary)] opacity-70 flex items-center gap-2">
                            <span className="w-1 h-4 bg-amber-500 rounded-full"></span>
                            {t.searchByAyah}
                        </h3>
                        <div className="flex flex-col gap-3">
                            <select
                                value={selectedSurah}
                                onChange={(e) => {
                                    setSelectedSurah(parseInt(e.target.value, 10));
                                    setAyahInput(''); // Reset ayah input when surah changes
                                }}
                                className="w-full px-4 py-3 border border-[var(--border-primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 bg-[var(--bg-card)] text-[var(--text-primary)] text-lg transition-all"
                                dir="rtl"
                            >
                                {t.surahNames.map((name: string, index: number) => (
                                    <option key={index + 1} value={index + 1}>
                                        {formatNum(index + 1)}. {name}
                                    </option>
                                ))}
                            </select>
                            {(() => {
                                const currentSurah = quranData?.surahs?.find((s: any) => s.number === selectedSurah);
                                const maxAyahs = currentSurah?.ayahs?.length || 0;
                                return (
                                    <div className="flex gap-2">
                                        <input
                                            type="number"
                                            min="1"
                                            max={maxAyahs}
                                            value={ayahInput}
                                            onChange={(e) => {
                                                const val = parseInt(e.target.value, 10);
                                                if (isNaN(val)) {
                                                    setAyahInput('');
                                                } else {
                                                    setAyahInput(Math.min(val, maxAyahs).toString());
                                                }
                                            }}
                                            onKeyDown={(e) => {
                                                e.stopPropagation();
                                                if (e.key === 'Enter') handleAyahSearch();
                                            }}
                                            className="flex-1 px-4 py-3 border border-[var(--border-primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 bg-[var(--bg-card)] text-[var(--text-primary)] text-lg placeholder-[var(--text-primary)] placeholder-opacity-40 transition-all font-sans"
                                            placeholder={maxAyahs > 0 ? `${t.verse} (١ - ${formatNum(maxAyahs)})` : t.verse}
                                        />
                                        <button
                                            onClick={handleAyahSearch}
                                            disabled={!ayahInput}
                                            className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all font-bold text-lg shadow-sm active:scale-95"
                                        >
                                            {t.go}
                                        </button>
                                    </div>
                                );
                            })()}
                        </div>
                    </div>

                    {/* Section 2: Word Search */}
                    <div className="space-y-3">
                        <h3 className="text-base font-bold text-[var(--text-primary)] opacity-70 flex items-center gap-2">
                            <span className="w-1 h-4 bg-amber-500 rounded-full"></span>
                            {t.searchByWord}
                        </h3>
                        <div className="space-y-3">
                            <div className="relative">
                                <input
                                    type="text"
                                    value={textInput}
                                    onChange={(e) => {
                                        // Remove any digits (0-9) and Arabic digits (٠-٩) from the input
                                        const cleanValue = e.target.value.replace(/[0-9\u0660-\u0669]/g, '');
                                        setTextInput(cleanValue);
                                    }}
                                    onKeyDown={(e) => {
                                        e.stopPropagation();
                                        if (e.key === 'Enter') handleTextSearch();
                                    }}
                                    className="w-full px-4 py-3 pl-12 border border-[var(--border-primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 bg-[var(--bg-card)] text-[var(--text-primary)] text-lg placeholder-[var(--text-primary)] placeholder-opacity-40 transition-all font-sans"
                                    placeholder={t.searchPlaceholder}
                                    dir="rtl"
                                />
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-primary)] opacity-40">
                                    {isSearching ? <Loader2 className="animate-spin" size={20} /> : <SearchIcon size={20} />}
                                </div>
                            </div>

                            <button
                                onClick={handleTextSearch}
                                disabled={!textInput.trim() || isSearching}
                                className="w-full py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-bold text-lg shadow-sm flex items-center justify-center gap-2 active:scale-[0.98]"
                            >
                                {isSearching ? t.searching : t.search}
                            </button>
                        </div>

                        {/* Search Results */}
                        {hasSearched && !isSearching && (
                            <div className="mt-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <div className="mb-4 text-sm text-[var(--text-primary)] opacity-60 font-bold px-1">
                                    {searchResults.length > 0
                                        ? t.resultsFound.replace('{count}', formatNum(searchResults.length).toString())
                                        : t.noResultsFound}
                                </div>

                                <div className="space-y-3 pb-4">
                                    {searchResults.map((result, index) => (
                                        <div
                                            key={index}
                                            onClick={() => handleResultClick(result)}
                                            className={clsx(
                                                "p-4 rounded-xl cursor-pointer transition-all border group relative overflow-hidden",
                                                result.isSurahResult
                                                    ? "bg-[var(--bg-secondary)] border-amber-200 hover:border-amber-400 shadow-sm"
                                                    : "bg-[var(--bg-card)] border-[var(--border-primary)] hover:border-amber-300 hover:shadow-md"
                                            )}
                                        >
                                            {result.isSurahResult && (
                                                <div className="absolute top-0 left-0 w-1 h-full bg-amber-500"></div>
                                            )}

                                            <div className="flex justify-between items-center mb-3">
                                                <div className={clsx(
                                                    "text-lg font-bold font-sans",
                                                    result.isSurahResult ? "text-amber-700 dark:text-amber-400 text-xl" : "text-[var(--text-primary)]"
                                                )}>
                                                    {result.isSurahResult
                                                        ? result.surahName
                                                        : result.ayahNumber === 0
                                                            ? `${result.surahName} - ${t.basmallah}`
                                                            : `${result.surahName} - ${t.verse} ${formatNum(result.ayahNumber)}`
                                                    }
                                                </div>
                                                <div className="text-xs text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30 px-2.5 py-1 rounded-full font-bold">
                                                    {t.page} {formatNum(result.page)}
                                                </div>
                                            </div>

                                            {!result.isSurahResult && (
                                                <div className="text-right text-[var(--text-primary)] leading-loose text-lg" style={{ fontFamily: 'Amiri' }}>
                                                    <HighlightText text={result.text} highlight={textInput} />
                                                </div>
                                            )}

                                            {/* For Surah Result, maybe show some metadata or just the highlight if matched */}
                                            {result.isSurahResult && (
                                                <div className="text-right text-amber-800/70 dark:text-amber-200/50 text-sm">
                                                    <span className="bg-amber-100 dark:bg-amber-900/40 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-700/50">
                                                        {t.surah} {formatNum((result as any).surahNumber)}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
};

export default SearchModal;
