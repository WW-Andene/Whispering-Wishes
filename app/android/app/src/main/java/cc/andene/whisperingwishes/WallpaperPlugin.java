package cc.andene.whisperingwishes;

import android.app.WallpaperManager;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.os.Build;
import android.util.Base64;

import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

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
}
