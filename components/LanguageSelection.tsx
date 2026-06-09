import React, { useState } from 'react';
import { Globe, Check, ChevronRight } from 'lucide-react';
import { Language } from '../i18n/translations';

interface LanguageSelectionProps {
    onSelect: (lang: Language) => void;
}

const LANGUAGES: { code: Language; name: string; nativeName: string; flag: string }[] = [
    { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦' },
    { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
    { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia', flag: '🇮🇩' },
    { code: 'ms', name: 'Malay', nativeName: 'Bahasa Melayu', flag: '🇲🇾' },
    { code: 'ur', name: 'Urdu', nativeName: 'اردو', flag: '🇵🇰' },
    { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷' },
    { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', flag: '🇧🇩' },
    { code: 'fa', name: 'Persian', nativeName: 'فارسی', flag: '🇮🇷' },
    { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
    { code: 'ha', name: 'Hausa', nativeName: 'Hausa', flag: '🇳🇬' },
    { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' },
    { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
    { code: 'sw', name: 'Swahili', nativeName: 'Kiswahili', flag: '🇰🇪' },
    { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
    { code: 'uz', name: 'Uzbek', nativeName: 'Oʻzbekcha', flag: '🇺🇿' },
    { code: 'sq', name: 'Albanian', nativeName: 'Shqip', flag: '🇦🇱' },
    { code: 'bs', name: 'Bosnian', nativeName: 'Bosanski', flag: '🇧🇦' },
    { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
    { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷' },
    { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
    { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', flag: '🇮🇳' },
    { code: 'si', name: 'Sinhala', nativeName: 'සිංහල', flag: '🇱🇰' },
    { code: 'am', name: 'Amharic', nativeName: 'አማርኛ', flag: '🇪🇹' },
    { code: 'yo', name: 'Yoruba', nativeName: 'Yorùbá', flag: '🇳🇬' },
    { code: 'om', name: 'Oromo', nativeName: 'Afaan Oromoo', flag: '🇪🇹' },
    { code: 'rw', name: 'Kinyarwanda', nativeName: 'Kinyarwanda', flag: '🇷🇼' },
    { code: 'kk', name: 'Kazakh', nativeName: 'Қазақша', flag: '🇰🇿' },
    { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', flag: '🇻🇳' },
    { code: 'tl', name: 'Tagalog', nativeName: 'Tagalog', flag: '🇵🇭' },
    { code: 'ku', name: 'Kurdish', nativeName: 'Kurdî', flag: '🇮🇶' },
];

export default function LanguageSelection({ onSelect }: LanguageSelectionProps) {
    const [selected, setSelected] = useState<Language | null>(null);

    const handleConfirm = () => {
        if (selected) {
            onSelect(selected);
        }
    };

    return (
        <div className="fixed inset-0 z-[110000] bg-[var(--bg-primary)] flex flex-col items-center justify-center p-4 animate-in fade-in duration-700">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
                <div className="absolute -top-24 -left-24 w-64 h-64 bg-amber-600 rounded-full blur-[120px]" />
                <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-amber-900 rounded-full blur-[120px]" />
            </div>

            <div className="relative z-10 w-full max-w-lg flex flex-col items-center">
                <div className="mb-6 text-center animate-in slide-in-from-top-10 duration-1000">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 mb-3 shadow-xl">
                        <Globe className="text-amber-500 w-6 h-6" />
                    </div>
                    <h1 className="text-2xl font-black text-[var(--text-primary)] mb-1 tracking-tight">
                        Choose Your Language
                    </h1>
                    <div className="inline-block bg-black/60 rounded-full px-3 py-1 mt-1">
                        <p className="text-amber-200/80 text-sm font-medium">
                            اختر اللغة المفضلة لبدء الاستخدام
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-2 w-full max-h-[45vh] overflow-y-auto px-1 py-2 custom-scrollbar animate-in fade-in zoom-in-95 duration-1000 delay-200">
                    {LANGUAGES.map((lang, index) => (
                        <button
                            key={lang.code}
                            onClick={() => setSelected(lang.code)}
                            className={`
                                relative group flex flex-col items-center p-3 rounded-xl border transition-all duration-300
                                ${selected === lang.code
                                    ? 'bg-amber-500 border-amber-400 shadow-lg scale-[1.02]'
                                    : 'bg-[var(--bg-secondary)] border-[var(--border-primary)] hover:bg-[var(--bg-primary)]'
                                }
                            `}
                        >
                            <span className="text-2xl mb-1 filter drop-shadow-md">{lang.flag}</span>
                            <span className={`text-xs font-bold ${selected === lang.code ? 'text-black' : 'text-[var(--text-primary)]'}`}>
                                {lang.nativeName}
                            </span>
                        </button>
                    ))}
                </div>

                <div className="mt-6 w-full max-w-xs animate-in slide-in-from-bottom-10 duration-1000 delay-500">
                    <button
                        onClick={handleConfirm}
                        disabled={!selected}
                        className={`
                            w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-base shadow-2xl transition-all duration-500
                            ${selected
                                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-black hover:scale-105'
                                : 'bg-[var(--bg-secondary)] text-[var(--text-primary)] opacity-30 cursor-not-allowed border border-[var(--border-primary)]'
                            }
                        `}
                    >
                        <span>Start Now</span>
                        <ChevronRight size={18} />
                    </button>
                    
                    <p className="mt-3 text-center text-[var(--text-primary)] opacity-30 text-[10px] font-medium uppercase tracking-widest">
                        You can change this later in settings
                    </p>
                </div>
            </div>
            
            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 3px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255, 255, 255, 0.02); border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(245, 158, 11, 0.3); border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(245, 158, 11, 0.4); }
            `}</style>
        </div>
    );
}
