/*
 * Translation Audit Script (READ-ONLY)
 * -------------------------------------
 * Purpose: Analyze all i18n JSON files WITHOUT modifying them.
 * Output:  A Markdown report at TRANSLATIONS_AUDIT_REPORT.md
 *
 * What it detects:
 *   1. Missing keys        : keys present in the reference union but absent in a language file.
 *   2. Untranslated keys   : non-English language value that is byte-identical to the English value.
 *   3. Proper-name keys    : reciters names left in English (reported SEPARATELY, optional to translate).
 *   4. Tour / helpSlide / guide coverage issues.
 *   5. Extra keys          : keys present in a language file but not in the reference (informational).
 *
 * Safety: This script only reads files. It never writes to any *.json translation file.
 */

const fs = require('fs');
const path = require('path');

const I18N_DIR = path.join(__dirname, '..', 'src', 'assets', 'i18n');
const REPORT_PATH = path.join(__dirname, '..', 'TRANSLATIONS_AUDIT_REPORT.md');

// All 31 languages declared in i18n/translations.ts
const LANGS = [
    'ar', 'en', 'id', 'ms', 'ur', 'bn', 'tr', 'fa', 'ha', 'fr',
    'es', 'de', 'ru', 'sw', 'zh', 'ko', 'ja', 'bs', 'sq', 'uz',
    'kk', 'ku', 'vi', 'tl', 'hi', 'ta', 'si', 'am', 'yo', 'om', 'rw'
];

const LANG_NAMES = {
    ar: 'العربية (Arabic)', en: 'English', id: 'Bahasa Indonesia', ms: 'Bahasa Melayu',
    ur: 'اردو (Urdu)', bn: 'বাংলা (Bengali)', tr: 'Türkçe (Turkish)', fa: 'فارسی (Persian)',
    ha: 'Hausa', fr: 'Français (French)', es: 'Español (Spanish)', de: 'Deutsch (German)',
    ru: 'Русский (Russian)', sw: 'Kiswahili (Swahili)', zh: '中文 (Chinese)', ko: '한국어 (Korean)',
    ja: '日本語 (Japanese)', bs: 'Bosanski (Bosnian)', sq: 'Shqip (Albanian)', uz: "O'zbekcha (Uzbek)",
    kk: 'Қазақша (Kazakh)', ku: 'Kurdî (Kurdish)', vi: 'Tiếng Việt (Vietnamese)', tl: 'Tagalog (Filipino)',
    hi: 'हिन्दी (Hindi)', ta: 'தமிழ் (Tamil)', si: 'සිංහල (Sinhala)', am: 'አማርኛ (Amharic)',
    yo: 'Yorùbá (Yoruba)', om: 'Afaan Oromoo (Oromo)', rw: 'Kinyarwanda (Kinyarwanda)'
};

// Keys whose values are intentionally identical across languages (NOT "untranslated").
const IGNORE_SAME_VALUE = new Set([
    'dir',        // 'ltr' / 'rtl'
    'amLabel',    // global time standard AM
    'pmLabel',    // global time standard PM
    'facebook',   // brand name
    'youtube',    // brand name
    'surahNames', // array, handled separately by length
]);

// Key prefixes that represent proper names (reciters) — optional translation, reported separately.
const PROPER_NAME_PREFIXES = ['reciters.'];

// Prefixes for feature windows (Tour / Help / Guide).
const TOUR_PREFIXES = ['tour'];
const HELP_PREFIXES = ['helpSlide'];
const GUIDE_PREFIXES = ['guide'];

// ----------------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------------

function loadLang(lang) {
    const file = path.join(I18N_DIR, `${lang}.json`);
    if (!fs.existsSync(file)) return null;
    try {
        return JSON.parse(fs.readFileSync(file, 'utf8'));
    } catch (e) {
        return { __parseError: e.message };
    }
}

// Flatten nested objects/arrays into "parent.child" keys for thorough comparison.
function flattenKeys(obj, prefix = '') {
    const out = {};
    if (obj === null || typeof obj !== 'object') return out;
    if (Array.isArray(obj)) {
        out[prefix] = `__array:${obj.length}`;
        return out;
    }
    for (const k of Object.keys(obj)) {
        const full = prefix ? `${prefix}.${k}` : k;
        const v = obj[k];
        if (v !== null && typeof v === 'object') {
            Object.assign(out, flattenKeys(v, full));
        } else {
            out[full] = v;
        }
    }
    return out;
}

function isProperName(key) {
    return PROPER_NAME_PREFIXES.some(p => key.startsWith(p));
}

// Should we skip the "same value as English" check for this key/value?
function skipSameCheck(key, value) {
    if (typeof value !== 'string') return true;
    if (IGNORE_SAME_VALUE.has(key)) return true;
    if (isProperName(key)) return true; // handled separately
    const trimmed = value.trim();
    if (trimmed === '') return true;
    // Pure URLs
    if (/^https?:\/\/\S+$/i.test(trimmed)) return true;
    // Pure emoji / symbol / punctuation values
    if (/^[\p{Emoji}\p{Symbol}\p{Punctuation}\s]+$/u.test(trimmed) && !/\p{L}/u.test(trimmed)) return true;
    // Pure numbers
    if (/^\d+(\.\d+)?$/.test(trimmed)) return true;
    return false;
}

function looksTranslatable(value) {
    if (typeof value !== 'string') return false;
    return /\p{L}/u.test(value);
}

// ----------------------------------------------------------------------------
// Main
// ----------------------------------------------------------------------------

function main() {
    console.log('Loading language files...');
    const data = {};
    for (const lang of LANGS) {
        const obj = loadLang(lang);
        data[lang] = obj;
        if (obj === null) {
            console.log(`  [MISSING FILE] ${lang}.json`);
        } else if (obj.__parseError) {
            console.log(`  [PARSE ERROR]  ${lang}.json -> ${obj.__parseError}`);
        } else {
            console.log(`  [OK]           ${lang}.json`);
        }
    }

    // Build the union of all scalar keys across all files.
    const allFlatKeys = new Set();
    for (const lang of LANGS) {
        const obj = data[lang];
        if (!obj || obj.__parseError) continue;
        const flat = flattenKeys(obj);
        for (const k of Object.keys(flat)) allFlatKeys.add(k);
    }
    const refKeys = Array.from(allFlatKeys).sort();
    console.log(`\nReference union keys: ${refKeys.length}`);

    const enFlat = data.en && !data.en.__parseError ? flattenKeys(data.en) : {};

    // Per-language analysis
    const results = {};
    for (const lang of LANGS) {
        const obj = data[lang];
        const res = {
            lang,
            name: LANG_NAMES[lang] || lang,
            fileMissing: false,
            parseError: null,
            missing: [],
            untranslated: [],   // real UI strings that match English
            properNames: [],    // reciter names left in English (separate)
            tourIssues: [],
            helpIssues: [],
            guideIssues: [],
            extra: [],
            surahNamesLen: null,
            recitersCount: null,
        };

        if (obj === null) {
            res.fileMissing = true;
            results[lang] = res;
            continue;
        }
        if (obj.__parseError) {
            res.parseError = obj.__parseError;
            results[lang] = res;
            continue;
        }

        const flat = flattenKeys(obj);

        // Missing keys (in reference, not in this language)
        for (const k of refKeys) {
            if (!(k in flat)) res.missing.push(k);
        }

        // Extra keys (in this language, not in reference)
        for (const k of Object.keys(flat)) {
            if (!refKeys.includes(k)) res.extra.push(k);
        }

        if (Array.isArray(obj.surahNames)) res.surahNamesLen = obj.surahNames.length;
        if (obj.reciters && typeof obj.reciters === 'object') {
            res.recitersCount = Object.keys(obj.reciters).length;
        }

        // Untranslated detection (skip English itself)
        if (lang !== 'en') {
            for (const k of refKeys) {
                if (skipSameCheck(k, enFlat[k])) continue;
                if (!(k in flat)) continue;
                const val = flat[k];
                if (typeof val !== 'string') continue;
                if (!looksTranslatable(val)) continue;
                const enVal = enFlat[k];
                if (typeof enVal !== 'string') continue;
                if (val === enVal) {
                    // Categorize into proper names vs real untranslated UI strings
                    if (isProperName(k)) {
                        res.properNames.push(k);
                    } else {
                        res.untranslated.push(k);
                        if (TOUR_PREFIXES.some(p => k.startsWith(p))) res.tourIssues.push(k);
                        if (HELP_PREFIXES.some(p => k.startsWith(p))) res.helpIssues.push(k);
                        if (GUIDE_PREFIXES.some(p => k.startsWith(p))) res.guideIssues.push(k);
                    }
                }
            }
        }

        results[lang] = res;
    }

    // Tour/help/guide coverage: ensure every key exists in each language
    const tourKeys = refKeys.filter(k => TOUR_PREFIXES.some(p => k.startsWith(p)));
    const helpKeys = refKeys.filter(k => HELP_PREFIXES.some(p => k.startsWith(p)));
    const guideKeys = refKeys.filter(k => GUIDE_PREFIXES.some(p => k.startsWith(p)));

    for (const lang of LANGS) {
        const r = results[lang];
        if (r.fileMissing || r.parseError) continue;
        const flat = flattenKeys(data[lang]);
        for (const k of tourKeys) if (!(k in flat)) r.tourIssues.push(k + ' [MISSING]');
        for (const k of helpKeys) if (!(k in flat)) r.helpIssues.push(k + ' [MISSING]');
        for (const k of guideKeys) if (!(k in flat)) r.guideIssues.push(k + ' [MISSING]');
        r.tourIssues = Array.from(new Set(r.tourIssues)).sort();
        r.helpIssues = Array.from(new Set(r.helpIssues)).sort();
        r.guideIssues = Array.from(new Set(r.guideIssues)).sort();
    }

    // -------------------- Build Markdown report --------------------
    const lines = [];
    const push = (s = '') => lines.push(s);

    push('# تقرير تدقيق ملفات الترجمة (Translation Audit Report)');
    push('');
    push(`> تاريخ التوليد: ${new Date().toISOString()}`);
    push('> هذا التقرير للقراءة فقط ولم يتم تعديل أي ملف ترجمة أثناء إنتاجه.');
    push('');
    push('---');
    push('');
    push('## 1. ملخص تنفيذي');
    push('');
    push(`- عدد اللغات المفحوصة: **${LANGS.length}**`);
    push(`- عدد المفاتيح المرجعية (إتحاد كل المفاتيح): **${refKeys.length}**`);
    const missingFile = LANGS.filter(l => results[l].fileMissing);
    const parseErr = LANGS.filter(l => results[l].parseError);
    push(`- ملفات مفقودة: **${missingFile.length}** ${missingFile.length ? '(' + missingFile.join(', ') + ')' : ''}`);
    push(`- ملفات بها خطأ تحليل (JSON parse error): **${parseErr.length}** ${parseErr.length ? '(' + parseErr.join(', ') + ')' : ''}`);
    push('');
    push('**ملاحظة هامة عن التصنيفات:**');
    push('');
    push('| الفئة | المعنى | الأولوية |');
    push('|---|---|---|');
    push('| المفاتيح المفقودة | مفاتيح غير موجودة إطلاقاً في ملف اللغة (تظهر بالإنجليزية أو تسبب أخطاء) | 🔴 عالية |');
    push('| غير المترجمة (UI) | نصوص واجهة حقيقية قيمتها مطابقة للإنجليزية | 🔴 عالية |');
    push('| أسماء القراء (proper) | أسماء قرّاء تُركت بالإنجليزية (ترجمتها اختيارية) | 🟢 منخفضة |');
    push('| علامات تجارية | Facebook/YouTube/AM/PM (تُترك عادةً كما هي) | ⚪ لا تُترجم |');
    push('');

    // Summary table
    push('## 2. جدول ملخص لكل لغة');
    push('');
    push('| اللغة | المفقودة | غير المترجمة (UI) | أسماء قراء بالإنجليزية | مشاكل Tour | helpSlide | guide | أسماء السور |');
    push('|---|---:|---:|---:|---:|---:|---:|---:|');
    for (const lang of LANGS) {
        const r = results[lang];
        const sn = r.surahNamesLen === null ? '—' : (r.surahNamesLen === 114 ? '✅ 114' : `⚠️ ${r.surahNamesLen}`);
        push(`| ${r.name} (${lang}) | ${r.missing.length} | ${r.untranslated.length} | ${r.properNames.length} | ${r.tourIssues.length} | ${r.helpIssues.length} | ${r.guideIssues.length} | ${sn} |`);
    }
    push('');

    // Priority ranking (only missing + untranslated UI, NOT proper names)
    push('## 3. تصنيف اللغات حسب أولوية المعالجة (UI فقط)');
    push('');
    push('_يستثني هذا الترتيب أسماء القراء لأن ترجمتها اختيارية._');
    push('');
    const ranked = LANGS
        .map(l => ({ l, r: results[l], score: results[l].missing.length + results[l].untranslated.length }))
        .filter(x => x.l !== 'en')
        .sort((a, b) => b.score - a.score);
    push('| الترتيب | اللغة | المفقودة | غير المترجمة (UI) | الإجمالي | الأولوية |');
    push('|---:|---|---:|---:|---:|---|');
    ranked.forEach((x, i) => {
        const priority = x.score === 0 ? '✅ مكتملة' : x.score > 30 ? '🔴 عالية' : x.score > 5 ? '🟡 متوسطة' : '🟢 منخفضة';
        push(`| ${i + 1} | ${x.r.name} (${x.l}) | ${x.r.missing.length} | ${x.r.untranslated.length} | ${x.score} | ${priority} |`);
    });
    push('');

    // Per-language details
    push('## 4. تفاصيل كل لغة');
    push('');
    for (const lang of LANGS) {
        const r = results[lang];
        push(`### 4.${LANGS.indexOf(lang) + 1} ${r.name} \`${lang}\``);
        push('');
        if (r.fileMissing) {
            push('⚠️ **ملف اللغة مفقود تماماً.**');
            push('');
            continue;
        }
        if (r.parseError) {
            push(`🔴 **خطأ في تحليل JSON:** \`${r.parseError}\``);
            push('');
            continue;
        }
        push(`- المفاتيح المفقودة: **${r.missing.length}**`);
        push(`- غير المترجمة (UI): **${r.untranslated.length}**`);
        push(`- أسماء قرّاء بالإنجليزية (اختياري): **${r.properNames.length}**`);
        push(`- مشاكل الجولة الترحيبية (Tour): **${r.tourIssues.length}**`);
        push(`- شرائح المساعدة (helpSlide): **${r.helpIssues.length}**`);
        push(`- أدلة الاستخدام (guide): **${r.guideIssues.length}**`);
        push(`- مفاتيح إضافية (غير موجودة في المرجع): **${r.extra.length}**`);
        push(`- أسماء السور: ${r.surahNamesLen === 114 ? '✅ 114' : r.surahNamesLen}`);
        push('');

        if (r.missing.length) {
            push('<details><summary>🔑 المفاتيح المفقودة (اضغط للتوسيع)</summary>');
            push('');
            for (const k of r.missing) push(`- \`${k}\``);
            push('');
            push('</details>');
            push('');
        }
        if (r.untranslated.length) {
            push('<details><summary>🔤 المفاتيح غير المترجمة - UI (اضغط للتوسيع)</summary>');
            push('');
            for (const k of r.untranslated) push(`- \`${k}\` => \`${String(enFlat[k]).slice(0, 70)}\``);
            push('');
            push('</details>');
            push('');
        }
        if (r.properNames.length) {
            push('<details><summary>🎙️ أسماء القرّاء بالإنجليزية (اختياري الترجمة)</summary>');
            push('');
            for (const k of r.properNames) push(`- \`${k}\` => \`${String(enFlat[k]).slice(0, 50)}\``);
            push('');
            push('</details>');
            push('');
        }
        if (r.tourIssues.length) {
            push('<details><summary>🎯 مشاكل الجولة الترحيبية Tour (اضغط للتوسيع)</summary>');
            push('');
            for (const k of r.tourIssues) push(`- \`${k}\``);
            push('');
            push('</details>');
            push('');
        }
        if (r.helpIssues.length) {
            push('<details><summary>📖 شرائح المساعدة helpSlide (اضغط للتوسيع)</summary>');
            push('');
            for (const k of r.helpIssues) push(`- \`${k}\``);
            push('');
            push('</details>');
            push('');
        }
        if (r.guideIssues.length) {
            push('<details><summary>🧭 أدلة الاستخدام guide (اضغط للتوسيع)</summary>');
            push('');
            for (const k of r.guideIssues) push(`- \`${k}\``);
            push('');
            push('</details>');
            push('');
        }
        if (r.extra.length) {
            push('<details><summary>➕ مفاتيح إضافية في هذا الملف (معلومات فقط)</summary>');
            push('');
            for (const k of r.extra) push(`- \`${k}\``);
            push('');
            push('</details>');
            push('');
        }
        push('---');
        push('');
    }

    // Cross-language: most-missing keys
    push('## 5. المفاتيح الأكثر غياباً عبر كل اللغات');
    push('');
    const missingCount = {};
    for (const lang of LANGS) {
        const r = results[lang];
        if (r.fileMissing || r.parseError) continue;
        for (const k of r.missing) missingCount[k] = (missingCount[k] || 0) + 1;
    }
    const worstMissing = Object.entries(missingCount).sort((a, b) => b[1] - a[1]);
    if (worstMissing.length === 0) {
        push('✅ لا توجد مفاتيح مفقودة في أي لغة.');
    } else {
        push('| المفتاح | عدد اللغات التي يغيب عنها |');
        push('|---|---:|');
        for (const [k, c] of worstMissing.slice(0, 40)) push(`| \`${k}\` | ${c} / ${LANGS.length} |`);
        if (worstMissing.length > 40) push(`| ... و ${worstMissing.length - 40} مفتاح آخر | — |`);
    }
    push('');

    // Cross-language: most-untranslated UI keys
    push('## 6. المفاتيح الأكثر تركاً بدون ترجمة (UI فقط)');
    push('');
    const untransCount = {};
    for (const lang of LANGS) {
        if (lang === 'en') continue;
        const r = results[lang];
        if (r.fileMissing || r.parseError) continue;
        for (const k of r.untranslated) untransCount[k] = (untransCount[k] || 0) + 1;
    }
    const worstUntrans = Object.entries(untransCount).sort((a, b) => b[1] - a[1]);
    if (worstUntrans.length === 0) {
        push('✅ كل مفاتيح الواجهة مترجمة في كل اللغات.');
    } else {
        push('| المفتاح | عدد اللغات غير المترجم فيها | القيمة الإنجليزية |');
        push('|---|---:|---|');
        for (const [k, c] of worstUntrans.slice(0, 40)) {
            const preview = String(enFlat[k] || '').slice(0, 60).replace(/\|/g, '\\|');
            push(`| \`${k}\` | ${c} / ${LANGS.length - 1} | \`${preview}\` |`);
        }
        if (worstUntrans.length > 40) push(`| ... و ${worstUntrans.length - 40} مفتاح آخر | — | — |`);
    }
    push('');

    // Plan of action
    push('## 7. خطة العمل المقترحة (آمنة)');
    push('');
    push('بناءً على النتائج أعلاه، إليك خطة المعالجة بدون المخاطرة بالملفات:');
    push('');
    push('1. **عزل كل لغة في ملف مستقل** (مبدأ إدارة اللغات في القواعد): كل تعديل يتم على ملف واحد فقط في كل مرة.');
    push('2. **البدء باللغات ذات الأولوية العالية** في الجدول بقسم 3.');
    push('3. **معالجة المفاتيح المفقودة أولاً** (هي التي تظهر بالإنجليزية افتراضياً أو تسبب أخطاء runtime).');
    push('4. **معالجة الجولة الترحيبية (Tour)** كل نافذة على حدة لأنها أول ما يراه المستخدم الجديد.');
    push('5. **مراجعة المفاتيح غير المترجمة (UI)** والتأكد أنها فعلاً بحاجة لترجمة.');
    push('6. **أسماء القرّاء اختيارية**: يمكن تركها بالإنجليزية أو ترجمتها لكل لغة حسب الحاجة.');
    push('7. **أخذ نسخة احتياطية** قبل أي تعديل: `copy src\\assets\\i18n\\XX.json src\\assets\\i18n\\XX.json.bak`.');
    push('8. **إعادة تشغيل هذا السكريبت** بعد كل دفعة تعديلات للتأكد من تحسن الأرقام.');
    push('');
    push('---');
    push('');
    push('## 8. ملاحظات تقنية');
    push('');
    push('- المرجع المستخدم هو **اتحاد (union)** كل المفاتيح الموجودة في كل ملفات JSON الـ 31.');
    push('- كشف "غير المترجم" يعتمد على مطابقة **تامة** للقيمة مع الإنجليزية، مع استبعاد الروابط والرموز التعبيرية والمصفوفات والعلامات التجارية.');
    push('- **أسماء القرّاء** (`reciters.*`) مفصولة في تقرير خاص لأنها أسماء علم وترجمتها اختيارية.');
    push('- **أسماء السور** (`surahNames`) يتم الإبلاغ عن عددها فقط لأنها مصفوفة.');
    push('- هذا السكريبت **للقراءة فقط** ولم يتم تعديل أي ملف ترجمة.');
    push('');

    fs.writeFileSync(REPORT_PATH, lines.join('\n'), 'utf8');
    console.log(`\n✅ Report written to: ${REPORT_PATH}`);

    console.log('\n===== QUICK SUMMARY =====');
    for (const lang of LANGS) {
        const r = results[lang];
        if (r.fileMissing) { console.log(`  ${lang.padEnd(4)} MISSING FILE`); continue; }
        if (r.parseError) { console.log(`  ${lang.padEnd(4)} PARSE ERROR`); continue; }
        console.log(`  ${lang.padEnd(4)} missing=${r.missing.length} untrans(UI)=${r.untranslated.length} proper=${r.properNames.length} tour=${r.tourIssues.length} help=${r.helpIssues.length} guide=${r.guideIssues.length}`);
    }
}

main();