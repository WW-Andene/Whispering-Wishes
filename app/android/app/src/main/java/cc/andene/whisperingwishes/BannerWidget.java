package cc.andene.whisperingwishes;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.graphics.Bitmap;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.RemoteViews;

import org.json.JSONArray;
import org.json.JSONObject;

// Home-screen "gacha banner" widget — the featured character/weapon banner
// (art, name, Featured 4★ row, ×1/×10 pull-sim buttons, ▶️ convene-
// animation button), mirroring BannerCard.jsx as closely as RemoteViews
// allows. Which banner category a given widget instance shows is picked at
// placement time (BannerWidgetConfigureActivity.java, android:configure in
// banner_widget_info.xml) and changeable afterward via the widget's own
// gear icon — stored per-appWidgetId (widget_category_<id>), since more
// than one of these widgets can be placed at once, each independently
// configured.
//
// Resizing a widget tall enough (onAppWidgetOptionsChanged below) also
// reveals a second, secondary banner block showing whichever category
// ISN'T the configured primary one — display-only, no pull-sim buttons on
// that block, just art/name/Featured-4★/▶️.
//
// RemoteViews platform limits (this is not a guess — it's enforced by the
// OS itself, since a widget is drawn by the launcher app's process, not
// ours): only a fixed whitelist of views can be inflated (no WebView, no
// VideoView, no custom Views), and images must be delivered as an actual
// Bitmap (via setImageViewBitmap) or a resource id — a widget process can't
// load arbitrary URLs/paths itself, so this class decodes bitmaps here
// (from the app's own bundled assets, since it runs in the app's process)
// and hands the launcher finished pixels. That's also why the ▶️ button
// can't play video in place — it launches ConveneAnimationActivity instead,
// a real Activity (VideoView works fine there).
//
// Data comes from @capacitor/preferences's "CapacitorStorage" SharedPreferences
// file, written by src/utils/widgetSync.js's syncBannerWidget() whenever the
// featured banners change — this class only reads it.
//
// Each category's render fields (name/title/art/featured4/convene url) are
// read from ONE JSON blob (widget_banner_<category>_data), not five separate
// keys — widgetSync.js writes that blob with a single atomic Preferences.set
// call. This matters because this class's own trigger (requestUpdate(),
// called from MainActivity.onResume()) and widgetSync.js's write are two
// independent, unsynchronized events; if they were still five separate keys,
// a render landing mid-write could read a mix of old+new fields (new art
// with the old name, etc.). With one blob, a render always sees either the
// fully-old or fully-new payload — never a partial one — regardless of
// timing. WIDGET_SCHEMA_VERSION guards against a version mismatch (an
// updated app's payload shape read by logic from before it changed): a
// missing/wrong version is treated the same as no data at all rather than
// risking a field access that no longer means what this code expects.
public class BannerWidget extends AppWidgetProvider {
    private static final String TAG = "BannerWidget";
    private static final String PREFS_NAME = "CapacitorStorage";
    private static final int WIDGET_SCHEMA_VERSION = 1;
    // Longest-side decode target for the banner art background. This used to
    // be 800 — at ARGB_8888 (4 bytes/px) that's up to ~2.4MB for ONE bitmap,
    // and RemoteViews.setImageViewBitmap() serializes it whole into the
    // Binder IPC transaction sent to the launcher process (~1MB combined
    // ceiling across everything in that transaction — easily two art
    // bitmaps at once, primary + secondary block). Past that ceiling the
    // launcher's own apply of the RemoteViews throws
    // TransactionTooLargeException and the widget is left showing Android's
    // generic "couldn't load this widget" placeholder — which reads as the
    // widget being completely broken, and tapping that placeholder is what
    // removes it. 240px + RGB_565 (see decodeAsset's config param below)
    // keeps a single art bitmap safely under ~115KB while still looking
    // sharp at the size this widget actually renders art at.
    private static final int ART_PX = 240;
    private static final int THUMB_PX = 96; // decode target for the 30dp featured-4★ thumbnails
    private static final int PILL_ICON_PX = 40; // decode target for the 14dp ×1/×10 currency icons
    // Same bundled asset ConvenePullPills.jsx's ASTRITE_ICON constant uses —
    // always shown here (unlike the in-app pill, this doesn't know whether
    // the player has a tide currency entered in Calculator) since it's
    // always a valid fallback.
    private static final String ASTRITE_ICON_ASSET = "ui-icons/Currency-Astrite.webp";
    // Height (dp) a widget needs before the secondary banner block is worth
    // showing — two ~130dp blocks plus some breathing room.
    private static final int SECONDARY_MIN_HEIGHT_DP = 260;

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        for (int appWidgetId : appWidgetIds) {
            updateWidget(context, appWidgetManager, appWidgetId);
        }
    }

    @Override
    public void onAppWidgetOptionsChanged(Context context, AppWidgetManager appWidgetManager, int appWidgetId, Bundle newOptions) {
        // Fires whenever the user resizes the widget — re-render so the
        // secondary block can appear/disappear based on the new size.
        updateWidget(context, appWidgetManager, appWidgetId);
    }

    private void updateWidget(Context context, AppWidgetManager appWidgetManager, int appWidgetId) {
        // This widget was once observed stuck on Android's own generic
        // "couldn't load this widget" placeholder on an affected device,
        // with no way to pull logcat off it — root-caused since to a data
        // race between this class's own render and widgetSync.js's
        // multi-key write (fixed above: readBannerData() now reads one
        // atomic JSON blob per category instead of five separately-written
        // keys, so a render can no longer observe a half-written mix).
        // This catch stays as a permanent safety net regardless — a
        // RemoteViews process has its own hard failure modes unrelated to
        // that race (the Binder transaction-size ceiling documented on
        // ART_PX above, a corrupt/foreign-format asset, etc.) — and pushes
        // a fallback RemoteViews that shows the actual exception as the
        // widget's own name text, so any future failure is visible
        // directly on the home screen without adb.
        try {
            renderWidget(context, appWidgetManager, appWidgetId);
        } catch (Throwable t) {
            Log.e(TAG, "updateWidget crashed", t);
            RemoteViews fallback = new RemoteViews(context.getPackageName(), R.layout.widget_banner);
            fallback.setTextViewText(R.id.widget_banner_name, "Widget error");
            fallback.setTextViewText(R.id.widget_banner_element, String.valueOf(t));
            fallback.setViewVisibility(R.id.widget_secondary_block, View.GONE);
            appWidgetManager.updateAppWidget(appWidgetId, fallback);
        }
    }

    private void renderWidget(Context context, AppWidgetManager appWidgetManager, int appWidgetId) {
        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        String primaryCategory = prefs.getString("widget_category_" + appWidgetId, "character");
        String secondaryCategory = "character".equals(primaryCategory) ? "weapon" : "character";

        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.widget_banner);

        renderPrimaryBlock(context, views, prefs, appWidgetId, primaryCategory);

        Bundle options = appWidgetManager.getAppWidgetOptions(appWidgetId);
        int heightDp = options != null ? options.getInt(AppWidgetManager.OPTION_APPWIDGET_MAX_HEIGHT, 0) : 0;
        boolean showSecondary = heightDp >= SECONDARY_MIN_HEIGHT_DP && prefs.getString("widget_banner_" + secondaryCategory + "_name", null) != null;
        views.setViewVisibility(R.id.widget_secondary_block, showSecondary ? View.VISIBLE : View.GONE);
        if (showSecondary) {
            renderSecondaryBlock(context, views, prefs, appWidgetId, secondaryCategory);
        }

        // Gear icon reopens BannerWidgetConfigureActivity for this exact
        // widget instance — a plain Activity launch, not the system's
        // placement-time ACTION_APPWIDGET_CONFIGURE flow, but the same
        // Activity handles both identically.
        Intent configureIntent = new Intent(context, BannerWidgetConfigureActivity.class);
        configureIntent.putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, appWidgetId);
        configureIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        PendingIntent configurePendingIntent = PendingIntent.getActivity(
                context, appWidgetId * 10, configureIntent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        views.setOnClickPendingIntent(R.id.widget_settings, configurePendingIntent);

        appWidgetManager.updateAppWidget(appWidgetId, views);
    }

    private void renderPrimaryBlock(Context context, RemoteViews views, SharedPreferences prefs, int appWidgetId, String category) {
        BannerData data = readBannerData(prefs, category);
        String name = data != null ? data.name : null;

        if (data != null) {
            views.setTextViewText(R.id.widget_banner_name, data.name);
            views.setTextViewText(R.id.widget_banner_element, data.title.toUpperCase());
        } else {
            views.setTextViewText(R.id.widget_banner_name, context.getString(R.string.app_name));
            views.setTextViewText(R.id.widget_banner_element, "");
        }

        Bitmap art = data != null ? WidgetAssetUtils.decodeAsset(context, data.artAsset, ART_PX, Bitmap.Config.RGB_565) : null;
        if (art != null) views.setImageViewBitmap(R.id.widget_art, art);

        setFeatured4(context, views, new int[]{R.id.widget_f4_1, R.id.widget_f4_2, R.id.widget_f4_3}, data != null ? data.featured4Json : null);

        String conveneUrl = data != null ? data.conveneUrl : null;
        if (conveneUrl != null) {
            views.setViewVisibility(R.id.widget_play, View.VISIBLE);
            Intent playIntent = new Intent(context, ConveneAnimationActivity.class);
            playIntent.putExtra(ConveneAnimationActivity.EXTRA_VIDEO_URL, conveneUrl);
            playIntent.putExtra(ConveneAnimationActivity.EXTRA_CHAR_NAME, name);
            playIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
            views.setOnClickPendingIntent(R.id.widget_play, PendingIntent.getActivity(
                    context, appWidgetId * 10 + 1, playIntent,
                    PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE));
        } else {
            views.setViewVisibility(R.id.widget_play, View.GONE);
        }

        Bitmap astriteIcon = WidgetAssetUtils.decodeAsset(context, ASTRITE_ICON_ASSET, PILL_ICON_PX);
        if (astriteIcon != null) {
            views.setImageViewBitmap(R.id.widget_pull_x1_icon, astriteIcon);
            views.setImageViewBitmap(R.id.widget_pull_x10_icon, astriteIcon);
        }
        views.setOnClickPendingIntent(R.id.widget_pull_x1, pullPendingIntent(context, appWidgetId, category, 1));
        views.setOnClickPendingIntent(R.id.widget_pull_x10, pullPendingIntent(context, appWidgetId, category, 10));

        // Tapping the art/scrim background (not the pills/▶️/gear, which
        // consume their own touches) opens the app itself, same as the old
        // countdown widget used to.
        Intent launchIntent = new Intent(context, MainActivity.class);
        views.setOnClickPendingIntent(R.id.widget_art, PendingIntent.getActivity(
                context, appWidgetId, launchIntent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE));
    }

    private void renderSecondaryBlock(Context context, RemoteViews views, SharedPreferences prefs, int appWidgetId, String category) {
        BannerData data = readBannerData(prefs, category);
        String name = data != null ? data.name : null;

        views.setTextViewText(R.id.widget_secondary_name, name != null ? name : "");
        views.setTextViewText(R.id.widget_secondary_element, data != null ? data.title.toUpperCase() : "");

        Bitmap art = data != null ? WidgetAssetUtils.decodeAsset(context, data.artAsset, ART_PX, Bitmap.Config.RGB_565) : null;
        if (art != null) views.setImageViewBitmap(R.id.widget_secondary_art, art);

        setFeatured4(context, views, new int[]{R.id.widget_secondary_f4_1, R.id.widget_secondary_f4_2, R.id.widget_secondary_f4_3}, data != null ? data.featured4Json : null);

        String conveneUrl = data != null ? data.conveneUrl : null;
        if (conveneUrl != null) {
            views.setViewVisibility(R.id.widget_secondary_play, View.VISIBLE);
            Intent playIntent = new Intent(context, ConveneAnimationActivity.class);
            playIntent.putExtra(ConveneAnimationActivity.EXTRA_VIDEO_URL, conveneUrl);
            playIntent.putExtra(ConveneAnimationActivity.EXTRA_CHAR_NAME, name);
            playIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
            views.setOnClickPendingIntent(R.id.widget_secondary_play, PendingIntent.getActivity(
                    context, appWidgetId * 10 + 4, playIntent,
                    PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE));
        } else {
            views.setViewVisibility(R.id.widget_secondary_play, View.GONE);
        }

        Intent launchIntent = new Intent(context, MainActivity.class);
        views.setOnClickPendingIntent(R.id.widget_secondary_art, PendingIntent.getActivity(
                context, appWidgetId * 10 + 5, launchIntent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE));
    }

    // Plain holder for one category's parsed widget_banner_<category>_data
    // blob — see the class-level comment on why this is read as one JSON
    // object instead of five separate SharedPreferences keys.
    private static final class BannerData {
        final String name;
        final String title;
        final String artAsset;
        final String featured4Json;
        final String conveneUrl;

        BannerData(String name, String title, String artAsset, String featured4Json, String conveneUrl) {
            this.name = name;
            this.title = title;
            this.artAsset = artAsset;
            this.featured4Json = featured4Json;
            this.conveneUrl = conveneUrl;
        }
    }

    private BannerData readBannerData(SharedPreferences prefs, String category) {
        String json = prefs.getString("widget_banner_" + category + "_data", null);
        if (json == null) return null;
        try {
            JSONObject obj = new JSONObject(json);
            if (obj.optInt("v", -1) != WIDGET_SCHEMA_VERSION) return null;
            return new BannerData(
                    obj.optString("name", ""),
                    obj.optString("title", ""),
                    obj.isNull("artAsset") ? null : obj.optString("artAsset", null),
                    obj.isNull("featured4") ? null : obj.optJSONArray("featured4").toString(),
                    obj.isNull("conveneUrl") ? null : obj.optString("conveneUrl", null));
        } catch (Exception e) {
            Log.w(TAG, "Failed to parse banner data for " + category, e);
            return null;
        }
    }

    private void setFeatured4(Context context, RemoteViews views, int[] slotIds, String featured4Json) {
        for (int id : slotIds) views.setViewVisibility(id, View.GONE);
        if (featured4Json == null) return;
        try {
            JSONArray arr = new JSONArray(featured4Json);
            for (int i = 0; i < arr.length() && i < slotIds.length; i++) {
                JSONObject entry = arr.getJSONObject(i);
                Bitmap thumb = WidgetAssetUtils.decodeAsset(context, entry.optString("asset", null), THUMB_PX);
                if (thumb != null) {
                    views.setImageViewBitmap(slotIds[i], WidgetAssetUtils.roundedCorners(thumb, 6f * 2.75f));
                    views.setViewVisibility(slotIds[i], View.VISIBLE);
                }
            }
        } catch (Exception e) {
            Log.w(TAG, "Failed to parse featured4 JSON", e);
        }
    }

    private static PendingIntent pullPendingIntent(Context context, int appWidgetId, String category, int count) {
        Intent intent = new Intent(context, WidgetPullActivity.class);
        intent.putExtra(WidgetPullActivity.EXTRA_COUNT, count);
        intent.putExtra(WidgetPullActivity.EXTRA_CATEGORY, category);
        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        // Distinct request codes per (widget instance × count) so the two
        // pills' PendingIntents don't collide/overwrite each other.
        int requestCode = appWidgetId * 10 + 2 + (count == 1 ? 0 : 1);
        return PendingIntent.getActivity(context, requestCode, intent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
    }

    // Called from MainActivity.onResume() so reopening the app refreshes the
    // widget sooner than the OS's own 30-minute floor.
    public static void requestUpdate(Context context) {
        AppWidgetManager manager = AppWidgetManager.getInstance(context);
        int[] ids = manager.getAppWidgetIds(new ComponentName(context, BannerWidget.class));
        if (ids.length == 0) return;
        Intent intent = new Intent(context, BannerWidget.class);
        intent.setAction(AppWidgetManager.ACTION_APPWIDGET_UPDATE);
        intent.putExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS, ids);
        context.sendBroadcast(intent);
    }

    // Called by BannerWidgetConfigureActivity right after saving a new
    // category choice, so that one widget instance refreshes immediately
    // instead of waiting for the next broadcast.
    public static void requestUpdateSingle(Context context, int appWidgetId) {
        Intent intent = new Intent(context, BannerWidget.class);
        intent.setAction(AppWidgetManager.ACTION_APPWIDGET_UPDATE);
        intent.putExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS, new int[]{appWidgetId});
        context.sendBroadcast(intent);
    }
}
