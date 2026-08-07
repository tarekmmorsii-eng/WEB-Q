// Adds native-app recitations tour keys (tourDownloadRecitationsTitle/Desc)
// to every i18n locale, inserted right after tourDownloadAppDesc.
// Translations reuse existing terminology (fullRecitations / selectReciter)
// already present in each locale to stay consistent with the app's voice.
const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..', 'src', 'assets', 'i18n');

// title  = "Download Recitations"
// desc   = "From here you can download your favorite reciters to listen to them offline later."
const T = {
  am: { title: 'ንባቦችን ያውርዱ', desc: 'ከዚህ ተወስኖ ተወዳጅ አንባቢዎችዎን በኋላ በመስመር ውጭ ለማዳመጥ ማውረድ ይችላሉ።' },
  ar: { title: 'تحميل التلاوات', desc: 'من هنا يمكنك تحميل أصوات القراء المفضلة لديك للاستماع إليها لاحقاً بدون إنترنت.' },
  bn: { title: 'তেলাওয়াত ডাউনলোড করুন', desc: 'এখান থেকে আপনি আপনার প্রিয় তেলাওয়াতকারীকে পরে অফলাইনে শোনার জন্য ডাউনলোড করতে পারেন।' },
  bs: { title: 'Preuzmi Učenje', desc: 'Odavde možete preuzeti svoje omiljene učače kako biste ih kasnije slušali bez interneta.' },
  de: { title: 'Rezitationen herunterladen', desc: 'Von hier aus können Sie Ihre Lieblings-Rezitatoren herunterladen, um sie später offline anzuhören.' },
  en: { title: 'Download Recitations', desc: 'From here you can download your favorite reciters to listen to them offline later.' },
  es: { title: 'Descargar Recitaciones', desc: 'Desde aquí puedes descargar tus recitadores favoritos para escucharlos sin conexión más tarde.' },
  fa: { title: 'دانلود تلاوت‌ها', desc: 'از اینجا می‌توانید قاری‌های مورد علاقه خود را برای گوش دادن آفلاین بعداً دانلود کنید.' },
  fr: { title: 'Télécharger les Récitations', desc: "D'ici, vous pouvez télécharger vos récitateurs préférés pour les écouter plus tard hors ligne." },
  ha: { title: 'Sauke Karatun', desc: 'Daga nan zaka iya sauke masu karatun da kake so don sauraro ba tare da intanet ba daga baya.' },
  hi: { title: 'तिलावत डाउनलोड करें', desc: 'यहाँ से आप अपने पसंदीदा कारी को बाद में ऑफ़लाइन सुनने के लिए डाउनलोड कर सकते हैं।' },
  id: { title: 'Unduh Tilawah', desc: 'Dari sini Anda dapat mengunduh qari favorit Anda untuk didengarkan secara offline nanti.' },
  ja: { title: '読誦をダウンロード', desc: 'ここからお気に入りの朗誦者をダウンロードして、後でオフラインで聴くことができます。' },
  kk: { title: 'Тілауаттарды жүктеу', desc: 'Мұнда сіз ұнататын қариларды кейін офлайн тыңдау үшін жүктеп ала аласыз.' },
  ko: { title: '낭송 다운로드', desc: '여기서 즐겨 찾는 낭송자를 다운로드하여 나중에 오프라인으로 들을 수 있습니다.' },
  ku: { title: 'Xwendinan dakêşin', desc: 'Ji vir hûn dikarin xwendevanên xwe yên bijarte ji bo guhdarkirina bê înternetê paşê dakêşin.' },
  ms: { title: 'Muat Turun Bacaan', desc: 'Dari sini anda boleh memuat turun qari kegemaran anda untuk didengar secara luar talian kemudian.' },
  om: { title: 'Qara’aa Buufadhu', desc: 'Asirraa qara’ota jaalatamtoota kee buufachuu dandeessa, booda interneefiyya ala irratti dhagahuf.' },
  ru: { title: 'Скачать чтения', desc: 'Отсюда вы можете скачать своих любимых чтецов, чтобы позже слушать их офлайн.' },
  rw: { title: 'Kuramo Gusoma', desc: 'Hano ushobora gukuramo abasomyi ukunda kugira ngo wumve nta interineti nyuma.' },
  si: { title: 'පාරායනය බාගන්න', desc: 'මෙතැනින් ඔබට පසුව මාර්ගඅපගතව ශ්‍රවණය කිරීම සඳහා ඔබේ ප්‍රියතම පාරායනකරුවන් බාගත කළ හැක.' },
  sq: { title: 'Shkarko Recitime', desc: 'Prej këtej mund të shkarkoni recituesit tuaj të preferuar për t’i dëgjuar më vonë pa internet.' },
  sw: { title: 'Pakua Usomaji', desc: 'Hapa unaweza kupakua wasomaji wako wapendwa ili kuwasikiliza bila mtandao baadaye.' },
  ta: { title: 'ஓதுதல்களைப் பதிவிறக்கு', desc: 'இங்கிருந்து நீங்கள் உங்களுக்குப் பிடித்த ஓதுபவர்களைப் பின்னர் இணையம் இல்லாமல் கேட்பதற்கு பதிவிறக்கலாம்.' },
  tl: { title: 'I-download ang Pagbabasa', desc: 'Mula rito maaari mong i-download ang iyong mga paboritong mambabasa upang pakinggan offline mamaya.' },
  tr: { title: 'Tilavetleri İndir', desc: 'Buradan sevdiğiniz okuyucuları indirip daha sonra çevrimdışı dinleyebilirsiniz.' },
  ur: { title: 'تلاوتیں ڈاؤن لوڈ کریں', desc: 'یہاں سے آپ اپنے پسندیدہ قاری کو بعد میں آف لائن سننے کے لیے ڈاؤن لوڈ کر سکتے ہیں۔' },
  uz: { title: 'Tilovatlarni yuklab olish', desc: "Bu yerdan sevimli qorilaringizni yuklab olib, keyinchalik oflayn tinglashingiz mumkin." },
  vi: { title: 'Tải xuống các bài tụng', desc: 'Từ đây bạn có thể tải xuống những người đọc yêu thích của mình để nghe ngoại tuyến sau này.' },
  yo: { title: 'Gba Kika', desc: 'Láti ìbí yìí o le gba awọn oluka rẹ ti o fẹ́ láti gbọ́ láì ló orí ayélówára níwájú.' },
  zh: { title: '下载诵读', desc: '您可以在此处下载您最喜欢的诵读者，以便稍后离线收听。' },
};

const files = fs.readdirSync(dir).filter((f) => f.endsWith('.json'));
let done = 0;
let skipped = 0;
let missing = [];

for (const f of files) {
  const code = f.replace('.json', '');
  const t = T[code];
  const full = path.join(dir, f);
  let content = fs.readFileSync(full, 'utf8');

  if (content.includes('"tourDownloadRecitationsTitle"')) {
    skipped++;
    continue;
  }

  if (!t) {
    missing.push(code);
    continue;
  }

  const lines = content.split('\n');
  const out = [];
  let inserted = false;
  let anchorFound = false;

  for (const line of lines) {
    out.push(line);
    // Match the anchor key line (top-level key on its own line).
    if (!inserted && /^\s*"tourDownloadAppDesc"\s*:/.test(line)) {
      anchorFound = true;
      const indent = line.match(/^(\s*)/)[1];
      out.push(indent + '"tourDownloadRecitationsTitle": ' + JSON.stringify(t.title) + ',');
      out.push(indent + '"tourDownloadRecitationsDesc": ' + JSON.stringify(t.desc) + ',');
      inserted = true;
    }
  }

  if (!anchorFound) {
    console.log('ANCHOR NOT FOUND in', code);
    continue;
  }

  fs.writeFileSync(full, out.join('\n'), 'utf8');
  done++;
  console.log('updated', code);
}

console.log('---');
console.log('updated:', done, '| skipped (already had keys):', skipped);
if (missing.length) console.log('missing translations for:', missing.join(', '));
