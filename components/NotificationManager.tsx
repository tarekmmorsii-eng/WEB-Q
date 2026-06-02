import React, { useState, useRef } from 'react';
import { X, Plus, Bell, BellOff, Trash2, Clock, Music, Play, Pause, Upload, Calendar } from 'lucide-react';
import clsx from 'clsx';
import { NotificationItem } from '../types';
import { SURAHS } from '../constants/surahData';
import { JUZ_SECTIONS } from '../constants';
import { getAyahPage, getPageAyahRange, getSurahsForPages } from '../services/quranService';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';
import { formatTimeLocalized } from '../i18n/translations';
import { usePushNotifications } from '../hooks/usePushNotifications';
import { Badge } from '@capawesome/capacitor-badge';
import { NativeSettings, AndroidSettings } from 'capacitor-native-settings';

const isNative = Capacitor.isNativePlatform();

/** Bulletproof: force Eastern Arabic numerals (٠١٢٣٤٥٦٧٨٩) regardless of browser locale */
const forceArabicNumerals = (num: number | string): string => {
    const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    return String(num).replace(/[0-9]/g, (w) => arabicDigits[Number(w)]);
};

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

    // ⭐ هوك الإشعارات الخارجية (Firebase Push) - لربطه بالإشعارات الداخلية
    // ⭐ يتم تمرير اللغة لربط التوكن بها (Localization Routing)
    const {
        requestPermission: requestPushPermission,
        permissionStatus: pushPermissionStatus,
        isPushSupported,
        fcmToken
    } = usePushNotifications({ language: language as any });

    // ⭐ حل أسماء المنبهات مع دعم i18n الديناميكي
    const resolveName = (name: string, surahNumber?: number): string => {
        // 🎯 الأولوية المطلقة: إذا كان هناك surahNumber، اجلب الاسم المترجم ديناميكياً من لغة المستخدم
        // هذا يضمن أن المستخدم الصيني يرى الاسم بالصينية، والروسي بالروسية، إلخ
        if (surahNumber && surahNumber >= 1 && surahNumber <= 114) {
            const translatedName = t?.surahNames?.[surahNumber - 1];
            if (translatedName) return translatedName;
        }
        // 🎯 Fallback: مفتاح ترجمة
        if (t && name && t[name]) return t[name];
        // 🎯 Fallback أخير: الاسم المحفوظ
        return name;
    };

    // ⭐ Helper: جلب اسم السورة المترجم بأمان مع fallback مضمون 100%
    const getSurahName = (surahNum: number | undefined): string => {
        if (!surahNum || surahNum < 1 || surahNum > 114) return '';
        
        // الطريقة 1: محاولة جلب الاسم من مصفوفة surahNames في كائن الترجمة
        try {
            const names = t?.surahNames;
            if (Array.isArray(names) && names.length >= surahNum && names[surahNum - 1]) {
                return names[surahNum - 1];
            }
        } catch (e) {
            // تجاهل أي خطأ
        }
        
        // الطريقة 2: Fallback مضمون - استخدام مصفوفة SURAHS الثابتة (أسماء عربية)
        const surahData = SURAHS.find(s => s.number === surahNum);
        if (surahData?.name) {
            return surahData.name;
        }
        
        // الطريقة 3: آخر احتياط - عرض رقم السورة
        return `${t?.surah || 'Surah'} ${surahNum}`;
    };

    // Bulletproof localized number: forces Eastern Arabic numerals (٠١٢٣٤٥٦٧٨٩) in Arabic, standard otherwise
    const ln = (num: number): string => isArabic ? forceArabicNumerals(num) : String(num);

    // Helper to parse localized number input back to standard number
    const parseLocalizedInput = (val: string): number => {
        if (!val) return 0;
        const standard = val.replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)));
        return parseInt(standard) || 0;
    };

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
    const [showBatteryModal, setShowBatteryModal] = useState(false);
    const [dontShowAgain, setDontShowAgain] = useState(false);
    const [showTokenPopup, setShowTokenPopup] = useState(false);

    // ⭐ فحص صلاحية المنبه الدقيق (SCHEDULE_EXACT_ALARM) لأندرويد 12+ (API 31+)
    // أندرويد 12+ يتطلب منح هذه الصلاحية يدوياً من الإعدادات
    const checkExactAlarmPermission = async (): Promise<boolean> => {
        if (!isNative) return true;
        try {
            const lnAny = LocalNotifications as any;
            if (typeof lnAny.canScheduleExactAlarms === 'function') {
                const result = await lnAny.canScheduleExactAlarms();
                if (!result?.value) {
                    console.warn('[NotifManager] ⚠️ صلاحية SCHEDULE_EXACT_ALARM غير ممنوحة، جاري فتح الإعدادات...');
                    if (typeof lnAny.openAlarmSettings === 'function') {
                        await lnAny.openAlarmSettings();
                    }
                    return false;
                }
                console.log('[NotifManager] ✅ صلاحية SCHEDULE_EXACT_ALARM ممنوحة');
                return true;
            }
        } catch (e) {
            console.warn('[NotifManager] ⚠️ تعذر فحص SCHEDULE_EXACT_ALARM:', e);
        }
        return true;
    };

    React.useEffect(() => {
        if (isOpen && isNative) {
            LocalNotifications.requestPermissions().then(async (status) => {
                setPermissionStatus(status.display);
                
                // ⭐ دمج تصاريح الإشعارات: إذا منح المستخدم التصريح المحلي،
                // قم بتسجيل الإشعارات الفورية (Firebase Push) تلقائياً أيضاً
                if (status.display === 'granted') {
                    // ⭐ فحص صلاحية المنبه الدقيق (Android 12+)
                    await checkExactAlarmPermission();

                    // ⭐ M1: طلب تجاهل تحسين البطارية لضمان عمل الإشعارات في الخلفية
                    try {
                        const batteryStatus = localStorage.getItem('battery_opt_status');
                        const batteryRequestedLegacy = localStorage.getItem('battery_opt_requested');
                        if (batteryStatus !== 'granted' && batteryStatus !== 'dont_show' && !batteryRequestedLegacy) {
                            // نعرض النافذة الأنيقة للمستخدم بدلاً من رسالة النظام المزعجة
                            setTimeout(() => {
                                setShowBatteryModal(true);
                            }, 1000);
                        }
                    } catch (batteryErr) {
                        console.warn('[NotifManager] ⚠️ تعذر معالجة تحسين البطارية:', batteryErr);
                    }

                    try {
                        console.log('[NotifManager] ✅ تم منح التصريح المحلي، جاري تسجيل Push Notifications...');
                        const pushResult = await requestPushPermission();
                        if (pushResult.success) {
                            console.log('[NotifManager] ✅ تم تسجيل Push Notifications بنجاح');
                        } else {
                            console.warn('[NotifManager] ⚠️ فشل تسجيل Push:', pushResult.error);
                        }
                    } catch (pushErr) {
                        console.warn('[NotifManager] ⚠️ خطأ في تسجيل Push:', pushErr);
                    }
                }
            });
        }
    }, [isOpen, requestPushPermission]);

    const scheduleNativeNotification = async (notification: NotificationItem) => {
        if (!isNative) return;

        try {
            // Cancel existing notifications for this ID group
            const baseId = parseInt(notification.id.slice(-6)) || Math.floor(Math.random() * 100000);
            
            // Cancel all possible sub-IDs for this notification
            const cancelIds: { id: number }[] = [];
            for (let i = 0; i < 7; i++) { // max 7 days
                for (let j = 0; j < notification.times.length; j++) {
                    cancelIds.push({ id: baseId + j + (i * 100) });
                }
            }
            await LocalNotifications.cancel({ notifications: cancelIds });

            if (!notification.isEnabled) return;

            // Create HIGH PRIORITY notification channel for Android
            // This is CRITICAL for heads-up notifications and sound on Android 8+
            await LocalNotifications.createChannel({
                id: 'quran_critical_alarm_v1',
                name: 'Quran Critical Alarms',
                description: 'High priority notifications for Quran reading - sound and vibration enabled',
                importance: 5, // IMPORTANCE_MAX = 5 (shows as heads-up, with sound)
                visibility: 1, // VISIBILITY_PUBLIC
                vibration: true,
                sound: 'islamic_song',
                lights: true,
                lightColor: '#D97706'
            });

            // Create a secondary channel for non-alarm notifications
            await LocalNotifications.createChannel({
                id: 'quran_regular_v1',
                name: 'Quran Reminders',
                description: 'Regular Quran reading reminders',
                importance: 4, // IMPORTANCE_HIGH = 4 (heads-up notification)
                visibility: 1,
                vibration: true,
                sound: 'paper_slide',
                lights: true,
                lightColor: '#D97706'
            });

            // Determine the best sound URI for Android (without extension for channel compatibility)
            const getNativeSound = (): string | undefined => {
                if (!notification.sound) return undefined;
                // For Android, use filenames without extensions in res/raw/
                if (notification.sound.includes('islamic_song')) return 'islamic_song';
                if (notification.sound.includes('paper-slide') || notification.sound.includes('paper_slide')) return 'paper_slide';
                // Custom data-uri sounds can't be used natively, fallback to default
                if (notification.sound.startsWith('data:')) return undefined;
                // Strip leading slash and extension for native
                const stripped = notification.sound.startsWith('/') ? notification.sound.slice(1) : notification.sound;
                return stripped.replace(/\.[^/.]+$/, ''); // remove extension
            };

            const nativeSound = getNativeSound();
            const channelId = notification.isAlarm ? 'quran_critical_alarm_v1' : 'quran_regular_v1';

            const schedules: any[] = [];
            const isOnce = notification.type === 'once' || (!notification.days || notification.days.length === 0);
            
            for (let i = 0; i < notification.times.length; i++) {
                const [hour, minute] = notification.times[i].split(':').map(Number);

                if (notification.targetDate) {
                    // 📅 Specific date alarm - schedule for that date only, no repeat
                    const [year, month, day] = notification.targetDate.split('-').map(Number);
                    const uniqueId = baseId + i;
                    schedules.push({
                        id: uniqueId,
                        title: notification.isAlarm ? `🚨 ${resolveName(notification.name, notification.metadata?.surahNumber)}` : resolveName(notification.name, notification.metadata?.surahNumber),
                        body: notification.isAlarm ? t.notificationBodyAlarm : t.notificationBodyRegular,
                        schedule: {
                            at: new Date(year, month - 1, day, hour, minute),
                            repeats: false,
                            allowWhileIdle: true
                        },
                        channelId: channelId,
                        sound: nativeSound,
                        smallIcon: 'ic_stat_book',
                        extra: {
                            page: notification.metadata?.startPage || notification.metadata?.page,
                            ayah: notification.metadata?.startAyah,
                            surah: notification.metadata?.surahNumber
                        },
                        autoCancel: !notification.isAlarm,
                        ongoing: false,
                        actionTypeId: 'OPEN_QURAN',
                        attachments: [],
                        badge: 1
                    });
                } else if (isOnce) {
                    // 🔔 Once alarm - next upcoming time, no repeat
                    const now = new Date();
                    const scheduledDate = new Date(now);
                    scheduledDate.setHours(hour, minute, 0, 0);
                    // If the time has already passed today, schedule for tomorrow
                    if (scheduledDate <= now) {
                        scheduledDate.setDate(scheduledDate.getDate() + 1);
                    }
                    const uniqueId = baseId + i;
                    schedules.push({
                        id: uniqueId,
                        title: notification.isAlarm ? `🚨 ${resolveName(notification.name, notification.metadata?.surahNumber)}` : resolveName(notification.name, notification.metadata?.surahNumber),
                        body: notification.isAlarm ? t.notificationBodyAlarm : t.notificationBodyRegular,
                        schedule: {
                            at: scheduledDate,
                            repeats: false,
                            allowWhileIdle: true
                        },
                        channelId: channelId,
                        sound: nativeSound,
                        smallIcon: 'ic_stat_book',
                        extra: {
                            page: notification.metadata?.startPage || notification.metadata?.page,
                            ayah: notification.metadata?.startAyah,
                            surah: notification.metadata?.surahNumber
                        },
                        autoCancel: !notification.isAlarm,
                        ongoing: false,
                        actionTypeId: 'OPEN_QURAN',
                        attachments: [],
                        badge: 1
                    });
                } else {
                    // 📅 Daily/Weekly repeating alarm
                    for (const day of notification.days) {
                        const uniqueId = baseId + i + (day * 100);
                    schedules.push({
                        id: uniqueId,
                        title: notification.isAlarm ? `🚨 ${resolveName(notification.name, notification.metadata?.surahNumber)}` : resolveName(notification.name, notification.metadata?.surahNumber),
                        body: notification.isAlarm ? t.notificationBodyAlarm : t.notificationBodyRegular,
                        schedule: {
                            on: {
                                weekday: day + 1,
                                hour,
                                minute
                            },
                            repeats: true,
                            allowWhileIdle: true
                        },
                        channelId: channelId,
                        sound: nativeSound,
                        smallIcon: 'ic_stat_book',
                        extra: {
                            page: notification.metadata?.startPage || notification.metadata?.page,
                            ayah: notification.metadata?.startAyah,
                            surah: notification.metadata?.surahNumber
                        },
                        autoCancel: !notification.isAlarm,
                        ongoing: false,
                        actionTypeId: 'OPEN_QURAN',
                        attachments: [],
                        badge: 1
                    });
                    }
                }
            }

            if (schedules.length > 0) {
                await LocalNotifications.schedule({
                    notifications: schedules
                });

                // ⭐ M2: Badge Sync — تحديث شارة الأيقونة فور جدولة تنبيه جديد
                try {
                    const { isSupported } = await Badge.isSupported();
                    if (isSupported) {
                        // احسب عدد الإشعارات المجدولة الكلي لتحديث الشارة
                        const pending = await LocalNotifications.getPending();
                        const activeCount = pending.notifications.length;
                        await Badge.set({ count: activeCount > 0 ? 1 : 0 });
                        console.log(`[Badge] ✅ Badge updated after scheduling: ${activeCount} active`);
                    }
                } catch (badgeErr) {
                    console.warn('[Badge] ⚠️ تعذر تحديث الشارة بعد الجدولة:', badgeErr);
                }
            }
        } catch (error) {
            console.error('Error scheduling native notification:', error);
        }
    };

    // Form state
    const [formName, setFormName] = useState('');
    const [formType, setFormType] = useState<'daily' | 'weekly' | 'once'>('once');
    const [formDays, setFormDays] = useState<number[]>([]);
    const [formTargetDate, setFormTargetDate] = useState<string>('');
    const [formTimes, setFormTimes] = useState<string[]>(['08:00']);
    const timeInputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const dateInputRef = useRef<HTMLInputElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const audioPreviewRef = useRef<HTMLAudioElement | null>(null);

    const handleTimeClick = (index: number) => {
        const input = timeInputRefs.current[index];
        if (input) {
            try {
                if (typeof input.showPicker === 'function') {
                    input.showPicker();
                } else {
                    input.focus();
                    input.click();
                }
            } catch (e) {
                input.focus();
            }
        }
    };

    // 🛠️ إجبار تقويم التاريخ على الفتح - يتجاوز قيود الـ Modal (Focus Trap / Event Propagation)
    const handleDateClick = (e: React.MouseEvent) => {
        e.stopPropagation(); // منع تداخل أحداث النافذة المنبثقة
        if (dateInputRef.current && 'showPicker' in HTMLInputElement.prototype) {
            try {
                dateInputRef.current.showPicker();
            } catch (err) {
                console.error('Failed to open date picker:', err);
            }
        }
    };

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

    // Computed surah bounds for dropdown generation
    const currentSurahData = SURAHS.find(s => s.number === formSurahNumber);
    const surahMinPage = currentSurahData?.startPage || 1;
    const surahNextData = SURAHS.find(s => s.number === formSurahNumber + 1);
    const surahMaxPage = (() => {
        if (!currentSurahData) return 604;
        if (!surahNextData) return 604;
        const end = surahNextData.startPage - (surahNextData.startPage > surahMinPage ? 1 : 0);
        return Math.max(surahMinPage, end);
    })();
    const surahAyahCount = currentSurahData?.ayahCount || 1;

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
        // Stop audio preview if playing
        if (audioPreviewRef.current) {
            audioPreviewRef.current.pause();
            audioPreviewRef.current.currentTime = 0;
            audioPreviewRef.current = null;
        }
        setIsPlaying(false);

        setFormName('');
        setFormType('once');
        setFormDays([]);
        setFormTargetDate('');
        setFormTimes(['08:00']);
        setFormIsAlarm(true);
        setFormSound('/islamic_song.mp3');

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

    // Cleanup audio on unmount or when modal closes
    React.useEffect(() => {
        return () => {
            if (audioPreviewRef.current) {
                audioPreviewRef.current.pause();
                audioPreviewRef.current.currentTime = 0;
                audioPreviewRef.current = null;
            }
            setIsPlaying(false);
        };
    }, [isOpen]);

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
        // Conflict resolution: selecting a day clears date
        setFormTargetDate('');
        if (formType === 'once') {
            setFormType('weekly');
        }
        if (formDays.includes(day)) {
            setFormDays(formDays.filter(d => d !== day));
        } else {
            setFormDays([...formDays, day].sort());
        }
    };

    const handleSaveNotification = () => {
        if (!formName.trim() || formTimes.length === 0) return;

        const isOnce = formType === 'once' || (!formType?.includes('daily') && !formType?.includes('weekly') && formDays.length === 0 && !formTargetDate);

        const newNotification: NotificationItem = {
            id: editingId || Date.now().toString(),
            name: formName,
            isEnabled: true,
            isAlarm: formIsAlarm,
            sound: formSound,
            type: isOnce ? 'once' : formType === 'daily' ? 'daily' : 'weekly',
            days: formType === 'daily' ? [0, 1, 2, 3, 4, 5, 6] : formDays,
            times: formTimes,
            targetDate: formTargetDate || undefined,
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

        if (isNative) {
            scheduleNativeNotification(newNotification);
            
            // ⭐ فحص حالة تحسين البطارية عند حفظ أو تعديل أي تنبيه جديد
            try {
                const batteryStatus = localStorage.getItem('battery_opt_status');
                if (batteryStatus !== 'granted' && batteryStatus !== 'dont_show') {
                    // إذا لم يتم التفعيل أو اختيار عدم الإظهار، نعرض النافذة المنبثقة للتنبيه مجدداً
                    setTimeout(() => {
                        setShowBatteryModal(true);
                    }, 500);
                }
            } catch (batteryErr) {
                console.warn('[NotifManager] ⚠️ تعذر فحص حالة تحسين البطارية:', batteryErr);
            }
        }

        resetForm();
    };

    const handleEdit = (notification: NotificationItem) => {
        setFormName(notification.name);
        setFormType(notification.type || 'once');
        setFormDays(notification.days || []);
        setFormTargetDate(notification.targetDate || '');
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
        if (isNative) {
            const baseId = parseInt(id.slice(-6)) || 0;
            // Attempt to cancel all potential sub-IDs (brute force or track them)
            // For now, just cancel the base. Real app would track scheduled IDs.
            LocalNotifications.cancel({ notifications: [{ id: baseId }] });
        }
    };


    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-[var(--bg-card)] rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-[var(--border-primary)]">
                    <div className="flex items-center gap-2">
                        <h2 className="text-xl font-bold text-amber-600 dark:text-amber-400">{t.notificationManagerTitle}</h2>
                        {!showAddForm && (
                            <button
                                onClick={() => setShowAddForm(true)}
                                className="p-1.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 hover:bg-amber-200 dark:hover:bg-amber-900/50 transition-colors"
                                title={t.addNotification || 'Add'}
                            >
                                <Plus size={20} />
                            </button>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-[var(--bg-secondary)] rounded-full transition-colors"
                    >
                        <X size={24} className="text-[var(--text-primary)] opacity-50 hover:opacity-100" />
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
                                    [...notifications].reverse().map(notification => (
                                        <div
                                            key={notification.id}
                                            className="bg-[var(--bg-secondary)] rounded-lg p-4 border border-[var(--border-primary)] transition-all"
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
                                                            "font-bold text-[var(--text-primary)] mb-1 transition-all inline-block",
                                                            onNavigate && "cursor-pointer hover:text-amber-600 dark:hover:text-amber-400 hover:underline"
                                                        )}
                                                    >
                                                        {resolveName(notification.name, notification.metadata?.surahNumber)}
                                                    </h3>
                                                    <p className="text-sm text-[var(--text-primary)] opacity-60">
                                                        {notification.category === 'surah' && notification.metadata ? (
                                                            <span className="block text-amber-600 dark:text-amber-400 mb-1">
                                                                {notification.metadata.startAyah && notification.metadata.endAyah ?
                                                                    `${t.fromAyah} ${ln(notification.metadata.startAyah)} ${t.toAyah} ${ln(notification.metadata.endAyah)}` : ''}
                                                                {notification.metadata.startPage && notification.metadata.endPage ?
                                                                    ` (${t.page} ${ln(notification.metadata.startPage)} - ${ln(notification.metadata.endPage)})` : ''}
                                                            </span>
                                                        ) : notification.category === 'page' && notification.metadata ? (
                                                            <span className="block text-amber-600 dark:text-amber-400 mb-1">
                                                                <SurahListSummary startPage={notification.metadata.startPage!} endPage={notification.metadata.endPage!} language={language} />
                                                            </span>
                                                        ) : notification.category === 'quran_part' && notification.metadata ? (
                                                            <span className="block text-amber-600 dark:text-amber-400 mb-1">
                                                                {notification.name.includes(t.juz) ? (
                                                                    <>
                                                                        {t.hizb} {notification.metadata.hizb != null ? ln(notification.metadata.hizb) : ''}، {t.surah} {getSurahName(JUZ_SECTIONS[((notification.metadata.hizb ?? 1) - 1) * 4]?.surahNum)}
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        {t.juz} {notification.metadata.juz != null ? ln(notification.metadata.juz) : ''}، {t.surah} {getSurahName(JUZ_SECTIONS[((notification.metadata.juz ?? 1) - 1) * 8]?.surahNum)}
                                                                    </>
                                                                )}
                                                            </span>
                                                        ) : null}
                                                        {notification.type === 'daily' ? t.daily :
                                                            notification.type === 'once' || (!notification.days || notification.days.length === 0) ?
                                                                (notification.targetDate ?
                                                                    `📅 ${notification.targetDate}` :
                                                                    t.alarm_once) :
                                                                (notification.days || []).map(d => DAYS[d]).join('، ')}
                                                    </p>
                                                    <div className="flex flex-wrap gap-2 mt-2">
                                                        {notification.times.map((time, i) => (
                                                            <span
                                                                key={i}
                                                                className="inline-flex items-center gap-1 px-2 py-1 bg-[var(--bg-card)] rounded text-sm text-[var(--text-primary)]"
                                                            >
                                                                <Clock size={14} />
                                                                {formatTimeLocalized(time, language as any, t)}
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
                                                        title={notification.isEnabled ? t.disableNotification : t.enableNotification}
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
                                                        title={t.editNotification}
                                                        className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /><path d="m15 5 4 4" /></svg>
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(notification.id)}
                                                        title={t.deleteNotification}
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
                            <h3 className="text-lg font-bold text-amber-600 dark:text-amber-400">
                                {editingId ? t.editNotification : t.addNewNotification}
                            </h3>



                            {/* Category Selection */}
                            <div className="bg-[var(--bg-secondary)] p-3 rounded-lg border border-[var(--border-primary)]">
                                <label className="block text-sm font-bold text-[var(--text-primary)] opacity-70 mb-2">
                                    {t.notificationCategory}
                                </label>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                    <button
                                        onClick={() => setFormCategory('text')}
                                        className={clsx(
                                            "py-2 px-1 rounded-lg text-sm font-bold transition-colors truncate",
                                            formCategory === 'text'
                                                ? "bg-amber-600 text-white"
                                                : "bg-[var(--bg-card)] text-[var(--text-primary)] opacity-70 hover:opacity-100"
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
                                                : "bg-[var(--bg-card)] text-[var(--text-primary)] opacity-70 hover:opacity-100"
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
                                                : "bg-[var(--bg-card)] text-[var(--text-primary)] opacity-70 hover:opacity-100"
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
                                                : "bg-[var(--bg-card)] text-[var(--text-primary)] opacity-70 hover:opacity-100"
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
                                            className="w-full px-4 py-2 border border-[var(--border-primary)] rounded-lg bg-[var(--bg-secondary)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-amber-500"
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
                                                        const sName = getSurahName(sNum);
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
                                                className="w-full px-4 py-2 border border-[var(--border-primary)] rounded-lg bg-[var(--bg-secondary)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-amber-500"
                                            >
                                                {SURAHS.map(surah => (
                                                    <option key={surah.number} value={surah.number}>
                                                        {ln(surah.number)}. {getSurahName(surah.number)}
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
                                                    <select
                                                        value={formStartPage}
                                                        onChange={(e) => {
                                                            const val = parseInt(e.target.value);
                                                            setFormStartPage(val);
                                                            updateAyahsFromPages(formSurahNumber, val, formEndPage);
                                                        }}
                                                        className="w-full px-2 py-2 border border-[var(--border-primary)] rounded-lg bg-[var(--bg-secondary)] text-[var(--text-primary)] text-center"
                                                    >
                                                        {Array.from({ length: surahMaxPage - surahMinPage + 1 }, (_, i) => {
                                                            const pageNum = surahMinPage + i;
                                                            return <option key={pageNum} value={pageNum}>{ln(pageNum)}</option>;
                                                        })}
                                                    </select>
                                                    <span className="text-slate-400">-</span>
                                                    <div className="relative w-full">
                                                        <select
                                                            value={formEndPage}
                                                            onChange={(e) => {
                                                                const val = parseInt(e.target.value);
                                                                setFormEndPage(val);
                                                                updateAyahsFromPages(formSurahNumber, formStartPage, val);
                                                            }}
                                                            className={clsx(
                                                                "w-full px-2 py-2 border rounded-lg bg-white dark:bg-slate-800 text-amber-900 dark:text-amber-100 text-center",
                                                                formEndPage < formStartPage
                                                                    ? "border-red-500 ring-1 ring-red-500"
                                                                    : "border-amber-300 dark:border-slate-600"
                                                            )}
                                                        >
                                                            {Array.from({ length: surahMaxPage - surahMinPage + 1 }, (_, i) => {
                                                                const pageNum = surahMinPage + i;
                                                                return <option key={pageNum} value={pageNum}>{ln(pageNum)}</option>;
                                                            })}
                                                        </select>
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
                                                    <select
                                                        value={formStartAyah}
                                                        onChange={(e) => {
                                                            const val = parseInt(e.target.value);
                                                            setFormStartAyah(val);
                                                            updatePagesFromAyahs(formSurahNumber, val, formEndAyah);
                                                            // Auto-update name
                                                            const surah = SURAHS.find(s => s.number === formSurahNumber);
                                                            if (surah) {
                                                                const sName = getSurahName(surah.number);
                                                                setFormName(`${t.surahPrefix} ${sName} (${ln(val)}-${ln(formEndAyah)})`);
                                                            }
                                                        }}
                                                        className="w-full px-2 py-2 border border-[var(--border-primary)] rounded-lg bg-[var(--bg-secondary)] text-[var(--text-primary)] text-center"
                                                    >
                                                        {Array.from({ length: surahAyahCount }, (_, i) => {
                                                            const ayahNum = i + 1;
                                                            return <option key={ayahNum} value={ayahNum}>{ln(ayahNum)}</option>;
                                                        })}
                                                    </select>
                                                    <span className="text-slate-400">-</span>
                                                    <div className="relative w-full">
                                                        <select
                                                            value={formEndAyah}
                                                            onChange={(e) => {
                                                                const val = parseInt(e.target.value);
                                                                setFormEndAyah(val);
                                                                updatePagesFromAyahs(formSurahNumber, formStartAyah, val);
                                                                // Auto-update name
                                                                const surah = SURAHS.find(s => s.number === formSurahNumber);
                                                                if (surah) {
                                                                    const sName = getSurahName(surah.number);
                                                                    setFormName(`${t.surahPrefix} ${sName} (${ln(formStartAyah)}-${ln(val)})`);
                                                                }
                                                            }}
                                                            className={clsx(
                                                                "w-full px-2 py-2 border rounded-lg bg-white dark:bg-slate-800 text-amber-900 dark:text-amber-100 text-center",
                                                                formEndAyah < formStartAyah
                                                                    ? "border-red-500 ring-1 ring-red-500"
                                                                    : "border-amber-300 dark:border-slate-600"
                                                            )}
                                                        >
                                                            {Array.from({ length: surahAyahCount }, (_, i) => {
                                                                const ayahNum = i + 1;
                                                                return <option key={ayahNum} value={ayahNum}>{ln(ayahNum)}</option>;
                                                            })}
                                                        </select>
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
                                                            setFormName(`${t.juz} ${ln(val)} (${sect.text})`);
                                                            setFormSurahNumber(sect.surahNum || 1);
                                                            setFormStartAyah(sect.ayahNum || 1);
                                                            getAyahPage(sect.surahNum || 1, sect.ayahNum || 1).then(setFormStartPage);
                                                        }
                                                    }}
                                                    className="w-full p-2 border border-amber-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-amber-900 dark:text-amber-100"
                                                >
                                                    {[...Array(30)].map((_, i) => (
                                                        <option key={i} value={i + 1}>{ln(i + 1)}</option>
                                                    ))}
                                                </select>
                                                <span className="text-[10px] text-amber-600 italic block mt-1 px-1">
                                                    {t.surahPrefix} {getSurahName(JUZ_SECTIONS[(formJuz - 1) * 8]?.surahNum)}
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
                                                            setFormName(`${t.hizb} ${ln(val)} - ${t.juz} ${ln(newJuz)} (${sect.text})`);
                                                            setFormSurahNumber(sect.surahNum || 1);
                                                            setFormStartAyah(sect.ayahNum || 1);
                                                            getAyahPage(sect.surahNum || 1, sect.ayahNum || 1).then(setFormStartPage);
                                                        }
                                                    }}
                                                    className="w-full p-2 border border-amber-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-amber-900 dark:text-amber-100"
                                                >
                                                    {[...Array(60)].map((_, i) => (
                                                        <option key={i} value={i + 1}>{ln(i + 1)}</option>
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
                                                            setFormName(`${t.rub} ${ln(valWithinHizb)} - ${t.hizb} ${ln(formHizb)} (${sect.text})`);
                                                            setFormSurahNumber(sect.surahNum || 1);
                                                            setFormStartAyah(sect.ayahNum || 1);
                                                            getAyahPage(sect.surahNum || 1, sect.ayahNum || 1).then(setFormStartPage);
                                                        }
                                                    }}
                                                    className="w-full p-2 border border-amber-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-amber-900 dark:text-amber-100"
                                                >
                                                    {[1, 2, 3, 4].map(v => (
                                                        <option key={v} value={v}>{ln(v)}</option>
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
                                                <select
                                                    value={formStartPage}
                                                    onChange={(e) => {
                                                        const val = parseInt(e.target.value);
                                                        setFormStartPage(val);
                                                        // Ensure End >= Start
                                                        if (formEndPage < val) {
                                                            setFormEndPage(val);
                                                            setFormName(t.fromPageToPage.replace('{from}', ln(val)).replace('{to}', ln(val)));
                                                        } else {
                                                            setFormName(t.fromPageToPage.replace('{from}', ln(val)).replace('{to}', ln(formEndPage)));
                                                        }
                                                    }}
                                                    className="w-full px-4 py-2 border border-amber-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-amber-900 dark:text-amber-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                                                >
                                                    {Array.from({ length: 604 }, (_, i) => {
                                                        const pageNum = i + 1;
                                                        return <option key={pageNum} value={pageNum}>{ln(pageNum)}</option>;
                                                    })}
                                                </select>
                                            </div>
                                            <div className="relative">
                                                <label className="text-xs text-slate-500 mb-1 block">{t.toPage}</label>
                                                <select
                                                    value={formEndPage}
                                                    onChange={(e) => {
                                                        const val = parseInt(e.target.value);
                                                        setFormEndPage(val);
                                                        setFormName(t.fromPageToPage.replace('{from}', ln(formStartPage)).replace('{to}', ln(val)));
                                                    }}
                                                    className={clsx(
                                                        "w-full px-4 py-2 border rounded-lg bg-white dark:bg-slate-800 text-amber-900 dark:text-amber-100 focus:outline-none focus:ring-2 focus:ring-amber-500",
                                                        formEndPage < formStartPage
                                                            ? "border-red-500 ring-1 ring-red-500"
                                                            : "border-amber-300 dark:border-slate-600"
                                                    )}
                                                >
                                                    {Array.from({ length: 604 }, (_, i) => {
                                                        const pageNum = i + 1;
                                                        return <option key={pageNum} value={pageNum}>{ln(pageNum)}</option>;
                                                    })}
                                                </select>
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
                                )}
                            </div>

                            {/* Type */}
                            <div>
                                <label className="block text-sm font-bold text-amber-900 dark:text-amber-100 mb-2">
                                    {t.notificationType}
                                </label>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => {
                                            setFormType('once');
                                            setFormDays([]);
                                            setFormTargetDate('');
                                        }}
                                        className={clsx(
                                            "flex-1 py-2 rounded-lg font-bold transition-colors text-sm",
                                            formType === 'once'
                                                ? "bg-amber-600 text-white"
                                                : "bg-amber-100 dark:bg-slate-700 text-amber-900 dark:text-amber-100"
                                        )}
                                    >
                                        {t.alarm_once}
                                    </button>
                                    <button
                                        onClick={() => {
                                            setFormType('daily');
                                            setFormDays([0, 1, 2, 3, 4, 5, 6]);
                                            setFormTargetDate('');
                                        }}
                                        className={clsx(
                                            "flex-1 py-2 rounded-lg font-bold transition-colors text-sm",
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
                                            setFormTargetDate('');
                                        }}
                                        className={clsx(
                                            "flex-1 py-2 rounded-lg font-bold transition-colors text-sm",
                                            formType === 'weekly'
                                                ? "bg-amber-600 text-white"
                                                : "bg-amber-100 dark:bg-slate-700 text-amber-900 dark:text-amber-100"
                                        )}
                                    >
                                        {t.weekly}
                                    </button>
                                </div>
                            </div>

                            {/* Specific Date Picker - shown for once/weekly types */}
                            {(formType === 'once' || formType === 'weekly') && (
                                <div className="bg-amber-50/50 dark:bg-slate-800/50 p-3 rounded-lg border border-amber-200 dark:border-slate-700">
                                    <label className="block text-sm font-bold text-amber-900 dark:text-amber-100 mb-2">
                                        {t.alarm_specific_date}
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <div className="relative flex-1" onClick={handleDateClick}>
                                            <Calendar size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-600 dark:text-amber-400 pointer-events-none" />
                                            <input
                                                ref={dateInputRef}
                                                type="date"
                                                value={formTargetDate}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    setFormTargetDate(val);
                                                    // Conflict resolution: selecting date clears days
                                                    if (val) {
                                                        setFormDays([]);
                                                    }
                                                }}
                                                onClick={handleDateClick}
                                                min={new Date().toISOString().split('T')[0]}
                                                style={{ color: formTargetDate ? 'inherit' : 'transparent', direction: 'ltr', textAlign: document.dir === 'rtl' ? 'right' : 'left' }}
                                                className="w-full px-4 py-2 pr-10 border border-amber-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-amber-900 dark:text-amber-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                                            />
                                        </div>
                                        {formTargetDate && (
                                            <button
                                                onClick={() => setFormTargetDate('')}
                                                className="p-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors text-xs font-bold"
                                                title={t.alarm_clear_date}
                                            >
                                                <X size={16} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}

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

                            {/* Times - Invisible Overlay Pattern */}
                            <div>
                                <label className="block text-sm font-bold text-amber-900 dark:text-amber-100 mb-2">
                                    {t.notificationTimes}
                                </label>
                                <div className="space-y-2">
                                    {formTimes.map((time, index) => (
                                        <div key={index} className="flex gap-2 items-center">
                                            {/* Clickable wrapper - opens native picker via showPicker() */}
                                            <div
                                                className="relative flex-1 cursor-pointer"
                                                onClick={() => handleTimeClick(index)}
                                            >
                                                {/* Visual display - localized time */}
                                                <div className="px-4 py-2 border border-amber-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-amber-900 dark:text-amber-100 text-center font-bold min-h-[42px] flex items-center justify-center gap-2 select-none">
                                                    <Clock size={16} className="opacity-50" />
                                                    <span>{time ? formatTimeLocalized(time, language as any, t) : '--:--'}</span>
                                                </div>
                                                {/* Hidden native input - positioned off-screen, controlled via ref */}
                                                <input
                                                    ref={el => { timeInputRefs.current[index] = el; }}
                                                    type="time"
                                                    value={time}
                                                    onChange={(e) => handleTimeChange(index, e.target.value)}
                                                    className="opacity-0 absolute w-0 h-0 overflow-hidden"
                                                    style={{ fontSize: '16px' }}
                                                    tabIndex={-1}
                                                />
                                            </div>
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
                                                if (isPlaying && audioPreviewRef.current) {
                                                    audioPreviewRef.current.pause();
                                                    audioPreviewRef.current.currentTime = 0;
                                                    audioPreviewRef.current = null;
                                                    setIsPlaying(false);
                                                } else {
                                                    if (audioPreviewRef.current) {
                                                        audioPreviewRef.current.pause();
                                                        audioPreviewRef.current.currentTime = 0;
                                                    }
                                                    const audio = new Audio(formSound);
                                                    audioPreviewRef.current = audio;
                                                    audio.onended = () => {
                                                        setIsPlaying(false);
                                                        audioPreviewRef.current = null;
                                                    };
                                                    audio.play().catch((err) => {
                                                        console.error("Preview play error:", err);
                                                        alert(t.errorPlayingSound);
                                                        setIsPlaying(false);
                                                    });
                                                    setIsPlaying(true);
                                                }
                                            }}
                                            className={clsx(
                                                "p-2 rounded-lg transition-colors",
                                                isPlaying
                                                    ? "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200"
                                                    : "bg-amber-100 dark:bg-slate-700 text-amber-900 dark:text-amber-100 hover:bg-amber-200"
                                            )}
                                            title={isPlaying ? (t.stopSound || 'إيقاف') : t.previewSound}
                                        >
                                            {isPlaying ? <Pause size={20} /> : <Play size={20} />}
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
                                                // ⭐ الخطوة 1: طلب صلاحية الإشعارات الداخلية (Browser)
                                                const permission = await Notification.requestPermission();
                                                setPermissionStatus(permission);
                                                if (permission !== 'granted') {
                                                    alert(t.permissionRequired);
                                                    return; // توقف إذا رُفضت الصلاحية الداخلية
                                                }

                                                // ⭐ الخطوة 2: طلب صلاحية الإشعارات الخارجية (Firebase Push) تسلسلياً
                                                if (isPushSupported && pushPermissionStatus !== 'granted') {
                                                    console.log('[Notifications] ✅ تم قبول الإشعارات الداخلية، جاري طلب الإشعارات الخارجية...');
                                                    try {
                                                        const pushResult = await requestPushPermission();
                                                        if (pushResult.success) {
                                                            console.log('[Notifications] ✅ تم تفعيل الإشعارات الداخلية + الخارجية بنجاح');
                                                            setShowTokenPopup(true);
                                                        } else {
                                                            console.warn('[Notifications] ⚠️ فشل تفعيل الإشعارات الخارجية:', pushResult.error);
                                                        }
                                                    } catch (pushErr) {
                                                        console.warn('[Notifications] ⚠️ خطأ في الإشعارات الخارجية:', pushErr);
                                                    }
                                                }
                                            }
                                        }}
                                    />
                                </label>

                                {fcmToken && (
                                    <div className="mt-2 flex justify-end">
                                        <button
                                            type="button"
                                            onClick={() => setShowTokenPopup(true)}
                                            className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 bg-transparent border-0 cursor-pointer"
                                        >
                                            🔑 {isArabic ? 'عرض رمز الإشعارات (FCM Token)' : 'Show FCM Token'}
                                        </button>
                                    </div>
                                )}


                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={handleSaveNotification}
                                    disabled={!formName.trim() || formTimes.length === 0 || (formType === 'weekly' && formDays.length === 0 && !formTargetDate)}
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
            {/* Battery Optimization Custom Modal */}
            {showBatteryModal && (
                <div className="fixed inset-0 z-[200] bg-black/60 flex items-center justify-center p-4 animate-in fade-in">
                    <div className="bg-[var(--bg-card)] w-full max-w-sm rounded-2xl p-6 shadow-2xl relative animate-in zoom-in-95">
                        <button
                            onClick={() => setShowBatteryModal(false)}
                            className="absolute top-4 right-4 p-2 rounded-full hover:bg-[var(--bg-primary)] transition-colors"
                        >
                            <X size={20} className="text-[var(--text-primary)] opacity-60" />
                        </button>
                        
                        <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Bell size={32} />
                        </div>
                        
                        <h3 className="text-xl font-bold text-center text-[var(--text-primary)] mb-2">
                            لضمان وصول التنبيهات
                        </h3>
                        
                        <p className="text-xs text-center text-[var(--text-primary)] opacity-70 mb-4 leading-relaxed">
                            أنظمة الهواتف قد تقوم بإيقاف التنبيهات لتوفير البطارية. لضمان تنبيهك في الوقت المناسب، يرجى تفعيل الصلاحية باتباع الآتي عند فتح الإعدادات:
                        </p>

                        <div className="bg-[var(--bg-secondary)] rounded-xl p-3 mb-4 text-right" style={{ direction: 'rtl' }}>
                            <span className="text-xs font-bold text-amber-600 dark:text-amber-400 block mb-1">💡 خطوات التفعيل البسيطة:</span>
                            <ol className="text-[11px] text-[var(--text-primary)] opacity-85 list-decimal list-inside space-y-0.5">
                                <li>اضغط على <b>"البطارية" (Battery)</b> أو "استخدام البطارية".</li>
                                <li>اختر <b>"غير مقيد" (Unrestricted)</b> أو "بلا قيود".</li>
                            </ol>
                        </div>

                        <label className="flex items-center gap-2 cursor-pointer mb-4 justify-end select-none text-right" style={{ direction: 'rtl' }}>
                            <input
                                type="checkbox"
                                checked={dontShowAgain}
                                onChange={(e) => setDontShowAgain(e.target.checked)}
                                className="w-4 h-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500 bg-[var(--bg-secondary)] cursor-pointer"
                            />
                            <span className="text-xs text-[var(--text-primary)] opacity-70">لا تظهر لي هذا التنبيه مجدداً</span>
                        </label>
                        
                        <div className="flex flex-col gap-3">
                            <button
                                onClick={() => {
                                    try {
                                        localStorage.setItem('battery_opt_status', 'granted');
                                        localStorage.setItem('battery_opt_requested', 'true');
                                    } catch (e) {}
                                    if (isNative) {
                                        NativeSettings.openAndroid({ option: AndroidSettings.IgnoreBatteryOptimization })
                                            .catch(() => {
                                                // Fallback to app details if specific intent is not supported by the ROM
                                                NativeSettings.openAndroid({ option: AndroidSettings.ApplicationDetails });
                                            });
                                    }
                                    setShowBatteryModal(false);
                                }}
                                className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-amber-600/20 active:scale-[0.98]"
                            >
                                السماح بالعمل في الخلفية
                            </button>
                            
                            <button
                                onClick={() => {
                                    try {
                                        if (dontShowAgain) {
                                            localStorage.setItem('battery_opt_status', 'dont_show');
                                            localStorage.setItem('battery_opt_requested', 'true');
                                        } else {
                                            localStorage.setItem('battery_opt_status', 'later');
                                        }
                                    } catch (e) {}
                                    setShowBatteryModal(false);
                                }}
                                className="w-full py-3 bg-[var(--bg-secondary)] hover:bg-[var(--bg-primary)] text-[var(--text-primary)] rounded-xl font-medium transition-all active:scale-[0.98]"
                            >
                                لاحقاً
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* FCM Token Display Custom Modal */}
            {showTokenPopup && fcmToken && (
                <div className="fixed inset-0 z-[200] bg-black/60 flex items-center justify-center p-4 animate-in fade-in">
                    <div className="bg-[var(--bg-card)] w-full max-w-sm rounded-2xl p-6 shadow-2xl relative animate-in zoom-in-95" style={{ direction: isArabic ? 'rtl' : 'ltr' }}>
                        <button
                            onClick={() => setShowTokenPopup(false)}
                            className="absolute top-4 right-4 p-2 rounded-full hover:bg-[var(--bg-primary)] transition-colors"
                        >
                            <X size={20} className="text-[var(--text-primary)] opacity-60" />
                        </button>
                        
                        <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                            <Bell size={32} />
                        </div>
                        
                        <h3 className="text-xl font-bold text-center text-[var(--text-primary)] mb-2">
                            {isArabic ? 'رمز الإشعارات (FCM Token)' : 'FCM Token'}
                        </h3>
                        
                        <p className="text-xs text-center text-[var(--text-primary)] opacity-70 mb-4 leading-relaxed">
                            {isArabic ? 'تم ربط الإشعارات الخارجية بنجاح! يمكنك نسخ الرمز أدناه للاختبار:' : 'External notifications linked successfully! You can copy the token below to test:'}
                        </p>

                        <div className="bg-[var(--bg-secondary)] rounded-xl p-3 mb-4 border border-[var(--border-primary)] font-mono text-[10px] break-all select-all text-[var(--text-primary)] max-h-24 overflow-y-auto">
                            {fcmToken.slice(0, 40)}...
                        </div>
                        
                        <div className="flex flex-col gap-3">
                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(fcmToken).then(() => {
                                        alert(isArabic ? '✅ تم نسخ الرمز بنجاح!' : '✅ Token copied successfully!');
                                    }).catch(() => {
                                        alert(isArabic ? '❌ فشل في نسخ الرمز' : '❌ Failed to copy token');
                                    });
                                }}
                                className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-purple-600/20 active:scale-[0.98]"
                            >
                                {isArabic ? 'نسخ الرمز' : 'Copy Token'}
                            </button>
                            
                            <button
                                onClick={() => setShowTokenPopup(false)}
                                className="w-full py-3 bg-[var(--bg-secondary)] hover:bg-[var(--bg-primary)] text-[var(--text-primary)] rounded-xl font-medium transition-all active:scale-[0.98]"
                            >
                                {isArabic ? 'إغلاق' : 'Close'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
