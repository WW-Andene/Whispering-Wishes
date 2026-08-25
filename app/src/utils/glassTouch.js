// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — utils/glassTouch.js
// "Glass touch" press feedback: a specular highlight that appears exactly
// under the finger/cursor and fades outward — like light catching real glass
// right where it's touched — paired with a light haptic tick. One delegated
// listener covers every button/tab/switch app-wide instead of wiring this
// per-component; see .glass-ripple/@keyframes glass-touch-pulse in kuro.css
// for the actual visual.
//
// Respects the Settings tab's animation level: useVisualSettings.js toggles
// a 'no-animations' class on <html> when animationsEnabled === 'off', which
// this checks before doing anything — the ripple never appears and
// haptic.light() (independently gated the same way, see helpers.js) never
// fires. 'on' and 'full' both get the effect; there's currently nothing
// about it heavy enough to reserve for 'full' only.
// ═══════════════════════════════════════════════════════════════════════════════

import { haptic } from './helpers.js';

const SELECTOR = '.kuro-btn, [role="switch"], [role="tab"]';
const ANIMATION_NAME = 'glass-touch-pulse';

const animationsOff = () =>
  typeof document !== 'undefined' && document.documentElement.classList.contains('no-animations');

function onPointerDown(e) {
  if (animationsOff()) return;
  if (e.pointerType === 'mouse' && e.button !== 0) return; // left-click only, ignore right/middle
  const el = e.target.closest?.(SELECTOR);
  if (!el || el.disabled) return;

  const rect = el.getBoundingClientRect();
  if (rect.width === 0 || rect.height === 0) return;
  const x = ((e.clientX - rect.left) / rect.width) * 100;
  const y = ((e.clientY - rect.top) / rect.height) * 100;
  el.style.setProperty('--touch-x', `${x}%`);
  el.style.setProperty('--touch-y', `${y}%`);

  // Restart the animation on rapid repeated taps (removing+re-adding a class
  // with the same computed style is a no-op without a reflow in between).
  el.classList.remove('glass-ripple');
  void el.offsetWidth;
  el.classList.add('glass-ripple');

  haptic.light();
}

function onAnimationEnd(e) {
  if (e.animationName === ANIMATION_NAME) e.target.classList.remove('glass-ripple');
}

let initialized = false;

// Idempotent — safe to call from App.jsx's mount effect even across
// StrictMode's double-invoke in dev.
export function initGlassTouch() {
  if (initialized || typeof document === 'undefined') return;
  initialized = true;
  document.addEventListener('pointerdown', onPointerDown, { passive: true });
  // Capture phase: animationend doesn't bubble past the element that fired
  // it in every engine's implementation history, capture guarantees we hear
  // it regardless of where in the tree it's attached from.
  document.addEventListener('animationend', onAnimationEnd, true);
}
