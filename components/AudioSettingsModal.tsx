import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { SURAHS } from '../constants/surahData';
import { Language, translations } from '../i18n/translations';
import clsx from 'clsx';

interface AudioSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentLanguage: Language;
    settings: {
        startSurah: number;
        startAyah: number;
        endSurah: number;
        endAyah: number;
        groupRepetitions: number;
        ayahRepetitions: number;
        playbackRate: number;
        useRangeOnly: boolean;
    };
    onApply: (newSettings: any) => void;
}

export default function AudioSettingsModal({
    isOpen,
    onClose,
    currentLanguage,
    settings,
    onApply
}: AudioSettingsModalProps) {
    const t = translations[currentLanguage] || translations.ar;
    const isRTL = t.dir === 'rtl';

    const [startSurah, setStartSurah] = useState(settings.startSurah);
    const [startAyah, setStartAyah] = useState(settings.startAyah);
    const [endSurah, setEndSurah] = useState(settings.endSurah);
    const [endAyah, setEndAyah] = useState(settings.endAyah);
    const [groupRepetitions, setGroupRepetitions] = useState(settings.groupRepetitions);
    const [ayahRepetitions, setAyahRepetitions] = useState(settings.ayahRepetitions);
    const [playbackRate, setPlaybackRate] = useState(settings.playbackRate);
    const [useRangeOnly, setUseRangeOnly] = useState(settings.useRangeOnly);

    // Sync internal state with props when modal opens or settings change
    useEffect(() => {
        if (isOpen) {
            setStartSurah(settings.startSurah);
            setStartAyah(settings.startAyah);
            setEndSurah(settings.endSurah);
            setEndAyah(settings.endAyah);
            setGroupRepetitions(settings.groupRepetitions);
            setAyahRepetitions(settings.ayahRepetitions);
            setPlaybackRate(settings.playbackRate);
            setUseRangeOnly(settings.useRangeOnly);
        }
    }, [isOpen, settings]);


    const GROUP_REP_OPTIONS = [1, 2, 3, 5, 10, -1];
    const AYAH_REP_OPTIONS = [1, 2, 3, 5, 10, -1];
    const SPEED_OPTIONS = [0.75, 1, 1.25, 1.5, 1.75];

    const getAyahCount = (surahNum: number) => {
        const surah = SURAHS.find(s => s.number === surahNum);
        return surah ? surah.ayahCount : 1;
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div 
                className={clsx(
                    "bg-[var(--bg-card)] text-[var(--text-primary)] w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-[var(--border-primary)]",
                    isRTL ? "font-arabic" : ""
                )}
                dir={isRTL ? "rtl" : "ltr"}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-3 border-b border-[var(--border-primary)] bg-[var(--bg-secondary)]">
                    <h2 className="text-xl font-bold text-amber-500">
                        {t.recitationSettings || 'Recitation Settings'}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors text-[var(--text-primary)] opacity-50 hover:opacity-100">
                        <X size={18} />
                    </button>
                </div>

                <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto custom-scrollbar">
                    {/* Range Selection */}
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs text-[var(--text-primary)] opacity-40 block">
                                    {t.fromSurah || 'From Surah'}
                                </label>
                                <select 
                                    value={startSurah}
                                    onChange={(e) => {
                                        const val = Number(e.target.value);
                                        setStartSurah(val);
                                        setStartAyah(1);
                                        // Ensure endSurah is not before startSurah
                                        if (endSurah < val) {
                                            setEndSurah(val);
                                            setEndAyah(1);
                                        }
                                    }}
                                    className="w-full bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl px-3 py-2 text-sm outline-none focus:border-amber-500 transition-colors text-[var(--text-primary)]"
                                >
                                    {SURAHS.map(s => <option key={s.number} value={s.number}>{s.number}. {t.surahNames[s.number - 1] || s.name}</option>)}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs text-[var(--text-primary)] opacity-40 block">
                                    {t.ayahText || 'Ayah'}
                                </label>
                                <select 
                                    value={startAyah}
                                    onChange={(e) => {
                                        const val = Number(e.target.value);
                                        setStartAyah(val);
                                        // If same surah, ensure endAyah is not before startAyah
                                        if (startSurah === endSurah && endAyah < val) {
                                            setEndAyah(val);
                                        }
                                    }}
                                    className="w-full bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl px-3 py-2 text-sm outline-none focus:border-amber-500 transition-colors text-[var(--text-primary)]"
                                >
                                    {Array.from({ length: getAyahCount(startSurah) }, (_, i) => i + 1).map(n => (
                                        <option key={n} value={n}>{n}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs text-[var(--text-primary)] opacity-40 block">
                                    {t.toSurah || 'To Surah'}
                                </label>
                                <select 
                                    value={endSurah}
                                    onChange={(e) => {
                                        const val = Number(e.target.value);
                                        setEndSurah(val);
                                        // Reset endAyah to 1 or startAyah if same surah
                                        if (val === startSurah) {
                                            if (endAyah < startAyah) setEndAyah(startAyah);
                                        } else {
                                            setEndAyah(1);
                                        }
                                    }}
                                    className="w-full bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl px-3 py-2 text-sm outline-none focus:border-amber-500 transition-colors text-[var(--text-primary)]"
                                >
                                    {SURAHS.filter(s => s.number >= startSurah).map(s => (
                                        <option key={s.number} value={s.number}>{s.number}. {t.surahNames[s.number - 1] || s.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs text-[var(--text-primary)] opacity-40 block">
                                    {t.ayahText || 'Ayah'}
                                </label>
                                <select 
                                    value={endAyah}
                                    onChange={(e) => setEndAyah(Number(e.target.value))}
                                    className="w-full bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl px-3 py-2 text-sm outline-none focus:border-amber-500 transition-colors text-[var(--text-primary)]"
                                >
                                    {Array.from({ length: getAyahCount(endSurah) }, (_, i) => i + 1)
                                        .filter(n => endSurah > startSurah || n >= startAyah)
                                        .map(n => (
                                            <option key={n} value={n}>{n}</option>
                                        ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="h-px bg-[var(--border-primary)] w-full opacity-50"></div>

                    {/* Group Repetitions */}
                    <div className="space-y-3">
                        <label className="text-sm font-semibold text-[var(--text-primary)] opacity-70">
                            {t.playVerseGroup || 'Play Verse Group:'}
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {GROUP_REP_OPTIONS.map(opt => (
                                <button
                                    key={opt}
                                    onClick={() => setGroupRepetitions(opt)}
                                    className={clsx(
                                        "px-3.5 py-1.5 rounded-full text-xs font-bold transition-all border",
                                        groupRepetitions === opt 
                                            ? "bg-amber-500 border-amber-500 text-white shadow-lg shadow-amber-500/20" 
                                            : "bg-[var(--bg-secondary)] border-[var(--border-primary)] text-[var(--text-primary)] opacity-40 hover:opacity-100"
                                    )}
                                >
                                    {opt === -1 ? '∞' : opt}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Ayah Repetitions */}
                    <div className="space-y-3">
                        <label className="text-sm font-semibold text-[var(--text-primary)] opacity-70">
                            {t.playEachAyah || 'Play Each Ayah:'}
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {AYAH_REP_OPTIONS.map(opt => (
                                <button
                                    key={opt}
                                    onClick={() => setAyahRepetitions(opt)}
                                    className={clsx(
                                        "px-3.5 py-1.5 rounded-full text-xs font-bold transition-all border",
                                        ayahRepetitions === opt 
                                            ? "bg-amber-500 border-amber-500 text-white shadow-lg shadow-amber-500/20" 
                                            : "bg-[var(--bg-secondary)] border-[var(--border-primary)] text-[var(--text-primary)] opacity-40 hover:opacity-100"
                                    )}
                                >
                                    {opt === -1 ? '∞' : opt}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Speed Selector */}
                    <div className="space-y-3">
                        <label className="text-sm font-semibold text-[var(--text-primary)] opacity-70">
                            {t.playbackSpeed || 'Playback Speed:'}
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {SPEED_OPTIONS.map(opt => (
                                <button
                                    key={opt}
                                    onClick={() => setPlaybackRate(opt)}
                                    className={clsx(
                                        "px-3.5 py-1.5 rounded-full text-xs font-bold transition-all border",
                                        playbackRate === opt 
                                            ? "bg-cyan-500 border-cyan-500 text-white" 
                                            : "bg-[var(--bg-secondary)] border-[var(--border-primary)] text-[var(--text-primary)] opacity-40 hover:opacity-100"
                                    )}
                                >
                                    {opt}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Checkbox */}
                    <button 
                        onClick={() => setUseRangeOnly(!useRangeOnly)}
                        className="flex items-center gap-3 py-2 cursor-pointer group w-full text-right"
                    >
                        <div className={clsx(
                            "w-5 h-5 rounded border flex items-center justify-center transition-colors shadow-inner",
                            useRangeOnly ? "bg-amber-500 border-amber-500" : "bg-[var(--bg-secondary)] border-[var(--border-primary)]"
                        )}>
                            {useRangeOnly && <Check size={14} className="text-white" strokeWidth={3} />}
                        </div>
                        <span className={clsx(
                            "text-sm font-semibold transition-colors",
                            useRangeOnly ? "text-[var(--text-primary)]" : "text-[var(--text-primary)] opacity-50 group-hover:opacity-100"
                        )}>
                            {t.playOnlySelectedRange || 'Play only selected range'}
                        </span>
                    </button>

                    {/* Apply Button */}
                    <button
                        onClick={() => onApply({
                            startSurah, startAyah, endSurah, endAyah,
                            groupRepetitions, ayahRepetitions, playbackRate, useRangeOnly
                        })}
                        className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white font-bold py-3 rounded-xl shadow-xl transition-all active:scale-[0.98] mt-2"
                    >
                        {t.apply || 'Apply'}
                    </button>
                </div>
            </div>
        </div>
    );
}
