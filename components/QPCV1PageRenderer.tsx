/**
 * مكون عرض صفحة المصحف باستخدام بيانات QPC V1
 * يعرض الصفحة بـ 15 سطراً ثابتاً مع الخط الرسمي من مجمع الملك فهد
 */

import React, { useState, useEffect, useMemo } from 'react';
import clsx from 'clsx';
import { ViewMode, MemorizationRating, VerseBookmark } from '../types';
import { Bookmark, WifiOff } from 'lucide-react';
import { STOP_SIGNS } from '../src/generated/stopSigns';
import { translations, Language } from '../i18n/translations';

// أنواع البيانات
interface Word {
    id: number;
    surah: number;
    ayah: number;
    word: number;
    text: string;
    location: string;
}

interface Line {
    lineNumber: number;
    lineType: 'surah_name' | 'basmallah' | 'ayah';
    isCentered: boolean;
    words: Word[];
    surahNumber?: number;
}

interface Page {
    pageNumber: number;
    lines: Line[];
}

interface MushafData {
    metadata: {
        name: string;
        totalPages: number;
        linesPerPage: number;
        fontName: string;
    };
    pages: Page[];
}

// أسماء السور (للعرض)
export const SURAH_NAMES: { [key: number]: string } = {
    1: 'الفَاتِحَة', 2: 'البَقَرَة', 3: 'آل عِمرَان', 4: 'النِّسَاء', 5: 'المَائِدَة',
    6: 'الأَنعَام', 7: 'الأَعرَاف', 8: 'الأَنفَال', 9: 'التَّوبَة', 10: 'يُونُس',
    11: 'هُود', 12: 'يُوسُف', 13: 'الرَّعد', 14: 'إِبرَاهِيم', 15: 'الحِجر',
    16: 'النَّحل', 17: 'الإِسرَاء', 18: 'الكَهف', 19: 'مَريَم', 20: 'طه',
    21: 'الأَنبِيَاء', 22: 'الحَجّ', 23: 'المُؤمِنُون', 24: 'النُّور', 25: 'الفُرقَان',
    26: 'الشُّعَرَاء', 27: 'النَّمل', 28: 'القَصَص', 29: 'العَنكَبُوت', 30: 'الرُّوم',
    31: 'لُقمَان', 32: 'السَّجدَة', 33: 'الأَحزَاب', 34: 'سَبَأ', 35: 'فَاطِر',
    36: 'يس', 37: 'الصَّافَّات', 38: 'ص', 39: 'الزُّمَر', 40: 'غَافِر',
    41: 'فُصِّلَت', 42: 'الشُّورَى', 43: 'الزُّخرُف', 44: 'الدُّخَان', 45: 'الجَاثِيَة',
    46: 'الأَحقَاف', 47: 'مُحَمَّد', 48: 'الفَتح', 49: 'الحُجُرَات', 50: 'ق',
    51: 'الذَّارِيَات', 52: 'الطُّور', 53: 'النَّجم', 54: 'القَمَر', 55: 'الرَّحمَٰن',
    56: 'الوَاقِعَة', 57: 'الحَدِيد', 58: 'المُجَادِلَة', 59: 'الحَشر', 60: 'المُمتَحَنَة',
    61: 'الصَّفّ', 62: 'الجُمُعَة', 63: 'المُنَافِقُون', 64: 'التَّغَابُن', 65: 'الطَّلَاق',
    66: 'التَّحرِيم', 67: 'المُلك', 68: 'القَلَم', 69: 'الحَاقَّة', 70: 'المَعَارِج',
    71: 'نُوح', 72: 'الجِنّ', 73: 'المُزَّمِّل', 74: 'المُدَّثِّر', 75: 'القِيَامَة',
    76: 'الإِنسَان', 77: 'المُرسَلَات', 78: 'النَّبَأ', 79: 'النَّازِعَات', 80: 'عَبَسَ',
    81: 'التَّكوِير', 82: 'الاِنفِطَار', 83: 'المُطَفِّفِين', 84: 'الاِنشِقَاق', 85: 'البُرُوج',
    86: 'الطَّارِق', 87: 'الأَعلَى', 88: 'الغَاشِيَة', 89: 'الفَجر', 90: 'البَلَد',
    91: 'الشَّمس', 92: 'اللَّيل', 93: 'الضُّحَى', 94: 'الشَّرح', 95: 'التِّين',
    96: 'العَلَق', 97: 'القَدر', 98: 'البَيِّنَة', 99: 'الزَّلزَلَة', 100: 'العَادِيَات',
    101: 'القَارِعَة', 102: 'التَّكَاثُر', 103: 'العَصر', 104: 'الهُمَزَة', 105: 'الفِيل',
    106: 'قُرَيش', 107: 'المَاعُون', 108: 'الكَوثَر', 109: 'الكَافِرُون', 110: 'النَّصر',
    111: 'المَسَد', 112: 'الإِخلَاص', 113: 'الفَلَق', 114: 'النَّاس'
};

// مكوّن فاصلة الآية (Ayah Separator) - زخرفة SVG مع رقم الآية
interface AyahSeparatorProps {
    ayahNumber: number;
    accentColor: string;
    rating?: 'weak' | 'medium' | 'good' | null;
    deviceType?: 'mobile' | 'tablet' | 'desktop';
    language?: string;
}

const AyahSeparator: React.FC<AyahSeparatorProps> = ({ ayahNumber, accentColor, rating, deviceType = 'desktop', language = 'ar' }) => {
    // تحويل رقم الآية للأرقام العربية الشرقية فقط إذا كانت اللغة عربية
    const arabicNumber = language === 'ar' ? ayahNumber.toLocaleString('ar-EG') : ayahNumber.toString();

    // ضبط حجم الخط بناءً على عدد الخانات
    const digitCount = ayahNumber.toString().length;

    // Rating colors
    const ratingColors = {
        good: '#22c55e',   // green-500
        medium: '#eab308', // yellow-500
        weak: '#ef4444'    // red-500
    };

    const activeColor = rating ? ratingColors[rating] : accentColor;
    const fillColor = rating ? ratingColors[rating] : 'none';

    return (
        <span
            className="ayah-separator-container"
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                width: deviceType === 'mobile' ? '1.3em' : '1.5em',
                height: deviceType === 'mobile' ? '1.3em' : '1.5em',
                verticalAlign: 'middle',
                margin: '0',
                fontSize: deviceType === 'mobile' ? '0.7em' : '0.75em', // Scale down slightly more for mobile
                transform: 'translateY(-0.1em)' // تقليل الرفع ليتوسط السطر بدقة
            }}
        >
            {/* SVG الزخرفة مع الرقم في المنتصف */}
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 100 100"
                style={{
                    width: '100%',
                    height: '100%',
                    overflow: 'visible' // Allow glow
                }}
            >
                {/* Background Fill for Rating */}
                {rating && (
                    <circle cx="50" cy="50" r="42" fill={fillColor} fillOpacity="0.2" stroke={activeColor} strokeWidth="2" />
                )}

                <g fill="none" stroke={activeColor} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M50,12 C65,12 85,22 88,48 C91,74 72,88 50,88 C28,88 10,72 12,48 C14,24 35,12 50,12 Z" strokeWidth="2" />
                    <path d="M45,15 C60,13 82,25 85,50 C88,75 70,85 48,85 C26,85 15,75 14,52 C13,29 30,17 45,15" opacity="0.8" strokeWidth="1.5" />
                    <path d="M55,18 C70,20 80,30 82,52 C84,74 75,82 55,82 C35,82 20,74 22,50 C24,26 40,16 55,18" opacity="0.6" strokeWidth="1" />
                </g>
                {/* رقم الآية - توسيط مع dominant-baseline و text-anchor */}
                <text
                    x="50"
                    y="52"
                    fill={activeColor}
                    fontSize={digitCount >= 3 ? '28' : digitCount >= 2 ? '32' : '36'}
                    fontFamily="'Almarai', sans-serif"
                    fontWeight="700"
                    textAnchor="middle"
                    dominantBaseline="central"
                    style={{ userSelect: 'none' }}
                >
                    {arabicNumber}
                </text>
            </svg>
        </span>
    );
};



interface QPCV1PageRendererProps {
    pageData: Page;
    pageNumber: number;
    fontSize?: 'small' | 'medium' | 'large';
    isDarkMode?: boolean;
    className?: string;
    mode?: ViewMode;
    toggleState?: number;
    memorizationRatings?: MemorizationRating[];
    verseBookmarks?: VerseBookmark[];
    onRateAyah?: (surahNumber: number, ayahNumber: number, rating: 'weak' | 'medium' | 'good' | null) => void;
    colorStopSigns?: boolean;
    accentColor?: string; // لون فواصل الآيات
    highlightedAyah?: { surah: number, ayah: number } | null;
    language?: string;
}

const QPCV1PageRenderer: React.FC<QPCV1PageRendererProps> = ({
    pageData,
    pageNumber,
    fontSize = 'medium',
    isDarkMode = false,
    className,
    mode = ViewMode.SHOW_ALL,
    toggleState = 0,
    memorizationRatings = [],
    verseBookmarks = [],
    onRateAyah,
    colorStopSigns = true,
    accentColor = '#B45309',
    highlightedAyah, // Fix: Add destructuring
    language = 'ar'
}) => {
    const t = translations[language as Language] || translations.ar;

    // حقن الخط الخاص بالصفحة ديناميكياً
    const [fontLoaded, setFontLoaded] = React.useState(false);
    const [fontError, setFontError] = React.useState(false); // New Error State

    useEffect(() => {
        const fontId = `qpc-font-p${pageNumber}`;
        const preloadId = `qpc-preload-p${pageNumber}`;

        // Reset states
        setFontLoaded(true);
        setFontError(false);

        // 1. Dynamic Preload
        let preloadLink = document.getElementById(preloadId) as HTMLLinkElement;
        if (!preloadLink) {
            preloadLink = document.createElement('link');
            preloadLink.id = preloadId;
            preloadLink.rel = 'preload';
            preloadLink.as = 'font';
            preloadLink.type = 'font/woff2';
            preloadLink.crossOrigin = 'anonymous';
            preloadLink.href = `/fonts/p${pageNumber}.woff2`;
            document.head.appendChild(preloadLink);
        }

        // 2. Add font-face style
        if (!document.getElementById(fontId)) {
            const styleEl = document.createElement('style');
            styleEl.id = fontId;
            styleEl.innerHTML = `
                @font-face {
                    font-family: 'QPC_Page_Font_${pageNumber}';
                    src: url('/fonts/p${pageNumber}.woff2') format('woff2');
                    font-display: block; /* Use block to avoid FOUT if font is coming */
                }
                .qpc-font-page-${pageNumber} {
                    font-family: 'QPC_Page_Font_${pageNumber}', Arial, sans-serif !important;
                }
            `;
            document.head.appendChild(styleEl);
        }

        // 3. Robust Font Loading Check
        const font = new FontFace(
            `QPC_Page_Font_${pageNumber}`,
            `url(/fonts/p${pageNumber}.woff2)`
        );

        font.load()
            .then(f => {
                document.fonts.add(f);
                setFontError(false); // Success!
            })
            .catch(() => {
                // Font failed to load. Are we offline?
                if (!navigator.onLine) {
                    // Check if font is actually missing from cache by checking document.fonts
                    const isLoaded = document.fonts.check(`12px QPC_Page_Font_${pageNumber}`);
                    if (!isLoaded) {
                        console.warn(`[Offline] Font p${pageNumber} missing`);
                        setFontError(true); // Trigger Error UI
                    }
                }
            });

        // Cleanup
        return () => {
            // Nothing to clean up anymore
        };
    }, [pageNumber]);

    // 🚀 Prefetch الصفحات المجاورة (التالية والسابقة)
    useEffect(() => {
        const prefetchFont = (targetPage: number) => {
            if (targetPage < 1 || targetPage > 604) return; // حدود المصحف

            const fontId = `qpc-font-p${targetPage}`;
            const preloadId = `qpc-preload-p${targetPage}`;

            // Skip if already loaded
            if (document.getElementById(fontId)) return;

            // Add preload link
            if (!document.getElementById(preloadId)) {
                const preloadLink = document.createElement('link');
                preloadLink.id = preloadId;
                preloadLink.rel = 'prefetch'; // prefetch بدلاً من preload
                preloadLink.as = 'font';
                preloadLink.type = 'font/woff2';
                preloadLink.crossOrigin = 'anonymous';
                preloadLink.href = `/fonts/p${targetPage}.woff2`;
                document.head.appendChild(preloadLink);
            }

            // Load font in background
            const font = new FontFace(
                `QPC_Page_Font_${targetPage}`,
                `url(/fonts/p${targetPage}.woff2)`
            );

            font.load().then(() => {
                // Font already loaded via document.fonts.load
                console.log(`✅ Prefetched font for page ${targetPage}`);
            }).catch(() => {
                console.warn(`⚠️ Failed to prefetch font for page ${targetPage}`);
            });
        };

        // Prefetch الصفحة التالية والسابقة
        const nextPage = pageNumber + 1;
        const prevPage = pageNumber - 1;

        // تأخير بسيط للسماح للصفحة الحالية بالتحميل أولاً
        const prefetchTimer = setTimeout(() => {
            prefetchFont(nextPage);
            prefetchFont(prevPage);
        }, 300); // 300ms بعد تحميل الصفحة الحالية

        return () => {
            clearTimeout(prefetchTimer);
        };
    }, [pageNumber]);

    // حقن خط الصفحة 1 للبسملة (يُحمّل مرة واحدة فقط)
    useEffect(() => {
        const fontId = 'qpc-font-p1-basmallah';
        if (document.getElementById(fontId)) return;

        const styleEl = document.createElement('style');
        styleEl.id = fontId;
        styleEl.innerHTML = `
            @font-face {
                font-family: 'QPC_Page_1';
                src: url('/fonts/p1.woff2') format('woff2');
                font-display: block;
            }
        `;
        document.head.appendChild(styleEl);
    }, []); // Empty dependency array - يُنفّذ مرة واحدة فقط

    // كشف نوع الجهاز باستخدام media queries
    // دالة مساعدة لتحديد نوع الجهاز فوراً
    const getInitialDeviceType = (): 'mobile' | 'tablet' | 'desktop' => {
        if (typeof window === 'undefined') return 'mobile';
        const width = window.innerWidth;
        const userAgent = navigator.userAgent.toLowerCase();
        const isTabletUserAgent = /ipad|tablet|playbook|silk/i.test(userAgent) || (
            /android/i.test(userAgent) && !/mobile/i.test(userAgent)
        );

        if (width > 1280 && !isTabletUserAgent) return 'desktop';
        if (width >= 600 || isTabletUserAgent) return 'tablet';
        return 'mobile';
    };

    // كشف نوع الجهاز فوراً عند التحميل (بدون انتظار useEffect)
    const [deviceType, setDeviceType] = React.useState<'mobile' | 'tablet' | 'desktop'>(getInitialDeviceType);

    useEffect(() => {
        const updateDeviceType = () => {
            setDeviceType(getInitialDeviceType());
        };

        window.addEventListener('resize', updateDeviceType);
        return () => window.removeEventListener('resize', updateDeviceType);
    }, []);

    // اختصار لوحة المفاتيح: المسافة (Space) لكشف الآيات/الكلمات المخفية في وضع الكمبيوتر
    useEffect(() => {
        if (deviceType !== 'desktop') return;

        const handleKeyDown = (e: KeyboardEvent) => {
            // التحقق من مفتاح المسافة
            if (e.code === 'Space' || e.key === ' ') {
                // منع التفعيل إذا كان المستخدم يكتب في مدخل نصي
                const activeElement = document.activeElement;
                const isInput = activeElement?.tagName === 'INPUT' ||
                    activeElement?.tagName === 'TEXTAREA' ||
                    (activeElement as HTMLElement)?.isContentEditable;

                if (isInput) return;

                // البحث عن أول عنصر يحمل حالة 'إخفاء'
                const firstHidden = document.querySelector('.is-hidden-qpc') as HTMLElement;
                if (firstHidden) {
                    e.preventDefault(); // منع السكرول (Critical)
                    firstHidden.click(); // تنفيذ أمر الكشف برمجياً
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [deviceType]);

    // --- تحليل بيانات الصفحة (تحديد بداية ونهاية كل آية) ---
    // هذا مهم جداً لتحديد الكلمة الأولى والأخيرة بدقة بغض النظر عن الأسطر
    // --- Helper for ID generation ---
    const getId = (lineIdx: number, wordIdx?: number) => `${pageNumber}-${lineIdx}-${wordIdx ?? 'all'}`;

    // --- تحليل بيانات الصفحة (تحديد بداية ونهاية كل آية) ---
    const ayahWordMap = useMemo(() => {
        const map = new Map<string, { firstWordId: number, lastWordId: number, wordIds: number[], revealKeys: string[] }>();
        // Store words with their generated revealKey
        const tempAyahs = new Map<string, { word: Word, key: string }[]>();

        pageData.lines.forEach((line, lineIdx) => {
            line.words.forEach((word, wordIdx) => {
                if (word.surah && word.ayah) {
                    const key = `${word.surah}-${word.ayah}`;
                    if (!tempAyahs.has(key)) tempAyahs.set(key, []);

                    const isNumber = /[\u0660-\u0669]/.test(word.text) || word.text.includes('\u06dd');
                    if (!isNumber) {
                        tempAyahs.get(key)!.push({
                            word,
                            key: getId(lineIdx, wordIdx)
                        });
                    }
                }
            });
        });

        tempAyahs.forEach((items, key) => {
            if (items.length > 0) {
                const sorted = items.sort((a, b) => a.word.id - b.word.id);
                map.set(key, {
                    firstWordId: sorted[0].word.id,
                    lastWordId: sorted[sorted.length - 1].word.id,
                    wordIds: sorted.map(item => item.word.id),
                    revealKeys: sorted.map(item => item.key)
                });
            }
        });
        return map;
    }, [pageData, pageNumber]);

    // --- منطق أوضاع العرض والإخفاء ---
    const [revealedIndices, setRevealedIndices] = useState<Set<string>>(new Set());
    const [randomMasks, setRandomMasks] = useState<Set<string>>(new Set());



    useEffect(() => {
        const newMasks = new Set<string>();
        setRevealedIndices(new Set()); // إعادة تعيين الكشف عند تغيير الوضع

        if (mode === ViewMode.HIDE_RANDOM_AYAHS) {
            const ayahsOnPage = Array.from(ayahWordMap.keys());

            // 0: عشوائي بسيط
            if (toggleState === 0) {
                ayahsOnPage.forEach(ayahKey => {
                    if (Math.random() > 0.5) newMasks.add(ayahKey);
                });
            }
            // 1-4: تصفية حسب التقييم
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

            // ملاحظة: randomMasks هنا ستخزن مفاتيح الآيات (surah-ayah) لتمييزها لاحقاً
            // في shouldHide، سنفحص إذا كانت الآية في randomMasks
            setRandomMasks(newMasks);
            return;

        } else if (mode === ViewMode.HIDE_RANDOM_WORDS) {
            // toggleState 0: عشوائي
            // toggleState 1: إخفاء الكل (وضع المراجعة الشاملة - قديم)
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
                            if (/[\u0660-\u0669]/.test(word.text) || word.text.includes('\u06dd')) return;
                            if (Math.random() > 0.5) newMasks.add(getId(lineIdx, wordIdx));
                        });
                    }
                });
            }
        }
        setRandomMasks(newMasks);
    }, [mode, pageNumber, toggleState, memorizationRatings, ayahWordMap]);



    const toggleReveal = (id: string, surah?: number, ayah?: number) => {
        // Find Ayah Info if context is provided
        let idsToReveal: string[] = [id];

        if (surah && ayah && mode === ViewMode.HIDE_ALL_AYAHS) {
            const key = `${surah}-${ayah}`;
            const ayahInfo = ayahWordMap.get(key);

            if (ayahInfo) {
                if (toggleState === 0) {
                    // Reveal Whole Ayah
                    idsToReveal = ayahInfo.revealKeys;
                } else if (toggleState === 1) {
                    // Reveal Segment
                    // 1. Find index of clicked word in the ayah
                    const wordIndexInAyah = ayahInfo.revealKeys.indexOf(id);
                    if (wordIndexInAyah !== -1) {
                        const stops = STOP_SIGNS[key] || [];

                        // Find previous stop (end of previous segment)
                        const prevStopIndex = stops.filter(s => s < wordIndexInAyah).pop();
                        const start = (prevStopIndex !== undefined) ? prevStopIndex + 1 : 0;

                        // Find next stop (end of this segment)
                        const nextStopIndex = stops.find(s => s >= wordIndexInAyah);
                        const end = (nextStopIndex !== undefined) ? nextStopIndex : (ayahInfo.revealKeys.length - 1);

                        idsToReveal = ayahInfo.revealKeys.slice(start, end + 1);
                    }
                }
            }
        }

        setRevealedIndices(prev => {
            const next = new Set(prev);
            // REVEAL ONLY (User Request: Do not hide on second click)
            idsToReveal.forEach(item => next.add(item));
            return next;
        });
    };

    // --- Long Press Logic ---
    const longPressTimerRef = React.useRef<NodeJS.Timeout | null>(null);
    const isLongPressRef = React.useRef<boolean>(false);
    const pointerStartPosRef = React.useRef<{ x: number, y: number } | null>(null);

    const handleLongPressAction = (id: string, surah: number, ayah: number) => {
        const key = `${surah}-${ayah}`;
        const ayahInfo = ayahWordMap.get(key);
        if (!ayahInfo) return;

        const wordIndexInAyah = ayahInfo.revealKeys.indexOf(id);
        if (wordIndexInAyah === -1) return;

        const stops = STOP_SIGNS[key] || [];
        // Find the range to reveal: start from clicked word, go until next stop
        // The user wants: clicked word + subsequent words UNTIL stop mark.
        // So we include the clicked word, and keep adding next words.
        // If a word has a stop sign, we include it and stop.

        const idsToReveal: string[] = [];

        for (let i = wordIndexInAyah; i < ayahInfo.revealKeys.length; i++) {
            const currentWordId = ayahInfo.revealKeys[i];
            const currentWordIndex = ayahInfo.wordIds[i]; // internal word ID usually 1-based index in ayah structure? No, wordIds are global IDs. 
            // We need the word index relative to ayah (0-based or 1-based) to check STOP_SIGNS
            // STOP_SIGNS are usually 1-destructured based indices? 
            // Let's rely on how `toggleReveal` worked or just check the stops array logic.
            // existing code: `const isStopWord = stopIndices?.includes(word.word - 1);`
            // `word.word` comes from data. 
            // `ayahInfo` has `items` with `word` object. Let's retrieve the word object.

            // We can reconstruct this simply by looping the keys and finding the corresponding word object from `ayahWordMap` logic?
            // Actually `ayahInfo` has `wordIds`. But we don't have the `Word` object directly in `ayahInfo` except minimal data.
            // Simpler: We have `pageData`. But iteration is slow.

            // Let's optimize: `ayahInfo` stores `firstWordId`.
            // The `StopSign` logic relies on `word.word` (position in ayah).
            // We can infer `word.word` if words are sequential? Not always guaranteed if data has gaps, but usually yes.
            // Safest: Use the component's existing `STOP_SIGNS` based on `word.word - 1` logic used in render.
            // But we are in a function handler.

            // Alternative: In `ayahWordMap`, store `word.word` or `isStop` status.
            // Let's update `ayahWordMap` to store `isStop` status to make this look up O(1).
            // But I cannot change `ayahWordMap` easily without re-reading the whole file structure logic.

            // Fallback: Just loop and check `STOP_SIGNS` for `wordIndex (current iteration)`.
            // STOP_SIGNS keys are indices of words that HAVE stops.
            // "stops" array contains 0-based indices of words that are stops?
            // Existing code: `const isStopWord = stopIndices?.includes(word.word - 1);`
            // `word.word` is 1-based number in ayah. So `word.word - 1` is 0-based index.
            // `ayahInfo.revealKeys` acts as our ordered array of words in the ayah.
            // So `i` (index in revealKeys) effectively corresponds to the 0-based index if there are no gaps.
            // Let's assume `i` is the index to check in `stops`.

            idsToReveal.push(currentWordId);

            // Check if this index is a stop
            // We assume stops contains the index `i` of the word in the sequence of the ayah
            // If checking fails (mismatch indices), better to check the global map or assume stops are infrequent.
            // Let's stick to the prompt requirement: "Update isHidden to false for all consecutive words... until it finds a word containing one of the Waqf symbols"

            // Wait, looking at `toggleReveal` logic:
            // `const nextStopIndex = stops.find(s => s >= wordIndexInAyah);`
            // This implies `stops` contains indices matching `ayahInfo.revealKeys` indices.

            if (stops.includes(i)) {
                break;
            }
        }

        setRevealedIndices(prev => {
            const next = new Set(prev);
            idsToReveal.forEach(item => next.add(item));
            return next;
        });
    };

    const handlePointerDown = (e: React.PointerEvent, id: string, surah: number, ayah: number) => {
        // Only if hidden? User requirement: "Long Press: If user keeps pressing the hidden word..."
        // If word is already revealed, maybe we don't need long press?
        // Prompt says "on the hidden words".
        // But let's apply generally or check `isHidden`.

        isLongPressRef.current = false;
        pointerStartPosRef.current = { x: e.clientX, y: e.clientY };

        longPressTimerRef.current = setTimeout(() => {
            isLongPressRef.current = true;
            handleLongPressAction(id, surah, ayah);
            // Optional: Vibrate
            if (navigator.vibrate) navigator.vibrate(50);
        }, 600);
    };

    const handlePointerMove = (e: React.PointerEvent) => {
        if (!longPressTimerRef.current || !pointerStartPosRef.current) return;

        const dist = Math.sqrt(
            Math.pow(e.clientX - pointerStartPosRef.current.x, 2) +
            Math.pow(e.clientY - pointerStartPosRef.current.y, 2)
        );

        if (dist > 10) {
            if (longPressTimerRef.current) {
                clearTimeout(longPressTimerRef.current);
                longPressTimerRef.current = null;
            }
        }
    };

    const handlePointerUp = () => {
        if (longPressTimerRef.current) {
            clearTimeout(longPressTimerRef.current);
            longPressTimerRef.current = null;
        }
    };

    // --- End Long Press Logic ---

    const isHidden = (lineIdx: number, wordIdx: number) => {
        const id = getId(lineIdx, wordIdx);
        if (revealedIndices.has(id)) return false;

        switch (mode) {
            case ViewMode.HIDE_ALL_AYAHS:
                return true;
            case ViewMode.HIDE_RANDOM_AYAHS:
                // هنا نحتاج منطق لربط السطر بالآية، سنبسطه لإخفاء عشوائي للكلمات مؤقتاً
                // أو نعتمد على mask
                return randomMasks.has(id); // Placeholder logic
            case ViewMode.HIDE_RANDOM_WORDS:
                return randomMasks.has(id);
            case ViewMode.TOGGLE_FIRST_WORD:
                // إخفاء الكلمة الأولى في السطر/الآية
                return wordIdx === 0;
            case ViewMode.TOGGLE_LAST_WORD:
                // إخفاء الكلمة الأخيرة
                // نحتاج معرفة طول السطر
                return false; // صعب تحديده هنا بدقة بدون السياق
            default:
                return false;
        }
    };

    // --- منطق تقييم الحفظ ---
    const getAyahRating = (surahNumber: number, ayahNumber: number): 'weak' | 'medium' | 'good' | null => {
        if (!memorizationRatings) return null;
        const ayahId = `${surahNumber}-${ayahNumber}`;
        const rating = memorizationRatings.find(r => r.ayahId === ayahId);
        return rating ? rating.rating : null;
    };

    const handleRateClick = (e: React.MouseEvent, surahNumber: number, ayahNumber: number) => {
        e.stopPropagation(); // لمنع الكشف عند النقر على التقييم
        if (!onRateAyah) return;

        const currentRating = getAyahRating(surahNumber, ayahNumber);
        let nextRating: 'weak' | 'medium' | 'good' | null = 'good';

        if (currentRating === 'good') nextRating = 'medium';
        else if (currentRating === 'medium') nextRating = 'weak';
        else if (currentRating === 'weak') nextRating = null;

        onRateAyah(surahNumber, ayahNumber, nextRating);
    };
    const getFontSize = () => {
        switch (deviceType) {
            case 'desktop':
                return '2rem'; // القيمة المرجعية للكمبيوتر
            case 'tablet':
                // تم تصغير الخط أكثر (نسخة 3 - تصغير إضافي)
                return 'min(3.5vh, 3.0vw)'; // 3.5vh مع 3.0vw
            case 'mobile':
                return 'min(2.4vh, 4.0vw)'; // القيمة المرجعية للموبايل (تم التصغير بنسبة 20%)
            default:
                return '2rem';
        }
    };

    const fontSizeClass = getFontSize();

    // تقديم اسم السورة - تصميم جديد مضغوط (سطر واحد)
    const renderSurahName = (line: Line) => {
        const surahName = SURAH_NAMES[line.surahNumber || 1] || 'غير معروفة';
        const borderColor = accentColor;

        // حساب الحجم بالنسبة للخط الأساسي
        // نستخدم 1.2 من حجم الخط الأساسي لارتفاع السورة
        const headerHeight = '1.3em'; // ارتفاع إجمالي مقارب للسطر

        // مكون الزخرفة الدائرية - بحجم نسبي
        const Ornament = () => (
            <svg style={{ height: headerHeight, width: headerHeight }} viewBox="0 0 45 45" className="text-amber-600 dark:text-amber-400">
                <circle cx="22.5" cy="22.5" r="20" fill="none" stroke={borderColor} strokeWidth="2" />
                <circle cx="22.5" cy="22.5" r="14" fill="none" stroke={borderColor} strokeWidth="1.5" opacity="0.7" />
                <circle cx="22.5" cy="22.5" r="4" fill={borderColor} />
            </svg>
        );

        return (
            <div
                key={`surah-${line.surahNumber}-${line.lineNumber}`}
                className="w-full flex justify-center items-center my-0" // تصفير الهامش العمودي للضغط الأقصى
                style={{
                    direction: 'rtl',
                    padding: '0.1em 0', // padding ضئيل جداً
                    fontSize: fontSizeClass // نرث حجم الخط الأساسي للحاوية
                }}
            >
                <div className="flex items-center justify-between w-full max-w-4xl px-2" style={{ height: headerHeight }}>

                    {/* الزخرفة اليمنى */}
                    <div className="shrink-0 flex items-center">
                        <Ornament />
                    </div>

                    {/* الخطوط اليمنى */}
                    <div className="flex-1 mx-2 relative h-full flex items-center">
                        <div className="w-full h-[3px] border-t border-b border-double"
                            style={{ borderColor: borderColor, borderTopWidth: '1px', borderBottomWidth: '1px', opacity: 0.8 }}></div>
                    </div>

                    {/* اسم السورة */}
                    <div className="mx-2 shrink-0 text-center px-2 flex items-center">
                        <span
                            className="block font-bold leading-none"
                            style={{
                                fontFamily: "'custom_thuluth', 'Amiri', serif",
                                fontSize: '1.4em', // أكبر قليلاً من النص العادي (1em) لكن ليس ضخماً
                                color: 'var(--text-primary)',
                                lineHeight: 1, // منع زيادة الارتفاع
                                transform: 'translateY(-0.1em)' // رفع طفيف لمحاذاة الخط الكوفي/الثلث
                            }}
                        >
                            سُورَةُ {surahName}
                        </span>
                    </div>

                    {/* الخطوط اليسرى */}
                    <div className="flex-1 mx-2 relative h-full flex items-center">
                        <div className="w-full h-[3px] border-t border-b border-double"
                            style={{ borderColor: borderColor, borderTopWidth: '1px', borderBottomWidth: '1px', opacity: 0.8 }}></div>
                    </div>

                    {/* الزخرفة اليسرى */}
                    <div className="shrink-0 flex items-center">
                        <Ornament />
                    </div>

                </div>
            </div>
        );
    };

    // تقديم البسملة - مضغوط (متناسب مع السطر)
    const renderBasmallah = (line: Line) => (
        <div
            key={`basmallah-${line.lineNumber}`}
            className="w-full text-center my-0"
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: fontSizeClass, // يرث حجم الخط الأساسي
                height: '1.4em', // ارتفاع مضغوط
                minHeight: '1.4em' // ضمان عدم التقلص
            }}
        >
            <span
                className="qpc-v1-font qpc-basmallah"
                style={{
                    color: accentColor,
                    direction: 'rtl',
                    fontSize: '0.9em', // تصغير طفيف لتتناسب مع المساحة
                    lineHeight: 1
                }}
            >
                {/* رمز البسملة الموحد من Unicode */}
                ﷽
            </span>
        </div>
    );

    // تقديم سطر آيات
    const renderAyahLine = (line: Line, lineIdx: number) => (
        <div
            className={clsx(
                "w-full flex items-center",  // إزالة flex-1 لمنع التمدد القسري
                line.isCentered ? "justify-center" : "justify-between"
            )}
            style={{
                direction: 'rtl',
                wordSpacing: '0px'
            }}
        >
            <div
                className={clsx(
                    "flex w-full items-center",
                    line.isCentered ? "justify-center gap-0.5 sm:gap-1" : "justify-between"
                )}
                style={{
                    marginLeft: '0px',
                    fontSize: fontSizeClass // Apply dynamic font size to container so children inherit/scale
                }}
            >
                {/* Render Words */}
                {line.words.map((word, wordIndex) => {
                    // Check if this word belongs to the highlighted Ayah
                    const isHighlighted = highlightedAyah && highlightedAyah.surah === word.surah && highlightedAyah.ayah === word.ayah;

                    // Handle type 'word'
                    const isWord = true; // Simplified for this context as data structure implies words

                    const ayahInfo = ayahWordMap.get(`${word.surah}-${word.ayah}`);

                    // تحسين دقيق جداً لاكتشاف رقم الآية
                    const isAyahEnd = word.word === -1 || word.text.includes('\u06dd');
                    const isLastInStructure = ayahInfo && ayahInfo.lastWordId === word.id;
                    const isNumber = isAyahEnd ||
                        /[\u0660-\u0669]/.test(word.text) ||
                        word.text.includes('\u06dd') ||
                        isLastInStructure;

                    // Stop Sign Detection - In QPC font, 2-char words = word + stop sign
                    // Exception: word.word === 1 with length 2 is Hizb marker + word, not stop sign
                    const hasAppendedStop = word.text.length === 2 && word.word !== 1;
                    const textPart = hasAppendedStop ? word.text.slice(0, 1) : word.text;
                    const stopPart = hasAppendedStop ? word.text.slice(1) : null;
                    let shouldHideText = false;
                    let shouldHideStop = false;

                    const wordId = getId(lineIdx, wordIndex);

                    if (!revealedIndices.has(wordId)) {
                        // 1. إخفاء الكل
                        if (mode === ViewMode.HIDE_ALL_AYAHS) {
                            if (toggleState === 0) {
                                // Hide both text and stop signs
                                shouldHideText = true;
                                shouldHideStop = true;
                            } else if (toggleState === 1) {
                                // Hide only the text, keep stop signs visible
                                shouldHideText = true;
                                shouldHideStop = false;
                            }
                        }
                        // 2. إخفاء عشوائي للآيات
                        else if (mode === ViewMode.HIDE_RANDOM_AYAHS) {
                            if (word.surah && word.ayah) {
                                const key = `${word.surah}-${word.ayah}`;
                                if (randomMasks.has(key)) { shouldHideText = true; shouldHideStop = true; }
                            }
                        }
                        // 3. إخفاء كلمات عشوائية
                        else if (mode === ViewMode.HIDE_RANDOM_WORDS) {
                            if (randomMasks.has(wordId)) { shouldHideText = true; shouldHideStop = true; }
                        }
                        // 4. إخفاء أول كلمة
                        else if (mode === ViewMode.TOGGLE_FIRST_WORD) {
                            if (ayahInfo) {
                                const isFirst = word.id === ayahInfo.firstWordId;
                                if (toggleState === 0) { shouldHideText = isFirst; shouldHideStop = isFirst; }
                                else { shouldHideText = !isFirst; shouldHideStop = !isFirst; }
                            }
                        }
                        // 5. إخفاء آخر كلمة
                        else if (mode === ViewMode.TOGGLE_LAST_WORD) {
                            if (ayahInfo) {
                                const lastStructuralId = ayahInfo.lastWordId;
                                const penultimateId = (ayahInfo.wordIds.length > 1)
                                    ? ayahInfo.wordIds[ayahInfo.wordIds.length - 2]
                                    : -1;
                                const isTargetLast = word.id === penultimateId;

                                if (toggleState === 0) {
                                    if (isTargetLast) { shouldHideText = true; shouldHideStop = true; }
                                } else {
                                    if (!isTargetLast) { shouldHideText = true; shouldHideStop = true; }
                                }
                            }
                        }
                    }

                    if (isNumber) {
                        shouldHideText = false;
                        shouldHideStop = false;
                    }

                    const rating = (isNumber && word.surah && word.ayah) ? getAyahRating(word.surah, word.ayah) : null;

                    return (
                        <span
                            key={`word-${word.id}`}
                            id={`ayah-${word.surah}-${word.ayah}`} // Unique ID for scrolling
                            className={clsx(
                                "qpc-v1-font select-none",
                                `qpc-font-page-${pageNumber}`,
                                "transition-all duration-300 cursor-pointer align-middle relative",

                                // Highlight Class
                                isHighlighted && "target-ayah-highlight", // Visual Highlight using Custom CSS

                                // --- Masking Styles ---
                                (!hasAppendedStop && shouldHideText)
                                    // Unified Dark Navy Mask, No Border, Rounded
                                    ? "text-transparent bg-slate-800 rounded-[6px] is-hidden-qpc"
                                    : (!hasAppendedStop)
                                        ? "text-slate-900 dark:text-slate-100 hover:text-amber-600 dark:hover:text-amber-400"
                                        : (shouldHideText || shouldHideStop) ? "is-hidden-qpc" : "",

                                // --- Ayah Number Styling ---
                                isNumber && "z-20", // Ensure numbers float above
                                isNumber && "qpc-ayah-number" // Specific class for Tablet override
                            )}
                            style={{
                                fontSize: isNumber ? '85%' : undefined, // Inherit base size from container
                                display: deviceType === 'desktop' ? 'inline-block' : undefined,

                                // --- Fixed Height for Mobile (CSS controlled) ---
                                height: deviceType === 'desktop' ? '1.6em' : undefined, // Let CSS handle mobile
                                lineHeight: deviceType === 'desktop' ? '1.6em' : undefined, // Let CSS handle mobile
                                overflow: deviceType === 'desktop' ? (isNumber ? 'visible' : 'hidden') : undefined, // Let CSS handle mobile
                                flexShrink: deviceType === 'desktop' ? 1 : 0,
                                verticalAlign: deviceType === 'desktop' ? 'top' : undefined, // Top alignment prevents stepping
                                position: isNumber ? 'relative' : undefined,
                                top: isNumber ? '6px' : undefined,

                                whiteSpace: 'nowrap',
                                padding: deviceType === 'desktop' ? (isNumber ? '0' : '0 4px') : undefined, // Let CSS handle mobile
                                margin: deviceType === 'desktop' ? (isNumber ? '0' : '2px 1px') : undefined, // Let CSS handle mobile

                                // Apply accent color for Ayah numbers (when no rating)
                                color: isNumber && !rating ? accentColor : undefined,
                            }}
                            onPointerDown={!isNumber ? (e) => handlePointerDown(e, wordId, word.surah, word.ayah) : undefined}
                            onPointerMove={!isNumber ? handlePointerMove : undefined}
                            onPointerUp={!isNumber ? handlePointerUp : undefined}
                            onPointerLeave={!isNumber ? handlePointerUp : undefined}
                            onPointerCancel={!isNumber ? handlePointerUp : undefined}
                            onContextMenu={(e) => e.preventDefault()}
                            onClick={(e) => {
                                if (isNumber && word.surah && word.ayah) {
                                    handleRateClick(e, word.surah, word.ayah);
                                } else {
                                    if (isLongPressRef.current) {
                                        isLongPressRef.current = false;
                                        return;
                                    }
                                    const isTextHidden = shouldHideText;
                                    if (isTextHidden) {
                                        e.stopPropagation();
                                        toggleReveal(wordId, word.surah, word.ayah);
                                    }
                                }
                            }}
                        >
                            {isNumber && (word.surah && word.ayah) && verseBookmarks?.some(b => b.id === `${pageNumber}-${word.surah}-${word.ayah}`) && (
                                <div className="absolute left-1/2 -translate-x-1/2 text-amber-500 animate-in zoom-in duration-200 !z-[99999] drop-shadow-sm select-none pointer-events-none" style={{ top: '-14px' }}>
                                    <Bookmark size={14} fill="currentColor" />
                                </div>
                            )}
                            {hasAppendedStop ? (
                                <>
                                    <span
                                        className={clsx(
                                            shouldHideText
                                                ? "text-transparent bg-slate-800 rounded-[6px]" // Consistent Mask
                                                : "text-slate-900 dark:text-slate-100 hover:text-amber-600 dark:hover:text-amber-400"
                                        )}
                                        style={{
                                            display: 'inline-block',
                                            height: '100%',
                                            verticalAlign: 'middle',
                                            padding: shouldHideText ? '0 2px' : '0'
                                        }}
                                    >
                                        {textPart}
                                    </span>
                                    <span
                                        className={clsx(
                                            "stop-sign-glyph",
                                            shouldHideStop ? "invisible" : (colorStopSigns ? "text-amber-600 dark:text-amber-500" : "text-slate-900 dark:text-slate-100")
                                        )}
                                        style={{
                                            verticalAlign: 'middle',
                                            margin: '0 2px',
                                            padding: shouldHideStop ? '0 2px' : '0'
                                        }}
                                    >
                                        {stopPart}
                                    </span>
                                </>
                            ) : isNumber && word.ayah ? (
                                <AyahSeparator
                                    ayahNumber={word.ayah}
                                    accentColor={accentColor}
                                    rating={rating} // Pass rating directly
                                    deviceType={deviceType} // Pass device type for spacing
                                    language={language}
                                />
                            ) : word.text}
                        </span>
                    );
                })}
            </div>
        </div >
    );

    const renderLine = (line: Line, idx: number) => {
        if (line.lineType === 'surah_name') return renderSurahName(line);
        if (line.lineType === 'basmallah') return renderBasmallah(line);
        return renderAyahLine(line, idx);
    };

    // الإعدادات المستقلة لكل جهاز
    const getContainerStyles = () => {
        const isLandscape = window.matchMedia("(orientation: landscape)").matches;

        switch (deviceType) {
            case 'desktop':
                // كمبيوتر: ملء العرض مع تباعد مريح
                return {
                    maxWidth: '1440px',
                    height: '100%',
                    minHeight: '100%',
                    padding: '10px',
                    margin: '0 auto',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    boxSizing: 'border-box' as const
                };
            case 'tablet':
                // تابلت: ملء الشاشة مع السماح بالتمرير والتوسيط الإجباري
                return {
                    maxWidth: isLandscape ? '1000px' : '100vw',
                    width: '100vw',
                    height: isLandscape ? 'auto' : '100dvh', // Fixed 15 lines in portrait, scroll in landscape
                    minHeight: '100dvh', // ALWAYS ensure full height
                    padding: isLandscape ? '20px 5%' : '50px 70px', // GENEROUS PADDING like reference
                    paddingBottom: '40px', // Space for absolute footer
                    margin: isLandscape ? '0 auto' : '0',
                    overflowY: isLandscape ? 'auto' : 'hidden',
                    overflowX: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'space-between', // Flexbox push to bottom
                    boxSizing: 'border-box' as const,
                    position: 'relative' as const // For absolute footer
                };
            case 'mobile':
                // موبايل: قطعة واحدة ثابتة مع ظهور رقم الصفحة
                return {
                    maxWidth: '100%',
                    width: '100%',
                    height: isLandscape ? 'auto' : '100dvh', // Allow scrolling in landscape
                    minHeight: '100dvh', // ALWAYS ensure full height
                    padding: isLandscape ? '10px 5%' : '0 5px',
                    paddingBottom: '40px', // Space for absolute footer
                    overflowY: isLandscape ? 'auto' : 'hidden',
                    overflowX: 'hidden',
                    boxSizing: 'border-box' as const,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between', // Flexbox push to bottom
                    position: 'relative' as const // For absolute footer
                };
        }
    };

    if (fontError) {
        return (
            <div
                className={clsx(
                    "flex flex-col items-center justify-center w-full shadow-sm rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50",
                    className
                )}
                style={{
                    height: '100dvh', // Full height
                    ...getContainerStyles() as React.CSSProperties,
                }}
            >
                <div className="p-8 text-center max-w-sm">
                    <div className="mb-6 flex justify-center">
                        <div className="p-4 bg-amber-100 dark:bg-amber-900/30 rounded-full">
                            <WifiOff size={40} className="text-amber-600 dark:text-amber-500" />
                        </div>
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-slate-800 dark:text-slate-200">
                        {t.pageNotAvailable}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                        {t.fontNotLoaded.replace('{page}', pageNumber.toString())}
                    </p>
                    <div className="text-xs text-slate-400 border-t border-slate-200 dark:border-slate-800 pt-4">
                        {language === 'ar' ? 'يرجى الاتصال بالإنترنت لمرة واحدة لتحميل الصفحة.' : 'Please connect to the internet once to load the page.'}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div
            className={clsx(
                "mushaf-page-qpc",
                "w-full mx-auto shadow-sm transition-colors duration-300",
                `p${pageNumber} `, // كلاس ديناميكي لرقم الصفحة
                className
            )}
            data-device-type={deviceType} // 🔑 CRITICAL: To target explicitly in CSS
            data-version="v6-red" // 🔴 DEBUG VERSION INDICATOR
            style={{
                ...getContainerStyles() as React.CSSProperties,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between', // Force footer to bottom via Flexbox
                backgroundColor: 'var(--bg-primary)',
                color: 'var(--text-primary)'
            }}
        >
            {/* الترويسة العلوية لنسخة الكمبيوتر */}
            {deviceType === 'desktop' && (
                <div
                    className="page-header mb-4 pb-4 border-b border-amber-200/40 dark:border-amber-800/40"
                    style={{
                        fontFamily: "'Almarai', sans-serif",
                        fontSize: '0.9rem',
                        color: accentColor,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        width: '100%',
                        padding: '0.25rem 20px',
                        backgroundColor: 'var(--bg-primary)'
                    }}
                >
                    {(() => {
                        const getJuzNumber = (page: number): number => {
                            const juzStarts = [1, 22, 42, 62, 82, 102, 121, 142, 162, 182, 202, 222, 242, 262, 282, 302, 322, 342, 362, 382, 402, 422, 442, 462, 482, 502, 522, 542, 562, 582];
                            for (let i = juzStarts.length - 1; i >= 0; i--) {
                                if (page >= juzStarts[i]) return i + 1;
                            }
                            return 1;
                        };
                        const getHizbNumber = (page: number): number => Math.ceil((page * 60) / 604);
                        const getQuarterNumber = (page: number): number => {
                            const quarterInTotal = Math.ceil((page * 240) / 604);
                            return ((quarterInTotal - 1) % 4) + 1;
                        };
                        const getSurahName = (): string => {
                            for (const line of pageData.lines) {
                                if (line.surahNumber) {
                                    const surahName = SURAH_NAMES[line.surahNumber];
                                    return surahName ? `${t.surahPrefix} ${surahName}` : t.surahPrefix;
                                }
                                if (line.words && line.words.length > 0) {
                                    const firstWord = line.words[0];
                                    if (firstWord.surah) {
                                        const surahName = SURAH_NAMES[firstWord.surah];
                                        return surahName ? `${t.surahPrefix} ${surahName}` : t.surahPrefix;
                                    }
                                }
                            }
                            return t.surahPrefix;
                        };

                        const juz = getJuzNumber(pageNumber);
                        const hizb = getHizbNumber(pageNumber);
                        const quarter = getQuarterNumber(pageNumber);
                        const surahName = getSurahName();

                        const juzNum = language === 'ar' ? juz.toLocaleString('ar-EG') : juz.toString();
                        const hizbNum = language === 'ar' ? hizb.toLocaleString('ar-EG') : hizb.toString();
                        const quarterNum = language === 'ar' ? quarter.toLocaleString('ar-EG') : quarter.toString();
                        const pageNumDisplay = language === 'ar' ? pageNumber.toLocaleString('ar-EG') : pageNumber.toString();

                        const separator = <span style={{ color: '#8B0000', margin: '0 0.3rem' }}>|</span>;
                        const centerContent = (
                            <>
                                {t.juz} {juzNum}
                                {separator}
                                {t.hizb} {hizbNum}
                                {separator}
                                {t.rub} {quarterNum}
                            </>
                        );

                        if (pageNumber % 2 !== 0) {
                            return (
                                <>
                                    <div style={{ fontWeight: 500 }}>{pageNumDisplay}</div>
                                    <div style={{ display: 'flex', alignItems: 'center', opacity: 0.9 }}>
                                        <span className="hidden lg:inline">{centerContent} {separator} </span>
                                        {surahName}
                                    </div>
                                </>
                            );
                        } else {
                            return (
                                <>
                                    <div style={{ display: 'flex', alignItems: 'center', opacity: 0.9 }}>
                                        {surahName}
                                        <span className="hidden lg:inline"> {separator} {centerContent}</span>
                                    </div>
                                    <div style={{ fontWeight: 500 }}>{pageNumDisplay}</div>
                                </>
                            );
                        }
                    })()}
                </div>
            )}
            <div
                className="quran-lines-container"
                style={{
                    flexGrow: 1, // Allow taking available space
                    display: 'flex', // Nested flex for exact line positioning
                    flexDirection: 'column',
                    justifyContent: 'space-between', // Distribute lines evenly
                    width: '100%',
                    direction: 'rtl', // Ensure RTL layout
                    paddingBottom: '20px' // Add space between text and footer
                }}
            >
                {pageData.lines.map((line, idx) => (
                    <React.Fragment key={`line-${idx}`}>
                        {renderLine(line, idx)}
                    </React.Fragment>
                ))}
            </div>

            {/* التذييل مع ترتيب شرطي حسب رقم الصفحة (فردي/زوجي) */}
            <div
                className="page-footer mt-0 pt-1 border-t border-amber-200/40 dark:border-amber-800/40"
                style={{
                    fontFamily: "'Almarai', sans-serif",
                    fontSize: '0.9rem',
                    color: accentColor,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    width: '100%',
                    padding: '0.25rem 20px',
                    // Desktop: static (follows content), Mobile/Tablet: fixed (pinned to bottom)
                    position: deviceType === 'desktop' ? 'relative' : 'fixed',
                    bottom: deviceType === 'desktop' ? 'auto' : '0',
                    left: deviceType === 'desktop' ? 'auto' : '0',
                    right: deviceType === 'desktop' ? 'auto' : '0',
                    zIndex: deviceType === 'desktop' ? 'auto' : 50,
                    backgroundColor: 'var(--bg-primary)'
                }}
            >
                {(() => {
                    // Helper functions
                    const getJuzNumber = (page: number): number => {
                        const juzStarts = [1, 22, 42, 62, 82, 102, 121, 142, 162, 182, 202, 222, 242, 262, 282, 302, 322, 342, 362, 382, 402, 422, 442, 462, 482, 502, 522, 542, 562, 582];
                        for (let i = juzStarts.length - 1; i >= 0; i--) {
                            if (page >= juzStarts[i]) return i + 1;
                        }
                        return 1;
                    };

                    const getHizbNumber = (page: number): number => {
                        return Math.ceil((pageNumber * 60) / 604);
                    };

                    const getQuarterNumber = (page: number): number => {
                        const quarterInTotal = Math.ceil((page * 240) / 604);
                        const quarterInHizb = ((quarterInTotal - 1) % 4) + 1;
                        return quarterInHizb;
                    };

                    const getSurahName = (): string => {
                        for (const line of pageData.lines) {
                            if (line.surahNumber) {
                                const surahName = SURAH_NAMES[line.surahNumber];
                                return surahName ? `${t.surahPrefix} ${surahName}` : t.surahPrefix;
                            }
                            if (line.words && line.words.length > 0) {
                                const firstWord = line.words[0];
                                if (firstWord.surah) {
                                    const surahName = SURAH_NAMES[firstWord.surah];
                                    return surahName ? `${t.surahPrefix} ${surahName}` : t.surahPrefix;
                                }
                            }
                        }
                        return t.surahPrefix;
                    };

                    const juz = getJuzNumber(pageNumber);
                    const hizb = getHizbNumber(pageNumber);
                    const quarter = getQuarterNumber(pageNumber);
                    const surahName = getSurahName();

                    const juzNum = language === 'ar' ? juz.toLocaleString('ar-EG') : juz.toString();
                    const hizbNum = language === 'ar' ? hizb.toLocaleString('ar-EG') : hizb.toString();
                    const quarterNum = language === 'ar' ? quarter.toLocaleString('ar-EG') : quarter.toString();
                    const pageNumDisplay = language === 'ar' ? pageNumber.toLocaleString('ar-EG') : pageNumber.toString();

                    const separator = <span style={{ color: '#8B0000', margin: '0 0.3rem' }}>|</span>;
                    const centerContent = (
                        <>
                            {t.juz} {juzNum}
                            {separator}
                            {t.hizb} {hizbNum}
                            {separator}
                            {t.rub} {quarterNum}
                        </>
                    );

                    // صفحة فردية: رقم الصفحة في اليمين، اسم السورة في اليسار (مع البيانات في الكمبيوتر)
                    if (pageNumber % 2 !== 0) {
                        return (
                            <>
                                <div>{pageNumDisplay}</div>
                                {deviceType === 'desktop' ? (
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                        <span className="hidden lg:inline">{centerContent} {separator} </span>
                                        {surahName}
                                    </div>
                                ) : (
                                    <>
                                        <div>{centerContent}</div>
                                        <div>{surahName}</div>
                                    </>
                                )}
                            </>
                        );
                    } else {
                        // صفحة زوجية: اسم السورة في اليمين، رقم الصفحة في اليسار
                        return (
                            <>
                                {deviceType === 'desktop' ? (
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                        {surahName}
                                        <span className="hidden lg:inline"> {separator} {centerContent}</span>
                                    </div>
                                ) : (
                                    <>
                                        <div>{surahName}</div>
                                        <div>{centerContent}</div>
                                    </>
                                )}
                                <div>{pageNumDisplay}</div>
                            </>
                        );
                    }
                })()}
            </div>
        </div >
    );
};

export default QPCV1PageRenderer;

// دالة لتحميل بيانات المصحف
export async function loadQPCV1Data(): Promise<MushafData> {
    const response = await fetch('/qpc_v1_mushaf.json');
    if (!response.ok) {
        throw new Error('فشل في تحميل بيانات المصحف');
    }
    return response.json();
}

// دالة للحصول على صفحة معينة
export function getPageData(data: MushafData, pageNumber: number): Page | null {
    if (pageNumber < 1 || pageNumber > data.metadata.totalPages) {
        return null;
    }
    return data.pages[pageNumber - 1] || null;
}
