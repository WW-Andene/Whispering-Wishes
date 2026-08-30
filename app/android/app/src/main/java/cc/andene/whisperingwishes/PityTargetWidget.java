package cc.andene.whisperingwishes;

import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.RemoteViews;

import org.json.JSONObject;

// Home-screen "pity + copy target" widget — mode 4 of the Calculator-widget series.
// Fixed 4x5 size (NOT resizable, same reasoning as TargetWidget.java's mode 3: this is a
// status readout, not a variable-length list). Read-only — RemoteViews has no input view
// at all, and there's nothing here for the user to edit; pity is tracked automatically
// from pull history and copy targets are set in CalculatorTab.jsx's Pity Counter card.
//
// Shows, for whichever pity track(s) TargetWidget.java (mode 3) currently has selected:
//   - Current pity / HARD_PITY (the SAME live pity CurrencyProgressWidget's (mode 2) bars
//     are computed against — state.profile.featured/weapon.pity5, tracked from actual
//     pull history, NOT CalculatorTab.jsx's separate manual "Pity Counter" input field,
//     which the user can freely override for hypothetical planning and would make this
//     widget's numbers inconsistent with mode 2's if used instead).
//   - The copy target the user is aiming for (state.calc.charCopies/weapCopies — max 7
//     for a Resonator's C0-C6 sequence, max 5 for a Weapon's R1-R5 refinement, see
//     CalculatorTab.jsx's own PityCounterInput usage).
// "Both" (mode 3) shows both blocks at once, splitting the widget's height evenly.
//
// Reads the exact same SharedPreferences blob (widget_currency_data) as modes 1/2, plus
// widget_target_mode (TargetWidget.TARGET_MODE_KEY) the same way mode 2 does.
public class PityTargetWidget extends AppWidgetProvider {
    private static final String TAG = "PityTargetWidget";
    private static final String PREFS_NAME = "CapacitorStorage";
    private static final String DATA_KEY = "widget_currency_data";
    // Kept in sync with widgetSync.js's CURRENCY_WIDGET_SCHEMA_VERSION.
    private static final int SCHEMA_VERSION = 4;
    private static final int DEFAULT_HARD_PITY = 80;
    private static final int MAX_CHAR_COPIES = 7; // C0-C6
    private static final int MAX_WEAP_COPIES = 5; // R1-R5

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        for (int appWidgetId : appWidgetIds) {
            updateWidget(context, appWidgetManager, appWidgetId);
        }
    }

    private void updateWidget(Context context, AppWidgetManager appWidgetManager, int appWidgetId) {
        try {
            renderWidget(context, appWidgetManager, appWidgetId);
        } catch (Throwable t) {
            Log.e(TAG, "updateWidget crashed", t);
            RemoteViews fallback = new RemoteViews(context.getPackageName(), R.layout.widget_pity_target);
            fallback.setTextViewText(R.id.widget_pity_value_char, "Widget error");
            appWidgetManager.updateAppWidget(appWidgetId, fallback);
        }
    }

    private void renderWidget(Context context, AppWidgetManager appWidgetManager, int appWidgetId) {
        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        JSONObject data = readData(prefs);
        String targetMode = prefs.getString(TargetWidget.TARGET_MODE_KEY, "char");
        boolean showChar = "char".equals(targetMode) || "both".equals(targetMode);
        boolean showWeap = "weap".equals(targetMode) || "both".equals(targetMode);

        int hardPity = data != null ? data.optInt("hardPity", DEFAULT_HARD_PITY) : DEFAULT_HARD_PITY;
        int charPity = data != null ? data.optInt("charPity5", 0) : 0;
        int weapPity = data != null ? data.optInt("weapPity5", 0) : 0;
        int charCopies = data != null ? data.optInt("charCopies", 1) : 1;
        int weapCopies = data != null ? data.optInt("weapCopies", 1) : 1;

        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.widget_pity_target);

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

    // Called from MainActivity.onResume() and TargetWidget's own tap handler (so this
    // widget's block visibility updates the instant mode 3's choice changes, same as
    // CurrencyProgressWidget.requestUpdate()).
    public static void requestUpdate(Context context) {
        Intent intent = new Intent(context, PityTargetWidget.class);
        intent.setAction(AppWidgetManager.ACTION_APPWIDGET_UPDATE);
        AppWidgetManager mgr = AppWidgetManager.getInstance(context);
        int[] ids = mgr.getAppWidgetIds(new ComponentName(context, PityTargetWidget.class));
        intent.putExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS, ids);
        context.sendBroadcast(intent);
    }
}
