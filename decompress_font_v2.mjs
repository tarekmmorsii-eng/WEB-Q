/**
 * فك ضغط خط QPC V1 - نسخة محسّنة
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pipeline } from 'stream/promises';
import { createReadStream, createWriteStream } from 'fs';
import unbzip2 from 'unbzip2-stream';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const inputPath = path.join(__dirname, 'public/fonts/QPC V1 Font.woff2.bz2');
const outputPath = path.join(__dirname, 'public/fonts/QPC_V1.woff2');

console.log('🔄 بدء فك ضغط خط QPC V1...');
console.log(`📁 المصدر: ${inputPath}`);
console.log(`📁 الهدف: ${outputPath}`);

// التحقق من وجود الملف المصدر
if (!fs.existsSync(inputPath)) {
    console.error('❌ الملف المضغوط غير موجود!');
    process.exit(1);
}

const inputStats = fs.statSync(inputPath);
console.log(`📊 حجم الملف المضغوط: ${(inputStats.size / 1024 / 1024).toFixed(2)} MB`);

// حذف الملف القديم إن وجد
if (fs.existsSync(outputPath)) {
    fs.unlinkSync(outputPath);
    console.log('🗑️  تم حذف الملف القديم');
}

// فك الضغط باستخدام pipeline
pipeline(
    createReadStream(inputPath),
    unbzip2(),
    createWriteStream(outputPath)
)
    .then(() => {
        const outputStats = fs.statSync(outputPath);
        const sizeMB = (outputStats.size / 1024 / 1024).toFixed(2);

        if (outputStats.size === 0) {
            console.error('❌ فشل فك الضغط! الملف الناتج فارغ (0 bytes)');
            console.log('💡 جرب الحلول البديلة:');
            console.log('   1. استخدم WinRAR أو 7-Zip يدوياً');
            console.log('   2. استخدم أداة bzip2 من سطر الأوامر');
            process.exit(1);
        } else {
            console.log(`✅ تم فك الضغط بنجاح!`);
            console.log(`📊 حجم الخط النهائي: ${sizeMB} MB`);
            console.log(`📁 المسار: ${outputPath}`);
        }
    })
    .catch((err) => {
        console.error('❌ خطأ أثناء فك الضغط:', err.message);
        console.log('💡 الحلول البديلة:');
        console.log('   1. جرب فك الضغط يدوياً باستخدام WinRAR أو 7-Zip');
        console.log('   2. تأكد من سلامة الملف المضغوط');
        process.exit(1);
    });
