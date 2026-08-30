package cc.andene.whisperingwishes;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.SharedPreferences;
import android.media.MediaPlayer;
import android.service.wallpaper.WallpaperService;
import android.util.Log;
import android.view.SurfaceHolder;

import androidx.core.content.ContextCompat;

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
    // Sent by WallpaperPlugin.setLiveWallpaper() every time a new animated background is applied
    // — including while this exact service is already the active live wallpaper. Once a live
    // wallpaper's Engine surface exists, Android has no reason to recreate it just because the
    // app overwrote the video file it reads from underneath it (same component, same surface —
    // nothing about the wallpaper's identity changed from the OS's point of view), so without
    // this the engine kept playing whatever it had already loaded: picking a second animated
    // background looked like nothing happened until the surface was recreated some other way
    // (e.g. re-picking home screen, locking/unlocking). This receiver is the explicit "the file
    // changed, reload it" signal that case was missing.
    static final String ACTION_REFRESH = "cc.andene.whisperingwishes.REFRESH_LIVE_WALLPAPER";

    @Override
    public Engine onCreateEngine() {
        return new VideoEngine();
    }

    private class VideoEngine extends Engine {
        private MediaPlayer mediaPlayer;
        private boolean visible = true;
        // Kept so the refresh receiver below can re-call startPlayback() against the surface
        // that's actually current, without waiting for a new onSurfaceCreated/Changed callback
        // that may never come on its own (see ACTION_REFRESH's own comment for why one is needed).
        private SurfaceHolder currentHolder;
        private final BroadcastReceiver refreshReceiver = new BroadcastReceiver() {
            @Override
            public void onReceive(Context context, Intent intent) {
                if (currentHolder != null) startPlayback(currentHolder);
            }
        };

        @Override
        public void onCreate(SurfaceHolder surfaceHolder) {
            super.onCreate(surfaceHolder);
            ContextCompat.registerReceiver(LiveVideoWallpaperService.this, refreshReceiver,
                    new IntentFilter(ACTION_REFRESH), ContextCompat.RECEIVER_NOT_EXPORTED);
        }

        @Override
        public void onSurfaceCreated(SurfaceHolder holder) {
            super.onSurfaceCreated(holder);
            currentHolder = holder;
            startPlayback(holder);
        }

        @Override
        public void onSurfaceChanged(SurfaceHolder holder, int format, int width, int height) {
            super.onSurfaceChanged(holder, format, width, height);
            currentHolder = holder;
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
                // Default scaling mode (SCALE_TO_FIT) stretches the video non-uniformly to
                // exactly fill the surface — since the surface is the full (portrait) screen
                // and this source video is landscape banner/splash footage, that's the
                // "squished into 9:16" look. SCALE_TO_FIT_WITH_CROPPING instead scales
                // uniformly (preserving aspect ratio) and centers, going edge-to-edge on
                // whichever axis fits first and cropping the overflow on the other — the same
                // "cover" behavior as a regular picture wallpaper.
                player.setVideoScalingMode(MediaPlayer.VIDEO_SCALING_MODE_SCALE_TO_FIT_WITH_CROPPING);
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
            try { LiveVideoWallpaperService.this.unregisterReceiver(refreshReceiver); } catch (Exception ignored) {
                // Already unregistered, or never successfully registered — nothing to clean up.
            }
        }
    }
}
