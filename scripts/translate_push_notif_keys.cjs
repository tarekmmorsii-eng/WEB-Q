/**
 * سكريبت ترجمة مفاتيح الإشعارات الثمانية لجميع اللغات الـ 31
 * ترجمة يدوية دقيقة - لا يعتمد على أي API
 */
const fs = require('fs');
const path = require('path');

const i18nDir = path.join(__dirname, '..', 'src', 'assets', 'i18n');

// الترجمات اليدوية الدقيقة لكل لغة
const translations = {
  ar: {
    pushNotifTitle: "تفعيل الإشعارات الفورية",
    pushNotifActive: "الإشعارات الفورية مفعّلة ✓",
    pushNotifDesc: "استقبال التنبيهات والتذكيرات المهمة حتى عند إغلاق التطبيق",
    pushNotifActiveDesc: "ستصلك الإشعارات تلقائياً في الخلفية",
    pushNotifConsentTitle: "تفعيل الإشعارات الفورية",
    pushNotifConsentBody: "لتلقي تذكيرات المراجعة حتى عند إغلاق التطبيق، يرجى قبول الطلب الذي سيظهر من المتصفح أو النظام.",
    pushNotifConsentAgree: "موافق، تفعيل",
    pushNotifConsentCancel: "ليس الآن"
  },
  en: {
    pushNotifTitle: "Enable Push Notifications",
    pushNotifActive: "Push Notifications Active ✓",
    pushNotifDesc: "Receive important alerts and reminders even when the app is closed",
    pushNotifActiveDesc: "You will receive notifications automatically in the background",
    pushNotifConsentTitle: "Enable Push Notifications",
    pushNotifConsentBody: "To receive review reminders even when the app is closed, please accept the request that will appear from your browser or system.",
    pushNotifConsentAgree: "OK, Enable",
    pushNotifConsentCancel: "Not Now"
  },
  ru: {
    pushNotifTitle: "Включить push-уведомления",
    pushNotifActive: "Push-уведомления активны ✓",
    pushNotifDesc: "Получайте важные оповещения и напоминания даже когда приложение закрыто",
    pushNotifActiveDesc: "Вы будете получать уведомления автоматически в фоновом режиме",
    pushNotifConsentTitle: "Включить push-уведомления",
    pushNotifConsentBody: "Чтобы получать напоминания о повторении даже когда приложение закрыто, пожалуйста, примите запрос, который появится от вашего браузера или системы.",
    pushNotifConsentAgree: "ОК, включить",
    pushNotifConsentCancel: "Не сейчас"
  },
  bn: {
    pushNotifTitle: "পুশ বিজ্ঞপ্তি সক্রিয় করুন",
    pushNotifActive: "পুশ বিজ্ঞপ্তি সক্রিয় আছে ✓",
    pushNotifDesc: "অ্যাপ বন্ধ থাকলেও গুরুত্বপূর্ণ সতর্কতা ও রিমাইন্ডার পান",
    pushNotifActiveDesc: "আপনি স্বয়ংক্রিয়ভাবে ব্যাকগ্রাউন্ডে বিজ্ঞপ্তি পাবেন",
    pushNotifConsentTitle: "পুশ বিজ্ঞপ্তি সক্রিয় করুন",
    pushNotifConsentBody: "অ্যাপ বন্ধ থাকলেও পর্যালোচনা রিমাইন্ডার পেতে, আপনার ব্রাউজার বা সিস্টেম থেকে আসা অনুরোধটি গ্রহণ করুন।",
    pushNotifConsentAgree: "ঠিক আছে, সক্রিয় করুন",
    pushNotifConsentCancel: "এখন নয়"
  },
  ur: {
    pushNotifTitle: "پش نوٹیفیکیشنز فعال کریں",
    pushNotifActive: "پش نوٹیفیکیشنز فعال ہیں ✓",
    pushNotifDesc: "ایپ بند ہونے پر بھی اہم الرٹس اور یاددہانیاں وصول کریں",
    pushNotifActiveDesc: "آپ خود بخوراکی پس منظر میں نوٹیفیکیشنز وصول کریں گے",
    pushNotifConsentTitle: "پش نوٹیفیکیشنز فعال کریں",
    pushNotifConsentBody: "ایپ بند ہونے پر بھی مراجعہ کی یاددہانیاں وصول کرنے کے لیے، براہ کرم اپنے براؤزر یا سسٹم سے آنے والی درخواست قبول کریں۔",
    pushNotifConsentAgree: "ٹھیک ہے، فعال کریں",
    pushNotifConsentCancel: "ابھی نہیں"
  },
  fr: {
    pushNotifTitle: "Activer les notifications push",
    pushNotifActive: "Notifications push actives ✓",
    pushNotifDesc: "Recevez des alertes et rappels importants même lorsque l'application est fermée",
    pushNotifActiveDesc: "Vous recevrez automatiquement les notifications en arrière-plan",
    pushNotifConsentTitle: "Activer les notifications push",
    pushNotifConsentBody: "Pour recevoir des rappels de révision même lorsque l'application est fermée, veuillez accepter la demande qui apparaîtra depuis votre navigateur ou système.",
    pushNotifConsentAgree: "OK, activer",
    pushNotifConsentCancel: "Pas maintenant"
  },
  de: {
    pushNotifTitle: "Push-Benachrichtigungen aktivieren",
    pushNotifActive: "Push-Benachrichtigungen aktiv ✓",
    pushNotifDesc: "Erhalten Sie wichtige Warnungen und Erinnerungen auch wenn die App geschlossen ist",
    pushNotifActiveDesc: "Sie erhalten automatisch Benachrichtigungen im Hintergrund",
    pushNotifConsentTitle: "Push-Benachrichtigungen aktivieren",
    pushNotifConsentBody: "Um Wiederholungserinnerungen zu erhalten auch wenn die App geschlossen ist, akzeptieren Sie bitte die Anfrage Ihres Browsers oder Systems.",
    pushNotifConsentAgree: "OK, aktivieren",
    pushNotifConsentCancel: "Nicht jetzt"
  },
  es: {
    pushNotifTitle: "Activar notificaciones push",
    pushNotifActive: "Notificaciones push activadas ✓",
    pushNotifDesc: "Reciba alertas y recordatorios importantes incluso cuando la aplicación esté cerrada",
    pushNotifActiveDesc: "Recibirá notificaciones automáticamente en segundo plano",
    pushNotifConsentTitle: "Activar notificaciones push",
    pushNotifConsentBody: "Para recibir recordatorios de revisión incluso cuando la aplicación esté cerrada, acepte la solicitud que aparecerá desde su navegador o sistema.",
    pushNotifConsentAgree: "OK, activar",
    pushNotifConsentCancel: "Ahora no"
  },
  tr: {
    pushNotifTitle: "Push bildirimlerini etkinleştir",
    pushNotifActive: "Push bildirimleri aktif ✓",
    pushNotifDesc: "Uygulama kapalıyken bile önemli uyarılar ve hatırlatıcılar alın",
    pushNotifActiveDesc: "Arka planda otomatik olarak bildirimler alacaksınız",
    pushNotifConsentTitle: "Push bildirimlerini etkinleştir",
    pushNotifConsentBody: "Uygulama kapalıyken bile gözden geçirme hatırlatıcılarını almak için tarayıcınızdan veya sisteminizden gelen isteği kabul edin.",
    pushNotifConsentAgree: "Tamam, etkinleştir",
    pushNotifConsentCancel: "Şimdi değil"
  },
  id: {
    pushNotifTitle: "Aktifkan Notifikasi Push",
    pushNotifActive: "Notifikasi Push Aktif ✓",
    pushNotifDesc: "Terima peringatan dan pengingat penting bahkan saat aplikasi ditutup",
    pushNotifActiveDesc: "Anda akan menerima notifikasi secara otomatis di latar belakang",
    pushNotifConsentTitle: "Aktifkan Notifikasi Push",
    pushNotifConsentBody: "Untuk menerima pengingat ulasan bahkan saat aplikasi ditutup, silakan terima permintaan yang akan muncul dari browser atau sistem Anda.",
    pushNotifConsentAgree: "OK, Aktifkan",
    pushNotifConsentCancel: "Tidak Sekarang"
  },
  hi: {
    pushNotifTitle: "पुश नोटिफिकेशन सक्षम करें",
    pushNotifActive: "पुश नोटिफिकेशन सक्रिय ✓",
    pushNotifDesc: "ऐप बंद होने पर भी महत्वपूर्ण अलर्ट और रिमाइंडर प्राप्त करें",
    pushNotifActiveDesc: "आप स्वचालित रूप से बैकग्राउंड में नोटिफिकेशन प्राप्त करेंगे",
    pushNotifConsentTitle: "पुश नोटिफिकेशन सक्षम करें",
    pushNotifConsentBody: "ऐप बंद होने पर भी समीक्षा रिमाइंडर प्राप्त करने के लिए, कृपया अपने ब्राउज़र या सिस्टम से दिखाई देने वाले अनुरोध को स्वीकार करें।",
    pushNotifConsentAgree: "ठीक है, सक्षम करें",
    pushNotifConsentCancel: "अभी नहीं"
  },
  fa: {
    pushNotifTitle: "فعال‌سازی نوتیفیکیشن‌های پوش",
    pushNotifActive: "نوتیفیکیشن‌های پوش فعال است ✓",
    pushNotifDesc: "دریافت هشدارها و یادآوری‌های مهم حتی زمانی که برنامه بسته است",
    pushNotifActiveDesc: "شما به‌طور خودکار در پس‌زمینه نوتیفیکیشن دریافت خواهید کرد",
    pushNotifConsentTitle: "فعال‌سازی نوتیفیکیشن‌های پوش",
    pushNotifConsentBody: "برای دریافت یادآوری‌های مرور حتی زمانی که برنامه بسته است، لطفاً درخواستی که از مرورگر یا سیستم شما نمایش داده می‌شود را بپذیرید.",
    pushNotifConsentAgree: "باشه، فعال کن",
    pushNotifConsentCancel: "الان نه"
  },
  ja: {
    pushNotifTitle: "プッシュ通知を有効にする",
    pushNotifActive: "プッシュ通知が有効です ✓",
    pushNotifDesc: "アプリが閉じている時でも重要なアラートとリマインダーを受け取る",
    pushNotifActiveDesc: "バックグラウンドで自動的に通知を受け取ります",
    pushNotifConsentTitle: "プッシュ通知を有効にする",
    pushNotifConsentBody: "アプリが閉じている時でも復習リマインダーを受け取るには、ブラウザまたはシステムから表示されるリクエストを承認してください。",
    pushNotifConsentAgree: "OK、有効にする",
    pushNotifConsentCancel: "後で"
  },
  ko: {
    pushNotifTitle: "푸시 알림 활성화",
    pushNotifActive: "푸시 알림 활성됨 ✓",
    pushNotifDesc: "앱이 닫혀 있을 때도 중요한 알림 및 미리 알림 받기",
    pushNotifActiveDesc: "백그라운드에서 자동으로 알림을 받습니다",
    pushNotifConsentTitle: "푸시 알림 활성화",
    pushNotifConsentBody: "앱이 닫혀 있을 때도 복습 알림을 받으려면 브라우저나 시스템에서 나타나는 요청을 수락해 주세요.",
    pushNotifConsentAgree: "확인, 활성화",
    pushNotifConsentCancel: "나중에"
  },
  zh: {
    pushNotifTitle: "启用推送通知",
    pushNotifActive: "推送通知已启用 ✓",
    pushNotifDesc: "即使应用关闭也能接收重要提醒和通知",
    pushNotifActiveDesc: "您将在后台自动接收通知",
    pushNotifConsentTitle: "启用推送通知",
    pushNotifConsentBody: "为了在应用关闭时也能收到复习提醒，请接受来自浏览器或系统的请求。",
    pushNotifConsentAgree: "好的，启用",
    pushNotifConsentCancel: "以后再说"
  },
  ms: {
    pushNotifTitle: "Aktifkan Pemberitahuan Push",
    pushNotifActive: "Pemberitahuan Push Aktif ✓",
    pushNotifDesc: "Terima amaran dan peringatan penting walaupun aplikasi ditutup",
    pushNotifActiveDesc: "Anda akan menerima pemberitahuan secara automatik di latar belakang",
    pushNotifConsentTitle: "Aktifkan Pemberitahuan Push",
    pushNotifConsentBody: "Untuk menerima peringatan semakan walaupun aplikasi ditutup, sila terima permintaan yang akan muncul dari pelayar atau sistem anda.",
    pushNotifConsentAgree: "OK, Aktifkan",
    pushNotifConsentCancel: "Bukan Sekarang"
  },
  ta: {
    pushNotifTitle: "புஷ் அறிவிப்புகளை இயக்கு",
    pushNotifActive: "புஷ் அறிவிப்புகள் செயலில் உள்ளன ✓",
    pushNotifDesc: "ஆப் மூடப்பட்டிருக்கும்போதும் முக்கிய எச்சரிக்கைகள் மற்றும் நினைவூட்டல்களைப் பெறுங்கள்",
    pushNotifActiveDesc: "பின்னணியில் தானாக அறிவிப்புகளைப் பெறுவீர்கள்",
    pushNotifConsentTitle: "புஷ் அறிவிப்புகளை இயக்கு",
    pushNotifConsentBody: "ஆப் மூடப்பட்டிருக்கும்போதும் மதிப்பாய்வு நினைவூட்டல்களைப் பெற, உங்கள் உலாவி அல்லது கணினியில் தோன்றும் கோரிக்கையை ஏற்கவும்.",
    pushNotifConsentAgree: "சரி, இயக்கு",
    pushNotifConsentCancel: "இப்போது வேண்டாம்"
  },
  tl: {
    pushNotifTitle: "I-enable ang Push Notifications",
    pushNotifActive: "Ang Push Notifications ay Aktibo ✓",
    pushNotifDesc: "Tumanggap ng mahahalagang alerto at paalala kahit sarado ang app",
    pushNotifActiveDesc: "Awtomatikong makakatanggap ng notifications sa background",
    pushNotifConsentTitle: "I-enable ang Push Notifications",
    pushNotifConsentBody: "Upang makatanggap ng paalala sa pag-review kahit sarado ang app, pakiusap tanggapin ang kahilingan na lalabas sa iyong browser o sistema.",
    pushNotifConsentAgree: "OK, I-enable",
    pushNotifConsentCancel: "Hindi Ngayon"
  },
  sw: {
    pushNotifTitle: "Washa Arifa za Push",
    pushNotifActive: "Arifa za Push zimeshazimiwa ✓",
    pushNotifDesc: "Pokea tahadhari na vikumbusho muhimu hata wakati programu imefungwa",
    pushNotifActiveDesc: "Utapokea arifa kiotomatiki chinichini",
    pushNotifConsentTitle: "Washa Arifa za Push",
    pushNotifConsentBody: "Ili kupokea vikumbusho vya ukaguzi hata programu ikiwa imefungwa, tafadhali kukubali ombi litakaloonekana kutoka kwa kivinjali chako au mfumo wako.",
    pushNotifConsentAgree: "Sawa, Washa",
    pushNotifConsentCancel: "Sio Sasa"
  },
  ha: {
    pushNotifTitle: "Kunna Push Notifications",
    pushNotifActive: "Push Notifications suna aiki ✓",
    pushNotifDesc: "Karɓi muhimman faɗakarwa da tunatarwa ko da app ɗin ta rufe",
    pushNotifActiveDesc: "Zaku karɓi sanarwa ta atomatik a bango",
    pushNotifConsentTitle: "Kunna Push Notifications",
    pushNotifConsentBody: "Don karɓar tunatarwar bita ko da app ɗin ta rufe, da fatan za a amince da buƙatar da za ta bayyana daga burauzar ko tsarin ku.",
    pushNotifConsentAgree: "To, Kunna",
    pushNotifConsentCancel: "Ba Yanzu ba"
  },
  am: {
    pushNotifTitle: "የፑሽ ማሳወቂያዎችን ያንቁ",
    pushNotifActive: "የፑሽ ማሳወቂያዎች ንቁ ናቸው ✓",
    pushNotifDesc: "መተግበሪያው ተዘግቶ ቢሆንም አስፈላጊ ማንቂያዎችን እና ማስታወሻዎችን ይቀበሉ",
    pushNotifActiveDesc: "በጀርባ ላይ ራስ-ሰር ማሳወቂያዎችን ይቀበላሉ",
    pushNotifConsentTitle: "የፑሽ ማሳወቂያዎችን ያንቁ",
    pushNotifConsentBody: "መተግበሪያው ተዘግቶ ቢሆንም የግምገማ ማስታወሻዎችን ለመቀበል እባክዎ ከአሳሹ ወይም ከስርዓተ ክወናዎ የሚታየውን ጥያቄ ይቀበሉ።",
    pushNotifConsentAgree: "እሺ፣ ያንቁ",
    pushNotifConsentCancel: "አሁን አይ"
  },
  om: {
    pushNotifTitle: "Beeksisa Push Dandeessisi",
    pushNotifActive: "Beeksisa Push Hojii Irra ✓",
    pushNotifDesc: "Beeksisa fi yaadachiisa barbaachisoo appiin cufameettiyyuu argadhu",
    pushNotifActiveDesc: "Duuchaa irratti ofii beeksisa argatta",
    pushNotifConsentTitle: "Beeksisa Push Dandeessisi",
    pushNotifConsentBody: "Yaadachiisa qorannoo appiin cufameettiyyuu argachuuf, osoo bilbileessi ykn sirna keessan irraa mul'atu fudhadhaa.",
    pushNotifConsentAgree: "Haala, Dandeessisi",
    pushNotifConsentCancel: "Amma Mitii"
  },
  rw: {
    pushNotifTitle: "Emeza Ibyumviriza Push",
    pushNotifActive: "Ibyumviriza Push Bifunguye ✓",
    pushNotifDesc: "Emeza inyuranye n'ibibutso by'ingenzi iyo porogaramu yafunze",
    pushNotifActiveDesc: "Uzabyumviriza mu buryo bwikora inyuma",
    pushNotifConsentTitle: "Emeza Ibyumviriza Push",
    pushNotifConsentBody: "Kugira ngo umenye ibibutso by'isuzuma iyo porogaramu yafunze, mwasabye kwemera ikibazo kizagaragara muri mu cyakozwe cyangwa muri sisitemu yawe.",
    pushNotifConsentAgree: "Yego, Emeza",
    pushNotifConsentCancel: "Oya Ubu"
  },
  si: {
    pushNotifTitle: "පුෂ් දැනුම්දීම් සක්‍රීය කරන්න",
    pushNotifActive: "පුෂ් දැනුම්දීම් සක්‍රීයයි ✓",
    pushNotifDesc: "යෙදුම වසා ඇති විටත් වැදගත් අනතුරු ඇඟවීම් සහ මතක දැනුම්දීම් ලබා ගන්න",
    pushNotifActiveDesc: "ඔබ පසුබිමේ ස්වයංක්‍රීයව දැනුම්දීම් ලබා ගනු ඇත",
    pushNotifConsentTitle: "පුෂ් දැනුම්දීම් සක්‍රීය කරන්න",
    pushNotifConsentBody: "යෙදුම වසා ඇති විටත් සමාලෝචන මතක දැනුම්දීම් ලබා ගැනීමට, කරුණාකර ඔබේ බ්‍රවුසරයෙන් හෝ පද්ධතියෙන් පෙන්වන ඉල්ලීම පිළිගන්න.",
    pushNotifConsentAgree: "හරි, සක්‍රීය කරන්න",
    pushNotifConsentCancel: "දැන් නොවේ"
  },
  bs: {
    pushNotifTitle: "Aktiviraj push obavještenja",
    pushNotifActive: "Push obavještenja su aktivna ✓",
    pushNotifDesc: "Primaite važna upozorenja i podsjetnike čak i kada je aplikacija zatvorena",
    pushNotifActiveDesc: "Automatski ćete primati obavještenja u pozadini",
    pushNotifConsentTitle: "Aktiviraj push obavještenja",
    pushNotifConsentBody: "Da biste primali podsjetnike za ponavljanje čak i kada je aplikacija zatvorena, prihvatite zahtjev koji će se pojaviti iz vašeg preglednika ili sistema.",
    pushNotifConsentAgree: "OK, aktiviraj",
    pushNotifConsentCancel: "Ne sada"
  },
  kk: {
    pushNotifTitle: "Push хабарландыруларын қосу",
    pushNotifActive: "Push хабарландырулары белсенді ✓",
    pushNotifDesc: "Қолданба жабық болғанда да маңызды ескертулер мен еске салғыштарды алыңыз",
    pushNotifActiveDesc: "Сіз фондық режимде хабарландыруларды автоматты түрде аласыз",
    pushNotifConsentTitle: "Push хабарландыруларын қосу",
    pushNotifConsentBody: "Қолданба жабық болғанда да қайталау еске салғыштарын алу үшін, браузеріңізден немесе жүйеңізден пайда болатын сұрауды қабылдаңыз.",
    pushNotifConsentAgree: "Жақсы, қосу",
    pushNotifConsentCancel: "Қазір емес"
  },
  ku: {
    pushNotifTitle: "ئاگاداریەکانی پوش چالاک بکە",
    pushNotifActive: "ئاگاداریەکانی پوش چالاکە ✓",
    pushNotifDesc: "ئاگاداری و بیرخەرەوەی گرنگ وەربگرە تەنانەت کاتێک ئەپەکە داخرابێت",
    pushNotifActiveDesc: "بە شێوەیەکی ئۆتۆماتیکی لە پشتەوە ئاگاداری وەردەگریت",
    pushNotifConsentTitle: "ئاگاداریەکانی پوش چالاک بکە",
    pushNotifConsentBody: "بۆ وەرگرتنی بیرخەرەوەی پێداچوونەوە تەنانەت کاتێک ئەپەکە داخرابێت، تکایە داواکارییەکەی وەرگرت لە وێبگەڕەکەت یان سیستەمەکەت.",
    pushNotifConsentAgree: "باشە، چالاک بکە",
    pushNotifConsentCancel: "ئێستا نا"
  },
  sq: {
    pushNotifTitle: "Aktivizo njoftimet push",
    pushNotifActive: "Njoftimet push janë aktive ✓",
    pushNotifDesc: "Merrni paralajmërime dhe kujtesa të rëndësishme edhe kur aplikacioni është i mbyllur",
    pushNotifActiveDesc: "Do të merrni njoftime automatikisht në sfond",
    pushNotifConsentTitle: "Aktivizo njoftimet push",
    pushNotifConsentBody: "Për të marrë kujtesa rishikimi edhe kur aplikacioni është i mbyllur, ju lutemi pranojeni kërkesën që do të shfaqet nga shfletuesi ose sistemi juaj.",
    pushNotifConsentAgree: "OK, aktivizo",
    pushNotifConsentCancel: "Jo tani"
  },
  uz: {
    pushNotifTitle: "Push xabarnomalarni yoqish",
    pushNotifActive: "Push xabarnomalar faol ✓",
    pushNotifDesc: "Ilova yopiq bo'lsa ham muhim ogohlantirishlar va eslatmalarni qabul qiling",
    pushNotifActiveDesc: "Fonda avtomatik ravishda xabarnomalar olasiz",
    pushNotifConsentTitle: "Push xabarnomalarni yoqish",
    pushNotifConsentBody: "Ilova yopiq bo'lsa ham takrorlash eslatmalarini olish uchun, brauzeringiz yoki tizimingizdan paydo bo'ladigan so'rovni qabul qiling.",
    pushNotifConsentAgree: "OK, yoqish",
    pushNotifConsentCancel: "Hozir emas"
  },
  vi: {
    pushNotifTitle: "Bật thông báo đẩy",
    pushNotifActive: "Thông báo đẩy đã bật ✓",
    pushNotifDesc: "Nhận cảnh báo và lời nhắc quan trọng ngay cả khi ứng dụng đã đóng",
    pushNotifActiveDesc: "Bạn sẽ nhận được thông báo tự động ở nền",
    pushNotifConsentTitle: "Bật thông báo đẩy",
    pushNotifConsentBody: "Để nhận lời nhắc ôn tập ngay cả khi ứng dụng đã đóng, vui lòng chấp nhận yêu cầu sẽ xuất hiện từ trình duyệt hoặc hệ thống của bạn.",
    pushNotifConsentAgree: "OK, Bật",
    pushNotifConsentCancel: "Không phải bây giờ"
  },
  yo: {
    pushNotifTitle: "Mu Awọn iwifunni Push ṣiṣẹ",
    pushNotifActive: "Awọn iwifunni Push n ṣiṣẹ ✓",
    pushNotifDesc: "Gba awọn ikilọ pataki ati iranti paapaa nigbati app naa ti pa",
    pushNotifActiveDesc: "Iwọ yoo gba awọn iwifunni laifọwọyi ni ẹhin",
    pushNotifConsentTitle: "Mu Awọn iwifunni Push ṣiṣẹ",
    pushNotifConsentBody: "Lati gba awọn iranti atunyẹwo paapaa nigbati app naa ti pa, jọwọ gba ibeere ti yoo han lati ẹrọ aṣawakiri tabi eto rẹ.",
    pushNotifConsentAgree: "OK, Mu ṣiṣẹ",
    pushNotifConsentCancel: "Kii ṣe Bayi"
  }
};

// المفاتيح المطلوب ترجمتها
const keysToTranslate = [
  'pushNotifTitle',
  'pushNotifActive', 
  'pushNotifDesc',
  'pushNotifActiveDesc',
  'pushNotifConsentTitle',
  'pushNotifConsentBody',
  'pushNotifConsentAgree',
  'pushNotifConsentCancel'
];

let updatedCount = 0;
let skippedCount = 0;
let errorCount = 0;

// الحصول على قائمة جميع ملفات اللغات
const files = fs.readdirSync(i18nDir).filter(f => f.endsWith('.json'));

for (const file of files) {
  const langCode = file.replace('.json', '');
  const filePath = path.join(i18nDir, file);
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(content);
    
    // التحقق من وجود ترجمة لهذه اللغة
    if (!translations[langCode]) {
      console.log(`⚠️ لا توجد ترجمة لـ ${langCode} - يتم التخطي`);
      skippedCount++;
      continue;
    }
    
    let changed = false;
    const langTranslations = translations[langCode];
    
    for (const key of keysToTranslate) {
      if (data.hasOwnProperty(key) && langTranslations[key]) {
        const oldValue = data[key];
        data[key] = langTranslations[key];
        if (oldValue !== langTranslations[key]) {
          changed = true;
        }
      }
    }
    
    if (changed) {
      // الحفاظ على التنسيق الأصلي للملف
      const newContent = JSON.stringify(data, null, 2);
      fs.writeFileSync(filePath, newContent + '\n', 'utf8');
      console.log(`✅ تم تحديث ${langCode}.json`);
      updatedCount++;
    } else {
      console.log(`ℹ️ ${langCode}.json - لا تغييرات مطلوبة`);
      skippedCount++;
    }
    
  } catch (err) {
    console.error(`❌ خطأ في ${file}: ${err.message}`);
    errorCount++;
  }
}

console.log('\n========== الملخص ==========');
console.log(`✅ تم تحديث: ${updatedCount} ملف`);
console.log(`ℹ️ تم التخطي: ${skippedCount} ملف`);
console.log(`❌ أخطاء: ${errorCount} ملف`);
console.log('============================');