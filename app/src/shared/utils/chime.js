// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — shared/utils/chime.js
// Small synthesized "item reveal" chime for ConvenePullSimModal — a bell-like
// tone layered with a quick high-pitched sparkle, built entirely from Web
// Audio oscillators (no audio file). Fired once per item as it's revealed
// in the one-at-a-time convene sim flow.
// ═══════════════════════════════════════════════════════════════════════════════

let sharedCtx = null;
const getCtx = () => {
  const AudioCtx = typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext);
  if (!AudioCtx) return null;
  if (!sharedCtx) sharedCtx = new AudioCtx();
  if (sharedCtx.state === 'suspended') sharedCtx.resume().catch(() => {});
  return sharedCtx;
};

// One decaying sine "bell" partial.
const bellTone = (ctx, dest, freq, startAt, duration, peakGain) => {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0, startAt);
  gain.gain.linearRampToValueAtTime(peakGain, startAt + 0.006);
  gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);
  osc.connect(gain).connect(dest);
  osc.start(startAt);
  osc.stop(startAt + duration + 0.05);
};

// One tiny high-pitched "sparkle" tick.
const sparkleTick = (ctx, dest, freq, startAt, peakGain) => {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(freq, startAt);
  osc.frequency.exponentialRampToValueAtTime(freq * 1.6, startAt + 0.05);
  gain.gain.setValueAtTime(0, startAt);
  gain.gain.linearRampToValueAtTime(peakGain, startAt + 0.004);
  gain.gain.exponentialRampToValueAtTime(0.0001, startAt + 0.09);
  osc.connect(gain).connect(dest);
  osc.start(startAt);
  osc.stop(startAt + 0.12);
};

/**
 * Plays the item-reveal chime — a short bell (jingle-bells-ish harmonic
 * stack) plus a scatter of quick high sparkle ticks (holographic-shimmer
 * feel). No-op if Web Audio is unavailable or the sound setting is off.
 * @param {number} [gain=1] overall volume multiplier
 */
export function playItemRevealChime(gain = 1) {
  const ctx = getCtx();
  if (!ctx) return;
  try {
    const master = ctx.createGain();
    master.gain.value = 0.5 * gain;
    master.connect(ctx.destination);
    const t0 = ctx.currentTime;

    // Bell: fundamental + a couple of bright harmonics, classic small-bell stack.
    bellTone(ctx, master, 1318.5, t0, 0.5, 0.5); // E6
    bellTone(ctx, master, 1975.5, t0 + 0.01, 0.45, 0.32); // B6
    bellTone(ctx, master, 2637.0, t0 + 0.02, 0.4, 0.2); // E7

    // Sparkle: a handful of quick high ticks scattered just after the bell hits.
    const sparkleFreqs = [3136, 3520, 4186, 3729, 4699];
    sparkleFreqs.forEach((f, i) => {
      sparkleTick(ctx, master, f, t0 + 0.03 + i * 0.028, 0.14);
    });
  } catch {
    // Never let a synthesis error interrupt the reveal.
  }
}
