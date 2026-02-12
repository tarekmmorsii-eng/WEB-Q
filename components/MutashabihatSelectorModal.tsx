import React, { useState } from 'react';
import { X, Search } from 'lucide-react';
import clsx from 'clsx';
import { SURAHS } from '../constants/surahData';
import { getSurahName } from '../utils/quranHelpers';
import { translations, Language } from '../i18n/translations';
import { formatNumber } from '../utils/quranUtils';

interface MutashabihatSelectorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (surahNumber: number, ayahNumber: number) => void;
    language: string;
    lockedSurah?: number; // Force this surah only
    excludedSurah?: number; // Hide this surah
}

export default function MutashabihatSelectorModal({
    isOpen,
    onClose,
    onSelect,
    language,
    lockedSurah,
    excludedSurah
}: MutashabihatSelectorModalProps) {
    const [selectedSurah, setSelectedSurah] = useState<number>(lockedSurah || 1);
    const [selectedAyah, setSelectedAyah] = useState<number>(1);
    const [searchQuery, setSearchQuery] = useState('');

    // Update selected surah if locked changes
    React.useEffect(() => {
        if (lockedSurah) setSelectedSurah(lockedSurah);
    }, [lockedSurah]);

    const t = translations[language as Language] || translations.ar;
    const isArabic = language === 'ar';

    if (!isOpen) return null;

    const filteredSurahs = SURAHS.filter(s => {
        // Apply locked filter
        if (lockedSurah && s.number !== lockedSurah) return false;
        // Apply excluded filter
        if (excludedSurah && s.number === excludedSurah) return false;

        return s.name.includes(searchQuery) ||
            s.number.toString() === searchQuery;
    });

    const surah = SURAHS.find(s => s.number === selectedSurah);
    const ayahCount = surah?.ayahCount || 0;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border-2 border-amber-400">
                <div className="p-4 bg-amber-500 text-white flex justify-between items-center">
                    <h3 className="font-bold text-lg">{t.addSimilarAyah}</h3>
                    <button onClick={onClose} className="p-1 hover:bg-amber-600 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6">
                    {/* Surah Selection */}
                    <div className="mb-4">
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                            {t.selectSurah}
                        </label>
                        <div className="relative mb-2">
                            <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder={t.searchSurah}
                                className="w-full pr-10 pl-4 py-2 bg-slate-100 dark:bg-slate-700 border-2 border-transparent focus:border-amber-500 rounded-xl outline-none transition-all text-sm"
                            />
                        </div>
                        <select
                            value={selectedSurah}
                            onChange={(e) => {
                                setSelectedSurah(Number(e.target.value));
                                setSelectedAyah(1);
                            }}
                            className="w-full p-3 bg-slate-100 dark:bg-slate-700 rounded-xl outline-none border-2 border-transparent focus:border-amber-500 transition-all font-sans"
                            size={5}
                        >
                            {filteredSurahs.map(s => (
                                <option key={s.number} value={s.number}>
                                    {formatNumber(s.number, language)}. {t.surahNames[s.number - 1]}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Ayah Selection */}
                    <div className="mb-6">
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                            {t.ayahNumber} ({formatNumber(1, language)}-{formatNumber(ayahCount, language)})
                        </label>
                        <input
                            type="number"
                            min={1}
                            max={ayahCount}
                            value={selectedAyah}
                            onChange={(e) => {
                                const val = Number(e.target.value);
                                setSelectedAyah(val);
                            }}
                            className={clsx(
                                "w-full p-3 bg-slate-100 dark:bg-slate-700 rounded-xl outline-none border-2 transition-all",
                                (selectedAyah > ayahCount || selectedAyah < 1) ? "border-red-500 focus:border-red-500" : "border-transparent focus:border-amber-500"
                            )}
                        />
                        {(selectedAyah > ayahCount || selectedAyah < 1) && (
                            <p className="text-red-500 text-xs mt-1 px-1">
                                {t.ayahRangeError.replace('{max}', formatNumber(ayahCount, language))}
                            </p>
                        )}
                    </div>

                    <button
                        onClick={() => {
                            if (selectedAyah >= 1 && selectedAyah <= ayahCount) {
                                onSelect(selectedSurah, selectedAyah);
                            }
                        }}
                        disabled={selectedAyah < 1 || selectedAyah > ayahCount}
                        className={clsx(
                            "w-full font-bold py-3 rounded-xl shadow-lg transition-all active:scale-95 translate-y-0",
                            (selectedAyah < 1 || selectedAyah > ayahCount)
                                ? "bg-gray-400 cursor-not-allowed opacity-50"
                                : "bg-amber-500 hover:bg-amber-600 text-white hover:-translate-y-1"
                        )}
                    >
                        {t.add}
                    </button>
                </div>
            </div>
        </div>
    );
}
