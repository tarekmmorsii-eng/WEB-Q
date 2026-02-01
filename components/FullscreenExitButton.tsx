import React, { useState, useEffect, useRef } from 'react';
import { Minimize, X } from 'lucide-react';
import clsx from 'clsx';

interface FullscreenExitButtonProps {
    onDismiss: () => void;
    currentPage: number;
    t: any;
}

export default function FullscreenExitButton({ onDismiss, currentPage, t }: FullscreenExitButtonProps) {
    const [position, setPosition] = useState({
        x: 20, // Initial Position: Top Left
        y: 85  // Adjusted to be safely between line 1 and 2
    });
    const [isDragging, setIsDragging] = useState(false);
    const [isFlashing, setIsFlashing] = useState(true);
    const lastPos = useRef({ x: 0, y: 0 });
    const dragThreshold = 5;
    const moved = useRef(false);

    // Flash effect on mount, page change, or user interaction
    useEffect(() => {
        setIsFlashing(true);
        const timer = setTimeout(() => setIsFlashing(false), 3000); // 3 seconds flash
        return () => clearTimeout(timer);
    }, [currentPage]); // Re-trigger on page change

    // Resize handler
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
        setIsFlashing(true); // Flash on interaction
        const timer = setTimeout(() => setIsFlashing(false), 3000);

        lastPos.current = { x: clientX, y: clientY };
        moved.current = false;
    };

    const handleMove = (clientX: number, clientY: number) => {
        if (!isDragging) return;

        const deltaX = clientX - lastPos.current.x;
        const deltaY = clientY - lastPos.current.y;

        if (Math.abs(deltaX) > dragThreshold || Math.abs(deltaY) > dragThreshold) {
            moved.current = true;
        }

        const newX = position.x + deltaX;
        const newY = position.y + deltaY;

        setPosition({ x: newX, y: newY });
        lastPos.current = { x: clientX, y: clientY };
    };

    const handleEnd = () => {
        setIsDragging(false);
    };

    const handleClick = (e: React.MouseEvent | React.TouchEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (moved.current) {
            return;
        }

        // Exit Fullscreen
        onDismiss();
    };

    return (
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
                "fixed z-[9999] w-[60px] h-[60px] rounded-full flex items-center justify-center transition-all",
                "bg-transparent hover:bg-black/10 transition-colors duration-300",
                isFlashing ? "border-2 border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.5)]" : "border-0 border-transparent", // Flash border
                isDragging ? "cursor-grabbing scale-95 opacity-60" : "cursor-grab"
            )}
            title={t.exitFullscreen}
        >
            <div className="relative w-full h-full flex items-center justify-center text-blue-500">
                <Minimize size={28} />
            </div>
        </button>
    );
}
