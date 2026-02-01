const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'qpc-v2-15-lines.db');
const jsonPath = path.join(__dirname, 'qpc-v2.json');
const outputPath = path.join(__dirname, 'public', 'fonts', 'qpc_v2_mushaf.json');

// أسماء السور (بدون كلمة سورة، السكربت سيضيفها)
const SURAH_NAMES = [
    "??", "الفاتحة", "البقرة", "آل عمران", "النساء", "المائدة", "الأنعام", "الأعراف", "الأنفال", "التوبة", "يونس", "هود", 
    "يوسف", "الرعد", "إبراهيم", "الحجر", "النحل", "الإسراء", "الكهف", "مريم", "طه", "الأنبياء", "الحج", "المؤمنون", 
    "النور", "الفرقان", "الشعراء", "النمل", "القصص", "العنكبوت", "الروم", "لقمان", "السجدة", "الأحزاب", "سبأ", "فاطر", 
    "يس", "الصافات", "ص", "الزمر", "غافر", "فصلت", "الشورى", "الزخرف", "الدخان", "الجاثية", "الأحقاف", "محمد", 
    "الفتح", "الحجرات", "ق", "الذاريات", "الطور", "النجم", "القمر", "الرحمن", "الواقعة", "الحديد", "المجادلة", 
    "الحشر", "الممتحنة", "الصف", "الجمعة", "المنافقون", "التغابن", "الطلاق", "التحريم", "الملك", "القلم", "الحاقة", 
    "المعارج", "نوح", "الجن", "المزمل", "المدثر", "القيامة", "الإنسان", "المرسلات", "النبأ", "النازعات", "عبس", 
    "التكوير", "الإنفطار", "المطففين", "الإنشقاق", "البروج", "الطارق", "الأعلى", "الغاشية", "الفجر", "البلد", "الشمس", 
    "الليل", "الضحى", "الشرح", "التين", "العلق", "القدر", "البينة", "الزلزلة", "العاديات", "القارعة", "التكاثر", 
    "العصر", "الهمزة", "الفيل", "قريش", "الماعون", "الكوثر", "الكافرون", "النصر", "المسد", "الإخلاص", "الفلق", "الناس"
];

function isStopMark(text) {
    if (!text) return false;
    return /[\u06D6-\u06DC\u06DF-\u06E8\u06E3]/.test(text);
}

function generateSafeId(pageNum, lineNum, typeIndex) {
    return 9000000 + (pageNum * 1000) + (lineNum * 10) + typeIndex;
}

console.log("💎 جاري إنشاء النسخة الماسية: إضافة (سورة) للعناوين...");

try {
    const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    const wordsMap = new Map();
    const wordsList = Array.isArray(jsonData) ? jsonData : Object.values(jsonData);
    const verseMap = {};

    wordsList.forEach(word => {
        if (word.id) {
            wordsMap.set(parseInt(word.id), word);
            const key = `${word.surah}:${word.ayah}`;
            if (!verseMap[key]) verseMap[key] = [];
            verseMap[key].push(word);
        }
    });

    const verseEndIds = new Set();
    Object.keys(verseMap).forEach(key => {
        const vWords = verseMap[key];
        vWords.sort((a, b) => parseInt(a.word) - parseInt(b.word));
        if (vWords.length > 0) verseEndIds.add(parseInt(vWords[vWords.length - 1].id));
    });

    const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY);
    const mushafLayout = {};

    db.serialize(() => {
        db.each("SELECT * FROM pages ORDER BY page_number, line_number", (err, row) => {
            if (err) return;

            const pageNum = row.page_number;
            const lineNum = row.line_number;
            const lineType = (row.line_type || "").toLowerCase();
            const surahNum = row.surah_number || 0; 
            
            // هنا التغيير: تجهيز الاسم الكامل (سورة + الاسم)
            const rawName = SURAH_NAMES[surahNum] || "";
            const fullName = rawName !== "??" ? `سورة ${rawName}` : "";

            if (!mushafLayout[pageNum]) mushafLayout[pageNum] = { lines: {} };
            if (!mushafLayout[pageNum].lines[lineNum]) mushafLayout[pageNum].lines[lineNum] = [];

            // 1. معالجة اسم السورة
            if (lineType.includes("surah_name")) {
                const safeId = generateSafeId(pageNum, lineNum, 1);
                mushafLayout[pageNum].lines[lineNum].push({
                    id: safeId,
                    line_number: lineNum,
                    page_number: pageNum,
                    position: 1,
                    surah_number: surahNum,
                    verse_key: `${surahNum}:0`,
                    text_uthmani: fullName, // ✅ يضع "سورة الغاشية"
                    code_v2: fullName,      // ✅ يضع "سورة الغاشية"
                    char_type: "surah_name",
                    line_type: "surah_name",
                    centered: true
                });
                return;
            }

            // 2. معالجة البسملة
            if (lineType.includes("basmallah")) {
                const safeId = generateSafeId(pageNum, lineNum, 2);
                mushafLayout[pageNum].lines[lineNum].push({
                    id: safeId,
                    line_number: lineNum,
                    page_number: pageNum,
                    position: 1,
                    surah_number: surahNum,
                    verse_key: `${surahNum}:0`,
                    text_uthmani: "بسم الله الرحمن الرحيم",
                    code_v2: "﷽",
                    char_type: "bismillah",
                    line_type: "basmallah",
                    centered: true
                });
                return;
            }

            // 3. معالجة الكلمات
            const startId = row.first_word_id;
            const endId = row.last_word_id;

            if (startId && endId) {
                for (let id = startId; id <= endId; id++) {
                    const wordData = wordsMap.get(id);
                    if (wordData) {
                        let type = "word";
                        if (verseEndIds.has(wordData.id)) type = "end";
                        else if (isStopMark(wordData.text)) type = "mark";

                        mushafLayout[pageNum].lines[lineNum].push({
                            id: parseInt(wordData.id),
                            line_number: lineNum,
                            page_number: pageNum,
                            position: wordData.word,
                            surah_number: parseInt(wordData.surah),
                            verse_key: `${wordData.surah}:${wordData.ayah}`,
                            text_uthmani: wordData.text,
                            code_v2: wordData.text,
                            char_type: type,
                            line_type: lineType,
                            centered: (row.is_centered === 1)
                        });
                    }
                }
            }

        }, (err, count) => {
            fs.writeFileSync(outputPath, JSON.stringify(mushafLayout, null, 2), 'utf8');
            console.log("--------------------------------------------------");
            console.log(`🎉 تم الانتهاء!`);
            console.log(`✅ الآن ستظهر الأسماء بصيغة: "سورة الغاشية".`);
            console.log(`💾 الملف جاهز في: public/fonts/qpc_v2_mushaf.json`);
            console.log("--------------------------------------------------");
            db.close();
        });
    });

} catch (error) {
    console.error("❌ خطأ:", error.message);
}