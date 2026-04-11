// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — shared/components/SpinePlayer.jsx
// Animated Spine character renderer using spine-player 4.2 loaded from CDN.
// Uses window.spine.SpinePlayer (IIFE global) — not the npm ES module.
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useEffect, useRef, useState, memo } from 'react';

export const SPINE_CHARACTERS = {
  xigelika:    { name: 'Sigrika',      element: 'Aero' },
  qiuyuan:     { name: 'Qiuyuan',      element: 'Aero' },
  zanni:       { name: 'Zani',         element: 'Electro' },
  feibi:       { name: 'Phoebe',       element: 'Spectro' },
  linnai:      { name: 'Rinne',        element: 'Havoc' },
  jinxi:       { name: 'Jinhsi',       element: 'Spectro' },
  luokeke:     { name: 'Lumi',         element: 'Glacio' },
  yinlin:      { name: 'Yinlin',       element: 'Electro' },
  bulante:     { name: 'Brant',        element: 'Fusion' },
  jiyan:       { name: 'Jiyan',        element: 'Aero' },
  xiangliyao:  { name: 'Xiangli Yao',  element: 'Electro' },
  changli:     { name: 'Changli',      element: 'Fusion' },
  chun:        { name: 'Chun',         element: 'Glacio' },
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

    const basePath = `/spine/role_${characterId}`;
    const prefix = `c_${characterId}_1`;

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
