import React, { useRef, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, HelpCircle, BookOpen, Settings, Zap, PlayCircle } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, A11y, Autoplay } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';
import clsx from 'clsx';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { translations, Language } from '../i18n/translations';

interface HelpModalProps {
    isOpen: boolean;
    onClose: () => void;
    language: string;
}

export default function HelpModal({ isOpen, onClose, language }: HelpModalProps) {
    const t = translations[language as Language] || translations['ar'];

    const slides = [
        {
            id: 0,
            title: language === 'ar' ? "فيديو تعليمي (الجزء الأول)" : "Tutorial Video (Part 1)",
            description: language === 'ar' ? "شاهد فيديو توضيحي لكيفية استخدام أهم مميزات مصحف المراجعة." : "Watch a video demonstrating how to use the most important features of My Quran.",
            icon: PlayCircle,
            color: "bg-red-600",
            image: "/logo_splash.png",
            video: "/مصحف المراجعة ج1.mp4",
            isVideo: true
        },
        {
            id: 1,
            title: t.helpSlide1Title,
            description: t.helpSlide1Desc,
            icon: BookOpen,
            color: "bg-emerald-500",
            image: "https://images.unsplash.com/photo-1609599006353-e629aaabfeae?auto=format&fit=crop&q=80&w=1000"
        },
        {
            id: 2,
            title: t.helpSlide2Title,
            description: t.helpSlide2Desc,
            icon: Zap,
            color: "bg-amber-500",
            image: "https://images.unsplash.com/photo-1584286595398-a590219ec743?auto=format&fit=crop&q=80&w=1000"
        },
        {
            id: 3,
            title: t.helpSlide3Title,
            description: t.helpSlide3Desc,
            icon: Settings,
            color: "bg-blue-500",
            image: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&q=80&w=1000"
        },
        {
            id: 4,
            title: t.helpSlide4Title,
            description: t.helpSlide4Desc,
            icon: HelpCircle,
            color: "bg-purple-500",
            image: "https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&q=80&w=1000"
        }
    ];
    const swiperRef = useRef<SwiperType>(null);

    // Close on Escape key
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 animate-in fade-in duration-300">
            {/* Blurred Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh] md:h-[600px] border border-white/20 dark:border-slate-700/50 ring-1 ring-black/5">

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-50 p-2 bg-white/20 backdrop-blur-md hover:bg-white/30 text-white md:text-gray-500 md:bg-gray-100/50 md:hover:bg-gray-200 dark:md:bg-slate-800 dark:md:text-gray-400 rounded-full transition-all duration-200 shadow-sm"
                    aria-label="Close"
                >
                    <X size={20} />
                </button>

                {/* Swiper Container */}
                <div className="w-full h-full">
                    <Swiper
                        modules={[Navigation, Pagination, A11y, Autoplay]}
                        spaceBetween={0}
                        slidesPerView={1}
                        navigation={{
                            prevEl: '.custom-prev',
                            nextEl: '.custom-next',
                        }}
                        pagination={{
                            clickable: true,
                            el: '.custom-pagination',
                            bulletClass: 'w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-700 transition-all duration-300 mx-1.5 cursor-pointer inline-block',
                            bulletActiveClass: '!bg-amber-600 !w-8'
                        }}
                        loop={true}
                        autoplay={{
                            delay: 5000,
                            disableOnInteraction: false,
                        }}
                        className="w-full h-full"
                        onSwiper={(swiper) => (swiperRef.current = swiper)}
                    >
                        {slides.map((slide) => (
                            <SwiperSlide key={slide.id} className="w-full h-full">
                                <div className="w-full h-full flex flex-col md:flex-row">
                                    {/* Left Side: Image (Top on mobile) */}
                                    <div className="w-full md:w-1/2 h-64 md:h-full relative overflow-hidden group">
                                        <div className={clsx("absolute inset-0 opacity-20 dark:opacity-30 mix-blend-overlay", slide.color)}></div>
                                        {(slide as any).isVideo ? (
                                            <video
                                                src={(slide as any).video}
                                                controls
                                                className="w-full h-full object-cover"
                                                poster={slide.image}
                                            />
                                        ) : (
                                            <img
                                                src={slide.image}
                                                alt={slide.title}
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                            />
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent md:bg-gradient-to-r md:from-black/40 md:to-transparent pointer-events-none"></div>

                                        {/* Icon Badge */}
                                        <div className={clsx(
                                            "absolute bottom-4 left-4 md:top-8 md:left-8 md:bottom-auto w-12 h-12 md:w-16 md:h-16 rounded-2xl flex items-center justify-center shadow-lg text-white backdrop-blur-sm",
                                            slide.color
                                        )}>
                                            <slide.icon size={24} className="md:w-8 md:h-8" />
                                        </div>
                                    </div>

                                    {/* Right Side: Content (Bottom on mobile) */}
                                    <div className="w-full md:w-1/2 p-6 md:p-12 flex flex-col justify-center text-right bg-white dark:bg-slate-900 absolute bottom-0 md:relative rounded-t-3xl md:rounded-none z-10 h-auto md:h-full shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] md:shadow-none">
                                        <div className="space-y-4 md:space-y-6">
                                            <h3 className="text-2xl md:text-4xl font-bold text-gray-900 dark:text-white leading-tight">
                                                {slide.title}
                                            </h3>
                                            <p className="text-base md:text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                                                {slide.description}
                                            </p>
                                        </div>


                                    </div>
                                </div>
                            </SwiperSlide>
                        ))}
                    </Swiper>

                    {/* Custom Navigation Controls (Overlaid) */}
                    <div className="absolute bottom-6 md:bottom-12 left-0 right-0 z-20 flex items-center justify-between px-6 md:px-12 pointer-events-none">
                        {/* Pagination Container */}
                        <div className="custom-pagination pointer-events-auto flex justify-center md:justify-start"></div>

                        {/* Arrows */}
                        <div className="flex gap-2 pointer-events-auto">
                            <button className="custom-prev p-2 md:p-3 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-800 dark:text-white transition-colors shadow-sm disabled:opacity-50">
                                <ChevronRight size={24} />
                            </button>
                            <button className="custom-next p-2 md:p-3 rounded-full bg-amber-600 hover:bg-amber-700 text-white transition-colors shadow-md disabled:opacity-50">
                                <ChevronLeft size={24} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
