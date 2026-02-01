/**
 * سكريبت تحويل بيانات مجمع الملك فهد إلى صيغة محسّنة لمحرك العرض
 * 
 * المدخلات: hafs_smart_v8.json (البيانات الرسمية)
 * المخرجات: kfgqpc_quran.json (صيغة محسّنة للعرض بنظام الصفحات والأسطر)
 */

import fs from 'fs';
import path from 'path';

// مسار الملفات
const INPUT_FILE = './official_data/kfgqpc_hafs_smart_4/kfgqpc_hafs_smart_data/hafs_smart_v8.json';
const OUTPUT_FILE = './public/kfgqpc_quran.json';

console.log('📖 بدء معالجة بيانات مجمع الملك فهد...');

// قراءة البيانات
const rawData = JSON.parse(fs.readFileSync(INPUT_FILE, 'utf8'));
console.log(`✅ تم تحميل ${rawData.length} آية`);

/**
 * هيكل البيانات المخرجة:
 * {
 *   pages: {
 *     1: {
 *       pageNo: 1,
 *       surahs: [{ number: 1, name: "الفاتحة", nameEn: "Al-Fatiha" }],
 *       juz: 1,
 *       lines: [
 *         { lineNo: 1, segments: [] },
 *         { lineNo: 2, segments: [{ surahNo: 1, ayahNo: 1, text: "...", isStart: true, isEnd: true }] },
 *         ...
 *       ]
 *     }
 *   },
 *   surahs: {
 *     1: { number: 1, name: "الفاتحة", nameEn: "Al-Fatiha", startPage: 1, ayahCount: 7 }
 *   }
 * }
 */

const result = {
    pages: {},
    surahs: {},
    totalPages: 604,
    totalAyahs: rawData.length
};

// تجميع معلومات السور
const surahInfo = {};

// معالجة كل آية
rawData.forEach((ayah) => {
    const {
        sura_no: surahNo,
        sura_name_ar: surahName,
        sura_name_en: surahNameEn,
        page,
        line_start: lineStart,
        line_end: lineEnd,
        aya_no: ayahNo,
        aya_text: text,
        aya_text_emlaey: textEmlaey,
        jozz: juz
    } = ayah;

    // تسجيل معلومات السورة
    if (!surahInfo[surahNo]) {
        surahInfo[surahNo] = {
            number: surahNo,
            name: surahName,
            nameEn: surahNameEn,
            startPage: page,
            ayahCount: 0
        };
    }
    surahInfo[surahNo].ayahCount++;

    // إنشاء الصفحة إذا لم تكن موجودة
    if (!result.pages[page]) {
        result.pages[page] = {
            pageNo: page,
            juz: juz,
            surahs: [],
            lines: []
        };
        // إنشاء 15 سطر فارغ
        for (let i = 1; i <= 15; i++) {
            result.pages[page].lines.push({
                lineNo: i,
                segments: []
            });
        }
    }

    const pageData = result.pages[page];

    // إضافة السورة لقائمة سور الصفحة
    if (!pageData.surahs.find(s => s.number === surahNo)) {
        pageData.surahs.push({
            number: surahNo,
            name: surahName,
            nameEn: surahNameEn
        });
    }

    // تحديث رقم الجزء
    pageData.juz = juz;

    // إضافة الآية إلى الأسطر المناسبة
    // إذا كانت الآية تمتد على أكثر من سطر، نقسمها
    for (let lineNo = lineStart; lineNo <= lineEnd; lineNo++) {
        // التأكد من أن السطر موجود (1-15)
        if (lineNo < 1 || lineNo > 15) continue;

        const lineIndex = lineNo - 1;
        const line = pageData.lines[lineIndex];

        if (!line) continue;

        // إضافة segment للسطر
        const segment = {
            surahNo,
            ayahNo,
            text: text,           // نص الرسم العثماني
            textEmlaey: textEmlaey, // النص الإملائي للبحث
            isStart: lineNo === lineStart,
            isEnd: lineNo === lineEnd,
            lineStart,
            lineEnd
        };

        line.segments.push(segment);
    }
});

// إضافة معلومات السور
result.surahs = surahInfo;

// حساب الإحصائيات
const stats = {
    totalPages: Object.keys(result.pages).length,
    totalSurahs: Object.keys(result.surahs).length,
    totalAyahs: rawData.length
};

console.log('\n📊 إحصائيات:');
console.log(`   - عدد الصفحات: ${stats.totalPages}`);
console.log(`   - عدد السور: ${stats.totalSurahs}`);
console.log(`   - عدد الآيات: ${stats.totalAyahs}`);

// التحقق من الصفحات
console.log('\n🔍 التحقق من بعض الصفحات:');

// صفحة 1 (الفاتحة)
const page1 = result.pages[1];
console.log(`   صفحة 1: ${page1.surahs.map(s => s.name).join(', ')} - ${page1.lines.filter(l => l.segments.length > 0).length} سطر مملوء`);

// صفحة 604 (الناس)
const page604 = result.pages[604];
if (page604) {
    console.log(`   صفحة 604: ${page604.surahs.map(s => s.name).join(', ')} - ${page604.lines.filter(l => l.segments.length > 0).length} سطر مملوء`);
}

// حفظ الملف
console.log('\n💾 حفظ الملف...');
fs.writeFileSync(OUTPUT_FILE, JSON.stringify(result, null, 2), 'utf8');

const fileSize = (fs.statSync(OUTPUT_FILE).size / 1024 / 1024).toFixed(2);
console.log(`✅ تم إنشاء ${OUTPUT_FILE} (${fileSize} MB)`);

console.log('\n🎉 تمت المعالجة بنجاح!');
