const fs = require('fs');
const path = require('path');

const langDir = path.join(__dirname, '..', 'src', 'assets', 'i18n');
const files = fs.readdirSync(langDir).filter(f => f.endsWith('.json'));

for (const file of files) {
  const filePath = path.join(langDir, file);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  
  if (!data.youtube) {
    data.youtube = file.startsWith('ar.') ? 'يوتيوب' : 'YouTube';
  }
  if (!data.facebook) {
    data.facebook = file.startsWith('ar.') ? 'فيسبوك' : 'Facebook';
  }
  
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  console.log(`Updated: ${file}`);
}

console.log('Done!');