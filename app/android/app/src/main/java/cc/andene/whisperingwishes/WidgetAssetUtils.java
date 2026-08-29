package cc.andene.whisperingwishes;

import android.content.Context;
import android.content.res.AssetManager;
import android.content.res.Resources;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.BitmapShader;
import android.graphics.Canvas;
import android.graphics.Paint;
import android.graphics.RectF;
import android.graphics.Shader;
import android.os.Build;
import android.util.Log;

import java.io.IOException;
import java.io.InputStream;

// Used by PulseBannerWidget.java to turn a bundled web asset path (from
// DEFAULT_COLLECTION_IMAGES/banner art, written into SharedPreferences by
// widgetSync.js) into a Bitmap, since RemoteViews can't load an image by
// path/URL itself — see PulseBannerWidget.java's file header for the platform
// reasoning. Split out of PulseBannerWidget.java on its own since an earlier,
// since-removed floating-overlay feature needed the exact same logic too.
final class WidgetAssetUtils {
    private static final String TAG = "WidgetAssetUtils";
    // Capacitor's webDir (dist-native) is bundled at android_asset/public/ —
    // see capacitor.config.json's "webDir" and capacitor-build/build.mjs.
    private static final String ASSET_PREFIX = "public/";

    private WidgetAssetUtils() {}

    static Bitmap decodeAsset(Context context, String assetPath, int targetPx) {
        return decodeAsset(context, assetPath, targetPx, Bitmap.Config.ARGB_8888);
    }

    // Reads a bundled web asset (public/<assetPath>) and decodes it downsampled
    // to roughly targetPx on its longest side — both callers pass this through
    // RemoteViews (Binder-size-limited) or hold it in a long-lived overlay
    // view, so a decode-bounds pass picks an inSampleSize first rather than
    // holding a full-resolution character sprite (some multiple MB) just to
    // downscale it after.
    // config lets a caller ask for RGB_565 (2 bytes/px, no alpha channel)
    // instead of the default ARGB_8888 (4 bytes/px) — halves the decoded
    // bitmap's memory footprint, which matters a lot here: every Bitmap
    // passed through RemoteViews.setImageViewBitmap() gets serialized whole
    // into the Binder IPC transaction sent to the launcher's process, and
    // that transaction has a combined ~1MB ceiling (throws
    // TransactionTooLargeException past it — the launcher then shows its
    // generic "couldn't load this widget" placeholder, which is what a
    // broken/undeliverable RemoteViews update looks like from the outside).
    // Use RGB_565 for anything opaque (banner art backgrounds); ARGB_8888
    // stays the default for anything that needs a transparent background
    // (icons) to render correctly.
    static Bitmap decodeAsset(Context context, String assetPath, int targetPx, Bitmap.Config config) {
        if (assetPath == null || assetPath.isEmpty()) return null;
        AssetManager am = context.getAssets();
        String fullPath = ASSET_PREFIX + assetPath;
        try {
            BitmapFactory.Options bounds = new BitmapFactory.Options();
            bounds.inJustDecodeBounds = true;
            try (InputStream boundsStream = am.open(fullPath)) {
                BitmapFactory.decodeStream(boundsStream, null, bounds);
            }
            int sample = 1;
            int longest = Math.max(bounds.outWidth, bounds.outHeight);
            while (longest / (sample * 2) >= targetPx) sample *= 2;

            BitmapFactory.Options opts = new BitmapFactory.Options();
            opts.inSampleSize = sample;
            opts.inPreferredConfig = config;
            Bitmap decoded;
            try (InputStream stream = am.open(fullPath)) {
                decoded = BitmapFactory.decodeStream(stream, null, opts);
            }
            if (decoded == null) return null;
            // inSampleSize only halves (it's a power-of-2 subsample, not an
            // exact target) — the loop above stops as soon as one more
            // halving would undershoot targetPx, so the decoded bitmap's
            // longest side can land anywhere in [targetPx, 2*targetPx), not
            // AT targetPx. At RGB_565 that's up to ~4x the intended byte
            // budget in the worst case (double the side length on both
            // axes) — this class exists specifically to keep every bitmap
            // that goes through RemoteViews.setImageViewBitmap() under the
            // combined Binder transaction ceiling documented above, so an
            // up-to-4x-over decode defeats the whole point of picking a
            // small targetPx in the first place, and was very likely
            // contributing to real on-device TransactionTooLargeException
            // ("couldn't load this widget") reports depending on which
            // character's source art happened to hit an unlucky size
            // relative to the next power of 2. One more precise resize
            // closes that gap — only when actually needed (a same-size
            // rescale is a wasted allocation+copy), and only when it would
            // meaningfully shrink things (a few px over isn't worth it).
            int decodedLongest = Math.max(decoded.getWidth(), decoded.getHeight());
            if (decodedLongest > targetPx * 5 / 4) {
                float scale = (float) targetPx / decodedLongest;
                int w = Math.max(1, Math.round(decoded.getWidth() * scale));
                int h = Math.max(1, Math.round(decoded.getHeight() * scale));
                Bitmap resized = Bitmap.createScaledBitmap(decoded, w, h, true);
                if (resized != decoded) decoded.recycle();
                return resized;
            }
            return decoded;
        } catch (IOException e) {
            // Expected for characters without local art, or if the asset was
            // renamed — widgetSync.js writes whatever DEFAULT_COLLECTION_IMAGES
            // resolves to, which this class doesn't independently validate.
            Log.w(TAG, "Asset not found: " + fullPath);
            return null;
        }
    }

    // Android 12+ (S) draws its OWN themed outer widget container/frame on top of whatever this
    // app's own widget_background.xml supplies, clipped to the system's own corner radius
    // (android.R.dimen.system_app_widget_background_radius) — which is a launcher/device value
    // (commonly larger than this app's 16dp), NOT the 16dp this app bakes into its art bitmaps
    // via roundedCorners(). Baking a fixed 16dp radius into the art regardless of that system
    // value is exactly why the art's own corners and the widget's outer frame corners visibly
    // don't match on API 31+: the frame is one radius, the art inside it is another. Below API
    // 31 there's no such system-drawn frame at all — widget_background.xml's own 16dp IS the
    // whole rounded look, so the art should match THAT instead.
    static float widgetCornerRadiusPx(Context context) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            Resources res = Resources.getSystem();
            int resId = res.getIdentifier("system_app_widget_background_radius", "dimen", "android");
            if (resId != 0) {
                try {
                    return res.getDimension(resId);
                } catch (Resources.NotFoundException ignored) {
                    // Fall through to the pre-S fallback below.
                }
            }
        }
        return 16f * context.getResources().getDisplayMetrics().density; // matches widget_background.xml's 16dp
    }

    // Rounds a bitmap's corners by radiusPx — RemoteViews ImageViews can't
    // clip to a rounded drawable pre-API 31, so this bakes the rounding into
    // the pixels; the floating overlay could use a drawable clip instead
    // (it's a real View), but reuses this for one consistent look.
    static Bitmap roundedCorners(Bitmap src, float radiusPx) {
        Bitmap output = Bitmap.createBitmap(src.getWidth(), src.getHeight(), Bitmap.Config.ARGB_8888);
        Canvas canvas = new Canvas(output);
        Paint paint = new Paint(Paint.ANTI_ALIAS_FLAG);
        paint.setShader(new BitmapShader(src, Shader.TileMode.CLAMP, Shader.TileMode.CLAMP));
        RectF rect = new RectF(0, 0, src.getWidth(), src.getHeight());
        canvas.drawRoundRect(rect, radiusPx, radiusPx, paint);
        return output;
    }
}
