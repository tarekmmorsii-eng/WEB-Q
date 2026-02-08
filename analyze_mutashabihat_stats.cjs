const fs = require('fs');
const path = require('path');

const REPORT_PATH = path.join(__dirname, 'scripts/baqarah_imran_full.txt');

function getStats() {
    if (!fs.existsSync(REPORT_PATH)) {
        console.error("Report file not found. Please run the analysis script first.");
        return;
    }

    const content = fs.readFileSync(REPORT_PATH, 'utf8');
    const lines = content.split('\n');
    const phraseStats = {};

    lines.forEach(line => {
        if (line.includes('الجملة المتشابهة:')) {
            const phrase = line.split('الجملة المتشابهة:')[1].trim();
            if (phrase) {
                phraseStats[phrase] = (phraseStats[phrase] || 0) + 1;
            }
        }
    });

    const sortedStats = Object.entries(phraseStats)
        .sort(([, a], [, b]) => b - a);

    console.log("--- إحصائيات المتشابهات بين البقرة وآل عمران ---");
    console.log(`إجمالي الجمل الفريدة المكتشفة: ${sortedStats.length}`);
    console.log("-------------------------------------------");

    // Display top 30
    sortedStats.slice(0, 30).forEach(([phrase, count], index) => {
        console.log(`${index + 1}. [${count} مرات] - ${phrase}`);
    });
}

getStats();
