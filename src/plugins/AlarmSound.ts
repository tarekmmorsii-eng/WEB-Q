import { registerPlugin } from '@capacitor/core';

/**
 * تعريف TypeScript لمكوّن AlarmSound الأصلي.
 * يربط طبقة الويب بخدمة الأندرويد التي تشغل صوت المنبه عالياً وتكشف الهز في الخلفية.
 */
export interface AlarmSoundPlugin {
  /** بدء خدمة المنبه: تشغيل الصوت المتكرر على قناة المنبه وتفعيل كشف الهز في الخلفية. */
  start(): Promise<void>;
  /** إيقاف خدمة المنبه: إيقاف الصوت وإيقاف كشف الهز. */
  stop(): Promise<void>;
}

const AlarmSound = registerPlugin<AlarmSoundPlugin>('AlarmSound');

export default AlarmSound;
