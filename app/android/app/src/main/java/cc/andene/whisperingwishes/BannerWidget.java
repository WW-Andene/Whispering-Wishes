package cc.andene.whisperingwishes;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.res.AssetManager;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.BitmapShader;
import android.graphics.Canvas;
import android.graphics.Paint;
import android.graphics.RectF;
import android.graphics.Shader;
import android.util.Log;
import android.widget.RemoteViews;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.IOException;
import java.io.InputStream;

// Home-screen "gacha banner" widget — the featured character banner (art,
// name, Featured 4★ row, ▶️ convene-animation button), mirroring
// BannerCard.jsx as closely as RemoteViews allows.
//
// RemoteViews platform limits (this is not a guess — it's enforced by the
// OS itself, since a widget is drawn by the launcher app's process, not
// ours): only a fixed whitelist of views can be inflated (no WebView, no
// VideoView, no custom Views), and images must be delivered as an actual
// Bitmap (via setImageViewBitmap) or a resource id — a widget process can't
// load arbitrary URLs/paths itself, so this class decodes bitmaps here
// (from the app's own bundled assets, since it runs in the app's process)
// and hands the launcher finished pixels. That's also why the ▶️ button
// can't play video in place — it launches ConveneAnimationActivity instead,
// a real Activity (VideoView works fine there).
//
// Data comes from @capacitor/preferences's "CapacitorStorage" SharedPreferences
// file, written by src/utils/widgetSync.js's syncBannerWidget() whenever the
// featured banner changes — this class only reads it.
public class BannerWidget extends AppWidgetProvider {
    private static final String TAG = "BannerWidget";
    private static final String PREFS_NAME = "CapacitorStorage";
    private static final String KEY_NAME = "widget_banner_name";
    private static final String KEY_TITLE = "widget_banner_title";
    private static final String KEY_ART_ASSET = "widget_banner_art_asset";
    private static final String KEY_FEATURED4 = "widget_banner_featured4";
    private static final String KEY_CONVENE_URL = "widget_banner_convene_url";
    // Capacitor's webDir (dist-native) is bundled at android_asset/public/ —
    // see capacitor.config.json's "webDir" and capacitor-build/build.mjs.
    private static final String ASSET_PREFIX = "public/";
    private static final int THUMB_PX = 96; // decode target for the 30dp featured-4★ thumbnails

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        for (int appWidgetId : appWidgetIds) {
            updateWidget(context, appWidgetManager, appWidgetId);
        }
    }

    private void updateWidget(Context context, AppWidgetManager appWidgetManager, int appWidgetId) {
        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        String name = prefs.getString(KEY_NAME, null);
        String title = prefs.getString(KEY_TITLE, null);
        String artAsset = prefs.getString(KEY_ART_ASSET, null);
        String featured4Json = prefs.getString(KEY_FEATURED4, null);
        String conveneUrl = prefs.getString(KEY_CONVENE_URL, null);

        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.widget_banner);

        if (name != null) {
            views.setTextViewText(R.id.widget_banner_name, name);
            views.setTextViewText(R.id.widget_banner_element, title != null ? title.toUpperCase() : "");
        } else {
            views.setTextViewText(R.id.widget_banner_name, context.getString(R.string.app_name));
            views.setTextViewText(R.id.widget_banner_element, "");
        }

        Bitmap art = decodeAsset(context, artAsset, 800);
        if (art != null) {
            views.setImageViewBitmap(R.id.widget_art, art);
        }

        int[] slotIds = { R.id.widget_f4_1, R.id.widget_f4_2, R.id.widget_f4_3 };
        for (int id : slotIds) views.setViewVisibility(id, android.view.View.GONE);
        if (featured4Json != null) {
            try {
                JSONArray arr = new JSONArray(featured4Json);
                for (int i = 0; i < arr.length() && i < slotIds.length; i++) {
                    JSONObject entry = arr.getJSONObject(i);
                    Bitmap thumb = decodeAsset(context, entry.optString("asset", null), THUMB_PX);
                    if (thumb != null) {
                        views.setImageViewBitmap(slotIds[i], roundedCorners(thumb, 6f));
                        views.setViewVisibility(slotIds[i], android.view.View.VISIBLE);
                    }
                }
            } catch (Exception e) {
                Log.w(TAG, "Failed to parse widget_banner_featured4", e);
            }
        }

        if (conveneUrl != null) {
            views.setViewVisibility(R.id.widget_play, android.view.View.VISIBLE);
            Intent playIntent = new Intent(context, ConveneAnimationActivity.class);
            playIntent.putExtra(ConveneAnimationActivity.EXTRA_VIDEO_URL, conveneUrl);
            playIntent.putExtra(ConveneAnimationActivity.EXTRA_CHAR_NAME, name);
            playIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
            PendingIntent playPendingIntent = PendingIntent.getActivity(
                    context, appWidgetId * 10 + 1, playIntent,
                    PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
            views.setOnClickPendingIntent(R.id.widget_play, playPendingIntent);
        } else {
            views.setViewVisibility(R.id.widget_play, android.view.View.GONE);
        }

        // Tapping anywhere else on the banner opens the app itself, same as
        // the countdown widget.
        Intent launchIntent = new Intent(context, MainActivity.class);
        PendingIntent pendingIntent = PendingIntent.getActivity(
                context, appWidgetId, launchIntent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        views.setOnClickPendingIntent(R.id.widget_root, pendingIntent);

        appWidgetManager.updateAppWidget(appWidgetId, views);
    }

    // Reads a bundled web asset (public/<assetPath>) and decodes it downsampled
    // to roughly targetPx on its longest side — RemoteViews Bitmaps are sent
    // through a Binder transaction with a size limit, so full-resolution
    // character sprites (some multiple MB) would risk a
    // TransactionTooLargeException; a decode-bounds pass picks an inSampleSize
    // first so the full bitmap is never held in memory just to downscale it after.
    private static Bitmap decodeAsset(Context context, String assetPath, int targetPx) {
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
            try (InputStream stream = am.open(fullPath)) {
                return BitmapFactory.decodeStream(stream, null, opts);
            }
        } catch (IOException e) {
            // Expected for characters without local art, or if the asset was
            // renamed — widgetSync.js writes whatever DEFAULT_COLLECTION_IMAGES
            // resolves to, which this class doesn't independently validate.
            Log.w(TAG, "Asset not found: " + fullPath);
            return null;
        }
    }

    // Rounds a bitmap's corners by radius (dp, pre-scaled to px by the caller's
    // density) — RemoteViews ImageViews can't clip to a rounded drawable
    // themselves pre-API 31, so this bakes the rounding into the pixels.
    private static Bitmap roundedCorners(Bitmap src, float radiusDp) {
        float radius = radiusDp * 2.75f; // ~mdpi-independent approximation, matches THUMB_PX's fixed decode target
        Bitmap output = Bitmap.createBitmap(src.getWidth(), src.getHeight(), Bitmap.Config.ARGB_8888);
        Canvas canvas = new Canvas(output);
        Paint paint = new Paint(Paint.ANTI_ALIAS_FLAG);
        paint.setShader(new BitmapShader(src, Shader.TileMode.CLAMP, Shader.TileMode.CLAMP));
        RectF rect = new RectF(0, 0, src.getWidth(), src.getHeight());
        canvas.drawRoundRect(rect, radius, radius, paint);
        return output;
    }

    // Called from MainActivity.onResume() so reopening the app refreshes the
    // widget sooner than the OS's own 30-minute floor.
    public static void requestUpdate(Context context) {
        Intent intent = new Intent(context, BannerWidget.class);
        intent.setAction(AppWidgetManager.ACTION_APPWIDGET_UPDATE);
        AppWidgetManager manager = AppWidgetManager.getInstance(context);
        int[] ids = manager.getAppWidgetIds(new ComponentName(context, BannerWidget.class));
        if (ids.length == 0) return;
        intent.putExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS, ids);
        context.sendBroadcast(intent);
    }
}
