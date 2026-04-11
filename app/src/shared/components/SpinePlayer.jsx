// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — shared/components/SpinePlayer.jsx
// Animated Spine character renderer using @esotericsoftware/spine-player 4.2.
// Loads .json + .atlas + .png triplet from /spine/{folder}/ and plays idle loop.
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useEffect, useRef, useState, memo } from 'react';
import { SpinePlayer as SpinePlayerLib } from '@esotericsoftware/spine-player';
import '@esotericsoftware/spine-player/dist/spine-player.css';

// Internal pinyin → display name mapping
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

// English display name → pinyin spine ID (case-insensitive lookup)
const NAME_TO_SPINE_ID = Object.fromEntries(
  Object.entries(SPINE_CHARACTERS).map(([id, { name }]) => [name.toLowerCase(), id])
);

/** Look up spine ID from English display name. Returns null if no spine asset exists. */
export function getSpineId(displayName) {
  if (!displayName) return null;
  return NAME_TO_SPINE_ID[displayName.toLowerCase()] || null;
}

/**
 * SpinePlayer — renders a single Spine-animated resonator.
 *
 * @param {string}  characterId  — key from SPINE_CHARACTERS (e.g. 'jinxi')
 * @param {string}  [animation]  — animation name (default: 'idle')
 * @param {boolean} [loop]       — loop the animation (default: true)
 * @param {string}  [className]  — optional CSS class for the container
 * @param {object}  [style]      — optional inline styles for the container
 * @param {boolean} [showControls] — show spine player UI controls (default: false)
 * @param {string}  [backgroundColor] — canvas bg color (default: transparent)
 */
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
    if (!SPINE_CHARACTERS[characterId]) {
      console.warn(`[SpinePlayer] Unknown character: "${characterId}"`);
      setFailed(true);
      return;
    }

    // Clean up previous instance
    if (playerRef.current) {
      playerRef.current.dispose();
      playerRef.current = null;
    }

    // Clear any error HTML the spine-player may have dumped
    containerRef.current.innerHTML = '';

    const basePath = `/spine/role_${characterId}`;
    const prefix = `c_${characterId}_1`;

    try {
      playerRef.current = new SpinePlayerLib(containerRef.current, {
        jsonUrl: `${basePath}/${prefix}.json`,
        atlasUrl: `${basePath}/${prefix}.atlas`,
        animation,
        loop,
        showControls,
        backgroundColor,
        alpha: true,
        premultipliedAlpha: false,
        preserveDrawingBuffer: false,
        viewport: {
          debugRender: false,
        },
        showLoading: true,
        error: (player, msg) => {
          console.error(`[SpinePlayer] "${characterId}" error:`, msg);
          // Clear the error HTML that spine-player dumps into the container
          if (containerRef.current) containerRef.current.innerHTML = '';
          setFailed(true);
          if (onError) onError(characterId, msg);
        },
      });
    } catch (err) {
      console.error(`[SpinePlayer] Failed to init "${characterId}":`, err);
      if (containerRef.current) containerRef.current.innerHTML = '';
      setFailed(true);
      if (onError) onError(characterId, err);
    }

    return () => {
      if (playerRef.current) {
        try { playerRef.current.dispose(); } catch (_) { /* noop */ }
        playerRef.current = null;
      }
    };
  }, [characterId, animation, loop, showControls, backgroundColor, failed]);

  // If spine failed, render nothing — let parent show fallback
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
