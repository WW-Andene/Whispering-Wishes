package cc.andene.whisperingwishes;

import android.appwidget.AppWidgetManager;
import android.app.Service;
import android.content.Intent;
import android.content.SharedPreferences;
import android.graphics.Bitmap;
import android.graphics.Color;
import android.net.Uri;
import android.os.IBinder;
import android.util.Log;
import android.view.View;
import android.widget.RemoteViews;

import org.json.JSONArray;
import org.json.JSONObject;

import java.util.List;

// Rolls a pull entirely natively (WidgetPullSimulator.java, no app launch) and plays the
// WHOLE result directly on the widget's own surface, requested explicitly in place of the
// old fullscreen WidgetPullActivity: (1) the matching rarity clip, played as real frames
// the same way WidgetVideoPlaybackService plays the convene animation — RemoteViews can't
// host a VideoView at all (see PulseBannerWidget.java's file header); (2) each pulled
// item's own portrait, one at a time, held briefly in the same R.id.widget_art slot the
// video frames just used; (3) a short-lived summary of small colored-by-rarity name pills
// (PullResultsRemoteViewsService backing a ListView — the actually-supported RemoteViews
// mechanism for a variable-length list, since a GridLayout can't flex cleanly to an
// arbitrary ×1/×10 count). The widget then reverts to its normal static render.
//
// Runs as a PLAIN (non-foreground) Service — same reasoning as WidgetVideoPlaybackService's
// file header: the whole sequence is only a handful of seconds, started directly from a
// user tap, well within Android's temporary background-execution allowance for that.
public class WidgetPullPlaybackService extends Service {
    private static final String TAG = "WidgetPullPlayback";
    private static final String PREFS_NAME = "CapacitorStorage";

    private static final int FRAME_PX = 240; // matches PulseBannerWidget.ART_PX
    private static final int TARGET_FPS = 10;
    private static final long FRAME_INTERVAL_MS = 1000L / TARGET_FPS;
    private static final int MAX_VIDEO_FRAMES = 40;
    // How long each pulled item's own portrait is held on screen during the "one image at
    // a time" slideshow phase — long enough to actually read the name, short enough that a
    // ×10 pull (10 portraits) doesn't drag on for ages.
    private static final long PORTRAIT_HOLD_MS = 850;
    // How long the final colored-pills summary stays up before the widget reverts to its
    // normal static render.
    private static final long RESULTS_DISPLAY_MS = 6000;

    public static final String EXTRA_APP_WIDGET_ID = "widget_pull_playback_appwidget_id";
    public static final String EXTRA_CATEGORY = "widget_pull_playback_category";
    public static final String EXTRA_NAME = "widget_pull_playback_name";
    public static final String EXTRA_COUNT = "widget_pull_playback_count";

    private Thread worker;

    @Override
    public IBinder onBind(Intent intent) { return null; }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        if (intent == null) { stopSelf(startId); return START_NOT_STICKY; }
        int appWidgetId = intent.getIntExtra(EXTRA_APP_WIDGET_ID, -1);
        String category = intent.getStringExtra(EXTRA_CATEGORY);
        String name = intent.getStringExtra(EXTRA_NAME);
        int count = intent.getIntExtra(EXTRA_COUNT, 1);
        if (appWidgetId == -1 || category == null) { stopSelf(startId); return START_NOT_STICKY; }

        // One playback at a time per widget instance — a second tap on ×1/×10 mid-sequence
        // would otherwise fight the first for the same widget's RemoteViews.
        if (worker != null && worker.isAlive()) { stopSelf(startId); return START_NOT_STICKY; }

        worker = new Thread(() -> {
            try {
                runSequence(appWidgetId, category, name, count);
            } catch (Throwable t) {
                Log.w(TAG, "Native pull playback failed, falling back to WidgetPullActivity", t);
                launchFallback(appWidgetId, category, name, count);
            } finally {
                // Always end on the real, current static render — a mid-sequence crash or
                // an early Doze-kill should never leave the widget stuck on a stale frame
                // or an empty results list.
                PulseBannerWidget.requestUpdateSingle(this, appWidgetId);
                stopSelf(startId);
            }
        }, "WidgetPullPlayback");
        worker.start();
        return START_NOT_STICKY;
    }

    private void runSequence(int appWidgetId, String category, String name, int count) throws Exception {
        // WidgetPullSimulator.roll() is the actual pull event — its pity counters are already
        // read, advanced and persisted by the time it returns. Only a failure THIS FAR is safe
        // to hand to launchFallback()'s WidgetPullActivity, which performs its own fresh roll:
        // nothing has been committed yet, so there's no double-consumption risk.
        WidgetPullSimulator.PullSimResult sim = WidgetPullSimulator.roll(this, category, name, count);
        AppWidgetManager manager = AppWidgetManager.getInstance(this);

        // Once roll() has returned, the pull has genuinely happened — any failure past this
        // point must NEVER reach onStartCommand's catch block (that would call
        // launchFallback(), which re-rolls via WidgetPullActivity and silently double-consumes
        // pity while showing the user a different result than the one already committed).
        // Degrade to skipping straight to the correct, already-rolled results instead.
        try {
            playRarityVideo(manager, appWidgetId, sim.video);
            if (Thread.currentThread().isInterrupted()) return;
            playPortraitSlideshow(manager, appWidgetId, sim.results);
            if (Thread.currentThread().isInterrupted()) return;
            showResultsList(manager, appWidgetId, sim.results);
        } catch (Throwable t) {
            // Deliberately swallowed, not rethrown: onStartCommand's finally block already
            // reverts the widget to its normal static render regardless, and rethrowing here
            // would hit its catch block, which calls launchFallback() — re-rolling via
            // WidgetPullActivity and double-consuming pity for a pull that already happened.
            Log.w(TAG, "Pull playback phase failed after rolling — reverting without re-rolling", t);
        }
    }

    private void playRarityVideo(AppWidgetManager manager, int appWidgetId, String video) {
        try {
            List<Bitmap> frames = WidgetFrameUtils.extractFrames(this, "asset:convene-sim/" + video + ".mp4", MAX_VIDEO_FRAMES, FRAME_INTERVAL_MS, FRAME_PX);
            RemoteViews base = PulseBannerWidget.buildBaseViews(this, manager, appWidgetId);
            if (base == null || frames.isEmpty()) return;
            for (Bitmap frame : frames) {
                base.setImageViewBitmap(R.id.widget_art, frame);
                manager.updateAppWidget(appWidgetId, base);
                if (!sleep(FRAME_INTERVAL_MS)) return;
            }
        } catch (Exception e) {
            // Non-fatal — the video is a nice-to-have lead-in, not the actual result. Fall
            // through to the portrait slideshow on whatever the widget was already showing.
            Log.w(TAG, "Rarity video frame decode failed, skipping straight to results", e);
        }
    }

    private void playPortraitSlideshow(AppWidgetManager manager, int appWidgetId, List<WidgetPullSimulator.PullResult> results) {
        SharedPreferences prefs = getSharedPreferences(PREFS_NAME, MODE_PRIVATE);
        JSONObject assetMap;
        try {
            assetMap = new JSONObject(prefs.getString("widget_pull_asset_map", "{}"));
        } catch (Exception e) {
            assetMap = new JSONObject();
        }

        for (WidgetPullSimulator.PullResult result : results) {
            RemoteViews base = PulseBannerWidget.buildBaseViews(this, manager, appWidgetId);
            if (base == null) return;

            String assetPath = result.name != null ? assetMap.optString(result.name, null) : null;
            Bitmap portrait = assetPath != null ? WidgetAssetUtils.decodeAsset(this, assetPath, FRAME_PX) : null;
            if (portrait != null) base.setImageViewBitmap(R.id.widget_art, portrait);

            base.setTextViewText(R.id.widget_banner_name, result.name != null ? result.name : getString(R.string.app_name));
            base.setTextViewText(R.id.widget_banner_element, result.rarity + "★"); // e.g. "5★"
            base.setTextColor(R.id.widget_banner_element, rarityColor(result.rarity));
            // Pills/bottom row would show stale ×1/×10 targets and Featured-4★ art mid-slideshow —
            // hidden for the duration, same as the compact-mode treatment in PulseBannerWidget.
            base.setViewVisibility(R.id.widget_pull_pills, View.GONE);
            base.setViewVisibility(R.id.widget_bottom_row, View.GONE);

            manager.updateAppWidget(appWidgetId, base);
            if (!sleep(PORTRAIT_HOLD_MS)) return;
        }
    }

    private void showResultsList(AppWidgetManager manager, int appWidgetId, List<WidgetPullSimulator.PullResult> results) {
        JSONArray arr = new JSONArray();
        try {
            for (WidgetPullSimulator.PullResult r : results) {
                JSONObject o = new JSONObject();
                o.put("name", r.name != null ? r.name : "?");
                o.put("rarity", r.rarity);
                arr.put(o);
            }
        } catch (Exception ignored) {}

        SharedPreferences prefs = getSharedPreferences(PREFS_NAME, MODE_PRIVATE);
        prefs.edit().putString("widget_pull_results_" + appWidgetId, arr.toString()).apply();

        RemoteViews base = PulseBannerWidget.buildBaseViews(this, manager, appWidgetId);
        if (base == null) return;
        base.setViewVisibility(R.id.widget_pull_results_list, View.VISIBLE);
        Intent adapterIntent = new Intent(this, PullResultsRemoteViewsService.class);
        adapterIntent.putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, appWidgetId);
        // Unique per widget instance so the launcher's RemoteViewsService connection/cache
        // for one widget's list never gets confused with another's.
        adapterIntent.setData(Uri.parse("pullresults://widget/" + appWidgetId));
        base.setRemoteAdapter(R.id.widget_pull_results_list, adapterIntent);
        manager.updateAppWidget(appWidgetId, base);
        manager.notifyAppWidgetViewDataChanged(appWidgetId, R.id.widget_pull_results_list);

        sleep(RESULTS_DISPLAY_MS);
        // The GONE-again reset happens in requestUpdateSingle() back in the caller's finally
        // block (buildBaseViews() never sets widget_pull_results_list VISIBLE on its own, so
        // a normal re-render already hides it — no extra step needed here).
    }

    private int rarityColor(int rarity) {
        switch (rarity) {
            case 5: return Color.parseColor("#EAB308");
            case 4: return Color.parseColor("#A855F7");
            default: return Color.parseColor("#38BDF8");
        }
    }

    // Returns false (and leaves the thread's interrupt flag set) if interrupted mid-sleep —
    // callers use that to bail out of the rest of the sequence immediately rather than
    // pushing more RemoteViews updates after the service has been asked to stop.
    private boolean sleep(long ms) {
        try {
            Thread.sleep(ms);
            return true;
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            return false;
        }
    }

    private void launchFallback(int appWidgetId, String category, String name, int count) {
        Intent fallback = new Intent(this, WidgetPullActivity.class);
        fallback.putExtra(WidgetPullActivity.EXTRA_COUNT, count);
        fallback.putExtra(WidgetPullActivity.EXTRA_CATEGORY, category);
        fallback.putExtra(WidgetPullActivity.EXTRA_NAME, name);
        fallback.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        startActivity(fallback);
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        if (worker != null) worker.interrupt();
    }
}
