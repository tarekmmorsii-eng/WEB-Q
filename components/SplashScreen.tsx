import React, { useEffect, useState } from 'react';

interface SplashScreenProps {
    onFinish: () => void;
}

export default function SplashScreen({ onFinish }: SplashScreenProps) {
    const [isVisible, setIsVisible] = useState(true);
    const [opacity, setOpacity] = useState(1);

    useEffect(() => {
        // Logo duration
        const timer = setTimeout(() => {
            setOpacity(0);
            setTimeout(() => {
                setIsVisible(false);
                onFinish();
            }, 1000); // Fade out duration
        }, 2500); // Show for 2.5 seconds

        return () => {
            clearTimeout(timer);
        };
    }, [onFinish]);

    if (!isVisible) return null;

    return (
        <div
            className="fixed inset-0 z-[100000] flex flex-col items-center justify-center bg-[#000000] transition-opacity duration-1000"
            style={{ opacity }}
        >
            {/* Main Logo: Absolutely Centered */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 animate-in fade-in zoom-in duration-1000">
                <img
                    src="/logo_splash.png?v=6"
                    alt="مصحف المراجعة"
                    className="w-72 md:w-96 object-contain"
                />
            </div>

            {/* Connecting Line: Absolute between Center and Bottom */}
            {/*
                Calculation Logic:
                - Main Logo Center is 50%
                - Approx half-height of Main Logo is ~80px (mobile) to ~100px (desktop)
                - Line Starts below that (~50% + 100px)
                - Bottom Logo is at Bottom 10%
                - Line Ends above that (~10% + 60px)
                - "80% of the distance" -> We can just use a gap in the gradient or a scaleY
                Let's use a simple line that spans the gap but has top/bottom margins to equate to roughly 80% length.
            */}
            {/* Connecting Line: Absolute between Center and Bottom */}
            {/*
                Calculation Logic:
                - Main Logo Center is 50%
                - Approx half-height of Main Logo is ~80px (mobile) to ~100px (desktop)
                - Line Starts below that (~50% + 100px)
                - Bottom Logo is at Bottom 10%
                - Line Ends above that (~10% + 60px)
                - "80% of the distance" -> We can just use a gap in the gradient or a scaleY
                Let's use a simple line that spans the gap but has top/bottom margins to equate to roughly 80% length.
            */}
            <div
                className="absolute left-1/2 -translate-x-1/2 w-[2px] bg-[#ca8a04]/80 animate-in fade-in duration-1000 delay-500 fill-mode-forwards"
                style={{
                    // Start roughly below the main logo (50% + 110px offset)
                    top: 'calc(50% + 110px)',
                    // End roughly above the bottom logo (10% + 70px icon height + offset)
                    bottom: 'calc(10% + 80px)',
                    // If we want "not complete line", we can reduce height or add scaling
                }}
            >
                {/* Visual trick: If we want it strictly "80% of the distance", we can adding scale-y-80 but that scales from center */}
            </div>

            {/* Bottom Logo: 10% from bottom */}
            <div className="absolute bottom-[10%] left-1/2 -translate-x-1/2 z-10 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300 fill-mode-forwards">
                <img
                    src="/splash_bottom_icon.png?v=1"
                    alt="Logo Icon"
                    className="w-12 h-12 md:w-16 md:h-16 object-contain drop-shadow-[0_0_10px_rgba(202,138,4,0.3)]"
                />
            </div>
        </div>
    );
}
