package cc.andene.whisperingwishes;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.widget.RemoteViews;

// Home-screen "pull target" widget — mode 3 of the Calculator-tab widget series. Fixed
// 3x5 size (NOT resizable, unlike modes 1/2 — three big tappable choices don't have a
// meaningful smaller/larger layout the way a variable-length currency list does), letting
// the user pick which pity track(s) they're pulling for: Resonator, Both, or Weapon —
// mirrors CalculatorTab.jsx's own char/weap/both selectedBanner buttons.
//
// This choice has exactly one consumer: CurrencyProgressWidget.java (mode 2) reads it
// (via TARGET_MODE_KEY, a plain string in the same "CapacitorStorage" SharedPreferences
// file every widget in this app shares) to decide which pity track(s) its Astrite/Lunite/
// Radiant/Forging Tide progress bars are computing "currency needed to reach guaranteed"
// against — see that class's own header for the full breakdown. Tapping a choice here
// writes the pref directly (no round trip through the app or JS at all — this is the one
// piece of widget state that's arguably app data, but it's purely a display filter for
// mode 2, not real profile data, so keeping it native-only avoids needing a way for a
// RemoteViews tap to talk to a possibly-not-running JS process) and immediately refreshes
// both this widget (to move the selection highlight) and mode 2 (to recompute its bars).
public class TargetWidget extends AppWidgetProvider {
    private static final String PREFS_NAME = "CapacitorStorage";
    static final String TARGET_MODE_KEY = "widget_target_mode"; // "char" | "weap" | "both"
    private static final String ACTION_SET_TARGET = "cc.andene.whisperingwishes.ACTION_SET_TARGET";
    private static final String EXTRA_MODE = "mode";

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        for (int appWidgetId : appWidgetIds) {
            renderWidget(context, appWidgetManager, appWidgetId);
        }
    }

    @Override
    public void onReceive(Context context, Intent intent) {
        // Handle the button taps' own broadcast before falling through to
        // AppWidgetProvider's normal onReceive (which dispatches
        // APPWIDGET_UPDATE/DELETED/etc. into onUpdate/onDeleted/...) — a custom action
        // outside that whitelist would otherwise just be silently ignored by the base
        // class, not misrouted, but routing it here explicitly is clearer than relying
        // on that fallthrough behavior.
        if (ACTION_SET_TARGET.equals(intent.getAction())) {
            String mode = intent.getStringExtra(EXTRA_MODE);
            if (mode != null) {
                context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
                    .edit().putString(TARGET_MODE_KEY, mode).apply();
                AppWidgetManager mgr = AppWidgetManager.getInstance(context);
                for (int id : mgr.getAppWidgetIds(new ComponentName(context, TargetWidget.class))) {
                    renderWidget(context, mgr, id);
                }
                // The whole point of this widget: tell modes 2 and 4 to recompute/redraw
                // against the newly-selected pity track(s) right away.
                CurrencyProgressWidget.requestUpdate(context);
                PityTargetWidget.requestUpdate(context);
            }
            return;
        }
        super.onReceive(context, intent);
    }

    private void renderWidget(Context context, AppWidgetManager appWidgetManager, int appWidgetId) {
        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        String current = prefs.getString(TARGET_MODE_KEY, "char");

        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.widget_target);

        setChoice(context, views, appWidgetId, R.id.widget_target_char, "char", current);
        setChoice(context, views, appWidgetId, R.id.widget_target_both, "both", current);
        setChoice(context, views, appWidgetId, R.id.widget_target_weap, "weap", current);

        appWidgetManager.updateAppWidget(appWidgetId, views);
    }

    // Each button's own selected/unselected background is baked into the layout as two
    // stacked drawables (widget_target_choice_selected/_unselected) toggled via
    // setViewVisibility, same GONE/VISIBLE-swap approach used everywhere else in these
    // widgets — RemoteViews can't runtime-swap a view's background drawable resource
    // directly (no setBackgroundResource in its allowed method whitelist).
    private void setChoice(Context context, RemoteViews views, int appWidgetId, int buttonId, String mode, String current) {
        boolean selected = mode.equals(current);
        views.setViewVisibility(selectedOverlayId(buttonId), selected ? android.view.View.VISIBLE : android.view.View.GONE);

        Intent intent = new Intent(context, TargetWidget.class);
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

    // Called from MainActivity.onResume() — mirrors CurrencyWidget.requestUpdate().
    public static void requestUpdate(Context context) {
        Intent intent = new Intent(context, TargetWidget.class);
        intent.setAction(AppWidgetManager.ACTION_APPWIDGET_UPDATE);
        AppWidgetManager mgr = AppWidgetManager.getInstance(context);
        int[] ids = mgr.getAppWidgetIds(new ComponentName(context, TargetWidget.class));
        intent.putExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS, ids);
        context.sendBroadcast(intent);
    }
}
