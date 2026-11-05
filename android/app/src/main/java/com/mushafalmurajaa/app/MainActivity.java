package com.mushafalmurajaa.app;

import android.os.Bundle;
import android.content.res.Configuration;
import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.widget.ImageView;
import android.widget.FrameLayout;
import android.view.ViewGroup;
import android.webkit.WebView;
import android.os.Build;
import android.view.KeyEvent;
import android.view.View;
import android.view.WindowManager;
import com.getcapacitor.BridgeActivity;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowInsetsControllerCompat;
import androidx.core.view.ViewCompat;
import androidx.core.graphics.Insets;
import androidx.core.view.WindowInsetsAnimationCompat;
import java.util.List;

public class MainActivity extends BridgeActivity {
    private boolean systemBarsVisible = true;
    private boolean systemBarsDarkIcons = true;
    private View overlayContent;
    private int imeAnimations = 0;
    private boolean originalReadingLayout = true;
    private int readingOrientation;
    private ImageView rotationCover;
    private long rotationGeneration = 0;

    public void setOriginalReadingLayout(boolean enabled) {
        originalReadingLayout = enabled;
        if (!enabled) removeRotationCover(rotationGeneration);
    }

    private void removeRotationCover(long generation) {
        if (generation != rotationGeneration || rotationCover == null) return;
        ViewGroup parent = (ViewGroup) rotationCover.getParent();
        if (parent != null) parent.removeView(rotationCover);
        rotationCover.setImageDrawable(null);
        rotationCover = null;
    }

    public void finishReadingRotation(long generation) {
        if (generation != rotationGeneration || rotationCover == null || bridge == null) return;
        // DOM completion alone is insufficient: wait for Chromium to submit the
        // corresponding visual frame before exposing the resized WebView.
        bridge.getWebView().postVisualStateCallback(generation, new WebView.VisualStateCallback() {
            @Override public void onComplete(long requestId) { removeRotationCover(requestId); }
        });
    }

    @Override
    public void onConfigurationChanged(Configuration configuration) {
        boolean changed = readingOrientation != configuration.orientation;
        readingOrientation = configuration.orientation;
        long generation = ++rotationGeneration;
        if (changed && originalReadingLayout && bridge != null && bridge.getWebView() != null) {
            WebView web = bridge.getWebView();
            ViewGroup parent = findViewById(android.R.id.content);
            if (web.getWidth() > 0 && web.getHeight() > 0 && parent != null) {
                try {
                    Bitmap image = Bitmap.createBitmap(web.getWidth(), web.getHeight(), Bitmap.Config.ARGB_8888);
                    web.draw(new Canvas(image));
                    if (rotationCover != null) {
                        ViewGroup previous = (ViewGroup) rotationCover.getParent();
                        if (previous != null) previous.removeView(rotationCover);
                        rotationCover.setImageDrawable(null);
                    }
                    rotationCover = new ImageView(this);
                    rotationCover.setImageBitmap(image);
                    rotationCover.setScaleType(ImageView.ScaleType.FIT_CENTER);
                    rotationCover.setBackgroundColor(image.getPixel(0, image.getHeight() - 1));
                    rotationCover.setClickable(true);
                    rotationCover.setImportantForAccessibility(View.IMPORTANT_FOR_ACCESSIBILITY_NO);
                    parent.addView(rotationCover, new FrameLayout.LayoutParams(
                            ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT));
                    // Fail open if the bridge disappears during a rapid rotation.
                    web.postDelayed(() -> removeRotationCover(generation), 2000);
                } catch (RuntimeException | OutOfMemoryError ignored) {
                    removeRotationCover(generation);
                }
            }
        }
        super.onConfigurationChanged(configuration);
        if (rotationCover != null && bridge != null) {
            bridge.getWebView().post(() -> bridge.getWebView().evaluateJavascript(
                    "requestAnimationFrame(()=>requestAnimationFrame(()=>window.Capacitor.Plugins.MushafSystemBars.finishRotation({generation:"
                            + generation + "})))", null));
        }
    }


    public boolean isImeAnimating() { return imeAnimations > 0; }

    @Override
    public void onCreate(Bundle savedInstanceState) {
        // تسجيل مكوّن التحكم بخدمة صوت المنبه قبل تهيئة الجسر
        registerPlugin(AlarmSoundPlugin.class);
        registerPlugin(MetaMeasurementPlugin.class);
        registerPlugin(MushafSystemBarsPlugin.class);
        registerPlugin(AyahFilesPlugin.class);
        // Added after auto-loaded plugins by BridgeActivity.load(), so this safe
        // implementation replaces the default PushNotifications bridge.
        initialPlugins.add(SafePushNotificationsPlugin.class);
        super.onCreate(savedInstanceState);
        readingOrientation = getResources().getConfiguration().orientation;
        // DEFAULT cutout mode can letterbox the entire window when the status
        // bar is hidden (e.g. Android 14 Samsung notch), even with edge-to-edge
        // and zero WebView padding. Keep the window bounds identical in both states.
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
            WindowManager.LayoutParams attributes = getWindow().getAttributes();
            attributes.layoutInDisplayCutoutMode = WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES;
            getWindow().setAttributes(attributes);
        }
        WindowCompat.setDecorFitsSystemWindows(getWindow(), false);
        installOverlayInsets();
    }

    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        if (hasFocus) {
            installOverlayInsets();
            applySystemBars();
        }
    }

    public void setSystemBarsVisible(boolean visible, boolean darkIcons) {
        systemBarsVisible = visible;
        systemBarsDarkIcons = darkIcons;
        applySystemBars();
    }

    private WindowInsetsCompat overlayInsets(View view, WindowInsetsCompat insets) {
        // Apply the final IME size once. Do not apply interpolated animation
        // sizes afterwards: Android dispatches final insets before onProgress,
        // so mixing them makes WebView bounce between final and partial heights.
        int keyboardBottom = insets.isVisible(WindowInsetsCompat.Type.ime())
                ? insets.getInsets(WindowInsetsCompat.Type.ime()).bottom : 0;
        // Reserve only the physical camera cutout, independent of bar visibility.
        // SHORT_EDGES keeps the window stable; these fixed insets keep Quran text
        // outside the camera area instead of stretching it behind the notch.
        Insets cutout = insets.getInsetsIgnoringVisibility(WindowInsetsCompat.Type.displayCutout());
        int bottom = Math.max(keyboardBottom, cutout.bottom);
        if (view.getPaddingLeft() != cutout.left || view.getPaddingTop() != cutout.top
                || view.getPaddingRight() != cutout.right || view.getPaddingBottom() != bottom) {
            view.setPadding(cutout.left, cutout.top, cutout.right, bottom);
        }
        return withoutSystemBars(insets);
    }

    private WindowInsetsCompat withoutSystemBars(WindowInsetsCompat insets) {
        return new WindowInsetsCompat.Builder(insets)
                .setInsets(WindowInsetsCompat.Type.systemBars() | WindowInsetsCompat.Type.displayCutout(), Insets.NONE)
                .build();
    }

    private void installOverlayInsets() {
        if (bridge != null && bridge.getWebView() != null && bridge.getWebView().getParent() instanceof View) {
            View content = (View) bridge.getWebView().getParent();
            if (overlayContent == content) return;
            overlayContent = content;
            content.setBackgroundColor(android.graphics.Color.BLACK);
            ViewCompat.setOnApplyWindowInsetsListener(content, this::overlayInsets);
            ViewCompat.setWindowInsetsAnimationCallback(content,
                    new WindowInsetsAnimationCompat.Callback(WindowInsetsAnimationCompat.Callback.DISPATCH_MODE_CONTINUE_ON_SUBTREE) {
                        @Override
                        public void onPrepare(WindowInsetsAnimationCompat animation) {
                            if ((animation.getTypeMask() & WindowInsetsCompat.Type.ime()) != 0) imeAnimations++;
                        }
                        @Override
                        public void onEnd(WindowInsetsAnimationCompat animation) {
                            if ((animation.getTypeMask() & WindowInsetsCompat.Type.ime()) != 0) imeAnimations = Math.max(0, imeAnimations - 1);
                        }
                        @Override
                        public WindowInsetsCompat onProgress(WindowInsetsCompat insets,
                                List<WindowInsetsAnimationCompat> runningAnimations) {
                            // Filter bar animations without resizing the content
                            // again with the keyboard's intermediate insets.
                            return withoutSystemBars(insets);
                        }
                    });
            ViewCompat.requestApplyInsets(content);
        }
    }

    private void applySystemBars() {
        // Toggle visibility only: never reinstall listeners or request layout
        // during a tap. The page keeps the same edge-to-edge content area.
        getWindow().setStatusBarColor(android.graphics.Color.TRANSPARENT);
        getWindow().setNavigationBarColor(android.graphics.Color.TRANSPARENT);
        WindowInsetsControllerCompat controller = WindowCompat.getInsetsController(getWindow(), getWindow().getDecorView());
        if (controller == null) return;
        WindowInsetsCompat rootInsets = ViewCompat.getRootWindowInsets(getWindow().getDecorView());
        boolean cameraStrip = rootInsets != null && rootInsets.getInsetsIgnoringVisibility(WindowInsetsCompat.Type.displayCutout()).top > 0;
        controller.setAppearanceLightStatusBars(systemBarsDarkIcons && !cameraStrip);
        controller.setAppearanceLightNavigationBars(systemBarsDarkIcons);
        controller.setSystemBarsBehavior(WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE);
        if (systemBarsVisible) {
            controller.show(WindowInsetsCompat.Type.systemBars());
        } else {
            controller.hide(WindowInsetsCompat.Type.systemBars());
        }
    }

    // التقاط أزرار رفع وخفض الصوت أثناء تشغيل المنبه لإرسال إشارة إيقاف الصوت
    @Override
    public boolean onKeyDown(int keyCode, KeyEvent event) {
        if (keyCode == KeyEvent.KEYCODE_VOLUME_UP || keyCode == KeyEvent.KEYCODE_VOLUME_DOWN) {
            if (bridge != null && bridge.getWebView() != null) {
                bridge.getWebView().evaluateJavascript("window.dispatchEvent(new Event('stopAlarmSound'))", null);
            }
        }
        return super.onKeyDown(keyCode, event);
    }
}
