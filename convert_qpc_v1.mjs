/**
 * سكريبت تحويل بيانات QPC V1 إلى JSON للاستخدام في المتصفح
 * يدمج بيانات SQLite مع Glyphs JSON
 */

import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// مسارات الملفات
const dbPath = path.join(__dirname, 'official_data/qul_kfgqpc_v1/qpc-v1-15-lines.db/qpc-v1-15-lines.db');
const glyphsPath = path.join(__dirname, 'official_data/qul_kfgqpc_v1/qpc-v1-glyph-codes-wbw.json/qpc-v1-glyph-codes-wbw.json');
const outputPath = path.join(__dirname, 'public/qpc_v1_mushaf.json');

console.log('جاري تحميل ملف Glyphs...');
const glyphsData = JSON.parse(fs.readFileSync(glyphsPath, 'utf-8'));

// تحويل Glyphs إلى map by ID
const glyphsById = {};
Object.values(glyphsData).forEach(glyph => {
    glyphsById[glyph.id] = glyph;
});
console.log(`تم تحميل ${Object.keys(glyphsById).length} كلمة`);

console.log('جاري قراءة قاعدة البيانات...');
const db = new Database(dbPath, { readonly: true });

// الحصول على جميع الأسطر مرتبة
const lines = db.prepare(`
    SELECT * FROM pages 
    ORDER BY page_number, line_number
`).all();

console.log(`تم قراءة ${lines.length} سطر`);

// بناء هيكل البيانات
const mushafData = {
    metadata: {
        name: "Quran Complex V1 (1405 print)",
        totalPages: 604,
        linesPerPage: 15,
        fontName: "QPC_V1"
    },
    pages: {}
};

// تجميع البيانات حسب الصفحة
lines.forEach(line => {
    const pageNum = line.page_number;

    if (!mushafData.pages[pageNum]) {
        mushafData.pages[pageNum] = {
            pageNumber: pageNum,
            lines: []
        };
    }

    // بناء بيانات السطر
    const lineData = {
        lineNumber: line.line_number,
        lineType: line.line_type,
        isCentered: line.is_centered === 1,
        words: []
    };

    // إضافة السورة لأسطر surah_name
    if (line.line_type === 'surah_name' && line.surah_number) {
        lineData.surahNumber = line.surah_number;
    }

    // إضافة الكلمات
    if (line.first_word_id && line.last_word_id) {
        const firstId = parseInt(line.first_word_id);
        const lastId = parseInt(line.last_word_id);

        for (let id = firstId; id <= lastId; id++) {
            const glyph = glyphsById[id];
            if (glyph) {
                lineData.words.push({
                    id: glyph.id,
                    surah: parseInt(glyph.surah),
                    ayah: parseInt(glyph.ayah),
                    word: parseInt(glyph.word),
                    text: glyph.text,
                    location: glyph.location
                });
            }
        }
    }

    mushafData.pages[pageNum].lines.push(lineData);
});

// تحويل الصفحات إلى مصفوفة
const pagesArray = [];
for (let i = 1; i <= 604; i++) {
    if (mushafData.pages[i]) {
        pagesArray.push(mushafData.pages[i]);
    }
}
mushafData.pages = pagesArray;

// حفظ الملف
console.log('جاري حفظ الملف...');
fs.writeFileSync(outputPath, JSON.stringify(mushafData, null, 0));

const stats = fs.statSync(outputPath);
console.log(`تم الحفظ بنجاح! الحجم: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);

// إحصائيات
let totalWords = 0;
let totalLines = 0;
pagesArray.forEach(page => {
    totalLines += page.lines.length;
    page.lines.forEach(line => {
        totalWords += line.words.length;
    });
});

console.log(`
=== إحصائيات ===
✅ عدد الصفحات: ${pagesArray.length}
✅ عدد الأسطر: ${totalLines}
✅ عدد الكلمات: ${totalWords}
`);

db.close();
