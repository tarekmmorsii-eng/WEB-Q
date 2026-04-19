import { PageData, Ayah, Surah } from '../types';
import { JUZ_START_PAGES } from '../constants';

const CACHE_PREFIX = 'quran_page_simple_v2_';

// Cache for the full Quran data
let fullQuranData: { surahs: SurahWithAyahs[] } | null = null;
let ayahsByPage: { [page: number]: Ayah[] } | null = null;

// Extended Surah interface to include ayahs structure from API
interface SurahWithAyahs extends Surah {
  ayahs: Ayah[];
}

// Helper to get surah info from the API response structure
const extractSurahs = (ayahs: Ayah[]) => {
  const surahs: any = {};
  ayahs.forEach(ayah => {
    // Check both potential locations for surah data
    const surahData = ayah.surah || (fullQuranData?.surahs ? fullQuranData.surahs.find(s => s.number === (ayah as any).surahNumber) : null);

    if (surahData && !surahs[surahData.number]) {
      surahs[surahData.number] = surahData;
    }
  });
  return surahs;
};

/**
 * Get the exact page number for a specific ayah synchronously
 */
export const getAyahPageSync = (surahNumber: number, ayahNumber: number): number | null => {
  if (!fullQuranData) return null;

  const surah = fullQuranData.surahs[surahNumber - 1];
  if (surah) {
    const ayah = surah.ayahs.find(a => a.numberInSurah === ayahNumber);
    if (ayah) return ayah.page;
  }

  return null;
};

/**
 * Get the exact page number for a specific ayah
 */
export const getAyahPage = async (surahNumber: number, ayahNumber: number): Promise<number> => {
  if (!fullQuranData) {
    await loadQuranData();
  }

  const surah = fullQuranData?.surahs?.[surahNumber - 1];
  if (surah) {
    const ayah = surah.ayahs.find(a => a.numberInSurah === ayahNumber);
    if (ayah) return ayah.page;
  }

  // Fallback to surah start page if ayah mapping fails
  return getSurahStartPage(surahNumber);
};

/**
 * Get the ayah range for a specific surah on a specific page
 */
export const getPageAyahRange = async (surahNumber: number, pageNumber: number): Promise<{ start: number, end: number } | null> => {
  if (!fullQuranData) {
    await loadQuranData();
  }

  const surah = fullQuranData?.surahs?.[surahNumber - 1];
  if (!surah) return null;

  const ayahsOnPage = surah.ayahs.filter(a => a.page === pageNumber);
  if (ayahsOnPage.length === 0) return null;

  return {
    start: ayahsOnPage[0].numberInSurah,
    end: ayahsOnPage[ayahsOnPage.length - 1].numberInSurah
  };
};

/**
 * Get a summary of surahs covered in a page range
 */
export const getSurahsForPages = async (startPage: number, endPage: number, language: string = 'ar'): Promise<string> => {
  if (!fullQuranData) {
    await loadQuranData();
  }

  const surahNumbers = new Set<number>();
  for (let p = startPage; p <= endPage; p++) {
    const pageAyahs = ayahsByPage?.[p];
    if (pageAyahs) {
      pageAyahs.forEach(a => {
        if (a.surah) surahNumbers.add(a.surah.number);
      });
    }
  }

  if (surahNumbers.size === 0) return '';

  const sortedNumbers = Array.from(surahNumbers).sort((a, b) => a - b);
  const names = sortedNumbers.map(n => {
    const s = fullQuranData?.surahs?.[n - 1];
    if (!s) return '';
    return language === 'ar' ? s.name : s.englishName;
  }).filter(name => name !== '');

  if (names.length <= 3) return names.join('، ');
  return `${names.slice(0, 3).join('، ')} ... ${names[names.length - 1]}`;
};

const loadQuranData = async () => {
  if (fullQuranData) return;

  try {
    const response = await fetch('/quran.json');
    if (!response.ok) throw new Error('Failed to load local Quran data');
    const json = await response.json();

    if (json.code === 200 && json.data && json.data.surahs) {
      fullQuranData = json.data;

      // Index ayahs by page for faster access
      ayahsByPage = {};

      // The data structure is organized by Surah -> Ayahs
      fullQuranData!.surahs.forEach((surah: any) => {
        const surahMetadata: Surah = {
          number: surah.number,
          name: surah.name,
          englishName: surah.englishName,
          englishNameTranslation: surah.englishNameTranslation,
          numberOfAyahs: surah.numberOfAyahs,
          revelationType: surah.revelationType
        };

        surah.ayahs.forEach((ayah: any) => {
          const page = ayah.page;
          if (!ayahsByPage![page]) {
            ayahsByPage![page] = [];
          }

          // Attach the surah metadata to the ayah object as expected by the UI
          // The UI expects ayah.surah to exist for some logic (like displaying surah name)
          ayah.surah = surahMetadata;

          ayahsByPage![page].push(ayah);
        });
      });
    } else {
      throw new Error('Invalid local Quran data structure');
    }
  } catch (error) {
    console.error("Error loading local Quran data:", error);
    throw error;
  }
};

export const fetchPage = async (pageNumber: number): Promise<PageData> => {
  // 1. Check Local Storage (Offline capability for visited pages)
  // Although we have the full JSON, parsing it might take a ms.
  // We can still use the per-page cache for micro-optimizations,
  // but loading from memory (ayahsByPage) is extremely fast.

  // We will load the full data once.
  if (!ayahsByPage) {
    await loadQuranData();
  }

  if (ayahsByPage && ayahsByPage[pageNumber]) {
    const pageAyahs = ayahsByPage[pageNumber];

    const pageData: PageData = {
      number: pageNumber,
      ayahs: pageAyahs,
      surahs: extractSurahs(pageAyahs)
    };

    return pageData;
  }

  throw new Error(`Page ${pageNumber} not found locally`);
};

export const getJuzForPage = (pageNumber: number): number => {
  for (let i = 0; i < JUZ_START_PAGES.length; i++) {
    // Check if this is the last juz or if the page is before the next juz start
    const nextJuzStart = JUZ_START_PAGES[i + 1];
    if (!nextJuzStart || pageNumber < nextJuzStart) {
      return i + 1;
    }
  }
  return 30;
};

export const getSurahStartPage = (surahNumber: number): number => {
  // Full mapping of Surah number to Start Page (Madinah Mushaf)
  const map: { [key: number]: number } = {
    1: 1, 2: 2, 3: 50, 4: 77, 5: 106, 6: 128, 7: 151, 8: 177, 9: 187, 10: 208,
    11: 221, 12: 235, 13: 249, 14: 255, 15: 262, 16: 267, 17: 282, 18: 293, 19: 305,
    20: 312, 21: 322, 22: 332, 23: 342, 24: 350, 25: 359, 26: 367, 27: 377, 28: 385,
    29: 396, 30: 404, 31: 411, 32: 415, 33: 418, 34: 428, 35: 434, 36: 440, 37: 446,
    38: 453, 39: 458, 40: 467, 41: 477, 42: 483, 43: 489, 44: 496, 45: 499, 46: 502,
    47: 507, 48: 511, 49: 515, 50: 518, 51: 520, 52: 523, 53: 526, 54: 528, 55: 531,
    56: 534, 57: 537, 58: 542, 59: 545, 60: 549, 61: 551, 62: 553, 63: 554, 64: 556,
    65: 558, 66: 560, 67: 562, 68: 564, 69: 566, 70: 568, 71: 570, 72: 572, 73: 574,
    74: 575, 75: 577, 76: 578, 77: 580, 78: 582, 79: 583, 80: 585, 81: 586, 82: 587,
    83: 587, 84: 589, 85: 590, 86: 591, 87: 591, 88: 592, 89: 593, 90: 594, 91: 595,
    92: 595, 93: 596, 94: 596, 95: 597, 96: 597, 97: 598, 98: 598, 99: 599, 100: 599,
    101: 600, 102: 600, 103: 601, 104: 601, 105: 601, 106: 602, 107: 602, 108: 602,
    109: 603, 110: 603, 111: 603, 112: 604, 113: 604, 114: 604
  };
  return map[surahNumber] || 1;
};
