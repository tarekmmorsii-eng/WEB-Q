import React from 'react';

// Helper to get surah number from name (simplified map for demonstration, in real app pass number prop)
const getSurahNumberByName = (name: string): string => {
  return "001"; // Placeholder if number not passed.
};

interface SurahHeaderProps {
  surahName: string;
  surahNumber?: number; // Add optional prop
}

const SurahHeader: React.FC<SurahHeaderProps> = ({ surahName }) => {
  return (
    <div className="w-full flex justify-center my-1 px-2 relative">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 800 120"
        className="w-full max-w-[800px] h-auto"
        style={{ minHeight: '35px', maxHeight: '120px' }}
      >
        {/* Main Outer Frame (Thin Line) */}
        <rect
          x="15"
          y="10"
          width="770"
          height="100"
          rx="8"
          ry="8"
          fill="none"
          className="stroke-[var(--accent-color)]"
          strokeWidth="1.5"
        />

        {/* Inner Decorative Border */}
        <rect
          x="20"
          y="15"
          width="760"
          height="90"
          rx="6"
          ry="6"
          fill="none"
          className="stroke-[var(--accent-color)]"
          strokeWidth="0.8"
        />

        {/* Left Medallion / Rosette */}
        <g transform="translate(60, 60)" fill="none" strokeWidth="1.2" className="stroke-[var(--accent-color)]">
          <circle cx="0" cy="0" r="30" strokeWidth="1.5" />
          <circle cx="0" cy="0" r="15" strokeWidth="1" />
          <g strokeWidth="0.8">
            <path d="M 0 -30 Q 10 -20 15 0 T 0 30 Q -10 20 -15 0 T 0 -30" opacity="0.6" />
            <path d="M 30 0 Q 20 10 0 15 T -30 0 Q -20 -10 0 -15 T 30 0" opacity="0.6" />
            <path d="M 25 -10 Q 15 -25 0 -28 L 0 -20 Q 10 -15 25 -10 Z" opacity="0.8" />
            <path d="M 25 10 Q 15 25 0 28 L 0 20 Q 10 15 25 10 Z" opacity="0.8" />
            <path d="M -25 -10 Q -15 -25 0 -28 M 0 -20 Q -10 -15 -25 -10 Z" opacity="0.8" transform="scale(-1, 1)" />
            <path d="M -25 10 Q -15 25 0 28 M 0 20 Q -10 15 -25 10 Z" opacity="0.8" transform="scale(-1, 1)" />
          </g>
        </g>

        {/* Right Medallion / Rosette (Mirrored) */}
        <g transform="translate(740, 60)" fill="none" strokeWidth="1.2" className="stroke-[var(--accent-color)]">
          <circle cx="0" cy="0" r="30" strokeWidth="1.5" />
          <circle cx="0" cy="0" r="15" strokeWidth="1" />
          <g strokeWidth="0.8">
            <path d="M 0 -30 Q 10 -20 15 0 T 0 30 Q -10 20 -15 0 T 0 -30" opacity="0.6" />
            <path d="M 30 0 Q 20 10 0 15 T -30 0 Q -20 -10 0 -15 T 30 0" opacity="0.6" />
            <path d="M 25 -10 Q 15 -25 0 -28 L 0 -20 Q 10 -15 25 -10 Z" opacity="0.8" />
            <path d="M 25 10 Q 15 25 0 28 L 0 20 Q 10 15 25 10 Z" opacity="0.8" />
            <path d="M -25 -10 Q -15 -25 0 -28 M 0 -20 Q -10 -15 -25 -10 Z" opacity="0.8" transform="scale(-1, 1)" />
            <path d="M -25 10 Q -15 25 0 28 M 0 20 Q -10 15 -25 10 Z" opacity="0.8" transform="scale(-1, 1)" />
          </g>
        </g>
      </svg>

      {/* HTML Text Overlay for Robust Ligature Support */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        style={{ paddingBottom: '2px' }}
      >
        <span
          style={{
            fontFamily: "'custom_thuluth', 'DecoType Thuluth', 'Amiri', serif",
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
          className="text-[var(--text-primary)] opacity-90 text-[clamp(18px,6vw,28px)] sm:text-[clamp(28px,5vw,40px)] md:text-[50px] lg:text-[58px]"
        >
          {surahName}
        </span>
      </div>
    </div>
  );
};

export default SurahHeader;
