import React, { useEffect, useState } from 'react';
import { MousePointer2 } from 'lucide-react';
import clsx from 'clsx';
import { Translations } from '../i18n/translations';

interface TourClickOverlayProps {
    isOpen: boolean;
    onComplete: () => void;
    t: Translations;
}

export default function TourClickOverlay({ isOpen, onComplete, t }: TourClickOverlayProps) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => setIsVisible(true), 100);
        } else {
            setIsVisible(false);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const isRTL = t.dir === 'rtl';

    return (
        <div
            onClick={onComplete}
            className="fixed inset-0 z-[200] cursor-pointer flex flex-col items-center justify-center font-sans"
            dir={t.dir}
        >
            {/* Semi-transparent Dark Layer (lighter than modal to see content) */}
            <div
                className={clsx(
                    "absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-500",
                    isVisible ? "opacity-100" : "opacity-0"
                )}
            />

            {/* Floating Instruction Box */}
            <div className={clsx(
                "relative z-10 bg-white dark:bg-slate-800 px-8 py-6 rounded-2xl shadow-2xl border border-amber-200 dark:border-slate-600 max-w-md text-center transform transition-all duration-700 delay-100",
                isVisible ? "translate-y-0 opacity-100 scale-100" : "translate-y-10 opacity-0 scale-90"
            )}>
                <p className="text-xl font-medium text-slate-800 dark:text-white leading-relaxed">
                    {t.tourClickAnywhereTitle} <br />
                    <span className="text-amber-600 dark:text-amber-500 font-bold block mt-2">{t.tourClickAnywhereSubtitle}</span>
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                    {t.tourClickAnywhereDesc}
                </p>
            </div>

            {/* Animated Hands */}
            {/* Hand 1: Top Right / Top Left for RTL */}
            <div className={clsx(
                "absolute top-1/4 animate-bounce-slow opacity-80 pointer-events-none",
                isRTL ? "left-1/4" : "right-1/4"
            )}>
                <div className="relative">
                    <div className="absolute -inset-4 bg-white/30 rounded-full animate-ping"></div>
                    <MousePointer2 size={48} className={clsx("text-white drop-shadow-lg fill-amber-500", isRTL && "-scale-x-100")} />
                </div>
            </div>

            {/* Hand 2: Bottom Left / Bottom Right for RTL */}
            <div className={clsx(
                "absolute bottom-1/4 animate-bounce-slow [animation-delay:500ms] opacity-80 pointer-events-none",
                isRTL ? "right-1/4" : "left-1/4"
            )}>
                <div className="relative">
                    <div className="absolute -inset-4 bg-white/30 rounded-full animate-ping [animation-delay:500ms]"></div>
                    <MousePointer2 size={48} className={clsx("text-white drop-shadow-lg fill-emerald-500", isRTL && "-scale-x-100")} />
                </div>
            </div>

            {/* Hand 3: Center Bottom (Mobile style tap) */}
            <div className="absolute bottom-1/3 left-1/2 -translate-x-1/2 animate-bounce-slow [animation-delay:1000ms] opacity-80 pointer-events-none">
                <div className="relative">
                    <div className="absolute -inset-4 bg-white/30 rounded-full animate-ping [animation-delay:1000ms]"></div>
                    <MousePointer2 size={48} className="text-white drop-shadow-lg fill-blue-500" />
                </div>
            </div>

        </div>
    );
}
