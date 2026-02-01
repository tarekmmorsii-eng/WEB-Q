const fs = require('fs');
const path = require('path');

// مسار الملف الحالي
const inputPath = path.join(__dirname, 'public', 'fonts', 'qpc_v2_mushaf.json');
const outputPath = path.join(__dirname, 'public', 'fonts', 'qpc_v2_mushaf_final_clean.json');

console.log("🧹 بدء عملية حذف كائنات 'end' (الفواصل القديمة) من الهيكل...");

try {
    const rawData = fs.readFileSync(inputPath, 'utf8');
    const data = JSON.parse(rawData);

    let removedCount = 0;

    // الدوران على كل الصفحات
    Object.keys(data).forEach(pageKey => {
        const page = data[pageKey];
        if (page.lines) {
            Object.keys(page.lines).forEach(lineKey => {
                const words = page.lines[lineKey];
                
                // الفلترة: نحتفظ فقط بالكلمات التي ليست "end"
                const cleanWords = words.filter(word => {
                    if (word.char_type === 'end') {
                        removedCount++;
                        return false; // احذف هذا الكائن
                    }
                    return true; // ابقِ هذا الكائن (نص قرآني)
                });

                // تحديث السطر بالقائمة النظيفة
                page.lines[lineKey] = cleanWords;
            });
        }
    });

    console.log(`✅ تم حذف ${removedCount} فاصل قديم (كائنات char_type: end).`);
    
    fs.writeFileSync(outputPath, JSON.stringify(data, null, 2), 'utf8');
    
    console.log("🎉 الملف النظيف جاهز باسم: qpc_v2_mushaf_final_clean.json");
    console.log("⚠️ استبدل الملف القديم بهذا الملف، واستمتع بمصحف نظيف تماماً!");

} catch (error) {
    console.error("❌ خطأ:", error.message);
}