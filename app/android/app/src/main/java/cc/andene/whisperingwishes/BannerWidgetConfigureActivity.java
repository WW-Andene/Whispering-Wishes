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

// Shown automatically by Android the moment the widget is placed on the
// home screen (declared via android:configure in banner_widget_info.xml
// and the ACTION_APPWIDGET_CONFIGURE intent-filter in the manifest) — lets
// the user pick ONE SPECIFIC currently-active banner (not just "Resonator
// vs Weapon" — an exact banner by name) for this widget instance to show.
// Reopened later, the exact same way, by the widget's own gear icon
// (PulseBannerWidget.java's widget_settings PendingIntent) so the choice
// can be changed afterward too — that second entry point isn't part of the
// system placement flow, it's just a normal Activity launch with the same
// appWidgetId passed straight through.
//
// The picker is a grid built entirely in Java (configure_grid in
// activity_banner_widget_configure.xml starts empty) — one tile per banner
// entry in widget_banners_data (both categories together, character AND
// weapon banners in the same grid), each with its own art thumbnail, since
// the whole point of per-widget custom choice is that the option list is
// dynamic (however many banners are actually live right now, occasionally
// 2+ concurrent phases per category), not a fixed pair of buttons.
//
// The choice is stored per-widget-instance (widget_choice_<id>, JSON
// {"category":..,"name":..}) since a user can place more than one of these
// widgets, each pinned to a different banner — including two widgets both
// showing DIFFERENT character banners, which the old category-only choice
// could never express.
public class BannerWidgetConfigureActivity extends Activity {
    private static final String TAG = "BannerWidgetConfigure";
    private static final String PREFS_NAME = "CapacitorStorage";
    private static final int WIDGET_SCHEMA_VERSION = 2; // must match PulseBannerWidget/widgetSync.js
    private static final int TILE_ART_DP = 72;
    private int appWidgetId = AppWidgetManager.INVALID_APPWIDGET_ID;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        // Default result if the user backs out without picking anything —
        // standard AppWidget configure-Activity contract.
        setResult(RESULT_CANCELED);

        // Temporary diagnostic wrapper: this Activity was observed rendering
        // as a totally blank navy screen (theme's windowBackground painted,
        // but zero views) with no way to pull logcat off the affected
        // device. Any exception here previously failed silently from the
        // user's perspective — this surfaces it as an on-screen Toast (which
        // outlives finish(), unlike the Activity's own views) so the actual
        // failure is visible without adb. Remove once the real cause here is
        // found and fixed.
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

        setContentView(R.layout.activity_banner_widget_configure);

        SharedPreferences prefs = getSharedPreferences(PREFS_NAME, MODE_PRIVATE);
        GridLayout grid = findViewById(R.id.configure_grid);
        View empty = findViewById(R.id.configure_empty);

        List<Choice> choices = new ArrayList<>();
        addChoices(prefs, "character", choices);
        addChoices(prefs, "weapon", choices);

        if (choices.isEmpty()) {
            empty.setVisibility(View.VISIBLE);
            return;
        }

        for (Choice c : choices) {
            grid.addView(buildTile(c));
        }
    }

    private static final class Choice {
        final String category;
        final String name;
        final String artAsset;
        Choice(String category, String name, String artAsset) {
            this.category = category;
            this.name = name;
            this.artAsset = artAsset;
        }
    }

    private void addChoices(SharedPreferences prefs, String category, List<Choice> out) {
        String json = prefs.getString("widget_banners_data", null);
        if (json == null) return;
        try {
            JSONObject blob = new JSONObject(json);
            if (blob.optInt("v", -1) != WIDGET_SCHEMA_VERSION) return;
            JSONArray arr = blob.optJSONArray(category + "s");
            if (arr == null) return;
            for (int i = 0; i < arr.length(); i++) {
                JSONObject entry = arr.getJSONObject(i);
                out.add(new Choice(category, entry.optString("name", null),
                        entry.isNull("artAsset") ? null : entry.optString("artAsset", null)));
            }
        } catch (Exception e) {
            Log.w(TAG, "Failed to parse widget_banners_data for picker", e);
        }
    }

    private View buildTile(Choice choice) {
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

        Bitmap art = choice.artAsset != null ? WidgetAssetUtils.decodeAsset(this, choice.artAsset, artPx) : null;
        if (art != null) {
            ImageView img = new ImageView(this);
            img.setImageBitmap(WidgetAssetUtils.roundedCorners(art, 10f * density));
            img.setScaleType(ImageView.ScaleType.CENTER_CROP);
            img.setLayoutParams(new FrameLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT));
            artFrame.addView(img);
        }

        TextView label = new TextView(this);
        label.setText(choice.name != null ? choice.name : "?");
        label.setTextColor(Color.WHITE);
        label.setTextSize(12);
        label.setMaxLines(1);
        label.setGravity(Gravity.CENTER);
        LinearLayout.LayoutParams labelParams = new LinearLayout.LayoutParams(artPx, ViewGroup.LayoutParams.WRAP_CONTENT);
        labelParams.topMargin = (int) (4 * density);
        label.setLayoutParams(labelParams);

        TextView categoryLabel = new TextView(this);
        categoryLabel.setText("weapon".equals(choice.category) ? "Weapon" : "Resonator");
        categoryLabel.setTextColor(Color.parseColor("#9CA3AF"));
        categoryLabel.setTextSize(10);
        categoryLabel.setGravity(Gravity.CENTER);
        categoryLabel.setLayoutParams(new LinearLayout.LayoutParams(artPx, ViewGroup.LayoutParams.WRAP_CONTENT));

        tile.addView(artFrame);
        tile.addView(label);
        tile.addView(categoryLabel);

        LinearLayout.LayoutParams tileParams = new LinearLayout.LayoutParams(ViewGroup.LayoutParams.WRAP_CONTENT, ViewGroup.LayoutParams.WRAP_CONTENT);
        tile.setLayoutParams(tileParams);

        tile.setOnClickListener(v -> finishWithChoice(choice.category, choice.name));
        return tile;
    }

    private void finishWithChoice(String category, String name) {
        SharedPreferences prefs = getSharedPreferences(PREFS_NAME, MODE_PRIVATE);
        JSONObject choiceJson = new JSONObject();
        try {
            choiceJson.put("category", category);
            choiceJson.put("name", name);
        } catch (Exception ignored) {}
        prefs.edit()
                .putString("widget_choice_" + appWidgetId, choiceJson.toString())
                // Kept for anything still reading the old key directly (defensive — nothing in
                // this codebase does any more, but it's a cheap, harmless compatibility write).
                .putString("widget_category_" + appWidgetId, category)
                .apply();

        PulseBannerWidget.requestUpdateSingle(this, appWidgetId);

        Intent resultValue = new Intent();
        resultValue.putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, appWidgetId);
        setResult(RESULT_OK, resultValue);
        finish();
    }
}
