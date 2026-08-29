package cc.andene.whisperingwishes;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Intent;
import android.content.SharedPreferences;
import android.graphics.Bitmap;
import android.graphics.Color;
import android.graphics.Outline;
import android.graphics.PixelFormat;
import android.graphics.drawable.GradientDrawable;
import android.net.Uri;
import android.os.Build;
import android.os.IBinder;
import android.provider.Settings;
import android.util.Log;
import android.view.Gravity;
import android.view.MotionEvent;
import android.view.View;
import android.view.ViewOutlineProvider;
import android.view.WindowManager;
import android.widget.FrameLayout;
import android.widget.ImageView;
import android.widget.TextView;

import org.json.JSONObject;

import java.util.ArrayList;
import java.util.List;

// Chat-heads-style persistent floating bubble — replaces PulseBannerWidget's old ×1/×10
// pull-sim pills entirely (requested explicitly in place of them). Once toggled on from the
// widget, it stays on screen over every app until dragged onto the ✕ target that appears
// while dragging it, at which point it fully deactivates.
//
// Flow: tap the main bubble → it expands into two small sub-bubbles (×1/×10) → tapping one
// rolls a pull (WidgetPullSimulator, same math/pity engine PulseBannerWidget's own pull
// button used) and plays the matching rarity clip in FloatingVideoOverlayService's floating
// video window (the same mechanism PulseBannerWidget's ▶️ uses) → each pulled item then
// appears as its own small icon bubble clustered near the main bubble — NOT baked into the
// video — individually dismissible by a tap, not drag.
//
// Requires SYSTEM_ALERT_WINDOW (same permission FloatingVideoOverlayService already needs;
// requested the same way if missing) AND runs as a genuine FOREGROUND service with a
// persistent (low-importance) notification — unlike every other Service in this app, this
// one is intentionally always-on until the user removes it, which Android requires a
// foreground service + notification for. Declared with foregroundServiceType="specialUse"
// (a floating chat-heads-style bubble doesn't cleanly fit any of the other standard FGS
// types) in the manifest, alongside the required PROPERTY_SPECIAL_USE_FGS_SUBTYPE.
//
// POSITIONING: same caveat as FloatingVideoOverlayService — no public API exists for a
// widget/service to learn screen layout beyond what it's told, so the bubble starts at a
// fixed edge position (right edge, vertically centered) rather than anywhere tied to where
// the old widget button used to be, and stays wherever the user drags it for that session
// (not persisted across restarts, by design — starting fresh each time is simpler and this
// is meant to be a lightweight, disposable-feeling utility, not a fixture).
public class PullBubbleService extends Service {
    private static final String TAG = "PullBubbleService";
    private static final String PREFS_NAME = "CapacitorStorage";
    private static final String CHANNEL_ID = "pull_bubble";
    private static final int NOTIFICATION_ID = 4201;

    private static final int BUBBLE_SIZE_DP = 56;
    private static final int SUB_BUBBLE_SIZE_DP = 44;
    private static final int RESULT_ICON_SIZE_DP = 36;
    private static final int REMOVE_TARGET_SIZE_DP = 72;
    private static final int CLICK_SLOP_PX = 20; // beyond this, a touch is a drag, not a tap
    private static final int RESULT_ICON_PX = 96; // WidgetAssetUtils decode target

    public static final String ACTION_TOGGLE = "cc.andene.whisperingwishes.action.TOGGLE_PULL_BUBBLE";

    // Package-private, read by PulseBannerWidget's render to label/icon the toggle button
    // correctly — a plain static flag is enough here since there is only ever one bubble
    // instance system-wide (unlike PulseBannerWidget, which supports many placed instances).
    private static volatile boolean running = false;
    static boolean isRunning() { return running; }

    private WindowManager windowManager;
    private View mainBubble;
    private View removeTarget;
    private final List<View> subBubbles = new ArrayList<>();
    private final List<View> resultIcons = new ArrayList<>();
    private WindowManager.LayoutParams mainBubbleParams;
    private boolean expanded = false;

    // Drag-tracking state for the main bubble's own touch listener.
    private float touchDownRawX, touchDownRawY;
    private int touchDownParamsX, touchDownParamsY;

    @Override
    public IBinder onBind(Intent intent) { return null; }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        if (running) {
            // Already on screen — a second ACTION_TOGGLE tap means "turn it off".
            teardown();
            stopSelf();
            return START_NOT_STICKY;
        }

        if (!Settings.canDrawOverlays(this)) {
            Intent settingsIntent = new Intent(Settings.ACTION_MANAGE_OVERLAY_PERMISSION, Uri.parse("package:" + getPackageName()));
            settingsIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            try { startActivity(settingsIntent); } catch (Exception e) { Log.w(TAG, "Couldn't open overlay-permission settings", e); }
            stopSelf();
            return START_NOT_STICKY;
        }

        try {
            startForeground(NOTIFICATION_ID, buildNotification());
            windowManager = (WindowManager) getSystemService(WINDOW_SERVICE);
            showMainBubble();
            running = true;
        } catch (Throwable t) {
            Log.e(TAG, "Failed to start pull bubble", t);
            teardown();
            stopSelf();
        }
        return START_STICKY;
    }

    private android.app.Notification buildNotification() {
        Intent openApp = new Intent(this, MainActivity.class);
        PendingIntent contentIntent = PendingIntent.getActivity(this, 0, openApp,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);

        // Plain framework Notification.Builder rather than androidx's NotificationCompat —
        // avoids depending on androidx.core:core being pulled in transitively (this app's
        // build.gradle only explicitly declares core-splashscreen); the framework builder
        // does everything this minimal, low-priority notification needs on its own.
        android.app.Notification.Builder builder;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationManager nm = getSystemService(NotificationManager.class);
            NotificationChannel channel = new NotificationChannel(CHANNEL_ID,
                    getString(R.string.pull_bubble_notification_channel_name), NotificationManager.IMPORTANCE_MIN);
            nm.createNotificationChannel(channel);
            builder = new android.app.Notification.Builder(this, CHANNEL_ID);
        } else {
            builder = new android.app.Notification.Builder(this);
            builder.setPriority(android.app.Notification.PRIORITY_MIN);
        }
        return builder
                .setSmallIcon(android.R.drawable.ic_menu_gallery)
                .setContentTitle(getString(R.string.pull_bubble_notification_title))
                .setContentText(getString(R.string.pull_bubble_notification_text))
                .setOngoing(true)
                .setContentIntent(contentIntent)
                .build();
    }

    // ── Main bubble ──────────────────────────────────────────────────────────

    private void showMainBubble() {
        float density = getResources().getDisplayMetrics().density;
        int sizePx = (int) (BUBBLE_SIZE_DP * density);

        FrameLayout root = new FrameLayout(this);
        root.setBackground(circleDrawable("#33FFFFFF", "#80FFFFFF"));
        clipToCircle(root);
        Bitmap icon = WidgetAssetUtils.decodeAsset(this, "ui-icons/Currency-Astrite.webp", sizePx);
        if (icon != null) {
            ImageView img = new ImageView(this);
            img.setImageBitmap(icon);
            img.setScaleType(ImageView.ScaleType.CENTER_CROP);
            root.addView(img, new FrameLayout.LayoutParams(FrameLayout.LayoutParams.MATCH_PARENT, FrameLayout.LayoutParams.MATCH_PARENT));
        }
        mainBubble = root;

        int overlayType = Build.VERSION.SDK_INT >= Build.VERSION_CODES.O
                ? WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
                : WindowManager.LayoutParams.TYPE_PHONE;
        mainBubbleParams = new WindowManager.LayoutParams(
                sizePx, sizePx, overlayType,
                WindowManager.LayoutParams.FLAG_NOT_TOUCH_MODAL,
                PixelFormat.TRANSLUCENT);
        mainBubbleParams.gravity = Gravity.TOP | Gravity.START;
        // Starting position: right edge, vertically centered — see file header's
        // POSITIONING note on why this can't be tied to the old widget button's location.
        android.util.DisplayMetrics dm = getResources().getDisplayMetrics();
        mainBubbleParams.x = dm.widthPixels - sizePx - (int) (12 * density);
        mainBubbleParams.y = dm.heightPixels / 2 - sizePx / 2;

        mainBubble.setOnTouchListener(this::onMainBubbleTouch);
        windowManager.addView(mainBubble, mainBubbleParams);
    }

    private boolean onMainBubbleTouch(View v, MotionEvent event) {
        switch (event.getActionMasked()) {
            case MotionEvent.ACTION_DOWN:
                touchDownRawX = event.getRawX();
                touchDownRawY = event.getRawY();
                touchDownParamsX = mainBubbleParams.x;
                touchDownParamsY = mainBubbleParams.y;
                showRemoveTarget();
                return true;
            case MotionEvent.ACTION_MOVE: {
                float dx = event.getRawX() - touchDownRawX;
                float dy = event.getRawY() - touchDownRawY;
                mainBubbleParams.x = touchDownParamsX + (int) dx;
                mainBubbleParams.y = touchDownParamsY + (int) dy;
                windowManager.updateViewLayout(mainBubble, mainBubbleParams);
                repositionSubBubbles();
                repositionResultIcons();
                highlightRemoveTarget(isOverRemoveTarget(event.getRawX(), event.getRawY()));
                return true;
            }
            case MotionEvent.ACTION_UP: {
                boolean overRemove = isOverRemoveTarget(event.getRawX(), event.getRawY());
                hideRemoveTarget();
                float totalDx = event.getRawX() - touchDownRawX;
                float totalDy = event.getRawY() - touchDownRawY;
                boolean wasTap = Math.hypot(totalDx, totalDy) < CLICK_SLOP_PX;
                if (overRemove && !wasTap) {
                    teardown();
                    stopSelf();
                } else if (wasTap) {
                    toggleExpanded();
                }
                return true;
            }
        }
        return false;
    }

    // ── Sub-bubbles (×1 / ×10) ───────────────────────────────────────────────

    private void toggleExpanded() {
        if (expanded) {
            collapseSubBubbles();
        } else {
            showSubBubbles();
        }
        expanded = !expanded;
    }

    private void showSubBubbles() {
        addSubBubble(getString(R.string.widget_pull_x1), 1, 0);
        addSubBubble(getString(R.string.widget_pull_x10), 10, 1);
    }

    private void addSubBubble(String label, int count, int stackIndex) {
        float density = getResources().getDisplayMetrics().density;
        int sizePx = (int) (SUB_BUBBLE_SIZE_DP * density);

        FrameLayout root = new FrameLayout(this);
        root.setBackground(circleDrawable("#40000000", "#99FFFFFF"));
        clipToCircle(root);
        TextView text = new TextView(this);
        text.setText(label);
        text.setTextColor(Color.WHITE);
        text.setTextSize(11);
        text.setGravity(Gravity.CENTER);
        root.addView(text, new FrameLayout.LayoutParams(FrameLayout.LayoutParams.MATCH_PARENT, FrameLayout.LayoutParams.MATCH_PARENT));

        int overlayType = Build.VERSION.SDK_INT >= Build.VERSION_CODES.O
                ? WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
                : WindowManager.LayoutParams.TYPE_PHONE;
        WindowManager.LayoutParams params = new WindowManager.LayoutParams(
                sizePx, sizePx, overlayType,
                WindowManager.LayoutParams.FLAG_NOT_TOUCH_MODAL,
                PixelFormat.TRANSLUCENT);
        params.gravity = Gravity.TOP | Gravity.START;
        positionSubBubble(params, stackIndex, (int) (BUBBLE_SIZE_DP * density), sizePx);

        root.setTag(params);
        root.setOnClickListener(v -> {
            collapseSubBubbles();
            expanded = false;
            rollAndPlay(count);
        });

        windowManager.addView(root, params);
        subBubbles.add(root);
    }

    // Stacked above the main bubble, spaced vertically — simplest layout that never
    // overlaps the main bubble itself and reads clearly as "options above the thing you
    // tapped", matching common chat-heads/quick-action bubble conventions.
    private void positionSubBubble(WindowManager.LayoutParams params, int stackIndex, int mainSizePx, int subSizePx) {
        float density = getResources().getDisplayMetrics().density;
        int gap = (int) (10 * density);
        params.x = mainBubbleParams.x + (mainSizePx - subSizePx) / 2;
        params.y = mainBubbleParams.y - (stackIndex + 1) * (subSizePx + gap);
    }

    private void repositionSubBubbles() {
        for (int i = 0; i < subBubbles.size(); i++) {
            View v = subBubbles.get(i);
            WindowManager.LayoutParams p = (WindowManager.LayoutParams) v.getTag();
            positionSubBubble(p, i, mainBubbleParams.width, v.getLayoutParams() != null ? p.width : (int) (SUB_BUBBLE_SIZE_DP * getResources().getDisplayMetrics().density));
            windowManager.updateViewLayout(v, p);
        }
    }

    private void collapseSubBubbles() {
        for (View v : subBubbles) {
            try { windowManager.removeView(v); } catch (Exception ignored) {}
        }
        subBubbles.clear();
    }

    // ── Remove (✕) target ────────────────────────────────────────────────────

    private void showRemoveTarget() {
        if (removeTarget != null) return;
        float density = getResources().getDisplayMetrics().density;
        int sizePx = (int) (REMOVE_TARGET_SIZE_DP * density);

        FrameLayout root = new FrameLayout(this);
        root.setBackground(circleDrawable("#40FF3B30", "#FFFF3B30"));
        clipToCircle(root);
        TextView x = new TextView(this);
        x.setText("✕");
        x.setTextColor(Color.WHITE);
        x.setTextSize(20);
        x.setGravity(Gravity.CENTER);
        root.setContentDescription(getString(R.string.pull_bubble_remove_aria));
        root.addView(x, new FrameLayout.LayoutParams(FrameLayout.LayoutParams.MATCH_PARENT, FrameLayout.LayoutParams.MATCH_PARENT));

        int overlayType = Build.VERSION.SDK_INT >= Build.VERSION_CODES.O
                ? WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
                : WindowManager.LayoutParams.TYPE_PHONE;
        WindowManager.LayoutParams params = new WindowManager.LayoutParams(
                sizePx, sizePx, overlayType,
                WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE | WindowManager.LayoutParams.FLAG_NOT_TOUCHABLE,
                PixelFormat.TRANSLUCENT);
        params.gravity = Gravity.BOTTOM | Gravity.CENTER_HORIZONTAL;
        params.y = (int) (48 * density);

        removeTarget = root;
        windowManager.addView(removeTarget, params);
    }

    private void hideRemoveTarget() {
        if (removeTarget == null) return;
        try { windowManager.removeView(removeTarget); } catch (Exception ignored) {}
        removeTarget = null;
    }

    private void highlightRemoveTarget(boolean over) {
        if (removeTarget == null) return;
        removeTarget.setBackground(circleDrawable(over ? "#80FF3B30" : "#40FF3B30", "#FFFF3B30"));
        removeTarget.setScaleX(over ? 1.2f : 1f);
        removeTarget.setScaleY(over ? 1.2f : 1f);
    }

    private boolean isOverRemoveTarget(float rawX, float rawY) {
        if (removeTarget == null || !removeTarget.isAttachedToWindow()) return false;
        int[] loc = new int[2];
        removeTarget.getLocationOnScreen(loc);
        return rawX >= loc[0] && rawX <= loc[0] + removeTarget.getWidth()
                && rawY >= loc[1] && rawY <= loc[1] + removeTarget.getHeight();
    }

    // ── Roll + play + result icons ───────────────────────────────────────────

    private void rollAndPlay(int count) {
        WidgetPullSimulator.PullSimResult sim;
        try {
            // Rolls against the first currently-active character banner — this bubble has
            // no per-instance banner choice the way PulseBannerWidget's picker does (there's
            // only ever one bubble system-wide), so it always targets the same default a
            // pre-custom-choice widget would have.
            sim = WidgetPullSimulator.roll(this, "character", null, count);
        } catch (Throwable t) {
            Log.w(TAG, "Pull roll failed", t);
            return;
        }

        Intent playIntent = new Intent(this, FloatingVideoOverlayService.class);
        playIntent.putExtra(FloatingVideoOverlayService.EXTRA_VIDEO_URL,
                "file:///android_asset/public/convene-sim/" + sim.video + ".mp4");
        startService(playIntent);

        showResultIcons(sim.results);
    }

    private void showResultIcons(List<WidgetPullSimulator.PullResult> results) {
        clearResultIcons();
        SharedPreferences prefs = getSharedPreferences(PREFS_NAME, MODE_PRIVATE);
        JSONObject assetMap;
        try {
            assetMap = new JSONObject(prefs.getString("widget_pull_asset_map", "{}"));
        } catch (Exception e) {
            assetMap = new JSONObject();
        }

        for (int i = 0; i < results.size(); i++) {
            addResultIcon(results.get(i), assetMap, i);
        }
    }

    private void addResultIcon(WidgetPullSimulator.PullResult result, JSONObject assetMap, int index) {
        float density = getResources().getDisplayMetrics().density;
        int sizePx = (int) (RESULT_ICON_SIZE_DP * density);

        FrameLayout root = new FrameLayout(this);
        root.setBackground(circleDrawable("#40000000", rarityHex(result.rarity)));
        clipToCircle(root);

        String assetPath = result.name != null ? assetMap.optString(result.name, null) : null;
        Bitmap bitmap = assetPath != null ? WidgetAssetUtils.decodeAsset(this, assetPath, RESULT_ICON_PX) : null;
        if (bitmap != null) {
            ImageView img = new ImageView(this);
            img.setImageBitmap(bitmap);
            img.setScaleType(ImageView.ScaleType.CENTER_CROP);
            root.addView(img, new FrameLayout.LayoutParams(FrameLayout.LayoutParams.MATCH_PARENT, FrameLayout.LayoutParams.MATCH_PARENT));
        }
        root.setContentDescription(getString(R.string.pull_bubble_result_dismiss_aria));

        int overlayType = Build.VERSION.SDK_INT >= Build.VERSION_CODES.O
                ? WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
                : WindowManager.LayoutParams.TYPE_PHONE;
        WindowManager.LayoutParams params = new WindowManager.LayoutParams(
                sizePx, sizePx, overlayType,
                WindowManager.LayoutParams.FLAG_NOT_TOUCH_MODAL,
                PixelFormat.TRANSLUCENT);
        params.gravity = Gravity.TOP | Gravity.START;
        positionResultIcon(params, index, sizePx);

        root.setTag(params);
        // Tap-to-dismiss ONLY — unlike the main bubble, result icons never need drag
        // handling, they just disappear individually when tapped.
        root.setOnClickListener(v -> {
            try { windowManager.removeView(root); } catch (Exception ignored) {}
            resultIcons.remove(root);
        });

        windowManager.addView(root, params);
        resultIcons.add(root);
    }

    // Small fanned cluster below-and-around the main bubble — up to 10 items, wrapped into
    // rows of 4 so a ×10 pull doesn't run off-screen in one long line.
    private void positionResultIcon(WindowManager.LayoutParams params, int index, int sizePx) {
        float density = getResources().getDisplayMetrics().density;
        int gap = (int) (6 * density);
        int perRow = 4;
        int col = index % perRow;
        int row = index / perRow;
        params.x = mainBubbleParams.x - (col * (sizePx + gap));
        params.y = mainBubbleParams.y + mainBubbleParams.height + gap + row * (sizePx + gap);
    }

    private void repositionResultIcons() {
        for (int i = 0; i < resultIcons.size(); i++) {
            View v = resultIcons.get(i);
            WindowManager.LayoutParams p = (WindowManager.LayoutParams) v.getTag();
            positionResultIcon(p, i, p.width);
            windowManager.updateViewLayout(v, p);
        }
    }

    private void clearResultIcons() {
        for (View v : resultIcons) {
            try { windowManager.removeView(v); } catch (Exception ignored) {}
        }
        resultIcons.clear();
    }

    private String rarityHex(int rarity) {
        switch (rarity) {
            case 5: return "#FFEAB308";
            case 4: return "#FFA855F7";
            default: return "#FF38BDF8";
        }
    }

    // ── Shared helpers ───────────────────────────────────────────────────────

    private GradientDrawable circleDrawable(String fillColor, String strokeColor) {
        GradientDrawable d = new GradientDrawable();
        d.setShape(GradientDrawable.OVAL);
        d.setColor(Color.parseColor(fillColor));
        d.setStroke((int) (1.5f * getResources().getDisplayMetrics().density), Color.parseColor(strokeColor));
        return d;
    }

    private void clipToCircle(View view) {
        view.setOutlineProvider(new ViewOutlineProvider() {
            @Override
            public void getOutline(View v, Outline outline) {
                outline.setOval(0, 0, v.getWidth(), v.getHeight());
            }
        });
        view.setClipToOutline(true);
    }

    private void teardown() {
        collapseSubBubbles();
        clearResultIcons();
        hideRemoveTarget();
        if (mainBubble != null && windowManager != null) {
            try { windowManager.removeView(mainBubble); } catch (Exception ignored) {}
        }
        mainBubble = null;
        expanded = false;
        running = false;
        stopForeground(true);
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        teardown();
    }
}
