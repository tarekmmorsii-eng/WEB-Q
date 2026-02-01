const fs = require('fs');
const path = require('path');

const inputPath = path.join(__dirname, 'public', 'fonts', 'qpc_v2_mushaf.json');

try {
    const rawData = fs.readFileSync(inputPath, 'utf8');
    const data = JSON.parse(rawData);

    // سنفحص سورة "الأعلى" (رقم 87) كمثال، لأنها في الأجزاء الأخيرة
    const targetSurah = 87; 
    
    console.log(`🕵️‍♂️ جاري فحص الكود الخفي لنصوص سورة رقم ${targetSurah}...`);

    let found = false;

    // البحث عن أول آية في السورة
    Object.keys(data).forEach(pageKey => {
        const page = data[pageKey];
        if (page.lines && !found) {
            Object.keys(page.lines).forEach(lineKey => {
                const words = page.lines[lineKey];
                words.forEach(word => {
                    // إذا وجدنا كلمة تنتمي للسورة المستهدفة
                    if (word.verse_key && word.verse_key.startsWith(targetSurah + ":") && !found) {
                        
                        console.log(`\n🔎 تحليل كلمة: [ ${word.text_uthmani} ]`);
                        console.log("------------------------------------------------");
                        
                        // طباعة كود كل حرف
                        for (let i = 0; i < word.text_uthmani.length; i++) {
                            const char = word.text_uthmani[i];
                            const code = char.charCodeAt(0).toString(16).toUpperCase().padStart(4, '0');
                            
                            // تحديد نوع الحرف (هل هو عربي أم رمز مشبوه؟)
                            let type = "✅ حرف/تشكيل";
                            // نطاق الرموز المشبوهة والخاصة
                            if (code >= '06D6' && code <= '06ED') type = "⚠️ علامة وقف/رمز";
                            if (code >= 'FD3E' && code <= 'FD3F') type = "⚠️ قوس مزخرف";
                            if (code === '061F') type = "⚠️ علامة سؤال قرآني";
                            
                            console.log(`الحرف: ${char} \t | الكود: \\u${code} \t | التصنيف: ${type}`);
                        }
                        console.log("------------------------------------------------");
                        found = true; // نكتفي بكلمة/آية واحدة
                    }
                });
            });
        }
    });

    if (!found) console.log("❌ لم يتم العثور على السورة المطلوبة.");

} catch (error) {
    console.error("❌ خطأ:", error.message);
}