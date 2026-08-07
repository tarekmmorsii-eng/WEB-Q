// Adds 3 translation keys used by the app but missing from every locale,
// fixing hardcoded Arabic/English fallback leaks:
//   translationNotAvailable  -> shown when a language's translation isn't downloaded
//   translationAyahNotFound   -> shown when a verse's text isn't in loaded data
//   wbwFallbackMessage        -> shown when word-meanings use an alternative language
// Inserted right after manageTranslations (present in every locale).
const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..', 'src', 'assets', 'i18n');

// translationNotAvailable  = "Please download this language's translation from Settings to display it here."
// translationAyahNotFound  = "The text of this verse was not found in the loaded data."
// wbwFallbackMessage       = "The alternative language was used because word meanings are not available in this language."
const T = {
  am: { na: 'እዚህ ለማሳየት እባክዎ የዚህን ቋንቋ ትርጉም ከቅንብሮች ያውርዱ።', nf: 'የዚህ ጥቅል ጽሑፍ በተጫነ ውሂብ ውስጥ አልተገኘም።', wbw: 'በዚህ ቋንቋ የቃላት ትርጉሞች ስላልተገኙ አማራጭ ቋንቋ ጥቅም ላይ ይውላል።' },
  ar: { na: 'يرجى تحميل ترجمة هذه اللغة من شاشة الإعدادات لعرضها هنا', nf: 'لم يتم العثور على نص هذه الآية في البيانات المحملة', wbw: 'استُخدمت لغة بديلة لأن معاني الكلمات غير متاحة بهذه اللغة.' },
  bn: { na: 'এখানে দেখানোর জন্য অনুগ্রহ করে সেটিংস থেকে এই ভাষার অনুবাদ ডাউনলোড করুন।', nf: 'এই আয়াতের পাঠ্য লোড করা ডেটাতে পাওয়া যায়নি।', wbw: 'শব্দার্থ এই ভাষায় উপলব্ধ নয় বলে বিকল্প ভাষা ব্যবহার করা হয়েছে।' },
  bs: { na: 'Molimo preuzmite prijevod ovog jezika iz Postavki kako biste ga prikazali ovdje.', nf: 'Tekst ovog ajeta nije pronađen u učitanim podacima.', wbw: 'Korišten je alternativni jezik jer značenja riječi nisu dostupna na ovom jeziku.' },
  de: { na: 'Bitte laden Sie die Übersetzung dieser Sprache aus den Einstellungen herunter, um sie hier anzuzeigen.', nf: 'Der Text dieses Verses wurde in den geladenen Daten nicht gefunden.', wbw: 'Eine alternative Sprache wurde verwendet, da Wortbedeutungen in dieser Sprache nicht verfügbar sind.' },
  en: { na: "Please download this language's translation from Settings to display it here.", nf: 'The text of this verse was not found in the loaded data.', wbw: 'The alternative language was used because word meanings are not available in this language.' },
  es: { na: 'Descarga la traducción de este idioma desde Ajustes para mostrarla aquí.', nf: 'El texto de este versículo no se encontró en los datos cargados.', wbw: 'Se utilizó un idioma alternativo porque los significados de las palabras no están disponibles en este idioma.' },
  fa: { na: 'برای نمایش در اینجا، لطفاً ترجمه این زبان را از تنظیمات دانلود کنید.', nf: 'متن این آیه در داده‌های بارگذاری شده یافت نشد.', wbw: 'زبان جایگزین استفاده شد زیرا معانی کلمات در این زبان در دسترس نیست.' },
  fr: { na: "Veuillez télécharger la traduction de cette langue depuis les Paramètres pour l'afficher ici.", nf: "Le texte de ce verset n'a pas été trouvé dans les données chargées.", wbw: 'Une langue alternative a été utilisée car les sens des mots ne sont pas disponibles dans cette langue.' },
  ha: { na: 'Don nuna shi anan, don Allah sauke fassarar wannan harshen daga Saituna.', nf: 'Rubutun wannan ayar ba a same shi a cikin bayanan da aka loda ba.', wbw: 'An yi amfani da wani harshen daban domin ba a samun ma’anar kalmomi a wannan harshen ba.' },
  hi: { na: 'यहाँ दिखाने के लिए कृपया इस भाषा का अनुवाद सेटिंग्स से डाउनलोड करें।', nf: 'इस आयत का पाठ लोड किए गए डेटा में नहीं मिला।', wbw: 'वैकल्पिक भाषा का उपयोग किया गया क्योंकि शब्द अर्थ इस भाषा में उपलब्ध नहीं हैं।' },
  id: { na: 'Silakan unduh terjemahan bahasa ini dari Pengaturan untuk menampilkannya di sini.', nf: 'Teks ayat ini tidak ditemukan dalam data yang dimuat.', wbw: 'Bahasa alternatif digunakan karena arti kata tidak tersedia dalam bahasa ini.' },
  ja: { na: 'ここに表示するには、設定からこの言語の翻訳をダウンロードしてください。', nf: 'この節のテキストは読み込まれたデータに見つかりませんでした。', wbw: 'この言語では単語の意味を利用できないため、代替言語が使用されました。' },
  kk: { na: 'Мұнда көрсету үшін, өтінемін осы тілдің аудармасын Параметрлерден жүктеңіз.', nf: 'Бұл аяттың мәтіні жүктелген деректерде табылмады.', wbw: 'Бұл тілде сөз мағыналары қолжетімді болмағандықтан балама тіл қолданылды.' },
  ko: { na: '여기에 표시하려면 설정에서 이 언어의 번역을 다운로드하세요.', nf: '이 구절의 텍스트가 로드된 데이터에서 발견되지 않았습니다.', wbw: '이 언어로는 단어 뜻을 사용할 수 없어 대체 언어가 사용되었습니다.' },
  ku: { na: 'Ji bo nîşandana li vir, ji kerema xwe wergera vê zimanî ji ڕêکخستنەکان dakêşin.', nf: 'Nivîsa vê ayetê di daneyên barkirî de nehat dîtin.', wbw: 'Zimanekî alternatîf hat bikaranîn ji ber ku wateyên peyvan di vê zimanî de berdest nîn in.' },
  ms: { na: 'Sila muat turun terjemahan bahasa ini dari Tetapan untuk memaparkannya di sini.', nf: 'Teks ayat ini tidak dijumpai dalam data yang dimuatkan.', wbw: 'Bahasa alternatif digunakan kerana maksud perkataan tidak tersedia dalam bahasa ini.' },
  om: { na: 'Asitti agarsiisuuf, maaloo hiika afaan kanaa Qindaa’ina irraa buufadhaa.', nf: 'Barreeffama ayaataa kanaa daataa fe’ame keessaa hin argamne.', wbw: 'Afaan biraa fayyadame sababiinsaan hiikni jechootaa afaan kanaan hin jiru.' },
  ru: { na: 'Пожалуйста, скачайте перевод этого языка в Настройках, чтобы отобразить его здесь.', nf: 'Текст этого аята не найден в загруженных данных.', wbw: 'Использован альтернативный язык, так как значения слов недоступны на этом языке.' },
  rw: { na: 'Nyamuneka, kugira ngo yerekanwe hano, manura umusemuro w’iki cyitegererezo mu Igenamiterere.', nf: 'Umwandiko w’iki gice ntabwo wabonetse mu makuru yafunguwe.', wbw: 'Ururimi rw’isubiraho rwakoreshejwe kubera ko amakuru y’amagambo ataboneka mu rurimi rw’iki cyitegererezo.' },
  si: { na: 'මෙහි පෙන්වීමට කරුණාකර මෙම භාෂාවේ පරිවර්තනය සැකසීම් වෙතින් බාගන්න.', nf: 'මෙම ආයාවේ පෙළ පූරණය කළ දත්ත තුළ සොයාගත නොහැක.', wbw: 'මෙම භාෂාවෙන් වචන අර්ථ ලබා ගත නොහැකි බැවින් විකල්ප භාෂාවක් භාවිතා කරන ලදී.' },
  sq: { na: 'Ju lutemi shkarkoni përkthimin e kësaj gjuhe nga Cilësimet për ta shfaqur këtu.', nf: 'Teksti i këtij ajeti nuk u gjet në të dhënat e ngarkuara.', wbw: 'Është përdorur një gjuhë alternative sepse kuptimet e fjalëve nuk janë të disponueshme në këtë gjuhë.' },
  sw: { na: 'Tafadhali pakua tafsiri ya lugha hii kutoka Mipangilio ili kuionyesha hapa.', nf: 'Maandishi ya aya hii hayakupatikana katika data iliyopakiwa.', wbw: 'Lugha mbadala ilitumika kwa sababu maana ya maneno hayapatikani katika lugha hii.' },
  ta: { na: 'இங்கே காட்ட, தயவுசெய்து இந்த மொழியின் மொழிபெயர்ப்பை அமைப்புகளிலிருந்து பதிவிறக்கவும்.', nf: 'இந்த வசனத்தின் உரை ஏற்றப்பட்ட தரவில் காணப்படவில்லை.', wbw: 'இந்த மொழியில் சொல் பொருள்கள் கிடைக்கவில்லை என்பதால் மாற்று மொழி பயன்படுத்தப்பட்டது.' },
  tl: { na: 'Pakiusap i-download ang pagsasalin ng wikang ito mula sa Mga setting para ipakita dito.', nf: 'Ang teksto ng talatang ito ay hindi natagpuan sa na-load na data.', wbw: 'Ginamit ang alternatibong wika dahil hindi available ang kahulugan ng mga salita sa wika na ito.' },
  tr: { na: "Burada görüntülemek için lütfen bu dilin çevirisini Ayarlar'dan indirin.", nf: 'Bu ayetin metni yüklenen verilerde bulunamadı.', wbw: 'Kelime anlamları bu dilde kullanılamadığı için alternatif bir dil kullanıldı.' },
  ur: { na: 'براہ کرم اس زبان کا ترجمہ یہاں دکھانے کے لیے ترتیبات سے ڈاؤن لوڈ کریں۔', nf: 'اس آیت کا متن لوڈ کی گئی ڈیٹا میں نہیں ملا۔', wbw: 'متبادل زبان استعمال کی گئی کیونکہ الفاظ کے معانی اس زبان میں دستیاب نہیں۔' },
  uz: { na: "Bu yerdan ko'rsatish uchun, iltimos ushbu til tarjimasini Sozlamalardan yuklab oling.", nf: "Bu oyat matni yuklangan ma'lumotlarda topilmadi.", wbw: "Bu tilda so'z ma'nolari mavjud bo'lmagani uchun muqobil til ishlatildi." },
  vi: { na: 'Vui lòng tải xuống bản dịch của ngôn ngữ này từ Cài đặt để hiển thị tại đây.', nf: 'Văn bản của câu kinh này không được tìm thấy trong dữ liệu đã tải.', wbw: 'Đã sử dụng ngôn ngữ thay thế vì nghĩa từ không có sẵn trong ngôn ngữ này.' },
  yo: { na: 'Jọwọ gba itumọ ede yii lati inu Ètò lati fi han nibi.', nf: 'Ọrọ inu ẹsẹ yi ko ri ninu data ti a ti gba wọle.', wbw: 'Ede miiran lo lo nitori ti itumo oro ko si ninu ede yi.' },
  zh: { na: '请从设置中下载此语言的翻译以在此显示。', nf: '在已加载的数据中找不到此经文的文本。', wbw: '由于此语言不提供词语含义，因此使用了替代语言。' },
};

const files = fs.readdirSync(dir).filter((f) => f.endsWith('.json'));
let done = 0, skipped = 0, missing = [];

for (const f of files) {
  const code = f.replace('.json', '');
  const t = T[code];
  const full = path.join(dir, f);
  let content = fs.readFileSync(full, 'utf8');

  if (content.includes('"translationNotAvailable"')) { skipped++; continue; }
  if (!t) { missing.push(code); continue; }

  const lines = content.split('\n');
  const out = [];
  let inserted = false, anchorFound = false;

  for (const line of lines) {
    out.push(line);
    if (!inserted && /^\s*"manageTranslations"\s*:/.test(line)) {
      anchorFound = true;
      const indent = line.match(/^(\s*)/)[1];
      out.push(indent + '"translationNotAvailable": ' + JSON.stringify(t.na) + ',');
      out.push(indent + '"translationAyahNotFound": ' + JSON.stringify(t.nf) + ',');
      out.push(indent + '"wbwFallbackMessage": ' + JSON.stringify(t.wbw) + ',');
      inserted = true;
    }
  }

  if (!anchorFound) { console.log('ANCHOR NOT FOUND in', code); continue; }
  fs.writeFileSync(full, out.join('\n'), 'utf8');
  done++;
  console.log('updated', code);
}

console.log('---');
console.log('updated:', done, '| skipped:', skipped);
if (missing.length) console.log('missing translations for:', missing.join(', '));
