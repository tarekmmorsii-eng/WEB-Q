import { LocalNotifications, type LocalNotificationSchema, type Schedule } from '@capacitor/local-notifications';
import type { NotificationItem } from '../types';

const pendingNotificationLimit = 64;

function getReminderSchedules(reminder: NotificationItem, now: Date): Schedule[] {
    const schedules: Schedule[] = [];
    for (const time of new Set(reminder.times)) {
        const [hour, minute] = time.split(':').map(Number);
        if (reminder.targetDate) {
            const [year, month, day] = reminder.targetDate.split('-').map(Number);
            const at = new Date(year, month - 1, day, hour, minute);
            if (at > now) schedules.push({ at });
        } else if (reminder.type === 'once' || !reminder.days?.length) {
            const at = new Date(now);
            at.setHours(hour, minute, 0, 0);
            if (at <= now) at.setDate(at.getDate() + 1);
            schedules.push({ at });
        } else if (reminder.type === 'daily') {
            schedules.push({ on: { hour, minute, second: 0 }, repeats: true });
        } else {
            for (const day of new Set(reminder.days)) {
                schedules.push({ on: { weekday: day + 1, hour, minute, second: 0 }, repeats: true });
            }
        }
    }
    return schedules;
}

export async function syncIOSReminder(reminder: NotificationItem, title: string, body: string): Promise<void> {
    const { notifications: pending } = await LocalNotifications.getPending();
    const previous = pending.filter(notification => notification.extra?.reminderId === reminder.id);
    const schedules = reminder.isEnabled ? getReminderSchedules(reminder, new Date()) : [];
    if (reminder.isEnabled && !schedules.length) throw new Error('Reminder time has passed');

    if (schedules.length) {
        if (pending.length - previous.length + schedules.length > pendingNotificationLimit) {
            throw new Error('Too many pending reminders');
        }

        const nextAvailableId = Math.max(0, ...pending.map(notification => notification.id)) + 1;
        const notifications: LocalNotificationSchema[] = schedules.map((schedule, index) => ({
            id: previous[index]?.id ?? nextAvailableId + index,
            title,
            body,
            schedule,
            sound: 'default',
            extra: {
                reminderId: reminder.id,
                page: reminder.metadata?.startPage ?? reminder.metadata?.page ?? 1,
                ...(reminder.metadata?.startAyah != null ? { ayah: reminder.metadata.startAyah } : {}),
                ...(reminder.metadata?.surahNumber != null ? { surah: reminder.metadata.surahNumber } : {})
            }
        }));
        await LocalNotifications.schedule({ notifications });
    }

    const obsolete = previous.slice(schedules.length).map(({ id }) => ({ id }));
    if (obsolete.length) await LocalNotifications.cancel({ notifications: obsolete });
}
