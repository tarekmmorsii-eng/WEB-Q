import React, { useState, useEffect, useCallback, useRef, useMemo, startTransition, lazy, Suspense } from 'react';
import { flushSync } from 'react-dom';
import { Capacitor } from '@capacitor/core';
import { Share } from '@capacitor/share';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Badge } from '@capawesome/capacitor-badge';
const isNative = Capacitor.isNativePlatform();
import { Loader2, ChevronRight, Menu, Sun, Moon, Bookmark, ChevronLeft, Type, Search, Bell, BarChart3, Settings as SettingsIcon, MousePointer2, Maximize, Minimize } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Virtual } from 'swiper/modules';
import 'swiper/css/virtual';
import type { Swiper as SwiperClass } from 'swiper';
import 'swiper/css';

import clsx from 'clsx';
import Header from './components/Header';
import QPCV2PageRenderer from './components/QPCV2PageRenderer';
import SurahIndex from './components/SurahIndex';
const SearchModal = lazy(() => import('./components/SearchModal'));
import NotificationManager from './components/NotificationManager';
const MemorizationStats = lazy(() => import('./components/MemorizationStats'));
import Toast from './components/Toast';
const Settings = lazy(() => import('./components/Settings'));
const AyahOptionsModal = lazy(() => import('./components/AyahOptionsModal'));
const SurahRatingModal = lazy(() => import('./components/SurahRatingModal'));
const MutashabihatModal = lazy(() => import('./components/MutashabihatModal'));
const MutashabihatIndex = lazy(() => import('./components/MutashabihatIndex'));
const MutashabihatSelectorModal = lazy(() => import('./components/MutashabihatSelectorModal'));
const HowToUseGuide = lazy(() => import('./components/HowToUseGuide'));
import SocialShareModal from './components/SocialShareModal';
import FloatingSideMenu from './components/FloatingSideMenu';
const AudioDownloadModal = lazy(() => import('./components/AudioDownloadModal'));
import { LocalNotifications } from '@capacitor/local-notifications';

import { getProcessedMutashabihat, findMutashabihatForAyah, findAllMutashabihatForAyah, getMergedMutashabihaForAyah } from './utils/mutashabihatProcessor';
import { Mutashabiha } from './types';
import TourWelcomeModal from './components/TourWelcomeModal';

const EMPTY_ARRAY: any[] = [];

import TourClickOverlay from './components/TourClickOverlay';
import PrayerModeButton from './components/PrayerModeButton';
import FullscreenExitButton from './components/FullscreenExitButton';
import SplashScreen from './components/SplashScreen';
import LanguageSelection from './components/LanguageSelection';
import { ViewMode, LocationData, VerseBookmark, Ayah, PageData, NotificationItem, MemorizationRating, SurahRating, AppSettings } from './types';
import { fetchPage, getAyahPage, getAyahPageSync } from './services/quranService';
import { getAyahText } from './utils/ayahTextHelper';
import { calculateMutashabihatSimilarity } from './utils/similarityCalculator';
import { TOTAL_PAGES } from './constants';
import { SURAHS } from './constants/surahData';
import ColorPickerModal from './components/ColorPickerModal';
import { translations, Language } from './i18n/translations';
import { THEMES, getThemeById } from './constants/themes';
import { startTour } from './utils/TourManager';
import { applyDynamicSystemBars } from './utils/systemBars';

import { useAyahAudio } from './hooks/useAyahAudio';
import { useWakeLock } from './hooks/useWakeLock';
import FloatingAudioPlayer from './components/FloatingAudioPlayer';
const TranslationManagerModal = lazy(() => import('./components/TranslationManagerModal'));
import AudioSettingsModal from './components/AudioSettingsModal';
import { getGlobalAyahNumber, getAyahFromGlobalNumber } from './utils/quranUtils';
import { setSwipeActive } from './utils/swipeStore';
import { useNotifications } from './hooks/useNotifications';
import InAppNotificationsModal from './components/InAppNotificationsModal';
import PushNotificationCenter from './components/PushNotificationCenter';
import { useNotificationStore } from './hooks/useNotificationStore';
import { usePushNotifications } from './hooks/usePushNotifications';

// ⭐ المنبهات الافتراضية - تظهر للمستخدم الجديد عند أول تشغيل
// name فارغ = يتم بناء العرض ديناميكياً من surahNumber + t.surahNames
// 🔄 إصدار المنبهات - عند رفعه يتم مسح القديمة وإعادة الحقن تلقائياً
const ALARMS_VERSION = 3;

const DEFAULT_ALARM_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'default-alarm-kahf',
    name: SURAHS.find(s => s.number === 18)?.name || 'الكهف',
    isEnabled: false,
    isAlarm: true,
    sound: '/islamic_song.mp3',
    type: 'weekly',
    days: [5],
    times: ['10:00'],
    category: 'surah',
    metadata: {
      surahNumber: 18,
      startPage: 293,
      endPage: 304,
      startAyah: 1,
      endAyah: 110,
    },
  },
  {
    id: 'default-alarm-mulk',
    name: SURAHS.find(s => s.number === 67)?.name || 'الملك',
    isEnabled: false,
    isAlarm: true,
    sound: '/islamic_song.mp3',
    type: 'daily',
    days: [0, 1, 2, 3, 4, 5, 6],
    times: ['23:00'],
    category: 'surah',
    metadata: {
      surahNumber: 67,
      startPage: 562,
      endPage: 563,
      startAyah: 1,
      endAyah: 30,
    },
  },
  {
    id: 'default-alarm-baqarah',
    name: SURAHS.find(s => s.number === 2)?.name || 'البقرة',
    isEnabled: false,
    isAlarm: true,
    sound: '/islamic_song.mp3',
    type: 'weekly',
    days: [1, 4],
    times: ['16:00'],
    category: 'surah',
    metadata: {
      surahNumber: 2,
      startPage: 2,
      endPage: 49,
      startAyah: 1,
      endAyah: 286,
    },
  },
];

// --- STABLE SWIPER CONFIGURATION ---
const SWIPER_MODULES: any[] = [Virtual];

// Full page list for the virtualized pager. Swiper's Virtual module mounts only
// a small window of slides around the active one, so swiping renders ONLY the
// single newly-entering page (not a 3-slide recenter). Stable module-level
// reference so it's never recreated.
const ALL_PAGES: number[] = Array.from({ length: TOTAL_PAGES }, (_, i) => i + 1);

// Run a (heavy, non-critical) task off the startup critical path. Used to keep
// large background JSON loads from blocking first paint / interactivity.
const runWhenIdle = (cb: () => void, fallbackDelay = 2500) => {
  if (typeof (window as any).requestIdleCallback === 'function') {
    (window as any).requestIdleCallback(cb, { timeout: 6000 });
  } else {
    setTimeout(cb, fallbackDelay);
  }
};

// Returns a referentially-stable callback that ALWAYS calls the latest version
// of `fn` (kept fresh in a ref every render). This is critical here: App is huge
// and re-renders on every page change. If the handlers passed into the page
// renderer (onRateAyah, onOpenMutashabihat, …) got a NEW identity each render,
// React.memo on QPCV2PageRenderer would bust and ALL ~5 mounted pages would
// fully re-render (hundreds of glyphs each) on every single flip — the freeze.
// Stable references mean only the entering/leaving page re-renders.
function useStableCallback<T extends (...args: any[]) => any>(fn: T): T {
  const ref = useRef(fn);
  ref.current = fn;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useCallback(((...args: any[]) => ref.current(...args)) as T, []);
}

// Integrations
import { FeedbackProvider, useFeedback } from './contexts/FeedbackContext';
import FeedbackModal from './components/FeedbackModal';
import BetaBadge from './components/BetaBadge';
import BottomBarFeedbackButton from './components/BottomBarFeedbackButton';

// Internal component to handle automatic audio closure when modals open
const ModalMonitor: React.FC<{
  modals: boolean[],
  onCloseAudio: () => void,
  onClosePrayerMode?: () => void
}> = ({ modals, onCloseAudio, onClosePrayerMode }) => {
  const { isOpen: isFeedbackOpen } = useFeedback();

  useEffect(() => {
    // If any modal local state is true OR the feedback context state is true
    const isAnyModalOpen = modals.some(m => !!m) || isFeedbackOpen;
    if (isAnyModalOpen) {
      onCloseAudio();
    }

    // ⭐ New: Specifically close prayer mode only when Feedback opens (as requested)
    if (isFeedbackOpen && onClosePrayerMode) {
      onClosePrayerMode();
    }
  }, [modals, isFeedbackOpen, onCloseAudio, onClosePrayerMode]);

  return null;
};

const DEFAULT_SETTINGS: AppSettings = {
  language: 'ar',
  theme: 'classic-mushaf',
  textBrightness: 100,
  backgroundBrightness: 0,
  soundEnabled: false,
  bottomBar: {
    showIndex: true,
    showSearch: false,
    showMemorization: false,
    showNotifications: false,
    showDarkMode: true,
    showFontSize: false,  // Ø­Ø°Ù  Ø²Ø± ØªØ¨Ø¯ÙŠÙ„ Ø§Ù„Ø®Ø· - Ø§Ù„ØªØ­Ø¬ÙŠÙ… ØªÙ„Ù‚Ø§Ø¦ÙŠ
    showBookmark: true,
    showPrayerMode: true,
    showFullscreen: true,
    showPageNavigation: false,
  },
  defaultFontSize: 'medium',  // ÙˆØ³Ø· Ù„Ù„Ù…ÙˆØ¨Ø§ÙŠÙ„ØŒ ØµØºÙŠØ± Ù„Ù„ÙƒÙ…Ø¨ÙŠÙˆØªØ±ØŒ ÙƒØ¨ÙŠØ± Ù„Ù„ØªØ§Ø¨Ù„Øª
  lineSpacing: 1.5,
  pageMargins: 20,
  colorStopSigns: true,
  prayerMode: false,
  showMutashabihatIndicators: true,
  enableWordLongPressAudio: true,
  showWordMeanings: true,
  wordMeaningsSource: 'new',
};

export default function App() {
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [isLandscapeMode, setIsLandscapeMode] = useState(false);
  const ayahAudio = useAyahAudio({
    onAudioError: (msg: string) => {
      setToastMessage(msg);
      setPlayingAyahId(null);
    }
  });

  // ⭐ Wake Lock: إضاءة الشاشة - ساعة واحدة عند الفتح + دائم أثناء التلاوة
  useWakeLock(ayahAudio.isPlayingSeq);

  useEffect(() => {
    const checkTouch = () => {
      // Check for coarse pointer (touch) or no hover capability
      const hasCoarsePointer = window.matchMedia('(pointer: coarse)').matches;
      const noHover = window.matchMedia('(hover: none)').matches;
      setIsTouchDevice(hasCoarsePointer || noHover);
    };

    checkTouch();

    const checkOrientation = () => {
      const landscape = window.matchMedia('(orientation: landscape)').matches;
      const isMobileOrTablet = window.innerWidth <= 1440;
      setIsLandscapeMode(landscape && isMobileOrTablet);
    };

    checkOrientation();
    window.addEventListener('resize', checkTouch);
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);

    // Disable Context Menu (Right Click) globally for Native feeling
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };
    window.addEventListener('contextmenu', handleContextMenu);

    return () => {
      window.removeEventListener('resize', checkTouch);
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
      window.removeEventListener('contextmenu', handleContextMenu);
    };
  }, []);

  // Handle Global Toast Events (from hooks)
  useEffect(() => {
    const handleToastEvent = (e: any) => {
      const { message } = e.detail;
      if (message) setToastMessage(message);
    };
    window.addEventListener('showToast', handleToastEvent);
    
    return () => {
      window.removeEventListener('showToast', handleToastEvent);
    };
  }, []);

  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem('quran_app_settings');
      let finalSettings = DEFAULT_SETTINGS;

      // Remove legacy 'theme' key if exists (was causing issues)
      localStorage.removeItem('theme');

      if (saved) {
        const parsed = { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
        // Merge bottomBar with defaults (in case new keys were added)
        parsed.bottomBar = { ...DEFAULT_SETTINGS.bottomBar, ...parsed.bottomBar };

        // Validate theme - if old theme doesn't exist, use default
        const themeExists = THEMES.some(t => t.id === parsed.theme);
        if (!themeExists) {
          parsed.theme = 'classic-mushaf';
        }

        // Migration: Enable prayer mode for existing users (one-time)
        if (!localStorage.getItem('prayer_mode_migrated')) {
          parsed.bottomBar.showPrayerMode = true;
          localStorage.setItem('prayer_mode_migrated', '1');
        }

        localStorage.setItem('quran_app_settings', JSON.stringify(parsed));
        finalSettings = parsed;
      }

      // Set CSS variables immediately to prevent flash
      const theme = getThemeById(finalSettings.theme);
      document.documentElement.style.setProperty('--bg-primary', theme.colors.background);
      document.documentElement.style.setProperty('--bg-secondary', theme.colors.secondary);
      document.documentElement.style.setProperty('--bg-card', theme.colors.cardBg);
      document.documentElement.style.setProperty('--text-primary', theme.colors.text);
      document.documentElement.style.setProperty('--border-primary', theme.colors.border);
      document.documentElement.style.setProperty('--accent-primary', theme.colors.primary);
      document.documentElement.style.setProperty('--accent-color', theme.colors.accent);
      
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
  const isRTL = t.dir === 'rtl';

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
    root.style.setProperty('--bg-secondary', theme.colors.secondary);
    root.style.setProperty('--bg-card', theme.colors.cardBg);
    root.style.setProperty('--text-primary', theme.colors.text);
    root.style.setProperty('--border-primary', theme.colors.border);
    root.style.setProperty('--accent-primary', theme.colors.primary);
    root.style.setProperty('--accent-color', theme.colors.accent);

    // Set direction and language metadata
    root.setAttribute('dir', t.dir);
    root.setAttribute('lang', settings.language);

    // Sync HTML/Body backgrounds to theme color to fix safe-area gap
    let hexColor = theme.colors.background.trim();
    if (hexColor.startsWith('#') && hexColor.length === 4) {
      hexColor = '#' + hexColor[1] + hexColor[1] + hexColor[2] + hexColor[2] + hexColor[3] + hexColor[3];
    }
    document.documentElement.style.backgroundColor = hexColor;
    document.body.style.backgroundColor = hexColor;

    // Update meta theme-color
    let metaThemeColor = document.querySelector("meta[name='theme-color']");
    if (metaThemeColor) {
      metaThemeColor.setAttribute("content", hexColor);
    }

    // Dynamically update Native System Bars with Camouflage logic (DISABLED for Immersive Mode)
    // if (isNative) {
    //   applyDynamicSystemBars(theme.colors.background);
    // }
  }, [settings, t]);

  // Force disable window scrolling programmatically (except in landscape for scrolling)
  useEffect(() => {
    const updateOverflow = () => {
      const isLandscape = window.matchMedia('(orientation: landscape)').matches;
      // Desktop detection matching the renderer logic
      const isDesktop = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

      if ((isLandscape && !isDesktop) || isDesktop) {
        // السماح بالتمرير للديسكتوب وللموبايل في الوضع الأفقي
        document.documentElement.style.overflow = 'auto';
        document.body.style.overflow = 'auto';
        document.documentElement.style.height = 'auto';
        document.body.style.height = 'auto';
        document.body.style.minHeight = '100dvh';
      } else {
        // منع التمرير في الوضع العمودي للموبايل والتابلت
        document.documentElement.style.overflow = 'hidden';
        document.body.style.overflow = 'hidden';
        document.documentElement.style.height = '100%';
        document.body.style.height = '100%';
      }
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
  const [showLanguageSelection, setShowLanguageSelection] = useState(false);

  useEffect(() => {
    localStorage.setItem('quran_last_page', currentPage.toString());

    // Fetch page data for bookmark functions
    fetchPage(currentPage).then(data => {
      setPageData(data);
    }).catch(err => {
      console.error('Error fetching page data for bookmarks:', err);
    });
  }, [currentPage]);

  const currentPageRef = useRef(currentPage);
  useEffect(() => {
    currentPageRef.current = currentPage;
  }, [currentPage]);

  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.SHOW_ALL);
  const [toggleState, setToggleState] = useState<number>(0);
  const [resetCounter, setResetCounter] = useState<number>(0);

  const [isIndexOpen, setIsIndexOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isMemorizationStatsOpen, setIsMemorizationStatsOpen] = useState(false);
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // ⭐ مركز إشعارات Push الخارجية
  const [isPushCenterOpen, setIsPushCenterOpen] = useState(false);
  const { unreadCount: pushUnreadCount, markAllAsRead: markAllPushAsRead, clearAll: clearAllPush } = useNotificationStore();

  // ⭐ مركز الإشعارات الذكي
  const {
    notifications: inAppNotifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll: clearAllNotifications,
    isModalOpen: isNotificationsModalOpen,
    setIsModalOpen: setIsNotificationsModalOpen,
    openModal: openInAppNotificationsModal,
    addNotification: addInAppNotification
  } = useNotifications();

  // ⭐ دمج العدادات: totalUnread = الإشعارات الداخلية + الإشعارات الخارجية
  const totalUnread = unreadCount + pushUnreadCount;

  // ⭐ فتح سجل الإشعارات المستلمة (النافذة البيضاء) مع تصفير كل العدادات
  // 🔔 يُستخدم من: زر الجرس في FloatingSideMenu
  const handleOpenNotifications = useCallback(async () => {
    // ✅ استخدام openModal() التي تصفّر العداد تلقائياً (markAllAsRead مدمج بداخلها)
    openInAppNotificationsModal();
    // تصفير الإشعارات الداخلية والخارجية بشكل صريح لتوحيد الحالة
    markAllAsRead();
    markAllPushAsRead();
    clearAllPush();
    // تصفير الشارة الخارجية (Badge) فوراً
    if (isNative) {
      try {
        const { isSupported } = await Badge.isSupported();
        if (isSupported) await Badge.set({ count: 0 });
      } catch (e) { }
    }
  }, [openInAppNotificationsModal, markAllAsRead, markAllPushAsRead, clearAllPush]);

  // ⭐ فتح نافذة إدارة وإضافة المنبهات (NotificationManager)
  // 🔔 يُستخدم من: زر الجرس في Settings
  const handleOpenAlarmManager = useCallback(async () => {
    setIsNotificationOpen(true);
    // ✅ تصفير العدادات أيضاً عند فتح نافذة الإعدادات لكي لا يظل الرقم معلقاً (Global Sync)
    markAllAsRead();
    markAllPushAsRead();
    clearAllPush();
    if (isNative) {
      try {
        const { isSupported } = await Badge.isSupported();
        if (isSupported) await Badge.set({ count: 0 });
      } catch (e) { }
    }
  }, [markAllAsRead, markAllPushAsRead, clearAllPush]);

  // ⭐ الإظهار التلقائي للإشعارات - تم نقله بعد تعريف حالات الجولة والترحيب

  // ⭐ M5: عرض FCM Token لمرة واحدة عند التفعيل الأول لتأكيد ربط الإشعارات الخارجية
  // useEffect(() => {
  //   if (!isNative) return;
  //   const FCM_SHOWN_KEY = 'fcm_token_alert_shown';
  //   if (localStorage.getItem(FCM_SHOWN_KEY)) return;
  // 
  //   // فحص التوكن المحفوظ مسبقاً
  //   const savedToken = localStorage.getItem('quran_push_fcm_token');
  //   if (savedToken) {
  //     localStorage.setItem(FCM_SHOWN_KEY, 'true');
  //     setTimeout(() => {
  //       alert(
  //         '✅ تم ربط الإشعارات الخارجية بنجاح!\n\n' +
  //         'FCM Token:\n' + savedToken.slice(0, 40) + '...\n\n' +
  //         '(هذه الرسالة تظهر مرة واحدة فقط للتحقق التقني)'
  //       );
  //     }, 3000);
  //     return;
  //   }
  // 
  //   // إذا لم يكن هناك توكن محفوظ، استمع للتوكن الجديد عبر localStorage change
  //   const tokenCheckInterval = setInterval(() => {
  //     const token = localStorage.getItem('quran_push_fcm_token');
  //     if (token && !localStorage.getItem(FCM_SHOWN_KEY)) {
  //       localStorage.setItem(FCM_SHOWN_KEY, 'true');
  //       clearInterval(tokenCheckInterval);
  //       alert(
  //         '✅ تم ربط الإشعارات الخارجية بنجاح!\n\n' +
  //         'FCM Token:\n' + token.slice(0, 40) + '...\n\n' +
  //         '(هذه الرسالة تظهر مرة واحدة فقط للتحقق التقني)'
  //       );
  //     }
  //   }, 2000);
  // 
  //   return () => clearInterval(tokenCheckInterval);
  // }, []);

  const [selectedReciterId, setSelectedReciterId] = useState<string>(() => {
    const stored = localStorage.getItem('selected_reciter_id');
    if (!stored) return 'husary';
    if (stored.startsWith('ar.')) {
        const keyMap: Record<string, string> = {
            'ar.alafasy': 'alafasy', 'ar.husary': 'husary', 'ar.husarymujawwad': 'husary_muallim',
            'ar.sudais': 'sudais', 'ar.abdulbasitmurattal': 'abdul_basit', 'ar.abdulbasitmujawwad': 'abdul_basit_mujawwad',
            'ar.minshawi': 'minshawy', 'ar.minshawimujawwad': 'minshawy_mujawwad', 'ar.shuraym': 'shuraym',
            'ar.hanirifai': 'rifai', 'ar.tablawi': 'tablawi', 'ar.ajamy': 'ajamy', 'ar.shatri': 'shatri',
            'ar.maher': 'maher', 'ar.dosari': 'yaser', 'ar.qatami': 'qatami', 'ar.fares': 'fares_abbad',
            'ar.ghamdi': 'ghamdi', 'ar.alijaber': 'ali_jaber'
        };
        return keyMap[stored] || 'husary';
    }
    return stored;
  });
  const [audioModeActive, setAudioModeActive] = useState(false);
  const [playingAyahId, setPlayingAyahId] = useState<string | null>(null);
  const [isAudioSettingsOpen, setIsAudioSettingsOpen] = useState(false);
  const [isAudioDownloadOpen, setIsAudioDownloadOpen] = useState(false);
  const [isTranslationManagerOpen, setIsTranslationManagerOpen] = useState(false);

  // Advanced Audio Settings
  const [audioSettings, setAudioSettings] = useState({
      startSurah: 1,
      startAyah: 1,
      endSurah: 1,
      endAyah: 7,
      groupRepetitions: 1,
      ayahRepetitions: 1,
      playbackRate: 1.0,
      useRangeOnly: false  // ← الوضع الافتراضي: تشغيل مستمر (لا يتوقف عند نهاية النطاق)
  });

  // Sync audio settings range with current page
  useEffect(() => {
    if (pageData && pageData.ayahs && pageData.ayahs.length > 0) {
      const firstAyah = pageData.ayahs[0];
      const lastAyah = pageData.ayahs[pageData.ayahs.length - 1];
      
      setAudioSettings(prev => ({
        ...prev,
        startSurah: firstAyah.surah?.number || 1,
        startAyah: firstAyah.numberInSurah || 1,
        endSurah: lastAyah.surah?.number || 1,
        endAyah: lastAyah.numberInSurah || 1,
      }));
    }
  }, [pageData]);


  const handleToggleSpeed = () => {
    const rates = [1.0, 1.25, 1.5, 0.5, 0.75];
    const currentIndex = rates.indexOf(audioSettings.playbackRate);
    const nextRate = rates[(currentIndex + 1) % rates.length];
    
    setAudioSettings(prev => ({ ...prev, playbackRate: nextRate }));
    ayahAudio.updateRuntimeSettings({ playbackRate: nextRate });
  };

  const handleToggleRepeat = () => {
    const counts = [1, 2, 3, -1];
    const currentIndex = counts.indexOf(audioSettings.ayahRepetitions);
    const nextCount = counts[(currentIndex + 1) % counts.length];
    
    setAudioSettings(prev => ({ ...prev, ayahRepetitions: nextCount }));
    ayahAudio.updateRuntimeSettings({ ayahRepetitions: nextCount });
  };

  // ⭐ إعادة ضبط إعدادات التلاوة إلى الوضع الافتراضي
  const resetAudioSettings = useCallback(() => {
      setAudioSettings(prev => ({
          ...prev,
          groupRepetitions: 1,
          ayahRepetitions: 1,
          playbackRate: 1.0,
          useRangeOnly: false
      }));
  }, []);

  // ⭐ Refs لتتبع تغيير المقرئ والسورة (للتفريق بين التغيير اليدوي والتلقائي)
  const prevReciterIdRef = useRef(selectedReciterId);
  const prevSurahRef = useRef<number | null>(null);
  const skipSurahResetRef = useRef(false);

  // ⭐ Trigger 1: إعادة ضبط عند تغيير المقرئ
  useEffect(() => {
      if (prevReciterIdRef.current !== selectedReciterId) {
          console.log('[AudioReset] تغيير المقرئ - إعادة ضبط الإعدادات');
          resetAudioSettings();
          // إيقاف التشغيل الحالي إذا كان نشطاً
          if (ayahAudio.isPlayingSeq) {
              ayahAudio.stopAudio();
              setPlayingAyahId(null);
          }
      }
      prevReciterIdRef.current = selectedReciterId;
  }, [selectedReciterId, resetAudioSettings]);

  // ⭐ Trigger 2: إعادة ضبط عند تغيير السورة يدوياً (ليس تلقائياً أثناء التشغيل)
  useEffect(() => {
      const currentSurah = pageData?.ayahs?.[0]?.surah?.number || null;

      if (prevSurahRef.current !== null && prevSurahRef.current !== currentSurah && currentSurah !== null) {
          if (skipSurahResetRef.current) {
              // تغيير تلقائي (برمجي) - تخطي إعادة الضبط
              skipSurahResetRef.current = false;
          } else if (!ayahAudio.isPlayingSeq) {
              // تغيير يدوي من المستخدم والمشغل غير نشط - إعادة ضبط
              console.log('[AudioReset] تغيير السورة يدوياً - إعادة ضبط الإعدادات');
              resetAudioSettings();
          }
      }

      if (currentSurah !== null) {
          prevSurahRef.current = currentSurah;
      }
  }, [pageData, resetAudioSettings]);



  const isAudioNavigatingRef = useRef(false);

  // Watch for page changes to stop audio if user swipes away
  useEffect(() => {
      if (pageData?.number) {
          if (ayahAudio.isPlayingSeq) {
              if (isAudioNavigatingRef.current) {
                  // This is a programmatic change, don't stop audio
                  isAudioNavigatingRef.current = false;
                  return;
              }
              ayahAudio.stopAudio();
              setPlayingAyahId(null);
          }
      }
  }, [pageData?.number]);

  // Pre-cache audio for current page

  useEffect(() => {
     localStorage.setItem('selected_reciter_id', selectedReciterId);
  }, [selectedReciterId]);

  const closeAudioPlayer = useCallback(() => {
    ayahAudio.stopAudio();
    setAudioModeActive(false);
    setPlayingAyahId(null);
  }, [ayahAudio]);

  const openAudioPlayer = useCallback(() => {
    setAudioModeActive(true);
    // Mutual exclusivity: reset view mode when opening audio bar
    setViewMode(ViewMode.SHOW_ALL);
    setToggleState(0);
  }, []);

  const handleAyahClickForAudio = async (surah: number, ayah: number) => {
      if (audioModeActive) return;
      const globalNum = getGlobalAyahNumber(surah, ayah);
      if (globalNum > 0) {
          closeAudioPlayer();
          setPlayingAyahId(`${surah}-${ayah}`);
          await ayahAudio.playAyahAudio(globalNum, selectedReciterId, audioSettings.playbackRate);
          setPlayingAyahId(null);
      }
  };

  const startPagePlayback = async (reciterId?: string, overrideSettings?: typeof audioSettings) => {
      const activeId = reciterId || selectedReciterId;
      const currentSettings = overrideSettings || audioSettings;
      
      if (reciterId) setSelectedReciterId(reciterId);
      
      openAudioPlayer();
      
      if (ayahAudio.isPlayingSeq && !overrideSettings) {
          // If already playing and no settings change, just toggle pause/resume elsewhere
          // or handle toggle logic in the caller. 
          // For startPagePlayback specifically, if session is active we usually don't want to double start.
          return;
      }


      let startGlobal = getGlobalAyahNumber(currentSettings.startSurah, currentSettings.startAyah);
      let endGlobal = 6236; // End of Quran

      // Handle navigation to start page if necessary
      const targetStartPage = getAyahPageSync(currentSettings.startSurah, currentSettings.startAyah);
      if (targetStartPage && targetStartPage !== currentPageRef.current) {
          isAudioNavigatingRef.current = true;
          skipSurahResetRef.current = true; // ⭐ تخطي إعادة الضبط عند التنقل البرمجي
          setCurrentPage(targetStartPage);
      }

      if (currentSettings.useRangeOnly) {
        endGlobal = getGlobalAyahNumber(currentSettings.endSurah, currentSettings.endAyah);
      } else {
          // If range is not forced, we still start from the selected start but go to the end
          // However, if the user hasn't changed the default start (1:1), 
          // we might want to default to the current page's first ayah for better UX
          const isDefaultStart = currentSettings.startSurah === 1 && currentSettings.startAyah === 1;
          if (isDefaultStart && pageData && pageData.ayahs && pageData.ayahs.length > 0) {
              const firstAyah = pageData.ayahs[0];
              startGlobal = getGlobalAyahNumber(firstAyah.surah?.number || 1, firstAyah.numberInSurah);
          }
      }
          
      if (startGlobal > 0 && endGlobal >= startGlobal) {
          const runSettings = {
              startGlobalAyah: startGlobal,
              endGlobalAyah: endGlobal,
              reciterId: activeId,
              groupRepetitions: currentSettings.groupRepetitions,
              ayahRepetitions: currentSettings.ayahRepetitions,
              playbackRate: currentSettings.playbackRate,
          };
          
          await ayahAudio.playSequence(runSettings, (globalNum) => {
              const dest = getAyahFromGlobalNumber(globalNum);
              if (dest) {
                  setPlayingAyahId(`${dest.surahNumber}-${dest.ayahNumber}`);

                  // Automatic page transition logic
                  const targetPage = getAyahPageSync(dest.surahNumber, dest.ayahNumber);
                  if (targetPage && targetPage !== currentPageRef.current) {
                      isAudioNavigatingRef.current = true;
                      skipSurahResetRef.current = true; // ⭐ تخطي إعادة الضبط عند التنقل البرمجي أثناء التشغيل
                      setCurrentPage(targetPage);
                  }

                  // Scroll into view logic strictly for UX
                  setTimeout(() => {
                      const el = document.querySelector(`span[data-word-surah="${dest.surahNumber}"][data-word-ayah="${dest.ayahNumber}"]`);
                      if (el) {
                          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }
                  }, 50);
              }
          });
          setPlayingAyahId(null);
          
          // ⭐ Trigger 3: إعادة ضبط عند انتهاء التشغيل المحدود (useRangeOnly)
          if (currentSettings.useRangeOnly) {
              console.log('[AudioReset] انتهى تشغيل النطاق المحدود - إعادة ضبط الإعدادات');
              resetAudioSettings();
          }
      }
  };

  const handlePlaySingleAyah = useCallback(async (surahNum: number, ayahNum: number) => {
    // Close existing session and start fresh for the single ayah
    ayahAudio.stopAudio();
    
    // Tiny delay to ensure stop state is registered before starting new one
    setTimeout(() => {
        startPagePlayback(selectedReciterId, {
            ...audioSettings,
            startSurah: surahNum,
            startAyah: ayahNum,
            endSurah: surahNum,
            endAyah: ayahNum,
            useRangeOnly: true
        });
    }, 10);
  }, [ayahAudio, startPagePlayback, selectedReciterId, audioSettings]);

  const [showUi, setShowUi] = useState(true);

  // Removed old hardcoded StatusBar style to allow dynamic camouflage

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastToggleTime = useRef<number>(0);
  const swiperRef = useRef<SwiperClass | null>(null);
  const [swiperReady, setSwiperReady] = useState(false);

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
  const [currentMutashabiha, setCurrentMutashabiha] = useState<Mutashabiha | null>(null);

  const [highlightSettingsHelp, setHighlightSettingsHelp] = useState(false);
  const [highlightOffline, setHighlightOffline] = useState(false);

  const handleOpenOfflineSettings = useCallback(() => {
    setIsSettingsOpen(true);
    setHighlightOffline(true);
    // Reset after a delay so it doesn't stay highlighted if closed/reopened
    setTimeout(() => setHighlightOffline(false), 3000);
  }, []);

  // Initialize unified mutashabihat data ONCE
  const mutashabihatData = useMemo(() => {
    const loadData = async () => {
      try {
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

        console.log(`✅ Mutashabihat Loaded: ${mergedMap.size} total associations.`);
        return Array.from(mergedMap.values());
      } catch (error) {
        console.error("Error loading mutashabihat data:", error);
        return [];
      }
    };
    // This is a bit tricky with useMemo and async.
    // For now, we'll keep the useEffect for loading and useState for mutashabihatData.
    // The diff implies a change to useMemo, but the original code had a useEffect.
    // I will revert to the original pattern for mutashabihatData and just add the new state.
    return []; // Placeholder, actual data loaded in useEffect
  }, []);

  const [actualMutashabihatData, setActualMutashabihatData] = useState<Mutashabiha[]>([]);
  const [isMutashabihatSelectionOpen, setIsMutashabihatSelectionOpen] = useState(false);
  const [isMutashabihatModalOpen, setIsMutashabihatModalOpen] = useState(false);
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const [activeMutashabihaId, setActiveMutashabihaId] = useState<string | null>(null);
  const [selectorIsInsideSurah, setSelectorIsInsideSurah] = useState<boolean>(false);
  const [isHowToUseOpen, setIsHowToUseOpen] = useState(false);

  // ⭐ تحميل بيانات المعاني (16MB) — مؤجل خارج مسار الإقلاع الحرج
  // The 16MB fetch + JSON.parse must NOT run during startup (it freezes the main
  // thread for seconds). Word meanings are only needed on long-press, so we load
  // them once the app is idle/interactive.
  useEffect(() => {
    runWhenIdle(() => {
      fetch('/data/new_ma3any_pos.json')
        .then(res => res.ok ? res.json() : {})
        .then(data => {
          (window as any).__ma3anyData = data;
          console.log('✅ Ma3any data loaded (deferred)');
        })
        .catch(err => console.warn('⚠️ Failed to load ma3any data:', err));
    });
  }, []);

  // Load mutashabihat data on mount with custom user data
  useEffect(() => {
    const loadData = async () => {
      try {
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

        setActualMutashabihatData(Array.from(mergedMap.values()));
        console.log(`✅ Mutashabihat Loaded: ${mergedMap.size} total associations.`);
      } catch (error) {
        console.error("Error loading mutashabihat data:", error);
      }
    };

    // Defer the 4MB mutashabihat parse off the startup critical path — it's not
    // needed for the first render and was blocking the main thread on launch.
    runWhenIdle(loadData);
  }, []);

  const handleOpenMutashabihatSelector = () => {
    setIsMutashabihatSelectionOpen(false);
    setIsSelectorOpen(true);
  };

  // Handle URL parameters for direct linking (e.g. ?guide=1)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('guide') === '1') {
      setIsHowToUseOpen(true);
      // Clean up URL without refreshing
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }

    // Direct Route handling for /dashboard
    if (window.location.pathname === '/dashboard') {
      setIsMemorizationStatsOpen(true);
    } else if (window.location.pathname === '/index') {
      setIsIndexOpen(true);
    }
  }, []);

  // Handle Native Notifications
  useEffect(() => {
    if (isNative) {
      // Clear badges on start
      LocalNotifications.removeAllDeliveredNotifications();
      (async () => {
        try {
          await LocalNotifications.setCount({ count: 0 });
        } catch (e) {
          console.warn('Badge count not supported on this platform', e);
        }
      })();

      // Listen for notification clicks
      const listener = LocalNotifications.addListener('localNotificationActionPerformed', (action) => {
        const { extra } = action.notification;
        if (extra && extra.page) {
          setCurrentPage(extra.page);
          if (extra.ayah !== undefined && extra.surah !== undefined) {
            setHighlightedAyah({ surah: extra.surah, ayah: extra.ayah });
          } else {
            setHighlightedAyah(null);
          }
          setIsNotificationOpen(false);
        }
      });

      // ⭐ Task 2: تفعيل العداد عند وصول الإشعار والتطبيق مفتوح
      const receiveListener = LocalNotifications.addListener('localNotificationReceived', (notification) => {
        // إضافة الإشعار للسجل ليزيد العداد unreadCount تلقائياً +1
        addInAppNotification({
          title: notification.title || t.notifications,
          message: notification.body || t.alarmMessage,
          type: 'info',
          isRead: false,
          icon: '🔔',
          surahNumber: notification.extra?.surahNumber || notification.extra?.surah,
          targetPage: notification.extra?.startPage || notification.extra?.page || notification.extra?.pageNumber,
          ayahNumber: notification.extra?.startAyah || notification.extra?.ayah,
          data: notification.extra // نمرر كامل البيانات لضمان المرونة
        });
        
        // تحديث البادج الخارجي
        Badge.isSupported().then(res => {
            if (res.isSupported) {
               Badge.get().then(current => {
                   Badge.set({ count: current.count + 1 });
               }).catch(() => {});
            }
        }).catch(() => {});
      });

      return () => {
        listener.remove();
        receiveListener.remove();
      };
    }
  }, [addInAppNotification, t]);

  const handleAddSimilarAyah = (mutashabihaId: string, isInsideSurah: boolean) => {
    setActiveMutashabihaId(mutashabihaId);
    setSelectorIsInsideSurah(isInsideSurah);
    setIsSelectorOpen(true);
  };

  // Use static imports for text helpers rather than dynamic since they form part of the bundle
  const handleCopyAyah = async (surahNumber: number, ayahNumber: number) => {
    try {
      const text = await getAyahText(surahNumber, ayahNumber);
      const surahName = SURAHS.find(s => s.number === surahNumber)?.name || '';
      await navigator.clipboard.writeText(`${text} ﴿${ayahNumber}﴾ سورة ${surahName}`);
      setToastMessage(t.ayahCopied);
    } catch (e) {
      console.error(e);
      setToastMessage(t.errorCopying);
    }
  };

  const handleSelectSimilarAyah = async (surah: number, ayah: number) => {
    if (!activeMutashabihaId) return;

    try {
      const targetText = await getAyahText(surah, ayah);

      let updatedMut: Mutashabiha | null = null;

      setActualMutashabihatData(prev => {
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
            const updatedMerged = getMergedMutashabihaForAyah(s, a, actualMutashabihatData);
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
    setActualMutashabihatData(prev => {
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
        const updated = getMergedMutashabihaForAyah(s, a, actualMutashabihatData);
        if (updated) {
          const currentJson = JSON.stringify(currentMutashabiha.similarAyahs);
          const updatedJson = JSON.stringify(updated.similarAyahs);
          if (currentJson !== updatedJson) {
            setCurrentMutashabiha(updated);
          }
        }
      } else {
        const updated = actualMutashabihatData.find(m => m.id === currentMutashabiha.id);
        if (updated) {
          const currentJson = JSON.stringify(currentMutashabiha.similarAyahs);
          const updatedJson = JSON.stringify(updated.similarAyahs);
          if (currentJson !== updatedJson) {
            setCurrentMutashabiha(updated);
          }
        }
      }
    }
  }, [actualMutashabihatData, isMutashabihatModalOpen]);

  const handleOpenMutashabihat = useCallback((surah: number, ayah: number) => {
    let merged = getMergedMutashabihaForAyah(surah, ayah, actualMutashabihatData);

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
  }, [actualMutashabihatData]);

  // 1. Manual Update Logic (Top Level)
  const [toastActions, setToastActions] = useState<{ label: string, onClick: () => void, variant?: 'primary' | 'secondary' }[] | undefined>(undefined);

  // 2. Fullscreen State
  const [isFullscreen, setIsFullscreen] = useState(false);

  // 3. Alarm State
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [activeAlarm, setActiveAlarm] = useState<NotificationItem | null>(null);
  const [snoozeDuration, setSnoozeDuration] = useState<number>(5);
  const alarmAudioRef = useRef<HTMLAudioElement | null>(null);

  // ⭐ إيقاف المنبه بالهز أو الضغط على أزرار الصوت (يعمل أثناء تشغيل الصوت فقط)
  // مراجع ثابتة للمستمعين كي تتطابق عملية الإضافة مع عملية الإزالة
  const shakeHandlerRef = useRef<(e: DeviceMotionEvent) => void>(() => {});
  const buttonHandlerRef = useRef<() => void>(() => {});

  // دالة موحّدة لإيقاف صوت المنبه: تُستدعى عند الهز أو زر الصوت أو الإيقاف اليدوي
  const stopAlarmAudio = useCallback(() => {
    if (alarmAudioRef.current) {
      alarmAudioRef.current.pause();
      alarmAudioRef.current.currentTime = 0;
    }
    setActiveAlarm(null);
    // إزالة المستمعين عند توقف الصوت ليبقيا متوازنين مع عملية الإضافة
    window.removeEventListener('devicemotion', shakeHandlerRef.current);
    window.removeEventListener('stopAlarmSound', buttonHandlerRef.current);
  }, []);

  // تعريف سلوك المستمعين مرة واحدة (معالج الهز يحسب قوة التسارع، ومعالج الزر يوقف فوراً)
  useEffect(() => {
    shakeHandlerRef.current = (e: DeviceMotionEvent) => {
      const acc = (e as any).accelerationIncludingGravity;
      if (acc) {
        const magnitude = Math.sqrt(acc.x * acc.x + acc.y * acc.y + acc.z * acc.z);
        if (magnitude > 15) {
          stopAlarmAudio();
        }
      }
    };
    buttonHandlerRef.current = () => {
      stopAlarmAudio();
    };
  }, [stopAlarmAudio]);

  // تفعيل المستمعين عند بدء تشغيل صوت المنبه
  const startAlarmListeners = useCallback(() => {
    // طلب إذن مستشعر الحركة على الأنظمة التي تتطلب ذلك لتفعيل كشف الهز
    const DMEvent = (window as any).DeviceMotionEvent;
    if (DMEvent && typeof DMEvent.requestPermission === 'function') {
      DMEvent.requestPermission().catch(() => {});
    }
    window.addEventListener('devicemotion', shakeHandlerRef.current as EventListener);
    window.addEventListener('stopAlarmSound', buttonHandlerRef.current as EventListener);
  }, []);

  // 4. Update State
  const [hasAppUpdate, setHasAppUpdate] = useState(false);

  // 5. Tour State
  const [showTourWelcome, setShowTourWelcome] = useState(false);
  const [showTourClickOverlay, setShowTourClickOverlay] = useState(false);
  const [isTourActive, setIsTourActive] = useState(false);

  // ⭐ Ref لتتبع unreadCount بشكل فوري (للاستخدام داخل Callbacks دون مشاكل Stale Closure)
  const unreadCountRef = useRef(unreadCount);
  useEffect(() => {
    unreadCountRef.current = unreadCount;
  }, [unreadCount]);

  // ⭐ [DISABLED] تم تعطيل الفتح التلقائي لنافذة الإشعارات لحل مشكلة تجمد التمرير (Ghost Overlay)
  // النافذة الآن لا تفتح إلا بالضغط اليدوي على زر الجرس
  // الشارة الحمراء (Badge) تظل ظاهرة لتنبيه المستخدم
  const showNotificationsIfNeeded = useCallback(() => {
    // 🚫 تم التعطيل - لن تفتح نافذة الإشعارات تلقائياً
    return;
  }, []);

  // 4. Alarm Auto-close Logic (59 seconds)
  useEffect(() => {
    if (activeAlarm) {
      const timer = setTimeout(() => {
        stopAlarmAudio();
      }, 59000); // 59 seconds as requested

      return () => clearTimeout(timer);
    }
  }, [activeAlarm, stopAlarmAudio]);

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

  // ⭐ إغلاق وضع الصلاة تلقائياً عند فتح أي نافذة أخرى بناءً على طلب المستخدم
  useEffect(() => {
    if (settings.prayerMode && (
      isIndexOpen || isSearchOpen || isSettingsOpen || isMemorizationStatsOpen || 
      isNotificationOpen || isColorPickerOpen || isMutashabihatIndexOpen || 
      isMutashabihatModalOpen || isSelectorOpen || isHowToUseOpen || 
      ratingModalData || surahRatingModalData || showTourWelcome || showTourClickOverlay
    )) {
      setSettings(prev => ({ ...prev, prayerMode: false }));
    }
  }, [
    isIndexOpen, isSearchOpen, isSettingsOpen, isMemorizationStatsOpen, 
    isNotificationOpen, isColorPickerOpen, isMutashabihatIndexOpen, 
    isMutashabihatModalOpen, isSelectorOpen, isHowToUseOpen, 
    ratingModalData, surahRatingModalData, showTourWelcome, showTourClickOverlay,
    settings.prayerMode
  ]);

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
    const langSelected = localStorage.getItem('quran_language_selected');
    
    // Only show tour welcome if user has already selected a language 
    // and hasn't seen the tour yet, AND the language selection screen isn't active
    if (!hasSeenTour && langSelected && !showLanguageSelection) {
      // Delay slightly to let app load
      const timer = setTimeout(() => setShowTourWelcome(true), 1000);
      return () => clearTimeout(timer);
    }
  }, [showLanguageSelection]);

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
    showNotificationsIfNeeded();
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

      startTour(t, 0, () => {
        setIsTourActive(false);
        // Resume normal auto-hide behavior after tour ends
        handleUiInteraction();
        showNotificationsIfNeeded();
      });
    }, 500);
  };

  const handleOpenShare = useCallback(async () => {
    if (isNative) {
      try {
        const title = t.shareAppTitle;
        const text = t.shareAppText;

        await Share.share({
          title,
          text,
          dialogTitle: 'مشاركة التطبيق'
        });
      } catch (error) {
        console.error('Error sharing:', error);
        // Fallback to clipboard if share fails
        try {
          await navigator.clipboard.writeText(`${t.shareAppTitle}\n${t.shareAppText}\n${window.location.origin}`);
          setToastMessage(t.shareCopied || 'تم نسخ نص المشاركة بنجاح');
        } catch (clipboardError) {
          console.error('Clipboard fallback failed:', clipboardError);
          setIsShareModalOpen(true);
        }
      }
    } else {
      setIsShareModalOpen(true);
    }
  }, [t, isNative]);

  const handleStartInteractiveTour = () => {
    // Close settings modal if it's open
    setIsSettingsOpen(false);

    // Go to Page 1 so the tour elements match Fatiha
    if (currentPage !== 1) {
      jumpToPage(1);
    }

    // Slightly longer delay to ensure the page has totally loaded and rendered
    setTimeout(() => {
      setIsTourActive(true);
      setShowUi(true);
      if (timerRef.current) clearTimeout(timerRef.current);

      startTour(t, 0, () => {
        setIsTourActive(false);
        handleUiInteraction();
        showNotificationsIfNeeded();
      });
    }, 1500);
  };

  const handleOpenHelpFromSideMenu = () => {
    setHighlightSettingsHelp(true);
    setIsSettingsOpen(true);
    // Reset highlight flag after a short delay so it can be re-triggered
    setTimeout(() => setHighlightSettingsHelp(false), 1000);
  };

  const handleSearchResultSelect = (page: number, surah: number, ayah: number) => {
    setCurrentPage(page);
    setHighlightedAyah({ surah, ayah });
    setIsSearchOpen(false);

    // Auto-clear highlight after 3 seconds for a clean look
    setTimeout(() => {
      setHighlightedAyah(null);
    }, 3000);
  };

  const mainRef = useRef<HTMLDivElement>(null);
  const flipAudioRef = useRef<HTMLAudioElement | null>(null);

  const handleUiInteraction = useCallback(() => {
    setShowUi(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    if (!isIndexOpen && !isSettingsOpen && !isTourActive) {
      timerRef.current = setTimeout(() => setShowUi(false), 3000);
    }
  }, [isIndexOpen, isSettingsOpen, isTourActive]);

  const handleHeaderInteraction = useCallback(() => {
    handleUiInteraction();
    // Mutual exclusivity: Close audio player when interacting with top menu
    if (audioModeActive) {
      closeAudioPlayer();
    }
  }, [handleUiInteraction, audioModeActive, closeAudioPlayer]);


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

  // --- Touch Gesture System ---
  const gestureRef = useRef({
    lastTapTime: 0,
    lastTapX: 0,
    lastTapY: 0,
    touchStartY: 0,
    touchStartX: 0,
    isTwoFingerTouch: false,
    gestureHandled: false,
  });

  useEffect(() => {
    const main = mainRef.current;
    if (!main) return;

    const onTouchStart = (e: TouchEvent) => {
      const g = gestureRef.current;

      // --- Two-finger tap: Toggle UI ---
      if (e.touches.length >= 2) {
        g.isTwoFingerTouch = true;
        g.gestureHandled = true;

        // Toggle UI menus
        setShowUi(prev => {
          if (prev) {
            if (timerRef.current) clearTimeout(timerRef.current);
            return false;
          } else {
            return true;
          }
        });
        // Trigger auto-hide timer when showing
        handleUiInteraction();
        return;
      }

      // Single finger: record start position for swipe detection
      g.isTwoFingerTouch = false;
      g.gestureHandled = false;
      g.touchStartY = e.touches[0].clientY;
      g.touchStartX = e.touches[0].clientX;
    };

    const onTouchEnd = (e: TouchEvent) => {
      const g = gestureRef.current;

      // If was a two-finger gesture, ignore
      if (g.isTwoFingerTouch) {
        if (e.touches.length === 0) {
          g.isTwoFingerTouch = false;
        }
        return;
      }

      if (g.gestureHandled) return;
      if (e.touches.length > 0) return; // Still fingers on screen

      const ct = e.changedTouches[0];
      if (!ct) return;

      const endX = ct.clientX;
      const endY = ct.clientY;
      const deltaY = g.touchStartY - endY; // positive = swipe up
      const deltaX = Math.abs(g.touchStartX - endX);
      const totalDist = Math.sqrt(Math.pow(endX - g.touchStartX, 2) + Math.pow(endY - g.touchStartY, 2));

      // --- Swipe Up: Open Settings ---
      const isLandscape = window.matchMedia('(orientation: landscape)').matches;
      const isMobileOrTablet = window.innerWidth <= 1440;

      if (deltaY > 100 && deltaY > deltaX * 1.5) {
        if (isLandscape && isMobileOrTablet) {
          // DO NOTHING - allow standard browser scroll
          return;
        }

        g.gestureHandled = true;
        setIsSettingsOpen(true);
        return;
      }

      // --- Double Tap: Next Page ---
      // Only if the tap didn't move much (not a swipe)
      if (totalDist < 20) {
        const now = Date.now();
        const timeDiff = now - g.lastTapTime;
        const tapDist = Math.sqrt(
          Math.pow(endX - g.lastTapX, 2) + Math.pow(endY - g.lastTapY, 2)
        );

        if (timeDiff < 350 && tapDist < 60) {
          // Double tap detected → next page
          g.lastTapTime = 0;
          g.gestureHandled = true;

          if (swiperRef.current && !swiperRef.current.destroyed) {
            swiperRef.current.slideNext(300);
          }
          return;
        }

        g.lastTapX = endX;
        g.lastTapY = endY;
        g.lastTapTime = now;
      }
    };

    main.addEventListener('touchstart', onTouchStart, { passive: true });
    main.addEventListener('touchend', onTouchEnd, { passive: true });

    return () => {
      main.removeEventListener('touchstart', onTouchStart);
      main.removeEventListener('touchend', onTouchEnd);
    };
  }, [handleUiInteraction]);

  const playPageFlipSound = () => {
    if (!settings.soundEnabled) return;
    try {
      // Reuse the same Audio object instead of creating new one each time
      if (!flipAudioRef.current) {
        flipAudioRef.current = new Audio('/paper-slide.wav');
        flipAudioRef.current.volume = 0.5;
      }
      // Reset and replay
      flipAudioRef.current.currentTime = 0;
      flipAudioRef.current.play().catch(() => console.log('Audio playback failed'));
    } catch (error) {
      console.log('Audio not supported');
    }
  };

  useEffect(() => {
    (window as any).playPageFlipSound = playPageFlipSound;
    return () => {
      delete (window as any).playPageFlipSound;
    };
  }, [settings.soundEnabled]);

  const isIndexOpenRef = useRef(isIndexOpen);
  useEffect(() => {
    isIndexOpenRef.current = isIndexOpen;
  }, [isIndexOpen]);



  useEffect(() => {
    // Silent Auto-Update System
    if ('serviceWorker' in navigator) {
      // Check for updates periodically (every 30 minutes)
      const checkForUpdates = () => {
        navigator.serviceWorker.getRegistration().then(reg => {
          if (reg) reg.update().catch(() => { });
        });
      };
      const updateInterval = setInterval(checkForUpdates, 30 * 60 * 1000);

      // Auto-reload when new service worker takes control
      let refreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing) {
          refreshing = true;
          // Mark that we just updated so we can show toast after reload
          sessionStorage.setItem('app_just_updated', '1');
          window.location.reload();
        }
      });

      // Show "App Updated" toast if we just auto-updated
      const justUpdated = sessionStorage.getItem('app_just_updated');
      if (justUpdated) {
        sessionStorage.removeItem('app_just_updated');
        setTimeout(() => {
          setToastMessage('✅ تم تحديث التطبيق');
        }, 1500);
      }

      return () => clearInterval(updateInterval);
    }
  }, []);

  useEffect(() => {
    // 2.5 Test Alarm Listener
    const handleTestAlarm = (e: any) => {
      const { name, sound, playSound } = e.detail;
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
      
      // ⭐ زيادة العداد فوراً بإضافة الإشعار للسجل الداخلي
      addInAppNotification({
        title: t.notifications || 'تنبيه',
        message: name || t.testAlarm || 'إشعار تجريبي',
        type: 'info',
        isRead: false,
        icon: '🔔'
      });
      
      // Vibrate device to ensure user notices the alarm
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([500, 200, 500, 200, 500]);
      }
      // تشغيل صوت منبه التجربة دائماً عند انطلاقه (أُزيلت بوابة playSound التي كتمته بالخطأ)
      if (alarmAudioRef.current) {
        alarmAudioRef.current.pause();
      }
      alarmAudioRef.current = new Audio(finalSound);
      alarmAudioRef.current.loop = true;
      alarmAudioRef.current.play().catch(p => {
        console.error("Alarm sound failed:", p);
        setToastMessage(t.alarmError);
      });
      // تفعيل كشف الهز والاستماع لإشارة أزرار الصوت أثناء تشغيل المنبه
      startAlarmListeners();
    };
    window.addEventListener('triggerTestAlarm', handleTestAlarm as EventListener);

    // 3. Notification Scheduling Logic
    const checkNotifications = () => {
      if (!notifications || notifications.length === 0) return;

      const now = new Date();
      const currentDay = now.getDay();
      
      // دعم التاريخ لخيار "مرة واحدة"
      const currentYear = now.getFullYear();
      const currentMonth = String(now.getMonth() + 1).padStart(2, '0');
      const currentDate = String(now.getDate()).padStart(2, '0');
      const currentDateStr = `${currentYear}-${currentMonth}-${currentDate}`;
      
      const hour = now.getHours().toString().padStart(2, '0');
      const minute = now.getMinutes().toString().padStart(2, '0');
      const currentTimeStr = `${hour}:${minute}`;

      notifications.forEach(n => {
        if (!n.isEnabled) return;

        const lastFiredKey = `notif_last_fired_${n.id}_${currentTimeStr}`;
        const lastFired = localStorage.getItem(lastFiredKey);

        const isTimeMatch = n.times.includes(currentTimeStr);
        const isDayMatch = n.days && n.days.includes(currentDay);
        
        // إذا لم يحدد المستخدم تاريخاً للتنبيه لمرة واحدة، نعتبره مطابقاً لليوم
        const isDateMatch = n.targetDate ? n.targetDate === currentDateStr : true;

        // يتحقق إذا كان التنبيه في موعده سواء كان "مرة واحدة" (بالتاريخ) أو دوري (بالأيام)
        const isTriggerDay = (n.type === 'once' && isDateMatch) || (n.type !== 'once' && isDayMatch);

        if (isTriggerDay && isTimeMatch && !lastFired) {
          
          // ⭐ تسجيل فوري لمنع تكرار الرنين في نفس الدقيقة (حتى لو تأخر السيرفر أو لم تُمنح الصلاحية)
          localStorage.setItem(lastFiredKey, 'true');

          // ⭐ إذا كان التنبيه لمرة واحدة، نقوم بتعطيله فوراً حتى لا يتكرر غداً
          if (n.type === 'once') {
             n.isEnabled = false;
             setNotifications(prev => {
                const updated = prev.map(notif => notif.id === n.id ? { ...notif, isEnabled: false } : notif);
                localStorage.setItem('quran_alarm_notifications', JSON.stringify(updated));
                return updated;
             });
          }
          
          // ⭐ رفع قيمة العداد يدوياً وفوراً بمقدار +1 في السجل (مزامنة فورية على الويب والأجهزة)
          addInAppNotification({
            title: t.notifications || 'تنبيه',
            message: n.name || t.alarmMessage,
            type: 'info',
            isRead: false,
            icon: '🔔',
            surahNumber: n.metadata?.surahNumber,
            targetPage: n.metadata?.startPage || n.metadata?.page || 1,
            ayahNumber: n.metadata?.startAyah,
            data: n.metadata // تمرير الكائن كاملاً أسوة بما يفعله NotificationManager
          });

          if (n.isAlarm) {
            setActiveAlarm(n);
            // Vibrate device to ensure user notices the alarm
            if (typeof navigator !== 'undefined' && navigator.vibrate) {
              navigator.vibrate([500, 200, 500, 200, 500]);
            }
            // تشغيل صوت المنبه المجدول دائماً عند انطلاقه (أُزيلت بوابة playSound التي كتمته بالخطأ)
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
            // تفعيل كشف الهز والاستماع لإشارة أزرار الصوت أثناء تشغيل المنبه
            startAlarmListeners();
          }

          if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
            if ('serviceWorker' in navigator) {
              navigator.serviceWorker.ready.then(reg => {
                reg.showNotification(
                  n.metadata?.surahNumber
                    ? t.surahNames[n.metadata.surahNumber - 1]
                    : ((t as any)[n.name] || n.name || t.notifications),
                  {
                  body: n.isAlarm ? t.notificationBodyAlarm : t.notificationBodyRegular,
                  icon: '/final_logo.png',
                  badge: '/final_logo.png',
                  tag: `quran-notif-${n.id}`,
                  // @ts-ignore
                  renotify: true,
                  // @ts-ignore
                  requireInteraction: n.isAlarm
                });
              });
            }
          }
        }
      });
    };

    // 4. Web Worker Background Timer (لضمان عمل المؤقت في وضع السكون)
    const workerCode = `
      let timer = null;
      self.onmessage = function(e) {
        if (e.data === 'start') {
          if (timer) clearInterval(timer);
          timer = setInterval(() => {
            self.postMessage('tick');
          }, 30000);
        } else if (e.data === 'stop') {
          if (timer) clearInterval(timer);
        }
      };
    `;
    const blob = new Blob([workerCode], { type: 'application/javascript' });
    const workerUrl = URL.createObjectURL(blob);
    const worker = new Worker(workerUrl);

    worker.onmessage = (e) => {
      if (e.data === 'tick') {
        checkNotifications();
      }
    };
    worker.postMessage('start');

    return () => {
      worker.postMessage('stop');
      worker.terminate();
      URL.revokeObjectURL(workerUrl);
      window.removeEventListener('triggerTestAlarm', handleTestAlarm as EventListener);
    };
  }, [notifications]);


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
      // 🔄 Hard Reset: مسح المنبهات القديمة وإعادة الحقن عند تغير الإصدار
      const savedAlarmsVersion = localStorage.getItem('quran_alarms_version');
      if (savedAlarmsVersion && parseInt(savedAlarmsVersion) < ALARMS_VERSION) {
        // إصدار قديم ← مسح كامل وإعادة حقن
        console.log(`[Hard Reset] ترقية المنبهات من إصدار ${savedAlarmsVersion} إلى ${ALARMS_VERSION}`);
        localStorage.removeItem('quran_notifications');
      }
      localStorage.setItem('quran_alarms_version', ALARMS_VERSION.toString());

      const freshSavedNotifications = localStorage.getItem('quran_notifications');
      if (freshSavedNotifications) {
        setNotifications(JSON.parse(freshSavedNotifications));
      } else {
        // ⭐ أول تشغيل أو بعد Hard Reset: حقن المنبهات الافتراضية
        setNotifications(DEFAULT_ALARM_NOTIFICATIONS);
        localStorage.setItem('quran_notifications', JSON.stringify(DEFAULT_ALARM_NOTIFICATIONS));
      }
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

  // Sync History and Scroll position - Simplified to be super fast
  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTop = 0;
    }

    // Only update history metadata without heavy fetching
    const historyItem: LocationData = {
      page: currentPage,
      surahName: `${t.page} ${currentPage}`, // Simplified name to avoid fetching
      juz: 1, // Placeholder, can be updated if metadata is available
      timestamp: Date.now()
    };

    setHistory(prev => {
      const filtered = prev.filter(h => h.page !== currentPage);
      return [historyItem, ...filtered].slice(0, 3);
    });

    const currentHistory = [historyItem, ...history.filter(h => h.page !== currentPage)].slice(0, 3);
    localStorage.setItem('quran_history', JSON.stringify(currentHistory));

    // Essential: stop the global loading state so the Swiper can be displayed
    setLoading(false);
  }, [currentPage, t.page]);

  const handleSetMode = (newMode: ViewMode, specificState?: number) => {
    // Throttle toggles to prevent layout thrashing (fix for "strange screen" on rapid clicks)
    const now = Date.now();
    if (now - lastToggleTime.current < 400 && specificState === undefined) return;
    lastToggleTime.current = now;

    handleUiInteraction();
    
    // Close audio player when any top menu button is clicked
    if (audioModeActive) {
      closeAudioPlayer();
    }

    // ⭐ New: Auto-activate Prayer Mode when choosing Hide All Ayahs
    if (newMode === ViewMode.HIDE_ALL_AYAHS) {
      setSettings(prev => ({ ...prev, prayerMode: true }));
    }

    const showToast = (msg: string) => setToastMessage(msg);

    if (newMode === viewMode) {
      if (specificState !== undefined) {
        if (toggleState === specificState) {
          // If already in this state, force a reset of revealed items
          setResetCounter(prev => prev + 1);
        }
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

  // Helper function to change page without scrolling.
  // Let Swiper drive: slideNext/Prev updates the active index, and
  // handleActiveIndexChange then syncs currentPage + sound. Avoids double state.
  const changePageWithoutScroll = (direction: 'next' | 'prev') => {
    const s = swiperRef.current;
    if (!s || s.destroyed) return;
    if (direction === 'next' && currentPage < TOTAL_PAGES) {
      s.slideNext(400);
    } else if (direction === 'prev' && currentPage > 1) {
      s.slidePrev(400);
    }
  };

  const jumpToPage = (pageNum: number) => {
    if (pageNum === currentPage) return;
    // Move Swiper directly; handleActiveIndexChange syncs currentPage. The
    // external-sync effect is a fallback if the swiper ref isn't ready yet.
    const s = swiperRef.current;
    if (s && !s.destroyed) {
      s.slideTo(pageNum - 1, 0, false);
    } else {
      setCurrentPage(pageNum);
    }
  };

  const handleNextPage = () => {
    if (currentPage < TOTAL_PAGES) {
      window.scrollTo(0, 0);
      changePageWithoutScroll('next');
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      window.scrollTo(0, 0);
      changePageWithoutScroll('prev');
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

  // Swiper handles touch navigation natively, no need for manual touch state.
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

  // Stable ref so slideChange callback never needs to recreate
  // (currentPageRef moved to top of component)

  // Independent page numbers for each slide — prevents cross-slide content flashing
  // Virtual pager: Swiper drives the active page. activeIndex (0-based) maps
  // directly to page (1-based). Swiping mounts only the newly-entering slide,
  // so there is no per-swipe 3-page recenter burst.
  const handleActiveIndexChange = useCallback((swiper: any) => {
    if (!swiper || swiper.destroyed) return;
    const newPage = swiper.activeIndex + 1;
    if (newPage === currentPageRef.current) return;

    // Update the ref synchronously so subsequent rapid flips see the latest
    // page immediately, but defer the (expensive, whole-App) state update into
    // a transition. This keeps the gesture responsive and lets React coalesce
    // back-to-back flips instead of re-rendering the whole tree for each one.
    currentPageRef.current = newPage;
    startTransition(() => {
      setCurrentPage(newPage);
    });

    // Reset scroll to top on page change (landscape/mobile)
    window.scrollTo(0, 0);
    if (mainRef.current) mainRef.current.scrollTop = 0;

    if (typeof (window as any).playPageFlipSound === 'function') {
      (window as any).playPageFlipSound();
    }
  }, []);

  // ── Flip-transition signals for the renderer's perf scheduler ──────────────
  // These do NOT touch React state on purpose: setSwipeActive mutates a tiny
  // external store that the page renderer subscribes to via a ref (no re-render
  // of App, no re-render of the renderer). The renderer uses the signal to keep
  // its reflow-forcing line-fit work OFF the animation, running it only once the
  // flip has fully ended.
  const handleSlideTransitionStart = useCallback(() => {
    setSwipeActive(true);
  }, []);

  const handleSlideTransitionEnd = useCallback((swiper: any) => {
    setSwipeActive(false);
    handleActiveIndexChange(swiper);
  }, [handleActiveIndexChange]);

  // Handle Swiper initialization
  useEffect(() => {
    setSwiperReady(true);
    setLoading(false);
  }, []);

  const handleOnSwiper = useCallback((swiper: SwiperClass) => {
    swiperRef.current = swiper;
  }, []);

  // Sync EXTERNAL page changes (index/search/bookmark/restore) into Swiper.
  // When currentPage is changed by something other than a swipe, move Swiper to
  // it. After a real swipe, activeIndex already equals currentPage-1, so this is
  // a no-op (no feedback loop).
  useEffect(() => {
    const s = swiperRef.current;
    if (s && !s.destroyed && s.activeIndex !== currentPage - 1) {
      s.slideTo(currentPage - 1, 0, false);
    }
  }, [currentPage]);

  // ── Orientation round-trip fix ──────────────────────────────────────────
  // Rotating portrait → landscape → portrait left the page "broken": the
  // Virtual pager keeps slide offsets sized for the OTHER orientation (with
  // slidesPerView=1 the Virtual module short-circuits its re-render because the
  // visible from/to range is unchanged, so stale widths/left offsets survive),
  // and a landscape page that grew taller than the viewport leaves a leftover
  // scroll offset. Both only bite on the way *back*, which is why the first
  // rotation looked fine but returning to portrait did not.
  //
  // Fix: after the rotation animation + WebView viewport resize FULLY settle,
  // hard-recompute Swiper + the Virtual module against the new viewport, re-snap
  // (no animation) to the active page, and reset scroll to the top. Debounced so
  // it runs once after rotation settles, never on transitional resize ticks.
  useEffect(() => {
    let settleTimer: ReturnType<typeof setTimeout> | null = null;

    const resettle = () => {
      const s = swiperRef.current;
      if (!s || s.destroyed) return;
      try {
        s.updateSize();
        s.updateSlides();
        // Force the Virtual module to re-render its slides with the new sizes
        // (plain update() no-ops when the from/to window is unchanged).
        if (s.virtual) s.virtual.update(true);
        s.update();
        // Re-snap to the active slide so its translate matches the new width.
        s.slideTo(s.activeIndex, 0, false);
      } catch { /* swiper mid-teardown — safe to ignore */ }
      // Clear any leftover scroll from the taller landscape layout.
      window.scrollTo(0, 0);
      if (mainRef.current) mainRef.current.scrollTop = 0;
    };

    const onOrientationSettle = () => {
      if (settleTimer) clearTimeout(settleTimer);
      settleTimer = setTimeout(() => {
        // Two rAFs after the debounce so we measure only once layout has
        // fully committed. 550ms clears the containers' 500ms width transition,
        // so Swiper re-snaps against the settled width, not a transitional one.
        requestAnimationFrame(() => requestAnimationFrame(resettle));
      }, 550);
    };

    window.addEventListener('resize', onOrientationSettle);
    window.addEventListener('orientationchange', onOrientationSettle);
    return () => {
      if (settleTimer) clearTimeout(settleTimer);
      window.removeEventListener('resize', onOrientationSettle);
      window.removeEventListener('orientationchange', onOrientationSettle);
    };
  }, []);

  // Single source of truth for a page slide's content (used by every virtual
  // slide). NOTE: isActive is a CONSTANT (not p === currentPage) on purpose.
  // When it tracked currentPage, BOTH the entering and leaving page re-rendered
  // their hundreds of glyphs on every flip — that rebuild was the ~290ms freeze
  // (line-fit measured 0ms / cached, so it was never the cause). All isActive
  // does is tag a few tour element IDs (each word/surah-name lives on exactly
  // one page, so the IDs are unique anyway) and gate font pre-warming — and
  // warming from ALL mounted slides is actually better. A constant keeps every
  // page's props identical across a flip, so React.memo skips the rebuild.
  //
  // All handler props below are wrapped in useStableCallback so their identity
  // NEVER changes across renders. Without this, every App re-render (which
  // happens on every flip via setCurrentPage) would hand fresh function
  // identities to the page renderer, busting React.memo and forcing ALL mounted
  // pages to re-render their hundreds of glyphs every flip — the root cause of
  // the flip freeze and the inability to flip quickly.
  const stableOnRateAyah = useStableCallback(handleRateAyah);
  const stableOnRateSurah = useStableCallback(handleRateSurah);
  const stableOnAyahClickForAudio = useStableCallback(handleAyahClickForAudio);
  const stableOnDeleteSimilarAyah = useStableCallback(handleDeleteSimilarAyah);
  const stableOnAddSimilarAyah = useStableCallback(handleAddSimilarAyah);
  const stableOnOpenMutashabihat = useStableCallback(
    (mutOrSurah: Mutashabiha | number, optAyah?: number) => {
      if (typeof mutOrSurah === 'object' && 'id' in mutOrSurah) {
        setCurrentMutashabiha(mutOrSurah);
        setIsMutashabihatModalOpen(true);
      } else if (typeof mutOrSurah === 'number' && typeof optAyah === 'number') {
        handleOpenMutashabihat(mutOrSurah, optAyah);
      }
    }
  );

  const renderPageSlide = (p: number) => (
    <QPCV2PageRenderer
      key={`page-${settings.language}-${settings.defaultFontSize}-${settings.enableWordLongPressAudio}`}
      pageNumber={p}
      isActive
      fontSize={settings.defaultFontSize as any}
      isDarkMode={currentTheme.isDark}
      className="!pb-0 w-full"
      mode={viewMode}
      toggleState={toggleState}
      memorizationRatings={memorizationRatings}
      surahRatings={surahRatings}
      onRateAyah={stableOnRateAyah}
      onRateSurah={stableOnRateSurah}
      verseBookmarks={verseBookmarks}
      colorStopSigns={settings.colorStopSigns}
      accentColor={currentTheme.colors.accent}
      highlightedAyah={highlightedAyah}
      isPrayerMode={settings.prayerMode}
      language={settings.language}
      mutashabihatData={actualMutashabihatData}
      showMutashabihatIndicators={settings.showMutashabihatIndicators}
      enableWordLongPressAudio={settings.enableWordLongPressAudio}
      showWordMeanings={settings.showWordMeanings}
      wordMeaningsSource={settings.wordMeaningsSource}
      onOpenMutashabihat={stableOnOpenMutashabihat}
      onDeleteSimilarAyah={stableOnDeleteSimilarAyah}
      onAddSimilarAyah={stableOnAddSimilarAyah}
      resetCounter={resetCounter}
      audioModeActive={audioModeActive}
      playingAyahId={playingAyahId}
      onAyahClickForAudio={stableOnAyahClickForAudio}
    />
  );

  return (
    <FeedbackProvider language={settings.language}>
      <ModalMonitor 
        modals={[
          isIndexOpen, isSearchOpen, isNotificationOpen, isMemorizationStatsOpen,
          isColorPickerOpen, isSettingsOpen, isMutashabihatIndexOpen,
          isMutashabihatModalOpen, isMutashabihatSelectionOpen, isSelectorOpen,
          isAudioSettingsOpen, isHowToUseOpen, showLanguageSelection, !!activeAlarm
        ]} 
        onCloseAudio={closeAudioPlayer} 
        onClosePrayerMode={() => setSettings(prev => ({ ...prev, prayerMode: false }))}
      />
      <div
        className={clsx(
          "w-full flex flex-col relative transition-colors duration-300",
          !isTouchDevice ? "min-h-[100vh] overflow-visible" : "h-[100dvh] overflow-hidden"
        )}
        style={{
          backgroundColor: currentTheme.colors.background,
          color: currentTheme.colors.text,
          paddingTop: 'env(safe-area-inset-top)',
          paddingBottom: 'env(safe-area-inset-bottom)'
        }}
      >
        <FeedbackModal />

        {showSplash && (
          <SplashScreen
            onFinish={() => {
              setShowSplash(false);
              const langSelected = localStorage.getItem('quran_language_selected');
              if (!langSelected) {
                setShowLanguageSelection(true);
              } else {
                const hasSeenTour = localStorage.getItem('hasSeenTour');
                if (hasSeenTour) {
                  showNotificationsIfNeeded();
                }
              }
            }}
          />
        )}

        {showLanguageSelection && (
          <LanguageSelection
            onSelect={(lang) => {
              setSettings(prev => ({ ...prev, language: lang }));
              localStorage.setItem('quran_language_selected', 'true');
              setShowLanguageSelection(false);
              
              // If it's the first time, we might also want to trigger the tour welcome
              // but the tour welcome already has its own logic based on 'hasSeenTour'
            }}
          />
        )}

        {/* Main Content hidden while splash is showing to prevent flash? Optional. 
          For now we overlay it. */}

        <Header
          currentMode={viewMode}
          setMode={handleSetMode}
          toggleState={toggleState}
          isVisible={showUi}
          onInteraction={handleHeaderInteraction}
          onMouseEnter={handleMouseEnterUi}
          onMouseLeave={handleMouseLeaveUi}
          t={t}
          isRTL={isRTL}
        />

        <main
          ref={mainRef}
          className={clsx(
            "flex-1 w-full overflow-auto relative transition-all duration-500 ease-in-out flex flex-col",
            "pt-0"
          )}
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
                <div className="min-h-full flex flex-col flex-1 transition-all duration-500 quran-swiper-container w-full h-full">
                  {swiperReady && (
                    <Swiper
                      key={`swiper-mushaf-${settings.language}`}
                      dir="rtl"
                      modules={SWIPER_MODULES}
                      onSwiper={handleOnSwiper}
                      onSlideChangeTransitionStart={handleSlideTransitionStart}
                      onSlideChangeTransitionEnd={handleSlideTransitionEnd}
                      virtual={{ enabled: true, addSlidesBefore: 2, addSlidesAfter: 2 }}
                      initialSlide={Math.max(0, currentPage - 1)}
                      speed={260}
                      className="w-full h-full flex-1"
                      resistance={true}
                      resistanceRatio={0.85}
                      touchAngle={35}
                      touchMoveStopPropagation={false}
                      simulateTouch={true}
                      style={{ touchAction: isLandscapeMode ? 'pan-y' : 'pan-x' }}
                    >
                      {ALL_PAGES.map((p) => (
                        <SwiperSlide key={p} virtualIndex={p - 1} className="w-full h-full flex items-start justify-center">
                          {renderPageSlide(p)}
                        </SwiperSlide>
                      ))}
                    </Swiper>
                  )}
                </div>
              )}
            </div>
          </div>
        </main>


        <div
          id="navigation-bar"
          className={clsx(
            "fixed bottom-0 left-0 right-0 z-[60] border-t p-3 flex items-center shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] transition-all duration-500 ease-in-out",
            // Desktop: sidebar on right for LTR, left for RTL
            isRTL
              ? "lg:top-0 lg:right-0 lg:bottom-0 lg:left-auto lg:w-20 lg:flex-col lg:border-t-0 lg:border-l lg:shadow-[-4px_0_6px_-1px_rgba(0,0,0,0.1)]"
              : "lg:top-0 lg:left-0 lg:bottom-0 lg:right-auto lg:w-20 lg:flex-col lg:border-t-0 lg:border-r lg:shadow-[4px_0_6px_-1px_rgba(0,0,0,0.1)]",
            settings.bottomBar.showPageNavigation ? "justify-between lg:justify-center" : "justify-center",
            showUi
              ? "translate-y-0 opacity-100 lg:translate-x-0"
              : isRTL
                ? "translate-y-full opacity-0 lg:translate-y-0 lg:translate-x-full lg:opacity-0 pointer-events-none"
                : "translate-y-full opacity-0 lg:translate-y-0 lg:-translate-x-full lg:opacity-0 pointer-events-none"
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

          <div className={clsx("flex lg:flex-col gap-3 sm:gap-6 lg:gap-6 items-center", isRTL && "flex-row-reverse lg:flex-col")}>
            <button
              id="tour-settings-btn"
              onClick={() => setIsSettingsOpen(true)}
              className="flex flex-col items-center text-amber-800 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 transition-colors relative"
            >
              {hasAppUpdate && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white dark:border-slate-800 animate-pulse z-10" />
              )}
              <SettingsIcon size={20} />
              <span className="text-[10px]">{t.settings}</span>
            </button>

            <BottomBarFeedbackButton t={t} />

            {settings.bottomBar.showFullscreen && !isNative && !(/iPad|iPhone|iPod/.test(navigator.userAgent)) && (
              <button
                onClick={toggleFullScreen}
                className="flex flex-col items-center text-amber-800 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                title={isFullscreen ? t.exitFullscreen : t.fullscreen}
              >
                {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
                <span className="text-[10px]">{isFullscreen ? t.minimize : t.fullscreen}</span>
              </button>
            )}

            {settings.bottomBar.showPrayerMode && (
              <div id="tour-prayer-mode-btn">
                <button
                  onClick={() => setSettings(prev => ({ ...prev, prayerMode: !prev.prayerMode }))}
                  className={clsx(
                    "flex flex-col items-center transition-all duration-300",
                    settings.prayerMode ? "text-amber-600 dark:text-amber-500 scale-110" : "text-amber-800 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400"
                  )}
                >
                  {/* Custom icon resembling the floating prayer mode circle */}
                  <div className="relative w-5 h-5 mb-0.5 flex items-center justify-center">
                    <div className={clsx(
                      "absolute inset-0 rounded-full border-2 transition-all duration-300",
                      settings.prayerMode ? "border-current scale-110" : "border-current"
                    )} />
                    <div className={clsx(
                      "w-2 h-2 rounded-full transition-all duration-300",
                      settings.prayerMode 
                        ? "bg-current shadow-[0_0_8px_rgba(245,158,11,0.6)]" 
                        : "bg-current"
                    )} />
                  </div>
                  <span className="text-[10px] whitespace-nowrap">{t.prayerMode}</span>
                </button>
              </div>
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

            {settings.bottomBar.showDarkMode && (
              <button
                onClick={toggleDarkMode}
                className="flex flex-col items-center text-amber-800 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
              >
                {currentTheme.isDark ? <Sun size={20} /> : <Moon size={20} />}
                <span className="text-[10px]">{currentTheme.isDark ? t.lightMode : t.darkMode}</span>
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

            {settings.bottomBar.showMemorization && (
              <button
                onClick={() => setIsMemorizationStatsOpen(true)}
                className="flex flex-col items-center text-amber-800 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
              >
                <BarChart3 size={20} />
                <span className="text-[10px]">{t.memorizationStats}</span>
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

            {settings.bottomBar.showIndex && (
              <button
                onClick={() => setIsIndexOpen(true)}
                className="flex flex-col items-center text-amber-800 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
              >
                <Menu size={20} />
                <span className="text-[10px]">{t.index}</span>
              </button>
            )}
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
                id="next-page-btn"
                onClick={handleNextPage}
                disabled={currentPage >= TOTAL_PAGES}
                className={clsx(
                  "hidden lg:flex fixed top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-white/80 dark:bg-slate-800/80 text-amber-800 dark:text-amber-500 shadow-lg hover:bg-amber-100 dark:hover:bg-slate-700 transition-all disabled:opacity-0",
                  "left-6" // Next page goes left in Arabic
                )}
              >
                <ChevronLeft size={32} />
              </button>

              <button
                id="prev-page-btn"
                onClick={handlePrevPage}
                disabled={currentPage <= 1}
                className={clsx(
                  "hidden lg:flex fixed top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-white/80 dark:bg-slate-800/80 text-amber-800 dark:text-amber-500 shadow-lg hover:bg-amber-100 dark:hover:bg-slate-700 transition-all disabled:opacity-0",
                  "right-24" // Previous page goes right in Arabic
                )}
              >
                <ChevronRight size={32} />
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

        {isSearchOpen && (
          <Suspense fallback={null}>
            <SearchModal
              isOpen
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
          </Suspense>
        )}

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

        {isMemorizationStatsOpen && (
          <Suspense fallback={null}>
            <MemorizationStats
              isOpen
              onClose={() => setIsMemorizationStatsOpen(false)}
              ratings={memorizationRatings}
              onNavigateToSurah={handleNavigateToSurah}
              onRateSurah={handleRateSurah}
              onClearAll={handleClearAllRatings}
              t={t}
            />
          </Suspense>
        )}

        {isSettingsOpen && (
          <Suspense fallback={null}>
            <Settings
              isOpen
              onClose={() => setIsSettingsOpen(false)}
              settings={settings}
              onSave={setSettings}
              currentLanguage={settings.language as Language}
              onOpenIndex={() => setIsIndexOpen(true)}
              onOpenSearch={() => setIsSearchOpen(true)}
              onOpenMemorization={() => setIsMemorizationStatsOpen(true)}
              onOpenNotifications={handleOpenAlarmManager}
              notificationUnreadCount={totalUnread}
              onOpenMutashabihat={() => {
                const currentS = pageData?.ayahs?.[0]?.surah?.number || 1;
                setMutashabihatIndexSurah(currentS);
                setMutashabihatIndexAyah(undefined);
                setIsMutashabihatIndexOpen(true);
              }}
              onOpenColorPicker={() => setIsColorPickerOpen(true)}
              onOpenReciterSelection={openAudioPlayer}
              onTogglePageBookmark={togglePageBookmark}
              isPageBookmarked={isPageBookmarked}
              hasUpdate={hasAppUpdate}
              onUpdateApp={handleUpdateApp}
              memorizationRatings={memorizationRatings}
              onStartInteractiveTour={handleStartInteractiveTour}
              highlightHelp={highlightSettingsHelp}
              highlightOffline={highlightOffline}
              onOpenShare={handleOpenShare}
              onOpenAudioDownload={() => setIsAudioDownloadOpen(true)}
              onOpenTranslationManager={() => setIsTranslationManagerOpen(true)}
            />
          </Suspense>
        )}

        <SocialShareModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          currentLanguage={settings.language as Language}
        />

        {isTranslationManagerOpen && (
          <Suspense fallback={null}>
            <TranslationManagerModal
              isOpen
              onClose={() => setIsTranslationManagerOpen(false)}
              currentLanguage={settings.language}
            />
          </Suspense>
        )}

        {isAudioDownloadOpen && (
          <Suspense fallback={null}>
            <AudioDownloadModal
              isOpen
              onClose={() => setIsAudioDownloadOpen(false)}
              language={settings.language}
            />
          </Suspense>
        )}

        <FloatingSideMenu
          currentLanguage={settings.language as Language}
          currentTheme={currentTheme}
          onOpenHelp={handleOpenHelpFromSideMenu}
          onOpenOffline={handleOpenOfflineSettings}
          onOpenReciterSelection={openAudioPlayer}
          isVisible={showUi}
          isEnabled={settings.bottomBar.showSideMenu !== false}
          isRTL={isRTL}
          onOpenShare={handleOpenShare}
          onOpenAudioDownload={() => setIsAudioDownloadOpen(true)}
          onOpenNotifications={handleOpenNotifications}
          onOpenSearch={() => setIsSearchOpen(true)}
          notificationUnreadCount={totalUnread}
        />

        <InAppNotificationsModal
          isOpen={isNotificationsModalOpen}
          onClose={() => setIsNotificationsModalOpen(false)}
          notifications={inAppNotifications}
          onMarkAsRead={markAsRead}
          onMarkAllAsRead={markAllAsRead}
          onDeleteNotification={deleteNotification}
          onClearAll={clearAllNotifications}
          unreadCount={unreadCount}
          language={settings.language}
          onOpenAlarmSettings={() => {
            setIsNotificationsModalOpen(false);
            setTimeout(() => setIsNotificationOpen(true), 150);
          }}
          onNavigateToPage={(page, ayah, surah) => {
            let finalPage = page;
            // إذا لم يتم تمرير صفحة ولكن تم تمرير رقم السورة، نجلب صفحة بداية السورة
            if (!finalPage && surah !== undefined) {
              const surahInfo = SURAHS.find(s => s.number === surah);
              if (surahInfo) finalPage = surahInfo.startPage;
            }
            // كخيار أخير إذا لم يتم العثور على أي بيانات ننتقل للصفحة 1
            if (!finalPage) finalPage = 1;

            setCurrentPage(finalPage);
            if (ayah !== undefined && surah !== undefined) {
              setHighlightedAyah({ surah, ayah });
            }
          }}
          t={t}
        />

        {/* ⭐ مركز إشعارات Push الخارجية */}
        <PushNotificationCenter
          isOpen={isPushCenterOpen}
          onClose={() => setIsPushCenterOpen(false)}
          currentLanguage={settings.language as Language}
          onNavigateToPage={(page, ayah, surah) => {
            let finalPage = page;
            if (!finalPage && surah !== undefined) {
              const surahInfo = SURAHS.find(s => s.number === surah);
              if (surahInfo) finalPage = surahInfo.startPage;
            }
            if (!finalPage) finalPage = 1;

            setCurrentPage(finalPage);
            if (ayah !== undefined && surah !== undefined) {
              setHighlightedAyah({ surah, ayah });
            }
          }}
        />

        {
          ratingModalData && (
            <Suspense fallback={null}>
            <AyahOptionsModal
              isOpen={!!ratingModalData}
              onClose={() => setRatingModalData(null)}
              surahNumber={ratingModalData.surah}
              ayahNumber={ratingModalData.ayah}
              currentRating={getAyahRating(ratingModalData.surah, ratingModalData.ayah)}
              onPlay={() => handlePlaySingleAyah(ratingModalData.surah, ratingModalData.ayah)}
              onRate={(r) => handleSaveRating(r)}
              onBookmark={() => {
                if (pageData) {
                  const foundAyah = pageData.ayahs.find((a: any) =>
                    a.numberInSurah === ratingModalData.ayah &&
                    (a.surah?.number === ratingModalData.surah)
                  );

                  if (foundAyah) {
                    toggleVerseBookmark(foundAyah);
                  } else {
                    const ayahObj: any = {
                      number: ratingModalData.ayah,
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
              hasMutashabihat={!!findMutashabihatForAyah(ratingModalData.surah, ratingModalData.ayah, actualMutashabihatData)}
              onOpenMutashabihat={() => {
                handleOpenMutashabihat(ratingModalData.surah, ratingModalData.ayah);
              }}
              tafsir={((window as any).__ma3anyData || {})[`${ratingModalData.surah}:${ratingModalData.ayah}`]?._tafsir}
              onOpenTranslationManager={() => setIsTranslationManagerOpen(true)}
            />
            </Suspense>
          )
        }

        {
          surahRatingModalData && (
            <Suspense fallback={null}>
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
            </Suspense>
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

        {isMutashabihatIndexOpen && (
          <Suspense fallback={null}>
            <MutashabihatIndex
              isOpen
              onClose={() => setIsMutashabihatIndexOpen(false)}
              mutashabihatData={actualMutashabihatData}
              isDarkMode={currentTheme.isDark}
              initialSurahId={mutashabihatIndexSurah}
              initialAyahId={mutashabihatIndexAyah}
              onNavigateToAyah={async (surah, ayah) => {
                const page = await getAyahPage(surah, ayah);
                setCurrentPage(page);
                setHighlightedAyah({ surah, ayah });
                setIsMutashabihatIndexOpen(false);
              }}
              t={t}
              language={settings.language}
            />
          </Suspense>
        )}

        {isMutashabihatModalOpen && (
          <Suspense fallback={null}>
            <MutashabihatModal
              isOpen
              onClose={() => setIsMutashabihatModalOpen(false)}
              mutashabiha={currentMutashabiha}
              mutashabihatData={actualMutashabihatData}
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
          </Suspense>
        )}

        {isSelectorOpen && (
          <Suspense fallback={null}>
            <MutashabihatSelectorModal
              isOpen
              onClose={() => setIsSelectorOpen(false)}
              onSelect={handleSelectSimilarAyah}
              language={settings.language}
              lockedSurah={selectorIsInsideSurah ? currentMutashabiha?.sourceAyah.surahNumber : undefined}
              excludedSurah={!selectorIsInsideSurah ? currentMutashabiha?.sourceAyah.surahNumber : undefined}
            />
          </Suspense>
        )}

        {
          toastMessage && (
            <Toast
              message={toastMessage}
              onClose={() => {
                setToastMessage(null);
                setToastActions(undefined);
              }}
              actions={toastActions}
            />
          )
        }

        <FloatingAudioPlayer
            isOpen={audioModeActive}
            isUiVisible={showUi}
            onClose={() => {
                setAudioModeActive(false);
                ayahAudio.stopAudio();
                setPlayingAyahId(null);
            }}
            currentLanguage={settings.language as Language}
            selectedReciterId={selectedReciterId}
            onSelectReciter={setSelectedReciterId}
            isPlaying={ayahAudio.isPlayingSeq || playingAyahId !== null}
            isPaused={ayahAudio.isPaused}
            currentContext={(() => {
                const activeAyahNum = ayahAudio.currentGlobalAyah;
                if (activeAyahNum) {
                    const dest = getAyahFromGlobalNumber(activeAyahNum);
                    if (dest) {
                        const surah = SURAHS.find(s => s.number === dest.surahNumber);
                        const sName = settings.language === 'ar' ? surah?.name : t.surahNames[dest.surahNumber - 1];
                        return `${sName} - ${t.verse} ${dest.ayahNumber}`;
                    }
                }

                if (pageData && pageData.ayahs && pageData.ayahs.length > 0) {
                    const firstAyah = pageData.ayahs[0];
                    const sName = settings.language === 'ar' ? firstAyah.surah?.name : t.surahNames[(firstAyah.surah?.number || 1) - 1];
                    return `${sName} - ${t.verse} ${firstAyah.numberInSurah}`;
                }
                return "";
            })()}
            onTogglePlay={() => {
                if (ayahAudio.isPlayingSeq) {
                    if (ayahAudio.isPaused) {
                        ayahAudio.resumeAudio();
                    } else {
                        ayahAudio.pauseAudio();
                    }
                } else {
                    // ⭐ زر التشغيل الرئيسي: تشغيل مستمر دائماً (يتجاهل تشغيل النطاق المحدود)
                    setAudioSettings(prev => ({ ...prev, useRangeOnly: false }));
                    startPagePlayback(selectedReciterId, {
                        ...audioSettings,
                        useRangeOnly: false
                    });
                }
            }}
            onStop={() => {
                ayahAudio.stopAudio();
                setPlayingAyahId(null);
            }}
            onNext={async () => {
                const current = ayahAudio.currentGlobalAyah;
                console.log("Skipping Next from:", current);
                if (current) {
                    const next = Math.min(6236, current + 1);
                    ayahAudio.stopAudio();
                    const dest = getAyahFromGlobalNumber(next);
                    if (dest) {
                        // Small delay to ensure previous loop broke
                        setTimeout(() => {
                            startPagePlayback(undefined, {
                                ...audioSettings,
                                startSurah: dest.surahNumber,
                                startAyah: dest.ayahNumber,
                                useRangeOnly: false  // ⭐ استمرار التشغيل بعد التخطي
                            });
                        }, 100);
                    }
                }
            }}
            onPrevious={async () => {
                const current = ayahAudio.currentGlobalAyah;
                console.log("Skipping Prev from:", current);
                if (current) {
                    const prev = Math.max(1, current - 1);
                    ayahAudio.stopAudio();
                    const dest = getAyahFromGlobalNumber(prev);
                    if (dest) {
                        // Small delay to ensure previous loop broke
                        setTimeout(() => {
                            startPagePlayback(undefined, {
                                ...audioSettings,
                                startSurah: dest.surahNumber,
                                startAyah: dest.ayahNumber,
                                useRangeOnly: false  // ⭐ استمرار التشغيل بعد التخطي
                            });
                        }, 100);
                    }
                }
            }}
            playbackRate={audioSettings.playbackRate}
            groupRepetitions={audioSettings.groupRepetitions}
            ayahRepetitions={audioSettings.ayahRepetitions}
            onToggleRepeat={handleToggleRepeat}
            onToggleSpeed={handleToggleSpeed}
            onOpenSettings={() => setIsAudioSettingsOpen(true)}
        />

        <AudioSettingsModal
            isOpen={isAudioSettingsOpen}
            onClose={() => setIsAudioSettingsOpen(false)}
            currentLanguage={settings.language as Language}
            settings={audioSettings}
            onApply={(newSettings) => {
                setAudioSettings(newSettings);
                setIsAudioSettingsOpen(false);
                // Restart playback if was playing or if just applied
                ayahAudio.stopAudio();
                startPagePlayback(selectedReciterId, newSettings);
            }}
        />

        {/* Alarm Dismiss Overlay - Guaranteed visible on all devices */}
        {
          activeAlarm && (
            <div
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 999999,
                backgroundColor: 'rgba(220, 38, 38, 0.95)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                opacity: 1,
                visibility: 'visible',
              }}
            >
              {/* Pulsing bell icon */}
              <div style={{ position: 'relative', marginBottom: '2rem' }}>
                <div style={{
                  position: 'absolute', inset: 0,
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  borderRadius: '50%',
                  animation: 'alarmPulse 1s ease-in-out infinite',
                }} />
                <div style={{
                  position: 'relative',
                  backgroundColor: 'white',
                  padding: '2rem',
                  borderRadius: '50%',
                  boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
                }}>
                  <Bell size={64} className="text-red-600" style={{ animation: 'alarmBounce 0.8s ease-in-out infinite' }} />
                </div>
              </div>

              <h2 style={{
                fontSize: '1.75rem',
                fontWeight: 'bold',
                marginBottom: '0.5rem',
                textAlign: 'center',
                padding: '0 1rem',
              }}>{
                activeAlarm.metadata?.surahNumber
                  ? t.surahNames[activeAlarm.metadata.surahNumber - 1]
                  : (activeAlarm.name || t.alarmMessage)
              }</h2>

              <p style={{
                fontSize: '1.25rem',
                opacity: 0.9,
                marginBottom: '3rem',
                textAlign: 'center',
              }}>{t.alarmMessage}</p>

              {/* Stop Alarm Button - Large and prominent for mobile */}
              <button
                onClick={() => {
                  stopAlarmAudio();
                }}
                style={{
                  backgroundColor: 'white',
                  color: '#dc2626',
                  padding: '1rem 3rem',
                  borderRadius: '9999px',
                  fontSize: '1.5rem',
                  fontWeight: 900,
                  boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
                  border: 'none',
                  cursor: 'pointer',
                  minWidth: '200px',
                  minHeight: '60px',
                }}
              >
                {t.stopAlarm}
              </button>

              {/* Snooze Feature */}
              <div style={{ 
                marginTop: '1.5rem', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                backgroundColor: 'rgba(255,255,255,0.2)',
                borderRadius: '9999px',
                border: '1px solid rgba(255,255,255,0.4)',
                padding: '0.25rem 0.5rem'
              }}>
                {/* Increase Button (+) */}
                <button 
                  onClick={() => setSnoozeDuration(prev => Math.min(prev + 5, 60))}
                  style={{
                    color: 'white',
                    background: 'none',
                    border: 'none',
                    fontSize: '1.5rem',
                    cursor: 'pointer',
                    padding: '0.5rem 1rem',
                    opacity: snoozeDuration >= 60 ? 0.5 : 1
                  }}
                  disabled={snoozeDuration >= 60}
                >
                  +
                </button>

                {/* Snooze Execute Button */}
                <button
                  onClick={async () => {
                    if (!activeAlarm) return;

                    // إيقاف الصوت وإزالة مستمعي الهز والأزرار
                    stopAlarmAudio();
                    
                    const snoozeTime = new Date(Date.now() + snoozeDuration * 60000);
                    const snoozeYear = snoozeTime.getFullYear();
                    const snoozeMonth = String(snoozeTime.getMonth() + 1).padStart(2, '0');
                    const snoozeDate = String(snoozeTime.getDate()).padStart(2, '0');
                    const snoozeDateStr = `${snoozeYear}-${snoozeMonth}-${snoozeDate}`;
                    
                    const snoozeHour = snoozeTime.getHours().toString().padStart(2, '0');
                    const snoozeMinute = snoozeTime.getMinutes().toString().padStart(2, '0');
                    const snoozeTimeStr = `${snoozeHour}:${snoozeMinute}`;

                    const snoozeId = `snooze_${Date.now()}`;
                    const snoozeNotification: any = {
                      id: snoozeId,
                      name: `⏰ غفوة: ${activeAlarm.name || t.alarmMessage}`,
                      isEnabled: true,
                      isAlarm: true,
                      type: 'once',
                      days: [],
                      times: [snoozeTimeStr],
                      targetDate: snoozeDateStr,
                      sound: activeAlarm.sound || 'islamic_song.mp3',
                      metadata: activeAlarm.metadata
                    };

                    setNotifications(prev => {
                      const updated = [...prev, snoozeNotification];
                      localStorage.setItem('quran_alarm_notifications', JSON.stringify(updated));
                      return updated;
                    });
                    
                    if (isNative) {
                      try {
                        const { LocalNotifications } = await import('@capacitor/local-notifications');
                        const nativeSnoozeId = Math.floor(Math.random() * 1000000) + 1000000;
                        await LocalNotifications.schedule({
                          notifications: [{
                            id: nativeSnoozeId,
                            title: snoozeNotification.name,
                            body: `تذكير التأجيل بعد ${snoozeDuration} دقائق`,
                            schedule: { at: snoozeTime, allowWhileIdle: true },
                            channelId: 'quran_critical_alarm_v1',
                            sound: snoozeNotification.sound,
                            autoCancel: false,
                            extra: snoozeNotification.metadata || {}
                          }]
                        });
                      } catch (e) {}
                    }
                    
                    setToastMessage(settings.language === 'ar' ? `تم تأجيل المنبه لمدة ${snoozeDuration} دقيقة` : `Snoozed for ${snoozeDuration} min`);
                    setActiveAlarm(null);
                  }}
                  style={{
                    backgroundColor: 'transparent',
                    color: 'white',
                    padding: '0.5rem 1rem',
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    border: 'none',
                    cursor: 'pointer',
                    minWidth: '150px'
                  }}
                >
                  {settings.language === 'ar' ? `التأخير ${snoozeDuration} دقائق` : `Snooze ${snoozeDuration} min`}
                </button>

                {/* Decrease Button (-) */}
                <button 
                  onClick={() => setSnoozeDuration(prev => Math.max(prev - 5, 5))}
                  style={{
                    color: 'white',
                    background: 'none',
                    border: 'none',
                    fontSize: '1.5rem',
                    cursor: 'pointer',
                    padding: '0.5rem 1rem',
                    opacity: snoozeDuration <= 5 ? 0.5 : 1
                  }}
                  disabled={snoozeDuration <= 5}
                >
                  -
                </button>
              </div>

              {/* Inline keyframes for guaranteed animation */}
              <style>{`
                @keyframes alarmPulse {
                  0%, 100% { transform: scale(1); opacity: 0.5; }
                  50% { transform: scale(1.5); opacity: 0; }
                }
                @keyframes alarmBounce {
                  0%, 100% { transform: translateY(0); }
                  50% { transform: translateY(-10px); }
                }
              `}</style>
            </div>
          )
        }

        {/* Prayer Mode Overlay Button (only when enabled and fullscreen is not blocking logic, though it can overlay fullscreen) */}
        {/* Prayer Mode Overlay Button - Hide when overlays are open */}
        {
          settings.prayerMode && !isIndexOpen && !isSettingsOpen && !isSearchOpen && !isMemorizationStatsOpen && !isNotificationOpen && (
            <PrayerModeButton
              t={t}
              onNextPage={handleNextPage}
              onDismiss={() => {
                setSettings(prev => ({ ...prev, prayerMode: false }));
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
          t={t}
        />

        <TourClickOverlay
          isOpen={showTourClickOverlay}
          onComplete={handleClickTutorialComplete}
          t={t}
        />

        {isHowToUseOpen && (
          <Suspense fallback={null}>
            <HowToUseGuide
              isOpen
              onClose={() => setIsHowToUseOpen(false)}
              language={settings.language as Language}
            />
          </Suspense>
        )}
      </div >
    </FeedbackProvider >
  );
}