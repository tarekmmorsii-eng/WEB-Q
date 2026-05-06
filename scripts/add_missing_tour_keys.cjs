const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..', 'src', 'assets', 'i18n');

const defaults = {
  tourMemorizationPwr: 'Memorization strength rating:',
  tourBookmarkDesc: 'Add a bookmark for the verse',
  tourMutashabihatDescShort: 'View Mutashabihat with the verse'
};

const arValues = {
  tourMemorizationPwr: 'تصنيف قوة الحفظ:',
  tourBookmarkDesc: 'إضافة إشارة مرجعية للآية',
  tourMutashabihatDescShort: 'مشاهدة المتشابهات مع الآية'
};

const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));

files.forEach(file => {
  const filePath = path.join(dir, file);
  const json = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  let changed = false;
  
  Object.keys(defaults).forEach(key => {
    if (!json[key]) {
      json[key] = file === 'ar.json' ? arValues[key] : defaults[key];
      changed = true;
    }
  });
  
  if (changed) {
    fs.writeFileSync(filePath, JSON.stringify(json, null, 2) + '\n', 'utf8');
    console.log('Updated: ' + file);
  } else {
    console.log('OK: ' + file);
  }
});

console.log('Done!');