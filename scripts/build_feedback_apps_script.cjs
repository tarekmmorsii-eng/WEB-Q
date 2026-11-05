const fs = require('node:fs');
const engine = fs.readFileSync('scripts/feedback_retention_engine.cjs', 'utf8')
    .replace(/module\.exports = .*;/, '');
const code = [fs.readFileSync('scripts/feedback_schema.js','utf8'),fs.readFileSync('scripts/google_apps_script_code.js','utf8'), engine,
    fs.readFileSync('scripts/google_feedback_retention.js','utf8'),
    fs.readFileSync('scripts/google_feedback_schedule.js','utf8')].join('\n\n');
fs.mkdirSync('artifacts/feedback-retention', {recursive:true});
fs.writeFileSync('artifacts/feedback-retention/Code.gs', code);
console.log('Prepared Apps Script bundle; no deployment or execution.');
