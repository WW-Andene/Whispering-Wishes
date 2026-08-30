package cc.andene.whisperingwishes;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.graphics.Bitmap;
import android.os.Bundle;
import android.widget.RemoteViews;

// Home-screen "Soundtrack" widget — plays the app's own ambient "Log Screen" music tracks
// (SoundtrackTracks.ALL, the same 4 choices as Profile > Display > Sound > Ambient Music) via
// SoundtrackPlaybackService, a genuine foreground MediaPlayer service — playback needs to
// survive the widget/app not being on screen, which a plain RemoteViews click can't do on its
// own (see SoundtrackPlaybackService's own file header for why this can't just be a
// MediaPlayer instance owned by this class). See widget_soundtrack.xml's own header for the
// layout/style rationale — same "Log 2.0" background art, rounding, and PerfectSuite sizing
// as CalculatorWidget.
//
// State (current track + playing/paused) lives in SharedPreferences (the same
// "CapacitorStorage" file every widget in this app shares), written by
// SoundtrackPlaybackService whenever it changes something and read fresh here on every
// render — this class holds no playback state of its own, it's purely a remote control +
// display for the service.
public class SoundtrackWidget extends AppWidgetProvider {
    private static final String PREFS_NAME = "CapacitorStorage";
    private static final String BG_ART_ASSET = "banner-history/log-2-0.jpg"; // "Log 2.0" theme, matches CalculatorWidget
    // Falls back to soundtrack_widget_info.xml's own minWidth/minHeight when the host hasn't
    // reported real dimensions yet — same reasoning as CalculatorWidget's own art sizing.
    private static final int FALLBACK_WIDTH_DP = 180;
    private static final int FALLBACK_HEIGHT_DP = 110;

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        for (int appWidgetId : appWidgetIds) {
            updateWidget(context, appWidgetManager, appWidgetId);
        }
    }

    @Override
    public void onAppWidgetOptionsChanged(Context context, AppWidgetManager appWidgetManager, int appWidgetId, Bundle newOptions) {
        updateWidget(context, appWidgetManager, appWidgetId);
    }

    private void updateWidget(Context context, AppWidgetManager appWidgetManager, int appWidgetId) {
        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.widget_soundtrack);
        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);

        String trackKey = prefs.getString(SoundtrackTracks.PREF_TRACK_KEY, SoundtrackTracks.DEFAULT_KEY);
        boolean playing = prefs.getBoolean(SoundtrackTracks.PREF_PLAYING_KEY, false);
        SoundtrackTracks.Track track = SoundtrackTracks.byKey(trackKey);

        views.setTextViewText(R.id.widget_soundtrack_track_name, context.getString(track.labelResId));
        views.setImageViewResource(R.id.widget_soundtrack_play,
            playing ? android.R.drawable.ic_media_pause : android.R.drawable.ic_media_play);
        views.setContentDescription(R.id.widget_soundtrack_play,
            context.getString(playing ? R.string.widget_soundtrack_pause_aria : R.string.widget_soundtrack_play_aria));

        // Same background treatment as CalculatorWidget.renderWidget: crop/scale to the
        // widget's own current pixel size FIRST, then round — widget_soundtrack_bg_art's own
        // scaleType="fitXY" means nothing scales/crops it a second time afterward, so the
        // rounded corners baked in here are the only thing that ever touches those pixels.
        Bundle options = appWidgetManager.getAppWidgetOptions(appWidgetId);
        int widthDp = options != null ? options.getInt(AppWidgetManager.OPTION_APPWIDGET_MAX_WIDTH, 0) : 0;
        int heightDp = options != null ? options.getInt(AppWidgetManager.OPTION_APPWIDGET_MAX_HEIGHT, 0) : 0;
        float density = context.getResources().getDisplayMetrics().density;
        int artWidthPx = Math.round((widthDp > 0 ? widthDp : FALLBACK_WIDTH_DP) * density);
        int artHeightPx = Math.round((heightDp > 0 ? heightDp : FALLBACK_HEIGHT_DP) * density);
        Bitmap bgArt = WidgetAssetUtils.decodeAssetExactCrop(context, BG_ART_ASSET, artWidthPx, artHeightPx, Bitmap.Config.RGB_565);
        if (bgArt != null) {
            views.setImageViewBitmap(R.id.widget_soundtrack_bg_art, WidgetAssetUtils.roundedCornersWithUniformScrim(
                bgArt, WidgetAssetUtils.widgetCornerRadiusPx(context), 0xB3080c14));
        }

        // Tapping the track name cycles forward — same tap-to-cycle interaction as
        // CalculatorWidget's own copy-target pill; the dedicated prev/next buttons give
        // finer transport control alongside it.
        setServicePendingIntent(context, views, appWidgetId, R.id.widget_soundtrack_track_name, SoundtrackPlaybackService.ACTION_NEXT);
        setServicePendingIntent(context, views, appWidgetId, R.id.widget_soundtrack_play, SoundtrackPlaybackService.ACTION_PLAY_PAUSE);
        setServicePendingIntent(context, views, appWidgetId, R.id.widget_soundtrack_prev, SoundtrackPlaybackService.ACTION_PREV);
        setServicePendingIntent(context, views, appWidgetId, R.id.widget_soundtrack_next, SoundtrackPlaybackService.ACTION_NEXT);

        appWidgetManager.updateAppWidget(appWidgetId, views);
    }

    // A tap on a RemoteViews button is exactly the kind of user-initiated event Android
    // exempts from the background-service-start restrictions introduced in API 26+ — same
    // proven pattern PulseBannerWidget's own bubble-toggle button already relies on for
    // PullBubbleService, so calling startForeground() inside
    // SoundtrackPlaybackService.onStartCommand() works here without needing
    // startForegroundService() from this side.
    private void setServicePendingIntent(Context context, RemoteViews views, int appWidgetId, int viewId, String action) {
        Intent intent = new Intent(context, SoundtrackPlaybackService.class);
        intent.setAction(action);
        // Request code must be unique per (widget instance, view) pair — otherwise
        // FLAG_IMMUTABLE PendingIntents for the same view across different widget instances
        // would collide and silently reuse the first one's.
        int requestCode = appWidgetId * 10 + viewId % 10;
        PendingIntent pending = PendingIntent.getService(context, requestCode, intent,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        views.setOnClickPendingIntent(viewId, pending);
    }

    // Called by SoundtrackPlaybackService whenever playback state changes, so every placed
    // instance reflects it immediately instead of waiting for the OS's own update-period floor.
    public static void requestUpdate(Context context) {
        AppWidgetManager mgr = AppWidgetManager.getInstance(context);
        int[] ids = mgr.getAppWidgetIds(new ComponentName(context, SoundtrackWidget.class));
        if (ids.length == 0) return;
        Intent intent = new Intent(context, SoundtrackWidget.class);
        intent.setAction(AppWidgetManager.ACTION_APPWIDGET_UPDATE);
        intent.putExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS, ids);
        context.sendBroadcast(intent);
    }
}
