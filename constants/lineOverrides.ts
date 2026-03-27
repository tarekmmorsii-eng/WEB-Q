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
    // Page 576, Line 10 (index 9) - Compressed further to reveal the first letter of "إِنَّهَا"
    576: {
        9: { 
            transform: 'scaleX(0.94)', 
            transformOrigin: 'right',
            wordSpacing: '-12px',
            paddingLeft: '10px'
        }
    },
    // Page 577, Line 12 (index 11) - Fixes clipping on "هَلْ أَتَى..." (Al-Insan 1)
    577: {
        11: {
            transform: 'scaleX(0.94)',
            transformOrigin: 'right',
            wordSpacing: '-12px',
            paddingLeft: '10px'
        }
    },
    // Page 578, Line 12 (index 11) - Safety fix for Al-Insan 1 if numbered differently
    578: {
        11: {
            transform: 'scaleX(0.94)',
            transformOrigin: 'right',
            wordSpacing: '-12px',
            paddingLeft: '10px'
        }
    }
};
