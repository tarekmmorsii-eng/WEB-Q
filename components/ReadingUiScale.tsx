import React, { createContext, useContext } from 'react';
import './readingUiScale.css';

const ReadingUiScaleContext = createContext(1);

export function ReadingUiScaleProvider({ active, fontSize, children }: {
    active: boolean; fontSize: number; children: React.ReactNode;
}) {
    // Keep controls at least their normal size when Quran text is reduced.
    const scale = active ? Math.max(1, fontSize / 32) : 1;
    return <ReadingUiScaleContext.Provider value={scale}>{children}</ReadingUiScaleContext.Provider>;
}

export const useReadingUiScale = () => useContext(ReadingUiScaleContext);

/** No extra element or styles in the original Mushaf view. Nested screens
 * inherit the same scale, including screens returned by the dialog itself. */
export function ReadingDialogScale({ children, fullScreen = false }: {
    children: React.ReactNode; fullScreen?: boolean;
}) {
    const scale = useReadingUiScale();
    if (scale === 1) return <>{children}</>;
    return <div className="reading-dialog-scale" data-reading-dialog={fullScreen ? 'screen' : 'panel'}
        style={{ zoom: scale, '--reading-ui-scale': scale } as React.CSSProperties}>{children}</div>;
}
