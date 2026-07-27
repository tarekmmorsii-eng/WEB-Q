package com.mushafalmurajaa.app;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.media.AudioAttributes;
import android.media.AudioManager;
import android.media.MediaPlayer;
import android.os.Build;
import android.os.IBinder;
import android.os.PowerManager;
import android.os.VibrationEffect;
import android.os.Vibrator;
import android.os.VibratorManager;
import android.hardware.Sensor;
import android.hardware.SensorEvent;
import android.hardware.SensorEventListener;
import android.hardware.SensorManager;
import androidx.core.app.NotificationCompat;

/**
 * خدمة أندرويد أصلية تعمل في الخلفية أثناء المنبه.
 * تقوم بأربعة أمور:
 * 1) تشغيل صوت المنبه على قناة STREAM_ALARM (عالٍ ومتكرر) ليبقى مسموعاً في الخلفية.
 * 2) رفع مستوى صوت المنبه إلى الحد الأقصى برمجياً لضمان سماعه حتى لو كان الهاتف على وضع منخفض.
 * 3) كشف هز الجهاز عبر مستشعر التسارع (SensorManager) لإيقاف المنبه بالهز حتى في الخلفية.
 * 4) البقاء نشطة كخدمة أمامية (Foreground Service) عالية الأولوية لئلا يقتلها النظام.
 *
 * عتبة الهز 20 م/ث² أعلى من قيمة السكون (9.8) لتجنب التفعيل الخاطئ، وتكتشف هزة واضحة.
 * تم إضافة منع تكرار اكتشاف الهز (debounce) لتجنب التفعيل المتعدد.
 */
public class AlarmSoundService extends Service implements SensorEventListener {

    private static final String CHANNEL_ID = "quran_alarm_foreground";
    private static final int NOTIFICATION_ID = 8888;
    private static final float SHAKE_THRESHOLD = 20.0f;
    private static final long SHAKE_DEBOUNCE_MS = 1500; // منع تكرار الهز خلال 1.5 ثانية

    private MediaPlayer mediaPlayer;
    private SensorManager sensorManager;
    private Sensor accelerometer;
    private PowerManager.WakeLock wakeLock;
    private Vibrator vibrator;
    private AudioManager audioManager;
    private int originalAlarmVolume = -1;
    private long lastShakeTime = 0;

    @Override
    public void onCreate() {
        super.onCreate();
        try {
            // الحصول على مدير الصوت لرفع مستوى صوت المنبه
            audioManager = (AudioManager) getSystemService(AUDIO_SERVICE);

            // إعداد المشغل الصوتي
            mediaPlayer = MediaPlayer.create(this, R.raw.islamic_song);
            if (mediaPlayer != null) {
                // استخدام STREAM_ALARM ليبقى الصوت مسموعاً في الخلفية ويتجاوز وضع الصامت
                mediaPlayer.setAudioStreamType(AudioManager.STREAM_ALARM);
                mediaPlayer.setLooping(true);
                // رفع مستوى الصوت داخل المشغل إلى الحد الأقصى
                mediaPlayer.setVolume(1.0f, 1.0f);
            }

            // إعداد مستشعر التسارع لكشف الهز
            sensorManager = (SensorManager) getSystemService(SENSOR_SERVICE);
            if (sensorManager != null) {
                accelerometer = sensorManager.getDefaultSensor(Sensor.TYPE_ACCELEROMETER);
            }

            // إعداد الاهتزاز النشط كاحتياط لجذب انتباه المستخدم
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                VibratorManager vm = (VibratorManager) getSystemService(VIBRATOR_MANAGER_SERVICE);
                if (vm != null) vibrator = vm.getDefaultVibrator();
            } else {
                vibrator = (Vibrator) getSystemService(VIBRATOR_SERVICE);
            }

            // الحصول على WakeLock لإبقاء المعالج نشطاً أثناء المنبه
            PowerManager pm = (PowerManager) getSystemService(POWER_SERVICE);
            if (pm != null) {
                wakeLock = pm.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "mushaf:alarm_wakelock");
                wakeLock.setReferenceCounted(false);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        createNotificationChannel();

        // إشعار عالي الأولوية لإبقاء الخدمة نشطة
        Notification notification = new NotificationCompat.Builder(this, CHANNEL_ID)
                .setContentTitle("مصحف المراجعة")
                .setContentText("المنبه يعمل - اهز الجهاز للإيقاف")
                .setSmallIcon(R.mipmap.ic_launcher)
                .setOngoing(true)
                .setPriority(NotificationCompat.PRIORITY_HIGH)
                .setCategory(NotificationCompat.CATEGORY_ALARM)
                .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
                .build();
        startForeground(NOTIFICATION_ID, notification);

        // تفعيل WakeLock لإبقاء المعالج نشطاً أثناء تشغيل المنبه (مهلة 10 دقائق)
        try {
            if (wakeLock != null && !wakeLock.isHeld()) {
                wakeLock.acquire(10 * 60 * 1000L);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }

        // رفع مستوى صوت المنبه إلى الحد الأقصى قبل التشغيل
        maximizeAlarmVolume();

        // تشغيل الصوت
        if (mediaPlayer != null && !mediaPlayer.isPlaying()) {
            try {
                // إعادة التشغيل من البداية في كل مرة
                if (mediaPlayer.getCurrentPosition() > 0) {
                    mediaPlayer.seekTo(0);
                }
                mediaPlayer.start();
            } catch (Exception e) {
                e.printStackTrace();
            }
        }

        // تفعيل الاهتزاز النشط المتكرر (نمط قوي)
        startVibration();

        // تفعيل كشف الهز
        if (sensorManager != null && accelerometer != null) {
            sensorManager.registerListener(this, accelerometer, SensorManager.SENSOR_DELAY_GAME);
        }

        return START_STICKY;
    }

    /**
     * رفع مستوى صوت المنبه (STREAM_ALARM) إلى الحد الأقصى.
     * يحفظ المستوى الحالي أولاً لإعادته عند الإيقاف.
     */
    private void maximizeAlarmVolume() {
        try {
            if (audioManager == null) return;
            originalAlarmVolume = audioManager.getStreamVolume(AudioManager.STREAM_ALARM);
            int maxVolume = audioManager.getStreamMaxVolume(AudioManager.STREAM_ALARM);
            audioManager.setStreamVolume(AudioManager.STREAM_ALARM, maxVolume, 0);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    /**
     * إعادة مستوى صوت المنبه إلى قيمته الأصلية.
     */
    private void restoreAlarmVolume() {
        try {
            if (audioManager != null && originalAlarmVolume >= 0) {
                audioManager.setStreamVolume(AudioManager.STREAM_ALARM, originalAlarmVolume, 0);
                originalAlarmVolume = -1;
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    /**
     * تشغيل اهتزاز قوي متكرر لجذب انتباه المستخدم.
     */
    private void startVibration() {
        try {
            if (vibrator == null || !vibrator.hasVibrator()) return;
            long[] pattern = {0, 800, 400, 800, 400, 800, 400}; // انتظار، اهتزاز، سكون...
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                vibrator.vibrate(VibrationEffect.createWaveform(pattern, 0));
            } else {
                vibrator.vibrate(pattern, 0);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    /**
     * إيقاف الاهتزاز.
     */
    private void stopVibration() {
        try {
            if (vibrator != null) vibrator.cancel();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    @Override
    public void onDestroy() {
        // إيقاف كشف الهز
        if (sensorManager != null) {
            sensorManager.unregisterListener(this);
        }

        // إيقاف الاهتزاز
        stopVibration();

        // إيقاف الصوت وتحرير الموارد
        if (mediaPlayer != null) {
            try {
                if (mediaPlayer.isPlaying()) {
                    mediaPlayer.stop();
                }
                mediaPlayer.release();
            } catch (Exception e) {
                e.printStackTrace();
            }
            mediaPlayer = null;
        }

        // إعادة مستوى الصوت إلى وضعه الأصلي
        restoreAlarmVolume();

        // تحرير WakeLock
        try {
            if (wakeLock != null && wakeLock.isHeld()) {
                wakeLock.release();
            }
        } catch (Exception e) {
            e.printStackTrace();
        }

        super.onDestroy();
    }

    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }

    @Override
    public void onSensorChanged(SensorEvent event) {
        if (event.sensor.getType() == Sensor.TYPE_ACCELEROMETER) {
            float x = event.values[0];
            float y = event.values[1];
            float z = event.values[2];
            float magnitude = (float) Math.sqrt(x * x + y * y + z * z);
            long now = System.currentTimeMillis();
            // كشف الهز مع منع التكرار السريع (debounce)
            if (magnitude > SHAKE_THRESHOLD && (now - lastShakeTime) > SHAKE_DEBOUNCE_MS) {
                lastShakeTime = now;
                // هزّ الجهاز: أوقف المنبه (الخدمة ستوقف نفسها وتنظّف الموارد)
                stopSelf();
            }
        }
    }

    @Override
    public void onAccuracyChanged(Sensor sensor, int accuracy) {
        // غير مستخدم
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationManager nm = getSystemService(NotificationManager.class);
            if (nm != null && nm.getNotificationChannel(CHANNEL_ID) == null) {
                NotificationChannel channel = new NotificationChannel(
                        CHANNEL_ID,
                        "Quran Alarm Service",
                        NotificationManager.IMPORTANCE_HIGH);
                channel.setDescription("خدمة المنبه عالية الأولوية - صوت واهتزاز قوي");
                channel.enableVibration(true);
                channel.setVibrationPattern(new long[]{0, 800, 400, 800, 400});
                channel.setLockscreenVisibility(Notification.VISIBILITY_PUBLIC);
                channel.setBypassDnd(true); // تجاوز وضع عدم الإزعاج
                channel.setShowBadge(true);
                nm.createNotificationChannel(channel);
            }
        }
    }
}