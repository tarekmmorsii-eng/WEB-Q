/**
 * سكريبت فك ضغط خط QPC V1
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createReadStream, createWriteStream } from 'fs';
import unbzip2 from 'unbzip2-stream';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const inputPath = path.join(__dirname, 'public/fonts/QPC V1 Font.woff2.bz2');
const outputPath = path.join(__dirname, 'public/fonts/QPC_V1.woff2');

console.log('جاري فك ضغط الخط...');

createReadStream(inputPath)
    .pipe(unbzip2())
    .pipe(createWriteStream(outputPath))
    .on('finish', () => {
        const stats = fs.statSync(outputPath);
        console.log(`تم الفك بنجاح! الحجم: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
    })
    .on('error', (err) => {
        console.error('خطأ:', err.message);
    });
