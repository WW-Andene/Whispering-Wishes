package cc.andene.whisperingwishes;

import android.content.SharedPreferences;
import android.util.Log;

import org.json.JSONArray;
import org.json.JSONObject;

// Looks up a character's own convene animation clip from widget_convene_roster — the same
// SharedPreferences blob src/utils/widgetSync.js's syncConveneRoster() writes (every character
// that has a convene animation at all, name -> {artAsset, conveneUrl}). Split out of the
// now-deleted ConvenePlayerWidget (a dedicated home-screen widget for playing one character's
// clip, removed for being unreliable — RemoteViews can't host a VideoView, so it had to fake
// motion via slow, error-prone bitmap-frame decoding) since PullBubbleService still needs this
// exact lookup: a pulled 4★/5★ character's own convene clip plays as part of the bubble's
// reveal sequence, same data, just a different (and more reliable) playback path.
final class ConveneRoster {
    private static final String TAG = "ConveneRoster";
    private static final int WIDGET_SCHEMA_VERSION = 2; // must match widgetSync.js's syncConveneRoster

    private ConveneRoster() {}

    static final class Entry {
        final String name;
        final String artAsset;
        final String conveneUrl;
        Entry(String name, String artAsset, String conveneUrl) {
            this.name = name;
            this.artAsset = artAsset;
            this.conveneUrl = conveneUrl;
        }
    }

    // A null/no-longer-present name (e.g. the roster shape changed) returns null rather than
    // guessing a fallback — there's no sensible "first one" default for a specific character
    // lookup the way a banner picker's "whichever is first active" default made sense.
    static Entry findEntry(SharedPreferences prefs, String name) {
        if (name == null) return null;
        String json = prefs.getString("widget_convene_roster", null);
        if (json == null) return null;
        try {
            JSONObject blob = new JSONObject(json);
            if (blob.optInt("v", -1) != WIDGET_SCHEMA_VERSION) return null;
            JSONArray arr = blob.optJSONArray("roster");
            if (arr == null) return null;
            for (int i = 0; i < arr.length(); i++) {
                JSONObject o = arr.getJSONObject(i);
                if (name.equals(o.optString("name", null))) {
                    return new Entry(o.optString("name", ""),
                            o.isNull("artAsset") ? null : o.optString("artAsset", null),
                            o.isNull("conveneUrl") ? null : o.optString("conveneUrl", null));
                }
            }
        } catch (Exception e) {
            Log.w(TAG, "Failed to parse widget_convene_roster", e);
        }
        return null;
    }
}
