import React from 'react';

/**
 * LINE_STYLE_OVERRIDES
 * 
 * Mechanism to apply specific CSS styles to individual lines on specific pages.
 * Used for fixing character clipping or other layout issues that only occur 
 * on particular verses/lines without affecting global styles.
 * 
 * Format: { pageNumber: { lineIndex0Based: { ...CSSProperties } } }
 */
export const LINE_STYLE_OVERRIDES: Record<number, Record<number, React.CSSProperties>> = {
    // NOTE: These lines clip their last word at the inline-start (left) edge.
    // scaleX with transformOrigin:'right' keeps the right edge fixed and pulls
    // the overflowing left side back into view. Values are stronger than before
    // (~12-14% compression) because the old 0.93-0.94 only recovered ~6-7%,
    // leaving 1-3 letters still cut off. wordSpacing was dropped — it has no
    // effect on these flex/space-between lines (no real spaces between words).
    // Auto-fit intentionally skips lines that have an override here.

    // Page 576, Line 10 (index 9) - "إِنَّهَا"
    576: {
        9: {
            transform: 'scaleX(0.88)',
            transformOrigin: 'right',
        }
    },
    // Page 577, Line 12 (index 11) - "هَلْ أَتَى..." (Al-Insan 1)
    577: {
        11: {
            transform: 'scaleX(0.88)',
            transformOrigin: 'right',
        }
    },
    // Page 578, Line 12 (index 11) - "خَلَقْنَا"
    578: {
        11: {
            transform: 'scaleX(0.88)',
            transformOrigin: 'right',
        }
    },
    // Page 585, Line 11 (index 10) - "(30) وَفَاكِهَةً" (longer word → a bit more)
    585: {
        10: {
            transform: 'scaleX(0.86)',
            transformOrigin: 'right',
        }
    }
};
