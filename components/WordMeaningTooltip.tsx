import React, { useEffect, useState, useRef, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import clsx from 'clsx';

interface WordMeaningTooltipProps {
    word: string; // Kept in interface to not break consumers, but won't render it
    meaning: string;
    onClose: () => void;
    position: { x: number; y: number };
    isFallback?: boolean;
    fallbackMessage?: string;
    hideTooltipHint?: string;
}

const WordMeaningTooltip: React.FC<WordMeaningTooltipProps> = ({ word, meaning, onClose, position, isFallback = false, fallbackMessage, hideTooltipHint }) => {
    const [isVisible, setIsVisible] = useState(false);
    const tooltipRef = useRef<HTMLDivElement>(null);
    const [tooltipHeight, setTooltipHeight] = useState<number>(0);

    useLayoutEffect(() => {
        if (tooltipRef.current) {
            setTooltipHeight(tooltipRef.current.offsetHeight);
        }
    }, [word, meaning, isFallback]);

    useEffect(() => {
        const entryTimeout = setTimeout(() => setIsVisible(true), 10);

        const handleGlobalClick = (e: PointerEvent) => {
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
    }, [onClose]);

    // Dimensions constraints
    const width = Math.min(260, window.innerWidth - 40);

    // Horizontal centering over pointer with bounds
    let left = position.x - width / 2;
    if (left < 20) left = 20;
    if (left + width > window.innerWidth - 20) left = window.innerWidth - width - 20;

    // Vertical positioning: Default above finger, fallback below if clipped
    const isAbove = position.y > (tooltipHeight + 60);
    // Add 25px offset from the exact touch point so we don't cover the word
    const top = isAbove ? position.y - tooltipHeight - 25 : position.y + 25;

    // Arrow positioning
    const arrowLeft = Math.max(16, Math.min(width - 16, position.x - left));

    return createPortal(
        <div
            className="word-meaning-tooltip fixed z-[99999] pointer-events-auto"
            onPointerDown={onClose}
            style={{
                left: `${left}px`,
                top: `${top}px`,
                width: `${width}px`,
                opacity: tooltipHeight > 0 ? 1 : 0
            }}
        >
            {/* The main box */}
            <div
                ref={tooltipRef}
                className={clsx(
                    "relative bg-[var(--bg-card)] bg-opacity-95 backdrop-blur-xl border-2 border-[var(--border-primary)] shadow-lg rounded-xl transition-all duration-300 ease-out transform",
                    isVisible ? "scale-100 opacity-100" : "scale-95 opacity-0"
                )}
            >
                {/* Word/Phrase Header */}
                <div className="bg-amber-50 dark:bg-amber-900/20 px-4 py-2 border-b border-[var(--border-primary)] opacity-80 rounded-t-[10px]">
                    <span
                        className="text-amber-800 dark:text-amber-400 font-bold text-xl leading-none block text-center truncate"
                        style={{ fontFamily: "'Amiri', serif" }}
                    >
                        {word}
                    </span>
                </div>

                <div className="p-3 px-4">
                    <p
                        className="text-[var(--text-primary)] text-lg md:text-xl leading-relaxed text-center dir-rtl font-medium m-0"
                        style={{ fontFamily: "'Amiri', serif" }}
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
                                color: 'var(--text-secondary, #888)'
                            }}
                        >
                            {fallbackMessage || 'The alternative language was used because word meanings are not available in this language.'}
                        </p>
                    )}

                    {/* Hint: يمكنك إخفاء النافذة من الإعدادات */}
                    {isFallback && hideTooltipHint && (
                        <p className="text-red-500 text-[10px] leading-relaxed text-center mt-1 m-0">
                            {hideTooltipHint}
                        </p>
                    )}
                </div>

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