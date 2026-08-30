package cc.andene.whisperingwishes;

import android.app.Activity;
import android.appwidget.AppWidgetManager;
import android.content.ComponentName;
import android.content.Intent;
import android.os.Build;
import android.os.Bundle;

// Trampoline target for the home-screen long-press App Shortcut declared in
// res/xml/shortcuts.xml ("Quick Soundtrack") — same "pin this widget to your home screen"
// system flow QuickCalcShortcutActivity already triggers for CalculatorWidget, here for
// SoundtrackWidget instead. See QuickCalcShortcutActivity's own file header for the full
// rationale (why a real Activity is needed at all, the fallback for API < 26 / an
// unsupported launcher, the AppTheme.Trampoline theme) — identical here, just a different
// widget provider.
public class QuickSoundtrackShortcutActivity extends Activity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        AppWidgetManager widgetManager = AppWidgetManager.getInstance(this);
        boolean pinned = false;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O && widgetManager.isRequestPinAppWidgetSupported()) {
            ComponentName provider = new ComponentName(this, SoundtrackWidget.class);
            pinned = widgetManager.requestPinAppWidget(provider, null, null);
        }
        if (!pinned) {
            startActivity(new Intent(this, MainActivity.class)
                .setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP));
        }
        finish();
    }
}
