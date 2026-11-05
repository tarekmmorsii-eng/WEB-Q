package com.mushafalmurajaa.app;

import android.app.Application;
import android.content.Context;
import android.content.BroadcastReceiver;
import android.content.Intent;
import android.content.IntentFilter;
import android.util.Log;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

/** Explicit bridge: no SDK access from load(), before an eligible consent decision. */
@CapacitorPlugin(name = "MetaMeasurement")
public class MetaMeasurementPlugin extends Plugin {
    // FacebookSdk is process-wide: Activity/plugin recreation must not lose revocation state.
    private static boolean active = false;
    private static boolean touched = false;
    private static boolean diagnosticsRegistered = false;

    // Beta only: observe SDK delivery status, never event bodies or identifiers.
    private void registerDeliveryDiagnostics() throws Exception {
        if (diagnosticsRegistered || !getContext().getPackageName().endsWith(".beta")) return;
        Class<?> broadcasts = Class.forName("androidx.localbroadcastmanager.content.LocalBroadcastManager");
        Object manager = broadcasts.getMethod("getInstance", Context.class)
                .invoke(null, getContext().getApplicationContext());
        BroadcastReceiver receiver = new BroadcastReceiver() {
            @Override public void onReceive(Context context, Intent intent) {
                Object result = intent.getSerializableExtra("com.facebook.sdk.APP_EVENTS_FLUSH_RESULT");
                String status = result instanceof Enum<?> ? ((Enum<?>) result).name() : "UNKNOWN";
                int count = intent.getIntExtra("com.facebook.sdk.APP_EVENTS_NUM_EVENTS_FLUSHED", 0);
                Log.i("MetaDelivery", "flush result=" + status + " count=" + count);
            }
        };
        broadcasts.getMethod("registerReceiver", BroadcastReceiver.class, IntentFilter.class)
                .invoke(manager, receiver, new IntentFilter("com.facebook.sdk.APP_EVENTS_FLUSHED"));
        diagnosticsRegistered = true;
        Log.i("MetaDelivery", "delivery observer ready");
    }

    @PluginMethod
    public void applyChoice(PluginCall call) {
        final boolean allowed = Boolean.TRUE.equals(call.getBoolean("allowed"))
                && "adult".equals(call.getString("age")) && Integer.valueOf(1).equals(call.getInt("version"));
        getActivity().runOnUiThread(() -> {
            try {
                if (!allowed && !touched) {
                    if (getContext().getPackageName().endsWith(".beta"))
                        Log.i("MetaDelivery", "choice denied; SDK untouched");
                    respond(call, false, false); return;
                }
                // Reflection keeps builds with metaEventsEnabled=false free of SDK dependencies.
                Class<?> sdk;
                try { sdk = Class.forName("com.facebook.FacebookSdk"); }
                catch (ClassNotFoundException absent) { respond(call, false, false); return; }
                Class<?> logger = Class.forName("com.facebook.appevents.AppEventsLogger");
                Class<?> flushType = Class.forName("com.facebook.appevents.AppEventsLogger$FlushBehavior");
                if (!allowed) {
                    sdk.getMethod("setAutoLogAppEventsEnabled", boolean.class).invoke(null, false);
                    Object explicit = flushType.getField("EXPLICIT_ONLY").get(null);
                    logger.getMethod("setFlushBehavior", flushType).invoke(null, explicit);
                    active = false;
                    if (getContext().getPackageName().endsWith(".beta"))
                        Log.i("MetaDelivery", "choice denied; autoLog="
                                + sdk.getMethod("getAutoLogAppEventsEnabled").invoke(null)
                                + " flush=" + logger.getMethod("getFlushBehavior").invoke(null));
                    respond(call, true, false);
                    return;
                }
                if (active) { respond(call, true, true); return; }
                touched = true;
                registerDeliveryDiagnostics();
                // SDK 19 starts asynchronous Graph requests inside sdkInitialize().
                // Mark explicit consent initialization first so those requests cannot
                // race the fully-initialized flag. This method only sets that flag.
                sdk.getMethod("fullyInitialize").invoke(null);
                sdk.getMethod("sdkInitialize", Context.class).invoke(null, getContext().getApplicationContext());
                sdk.getMethod("setAdvertiserIDCollectionEnabled", boolean.class).invoke(null, false);
                sdk.getMethod("setAutoLogAppEventsEnabled", boolean.class).invoke(null, true);
                Object automatic = flushType.getField("AUTO").get(null);
                logger.getMethod("setFlushBehavior", flushType).invoke(null, automatic);
                logger.getMethod("activateApp", Application.class).invoke(null, getActivity().getApplication());
                active = true;
                if (getContext().getPackageName().endsWith(".beta")) {
                    final Class<?> diagnosticSdk = sdk;
                    final Context appContext = getContext().getApplicationContext();
                    new android.os.Handler(android.os.Looper.getMainLooper()).postDelayed(() -> {
                        if (!active) return;
                        try {
                            String appId = (String) diagnosticSdk.getMethod("getApplicationId").invoke(null);
                            boolean installAcknowledged = appContext.getSharedPreferences(
                                    "com.facebook.sdk.attributionTracking", Context.MODE_PRIVATE)
                                    .getLong(appId + "ping", 0) > 0;
                            Log.i("MetaDelivery", "install acknowledged=" + installAcknowledged
                                    + " autoLog=" + diagnosticSdk.getMethod("getAutoLogAppEventsEnabled").invoke(null)
                                    + " initialized=" + diagnosticSdk.getMethod("isFullyInitialized").invoke(null));
                        } catch (Exception diagnosticError) {
                            Log.i("MetaDelivery", "diagnostic state unavailable");
                        }
                    }, 20000);
                }
                respond(call, true, true);
            } catch (Exception error) {
                call.reject("Could not apply Meta measurement choice");
            }
        });
    }

    private void respond(PluginCall call, boolean available, boolean enabled) {
        JSObject result = new JSObject();
        result.put("available", available);
        result.put("enabled", enabled);
        call.resolve(result);
    }
}
