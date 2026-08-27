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
import { getLocalizedEvents, DEFAULT_COLLECTION_IMAGES, getConveneAnimation } from '../data/banners.js';
import { getServerAdjustedEnd } from '../core/time.js';
import { getLocale } from '../utils/i18n.js';

// Same VITE_API_BASE_URL used by apiBase.js/assetSW.js — needed here because
// convene-animations/ is one of capacitor-build/build.mjs's EXCLUDED_DIRS
// (too large to bundle into the APK), so BannerWidget.java can't read it
// off its own assets like it does the banner art/collection thumbnails
// below. The widget instead gets an absolute, already-resolved URL and
// hands it straight to VideoView, which streams it like any other network
// video.
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

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

// Strips the leading './' every path in banners.js is written with, so
// BannerWidget.java can join it onto "public/" and open it via its own
// AssetManager (context.getAssets().open("public/" + asset)) — the same
// bundled files DEFAULT_COLLECTION_IMAGES resolves in the WebView, just
// read from the native side instead since a widget process can't reach
// into the app's WebView.
const stripRelative = (path) => (path || '').replace(/^\.\//, '');

// Feeds the Android home-screen banner widget (BannerWidget.java) with the
// currently featured character banner — art, name, up to 3 Featured 4★
// thumbnails, and (if this character has one) their convene-animation clip
// URL for the widget's ▶️ button to play in ConveneAnimationActivity.
// Native-only, same bridge as syncHomeScreenWidget above.
export async function syncBannerWidget(activeBanners) {
  if (!isNativePlatform()) return;
  try {
    const item = activeBanners?.characters?.[0];
    if (!item) {
      await Preferences.remove({ key: 'widget_banner_name' });
      return;
    }
    await Preferences.set({ key: 'widget_banner_name', value: item.name });
    await Preferences.set({ key: 'widget_banner_title', value: item.title || item.element || '' });
    const artRel = item.imageUrl || activeBanners.characterBannerImage || '';
    await Preferences.set({ key: 'widget_banner_art_asset', value: stripRelative(artRel) });

    const featured4 = (item.featured4Stars || []).slice(0, 3)
      .map((n) => ({ name: n, asset: stripRelative(DEFAULT_COLLECTION_IMAGES[n]) }))
      .filter((f) => f.asset);
    await Preferences.set({ key: 'widget_banner_featured4', value: JSON.stringify(featured4) });

    const conveneRel = getConveneAnimation(item.name);
    if (conveneRel && API_BASE_URL) {
      await Preferences.set({ key: 'widget_banner_convene_url', value: `${API_BASE_URL}/${stripRelative(conveneRel)}` });
    } else {
      await Preferences.remove({ key: 'widget_banner_convene_url' });
    }
  } catch (err) {
    console.warn('Banner widget sync failed:', err);
  }
}
