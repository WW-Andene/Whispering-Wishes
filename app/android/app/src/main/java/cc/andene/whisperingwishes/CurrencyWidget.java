package cc.andene.whisperingwishes;

import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.graphics.Bitmap;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.RemoteViews;

import org.json.JSONObject;

// Home-screen "currency log" widget — mode 1 of the Calculator-tab widget series (see
// CalculatorTab.jsx's Resources card for the web equivalent this mirrors: Astrite,
// Lunite, Radiant Tide, Lustrous Tide, Forging Tide). Read-only display, single narrow
// column (1 cell wide), resizable in height from 2 to 5 cells — Astrite/Lunite always
// shown, Radiant/Lustrous/Forging Tide appear one row at a time as the widget grows
// taller (onAppWidgetOptionsChanged below), same size-tiered-reveal pattern
// PulseBannerWidget.java already uses for its secondary block.
//
// Data comes from @capacitor/preferences's "CapacitorStorage" SharedPreferences file,
// written by src/utils/widgetSync.js's syncCurrencyWidget() whenever the Calculator
// tab's resource fields change — this class only reads it (see PulseBannerWidget.java's
// own file header for the full bridge explanation; same mechanism, different key).
// Icon bitmaps are decoded from the app's own bundled web assets (public/ui-icons/
// Currency-*.webp) via WidgetAssetUtils, since RemoteViews can't load an image by
// path/URL itself.
public class CurrencyWidget extends AppWidgetProvider {
    private static final String TAG = "CurrencyWidget";
    private static final String PREFS_NAME = "CapacitorStorage";
    private static final String DATA_KEY = "widget_currency_data";
    // Kept in sync with widgetSync.js's CURRENCY_WIDGET_SCHEMA_VERSION (currently 4 — bumped
    // for CurrencyProgressWidget.java's/PityTargetWidget.java's *Goal, pity-context, and
    // copy-target fields; this widget doesn't read any of those, but still must accept the
    // version they're written under).
    private static final int SCHEMA_VERSION = 4;
    private static final int ICON_PX = 48;

    // Android's own widget-grid formula (70dp * cells - 30dp) for 3/4/5 cells tall —
    // matches currency_widget_info.xml's minHeight (2 cells = 110dp) as the floor where
    // only Astrite+Lunite show; each threshold below reveals one more row.
    private static final int REVEAL_ROW3_DP = 180; // 3 cells
    private static final int REVEAL_ROW4_DP = 250; // 4 cells
    private static final int REVEAL_ROW5_DP = 320; // 5 cells

    private static final class Currency {
        final String key;      // JSON field in widget_currency_data
        final String asset;    // public/ui-icons/ path
        final int rowId, iconId, valueId;
        Currency(String key, String asset, int rowId, int iconId, int valueId) {
            this.key = key; this.asset = asset; this.rowId = rowId; this.iconId = iconId; this.valueId = valueId;
        }
    }

    // Order matches the widget's own top-to-bottom row order (and the reveal thresholds
    // above) — Astrite/Lunite are the two always-visible rows, the rest reveal in this order.
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
        // Fires whenever the user resizes the widget — re-render so rows 3-5 can
        // appear/disappear based on the new height.
        updateWidget(context, appWidgetManager, appWidgetId);
    }

    private void updateWidget(Context context, AppWidgetManager appWidgetManager, int appWidgetId) {
        // Same permanent safety net as PulseBannerWidget.updateWidget — a RemoteViews
        // process can fail for reasons unrelated to this class's own logic (Binder
        // transaction-size ceiling, a corrupt/foreign-format icon asset, etc.), so any
        // failure renders as visible text on the widget itself rather than the OS's
        // generic, undiagnosable "Couldn't load this widget" placeholder.
        try {
            renderWidget(context, appWidgetManager, appWidgetId);
        } catch (Throwable t) {
            Log.e(TAG, "updateWidget crashed", t);
            RemoteViews fallback = new RemoteViews(context.getPackageName(), R.layout.widget_currency);
            fallback.setTextViewText(R.id.widget_currency_value_astrite, "Widget error");
            appWidgetManager.updateAppWidget(appWidgetId, fallback);
        }
    }

    private void renderWidget(Context context, AppWidgetManager appWidgetManager, int appWidgetId) {
        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        JSONObject data = readData(prefs);

        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.widget_currency);

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
            views.setTextViewText(c.valueId, String.valueOf(value));

            Bitmap icon = WidgetAssetUtils.decodeAsset(context, c.asset, ICON_PX);
            if (icon != null) views.setImageViewBitmap(c.iconId, icon);
        }

        appWidgetManager.updateAppWidget(appWidgetId, views);
    }

    // Returns null (all currencies render as 0) if the blob is missing, malformed, or
    // from a schema version this build doesn't understand — failing closed here is safer
    // than guessing at a field that might not mean what this code expects (same
    // reasoning as PulseBannerWidget's own WIDGET_SCHEMA_VERSION check).
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
    // sooner than Android's own update-period floor — mirrors
    // PulseBannerWidget.requestUpdate() exactly.
    public static void requestUpdate(Context context) {
        Intent intent = new Intent(context, CurrencyWidget.class);
        intent.setAction(AppWidgetManager.ACTION_APPWIDGET_UPDATE);
        AppWidgetManager mgr = AppWidgetManager.getInstance(context);
        int[] ids = mgr.getAppWidgetIds(new android.content.ComponentName(context, CurrencyWidget.class));
        intent.putExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS, ids);
        context.sendBroadcast(intent);
    }
}
