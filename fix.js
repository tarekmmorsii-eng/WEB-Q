const fs = require('fs');
let lines = fs.readFileSync('i18n/translations.ts', 'utf8').split('\n');

let hiIndex = lines.findIndex((l, i) => i > 6000 && i < 7000 && l.startsWith('    hi: {'));
let amIndex = lines.findIndex((l, i) => i > 6000 && i < 7000 && l.startsWith('    am: {'));

if (hiIndex > -1 && amIndex > -1) {
    lines.splice(hiIndex, amIndex - hiIndex);
    fs.writeFileSync('i18n/translations.ts', lines.join('\n'));
    console.log(`Deleted lines from ${hiIndex} to ${amIndex-1}`);
} else {
    console.log('Not found');
}
