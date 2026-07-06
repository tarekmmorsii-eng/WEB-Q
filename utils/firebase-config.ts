/**
 * تهيئة Firebase للويب - Push Notifications
 * ⭐ يستخدم sw.js الموحد (الذي يحتوي على Firebase SDK مدمجاً)
 * تمت إزالة ملف Service Worker المنفصل القديم — الإشعارات تُدار بالكامل عبر sw.js
 */

import { initializeApp } from 'firebase/app';
import { getMessaging, isSupported } from 'firebase/messaging';

// تهيئة Firebase باستخدام المفاتيح الحقيقية
const firebaseConfig = {
  apiKey: 'AIzaSyALus6trZEvqIwl-RZh9T8nSWkmKfsO5g0',
  authDomain: 'quran-app-69891.firebaseapp.com',
  projectId: 'quran-app-69891',
  storageBucket: 'quran-app-69891.firebasestorage.app',
  messagingSenderId: '495250099560',
  appId: '1:495250099560:web:78d1eb07e0e6b47093dadd',
  measurementId: 'G-4FYJ6QRCQL'
};

// تهيئة تطبيق Firebase
const app = initializeApp(firebaseConfig);

// تهيئة Firebase Messaging مع التحقق من دعم المتصفح
let messaging: ReturnType<typeof getMessaging> | null = null;

/**
 * الحصول على نسخة Messaging بشكل آمن
 * يتحقق أولاً من أن المتصفح يدعم Firebase Messaging
 * ⭐ يستخدم sw.js الموحد الذي سجله index.html بالفعل
 *    (لا نحتاج لتسجيل Service Worker منفصل للإشعارات)
 */
const initMessaging = async () => {
  try {
    const supported = await isSupported();
    if (!supported) {
      console.warn('[Firebase] Messaging غير مدعوم في هذا المتصفح');
      return null;
    }

    // ⭐ التحقق من أن sw.js الموحد مسجل ويعمل
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      console.log('[Firebase] 📋 عدد Service Workers المسجلة:', registrations.length);
      
      const swRegistration = registrations.find(
        reg => reg.active && reg.scope.includes('/')
      );

      if (swRegistration) {
        console.log('[Firebase] ✅ sw.js الموحد مسجل ويعمل:', swRegistration.scope);
        console.log('[Firebase] ✅ Firebase SDK مدمج داخله - لا حاجة لتسجيل منفصل');
      } else {
        console.warn('[Firebase] ⚠️ لم يتم العثور على Service Worker مسجل');
        console.warn('[Firebase] ⚠️ انتظر حتى يتم تسجيل sw.js من index.html');
        
        // محاولة انتظار تسجيل Service Worker
        if (navigator.serviceWorker.controller) {
          console.log('[Firebase] ✅ يوجد Service Worker يتحكم بالصفحة');
        } else {
          console.warn('[Firebase] ⚠️ لا يوجد Service Worker يتحكم بالصفحة بعد');
        }
      }
    } else {
      console.warn('[Firebase] ⚠️ Service Worker غير مدعوم في هذا المتصفح');
    }

    messaging = getMessaging(app);
    console.log('[Firebase] ✅ تم تهيئة Firebase Messaging بنجاح');
    console.log('[Firebase] 🔍 messaging جاهز:', !!messaging);
    return messaging;
  } catch (error) {
    console.error('[Firebase] خطأ في تهيئة Firebase Messaging:', error);
    return null;
  }
};

export { app, messaging, initMessaging, firebaseConfig };
export default app;