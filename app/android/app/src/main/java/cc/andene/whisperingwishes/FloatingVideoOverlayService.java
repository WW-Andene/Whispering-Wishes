package cc.andene.whisperingwishes;

import android.content.Intent;
import android.graphics.Matrix;
import android.graphics.Outline;
import android.graphics.SurfaceTexture;
import android.media.MediaPlayer;
import android.net.Uri;
import android.os.Build;
import android.os.IBinder;
import android.provider.Settings;
import android.app.Service;
import android.util.Log;
import android.view.Gravity;
import android.view.LayoutInflater;
import android.view.Surface;
import android.view.TextureView;
import android.view.View;
import android.view.ViewOutlineProvider;
import android.view.WindowManager;

import android.widget.Toast;

import java.util.ArrayList;

// Plays convene-animation clip(s) in a small floating, rounded window over the home
// screen instead of a fullscreen Activity — real VideoView, real quality/audio, requested
// explicitly in place of one. Also reused as-is by PullBubbleService for its own rarity-
// video playback (same floating-window mechanism, different caller).
//
// Requires android.permission.SYSTEM_ALERT_WINDOW ("draw over other apps"), which the
// user must grant manually via a dedicated system settings screen (not a normal
// runtime permission prompt) — see requestOverlayPermission(). Without it, this falls
// back to ConveneAnimationActivity (the fullscreen player) for that one tap, exactly
// like a decode/render failure would.
//
// POSITIONING: a widget provider has no public API to learn where its own widget
// instance sits on the home screen (that's private to the launcher app) — this can
// only ever be an approximate fixed-corner placement (bottom-end, matching a typical
// widget's on-screen position), never a pixel-exact overlay on the tapped widget.
//
// SCOPE: this can only ever appear while the home screen itself is showing, since the
// only way to trigger it is tapping a home-screen widget's ▶️ button — no explicit
// "am I on the home screen" check is needed for that. The one edge case: manually
// switching apps within the few seconds a clip is still playing would briefly leave
// this floating over whatever app you switched to, since it's a real system-level
// window with no foreground-app awareness of its own; properly suppressing that would
// need Accessibility/UsageStats permissions, disproportionate for a few-second window.
public class FloatingVideoOverlayService extends Service {
    private static final String TAG = "FloatingVideoOverlay";
    // Roughly a 16:9 card sized like a typical 2-cell-wide home-screen widget.
    private static final int CARD_WIDTH_DP = 200;
    private static final int CARD_HEIGHT_DP = 112;
    private static final int CARD_MARGIN_DP = 24;

    public static final String EXTRA_VIDEO_URL = "overlay_video_url";
    public static final String EXTRA_VIDEO_URLS = "overlay_video_urls"; // ArrayList<String>, queue mode
    // Optional top-left screen position (px) for the video card — when a caller actually
    // knows where its own trigger is on screen (PullBubbleService's main bubble does; a
    // home-screen widget's ▶️ button does NOT, see the POSITIONING note above), this
    // anchors the video "on the side" of that trigger instead of the fixed bottom-end
    // corner default. Clamped to stay fully on-screen either way.
    public static final String EXTRA_ANCHOR_X = "overlay_anchor_x";
    public static final String EXTRA_ANCHOR_Y = "overlay_anchor_y";

    // Lets a caller that started this service know when its ENTIRE queue is actually done
    // playing (or gave up), instead of firing-and-forgetting — PullBubbleService needs this to
    // sequence its own multi-step reveal (rarity clip, then each item's own reveal beat/convene
    // clip, one step at a time) rather than showing every pulled item immediately alongside a
    // video that hasn't finished yet. Static + set-right-before-starting rather than a
    // Parcelable extra since caller and this service always run in the same app process here
    // (no :process declared) — a real cross-process IPC callback (ResultReceiver etc.) would be
    // overkill for that. Only one playback is ever active at a time by design (PullBubbleService
    // guards against overlapping rolls), so a single static slot is enough.
    private static Callback callback;
    interface Callback { void onFinished(); }
    static void setCallback(Callback c) { callback = c; }

    private WindowManager windowManager;
    private View overlayView;
    private TextureView textureView;
    private MediaPlayer mediaPlayer;
    private Surface surface;
    private boolean surfaceReady;
    private final ArrayList<String> queue = new ArrayList<>();
    private int queueIndex = 0;
    private boolean hasAnchor;
    private int anchorX, anchorY;
    private boolean finished; // guards against double-firing the callback/stopSelf
    private Callback myCallback; // this instance's own snapshot of the static slot above

    @Override
    public IBinder onBind(Intent intent) { return null; }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        // Snapshot-and-clear the static slot immediately, before any early return below —
        // whatever caller started THIS instance owns this callback, and clearing it now means
        // a later, unrelated start (e.g. a plain widget ▶️ press with no caller waiting) can't
        // accidentally reuse a stale one.
        myCallback = callback;
        callback = null;

        if (intent == null) { finish(startId); return START_NOT_STICKY; }

        ArrayList<String> urls = intent.getStringArrayListExtra(EXTRA_VIDEO_URLS);
        queue.clear();
        if (urls != null && !urls.isEmpty()) {
            queue.addAll(urls);
        } else {
            String single = intent.getStringExtra(EXTRA_VIDEO_URL);
            if (single != null && !single.isEmpty()) queue.add(single);
        }
        if (queue.isEmpty()) { finish(startId); return START_NOT_STICKY; }

        hasAnchor = intent.hasExtra(EXTRA_ANCHOR_X) && intent.hasExtra(EXTRA_ANCHOR_Y);
        anchorX = intent.getIntExtra(EXTRA_ANCHOR_X, 0);
        anchorY = intent.getIntExtra(EXTRA_ANCHOR_Y, 0);

        if (!Settings.canDrawOverlays(this)) {
            Log.w(TAG, "Overlay permission not granted — falling back and prompting for it");
            requestOverlayPermission();
            launchFallbackActivity();
            finish(startId);
            return START_NOT_STICKY;
        }

        try {
            // playAt(0) is NOT called here — it fires from the TextureView's own
            // SurfaceTextureListener once its Surface actually exists (see showOverlay()).
            // A MediaPlayer needs a real Surface to attach to; calling setSurface(null) before
            // the TextureView has produced one would just silently fail to render.
            showOverlay();
        } catch (Throwable t) {
            Log.w(TAG, "Floating overlay failed, falling back to fullscreen player", t);
            removeOverlay();
            launchFallbackActivity();
            finish(startId);
        }
        return START_NOT_STICKY;
    }

    // Single place every termination path routes through — fires the caller's callback (if
    // any) exactly once, then stops the service. Called instead of a bare stopSelf() so a
    // caller sequencing multi-step playback (PullBubbleService) always hears back, whether
    // this run finished cleanly, hit an error, or never got to play at all (permission missing,
    // empty queue).
    private void finish(int startId) {
        if (finished) return;
        finished = true;
        if (myCallback != null) myCallback.onFinished();
        stopSelf(startId);
    }

    // Same as finish(int) for call sites (playAt, listeners) that don't have a startId handy.
    private void finish() {
        if (finished) return;
        finished = true;
        if (myCallback != null) myCallback.onFinished();
        stopSelf();
    }

    // Sends the user to the dedicated "draw over other apps" settings screen for this
    // app — there is no normal runtime prompt for this permission. Only worth doing
    // once per miss rather than nagging every tap; a future enhancement could track
    // "already asked" in prefs, but a single extra Settings trip per un-granted tap is
    // an acceptable starting point.
    private void requestOverlayPermission() {
        Intent settingsIntent = new Intent(Settings.ACTION_MANAGE_OVERLAY_PERMISSION, Uri.parse("package:" + getPackageName()));
        settingsIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        try {
            startActivity(settingsIntent);
        } catch (Exception e) {
            Log.w(TAG, "Couldn't open overlay-permission settings", e);
        }
    }

    private void launchFallbackActivity() {
        Intent fallback = new Intent(this, ConveneAnimationActivity.class);
        fallback.putStringArrayListExtra(ConveneAnimationActivity.EXTRA_VIDEO_URLS, queue);
        fallback.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        startActivity(fallback);
    }

    private void showOverlay() {
        windowManager = (WindowManager) getSystemService(WINDOW_SERVICE);
        overlayView = LayoutInflater.from(this).inflate(R.layout.overlay_floating_video, null);

        View root = overlayView.findViewById(R.id.overlay_root);
        // clipToOutline + a rounded-rect outline is what actually clips the child TextureView's
        // video content to rounded corners — the background drawable alone only shows through
        // the corners, it doesn't clip content drawn on top of it. This only works because the
        // child is a TextureView, not VideoView's SurfaceView — see overlay_floating_video.xml's
        // own comment on why that swap was necessary for rounding to have any effect at all.
        root.setOutlineProvider(new ViewOutlineProvider() {
            @Override
            public void getOutline(View view, Outline outline) {
                float radiusPx = 16 * getResources().getDisplayMetrics().density;
                outline.setRoundRect(0, 0, view.getWidth(), view.getHeight(), radiusPx);
            }
        });
        root.setClipToOutline(true);
        // Tap the floating card to skip the whole queue, same as the fullscreen player.
        root.setOnClickListener(v -> { removeOverlay(); finish(); });

        textureView = overlayView.findViewById(R.id.overlay_video);
        textureView.setSurfaceTextureListener(new TextureView.SurfaceTextureListener() {
            @Override
            public void onSurfaceTextureAvailable(SurfaceTexture st, int width, int height) {
                surface = new Surface(st);
                surfaceReady = true;
                playAt(0);
            }

            @Override
            public void onSurfaceTextureSizeChanged(SurfaceTexture st, int width, int height) {}

            @Override
            public boolean onSurfaceTextureDestroyed(SurfaceTexture st) {
                surfaceReady = false;
                return true; // this service owns releasing it — see releasePlayer()
            }

            @Override
            public void onSurfaceTextureUpdated(SurfaceTexture st) {}
        });

        int overlayType = Build.VERSION.SDK_INT >= Build.VERSION_CODES.O
                ? WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
                : WindowManager.LayoutParams.TYPE_PHONE;
        float density = getResources().getDisplayMetrics().density;
        int cardWidthPx = (int) (CARD_WIDTH_DP * density);
        int cardHeightPx = (int) (CARD_HEIGHT_DP * density);
        WindowManager.LayoutParams params = new WindowManager.LayoutParams(
                cardWidthPx, cardHeightPx, overlayType,
                WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE,
                android.graphics.PixelFormat.TRANSLUCENT);

        if (hasAnchor) {
            // "On the side" of whatever triggered this (PullBubbleService's main bubble) —
            // to the anchor's left with a small gap, vertically aligned with it, clamped so
            // the whole card stays on-screen regardless of how close to an edge the anchor is.
            android.util.DisplayMetrics dm = getResources().getDisplayMetrics();
            int gap = (int) (12 * density);
            params.gravity = Gravity.TOP | Gravity.START;
            params.x = Math.max(0, Math.min(anchorX - cardWidthPx - gap, dm.widthPixels - cardWidthPx));
            params.y = Math.max(0, Math.min(anchorY, dm.heightPixels - cardHeightPx));
        } else {
            params.gravity = Gravity.BOTTOM | Gravity.END;
            params.x = (int) (CARD_MARGIN_DP * density);
            params.y = (int) (CARD_MARGIN_DP * density);
        }

        windowManager.addView(overlayView, params);
    }

    private void playAt(int index) {
        queueIndex = index;
        if (queueIndex >= queue.size()) { removeOverlay(); finish(); return; }
        if (overlayView == null || !surfaceReady || surface == null) return; // resumes from onSurfaceTextureAvailable if not ready yet

        releasePlayer();
        try {
            mediaPlayer = new MediaPlayer();
            mediaPlayer.setSurface(surface);
            mediaPlayer.setDataSource(queue.get(queueIndex));
            mediaPlayer.setOnPreparedListener(mp -> {
                adjustTextureAspect(mp.getVideoWidth(), mp.getVideoHeight());
                mp.setLooping(false);
                mp.start();
            });
            mediaPlayer.setOnCompletionListener(mp -> playAt(queueIndex + 1));
            String failingUrl = queue.get(queueIndex);
            mediaPlayer.setOnErrorListener((mp, what, extra) -> {
                // Diagnostic only — helps pin down exactly which URL/error a remote (network)
                // convene clip failed with, rather than the reveal sequence just silently
                // moving on with no clue why. Local bundled asset clips (file:// URIs) almost
                // never hit this; a remote clip (http/https) failing here means the request
                // itself failed — wrong host, network error, or the server didn't serve a
                // playable video (auth wall, 404, wrong content-type) — not a codec/UI issue.
                Log.w(TAG, "MediaPlayer error what=" + what + " extra=" + extra + " url=" + failingUrl);
                if (failingUrl != null && failingUrl.startsWith("http")) {
                    Toast.makeText(getApplicationContext(), "Convene clip failed (" + what + "/" + extra + "): " + failingUrl, Toast.LENGTH_LONG).show();
                }
                removeOverlay();
                finish();
                return true;
            });
            mediaPlayer.prepareAsync();
        } catch (Exception e) {
            Log.w(TAG, "MediaPlayer setup failed for url=" + queue.get(queueIndex), e);
            if (queue.get(queueIndex) != null && queue.get(queueIndex).startsWith("http")) {
                Toast.makeText(getApplicationContext(), "Convene clip setup failed: " + e.getMessage(), Toast.LENGTH_LONG).show();
            }
            removeOverlay();
            finish();
        }
    }

    // TextureView (unlike VideoView) does NOT auto-scale-and-letterbox its content to the
    // video's own aspect ratio — it just stretches to fill its bounds, distorting anything that
    // doesn't already match the card's exact aspect ratio. This applies a center-crop transform
    // (scale up whichever axis is short, keep centered) once the video's real dimensions are
    // known, matching how VideoView's own default scaling used to look.
    private void adjustTextureAspect(int videoWidth, int videoHeight) {
        if (textureView == null || videoWidth <= 0 || videoHeight <= 0) return;
        int viewWidth = textureView.getWidth();
        int viewHeight = textureView.getHeight();
        if (viewWidth <= 0 || viewHeight <= 0) return;
        float viewRatio = (float) viewWidth / viewHeight;
        float videoRatio = (float) videoWidth / videoHeight;
        float scaleX = 1f, scaleY = 1f;
        if (videoRatio > viewRatio) {
            scaleX = videoRatio / viewRatio;
        } else {
            scaleY = viewRatio / videoRatio;
        }
        Matrix matrix = new Matrix();
        matrix.setScale(scaleX, scaleY, viewWidth / 2f, viewHeight / 2f);
        textureView.setTransform(matrix);
    }

    private void releasePlayer() {
        if (mediaPlayer != null) {
            try { mediaPlayer.stop(); } catch (Exception ignored) {}
            try { mediaPlayer.release(); } catch (Exception ignored) {}
            mediaPlayer = null;
        }
    }

    private void removeOverlay() {
        releasePlayer();
        if (overlayView != null && windowManager != null) {
            try {
                windowManager.removeView(overlayView);
            } catch (Exception ignored) {
                // Already detached (e.g. a second removeOverlay() call racing the first) —
                // safe to ignore, this is just cleanup.
            }
        }
        overlayView = null;
        textureView = null;
        surface = null;
        surfaceReady = false;
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        removeOverlay();
        // Safety net: if the service got torn down some other way (task killed, system
        // reclaim) without going through finish() first, a caller sequencing multi-step
        // playback would otherwise wait forever for a callback that never comes.
        finish();
    }
}
