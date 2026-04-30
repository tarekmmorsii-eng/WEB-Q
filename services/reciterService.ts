/**
 * reciterService.ts
 * ─────────────────────────────────────────────────────────────────
 * Maps internal reciter IDs → EveryAyah audio CDN
 *
 * URL format: https://everyayah.com/data/{path}/{surah:3}{ayah:3}.mp3
 *             e.g.  https://everyayah.com/data/Husary_128kbps/001001.mp3
 * ─────────────────────────────────────────────────────────────────
 */

import { SURAHS } from '../constants/surahData';

const CDN_QURANIC = 'https://everyayah.com/data';

/**
 * Map from internal reciter ID (localStorage key) → audio URL base path.
 * Discovered by querying: api.quran.com/api/v4/recitations/{id}/by_ayah/1
 */
export const RECITER_URL_MAP: Record<string, string> = {
  "husary": "/Husary_128kbps",
  "husary_mujawwad": "/Husary_Mujawwad_128kbps",
  "husary_muallim": "/Husary_Muallim_128kbps",
  "abdul_basit": "/Abdul_Basit_Murattal_192kbps",
  "abdul_basit_mujawwad": "/Abdul_Basit_Mujawwad_128kbps",
  "minshawy": "/Minshawy_Murattal_128kbps",
  "minshawy_mujawwad": "/Minshawy_Mujawwad_192kbps",
  "alafasy": "/Alafasy_128kbps",
  "shatri": "/Abu_Bakr_Ash-Shaatree_128kbps",
  "ghamdi": "/Saad_Al_Ghamdi_128kbps",
  "maher": "/MaherAlMuaiqly_128kbps",
  "sudais": "/Abdurrahmaan_As-Sudais_192kbps",
  "shuraym": "/Saood_ash-Shuraym_128kbps",
  "yaser": "/Yasser_Ad-Dussary_128kbps", 
  "ajamy": "/Ahmed_ibn_Ali_al-Ajamy_128kbps",
  "tablawi": "/Mohammad_al_Tablaway_128kbps",
  "rifai": "/Hani_Rifai_192kbps",
  "juhany": "/Abdullaah_3awwaad_Al-Juhaynee_128kbps",
  "hudhaify": "/Hudhaify_128kbps",
  "ayyoub": "/Muhammad_Ayyoub_128kbps",
  "basfar": "/Abdullah_Basfar_192kbps",
  "qatami": "/Nasser_Alqatami_128kbps",
  "ali_jaber": "/Ali_Jaber_64kbps",
  "fares_abbad": "/Fares_Abbad_64kbps"
};

/**
 * Returns the CDN hosts used by the reciter audio system.
 * Used to add them to the SW handler and CORS-enable caching.
 */
export const AUDIO_CDN_HOSTS = [
    'everyayah.com',
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
 * @param reciterID   Internal ID like 'alafasy'
 * @param globalNum   Global ayah number (1–6236)
 * @returns           Absolute CORS-enabled audio URL
 */
export function buildAudioUrl(reciterID: string, globalNum: number): string {
    const path = RECITER_URL_MAP[reciterID];

    if (!path) {
        throw new Error(`Reciter ID '${reciterID}' not found in RECITER_URL_MAP.`);
    }

    const { surah, ayah } = globalToSurahAyah(globalNum);
    const s = String(surah).padStart(3, '0');
    const a = String(ayah).padStart(3, '0');
    const fileName = `${s}${a}.mp3`;
    
    // Explicitly construct absolute URL using string concatenation as requested
    const baseUrl = 'https://everyayah.com/data';
    
    // Ensure path starts with / and ends without /
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    const cleanPath = normalizedPath.endsWith('/') ? normalizedPath.slice(0, -1) : normalizedPath;
    
    return baseUrl + cleanPath + "/" + fileName;
}

/**
 * Static reciter list with Arabic/English names — used as offline fallback
 * and to populate the reciter selector UI.
 */
export const STATIC_RECITERS = [
    { id: 'husary',               nameAr: 'محمود خليل الحصري',              nameEn: 'Mahmoud Khalil Al-Husary' },
    { id: 'husary_mujawwad',      nameAr: 'الحصري (مجوّد)',                  nameEn: 'Al-Husary (Mujawwad)' },
    { id: 'husary_muallim',       nameAr: 'الحصري (معلم)',                  nameEn: 'Al-Husary (Muallim)' },
    { id: 'abdul_basit',          nameAr: 'عبد الباسط عبد الصمد (مرتّل)',  nameEn: 'AbdulBaset AbdulSamad (Murattal)' },
    { id: 'abdul_basit_mujawwad', nameAr: 'عبد الباسط عبد الصمد (مجوّد)', nameEn: 'AbdulBaset AbdulSamad (Mujawwad)' },
    { id: 'minshawy',             nameAr: 'محمد صديق المنشاوي (مرتّل)',    nameEn: 'Mohamed Siddiq Al-Minshawi (Murattal)' },
    { id: 'minshawy_mujawwad',    nameAr: 'محمد صديق المنشاوي (مجوّد)',   nameEn: 'Mohamed Siddiq Al-Minshawi (Mujawwad)' },
    { id: 'alafasy',              nameAr: 'مشاري بن راشد العفاسي',         nameEn: 'Mishary Rashid Al-Afasy' },
    { id: 'shatri',               nameAr: 'أبو بكر الشاطري',               nameEn: 'Abu Bakr Al-Shatri' },
    { id: 'ghamdi',               nameAr: 'سعد الغامدي',                   nameEn: 'Saad Al Ghamdi' },
    { id: 'maher',                nameAr: 'ماهر المعيقلي',                 nameEn: 'Maher Al Muaiqly' },
    { id: 'sudais',               nameAr: 'عبد الرحمن السديس',              nameEn: 'Abdur-Rahman As-Sudais' },
    { id: 'shuraym',              nameAr: 'سعود الشريم',                   nameEn: "Sa'ud Ash-Shuraym" },
    { id: 'yaser',                nameAr: 'ياسر الدوسري',                  nameEn: 'Yasser Al-Dosari' },
    { id: 'ajamy',                nameAr: 'أحمد بن علي العجمي',             nameEn: 'Ahmed Al-Ajamy' },
    { id: 'tablawi',              nameAr: 'محمد الطبلاوي',                 nameEn: 'Mohamed Al-Tablawi' },
    { id: 'rifai',                nameAr: 'هاني الرفاعي',                  nameEn: 'Hani Ar-Rifai' },
    { id: 'juhany',               nameAr: 'عبدالله الجهني',                  nameEn: 'Abdullah Al-Juhany' },
    { id: 'hudhaify',             nameAr: 'علي الحذيفي',                   nameEn: 'Ali Al-Hudhaify' },
    { id: 'ayyoub',               nameAr: 'محمد أيوب',                     nameEn: 'Muhammad Ayyoub' },
    { id: 'basfar',               nameAr: 'عبد الله بصفر',                  nameEn: 'Abdullah Basfar' },
    { id: 'qatami',               nameAr: 'ناصر القطامي',                  nameEn: 'Nasser Al Qatami' },
    { id: 'ali_jaber',            nameAr: 'علي جابر',                      nameEn: 'Ali Jaber' },
    { id: 'fares_abbad',          nameAr: 'فارس عباد',                     nameEn: 'Fares Abbad' }
];
