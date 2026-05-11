/**
 * مركز الإشعارات الخارجية (Push Notification Center)
 * يعرض سجل الإشعارات المحفوظة مع إمكانية الحذف والتحديد كمقروء
 */

import React from 'react';
import { X, Bell, BellOff, Trash2, CheckCheck, Clock } from 'lucide-react';
import { useNotificationStore } from '../hooks/useNotificationStore';
import { Language, translations, formatRelativeTime } from '../i18n/translations';

interface PushNotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  currentLanguage: Language;
}

export default function PushNotificationCenter({
  isOpen,
  onClose,
  currentLanguage,
}: PushNotificationCenterProps) {
  const t = translations[currentLanguage];
  const isRTL = t.dir === 'rtl';
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
  } = useNotificationStore();

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 z-[150] flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200"
      style={{ direction: isRTL ? 'rtl' : 'ltr' }}
    >
      <div className="bg-[var(--bg-card)] rounded-2xl shadow-2xl max-w-md w-full max-h-[85vh] flex flex-col overflow-hidden border border-[var(--border-primary)]">
        {/* Header */}
        <div className="bg-purple-50 dark:bg-purple-900/20 border-b border-purple-200 dark:border-purple-800/30 p-4 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-800/60 rounded-full">
              <Bell size={20} className="text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-purple-800 dark:text-purple-200">
                {t.pushNotifCenterTitle || 'مركز الإشعارات'}
              </h2>
              {unreadCount > 0 && (
                <span className="text-xs text-purple-600 dark:text-purple-400">
                  {unreadCount} {t.pushNotifUnread || 'unread'}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-purple-100 dark:hover:bg-purple-800/40 rounded-full transition-colors"
          >
            <X size={20} className="text-purple-600 dark:text-purple-400" />
          </button>
        </div>

        {/* Action Bar */}
        {notifications.length > 0 && (
          <div className="flex items-center justify-between px-4 py-2 bg-[var(--bg-secondary)] border-b border-[var(--border-primary)]">
            <button
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
              className="flex items-center gap-1.5 text-xs font-medium text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 disabled:opacity-40 transition-colors"
            >
              <CheckCheck size={14} />
              {t.pushNotifMarkAllRead || 'تحديد الكل كمقروء'}
            </button>
            <button
              onClick={clearAll}
              className="flex items-center gap-1.5 text-xs font-medium text-red-500 hover:text-red-700 dark:hover:text-red-400 transition-colors"
            >
              <Trash2 size={14} />
              {t.pushNotifClearAll || 'حذف الكل'}
            </button>
          </div>
        )}

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center gap-4">
              <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-full">
                <BellOff size={40} className="text-gray-400 dark:text-gray-500" />
              </div>
              <div>
                <p className="font-medium text-[var(--text-primary)] opacity-70">
                  {t.pushNotifEmpty || 'لا توجد إشعارات بعد'}
                </p>
                <p className="text-xs text-[var(--text-primary)] opacity-50 mt-1">
                  {t.pushNotifEmptyDesc || 'ستظهر الإشعارات الخارجية هنا عند استلامها'}
                </p>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-[var(--border-primary)]">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => markAsRead(notif.id)}
                  className={`p-4 transition-all cursor-pointer hover:bg-[var(--bg-secondary)] ${
                    !notif.isRead ? 'bg-purple-50/50 dark:bg-purple-900/10 border-s-4 border-purple-500' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        {!notif.isRead && (
                          <span className="w-2 h-2 bg-purple-500 rounded-full shrink-0 animate-pulse" />
                        )}
                        <h4 className={`text-sm font-bold text-[var(--text-primary)] truncate ${!notif.isRead ? '' : 'opacity-70'}`}>
                          {notif.title}
                        </h4>
                      </div>
                      {notif.body && (
                        <p className="text-xs text-[var(--text-primary)] opacity-60 mt-1 line-clamp-2 leading-relaxed">
                          {notif.body}
                        </p>
                      )}
                      <div className="flex items-center gap-1 mt-2">
                        <Clock size={10} className="text-gray-400" />
                        <span className="text-[10px] text-gray-400">
                          {formatRelativeTime(notif.timestamp, currentLanguage)}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(notif.id);
                      }}
                      className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors shrink-0"
                      title={t.pushNotifDelete || 'حذف'}
                    >
                      <Trash2 size={14} className="text-red-400 hover:text-red-600" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-[var(--border-primary)] bg-[var(--bg-secondary)] text-center shrink-0">
          <p className="text-[10px] text-[var(--text-primary)] opacity-40">
            {t.pushNotifFooterSaved || 'Last 20 notifications saved'} • {notifications.length} {t.pushNotifFooterInLog || 'in log'}
          </p>
        </div>
      </div>
    </div>
  );
}