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
// bell-like sustain, ringing out over a moderate decay. Doubled with a
// slightly detuned second voice (a few cents apart) for a "dédoublement" —
// two near-identical voices beating against each other reads as a
// holographic doubling rather than a single clean tone. A slow vibrato LFO
// on pitch adds the "vibration" quality.
const shimmerPartial = (ctx, dest, freq, startAt, duration, peakGain) => {
  const vibrato = ctx.createOscillator();
  const vibratoGain = ctx.createGain();
  vibrato.type = 'sine';
  vibrato.frequency.value = 5.5 + Math.random() * 2;
  vibratoGain.gain.value = freq * 0.006;
  vibrato.connect(vibratoGain);
  vibrato.start(startAt);
  vibrato.stop(startAt + duration + 0.05);

  [0, 6].forEach((cents, voiceIdx) => {
    const detuned = freq * Math.pow(2, cents / 1200);
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(detuned, startAt);
    osc.frequency.exponentialRampToValueAtTime(detuned * 1.035, startAt + duration * 0.6);
    vibratoGain.connect(osc.frequency);
    const voiceGain = voiceIdx === 0 ? peakGain : peakGain * 0.7;
    gain.gain.setValueAtTime(0, startAt);
    gain.gain.linearRampToValueAtTime(voiceGain, startAt + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);
    osc.connect(gain).connect(dest);
    osc.start(startAt);
    osc.stop(startAt + duration + 0.05);
  });
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

    // Echo/depth bus: a short delay with feedback, tapped in parallel with
    // the dry signal — gives the "hall of glass" repeats instead of one
    // dead-dry hit. Feedback is filtered so repeats darken/soften as they
    // decay rather than smearing into noise.
    const dry = ctx.createGain();
    dry.gain.value = 1;
    const echoSend = ctx.createGain();
    echoSend.gain.value = 0.5;
    const delay = ctx.createDelay(1);
    delay.delayTime.value = 0.09;
    const feedback = ctx.createGain();
    feedback.gain.value = 0.42;
    const feedbackFilter = ctx.createBiquadFilter();
    feedbackFilter.type = 'lowpass';
    feedbackFilter.frequency.value = 5200;
    const echoOut = ctx.createGain();
    echoOut.gain.value = 0.55;

    dry.connect(master);
    echoSend.connect(delay);
    delay.connect(feedbackFilter);
    feedbackFilter.connect(feedback);
    feedback.connect(delay);
    delay.connect(echoOut);
    echoOut.connect(master);
    master.connect(ctx.destination);

    const t0 = ctx.currentTime;
    const bus = ctx.createGain();
    bus.connect(dry);
    bus.connect(echoSend);

    // Shard transients — several distinct decaying taps ("pl sl pl tl pl")
    // instead of a single hit, each catching light at a slightly different
    // angle/frequency as it decays through the echo.
    const shardTaps = [
      { at: 0, freq: 7200, q: 5, dur: 0.05, gain: 0.6 },
      { at: 0.015, freq: 9500, q: 7, dur: 0.04, gain: 0.35 },
      { at: 0.07, freq: 6100, q: 6, dur: 0.045, gain: 0.3 },
      { at: 0.13, freq: 8300, q: 8, dur: 0.035, gain: 0.18 },
    ];
    shardTaps.forEach((s) => {
      shardBurst(ctx, bus, t0 + s.at, s.freq, s.q, s.dur, s.gain);
    });

    // Inharmonic shimmer cluster (ratios deliberately non-integer, unlike a
    // bell's 1/2/3× harmonic stack) — layered with tiny offsets so it reads
    // as one continuous glassy sweep rather than discrete plinks. Each
    // voice is itself doubled+vibrato'd (see shimmerPartial) for the
    // holographic "dédoublement" quality, and the whole cluster feeds the
    // echo bus for depth.
    const partials = [
      { ratio: 1, gain: 0.28 },
      { ratio: 1.41, gain: 0.22 },
      { ratio: 1.87, gain: 0.18 },
      { ratio: 2.63, gain: 0.13 },
      { ratio: 3.31, gain: 0.09 },
    ];
    const base = 2400;
    partials.forEach((p, i) => {
      shimmerPartial(ctx, bus, base * p.ratio, t0 + i * 0.006, 0.34, p.gain);
    });
  } catch {
    // Never let a synthesis error interrupt the reveal.
  }
}
