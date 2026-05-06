/**
 * Script to add theme name translation keys to all i18n JSON files.
 * Each theme gets a key like: themeName_classic_mushaf, themeName_antique_paper, etc.
 */

const fs = require('fs');
const path = require('path');

const i18nDir = path.join(__dirname, '..', 'src', 'assets', 'i18n');

// Theme IDs and their translations
const themeNames = {
    'classic-mushaf': {
        ar: 'المصحف الكلاسيكي', en: 'Classic Mushaf', id: 'Mushaf Klasik', ms: 'Mushaf Klasik',
        ur: 'کلاسیکی مصحف', bn: 'ক্লাসিক মুসহাফ', tr: 'Klasik Mushaf', fa: 'مصحف کلاسیک',
        ha: "Alkur'ani Na gargajiya", fr: 'Mushaf Classique', es: 'Mushaf Clásico',
        de: 'Klassischer Mushaf', ru: 'Классический Мушаф', sw: 'Mushaf ya Jadi',
        zh: '经典古兰经', ko: '클래식 무샤프', ja: 'クラシック・ムシャフ',
        bs: 'Klasični Mushaf', sq: 'Mushafi Klasik', uz: 'Klassik Mushaf',
        kk: 'Классикалық Мушаф', ku: 'Mushafa Klasîk', vi: 'Mushaf Cổ điển',
        tl: 'Klasikong Mushaf', hi: 'क्लासिक मुशफ', ta: 'கிளாசிக் முஷாப்',
        si: 'සම්භාව්‍ය මුෂාෆ්', am: 'ክላሲክ ሙሻፍ', yo: 'Mushaf Arinti', om: 'Mushaf Durtii',
        rw: 'Mushaf Yambere'
    },
    'antique-paper': {
        ar: 'الورق القديم', en: 'Antique Paper', id: 'Kertas Antik', ms: 'Kertas Antik',
        ur: 'پرانا کاغذ', bn: 'পুরনো কাগজ', tr: 'Antika Kağıt', fa: 'کاغذ قدیمی',
        ha: 'Takardar da ta tsufa', fr: 'Papier Ancien', es: 'Papel Antiguo',
        de: 'Antikes Papier', ru: 'Античная Бумага', sw: 'Karatasi ya Zamani',
        zh: '古旧纸张', ko: '골동품 종이', ja: 'アンティークペーパー',
        bs: 'Antik Papir', sq: 'Letër Antike', uz: 'Qadimiy Qog\'oz',
        kk: 'Ескі Қағаз', ku: 'Kaxezê Kevn', vi: 'Giấy Cổ',
        tl: 'Sinaunang Papel', hi: 'पुराना कागज़', ta: 'பழமையான காகிதம்',
        si: 'පැරණි කොල', am: 'ጥንታዊ ወረቀት', yo: 'Iwe Aye Atijọ', om: 'Fardaa Duri',
        rw: 'Urupapuro rw' + 'ibyahoze'
    },
    'calm-night': {
        ar: 'الليلي الهادئ', en: 'Calm Night', id: 'Malam Tenang', ms: 'Malam Tenang',
        ur: 'پر سکون رات', bn: 'শান্ত রাত', tr: 'Sakin Gece', fa: 'شب آرام',
        ha: 'Dare Mai kwanciyar hankali', fr: 'Nuit Calme', es: 'Noche Tranquila',
        de: 'Ruhige Nacht', ru: 'Спокойная Ночь', sw: 'Usiku Utulivu',
        zh: '宁静之夜', ko: '평온한 밤', ja: '静寂な夜',
        bs: 'Mirna Noć', sq: 'Natë e Qetë', uz: 'Tinch Kecha',
        kk: 'Жайлы Түн', ku: 'Şevê Aram', vi: 'Đêm Yên Bình',
        tl: 'Mapayapang Gabi', hi: 'शांत रात', ta: 'அமைதியான இரவு',
        si: 'සාමකාමී රාත්‍රිය', am: 'ሰላማዊ ሌሊት', yo: 'Oru Ọtun', om: 'Halkan Tasgabbii',
        rw: 'Ijoro Ry' + 'umutekano'
    },
    'nature': {
        ar: 'نمط الطبيعة', en: 'Nature', id: 'Alam', ms: 'Alam Semula Jadi',
        ur: 'قدرت', bn: 'প্রকৃতি', tr: 'Doğa', fa: 'طبیعت',
        ha: 'Dabi\'a', fr: 'Nature', es: 'Naturaleza',
        de: 'Natur', ru: 'Природа', sw: 'Asili',
        zh: '自然', ko: '자연', ja: '自然',
        bs: 'Priroda', sq: 'Natyra', uz: 'Tabiat',
        kk: 'Табиғат', ku: 'Xwezayî', vi: 'Thiên Nhiên',
        tl: 'Kalikasan', hi: 'प्रकृति', ta: 'இயற்கை',
        si: 'ස්වභාවය', am: 'ተፈጥሮ', yo: 'Ede', om: 'Uumama',
        rw: 'Ikirere'
    },
    'almond-paper': {
        ar: 'ورق اللوز', en: 'Almond Paper', id: 'Kertas Almond', ms: 'Kertas Almond',
        ur: 'بادام کاغذ', bn: 'বাদামী কাগজ', tr: 'Badem Kağıt', fa: 'کاغذ بادام',
        ha: 'Takardar Ɓaure', fr: 'Papier Amandé', es: 'Papel de Almendra',
        de: 'Mandel-Papier', ru: 'Миндальная Бумага', sw: 'Karatasi ya Lozi',
        zh: '杏仁纸', ko: '아몬드 페이퍼', ja: 'アーモンドペーパー',
        bs: 'Badem Papir', sq: 'Letër Bademi', uz: 'Bodom Qog\'oz',
        kk: 'Жаңғақ Қағаз', ku: 'Kaxezê Behîvê', vi: 'Giấy Hạnh Nhân',
        tl: 'Papel ng Almond', hi: 'बादामी कागज़', ta: 'பாதாம் காகிதம்',
        si: 'කටු අටු කොල', am: 'አልመንድ ወረቀት', yo: 'Iwe Alimondi', om: 'Fardaa Loomaa',
        rw: 'Urupapuro rw' + 'Avoka'
    },
    'wheat-paper': {
        ar: 'ورق القمح', en: 'Wheat Paper', id: 'Kertas Gandum', ms: 'Kertas Gandum',
        ur: 'گندم کاغذ', bn: 'গমের কাগজ', tr: 'Buğday Kağıt', fa: 'کاغذ گندم',
        ha: 'Takardar Alkama', fr: 'Papier Blé', es: 'Papel de Trigo',
        de: 'Weizen-Papier', ru: 'Пшеничная Бумага', sw: 'Karatasi ya Ngano',
        zh: '小麦纸', ko: '밀 페이퍼', ja: 'ウィートペーパー',
        bs: 'Pšenični Papir', sq: 'Letër Gruri', uz: 'Bug\'doy Qog\'oz',
        kk: 'Бидай Қағаз', ku: 'Kaxezê Genimê', vi: 'Giấy Lúa Mì',
        tl: 'Papel ng Trigo', hi: 'गेहूँ कागज़', ta: 'கோதுமை காகிதம்',
        si: 'තිරිඟු කොල', am: 'ስንዴ ወረቀት', yo: 'Iwe Witi', om: 'Fardaa Xaa' + 'elaa',
        rw: 'Urupapuro rw' + 'Igano'
    },
    'papyrus': {
        ar: 'البردي', en: 'Papyrus', id: 'Papirus', ms: 'Papirus',
        ur: 'پپائرس', bn: 'প্যাপিরাস', tr: 'Papirüs', fa: 'پاپیروس',
        ha: 'Papar harshe', fr: 'Papyrus', es: 'Papiro',
        de: 'Papyrus', ru: 'Папирус', sw: 'Papari',
        zh: '纸莎草', ko: '파피루스', ja: 'パピルス',
        bs: 'Papirus', sq: 'Papirus', uz: 'Papirus',
        kk: 'Папирус', ku: 'Papîrus', vi: 'Giấy Papyrus',
        tl: 'Papirus', hi: 'पेपिरस', ta: 'பாபிரஸ்',
        si: 'පැපිරස්', am: 'ፓፒሩስ', yo: 'Papirasi', om: 'Paapireese',
        rw: 'Papirusi'
    },
    'clear-sky': {
        ar: 'السماء الصافية', en: 'Clear Sky', id: 'Langit Cerah', ms: 'Langit Cerah',
        ur: 'صاف آسمان', bn: 'পরিষ্কার আকাশ', tr: 'Açık Gökyüzü', fa: 'آسمان صاف',
        ha: 'Sama mai haske', fr: 'Ciel Dégagé', es: 'Cielo Despejado',
        de: 'Klarer Himmel', ru: 'Чистое Небо', sw: 'Anga Safi',
        zh: '晴空', ko: '맑은 하늘', ja: '澄んだ空',
        bs: 'Čisto Nebo', sq: 'Qiell i Kthjellët', uz: 'Ochiq Osmon',
        kk: 'Ашық Аспан', ku: 'Esmênê Vekirî', vi: 'Bầu Trời Trong Xanh',
        tl: 'Malinaw na Langit', hi: 'साफ आसमान', ta: 'தெளிவான வானம்',
        si: 'පැහැදිලි අහස', am: 'ንጽህት ሰማይ', yo: 'Oju Ojo Mume', om: 'Guraa Ifaa',
        rw: 'Ikirere Cy' + 'umurage'
    },
    'midnight': {
        ar: 'الميدنايت', en: 'Midnight', id: 'Tengah Malam', ms: 'Tengah Malam',
        ur: 'نصف شب', bn: 'মধ্যরাত', tr: 'Gece Yarısı', fa: 'نیمه‌شب',
        ha: 'Tsakar dare', fr: 'Minuit', es: 'Medianoche',
        de: 'Mitternacht', ru: 'Полночь', sw: 'Usiku wa Kathati',
        zh: '午夜', ko: '한밤', ja: 'ミッドナイト',
        bs: 'Ponoć', sq: 'Mesnatë', uz: 'Yarim Tun',
        kk: 'Түн Ортасы', ku: 'Nîvro', vi: 'Nửa Đêm',
        tl: 'Hatinggabi', hi: 'आधी रात', ta: 'நள்ளிரவு',
        si: 'අඩ වරු', am: 'እኩለ ሌሊት', yo: 'Ogun', om: 'Hagayya',
        rw: 'Saa Sita zo muri ijoro'
    },
    'calm-lake': {
        ar: 'بحيرة هادئة', en: 'Calm Lake', id: 'Danau Tenang', ms: 'Tasik Tenang',
        ur: 'پر سکون جھیل', bn: 'শান্ত হ্রদ', tr: 'Sakin Göl', fa: 'دریاچه آرام',
        ha: 'Tabkin kwanciyar hankali', fr: 'Lac Calme', es: 'Lago Tranquilo',
        de: 'Ruhiger See', ru: 'Спокойное Озеро', sw: 'Ziwa Tulivu',
        zh: '宁静湖', ko: '평온한 호수', ja: '静かな湖',
        bs: 'Mirno Jezero', sq: 'Liqeni i Qetë', uz: 'Tinch Ko\'l',
        kk: 'Жайлы Көл', ku: 'Golê Aram', vi: 'Hồ Yên Bình',
        tl: 'Mapayapang Lawa', hi: 'शांत झील', ta: 'அமைதியான ஏரி',
        si: 'සාමකාමී විල', am: 'ሰላማዊ ሐይቅ', yo: 'Omi Ọtun', om: 'Haroo Tasgabbii',
        rw: 'Ikibira cy' + 'umutekano'
    },
    'silver-cloud': {
        ar: 'السحاب الفضي', en: 'Silver Cloud', id: 'Awan Perak', ms: 'Awan Perak',
        ur: 'چاندی کا بادل', bn: 'রৌপ্য মেঘ', tr: 'Gümüş Bulut', fa: 'ابر نقره‌ای',
        ha: 'Gajimari Azurfa', fr: 'Nuage d\'Argent', es: 'Nube Plateada',
        de: 'Silberne Wolke', ru: 'Серебряное Облако', sw: 'Wingu la Fedha',
        zh: '银色云', ko: '은빛 구름', ja: 'シルバークラウド',
        bs: 'Srebrni Oblak', sq: 'Re e Argjendtë', uz: 'Kumush Bulut',
        kk: 'Күміс Бұлт', ku: 'Ewrê Zîv', vi: 'Đám Mây Bạc',
        tl: 'Pilak na Ulap', hi: 'चांदी का बादल', ta: 'வெள்ளி மேகம்',
        si: 'රිදී වළාකුළ', am: 'ብር ደመ አውንት', yo: 'Keke Fadaka', om: 'Darba Fincilaa',
        rw: 'Ikibira cy' + 'ifeza'
    },
    'calm-charcoal': {
        ar: 'الفحم الهادئ', en: 'Calm Charcoal', id: 'Arang Tenang', ms: 'Arang Tenang',
        ur: 'پر سکون کوئلہ', bn: 'শান্ত কয়লা', tr: 'Sakin Kömür', fa: 'زغال آرام',
        ha: 'Yanƙwara mai kwanciyar hankali', fr: 'Charbon Calme', es: 'Carbón Tranquilo',
        de: 'Ruhige Kohle', ru: 'Спокойный Уголь', sw: 'Makaa Utulivu',
        zh: '宁静炭', ko: '평온한 숯', ja: '静寂な炭',
        bs: 'Mirni Ugalj', sq: 'Thëngjilli i Qetë', uz: 'Tincho\'mir',
        kk: 'Жайлы Көмір', ku: 'Komirê Aram', vi: 'Than Yên Bình',
        tl: 'Mapayapang Uling', hi: 'शांत चारकोल', ta: 'அமைதியான நிலக்கரி',
        si: 'සාමකාමී අඟුරු', am: 'ሰላማዊ እንጨት', yo: 'Eedu Ọtun', om: 'Qorxoo Tasgabbii',
        rw: 'Ikinyabonomi cy' + 'umutekano'
    },
    'slate-gray': {
        ar: 'الرمادي الصخري', en: 'Slate Gray', id: 'Abu-abu Batu', ms: 'Kelabu Batu',
        ur: 'سلیٹ گرے', bn: 'স্লেট ধূসর', tr: 'Kaya Gri', fa: 'خاکستری تیره',
        ha: 'Toka ta Dutsen laushi', fr: 'Gris Ardoise', es: 'Gris Pizarra',
        de: 'Schiefergrau', ru: 'Сланцевый Серый', sw: 'Kijivu cha Slate',
        zh: '石板灰', ko: '슬레이트 그레이', ja: 'スレートグレイ',
        bs: 'Sivi Kamen', sq: 'Guri Gri', uz: 'Kulrang Tosht',
        kk: 'Сұр Тастан', ku: 'Sorê Kevirşahî', vi: 'Xám Đá',
        tl: 'Abo na Bato', hi: 'स्लेट ग्रे', ta: 'ஸ்லேட் சாம்பல்',
        si: 'කළු පැහැති ගල්', am: 'ጥቁር ሰማያዊ ጥራጥሬ', yo: 'Awọ Arewa Apata', om: 'Gurraacha Dhagaa',
        rw: 'Ibara ry' + 'ibumba'
    },
    'lavender': {
        ar: 'اللافندر', en: 'Lavender', id: 'Lavendel', ms: 'Lavender',
        ur: 'لاوینڈر', bn: 'ল্যাভেন্ডার', tr: 'Lavanta', fa: 'اسطوخودوس',
        ha: 'Lavanda', fr: 'Lavande', es: 'Lavanda',
        de: 'Lavendel', ru: 'Лаванда', sw: 'Lavenda',
        zh: '薰衣草', ko: '라벤더', ja: 'ラベンダー',
        bs: 'Lavanda', sq: 'Lavanda', uz: 'Lavanda',
        kk: 'Лаванда', ku: 'Laventer', vi: 'Oải Hương',
        tl: 'Lavandula', hi: 'लैवेंडर', ta: 'லாவெண்டர்',
        si: 'ලැවෙන්ඩර්', am: 'ላቬንደር', yo: 'Lafanda', om: 'Laveendara',
        rw: 'Lavande'
    },
    'calm-peach': {
        ar: 'الخوخ الهادئ', en: 'Calm Peach', id: 'Persik Tenang', ms: 'Pic Tenang',
        ur: 'پر سکون آڑو', bn: 'শান্ত পীচ', tr: 'Sakin Şeftali', fa: 'هلوی آرام',
        ha: 'Peshwar mai kwanciyar hankali', fr: 'Pêche Calme', es: 'Durazno Tranquilo',
        de: 'Ruhiger Pfirsich', ru: 'Спокойный Персик', sw: 'Pishi Tulivu',
        zh: '宁静桃', ko: '평온한 복숭아', ja: '静かな桃',
        bs: 'Mirna Breskva', sq: 'Pjeshkë e Qetë', uz: 'Tinch Shaftoli',
        kk: 'Жайлы Шабдалы', ku: 'Hêlîna Aram', vi: 'Đào Yên Bình',
        tl: 'Mapayapang Melokoton', hi: 'शांत आडू', ta: 'அமைதியான பீச்',
        si: 'සාමකාමී පීච්', am: 'ሰላማዊ ፒች', yo: 'Peesi Ọtun', om: 'Qok' + 'orii Tasgabbii',
        rw: 'Igiturage cy' + 'umutekano'
    },
    'morning-sun': {
        ar: 'شمس الصباح', en: 'Morning Sun', id: 'Matahari Pagi', ms: 'Matahari Pagi',
        ur: 'صبح کی دھوپ', bn: 'সকালের সূর্য', tr: 'Sabah Güneşi', fa: 'آفتاب صبحگاهی',
        ha: 'Rana safe', fr: 'Soleil du Matin', es: 'Sol Matutino',
        de: 'Morgensonne', ru: 'Утреннее Солнце', sw: 'Jua la Asubuhi',
        zh: '晨曦', ko: '아침 햇살', ja: '朝日',
        bs: 'Jutarnje Sunce', sq: 'Dielli i Mëngjesit', uz: 'Tong Quyoshi',
        kk: 'Таңғы Күн', ku: 'Tavê Sibê', vi: 'Mặt Trời Buổi Sáng',
        tl: 'Araw ng Umaga', hi: 'सुबह का सूरज', ta: 'காலை சூரியன்',
        si: 'සුදුසු හිරු', am: 'ጠዋት ፀሐይ', yo: 'Ojo Owuro', om: 'Adii Aftanii',
        rw: 'Izuba ry' + 'amanywa'
    }
};

// Language to file mapping
const languages = [
    'ar', 'en', 'id', 'ms', 'ur', 'bn', 'tr', 'fa', 'ha', 'fr',
    'es', 'de', 'ru', 'sw', 'zh', 'ko', 'ja', 'bs', 'sq', 'uz',
    'kk', 'ku', 'vi', 'tl', 'hi', 'ta', 'si', 'am', 'yo', 'om', 'rw'
];

function addThemeNames(lang) {
    const filePath = path.join(i18nDir, `${lang}.json`);
    
    if (!fs.existsSync(filePath)) {
        console.log(`⚠️  File not found: ${lang}.json`);
        return;
    }
    
    let content = fs.readFileSync(filePath, 'utf8');
    let data = JSON.parse(content);
    
    let added = 0;
    
    for (const [themeId, translations] of Object.entries(themeNames)) {
        const key = `themeName_${themeId.replace(/-/g, '_')}`;
        
        if (!data[key]) {
            data[key] = translations[lang] || translations['en'] || themeId;
            added++;
        }
    }
    
    if (added > 0) {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
        console.log(`✅ ${lang}.json: Added ${added} theme name keys`);
    } else {
        console.log(`⏭️  ${lang}.json: All theme names already exist`);
    }
}

// Process all languages
languages.forEach(lang => addThemeNames(lang));

console.log('\n🎉 Done! Theme names added to all language files.');