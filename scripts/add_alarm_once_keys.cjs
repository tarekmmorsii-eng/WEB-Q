const fs = require('fs');
const path = require('path');

const keys = {
  alarm_once: 'Once',
  alarm_select_date: '📅 Specific Date',
  alarm_clear_date: 'Clear Date',
  alarm_specific_date: 'Specific Date'
};

const dir = path.join(__dirname, '..', 'src', 'assets', 'i18n');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.json') && f !== 'ar.json' && f !== 'en.json');

for (const file of files) {
  const fp = path.join(dir, file);
  const obj = JSON.parse(fs.readFileSync(fp, 'utf8'));
  let changed = false;
  for (const [k, v] of Object.entries(keys)) {
    if (!obj[k]) { obj[k] = v; changed = true; }
  }
  if (changed) {
    fs.writeFileSync(fp, JSON.stringify(obj, null, 2), 'utf8');
    console.log('Updated:', file);
  } else {
    console.log('Already has keys:', file);
  }
}
console.log('Done!');