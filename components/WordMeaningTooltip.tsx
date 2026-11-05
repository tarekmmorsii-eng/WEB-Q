import React, { useEffect, useState, useRef, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import clsx from 'clsx';
import { translations, Language } from '../i18n/translations';
import { WordReview } from '../services/wordReview';
import WordReviewEditor from './WordReviewEditor';
import { useReadingUiScale } from './ReadingUiScale';

interface WordMeaningTooltipProps {
    language?: string;
    review?: WordReview;
    word: string; // Kept in interface to not break consumers, but won't render it
    meaning: string;
    onClose: () => void;
    position: { x: number; y: number };
    isFallback?: boolean;
    fallbackMessage?: string;
    hideTooltipHint?: string;
}

const WordMeaningTooltip: React.FC<WordMeaningTooltipProps> = ({ language='ar', review, word, meaning, onClose, position, isFallback = false, fallbackMessage, hideTooltipHint }) => {
    const locale=translations[language as Language]||translations.en;
    const text=locale.wordReview;
    const [editing, setEditing] = useState(false);
    const readingScale = useReadingUiScale();
    const enlarged = readingScale > 1;
    const [viewport, setViewport] = useState(() => ({ width: window.innerWidth, height: window.innerHeight }));
    const [isVisible, setIsVisible] = useState(false);
    const tooltipRef = useRef<HTMLDivElement>(null);
    const [tooltipHeight, setTooltipHeight] = useState<number>(0);

    useLayoutEffect(() => {
        if (tooltipRef.current) {
            setTooltipHeight(tooltipRef.current.offsetHeight);
        }
    }, [word, meaning, isFallback, readingScale, viewport, editing, review, language]);

    useEffect(() => {
        const resize = () => setViewport({ width: window.innerWidth, height: window.innerHeight });
        window.addEventListener('resize', resize);
        return () => window.removeEventListener('resize', resize);
    }, [enlarged]);

    useEffect(() => {
        const entryTimeout = setTimeout(() => setIsVisible(true), 10);

        const handleGlobalClick = (e: PointerEvent) => {
            if (tooltipRef.current?.contains(e.target as Node)) return;
            onClose();
        };

        const listenerTimeout = setTimeout(() => {
            document.addEventListener('pointerdown', handleGlobalClick);
        }, 150);

        return () => {
            clearTimeout(entryTimeout);
            clearTimeout(listenerTimeout);
            document.removeEventListener('pointerdown', handleGlobalClick);
        };
    }, [onClose, enlarged]);

    // Dimensions constraints
    const width = Math.min(260 * readingScale, (enlarged ? viewport.width : window.innerWidth) - 40);
    const safeTop = enlarged ? Math.max(20, (parseFloat(document.documentElement.style.getPropertyValue('--android-status-bar-height')) || 0) + 12) : 20;
    const safeBottom = enlarged ? Math.max(20, (parseFloat(document.documentElement.style.getPropertyValue('--android-navigation-bar-height')) || 0) + 12) : 20;

    // Horizontal centering over pointer with bounds
    let left = position.x - width / 2;
    if (left < 20) left = 20;
    if (left + width > window.innerWidth - 20) left = window.innerWidth - width - 20;

    // Vertical positioning: Default above finger, fallback below if clipped
    const isAbove = position.y > (tooltipHeight + 60);
    // Add 25px offset from the exact touch point so we don't cover the word
    const preferredTop = isAbove ? position.y - tooltipHeight - 25 : position.y + 25;
    const top = Math.max(safeTop, Math.min(preferredTop, viewport.height - tooltipHeight - safeBottom));

    // Arrow positioning
    const arrowLeft = Math.max(16, Math.min(width - 16, position.x - left));

    return createPortal(
        <div
            className="app-dialog-colors word-meaning-tooltip fixed z-[99999] pointer-events-auto"
            data-reading-meaning-scale={enlarged ? readingScale : undefined}
            onPointerDown={e => e.stopPropagation()}
            style={{
                color: 'var(--text-primary, #1e293b)',
                left: `${left}px`,
                top: `${top}px`,
                width: `${width}px`,
                opacity: tooltipHeight > 0 ? 1 : 0
            }}
        >
            {/* The main box */}
            <div
                ref={tooltipRef}
                style={{ maxHeight: viewport.height - safeTop - safeBottom, overflowY: 'auto', overscrollBehavior: 'contain' }}
                className={clsx(
                    "relative bg-[var(--bg-card)] bg-opacity-95 backdrop-blur-xl border-2 border-[var(--border-primary)] shadow-lg rounded-xl transition-all duration-300 ease-out transform",
                    isVisible ? "scale-100 opacity-100" : "scale-95 opacity-0"
                )}
            >
                {/* Word/Phrase Header */}
                <div className="bg-amber-50 dark:bg-amber-900/20 px-4 py-2 border-b border-[var(--border-primary)] opacity-80 rounded-t-[10px]"
                    style={enlarged ? { padding: `${8 * readingScale}px ${16 * readingScale}px` } : undefined}>
                    <span
                        className="text-amber-800 dark:text-amber-400 font-bold text-xl leading-none block text-center truncate"
                        style={{ fontFamily: "'Amiri', serif", ...(enlarged ? { fontSize: 20 * readingScale, whiteSpace: 'normal', lineHeight: 1.5 } : {}) }}
                    >
                        {word}
                    </span>
                </div>

                {editing && review ? <div className="p-3 text-[var(--text-primary)]"><button type="button" dir={locale.dir} style={{color:'var(--text-primary, #1e293b)',backgroundColor:'var(--bg-card, #fff)',border:'1px solid var(--border-primary, #ddd)',borderRadius:6,padding:'6px 10px'}} className="text-xs mb-3" onClick={()=>setEditing(false)}><span aria-hidden="true">{locale.dir==='rtl'?'→':'←'}</span> {text.backToMeaning}</button><WordReviewEditor record={review} language={language}/></div> : <div className="p-3 px-4" style={enlarged ? { padding: `${12 * readingScale}px ${16 * readingScale}px` } : undefined}>
                    <p
                        className="text-[var(--text-primary)] text-lg md:text-xl leading-relaxed text-center dir-rtl font-medium m-0"
                        style={{ fontFamily: "'Amiri', serif", ...(enlarged ? { fontSize: 20 * readingScale } : {}) }}
                    >
                        {meaning}
                    </p>

                    {/* Fallback message - يظهر فقط عند استخدام لغة بديلة */}
                    {isFallback && (
                        <p
                            className="text-[10px] leading-relaxed text-center mt-2 pt-2 border-t border-[var(--border-primary)] m-0"
                            style={{
                                fontStyle: 'italic',
                                opacity: 0.5,
                                color: 'var(--text-secondary, #888)',
                                ...(enlarged ? { fontSize: 10 * readingScale } : {})
                            }}
                        >
                            {fallbackMessage || 'The alternative language was used because word meanings are not available in this language.'}
                        </p>
                    )}

                    {/* Hint: يمكنك إخفاء النافذة من الإعدادات */}
                    {isFallback && hideTooltipHint && (
                        <p className="text-red-500 text-[10px] leading-relaxed text-center mt-1 m-0" style={enlarged ? { fontSize: 10 * readingScale } : undefined}>
                            {hideTooltipHint}
                        </p>
                    )}
                </div>

                }
                {review && !editing && <button type="button" onClick={()=>setEditing(true)} className="w-full border-t border-[var(--border-primary)] bg-amber-500/5 px-3 py-2 text-xs text-[var(--text-primary)]" dir={locale.dir}>{review.forgotten||review.pronunciation ? text.reviewRecorded : review.note ? text.noteRecorded : '✎ '+text.openReview} ‹</button>}

                {/* Tooltip Arrow */}
                <div
                    className={clsx(
                        "absolute w-3.5 h-3.5 bg-[var(--bg-card)] bg-opacity-95 rotate-45 pointer-events-none",
                        isAbove
                            ? "border-r-2 border-b-2 border-[var(--border-primary)] -bottom-[8px]"
                            : "border-l-2 border-t-2 border-[var(--border-primary)] -top-[8px]"
                    )}
                    style={{
                        left: `${arrowLeft}px`,
                        transform: 'translateX(-50%) rotate(45deg)'
                    }}
                />
            </div>

            {/* Accessibility note */}
            <div className="sr-only">اضغط في أي مكان خارج هذا الصندوق للإغلاق</div>
        </div>,
        document.body
    );
};

export default WordMeaningTooltip;
