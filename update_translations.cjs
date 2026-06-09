const fs = require('fs');
const path = require('path');

const i18nDir = path.join(__dirname, 'src', 'assets', 'i18n');

const links = `📥 Download now for free:
🔹 Google Play:
https://play.google.com/store/apps/details?id=com.mushafalmurajaa.app
🔹 Direct Link (APK):
https://apkpure.com/p/com.mushafalmurajaa.app

🌐 Official Website:
https://mushafalmurajaa.com

📺 Follow us to learn more:
Facebook: https://www.facebook.com/mushafalmurajaa
YouTube: https://youtube.com/@mushafalmurajaa`;

const translations = {
  ar: {
    shareAppTitle: "مشاركة تطبيق مصحف المراجعة",
    shareAppText: "السلام عليكم ورحمة الله وبركاته 🌸\n\nأردت مشاركة هذا التطبيق الرائع معكم:\n📖 تطبيق مصحف المراجعة 📖\nالرفيق الذكي والأفضل لكل من يسعى لحفظ وتثبيت القرآن الكريم. يتميز بأدوات تفاعلية مبتكرة لاختبار الحفظ، تقييم مستوى الآيات، ومنبهات دقيقة لمواعيد المراجعة اليومية!\n\n📥 حمل التطبيق الآن مجاناً:\n🔹 متجر جوجل بلاي:\nhttps://play.google.com/store/apps/details?id=com.mushafalmurajaa.app\n🔹 تحميل مباشر (APK):\nhttps://apkpure.com/p/com.mushafalmurajaa.app\n\n🌐 الموقع الرسمي:\nhttps://mushafalmurajaa.com\n\n📺 تابعنا لتتعلم المزيد عن ميزات التطبيق:\nفيسبوك: https://www.facebook.com/mushafalmurajaa\nيوتيوب: https://youtube.com/@mushafalmurajaa\n\n✨ شاركه مع من تحب.. فالدال على الخير كفاعله ✨"
  },
  en: {
    shareAppTitle: "Share Mushaf Al-Murajaa App",
    shareAppText: "Peace be upon you 🌸\n\nI wanted to share this wonderful app with you:\n📖 Mushaf Al-Murajaa 📖\nThe smart companion for memorizing and revising the Holy Quran. It features innovative interactive tools to test memorization, evaluate ayah strength, and set precise daily revision alarms!\n\n📥 Download now for free:\n🔹 Google Play:\nhttps://play.google.com/store/apps/details?id=com.mushafalmurajaa.app\n🔹 Direct Link (APK):\nhttps://apkpure.com/p/com.mushafalmurajaa.app\n\n🌐 Official Website:\nhttps://mushafalmurajaa.com\n\n📺 Follow us to learn more:\nFacebook: https://www.facebook.com/mushafalmurajaa\nYouTube: https://youtube.com/@mushafalmurajaa\n\n✨ Share it with those you love... The one who guides to good is like the one who does it ✨"
  },
  fr: {
    shareAppTitle: "Partager l'application Mushaf Al-Murajaa",
    shareAppText: "Que la paix soit sur vous 🌸\n\nJe voulais partager cette merveilleuse application avec vous :\n📖 Mushaf Al-Murajaa 📖\nLe compagnon intelligent pour mémoriser et réviser le Saint Coran. Il propose des outils interactifs innovants pour tester la mémorisation, évaluer la force des versets et définir des alarmes de révision quotidiennes précises !\n\n📥 Téléchargez maintenant gratuitement :\n🔹 Google Play :\nhttps://play.google.com/store/apps/details?id=com.mushafalmurajaa.app\n🔹 Lien direct (APK) :\nhttps://apkpure.com/p/com.mushafalmurajaa.app\n\n🌐 Site officiel :\nhttps://mushafalmurajaa.com\n\n📺 Suivez-nous pour en savoir plus :\nFacebook : https://www.facebook.com/mushafalmurajaa\nYouTube : https://youtube.com/@mushafalmurajaa\n\n✨ Partagez-la avec ceux que vous aimez... Celui qui guide vers le bien est comme celui qui l'accomplit ✨"
  },
  es: {
    shareAppTitle: "Compartir la aplicación Mushaf Al-Murajaa",
    shareAppText: "La paz sea con vosotros 🌸\n\nQuería compartir esta maravillosa aplicación con vosotros:\n📖 Mushaf Al-Murajaa 📖\nEl compañero inteligente para memorizar y repasar el Sagrado Corán. Cuenta con herramientas interactivas innovadoras para evaluar la memorización, valorar la fuerza de las aleyas y establecer alarmas de repaso diario precisas.\n\n📥 Descárgala ahora gratis:\n🔹 Google Play:\nhttps://play.google.com/store/apps/details?id=com.mushafalmurajaa.app\n🔹 Enlace directo (APK):\nhttps://apkpure.com/p/com.mushafalmurajaa.app\n\n🌐 Sitio web oficial:\nhttps://mushafalmurajaa.com\n\n📺 Síguenos para saber más:\nFacebook: https://www.facebook.com/mushafalmurajaa\nYouTube: https://youtube.com/@mushafalmurajaa\n\n✨ Compártelo con tus seres queridos... Quien guía hacia el bien es como quien lo hace ✨"
  },
  ur: {
    shareAppTitle: "مصحف المراجعہ ایپ شیئر کریں",
    shareAppText: "السلام علیکم 🌸\n\nمیں آپ کے ساتھ یہ شاندار ایپ شیئر کرنا چاہتا تھا:\n📖 مصحف المراجعہ 📖\nقرآن پاک حفظ کرنے اور دہرانے کے لیے ایک بہترین ساتھی۔ اس میں حفظ کو جانچنے، آیات کی پختگی کا اندازہ لگانے اور روزانہ کی دہرائی کے لیے الارم سیٹ کرنے کے جدید ٹولز شامل ہیں!\n\n📥 ابھی مفت ڈاؤن لوڈ کریں:\n🔹 گوگل پلے:\nhttps://play.google.com/store/apps/details?id=com.mushafalmurajaa.app\n🔹 براہ راست لنک (APK):\nhttps://apkpure.com/p/com.mushafalmurajaa.app\n\n🌐 آفیشل ویب سائٹ:\nhttps://mushafalmurajaa.com\n\n📺 مزید جاننے کے لیے ہمیں فالو کریں:\nفیس بک: https://www.facebook.com/mushafalmurajaa\nیوٹیوب: https://youtube.com/@mushafalmurajaa\n\n✨ اسے اپنے پیاروں کے ساتھ شیئر کریں... نیکی کا راستہ دکھانے والا نیکی کرنے والے کی طرح ہے ✨"
  },
  id: {
    shareAppTitle: "Bagikan Aplikasi Mushaf Al-Murajaa",
    shareAppText: "Assalamu'alaikum 🌸\n\nSaya ingin membagikan aplikasi luar biasa ini kepada Anda:\n📖 Mushaf Al-Murajaa 📖\nTeman cerdas untuk menghafal dan mengulang hafalan Al-Qur'an. Dilengkapi dengan fitur interaktif inovatif untuk menguji hafalan, mengevaluasi kekuatan ayat, dan mengatur alarm muraja'ah harian yang presisi!\n\n📥 Unduh sekarang secara gratis:\n🔹 Google Play:\nhttps://play.google.com/store/apps/details?id=com.mushafalmurajaa.app\n🔹 Tautan Langsung (APK):\nhttps://apkpure.com/p/com.mushafalmurajaa.app\n\n🌐 Situs Resmi:\nhttps://mushafalmurajaa.com\n\n📺 Ikuti kami untuk mengetahui lebih lanjut:\nFacebook: https://www.facebook.com/mushafalmurajaa\nYouTube: https://youtube.com/@mushafalmurajaa\n\n✨ Bagikan dengan orang-orang yang Anda cintai... Barangsiapa yang menunjuki kepada kebaikan maka dia akan mendapatkan pahala seperti pahala orang yang mengerjakannya ✨"
  },
  tr: {
    shareAppTitle: "Mushaf Al-Murajaa Uygulamasını Paylaş",
    shareAppText: "Selamun Aleyküm 🌸\n\nSizinle bu harika uygulamayı paylaşmak istedim:\n📖 Mushaf Al-Murajaa 📖\nKur'an-ı Kerim'i ezberlemek ve tekrar etmek için akıllı yol arkadaşınız. Ezberi test etmek, ayetlerin seviyesini değerlendirmek ve günlük tekrarlar için hassas alarmlar kurmak üzere yenilikçi araçlar içerir!\n\n📥 Şimdi ücretsiz indirin:\n🔹 Google Play:\nhttps://play.google.com/store/apps/details?id=com.mushafalmurajaa.app\n🔹 Doğrudan Bağlantı (APK):\nhttps://apkpure.com/p/com.mushafalmurajaa.app\n\n🌐 Resmi Web Sitesi:\nhttps://mushafalmurajaa.com\n\n📺 Daha fazlası için bizi takip edin:\nFacebook: https://www.facebook.com/mushafalmurajaa\nYouTube: https://youtube.com/@mushafalmurajaa\n\n✨ Sevdiklerinizle paylaşın... Hayra vesile olan, hayrı yapan gibidir ✨"
  },
  de: {
    shareAppTitle: "Mushaf Al-Murajaa App teilen",
    shareAppText: "Friede sei mit euch 🌸\n\nIch wollte diese wunderbare App mit euch teilen:\n📖 Mushaf Al-Murajaa 📖\nDer intelligente Begleiter für das Auswendiglernen und Wiederholen des Heiligen Korans. Es bietet innovative interaktive Tools, um das Auswendiglernen zu testen, die Stärke der Verse zu bewerten und präzise tägliche Wiederholungsalarme einzustellen!\n\n📥 Jetzt kostenlos herunterladen:\n🔹 Google Play:\nhttps://play.google.com/store/apps/details?id=com.mushafalmurajaa.app\n🔹 Direkter Link (APK):\nhttps://apkpure.com/p/com.mushafalmurajaa.app\n\n🌐 Offizielle Website:\nhttps://mushafalmurajaa.com\n\n📺 Folge uns, um mehr zu erfahren:\nFacebook: https://www.facebook.com/mushafalmurajaa\nYouTube: https://youtube.com/@mushafalmurajaa\n\n✨ Teile es mit deinen Liebsten... Wer zum Guten führt, ist wie derjenige, der es tut ✨"
  },
  ru: {
    shareAppTitle: "Поделиться приложением Mushaf Al-Murajaa",
    shareAppText: "Мир вам 🌸\n\nХочу поделиться с вами этим замечательным приложением:\n📖 Mushaf Al-Murajaa 📖\nУмный помощник для заучивания и повторения Священного Корана. В нем есть инновационные интерактивные инструменты для проверки заучивания, оценки уровня стихов и настройки точных ежедневных будильников для повторения!\n\n📥 Скачайте бесплатно прямо сейчас:\n🔹 Google Play:\nhttps://play.google.com/store/apps/details?id=com.mushafalmurajaa.app\n🔹 Прямая ссылка (APK):\nhttps://apkpure.com/p/com.mushafalmurajaa.app\n\n🌐 Официальный сайт:\nhttps://mushafalmurajaa.com\n\n📺 Подписывайтесь на нас, чтобы узнать больше:\nFacebook: https://www.facebook.com/mushafalmurajaa\nYouTube: https://youtube.com/@mushafalmurajaa\n\n✨ Поделитесь с теми, кого любите... Указавший на благое подобен совершившему его ✨"
  },
  ms: {
    shareAppTitle: "Kongsi Aplikasi Mushaf Al-Murajaa",
    shareAppText: "Assalamualaikum 🌸\n\nSaya ingin berkongsi aplikasi hebat ini dengan anda:\n📖 Mushaf Al-Murajaa 📖\nRakan pintar untuk menghafal dan mengulang kaji Al-Quran. Ia mempunyai alat interaktif yang inovatif untuk menguji hafalan, menilai kekuatan ayat, dan menetapkan penggera ulang kaji harian yang tepat!\n\n📥 Muat turun sekarang secara percuma:\n🔹 Google Play:\nhttps://play.google.com/store/apps/details?id=com.mushafalmurajaa.app\n🔹 Pautan Langsung (APK):\nhttps://apkpure.com/p/com.mushafalmurajaa.app\n\n🌐 Laman Web Rasmi:\nhttps://mushafalmurajaa.com\n\n📺 Ikuti kami untuk ketahui lebih lanjut:\nFacebook: https://www.facebook.com/mushafalmurajaa\nYouTube: https://youtube.com/@mushafalmurajaa\n\n✨ Kongsikan dengan mereka yang anda sayangi... Orang yang menunjukkan ke arah kebaikan adalah seperti orang yang melakukannya ✨"
  },
  fa: {
    shareAppTitle: "اشتراک گذاری اپلیکیشن مصحف المراجعة",
    shareAppText: "سلام علیکم 🌸\n\nمی‌خواستم این اپلیکیشن فوق‌العاده را با شما به اشتراک بگذارم:\n📖 اپلیکیشن مصحف المراجعة 📖\nهمراهی هوشمند برای حفظ و مرور قرآن کریم. دارای ابزارهای تعاملی نوآورانه برای آزمایش حفظ، ارزیابی قدرت آیات، و تنظیم آلارم‌های دقیق برای مرور روزانه!\n\n📥 هم‌اکنون رایگان دانلود کنید:\n🔹 گوگل پلی:\nhttps://play.google.com/store/apps/details?id=com.mushafalmurajaa.app\n🔹 لینک مستقیم (APK):\nhttps://apkpure.com/p/com.mushafalmurajaa.app\n\n🌐 وب‌سایت رسمی:\nhttps://mushafalmurajaa.com\n\n📺 برای کسب اطلاعات بیشتر ما را دنبال کنید:\nفیس‌بوک: https://www.facebook.com/mushafalmurajaa\nیوتیوب: https://youtube.com/@mushafalmurajaa\n\n✨ با عزیزان خود به اشتراک بگذارید... کسی که به کار نیکی راهنمایی کند، مانند انجام‌دهنده آن است ✨"
  },
  hi: {
    shareAppTitle: "मुशफ अल-मुराजा ऐप शेयर करें",
    shareAppText: "अस्सलामु अलैकुम 🌸\n\nमैं आपके साथ यह शानदार ऐप शेयर करना चाहता था:\n📖 मुशफ अल-मुराजा 📖\nपवित्र कुरान को याद करने और दोहराने के लिए स्मार्ट साथी। इसमें याददाश्त का परीक्षण करने, आयतों की मजबूती का मूल्यांकन करने और सटीक दैनिक दोहराव अलार्म सेट करने के लिए नवीन इंटरैक्टिव उपकरण हैं!\n\n📥 अभी मुफ्त में डाउनलोड करें:\n🔹 Google Play:\nhttps://play.google.com/store/apps/details?id=com.mushafalmurajaa.app\n🔹 सीधा लिंक (APK):\nhttps://apkpure.com/p/com.mushafalmurajaa.app\n\n🌐 आधिकारिक वेबसाइट:\nhttps://mushafalmurajaa.com\n\n📺 अधिक जानने के लिए हमें फॉलो करें:\nFacebook: https://www.facebook.com/mushafalmurajaa\nYouTube: https://youtube.com/@mushafalmurajaa\n\n✨ इसे अपने प्रियजनों के साथ साझा करें... जो व्यक्ति भलाई का रास्ता दिखाता है वह भलाई करने वाले के समान है ✨"
  },
  bn: {
    shareAppTitle: "মুশহাফ আল-মুরাজা অ্যাপটি শেয়ার করুন",
    shareAppText: "আসসালামু আলাইকুম 🌸\n\nআমি আপনাদের সাথে এই চমৎকার অ্যাপটি শেয়ার করতে চাই:\n📖 মুশহাফ আল-মুরাজা 📖\nপবিত্র কুরআন মুখস্থ এবং রিভিশন করার জন্য একটি স্মার্ট সঙ্গী। এতে মুখস্থ পরীক্ষা করার, আয়াতের শক্তি মূল্যায়ন করার এবং নিখুঁত দৈনিক রিভিশন অ্যালার্ম সেট করার জন্য উদ্ভাবনী ইন্টারেক্টিভ টুল রয়েছে!\n\n📥 এখনই বিনামূল্যে ডাউনলোড করুন:\n🔹 গুগল প্লে:\nhttps://play.google.com/store/apps/details?id=com.mushafalmurajaa.app\n🔹 সরাসরি লিঙ্ক (APK):\nhttps://apkpure.com/p/com.mushafalmurajaa.app\n\n🌐 অফিসিয়াল ওয়েবসাইট:\nhttps://mushafalmurajaa.com\n\n📺 আরও জানতে আমাদের অনুসরণ করুন:\nফেসবুক: https://www.facebook.com/mushafalmurajaa\nইউটিউব: https://youtube.com/@mushafalmurajaa\n\n✨ আপনার প্রিয়জনদের সাথে শেয়ার করুন... যে ব্যক্তি ভালো কাজের পথ দেখায় সে ভালো কাজ করার মতোই পুণ্য পায় ✨"
  },
  ja: {
    shareAppTitle: "Mushaf Al-Murajaaアプリを共有",
    shareAppText: "平安がありますように 🌸\n\nこの素晴らしいアプリをあなたと共有したいと思います:\n📖 Mushaf Al-Murajaa 📖\n聖クルアーンの暗記と復習のためのスマートなパートナー。暗記のテスト、アーヤの定着度の評価、正確な毎日の復習アラームの設定など、革新的なインタラクティブ機能を備えています！\n\n📥 今すぐ無料でダウンロード:\n🔹 Google Play:\nhttps://play.google.com/store/apps/details?id=com.mushafalmurajaa.app\n🔹 直接リンク (APK):\nhttps://apkpure.com/p/com.mushafalmurajaa.app\n\n🌐 公式ウェブサイト:\nhttps://mushafalmurajaa.com\n\n📺 詳細についてはフォローしてください:\nFacebook: https://www.facebook.com/mushafalmurajaa\nYouTube: https://youtube.com/@mushafalmurajaa\n\n✨ 愛する人と共有してください... 良いことに導く者は、それを行う者と同じです ✨"
  },
  ko: {
    shareAppTitle: "Mushaf Al-Murajaa 앱 공유",
    shareAppText: "평화가 함께하길 🌸\n\n이 훌륭한 앱을 여러분과 공유하고 싶습니다:\n📖 Mushaf Al-Murajaa 📖\n신성한 꾸란 암기와 복습을 위한 스마트한 동반자. 암기 테스트, 구절 암기 상태 평가, 정확한 일일 복습 알람 설정을 위한 혁신적인 대화형 도구를 갖추고 있습니다!\n\n📥 지금 무료로 다운로드하세요:\n🔹 Google Play:\nhttps://play.google.com/store/apps/details?id=com.mushafalmurajaa.app\n🔹 직접 링크 (APK):\nhttps://apkpure.com/p/com.mushafalmurajaa.app\n\n🌐 공식 웹사이트:\nhttps://mushafalmurajaa.com\n\n📺 더 많은 정보를 원하시면 팔로우하세요:\nFacebook: https://www.facebook.com/mushafalmurajaa\nYouTube: https://youtube.com/@mushafalmurajaa\n\n✨ 사랑하는 사람들과 공유하세요... 좋은 일로 인도하는 사람은 그 일을 행하는 사람과 같습니다 ✨"
  },
  zh: {
    shareAppTitle: "分享 Mushaf Al-Murajaa 应用程序",
    shareAppText: "愿你平安 🌸\n\n我想与你分享这个很棒的应用程序：\n📖 Mushaf Al-Murajaa 📖\n背诵和复习《古兰经》的智能伴侣。它具有创新的互动工具来测试背诵、评估经文巩固程度并设置精确的每日复习提醒！\n\n📥 立即免费下载：\n🔹 Google Play：\nhttps://play.google.com/store/apps/details?id=com.mushafalmurajaa.app\n🔹 直接链接 (APK)：\nhttps://apkpure.com/p/com.mushafalmurajaa.app\n\n🌐 官方网站：\nhttps://mushafalmurajaa.com\n\n📺 关注我们了解更多：\nFacebook：https://www.facebook.com/mushafalmurajaa\nYouTube：https://youtube.com/@mushafalmurajaa\n\n✨ 与你爱的人分享... 引导行善的人就像行善的人一样 ✨"
  },
  vi: {
    shareAppTitle: "Chia sẻ ứng dụng Mushaf Al-Murajaa",
    shareAppText: "Bình an cho bạn 🌸\n\nTôi muốn chia sẻ ứng dụng tuyệt vời này với bạn:\n📖 Mushaf Al-Murajaa 📖\nNgười bạn đồng hành thông minh để ghi nhớ và ôn tập Kinh Qur'an. Nó có các công cụ tương tác sáng tạo để kiểm tra khả năng ghi nhớ, đánh giá mức độ thuộc câu kinh và đặt báo thức ôn tập hàng ngày chính xác!\n\n📥 Tải xuống miễn phí ngay:\n🔹 Google Play:\nhttps://play.google.com/store/apps/details?id=com.mushafalmurajaa.app\n🔹 Liên kết trực tiếp (APK):\nhttps://apkpure.com/p/com.mushafalmurajaa.app\n\n🌐 Trang web chính thức:\nhttps://mushafalmurajaa.com\n\n📺 Theo dõi chúng tôi để biết thêm:\nFacebook: https://www.facebook.com/mushafalmurajaa\nYouTube: https://youtube.com/@mushafalmurajaa\n\n✨ Hãy chia sẻ nó với những người bạn yêu thương... Người hướng dẫn đến điều tốt đẹp cũng giống như người làm điều đó ✨"
  },
  tl: {
    shareAppTitle: "Ibahagi ang Mushaf Al-Murajaa App",
    shareAppText: "Sumainyo nawa ang kapayapaan 🌸\n\nGusto kong ibahagi sa iyo ang napakagandang app na ito:\n📖 Mushaf Al-Murajaa 📖\nAng matalinong kasama para sa pagsasaulo at pagbabalik-aral ng Banal na Quran. Nagtatampok ito ng mga makabagong interactive tool upang subukan ang pagsasaulo, suriin ang lakas ng ayah, at mag-set ng tumpak na pang-araw-araw na mga alarm sa pagbabalik-aral!\n\n📥 I-download na ng libre:\n🔹 Google Play:\nhttps://play.google.com/store/apps/details?id=com.mushafalmurajaa.app\n🔹 Direktang Link (APK):\nhttps://apkpure.com/p/com.mushafalmurajaa.app\n\n🌐 Opisyal na Website:\nhttps://mushafalmurajaa.com\n\n📺 Sundan kami upang matuto pa:\nFacebook: https://www.facebook.com/mushafalmurajaa\nYouTube: https://youtube.com/@mushafalmurajaa\n\n✨ Ibahagi ito sa iyong mga mahal sa buhay... Ang taong gumagabay patungo sa kabutihan ay tulad ng taong gumagawa nito ✨"
  },
  sw: {
    shareAppTitle: "Shiriki App ya Mushaf Al-Murajaa",
    shareAppText: "Amani iwe juu yenu 🌸\n\nNilitaka kushiriki programu hii nzuri nawe:\n📖 Mushaf Al-Murajaa 📖\nMsaidizi mahiri wa kuhifadhi na kurudia Qur'ani Tukufu. Ina zana bunifu shirikishi za kupima hifdhi, kutathmini uwezo wa aya, na kuweka kengele sahihi za marudio ya kila siku!\n\n📥 Pakua sasa bila malipo:\n🔹 Google Play:\nhttps://play.google.com/store/apps/details?id=com.mushafalmurajaa.app\n🔹 Kiungo cha Moja kwa Moja (APK):\nhttps://apkpure.com/p/com.mushafalmurajaa.app\n\n🌐 Tovuti Rasmi:\nhttps://mushafalmurajaa.com\n\n📺 Tufuatilie kujifunza zaidi:\nFacebook: https://www.facebook.com/mushafalmurajaa\nYouTube: https://youtube.com/@mushafalmurajaa\n\n✨ Shiriki na wale unaowapenda... Yule anayeongoza kwenye wema ni kama yule anayeufanya ✨"
  },
  uz: {
    shareAppTitle: "Mushaf Al-Murajaa ilovasini ulashing",
    shareAppText: "Assalomu alaykum 🌸\n\nMen siz bilan ushbu ajoyib ilovani ulashmoqchi edim:\n📖 Mushaf Al-Murajaa 📖\nQur'oni Karimni yodlash va takrorlash uchun aqlli yordamchi. U yodlashni sinab ko'rish, oyatlarning yodlanish darajasini baholash va aniq kunlik takrorlash signallarini o'rnatish uchun innovatsion interaktiv vositalarga ega!\n\n📥 Hozir bepul yuklab oling:\n🔹 Google Play:\nhttps://play.google.com/store/apps/details?id=com.mushafalmurajaa.app\n🔹 To'g'ridan-to'g'ri havola (APK):\nhttps://apkpure.com/p/com.mushafalmurajaa.app\n\n🌐 Rasmiy veb-sayt:\nhttps://mushafalmurajaa.com\n\n📺 Ko'proq ma'lumot olish uchun bizni kuzatib boring:\nFacebook: https://www.facebook.com/mushafalmurajaa\nYouTube: https://youtube.com/@mushafalmurajaa\n\n✨ Uni yaqinlaringiz bilan baham ko'ring... Yaxshilikka boshlagan kishi uni qilgan kabi savob oladi ✨"
  },
  ha: {
    shareAppTitle: "Raba Mushaf Al-Murajaa App",
    shareAppText: "Assalamu alaikum 🌸\n\nIna so in raba wannan kyakkyawan application da ku:\n📖 Mushaf Al-Murajaa 📖\nAbokin wayo don haddace da bitar Alkur'ani Mai Girma. Yana da kayan aiki masu amfani don gwada haddaci, kimanta ƙarfin ayoyi, da saita ƙararrawa don bita na yau da kullun!\n\n📥 Sauke shi yanzu kyauta:\n🔹 Google Play:\nhttps://play.google.com/store/apps/details?id=com.mushafalmurajaa.app\n🔹 Kai Tsaye (APK):\nhttps://apkpure.com/p/com.mushafalmurajaa.app\n\n🌐 Shafin Intanet Na Musamman:\nhttps://mushafalmurajaa.com\n\n📺 Bi mu don ƙarin bayani:\nFacebook: https://www.facebook.com/mushafalmurajaa\nYouTube: https://youtube.com/@mushafalmurajaa\n\n✨ Raba shi da waɗanda kuke so... Wanda ya nuna hanya zuwa ga alheri yana kama da wanda ya aikata shi ✨"
  },
  yo: {
    shareAppTitle: "Pín Ohun èlò Mushaf Al-Murajaa",
    shareAppText: "Alaafia ni fun yin 🌸\n\nMo fẹ pín ohun èlò iyanu yii pẹlu rẹ:\n📖 Mushaf Al-Murajaa 📖\nAlabaṣiṣẹpọ ọlọgbọn fun hihaz ati atunyẹwo Al-Qur'an Mimọ. O ni awọn irinṣẹ ibaraenisọrọ ti o gbọn lati ṣe idanwo hihaz, ṣe iṣiro agbara awọn ẹsẹ, ati ṣeto itaniji atunyẹwo ojoojumọ ti o peye!\n\n📥 Ṣe igbasilẹ rẹ ni bayi fun ọfẹ:\n🔹 Google Play:\nhttps://play.google.com/store/apps/details?id=com.mushafalmurajaa.app\n🔹 Ọna asopọ Taara (APK):\nhttps://apkpure.com/p/com.mushafalmurajaa.app\n\n🌐 Oju opo wẹẹbu osise:\nhttps://mushafalmurajaa.com\n\n📺 Tẹle wa lati ni imọ siwaju sii:\nFacebook: https://www.facebook.com/mushafalmurajaa\nYouTube: https://youtube.com/@mushafalmurajaa\n\n✨ Pín rẹ pẹlu awọn ti o fẹran... Ẹni ti o ba ṣe itọsọna si rere dabi ẹni ti o ṣe e ✨"
  },
  am: {
    shareAppTitle: "Mushaf Al-Murajaa App አጋራ",
    shareAppText: "ሰላም በእናንተ ላይ ይሁን 🌸\n\nይህን ድንቅ መተግበሪያ ከእናንተ ጋር ላካፍላችሁ ፈለግኩ፡\n📖 Mushaf Al-Murajaa 📖\nቅዱስ ቁርኣንን ለማጥናት እና ለመከለስ ብልህ ጓደኛ። ማጥናትን ለመፈተሽ፣ የአያቶችን ጥንካሬ ለመገምገም እና ትክክለኛ የዕለት ተዕለት የክለሳ ማሳሰቢያዎችን ለማዘጋጀት ፈጠራ ያላቸው መስተጋብራዊ መሳሪያዎችን ይዟል!\n\n📥 አሁኑኑ በነፃ ያውርዱ፡\n🔹 Google Play:\nhttps://play.google.com/store/apps/details?id=com.mushafalmurajaa.app\n🔹 ቀጥታ ሊንክ (APK):\nhttps://apkpure.com/p/com.mushafalmurajaa.app\n\n🌐 ይፋዊ ድር ጣቢያ:\nhttps://mushafalmurajaa.com\n\n📺 ለበለጠ መረጃ ይከታተሉን፡\nFacebook: https://www.facebook.com/mushafalmurajaa\nYouTube: https://youtube.com/@mushafalmurajaa\n\n✨ ለምትወዷቸው ያጋሩት... ወደ መልካም የሚያመላክት እንደሰራው ነው ✨"
  },
  bs: {
    shareAppTitle: "Podijeli aplikaciju Mushaf Al-Murajaa",
    shareAppText: "Neka je mir s vama 🌸\n\nŽelio sam s vama podijeliti ovu divnu aplikaciju:\n📖 Mushaf Al-Murajaa 📖\nPametni saputnik za učenje i ponavljanje Časnog Kur'ana. Sadrži inovativne interaktivne alate za testiranje pamćenja, procjenu snage ajeta i postavljanje preciznih dnevnih alarma za ponavljanje!\n\n📥 Preuzmite sada besplatno:\n🔹 Google Play:\nhttps://play.google.com/store/apps/details?id=com.mushafalmurajaa.app\n🔹 Direktni link (APK):\nhttps://apkpure.com/p/com.mushafalmurajaa.app\n\n🌐 Službena web stranica:\nhttps://mushafalmurajaa.com\n\n📺 Pratite nas da saznate više:\nFacebook: https://www.facebook.com/mushafalmurajaa\nYouTube: https://youtube.com/@mushafalmurajaa\n\n✨ Podijelite je s onima koje volite... Onaj koji uputi na dobro je kao i onaj koji ga učini ✨"
  },
  sq: {
    shareAppTitle: "Ndaj aplikacionin Mushaf Al-Murajaa",
    shareAppText: "Paqja qoftë mbi ju 🌸\n\nDoja të ndaja këtë aplikacion të mrekullueshëm me ju:\n📖 Mushaf Al-Murajaa 📖\nShoqëruesi inteligjent për memorizimin dhe rishikimin e Kuranit Famëlartë. Përmban mjete inovative interaktive për të testuar memorizimin, për të vlerësuar forcën e ajeteve dhe për të vendosur alarme të sakta të rishikimit ditor!\n\n📥 Shkarko tani falas:\n🔹 Google Play:\nhttps://play.google.com/store/apps/details?id=com.mushafalmurajaa.app\n🔹 Lidhja Direkte (APK):\nhttps://apkpure.com/p/com.mushafalmurajaa.app\n\n🌐 Uebfaqja Zyrtare:\nhttps://mushafalmurajaa.com\n\n📺 Na ndiqni për të mësuar më shumë:\nFacebook: https://www.facebook.com/mushafalmurajaa\nYouTube: https://youtube.com/@mushafalmurajaa\n\n✨ Ndajeni atë me ata që doni... Ai që udhëzon drejt së mirës është sikurse ai që e vepron atë ✨"
  },
  kk: {
    shareAppTitle: "Mushaf Al-Murajaa қосымшасымен бөлісу",
    shareAppText: "Ассалаумағалейкум 🌸\n\nМен сіздермен осы керемет қосымшамен бөліскім келді:\n📖 Mushaf Al-Murajaa 📖\nҚасиетті Құранды жаттау және қайталау үшін сіздің ақылды серігіңіз. Ол жаттауды тексеруге, аяттардың деңгейін бағалауға және күнделікті қайталау үшін нақты оятқыштарды орнатуға арналған инновациялық интерактивті құралдармен жабдықталған!\n\n📥 Қазір тегін жүктеп алыңыз:\n🔹 Google Play:\nhttps://play.google.com/store/apps/details?id=com.mushafalmurajaa.app\n🔹 Тікелей сілтеме (APK):\nhttps://apkpure.com/p/com.mushafalmurajaa.app\n\n🌐 Ресми веб-сайт:\nhttps://mushafalmurajaa.com\n\n📺 Көбірек білу үшін бізге жазылыңыз:\nFacebook: https://www.facebook.com/mushafalmurajaa\nYouTube: https://youtube.com/@mushafalmurajaa\n\n✨ Оны жақын адамдарыңызбен бөлісіңіз... Жақсылыққа бастаушы оны жасаушымен тең ✨"
  },
  ku: {
    shareAppTitle: "Bernameya Mushaf Al-Murajaa Parve Bikin",
    shareAppText: "Silav li we bin 🌸\n\nMin xwest vê bernameya hêja bi we re parve bikim:\n📖 Mushaf Al-Murajaa 📖\nHevalrêyê zîrek ji bo jiberkirin û dûbarekirina Qur'ana Pîroz. Tê de amûrên înteraktîf ên nûjen hene ji bo ceribandina jiberkirinê, nirxandina asta ayetan, û sazkirina alarmên rojane yên rast!\n\n📥 Naha belaş dakêşin:\n🔹 Google Play:\nhttps://play.google.com/store/apps/details?id=com.mushafalmurajaa.app\n🔹 Zencîreya Rasteqîn (APK):\nhttps://apkpure.com/p/com.mushafalmurajaa.app\n\n🌐 Malpera Fermî:\nhttps://mushafalmurajaa.com\n\n📺 Ji bo fêrbûna bêtir me bişopînin:\nFacebook: https://www.facebook.com/mushafalmurajaa\nYouTube: https://youtube.com/@mushafalmurajaa\n\n✨ Bi hezkiriyên xwe re parve bikin... Ewê ku rêberiya başiyê dike wek yê ku wê dike ye ✨"
  },
  rw: {
    shareAppTitle: "Sangiza Porogaramu ya Mushaf Al-Murajaa",
    shareAppText: "Amahoro abe kuri mwe 🌸\n\nNashakaga gusangiza iyi porogaramu nziza nawe:\n📖 Mushaf Al-Murajaa 📖\nInshuti y'ubwenge mu gufata mu mutwe no gusubiramo Korowani Ntagatifu. Ifite ibikoresho by'ikoranabuhanga bishya byo kugerageza gufata mu mutwe, gusuzuma imbaraga z'imirongo, no gushyiraho inzogera z'isuzuma rya buri munsi zizewe!\n\n📥 Manura nonaha ku buntu:\n🔹 Google Play:\nhttps://play.google.com/store/apps/details?id=com.mushafalmurajaa.app\n🔹 Link Itaziguye (APK):\nhttps://apkpure.com/p/com.mushafalmurajaa.app\n\n🌐 Urubuga rwemewe:\nhttps://mushafalmurajaa.com\n\n📺 Dukurikire kugira ngo umenye byinshi:\nFacebook: https://www.facebook.com/mushafalmurajaa\nYouTube: https://youtube.com/@mushafalmurajaa\n\n✨ Sangiza abo ukunda... Uyobora abandi ku byiza amera nk'ubikora ✨"
  },
  si: {
    shareAppTitle: "Mushaf Al-Murajaa යෙදුම බෙදා ගන්න",
    shareAppText: "ඔබට සාමය ලැබේවා 🌸\n\nමෙම අපූරු යෙදුම ඔබ සමඟ බෙදා ගැනීමට මට අවශ්‍ය විය:\n📖 Mushaf Al-Murajaa 📖\nශුද්ධ වූ අල් කුර්ආනය කටපාඩම් කිරීම සහ සංශෝධනය කිරීම සඳහා ස්මාර්ට් සහකරු. කටපාඩම් කිරීම පරීක්ෂා කිරීම, වාක්‍යවල ශක්තිය තක්සේරු කිරීම සහ නිවැරදි දෛනික සංශෝධන එලාම් සැකසීම සඳහා එය නව්‍ය අන්තර්ක්‍රියාකාරී මෙවලම් වලින් සමන්විත වේ!\n\n📥 දැන් නොමිලේ බාගන්න:\n🔹 Google Play:\nhttps://play.google.com/store/apps/details?id=com.mushafalmurajaa.app\n🔹 සෘජු සබැඳිය (APK):\nhttps://apkpure.com/p/com.mushafalmurajaa.app\n\n🌐 නිල වෙබ් අඩවිය:\nhttps://mushafalmurajaa.com\n\n📺 වැඩිදුර දැන ගැනීමට අපව අනුගමනය කරන්න:\nFacebook: https://www.facebook.com/mushafalmurajaa\nYouTube: https://youtube.com/@mushafalmurajaa\n\n✨ ඔබ ආදරය කරන අය සමඟ එය බෙදා ගන්න... යහපතට මඟ පෙන්වන්නා එය කරන්නා හා සමානය ✨"
  },
  ta: {
    shareAppTitle: "Mushaf Al-Murajaa செயலியைப் பகிரவும்",
    shareAppText: "உங்கள் மீது சாந்தி உண்டாகட்டும் 🌸\n\nஇந்த அருமையான செயலியை உங்களுடன் பகிர்ந்து கொள்ள விரும்புகிறேன்:\n📖 Mushaf Al-Murajaa 📖\nபுனித குர்ஆனை மனப்பாடம் செய்வதற்கும் திருத்துவதற்கும் ஸ்மார்ட் துணை. மனப்பாடத்தை சோதிக்க, வசனத்தின் வலிமையை மதிப்பிட மற்றும் துல்லியமான தினசரி திருத்த அலாரங்களை அமைக்க புதுமையான ஊடாடும் கருவிகளை இது கொண்டுள்ளது!\n\n📥 இப்போது இலவசமாக பதிவிறக்கவும்:\n🔹 Google Play:\nhttps://play.google.com/store/apps/details?id=com.mushafalmurajaa.app\n🔹 நேரடி இணைப்பு (APK):\nhttps://apkpure.com/p/com.mushafalmurajaa.app\n\n🌐 அதிகாரப்பூர்வ இணையதளம்:\nhttps://mushafalmurajaa.com\n\n📺 மேலும் அறிய எங்களைப் பின்தொடரவும்:\nFacebook: https://www.facebook.com/mushafalmurajaa\nYouTube: https://youtube.com/@mushafalmurajaa\n\n✨ நீங்கள் விரும்புபவர்களுடன் பகிரவும்... நன்மையை நோக்கி வழிகாட்டுபவர் அதை செய்பவரைப் போன்றவர் ✨"
  },
  om: {
    shareAppTitle: "Appilikeeshinii Mushaf Al-Murajaa Qoodi",
    shareAppText: "Nageenyi isiniif haa ta'u 🌸\n\nAppilikeeshinii ajaa'ibaa kana isin wajjin qooduu barbaadeera:\n📖 Mushaf Al-Murajaa 📖\nHiriyaa qaxalee Qur'aana Kabajamaa haffazuu fi irra deebi'uuf gargaaru. Meeshaalee wal-qunnamtii haaraa qaba kan haffazaa yaaluuf, cimina aayata madaaluu fi alaarmaa irra deebii guyyaa guyyaa sirriitti saaguuf gargaaran!\n\n📥 Ammuma bilisaan buufadhaa:\n🔹 Google Play:\nhttps://play.google.com/store/apps/details?id=com.mushafalmurajaa.app\n🔹 Kallattiin (APK):\nhttps://apkpure.com/p/com.mushafalmurajaa.app\n\n🌐 Marsariitii Ifa:\nhttps://mushafalmurajaa.com\n\n📺 Dabalataaf nu hordofaa:\nFacebook: https://www.facebook.com/mushafalmurajaa\nYouTube: https://youtube.com/@mushafalmurajaa\n\n✨ Warra jaallattaniif qoodaa... Namni gara gaariitti qajeelchu akka nama gaarii hojjetee ti ✨"
  }
};

const updateFiles = async () => {
  const files = fs.readdirSync(i18nDir);
  let updatedCount = 0;
  for (const file of files) {
    if (!file.endsWith('.json')) continue;
    const lang = file.split('.')[0];
    const filePath = path.join(i18nDir, file);
    try {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      
      let trans = translations[lang];
      if (!trans) {
        // If not in translations object, generate a fallback using English translated to their language
        // Since we can't reliably call translation API here, we will use the best matched English fallback 
        // with the proper links at least, BUT wait, I've mapped almost all 31 languages!
        trans = translations.en;
      }

      data.shareAppTitle = trans.shareAppTitle;
      data.shareAppText = trans.shareAppText;

      fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n');
      updatedCount++;
      console.log(`Updated ${file}`);
    } catch (e) {
      console.error(`Failed to update ${file}:`, e);
    }
  }
  console.log(`Updated ${updatedCount} files.`);
};

updateFiles();
