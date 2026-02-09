const fs = require('fs');
const path = require('path');

// --- Configuration ---
const SOURCE_SURAH_NUM = 2; // Al-Baqarah
const MIN_WORDS = 4;
const MAX_WORDS = 25;

// Words to NOT count as 'base' words in short matches
const COMMON_WORDS = new Set([
    'في', 'من', 'على', 'الي', 'إلي', 'عن', 'ما', 'لا', 'يا', 'ان', 'أن', 'و', 'ف', 'ب', 'ل', 'او', 'أو', 'ثم'
]);

// --- Paths ---
const QURAN_JSON_PATH = path.join(__dirname, '../public/quran.json');
const REPORT_PATH = path.join(__dirname, 'baqarah_full_quran_expected_report.txt');

// --- Helper: Levenshtein Distance ---
function getLevenshteinDistance(a, b) {
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;
    const matrix = [];
    for (let i = 0; i <= b.length; i++) matrix[i] = [i];
    for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) === a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j] + 1);
            }
        }
    }
    return matrix[b.length][a.length];
}

// --- Helper: Normalize Arabic Text ---
function normalize(text) {
    if (!text) return "";
    return text
        .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED\u0610-\u061A]/g, '')
        .replace(/[\u0622\u0623\u0625\u0671]/g, '\u0627')
        .replace(/[\u0649]/g, '\u064A')
        .replace(/[\u0629]/g, '\u0647')
        .replace(/[^\u0621-\u064A\s]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
}

async function runFullAnalysis() {
    console.log("⏳ جاري تحميل بيانات المصحف كاملة...");
    let quranData;
    try {
        const raw = fs.readFileSync(QURAN_JSON_PATH, 'utf8');
        quranData = JSON.parse(raw);
    } catch (e) {
        console.error("❌ فشل في قراءة quran.json:", e.message);
        return;
    }

    const baqarah = quranData.data.surahs.find(s => s.number === SOURCE_SURAH_NUM);
    const otherSurahs = quranData.data.surahs.filter(s => s.number !== SOURCE_SURAH_NUM);

    if (!baqarah) {
        console.error("❌ مش قادر ألاقي سورة البقرة في البيانات.");
        return;
    }

    function prepareAyah(ayah) {
        const rawWords = ayah.text.split(' ');
        const processed = [];
        rawWords.forEach(raw => {
            const clean = normalize(raw);
            if (clean.length > 0) processed.push({ raw, norm: clean });
        });
        return { num: ayah.numberInSurah, text: ayah.text, words: processed };
    }

    console.log("🛠️ جاري تجهيز آيات سورة البقرة...");
    const sourceAyahs = baqarah.ayahs.map(prepareAyah);

    const surahStats = {}; // { surahNumber: matchCount }
    const allMatches = [];

    console.log(`🚀 نبدأ التحليل الشامل (البقرة ضد ${otherSurahs.length} سورة)...`);
    console.time("analysis_total");

    for (const targetSurah of otherSurahs) {
        process.stdout.write(`\rفحص سورة: ${targetSurah.name} (${targetSurah.number}/114)...`);

        const targetAyahs = targetSurah.ayahs.map(prepareAyah);
        let surahMatchCount = 0;

        for (const src of sourceAyahs) {
            const srcLen = src.words.length;
            if (srcLen < MIN_WORDS) continue;

            for (let i = 0; i <= srcLen - MIN_WORDS; i++) {
                for (const tgt of targetAyahs) {
                    const tgtLen = tgt.words.length;
                    if (tgtLen < MIN_WORDS) continue;

                    for (let j = 0; j <= tgtLen - MIN_WORDS; j++) {
                        let mismatches = 0;
                        let lastMismatchIdx = -1;
                        let k = 0;
                        const limit = Math.min(MAX_WORDS, srcLen - i, tgtLen - j);

                        let foundMatch = false;
                        let currentLen = 0;

                        for (k = 0; k < limit; k++) {
                            if (src.words[i + k].norm !== tgt.words[j + k].norm) {
                                mismatches++;
                                lastMismatchIdx = k;
                            }
                            if (mismatches > 1) break;

                            currentLen = k + 1;
                            if (currentLen >= MIN_WORDS) {
                                let baseWordsCount = 0;
                                for (let m = 0; m < currentLen; m++) {
                                    if (!COMMON_WORDS.has(src.words[i + m].norm)) baseWordsCount++;
                                }

                                const isSubstantial = (currentLen >= 4 && baseWordsCount >= 3) || (currentLen > 6);
                                if (isSubstantial) {
                                    if (mismatches === 0) {
                                        foundMatch = true;
                                    } else {
                                        const dist = getLevenshteinDistance(src.words[i + lastMismatchIdx].norm, tgt.words[j + lastMismatchIdx].norm);
                                        if (dist <= 2) foundMatch = true;
                                    }
                                }
                            }
                        }

                        if (foundMatch) {
                            surahMatchCount++;
                            // عشان التقرير ميبقاش ضخم جداً، هنسجل بس الإحصائيات
                            // لو محتاج تفاصيل أكتر نقدر نضيفها بس هنا هنكتفي بالعدد
                            j += currentLen; // Skip overlapping in target
                        }
                    }
                }
            }
        }
        surahStats[targetSurah.number] = surahMatchCount;
    }

    console.timeEnd("analysis_total");
    console.log("\n✅ التحليل اكتمل.");

    // --- توليد التقرير ---
    let report = `تقرير المتشابهات التوقعي (سورة البقرة مع كامل المصحف)\n`;
    report += `========================================================\n`;
    report += `بتاريخ: ${new Date().toLocaleString('ar-EG')}\n`;
    report += `القواعد المستخدمة:\n`;
    report += `- الحد الأدنى: ${MIN_WORDS} كلمات.\n`;
    report += `- تصفية الكلمات الشائعة (أقل من ٣ كلمات أساسية في الجمل القصيرة).\n`;
    report += `- السماح باختلاف بسيط (مسافة تعديل <= ٢) في الكلمات.\n\n`;

    report += `السورة         | عدد المتشابهات المتوقعة\n`;
    report += `----------------------------------------\n`;

    const sortedStats = Object.entries(surahStats)
        .sort((a, b) => b[1] - a[1]);

    let totalMatches = 0;
    sortedStats.forEach(([sNum, count]) => {
        if (count > 0) {
            const sName = quranData.data.surahs.find(s => s.number === Number(sNum)).name;
            report += `${sNum.toString().padEnd(3)} . ${sName.padEnd(15)} | ${count}\n`;
            totalMatches += count;
        }
    });

    report += `----------------------------------------\n`;
    report += `الإجمالي الكلي المتوقع لروابط البقرة: ${totalMatches}\n`;

    fs.writeFileSync(REPORT_PATH, report, 'utf8');
    console.log(`✅ التقرير النهائي جاهز في: ${REPORT_PATH}`);
}

runFullAnalysis();
