/**
 * نظام تخزين الإشعارات الخارجية (Push Notification Store)
 * يحفظ آخر 20 إشعاراً في localStorage لضمان عدم ضياع أي تنبيه
 */

import { useState, useEffect, useCallback } from 'react';

// مفتاح التخزين المحلي
const NOTIFICATION_STORE_KEY = 'quran_push_notification_store';
const MAX_NOTIFICATIONS = 20;

/**
 * واجهة الإشعار المخزن
 */
export interface StoredNotification {
  id: string;
  title: string;
  body: string;
  timestamp: number;
  isRead: boolean;
  icon?: string;
  tag?: string;
  data?: Record<string, any>;
}

/**
 * إضافة إشعار جديد إلى المخزن (يمكن استدعاؤها من أي مكان)
 */
export function addNotificationToStore(notification: Omit<StoredNotification, 'id' | 'timestamp' | 'isRead'>): void {
  try {
    const store = getStoredNotifications();
    const newNotification: StoredNotification = {
      ...notification,
      id: `notif_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      timestamp: Date.now(),
      isRead: false,
    };

    // إضافة في البداية (الأحدث أولاً)
    store.unshift(newNotification);

    // الاحتفاظ بآخر 20 إشعار فقط
    const trimmed = store.slice(0, MAX_NOTIFICATIONS);

    localStorage.setItem(NOTIFICATION_STORE_KEY, JSON.stringify(trimmed));

    // إطلاق حدث مخصص لتحديث الواجهة
    window.dispatchEvent(new CustomEvent('push-notification-received', {
      detail: newNotification
    }));

    console.log('[NotificationStore] ✅ تم حفظ إشعار جديد:', newNotification.title, '| الإجمالي:', trimmed.length);
  } catch (error) {
    console.error('[NotificationStore] ❌ خطأ في حفظ الإشعار:', error);
  }
}

/**
 * قراءة الإشعارات المخزنة (دالة مساعدة خارجية)
 */
export function getStoredNotifications(): StoredNotification[] {
  try {
    const raw = localStorage.getItem(NOTIFICATION_STORE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * عدد الإشعارات غير المقروءة
 */
export function getUnreadPushCount(): number {
  return getStoredNotifications().filter(n => !n.isRead).length;
}

/**
 * هوك React لإدارة سجل الإشعارات
 */
export function useNotificationStore() {
  const [notifications, setNotifications] = useState<StoredNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // تحميل الإشعارات عند التهيئة
  useEffect(() => {
    const stored = getStoredNotifications();
    setNotifications(stored);
    setUnreadCount(stored.filter(n => !n.isRead).length);
  }, []);

  // الاستماع للإشعارات الجديدة في الوقت الفعلي
  useEffect(() => {
    const handler = (event: Event) => {
      const customEvent = event as CustomEvent<StoredNotification>;
      console.log('[NotificationStore] 🔔 إشعار جديد في الوقت الفعلي:', customEvent.detail?.title);
      setNotifications(prev => {
        const updated = [customEvent.detail, ...prev].slice(0, MAX_NOTIFICATIONS);
        return updated;
      });
      setUnreadCount(prev => prev + 1);
    };

    window.addEventListener('push-notification-received', handler);
    return () => window.removeEventListener('push-notification-received', handler);
  }, []);

  // تحديد إشعار كمقروء
  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => {
      const updated = prev.map(n => n.id === id ? { ...n, isRead: true } : n);
      localStorage.setItem(NOTIFICATION_STORE_KEY, JSON.stringify(updated));
      return updated;
    });
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  // تحديد الكل كمقروء
  const markAllAsRead = useCallback(() => {
    setNotifications(prev => {
      const updated = prev.map(n => ({ ...n, isRead: true }));
      localStorage.setItem(NOTIFICATION_STORE_KEY, JSON.stringify(updated));
      return updated;
    });
    setUnreadCount(0);
  }, []);

  // حذف إشعار واحد
  const deleteNotification = useCallback((id: string) => {
    setNotifications(prev => {
      const updated = prev.filter(n => n.id !== id);
      localStorage.setItem(NOTIFICATION_STORE_KEY, JSON.stringify(updated));
      return updated;
    });
    setUnreadCount(prev => {
      const stored = getStoredNotifications();
      return stored.filter(n => !n.isRead).length;
    });
  }, []);

  // حذف كل الإشعارات
  const clearAll = useCallback(() => {
    localStorage.removeItem(NOTIFICATION_STORE_KEY);
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
  };
}

export default useNotificationStore;