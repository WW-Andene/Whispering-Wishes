// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — ViewportFrame
// Locks the whole app to a single reference layout (the Xiaomi 13T's CSS
// viewport, 439px wide) and uniformly scales it to fit any real device
// width/height, so every phone renders the identical proportions/disposition
// instead of Tailwind's responsive breakpoints reflowing differently per
// screen size. The frame itself is position:fixed to the real viewport (so
// it never moves), and — because any element with a CSS transform becomes
// the containing block for its position:fixed descendants — the app's
// header/nav/modals (all `position: fixed`) automatically stay pinned to
// this frame's edges instead of the real viewport, with no changes needed
// to their own CSS. Actual scrolling happens inside the frame
// (overflow-y: auto), not on the document/body.
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useState, useEffect } from 'react';

const DESIGN_WIDTH = 439;
const APP_FRAME_ID = 'ww-app-frame';

function computeFrameDims() {
  if (typeof window === 'undefined') return { scale: 1, height: 976 };
  const scale = window.innerWidth / DESIGN_WIDTH;
  return { scale, height: window.innerHeight / scale };
}

function getFrameEl() {
  if (typeof document === 'undefined') return null;
  return document.getElementById(APP_FRAME_ID) || document.body;
}

// For code that measures real screen px via getBoundingClientRect() and then
// needs to place an absolutely-positioned element *inside* the (scaled)
// frame using those numbers — divide by this first to convert real screen
// px back to the frame's local (design) px.
function getScale() {
  if (typeof window === 'undefined') return 1;
  return window.innerWidth / DESIGN_WIDTH;
}

function ViewportFrame({ children }) {
  const [dims, setDims] = useState(computeFrameDims);

  useEffect(() => {
    const update = () => setDims(computeFrameDims());
    update();
    window.addEventListener('resize', update);
    window.addEventListener('orientationchange', update);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('orientationchange', update);
    };
  }, []);

  return (
    <div
      id={APP_FRAME_ID}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: DESIGN_WIDTH,
        height: dims.height,
        transform: `scale(${dims.scale})`,
        transformOrigin: 'top left',
        overflowY: 'auto',
        overflowX: 'hidden',
        WebkitOverflowScrolling: 'touch',
      }}
    >
      {children}
    </div>
  );
}

export { ViewportFrame, APP_FRAME_ID, DESIGN_WIDTH, getFrameEl, getScale };
