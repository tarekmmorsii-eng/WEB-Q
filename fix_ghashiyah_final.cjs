const fs = require('fs');
const path = require('path');

const inputPath = path.join(__dirname, 'public', 'fonts', 'qpc_v2_mushaf.json');
const outputPath = path.join(__dirname, 'public', 'fonts', 'qpc_v2_mushaf_fixed.json');

console.log("🚑 جاري بدء عملية نقل آيات الغاشية...");

try {
    const rawData = fs.readFileSync(inputPath, 'utf8');
    const data = JSON.parse(rawData);

    // 1. تنظيف صفحة 592 (المصدر الخاطئ)
    // ------------------------------------------------
    const page592 = data['592'];
    let verse25_sample = null;
    let verse26_sample = null;

    if (page592 && page592.lines) {
        console.log("🧹 جاري تنظيف صفحة 592 من التكرارات...");
        Object.keys(page592.lines).forEach(lineNum => {
            let words = page592.lines[lineNum];
            // نحتفظ بنسخة من الآيات قبل الحذف لنستخدمها
            const v25 = words.find(w => w.verse_key === "88:25");
            const v26 = words.find(w => w.verse_key === "88:26");
            
            if (v25 && !verse25_sample) verse25_sample = { ...v25, page_number: 593 }; // نحدث رقم الصفحة
            if (v26 && !verse26_sample) verse26_sample = { ...v26, page_number: 593 };

            // نحذف الكلمات التي تنتمي لهذه الآيات
            page592.lines[lineNum] = words.filter(w => w.verse_key !== "88:25" && w.verse_key !== "88:26");
        });
    }

    // تأكد أننا وجدنا العينات
    if (!verse25_sample || !verse26_sample) {
        throw new Error("❌ لم أستطع العثور على الآيات في 592 لنسخها! تأكد من الملف.");
    }

    // 2. الحقن في صفحة 593 (الهدف الصحيح)
    // ------------------------------------------------
    const page593 = data['593'];
    if (!page593) {
        throw new Error("❌ صفحة 593 غير موجودة في الملف!");
    }

    console.log("💉 جاري حقن الآيات في صفحة 593...");

    // سنضيفهم في السطر الأول أو الثاني (حيث توجد بداية الصفحة)
    // نبحث عن السطر الذي يحتوي على الآية 24 أو 23 لنضعهم بعدها
    let targetLine = '1'; // افتراضي
    
    // محاولة ذكية لتحديد السطر
    if (page593.lines) {
        Object.keys(page593.lines).forEach(lineNum => {
            const words = page593.lines[lineNum];
            if (words.some(w => w.verse_key === "88:23" || w.verse_key === "88:24")) {
                targetLine = lineNum;
            }
        });
    }

    if (!page593.lines[targetLine]) page593.lines[targetLine] = [];

    // إضافة الآيات (نتأكد من عدم وجودهم مسبقاً)
    const existing25 = page593.lines[targetLine].find(w => w.verse_key === "88:25");
    if (!existing25) page593.lines[targetLine].push(verse25_sample);

    const existing26 = page593.lines[targetLine].find(w => w.verse_key === "88:26");
    if (!existing26) page593.lines[targetLine].push(verse26_sample);

    // 3. الترتيب النهائي لصفحة 593
    // ------------------------------------------------
    console.log("🔄 جاري إعادة ترتيب كلمات صفحة 593...");
    Object.keys(page593.lines).forEach(lineNum => {
        page593.lines[lineNum].sort((a, b) => {
            // ترتيب حسب الآية
            const [surahA, ayahA] = a.verse_key.split(':').map(Number);
            const [surahB, ayahB] = b.verse_key.split(':').map(Number);

            if (surahA !== surahB) return surahA - surahB;
            if (ayahA !== ayahB) return ayahA - ayahB;
            
            // ترتيب داخلي (اختياري لو الكلمات لها ترتيب)
            return (a.char_type_name === 'end' ? 1 : -1); 
        });
    });

    // حفظ الملف
    fs.writeFileSync(outputPath, JSON.stringify(data, null, 2), 'utf8');
    console.log("🎉 تمت العملية بنجاح!");
    console.log("📁 الملف الجديد: qpc_v2_mushaf_fixed.json");
    console.log("⚠️ قم الآن بحذف القديم واستخدام هذا الملف الجديد.");

} catch (error) {
    console.error("❌ حدث خطأ:", error.message);
}