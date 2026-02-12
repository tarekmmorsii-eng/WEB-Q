import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Loader2, ChevronRight, Menu, Sun, Moon, Bookmark, ChevronLeft, Type, Search, Bell, BarChart3, Settings as SettingsIcon, MousePointer2, Maximize, Minimize } from 'lucide-react';
import clsx from 'clsx';
import Header from './components/Header';
import QPCV1PageRenderer, { loadQPCV1Data, getPageData } from './components/QPCV1PageRenderer';
import QPCV2PageRenderer from './components/QPCV2PageRenderer';
import SurahIndex from './components/SurahIndex';
import SearchModal from './components/SearchModal';
import NotificationManager from './components/NotificationManager';
import MemorizationStats from './components/MemorizationStats';
import Toast from './components/Toast';
import Settings from './components/Settings';
import AyahOptionsModal from './components/AyahOptionsModal';
import SurahRatingModal from './components/SurahRatingModal';
import MutashabihatModal from './components/MutashabihatModal';
import MutashabihatIndex from './components/MutashabihatIndex';
import MutashabihatSelectorModal from './components/MutashabihatSelectorModal';

import { getProcessedMutashabihat, findMutashabihatForAyah, findAllMutashabihatForAyah, getMergedMutashabihaForAyah } from './utils/mutashabihatProcessor';
import { Mutashabiha } from './types';
import TourWelcomeModal from './components/TourWelcomeModal';
import TourClickOverlay from './components/TourClickOverlay';
import PrayerModeButton from './components/PrayerModeButton';
import FullscreenExitButton from './components/FullscreenExitButton';
import SplashScreen from './components/SplashScreen';
import { ViewMode, LocationData, VerseBookmark, Ayah, PageData, NotificationItem, MemorizationRating, SurahRating, AppSettings } from './types';
import { fetchPage, getAyahPage } from './services/quranService';
import { TOTAL_PAGES } from './constants';
import { SURAHS } from './constants/surahData';
import ColorPickerModal from './components/ColorPickerModal';
import { translations, Language } from './i18n/translations';
import { THEMES, getThemeById } from './constants/themes';
import { startTour } from './utils/TourManager';

// Integrations
import { FeedbackProvider } from './contexts/FeedbackContext';
import FeedbackModal from './components/FeedbackModal';
import BetaBadge from './components/BetaBadge';
import BottomBarFeedbackButton from './components/BottomBarFeedbackButton';

const DEFAULT_SETTINGS: AppSettings = {
  language: 'ar',
  theme: 'calm-night',
  textBrightness: 100,
  backgroundBrightness: 0,
  soundEnabled: true,
  bottomBar: {
    showIndex: true,
    showSearch: false,
    showMemorization: false,
    showNotifications: false,
    showDarkMode: true,
    showFontSize: false,  // Ø­Ø°Ù Ø²Ø± ØªØ¨Ø¯ÙŠÙ„ Ø§Ù„Ø®Ø· - Ø§Ù„ØªØ­Ø¬ÙŠÙ… ØªÙ„Ù‚Ø§Ø¦ÙŠ
    showBookmark: true,
    showPrayerMode: false,
    showFullscreen: true,
    showPageNavigation: false,
  },
  defaultFontSize: 'medium',  // ÙˆØ³Ø· Ù„Ù„Ù…ÙˆØ¨Ø§ÙŠÙ„ØŒ ØµØºÙŠØ± Ù„Ù„ÙƒÙ…Ø¨ÙŠÙˆØªØ±ØŒ ÙƒØ¨ÙŠØ± Ù„Ù„ØªØ§Ø¨Ù„Øª
  lineSpacing: 1.5,
  pageMargins: 20,
  colorStopSigns: true,
  prayerMode: false,
  showMutashabihatIndicators: true,
};

export default function App() {
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    const checkTouch = () => {
      // Check for coarse pointer (touch) or no hover capability
      const hasCoarsePointer = window.matchMedia('(pointer: coarse)').matches;
      const noHover = window.matchMedia('(hover: none)').matches;
      setIsTouchDevice(hasCoarsePointer || noHover);
    };

    checkTouch();
    window.addEventListener('resize', checkTouch);
    return () => window.removeEventListener('resize', checkTouch);
  }, []);

  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem('quran_app_settings');
      let finalSettings = DEFAULT_SETTINGS;

      // Remove legacy 'theme' key if exists (was causing issues)
      localStorage.removeItem('theme');

      if (saved) {
        const parsed = { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
        // Validate theme - if old theme doesn't exist, use default
        const themeExists = THEMES.some(t => t.id === parsed.theme);
        if (!themeExists) {
          parsed.theme = 'calm-night';
          // Save corrected settings immediately
          localStorage.setItem('quran_app_settings', JSON.stringify(parsed));
        }
        finalSettings = parsed;
      }

      // Set CSS variables immediately to prevent flash
      const theme = getThemeById(finalSettings.theme);
      document.documentElement.style.setProperty('--bg-primary', theme.colors.background);
      document.documentElement.style.setProperty('--text-primary', theme.colors.text);
      if (theme.isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }

      return finalSettings;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  const t = translations[settings.language as Language] || translations['ar'];

  useEffect(() => {
    localStorage.setItem('quran_app_settings', JSON.stringify(settings));

    const theme = getThemeById(settings.theme);
    const root = document.documentElement;

    if (theme.isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    root.style.setProperty('--bg-primary', theme.colors.background);
    root.style.setProperty('--text-primary', theme.colors.text);

  }, [settings]);

  // Force disable window scrolling programmatically (except in landscape for scrolling)
  useEffect(() => {
    const updateOverflow = () => {
      const isLandscape = window.matchMedia('(orientation: landscape)').matches;
      const isMobileOrTablet = window.innerWidth <= 1440;

      if (isLandscape && isMobileOrTablet) {
        // Ø§Ù„Ø³Ù…Ø§Ø­ Ø¨Ø§Ù„ØªÙ…Ø±ÙŠØ± ÙÙŠ Ø§Ù„ÙˆØ¶Ø¹ Ø§Ù„Ø£ÙÙ‚ÙŠ Ù„Ù„Ù…ÙˆØ¨Ø§ÙŠÙ„ ÙˆØ§Ù„ØªØ§Ø¨Ù„Øª
        document.documentElement.style.overflow = 'auto';
        document.body.style.overflow = 'auto';
      } else {
        // Ù…Ù†Ø¹ Ø§Ù„ØªÙ…Ø±ÙŠØ± ÙÙŠ Ø§Ù„ÙˆØ¶Ø¹ Ø§Ù„Ø¹Ù…ÙˆØ¯ÙŠ ÙˆØ§Ù„ÙƒÙ…Ø¨ÙŠÙˆØªØ±
        document.documentElement.style.overflow = 'hidden';
        document.body.style.overflow = 'hidden';
      }
      document.documentElement.style.height = '100%';
      document.body.style.height = isLandscape && isMobileOrTablet ? 'auto' : '100%';
      document.body.style.width = '100%';
    };

    updateOverflow();
    window.addEventListener('resize', updateOverflow);
    window.addEventListener('orientationchange', updateOverflow);

    return () => {
      // Clean up
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      window.removeEventListener('resize', updateOverflow);
      window.removeEventListener('orientationchange', updateOverflow);
    };
  }, []);

  const [currentPage, setCurrentPage] = useState<number>(() => {
    const saved = localStorage.getItem('quran_last_page');
    return saved ? parseInt(saved, 10) : 1;
  });
  const [pageData, setPageData] = useState<PageData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    localStorage.setItem('quran_last_page', currentPage.toString());
  }, [currentPage]);

  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.SHOW_ALL);
  const [toggleState, setToggleState] = useState<number>(0);

  const [isIndexOpen, setIsIndexOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isMemorizationStatsOpen, setIsMemorizationStatsOpen] = useState(false);
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const [showUi, setShowUi] = useState(true);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastToggleTime = useRef<number>(0);
  const [pageFlipDirection, setPageFlipDirection] = useState<'next' | 'prev' | null>(null);

  const [pageBookmarks, setPageBookmarks] = useState<LocationData[]>([]);
  const [verseBookmarks, setVerseBookmarks] = useState<VerseBookmark[]>([]);
  const [history, setHistory] = useState<LocationData[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [memorizationRatings, setMemorizationRatings] = useState<MemorizationRating[]>([]);
  const [surahRatings, setSurahRatings] = useState<SurahRating[]>([]);
  const [ratingModalData, setRatingModalData] = useState<{ surah: number, ayah: number } | null>(null);
  const [surahRatingModalData, setSurahRatingModalData] = useState<number | null>(null); // Surah number
  const [highlightedAyah, setHighlightedAyah] = useState<{ surah: number, ayah: number } | null>(null); // New state for highlighting

  // Mutashabihat States
  const [isMutashabihatIndexOpen, setIsMutashabihatIndexOpen] = useState(false);
  const [mutashabihatIndexSurah, setMutashabihatIndexSurah] = useState<number>(1);
  const [mutashabihatIndexAyah, setMutashabihatIndexAyah] = useState<number | undefined>(undefined);
  const [mutashabihatData, setMutashabihatData] = useState<Mutashabiha[]>([]);
  const [currentMutashabiha, setCurrentMutashabiha] = useState<Mutashabiha | null>(null);
  const [multipleMutashabihat, setMultipleMutashabihat] = useState<Mutashabiha[]>([]);
  const [isMutashabihatSelectionOpen, setIsMutashabihatSelectionOpen] = useState(false);
  const [isMutashabihatModalOpen, setIsMutashabihatModalOpen] = useState(false);
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const [activeMutashabihaId, setActiveMutashabihaId] = useState<string | null>(null);
  const [selectorIsInsideSurah, setSelectorIsInsideSurah] = useState<boolean>(false);

  // Load mutashabihat data on mount with custom user data
  useEffect(() => {
    const loadData = async () => {
      try {
        const { getProcessedMutashabihat } = await import('./utils/mutashabihatProcessor');
        const { SURAHS } = await import('./constants/surahData');

        const baseData = await getProcessedMutashabihat();
        const savedCustom = localStorage.getItem('custom_mutashabihat');
        let customData: Mutashabiha[] = savedCustom ? JSON.parse(savedCustom) : [];

        // تنظيف البيانات المخصصة من أي أرقام آيات وهمية (مثل آل عمران 700)
        customData = customData.map(mut => ({
          ...mut,
          similarAyahs: mut.similarAyahs.filter(a => {
            const surahInfo = SURAHS.find(s => s.number === a.surahNumber);
            return surahInfo && a.ayahNumber > 0 && a.ayahNumber <= surahInfo.ayahCount;
          })
        })).filter(mut => mut.similarAyahs.length > 0 || mut.id.startsWith('tarteel_'));

        // دمج البيانات: المخصص يحل محل الأساسي إذا تشابه المعرف
        const mergedMap = new Map<string, Mutashabiha>();
        baseData.forEach(m => mergedMap.set(m.id, m));
        customData.forEach(m => mergedMap.set(m.id, m));

        setMutashabihatData(Array.from(mergedMap.values()));
        console.log(`✅ Mutashabihat Loaded: ${mergedMap.size} total associations.`);
      } catch (error) {
        console.error('❌ Error loading mutashabihat:', error);
      }
    };
    loadData();
  }, []);

  const handleAddSimilarAyah = (mutashabihaId: string, isInsideSurah: boolean) => {
    setActiveMutashabihaId(mutashabihaId);
    setSelectorIsInsideSurah(isInsideSurah);
    setIsSelectorOpen(true);
  };

  const handleSelectSimilarAyah = async (surah: number, ayah: number) => {
    if (!activeMutashabihaId) return;

    try {
      const { getAyahText } = await import('./utils/ayahTextHelper');
      const { calculateMutashabihatSimilarity } = await import('./utils/similarityCalculator');
      const targetText = await getAyahText(surah, ayah);

      let updatedMut: Mutashabiha | null = null;

      setMutashabihatData(prev => {
        const newData = [...prev];
        let mutIndex = newData.findIndex(m => m.id === activeMutashabihaId);

        if (mutIndex === -1 && activeMutashabihaId?.startsWith('merged_')) {
          const [_, sNum, aNum] = activeMutashabihaId.split('_').map(Number);
          const customId = `custom_${sNum}_${aNum}`;
          mutIndex = newData.findIndex(m => m.id === customId);

          if (mutIndex === -1) {
            const newMut: Mutashabiha = {
              id: customId,
              sourceAyah: {
                surahNumber: sNum,
                ayahNumber: aNum,
                text: currentMutashabiha?.sourceAyah.text || ''
              },
              similarAyahs: []
            };
            newData.push(newMut);
            mutIndex = newData.length - 1;
          }
        }

        if (mutIndex !== -1) {
          const mut = { ...newData[mutIndex] };
          mut.similarAyahs = [...mut.similarAyahs];

          const similarityInfo = calculateMutashabihatSimilarity(mut.sourceAyah.text || '', targetText);

          if (!mut.similarAyahs.some(a => a.surahNumber === surah && a.ayahNumber === ayah)) {
            mut.similarAyahs.push({
              surahNumber: surah,
              ayahNumber: ayah,
              text: targetText,
              similarity: {
                ...similarityInfo,
                label: `مضافة: ${similarityInfo.label}`,
                labelEn: `Added: ${similarityInfo.labelEn}`
              },
              isCustom: true
            });
            newData[mutIndex] = mut;
            updatedMut = mut;
          }
        }

        const customOnly = newData.filter(m =>
          m.id.startsWith('custom_') ||
          m.similarAyahs.some(a => (a as any).isCustom)
        );
        localStorage.setItem('custom_mutashabihat', JSON.stringify(customOnly));
        return newData;
      });

      // Update current view after state update
      if (currentMutashabiha) {
        setTimeout(() => {
          if (currentMutashabiha.id.startsWith('merged_')) {
            const [_, s, a] = currentMutashabiha.id.split('_').map(Number);
            const updatedMerged = getMergedMutashabihaForAyah(s, a, mutashabihatData);
            if (updatedMerged) setCurrentMutashabiha(updatedMerged);
          } else if (updatedMut) {
            setCurrentMutashabiha(updatedMut);
          }
        }, 0);
      }

    } catch (err) {
      console.error("Failed to add mutashabiha:", err);
    }

    setIsSelectorOpen(false);
    setActiveMutashabihaId(null);
  };

  const handleDeleteSimilarAyah = (mutId: string, surah: number, ayah: number) => {
    setMutashabihatData(prev => {
      const newData = [...prev];
      const isMerged = mutId.startsWith('merged_');
      let affected = false;

      newData.forEach((m, idx) => {
        const isMatch = isMerged
          ? (mutId === `merged_${m.sourceAyah.surahNumber}_${m.sourceAyah.ayahNumber}` ||
            m.similarAyahs.some(sa => `merged_${sa.surahNumber}_${sa.ayahNumber}` === mutId))
          : m.id === mutId;

        if (isMatch) {
          const originalLength = m.similarAyahs.length;
          const filteredItems = m.similarAyahs.filter(
            a => !(a.surahNumber === surah && a.ayahNumber === ayah)
          );

          if (filteredItems.length !== originalLength) {
            newData[idx] = { ...m, similarAyahs: filteredItems };
            affected = true;
          }
        }
      });

      if (affected) {
        const customOnly = newData.filter(m =>
          m.id.startsWith('custom_') ||
          m.similarAyahs.some(a => (a as any).isCustom)
        );
        localStorage.setItem('custom_mutashabihat', JSON.stringify(customOnly));
      }
      return newData;
    });
  };

  // Sync current selection with potentially updated data list to show changes instantly
  useEffect(() => {
    if (isMutashabihatModalOpen && currentMutashabiha) {
      if (currentMutashabiha.id.startsWith('merged_')) {
        const [_, s, a] = currentMutashabiha.id.split('_').map(Number);
        const updated = getMergedMutashabihaForAyah(s, a, mutashabihatData);
        if (updated) {
          const currentJson = JSON.stringify(currentMutashabiha.similarAyahs);
          const updatedJson = JSON.stringify(updated.similarAyahs);
          if (currentJson !== updatedJson) {
            setCurrentMutashabiha(updated);
          }
        }
      } else {
        const updated = mutashabihatData.find(m => m.id === currentMutashabiha.id);
        if (updated) {
          const currentJson = JSON.stringify(currentMutashabiha.similarAyahs);
          const updatedJson = JSON.stringify(updated.similarAyahs);
          if (currentJson !== updatedJson) {
            setCurrentMutashabiha(updated);
          }
        }
      }
    }
  }, [mutashabihatData, isMutashabihatModalOpen]);

  const handleOpenMutashabihat = useCallback((surah: number, ayah: number) => {
    let merged = getMergedMutashabihaForAyah(surah, ayah, mutashabihatData);

    if (!merged) {
      merged = {
        id: `merged_${surah}_${ayah}`,
        sourceAyah: {
          surahNumber: surah,
          ayahNumber: ayah,
          text: ""
        },
        similarAyahs: []
      };
    }

    setCurrentMutashabiha(merged);
    setIsMutashabihatModalOpen(true);
  }, [mutashabihatData]);

  // 1. Manual Update Logic (Top Level)
  const [toastAction, setToastAction] = useState<{ label: string, onClick: () => void } | undefined>(undefined);

  // 2. Fullscreen State
  const [isFullscreen, setIsFullscreen] = useState(false);

  // 3. Alarm State
  const [activeAlarm, setActiveAlarm] = useState<NotificationItem | null>(null);
  const alarmAudioRef = useRef<HTMLAudioElement | null>(null);

  // 4. Update State
  const [hasAppUpdate, setHasAppUpdate] = useState(false);

  // 5. Tour State
  const [showTourWelcome, setShowTourWelcome] = useState(false);
  const [showTourClickOverlay, setShowTourClickOverlay] = useState(false);
  const [isTourActive, setIsTourActive] = useState(false);

  // 4. Alarm Auto-close Logic (59 seconds)
  useEffect(() => {
    if (activeAlarm) {
      const timer = setTimeout(() => {
        if (alarmAudioRef.current) {
          alarmAudioRef.current.pause();
          alarmAudioRef.current.currentTime = 0;
        }
        setActiveAlarm(null);
      }, 59000); // 59 seconds as requested

      return () => clearTimeout(timer);
    }
  }, [activeAlarm]);

  // State Ref to access current state inside the event listener without dependencies
  const stateRef = useRef({
    isIndexOpen,
    isSearchOpen,
    isSettingsOpen,
    isMemorizationStatsOpen,
    isNotificationOpen,
    isColorPickerOpen,
    ratingModalData,
    isTouchDevice // Include this if needed, though simpler is better
  });

  // Keep Ref updated
  useEffect(() => {
    stateRef.current = {
      isIndexOpen,
      isSearchOpen,
      isSettingsOpen,
      isMemorizationStatsOpen,
      isNotificationOpen,
      isColorPickerOpen,
      ratingModalData,
      isTouchDevice
    };
  }, [isIndexOpen, isSearchOpen, isSettingsOpen, isMemorizationStatsOpen, isNotificationOpen, isColorPickerOpen, ratingModalData, isTouchDevice]);

  // Listen for custom back button event
  useEffect(() => {
    const handleOpenIndex = () => {
      setIsIndexOpen(true);
    };

    const handleCloseModal = (e: CustomEvent) => {
      const modalType = e.detail.modalType;
      if (modalType === 'index') setIsIndexOpen(false);
      else if (modalType === 'search') setIsSearchOpen(false);
      else if (modalType === 'settings') setIsSettingsOpen(false);
      else if (modalType === 'stats') setIsMemorizationStatsOpen(false);
      else if (modalType === 'notifications') setIsNotificationOpen(false);
      else if (modalType === 'colorPicker') setIsColorPickerOpen(false);
      else if (modalType === 'rating') setRatingModalData(null);
    };

    window.addEventListener('backButtonOpenIndex', handleOpenIndex);
    window.addEventListener('backButtonCloseModal', handleCloseModal as EventListener);

    return () => {
      window.removeEventListener('backButtonOpenIndex', handleOpenIndex);
      window.removeEventListener('backButtonCloseModal', handleCloseModal as EventListener);
    };
  }, []);

  // Handle Mobile Back Button - FINAL FIX
  // Handle Mobile/Tablet Back Button - Final Robust V2
  useEffect(() => {
    // 1. Initial Trap on Mount (Works for lenient browsers)
    window.history.pushState({ indexOpen: false }, "");

    // 2. Interaction Trap (Works for strict browsers requiring user gesture)
    const initTrap = () => {
      // If we haven't already trapped (check state or just push again safely)
      window.history.pushState({ indexOpen: false }, "");
      // Remove listeners once trapped
      window.removeEventListener('touchstart', initTrap);
      window.removeEventListener('click', initTrap);
    };

    window.addEventListener('touchstart', initTrap);
    window.addEventListener('click', initTrap);

    const handlePopState = (event: PopStateEvent) => {
      // Prevent standard back action
      // event.preventDefault(); // popstate is not cancellable, but good for intent

      const current = stateRef.current;
      const anyModalOpen =
        current.isIndexOpen ||
        current.isSearchOpen ||
        current.isSettingsOpen ||
        current.isMemorizationStatsOpen ||
        current.isNotificationOpen ||
        current.isColorPickerOpen ||
        current.ratingModalData;

      if (anyModalOpen) {
        // Modal is open, so "Back" means "Close Modal"
        // Since we already popped state, we just update UI
        if (current.isIndexOpen) window.dispatchEvent(new CustomEvent('backButtonCloseModal', { detail: { modalType: 'index' } }));
        else if (current.isSearchOpen) window.dispatchEvent(new CustomEvent('backButtonCloseModal', { detail: { modalType: 'search' } }));
        else if (current.isSettingsOpen) window.dispatchEvent(new CustomEvent('backButtonCloseModal', { detail: { modalType: 'settings' } }));
        else if (current.isMemorizationStatsOpen) window.dispatchEvent(new CustomEvent('backButtonCloseModal', { detail: { modalType: 'stats' } }));
        else if (current.isNotificationOpen) window.dispatchEvent(new CustomEvent('backButtonCloseModal', { detail: { modalType: 'notifications' } }));
        else if (current.isColorPickerOpen) window.dispatchEvent(new CustomEvent('backButtonCloseModal', { detail: { modalType: 'colorPicker' } }));
        else if (current.ratingModalData) window.dispatchEvent(new CustomEvent('backButtonCloseModal', { detail: { modalType: 'rating' } }));

        // REMOVED: The setTimeout re-push was causing issues on Mobile.
        // We rely on the natural history depth, or the Interaction Trap to re-engage if needed later.

      } else {
        // No modals open -> "Back" means "Open Index"
        // We push state forward to negate the back action (Stay on page) AND open index
        // This is the "Trap Loop"
        window.history.pushState({ indexOpen: true }, "");
        window.dispatchEvent(new Event('backButtonOpenIndex'));
      }
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('touchstart', initTrap);
      window.removeEventListener('click', initTrap);
    };
  }, []);

  const toggleFullScreen = useCallback(() => {
    const doc = document as any;
    const docEl = document.documentElement as any;

    const isCurrentlyFullscreen = doc.fullscreenElement ||
      doc.webkitFullscreenElement ||
      doc.mozFullScreenElement ||
      doc.msFullscreenElement;

    if (!isCurrentlyFullscreen) {
      // Enter fullscreen
      if (docEl.requestFullscreen) {
        docEl.requestFullscreen();
      } else if (docEl.webkitRequestFullscreen) {
        docEl.webkitRequestFullscreen();
      } else if (docEl.mozRequestFullScreen) {
        docEl.mozRequestFullScreen();
      } else if (docEl.msRequestFullscreen) {
        docEl.msRequestFullscreen();
      }
    } else {
      // Exit fullscreen
      if (doc.exitFullscreen) {
        doc.exitFullscreen();
      } else if (doc.webkitExitFullscreen) {
        doc.webkitExitFullscreen();
      } else if (doc.mozCancelFullScreen) {
        doc.mozCancelFullScreen();
      } else if (doc.msExitFullscreen) {
        doc.msExitFullscreen();
      }
    }
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      const doc = document as any;
      setIsFullscreen(!!(
        doc.fullscreenElement ||
        doc.webkitFullscreenElement ||
        doc.mozFullScreenElement ||
        doc.msFullscreenElement
      ));
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, []);

  const handleUpdateApp = useCallback(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then(reg => {
        if (reg?.waiting) {
          reg.waiting.postMessage('SKIP_WAITING');
          setToastMessage(null);
          window.location.reload();
        }
      });
    }
  }, []);

  // Check for First Time User
  useEffect(() => {
    const hasSeenTour = localStorage.getItem('hasSeenTour');
    if (!hasSeenTour) {
      // Delay slightly to let app load
      setTimeout(() => setShowTourWelcome(true), 1500);
    }
  }, []);

  const handleStartTour = () => {
    setShowTourWelcome(false);
    localStorage.setItem('hasSeenTour', 'true');
    // Start Step 2: Click Tutorial
    setShowTourClickOverlay(true);
    // Hide UI initially to force interaction
    setShowUi(false);
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  const handleCloseTourWelcome = () => {
    setShowTourWelcome(false);
    localStorage.setItem('hasSeenTour', 'true');
  };

  const handleClickTutorialComplete = () => {
    setShowTourClickOverlay(false);
    // Reveal UI
    setShowUi(true);
    handleUiInteraction();

    // Start Driver.js Tour (Phase 3)
    // Small delay to ensure UI transition completes
    setTimeout(() => {
      setIsTourActive(true);
      // Ensure UI stays visible
      setShowUi(true);
      if (timerRef.current) clearTimeout(timerRef.current);

      startTour(0, () => {
        setIsTourActive(false);
        // Resume normal auto-hide behavior after tour ends
        handleUiInteraction();
      });
    }, 500);
  };

  // ... (existing code)

  const handleSearchResultSelect = (page: number, surah: number, ayah: number) => {
    setCurrentPage(page);
    setHighlightedAyah({ surah, ayah });
    setIsSearchOpen(false);

    // Auto-clear highlight after 3 seconds for a clean look
    setTimeout(() => {
      setHighlightedAyah(null);
    }, 3000);
  };

  const [useQPCV1, setUseQPCV1] = useState<boolean>(() => {
    // Force V2 for debugging font size issues - ignore local storage for now
    return false;
  });
  const [qpcMushafData, setQpcMushafData] = useState<any>(null);

  const mainRef = useRef<HTMLDivElement>(null);

  const handleUiInteraction = useCallback(() => {
    setShowUi(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    if (!isIndexOpen && !isSettingsOpen && !isTourActive) {
      timerRef.current = setTimeout(() => setShowUi(false), 3000);
    }
  }, [isIndexOpen, isSettingsOpen, isTourActive]);

  const toggleDarkMode = () => {
    setSettings(prev => {
      const newThemeId = getThemeById(prev.theme).isDark ? 'classic-mushaf' : 'calm-night';
      return { ...prev, theme: newThemeId };
    });
    handleUiInteraction();
  };

  const toggleFontSize = () => {
    handleUiInteraction();
    setSettings(prev => {
      const sizes: ('small' | 'medium' | 'large')[] = ['small', 'medium', 'large'];
      const currentIndex = sizes.indexOf(prev.defaultFontSize);
      const nextSize = sizes[(currentIndex + 1) % sizes.length];
      return { ...prev, defaultFontSize: nextSize };
    });
  };

  useEffect(() => {
    if (isIndexOpen || isSettingsOpen || isTourActive) {
      setShowUi(true);
      if (timerRef.current) clearTimeout(timerRef.current);
    } else {
      handleUiInteraction();
    }
  }, [isIndexOpen, isSettingsOpen, isTourActive, handleUiInteraction]);

  const handleContentTap = () => {
    if (showUi) {
      setShowUi(false);
      if (timerRef.current) clearTimeout(timerRef.current);
    } else {
      setShowUi(true);
      handleUiInteraction();
    }
  };

  const playPageFlipSound = () => {
    if (!settings.soundEnabled) return;
    try {
      const audio = new Audio('/paper-slide.wav');
      audio.volume = 0.5;
      audio.play().catch(() => console.log('Audio playback failed'));
    } catch (error) {
      console.log('Audio not supported');
    }
  };

  const isIndexOpenRef = useRef(isIndexOpen);
  useEffect(() => {
    isIndexOpenRef.current = isIndexOpen;
  }, [isIndexOpen]);



  useEffect(() => {
    // 1. Listen for Service Worker updates (Manual)
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then(reg => {
        if (reg) {
          const showUpdateToast = () => {
            setHasAppUpdate(true);
            // We no longer show the floating toast as per user request
            /*
            setToastMessage('يتوفر تحديث جديد للمصحف 🚀');
            setToastAction({
              label: 'تحديث الآن',
              onClick: handleUpdateApp
            });
            */
          };

          if (reg.waiting) showUpdateToast();

          reg.addEventListener('updatefound', () => {
            const newWorker = reg.installing;
            newWorker?.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                showUpdateToast();
              }
            });
          });
        }
      });

      let refreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing) {
          refreshing = true;
          window.location.reload();
        }
      });
    }

    // 2. Handle History Navigation logic moved to dedicated useEffect above

    // 2.5 Test Alarm Listener
    const handleTestAlarm = (e: any) => {
      const { name, sound } = e.detail;
      const finalSound = sound || '/islamic_song.mp3';

      setActiveAlarm({
        id: 'test',
        name: name,
        isEnabled: true,
        isAlarm: true,
        sound: finalSound,
        type: 'daily',
        days: [0, 1, 2, 3, 4, 5, 6],
        times: []
      });
      if (alarmAudioRef.current) {
        alarmAudioRef.current.pause();
      }
      alarmAudioRef.current = new Audio(finalSound);
      alarmAudioRef.current.loop = true;
      alarmAudioRef.current.play().catch(p => {
        console.error("Alarm sound failed:", p);
        setToastMessage(t.alarmError);
      });
    };
    window.addEventListener('triggerTestAlarm', handleTestAlarm as EventListener);

    // 3. Notification Scheduling Logic
    const checkNotifications = () => {
      if (!notifications || notifications.length === 0) return;

      const now = new Date();
      const currentDay = now.getDay();
      const hour = now.getHours().toString().padStart(2, '0');
      const minute = now.getMinutes().toString().padStart(2, '0');
      const currentTimeStr = `${hour}:${minute}`;

      notifications.forEach(n => {
        if (!n.isEnabled) return;

        // Use a unique key for each notification at a specific time to avoid double firing
        const lastFiredKey = `notif_last_fired_${n.id}_${currentTimeStr}`;
        const lastFired = localStorage.getItem(lastFiredKey);

        if (n.days.includes(currentDay) && n.times.includes(currentTimeStr) && !lastFired) {
          // If it's an alarm, trigger alarm mode
          if (n.isAlarm) {
            setActiveAlarm(n);
            if (alarmAudioRef.current) {
              alarmAudioRef.current.pause();
            }
            const soundPath = n.sound || '/islamic_song.mp3';
            alarmAudioRef.current = new Audio(soundPath);
            alarmAudioRef.current.loop = true;
            alarmAudioRef.current.play().catch(e => {
              console.error("Automatic alarm sound failed:", e);
              setToastMessage(t.notificationError);
            });
          }

          if (Notification.permission === 'granted') {
            if ('serviceWorker' in navigator) {
              navigator.serviceWorker.ready.then(reg => {
                reg.showNotification(n.name, {
                  body: n.isAlarm ? t.notificationBodyAlarm : t.notificationBodyRegular,
                  icon: '/logo192.png',
                  badge: '/logo192.png',
                  tag: `quran-notif-${n.id}`,
                  // @ts-ignore - Support service worker specific options
                  renotify: true,
                  // @ts-ignore
                  requireInteraction: n.isAlarm
                });
                // Mark as fired for this minute
                localStorage.setItem(lastFiredKey, 'true');
              });
            }
          }
        }
      });
    };

    const interval = setInterval(checkNotifications, 30000); // Every 30 seconds for accuracy
    return () => {
      clearInterval(interval);
      window.removeEventListener('triggerTestAlarm', handleTestAlarm as EventListener);
    };
  }, [handleUpdateApp, notifications]);


  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Backspace') {
        const target = event.target as HTMLElement;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

        if (!isIndexOpenRef.current) {
          event.preventDefault();
          setIsIndexOpen(true);
        } else {
          setIsIndexOpen(false);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    // ØªØ­Ù…ÙŠÙ„ Ø¨ÙŠØ§Ù†Ø§Øª QPC V1
    const initQPC = async () => {
      try {
        const data = await loadQPCV1Data();
        setQpcMushafData(data);
      } catch (err) {
        console.error("Failed to load QPC V1 data", err);
      }
    };
    initQPC();

    try {
      const savedPageBookmarks = localStorage.getItem('quran_page_bookmarks');
      const savedVerseBookmarks = localStorage.getItem('quran_verse_bookmarks');
      const savedHistory = localStorage.getItem('quran_history');
      const savedNotifications = localStorage.getItem('quran_notifications');
      const savedMemorizationRatings = localStorage.getItem('quran_memorization_ratings');
      const savedSurahRatings = localStorage.getItem('quran_surah_ratings');

      if (savedPageBookmarks) setPageBookmarks(JSON.parse(savedPageBookmarks));
      if (savedVerseBookmarks) setVerseBookmarks(JSON.parse(savedVerseBookmarks));
      if (savedHistory) setHistory(JSON.parse(savedHistory));
      if (savedNotifications) setNotifications(JSON.parse(savedNotifications));
      if (savedMemorizationRatings) setMemorizationRatings(JSON.parse(savedMemorizationRatings));
      if (savedSurahRatings) setSurahRatings(JSON.parse(savedSurahRatings));
    } catch (e) {
      console.error("Error loading local storage data", e);
    }
  }, []);

  const savePageBookmarks = (data: LocationData[]) => {
    setPageBookmarks(data);
    localStorage.setItem('quran_page_bookmarks', JSON.stringify(data));
  };
  const saveVerseBookmarks = (data: VerseBookmark[]) => {
    setVerseBookmarks(data);
    localStorage.setItem('quran_verse_bookmarks', JSON.stringify(data));
  };
  const saveHistory = (data: LocationData[]) => {
    setHistory(data);
    localStorage.setItem('quran_history', JSON.stringify(data));
  };
  const saveNotifications = (data: NotificationItem[]) => {
    setNotifications(data);
    localStorage.setItem('quran_notifications', JSON.stringify(data));
  };
  const saveMemorizationRatings = (data: MemorizationRating[]) => {
    setMemorizationRatings(data);
    localStorage.setItem('quran_memorization_ratings', JSON.stringify(data));
  };

  const saveSurahRatings = (data: SurahRating[]) => {
    setSurahRatings(data);
    localStorage.setItem('quran_surah_ratings', JSON.stringify(data));
  };

  const handleClearAllRatings = () => {
    setMemorizationRatings([]);
    setSurahRatings([]);
    localStorage.removeItem('quran_memorization_ratings');
    localStorage.removeItem('quran_surah_ratings');
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      if (mainRef.current) {
        mainRef.current.scrollTop = 0;
      }
      try {
        const data = await fetchPage(currentPage);
        setPageData(data);

        if (data && data.ayahs.length > 0) {
          const firstAyah = data.ayahs[0];
          // @ts-ignore
          const surahInfo = data.surahs[firstAyah.surah.number];

          const historyItem: LocationData = {
            page: currentPage,
            surahName: surahInfo ? t.surahNames[(firstAyah as any).surah.number - 1] : `${t.page} ${currentPage}`,
            juz: firstAyah.juz,
            timestamp: Date.now()
          };

          setHistory(prev => {
            const filtered = prev.filter(h => h.page !== currentPage);
            return [historyItem, ...filtered].slice(0, 3);
          });
          const currentHistory = [historyItem, ...history.filter(h => h.page !== currentPage)].slice(0, 3);
          localStorage.setItem('quran_history', JSON.stringify(currentHistory));
        }

        if (currentPage < TOTAL_PAGES) fetchPage(currentPage + 1).catch(() => { });
        if (currentPage > 1) fetchPage(currentPage - 1).catch(() => { });
      } catch (err) {
        setError(t.error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [currentPage, t.error]);

  const handleSetMode = (newMode: ViewMode, specificState?: number) => {
    // Throttle toggles to prevent layout thrashing (fix for "strange screen" on rapid clicks)
    const now = Date.now();
    if (now - lastToggleTime.current < 400 && specificState === undefined) return;
    lastToggleTime.current = now;

    handleUiInteraction();

    const showToast = (msg: string) => setToastMessage(msg);

    if (newMode === viewMode) {
      if (specificState !== undefined) {
        setToggleState(specificState);
        // Show appropriate toast
        if (newMode === ViewMode.TOGGLE_FIRST_WORD) showToast(specificState === 0 ? t.firstWordHidden : t.firstWordShown);
        else if (newMode === ViewMode.TOGGLE_LAST_WORD) showToast(specificState === 0 ? t.lastWordHidden : t.lastWordShown);
        else if (newMode === ViewMode.HIDE_ALL_AYAHS) showToast(specificState === 0 ? t.allAyahsHidden : t.ayahsHiddenAtStopSigns);
        else if (newMode === ViewMode.HIDE_RANDOM_WORDS) showToast(specificState === 0 ? t.randomWordsHidden : t.allWordsHidden);
        else if (newMode === ViewMode.HIDE_RANDOM_AYAHS) {
          const messages = [t.randomHidden, t.weakAyahsHidden, t.mediumAyahsHidden, t.goodAyahsHidden, t.notMemorizedAyahsHidden];
          showToast(messages[specificState]);
        }
        return;
      }

      if (newMode === ViewMode.TOGGLE_FIRST_WORD) {
        setToggleState(prev => {
          const newState = prev === 0 ? 1 : 0;
          showToast(newState === 0 ? t.firstWordHidden : t.firstWordShown);
          return newState;
        });
      } else if (newMode === ViewMode.TOGGLE_LAST_WORD) {
        setToggleState(prev => {
          const newState = prev === 0 ? 1 : 0;
          showToast(newState === 0 ? t.lastWordHidden : t.lastWordShown);
          return newState;
        });
      } else if (newMode === ViewMode.HIDE_ALL_AYAHS) {
        setToggleState(prev => {
          const newState = prev === 0 ? 1 : 0;
          showToast(newState === 0 ? t.allAyahsHidden : t.ayahsHiddenAtStopSigns);
          return newState;
        });
      } else if (newMode === ViewMode.HIDE_RANDOM_WORDS) {
        setToggleState(prev => {
          const newState = prev === 0 ? 1 : 0;
          showToast(newState === 0 ? t.randomWordsHidden : t.allWordsHidden);
          return newState;
        });
      } else if (newMode === ViewMode.HIDE_RANDOM_AYAHS) {
        setToggleState(prev => {
          const newState = (prev + 1) % 5;
          const messages = [
            t.randomHidden,
            t.weakAyahsHidden,
            t.mediumAyahsHidden,
            t.goodAyahsHidden,
            t.notMemorizedAyahsHidden
          ];
          showToast(messages[newState]);
          return newState;
        });
      }
    } else {
      setViewMode(newMode);
      setToggleState(specificState !== undefined ? specificState : 0);

      const startState = specificState !== undefined ? specificState : 0;

      switch (newMode) {
        case ViewMode.SHOW_ALL:
          showToast(t.allAyahsShown);
          break;
        case ViewMode.HIDE_ALL_AYAHS:
          showToast(startState === 0 ? t.allAyahsHidden : t.ayahsHiddenAtStopSigns);
          break;
        case ViewMode.HIDE_RANDOM_AYAHS:
          {
            const messages = [t.randomHidden, t.weakAyahsHidden, t.mediumAyahsHidden, t.goodAyahsHidden, t.notMemorizedAyahsHidden];
            showToast(messages[startState]);
          }
          break;
        case ViewMode.HIDE_RANDOM_WORDS:
          showToast(startState === 0 ? t.randomWordsHidden : t.allWordsHidden);
          break;
        case ViewMode.TOGGLE_FIRST_WORD:
          showToast(startState === 0 ? t.firstWordHidden : t.firstWordShown);
          break;
        case ViewMode.TOGGLE_LAST_WORD:
          showToast(startState === 0 ? t.lastWordHidden : t.lastWordShown);
          break;
      }
    }
  };

  // Helper function to change page without scrolling
  const changePageWithoutScroll = (direction: 'next' | 'prev') => {
    playPageFlipSound();
    setPageFlipDirection(direction);
    setTimeout(() => setPageFlipDirection(null), 400);
    if (direction === 'next') {
      setCurrentPage(p => p + 1);
    } else {
      setCurrentPage(p => p - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < TOTAL_PAGES) {
      // Scroll to top - use both methods for compatibility
      window.scrollTo({ top: 0, behavior: 'smooth' });
      if (mainRef.current) {
        mainRef.current.scrollTop = 0;
      }
      // Wait for scroll animation to complete before page change
      setTimeout(() => {
        changePageWithoutScroll('next');
      }, 300);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      // Scroll to top - use both methods for compatibility
      window.scrollTo({ top: 0, behavior: 'smooth' });
      if (mainRef.current) {
        mainRef.current.scrollTop = 0;
      }
      // Wait for scroll animation to complete before page change
      setTimeout(() => {
        changePageWithoutScroll('prev');
      }, 300);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA' ||
        isSearchOpen ||
        isIndexOpen ||
        isSettingsOpen
      ) {
        return;
      }

      if (e.key === 'ArrowRight') {
        handlePrevPage();
      } else if (e.key === 'ArrowLeft') {
        handleNextPage();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPage, isSearchOpen, isIndexOpen, isSettingsOpen]);

  // Check if current page is bookmarked
  const isPageBookmarked = pageBookmarks.some(b => b.page === currentPage);

  const togglePageBookmark = () => {
    handleUiInteraction();
    if (!pageData) return;
    const isBookmarked = pageBookmarks.some(b => b.page === currentPage);

    if (isBookmarked) {
      savePageBookmarks(pageBookmarks.filter(b => b.page !== currentPage));
    } else {
      const firstAyah = pageData.ayahs[0];
      // @ts-ignore
      const surahInfo = pageData.surahs[firstAyah.surah.number];
      const newBookmark: LocationData = {
        page: currentPage,
        surahName: surahInfo ? t.surahNames[(firstAyah as any).surah.number - 1] : `${t.page} ${currentPage}`,
        juz: firstAyah.juz,
        timestamp: Date.now()
      };
      savePageBookmarks([newBookmark, ...pageBookmarks]);
    }
  };

  const toggleVerseBookmark = (ayah: Ayah) => {
    handleUiInteraction();
    if (!pageData) return;
    // @ts-ignore
    const surahInfo = pageData.surahs[ayah.surah.number];
    const surahName = surahInfo ? t.surahNames[surahInfo.number - 1] : t.surah;
    const id = `${currentPage}-${surahInfo.number}-${ayah.numberInSurah}`;

    const exists = verseBookmarks.some(vb => vb.id === id);

    if (exists) {
      saveVerseBookmarks(verseBookmarks.filter(vb => vb.id !== id));
    } else {
      const newBookmark: VerseBookmark = {
        id,
        page: currentPage,
        surahName,
        juz: ayah.juz,
        ayahNumber: ayah.numberInSurah,
        textPreview: ayah.text.substring(0, 50) + (ayah.text.length > 50 ? '...' : ''),
        timestamp: Date.now()
      };
      saveVerseBookmarks([newBookmark, ...verseBookmarks]);
    }
  };

  const handleRateAyah = (surahNumber: number, ayahNumber: number, rating: 'weak' | 'medium' | 'good' | null) => {
    // If rating is passed explicitly (from logic, which we ignore now) OR if we open modal.
    // We want to open modal regardless of 'nextRating' logic from renderer.
    setRatingModalData({ surah: surahNumber, ayah: ayahNumber });
  };

  const handleSaveRating = (rating: 'weak' | 'medium' | 'good' | null) => {
    if (!ratingModalData) return;
    const { surah, ayah } = ratingModalData;
    const ayahId = `${surah}-${ayah}`;
    let newRatings = [...memorizationRatings];

    if (rating === null) {
      newRatings = newRatings.filter(r => r.ayahId !== ayahId);
    } else {
      const existingIndex = newRatings.findIndex(r => r.ayahId === ayahId);
      if (existingIndex >= 0) {
        newRatings[existingIndex] = { ...newRatings[existingIndex], rating, timestamp: Date.now() };
      } else {
        newRatings.push({ ayahId, rating, timestamp: Date.now() });
      }
    }
    saveMemorizationRatings(newRatings);

    // ⭐ حذف تقييم السورة بالكامل عند تقييم آية منفردة
    const surahRating = surahRatings.find(r => r.surahNumber === surah);
    if (surahRating) {
      const updated = surahRatings.filter(r => r.surahNumber !== surah);
      saveSurahRatings(updated);
    }

    setRatingModalData(null);
  };


  // Direct save function for range rating (doesn't open modal)
  const handleSaveAyahRatingDirect = (surahNumber: number, ayahNumber: number, rating: 'weak' | 'medium' | 'good' | null) => {
    const ayahId = `${surahNumber}-${ayahNumber}`;

    setMemorizationRatings(prevRatings => {
      let newRatings = [...prevRatings];

      if (rating === null) {
        newRatings = newRatings.filter(r => r.ayahId !== ayahId);
      } else {
        const existingIndex = newRatings.findIndex(r => r.ayahId === ayahId);
        if (existingIndex >= 0) {
          newRatings[existingIndex] = { ...newRatings[existingIndex], rating, timestamp: Date.now() };
        } else {
          newRatings.push({ ayahId, rating, timestamp: Date.now() });
        }
      }

      // Save to localStorage
      localStorage.setItem('quran_memorization_ratings', JSON.stringify(newRatings));
      return newRatings;
    });

    // ⭐ القاعدة #2: حذف تقييم السورة بالكامل عند تقييم آية منفردة
    const surahRating = surahRatings.find(r => r.surahNumber === surahNumber);
    if (surahRating) {
      // حذف تقييم السورة بالكامل (الدائرة ستختفي)
      const updated = surahRatings.filter(r => r.surahNumber !== surahNumber);
      saveSurahRatings(updated);
    }
  };

  const getAyahRating = (s: number, a: number) => {
    const id = `${s}-${a}`;
    return memorizationRatings.find(r => r.ayahId === id)?.rating || null;
  };

  const getSurahRating = (surahNumber: number) => {
    return surahRatings.find(r => r.surahNumber === surahNumber)?.rating || null;
  };

  const handleRateSurah = (surahNumber: number) => {
    setSurahRatingModalData(surahNumber);
  };

  const handleSaveSurahRating = (surahNumber: number, rating: 'weak' | 'medium' | 'good' | null) => {
    if (rating === null) {
      // إزالة تقييم السورة فقط
      const updated = surahRatings.filter(r => r.surahNumber !== surahNumber);
      saveSurahRatings(updated);
    } else {
      // ⭐ القاعدة #1 و #3: تقييم السورة بالكامل

      // 1. حفظ تقييم السورة مع علامة التوافق
      const existing = surahRatings.find(r => r.surahNumber === surahNumber);
      if (existing) {
        const updated = surahRatings.map(r =>
          r.surahNumber === surahNumber
            ? { ...r, rating, timestamp: Date.now(), isUnified: true }
            : r
        );
        saveSurahRatings(updated);
      } else {
        saveSurahRatings([...surahRatings, {
          surahNumber,
          rating,
          timestamp: Date.now(),
          isUnified: true
        }]);
      }

      // 2. تطبيق التقييم على جميع آيات السورة
      const surah = SURAHS.find(s => s.number === surahNumber);
      if (surah) {
        const newRatings: MemorizationRating[] = [];

        // حذف التقييمات السابقة لهذه السورة
        const filteredRatings = memorizationRatings.filter(r => {
          const [s] = r.ayahId.split('-').map(Number);
          return s !== surahNumber;
        });

        // إضافة تقييمات جديدة لكل آيات السورة
        for (let i = 1; i <= surah.ayahCount; i++) {
          newRatings.push({
            ayahId: `${surahNumber}-${i}`,
            rating,
            timestamp: Date.now()
          });
        }

        saveMemorizationRatings([...filteredRatings, ...newRatings]);
      }
    }

    setSurahRatingModalData(null);
  };

  const handleNavigateToSurah = (surahNumber: number) => {
    const surah = SURAHS.find(s => s.number === surahNumber);
    if (surah) {
      setCurrentPage(surah.startPage);
    }
  };

  const [touchStart, setTouchStart] = useState({ x: 0, y: 0 });
  const [touchEnd, setTouchEnd] = useState({ x: 0, y: 0 });

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    });
  };

  const handleTouchEnd = () => {
    if (!touchStart.x || !touchEnd.x) return;

    const distanceX = touchStart.x - touchEnd.x;
    const distanceY = Math.abs(touchStart.y - touchEnd.y);
    const minSwipeDistance = 50;

    // Horizontal swipe must be at least 3x the vertical movement for strict horizontal detection
    if (Math.abs(distanceX) > minSwipeDistance && Math.abs(distanceX) > distanceY * 3) {
      const direction = distanceX > 0 ? 'prev' : 'next';
      const canNavigate = direction === 'next' ? currentPage < TOTAL_PAGES : currentPage > 1;

      if (canNavigate) {
        // Try using both window scroll and mainRef scroll
        window.scrollTo({ top: 0, behavior: 'smooth' });
        if (mainRef.current) {
          mainRef.current.scrollTop = 0;
        }

        // Then change page after a delay
        setTimeout(() => {
          changePageWithoutScroll(direction);
        }, 400);
      }
    }

    setTouchStart({ x: 0, y: 0 });
    setTouchEnd({ x: 0, y: 0 });
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
        .then(() => setIsFullscreen(true))
        .catch(e => {
          console.error(`Error attempting to enable fullscreen mode: ${e.message} (${e.name})`);
        });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
          .then(() => setIsFullscreen(false))
          .catch(e => console.error(e));
      }
    }
  };

  const currentTheme = getThemeById(settings.theme);

  const handleMouseEnterUi = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setShowUi(true);
  }, []);

  const handleMouseLeaveUi = useCallback(() => {
    handleUiInteraction();
  }, [handleUiInteraction]);

  return (
    <FeedbackProvider>
      <div
        className="h-[100dvh] lg:h-screen w-full flex flex-col relative overflow-auto transition-colors duration-300"
        style={{
          backgroundColor: currentTheme.colors.background,
          color: currentTheme.colors.text,
        }}
      >
        <FeedbackModal />

        {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}

        {/* Main Content hidden while splash is showing to prevent flash? Optional. 
          For now we overlay it. */}

        <Header
          currentMode={viewMode}
          setMode={handleSetMode}
          toggleState={toggleState}
          isVisible={showUi}  // Ø±Ø¨Ø· Ù…Ø¹ showUi Ù„ÙŠØ®ØªÙÙŠ Ù…Ø¹ Ø§Ù„Ø¨Ø§Ø± Ø§Ù„Ø³ÙÙ„ÙŠ Ø¹Ù„Ù‰ Ø§Ù„Ù…ÙˆØ¨Ø§ÙŠÙ„/ØªØ§Ø¨Ù„Øª
          onInteraction={handleUiInteraction}
          onMouseEnter={handleMouseEnterUi}
          onMouseLeave={handleMouseLeaveUi}
          t={t}
        />

        <main
          ref={mainRef}
          className={clsx(
            "flex-1 w-full overflow-auto relative transition-all duration-500 ease-in-out flex flex-col", // Allow scrolling
            showUi ? "pt-24" : "pt-0"
          )}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onClick={handleContentTap}
        >
          <div className="flex-1 flex flex-col relative items-center w-full">
            <div className="w-full flex-1 flex flex-col">
              {loading ? (
                <div className="fixed inset-0 flex flex-col items-center justify-center bg-transparent z-[5] pointer-events-none">
                  <div className="bg-white/10 dark:bg-black/10 backdrop-blur-[2px] p-8 rounded-2xl flex flex-col items-center">
                    <div className="w-10 h-10 border-2 border-amber-600/20 border-t-amber-600 rounded-full animate-spin mb-4" />
                    <p className="text-amber-800 dark:text-amber-500 font-bold text-xs tracking-widest uppercase opacity-40">{t.loading}</p>
                  </div>
                </div>
              ) : error ? (
                <div className="text-center text-red-600 mt-20 bg-white dark:bg-slate-800 dark:text-red-400 p-6 rounded shadow border border-red-100 dark:border-red-900/30 mx-4">
                  <p>{error}</p>
                  <button
                    onClick={(e) => { e.stopPropagation(); setCurrentPage(currentPage); }}
                    className="mt-4 px-6 py-2 bg-amber-600 text-white rounded-full hover:bg-amber-700 transition-colors shadow-sm"
                  >
                    {t.retry}
                  </button>
                </div>
              ) : (
                <div
                  className={clsx(
                    "min-h-full flex flex-col flex-1 transition-all duration-500",
                    pageFlipDirection === 'next' && "page-flip-next",
                    pageFlipDirection === 'prev' && "page-flip-prev"
                  )}
                >
                  {/* Force V2 Renderer */}
                  <QPCV2PageRenderer
                    pageNumber={currentPage}
                    fontSize={settings.defaultFontSize as any}
                    isDarkMode={currentTheme.isDark}
                    className={showUi ? "!pb-28" : "!pb-0"}
                    mode={viewMode}
                    toggleState={toggleState}
                    memorizationRatings={memorizationRatings}
                    surahRatings={surahRatings}
                    onRateAyah={handleRateAyah}
                    onRateSurah={handleRateSurah}
                    verseBookmarks={verseBookmarks}
                    colorStopSigns={settings.colorStopSigns}
                    accentColor={currentTheme.colors.accent}
                    highlightedAyah={highlightedAyah}
                    isPrayerMode={settings.prayerMode}
                    language={settings.language}
                    mutashabihatData={mutashabihatData}
                    showMutashabihatIndicators={settings.showMutashabihatIndicators}
                    onOpenMutashabihat={(mutOrSurah, optAyah) => {
                      if (typeof mutOrSurah === 'object' && 'id' in mutOrSurah) {
                        setCurrentMutashabiha(mutOrSurah);
                        setIsMutashabihatModalOpen(true);
                      } else if (typeof mutOrSurah === 'number' && typeof optAyah === 'number') {
                        handleOpenMutashabihat(mutOrSurah, optAyah);
                      }
                    }}
                    onDeleteSimilarAyah={handleDeleteSimilarAyah}
                    onAddSimilarAyah={handleAddSimilarAyah}
                  />
                </div>
              )}
            </div>
          </div>
        </main>


        <div
          id="navigation-bar"
          className={clsx(
            "fixed bottom-0 left-0 right-0 lg:top-0 lg:right-0 lg:bottom-0 lg:left-auto lg:w-20 border-t lg:border-t-0 lg:border-l p-3 flex lg:flex-col items-center shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] lg:shadow-[-4px_0_6px_-1px_rgba(0,0,0,0.1)] z-[60] transition-all duration-500 ease-in-out",
            "lg:!right-0 lg:!left-auto",
            settings.bottomBar.showPageNavigation ? "justify-between lg:justify-center" : "justify-center",
            showUi
              ? "translate-y-0 opacity-100 lg:translate-x-0"
              : "translate-y-full opacity-0 lg:translate-y-0 lg:translate-x-full lg:opacity-0 pointer-events-none"
          )}
          style={{
            backgroundColor: currentTheme.colors.cardBg,
            borderColor: currentTheme.colors.border
          }}
          onTouchStart={handleUiInteraction}
          onClick={handleUiInteraction}
          onMouseEnter={handleMouseEnterUi}
          onMouseLeave={handleMouseLeaveUi}
        >
          {settings.bottomBar.showPageNavigation && (
            <button
              onClick={handlePrevPage}
              disabled={currentPage <= 1}
              className="p-2 rounded-full bg-amber-100 dark:bg-slate-800 text-amber-800 dark:text-amber-500 disabled:opacity-50 transition-colors lg:hidden"
            >
              <ChevronRight size={24} />
            </button>
          )}

          <div className="flex lg:flex-col gap-3 sm:gap-6 lg:gap-6 items-center">
            {settings.bottomBar.showIndex && (
              <button
                onClick={() => setIsIndexOpen(true)}
                className="flex flex-col items-center text-amber-800 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
              >
                <Menu size={20} />
                <span className="text-[10px]">{t.index}</span>
              </button>
            )}

            {settings.bottomBar.showSearch && (
              <button
                onClick={() => setIsSearchOpen(true)}
                className="flex flex-col items-center text-amber-800 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
              >
                <Search size={20} />
                <span className="text-[10px]">{t.search}</span>
              </button>
            )}

            {settings.bottomBar.showMemorization && (
              <button
                onClick={() => setIsMemorizationStatsOpen(true)}
                className="flex flex-col items-center text-amber-800 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
              >
                <BarChart3 size={20} />
                <span className="text-[10px]">{t.memorizationStats}</span>
              </button>
            )}

            {settings.bottomBar.showNotifications && (
              <button
                onClick={() => setIsNotificationOpen(true)}
                className="flex flex-col items-center text-amber-800 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
              >
                <Bell size={20} />
                <span className="text-[10px]">{t.notifications}</span>
              </button>
            )}

            {settings.bottomBar.showDarkMode && (
              <button
                onClick={toggleDarkMode}
                className="flex flex-col items-center text-amber-800 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
              >
                {currentTheme.isDark ? <Sun size={20} /> : <Moon size={20} />}
                <span className="text-[10px]">{currentTheme.isDark ? t.lightMode : t.darkMode}</span>
              </button>
            )}


            {settings.bottomBar.showBookmark && (
              <button
                onClick={togglePageBookmark}
                className={clsx(
                  "flex flex-col items-center transition-colors",
                  isPageBookmarked ? "text-amber-600 dark:text-amber-500" : "text-amber-800 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400"
                )}
              >
                <Bookmark size={20} fill={isPageBookmarked ? "currentColor" : "none"} />
                <span className="text-[10px]">{t.bookmark}</span>
              </button>
            )}

            {settings.bottomBar.showPrayerMode && (
              <button
                onClick={() => setSettings(prev => ({ ...prev, prayerMode: !prev.prayerMode }))}
                className={clsx(
                  "flex flex-col items-center transition-colors",
                  settings.prayerMode ? "text-amber-600 dark:text-amber-500" : "text-amber-800 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400"
                )}
              >
                <MousePointer2 size={20} fill={settings.prayerMode ? "currentColor" : "none"} />
                <span className="text-[10px]">{t.prayerMode}</span>
              </button>
            )}

            {settings.bottomBar.showFullscreen && !(/iPad|iPhone|iPod/.test(navigator.userAgent)) && (
              <button
                onClick={toggleFullScreen}
                className="flex flex-col items-center text-amber-800 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                title={isFullscreen ? t.exitFullscreen : t.fullscreen}
              >
                {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
                <span className="text-[10px]">{isFullscreen ? t.minimize : t.fullscreen}</span>
              </button>
            )}

            <BottomBarFeedbackButton />

            <button
              onClick={() => setIsSettingsOpen(true)}
              className="flex flex-col items-center text-amber-800 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 transition-colors relative"
            >
              {hasAppUpdate && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white dark:border-slate-800 animate-pulse z-10" />
              )}
              <SettingsIcon size={20} />
              <span className="text-[10px]">{t.settings}</span>

            </button>
          </div>

          {settings.bottomBar.showPageNavigation && (
            <button
              onClick={handleNextPage}
              disabled={currentPage >= TOTAL_PAGES}
              className="p-2 rounded-full bg-amber-100 dark:bg-slate-800 text-amber-800 dark:text-amber-500 disabled:opacity-50 transition-colors lg:hidden"
            >
              <ChevronLeft size={24} />
            </button>
          )}
        </div>

        {
          !isTouchDevice && (
            <>
              <button
                id="prev-page-btn"
                onClick={handlePrevPage}
                disabled={currentPage <= 1}
                className="hidden lg:flex fixed right-24 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-white/80 dark:bg-slate-800/80 text-amber-800 dark:text-amber-500 shadow-lg hover:bg-amber-100 dark:hover:bg-slate-700 transition-all disabled:opacity-0"
              >
                <ChevronRight size={32} />
              </button>

              <button
                onClick={handleNextPage}
                disabled={currentPage >= TOTAL_PAGES}
                className="hidden lg:flex fixed left-6 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-white/80 dark:bg-slate-800/80 text-amber-800 dark:text-amber-500 shadow-lg hover:bg-amber-100 dark:hover:bg-slate-700 transition-all disabled:opacity-0"
              >
                <ChevronLeft size={32} />
              </button>
            </>
          )
        }

        <SurahIndex
          isOpen={isIndexOpen}
          onClose={() => setIsIndexOpen(false)}
          onSelectPage={(p) => setCurrentPage(p)}
          pageBookmarks={pageBookmarks}
          verseBookmarks={verseBookmarks}
          history={history}
          onRemovePageBookmark={(page) => savePageBookmarks(pageBookmarks.filter(b => b.page !== page))}
          onRemoveVerseBookmark={(id) => saveVerseBookmarks(verseBookmarks.filter(b => b.id !== id))}
          t={t}
          language={settings.language}
          currentPage={currentPage}
        />

        <SearchModal
          isOpen={isSearchOpen}
          onClose={() => setIsSearchOpen(false)}
          onSelectPage={(page) => {
            setCurrentPage(page);
            setIsSearchOpen(false);
          }}
          onSelectResult={handleSearchResultSelect}
          totalPages={TOTAL_PAGES}
          language={settings.language}
          t={t}
        />

        <NotificationManager
          isOpen={isNotificationOpen}
          onClose={() => setIsNotificationOpen(false)}
          notifications={notifications}
          onSave={saveNotifications}
          onNavigate={(page, ayah, surah) => {
            setCurrentPage(page);
            if (ayah !== undefined && surah !== undefined) {
              setHighlightedAyah({ surah, ayah });
            } else {
              setHighlightedAyah(null);
            }
            setIsNotificationOpen(false);
          }}
          t={t}
          language={settings.language}
        />

        <MemorizationStats
          isOpen={isMemorizationStatsOpen}
          onClose={() => setIsMemorizationStatsOpen(false)}
          ratings={memorizationRatings}
          onNavigateToSurah={handleNavigateToSurah}
          onRateSurah={handleRateSurah}
          onClearAll={handleClearAllRatings}
          t={t}
        />

        <Settings
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          settings={settings}
          onSave={(newSettings) => {
            setSettings(newSettings);
            localStorage.setItem('quran_app_settings', JSON.stringify(newSettings));
          }}
          currentLanguage={settings.language as Language}
          onOpenIndex={() => { setIsSettingsOpen(false); setIsIndexOpen(true); }}
          onOpenSearch={() => { setIsSettingsOpen(false); setIsSearchOpen(true); }}
          onOpenMemorization={() => { setIsSettingsOpen(false); setIsMemorizationStatsOpen(true); }}
          onOpenNotifications={() => { setIsSettingsOpen(false); setIsNotificationOpen(true); }}
          onOpenMutashabihat={() => { setIsSettingsOpen(false); setIsMutashabihatIndexOpen(true); }}
          onOpenColorPicker={() => { setIsSettingsOpen(false); setIsColorPickerOpen(true); }}
          onTogglePageBookmark={togglePageBookmark}
          isPageBookmarked={isPageBookmarked}
          hasUpdate={hasAppUpdate}
          onUpdateApp={handleUpdateApp}
          memorizationRatings={memorizationRatings}
        />



        {
          ratingModalData && (
            <AyahOptionsModal
              isOpen={!!ratingModalData}
              onClose={() => setRatingModalData(null)}
              surahNumber={ratingModalData.surah}
              ayahNumber={ratingModalData.ayah}
              currentRating={getAyahRating(ratingModalData.surah, ratingModalData.ayah)}
              onRate={(r) => handleSaveRating(r)}
              onBookmark={() => {
                if (pageData) {
                  // Find the ayah in pageData.ayahs
                  // We need to cast 'a' or assert surah property exists because Types definition might be missing it for 'Ayah' interface
                  const foundAyah = pageData.ayahs.find((a: any) =>
                    a.numberInSurah === ratingModalData.ayah &&
                    (a.surah?.number === ratingModalData.surah)
                  );

                  if (foundAyah) {
                    toggleVerseBookmark(foundAyah);
                  } else {
                    // Fallback: Construct a minimal Ayah object if not found in current page data
                    const ayahObj: any = {
                      number: ratingModalData.ayah, // Global number unknown
                      text: "...",
                      numberInSurah: ratingModalData.ayah,
                      juz: pageData.ayahs[0]?.juz || 1,
                      page: currentPage,
                      surah: { number: ratingModalData.surah, name: "", englishName: "", englishNameTranslation: "", revelationType: "" }
                    };
                    toggleVerseBookmark(ayahObj);
                  }
                }
              }}
              isBookmarked={verseBookmarks.some(vb => vb.id === `${currentPage}-${ratingModalData.surah}-${ratingModalData.ayah}`)}
              language={settings.language}
              hasMutashabihat={!!findMutashabihatForAyah(ratingModalData.surah, ratingModalData.ayah, mutashabihatData)}
              onOpenMutashabihat={() => {
                handleOpenMutashabihat(ratingModalData.surah, ratingModalData.ayah);
              }}
            />
          )
        }

        {
          surahRatingModalData && (
            <SurahRatingModal
              isOpen={!!surahRatingModalData}
              onClose={() => setSurahRatingModalData(null)}
              surahNumber={surahRatingModalData}
              currentRating={getSurahRating(surahRatingModalData)}
              onRate={(rating) => handleSaveSurahRating(surahRatingModalData, rating)}
              onRateAyah={handleSaveAyahRatingDirect}
              ayahCount={SURAHS.find(s => s.number === surahRatingModalData)?.ayahCount || 1}
              language={settings.language}
            />
          )
        }

        <ColorPickerModal
          isOpen={isColorPickerOpen}
          onClose={() => setIsColorPickerOpen(false)}
          currentThemeId={settings.theme}
          onSelectTheme={(themeId) => {
            setSettings(prev => ({ ...prev, theme: themeId }));
          }}
          t={t}
        />

        <MutashabihatIndex
          isOpen={isMutashabihatIndexOpen}
          onClose={() => setIsMutashabihatIndexOpen(false)}
          mutashabihatData={mutashabihatData}
          isDarkMode={currentTheme.isDark}
          initialSurahId={mutashabihatIndexSurah}
          initialAyahId={mutashabihatIndexAyah}
          onNavigateToAyah={async (surah, ayah) => {
            const page = await getAyahPage(surah, ayah);
            setCurrentPage(page);
            setHighlightedAyah({ surah, ayah });
            setIsMutashabihatIndexOpen(false);
          }}
        />

        <MutashabihatModal
          isOpen={isMutashabihatModalOpen}
          onClose={() => setIsMutashabihatModalOpen(false)}
          mutashabiha={currentMutashabiha}
          mutashabihatData={mutashabihatData}
          language={settings.language}
          onNavigateToAyah={async (surah, ayah) => {
            const page = await getAyahPage(surah, ayah);
            setCurrentPage(page);
            setHighlightedAyah({ surah, ayah });
            setIsMutashabihatModalOpen(false);
          }}
          onOpenInIndex={(surah, ayah) => {
            setMutashabihatIndexSurah(surah);
            setMutashabihatIndexAyah(ayah);
            setIsMutashabihatModalOpen(false);
            setIsMutashabihatIndexOpen(true);
          }}
          onDeleteSimilarAyah={handleDeleteSimilarAyah}
          onAddSimilarAyah={handleAddSimilarAyah}
        />

        <MutashabihatSelectorModal
          isOpen={isSelectorOpen}
          onClose={() => setIsSelectorOpen(false)}
          onSelect={handleSelectSimilarAyah}
          language={settings.language}
          lockedSurah={selectorIsInsideSurah ? currentMutashabiha?.sourceAyah.surahNumber : undefined}
          excludedSurah={!selectorIsInsideSurah ? currentMutashabiha?.sourceAyah.surahNumber : undefined}
        />

        {toastMessage && (
          <Toast
            message={toastMessage}
            onClose={() => setToastMessage(null)}
            action={toastAction}
          />
        )}

        {/* Alarm Dismiss Overlay */}
        {activeAlarm && (
          <div className="fixed inset-0 z-[99999] bg-red-600/90 flex flex-col items-center justify-center text-white animate-in fade-in duration-300">
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-white/20 rounded-full animate-ping scale-150" />
              <div className="relative bg-white p-8 rounded-full shadow-2xl">
                <Bell size={64} className="text-red-600 animate-bounce" />
              </div>
            </div>

            <h2 className="text-3xl font-bold mb-2 text-center px-4">{activeAlarm.name}</h2>
            <p className="text-xl opacity-90 mb-12 text-center">{t.alarmMessage}</p>

            <button
              onClick={() => {
                if (alarmAudioRef.current) {
                  alarmAudioRef.current.pause();
                  alarmAudioRef.current.currentTime = 0;
                }
                setActiveAlarm(null);
              }}
              className="bg-white text-red-600 px-12 py-4 rounded-full text-2xl font-black shadow-xl hover:scale-105 active:scale-95 transition-transform"
            >
              {t.stopAlarm}
            </button>
          </div>
        )}

        {/* Prayer Mode Overlay Button (only when enabled and fullscreen is not blocking logic, though it can overlay fullscreen) */}
        {/* Prayer Mode Overlay Button - Hide when overlays are open */}
        {
          settings.prayerMode && !isIndexOpen && !isSettingsOpen && !isSearchOpen && !isMemorizationStatsOpen && !isNotificationOpen && (
            <PrayerModeButton
              t={t}
              onDismiss={() => {
                const newSettings = { ...settings, prayerMode: false };
                setSettings(newSettings);
                localStorage.setItem('quran_settings', JSON.stringify(newSettings));
              }}
            />
          )
        }

        {/* Fullscreen Exit Button - Hide when overlays are open */}
        {
          isFullscreen && !isIndexOpen && !isSettingsOpen && !isSearchOpen && !isMemorizationStatsOpen && !isNotificationOpen && (
            <FullscreenExitButton
              onDismiss={toggleFullScreen}
              currentPage={currentPage}
              t={t}
            />
          )
        }
        <TourWelcomeModal
          isOpen={showTourWelcome}
          onStart={handleStartTour}
          onClose={handleCloseTourWelcome}
        />

        <TourClickOverlay
          isOpen={showTourClickOverlay}
          onComplete={handleClickTutorialComplete}
        />
      </div >
    </FeedbackProvider>
  );
}