/**
 * أنواع البيانات لمحرك عرض المصحف الجديد
 * مبني على بيانات مجمع الملك فهد الرسمية
 */

// قطعة من آية (جزء من آية في سطر واحد)
export interface KFGQPCSegment {
    surahNo: number;
    ayahNo: number;
    text: string;          // نص الرسم العثماني
    textEmlaey: string;    // النص الإملائي (للبحث)
    isStart: boolean;      // هل هذا بداية الآية؟
    isEnd: boolean;        // هل هذا نهاية الآية؟
    lineStart: number;     // السطر الذي تبدأ فيه الآية
    lineEnd: number;       // السطر الذي تنتهي فيه الآية
}

// سطر في صفحة المصحف
export interface KFGQPCLine {
    lineNo: number;
    segments: KFGQPCSegment[];
}

// معلومات سورة مختصرة
export interface KFGQPCSurahInfo {
    number: number;
    name: string;
    nameEn: string;
}

// صفحة في المصحف
export interface KFGQPCPage {
    pageNo: number;
    juz: number;
    surahs: KFGQPCSurahInfo[];
    lines: KFGQPCLine[];
}

// معلومات سورة كاملة
export interface KFGQPCSurahFull {
    number: number;
    name: string;
    nameEn: string;
    startPage: number;
    ayahCount: number;
}

// البيانات الكاملة
export interface KFGQPCData {
    pages: { [pageNo: string]: KFGQPCPage };
    surahs: { [surahNo: string]: KFGQPCSurahFull };
    totalPages: number;
    totalAyahs: number;
}

// دالة لتحميل البيانات
let cachedData: KFGQPCData | null = null;

export async function loadKFGQPCData(): Promise<KFGQPCData> {
    if (cachedData) return cachedData;

    const response = await fetch('/kfgqpc_quran.json');
    cachedData = await response.json();
    return cachedData!;
}

// دالة للحصول على صفحة معينة
export function getPage(data: KFGQPCData, pageNo: number): KFGQPCPage | null {
    return data.pages[pageNo.toString()] || null;
}

// دالة للحصول على الصفحة الأولى لسورة معينة
export function getSurahStartPage(data: KFGQPCData, surahNo: number): number {
    const surah = data.surahs[surahNo.toString()];
    return surah ? surah.startPage : 1;
}

// دالة لتقسيم نص الآية إلى كلمات
export function splitAyahText(text: string): string[] {
    return text.split(/\s+/).filter(word => word.length > 0);
}

// دالة للتحقق مما إذا كان السطر يحتوي على بداية سورة
export function lineHasSurahStart(line: KFGQPCLine): KFGQPCSurahInfo | null {
    const startSegment = line.segments.find(seg => seg.ayahNo === 1 && seg.isStart);
    if (startSegment) {
        return {
            number: startSegment.surahNo,
            name: '', // سيتم ملؤها لاحقاً
            nameEn: ''
        };
    }
    return null;
}

// رقم الآية بالأرقام العربية
export function toArabicNumber(num: number): string {
    const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    return num.toString().split('').map(d => arabicNumerals[parseInt(d)]).join('');
}
