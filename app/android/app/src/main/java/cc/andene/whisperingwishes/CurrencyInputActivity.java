package cc.andene.whisperingwishes;

import android.app.Activity;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.widget.EditText;
import android.widget.TextView;

// Opened from CalculatorWidget's own row-1 currency taps — RemoteViews home-screen widgets
// can't host a real EditText themselves (not on RemoteViews' supported-view allowlist, the
// same platform limit WidgetAssetUtils/PulseBannerWidget.java's own file headers document
// for images/video), so typing a currency value by hand means popping this small floating
// dialog Activity (AppTheme.WidgetInputDialog) over the home screen instead — prefilled
// with the currency's current value (widget-local override if the user's saved one here
// before, else whatever widgetSync.js last synced into widget_currency_data), passed in
// via the launching Intent's own extras rather than re-read here.
//
// Save writes a widget-local override (CalculatorWidget.CURRENCY_OVERRIDE_PREFIX + key, in
// the same CapacitorStorage SharedPreferences file every widget in this app shares) and
// re-renders every placed Calculator widget immediately — same override pattern as the
// copy-target pill's own cycling, just typed instead of tapped. That override sticks until
// the app's own next sync overwrites the underlying widget_currency_data value.
public class CurrencyInputActivity extends Activity {
    private static final String PREFS_NAME = "CapacitorStorage";
    static final String EXTRA_CURRENCY_KEY = "currencyKey";
    static final String EXTRA_CURRENCY_LABEL = "currencyLabel";
    static final String EXTRA_CURRENT_VALUE = "currentValue";
    private static final String CURRENCY_OVERRIDE_PREFIX = "widget_currency_override_";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        String key = getIntent().getStringExtra(EXTRA_CURRENCY_KEY);
        if (key == null) {
            finish();
            return;
        }
        String label = getIntent().getStringExtra(EXTRA_CURRENCY_LABEL);
        long currentValue = getIntent().getLongExtra(EXTRA_CURRENT_VALUE, 0);

        setContentView(R.layout.activity_currency_input);

        TextView title = findViewById(R.id.currency_input_title);
        title.setText(label != null ? label : key);

        EditText input = findViewById(R.id.currency_input_value);
        input.setText(String.valueOf(currentValue));
        input.setSelection(input.getText().length());
        input.requestFocus();

        findViewById(R.id.currency_input_cancel).setOnClickListener(v -> finish());
        findViewById(R.id.currency_input_save).setOnClickListener(v -> save(key, input));
    }

    private void save(String key, EditText input) {
        long value;
        try {
            value = Math.max(0, Long.parseLong(input.getText().toString().trim()));
        } catch (NumberFormatException e) {
            value = 0; // empty/garbage input — clearing to 0 beats silently discarding the tap
        }

        SharedPreferences prefs = getSharedPreferences(PREFS_NAME, MODE_PRIVATE);
        prefs.edit().putLong(CURRENCY_OVERRIDE_PREFIX + key, value).apply();

        CalculatorWidget.requestUpdate(this);
        finish();
    }
}
