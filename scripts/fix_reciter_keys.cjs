const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..', 'src', 'assets', 'i18n');

// Map from OLD keys (with ar. prefix) to NEW keys (matching RECITERS_LIST IDs)
const KEY_MAP = {
  "ar.alafasy": "alafasy",
  "ar.husary": "husary",
  "ar.abdulbasitmurattal": "abdul_basit",
  "ar.abdulbasitmujawwad": "abdul_basit_mujawwad",
  "ar.minshawi": "minshawy",
  "ar.minshawimujawwad": "minshawy_mujawwad",
  "ar.sudais": "sudais",
  "ar.dosari": "yasser",
  "ar.qatami": "qatami",
  "ar.ghamdi": "ghamdi",
  "ar.shuraym": "shuraym",
  "ar.ajamy": "ajamy",
  "ar.hanirifai": "rifai",
  "ar.juhany": "juhany",
  "ar.hudhaify": "hudhaify",
  "ar.muhammadayyoub": "ayyoub",
  "ar.basfar": "basfar",
  "ar.banna": "banna",
  "ar.mustafaismail": "mustafa_ismail",
  "ar.tablawi": "tablawi",
  "ar.shatri": "shatri",
  "ar.husarymujawwad": "husary_mujawwad",
  "ar.husarymuallim": "husary_muallim",
  "ar.minshawiteacher": "minshawy_teacher",
  "ar.sowaid": "sowaid",
  "sep_murattal": "sep_murattal",
  "sep_mujawwad": "sep_mujawwad"
};

// Reciter names that should be translated per language
const EN_NAMES = {
  "sep_murattal": "────── Murattal Recitations ──────",
  "husary": "Mahmoud Khalil Al-Husary",
  "abdul_basit": "Abdul Basit Abdul Samad",
  "minshawy": "Mohammed Siddiq Al-Minshawi",
  "alafasy": "Mishary Rashid Alafasy",
  "maher": "Maher Al-Muaiqly",
  "sudais": "Abdurrahman As-Sudais",
  "yasser": "Yasser Ad-Dussary",
  "qatami": "Nasser Al-Qatami",
  "ghamdi": "Saad Al-Ghamdi",
  "shuraym": "Saud Ash-Shuraim",
  "ajamy": "Ahmed Ibn Ali Al-Ajamy",
  "rifai": "Hani Ar-Rifai",
  "juhany": "Abdullah Al-Juhany",
  "hudhaify": "Ali Al-Hudhaify",
  "ayyoub": "Mohammed Ayyoub",
  "basfar": "Abdullah Basfar",
  "banna": "Mahmoud Ali Al-Banna",
  "mustafa_ismail": "Mustafa Ismail",
  "tablawi": "Mohammed Al-Tablawi",
  "ali_jaber": "Ali Jaber",
  "fares_abbad": "Fares Abbad",
  "qahtani": "Khalid Al-Qahtani",
  "jibreel": "Mohammed Jibreel",
  "matroud": "Abdullah Matroud",
  "budair": "Salah Al-Budair",
  "bukhatir": "Salah Bukhatir",
  "akhdar": "Ibrahim Al-Akhdar",
  "ahmed_neana": "Ahmed Neana",
  "akram_alaqimy": "Akram Al-Alaqimy",
  "ali_hajjaj": "Ali Hajjaj Al-Suwaisy",
  "abdulkareem": "Mohammed Abdul Kareem",
  "muhsin_qasim": "Muhsin Al-Qasim",
  "sahl_yassin": "Sahl Yassin",
  "aziz_alili": "Aziz Alili",
  "karim_mansoori": "Karim Mansoori",
  "parhizgar": "Parhizgar",
  "nabil_rifai": "Nabil Rifai",
  "yaser_salamah": "Yaser Salamah",
  "khalifa_tunaiji": "Khalifa Al-Tunaiji",
  "shatri": "Abu Bakr Ash-Shatri",
  "sep_mujawwad": "────── Mujawwad & Teaching ──────",
  "husary_mujawwad": "Mahmoud Khalil Al-Husary (Mujawwad)",
  "abdul_basit_mujawwad": "Abdul Basit Abdul Samad (Mujawwad)",
  "minshawy_mujawwad": "Mohammed Siddiq Al-Minshawi (Mujawwad)",
  "husary_muallim": "Mahmoud Khalil Al-Husary (Teacher)",
  "minshawy_teacher": "Mohammed Siddiq Al-Minshawi (Teacher)",
  "sowaid": "Ayman Sowaid (Teaching)"
};

const AR_NAMES = {
  "sep_murattal": "────── التلاوات المرتلة ──────",
  "husary": "محمود خليل الحصري",
  "abdul_basit": "عبد الباسط عبد الصمد",
  "minshawy": "محمد صديق المنشاوي",
  "alafasy": "مشاري بن راشد العفاسي",
  "maher": "ماهر المعيقلي",
  "sudais": "عبد الرحمن السديس",
  "yasser": "ياسر الدوسري",
  "qatami": "ناصر القطامي",
  "ghamdi": "سعد الغامدي",
  "shuraym": "سعود الشريم",
  "ajamy": "أحمد بن علي العجمي",
  "rifai": "هاني الرفاعي",
  "juhany": "عبد الله الجهني",
  "hudhaify": "علي الحذيفي",
  "ayyoub": "محمد أيوب",
  "basfar": "عبد الله بصفر",
  "banna": "محمود علي البنا",
  "mustafa_ismail": "مصطفى إسماعيل",
  "tablawi": "محمد محمود الطبلاوي",
  "ali_jaber": "علي جابر",
  "fares_abbad": "فارس عباد",
  "qahtani": "خالد القحطاني",
  "jibreel": "محمد جبريل",
  "matroud": "عبد الله المطرود",
  "budair": "صلاح البدير",
  "bukhatir": "صلاح بو خاطر",
  "akhdar": "إبراهيم الأخضر",
  "ahmed_neana": "أحمد نعينع",
  "akram_alaqimy": "أكرم العلاقمي",
  "ali_hajjaj": "علي حجاج السويسي",
  "abdulkareem": "محمد عبد الكريم",
  "muhsin_qasim": "عبد المحسن القاسم",
  "sahl_yassin": "سهل ياسين",
  "aziz_alili": "عزيز عليلي",
  "karim_mansoori": "كريم منصوري",
  "parhizgar": "شهريار برهيزغار",
  "nabil_rifai": "نبيل الرفاعي",
  "yaser_salamah": "ياسر سلامة",
  "khalifa_tunaiji": "خليفة الطنيجي",
  "shatri": "أبو بكر الشاطري",
  "sep_mujawwad": "────── مجود وتعليمي ──────",
  "husary_mujawwad": "محمود خليل الحصري (مجود)",
  "abdul_basit_mujawwad": "عبد الباسط عبد الصمد (مجود)",
  "minshawy_mujawwad": "محمد صديق المنشاوي (مجود)",
  "husary_muallim": "محمود خليل الحصري (المصحف المعلم)",
  "minshawy_teacher": "محمد صديق المنشاوي (المصحف المعلم)",
  "sowaid": "أيمن سويد (تعليمي)"
};

const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));

files.forEach(file => {
  const filePath = path.join(dir, file);
  const json = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  
  if (!json.reciters || typeof json.reciters !== 'object') return;
  
  const newReciters = {};
  const isAr = file === 'ar.json';
  const nameSource = isAr ? AR_NAMES : EN_NAMES;
  
  // Add all reciters with correct keys
  Object.keys(nameSource).forEach(newKey => {
    // Check if old key exists and has a translated value
    let found = false;
    Object.keys(KEY_MAP).forEach(oldKey => {
      if (KEY_MAP[oldKey] === newKey && json.reciters[oldKey]) {
        newReciters[newKey] = json.reciters[oldKey];
        found = true;
      }
    });
    if (!found) {
      newReciters[newKey] = nameSource[newKey];
    }
  });
  
  // Also copy any keys that were already correct (no ar. prefix)
  Object.keys(json.reciters).forEach(k => {
    if (!k.startsWith('ar.') && !newReciters[k]) {
      newReciters[k] = json.reciters[k];
    }
  });
  
  const changed = JSON.stringify(json.reciters) !== JSON.stringify(newReciters);
  if (changed) {
    json.reciters = newReciters;
    fs.writeFileSync(filePath, JSON.stringify(json, null, 2) + '\n', 'utf8');
    console.log('Updated reciters: ' + file);
  } else {
    console.log('OK reciters: ' + file);
  }
});

console.log('Done!');