package cc.andene.whisperingwishes;

import android.app.Activity;
import android.net.Uri;
import android.os.Bundle;
import android.view.View;
import android.view.WindowManager;
import android.widget.Toast;
import android.widget.VideoView;

// Full-screen player launched from GachaBannerWidget.java's ▶️ button — plays a
// single character's convene-animation clip (same asset ConveneVideoLayer.jsx
// plays in-app for BannerCard's ▶️ preview), then closes.
//
// This exists ONLY because a home-screen widget itself can't do this: a
// widget is RemoteViews, drawn by the launcher app's process, and RemoteViews
// has no VideoView support at all (see GachaBannerWidget.java's file header for
// the platform-enforced reasoning). A real Activity has no such limit, so
// this is a real Activity — the ▶️ tap opens it instead of playing inline.
//
// The video URL is a plain hosted URL (convene-animations/ is excluded from
// the native app's bundled assets — see capacitor-build/build.mjs's
// EXCLUDED_DIRS — so this streams it like any other network video), passed
// in by widgetSync.js's syncBannerWidget() via SharedPreferences and handed
// to GachaBannerWidget.java as an Intent extra.
public class ConveneAnimationActivity extends Activity {
    public static final String EXTRA_VIDEO_URL = "convene_video_url";
    public static final String EXTRA_CHAR_NAME = "convene_char_name";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        setContentView(R.layout.activity_convene_animation);

        String videoUrl = getIntent().getStringExtra(EXTRA_VIDEO_URL);
        if (videoUrl == null || videoUrl.isEmpty()) {
            finish();
            return;
        }

        VideoView videoView = findViewById(R.id.convene_video);
        View root = findViewById(R.id.convene_root);

        // Tap anywhere to skip — same as the in-app convene preview's close button.
        root.setOnClickListener(v -> finish());

        try {
            videoView.setVideoURI(Uri.parse(videoUrl));
            videoView.setOnPreparedListener(mp -> {
                mp.setLooping(false);
                videoView.start();
            });
            videoView.setOnCompletionListener(mp -> finish());
            videoView.setOnErrorListener((mp, what, extra) -> {
                Toast.makeText(this, R.string.convene_widget_playback_error, Toast.LENGTH_SHORT).show();
                finish();
                return true;
            });
            // No MediaController — a bare tap-to-skip matches the app's own
            // convene preview more closely than exposing scrub/pause controls
            // for a single short promotional clip.
            videoView.setMediaController(null);
        } catch (Exception e) {
            finish();
        }
    }
}
