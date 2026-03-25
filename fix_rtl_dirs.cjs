// fix_rtl_dirs.cjs - Fix the 'dir' field in all language JSON files
const fs = require('fs');
const path = require('path');

// RTL languages
const RTL_LANGS = new Set(['ar', 'ur', 'fa', 'ku']);

const i18nDir = path.join(__dirname, 'src', 'assets', 'i18n');
const files = fs.readdirSync(i18nDir).filter(f => f.endsWith('.json'));

let fixed = 0;
for (const file of files) {
    const lang = file.replace('.json', '');
    const filePath = path.join(i18nDir, file);
    const json = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    
    const correctDir = RTL_LANGS.has(lang) ? 'rtl' : 'ltr';
    
    if (json.dir !== correctDir) {
        json.dir = correctDir;
        fs.writeFileSync(filePath, JSON.stringify(json, null, 4));
        console.log(`Fixed ${file}: dir = ${correctDir}`);
        fixed++;
    } else {
        console.log(`OK    ${file}: dir = ${json.dir}`);
    }
}
console.log(`\nFixed ${fixed} files.`);
