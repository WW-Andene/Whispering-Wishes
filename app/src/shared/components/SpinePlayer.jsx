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

import React, { useEffect, useRef, useState, memo } from 'react';
import { useSpineTuning, useSpineFreeze } from '../../hooks/useSpineTuning.js';

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
// `skelUrl`/`atlasUrl` are paths relative to app/public. Defaults of
// scale: 2.3, tx: -3, ty: 27.5 are carried over from Phrolova; every
// skeleton's root origin differs, so expect to tune each entry live in the
// admin mini panel and paste the exported values back here as defaults.
const SPRITE_DEF = { scale: 2.3, tx: -3, ty: 27.5 };
const spriteEntry = (name, element, portrait, dir = null) => ({
  name, element, ...SPRITE_DEF,
  skelUrl:  `portraits/${dir || portrait.toLowerCase()}/Portraits_${portrait}.skel`,
  atlasUrl: `portraits/${dir || portrait.toLowerCase()}/Portraits_${portrait}.atlas`,
});

export const SPRITE_SPINE_CHARACTERS = {
  fuluoluo:        spriteEntry('Phrolova',                     'Havoc',   'Fuluoluo'),
  kanteleila:      spriteEntry('Cantarella',                    'Havoc',   'Kanteleila'),
  luokeke:         spriteEntry('Roccia',                        'Havoc',   'Luokeke'),
  rover_havoc_m:   spriteEntry('Rover: Havoc (Male)',           'Havoc',   'Male',   'rover_male'),
  rover_havoc_f:   spriteEntry('Rover: Havoc (Female)',         'Havoc',   'Female', 'rover_female'),
  chun:            spriteEntry('Camellya',                      'Havoc',   'Chun'),
  danjin:          spriteEntry('Danjin',                        'Havoc',   'Danjin'),
  taoqi:           spriteEntry('Taoqi',                         'Havoc',   'Taoqi'),
  luhesi:          spriteEntry('Luuk Herssen',                  'Spectro', 'Luhesi'),
  linnai:          spriteEntry('Lynae',                         'Spectro', 'Linnai'),
  qianxiao:        spriteEntry('Chisa',                         'Spectro', 'Qianxiao'),
  zanni:           spriteEntry('Zani',                          'Electro', 'Zanni'),
  feibi:           spriteEntry('Phoebe',                        'Spectro', 'Feibi'),
  shouanren:       spriteEntry('Shorekeeper',                   'Spectro', 'Shouanren'),
  dengdeng:        spriteEntry('Lumi',                          'Glacio',  'Dengdeng'),
  weilinai:        spriteEntry('Verina',                        'Spectro', 'Weilinai'),
  rover_spectro_f: spriteEntry('Rover: Spectro (Female)',       'Spectro', 'Female', 'rover_female'),
  rover_spectro_m: spriteEntry('Rover: Spectro (Male)',         'Spectro', 'Male',   'rover_male'),
  xigelika:        spriteEntry('Sigrika',                       'Aero',    'Xigelika'),
  qiuyuan:         spriteEntry('Qiuyuan',                       'Aero',    'Qiuyuan'),
  younuo:          spriteEntry('Iuno',                          'Aero',    'Younuo'),
  katixiya:        spriteEntry('Cartethyia',                    'Aero',    'Katixiya'),
  rover_aero_f:    spriteEntry('Rover: Aero (Female)',          'Aero',    'Female', 'rover_female'),
  xiakong:         spriteEntry('Ciaccona',                      'Aero',    'Xiakong'),
  rover_aero_m:    spriteEntry('Rover: Aero (Male)',            'Aero',    'Male',   'rover_male'),
  jianxin:         spriteEntry('Jianxin',                       'Aero',    'Jianxin'),
  jiyan:           spriteEntry('Jiyan',                         'Aero',    'Jiyan'),
  qiushui:         spriteEntry('Aalto',                         'Aero',    'Qiushui'),
  yangyang:        spriteEntry('Yangyang',                      'Aero',    'Yangyang'),
  buling:          spriteEntry('Buling',                        'Havoc',   'Buling'),
  aogusita:        spriteEntry('Augusta',                       'Electro', 'Aogusita'),
  xiangliyao:      spriteEntry('Xiangli Yao',                   'Electro', 'Xiangliyao'),
  jinxi:           spriteEntry('Jinhsi',                        'Spectro', 'Jinxi'),
  yuanwu:          spriteEntry('Yuanwu',                        'Electro', 'Yuanwu'),
  yinlin:          spriteEntry('Yinlin',                        'Electro', 'Yinlin'),
  kakaluo:         spriteEntry('Calcharo',                      'Electro', 'Kakaluo'),
  // Daniya's webp is stored on nanoka's CDN as Portraits_DaNiYa.webp (mixed
  // case); the atlas references it verbatim and Spine resolves it relative to
  // atlasUrl, so we preserve the exact casing on disk.
  daniya:          spriteEntry('Denia',                         'Electro', 'Daniya'),
  aimisi:          spriteEntry('Aemeath',                       'Electro', 'Aimisi'),
  moning:          spriteEntry('Mornye',                        'Havoc',   'Moning'),
  jiabeilina:      spriteEntry('Galbrena',                      'Fusion',  'Jiabeilina'),
  lupa:            spriteEntry('Lupa',                          'Fusion',  'Lupa'),
  bulante:         spriteEntry('Brant',                         'Fusion',  'Bulante'),
  changli:         spriteEntry('Changli',                       'Fusion',  'Changli'),
  motefei:         spriteEntry('Mortefi',                       'Fusion',  'Motefei'),
  anke:            spriteEntry('Encore',                        'Fusion',  'Anke'),
  feixue:          spriteEntry('Hiyuki',                        'Glacio',  'Feixue'),
  kelaita:         spriteEntry('Carlotta',                      'Fusion',  'Kelaita'),
  youhu:           spriteEntry('Youhu',                         'Glacio',  'Youhu'),
  zhezhi:          spriteEntry('Zhezhi',                        'Glacio',  'Zhezhi'),
  lingyang:        spriteEntry('Lingyang',                      'Glacio',  'Lingyang'),
  baizhi:          spriteEntry('Baizhi',                        'Glacio',  'Baizhi'),
  sanhua:          spriteEntry('Sanhua',                        'Glacio',  'Sanhua'),
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

// ─── Concurrent-player budget ────────────────────────────────────────────────
// Each SpinePlayer creates its own WebGL context + RAF loop. Browsers cap
// concurrent WebGL contexts (typically 16) and drop the oldest on overflow,
// and even under the cap the per-frame cost of dozens of skeletons tanks the
// frame rate on mobile. We gate active instances on two axes:
//   1. IntersectionObserver — only mount when the card is visible (lazy mode).
//   2. A module-level slot pool — hard cap on simultaneously-live players.
// When over budget, SpinePlayer renders the supplied fallback img instead and
// subscribes to the wake list; it retries as soon as another instance frees
// its slot.
const MAX_CONCURRENT_SPINE = 10;
const activeSlots = new Set();
const slotWaiters = new Set();

function acquireSlot(token) {
  if (activeSlots.has(token)) return true;
  if (activeSlots.size >= MAX_CONCURRENT_SPINE) return false;
  activeSlots.add(token);
  return true;
}
function releaseSlot(token) {
  if (activeSlots.delete(token)) {
    slotWaiters.forEach((fn) => { try { fn(); } catch (_) {} });
  }
}
function subscribeSlot(fn) {
  slotWaiters.add(fn);
  return () => slotWaiters.delete(fn);
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
  lazy = false,
  fallbackImgUrl = null,
  fallbackImgStyle = null,
  rootMargin = '100px',
}) {
  const outerRef = useRef(null);
  const containerRef = useRef(null);
  const playerRef = useRef(null);
  const slotTokenRef = useRef(null);
  const [failed, setFailed] = useState(false);
  const [inView, setInView] = useState(!lazy);
  const [hasSlot, setHasSlot] = useState(false);
  const [spine41Ready, setSpine41Ready] = useState(() => !!window.spine41?.SpinePlayer);
  const [frozen] = useSpineFreeze();
  const effectivePaused = paused || frozen;

  // Wait for the namespaced 4.1 runtime to finish loading (see index.html).
  useEffect(() => {
    if (spine41Ready) return;
    const onReady = () => setSpine41Ready(true);
    window.addEventListener('spine41-ready', onReady);
    return () => window.removeEventListener('spine41-ready', onReady);
  }, [spine41Ready]);

  // IntersectionObserver gates the actual player on viewport visibility. When
  // `lazy` is false (modals, banners — single instance) we skip this entirely.
  useEffect(() => {
    if (!lazy) { setInView(true); return; }
    if (!outerRef.current || typeof IntersectionObserver === 'undefined') {
      setInView(true);
      return;
    }
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) setInView(e.isIntersecting);
      },
      { rootMargin, threshold: 0 },
    );
    obs.observe(outerRef.current);
    return () => obs.disconnect();
  }, [lazy, rootMargin]);

  // Slot acquisition. Per-mount token so two instances of the same characterId
  // don't share a slot. Releases on unmount and whenever the dependencies flip
  // us out of in-view state.
  useEffect(() => {
    if (!inView || failed || !characterId) { setHasSlot(false); return; }
    const token = Symbol('spine-slot');
    slotTokenRef.current = token;
    let acquired = acquireSlot(token);
    setHasSlot(acquired);
    let unsubWake = null;
    if (!acquired) {
      unsubWake = subscribeSlot(() => {
        if (slotTokenRef.current !== token) return;
        if (acquireSlot(token)) {
          acquired = true;
          setHasSlot(true);
        }
      });
    }
    return () => {
      if (unsubWake) unsubWake();
      if (slotTokenRef.current === token) slotTokenRef.current = null;
      releaseSlot(token);
    };
  }, [characterId, inView, failed]);

  useEffect(() => {
    if (!containerRef.current || !characterId || failed || !hasSlot) return;
    const charData = SPINE_CHARACTERS[characterId];
    if (!charData) { setFailed(true); return; }
    // Sprite-spine assets (skelUrl) are exported from Spine 4.1 and need the
    // secondary runtime at window.spine41. Banner-spine JSONs run on 4.2.
    const spineLib = charData.skelUrl ? window.spine41 : window.spine;
    if (!spineLib?.SpinePlayer) {
      if (charData.skelUrl && !spine41Ready) return; // wait for load event
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
          if (effectivePaused && player && player.animationState) {
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
  }, [characterId, animation, loop, showControls, backgroundColor, failed, effectivePaused, spine41Ready, hasSlot]);

  // Toggle the running player's timeScale when freeze flips without tearing
  // down the whole WebGL context — avoids the visible reload flicker and the
  // cost of re-initializing 10 contexts when the user taps the toggle.
  useEffect(() => {
    const player = playerRef.current;
    if (!player?.animationState) return;
    try { player.animationState.timeScale = effectivePaused ? 0 : 1; } catch (_) {}
  }, [effectivePaused]);

  const charData = SPINE_CHARACTERS[characterId] || {};
  // Resolution order: explicit *Override prop > live tuning (mini panel) > SPINE_CHARACTERS default.
  const [tuning] = useSpineTuning(characterId);
  const scale = scaleOverride !== undefined ? scaleOverride : (tuning.scale ?? charData.scale ?? 1);
  const tx = txOverride !== undefined ? txOverride : (tuning.tx ?? charData.tx ?? 0);
  const ty = tyOverride !== undefined ? tyOverride : (tuning.ty ?? charData.ty ?? 0);

  // Player isn't active (failed / off-screen / waiting for a slot). Fall back
  // to the static image if one was supplied; otherwise render an empty shell
  // so the IntersectionObserver still has a target.
  const showFallback = failed || !inView || !hasSlot;
  if (showFallback) {
    if (failed && !fallbackImgUrl) return null;
    return (
      <div
        ref={outerRef}
        className={className}
        style={{ width: '100%', height: '100%', overflow: 'hidden', ...style }}
      >
        {fallbackImgUrl ? (
          <img
            src={fallbackImgUrl}
            alt=""
            loading="lazy"
            className="w-full h-full pointer-events-none"
            style={{ objectFit: 'contain', ...fallbackImgStyle }}
          />
        ) : null}
      </div>
    );
  }

  return (
    <div
      ref={outerRef}
      className={className}
      style={{ width: '100%', height: '100%', overflow: 'hidden', ...style }}
    >
      <div
        ref={containerRef}
        style={{
          width: '100%',
          height: '100%',
          transform: scale !== 1 || tx || ty ? `scale(${scale}) translate(${tx}%, ${ty}%)` : undefined,
          transformOrigin: 'center center',
        }}
      />
    </div>
  );
}

export const SpinePlayer = memo(SpinePlayerComponent);
export default SpinePlayer;
