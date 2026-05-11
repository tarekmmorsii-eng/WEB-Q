/**
 * هوك الإشعارات الخارجية (Push Notifications)
 * يتعامل مع طلب الصلاحيات وتسجيل الأجهزة لاستقبال الإشعارات
 * يدعم كل من الويب (Firebase) والأندرويد (Capacitor)
 */

import { useState, useEffect, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';
import { getToken, onMessage } from 'firebase/messaging';
import { initMessaging } from '../utils/firebase-config';
import { addNotificationToStore } from './useNotificationStore';

// مفتاح التخزين المحلي لحالة الإشعارات
const PUSH_PERMISSION_KEY = 'quran_push_permission_granted';
const PUSH_TOKEN_KEY = 'quran_push_fcm_token';

/**
 * حالة الإشعارات
 */
export type PushPermissionStatus = 'granted' | 'denied' | 'prompt' | 'unsupported';

/**
 * واجهة نتيجة التهيئة
 */
interface PushNotificationResult {
  success: boolean;
  token?: string;
  error?: string;
}

/**
 * هوك usePushNotifications
 * يدير طلب صلاحيات الإشعارات وتسجيل الأجهزة
 */
export function usePushNotifications() {
  const [permissionStatus, setPermissionStatus] = useState<PushPermissionStatus>('prompt');
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [foregroundMessage, setForegroundMessage] = useState<any>(null);

  /**
   * التحقق من حالة الصلاحية الحالية
   */
  const checkPermissionStatus = useCallback((): PushPermissionStatus => {
    // على الأندرويد - Capacitor يتعامل مع الصلاحيات
    if (Capacitor.isNativePlatform()) {
      const saved = localStorage.getItem(PUSH_PERMISSION_KEY);
      return saved === 'granted' ? 'granted' : 'prompt';
    }

    // على الويب
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'unsupported';
    }

    if (Notification.permission === 'granted') {
      return 'granted';
    } else if (Notification.permission === 'denied') {
      return 'denied';
    }
    return 'prompt';
  }, []);

  /**
   * تهيئة الإشعارات على الأندرويد (Capacitor)
   */
  const initNativePush = useCallback(async (): Promise<PushNotificationResult> => {
    try {
      // طلب صلاحية الإشعارات
      const permissionResult = await PushNotifications.requestPermissions();

      if (permissionResult.receive !== 'granted') {
        return { success: false, error: 'تم رفض صلاحية الإشعارات' };
      }

      // تسجيل الجهاز لاستقبال الإشعارات
      await PushNotifications.register();

      // الاستماع لتسجيل الـ Token
      PushNotifications.addListener('registration', (token) => {
        console.log('[Push] تم تسجيل الجهاز بنجاح، Token:', token.value);
        setFcmToken(token.value);
        localStorage.setItem(PUSH_TOKEN_KEY, token.value);
        localStorage.setItem(PUSH_PERMISSION_KEY, 'granted');
        setPermissionStatus('granted');
      });

      // الاستماع لأخطاء التسجيل
      PushNotifications.addListener('registrationError', (err) => {
        console.error('[Push] خطأ في تسجيل الجهاز:', err);
        setError(err.error || 'خطأ في تسجيل الإشعارات');
      });

      // الاستماع للإشعارات عند فتح التطبيق
      PushNotifications.addListener('pushNotificationReceived', (notification) => {
        console.log('[Push] 🔔 إشعار مستلم في المقدمة:', JSON.stringify(notification, null, 2));
        setForegroundMessage(notification);

        // حفظ الإشعار في السجل
        addNotificationToStore({
          title: notification.title || 'إشعار جديد',
          body: notification.body || '',
          icon: '/final_logo.png',
          data: notification.data || {},
        });
      });

      // الاستماع عند النقر على الإشعار
      PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
        console.log('[Push] تم النقر على الإشعار:', action);
      });

      return { success: true };
    } catch (err: any) {
      console.error('[Push] خطأ في تهيئة الإشعارات الأصلية:', err);
      return { success: false, error: err.message || 'خطأ غير معروف' };
    }
  }, []);

  /**
   * تهيئة الإشعارات على الويب (Firebase)
   */
  const initWebPush = useCallback(async (): Promise<PushNotificationResult> => {
    try {
      // تهيئة Firebase Messaging
      const messaging = await initMessaging();

      if (!messaging) {
        return { success: false, error: 'Firebase Messaging غير مدعوم في هذا المتصفح' };
      }

      // طلب صلاحية الإشعارات من المتصفح
      const permission = await Notification.requestPermission();

      if (permission !== 'granted') {
        setPermissionStatus(permission === 'denied' ? 'denied' : 'prompt');
        return { success: false, error: 'تم رفض صلاحية الإشعارات' };
      }

      setPermissionStatus('granted');

      // ⭐ الحصول على تسجيل sw.js الموحد (الذي يحتوي على Firebase SDK مدمجاً)
      let swRegistration: ServiceWorkerRegistration | null = null;
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        // نبحث عن sw.js المسجل من index.html
        swRegistration = registrations.find(reg => reg.active) || null;
        if (swRegistration) {
          console.log('[Push] ✅ تم العثور على sw.js الموحد:', swRegistration.scope);
        } else {
          console.warn('[Push] ⚠️ لم يتم العثور على Service Worker مسجل');
        }
      }

      // الحصول على FCM Token مع تمرير تسجيل SW الموحد
      // ⚠️ مهم: يجب إنشاء مفتاح VAPID في Firebase Console > Project Settings > Cloud Messaging > Web Push certificates
      const token = await getToken(messaging, {
        vapidKey: 'BF8GdM2S4S8b1d6z0rIVlj-wxvsJasXPWS040BNdYqdyzfUhDpRtSX0wXqixH7O7UMsBGxVbAQWu0EqKKHNX66Y',
        serviceWorkerRegistration: swRegistration || undefined,
      });

      if (token) {
        console.log('[Push] FCM Token:', token);
        setFcmToken(token);
        localStorage.setItem(PUSH_TOKEN_KEY, token);
        localStorage.setItem(PUSH_PERMISSION_KEY, 'granted');
      } else {
        return { success: false, error: 'فشل في الحصول على Token' };
      }

      // الاستماع للرسائل في المقدمة (عندما يكون التطبيق مفتوحاً)
      onMessage(messaging, (payload) => {
        console.log('[Push] 🔔 رسالة مستلمة في المقدمة:', JSON.stringify(payload, null, 2));
        console.log('[Push] 📋 العنوان:', payload.notification?.title || payload.data?.title);
        console.log('[Push] 📋 النص:', payload.notification?.body || payload.data?.body);
        console.log('[Push] 📋 البيانات:', payload.data);
        setForegroundMessage(payload);

        const notifTitle = payload.notification?.title || payload.data?.title || 'إشعار جديد';
        const notifBody = payload.notification?.body || payload.data?.body || '';

        // حفظ الإشعار في السجل أولاً (ضمان عدم الضياع)
        addNotificationToStore({
          title: notifTitle,
          body: notifBody,
          icon: '/favicon.png',
          data: payload.data || {},
        });

        // عرض إشعار محلي إجباري
        if (notifTitle) {
          new Notification(notifTitle, {
            body: notifBody,
            icon: '/favicon.png',
            dir: 'rtl',
            lang: 'ar',
            tag: 'foreground-' + Date.now(),
            requireInteraction: true,
          });
        }
      });

      // الاستماع لرسائل Service Worker (إشعارات الخلفية المحفوظة)
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.addEventListener('message', (event) => {
          if (event.data?.type === 'SAVE_PUSH_NOTIFICATION') {
            console.log('[Push] 📨 إشعار من Service Worker:', event.data.notification);
            addNotificationToStore(event.data.notification);
          }
        });
      }

      return { success: true, token };
    } catch (err: any) {
      console.error('[Push] خطأ في تهيئة إشعارات الويب:', err);
      return { success: false, error: err.message || 'خطأ غير معروف' };
    }
  }, []);

  /**
   * طلب صلاحية الإشعارات وتسجيل الجهاز
   * هذه الدالة الرئيسية التي يجب استدعاؤها
   */
  const requestPermission = useCallback(async (): Promise<PushNotificationResult> => {
    setIsLoading(true);
    setError(null);

    try {
      let result: PushNotificationResult;

      if (Capacitor.isNativePlatform()) {
        // أندرويد - عبر Capacitor
        result = await initNativePush();
      } else {
        // ويب - عبر Firebase
        result = await initWebPush();
      }

      if (!result.success) {
        setError(result.error || 'فشل في تسجيل الإشعارات');
      }

      return result;
    } catch (err: any) {
      const errorMsg = err.message || 'حدث خطأ غير متوقع';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  }, [initNativePush, initWebPush]);

  /**
   * التحقق من الحالة المحفوظة عند تحميل الهوك
   */
  useEffect(() => {
    const status = checkPermissionStatus();
    setPermissionStatus(status);

    // استعادة الـ Token المحفوظ
    const savedToken = localStorage.getItem(PUSH_TOKEN_KEY);
    if (savedToken) {
      setFcmToken(savedToken);
    }
  }, [checkPermissionStatus]);

  return {
    // الحالة
    permissionStatus,
    fcmToken,
    isLoading,
    error,
    foregroundMessage,

    // الدوال
    requestPermission,
    setForegroundMessage,

    // معلومات مساعدة
    isNative: Capacitor.isNativePlatform(),
    isPushSupported: typeof window !== 'undefined' && ('Notification' in window || Capacitor.isNativePlatform()),
  };
}

export default usePushNotifications;