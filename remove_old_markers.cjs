const fs = require('fs');
const path = require('path');

// الملف الحالي (تأكد أنه الملف الذي أصلحنا ترتيبه مؤخراً)
const inputPath = path.join(__dirname, 'public', 'fonts', 'qpc_v2_mushaf.json');
const outputPath = path.join(__dirname, 'public', 'fonts', 'qpc_v2_mushaf_clean.json');

console.log("🧹 بدء عملية إزالة 'الفواصل القديمة' فقط...");

try {
    const rawData = fs.readFileSync(inputPath, 'utf8');
    const data = JSON.parse(rawData);

    // الرمز المستهدف بالحذف:
    // \u06DD : هو رمز "نهاية الآية" العربي (Arabic End of Ayah)
    // هذا الرمز هو الذي يظهر كدائرة إضافية أو مربع غير مرغوب فيه
    const separatorRegex = /[\u06DD]/g;

    let cleanCount = 0;

    // الدوران على كل الصفحات
    Object.keys(data).forEach(pageKey => {
        const page = data[pageKey];
        if (page.lines) {
            Object.keys(page.lines).forEach(lineKey => {
                const words = page.lines[lineKey];
                if (Array.isArray(words)) {
                    words.forEach(word => {
                        if (word.text_uthmani) {
                            // فحص وجود الفاصل القديم
                            if (separatorRegex.test(word.text_uthmani)) {
                                // نحذف الفاصل فقط، ونترك باقي الكلام وعلامات الوقف
                                word.text_uthmani = word.text_uthmani.replace(separatorRegex, "");
                                cleanCount++;
                            }
                        }
                    });
                }
            });
        }
    });

    console.log(`✅ تم إزالة الفواصل القديمة من ${cleanCount} موضع.`);
    console.log("🛡️ ملاحظة: علامات الوقف (صلى، قلى، م..) لم يتم المساس بها.");

    // حفظ الملف
    fs.writeFileSync(outputPath, JSON.stringify(data, null, 2), 'utf8');
    
    console.log("🎉 تم الحفظ باسم: qpc_v2_mushaf_clean.json");
    console.log("⚠️ استبدل الملف القديم بهذا الملف الجديد.");

} catch (error) {
    console.error("❌ حدث خطأ:", error.message);
}