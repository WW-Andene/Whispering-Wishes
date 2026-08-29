package cc.andene.whisperingwishes;

import android.app.Activity;
import android.appwidget.AppWidgetManager;
import android.content.Intent;
import android.content.SharedPreferences;
import android.graphics.Bitmap;
import android.graphics.Color;
import android.graphics.drawable.GradientDrawable;
import android.os.Bundle;
import android.util.Log;
import android.view.Gravity;
import android.view.View;
import android.view.ViewGroup;
import android.widget.FrameLayout;
import android.widget.GridLayout;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.widget.Toast;

import org.json.JSONArray;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.List;

// Shown when a ConvenePlayerWidget is placed (android:configure in
// convene_player_widget_info.xml) or reopened via its own gear icon — a full-roster picker
// grid (every character with a convene animation, from widget_convene_roster — see
// widgetSync.js's syncConveneRoster), each tile with its own portrait thumbnail. Same
// picker-grid pattern as BannerWidgetConfigureActivity, simplified: one flat list, no
// category split, and no "unavailable, none active" state (the roster is static-ish, not
// tied to what's currently on a banner).
public class ConvenePlayerConfigureActivity extends Activity {
    private static final String TAG = "ConvenePlayerConfigure";
    private static final String PREFS_NAME = "CapacitorStorage";
    private static final int WIDGET_SCHEMA_VERSION = 2; // must match widgetSync.js/ConvenePlayerWidget
    private static final int TILE_ART_DP = 72;
    private int appWidgetId = AppWidgetManager.INVALID_APPWIDGET_ID;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setResult(RESULT_CANCELED);

        try {
            setUpContent();
        } catch (Throwable t) {
            Log.e(TAG, "Configure activity crashed", t);
            Toast.makeText(this, "Widget config error: " + t, Toast.LENGTH_LONG).show();
            finish();
        }
    }

    private void setUpContent() {
        Intent intent = getIntent();
        if (intent != null) {
            appWidgetId = intent.getIntExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, AppWidgetManager.INVALID_APPWIDGET_ID);
        }
        if (appWidgetId == AppWidgetManager.INVALID_APPWIDGET_ID) {
            Toast.makeText(this, "Widget config error: no appWidgetId in intent", Toast.LENGTH_LONG).show();
            finish();
            return;
        }

        setContentView(R.layout.activity_banner_widget_configure); // same generic title+grid layout

        SharedPreferences prefs = getSharedPreferences(PREFS_NAME, MODE_PRIVATE);
        GridLayout grid = findViewById(R.id.configure_grid);
        View empty = findViewById(R.id.configure_empty);

        List<ConvenePlayerWidget.Entry> roster = readRoster(prefs);
        if (roster.isEmpty()) {
            empty.setVisibility(View.VISIBLE);
            return;
        }
        for (ConvenePlayerWidget.Entry e : roster) {
            grid.addView(buildTile(e));
        }
    }

    private List<ConvenePlayerWidget.Entry> readRoster(SharedPreferences prefs) {
        List<ConvenePlayerWidget.Entry> out = new ArrayList<>();
        String json = prefs.getString("widget_convene_roster", null);
        if (json == null) return out;
        try {
            JSONObject blob = new JSONObject(json);
            if (blob.optInt("v", -1) != WIDGET_SCHEMA_VERSION) return out;
            JSONArray arr = blob.optJSONArray("roster");
            if (arr == null) return out;
            for (int i = 0; i < arr.length(); i++) {
                JSONObject o = arr.getJSONObject(i);
                out.add(new ConvenePlayerWidget.Entry(o.optString("name", null),
                        o.isNull("artAsset") ? null : o.optString("artAsset", null),
                        o.isNull("conveneUrl") ? null : o.optString("conveneUrl", null)));
            }
        } catch (Exception e) {
            Log.w(TAG, "Failed to parse widget_convene_roster for picker", e);
        }
        return out;
    }

    private View buildTile(ConvenePlayerWidget.Entry entry) {
        float density = getResources().getDisplayMetrics().density;
        int artPx = (int) (TILE_ART_DP * density);

        LinearLayout tile = new LinearLayout(this);
        tile.setOrientation(LinearLayout.VERTICAL);
        tile.setGravity(Gravity.CENTER);
        tile.setPadding((int) (4 * density), (int) (8 * density), (int) (4 * density), (int) (8 * density));
        tile.setClickable(true);
        tile.setFocusable(true);

        FrameLayout artFrame = new FrameLayout(this);
        GradientDrawable border = new GradientDrawable();
        border.setColor(Color.parseColor("#33FFFFFF"));
        border.setCornerRadius(10f * density);
        artFrame.setBackground(border);
        artFrame.setLayoutParams(new FrameLayout.LayoutParams(artPx, artPx));

        Bitmap art = entry.artAsset != null ? WidgetAssetUtils.decodeAsset(this, entry.artAsset, artPx) : null;
        if (art != null) {
            ImageView img = new ImageView(this);
            img.setImageBitmap(WidgetAssetUtils.roundedCorners(art, 10f * density));
            img.setScaleType(ImageView.ScaleType.CENTER_CROP);
            img.setLayoutParams(new FrameLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT));
            artFrame.addView(img);
        }

        TextView label = new TextView(this);
        label.setText(entry.name != null ? entry.name : "?");
        label.setTextColor(Color.WHITE);
        label.setTextSize(12);
        label.setMaxLines(1);
        label.setGravity(Gravity.CENTER);
        LinearLayout.LayoutParams labelParams = new LinearLayout.LayoutParams(artPx, ViewGroup.LayoutParams.WRAP_CONTENT);
        labelParams.topMargin = (int) (4 * density);
        label.setLayoutParams(labelParams);

        tile.addView(artFrame);
        tile.addView(label);

        LinearLayout.LayoutParams tileParams = new LinearLayout.LayoutParams(ViewGroup.LayoutParams.WRAP_CONTENT, ViewGroup.LayoutParams.WRAP_CONTENT);
        tile.setLayoutParams(tileParams);

        tile.setOnClickListener(v -> finishWithChoice(entry.name));
        return tile;
    }

    private void finishWithChoice(String name) {
        SharedPreferences prefs = getSharedPreferences(PREFS_NAME, MODE_PRIVATE);
        prefs.edit().putString("widget_convene_choice_" + appWidgetId, name).apply();

        ConvenePlayerWidget.requestUpdateSingle(this, appWidgetId);

        Intent resultValue = new Intent();
        resultValue.putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, appWidgetId);
        setResult(RESULT_OK, resultValue);
        finish();
    }
}
