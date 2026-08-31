// ═══════════════════════════════════════════════════════════════════════════════
// useCanvasScale — computes ScaledCanvas.jsx's scale factor AND its resulting
// canvas height.
//
// scale = availableWidth / 439 — WIDTH-derived only, matching the app's
// original reference-device rule (439px was always the one fixed dimension
// the whole design scaled against; 976 was never a hard box, just "however
// tall the reference device's viewport happened to be"). Canvas height is
// then set to availableHeight / scale — not a fixed 976 — so the canvas's
// rendered (post-transform) box is EXACTLY availableWidth × availableHeight
// on every device: full-bleed, zero letterbox/pillarbox gap, ever.
//
// This still preserves exact proportions everywhere (that's the entire
// reason ScaledCanvas exists) — `transform: scale(k)` is applied uniformly
// to both axes regardless of which measurement drove `k`, so every element
// inside keeps the exact same width:height ratio it was authored with. What
// changes vs. a fixed 439x976 box is only how much vertical CANVAS SPACE is
// available before content needs to scroll — exactly like how much of the
// app already worked pre-engine (index.css's own comment: body was always
// the scroll container for content taller than one screen, no page was
// ever rigidly locked to exactly one viewport height). A previous version
// of this file used min(width/439, height/976), i.e. shrink-to-fit BOTH
// axes and letterbox whichever one had room left over — which is exactly
// right for a fixed-canvas game, but wrong here: on a real screen even
// slightly less tall than 976 (including, it turned out, the reference
// device itself — window.innerHeight there wasn't exactly 976 either), it
// left a visible gap between the bottom nav (pinned to the CANVAS's own
// edge) and the real screen's physical bottom edge, on nearly every device.
//
// Reads window.visualViewport when available rather than window.innerWidth/
// innerHeight — on mobile, the on-screen keyboard shrinks visualViewport's
// height without changing innerHeight (which stays the full-screen value),
// so without this the canvas wouldn't shrink when a keyboard opens and
// inputs near the bottom edge could end up covered.
// ═══════════════════════════════════════════════════════════════════════════════

import { useState, useEffect } from 'react';
import { CANVAS_WIDTH } from '../shared/scaling/canvasScale.js';

function computeState() {
  if (typeof window === 'undefined') return { scale: 1, canvasHeight: 0 };
  const vv = window.visualViewport;
  const w = vv?.width ?? window.innerWidth;
  const h = vv?.height ?? window.innerHeight;
  const scale = w / CANVAS_WIDTH;
  return { scale, canvasHeight: h / scale };
}

export function useCanvasScale() {
  const [state, setState] = useState(computeState);

  useEffect(() => {
    const update = () => setState(computeState());
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

  return state;
}

export { CANVAS_WIDTH };
