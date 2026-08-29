package cc.andene.whisperingwishes;

import android.content.Context;
import android.content.SharedPreferences;

import org.json.JSONArray;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.List;
import java.util.Random;

// Native Java port of core/conveneSimulator.js's character- and weapon-
// banner branches — rolls against the ONE SPECIFIC banner this widget
// instance is configured to (category + exact name, picked via
// BannerWidgetConfigureActivity.java's picker grid; two different
// "character" widgets can point at two different currently-active
// character banners) — the widget's ×1/×10 buttons need to roll a pull
// with NO app launch involved (see PulseBannerWidget.java/widget_banner.xml's
// comments), and there's no reliable way to run the real JS engine in the
// background without the app's WebView actually being active. This
// duplicates the probability MATH only (base rate, soft/hard pity, 50/50,
// guarantee, 4★ rate-up+guarantee) — the actual name pools and portrait
// images are never hand-copied here: the per-banner featured4 list and
// every active banner's own name/art live in widget_banners_data
// (widgetSync.js's syncBannerWidget()), and the four standard/off-rate name
// pools — identical regardless of which banner is showing — are synced
// once by syncGlobalPullPools(), so this stays in sync with
// characters.js/weapons.js automatically.
//
// Known, accepted tradeoff (this was a deliberate choice, not an oversight):
// this simulator keeps its OWN pity counter, entirely separate from both
// the real tracked pity (state.profile) and the in-app simulator's pity
// (useConveneSimStats.js) — it starts at 0/false the first time the widget
// is used, like a fresh account, and only ever advances from its own prior
// rolls. It IS still kept per-category (not per-specific-banner): the real
// game's own Character/Weapon Event Convene pity is shared across whichever
// specific banner/phase is currently running within that category, not
// reset per banner, so two different character banners pulled from two
// different widgets correctly share one "widget_pull_character_*" pity
// counter rather than each starting fresh. There is no cheap way to read
// the real pity from here without launching the app.
final class WidgetPullSimulator {
    private static final String PREFS_NAME = "CapacitorStorage";
    private static final int WIDGET_SCHEMA_VERSION = 2; // must match PulseBannerWidget/widgetSync.js
    private static final double BASE_5STAR_RATE = 0.008;
    private static final int SOFT_PITY_START = 66;
    private static final int HARD_PITY = 80;
    private static final int SOFT_PITY_STEPS = HARD_PITY - SOFT_PITY_START;
    private static final int HARD_PITY_4STAR = 10;
    private static final double FLAT_4STAR_RATE = 0.06;
    private static final double FOUR_STAR_RATEUP_CHANCE = 0.5;

    static final class PullResult {
        final String name;
        final int rarity;
        final String type; // "character" | "weapon"
        final boolean isFeatured;

        PullResult(String name, int rarity, String type, boolean isFeatured) {
            this.name = name;
            this.rarity = rarity;
            this.type = type;
            this.isFeatured = isFeatured;
        }
    }

    static final class PullSimResult {
        final List<PullResult> results;
        final String video; // "common" | "4star" | "5star"

        PullSimResult(List<PullResult> results, String video) {
            this.results = results;
            this.video = video;
        }
    }

    private static final class NameType {
        final String name;
        final String type;

        NameType(String name, String type) {
            this.name = name;
            this.type = type;
        }
    }

    private WidgetPullSimulator() {}

    private static double pullRate5(int pity) {
        if (pity < SOFT_PITY_START) return BASE_5STAR_RATE;
        double raw = BASE_5STAR_RATE + ((pity - SOFT_PITY_START + 1) / (double) SOFT_PITY_STEPS) * (1 - BASE_5STAR_RATE);
        return Math.min(raw, 1);
    }

    private static List<String> readJsonArray(SharedPreferences prefs, String key) {
        List<String> out = new ArrayList<>();
        String raw = prefs.getString(key, null);
        if (raw == null) return out;
        try {
            JSONArray arr = new JSONArray(raw);
            for (int i = 0; i < arr.length(); i++) out.add(arr.getString(i));
        } catch (Exception ignored) {}
        return out;
    }

    private static <T> T pick(List<T> list, Random rand) {
        return list.get(rand.nextInt(list.size()));
    }

    // Looks up ONE banner entry by exact name inside widget_banners_data's <category>s array
    // (mirrors PulseBannerWidget.findEntry's fallback behavior: a null/no-longer-active name
    // resolves to that array's first entry instead of an empty pull). Returns null only when
    // there's no synced data at all or no active banner in that category.
    private static JSONObject findBannerEntry(SharedPreferences prefs, String category, String name) {
        String json = prefs.getString("widget_banners_data", null);
        if (json == null) return null;
        try {
            JSONObject blob = new JSONObject(json);
            if (blob.optInt("v", -1) != WIDGET_SCHEMA_VERSION) return null;
            JSONArray arr = blob.optJSONArray(category + "s");
            if (arr == null || arr.length() == 0) return null;
            if (name != null) {
                for (int i = 0; i < arr.length(); i++) {
                    JSONObject entry = arr.getJSONObject(i);
                    if (name.equals(entry.optString("name", null))) return entry;
                }
            }
            return arr.getJSONObject(0);
        } catch (Exception ignored) {
            return null;
        }
    }

    private static List<String> readJsonArrayField(JSONObject obj, String key) {
        List<String> out = new ArrayList<>();
        if (obj == null) return out;
        JSONArray arr = obj.optJSONArray(key);
        if (arr == null) return out;
        try {
            for (int i = 0; i < arr.length(); i++) out.add(arr.getString(i));
        } catch (Exception ignored) {}
        return out;
    }

    // category: "character" | "weapon" — mirrors conveneSimulator.js's
    // isWeapon split. Character banners have a real 50/50 (guaranteed on
    // loss); weapon banners don't — every 5★ hit is instantly the featured
    // weapon (no randomness, no guarantee flag involved at all), matching
    // "Weapon banners have no 50/50" in the JS engine's own comments.
    // `pinnedName` pins this roll to one SPECIFIC active banner within `category` (this
    // widget instance's own custom choice — two different "character" widgets can point at
    // two different currently-active character banners) — null falls back to that
    // category's first active banner, same as a pre-custom-choice widget. Named distinctly
    // from the per-pull-result "name" locals used further down in this same method (the
    // actual name of whatever THIS specific pull rolled) — they're a different concept and
    // Java won't allow a local to shadow a parameter anyway.
    static PullSimResult roll(Context context, String category, String pinnedName, int count) {
        boolean isWeapon = "weapon".equals(category);
        String featuredType = isWeapon ? "weapon" : "character";

        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        JSONObject entry = findBannerEntry(prefs, category, pinnedName);
        String featuredName = entry != null ? entry.optString("name", null) : null;
        List<String> featured4 = readJsonArrayField(entry, "featured4Full");
        // Global pools — the same standard-5★/off-rate-4★/3★ rosters regardless of which
        // specific banner is showing, synced once by widgetSync.js's syncGlobalPullPools()
        // rather than duplicated per category (an earlier version of this file kept identical
        // copies under a "widget_pull_<category>_pool_*" key for each category).
        List<String> standard5 = readJsonArray(prefs, "widget_pull_pool_standard5");
        List<String> fourStarChars = readJsonArray(prefs, "widget_pull_pool_4star_chars");
        List<String> fourStarWeapons = readJsonArray(prefs, "widget_pull_pool_4star_weapons");
        List<String> threeStarWeapons = readJsonArray(prefs, "widget_pull_pool_3star_weapons");

        List<NameType> pool4Rest = new ArrayList<>();
        for (String n : fourStarChars) if (!featured4.contains(n)) pool4Rest.add(new NameType(n, "character"));
        for (String n : fourStarWeapons) if (!featured4.contains(n)) pool4Rest.add(new NameType(n, "weapon"));

        String pityKeyPrefix = "widget_pull_" + category + "_";
        int pity5 = prefs.getInt(pityKeyPrefix + "pity5", 0);
        int pity4 = prefs.getInt(pityKeyPrefix + "pity4", 0);
        boolean guaranteed = prefs.getBoolean(pityKeyPrefix + "guaranteed", false);
        boolean guaranteed4 = prefs.getBoolean(pityKeyPrefix + "guaranteed4", false);

        Random rand = new Random();
        List<PullResult> results = new ArrayList<>();
        int bestRarity = 3;

        for (int i = 0; i < count; i++) {
            pity5++;
            pity4++;
            if (rand.nextDouble() < pullRate5(pity5)) {
                String name;
                boolean isFeatured;
                if (isWeapon) {
                    name = featuredName;
                    isFeatured = true;
                } else if (guaranteed) {
                    name = featuredName;
                    isFeatured = true;
                    guaranteed = false;
                } else if (rand.nextDouble() < 0.5) {
                    name = featuredName;
                    isFeatured = true;
                } else {
                    name = standard5.isEmpty() ? featuredName : pick(standard5, rand);
                    isFeatured = false;
                    guaranteed = true;
                }
                results.add(new PullResult(name, 5, featuredType, isFeatured));
                bestRarity = 5;
                pity5 = 0;
                pity4 = 0;
            } else if (pity4 >= HARD_PITY_4STAR || rand.nextDouble() < FLAT_4STAR_RATE) {
                if (featured4.isEmpty()) {
                    NameType off = pool4Rest.isEmpty() ? new NameType(featuredName, featuredType) : pick(pool4Rest, rand);
                    results.add(new PullResult(off.name, 4, off.type, false));
                } else {
                    boolean rateUp = guaranteed4 || rand.nextDouble() < FOUR_STAR_RATEUP_CHANCE;
                    guaranteed4 = !rateUp;
                    if (rateUp) {
                        results.add(new PullResult(pick(featured4, rand), 4, featuredType, true));
                    } else {
                        NameType off = pool4Rest.isEmpty() ? new NameType(pick(featured4, rand), featuredType) : pick(pool4Rest, rand);
                        results.add(new PullResult(off.name, 4, off.type, false));
                    }
                }
                if (bestRarity < 4) bestRarity = 4;
                pity4 = 0;
            } else {
                String name = threeStarWeapons.isEmpty() ? null : pick(threeStarWeapons, rand);
                results.add(new PullResult(name, 3, "weapon", false));
            }
        }

        prefs.edit()
                .putInt(pityKeyPrefix + "pity5", pity5)
                .putInt(pityKeyPrefix + "pity4", pity4)
                .putBoolean(pityKeyPrefix + "guaranteed", guaranteed)
                .putBoolean(pityKeyPrefix + "guaranteed4", guaranteed4)
                .apply();

        String video = bestRarity >= 5 ? "5star" : bestRarity == 4 ? "4star" : "common";
        return new PullSimResult(results, video);
    }
}
