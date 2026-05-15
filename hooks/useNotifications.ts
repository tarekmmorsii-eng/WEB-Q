import { useState, useCallback, useEffect } from 'react';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';
import { Badge } from '@capawesome/capacitor-badge';

const isNative = Capacitor.isNativePlatform();

/**
 * تحديث شارة الأيقونة الخارجية (App Badge)
 * يستخدم @capawesome/capacitor-badge — الحل الرسمي المدعوم
 */
async function updateAppBadge(count: number): Promise<void> {
  if (!isNative) return;
  try {
    const { isSupported } = await Badge.isSupported();
    if (!isSupported) {
      console.warn('[Badge] ⚠️ الجهاز لا يدعم الشارة');
      return;
    }
    await Badge.set({ count });
    console.log(`[Badge] ✅ تم تحديث الشارة إلى: ${count}`);
  } catch (e) {
    // بعض الأجهزة لا تدعم Badge — تسجيل للتشخيص
    console.warn('[Badge] ⚠️ تعذّر تحديث شارة التطبيق:', e);
  }
}

/**
 * واجهة الإشعار الداخلي للتطبيق
 */
export interface InAppNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'tip' | 'update' | 'welcome' | 'achievement';
  isRead: boolean;
  createdAt: number;
  icon?: string;
  targetPage?: number;
  surahNumber?: number; // رقم السورة لجلب الاسم من t.surahNames تلقائياً
  ayahNumber?: number; // رقم الآية للتظليل
  data?: any; // أي بيانات إضافية (مثل metadata الخاصة بالمنبهات)
}

const STORAGE_KEY = 'quran_in_app_notifications';
const HAS_SEEN_WELCOME_KEY = 'quran_has_seen_welcome_notification';

/**
 * الإشعارات الافتراضية محذوفة بناءً على طلب ضمان نظافة السجل
 */
const DEFAULT_NOTIFICATIONS: InAppNotification[] = [];

/**
 * تحميل الإشعارات من localStorage
 */
function loadNotifications(): InAppNotification[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // تنظيف الذاكرة القديمة (حذف الإشعارات الثابتة للمستخدمين الحاليين)
        const hardcodedIds = ['reminder-kahf', 'reminder-tabarak', 'reminder-baqarah'];
        return parsed.filter(n => !hardcodedIds.includes(n.id));
      }
    }

    return [];
  } catch {
    return [];
  }
}

/**
 * حفظ الإشعارات في localStorage
 */
function saveNotifications(notifications: InAppNotification[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
  } catch (e) {
    console.warn('Failed to save notifications:', e);
  }
}

/**
 * خطاف إدارة حالة الإشعارات الداخلية
 * يوفر: notifications, unreadCount, markAsRead, markAllAsRead, isModalOpen, setIsModalOpen
 */
export function useNotifications() {
  const [notifications, setNotifications] = useState<InAppNotification[]>(() => loadNotifications());
  const [isModalOpen, setIsModalOpen] = useState(false);

  // حساب عدد غير المقروء
  const unreadCount = notifications.filter(n => !n.isRead).length;

  // حفظ عند التغيير + تحديث شارة الأيقونة الخارجية
  useEffect(() => {
    saveNotifications(notifications);
    // ⭐ تحديث Badge على أيقونة التطبيق
    const unread = notifications.filter(n => !n.isRead).length;
    updateAppBadge(unread);
  }, [notifications]);

  /**
   * تحديد إشعار كمقروء
   */
  const markAsRead = useCallback((id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, isRead: true } : n)
    );
  }, []);

  /**
   * تحديد جميع الإشعارات كمقروءة
   */
  const markAllAsRead = useCallback(() => {
    setNotifications(prev =>
      prev.map(n => ({ ...n, isRead: true }))
    );
  }, []);

  /**
   * حذف إشعار
   */
  const deleteNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  /**
   * مسح جميع الإشعارات
   */
  const clearAll = useCallback(() => {
    setNotifications([]);
    // ⭐ تصفير Badge
    updateAppBadge(0);
  }, []);

  /**
   * إضافة إشعار جديد
   */
  const addNotification = useCallback((notification: Omit<InAppNotification, 'id' | 'createdAt'>) => {
    const newNotification: InAppNotification = {
      ...notification,
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: Date.now(),
    };
    setNotifications(prev => [newNotification, ...prev]);
  }, []);

  /**
   * فتح نافذة الإشعارات مع التصفير التلقائي
   * ⭐ عند الفتح: تحديد كل الإشعارات كمقروءة + تصفير شارة التطبيق
   */
  const openModal = useCallback(() => {
    // ⭐ تصفير العدادات تلقائياً عند فتح النافذة
    setNotifications(prev => {
      const hasUnread = prev.some(n => !n.isRead);
      if (hasUnread) {
        const updated = prev.map(n => ({ ...n, isRead: true }));
        saveNotifications(updated);
        // ⭐ تصفير شارة أيقونة التطبيق فوراً
        updateAppBadge(0);
        return updated;
      }
      return prev;
    });
    setIsModalOpen(true);
  }, []);

  /**
   * إغلاق نافذة الإشعارات
   */
  const closeModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  return {
    notifications,
    unreadCount,
    isModalOpen,
    setIsModalOpen,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    addNotification,
    openModal,
    closeModal,
  };
}