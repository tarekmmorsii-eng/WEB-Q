const fs = require('fs');
const path = require('path');
const https = require('https');

const ALARM_KEYS = ['alarm_once', 'alarm_select_date', 'alarm_clear_date', 'alarm_specific_date'];
const dir = path.join(__dirname, '..', 'src', 'assets', 'i18n');

// Language code mapping for Google Translate
const langMap = {
  am: 'am', bn: 'bn', bs: 'bs', de: 'de', es: 'es', fa: 'fa', fr: 'fr',
  ha: 'ha', hi: 'hi', id: 'id', ja: 'ja', kk: 'kk', ko: 'ko', ku: 'ku',
  ml: 'ml', ms: 'ms', nl: 'nl', om: 'om', pt: 'pt', ro: 'ro', ru: 'ru',
  rw: 'rw', si: 'si', so: 'so', sq: 'sq', sv: 'sv', sw: 'sw', ta: 'ta',
  th: 'th', tl: 'tl', tr: 'tr', ug: 'ug', ur: 'ur', uz: 'uz', vi: 'vi', yo: 'yo', zh: 'zh'
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
  console.log('🌐 ترجمة مفاتيح Alarm للغات المتبقية\n');
  
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.json') && f !== 'en.json' && f !== 'ar.json');
  
  for (const file of files) {
    const fp = path.join(dir, file);
    const obj = JSON.parse(fs.readFileSync(fp, 'utf8'));
    const langCode = file.replace('.json', '');
    const gLang = langMap[langCode];
    
    if (!gLang) { console.log(`⚠️ تخطي ${file} - لا يوجد كود لغة`); continue; }
    
    // Check which alarm keys still have English values
    const needsTranslation = {};
    for (const key of ALARM_KEYS) {
      if (obj[key]) {
        const val = obj[key];
        // If value matches English reference, it needs translation
        const enFile = JSON.parse(fs.readFileSync(path.join(dir, 'en.json'), 'utf8'));
        if (val === enFile[key] || val === enFile[key]?.replace(/[📅✅]/g, '').trim()) {
          needsTranslation[key] = enFile[key];
        }
      }
    }
    
    const keysToTranslate = Object.keys(needsTranslation);
    if (keysToTranslate.length === 0) {
      console.log(`✅ ${file} — مكتمل!`);
      continue;
    }
    
    console.log(`\n📝 ${file.toUpperCase()} → ${gLang} (${keysToTranslate.length} مفاتيح)`);
    
    for (const key of keysToTranslate) {
      const enVal = needsTranslation[key];
      try {
        await sleep(300); // Rate limiting
        const translated = await translate(enVal, gLang);
        obj[key] = translated;
        console.log(`  ✓ ${key}: "${enVal}" → "${translated}"`);
      } catch (e) {
        console.log(`  ✗ ${key}: خطأ - ${e.message}`);
      }
    }
    
    fs.writeFileSync(fp, JSON.stringify(obj, null, 2), 'utf8');
    console.log(`  💾 حفظ ${file}`);
  }
  
  console.log('\n✅ انتهت ترجمة جميع اللغات!');
}

main().catch(console.error);