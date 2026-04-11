// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — shared/components/SpinePlayer.jsx
// Animated Spine character renderer using spine-player 4.2 loaded from CDN.
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useEffect, useRef, useState, memo } from 'react';

export const SPINE_CHARACTERS = {
  // tx/ty tuned per-character based on face offset from skeleton center
  xigelika:    { name: 'Sigrika',      element: 'Aero',    scale: 2.3, tx: 3,   ty: 2.5 },
  qiuyuan:     { name: 'Qiuyuan',      element: 'Aero',    scale: 2.3, tx: 0.5, ty: 2.5 },
  zanni:       { name: 'Zani',         element: 'Electro', scale: 2.2, tx: -1,  ty: -4 },
  feibi:       { name: 'Phoebe',       element: 'Spectro', scale: 2.1, tx: 5,   ty: -5 },
  linnai:      { name: 'Lynae',        element: 'Spectro', scale: 2.1, tx: 9,   ty: -5 },
  jinxi:       { name: 'Jinhsi',       element: 'Spectro', scale: 2.3, tx: 1.5, ty: 2.5 },
  luokeke:     { name: 'Lumi',         element: 'Glacio',  scale: 2.3, tx: 1,   ty: 2.5 },
  yinlin:      { name: 'Yinlin',       element: 'Electro', scale: 2.3, tx: 2,   ty: 2.5 },
  bulante:     { name: 'Brant',        element: 'Fusion',  scale: 2.3, tx: 2.5, ty: 2.5 },
  jiyan:       { name: 'Jiyan',        element: 'Aero',    scale: 2.3, tx: 3,   ty: 2.5 },
  xiangliyao:  { name: 'Xiangli Yao',  element: 'Electro', scale: 2.3, tx: 1.5, ty: 2.5 },
  changli:     { name: 'Changli',      element: 'Fusion',  scale: 2.3, tx: 0,   ty: 2.5 },
  chun:        { name: 'Chun',         element: 'Glacio',  scale: 2.3, tx: 2,   ty: 2.5 },
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
  }, [characterId, animation, loop, showControls, backgroundColor, failed]);

  if (failed) return null;

  const charData = SPINE_CHARACTERS[characterId] || {};
  const { scale = 1, tx = 0, ty = 0 } = charData;

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
