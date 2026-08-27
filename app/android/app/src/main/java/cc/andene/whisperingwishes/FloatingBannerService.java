package cc.andene.whisperingwishes;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.graphics.Bitmap;
import android.graphics.Matrix;
import android.graphics.PixelFormat;
import android.graphics.SurfaceTexture;
import android.media.MediaPlayer;
import android.net.Uri;
import android.os.Build;
import android.os.IBinder;
import android.util.DisplayMetrics;
import android.view.Gravity;
import android.view.LayoutInflater;
import android.view.MotionEvent;
import android.view.Surface;
import android.view.TextureView;
import android.view.View;
import android.view.WindowManager;
import android.widget.ImageButton;
import android.widget.ImageView;
import android.widget.TextView;

import androidx.annotation.Nullable;
import androidx.core.app.NotificationCompat;

// The "make the widget actually play video in place" feature — this is NOT
// a home-screen AppWidget (RemoteViews genuinely cannot host a video view;
// see BannerWidget.java's file header). This is a WindowManager overlay
// window — the same mechanism chat-bubble/floating-control apps use —
// holding a real View hierarchy, so a video plays inline, in the same
// window, with no separate screen opening. Played via TextureView + a
// manual MediaPlayer rather than the higher-level VideoView widget —
// VideoView is backed by a SurfaceView, which composites on its own
// separate surface and ignores this window's rounded-corner clipping (see
// playConveneVideo()'s comment for the full explanation).
//
// Requires the user to grant "Display over other apps"
// (Settings.ACTION_MANAGE_OVERLAY_PERMISSION) — there is no runtime
// permission dialog for this, only a settings screen; FloatingBannerPlugin.js
// handles checking/requesting it and redirecting the user there.
//
// Android has no API exposing where a home-screen widget is actually
// rendered on screen (see the app's own design notes on this), so unlike a
// real widget, this floating banner's position is NOT auto-detected — the
// user drags it wherever they want (onTouch below), and that position is
// persisted so it reopens in the same spot next time.
//
// A foreground service (required so Android doesn't kill the overlay
// shortly after) means a persistent low-priority notification while this is
// active — that's an Android platform requirement for any long-running
// foreground service, not something this can hide.
public class FloatingBannerService extends Service {
    private static final String PREFS_NAME = "CapacitorStorage";
    private static final String KEY_NAME = "widget_banner_name";
    private static final String KEY_ART_ASSET = "widget_banner_art_asset";
    private static final String KEY_CONVENE_URL = "widget_banner_convene_url";
    private static final String KEY_POS_X = "floating_banner_x";
    private static final String KEY_POS_Y = "floating_banner_y";

    private static final String CHANNEL_ID = "floating_banner";
    private static final int NOTIFICATION_ID = 4201;
    private static final int TAP_SLOP_PX = 12;

    private WindowManager windowManager;
    private View overlayView;
    private WindowManager.LayoutParams layoutParams;
    private SharedPreferences prefs;
    private MediaPlayer mediaPlayer;

    @Nullable
    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }

    @Override
    public void onCreate() {
        super.onCreate();
        prefs = getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        startForeground(NOTIFICATION_ID, buildNotification());
        addOverlay();
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        // Data may have changed (new banner) since the overlay was first
        // shown — refresh content on every (re)start rather than only onCreate.
        refreshContent();
        return START_NOT_STICKY;
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        releaseMediaPlayer();
        if (overlayView != null && windowManager != null) {
            try {
                windowManager.removeView(overlayView);
            } catch (IllegalArgumentException ignored) {
                // Already removed.
            }
        }
        overlayView = null;
    }

    private void addOverlay() {
        windowManager = (WindowManager) getSystemService(WINDOW_SERVICE);
        overlayView = LayoutInflater.from(this).inflate(R.layout.floating_banner, null);

        int type = Build.VERSION.SDK_INT >= Build.VERSION_CODES.O
                ? WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
                : WindowManager.LayoutParams.TYPE_PHONE;

        layoutParams = new WindowManager.LayoutParams(
                WindowManager.LayoutParams.WRAP_CONTENT,
                WindowManager.LayoutParams.WRAP_CONTENT,
                type,
                WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE,
                PixelFormat.TRANSLUCENT);
        layoutParams.gravity = Gravity.TOP | Gravity.START;

        DisplayMetrics dm = getResources().getDisplayMetrics();
        layoutParams.x = prefs.getInt(KEY_POS_X, (int) (24 * dm.density));
        layoutParams.y = prefs.getInt(KEY_POS_Y, (int) (140 * dm.density));

        setupDrag();
        setupPlayButton();
        setupCloseButton();

        windowManager.addView(overlayView, layoutParams);
        refreshContent();
    }

    // Drag-to-reposition on the card itself (not the play/close buttons,
    // which consume their own touches). A tap under TAP_SLOP_PX of movement
    // is treated as a no-op here rather than a click — the card has no tap
    // action of its own, only its two buttons do.
    private void setupDrag() {
        View root = overlayView.findViewById(R.id.floating_root);
        root.setOnTouchListener(new View.OnTouchListener() {
            private int startX, startY;
            private float startTouchX, startTouchY;

            @Override
            public boolean onTouch(View v, MotionEvent event) {
                switch (event.getAction()) {
                    case MotionEvent.ACTION_DOWN:
                        startX = layoutParams.x;
                        startY = layoutParams.y;
                        startTouchX = event.getRawX();
                        startTouchY = event.getRawY();
                        return true;
                    case MotionEvent.ACTION_MOVE:
                        int dx = (int) (event.getRawX() - startTouchX);
                        int dy = (int) (event.getRawY() - startTouchY);
                        layoutParams.x = startX + dx;
                        layoutParams.y = startY + dy;
                        windowManager.updateViewLayout(overlayView, layoutParams);
                        return true;
                    case MotionEvent.ACTION_UP:
                        float moved = Math.abs(event.getRawX() - startTouchX) + Math.abs(event.getRawY() - startTouchY);
                        if (moved > TAP_SLOP_PX) {
                            prefs.edit().putInt(KEY_POS_X, layoutParams.x).putInt(KEY_POS_Y, layoutParams.y).apply();
                        }
                        return true;
                }
                return false;
            }
        });
    }

    private void setupPlayButton() {
        ImageButton play = overlayView.findViewById(R.id.floating_play);
        play.setOnClickListener(v -> {
            String conveneUrl = prefs.getString(KEY_CONVENE_URL, null);
            if (conveneUrl == null) return;
            playConveneVideo(conveneUrl);
        });
    }

    private void setupCloseButton() {
        ImageButton close = overlayView.findViewById(R.id.floating_close);
        close.setOnClickListener(v -> stopSelf());
    }

    // Plays via a manual MediaPlayer + TextureView instead of the high-level
    // VideoView widget — see floating_banner.xml's comment on floating_video
    // for why (VideoView's SurfaceView ignores clipToOutline and doesn't
    // reliably fill a fixed-size box). The TextureView itself is a plain
    // (fixed 260x120dp) box; once the video's real dimensions are known,
    // applyCoverTransform scales+centers it to fill that box without
    // distorting its aspect ratio, same idea as CSS's object-fit: cover.
    private void playConveneVideo(String url) {
        ImageView art = overlayView.findViewById(R.id.floating_art);
        TextureView textureView = overlayView.findViewById(R.id.floating_video);
        ImageButton play = overlayView.findViewById(R.id.floating_play);

        art.setVisibility(View.GONE);
        play.setVisibility(View.GONE);
        textureView.setVisibility(View.VISIBLE);

        if (textureView.isAvailable()) {
            startPlayback(url, textureView.getSurfaceTexture(), textureView);
        } else {
            textureView.setSurfaceTextureListener(new TextureView.SurfaceTextureListener() {
                @Override
                public void onSurfaceTextureAvailable(SurfaceTexture surface, int width, int height) {
                    startPlayback(url, surface, textureView);
                }

                @Override
                public boolean onSurfaceTextureDestroyed(SurfaceTexture surface) {
                    return true;
                }

                @Override
                public void onSurfaceTextureSizeChanged(SurfaceTexture surface, int width, int height) {}

                @Override
                public void onSurfaceTextureUpdated(SurfaceTexture surface) {}
            });
        }
    }

    private void startPlayback(String url, SurfaceTexture surfaceTexture, TextureView textureView) {
        releaseMediaPlayer();
        try {
            mediaPlayer = new MediaPlayer();
            mediaPlayer.setSurface(new Surface(surfaceTexture));
            mediaPlayer.setDataSource(this, Uri.parse(url));
            // Fires as soon as the real dimensions are known — usually before
            // onPrepared, but applying it again there too covers players/
            // formats where it doesn't fire until playback actually starts.
            mediaPlayer.setOnVideoSizeChangedListener((mp, width, height) ->
                    applyCoverTransform(textureView, width, height));
            mediaPlayer.setOnPreparedListener(mp -> {
                applyCoverTransform(textureView, mp.getVideoWidth(), mp.getVideoHeight());
                mp.start();
            });
            mediaPlayer.setOnCompletionListener(mp -> revertToArt());
            mediaPlayer.setOnErrorListener((mp, what, extra) -> {
                revertToArt();
                return true;
            });
            mediaPlayer.prepareAsync();
        } catch (Exception e) {
            revertToArt();
        }
    }

    // CSS object-fit: cover, by hand — scales (from its center) whichever
    // axis is needed so the video fills the TextureView's box completely,
    // cropping the overflow rather than letterboxing or stretching/
    // distorting the aspect ratio.
    private void applyCoverTransform(TextureView textureView, int videoWidth, int videoHeight) {
        int viewWidth = textureView.getWidth();
        int viewHeight = textureView.getHeight();
        if (viewWidth == 0 || viewHeight == 0 || videoWidth == 0 || videoHeight == 0) return;

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

    private void revertToArt() {
        if (overlayView == null) return;
        View art = overlayView.findViewById(R.id.floating_art);
        View videoView = overlayView.findViewById(R.id.floating_video);
        View play = overlayView.findViewById(R.id.floating_play);
        videoView.setVisibility(View.GONE);
        art.setVisibility(View.VISIBLE);
        play.setVisibility(View.VISIBLE);
        releaseMediaPlayer();
    }

    private void releaseMediaPlayer() {
        if (mediaPlayer != null) {
            try {
                mediaPlayer.release();
            } catch (Exception ignored) {}
            mediaPlayer = null;
        }
    }

    private void refreshContent() {
        if (overlayView == null) return;
        String name = prefs.getString(KEY_NAME, null);
        String artAsset = prefs.getString(KEY_ART_ASSET, null);
        String conveneUrl = prefs.getString(KEY_CONVENE_URL, null);

        TextView nameView = overlayView.findViewById(R.id.floating_name);
        nameView.setText(name != null ? name : getString(R.string.app_name));

        ImageView art = overlayView.findViewById(R.id.floating_art);
        Bitmap bitmap = WidgetAssetUtils.decodeAsset(this, artAsset, 600);
        if (bitmap != null) art.setImageBitmap(bitmap);

        ImageButton play = overlayView.findViewById(R.id.floating_play);
        play.setVisibility(conveneUrl != null ? View.VISIBLE : View.GONE);
    }

    private Notification buildNotification() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationManager nm = getSystemService(NotificationManager.class);
            NotificationChannel channel = new NotificationChannel(
                    CHANNEL_ID, getString(R.string.floating_banner_notif_channel), NotificationManager.IMPORTANCE_MIN);
            channel.setShowBadge(false);
            nm.createNotificationChannel(channel);
        }

        Intent tapIntent = new Intent(this, MainActivity.class);
        PendingIntent tapPending = PendingIntent.getActivity(
                this, 0, tapIntent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);

        return new NotificationCompat.Builder(this, CHANNEL_ID)
                .setSmallIcon(R.mipmap.ic_launcher)
                .setContentTitle(getString(R.string.floating_banner_notif_title))
                .setContentText(getString(R.string.floating_banner_notif_text))
                .setPriority(NotificationCompat.PRIORITY_MIN)
                .setOngoing(true)
                .setContentIntent(tapPending)
                .build();
    }
}
