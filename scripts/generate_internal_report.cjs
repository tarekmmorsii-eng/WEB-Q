const fs = require('fs');
const path = require('path');

// --- إعدادات المسارات ---
const JSON_DATA_PATH = path.join(__dirname, '../constants/mutashabiha_data_full.json');
const CUSTOM_DATA_DIR = path.join(__dirname, '../src/data/custom_mutashabihat');
const REPORT_OUTPUT_PATH = path.join(__dirname, 'internal_mutashabihat_report.txt');

// --- أسماء السور (للعرض فقط) ---
const SURAH_NAMES = [
    "", "الفاتحة", "البقرة", "آل عمران", "النساء", "المائدة", "الأنعام", "الأعراف", "الأنفال", "التوبة", "يونس",
    "هود", "يوسف", "الرعد", "إبراهيم", "الحجر", "النحل", "الإسراء", "الكهف", "مريم", "طه", "الأنبياء", "الحج",
    "المؤمنون", "النور", "الفرقان", "الشعراء", "النمل", "القصص", "العنكبوت", "الروم", "لقمان", "السجدة",
    "الأحزاب", "سبأ", "فاطر", "يس", "الصافات", "ص", "الزمر", "غافر", "فصلت", "الشورى", "الزخرف", "الدخان",
    "الجاثية", "الأحقاف", "محمد", "الفتح", "الحجرات", "ق", "الذاريات", "الطور", "النجم", "القمر", "الرحمن",
    "الواقعة", "الحديد", "المجادلة", "الحشر", "الممتحنة", "الصف", "الجمعة", "المنافقون", "التغابن", "الطلاق",
    "التحريم", "الملك", "القلم", "الحاقة", "المعارج", "نوح", "الجن", "المزمل", "المدثر", "القيامة", "الإنسان",
    "المرسلات", "النبأ", "النازعات", "عبس", "التكوير", "الانفطار", "المطففين", "الانشقاق", "البروج", "الطارق",
    "الأعلى", "الغاشية", "الفجر", "البلد", "الشمس", "الليل", "الضحى", "الشرح", "التين", "العلق", "القدر",
    "البينة", "الزلزلة", "العاديات", "القارعة", "التكاثر", "العصر", "الهمزة", "الفيل", "قريش", "الماعون",
    "الكوثر", "الكافرون", "النصر", "المسد", "الإخلاص", "الفلق", "الناس"
];

async function generateReport() {
    console.log("⏳ بدأت أجمع البيانات عشان أعمل التقرير...");

    const stats = {}; // { surahNumber: count }
    for (let i = 1; i <= 114; i++) stats[i] = 0;

    // 1. قراءة البيانات من ملف الـ JSON الأساسي
    try {
        const rawJson = fs.readFileSync(JSON_DATA_PATH, 'utf8');
        const data = JSON.parse(rawJson);

        if (Array.isArray(data)) {
            data.forEach(entry => {
                if (!entry.sourceAyah || !entry.similarAyahs) return;
                const sourceSurah = entry.sourceAyah.surahNumber;

                // بنعد الحالات اللي فيها آية شبه آية تانية في نفس السورة
                const hasInternalMatch = entry.similarAyahs.some(sim => sim.surahNumber === sourceSurah);
                if (hasInternalMatch) {
                    stats[sourceSurah]++;
                }
            });
        }
    } catch (e) {
        console.error("❌ حصلت مشكلة وأنا بقرأ ملف الـ JSON:", e.message);
    }

    // 2. قراءة البيانات من الملفات الـ txt في المجلد المخصص
    try {
        const files = fs.readdirSync(CUSTOM_DATA_DIR);
        files.forEach(file => {
            if (!file.endsWith('.txt') || file === 'README_FORMAT.txt') return;

            const content = fs.readFileSync(path.join(CUSTOM_DATA_DIR, file), 'utf8');
            const lines = content.split('\n');

            lines.forEach(line => {
                if (!line.includes('|')) return;
                const [source, targets] = line.split('|');
                const [sourceSurah, sourceAyah] = source.split(':').map(Number);

                const targetList = targets.split(',');
                const hasInternalMatch = targetList.some(t => {
                    const [tSurah] = t.split(':').map(Number);
                    return tSurah === sourceSurah;
                });

                if (hasInternalMatch) {
                    stats[sourceSurah]++;
                }
            });
        });
    } catch (e) {
        console.error("❌ حصلت مشكلة وأنا بقرأ المجلد المخصص:", e.message);
    }

    // 3. كتابة التقرير النهائي
    let report = `تقرير متشابهات السور الداخلية\n`;
    report += `================================\n`;
    report += `تم استخراج هذا التقرير بتاريخ: ${new Date().toLocaleString('ar-EG')}\n\n`;
    report += `السورة | عدد المتشابهات الداخلية\n`;
    report += `--------------------------------\n`;

    let totalInternal = 0;
    for (let i = 1; i <= 114; i++) {
        if (stats[i] > 0) {
            report += `${i}. ${SURAH_NAMES[i].padEnd(15)} | ${stats[i]}\n`;
            totalInternal += stats[i];
        }
    }

    report += `--------------------------------\n`;
    report += `الإجمالي الكلي للمواضع الداخلية: ${totalInternal}\n`;

    fs.writeFileSync(REPORT_OUTPUT_PATH, report, 'utf8');
    console.log(`✅ التقرير خلص وجاهز في: ${REPORT_OUTPUT_PATH}`);
}

generateReport();
