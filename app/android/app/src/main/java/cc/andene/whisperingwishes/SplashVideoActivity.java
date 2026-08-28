package cc.andene.whisperingwishes;

import android.app.Activity;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.widget.VideoView;

import java.util.Random;

// Real launcher Activity now (see AndroidManifest.xml) — replaces the old
// HTML/JS boot splash that lived inside the WebView. That approach kept
// stuttering because the video's decode was sharing a process with
// Capacitor's JS bridge initializing at the exact same moment; nothing
// done on the web side could fix that shared-process contention. This
// Activity has no WebView and no JS at all, so the video has the whole
// process to itself until MainActivity is started.
//
// Plays one of the two Boot_Intro clips (res/raw/, byte-identical copies of
// the ones in app/public/ used by the web/debug build — raw resources
// because that's the fastest, purely-local playback path a VideoView has,
// with no asset-directory indirection) picked at random, fades it out over
// FADE_MS right before handing off to MainActivity.
// Plain Activity, not AppCompatActivity — this Activity needs no AppCompat
// features (no action bar, no fragments), and AppTheme.NoActionBarLaunch's
// parent (Theme.SplashScreen) isn't a Theme.AppCompat descendant, which
// AppCompatActivity.setContentView() requires and throws on otherwise.
// MainActivity gets away with the same theme because it's a Capacitor
// BridgeActivity, not AppCompatActivity — this crashed on launch until
// switched to match.
public class SplashVideoActivity extends Activity {

    private static final long FADE_MS = 1000;
    private static final long FALLBACK_MS = 6000;

    private final Handler handler = new Handler(Looper.getMainLooper());
    private boolean handedOff = false;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_splash_video);

        VideoView videoView = findViewById(R.id.splashVideoView);

        int[] clips = { R.raw.boot_intro_frover, R.raw.boot_intro_mrover };
        int chosen = clips[new Random().nextInt(clips.length)];
        Uri uri = Uri.parse("android.resource://" + getPackageName() + "/" + chosen);
        videoView.setVideoURI(uri);

        videoView.setOnPreparedListener(mp -> {
            mp.setLooping(false);
            int duration = mp.getDuration();
            if (duration > 0) {
                long fadeStart = Math.max(0, duration - FADE_MS);
                handler.postDelayed(() -> fadeOutAndProceed(videoView), fadeStart);
            }
        });
        videoView.setOnCompletionListener(mp -> proceedToMain());
        videoView.setOnErrorListener((mp, what, extra) -> {
            proceedToMain();
            return true;
        });
        // Covers a video that fails to fire prepared/completion/error at all
        // (rare, but this is the only thing standing between the user and a
        // permanently stuck splash if it happens).
        handler.postDelayed(this::proceedToMain, FALLBACK_MS);

        videoView.start();
    }

    private void fadeOutAndProceed(VideoView videoView) {
        if (handedOff) return;
        videoView.animate().alpha(0f).setDuration(FADE_MS).start();
        handler.postDelayed(this::proceedToMain, FADE_MS);
    }

    private void proceedToMain() {
        if (handedOff) return;
        handedOff = true;
        startActivity(new Intent(this, MainActivity.class));
        finish();
    }

    @Override
    protected void onDestroy() {
        handler.removeCallbacksAndMessages(null);
        super.onDestroy();
    }
}
