/**
 * سكريبت لاستكشاف هيكل قاعدة بيانات QPC V1
 */

import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, 'official_data/qul_kfgqpc_v1/qpc-v1-15-lines.db/qpc-v1-15-lines.db');

try {
    const db = new Database(dbPath, { readonly: true });

    // الحصول على قائمة الجداول
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
    console.log('=== Tables ===');
    console.log(tables.map(t => t.name));

    // استكشاف كل جدول
    tables.forEach(table => {
        console.log(`\n=== Table: ${table.name} ===`);

        // الأعمدة
        const columns = db.prepare(`PRAGMA table_info(${table.name})`).all();
        console.log('Columns:', columns.map(c => c.name));

        // عدد الصفوف
        const count = db.prepare(`SELECT COUNT(*) as count FROM ${table.name}`).get();
        console.log('Row count:', count.count);

        // عينة من البيانات
        const sample = db.prepare(`SELECT * FROM ${table.name} LIMIT 10`).all();
        console.log('Sample data:', JSON.stringify(sample, null, 2));
    });

    db.close();
} catch (error) {
    console.error('Error:', error.message);
}
