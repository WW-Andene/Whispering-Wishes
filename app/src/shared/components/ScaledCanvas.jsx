// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — shared/components/ScaledCanvas.jsx
// Renders `children` (the whole app) inside a 439px-wide box, scaled by
// availableWidth/439, with its HEIGHT set dynamically to exactly fill the
// remaining real vertical space (availableHeight/scale) — see
// useCanvasScale.js's own comment for why this is elastic rather than a
// fixed 439x976 box.
//
// TWO nested divs, not one, and that split matters:
//   - canvasRef (transform box): applies `transform: scale(k)`, never
//     scrolls. Any element with a `transform` becomes the containing block
//     for its `position: fixed` descendants (that's what turns this into a
//     self-contained "canvas" the header/nav/modals can treat as the whole
//     screen) — but that containing-block relationship is unreliable across
//     browsers specifically when the SAME element also has `overflow:auto`
//     and actually scrolls. An earlier version put both on one div, and on
//     at least one real Android browser the fixed header/nav ended up
//     scrolling away with the page content instead of staying pinned —
//     exactly the "broken bottom" bug this split fixes.
//   - scrollRef (scroll box): a plain, non-transformed absolutely-positioned
//     child that fills the transform box exactly and does the actual
//     `overflow-y: auto` scrolling. Position:fixed descendants still
//     resolve against canvasRef (CSS only climbs to the nearest ancestor
//     that actually has a transform when computing a fixed element's
//     containing block — a plain scrolling div in between doesn't count),
//     so they correctly stay pinned to the canvas edges regardless of how
//     far the inner content has scrolled.
//
// getPortalRoot() (canvasScale.js) targets canvasRef, not scrollRef — a
// portaled modal/dropdown doesn't need to be a descendant of the scrolling
// content to resolve correctly (per the above), and staying out of it
// sidesteps any interaction with the scroll box's own overflow clipping.
// ═══════════════════════════════════════════════════════════════════════════════

import { useEffect, useRef } from 'react';
import { useCanvasScale, CANVAS_WIDTH } from '../../hooks/useCanvasScale.js';
import { setCanvasElement, setScrollElement } from '../scaling/canvasScale.js';

export default function ScaledCanvas({ children }) {
  const { scale, canvasHeight } = useCanvasScale();
  const canvasRef = useRef(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    setCanvasElement(canvasRef.current);
    return () => setCanvasElement(null);
  }, []);

  useEffect(() => {
    setScrollElement(scrollRef.current);
    return () => setScrollElement(null);
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
          overflow: 'hidden',
        }}
      >
        <div
          ref={scrollRef}
          style={{
            position: 'absolute',
            inset: 0,
            overflowY: 'auto',
            overflowX: 'hidden',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
