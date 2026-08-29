package cc.andene.whisperingwishes;

import android.appwidget.AppWidgetManager;
import android.app.Service;
import android.content.Intent;
import android.graphics.Bitmap;
import android.graphics.Matrix;
import android.media.MediaMetadataRetriever;
import android.net.Uri;
import android.os.IBinder;
import android.util.Log;
import android.widget.RemoteViews;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

// ConvenePlayerWidget's ▶️ button plays the clip directly ON the widget's own art slot —
// unlike PulseBannerWidget's ▶️ (a small button on a dashboard, where FloatingVideoOverlayService's
// separate floating window is a reasonable minor interruption), THIS widget's entire purpose
// is playing a character's convene clip, so popping open something else to actually show it
// would defeat the point of it being a dedicated "media player" widget.
//
// Decodes the clip into a short sequence of downsampled bitmaps and flips
// R.id.convene_player_art through them on a timer — RemoteViews genuinely cannot host a
// VideoView at all (see PulseBannerWidget.java's file header), so this is the same
// bitmap-frame-swap workaround this app has used elsewhere for content that must render ON
// a widget's own surface rather than in a separate window.
//
// Runs as a PLAIN (non-foreground) Service: the whole clip is only a few seconds, started
// directly from a user tap, well within Android's temporary background-execution allowance
// for that — a foreground service would need a persistent notification and a targetSdk 34+
// foregroundServiceType that doesn't cleanly fit this use case anyway.
public class ConvenePlayerPlaybackService extends Service {
    private static final String TAG = "ConvenePlayerPlayback";
    private static final int FRAME_PX = ConvenePlayerWidget.ART_PX; // matches the static art's own decode size
    private static final int TARGET_FPS = 10;
    private static final long FRAME_INTERVAL_MS = 1000L / TARGET_FPS;
    // Hard ceiling on decoded frames — this extracts everything before playback starts, it
    // doesn't stream, so a long clip at 10fps could otherwise decode hundreds of frames up
    // front; 40 frames = 4s of playback at TARGET_FPS, comfortably covers a convene clip.
    private static final int MAX_FRAMES = 40;

    public static final String EXTRA_APP_WIDGET_ID = "convene_player_playback_appwidget_id";
    public static final String EXTRA_VIDEO_URL = "convene_player_playback_video_url";

    private Thread worker;

    @Override
    public IBinder onBind(Intent intent) { return null; }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        if (intent == null) { stopSelf(startId); return START_NOT_STICKY; }
        int appWidgetId = intent.getIntExtra(EXTRA_APP_WIDGET_ID, -1);
        String videoUrl = intent.getStringExtra(EXTRA_VIDEO_URL);
        if (appWidgetId == -1 || videoUrl == null) { stopSelf(startId); return START_NOT_STICKY; }

        // One playback at a time per widget instance is plenty — a single tap can't fire
        // twice before this starts, and decoding is CPU-heavy enough that overlapping runs
        // would just fight each other for frames on the same widget instance.
        if (worker != null && worker.isAlive()) { stopSelf(startId); return START_NOT_STICKY; }

        worker = new Thread(() -> {
            try {
                runPlayback(appWidgetId, videoUrl);
            } catch (Throwable t) {
                Log.w(TAG, "Frame playback failed, falling back to fullscreen player", t);
                launchFallback(videoUrl);
            } finally {
                // Always end on the real, current static render — a mid-sequence crash or
                // an early Doze-kill should never leave the widget stuck showing its last
                // video frame.
                ConvenePlayerWidget.requestUpdateSingle(this, appWidgetId);
                stopSelf(startId);
            }
        }, "ConvenePlayerPlayback");
        worker.start();
        return START_NOT_STICKY;
    }

    private void runPlayback(int appWidgetId, String videoUrl) throws Exception {
        List<Bitmap> frames = extractFrames(videoUrl);
        if (frames.isEmpty()) throw new IllegalStateException("No frames decoded from " + videoUrl);

        AppWidgetManager manager = AppWidgetManager.getInstance(this);
        RemoteViews base = ConvenePlayerWidget.buildViews(this, appWidgetId);
        if (base == null) return; // widget was removed mid-decode

        for (Bitmap frame : frames) {
            base.setImageViewBitmap(R.id.convene_player_art, frame);
            manager.updateAppWidget(appWidgetId, base);
            try {
                Thread.sleep(FRAME_INTERVAL_MS);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                return;
            }
        }
    }

    // videoUrl is always a plain http(s) URL here (convene-animations/ clips are streamed,
    // not bundled — see capacitor-build/build.mjs's EXCLUDED_DIRS), so this only needs the
    // network-Uri data source path, unlike WidgetPullPlaybackService's now-removed
    // asset-scheme variant for the bundled convene-sim rarity clips.
    private List<Bitmap> extractFrames(String videoUrl) throws Exception {
        MediaMetadataRetriever retriever = new MediaMetadataRetriever();
        try {
            retriever.setDataSource(videoUrl, new HashMap<>());

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

    private void launchFallback(String videoUrl) {
        Intent fallback = new Intent(this, ConveneAnimationActivity.class);
        fallback.putExtra(ConveneAnimationActivity.EXTRA_VIDEO_URL, videoUrl);
        fallback.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        startActivity(fallback);
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        if (worker != null) worker.interrupt();
    }
}
