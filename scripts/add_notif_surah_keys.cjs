/**
 * إضافة مفاتيح الإشعارات الجديدة لجميع ملفات الترجمة
 * notif_surah_reminder, notif_surah_kahf_body, notif_surah_mulk_body, notif_surah_baqarah_body
 */
const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..', 'src', 'assets', 'i18n');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));

const newKeys = {
  notif_surah_reminder: 'Surah {surahName} Reminder',
  notif_surah_kahf_body: 'Time to read Surah {surahName} on Friday',
  notif_surah_mulk_body: 'Time to read Surah {surahName} before sleep',
  notif_surah_baqarah_body: 'Time to read Surah {surahName}'
};

// ترجمات محددة لكل لغة
const translations = {
  ar: {
    notif_surah_reminder: 'تذكير بسورة {surahName}',
    notif_surah_kahf_body: 'حان وقت قراءة سورة {surahName} يوم الجمعة',
    notif_surah_mulk_body: 'حان وقت قراءة سورة {surahName} قبل النوم',
    notif_surah_baqarah_body: 'حان وقت قراءة سورة {surahName}'
  },
  en: {
    notif_surah_reminder: 'Surah {surahName} Reminder',
    notif_surah_kahf_body: 'Time to read Surah {surahName} on Friday',
    notif_surah_mulk_body: 'Time to read Surah {surahName} before sleep',
    notif_surah_baqarah_body: 'Time to read Surah {surahName}'
  },
  ru: {
    notif_surah_reminder: 'Напоминание о суре {surahName}',
    notif_surah_kahf_body: 'Время читать суру {surahName} в пятницу',
    notif_surah_mulk_body: 'Время читать суру {surahName} перед сном',
    notif_surah_baqarah_body: 'Время читать суру {surahName}'
  },
  id: {
    notif_surah_reminder: 'Pengingat Surah {surahName}',
    notif_surah_kahf_body: 'Saatnya membaca Surah {surahName} pada hari Jumat',
    notif_surah_mulk_body: 'Saatnya membaca Surah {surahName} sebelum tidur',
    notif_surah_baqarah_body: 'Saatnya membaca Surah {surahName}'
  },
  ms: {
    notif_surah_reminder: 'Peringatan Surah {surahName}',
    notif_surah_kahf_body: 'Masanya membaca Surah {surahName} pada hari Jumaat',
    notif_surah_mulk_body: 'Masanya membaca Surah {surahName} sebelum tidur',
    notif_surah_baqarah_body: 'Masanya membaca Surah {surahName}'
  },
  ur: {
    notif_surah_reminder: 'سورة {surahName} کی یاددہانی',
    notif_surah_kahf_body: 'جمعہ کے دن سورة {surahName} پڑھنے کا وقت',
    notif_surah_mulk_body: 'سونے سے پہلے سورة {surahName} پڑھنے کا وقت',
    notif_surah_baqarah_body: 'سورة {surahName} پڑھنے کا وقت'
  },
  bn: {
    notif_surah_reminder: 'সূরা {surahName} রিমাইন্ডার',
    notif_surah_kahf_body: 'শুক্রবার সূরা {surahName} পড়ার সময়',
    notif_surah_mulk_body: 'ঘুমানোর আগে সূরা {surahName} পড়ার সময়',
    notif_surah_baqarah_body: 'সূরা {surahName} পড়ার সময়'
  },
  tr: {
    notif_surah_reminder: '{surahName} Suresi Hatırlatması',
    notif_surah_kahf_body: 'Cuma günü {surahName} Suresini okuma vakti',
    notif_surah_mulk_body: 'Uyumadan önce {surahName} Suresini okuma vakti',
    notif_surah_baqarah_body: '{surahName} Suresini okuma vakti'
  },
  fa: {
    notif_surah_reminder: 'یادآوری سوره {surahName}',
    notif_surah_kahf_body: 'زمان خواندن سوره {surahName} در روز جمعه',
    notif_surah_mulk_body: 'زمان خواندن سوره {surahName} قبل از خواب',
    notif_surah_baqarah_body: 'زمان خواندن سوره {surahName}'
  },
  fr: {
    notif_surah_reminder: 'Rappel de la Sourate {surahName}',
    notif_surah_kahf_body: 'Il est temps de lire la Sourate {surahName} le vendredi',
    notif_surah_mulk_body: 'Il est temps de lire la Sourate {surahName} avant de dormir',
    notif_surah_baqarah_body: 'Il est temps de lire la Sourate {surahName}'
  },
  de: {
    notif_surah_reminder: 'Erinnerung an Surah {surahName}',
    notif_surah_kahf_body: 'Zeit, Surah {surahName} am Freitag zu lesen',
    notif_surah_mulk_body: 'Zeit, Surah {surahName} vor dem Schlafen zu lesen',
    notif_surah_baqarah_body: 'Zeit, Surah {surahName} zu lesen'
  },
  es: {
    notif_surah_reminder: 'Recordatorio de Sura {surahName}',
    notif_surah_kahf_body: 'Es hora de leer la Sura {surahName} el viernes',
    notif_surah_mulk_body: 'Es hora de leer la Sura {surahName} antes de dormir',
    notif_surah_baqarah_body: 'Es hora de leer la Sura {surahName}'
  },
  ha: {
    notif_surah_reminder: 'Tunatarwa game da Surah {surahName}',
    notif_surah_kahf_body: 'Lokaci ya yi na karanta Surah {surahName} a ranar Jumma\'a',
    notif_surah_mulk_body: 'Lokaci ya yi na karanta Surah {surahName} kafin barci',
    notif_surah_baqarah_body: 'Lokaci ya yi na karanta Surah {surahName}'
  },
  sw: {
    notif_surah_reminder: 'Kumbusho la Surah {surahName}',
    notif_surah_kahf_body: 'Ni wakati wa kusoma Surah {surahName} Ijumaa',
    notif_surah_mulk_body: 'Ni wakati wa kusoma Surah {surahName} kabla ya kulala',
    notif_surah_baqarah_body: 'Ni wakati wa kusoma Surah {surahName}'
  },
  zh: {
    notif_surah_reminder: '{surahName} 提醒',
    notif_surah_kahf_body: '是时候在星期五阅读 {surahName} 了',
    notif_surah_mulk_body: '是时候在睡前阅读 {surahName} 了',
    notif_surah_baqarah_body: '是时候阅读 {surahName} 了'
  },
  ko: {
    notif_surah_reminder: '{surahName} 알림',
    notif_surah_kahf_body: '금요일에 {surahName}을(를) 읽을 시간입니다',
    notif_surah_mulk_body: '취침 전 {surahName}을(를) 읽을 시간입니다',
    notif_surah_baqarah_body: '{surahName}을(를) 읽을 시간입니다'
  },
  ja: {
    notif_surah_reminder: '{surahName}のリマインダー',
    notif_surah_kahf_body: '金曜日に{surahName}を読む時間です',
    notif_surah_mulk_body: '就寝前に{surahName}を読む時間です',
    notif_surah_baqarah_body: '{surahName}を読む時間です'
  },
  bs: {
    notif_surah_reminder: 'Podsjetnik za Suru {surahName}',
    notif_surah_kahf_body: 'Vrijeme je za čitanje Sure {surahName} u petak',
    notif_surah_mulk_body: 'Vrijeme je za čitanje Sure {surahName} prije spavanja',
    notif_surah_baqarah_body: 'Vrijeme je za čitanje Sure {surahName}'
  },
  sq: {
    notif_surah_reminder: 'Kujtesë për Surën {surahName}',
    notif_surah_kahf_body: 'Është koha për të lexuar Surën {surahName} të premten',
    notif_surah_mulk_body: 'Është koha për të lexuar Surën {surahName} para gjumit',
    notif_surah_baqarah_body: 'Është koha për të lexuar Surën {surahName}'
  },
  uz: {
    notif_surah_reminder: '{surahName} surasi eslatmasi',
    notif_surah_kahf_body: 'Juma kuni {surahName} surasini o\'qish vaqti',
    notif_surah_mulk_body: 'Uyqudan oldin {surahName} surasini o\'qish vaqti',
    notif_surah_baqarah_body: '{surahName} surasini o\'qish vaqti'
  },
  kk: {
    notif_surah_reminder: '{surahName} сүресінің еске салғызы',
    notif_surah_kahf_body: 'Жұма күні {surahName} сүресін оқу уақыты',
    notif_surah_mulk_body: 'Ұйықтар алдында {surahName} сүресін оқу уақыты',
    notif_surah_baqarah_body: '{surahName} сүресін оқу уақыты'
  },
  ku: {
    notif_surah_reminder: 'بیرخستنەوەی سورەتی {surahName}',
    notif_surah_kahf_body: 'کاتی خوێندنەوەی سورەتی {surahName} لە ڕۆژی ھەینی',
    notif_surah_mulk_body: 'کاتی خوێندنەوەی سورەتی {surahName} پێش خەو',
    notif_surah_baqarah_body: 'کاتی خوێندنەوەی سورەتی {surahName}'
  },
  vi: {
    notif_surah_reminder: 'Nhắc nhở Surah {surahName}',
    notif_surah_kahf_body: 'Đã đến lúc đọc Surah {surahName} vào thứ Sáu',
    notif_surah_mulk_body: 'Đã đến lúc đọc Surah {surahName} trước khi ngủ',
    notif_surah_baqarah_body: 'Đã đến lúc đọc Surah {surahName}'
  },
  tl: {
    notif_surah_reminder: 'Paalala para sa Surah {surahName}',
    notif_surah_kahf_body: 'Oras na para basahin ang Surah {surahName} sa Biyernes',
    notif_surah_mulk_body: 'Oras na para basahin ang Surah {surahName} bago matulog',
    notif_surah_baqarah_body: 'Oras na para basahin ang Surah {surahName}'
  },
  hi: {
    notif_surah_reminder: 'सूरा {surahName} रिमाइंडर',
    notif_surah_kahf_body: 'शुक्रवार को सूरा {surahName} पढ़ने का समय',
    notif_surah_mulk_body: 'सोने से पहले सूरा {surahName} पढ़ने का समय',
    notif_surah_baqarah_body: 'सूरा {surahName} पढ़ने का समय'
  },
  ta: {
    notif_surah_reminder: 'சூரா {surahName} நினைவூட்டல்',
    notif_surah_kahf_body: 'வெள்ளிக்கிழமை சூரா {surahName} படிக்க நேரம்',
    notif_surah_mulk_body: 'தூங்கும் முன் சூரா {surahName} படிக்க நேரம்',
    notif_surah_baqarah_body: 'சூரா {surahName} படிக்க நேரம்'
  },
  si: {
    notif_surah_reminder: 'සූරා {surahName} මතක් කිරීම',
    notif_surah_kahf_body: 'සිකුරාදා සූරා {surahName} කියවීමට වේලාවයි',
    notif_surah_mulk_body: 'නින්දට පෙර සූරා {surahName} කියවීමට වේලාවයි',
    notif_surah_baqarah_body: 'සූරා {surahName} කියවීමට වේලාවයි'
  },
  am: {
    notif_surah_reminder: 'የ{surahName} ሱራ ማስታወሻ',
    notif_surah_kahf_body: 'በዓርብ ቀን የ{surahName} ሱራ ማንበብ ጊዜው ነው',
    notif_surah_mulk_body: 'ከመተኛት በፊት የ{surahName} ሱራ ማንበብ ጊዜው ነው',
    notif_surah_baqarah_body: 'የ{surahName} ሱራ ማንበብ ጊዜው ነው'
  },
  yo: {
    notif_surah_reminder: 'Irantansi Surah {surahName}',
    notif_surah_kahf_body: 'Akoko lati ka Surah {surahName} ni Ojo Jumok',
    notif_surah_mulk_body: 'Akoko lati ka Surah {surahName} kuro sun',
    notif_surah_baqarah_body: 'Akoko lati ka Surah {surahName}'
  },
  om: {
    notif_surah_reminder: "Yaadachiisa Suura {surahName}",
    notif_surah_kahf_body: "Guyya Jimaa Suura {surahName} dubbisuuf sa'aati",
    notif_surah_mulk_body: "Hinyaatin dura Suura {surahName} dubbisuuf sa'aati",
    notif_surah_baqarah_body: "Suura {surahName} dubbisuuf sa'aati"
  },
  rw: {
    notif_surah_reminder: 'Kwibutsa Surah {surahName}',
    notif_surah_kahf_body: 'Ni igihe cyo gusoma Surah {surahName} ku wa Gatandatu',
    notif_surah_mulk_body: 'Ni igihe cyo gusoma Surah {surahName} mbere yo kujya kuryama',
    notif_surah_baqarah_body: 'Ni igihe cyo gusoma Surah {surahName}'
  }
};

let updated = 0;
files.forEach(file => {
  const lang = file.replace('.json', '');
  const filePath = path.join(dir, file);
  const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  
  const t = translations[lang] || newKeys; // fallback to English
  
  let changed = false;
  for (const [key, value] of Object.entries(t)) {
    if (!content[key]) {
      content[key] = value;
      changed = true;
    }
  }
  
  // حذف المفاتيح القديمة إن وُجدت
  const oldKeys = ['notif_kahf_title', 'notif_kahf_body', 'notif_mulk_title', 'notif_mulk_body', 
                   'notif_baqarah_title', 'notif_baqarah_body', 'surah_kahf', 'surah_mulk', 'surah_baqarah'];
  oldKeys.forEach(k => {
    if (content[k]) {
      delete content[k];
      changed = true;
    }
  });
  
  if (changed) {
    fs.writeFileSync(filePath, JSON.stringify(content, null, 2) + '\n', 'utf8');
    console.log(`✅ ${file} - updated`);
    updated++;
  } else {
    console.log(`⏭️ ${file} - no changes needed`);
  }
});

console.log(`\nDone! ${updated} files updated.`);