
/**
 * QPC V2 Page Renderer - Merged Version
 * Combines V2 Data Logic (Correct Line Breaks) with V1 Features (Styling, Interactivity, Masking).
 */

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import clsx from 'clsx';
import { ViewMode, MemorizationRating, VerseBookmark, Mutashabiha } from '../types';
import { Bookmark, WifiOff } from 'lucide-react';
import { STOP_SIGNS } from '../src/generated/stopSigns';
import { SURAHS } from '../constants/surahData'; // Or local SURAH_NAMES if defined there
import SurahFrame from './SurahFrame';
import DecorativePageFrame from './DecorativePageFrame';
import { PAGE_DIVISIONS } from '../constants/pageDivisions';
import { JUZ_SECTIONS } from '../constants';
import { translations, Language } from '../i18n/translations';
import { getMushafData, saveMushafData } from '../utils/db';
import { findMutashabihatForAyah, findAllMutashabihatForAyah } from '../utils/mutashabihatProcessor';
import { formatNumber } from '../utils/quranUtils';
import { useWordByWordAudio } from '../hooks/useWordByWordAudio';

// --- Constants ---
const CENTERED_SURAHS = new Set([112, 113, 114, 110, 108, 107, 111, 106, 101, 89, 88, 80, 55, 53, 13]);

// SURAH_NAMES moved to and managed by t.surahNames in translations.ts

// --- Types ---

interface WordV2 {
    id: number;
    position: number;
    text_uthmani: string;
    code_v2: string;
    verse_key: string;
    char_type: string; // 'word' or 'end'
}

interface PageV2 {
    page_number: number;
    lines: { [key: string]: WordV2[] };
}

interface MushafDataV2 {
    [key: string]: PageV2;
}

// Adapted Internal Type
interface AdaptedWord {
    id: number; // Unique ID from DF
    surah: number;
    ayah: number;
    word: number; // Position in Ayah (1-based)
    text: string; // V2 Code code
    originalText: string;
    isStop?: boolean;
    isEnd?: boolean;
}

interface Line {
    lineNumber: number;
    lineType: 'surah_name' | 'basmallah' | 'ayah';
    isCentered: boolean;
    words: AdaptedWord[];
    surahNumber?: number; // For Header
}

interface AdaptedPage {
    pageNumber: number;
    lines: Line[];
}

// --- Components ---

interface AyahSeparatorProps {
    ayahNumber: number;
    accentColor: string;
    rating?: 'weak' | 'medium' | 'good' | null;
    deviceType?: 'mobile' | 'tablet' | 'desktop';
    orientation?: 'portrait' | 'landscape';
    language?: string;
    mutashabihatType?: 'none' | 'inside' | 'outside' | 'both';
    onMutashabihatClick?: (e: React.MouseEvent) => void;
}

const AyahSeparator: React.FC<AyahSeparatorProps> = ({
    ayahNumber, accentColor, rating, deviceType = 'desktop', orientation = 'portrait', language = 'ar',
    mutashabihatType = 'none', onMutashabihatClick
}) => {
    const arabicNumber = formatNumber(ayahNumber, language);
    const digitCount = ayahNumber.toString().length;

    const ratingColors = {
        good: '#22c55e',
        medium: '#eab308',
        weak: '#ef4444'
    };

    const activeColor = rating ? ratingColors[rating] : accentColor;
    const fillColor = rating ? ratingColors[rating] : 'none';
    const isTabletLandscape = deviceType === 'tablet' && orientation === 'landscape';

    return (
        <span translate="no" className="notranslate ayah-separator-container"
            onClick={onMutashabihatClick}
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                width: deviceType === 'mobile' ? '1.5em' : (isTabletLandscape ? '1.45em' : '1.9em'),
                height: deviceType === 'mobile' ? '1.5em' : (isTabletLandscape ? '1.45em' : '1.9em'),
                margin: deviceType === 'mobile' ? '0 2px' : (isTabletLandscape ? '0 3px' : '0 4px'),
                fontSize: deviceType === 'mobile' ? '0.9em' : (isTabletLandscape ? '0.95em' : '1.1em'),
                cursor: onMutashabihatClick ? 'pointer' : 'default'
            }}
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 100 100"
                style={{
                    width: '100%',
                    height: '100%',
                    overflow: 'visible'
                }}
            >
                {rating && (
                    <circle className="ayah-rating-circle" cx="50" cy="50" r="42" fill={fillColor} fillOpacity="0.2" stroke={activeColor} strokeWidth="3" />
                )}

                <g className="ayah-border-group" fill="none" stroke={activeColor} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M50,12 C65,12 85,22 88,48 C91,74 72,88 50,88 C28,88 10,72 12,48 C14,24 35,12 50,12 Z" strokeWidth="3" />
                    <path d="M45,15 C60,13 82,25 85,50 C88,75 70,85 48,85 C26,85 15,75 14,52 C13,29 30,17 45,15" opacity="0.8" strokeWidth="2" />
                    <path d="M55,18 C70,20 80,30 82,52 C84,74 75,82 55,82 C35,82 20,74 22,50 C24,26 40,16 55,18" opacity="0.6" strokeWidth="1.5" />
                </g>
                <text
                    className="ayah-text"
                    x="50"
                    y="55"
                    fill={activeColor}
                    fontSize={digitCount >= 3 ? '32' : digitCount >= 2 ? '38' : '44'}
                    fontFamily="'Almarai', sans-serif"
                    fontWeight="700"
                    textAnchor="middle"
                    dominantBaseline="central"
                    style={{ userSelect: 'none' }}
                >
                    {arabicNumber}
                </text>

                {/* Mutashabihat Indicator Line */}
                {mutashabihatType !== 'none' && (
                    <g className="mutashabihat-line-indicator">
                        {mutashabihatType === 'inside' && (
                            <line x1="20" y1="96" x2="80" y2="96" stroke="#22c55e" strokeWidth="6" strokeLinecap="round" />
                        )}
                        {mutashabihatType === 'outside' && (
                            <line x1="20" y1="96" x2="80" y2="96" stroke="#ef4444" strokeWidth="6" strokeLinecap="round" />
                        )}
                        {mutashabihatType === 'both' && (
                            <>
                                <line x1="20" y1="96" x2="50" y2="96" stroke="#22c55e" strokeWidth="6" strokeLinecap="round" />
                                <line x1="50" y1="96" x2="80" y2="96" stroke="#ef4444" strokeWidth="6" strokeLinecap="round" />
                            </>
                        )}
                    </g>
                )}
            </svg>
        </span>
    );
};

// --- Props ---

interface QPCV2PageRendererProps {
    pageNumber: number;
    fontSize?: 'small' | 'medium' | 'large';
    isDarkMode?: boolean;
    className?: string;
    mode?: ViewMode;
    toggleState?: number;
    memorizationRatings?: MemorizationRating[];
    surahRatings?: { surahNumber: number; rating: 'weak' | 'medium' | 'good'; isUnified?: boolean }[];
    verseBookmarks?: VerseBookmark[];
    onRateAyah?: (surahNumber: number, ayahNumber: number, rating: 'weak' | 'medium' | 'good' | null) => void;
    onRateSurah?: (surahNumber: number) => void;
    colorStopSigns?: boolean;
    accentColor?: string;
    highlightedAyah?: { surah: number, ayah: number } | null;
    isPrayerMode?: boolean;
    language?: string;
    mutashabihatData?: Mutashabiha[];
    onOpenMutashabihat?: (mutOrSurah: Mutashabiha | number, ayah?: number) => void;
    onDeleteSimilarAyah?: (mutashabihaId: string, surahNumber: number, ayahNumber: number) => void;
    onAddSimilarAyah?: (mutashabihaId: string, isInsideSurah: boolean) => void;
    showMutashabihatIndicators?: boolean;
    enableWordLongPressAudio?: boolean;
}

const QPCV2PageRenderer: React.FC<QPCV2PageRendererProps> = ({
    pageNumber,
    fontSize = 'medium',
    isDarkMode = false,
    className,
    mode = ViewMode.SHOW_ALL,
    toggleState = 0,
    memorizationRatings = [],
    surahRatings = [],
    verseBookmarks = [],
    onRateAyah,
    onRateSurah,
    colorStopSigns = true,
    accentColor = '#B45309',
    highlightedAyah,
    isPrayerMode = false,
    language = 'ar',
    mutashabihatData = [],
    onOpenMutashabihat,
    onDeleteSimilarAyah,
    onAddSimilarAyah,
    showMutashabihatIndicators = true,
    enableWordLongPressAudio = true
}) => {
    // Force a local reference to ensure we use the latest prop value in closures
    const audioEnabledRef = useRef<boolean>(enableWordLongPressAudio);
    useEffect(() => {
        audioEnabledRef.current = enableWordLongPressAudio;
    }, [enableWordLongPressAudio]);

    const t = translations[language as Language] || translations.ar;

    // --- State ---
    const [pageData, setPageData] = useState<AdaptedPage | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    // Feature States
    const { activeWord, playWordAudio } = useWordByWordAudio();
    const [revealedIndices, setRevealedIndices] = useState<Set<string>>(new Set());
    const [randomMasks, setRandomMasks] = useState<Set<string>>(new Set());
    const [deviceType, setDeviceType] = useState<'mobile' | 'tablet' | 'desktop'>(() => {
        if (typeof window !== 'undefined') {
            const width = window.innerWidth;
            const isTouch = window.matchMedia('(pointer: coarse)').matches;

            if (isTouch) {
                if (width < 900) return 'mobile';
                return 'tablet';
            } else {
                // Golden Settings Alignment: Desktop starts at > 1366 (approx 1440 in usage)
                // This ensures 1280/1366 screens get Tablet layout (scrollable)
                if (width >= 1367) return 'desktop';
                if (width > 700) return 'tablet';
                return 'mobile';
            }
        }
        return 'desktop';
    });

    const [orientation, setOrientation] = useState<'portrait' | 'landscape'>(() => {
        if (typeof window !== 'undefined') {
            return window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';
        }
        return 'portrait';
    });




    // --- منطق تقييم الحفظ (V1 Logic) ---
    const getAyahRating = (surahNumber: number, ayahNumber: number): 'weak' | 'medium' | 'good' | null => {
        if (!memorizationRatings) return null;
        // Search by surah/ayah properties first (Standard format)
        const ratingObj = memorizationRatings.find((r: any) => r.surah === surahNumber && r.ayah === ayahNumber);
        if (ratingObj) return ratingObj.rating;

        // Fallback: Check ID format if legacy
        const ayahId = `${surahNumber}-${ayahNumber}`;
        const ratingById = memorizationRatings.find(r => r.ayahId === ayahId);
        return ratingById ? ratingById.rating : null;
    };

    const getSurahRating = (surahNumber: number): 'weak' | 'medium' | 'good' | null => {
        if (!surahRatings) return null;
        const rating = surahRatings.find(r => r.surahNumber === surahNumber);
        return rating ? rating.rating : null;
    };

    // Get effective rating: Ayah rating takes priority over Surah rating
    const getEffectiveRating = (surahNumber: number, ayahNumber: number): 'weak' | 'medium' | 'good' | null => {
        const ayahRating = getAyahRating(surahNumber, ayahNumber);
        if (ayahRating) return ayahRating;
        return getSurahRating(surahNumber);
    };

    const handleRateClick = (e: React.MouseEvent, surahNumber: number, ayahNumber: number) => {
        e.stopPropagation(); // Stop propagation to prevent hiding/revealing
        if (!onRateAyah) return;
        onRateAyah(surahNumber, ayahNumber, null);
    };
    const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
    const isLongPressRef = useRef<boolean>(false);
    const pointerStartPosRef = useRef<{ x: number, y: number } | null>(null);

    // --- Device Detection & Resize Handler ---
    useEffect(() => {
        const handleResize = () => {
            // الكشف الدقيق باستخدام Media Queries المتقدمة

            // الموبايل: شاشة صغيرة + لمسي (coarse pointer)
            const isMobile = window.matchMedia(
                '(max-width: 899px) and (hover: none) and (pointer: coarse)'
            ).matches;

            // التابلت: شاشة متوسطة + لمسي (coarse pointer)
            const isTablet = window.matchMedia(
                '(min-width: 900px) and (max-width: 1366px) and (hover: none) and (pointer: coarse)'
            ).matches;

            // الكمبيوتر: ماوس (fine pointer)
            const isDesktop = window.matchMedia(
                '(hover: hover) and (pointer: fine)'
            ).matches;

            // تحديث الاتجاه
            setOrientation(window.innerWidth > window.innerHeight ? 'landscape' : 'portrait');

            // المنطق النهائي مع Fallback للأجهزة الهجينة
            // المنطق النهائي المحسن
            if (isMobile) {
                setDeviceType('mobile');
            } else if (isTablet) {
                setDeviceType('tablet');
            } else if (isDesktop) {
                setDeviceType('desktop');
            } else {
                // Fallback ذكي يعتمد على اللمس
                const width = window.innerWidth;
                const isTouch = window.matchMedia('(pointer: coarse)').matches;

                if (isTouch) {
                    // جهاز لمسي
                    if (width < 900) setDeviceType('mobile');
                    else setDeviceType('tablet');
                } else {
                    // جهاز غير لمسي (ماوس) - Golden Alignment
                    if (width >= 1367) setDeviceType('desktop');
                    else if (width > 700) setDeviceType('tablet');
                    else setDeviceType('mobile');
                }
            }
        };

        window.addEventListener('resize', handleResize);
        // Initial check
        handleResize();

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // --- Data Processing (V2 Logic) ---
    const processPageData = (rawPage: any, pageNum: number, fullMushafData?: MushafDataV2): AdaptedPage => {
        // rawPage is { lines: { "1": [...], "2": [...] } }
        const linesMap = rawPage.lines;
        if (!linesMap) return { pageNumber: pageNum, lines: [] };
        const finalLines: Line[] = [];

        // 1. Identify Surah Starts on this page
        const verseStarts: { [line: number]: number } = {}; // LineIndex -> SurahNumber

        for (let i = 1; i <= 15; i++) {
            const words = linesMap[i.toString()];
            if (!words) continue;

            // Check if any word starts a new surah (Ayah 1, position 1)
            const firstWordOfSurah = words.find(w => {
                const parts = w.verse_key.split(/[:\-_]/);
                // Ensure position is treated as number regardless of JSON type
                return parseInt(parts[1]) === 1 && Number(w.position) === 1;
            });

            if (firstWordOfSurah) {
                const s = parseInt(firstWordOfSurah.verse_key.split(/[:\-_]/)[0]);
                verseStarts[i] = s;
            }
        }

        // 2. Map words into a raw lines cache (pre-assembly)
        // === STRICT SORTING: Surah ASC → Ayah ASC → Position ASC ===
        const rawLinesCache: { [key: number]: AdaptedWord[] } = {};
        for (let i = 1; i <= 15; i++) {
            const wordsV2 = linesMap[i.toString()];
            if (wordsV2 && wordsV2.length > 0) {
                // First, sort the raw words to prevent mixing issues
                const sortedWordsV2 = [...wordsV2].sort((a, b) => {
                    const [surahA, ayahA] = a.verse_key.split(/[:\-_]/).map(Number);
                    const [surahB, ayahB] = b.verse_key.split(/[:\-_]/).map(Number);
                    if (surahA !== surahB) return surahA - surahB;
                    if (ayahA !== ayahB) return ayahA - ayahB;
                    return a.position - b.position;
                });

                rawLinesCache[i] = sortedWordsV2.map(w => {
                    const pts = w.verse_key.split(/[:\-_]/);
                    return {
                        id: w.id,
                        surah: parseInt(pts[0]),
                        ayah: parseInt(pts[1]),
                        word: Number(w.position),
                        text: w.code_v2,
                        originalText: w.text_uthmani,
                        isEnd: w.char_type === 'end'
                    };
                });
            }
        }

        // 3. Final Assembly using Sequential Injection
        // This ensures headers appear even if there's no empty line provided by API
        const surahsInjected = new Set<number>();

        for (let i = 1; i <= 15; i++) {
            const sNum = verseStarts[i];

            if (sNum && !surahsInjected.has(sNum)) {
                // Prepend Headers before the line where the surah starts
                if (sNum === 1 || sNum === 9) {
                    // Tawba or Fatiha: Single line header
                    finalLines.push({ lineNumber: i, lineType: 'surah_name', isCentered: true, words: [], surahNumber: sNum });
                } else {
                    // Standard: Header + Basmallah
                    finalLines.push({ lineNumber: i, lineType: 'surah_name', isCentered: true, words: [], surahNumber: sNum });
                    finalLines.push({ lineNumber: i, lineType: 'basmallah', isCentered: true, words: [], surahNumber: sNum });
                }
                surahsInjected.add(sNum);
            }

            // Append the actual text line if it exists
            if (rawLinesCache[i]) {
                const words = rawLinesCache[i];

                // --- FILTER: Hide V2 Raw Text Headers to avoid duplication ---
                const combinedText = words.map(w => w.originalText || w.text).join(' ');

                // Regex for Surah Name (e.g., "سورة نوح") - loose match
                const isV2SurahHeader = /سورة\s+[\u0600-\u06FF]+/.test(combinedText);

                let shouldSkip = false;

                if (isV2SurahHeader) {
                    // Verify it's not part of an ayah (Ayahs usually satisfy length or have markers)
                    // Header lines are usually short and specific.
                    if (combinedText.length < 50) shouldSkip = true;
                }

                const isV2Basmallah = combinedText.includes('بسم') && combinedText.includes('الله') && combinedText.includes('الرحيم');
                if (isV2Basmallah && !combinedText.includes('إنه من سليمان')) { // Exception for 27:30
                    // Exception for Fatiha (1:1)
                    if (pageNum !== 1) {
                        if (combinedText.length < 50) shouldSkip = true;
                    }
                }

                if (!shouldSkip) {
                    const lineWords = rawLinesCache[i];

                    // --- SMART SURAH BOUNDARY DETECTION ---
                    const currentSurah = lineWords[lineWords.length - 1]?.surah;
                    let nextLineSurah: number | null = null;

                    // Look ahead for next line
                    const nextLine = rawLinesCache[i + 1];
                    if (nextLine && nextLine.length > 0) {
                        nextLineSurah = nextLine[0].surah;
                    }

                    const isShort = lineWords.length < 8;

                    // SMART END-OF-SURAH DETECTION
                    let isLastLineOfSurah = false;
                    if (nextLineSurah !== null) {
                        isLastLineOfSurah = (currentSurah !== nextLineSurah);
                    } else {
                        // Current line is 15 or next lines are empty/missing
                        // We must check if a new surah starts on the next page
                        if (fullMushafData) {
                            const nextPageData = fullMushafData[(pageNum + 1).toString()];
                            const firstLineOfNextPage = nextPageData?.lines ? nextPageData.lines["1"] : null;
                            if (firstLineOfNextPage && firstLineOfNextPage.length > 0) {
                                const nextSurahNum = parseInt(firstLineOfNextPage[0].verse_key.split(/[:\-_]/)[0]);
                                isLastLineOfSurah = (currentSurah !== nextSurahNum);
                            } else {
                                // If page 605+ doesn't exist, it's the end
                                if (pageNum === 604) isLastLineOfSurah = true;
                            }
                        } else {
                            // Fallback if no full data
                            isLastLineOfSurah = (pageNum === 604 && i === 15);
                        }
                    }

                    // Centering Logic - Using global CENTERED_SURAHS (L20)
                    let shouldCenter = (pageNum <= 2);

                    if (pageNum === 604 && (i === 14 || i === 15)) {
                        shouldCenter = true;
                    } else if (currentSurah && CENTERED_SURAHS.has(currentSurah) && isShort && isLastLineOfSurah) {
                        shouldCenter = true;
                    }

                    finalLines.push({
                        lineNumber: i,
                        lineType: 'ayah',
                        isCentered: shouldCenter,
                        words: lineWords
                    });
                }
            }
        }

        return { pageNumber: pageNum, lines: finalLines };
    };

    // --- Synchronous cache update (runs before browser paint) ---
    // When pageNumber changes and data is in cache, update pageData BEFORE the browser paints.
    // This prevents the 3-slide carousel from showing stale content when jumping to center.
    React.useLayoutEffect(() => {
        const cachedRaw = (window as any).qpcV2Cache?.[pageNumber.toString()];
        if (cachedRaw) {
            const fullData = (window as any).qpcV2Cache;
            const processed = processPageData(cachedRaw, pageNumber, fullData);
            setPageData(processed);
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pageNumber]);

    // --- Data & Font Fetching (async, for non-cached pages) ---

    useEffect(() => {
        let isMounted = true;

        const loadContent = async () => {
            const isCached = !!(window as any).qpcV2Cache?.[pageNumber.toString()];
            // If data was already processed by useLayoutEffect, only handle font injection
            if (isCached) {
                // Font injection only — data already set by useLayoutEffect
                const fontName = `p${pageNumber}-v2`;
                const fontPath = `/fonts/v2/p${pageNumber}.woff2`;
                const styleId = `font-v2-p${pageNumber}`;
                if (!document.getElementById(styleId)) {
                    const style = document.createElement('style');
                    style.id = styleId;
                    style.textContent = `@font-face { font-family: '${fontName}'; src: url('${fontPath}') format('woff2'); font-display: swap; }`;
                    document.head.appendChild(style);
                    new FontFace(fontName, `url('${fontPath}')`).load().catch(() => { });
                }
                return; // Skip entire async loading path
            }
            setLoading(true);
            setError(false);

            try {
                // 1. Load Page Data on-demand (only what's needed)
                let rawPage = null;
                let fullData: MushafDataV2 | null = null;

                // Check Memory Cache — process SYNCHRONOUSLY if cached
                if ((window as any).qpcV2Cache && (window as any).qpcV2Cache[pageNumber.toString()]) {
                    fullData = (window as any).qpcV2Cache;
                    rawPage = fullData[pageNumber.toString()];
                    // Process and set immediately so NO stale data flash
                    const processedData = processPageData(rawPage, pageNumber, fullData || undefined);
                    if (isMounted) {
                        setPageData(processedData);
                        setLoading(false);
                    }
                } else {
                    // Try Fetching specific page JSON (Fast: ~40KB)
                    try {
                        const res = await fetch(`/data/v2/pages/${pageNumber}.json`);
                        if (res.ok) {
                            rawPage = await res.json();
                            // Store in memory for immediate use if user returns to this page
                            if (!(window as any).qpcV2Cache) (window as any).qpcV2Cache = {};
                            (window as any).qpcV2Cache[pageNumber.toString()] = rawPage;
                            fullData = (window as any).qpcV2Cache; // Update fullData reference

                            if (!rawPage) {
                                if (isMounted) { setError(true); setLoading(false); }
                                return;
                            }

                            const processedData = processPageData(rawPage, pageNumber, fullData || undefined);
                            if (isMounted) {
                                setPageData(processedData);
                                setLoading(false);
                            }
                        } else {
                            if (isMounted) { setError(true); setLoading(false); }
                        }
                    } catch (err) {
                        console.error("Failed to fetch page data / فشل في تحميل بيانات الصفحة", err);
                        if (isMounted) { setError(true); setLoading(false); }
                    }
                }

                // 2. Inject and Load Font using FontFace API (faster than <style> injection)
                const fontName = `p${pageNumber}-v2`;
                const fontPath = `/fonts/v2/p${pageNumber}.woff2`;
                const styleId = `font-v2-p${pageNumber}`;

                if (!document.getElementById(styleId)) {
                    const style = document.createElement('style');
                    style.id = styleId;
                    style.textContent = `@font-face { font-family: '${fontName}'; src: url('${fontPath}') format('woff2'); font-display: swap; }`;
                    document.head.appendChild(style);
                    // Force immediate font load for current page
                    new FontFace(fontName, `url('${fontPath}')`).load().catch(() => { });
                }

                // 3. Prefetch neighboring pages (JSON data + fonts) in background
                // Use setTimeout to not block current page render
                setTimeout(() => {
                    [pageNumber - 1, pageNumber + 1, pageNumber + 2].forEach(p => {
                        if (p > 0 && p <= 604) {
                            // Prefetch JSON data
                            if (!(window as any).qpcV2Cache?.[p.toString()]) {
                                fetch(`/data/v2/pages/${p}.json`, { priority: 'low' } as any)
                                    .then(r => r.ok ? r.json() : null)
                                    .then(data => {
                                        if (data) {
                                            if (!(window as any).qpcV2Cache) (window as any).qpcV2Cache = {};
                                            (window as any).qpcV2Cache[p.toString()] = data;
                                        }
                                    })
                                    .catch(() => { });
                            }

                            // Prefetch font
                            const neighborStyleId = `font-v2-p${p}`;
                            if (!document.getElementById(neighborStyleId)) {
                                const nStyle = document.createElement('style');
                                nStyle.id = neighborStyleId;
                                nStyle.textContent = `@font-face { font-family: 'p${p}-v2'; src: url('/fonts/v2/p${p}.woff2') format('woff2'); font-display: block; }`;
                                document.head.appendChild(nStyle);
                                new FontFace(`p${p}-v2`, `url('/fonts/v2/p${p}.woff2')`).load().catch(() => { });
                            }
                        }
                    });
                }, 300); // 300ms delay — after current page render

            } catch (err) {
                if (isMounted) {
                    console.error("Load failed:", err);
                    setError(true);
                    setLoading(false);
                }
            }
        };

        loadContent();

        return () => { isMounted = false; };
    }, [pageNumber]);

    // --- Ayah Mapping (from V1) ---
    // Helper to generate IDs
    const getId = (lineIdx: number, wordIdx: number) => `${pageNumber}-${lineIdx}-${wordIdx}`;

    const ayahWordMap = useMemo(() => {
        if (!pageData) return new Map();
        const map = new Map<string, { firstWordId: number, lastWordId: number, revealKeys: string[], stopIndices: number[] }>();
        const tempAyahs = new Map<string, { word: AdaptedWord, key: string }[]>();

        pageData.lines.forEach((line, lineIdx) => {
            line.words.forEach((word, wordIdx) => {
                if (word.surah && word.ayah) {
                    const key = `${word.surah}-${word.ayah}`;
                    if (!tempAyahs.has(key)) tempAyahs.set(key, []);
                    if (!word.isEnd) { // Don't include End markers in hiding logic usually? V1 included numbers.
                        tempAyahs.get(key)!.push({ word, key: getId(lineIdx, wordIdx) });
                    }
                }
            });
        });

        tempAyahs.forEach((items, key) => {
            if (items.length > 0) {
                const sorted = items.sort((a, b) => a.word.id - b.word.id);
                // Calculate Stop Indices for this Ayah using STOP_SIGNS database
                const stopsForAyah = STOP_SIGNS[key] || [];

                const stopIndices = sorted
                    .map((item, idx) => {
                        // Intelligent Detection: Either from generated map or direct glyph length check.
                        // In QPC V2, multi-glyph 'word' entries are virtually always words with attached stop signs.
                        const wordPosIndex = item.word.word - 1;
                        const hasStop = (stopsForAyah && stopsForAyah.includes(wordPosIndex)) || (item.word.text && item.word.text.length > 1);
                        return hasStop ? idx : -1;
                    })
                    .filter(idx => idx !== -1);

                map.set(key, {
                    firstWordId: sorted[0].word.id,
                    lastWordId: sorted[sorted.length - 1].word.id,
                    revealKeys: sorted.map(i => i.key),
                    stopIndices
                });
            }
        });
        return map;
    }, [pageData, pageNumber]);


    // --- Interaction Logic (V1) ---

    // --- Visibility Logic (V1 Port) - Placed after ayahWordMap ---

    // 1. Reset/Load Logic: Load from global cache if available, otherwise reset
    useEffect(() => {
        // Initialize global cache if it doesn't exist
        if (!(window as any).revealedCache) {
            (window as any).revealedCache = {};
        }

        const cacheKey = `${pageNumber}-${mode}-${toggleState}`;
        const cachedSet = (window as any).revealedCache[cacheKey];

        if (cachedSet) {
            setRevealedIndices(new Set(cachedSet));
        } else {
            setRevealedIndices(new Set());
        }
    }, [mode, pageNumber, toggleState]);

    // 1.5. Save to Cache Logic: Update global cache whenever revealed indices change
    useEffect(() => {
        if (!(window as any).revealedCache) return;

        const cacheKey = `${pageNumber}-${mode}-${toggleState}`;
        (window as any).revealedCache[cacheKey] = revealedIndices;
    }, [revealedIndices, pageNumber, mode, toggleState]);

    // 2. Mask Calculation Logic: Updates masks including when ratings change
    useEffect(() => {
        const newMasks = new Set<string>();

        if (!pageData) return;

        if (mode === ViewMode.HIDE_RANDOM_AYAHS) {
            const ayahsOnPage = Array.from(ayahWordMap.keys());
            // 0: Simple Random
            if (toggleState === 0) {
                ayahsOnPage.forEach(ayahKey => {
                    if (Math.random() > 0.5) newMasks.add(ayahKey);
                });
            }
            // 1-4: Memorization Rating Filter
            else {
                ayahsOnPage.forEach(key => {
                    const [s, a] = key.split('-').map(Number);
                    const rating = getAyahRating(s, a);
                    if (toggleState === 1 && rating === 'weak') newMasks.add(key);
                    else if (toggleState === 2 && rating === 'medium') newMasks.add(key);
                    else if (toggleState === 3 && rating === 'good') newMasks.add(key);
                    else if (toggleState === 4 && rating === null) newMasks.add(key);
                });
            }
            setRandomMasks(newMasks);

        } else if (mode === ViewMode.HIDE_RANDOM_WORDS) {
            // toggleState 0: Random
            // toggleState 1: Hide All (Review Mode - Legacy)
            if (toggleState === 1) {
                pageData.lines.forEach((line, lineIdx) => {
                    if (line.lineType === 'ayah') {
                        line.words.forEach((word, wordIdx) => {
                            newMasks.add(getId(lineIdx, wordIdx));
                        });
                    }
                });
            } else {
                pageData.lines.forEach((line, lineIdx) => {
                    if (line.lineType === 'ayah') {
                        line.words.forEach((word, wordIdx) => {
                            const isNumber = /[\u0660-\u0669]/.test(word.text) || word.text.includes('\u06dd');
                            if (isNumber) return;
                            if (Math.random() > 0.5) newMasks.add(getId(lineIdx, wordIdx));
                        });
                    }
                });
            }
            setRandomMasks(newMasks);
        } else {
            setRandomMasks(newMasks);
        }
    }, [mode, pageNumber, toggleState, memorizationRatings, ayahWordMap, pageData]);


    const toggleReveal = useCallback((id: string, surah?: number, ayah?: number) => {
        let idsToReveal: string[] = [id];

        if (surah && ayah && mode === ViewMode.HIDE_ALL_AYAHS) {
            const info = ayahWordMap.get(`${surah}-${ayah}`);
            if (info) {
                const currentState = Number(toggleState);
                if (currentState === 0) {
                    // الزرار الأول (الآيات): يكشف الآية كاملة بضغطة واحدة
                    idsToReveal = info.revealKeys;
                } else if (currentState === 1) {
                    // الزرار الثاني (علامات الوقف): يكشف المقطع الحالي فقط (بين علامتين وقف)
                    const wordIndex = info.revealKeys.indexOf(id);
                    if (wordIndex !== -1) {
                        const stops = info.stopIndices || [];
                        const prevStop = stops.filter((s: number) => s < wordIndex).pop();
                        const start = (prevStop !== undefined) ? prevStop + 1 : 0;
                        const nextStop = stops.find((s: number) => s >= wordIndex);
                        const end = (nextStop !== undefined) ? nextStop : (info.revealKeys.length - 1);
                        idsToReveal = info.revealKeys.slice(start, end + 1);
                    }
                }
            }
        } else if (surah && ayah && mode === ViewMode.HIDE_RANDOM_AYAHS) {
            const info = ayahWordMap.get(`${surah}-${ayah}`);
            if (info) {
                const wordIndex = info.revealKeys.indexOf(id);
                if (wordIndex !== -1) {
                    const stops = info.stopIndices || [];
                    const prevStop = stops.filter((s: number) => s < wordIndex).pop();
                    const start = (prevStop !== undefined) ? prevStop + 1 : 0;
                    const nextStop = stops.find((s: number) => s >= wordIndex);
                    const end = (nextStop !== undefined) ? nextStop : (info.revealKeys.length - 1);
                    idsToReveal = info.revealKeys.slice(start, end + 1);
                } else {
                    idsToReveal = info.revealKeys;
                }
            }
        }
        setRevealedIndices(prev => {
            const next = new Set(prev);
            idsToReveal.forEach(i => next.add(i));
            return next;
        });
    }, [mode, toggleState, ayahWordMap, setRevealedIndices]);

    const isHidden = useCallback((lineIdx: number, wordIdx: number) => {
        const id = getId(lineIdx, wordIdx);
        if (revealedIndices.has(id)) return false;

        const line = pageData?.lines[lineIdx];
        const word = line?.words[wordIdx];
        if (!word) return false;

        switch (mode) {
            case ViewMode.HIDE_ALL_AYAHS:
                return true;
            case ViewMode.HIDE_RANDOM_AYAHS:
                if (word.surah && word.ayah) {
                    const key = `${word.surah}-${word.ayah}`;
                    return randomMasks.has(key);
                }
                return false;
            case ViewMode.HIDE_RANDOM_WORDS:
                return randomMasks.has(id);
            case ViewMode.TOGGLE_FIRST_WORD:
                return toggleState === 0 ? word.word === 1 : word.word !== 1;
            case ViewMode.TOGGLE_LAST_WORD:
                if (word.surah && word.ayah) {
                    const info = ayahWordMap.get(`${word.surah}-${word.ayah}`);
                    if (!info) return false;
                    const isLast = word.id === info.lastWordId;
                    return toggleState === 0 ? isLast : !isLast;
                }
                return false;
            default:
                return false;
        }
    }, [mode, toggleState, pageData, revealedIndices, randomMasks, ayahWordMap, getId]);

    // --- Prefetching Neighbor Pages ---
    useEffect(() => {
        if (loading || error) return;

        const prefetch = async (p: number) => {
            if (p < 1 || p > 604) return;
            if ((window as any).qpcV2Cache && (window as any).qpcV2Cache[p.toString()]) return;

            try {
                const res = await fetch(`/data/v2/pages/${p}.json`);
                if (res.ok) {
                    const data = await res.json();
                    if (!(window as any).qpcV2Cache) (window as any).qpcV2Cache = {};
                    (window as any).qpcV2Cache[p.toString()] = data;
                }
            } catch (e) { /* ignore prefetch errors */ }
        };

        // Prefetch next and prev in background - FASTER for quick swiping
        const timer = setTimeout(() => {
            // High priority neighbors
            prefetch(pageNumber + 1);
            prefetch(pageNumber - 1);
            // Extended neighbors for fast momentum
            prefetch(pageNumber + 2);
            prefetch(pageNumber - 2);
        }, 100); // Only 100ms delay to be ready for fast swipes

        return () => clearTimeout(timer);
    }, [pageNumber, loading, error]);

    // --- Font Injection (V2) ---
    useEffect(() => {
        const fontName = `p${pageNumber}-v2`;
        const fontPath = `/fonts/v2/p${pageNumber}.woff2`;
        const styleId = `font-v2-p${pageNumber}`;
        if (!document.getElementById(styleId)) {
            const style = document.createElement('style');
            style.id = styleId;
            style.textContent = `
                @font-face {
                    font-family: '${fontName}';
                    src: url('${fontPath}') format('woff2');
                    font-display: swap;
                }
            `;
            document.head.appendChild(style);
            new FontFace(fontName, `url('${fontPath}')`).load().catch(() => { });
        }
    }, [pageNumber]);

    // --- Styling Helpers ---
    const containerStyles = useMemo(() => {
        const isTabLandscape = deviceType === 'tablet' && orientation === 'landscape';
        let paddingValue = '10px 5px'; // Minimized side padding
        if (deviceType === 'tablet') {
            paddingValue = orientation === 'portrait' ? '50px 70px' : '10px 15px 120px 15px';
        }
        return {
            width: '100%',
            maxWidth: isTabLandscape ? '1100px' : '800px',
            minHeight: '100dvh',
            padding: paddingValue,
            marginLeft: 'auto',
            marginRight: 'auto',
            display: 'flex',
            flexDirection: 'column' as const,
            boxSizing: 'border-box' as const,
            touchAction: 'pan-y',
            overflowX: 'hidden' as const,
        };
    }, [deviceType, orientation]);

    // Helper to reveal next hidden item (Shared logic for Click and Space key)
    const revealNextHidden = useCallback(() => {
        if (!pageData) return;

        // Iterate through lines and words to find the first one that is hidden
        for (let lineIdx = 0; lineIdx < pageData.lines.length; lineIdx++) {
            const line = pageData.lines[lineIdx];
            if (line.lineType === 'ayah') {
                for (let wordIdx = 0; wordIdx < line.words.length; wordIdx++) {
                    const word = line.words[wordIdx];
                    if (!word.isEnd) { // Don't reveal verse numbers
                        const wordId = getId(lineIdx, wordIdx);

                        // Check if currently hidden
                        const isCurrentlyHidden = isHidden(lineIdx, wordIdx);

                        if (isCurrentlyHidden) {
                            // FOUND IT! Reveal this one and stop.
                            toggleReveal(wordId, word.surah, word.ayah);

                            // Scroll into view if the bottom of the ayah is outside the visible area
                            setTimeout(() => {
                                let targetElement: HTMLElement | null = null;

                                if (word.surah !== undefined && word.ayah !== undefined) {
                                    const allWordsOfAyah = Array.from(document.querySelectorAll(`[data-word-surah="${word.surah}"][data-word-ayah="${word.ayah}"]`)) as HTMLElement[];
                                    if (allWordsOfAyah.length > 0) {
                                        targetElement = allWordsOfAyah[allWordsOfAyah.length - 1];
                                    }
                                }

                                if (targetElement) {
                                    const rect = targetElement.getBoundingClientRect();
                                    const isVisible = (
                                        rect.top >= 0 &&
                                        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight)
                                    );

                                    if (!isVisible) {
                                        targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                    }
                                }
                            }, 50);

                            return;
                        }
                    }
                }
            }
        }
    }, [pageData, isHidden, toggleReveal]);

    const isMobileLandscape = useMemo(() => deviceType === 'mobile' && orientation === 'landscape', [deviceType, orientation]);
    const isTabletLandscape = useMemo(() => deviceType === 'tablet' && orientation === 'landscape', [deviceType, orientation]);

    const fontSizeClass = useMemo(() => {
        if (deviceType === 'desktop') return 'clamp(1.6rem, 2.2vw, 2.22rem)';
        if (deviceType === 'mobile') return isMobileLandscape ? '25px' : 'min(2.8vh, 5.2vw)'; // Maximized font size
        if (deviceType === 'tablet') return isTabletLandscape ? '34px' : '21px';
        return '21px';
    }, [deviceType, isMobileLandscape, isTabletLandscape]);

    // Handle Space Key for Sequential Reveal (Always Active)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.code === 'Space') {
                // Prevent interception if an input field is focused
                const activeElement = document.activeElement;
                const isInput = activeElement?.tagName === 'INPUT' ||
                    activeElement?.tagName === 'TEXTAREA' ||
                    (activeElement as HTMLElement)?.isContentEditable;

                if (isInput) return;

                e.preventDefault(); // Prevent scrolling
                revealNextHidden();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [revealNextHidden]);

    // Line Height
    const lineHeightVal = '1.1'; // Standard QPC V2 Line height

    const fontName = `p${pageNumber}-v2`;

    // --- Renderers ---
    // ... SurahName and Basmallah remain similar ...

    const renderSurahName = (line: Line) => {
        const surahRating = getSurahRating(line.surahNumber || 1);
        const isUnified = surahRatings?.find(r => r.surahNumber === (line.surahNumber || 1))?.isUnified || false;

        return (
            <div className={clsx("w-full flex items-center justify-center", isSpecialPage ? "mb-8 md:mb-12 h-auto" : "h-full")}>
                <SurahFrame
                    surahNumber={line.surahNumber || 1}
                    t={t}
                    language={language}
                    onClick={() => onRateSurah?.(line.surahNumber || 1)}
                    currentRating={surahRating}
                    isUnified={isUnified}
                />
            </div>
        );
    };

    const renderBasmallah = (line: Line, isHighlighted: boolean) => (
        <div
            className={clsx(
                "flex items-center justify-center w-full qpc-basmalah transition-colors duration-500 notranslate",
                isSpecialPage && "mb-4 md:mb-6",
                isHighlighted && "bg-amber-100/60 dark:bg-amber-900/30 rounded-lg p-1"
            )}
            translate="no"
            style={{
                height: isSpecialPage ? (deviceType === 'desktop' ? '1.9em' : '2.8em') : '100%',
                marginTop: isSpecialPage ? (deviceType === 'desktop' ? '0' : '0.5rem') : 0,
                marginBottom: isSpecialPage ? (deviceType === 'desktop' ? '0' : '0.5rem') : 0
            }}
        >
            <div
                style={{
                    fontFamily: 'QPC_V2_Basmalah', // Use Page 1 V2 Font
                    fontSize: isSpecialPage ? '1.5rem' : fontSizeClass,
                    direction: 'rtl',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: isSpecialPage ? '0.4em' : '0.15em' // Reduced consistent spacing between words
                }}
                className={clsx(
                    "text-slate-800 dark:text-slate-200 qpc-v2-text",
                    isHighlighted && "text-amber-800 dark:text-amber-400"
                )}
            >
                {/* Split glyphs for consistent spacing: Bism, Allah, ARrahman, ARrahim */}
                <span>ﱁ</span>
                <span>ﱂ</span>
                <span>ﱃ</span>
                <span>ﱄ</span>
            </div>
        </div>
    );

    // Final check: is this page in our global memory cache?
    const isPageInCache = !!(window as any).qpcV2Cache?.[pageNumber.toString()];

    // Only show spinner if we have NO data for this page AND it's not in memory cache.
    // This effectively makes cached pages load INSTANTLY with zero flicker.
    if ((!pageData || pageData.pageNumber !== pageNumber) && !isPageInCache) return (
        <div className="flex flex-col h-full items-center justify-center min-h-[400px]">
            <div className="w-12 h-12 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin mb-4" />
            <p className="text-amber-800/60 dark:text-amber-200/60 text-sm font-bold tracking-widest">{t.loading}</p>
        </div>
    );
    if (error || !pageData) return (
        <div className="flex flex-col h-full items-center justify-center min-h-[400px]">
            <WifiOff size={48} className="text-red-400 mb-4" />
            <p className="text-slate-600 dark:text-slate-400">{t.dataError}</p>
        </div>
    );

    const isSpecialPage = pageNumber === 1 || pageNumber === 2;

    const renderContent = () => (
        <div
            data-device-type={deviceType}
            data-orientation={orientation}
            translate="no"
            className={clsx(
                "mushaf-page-qpc w-full mx-auto flex flex-col justify-between p-2 shadow-lg my-4 rounded-sm relative notranslate",
                isSpecialPage && "special-page-frame",
                className
            )}
            style={{
                ...containerStyles,
                backgroundColor: 'var(--bg-primary)',
                color: 'var(--text-primary)',
                // Apply "Book" constraint
                aspectRatio: (deviceType === 'desktop' && !isSpecialPage) ? '0.65' : undefined
            }}
        >
            {/* الترويسة العلوية لنسخة الكمبيوتر */}
            {deviceType === 'desktop' && (
                <div
                    className="page-header mb-4 pb-4 border-b border-amber-200/40 dark:border-amber-800/40"
                    style={{
                        fontFamily: "'Almarai', sans-serif",
                        fontSize: '0.85rem',
                        color: accentColor,
                        display: 'grid',
                        gridTemplateColumns: '1fr auto 1fr',
                        alignItems: 'center',
                        width: '100%',
                        padding: '0.25rem 10px',
                        backgroundColor: 'var(--bg-primary)',
                        textAlign: 'center'
                    }}
                >
                    {(() => {
                        const currentSurahNum = (() => {
                            const header = pageData.lines.find(l => l.surahNumber);
                            if (header && header.surahNumber) return header.surahNumber;
                            for (const line of pageData.lines) {
                                if (line.words && line.words.length > 0) {
                                    const firstS = line.words.find(w => w.surah)?.surah;
                                    if (firstS) return firstS;
                                }
                            }
                            return 1;
                        })();

                        const sIndex = currentSurahNum - 1;
                        const surahName = t.surahNames[sIndex] || '...';
                        const surahDisplay = language === 'ar' ? `${t.surahPrefix} ${surahName}` : `${surahName} ${t.surah}`;
                        const pageNumDisplay = formatNumber(pageNumber, language);

                        return (
                            <>
                                <span className="text-right whitespace-nowrap overflow-hidden text-ellipsis">
                                    {pageNumber % 2 !== 0 ? pageNumDisplay : surahDisplay}
                                </span>

                                <div className="flex flex-col items-center justify-center gap-0.5 px-4 opacity-90">
                                    {(() => {
                                        const div = PAGE_DIVISIONS[pageNumber];
                                        if (!div) return null;

                                        const juzNum = formatNumber(div.juz, language);
                                        const hizbNum = formatNumber(Math.ceil(div.hizbQuarter / 4), language);
                                        const rubNum = formatNumber((((div.hizbQuarter - 1) % 4) + 1), language);

                                        return (
                                            <div className="flex items-center gap-2 text-[0.75rem] md:text-[0.85rem] whitespace-nowrap">
                                                <span>{t.juz} {juzNum}</span>
                                                <span className="w-1 h-1 rounded-full bg-current opacity-30" />
                                                <span>{t.hizb} {hizbNum}</span>
                                                <span className="w-1 h-1 rounded-full bg-current opacity-30" />
                                                <span>{t.rub} {rubNum}</span>
                                            </div>
                                        );
                                    })()}
                                </div>

                                <span className="text-left whitespace-nowrap overflow-hidden text-ellipsis">
                                    {pageNumber % 2 === 0 ? pageNumDisplay : surahDisplay}
                                </span>
                            </>
                        );
                    })()}
                </div>
            )}

            <div className="quran-lines-container flex-grow flex flex-col justify-between w-full px-[1%]" style={{ direction: 'rtl' }}>
                {pageData.lines.map((line, idx) => (
                    <div key={`${idx}-${mode}-${toggleState}`}
                        data-line-type={line.lineType}
                        data-is-centered={line.isCentered}
                        data-word-count={line.words.length}
                        className={clsx(
                            "w-full flex items-center qpc-v2-line",
                            line.isCentered ? "justify-center force-center" : "justify-between"
                        )}
                        style={{
                            flex: isSpecialPage ? '0 1 auto' : 'none',
                            height: isSpecialPage ? 'auto' : 'calc(100% / 15)',
                            minHeight: isSpecialPage ? 'auto' : 'calc(100% / 15)',
                            maxHeight: isSpecialPage ? 'none' : 'calc(100% / 15)',
                            fontFamily: fontName,
                            direction: 'rtl',
                            lineHeight: isSpecialPage ? '1.4' : lineHeightVal,
                            whiteSpace: 'nowrap',
                            flexWrap: 'nowrap',
                            justifyContent: line.isCentered ? 'center' : 'space-between',
                            alignSelf: 'stretch',
                            width: '100%',
                            gap: line.isCentered ? '4px' : '0px'
                        }}
                    >
                        {line.lineType === 'surah_name' && renderSurahName(line)}
                        {line.lineType === 'basmallah' && renderBasmallah(line, highlightedAyah?.ayah === 0 && highlightedAyah?.surah === line.surahNumber)}
                        {line.lineType === 'ayah' && line.words.map((word, wIdx) => {
                            const isHighlighted = highlightedAyah?.surah === word.surah && highlightedAyah?.ayah === word.ayah;
                            const shouldHide = isHidden(idx, wIdx) && !word.isEnd;
                            const wordId = getId(idx, wIdx);

                            return (
                                <React.Fragment key={wIdx}>
                                    <span
                                        data-word-surah={word.surah}
                                        data-word-ayah={word.ayah}
                                        className={clsx(
                                            `qpc-v2-text cursor-pointer transition-colors duration-300 relative`,
                                            isHighlighted && "bg-amber-100 dark:bg-amber-900/40 rounded px-1",
                                            (activeWord?.surah === word.surah && activeWord?.ayah === word.ayah && activeWord?.word === word.word) && "bg-amber-300 dark:bg-amber-700/80 rounded px-1",
                                            shouldHide
                                                ? "text-transparent bg-slate-800 rounded-[4px]"
                                                : "hover:text-amber-600"
                                        )}
                                        style={{
                                            fontSize: isSpecialPage ? '1.5rem' : fontSizeClass,
                                            lineHeight: '1.2',
                                            flexShrink: line.isCentered ? 0 : 1,
                                            color: shouldHide ? 'transparent' : (isDarkMode ? '#f5f5f5' : '#1a1a1a'),
                                        }}
                                        onPointerDown={(e) => {
                                            // Start Long Press Timer
                                            isLongPressRef.current = false;
                                            pointerStartPosRef.current = { x: e.clientX, y: e.clientY };
                                            longPressTimerRef.current = setTimeout(() => {
                                                isLongPressRef.current = true;
                                                // --- LONG PRESS ACTION ---
                                                if (shouldHide) {
                                                    const isHiddenMode =
                                                        (mode === ViewMode.HIDE_RANDOM_WORDS) ||
                                                        (mode === ViewMode.TOGGLE_FIRST_WORD) ||
                                                        (mode === ViewMode.TOGGLE_LAST_WORD);

                                                    if (isHiddenMode) {
                                                        // Reveal sequence up to next stop
                                                        if (word.surah && word.ayah) {
                                                            const info = ayahWordMap.get(`${word.surah}-${word.ayah}`);
                                                            if (info) {
                                                                const currentIdx = info.revealKeys.indexOf(wordId);
                                                                if (currentIdx !== -1) {
                                                                    const stops = info.stopIndices || [];
                                                                    const nextStop = stops.find((s: number) => s >= currentIdx);
                                                                    const end = (nextStop !== undefined) ? nextStop : (info.revealKeys.length - 1);
                                                                    const idsToReveal = info.revealKeys.slice(currentIdx, end + 1);
                                                                    setRevealedIndices(prev => {
                                                                        const next = new Set(prev);
                                                                        idsToReveal.forEach(i => next.add(i));
                                                                        return next;
                                                                    });
                                                                    if (navigator.vibrate) navigator.vibrate(50);
                                                                }
                                                            }
                                                        }
                                                    }
                                                } else {
                                                    // Word is visible -> Long press plays audio
                                                    if (audioEnabledRef.current && word.surah && word.ayah && word.word) {
                                                        playWordAudio(word.surah, word.ayah, word.word);
                                                        if (navigator.vibrate) navigator.vibrate(50);
                                                    }
                                                }
                                            }, 350); // 350ms threshold
                                        }}
                                        onPointerMove={(e) => {
                                            if (pointerStartPosRef.current && longPressTimerRef.current) {
                                                const dx = e.clientX - pointerStartPosRef.current.x;
                                                const dy = e.clientY - pointerStartPosRef.current.y;
                                                const distance = Math.sqrt(dx * dx + dy * dy);
                                                // If moved more than 10px, it's a drag/swipe, not a long press
                                                if (distance > 10) {
                                                    clearTimeout(longPressTimerRef.current);
                                                    longPressTimerRef.current = null;
                                                }
                                            }
                                        }}
                                        onPointerUp={() => {
                                            if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
                                            pointerStartPosRef.current = null;
                                        }}
                                        onPointerLeave={() => {
                                            if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
                                            pointerStartPosRef.current = null;
                                        }}
                                        onClick={(e) => {
                                            // If it was a long press, ignore the click event and prevent bubbling
                                            if (isLongPressRef.current) {
                                                isLongPressRef.current = false;
                                                e.stopPropagation();
                                                return;
                                            }

                                            if (word.isEnd) {
                                                const ak = `${word.surah}-${word.ayah}`;
                                                const isHiddenContext = (mode === ViewMode.HIDE_RANDOM_AYAHS && randomMasks.has(ak));

                                                if (isHiddenContext) {
                                                    const info = ayahWordMap.get(ak);
                                                    if (info && info.revealKeys.length > 0 && !revealedIndices.has(info.revealKeys[0])) {
                                                        e.stopPropagation();
                                                        toggleReveal(wordId, word.surah, word.ayah);
                                                        return;
                                                    }
                                                }
                                                handleRateClick(e, word.surah, word.ayah);
                                            } else if (shouldHide) {
                                                e.stopPropagation();
                                                toggleReveal(wordId, word.surah, word.ayah);
                                            } else {
                                                // Normal short click on a visible word
                                                // Do not play audio here, just let it bubble to toggle menus
                                            }
                                        }}
                                    >
                                        {word.isEnd && word.surah && word.ayah && verseBookmarks?.some(b => b.id === `${pageNumber}-${word.surah}-${word.ayah}`) && (
                                            <div className="absolute left-1/2 -translate-x-1/2 text-amber-500 animate-in zoom-in duration-200 z-10 drop-shadow-sm select-none pointer-events-none" style={{ bottom: '100%', marginBottom: deviceType === 'desktop' ? '-6px' : '-5px' }}>
                                                <Bookmark size={14} fill="currentColor" />
                                            </div>
                                        )}

                                        {word.isEnd ? (
                                            <span
                                                id={word.surah === 1 && word.ayah === 1 ? "tour-ayah-number" : undefined}
                                                className="ayah-number-wrapper"
                                                data-surah={word.surah}
                                                data-ayah={word.ayah}
                                                style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}
                                            >
                                                {(() => {
                                                    let mutType: 'none' | 'inside' | 'outside' | 'both' = 'none';
                                                    if (showMutashabihatIndicators) {
                                                        const allGroups = findAllMutashabihatForAyah(word.surah, word.ayah, mutashabihatData);
                                                        if (allGroups.length > 0) {
                                                            let hasInside = false;
                                                            let hasOutside = false;

                                                            allGroups.forEach(group => {
                                                                // Check the source ayah of the group (if it's not the current verse)
                                                                if (group.sourceAyah.surahNumber !== word.surah || group.sourceAyah.ayahNumber !== word.ayah) {
                                                                    if (group.sourceAyah.surahNumber === word.surah) hasInside = true;
                                                                    else hasOutside = true;
                                                                }

                                                                // Check all target ayahs in the group (excluding the current verse)
                                                                group.similarAyahs.forEach(a => {
                                                                    if (a.surahNumber === word.surah && a.ayahNumber === word.ayah) return;

                                                                    if (a.surahNumber === word.surah) hasInside = true;
                                                                    else hasOutside = true;
                                                                });
                                                            });

                                                            if (hasInside && hasOutside) mutType = 'both';
                                                            else if (hasInside) mutType = 'inside';
                                                            else if (hasOutside) mutType = 'outside';
                                                        }
                                                    }

                                                    return (
                                                        <AyahSeparator
                                                            ayahNumber={word.ayah}
                                                            accentColor={accentColor}
                                                            deviceType={deviceType}
                                                            orientation={orientation}
                                                            rating={getEffectiveRating(word.surah, word.ayah)}
                                                            language={language}
                                                            mutashabihatType={mutType}
                                                            onMutashabihatClick={(e) => {
                                                                // لا تقم بإيقاف الانتشار، دع الحدث يصل للأب ليفتح نافذة الخيارات
                                                            }}
                                                        />
                                                    );
                                                })()}
                                            </span>
                                        ) : (
                                            <span dangerouslySetInnerHTML={{
                                                __html: (() => {
                                                    const text = word.text || '';
                                                    if (shouldHide) return text;

                                                    if (colorStopSigns) {
                                                        const key = `${word.surah}-${word.ayah}`;
                                                        const stops = STOP_SIGNS[key] || [];
                                                        const isStopWord = stops.includes(word.word - 1);

                                                        if (isStopWord && text.length > 0) {
                                                            if (text.length === 1) {
                                                                return `<span style="color: ${accentColor}">${text}</span>`;
                                                            }

                                                            // Hizb/Quarter markers come at the start of the first word
                                                            const isQuarterStart = JUZ_SECTIONS.some(s =>
                                                                s.surahNum === word.surah &&
                                                                s.ayahNum === word.ayah &&
                                                                Number(word.word) === 1
                                                            );

                                                            const isHizbMark = isQuarterStart && Number(word.word) === 1;

                                                            if (isHizbMark) {
                                                                // Start-of-word sign (Hizb marker)
                                                                return `<span style="color: ${accentColor}">${text[0]}</span>${text.slice(1)}`;
                                                            } else {
                                                                // End-of-word sign (Stop signs: Sali, Qali, Jim)
                                                                const base = text.slice(0, -1);
                                                                const sign = text.slice(-1);
                                                                return `${base}<span style="color: ${accentColor}">${sign}</span>`;
                                                            }
                                                        }
                                                    }
                                                    return text;
                                                })()
                                            }} />
                                        )}
                                    </span>
                                    {!isSpecialPage && !line.isCentered && wIdx < line.words.length - 1 && (
                                        <span className="flex-grow" style={{ minWidth: deviceType === 'mobile' ? '1px' : '4px' }} />
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </div>
                ))}
            </div>

            <div
                className="page-footer mt-4 pt-4 border-t border-amber-200/40 dark:border-amber-800/40"
                style={{
                    fontFamily: "'Almarai', sans-serif",
                    fontSize: '0.85rem',
                    color: accentColor,
                    display: 'grid',
                    gridTemplateColumns: '1fr auto 1fr',
                    alignItems: 'center',
                    width: '100%',
                    padding: '0.25rem 10px',
                    position: deviceType === 'desktop' ? 'relative' : 'fixed',
                    bottom: deviceType === 'desktop' ? 'auto' : '0',
                    left: deviceType === 'desktop' ? 'auto' : '0',
                    right: deviceType === 'desktop' ? 'auto' : '0',
                    zIndex: deviceType === 'desktop' ? 'auto' : 50,
                    backgroundColor: 'var(--bg-primary)',
                    textAlign: 'center'
                }}
            >
                {(() => {
                    // Logic to find current surah for footer
                    const currentSurahNum = (() => {
                        const header = pageData.lines.find(l => l.surahNumber);
                        if (header && header.surahNumber) return header.surahNumber;

                        for (const line of pageData.lines) {
                            if (line.words && line.words.length > 0) {
                                const firstS = line.words.find(w => w.surah)?.surah;
                                if (firstS) return firstS;
                            }
                        }
                        return 1;
                    })();

                    const sIndex = currentSurahNum - 1;
                    const surahName = t.surahNames[sIndex] || '...';
                    const surahDisplay = language === 'ar' ? `${t.surahPrefix} ${surahName}` : `${surahName} ${t.surah}`;
                    const pageNumDisplay = formatNumber(pageNumber, language);

                    return (
                        <>
                            <span className="text-right whitespace-nowrap overflow-hidden text-ellipsis">
                                {pageNumber % 2 !== 0 ? pageNumDisplay : surahDisplay}
                            </span>

                            <div className="flex flex-col items-center justify-center gap-0.5 px-4 opacity-90">
                                {(() => {
                                    const div = PAGE_DIVISIONS[pageNumber];
                                    if (!div) return null;

                                    const juzNum = formatNumber(div.juz, language);
                                    const hizbNum = formatNumber(Math.ceil(div.hizbQuarter / 4), language);
                                    const rubNum = formatNumber((((div.hizbQuarter - 1) % 4) + 1), language);

                                    return (
                                        <div className="flex items-center gap-2 text-[0.75rem] md:text-[0.85rem] whitespace-nowrap">
                                            <span>{t.juz} {juzNum}</span>
                                            <span className="w-1 h-1 rounded-full bg-current opacity-30" />
                                            <span>{t.hizb} {hizbNum}</span>
                                            <span className="w-1 h-1 rounded-full bg-current opacity-30" />
                                            <span>{t.rub} {rubNum}</span>
                                        </div>
                                    );
                                })()}
                            </div>

                            <span className="text-left whitespace-nowrap overflow-hidden text-ellipsis">
                                {pageNumber % 2 === 0 ? pageNumDisplay : surahDisplay}
                            </span>
                        </>
                    );
                })()}
            </div>
        </div >
    );

    return renderContent();
};

export default QPCV2PageRenderer;
