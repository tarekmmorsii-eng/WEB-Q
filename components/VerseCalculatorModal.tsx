import React, { useState, useMemo, useEffect } from 'react';
import { X, Calculator, ArrowRight, ArrowLeft, Layers, BookOpen } from 'lucide-react';
import { translations, Language } from '../i18n/translations';
import { SURAH_NAMES } from './QPCV1PageRenderer';
import { JUZ_BOUNDARIES, HIZB_BOUNDARIES, RUB_BOUNDARIES } from '../constants/structureBoundaries';
import clsx from 'clsx';

interface VerseCalculatorModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentLanguage: Language;
}

// Temporary Surah Data until we confirm best way to import
const SURAH_DATA = Array.from({ length: 114 }, (_, i) => ({
    number: i + 1,
    nameAr: SURAH_NAMES[i + 1] || `سورة ${i + 1}`,
    nameEn: `Surah ${i + 1}`,
}));

const VERSE_COUNTS = [
    7, 286, 200, 176, 120, 165, 206, 75, 129, 109, 123, 111, 43, 52, 99, 128, 111, 110, 98, 135,
    112, 78, 118, 64, 77, 227, 93, 88, 69, 60, 34, 30, 73, 54, 45, 83, 182, 88, 75, 85,
    54, 53, 89, 59, 37, 35, 38, 29, 18, 45, 60, 49, 62, 55, 78, 96, 29, 22, 24, 13,
    14, 11, 11, 18, 12, 12, 30, 52, 52, 44, 28, 28, 20, 56, 40, 31, 50, 40, 46, 42,
    29, 19, 36, 25, 22, 17, 19, 26, 30, 20, 15, 21, 11, 8, 8, 19, 5, 8, 8, 11,
    11, 8, 3, 9, 5, 4, 7, 3, 6, 3, 5, 4, 5, 6
];

type CalculationMode = 'range' | 'structure';
type StructureType = 'juz' | 'hizb' | 'rub';

export default function VerseCalculatorModal({ isOpen, onClose, currentLanguage }: VerseCalculatorModalProps) {
    // State for calculation mode
    const [mode, setMode] = useState<CalculationMode>('range');

    // State for range selection
    const [startSurah, setStartSurah] = useState(1);
    const [startAyah, setStartAyah] = useState(1);
    const [endSurah, setEndSurah] = useState(1);
    const [endAyah, setEndAyah] = useState(7);

    // State for structure selection
    const [structureType, setStructureType] = useState<StructureType>('juz');
    const [structureIndex, setStructureIndex] = useState(1);

    // Helper to calculate verses between two points
    const calculateRange = (sSurah: number, sAyah: number, eSurah: number, eAyah: number) => {
        if (sSurah > eSurah) return 0;
        if (sSurah === eSurah) {
            return Math.max(0, eAyah - sAyah + 1);
        }

        let count = 0;
        // Verses in start surah
        count += (VERSE_COUNTS[sSurah - 1] - sAyah + 1);
        // Verses in full surahs between
        for (let i = sSurah + 1; i < eSurah; i++) {
            count += VERSE_COUNTS[i - 1];
        }
        // Verses in end surah
        count += eAyah;
        return count;
    };

    // Calculate/Sync logic
    // We want the 'structure' mode to drive the 'range' state visually, 
    // or at least be the source of truth when active.
    // Let's use an effect to update range state when structure changes IF in structure mode.
    useEffect(() => {
        if (mode === 'structure') {
            let boundaries;
            switch (structureType) {
                case 'juz': boundaries = JUZ_BOUNDARIES; break;
                case 'hizb': boundaries = HIZB_BOUNDARIES; break;
                case 'rub': boundaries = RUB_BOUNDARIES; break;
            }

            const boundary = boundaries[structureIndex - 1];
            if (boundary) {
                setStartSurah(boundary.start.surah);
                setStartAyah(boundary.start.ayah);
                setEndSurah(boundary.end.surah);
                setEndAyah(boundary.end.ayah);
            }
        }
    }, [mode, structureType, structureIndex]);

    const totalVerses = useMemo(() => {
        return calculateRange(startSurah, startAyah, endSurah, endAyah);
    }, [startSurah, startAyah, endSurah, endAyah]);

    const handleStartSurahChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const s = parseInt(e.target.value);
        setStartSurah(s);
        setStartAyah(1);
        if (s > endSurah) {
            setEndSurah(s);
            setEndAyah(VERSE_COUNTS[s - 1]);
        }
    };

    const handleEndSurahChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const s = parseInt(e.target.value);
        setEndSurah(s);
        setEndAyah(VERSE_COUNTS[s - 1]);
        if (s < startSurah) {
            setStartSurah(s);
            setStartAyah(1);
        }
    };

    if (!isOpen) return null;

    const renderStructureOptions = () => {
        let max = 30;
        let labelPrefix = currentLanguage === 'ar' ? 'الجزء' : 'Juz';

        if (structureType === 'hizb') {
            max = 60;
            labelPrefix = currentLanguage === 'ar' ? 'الحزب' : 'Hizb';
        } else if (structureType === 'rub') {
            max = 240;
            labelPrefix = currentLanguage === 'ar' ? 'الربع' : 'Rub';
        }

        return (
            <div className="flex gap-2">
                <select
                    value={structureType}
                    onChange={(e) => {
                        setStructureType(e.target.value as StructureType);
                        setStructureIndex(1); // Reset index on type change
                    }}
                    className="flex-1 p-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                >
                    <option value="juz">{currentLanguage === 'ar' ? 'أجزاء' : 'Juz (Parts)'}</option>
                    <option value="hizb">{currentLanguage === 'ar' ? 'أحزاب' : 'Hizb (Parties)'}</option>
                    <option value="rub">{currentLanguage === 'ar' ? 'أرباع' : 'Rub (Quarters)'}</option>
                </select>

                <select
                    value={structureIndex}
                    onChange={(e) => setStructureIndex(parseInt(e.target.value))}
                    className="w-24 p-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-center"
                >
                    {Array.from({ length: max }, (_, i) => i + 1).map(num => (
                        <option key={num} value={num}>
                            {num}
                        </option>
                    ))}
                </select>
            </div>
        );
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-[110] flex items-center justify-center p-4 animate-in fade-in duration-300 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-amber-200/20 dark:border-slate-700 flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 p-4 shrink-0 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Calculator className="text-amber-600" />
                        {currentLanguage === 'ar' ? 'حساب عدد الآيات' : 'Verse Calculator'}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                        <X size={24} className="text-gray-600 dark:text-gray-400" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6 overflow-y-auto">

                    {/* Mode Toggle */}
                    <div className="flex p-1 bg-gray-100 dark:bg-slate-800 rounded-xl relative">
                        <button
                            onClick={() => setMode('range')}
                            className={clsx(
                                "flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                                mode === 'range'
                                    ? "bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-sm"
                                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                            )}
                        >
                            <BookOpen size={16} />
                            {currentLanguage === 'ar' ? 'تحديد آيات' : 'Verses'}
                        </button>
                        <button
                            onClick={() => setMode('structure')}
                            className={clsx(
                                "flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                                mode === 'structure'
                                    ? "bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-sm"
                                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                            )}
                        >
                            <Layers size={16} />
                            {currentLanguage === 'ar' ? 'الأجزاء والأحزاب' : 'Parts & Hizbs'}
                        </button>
                    </div>

                    {mode === 'structure' && (
                        <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 block">
                                {currentLanguage === 'ar' ? 'اختر التقسيم:' : 'Select Structure:'}
                            </label>
                            {renderStructureOptions()}
                        </div>
                    )}

                    {/* Range Inputs (Read-onlyish in structure mode, or just auto-updated) */}
                    <div className={clsx("space-y-6 transition-opacity duration-200", mode === 'structure' && "opacity-75 pointer-events-none")}>
                        {/* Start Range */}
                        <div className="space-y-3">
                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 block">
                                {currentLanguage === 'ar' ? 'من:' : 'From:'}
                            </label>
                            <div className="flex gap-2">
                                <select
                                    value={startSurah}
                                    onChange={handleStartSurahChange}
                                    disabled={mode === 'structure'}
                                    className="flex-1 p-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white disabled:opacity-70"
                                >
                                    {SURAH_DATA.map(s => (
                                        <option key={s.number} value={s.number}>
                                            {s.number}. {currentLanguage === 'ar' ? s.nameAr : s.nameEn}
                                        </option>
                                    ))}
                                </select>
                                <input
                                    type="number"
                                    min={1}
                                    max={VERSE_COUNTS[startSurah - 1]}
                                    value={startAyah}
                                    disabled={mode === 'structure'}
                                    onChange={(e) => setStartAyah(Math.min(parseInt(e.target.value) || 1, VERSE_COUNTS[startSurah - 1]))}
                                    className="w-20 p-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-center disabled:opacity-70"
                                />
                            </div>
                        </div>

                        {/* Arrow Divider */}
                        <div className="flex justify-center text-amber-500">
                            {currentLanguage === 'ar' ? <ArrowLeft size={24} /> : <ArrowRight size={24} />}
                        </div>

                        {/* End Range */}
                        <div className="space-y-3">
                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 block">
                                {currentLanguage === 'ar' ? 'إلى:' : 'To:'}
                            </label>
                            <div className="flex gap-2">
                                <select
                                    value={endSurah}
                                    onChange={handleEndSurahChange}
                                    disabled={mode === 'structure'}
                                    className="flex-1 p-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white disabled:opacity-70"
                                >
                                    {SURAH_DATA.map(s => (
                                        <option key={s.number} value={s.number}>
                                            {s.number}. {currentLanguage === 'ar' ? s.nameAr : s.nameEn}
                                        </option>
                                    ))}
                                </select>
                                <input
                                    type="number"
                                    min={1}
                                    max={VERSE_COUNTS[endSurah - 1]}
                                    value={endAyah}
                                    disabled={mode === 'structure'}
                                    onChange={(e) => setEndAyah(Math.min(parseInt(e.target.value) || 1, VERSE_COUNTS[endSurah - 1]))}
                                    className="w-20 p-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-center disabled:opacity-70"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Result */}
                    <div className="mt-8 p-6 bg-amber-50 dark:bg-amber-900/20 rounded-xl text-center border border-amber-100 dark:border-amber-800/30">
                        <span className="text-sm text-amber-800 dark:text-amber-200 block mb-1 font-medium">
                            {currentLanguage === 'ar' ? 'إجمالي عدد الآيات' : 'Total Verses'}
                        </span>
                        <div className="text-5xl font-bold text-amber-600 dark:text-amber-400 tabular-nums">
                            {totalVerses}
                        </div>
                        {mode === 'structure' && (
                            <span className="text-xs text-amber-600/70 dark:text-amber-400/70 block mt-2">
                                {currentLanguage === 'ar'
                                    ? `آيات ${structureType === 'juz' ? 'الجزء' : structureType === 'hizb' ? 'الحزب' : 'الربع'} ${structureIndex}`
                                    : `Verses in ${structureType === 'juz' ? 'Juz' : structureType === 'hizb' ? 'Hizb' : 'Rub'} ${structureIndex}`
                                }
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
