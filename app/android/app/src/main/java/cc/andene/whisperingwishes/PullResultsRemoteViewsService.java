package cc.andene.whisperingwishes;

import android.content.Intent;
import android.content.SharedPreferences;
import android.graphics.Color;
import android.widget.RemoteViews;
import android.widget.RemoteViewsService;

import org.json.JSONArray;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.List;

// Backs widget_banner.xml's widget_pull_results_list — the "colored pills with names"
// summary WidgetPullPlaybackService shows after its one-image-at-a-time slideshow. A
// ListView/RemoteViewsFactory is the actually-supported RemoteViews mechanism for a
// VARIABLE-length list (1 or 10 pulled items) — a GridLayout can't flex cleanly to an
// arbitrary count the way this needs to.
//
// Data comes from widget_pull_results_<appWidgetId> (a plain JSON array of
// {name, rarity}), written by WidgetPullPlaybackService right before it calls
// setRemoteAdapter + notifyAppWidgetViewDataChanged — read fresh on every
// onDataSetChanged() rather than cached at factory-construction time, since the same
// widget instance re-rolls (and overwrites this key) on every ×1/×10 tap.
public class PullResultsRemoteViewsService extends RemoteViewsService {
    private static final String PREFS_NAME = "CapacitorStorage";

    @Override
    public RemoteViewsFactory onGetViewFactory(Intent intent) {
        int appWidgetId = intent.getIntExtra(android.appwidget.AppWidgetManager.EXTRA_APPWIDGET_ID, -1);
        return new Factory(getApplicationContext(), appWidgetId);
    }

    private static final class Factory implements RemoteViewsFactory {
        private final android.content.Context context;
        private final int appWidgetId;
        private List<Entry> entries = new ArrayList<>();

        private static final class Entry {
            final String name;
            final int rarity;
            Entry(String name, int rarity) { this.name = name; this.rarity = rarity; }
        }

        Factory(android.content.Context context, int appWidgetId) {
            this.context = context;
            this.appWidgetId = appWidgetId;
        }

        @Override public void onCreate() { onDataSetChanged(); }

        @Override
        public void onDataSetChanged() {
            entries = new ArrayList<>();
            SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, android.content.Context.MODE_PRIVATE);
            String json = prefs.getString("widget_pull_results_" + appWidgetId, null);
            if (json == null) return;
            try {
                JSONArray arr = new JSONArray(json);
                for (int i = 0; i < arr.length(); i++) {
                    JSONObject o = arr.getJSONObject(i);
                    entries.add(new Entry(o.optString("name", "?"), o.optInt("rarity", 3)));
                }
            } catch (Exception ignored) {}
        }

        @Override public void onDestroy() { entries = new ArrayList<>(); }
        @Override public int getCount() { return entries.size(); }
        @Override public long getItemId(int position) { return position; }
        @Override public boolean hasStableIds() { return true; }
        @Override public RemoteViews getLoadingView() { return null; }
        @Override public int getViewTypeCount() { return 1; }

        @Override
        public RemoteViews getViewAt(int position) {
            Entry e = entries.get(position);
            RemoteViews row = new RemoteViews(context.getPackageName(), R.layout.widget_pull_pill_item);
            row.setTextViewText(R.id.pull_pill_name, e.name);
            row.setTextColor(R.id.pull_pill_name, rarityColor(e.rarity));
            return row;
        }

        // Same convention as WidgetPullActivity's own rarityColor() (kept as this
        // service's fallback on decode failure — see WidgetPullPlaybackService).
        private int rarityColor(int rarity) {
            switch (rarity) {
                case 5: return Color.parseColor("#EAB308");
                case 4: return Color.parseColor("#A855F7");
                default: return Color.parseColor("#38BDF8");
            }
        }
    }
}
