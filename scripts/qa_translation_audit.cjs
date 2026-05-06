/**
 * ============================================================
 *  QA Translation Audit Script (المدقق الآلي للترجمات)
 * ============================================================
 *  المرجع القياسي: اللغة الإنجليزية (en.json) من src/assets/i18n/
 *  المصدر: ملفات JSON المستقلة لكل لغة
 *  يفحص 3 أنواع من الأخطاء:
 *    أ) Missing Keys        - مفاتيح مفقودة
 *    ب) Empty Values        - قيم فارغة
 *    ج) Untranslated Values - قيم غير مترجمة (مطابقة للإنجليزية)
 * ============================================================
 */

const fs = require('fs');
const path = require('path');

// ─── ألوان الطرفية ───────────────────────────────────────────
const C = {
  reset:    '\x1b[0m',
  bright:   '\x1b[1m',
  dim:      '\x1b[2m',
  red:      '\x1b[31m',
  green:    '\x1b[32m',
  yellow:   '\x1b[33m',
  blue:     '\x1b[34m',
  magenta:  '\x1b[35m',
  cyan:     '\x1b[36m',
  white:    '\x1b[37m',
  bgRed:    '\x1b[41m',
  bgGreen:  '\x1b[42m',
  bgYellow: '\x1b[43m',
  bgBlue:   '\x1b[44m',
};

// ─── مجلد ملفات الترجمة ──────────────────────────────────────
const I18N_DIR = path.join(__dirname, '..', 'src', 'assets', 'i18n');

// ─── قائمة الاستثناءات (Ignore List) ─────────────────────────
// مصطلحات لا تحتاج ترجمة: تقنية، إسلامية عالمية، شبكات تواصل، أسماء خاصة

// 1) مفاتيح يُسمح أن تكون قيمتها مطابقة تماماً للإنجليزية
const IGNORED_KEYS = new Set([
  // اتجاه العرض (قيمة تقنية)
  'dir',
  // مصطلحات إسلامية عالمية تُستخدم كما هي
  'surah',
  'basmallah',
  'juz',
  'hizb',
  'rub',
  'ayahText',
  // شبكات التواصل الاجتماعي ومنصات
  'youtube',
  'facebook',
  // أسماء السور (مصفوفة surahNames) - أسماء علمية عربية
  'surahNames',
  // مفاتيح تحتوي أسماء قرّاء عالمية لا تُترجم
  'reciters',
  // مفاتيح تقنية / علامات
  'go',
  'goAction',
  'add',
  'apply',
  'amLabel',
  'pmLabel',
]);

// 2) مفاتيح تبدأ بهذه البادئات يُستثنى ما تحتويه أسماء القراء
const IGNORED_KEY_PREFIXES = [
  'reciters.',
];

// 3) كلمات عالمية داخل القيم لا تُعتبر "غير مترجمة" إذا ظهرت وحدها
const GLOBAL_WORDS = new Set([
  // شبكات تواصل
  'YouTube', 'Facebook', 'Telegram', 'Messenger', 'WhatsApp',
  'Instagram', 'Twitter', 'X', 'TikTok', 'Snapchat',
  // شركات تقنية
  'Google', 'Apple', 'Android', 'Samsung',
  'iOS', 'iPhone', 'iPad', 'Safari', 'Chrome', 'Firefox',
  'Windows', 'Mac', 'Linux', 'Bluetooth', 'Wi-Fi', 'WiFi',
  // تقنيات
  'URL', 'API', 'HTML', 'CSS', 'JavaScript', 'TypeScript',
  'Node.js', 'React', 'Angular', 'Vue', 'MP3', 'PDF',
  // رموز وأرقام
  'OK', 'ok', 'GPS', 'X3', 'QR',
]);

/**
 * تسطيح كائن متداخل إلى مسارات نقطية
 * { a: { b: "val" } } → { "a.b": "val" }
 */
function flattenObject(obj, prefix = '') {
  const result = {};
  for (const key of Object.keys(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    const val = obj[key];
    if (val && typeof val === 'object' && !Array.isArray(val)) {
      Object.assign(result, flattenObject(val, fullKey));
    } else if (Array.isArray(val)) {
      val.forEach((item, idx) => {
        if (item && typeof item === 'object') {
          Object.assign(result, flattenObject(item, `${fullKey}.${idx}`));
        } else {
          result[`${fullKey}.${idx}`] = item;
        }
      });
    } else {
      result[fullKey] = val;
    }
  }
  return result;
}

/**
 * تحقق هل القيمة كلمة عالمية لا تحتاج ترجمة
 */
function isGlobalWord(value) {
  if (typeof value !== 'string') return false;
  const trimmed = value.trim();
  if (trimmed === '') return false;
  // مطابقة تامة
  if (GLOBAL_WORDS.has(trimmed)) return true;
  // أرقام بحتة أو رموز
  if (/^[\d\s.,:;\-+/()%#°]+$/.test(trimmed)) return true;
  return false;
}

/**
 * تحقق هل المفتاح يجب استثناؤه من فحص "غير مترجم"
 */
function isIgnoredKey(key) {
  // مطابقة تامة
  if (IGNORED_KEYS.has(key)) return true;
  // مفاتيح أسماء السور (مصفوفة)
  if (key.startsWith('surahNames.')) return true;
  // مفاتيح القراء
  for (const prefix of IGNORED_KEY_PREFIXES) {
    if (key.startsWith(prefix)) return true;
  }
  return false;
}

// ─── تحميل ملفات الترجمة من JSON ─────────────────────────────

console.log(`\n${C.cyan}${C.bright}╔══════════════════════════════════════════════════════════╗`);
console.log(`║       🔍  QA Translation Audit — مدقق الترجمات الآلي   ║`);
console.log(`╚══════════════════════════════════════════════════════════╝${C.reset}\n`);

console.log(`${C.dim}📂 مجلد الترجمات: ${I18N_DIR}${C.reset}\n`);

if (!fs.existsSync(I18N_DIR)) {
  console.error(`${C.red}${C.bright}❌ خطأ: لم يتم العثور على المجلد: ${I18N_DIR}${C.reset}`);
  process.exit(1);
}

// قراءة جميع ملفات JSON
const jsonFiles = fs.readdirSync(I18N_DIR).filter(f => f.endsWith('.json'));

if (jsonFiles.length === 0) {
  console.error(`${C.red}${C.bright}❌ خطأ: لا توجد ملفات JSON في المجلد${C.reset}`);
  process.exit(1);
}

console.log(`${C.blue}📁 الملفات المكتشبة (${jsonFiles.length}):${C.reset}`);
jsonFiles.forEach(f => console.log(`${C.dim}   • ${f}${C.reset}`));
console.log('');

// تحميل كل ملف ككائن
const translations = {};
for (const file of jsonFiles) {
  const langCode = file.replace('.json', '');
  try {
    const raw = fs.readFileSync(path.join(I18N_DIR, file), 'utf-8');
    translations[langCode] = JSON.parse(raw);
  } catch (err) {
    console.error(`${C.red}❌ خطأ في قراءة ${file}: ${err.message}${C.reset}`);
    process.exit(1);
  }
}

const langCodes = Object.keys(translations).sort();
const refCode = 'en';

if (!translations[refCode]) {
  console.error(`${C.red}${C.bright}❌ خطأ: اللغة الإنجليزية (en.json) غير موجودة كمرجع قياسي${C.reset}`);
  process.exit(1);
}

// ─── تسطيح المرجع القياسي ─────────────────────────────────────
const refFlat = flattenObject(translations[refCode]);
const refKeys = new Set(Object.keys(refFlat));

console.log(`${C.blue}📋 المرجع القياسي: ${C.bright}${refCode.toUpperCase()}.json${C.reset} ${C.blue}(${refKeys.size} مفتاح)${C.reset}`);
console.log(`${C.blue}🌐 عدد اللغات المفحوصة: ${C.bright}${langCodes.length - 1}${C.reset}`);
console.log(`${C.blue}🚫 مفاتيح مستثناة من فحص "غير مترجم": ${C.bright}${IGNORED_KEYS.size}${C.reset} + بادئات ${IGNORED_KEY_PREFIXES.length} + surahNames + reciters`);
console.log(`${C.dim}${'─'.repeat(60)}${C.reset}\n`);

// ─── إحصائيات عامة ────────────────────────────────────────────
let totalIssues = 0;
let perfectLangs = 0;
let langsStats = [];

// ─── فحص كل لغة ──────────────────────────────────────────────
for (const lang of langCodes) {
  if (lang === refCode) continue; // تخطي المرجع نفسه

  const langFlat = flattenObject(translations[lang]);
  const langKeys = new Set(Object.keys(langFlat));

  const missing = [];
  const empty = [];
  const untranslated = [];

  // أ) مفاتيح مفقودة
  for (const key of refKeys) {
    if (!langKeys.has(key)) {
      missing.push(key);
    }
  }

  // ب + ج) قيم فارغة وغير مترجمة
  for (const key of refKeys) {
    if (!langKeys.has(key)) continue; // تم تسجيلها كمفقودة
    const val = langFlat[key];
    const refVal = refFlat[key];

    // قيمة فارغة
    if (val === '' || val === null || val === undefined) {
      empty.push(key);
      continue;
    }

    // استثناء المفاتيح المحددة
    if (isIgnoredKey(key)) continue;

    // غير مترجم (مطابق تماماً للإنجليزية)
    if (typeof val === 'string' && typeof refVal === 'string' && val === refVal) {
      if (!isGlobalWord(val)) {
        untranslated.push(key);
      }
    }
  }

  const issuesCount = missing.length + empty.length + untranslated.length;
  totalIssues += issuesCount;

  if (issuesCount === 0) {
    perfectLangs++;
    console.log(`${C.green}${C.bright}  ✅  ${lang.toUpperCase().padEnd(4)} ${C.reset}${C.green}— مكتملة 100% (${langKeys.size} مفتاح)${C.reset}`);
  } else {
    console.log(`${C.red}${C.bright}  ❌  ${lang.toUpperCase().padEnd(4)} ${C.reset}${C.red}— بها ${issuesCount} مشكلة${C.reset} ${C.dim}(${langKeys.size}/${refKeys.size} مفتاح)${C.reset}`);

    if (missing.length > 0) {
      console.log(`${C.yellow}      ⚠️  مفاتيح مفقودة (${missing.length}):${C.reset}`);
      missing.slice(0, 15).forEach(k => {
        console.log(`${C.dim}         • ${k}${C.reset}`);
      });
      if (missing.length > 15) {
        console.log(`${C.dim}         ... و${missing.length - 15} مفتاح آخر${C.reset}`);
      }
    }

    if (empty.length > 0) {
      console.log(`${C.magenta}      ⚠️  قيم فارغة (${empty.length}):${C.reset}`);
      empty.slice(0, 15).forEach(k => {
        console.log(`${C.dim}         • ${k}${C.reset}`);
      });
      if (empty.length > 15) {
        console.log(`${C.dim}         ... و${empty.length - 15} مفتاح آخر${C.reset}`);
      }
    }

    if (untranslated.length > 0) {
      console.log(`${C.cyan}      ⚠️  قيم غير مترجمة (${untranslated.length}):${C.reset}`);
      untranslated.slice(0, 20).forEach(k => {
        console.log(`${C.dim}         • ${k} = "${langFlat[k]}"${C.reset}`);
      });
      if (untranslated.length > 20) {
        console.log(`${C.dim}         ... و${untranslated.length - 20} مفتاح آخر${C.reset}`);
      }
    }

    console.log('');
  }

  langsStats.push({ lang, missing: missing.length, empty: empty.length, untranslated: untranslated.length, total: issuesCount, untranslatedKeys: untranslated });
}

// ─── ملخص التقرير ─────────────────────────────────────────────
console.log(`${C.dim}${'─'.repeat(60)}${C.reset}`);
console.log(`${C.bright}\n📊  ملخص التقرير النهائي:${C.reset}\n`);
console.log(`   اللغات المفحوصة:     ${C.bright}${langCodes.length - 1}${C.reset}`);
console.log(`   اللغات المكتملة:     ${C.green}${C.bright}${perfectLangs} ✅${C.reset}`);
console.log(`   اللغات بمشاكل:       ${C.red}${C.bright}${langsStats.filter(l => l.total > 0).length} ❌${C.reset}`);
console.log(`   إجمالي المشاكل:      ${C.yellow}${C.bright}${totalIssues}${C.reset}`);

if (totalIssues > 0) {
  console.log(`\n${C.yellow}   تفصيل المشاكل حسب النوع:${C.reset}`);
  const totalMissing = langsStats.reduce((s, l) => s + l.missing, 0);
  const totalEmpty = langsStats.reduce((s, l) => s + l.empty, 0);
  const totalUntrans = langsStats.reduce((s, l) => s + l.untranslated, 0);
  console.log(`   أ) مفاتيح مفقودة:    ${C.red}${totalMissing}${C.reset}`);
  console.log(`   ب) قيم فارغة:        ${C.magenta}${totalEmpty}${C.reset}`);
  console.log(`   ج) غير مترجمة:       ${C.cyan}${totalUntrans}${C.reset}`);

  // ترتيب اللغات حسب عدد المشاكل
  const sorted = [...langsStats].filter(l => l.total > 0).sort((a, b) => b.total - a.total);
  console.log(`\n${C.yellow}   اللغات الأكثر مشاكل:${C.reset}`);
  sorted.slice(0, 10).forEach((l, i) => {
    const bar = '█'.repeat(Math.min(l.total, 30));
    console.log(`   ${(i + 1).toString().padStart(2)}. ${l.lang.toUpperCase().padEnd(4)} ${C.red}${bar}${C.reset} ${l.total}`);
  });

  // تجميع المفاتيح غير المترجمة الأكثر تكراراً
  const untranslatedFreq = {};
  for (const ls of langsStats) {
    for (const k of ls.untranslatedKeys) {
      untranslatedFreq[k] = (untranslatedFreq[k] || 0) + 1;
    }
  }
  const topUntranslated = Object.entries(untranslatedFreq).sort((a, b) => b[1] - a[1]).slice(0, 20);
  if (topUntranslated.length > 0) {
    console.log(`\n${C.cyan}   المفاتيح الأكثر عدم ترجمة (تظهر في عدة لغات):${C.reset}`);
    topUntranslated.forEach(([key, count]) => {
      console.log(`${C.dim}   • ${key} ← غائب في ${count} لغة | القيمة الإنجليزية: "${refFlat[key]}"${C.reset}`);
    });
  }
}

console.log(`\n${C.dim}${'─'.repeat(60)}${C.reset}`);

if (totalIssues === 0) {
  console.log(`${C.green}${C.bright}\n🎉  ممتاز! جميع الترجمات مكتملة 100% بدون أي مشاكل!${C.reset}\n`);
} else {
  console.log(`${C.yellow}${C.bright}\n⚠️  تم اكتشاف ${totalIssues} مشكلة تحتاج مراجعة وترجمة.${C.reset}\n`);
}