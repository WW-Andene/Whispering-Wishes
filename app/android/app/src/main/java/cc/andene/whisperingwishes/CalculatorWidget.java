package cc.andene.whisperingwishes;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.graphics.Bitmap;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.RemoteViews;

import org.json.JSONObject;

// Home-screen "Calculator" widget — ONE widget that reveals more of itself as the user
// resizes it bigger, instead of five separate widgets the user would place one at a time.
// See widget_calculator.xml's own header for the full row-by-row breakdown of what
// appears at each size. Two independent resize axes:
//   WIDTH (2-5 cells): how many of the 5 currency columns show in the always-visible top
//   row (row 1) — Astrite/Lunite always shown, the three Tides reveal one at a time.
//   HEIGHT (1-5 cells): how many of the 5 stacked sections show at all — row 1 alone at
//   the minimum, then a single goal gauge, pull-target picker, tappable copy target, and
//   (once built) probability stats each appear as one more cell of height is added.
//
// Data comes from the same "CapacitorStorage" SharedPreferences bridge every widget in
// this app shares (see PulseBannerWidget.java's own header for the full explanation):
// widget_currency_data (written by widgetSync.js's syncCurrencyWidget()) holds the raw
// currency counts, per-currency goals, pity context, and copy targets; widget_target_mode
// (TARGET_MODE_KEY, "char"|"weap"|"both") is written directly by this widget's own
// Resonator/Both/Weapon button taps, independent of the app's sync cadence — see the old
// TargetWidget.java history (now merged into this class) for why that one stays native-only.
public class CalculatorWidget extends AppWidgetProvider {
    private static final String TAG = "CalculatorWidget";
    private static final String PREFS_NAME = "CapacitorStorage";
    private static final String DATA_KEY = "widget_currency_data";
    private static final String BG_ART_ASSET = "banner-history/log-2-0.jpg"; // "Log 2.0" theme
    static final String TARGET_MODE_KEY = "widget_target_mode"; // "char" | "weap" | "both"
    // Widget-local overrides of the copy target the app itself synced (charCopies/weapCopies
    // in widget_currency_data) — set only once the user taps the copy-target pill on this
    // widget; -1 (readCopies' default) means "no override yet, use the synced value".
    private static final String CHAR_COPIES_OVERRIDE_KEY = "widget_char_copies_override";
    private static final String WEAP_COPIES_OVERRIDE_KEY = "widget_weap_copies_override";
    private static final String ACTION_SET_TARGET = "cc.andene.whisperingwishes.ACTION_SET_TARGET";
    private static final String ACTION_CYCLE_COPIES = "cc.andene.whisperingwishes.ACTION_CYCLE_COPIES";
    private static final String EXTRA_MODE = "mode";
    private static final String EXTRA_TRACK = "track"; // "char" | "weap"

    // Kept in sync with widgetSync.js's CURRENCY_WIDGET_SCHEMA_VERSION.
    private static final int SCHEMA_VERSION = 4;
    private static final int ROW1_ICON_PX = 48;
    private static final int GAUGE_ICON_PX = 48;
    private static final int BG_ART_PX = 384;
    private static final int DEFAULT_HARD_PITY = 80;
    private static final int DEFAULT_ASTRITE_PER_PULL = 160;
    private static final int MAX_CHAR_COPIES = 7; // C0-C6
    private static final int MAX_WEAP_COPIES = 5; // R1-R5

    // Android's own widget-grid formula (70dp * cells - 30dp). Two independent axes use
    // this same math for different purposes: WIDTH_COL* gates row 1's own column reveal
    // (3/4/5-cell-wide thresholds); HEIGHT_ROW* gates which whole section below row 1
    // exists at all (2/3/4/5-cell-tall thresholds — row 1 itself is the 1-cell floor).
    private static final int WIDTH_COL3_DP = 180;
    private static final int WIDTH_COL4_DP = 250;
    private static final int WIDTH_COL5_DP = 320;
    private static final int HEIGHT_ROW2_DP = 110;
    private static final int HEIGHT_ROW3_DP = 180;
    private static final int HEIGHT_ROW4_DP = 250;
    // Reserved for row 5 (probability/statistics) once that mode is built — widget_stats
    // stays unconditionally GONE until then, so this constant has no reader yet.
    private static final int HEIGHT_ROW5_DP = 320;

    private static final class Currency {
        final String key, asset;
        final int row1Id, row1IconId, row1ValueId;
        Currency(String key, String asset, int row1Id, int row1IconId, int row1ValueId) {
            this.key = key; this.asset = asset;
            this.row1Id = row1Id; this.row1IconId = row1IconId; this.row1ValueId = row1ValueId;
        }
    }

    // Order matches row 1's own left-to-right column order (and its width reveal
    // thresholds) — Astrite/Lunite are the two always-visible columns.
    private static final Currency[] CURRENCIES = {
        new Currency("astrite", "ui-icons/Currency-Astrite.webp",
            R.id.widget_currency_row_astrite, R.id.widget_currency_icon_astrite, R.id.widget_currency_value_astrite),
        new Currency("lunite", "ui-icons/Currency-Lunite.webp",
            R.id.widget_currency_row_lunite, R.id.widget_currency_icon_lunite, R.id.widget_currency_value_lunite),
        new Currency("radiant", "ui-icons/Currency-Radiant-Tide.webp",
            R.id.widget_currency_row_radiant, R.id.widget_currency_icon_radiant, R.id.widget_currency_value_radiant),
        new Currency("lustrous", "ui-icons/Currency-Lustrous-Tide.webp",
            R.id.widget_currency_row_lustrous, R.id.widget_currency_icon_lustrous, R.id.widget_currency_value_lustrous),
        new Currency("forging", "ui-icons/Currency-Forging-Tide.webp",
            R.id.widget_currency_row_forging, R.id.widget_currency_icon_forging, R.id.widget_currency_value_forging),
    };

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        for (int appWidgetId : appWidgetIds) {
            updateWidget(context, appWidgetManager, appWidgetId);
        }
    }

    @Override
    public void onAppWidgetOptionsChanged(Context context, AppWidgetManager appWidgetManager, int appWidgetId, Bundle newOptions) {
        // Fires whenever the user resizes the widget — re-render so row 1's columns and
        // the stacked sections below can appear/disappear based on the new size.
        updateWidget(context, appWidgetManager, appWidgetId);
    }

    @Override
    public void onReceive(Context context, Intent intent) {
        // Handle the target-picker buttons' own broadcast before falling through to
        // AppWidgetProvider's normal onReceive (which dispatches
        // APPWIDGET_UPDATE/DELETED/etc. into onUpdate/onDeleted/...).
        if (ACTION_SET_TARGET.equals(intent.getAction())) {
            String mode = intent.getStringExtra(EXTRA_MODE);
            if (mode != null) {
                context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
                    .edit().putString(TARGET_MODE_KEY, mode).apply();
                // Re-render every placed instance immediately — the whole widget (bars,
                // selection highlight, pity blocks) depends on this choice.
                requestUpdate(context);
            }
            return;
        }
        if (ACTION_CYCLE_COPIES.equals(intent.getAction())) {
            String track = intent.getStringExtra(EXTRA_TRACK);
            if (track != null) {
                cycleCopies(context, track);
                requestUpdate(context);
            }
            return;
        }
        super.onReceive(context, intent);
    }

    private void updateWidget(Context context, AppWidgetManager appWidgetManager, int appWidgetId) {
        // A RemoteViews process can fail for reasons unrelated to this class's own logic
        // (Binder transaction-size ceiling, a corrupt/foreign-format icon asset, etc.), so
        // any failure renders as visible text on the widget itself rather than the OS's
        // generic, undiagnosable "Couldn't load this widget" placeholder.
        try {
            renderWidget(context, appWidgetManager, appWidgetId);
        } catch (Throwable t) {
            Log.e(TAG, "updateWidget crashed", t);
            RemoteViews fallback = new RemoteViews(context.getPackageName(), R.layout.widget_calculator);
            fallback.setTextViewText(R.id.widget_currency_value_astrite, "Widget error");
            appWidgetManager.updateAppWidget(appWidgetId, fallback);
        }
    }

    private void renderWidget(Context context, AppWidgetManager appWidgetManager, int appWidgetId) {
        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        JSONObject data = readData(prefs);
        String targetMode = prefs.getString(TARGET_MODE_KEY, "char");

        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.widget_calculator);

        // "Log 2.0" theme art as the widget's own background — rounded the same way
        // PulseBannerWidget.java rounds its banner art, so the corners line up with
        // widget_background's own radius/the system-drawn widget frame on API 31+.
        Bitmap bgArt = WidgetAssetUtils.decodeAsset(context, BG_ART_ASSET, BG_ART_PX, Bitmap.Config.RGB_565);
        if (bgArt != null) {
            views.setImageViewBitmap(R.id.widget_bg_art, WidgetAssetUtils.roundedCorners(bgArt, WidgetAssetUtils.widgetCornerRadiusPx(context)));
        }

        Bundle options = appWidgetManager.getAppWidgetOptions(appWidgetId);
        int widthDp = options != null ? options.getInt(AppWidgetManager.OPTION_APPWIDGET_MAX_WIDTH, 0) : 0;
        int heightDp = options != null ? options.getInt(AppWidgetManager.OPTION_APPWIDGET_MAX_HEIGHT, 0) : 0;

        renderRow1(context, views, data, widthDp);

        boolean showProgress = heightDp >= HEIGHT_ROW2_DP;
        views.setViewVisibility(R.id.widget_section_progress, showProgress ? View.VISIBLE : View.GONE);
        if (showProgress) renderProgressSection(context, views, data, targetMode);

        boolean showTarget = heightDp >= HEIGHT_ROW3_DP;
        views.setViewVisibility(R.id.widget_section_target, showTarget ? View.VISIBLE : View.GONE);
        if (showTarget) renderTargetSection(context, views, appWidgetId, targetMode);

        boolean showPity = heightDp >= HEIGHT_ROW4_DP;
        views.setViewVisibility(R.id.widget_section_pity, showPity ? View.VISIBLE : View.GONE);
        if (showPity) renderPitySection(context, views, appWidgetId, data, targetMode);

        // Row 5 (probability/statistics) isn't built yet — always hidden regardless of
        // height until that mode exists. Left GONE unconditionally rather than reusing a
        // "heightDp >= next threshold" check that would just show an empty placeholder box.
        views.setViewVisibility(R.id.widget_section_stats, View.GONE);

        appWidgetManager.updateAppWidget(appWidgetId, views);
    }

    // ── Row 1 — currency log ──────────────────────────────────────────────────────────
    private void renderRow1(Context context, RemoteViews views, JSONObject data, int widthDp) {
        for (int i = 0; i < CURRENCIES.length; i++) {
            Currency c = CURRENCIES[i];
            boolean visible = i < 2
                || (i == 2 && widthDp >= WIDTH_COL3_DP)
                || (i == 3 && widthDp >= WIDTH_COL4_DP)
                || (i == 4 && widthDp >= WIDTH_COL5_DP);
            views.setViewVisibility(c.row1Id, visible ? View.VISIBLE : View.GONE);
            if (!visible) continue;

            long value = data != null ? data.optLong(c.key, 0) : 0;
            views.setTextViewText(c.row1ValueId, String.valueOf(value));
            Bitmap icon = WidgetAssetUtils.decodeAsset(context, c.asset, ROW1_ICON_PX);
            if (icon != null) views.setImageViewBitmap(c.row1IconId, icon);
        }
    }

    // ── Section 2 — ONE gauge toward the chosen goal ──────────────────────────────────
    // Everything the player owns that counts toward the currently selected pull target
    // (Resonator/Both/Weapon) collapses into a single "pulls toward goal" number: Astrite
    // (÷ astritePerPull) + Lunite (1:1) + Radiant Tide (1:1, char track only) + Forging
    // Tide (1:1, weapon track only) — Lustrous Tide (standard banner) is left out, since
    // it isn't governed by the Resonator/Weapon target picker at all. That total is shown
    // against the pulls still needed to close out charPity5/weapPity5 to hard pity for
    // whichever track(s) are selected.
    private void renderProgressSection(Context context, RemoteViews views, JSONObject data, String targetMode) {
        int hardPity = data != null ? data.optInt("hardPity", DEFAULT_HARD_PITY) : DEFAULT_HARD_PITY;
        int astritePerPull = data != null ? data.optInt("astritePerPull", DEFAULT_ASTRITE_PER_PULL) : DEFAULT_ASTRITE_PER_PULL;
        int charPity = data != null ? data.optInt("charPity5", 0) : 0;
        int weapPity = data != null ? data.optInt("weapPity5", 0) : 0;
        int charPullsLeft = Math.max(0, hardPity - charPity);
        int weapPullsLeft = Math.max(0, hardPity - weapPity);
        boolean wantChar = "char".equals(targetMode) || "both".equals(targetMode);
        boolean wantWeap = "weap".equals(targetMode) || "both".equals(targetMode);
        int pullsNeeded = (wantChar ? charPullsLeft : 0) + (wantWeap ? weapPullsLeft : 0);

        long astrite = data != null ? data.optLong("astrite", 0) : 0;
        long lunite = data != null ? data.optLong("lunite", 0) : 0;
        long radiant = wantChar && data != null ? data.optLong("radiant", 0) : 0;
        long forging = wantWeap && data != null ? data.optLong("forging", 0) : 0;
        long pullsOwned = astrite / Math.max(1, astritePerPull) + lunite + radiant + forging;

        int percent = pullsNeeded > 0 ? (int) Math.min(100, Math.round(pullsOwned * 100.0 / pullsNeeded)) : 0;
        views.setTextViewText(R.id.widget_progress_value,
            pullsNeeded > 0 ? pullsOwned + " / " + pullsNeeded + " pulls" : pullsOwned + " pulls");
        views.setProgressBar(R.id.widget_progress_bar, 100, percent, false);

        Bitmap icon = WidgetAssetUtils.decodeAsset(context, "ui-icons/Currency-Astrite.webp", GAUGE_ICON_PX);
        if (icon != null) views.setImageViewBitmap(R.id.widget_progress_icon, icon);
    }

    // ── Section 3 — pull target picker ────────────────────────────────────────────────
    private void renderTargetSection(Context context, RemoteViews views, int appWidgetId, String current) {
        setChoice(context, views, appWidgetId, R.id.widget_target_char, "char", current);
        setChoice(context, views, appWidgetId, R.id.widget_target_both, "both", current);
        setChoice(context, views, appWidgetId, R.id.widget_target_weap, "weap", current);
    }

    // Each choice's own selected/unselected background is baked into the layout as two
    // stacked drawables toggled via setViewVisibility — RemoteViews can't runtime-swap a
    // view's background drawable resource directly.
    private void setChoice(Context context, RemoteViews views, int appWidgetId, int buttonId, String mode, String current) {
        boolean selected = mode.equals(current);
        views.setViewVisibility(selectedOverlayId(buttonId), selected ? View.VISIBLE : View.GONE);

        Intent intent = new Intent(context, CalculatorWidget.class);
        intent.setAction(ACTION_SET_TARGET);
        intent.putExtra(EXTRA_MODE, mode);
        // Request code must be unique per (widget instance, button) pair, not just per
        // button — otherwise FLAG_IMMUTABLE PendingIntents for the same button across
        // different widget instances would collide and silently reuse the first one's.
        int requestCode = appWidgetId * 10 + buttonId % 10;
        PendingIntent pending = PendingIntent.getBroadcast(context, requestCode, intent,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        views.setOnClickPendingIntent(buttonId, pending);
    }

    private static int selectedOverlayId(int buttonId) {
        if (buttonId == R.id.widget_target_char) return R.id.widget_target_char_selected;
        if (buttonId == R.id.widget_target_both) return R.id.widget_target_both_selected;
        return R.id.widget_target_weap_selected;
    }

    // ── Section 4 — tappable copy target ──────────────────────────────────────────────
    // No pity-count fraction shown here any more (the old "X / 80" under each label) —
    // the copy-target pill is the whole row now, and it's tappable: each tap cycles it
    // forward by one (wrapping past MAX_CHAR_COPIES/MAX_WEAP_COPIES back to 1) via
    // ACTION_CYCLE_COPIES, independent of whatever the app itself last synced.
    private void renderPitySection(Context context, RemoteViews views, int appWidgetId, JSONObject data, String targetMode) {
        boolean showChar = "char".equals(targetMode) || "both".equals(targetMode);
        boolean showWeap = "weap".equals(targetMode) || "both".equals(targetMode);

        int charCopies = readCopies(context, "char", data);
        int weapCopies = readCopies(context, "weap", data);

        views.setViewVisibility(R.id.widget_pity_block_char, showChar ? View.VISIBLE : View.GONE);
        if (showChar) {
            views.setTextViewText(R.id.widget_pity_copies_char_text, "Copy Target: " + charCopies + " / " + MAX_CHAR_COPIES);
            setCyclePendingIntent(context, views, appWidgetId, R.id.widget_pity_copies_char, "char");
        }

        views.setViewVisibility(R.id.widget_pity_block_weap, showWeap ? View.VISIBLE : View.GONE);
        if (showWeap) {
            views.setTextViewText(R.id.widget_pity_copies_weap_text, "Copy Target: " + weapCopies + " / " + MAX_WEAP_COPIES);
            setCyclePendingIntent(context, views, appWidgetId, R.id.widget_pity_copies_weap, "weap");
        }
    }

    private void setCyclePendingIntent(Context context, RemoteViews views, int appWidgetId, int pillId, String track) {
        Intent intent = new Intent(context, CalculatorWidget.class);
        intent.setAction(ACTION_CYCLE_COPIES);
        intent.putExtra(EXTRA_TRACK, track);
        // Same per-(widget instance, view) request-code scheme as setChoice() above — must
        // stay unique across widget instances or FLAG_IMMUTABLE PendingIntents collide.
        int requestCode = appWidgetId * 10 + pillId % 10;
        PendingIntent pending = PendingIntent.getBroadcast(context, requestCode, intent,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        views.setOnClickPendingIntent(pillId, pending);
    }

    // "char"/"weap" copy target, widget-local override first (set by a tap on this
    // widget's own pill), falling back to whatever the app last synced into
    // widget_currency_data, then to 1.
    private static int readCopies(Context context, String track, JSONObject data) {
        String overrideKey = "char".equals(track) ? CHAR_COPIES_OVERRIDE_KEY : WEAP_COPIES_OVERRIDE_KEY;
        int override = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE).getInt(overrideKey, -1);
        if (override > 0) return override;
        String dataKey = "char".equals(track) ? "charCopies" : "weapCopies";
        return data != null ? data.optInt(dataKey, 1) : 1;
    }

    private static void cycleCopies(Context context, String track) {
        boolean isChar = "char".equals(track);
        String overrideKey = isChar ? CHAR_COPIES_OVERRIDE_KEY : WEAP_COPIES_OVERRIDE_KEY;
        int max = isChar ? MAX_CHAR_COPIES : MAX_WEAP_COPIES;

        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        JSONObject data = readData(prefs);
        int current = readCopies(context, track, data);
        int next = (current % max) + 1; // 1..max, wraps back to 1
        prefs.edit().putInt(overrideKey, next).apply();
    }

    // Returns null if the blob is missing, malformed, or from a schema version this build
    // doesn't understand — failing closed here is safer than guessing at a field that
    // might not mean what this code expects.
    private static JSONObject readData(SharedPreferences prefs) {
        String raw = prefs.getString(DATA_KEY, null);
        if (raw == null) return null;
        try {
            JSONObject obj = new JSONObject(raw);
            if (obj.optInt("v", -1) != SCHEMA_VERSION) return null;
            return obj;
        } catch (Exception e) {
            return null;
        }
    }

    // Called from MainActivity.onResume() so reopening the app refreshes the widget
    // sooner than Android's own update-period floor — mirrors PulseBannerWidget's own.
    public static void requestUpdate(Context context) {
        Intent intent = new Intent(context, CalculatorWidget.class);
        intent.setAction(AppWidgetManager.ACTION_APPWIDGET_UPDATE);
        AppWidgetManager mgr = AppWidgetManager.getInstance(context);
        int[] ids = mgr.getAppWidgetIds(new ComponentName(context, CalculatorWidget.class));
        intent.putExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS, ids);
        context.sendBroadcast(intent);
    }
}
