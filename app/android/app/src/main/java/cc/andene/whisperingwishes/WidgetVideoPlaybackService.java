package cc.andene.whisperingwishes;

import android.app.Service;
import android.appwidget.AppWidgetManager;
import android.content.Intent;
import android.graphics.Bitmap;
import android.os.IBinder;
import android.util.Log;
import android.widget.RemoteViews;

import java.util.List;

// Plays a video "directly on" the widget's own surface by decoding it into a short
// sequence of downsampled frames and flipping the widget's own R.id.widget_art
// ImageView through them on a timer — RemoteViews genuinely cannot host a VideoView
// (see PulseBannerWidget.java's file header), so this is the actual workaround: no
// video surface is ever drawn by the widget itself, but real successive frames of
// the real clip ARE what the widget's ImageView shows, on the widget itself, not a
// window floating on top of it. Requested explicitly in place of a fullscreen-
// Activity or floating-overlay-window approach.
//
// Runs as a PLAIN (non-foreground) Service, not a foreground one: the whole clip is
// only ~2-4s, started directly from a user tap on the widget (PendingIntent), which
// Android grants a short temporary background-execution allowance for regardless of
// Doze/App-Standby — comfortably long enough for this. A foreground service would
// need a persistent notification and (targetSdk 34+) a declared
// android:foregroundServiceType, and "playing a few frames on a widget" doesn't
// cleanly fit any of Android's standard FGS types (mediaPlayback implies a real
// MediaSession/continuous playback, which this isn't) — avoided entirely rather
// than force-fitting one just to sidestep a decision that would need Play Store
// justification. Documented tradeoff: an aggressive OEM battery manager could still
// kill this a few seconds early on some devices; the fallback below (launching
// ConveneAnimationActivity/WidgetPullActivity as before) is what covers that case
// and any decode failure, so the feature never regresses to "nothing happens".
public class WidgetVideoPlaybackService extends Service {
    private static final String TAG = "WidgetVideoPlayback";
    // Longest side for a decoded frame — matches PulseBannerWidget.ART_PX so a frame
    // swap never exceeds the same per-bitmap Binder-transaction budget the static art
    // bitmap already respects.
    private static final int FRAME_PX = 240;
    private static final int TARGET_FPS = 10;
    private static final long FRAME_INTERVAL_MS = 1000L / TARGET_FPS;
    // Hard ceiling on decoded frames — a long clip at 10fps could otherwise decode
    // hundreds of frames up front (this extracts everything before playback starts,
    // it doesn't stream); 40 frames = 4s of playback at TARGET_FPS, comfortably
    // covers every clip this app bundles/streams for this feature.
    private static final int MAX_FRAMES = 40;

    public static final String EXTRA_APP_WIDGET_ID = "widget_video_appwidget_id";
    public static final String EXTRA_VIDEO_SOURCE = "widget_video_source"; // http(s) URL or "asset:<path under assets/public/>"
    // Which ImageView gets the frame swaps — R.id.widget_art (primary block) by default, or
    // R.id.widget_secondary_art for the secondary block's own ▶️ button.
    public static final String EXTRA_TARGET_VIEW_ID = "widget_video_target_view_id";
    // Used by the fallback (ConveneAnimationActivity) on decode failure — this service is
    // only ever used for the ▶️ convene-animation path; the pull-pill path has its own
    // WidgetPullPlaybackService with its own fallback to WidgetPullActivity.
    public static final String EXTRA_FALLBACK_CHAR_NAME = "widget_video_fallback_char_name";

    private Thread worker;

    @Override
    public IBinder onBind(Intent intent) { return null; }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        if (intent == null) { stopSelf(startId); return START_NOT_STICKY; }
        int appWidgetId = intent.getIntExtra(EXTRA_APP_WIDGET_ID, -1);
        String source = intent.getStringExtra(EXTRA_VIDEO_SOURCE);
        int targetViewId = intent.getIntExtra(EXTRA_TARGET_VIEW_ID, R.id.widget_art);
        if (appWidgetId == -1 || source == null) { stopSelf(startId); return START_NOT_STICKY; }

        // One playback at a time is plenty (a single tap can't fire twice before this
        // starts), and decoding is CPU-heavy enough that overlapping runs would just
        // fight each other for frames on the same widget instance.
        if (worker != null && worker.isAlive()) { stopSelf(startId); return START_NOT_STICKY; }

        worker = new Thread(() -> {
            try {
                runPlayback(appWidgetId, source, targetViewId);
            } catch (Throwable t) {
                Log.w(TAG, "Frame playback failed, falling back", t);
                launchFallback(intent, appWidgetId);
            } finally {
                // Always end on the real, current static render — a mid-sequence
                // crash or an early Doze-kill should never leave the widget stuck
                // showing its last video frame.
                PulseBannerWidget.requestUpdateSingle(this, appWidgetId);
                stopSelf(startId);
            }
        }, "WidgetVideoPlayback");
        worker.start();
        return START_NOT_STICKY;
    }

    private void runPlayback(int appWidgetId, String source, int targetViewId) throws Exception {
        List<Bitmap> frames = WidgetFrameUtils.extractFrames(this, source, MAX_FRAMES, FRAME_INTERVAL_MS, FRAME_PX);
        if (frames.isEmpty()) throw new IllegalStateException("No frames decoded from " + source);

        AppWidgetManager manager = AppWidgetManager.getInstance(this);
        RemoteViews base = PulseBannerWidget.buildBaseViews(this, manager, appWidgetId);
        if (base == null) return; // widget was removed mid-decode

        for (Bitmap frame : frames) {
            base.setImageViewBitmap(targetViewId, frame);
            manager.updateAppWidget(appWidgetId, base);
            try {
                Thread.sleep(FRAME_INTERVAL_MS);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                return;
            }
        }
    }

    private void launchFallback(Intent originalIntent, int appWidgetId) {
        String videoUrl = originalIntent.getStringExtra(EXTRA_VIDEO_SOURCE);
        Intent fallback = new Intent(this, ConveneAnimationActivity.class);
        fallback.putExtra(ConveneAnimationActivity.EXTRA_VIDEO_URL, videoUrl);
        fallback.putExtra(ConveneAnimationActivity.EXTRA_CHAR_NAME, originalIntent.getStringExtra(EXTRA_FALLBACK_CHAR_NAME));
        fallback.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        startActivity(fallback);
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        if (worker != null) worker.interrupt();
    }
}
