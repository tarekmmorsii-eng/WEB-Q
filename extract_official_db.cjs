const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

// اسم ملف قاعدة البيانات الذي حملته
const dbPath = path.join(__dirname, 'qpc-v2-15-lines.db');
const outputPath = path.join(__dirname, 'public', 'fonts', 'qpc_v2_mushaf.json');

console.log("🔍 جاري الاتصال بقاعدة البيانات الرسمية لاستخراج المصحف...");

// فتح قاعدة البيانات
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
    if (err) {
        console.error("❌ فشل فتح الملف. تأكد أن اسمه صحيح (qpc-v2-15-lines.db) وأنه موجود بجانب السكربت.");
        console.error(err.message);
        return;
    }
    console.log("✅ تم الاتصال بنجاح.");
});

// العملية الرئيسية
db.serialize(() => {
    // 1. البحث عن اسم الجدول الصحيح
    db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, tables) => {
        if (err) return console.error(err);
        
        // عادة يكون اسم الجدول 'glyph' أو 'mushaf_layout' أو ما شابه
        // سنبحث عن الجدول الذي يحتوي على بيانات
        const table = tables.find(t => t.name.includes('glyph') || t.name.includes('data') || t.name.includes('word'));
        const tableName = table ? table.name : tables[0].name; // نأخذ الأول إذا لم نجد اسماً مميزاً

        console.log(`📄 تم العثور على الجدول: [ ${tableName} ]`);
        console.log("⏳ جاري سحب البيانات وتحويلها (قد يستغرق ثواني)...");

        // 2. سحب كل البيانات مرتبة
        // سنفترض أسماء الأعمدة القياسية (page, line, sura, ayah, text/code)
        // إذا اختلفت الأسماء، السكربت سيطبع الأعمدة المتاحة لنعدلها
        const query = `SELECT * FROM ${tableName} ORDER BY page_number, line_number, position`;

        db.all(query, (err, rows) => {
            if (err) {
                console.error("⚠️ حدث خطأ أثناء القراءة، قد تكون أسماء الأعمدة مختلفة.");
                console.error("الأعمدة المتاحة في هذا الجدول هي:");
                // محاولة معرفة الأعمدة
                db.all(`PRAGMA table_info(${tableName})`, (e, cols) => {
                    cols.forEach(c => console.log(` - ${c.name}`));
                });
                return;
            }

            // 3. بناء هيكل JSON
            const mushaf = {};

            rows.forEach(row => {
                // التأكد من أسماء الأعمدة (قد تكون page_number أو page_no)
                const pageNum = row.page_number || row.page || row.page_no;
                const lineNum = row.line_number || row.line || row.line_no;
                
                if (!pageNum) return;

                if (!mushaf[pageNum]) {
                    mushaf[pageNum] = { lines: {} };
                }
                if (!mushaf[pageNum].lines[lineNum]) {
                    mushaf[pageNum].lines[lineNum] = [];
                }

                // تجهيز الكلمة
                const wordObj = {
                    id: row.id,
                    line_number: lineNum,
                    page_number: pageNum,
                    position: row.position || row.word_position || 0,
                    surah_number: row.sura_number || row.surah_number || row.sura,
                    verse_key: `${row.sura_number || row.sura}:${row.ayah_number || row.ayah}`,
                    text_uthmani: row.text || row.code_v2 || row.code_hex, // النص أو الكود
                    code_v2: row.code_v2 || row.text, // غالباً النص في V2 هو الكود نفسه
                    char_type: mapType(row.type) // دالة لتحويل نوع الكلمة
                };

                mushaf[pageNum].lines[lineNum].push(wordObj);
            });

            // 4. حفظ الملف
            fs.writeFileSync(outputPath, JSON.stringify(mushaf, null, 2), 'utf8');
            console.log("--------------------------------------------------");
            console.log(`🎉 تم استخراج الملف الرسمي بنجاح!`);
            console.log(`💾 تم الحفظ في: public/fonts/qpc_v2_mushaf.json`);
            console.log("--------------------------------------------------");
            
            // إغلاق القاعدة
            db.close();
        });
    });
});

// دالة مساعدة لضبط أنواع الكلمات (word, end, start...)
function mapType(dbType) {
    if (!dbType) return "word";
    const t = dbType.toLowerCase();
    if (t.includes("end")) return "end"; // رأس آية
    if (t.includes("basmallah")) return "word"; // نعتبرها كلمة لتظهر
    if (t.includes("start") || t.includes("surah")) return "mark"; // اسم سورة
    return "word";
}