// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — shared/components/ScaledCanvas.jsx
// Renders `children` (the whole app) inside a fixed 439×976 box, uniformly
// scaled to fit the real screen — see canvasScale.js's own comment for why.
// Everything inside sees the exact same 439×976 world regardless of the real
// device; the only thing that varies is the CSS transform scaling that whole
// box up or down, and the letterbox bars filling whatever real screen space
// the 439:976 aspect ratio doesn't cover.
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
import { useCanvasScale, CANVAS_WIDTH, CANVAS_HEIGHT } from '../../hooks/useCanvasScale.js';
import { setCanvasElement } from '../scaling/canvasScale.js';

export default function ScaledCanvas({ children }) {
  const scale = useCanvasScale();
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
        alignItems: 'center',
        justifyContent: 'center',
        background: '#080c14', // matches index.html/index.css's own boot background — the letterbox color
        overflow: 'hidden',
      }}
    >
      <div
        ref={canvasRef}
        style={{
          width: CANVAS_WIDTH,
          height: CANVAS_HEIGHT,
          flex: '0 0 auto',
          transform: `scale(${scale})`,
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
