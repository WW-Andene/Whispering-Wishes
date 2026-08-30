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
//   the minimum, then progress bars, pull-target picker, pity+copy target, and (once
//   built) probability stats each appear as one more cell of height is added.
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
    static final String TARGET_MODE_KEY = "widget_target_mode"; // "char" | "weap" | "both"
    private static final String ACTION_SET_TARGET = "cc.andene.whisperingwishes.ACTION_SET_TARGET";
    private static final String EXTRA_MODE = "mode";

    // Kept in sync with widgetSync.js's CURRENCY_WIDGET_SCHEMA_VERSION.
    private static final int SCHEMA_VERSION = 4;
    private static final int ICON_PX = 40;
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

    private enum PityTrack { EITHER, CHAR_ONLY, WEAP_ONLY, NONE }

    private static final class Currency {
        final String key, goalKey, asset;
        final PityTrack track;
        final int row1Id, row1IconId, row1ValueId;
        final int progressIconId, progressValueId, progressBarId;
        Currency(String key, String goalKey, String asset, PityTrack track,
                 int row1Id, int row1IconId, int row1ValueId,
                 int progressIconId, int progressValueId, int progressBarId) {
            this.key = key; this.goalKey = goalKey; this.asset = asset; this.track = track;
            this.row1Id = row1Id; this.row1IconId = row1IconId; this.row1ValueId = row1ValueId;
            this.progressIconId = progressIconId; this.progressValueId = progressValueId; this.progressBarId = progressBarId;
        }
    }

    // Order matches row 1's own left-to-right column order (and its width reveal
    // thresholds) — Astrite/Lunite are the two always-visible columns.
    private static final Currency[] CURRENCIES = {
        new Currency("astrite", "astriteGoal", "ui-icons/Currency-Astrite.webp", PityTrack.EITHER,
            R.id.widget_currency_row_astrite, R.id.widget_currency_icon_astrite, R.id.widget_currency_value_astrite,
            R.id.widget_progress_icon_astrite, R.id.widget_progress_value_astrite, R.id.widget_progress_bar_astrite),
        new Currency("lunite", "luniteGoal", "ui-icons/Currency-Lunite.webp", PityTrack.EITHER,
            R.id.widget_currency_row_lunite, R.id.widget_currency_icon_lunite, R.id.widget_currency_value_lunite,
            R.id.widget_progress_icon_lunite, R.id.widget_progress_value_lunite, R.id.widget_progress_bar_lunite),
        new Currency("radiant", "radiantGoal", "ui-icons/Currency-Radiant-Tide.webp", PityTrack.CHAR_ONLY,
            R.id.widget_currency_row_radiant, R.id.widget_currency_icon_radiant, R.id.widget_currency_value_radiant,
            R.id.widget_progress_icon_radiant, R.id.widget_progress_value_radiant, R.id.widget_progress_bar_radiant),
        new Currency("lustrous", "lustrousGoal", "ui-icons/Currency-Lustrous-Tide.webp", PityTrack.NONE,
            R.id.widget_currency_row_lustrous, R.id.widget_currency_icon_lustrous, R.id.widget_currency_value_lustrous,
            R.id.widget_progress_icon_lustrous, R.id.widget_progress_value_lustrous, R.id.widget_progress_bar_lustrous),
        new Currency("forging", "forgingGoal", "ui-icons/Currency-Forging-Tide.webp", PityTrack.WEAP_ONLY,
            R.id.widget_currency_row_forging, R.id.widget_currency_icon_forging, R.id.widget_currency_value_forging,
            R.id.widget_progress_icon_forging, R.id.widget_progress_value_forging, R.id.widget_progress_bar_forging),
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
        if (showPity) renderPitySection(views, data, targetMode);

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
            Bitmap icon = WidgetAssetUtils.decodeAsset(context, c.asset, 48);
            if (icon != null) views.setImageViewBitmap(c.row1IconId, icon);
        }
    }

    // ── Section 2 — progress bars toward pity/goal ────────────────────────────────────
    private void renderProgressSection(Context context, RemoteViews views, JSONObject data, String targetMode) {
        int hardPity = data != null ? data.optInt("hardPity", DEFAULT_HARD_PITY) : DEFAULT_HARD_PITY;
        int astritePerPull = data != null ? data.optInt("astritePerPull", DEFAULT_ASTRITE_PER_PULL) : DEFAULT_ASTRITE_PER_PULL;
        int charPity = data != null ? data.optInt("charPity5", 0) : 0;
        int weapPity = data != null ? data.optInt("weapPity5", 0) : 0;
        int charPullsLeft = Math.max(0, hardPity - charPity);
        int weapPullsLeft = Math.max(0, hardPity - weapPity);
        boolean wantChar = "char".equals(targetMode) || "both".equals(targetMode);
        boolean wantWeap = "weap".equals(targetMode) || "both".equals(targetMode);
        int eitherPullsLeft = (wantChar ? charPullsLeft : 0) + (wantWeap ? weapPullsLeft : 0);

        for (Currency c : CURRENCIES) {
            long value = data != null ? data.optLong(c.key, 0) : 0;
            long manualGoal = data != null ? data.optLong(c.goalKey, 0) : 0;

            long dynamicGoal = 0;
            switch (c.track) {
                case EITHER:
                    dynamicGoal = (long) eitherPullsLeft * astritePerPull;
                    break;
                case CHAR_ONLY:
                    dynamicGoal = wantChar ? charPullsLeft : 0; // 1 Radiant Tide == 1 pull, no multiplier
                    break;
                case WEAP_ONLY:
                    dynamicGoal = wantWeap ? weapPullsLeft : 0; // 1 Forging Tide == 1 pull, no multiplier
                    break;
                case NONE:
                default:
                    break; // Lustrous Tide (standard banner) — target picker doesn't apply, manual goal only
            }
            long goal = dynamicGoal > 0 ? dynamicGoal : manualGoal;
            int percent = goal > 0 ? (int) Math.min(100, Math.round(value * 100.0 / goal)) : 0;

            views.setTextViewText(c.progressValueId, goal > 0 ? value + " / " + goal : String.valueOf(value));
            views.setProgressBar(c.progressBarId, 100, percent, false);

            Bitmap icon = WidgetAssetUtils.decodeAsset(context, c.asset, ICON_PX);
            if (icon != null) views.setImageViewBitmap(c.progressIconId, icon);
        }
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

    // ── Section 4 — pity counter + copy target ────────────────────────────────────────
    private void renderPitySection(RemoteViews views, JSONObject data, String targetMode) {
        boolean showChar = "char".equals(targetMode) || "both".equals(targetMode);
        boolean showWeap = "weap".equals(targetMode) || "both".equals(targetMode);

        int hardPity = data != null ? data.optInt("hardPity", DEFAULT_HARD_PITY) : DEFAULT_HARD_PITY;
        int charPity = data != null ? data.optInt("charPity5", 0) : 0;
        int weapPity = data != null ? data.optInt("weapPity5", 0) : 0;
        int charCopies = data != null ? data.optInt("charCopies", 1) : 1;
        int weapCopies = data != null ? data.optInt("weapCopies", 1) : 1;

        views.setViewVisibility(R.id.widget_pity_block_char, showChar ? View.VISIBLE : View.GONE);
        if (showChar) {
            views.setTextViewText(R.id.widget_pity_value_char, charPity + " / " + hardPity);
            views.setTextViewText(R.id.widget_pity_copies_char, "Copy Target: " + charCopies + " / " + MAX_CHAR_COPIES);
        }

        views.setViewVisibility(R.id.widget_pity_block_weap, showWeap ? View.VISIBLE : View.GONE);
        if (showWeap) {
            views.setTextViewText(R.id.widget_pity_value_weap, weapPity + " / " + hardPity);
            views.setTextViewText(R.id.widget_pity_copies_weap, "Copy Target: " + weapCopies + " / " + MAX_WEAP_COPIES);
        }
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
