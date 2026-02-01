const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

// مسارات الملفات
const dbPath = path.join(__dirname, 'qpc-v2-15-lines.db'); // ملف الهيكل (قاعدة البيانات)
const jsonPath = path.join(__dirname, 'qpc-v2.json');       // ملف النصوص
const outputPath = path.join(__dirname, 'public', 'fonts', 'qpc_v2_mushaf.json'); // الملف الناتج

console.log("🔄 بدء عملية دمج الهيكل الرسمي مع النصوص...");

try {
    // 1. تحميل النصوص في الذاكرة (Map) لسرعة الوصول
    console.log("📖 قراءة ملف النصوص (qpc-v2.json)...");
    const rawJson = fs.readFileSync(jsonPath, 'utf8');
    const jsonData = JSON.parse(rawJson);
    
    // إنشاء خريطة تربط الـ ID بالنص الكامل للكلمة
    const wordsMap = new Map();
    
    // نتأكد هل الملف مصفوفة أم كائن
    const wordsList = Array.isArray(jsonData) ? jsonData : Object.values(jsonData);
    
    wordsList.forEach(word => {
        if (word.id) {
            wordsMap.set(word.id, word);
        }
    });
    
    console.log(`✅ تم تحميل ${wordsMap.size} كلمة في الذاكرة.`);

    // 2. الاتصال بقاعدة البيانات لجلب الهيكل
    console.log("🔌 الاتصال بقاعدة البيانات...");
    const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY);

    const mushafLayout = {};

    db.serialize(() => {
        // ترتيب البيانات حسب الصفحة والسطر
        db.each("SELECT * FROM pages ORDER BY page_number, line_number", (err, row) => {
            if (err) {
                console.error("❌ خطأ في قراءة السطر:", err);
                return;
            }

            const pageNum = row.page_number;
            const lineNum = row.line_number;

            // تجهيز هيكل الصفحة
            if (!mushafLayout[pageNum]) {
                mushafLayout[pageNum] = { lines: {} };
            }
            if (!mushafLayout[pageNum].lines[lineNum]) {
                mushafLayout[pageNum].lines[lineNum] = [];
            }

            // تحديد الكلمات في هذا السطر
            const startId = row.first_word_id;
            const endId = row.last_word_id;

            // إذا كان السطر يحتوي على كلمات (ليس فارغاً)
            if (startId && endId) {
                for (let id = startId; id <= endId; id++) {
                    const wordData = wordsMap.get(id);
                    
                    if (wordData) {
                        // بناء كائن الكلمة النهائي كما يحتاجه التطبيق
                        mushafLayout[pageNum].lines[lineNum].push({
                            id: wordData.id,
                            line_number: lineNum,
                            page_number: pageNum,
                            position: wordData.word, // ترتيب الكلمة في الآية
                            surah_number: parseInt(wordData.surah),
                            verse_key: `${wordData.surah}:${wordData.ayah}`,
                            text_uthmani: wordData.text, // الرمز
                            code_v2: wordData.text,      // الرمز لخطوط V2
                            char_type: "word"
                        });
                    } else {
                        // إذا لم نجد الكلمة (قد تكون رأس آية أو بسملة غير موجودة في JSON)
                        // نتجاهلها حالياً لأن المهم هو الآيات
                    }
                }
            } else {
                // التعامل مع الأسطر الخاصة (مثل أسماء السور)
                // إذا كان التطبيق يحتاج معالجة خاصة لـ row.line_type يمكن إضافتها هنا
                // حالياً سنتركها فارغة ليعتمد التطبيق على الرسم
            }

        }, (err, count) => {
            // عند الانتهاء من كل الأسطر
            if (err) console.error(err);
            
            console.log(`✅ تمت معالجة ${count} سطر.`);
            
            // 3. حفظ الملف النهائي
            fs.writeFileSync(outputPath, JSON.stringify(mushafLayout, null, 2), 'utf8');
            console.log("--------------------------------------------------");
            console.log("🎉 تم إنشاء الملف: public/fonts/qpc_v2_mushaf.json");
            console.log("🚀 هذا الملف يجمع دقة الهيكل الرسمي مع صحة النصوص.");
            console.log("--------------------------------------------------");
            
            db.close();
        });
    });

} catch (error) {
    console.error("❌ حدث خطأ غير متوقع:", error.message);
}