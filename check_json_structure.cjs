const fs = require('fs');
const json = JSON.parse(fs.readFileSync('public/quran.json', 'utf8'));
console.log('Root keys:', Object.keys(json));
if (json.code) console.log('Code:', json.code);
if (json.data) console.log('Data keys:', Object.keys(json.data));
