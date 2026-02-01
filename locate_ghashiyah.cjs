const fs = require('fs');
const path = require('path');

const inputPath = path.join(__dirname, 'public', 'fonts', 'qpc_v2_mushaf.json');

try {
    const rawData = fs.readFileSync(inputPath, 'utf8');
    const data = JSON.parse(rawData);

    console.log("🕵️‍♂️ جاري البحث عن آيات الغاشية (25 و 26)...");

    let foundLocations = [];

    // البحث في كل الصفحات
    Object.keys(data).forEach(pageNum => {
        const page = data[pageNum];
        if (page.lines) {
            Object.keys(page.lines).forEach(lineNum => {
                const words = page.lines[lineNum];
                if (Array.isArray(words)) {
                    words.forEach(word => {
                        if (word.verse_key === "88:25" || word.verse_key === "88:26") {
                            // وجدناها!
                            foundLocations.push({
                                ayah: word.verse_key,
                                page: pageNum,
                                line: lineNum,
                                text: word.text || word.code_v2 // النص أو الكود
                            });
                        }
                    });
                }
            });
        }
    });

    console.log("\n📊 تقرير الموقع:");
    if (foundLocations.length > 0) {
        foundLocations.forEach(loc => {
            console.log(`📍 الآية ${loc.ayah} موجودة حالياً في: الصفحة [${loc.page}] - السطر [${loc.line}]`);
        });
    } else {
        console.log("❌ غريب جداً! السكربت السابق قال أنها موجودة، لكنني لا أجدها الآن!");
    }

} catch (error) {
    console.error("❌ خطأ:", error.message);
}