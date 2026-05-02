/**
 * useWakeLock - Hook لإدارة إضاءة الشاشة (Screen Wake Lock)
 * 
 * الاستراتيجية:
 * 1. عند فتح التطبيق: تفعيل Wake Lock لمدة ساعة واحدة كحد أقصى
 * 2. أثناء التلاوة الصوتية (isPlaying === true): الشاشة تبقى مضاءة بشكل دائم
 * 3. عند إيقاف التلاوة: يعود المؤقت الزمني الطبيعي (ساعة واحدة)
 * 
 * يدعم:
 * - الويب: navigator.wakeLock API
 * - الأندرويد (Capacitor): @capacitor/keep-awake
 */

import { useEffect, useRef, useCallback } from 'react';

// Timeout constants
const IDLE_WAKE_LOCK_DURATION = 60 * 60 * 1000; // ساعة واحدة بالمللي ثانية
const RENEWAL_INTERVAL = 5 * 60 * 1000; // تجديد كل 5 دقائق لمنع انتهاء Wake Lock

export function useWakeLock(isAudioPlaying: boolean) {
    const wakeLockRef = useRef<WakeLockSentinel | null>(null);
    const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const renewalIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const isAudioPlayingRef = useRef(false);

    // تنظيف جميع المؤقتات و Wake Lock
    const cleanup = useCallback(() => {
        if (idleTimerRef.current) {
            clearTimeout(idleTimerRef.current);
            idleTimerRef.current = null;
        }
        if (renewalIntervalRef.current) {
            clearInterval(renewalIntervalRef.current);
            renewalIntervalRef.current = null;
        }
        releaseWakeLock();
    }, []);

    // تحرير Wake Lock الحالي بأمان
    const releaseWakeLock = useCallback(async () => {
        try {
            if (wakeLockRef.current && !wakeLockRef.current.released) {
                await wakeLockRef.current.release();
            }
        } catch (e) {
            // تم تحريره بالفعل أو لم يعد صالحاً - لا مشكلة
        }
        wakeLockRef.current = null;
    }, []);

    // طلب Wake Lock جديد من المتصفح
    const requestWakeLock = useCallback(async (): Promise<boolean> => {
        try {
            if ('wakeLock' in navigator) {
                const lock = await navigator.wakeLock.request('screen');
                wakeLockRef.current = lock;

                // الاستماع لحدث تحرير Wake Lock غير المتوقع (مثل تبديل التبويبات)
                lock.addEventListener('release', () => {
                    if (wakeLockRef.current === lock) {
                        wakeLockRef.current = null;
                    }
                });

                return true;
            }
        } catch (e) {
            console.warn('[WakeLock] فشل في طلب Wake Lock:', e);
        }
        return false;
    }, []);

    // إعادة تنشيط Wake Lock (تجديد)
    const renewWakeLock = useCallback(async () => {
        // لا نجدد إذا كان الصوت يعمل (لأنه عندها دائم)
        if (isAudioPlayingRef.current) return;
        
        await releaseWakeLock();
        await requestWakeLock();
    }, [releaseWakeLock, requestWakeLock]);

    // بدء وضع الساعة الواحدة (Idle Mode)
    const startIdleWakeLock = useCallback(async () => {
        await releaseWakeLock();
        const acquired = await requestWakeLock();

        if (acquired) {
            // إعداد مؤقت ساعة واحدة
            if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
            idleTimerRef.current = setTimeout(() => {
                releaseWakeLock();
                idleTimerRef.current = null;
            }, IDLE_WAKE_LOCK_DURATION);

            // تجديد دوري لمنع انتهاء Wake Lock من المتصفح
            if (renewalIntervalRef.current) clearInterval(renewalIntervalRef.current);
            renewalIntervalRef.current = setInterval(renewWakeLock, RENEWAL_INTERVAL);
        }
    }, [releaseWakeLock, requestWakeLock, renewWakeLock]);

    // التأثير الرئيسي: إدارة حسب حالة الصوت
    useEffect(() => {
        isAudioPlayingRef.current = isAudioPlaying;

        if (isAudioPlaying) {
            // الصوت يعمل: إيقاف مؤقت الساعة + تشغيل Wake Lock دائم
            if (idleTimerRef.current) {
                clearTimeout(idleTimerRef.current);
                idleTimerRef.current = null;
            }
            if (renewalIntervalRef.current) {
                clearInterval(renewalIntervalRef.current);
                renewalIntervalRef.current = null;
            }

            // طلب Wake Lock إذا لم يكن فعّالاً
            if (!wakeLockRef.current || wakeLockRef.current.released) {
                requestWakeLock();
            }
        } else {
            // الصوت توقف: العودة لوضع الساعة الواحدة
            startIdleWakeLock();
        }

        // تنظيف عند إزالة المكون
        return () => {
            cleanup();
        };
    }, [isAudioPlaying, requestWakeLock, startIdleWakeLock, cleanup]);

    // إعادة تنشيط Wake Lock عند العودة للتبويب (visibilitychange)
    useEffect(() => {
        const handleVisibilityChange = async () => {
            if (document.visibilityState === 'visible') {
                // الشاشة ظاهرة مرة أخرى: إعادة تنشيط Wake Lock
                if (isAudioPlayingRef.current) {
                    // كان الصوت يعمل: Wake Lock دائم
                    if (!wakeLockRef.current || wakeLockRef.current.released) {
                        await requestWakeLock();
                    }
                } else {
                    // لم يكن الصوت يعمل: نعيد وضع الساعة الواحدة
                    await startIdleWakeLock();
                }
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [requestWakeLock, startIdleWakeLock]);

    // تفعيل Wake Lock عند تحميل المكون لأول مرة (ساعة واحدة)
    useEffect(() => {
        startIdleWakeLock();

        return () => {
            cleanup();
        };
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    return {
        isActive: !!wakeLockRef.current && !wakeLockRef.current.released,
    };
}