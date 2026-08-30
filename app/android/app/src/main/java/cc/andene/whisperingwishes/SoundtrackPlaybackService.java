package cc.andene.whisperingwishes;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Intent;
import android.content.SharedPreferences;
import android.media.AudioAttributes;
import android.media.MediaPlayer;
import android.net.Uri;
import android.os.Build;
import android.os.IBinder;
import android.util.Log;

// Real playback engine behind the Soundtrack home-screen widget (SoundtrackWidget.java) — a
// widget's RemoteViews click can only ever fire a PendingIntent, it can't run a MediaPlayer
// itself or keep one alive once the tap is handled, so actually playing a looping audio track
// needs a genuine Service. Runs as a FOREGROUND service (foregroundServiceType="mediaPlayback")
// with a persistent low-importance notification while a track is loaded — same requirement
// PullBubbleService's own floating bubble has for a different kind of always-on state, and the
// same "tap fires PendingIntent.getService(), which is exempt from the background-start
// restriction, then this calls startForeground() itself" pattern that already works for it.
//
// Tracks are the same 4 bundled "Log Screen" ambient music files the web app's own
// useAmbientMusic.js plays (SoundtrackTracks.ALL) — an .m4a asset isn't directly usable by
// MediaPlayer as a bundled "public/..." path (same platform limitation
// WidgetAssetUtils.cachedAssetVideoUri's own comment documents for VideoView/video assets;
// MediaPlayer has the identical restriction for audio), so WidgetAssetUtils.cachedAssetUri
// copies it out to a real cached file once before each load.
//
// State (current track key, playing/paused) is the source of truth in SharedPreferences (the
// same "CapacitorStorage" file every widget in this app shares) — this class is the only
// writer, SoundtrackWidget.updateWidget() only ever reads it, so the widget always reflects
// reality even if it renders before this service has finished handling an action.
public class SoundtrackPlaybackService extends Service {
    private static final String TAG = "SoundtrackPlayback";
    private static final String PREFS_NAME = "CapacitorStorage";
    private static final String CHANNEL_ID = "soundtrack_playback";
    private static final int NOTIFICATION_ID = 4301;

    public static final String ACTION_PLAY_PAUSE = "cc.andene.whisperingwishes.action.SOUNDTRACK_PLAY_PAUSE";
    public static final String ACTION_NEXT = "cc.andene.whisperingwishes.action.SOUNDTRACK_NEXT";
    public static final String ACTION_PREV = "cc.andene.whisperingwishes.action.SOUNDTRACK_PREV";

    private MediaPlayer mediaPlayer;
    private String currentTrackKey = SoundtrackTracks.DEFAULT_KEY;
    private boolean playing = false;

    @Override
    public IBinder onBind(Intent intent) { return null; }

    @Override
    public void onCreate() {
        super.onCreate();
        SharedPreferences prefs = getSharedPreferences(PREFS_NAME, MODE_PRIVATE);
        currentTrackKey = prefs.getString(SoundtrackTracks.PREF_TRACK_KEY, SoundtrackTracks.DEFAULT_KEY);
        // playing always starts false on a fresh process — a paused/never-started MediaPlayer
        // isn't recreated just because the last session happened to be mid-playback; the user
        // taps Play again rather than audio starting up unannounced in the background.
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        // Every action keeps (or puts) this service in the foreground state — see this
        // class's own file header for why a repeated startForeground() call here is fine
        // (it just refreshes the notification's content, it doesn't restart anything).
        startForeground(NOTIFICATION_ID, buildNotification());

        String action = intent != null ? intent.getAction() : null;
        try {
            if (ACTION_PLAY_PAUSE.equals(action)) {
                togglePlayPause();
            } else if (ACTION_NEXT.equals(action)) {
                changeTrack(1);
            } else if (ACTION_PREV.equals(action)) {
                changeTrack(-1);
            }
        } catch (Throwable t) {
            // A malformed cached file, a MediaPlayer in a bad internal state, etc. — never let
            // a playback hiccup crash the whole service; the widget still shows whatever
            // SharedPreferences last had, which is the worst case here, not a broken widget.
            Log.e(TAG, "Playback action failed: " + action, t);
        }

        return START_NOT_STICKY; // no in-flight playback state survives a process kill anyway
    }

    @Override
    public void onDestroy() {
        releasePlayer();
        super.onDestroy();
    }

    private void togglePlayPause() {
        if (mediaPlayer == null) {
            loadTrack(currentTrackKey, true);
            return;
        }
        if (mediaPlayer.isPlaying()) {
            mediaPlayer.pause();
            playing = false;
        } else {
            mediaPlayer.start();
            playing = true;
        }
        persistAndRefresh();
    }

    private void changeTrack(int delta) {
        int nextIndex = SoundtrackTracks.indexOf(currentTrackKey) + delta;
        int len = SoundtrackTracks.ALL.length;
        nextIndex = ((nextIndex % len) + len) % len; // wrap both directions
        // Switching tracks keeps whatever playing/paused state was already true — a track
        // skip while paused stays paused (browsing, not committing to play it yet); while
        // playing, the new track picks up immediately.
        loadTrack(SoundtrackTracks.ALL[nextIndex].key, playing);
    }

    // autoPlay: whether the new track should start immediately once prepared, vs. just being
    // loaded and ready (used when skipping tracks while paused).
    private void loadTrack(String trackKey, boolean autoPlay) {
        releasePlayer();
        currentTrackKey = trackKey;

        Uri uri = WidgetAssetUtils.cachedAssetUri(this, SoundtrackTracks.byKey(trackKey).assetPath, "widget-audio-");
        if (uri == null) {
            playing = false;
            persistAndRefresh();
            return;
        }

        MediaPlayer player = new MediaPlayer();
        player.setAudioAttributes(new AudioAttributes.Builder()
            .setUsage(AudioAttributes.USAGE_MEDIA)
            .setContentType(AudioAttributes.CONTENT_TYPE_MUSIC)
            .build());
        player.setLooping(true);
        player.setOnErrorListener((mp, what, extra) -> {
            Log.w(TAG, "MediaPlayer error what=" + what + " extra=" + extra);
            releasePlayer();
            playing = false;
            persistAndRefresh();
            return true;
        });
        // prepareAsync(), not the blocking prepare() — this runs on the service's main-thread
        // onStartCommand, and even a local cached file's decode/buffer setup shouldn't block it.
        player.setOnPreparedListener(mp -> {
            if (autoPlay) {
                mp.start();
                playing = true;
            }
            persistAndRefresh();
        });

        try {
            player.setDataSource(this, uri);
            player.prepareAsync();
            mediaPlayer = player;
        } catch (Exception e) {
            Log.w(TAG, "Failed to load track " + trackKey, e);
            player.release();
            playing = false;
            persistAndRefresh();
        }
    }

    private void releasePlayer() {
        if (mediaPlayer == null) return;
        try {
            mediaPlayer.release();
        } catch (Exception ignored) {
            // Already in a bad state — nothing left to clean up.
        }
        mediaPlayer = null;
    }

    // Writes the new state to SharedPreferences (SoundtrackWidget's own source of truth),
    // refreshes every placed widget instance immediately, and updates the foreground
    // notification's text to match — called from both direct action handlers and
    // MediaPlayer's own async prepared/error callbacks, so this is the one place all three
    // paths converge on keeping everything in sync.
    private void persistAndRefresh() {
        getSharedPreferences(PREFS_NAME, MODE_PRIVATE).edit()
            .putString(SoundtrackTracks.PREF_TRACK_KEY, currentTrackKey)
            .putBoolean(SoundtrackTracks.PREF_PLAYING_KEY, playing)
            .apply();
        SoundtrackWidget.requestUpdate(this);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationManager nm = getSystemService(NotificationManager.class);
            if (nm != null) nm.notify(NOTIFICATION_ID, buildNotification());
        }
    }

    private Notification buildNotification() {
        Intent openApp = new Intent(this, MainActivity.class);
        PendingIntent contentIntent = PendingIntent.getActivity(this, 0, openApp,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);

        // Plain framework Notification.Builder, not androidx's NotificationCompat — same
        // reasoning as PullBubbleService's own buildNotification(): avoids pulling in
        // androidx.core:core just for this, and the framework builder covers everything this
        // minimal notification needs on its own.
        Notification.Builder builder;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationManager nm = getSystemService(NotificationManager.class);
            NotificationChannel channel = new NotificationChannel(CHANNEL_ID,
                getString(R.string.soundtrack_notification_channel_name), NotificationManager.IMPORTANCE_MIN);
            nm.createNotificationChannel(channel);
            builder = new Notification.Builder(this, CHANNEL_ID);
        } else {
            builder = new Notification.Builder(this);
            builder.setPriority(Notification.PRIORITY_MIN);
        }

        String trackLabel = getString(SoundtrackTracks.byKey(currentTrackKey).labelResId);
        return builder
            .setSmallIcon(android.R.drawable.ic_media_play)
            .setContentTitle(trackLabel)
            .setContentText(playing ? getString(R.string.soundtrack_notification_text) : getString(R.string.widget_soundtrack_pause_aria))
            .setOngoing(playing)
            .setContentIntent(contentIntent)
            .build();
    }
}
