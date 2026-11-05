package com.mushafalmurajaa.app;

import android.app.Activity;
import android.content.Intent;
import android.net.Uri;
import android.util.Base64;
import androidx.activity.result.ActivityResult;
import com.getcapacitor.*;
import com.getcapacitor.annotation.*;
import java.io.*;
import java.nio.charset.StandardCharsets;

@CapacitorPlugin(name = "AyahFiles")
public class AyahFilesPlugin extends Plugin {
    @PluginMethod public void prepareFile(PluginCall call) {
        String name=call.getString("name", ""), encoded=call.getString("base64", "");
        if(!name.matches("[A-Za-z0-9][A-Za-z0-9._-]{0,99}") || encoded.length()>28000000) {
            call.reject("Invalid file");return;
        }
        try {
            File directory=new File(getContext().getCacheDir(),"ayah-share");
            if(!directory.exists()&&!directory.mkdirs())throw new IOException("No cache directory");
            File[] old=directory.listFiles();
            if(old!=null)for(File f:old)if(f.isFile()&&System.currentTimeMillis()-f.lastModified()>172800000L)f.delete();
            File target=new File(directory,System.currentTimeMillis()+"-"+name);
            byte[] bytes=Base64.decode(encoded,Base64.DEFAULT);
            try(FileOutputStream out=new FileOutputStream(target)){out.write(bytes);}
            JSObject result=new JSObject();result.put("url",Uri.fromFile(target).toString());call.resolve(result);
        }catch(Exception error){call.reject("Could not prepare file",error);}
    }

    @PluginMethod public void saveBackup(PluginCall call) {
        String text=call.getString("text","");
        if(text.length()>40000000){call.reject("Backup too large");return;}
        Intent intent=new Intent(Intent.ACTION_CREATE_DOCUMENT);
        intent.addCategory(Intent.CATEGORY_OPENABLE);intent.setType("application/json");
        intent.putExtra(Intent.EXTRA_TITLE,"mushaf-personal-notes.json");
        startActivityForResult(call,intent,"backupCreated");
    }

    @PluginMethod public void saveText(PluginCall call) {
        String text=call.getString("text","");
        if(text.length()>40000000){call.reject("Text too large");return;}
        Intent intent=new Intent(Intent.ACTION_CREATE_DOCUMENT);
        intent.addCategory(Intent.CATEGORY_OPENABLE);intent.setType("text/plain");
        intent.putExtra(Intent.EXTRA_TITLE,"mushaf-notes.txt");
        startActivityForResult(call,intent,"backupCreated");
    }

    @ActivityCallback private void backupCreated(PluginCall call,ActivityResult result) {
        if(call==null)return;
        if(result.getResultCode()!=Activity.RESULT_OK||result.getData()==null||result.getData().getData()==null){call.reject("Cancelled");return;}
        try(OutputStream out=getContext().getContentResolver().openOutputStream(result.getData().getData(),"wt")){
            if(out==null)throw new IOException("No output stream");
            out.write(call.getString("text","").getBytes(StandardCharsets.UTF_8));
        }catch(Exception error){call.reject("Could not save backup",error);return;}
        call.resolve();
    }
}
