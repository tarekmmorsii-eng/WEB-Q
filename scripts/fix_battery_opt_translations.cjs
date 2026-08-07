/**
 * سكربت لإضافة ترجمات نافذة "تحسين البطارية" إلى جميع اللغات الـ31
 * Battery Optimization Modal Translations
 */
const fs = require('fs');
const path = require('path');

const i18nDir = path.join(__dirname, '..', 'src', 'assets', 'i18n');

// ترجمات نافذة تحسين البطارية لكل لغة
const batteryOptTranslations = {
    ar: {
        batteryOptTitle: "لضمان وصول التنبيهات",
        batteryOptDesc: "أنظمة الهواتف قد تقوم بإيقاف التنبيهات لتوفير البطارية. لضمان تنبيهك في الوقت المناسب، يرجى تفعيل الصلاحية باتباع الآتي عند فتح الإعدادات:",
        batteryOptStepsTitle: "💡 خطوات التفعيل البسيطة:",
        batteryOptStep1: 'اضغط على <b>"البطارية" (Battery)</b> أو "استخدام البطارية".',
        batteryOptStep2: 'اختر <b>"غير مقيّد" (Unrestricted)</b> أو "بلا قيود".',
        batteryOptDontShow: "لا تظهر لي هذا التنبيه مجدداً",
        batteryOptAllowBg: "السماح بالعمل في الخلفية",
        batteryOptLater: "لاحقاً"
    },
    en: {
        batteryOptTitle: "To ensure notifications arrive",
        batteryOptDesc: "Phone systems may stop notifications to save battery. To ensure you are notified on time, please enable the permission by following these steps when settings open:",
        batteryOptStepsTitle: "💡 Simple activation steps:",
        batteryOptStep1: 'Tap on <b>"Battery"</b> or "Battery usage".',
        batteryOptStep2: 'Select <b>"Unrestricted"</b> or "No restrictions".',
        batteryOptDontShow: "Don't show this notification again",
        batteryOptAllowBg: "Allow background work",
        batteryOptLater: "Later"
    },
    id: {
        batteryOptTitle: "Untuk memastikan notifikasi terkirim",
        batteryOptDesc: "Sistem ponsel mungkin menghentikan notifikasi untuk menghemat baterai. Untuk memastikan Anda diberi tahu tepat waktu, silakan aktifkan izin dengan mengikuti langkah berikut saat pengaturan terbuka:",
        batteryOptStepsTitle: "💡 Langkah aktivasi sederhana:",
        batteryOptStep1: 'Ketuk <b>"Baterai" (Battery)</b> atau "Penggunaan baterai".',
        batteryOptStep2: 'Pilih <b>"Tidak dibatasi" (Unrestricted)</b> atau "Tanpa batasan".',
        batteryOptDontShow: "Jangan tampilkan notifikasi ini lagi",
        batteryOptAllowBg: "Izinkan berjalan di latar belakang",
        batteryOptLater: "Nanti"
    },
    ms: {
        batteryOptTitle: "Untuk memastikan pemberitahuan diterima",
        batteryOptDesc: "Sistem telefon mungkin menghentikan pemberitahuan untuk menjimatkan bateri. Untuk memastikan anda dimaklumkan tepat pada masanya, sila aktifkan kebenaran dengan mengikut langkah berikut apabila tetapan dibuka:",
        batteryOptStepsTitle: "💡 Langkah pengaktifan mudah:",
        batteryOptStep1: 'Ketik <b>"Bateri" (Battery)</b> atau "Penggunaan bateri".',
        batteryOptStep2: 'Pilih <b>"Tidak terhad" (Unrestricted)</b> atau "Tiada had".',
        batteryOptDontShow: "Jangan tunjuk pemberitahuan ini lagi",
        batteryOptAllowBg: "Benarkan berjalan di latar belakang",
        batteryOptLater: "Kemudian"
    },
    ur: {
        batteryOptTitle: "اطلاعات یقینی بنانے کے لیے",
        batteryOptDesc: "فون سسٹم بیٹری بچانے کے لیے اطلاعات کو روک سکتے ہیں۔ وقت پر اطلاعات موصول کرنے کے لیے، براہ کرم سیٹنگز کھلتے ہی درج ذیل مراحل پر عمل کر کے اجازت فعال کریں:",
        batteryOptStepsTitle: "💡 آسان فعال کرنے کے مراحل:",
        batteryOptStep1: '<b>"بیٹری" (Battery)</b> یا "بیٹری استعمال" پر ٹیپ کریں۔',
        batteryOptStep2: '<b>"غیر محدود" (Unrestricted)</b> یا "بلا قید" منتخب کریں۔',
        batteryOptDontShow: "یہ اطلاع دوبارہ مت دکھائیں",
        batteryOptAllowBg: "پس منظر میں چلنے کی اجازت دیں",
        batteryOptLater: "بعد میں"
    },
    bn: {
        batteryOptTitle: "বিজ্ঞপ্তি নিশ্চিত করতে",
        batteryOptDesc: "ফোন সিস্টেম ব্যাটারি সাশ্রয়ের জন্য বিজ্ঞপ্তি বন্ধ করতে পারে। সময়মতো বিজ্ঞপ্তি পেতে, সেটিংস খোলার পর নিম্নলিখিত ধাপ অনুসরণ করে অনুমতি সক্রিয় করুন:",
        batteryOptStepsTitle: "💡 সহজ সক্রিয়করণ ধাপ:",
        batteryOptStep1: '<b>"ব্যাটারি" (Battery)</b> বা "ব্যাটারি ব্যবহার"-এ ট্যাপ করুন।',
        batteryOptStep2: '<b>"অসীমিত" (Unrestricted)</b> বা "কোনো সীমা নেই" নির্বাচন করুন।',
        batteryOptDontShow: "এই বিজ্ঞপ্তি আবার দেখাবেন না",
        batteryOptAllowBg: "ব্যাকগ্রাউন্ডে চলতে অনুমতি দিন",
        batteryOptLater: "পরে"
    },
    tr: {
        batteryOptTitle: "Bildirimlerin ulaşmasını sağlamak için",
        batteryOptDesc: "Telefon sistemleri bataryayı tasarruf için bildirimleri durdurabilir. Zamanında bilgilendirilmek için, ayarlar açıldığında aşağıdaki adımları izleyerek izni etkinleştirin:",
        batteryOptStepsTitle: "💡 Basit etkinleştirme adımları:",
        batteryOptStep1: '<b>"Pil" (Battery)</b> veya "Pil kullanımı"na dokunun.',
        batteryOptStep2: '<b>"Kısıtlamasız" (Unrestricted)</b> veya "Kısıt yok" seçeneğini seçin.',
        batteryOptDontShow: "Bu bildirimi tekrar gösterme",
        batteryOptAllowBg: "Arka planda çalışmaya izin ver",
        batteryOptLater: "Sonra"
    },
    fa: {
        batteryOptTitle: "برای اطمینان از دریافت اعلان‌ها",
        batteryOptDesc: "سیستم‌های گوشی ممکن است برای صرفه‌جویی در باتری اعلان‌ها را متوقف کنند. برای اطمینان از اعلان به‌موقع، لطفاً هنگام باز شدن تنظیمات با انجام مراحل زیر اجازه را فعال کنید:",
        batteryOptStepsTitle: "💡 مراحل ساده فعال‌سازی:",
        batteryOptStep1: 'روی <b>"باتری" (Battery)</b> یا "استفاده از باتری" ضربه بزنید.',
        batteryOptStep2: '<b>"بدون محدودیت" (Unrestricted)</b> یا "بدون قید" را انتخاب کنید.',
        batteryOptDontShow: "این اعلان را دوباره نشان نده",
        batteryOptAllowBg: "اجازه فعالیت در پس‌زمینه",
        batteryOptLater: "بعداً"
    },
    ha: {
        batteryOptTitle: "Don tabbatar da isar da sanarwa",
        batteryOptDesc: "Tsarin waya na iya dakatar da sanarwa don adana baturi. Don tabbatar da an sanar da ku akan lokaci, da fatan za a kunna izinin ta bin wannan matakai lokacin da saituna suka buɗe:",
        batteryOptStepsTitle: "💡 Sauƙin matakan kunna:",
        batteryOptStep1: 'Danna <b>"Baturi" (Battery)</b> ko "Amfani da baturi".',
        batteryOptStep2: 'Zaɓi <b>"Ba a ƙuntatawa" (Unrestricted)</b> ko "Babu ƙuntatawa".',
        batteryOptDontShow: "Kar a nuna wannan sanarwar sake",
        batteryOptAllowBg: "Bada izinin aiki a bango",
        batteryOptLater: "Daga baya"
    },
    fr: {
        batteryOptTitle: "Pour garantir la réception des notifications",
        batteryOptDesc: "Les systèmes de téléphone peuvent arrêter les notifications pour économiser la batterie. Pour être notifié à temps, veuillez activer l'autorisation en suivant ces étapes lors de l'ouverture des paramètres :",
        batteryOptStepsTitle: "💡 Étapes d'activation simples :",
        batteryOptStep1: 'Appuyez sur <b>« Batterie » (Battery)</b> ou « Utilisation de la batterie ».',
        batteryOptStep2: 'Sélectionnez <b>« Sans restriction » (Unrestricted)</b> ou « Aucune restriction ».',
        batteryOptDontShow: "Ne plus afficher cette notification",
        batteryOptAllowBg: "Autoriser le fonctionnement en arrière-plan",
        batteryOptLater: "Plus tard"
    },
    es: {
        batteryOptTitle: "Para garantizar la recepción de notificaciones",
        batteryOptDesc: "Los sistemas telefónicos pueden detener las notificaciones para ahorrar batería. Para asegurarse de ser notificado a tiempo, habilite el permiso siguiendo estos pasos cuando se abra la configuración:",
        batteryOptStepsTitle: "💡 Pasos sencillos de activación:",
        batteryOptStep1: 'Toque <b>"Batería" (Battery)</b> o "Uso de batería".',
        batteryOptStep2: 'Seleccione <b>"Sin restricciones" (Unrestricted)</b> o "Sin límites".',
        batteryOptDontShow: "No mostrar esta notificación de nuevo",
        batteryOptAllowBg: "Permitir funcionamiento en segundo plano",
        batteryOptLater: "Más tarde"
    },
    de: {
        batteryOptTitle: "Um den Empfang von Benachrichtigungen zu gewährleisten",
        batteryOptDesc: "Telefonsysteme können Benachrichtigungen stoppen, um Batterie zu sparen. Um rechtzeitig benachrichtigt zu werden, aktivieren Sie die Berechtigung mit folgenden Schritten, wenn die Einstellungen geöffnet werden:",
        batteryOptStepsTitle: "💡 Einfache Aktivierungsschritte:",
        batteryOptStep1: 'Tippen Sie auf <b>„Akku" (Battery)</b> oder „Akkunutzung".',
        batteryOptStep2: 'Wählen Sie <b>„Uneingeschränkt" (Unrestricted)</b> oder „Keine Einschränkungen".',
        batteryOptDontShow: "Diese Benachrichtigung nicht mehr anzeigen",
        batteryOptAllowBg: "Hintergrundbetrieb erlauben",
        batteryOptLater: "Später"
    },
    ru: {
        batteryOptTitle: "Для обеспечения получения уведомлений",
        batteryOptDesc: "Системы телефонов могут останавливать уведомления для экономии заряда батареи. Чтобы получать уведомления вовремя, включите разрешение, выполнив следующие шаги при открытии настроек:",
        batteryOptStepsTitle: "💡 Простые шаги активации:",
        batteryOptStep1: 'Нажмите <b>«Батарея» (Battery)</b> или «Использование батареи».',
        batteryOptStep2: 'Выберите <b>«Без ограничений» (Unrestricted)</b> или «Без ограничений».',
        batteryOptDontShow: "Больше не показывать это уведомление",
        batteryOptAllowBg: "Разрешить работу в фоновом режиме",
        batteryOptLater: "Позже"
    },
    sw: {
        batteryOptTitle: "Ili kuhakikisha arifa zinapokelewa",
        batteryOptDesc: "Mifumo ya simu inaweza kusitisha arifa ili kuokoa betri. Ili kuhakikisha unapewa arifa kwa wakati, tafadhali wezesha ruhusa kwa kufuata hatua hizi mipangilio inapofunguliwa:",
        batteryOptStepsTitle: "💡 Hatua rahisi za kuwezesha:",
        batteryOptStep1: 'Gusa <b>"Betri" (Battery)</b> au "Matumizi ya betri".',
        batteryOptStep2: 'Chagua <b>"Bila kikomo" (Unrestricted)</b> au "Hakuna vikomo".',
        batteryOptDontShow: "Usionyeshe arifa hii tena",
        batteryOptAllowBg: "Ruhusu kufanya kazi chinichini",
        batteryOptLater: "Baadaye"
    },
    zh: {
        batteryOptTitle: "为确保通知的送达",
        batteryOptDesc: "手机系统可能会为了省电而停止通知。为确保您按时收到通知，请在打开设置时按照以下步骤启用权限：",
        batteryOptStepsTitle: "💡 简单的启用步骤：",
        batteryOptStep1: '点击<b>"电池" (Battery)</b>或"电池使用情况"。',
        batteryOptStep2: '选择<b>"不受限制" (Unrestricted)</b>或"无限制"。',
        batteryOptDontShow: "不再显示此通知",
        batteryOptAllowBg: "允许后台运行",
        batteryOptLater: "稍后"
    },
    ko: {
        batteryOptTitle: "알림 수신을 보장하기 위해",
        batteryOptDesc: "휴대폰 시스템은 배터리를 절약하기 위해 알림을 중지할 수 있습니다. 제때 알림을 받으려면 설정이 열릴 때 다음 단계에 따라 권한을 활성화하십시오:",
        batteryOptStepsTitle: "💡 간단한 활성화 단계:",
        batteryOptStep1: '<b>"배터리" (Battery)</b> 또는 "배터리 사용량"을 탭합니다.',
        batteryOptStep2: '<b>"제한 없음" (Unrestricted)</b> 또는 "제한 없음"을 선택합니다.',
        batteryOptDontShow: "이 알림을 다시 표시하지 않기",
        batteryOptAllowBg: "백그라운드 작업 허용",
        batteryOptLater: "나중에"
    },
    ja: {
        batteryOptTitle: "通知の確実な受信のために",
        batteryOptDesc: "電話システムはバッテリーを節約するために通知を停止する場合があります。時間通りに通知を受信するには、設定が開いたら以下の手順で権限を有効にしてください：",
        batteryOptStepsTitle: "💡 簡単な有効化手順：",
        batteryOptStep1: '<b>「バッテリー」(Battery)</b>または「バッテリー使用量」をタップします。',
        batteryOptStep2: '<b>「制限なし」(Unrestricted)</b>または「制限なし」を選択します。',
        batteryOptDontShow: "この通知を再び表示しない",
        batteryOptAllowBg: "バックグラウンドでの動作を許可",
        batteryOptLater: "後で"
    },
    bs: {
        batteryOptTitle: "Za osiguranje isporuke obavještenja",
        batteryOptDesc: "Sistemi telefona mogu zaustaviti obavještenja radi uštede baterije. Da biste bili obaviješteni na vrijeme, omogućite dozvolu prateći ove korake kada se otvore postavke:",
        batteryOptStepsTitle: "💡 Jednostavni koraci za aktivaciju:",
        batteryOptStep1: 'Dodirnite <b>"Baterija" (Battery)</b> ili "Upotreba baterije".',
        batteryOptStep2: 'Odaberite <b>"Neograničeno" (Unrestricted)</b> ili "Bez ograničenja".',
        batteryOptDontShow: "Ne prikazuj više ovo obavještenje",
        batteryOptAllowBg: "Dozvoli rad u pozadini",
        batteryOptLater: "Kasnije"
    },
    sq: {
        batteryOptTitle: "Për të siguruar marrjen e njoftimeve",
        batteryOptDesc: "Sistemet e telefonit mund t'i ndalojnë njoftimet për të kursyer baterinë. Për t'u njoftuar në kohë, ju lutemi aktivizoni lejen duke ndjekur këto hapa kur hapen cilësimet:",
        batteryOptStepsTitle: "💡 Hapa të thjeshtë aktivizimi:",
        batteryOptStep1: 'Prekni <b>"Bateria" (Battery)</b> ose "Përdorimi i baterisë".',
        batteryOptStep2: 'Zgjidhni <b>"Pa kufizime" (Unrestricted)</b> ose "Pa kufij".',
        batteryOptDontShow: "Mos e trego më këtë njoftim",
        batteryOptAllowBg: "Lejo funksionimin në sfond",
        batteryOptLater: "Më vonë"
    },
    uz: {
        batteryOptTitle: "Bildirishnomalarning yetib borishini ta'minlash uchun",
        batteryOptDesc: "Telefon tizimlari batareyani tejash uchun bildirishnomalarni to'xtatishi mumkin. Vaqtida xabardor bo'lish uchun, sozlamalar ochilganda quyidagi qadamlarni bajarib ruxsatni yoqing:",
        batteryOptStepsTitle: "💡 Oddiy faollashtirish qadamlari:",
        batteryOptStep1: '<b>"Batareya" (Battery)</b> yoki "Batareya ishlatishi"ga bosing.',
        batteryOptStep2: '<b>"Cheklovsiz" (Unrestricted)</b> yoki "Cheklovlarsiz"ni tanlang.',
        batteryOptDontShow: "Bu bildirishnomani qayta ko'rsatma",
        batteryOptAllowBg: "Fonda ishlashga ruxsat berish",
        batteryOptLater: "Keyinroq"
    },
    kk: {
        batteryOptTitle: "Хабарламалардың жеткізілуін қамтамасыз ету үшін",
        batteryOptDesc: "Телефон жүйелері батареяды үнемдеу үшін хабарламаларды тоқтатуы мүмкін. Уақытында хабарлама алу үшін, параметрлер ашылғанда келесі қадамдарды орындау арқылы рұқсатты қосыңыз:",
        batteryOptStepsTitle: "💡 Қарапайым қосу қадамдары:",
        batteryOptStep1: '<b>"Батарея" (Battery)</b> немесе "Батарея пайдалану" дегенді басыңыз.',
        batteryOptStep2: '<b>"Шектеусіз" (Unrestricted)</b> немесе "Шектеусіз" опциясын таңдаңыз.',
        batteryOptDontShow: "Бұл хабарламаны қайта көрсетпеу",
        batteryOptAllowBg: "Фондық жұмысқа рұқсат беру",
        batteryOptLater: "Кейінірек"
    },
    ku: {
        batteryOptTitle: "Ji bo misogerî gihîştina agahiyan",
        batteryOptDesc: "Pergalên têlefonê dikarin ji bo teserîfkirina pîlê agahiyan rawestînin. Ji bo ku hûn demdemê de were agahdarkirin, ji kerema xwe dema mîhengan vebûn ev gavan bişopînin û mafê çalak bikin:",
        batteryOptStepsTitle: "💡 Gavên hêsan yên çalakkirinê:",
        batteryOptStep1: 'Li <b>"Pîl" (Battery)</b> an "Bikaranîna pîlê" bitikînin.',
        batteryOptStep2: '<b>"Bêsînor" (Unrestricted)</b> an "Bê sînor" hilbijêrin.',
        batteryOptDontShow: "Vê agahiyê dûbare nîşan mede",
        batteryOptAllowBg: "Mafê xebata paşberiyê bide",
        batteryOptLater: "Paşê"
    },
    vi: {
        batteryOptTitle: "Để đảm bảo nhận thông báo",
        batteryOptDesc: "Hệ thống điện thoại có thể dừng thông báo để tiết kiệm pin. Để đảm bảo bạn được thông báo đúng giờ, vui lòng bật quyền bằng cách làm theo các bước sau khi cài đặt mở:",
        batteryOptStepsTitle: "💡 Các bước kích hoạt đơn giản:",
        batteryOptStep1: 'Nhấn vào <b>"Pin" (Battery)</b> hoặc "Sử dụng pin".',
        batteryOptStep2: 'Chọn <b>"Không giới hạn" (Unrestricted)</b> hoặc "Không giới hạn".',
        batteryOptDontShow: "Không hiển thị thông báo này nữa",
        batteryOptAllowBg: "Cho phép chạy trong nền",
        batteryOptLater: "Để sau"
    },
    tl: {
        batteryOptTitle: "Upang masiguro na makakarating ang mga abiso",
        batteryOptDesc: "Maaaring ihinto ng mga sistema ng telepono ang mga abiso para makatipid sa baterya. Upang masiguro na maabisuhan ka sa tamang oras, mangyaring i-enable ang pahintulot sa pamamagitan ng pagsunod sa mga hakbang na ito kapag nagbukas ang mga setting:",
        batteryOptStepsTitle: "💡 Mga simpleng hakbang sa pag-activate:",
        batteryOptStep1: 'I-tap ang <b>"Battery" (Baterya)</b> o "Paggamit ng baterya".',
        batteryOptStep2: 'Piliin ang <b>"Unrestricted" (Walang limitasyon)</b> o "Walang limitasyon".',
        batteryOptDontShow: "Huwag nang ipakita ang abisong ito muli",
        batteryOptAllowBg: "Payagang tumakbo sa background",
        batteryOptLater: "Mamaya"
    },
    hi: {
        batteryOptTitle: "सूचनाएँ प्राप्त करना सुनिश्चित करने के लिए",
        batteryOptDesc: "फ़ोन सिस्टम बैटरी बचाने के लिए सूचनाएँ रोक सकते हैं। समय पर सूचना पाने के लिए, कृपया सेटिंग खुलने पर निम्नलिखित चरणों का पालन करके अनुमति सक्षम करें:",
        batteryOptStepsTitle: "💡 सरल सक्रियण चरण:",
        batteryOptStep1: '<b>"बैटरी" (Battery)</b> या "बैटरी उपयोग" पर टैप करें।',
        batteryOptStep2: '<b>"अप्रतिबंधित" (Unrestricted)</b> या "कोई प्रतिबंध नहीं" चुनें।',
        batteryOptDontShow: "यह सूचना पुनः न दिखाएँ",
        batteryOptAllowBg: "पृष्ठभूमि में काम करने की अनुमति दें",
        batteryOptLater: "बाद में"
    },
    ta: {
        batteryOptTitle: "அறிவிப்புகளைப் பெறுவதை உறுதிசெய்ய",
        batteryOptDesc: "தொலைபேசி அமைப்புகள் மின்கலத்தை மிச்சப்படுத்த அறிவிப்புகளை நிறுத்தலாம். சரியான நேரத்தில் அறிவிக்கப்படுவதை உறுதிசெய்ய, அமைப்புகள் திறக்கும்போது பின்வரும் படிகளைப் பின்பற்றி அனுமதியை இயக்கவும்:",
        batteryOptStepsTitle: "💡 எளிய செயல்படுத்தல் படிகள்:",
        batteryOptStep1: '<b>"மின்கலம்" (Battery)</b> அல்லது "மின்கல பயன்பாடு"-ஐத் தட்டவும்.',
        batteryOptStep2: '<b>"கட்டுப்பாடில்லாத" (Unrestricted)</b> அல்லது "கட்டுப்பாடுகள் இல்லை"-ஐத் தேர்ந்தெடுக்கவும்.',
        batteryOptDontShow: "இந்த அறிவிப்பை மீண்டும் காட்ட வேண்டாம்",
        batteryOptAllowBg: "பின்னணியில் இயங்க அனுமதிக்கவும்",
        batteryOptLater: "பிறகு"
    },
    si: {
        batteryOptTitle: "දැනුම්දීම් ලැබීම සහතික කිරීමට",
        batteryOptDesc: "දුරකථන පද්ධති බැටරිය ඉතිරි කිරීමට දැනුම්දීම් නත් කළ හැක. නිසි වේලාවට දැනුම් දීමට ලැබීම සහතික කර ගැනීමට, සැකසුම් විවෘත වන විට පහත පියවර අනුගමනය කර අවසරය සක්‍රීය කරන්න:",
        batteryOptStepsTitle: "💡 සරල සක්‍රීය කිරීමේ පියවර:",
        batteryOptStep1: '<b>"බැටරිය" (Battery)</b> හෝ "බැටරි භාවිතය" මත තට්ටු කරන්න.',
        batteryOptStep2: '<b>"කිසිදු සීමාවක් නැති" (Unrestricted)</b> හෝ "සීමා නැති" තෝරන්න.',
        batteryOptDontShow: "මෙම දැනුම්දීම නැවත නොපෙන්වන්න",
        batteryOptAllowBg: "පසුබිමේ ක්‍රියාත්මක වීමට ඉඩ දෙන්න",
        batteryOptLater: "පසුව"
    },
    am: {
        batteryOptTitle: "ማስታወቂያዎች መድረስን ለማረጋገጥ",
        batteryOptDesc: "የስልክ ስርዓቶች ባትሪን ለመቆጠብ ማስታወቂያዎችን ሊያቆሙ ይችላሉ። በትክክለኛ ጊዜ ማስታወቂያ እንዲደርስዎት ለማድረግ፣ ቅንብሮች ሲከፈቱ የሚከተለውን ደረጃዎች ተከትለው ፍቃዱን ያንቁ፦",
        batteryOptStepsTitle: "💡 ቀላል የማንቃት ደረጃዎች፦",
        batteryOptStep1: '<b>"ባትሪ" (Battery)</b> ወይም "የባትሪ አጠቃቀም" ላይ ጠቅ ያድርጉ።',
        batteryOptStep2: '<b>"ያልተገደበ" (Unrestricted)</b> ወይም "ያለ ገደብ" ይምረጡ።',
        batteryOptDontShow: "ይህን ማስታወቂያ እንደገና አታሳይ",
        batteryOptAllowBg: "በጀርባ እንዲሰራ ፍቀድ",
        batteryOptLater: "በኋላ"
    },
    yo: {
        batteryOptTitle: "Lati rii daju pe iwifunni n de",
        batteryOptDesc: "Awọn ẹrọ foonu le da iwifunni duro lati fi batiri pamọ. Lati rii daju pe o n funni ni ibẹrẹ, jọwọ ṣiṣẹ igbanilaaya nipa tẹle awọn igbese wọnyi nigbati eto ba ṣii:",
        batteryOptStepsTitle: "💡 Awọn igbese iṣẹ rọrun:",
        batteryOptStep1: 'Tẹ <b>"Batiri" (Battery)</b> tabi "Lilo batiri".',
        batteryOptStep2: 'Yan <b>"Laarinwọn" (Unrestricted)</b> tabi "Laarinwọn".',
        batteryOptDontShow: "Ma ṣe fi iwifunni yi han mo",
        batteryOptAllowBg: "Gba laaye ṣiṣẹ ni ẹhin",
        batteryOptLater: "Leyin naa"
    },
    om: {
        batteryOptTitle: "Beeksisni gaari akka ga'uu mirkaneessuuf",
        batteryOptDesc: "Sistemafoonni bilbila baatirii qusuusuuuf beekkisa dhaabbisuu danda'u. Yeroo hammamiin beekkisaa akka argatan mirkaneessuuf, qindaa'inni yoo bane akkaataa kanatti hordofanii hayyama kakaasaa:",
        batteryOptStepsTitle: "💡 Kakaasuu qabiyyee salphaa:",
        batteryOptStep1: '<b>"Baatarii" (Battery)</b> ykn "Baatarii fayyadama" tuqi.',
        batteryOptStep2: '<b>"Daangaa hin qabne" (Unrestricted)</b> ykn "Daangaa hin qabne" fili.',
        batteryOptDontShow: "Beekkisa kana irra deebi hin agarsiisi",
        batteryOptAllowBg: "Duubatti akka hojjetu hayyami",
        batteryOptLater: "Booda"
    },
    rw: {
        batteryOptTitle: "Kugira ngo menyesha ibyifuzo bishyire ku gihe",
        batteryOptDesc: "Sisitemu za telefoni zishobora guhagarika imenyo kugira ngo zitoroshe bateri. Kugira ngo umenyeshe ku gihe, ushobore kwemera impushya ukurikiza iyi mikorere igihe iboneza rifunguye:",
        batteryOptStepsTitle: "💡 Intambwe nzira zo kwemeza:",
        batteryOptStep1: 'Kanda ku <b>"Bateri" (Battery)</b> cyangwa "Ikoreshwa rya bateri".',
        batteryOptStep2: 'Hitamo <b>"Nta bipimo" (Unrestricted)</b> cyangwa "Nta bipimo".',
        batteryOptDontShow: "Nongera nyereke iki menyesha",
        batteryOptAllowBg: "Emera gukora mu iyusomye",
        batteryOptLater: "Nyuma"
    }
};

// تكرار جميع ملفات اللغات وإضافة الترجمات
let updatedCount = 0;

Object.keys(batteryOptTranslations).forEach(langCode => {
    const filePath = path.join(i18nDir, `${langCode}.json`);
    
    if (!fs.existsSync(filePath)) {
        console.warn(`⚠️ الملف غير موجود: ${langCode}.json`);
        return;
    }

    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const data = JSON.parse(content);
        const newKeys = batteryOptTranslations[langCode];

        let changed = false;
        Object.keys(newKeys).forEach(key => {
            if (!data[key]) {
                data[key] = newKeys[key];
                changed = true;
            }
        });

        if (changed) {
            fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
            console.log(`✅ تم تحديث: ${langCode}.json`);
            updatedCount++;
        } else {
            console.log(`⏭️  لا تغييرات: ${langCode}.json (المفاتيح موجودة)`);
        }
    } catch (err) {
        console.error(`❌ خطأ في ${langCode}.json:`, err.message);
    }
});

console.log(`\n🎉 تم تحديث ${updatedCount} ملف لغة بنجاح!`);