/**
 * reciterService.ts
 * ─────────────────────────────────────────────────────────────────
 * Maps internal reciter IDs → Quran.com audio CDN (verses.quran.com)
 *
 * WHY: cdn.islamic.network blocks CORS → opaque responses → offline failure
 *      verses.quran.com supports CORS (Access-Control-Allow-Origin: *) ✅
 *
 * URL format: https://verses.quran.com/{slug}/{surah:3}{ayah:3}.mp3
 *             e.g.  https://verses.quran.com/Alafasy/mp3/001001.mp3
 * ─────────────────────────────────────────────────────────────────
 */

import { SURAHS } from '../constants/surahData';

const CDN_VERSES = 'https://verses.quran.com';
const CDN_QURANIC = 'https://mirrors.quranicaudio.com/everyayah';

/**
 * Map from internal reciter ID (localStorage key) → audio URL base path.
 * Discovered by querying: api.quran.com/api/v4/recitations/{id}/by_ayah/1
 */
export const RECITER_URL_MAP: Record<string, string> = {
    // Quran.com ID 7
    'ar.alafasy':              '/Alafasy/mp3',
    // Quran.com ID 6
    'ar.husary':               '/everyayah/Husary_64kbps',
    // Quran.com ID 12
    'ar.husarymujawwad':       '/everyayah/Husary_Muallim_64kbps',
    // Quran.com ID 3
    'ar.sudais':               '/Sudais/mp3',
    // Quran.com ID 2
    'ar.abdulbasitmurattal':   '/AbdulBaset/Murattal/mp3',
    // Quran.com ID 1
    'ar.abdulbasitmujawwad':   '/AbdulBaset/Mujawwad/mp3',
    // Quran.com ID 4
    'ar.shatri':               '/Shatri/mp3',
    // Quran.com ID 9
    'ar.minshawi':             '/Minshawi/Murattal/mp3',
    // Quran.com ID 8
    'ar.minshawimujawwad':     '/Minshawi/Mujawwad/mp3',
    // Quran.com ID 10
    'ar.shuraym':              '/Shuraym/mp3',
    // Quran.com ID 5
    'ar.hanirifai':            '/everyayah/Hani_Rifai_192kbps',
    'ar.tablawi':              '/Tablawi/mp3',
    'ar.ajamy':                '/Ajamy/mp3'
};

/**
 * Returns the CDN hosts used by the reciter audio system.
 * Used to add them to the SW handler and CORS-enable caching.
 */
export const AUDIO_CDN_HOSTS = [
    'verses.quran.com',
    'mirrors.quranicaudio.com',
];

/**
 * Convert a global ayah number (1–6236) to {surah, ayah}.
 * Uses SURAHS data from constants.
 */
export function globalToSurahAyah(global: number): { surah: number; ayah: number } {
    let remaining = global;
    for (let i = 0; i < SURAHS.length; i++) {
        if (remaining <= SURAHS[i].ayahCount) {
            return { surah: i + 1, ayah: remaining };
        }
        remaining -= SURAHS[i].ayahCount;
    }
    // Fallback — should never happen for valid input
    return { surah: 114, ayah: remaining };
}

/**
 * Build the full audio URL for a given reciter + global ayah number.
 *
 * @param reciterID   Internal ID like 'ar.alafasy'
 * @param globalNum   Global ayah number (1–6236)
 * @returns           Absolute CORS-enabled audio URL
 */
export function buildAudioUrl(reciterID: string, globalNum: number): string {
    const path = RECITER_URL_MAP[reciterID];

    if (!path) {
        return `https://cdn.islamic.network/quran/audio/128/${reciterID}/${globalNum}.mp3`;
    }

    const { surah, ayah } = globalToSurahAyah(globalNum);
    const s = String(surah).padStart(3, '0');
    const a = String(ayah).padStart(3, '0');
    
    // Explicitly construct absolute URL using string concatenation as requested
    const isQuranic = path.includes('everyayah');
    const domain = isQuranic ? 'https://mirrors.quranicaudio.com' : 'https://verses.quran.com';
    
    // Ensure path starts with /
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    
    return `${domain}${normalizedPath}/${s}${a}.mp3`;
}

/**
 * Static reciter list with Arabic/English names — used as offline fallback
 * and to populate the reciter selector UI.
 */
export const STATIC_RECITERS = [
    { id: 'ar.alafasy',            nameAr: 'مشاري بن راشد العفاسي',         nameEn: 'Mishary Rashid Al-Afasy' },
    { id: 'ar.husary',             nameAr: 'محمود خليل الحصري',              nameEn: 'Mahmoud Khalil Al-Husary' },
    { id: 'ar.husarymujawwad',     nameAr: 'الحصري (معلم)',                  nameEn: 'Al-Husary (Muallim)' },
    { id: 'ar.sudais',             nameAr: 'عبد الرحمن السديس',              nameEn: 'Abdur-Rahman As-Sudais' },
    { id: 'ar.abdulbasitmurattal', nameAr: 'عبد الباسط عبد الصمد (مرتّل)',  nameEn: 'AbdulBaset AbdulSamad (Murattal)' },
    { id: 'ar.abdulbasitmujawwad', nameAr: 'عبد الباسط عبد الصمد (مجوّد)', nameEn: 'AbdulBaset AbdulSamad (Mujawwad)' },
    { id: 'ar.minshawi',           nameAr: 'محمد صديق المنشاوي (مرتّل)',    nameEn: 'Mohamed Siddiq Al-Minshawi (Murattal)' },
    { id: 'ar.minshawimujawwad',   nameAr: 'محمد صديق المنشاوي (مجوّد)',   nameEn: 'Mohamed Siddiq Al-Minshawi (Mujawwad)' },
    { id: 'ar.shuraym',            nameAr: 'سعود الشريم',                   nameEn: "Sa'ud Ash-Shuraym" },
    { id: 'ar.hanirifai',          nameAr: 'هاني الرفاعي',                  nameEn: 'Hani Ar-Rifai' },
    { id: 'ar.tablawi',            nameAr: 'محمد الطبلاوي',                 nameEn: 'Mohamed Al-Tablawi' },
    { id: 'ar.ajamy',              nameAr: 'أحمد بن علي العجمي',             nameEn: 'Ahmed Al-Ajamy' },
    { id: 'ar.shatri',             nameAr: 'أبو بكر الشاطري',               nameEn: 'Abu Bakr Al-Shatri' }
];
