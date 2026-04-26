// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — shared/components/SpinePlayer.jsx
// Animated Spine character renderer. Two independent systems live here:
//
//   BANNER_SPINE_CHARACTERS — Spine 4.2 JSON, in-repo at /spine/role_<id>/,
//     rendered by BannerCard on the tracker. Runtime: window.spine (4.2).
//
//   SPRITE_SPINE_CHARACTERS — Spine 4.1 binary .skel from static.nanoka.cc,
//     placed under /portraits/<id>/, rendered in CollectionGridCard and the
//     detail modals. Runtime: window.spine41 (4.1).
//
// The two systems share this file but NOT their keyspace: sprite keys derive
// from nanoka's portrait codename (lowercased) and may collide with banner
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
import { getPrerenderedIdleUrl } from '../spinePrerenderManifest.js';

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
  rover_havoc_m:   spriteEntry('Rover: Havoc (Male)',   'Havoc', 'Male',   { dir: 'rover_male' }),
  rover_havoc_f:   spriteEntry('Rover: Havoc (Female)', 'Havoc', 'Female', { dir: 'rover_female' }),
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
  rover_spectro_f: spriteEntry('Rover: Spectro (Female)', 'Spectro', 'Female', { dir: 'rover_female' }),
  rover_spectro_m: spriteEntry('Rover: Spectro (Male)',   'Spectro', 'Male',   { dir: 'rover_male' }),
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
  rover_aero_f:    spriteEntry('Rover: Aero (Female)',    'Aero', 'Female', { dir: 'rover_female' }),
  xiakong:         spriteEntry('Ciaccona',         'Aero',    'Xiakong',
                      { scale: 2.9,  tx: -8,   ty: 19,
                        detail: { scale: 3.25, tx: 1.5,  ty: 24.5 } }),
  rover_aero_m:    spriteEntry('Rover: Aero (Male)',      'Aero', 'Male',   { dir: 'rover_male' }),
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
  // Daniya's webp is stored on nanoka's CDN as Portraits_DaNiYa.webp (mixed
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

  // Tier 0 — Pre-rendered animated WebP. The build-time manifest at
  // app/src/shared/spinePrerenderManifest.js lists which sprite characters
  // have an idle.webp on disk; we only attempt the tier-0 path for those,
  // so chars without a prerender skip the 404 and go straight to live
  // WebGL. The on-disk file map is regenerated by tools/build-prerender-
  // manifest.mjs (auto-runs as a `prebuild` step).
  const charDataLookup = SPINE_CHARACTERS[characterId];
  const idleWebpUrl = getPrerenderedIdleUrl(charDataLookup);
  const [prerenderFailed, setPrerenderFailed] = useState(false);
  const useIdleWebp = !!idleWebpUrl && !prerenderFailed;

  // Tier 1 gating — WebGL spine is expensive (one context per instance);
  // browsers cap concurrent contexts. We only mount it when the wrapper is
  // actually in the viewport AND a global concurrency-budget slot is free.
  // Otherwise the static fallback img renders in its place until both
  // conditions are satisfied.
  const [wrapRef, inView] = useInView();
  const slotId = useId();
  const wantWebGL = !!charDataLookup && !useIdleWebp && !failed;
  const granted = useSpineBudget(slotId, wantWebGL && inView);
  const useWebGL = wantWebGL && inView && granted;

  useEffect(() => {
    if (!useWebGL) return undefined;
    if (!containerRef.current || !characterId || failed) return undefined;
    const charData = SPINE_CHARACTERS[characterId];
    if (!charData) { setFailed(true); return; }
    // Sprite-spine assets (skelUrl) are exported from Spine 4.1 and need the
    // secondary runtime at window.spine41. Banner-spine JSONs run on 4.2.
    // Both runtimes are loaded synchronously in index.html, so they're always
    // present here.
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
  // (`charData.detail`, `charData.echo`). Fall back to 1 / 0 / 0 when a
  // surface hasn't been tuned yet — the admin panel's sliders start neutral
  // and the user can promote from there.
  const ctxDefaults = isDefaultContext ? charData : (charData[context] || {});
  const defScale = ctxDefaults.scale ?? 1;
  const defTx = ctxDefaults.tx ?? 0;
  const defTy = ctxDefaults.ty ?? 0;
  // Resolution order: explicit *Override prop > live tuning (mini panel) > registry default.
  const scale = scaleOverride !== undefined ? scaleOverride : (tuning.scale ?? defScale);
  const tx = txOverride !== undefined ? txOverride : (tuning.tx ?? defTx);
  const ty = tyOverride !== undefined ? tyOverride : (tuning.ty ?? defTy);

  const transformStyle =
    scale !== 1 || tx || ty
      ? { transform: `scale(${scale}) translate(${tx}%, ${ty}%)`, transformOrigin: 'center center' }
      : undefined;

  // Render branches all share the same outer wrapper so the IntersectionObserver
  // ref stays attached across tier transitions (otherwise the observer would
  // re-init on every state flip).
  let inner = null;

  if (failed) {
    // Hard fail — neither tier 0 nor tier 1 worked. Show the static portrait
    // if one was supplied, otherwise nothing.
    inner = fallbackImgUrl ? (
      <img
        src={fallbackImgUrl}
        alt=""
        loading="lazy"
        className="w-full h-full pointer-events-none"
        style={{ objectFit: 'contain', ...fallbackImgStyle }}
      />
    ) : null;
  } else if (useIdleWebp) {
    // Tier 0 — animated WebP loop. Single decode, no GPU per card.
    inner = (
      <img
        src={idleWebpUrl}
        alt=""
        loading="lazy"
        decoding="async"
        className="w-full h-full pointer-events-none"
        style={{ objectFit: 'contain', ...transformStyle }}
        onError={() => setPrerenderFailed(true)}
      />
    );
  } else if (useWebGL) {
    // Tier 1 — live WebGL spine. Mounted only when on-screen and within
    // the global concurrency budget; the useEffect above tears it down
    // when either condition flips.
    inner = (
      <div
        ref={containerRef}
        className="w-full h-full"
        style={{ ...transformStyle }}
      />
    );
  } else if (fallbackImgUrl) {
    // Off-screen / waiting for a budget slot — show the static portrait
    // until we can mount the live spine.
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
      style={{ width: '100%', height: '100%', overflow: 'hidden', ...style }}
    >
      {inner}
    </div>
  );
}

export const SpinePlayer = memo(SpinePlayerComponent);
export default SpinePlayer;
