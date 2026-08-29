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
// ATOMICITY: everything BannerWidget.java's own render needs — every
// currently-active character AND weapon banner, not just "the" one of each
// — is serialized into ONE JSON blob under ONE key (widget_banners_data),
// written with a single Preferences.set call. This matters because this
// function's own trigger (App.jsx's useEffect) and MainActivity.onResume()'s
// widget-refresh request are two independent, unsynchronized events; a
// refresh landing mid-write could otherwise render a mix of old+new fields.
// A single atomic blob makes that moot: whatever's in SharedPreferences at
// any given moment is always either the fully-old or fully-new payload,
// never a mix, regardless of when a render happens to land relative to a
// write.
//
// PER-WIDGET CUSTOM BANNER CHOICE: each widget instance picks ONE specific
// banner (by category + exact name, e.g. "character"/"Jinhsi" — not just
// "character vs weapon") via BannerWidgetConfigureActivity's picker grid,
// stored as widget_choice_<appWidgetId>. This requires syncing EVERY
// currently-active banner per category (there can be 2+ concurrent phases),
// not just activeBanners.characters[0]/weapons[0] — a previous version of
// this file only ever synced the first of each, which meant two "character"
// widgets could never show two different banners even when two were
// actually running, and there was no way to choose a specific one at all.
// ═══════════════════════════════════════════════════════════════════════════════

import { Preferences } from '@capacitor/preferences';
import { DEFAULT_COLLECTION_IMAGES, getConveneAnimation, getCharacterBannerArt, getWeaponBannerArt, CONVENE_ANIMATIONS, CURRENT_BANNERS } from '../data/banners.js';
import { STANDARD_5STAR_CHARACTERS, ALL_4STAR_RESONATORS } from '../data/characters.js';
import { WEAPON_DATA } from '../data/weapons.js';
import { DEFAULT_IMAGE_FRAMING } from '../hooks/useImageFraming.js';

// Bumped whenever the shape of the widget_banners_data payload changes.
// BannerWidget.java checks this before trusting a blob's fields — an
// updated app writing a new shape and an un-updated widget instance
// reading it (or vice versa, mid-update) fails closed (renders the
// "no banner configured" default) instead of NPEing on a field that
// changed meaning or disappeared.
const WIDGET_SCHEMA_VERSION = 2;

// Same VITE_API_BASE_URL used by apiBase.js/assetSW.js — needed here because
// convene-animations/ is one of capacitor-build/build.mjs's EXCLUDED_DIRS
// (too large to bundle into the APK), so the native side can't read it off
// its own assets like it does the banner art/collection thumbnails below.
// The widget instead gets an absolute, already-resolved URL.
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

export const isNativePlatform = () =>
  typeof window !== 'undefined' && !!window.Capacitor?.isNativePlatform?.();

// Strips the leading './' every path in banners.js is written with, so the
// native side can join it onto "public/" and open it via its own
// AssetManager (context.getAssets().open("public/" + asset)) — the same
// bundled files DEFAULT_COLLECTION_IMAGES resolves in the WebView, just
// read from the native side instead since a widget process can't reach
// into the app's WebView.
const stripRelative = (path) => (path || '').replace(/^\.\//, '');

// 'collection-<name>' crop values (zoom/x/y) — the same face-centered crop the in-app
// Collection grid uses, baked in here so PullBubbleService.java's banner-picker icons can
// replicate it natively (WidgetAssetUtils.decodeFramedIcon) instead of showing the raw,
// zoomed-out full-body sprite. Defaults (no framing tuned yet) match useImageFraming.js's own
// defaultFramingBase. Deliberately the HARDCODED default only, not any per-user customization
// (that lives in localStorage, which native code can't reach) — a reasonable simplification
// for a small picker icon.
function framingFor(name) {
  const f = DEFAULT_IMAGE_FRAMING[`collection-${name}`];
  return { x: f?.x ?? 0, y: f?.y ?? 0, zoom: f?.zoom ?? 100 };
}

// Builds one banner's full render+pull-sim payload. `bannerImage` is the
// category-wide fallback background (activeBanners.characterBannerImage /
// .weaponBannerImage) used when an individual item has no imageUrl of its
// own. `isWeapon` adds the weapon-only `forCharacter` field (PullBubbleService's banner-picker
// labels a weapon banner by the character it's for, e.g. "Qingxiao", not the weapon's own
// name) and its framing (the character-icon look reused for weapon-list rows too).
function buildBannerEntry(item, bannerImage, isWeapon) {
  const featured4Names = item.featured4Stars || [];
  return {
    name: item.name,
    title: item.title || item.element || item.type || '',
    artAsset: stripRelative(item.imageUrl || bannerImage || ''),
    framing: framingFor(isWeapon ? item.forCharacter : item.name),
    ...(isWeapon ? { forCharacter: item.forCharacter || null } : {}),
    // Display-only preview (max 3 thumbnails, with resolved art) for the
    // widget's own Featured-4★ row.
    featured4Preview: featured4Names.slice(0, 3)
      .map((n) => ({ name: n, asset: stripRelative(DEFAULT_COLLECTION_IMAGES[n]) }))
      .filter((f) => f.asset),
    // Full, unsliced name list — WidgetPullSimulator.java needs every
    // rate-up name (odds depend on the real count), not just the 3-item
    // display preview above.
    featured4Full: featured4Names,
    conveneUrl: (() => {
      const rel = getConveneAnimation(item.name);
      return rel && API_BASE_URL ? `${API_BASE_URL}/${stripRelative(rel)}` : null;
    })(),
  };
}

// Feeds the Android home-screen banner widget (PulseBannerWidget.java) with
// EVERY currently-active character and weapon banner (not just the first of
// each) — BannerWidgetConfigureActivity.java's picker lets the user choose
// one specific banner per widget instance, and a resized/tall widget shows
// a second one at once (PulseBannerWidget.onAppWidgetOptionsChanged).
// Standard banners get no per-name entry here — they're a rotating roster
// with no single "featured" item the way a limited character/weapon banner
// has, so they don't fit this art+name+featured4 shape at all. What DOES
// get synced for them is just the plain pool name lists (syncGlobalPullPools'
// widget_pull_pool_standard5/_standard_weapons) — enough for
// WidgetPullSimulator.rollStandard()'s own uniform-pick math, and for
// PullBubbleService's "Standard" banner-picker option, which only ever offers
// "roll the whole Characters pool" / "roll the whole Weapons pool" as two
// fixed choices, never an individual name within either. Native-only.
export async function syncBannerWidget(activeBanners) {
  if (!isNativePlatform()) return;
  try {
    const characters = (activeBanners?.characters || []).filter(Boolean);
    const weapons = (activeBanners?.weapons || []).filter(Boolean);

    const payload = {
      v: WIDGET_SCHEMA_VERSION,
      characters: characters.map((c) => buildBannerEntry(c, activeBanners?.characterBannerImage, false)),
      weapons: weapons.map((w) => buildBannerEntry(w, activeBanners?.weaponBannerImage, true)),
    };
    await Preferences.set({ key: 'widget_banners_data', value: JSON.stringify(payload) });

    await syncGlobalPullPools();
    await syncPullAssetMap(characters, weapons);
    await syncConveneRoster();
  } catch (err) {
    console.warn('Banner widget sync failed:', err);
  }
}

// Feeds ConveneRoster.java's native lookup (PullBubbleService plays a pulled 4★/5★
// character/weapon's own convene clip as part of its reveal sequence) — every name that HAS a
// convene animation at all (CONVENE_ANIMATIONS' full key list, characters AND weapons), not
// just whoever's on an active banner right now, since a pull can land on any released
// character/weapon regardless of what's currently featured. Piggybacks on syncBannerWidget's
// own trigger (App.jsx's activeBanners effect) rather than needing a separate call site — the
// roster barely changes (only grows on new release), so re-writing it on every banner-sync pass
// is cheap and keeps this one function as the single place anything native-widget-related gets
// refreshed from.
async function syncConveneRoster() {
  const roster = Object.keys(CONVENE_ANIMATIONS).map((name) => ({
    name,
    // Real gacha banner splash art (getCharacterBannerArt / getWeaponBannerArt — the same
    // source BannerCard.jsx and PulseBannerWidget's own art use), not
    // DEFAULT_COLLECTION_IMAGES' full-body collection sprite: a dedicated
    // "play this character/weapon's convene clip" widget should look like the actual banner
    // the clip is promoting, not the collection-grid artwork. Falls back to the collection
    // sprite only when no banner art is on file at all, rather than showing nothing.
    artAsset: stripRelative(getCharacterBannerArt(name) || getWeaponBannerArt(name) || DEFAULT_COLLECTION_IMAGES[name] || ''),
    conveneUrl: API_BASE_URL ? `${API_BASE_URL}/${stripRelative(CONVENE_ANIMATIONS[name])}` : null,
  })).filter((e) => e.conveneUrl); // no usable entry without a resolvable URL

  await Preferences.set({ key: 'widget_convene_roster', value: JSON.stringify({ v: WIDGET_SCHEMA_VERSION, roster }) });
}

// The four static name pools core/conveneSimulator.js draws from (standard
// 5★s, off-rate 4★ characters, off-rate 4★ weapons, 3★ weapons) — these
// don't depend on which specific banner is showing (same roster regardless
// of category or which banner is featured), so they're synced ONCE here,
// not duplicated per category the way an earlier version of this file did.
// Only a banner's own featured4 (which DOES vary per banner) lives in each
// entry inside widget_banners_data above. Kept as plain JSON of pools this
// app already computes in JS, rather than also hand-porting these same name
// lists into Java where they'd inevitably drift out of sync with
// characters.js/weapons.js over time — only the roll *math* (pity curve,
// 50/50, guarantee) is duplicated in WidgetPullSimulator.java, not the data.
async function syncGlobalPullPools() {
  const standard5 = [...STANDARD_5STAR_CHARACTERS];
  const fourStarWeapons = Object.keys(WEAPON_DATA).filter(n => WEAPON_DATA[n].rarity === 4);
  const threeStarWeapons = Object.keys(WEAPON_DATA).filter(n => WEAPON_DATA[n].rarity === 3 && n !== 'Beguiling Melody');

  const standardWeaponNames = (CURRENT_BANNERS.standardWeapons || []).map((w) => w.name);

  await Preferences.set({ key: 'widget_pull_pool_standard5', value: JSON.stringify(standard5) });
  await Preferences.set({ key: 'widget_pull_pool_4star_chars', value: JSON.stringify(ALL_4STAR_RESONATORS) });
  await Preferences.set({ key: 'widget_pull_pool_4star_weapons', value: JSON.stringify(fourStarWeapons) });
  await Preferences.set({ key: 'widget_pull_pool_3star_weapons', value: JSON.stringify(threeStarWeapons) });
  // Standard-weapon-banner equivalent of standard5 above — PullBubbleService's "Standard >
  // Weapon" pick rolls WidgetPullSimulator.rollStandard('weapon', ...) against this pool.
  await Preferences.set({ key: 'widget_pull_pool_standard_weapons', value: JSON.stringify(standardWeaponNames) });
}

// name->asset map covering every name any active banner's pull-sim could
// ever need a portrait for (standard 5★s, off-rate 4★s, 3★ weapons, plus
// every currently-active banner's own name and its full featured4 list —
// ALL of them now, not just the first banner per category). Rebuilt FULLY
// from the current banners every sync (not merged into whatever was there
// before): a merge-only map could never correct or remove an entry for a
// retired/renamed character, only ever grow.
async function syncPullAssetMap(characters, weapons) {
  const standard5 = [...STANDARD_5STAR_CHARACTERS];
  const fourStarWeapons = Object.keys(WEAPON_DATA).filter(n => WEAPON_DATA[n].rarity === 4);
  const threeStarWeapons = Object.keys(WEAPON_DATA).filter(n => WEAPON_DATA[n].rarity === 3 && n !== 'Beguiling Melody');
  const allNames = [
    ...characters.flatMap((c) => [c.name, ...(c.featured4Stars || [])]),
    ...weapons.flatMap((w) => [w.name, ...(w.featured4Stars || [])]),
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
