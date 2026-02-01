import React from 'react';
import { X, Check, Sun, Moon } from 'lucide-react';
import clsx from 'clsx';
import { THEMES, Theme, DAY_THEME_ID, NIGHT_THEME_ID } from '../constants/themes';

interface ColorPickerModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentThemeId: string;
    onSelectTheme: (themeId: string) => void;
    t: any;
}

export default function ColorPickerModal({ isOpen, onClose, currentThemeId, onSelectTheme, t }: ColorPickerModalProps) {
    if (!isOpen) return null;

    const currentTheme = THEMES.find(t => t.id === currentThemeId);

    return (
        <div className="fixed inset-0 z-[60] flex items-end justify-center pointer-events-none">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 pointer-events-auto animate-in fade-in duration-300"
                onClick={onClose}
            />

            {/* Bottom Sheet */}
            <div className="w-full max-w-md rounded-t-3xl shadow-2xl relative z-10 animate-in slide-in-from-bottom duration-300 pointer-events-auto pb-10 pt-2 max-h-[85vh] overflow-y-auto"
                style={{ backgroundColor: '#262626' }}
            >
                {/* Drag Handle & Close */}
                <div className="relative flex items-center justify-center py-3">
                    <div className="w-12 h-1.5 bg-gray-600 rounded-full" />
                    <button
                        onClick={onClose}
                        className="absolute right-4 p-2 bg-gray-700 rounded-full text-gray-300 hover:bg-red-900/50 hover:text-red-400 transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="text-center mb-4">
                    <span className="text-white font-medium text-lg">
                        {t.chooseColor}
                    </span>
                    <div className="text-gray-400 text-xs mt-1">
                        {t.index === 'Index' ? currentTheme?.name : currentTheme?.nameAr}
                    </div>
                </div>

                {/* Day/Night Quick Buttons */}
                <div className="flex gap-3 mx-6 mb-4">
                    <button
                        onClick={() => onSelectTheme(DAY_THEME_ID)}
                        className={clsx(
                            "flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg border-2 transition-all",
                            currentThemeId === DAY_THEME_ID
                                ? "border-amber-500 bg-amber-500/20"
                                : "border-gray-600 hover:border-amber-400"
                        )}
                    >
                        <Sun size={20} className="text-amber-400" />
                        <span className="font-medium text-white">{t.lightMode}</span>
                    </button>
                    <button
                        onClick={() => onSelectTheme(NIGHT_THEME_ID)}
                        className={clsx(
                            "flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg border-2 transition-all",
                            currentThemeId === NIGHT_THEME_ID
                                ? "border-blue-500 bg-blue-500/20"
                                : "border-gray-600 hover:border-blue-400"
                        )}
                    >
                        <Moon size={20} className="text-blue-400" />
                        <span className="font-medium text-white">{t.darkMode}</span>
                    </button>
                </div>

                {/* Color Grid - 4x4 */}
                <div className="p-6 grid grid-cols-4 gap-4 justify-items-center">
                    {THEMES.map((theme) => {
                        const isSelected = currentThemeId === theme.id;
                        return (
                            <button
                                key={theme.id}
                                onClick={() => onSelectTheme(theme.id)}
                                className={clsx(
                                    "w-full aspect-[4/3] rounded-2xl flex items-center justify-center shadow-sm transition-all active:scale-95 border-2 relative overflow-hidden group",
                                    isSelected
                                        ? "border-amber-500 ring-2 ring-amber-400 ring-offset-2 ring-offset-[#262626]"
                                        : "border-gray-600 hover:border-gray-400 hover:scale-105"
                                )}
                                style={{ backgroundColor: theme.colors.background }}
                                title={theme.nameAr}
                            >
                                {/* Center Dot / Checkmark */}
                                <div className="flex items-center justify-center w-full h-full">
                                    {isSelected ? (
                                        <div className="bg-amber-500 text-white rounded-full p-1 shadow-md">
                                            <Check size={14} strokeWidth={3} />
                                        </div>
                                    ) : (
                                        <div
                                            className="w-2.5 h-2.5 rounded-full opacity-50"
                                            style={{ backgroundColor: theme.colors.text }}
                                        />
                                    )}
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
