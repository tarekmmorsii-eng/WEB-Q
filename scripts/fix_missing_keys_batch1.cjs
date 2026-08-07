/*
 * Fix Missing Keys - Batch 1 (SAFE)
 * ---------------------------------
 * Adds ONLY the 6 most-missing keys to languages that lack them.
 * Uses JSON.parse/stringify (100% Unicode-safe via 'utf8' encoding).
 * No regex, no Buffer, no iconv - pure JSON object manipulation.
 *
 * Keys added: builtInSubtitle, badgeTafsirWbw, badgeTafsirOnly,
 *             totalLanguagesLabel, downloadedLabel, translationAyah
 */

const fs = require('fs');
const path = require('path');

const I18N_DIR = path.join(__dirname, '..', 'src', 'assets', 'i18n');

// Hand-curated translations for each language (no auto-translate, accurate).
const TRANSLATIONS = {
    ms: {
        builtInSubtitle: "Terbina • Makna Perkataan oleh Bashir Yunus",
        badgeTafsirWbw: "Tafsir + Makna Perkataan",
        badgeTafsirOnly: "Tafsir sahaja",
        totalLanguagesLabel: "Jumlah Bahasa",
        downloadedLabel: "Dimuat turun",
        translationAyah: "Terjemahan Ayat"
    },
    ur: {
        builtInSubtitle: "بلٹ ان • بشیر یونس کی لفظ بہ لفظ معنی",
        badgeTafsirWbw: "تفسیر + الفاظ کے معنی",
        badgeTafsirOnly: "صرف تفسیر",
        totalLanguagesLabel: "کل زبانیں",
        downloadedLabel: "ڈاؤن لوڈ شدہ",
        translationAyah: "آیت کا ترجمہ"
    },
    ru: {
        builtInSubtitle: "Встроено • Пословный перевод от Башира Юнуса",
        badgeTafsirWbw: "Тафсир + значения слов",
        badgeTafsirOnly: "Только тафсир",
        totalLanguagesLabel: "Всего языков",
        downloadedLabel: "Загружено",
        translationAyah: "Перевод аята"
    },
    sw: {
        builtInSubtitle: "Iliyojengwa ndani • Maana ya Neno kwa Neno na Bashir Yunus",
        badgeTafsirWbw: "Tafsiri + Maana za Maneno",
        badgeTafsirOnly: "Tafsiri tu",
        totalLanguagesLabel: "Jumla ya Lugha",
        downloadedLabel: "Imepakuliwa",
        translationAyah: "Tafsiri ya Aya"
    },
    zh: {
        builtInSubtitle: "内置 • Bashir Yunus 逐词释义",
        badgeTafsirWbw: "经注 + 词汇释义",
        badgeTafsirOnly: "仅经注",
        totalLanguagesLabel: "语言总数",
        downloadedLabel: "已下载",
        translationAyah: "经文翻译"
    },
    ko: {
        builtInSubtitle: "내장 • Bashir Yunus의 단어별 의미",
        badgeTafsirWbw: "타프시르 + 단어 의미",
        badgeTafsirOnly: "타프시르만",
        totalLanguagesLabel: "전체 언어",
        downloadedLabel: "다운로드됨",
        translationAyah: "구절 번역"
    },
    sq: {
        builtInSubtitle: "E integruar • Kuptimi fjalë për fjalë nga Bashir Yunus",
        badgeTafsirWbw: "Tefsir + Kuptimet e fjalëve",
        badgeTafsirOnly: "Vetëm tefsir",
        totalLanguagesLabel: "Gjuhët totale",
        downloadedLabel: "Shkarkuar",
        translationAyah: "Përkthimi i Ajetit"
    },
    uz: {
        builtInSubtitle: "Ichki • Bashir Yunus so'zma-so'z ma'nosi",
        badgeTafsirWbw: "Tafsir + So'z ma'nolari",
        badgeTafsirOnly: "Faqat tafsir",
        totalLanguagesLabel: "Jami tillar",
        downloadedLabel: "Yuklab olindi",
        translationAyah: "Oyat tarjimasi"
    },
    kk: {
        builtInSubtitle: "Ішкі • Bashir Yunus сөзбе-сөз мағынасы",
        badgeTafsirWbw: "Тәфсір + Сөздердің мағынасы",
        badgeTafsirOnly: "Тек тәфсір",
        totalLanguagesLabel: "Барлық тілдер",
        downloadedLabel: "Жүктелді",
        translationAyah: "Аят аудармасы"
    },
    ku: {
        builtInSubtitle: "ناوەکی • واتای وشە بە وشە لەلایەن بەشیر یونسەوە",
        badgeTafsirWbw: "تەفسیر + واتاکانی وشەکان",
        badgeTafsirOnly: "تەنها تەفسیر",
        totalLanguagesLabel: "کۆی زمانەکان",
        downloadedLabel: "داگیرا",
        translationAyah: "وەرگێڕانی ئایەت"
    },
    vi: {
        builtInSubtitle: "Tích hợp sẵn • Ý nghĩa từng từ bởi Bashir Yunus",
        badgeTafsirWbw: "Tafsir + Ý nghĩa từ",
        badgeTafsirOnly: "Chỉ Tafsir",
        totalLanguagesLabel: "Tổng số ngôn ngữ",
        downloadedLabel: "Đã tải xuống",
        translationAyah: "Dịch câu Kinh"
    },
    tl: {
        builtInSubtitle: "Built-in • Kahulugan Salita-sa-Salita ni Bashir Yunus",
        badgeTafsirWbw: "Tafsir + Kahulugan ng Salita",
        badgeTafsirOnly: "Tafsir lamang",
        totalLanguagesLabel: "Kabuuang Wika",
        downloadedLabel: "Na-download",
        translationAyah: "Salin ng Talata"
    },
    ta: {
        builtInSubtitle: "உள்ளமைக்கப்பட்டது • பஷீர் யூனுஸ் சொல்லுக்கு சொல் பொருள்",
        badgeTafsirWbw: "தஃப்சீர் + சொற்களின் பொருள்கள்",
        badgeTafsirOnly: "தஃப்சீர் மட்டும்",
        totalLanguagesLabel: "மொத்த மொழிகள்",
        downloadedLabel: "பதிவிறக்கப்பட்டது",
        translationAyah: "வசனம் மொழிபெயர்ப்பு"
    }
};

// Turkish only needs translationAyah
const TR_FIX = {
    tr: {
        translationAyah: "Ayet Çevirisi"
    }
};

function processLang(lang, keysToAdd) {
    const file = path.join(I18N_DIR, `${lang}.json`);
    const raw = fs.readFileSync(file, 'utf8');
    const obj = JSON.parse(raw);

    let added = 0;
    for (const [key, value] of Object.entries(keysToAdd)) {
        if (!(key in obj)) {
            obj[key] = value;
            added++;
        }
    }

    if (added === 0) {
        console.log(`  ${lang}: no missing keys found, skipped.`);
        return;
    }

    // Write back with 2-space indentation, UTF-8 (Unicode-safe).
    fs.writeFileSync(file, JSON.stringify(obj, null, 2), 'utf8');
    console.log(`  ${lang}: added ${added} key(s).`);
}

console.log('Processing 13 languages (6 missing keys each)...');
for (const lang of Object.keys(TRANSLATIONS)) {
    processLang(lang, TRANSLATIONS[lang]);
}

console.log('\nProcessing Turkish (only translationAyah missing)...');
processLang('tr', TR_FIX.tr);

console.log('\n✅ Done. Re-run audit to verify.');