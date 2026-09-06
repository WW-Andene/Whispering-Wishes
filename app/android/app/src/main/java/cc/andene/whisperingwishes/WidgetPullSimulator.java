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

    // "Both" on a Characters/Weapon banner-list arc (PullBubbleService.pinBoth) — a TRUE merged
    // roll, not several independent ones: same base 5★ rate, same soft/hard pity curve, same
    // 50/50-vs-standard split as a normal roll() against one banner, and the SAME shared
    // category-wide pity counter a normal single-pin roll on this category already uses (pity
    // is real-game shared-across-whichever-banner, so a merged "Both" roll continuing that same
    // counter is correct, not a compromise). The ONLY thing that changes from a normal roll():
    // when the featured branch resolves, the featured NAME is a uniform pick among
    // `featuredNames` instead of always being one fixed name — e.g. 2 active character banners
    // means a featured hit is 50/50 between them, so each is really half of the 50% featured
    // slot (25% each) rather than the 5★ rate itself being touched at all. featured4 (the 4★
    // rate-up list) is the UNION of every merged banner's own featured4Full — that mechanic
    // already supported multiple names sharing one rate-up chance, this just feeds it more.
    static PullSimResult rollMerged(Context context, String category, List<String> featuredNames, int count) {
        boolean isWeapon = "weapon".equals(category);
        String featuredType = isWeapon ? "weapon" : "character";

        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        List<String> featured4List = new ArrayList<>();
        for (String n : featuredNames) {
            for (String f : readJsonArrayField(findBannerEntry(prefs, category, n), "featured4Full")) {
                if (!featured4List.contains(f)) featured4List.add(f);
            }
        }
        List<String> standard5 = readJsonArray(prefs, "widget_pull_pool_standard5");
        List<String> fourStarChars = readJsonArray(prefs, "widget_pull_pool_4star_chars");
        List<String> fourStarWeapons = readJsonArray(prefs, "widget_pull_pool_4star_weapons");
        List<String> threeStarWeapons = readJsonArray(prefs, "widget_pull_pool_3star_weapons");

        List<NameType> pool4Rest = new ArrayList<>();
        for (String n : fourStarChars) if (!featured4List.contains(n)) pool4Rest.add(new NameType(n, "character"));
        for (String n : fourStarWeapons) if (!featured4List.contains(n)) pool4Rest.add(new NameType(n, "weapon"));

        // Same pityKeyPrefix as roll() (category-only, not per-banner) — a merged "Both" roll
        // and a normal single-pin roll on the same category are meant to share one continuous
        // pity counter, exactly like two real banners in the same category always have.
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
                    name = pick(featuredNames, rand);
                    isFeatured = true;
                } else if (guaranteed) {
                    name = pick(featuredNames, rand);
                    isFeatured = true;
                    guaranteed = false;
                } else if (rand.nextDouble() < 0.5) {
                    name = pick(featuredNames, rand);
                    isFeatured = true;
                } else {
                    name = standard5.isEmpty() ? pick(featuredNames, rand) : pick(standard5, rand);
                    isFeatured = false;
                    guaranteed = true;
                }
                results.add(new PullResult(name, 5, featuredType, isFeatured));
                bestRarity = 5;
                pity5 = 0;
                pity4 = 0;
            } else if (pity4 >= HARD_PITY_4STAR || rand.nextDouble() < FLAT_4STAR_RATE) {
                if (featured4List.isEmpty()) {
                    NameType off = pool4Rest.isEmpty() ? new NameType(pick(featuredNames, rand), featuredType) : pick(pool4Rest, rand);
                    results.add(new PullResult(off.name, 4, off.type, false));
                } else {
                    boolean rateUp = guaranteed4 || rand.nextDouble() < FOUR_STAR_RATEUP_CHANCE;
                    guaranteed4 = !rateUp;
                    if (rateUp) {
                        results.add(new PullResult(pick(featured4List, rand), 4, featuredType, true));
                    } else {
                        NameType off = pool4Rest.isEmpty() ? new NameType(pick(featured4List, rand), featuredType) : pick(pool4Rest, rand);
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

    // Combines several independent roll()/rollStandard() calls into one displayable result —
    // backs PullBubbleService's "Both" picks and long-press multi-select (rolling `count`
    // against every pinned target rather than just one). Each part already advanced its own
    // pity state correctly on its own (roll() keys pity by category, rollStandard() by
    // "standard-"+category, so two parts sharing a category legitimately share pity, exactly
    // matching the real game's own shared-pity-within-category behavior — see this file's own
    // header comment) — this only concatenates the display results and picks the single
    // biggest-rarity video to play, in call order when two parts tie on rarity.
    static PullSimResult merge(List<PullSimResult> parts) {
        List<PullResult> all = new ArrayList<>();
        String video = "common";
        int bestRarity = 0;
        for (PullSimResult part : parts) {
            all.addAll(part.results);
            int rarity = "5star".equals(part.video) ? 5 : "4star".equals(part.video) ? 4 : 3;
            if (rarity > bestRarity) { bestRarity = rarity; video = part.video; }
        }
        return new PullSimResult(all, video);
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

    // Lists every currently-active banner NAME in `category`, in the order widget_banners_data
    // has them — used by PullBubbleService's own banner-picker sub-bubble to cycle through
    // choices (tap to advance, wrapping back to "first active" / null after the last one),
    // the same category+name pinning findBannerEntry/roll() already understand elsewhere in
    // this class. Empty (not null) when there's no synced data or no active banner at all, so
    // callers can safely iterate without a null check.
    static List<String> listActiveBannerNames(SharedPreferences prefs, String category) {
        List<String> names = new ArrayList<>();
        String json = prefs.getString("widget_banners_data", null);
        if (json == null) return names;
        try {
            JSONObject blob = new JSONObject(json);
            if (blob.optInt("v", -1) != WIDGET_SCHEMA_VERSION) return names;
            JSONArray arr = blob.optJSONArray(category + "s");
            if (arr == null) return names;
            for (int i = 0; i < arr.length(); i++) {
                String name = arr.getJSONObject(i).optString("name", null);
                if (name != null) names.add(name);
            }
        } catch (Exception ignored) {}
        return names;
    }

    // One row for PullBubbleService's banner-picker sub-arc — either a character banner (label
    // = the character's own name) or a weapon banner (label = the character it's FOR, per
    // widgetSync.js's buildBannerEntry — the user picks "Qingxiao", not the weapon's own name,
    // for a weapon-banner row). framing is only meaningful for character art; weapon art
    // (a banner splash, not a full-body sprite) doesn't need the same face-centered crop.
    static final class BannerOption {
        final String label;
        final String pinName; // the exact name to pass back into roll()'s pinnedName
        final String artAsset;
        final float framingZoom, framingX, framingY;

        BannerOption(String label, String pinName, String artAsset, float framingZoom, float framingX, float framingY) {
            this.label = label;
            this.pinName = pinName;
            this.artAsset = artAsset;
            this.framingZoom = framingZoom;
            this.framingX = framingX;
            this.framingY = framingY;
        }
    }

    // Every currently-active banner in `category`, with enough to render a picker row
    // (label+art+framing) — listActiveBannerNames() above only gave PullBubbleService's old
    // cycle-through-names picker bare names; this full-entry version backs its new
    // category>list arc UI.
    static List<BannerOption> listBannerOptions(SharedPreferences prefs, String category) {
        List<BannerOption> options = new ArrayList<>();
        String json = prefs.getString("widget_banners_data", null);
        if (json == null) return options;
        boolean isWeapon = "weapon".equals(category);
        try {
            JSONObject blob = new JSONObject(json);
            if (blob.optInt("v", -1) != WIDGET_SCHEMA_VERSION) return options;
            JSONArray arr = blob.optJSONArray(category + "s");
            if (arr == null) return options;
            for (int i = 0; i < arr.length(); i++) {
                JSONObject entry = arr.getJSONObject(i);
                String name = entry.optString("name", null);
                if (name == null) continue;
                String label = isWeapon ? entry.optString("forCharacter", name) : name;
                JSONObject framing = entry.optJSONObject("framing");
                options.add(new BannerOption(label, name,
                        entry.isNull("artAsset") ? null : entry.optString("artAsset", null),
                        framing != null ? (float) framing.optDouble("zoom", 100) : 100f,
                        framing != null ? (float) framing.optDouble("x", 0) : 0f,
                        framing != null ? (float) framing.optDouble("y", 0) : 0f));
            }
        } catch (Exception ignored) {}
        return options;
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

    // "Standard" banner pull — genuinely different math from roll() above, not just another
    // pinned name: a standard banner has no single "featured" item to rate-up/guarantee toward
    // at all, every hit at a given rarity is a uniform pick across that whole rarity's pool.
    // No 50/50, no guarantee/guaranteed4 flags — those only exist BECAUSE a limited banner has
    // a featured item to win or lose against. Kept as its own pity counter
    // ("widget_pull_standard_<category>_") entirely separate from roll()'s per-category
    // counters, matching how the real game's Standard and Character/Weapon Event Convenes
    // never share pity.
    static PullSimResult rollStandard(Context context, String category, int count) {
        boolean isWeapon = "weapon".equals(category);
        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);

        List<String> pool5 = readJsonArray(prefs, isWeapon ? "widget_pull_pool_standard_weapons" : "widget_pull_pool_standard5");
        List<String> pool4 = readJsonArray(prefs, isWeapon ? "widget_pull_pool_4star_weapons" : "widget_pull_pool_4star_chars");
        List<String> threeStarWeapons = readJsonArray(prefs, "widget_pull_pool_3star_weapons");
        String fourStarType = isWeapon ? "weapon" : "character";

        String pityKeyPrefix = "widget_pull_standard_" + category + "_";
        int pity5 = prefs.getInt(pityKeyPrefix + "pity5", 0);
        int pity4 = prefs.getInt(pityKeyPrefix + "pity4", 0);

        Random rand = new Random();
        List<PullResult> results = new ArrayList<>();
        int bestRarity = 3;

        for (int i = 0; i < count; i++) {
            pity5++;
            pity4++;
            if (rand.nextDouble() < pullRate5(pity5)) {
                String name = pool5.isEmpty() ? null : pick(pool5, rand);
                results.add(new PullResult(name, 5, category, true));
                bestRarity = 5;
                pity5 = 0;
                pity4 = 0;
            } else if (pity4 >= HARD_PITY_4STAR || rand.nextDouble() < FLAT_4STAR_RATE) {
                String name = pool4.isEmpty() ? null : pick(pool4, rand);
                results.add(new PullResult(name, 4, fourStarType, false));
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
                .apply();

        String video = bestRarity >= 5 ? "5star" : bestRarity == 4 ? "4star" : "common";
        return new PullSimResult(results, video);
    }

    // Standard's own "Both" — merges the Standard-Character and Standard-Weapon pools into ONE
    // pool sharing ONE pity track, unlike rollMerged() above (Standard has no featured/50-50
    // mechanic to touch — this is simpler: just a flat uniform pick, but across the UNION of
    // both pools instead of one). Own dedicated pity key, not either single-category Standard
    // pity: merging the two pools is mechanically a third, distinct pool, not "sometimes
    // character, sometimes weapon" using either existing counter.
    static PullSimResult rollStandardMerged(Context context, int count) {
        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        List<NameType> pool5 = new ArrayList<>();
        for (String n : readJsonArray(prefs, "widget_pull_pool_standard5")) pool5.add(new NameType(n, "character"));
        for (String n : readJsonArray(prefs, "widget_pull_pool_standard_weapons")) pool5.add(new NameType(n, "weapon"));
        List<NameType> pool4 = new ArrayList<>();
        for (String n : readJsonArray(prefs, "widget_pull_pool_4star_chars")) pool4.add(new NameType(n, "character"));
        for (String n : readJsonArray(prefs, "widget_pull_pool_4star_weapons")) pool4.add(new NameType(n, "weapon"));
        List<String> threeStarWeapons = readJsonArray(prefs, "widget_pull_pool_3star_weapons");

        String pityKeyPrefix = "widget_pull_standard_merged_";
        int pity5 = prefs.getInt(pityKeyPrefix + "pity5", 0);
        int pity4 = prefs.getInt(pityKeyPrefix + "pity4", 0);

        Random rand = new Random();
        List<PullResult> results = new ArrayList<>();
        int bestRarity = 3;

        for (int i = 0; i < count; i++) {
            pity5++;
            pity4++;
            if (rand.nextDouble() < pullRate5(pity5)) {
                NameType t = pool5.isEmpty() ? null : pick(pool5, rand);
                results.add(new PullResult(t != null ? t.name : null, 5, t != null ? t.type : "character", true));
                bestRarity = 5;
                pity5 = 0;
                pity4 = 0;
            } else if (pity4 >= HARD_PITY_4STAR || rand.nextDouble() < FLAT_4STAR_RATE) {
                NameType t = pool4.isEmpty() ? null : pick(pool4, rand);
                results.add(new PullResult(t != null ? t.name : null, 4, t != null ? t.type : "character", false));
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
                .apply();

        String video = bestRarity >= 5 ? "5star" : bestRarity == 4 ? "4star" : "common";
        return new PullSimResult(results, video);
    }

    // "All" category — every character ever released, pooled uniformly. No featured item, no
    // 50/50: those mechanics only exist because a real banner has one specific item to rate up
    // or lose against, and "every character ever" has no single such item — every 5★ hit is a
    // flat, equal-chance pick across widget_pull_pool_all_5star_chars (synced by widgetSync.js's
    // syncGlobalPullPools from ALL_5STAR_RESONATORS), same for the 4★ tier. Same base 5★ rate
    // and soft/hard pity curve as every other roll — only the featured/50-50 layer is removed,
    // not the pity math itself. Own dedicated pity track, since this is a genuinely different
    // pool than any single banner, Standard, or the merged-banner "Both".
    static PullSimResult rollAllCharacters(Context context, int count) {
        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        List<String> all5 = readJsonArray(prefs, "widget_pull_pool_all_5star_chars");
        List<String> all4 = readJsonArray(prefs, "widget_pull_pool_4star_chars");
        List<String> threeStarWeapons = readJsonArray(prefs, "widget_pull_pool_3star_weapons");

        String pityKeyPrefix = "widget_pull_all_character_";
        int pity5 = prefs.getInt(pityKeyPrefix + "pity5", 0);
        int pity4 = prefs.getInt(pityKeyPrefix + "pity4", 0);

        Random rand = new Random();
        List<PullResult> results = new ArrayList<>();
        int bestRarity = 3;

        for (int i = 0; i < count; i++) {
            pity5++;
            pity4++;
            if (rand.nextDouble() < pullRate5(pity5)) {
                String name = all5.isEmpty() ? null : pick(all5, rand);
                results.add(new PullResult(name, 5, "character", true));
                bestRarity = 5;
                pity5 = 0;
                pity4 = 0;
            } else if (pity4 >= HARD_PITY_4STAR || rand.nextDouble() < FLAT_4STAR_RATE) {
                String name = all4.isEmpty() ? null : pick(all4, rand);
                results.add(new PullResult(name, 4, "character", false));
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
                .apply();

        String video = bestRarity >= 5 ? "5star" : bestRarity == 4 ? "4star" : "common";
        return new PullSimResult(results, video);
    }
}
