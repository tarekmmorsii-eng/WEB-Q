import React from 'react';
import { SURAHS } from '../constants/surahData';

interface SurahFrameProps {
    surahNumber: number;
    t: any;
    language: string;
    onClick?: () => void;
    currentRating?: 'weak' | 'medium' | 'good' | null;
    isUnified?: boolean; // علامة التوافق: true = جميع الآيات متطابقة
    isActive?: boolean;
}

const SurahFrame: React.FC<SurahFrameProps> = ({ surahNumber, t, language, onClick, currentRating, isUnified, isActive = true }) => {
    const isArabic = language === 'ar';
    const info = SURAHS.find(s => s.number === surahNumber);
    const surahName = t.surahNames[surahNumber - 1] || (info ? info.name : 'Unknown');

    // Determine rating color
    const getRatingColor = () => {
        if (!currentRating) return 'transparent';
        switch (currentRating) {
            case 'good': return '#16a34a'; // green-600
            case 'medium': return '#eab308'; // yellow-500
            case 'weak': return '#dc2626'; // red-606
            default: return 'transparent';
        }
    };

    return (
        <div
            id={isActive ? "tour-surah-name" : undefined}
            className="w-full h-full my-0 relative select-none notranslate flex items-center justify-center"
            translate="no"
            onClick={onClick}
            style={{ cursor: onClick ? 'pointer' : 'default' }}
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 9 800 68"
                className="w-full h-full block"
                style={{ width: '100%', height: '100%' }}
                preserveAspectRatio="none"
            >
                {/* Main Outer Frame (Thin Line) */}
                <rect
                    x="2"
                    y="10"
                    width="796"
                    height="65"
                    rx="6"
                    ry="6"
                    fill="none"
                    className="stroke-amber-800 dark:stroke-amber-500"
                    strokeWidth="1.2"
                />

                {/* Inner Decorative Border */}
                <rect
                    x="5"
                    y="15"
                    width="790"
                    height="55"
                    rx="4"
                    ry="4"
                    fill="none"
                    className="stroke-amber-800 dark:stroke-amber-500"
                    strokeWidth="0.6"
                />

                {/* Left Medallion / Rosette - Moved further left */}
                <g transform="translate(30, 42.5) scale(0.6)" fill="none" className="stroke-amber-800 dark:stroke-amber-500">
                    <circle cx="0" cy="0" r="30" strokeWidth="1.5" />
                    <circle cx="0" cy="0" r="15" strokeWidth="1" />
                    <g strokeWidth="0.8">
                        <path d="M 0 -30 Q 10 -20 15 0 T 0 30 Q -10 20 -15 0 T 0 -30" opacity="0.6" />
                        <path d="M 30 0 Q 20 10 0 15 T -30 0 Q -20 -10 0 -15 T 30 0" opacity="0.6" />
                    </g>
                </g>

                {/* Right Medallion / Rosette (Mirrored) - Moved further right */}
                <g transform="translate(770, 42.5) scale(0.6)" fill="none" className="stroke-amber-800 dark:stroke-amber-500">
                    <circle cx="0" cy="0" r="30" strokeWidth="1.5" />
                    <circle cx="0" cy="0" r="15" strokeWidth="1" />
                    <g strokeWidth="0.8">
                        <path d="M 0 -30 Q 10 -20 15 0 T 0 30 Q -10 20 -15 0 T 0 -30" opacity="0.6" />
                        <path d="M 30 0 Q 20 10 0 15 T -30 0 Q -20 -10 0 -15 T 30 0" opacity="0.6" />
                    </g>
                </g>
            </svg>

            {/* HTML Text Overlay - Vertically Centered */}
            <div
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
            >
                <div className="flex items-center gap-6">
                    <span
                        style={{
                            fontFamily: isArabic ? "'custom_thuluth', 'DecoType Thuluth', 'Amiri', serif" : "'Almarai', sans-serif",
                            textRendering: 'optimizeLegibility',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            lineHeight: 1,
                            maxWidth: '70%',
                            whiteSpace: 'nowrap',
                            textAlign: 'center',
                            transform: 'translateY(-5%)'
                        }}
                        className="text-slate-800 dark:text-slate-200 text-[clamp(18px,6vw,28px)] sm:text-[clamp(28px,5vw,40px)] md:text-[50px] lg:text-[58px]"
                    >
                        {language === 'ar' ? `${t.surahPrefix} ${surahName}` : `${surahName} ${t.surah}`}
                    </span>

                    {/* Rating Indicator Circle - Left of name for Arabic */}
                    {currentRating && (
                        <div
                            className="rounded-full shadow-lg rating-indicator-dot"
                            style={{
                                backgroundColor: getRatingColor(),
                                flexShrink: 0,
                                width: '10px',
                                height: '10px'
                            }}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default SurahFrame;
