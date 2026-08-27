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
// ═══════════════════════════════════════════════════════════════════════════════

import { Preferences } from '@capacitor/preferences';
import { DEFAULT_COLLECTION_IMAGES, getConveneAnimation } from '../data/banners.js';
import { STANDARD_5STAR_CHARACTERS, ALL_4STAR_RESONATORS } from '../data/characters.js';
import { WEAPON_DATA } from '../data/weapons.js';

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

    await syncBannerCategory('character', activeBanners?.characters?.[0], activeBanners?.characterBannerImage);
    await syncBannerCategory('weapon', activeBanners?.weapons?.[0], activeBanners?.weaponBannerImage);
  } catch (err) {
    console.warn('Banner widget sync failed:', err);
  }
}

async function syncBannerCategory(category, item, bannerImage) {
  const p = `widget_banner_${category}_`;
  if (!item) {
    await Preferences.remove({ key: `${p}name` });
    return;
  }
  await Preferences.set({ key: `${p}name`, value: item.name });
  await Preferences.set({ key: `${p}title`, value: item.title || item.element || item.type || '' });
  const artRel = item.imageUrl || bannerImage || '';
  await Preferences.set({ key: `${p}art_asset`, value: stripRelative(artRel) });

  const featured4Preview = (item.featured4Stars || []).slice(0, 3)
    .map((n) => ({ name: n, asset: stripRelative(DEFAULT_COLLECTION_IMAGES[n]) }))
    .filter((f) => f.asset);
  await Preferences.set({ key: `${p}featured4`, value: JSON.stringify(featured4Preview) });

  const conveneRel = getConveneAnimation(item.name);
  if (conveneRel && API_BASE_URL) {
    await Preferences.set({ key: `${p}convene_url`, value: `${API_BASE_URL}/${stripRelative(conveneRel)}` });
  } else {
    await Preferences.remove({ key: `${p}convene_url` });
  }

  await syncPullSimPools(category, item);
}

// Feeds WidgetPullSimulator.java (the widget's own ×1/×10 buttons, shown
// for whichever category is configured as primary) with everything it
// needs to roll a pull entirely natively, with no app launch involved: the
// full (unsliced — odds depend on the real count, unlike the 3-thumbnail
// preview above) featured-4★ list, the four static name pools
// core/conveneSimulator.js draws from for this banner kind (standard 5★s,
// off-rate 4★ characters, off-rate 4★ weapons, 3★ weapons), and one
// combined name->asset map covering every name across both categories'
// pools plus their featured items — everything the native result screen
// could ever need a portrait for. Kept as plain JSON of the pools/images
// this app already computes in JS, rather than also hand-porting these
// same name lists into Java where they'd inevitably drift out of sync with
// characters.js/weapons.js over time — only the roll *math* (pity curve,
// 50/50, guarantee) is duplicated in WidgetPullSimulator.java, not the data.
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

  // Shared across both categories (a name only ever maps to one asset
  // regardless of which banner it showed up on) — merged into the existing
  // map rather than overwritten, so syncing weapon after character doesn't
  // drop the character-side entries.
  const raw = await Preferences.get({ key: 'widget_pull_asset_map' });
  const assetMap = raw?.value ? JSON.parse(raw.value) : {};
  const allNames = [item.name, ...(item.featured4Stars || []), ...standard5, ...ALL_4STAR_RESONATORS, ...fourStarWeapons, ...threeStarWeapons];
  for (const name of allNames) {
    if (assetMap[name]) continue;
    const asset = stripRelative(DEFAULT_COLLECTION_IMAGES[name]);
    if (asset) assetMap[name] = asset;
  }
  await Preferences.set({ key: 'widget_pull_asset_map', value: JSON.stringify(assetMap) });
}
