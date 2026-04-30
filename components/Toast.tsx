import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import clsx from 'clsx';

interface ToastProps {
    message: string | null;
    onClose: () => void;
    duration?: number;
    actions?: {
        label: string;
        onClick: () => void;
        variant?: 'primary' | 'secondary';
    }[];
}

export default function Toast({ message, onClose, duration = 2000, actions }: ToastProps) {
    useEffect(() => {
        if (message && (!actions || actions.length === 0)) { // Only auto-close if no action is required
            const timer = setTimeout(() => {
                onClose();
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [message, duration, onClose, actions]);

    if (!message) return null;

    return (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[200] animate-in fade-in slide-in-from-top-5 duration-300 w-max max-w-[95vw]">
            <div className="bg-slate-900/95 backdrop-blur-sm text-white px-5 py-3 rounded-2xl shadow-2xl border border-white/10 text-sm font-medium flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <span className="flex-1 text-center">{message}</span>
                </div>

                {actions && actions.map((action, idx) => (
                    <button
                        key={idx}
                        onClick={action.onClick}
                        className={clsx(
                            "px-4 py-1.5 rounded-xl text-xs font-bold transition-all hover:scale-105 active:scale-95 shadow-lg",
                            action.variant === 'secondary'
                                ? "bg-slate-700 hover:bg-slate-600 text-slate-200"
                                : "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/20"
                        )}
                    >
                        {action.label}
                    </button>
                ))}

                <button
                    onClick={onClose}
                    className="p-1.5 hover:bg-white/10 rounded-full transition-colors group"
                    title="Dismiss"
                >
                    <X size={18} className="text-gray-400 group-hover:text-white" />
                </button>
            </div>
        </div>
    );
}
