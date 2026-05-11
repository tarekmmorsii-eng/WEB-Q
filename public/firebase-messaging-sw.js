/**
 * Firebase Cloud Messaging Service Worker
 * هذا الملف مسؤول عن استقبال الإشعارات الخارجية عندما يكون التطبيق في الخلفية
 * يجب أن يكون في مجلد public ليتم تقديمه من الجذر
 */

// ⭐⭐⭐ بداية Service Worker - تشخيص مكثف ⭐⭐⭐
console.log('[FCM-SW] 🚀🚀🚀 بداية تحميل firebase-messaging-sw.js - الوقت:', new Date().toISOString());
console.log('[FCM-SW] 📍 الموقع:', self.location.href);
console.log('[FCM-SW] 🌐 بيئة العمل:', typeof firebase);

// استيراد مكتبات Firebase اللازمة عبر importScripts
console.log('[FCM-SW] 📦 جاري تحميل Firebase SDK...');
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js');
console.log('[FCM-SW] ✅ تم تحميل firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js');
console.log('[FCM-SW] ✅ تم تحميل firebase-messaging-compat.js');
console.log('[FCM-SW] 🔍 firebase.app متوفر:', typeof firebase?.app);
console.log('[FCM-SW] 🔍 firebase.messaging متوفر:', typeof firebase?.messaging);

// تهيئة Firebase بالمفاتيح الحقيقية
const firebaseConfig = {
  apiKey: 'AIzaSyALus6trZEvqIwl-RZh9T8nSWkmKfsO5g0',
  authDomain: 'quran-app-69891.firebaseapp.com',
  projectId: 'quran-app-69891',
  storageBucket: 'quran-app-69891.firebasestorage.app',
  messagingSenderId: '495250099560',
  appId: '1:495250099560:web:78d1eb07e0e6b47093dadd',
  measurementId: 'G-4FYJ6QRCQL'
};

// تهيئة Firebase في Service Worker
console.log('[FCM-SW] 🔧 جاري تهيئة Firebase بالمفاتيح...');
console.log('[FCM-SW] 🔧 projectId:', firebaseConfig.projectId);
console.log('[FCM-SW] 🔧 messagingSenderId:', firebaseConfig.messagingSenderId);
firebase.initializeApp(firebaseConfig);
console.log('[FCM-SW] ✅ تم تهيئة Firebase بنجاح');

// الحصول على نسخة Messaging
const messaging = firebase.messaging();
console.log('[FCM-SW] ✅ تم إنشاء كائن Messaging بنجاح');
console.log('[FCM-SW] 🎉🎉🎉 Service Worker جاهز تماماً لاستقبال الإشعارات!');

/**
 * حفظ الإشعار في localStorage عبر إرسال رسالة لجميع عملاء التطبيق
 * لأن Service Worker لا يمكنه الوصول مباشرة إلى localStorage
 */
function saveNotificationToStore(notificationData) {
  const storePayload = {
    type: 'SAVE_PUSH_NOTIFICATION',
    notification: {
      title: notificationData.title || 'إشعار جديد',
      body: notificationData.body || '',
      icon: notificationData.icon || '/final_logo.png',
      tag: notificationData.tag,
      data: notificationData.data || {},
    }
  };

  // إرسال الرسالة لجميع النوافذ المفتوحة
  self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
    if (clientList.length > 0) {
      clientList.forEach(client => {
        client.postMessage(storePayload);
      });
      console.log('[firebase-messaging-sw.js] 📨 تم إرسال الإشعار للحفظ عبر postMessage إلى', clientList.length, 'نافذة');
    } else {
      // إذا لم تكن أي نافذة مفتوحة، نحفظ في IndexedDB كبديل
      console.log('[firebase-messaging-sw.js] ⚠️ لا توجد نوافذ مفتوحة، سيتم الحفظ عند فتح التطبيق');
      saveToIndexedDB(storePayload.notification);
    }
  });
}

/**
 * حفظ في IndexedDB كبديل عندما لا تكون هناك نافذة مفتوحة
 */
function saveToIndexedDB(notification) {
  try {
    const request = indexedDB.open('quran_push_store', 1);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('notifications')) {
        db.createObjectStore('notifications', { keyPath: 'id', autoIncrement: true });
      }
    };
    request.onsuccess = (event) => {
      const db = event.target.result;
      const tx = db.transaction('notifications', 'readwrite');
      const store = tx.objectStore('notifications');
      store.add({
        ...notification,
        timestamp: Date.now(),
        isRead: false,
        savedAt: new Date().toISOString()
      });
      console.log('[firebase-messaging-sw.js] ✅ تم حفظ الإشعار في IndexedDB');
    };
    request.onerror = () => {
      console.warn('[firebase-messaging-sw.js] ⚠️ فشل حفظ في IndexedDB');
    };
  } catch (e) {
    console.warn('[firebase-messaging-sw.js] ⚠️ خطأ في IndexedDB:', e);
  }
}

// استقبال الرسائل في الخلفية
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] 🔔 تم استلام رسالة في الخلفية:', JSON.stringify(payload, null, 2));

  // استخراج بيانات الإشعار - ندعم notification و data معاً
  const notificationTitle = payload.notification?.title || payload.data?.title || 'إشعار جديد';
  const notificationBody = payload.notification?.body || payload.data?.body || '';

  console.log('[firebase-messaging-sw.js] 📋 العنوان:', notificationTitle);
  console.log('[firebase-messaging-sw.js] 📋 النص:', notificationBody);
  console.log('[firebase-messaging-sw.js] 📋 البيانات الكاملة:', payload.data);

  const notificationOptions = {
    body: notificationBody,
    icon: payload.notification?.icon || '/final_logo.png',
    badge: '/final_logo.png',
    tag: payload.data?.tag || 'quran-push-' + Date.now(),
    data: payload.data || {},
    // إعدادات إضافية لإظهار الإشعار بشكل إجباري
    vibrate: [200, 100, 200],
    requireInteraction: true, // يبقى الإشعار ظاهراً حتى يتفاعل المستخدم
    // دعم RTL للغة العربية
    dir: 'rtl',
    lang: 'ar',
    // إعدادات الصوت والرؤية
    silent: false,
    renotify: true,
    // أولوية عالية
    priority: 'high',
  };

  // إظهار الإشعار إجبارياً
  self.registration.showNotification(notificationTitle, notificationOptions)
    .then(() => {
      console.log('[firebase-messaging-sw.js] ✅ تم إظهار الإشعار بنجاح');
    })
    .catch(err => {
      console.error('[firebase-messaging-sw.js] ❌ فشل إظهار الإشعار:', err);
    });

  // حفظ الإشعار في السجل
  saveNotificationToStore({
    title: notificationTitle,
    body: notificationBody,
    icon: notificationOptions.icon,
    tag: notificationOptions.tag,
    data: payload.data
  });
});

// التعامل مع النقر على الإشعار
self.addEventListener('notificationclick', (event) => {
  console.log('[firebase-messaging-sw.js] 👆 تم النقر على الإشعار:', event.notification.tag);

  // إغلاق الإشعار
  event.notification.close();

  // فتح التطبيق أو التركيز عليه
  const targetUrl = event.notification.data?.targetPage
    ? `/?page=${event.notification.data.targetPage}`
    : '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // إذا كان التطبيق مفتوحاً بالفعل، ركز عليه
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      // إذا لم يكن مفتوحاً، افتح نافذة جديدة
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});

// استقبال رسائل من التطبيق الرئيسي (للسحب من IndexedDB)
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'GET_STORED_NOTIFICATIONS') {
    // سحب الإشعارات المحفوظة في IndexedDB
    try {
      const request = indexedDB.open('quran_push_store', 1);
      request.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains('notifications')) {
          db.createObjectStore('notifications', { keyPath: 'id', autoIncrement: true });
        }
      };
      request.onsuccess = (e) => {
        const db = e.target.result;
        if (db.objectStoreNames.contains('notifications')) {
          const tx = db.transaction('notifications', 'readonly');
          const store = tx.objectStore('notifications');
          const getAll = store.getAll();
          getAll.onsuccess = () => {
            event.ports[0].postMessage({ type: 'STORED_NOTIFICATIONS', notifications: getAll.result });
            // مسح بعد الإرسال
            const clearTx = db.transaction('notifications', 'readwrite');
            clearTx.objectStore('notifications').clear();
          };
        }
      };
    } catch (e) {
      console.warn('[firebase-messaging-sw.js] خطأ في سحب IndexedDB:', e);
    }
  }
});