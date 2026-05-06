/**
 * Script to add missing i18n translation keys to all 31 language files.
 * This fixes hardcoded strings found during QA review.
 * 
 * Run: node scripts/fix_i18n_hardcoded.cjs
 */

const fs = require('fs');
const path = require('path');

const I18N_DIR = path.join(__dirname, '..', 'src', 'assets', 'i18n');

// ─── New UI string keys ─────────────────────────────────────────────
const NEW_KEYS_AR = {
  ayahRecitation: 'تلاوة الآيات',
  interactiveTour: 'جولة افتراضية للشرح',
  gotIt: 'قد فهمت',
  spaceSavingTip: 'تلميح لتوفير المساحة: لا داعي لتحميل السورة كاملة! يمكنك الاكتفاء بالاستماع للكلمات الصعبة أثناء القراءة، وسيقوم التطبيق بحفظها تلقائياً للعمل بدون إنترنت.',
  clearAudioCache: 'مسح الذاكرة المؤقتة ({{size}} MB)',
  confirmDeletion: 'تأكيد الحذف',
  confirmDeleteCacheMsg: 'هل أنت متأكد من مسح جميع التلاوات المحملة؟ ستحتاج إلى إنترنت لتحميلها مجدداً.',
  yesClearDownloads: 'نعم، امسح التنزيلات',
  noConnection: 'لا يوجد اتصال بالإنترنت',
  noConnectionRetry: 'لا يوجد اتصال بالإنترنت. يرجى الاتصال ثم المحاولة مجدداً.',
  downloadFailed: 'فشل التحميل — تحقق من اتصالك بالإنترنت',
  downloadFailedServer: 'عذراً، فشل التحميل. بعض ملفات هذا القارئ غير متوفرة على السيرفر.',
  audioCacheCleared: 'تم مسح الذاكرة المؤقتة بنجاح',
  failedDownloadWords: 'عذراً، فشل تحميل كلمات السورة.',
  alreadyDownloadedLabel: 'تم تحميلها',
  shareAppNative: 'مشاركة التطبيق',
  shareAppDescNative: 'انشر الخير.. شارك التطبيق مع من تحب',
  shareAppWithFriends: 'شارك التطبيق مع أصدقائك',
  shareWebsite: 'مشاركة الموقع',
  qrCode: 'رمز الاستجابة السريعة (QR)',
  appUpdateAvailableAlt: 'تحديث التطبيق متوفر',
  appInstalledAlt: 'التطبيق مثبت على جهازك',
  startingInstallAlt: 'جاري بدء التثبيت...',
  clickToInstallLatestAlt: 'اضغط لتثبيت أحدث الميزات والإصلاحات البرمجية',
  weWillUpdateCodeAlt: 'أي كود جديد سنحدثه لك هنا',
  installFrameAlt: 'تثبيت الإطار البرمجي للوصول السريع',
  mushafUpdatedSaved: 'المصحف محدّث ومحفوظ كاملًا',
  browseOfflineNowAlt: 'يمكنك التصفح والمراجعة بدون إنترنت الآن',
  mushafApp: 'تطبيق مصحف المراجعة',
  amazingApp: 'تطبيق رائع للمراجعة والحفظ',
  copyLink: 'نسخ الرابط',
  otherOptions: 'خيارات أخرى',
  linkCopied: 'تم نسخ الرابط بنجاح',
  mushafAlMurajaa: 'مصحف المراجعة',
  amLabel: 'ص',
  pmLabel: 'م',
  reciterSectionMurattal: '────── التلاوات المرتلة ──────',
  reciterSectionMujawwad: '────── مجود وتعليمي ──────',
  confirmDeleteTitle: 'تأكيد',
  internetRequiredDownload: '(يتطلب إنترنت للتحميل)'
};

const NEW_KEYS_EN = {
  ayahRecitation: 'Ayah Recitation',
  interactiveTour: 'Interactive Tour',
  gotIt: 'Got it',
  spaceSavingTip: 'Space-saving tip: No need to download the full Surah! You can just listen to the difficult words while reading, and they will be automatically saved for offline use.',
  clearAudioCache: 'Clear Audio Cache ({{size}} MB)',
  confirmDeletion: 'Confirm Deletion',
  confirmDeleteCacheMsg: 'Are you sure you want to clear all downloaded audio? You will need internet to download them again.',
  yesClearDownloads: 'Yes, clear downloads',
  noConnection: 'No internet connection',
  noConnectionRetry: 'No internet connection. Please connect and try again.',
  downloadFailed: 'Download failed — Check your internet connection',
  downloadFailedServer: 'Sorry, download failed. Some files for this reciter are not available on the server.',
  audioCacheCleared: 'Audio cache cleared successfully',
  failedDownloadWords: 'Sorry, failed to download Surah words.',
  alreadyDownloadedLabel: 'Already downloaded',
  shareAppNative: 'Share App',
  shareAppDescNative: 'Spread the goodness.. Share the app with your loved ones',
  shareAppWithFriends: 'Share the app with friends',
  shareWebsite: 'Share Website',
  qrCode: 'Scan QR Code',
  appUpdateAvailableAlt: 'App update available',
  appInstalledAlt: 'App is installed on your device',
  startingInstallAlt: 'Starting install...',
  clickToInstallLatestAlt: 'Click to install the latest features and fixes',
  weWillUpdateCodeAlt: 'We will update any new code for you here',
  installFrameAlt: 'Install the app frame for fast access',
  mushafUpdatedSaved: 'Mushaf is fully updated & saved',
  browseOfflineNowAlt: 'You can browse and review offline now',
  mushafApp: 'Mushaf App',
  amazingApp: 'An amazing app for Quran memorization',
  copyLink: 'Copy Link',
  otherOptions: 'Other Options',
  linkCopied: 'Link copied successfully',
  mushafAlMurajaa: 'Mushaf Al-Murajaa',
  amLabel: 'AM',
  pmLabel: 'PM',
  reciterSectionMurattal: '────── Murattal Recitations ──────',
  reciterSectionMujawwad: '────── Mujawwad & Educational ──────',
  confirmDeleteTitle: 'Confirm',
  internetRequiredDownload: '(Internet required for download)'
};

// ─── Reciter name keys (using internal IDs) ─────────────────────────
const RECITERS_AR = {
  sep_murattal: '────── التلاوات المرتلة ──────',
  husary: 'محمود خليل الحصري',
  abdul_basit: 'عبد الباسط عبد الصمد',
  minshawy: 'محمد صديق المنشاوي',
  alafasy: 'مشاري بن راشد العفاسي',
  maher: 'ماهر المعيقلي',
  sudais: 'عبد الرحمن السديس',
  yasser: 'ياسر الدوسري',
  qatami: 'ناصر القطامي',
  ghamdi: 'سعد الغامدي',
  shuraym: 'سعود الشريم',
  ajamy: 'أحمد بن علي العجمي',
  rifai: 'هاني الرفاعي',
  juhany: 'عبد الله الجهني',
  hudhaify: 'علي الحذيفي',
  ayyoub: 'محمد أيوب',
  basfar: 'عبد الله بصفر',
  banna: 'محمود علي البنا',
  mustafa_ismail: 'مصطفى إسماعيل',
  tablawi: 'محمد محمود الطبلاوي',
  ali_jaber: 'علي جابر',
  fares_abbad: 'فارس عباد',
  qahtani: 'خالد القحطاني',
  jibreel: 'محمد جبريل',
  matroud: 'عبد الله المطرود',
  budair: 'صلاح البدير',
  bukhatir: 'صلاح بو خاطر',
  akhdar: 'إبراهيم الأخضر',
  ahmed_neana: 'أحمد نعينع',
  akram_alaqimy: 'أكرم العلاقمي',
  ali_hajjaj: 'علي حجاج السويسي',
  abdulkareem: 'محمد عبد الكريم',
  muhsin_qasim: 'عبد المحسن القاسم',
  sahl_yassin: 'سهل ياسين',
  aziz_alili: 'عزيز عليلي',
  karim_mansoori: 'كريم منصوري',
  parhizgar: 'شهريار برهيزغار',
  nabil_rifai: 'نبيل الرفاعي',
  yaser_salamah: 'ياسر سلامة',
  khalifa_tunaiji: 'خليفة الطنيجي',
  shatri: 'أبو بكر الشاطري',
  sep_mujawwad: '────── مجود وتعليمي ──────',
  husary_mujawwad: 'محمود خليل الحصري (مجود)',
  abdul_basit_mujawwad: 'عبد الباسط عبد الصمد (مجود)',
  minshawy_mujawwad: 'محمد صديق المنشاوي (مجود)',
  husary_muallim: 'محمود خليل الحصري (المصحف المعلم)',
  minshawy_teacher: 'محمد صديق المنشاوي (المصحف المعلم)',
  sowaid: 'أيمن سويد (تعليمي)'
};

const RECITERS_EN = {
  sep_murattal: '────── Murattal Recitations ──────',
  husary: 'Mahmoud Khalil Al-Husary',
  abdul_basit: 'Abdul Basit Abdulsamad',
  minshawy: 'Muhammad Siddiq Al-Minshawi',
  alafasy: 'Mishary Al-Afasy',
  maher: 'Maher Al-Muaiqly',
  sudais: 'Abdurrahman As-Sudais',
  yasser: 'Yasser Ad-Dussary',
  qatami: 'Nasser Al-Qatami',
  ghamdi: 'Saad Al-Ghamdi',
  shuraym: 'Saud Ash-Shuraim',
  ajamy: 'Ahmed ibn Ali Al-Ajamy',
  rifai: 'Hani Ar-Rifai',
  juhany: 'Abdullah Al-Juhany',
  hudhaify: 'Ali Al-Hudhaify',
  ayyoub: 'Muhammad Ayyoub',
  basfar: 'Abdullah Basfar',
  banna: 'Mahmoud Ali Al-Banna',
  mustafa_ismail: 'Mustafa Ismail',
  tablawi: 'Muhammad At-Tablawi',
  ali_jaber: 'Ali Jaber',
  fares_abbad: 'Fares Abbad',
  qahtani: 'Khalid Al-Qahtani',
  jibreel: 'Muhammad Jibreel',
  matroud: 'Abdullah Matroud',
  budair: 'Salah Al-Budair',
  bukhatir: 'Salah Bukhatir',
  akhdar: 'Ibrahim Al-Akhdar',
  ahmed_neana: 'Ahmed Neana',
  akram_alaqimy: 'Akram Al-Alaqimy',
  ali_hajjaj: 'Ali Hajjaj As-Suaisy',
  abdulkareem: 'Muhammad Abdul Kareem',
  muhsin_qasim: 'Muhsin Al-Qasim',
  sahl_yassin: 'Sahl Yassin',
  aziz_alili: 'Aziz Alili',
  karim_mansoori: 'Karim Mansoori',
  parhizgar: 'Shahriar Parhizgar',
  nabil_rifai: 'Nabil Rifai',
  yaser_salamah: 'Yaser Salamah',
  khalifa_tunaiji: 'Khalifa At-Tunaiji',
  shatri: 'Abu Bakr Ash-Shatri',
  sep_mujawwad: '────── Mujawwad & Educational ──────',
  husary_mujawwad: 'Al-Husary (Mujawwad)',
  abdul_basit_mujawwad: 'Abdul Basit (Mujawwad)',
  minshawy_mujawwad: 'Al-Minshawi (Mujawwad)',
  husary_muallim: 'Al-Husary (Teacher)',
  minshawy_teacher: 'Al-Minshawi (Teacher)',
  sowaid: 'Ayman Sowaid (Educational)'
};

// ─── First pass: read ar.json and en.json as reference ──────────────
const arPath = path.join(I18N_DIR, 'ar.json');
const enPath = path.join(I18N_DIR, 'en.json');
const arData = JSON.parse(fs.readFileSync(arPath, 'utf8'));
const enData = JSON.parse(fs.readFileSync(enPath, 'utf8'));

// ─── Process each language file ──────────────────────────────────────
const files = fs.readdirSync(I18N_DIR).filter(f => f.endsWith('.json'));

let processed = 0;
let errors = 0;

for (const file of files) {
  const filePath = path.join(I18N_DIR, file);
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(raw);
    const lang = file.replace('.json', '');
    const isAr = lang === 'ar';
    const isEn = lang === 'en';

    // Add new UI string keys (skip if already exists)
    const newKeys = isAr ? NEW_KEYS_AR : NEW_KEYS_EN;
    for (const [key, value] of Object.entries(newKeys)) {
      if (!(key in data)) {
        data[key] = value;
      }
    }

    // Sync ALL missing string keys from ar.json (use en value as fallback for non-Arabic)
    for (const key of Object.keys(arData)) {
      if (key === 'reciters' || key === 'surahNames') continue;
      if (!(key in data)) {
        data[key] = isAr ? arData[key] : (enData[key] || arData[key]);
      }
    }

    // Add reciter names with internal IDs
    if (!data.reciters || typeof data.reciters === 'object') {
      if (!data.reciters) data.reciters = {};
      const reciterNames = isAr ? RECITERS_AR : RECITERS_EN;
      for (const [id, name] of Object.entries(reciterNames)) {
        if (!(id in data.reciters)) {
          data.reciters[id] = name;
        }
      }
    }

    // Write back with proper formatting
    const output = JSON.stringify(data, null, 4) + '\n';
    fs.writeFileSync(filePath, output, 'utf8');
    processed++;
    console.log(`✅ Updated ${file}`);
  } catch (err) {
    errors++;
    console.error(`❌ Error processing ${file}:`, err.message);
  }
}

console.log(`\nDone! ${processed} files updated, ${errors} errors.`);
