package cc.andene.whisperingwishes;

import android.app.Service;
import android.appwidget.AppWidgetManager;
import android.content.Intent;
import android.graphics.Bitmap;
import android.graphics.Matrix;
import android.media.MediaMetadataRetriever;
import android.os.IBinder;
import android.util.Log;
import android.widget.RemoteViews;

import java.util.ArrayList;
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
    // When set, the fallback on decode failure is WidgetPullActivity (with these two
    // extras) instead of ConveneAnimationActivity — used by the pull-pill path.
    public static final String EXTRA_FALLBACK_PULL_COUNT = "widget_video_fallback_pull_count";
    public static final String EXTRA_FALLBACK_PULL_CATEGORY = "widget_video_fallback_pull_category";
    // Used by the ▶️ convene-animation path's fallback only.
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
        List<Bitmap> frames = extractFrames(source);
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

    // source is either an http(s) URL (convene-animations/ streamed clips — see
    // widgetSync.js) or "asset:<path>" for a bundled local clip (the convene-sim/
    // rarity clips WidgetPullSimulator's results play). MediaMetadataRetriever
    // supports both a network Uri and an AssetFileDescriptor as a data source.
    private List<Bitmap> extractFrames(String source) throws Exception {
        MediaMetadataRetriever retriever = new MediaMetadataRetriever();
        try {
            if (source.startsWith("asset:")) {
                String assetPath = "public/" + source.substring("asset:".length());
                try (android.content.res.AssetFileDescriptor afd = getAssets().openFd(assetPath)) {
                    retriever.setDataSource(afd.getFileDescriptor(), afd.getStartOffset(), afd.getLength());
                }
            } else {
                retriever.setDataSource(source, new java.util.HashMap<>());
            }

            String durationStr = retriever.extractMetadata(MediaMetadataRetriever.METADATA_KEY_DURATION);
            long durationMs = durationStr != null ? Long.parseLong(durationStr) : 0;
            if (durationMs <= 0) durationMs = 3000; // sane fallback for a metadata-less source

            int frameCount = Math.min(MAX_FRAMES, Math.max(1, (int) (durationMs / FRAME_INTERVAL_MS)));
            List<Bitmap> frames = new ArrayList<>(frameCount);
            for (int i = 0; i < frameCount; i++) {
                long timeUs = (durationMs * i / frameCount) * 1000L;
                Bitmap raw = retriever.getFrameAtTime(timeUs, MediaMetadataRetriever.OPTION_CLOSEST_SYNC);
                if (raw == null) continue;
                frames.add(downscale(raw, FRAME_PX));
            }
            return frames;
        } finally {
            retriever.release();
        }
    }

    private Bitmap downscale(Bitmap src, int targetPx) {
        int longest = Math.max(src.getWidth(), src.getHeight());
        if (longest <= targetPx) return src;
        float scale = (float) targetPx / longest;
        Matrix m = new Matrix();
        m.postScale(scale, scale);
        Bitmap scaled = Bitmap.createBitmap(src, 0, 0, src.getWidth(), src.getHeight(), m, true);
        if (scaled != src) src.recycle();
        return scaled;
    }

    private void launchFallback(Intent originalIntent, int appWidgetId) {
        String pullCategory = originalIntent.getStringExtra(EXTRA_FALLBACK_PULL_CATEGORY);
        if (pullCategory != null) {
            int count = originalIntent.getIntExtra(EXTRA_FALLBACK_PULL_COUNT, 1);
            Intent fallback = new Intent(this, WidgetPullActivity.class);
            fallback.putExtra(WidgetPullActivity.EXTRA_COUNT, count);
            fallback.putExtra(WidgetPullActivity.EXTRA_CATEGORY, pullCategory);
            fallback.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            startActivity(fallback);
            return;
        }
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
