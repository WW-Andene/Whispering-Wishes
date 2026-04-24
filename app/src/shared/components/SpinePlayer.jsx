// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — shared/components/SpinePlayer.jsx
// Animated Spine character renderer using spine-player 4.2 loaded from CDN.
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useEffect, useRef, useState, memo } from 'react';

// Each entry declares which surface(s) its spine data is valid on:
//   surfaces: ['banner']     → banner-spine asset at /spine/role_<id>/c_<id>_1.{json,atlas,png}
//                              renders on the tracker BannerCard only.
//   surfaces: ['collection'] → sprite-spine asset at the declared skelUrl/atlasUrl
//                              renders in the Collection grid / detail modals only.
//   surfaces: ['banner', 'collection'] → character has both assets.
// Banner spine and sprite spine are DIFFERENT files with different formats,
// different folders, and different purposes. Don't cross-render them.
export const SPINE_CHARACTERS = {
  // --- Banner spine: tx/ty tuned per-character based on face offset from skeleton center ---
  xigelika:    { name: 'Sigrika',      element: 'Aero',    scale: 2.3, tx: 3,   ty: 2.5, surfaces: ['banner'] },
  qiuyuan:     { name: 'Qiuyuan',      element: 'Aero',    scale: 2.3, tx: 0.5, ty: 2.5, surfaces: ['banner'] },
  zanni:       { name: 'Zani',         element: 'Electro', scale: 2.0, tx: -0.5, ty: -7, surfaces: ['banner'] },
  feibi:       { name: 'Phoebe',       element: 'Spectro', scale: 2.0, tx: 5.5,  ty: -10, surfaces: ['banner'] },
  linnai:      { name: 'Lynae',        element: 'Spectro', scale: 2.0, tx: 9.5,  ty: -10.5, surfaces: ['banner'] },
  jinxi:       { name: 'Jinhsi',       element: 'Spectro', scale: 2.3, tx: 1.5, ty: 2.5, surfaces: ['banner'] },
  luokeke:     { name: 'Lumi',         element: 'Glacio',  scale: 2.3, tx: 1,   ty: 2.5, surfaces: ['banner'] },
  yinlin:      { name: 'Yinlin',       element: 'Electro', scale: 2.3, tx: 2,   ty: 2.5, surfaces: ['banner'] },
  bulante:     { name: 'Brant',        element: 'Fusion',  scale: 2.3, tx: 2.5, ty: 2.5, surfaces: ['banner'] },
  jiyan:       { name: 'Jiyan',        element: 'Aero',    scale: 2.3, tx: 3,   ty: 2.5, surfaces: ['banner'] },
  xiangliyao:  { name: 'Xiangli Yao',  element: 'Electro', scale: 2.3, tx: 1.5, ty: 2.5, surfaces: ['banner'] },
  changli:     { name: 'Changli',      element: 'Fusion',  scale: 2.3, tx: 0,   ty: 2.5, surfaces: ['banner'] },
  chun:        { name: 'Chun',         element: 'Glacio',  scale: 2.3, tx: 2,   ty: 2.5, surfaces: ['banner'] },
  // --- Sprite spine: binary .skel sourced from nanoka.cc, assets under /portraits/ ---
  fuluoluo:    { name: 'Phrolova',     element: 'Havoc',   scale: 2.3, tx: 2,   ty: 2.5,
                 skelUrl:  'portraits/fuluoluo/Portraits_Fuluoluo.skel',
                 atlasUrl: 'portraits/fuluoluo/Portraits_Fuluoluo.atlas',
                 surfaces: ['collection'] },
};

const NAME_TO_SPINE_ID = Object.fromEntries(
  Object.entries(SPINE_CHARACTERS).map(([id, { name }]) => [name.toLowerCase(), id])
);

export function getSpineId(displayName, { surface = 'banner' } = {}) {
  if (!displayName) return null;
  const id = NAME_TO_SPINE_ID[displayName.toLowerCase()];
  if (!id) return null;
  const entry = SPINE_CHARACTERS[id];
  if (!entry?.surfaces?.includes(surface)) return null;
  return id;
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
}) {
  const containerRef = useRef(null);
  const playerRef = useRef(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!containerRef.current || !characterId || failed) return;
    const charData = SPINE_CHARACTERS[characterId];
    if (!charData) { setFailed(true); return; }
    if (!window.spine?.SpinePlayer) {
      setFailed(true);
      return;
    }

    if (playerRef.current) {
      playerRef.current.dispose();
      playerRef.current = null;
    }
    containerRef.current.innerHTML = '';

    const basePath = `spine/role_${characterId}`;
    const prefix = `c_${characterId}_1`;
    const assetUrls = charData.skelUrl
      ? { skelUrl: charData.skelUrl, atlasUrl: charData.atlasUrl }
      : { jsonUrl: `${basePath}/${prefix}.json`, atlasUrl: `${basePath}/${prefix}.atlas` };

    try {
      playerRef.current = new window.spine.SpinePlayer(containerRef.current, {
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
    };
  }, [characterId, animation, loop, showControls, backgroundColor, failed, paused]);

  if (failed) return null;

  const charData = SPINE_CHARACTERS[characterId] || {};
  const scale = scaleOverride !== undefined ? scaleOverride : (charData.scale ?? 1);
  const tx = txOverride !== undefined ? txOverride : (charData.tx ?? 0);
  const ty = tyOverride !== undefined ? tyOverride : (charData.ty ?? 0);

  return (
    <div
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
