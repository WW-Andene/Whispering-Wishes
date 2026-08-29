package cc.andene.whisperingwishes;

import android.app.WallpaperManager;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Matrix;
import android.graphics.Point;
import android.os.Build;
import android.util.Base64;
import android.util.Log;
import android.view.Display;
import android.view.WindowManager;

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

        // The source asset is banner art (16:9 landscape); handing it to setBitmap() as-is
        // lets the system stretch it to the screen's own (typically ~9:16 portrait) aspect
        // ratio instead of cropping it — the "squished" look. Center-crop it to the actual
        // screen's aspect ratio ourselves first (same object-fit:cover behavior the web app
        // uses for these same images) so what lands on the device is an edge-to-edge,
        // centered crop rather than a stretched copy.
        Bitmap cropped = centerCropToScreenAspect(bitmap);
        if (cropped != bitmap) bitmap.recycle();

        try {
            WallpaperManager manager = WallpaperManager.getInstance(getContext());
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
                // FLAG_SYSTEM/FLAG_LOCK distinguish home vs. lock screen only on API 24+ —
                // below that, setBitmap(Bitmap) always sets both (there's no lock-screen
                // wallpaper API pre-N at all), so the plain overload there is already correct.
                int flags = "home".equals(target) ? WallpaperManager.FLAG_SYSTEM
                        : "lock".equals(target) ? WallpaperManager.FLAG_LOCK
                        : (WallpaperManager.FLAG_SYSTEM | WallpaperManager.FLAG_LOCK);
                manager.setBitmap(cropped, null, true, flags);
            } else {
                manager.setBitmap(cropped);
            }
            call.resolve();
        } catch (Exception e) {
            call.reject("Could not set wallpaper: " + e.getMessage());
        } finally {
            cropped.recycle();
        }
    }

    // Center-crop (CSS object-fit:cover equivalent) `src` down to the device's real screen
    // aspect ratio, scaling up first if the source is smaller than the screen in the
    // cover-relevant dimension. Returns `src` unchanged if the screen size can't be read.
    private Bitmap centerCropToScreenAspect(Bitmap src) {
        WindowManager wm = (WindowManager) getContext().getSystemService(Context.WINDOW_SERVICE);
        if (wm == null) return src;
        Display display = wm.getDefaultDisplay();
        if (display == null) return src;
        Point size = new Point();
        display.getRealSize(size);
        int screenW = size.x;
        int screenH = size.y;
        if (screenW <= 0 || screenH <= 0) return src;

        int srcW = src.getWidth();
        int srcH = src.getHeight();
        float screenRatio = (float) screenW / screenH;
        float srcRatio = (float) srcW / srcH;

        // Scale up so the source fully covers the screen in both dimensions, then crop the
        // centered screenW x screenH window out of it.
        float scale = srcRatio > screenRatio ? (float) screenH / srcH : (float) screenW / srcW;
        int scaledW = Math.round(srcW * scale);
        int scaledH = Math.round(srcH * scale);
        Matrix matrix = new Matrix();
        matrix.setScale(scale, scale);
        Bitmap scaled = Bitmap.createBitmap(src, 0, 0, srcW, srcH, matrix, true);

        int cropW = Math.min(screenW, scaledW);
        int cropH = Math.min(screenH, scaledH);
        int left = Math.max(0, (scaledW - cropW) / 2);
        int top = Math.max(0, (scaledH - cropH) / 2);
        Bitmap cropped = Bitmap.createBitmap(scaled, left, top, cropW, cropH);
        if (cropped != scaled) scaled.recycle();
        return cropped;
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
