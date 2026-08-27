// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — shared/utils/chime.js
// Plays the "item reveal" sound for ConvenePullSimModal — a sourced audio
// clip (public/convene-sim/item-reveal-chime.mp3), replacing the earlier
// synthesized Web Audio chime. Fired once per item as it's revealed in the
// one-at-a-time convene sim flow.
// ═══════════════════════════════════════════════════════════════════════════════

// Vite's base is './' (relative) so the app can be served from a subpath or
// loaded via file:// in the native build — an absolute leading-slash URL
// 404s in both cases, which is why the chime was silent.
const CHIME_URL = `${import.meta.env.BASE_URL || './'}convene-sim/item-reveal-chime.mp3`;

/**
 * Plays the item-reveal sound. No-op if playback is unavailable/blocked
 * (e.g. autoplay policy) or the sound setting is off.
 * @param {number} [gain=1] overall volume multiplier (0..1 range, clamped)
 */
export function playItemRevealChime(gain = 1) {
  try {
    const audio = new Audio(CHIME_URL);
    audio.volume = Math.min(1, Math.max(0, gain));
    audio.play().catch(() => {});
  } catch {
    // Never let a playback error interrupt the reveal.
  }
}
