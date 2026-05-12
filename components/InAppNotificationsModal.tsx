import React from 'react';
import { X, Bell, BellOff, CheckCheck, Trash2, Info, Lightbulb, Sparkles, Gift, Megaphone, Settings } from 'lucide-react';
import clsx from 'clsx';
import { InAppNotification } from '../hooks/useNotifications';
import { formatRelativeTime, Language } from '../i18n/translations';

interface InAppNotificationsModalProps {
    isOpen: boolean;
    onClose: () => void;
    notifications: InAppNotification[];
    unreadCount: number;
    onMarkAsRead: (id: string) => void;
    onMarkAllAsRead: () => void;
    onDeleteNotification: (id: string) => void;
    onClearAll: () => void;
    language: string;
    onOpenAlarmSettings?: () => void;
    onNavigateToPage?: (page: number) => void;
    t: any;
}

/**
 * الحصول على أيقونة نوع الإشعار
 */
const getTypeIcon = (type: InAppNotification['type'], customIcon?: string) => {
    if (customIcon) {
        return <span className="text-lg">{customIcon}</span>;
    }
    switch (type) {
        case 'info': return <Info size={18} />;
        case 'tip': return <Lightbulb size={18} />;
        case 'update': return <Megaphone size={18} />;
        case 'welcome': return <Sparkles size={18} />;
        case 'achievement': return <Gift size={18} />;
        default: return <Bell size={18} />;
    }
};

/**
 * الحصول على لون نوع الإشعار
 */
const getTypeColor = (type: InAppNotification['type']) => {
    switch (type) {
        case 'info': return 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400';
        case 'tip': return 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400';
        case 'update': return 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400';
        case 'welcome': return 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400';
        case 'achievement': return 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400';
        default: return 'bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400';
    }
};


export default function InAppNotificationsModal({
    isOpen,
    onClose,
    notifications,
    unreadCount,
    onMarkAsRead,
    onMarkAllAsRead,
    onDeleteNotification,
    onClearAll,
    language,
    onOpenAlarmSettings,
    onNavigateToPage,
    t,
}: InAppNotificationsModalProps) {
    if (!isOpen) return null;

    const isRTL = language === 'ar' || language === 'fa' || language === 'ur';

    // ⭐ حل مفاتيح الترجمة - إذا كان العنوان/الرسالة مفتاح ترجمة (يحتوي على _) استخدمه
    const resolveText = (text: string, notification?: InAppNotification): string => {
        let resolved = text;
        if (t && t[text]) resolved = t[text];

        // استبدال {surahName} باسم السورة من المصدر الأصلي t.surahNames
        if (notification?.surahNumber && t?.surahNames) {
            const surahName = t.surahNames[notification.surahNumber - 1] || '';
            resolved = resolved.replace('{surahName}', surahName);
        }

        return resolved;
    };

    // ⭐ حذف الإشعار تلقائياً عند الضغط والانتقال للصفحة المطلوبة
    const handleNotificationClick = (notification: InAppNotification) => {
        if (notification.targetPage && onNavigateToPage) {
            onNavigateToPage(notification.targetPage);
            onDeleteNotification(notification.id);
            onClose();
        } else {
            onMarkAsRead(notification.id);
        }
    };

    return (
        <div
            className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200"
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div
                className={clsx(
                    "bg-[var(--bg-card)] rounded-2xl shadow-2xl w-full flex flex-col overflow-hidden border border-[var(--border-primary)]",
                    "max-w-md max-h-[85vh] animate-in zoom-in-95 slide-in-from-bottom-4 duration-300"
                )}
            >
                {/* Header */}
                <div className="bg-[var(--bg-secondary)] border-b border-[var(--border-primary)] p-4 flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Bell size={22} className="text-amber-600" />
                            {unreadCount > 0 && (
                                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center animate-pulse">
                                    {unreadCount > 9 ? '9+' : unreadCount}
                                </span>
                            )}
                        </div>
                        <h2 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
                            {t.inAppNotifModalTitle}
                            {onOpenAlarmSettings && (
                                <button
                                    onClick={onOpenAlarmSettings}
                                    className="p-1.5 rounded-full hover:bg-[var(--bg-primary)] transition-colors group"
                                    title={t.notificationManagerTitle}
                                >
                                    <Settings size={16} className="text-[var(--text-primary)] opacity-40 group-hover:opacity-80 group-hover:rotate-90 transition-all duration-300" />
                                </button>
                            )}
                        </h2>
                        {unreadCount > 0 && (
                            <span className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                {unreadCount} {t.inAppNotifNewBadge}
                            </span>
                        )}
                    </div>

                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-[var(--bg-primary)] rounded-full transition-colors"
                    >
                        <X size={20} className="text-[var(--text-primary)] opacity-60 hover:opacity-100" />
                    </button>
                </div>

                {/* Actions Bar */}
                {notifications.length > 0 && (
                    <div className={clsx(
                        "flex items-center gap-2 px-4 py-2 border-b border-[var(--border-primary)] bg-[var(--bg-secondary)]/50 shrink-0",
                        isRTL ? "flex-row-reverse" : ""
                    )}>
                        {unreadCount > 0 && (
                            <button
                                onClick={onMarkAllAsRead}
                                className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 transition-colors"
                            >
                                <CheckCheck size={14} />
                                <span>{t.inAppNotifMarkAllRead}</span>
                            </button>
                        )}
                        <div className="flex-1" />
                        {notifications.length > 0 && (
                            <button
                                onClick={onClearAll}
                                className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-600 transition-colors"
                            >
                                <Trash2 size={14} />
                                <span>{t.inAppNotifClearAll}</span>
                            </button>
                        )}
                    </div>
                )}

                {/* Notifications List */}
                <div className="flex-1 overflow-y-auto min-h-0">
                    {notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                            <div className="w-16 h-16 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center mb-4">
                                <BellOff size={28} className="text-[var(--text-primary)] opacity-30" />
                            </div>
                            <p className="text-[var(--text-primary)] font-medium text-sm mb-1">
                                {t.inAppNotifEmpty}
                            </p>
                            <p className="text-[var(--text-primary)] opacity-50 text-xs">
                                {t.inAppNotifEmptyDesc}
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y divide-[var(--border-primary)]">
                            {[...notifications].sort((a, b) => b.createdAt - a.createdAt).map((notification) => (
                                <div
                                    key={notification.id}
                                    onClick={() => handleNotificationClick(notification)}
                                    className={clsx(
                                        "relative p-4 transition-all duration-200 cursor-pointer group",
                                        notification.isRead
                                            ? "bg-[var(--bg-card)] hover:bg-[var(--bg-secondary)]/50"
                                            : "bg-amber-50/50 dark:bg-amber-900/10 hover:bg-amber-100/50 dark:hover:bg-amber-900/20"
                                    )}
                                >
                                    {/* Unread indicator dot */}
                                    {!notification.isRead && (
                                        <div className="absolute top-4 right-3 w-2.5 h-2.5 bg-blue-500 rounded-full shadow-sm shadow-blue-500/50" />
                                    )}

                                    <div className={clsx("flex gap-3", isRTL ? "flex-row" : "flex-row")}>
                                        {/* Icon */}
                                        <div className={clsx(
                                            "w-9 h-9 rounded-full flex items-center justify-center shrink-0",
                                            getTypeColor(notification.type)
                                        )}>
                                            {getTypeIcon(notification.type, notification.icon)}
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <h3 className={clsx(
                                                "text-sm mb-0.5 leading-tight",
                                                notification.isRead
                                                    ? "text-[var(--text-primary)] opacity-70 font-medium"
                                                    : "text-[var(--text-primary)] font-bold"
                                            )}>
                                                {resolveText(notification.title, notification)}
                                            </h3>
                                            <p className="text-xs text-[var(--text-primary)] opacity-60 leading-relaxed">
                                                {resolveText(notification.message, notification)}
                                            </p>
                                            <span className="text-[10px] text-[var(--text-primary)] opacity-40 mt-1 inline-block">
                                                {formatRelativeTime(notification.createdAt, language as Language)}
                                            </span>
                                        </div>

                                        {/* Delete button */}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onDeleteNotification(notification.id);
                                            }}
                                            className="opacity-0 group-hover:opacity-60 hover:!opacity-100 p-1.5 rounded-full hover:bg-red-100 dark:hover:bg-red-900/30 transition-all shrink-0 self-center"
                                        >
                                            <Trash2 size={14} className="text-red-500" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}