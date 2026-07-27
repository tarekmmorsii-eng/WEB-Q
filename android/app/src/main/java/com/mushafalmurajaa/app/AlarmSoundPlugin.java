package com.mushafalmurajaa.app;

import android.content.Intent;
import android.os.Build;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.annotation.CapacitorPlugin;

/**
 * مكوّن Capacitor أصلي يربط طبقة الويب (JavaScript) بخدمة AlarmSoundService.
 * يفضح طريقتين: start() لبدء خدمة المنبه (تشغيل الصوت + كشف الهز)،
 * و stop() لإيقافها.
 *
 * ملاحظة: في Capacitor 8 تم إزالة @PluginMethod لأن جميع الدوال العامة
 * تُفضح تلقائياً دون الحاجة لشرح توضيحي.
 */
@CapacitorPlugin(name = "AlarmSound")
public class AlarmSoundPlugin extends Plugin {

    public void start(PluginCall call) {
        Intent intent = new Intent(getContext(), AlarmSoundService.class);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            getContext().startForegroundService(intent);
        } else {
            getContext().startService(intent);
        }
        call.resolve();
    }

    public void stop(PluginCall call) {
        Intent intent = new Intent(getContext(), AlarmSoundService.class);
        getContext().stopService(intent);
        call.resolve();
    }
}