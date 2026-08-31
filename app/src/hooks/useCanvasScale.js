// ═══════════════════════════════════════════════════════════════════════════════
// useCanvasScale — computes the uniform scale factor for ScaledCanvas.jsx:
// min(availableWidth / 439, availableHeight / 976), i.e. "shrink/grow the
// whole 439×976 reference canvas as much as it can go while still fitting
// entirely inside the real screen" — the same letterboxing math a game or
// video player uses to preserve an aspect ratio, applied to the whole app.
//
// Reads window.visualViewport when available rather than window.innerWidth/
// innerHeight — on mobile, the on-screen keyboard shrinks visualViewport's
// height without changing innerHeight (which stays the full-screen value),
// so without this the canvas wouldn't shrink/reflow when a keyboard opens
// and inputs near the bottom edge could end up covered.
// ═══════════════════════════════════════════════════════════════════════════════

import { useState, useEffect } from 'react';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../shared/scaling/canvasScale.js';

function computeScale() {
  if (typeof window === 'undefined') return 1;
  const vv = window.visualViewport;
  const w = vv?.width ?? window.innerWidth;
  const h = vv?.height ?? window.innerHeight;
  return Math.min(w / CANVAS_WIDTH, h / CANVAS_HEIGHT);
}

export function useCanvasScale() {
  const [scale, setScale] = useState(computeScale);

  useEffect(() => {
    const update = () => setScale(computeScale());
    update();
    window.addEventListener('resize', update);
    window.addEventListener('orientationchange', update);
    window.visualViewport?.addEventListener('resize', update);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('orientationchange', update);
      window.visualViewport?.removeEventListener('resize', update);
    };
  }, []);

  return scale;
}

export { CANVAS_WIDTH, CANVAS_HEIGHT };
