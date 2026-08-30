package cc.andene.whisperingwishes;

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

// Home-screen "currency progress" widget — mode 2 of the Calculator-tab widget series
// (see CurrencyWidget.java, mode 1, for the plain-log version this builds on). 2 cells
// wide (room for icon + value text + a readable bar), resizable in height from 2 to 5
// cells — Astrite/Lunite always shown, the three Tides reveal one row at a time as the
// widget grows, same size-tiered-reveal pattern as mode 1 and PulseBannerWidget.java's
// own secondary block.
//
// Each bar's 100% mark is, in priority order:
//   1. DYNAMIC — "currency needed to reach the guaranteed pity pull" for whichever pity
//      track(s) TargetWidget.java (mode 3) has selected (Resonator/Weapon/Both), computed
//      from the current pity + HARD_PITY + ASTRITE_PER_PULL synced alongside the raw
//      currency counts. Astrite/Lunite (interchangeable 1:1 for pulls, see
//      CalculatorTab.jsx's own combined-convenes math) track whichever pity track(s) are
//      selected; Radiant Tide tracks the Resonator pity specifically (it's spent 1-per-pull
//      on the featured character banner only); Forging Tide tracks the Weapon pity
//      specifically, the same way.
//   2. MANUAL FALLBACK — the plain per-currency goal the user typed into CalculatorTab.jsx's
//      "Home Screen Widget Goals" block, used whenever (1) doesn't apply: Lustrous Tide
//      (standard banner — outside mode 3's Resonator/Weapon/Both choice entirely), or any
//      currency when pity data hasn't synced yet (no profile imported).
//   3. NONE — 0%, "no goal set" — when neither of the above produced a positive goal.
//
// Reads the exact same SharedPreferences blob (widget_currency_data) that mode 1 reads,
// plus widget_target_mode (a plain string, "char"|"weap"|"both") written directly by
// TargetWidget.java's own button taps — not part of the JSON blob since that one changes
// on every widget tap, independent of whenever the app itself last synced.
public class CurrencyProgressWidget extends AppWidgetProvider {
    private static final String TAG = "CurrencyProgressWidget";
    private static final String PREFS_NAME = "CapacitorStorage";
    private static final String DATA_KEY = "widget_currency_data";
    // Kept in sync with widgetSync.js's CURRENCY_WIDGET_SCHEMA_VERSION.
    private static final int SCHEMA_VERSION = 3;
    private static final int ICON_PX = 40;
    // Defaults used only if an old/missing payload has no pity context at all — real
    // values always come from the synced blob once the app has run at least once.
    private static final int DEFAULT_HARD_PITY = 80;
    private static final int DEFAULT_ASTRITE_PER_PULL = 160;

    // Same 70dp*cells-30dp grid math as CurrencyWidget.java's reveal thresholds.
    private static final int REVEAL_ROW3_DP = 180; // 3 cells
    private static final int REVEAL_ROW4_DP = 250; // 4 cells
    private static final int REVEAL_ROW5_DP = 320; // 5 cells

    // Which pity track(s) a currency's dynamic goal draws from — see this class's own
    // header for why Astrite/Lunite pull from whichever track(s) mode 3 selected, while
    // Radiant/Forging Tide are pinned to one specific track regardless of mode 3's choice.
    private enum PityTrack { EITHER, CHAR_ONLY, WEAP_ONLY, NONE }

    private static final class Currency {
        final String key, goalKey, asset;
        final PityTrack track;
        final int rowId, iconId, valueId, barId;
        Currency(String key, String goalKey, String asset, PityTrack track, int rowId, int iconId, int valueId, int barId) {
            this.key = key; this.goalKey = goalKey; this.asset = asset; this.track = track;
            this.rowId = rowId; this.iconId = iconId; this.valueId = valueId; this.barId = barId;
        }
    }

    private static final Currency[] CURRENCIES = {
        new Currency("astrite", "astriteGoal", "ui-icons/Currency-Astrite.webp", PityTrack.EITHER,
            R.id.widget_progress_row_astrite, R.id.widget_progress_icon_astrite, R.id.widget_progress_value_astrite, R.id.widget_progress_bar_astrite),
        new Currency("lunite", "luniteGoal", "ui-icons/Currency-Lunite.webp", PityTrack.EITHER,
            R.id.widget_progress_row_lunite, R.id.widget_progress_icon_lunite, R.id.widget_progress_value_lunite, R.id.widget_progress_bar_lunite),
        new Currency("radiant", "radiantGoal", "ui-icons/Currency-Radiant-Tide.webp", PityTrack.CHAR_ONLY,
            R.id.widget_progress_row_radiant, R.id.widget_progress_icon_radiant, R.id.widget_progress_value_radiant, R.id.widget_progress_bar_radiant),
        new Currency("lustrous", "lustrousGoal", "ui-icons/Currency-Lustrous-Tide.webp", PityTrack.NONE,
            R.id.widget_progress_row_lustrous, R.id.widget_progress_icon_lustrous, R.id.widget_progress_value_lustrous, R.id.widget_progress_bar_lustrous),
        new Currency("forging", "forgingGoal", "ui-icons/Currency-Forging-Tide.webp", PityTrack.WEAP_ONLY,
            R.id.widget_progress_row_forging, R.id.widget_progress_icon_forging, R.id.widget_progress_value_forging, R.id.widget_progress_bar_forging),
    };

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        for (int appWidgetId : appWidgetIds) {
            updateWidget(context, appWidgetManager, appWidgetId);
        }
    }

    @Override
    public void onAppWidgetOptionsChanged(Context context, AppWidgetManager appWidgetManager, int appWidgetId, Bundle newOptions) {
        updateWidget(context, appWidgetManager, appWidgetId);
    }

    private void updateWidget(Context context, AppWidgetManager appWidgetManager, int appWidgetId) {
        try {
            renderWidget(context, appWidgetManager, appWidgetId);
        } catch (Throwable t) {
            Log.e(TAG, "updateWidget crashed", t);
            RemoteViews fallback = new RemoteViews(context.getPackageName(), R.layout.widget_currency_progress);
            fallback.setTextViewText(R.id.widget_progress_value_astrite, "Widget error");
            appWidgetManager.updateAppWidget(appWidgetId, fallback);
        }
    }

    private void renderWidget(Context context, AppWidgetManager appWidgetManager, int appWidgetId) {
        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        JSONObject data = readData(prefs);
        // "char" (Resonator only), "weap" (Weapon only), or "both" — written by
        // TargetWidget.java, independent of the app's own sync cadence.
        String targetMode = prefs.getString(TargetWidget.TARGET_MODE_KEY, "char");

        int hardPity = data != null ? data.optInt("hardPity", DEFAULT_HARD_PITY) : DEFAULT_HARD_PITY;
        int astritePerPull = data != null ? data.optInt("astritePerPull", DEFAULT_ASTRITE_PER_PULL) : DEFAULT_ASTRITE_PER_PULL;
        int charPity = data != null ? data.optInt("charPity5", 0) : 0;
        int weapPity = data != null ? data.optInt("weapPity5", 0) : 0;
        int charPullsLeft = Math.max(0, hardPity - charPity);
        int weapPullsLeft = Math.max(0, hardPity - weapPity);
        boolean wantChar = "char".equals(targetMode) || "both".equals(targetMode);
        boolean wantWeap = "weap".equals(targetMode) || "both".equals(targetMode);
        // EITHER (Astrite/Lunite): sum whichever track(s) mode 3 selected — "both" needs
        // enough currency to cover both banners' remaining pulls. CHAR_ONLY/WEAP_ONLY
        // (Radiant/Forging Tide): only meaningful if that specific banner is part of the
        // current selection at all; otherwise there's no dynamic goal for that currency.
        int eitherPullsLeft = (wantChar ? charPullsLeft : 0) + (wantWeap ? weapPullsLeft : 0);

        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.widget_currency_progress);

        Bundle options = appWidgetManager.getAppWidgetOptions(appWidgetId);
        int heightDp = options != null ? options.getInt(AppWidgetManager.OPTION_APPWIDGET_MAX_HEIGHT, 0) : 0;

        for (int i = 0; i < CURRENCIES.length; i++) {
            Currency c = CURRENCIES[i];
            boolean visible = i < 2
                || (i == 2 && heightDp >= REVEAL_ROW3_DP)
                || (i == 3 && heightDp >= REVEAL_ROW4_DP)
                || (i == 4 && heightDp >= REVEAL_ROW5_DP);
            views.setViewVisibility(c.rowId, visible ? View.VISIBLE : View.GONE);
            if (!visible) continue;

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
                    break; // Lustrous Tide (standard banner) — mode 3 doesn't apply, manual goal only
            }
            long goal = dynamicGoal > 0 ? dynamicGoal : manualGoal;
            int percent = goal > 0 ? (int) Math.min(100, Math.round(value * 100.0 / goal)) : 0;

            views.setTextViewText(c.valueId, goal > 0
                ? value + " / " + goal
                : String.valueOf(value));
            views.setProgressBar(c.barId, 100, percent, false);

            Bitmap icon = WidgetAssetUtils.decodeAsset(context, c.asset, ICON_PX);
            if (icon != null) views.setImageViewBitmap(c.iconId, icon);
        }

        appWidgetManager.updateAppWidget(appWidgetId, views);
    }

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

    // Called from MainActivity.onResume() — mirrors CurrencyWidget.requestUpdate().
    public static void requestUpdate(Context context) {
        Intent intent = new Intent(context, CurrencyProgressWidget.class);
        intent.setAction(AppWidgetManager.ACTION_APPWIDGET_UPDATE);
        AppWidgetManager mgr = AppWidgetManager.getInstance(context);
        int[] ids = mgr.getAppWidgetIds(new ComponentName(context, CurrencyProgressWidget.class));
        intent.putExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS, ids);
        context.sendBroadcast(intent);
    }
}
