package com.mushafalmurajaa.app;

import android.app.Activity;
import android.content.Intent;
import android.content.ActivityNotFoundException;
import android.net.Uri;
import android.util.Base64;
import androidx.activity.result.ActivityResult;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.ActivityCallback;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;

@CapacitorPlugin(name = "FeedbackImages")
public class FeedbackImagesPlugin extends Plugin {
    private static final int MAX_BYTES = 8 * 1024 * 1024;

    @PluginMethod public void choose(PluginCall call) {
        // Both the photo picker and document providers return a granted content URI.
        // Keep both on the native reader; do not return provider-backed Files to WebView.
        Intent intent = new Intent("files".equals(call.getString("source"))
                ? Intent.ACTION_OPEN_DOCUMENT : Intent.ACTION_GET_CONTENT);
        intent.addCategory(Intent.CATEGORY_OPENABLE);
        intent.setType("image/*");
        intent.putExtra(Intent.EXTRA_MIME_TYPES, new String[]{"image/jpeg", "image/png", "image/webp"});
        intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
        try {
            startActivityForResult(call, intent, "imageSelected");
        } catch (ActivityNotFoundException missingPicker) {
            intent.setAction(Intent.ACTION_OPEN_DOCUMENT);
            try { startActivityForResult(call, intent, "imageSelected"); }
            catch (ActivityNotFoundException missingDocuments) { call.reject("decode", missingDocuments); }
        }
    }

    @ActivityCallback private void imageSelected(PluginCall call, ActivityResult result) {
        if (call == null) return;
        if (result.getResultCode() != Activity.RESULT_OK || result.getData() == null) {
            JSObject cancelled = new JSObject(); cancelled.put("cancelled", true); call.resolve(cancelled); return;
        }
        Intent data = result.getData();
        Uri selected = data.getData();
        if (selected == null && data.getClipData() != null && data.getClipData().getItemCount() > 0)
            selected = data.getClipData().getItemAt(0).getUri();
        if (selected == null) { call.reject("decode"); return; }
        final Uri uri = selected;
        // Read the granted content URI in the app process, rather than passing
        // a provider-backed File to Chromium (NotReadableError on some pickers).
        getBridge().execute(() -> {
            try {
                String type = getContext().getContentResolver().getType(uri);
                if (!"image/jpeg".equals(type) && !"image/png".equals(type) && !"image/webp".equals(type)) {
                    call.reject("type"); return;
                }
                try (InputStream input = getContext().getContentResolver().openInputStream(uri);
                 ByteArrayOutputStream output = new ByteArrayOutputStream()) {
                if (input == null) throw new java.io.IOException("No image stream");
                byte[] buffer = new byte[16384]; int count;
                while ((count = input.read(buffer)) != -1) {
                    if (output.size() + count > MAX_BYTES) { call.reject("size"); return; }
                    output.write(buffer, 0, count);
                }
                JSObject image = new JSObject();
                image.put("mimeType", type);
                image.put("base64", Base64.encodeToString(output.toByteArray(), Base64.NO_WRAP));
                call.resolve(image);
                }
            } catch (Exception error) { call.reject("decode", error); }
        });
    }
}
