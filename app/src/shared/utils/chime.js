// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — shared/utils/chime.js
// Small synthesized "item reveal" sound for ConvenePullSimModal — a bright
// inharmonic shimmer cluster plus a filtered noise "shard" transient, built
// entirely from Web Audio (no audio file). Aims for a glassy/prism-refraction
// texture rather than a bell/jingle — inharmonic partials (non-integer
// frequency ratios) read as glass/crystal, where harmonic ratios read as a
// literal bell. Fired once per item as it's revealed in the one-at-a-time
// convene sim flow.
// ═══════════════════════════════════════════════════════════════════════════════

let sharedCtx = null;
const getCtx = () => {
  const AudioCtx = typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext);
  if (!AudioCtx) return null;
  if (!sharedCtx) sharedCtx = new AudioCtx();
  if (sharedCtx.state === 'suspended') sharedCtx.resume().catch(() => {});
  return sharedCtx;
};

// One short noise burst, bandpass-filtered to a narrow high band — the
// "shard" transient (a prism-edge glint / glassy click, not a bell strike).
const shardBurst = (ctx, dest, startAt, freq, q, duration, peakGain) => {
  const len = Math.ceil(ctx.sampleRate * duration);
  const buffer = ctx.createBuffer(1, len, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
  const noise = ctx.createBufferSource();
  noise.buffer = buffer;
  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = freq;
  filter.Q.value = q;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0, startAt);
  gain.gain.linearRampToValueAtTime(peakGain, startAt + 0.003);
  gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);
  noise.connect(filter).connect(gain).connect(dest);
  noise.start(startAt);
  noise.stop(startAt + duration + 0.02);
};

// One inharmonic shimmer partial — quick attack, a slow upward pitch glide
// (the "light catching an edge as it turns" quality) rather than a flat
// bell-like sustain, ringing out over a moderate decay.
const shimmerPartial = (ctx, dest, freq, startAt, duration, peakGain) => {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(freq, startAt);
  osc.frequency.exponentialRampToValueAtTime(freq * 1.035, startAt + duration * 0.6);
  gain.gain.setValueAtTime(0, startAt);
  gain.gain.linearRampToValueAtTime(peakGain, startAt + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);
  osc.connect(gain).connect(dest);
  osc.start(startAt);
  osc.stop(startAt + duration + 0.05);
};

/**
 * Plays the item-reveal sound — a filtered-noise prism-shard transient
 * plus a small inharmonic sine cluster shimmering upward, for a glassy/
 * holographic feel rather than a cartoon bell/jingle. No-op if Web Audio
 * is unavailable or the sound setting is off.
 * @param {number} [gain=1] overall volume multiplier
 */
export function playItemRevealChime(gain = 1) {
  const ctx = getCtx();
  if (!ctx) return;
  try {
    const master = ctx.createGain();
    master.gain.value = 0.55 * gain;
    master.connect(ctx.destination);
    const t0 = ctx.currentTime;

    // Shard transient — the initial "glint" as the surface catches light.
    shardBurst(ctx, master, t0, 7200, 5, 0.05, 0.6);
    shardBurst(ctx, master, t0 + 0.015, 9500, 7, 0.04, 0.35);

    // Inharmonic shimmer cluster (ratios deliberately non-integer, unlike a
    // bell's 1/2/3× harmonic stack) — layered with tiny offsets so it reads
    // as one continuous glassy sweep rather than discrete plinks.
    const partials = [
      { ratio: 1, gain: 0.28 },
      { ratio: 1.41, gain: 0.22 },
      { ratio: 1.87, gain: 0.18 },
      { ratio: 2.63, gain: 0.13 },
      { ratio: 3.31, gain: 0.09 },
    ];
    const base = 2400;
    partials.forEach((p, i) => {
      shimmerPartial(ctx, master, base * p.ratio, t0 + i * 0.006, 0.32, p.gain);
    });
  } catch {
    // Never let a synthesis error interrupt the reveal.
  }
}
