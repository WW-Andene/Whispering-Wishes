package cc.andene.whisperingwishes;

import android.content.Intent;
import android.graphics.Outline;
import android.net.Uri;
import android.os.Build;
import android.os.IBinder;
import android.provider.Settings;
import android.app.Service;
import android.util.Log;
import android.view.Gravity;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewOutlineProvider;
import android.view.WindowManager;
import android.widget.VideoView;

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

    private WindowManager windowManager;
    private View overlayView;
    private final ArrayList<String> queue = new ArrayList<>();
    private int queueIndex = 0;

    @Override
    public IBinder onBind(Intent intent) { return null; }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        if (intent == null) { stopSelf(startId); return START_NOT_STICKY; }

        ArrayList<String> urls = intent.getStringArrayListExtra(EXTRA_VIDEO_URLS);
        queue.clear();
        if (urls != null && !urls.isEmpty()) {
            queue.addAll(urls);
        } else {
            String single = intent.getStringExtra(EXTRA_VIDEO_URL);
            if (single != null && !single.isEmpty()) queue.add(single);
        }
        if (queue.isEmpty()) { stopSelf(startId); return START_NOT_STICKY; }

        if (!Settings.canDrawOverlays(this)) {
            Log.w(TAG, "Overlay permission not granted — falling back and prompting for it");
            requestOverlayPermission();
            launchFallbackActivity();
            stopSelf(startId);
            return START_NOT_STICKY;
        }

        try {
            showOverlay();
            playAt(0);
        } catch (Throwable t) {
            Log.w(TAG, "Floating overlay failed, falling back to fullscreen player", t);
            removeOverlay();
            launchFallbackActivity();
            stopSelf(startId);
        }
        return START_NOT_STICKY;
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
        // clipToOutline + a rounded-rect outline is what actually clips the child
        // VideoView's video surface to rounded corners — the background drawable alone
        // only shows through the corners, it doesn't clip content drawn on top of it.
        root.setOutlineProvider(new ViewOutlineProvider() {
            @Override
            public void getOutline(View view, Outline outline) {
                float radiusPx = 16 * getResources().getDisplayMetrics().density;
                outline.setRoundRect(0, 0, view.getWidth(), view.getHeight(), radiusPx);
            }
        });
        root.setClipToOutline(true);
        // Tap the floating card to skip the whole queue, same as the fullscreen player.
        root.setOnClickListener(v -> { removeOverlay(); stopSelf(); });

        int overlayType = Build.VERSION.SDK_INT >= Build.VERSION_CODES.O
                ? WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
                : WindowManager.LayoutParams.TYPE_PHONE;
        float density = getResources().getDisplayMetrics().density;
        WindowManager.LayoutParams params = new WindowManager.LayoutParams(
                (int) (CARD_WIDTH_DP * density),
                (int) (CARD_HEIGHT_DP * density),
                overlayType,
                WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE,
                android.graphics.PixelFormat.TRANSLUCENT);
        params.gravity = Gravity.BOTTOM | Gravity.END;
        params.x = (int) (CARD_MARGIN_DP * density);
        params.y = (int) (CARD_MARGIN_DP * density);

        windowManager.addView(overlayView, params);
    }

    private void playAt(int index) {
        queueIndex = index;
        if (queueIndex >= queue.size()) { removeOverlay(); stopSelf(); return; }
        if (overlayView == null) return;

        VideoView videoView = overlayView.findViewById(R.id.overlay_video);
        try {
            videoView.setVideoURI(Uri.parse(queue.get(queueIndex)));
            videoView.setOnPreparedListener(mp -> {
                mp.setLooping(false);
                videoView.start();
            });
            videoView.setOnCompletionListener(mp -> playAt(queueIndex + 1));
            videoView.setOnErrorListener((mp, what, extra) -> {
                removeOverlay();
                stopSelf();
                return true;
            });
            videoView.setMediaController(null);
        } catch (Exception e) {
            removeOverlay();
            stopSelf();
        }
    }

    private void removeOverlay() {
        if (overlayView != null && windowManager != null) {
            try {
                windowManager.removeView(overlayView);
            } catch (Exception ignored) {
                // Already detached (e.g. a second removeOverlay() call racing the first) —
                // safe to ignore, this is just cleanup.
            }
        }
        overlayView = null;
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        removeOverlay();
    }
}
