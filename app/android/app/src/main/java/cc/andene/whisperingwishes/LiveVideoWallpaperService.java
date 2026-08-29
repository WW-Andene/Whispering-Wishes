package cc.andene.whisperingwishes;

import android.content.SharedPreferences;
import android.media.MediaPlayer;
import android.service.wallpaper.WallpaperService;
import android.util.Log;
import android.view.SurfaceHolder;

import java.io.File;

// Real Android Live Wallpaper — WallpaperPlugin's static setWallpaper()/WallpaperManager.
// setBitmap() can never animate, so a genuine WallpaperService is the only way to get an
// actually-moving background. Deliberately scoped to a single static looping video with no
// parallax/multi-page home-screen offset handling — see WallpaperPlugin.setLiveWallpaper()'s
// own header for the full apply flow (download/cache -> store path -> system confirmation
// screen).
public class LiveVideoWallpaperService extends WallpaperService {
    private static final String TAG = "LiveVideoWallpaper";
    static final String PREFS_NAME = "CapacitorStorage";
    static final String PREF_VIDEO_PATH = "live_wallpaper_video_path";

    @Override
    public Engine onCreateEngine() {
        return new VideoEngine();
    }

    private class VideoEngine extends Engine {
        private MediaPlayer mediaPlayer;
        private boolean visible = true;

        @Override
        public void onSurfaceCreated(SurfaceHolder holder) {
            super.onSurfaceCreated(holder);
            startPlayback(holder);
        }

        @Override
        public void onSurfaceChanged(SurfaceHolder holder, int format, int width, int height) {
            super.onSurfaceChanged(holder, format, width, height);
            // A changed surface (rotation, resize) needs the player re-bound to the new
            // SurfaceHolder — simplest reliable way is to tear down and start fresh rather than
            // trying to rebind mid-playback.
            startPlayback(holder);
        }

        @Override
        public void onVisibilityChanged(boolean isVisible) {
            visible = isVisible;
            if (mediaPlayer == null) return;
            try {
                if (isVisible) mediaPlayer.start();
                else mediaPlayer.pause();
            } catch (Exception ignored) {
                // MediaPlayer can be in a transient invalid state right around
                // surface/visibility churn — nothing meaningful to recover here, next
                // onSurfaceCreated/Changed will rebuild it anyway.
            }
        }

        private void startPlayback(SurfaceHolder holder) {
            releasePlayer();
            SharedPreferences prefs = getSharedPreferences(PREFS_NAME, MODE_PRIVATE);
            String path = prefs.getString(PREF_VIDEO_PATH, null);
            if (path == null || !new File(path).exists()) {
                Log.w(TAG, "No cached live-wallpaper video at " + path);
                return;
            }
            try {
                MediaPlayer player = new MediaPlayer();
                player.setDataSource(path);
                player.setSurface(holder.getSurface());
                player.setLooping(true);
                // A wallpaper plays silently — it's a background, not media playback the user
                // deliberately started.
                player.setVolume(0f, 0f);
                player.setOnPreparedListener(mp -> {
                    if (visible) mp.start();
                });
                player.prepareAsync();
                mediaPlayer = player;
            } catch (Exception e) {
                Log.w(TAG, "Could not start live wallpaper playback", e);
                releasePlayer();
            }
        }

        private void releasePlayer() {
            if (mediaPlayer == null) return;
            try { mediaPlayer.release(); } catch (Exception ignored) {}
            mediaPlayer = null;
        }

        @Override
        public void onSurfaceDestroyed(SurfaceHolder holder) {
            super.onSurfaceDestroyed(holder);
            releasePlayer();
        }

        @Override
        public void onDestroy() {
            super.onDestroy();
            releasePlayer();
        }
    }
}
