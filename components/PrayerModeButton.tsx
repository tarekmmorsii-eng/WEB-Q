import React, { useState, useEffect, useRef } from 'react';
import { X, MousePointer2 } from 'lucide-react';
import clsx from 'clsx';

interface PrayerModeButtonProps {
    onDismiss: () => void;
    t: any;
}

export default function PrayerModeButton({ onDismiss, t }: PrayerModeButtonProps) {
    const [position, setPosition] = useState({
        x: window.innerWidth - 80, // Bottom Right X
        y: window.innerHeight - 130 // Bottom Right Y (Between lines approx)
    });
    const [isDragging, setIsDragging] = useState(false);
    const [showDeleteZone, setShowDeleteZone] = useState(false);
    const [isOverDeleteZone, setIsOverDeleteZone] = useState(false);
    const lastPos = useRef({ x: 0, y: 0 });
    const dragThreshold = 5;
    const moved = useRef(false);
    const [isFlashing, setIsFlashing] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setIsFlashing(false), 5000);
        return () => clearTimeout(timer);
    }, []);

    // Initial position adjustment on mount to ensure it's within bounds
    useEffect(() => {
        const handleResize = () => {
            setPosition(prev => ({
                x: Math.min(prev.x, window.innerWidth - 70),
                y: Math.min(prev.y, window.innerHeight - 150)
            }));
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleStart = (clientX: number, clientY: number) => {
        setIsDragging(true);
        // تم حذف إظهار منطقة الحذف من هنا لتظهر فقط عند التحريك
        lastPos.current = { x: clientX, y: clientY };
        moved.current = false;
    };

    const handleMove = (clientX: number, clientY: number) => {
        if (!isDragging) return;

        const deltaX = clientX - lastPos.current.x;
        const deltaY = clientY - lastPos.current.y;

        if (Math.abs(deltaX) > dragThreshold || Math.abs(deltaY) > dragThreshold) {
            if (!moved.current) {
                setShowDeleteZone(true); // إظهار منطقة الحذف فقط عند بدء السحب الفعلي
            }
            moved.current = true;
        }

        const newX = position.x + deltaX;
        const newY = position.y + deltaY;

        setPosition({ x: newX, y: newY });
        lastPos.current = { x: clientX, y: clientY };

        // Check if over delete zone (top center area)
        // Zone is roughly 100px from top, centered
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        const dist = Math.sqrt(Math.pow(clientX - centerX, 2) + Math.pow(clientY - centerY, 2));
        if (dist < 60) {
            setIsOverDeleteZone(true);
        } else {
            setIsOverDeleteZone(false);
        }
    };

    const handleEnd = () => {
        if (isOverDeleteZone) {
            onDismiss();
        }
        setIsDragging(false);
        setShowDeleteZone(false);
        setIsOverDeleteZone(false);
    };

    const handleClick = (e: React.MouseEvent | React.TouchEvent) => {
        // منع انتشار الحدث دائماً لضمان عدم تأثر قوائم التطبيق (Bars)
        e.preventDefault();
        e.stopPropagation();

        if (moved.current) {
            return;
        }

        // Logic to reveal next word
        // Logic to reveal next word - Updated for V2
        const firstHidden = document.querySelector('.text-transparent') as HTMLElement;
        if (firstHidden) {
            firstHidden.click();

            // Haptic feedback removed
        }
    };

    return (
        <>
            {showDeleteZone && (
                <div
                    className={clsx(
                        "fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[10000] w-24 h-24 rounded-full border-2 flex flex-col items-center justify-center transition-all duration-300",
                        isOverDeleteZone
                            ? "bg-red-500/20 border-red-500 scale-110 shadow-[0_0_20px_rgba(239,68,68,0.5)]"
                            : "bg-black/40 border-red-500/70"
                    )}
                >
                    <X className={clsx("transition-transform duration-300", isOverDeleteZone ? "scale-125 text-red-500" : "text-red-500")} size={32} />
                    <span className="text-[10px] text-red-100 font-medium mt-1 uppercase tracking-wider">{t.cancelMode}</span>
                </div>
            )}

            <button
                onMouseDown={(e) => handleStart(e.clientX, e.clientY)}
                onMouseMove={(e) => handleMove(e.clientX, e.clientY)}
                onMouseUp={handleEnd}
                onMouseLeave={handleEnd}
                onTouchStart={(e) => handleStart(e.touches[0].clientX, e.touches[0].clientY)}
                onTouchMove={(e) => handleMove(e.touches[0].clientX, e.touches[0].clientY)}
                onTouchEnd={handleEnd}
                onClick={handleClick}
                style={{
                    left: `${position.x}px`,
                    top: `${position.y}px`,
                    touchAction: 'none'
                }}
                className={clsx(
                    "fixed z-[9999] w-[70px] h-[70px] rounded-full shadow-2xl flex items-center justify-center transition-all",
                    "bg-gray-400/20 dark:bg-slate-600/30 border-[3px] border-yellow-500/50 hover:bg-gray-400/40", // خلفية شفافة وإطار نصف شفاف
                    isDragging ? "cursor-grabbing scale-95" : "cursor-grab",
                    isFlashing && "opacity-100 shadow-[0_0_25px_rgba(234,179,8,0.6)] border-yellow-400 ring-4 ring-yellow-400/50 animate-pulse bg-gray-400/60",
                    isOverDeleteZone && "bg-red-500 opacity-80"
                )}
                title={t.prayerModeTitle}
            >
                {/* Visual indicator on the button */}
                <div className="relative w-full h-full flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full border-2 border-white/10 animate-pulse" />
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                        <div className="w-4 h-4 rounded-full bg-yellow-500/50 border-2 border-yellow-200 shadow-[0_0_5px_rgba(250,204,21,0.5)]" />
                    </div>
                </div>
            </button>
        </>
    );
}
