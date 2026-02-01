const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'qpc-v2-15-lines.db');
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY);

console.log("🔍 جاري فحص جميع الجداول في قاعدة البيانات...");

db.serialize(() => {
    // جلب أسماء كل الجداول
    db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, tables) => {
        if (err) {
            console.error("❌ خطأ:", err);
            return;
        }

        if (tables.length === 0) {
            console.log("⚠️ قاعدة البيانات فارغة!");
            return;
        }

        console.log(`✅ تم العثور على ${tables.length} جدول/جداول:\n`);

        // فحص كل جدول لمعرفة أعمدته
        let checkedCount = 0;
        tables.forEach(table => {
            db.all(`PRAGMA table_info(${table.name})`, (e, cols) => {
                console.log(`📂 جدول: [ ${table.name} ]`);
                console.log(`   الأعمدة: ` + cols.map(c => c.name).join(', '));
                console.log("---------------------------------------------------");
                
                checkedCount++;
                if (checkedCount === tables.length) {
                    console.log("\n💡 انسخ هذه النتيجة وأرسلها لي لأعطيك كود الاستخراج الصحيح.");
                    db.close();
                }
            });
        });
    });
});