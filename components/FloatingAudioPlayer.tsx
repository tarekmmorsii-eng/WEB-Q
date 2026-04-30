import React, { useState, useEffect } from 'react';
import { 
    Play, Pause, X, Loader2, Music, 
    Settings as SettingsIcon, 
    Square, SkipBack, SkipForward, 
    Repeat, Gauge 
} from 'lucide-react';
import { useReciters } from '../hooks/useReciters';
import { Language, translations } from '../i18n/translations';
import clsx from 'clsx';

interface FloatingAudioPlayerProps {
    isOpen: boolean;
    onClose: () => void;
    currentLanguage: Language;
    selectedReciterId: string;
    onSelectReciter: (id: string) => void;
    isPlaying: boolean;
    isPaused: boolean;
    onTogglePlay: () => void;
    onOpenSettings: () => void;
    onStop: () => void;
    onNext: () => void;
    onPrevious: () => void;
    playbackRate: number;
    groupRepetitions: number;
    ayahRepetitions: number;
    onToggleRepeat: () => void;
    onToggleSpeed: () => void;
    currentContext?: string; // e.g. "سورة البقرة - آية 1"
    isUiVisible: boolean;
}

export default function FloatingAudioPlayer({
    isOpen,
    onClose,
    currentLanguage,
    selectedReciterId,
    onSelectReciter,
    isPlaying,
    isPaused,
    onTogglePlay,
    onOpenSettings,
    onStop,
    onNext,
    onPrevious,
    playbackRate,
    groupRepetitions,
    ayahRepetitions,
    onToggleRepeat,
    onToggleSpeed,
    currentContext,
    isUiVisible
}: FloatingAudioPlayerProps) {
    const { reciters, loading } = useReciters();
    const t = translations[currentLanguage] || translations.ar;
    const isRTL = t.dir === 'rtl';

    // State for sticky behavior
    const [isSticky, setIsSticky] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 150) {
                setIsSticky(true);
            } else {
                setIsSticky(false);
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    if (!isOpen) return null;

    // The user wants to see controls only when active
    const showControls = isPlaying;

    return (
        <div 
            id="tour-audio-player"
            className={clsx(
                "fixed z-[1000] transition-all duration-700 ease-in-out flex items-center pointer-events-auto shadow-2xl overflow-hidden",
                isSticky 
                    ? "top-0 left-0 right-0 w-full rounded-none px-4 py-3 bg-[var(--bg-card)]/95 backdrop-blur-md border-b border-[var(--border-primary)]" 
                    : "bottom-[85px] md:bottom-10 left-1/2 -translate-x-1/2 w-auto max-w-[calc(100vw-24px)] md:max-w-[95vw] rounded-2xl px-2 py-1.5 md:px-3 md:py-2 bg-[var(--bg-card)] border border-[var(--border-primary)]",
                (!isUiVisible && isPlaying && !isPaused) 
                    ? (isSticky ? "-translate-y-full opacity-0" : "translate-y-[200%] opacity-0")
                    : "translate-y-0 opacity-100",
                isRTL ? "flex-row-reverse" : "flex-row",
                showControls ? "min-w-[320px]" : "min-w-[280px]"
            )}
        >
            <div className={clsx("flex items-center gap-3 w-full justify-between", isRTL ? "flex-row-reverse" : "flex-row")}>
                
                {showControls ? (
                    /* --- FULL CONTROL BAR VIEW --- */
                    <div className="flex flex-col gap-1 w-full min-w-0">
                        {/* Context info (Reciter • Surah Name - Ayah Number) */}
                        {currentContext && (
                            <div 
                                className="text-[10px] text-amber-500/80 font-bold px-2 text-center uppercase tracking-wider w-full overflow-hidden text-ellipsis whitespace-nowrap"
                                title={reciters.find(r => r.id === selectedReciterId) ? `${reciters.find(r => r.id === selectedReciterId)?.name} • ${currentContext}` : currentContext}
                            >
                                {(() => {
                                    const r = reciters.find(rec => rec.id === selectedReciterId);
                                    const rName = r ? r.name : '';
                                    return rName ? `${rName} • ${currentContext}` : currentContext;
                                })()}
                            </div>
                        )}
                        <div className={clsx("flex items-center gap-1.5 md:gap-4 w-full justify-center py-0.5 md:py-1", isRTL ? "flex-row-reverse" : "flex-row")}>

                        {/* Stop Button */}
                        <button onClick={onStop} className="p-1.5 md:p-2 text-[var(--text-primary)] opacity-60 hover:opacity-100 transition-colors" title={t.stop || 'Stop'}>
                            <Square size={16} md:size={18} fill="currentColor" />
                        </button>

                        {/* Previous Button */}
                        <button onClick={onPrevious} className="p-1.5 md:p-2 text-[var(--text-primary)] opacity-60 hover:opacity-100 transition-colors" title={t.previous || 'Previous'}>
                            <SkipBack size={18} md:size={20} fill="currentColor" />
                        </button>

                        {/* Play/Pause Button */}
                        <button
                            onClick={onTogglePlay}
                            className="w-8 h-8 md:w-10 md:h-10 bg-amber-500 hover:bg-amber-600 text-white rounded-full flex items-center justify-center transition-transform active:scale-90 shadow-lg"
                        >
                            {isPlaying && !isPaused ? <Pause fill="currentColor" size={16} md:size={20} /> : <Play fill="currentColor" size={16} md:size={20} className="ml-0.5 md:ml-1" />}
                        </button>

                        {/* Next Button */}
                        <button onClick={onNext} className="p-1.5 md:p-2 text-[var(--text-primary)] opacity-60 hover:opacity-100 transition-colors" title={t.next || 'Next'}>
                            <SkipForward size={18} md:size={20} fill="currentColor" />
                        </button>

                        {/* Repeat Status Button */}
                        <button 
                            onClick={onToggleRepeat}
                            className="flex items-center gap-0.5 md:gap-1 px-1.5 py-0.5 md:px-2 md:py-1 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-primary)] text-[9px] md:text-[10px] font-bold text-[var(--text-primary)] opacity-40 hover:bg-[var(--bg-primary)] hover:opacity-100 transition-all active:scale-95"
                            title={t.repeatMode || 'Repeat Mode'}
                        >
                            <Repeat size={10} md:size={12} />
                            <span>{ayahRepetitions === -1 ? '∞' : ayahRepetitions}</span>
                        </button>

                        {/* Speed Status Button */}
                        <button 
                            onClick={onToggleSpeed}
                            className="flex items-center gap-0.5 md:gap-1 px-1.5 py-0.5 md:px-2 md:py-1 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-primary)] text-[9px] md:text-[10px] font-bold text-cyan-400 hover:bg-cyan-400/10 transition-all active:scale-95"
                            title={t.playbackSpeed || 'Playback Speed'}
                        >
                            <Gauge size={10} md:size={12} />
                            <span>{playbackRate}x</span>
                        </button>

                        {/* Settings Button */}
                        <button onClick={onOpenSettings} className="p-1.5 md:p-2 text-[var(--text-primary)] opacity-40 hover:opacity-100 transition-colors">
                            <SettingsIcon size={16} md:size={18} />
                        </button>

                        {/* Close Button */}
                        <button onClick={onClose} className="p-1.5 md:p-2 text-[var(--text-primary)] opacity-20 hover:text-red-500 transition-colors border-l border-[var(--border-primary)] ml-1 md:ml-2">
                            <X size={16} md:size={18} />
                        </button>
                    </div>
                </div>
                ) : (
                    /* --- SELECTION MODE VIEW (Current Look) --- */
                    <>
                        <button
                            onClick={onTogglePlay}
                            className="flex-shrink-0 w-9 h-9 md:w-11 md:h-11 bg-amber-500 hover:bg-amber-600 text-white rounded-full flex items-center justify-center transition-transform hover:scale-105 active:scale-95 shadow-md"
                        >
                            <Play fill="currentColor" size={18} md:size={22} className={isRTL ? "mr-0.5" : "ml-0.5 md:ml-1"} />
                        </button>

                        <div className="flex-1 min-w-[140px] md:min-w-[180px] flex items-center px-1">
                            {loading ? (
                                <div className="flex items-center gap-2 text-xs md:text-sm text-gray-500">
                                    <Loader2 className="animate-spin" size={14} md:size={16} />
                                    <span>{t.loading || 'Loading...'}</span>
                                </div>
                            ) : (
                                <select
                                    value={selectedReciterId}
                                    onChange={(e) => onSelectReciter(e.target.value)}
                                    className={clsx(
                                        "w-full bg-[var(--bg-secondary)] border border-[var(--border-primary)] outline-none focus:ring-1 focus:ring-amber-500 rounded-xl py-1.5 md:py-2 px-2 md:px-3 text-xs md:text-sm font-semibold text-[var(--text-primary)] appearance-none cursor-pointer",
                                        isRTL ? "text-right" : "text-left"
                                    )}
                                    style={{
                                        backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23f59e0b' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                                        backgroundPosition: isRTL ? 'left 0.5rem center' : 'right 0.5rem center',
                                        backgroundRepeat: 'no-repeat',
                                        backgroundSize: '1.2em 1.2em',
                                        paddingRight: !isRTL ? '1.5rem md:2rem' : '0.5rem',
                                        paddingLeft: isRTL ? '1.5rem md:2rem' : '0.5rem'
                                    }}
                                >
                                    {reciters.map(r => (
                                        <option key={r.id} value={r.id} className="bg-slate-800 text-white text-xs md:text-sm" disabled={r.disabled}>
                                            {t.reciters && t.reciters[r.id] ? t.reciters[r.id] : r.name}
                                        </option>
                                    ))}
                                </select>
                            )}
                        </div>

                        <button onClick={onOpenSettings} className="p-1.5 md:p-2 text-amber-500 hover:bg-white/5 rounded-full transition-colors">
                            <SettingsIcon size={18} md:size={20} />
                        </button>

                        <button onClick={onClose} className="p-1.5 md:p-2 text-[var(--text-primary)] opacity-20 hover:text-red-500 transition-colors">
                            <X size={18} md:size={20} />
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
