const fs = require('fs');
const path = require('path');

// مسار الملف الأصلي
const inputPath = path.join(__dirname, 'public', 'fonts', 'qpc_v2_mushaf.json');
const outputPath = path.join(__dirname, 'public', 'fonts', 'qpc_v2_mushaf_fixed.json');

console.log("⏳ جاري قراءة ألبوم الصفحات...");

try {
    const rawData = fs.readFileSync(inputPath, 'utf8');
    let pagesData = JSON.parse(rawData);

    // التأكد من أن الملف هو عبارة عن كائن (Object) كما اكتشفنا
    if (Array.isArray(pagesData)) {
        throw new Error("❌ الملف طلع مصفوفة فجأة! هذا السكربت مخصص لنظام المفاتيح (Object Keys).");
    }

    const pageKeys = Object.keys(pagesData); // ['1', '2', ... '604']
    console.log(`✅ تم اكتشاف ${pageKeys.length} صفحة.`);
    console.log("🔄 جاري الدخول لكل صفحة وترتيب الآيات داخلها...");

    let fixedCount = 0;

    // الدوران على كل صفحة
    pageKeys.forEach(pageNum => {
        const versesInPage = pagesData[pageNum];

        if (Array.isArray(versesInPage) && versesInPage.length > 1) {
            // عملية الترتيب داخل الصفحة الواحدة
            versesInPage.sort((a, b) => {
                // محاولة التقاط رقم السورة (قد يكون اسمه surah_number أو sura_number)
                const surahA = a.surah_number || a.sura_number || 0;
                const surahB = b.surah_number || b.sura_number || 0;

                // أولاً: رتب حسب رقم السورة (الأصغر أولاً)
                if (surahA !== surahB) {
                    return surahA - surahB;
                }

                // ثانياً: إذا كانت نفس السورة، رتب حسب رقم الآية
                const ayahA = a.ayah_number || a.ayah || 0;
                const ayahB = b.ayah_number || b.ayah || 0;
                if (ayahA !== ayahB) {
                    return ayahA - ayahB;
                }

                // ثالثاً: إذا لزم الأمر، حسب الترتيب الداخلي للكلمة
                return (a.position || 0) - (b.position || 0);
            });
            fixedCount++;
        }
    });

    console.log(`✅ تم الانتهاء من فحص وترتيب ${fixedCount} صفحة.`);
    console.log("💾 جاري حفظ الملف الجديد...");

    fs.writeFileSync(outputPath, JSON.stringify(pagesData, null, 2), 'utf8');

    console.log("🎉 تمت العملية بنجاح!");
    console.log("📁 الملف الجديد جاهز باسم: qpc_v2_mushaf_fixed.json");
    console.log("⚠️ الخطوة الأخيرة: احذف الملف القديم، وغيّر اسم الملف الجديد ليصبح qpc_v2_mushaf.json");

} catch (error) {
    console.error("❌ حدث خطأ:", error.message);
}