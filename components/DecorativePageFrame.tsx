import React from 'react';

interface DecorativePageFrameProps {
    children: React.ReactNode;
    pageNumber: number;
}

const DecorativePageFrame: React.FC<DecorativePageFrameProps> = ({ children, pageNumber }) => {
    return (
        <div className="relative w-full h-full flex items-center justify-center p-4 md:p-8 lg:p-12 min-h-[85vh]">
            {/* Background Decorative SVG Frame */}
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                <svg
                    viewBox="0 0 800 1100"
                    preserveAspectRatio="none"
                    className="w-full h-full"
                >
                    {/* Outer thick artistic border */}
                    <rect
                        x="10"
                        y="10"
                        width="780"
                        height="1080"
                        fill="none"
                        className="stroke-amber-600/30 dark:stroke-[var(--accent-color)] dark:opacity-20"
                        strokeWidth="15"
                    />

                    {/* Double golden line border */}
                    <rect
                        x="30"
                        y="30"
                        width="740"
                        height="1040"
                        fill="none"
                        className="stroke-amber-600 dark:stroke-[var(--accent-color)]"
                        strokeWidth="3"
                    />
                    <rect
                        x="40"
                        y="40"
                        width="720"
                        height="1020"
                        fill="none"
                        className="stroke-amber-700/50 dark:stroke-[var(--accent-color)] dark:opacity-50"
                        strokeWidth="1"
                    />

                    {/* Corner Ornaments */}
                    {[
                        "translate(40, 40)",
                        "translate(760, 40) rotate(90)",
                        "translate(760, 1060) rotate(180)",
                        "translate(40, 1060) rotate(270)"
                    ].map((transform, i) => (
                        <g key={i} transform={transform} className="fill-amber-700 dark:fill-[var(--accent-color)]">
                            <path d="M 0 0 L 60 0 C 40 5 35 15 35 35 L 35 60 C 15 40 5 35 0 35 Z" />
                            <circle cx="15" cy="15" r="4" />
                        </g>
                    ))}

                    {/* Side decorative nodes */}
                    <g className="fill-amber-700 dark:fill-[var(--accent-color)] opacity-60">
                        {/* Left Side */}
                        <path d="M 30 550 l -20 -30 v 60 z" />
                        {/* Right Side */}
                        <path d="M 770 550 l 20 -30 v 60 z" />
                    </g>

                    {/* Inner thin frame around text area */}
                    <rect
                        x="100"
                        y="100"
                        width="600"
                        height="900"
                        fill="none"
                        className="stroke-amber-500/20"
                        strokeWidth="1"
                        rx="20"
                    />
                </svg>
            </div>

            {/* Content Area */}
            <div className="relative z-10 w-full max-w-[550px] mx-auto py-8">
                {children}
            </div>
        </div>
    );
};

export default DecorativePageFrame;
