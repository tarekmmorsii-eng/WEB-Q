const fs = require('fs');
const path = require('path');

// مسار الملف الموجود حالياً (الذي نريد فحصه)
const inputPath = path.join(__dirname, 'public', 'fonts', 'qpc_v2_mushaf.json');

// قاعدة البيانات المرجعية (عدد آيات كل سورة من 1 إلى 114)
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

console.log("🔍 بدء عملية الجرد الشامل للمصحف...");

try {
    const rawData = fs.readFileSync(inputPath, 'utf8');
    const data = JSON.parse(rawData);
    
    // تجميع الآيات من الصفحات (لأن الملف مقسم صفحات)
    let foundVerses = {}; // { surah_num: Set(ayah_nums) }

    // تحديد طريقة قراءة الملف (هل هو مصفوفة أم كائن صفحات)
    let allVerses = [];
    if (Array.isArray(data)) {
        allVerses = data;
    } else {
        // نفترض أنه كائن صفحات كما اكتشفنا سابقاً
        Object.values(data).forEach(pageVerses => {
            if (Array.isArray(pageVerses)) {
                allVerses.push(...pageVerses);
            }
        });
    }

    // فرز الآيات الموجودة
    allVerses.forEach(verse => {
        const surah = verse.surah_number || verse.sura_number;
        const ayah = verse.ayah_number || verse.ayah;
        
        if (!foundVerses[surah]) {
            foundVerses[surah] = new Set();
        }
        foundVerses[surah].add(ayah);
    });

    console.log(`📊 تم العثور على بيانات لـ ${Object.keys(foundVerses).length} سورة.`);
    
    let errorsFound = false;
    let totalMissing = 0;

    // المقارنة مع المرجع (من 1 إلى 114)
    for (let i = 1; i <= 114; i++) {
        const expectedCount = REFERENCE_COUNTS[i];
        const actualSet = foundVerses[i] || new Set();
        const actualCount = actualSet.size;

        if (actualCount !== expectedCount) {
            errorsFound = true;
            console.error(`\n🚨 كارثة في سورة رقم ${i}:`);
            console.error(`   - المتوقع: ${expectedCount} آية`);
            console.error(`   - الموجود: ${actualCount} آية`);
            
            // تحديد أرقام الآيات الناقصة بالضبط
            let missingAyahs = [];
            for (let v = 1; v <= expectedCount; v++) {
                if (!actualSet.has(v)) {
                    missingAyahs.push(v);
                }
            }
            if (missingAyahs.length > 0) {
                console.error(`   - الآيات المفقودة أرقامها: [ ${missingAyahs.join(', ')} ]`);
                totalMissing += missingAyahs.length;
            } else {
                console.error(`   - العدد متطابق لكن ربما هناك تكرار في أرقام الآيات!`);
            }
        }
    }

    console.log("\n--------------------------------------------------");
    if (errorsFound) {
        console.log(`❌ النتيجة النهائية: الملف غير سليم.`);
        console.log(`⚠️ مجموع الآيات المفقودة في المصحف كاملاً: ${totalMissing} آية.`);
        console.log("يجب إصلاح هذه الآيات قبل الاعتماد على الملف.");
    } else {
        console.log(`✅ النتيجة النهائية: المصحف سليم 100%.`);
        console.log(`كل السور (114) مكتملة، وكل الآيات (6236) موجودة.`);
    }
    console.log("--------------------------------------------------");

} catch (error) {
    console.error("❌ حدث خطأ أثناء قراءة الملف:", error.message);
}