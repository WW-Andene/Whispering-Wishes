// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — shared/components/SpinePlayer.jsx
// Animated Spine character renderer using spine-player 4.2 loaded from CDN.
// Uses window.spine.SpinePlayer (IIFE global) — not the npm ES module.
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useEffect, useRef, useState, memo } from 'react';

export const SPINE_CHARACTERS = {
  // viewport: { x, y, width, height } in skeleton coordinates
  // origin (0,0) is at character feet; y increases upward
  // Tuned so upper body fills the banner card like the static image
  xigelika:    { name: 'Sigrika',      element: 'Aero',    vp: { x: 0, y: 400, w: 1400, h: 900 } },
  qiuyuan:     { name: 'Qiuyuan',      element: 'Aero',    vp: { x: 0, y: 400, w: 1300, h: 900 } },
  zanni:       { name: 'Zani',         element: 'Electro', vp: { x: 0, y: 1800, w: 5100, h: 3200 } },
  feibi:       { name: 'Phoebe',       element: 'Spectro', vp: { x: 0, y: 400, w: 1400, h: 900 } },
  linnai:      { name: 'Rinne',        element: 'Havoc',   vp: { x: 0, y: 500, w: 1700, h: 1000 } },
  jinxi:       { name: 'Jinhsi',       element: 'Spectro', vp: { x: 0, y: 500, w: 2000, h: 1200 } },
  luokeke:     { name: 'Lumi',         element: 'Glacio',  vp: { x: 0, y: 350, w: 1200, h: 750 } },
  yinlin:      { name: 'Yinlin',       element: 'Electro', vp: { x: 0, y: 350, w: 1500, h: 900 } },
  bulante:     { name: 'Brant',        element: 'Fusion',  vp: { x: 0, y: 450, w: 1500, h: 950 } },
  jiyan:       { name: 'Jiyan',        element: 'Aero',    vp: { x: 0, y: 400, w: 1600, h: 950 } },
  xiangliyao:  { name: 'Xiangli Yao',  element: 'Electro', vp: { x: 0, y: 500, w: 1550, h: 1000 } },
  changli:     { name: 'Changli',      element: 'Fusion',  vp: { x: 0, y: 550, w: 1750, h: 1100 } },
  chun:        { name: 'Chun',         element: 'Glacio',  vp: { x: 0, y: 400, w: 1200, h: 800 } },
};

const NAME_TO_SPINE_ID = Object.fromEntries(
  Object.entries(SPINE_CHARACTERS).map(([id, { name }]) => [name.toLowerCase(), id])
);

export function getSpineId(displayName) {
  if (!displayName) return null;
  return NAME_TO_SPINE_ID[displayName.toLowerCase()] || null;
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
}) {
  const containerRef = useRef(null);
  const playerRef = useRef(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!containerRef.current || !characterId || failed) return;
    if (!SPINE_CHARACTERS[characterId]) { setFailed(true); return; }
    if (!window.spine?.SpinePlayer) {
      console.error('[SpinePlayer] window.spine.SpinePlayer not loaded');
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
    const charData = SPINE_CHARACTERS[characterId];
    const vp = charData.vp;

    try {
      playerRef.current = new window.spine.SpinePlayer(containerRef.current, {
        jsonUrl: `${basePath}/${prefix}.json`,
        atlasUrl: `${basePath}/${prefix}.atlas`,
        animation,
        loop,
        showControls,
        backgroundColor,
        alpha: true,
        premultipliedAlpha: false,
        showLoading: true,
        viewport: {
          x: vp.x,
          y: vp.y,
          width: vp.w,
          height: vp.h,
          padLeft: '0%',
          padRight: '0%',
          padTop: '0%',
          padBottom: '0%',
          debugRender: false,
        },
        error: (player, msg) => {
          console.error(`[SpinePlayer] "${characterId}":`, msg);
          if (containerRef.current) containerRef.current.innerHTML = '';
          setFailed(true);
          if (onError) onError(characterId, msg);
        },
      });
    } catch (err) {
      console.error(`[SpinePlayer] init failed "${characterId}":`, err);
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
  }, [characterId, animation, loop, showControls, backgroundColor, failed]);

  if (failed) return null;

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ width: '100%', height: '100%', ...style }}
    />
  );
}

export const SpinePlayer = memo(SpinePlayerComponent);
export default SpinePlayer;
