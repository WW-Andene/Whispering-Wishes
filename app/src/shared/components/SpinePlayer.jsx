// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — shared/components/SpinePlayer.jsx
// Animated Spine character renderer. Two independent systems live here:
//
//   BANNER_SPINE_CHARACTERS — Spine 4.2 JSON, in-repo at /spine/role_<id>/,
//     rendered by BannerCard on the tracker. Runtime: window.spine (4.2).
//
//   SPRITE_SPINE_CHARACTERS — Spine 4.1 binary .skel from the source,
//     placed under /portraits/<id>/, rendered in CollectionGridCard and the
//     detail modals. Runtime: window.spine41 (4.1).
//
// The two systems share this file but NOT their keyspace: sprite keys derive
// from the source's portrait codename (lowercased) and may collide with banner
// codenames for unrelated characters (e.g. banner luokeke=Lumi, sprite
// luokeke=Roccia). To keep the lookup unambiguous we expose a merged flat
// map `SPINE_CHARACTERS` keyed by surface-prefixed ids (`banner:xigelika`,
// `sprite:fuluoluo`). `getSpineId(name, {surface})` returns one of those
// prefixed ids; downstream code treats the whole string as opaque.
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useEffect, useId, useRef, useState, memo } from 'react';
import { useSpineTuning } from '../../hooks/useSpineTuning.js';
import { useSpineBudget } from '../../hooks/useSpineBudget.js';
import { useInView } from '../../hooks/useInView.js';
import { getPrerenderedIdle } from '../spinePrerenderManifest.js';

// SVG color-matrix filter used to chroma-key black out of MP4 prerenders.
// MP4/H.264 has no alpha channel, so the capture pipeline bakes a solid
// black background. The matrix's last row sets the output alpha to
// 3 * (R + G + B), so pixels at or near pure black drop to alpha=0 while
// any non-black pixel (down to mid-gray) clamps to alpha=1. Antialiased
// edges between black and character get a smooth alpha gradient.
//
// Injected once into <body> on module load so the filter URL is always
// resolvable. Skipped on the server side (ssr) and on hot-reload re-imports.
const SVG_FILTER_ID = 'spine-prerender-drop-black';
if (typeof document !== 'undefined' && !document.getElementById(SVG_FILTER_ID)) {
  const wrap = document.createElement('div');
  wrap.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden;pointer-events:none;';
  wrap.setAttribute('aria-hidden', 'true');
  wrap.innerHTML =
    '<svg xmlns="http://www.w3.org/2000/svg" width="0" height="0">' +
    `<filter id="${SVG_FILTER_ID}" color-interpolation-filters="sRGB">` +
    '<feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  3 3 3 0 0"/>' +
    '</filter>' +
    '</svg>';
  document.body.appendChild(wrap);
}

// Banner spine — tx/ty tuned per-character based on face offset from skeleton center.
export const BANNER_SPINE_CHARACTERS = {
  xigelika:    { name: 'Sigrika',      element: 'Aero',    scale: 2.3, tx: 3,    ty: 2.5 },
  qiuyuan:     { name: 'Qiuyuan',      element: 'Aero',    scale: 2.3, tx: 0.5,  ty: 2.5 },
  zanni:       { name: 'Zani',         element: 'Electro', scale: 2.0, tx: -0.5, ty: -7 },
  feibi:       { name: 'Phoebe',       element: 'Spectro', scale: 2.0, tx: 5.5,  ty: -10 },
  linnai:      { name: 'Lynae',        element: 'Spectro', scale: 2.0, tx: 9.5,  ty: -10.5 },
  jinxi:       { name: 'Jinhsi',       element: 'Spectro', scale: 2.3, tx: 1.5,  ty: 2.5 },
  luokeke:     { name: 'Lumi',         element: 'Glacio',  scale: 2.3, tx: 1,    ty: 2.5 },
  yinlin:      { name: 'Yinlin',       element: 'Electro', scale: 2.3, tx: 2,    ty: 2.5 },
  bulante:     { name: 'Brant',        element: 'Fusion',  scale: 2.3, tx: 2.5,  ty: 2.5 },
  jiyan:       { name: 'Jiyan',        element: 'Aero',    scale: 2.3, tx: 3,    ty: 2.5 },
  xiangliyao:  { name: 'Xiangli Yao',  element: 'Electro', scale: 2.3, tx: 1.5,  ty: 2.5 },
  changli:     { name: 'Changli',      element: 'Fusion',  scale: 2.3, tx: 0,    ty: 2.5 },
  chun:        { name: 'Chun',         element: 'Glacio',  scale: 2.3, tx: 2,    ty: 2.5 },
};

// Sprite spine — all skel/atlas/webp files live under app/public/portraits/<id>/.
// Each entry may carry per-surface tuning: the top-level scale/tx/ty apply on
// the Collection grid card (the default `card` context); an optional `detail`
// sub-object holds numbers for the CharacterDetailModal header surface, and
// an optional `echo` sub-object for the EchoDetailModal 48×48 icon. Untuned
// contexts fall back to SPRITE_DEF. Tune each surface live in the admin mini
// panel (Ctrl+Alt+P) and paste the export back here to promote.
const SPRITE_DEF = { scale: 2.3, tx: -3, ty: 27.5 };
// `dir` overrides the folder (used for Rover variants that share a portrait
// file across multiple entries). `detail` / `echo` carry per-surface defaults.
const spriteEntry = (name, element, portrait, extras = {}) => {
  const dir = extras.dir || portrait.toLowerCase();
  return {
    name, element,
    scale: extras.scale ?? SPRITE_DEF.scale,
    tx:    extras.tx    ?? SPRITE_DEF.tx,
    ty:    extras.ty    ?? SPRITE_DEF.ty,
    skelUrl:  `portraits/${dir}/Portraits_${portrait}.skel`,
    atlasUrl: `portraits/${dir}/Portraits_${portrait}.atlas`,
    ...(extras.detail ? { detail: extras.detail } : {}),
    ...(extras.echo   ? { echo:   extras.echo   } : {}),
  };
};

export const SPRITE_SPINE_CHARACTERS = {
  // Per-surface tuning promoted from live adjustments on device:
  //   top-level scale/tx/ty  → Collection grid card
  //   detail: { ... }         → CharacterDetailModal header
  fuluoluo:        spriteEntry('Phrolova',         'Havoc',   'Fuluoluo',
                      { scale: 2.4, tx: -1,   ty: 23,
                        detail: { scale: 3.1,  tx: 5,    ty: 32.5 } }),
  kanteleila:      spriteEntry('Cantarella',       'Havoc',   'Kanteleila',
                      { scale: 3.15, tx: 2,
                        detail: { scale: 3.05, tx: 7,    ty: 30.5 } }),
  luokeke:         spriteEntry('Roccia',           'Havoc',   'Luokeke',
                      { tx: -4, ty: 15,
                        detail: { scale: 2.5,  tx: 6,    ty: 20 } }),
  // Rover has no in-app gender selection — one shared skeleton/atlas per
  // element, keyed to the plain CHARACTER_DATA name so getSpineId(name)
  // actually resolves it (a prior "(Male)"/"(Female)" split here never
  // matched anything, since no call site ever passed a gender-suffixed
  // name — every Rover sprite lookup silently failed). rover_female is the
  // richer of the two source folders (3 webp variants vs rover_male's 1),
  // so it's the one in use; portraits/rover_male/ is kept on disk but
  // currently unreferenced.
  rover_havoc:     spriteEntry('Rover: Havoc',   'Havoc', 'Female', { dir: 'rover_female' }),
  chun:            spriteEntry('Camellya',         'Havoc',   'Chun',
                      { scale: 2.5,  tx: -2,  ty: 22.5,
                        detail: { scale: 2.95, tx: 4,    ty: 29.5 } }),
  danjin:          spriteEntry('Danjin',           'Havoc',   'Danjin',
                      { tx: 1, ty: 21,
                        detail: { scale: 2.55, tx: 8,    ty: 28 } }),
  taoqi:           spriteEntry('Taoqi',            'Havoc',   'Taoqi',
                      { scale: 2.15, tx: -1.5, ty: 20,
                        detail: { scale: 2.5,  tx: 7,    ty: 29 } }),
  luhesi:          spriteEntry('Luuk Herssen',     'Spectro', 'Luhesi',
                      { scale: 2.95, tx: 0.5,  ty: 27.5,
                        detail: { scale: 3.55, tx: 5,    ty: 32.5 } }),
  linnai:          spriteEntry('Lynae',            'Spectro', 'Linnai',
                      { scale: 2.3,  tx: 8.5,  ty: 22.5,
                        detail: { scale: 2.35, tx: 10,   ty: 29 } }),
  qianxiao:        spriteEntry('Chisa',            'Spectro', 'Qianxiao',
                      { scale: 2.7,  tx: 3,    ty: 21.5,
                        detail: { scale: 2.9,  tx: 7,    ty: 31 } }),
  zanni:           spriteEntry('Zani',             'Spectro', 'Zanni',
                      { scale: 2.55, tx: -4,   ty: 22,
                        detail: { scale: 3.15, tx: 4,    ty: 29 } }),
  feibi:           spriteEntry('Phoebe',           'Spectro', 'Feibi',
                      { tx: -11, ty: 21.5,
                        detail: { scale: 2.55, tx: 3.5,  ty: 28.5 } }),
  shouanren:       spriteEntry('Shorekeeper',      'Spectro', 'Shouanren',
                      { scale: 2.5,  tx: -10,  ty: 17.5,
                        detail: { scale: 2.9,  tx: 1.5,  ty: 24.5 } }),
  dengdeng:        spriteEntry('Lumi',             'Glacio',  'Dengdeng',
                      { ty: 21.5,
                        detail: { scale: 2.7,  tx: 5,    ty: 30 } }),
  weilinai:        spriteEntry('Verina',           'Spectro', 'Weilinai',
                      { scale: 1.85, tx: 1,    ty: 17,
                        detail: { scale: 2.3,  tx: 8.5,  ty: 25 } }),
  rover_spectro:   spriteEntry('Rover: Spectro', 'Spectro', 'Female', { dir: 'rover_female' }),
  xigelika:        spriteEntry('Sigrika',          'Aero',    'Xigelika',
                      { ty: 22,
                        detail: { scale: 2.7,  tx: 5,    ty: 28.5 } }),
  qiuyuan:         spriteEntry('Qiuyuan',          'Aero',    'Qiuyuan',
                      { scale: 2.85, tx: 7,    ty: 23.5,
                        detail: { scale: 3.25, tx: 7,    ty: 28.5 } }),
  younuo:          spriteEntry('Iuno',             'Aero',    'Younuo',
                      { scale: 2.45, tx: 1.5,  ty: 17,
                        detail: { scale: 2.6,  tx: 7.5,  ty: 26 } }),
  katixiya:        spriteEntry('Cartethyia',       'Aero',    'Katixiya',
                      { scale: 2.4,  tx: 3.5,  ty: 24.5,
                        detail: { scale: 2.8,  tx: 6.5,  ty: 30 } }),
  rover_aero:      spriteEntry('Rover: Aero',      'Aero', 'Female', { dir: 'rover_female' }),
  xiakong:         spriteEntry('Ciaccona',         'Aero',    'Xiakong',
                      { scale: 2.9,  tx: -8,   ty: 19,
                        detail: { scale: 3.25, tx: 1.5,  ty: 24.5 } }),
  jianxin:         spriteEntry('Jianxin',          'Aero',    'Jianxin',
                      { ty: 16.5,
                        detail: { scale: 2.65, tx: 6.5,  ty: 22.5 } }),
  jiyan:           spriteEntry('Jiyan',            'Aero',    'Jiyan',
                      { scale: 3.7,  tx: -2.5, ty: 21.5,
                        detail: { scale: 2.85, tx: 6,    ty: 29 } }),
  qiushui:         spriteEntry('Aalto',            'Aero',    'Qiushui',
                      { scale: 2.6,  ty: 18.5,
                        detail: { scale: 3.2,  tx: 3,    ty: 24.5 } }),
  yangyang:        spriteEntry('Yangyang',         'Aero',    'Yangyang',
                      { scale: 2.1,  tx: 3.5,  ty: 20,
                        detail: { scale: 2.55, tx: 7,    ty: 28 } }),
  buling:          spriteEntry('Buling',           'Havoc',   'Buling',
                      { scale: 2.3,  ty: 22.5,
                        detail: { scale: 2.35, tx: 7.5,  ty: 28 } }),
  aogusita:        spriteEntry('Augusta',          'Electro', 'Aogusita',
                      { scale: 2.95, tx: -3,   ty: 25,
                        detail: { scale: 3.15, tx: 4,    ty: 29.5 } }),
  xiangliyao:      spriteEntry('Xiangli Yao',      'Electro', 'Xiangliyao',
                      { scale: 2.75, tx: 13,   ty: 26,
                        detail: { scale: 2.8,  tx: 12.5, ty: 31.5 } }),
  jinxi:           spriteEntry('Jinhsi',           'Spectro', 'Jinxi',
                      { ty: 23.5,
                        detail: { scale: 2.8,  tx: 6,    ty: 30.5 } }),
  yuanwu:          spriteEntry('Yuanwu',           'Electro', 'Yuanwu',
                      { scale: 2.5,  tx: -7.5, ty: 23,
                        detail: { scale: 2.7,  tx: 4.5,  ty: 28 } }),
  yinlin:          spriteEntry('Yinlin',           'Electro', 'Yinlin',
                      { scale: 2.55, tx: -0.5, ty: 22.5,
                        detail: { scale: 2.75, tx: 7,    ty: 28.5 } }),
  kakaluo:         spriteEntry('Calcharo',         'Electro', 'Kakaluo',
                      { scale: 4.85, tx: -16,  ty: 13.5,
                        detail: { scale: 2.75, tx: -3.5, ty: 29.5 } }),
  rover_electro:   spriteEntry('Rover: Electro',   'Electro', 'Female', { dir: 'rover_female' }),
  // Daniya's webp is stored on the source's CDN as Portraits_DaNiYa.webp (mixed
  // case); the atlas references it verbatim and Spine resolves it relative to
  // atlasUrl, so we preserve the exact casing on disk.
  daniya:          spriteEntry('Denia',            'Electro', 'Daniya'),
  aimisi:          spriteEntry('Aemeath',          'Electro', 'Aimisi',
                      { scale: 2.3,  tx: 10,   ty: 22,
                        detail: { scale: 2.6,  tx: 7.5,  ty: 28.5 } }),
  moning:          spriteEntry('Mornye',           'Havoc',   'Moning',
                      { scale: 2.25, tx: -3,   ty: 19,
                        detail: { scale: 2.55, tx: 6,    ty: 24 } }),
  jiabeilina:      spriteEntry('Galbrena',         'Fusion',  'Jiabeilina',
                      { scale: 2.7,  tx: -11.5, ty: 19,
                        detail: { scale: 3.3,  tx: 0.5,  ty: 25.5 } }),
  lupa:            spriteEntry('Lupa',             'Fusion',  'Lupa',
                      { scale: 2.75, tx: -2,   ty: 11,
                        detail: { scale: 2.9,  tx: 3.5,  ty: 19 } }),
  bulante:         spriteEntry('Brant',            'Fusion',  'Bulante',
                      { scale: 2.75, tx: 5.5,  ty: 20.5,
                        detail: { scale: 2.8,  tx: 9,    ty: 25 } }),
  changli:         spriteEntry('Changli',          'Fusion',  'Changli',
                      { tx: -7.5, ty: 22.5,
                        detail: { scale: 2.75, tx: 4.5,  ty: 30 } }),
  motefei:         spriteEntry('Mortefi',          'Fusion',  'Motefei',
                      { scale: 2.6,  tx: -1,   ty: 23.5,
                        detail: { scale: 3.2,  tx: 4.5,  ty: 31 } }),
  anke:            spriteEntry('Encore',           'Fusion',  'Anke',
                      { scale: 1.8,  tx: 2,    ty: 18,
                        detail: { scale: 2.1,  tx: 11,   ty: 24.5 } }),
  feixue:          spriteEntry('Hiyuki',           'Glacio',  'Feixue'),
  kelaita:         spriteEntry('Carlotta',         'Fusion',  'Kelaita',
                      { scale: 2.2,  tx: -5,   ty: 23,
                        detail: { scale: 2.35, tx: 6,    ty: 28.5 } }),
  youhu:           spriteEntry('Youhu',            'Glacio',  'Youhu',
                      { scale: 2.1,  tx: 4,    ty: 21.5,
                        detail: { scale: 2.45, tx: -50,  ty: 26 } }),
  zhezhi:          spriteEntry('Zhezhi',           'Glacio',  'Zhezhi',
                      { scale: 2.75, tx: 2.5,  ty: 10.5,
                        detail: { scale: 3.35, tx: 6.5,  ty: 19 } }),
  lingyang:        spriteEntry('Lingyang',         'Glacio',  'Lingyang',
                      { scale: 1.8,  tx: -3,   ty: 16,
                        detail: { scale: 2,    tx: 7.5,  ty: 25.5 } }),
  baizhi:          spriteEntry('Baizhi',           'Glacio',  'Baizhi',
                      { tx: 1.5, ty: 21.5,
                        detail: { scale: 2.9,  tx: 7,    ty: 31 } }),
  sanhua:          spriteEntry('Sanhua',           'Glacio',  'Sanhua',
                      { scale: 2.4,  tx: -8,   ty: 21,
                        detail: { scale: 2.65, tx: 4,    ty: 30 } }),
  // Untuned — scale/tx/ty fall back to SPRITE_DEF until adjusted live in the
  // admin mini panel (Ctrl+Alt+P) and promoted here.
  luosela:         spriteEntry('Lucilla',           'Glacio',  'LuoSeLa'),
  suisui:          spriteEntry('Suisui',            'Glacio',  'Suisui'),
  rebecca:         spriteEntry('Rebecca',           'Electro', 'Rebecca'),
  qingxiao:        spriteEntry('Qingxiao',          'Aero',    'Qingxiao'),
  lucy:            spriteEntry('Lucy',              'Spectro', 'Lucy'),
  jingran:         spriteEntry('Jingran',           'Fusion',  'Jingran'),
  xuanling:        spriteEntry('Yangyang: Xuanling','Havoc',   'Xuanling'),
};

// Merged view for lookup by surface-prefixed id. Keys collide between the two
// source maps; prefixing disambiguates. `surface` attaches to each entry so
// the player / admin panel can tell them apart without re-checking the map.
export const SPINE_CHARACTERS = {
  ...Object.fromEntries(
    Object.entries(BANNER_SPINE_CHARACTERS).map(([k, v]) => [`banner:${k}`, { ...v, surface: 'banner' }]),
  ),
  ...Object.fromEntries(
    Object.entries(SPRITE_SPINE_CHARACTERS).map(([k, v]) => [`sprite:${k}`, { ...v, surface: 'collection' }]),
  ),
};

const BANNER_NAME_TO_KEY = Object.fromEntries(
  Object.entries(BANNER_SPINE_CHARACTERS).map(([k, v]) => [v.name.toLowerCase(), k]),
);
const SPRITE_NAME_TO_KEY = Object.fromEntries(
  Object.entries(SPRITE_SPINE_CHARACTERS).map(([k, v]) => [v.name.toLowerCase(), k]),
);

// Feature flag: sprite-surface Spine animations (SPRITE_SPINE_CHARACTERS) are
// limited to the character detail modal's full-spine viewer panel. Every
// other sprite call site (collection grid, detail-modal header preview, echo
// "recommended for" avatars) gates on this and falls back to a static image
// when it's false. Kept as a single flag here rather than deleting those call
// sites, so re-enabling sprite surfaces elsewhere is a one-line change.
export const SPINE_SPRITES_ENABLED_OUTSIDE_PANEL = false;

export function getSpineId(displayName, { surface = 'banner' } = {}) {
  if (!displayName) return null;
  const lc = displayName.toLowerCase();
  if (surface === 'collection') {
    const key = SPRITE_NAME_TO_KEY[lc];
    return key ? `sprite:${key}` : null;
  }
  const key = BANNER_NAME_TO_KEY[lc];
  return key ? `banner:${key}` : null;
}

function SpinePlayerComponent({
  characterId,
  animation = 'idle',
  loop = true,
  className = '',
  style = {},
  showControls = false,
  backgroundColor = '#00000000',
  onError,
  paused = false,
  scaleOverride,
  txOverride,
  tyOverride,
  fallbackImgUrl = null,
  fallbackImgStyle = null,
  context = 'card',
}) {
  const containerRef = useRef(null);
  const playerRef = useRef(null);
  const [failed, setFailed] = useState(false);

  // Tier 0 — Pre-rendered idle loop (WebM or animated WebP, whichever
  // exists on disk). The build-time manifest at
  // app/src/shared/spinePrerenderManifest.js lists which sprite characters
  // have a prerender plus the format. We only attempt the tier-0 path
  // when the manifest knows about it, so chars without a prerender skip
  // the 404 and go straight to live WebGL. Regenerated by tools/build-
  // prerender-manifest.mjs (auto-runs as a `prebuild` step).
  const charDataLookup = SPINE_CHARACTERS[characterId];
  // Pass characterId so banner entries (no skelUrl on the registry) can be
  // resolved via their `banner:<id>` prefix.
  // The `full` context (character-detail modal's full-spine viewer) skips
  // tier 0 on purpose: its whole point is showing the real, hi-res live
  // skeleton, not the small pre-baked idle loop optimized for grid/header
  // thumbnails — going straight to tier 1 avoids that loop reading as a
  // near-static clip at showcase size.
  const prerenderEntry = context === 'full' ? null : getPrerenderedIdle(charDataLookup, characterId);
  const [prerenderFailed, setPrerenderFailed] = useState(false);
  const usePrerender = !!prerenderEntry && !prerenderFailed;
  // Gates the MP4/WebM prerender <video>'s opacity until it actually has a
  // decodable frame — portraits/spine (this data) are excluded from the
  // native bundle (see capacitor-build/build.mjs) and fetched over the
  // network at runtime, so on a slow connection a <video> with no data yet
  // renders as the browser's generic media-player glyph instead of staying
  // invisible over the static art behind it.
  const [videoReady, setVideoReady] = useState(false);
  const lastVideoSrcRef = useRef(null);

  // Tier 1 gating — WebGL spine is expensive (one context per instance);
  // browsers cap concurrent contexts. We only mount it when the wrapper is
  // actually in the viewport AND a global concurrency-budget slot is free.
  // Otherwise the static fallback img renders in its place until both
  // conditions are satisfied.
  const [wrapRef, inView] = useInView();
  const slotId = useId();
  const wantWebGL = !!charDataLookup && !usePrerender && !failed;
  const granted = useSpineBudget(slotId, wantWebGL && inView);
  const useWebGL = wantWebGL && inView && granted;

  useEffect(() => {
    if (!useWebGL) return undefined;
    if (!containerRef.current || !characterId || failed) return undefined;
    const charData = SPINE_CHARACTERS[characterId];
    if (!charData) { setFailed(true); return; }
    // Sprite-spine assets (skelUrl) are exported from Spine 4.1 and need the
    // secondary runtime at window.spine41. Banner-spine JSONs run on 4.2.
    // Both runtimes are loaded dynamically (main.jsx's loadSpineRuntimes,
    // kicked off once the boot splash starts fading) rather than as static
    // synchronous <script> tags now — normally long done loading by the
    // time a user reaches any Spine-animated view, but the !spineLib check
    // right below is the real guard for the rare case they aren't yet
    // (falls back to setFailed rather than throwing).
    const spineLib = charData.skelUrl ? window.spine41 : window.spine;
    if (!spineLib?.SpinePlayer) {
      setFailed(true);
      return;
    }

    if (playerRef.current) {
      playerRef.current.dispose();
      playerRef.current = null;
    }
    containerRef.current.innerHTML = '';

    // Strip the surface prefix when constructing banner asset URLs.
    const bareId = characterId.replace(/^(banner|sprite):/, '');
    const basePath = `spine/role_${bareId}`;
    const prefix = `c_${bareId}_1`;
    const assetUrls = charData.skelUrl
      ? { skelUrl: charData.skelUrl, atlasUrl: charData.atlasUrl }
      : { jsonUrl: `${basePath}/${prefix}.json`, atlasUrl: `${basePath}/${prefix}.atlas` };

    try {
      playerRef.current = new spineLib.SpinePlayer(containerRef.current, {
        ...assetUrls,
        animation,
        loop,
        showControls,
        backgroundColor,
        alpha: true,
        premultipliedAlpha: false,
        showLoading: true,
        success: (player) => {
          if (paused && player && player.animationState) {
            try { player.animationState.timeScale = 0; } catch (_) {}
          }
        },
        error: (player, msg) => {
          if (containerRef.current) containerRef.current.innerHTML = '';
          setFailed(true);
          if (onError) onError(characterId, msg);
        },
      });
    } catch (err) {
      if (containerRef.current) containerRef.current.innerHTML = '';
      setFailed(true);
      if (onError) onError(characterId, err);
    }

    return () => {
      if (playerRef.current) {
        try { playerRef.current.dispose(); } catch (_) {}
        playerRef.current = null;
      }
      if (containerRef.current) containerRef.current.innerHTML = '';
    };
  }, [characterId, animation, loop, showControls, backgroundColor, failed, paused, useWebGL]);

  const charData = SPINE_CHARACTERS[characterId] || {};
  // Tuning is stored per (characterId, context) pair so the grid card, the
  // detail-modal header, and the echo "Recommended For" icon can each have
  // independent scale/tx/ty. The `card` context is the backwards-compatible
  // default — it inherits the numeric fields off the SPINE_CHARACTERS entry
  // so existing Phrolova tuning promoted into the registry still applies.
  const tuningKey = context && context !== 'card' ? `${characterId}#${context}` : characterId;
  const [tuning] = useSpineTuning(tuningKey);
  const isDefaultContext = !context || context === 'card';
  // Per-context defaults live in sub-objects on the registry entry
  // (`charData.detail`, `charData.echo`). An untuned context falls back to
  // the `card` baseline (top-level scale/tx/ty) rather than identity
  // (1/0/0) — a character's card framing is already a much closer starting
  // point than "no zoom at all", since every character needs *some* zoom to
  // fill its box (the source art/skeleton bounds include a lot of surrounding
  // space). The admin panel's sliders still start from this same baseline
  // and the user can promote a dedicated per-context tuning from there.
  const ctxDefaults = isDefaultContext ? charData : (charData[context] || charData);
  const defScale = ctxDefaults.scale ?? 1;
  const defTx = ctxDefaults.tx ?? 0;
  const defTy = ctxDefaults.ty ?? 0;
  // Resolution order: explicit *Override prop > live tuning (mini panel) > registry default.
  const scale = scaleOverride !== undefined ? scaleOverride : (tuning.scale ?? defScale);
  const tx = txOverride !== undefined ? txOverride : (tuning.tx ?? defTx);
  const ty = tyOverride !== undefined ? tyOverride : (tuning.ty ?? defTy);

  // Replace `transform: scale(N) translate(tx%, ty%)` with absolute
  // positioning so the inner element gets actual width/height = N×100%.
  // Why: spine-player creates its canvas at the container's CSS size, and
  // a static <img> samples down to its layout box. CSS `transform: scale()`
  // doesn't add pixels — it interpolates the existing rendered size, so
  // anything tuned with scale > 1 was being upscaled with browser
  // smoothing. Sizing the inner element directly to scale×parent makes
  // the canvas (or img) physically larger, and modern browsers sample the
  // skel/atlas/webp source at the higher target — same visual placement,
  // crisp output.
  //
  // The visual placement math: CSS `scale(s) translate(tx%, ty%)` first
  // scales, then translates by tx% of the SCALED element. To get the
  // identical center using absolute positioning on an N×100% box:
  //     left% = 50 × (1 − s) + tx × s
  //     top%  = 50 × (1 − s) + ty × s
  // (verified on paper: scale=2, tx=10 → left=−30%, identical visual
  // center to the original transform.)
  const isIdentityFit = scale === 1 && !tx && !ty;
  const fitStyle = isIdentityFit
    ? { width: '100%', height: '100%' }
    : {
        position: 'absolute',
        width: `${scale * 100}%`,
        height: `${scale * 100}%`,
        left: `${50 * (1 - scale) + tx * scale}%`,
        top: `${50 * (1 - scale) + ty * scale}%`,
      };

  // Render branches all share the same outer wrapper so the IntersectionObserver
  // ref stays attached across tier transitions (otherwise the observer would
  // re-init on every state flip).
  let inner = null;

  if (failed) {
    // Hard fail — neither tier 0 nor tier 1 worked. Show the static portrait
    // (which uses its own framing config from the call site, NOT spine
    // tuning, because the static art is a different image than the spine).
    inner = fallbackImgUrl ? (
      <img
        src={fallbackImgUrl}
        alt=""
        loading="lazy"
        className="w-full h-full pointer-events-none"
        style={{ objectFit: 'contain', ...fallbackImgStyle }}
      />
    ) : null;
  } else if (usePrerender) {
    // Tier 0 — pre-rendered idle loop. Animated WebP -> <img>, WebM ->
    // <video> (autoplay loop muted playsinline). Same content as the spine
    // canvas, so spine fit (scale/tx/ty) applies. Absolute-positioned at
    // scale×100% so the asset renders at native source resolution instead
    // of being CSS-upscaled.
    //
    // Manifest URLs are stored relative (no leading '/') so the build
    // script stays path-agnostic. Coerce to absolute here so the browser
    // resolves them against the app root, not the current SPA route.
    const rawUrl = prerenderEntry.url;
    const absUrl = rawUrl.startsWith('/') ? rawUrl : '/' + rawUrl;
    // Prerenders are captured WITH the spine fit transform already baked
    // in (the dev panel records the live spine canvas after scale/tx/ty
    // have been applied). Re-applying `fitStyle` to the prerendered media
    // would double-position it — pushing the character out of the visible
    // band when the original tuning included a non-zero ty (e.g. Zani
    // banner ty=-7). Use a plain fill-the-wrapper style instead.
    const prerenderFill = { width: '100%', height: '100%' };
    if (prerenderEntry.format === 'tmf') {
      // TMF prerender — vendored player at /vendor/tmf/. Element is
      // registered on first script load (idempotent inside the module).
      // We inject a <script type="module"> rather than a dynamic import()
      // because Rollup tries to statically resolve leading-`/` import
      // specifiers at build time and fails (the file is a public-folder
      // asset, not a bundled module). The script tag is a pure runtime
      // load — the bundler never sees it.
      if (typeof document !== 'undefined'
          && !customElements.get('tmf-player')
          && !document.querySelector('script[data-tmf-player]')) {
        const s = document.createElement('script');
        s.type = 'module';
        s.src = '/vendor/tmf/tmf-player-element.mjs';
        s.dataset.tmfPlayer = '1';
        s.onerror = () => setPrerenderFailed(true);
        document.head.appendChild(s);
      }
      inner = (
        <tmf-player
          src={absUrl}
          autoplay=""
          loop=""
          muted=""
          class="pointer-events-none"
          style={{ objectFit: 'contain', ...prerenderFill }}
          onError={() => setPrerenderFailed(true)}
        />
      );
    } else if (prerenderEntry.format === 'video') {
      // MP4 prerenders have no alpha — captured against pure black. The SVG
      // filter injected at module top maps black → transparent at decode
      // time, with smooth alpha on antialiased edges. WebM (VP9) carries
      // real alpha and skips the filter.
      //
      // objectFit: 'cover' rather than 'contain' — captures are square
      // (1024×1024 typical) but BannerCard is rectangular. With 'contain'
      // the square video gets letterboxed inside the wide rectangle, the
      // transparent margins reveal the static banner art beneath, and the
      // character looks small + obscured. 'cover' fills the container by
      // cropping the top/bottom of the square — those are transparent
      // margins anyway since the character is centered, so nothing visible
      // is lost.
      const isMp4 = /\.mp4(?:$|\?)/i.test(rawUrl);
      // Adjust videoReady when the source changes — the officially
      // sanctioned "reset state on prop change during render" pattern
      // (see videoReady's declaration above for why).
      if (lastVideoSrcRef.current !== absUrl) {
        lastVideoSrcRef.current = absUrl;
        if (videoReady) setVideoReady(false);
      }
      inner = (
        <video
          src={absUrl}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className="pointer-events-none"
          style={{
            objectFit: 'contain',
            transform: 'scale(1.5)',
            transformOrigin: 'center',
            opacity: videoReady ? 1 : 0,
            transition: 'opacity 0.3s ease',
            ...(isMp4 ? { filter: `url(#${SVG_FILTER_ID})` } : null),
            ...prerenderFill,
          }}
          onLoadedData={() => setVideoReady(true)}
          onLoadedMetadata={(e) => { e.currentTarget.playbackRate = 0.5; }}
          onError={() => setPrerenderFailed(true)}
        />
      );
    } else {
      inner = (
        <img
          src={absUrl}
          alt=""
          loading="lazy"
          decoding="async"
          className="pointer-events-none"
          style={{ objectFit: 'contain', ...prerenderFill }}
          onError={() => setPrerenderFailed(true)}
        />
      );
    }
  } else if (useWebGL) {
    // Tier 1 — live WebGL spine. Container sized to scale×100% so the
    // canvas's pixel buffer scales with it (spine-player allocates
    // canvas.width × devicePixelRatio pixels, so a bigger CSS box means
    // a higher-resolution render — no CSS upscaling).
    inner = <div ref={containerRef} style={fitStyle} />;
  } else if (fallbackImgUrl) {
    // Off-screen / waiting for a budget slot — show the static portrait
    // until we can mount the live spine. Same as the `failed` branch:
    // static config, not spine config.
    inner = (
      <img
        src={fallbackImgUrl}
        alt=""
        loading="lazy"
        className="w-full h-full pointer-events-none"
        style={{ objectFit: 'contain', ...fallbackImgStyle }}
      />
    );
  }

  if (inner === null && (failed || !wantWebGL) && !fallbackImgUrl) return null;

  return (
    <div
      ref={wrapRef}
      className={className}
      style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden', ...style }}
    >
      {inner}
    </div>
  );
}

export const SpinePlayer = memo(SpinePlayerComponent);
export default SpinePlayer;
