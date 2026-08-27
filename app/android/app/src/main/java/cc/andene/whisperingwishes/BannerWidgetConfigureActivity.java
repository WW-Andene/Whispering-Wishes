package cc.andene.whisperingwishes;

import android.app.Activity;
import android.appwidget.AppWidgetManager;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.widget.Button;
import android.widget.Toast;

import org.json.JSONArray;

// Shown automatically by Android the moment the widget is placed on the
// home screen (declared via android:configure in banner_widget_info.xml
// and the ACTION_APPWIDGET_CONFIGURE intent-filter in the manifest) — lets
// the user pick which banner category (Resonator or Weapon) this widget
// instance shows. Reopened later, the exact same way, by the widget's own
// gear icon (BannerWidget.java's widget_settings PendingIntent) so the
// choice can be changed afterward too — that second entry point isn't part
// of the system placement flow, it's just a normal Activity launch with
// the same appWidgetId passed straight through.
//
// The choice is stored per-widget-instance (widget_category_<id>) since a
// user can place more than one of these widgets, each showing a different
// banner — not a single global setting.
public class BannerWidgetConfigureActivity extends Activity {
    private static final String PREFS_NAME = "CapacitorStorage";
    private int appWidgetId = AppWidgetManager.INVALID_APPWIDGET_ID;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        // Default result if the user backs out without picking anything —
        // standard AppWidget configure-Activity contract.
        setResult(RESULT_CANCELED);

        Intent intent = getIntent();
        if (intent != null) {
            appWidgetId = intent.getIntExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, AppWidgetManager.INVALID_APPWIDGET_ID);
        }
        if (appWidgetId == AppWidgetManager.INVALID_APPWIDGET_ID) {
            finish();
            return;
        }

        setContentView(R.layout.activity_banner_widget_configure);

        SharedPreferences prefs = getSharedPreferences(PREFS_NAME, MODE_PRIVATE);
        boolean[] available = availableCategories(prefs);

        Button characterBtn = findViewById(R.id.configure_character);
        Button weaponBtn = findViewById(R.id.configure_weapon);

        characterBtn.setEnabled(available[0]);
        weaponBtn.setEnabled(available[1]);
        if (!available[0]) characterBtn.setAlpha(0.4f);
        if (!available[1]) weaponBtn.setAlpha(0.4f);

        characterBtn.setOnClickListener(v -> {
            if (!available[0]) {
                Toast.makeText(this, R.string.widget_configure_unavailable, Toast.LENGTH_SHORT).show();
                return;
            }
            finishWithChoice("character");
        });
        weaponBtn.setOnClickListener(v -> {
            if (!available[1]) {
                Toast.makeText(this, R.string.widget_configure_unavailable, Toast.LENGTH_SHORT).show();
                return;
            }
            finishWithChoice("weapon");
        });
    }

    private boolean[] availableCategories(SharedPreferences prefs) {
        boolean[] result = { true, true }; // default to available — don't block the user on stale/missing sync data
        try {
            JSONArray arr = new JSONArray(prefs.getString("widget_cfg_available", "[\"character\",\"weapon\"]"));
            boolean hasChar = false, hasWeap = false;
            for (int i = 0; i < arr.length(); i++) {
                String v = arr.getString(i);
                if ("character".equals(v)) hasChar = true;
                if ("weapon".equals(v)) hasWeap = true;
            }
            result[0] = hasChar;
            result[1] = hasWeap;
        } catch (Exception ignored) {}
        return result;
    }

    private void finishWithChoice(String category) {
        SharedPreferences prefs = getSharedPreferences(PREFS_NAME, MODE_PRIVATE);
        prefs.edit().putString("widget_category_" + appWidgetId, category).apply();

        BannerWidget.requestUpdateSingle(this, appWidgetId);

        Intent resultValue = new Intent();
        resultValue.putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, appWidgetId);
        setResult(RESULT_OK, resultValue);
        finish();
    }
}
