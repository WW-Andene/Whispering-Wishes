package cc.andene.whisperingwishes;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.graphics.Bitmap;
import android.util.Log;
import android.view.View;
import android.widget.RemoteViews;

import org.json.JSONArray;
import org.json.JSONObject;

// Dedicated "convene player" widget — pick ONE character (any character with a convene
// animation at all, not tied to what's currently on a banner) and play their convene
// clip, nothing else. A separate, simpler widget from PulseBannerWidget (banner art,
// Featured 4★, pull-sim) rather than folded into it, by design — see this app's
// conversation history for why: two different use cases (a full gacha-banner dashboard vs.
// a single-purpose video player) that don't share a natural single layout.
//
// Unlike PulseBannerWidget's ▶️ (a small button on a dashboard, where popping open a
// separate floating window for the clip is a reasonable, minor interruption),
// this widget's ENTIRE purpose is playing a character's clip — a "media player" widget
// that opens something else to actually play media defeats the point. So this one uses
// ConvenePlayerPlaybackService's bitmap-frame-swap technique (same platform-limit
// reasoning as PulseBannerWidget.java's file header: RemoteViews can't host a VideoView
// at all) to play the clip directly on convene_player_art, not FloatingVideoOverlayService's
// separate floating window.
public class ConvenePlayerWidget extends AppWidgetProvider {
    private static final String TAG = "ConvenePlayerWidget";
    private static final String PREFS_NAME = "CapacitorStorage";
    private static final int WIDGET_SCHEMA_VERSION = 2; // must match widgetSync.js's syncConveneRoster
    static final int ART_PX = 240; // matches PulseBannerWidget.ART_PX's Binder-transaction reasoning; also ConvenePlayerPlaybackService's frame size

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        for (int appWidgetId : appWidgetIds) {
            updateWidget(context, appWidgetManager, appWidgetId);
        }
    }

    private void updateWidget(Context context, AppWidgetManager appWidgetManager, int appWidgetId) {
        try {
            appWidgetManager.updateAppWidget(appWidgetId, buildViews(context, appWidgetId));
        } catch (Throwable t) {
            Log.e(TAG, "updateWidget crashed", t);
            RemoteViews fallback = new RemoteViews(context.getPackageName(), R.layout.widget_convene_player);
            fallback.setTextViewText(R.id.convene_player_name, "Widget error");
            appWidgetManager.updateAppWidget(appWidgetId, fallback);
        }
    }

    // Package-private so ConvenePlayerPlaybackService can grab a fully-rendered RemoteViews
    // for this widget instance, then keep overwriting just R.id.convene_player_art with
    // successive decoded frames on top of it — the frame-playback loop needs the same
    // "everything else" (name, gear button, etc.) as a starting point every frame, not just
    // the art bitmap in isolation.
    static RemoteViews buildViews(Context context, int appWidgetId) {
        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        String chosenName = prefs.getString("widget_convene_choice_" + appWidgetId, null);
        Entry entry = findEntry(prefs, chosenName);

        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.widget_convene_player);

        if (entry != null) {
            views.setTextViewText(R.id.convene_player_name, entry.name);
            // RemoteViews has no setClipToOutline (or any generic view-property setter) —
            // there is no way to clip a widget's ImageView to rounded corners at all except
            // baking the rounding into the bitmap itself before setImageViewBitmap, same as
            // WidgetAssetUtils.roundedCorners already does for the Featured-4★ thumbnails
            // elsewhere. Without this, the art's own square corners paint right over
            // widget_background's rounded corners underneath (a background drawable only
            // shows through GAPS, it doesn't clip content drawn on top of it) — on Android
            // 12+ the launcher's own system-wide corner clip usually hides this, but that's
            // launcher behavior this app can't rely on for every device/version.
            Bitmap art = WidgetAssetUtils.decodeAsset(context, entry.artAsset, ART_PX, Bitmap.Config.RGB_565);
            if (art != null) {
                float radiusPx = 16 * context.getResources().getDisplayMetrics().density; // matches widget_background.xml's 16dp
                views.setImageViewBitmap(R.id.convene_player_art, WidgetAssetUtils.roundedCorners(art, radiusPx));
            }

            if (entry.conveneUrl != null) {
                views.setViewVisibility(R.id.convene_player_play, View.VISIBLE);
                Intent playIntent = new Intent(context, ConvenePlayerPlaybackService.class);
                playIntent.putExtra(ConvenePlayerPlaybackService.EXTRA_APP_WIDGET_ID, appWidgetId);
                playIntent.putExtra(ConvenePlayerPlaybackService.EXTRA_VIDEO_URL, entry.conveneUrl);
                PendingIntent playPendingIntent = PendingIntent.getService(
                        context, appWidgetId * 10, playIntent,
                        PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
                views.setOnClickPendingIntent(R.id.convene_player_play, playPendingIntent);
                // The ▶️ glyph is only a small 48dp circle centered over the FULL-BLEED art
                // ImageView beneath it — before this, convene_player_art had its own separate
                // click target that opened MainActivity, so tapping anywhere on "the video"
                // OUTSIDE that small circle silently launched the app instead of playing,
                // while only a precise tap on the tiny centered icon actually worked. Since
                // this widget's entire purpose is playing that one clip (see this class's file
                // header), the art itself should be an equally-valid play/stop target, not a
                // trap door into the app.
                views.setOnClickPendingIntent(R.id.convene_player_art, playPendingIntent);
            } else {
                views.setViewVisibility(R.id.convene_player_play, View.GONE);
                // No clip to play for this entry — fall back to opening the app, same as
                // tapping any other widget with nothing more specific to do.
                Intent launchIntent = new Intent(context, MainActivity.class);
                views.setOnClickPendingIntent(R.id.convene_player_art, PendingIntent.getActivity(
                        context, appWidgetId * 10 + 2, launchIntent,
                        PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE));
            }
        } else {
            views.setTextViewText(R.id.convene_player_name, context.getString(R.string.app_name));
            views.setViewVisibility(R.id.convene_player_play, View.GONE);
            Intent launchIntent = new Intent(context, MainActivity.class);
            views.setOnClickPendingIntent(R.id.convene_player_art, PendingIntent.getActivity(
                    context, appWidgetId * 10 + 2, launchIntent,
                    PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE));
        }

        Intent configureIntent = new Intent(context, ConvenePlayerConfigureActivity.class);
        configureIntent.putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, appWidgetId);
        configureIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        views.setOnClickPendingIntent(R.id.convene_player_settings, PendingIntent.getActivity(
                context, appWidgetId * 10 + 1, configureIntent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE));

        return views;
    }

    static final class Entry {
        final String name;
        final String artAsset;
        final String conveneUrl;
        Entry(String name, String artAsset, String conveneUrl) {
            this.name = name;
            this.artAsset = artAsset;
            this.conveneUrl = conveneUrl;
        }
    }

    // Finds `name` in widget_convene_roster; a null/no-longer-present name (e.g. never
    // configured yet, or the roster shape changed) returns null rather than guessing a
    // fallback — unlike PulseBannerWidget's banner picker, there's no sensible "first one"
    // default for a player whose whole point is an explicit user choice.
    static Entry findEntry(SharedPreferences prefs, String name) {
        if (name == null) return null;
        String json = prefs.getString("widget_convene_roster", null);
        if (json == null) return null;
        try {
            JSONObject blob = new JSONObject(json);
            if (blob.optInt("v", -1) != WIDGET_SCHEMA_VERSION) return null;
            JSONArray arr = blob.optJSONArray("roster");
            if (arr == null) return null;
            for (int i = 0; i < arr.length(); i++) {
                JSONObject o = arr.getJSONObject(i);
                if (name.equals(o.optString("name", null))) {
                    return new Entry(o.optString("name", ""),
                            o.isNull("artAsset") ? null : o.optString("artAsset", null),
                            o.isNull("conveneUrl") ? null : o.optString("conveneUrl", null));
                }
            }
        } catch (Exception e) {
            Log.w(TAG, "Failed to parse widget_convene_roster", e);
        }
        return null;
    }

    public static void requestUpdateSingle(Context context, int appWidgetId) {
        Intent intent = new Intent(context, ConvenePlayerWidget.class);
        intent.setAction(AppWidgetManager.ACTION_APPWIDGET_UPDATE);
        intent.putExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS, new int[]{appWidgetId});
        context.sendBroadcast(intent);
    }

    // Called from MainActivity.onResume() alongside PulseBannerWidget.requestUpdate() so
    // reopening the app refreshes this widget sooner than the OS's own 30-minute floor too.
    public static void requestUpdate(Context context) {
        AppWidgetManager manager = AppWidgetManager.getInstance(context);
        int[] ids = manager.getAppWidgetIds(new ComponentName(context, ConvenePlayerWidget.class));
        if (ids.length == 0) return;
        Intent intent = new Intent(context, ConvenePlayerWidget.class);
        intent.setAction(AppWidgetManager.ACTION_APPWIDGET_UPDATE);
        intent.putExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS, ids);
        context.sendBroadcast(intent);
    }
}
