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
import android.view.View;
import android.widget.RemoteViews;

// Home-screen "Soundtrack" widget — plays the app's own ambient "Log Screen" music tracks
// (SoundtrackTracks.ALL, the same 4 choices as Profile > Display > Sound > Ambient Music) via
// SoundtrackPlaybackService, a genuine foreground MediaPlayer service — playback needs to
// survive the widget/app not being on screen, which a plain RemoteViews click can't do on its
// own (see SoundtrackPlaybackService's own file header for why this can't just be a
// MediaPlayer instance owned by this class). See widget_soundtrack.xml's own header for the
// layout/style rationale — same "Log 2.0" background art, rounding, and PerfectSuite sizing
// as CalculatorWidget, plus a compact 1-cell-tall layout that switches in below
// HEIGHT_COMPACT_MAX_DP (the stacked normal layout doesn't fit that short at all).
//
// State (current track + playing/paused/looping) lives in SharedPreferences (the same
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
    // Below this, the normal stacked layout (label + track name + transport row) doesn't
    // fit at all — switches to widget_soundtrack_content_compact's single horizontal row
    // instead. Set just under soundtrack_widget_info.xml's own 2-cell minHeight (110dp), so
    // a 1-cell-tall placement (its minResizeHeight floor, 70dp) gets the compact layout and
    // anything 2 cells or taller keeps the normal one.
    private static final int HEIGHT_COMPACT_MAX_DP = 90;

    // Paired view ids for one content block (normal or compact) — renderControls() below
    // applies the exact same track/playing/looping data and PendingIntents to whichever set
    // is passed in, so both blocks always agree regardless of which one is actually visible.
    private static final class ControlIds {
        final int trackName, play, prev, next, loop, loopSelected;
        ControlIds(int trackName, int play, int prev, int next, int loop, int loopSelected) {
            this.trackName = trackName; this.play = play; this.prev = prev;
            this.next = next; this.loop = loop; this.loopSelected = loopSelected;
        }
    }

    private static final ControlIds NORMAL_IDS = new ControlIds(
        R.id.widget_soundtrack_track_name, R.id.widget_soundtrack_play, R.id.widget_soundtrack_prev,
        R.id.widget_soundtrack_next, R.id.widget_soundtrack_loop, R.id.widget_soundtrack_loop_selected);
    private static final ControlIds COMPACT_IDS = new ControlIds(
        R.id.widget_soundtrack_track_name_compact, R.id.widget_soundtrack_play_compact, R.id.widget_soundtrack_prev_compact,
        R.id.widget_soundtrack_next_compact, R.id.widget_soundtrack_loop_compact, R.id.widget_soundtrack_loop_selected_compact);

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

    // Fires once the LAST placed instance is removed (not on every individual removal when
    // more than one is placed — onDeleted is the per-instance one, this is the "none left at
    // all" one) — playback shouldn't keep running as an orphaned foreground service with no
    // widget left to control or display it.
    @Override
    public void onDisabled(Context context) {
        context.stopService(new Intent(context, SoundtrackPlaybackService.class));
    }

    private void updateWidget(Context context, AppWidgetManager appWidgetManager, int appWidgetId) {
        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.widget_soundtrack);
        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);

        String trackKey = prefs.getString(SoundtrackTracks.PREF_TRACK_KEY, SoundtrackTracks.DEFAULT_KEY);
        boolean playing = prefs.getBoolean(SoundtrackTracks.PREF_PLAYING_KEY, false);
        boolean looping = prefs.getBoolean(SoundtrackTracks.PREF_LOOP_KEY, SoundtrackTracks.DEFAULT_LOOP);
        SoundtrackTracks.Track track = SoundtrackTracks.byKey(trackKey);
        String trackLabel = context.getString(track.labelResId);

        renderControls(context, views, appWidgetId, NORMAL_IDS, trackLabel, playing, looping);
        renderControls(context, views, appWidgetId, COMPACT_IDS, trackLabel, playing, looping);

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

        // A host that hasn't reported real dimensions yet (heightDp == 0, e.g. the very
        // first render right after placement) should NOT be treated as compact — only an
        // explicitly-reported short height counts, same reasoning PulseBannerWidget's own
        // compact check uses.
        boolean compact = heightDp > 0 && heightDp < HEIGHT_COMPACT_MAX_DP;
        views.setViewVisibility(R.id.widget_soundtrack_content_normal, compact ? View.GONE : View.VISIBLE);
        views.setViewVisibility(R.id.widget_soundtrack_content_compact, compact ? View.VISIBLE : View.GONE);

        appWidgetManager.updateAppWidget(appWidgetId, views);
    }

    private void renderControls(Context context, RemoteViews views, int appWidgetId, ControlIds ids,
                                 String trackLabel, boolean playing, boolean looping) {
        views.setTextViewText(ids.trackName, trackLabel);
        views.setImageViewResource(ids.play,
            playing ? android.R.drawable.ic_media_pause : android.R.drawable.ic_media_play);
        views.setContentDescription(ids.play,
            context.getString(playing ? R.string.widget_soundtrack_pause_aria : R.string.widget_soundtrack_play_aria));
        // Same stacked selected/unselected background overlay as CalculatorWidget's own
        // target picker — RemoteViews can't runtime-swap a view's background drawable
        // resource, so the "on" highlight is a second view toggled by visibility.
        views.setViewVisibility(ids.loopSelected, looping ? View.VISIBLE : View.GONE);

        // Tapping the track name cycles forward — same tap-to-cycle interaction as
        // CalculatorWidget's own copy-target pill; the dedicated prev/next buttons give
        // finer transport control alongside it.
        setServicePendingIntent(context, views, appWidgetId, ids.trackName, SoundtrackPlaybackService.ACTION_NEXT);
        setServicePendingIntent(context, views, appWidgetId, ids.play, SoundtrackPlaybackService.ACTION_PLAY_PAUSE);
        setServicePendingIntent(context, views, appWidgetId, ids.prev, SoundtrackPlaybackService.ACTION_PREV);
        setServicePendingIntent(context, views, appWidgetId, ids.next, SoundtrackPlaybackService.ACTION_NEXT);
        setServicePendingIntent(context, views, appWidgetId, ids.loop, SoundtrackPlaybackService.ACTION_TOGGLE_LOOP);
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
