import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { X, Layout, Settings, Maximize2, ChevronRight, ChevronLeft, Info, ChevronDown } from 'lucide-react';
import clsx from 'clsx';
import { translations, Language } from '../i18n/translations';

interface GuideImage {
    id: number;
    url: string;
    title?: string;
    description?: string;
    category: 'interface' | 'settings';
}

interface HowToUseGuideProps {
    isOpen: boolean;
    onClose: () => void;
    language: string;
}

// Sub-component for individual image cards to keep the main grid clean
const ImageCard = ({ img, onClick, t }: { img: any, onClick: (img: any) => void, t: any }) => (
    <div
        className="group relative flex flex-col bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-500 hover:-translate-y-1 border border-slate-200 dark:border-slate-800 cursor-pointer"
        onClick={() => onClick(img)}
    >
        {/* Image Container */}
        <div className="relative aspect-[3/4] md:aspect-[3/2] overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center p-2">
            <img
                src={img.url}
                alt={img.title}
                className="max-w-full max-h-full object-contain transition-transform duration-700 group-hover:scale-105"
                loading="lazy"
            />
            {/* Overlay on Hover */}
            <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <div className="bg-white/90 dark:bg-slate-900/90 p-3 rounded-full shadow-lg transform scale-90 group-hover:scale-100 transition-transform duration-300">
                    <Maximize2 size={20} className="text-amber-600" />
                </div>
            </div>
            {/* Badge/Index */}
            <div className="absolute top-3 right-3 bg-black/30 backdrop-blur-md px-2 py-1 rounded-lg text-[10px] font-bold text-white tracking-widest uppercase">
                {String(img.id).padStart(2, '0')}
            </div>
        </div>

        {/* Info */}
        <div className="p-4 md:p-5 flex-1 flex flex-col justify-between border-t border-slate-100 dark:border-slate-800">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 line-clamp-2 leading-snug">
                {img.title}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-medium">
                <Maximize2 size={12} />
                {t.clickToZoom}
            </p>
        </div>
    </div>
);

export default function HowToUseGuide({ isOpen, onClose, language }: HowToUseGuideProps) {
    const t = translations[language as Language] || translations['ar'];
    const [activeTab, setActiveTab] = useState<'interface' | 'settings'>('interface');
    const [selectedImage, setSelectedImage] = useState<GuideImage | null>(null);
    const scrollContainerRef = React.useRef<HTMLDivElement>(null);

    // Scroll to top when tab changes
    useEffect(() => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTo({ top: 0, behavior: 'instant' });
        }
    }, [activeTab]);

    // Actual image mapping from public/guide
    const guideImages = useMemo<GuideImage[]>(() => {
        const images: GuideImage[] = [];

        // IDs of images replaced with "a" version (28a.jpg, etc.)
        const replacedIds = [28, 29, 30, 47, 48];

        for (let i = 1; i <= 51; i++) {
            const isInterface = i <= 29;
            const category = isInterface ? 'interface' : 'settings';
            const titlePrefix = isInterface ? t.interfaceTab : t.settingsTab;

            // For interface, we use the direct ID (1-29)
            // For settings, we subtract 29 to start from 1 again (30 becomes 1, etc.)
            const displayId = isInterface ? i : i - 29;

            // Force cache refresh by adding a timestamp version
            const version = "2026.02.16.v3";

            let filename = `${i}.jpg`;
            if (replacedIds.includes(i)) {
                filename = `${i}a.jpg`;
            }

            images.push({
                id: i,
                url: `/guide/${filename}?v=${version}`,
                title: `${titlePrefix} - ${displayId}`,
                category
            });
        }
        return images;
    }, [t]);

    const filteredImages = useMemo(() => {
        return guideImages.filter(img => img.category === activeTab);
    }, [guideImages, activeTab]);

    // Navigation Helpers (Mushaf Style: Next is on the Left, Prev is on the Right)
    const navigateNext = useCallback(() => {
        const currentIndex = guideImages.findIndex(i => i.id === selectedImage?.id);
        if (currentIndex !== -1 && currentIndex < guideImages.length - 1) {
            setSelectedImage(guideImages[currentIndex + 1]);
        }
    }, [guideImages, selectedImage]);

    const navigatePrev = useCallback(() => {
        const currentIndex = guideImages.findIndex(i => i.id === selectedImage?.id);
        if (currentIndex > 0) {
            setSelectedImage(guideImages[currentIndex - 1]);
        }
    }, [guideImages, selectedImage]);

    // Keyboard & Gesture support (Mushaf Style)
    useEffect(() => {
        const handleKeys = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                if (selectedImage) setSelectedImage(null);
                else onClose();
            } else if (selectedImage) {
                // In Arabic Mushaf: Left Key goes to Next Page, Right Key goes to Previous Page
                if (e.key === 'ArrowLeft') navigateNext();
                if (e.key === 'ArrowRight') navigatePrev();
            }
        };
        if (isOpen) window.addEventListener('keydown', handleKeys);
        return () => window.removeEventListener('keydown', handleKeys);
    }, [isOpen, selectedImage, navigateNext, navigatePrev, onClose]);

    const [touchStart, setTouchStart] = useState<number | null>(null);
    const [touchEnd, setTouchEnd] = useState<number | null>(null);

    const handleTouchStart = (e: React.TouchEvent) => setTouchStart(e.targetTouches[0].clientX);
    const handleTouchMove = (e: React.TouchEvent) => setTouchEnd(e.targetTouches[0].clientX);
    const handleTouchEnd = () => {
        if (!touchStart || !touchEnd) return;
        const distance = touchStart - touchEnd;
        // Mushaf Style: Swipe Right (distance < -50) goes to Next, Swipe Left (distance > 50) goes to Prev
        if (distance < -50) navigateNext();
        if (distance > 50) navigatePrev();
        setTouchStart(null);
        setTouchEnd(null);
    };

    const [showQuickNav, setShowQuickNav] = useState<string | null>(null);

    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            setShowQuickNav(null);
        }
    };

    const interfaceSections = [
        { id: 'section-start', title: t.guideStart },
        { id: 'section-verses', title: t.guideVerseVisibility },
        { id: 'section-words', title: t.guideWordVisibility },
        { id: 'section-quran', title: t.guideQuranUI }
    ];

    const settingsSections = [
        { id: 'section-tools', title: t.guideSettingsTools },
        { id: 'section-index', title: t.guideIndex },
        { id: 'section-search', title: t.guideSearch },
        { id: 'section-stats', title: t.guideMemorizationStats },
        { id: 'section-notify', title: t.guideNotifications },
        { id: 'section-mutashabihat', title: t.guideMutashabihat },
        { id: 'section-calc', title: t.guideVerseCalculator },
        { id: 'section-prayer', title: t.guidePrayerMode },
        { id: 'section-notes', title: t.guideNotes }
    ];

    const currentSections = activeTab === 'interface' ? interfaceSections : settingsSections;

    // Reusable Section Header Component
    const SectionHeader = ({ id, title }: { id: string, title: string }) => (
        <div className="relative inline-block mb-8 scroll-mt-24" id={id}>
            <button
                onClick={() => setShowQuickNav(showQuickNav === id ? null : id)}
                className="flex items-center gap-3 px-4 py-2 border-r-4 border-amber-500 bg-amber-50 dark:bg-amber-900/10 hover:bg-amber-100 dark:hover:bg-amber-900/20 transition-all rounded-l-lg group"
            >
                <h2 className="text-xl md:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                    {title}
                </h2>
                <ChevronDown size={24} className={clsx("text-amber-600 transition-transform duration-300", showQuickNav === id && "rotate-180")} />
            </button>

            {/* Quick Nav Dropdown */}
            {showQuickNav === id && (
                <div className="absolute top-full right-0 mt-2 w-72 md:w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    {currentSections.map((sec) => (
                        <button
                            key={sec.id}
                            onClick={() => scrollToSection(sec.id)}
                            className={clsx(
                                "w-full text-right px-4 py-3 rounded-xl transition-all flex items-center justify-between group",
                                sec.id === id
                                    ? "bg-amber-500 text-white"
                                    : "hover:bg-amber-50 dark:hover:bg-amber-900/20 text-slate-700 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 font-bold"
                            )}
                        >
                            <span>{sec.title}</span>
                            <ChevronLeft size={16} className={clsx(sec.id === id ? "opacity-100" : "opacity-0 group-hover:opacity-100 translate-x-1 group-hover:translate-x-0 transition-all")} />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] bg-slate-50 dark:bg-slate-950 flex flex-col animate-in fade-in slide-in-from-bottom duration-300 select-none">
            {/* Header */}
            <header className="h-16 md:h-20 flex items-center justify-between px-4 md:px-8 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-40 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-600 flex items-center justify-center text-white shadow-lg shadow-amber-600/20">
                        <Info size={24} />
                    </div>
                    <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">
                        {t.howToUse}
                    </h1>
                </div>

                <div className="flex items-center gap-4">
                    {/* Tabs Control - Desktop */}
                    <div className="hidden md:flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
                        <button
                            onClick={() => setActiveTab('interface')}
                            className={clsx(
                                "flex items-center gap-2 px-6 py-2 rounded-lg transition-all duration-300 font-medium",
                                activeTab === 'interface'
                                    ? "bg-white dark:bg-slate-700 text-amber-600 shadow-sm"
                                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                            )}
                        >
                            <Layout size={18} />
                            {t.interfaceTab}
                        </button>
                        <button
                            onClick={() => setActiveTab('settings')}
                            className={clsx(
                                "flex items-center gap-2 px-6 py-2 rounded-lg transition-all duration-300 font-medium",
                                activeTab === 'settings'
                                    ? "bg-white dark:bg-slate-700 text-amber-600 shadow-sm"
                                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                            )}
                        >
                            <Settings size={18} />
                            {t.settingsTab}
                        </button>
                    </div>

                    <button
                        onClick={onClose}
                        className="p-2 md:p-3 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors"
                        aria-label="Close"
                    >
                        <X size={24} />
                    </button>
                </div>
            </header>

            {/* Main Content Area */}
            <main
                ref={scrollContainerRef}
                className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-8 custom-scrollbar relative"
            >
                {/* Mobile Tabs */}
                <div className="flex md:hidden items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl mb-6 sticky top-0 z-30">
                    <button
                        onClick={() => setActiveTab('interface')}
                        className={clsx(
                            "flex-1 flex items-center justify-center gap-2 py-3 rounded-lg transition-all duration-300 font-medium",
                            activeTab === 'interface'
                                ? "bg-white dark:bg-slate-700 text-amber-600 shadow-sm"
                                : "text-slate-600 dark:text-slate-400"
                        )}
                    >
                        <Layout size={18} />
                        {t.interfaceTab}
                    </button>
                    <button
                        onClick={() => setActiveTab('settings')}
                        className={clsx(
                            "flex-1 flex items-center justify-center gap-2 py-3 rounded-lg transition-all duration-300 font-medium",
                            activeTab === 'settings'
                                ? "bg-white dark:bg-slate-700 text-amber-600 shadow-sm"
                                : "text-slate-600 dark:text-slate-400"
                        )}
                    >
                        <Settings size={18} />
                        {t.settingsTab}
                    </button>
                </div>

                {/* Grid of Images with Section Headers */}
                <div className="max-w-screen-2xl mx-auto space-y-16">
                    {activeTab === 'interface' ? (
                        <>
                            {/* Group 1: Start */}
                            <section>
                                <SectionHeader id="section-start" title={t.guideStart} />
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
                                    {filteredImages.filter(img => img.id >= 1 && img.id <= 3).map((img) => (
                                        <ImageCard key={img.id} img={img} onClick={setSelectedImage} t={t} />
                                    ))}
                                </div>
                            </section>

                            {/* Group 2: Verse Visibility */}
                            <section>
                                <SectionHeader id="section-verses" title={t.guideVerseVisibility} />
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
                                    {filteredImages.filter(img => img.id >= 4 && img.id <= 14).map((img) => (
                                        <ImageCard key={img.id} img={img} onClick={setSelectedImage} t={t} />
                                    ))}
                                </div>
                            </section>

                            {/* Group 3: Word Visibility */}
                            <section>
                                <SectionHeader id="section-words" title={t.guideWordVisibility} />
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
                                    {filteredImages.filter(img => img.id >= 15 && img.id <= 23).map((img) => (
                                        <ImageCard key={img.id} img={img} onClick={setSelectedImage} t={t} />
                                    ))}
                                </div>
                            </section>

                            {/* Group 4: Quran Interface */}
                            <section>
                                <SectionHeader id="section-quran" title={t.guideQuranUI} />
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
                                    {filteredImages.filter(img => img.id >= 24 && img.id <= 29).map((img) => (
                                        <ImageCard key={img.id} img={img} onClick={setSelectedImage} t={t} />
                                    ))}
                                </div>
                            </section>
                        </>
                    ) : (
                        /* Settings Tab Organized into Sections */
                        <>
                            {/* Group 1: Tools & Settings Menu */}
                            <section>
                                <SectionHeader id="section-tools" title={t.guideSettingsTools} />
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
                                    {filteredImages.filter(img => img.id >= 30 && img.id <= 31).map((img) => (
                                        <ImageCard key={img.id} img={img} onClick={setSelectedImage} t={t} />
                                    ))}
                                </div>
                            </section>

                            {/* Group 2: Index */}
                            <section>
                                <SectionHeader id="section-index" title={t.guideIndex} />
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
                                    {filteredImages.filter(img => img.id >= 32 && img.id <= 34).map((img) => (
                                        <ImageCard key={img.id} img={img} onClick={setSelectedImage} t={t} />
                                    ))}
                                </div>
                            </section>

                            {/* Group 3: Search */}
                            <section>
                                <SectionHeader id="section-search" title={t.guideSearch} />
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
                                    {filteredImages.filter(img => img.id === 35).map((img) => (
                                        <ImageCard key={img.id} img={img} onClick={setSelectedImage} t={t} />
                                    ))}
                                </div>
                            </section>

                            {/* Group 4: Memorization Stats */}
                            <section>
                                <SectionHeader id="section-stats" title={t.guideMemorizationStats} />
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
                                    {filteredImages.filter(img => img.id === 36).map((img) => (
                                        <ImageCard key={img.id} img={img} onClick={setSelectedImage} t={t} />
                                    ))}
                                </div>
                            </section>

                            {/* Group 5: Notifications */}
                            <section>
                                <SectionHeader id="section-notify" title={t.guideNotifications} />
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
                                    {filteredImages.filter(img => img.id >= 37 && img.id <= 42).map((img) => (
                                        <ImageCard key={img.id} img={img} onClick={setSelectedImage} t={t} />
                                    ))}
                                </div>
                            </section>

                            {/* Group 6: Mutashabihat */}
                            <section>
                                <SectionHeader id="section-mutashabihat" title={t.guideMutashabihat} />
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
                                    {filteredImages.filter(img => img.id >= 43 && img.id <= 44).map((img) => (
                                        <ImageCard key={img.id} img={img} onClick={setSelectedImage} t={t} />
                                    ))}
                                </div>
                            </section>

                            {/* Group 7: Calculator */}
                            <section>
                                <SectionHeader id="section-calc" title={t.guideVerseCalculator} />
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
                                    {filteredImages.filter(img => img.id >= 45 && img.id <= 46).map((img) => (
                                        <ImageCard key={img.id} img={img} onClick={setSelectedImage} t={t} />
                                    ))}
                                </div>
                            </section>

                            {/* Group 8: Prayer Mode */}
                            <section>
                                <SectionHeader id="section-prayer" title={t.guidePrayerMode} />
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
                                    {filteredImages.filter(img => img.id >= 47 && img.id <= 48).map((img) => (
                                        <ImageCard key={img.id} img={img} onClick={setSelectedImage} t={t} />
                                    ))}
                                </div>
                            </section>

                            {/* Group 9: Notes */}
                            <section>
                                <SectionHeader id="section-notes" title={t.guideNotes} />
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
                                    {filteredImages.filter(img => img.id >= 49).map((img) => (
                                        <ImageCard key={img.id} img={img} onClick={setSelectedImage} t={t} />
                                    ))}
                                </div>
                            </section>
                        </>
                    )}
                </div>

                {/* Bottom Spacer */}
                <div className="h-20" />
            </main>

            {/* Lightbox / Image Viewer */}
            {selectedImage && (
                <div
                    className="fixed inset-0 z-[300] bg-black flex flex-col animate-in fade-in duration-300 touch-none"
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                >
                    {/* Lightbox Header - Counter and Title Centered */}
                    <div className="flex items-center justify-between p-4 md:p-6 bg-black/50 border-b border-white/10">
                        <div className="flex-1 hidden md:block">
                            <h2 className="text-white text-xl font-bold truncate opacity-50">
                                {selectedImage.title}
                            </h2>
                        </div>

                        {/* Middle: Prominent Counter */}
                        <div className="flex items-center gap-4 bg-amber-600 px-6 py-2 rounded-full shadow-2xl border border-amber-400/50">
                            <span className="text-white font-black text-lg md:text-xl tracking-widest">
                                {guideImages.findIndex(i => i.id === selectedImage.id) + 1} / {guideImages.length}
                            </span>
                        </div>

                        <div className="flex-1 flex justify-end">
                            <button
                                onClick={(e) => { e.stopPropagation(); setSelectedImage(null); }}
                                className="p-3 rounded-full bg-white/10 hover:bg-red-500/80 text-white transition-all transform hover:scale-110 shadow-lg"
                            >
                                <X size={28} />
                            </button>
                        </div>
                    </div>

                    {/* Image Player Body - Fit to Screen */}
                    <div className="flex-1 relative group flex items-center justify-center p-2 md:p-8 overflow-hidden">
                        {/* Navigation Buttons (Mushaf Style: Next on Left, Prev on Right) */}
                        <button
                            className="hidden md:flex absolute right-4 lg:right-8 top-1/2 -translate-y-1/2 p-5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all disabled:opacity-5 z-10 border border-white/10"
                            onClick={navigatePrev}
                            disabled={guideImages.findIndex(i => i.id === selectedImage.id) === 0}
                        >
                            <ChevronRight size={48} />
                        </button>

                        {/* Image Container */}
                        <div className="w-full h-full flex items-center justify-center">
                            <img
                                key={selectedImage.url}
                                src={selectedImage.url}
                                alt={selectedImage.title}
                                className="max-w-full max-h-full object-contain shadow-2xl rounded-lg animate-in zoom-in-95 fade-in duration-300"
                            />
                        </div>

                        <button
                            className="hidden md:flex absolute left-4 lg:left-8 top-1/2 -translate-y-1/2 p-5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all disabled:opacity-5 z-10 border border-white/10"
                            onClick={navigateNext}
                            disabled={guideImages.findIndex(i => i.id === selectedImage.id) === guideImages.length - 1}
                        >
                            <ChevronLeft size={48} />
                        </button>
                    </div>

                    {/* Mobile Navigation - Fixed at bottom (Mushaf Style) */}
                    <div className="md:hidden flex items-center justify-between p-4 gap-4 border-t border-white/10 bg-black/90 backdrop-blur-md">
                        {/* NEXT on LEFT */}
                        <button
                            className="flex-1 flex items-center justify-center gap-3 py-4 rounded-2xl bg-amber-600 text-white font-black transition-all active:scale-95 shadow-lg"
                            onClick={navigateNext}
                            disabled={guideImages.findIndex(i => i.id === selectedImage.id) === guideImages.length - 1}
                        >
                            <ChevronLeft size={24} />
                            <span>{t.next}</span>
                        </button>

                        {/* PREV on RIGHT */}
                        <button
                            className="flex-1 flex items-center justify-center gap-3 py-4 rounded-2xl bg-white/10 text-white font-bold transition-all active:scale-95 border border-white/10"
                            onClick={navigatePrev}
                            disabled={guideImages.findIndex(i => i.id === selectedImage.id) === 0}
                        >
                            <ChevronRight size={24} />
                            <span>{t.previous}</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
