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
import android.graphics.PixelFormat;
import android.net.Uri;
import android.os.Build;
import android.os.IBinder;
import android.util.DisplayMetrics;
import android.view.Gravity;
import android.view.LayoutInflater;
import android.view.MotionEvent;
import android.view.View;
import android.view.WindowManager;
import android.widget.ImageButton;
import android.widget.ImageView;
import android.widget.TextView;
import android.widget.VideoView;

import androidx.annotation.Nullable;
import androidx.core.app.NotificationCompat;

// The "make the widget actually play video in place" feature — this is NOT
// a home-screen AppWidget (RemoteViews genuinely cannot host a VideoView; see
// BannerWidget.java's file header). This is a WindowManager overlay window —
// the same mechanism chat-bubble/floating-control apps use — holding a real
// View hierarchy, so a real VideoView plays inline, in the same window, with
// no separate screen opening.
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

    private void playConveneVideo(String url) {
        ImageView art = overlayView.findViewById(R.id.floating_art);
        VideoView videoView = overlayView.findViewById(R.id.floating_video);
        ImageButton play = overlayView.findViewById(R.id.floating_play);

        art.setVisibility(View.GONE);
        play.setVisibility(View.GONE);
        videoView.setVisibility(View.VISIBLE);
        try {
            videoView.setVideoURI(Uri.parse(url));
            videoView.setOnPreparedListener(mp -> {
                mp.setLooping(false);
                videoView.start();
            });
            Runnable revert = () -> {
                videoView.setVisibility(View.GONE);
                art.setVisibility(View.VISIBLE);
                play.setVisibility(View.VISIBLE);
            };
            videoView.setOnCompletionListener(mp -> revert.run());
            videoView.setOnErrorListener((mp, what, extra) -> {
                revert.run();
                return true;
            });
        } catch (Exception e) {
            videoView.setVisibility(View.GONE);
            art.setVisibility(View.VISIBLE);
            play.setVisibility(View.VISIBLE);
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
