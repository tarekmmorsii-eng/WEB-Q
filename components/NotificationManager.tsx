import React, { useState } from 'react';
import { X, Plus, Bell, BellOff, Trash2, Clock, Music, Play, Upload } from 'lucide-react';
import clsx from 'clsx';
import { NotificationItem } from '../types';
import { SURAHS } from '../constants/surahData';
import { JUZ_SECTIONS } from '../constants';
import { getAyahPage, getPageAyahRange, getSurahsForPages } from '../services/quranService';

interface NotificationManagerProps {
    isOpen: boolean;
    onClose: () => void;
    notifications: NotificationItem[];
    onSave: (notifications: NotificationItem[]) => void;
    onNavigate?: (page: number, ayahNumber?: number, surahNumber?: number) => void;
    t: any;
    language: string;
}

function SurahListSummary({ startPage, endPage, language }: { startPage: number, endPage: number, language: string }) {
    const [summary, setSummary] = React.useState<string>('');

    React.useEffect(() => {
        getSurahsForPages(startPage, endPage, language).then(setSummary);
    }, [startPage, endPage, language]);

    if (!summary) return null;
    return <span className="block italic text-[10px] opacity-70 mt-0.5">({summary})</span>;
}

export default function NotificationManager({ isOpen, onClose, notifications, onSave, onNavigate, t, language }: NotificationManagerProps) {
    const isArabic = language === 'ar';
    const DAYS = [t.sunday, t.monday, t.tuesday, t.wednesday, t.thursday, t.friday, t.saturday];
    const PRESET_SOUNDS = [
        { name: t.presetIslamic, path: '/islamic_song.mp3' },
        { name: t.presetCalm, path: '/paper-slide.wav' },
    ];
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [permissionStatus, setPermissionStatus] = useState<string>(
        typeof window !== 'undefined' && typeof Notification !== 'undefined' ? Notification.permission : 'default'
    );

    // Form state
    const [formName, setFormName] = useState('');
    const [formType, setFormType] = useState<'daily' | 'weekly'>('daily');
    const [formDays, setFormDays] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]);
    const [formTimes, setFormTimes] = useState<string[]>(['08:00']);
    const [formIsAlarm, setFormIsAlarm] = useState(true);
    const [formSound, setFormSound] = useState<string>('/islamic_song.mp3');

    // New State for Enhanced Types
    // New State for Enhanced Types
    const [formCategory, setFormCategory] = useState<'text' | 'surah' | 'quran_part' | 'page'>('text');
    const [formSurahNumber, setFormSurahNumber] = useState<number>(1);
    const [formJuz, setFormJuz] = useState<number>(1);
    const [formHizb, setFormHizb] = useState<number>(1);
    const [formRub, setFormRub] = useState<number>(1);

    // Ranges
    const [formStartPage, setFormStartPage] = useState<number>(1);
    const [formEndPage, setFormEndPage] = useState<number>(1);
    const [formStartAyah, setFormStartAyah] = useState<number>(1);
    const [formEndAyah, setFormEndAyah] = useState<number>(7); // Default Fatiha

    // Unified handle helpers to avoid loops
    const updatePagesFromAyahs = async (surah: number, startA: number, endA: number) => {
        try {
            const startP = await getAyahPage(surah, startA);
            const endP = await getAyahPage(surah, endA);
            setFormStartPage(startP);
            setFormEndPage(endP);
        } catch (e) { console.error(e); }
    };

    const updateAyahsFromPages = async (surah: number, startP: number, endP: number) => {
        try {
            const startR = await getPageAyahRange(surah, startP);
            const endR = await getPageAyahRange(surah, endP);
            if (startR) setFormStartAyah(startR.start);
            if (endR) setFormEndAyah(endR.end);
        } catch (e) { console.error(e); }
    };

    const getSectionText = (type: 'juz' | 'hizb' | 'rub', val: number) => {
        let idx = 0;
        if (type === 'juz') idx = (val - 1) * 8;
        else if (type === 'hizb') idx = (val - 1) * 4;
        else idx = val - 1;

        const section = JUZ_SECTIONS[idx];
        if (!section) return '';

        // Return the verse snippet (matla')
        return section.text;
    };


    const resetForm = () => {
        setFormName('');
        setFormType('daily');
        setFormDays([0, 1, 2, 3, 4, 5, 6]);
        setFormTimes(['08:00']);
        setFormIsAlarm(true);
        setFormSound('/islamic_song.mp3');

        // Reset new fields
        // Reset new fields
        setFormCategory('text');
        setFormSurahNumber(1);
        setFormJuz(1);
        setFormHizb(1);
        setFormRub(1);
        setFormStartPage(1);
        setFormEndPage(1);
        setFormStartAyah(1);
        setFormEndAyah(7);

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
            category: formCategory,
            metadata: {
                surahNumber: formCategory === 'surah' ? formSurahNumber : undefined,
                juz: formCategory === 'quran_part' ? formJuz : undefined,
                hizb: formCategory === 'quran_part' ? formHizb : undefined,
                rub: formCategory === 'quran_part' ? formRub : undefined,
                // Page & Ranges
                page: formCategory === 'page' ? formStartPage : undefined, // Legacy support
                startPage: formStartPage,
                endPage: formEndPage,
                startAyah: formCategory === 'surah' ? formStartAyah : undefined,
                endAyah: formCategory === 'surah' ? formEndAyah : undefined
            }
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

        // Load enhanced fields
        // Load enhanced fields
        setFormCategory(notification.category || 'text');
        setFormSurahNumber(notification.metadata?.surahNumber || 1);
        setFormJuz(notification.metadata?.juz || 1);
        setFormHizb(notification.metadata?.hizb || 1);
        setFormRub(notification.metadata?.rub || 1);

        // Ranges
        setFormStartPage(notification.metadata?.startPage || notification.metadata?.page || 1);
        setFormEndPage(notification.metadata?.endPage || notification.metadata?.page || 1);
        setFormStartAyah(notification.metadata?.startAyah || 1);
        setFormEndAyah(notification.metadata?.endAyah || 1);

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
        const notifPermission = typeof Notification !== 'undefined' ? Notification.permission : 'default';
        if (notifPermission === 'granted') {
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
            } else if (typeof Notification !== 'undefined') {
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
                                            className="bg-amber-50 dark:bg-slate-800 rounded-lg p-4 border border-amber-200 dark:border-slate-700 transition-all"
                                        >
                                            <div className="flex items-start justify-between mb-2">
                                                <div className="flex-1">
                                                    <h3
                                                        onClick={() => {
                                                            if (onNavigate && notification.metadata) {
                                                                const page = notification.metadata.startPage || notification.metadata.page || 1;
                                                                const ayah = notification.metadata.startAyah;
                                                                const surah = notification.metadata.surahNumber;
                                                                onNavigate(page, ayah, surah);
                                                                onClose();
                                                            }
                                                        }}
                                                        className={clsx(
                                                            "font-bold text-amber-900 dark:text-amber-100 mb-1 transition-all inline-block",
                                                            onNavigate && "cursor-pointer hover:text-amber-600 dark:hover:text-amber-400 hover:underline"
                                                        )}
                                                    >
                                                        {notification.name}
                                                    </h3>
                                                    <p className="text-sm text-slate-600 dark:text-slate-400">
                                                        {notification.category === 'surah' && notification.metadata ? (
                                                            <span className="block text-amber-700 dark:text-amber-300 mb-1">
                                                                {notification.metadata.startAyah && notification.metadata.endAyah ?
                                                                    `${t.fromAyah} ${notification.metadata.startAyah} ${t.toAyah} ${notification.metadata.endAyah}` : ''}
                                                                {notification.metadata.startPage && notification.metadata.endPage ?
                                                                    ` (${t.page} ${notification.metadata.startPage} - ${notification.metadata.endPage})` : ''}
                                                            </span>
                                                        ) : notification.category === 'page' && notification.metadata ? (
                                                            <span className="block text-amber-700 dark:text-amber-300 mb-1">
                                                                <SurahListSummary startPage={notification.metadata.startPage!} endPage={notification.metadata.endPage!} language={language} />
                                                            </span>
                                                        ) : notification.category === 'quran_part' && notification.metadata ? (
                                                            <span className="block text-amber-700 dark:text-amber-300 mb-1">
                                                                {notification.name.includes(t.juz) ? (
                                                                    <>
                                                                        {t.hizb} {notification.metadata.hizb}، {t.surah} {t.surahNames[JUZ_SECTIONS[(notification.metadata.hizb - 1) * 4].surahNum - 1]}
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        {t.juz} {notification.metadata.juz}، {t.surah} {t.surahNames[JUZ_SECTIONS[(notification.metadata.juz - 1) * 8].surahNum - 1]}
                                                                    </>
                                                                )}
                                                            </span>
                                                        ) : null}
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
                                                        title={notification.isEnabled ? t.disableNotification || "تعطيل الإشعار" : t.enableNotification || "تفعيل الإشعار"}
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
                                                        title={t.editNotification || "تعديل الإشعار"}
                                                        className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /><path d="m15 5 4 4" /></svg>
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(notification.id)}
                                                        title={t.deleteNotification || "حذف الإشعار"}
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



                            {/* Category Selection */}
                            <div className="bg-amber-50 dark:bg-slate-800/50 p-3 rounded-lg border border-amber-200 dark:border-slate-700">
                                <label className="block text-sm font-bold text-amber-900 dark:text-amber-100 mb-2">
                                    {t.notificationCategory}
                                </label>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                    <button
                                        onClick={() => setFormCategory('text')}
                                        className={clsx(
                                            "py-2 px-1 rounded-lg text-sm font-bold transition-colors truncate",
                                            formCategory === 'text'
                                                ? "bg-amber-600 text-white"
                                                : "bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-amber-100 dark:hover:bg-slate-600"
                                        )}
                                    >
                                        {t.notificationAlert}
                                    </button>
                                    <button
                                        onClick={() => setFormCategory('surah')}
                                        className={clsx(
                                            "py-2 px-1 rounded-lg text-sm font-bold transition-colors truncate",
                                            formCategory === 'surah'
                                                ? "bg-amber-600 text-white"
                                                : "bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-amber-100 dark:hover:bg-slate-600"
                                        )}
                                    >
                                        {t.notificationSurahName}
                                    </button>
                                    <button
                                        onClick={() => setFormCategory('quran_part')}
                                        className={clsx(
                                            "py-2 px-1 rounded-lg text-sm font-bold transition-colors truncate",
                                            formCategory === 'quran_part'
                                                ? "bg-amber-600 text-white"
                                                : "bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-amber-100 dark:hover:bg-slate-600"
                                        )}
                                    >
                                        {t.notificationJuzHizb}
                                    </button>
                                    <button
                                        onClick={() => setFormCategory('page')}
                                        className={clsx(
                                            "py-2 px-1 rounded-lg text-sm font-bold transition-colors truncate",
                                            formCategory === 'page'
                                                ? "bg-amber-600 text-white"
                                                : "bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-amber-100 dark:hover:bg-slate-600"
                                        )}
                                    >
                                        {t.notificationPageNumber}
                                    </button>
                                </div>
                            </div>

                            {/* Dynamic Content based on Category */}
                            <div>
                                {formCategory === 'text' && (
                                    <div>
                                        <label className="block text-sm font-bold text-amber-900 dark:text-amber-100 mb-2">
                                            {t.notificationNameLabel}
                                        </label>
                                        <input
                                            type="text"
                                            value={formName}
                                            onChange={(e) => setFormName(e.target.value)}
                                            className="w-full px-4 py-2 border border-amber-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-amber-900 dark:text-amber-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                                            placeholder={t.notificationNamePlaceholder}
                                        />
                                    </div>
                                )}

                                {formCategory === 'surah' && (
                                    <div className="space-y-3">
                                        <div>
                                            <label className="block text-sm font-bold text-amber-900 dark:text-amber-100 mb-2">
                                                {t.notificationSelectSurah}
                                            </label>
                                            <select
                                                value={formSurahNumber}
                                                onChange={(e) => {
                                                    const sNum = parseInt(e.target.value);
                                                    setFormSurahNumber(sNum);
                                                    // Get Surah details
                                                    const surah = SURAHS.find(s => s.number === sNum);
                                                    if (surah) {
                                                        const sName = t.surahNames[sNum - 1];
                                                        setFormName(`${t.surahPrefix} ${sName}`);

                                                        // Important: Update dependent fields immediately to avoid stale state in UI
                                                        setFormStartAyah(1);
                                                        setFormEndAyah(surah.ayahCount);
                                                        setFormStartPage(surah.startPage);

                                                        // Calculate end page
                                                        const nextSurah = SURAHS.find(s => s.number === sNum + 1);
                                                        const endP = nextSurah ? nextSurah.startPage - (nextSurah.startPage > surah.startPage ? 1 : 0) : 604;
                                                        const actualEndPage = endP < surah.startPage ? surah.startPage : endP;
                                                        setFormEndPage(actualEndPage);
                                                    }
                                                }}
                                                className="w-full px-4 py-2 border border-amber-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-amber-900 dark:text-amber-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                                            >
                                                {SURAHS.map(surah => (
                                                    <option key={surah.number} value={surah.number}>
                                                        {surah.number}. {t.surahNames[surah.number - 1]}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            {/* Page Range */}
                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">
                                                    {t.pageNumbersRange}
                                                </label>
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="number"
                                                        min={(() => {
                                                            const s = SURAHS.find(s => s.number === formSurahNumber);
                                                            return s ? s.startPage : 1;
                                                        })()}
                                                        max={(() => {
                                                            const s = SURAHS.find(s => s.number === formSurahNumber);
                                                            if (!s) return 604;
                                                            const nextS = SURAHS.find(ns => ns.number === formSurahNumber + 1);
                                                            return nextS ? nextS.startPage - (nextS.startPage > s.startPage ? 1 : 0) : 604;
                                                        })()}
                                                        value={formStartPage}
                                                        onChange={(e) => {
                                                            const val = parseInt(e.target.value) || 0;
                                                            setFormStartPage(val);
                                                            updateAyahsFromPages(formSurahNumber, val, formEndPage);
                                                        }}
                                                        onBlur={() => {
                                                            const s = SURAHS.find(s => s.number === formSurahNumber);
                                                            const minP = s ? s.startPage : 1;
                                                            const nextS = SURAHS.find(ns => ns.number === formSurahNumber + 1);
                                                            const maxP = nextS ? nextS.startPage - (nextS.startPage > (s?.startPage || 0) ? 1 : 0) : 604;

                                                            const val = Math.min(maxP, Math.max(minP, formStartPage || minP));
                                                            setFormStartPage(val);
                                                            // Ensure end page is at least start page on blur
                                                            if (formEndPage < val) setFormEndPage(val);
                                                        }}
                                                        className="w-full px-2 py-2 border border-amber-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-amber-900 dark:text-amber-100 text-center"
                                                    />
                                                    <span className="text-slate-400">-</span>
                                                    <div className="relative w-full">
                                                        <input
                                                            type="number"
                                                            min={formStartPage}
                                                            max={(() => {
                                                                const s = SURAHS.find(s => s.number === formSurahNumber);
                                                                if (!s) return 604;
                                                                const nextS = SURAHS.find(ns => ns.number === formSurahNumber + 1);
                                                                return nextS ? nextS.startPage - (nextS.startPage > s.startPage ? 1 : 0) : 604;
                                                            })()}
                                                            value={formEndPage}
                                                            onChange={(e) => {
                                                                const val = parseInt(e.target.value) || 0;
                                                                setFormEndPage(val);
                                                                updateAyahsFromPages(formSurahNumber, formStartPage, val);
                                                            }}
                                                            onBlur={() => {
                                                                const s = SURAHS.find(s => s.number === formSurahNumber);
                                                                const nextS = SURAHS.find(ns => ns.number === formSurahNumber + 1);
                                                                const maxP = nextS ? nextS.startPage - (nextS.startPage > (s?.startPage || 0) ? 1 : 0) : 604;

                                                                const val = Math.min(maxP, Math.max(formStartPage, formEndPage || formStartPage));
                                                                setFormEndPage(val);
                                                            }}
                                                            className={clsx(
                                                                "w-full px-2 py-2 border rounded-lg bg-white dark:bg-slate-800 text-amber-900 dark:text-amber-100 text-center",
                                                                formEndPage < formStartPage
                                                                    ? "border-red-500 ring-1 ring-red-500"
                                                                    : "border-amber-300 dark:border-slate-600"
                                                            )}
                                                        />
                                                        {formEndPage < formStartPage && (
                                                            <div className="absolute -bottom-5 left-0 right-0 text-center">
                                                                <span className="text-[10px] text-red-500 font-bold bg-white dark:bg-slate-900 px-1 rounded shadow-sm border border-red-200">
                                                                    {t.invalidRangeError}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Ayah Range */}
                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">
                                                    {t.ayahNumbersRange}
                                                </label>
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        max={(() => {
                                                            const s = SURAHS.find(s => s.number === formSurahNumber);
                                                            return s ? s.ayahCount : 1;
                                                        })()}
                                                        value={formStartAyah}
                                                        onChange={(e) => {
                                                            const val = parseInt(e.target.value) || 0;
                                                            setFormStartAyah(val);
                                                            updatePagesFromAyahs(formSurahNumber, val, formEndAyah);
                                                            // Auto-update name
                                                            const surah = SURAHS.find(s => s.number === formSurahNumber);
                                                            if (surah) {
                                                                const sName = t.surahNames[surah.number - 1];
                                                                setFormName(`${t.surahPrefix} ${sName} (${val}-${formEndAyah})`);
                                                            }
                                                        }}
                                                        onBlur={() => {
                                                            const s = SURAHS.find(s => s.number === formSurahNumber);
                                                            const maxAyah = s ? s.ayahCount : 999;
                                                            const val = Math.min(maxAyah, Math.max(1, formStartAyah || 1));
                                                            setFormStartAyah(val);
                                                            if (formEndAyah < val) setFormEndAyah(val);
                                                        }}
                                                        className="w-full px-2 py-2 border border-amber-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-amber-900 dark:text-amber-100 text-center"
                                                    />
                                                    <span className="text-slate-400">-</span>
                                                    <div className="relative w-full">
                                                        <input
                                                            type="number"
                                                            min={formStartAyah}
                                                            max={(() => {
                                                                const s = SURAHS.find(s => s.number === formSurahNumber);
                                                                return s ? s.ayahCount : 1;
                                                            })()}
                                                            value={formEndAyah}
                                                            onChange={(e) => {
                                                                const val = parseInt(e.target.value) || 0;
                                                                setFormEndAyah(val);
                                                                updatePagesFromAyahs(formSurahNumber, formStartAyah, val);
                                                                // Auto-update name
                                                                const surah = SURAHS.find(s => s.number === formSurahNumber);
                                                                if (surah) {
                                                                    const sName = t.surahNames[surah.number - 1];
                                                                    setFormName(`${t.surahPrefix} ${sName} (${formStartAyah}-${val})`);
                                                                }
                                                            }}
                                                            onBlur={() => {
                                                                const s = SURAHS.find(s => s.number === formSurahNumber);
                                                                const maxAyah = s ? s.ayahCount : 999;
                                                                const val = Math.min(maxAyah, Math.max(formStartAyah, formEndAyah || formStartAyah));
                                                                setFormEndAyah(val);
                                                            }}
                                                            className={clsx(
                                                                "w-full px-2 py-2 border rounded-lg bg-white dark:bg-slate-800 text-amber-900 dark:text-amber-100 text-center",
                                                                formEndAyah < formStartAyah
                                                                    ? "border-red-500 ring-1 ring-red-500"
                                                                    : "border-amber-300 dark:border-slate-600"
                                                            )}
                                                        />
                                                        {formEndAyah < formStartAyah && (
                                                            <div className="absolute -bottom-5 left-0 right-0 text-center">
                                                                <span className="text-[10px] text-red-500 font-bold bg-white dark:bg-slate-900 px-1 rounded shadow-sm border border-red-200">
                                                                    {t.invalidRangeError}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {formCategory === 'quran_part' && (
                                    <div>
                                        <label className="block text-sm font-bold text-amber-900 dark:text-amber-100 mb-2">
                                            {t.juzHizbRub}
                                        </label>
                                        <div className="grid grid-cols-3 gap-2">
                                            <div>
                                                <label className="text-xs text-slate-500 mb-1 block">{t.juzType}</label>
                                                <select
                                                    value={formJuz}
                                                    onChange={(e) => {
                                                        const val = parseInt(e.target.value);
                                                        setFormJuz(val);
                                                        // Sync Hizb and Rub
                                                        const newHizb = (val - 1) * 2 + 1;
                                                        const newRub = (newHizb - 1) * 4 + 1;
                                                        setFormHizb(newHizb);
                                                        setFormRub(newRub);
                                                        const sect = JUZ_SECTIONS[(val - 1) * 8];
                                                        if (sect) {
                                                            setFormName(`${t.juz} ${val} (${sect.text})`);
                                                            setFormSurahNumber(sect.surahNum || 1);
                                                            setFormStartAyah(sect.ayahNum || 1);
                                                            getAyahPage(sect.surahNum || 1, sect.ayahNum || 1).then(setFormStartPage);
                                                        }
                                                    }}
                                                    className="w-full p-2 border border-amber-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-amber-900 dark:text-amber-100"
                                                >
                                                    {[...Array(30)].map((_, i) => (
                                                        <option key={i} value={i + 1}>{i + 1}</option>
                                                    ))}
                                                </select>
                                                <span className="text-[10px] text-amber-600 italic block mt-1 px-1">
                                                    {t.surahPrefix} {t.surahNames[JUZ_SECTIONS[(formJuz - 1) * 8]?.surahNum - 1]}
                                                </span>
                                            </div>
                                            <div>
                                                <label className="text-xs text-slate-500 mb-1 block">{t.hizbType}</label>
                                                <select
                                                    value={formHizb}
                                                    onChange={(e) => {
                                                        const val = parseInt(e.target.value);
                                                        setFormHizb(val);
                                                        // Sync Juz and Rub
                                                        const newJuz = Math.ceil(val / 2);
                                                        const newRub = (val - 1) * 4 + 1;
                                                        setFormJuz(newJuz);
                                                        setFormRub(newRub);
                                                        const sect = JUZ_SECTIONS[(val - 1) * 4];
                                                        if (sect) {
                                                            setFormName(`${t.hizb} ${val} - ${t.juz} ${newJuz} (${sect.text})`);
                                                            setFormSurahNumber(sect.surahNum || 1);
                                                            setFormStartAyah(sect.ayahNum || 1);
                                                            getAyahPage(sect.surahNum || 1, sect.ayahNum || 1).then(setFormStartPage);
                                                        }
                                                    }}
                                                    className="w-full p-2 border border-amber-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-amber-900 dark:text-amber-100"
                                                >
                                                    {[...Array(60)].map((_, i) => (
                                                        <option key={i} value={i + 1}>{i + 1}</option>
                                                    ))}
                                                </select>
                                                <span className="text-[10px] text-amber-600 italic block mt-1 px-1">
                                                    {getSectionText('hizb', formHizb)}
                                                </span>
                                            </div>
                                            <div>
                                                <label className="text-xs text-slate-500 mb-1 block">{t.rubType}</label>
                                                <select
                                                    value={(formRub - 1) % 4 + 1}
                                                    onChange={(e) => {
                                                        const valWithinHizb = parseInt(e.target.value);
                                                        const absoluteRub = (formHizb - 1) * 4 + valWithinHizb;
                                                        setFormRub(absoluteRub);
                                                        const sect = JUZ_SECTIONS[absoluteRub - 1];
                                                        if (sect) {
                                                            setFormName(`${t.rub} ${valWithinHizb} - ${t.hizb} ${formHizb} (${sect.text})`);
                                                            setFormSurahNumber(sect.surahNum || 1);
                                                            setFormStartAyah(sect.ayahNum || 1);
                                                            getAyahPage(sect.surahNum || 1, sect.ayahNum || 1).then(setFormStartPage);
                                                        }
                                                    }}
                                                    className="w-full p-2 border border-amber-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-amber-900 dark:text-amber-100"
                                                >
                                                    {[1, 2, 3, 4].map(v => (
                                                        <option key={v} value={v}>{v}</option>
                                                    ))}
                                                </select>
                                                <span className="text-[10px] text-amber-600 italic block mt-1 px-1">
                                                    {getSectionText('rub', formRub)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {formCategory === 'page' && (
                                    <div>
                                        <label className="block text-sm font-bold text-amber-900 dark:text-amber-100 mb-2">
                                            {t.maxPageLabel}
                                        </label>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-xs text-slate-500 mb-1 block">{t.fromPage}</label>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    max="604"
                                                    value={formStartPage}
                                                    onChange={(e) => {
                                                        const val = parseInt(e.target.value) || 0;
                                                        setFormStartPage(val);
                                                    }}
                                                    onBlur={() => {
                                                        const val = Math.min(604, Math.max(1, formStartPage || 1));
                                                        setFormStartPage(val);
                                                        // Ensure End >= Start
                                                        if (formEndPage < val) {
                                                            setFormEndPage(val);
                                                            setFormName(`من صفحة ${val} إلى ${val}`);
                                                        } else {
                                                            setFormName(`من صفحة ${val} إلى ${formEndPage}`);
                                                        }
                                                    }}
                                                    className="w-full px-4 py-2 border border-amber-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-amber-900 dark:text-amber-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                                                    placeholder={t.startPagePlaceholder}
                                                />
                                            </div>
                                            <div className="relative">
                                                <label className="text-xs text-slate-500 mb-1 block">{t.toPage}</label>
                                                <input
                                                    type="number"
                                                    min={formStartPage}
                                                    max="604"
                                                    value={formEndPage}
                                                    onChange={(e) => {
                                                        const val = parseInt(e.target.value) || 0;
                                                        setFormEndPage(val);
                                                    }}
                                                    onBlur={() => {
                                                        const val = Math.min(604, Math.max(formStartPage, formEndPage || formStartPage));
                                                        setFormEndPage(val);
                                                        setFormName(`${t.fromPage} ${formStartPage} ${t.toPage} ${val}`);
                                                    }}
                                                    className={clsx(
                                                        "w-full px-4 py-2 border rounded-lg bg-white dark:bg-slate-800 text-amber-900 dark:text-amber-100 focus:outline-none focus:ring-2 focus:ring-amber-500",
                                                        formEndPage < formStartPage
                                                            ? "border-red-500 ring-1 ring-red-500"
                                                            : "border-amber-300 dark:border-slate-600"
                                                    )}
                                                    placeholder={t.toPage}
                                                />
                                                {formEndPage < formStartPage && (
                                                    <div className="absolute -bottom-5 left-0 right-0 text-center">
                                                        <span className="text-[10px] text-red-500 font-bold bg-white dark:bg-slate-900 px-1 rounded shadow-sm border border-red-200">
                                                            غير صحيح
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
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
                                    {editingId ? t.saveChangesAction : t.addNotificationAction}
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
