package cc.andene.whisperingwishes;

import android.app.Activity;
import android.content.SharedPreferences;
import android.graphics.Bitmap;
import android.graphics.Color;
import android.graphics.drawable.GradientDrawable;
import android.net.Uri;
import android.os.Bundle;
import android.view.Gravity;
import android.view.View;
import android.view.ViewGroup;
import android.view.WindowManager;
import android.widget.FrameLayout;
import android.widget.GridLayout;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.ScrollView;
import android.widget.TextView;
import android.widget.VideoView;

import org.json.JSONObject;

import java.util.List;
import java.util.Locale;

// Launched by the widget's ×1/×10 buttons (PulseBannerWidget.java) — rolls a
// pull entirely natively (WidgetPullSimulator.java, no app launch), plays
// the matching rarity clip (bundled locally under public/convene-sim/,
// unlike convene-animations/ — see capacitor-build/build.mjs's
// EXCLUDED_DIRS), then shows a pre-rendered results grid built here in
// Java rather than reusing the app's own React ConvenePullSimModal (which
// would require launching the WebView — the whole point of this native
// path is not doing that).
//
// "Pre-rendered" both ways: the rarity video is a small bundled local
// asset (no network/buffering), and the result screen is plain Views built
// synchronously from data already known by the time the video ends — no
// loading state of its own.
public class WidgetPullActivity extends Activity {
    private static final String PREFS_NAME = "CapacitorStorage";
    private static final int TILE_SIZE_DP = 56;

    private WidgetPullSimulator.PullSimResult simResult;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        setContentView(R.layout.activity_widget_pull);

        int count = getIntent().getIntExtra(EXTRA_COUNT, 1);
        String category = getIntent().getStringExtra(EXTRA_CATEGORY);
        if (category == null) category = "character";
        String name = getIntent().getStringExtra(EXTRA_NAME);
        simResult = WidgetPullSimulator.roll(this, category, name, count);

        View root = findViewById(R.id.pull_root);
        root.setOnClickListener(v -> {
            View resultsScroll = findViewById(R.id.pull_results_scroll);
            if (resultsScroll.getVisibility() == View.VISIBLE) finish();
        });

        playRarityVideo();
    }

    private void playRarityVideo() {
        VideoView videoView = findViewById(R.id.pull_video);
        String uri = "file:///android_asset/public/convene-sim/" + simResult.video + ".mp4";
        try {
            videoView.setVideoURI(Uri.parse(uri));
            videoView.setOnPreparedListener(mp -> {
                mp.setLooping(false);
                videoView.start();
            });
            videoView.setOnCompletionListener(mp -> showResults());
            videoView.setOnErrorListener((mp, what, extra) -> {
                showResults();
                return true;
            });
        } catch (Exception e) {
            showResults();
        }
    }

    private void showResults() {
        VideoView videoView = findViewById(R.id.pull_video);
        videoView.setVisibility(View.GONE);

        TextView title = findViewById(R.id.pull_results_title);
        title.setText(getString(R.string.widget_pull_results_title, simResult.results.size()));

        GridLayout grid = findViewById(R.id.pull_results_grid);
        grid.removeAllViews();

        SharedPreferences prefs = getSharedPreferences(PREFS_NAME, MODE_PRIVATE);
        JSONObject assetMap;
        try {
            assetMap = new JSONObject(prefs.getString("widget_pull_asset_map", "{}"));
        } catch (Exception e) {
            assetMap = new JSONObject();
        }

        float density = getResources().getDisplayMetrics().density;
        int tilePx = (int) (TILE_SIZE_DP * density);
        int marginPx = (int) (6 * density);

        for (WidgetPullSimulator.PullResult result : simResult.results) {
            grid.addView(buildTile(result, assetMap, tilePx, marginPx));
        }

        findViewById(R.id.pull_results_scroll).setVisibility(View.VISIBLE);
    }

    private View buildTile(WidgetPullSimulator.PullResult result, JSONObject assetMap, int tilePx, int marginPx) {
        LinearLayout tile = new LinearLayout(this);
        tile.setOrientation(LinearLayout.VERTICAL);
        tile.setGravity(Gravity.CENTER);

        FrameLayout imageFrame = new FrameLayout(this);
        GradientDrawable border = new GradientDrawable();
        border.setColor(Color.parseColor("#40000000"));
        border.setStroke((int) (1 * getResources().getDisplayMetrics().density), rarityColor(result.rarity));
        border.setCornerRadius(8 * getResources().getDisplayMetrics().density);
        imageFrame.setBackground(border);
        imageFrame.setLayoutParams(new FrameLayout.LayoutParams(tilePx, tilePx));

        String assetPath = result.name != null ? assetMap.optString(result.name, null) : null;
        Bitmap bitmap = assetPath != null ? WidgetAssetUtils.decodeAsset(this, assetPath, tilePx) : null;
        if (bitmap != null) {
            ImageView img = new ImageView(this);
            img.setImageBitmap(bitmap);
            img.setScaleType(ImageView.ScaleType.CENTER_CROP);
            img.setLayoutParams(new FrameLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT));
            imageFrame.addView(img);
        }

        TextView badge = new TextView(this);
        badge.setText(String.format(Locale.US, "%d★", result.rarity));
        badge.setTextColor(rarityColor(result.rarity));
        badge.setTextSize(11);
        badge.setGravity(Gravity.CENTER);
        LinearLayout.LayoutParams badgeParams = new LinearLayout.LayoutParams(ViewGroup.LayoutParams.WRAP_CONTENT, ViewGroup.LayoutParams.WRAP_CONTENT);
        badgeParams.topMargin = (int) (2 * getResources().getDisplayMetrics().density);
        badge.setLayoutParams(badgeParams);

        tile.addView(imageFrame);
        tile.addView(badge);

        LinearLayout.LayoutParams tileParams = new LinearLayout.LayoutParams(ViewGroup.LayoutParams.WRAP_CONTENT, ViewGroup.LayoutParams.WRAP_CONTENT);
        tileParams.setMargins(marginPx, marginPx, marginPx, marginPx);
        tile.setLayoutParams(tileParams);
        return tile;
    }

    private int rarityColor(int rarity) {
        switch (rarity) {
            case 5: return Color.parseColor("#EAB308");
            case 4: return Color.parseColor("#A855F7");
            default: return Color.parseColor("#38BDF8");
        }
    }

    public static final String EXTRA_COUNT = "widget_pull_count";
    public static final String EXTRA_CATEGORY = "widget_pull_category";
    // The specific banner name this widget instance is configured to (may be null for a
    // pre-custom-choice widget with no pinned name — WidgetPullSimulator falls back to the
    // category's first active banner in that case).
    public static final String EXTRA_NAME = "widget_pull_name";
}
