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
import android.widget.LinearLayout;
import android.widget.ScrollView;
import android.widget.TextView;
import android.widget.Toast;

import org.json.JSONObject;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

// Chat-heads-style persistent floating bubble — replaces PulseBannerWidget's old ×1/×10
// pull-sim pills entirely (requested explicitly in place of them). Once toggled on from the
// widget, it stays on screen over every app until dragged onto the ✕ target that appears
// while dragging it, at which point it fully deactivates.
//
// Flow: tap the main bubble → it arcs open into five sub-bubbles around it (banner picker,
// ×80, ×10, ×1, and a hide/minimize arrow — see SUB_BUBBLE_ANGLES_DEG) → tapping ×1/×10/×80
// rolls a pull (WidgetPullSimulator, same math/pity engine PulseBannerWidget's own pull
// button used, pinned to whichever banner the picker last cycled to) and steps through the
// rarity clip + each item's own reveal beat/convene clip in FloatingVideoOverlayService's
// floating video window (the same mechanism PulseBannerWidget's ▶️ uses) → each pulled item
// then appears as its own small icon bubble clustered near the main bubble — NOT baked into
// the video — individually dismissible by a tap, not drag.
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
    private static final int HIDDEN_TAB_SIZE_DP = 28;
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
    private View hiddenTab;
    private final List<View> subBubbles = new ArrayList<>();
    private final List<View> resultIcons = new ArrayList<>();
    private WindowManager.LayoutParams mainBubbleParams;
    private ImageView mainBubbleIcon; // kept so pin changes can swap the currency icon in place
    private boolean expanded = false;

    // Which sub-arc is currently showing — the banner-picker's own top slot navigates through
    // ROLL -> CATEGORY -> one of the LIST_* arcs (see showSubBubbles' dispatch and each
    // show*Arc() method). Always reset to ROLL when the arc is freshly opened from the main
    // bubble (toggleExpanded), never persisted — this is transient UI state, not a setting.
    private enum ArcMode { ROLL, CATEGORY, LIST_CHARACTER, LIST_WEAPON, LIST_STANDARD }
    private ArcMode arcMode = ArcMode.ROLL;

    // The current pin — null category = default (first active character banner, the same
    // behavior a pre-picker roll always had). "character"/"weapon" + a specific pinName rolls
    // WidgetPullSimulator.roll() against that exact active banner; "standard-character"/
    // "standard-weapon" (pinName always null then) rolls rollStandard() instead — genuinely
    // different math, not just another pinned name (see rollStandard's own comment). Only ONE
    // of these is ever active, by construction (plain fields, not a set) — picking a new one
    // always replaces whatever was pinned before.
    private String pinnedCategory;
    private String pinnedName;

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
        // Radiant Tide (the real character/weapon-banner convene currency) by default, swapped
        // to Lustrous Tide whenever a Standard pick is pinned — see updateMainBubbleIcon(),
        // called right below once mainBubbleIcon exists to set the correct one immediately
        // (a fresh bubble might already have a pin from earlier this session).
        mainBubbleIcon = new ImageView(this);
        mainBubbleIcon.setScaleType(ImageView.ScaleType.CENTER_CROP);
        root.addView(mainBubbleIcon, new FrameLayout.LayoutParams(FrameLayout.LayoutParams.MATCH_PARENT, FrameLayout.LayoutParams.MATCH_PARENT));
        mainBubble = root;

        int overlayType = Build.VERSION.SDK_INT >= Build.VERSION_CODES.O
                ? WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
                : WindowManager.LayoutParams.TYPE_PHONE;
        // Reuse the existing mainBubbleParams object (position and all) if this is a restore
        // from hideBubble() rather than the very first show — only a brand-new instance gets
        // the fixed starting position below; restoring should reappear exactly where it was
        // hidden from, not jump back to the screen edge.
        boolean isRestore = mainBubbleParams != null;
        if (!isRestore) {
            mainBubbleParams = new WindowManager.LayoutParams(
                    sizePx, sizePx, overlayType,
                    // FLAG_NOT_FOCUSABLE is what actually keeps a bubble/sub-bubble/result-icon
                    // window from interfering with whatever's underneath it — WITHOUT it, a
                    // TYPE_APPLICATION_OVERLAY window is focusable by default and can steal input
                    // focus from other apps/the keyboard even outside its own small bounds (this
                    // was likely the "blocks touch on screen" report — a focusable overlay affects
                    // routing well beyond its visible pixels, unlike a purely visual widget). Also
                    // implies FLAG_NOT_TOUCH_MODAL per the platform docs, but both are kept
                    // explicit for clarity. removeTarget already had this; these didn't.
                    WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE | WindowManager.LayoutParams.FLAG_NOT_TOUCH_MODAL,
                    PixelFormat.TRANSLUCENT);
            mainBubbleParams.gravity = Gravity.TOP | Gravity.START;
            // Starting position: right edge, vertically centered — see file header's
            // POSITIONING note on why this can't be tied to the old widget button's location.
            android.util.DisplayMetrics dm = getResources().getDisplayMetrics();
            mainBubbleParams.x = dm.widthPixels - sizePx - (int) (12 * density);
            mainBubbleParams.y = dm.heightPixels / 2 - sizePx / 2;
        }

        mainBubble.setOnTouchListener(this::onMainBubbleTouch);
        windowManager.addView(mainBubble, mainBubbleParams);
        updateMainBubbleIcon();
    }

    // Radiant Tide by default, Lustrous Tide whenever a Standard banner is pinned — the app's
    // own currency icons for exactly this distinction, not a generic placeholder.
    private void updateMainBubbleIcon() {
        if (mainBubbleIcon == null) return;
        boolean standard = pinnedCategory != null && pinnedCategory.startsWith("standard");
        String asset = standard ? "ui-icons/Currency-Lustrous-Tide.webp" : "ui-icons/Currency-Radiant-Tide.webp";
        Bitmap icon = WidgetAssetUtils.decodeAsset(this, asset, mainBubbleParams.width);
        if (icon != null) mainBubbleIcon.setImageBitmap(icon);
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

    // ── Sub-bubbles (banner picker / ×80 / ×10 / ×1 / hide) ──────────────────
    //
    // Arch-placed around the main bubble (not stacked in a straight line) — five bubbles at
    // 45° steps sweeping clockwise from directly above (90°, standard math convention: 0° =
    // right, angle increases counterclockwise) down to directly below (270°/-90°) via the left
    // side (180°): banner-picker (90°, topmost) → ×80 (135°) → ×10 (180°) → ×1 (225°/-135°) →
    // hide (270°/-90°, bottommost). The sweep goes via the LEFT side deliberately: the bubble
    // starts docked at the right screen edge, so arcing left keeps every sub-bubble over
    // actual screen space instead of off past the edge.
    private static final double[] SUB_BUBBLE_ANGLES_DEG = {90, 135, 180, 225, 270};

    private void toggleExpanded() {
        if (expanded) {
            collapseSubBubbles();
        } else {
            arcMode = ArcMode.ROLL; // always reopen at the top level, never mid-navigation
            showSubBubbles();
        }
        expanded = !expanded;
    }

    private void showSubBubbles() {
        switch (arcMode) {
            case ROLL: showRollArc(); break;
            case CATEGORY: showCategoryArc(); break;
            case LIST_CHARACTER: showBannerListArc("character"); break;
            case LIST_WEAPON: showBannerListArc("weapon"); break;
            case LIST_STANDARD: showStandardArc(); break;
        }
    }

    // Top level: banner picker (enters CATEGORY) / ×80 / ×10 / ×1 / hide.
    private void showRollArc() {
        float density = getResources().getDisplayMetrics().density;
        int iconPx = (int) (SUB_BUBBLE_SIZE_DP * density * 0.5f); // icon itself, smaller than the bubble it sits in
        Bitmap resonatorIcon = WidgetAssetUtils.decodeAsset(this, "navicon/Icon_Resonator.png", iconPx);

        addSubBubble(null, resonatorIcon, 0, SUB_BUBBLE_ANGLES_DEG[0], getString(R.string.pull_bubble_banner_picker_aria), this::enterCategoryMode);
        addSubBubble(getString(R.string.widget_pull_x80), null, 0, SUB_BUBBLE_ANGLES_DEG[1], null, () -> startRoll(80));
        addSubBubble(getString(R.string.widget_pull_x10), null, 0, SUB_BUBBLE_ANGLES_DEG[2], null, () -> startRoll(10));
        addSubBubble(getString(R.string.widget_pull_x1), null, 0, SUB_BUBBLE_ANGLES_DEG[3], null, () -> startRoll(1));
        addHideButton();
    }

    private void enterCategoryMode() {
        collapseSubBubbles();
        arcMode = ArcMode.CATEGORY;
        showSubBubbles();
    }

    // Second level: Characters / Weapon / Standard, replacing ×1/×10/×80 in the same 3 middle
    // slots — banner-picker's own top slot becomes a back arrow instead of the resonator icon
    // while navigating any sub-level, hide stays put at the bottom regardless of level.
    private void showCategoryArc() {
        addBackButton(() -> enterMode(ArcMode.ROLL));
        double[] angles = midAngles(3);
        addSubBubble(getString(R.string.pull_bubble_category_character), null, 0, angles[0], null, () -> enterMode(ArcMode.LIST_CHARACTER));
        addSubBubble(getString(R.string.pull_bubble_category_weapon), null, 0, angles[1], null, () -> enterMode(ArcMode.LIST_WEAPON));
        addSubBubble(getString(R.string.pull_bubble_category_standard), null, 0, angles[2], null, () -> enterMode(ArcMode.LIST_STANDARD));
        addHideButton();
    }

    private void enterMode(ArcMode mode) {
        collapseSubBubbles();
        arcMode = mode;
        showSubBubbles();
    }

    // Third level (Characters/Weapon): one row per currently-active banner in that category,
    // each showing its own art — face-framed for characters (WidgetAssetUtils.decodeFramedIcon,
    // matching the in-app Collection grid's crop), plain for weapons (their art is already a
    // banner splash, not a full-body sprite needing that treatment). Labeled by the character's
    // own name for a character banner, or by the character it's FOR for a weapon banner (per
    // widgetSync.js's buildBannerEntry — matches how the real game names its weapon banners).
    //
    // Reads whatever widget_banners_data currently holds, which is only ever as fresh as the
    // last time the app itself was open (syncBannerWidget's own trigger) — there's no way for
    // this floating bubble, running with no app process backing it, to pull fresher banner data
    // on its own. An empty list here means either no active banner in this category right now,
    // or the app simply hasn't been opened since one went live.
    private void showBannerListArc(String category) {
        addBackButton(() -> enterMode(ArcMode.CATEGORY));
        List<WidgetPullSimulator.BannerOption> options = WidgetPullSimulator.listBannerOptions(
                getSharedPreferences(PREFS_NAME, MODE_PRIVATE), category);
        if (options.isEmpty()) {
            Toast.makeText(this, getString(R.string.pull_bubble_banner_picker_default), Toast.LENGTH_SHORT).show();
        } else {
            float density = getResources().getDisplayMetrics().density;
            int iconPx = (int) (SUB_BUBBLE_SIZE_DP * density * 0.85f);
            boolean framed = "character".equals(category);
            double[] angles = midAngles(options.size());
            for (int i = 0; i < options.size(); i++) {
                WidgetPullSimulator.BannerOption opt = options.get(i);
                Bitmap icon = opt.artAsset == null ? null
                        : framed ? WidgetAssetUtils.decodeFramedIcon(this, opt.artAsset, iconPx, opt.framingZoom, opt.framingX, opt.framingY)
                                 : WidgetAssetUtils.decodeAsset(this, opt.artAsset, iconPx);
                addSubBubble(opt.label, icon, 0, angles[i],
                        getString(R.string.pull_bubble_pin_aria, opt.label),
                        () -> pinBanner(category, opt.pinName, opt.label));
            }
        }
        addHideButton();
    }

    // Third level (Standard): exactly two fixed rows — Characters/Weapon are the WHOLE standard
    // pool as one unit each (the real game doesn't let you pick an individual name within
    // Standard the way a limited banner's Character list above does), so picking either pins
    // directly — there's no further fourth level.
    private void showStandardArc() {
        addBackButton(() -> enterMode(ArcMode.CATEGORY));
        double[] angles = midAngles(2);
        float density = getResources().getDisplayMetrics().density;
        int iconPx = (int) (SUB_BUBBLE_SIZE_DP * density * 0.5f);
        Bitmap resonatorIcon = WidgetAssetUtils.decodeAsset(this, "navicon/Icon_Resonator.png", iconPx);
        Bitmap weaponIcon = WidgetAssetUtils.decodeAsset(this, "navicon/Icon_Weapons.webp", iconPx);
        String charLabel = getString(R.string.pull_bubble_category_character);
        String weapLabel = getString(R.string.pull_bubble_category_weapon);
        addSubBubble(null, resonatorIcon, 0, angles[0], charLabel, () -> pinBanner("standard-character", null, charLabel));
        addSubBubble(null, weaponIcon, 0, angles[1], weapLabel, () -> pinBanner("standard-weapon", null, weapLabel));
        addHideButton();
    }

    // Evenly spaces `count` items strictly between the top (90°, reserved for the back/picker
    // button) and bottom (270°, reserved for hide) — e.g. count=3 gives 135/180/225, exactly
    // the old fixed ×80/×10/×1 slots; count=2 gives 120/240; any count fits the same arc.
    private double[] midAngles(int count) {
        double[] angles = new double[count];
        for (int i = 0; i < count; i++) angles[i] = 90 + (i + 1) * (180.0 / (count + 1));
        return angles;
    }

    private void addBackButton(Runnable action) {
        addSubBubble(null, null, R.drawable.ic_arrow_back, SUB_BUBBLE_ANGLES_DEG[0], getString(R.string.pull_bubble_back_aria), action);
    }

    // Points OUTWARD toward whichever horizontal screen edge the bubble is actually nearest —
    // reuses ic_arrow_back's chevron (which points left by default) rotated 180° when the
    // bubble sits on the right half of the screen, instead of ic_arrow_hide's old fixed
    // chevron-down that ignored where the bubble actually was.
    private void addHideButton() {
        float rotation = isNearRightEdge() ? 180f : 0f;
        addSubBubble(null, null, R.drawable.ic_arrow_back, rotation, SUB_BUBBLE_ANGLES_DEG[4], getString(R.string.pull_bubble_hide_aria), this::hideBubble);
    }

    // Nearest horizontal screen edge to the main bubble's current position — drives both the
    // hide button's outward rotation and the restore tab's inward (opposite) one.
    private boolean isNearRightEdge() {
        android.util.DisplayMetrics dm = getResources().getDisplayMetrics();
        int centerX = mainBubbleParams.x + mainBubbleParams.width / 2;
        return centerX >= dm.widthPixels / 2;
    }

    // Commits a pin (specific banner, or a whole Standard pool) and returns to the normal roll
    // arc so the user can immediately tap ×1/×10/×80 against it — only one pin is ever active,
    // by construction (plain fields get overwritten, never added to a set).
    private void pinBanner(String category, String name, String label) {
        pinnedCategory = category;
        pinnedName = name;
        updateMainBubbleIcon();
        Toast.makeText(this, getString(R.string.pull_bubble_pinned_toast, label), Toast.LENGTH_SHORT).show();
        enterMode(ArcMode.ROLL);
    }

    // Collapses the arc and rolls — shared by the ×1/×10/×80 sub-bubbles, split out of their
    // onClickListener since there are now three of them.
    private void startRoll(int count) {
        if (rolling) return; // a reveal sequence is already stepping through its videos
        collapseSubBubbles();
        expanded = false;
        rollAndPlay(count);
    }

    // Exactly one of label / icon (a decoded asset Bitmap) / iconRes (a drawable resource id,
    // 0 = none) should be given; checked in that priority order. Passing null for `aria` is
    // fine too — content descriptions are optional.
    private void addSubBubble(String label, Bitmap icon, int iconRes, double angleDeg, String aria, Runnable onTap) {
        addSubBubble(label, icon, iconRes, 0f, angleDeg, aria, onTap);
    }

    // iconRotationDeg only applies to the iconRes (vector drawable) branch — used to point a
    // shared chevron drawable toward whichever screen edge is actually relevant (hide button /
    // restore tab, see addHideButton/showHiddenTab) instead of needing a separate drawable per
    // direction.
    private void addSubBubble(String label, Bitmap icon, int iconRes, float iconRotationDeg, double angleDeg, String aria, Runnable onTap) {
        float density = getResources().getDisplayMetrics().density;
        int sizePx = (int) (SUB_BUBBLE_SIZE_DP * density);

        FrameLayout root = new FrameLayout(this);
        root.setBackground(circleDrawable("#40000000", "#99FFFFFF"));
        clipToCircle(root);
        if (icon != null) {
            ImageView img = new ImageView(this);
            img.setImageBitmap(icon);
            img.setScaleType(ImageView.ScaleType.CENTER_INSIDE);
            root.addView(img, new FrameLayout.LayoutParams(FrameLayout.LayoutParams.MATCH_PARENT, FrameLayout.LayoutParams.MATCH_PARENT));
        } else if (iconRes != 0) {
            ImageView img = new ImageView(this);
            img.setImageResource(iconRes);
            int pad = (int) (10 * density);
            img.setPadding(pad, pad, pad, pad);
            img.setScaleType(ImageView.ScaleType.FIT_CENTER);
            img.setRotation(iconRotationDeg);
            root.addView(img, new FrameLayout.LayoutParams(FrameLayout.LayoutParams.MATCH_PARENT, FrameLayout.LayoutParams.MATCH_PARENT));
        } else {
            TextView text = new TextView(this);
            text.setText(label);
            text.setTextColor(Color.WHITE);
            text.setTextSize(11);
            text.setGravity(Gravity.CENTER);
            root.addView(text, new FrameLayout.LayoutParams(FrameLayout.LayoutParams.MATCH_PARENT, FrameLayout.LayoutParams.MATCH_PARENT));
        }
        if (aria != null) root.setContentDescription(aria);

        int overlayType = Build.VERSION.SDK_INT >= Build.VERSION_CODES.O
                ? WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
                : WindowManager.LayoutParams.TYPE_PHONE;
        WindowManager.LayoutParams params = new WindowManager.LayoutParams(
                sizePx, sizePx, overlayType,
                // FLAG_NOT_FOCUSABLE is what actually keeps a bubble/sub-bubble/result-icon
                // window from interfering with whatever's underneath it — WITHOUT it, a
                // TYPE_APPLICATION_OVERLAY window is focusable by default and can steal input
                // focus from other apps/the keyboard even outside its own small bounds (this
                // was likely the "blocks touch on screen" report — a focusable overlay affects
                // routing well beyond its visible pixels, unlike a purely visual widget). Also
                // implies FLAG_NOT_TOUCH_MODAL per the platform docs, but both are kept
                // explicit for clarity. removeTarget already had this; these didn't.
                WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE | WindowManager.LayoutParams.FLAG_NOT_TOUCH_MODAL,
                PixelFormat.TRANSLUCENT);
        params.gravity = Gravity.TOP | Gravity.START;
        positionSubBubbleArc(params, angleDeg, mainBubbleParams.width, sizePx);

        root.setTag(new SubBubbleTag(params, angleDeg));
        root.setOnClickListener(v -> onTap.run());

        windowManager.addView(root, params);
        subBubbles.add(root);
    }

    // Bundles a sub-bubble's own LayoutParams with the angle it's arc-positioned at, so
    // repositionSubBubbles() (fired on every drag frame) can recompute around the main
    // bubble's new location without needing a second parallel list.
    private static final class SubBubbleTag {
        final WindowManager.LayoutParams params;
        final double angleDeg;
        SubBubbleTag(WindowManager.LayoutParams params, double angleDeg) { this.params = params; this.angleDeg = angleDeg; }
    }

    // Places a sub-bubble on the arc around the main bubble at angleDeg (standard math
    // convention: 0° = right, 90° = up, increasing counterclockwise) — radius is just far
    // enough that the two bubbles' edges sit a small gap apart, same spacing the old straight
    // stack used.
    private void positionSubBubbleArc(WindowManager.LayoutParams params, double angleDeg, int mainSizePx, int subSizePx) {
        float density = getResources().getDisplayMetrics().density;
        int gap = (int) (10 * density);
        int radius = mainSizePx / 2 + gap + subSizePx / 2;
        double rad = Math.toRadians(angleDeg);
        int dx = (int) Math.round(radius * Math.cos(rad));
        int dy = (int) Math.round(-radius * Math.sin(rad)); // screen Y grows downward — "up" is negative dy
        params.x = mainBubbleParams.x + mainSizePx / 2 - subSizePx / 2 + dx;
        params.y = mainBubbleParams.y + mainSizePx / 2 - subSizePx / 2 + dy;
    }

    private void repositionSubBubbles() {
        for (View v : subBubbles) {
            SubBubbleTag tag = (SubBubbleTag) v.getTag();
            positionSubBubbleArc(tag.params, tag.angleDeg, mainBubbleParams.width, tag.params.width);
            windowManager.updateViewLayout(v, tag.params);
        }
    }

    private void collapseSubBubbles() {
        for (View v : subBubbles) {
            try { windowManager.removeView(v); } catch (Exception ignored) {}
        }
        subBubbles.clear();
    }

    // ── Hide / restore ───────────────────────────────────────────────────────
    //
    // The ➡️ sub-bubble MINIMIZES the bubble rather than removing it (that's still only via
    // drag-to-✕) — the main bubble (and any open arc/result icons) disappears, replaced by a
    // small edge tab at the same position; tapping the tab brings the full bubble straight
    // back. The service keeps running throughout (foreground notification included) — this is
    // a visibility toggle, not a lifecycle one.

    private void hideBubble() {
        if (hiddenTab != null) return; // already hidden
        collapseSubBubbles();
        expanded = false;
        clearResultIcons();
        if (mainBubble != null && windowManager != null) {
            try { windowManager.removeView(mainBubble); } catch (Exception ignored) {}
        }
        mainBubble = null; // mainBubbleParams is DELIBERATELY kept — showMainBubble() reuses its
                           // position on restore instead of resetting to the screen edge.
        showHiddenTab();
    }

    private void showHiddenTab() {
        float density = getResources().getDisplayMetrics().density;
        int sizePx = (int) (HIDDEN_TAB_SIZE_DP * density);

        FrameLayout root = new FrameLayout(this);
        root.setBackground(circleDrawable("#40FFFFFF", "#80FFFFFF"));
        clipToCircle(root);
        // Same shared chevron drawable as the hide sub-bubble, matching its visual style
        // (bg circle etc.) instead of a fixed-direction emoji glyph — rotated to point INWARD,
        // back toward center, the opposite of the hide button's own outward rotation.
        ImageView arrow = new ImageView(this);
        arrow.setImageResource(R.drawable.ic_arrow_back);
        int arrowPad = (int) (6 * density);
        arrow.setPadding(arrowPad, arrowPad, arrowPad, arrowPad);
        arrow.setScaleType(ImageView.ScaleType.FIT_CENTER);
        arrow.setRotation(isNearRightEdge() ? 0f : 180f);
        root.addView(arrow, new FrameLayout.LayoutParams(FrameLayout.LayoutParams.MATCH_PARENT, FrameLayout.LayoutParams.MATCH_PARENT));
        root.setContentDescription(getString(R.string.pull_bubble_restore_aria));

        int overlayType = Build.VERSION.SDK_INT >= Build.VERSION_CODES.O
                ? WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
                : WindowManager.LayoutParams.TYPE_PHONE;
        WindowManager.LayoutParams params = new WindowManager.LayoutParams(
                sizePx, sizePx, overlayType,
                WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE | WindowManager.LayoutParams.FLAG_NOT_TOUCH_MODAL,
                PixelFormat.TRANSLUCENT);
        params.gravity = Gravity.TOP | Gravity.START;
        // Same top-left corner the main bubble was hidden from — mainBubbleParams still holds
        // that position (see hideBubble()'s own comment).
        params.x = mainBubbleParams.x;
        params.y = mainBubbleParams.y;
        root.setOnClickListener(v -> restoreBubble());

        hiddenTab = root;
        windowManager.addView(hiddenTab, params);
    }

    private void restoreBubble() {
        hideHiddenTab();
        showMainBubble(); // reuses mainBubbleParams' existing position — see its own comment
    }

    private void hideHiddenTab() {
        if (hiddenTab == null) return;
        try { windowManager.removeView(hiddenTab); } catch (Exception ignored) {}
        hiddenTab = null;
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
    //
    // Sequenced like ConvenePullSimModal.jsx's web reveal, not "roll everything and dump it
    // all on screen at once": rarity clip first, then each item gets its OWN turn — a 5★ gets
    // the 5star-reveal beat, a 4★/5★ character with its own convene clip (via ConveneRoster's
    // lookup) plays that clip — and only once an item's own video(s) finish
    // does that item's icon actually appear (with a colored glow burst), before moving on to
    // the next one. An item with no video of its own still waits its turn in the same
    // sequence, just with a short stagger instead of a video, so the whole reveal reads as one
    // continuous wave rather than a video for some items and an instant dump for the rest.

    private final android.os.Handler handler = new android.os.Handler(android.os.Looper.getMainLooper());
    private boolean rolling;
    private static final long WAVE_STAGGER_MS = 220; // pacing for an item with no video of its own

    private void rollAndPlay(int count) {
        // A fresh roll means the just-settled tiles are no longer "just settled" — drop any
        // pending auto-archive timer from the PREVIOUS roll so rapid re-rolls don't stack
        // multiple timers that all fire later.
        handler.removeCallbacks(autoArchiveRunnable);
        WidgetPullSimulator.PullSimResult sim;
        try {
            if (pinnedCategory != null && pinnedCategory.startsWith("standard")) {
                String subCategory = "standard-weapon".equals(pinnedCategory) ? "weapon" : "character";
                sim = WidgetPullSimulator.rollStandard(this, subCategory, count);
            } else {
                // "weapon" pin rolls that category's pinned banner; anything else (null =
                // default, or "character") rolls the character category — pinnedName is null
                // for the default case, matching the pre-picker behavior exactly.
                String category = "weapon".equals(pinnedCategory) ? "weapon" : "character";
                sim = WidgetPullSimulator.roll(this, category, pinnedName, count);
            }
        } catch (Throwable t) {
            Log.w(TAG, "Pull roll failed", t);
            return;
        }

        // NOT cleared here any more — result tiles/pocket now persist and slide across
        // multiple rolls in the same session (see addResultIcon's own header comment), rather
        // than being wiped at the start of every new roll.
        JSONObject assetMap = loadPullAssetMap();

        rolling = true;
        // Keeps the video card from ever overlapping the bubble while it plays — simpler and
        // more reliable than trying to position the card to dodge a bubble that itself might
        // still be mid-drag; the bubble reappears the instant the whole reveal sequence ends
        // (see playItemStep's terminal branch).
        if (mainBubble != null) mainBubble.setVisibility(View.INVISIBLE);
        List<String> rarityVideo = new ArrayList<>();
        // NOT a plain "file:///android_asset/..." string — VideoView/MediaPlayer can't
        // actually play that URI scheme at all (see WidgetAssetUtils.cachedAssetVideoUri's
        // own comment); this copies the bundled clip into the cache dir once and hands back
        // a real file:// Uri VideoView can actually open.
        Uri rarityUri = WidgetAssetUtils.cachedAssetVideoUri(this, "convene-sim/" + sim.video + ".mp4");
        if (rarityUri != null) rarityVideo.add(rarityUri.toString());
        else Log.w(TAG, "Could not resolve pull rarity video: " + sim.video);

        JSONObject finalAssetMap = assetMap;
        playVideosThen(rarityVideo, () -> playItemStep(sim.results, 0, finalAssetMap));
    }

    // Top of the arc (angle 90°, directly above the main bubble) minus a small gap — see
    // playVideosThen's own comment on why the video card anchors here instead of at the main
    // bubble's own height.
    private int videoAnchorY() {
        float density = getResources().getDisplayMetrics().density;
        int subSizePx = (int) (SUB_BUBBLE_SIZE_DP * density);
        int gap = (int) (10 * density);
        int radius = mainBubbleParams.width / 2 + gap + subSizePx / 2;
        int arcTopY = mainBubbleParams.y + mainBubbleParams.width / 2 - subSizePx / 2 - radius;
        return arcTopY - gap;
    }

    // Plays `urls` (via FloatingVideoOverlayService, chained/anchored the same way as before)
    // and calls `onDone` once they've ALL finished — or immediately, synchronously, if there's
    // nothing to play, so callers don't need two separate branches for "has a video" vs. not.
    private void playVideosThen(List<String> urls, Runnable onDone) {
        if (urls.isEmpty()) { onDone.run(); return; }
        FloatingVideoOverlayService.setCallback(() -> handler.post(onDone));
        Intent playIntent = new Intent(this, FloatingVideoOverlayService.class);
        playIntent.putStringArrayListExtra(FloatingVideoOverlayService.EXTRA_VIDEO_URLS, new ArrayList<>(urls));
        // Anchored to the main bubble's own current position — unlike a home-screen widget's
        // ▶️ button, this service DOES know exactly where its own trigger is on screen, so the
        // video plays visibly connected to the bubble you just tapped ("on the side" of it)
        // instead of a fixed, unrelated screen corner. Y is shifted up past the arc's own
        // topmost point (90°, the banner-picker sub-bubble's position) rather than sitting at
        // the main bubble's own height — the sub-bubbles are already collapsed by the time
        // this plays, but visually anchoring here keeps the card clear of where they WERE
        // (and where they'll be again next time the bubble is tapped) instead of overlapping
        // that space.
        if (mainBubbleParams != null) {
            playIntent.putExtra(FloatingVideoOverlayService.EXTRA_ANCHOR_X, mainBubbleParams.x);
            playIntent.putExtra(FloatingVideoOverlayService.EXTRA_ANCHOR_Y, videoAnchorY());
        }
        startService(playIntent);
    }

    private JSONObject loadPullAssetMap() {
        SharedPreferences prefs = getSharedPreferences(PREFS_NAME, MODE_PRIVATE);
        try {
            return new JSONObject(prefs.getString("widget_pull_asset_map", "{}"));
        } catch (Exception e) {
            return new JSONObject();
        }
    }

    // Steps through sim.results one at a time — mirrors ConvenePullSimModal.jsx's goToItem.
    private void playItemStep(List<WidgetPullSimulator.PullResult> results, int index, JSONObject assetMap) {
        if (index >= results.size()) {
            rolling = false;
            if (mainBubble != null) mainBubble.setVisibility(View.VISIBLE); // see rollAndPlay's own comment
            // Auto-archive whatever's still sitting out as individual tiles 5s after the whole
            // reveal sequence settles, unless a new roll starts first (cancelled at the top of
            // rollAndPlay).
            handler.postDelayed(autoArchiveRunnable, 5000);
            return;
        }
        WidgetPullSimulator.PullResult result = results.get(index);

        List<String> videos = new ArrayList<>();
        if (result.rarity == 5) {
            Uri revealUri = WidgetAssetUtils.cachedAssetVideoUri(this, "convene-sim/5star-reveal.mp4");
            if (revealUri != null) videos.add(revealUri.toString());
        }
        if (result.rarity >= 4 && "character".equals(result.type) && result.name != null) {
            // A character's own convene clip, not the generic per-rarity convene-sim reveal.
            ConveneRoster.Entry entry = ConveneRoster.findEntry(
                    getSharedPreferences(PREFS_NAME, MODE_PRIVATE), result.name);
            if (entry != null && entry.conveneUrl != null) videos.add(entry.conveneUrl);
        }

        Runnable reveal = () -> {
            addResultIcon(result, assetMap, index);
            playItemStep(results, index + 1, assetMap);
        };
        if (videos.isEmpty()) {
            // No video for this item — still waits its turn in the sequence, just paced by a
            // short stagger instead, so the whole reveal reads as one continuous wave rather
            // than "some items pop in after a video, the rest dump in instantly".
            handler.postDelayed(reveal, WAVE_STAGGER_MS);
        } else {
            playVideosThen(videos, reveal);
        }
    }

    // Result tiles are capped at MAX_TOTAL_TILE_WINDOWS real floating windows — each one is its
    // own always-composited overlay, so letting a long session (many ×80 pulls) grow this
    // unbounded is a genuine, ever-growing CPU/compositor cost, not just visual clutter. Once
    // the cap is hit, the oldest individual tile is archived into a "pocket" tile (the app's
    // own bag icon, badge-counted) instead of getting its own window — every NEW pull still
    // slides in as its own tile, it just pushes the oldest existing one into the pocket to stay
    // within budget. allPulledResults is the permanent record (never capped) backing the
    // pocket's own "view all" panel.
    private static final int MAX_TOTAL_TILE_WINDOWS = 9;
    // Extra outer padding (a PerfectSuite (Secondary) value) added around the pocket's own
    // circular icon so its corner badge has room to render fully outside the circle's clip
    // instead of being cut off by it — see createPocket()'s own header comment.
    private static final int POCKET_BADGE_OVERFLOW_DP = 12;
    private final List<WidgetPullSimulator.PullResult> allPulledResults = new ArrayList<>();
    private View pocketIcon;
    private TextView pocketBadge;
    private View pocketPanel;
    // Persistent (non-one-shot) halo paired to each still-visible 4★/5★ result tile — kept
    // separate from addGlowBurst's one-shot arrival flash, which stays unchanged. A 5★'s halo
    // also gets an entry in tileGlowAnimators so its infinite pulse can be cancelled on cleanup.
    private final Map<View, View> tileGlows = new HashMap<>();
    private final Map<View, android.animation.ObjectAnimator> tileGlowAnimators = new HashMap<>();
    private final Runnable autoArchiveRunnable = this::autoArchiveAllTiles;

    private void addResultIcon(WidgetPullSimulator.PullResult result, JSONObject assetMap, int revealIndexUnused) {
        allPulledResults.add(result);
        float density = getResources().getDisplayMetrics().density;
        int sizePx = (int) (RESULT_ICON_SIZE_DP * density);
        boolean glow = result.rarity >= 4;

        // Spawns at the main bubble's own position (its "origin") rather than its eventual grid
        // slot — renumberResultSlots() below immediately slides it (and everything else) into
        // place, so this reads as the new item popping out of the bubble and sliding into its
        // spot, not appearing directly in the grid.
        View newTile = addTileView(result, assetMap, sizePx);

        int individualCap = (pocketIcon != null) ? MAX_TOTAL_TILE_WINDOWS - 1 : MAX_TOTAL_TILE_WINDOWS;
        while (resultIcons.size() > individualCap) {
            evictTileToPocket(resultIcons.get(0), sizePx);
            individualCap = MAX_TOTAL_TILE_WINDOWS - 1;
        }
        if (pocketIcon != null) updatePocketBadge();
        renumberResultSlots(sizePx);

        // Entrance pop + glow burst AFTER renumbering, so both use the tile's real final slot
        // (not the spawn-point placeholder position it briefly held above).
        WindowManager.LayoutParams finalParams = (WindowManager.LayoutParams) newTile.getTag();
        if (glow) {
            addGlowBurst(finalParams, sizePx, rarityHex(result.rarity));
            addPersistentHalo(newTile, finalParams, sizePx, result.rarity);
        }
        newTile.setScaleX(0.4f);
        newTile.setScaleY(0.4f);
        newTile.animate().scaleX(1f).scaleY(1f).setDuration(220)
                .setInterpolator(new android.view.animation.OvershootInterpolator(2.5f)).start();
    }

    // Builds one result tile (rarity ring + dark mask + portrait), adds it to the window at a
    // placeholder position (the main bubble's own spot — see addResultIcon's own comment), and
    // registers its tap-to-dismiss handler. Positioning/animation-in is the caller's job.
    private View addTileView(WidgetPullSimulator.PullResult result, JSONObject assetMap, int sizePx) {
        FrameLayout root = new FrameLayout(this);
        root.setBackground(circleDrawable("#40000000", rarityHex(result.rarity)));
        clipToCircle(root);

        String assetPath = result.name != null ? assetMap.optString(result.name, null) : null;
        Bitmap bitmap = assetPath != null ? WidgetAssetUtils.decodeAsset(this, assetPath, RESULT_ICON_PX) : null;
        if (bitmap != null) {
            // 50% dark mask BEHIND the portrait — added first (so it's the bottom layer),
            // sitting between root's own rarity-colored circleDrawable background and the
            // portrait on top of it. On any icon whose art has real transparency (rather than
            // a fully opaque square crop) this dims what shows through around the character
            // instead of the character itself, which is what darkening the BACKDROP behind an
            // icon (vs. darkening the icon's own art) is supposed to look like.
            FrameLayout mask = new FrameLayout(this);
            mask.setBackgroundColor(Color.parseColor("#80000000"));
            root.addView(mask, new FrameLayout.LayoutParams(FrameLayout.LayoutParams.MATCH_PARENT, FrameLayout.LayoutParams.MATCH_PARENT));

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
                WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE | WindowManager.LayoutParams.FLAG_NOT_TOUCH_MODAL,
                PixelFormat.TRANSLUCENT);
        params.gravity = Gravity.TOP | Gravity.START;
        params.x = mainBubbleParams.x;
        params.y = mainBubbleParams.y;

        root.setTag(params);
        // Tap-to-dismiss ONLY — unlike the main bubble, result icons never need drag
        // handling, they just disappear individually when tapped. Purely visual (removes this
        // one window); the pull itself stays in allPulledResults/the pocket's own tally.
        root.setOnClickListener(v -> {
            removeTileGlow(root);
            try { windowManager.removeView(root); } catch (Exception ignored) {}
            resultIcons.remove(root);
        });

        windowManager.addView(root, params);
        resultIcons.add(root);
        return root;
    }

    // The bag icon (app's own navicon/Icon_Bag.png) standing in for every archived-out tile,
    // badge-counted — tapping it opens the "view all pulls" panel.
    //
    // `root` here is a deliberately UNCLIPPED outer FrameLayout, sized sizePx + a small overflow
    // margin — ONLY the inner `circle` FrameLayout (holding the bag icon) gets clipToCircle;
    // `pocketBadge` is a sibling of `circle`, added directly to the unclipped `root`, so it
    // renders fully in that overflow margin instead of being cut off by the circular mask the
    // way it was when the badge and the icon shared the same clipped root.
    private void createPocket(int sizePx) {
        float density = getResources().getDisplayMetrics().density;
        int overflowPx = (int) (POCKET_BADGE_OVERFLOW_DP * density);
        int outerSizePx = sizePx + overflowPx;

        FrameLayout root = new FrameLayout(this);

        FrameLayout circle = new FrameLayout(this);
        circle.setBackground(circleDrawable("#40000000", "#99FFFFFF"));
        clipToCircle(circle);
        FrameLayout.LayoutParams circleLp = new FrameLayout.LayoutParams(sizePx, sizePx);
        circleLp.gravity = Gravity.BOTTOM | Gravity.START;
        root.addView(circle, circleLp);

        Bitmap bagIcon = WidgetAssetUtils.decodeAsset(this, "navicon/Icon_Bag.png", (int) (sizePx * 0.6f));
        if (bagIcon != null) {
            ImageView img = new ImageView(this);
            img.setImageBitmap(bagIcon);
            img.setScaleType(ImageView.ScaleType.CENTER_INSIDE);
            circle.addView(img, new FrameLayout.LayoutParams(FrameLayout.LayoutParams.MATCH_PARENT, FrameLayout.LayoutParams.MATCH_PARENT));
        }

        int badgeSizePx = (int) (16 * density);
        pocketBadge = new TextView(this);
        pocketBadge.setTextColor(Color.WHITE);
        pocketBadge.setTextSize(9);
        pocketBadge.setGravity(Gravity.CENTER);
        pocketBadge.setBackground(circleDrawable("#FFEF4444", "#FFFFFFFF"));
        FrameLayout.LayoutParams badgeParams = new FrameLayout.LayoutParams(badgeSizePx, badgeSizePx);
        badgeParams.gravity = Gravity.TOP | Gravity.END;
        root.addView(pocketBadge, badgeParams);
        root.setContentDescription(getString(R.string.pull_bubble_pocket_aria));

        int overlayType = Build.VERSION.SDK_INT >= Build.VERSION_CODES.O
                ? WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
                : WindowManager.LayoutParams.TYPE_PHONE;
        WindowManager.LayoutParams params = new WindowManager.LayoutParams(
                outerSizePx, outerSizePx, overlayType,
                WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE | WindowManager.LayoutParams.FLAG_NOT_TOUCH_MODAL,
                PixelFormat.TRANSLUCENT);
        params.gravity = Gravity.TOP | Gravity.START;
        positionResultIcon(params, 0, outerSizePx);
        root.setTag(params);
        root.setOnClickListener(v -> togglePocketPanel());

        windowManager.addView(root, params);
        pocketIcon = root;
        updatePocketBadge();
    }

    // Total pulls this session (matches pull_bubble_pocket_title's own count), NOT just the
    // tiles that have been evicted out of the individual-tile grid — those are two different
    // numbers, and the badge should read the same as the "view all" panel's own title.
    private void updatePocketBadge() {
        if (pocketBadge != null) pocketBadge.setText(String.valueOf(allPulledResults.size()));
    }

    // Slides the pocket (if any, always slot 0) and every remaining individual tile into their
    // correct sequential slots — called after every add/evict so the grid never has gaps.
    // Tiles that are already at their target position just no-op (animateTileToSlot skips the
    // animation when old/new positions match).
    private void renumberResultSlots(int sizePx) {
        if (pocketIcon != null) {
            WindowManager.LayoutParams pp = (WindowManager.LayoutParams) pocketIcon.getTag();
            animateTileToSlot(pocketIcon, pp, 0, pp.width);
        }
        int offset = (pocketIcon != null) ? 1 : 0;
        for (int i = 0; i < resultIcons.size(); i++) {
            View v = resultIcons.get(i);
            WindowManager.LayoutParams p = (WindowManager.LayoutParams) v.getTag();
            animateTileToSlot(v, p, i + offset, sizePx);
        }
    }

    // Repositions one tile's window params to `slot`, then plays a short slide from wherever it
    // WAS to there — the translateX/Y-then-animate-to-zero trick (window params jump instantly,
    // the View's own transform hides that jump and animates it away) since WindowManager itself
    // has no animated-move API.
    private void animateTileToSlot(View v, WindowManager.LayoutParams p, int slot, int sizePx) {
        int oldX = p.x, oldY = p.y;
        positionResultIcon(p, slot, sizePx);
        if (oldX == p.x && oldY == p.y) {
            windowManager.updateViewLayout(v, p);
            repositionTileGlow(v, p, sizePx);
            return;
        }
        int dx = oldX - p.x, dy = oldY - p.y;
        windowManager.updateViewLayout(v, p);
        repositionTileGlow(v, p, sizePx);
        v.setTranslationX(dx);
        v.setTranslationY(dy);
        v.animate().translationX(0).translationY(0).setDuration(220).start();
    }

    // A separate, larger translucent circle in the item's own rarity color, added just behind
    // it and animated from a small bright flash out to a bigger fully-faded ring — the "glow
    // of colors around" burst — then removed once it's done (it's a one-shot effect, not a
    // persistent view like the icon itself).
    private void addGlowBurst(WindowManager.LayoutParams iconParams, int iconSizePx, String colorHex) {
        int glowSizePx = (int) (iconSizePx * 2.2f);
        FrameLayout glow = new FrameLayout(this);
        GradientDrawable ring = new GradientDrawable();
        ring.setShape(GradientDrawable.OVAL);
        ring.setColor(Color.parseColor(colorHex.replace("#FF", "#80")));
        glow.setBackground(ring);
        clipToCircle(glow);

        int overlayType = Build.VERSION.SDK_INT >= Build.VERSION_CODES.O
                ? WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
                : WindowManager.LayoutParams.TYPE_PHONE;
        WindowManager.LayoutParams params = new WindowManager.LayoutParams(
                glowSizePx, glowSizePx, overlayType,
                WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE | WindowManager.LayoutParams.FLAG_NOT_TOUCHABLE,
                PixelFormat.TRANSLUCENT);
        params.gravity = Gravity.TOP | Gravity.START;
        params.x = iconParams.x - (glowSizePx - iconSizePx) / 2;
        params.y = iconParams.y - (glowSizePx - iconSizePx) / 2;

        try {
            windowManager.addView(glow, params);
        } catch (Exception e) {
            return;
        }
        glow.setScaleX(0.3f);
        glow.setScaleY(0.3f);
        glow.setAlpha(0.9f);
        glow.animate().scaleX(1f).scaleY(1f).alpha(0f).setDuration(450)
                .withEndAction(() -> { try { windowManager.removeView(glow); } catch (Exception ignored) {} })
                .start();
    }

    // Fanned cluster wrapped into rows of 4, starting BELOW the whole arc's own bottom edge
    // (the hide sub-bubble's position, angle 270°) rather than right under the main bubble
    // itself — so results never overlap the bubble or where the arc opens back up next time.
    private void positionResultIcon(WindowManager.LayoutParams params, int index, int sizePx) {
        float density = getResources().getDisplayMetrics().density;
        int gap = (int) (6 * density);
        int perRow = 4;
        int col = index % perRow;
        int row = index / perRow;
        params.x = mainBubbleParams.x - (col * (sizePx + gap));
        params.y = resultGridTopY() + row * (sizePx + gap);
    }

    // Bottom of the arc (angle 270°, directly below the main bubble) plus a small gap — see
    // positionResultIcon's own comment.
    private int resultGridTopY() {
        float density = getResources().getDisplayMetrics().density;
        int subSizePx = (int) (SUB_BUBBLE_SIZE_DP * density);
        int gap = (int) (10 * density);
        int radius = mainBubbleParams.width / 2 + gap + subSizePx / 2;
        int arcBottomY = mainBubbleParams.y + mainBubbleParams.width / 2 - subSizePx / 2 + radius + subSizePx;
        return arcBottomY + gap;
    }

    private void repositionResultIcons() {
        if (pocketIcon != null) {
            WindowManager.LayoutParams pp = (WindowManager.LayoutParams) pocketIcon.getTag();
            positionResultIcon(pp, 0, pp.width);
            windowManager.updateViewLayout(pocketIcon, pp);
        }
        int offset = (pocketIcon != null) ? 1 : 0;
        for (int i = 0; i < resultIcons.size(); i++) {
            View v = resultIcons.get(i);
            WindowManager.LayoutParams p = (WindowManager.LayoutParams) v.getTag();
            positionResultIcon(p, i + offset, p.width);
            windowManager.updateViewLayout(v, p);
            repositionTileGlow(v, p, p.width);
        }
    }

    // Wipes both the visible tiles AND the underlying pull record (allPulledResults/pocket) —
    // used when the bubble is minimized or torn down. Simpler than trying to preserve/rebuild
    // the pocket's history across a hide→restore cycle, and not something this was asked for.
    private void clearResultIcons() {
        for (View v : resultIcons) {
            removeTileGlow(v);
            try { windowManager.removeView(v); } catch (Exception ignored) {}
        }
        resultIcons.clear();
        if (pocketIcon != null) {
            try { windowManager.removeView(pocketIcon); } catch (Exception ignored) {}
            pocketIcon = null;
            pocketBadge = null;
        }
        hidePocketPanel();
        allPulledResults.clear();
        // Safety net in case any tile slipped through without going via removeTileGlow above.
        for (View halo : tileGlows.values()) { try { windowManager.removeView(halo); } catch (Exception ignored) {} }
        tileGlows.clear();
        for (android.animation.ObjectAnimator anim : tileGlowAnimators.values()) anim.cancel();
        tileGlowAnimators.clear();
    }

    // ── Auto-archive (item 9) / persistent halos (item 10) ──────────────────

    // Force-evicts every still-visible individual result tile into the pocket, 5s after a
    // reveal sequence settles (scheduled from playItemStep's terminal branch) — reuses the same
    // per-tile eviction step the overflow cap in addResultIcon() uses, rather than duplicating
    // it here.
    private void autoArchiveAllTiles() {
        if (resultIcons.isEmpty()) return;
        float density = getResources().getDisplayMetrics().density;
        int sizePx = (int) (RESULT_ICON_SIZE_DP * density);
        // Snapshot first — evictTileToPocket mutates resultIcons as it iterates.
        List<View> toEvict = new ArrayList<>(resultIcons);
        for (View tile : toEvict) evictTileToPocket(tile, sizePx);
        updatePocketBadge();
        renumberResultSlots(sizePx);
    }

    // Shared by both eviction paths (the overflow cap in addResultIcon() and the auto-archive
    // timer above): creates the pocket if it doesn't exist yet, cleans up the tile's own
    // persistent halo (if any), then drops the tile's window.
    private void evictTileToPocket(View tile, int sizePx) {
        if (pocketIcon == null) createPocket(sizePx);
        removeTileGlow(tile);
        try { windowManager.removeView(tile); } catch (Exception ignored) {}
        resultIcons.remove(tile);
    }

    // Persistent (non-one-shot) halo behind a settled 4★/5★ tile — a static glow ring for 4★,
    // an infinitely alpha-pulsing one for 5★ — kept alive until the tile itself is dismissed/
    // archived/cleared (see removeTileGlow). Deliberately separate from addGlowBurst's one-shot
    // arrival flash, which stays exactly as it was.
    private void addPersistentHalo(View tile, WindowManager.LayoutParams tileParams, int sizePx, int rarity) {
        int haloSizePx = (int) (sizePx * 1.5f);
        FrameLayout halo = new FrameLayout(this);
        GradientDrawable ring = new GradientDrawable();
        ring.setShape(GradientDrawable.OVAL);
        ring.setColor(Color.parseColor(rarityHex(rarity).replace("#FF", "#66")));
        halo.setBackground(ring);
        clipToCircle(halo);

        int overlayType = Build.VERSION.SDK_INT >= Build.VERSION_CODES.O
                ? WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
                : WindowManager.LayoutParams.TYPE_PHONE;
        WindowManager.LayoutParams params = new WindowManager.LayoutParams(
                haloSizePx, haloSizePx, overlayType,
                WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE | WindowManager.LayoutParams.FLAG_NOT_TOUCHABLE,
                PixelFormat.TRANSLUCENT);
        params.gravity = Gravity.TOP | Gravity.START;
        params.x = tileParams.x - (haloSizePx - sizePx) / 2;
        params.y = tileParams.y - (haloSizePx - sizePx) / 2;
        halo.setTag(params);

        try {
            // Added BEFORE the tile is touched again so it stays visually behind it — the tile
            // window itself was already added earlier in addResultIcon(), so this simply relies
            // on the halo's own smaller/lower z-order not covering the icon on top.
            windowManager.addView(halo, params);
        } catch (Exception e) {
            return;
        }

        tileGlows.put(tile, halo);
        if (rarity >= 5) {
            android.animation.ObjectAnimator anim = android.animation.ObjectAnimator.ofFloat(halo, "alpha", 0.35f, 0.9f);
            anim.setDuration(700);
            anim.setRepeatMode(android.animation.ValueAnimator.REVERSE);
            anim.setRepeatCount(android.animation.ValueAnimator.INFINITE);
            anim.start();
            tileGlowAnimators.put(tile, anim);
        } else {
            halo.setAlpha(0.6f);
        }
    }

    // Moves a tile's paired halo (if it has one) in lockstep whenever the tile itself moves —
    // called from every place a tile's WindowManager params change (drag-follow, slot renumber).
    private void repositionTileGlow(View tile, WindowManager.LayoutParams tileParams, int sizePx) {
        View halo = tileGlows.get(tile);
        if (halo == null) return;
        WindowManager.LayoutParams hp = (WindowManager.LayoutParams) halo.getTag();
        int haloSizePx = hp.width;
        hp.x = tileParams.x - (haloSizePx - sizePx) / 2;
        hp.y = tileParams.y - (haloSizePx - sizePx) / 2;
        try { windowManager.updateViewLayout(halo, hp); } catch (Exception ignored) {}
    }

    // Removes a tile's persistent halo + cancels its pulse animator (if any) — called wherever a
    // tile itself is removed: tap-dismiss, pocket eviction (both paths), and clearResultIcons().
    private void removeTileGlow(View tile) {
        View halo = tileGlows.remove(tile);
        android.animation.ObjectAnimator anim = tileGlowAnimators.remove(tile);
        if (anim != null) anim.cancel();
        if (halo != null) { try { windowManager.removeView(halo); } catch (Exception ignored) {} }
    }

    // ── Pocket "view all pulls" panel ────────────────────────────────────────

    private void togglePocketPanel() {
        if (pocketPanel != null) hidePocketPanel();
        else showPocketPanel();
    }

    private void hidePocketPanel() {
        if (pocketPanel == null) return;
        try { windowManager.removeView(pocketPanel); } catch (Exception ignored) {}
        pocketPanel = null;
    }

    // A small scrollable card listing EVERY pull this session (allPulledResults, not just the
    // still-visible individual tiles) — small rarity-ringed thumbnails in a wrapped grid, tap
    // the ✕ or the pocket again to dismiss.
    private void showPocketPanel() {
        float density = getResources().getDisplayMetrics().density;
        int panelWidthPx = (int) (260 * density);
        int panelHeightPx = (int) (320 * density);

        LinearLayout outer = new LinearLayout(this);
        outer.setOrientation(LinearLayout.VERTICAL);
        GradientDrawable bg = new GradientDrawable();
        bg.setColor(Color.parseColor("#E6111827"));
        bg.setCornerRadius(16 * density);
        bg.setStroke((int) density, Color.parseColor("#40FFFFFF"));
        outer.setBackground(bg);
        int pad = (int) (10 * density);
        outer.setPadding(pad, pad, pad, pad);

        LinearLayout header = new LinearLayout(this);
        header.setOrientation(LinearLayout.HORIZONTAL);
        header.setGravity(Gravity.CENTER_VERTICAL);
        TextView title = new TextView(this);
        title.setText(getString(R.string.pull_bubble_pocket_title, allPulledResults.size()));
        title.setTextColor(Color.WHITE);
        title.setTextSize(13);
        title.setTypeface(null, android.graphics.Typeface.BOLD);
        header.addView(title, new LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1f));
        TextView close = new TextView(this);
        close.setText("✕");
        close.setTextColor(Color.WHITE);
        close.setPadding(pad, 0, 0, 0);
        close.setOnClickListener(v -> hidePocketPanel());
        header.addView(close);
        outer.addView(header);

        ScrollView scroll = new ScrollView(this);
        LinearLayout grid = new LinearLayout(this);
        grid.setOrientation(LinearLayout.VERTICAL);
        JSONObject assetMap = loadPullAssetMap();
        int perRow = 6;
        int tileSizePx = (int) (32 * density);
        int tileGap = (int) (4 * density);
        LinearLayout row = null;
        for (int i = 0; i < allPulledResults.size(); i++) {
            if (i % perRow == 0) {
                row = new LinearLayout(this);
                row.setOrientation(LinearLayout.HORIZONTAL);
                LinearLayout.LayoutParams rowLp = new LinearLayout.LayoutParams(LinearLayout.LayoutParams.WRAP_CONTENT, LinearLayout.LayoutParams.WRAP_CONTENT);
                rowLp.topMargin = tileGap;
                grid.addView(row, rowLp);
            }
            WidgetPullSimulator.PullResult r = allPulledResults.get(i);
            FrameLayout tile = new FrameLayout(this);
            tile.setBackground(circleDrawable("#40000000", rarityHex(r.rarity)));
            clipToCircle(tile);
            String assetPath = r.name != null ? assetMap.optString(r.name, null) : null;
            Bitmap bmp = assetPath != null ? WidgetAssetUtils.decodeAsset(this, assetPath, tileSizePx) : null;
            if (bmp != null) {
                ImageView img = new ImageView(this);
                img.setImageBitmap(bmp);
                img.setScaleType(ImageView.ScaleType.CENTER_CROP);
                tile.addView(img, new FrameLayout.LayoutParams(FrameLayout.LayoutParams.MATCH_PARENT, FrameLayout.LayoutParams.MATCH_PARENT));
            }
            LinearLayout.LayoutParams tileLp = new LinearLayout.LayoutParams(tileSizePx, tileSizePx);
            tileLp.leftMargin = tileGap;
            row.addView(tile, tileLp);
        }
        scroll.addView(grid);
        outer.addView(scroll, new LinearLayout.LayoutParams(LinearLayout.LayoutParams.MATCH_PARENT, 0, 1f));

        int overlayType = Build.VERSION.SDK_INT >= Build.VERSION_CODES.O
                ? WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
                : WindowManager.LayoutParams.TYPE_PHONE;
        WindowManager.LayoutParams params = new WindowManager.LayoutParams(
                panelWidthPx, panelHeightPx, overlayType,
                WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE,
                PixelFormat.TRANSLUCENT);
        params.gravity = Gravity.TOP | Gravity.START;
        android.util.DisplayMetrics dm = getResources().getDisplayMetrics();
        params.x = Math.max(0, Math.min(mainBubbleParams.x - panelWidthPx / 2, dm.widthPixels - panelWidthPx));
        params.y = Math.max(0, Math.min(videoAnchorY() - panelHeightPx - (int) (10 * density), dm.heightPixels - panelHeightPx));

        pocketPanel = outer;
        windowManager.addView(outer, params);
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
        hideHiddenTab();
        if (mainBubble != null && windowManager != null) {
            try { windowManager.removeView(mainBubble); } catch (Exception ignored) {}
        }
        mainBubble = null;
        expanded = false;
        running = false;
        // Drops any still-pending reveal step (a wave-stagger delay, or a callback from a
        // FloatingVideoOverlayService still playing) so a sequence in progress when the bubble
        // is dragged onto ✕ doesn't keep posting to views that no longer exist.
        handler.removeCallbacksAndMessages(null);
        rolling = false;
        stopForeground(true);
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        teardown();
    }
}
