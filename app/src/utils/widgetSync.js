// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — utils/widgetSync.js
// Feeds the Android home-screen widget (EventCountdownWidget.java) with the
// name/end-time of the soonest-ending active event. Native-only — there's no
// home-screen widget concept on the web build.
//
// How the bridge works: @capacitor/preferences writes into a plain Android
// SharedPreferences file named "CapacitorStorage" (its hardcoded default
// group — see node_modules/@capacitor/preferences/android's
// PreferencesConfiguration.java). EventCountdownWidget.java reads that same
// file directly with no plugin/JS involved, since a widget's RemoteViews
// process can't touch the WebView. The widget then re-renders on Android's
// own periodic schedule (minUpdatePeriodMillis in
// res/xml/event_countdown_widget_info.xml — the OS enforces a 30-minute
// floor regardless of what's requested), so data can be up to ~30 minutes
// stale; MainActivity.onResume() also nudges an immediate update so
// reopening the app refreshes it sooner in practice.
// ═══════════════════════════════════════════════════════════════════════════════

import { Preferences } from '@capacitor/preferences';
import { getLocalizedEvents } from '../data/banners.js';
import { getServerAdjustedEnd } from '../core/time.js';
import { getLocale } from '../utils/i18n.js';

export const isNativePlatform = () =>
  typeof window !== 'undefined' && !!window.Capacitor?.isNativePlatform?.();

// Mirrors EventsTab.jsx's isEventExpired/active filter, but only cares about
// events with a real, non-recurring end date — daily/weekly resets and
// permanent/recurring content ("28 days" etc.) aren't "ending soon" in a way
// a countdown widget is useful for.
function findSoonestEvent(server) {
  const events = getLocalizedEvents(getLocale());
  const now = Date.now();
  let soonest = null;
  for (const [key, ev] of Object.entries(events)) {
    if (ev.dailyReset || ev.weeklyReset || ev.permanent || !ev.currentEnd) continue;
    const isRecurring = ev.resetType && /^~?\d+\s*(days?|d|h|m)?$/i.test(ev.resetType.trim());
    if (isRecurring) continue;
    const endMs = new Date(getServerAdjustedEnd(ev.currentEnd, server)).getTime();
    if (isNaN(endMs) || endMs <= now) continue;
    if (!soonest || endMs < soonest.endMs) soonest = { key, name: ev.name, endMs };
  }
  return soonest;
}

export async function syncHomeScreenWidget(server) {
  if (!isNativePlatform()) return;
  try {
    const soonest = findSoonestEvent(server);
    if (soonest) {
      await Preferences.set({ key: 'widget_title', value: soonest.name });
      // Epoch millis, not an ISO string — the widget's minSdk (24) predates
      // java.time (added in API 26) and this project doesn't enable core
      // library desugaring, so the native side does plain long arithmetic
      // instead of parsing a timestamp string.
      await Preferences.set({ key: 'widget_end_millis', value: String(soonest.endMs) });
    } else {
      await Preferences.remove({ key: 'widget_title' });
      await Preferences.remove({ key: 'widget_end_millis' });
    }
  } catch (err) {
    console.warn('Widget sync failed:', err);
  }
}
