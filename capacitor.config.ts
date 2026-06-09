import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.mushafalmurajaa.app',
  appName: 'مصحف المراجعة',
  webDir: 'dist',
  backgroundColor: '#000000',
  plugins: {
    LocalNotifications: {
      smallIcon: 'ic_stat_book',
      iconColor: '#000000',
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
      smallIcon: 'ic_stat_book',
      iconColor: '#000000'
    },
    SplashScreen: {
      launchShowDuration: 0,
      launchAutoHide: true,
      androidScaleType: 'CENTER_INSIDE',
      backgroundColor: '#000000',
      splashFullScreen: false,
      splashImmersive: false
    },
    StatusBar: {
      overlaysWebView: false,
      backgroundColor: '#FFFFFF'
    }
  }
};

export default config;