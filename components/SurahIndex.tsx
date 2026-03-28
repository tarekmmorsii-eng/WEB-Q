import React, { useState } from 'react';
import { JUZ_SECTIONS, JUZ_START_PAGES } from '../constants';
import { SURAHS } from '../constants/surahData';
import { getSurahStartPage, getJuzForPage } from '../services/quranService';
import { LocationData, VerseBookmark } from '../types';
import { Translations } from '../i18n/translations';
import { X, Clock } from 'lucide-react';
import clsx from 'clsx';

interface SurahIndexProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPage: (page: number) => void;
  pageBookmarks: LocationData[];
  verseBookmarks: VerseBookmark[];
  history: LocationData[];
  onRemovePageBookmark: (page: number) => void;
  onRemoveVerseBookmark: (id: string) => void;
  t: Translations;
  language: string;
  currentPage: number;
}

type Tab = 'surah' | 'juz' | 'bookmarks';

const SurahIndex: React.FC<SurahIndexProps> = ({
  isOpen, onClose, onSelectPage,
  pageBookmarks, verseBookmarks, history,
  onRemovePageBookmark, onRemoveVerseBookmark, t, language,
  currentPage
}) => {
  const isRTL = t.dir === 'rtl';

  // Helper to convert to Arabic numerals using toLocaleString
  const toArabic = (n: number | string) => {
    if (!isRTL) return n.toString();
    const num = typeof n === 'string' ? parseInt(n) : n;
    if (isNaN(num)) return n.toString();
    
    // Use specific locales for different RTL languages if needed
    if (language === 'ur') return num.toLocaleString('ur-PK');
    if (language === 'fa') return num.toLocaleString('fa-IR');
    return num.toLocaleString('ar-EG');
  };
  const [activeTab, setActiveTab] = useState<Tab>('surah');
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (isOpen && (activeTab === 'surah' || activeTab === 'juz') && scrollContainerRef.current) {
      // Find the currently active surah, juz, or section item
      setTimeout(() => {
        const activeItem = scrollContainerRef.current?.querySelector('.active-index-item');
        if (activeItem) {
          activeItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    }
  }, [isOpen, activeTab, currentPage]);

  if (!isOpen) return null;

  const fullSurahList = Array.from({ length: 114 }, (_, i) => {
    const num = i + 1;
    const name = t.surahNames[i] || `${t.surah} ${num}`;
    return { number: num, name };
  });

  const HizbIcon = ({ type }: { type: string }) => {
    return (
      <div className="relative w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden flex-shrink-0">
        <div className={clsx(
          "absolute inset-0 bg-teal-500 dark:bg-teal-400",
          type === 'full' && "w-full h-full",
          type === 'quarter' && "w-1/2 h-1/2 left-1/2 top-0",
          type === 'half' && "w-1/2 h-full left-1/2",
          type === 'three-quarter' && "w-full h-full",
        )}>
          {type === 'three-quarter' && (
            <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-slate-200 dark:bg-slate-700"></div>
          )}
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'surah':

        // Build a list that includes juz headers interleaved with surahs
        const surahsWithJuz: Array<{ type: 'juz' | 'surah'; juz?: number; surah?: typeof SURAHS[0]; page?: number }> = [];
        let lastJuzAdded = 0;

        SURAHS.forEach((surah, index) => {
          // Check if any juz starts before or at this surah's start page
          // but after the previous surah's start page
          const prevSurahPage = index > 0 ? SURAHS[index - 1].startPage : 0;

          for (let juzIndex = lastJuzAdded; juzIndex < 30; juzIndex++) {
            const juzStartPage = JUZ_START_PAGES[juzIndex];
            if (juzStartPage > prevSurahPage && juzStartPage <= surah.startPage) {
              surahsWithJuz.push({ type: 'juz', juz: juzIndex + 1, page: juzStartPage });
              lastJuzAdded = juzIndex + 1;
            }
          }

          surahsWithJuz.push({ type: 'surah', surah, page: surah.startPage });
        });

        // Find the index of the currently active item
        let activeIdx = -1;
        for (let i = surahsWithJuz.length - 1; i >= 0; i--) {
          if (surahsWithJuz[i].page! <= currentPage) {
            activeIdx = i;
            break;
          }
        }

        return (
          <div ref={scrollContainerRef} className="flex-1 overflow-y-auto bg-white dark:bg-slate-900">
            {surahsWithJuz.map((item, idx) => {
              const isActive = idx === activeIdx;

              if (item.type === 'juz') {
                return (
                  <button
                    key={`juz-${item.juz}`}
                    onClick={() => {
                      onSelectPage(item.page!);
                      onClose();
                    }}
                    className={clsx(
                      "w-full flex items-center justify-between px-4 py-3 sticky top-0 z-10 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors",
                      isActive ? "bg-amber-100 dark:bg-amber-900/40 active-index-item" : "bg-slate-100 dark:bg-slate-800"
                    )}
                  >
                    {/* Juz Name */}
                    <span className="text-amber-800 dark:text-amber-500 font-bold text-base" style={{ fontFamily: "'Almarai', sans-serif" }}>{t.juz} {toArabic(item.juz!)}</span>
                    {/* Page Number */}
                    <span className="text-slate-400 dark:text-slate-500 text-sm" style={{ fontFamily: "'Almarai', sans-serif" }}>{toArabic(item.page!)}</span>
                  </button>
                );
              }

              const surah = item.surah!;
              return (
                <button
                  key={surah.number}
                  onClick={() => {
                    onSelectPage(surah.startPage);
                    onClose();
                  }}
                  className={clsx(
                    "w-full flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-slate-800 transition-colors group",
                    isActive ? "bg-amber-50 dark:bg-amber-900/20 active-index-item" : "hover:bg-amber-50 dark:hover:bg-slate-800"
                  )}
                >
                  {/* Surah Number (Left) */}
                  <span className="flex items-center justify-center w-8 h-8 text-slate-600 dark:text-slate-400 text-lg font-bold" style={{ fontFamily: "'Almarai', sans-serif" }}>
                    {toArabic(surah.number)}
                  </span>

                  {/* Surah Info (Center) */}
                  <div className={clsx("flex-1 px-4", isRTL ? "text-right" : "text-left")}>
                    <div className="text-slate-800 dark:text-slate-200 font-amiri text-lg font-bold mb-0.5 group-hover:text-amber-800 dark:group-hover:text-amber-400">
                      {(() => {
                        const sName = t.surahNames[surah.number - 1];
                        return (language === 'ar' || language === 'en') ? `${t.surahPrefix} ${sName}` : `${sName} ${t.surah}`;
                      })()}
                    </div>
                    <div className="text-slate-500 dark:text-slate-500 text-xs font-sans">
                      {surah.revelationType} - {toArabic(surah.ayahCount)} {t.verse}
                    </div>
                  </div>

                  {/* Page Number (Right in RTL, Left in LTR) */}
                  <span className={clsx("text-slate-400 dark:text-slate-500 text-sm w-10", isRTL ? "text-right" : "text-left")} style={{ fontFamily: "'Almarai', sans-serif" }}>
                    {toArabic(surah.startPage)}
                  </span>
                </button>
              );
            })}
          </div>
        );

      case 'juz':
        let lastJuz = 0;
        // Find active section in Juz tab
        let activeSectionIdx = -1;
        for (let i = JUZ_SECTIONS.length - 1; i >= 0; i--) {
          if (JUZ_SECTIONS[i].page <= currentPage) {
            activeSectionIdx = i;
            break;
          }
        }

        return (
          <div ref={scrollContainerRef} className="flex-1 overflow-y-auto bg-white dark:bg-slate-900">
            {JUZ_SECTIONS.map((section, idx) => {
              const showJuzHeader = section.juz !== lastJuz;
              if (showJuzHeader) lastJuz = section.juz;

              const isHizbStart = section.type === 'full';
              const isActive = idx === activeSectionIdx;

              return (
                <React.Fragment key={section.id}>
                  {showJuzHeader && (
                    <div className={clsx("bg-slate-100 dark:bg-slate-800 px-4 py-2 text-amber-800 dark:text-amber-500 font-bold text-lg sticky top-0 z-10 shadow-sm", isRTL ? "text-right" : "text-left")} style={{ fontFamily: "'Almarai', sans-serif" }}>
                      {t.juz} {toArabic(section.juz)}
                    </div>
                  )}
                  <button
                    onClick={() => {
                      onSelectPage(section.page);
                      onClose();
                    }}
                    className={clsx(
                      "w-full flex items-center p-4 border-b border-gray-100 dark:border-slate-800 transition-colors group",
                      isRTL && "flex-row-reverse",
                      isActive ? "bg-amber-50 dark:bg-amber-900/20 active-index-item" : "hover:bg-amber-50 dark:hover:bg-slate-800"
                    )}
                  >
                    {/* Page Number */}
                    <div className={clsx("w-8 pl-2 text-slate-300 dark:text-slate-600 text-sm group-hover:text-slate-500 transition-colors", isRTL ? "text-left" : "text-right")} style={{ fontFamily: "'Almarai', sans-serif" }}>
                      {toArabic(section.page)}
                    </div>

                    {/* Text Content (Center) */}
                    <div className={clsx("flex-1 pr-4", isRTL ? "text-right" : "text-left")}>
                      <div className="text-slate-800 dark:text-slate-200 font-amiri text-lg leading-normal mb-1 truncate">
                        {section.text}
                      </div>
                      <div className="text-slate-500 dark:text-slate-500 text-xs font-sans">
                        {(() => {
                          const sName = t.surahNames[section.surahNum - 1] || section.surahNum;
                          return `${language === 'ar' ? t.surahPrefix : ''} ${sName}${language !== 'ar' ? ' ' + t.surah : ''}، ${t.verse} ${toArabic(section.ayahNum)}`;
                        })()}
                      </div>
                    </div>

                    {/* Icon (Right side) */}
                    <div className="ml-3 flex-shrink-0 w-10 flex justify-center">
                      {isHizbStart ? (
                        <div className="w-9 h-9 rounded-full bg-teal-100 dark:bg-teal-900/30 border border-teal-500 dark:border-teal-400 flex items-center justify-center text-teal-700 dark:text-teal-400 font-bold font-sans text-lg shadow-sm">
                          {toArabic(section.hizb)}
                        </div>
                      ) : (
                        <HizbIcon type={section.type} />
                      )}
                    </div>
                  </button>
                </React.Fragment>
              );
            })}
          </div>
        );

      case 'bookmarks':
        return (
          <div className="flex-1 overflow-y-auto bg-white dark:bg-slate-900">
            {/* 1. Last Viewed (History) */}
            {history.length > 0 && (
              <div className="mb-2">
                <div className={clsx("bg-gray-100 dark:bg-slate-800 px-4 py-3 text-slate-500 dark:text-slate-400 font-sans text-sm sticky top-0 z-10", isRTL ? "text-right" : "text-left")}>
                  {t.recentPages}
                </div>
                {history.map((item, idx) => (
                  <div key={`hist-${idx}`} className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
                    <button className="p-2 text-slate-400 dark:text-slate-500">
                      <Clock size={18} />
                    </button>
                    <div className={clsx("flex-1 mr-4 cursor-pointer", isRTL ? "text-right" : "text-left")} onClick={() => { onSelectPage(item.page); onClose(); }}>
                      <div className="text-slate-800 dark:text-slate-200 font-amiri text-xl mb-1">{item.surahName}</div>
                      <div className="text-slate-500 dark:text-slate-400 text-sm" style={{ fontFamily: "'Almarai', sans-serif" }}>
                        {t.page} {toArabic(item.page)}، {t.juz} {toArabic(item.juz)}
                      </div>
                    </div>
                    <div className="text-slate-400 dark:text-slate-500 text-sm ml-2 w-8 text-left" style={{ fontFamily: "'Almarai', sans-serif" }}>
                      {toArabic(item.page)}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 2. Page Bookmarks */}
            <div className="mb-2">
              <div className={clsx("bg-gray-100 dark:bg-slate-800 px-4 py-3 text-slate-500 dark:text-slate-400 font-sans text-sm sticky top-0 z-10", isRTL ? "text-right" : "text-left")}>
                {t.pageBookmarks}
              </div>
              {pageBookmarks.length === 0 ? (
                <div className="text-slate-400 dark:text-slate-500 text-center p-8 text-sm">{t.noPageBookmarks}</div>
              ) : (
                pageBookmarks.map((item) => (
                  <div key={`pb-${item.page}`} className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-slate-800 group hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
                    <button
                      className="p-2 text-slate-400 hover:text-red-500 dark:text-slate-500 dark:hover:text-red-400 transition"
                      onClick={() => onRemovePageBookmark(item.page)}
                      title={t.delete}
                    >
                      <X size={18} />
                    </button>
                    <div
                      className={clsx("flex-1 mr-4 cursor-pointer", isRTL ? "text-right" : "text-left")}
                      onClick={() => { onSelectPage(item.page); onClose(); }}
                    >
                      <div className="text-slate-800 dark:text-slate-200 font-amiri text-xl mb-1">{item.surahName}</div>
                      <div className="text-slate-500 dark:text-slate-400 text-sm" style={{ fontFamily: "'Almarai', sans-serif" }}>
                        {t.page} {toArabic(item.page)}، {t.juz} {toArabic(item.juz)}
                      </div>
                    </div>
                    <div className="text-slate-400 dark:text-slate-500 text-sm ml-2 w-8 text-left" style={{ fontFamily: "'Almarai', sans-serif" }}>
                      {toArabic(item.page)}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* 3. Verse Bookmarks */}
            <div className="mb-2">
              <div className={clsx("bg-gray-100 dark:bg-slate-800 px-4 py-3 text-slate-500 dark:text-slate-400 font-sans text-sm sticky top-0 z-10", isRTL ? "text-right" : "text-left")}>
                {t.verseBookmarksSection}
              </div>
              {verseBookmarks.length === 0 ? (
                <div className="text-slate-400 dark:text-slate-500 text-center p-8 text-sm">{t.noVerseBookmarks}</div>
              ) : (
                verseBookmarks.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-slate-800 group hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
                    {/* 1. Delete Button (Right in RTL) */}
                    <button
                      className="p-2 text-slate-400 hover:text-red-500 dark:text-slate-500 dark:hover:text-red-400 transition"
                      onClick={() => onRemoveVerseBookmark(item.id)}
                      title={t.delete}
                    >
                      <X size={18} />
                    </button>

                    {/* 2. Content (Middle) */}
                    <div
                      className="text-right flex-1 mr-4 cursor-pointer overflow-hidden"
                      onClick={() => { onSelectPage(item.page); onClose(); }}
                    >
                      <div className={clsx("text-slate-800 dark:text-slate-200 font-amiri text-xl mb-1 truncate leading-relaxed", isRTL ? "text-right" : "text-left")} dir="rtl">
                        {item.textPreview}
                      </div>
                      <div className="text-slate-500 dark:text-slate-400 text-sm" style={{ fontFamily: "'Almarai', sans-serif" }}>
                        {item.surahName}، {t.verse} {toArabic(item.ayahNumber)}
                      </div>
                    </div>

                    {/* 3. Page Number (Left in RTL) */}
                    <div className="text-slate-400 dark:text-slate-500 text-sm ml-2 w-8 text-left" style={{ fontFamily: "'Almarai', sans-serif" }}>
                      {toArabic(item.page)}
                    </div>
                  </div>
                ))
              )}
            </div>

          </div>
        );
    }
  };

  return (
    <div className={clsx("fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex animate-fade-in", isRTL ? "justify-end" : "justify-start")} onClick={onClose}>
      <div
        className={clsx("w-full sm:w-96 bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col transition-colors duration-300", isRTL ? "animate-slide-in" : "animate-slide-in-left")}
        onClick={(e) => e.stopPropagation()}
        dir={t.dir}
      >

        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-slate-900 z-10 border-b border-gray-200 dark:border-slate-700 p-4 flex justify-between items-center shadow-sm">
          <div className="flex items-center gap-3">
            <img
              src="/mushaf_logo_v2.png?v=10"
              alt="Logo"
              className="w-10 h-10 rounded-full border border-amber-500/30"
            />
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">{t.indexTitle}</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full text-slate-500 dark:text-slate-400 transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-900">
          <button
            onClick={() => setActiveTab('surah')}
            className={clsx(
              "flex-1 py-3 text-sm font-bold transition-all relative",
              activeTab === 'surah'
                ? "text-teal-600 dark:text-teal-400"
                : "text-slate-500 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-300"
            )}
          >
            {t.surah}
            {activeTab === 'surah' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-600 dark:bg-teal-400" />}
          </button>

          <button
            onClick={() => setActiveTab('juz')}
            className={clsx(
              "flex-1 py-3 text-sm font-bold transition-all relative",
              activeTab === 'juz'
                ? "text-teal-600 dark:text-teal-400"
                : "text-slate-500 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-300"
            )}
          >
            {t.juz}
            {activeTab === 'juz' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-600 dark:bg-teal-400" />}
          </button>

          <button
            onClick={() => setActiveTab('bookmarks')}
            className={clsx(
              "flex-1 py-3 text-sm font-bold transition-all relative",
              activeTab === 'bookmarks'
                ? "text-teal-600 dark:text-teal-400"
                : "text-slate-500 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-300"
            )}
          >
            {t.verseBookmarks}
            {activeTab === 'bookmarks' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-600 dark:bg-teal-400" />}
          </button>
        </div>

        {/* Content */}
        {renderContent()}
      </div>
    </div>
  );
};

export default SurahIndex;
