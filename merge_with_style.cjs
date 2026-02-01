const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

// مسارات الملفات
const dbPath = path.join(__dirname, 'qpc-v2-15-lines.db');
const jsonPath = path.join(__dirname, 'qpc-v2.json');
const outputPath = path.join(__dirname, 'public', 'fonts', 'qpc_v2_mushaf.json');

console.log("🎨 جاري بناء المصحف الكامل (نصوص + ألوان + تفاعل)...");

// دالة لاكتشاف علامات الوقف (صلى، قلى، م، لا...) بناءً على الكود الخاص بها
function isStopMark(text) {
    if (!text) return false;
    // نطاق علامات الوقف في اليونيكود أو الرموز المستخدمة في V2
    // تشمل: 06D6-06DC, 06DF-06E8 (علامات الوقف الصغيرة العلوية)
    const regex = /[\u06D6-\u06DC\u06DF-\u06E8\u06E3]/; 
    return regex.test(text);
}

try {
    // 1. تحميل النصوص
    const rawJson = fs.readFileSync(jsonPath, 'utf8');
    const jsonData = JSON.parse(rawJson);
    const wordsMap = new Map();
    const wordsList = Array.isArray(jsonData) ? jsonData : Object.values(jsonData);

    // تجميع الكلمات حسب الآية لتحديد "الرمز الأخير" بدقة (الذي هو الفاصل)
    const verseMap = {}; // { "1:1": [word1, word2, ...], "1:2": [...] }

    wordsList.forEach(word => {
        if (word.id) {
            wordsMap.set(word.id, word);
            
            const vKey = `${word.surah}:${word.ayah}`;
            if (!verseMap[vKey]) verseMap[vKey] = [];
            verseMap[vKey].push(word);
        }
    });

    // تحديد معرفات (IDs) الكلمات التي تمثل "نهاية الآية" (الفاصل)
    const verseEndIds = new Set();
    
    Object.keys(verseMap).forEach(key => {
        const words = verseMap[key];
        // ترتيب الكلمات لضمان أننا نأخذ الأخيرة فعلاً
        words.sort((a, b) => parseInt(a.word) - parseInt(b.word));
        
        if (words.length > 0) {
            const lastWord = words[words.length - 1];
            verseEndIds.add(lastWord.id);
        }
    });

    // 2. الاتصال بقاعدة البيانات وبناء الملف
    const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY);
    const mushafLayout = {};

    db.serialize(() => {
        db.each("SELECT * FROM pages ORDER BY page_number, line_number", (err, row) => {
            if (err) return;

            const pageNum = row.page_number;
            const lineNum = row.line_number;
            const lineType = row.line_type || ""; 

            if (!mushafLayout[pageNum]) mushafLayout[pageNum] = { lines: {} };
            if (!mushafLayout[pageNum].lines[lineNum]) mushafLayout[pageNum].lines[lineNum] = [];

            const startId = row.first_word_id;
            const endId = row.last_word_id;

            if (startId && endId) {
                for (let id = startId; id <= endId; id++) {
                    const wordData = wordsMap.get(id);
                    
                    if (wordData) {
                        let type = "word"; // النوع الافتراضي

                        // --- منطق تحديد الأنواع بدقة ---

                        // 1. هل هو الفاصل (نهاية الآية)؟ -> هذا أهم شيء للتفاعل والنقر
                        if (verseEndIds.has(wordData.id)) {
                            type = "end";
                        }
                        // 2. هل هو علامة وقف؟ -> للتلوين الذهبي
                        else if (isStopMark(wordData.text)) {
                            type = "mark"; // أو "stop_mark" حسب تسمية تطبيقك
                        }
                        // 3. هل السطر عبارة عن اسم سورة؟
                        else if (lineType.includes("surah_name")) {
                            type = "surah_name";
                        }
                        // 4. هل السطر بسملة؟
                        else if (lineType.includes("basmallah")) {
                            type = "bismillah";
                        }

                        // بناء الكائن النهائي
                        mushafLayout[pageNum].lines[lineNum].push({
                            id: wordData.id,
                            line_number: lineNum,
                            page_number: pageNum,
                            position: wordData.word,
                            surah_number: parseInt(wordData.surah),
                            verse_key: `${wordData.surah}:${wordData.ayah}`,
                            text_uthmani: wordData.text,
                            code_v2: wordData.text,
                            char_type: type, // النوع المحدد بدقة
                            
                            // بيانات إضافية للتنسيق
                            line_type: lineType,
                            centered: (row.is_centered === 1)
                        });
                    }
                }
            }
        }, (err, count) => {
            // الحفظ النهائي
            fs.writeFileSync(outputPath, JSON.stringify(mushafLayout, null, 2), 'utf8');
            console.log("--------------------------------------------------");
            console.log(`✅ تم!`);
            console.log(`✨ تم تمييز علامات الوقف (mark).`);
            console.log(`🔘 تم تفعيل زر الفواصل (end).`);
            console.log(`💾 الملف جاهز في: public/fonts/qpc_v2_mushaf.json`);
            console.log("--------------------------------------------------");
            db.close();
        });
    });

} catch (error) {
    console.error("❌ خطأ:", error.message);
}