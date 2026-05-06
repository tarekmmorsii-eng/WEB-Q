/**
 * ============================================================
 *  Auto-Translate Round 2 — الجولة الثانية المحسّنة
 *  - يتخطى اللغات المكتملة 100%
 *  - يترجم فقط القيم غير المترجمة المتبقية
 *  - تأخير أطول لتجنب الحظر
 *  - قائمة مفاتيح لا تحتاج ترجمة
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

// مفاتيح قيمتها الإنجليزية صالحة في كل اللغات (لا تحتاج ترجمة)
const SAME_AS_EN_OK = new Set([
  'juzType', 'hizbType', 'rubType',
  'exportHeaderJuz', 'notificationJuzHizb',
  'mushafAlMurajaa',
  'index', 'indexTitle', 'guideIndex',
  'startPagePlaceholder',
  'tourMedium',
  'error',
  'similarBadge',
  'countryIndonesia', 'countrySaudi', 'countryJordan',
  'countryMalaysia', 'countryTurkey', 'countryEgypt',
  'countryUAE', 'countryKuwait', 'countryMorocco',
  'notifications', 'page',
  'exportHeaderPage',
  'platformAnalytics',
  'playAyah',
  'surahPrefix',
  'rateSurah', 'rateAyah',
  'toAyah',
  'mutashabihatIndex', 'addMutashabihat',
  'matchedCount', 'searchSurah',
  'guideQuranUI',
  'tourAyahColorsTitle', 'tourMutashabihatTitle',
  'tourLastWordTitle', 'tourAyahNumberTitle',
  'bookmark',
  'darkMode', 'lightMode',
  'hideRandomAyahs', 'hideRandomWords',
  'toggleLastWord', 'stopSignsLabel',
  'coolWhite', 'softCream', 'pureBlack', 'warmDark', 'warmBeige',
  'pageBookmarks', 'verseBookmarks', 'verseBookmarksSection',
  'notificationManagerTitle',
  'firstRub', 'secondRub', 'thirdRub', 'fourthRub',
  'rateMemorization', 'saveAyah',
  'lineSpacingLabel', 'fullscreen',
  'moreSettings', 'stopAlarm',
  'memorizationStatsTitle',
  'verseCalculatorTitle', 'startPoint',
  'alarmMode', 'testAlarm',
  'presetIslamic', 'tinyUpdate',
  'pageFlipSound',
  'settings', 'settingsTitle', 'languages',
  'textBrightness',
  'notRated',
  'hideRatedVerses',
  'sunday', 'monday', 'tuesday', 'wednesday',
  'thursday', 'friday', 'saturday',
]);

// بادئات مفاتيح لا تحتاج ترجمة
const SAME_AS_EN_PREFIXES = [
  'tourAssessment', 'tourBookmark', 'tourViewMutashabihat',
  'tourAyahColorsDescText', 'tourMutashabihatDescText',
  'tourHideAyahsDescText', 'tourAyahNumberDescText',
];

const GLOBAL_WORDS = new Set([
  'YouTube','Facebook','Telegram','WhatsApp','Instagram',
  'Google','Apple','Android','iOS','OK','ok','MP3','PDF','URL',
]);

function isSameAsEnOk(key) {
  if (SAME_AS_EN_OK.has(key)) return true;
  for (const p of SAME_AS_EN_PREFIXES) {
    if (key === p || key.startsWith(p)) return true;
  }
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

function googleTranslate(text, targetLang) {
  return new Promise((resolve, reject) => {
    const encoded = encodeURIComponent(text);
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLang}&dt=t&q=${encoded}`;
    
    const req = https.get(url, { timeout: 15000 }, (res) => {
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

async function translateWithRetry(text, targetLang, retries = 5) {
  for (let i = 0; i < retries; i++) {
    try {
      const result = await googleTranslate(text, targetLang);
      return result;
    } catch (err) {
      const waitTime = 3000 * (i + 1);
      console.log(`    ⏳ إعادة محاولة (${i+1}/${retries}) بعد ${waitTime}ms...`);
      await delay(waitTime);
    }
  }
  return null;
}

async function main() {
  console.log('\n🔄 Auto-Translate Round 2 — الجولة الثانية\n');

  const refRaw = fs.readFileSync(path.join(I18N_DIR, 'en.json'), 'utf-8');
  const refData = JSON.parse(refRaw);
  const refFlat = flattenObject(refData);
  console.log(`📋 المرجع: en.json (${Object.keys(refFlat).length} مفتاح)\n`);

  const langFiles = fs.readdirSync(I18N_DIR)
    .filter(f => f.endsWith('.json') && f !== 'en.json')
    .sort();

  let totalFixed = 0;
  let totalErrors = 0;
  let totalSkipped = 0;

  for (const file of langFiles) {
    const langCode = file.replace('.json', '');
    const targetLang = LANG_MAP[langCode] || langCode;
    const filePath = path.join(I18N_DIR, file);

    let langData;
    try {
      langData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    } catch (err) {
      console.error(`  ❌ خطأ قراءة ${file}: ${err.message}`);
      totalErrors++;
      continue;
    }

    const langFlat = flattenObject(langData);
    const keysToTranslate = [];
    const keysSameAsEn = [];

    for (const [key, refVal] of Object.entries(refFlat)) {
      if (Array.isArray(refVal)) continue;
      if (key.startsWith('surahNames.') || key.startsWith('reciters.')) continue;
      
      const lv = langFlat[key];
      if (lv === undefined) continue; // لا نضيف مفاتيح مفقودة
      if (lv === '' || lv === null) { keysToTranslate.push({ key, refVal }); continue; }
      
      if (typeof lv === 'string' && typeof refVal === 'string' && lv === refVal && !isGlobalWord(refVal)) {
        // تحقق هل هذا المفتاح مسموح يكون نفس الإنجليزية
        if (isSameAsEnOk(key)) {
          keysSameAsEn.push(key);
        } else {
          keysToTranslate.push({ key, refVal });
        }
      }
    }

    if (keysSameAsEn.length > 0) {
      console.log(`  ℹ️  ${langCode.toUpperCase()}: ${keysSameAsEn.length} مفتاح مشابه للإنجليزية (مقبول)`);
    }

    if (keysToTranslate.length === 0) {
      console.log(`  ✅ ${langCode.toUpperCase()}: مكتمل!`);
      continue;
    }

    console.log(`\n${'─'.repeat(50)}`);
    console.log(`📝 ${langCode.toUpperCase()} → ${targetLang} | ${keysToTranslate.length} قيمة تحتاج ترجمة`);

    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < keysToTranslate.length; i++) {
      const item = keysToTranslate[i];
      const translated = await translateWithRetry(item.refVal, targetLang);
      
      if (translated && translated.trim() !== '' && translated.trim() !== item.refVal.trim()) {
        langFlat[item.key] = translated;
        successCount++;
        const shortRef = item.refVal.length > 40 ? item.refVal.substring(0, 37) + '...' : item.refVal;
        const shortTr = translated.length > 40 ? translated.substring(0, 37) + '...' : translated;
        console.log(`  ✓ [${i+1}/${keysToTranslate.length}] ${item.key}: "${shortRef}" → "${shortTr}"`);
      } else {
        failCount++;
        console.log(`  ✗ [${i+1}/${keysToTranslate.length}] ${item.key}: فشلت الترجمة`);
      }
      
      // تأخير 1.5 ثانية بين الطلبات لتجنب الحظر
      if (i < keysToTranslate.length - 1) await delay(1500);
    }

    // حفظ الملف
    const rebuilt = unflattenObject(langFlat);
    const ordered = {};
    for (const key of Object.keys(refData)) {
      if (rebuilt[key] !== undefined) ordered[key] = rebuilt[key];
    }
    for (const key of Object.keys(rebuilt)) {
      if (ordered[key] === undefined) ordered[key] = rebuilt[key];
    }
    fs.writeFileSync(filePath, JSON.stringify(ordered, null, 2), 'utf-8');
    
    console.log(`  💾 حفظ ${file} (${successCount} ترجمة جديدة${failCount > 0 ? `, ${failCount} فشل` : ''})`);
    totalFixed += successCount;
    totalErrors += failCount;

    // انتظار 3 ثوان بين اللغات
    await delay(3000);
  }

  console.log(`\n${'═'.repeat(50)}`);
  console.log(`📊 الملخص: ✅ ${totalFixed} ترجمة جديدة | ❌ ${totalErrors} فشل`);
  console.log('🎉 انتهت الجولة الثانية!\n');
}

main().catch(err => { console.error('❌ خطأ:', err); process.exit(1); });