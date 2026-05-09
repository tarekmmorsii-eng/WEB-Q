const fs = require('fs');
const path = require('path');
const https = require('https');

/**
 * سكربت ترجمة مفاتيح واجهة الإشعارات الداخلية (InAppNotificationsModal)
 * إلى جميع ملفات اللغات الـ 31 المتبقية
 */

const INAPP_NOTIF_KEYS = [
  'inAppNotifModalTitle',
  'inAppNotifNewBadge',
  'inAppNotifMarkAllRead',
  'inAppNotifClearAll',
  'inAppNotifEmpty',
  'inAppNotifEmptyDesc'
];

const dir = path.join(__dirname, '..', 'src', 'assets', 'i18n');

// Language code mapping for Google Translate
const langMap = {
  am: 'am', bn: 'bn', bs: 'bs', de: 'de', es: 'es', fa: 'fa', fr: 'fr',
  ha: 'ha', hi: 'hi', id: 'id', ja: 'ja', kk: 'kk', ko: 'ko', ku: 'ku',
  ms: 'ms', om: 'om', ru: 'ru', rw: 'rw', si: 'si', sq: 'sq', sw: 'sw',
  ta: 'ta', tl: 'tl', tr: 'tr', ur: 'ur', uz: 'uz', vi: 'vi', yo: 'yo', zh: 'zh'
};

function translate(text, targetLang) {
  return new Promise((resolve, reject) => {
    const encoded = encodeURIComponent(text);
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLang}&dt=t&q=${encoded}`;
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          const translated = json[0].map(item => item[0]).join('');
          resolve(translated);
        } catch (e) { reject(e); }
      });
    }).on('error', reject);
  });
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function main() {
  console.log('🌐 ترجمة مفاتيح InAppNotificationsModal للغات المتبقية\n');
  console.log('📋 المفاتيح المطلوبة:', INAPP_NOTIF_KEYS.join(', '));
  console.log('');

  // قراءة القيم الإنجليزية كمرجع
  const enFile = JSON.parse(fs.readFileSync(path.join(dir, 'en.json'), 'utf8'));

  // القيم العربية كمرجع إضافي
  const arFile = JSON.parse(fs.readFileSync(path.join(dir, 'ar.json'), 'utf8'));

  const files = fs.readdirSync(dir).filter(f => f.endsWith('.json') && f !== 'en.json' && f !== 'ar.json');

  let totalTranslated = 0;
  let totalSkipped = 0;
  let totalAdded = 0;

  for (const file of files) {
    const fp = path.join(dir, file);
    const obj = JSON.parse(fs.readFileSync(fp, 'utf8'));
    const langCode = file.replace('.json', '');
    const gLang = langMap[langCode];

    if (!gLang) {
      console.log(`⚠️ تخطي ${file} - لا يوجد كود لغة`);
      totalSkipped++;
      continue;
    }

    const missingKeys = [];
    const existingKeys = [];

    for (const key of INAPP_NOTIF_KEYS) {
      if (!obj[key]) {
        missingKeys.push(key);
      } else {
        existingKeys.push(key);
      }
    }

    if (missingKeys.length === 0) {
      console.log(`✅ ${file} — مكتمل! (${existingKeys.length}/${INAPP_NOTIF_KEYS.length})`);
      totalTranslated++;
      continue;
    }

    console.log(`\n📝 ${file.toUpperCase()} → ${gLang} (${missingKeys.length} مفاتيح مفقودة من ${INAPP_NOTIF_KEYS.length})`);

    for (const key of missingKeys) {
      const enVal = enFile[key];
      if (!enVal) {
        console.log(`  ⚠️ ${key}: غير موجود في en.json - تخطي`);
        continue;
      }

      try {
        await sleep(400); // Rate limiting
        const translated = await translate(enVal, gLang);
        obj[key] = translated;
        console.log(`  ✓ ${key}: "${enVal}" → "${translated}"`);
      } catch (e) {
        // Fallback: استخدام القيمة الإنجليزية في حال فشل الترجمة
        obj[key] = enVal;
        console.log(`  ✗ ${key}: خطأ - ${e.message} (استخدام الإنجليزية كـ fallback)`);
      }
    }

    fs.writeFileSync(fp, JSON.stringify(obj, null, 2), 'utf8');
    console.log(`  💾 حفظ ${file}`);
    totalAdded++;
  }

  console.log('\n' + '='.repeat(50));
  console.log(`📊 ملخص:`);
  console.log(`  ✅ ملفات مكتملة مسبقاً: ${totalTranslated}`);
  console.log(`  📝 ملفات تمت ترجمتها: ${totalAdded}`);
  console.log(`  ⚠️ ملفات متخطاة: ${totalSkipped}`);
  console.log(`  📋 إجمالي اللغات: ${files.length + 2}`);
  console.log('\n✅ انتهت ترجمة جميع اللغات!');
}

main().catch(console.error);