const fs = require('fs');
const path = require('path');

const i18nDir = path.join(__dirname, 'src', 'assets', 'i18n');
const files = fs.readdirSync(i18nDir).filter(f => f.endsWith('.json') && f !== 'ar.json' && f !== 'en.json');

const shareAppTitle = "Mushaf Al-Murajaa";
const shareAppText = "*Peace be upon you* 🌸\n\nI wanted to share this wonderful app with you:\n📖 *Mushaf Al-Murajaa* 📖\nThe smart companion for memorizing and revising the Holy Quran.\n\n📥 *Download now for free:*\n🔹 Google Play:\nhttps://play.google.com/store/apps/details?id=com.mushafalmurajaa.app\n🔹 Direct Link (APK):\nhttps://apkpure.com/p/com.mushafalmurajaa.app\n\n🌐 *Official Website:* \nhttps://mushafalmurajaa.com";

files.forEach(file => {
    const filePath = path.join(i18nDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    try {
        const json = JSON.parse(content);
        if (!json.shareAppTitle) {
            json.shareAppTitle = shareAppTitle;
            json.shareAppText = shareAppText;
            fs.writeFileSync(filePath, JSON.stringify(json, null, 2) + '\n', 'utf8');
            console.log(`Updated ${file}`);
        }
    } catch (e) {
        console.error(`Error parsing ${file}:`, e);
    }
});
