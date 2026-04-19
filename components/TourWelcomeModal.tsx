import React, { useEffect, useState } from 'react';
import { X, Sparkles, MoveRight, CheckCircle2, AlertTriangle } from 'lucide-react';
import clsx from 'clsx';

import { Translations } from '../i18n/translations';

interface TourWelcomeModalProps {
    isOpen: boolean;
    onStart: () => void;
    onClose: () => void;
    t: Translations;
}

export default function TourWelcomeModal({ isOpen, onStart, onClose, t }: TourWelcomeModalProps) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (isOpen) {
            // Small delay for animation
            const timer = setTimeout(() => setIsVisible(true), 100);
            return () => clearTimeout(timer);
        } else {
            setIsVisible(false);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            {/* Blurred Backdrop */}
            <div
                className={clsx(
                    "absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity duration-500 ease-out",
                    isVisible ? "opacity-100" : "opacity-0"
                )}
            />

            {/* Modal Container */}
            <div
                className={clsx(
                    "relative w-full max-w-lg bg-[var(--bg-card)] backdrop-blur-xl rounded-3xl shadow-2xl border border-[var(--border-primary)] p-8 flex flex-col items-center text-center transform transition-all duration-700 cubic-bezier(0.34, 1.56, 0.64, 1)",
                    isVisible ? "scale-100 translate-y-0 opacity-100" : "scale-90 translate-y-10 opacity-0"
                )}
            >
                {/* Decorative Elements */}
                <div className="absolute top-0 left-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
                <div className="absolute bottom-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none" />

                {/* Logo Section */}
                <div className="relative mb-6 group">
                    <div className="absolute inset-0 bg-amber-500/20 blur-xl rounded-full animate-pulse-slow"></div>
                    <div className="relative w-24 h-24 bg-[var(--bg-card)] rounded-full p-1 shadow-lg ring-4 ring-amber-600/20 transition-transform duration-500 group-hover:scale-110">
                        <img
                            src="/final_logo.png"
                            alt="Logo"
                            className="w-full h-full rounded-full object-cover"
                        />
                    </div>
                    <div className="absolute -bottom-2 -right-2 bg-amber-500 text-white p-1.5 rounded-full shadow-lg animate-bounce-slow">
                        <Sparkles size={16} fill="currentColor" />
                    </div>
                </div>

                {/* Content */}
                <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-3 leading-tight">
                    {t.tourWelcomeTitle} <br />
                    <span className="text-amber-600 dark:text-amber-500">{t.tourWelcomeSubtitle}</span>
                </h2>

                <p className="text-[var(--text-primary)] opacity-70 mb-4 max-w-sm text-lg leading-relaxed">
                    {t.tourWelcomeDesc}
                </p>
                <div className="mb-8 w-full max-w-sm">
                    <div className="flex items-center gap-3 bg-[var(--bg-secondary)] py-3 px-4 rounded-2xl border border-[var(--border-primary)] shadow-sm">
                        <AlertTriangle className="text-red-600 dark:text-red-400 shrink-0" size={24} />
                        <p className="text-[var(--text-primary)] opacity-70 text-[1.05rem] font-bold leading-tight">
                            {t.tourBetaNote}
                        </p>
                    </div>
                </div>


                {/* Actions */}
                <div className="flex flex-col gap-3 w-full max-w-xs">
                    <button
                        onClick={onStart}
                        className="w-full py-4 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-white rounded-2xl font-bold text-lg shadow-lg shadow-amber-500/25 transition-all duration-300 transform hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-2 group/btn"
                    >
                        <span>{t.tourStartAction}</span>
                        <CheckCircle2 size={20} className="group-hover/btn:scale-110 transition-transform" />
                    </button>

                    <button
                        onClick={onClose}
                        className="w-full py-3 bg-transparent text-[var(--text-primary)] opacity-50 hover:opacity-100 font-medium text-sm transition-colors flex items-center justify-center gap-1 hover:bg-[var(--bg-primary)] hover:bg-opacity-10 rounded-xl"
                    >
                        <span>{t.tourSkipAction}</span>
                        <X size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
}
