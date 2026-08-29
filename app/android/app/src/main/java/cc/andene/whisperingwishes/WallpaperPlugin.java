package cc.andene.whisperingwishes;

import android.app.WallpaperManager;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.os.Build;
import android.util.Base64;
import android.util.Log;

import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.io.File;
import java.io.FileOutputStream;

// Small in-project Capacitor plugin (no separate npm package, same pattern as SystemSettingsPlugin/
// PullBubblePlugin) — sets a collection asset as the phone's wallpaper. Called from
// WallpaperCard.jsx after the user picks an asset via CollectionGrid's own picker icon
// (state.profile.wallpaperAsset) and taps "Set Home/Lock/Both" there.
//
// Takes a plain base64-encoded image (JS already resolved the asset — bundled Vite path or a
// remote URL, doesn't matter to this plugin — into bytes via fetch()+FileReader, same
// "give native a real decodable payload" shape as WidgetAssetUtils.cachedAssetVideoUri/
// PullBubbleService's own asset-to-cache-file pattern elsewhere in this app) rather than a
// path, so this plugin never needs to know or care where the image actually came from.
@CapacitorPlugin(name = "Wallpaper")
public class WallpaperPlugin extends Plugin {
    @PluginMethod
    public void setWallpaper(PluginCall call) {
        String base64 = call.getString("base64");
        String target = call.getString("target", "both");
        if (base64 == null || base64.isEmpty()) {
            call.reject("Missing image data");
            return;
        }

        Bitmap bitmap;
        try {
            byte[] bytes = Base64.decode(base64, Base64.DEFAULT);
            bitmap = BitmapFactory.decodeByteArray(bytes, 0, bytes.length);
        } catch (Exception e) {
            call.reject("Could not decode image: " + e.getMessage());
            return;
        }
        if (bitmap == null) {
            call.reject("Could not decode image");
            return;
        }

        try {
            WallpaperManager manager = WallpaperManager.getInstance(getContext());
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
                // FLAG_SYSTEM/FLAG_LOCK distinguish home vs. lock screen only on API 24+ —
                // below that, setBitmap(Bitmap) always sets both (there's no lock-screen
                // wallpaper API pre-N at all), so the plain overload there is already correct.
                int flags = "home".equals(target) ? WallpaperManager.FLAG_SYSTEM
                        : "lock".equals(target) ? WallpaperManager.FLAG_LOCK
                        : (WallpaperManager.FLAG_SYSTEM | WallpaperManager.FLAG_LOCK);
                manager.setBitmap(bitmap, null, true, flags);
            } else {
                manager.setBitmap(bitmap);
            }
            call.resolve();
        } catch (Exception e) {
            call.reject("Could not set wallpaper: " + e.getMessage());
        } finally {
            bitmap.recycle();
        }
    }

    // Applies a real Android Live Wallpaper (LiveVideoWallpaperService) instead of a static
    // bitmap — the JS side (utils/wallpaper.js's setAnimatedWallpaper) already fetched the
    // video and base64-encoded it, same "give native a real decodable payload, not a path"
    // shape as setWallpaper() above. Caches the decoded bytes to a real file under
    // getFilesDir() (NOT getCacheDir() — this needs to persist and be readable by the
    // wallpaper service's own process indefinitely, not just for one session), stores that
    // path in the same CapacitorStorage SharedPreferences LiveVideoWallpaperService reads from,
    // then fires ACTION_CHANGE_LIVE_WALLPAPER — which opens Android's own system confirmation
    // screen naming the service; that step can't be skipped or silently auto-confirmed.
    @PluginMethod
    public void setLiveWallpaper(PluginCall call) {
        String base64 = call.getString("base64");
        if (base64 == null || base64.isEmpty()) {
            call.reject("Missing video data");
            return;
        }

        byte[] bytes;
        try {
            bytes = Base64.decode(base64, Base64.DEFAULT);
        } catch (Exception e) {
            call.reject("Could not decode video: " + e.getMessage());
            return;
        }

        Context context = getContext();
        File outFile = new File(context.getFilesDir(), "live_wallpaper_current.mp4");
        try (FileOutputStream out = new FileOutputStream(outFile)) {
            out.write(bytes);
        } catch (Exception e) {
            call.reject("Could not cache video: " + e.getMessage());
            return;
        }

        SharedPreferences prefs = context.getSharedPreferences(
                LiveVideoWallpaperService.PREFS_NAME, Context.MODE_PRIVATE);
        prefs.edit().putString(LiveVideoWallpaperService.PREF_VIDEO_PATH, outFile.getAbsolutePath()).apply();

        try {
            Intent changeWallpaper = new Intent(WallpaperManager.ACTION_CHANGE_LIVE_WALLPAPER);
            changeWallpaper.putExtra(WallpaperManager.EXTRA_LIVE_WALLPAPER_COMPONENT,
                    new ComponentName(context, LiveVideoWallpaperService.class));
            changeWallpaper.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            getActivity().startActivity(changeWallpaper);
            call.resolve();
        } catch (Exception e) {
            Log.w("WallpaperPlugin", "Could not open live wallpaper picker", e);
            call.reject("Could not open live wallpaper picker: " + e.getMessage());
        }
    }
}
