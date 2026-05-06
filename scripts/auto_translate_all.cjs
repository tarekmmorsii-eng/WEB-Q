/**
 * ============================================================
 *  Auto-Translate All i18n Files — بدون مكتبات خارجية
 *  يستخدم Google Translate عبر HTTP مباشرة
 * ============================================================
 */
const fs = require('fs');
const path = require('path');
const https = require('https');

const I18N_DIR = path.join(__dirname, '..', 'src', 'assets', 'i18n');

const LANG_MAP = {
  am:'am', ar:'ar', bn:'bn', bs:'bs', de:'de', en:'en',
  es:'es', fa:'fa', fr:'fr', ha:'ha', hi:'hi', id:'id',
  ja:'ja', kk:'kk', ko:'ko', ku:'ku', ms:'ms', om:'om',
  ru:'ru', rw:'rw', si:'si', sq:'sq', sw:'sw', ta:'ta',
  tl:'tl', tr:'tr', ur:'ur', uz:'uz', vi:'vi', yo:'yo',
  zh:'zh-CN',
};

const IGNORED_KEYS = new Set([
  'dir','surah','basmallah','juz','hizb','rub','ayahText',
  'youtube','facebook','surahNames','reciters',
  'go','goAction','add','apply','amLabel','pmLabel',
]);

const GLOBAL_WORDS = new Set([
  'YouTube','Facebook','Telegram','WhatsApp','Instagram',
  'Google','Apple','Android','iOS','OK','ok','MP3','PDF','URL',
]);

const MANUAL_OVERRIDES = {
  ar: {
    startRuleDesc: 'الأخضر يدل على التشابه في بداية الآيات',
    endRuleDesc: 'الأحمر يدل على التشابه في نهاية الآيات',
    middleRuleDesc: 'الأزرق يدل على التشابه في وسط الآيات',
  },
};

function isIgnoredKey(key) {
  if (IGNORED_KEYS.has(key)) return true;
  if (key.startsWith('surahNames.')) return true;
  return false;
}

function isGlobalWord(v) {
  if (typeof v !== 'string') return false;
  const t = v.trim();
  return GLOBAL_WORDS.has(t) || /^[\d\s.,:;\-+/()%#°]+$/.test(t);
}

function flattenObject(obj, prefix = '') {
  const result = {};
  for (const key of Object.keys(obj)) {
    const fk = prefix ? `${prefix}.${key}` : key;
    const val = obj[key];
    if (val && typeof val === 'object' && !Array.isArray(val)) {
      Object.assign(result, flattenObject(val, fk));
    } else {
      result[fk] = val;
    }
  }
  return result;
}

function unflattenObject(flat) {
  const result = {};
  for (const [key, value] of Object.entries(flat)) {
    const parts = key.split('.');
    let cur = result;
    for (let i = 0; i < parts.length - 1; i++) {
      if (!(parts[i] in cur)) cur[parts[i]] = {};
      cur = cur[parts[i]];
    }
    cur[parts[parts.length - 1]] = value;
  }
  return result;
}

function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

/**
 * ترجمة نص عبر Google Translate HTTP API (مجاني، بدون مفتاح)
 */
function googleTranslate(text, targetLang) {
  return new Promise((resolve, reject) => {
    const encoded = encodeURIComponent(text);
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLang}&dt=t&q=${encoded}`;
    
    const req = https.get(url, { timeout: 10000 }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed && parsed[0]) {
            let translated = '';
            for (const part of parsed[0]) {
              if (part[0]) translated += part[0];
            }
            resolve(translated);
          } else {
            reject(new Error('Invalid response'));
          }
        } catch (e) {
          reject(e);
        }
      });
    });
    
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('Timeout')); });
  });
}

async function translateWithRetry(text, targetLang, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const result = await googleTranslate(text, targetLang);
      return result;
    } catch (err) {
      if (i < retries - 1) {
        await delay(2000 * (i + 1));
      } else {
        return null;
      }
    }
  }
  return null;
}

async function main() {
  console.log('\n🌐 Auto-Translate All — الترجمة الآلية الشاملة\n');

  const refRaw = fs.readFileSync(path.join(I18N_DIR, 'en.json'), 'utf-8');
  const refData = JSON.parse(refRaw);
  const refFlat = flattenObject(refData);
  console.log(`📋 المرجع: en.json (${Object.keys(refFlat).length} مفتاح)\n`);

  const langFiles = fs.readdirSync(I18N_DIR).filter(f => f.endsWith('.json') && f !== 'en.json');
  let totalFixed = 0;
  let totalErrors = 0;

  for (const file of langFiles) {
    const langCode = file.replace('.json', '');
    const targetLang = LANG_MAP[langCode] || langCode;
    const filePath = path.join(I18N_DIR, file);

    console.log(`${'─'.repeat(50)}`);
    console.log(`📝 ${langCode.toUpperCase()} → ${targetLang}`);

    let langData;
    try {
      langData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    } catch (err) {
      console.error(`  ❌ خطأ قراءة: ${err.message}`);
      totalErrors++;
      continue;
    }

    const langFlat = flattenObject(langData);
    const keysToTranslate = [];

    for (const [key, refVal] of Object.entries(refFlat)) {
      if (Array.isArray(refVal) || isIgnoredKey(key)) continue;
      const lv = langFlat[key];
      if (lv === undefined) { keysToTranslate.push({ key, refVal, reason: 'missing' }); continue; }
      if (lv === '' || lv === null) { keysToTranslate.push({ key, refVal, reason: 'empty' }); continue; }
      if (typeof lv === 'string' && typeof refVal === 'string' && lv === refVal && !isGlobalWord(refVal)) {
        keysToTranslate.push({ key, refVal, reason: 'untranslated' });
      }
    }

    if (keysToTranslate.length === 0) {
      console.log('  ✅ مكتمل!');
      continue;
    }

    console.log(`  🔍 ${keysToTranslate.length} قيمة تحتاج ترجمة`);

    // يدوي
    const overrides = MANUAL_OVERRIDES[langCode] || {};
    let oc = 0;
    for (const item of keysToTranslate) {
      if (overrides[item.key]) { langFlat[item.key] = overrides[item.key]; oc++; }
    }
    if (oc > 0) console.log(`  ✏️ ${oc} ترجمة يدوية`);

    // آلي
    const toAuto = keysToTranslate.filter(item => !overrides[item.key]);
    let successCount = 0;
    
    for (let i = 0; i < toAuto.length; i++) {
      const item = toAuto[i];
      const translated = await translateWithRetry(item.refVal, targetLang);
      if (translated && translated.trim() !== '') {
        langFlat[item.key] = translated;
        successCount++;
        const shortRef = item.refVal.substring(0, 35);
        const shortTr = translated.substring(0, 35);
        console.log(`  ✓ [${i+1}/${toAuto.length}] ${item.key}: "${shortRef}..." → "${shortTr}..."`);
      } else {
        console.log(`  ✗ ${item.key}: فشلت الترجمة`);
        totalErrors++;
      }
      // تأخير 300ms بين الطلبات
      if (i < toAuto.length - 1) await delay(300);
    }

    // إضافة مفاتيح مفقودة
    for (const [key, refVal] of Object.entries(refFlat)) {
      if (langFlat[key] === undefined && !Array.isArray(refVal)) {
        langFlat[key] = refVal;
      }
    }

    // حفظ
    const rebuilt = unflattenObject(langFlat);
    const ordered = {};
    for (const key of Object.keys(refData)) {
      if (rebuilt[key] !== undefined) ordered[key] = rebuilt[key];
    }
    for (const key of Object.keys(rebuilt)) {
      if (ordered[key] === undefined) ordered[key] = rebuilt[key];
    }
    fs.writeFileSync(filePath, JSON.stringify(ordered, null, 2), 'utf-8');
    console.log(`  💾 حفظ ${file} (${successCount} ترجمة جديدة)\n`);
    totalFixed += keysToTranslate.length;
  }

  console.log(`${'═'.repeat(50)}`);
  console.log(`📊 الملخص: ✅ ${totalFixed} إصلاح | ❌ ${totalErrors} خطأ`);
  console.log('🎉 انتهت الترجمة الآلية!\n');
}

main().catch(err => { console.error('❌ خطأ:', err); process.exit(1); });