package cc.andene.whisperingwishes;

import android.app.Activity;
import android.net.Uri;
import android.os.Bundle;
import android.view.View;
import android.view.WindowManager;
import android.widget.Toast;
import android.widget.VideoView;

import java.util.ArrayList;

// Full-screen player launched from PulseBannerWidget.java's ▶️ button — plays a
// character's convene-animation clip(s) (same asset ConveneVideoLayer.jsx
// plays in-app for BannerCard's ▶️ preview), then closes. Also kept as
// FloatingVideoOverlayService's own fallback if the overlay permission isn't
// granted or overlay playback fails for any reason.
//
// This exists ONLY because a home-screen widget itself can't do this: a
// widget is RemoteViews, drawn by the launcher app's process, and RemoteViews
// has no VideoView support at all (see PulseBannerWidget.java's file header for
// the platform-enforced reasoning). A real Activity has no such limit, so
// this is a real Activity — the ▶️ tap opens it instead of playing inline.
//
// Accepts EITHER a single EXTRA_VIDEO_URL or a queue of them (EXTRA_VIDEO_URLS,
// an ArrayList<String>) — chained via VideoView's own onCompletionListener
// loading the next URL and restarting, no frame-decoding/bitmap tricks needed
// here at all (unlike the widget itself): a real Activity has a real VideoView
// with real hardware decoding, so playing N clips back-to-back is just "load
// the next one when the current one finishes."
//
// Video URLs are plain hosted URLs (convene-animations/ is excluded from the
// native app's bundled assets — see capacitor-build/build.mjs's
// EXCLUDED_DIRS — so these stream like any other network video), passed in by
// widgetSync.js's syncBannerWidget() via SharedPreferences and handed to
// PulseBannerWidget.java as an Intent extra.
public class ConveneAnimationActivity extends Activity {
    public static final String EXTRA_VIDEO_URL = "convene_video_url";
    public static final String EXTRA_VIDEO_URLS = "convene_video_urls"; // ArrayList<String>, queue mode
    public static final String EXTRA_CHAR_NAME = "convene_char_name";

    private final ArrayList<String> queue = new ArrayList<>();
    private int queueIndex = 0;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        setContentView(R.layout.activity_convene_animation);

        ArrayList<String> urls = getIntent().getStringArrayListExtra(EXTRA_VIDEO_URLS);
        if (urls != null && !urls.isEmpty()) {
            queue.addAll(urls);
        } else {
            String single = getIntent().getStringExtra(EXTRA_VIDEO_URL);
            if (single != null && !single.isEmpty()) queue.add(single);
        }
        if (queue.isEmpty()) {
            finish();
            return;
        }

        View root = findViewById(R.id.convene_root);
        // Tap anywhere to skip the WHOLE queue — same as the in-app convene preview's
        // close button, not just the currently-playing clip.
        root.setOnClickListener(v -> finish());

        playAt(0);
    }

    private void playAt(int index) {
        queueIndex = index;
        if (queueIndex >= queue.size()) { finish(); return; }

        VideoView videoView = findViewById(R.id.convene_video);
        try {
            videoView.setVideoURI(Uri.parse(queue.get(queueIndex)));
            videoView.setOnPreparedListener(mp -> {
                mp.setLooping(false);
                videoView.start();
            });
            // Chains straight into the next clip in the queue — finish() only once the
            // LAST one completes. A single-video call (queue.size() == 1) behaves exactly
            // like before this method existed.
            videoView.setOnCompletionListener(mp -> playAt(queueIndex + 1));
            videoView.setOnErrorListener((mp, what, extra) -> {
                Toast.makeText(this, R.string.convene_widget_playback_error, Toast.LENGTH_SHORT).show();
                finish();
                return true;
            });
            // No MediaController — a bare tap-to-skip matches the app's own
            // convene preview more closely than exposing scrub/pause controls
            // for a short promotional clip (or queue of them).
            videoView.setMediaController(null);
        } catch (Exception e) {
            finish();
        }
    }
}
