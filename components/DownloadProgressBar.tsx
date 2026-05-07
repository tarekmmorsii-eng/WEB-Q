import React from 'react';
import { Loader2 } from 'lucide-react';

interface DownloadProgressBarProps {
    /** النسبة المئوية من 0 إلى 100 */
    progress: number;
    /** رسالة توضيحية اختيارية تظهر فوق الشريط */
    message?: string;
    /** لون الشريط: 'amber' (افتراضي) أو 'blue' أو 'green' */
    color?: 'amber' | 'blue' | 'green';
    /** إخفاء النسبة المئوية الرقمية */
    hidePercent?: boolean;
}

/**
 * DownloadProgressBar
 * مكون شريط تحميل موحد يُستخدم في جميع عمليات التحميل
 * يدعم الوضعين الداكن والفاتح واتجاه RTL
 */
export default function DownloadProgressBar({
    progress,
    message,
    color = 'amber',
    hidePercent = false
}: DownloadProgressBarProps) {
    // تحديد الألوان حسب النوع
    const colorMap = {
        amber: {
            bar: 'bg-amber-500',
            track: 'bg-amber-100 dark:bg-amber-900/40',
            text: 'text-amber-700 dark:text-amber-300',
            percent: 'text-amber-600 dark:text-amber-400'
        },
        blue: {
            bar: 'bg-blue-500',
            track: 'bg-blue-100 dark:bg-blue-900/40',
            text: 'text-blue-700 dark:text-blue-300',
            percent: 'text-blue-600 dark:text-blue-400'
        },
        green: {
            bar: 'bg-green-500',
            track: 'bg-green-100 dark:bg-green-900/40',
            text: 'text-green-700 dark:text-green-300',
            percent: 'text-green-600 dark:text-green-400'
        }
    };

    const colors = colorMap[color];

    // التأكد من أن النسبة ضمن المجال الصحيح
    const clampedProgress = Math.min(100, Math.max(0, progress));

    return (
        <div className="space-y-1.5">
            {/* رسالة الحالة + النسبة المئوية */}
            {(message || !hidePercent) && (
                <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-sm min-w-0">
                        {clampedProgress > 0 && clampedProgress < 100 && (
                            <Loader2 size={14} className="animate-spin shrink-0" />
                        )}
                        {message && (
                            <span className={`${colors.text} truncate`}>{message}</span>
                        )}
                    </div>
                    {!hidePercent && clampedProgress > 0 && (
                        <span className={`text-xs font-bold shrink-0 ${colors.percent}`}>
                            {Math.round(clampedProgress)}%
                        </span>
                    )}
                </div>
            )}

            {/* شريط التقدم */}
            <div className={`w-full ${colors.track} rounded-full h-2 overflow-hidden`}>
                <div
                    className={`${colors.bar} h-full rounded-full transition-all duration-300 ease-out`}
                    style={{ width: `${clampedProgress}%` }}
                />
            </div>
        </div>
    );
}