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
// allows. Which SPECIFIC banner a given widget instance shows (not just
// "character vs weapon" — an exact banner by name, e.g. "character"/
// "Jinhsi") is picked via BannerWidgetConfigureActivity.java's picker grid
// at placement time (android:configure in banner_widget_info.xml) and
// changeable afterward via the widget's own gear icon — stored per-
// appWidgetId (widget_choice_<id>), since more than one of these widgets
// can be placed at once, each independently configured to a different
// banner even within the same category (two "character" widgets can show
// two different currently-active character banners).
//
// Resizing a widget tall enough (onAppWidgetOptionsChanged below) also
// reveals a second, secondary banner block showing the first active banner
// of whichever category ISN'T the configured primary one's — display-only,
// no pull-sim buttons on that block, just art/name/Featured-4★/▶️.
//
// RemoteViews platform limits (this is not a guess — it's enforced by the
// OS itself, since a widget is drawn by the launcher app's process, not
// ours): only a fixed whitelist of views can be inflated (no WebView, no
// VideoView, no custom Views), and images must be delivered as an actual
// Bitmap (via setImageViewBitmap) or a resource id — a widget process can't
// load arbitrary URLs/paths itself, so this class decodes bitmaps here
// (from the app's own bundled assets, since it runs in the app's process)
// and hands the launcher finished pixels. The ▶️ button's video is the same
// constraint worked around a different way: WidgetVideoPlaybackService
// decodes the clip into a short sequence of these same kind of bitmaps and
// flips R.id.widget_art/widget_secondary_art through them on a timer — no
// video surface is ever drawn by the widget itself, but real frames of the
// real clip play right on it. ConveneAnimationActivity (a real Activity,
// VideoView works fine there) is kept only as that service's fallback if
// frame decoding fails.
//
// Data comes from @capacitor/preferences's "CapacitorStorage" SharedPreferences
// file, written by src/utils/widgetSync.js's syncBannerWidget() whenever the
// featured banners change — this class only reads it.
//
// EVERY currently-active banner (both categories, however many concurrent
// phases are running) lives in ONE JSON blob (widget_banners_data), not
// split per-category the way an earlier version of this file had it —
// widgetSync.js writes that blob with a single atomic Preferences.set call.
// This matters because this class's own trigger (requestUpdate(), called
// from MainActivity.onResume()) and widgetSync.js's write are two
// independent, unsynchronized events; if this were still separate keys, a
// render landing mid-write could read a mix of old+new fields (new art with
// the old name, etc.). With one blob, a render always sees either the
// fully-old or fully-new payload — never a partial one — regardless of
// timing. WIDGET_SCHEMA_VERSION guards against a version mismatch (an
// updated app's payload shape read by logic from before it changed): a
// missing/wrong version is treated the same as no data at all rather than
// risking a field access that no longer means what this code expects.
//
// widget_choice_<appWidgetId> (JSON {"category":..,"name":..}) is this
// instance's own pick from that blob's array for its category. A widget
// placed before per-widget banner choice existed only has the older
// widget_category_<id> (a plain "character"/"weapon" string, no specific
// name) — readChoice() below falls back to that and resolves to the FIRST
// active banner in that category, preserving its old behavior rather than
// forcing a re-configure.
//
// History of this class's name, for whoever reads this next: originally
// BannerWidget. An unrelated, already-removed provider (EventCountdownWidget,
// deleted well before any of this) kept showing up as a second, broken entry
// in the home-screen widget picker on a real device — confirmed via a
// byte-level read of the exact installed APK to contain no second <receiver>
// and none of that old provider's strings anywhere in resources.arsc, and
// confirmed NOT to be a second app install (Settings -> Apps showed exactly
// one entry) — ruling out everything except OS/launcher-side widget-host
// state keyed by component name, something neither an app data wipe nor a
// full phone cache wipe reaches. Renamed to GachaBannerWidget on that theory
// (a stale reference necessarily points at the exact old component name, so
// a new name can't be bound to it) — that did NOT fix it; the duplicate
// entry persisted under the new name too, meaning whatever was holding onto
// it wasn't actually keyed to the specific old class name the way that
// theory assumed. The whole feature was deleted entirely at that point to
// confirm the picker entry really was code, not device state — deleting it
// DID make the duplicate go away, proving it was real. This is the
// reimplementation, restoring the same code (which already had the
// TransactionTooLargeException/atomic-payload/asset-map hardening below)
// under yet another new name (PulseBannerWidget) as a precaution, since the
// true mechanism connecting a component name to that stale picker state was
// never actually identified — only worked around once, by removing the
// component whose name it was keyed to entirely.
public class PulseBannerWidget extends AppWidgetProvider {
    private static final String TAG = "PulseBannerWidget";
    private static final String PREFS_NAME = "CapacitorStorage";
    private static final int WIDGET_SCHEMA_VERSION = 2;
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
    // Height (dp) below which the primary block switches to a compact
    // layout — just art + name/element, no ×1/×10 pull pills and no
    // Featured-4★/▶️ row, since neither fits in a 1-row ("1x2") placement
    // now that banner_widget_info.xml's minHeight allows resizing that
    // short. Threshold picked just under the original 180dp minHeight (the
    // old floor, back when this layout was assumed to always be at least
    // that tall) so nothing already-placed at a "normal" size changes.
    private static final int COMPACT_MAX_HEIGHT_DP = 130;

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
        // multi-key write (fixed above: readBannersBlob() now reads one
        // atomic JSON blob covering every active banner instead of
        // separately-written keys, so a render can no longer observe a
        // half-written mix).
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
        RemoteViews views = buildBaseViews(context, appWidgetManager, appWidgetId);
        appWidgetManager.updateAppWidget(appWidgetId, views);
    }

    // Package-private so WidgetVideoPlaybackService can grab a fully-rendered RemoteViews for
    // this widget instance, then keep overwriting just R.id.widget_art with successive decoded
    // frames on top of it — this is the ONLY reason renderWidget's body is split out into its own
    // method instead of just building+applying inline: the frame-playback loop needs the same
    // "everything else" (name, element, pills, gear button, etc.) as a starting point every frame,
    // not just the art bitmap in isolation.
    static RemoteViews buildBaseViews(Context context, AppWidgetManager appWidgetManager, int appWidgetId) {
        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        JSONObject blob = readBannersBlob(prefs);
        Choice primary = readChoice(prefs, appWidgetId);
        String secondaryCategory = "character".equals(primary.category) ? "weapon" : "character";

        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.widget_banner);

        Bundle options = appWidgetManager.getAppWidgetOptions(appWidgetId);
        int heightDp = options != null ? options.getInt(AppWidgetManager.OPTION_APPWIDGET_MAX_HEIGHT, 0) : 0;
        // A host that hasn't reported real dimensions yet (heightDp == 0, e.g. the very first
        // render right after placement, before onAppWidgetOptionsChanged has fired even once)
        // should NOT be treated as compact — that would hide the pills/bottom row on every normal
        // widget until the first resize event. Only an explicitly-reported small height counts.
        boolean compact = heightDp > 0 && heightDp < COMPACT_MAX_HEIGHT_DP;

        BannerData primaryData = findEntry(blob, primary.category, primary.name);
        renderPrimaryBlock(context, views, appWidgetId, primary.category, primaryData, compact);

        BannerData secondaryData = findEntry(blob, secondaryCategory, null);
        boolean showSecondary = heightDp >= SECONDARY_MIN_HEIGHT_DP && secondaryData != null;
        views.setViewVisibility(R.id.widget_secondary_block, showSecondary ? View.VISIBLE : View.GONE);
        if (showSecondary) {
            renderSecondaryBlock(context, views, appWidgetId, secondaryData);
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

        return views;
    }

    private static void renderPrimaryBlock(Context context, RemoteViews views, int appWidgetId, String category, BannerData data, boolean compact) {
        String name = data != null ? data.name : null;

        // Compact (short/1-row) sizes: hide the ×1/×10 pull pills and the Featured-4★/▶️ row
        // entirely — neither fits in a 1-row placement, and a clipped-mid-row pill/thumbnail
        // reads as broken rather than just "smaller". Art + name/element still shows.
        views.setViewVisibility(R.id.widget_pull_pills, compact ? View.GONE : View.VISIBLE);
        views.setViewVisibility(R.id.widget_bottom_row, compact ? View.GONE : View.VISIBLE);

        if (data != null) {
            views.setTextViewText(R.id.widget_banner_name, data.name);
            views.setTextViewText(R.id.widget_banner_element, data.title.toUpperCase());
        } else {
            views.setTextViewText(R.id.widget_banner_name, context.getString(R.string.app_name));
            views.setTextViewText(R.id.widget_banner_element, "");
        }

        Bitmap art = data != null ? WidgetAssetUtils.decodeAsset(context, data.artAsset, ART_PX, Bitmap.Config.RGB_565) : null;
        if (art != null) views.setImageViewBitmap(R.id.widget_art, art);

        setFeatured4(context, views, new int[]{R.id.widget_f4_1, R.id.widget_f4_2, R.id.widget_f4_3}, data != null ? data.featured4PreviewJson : null);

        String conveneUrl = data != null ? data.conveneUrl : null;
        if (conveneUrl != null) {
            views.setViewVisibility(R.id.widget_play, View.VISIBLE);
            // Plays directly on the widget's own surface (frame-by-frame — see
            // WidgetVideoPlaybackService's file header for how) instead of launching
            // ConveneAnimationActivity, which stays only as that service's own fallback
            // if frame decoding fails (bad/unreachable stream, unsupported format, etc.).
            Intent playIntent = new Intent(context, WidgetVideoPlaybackService.class);
            playIntent.putExtra(WidgetVideoPlaybackService.EXTRA_APP_WIDGET_ID, appWidgetId);
            playIntent.putExtra(WidgetVideoPlaybackService.EXTRA_VIDEO_SOURCE, conveneUrl);
            playIntent.putExtra(WidgetVideoPlaybackService.EXTRA_FALLBACK_CHAR_NAME, name);
            views.setOnClickPendingIntent(R.id.widget_play, PendingIntent.getService(
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
        views.setOnClickPendingIntent(R.id.widget_pull_x1, pullPendingIntent(context, appWidgetId, category, name, 1));
        views.setOnClickPendingIntent(R.id.widget_pull_x10, pullPendingIntent(context, appWidgetId, category, name, 10));

        // Tapping the art/scrim background (not the pills/▶️/gear, which
        // consume their own touches) opens the app itself, same as the old
        // countdown widget used to.
        Intent launchIntent = new Intent(context, MainActivity.class);
        views.setOnClickPendingIntent(R.id.widget_art, PendingIntent.getActivity(
                context, appWidgetId, launchIntent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE));
    }

    private static void renderSecondaryBlock(Context context, RemoteViews views, int appWidgetId, BannerData data) {
        String name = data != null ? data.name : null;

        views.setTextViewText(R.id.widget_secondary_name, name != null ? name : "");
        views.setTextViewText(R.id.widget_secondary_element, data != null ? data.title.toUpperCase() : "");

        Bitmap art = data != null ? WidgetAssetUtils.decodeAsset(context, data.artAsset, ART_PX, Bitmap.Config.RGB_565) : null;
        if (art != null) views.setImageViewBitmap(R.id.widget_secondary_art, art);

        setFeatured4(context, views, new int[]{R.id.widget_secondary_f4_1, R.id.widget_secondary_f4_2, R.id.widget_secondary_f4_3}, data != null ? data.featured4PreviewJson : null);

        String conveneUrl = data != null ? data.conveneUrl : null;
        if (conveneUrl != null) {
            views.setViewVisibility(R.id.widget_secondary_play, View.VISIBLE);
            Intent playIntent = new Intent(context, WidgetVideoPlaybackService.class);
            playIntent.putExtra(WidgetVideoPlaybackService.EXTRA_APP_WIDGET_ID, appWidgetId);
            playIntent.putExtra(WidgetVideoPlaybackService.EXTRA_VIDEO_SOURCE, conveneUrl);
            playIntent.putExtra(WidgetVideoPlaybackService.EXTRA_TARGET_VIEW_ID, R.id.widget_secondary_art);
            playIntent.putExtra(WidgetVideoPlaybackService.EXTRA_FALLBACK_CHAR_NAME, name);
            views.setOnClickPendingIntent(R.id.widget_secondary_play, PendingIntent.getService(
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

    // Plain holder for one banner entry parsed out of widget_banners_data —
    // see the class-level comment on why every active banner lives in one
    // JSON blob instead of separate per-category keys.
    private static final class BannerData {
        final String name;
        final String title;
        final String artAsset;
        final String featured4PreviewJson; // [{name, asset}] — display thumbnails only
        final String conveneUrl;

        BannerData(String name, String title, String artAsset, String featured4PreviewJson, String conveneUrl) {
            this.name = name;
            this.title = title;
            this.artAsset = artAsset;
            this.featured4PreviewJson = featured4PreviewJson;
            this.conveneUrl = conveneUrl;
        }
    }

    // This widget instance's own pick: which category, and which exact banner name within it
    // (null name = "whichever is first", the fallback for a pre-custom-choice widget_category_<id>
    // that never named a specific banner).
    static final class Choice {
        final String category;
        final String name;
        Choice(String category, String name) { this.category = category; this.name = name; }
    }

    static Choice readChoice(SharedPreferences prefs, int appWidgetId) {
        String json = prefs.getString("widget_choice_" + appWidgetId, null);
        if (json != null) {
            try {
                JSONObject obj = new JSONObject(json);
                return new Choice(obj.optString("category", "character"), obj.isNull("name") ? null : obj.optString("name", null));
            } catch (Exception e) {
                Log.w(TAG, "Failed to parse widget choice", e);
            }
        }
        // Pre-custom-choice widget, or a corrupt/missing choice blob — fall back to the old
        // category-only preference (default "character") with no specific name pinned.
        return new Choice(prefs.getString("widget_category_" + appWidgetId, "character"), null);
    }

    private static JSONObject readBannersBlob(SharedPreferences prefs) {
        String json = prefs.getString("widget_banners_data", null);
        if (json == null) return null;
        try {
            JSONObject obj = new JSONObject(json);
            if (obj.optInt("v", -1) != WIDGET_SCHEMA_VERSION) return null;
            return obj;
        } catch (Exception e) {
            Log.w(TAG, "Failed to parse widget_banners_data", e);
            return null;
        }
    }

    // Finds the banner named `name` inside blob's <category> array; a null name (or a name that
    // isn't currently active any more — e.g. the widget was configured to a banner that has since
    // ended) falls back to that array's first entry, matching the pre-custom-choice behavior rather
    // than rendering an empty widget just because the exact pinned banner rotated out.
    private static BannerData findEntry(JSONObject blob, String category, String name) {
        if (blob == null) return null;
        try {
            JSONArray arr = blob.optJSONArray(category + "s");
            if (arr == null || arr.length() == 0) return null;
            JSONObject match = null;
            if (name != null) {
                for (int i = 0; i < arr.length(); i++) {
                    JSONObject entry = arr.getJSONObject(i);
                    if (name.equals(entry.optString("name", null))) { match = entry; break; }
                }
            }
            if (match == null) match = arr.getJSONObject(0);
            return new BannerData(
                    match.optString("name", ""),
                    match.optString("title", ""),
                    match.isNull("artAsset") ? null : match.optString("artAsset", null),
                    match.isNull("featured4Preview") ? null : match.optJSONArray("featured4Preview").toString(),
                    match.isNull("conveneUrl") ? null : match.optString("conveneUrl", null));
        } catch (Exception e) {
            Log.w(TAG, "Failed to read banner entry for " + category, e);
            return null;
        }
    }

    private static void setFeatured4(Context context, RemoteViews views, int[] slotIds, String featured4Json) {
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

    private static PendingIntent pullPendingIntent(Context context, int appWidgetId, String category, String name, int count) {
        // Plays entirely on the widget's own surface (video frames, then each pulled item's
        // portrait one at a time, then a colored-pills results summary — see
        // WidgetPullPlaybackService's file header) instead of launching WidgetPullActivity,
        // which stays only as that service's own fallback if the native roll/decode fails.
        Intent intent = new Intent(context, WidgetPullPlaybackService.class);
        intent.putExtra(WidgetPullPlaybackService.EXTRA_APP_WIDGET_ID, appWidgetId);
        intent.putExtra(WidgetPullPlaybackService.EXTRA_COUNT, count);
        intent.putExtra(WidgetPullPlaybackService.EXTRA_CATEGORY, category);
        // The SPECIFIC banner this widget is configured to (not just its category) — two widgets
        // both set to "character" can now point at two different currently-active character
        // banners, so the pull-sim needs to know exactly which one to roll odds/featured4 against.
        intent.putExtra(WidgetPullPlaybackService.EXTRA_NAME, name);
        // Distinct request codes per (widget instance × count) so the two
        // pills' PendingIntents don't collide/overwrite each other.
        int requestCode = appWidgetId * 10 + 2 + (count == 1 ? 0 : 1);
        return PendingIntent.getService(context, requestCode, intent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
    }

    // Called from MainActivity.onResume() so reopening the app refreshes the
    // widget sooner than the OS's own 30-minute floor.
    public static void requestUpdate(Context context) {
        AppWidgetManager manager = AppWidgetManager.getInstance(context);
        int[] ids = manager.getAppWidgetIds(new ComponentName(context, PulseBannerWidget.class));
        if (ids.length == 0) return;
        Intent intent = new Intent(context, PulseBannerWidget.class);
        intent.setAction(AppWidgetManager.ACTION_APPWIDGET_UPDATE);
        intent.putExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS, ids);
        context.sendBroadcast(intent);
    }

    // Called by BannerWidgetConfigureActivity right after saving a new
    // category choice, so that one widget instance refreshes immediately
    // instead of waiting for the next broadcast.
    public static void requestUpdateSingle(Context context, int appWidgetId) {
        Intent intent = new Intent(context, PulseBannerWidget.class);
        intent.setAction(AppWidgetManager.ACTION_APPWIDGET_UPDATE);
        intent.putExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS, new int[]{appWidgetId});
        context.sendBroadcast(intent);
    }
}
