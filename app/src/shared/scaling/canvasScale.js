// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — shared/scaling/canvasScale.js
// The app is authored against a single reference WIDTH (439 CSS px, the
// design's own reference device) and rendered at ANY real screen size by
// uniformly scaling the whole app by realWidth/439 — geometric scaling, not
// responsive reflow — so every pixel value (tokenized or a raw arbitrary
// value, per CLAUDE.md's PerfectSuite rule) ends up in the exact same
// proportion on any screen, not just the ones someone remembered to route
// through a design token. See ScaledCanvas.jsx for the component that
// applies this (including why the canvas's HEIGHT is elastic, not a fixed
// reference value the way width is) and useCanvasScale.js for how the scale
// factor itself is computed.
//
// This file exists so code far from ScaledCanvas.jsx (portal-rendering
// components, scroll-position code) doesn't need a prop/context thread all
// the way down just to find the canvas DOM node — it's one instance for the
// life of the app, same rationale as useAmbientMusic.js's own
// window.__bootAmbientAudio singleton.
// ═══════════════════════════════════════════════════════════════════════════════

export const CANVAS_WIDTH = 439;

let canvasEl = null;

// Called once by ScaledCanvas.jsx on mount/unmount. Never called by anything
// else — this is the one writer, everything else only reads via the getters
// below.
export function setCanvasElement(el) {
  canvasEl = el;
}

// Every createPortal() in the app must target this instead of document.body
// — document.body sits OUTSIDE the scaled/transformed canvas, so anything
// portaled there would render at real (unscaled) size and real (untransformed)
// position, ignoring the letterboxing entirely. Falls back to document.body
// only for the brief window before ScaledCanvas has mounted (SSR/tests, or a
// portal component's own first render racing the canvas ref callback) —
// that fallback is intentionally never hit in the running native/web app
// past initial mount.
export function getPortalRoot() {
  return canvasEl || document.body;
}

// Converts a point in real screen coordinates (e.g. from a triggering
// element's own getBoundingClientRect(), which ALWAYS returns real,
// post-transform screen space regardless of any transformed ancestor) into
// canvas-local coordinates — what a `position: fixed/absolute` element
// needs if it's portaled into the canvas (via getPortalRoot() above), since
// fixed/absolute positioning inside a transformed ancestor is resolved in
// that ancestor's own pre-transform coordinate space, not real screen
// space. Used by anything that positions a portaled element relative to a
// trigger element it measured itself (KuroSelect.jsx's dropdown, etc.).
//
// Reads the canvas's own live getBoundingClientRect() rather than the
// --canvas-scale CSS var for the scale factor — this can't go stale (no
// dependency on this render having already picked up the latest resize).
export function toCanvasSpace(clientX, clientY) {
  if (!canvasEl) return { x: clientX, y: clientY };
  const canvasRect = canvasEl.getBoundingClientRect();
  const scale = canvasRect.width / CANVAS_WIDTH;
  return {
    x: (clientX - canvasRect.left) / scale,
    y: (clientY - canvasRect.top) / scale,
  };
}

// Same idea as toCanvasSpace() but for a length (width/height/distance)
// rather than a point — no origin offset to subtract, just the scale.
export function toCanvasLength(realLength) {
  if (!canvasEl) return realLength;
  const scale = canvasEl.getBoundingClientRect().width / CANVAS_WIDTH;
  return realLength / scale;
}

// The canvas div is the app's ONLY scroll container (see index.css's own
// comment on `body { overflow: hidden }`) — window.scrollY/scrollTo no
// longer correspond to anything the user can see once the whole app lives
// inside a transformed, fixed-size box. Same document.body fallback
// reasoning as getPortalRoot() above.
export function getScrollContainer() {
  return canvasEl || document.documentElement;
}
