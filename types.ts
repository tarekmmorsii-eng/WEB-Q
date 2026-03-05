export enum ViewMode {
  SHOW_ALL = 'SHOW_ALL',
  HIDE_ALL_AYAHS = 'HIDE_ALL_AYAHS',
  HIDE_RANDOM_AYAHS = 'HIDE_RANDOM_AYAHS',
  HIDE_RANDOM_WORDS = 'HIDE_RANDOM_WORDS',
  TOGGLE_FIRST_WORD = 'TOGGLE_FIRST_WORD',
  TOGGLE_LAST_WORD = 'TOGGLE_LAST_WORD',
}

export interface Ayah {
  number: number;
  text: string;
  numberInSurah: number;
  juz: number;
  manzil: number;
  page: number;
  ruku: number;
  hizbQuarter: number;
  sajda: boolean;
  surah?: Surah;
}

export interface Surah {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: string;
}

export interface LocationData {
  page: number;
  surahName: string;
  juz: number;
  timestamp: number;
}

export interface Bookmark extends LocationData { }

export interface VerseBookmark extends LocationData {
  id: string;
  ayahNumber: number;
  textPreview: string;
}

export interface PageData {
  number: number;
  ayahs: Ayah[];
  surahs: Record<number, Surah>;
}

export interface NotificationItem {
  id: string;
  name: string;
  isEnabled: boolean;
  isAlarm: boolean;
  sound?: string; // Optional custom sound path
  type: 'daily' | 'weekly';
  days: number[]; // Array of day indices (0=Sunday, 6=Saturday)
  times: string[]; // Array of time strings in HH:MM format
  // Legacy properties for backward compatibility
  title?: string;
  description?: string;
  time?: string;
  isRead?: boolean;

  // Enhanced Notification Types
  category?: 'text' | 'surah' | 'quran_part' | 'page';
  metadata?: {
    surahNumber?: number; // Was imageName
    juz?: number;
    hizb?: number;
    rub?: number;
    page?: number;

    // Ranges
    startPage?: number;
    endPage?: number;
    startAyah?: number;
    endAyah?: number;
  };
}

export interface MemorizationRating {
  ayahId: string;
  rating: 'weak' | 'medium' | 'good';
  timestamp: number;
}

export interface SurahRating {
  surahNumber: number;
  rating: 'weak' | 'medium' | 'good';
  timestamp: number;
  isUnified?: boolean; // علامة التوافق: true = جميع الآيات متطابقة مع تقييم السورة
}

// Settings Types
export interface BottomBarSettings {
  showIndex: boolean;
  showSearch: boolean;
  showMemorization: boolean;
  showNotifications: boolean;
  showDarkMode: boolean;
  showFontSize: boolean;
  showBookmark: boolean;
  showPrayerMode: boolean;
  showFullscreen: boolean;
  showPageNavigation: boolean;
}

export interface AppSettings {
  language: string;
  theme: string;
  textBrightness: number;
  backgroundBrightness: number;
  soundEnabled: boolean;
  bottomBar: BottomBarSettings;
  // Display Settings (Phase 1)
  defaultFontSize: 'small' | 'medium' | 'large';  // صغير: كمبيوتر، وسط: موبايل، كبير: تابلت
  lineSpacing: number; // 1.0 - 2.0
  pageMargins: number; // 0 - 50
  colorStopSigns?: boolean; // New setting for stop sign coloring
  prayerMode: boolean;
  showMutashabihatIndicators: boolean;
  enableWordLongPressAudio?: boolean; // New setting for word long press audio
  gestureTwoFingerTap?: boolean;
  gestureDoubleTap?: boolean;
  gestureSwipeUp?: boolean;
}

// Mutashabihat (Similar Verses) Types
export interface SimilarityInfo {
  percentage: number;      // 0-100
  grade: 1 | 2 | 3 | 4 | 5;
  color: string;           // hex color
  label: string;           // 'متطابقة', 'تشابه عالي', etc.
  labelEn: string;         // English label
}

export interface AyahReference {
  surahNumber: number;
  ayahNumber: number;
  absoluteAyahNumber?: number;
  text?: string;
  similarity?: SimilarityInfo;
  rule?: string; // The phrase itself
  ruleType?: 'START' | 'END' | 'MIDDLE';
  ruleColor?: string;
  isCustom?: boolean;
}

export interface MutashabihaRaw {
  src: { ayah: number | number[] };
  muts: {
    ayah: number | number[];
    rule?: string;
    type?: 'START' | 'END' | 'MIDDLE';
    color?: string;
  }[];
  ctx?: number;
}

export interface Mutashabiha {
  id: string;
  sourceAyah: AyahReference;
  similarAyahs: AyahReference[];
  showContext?: boolean;
  userNotes?: string;
  lastReviewed?: number;
  highestSimilarity?: SimilarityInfo;  // أعلى نسبة تشابه للعرض السريع
}