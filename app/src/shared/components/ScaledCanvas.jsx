// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — shared/components/ScaledCanvas.jsx
// Renders `children` (the whole app) inside a 439px-wide box, scaled by
// availableWidth/439, with its HEIGHT set dynamically to exactly fill the
// remaining real vertical space (availableHeight/scale) — see
// useCanvasScale.js's own comment for why this is elastic rather than a
// fixed 439x976 box: that fixed-box version letterboxed whenever a real
// screen's aspect ratio didn't exactly match 439:976 (i.e. nearly every
// device), leaving a visible gap between the bottom nav and the real screen
// edge. This version always fills 100% of the real screen, both axes, with
// zero gap — the scale factor alone (uniform on x AND y via `scale(k)`)
// is what keeps every element's proportions exactly as authored.
//
// `position: fixed` descendants (the app's header/nav, this app's modals via
// getPortalRoot()) resolve relative to THIS div, not the real viewport —
// applying any CSS transform makes an element the containing block for its
// fixed-position descendants, which is exactly what turns this into a
// self-contained "canvas" the rest of the app can treat as if it were the
// whole screen.
//
// This div is also the app's only scroll container (see index.css's
// `body { overflow: hidden }` and canvasScale.js's getScrollContainer()) —
// scrolling used to happen on `body` before this existed, back when the app
// rendered directly into the real viewport with no scaling involved.
// ═══════════════════════════════════════════════════════════════════════════════

import { useEffect, useRef } from 'react';
import { useCanvasScale, CANVAS_WIDTH } from '../../hooks/useCanvasScale.js';
import { setCanvasElement } from '../scaling/canvasScale.js';

export default function ScaledCanvas({ children }) {
  const { scale, canvasHeight } = useCanvasScale();
  const canvasRef = useRef(null);

  useEffect(() => {
    setCanvasElement(canvasRef.current);
    return () => setCanvasElement(null);
  }, []);

  // Exposed as a CSS var (not just used inline below) so kuro.css can derive
  // canvas-space safe-area insets from it — a REAL device px value (e.g. a
  // 24px status bar) needs to be authored as 24/scale px inside this
  // transformed box so it still measures exactly 24px once the transform
  // scales the whole box back up/down. See kuro.css's own
  // --safe-area-*-canvas comment.
  useEffect(() => {
    document.documentElement.style.setProperty('--canvas-scale', String(scale));
  }, [scale]);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        background: '#080c14', // matches index.html/index.css's own boot background
        overflow: 'hidden',
      }}
    >
      <div
        ref={canvasRef}
        style={{
          width: CANVAS_WIDTH,
          height: canvasHeight,
          flex: '0 0 auto',
          transform: `scale(${scale})`,
          transformOrigin: 'top center',
          position: 'relative',
          overflowY: 'auto',
          overflowX: 'hidden',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {children}
      </div>
    </div>
  );
}
