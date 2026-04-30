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
  "sep_murattal": "",
  "husary": "/Husary_128kbps",
  "abdul_basit": "/Abdul_Basit_Murattal_192kbps",
  "minshawy": "/Minshawy_Murattal_128kbps",
  "alafasy": "/Alafasy_128kbps",
  "maher": "/MaherAlMuaiqly128kbps",
  "sudais": "/Abdurrahmaan_As-Sudais_192kbps",
  "yasser": "/Yasser_Ad-Dussary_128kbps",
  "qatami": "/Nasser_Alqatami_128kbps",
  "ghamdi": "/Ghamadi_40kbps",
  "shuraym": "/Saood_ash-Shuraym_128kbps",
  "ajamy": "/ahmed_ibn_ali_al_ajamy_128kbps",
  "rifai": "/Hani_Rifai_192kbps",
  "juhany": "/Abdullaah_3awwaad_Al-Juhaynee_128kbps",
  "hudhaify": "/Hudhaify_128kbps",
  "ayyoub": "/Muhammad_Ayyoub_128kbps",
  "basfar": "/Abdullah_Basfar_192kbps",
  "banna": "/mahmoud_ali_al_banna_32kbps",
  "mustafa_ismail": "/Mustafa_Ismail_48kbps",
  "tablawi": "/Mohammad_al_Tablaway_128kbps",
  "ali_jaber": "/Ali_Jaber_64kbps",
  "fares_abbad": "/Fares_Abbad_64kbps",
  "qahtani": "/Khaalid_Abdullaah_al-Qahtaanee_192kbps",
  "jibreel": "/Muhammad_Jibreel_128kbps",
  "matroud": "/Abdullah_Matroud_128kbps",
  "budair": "/Salah_Al_Budair_128kbps",
  "bukhatir": "/Salaah_AbdulRahman_Bukhatir_128kbps",
  "akhdar": "/Ibrahim_Akhdar_32kbps",
  "ahmed_neana": "/Ahmed_Neana_128kbps",
  "akram_alaqimy": "/Akram_AlAlaqimy_128kbps",
  "ali_hajjaj": "/Ali_Hajjaj_AlSuesy_128kbps",
  "abdulkareem": "/Muhammad_AbdulKareem_128kbps",
  "muhsin_qasim": "/Muhsin_Al_Qasim_192kbps",
  "sahl_yassin": "/Sahl_Yassin_128kbps",
  "aziz_alili": "/aziz_alili_128kbps",
  "karim_mansoori": "/Karim_Mansoori_40kbps",
  "parhizgar": "/Parhizgar_48kbps",
  "nabil_rifai": "/Nabil_Rifa3i_48kbps",
  "yaser_salamah": "/Yaser_Salamah_128kbps",
  "khalifa_tunaiji": "/khalefa_al_tunaiji_64kbps",
  "shatri": "/Abu_Bakr_Ash-Shaatree_128kbps",
  
  "sep_mujawwad": "",
  "husary_mujawwad": "/Husary_128kbps_Mujawwad",
  "abdul_basit_mujawwad": "/Abdul_Basit_Mujawwad_128kbps",
  "minshawy_mujawwad": "/Minshawy_Mujawwad_192kbps",
  "husary_muallim": "/Husary_Muallim_128kbps",
  "minshawy_teacher": "/Minshawy_Teacher_128kbps",
  "sowaid": "/Ayman_Sowaid_64kbps"
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
    try {
        const path = RECITER_URL_MAP[reciterID];

        if (!path) {
            return ""; // Safe return for separators, missing IDs or null paths
        }

        const { surah, ayah } = globalToSurahAyah(globalNum);
        const s = String(surah).padStart(3, '0');
        const a = String(ayah).padStart(3, '0');
        const fileName = `${s}${a}.mp3`;
        
        const baseUrl = 'https://everyayah.com/data';
        
        const normalizedPath = path.startsWith('/') ? path : `/${path}`;
        const cleanPath = normalizedPath.endsWith('/') ? normalizedPath.slice(0, -1) : normalizedPath;
        
        return baseUrl + cleanPath + "/" + fileName;
    } catch (error) {
        console.warn(`[buildAudioUrl] Error building URL for ${reciterID}:`, error);
        return "";
    }
}

/**
 * Static reciter list with Arabic/English names — used as offline fallback
 * and to populate the reciter selector UI.
 */
export const RECITERS_LIST = [
  { id: "sep_murattal", name: "────── التلاوات المرتلة ──────", disabled: true },
  { id: "husary", name: "محمود خليل الحصري" },
  { id: "abdul_basit", name: "عبد الباسط عبد الصمد" },
  { id: "minshawy", name: "محمد صديق المنشاوي" },
  { id: "alafasy", name: "مشاري بن راشد العفاسي" },
  { id: "maher", name: "ماهر المعيقلي" },
  { id: "sudais", name: "عبد الرحمن السديس" },
  { id: "yasser", name: "ياسر الدوسري" },
  { id: "qatami", name: "ناصر القطامي" },
  { id: "ghamdi", name: "سعد الغامدي" },
  { id: "shuraym", name: "سعود الشريم" },
  { id: "ajamy", name: "أحمد بن علي العجمي" },
  { id: "rifai", name: "هاني الرفاعي" },
  { id: "juhany", name: "عبد الله الجهني" },
  { id: "hudhaify", name: "علي الحذيفي" },
  { id: "ayyoub", name: "محمد أيوب" },
  { id: "basfar", name: "عبد الله بصفر" },
  { id: "banna", name: "محمود علي البنا" },
  { id: "mustafa_ismail", name: "مصطفى إسماعيل" },
  { id: "tablawi", name: "محمد محمود الطبلاوي" },
  { id: "ali_jaber", name: "علي جابر" },
  { id: "fares_abbad", name: "فارس عباد" },
  { id: "qahtani", name: "خالد القحطاني" },
  { id: "jibreel", name: "محمد جبريل" },
  { id: "matroud", name: "عبد الله المطرود" },
  { id: "budair", name: "صلاح البدير" },
  { id: "bukhatir", name: "صلاح بو خاطر" },
  { id: "akhdar", name: "إبراهيم الأخضر" },
  { id: "ahmed_neana", name: "أحمد نعينع" },
  { id: "akram_alaqimy", name: "أكرم العلاقمي" },
  { id: "ali_hajjaj", name: "علي حجاج السويسي" },
  { id: "abdulkareem", name: "محمد عبد الكريم" },
  { id: "muhsin_qasim", name: "عبد المحسن القاسم" },
  { id: "sahl_yassin", name: "سهل ياسين" },
  { id: "aziz_alili", name: "عزيز عليلي" },
  { id: "karim_mansoori", name: "كريم منصوري" },
  { id: "parhizgar", name: "شهريار برهيزغار" },
  { id: "nabil_rifai", name: "نبيل الرفاعي" },
  { id: "yaser_salamah", name: "ياسر سلامة" },
  { id: "khalifa_tunaiji", name: "خليفة الطنيجي" },
  { id: "shatri", name: "أبو بكر الشاطري" },

  { id: "sep_mujawwad", name: "────── مجود وتعليمي ──────", disabled: true },
  { id: "husary_mujawwad", name: "محمود خليل الحصري (مجود)" },
  { id: "abdul_basit_mujawwad", name: "عبد الباسط عبد الصمد (مجود)" },
  { id: "minshawy_mujawwad", name: "محمد صديق المنشاوي (مجود)" },
  { id: "husary_muallim", name: "محمود خليل الحصري (المصحف المعلم)" },
  { id: "minshawy_teacher", name: "محمد صديق المنشاوي (المصحف المعلم)" },
  { id: "sowaid", name: "أيمن سويد (تعليمي)" }
];
