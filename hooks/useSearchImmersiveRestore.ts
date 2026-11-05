import { useEffect } from 'react';
import { Capacitor, registerPlugin } from '@capacitor/core';

const MushafSystemBars = registerPlugin<{
    setVisible(options: { visible: boolean; darkIcons: boolean }): Promise<{ top?: number; bottom?: number }>;
}>('MushafSystemBars');

export function useSearchImmersiveRestore(isSearchOpen: boolean, showUi: boolean, darkIcons: boolean) {
    useEffect(() => {
        if (Capacitor.getPlatform() !== 'android') return;
        document.documentElement.dataset.androidSystemBars = String(showUi);

        // Modal removal need not change Activity focus. Restore after React's
        // commit, including when the keyboard was hidden before pressing Go.
        const frame = requestAnimationFrame(() => {
            void MushafSystemBars.setVisible({ visible: showUi, darkIcons }).then(insets => {
                if (Number.isFinite(insets?.top)) document.documentElement.style.setProperty('--android-status-bar-height', `${insets.top}px`);
                if (Number.isFinite(insets?.bottom)) document.documentElement.style.setProperty('--android-navigation-bar-height', `${insets.bottom}px`);
            }).catch(error => {
                console.warn('Could not sync Android system bars', error);
            });
        });
        return () => cancelAnimationFrame(frame);
    }, [isSearchOpen, showUi, darkIcons]);
}
