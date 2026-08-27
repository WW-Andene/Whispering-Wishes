package cc.andene.whisperingwishes;

import android.content.Context;
import android.content.SharedPreferences;

import org.json.JSONArray;

import java.util.ArrayList;
import java.util.List;
import java.util.Random;

// Native Java port of core/conveneSimulator.js's character-banner branch —
// the widget's ×1/×10 buttons need to roll a pull with NO app launch
// involved (see BannerWidget.java/widget_banner.xml's comments), and
// there's no reliable way to run the real JS engine in the background
// without the app's WebView actually being active. This duplicates the
// probability MATH only (base rate, soft/hard pity, 50/50, guarantee, 4★
// rate-up+guarantee) — the actual name pools and portrait images are never
// hand-copied here, they're synced as plain JSON by widgetSync.js's
// syncPullSimPools() every time the featured banner changes, so this stays
// in sync with characters.js/weapons.js automatically.
//
// Known, accepted tradeoff (this was a deliberate choice, not an oversight):
// this simulator keeps its OWN pity counter, entirely separate from both
// the real tracked pity (state.profile) and the in-app simulator's pity
// (useConveneSimStats.js) — it starts at 0/false the first time the widget
// is used, like a fresh account, and only ever advances from its own
// prior rolls. There is no cheap way to read the real pity from here
// without launching the app.
final class WidgetPullSimulator {
    private static final String PREFS_NAME = "CapacitorStorage";
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

    static PullSimResult roll(Context context, int count) {
        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        String featuredName = prefs.getString("widget_banner_name", null);
        List<String> featured4 = readJsonArray(prefs, "widget_pull_featured4");
        List<String> standard5 = readJsonArray(prefs, "widget_pull_pool_standard5");
        List<String> fourStarChars = readJsonArray(prefs, "widget_pull_pool_4star_chars");
        List<String> fourStarWeapons = readJsonArray(prefs, "widget_pull_pool_4star_weapons");
        List<String> threeStarWeapons = readJsonArray(prefs, "widget_pull_pool_3star_weapons");

        List<NameType> pool4Rest = new ArrayList<>();
        for (String n : fourStarChars) if (!featured4.contains(n)) pool4Rest.add(new NameType(n, "character"));
        for (String n : fourStarWeapons) if (!featured4.contains(n)) pool4Rest.add(new NameType(n, "weapon"));

        int pity5 = prefs.getInt("widget_pull_pity5", 0);
        int pity4 = prefs.getInt("widget_pull_pity4", 0);
        boolean guaranteed = prefs.getBoolean("widget_pull_guaranteed", false);
        boolean guaranteed4 = prefs.getBoolean("widget_pull_guaranteed4", false);

        Random rand = new Random();
        List<PullResult> results = new ArrayList<>();
        int bestRarity = 3;

        for (int i = 0; i < count; i++) {
            pity5++;
            pity4++;
            if (rand.nextDouble() < pullRate5(pity5)) {
                String name;
                boolean isFeatured;
                if (guaranteed) {
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
                results.add(new PullResult(name, 5, "character", isFeatured));
                bestRarity = 5;
                pity5 = 0;
                pity4 = 0;
            } else if (pity4 >= HARD_PITY_4STAR || rand.nextDouble() < FLAT_4STAR_RATE) {
                if (featured4.isEmpty()) {
                    NameType off = pool4Rest.isEmpty() ? new NameType(featuredName, "character") : pick(pool4Rest, rand);
                    results.add(new PullResult(off.name, 4, off.type, false));
                } else {
                    boolean rateUp = guaranteed4 || rand.nextDouble() < FOUR_STAR_RATEUP_CHANCE;
                    guaranteed4 = !rateUp;
                    if (rateUp) {
                        results.add(new PullResult(pick(featured4, rand), 4, "character", true));
                    } else {
                        NameType off = pool4Rest.isEmpty() ? new NameType(pick(featured4, rand), "character") : pick(pool4Rest, rand);
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
                .putInt("widget_pull_pity5", pity5)
                .putInt("widget_pull_pity4", pity4)
                .putBoolean("widget_pull_guaranteed", guaranteed)
                .putBoolean("widget_pull_guaranteed4", guaranteed4)
                .apply();

        String video = bestRarity >= 5 ? "5star" : bestRarity == 4 ? "4star" : "common";
        return new PullSimResult(results, video);
    }
}
