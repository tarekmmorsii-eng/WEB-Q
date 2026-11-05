package com.mushafalmurajaa.app;

import com.getcapacitor.Plugin;
import com.getcapacitor.JSObject;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.graphics.Insets;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "MushafSystemBars")
public class MushafSystemBarsPlugin extends Plugin {
    @PluginMethod
    public void setOriginalLayout(PluginCall call) {
        boolean enabled = Boolean.TRUE.equals(call.getBoolean("enabled", true));
        getActivity().runOnUiThread(() -> {
            ((MainActivity) getActivity()).setOriginalReadingLayout(enabled);
            call.resolve();
        });
    }

    @PluginMethod
    public void finishRotation(PluginCall call) {
        Integer generation = call.getInt("generation");
        getActivity().runOnUiThread(() -> {
            if (generation != null) ((MainActivity) getActivity()).finishReadingRotation(generation);
            call.resolve();
        });
    }

    @PluginMethod
    public void hideKeyboard(PluginCall call) {
        getActivity().runOnUiThread(() -> {
            android.view.View webView = getBridge().getWebView();
            androidx.core.view.WindowCompat.getInsetsController(getActivity().getWindow(), webView)
                    .hide(WindowInsetsCompat.Type.ime());
            long start = android.os.SystemClock.uptimeMillis();
            webView.postOnAnimation(new Runnable() {
                int previousHeight = -1;
                int stableFrames = 0;
                @Override public void run() {
                    WindowInsetsCompat insets = ViewCompat.getRootWindowInsets(webView);
                    int height = webView.getHeight();
                    boolean hidden = insets != null && !insets.isVisible(WindowInsetsCompat.Type.ime());
                    boolean animating = ((MainActivity) getActivity()).isImeAnimating();
                    stableFrames = hidden && !animating && height == previousHeight ? stableFrames + 1 : 0;
                    previousHeight = height;
                    if (stableFrames >= 4) { call.resolve(); return; }
                    if (android.os.SystemClock.uptimeMillis() - start > 2500) {
                        call.reject("Keyboard layout did not settle"); return;
                    }
                    webView.postOnAnimation(this);
                }
            });
        });
    }

    @PluginMethod
    public void setVisible(PluginCall call) {
        boolean visible = Boolean.TRUE.equals(call.getBoolean("visible", true));
        boolean darkIcons = Boolean.TRUE.equals(call.getBoolean("darkIcons", true));
        getActivity().runOnUiThread(() -> {
            ((MainActivity) getActivity()).setSystemBarsVisible(visible, darkIcons);
            JSObject result = new JSObject();
            WindowInsetsCompat windowInsets = ViewCompat.getRootWindowInsets(getActivity().getWindow().getDecorView());
            if (windowInsets != null) {
                // Stable sizes even while immersive mode hides the bars. This also
                // works on WebViews that report zero CSS safe-area env() values.
                Insets insets = windowInsets.getInsetsIgnoringVisibility(WindowInsetsCompat.Type.systemBars() | WindowInsetsCompat.Type.displayCutout());
                Insets cutout = windowInsets.getInsetsIgnoringVisibility(WindowInsetsCompat.Type.displayCutout());
                float density = getContext().getResources().getDisplayMetrics().density;
                result.put("top", (int) Math.ceil(Math.max(0, insets.top - cutout.top) / density));
                result.put("bottom", (int) Math.ceil(Math.max(0, insets.bottom - cutout.bottom) / density));
            }
            call.resolve(result);
        });
    }
}
