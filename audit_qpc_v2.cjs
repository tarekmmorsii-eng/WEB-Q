const fs = require('fs');
const path = require('path');

// مسار الملف
const inputPath = path.join(__dirname, 'public', 'fonts', 'qpc_v2_mushaf.json');

// قاعدة البيانات المرجعية (عدد الآيات الصحيح)
const REFERENCE_COUNTS = {
    1: 7, 2: 286, 3: 200, 4: 176, 5: 120, 6: 165, 7: 206, 8: 75, 9: 129, 10: 109,
    11: 123, 12: 111, 13: 43, 14: 52, 15: 99, 16: 128, 17: 111, 18: 110, 19: 98, 20: 135,
    21: 112, 22: 78, 23: 118, 24: 64, 25: 77, 26: 227, 27: 93, 28: 88, 29: 69, 30: 60,
    31: 34, 32: 30, 33: 73, 34: 54, 35: 45, 36: 83, 37: 182, 38: 88, 39: 75, 40: 85,
    41: 54, 42: 53, 43: 89, 44: 59, 45: 37, 46: 35, 47: 38, 48: 29, 49: 18, 50: 45,
    51: 60, 52: 49, 53: 62, 54: 55, 55: 78, 56: 96, 57: 29, 58: 22, 59: 24, 60: 13,
    61: 14, 62: 11, 63: 11, 64: 18, 65: 12, 66: 12, 67: 30, 68: 52, 69: 52, 70: 44,
    71: 28, 72: 28, 73: 20, 74: 56, 75: 40, 76: 31, 77: 50, 78: 40, 79: 46, 80: 42,
    81: 29, 82: 19, 83: 36, 84: 25, 85: 22, 86: 17, 87: 19, 88: 26, 89: 30, 90: 20,
    91: 15, 92: 21, 93: 11, 94: 8, 95: 8, 96: 19, 97: 5, 98: 8, 99: 8, 100: 11,
    101: 11, 102: 8, 103: 3, 104: 9, 105: 5, 106: 4, 107: 7, 108: 3, 109: 6, 110: 3,
    111: 5, 112: 4, 113: 5, 114: 6
};

console.log("🔍 بدء الفحص العميق (هيكل Lines -> Words)...");

try {
    const rawData = fs.readFileSync(inputPath, 'utf8');
    const data = JSON.parse(rawData);
    
    // تخزين الآيات التي وجدناها: { 1: Set(1, 2, ...), 2: Set(...) }
    let foundVerses = {};

    // 1. الدوران على الصفحات
    Object.keys(data).forEach(pageKey => {
        const page = data[pageKey];
        if (page.lines) {
            // 2. الدوران على الأسطر
            Object.keys(page.lines).forEach(lineKey => {
                const words = page.lines[lineKey];
                // 3. الدوران على الكلمات
                if (Array.isArray(words)) {
                    words.forEach(word => {
                        if (word.verse_key) {
                            // تحليل المفتاح "88:25" إلى سورة وآية
                            const parts = word.verse_key.split(':');
                            if (parts.length === 2) {
                                const surah = parseInt(parts[0]);
                                const ayah = parseInt(parts[1]);
                                
                                if (!foundVerses[surah]) foundVerses[surah] = new Set();
                                foundVerses[surah].add(ayah);
                            }
                        }
                    });
                }
            });
        }
    });

    console.log("📊 تم الانتهاء من جمع البيانات. جاري إعداد التقرير...");
    
    let errorsFound = false;
    let missingReport = [];

    // 4. المقارنة مع المرجع
    for (let i = 1; i <= 114; i++) {
        const expected = REFERENCE_COUNTS[i];
        const actualSet = foundVerses[i] || new Set();
        const actual = actualSet.size;

        if (actual !== expected) {
            errorsFound = true;
            let missingList = [];
            for (let v = 1; v <= expected; v++) {
                if (!actualSet.has(v)) missingList.push(v);
            }
            missingReport.push({
                surah: i,
                expected: expected,
                found: actual,
                missing: missingList
            });
        }
    }

    // 5. الطباعة المختصرة
    if (!errorsFound) {
        console.log("\n✅✅ النتيجة: المصحف سليم 100%! لا توجد آيات ناقصة.");
    } else {
        console.log("\n❌ تم العثور على نقص في السور التالية:");
        console.log("---------------------------------------------------");
        missingReport.forEach(item => {
            console.log(`🔴 سورة ${item.surah}: المتوقع ${item.expected} | الموجود ${item.found}`);
            console.log(`   ⚠️ أرقام الآيات الناقصة: [ ${item.missing.join(', ')} ]`);
            console.log("---------------------------------------------------");
        });
    }

} catch (error) {
    console.error("❌ خطأ فادح:", error.message);
}