const fs = require('fs');
const path = require('path');

// اسم الملف الجديد الذي حملته
const inputPath = path.join(__dirname, 'qpc-v2.json');

console.log("📦 جاري فك تغليف الملف الجديد وفحص محتوياته...");

try {
    const rawData = fs.readFileSync(inputPath, 'utf8');
    const data = JSON.parse(rawData);

    console.log(`✅ الملف سليم برمجياً (JSON valid).`);
    console.log(`📊 عدد الكلمات الكلي في الملف: ${Object.keys(data).length} كلمة.`);

    // البحث عن سورة الغاشية (88) - الآيات 25 و 26
    console.log("\n🕵️‍♂️ جاري البحث عن الآيات المفقودة سابقاً (الغاشية 25 و 26)...");

    let found25 = [];
    let found26 = [];

    // الدوران على كل مفاتيح الملف
    // المفاتيح شكلها: "رقم_السورة:رقم_الآية:رقم_الكلمة"
    Object.keys(data).forEach(key => {
        const parts = key.split(':'); // [سورة, آية, كلمة]
        const surah = parts[0];
        const ayah = parts[1];

        if (surah === '88') {
            if (ayah === '25') {
                found25.push(data[key]);
            } else if (ayah === '26') {
                found26.push(data[key]);
            }
        }
    });

    // ترتيب الكلمات حسب موقعها
    found25.sort((a, b) => parseInt(a.word) - parseInt(b.word));
    found26.sort((a, b) => parseInt(a.word) - parseInt(b.word));

    if (found25.length > 0) {
        console.log(`\n✅ الآية 25 موجودة! (عدد كلماتها: ${found25.length})`);
        console.log(`   - النص/الرموز: ${found25.map(w => w.text).join(' ')}`);
        console.log(`   - البيانات:`, JSON.stringify(found25[0], null, 2)); // عرض عينة
    } else {
        console.log("❌ الآية 25 غير موجودة في هذا الملف!");
    }

    if (found26.length > 0) {
        console.log(`\n✅ الآية 26 موجودة! (عدد كلماتها: ${found26.length})`);
        console.log(`   - النص/الرموز: ${found26.map(w => w.text).join(' ')}`);
    } else {
        console.log("❌ الآية 26 غير موجودة في هذا الملف!");
    }

} catch (error) {
    console.error("❌ حدث خطأ أثناء قراءة الملف:", error.message);
    console.log("تأكد أن اسم الملف هو qpc-v2.json وأنه بجوار السكربت.");
}