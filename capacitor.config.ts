import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.mushafalmurajaa.app',
  appName: 'مصحف المراجعة',
  webDir: 'dist',
  plugins: {
    LocalNotifications: {
      smallIcon: 'ic_app_notification',
      iconColor: '#D97706',
      sound: 'islamic_song',
      defaultChannel: {
        id: 'quran_critical_alarm_v1',
        name: 'Quran Critical Alarms',
        description: 'High priority notifications for Quran reading reminders',
        importance: 5,
        visibility: 1,
        vibration: true,
        lights: true,
        lightColor: '#D97706'
      }
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    }
  }
};

export default config;