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
// Reuses FloatingVideoOverlayService for playback (the same floating rounded video window
// PulseBannerWidget's own ▶️ uses) and WidgetAssetUtils for bitmap decoding — no new
// platform-limit reasoning here beyond what PulseBannerWidget.java's file header already
// documents (RemoteViews can't host a VideoView, images must be delivered as bitmaps, etc).
public class ConvenePlayerWidget extends AppWidgetProvider {
    private static final String TAG = "ConvenePlayerWidget";
    private static final String PREFS_NAME = "CapacitorStorage";
    private static final int WIDGET_SCHEMA_VERSION = 2; // must match widgetSync.js's syncConveneRoster
    private static final int ART_PX = 240; // matches PulseBannerWidget.ART_PX's Binder-transaction reasoning

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

    private RemoteViews buildViews(Context context, int appWidgetId) {
        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        String chosenName = prefs.getString("widget_convene_choice_" + appWidgetId, null);
        Entry entry = findEntry(prefs, chosenName);

        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.widget_convene_player);

        if (entry != null) {
            views.setTextViewText(R.id.convene_player_name, entry.name);
            Bitmap art = WidgetAssetUtils.decodeAsset(context, entry.artAsset, ART_PX, Bitmap.Config.RGB_565);
            if (art != null) views.setImageViewBitmap(R.id.convene_player_art, art);

            if (entry.conveneUrl != null) {
                views.setViewVisibility(R.id.convene_player_play, View.VISIBLE);
                Intent playIntent = new Intent(context, FloatingVideoOverlayService.class);
                playIntent.putExtra(FloatingVideoOverlayService.EXTRA_VIDEO_URL, entry.conveneUrl);
                views.setOnClickPendingIntent(R.id.convene_player_play, PendingIntent.getService(
                        context, appWidgetId * 10, playIntent,
                        PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE));
            } else {
                views.setViewVisibility(R.id.convene_player_play, View.GONE);
            }
        } else {
            views.setTextViewText(R.id.convene_player_name, context.getString(R.string.app_name));
            views.setViewVisibility(R.id.convene_player_play, View.GONE);
        }

        Intent configureIntent = new Intent(context, ConvenePlayerConfigureActivity.class);
        configureIntent.putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, appWidgetId);
        configureIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        views.setOnClickPendingIntent(R.id.convene_player_settings, PendingIntent.getActivity(
                context, appWidgetId * 10 + 1, configureIntent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE));

        Intent launchIntent = new Intent(context, MainActivity.class);
        views.setOnClickPendingIntent(R.id.convene_player_art, PendingIntent.getActivity(
                context, appWidgetId * 10 + 2, launchIntent,
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
