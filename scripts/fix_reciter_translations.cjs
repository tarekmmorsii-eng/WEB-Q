const fs = require('fs');
const path = require('path');

const langDir = path.join(__dirname, '..', 'src', 'assets', 'i18n');

// عناوين الأقسام المترجمة لكل لغة
const sectionTitles = {
  id: { sep_murattal: "────── Tilawah Murattal ──────", sep_mujawwad: "────── Mujawwad & Edukatif ──────", reciterSectionMurattal: "────── Tilawah Murattal ──────", reciterSectionMujawwad: "────── Mujawwad & Edukatif ──────" },
  ms: { sep_murattal: "────── Tilawah Murattal ──────", sep_mujawwad: "────── Mujawwad & Pendidikan ──────", reciterSectionMurattal: "────── Tilawah Murattal ──────", reciterSectionMujawwad: "────── Mujawwad & Pendidikan ──────" },
  ur: { sep_murattal: "────── مرتل تلاوتیں ──────", sep_mujawwad: "────── مجود اور تعلیمی ──────", reciterSectionMurattal: "────── مرتل تلاوتیں ──────", reciterSectionMujawwad: "────── مجود اور تعلیمی ──────" },
  bn: { sep_murattal: "────── মুরাত্তাল তিলাওয়াত ──────", sep_mujawwad: "────── মুজাওয়াদ ও শিক্ষামূলক ──────", reciterSectionMurattal: "────── মুরাত্তাল তিলাওয়াত ──────", reciterSectionMujawwad: "────── মুজাওয়াদ ও শিক্ষামূলক ──────" },
  tr: { sep_murattal: "────── Murattal Tilavat ──────", sep_mujawwad: "────── Mücevvev & Eğitim ──────", reciterSectionMurattal: "────── Murattal Tilavat ──────", reciterSectionMujawwad: "────── Mücevvev & Eğitim ──────" },
  fa: { sep_murattal: "────── تلاوت مرتل ──────", sep_mujawwad: "────── مجود و آموزشی ──────", reciterSectionMurattal: "────── تلاوت مرتل ──────", reciterSectionMujawwad: "────── مجود و آموزشی ──────" },
  ha: { sep_murattal: "────── Karatun Murattal ──────", sep_mujawwad: "────── Mujawwad & Ilimi ──────", reciterSectionMurattal: "────── Karatun Murattal ──────", reciterSectionMujawwad: "────── Mujawwad & Ilimi ──────" },
  fr: { sep_murattal: "────── Récitations Murattal ──────", sep_mujawwad: "────── Mujawwad & Éducatif ──────", reciterSectionMurattal: "────── Récitations Murattal ──────", reciterSectionMujawwad: "────── Mujawwad & Éducatif ──────" },
  es: { sep_murattal: "────── Recitaciones Murattal ──────", sep_mujawwad: "────── Mujawwad & Educativo ──────", reciterSectionMurattal: "────── Recitaciones Murattal ──────", reciterSectionMujawwad: "────── Mujawwad & Educativo ──────" },
  de: { sep_murattal: "────── Murattal-Rezitationen ──────", sep_mujawwad: "────── Mujawwad & Bildung ──────", reciterSectionMurattal: "────── Murattal-Rezitationen ──────", reciterSectionMujawwad: "────── Mujawwad & Bildung ──────" },
  ru: { sep_murattal: "────── Муратталь Чтения ──────", sep_mujawwad: "────── Муджаввад и Обучающие ──────", reciterSectionMurattal: "────── Муратталь Чтения ──────", reciterSectionMujawwad: "────── Муджаввад и Обучающие ──────" },
  sw: { sep_murattal: "────── Kusoma Murattal ──────", sep_mujawwad: "────── Mujawwad & Elimu ──────", reciterSectionMurattal: "────── Kusoma Murattal ──────", reciterSectionMujawwad: "────── Mujawwad & Elimu ──────" },
  zh: { sep_murattal: "────── 默拉特尔诵读 ──────", sep_mujawwad: "────── 穆贾瓦德与教学 ──────", reciterSectionMurattal: "────── 默拉特尔诵读 ──────", reciterSectionMujawwad: "────── 穆贾瓦德与教学 ──────" },
  ko: { sep_murattal: "────── 무라탈 암송 ──────", sep_mujawwad: "────── 무자와드 및 교육 ──────", reciterSectionMurattal: "────── 무라탈 암송 ──────", reciterSectionMujawwad: "────── 무자와드 및 교육 ──────" },
  ja: { sep_murattal: "────── ムラッタル朗読 ──────", sep_mujawwad: "────── ムジャッワドと教育 ──────", reciterSectionMurattal: "────── ムラッタル朗読 ──────", reciterSectionMujawwad: "────── ムジャッワドと教育 ──────" },
  bs: { sep_murattal: "────── Murattal Učenje ──────", sep_mujawwad: "────── Mudžewwed & Obrazovanje ──────", reciterSectionMurattal: "────── Murattal Učenje ──────", reciterSectionMujawwad: "────── Mudžewwed & Obrazovanje ──────" },
  sq: { sep_murattal: "────── Recitime Murattal ──────", sep_mujawwad: "────── Muxheuued & Edukativ ──────", reciterSectionMurattal: "────── Recitime Murattal ──────", reciterSectionMujawwad: "────── Muxheuued & Edukativ ──────" },
  uz: { sep_murattal: "────── Murattal Tilovat ──────", sep_mujawwad: "────── Mujavvad va Ta'lim ──────", reciterSectionMurattal: "────── Murattal Tilovat ──────", reciterSectionMujawwad: "────── Mujavvad va Ta'lim ──────" },
  kk: { sep_murattal: "────── Муратталь Оқу ──────", sep_mujawwad: "────── Муджаввад және Оқыту ──────", reciterSectionMurattal: "────── Муратталь Оқу ──────", reciterSectionMujawwad: "────── Муджаввад және Оқыту ──────" },
  ku: { sep_murattal: "────── خوێندنەوەی مورەتەل ──────", sep_mujawwad: "────── موجەوەد و فێرکاری ──────", reciterSectionMurattal: "────── خوێندنەوەی مورەتەل ──────", reciterSectionMujawwad: "────── موجەوەد و فێرکاری ──────" },
  vi: { sep_murattal: "────── Ngâm Murattal ──────", sep_mujawwad: "────── Mujawwad & Giáo dục ──────", reciterSectionMurattal: "────── Ngâm Murattal ──────", reciterSectionMujawwad: "────── Mujawwad & Giáo dục ──────" },
  tl: { sep_murattal: "────── Murattal na Pagbasah ──────", sep_mujawwad: "────── Mujawwad at Panturo ──────", reciterSectionMurattal: "────── Murattal na Pagbasah ──────", reciterSectionMujawwad: "────── Mujawwad at Panturo ──────" },
  hi: { sep_murattal: "────── मुरत्तल पाठ ──────", sep_mujawwad: "────── मुजव्वद और शैक्षिक ──────", reciterSectionMurattal: "────── मुरत्तल पाठ ──────", reciterSectionMujawwad: "────── मुजव्वद और शैक्षिक ──────" },
  ta: { sep_murattal: "────── முரத்தல் ஓதுதல் ──────", sep_mujawwad: "────── முஜவ்வத் & கல்வி ──────", reciterSectionMurattal: "────── முரத்தல் ஓதுதல் ──────", reciterSectionMujawwad: "────── முஜவ்வத் & கல்வி ──────" },
  si: { sep_murattal: "────── මුරත්තල් ගායනය ──────", sep_mujawwad: "────── මුජව්වද් හා අධ්‍යාපනය ──────", reciterSectionMurattal: "────── මුරත්තල් ගායනය ──────", reciterSectionMujawwad: "────── මුජව්වද් හා අධ්‍යාපනය ──────" },
  am: { sep_murattal: "────── ሙራትታል ንባብ ──────", sep_mujawwad: "────── ሙጃውዋድ እና ትምህርት ──────", reciterSectionMurattal: "────── ሙራትታል ንባብ ──────", reciterSectionMujawwad: "────── ሙጃውዋድ እና ትምህርት ──────" },
  yo: { sep_murattal: "────── Kika Murattal ──────", sep_mujawwad: "────── Mujawwad & Eko ──────", reciterSectionMurattal: "────── Kika Murattal ──────", reciterSectionMujawwad: "────── Mujawwad & Eko ──────" },
  om: { sep_murattal: "────── Dubbisuu Murattal ──────", sep_mujawwad: "────── Mujawwad fi Barnoota ──────", reciterSectionMurattal: "────── Dubbisuu Murattal ──────", reciterSectionMujawwad: "────── Mujawwad fi Barnoota ──────" },
  rw: { sep_murattal: "────── Gusoma Murattal ──────", sep_mujawwad: "────── Mujawwad n'Amasomo ──────", reciterSectionMurattal: "────── Gusoma Murattal ──────", reciterSectionMujawwad: "────── Mujawwad n'Amasomo ──────" }
};

// أسماء القراء للغات ذات خط غير لاتيني
const reciterNames = {
  ur: {
    husary: "محمود خلیل الحصری",
    abdul_basit: "عبد الباسط عبد الصمد",
    minshawy: "محمد صدیق المنشاوی",
    alafasy: "مشاری بن راشد العفاسی",
    maher: "ماهر المعیقلی",
    sudais: "عبد الرحمن السدیس",
    yasser: "یاسر الدوسری",
    qatami: "ناصر القطامی",
    ghamdi: "سعد الغامدی",
    shuraym: "سعود الشری",
    ajamy: "احمد بن علی العجمی",
    rifai: "ہانی الرفاعی",
    juhany: "عبد اللہ الجہنی",
    hudhaify: "علی الحذیفی",
    ayyoub: "محمد ایوب",
    basfar: "عبد اللہ بصفر",
    banna: "محمود علی البنا",
    mustafa_ismail: "مصطفیٰ اسماعیل",
    tablawi: "محمد محمود الطبلاوی",
    ali_jaber: "علی جابر",
    parhizgar: "پرہیزگار",
    nabil_rifai: "نبیل الرفاعی",
    yaser_salamah: "یاسر سلامہ",
    shatri: "ابو بکر الشاطری",
    fares_abbad: "فارس عباد",
    karim_mansoori: "کریم منصوری",
    khalifa_tunaiji: "خلیفہ التنائیجی",
    husary_mujawwad: "الحصری (مجود)",
    abdul_basit_mujawwad: "عبد الباسط عبد الصمد (مجود)",
    minshawy_mujawwad: "المنشاوی (مجود)",
    husary_muallim: "محمود خلیل الحصری (معلم)",
    minshawy_teacher: "محمد صدیق المنشاوی (معلم)",
    sowaid: "ایمن سوید (تعلیمی)"
  },
  fa: {
    husary: "محمود خلیل الحصری",
    abdul_basit: "عبدالباسط عبدالصمد",
    minshawy: "محمد صدیق المنشاوی",
    alafasy: "مشاری بن راشد العفاسی",
    maher: "ماهر المعیقلی",
    sudais: "عبدالرحمن السدیس",
    yasser: "یاسر الدوسری",
    qatami: "ناصر القطامی",
    ghamdi: "سعد الغامدی",
    shuraym: "سعود الشوریم",
    ajamy: "احمد بن علی العجمی",
    rifai: "هانی رفاعی",
    juhany: "عبدالله الجهنی",
    hudhaify: "علی الحذیفی",
    ayyoub: "محمد ایوب",
    basfar: "عبدالله بصفر",
    banna: "محمود علی البنا",
    mustafa_ismail: "مصطفی اسماعیل",
    tablawi: "محمد محمود الطبلاوی",
    ali_jaber: "علی جابر",
    parhizgar: "پرهیزگر",
    nabil_rifai: "نبیل الرفاعی",
    yaser_salamah: "یاسر سلامه",
    shatri: "ابوبکر الشاطری",
    fares_abbad: "فارس عباد",
    karim_mansoori: "کریم منصوری",
    khalifa_tunaiji: "خلیفه التنائیجی",
    husary_mujawwad: "الحصری (مجود)",
    abdul_basit_mujawwad: "عبدالباسط عبدالصمد (مجود)",
    minshawy_mujawwad: "المنشاوی (مجود)",
    husary_muallim: "محمود خلیل الحصری (معلم)",
    minshawy_teacher: "محمد صدیق المنشاوی (معلم)",
    sowaid: "ایمن سوید (آموزشی)"
  },
  ku: {
    husary: "مەحموود خەلیل حوساری",
    abdul_basit: "عەبدولباسیت عەبدولسەمەد",
    minshawy: "مەحموود سدیق مەنشاوی",
    alafasy: "میشاری عەفاسی",
    maher: "ماھەر موعەیقلی",
    sudais: "عەبدولڕەحمان سودەیس",
    yasser: "یاسەر دوسەری",
    qatami: "ناسر قەتامی",
    ghamdi: "سەعد غامدی",
    shuraym: "سەعوود شورەیم",
    ajamy: "ئەحمەد عەجەمی",
    rifai: "ھانی ڕەفاعی",
    juhany: "عەبدوولا جەھەنی",
    hudhaify: "عەلی حوزەیفی",
    ayyoub: "مەحموود ئەیوب",
    basfar: "عەبدوولا بەسفەر",
    banna: "مەحموود عەلی بەننا",
    mustafa_ismail: "موستەفا ئیسماعیل",
    tablawi: "مەحموود تەبلاوی",
    ali_jaber: "عەلی جابەر",
    parhizgar: "پەرھیزگار",
    nabil_rifai: "نەبیل ڕەفاعی",
    yaser_salamah: "یاسەر سەلامە",
    shatri: "ئەبووبەکر شاتری",
    fares_abbad: "فارس عەباد",
    karim_mansoori: "کەریم مەنسووری",
    khalifa_tunaiji: "خەلیفە تونائیجی",
    husary_mujawwad: "حوساری (موجەوەد)",
    abdul_basit_mujawwad: "عەبدولباسیت (موجەوەد)",
    minshawy_mujawwad: "مەنشاوی (موجەوەد)",
    husary_muallim: "حوساری (مامۆستا)",
    minshawy_teacher: "مەنشاوی (مامۆستا)",
    sowaid: "ئەیمەن سوەید (فێرکاری)"
  },
  tr: {
    husary: "Mahmud Halil Husari",
    abdul_basit: "Abdulbasit Abdüssamed",
    minshawy: "Muhammed Sıddık Minşavi",
    alafasy: "Mişari el-Afasi",
    maher: "Mahir el-Muaykali",
    sudais: "Abdurrahman es-Sudeys",
    yasser: "Yasir ed-Dusari",
    qatami: "Nasır el-Katami",
    ghamdi: "Sad el-Gamdi",
    shuraym: "Sud eş-Şuraym",
    ajamy: "Ahmed el-Acemi",
    rifai: "Hani Rifai",
    juhany: "Abdullah el-Cuhani",
    hudhaify: "Ali el-Hudeyfi",
    ayyoub: "Muhammed Eyyub",
    basfar: "Abdullah Basfar",
    banna: "Mahmud Ali el-Benna",
    mustafa_ismail: "Mustafa İsmail",
    tablawi: "Muhammed et-Tablevi",
    ali_jaber: "Ali Cabir",
    parhizgar: "Perhizgar",
    nabil_rifai: "Nabil Rifai",
    yaser_salamah: "Yasir Selame",
    shatri: "Ebu Bekir eş-Şatri",
    fares_abbad: "Fares Abbad",
    karim_mansoori: "Karim Mansuri",
    khalifa_tunaiji: "Halife et-Tunayci",
    husary_mujawwad: "Husari (Mücevvev)",
    abdul_basit_mujawwad: "Abdulbasit (Mücevvev)",
    minshawy_mujawwad: "Minşavi (Mücevvev)",
    husary_muallim: "Husari (Öğretmen)",
    minshawy_teacher: "Minşavi (Öğretmen)",
    sowaid: "Eyman Sevid (Eğitim)"
  },
  id: {
    husary: "Mahmud Khalil Al-Hushari",
    abdul_basit: "Abdul Basit Abdussamad",
    minshawy: "Muhammad Siddiq Al-Minsyawi",
    alafasy: "Misyari Rasyid Al-Afasi",
    maher: "Mahir Al-Mu'aiqili",
    sudais: "Abdurrahman As-Sudais",
    yasser: "Yasir Ad-Dusari",
    qatami: "Nasir Al-Qathami",
    ghamdi: "Sa'ad Al-Ghamdi",
    shuraym: "Saud Asy-Syuraim",
    ajamy: "Ahmad bin Ali Al-Ajamy",
    rifai: "Hani Ar-Rifai",
    juhany: "Abdullah Al-Juhani",
    hudhaify: "Ali Al-Hudzaifi",
    ayyoub: "Muhammad Ayyub",
    basfar: "Abdullah Basfar",
    banna: "Mahmud Ali Al-Banna",
    mustafa_ismail: "Mustafa Ismail",
    tablawi: "Muhammad Ath-Thalabi",
    ali_jaber: "Ali Jaber",
    parhizgar: "Parhizgar",
    nabil_rifai: "Nabil Ar-Rifai",
    yaser_salamah: "Yasir Salamah",
    shatri: "Abu Bakar Asy-Syatri",
    fares_abbad: "Fares Abbad",
    karim_mansoori: "Karim Mansuri",
    khalifa_tunaiji: "Khalifa At-Tunaizi",
    husary_mujawwad: "Al-Hushari (Mujawwad)",
    abdul_basit_mujawwad: "Abdul Basit (Mujawwad)",
    minshawy_mujawwad: "Al-Minsyawi (Mujawwad)",
    husary_muallim: "Al-Hushari (Guru)",
    minshawy_teacher: "Al-Minsyawi (Guru)",
    sowaid: "Ayman Sowaid (Pengajaran)"
  },
  ms: {
    husary: "Mahmud Khalil Al-Husari",
    abdul_basit: "Abdul Basit Abdussamad",
    minshawy: "Muhammad Siddiq Al-Minsyawi",
    alafasy: "Misyari Rasyid Al-Afasi",
    maher: "Mahir Al-Mu'ayqali",
    sudais: "Abdurrahman As-Sudais",
    yasser: "Yasir Ad-Dusari",
    qatami: "Nasir Al-Qatami",
    ghamdi: "Saad Al-Ghamdi",
    shuraym: "Saud Asy-Syuraim",
    ajamy: "Ahmad Al-Ajamy",
    rifai: "Hani Ar-Rifai",
    juhany: "Abdullah Al-Juhani",
    hudhaify: "Ali Al-Hudhaifi",
    ayyoub: "Muhammad Ayyub",
    basfar: "Abdullah Basfar",
    banna: "Mahmud Ali Al-Banna",
    mustafa_ismail: "Mustafa Ismail",
    tablawi: "Muhammad At-Tablawi",
    ali_jaber: "Ali Jaber",
    parhizgar: "Parhizgar",
    nabil_rifai: "Nabil Ar-Rifai",
    yaser_salamah: "Yasir Salamah",
    shatri: "Abu Bakar Asy-Syatri",
    fares_abbad: "Fares Abbad",
    karim_mansoori: "Karim Mansuri",
    khalifa_tunaiji: "Khalifa At-Tunaizi",
    husary_mujawwad: "Al-Husari (Mujawwad)",
    abdul_basit_mujawwad: "Abdul Basit (Mujawwad)",
    minshawy_mujawwad: "Al-Minsyawi (Mujawwad)",
    husary_muallim: "Al-Husari (Pengajar)",
    minshawy_teacher: "Al-Minsyawi (Pengajar)",
    sowaid: "Ayman Sowaid (Pengajaran)"
  },
  bn: {
    husary: "মাহমুদ খলিল আল-হুসারী",
    abdul_basit: "আব্দুল বাসিত আব্দুস সামাদ",
    minshawy: "মুহাম্মাদ সিদ্দীক আল-মিনশাবী",
    alafasy: "মিশারী আল-আফাসী",
    maher: "মাহের আল-মুআইক্লী",
    sudais: "আব্দুর রহমান আস-সুদাইস",
    yasser: "ইয়াসির আদ-দুসারী",
    qatami: "নাসির আল-কাতামী",
    ghamdi: "সাদ আল-গামদী",
    shuraym: "সাউদ আশ-শুরাইম",
    ajamy: "আহমাদ আল-আজামী",
    rifai: "হানী আর-রিফাঈ",
    juhany: "আব্দুল্লাহ আল-জুহানী",
    hudhaify: "আলী আল-হুদাইফী",
    ayyoub: "মুহাম্মাদ আইয়ুব",
    basfar: "আব্দুল্লাহ বাসফার",
    banna: "মাহমুদ আলী আল-বান্না",
    mustafa_ismail: "মুস্তাফা ইসমাইল",
    tablawi: "মুহাম্মাদ আত-তাবলাবী",
    ali_jaber: "আলী জাবের",
    parhizgar: "পারহিজগার",
    nabil_rifai: "নাবিল আর-রিফাঈ",
    yaser_salamah: "ইয়াসির সালামাহ",
    shatri: "আবু বকর আশ-শাতরী",
    fares_abbad: "ফারেস আব্বাদ",
    karim_mansoori: "কারিম মানসুরী",
    khalifa_tunaiji: "খলিফা আত-তুনাইজি",
    husary_mujawwad: "আল-হুসারী (মুজাওয়াদ)",
    abdul_basit_mujawwad: "আব্দুল বাসিত (মুজাওয়াদ)",
    minshawy_mujawwad: "আল-মিনশাবী (মুজাওয়াদ)",
    husary_muallim: "আল-হুসারী (শিক্ষক)",
    minshawy_teacher: "আল-মিনশাবী (শিক্ষক)",
    sowaid: "আইমান সোয়াইদ (শিক্ষামূলক)"
  },
  hi: {
    husary: "महमूद खलील अल-हुसरी",
    abdul_basit: "अब्दुल बासित अब्दुस समद",
    minshawy: "मुहम्मद सिद्दीक अल-मिनशावी",
    alafasy: "मिशारी अल-अफासी",
    maher: "माहिर अल-मुऐकली",
    sudais: "अब्दुर्रहमान अस-सुदैस",
    yasser: "यासिर अद-दुसरी",
    qatami: "नासिर अल-कतामी",
    ghamdi: "सअद अल-गामदी",
    shuraym: "सऊद अश-शुरैम",
    ajamy: "अहमद अल-अजमी",
    rifai: "हानी अर-रिफाई",
    juhany: "अब्दुल्लाह अल-जुहानी",
    hudhaify: "अली अल-हुदैफी",
    ayyoub: "मुहम्मद अय्यूब",
    basfar: "अब्दुल्लाह बसफर",
    banna: "महमूद अली अल-बन्ना",
    mustafa_ismail: "मुस्तफा इस्माइल",
    tablawi: "मुहम्मद अत-तबलावी",
    ali_jaber: "अली जाबिर",
    parhizgar: "परहिज़गार",
    nabil_rifai: "नाबिल अर-रिफाई",
    yaser_salamah: "यासिर सलामह",
    shatri: "अबू बक्र अश-शात्री",
    fares_abbad: "फ़ारेस अब्बाद",
    karim_mansoori: "करीम मनसूरी",
    khalifa_tunaiji: "ख़लीफ़ा अत-तुनाइजी",
    husary_mujawwad: "अल-हुसरी (मुजव्वद)",
    abdul_basit_mujawwad: "अब्दुल बासित (मुजव्वद)",
    minshawy_mujawwad: "अल-मिनशावी (मुजव्वद)",
    husary_muallim: "अल-हुसरी (शिक्षक)",
    minshawy_teacher: "अल-मिनशावी (शिक्षक)",
    sowaid: "अयमान सोवाइद (शैक्षिक)"
  }
};

const files = fs.readdirSync(langDir).filter(f => f.endsWith('.json'));

for (const file of files) {
  const lang = file.replace('.json', '');
  if (lang === 'ar' || lang === 'en') {
    console.log('Skipping: ' + file + ' (reference)');
    continue;
  }
  
  const filePath = path.join(langDir, file);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  
  if (!data.reciters) {
    console.log('WARNING: No reciters in ' + file);
    continue;
  }
  
  let changed = 0;
  
  // تحديث عناوين الأقسام
  const sections = sectionTitles[lang];
  if (sections) {
    for (const [key, value] of Object.entries(sections)) {
      if (data[key] !== undefined && data[key] !== value) {
        data[key] = value;
        changed++;
      }
      if (data.reciters[key] !== undefined && data.reciters[key] !== value) {
        data.reciters[key] = value;
        changed++;
      }
    }
  }
  
  // تحديث أسماء القراء
  const names = reciterNames[lang];
  if (names) {
    for (const [key, value] of Object.entries(names)) {
      if (data.reciters[key] !== undefined && data.reciters[key] !== value) {
        data.reciters[key] = value;
        changed++;
      }
    }
  }
  
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  console.log('Updated: ' + file + ' (' + changed + ' keys changed)');
}

console.log('\nDone! All reciter translations corrected.');