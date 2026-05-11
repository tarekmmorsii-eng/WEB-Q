const fs = require('fs');
const path = require('path');

const i18nDir = path.join(__dirname, '..', 'src', 'assets', 'i18n');
const files = fs.readdirSync(i18nDir).filter(f => f.endsWith('.json') && f !== 'ar.json' && f !== 'en.json');

const defaultKeys = {
  pushNotifCenterTitle: "Notification Center",
  pushNotifMarkAllRead: "Mark all as read",
  pushNotifClearAll: "Clear all",
  pushNotifEmpty: "No notifications yet",
  pushNotifEmptyDesc: "Push notifications will appear here when received",
  pushNotifDelete: "Delete"
};

files.forEach(file => {
  const filePath = path.join(i18nDir, file);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  let changed = false;

  Object.entries(defaultKeys).forEach(([key, value]) => {
    if (!data[key]) {
      data[key] = value;
      changed = true;
    }
  });

  if (changed) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
    console.log(`✅ Updated ${file}`);
  } else {
    console.log(`⏭️ Skipped ${file} (already has keys)`);
  }
});

console.log('\n✅ Done!');