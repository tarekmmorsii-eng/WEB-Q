import React, { useState } from 'react';
import { X, Plus, Bell, BellOff, Trash2, Clock, Music, Play, Upload } from 'lucide-react';
import clsx from 'clsx';
import { NotificationItem } from '../types';

interface NotificationManagerProps {
    isOpen: boolean;
    onClose: () => void;
    notifications: NotificationItem[];
    onSave: (notifications: NotificationItem[]) => void;
    t: any;
    language: string;
}

export default function NotificationManager({ isOpen, onClose, notifications, onSave, t, language }: NotificationManagerProps) {
    const isArabic = language === 'ar';
    const DAYS = [t.sunday, t.monday, t.tuesday, t.wednesday, t.thursday, t.friday, t.saturday];
    const PRESET_SOUNDS = [
        { name: t.presetIslamic, path: '/islamic_song.mp3' },
        { name: t.presetCalm, path: '/paper-slide.wav' },
    ];
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [permissionStatus, setPermissionStatus] = useState<string>(
        typeof window !== 'undefined' ? Notification.permission : 'default'
    );

    // Form state
    const [formName, setFormName] = useState('');
    const [formType, setFormType] = useState<'daily' | 'weekly'>('daily');
    const [formDays, setFormDays] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]);
    const [formTimes, setFormTimes] = useState<string[]>(['08:00']);
    const [formIsAlarm, setFormIsAlarm] = useState(false);
    const [formSound, setFormSound] = useState<string>('/islamic_song.mp3');

    const resetForm = () => {
        setFormName('');
        setFormType('daily');
        setFormDays([0, 1, 2, 3, 4, 5, 6]);
        setFormTimes(['08:00']);
        setFormIsAlarm(false);
        setFormSound('/islamic_song.mp3');
        setEditingId(null);
        setShowAddForm(false);
    };

    const handleAddTime = () => {
        setFormTimes([...formTimes, '12:00']);
    };

    const handleRemoveTime = (index: number) => {
        setFormTimes(formTimes.filter((_, i) => i !== index));
    };

    const handleTimeChange = (index: number, value: string) => {
        const newTimes = [...formTimes];
        newTimes[index] = value;
        setFormTimes(newTimes);
    };

    const toggleDay = (day: number) => {
        if (formDays.includes(day)) {
            setFormDays(formDays.filter(d => d !== day));
        } else {
            setFormDays([...formDays, day].sort());
        }
    };

    const handleSaveNotification = () => {
        if (!formName.trim() || formTimes.length === 0) return;

        const newNotification: NotificationItem = {
            id: editingId || Date.now().toString(),
            name: formName,
            isEnabled: true,
            isAlarm: formIsAlarm,
            sound: formSound,
            type: formType,
            days: formType === 'daily' ? [0, 1, 2, 3, 4, 5, 6] : formDays,
            times: formTimes,
        };

        if (editingId) {
            onSave(notifications.map(n => n.id === editingId ? newNotification : n));
        } else {
            onSave([...notifications, newNotification]);
        }

        resetForm();
    };

    const handleEdit = (notification: NotificationItem) => {
        setFormName(notification.name);
        setFormType(notification.type);
        setFormDays(notification.days);
        setFormTimes(notification.times);
        setFormIsAlarm(notification.isAlarm || false);
        setFormSound(notification.sound || '/islamic_song.mp3');
        setEditingId(notification.id);
        setShowAddForm(true);
    };

    const handleToggle = (id: string) => {
        onSave(notifications.map(n => n.id === id ? { ...n, isEnabled: !n.isEnabled } : n));
    };

    const handleDelete = (id: string) => {
        onSave(notifications.filter(n => n.id !== id));
    };

    const sendTestNotification = () => {
        if (Notification.permission === 'granted') {
            if (formIsAlarm) {
                // Dispatch event to App.tsx to trigger alarm UI
                window.dispatchEvent(new CustomEvent('triggerTestAlarm', {
                    detail: { name: formName || t.testAlarm, sound: formSound }
                }));
            }

            if ('serviceWorker' in navigator) {
                navigator.serviceWorker.ready.then(reg => {
                    reg.showNotification(formIsAlarm ? `🚨 ${t.testAlarm}` : t.testNotification, {
                        body: t.testNotificationBody,
                        icon: '/logo192.png',
                        badge: '/logo192.png',
                        tag: 'test-notification',
                        requireInteraction: formIsAlarm
                    });
                });
            } else {
                new Notification(t.testNotification, { body: t.testNotificationBody });
            }
        } else {
            alert(t.permissionRequired);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-amber-200 dark:border-slate-700">
                    <h2 className="text-xl font-bold text-amber-900 dark:text-amber-100">{t.notificationManagerTitle}</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-amber-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                    >
                        <X size={24} className="text-amber-900 dark:text-amber-100" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4">
                    {!showAddForm ? (
                        <>
                            {/* Notifications List */}
                            <div className="space-y-3 mb-4">
                                {notifications.length === 0 ? (
                                    <p className="text-center text-slate-500 dark:text-slate-400 py-8">
                                        {t.noNotifications}
                                    </p>
                                ) : (
                                    notifications.map(notification => (
                                        <div
                                            key={notification.id}
                                            className="bg-amber-50 dark:bg-slate-800 rounded-lg p-4 border border-amber-200 dark:border-slate-700"
                                        >
                                            <div className="flex items-start justify-between mb-2">
                                                <div className="flex-1">
                                                    <h3 className="font-bold text-amber-900 dark:text-amber-100 mb-1">
                                                        {notification.name}
                                                    </h3>
                                                    <p className="text-sm text-slate-600 dark:text-slate-400">
                                                        {notification.type === 'daily' ? t.daily :
                                                            notification.days.map(d => DAYS[d]).join('، ')}
                                                    </p>
                                                    <div className="flex flex-wrap gap-2 mt-2">
                                                        {notification.times.map((time, i) => (
                                                            <span
                                                                key={i}
                                                                className="inline-flex items-center gap-1 px-2 py-1 bg-amber-200 dark:bg-slate-700 rounded text-sm text-amber-900 dark:text-amber-100"
                                                            >
                                                                <Clock size={14} />
                                                                {time}
                                                            </span>
                                                        ))}
                                                        {notification.isAlarm && (
                                                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 dark:bg-red-900/30 rounded text-sm text-red-700 dark:text-red-400 font-bold border border-red-200 dark:border-red-900/50">
                                                                {t.alarmMode}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleToggle(notification.id)}
                                                        className={clsx(
                                                            "p-2 rounded-full transition-colors",
                                                            notification.isEnabled
                                                                ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                                                                : "bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400"
                                                        )}
                                                    >
                                                        {notification.isEnabled ? <Bell size={20} /> : <BellOff size={20} />}
                                                    </button>
                                                    <button
                                                        onClick={() => handleEdit(notification)}
                                                        className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /><path d="m15 5 4 4" /></svg>
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(notification.id)}
                                                        className="p-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-full hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                                                    >
                                                        <Trash2 size={20} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Add Button */}
                            <button
                                onClick={() => setShowAddForm(true)}
                                className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold flex items-center justify-center gap-2 transition-colors"
                            >
                                <Plus size={20} />
                                {t.addNotification}
                            </button>
                        </>
                    ) : (
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-amber-900 dark:text-amber-100">
                                {editingId ? t.editNotification : t.addNewNotification}
                            </h3>

                            {/* Name */}
                            <div>
                                <label className="block text-sm font-bold text-amber-900 dark:text-amber-100 mb-2">
                                    {t.notificationName}
                                </label>
                                <input
                                    type="text"
                                    value={formName}
                                    onChange={(e) => setFormName(e.target.value)}
                                    className="w-full px-4 py-2 border border-amber-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-amber-900 dark:text-amber-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                                    placeholder={t.notificationNamePlaceholder}
                                />
                            </div>

                            {/* Type */}
                            <div>
                                <label className="block text-sm font-bold text-amber-900 dark:text-amber-100 mb-2">
                                    {t.notificationType}
                                </label>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => {
                                            setFormType('daily');
                                            setFormDays([0, 1, 2, 3, 4, 5, 6]);
                                        }}
                                        className={clsx(
                                            "flex-1 py-2 rounded-lg font-bold transition-colors",
                                            formType === 'daily'
                                                ? "bg-amber-600 text-white"
                                                : "bg-amber-100 dark:bg-slate-700 text-amber-900 dark:text-amber-100"
                                        )}
                                    >
                                        {t.daily}
                                    </button>
                                    <button
                                        onClick={() => {
                                            setFormType('weekly');
                                            setFormDays([]);
                                        }}
                                        className={clsx(
                                            "flex-1 py-2 rounded-lg font-bold transition-colors",
                                            formType === 'weekly'
                                                ? "bg-amber-600 text-white"
                                                : "bg-amber-100 dark:bg-slate-700 text-amber-900 dark:text-amber-100"
                                        )}
                                    >
                                        {t.weekly}
                                    </button>
                                </div>
                            </div>

                            {/* Days (for weekly) */}
                            {formType === 'weekly' && (
                                <div>
                                    <label className="block text-sm font-bold text-amber-900 dark:text-amber-100 mb-2">
                                        {t.selectDays}
                                    </label>
                                    <div className="grid grid-cols-4 gap-2">
                                        {DAYS.map((day, index) => (
                                            <button
                                                key={index}
                                                onClick={() => toggleDay(index)}
                                                className={clsx(
                                                    "py-2 rounded-lg text-sm font-bold transition-colors",
                                                    formDays.includes(index)
                                                        ? "bg-amber-600 text-white"
                                                        : "bg-amber-100 dark:bg-slate-700 text-amber-900 dark:text-amber-100"
                                                )}
                                            >
                                                {day}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Times */}
                            <div>
                                <label className="block text-sm font-bold text-amber-900 dark:text-amber-100 mb-2">
                                    {t.notificationTimes}
                                </label>
                                <div className="space-y-2">
                                    {formTimes.map((time, index) => (
                                        <div key={index} className="flex gap-2">
                                            <input
                                                type="time"
                                                value={time}
                                                onChange={(e) => handleTimeChange(index, e.target.value)}
                                                className="flex-1 px-4 py-2 border border-amber-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-amber-900 dark:text-amber-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                                            />
                                            {formTimes.length > 1 && (
                                                <button
                                                    onClick={() => handleRemoveTime(index)}
                                                    className="p-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                                                >
                                                    <Trash2 size={20} />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                    <button
                                        onClick={handleAddTime}
                                        className="w-full py-2 bg-amber-100 dark:bg-slate-700 text-amber-900 dark:text-amber-100 rounded-lg font-bold hover:bg-amber-200 dark:hover:bg-slate-600 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Plus size={16} />
                                        {t.addAnotherTime}
                                    </button>
                                </div>
                            </div>

                            {/* Sound Selection */}
                            <div className="space-y-3">
                                <label className="block text-sm font-bold text-amber-900 dark:text-amber-100">
                                    {t.notificationSound}
                                </label>
                                <div className="grid grid-cols-1 gap-2">
                                    <div className="flex gap-2">
                                        <select
                                            value={formSound.startsWith('data:') ? 'custom' : formSound}
                                            onChange={(e) => {
                                                if (e.target.value !== 'custom') {
                                                    setFormSound(e.target.value);
                                                }
                                            }}
                                            className="flex-1 px-4 py-2 border border-amber-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-amber-900 dark:text-amber-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                                        >
                                            {PRESET_SOUNDS.map(s => (
                                                <option key={s.path} value={s.path}>{s.name}</option>
                                            ))}
                                            {formSound.startsWith('data:') && (
                                                <option value="custom">{t.customSound}</option>
                                            )}
                                        </select>
                                        <button
                                            onClick={() => {
                                                const audio = new Audio(formSound);
                                                audio.play().catch((err) => {
                                                    console.error("Preview play error:", err);
                                                    alert(t.errorPlayingSound);
                                                });
                                            }}
                                            className="p-2 bg-amber-100 dark:bg-slate-700 text-amber-900 dark:text-amber-100 rounded-lg hover:bg-amber-200"
                                            title={t.previewSound}
                                        >
                                            <Play size={20} />
                                        </button>
                                    </div>

                                    <label className="flex items-center justify-center gap-2 w-full py-2 border-2 border-dashed border-amber-300 dark:border-slate-600 rounded-lg bg-amber-50/50 dark:bg-slate-800/50 text-amber-900 dark:text-amber-100 cursor-pointer hover:bg-amber-100 transition-colors text-sm font-bold">
                                        <Upload size={16} />
                                        {t.uploadCustomSound}
                                        <input
                                            type="file"
                                            accept="audio/*"
                                            className="hidden"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    const reader = new FileReader();
                                                    reader.onload = (ev) => {
                                                        const dataUrl = ev.target?.result as string;
                                                        setFormSound(dataUrl);
                                                    };
                                                    reader.readAsDataURL(file);
                                                }
                                            }}
                                        />
                                    </label>
                                </div>
                            </div>

                            {/* Alarm Mode Toggle */}
                            <div className="py-3 px-4 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-lg">
                                <label className="flex items-center justify-between cursor-pointer">
                                    <div className="flex items-center gap-2">
                                        <Bell size={20} className="text-red-600 dark:text-red-400" />
                                        <div>
                                            <span className="block font-bold text-red-900 dark:text-red-100">{t.enableAlarmMode}</span>
                                            <span className="text-xs text-red-700/70 dark:text-red-400/70">{t.alarmModeDescription}</span>
                                        </div>
                                    </div>
                                    <input
                                        type="checkbox"
                                        className="w-5 h-5 text-red-600 rounded focus:ring-red-500"
                                        checked={formIsAlarm}
                                        onChange={(e) => setFormIsAlarm(e.target.checked)}
                                    />
                                </label>
                            </div>

                            {/* Browser Notification Toggle */}
                            <div className="pt-4 border-t border-amber-200 dark:border-slate-700">
                                <h4 className="text-sm font-bold text-amber-900 dark:text-amber-100 mb-3">
                                    {t.deliveryMethod}
                                </h4>
                                <label className="flex items-center justify-between p-3 bg-amber-50 dark:bg-slate-800/50 rounded-lg cursor-pointer hover:bg-amber-100 dark:hover:bg-slate-700 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-full ${permissionStatus === 'granted' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                                            <Bell size={20} />
                                        </div>
                                        <div>
                                            <span className="block font-bold text-amber-900 dark:text-slate-100">
                                                {t.browserNotificationTitle}
                                            </span>
                                            <span className="text-xs text-slate-500 dark:text-slate-400">
                                                {permissionStatus === 'granted' ? t.notificationActive :
                                                    permissionStatus === 'denied' ? t.notificationBlocked :
                                                        t.browserNotificationDescription}
                                            </span>
                                        </div>
                                    </div>
                                    <input
                                        type="checkbox"
                                        className="w-5 h-5 text-amber-600 rounded focus:ring-amber-500"
                                        checked={permissionStatus === 'granted'}
                                        onChange={async (e) => {
                                            if (e.target.checked) {
                                                if (!('Notification' in window)) {
                                                    alert('Browser does not support notifications');
                                                    return;
                                                }
                                                const permission = await Notification.requestPermission();
                                                setPermissionStatus(permission);
                                                if (permission !== 'granted') {
                                                    alert(t.permissionRequired);
                                                }
                                            }
                                        }}
                                    />
                                </label>

                                {permissionStatus === 'granted' && (
                                    <button
                                        onClick={sendTestNotification}
                                        className="mt-3 w-full py-2 border-2 border-dashed border-green-500 text-green-600 dark:text-green-400 rounded-lg text-sm font-bold hover:bg-green-50 dark:hover:bg-green-900/10 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Bell size={16} />
                                        {t.sendTestNotification}
                                    </button>
                                )}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={handleSaveNotification}
                                    disabled={!formName.trim() || formTimes.length === 0 || (formType === 'weekly' && formDays.length === 0)}
                                    className="flex-1 py-3 bg-green-600 hover:bg-green-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white rounded-lg font-bold transition-colors disabled:cursor-not-allowed"
                                >
                                    {t.save}
                                </button>
                                <button
                                    onClick={resetForm}
                                    className="flex-1 py-3 bg-slate-300 dark:bg-slate-700 hover:bg-slate-400 dark:hover:bg-slate-600 text-slate-900 dark:text-slate-100 rounded-lg font-bold transition-colors"
                                >
                                    {t.cancel}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
