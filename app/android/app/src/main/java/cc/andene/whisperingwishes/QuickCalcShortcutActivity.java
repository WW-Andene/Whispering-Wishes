package cc.andene.whisperingwishes;

import android.app.Activity;
import android.appwidget.AppWidgetManager;
import android.content.ComponentName;
import android.content.Intent;
import android.os.Build;
import android.os.Bundle;

// Trampoline target for the home-screen long-press App Shortcut declared in
// res/xml/shortcuts.xml ("Quick Calc") — this is NOT a shortcut into the app's own
// Calculator tab; it triggers Android's own "pin this widget to your home screen" system
// flow for CalculatorWidget (the adaptive home-screen widget in this same package), so the
// user gets the actual widget — currency log, goal gauge, target picker, pity + copy
// target — without having to find it in the system widget picker themselves. Same
// trampoline pattern as PullBubbleShortcutActivity: a shortcut Intent must name a real
// Activity, but there's nothing to actually show here, so this finishes immediately either
// way. Themed AppTheme.Trampoline (Theme.AppCompat.NoDisplay) so no flash of a blank
// window is visible in between.
//
// requestPinAppWidget() (and isRequestPinAppWidgetSupported()) only exist from API 26
// (Oreo) — below that, and on any launcher that doesn't support pinning at all, this falls
// back to just opening the app, since a shortcut that visibly does nothing reads as broken.
public class QuickCalcShortcutActivity extends Activity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        AppWidgetManager widgetManager = AppWidgetManager.getInstance(this);
        boolean pinned = false;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O && widgetManager.isRequestPinAppWidgetSupported()) {
            ComponentName provider = new ComponentName(this, CalculatorWidget.class);
            pinned = widgetManager.requestPinAppWidget(provider, null, null);
        }
        if (!pinned) {
            startActivity(new Intent(this, MainActivity.class)
                .setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP));
        }
        finish();
    }
}
