// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — shared/backgrounds/ResonanceField.jsx
// Resonance frequency field background animation.
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useEffect, useRef, memo } from 'react';
import { throttledResize } from './backgroundHelpers.js';

const ResonanceField = memo(({ oledMode, animationsEnabled = 'on', bgResolution, bgFps }) => {
  const canvasRef = useRef(null);
  useEffect(() => {
    if (animationsEnabled === 'off' || animationsEnabled === false) {
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let animId;

    const isFull = animationsEnabled === 'full';
    const resScale = (bgResolution || (isFull ? 100 : 50)) / 100;
    const frameInterval = bgFps ? Math.round(1000 / bgFps) : (isFull ? 33 : 66);
    const alphaScale = isFull ? 1.5 : 1.0;
    const bgColor = oledMode ? 'rgb(0,0,0)' : 'rgb(3,4,12)';

    let w, h;

    const init = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.ceil(w * resScale);
      canvas.height = Math.ceil(h * resScale);
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
    };
    init();
    const onResize = throttledResize(init);
    window.addEventListener('resize', onResize);

    // Camera: side view with slight top-down, no yaw — diagonal comes from canvas rotation
    const tilt = -28 * Math.PI / 180;
    const cosT = Math.cos(tilt), sinT = Math.sin(tilt);

    // Screen-space diagonal: rotate the entire output ~30° on screen
    const SCREEN_ROTATION = 30 * Math.PI / 180;
    const _cosR = Math.cos(SCREEN_ROTATION), _sinR = Math.sin(SCREEN_ROTATION);

    // Pre-compute center offset: project origin (0,0,0) to find where center lands,
    // then offset everything so the ring center sits at screen center
    let centerOffX = 0, centerOffY = 0;

    const CAM_HEIGHT = -100; // camera above the ribbon (negative Y = up)

    const projectRaw = (wx, wy, wz) => {
      const cy = wy - CAM_HEIGHT; // translate Y relative to camera height
      const cz = wz + 400;
      const ey = cy * cosT - cz * sinT;
      const ez = cy * sinT + cz * cosT;
      if (ez < 10) return null;
      const fov = Math.min(w, h) * 1.1;
      const scale = fov / ez;
      const sx = wx * scale;
      const sy = ey * scale;
      return { sx: sx * _cosR - sy * _sinR, sy: sx * _sinR + sy * _cosR, scale, depth: ez };
    };

    const project = (wx, wy, wz) => {
      const p = projectRaw(wx, wy, wz);
      if (!p) return null;
      return {
        sx: w * 0.5 + p.sx - centerOffX,
        sy: h * 0.55 + p.sy - centerOffY,
        scale: p.scale,
        depth: p.depth
      };
    };

    let lastFrame = 0;

    const draw = (t) => {
      animId = requestAnimationFrame(draw);
      if (t - lastFrame < frameInterval) return;
      lastFrame = t;
      const time = t * 0.00075; // 25% slower globally

      ctx.save();
      ctx.scale(resScale, resScale);
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, w, h);

      // Slow global rotation (very gentle)
      const rot = time * 0.035;

      // Compute center offset so ring center maps to screen center
      const rawCenter = projectRaw(0, 0, 0);
      centerOffX = rawCenter ? rawCenter.sx : 0;
      centerOffY = rawCenter ? rawCenter.sy : 0;

      // --- Ambient glow at center (brighter) + dark vignette outside ---
      const centerP = project(0, 0, 0);
      if (centerP) {
        // Darken edges: vignette pushing darkness outside the ring area
        const vigSize = Math.max(w, h) * 0.7;
        const vig = ctx.createRadialGradient(centerP.sx, centerP.sy, vigSize * 0.35, centerP.sx, centerP.sy, vigSize);
        vig.addColorStop(0, 'rgba(0,0,0,0)');
        vig.addColorStop(0.5, `rgba(0,0,0,${0.15 * alphaScale})`);
        vig.addColorStop(1, `rgba(0,0,0,${0.35 * alphaScale})`);
        ctx.fillStyle = vig;
        ctx.fillRect(0, 0, w, h);

        // Bright glow in the ring zone
        const grd = ctx.createRadialGradient(centerP.sx, centerP.sy, 0, centerP.sx, centerP.sy, Math.max(w, h) * 0.55);
        grd.addColorStop(0, `rgba(140, 200, 255, ${0.55 * alphaScale})`);
        grd.addColorStop(0.08, `rgba(110, 170, 240, ${0.40 * alphaScale})`);
        grd.addColorStop(0.2, `rgba(80, 120, 220, ${0.25 * alphaScale})`);
        grd.addColorStop(0.4, `rgba(110, 80, 200, ${0.12 * alphaScale})`);
        grd.addColorStop(0.6, `rgba(150, 55, 170, ${0.06 * alphaScale})`);
        grd.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, w, h);
      }

      // --- The ribbon: a ring with width, undulating in Y ---
      // Ring params
      const RADIUS = 212;          // 15% tighter
      const RIBBON_WIDTH = 76;     // 15% tighter
      const ROWS = 44;             // more rows across ribbon width
      const DOTS_AROUND = 680;     // denser squares
      const WAVE_AMP = 30;         // 15% tighter
      const WAVE_FREQ = 2;         // number of wave peaks around the ring

      // Pre-compute static dot data once
      if (!canvas._dotCache) {
        const _dots = [];
        for (let row = 0; row < ROWS; row++) {
          const rowT = row / (ROWS - 1);
          const r = RADIUS - RIBBON_WIDTH * 0.5 + rowT * RIBBON_WIDTH;
          for (let i = 0; i < DOTS_AROUND; i++) {
            const angleT = i / DOTS_AROUND;
            const baseAngle = angleT * Math.PI * 2;
            const hash = Math.sin(row * 127.1 + i * 311.7) * 43758.5453;
            const jitter = (hash - Math.floor(hash)) * 2 - 1;
            const radiusJitter = jitter * 0.5;
            const rj = r + radiusJitter;
            const veilA = rowT * Math.PI * 3;
            const veilB = rowT * Math.PI * 5;
            _dots.push({ rowT, rj, baseAngle, jitter, veilA, veilB });
          }
        }
        canvas._dotCache = _dots;
      }
      const _cachedDots = canvas._dotCache;

      // Collect all dots for depth sorting
      const allDots = [];
      for (let _di = 0; _di < _cachedDots.length; _di++) {
        const d = _cachedDots[_di];
        const angle = d.baseAngle + rot;
        const wx = Math.cos(angle) * d.rj;
        const wz = Math.sin(angle) * d.rj;
        const ribbonWave = Math.sin(angle * WAVE_FREQ + time * 0.15) * WAVE_AMP
                         + Math.sin(angle * (WAVE_FREQ + 1) + time * 0.1) * WAVE_AMP * 0.3;
        const veil = Math.sin(d.veilA + angle * 4 + time * 0.25) * 5
                   + Math.sin(d.veilB - angle * 2 + time * 0.18) * 3;
        const wy = ribbonWave + veil;
        const p = project(wx, wy, wz);
        if (!p) continue;
        if (p.sx < -10 || p.sx > w + 10 || p.sy < -10 || p.sy > h + 10) continue;
        allDots.push({ p, wy, rowT: d.rowT, angleT: d.baseAngle / (Math.PI * 2), r: d.rj, angle, jitter: d.jitter });
      }

      // Sort back to front
      allDots.sort((a, b) => b.p.depth - a.p.depth);

      // Draw flat rectangles (dashes tangent to the ring)
      const maxDepth = 1200;
      for (let i = 0; i < allDots.length; i++) {
        const { p, wy, rowT, angle, jitter } = allDots[i];

        const depthNorm = Math.max(0, Math.min(1, 1 - (p.depth - 10) / maxDepth));

        // Square tiles
        const sqSize = (0.8 + depthNorm * 2.5) * p.scale * 0.4;
        const rectW = sqSize;
        const rectH = sqSize;

        // Brighter on wave crests
        const heightNorm = (wy + WAVE_AMP * 1.3) / (WAVE_AMP * 2.6);
        const centerBright = 1 - Math.abs(rowT - 0.5) * 1.2;
        const brightness = 0.05 + depthNorm * 0.45 + heightNorm * 0.3 + centerBright * 0.15;

        // Aemeath colors: cyan accent on wave crests, lavender mid, pink outer
        const cyanPunch = Math.pow(heightNorm, 3); // strong only on brightest crests
        const hue = (260 + rowT * 60 + heightNorm * 15) * (1 - cyanPunch) + 195 * cyanPunch;
        const sat = 55 + heightNorm * 30 + cyanPunch * 25;
        const lit = 55 + brightness * 35;

        const dotAlpha = brightness * 0.5 * alphaScale;
        if (dotAlpha < 0.02) continue;

        // Rotate rectangle to be tangent to the ring (perpendicular to radius)
        // The tangent direction in screen space approximation
        ctx.save();
        ctx.translate(p.sx, p.sy);
        ctx.rotate(angle + Math.PI * 0.5 + SCREEN_ROTATION); // tangent aligned, no random tilt
        ctx.fillStyle = `hsla(${hue}, ${sat}%, ${lit}%, ${dotAlpha})`;
        ctx.fillRect(-rectW * 0.5, -rectH * 0.5, rectW, rectH);
        ctx.restore();
      }

      // --- Sparkle particles floating above/around the ribbon ---
      if (!canvas._sparkCache) {
        canvas._sparkCache = [];
        for (let sp = 0; sp < 60; sp++) {
          const spHash = Math.sin(sp * 191.7) * 43758.5453;
          const spRand = spHash - Math.floor(spHash);
          const spHash2 = Math.sin(sp * 337.3) * 29871.2;
          const spRand2 = spHash2 - Math.floor(spHash2);
          const spHue = spRand < 0.15 ? 192 + spRand * 20 : 250 + spRand * 80;
          canvas._sparkCache.push({ spRand, spRand2, spHue });
        }
      }
      for (let sp = 0; sp < 60; sp++) {
        const { spRand, spRand2, spHue } = canvas._sparkCache[sp];
        const spAngle = spRand * Math.PI * 2 + rot + time * (0.02 + spRand2 * 0.03);
        const spR = RADIUS - RIBBON_WIDTH * 0.4 + spRand2 * RIBBON_WIDTH * 0.8;
        const spWy = Math.sin(spAngle * WAVE_FREQ + time * 0.15) * WAVE_AMP - 6 - spRand * 25;
        const spP = project(Math.cos(spAngle) * spR, spWy, Math.sin(spAngle) * spR);
        if (!spP) continue;
        if (spP.sx < -5 || spP.sx > w + 5 || spP.sy < -5 || spP.sy > h + 5) continue;
        const twinkle = Math.sin(time * 2.5 + sp * 5.3) * 0.5 + 0.5;
        const spAlpha = twinkle * 0.35 * alphaScale;
        // Mostly lavender-pink, occasional cyan sparkle (hue cached)
        const spSize = (1 + twinkle * 2.5) * spP.scale * 0.3;
        ctx.fillStyle = `hsla(${spHue}, 75%, 85%, ${spAlpha})`;
        ctx.fillRect(spP.sx - spSize * 0.5, spP.sy - spSize * 0.5, spSize, spSize);
        ctx.fillStyle = `hsla(${spHue}, 65%, 75%, ${spAlpha * 0.25})`;
        const glowS = spSize * 3;
        ctx.fillRect(spP.sx - glowS * 0.5, spP.sy - glowS * 0.5, glowS, glowS);
      }

      // --- Ribbon ring lines (multiple across the width) ---
      const LINE_ROWS = [0, 0.2, 0.4, 0.6, 0.8, 1.0];
      for (let li = 0; li < LINE_ROWS.length; li++) {
        const rowT_l = LINE_ROWS[li];
        const r = RADIUS - RIBBON_WIDTH * 0.5 + rowT_l * RIBBON_WIDTH;
        const lineAlpha = (li === 0 || li === LINE_ROWS.length - 1 ? 0.1 : 0.05) * alphaScale;

        ctx.beginPath();
        ctx.lineWidth = li === 0 || li === LINE_ROWS.length - 1 ? 1.2 : 0.6;
        let started = false;

        for (let i = 0; i <= 200; i++) {
          const angle = (i / 200) * Math.PI * 2 + rot;
          const wx = Math.cos(angle) * r;
          const wz = Math.sin(angle) * r;
          const veil_l = Math.sin(rowT_l * Math.PI * 3 + angle * 4 + time * 0.25) * 5
                       + Math.sin(rowT_l * Math.PI * 5 - angle * 2 + time * 0.18) * 3;
          const wy = Math.sin(angle * WAVE_FREQ + time * 0.15) * WAVE_AMP
                   + Math.sin(angle * (WAVE_FREQ + 1) + time * 0.1) * WAVE_AMP * 0.3 + veil_l;

          const p = project(wx, wy, wz);
          if (!p) { started = false; continue; }

          if (!started) { ctx.moveTo(p.sx, p.sy); started = true; }
          else ctx.lineTo(p.sx, p.sy);
        }

        // Inner edge cyan, mid lavender, outer pink
        const lineHue = rowT_l < 0.25 ? 195 + rowT_l * 200 : 250 + rowT_l * 60;
        ctx.strokeStyle = `hsla(${lineHue}, 75%, 72%, ${lineAlpha})`;
        ctx.stroke();
        if (li === 0 || li === LINE_ROWS.length - 1) {
          ctx.lineWidth = 5;
          ctx.strokeStyle = `hsla(${lineHue}, 70%, 58%, ${lineAlpha * 0.2})`;
          ctx.stroke();
        }
      }

      // --- Floating lines: loose curves drifting near the ribbon ---
      for (let fl = 0; fl < 10; fl++) {
        const flRadius = RADIUS + RIBBON_WIDTH * (0.5 + fl * 0.12);
        const flYOff = (fl - 5) * 12; // spread above/below
        const flHue = (fl % 4 === 0) ? 195 : 260 + fl * 10; // every 4th line cyan
        const flAlpha = (0.06 + Math.sin(time * 0.2 + fl * 1.3) * 0.03) * alphaScale;

        ctx.beginPath();
        ctx.lineWidth = 0.8;
        let started = false;

        for (let i = 0; i <= 150; i++) {
          const angle = (i / 150) * Math.PI * 2 + rot;
          const drift = Math.sin(angle * 3 + time * 0.12 + fl * 2) * 15;
          const wx = Math.cos(angle) * (flRadius + drift);
          const wz = Math.sin(angle) * (flRadius + drift);
          const wy = Math.sin(angle * WAVE_FREQ + time * 0.15) * WAVE_AMP * 0.4 + flYOff
                   + Math.sin(angle * 5 + time * 0.2 + fl) * 8;

          const p = project(wx, wy, wz);
          if (!p) { started = false; continue; }

          if (!started) { ctx.moveTo(p.sx, p.sy); started = true; }
          else ctx.lineTo(p.sx, p.sy);
        }

        ctx.strokeStyle = `hsla(${flHue}, 75%, 65%, ${flAlpha})`;
        ctx.stroke();
        ctx.lineWidth = 4;
        ctx.strokeStyle = `hsla(${flHue}, 70%, 50%, ${flAlpha * 0.15})`;
        ctx.stroke();
      }

      // --- Inner ribbon: vertical mixer bars (flat on Y=0 plane, no wave) ---
      const INNER_RADIUS = RADIUS * 0.55;
      const INNER_BARS = 540;
      if (!canvas._barCache) {
        canvas._barCache = [];
        for (let i = 0; i < INNER_BARS; i++) {
          const baseAngle = (i / INNER_BARS) * Math.PI * 2;
          const hash = Math.sin(i * 173.7) * 43758.5453;
          const barSeed = hash - Math.floor(hash);
          const barHue = barSeed < 0.35 ? 192 + barSeed * 15 : 255 + barSeed * 65;
          const barSat = barSeed < 0.35 ? 92 : 75;
          canvas._barCache.push({ baseAngle, barSeed, barHue, barSat });
        }
      }
      for (let i = 0; i < INNER_BARS; i++) {
        const _bc = canvas._barCache[i];
        const angle = _bc.baseAngle + rot;
        const wx = Math.cos(angle) * INNER_RADIUS;
        const wz = Math.sin(angle) * INNER_RADIUS;
        const barSeed = _bc.barSeed;
        const barHeight = 5 + barSeed * 25 + Math.sin(time * 0.5 + i * 0.6) * 12;

        // Project from flat plane (Y=0), bar extends vertically on screen
        const p = project(wx, 0, wz);
        if (!p) continue;
        if (p.sx < -10 || p.sx > w + 10 || p.sy < -10 || p.sy > h + 10) continue;

        const depthNorm = Math.max(0, Math.min(1, 1 - (p.depth - 10) / maxDepth));
        const barW = (0.8 + depthNorm * 1.5) * p.scale * 0.25;
        const barH = barHeight * p.scale * 0.12;
        const barAlpha = (0.12 + depthNorm * 0.28) * alphaScale;

        // Vertical bars on screen (not rotated)
        ctx.fillStyle = `hsla(${_bc.barHue}, ${_bc.barSat}%, 65%, ${barAlpha})`;
        ctx.fillRect(p.sx - barW * 0.5, p.sy - barH, barW, barH);
      }

      // --- Sparkle highlights (frost colors) ---
      for (let i = 0; i < 55; i++) {
        const seed = i * 137.508;
        const angleT_s = (seed * 1.73) % 1;
        const rowT_s = (seed * 0.31) % 1;
        const angle = angleT_s * Math.PI * 2 + rot;
        const r = RADIUS - RIBBON_WIDTH * 0.5 + rowT_s * RIBBON_WIDTH;

        const wx = Math.cos(angle) * r;
        const wz = Math.sin(angle) * r;
        const wy = Math.sin(angle * WAVE_FREQ + time * 0.15) * WAVE_AMP
                 + Math.sin(angle * (WAVE_FREQ + 1) + time * 0.1) * WAVE_AMP * 0.3;

        const p = project(wx, wy, wz);
        if (!p) continue;
        if (p.sx < -5 || p.sx > w + 5 || p.sy < -5 || p.sy > h + 5) continue;

        const pulse = Math.sin(time * (2 + i * 0.12) + seed) * 0.5 + 0.5;
        const sparkAlpha = pulse * 0.5 * alphaScale;
        if (sparkAlpha < 0.05) continue;

        const depthNorm = Math.max(0, Math.min(1, 1 - (p.depth - 10) / maxDepth));
        const sparkSize = (1 + pulse * 1.5) * (0.4 + depthNorm * 0.6);

        ctx.beginPath();
        ctx.arc(p.sx, p.sy, sparkSize, 0, Math.PI * 2);
        // Alternate between lavender and cyan sparkles
        const spkCyan = (i % 3 === 0);
        ctx.fillStyle = spkCyan
          ? `rgba(120, 235, 255, ${sparkAlpha})`
          : `rgba(230, 200, 255, ${sparkAlpha})`;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(p.sx, p.sy, sparkSize * 3, 0, Math.PI * 2);
        ctx.fillStyle = spkCyan
          ? `rgba(80, 220, 255, ${sparkAlpha * 0.15})`
          : `rgba(210, 170, 250, ${sparkAlpha * 0.12})`;
        ctx.fill();
      }

      // --- Flat cyan particles around the ribbon ---
      for (let i = 0; i < 40; i++) {
        const seed = i * 97.31 + 42;
        const aT = ((seed * 2.17) % 1 + time * 0.02 * (0.5 + (seed % 3) * 0.3)) % 1;
        const rT = (seed * 0.47) % 1;
        // Constrain radius to ribbon band with slight scatter outside
        const r = RADIUS - RIBBON_WIDTH * 0.6 + rT * RIBBON_WIDTH * 1.2;
        const angle = aT * Math.PI * 2 + rot;

        const wx = Math.cos(angle) * r;
        const wz = Math.sin(angle) * r;
        // Follow the ribbon wave + slight vertical scatter
        const wy = Math.sin(angle * WAVE_FREQ + time * 0.15) * WAVE_AMP
                 + Math.sin(angle * (WAVE_FREQ + 1) + time * 0.1) * WAVE_AMP * 0.3
                 + Math.sin(time * 0.8 + i * 1.3) * 8 - 4;

        const p = project(wx, wy, wz);
        if (!p) continue;
        if (p.sx < -5 || p.sx > w + 5 || p.sy < -5 || p.sy > h + 5) continue;

        const flicker = Math.sin(time * 1.5 + i * 2.7) * 0.5 + 0.5;
        const pAlpha = (0.15 + flicker * 0.25) * alphaScale;
        if (pAlpha < 0.04) continue;

        const depthNorm = Math.max(0, Math.min(1, 1 - (p.depth - 10) / maxDepth));
        const sz = (1.2 + flicker * 1.0) * (0.3 + depthNorm * 0.7);

        // Flat diamond/square shape
        ctx.save();
        ctx.translate(p.sx, p.sy);
        ctx.rotate(time * 0.4 + i);
        ctx.globalAlpha = pAlpha;
        ctx.fillStyle = `hsl(${192 + (i % 5) * 3}, 92%, ${68 + flicker * 12}%)`;
        ctx.fillRect(-sz, -sz, sz * 2, sz * 2);
        ctx.restore();

        // Soft glow
        ctx.beginPath();
        ctx.arc(p.sx, p.sy, sz * 3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(80, 225, 255, ${pAlpha * 0.14})`;
        ctx.fill();
      }

      // --- Disc light + Water ripple (linked together) ---
      if (centerP) {
        const RIPPLE_MAX_R = RADIUS + RIBBON_WIDTH;
        const RIPPLE_COUNT = 5;
        const RIPPLE_CYCLE = 20;
        const RIPPLE_AMP = 10;
        const STEPS = 80;
        const BAND_W = 14;

        // Compute all ripple phases first so pulse can read them
        const ripplePhases = [];
        for (let i = 0; i < RIPPLE_COUNT; i++) {
          ripplePhases.push(((time / RIPPLE_CYCLE) + i / RIPPLE_COUNT) % 1);
        }

        // Pulse = driven by the ripple closest to center
        // phase 0 = at center (bright), phase 1 = at edge (dim)
        const nearest = Math.min(...ripplePhases);
        const pulse = 0.4 + 0.45 * Math.cos(nearest * Math.PI * 0.5); // smooth 0.85 at center → 0.4 at edge

        // Large disc glow
        const discSize = Math.max(w, h) * (0.5 + pulse * 0.1);
        const discGrd = ctx.createRadialGradient(centerP.sx, centerP.sy, 0, centerP.sx, centerP.sy, discSize);
        discGrd.addColorStop(0, `rgba(120, 235, 255, ${0.40 * pulse * alphaScale})`);   // cyan core
        discGrd.addColorStop(0.05, `rgba(180, 230, 255, ${0.32 * pulse * alphaScale})`); // transition
        discGrd.addColorStop(0.12, `rgba(235, 200, 255, ${0.22 * pulse * alphaScale})`); // lavender
        discGrd.addColorStop(0.3, `rgba(220, 180, 250, ${0.12 * pulse * alphaScale})`);
        discGrd.addColorStop(0.5, `rgba(225, 155, 235, ${0.06 * pulse * alphaScale})`);  // pink
        discGrd.addColorStop(0.7, `rgba(230, 150, 210, ${0.03 * pulse * alphaScale})`);
        discGrd.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = discGrd;
        ctx.fillRect(0, 0, w, h);

        // --- Holographic Heart of Aemaeth ---
        // Matches reference: soft pink-lavender fill, cyan outline, inner concentric
        // hearts with white/pink strokes, center vertical line with glitch marks.
        const HEART_SIZE = 30 + 5 * pulse;
        const HEART_PTS = 64;

        // Helper: generate projected heart points at a given scale and offset.
        // Modified parametric heart to match reference: fatter lobes (sin^2.3 vs sin^3),
        // shorter tail (compress negative y by 0.7), slightly wider (1.1x).
        const makeHeart = (scale, oxW, oyW) => {
          const pts = [];
          for (let hi = 0; hi <= HEART_PTS; hi++) {
            const t = (hi / HEART_PTS) * Math.PI * 2;
            // sin^2.3 instead of sin^3 → fatter, rounder lobes
            const sinT = Math.sin(t);
            const hx = 16 * Math.sign(sinT) * Math.pow(Math.abs(sinT), 2.3);
            let hy = 13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t);
            // Shorten the tail: compress the bottom portion (negative hy = tail)
            if (hy < 0) hy *= 0.7;
            const wx = hx * HEART_SIZE * scale * 1.1 / 16 + (oxW || 0);
            const wy = -hy * HEART_SIZE * scale / 17 - HEART_SIZE + (oyW || 0);
            const p = project(wx, wy, 0);
            if (!p) return null;
            pts.push(p);
          }
          return pts;
        };

        const drawPath = (pts) => {
          ctx.beginPath();
          ctx.moveTo(pts[0].sx, pts[0].sy);
          for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].sx, pts[i].sy);
          ctx.closePath();
        };

        const heartPts = makeHeart(1, 0, 0);

        if (heartPts) {
          const iridShift = Math.sin(time * 0.5) * 0.5 + 0.5;

          // --- Outer glow (soft cyan bloom) ---
          ctx.save();
          ctx.shadowColor = `rgba(100, 230, 255, ${0.7 * pulse * alphaScale})`;
          ctx.shadowBlur = 30 + pulse * 18;
          drawPath(heartPts);
          ctx.strokeStyle = `rgba(80, 220, 255, ${0.3 * alphaScale})`;
          ctx.lineWidth = 4 + pulse * 2;
          ctx.stroke();
          ctx.restore();

          // --- Soft pink-lavender-blue gradient fill ---
          const bds = heartPts.reduce((b, p) => ({
            x0: Math.min(b.x0, p.sx), x1: Math.max(b.x1, p.sx),
            y0: Math.min(b.y0, p.sy), y1: Math.max(b.y1, p.sy)
          }), { x0: 9999, x1: -9999, y0: 9999, y1: -9999 });

          // Diagonal gradient: top-left pink → bottom-right lavender/blue
          const fillGrd = ctx.createLinearGradient(bds.x0, bds.y0, bds.x1, bds.y1);
          const pA = (0.55 + pulse * 0.15) * alphaScale;
          fillGrd.addColorStop(0, `rgba(${220 + iridShift * 20}, ${180 + iridShift * 30}, ${230 + iridShift * 20}, ${pA})`);
          fillGrd.addColorStop(0.35, `rgba(${230 + iridShift * 15}, ${190 + iridShift * 20}, 255, ${pA * 0.9})`);
          fillGrd.addColorStop(0.65, `rgba(${190 - iridShift * 20}, ${195 + iridShift * 30}, ${255}, ${pA * 0.85})`);
          fillGrd.addColorStop(1, `rgba(${180 + iridShift * 10}, ${190 + iridShift * 20}, ${240 + iridShift * 15}, ${pA * 0.8})`);
          drawPath(heartPts);
          ctx.fillStyle = fillGrd;
          ctx.fill();

          // --- Cyan outline (slightly rough/glitchy) ---
          ctx.save();
          ctx.shadowColor = `rgba(80, 240, 255, ${0.5 * pulse * alphaScale})`;
          ctx.shadowBlur = 10 + pulse * 6;
          // Draw outline with tiny random offsets for glitch texture
          ctx.beginPath();
          for (let i = 0; i <= HEART_PTS; i++) {
            const p = heartPts[i % heartPts.length];
            const glitchX = (Math.sin(i * 73.1 + time * 3) * 0.8);
            const glitchY = (Math.cos(i * 47.7 + time * 2.5) * 0.6);
            if (i === 0) ctx.moveTo(p.sx + glitchX, p.sy + glitchY);
            else ctx.lineTo(p.sx + glitchX, p.sy + glitchY);
          }
          ctx.closePath();
          ctx.strokeStyle = `rgba(${80 + iridShift * 40}, ${230 + iridShift * 20}, 255, ${(0.6 + pulse * 0.3) * alphaScale})`;
          ctx.lineWidth = 2 + pulse * 0.8;
          ctx.stroke();
          ctx.restore();

          // --- Inner concentric hearts (3 layers, progressively smaller) ---
          const innerScales = [0.72, 0.48, 0.28];
          const innerColors = [
            { r: 240, g: 210, b: 255, a: 0.45 }, // light pink-white
            { r: 255, g: 240, b: 255, a: 0.55 }, // brighter white-pink
            { r: 255, g: 255, b: 255, a: 0.6 },  // white core
          ];

          for (let li = 0; li < innerScales.length; li++) {
            const s = innerScales[li];
            // Offset slightly toward center (the heart center is at y = -HEART_SIZE * 0.4 roughly)
            const oyShift = HEART_SIZE * (1 - s) * 0.15;
            const innerH = makeHeart(s, 0, oyShift);
            if (!innerH) continue;

            ctx.save();
            drawPath(heartPts);
            ctx.clip();

            ctx.shadowColor = `rgba(220, 200, 255, ${0.4 * pulse * alphaScale})`;
            ctx.shadowBlur = 6 + pulse * 4;

            // Draw with slight glitch
            ctx.beginPath();
            for (let i = 0; i <= HEART_PTS; i++) {
              const p = innerH[i % innerH.length];
              const gx = Math.sin(i * 53 + time * 2 + li * 2) * 0.5;
              const gy = Math.cos(i * 37 + time * 1.8 + li * 3) * 0.4;
              if (i === 0) ctx.moveTo(p.sx + gx, p.sy + gy);
              else ctx.lineTo(p.sx + gx, p.sy + gy);
            }
            ctx.closePath();

            const c = innerColors[li];
            const shimmer = Math.sin(time * 1.2 + li * 1.5) * 0.15 + 0.85;
            ctx.strokeStyle = `rgba(${c.r}, ${c.g}, ${c.b}, ${c.a * shimmer * alphaScale})`;
            ctx.lineWidth = 1.5 - li * 0.3 + pulse * 0.5;
            ctx.stroke();
            ctx.restore();
          }

          // --- Center vertical line with glitch marks ---
          ctx.save();
          drawPath(heartPts);
          ctx.clip();

          // Vertical center line (from top cleft to tail)
          const topP = project(0, -HEART_SIZE * 1.3, 0);   // cleft area
          const botP = project(0, -HEART_SIZE * 0.05, 0); // near tail
          if (topP && botP) {
            ctx.beginPath();
            const segments = 20;
            for (let si = 0; si <= segments; si++) {
              const frac = si / segments;
              const sx = topP.sx + (botP.sx - topP.sx) * frac;
              const sy = topP.sy + (botP.sy - topP.sy) * frac;
              // Slight jitter
              const jx = Math.sin(si * 11 + time * 4) * 0.6;
              if (si === 0) ctx.moveTo(sx + jx, sy);
              else ctx.lineTo(sx + jx, sy);
            }
            ctx.strokeStyle = `rgba(200, 230, 255, ${0.4 * pulse * alphaScale})`;
            ctx.lineWidth = 1 + pulse * 0.5;
            ctx.shadowColor = `rgba(180, 240, 255, ${0.3 * alphaScale})`;
            ctx.shadowBlur = 5;
            ctx.stroke();

            // Horizontal glitch marks along the line (especially near tail)
            const glitchCount = 6;
            for (let gi = 0; gi < glitchCount; gi++) {
              const gFrac = 0.5 + gi * 0.08 + Math.sin(time * 2.5 + gi) * 0.03;
              if (gFrac > 1) continue;
              const gx = topP.sx + (botP.sx - topP.sx) * gFrac;
              const gy = topP.sy + (botP.sy - topP.sy) * gFrac;
              const gw = 3 + Math.sin(time * 3 + gi * 5) * 2;
              ctx.beginPath();
              ctx.moveTo(gx - gw, gy);
              ctx.lineTo(gx + gw, gy);
              const gAlpha = (0.25 + Math.sin(time * 4 + gi * 3) * 0.15) * alphaScale;
              ctx.strokeStyle = `rgba(120, 240, 255, ${gAlpha})`;
              ctx.lineWidth = 0.8;
              ctx.stroke();
            }
          }
          ctx.restore();

          // --- Glitch: chunky rectangles on the heart's edge, extending outward ---
          const glitchCycle = Math.sin(time * 1.7) * Math.sin(time * 3.1) * Math.sin(time * 0.6);
          const glitchActive = glitchCycle > 0.3;
          const glitchIntensity = glitchActive ? (glitchCycle - 0.3) / 0.7 : 0;

          const pseudoRand = (seed) => {
            const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
            return x - Math.floor(x);
          };

          // Sample the heart's edge at a given parametric t to get world-space (x, y)
          const heartEdge = (t) => {
            const sinT = Math.sin(t);
            const hx = 16 * Math.sign(sinT) * Math.pow(Math.abs(sinT), 2.3);
            let hy = 13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t);
            if (hy < 0) hy *= 0.7;
            const wx = hx * HEART_SIZE * 1.1 / 16;
            const wy = -hy * HEART_SIZE / 17 - HEART_SIZE;
            return { wx, wy };
          };

          // Place rectangles at points along the heart's outline, extending outward
          const baseBlockCount = 4;
          const burstBlockCount = glitchActive ? Math.floor(5 + glitchIntensity * 7) : 0;
          const totalBlocks = baseBlockCount + burstBlockCount;

          for (let gi = 0; gi < totalBlocks; gi++) {
            const isBurst = gi >= baseBlockCount;
            const intensity = isBurst ? glitchIntensity : 0.25 + Math.sin(time * 0.5 + gi) * 0.15;

            const seed = gi * 73.7 + Math.floor(time * (isBurst ? 6 : 1.5)) * 13.1;

            // Pick a point on the heart outline
            const tParam = pseudoRand(seed + 1.1) * Math.PI * 2;
            const edge = heartEdge(tParam);

            // Block dimensions in world units — chunky squares/rectangles
            const blockW = (3 + pseudoRand(seed + 2.2) * 8) * (isBurst ? (1 + glitchIntensity) : 1);
            const blockH = (2 + pseudoRand(seed + 3.3) * 5) * (isBurst ? (1 + glitchIntensity * 0.5) : 1);

            // Extend outward from heart center (away from x=0)
            const outward = Math.sign(edge.wx) || 1;
            const extraPush = (2 + pseudoRand(seed + 4.4) * 6) * intensity;
            const rectX0 = edge.wx + outward * extraPush;
            const rectX1 = rectX0 + outward * blockW;
            const rectY0 = edge.wy - blockH / 2;
            const rectY1 = edge.wy + blockH / 2;

            // Project rectangle corners through 3D
            const p0 = project(Math.min(rectX0, rectX1), rectY0, 0);
            const p1 = project(Math.max(rectX0, rectX1), rectY0, 0);
            const p2 = project(Math.max(rectX0, rectX1), rectY1, 0);
            const p3 = project(Math.min(rectX0, rectX1), rectY1, 0);
            if (!p0 || !p1 || !p2 || !p3) continue;

            const isCyan = pseudoRand(seed + 5.5) > 0.5;
            const col = isCyan ? [80, 230, 255] : [230, 190, 255];
            const blockAlpha = (isBurst ? (0.4 + glitchIntensity * 0.35) : (0.18 + Math.sin(time * 0.8 + gi * 2) * 0.1)) * alphaScale;

            ctx.beginPath();
            ctx.moveTo(p0.sx, p0.sy);
            ctx.lineTo(p1.sx, p1.sy);
            ctx.lineTo(p2.sx, p2.sy);
            ctx.lineTo(p3.sx, p3.sy);
            ctx.closePath();
            ctx.fillStyle = `rgba(${col[0]}, ${col[1]}, ${col[2]}, ${blockAlpha})`;
            ctx.fill();

            // Companion block: opposite color, slightly offset
            if (pseudoRand(seed + 6.6) > 0.5) {
              const col2 = isCyan ? [230, 190, 255] : [80, 230, 255];
              const offY = (pseudoRand(seed + 7.7) - 0.5) * 4;
              const offX = outward * (1 + pseudoRand(seed + 8.8) * 3);
              const smallW = blockW * (0.4 + pseudoRand(seed + 9.9) * 0.4);
              const smallH = blockH * (0.5 + pseudoRand(seed + 10.1) * 0.4);
              const sx0 = Math.min(rectX0, rectX1) + offX;
              const sy0 = rectY0 + offY;
              const q0 = project(sx0, sy0, 0);
              const q1 = project(sx0 + outward * smallW, sy0, 0);
              const q2 = project(sx0 + outward * smallW, sy0 + smallH, 0);
              const q3 = project(sx0, sy0 + smallH, 0);
              if (q0 && q1 && q2 && q3) {
                ctx.beginPath();
                ctx.moveTo(q0.sx, q0.sy);
                ctx.lineTo(q1.sx, q1.sy);
                ctx.lineTo(q2.sx, q2.sy);
                ctx.lineTo(q3.sx, q3.sy);
                ctx.closePath();
                ctx.fillStyle = `rgba(${col2[0]}, ${col2[1]}, ${col2[2]}, ${blockAlpha * 0.6})`;
                ctx.fill();
              }
            }
          }
        }

        // Draw ripple rings using the same phases
        for (let i = 0; i < RIPPLE_COUNT; i++) {
          const phase = ripplePhases[i];
          const r = phase * RIPPLE_MAX_R;
          if (r < 5) continue;

          const fade = Math.sin(phase * Math.PI);
          const alpha = fade * 0.14 * alphaScale;
          if (alpha < 0.005) continue;

          // Inner ripples cyan, mid lavender, outer pink
          const hue = phase < 0.3 ? 195 + phase * 200 : 260 + phase * 60;
          const wy = -RIPPLE_AMP * fade;

          const rOuter = r + BAND_W * 0.5 * fade;
          const rInner = Math.max(0, r - BAND_W * 0.5 * fade);

          // Dark underside — tighter, softer
          const darkBandW = BAND_W * 0.35 * fade;
          const rDarkOuter = r + darkBandW;
          const rDarkInner = Math.max(0, r - darkBandW * 0.3);
          ctx.beginPath();
          let started = false;
          for (let s = 0; s <= STEPS; s++) {
            const a = (s / STEPS) * Math.PI * 2 + rot;
            const p = project(Math.cos(a) * rDarkOuter, wy * 0.3, Math.sin(a) * rDarkOuter);
            if (!p) { started = false; continue; }
            if (!started) { ctx.moveTo(p.sx, p.sy); started = true; }
            else ctx.lineTo(p.sx, p.sy);
          }
          for (let s = STEPS; s >= 0; s--) {
            const a = (s / STEPS) * Math.PI * 2 + rot;
            const p = project(Math.cos(a) * rDarkInner, 0, Math.sin(a) * rDarkInner);
            if (!p) continue;
            ctx.lineTo(p.sx, p.sy);
          }
          ctx.closePath();
          ctx.fillStyle = `hsla(${hue + 10}, 50%, 12%, ${alpha * 0.3})`;
          ctx.fill();

          // Bright top face — tighter
          const topBandW = BAND_W * 0.4 * fade;
          const rTopOuter = r + topBandW;
          const rTopInner = Math.max(0, r - topBandW * 0.5);
          ctx.beginPath();
          started = false;
          for (let s = 0; s <= STEPS; s++) {
            const a = (s / STEPS) * Math.PI * 2 + rot;
            const p = project(Math.cos(a) * rTopOuter, wy, Math.sin(a) * rTopOuter);
            if (!p) { started = false; continue; }
            if (!started) { ctx.moveTo(p.sx, p.sy); started = true; }
            else ctx.lineTo(p.sx, p.sy);
          }
          for (let s = STEPS; s >= 0; s--) {
            const a = (s / STEPS) * Math.PI * 2 + rot;
            const p = project(Math.cos(a) * rTopInner, wy * 0.7, Math.sin(a) * rTopInner);
            if (!p) continue;
            ctx.lineTo(p.sx, p.sy);
          }
          ctx.closePath();
          ctx.fillStyle = `hsla(${hue}, 60%, 48%, ${alpha * 0.4})`;
          ctx.fill();

          // Specular highlight — softer, blurred
          ctx.save();
          ctx.shadowColor = `hsla(${hue - 15}, 80%, 80%, ${alpha * 0.5})`;
          ctx.shadowBlur = 5;
          ctx.beginPath();
          started = false;
          for (let s = 0; s <= STEPS; s++) {
            const a = (s / STEPS) * Math.PI * 2 + rot;
            const p = project(Math.cos(a) * r, wy - 1, Math.sin(a) * r);
            if (!p) { started = false; continue; }
            if (!started) { ctx.moveTo(p.sx, p.sy); started = true; }
            else ctx.lineTo(p.sx, p.sy);
          }
          ctx.strokeStyle = `hsla(${hue - 15}, 75%, 88%, ${alpha * 0.7})`;
          ctx.lineWidth = 0.8 + fade * 1.2;
          ctx.stroke();
          ctx.restore();
        }
      }
      ctx.restore();
    };
    animId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', onResize);
    };
  }, [oledMode, animationsEnabled, bgResolution, bgFps]);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none" style={{zIndex: 1, willChange: 'transform'}} aria-hidden="true" role="presentation" />;
});
ResonanceField.displayName = 'ResonanceField';


export { ResonanceField };
