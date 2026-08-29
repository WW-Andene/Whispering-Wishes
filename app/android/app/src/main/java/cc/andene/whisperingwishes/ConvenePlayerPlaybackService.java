package cc.andene.whisperingwishes;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.app.Service;
import android.content.Intent;
import android.graphics.Bitmap;
import android.graphics.Matrix;
import android.media.MediaMetadataRetriever;
import android.os.Build;
import android.os.IBinder;
import android.util.Log;
import android.util.LruCache;
import android.view.View;
import android.widget.RemoteViews;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

// ConvenePlayerWidget's ▶️ button plays the clip directly ON the widget's own art slot,
// looping it INDEFINITELY at 30fps until tapped again — unlike PulseBannerWidget's ▶️ (a
// small button on a dashboard, where FloatingVideoOverlayService's separate floating window
// for a single play-through is a reasonable minor interruption), THIS widget's entire
// purpose is playing a character's convene clip on a loop, so it needs to actually keep
// running rather than play once and stop.
//
// Decodes the clip into a sequence of downsampled bitmaps (RemoteViews genuinely cannot
// host a VideoView at all — see PulseBannerWidget.java's file header) and flips
// R.id.convene_player_art through them on a timer, same bitmap-frame-swap technique this
// app has used elsewhere for content that must render ON a widget's own surface. Frames are
// decoded ONCE per clip and cached in memory (FRAME_CACHE) so replaying the same character
// doesn't re-hit the network/decoder — only a genuinely new character triggers a fresh decode.
//
// FOREGROUND SERVICE, unlike this app's other short-lived tap-triggered services: an
// infinite loop in a plain service would get killed by Android's background-execution
// limits after a short grace period regardless of what the code says — there is no way to
// actually loop forever without this. Declared foregroundServiceType="specialUse" (reusing
// the same declared use case as PullBubbleService — a persistent, user-toggled convenience
// the user explicitly started and can stop the same way) rather than "mediaPlayback", to
// avoid needing yet another FGS-type permission for what's conceptually the same kind of
// always-on widget behavior already justified there.
//
// STOPPING: tapping the ▶️/art again while a given widget instance is looping stops it and
// reverts to the static art — this is the ONLY way to stop an instance once started, since
// there is no other UI surface on a home-screen widget to put a stop control on. The ▶️
// icon itself auto-hides 3s after a loop starts (showing a "play" affordance over an
// already-looping video reads as wrong) and reappears once stopped.
public class ConvenePlayerPlaybackService extends Service {
    private static final String TAG = "ConvenePlayerPlayback";
    private static final String CHANNEL_ID = "convene_player";
    private static final int FRAME_PX = ConvenePlayerWidget.ART_PX; // matches the static art's own decode size
    private static final int TARGET_FPS = 30;
    private static final long FRAME_INTERVAL_MS = 1000L / TARGET_FPS;
    // Ceiling on decoded frames — this extracts everything before playback starts, it
    // doesn't stream. 300 frames = 10s of clip at 30fps, comfortably covers a full convene
    // clip (typically a few seconds) without an unbounded decode on a malformed/long source.
    private static final int MAX_FRAMES = 300;
    // How long after a loop starts before the ▶️ icon hides itself.
    private static final long PLAY_ICON_HIDE_DELAY_MS = 3000;

    public static final String EXTRA_APP_WIDGET_ID = "convene_player_playback_appwidget_id";
    public static final String EXTRA_VIDEO_URL = "convene_player_playback_video_url";

    // Decoded-frame cache, keyed by video URL — small LRU cap so a session that plays many
    // different characters doesn't grow this unbounded; each entry can be dozens of small
    // bitmaps. Evicted entries have their bitmaps recycled since nothing else holds a
    // reference to them once evicted.
    private static final LruCache<String, List<Bitmap>> FRAME_CACHE = new LruCache<String, List<Bitmap>>(4) {
        @Override
        protected void entryRemoved(boolean evicted, String key, List<Bitmap> oldValue, List<Bitmap> newValue) {
            if (evicted) for (Bitmap b : oldValue) if (!b.isRecycled()) b.recycle();
        }
    };

    // Which widget instances currently have a looping worker — tapping ▶️/art on an
    // instance already in this set stops it instead of starting a second overlapping loop.
    private static final Set<Integer> playingWidgets = new HashSet<>();
    private static final java.util.Map<Integer, Thread> workers = new HashMap<>();

    @Override
    public IBinder onBind(Intent intent) { return null; }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        if (intent == null) { stopIfIdle(startId); return START_NOT_STICKY; }
        int appWidgetId = intent.getIntExtra(EXTRA_APP_WIDGET_ID, -1);
        String videoUrl = intent.getStringExtra(EXTRA_VIDEO_URL);
        if (appWidgetId == -1 || videoUrl == null) { stopIfIdle(startId); return START_NOT_STICKY; }

        synchronized (playingWidgets) {
            if (playingWidgets.contains(appWidgetId)) {
                stopLoop(appWidgetId);
                stopIfIdle(startId);
                return START_NOT_STICKY;
            }
            playingWidgets.add(appWidgetId);
        }

        startForeground(appWidgetId, buildNotification());

        Thread worker = new Thread(() -> {
            try {
                runLoop(appWidgetId, videoUrl);
            } catch (Throwable t) {
                Log.w(TAG, "Frame playback failed, falling back to fullscreen player", t);
                launchFallback(videoUrl);
            } finally {
                synchronized (playingWidgets) { playingWidgets.remove(appWidgetId); }
                ConvenePlayerWidget.requestUpdateSingle(this, appWidgetId);
                stopIfIdle(startId);
            }
        }, "ConvenePlayerPlayback-" + appWidgetId);
        synchronized (workers) { workers.put(appWidgetId, worker); }
        worker.start();
        return START_STICKY;
    }

    private void stopLoop(int appWidgetId) {
        synchronized (playingWidgets) { playingWidgets.remove(appWidgetId); }
        Thread worker;
        synchronized (workers) { worker = workers.remove(appWidgetId); }
        if (worker != null) worker.interrupt();
        ConvenePlayerWidget.requestUpdateSingle(this, appWidgetId);
    }

    // Only actually stops the (single, shared) foreground service once nothing is playing
    // on ANY widget instance — several ConvenePlayerWidget instances can loop independently,
    // each tracked by its own entry in playingWidgets/workers.
    private void stopIfIdle(int startId) {
        boolean idle;
        synchronized (playingWidgets) { idle = playingWidgets.isEmpty(); }
        if (idle) {
            stopForeground(true);
            stopSelf(startId);
        }
    }

    private android.app.Notification buildNotification() {
        Intent openApp = new Intent(this, MainActivity.class);
        PendingIntent contentIntent = PendingIntent.getActivity(this, 0, openApp,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);

        android.app.Notification.Builder builder;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationManager nm = getSystemService(NotificationManager.class);
            NotificationChannel channel = new NotificationChannel(CHANNEL_ID,
                    getString(R.string.convene_player_notification_channel_name), NotificationManager.IMPORTANCE_MIN);
            nm.createNotificationChannel(channel);
            builder = new android.app.Notification.Builder(this, CHANNEL_ID);
        } else {
            builder = new android.app.Notification.Builder(this);
            builder.setPriority(android.app.Notification.PRIORITY_MIN);
        }
        return builder
                .setSmallIcon(android.R.drawable.ic_menu_gallery)
                .setContentTitle(getString(R.string.convene_player_notification_title))
                .setContentText(getString(R.string.convene_player_notification_text))
                .setOngoing(true)
                .setContentIntent(contentIntent)
                .build();
    }

    private void runLoop(int appWidgetId, String videoUrl) throws Exception {
        List<Bitmap> frames = getOrDecodeFrames(videoUrl);
        if (frames.isEmpty()) throw new IllegalStateException("No frames decoded from " + videoUrl);

        AppWidgetManager manager = AppWidgetManager.getInstance(this);
        RemoteViews base = ConvenePlayerWidget.buildViews(this, appWidgetId);
        if (base == null) return; // widget was removed mid-decode

        long loopStart = System.currentTimeMillis();
        boolean playIconHidden = false;

        while (!Thread.currentThread().isInterrupted()) {
            for (Bitmap frame : frames) {
                if (Thread.currentThread().isInterrupted()) return;
                if (!playIconHidden && System.currentTimeMillis() - loopStart >= PLAY_ICON_HIDE_DELAY_MS) {
                    // INVISIBLE, not GONE — GONE removes the view from touch hit-testing
                    // entirely, and this button doubles as the ONLY stop control once
                    // playing (tapping it again while already looping stops the loop, see
                    // onStartCommand). INVISIBLE keeps it tappable in the same spot while
                    // hiding the now-redundant "play" glyph over an already-playing video.
                    base.setViewVisibility(R.id.convene_player_play, View.INVISIBLE);
                    playIconHidden = true;
                }
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
    }

    // Returns the cached frame list for videoUrl, decoding (and caching) it only if this is
    // the first time this specific clip has been played this session.
    private List<Bitmap> getOrDecodeFrames(String videoUrl) throws Exception {
        synchronized (FRAME_CACHE) {
            List<Bitmap> cached = FRAME_CACHE.get(videoUrl);
            if (cached != null) return cached;
        }
        List<Bitmap> decoded = extractFrames(videoUrl);
        synchronized (FRAME_CACHE) { FRAME_CACHE.put(videoUrl, decoded); }
        return decoded;
    }

    // videoUrl is always a plain http(s) URL here (convene-animations/ clips are streamed,
    // not bundled — see capacitor-build/build.mjs's EXCLUDED_DIRS).
    private List<Bitmap> extractFrames(String videoUrl) throws Exception {
        MediaMetadataRetriever retriever = new MediaMetadataRetriever();
        try {
            retriever.setDataSource(videoUrl, new HashMap<>());

            String durationStr = retriever.extractMetadata(MediaMetadataRetriever.METADATA_KEY_DURATION);
            long durationMs = durationStr != null ? Long.parseLong(durationStr) : 0;
            if (durationMs <= 0) durationMs = 3000; // sane fallback for a metadata-less source

            // "Full length" — every frame the clip's own duration calls for at TARGET_FPS,
            // capped only by MAX_FRAMES as a sanity ceiling, not an artificial short clip cap.
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
        synchronized (workers) {
            for (Thread w : workers.values()) w.interrupt();
            workers.clear();
        }
        synchronized (playingWidgets) { playingWidgets.clear(); }
    }
}
