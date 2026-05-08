import { useState, useCallback, useEffect } from 'react';

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
}

const STORAGE_KEY = 'quran_in_app_notifications';
const HAS_SEEN_WELCOME_KEY = 'quran_has_seen_welcome_notification';

/**
 * الإشعارات الافتراضية التي تظهر للمستخدم الجديد
 */
const DEFAULT_NOTIFICATIONS: InAppNotification[] = [
  {
    id: 'reminder-kahf',
    title: 'سورة الكهف',
    message: 'تذكير بقراءة سورة الكهف كل يوم جمعة الساعة 10:00 صباحاً.',
    type: 'info',
    isRead: false,
    createdAt: Date.now(),
    icon: '📖',
    targetPage: 293,
  },
  {
    id: 'reminder-tabarak',
    title: 'سورة تبارك',
    message: 'تذكير بقراءة سورة الملك (تبارك) يومياً الساعة 11:00 مساءً.',
    type: 'info',
    isRead: false,
    createdAt: Date.now() - 1000,
    icon: '🌙',
    targetPage: 562,
  },
  {
    id: 'reminder-baqarah',
    title: 'سورة البقرة',
    message: 'تذكير بقراءة سورة البقرة كل يومي إثنين وخميس الساعة 4:00 عصراً.',
    type: 'info',
    isRead: false,
    createdAt: Date.now() - 2000,
    icon: '📿',
    targetPage: 2,
  },
];

/**
 * تحميل الإشعارات من localStorage
 */
function loadNotifications(): InAppNotification[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }

    // إذا لم يكن هناك إشعارات محفوظة، نضع الافتراضية
    // (فقط إذا لم يرَ المستخدم الترحيب من قبل)
    const hasSeenWelcome = localStorage.getItem(HAS_SEEN_WELCOME_KEY);
    if (!hasSeenWelcome) {
      localStorage.setItem(HAS_SEEN_WELCOME_KEY, 'true');
      saveNotifications(DEFAULT_NOTIFICATIONS);
      return DEFAULT_NOTIFICATIONS;
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

  // حفظ عند التغيير
  useEffect(() => {
    saveNotifications(notifications);
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
   * فتح نافذة الإشعارات
   */
  const openModal = useCallback(() => {
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