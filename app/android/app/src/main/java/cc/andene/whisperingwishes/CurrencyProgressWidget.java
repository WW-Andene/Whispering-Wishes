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
// (see CurrencyWidget.java, mode 1, for the plain-log version this builds on). Shows the
// same five tracked currencies as a filled progress bar toward a per-currency goal the
// user sets in CalculatorTab.jsx's new "Home Screen Widget Goals" block, instead of just
// a bare number. 2 cells wide (room for icon + value text + a readable bar), resizable
// in height from 2 to 5 cells — Astrite/Lunite always shown, the three Tides reveal one
// row at a time as the widget grows, same size-tiered-reveal pattern as mode 1 and
// PulseBannerWidget.java's own secondary block.
//
// Reads the exact same SharedPreferences blob (widget_currency_data) that mode 1 reads —
// widgetSync.js's syncCurrencyWidget() writes both currencies AND goals into one payload,
// so there's nothing extra to sync for this widget specifically.
public class CurrencyProgressWidget extends AppWidgetProvider {
    private static final String TAG = "CurrencyProgressWidget";
    private static final String PREFS_NAME = "CapacitorStorage";
    private static final String DATA_KEY = "widget_currency_data";
    // Kept in sync with widgetSync.js's CURRENCY_WIDGET_SCHEMA_VERSION.
    private static final int SCHEMA_VERSION = 2;
    private static final int ICON_PX = 40;

    // Same 70dp*cells-30dp grid math as CurrencyWidget.java's reveal thresholds.
    private static final int REVEAL_ROW3_DP = 180; // 3 cells
    private static final int REVEAL_ROW4_DP = 250; // 4 cells
    private static final int REVEAL_ROW5_DP = 320; // 5 cells

    private static final class Currency {
        final String key, goalKey, asset;
        final int rowId, iconId, valueId, barId;
        Currency(String key, String goalKey, String asset, int rowId, int iconId, int valueId, int barId) {
            this.key = key; this.goalKey = goalKey; this.asset = asset;
            this.rowId = rowId; this.iconId = iconId; this.valueId = valueId; this.barId = barId;
        }
    }

    private static final Currency[] CURRENCIES = {
        new Currency("astrite", "astriteGoal", "ui-icons/Currency-Astrite.webp",
            R.id.widget_progress_row_astrite, R.id.widget_progress_icon_astrite, R.id.widget_progress_value_astrite, R.id.widget_progress_bar_astrite),
        new Currency("lunite", "luniteGoal", "ui-icons/Currency-Lunite.webp",
            R.id.widget_progress_row_lunite, R.id.widget_progress_icon_lunite, R.id.widget_progress_value_lunite, R.id.widget_progress_bar_lunite),
        new Currency("radiant", "radiantGoal", "ui-icons/Currency-Radiant-Tide.webp",
            R.id.widget_progress_row_radiant, R.id.widget_progress_icon_radiant, R.id.widget_progress_value_radiant, R.id.widget_progress_bar_radiant),
        new Currency("lustrous", "lustrousGoal", "ui-icons/Currency-Lustrous-Tide.webp",
            R.id.widget_progress_row_lustrous, R.id.widget_progress_icon_lustrous, R.id.widget_progress_value_lustrous, R.id.widget_progress_bar_lustrous),
        new Currency("forging", "forgingGoal", "ui-icons/Currency-Forging-Tide.webp",
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
            long goal = data != null ? data.optLong(c.goalKey, 0) : 0;
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
