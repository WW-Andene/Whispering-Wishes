// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — utils/widgetSync.js
// Feeds the Android home-screen widgets with data they can't reach
// themselves (no WebView access from a widget's RemoteViews process).
// Native-only — there's no home-screen widget concept on the web build.
//
// How the bridge works: @capacitor/preferences writes into a plain Android
// SharedPreferences file named "CapacitorStorage" (its hardcoded default
// group — see node_modules/@capacitor/preferences/android's
// PreferencesConfiguration.java). BannerWidget.java reads that same file
// directly with no plugin/JS involved. The widget then re-renders on
// Android's own periodic schedule (minUpdatePeriodMillis in
// res/xml/banner_widget_info.xml — the OS enforces a 30-minute floor
// regardless of what's requested), so data can be up to ~30 minutes stale;
// MainActivity.onResume() also nudges an immediate update so reopening the
// app refreshes it sooner in practice.
//
// ATOMICITY: every field BannerWidget.java's own render needs for one
// category (name/title/art/featured4/convene url) is serialized into ONE
// JSON blob under ONE key (`${p}data`), written with a single Preferences.set
// call, rather than as separate keys the way this used to work. That
// previous shape had a real race: MainActivity.onResume()'s widget-refresh
// request and this function's own multi-key write are two independent,
// unsynchronized triggers, and a refresh landing mid-write could render a
// mix of old+new fields (new art with the old name, etc.) — nothing here
// signaled the native side "sync in progress" or "sync complete." A single
// atomic blob makes that moot: whatever's in SharedPreferences at any given
// moment is always either the fully-old or fully-new payload, never a mix,
// regardless of when a render happens to land relative to a write.
// ═══════════════════════════════════════════════════════════════════════════════

import { Preferences } from '@capacitor/preferences';
import { DEFAULT_COLLECTION_IMAGES, getConveneAnimation } from '../data/banners.js';
import { STANDARD_5STAR_CHARACTERS, ALL_4STAR_RESONATORS } from '../data/characters.js';
import { WEAPON_DATA } from '../data/weapons.js';

// Bumped whenever the shape of the `${p}data` payload changes.
// BannerWidget.java checks this before trusting a blob's fields — an
// updated app writing a new shape and an un-updated widget instance
// reading it (or vice versa, mid-update) fails closed (renders the
// "no banner configured" default) instead of NPEing on a field that
// changed meaning or disappeared.
const WIDGET_SCHEMA_VERSION = 1;

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

// Strips the leading './' every path in banners.js is written with, so
// BannerWidget.java can join it onto "public/" and open it via its own
// AssetManager (context.getAssets().open("public/" + asset)) — the same
// bundled files DEFAULT_COLLECTION_IMAGES resolves in the WebView, just
// read from the native side instead since a widget process can't reach
// into the app's WebView.
const stripRelative = (path) => (path || '').replace(/^\.\//, '');

// Feeds the Android home-screen banner widget (BannerWidget.java) with
// BOTH the character and weapon banners — the widget's configure screen
// (BannerWidgetConfigureActivity.java) lets the user pick which one to
// show per widget instance, and a resized/tall widget shows both at once
// (BannerWidget.onAppWidgetOptionsChanged). Standard banners aren't synced
// here — they're a rotating roster with no single "featured" item the way
// a limited character/weapon banner has, so they don't fit this same
// art+name+featured4 shape without a materially different display; out of
// scope for now rather than forced into a shape that doesn't fit.
// Native-only.
export async function syncBannerWidget(activeBanners) {
  if (!isNativePlatform()) return;
  try {
    const categories = [];
    if (activeBanners?.characters?.[0]) categories.push('character');
    if (activeBanners?.weapons?.[0]) categories.push('weapon');
    await Preferences.set({ key: 'widget_cfg_available', value: JSON.stringify(categories) });

    const charItem = activeBanners?.characters?.[0];
    const weapItem = activeBanners?.weapons?.[0];
    await syncBannerCategory('character', charItem, activeBanners?.characterBannerImage);
    await syncBannerCategory('weapon', weapItem, activeBanners?.weaponBannerImage);
    await syncPullAssetMap(charItem, weapItem);
  } catch (err) {
    console.warn('Banner widget sync failed:', err);
  }
}

async function syncBannerCategory(category, item, bannerImage) {
  const p = `widget_banner_${category}_`;
  if (!item) {
    await Preferences.remove({ key: `${p}data` });
    // WidgetPullSimulator.java reads this one field directly (it only
    // needs the featured name, not the rest of the display payload) — a
    // single string has nothing to be internally inconsistent with, so it
    // stays its own key rather than folding into the JSON blob below.
    await Preferences.remove({ key: `${p}name` });
    return;
  }
  await Preferences.set({ key: `${p}name`, value: item.name });

  const featured4Preview = (item.featured4Stars || []).slice(0, 3)
    .map((n) => ({ name: n, asset: stripRelative(DEFAULT_COLLECTION_IMAGES[n]) }))
    .filter((f) => f.asset);

  const conveneRel = getConveneAnimation(item.name);
  const conveneUrl = conveneRel && API_BASE_URL ? `${API_BASE_URL}/${stripRelative(conveneRel)}` : null;

  const payload = {
    v: WIDGET_SCHEMA_VERSION,
    name: item.name,
    title: item.title || item.element || item.type || '',
    artAsset: stripRelative(item.imageUrl || bannerImage || ''),
    featured4: featured4Preview,
    conveneUrl,
  };
  await Preferences.set({ key: `${p}data`, value: JSON.stringify(payload) });

  await syncPullSimPools(category, item);
}

// Feeds WidgetPullSimulator.java (the widget's own ×1/×10 buttons, shown
// for whichever category is configured as primary) with everything it
// needs to roll a pull entirely natively, with no app launch involved: the
// full (unsliced — odds depend on the real count, unlike the 3-thumbnail
// preview above) featured-4★ list and the four static name pools
// core/conveneSimulator.js draws from for this banner kind (standard 5★s,
// off-rate 4★ characters, off-rate 4★ weapons, 3★ weapons). Kept as plain
// JSON of the pools this app already computes in JS, rather than also
// hand-porting these same name lists into Java where they'd inevitably
// drift out of sync with characters.js/weapons.js over time — only the
// roll *math* (pity curve, 50/50, guarantee) is duplicated in
// WidgetPullSimulator.java, not the data.
async function syncPullSimPools(category, item) {
  const p = `widget_pull_${category}_`;
  await Preferences.set({ key: `${p}featured4`, value: JSON.stringify(item.featured4Stars || []) });

  const standard5 = [...STANDARD_5STAR_CHARACTERS];
  const fourStarWeapons = Object.keys(WEAPON_DATA).filter(n => WEAPON_DATA[n].rarity === 4);
  const threeStarWeapons = Object.keys(WEAPON_DATA).filter(n => WEAPON_DATA[n].rarity === 3 && n !== 'Beguiling Melody');

  await Preferences.set({ key: `${p}pool_standard5`, value: JSON.stringify(standard5) });
  await Preferences.set({ key: `${p}pool_4star_chars`, value: JSON.stringify(ALL_4STAR_RESONATORS) });
  await Preferences.set({ key: `${p}pool_4star_weapons`, value: JSON.stringify(fourStarWeapons) });
  await Preferences.set({ key: `${p}pool_3star_weapons`, value: JSON.stringify(threeStarWeapons) });
}

// name->asset map covering every name either category's pull-sim could
// ever need a portrait for (standard 5★s, off-rate 4★s, 3★ weapons, plus
// both categories' own featured items) — shared across categories since a
// name only ever maps to one asset regardless of which banner it showed up
// on. Rebuilt FULLY from the current banners every sync (not merged into
// whatever was there before): the previous "add if missing" merge meant an
// entry for a retired/renamed character could never be corrected or
// removed, only ever added to — this map could only grow, never heal.
async function syncPullAssetMap(charItem, weapItem) {
  const standard5 = [...STANDARD_5STAR_CHARACTERS];
  const fourStarWeapons = Object.keys(WEAPON_DATA).filter(n => WEAPON_DATA[n].rarity === 4);
  const threeStarWeapons = Object.keys(WEAPON_DATA).filter(n => WEAPON_DATA[n].rarity === 3 && n !== 'Beguiling Melody');
  const allNames = [
    charItem?.name, ...(charItem?.featured4Stars || []),
    weapItem?.name, ...(weapItem?.featured4Stars || []),
    ...standard5, ...ALL_4STAR_RESONATORS, ...fourStarWeapons, ...threeStarWeapons,
  ].filter(Boolean);

  const assetMap = {};
  for (const name of allNames) {
    if (assetMap[name]) continue;
    const asset = stripRelative(DEFAULT_COLLECTION_IMAGES[name]);
    if (asset) assetMap[name] = asset;
  }
  await Preferences.set({ key: 'widget_pull_asset_map', value: JSON.stringify(assetMap) });
}
