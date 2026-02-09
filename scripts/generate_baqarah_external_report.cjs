const fs = require('fs');
const path = require('path');

// --- إعدادات المسارات ---
const JSON_DATA_PATH = path.join(__dirname, '../constants/mutashabiha_data_full.json');
const CUSTOM_DATA_DIR = path.join(__dirname, '../src/data/custom_mutashabihat');
const REPORT_OUTPUT_PATH = path.join(__dirname, 'baqarah_external_report.txt');

const BAQARAH_NUM = 2;

// --- أسماء السور ---
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

async function generateBaqarahReport() {
    console.log("⏳ بدأت أحسب المتشابهات بين البقرة وباقي السور...");

    const stats = {}; // { surahNumber: count }
    for (let i = 1; i <= 114; i++) {
        if (i !== BAQARAH_NUM) stats[i] = 0;
    }

    // 1. قراءة البيانات من ملف الـ JSON الأساسي
    try {
        const rawJson = fs.readFileSync(JSON_DATA_PATH, 'utf8');
        const data = JSON.parse(rawJson);

        if (Array.isArray(data)) {
            data.forEach(entry => {
                if (!entry.sourceAyah || !entry.similarAyahs) return;

                const srcSurah = entry.sourceAyah.surahNumber;

                entry.similarAyahs.forEach(sim => {
                    const simSurah = sim.surahNumber;

                    // لو البقرة هي المصدر، نعد السور التانية
                    if (srcSurah === BAQARAH_NUM && simSurah !== BAQARAH_NUM) {
                        stats[simSurah]++;
                    }
                    // لو البقرة هي الشبيه، نعد السورة المصدر
                    else if (simSurah === BAQARAH_NUM && srcSurah !== BAQARAH_NUM) {
                        stats[srcSurah]++;
                    }
                });
            });
        }
    } catch (e) {
        console.error("❌ حصلت مشكلة في قراءة JSON:", e.message);
    }

    // 2. قراءة الملفات المخصصة (.txt)
    try {
        const files = fs.readdirSync(CUSTOM_DATA_DIR);
        files.forEach(file => {
            if (!file.endsWith('.txt') || file === 'README_FORMAT.txt') return;

            const content = fs.readFileSync(path.join(CUSTOM_DATA_DIR, file), 'utf8');
            const lines = content.split('\n');

            lines.forEach(line => {
                if (!line.includes('|')) return;
                const [source, targets] = line.split('|');
                const [sourceSurah] = source.split(':').map(Number);

                const targetList = targets.split(',');
                targetList.forEach(t => {
                    const [targetSurah] = t.split(':').map(Number);

                    if (sourceSurah === BAQARAH_NUM && targetSurah !== BAQARAH_NUM) {
                        stats[targetSurah]++;
                    } else if (targetSurah === BAQARAH_NUM && sourceSurah !== BAQARAH_NUM) {
                        stats[sourceSurah]++;
                    }
                });
            });
        });
    } catch (e) {
        console.error("❌ حصلت مشكلة في قراءة الملفات المخصصة:", e.message);
    }

    // 3. كتابة التقرير
    let report = `تقرير متشابهات سورة البقرة مع باقي سور المصحف\n`;
    report += `==============================================\n`;
    report += `تم استخراج هذا التقرير بتاريخ: ${new Date().toLocaleString('ar-EG')}\n\n`;
    report += `السورة         | عدد مواضع التشابه مع البقرة\n`;
    report += `----------------------------------------------\n`;

    let totalExternal = 0;
    const sortedStats = Object.entries(stats)
        .filter(([_, count]) => count > 0)
        .sort((a, b) => b[1] - a[1]); // ترتيب تنازلي حسب العدد

    sortedStats.forEach(([sNum, count]) => {
        const sName = SURAH_NAMES[Number(sNum)];
        report += `${sNum.toString().padEnd(2)}. ${sName.padEnd(15)} | ${count}\n`;
        totalExternal += count;
    });

    report += `----------------------------------------------\n`;
    report += `إجمالي عدد المواضع الخارجية مع البقرة: ${totalExternal}\n`;

    fs.writeFileSync(REPORT_OUTPUT_PATH, report, 'utf8');
    console.log(`✅ التقرير خلص وجاهز في: ${REPORT_OUTPUT_PATH}`);
}

generateBaqarahReport();
