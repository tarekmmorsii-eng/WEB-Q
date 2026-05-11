/**
 * سكربت إصلاح ثغرات الترجمة في نظام الإشعارات
 * يضيف/يحدّث المفاتيح التالية لكل 31 لغة:
 * - pushNotifCenterTitle, pushNotifMarkAllRead, pushNotifClearAll
 * - pushNotifEmpty, pushNotifEmptyDesc, pushNotifDelete
 * - pushNotifUnread, pushNotifFooterSaved, pushNotifFooterInLog
 */

const fs = require('fs');
const path = require('path');

const I18N_DIR = path.join(__dirname, '..', 'src', 'assets', 'i18n');

// ترجمات فعلية لكل 31 لغة
const TRANSLATIONS = {
  ar: {
    pushNotifCenterTitle: 'مركز الإشعارات',
    pushNotifMarkAllRead: 'تحديد الكل كمقروء',
    pushNotifClearAll: 'حذف الكل',
    pushNotifEmpty: 'لا توجد إشعارات بعد',
    pushNotifEmptyDesc: 'ستظهر الإشعارات الخارجية هنا عند استلامها',
    pushNotifDelete: 'حذف',
    pushNotifUnread: 'غير مقروء',
    pushNotifFooterSaved: 'يتم حفظ آخر 20 إشعار',
    pushNotifFooterInLog: 'إشعار في السجل',
  },
  en: {
    pushNotifCenterTitle: 'Notification Center',
    pushNotifMarkAllRead: 'Mark all as read',
    pushNotifClearAll: 'Clear all',
    pushNotifEmpty: 'No notifications yet',
    pushNotifEmptyDesc: 'Push notifications will appear here when received',
    pushNotifDelete: 'Delete',
    pushNotifUnread: 'unread',
    pushNotifFooterSaved: 'Last 20 notifications saved',
    pushNotifFooterInLog: 'in log',
  },
  id: {
    pushNotifCenterTitle: 'Pusat Notifikasi',
    pushNotifMarkAllRead: 'Tandai semua dibaca',
    pushNotifClearAll: 'Hapus semua',
    pushNotifEmpty: 'Belum ada notifikasi',
    pushNotifEmptyDesc: 'Notifikasi push akan muncul di sini saat diterima',
    pushNotifDelete: 'Hapus',
    pushNotifUnread: 'belum dibaca',
    pushNotifFooterSaved: '20 notifikasi terakhir disimpan',
    pushNotifFooterInLog: 'dalam log',
  },
  ms: {
    pushNotifCenterTitle: 'Pusat Pemberitahuan',
    pushNotifMarkAllRead: 'Tandai semua telah dibaca',
    pushNotifClearAll: 'Hapus semua',
    pushNotifEmpty: 'Tiada pemberitahuan lagi',
    pushNotifEmptyDesc: 'Pemberitahuan push akan muncul di sini apabila diterima',
    pushNotifDelete: 'Hapus',
    pushNotifUnread: 'belum dibaca',
    pushNotifFooterSaved: '20 pemberitahuan terakhir disimpan',
    pushNotifFooterInLog: 'dalam log',
  },
  ur: {
    pushNotifCenterTitle: 'اطلاعات کا مرکز',
    pushNotifMarkAllRead: 'سب پڑھے ہوئے نشان زد کریں',
    pushNotifClearAll: 'سب حذف کریں',
    pushNotifEmpty: 'ابھی تک کوئی اطلاعات نہیں',
    pushNotifEmptyDesc: 'پش نوٹیفکیشن موصول ہونے پر یہاں ظاہر ہوں گی',
    pushNotifDelete: 'حذف کریں',
    pushNotifUnread: 'غیر پڑھے',
    pushNotifFooterSaved: 'آخری 20 اطلاعات محفوظ کی گئیں',
    pushNotifFooterInLog: 'لاگ میں',
  },
  bn: {
    pushNotifCenterTitle: 'বিজ্ঞপ্তি কেন্দ্র',
    pushNotifMarkAllRead: 'সব পঠিত হিসেবে চিহ্নিত করুন',
    pushNotifClearAll: 'সব মুছুন',
    pushNotifEmpty: 'এখনো কোনো বিজ্ঞপ্তি নেই',
    pushNotifEmptyDesc: 'পুশ বিজ্ঞপ্তি পাওয়ার পর এখানে দেখা যাবে',
    pushNotifDelete: 'মুছুন',
    pushNotifUnread: 'অপঠিত',
    pushNotifFooterSaved: 'সর্বশেষ ২০টি বিজ্ঞপ্তি সংরক্ষিত',
    pushNotifFooterInLog: 'লগে আছে',
  },
  tr: {
    pushNotifCenterTitle: 'Bildirim Merkezi',
    pushNotifMarkAllRead: 'Tümünü okundu olarak işaretle',
    pushNotifClearAll: 'Tümünü sil',
    pushNotifEmpty: 'Henüz bildirim yok',
    pushNotifEmptyDesc: 'Push bildirimleri alındığında burada görünecek',
    pushNotifDelete: 'Sil',
    pushNotifUnread: 'okunmamış',
    pushNotifFooterSaved: 'Son 20 bildirim kaydedildi',
    pushNotifFooterInLog: 'kayıtta',
  },
  fa: {
    pushNotifCenterTitle: 'مرکز اعلان‌ها',
    pushNotifMarkAllRead: 'علامت‌گذاری همه به عنوان خوانده شده',
    pushNotifClearAll: 'حذف همه',
    pushNotifEmpty: 'هنوز اعلانی نیست',
    pushNotifEmptyDesc: 'اعلان‌های دریافتی اینجا نمایش داده می‌شوند',
    pushNotifDelete: 'حذف',
    pushNotifUnread: 'خوانده نشده',
    pushNotifFooterSaved: 'آخرین ۲۰ اعلان ذخیره شد',
    pushNotifFooterInLog: 'در گزارش',
  },
  ha: {
    pushNotifCenterTitle: 'Cibiyar Sanarwa',
    pushNotifMarkAllRead: 'Marka duka an karanta',
    pushNotifClearAll: 'Goge duka',
    pushNotifEmpty: 'Babu sanarwa har yanzu',
    pushNotifEmptyDesc: 'Sanarwar push za ta bayyana a nan lokacin da aka karɓa',
    pushNotifDelete: 'Goge',
    pushNotifUnread: 'ba a karanta ba',
    pushNotifFooterSaved: 'Sanarwanni 20 na ƙarshe an ajiye',
    pushNotifFooterInLog: 'a cikin log',
  },
  fr: {
    pushNotifCenterTitle: 'Centre de notifications',
    pushNotifMarkAllRead: 'Tout marquer comme lu',
    pushNotifClearAll: 'Tout effacer',
    pushNotifEmpty: 'Aucune notification pour le moment',
    pushNotifEmptyDesc: 'Les notifications push apparaîtront ici lors de la réception',
    pushNotifDelete: 'Supprimer',
    pushNotifUnread: 'non lu',
    pushNotifFooterSaved: 'Les 20 dernières notifications sont enregistrées',
    pushNotifFooterInLog: 'dans le journal',
  },
  es: {
    pushNotifCenterTitle: 'Centro de notificaciones',
    pushNotifMarkAllRead: 'Marcar todo como leído',
    pushNotifClearAll: 'Borrar todo',
    pushNotifEmpty: 'Aún no hay notificaciones',
    pushNotifEmptyDesc: 'Las notificaciones push aparecerán aquí al recibirlas',
    pushNotifDelete: 'Eliminar',
    pushNotifUnread: 'no leído',
    pushNotifFooterSaved: 'Últimas 20 notificaciones guardadas',
    pushNotifFooterInLog: 'en el registro',
  },
  de: {
    pushNotifCenterTitle: 'Benachrichtigungscenter',
    pushNotifMarkAllRead: 'Alle als gelesen markieren',
    pushNotifClearAll: 'Alle löschen',
    pushNotifEmpty: 'Noch keine Benachrichtigungen',
    pushNotifEmptyDesc: 'Push-Benachrichtigungen werden hier angezeigt, wenn sie eintreffen',
    pushNotifDelete: 'Löschen',
    pushNotifUnread: 'ungelesen',
    pushNotifFooterSaved: 'Letzte 20 Benachrichtigungen gespeichert',
    pushNotifFooterInLog: 'im Protokoll',
  },
  ru: {
    pushNotifCenterTitle: 'Центр уведомлений',
    pushNotifMarkAllRead: 'Отметить всё как прочитанное',
    pushNotifClearAll: 'Очистить всё',
    pushNotifEmpty: 'Пока нет уведомлений',
    pushNotifEmptyDesc: 'Push-уведомления появятся здесь при получении',
    pushNotifDelete: 'Удалить',
    pushNotifUnread: 'непрочитано',
    pushNotifFooterSaved: 'Сохранены последние 20 уведомлений',
    pushNotifFooterInLog: 'в журнале',
  },
  sw: {
    pushNotifCenterTitle: 'Kituo cha Arifa',
    pushNotifMarkAllRead: 'Weka alama zote kama zimesomwa',
    pushNotifClearAll: 'Futa zote',
    pushNotifEmpty: 'Hakuna arifa bado',
    pushNotifEmptyDesc: 'Arifa za push zitaonekana hapa zinapopokelewa',
    pushNotifDelete: 'Futa',
    pushNotifUnread: 'haujasomwa',
    pushNotifFooterSaved: 'Arifa 20 za mwisho zimehifadhiwa',
    pushNotifFooterInLog: 'katika kumbukumbu',
  },
  zh: {
    pushNotifCenterTitle: '通知中心',
    pushNotifMarkAllRead: '全部标记为已读',
    pushNotifClearAll: '全部清除',
    pushNotifEmpty: '暂无通知',
    pushNotifEmptyDesc: '收到推送通知后将在此处显示',
    pushNotifDelete: '删除',
    pushNotifUnread: '未读',
    pushNotifFooterSaved: '已保存最近20条通知',
    pushNotifFooterInLog: '在记录中',
  },
  ko: {
    pushNotifCenterTitle: '알림 센터',
    pushNotifMarkAllRead: '모두 읽음으로 표시',
    pushNotifClearAll: '모두 삭제',
    pushNotifEmpty: '알림이 없습니다',
    pushNotifEmptyDesc: '푸시 알림이 수신되면 여기에 표시됩니다',
    pushNotifDelete: '삭제',
    pushNotifUnread: '읽지 않음',
    pushNotifFooterSaved: '최근 20개 알림 저장됨',
    pushNotifFooterInLog: '로그에',
  },
  ja: {
    pushNotifCenterTitle: '通知センター',
    pushNotifMarkAllRead: 'すべて既読にする',
    pushNotifClearAll: 'すべて削除',
    pushNotifEmpty: '通知はまだありません',
    pushNotifEmptyDesc: 'プッシュ通知を受信するとここに表示されます',
    pushNotifDelete: '削除',
    pushNotifUnread: '未読',
    pushNotifFooterSaved: '最新20件の通知を保存しました',
    pushNotifFooterInLog: 'ログ内',
  },
  bs: {
    pushNotifCenterTitle: 'Centar za obavještenja',
    pushNotifMarkAllRead: 'Označi sve kao pročitano',
    pushNotifClearAll: 'Obriši sve',
    pushNotifEmpty: 'Još nema obavještenja',
    pushNotifEmptyDesc: 'Push obavještenja će se pojaviti ovdje kada budu primljena',
    pushNotifDelete: 'Obriši',
    pushNotifUnread: 'nepročitano',
    pushNotifFooterSaved: 'Zadnjih 20 obavještenja sačuvano',
    pushNotifFooterInLog: 'u zapisniku',
  },
  sq: {
    pushNotifCenterTitle: 'Qendra e njoftimeve',
    pushNotifMarkAllRead: 'Shënoji të gjitha si të lexuara',
    pushNotifClearAll: 'Fshi të gjitha',
    pushNotifEmpty: 'Ende pa njoftime',
    pushNotifEmptyDesc: 'Njoftimet push do të shfaqen këtu kur të merren',
    pushNotifDelete: 'Fshi',
    pushNotifUnread: 'të palexuara',
    pushNotifFooterSaved: 'Ruhen 20 njoftimet e fundit',
    pushNotifFooterInLog: 'në regjistër',
  },
  uz: {
    pushNotifCenterTitle: 'Bildirishnomalar markazi',
    pushNotifMarkAllRead: 'Hammasini o\'qilgan deb belgilash',
    pushNotifClearAll: 'Hammasini o\'chirish',
    pushNotifEmpty: 'Hali bildirishnoma yo\'q',
    pushNotifEmptyDesc: 'Push-bildirishnomalar qabul qilinganda bu yerda ko\'rinadi',
    pushNotifDelete: 'O\'chirish',
    pushNotifUnread: 'o\'qilmagan',
    pushNotifFooterSaved: 'So\'nggi 20 ta bildirishnoma saqlandi',
    pushNotifFooterInLog: 'jurnalda',
  },
  kk: {
    pushNotifCenterTitle: 'Хабарламалар орталығы',
    pushNotifMarkAllRead: 'Барлығын оқылды деп белгілеу',
    pushNotifClearAll: 'Барлығын жою',
    pushNotifEmpty: 'Әлі хабарлама жоқ',
    pushNotifEmptyDesc: 'Push-хабарламалар келгенде осында көрінеді',
    pushNotifDelete: 'Жою',
    pushNotifUnread: 'оқылмаған',
    pushNotifFooterSaved: 'Соңғы 20 хабарлама сақталды',
    pushNotifFooterInLog: 'журналда',
  },
  ku: {
    pushNotifCenterTitle: 'ناوەندی ئاگادارییەکان',
    pushNotifMarkAllRead: 'هەموو وەک خوێندراوە نیشانە بکە',
    pushNotifClearAll: 'هەموو بیسڕەوە',
    pushNotifEmpty: 'هێشتا ئاگاداری نییە',
    pushNotifEmptyDesc: 'ئاگادارییەکانی پەش لە وەرگرتندا لێرە دەردەکەون',
    pushNotifDelete: 'بیسڕەوە',
    pushNotifUnread: 'نەخوێندراوە',
    pushNotifFooterSaved: '٢٠ ئاگاداریی کۆتایی پاشەکەوت کران',
    pushNotifFooterInLog: 'لە تۆمارێکدا',
  },
  vi: {
    pushNotifCenterTitle: 'Trung tâm thông báo',
    pushNotifMarkAllRead: 'Đánh dấu tất cả đã đọc',
    pushNotifClearAll: 'Xóa tất cả',
    pushNotifEmpty: 'Chưa có thông báo',
    pushNotifEmptyDesc: 'Thông báo đẩy sẽ xuất hiện ở đây khi nhận được',
    pushNotifDelete: 'Xóa',
    pushNotifUnread: 'chưa đọc',
    pushNotifFooterSaved: 'Đã lưu 20 thông báo gần nhất',
    pushNotifFooterInLog: 'trong nhật ký',
  },
  tl: {
    pushNotifCenterTitle: 'Sentro ng Abiso',
    pushNotifMarkAllRead: 'I-mark lahat bilang nabasa',
    pushNotifClearAll: 'I-clear lahat',
    pushNotifEmpty: 'Wala pang abiso',
    pushNotifEmptyDesc: 'Mga push notification ay lalabas dito kapag natanggap',
    pushNotifDelete: 'I-delete',
    pushNotifUnread: 'hindi pa nabasa',
    pushNotifFooterSaved: 'Huling 20 na abiso ay nai-save',
    pushNotifFooterInLog: 'sa log',
  },
  hi: {
    pushNotifCenterTitle: 'सूचना केंद्र',
    pushNotifMarkAllRead: 'सभी को पढ़ा हुआ चिह्नित करें',
    pushNotifClearAll: 'सभी हटाएं',
    pushNotifEmpty: 'अभी तक कोई सूचना नहीं',
    pushNotifEmptyDesc: 'पुश सूचनाएं प्राप्त होने पर यहां दिखाई देंगी',
    pushNotifDelete: 'हटाएं',
    pushNotifUnread: 'अपठित',
    pushNotifFooterSaved: 'अंतिम 20 सूचनाएं सहेजी गईं',
    pushNotifFooterInLog: 'लॉग में',
  },
  ta: {
    pushNotifCenterTitle: 'அறிவிப்பு மையம்',
    pushNotifMarkAllRead: 'அனைத்தையும் படித்ததாகக் குறிக்கவும்',
    pushNotifClearAll: 'அனைத்தையும் அழிக்கவும்',
    pushNotifEmpty: 'இன்னும் அறிவிப்புகள் இல்லை',
    pushNotifEmptyDesc: 'புஷ் அறிவிப்புகள் வந்தவுடன் இங்கே தோன்றும்',
    pushNotifDelete: 'அழி',
    pushNotifUnread: 'படிக்காத',
    pushNotifFooterSaved: 'கடைசி 20 அறிவிப்புகள் சேமிக்கப்பட்டன',
    pushNotifFooterInLog: 'பதிவில்',
  },
  si: {
    pushNotifCenterTitle: 'දැනුම්දීම් මධ්‍යස්ථානය',
    pushNotifMarkAllRead: 'සියල්ල කියවූ ලෙස සලකුණු කරන්න',
    pushNotifClearAll: 'සියල්ල මකන්න',
    pushNotifEmpty: 'තවම දැනුම්දීම් නැත',
    pushNotifEmptyDesc: 'එළඹෙන දැනුම්දීම් ලැබුණු විට මෙහි පෙන්වනු ඇත',
    pushNotifDelete: 'මකන්න',
    pushNotifUnread: 'නොකියවූ',
    pushNotifFooterSaved: 'අවසන් දැනුම්දීම් 20 සුරකින ලදී',
    pushNotifFooterInLog: 'ලොග් එකේ',
  },
  am: {
    pushNotifCenterTitle: 'የማሳወቂያ ማዕከል',
    pushNotifMarkAllRead: 'ሁሉንም እንደተነበበ ምልክት አድርግ',
    pushNotifClearAll: 'ሁሉንም አጥፋ',
    pushNotifEmpty: 'እስካሁን ማሳወቂያ የለም',
    pushNotifEmptyDesc: 'የተላኩ ማሳወቂያዎች ሲደርሱ እዚህ ይታያሉ',
    pushNotifDelete: 'አጥፋ',
    pushNotifUnread: 'ያልተነበበ',
    pushNotifFooterSaved: 'የመጨረሻ 20 ማሳወቂያዎች ተቀምጠዋል',
    pushNotifFooterInLog: 'በምዝግብ ማስታወሻ ውስጥ',
  },
  yo: {
    pushNotifCenterTitle: 'Ile-iṣẹ Ikilọ',
    pushNotifMarkAllRead: 'Tọkasi gbogbo bi a ti ka',
    pushNotifClearAll: 'Pa gbogbo rẹ',
    pushNotifEmpty: 'Ko si ikilọ tuntun',
    pushNotifEmptyDesc: 'Awọn ikilọ yoo han nibi nigbati wọn ba de',
    pushNotifDelete: 'Pa rẹ',
    pushNotifUnread: 'a ko ka',
    pushNotifFooterSaved: 'Awọn ikilọ 20 ti a fi pamọ',
    pushNotifFooterInLog: 'ninu log',
  },
  om: {
    pushNotifCenterTitle: 'Wiirtuu Beeksisa',
    pushNotifMarkAllRead: 'Hunda akka dubbifameetti mallattoo gochuu',
    pushNotifClearAll: 'Hunda haqi',
    pushNotifEmpty: 'Amma beeksisa hin jiru',
    pushNotifEmptyDesc: 'Beeksisa push yeroo dhufu asitti argama',
    pushNotifDelete: 'Haqi',
    pushNotifUnread: 'hin dubbadhinee',
    pushNotifFooterSaved: 'Beeksisa 20 dhumaa olkaa\'eera',
    pushNotifFooterInLog: 'galma keessatti',
  },
  rw: {
    pushNotifCenterTitle: 'Hagurisha Amakuru',
    pushNotifMarkAllRead: 'Menyesha byose ko byasomwe',
    pushNotifClearAll: 'Siba byose',
    pushNotifEmpty: 'Nta makuru arimo',
    pushNotifEmptyDesc: 'Amakuru ya push azagaragara hano agiye kugeraho',
    pushNotifDelete: 'Siba',
    pushNotifUnread: 'adasomye',
    pushNotifFooterSaved: 'Amakuru 20 ya nyuma yabitswe',
    pushNotifFooterInLog: 'mu rutonde',
  },
};

const keys = [
  'pushNotifCenterTitle',
  'pushNotifMarkAllRead',
  'pushNotifClearAll',
  'pushNotifEmpty',
  'pushNotifEmptyDesc',
  'pushNotifDelete',
  'pushNotifUnread',
  'pushNotifFooterSaved',
  'pushNotifFooterInLog',
];

let updated = 0;
let errors = 0;

for (const [lang, translations] of Object.entries(TRANSLATIONS)) {
  const filePath = path.join(I18N_DIR, `${lang}.json`);
  
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  Missing file: ${lang}.json`);
      errors++;
      continue;
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    const json = JSON.parse(content);

    let changed = false;
    for (const key of keys) {
      const oldValue = json[key];
      const newValue = translations[key];
      
      if (!oldValue || oldValue !== newValue) {
        json[key] = newValue;
        changed = true;
      }
    }

    if (changed) {
      // Keep the JSON formatting consistent
      fs.writeFileSync(filePath, JSON.stringify(json, null, 2) + '\n', 'utf-8');
      console.log(`✅ Updated: ${lang}.json`);
      updated++;
    } else {
      console.log(`⏭️  Already up-to-date: ${lang}.json`);
    }
  } catch (err) {
    console.error(`❌ Error processing ${lang}.json:`, err.message);
    errors++;
  }
}

console.log(`\n📊 Summary: ${updated} files updated, ${errors} errors`);