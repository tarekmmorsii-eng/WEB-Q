package com.mushafalmurajaa.app;

import android.Manifest;
import com.capacitorjs.plugins.pushnotifications.PushNotificationsPlugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;

/** Keep builds without Firebase configuration from terminating the plugin thread. */
@CapacitorPlugin(
    name = "PushNotifications",
    permissions = @Permission(strings = { Manifest.permission.POST_NOTIFICATIONS }, alias = "receive")
)
public class SafePushNotificationsPlugin extends PushNotificationsPlugin {
    @Override
    @PluginMethod
    public void register(PluginCall call) {
        try {
            super.register(call);
        } catch (IllegalStateException error) {
            call.reject("Push notifications are unavailable: Firebase is not configured for this build.",
                "FIREBASE_UNAVAILABLE", error);
        }
    }

    @Override
    @PluginMethod
    public void unregister(PluginCall call) {
        try {
            super.unregister(call);
        } catch (IllegalStateException error) {
            // No initialized Firebase app means there is no registration to remove.
            call.resolve();
        }
    }
}
