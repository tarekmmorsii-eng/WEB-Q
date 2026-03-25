import React from 'react';
import clsx from 'clsx';

interface BetaBadgeProps {
    className?: string;
    onClick?: () => void;
}

const BetaBadge: React.FC<BetaBadgeProps> = ({ className }) => {
    return (
        <div
            className={clsx("relative inline-flex items-center group z-[100]", className)}
        >
            <div
                className={clsx(
                    "flex items-center gap-1 px-2 py-0.5 rounded-full",
                    "bg-gradient-to-r from-amber-400 to-orange-500",
                    "text-white text-[10px] font-bold tracking-wider",
                    "shadow-md transition-all transform hover:scale-105",
                    "animate-pulse-slow"
                )}
                style={{ animation: 'pulse 3s infinite' }}
            >
                <span>BETA</span>
            </div>

            <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.05); }
        }
      `}</style>
        </div>
    );
};

export default BetaBadge;
