package cc.andene.whisperingwishes;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.widget.RemoteViews;

// Home-screen widget showing the soonest-ending active event and a live
// countdown to it. The data comes from @capacitor/preferences's
// "CapacitorStorage" SharedPreferences file, written by
// src/utils/widgetSync.js whenever the app runs — this class only reads it,
// since a widget's RemoteViews process has no access to the app's WebView.
//
// Android enforces a 30-minute floor on updatePeriodMillis (see
// event_countdown_widget_info.xml) regardless of what's requested, so the
// countdown is only ever refreshed that often by the OS on its own —
// MainActivity.onResume() calls requestUpdate() below to also refresh
// immediately whenever the app is opened, which is the only other moment
// widget_end_iso can have changed.
public class EventCountdownWidget extends AppWidgetProvider {
    private static final String PREFS_NAME = "CapacitorStorage";
    private static final String KEY_TITLE = "widget_title";
    private static final String KEY_END_MILLIS = "widget_end_millis";

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        for (int appWidgetId : appWidgetIds) {
            updateWidget(context, appWidgetManager, appWidgetId);
        }
    }

    private void updateWidget(Context context, AppWidgetManager appWidgetManager, int appWidgetId) {
        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        String title = prefs.getString(KEY_TITLE, null);
        String endMillisStr = prefs.getString(KEY_END_MILLIS, null);

        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.widget_event_countdown);

        String countdownText = null;
        if (endMillisStr != null) {
            try {
                long remainingMs = Long.parseLong(endMillisStr) - System.currentTimeMillis();
                countdownText = formatRemaining(remainingMs);
            } catch (NumberFormatException ignored) {
                // Corrupt/stale value from an older app version — fall through to the empty state.
            }
        }

        if (title != null && countdownText != null) {
            views.setTextViewText(R.id.widget_title, title);
            views.setTextViewText(R.id.widget_countdown, countdownText);
        } else {
            views.setTextViewText(R.id.widget_title, context.getString(R.string.widget_no_event_title));
            views.setTextViewText(R.id.widget_countdown, context.getString(R.string.widget_no_event_subtitle));
        }

        Intent launchIntent = new Intent(context, MainActivity.class);
        PendingIntent pendingIntent = PendingIntent.getActivity(
                context, appWidgetId, launchIntent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        views.setOnClickPendingIntent(R.id.widget_root, pendingIntent);

        appWidgetManager.updateAppWidget(appWidgetId, views);
    }

    // "Ends in Xd Yh" / "Ends in Xh Ym" / "Ends in Xm" — already-expired
    // (negative) remainders fall back to null, which renders as the "no
    // event" empty state until widgetSync.js's next write clears it out.
    // Plain long arithmetic rather than java.time: this project's minSdk
    // (24) predates java.time (API 26) and doesn't enable core library
    // desugaring.
    private static String formatRemaining(long remainingMs) {
        if (remainingMs < 0) return null;
        long totalMinutes = remainingMs / 60000;
        long days = totalMinutes / (60 * 24);
        long hours = (totalMinutes / 60) % 24;
        long minutes = totalMinutes % 60;
        if (days > 0) return "Ends in " + days + "d " + hours + "h";
        if (hours > 0) return "Ends in " + hours + "h " + minutes + "m";
        return "Ends in " + minutes + "m";
    }

    // Called from MainActivity.onResume() so reopening the app refreshes the
    // widget sooner than the OS's own 30-minute floor would.
    public static void requestUpdate(Context context) {
        Intent intent = new Intent(context, EventCountdownWidget.class);
        intent.setAction(AppWidgetManager.ACTION_APPWIDGET_UPDATE);
        AppWidgetManager manager = AppWidgetManager.getInstance(context);
        int[] ids = manager.getAppWidgetIds(new ComponentName(context, EventCountdownWidget.class));
        if (ids.length == 0) return;
        intent.putExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS, ids);
        context.sendBroadcast(intent);
    }
}
