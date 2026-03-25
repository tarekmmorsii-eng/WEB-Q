const fs = require('fs');

const replacement = `export const LANGUAGE_NAMES: Record<Language, string> = {
    ar: 'العربية',
    en: 'English',
    id: 'Bahasa Indonesia',
    ms: 'Bahasa Melayu',
    ur: 'اردو',
    bn: 'বাংলা',
    tr: 'Türkçe',
    fa: 'فارسی',
    ha: 'Hausa',
    fr: 'Français',
    es: 'Español',
    de: 'Deutsch',
    ru: 'Русский',
    sw: 'Kiswahili',
    zh: '中文',
    ko: '한국어',
    ja: '日本語',
    bs: 'Bosanski',
    sq: 'Shqip',
    uz: "O'zbekcha",
    kk: 'Қазақша',
    ku: 'Kurdî',
    vi: 'Tiếng Việt',
    tl: 'Tagalog',
    hi: 'हिन्दी',
    ta: 'தமிழ்',
    si: 'සිංහල',
    am: 'አማርኛ',
    yo: 'Yorùbá',
    om: 'Afaan Oromoo',
    rw: 'Kinyarwanda'
};`;

let content = fs.readFileSync('i18n/translations.ts', 'utf-8');
content = content.replace(/export const LANGUAGE_NAMES[\s\S]*?\};/, replacement);
fs.writeFileSync('i18n/translations.ts', content);
console.log('LANGUAGE_NAMES has been successfully updated.');
