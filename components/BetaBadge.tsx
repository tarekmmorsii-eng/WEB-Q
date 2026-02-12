import React, { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import clsx from 'clsx';

interface BetaBadgeProps {
    className?: string;
    onClick?: () => void;
}

const BetaBadge: React.FC<BetaBadgeProps> = ({ className, onClick }) => {
    const [showTooltip, setShowTooltip] = useState(false);

    // Auto-hide tooltip after 5 seconds
    const handleMouseEnter = () => {
        setShowTooltip(true);
        setTimeout(() => setShowTooltip(false), 5000);
    };

    return (
        <div
            className={clsx("relative inline-flex items-center group z-[100]", className)}
            onMouseEnter={handleMouseEnter}
            onClick={onClick}
        >
            <div
                className={clsx(
                    "flex items-center gap-1 px-2 py-0.5 rounded-full",
                    "bg-gradient-to-r from-amber-400 to-orange-500",
                    "text-white text-[10px] font-bold tracking-wider",
                    "shadow-md cursor-pointer hover:shadow-lg transition-all transform hover:scale-105",
                    "animate-pulse-slow" // We'll need to ensure this animation exists or use inline style
                )}
                style={{ animation: 'pulse 3s infinite' }}
            >
                <span>BETA</span>
            </div>

            {/* Tooltip */}
            <div
                className={clsx(
                    "absolute top-full mt-2 left-0 w-48 p-3 rounded-lg shadow-xl",
                    "bg-white dark:bg-slate-800 border border-amber-100 dark:border-slate-700",
                    "text-xs text-slate-600 dark:text-slate-300 z-[101]",
                    "transition-all duration-300 origin-top-left",
                    showTooltip ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"
                )}
            >
                <div className="flex items-start gap-2">
                    <AlertTriangle size={14} className="text-amber-500 shrink-0 mt-0.5" />
                    <p>
                        هذه نسخة تجريبية قيد التطوير. قد تواجه بعض الأخطاء.
                        <br />
                        <span className="text-amber-600 dark:text-amber-400 font-semibold cursor-pointer underline mt-1 block">
                            اضغط للإبلاغ عن مشكلة
                        </span>
                    </p>
                </div>
                <div className="absolute -top-1 left-4 w-2 h-2 bg-white dark:bg-slate-800 rotate-45 border-t border-l border-amber-100 dark:border-slate-700" />
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
