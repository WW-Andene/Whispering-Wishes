// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — shared/components/BannerCard.jsx
// BannerCard, StandardBannerSection, EventCard components + getActiveBanners helper
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useState, useMemo, useCallback, useEffect, useRef, memo } from 'react';
import { Star, Check, CheckCircle, SkipForward } from 'lucide-react';
import {
  HARD_PITY, SOFT_PITY_START, CURRENT_BANNERS, haptic,
  ELEMENT_COLORS, getElementColor, getSetElementColor, getEchoSetColors, getBuffElementColor,
} from '../../appcore-data.js';
import {
  getTimeRemaining, getServerAdjustedEnd, getRecurringEventEnd,
  getNextDailyReset, getNextWeeklyReset, storageAvailable, sanitizeStateObj,
} from '../../appcore-engine.js';
import { hideOnError } from '../utils/imageHelpers.js';
import { CountdownTimer } from './CountdownTimer.jsx';

// ═══════════════════════════════════════════════════════════════════════════════
// INTERNAL: Shared constants and helpers
// ═══════════════════════════════════════════════════════════════════════════════

const BANNER_GRADIENT_MAP = {
  Fusion: { borderColor: 'rgba(249,115,22,0.4)', bgColor: 'rgba(249,115,22,0.2)', text: 'text-orange-400', glow: '249,115,22' },
  Electro: { borderColor: 'rgba(168,85,247,0.4)', bgColor: 'rgba(168,85,247,0.2)', text: 'text-purple-400', glow: '168,85,247' },
  Aero: { borderColor: 'rgba(16,185,129,0.4)', bgColor: 'rgba(16,185,129,0.2)', text: 'text-emerald-400', glow: '16,185,129' },
  Glacio: { borderColor: 'rgba(6,182,212,0.4)', bgColor: 'rgba(6,182,212,0.2)', text: 'text-cyan-400', glow: '6,182,212' },
  Havoc: { borderColor: 'rgba(236,72,153,0.55)', bgColor: 'rgba(236,72,153,0.25)', text: 'text-pink-400', glow: '236,72,153' },
  Spectro: { borderColor: 'rgba(234,179,8,0.4)', bgColor: 'rgba(234,179,8,0.2)', text: 'text-yellow-400', glow: '234,179,8' },
};

const EVENT_ACCENT_COLORS = {
  cyan: { text: 'text-cyan-400', border: 'border-cyan-500/30', bg: 'bg-cyan-500/20' },
  pink: { text: 'text-pink-400', border: 'border-pink-500/30', bg: 'bg-pink-500/20' },
  orange: { text: 'text-orange-400', border: 'border-orange-500/30', bg: 'bg-orange-500/20' },
  purple: { text: 'text-purple-400', border: 'border-purple-500/30', bg: 'bg-purple-500/20' },
  yellow: { text: 'text-yellow-400', border: 'border-yellow-500/30', bg: 'bg-yellow-500/20' },
  emerald: { text: 'text-emerald-400', border: 'border-emerald-500/30', bg: 'bg-emerald-500/20' },
  red: { text: 'text-red-400', border: 'border-red-500/30', bg: 'bg-red-500/20' },
};

const BANNER_CARD_OVERLAY_STYLE = Object.freeze({ background: 'linear-gradient(to top, rgba(8,12,20,0.85) 60%, transparent)', padding: '10px 12px 12px', textShadow: '0 2px 8px rgba(0,0,0,0.9), 0 1px 3px rgba(0,0,0,0.8)' });
const TEXT_SHADOW_STYLE = Object.freeze({ textShadow: '0 2px 8px rgba(0,0,0,0.9), 0 1px 3px rgba(0,0,0,0.8)' });

// Unified mask gradient generator (horizontal)
const _maskCache = new Map();
const generateMaskGradient = (fadePos, fadeIntensity) => {
  const key = `h-${fadePos}-${fadeIntensity}`;
  if (_maskCache.has(key)) return _maskCache.get(key);

  let result;
  if (fadePos === undefined || fadeIntensity === undefined) {
    result = 'linear-gradient(to right, rgba(0,0,0,0) 0%, rgba(0,0,0,0) 10%, rgba(0,0,0,0.15) 20%, rgba(0,0,0,0.35) 30%, rgba(0,0,0,0.6) 40%, rgba(0,0,0,0.9) 50%, rgba(0,0,0,0.9) 100%)';
  } else {
    const maxOpacity = fadeIntensity / 100;
    const endPos = fadePos;
    if (endPos <= 10) {
      result = `linear-gradient(to right, rgba(0,0,0,0) 0%, rgba(0,0,0,${maxOpacity}) ${endPos}%, rgba(0,0,0,${maxOpacity}) 100%)`;
    } else {
      const steps = [`rgba(0,0,0,0) 0%`];
      const fadeStart = Math.max(0, endPos - 40);
      if (fadeStart > 0) steps.push(`rgba(0,0,0,0) ${fadeStart}%`);
      for (let i = 1; i <= 5; i++) {
        const pos = fadeStart + (endPos - fadeStart) * (i / 5);
        const opacity = maxOpacity * (i / 5);
        steps.push(`rgba(0,0,0,${opacity.toFixed(2)}) ${pos.toFixed(0)}%`);
      }
      steps.push(`rgba(0,0,0,${maxOpacity}) 100%`);
      result = `linear-gradient(to right, ${steps.join(', ')})`;
    }
  }

  if (_maskCache.size > 200) _maskCache.clear();
  _maskCache.set(key, result);
  return result;
};

// §BANNER_PARTICLES: Theme-driven particle overlay — each banner gets a fitting visual personality
// Character-specific theme overrides (matched to their banner art mood)
const CHARACTER_THEME_MAP = {
  Sigrika: 'sparkle',    // warm, magical, golden sparkles at feet, starry sky
  Qiuyuan: 'qiuyuan',    // dark forest, moon, crows, brume, swirling leaves
  Aemeath: 'frost',      // ice crystals, cold blue digital structures
  'Luuk Herssen': 'feathers', // white doves, bright nature, airy
  Chisa: 'energy',       // urban, red energy lines, industrial
  Galbrena: 'embers',    // fire/ice duality, intense swirling flames
  Augusta: 'embers',     // grand, dragon wings, fire, golden city
  Lupa: 'embers',        // battle energy, red/white explosive swirl
  Mornye: 'cosmic',      // cosmic water, ethereal blue sphere
  Iuno: 'cosmic',        // ocean/cosmic, swirling water energy
};
// Element-based fallback for characters without specific overrides
const ELEMENT_THEME_FALLBACK = {
  Fusion: 'embers', Glacio: 'frost', Aero: 'feathers',
  Havoc: 'mist', Electro: 'energy', Spectro: 'sparkle',
};

// ── Theme definitions: each returns { particles[], draw(ctx, particles, t, w, h) } ──
const BANNER_THEMES = {
  // ✨ SPARKLE: golden 4-point stars twinkling + warm motes floating up + orange glow
  sparkle: (w, h) => {
    const stars = Array.from({ length: 18 }, () => ({
      x: Math.random() * w, y: h * 0.15 + Math.random() * h * 0.83,
      size: 2.2 + Math.random() * 3.5, phase: Math.random() * Math.PI * 2,
      speed: 0.5 + Math.random() * 1.5,
    }));
    const motes = Array.from({ length: 14 }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      vy: -0.15 - Math.random() * 0.25, phase: Math.random() * Math.PI * 2,
      size: 1.2 + Math.random() * 2, alpha: 0.5 + Math.random() * 0.4,
    }));
    // Orange glow zone — bottom-left warm ambient light
    const glowX = w * 0.2, glowY = h * 0.85;
    return (ctx, t) => {
      // Ambient orange glow — subtle warm light from bottom-left
      const gPulse = 0.7 + Math.sin(t * 0.12) * 0.2 + Math.sin(t * 0.07 + 1.5) * 0.1;
      ctx.save();
      ctx.globalAlpha = 0.18 * gPulse;
      const og = ctx.createRadialGradient(glowX, glowY, 0, glowX, glowY, w * 0.45);
      og.addColorStop(0, 'rgba(255,160,50,0.4)');
      og.addColorStop(0.4, 'rgba(255,130,30,0.15)');
      og.addColorStop(1, 'rgba(255,100,20,0)');
      ctx.fillStyle = og;
      ctx.beginPath(); ctx.arc(glowX, glowY, w * 0.45, 0, Math.PI * 2); ctx.fill();
      ctx.restore();

      for (const s of stars) {
        const tw = Math.sin(t * s.speed + s.phase);
        const a = Math.max(0, tw) * 0.95;
        if (a < 0.05) continue;
        ctx.save();
        ctx.globalAlpha = a;
        ctx.fillStyle = 'rgba(255,220,100,1)';
        ctx.shadowColor = 'rgba(255,200,50,0.9)';
        ctx.shadowBlur = 12;
        const sz = s.size * (0.6 + tw * 0.4);
        ctx.beginPath();
        ctx.moveTo(s.x, s.y - sz * 2); ctx.lineTo(s.x + sz * 0.35, s.y - sz * 0.35);
        ctx.lineTo(s.x + sz * 2, s.y); ctx.lineTo(s.x + sz * 0.35, s.y + sz * 0.35);
        ctx.lineTo(s.x, s.y + sz * 2); ctx.lineTo(s.x - sz * 0.35, s.y + sz * 0.35);
        ctx.lineTo(s.x - sz * 2, s.y); ctx.lineTo(s.x - sz * 0.35, s.y - sz * 0.35);
        ctx.closePath(); ctx.fill();
        ctx.restore();
      }
      for (const m of motes) {
        m.y += m.vy;
        m.x += Math.sin(t * 0.5 + m.phase) * 0.2;
        if (m.y < -5) { m.y = h + 5; m.x = Math.random() * w; }
        ctx.save();
        ctx.globalAlpha = m.alpha * (0.6 + Math.sin(t + m.phase) * 0.4);
        ctx.fillStyle = 'rgba(255,240,180,1)';
        ctx.shadowColor = 'rgba(255,220,100,0.8)';
        ctx.shadowBlur = 12;
        ctx.beginPath(); ctx.arc(m.x, m.y, m.size, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      }
    };
  },

  // 🌫️ MIST: dark fog wisps drifting + falling leaves/feathers
  mist: (w, h) => {
    const fog = Array.from({ length: 6 }, () => ({
      x: Math.random() * w * 1.5, y: h * 0.2 + Math.random() * h * 0.6,
      size: 50 + Math.random() * 70, vx: -0.15 - Math.random() * 0.2,
      alpha: 0.05 + Math.random() * 0.06, phase: Math.random() * Math.PI * 2,
    }));
    const leaves = Array.from({ length: 8 }, () => ({
      x: Math.random() * w, y: -10 - Math.random() * h * 0.5,
      size: 1.3 + Math.random() * 2.5, vy: 0.2 + Math.random() * 0.35,
      vx: -0.1 - Math.random() * 0.2, swayAmp: 6 + Math.random() * 12,
      swaySpeed: 0.3 + Math.random() * 0.5, phase: Math.random() * Math.PI * 2,
      rot: Math.random() * Math.PI * 2, rotV: (Math.random() - 0.5) * 0.015,
      alpha: 0.25 + Math.random() * 0.35,
    }));
    return (ctx, t) => {
      for (const f of fog) {
        f.x += f.vx + Math.sin(t * 0.2 + f.phase) * 0.1;
        if (f.x < -f.size * 2) f.x = w + f.size;
        const pulse = f.alpha * (0.7 + Math.sin(t * 0.3 + f.phase) * 0.3);
        ctx.save();
        ctx.globalAlpha = pulse;
        const grad = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.size);
        grad.addColorStop(0, 'rgba(80,90,100,0.6)');
        grad.addColorStop(1, 'rgba(60,70,80,0)');
        ctx.fillStyle = grad;
        ctx.beginPath(); ctx.arc(f.x, f.y, f.size, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      }
      for (const l of leaves) {
        l.y += l.vy; l.x += l.vx; l.rot += l.rotV;
        const sx = l.x + Math.sin(t * l.swaySpeed + l.phase) * l.swayAmp;
        if (l.y > h + 10) { l.y = -8; l.x = Math.random() * w; }
        ctx.save();
        ctx.globalAlpha = l.alpha;
        ctx.translate(sx, l.y); ctx.rotate(l.rot);
        ctx.fillStyle = 'rgba(50,60,50,0.9)';
        ctx.beginPath(); ctx.ellipse(0, 0, l.size * 0.5, l.size * 1.8, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    };
  },

  // ❄️ FROST: ice crystal particles drifting down + cold blue sparkle dots
  frost: (w, h) => {
    const crystals = Array.from({ length: 12 }, () => ({
      x: Math.random() * w, y: -5 - Math.random() * h * 0.3,
      size: 2 + Math.random() * 2.5, vy: 0.15 + Math.random() * 0.3,
      vx: (Math.random() - 0.5) * 0.15, rot: Math.random() * Math.PI * 2,
      rotV: (Math.random() - 0.5) * 0.01, alpha: 0.35 + Math.random() * 0.4,
    }));
    const dots = Array.from({ length: 12 }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      phase: Math.random() * Math.PI * 2, speed: 0.4 + Math.random() * 0.8,
      size: 0.7 + Math.random() * 1.3,
    }));
    return (ctx, t) => {
      for (const c of crystals) {
        c.y += c.vy; c.x += c.vx; c.rot += c.rotV;
        if (c.y > h + 10) { c.y = -8; c.x = Math.random() * w; }
        ctx.save();
        ctx.globalAlpha = c.alpha;
        ctx.translate(c.x, c.y); ctx.rotate(c.rot);
        ctx.strokeStyle = 'rgba(140,220,240,0.9)';
        ctx.lineWidth = 0.8;
        ctx.shadowColor = 'rgba(100,200,240,0.6)';
        ctx.shadowBlur = 7;
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const a = (Math.PI / 3) * i;
          ctx[i === 0 ? 'moveTo' : 'lineTo'](Math.cos(a) * c.size, Math.sin(a) * c.size);
        }
        ctx.closePath(); ctx.stroke();
        ctx.restore();
      }
      for (const d of dots) {
        const a = Math.pow(Math.max(0, Math.sin(t * d.speed + d.phase)), 2) * 0.8;
        if (a < 0.03) continue;
        ctx.save();
        ctx.globalAlpha = a;
        ctx.fillStyle = 'rgba(180,230,255,1)';
        ctx.shadowColor = 'rgba(100,200,240,0.7)';
        ctx.shadowBlur = 8;
        ctx.beginPath(); ctx.arc(d.x, d.y, d.size, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      }
    };
  },

  // 🔥 EMBERS: orange/red sparks rising + heat shimmer
  embers: (w, h) => {
    const sparks = Array.from({ length: 14 }, () => ({
      x: Math.random() * w, y: h * 0.4 + Math.random() * h * 0.6,
      vy: -0.3 - Math.random() * 0.6, vx: (Math.random() - 0.5) * 0.3,
      size: 1.1 + Math.random() * 1.8, alpha: 0.45 + Math.random() * 0.4,
      phase: Math.random() * Math.PI * 2, life: Math.random(),
      lifeSpeed: 0.004 + Math.random() * 0.005,
      color: Math.random() > 0.4 ? '255,130,40' : '255,80,30',
    }));
    return (ctx, t) => {
      for (const s of sparks) {
        s.life += s.lifeSpeed;
        if (s.life > 1) {
          s.life = 0; s.x = Math.random() * w; s.y = h * 0.4 + Math.random() * h * 0.6;
        }
        s.y += s.vy; s.x += s.vx + Math.sin(t * 2 + s.phase) * 0.3;
        const fade = s.life < 0.1 ? s.life / 0.1 : s.life > 0.6 ? (1 - s.life) / 0.4 : 1;
        const a = s.alpha * fade;
        if (a < 0.02) continue;
        ctx.save();
        ctx.globalAlpha = a;
        ctx.fillStyle = `rgba(${s.color},1)`;
        ctx.shadowColor = `rgba(${s.color},0.8)`;
        ctx.shadowBlur = 8;
        ctx.beginPath(); ctx.arc(s.x, s.y, s.size * (0.5 + fade * 0.5), 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      ctx.save();
      ctx.globalAlpha = 0.025 + Math.sin(t * 0.5) * 0.015;
      const hg = ctx.createLinearGradient(0, h, 0, h * 0.4);
      hg.addColorStop(0, 'rgba(255,100,30,0.4)');
      hg.addColorStop(1, 'rgba(255,100,30,0)');
      ctx.fillStyle = hg;
      ctx.fillRect(0, h * 0.4, w, h * 0.6);
      ctx.restore();
    };
  },

  // 🕊️ FEATHERS: white feathers floating up + soft light dots
  feathers: (w, h) => {
    const feathers = Array.from({ length: 7 }, () => ({
      x: Math.random() * w, y: h + Math.random() * h * 0.3,
      vy: -0.15 - Math.random() * 0.25, vx: (Math.random() - 0.5) * 0.15,
      swayAmp: 10 + Math.random() * 15, swaySpeed: 0.3 + Math.random() * 0.4,
      rot: Math.random() * Math.PI * 2, rotV: (Math.random() - 0.5) * 0.008,
      size: 2 + Math.random() * 2.5, alpha: 0.3 + Math.random() * 0.4,
      phase: Math.random() * Math.PI * 2,
    }));
    const lights = Array.from({ length: 10 }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      phase: Math.random() * Math.PI * 2, speed: 0.3 + Math.random() * 0.5,
      size: 0.8 + Math.random() * 1,
    }));
    return (ctx, t) => {
      for (const f of feathers) {
        f.y += f.vy; f.x += f.vx; f.rot += f.rotV;
        const sx = f.x + Math.sin(t * f.swaySpeed + f.phase) * f.swayAmp;
        if (f.y < -15) { f.y = h + 10; f.x = Math.random() * w; }
        ctx.save();
        ctx.globalAlpha = f.alpha;
        ctx.translate(sx, f.y); ctx.rotate(f.rot);
        ctx.fillStyle = 'rgba(255,255,250,0.85)';
        ctx.shadowColor = 'rgba(255,250,230,0.5)';
        ctx.shadowBlur = 6;
        ctx.beginPath(); ctx.ellipse(0, 0, f.size * 0.4, f.size * 2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = 'rgba(220,210,190,0.4)';
        ctx.lineWidth = 0.4;
        ctx.beginPath(); ctx.moveTo(0, -f.size * 1.8); ctx.lineTo(0, f.size * 1.8); ctx.stroke();
        ctx.restore();
      }
      for (const l of lights) {
        const a = Math.pow(Math.max(0, Math.sin(t * l.speed + l.phase)), 2) * 0.6;
        if (a < 0.03) continue;
        ctx.save();
        ctx.globalAlpha = a;
        ctx.fillStyle = 'rgba(255,240,200,1)';
        ctx.shadowColor = 'rgba(255,230,160,0.5)';
        ctx.shadowBlur = 7;
        ctx.beginPath(); ctx.arc(l.x, l.y, l.size, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      }
    };
  },

  // ⚡ ENERGY: sharp quick line flashes + geometric bright dots
  energy: (w, h) => {
    const flashes = Array.from({ length: 7 }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      angle: Math.random() * Math.PI, len: 18 + Math.random() * 30,
      phase: Math.random() * 20, speed: 3 + Math.random() * 4,
      color: Math.random() > 0.5 ? '255,60,80' : '255,255,255',
    }));
    const dots = Array.from({ length: 12 }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.8, vy: (Math.random() - 0.5) * 0.5,
      size: 0.7 + Math.random() * 1.2, alpha: 0.4 + Math.random() * 0.45,
      phase: Math.random() * Math.PI * 2,
    }));
    return (ctx, t) => {
      for (const f of flashes) {
        f.phase += 0.016 * f.speed;
        const cycle = f.phase % 8;
        const a = cycle < 0.3 ? cycle / 0.3 : cycle < 0.6 ? (0.6 - cycle) / 0.3 : 0;
        if (a < 0.02) {
          if (cycle > 7.5) { f.x = Math.random() * w; f.y = Math.random() * h; f.angle = Math.random() * Math.PI; }
          continue;
        }
        ctx.save();
        ctx.globalAlpha = a * 0.7;
        ctx.strokeStyle = `rgba(${f.color},1)`;
        ctx.shadowColor = `rgba(${f.color},0.7)`;
        ctx.shadowBlur = 6;
        ctx.lineWidth = 1.2;
        const dx = Math.cos(f.angle) * f.len * 0.5;
        const dy = Math.sin(f.angle) * f.len * 0.5;
        ctx.beginPath(); ctx.moveTo(f.x - dx, f.y - dy); ctx.lineTo(f.x + dx, f.y + dy); ctx.stroke();
        ctx.restore();
      }
      for (const d of dots) {
        d.x += d.vx; d.y += d.vy;
        if (d.x < 0 || d.x > w) d.vx *= -1;
        if (d.y < 0 || d.y > h) d.vy *= -1;
        const pulse = d.alpha * (0.5 + Math.sin(t * 3 + d.phase) * 0.5);
        ctx.save();
        ctx.globalAlpha = pulse;
        ctx.fillStyle = 'rgba(255,200,200,1)';
        ctx.shadowColor = 'rgba(255,60,80,0.6)';
        ctx.shadowBlur = 5;
        ctx.fillRect(d.x - d.size, d.y - d.size, d.size * 2, d.size * 2);
        ctx.restore();
      }
    };
  },

  // 🌌 COSMIC: slow orbiting particles + soft radial glow pulses
  cosmic: (w, h) => {
    const cx = w * 0.5, cy = h * 0.45, radius = Math.min(w, h) * 0.3;
    const orbiters = Array.from({ length: 12 }, () => ({
      angle: Math.random() * Math.PI * 2,
      speed: 0.08 + Math.random() * 0.12,
      rOff: (Math.random() - 0.5) * 20,
      size: 0.8 + Math.random() * 1.5, alpha: 0.25 + Math.random() * 0.4,
      phase: Math.random() * Math.PI * 2,
    }));
    const glows = Array.from({ length: 4 }, () => ({
      x: w * 0.2 + Math.random() * w * 0.6, y: h * 0.15 + Math.random() * h * 0.6,
      size: 25 + Math.random() * 40, phase: Math.random() * Math.PI * 2,
      speed: 0.2 + Math.random() * 0.3,
    }));
    return (ctx, t) => {
      for (const g of glows) {
        const a = 0.035 + Math.sin(t * g.speed + g.phase) * 0.025;
        if (a < 0.005) continue;
        ctx.save();
        ctx.globalAlpha = a;
        const grad = ctx.createRadialGradient(g.x, g.y, 0, g.x, g.y, g.size);
        grad.addColorStop(0, 'rgba(100,180,255,0.7)');
        grad.addColorStop(1, 'rgba(60,120,200,0)');
        ctx.fillStyle = grad;
        ctx.beginPath(); ctx.arc(g.x, g.y, g.size, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      }
      for (const o of orbiters) {
        o.angle += o.speed * 0.016;
        const r = radius + o.rOff + Math.sin(t * 0.5 + o.phase) * 5;
        const ox = cx + Math.cos(o.angle) * r;
        const oy = cy + Math.sin(o.angle) * r * 0.4;
        const pulse = 0.6 + Math.sin(t * 0.8 + o.phase) * 0.4;
        ctx.save();
        ctx.globalAlpha = o.alpha * pulse;
        ctx.fillStyle = 'rgba(140,200,255,1)';
        ctx.shadowColor = 'rgba(100,180,255,0.6)';
        ctx.shadowBlur = 7;
        ctx.beginPath(); ctx.arc(ox, oy, o.size, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      }
    };
  },

  // 🌙 QIUYUAN: moonlit brume, drifting leaves, jade glints
  qiuyuan: (w, h) => {
    // Brume patches — muted grey-green
    const brume = Array.from({ length: 7 }, () => ({
      x: Math.random() * w * 1.5, y: h * 0.2 + Math.random() * h * 0.6,
      size: 60 + Math.random() * 80, vx: -0.12 - Math.random() * 0.18,
      alpha: 0.12 + Math.random() * 0.1, phase: Math.random() * Math.PI * 2,
    }));
    // Leaves — varied shade/size/speed, brighter near moon, darker far away
    const moonX = w * 0.645, moonY = h * 0.115;
    // Leaves spawn from top-right, drift down-left
    // Color: very dark (20,25,35) on right → light (120,135,155) on left
    const leaves = Array.from({ length: 22 }, (_, i) => {
      // Spawn from top edge (wider spread) and right edge (upper half)
      const fromRight = Math.random() < 0.35;
      const lx = fromRight ? w + Math.random() * 10 : w * 0.15 + Math.random() * w * 0.85;
      const ly = fromRight ? Math.random() * h * 0.55 : -Math.random() * 20;
      return {
        x: lx, y: ly,
        size: 1.5 + Math.random() * 7,
        vy: 0.12 + Math.random() * 0.2,
        vx: -0.25 - Math.random() * 0.3, swayAmp: 12 + Math.random() * 22,
        swaySpeed: 0.15 + Math.random() * 0.28, phase: Math.random() * Math.PI * 2,
        rot: Math.random() * Math.PI * 2,
        rotV: 0.015 + Math.random() * 0.025,
        spinPhase: Math.random() * Math.PI * 2,
        spinSpeed: 0.4 + Math.random() * 0.6,
        alpha: 0.55 + Math.random() * 0.25,
        colorShift: Math.random(),
      };
    });
    // Jade glint particles
    const jadeGlints = Array.from({ length: 12 }, () => ({
      x: Math.random() * w, y: h * 0.15 + Math.random() * h * 0.75,
      phase: Math.random() * Math.PI * 2, speed: 0.3 + Math.random() * 0.5,
      size: 1.2 + Math.random() * 2,
    }));
    const moonR = 38;
    return (ctx, t) => {
      // Moon glow handled by CSS-animated div in BannerParticleOverlay
      // Brume
      for (const b of brume) {
        b.x += b.vx + Math.sin(t * 0.15 + b.phase) * 0.08;
        if (b.x < -b.size * 2) b.x = w + b.size;
        const pulse = b.alpha * (0.7 + Math.sin(t * 0.25 + b.phase) * 0.3);
        ctx.save();
        ctx.globalAlpha = pulse;
        const grad = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.size);
        grad.addColorStop(0, 'rgba(100,160,120,0.5)');
        grad.addColorStop(1, 'rgba(60,100,70,0)');
        ctx.fillStyle = grad;
        ctx.beginPath(); ctx.arc(b.x, b.y, b.size, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      }
      // Drifting leaves — circular rotation, strong leftward drift, wide color range
      for (const l of leaves) {
        l.y += l.vy; l.x += l.vx;
        l.rot += l.rotV;
        const sx = l.x + Math.sin(t * l.swaySpeed + l.phase) * l.swayAmp;
        if (l.y > h + 10 || l.x < -20) {
          const fromRight = Math.random() < 0.35;
          l.x = fromRight ? w + Math.random() * 10 : w * 0.15 + Math.random() * w * 0.85;
          l.y = fromRight ? Math.random() * h * 0.55 : -Math.random() * 20;
          l.size = 1.5 + Math.random() * 7;
          l.alpha = 0.55 + Math.random() * 0.25;
          l.colorShift = Math.random();
        }
        // 3D self-rotation: cos squashes width to simulate tumbling
        const spin = Math.cos(t * l.spinSpeed + l.spinPhase);
        const widthScale = 0.2 + Math.abs(spin) * 0.8;
        // Color: dark (8,12,18) to cool blue-grey (120,135,170)
        // Each leaf has its own colorShift, plus face shading from spin
        const faceBias = spin * 0.12;
        const cm = Math.min(1, Math.max(0, l.colorShift + faceBias));
        const lr = Math.floor(8 + cm * 112);
        const lg = Math.floor(12 + cm * 123);
        const lb = Math.floor(18 + cm * 152);
        ctx.save();
        ctx.globalAlpha = l.alpha;
        ctx.translate(sx, l.y); ctx.rotate(l.rot);
        ctx.fillStyle = `rgb(${lr},${lg},${lb})`;
        ctx.beginPath();
        ctx.ellipse(0, 0, l.size * 0.45 * widthScale, l.size * 1.7, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      // Jade glints
      for (const g of jadeGlints) {
        const a = Math.pow(Math.max(0, Math.sin(t * g.speed + g.phase)), 1.5) * 0.95;
        if (a < 0.04) continue;
        ctx.save();
        ctx.globalAlpha = a;
        ctx.fillStyle = 'rgba(140,255,170,1)';
        ctx.shadowColor = 'rgba(100,240,140,0.9)';
        ctx.shadowBlur = 14;
        ctx.beginPath(); ctx.arc(g.x, g.y, g.size, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      }
    };
  },
};

const BannerParticleOverlay = memo(({ characterName, element }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const rect = canvas.parentElement.getBoundingClientRect();
    const w = rect.width || 400;
    const h = rect.height || 190;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);

    // Pick theme: character-specific override → element fallback → sparkle default
    const themeKey = CHARACTER_THEME_MAP[characterName]
      || ELEMENT_THEME_FALLBACK[element]
      || 'sparkle';
    const drawFn = (BANNER_THEMES[themeKey] || BANNER_THEMES.sparkle)(w, h);

    let animId, t = 0;
    const frame = () => {
      ctx.clearRect(0, 0, w, h);
      t += 0.016;
      drawFn(ctx, t);
      animId = requestAnimationFrame(frame);
    };
    animId = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(animId);
  }, [characterName, element]);

  const isQiuyuan = characterName === 'Qiuyuan';

  return (
    <>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none"
        style={{ zIndex: 2, width: '100%', height: '100%' }}
        aria-hidden="true"
      />
      {isQiuyuan && (
        <div
          className="absolute pointer-events-none moon-glow-pulse"
          style={{ left: '65.5%', top: '10.5%', width: '140px', height: '140px', zIndex: 3 }}
          aria-hidden="true"
        />
      )}
    </>
  );
});
BannerParticleOverlay.displayName = 'BannerParticleOverlay';

const BannerCard = memo(({ item, type, stats, bannerImage, visualSettings, endDate, timerColor }) => {
  const isChar = type === 'character';
  const style = BANNER_GRADIENT_MAP[item.element] || BANNER_GRADIENT_MAP.Fusion;
  const imgUrl = item.imageUrl || bannerImage;

  // Use unified mask generator
  const maskGradient = visualSettings
    ? generateMaskGradient(visualSettings.fadePosition, visualSettings.fadeIntensity)
    : generateMaskGradient();
  const pictureOpacity = visualSettings ? visualSettings.pictureOpacity / 100 : 0.9;
  const isFull = visualSettings?.animationsEnabled === 'full';

  return (
    <div className={isFull ? 'banner-card-glow rounded-xl' : ''} style={isFull ? { '--glow-color': style.glow, zIndex: 5 } : { zIndex: 5 }}>
    <div className="relative overflow-hidden rounded-xl border" style={{ minHeight: '190px', isolation: 'isolate', borderColor: style.borderColor, boxShadow: isFull ? 'none' : '0 0 40px rgba(237,175,24,0.06), 0 4px 16px rgba(0,0,0,0.3)' }}>
      {imgUrl && (
        <div className="absolute inset-0" style={{ zIndex: 1 }}>
          <img
            src={imgUrl}
            alt={item.name}
            className="w-full h-full object-cover object-top"
            style={{
              opacity: pictureOpacity,
              maskImage: maskGradient,
              WebkitMaskImage: maskGradient
            }}
            loading="eager"
            onError={hideOnError}
          />
        </div>
      )}
      {imgUrl && isFull && <BannerParticleOverlay characterName={isChar ? item.name : item.forCharacter || item.name} element={item.element} />}

      {endDate && (
        <div className="absolute top-2 right-2 z-20">
          <CountdownTimer endDate={endDate} color={timerColor || 'yellow'} />
        </div>
      )}
      
      <div className="absolute inset-0 z-10 p-3 flex flex-col justify-between" style={TEXT_SHADOW_STYLE}>
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            {item.isNew && <span className="text-[10px] bg-yellow-500 text-black px-1.5 py-0.5 rounded-full font-bold" style={{textShadow: 'none'}}>NEW</span>}
            <span className={`text-[10px] px-2 py-0.5 rounded ${style.text} border`} style={{ borderColor: style.borderColor, backgroundColor: style.bgColor }}>{isChar ? item.element : item.type}</span>
          </div>
          <h4 className="font-bold text-base text-white leading-tight">{item.name}</h4>
          {item.title && <p className="text-gray-200 text-[10px] mt-0.5 line-clamp-1">{item.title}</p>}
        </div>
        
        <div className={stats ? 'mb-14' : ''}>
          <div className="text-gray-300 text-[10px] mb-0.5 uppercase tracking-wider">Featured 4★</div>
          <div className="flex gap-1 flex-wrap">
            {(item.featured4Stars || []).map(n => <span key={n} className="text-[10px] text-cyan-300 bg-cyan-500/30 px-1.5 py-0.5 rounded backdrop-blur-sm">{n}</span>)}
          </div>
        </div>
      </div>
      
      {stats && (
        <div className="absolute bottom-0 left-0 right-0 z-10 border-t border-white/15" style={BANNER_CARD_OVERLAY_STYLE}>
          <div className="flex items-center gap-3">
            <div className="flex-1 flex items-center gap-3">
                <div className="text-center">
                  <div className={`font-bold text-base kuro-number ${stats.pity5 >= HARD_PITY ? 'text-red-500 font-bold animate-pulse' : stats.pity5 >= 75 ? 'text-red-400' : stats.pity5 >= SOFT_PITY_START ? 'text-amber-400' : isChar ? 'text-yellow-400' : 'text-pink-400'}`}>{stats.pity5}<span className="text-gray-400 text-[10px] ml-0.5">/{HARD_PITY}</span></div>
                  <div className={`text-[10px] mt-0.5 ${stats.pity5 >= HARD_PITY ? 'text-red-500 font-bold' : stats.pity5 >= 75 ? 'text-red-400 font-medium' : stats.pity5 >= SOFT_PITY_START ? 'text-amber-400 font-medium' : 'text-gray-400'}`}>{stats.pity5 >= HARD_PITY ? '★ GUARANTEED!' : stats.pity5 >= 75 ? '⚠ High Pity!' : stats.pity5 >= SOFT_PITY_START ? 'Soft Pity!' : '5★ Pity'}</div>
                </div>
                <div className="text-center">
                  <div className="text-purple-400 font-bold text-sm">{stats.pity4}<span className="text-gray-400 text-[10px] ml-0.5">/10</span></div>
                  <div className="text-gray-400 text-[10px] mt-0.5">4★ Pity</div>
                </div>
                <div className="text-center">
                  <div className="text-white font-bold text-sm">{stats.totalPulls}</div>
                  <div className="text-gray-400 text-[10px] mt-0.5">Convenes</div>
                </div>
              </div>
              {/* MED-27: Escalated from text-[10px] to text-xs font-bold for visual weight */}
              {isChar ? (
                <div className={`text-xs font-bold px-2 py-0.5 rounded-full backdrop-blur-sm ${stats.guaranteed ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-orange-500/20 text-orange-400 border border-orange-500/30'}`}>
                  {stats.guaranteed ? '✓ Guaranteed' : '50/50'}
                </div>
              ) : (
                <div className={`text-xs font-bold px-2 py-0.5 rounded-full backdrop-blur-sm ${stats.guaranteed ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-pink-500/20 text-pink-400 border border-pink-500/30'}`}>
                  {stats.guaranteed ? '✓ Guaranteed' : 'No Guarantee'}
                </div>
              )}
            </div>
          </div>
        )}
    </div>
    </div>
  );
});
BannerCard.displayName = 'BannerCard';

const EventCard = memo(({ event, server, bannerImage, visualSettings, status, onStatusChange, isExpired }) => {
  const [resetTick, setResetTick] = useState(0);
  const isDaily = event.dailyReset;
  const isWeekly = event.weeklyReset;
  const isRecurring = !isDaily && !isWeekly && event.resetType && /^~?\d+\s*(days?|d|h|m)?$/i.test(event.resetType.trim());

  const endDate = useMemo(() => {
    if (isDaily) return getNextDailyReset(server);
    if (isWeekly) return getNextWeeklyReset(server);
    if (isRecurring) return getRecurringEventEnd(event.currentEnd, event.resetType, server);
    return getServerAdjustedEnd(event.currentEnd, server);
  }, [event, server, isDaily, isWeekly, isRecurring, resetTick]);

  const handleExpire = useCallback(() => {
    if (isDaily || isWeekly || isRecurring) {
      setResetTick(t => t + 1);
      // Auto-reset done/skipped status on new cycle so recurring events start fresh
      if (onStatusChange) onStatusChange(null);
    }
  }, [isDaily, isWeekly, isRecurring, onStatusChange]);

  const recalcFn = useMemo(() => {
    if (isDaily) return () => getNextDailyReset(server);
    if (isWeekly) return () => getNextWeeklyReset(server);
    if (isRecurring) return () => getRecurringEventEnd(event.currentEnd, event.resetType, server);
    return null;
  }, [isDaily, isWeekly, isRecurring, server, event]);

  const colors = EVENT_ACCENT_COLORS[event.accentColor] || EVENT_ACCENT_COLORS.cyan;
  const imgUrl = bannerImage;

  const maskGradient = visualSettings
    ? generateMaskGradient(visualSettings.shadowFadePosition, visualSettings.shadowFadeIntensity)
    : generateMaskGradient();
  const pictureOpacity = visualSettings ? visualSettings.shadowOpacity / 100 : 0.9;

  const isDone = status === 'done';
  const isSkipped = status === 'skipped';
  const dimmed = isSkipped || isExpired;

  return (
    <div className={`relative overflow-hidden rounded-xl border ${isExpired ? 'border-gray-700/40' : isDone ? 'border-emerald-500/30' : isSkipped ? 'border-gray-600/30' : colors.border}`} style={{ minHeight: '190px', isolation: 'isolate', zIndex: 5, opacity: dimmed ? 0.6 : 1 }}>
      {imgUrl && (
        <img
          src={imgUrl}
          alt={event.name}
          className="absolute inset-0 w-full h-full object-cover"
          style={{
            zIndex: 1,
            opacity: pictureOpacity,
            maskImage: maskGradient,
            WebkitMaskImage: maskGradient,
            filter: dimmed ? 'grayscale(0.8)' : isDone ? 'grayscale(0.3)' : 'none'
          }}
          loading="lazy"
          onError={hideOnError}
        />
      )}

      {isDone && <div className="absolute inset-0 z-[2] bg-emerald-900/20" />}

      <div className="absolute inset-0 z-10 p-3 flex flex-col justify-between" style={TEXT_SHADOW_STYLE}>
        <div className="flex justify-between items-start">
          <div className="flex-1 pr-2">
            <h4 className={`font-bold text-sm ${isExpired ? 'text-gray-500' : isDone ? 'text-emerald-400' : isSkipped ? 'text-gray-500' : colors.text}`}>
              {isDone && <CheckCircle size={12} className="inline mr-1 -mt-0.5" />}
              {isSkipped && <SkipForward size={12} className="inline mr-1 -mt-0.5" />}
              {event.name}
            </h4>
            <p className="text-gray-200 text-[10px]">{event.subtitle}</p>
          </div>
          <div className="text-right flex-shrink-0">
            {isExpired ? (
              <span className="inline-block px-2 py-0.5 rounded text-[10px] font-medium bg-red-500/15 text-red-400 border border-red-500/20">Expired</span>
            ) : (
              <>
                <div className="text-gray-400 text-[10px] mb-1">{isDaily ? 'Resets in' : isWeekly ? 'Weekly reset' : 'Ends in'}</div>
                <CountdownTimer endDate={endDate} color={event.color} alwaysShow={isDaily || isWeekly || isRecurring} onExpire={handleExpire} recalcFn={recalcFn} />
              </>
            )}
          </div>
        </div>

        <div className="flex justify-between items-end">
          <div className={`inline-block px-2 py-0.5 rounded text-[10px] font-medium ${isExpired ? 'bg-gray-500/20 text-gray-500' : isDone ? 'bg-emerald-500/20 text-emerald-400' : isSkipped ? 'bg-gray-500/20 text-gray-500 line-through' : `${colors.bg} ${colors.text}`} backdrop-blur-sm`}>
            {event.rewards}
          </div>
          {onStatusChange && !isExpired && (
            <div className="flex gap-1">
              {!isDone && (
                <button onClick={() => onStatusChange('done')} className="px-3 py-1.5 rounded text-[10px] bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 backdrop-blur-sm transition-colors min-w-[52px] min-h-[36px] text-center" aria-label={`Mark ${event.name} as done`}>
                  <Check size={10} className="inline -mt-0.5" /> Done
                </button>
              )}
              {!isSkipped && (
                <button onClick={() => onStatusChange('skipped')} className="px-3 py-1.5 rounded text-[10px] bg-white/10 text-gray-400 hover:bg-white/20 backdrop-blur-sm transition-colors min-w-[52px] min-h-[36px] text-center" aria-label={`Skip ${event.name}`}>
                  <SkipForward size={10} className="inline -mt-0.5" /> Skip
                </button>
              )}
              {status && (
                <button onClick={() => onStatusChange(null)} className="px-3 py-1.5 rounded text-[10px] bg-white/10 text-gray-300 hover:bg-white/20 backdrop-blur-sm transition-colors min-h-[36px]" aria-label={`Undo ${event.name} status`}>
                  {isDone ? 'Undo Done' : 'Undo Skip'}
                </button>
              )}
            </div>
          )}
          {!onStatusChange && (
            <div className="text-gray-400 text-[10px]">{event.resetType}</div>
          )}
        </div>
      </div>
    </div>
  );
});
EventCard.displayName = 'EventCard';

const ProbabilityBar = memo(({ label, value, color = 'cyan' }) => (
  <div className="flex items-center gap-2" role="meter" aria-label={`${label}: ${value}%`} aria-valuenow={value} aria-valuemin={0} aria-valuemax={100}>
    <span className="text-gray-400 text-[10px] w-12">{label}</span>
    <div className="flex-1 h-5 bg-neutral-800 rounded overflow-hidden">
      <div className={`h-full ${color === 'cyan' ? 'bg-cyan-500' : color === 'pink' ? 'bg-pink-500' : 'bg-yellow-500'} transition-[width] duration-300 flex items-center justify-end pr-1`} style={{ width: `${Math.max(value, 1)}%` }}>
        {value > 10 && <span className="text-[10px] text-black font-bold">{value}%</span>}
      </div>
    </div>
    {value <= 10 && <span className="text-[10px] text-gray-400 w-10">{value}%</span>}
  </div>
));
ProbabilityBar.displayName = 'ProbabilityBar';

// Admin banner storage key
const ADMIN_BANNER_KEY = 'whispering-wishes-admin-banners';
const ADMIN_HASH = 'd0a9f110419bf9487d97f9f99822f6f15c8cd98fed3097a0a0714674aa27feda';

// [SECTION:COLLECTION-GRID]
// Shared component for all collection grids (5★/4★/3★ chars & weapons)
const CollectionGridCard = memo(({ name, count, imgUrl, framing, isSelected, owned, collMask, collOpacity, glowClass, ownedBg, ownedBorder, countLabel, countColor, onClickCard, framingMode, setEditingImage, imageKey, isNew, isProfilePic, onSetProfilePic, isCharOwned, onToggleOwned, isEcho }) => {
  const cardStateClass = isSelected
    ? 'border-emerald-500 ring-2 ring-emerald-500/50'
    : isProfilePic
      ? ownedBg
      : owned
        ? `${ownedBg} ${ownedBorder} ${glowClass}`
        : 'bg-neutral-800/50 border-neutral-700/50';
  const cardClassName = `relative overflow-hidden border rounded-lg text-center ${!framingMode ? 'collection-card' : ''} cursor-pointer ${cardStateClass}`;
  return (
  <div
    className={cardClassName}
    style={{ height: '140px', contain: 'paint', ...(isProfilePic && !isSelected ? { borderColor: 'rgba(251,146,60,0.7)', boxShadow: '0 0 16px rgba(251,146,60,0.25), inset 0 0 12px rgba(251,146,60,0.06)' } : {}) }}
    role="button"
    tabIndex={0}
    aria-label={`${name}${owned ? `, owned${count > 1 ? ` ×${count}` : ''}` : ', not owned'}${isProfilePic ? ', current profile picture' : ''}${isNew ? ', new' : ''}`}
    onClick={() => {
      if (framingMode) {
        setEditingImage(imageKey);
      } else if (onClickCard) {
        haptic.light();
        onClickCard();
      }
    }}
    onKeyDown={(e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (framingMode) {
          setEditingImage(imageKey);
        } else if (onClickCard) {
          haptic.light();
          onClickCard();
        }
      }
    }}
  >
    {/* P15-FIX: NIT-4 — Skeleton placeholder while image loads, prevents layout shift */}
    {imgUrl ? (
      <div className="absolute inset-0 collection-img-wrap" style={{
        maskImage: isEcho
          ? 'radial-gradient(ellipse 75% 70% at center, black 45%, transparent 90%)'
          : 'radial-gradient(ellipse 85% 80% at center, black 50%, transparent 100%)',
        WebkitMaskImage: isEcho
          ? 'radial-gradient(ellipse 75% 70% at center, black 45%, transparent 90%)'
          : 'radial-gradient(ellipse 85% 80% at center, black 50%, transparent 100%)',
      }}>
        <img
          src={imgUrl}
          alt={name}
          loading="lazy"
          className="w-full h-full object-contain pointer-events-none"
          style={{
            transform: `scale(${framing.zoom / 100}) translate(${-framing.x}%, ${-framing.y}%)`,
            opacity: owned ? collOpacity : 0.3,
            filter: owned ? 'none' : 'grayscale(100%)',
            maskImage: collMask,
            WebkitMaskImage: collMask
          }}
          onError={hideOnError}
        />
      </div>
    ) : (
      <div className="absolute inset-0 bg-neutral-800 animate-pulse" />
    )}
    {isNew && (
      <div className="absolute top-1.5 left-1.5 z-20 px-1.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-yellow-500 text-black" style={{boxShadow: '0 0 8px rgba(237,175,24,0.5)', textShadow: 'none'}}>New</div>
    )}
    {/* Profile pic setter — top-right corner */}
    {owned && !framingMode && onSetProfilePic && (
      <button
        className={`profile-pic-btn absolute z-20 flex items-center justify-center transition-all ${isProfilePic ? 'text-black shadow-lg' : 'bg-black/70 text-gray-500 hover:bg-yellow-500/30 hover:text-yellow-300'}`}
        style={{ top: '4px', right: '4px', width: '22px', height: '22px', minHeight: '22px', borderRadius: '6px', padding: 0, ...(isProfilePic ? { background: '#fb923c', boxShadow: '0 0 10px rgba(251,146,60,0.5)' } : {}) }}
        onClick={(e) => { e.stopPropagation(); onSetProfilePic(name); }}
        title={isProfilePic ? 'Current profile picture' : 'Set as profile picture'}
        aria-label={isProfilePic ? 'Current profile picture' : `Set ${name} as profile picture`}
      >
        <Crown size={12} />
      </button>
    )}
    {isSelected && (
      <div className="absolute top-1 right-1 z-20 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
        <span className="text-black text-[10px]">✓</span>
      </div>
    )}
    <div className="absolute bottom-0 left-0 right-0 z-10 p-2 bg-gradient-to-t from-black/90 via-black/60 to-transparent pointer-events-none" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.9)' }}>
      {owned ? (
        <div className={`${countColor} font-bold text-xl`}>{countLabel}</div>
      ) : (
        <div className="text-gray-500 font-bold text-xl">—</div>
      )}
      <div className={`text-[10px] truncate ${owned ? 'text-gray-200' : 'text-gray-400'}`}>{name}</div>
    </div>
  </div>
  );
}, (prev, next) =>
  prev.name === next.name && prev.count === next.count && prev.imgUrl === next.imgUrl &&
  prev.isSelected === next.isSelected && prev.owned === next.owned && prev.collMask === next.collMask &&
  prev.collOpacity === next.collOpacity && prev.framingMode === next.framingMode && prev.isNew === next.isNew &&
  prev.isProfilePic === next.isProfilePic &&
  prev.framing.zoom === next.framing.zoom && prev.framing.x === next.framing.x && prev.framing.y === next.framing.y
);
CollectionGridCard.displayName = 'CollectionGridCard';

// ═══════════════════════════════════════════════════════════════════════════════
// EXTRACTED REUSABLE COMPONENTS (Part 4 deduplication)
// ═══════════════════════════════════════════════════════════════════════════════

// Visual slider group — eliminates ~286 lines of duplication across admin modal + mini window
const VisualSliderGroup = memo(({ title, color, sliders, visualSettings, saveVisualSettings, compact = false, directionControl = null }) => {
  const colorMap = {
    cyan: { text: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', accent: 'accent-cyan-500', activeBg: 'bg-cyan-500/30', activeBorder: 'border-cyan-500/50' },
    emerald: { text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', accent: 'accent-emerald-500', activeBg: 'bg-emerald-500/30', activeBorder: 'border-emerald-500/50' },
    pink: { text: 'text-pink-400', bg: 'bg-pink-500/10', border: 'border-pink-500/30', accent: 'accent-pink-500', activeBg: 'bg-pink-500/30', activeBorder: 'border-pink-500/50' },
    purple: { text: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30', accent: 'accent-purple-500', activeBg: 'bg-purple-500/30', activeBorder: 'border-purple-500/50' },
  };
  const c = colorMap[color] || colorMap.cyan;

  const renderSlider = (slider) => (
    <div key={slider.key}>
      <div className={`flex justify-between text-[${compact ? '9px' : '10px'}] mb-${compact ? '0.5' : '1'}`}>
        <span className={compact ? 'text-gray-400' : 'text-gray-300'}>{compact ? slider.shortLabel : slider.label}</span>
        <span className={c.text}>{visualSettings[slider.key] ?? slider.fallback ?? 50}%</span>
      </div>
      <input type="range" min="0" max="100" value={visualSettings[slider.key] ?? slider.fallback ?? 50} onChange={(e) => saveVisualSettings({ ...visualSettings, [slider.key]: parseInt(e.target.value, 10) })} className={`w-full h-1.5 bg-neutral-700 rounded-lg appearance-none cursor-pointer ${c.accent}`} aria-label={slider.label} />
    </div>
  );

  if (compact) {
    return (
      <div className="space-y-2 border-t border-[var(--border-medium)] pt-2">
        <h4 className={`${c.text} text-[10px] font-medium uppercase tracking-wider`}>{title}</h4>
        {directionControl && (
          <div className="flex gap-1 mb-1.5">
            <button onClick={() => saveVisualSettings({ ...visualSettings, [directionControl.key]: 'top' })} className={`flex-1 py-1 rounded text-[10px] ${visualSettings[directionControl.key] === 'top' ? `${c.activeBg} ${c.text}` : 'bg-neutral-700 text-gray-500'}`} aria-label={`Set ${directionControl.key} direction to top`} aria-pressed={visualSettings[directionControl.key] === 'top'}>↑ Top</button>
            <button onClick={() => saveVisualSettings({ ...visualSettings, [directionControl.key]: 'bottom' })} className={`flex-1 py-1 rounded text-[10px] ${visualSettings[directionControl.key] === 'bottom' ? `${c.activeBg} ${c.text}` : 'bg-neutral-700 text-gray-500'}`} aria-label={`Set ${directionControl.key} direction to bottom`} aria-pressed={visualSettings[directionControl.key] === 'bottom'}>↓ Bottom</button>
          </div>
        )}
        <div className="space-y-1.5">{sliders.map(renderSlider)}</div>
      </div>
    );
  }

  return (
    <div className={`${c.bg} ${c.border} border rounded p-3`}>
      <h3 className={`${c.text} text-sm font-medium mb-3`}>{title}</h3>
      {directionControl && (
        <div className="space-y-3 mb-3">
          <div>
            <div className="flex justify-between text-[10px] mb-1">
              <span className="text-gray-300">Fade Direction</span>
              <span className={c.text}>{visualSettings[directionControl.key] === 'top' ? '↑ Top' : '↓ Bottom'}</span>
            </div>
            <div className="flex gap-2">
              <button onClick={() => saveVisualSettings({ ...visualSettings, [directionControl.key]: 'top' })} className={`flex-1 py-1.5 rounded text-[10px] transition-all ${visualSettings[directionControl.key] === 'top' ? `${c.activeBg} ${c.text} border ${c.activeBorder}` : 'bg-neutral-700 text-gray-400'}`}>↑ Fade to Top</button>
              <button onClick={() => saveVisualSettings({ ...visualSettings, [directionControl.key]: 'bottom' })} className={`flex-1 py-1.5 rounded text-[10px] transition-all ${visualSettings[directionControl.key] === 'bottom' ? `${c.activeBg} ${c.text} border ${c.activeBorder}` : 'bg-neutral-700 text-gray-400'}`}>↓ Fade to Bottom</button>
            </div>
          </div>
        </div>
      )}
      <div className="space-y-3">{sliders.map(renderSlider)}</div>
    </div>
  );
});
VisualSliderGroup.displayName = 'VisualSliderGroup';

// Visual slider configuration data — shared between admin modal and mini window
const VISUAL_SLIDER_CONFIGS = [
  {
    title: 'Banner Card Settings', compactTitle: 'Featured Banners', color: 'cyan',
    sliders: [
      { label: 'Fade Position', shortLabel: 'Fade Pos', key: 'fadePosition' },
      { label: 'Fade Intensity', shortLabel: 'Intensity', key: 'fadeIntensity' },
      { label: 'Picture Opacity', shortLabel: 'Opacity', key: 'pictureOpacity' },
    ],
  },
  {
    title: 'Standard Banner Settings', compactTitle: 'Standard Banners', color: 'emerald',
    sliders: [
      { label: 'Fade Position', shortLabel: 'Fade Pos', key: 'standardFadePosition', fallback: 50 },
      { label: 'Fade Intensity', shortLabel: 'Intensity', key: 'standardFadeIntensity', fallback: 100 },
      { label: 'Picture Opacity', shortLabel: 'Opacity', key: 'standardOpacity', fallback: 100 },
    ],
  },
  {
    title: 'Event Card Settings', compactTitle: 'Event Cards', color: 'pink',
    sliders: [
      { label: 'Fade Position', shortLabel: 'Fade Pos', key: 'shadowFadePosition' },
      { label: 'Fade Intensity', shortLabel: 'Intensity', key: 'shadowFadeIntensity' },
      { label: 'Picture Opacity', shortLabel: 'Opacity', key: 'shadowOpacity' },
    ],
  },
  {
    title: 'Collection Card Settings', compactTitle: 'Collection Cards', color: 'purple',
    directionControl: { key: 'collectionFadeDirection' },
    subtitle: 'Vertical fade (top ↔ bottom)',
    sliders: [
      { label: 'Fade Position', shortLabel: 'Fade Pos', key: 'collectionFadePosition' },
      { label: 'Fade Intensity', shortLabel: 'Intensity', key: 'collectionFadeIntensity' },
      { label: 'Picture Opacity', shortLabel: 'Opacity', key: 'collectionOpacity' },
    ],
  },
];

// Standard banner overlay — cool silver twinkling stars (distinct from Sigrika's warm golden sparkle)
const StandardBannerOverlay = memo(() => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const rect = canvas.parentElement.getBoundingClientRect();
    const w = rect.width || 400;
    const h = rect.height || 190;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);

    // Twinkling 6-point stars (Sigrika uses 4-point golden — these are 6-point silver)
    const stars = Array.from({ length: 22 }, () => ({
      x: Math.random() * w, y: h * 0.08 + Math.random() * h * 0.88,
      size: 1.8 + Math.random() * 3,
      phase: Math.random() * Math.PI * 2,
      speed: 0.6 + Math.random() * 1.2,
      // Staggered blink: each star fades in and out independently
      blinkOffset: Math.random() * 6,
    }));

    // Small drifting dust motes
    const dust = Array.from({ length: 12 }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      vy: -0.1 - Math.random() * 0.15,
      vx: (Math.random() - 0.5) * 0.12,
      size: 0.8 + Math.random() * 1.2,
      phase: Math.random() * Math.PI * 2,
      alpha: 0.4 + Math.random() * 0.3,
    }));

    let animId, t = 0;
    const frame = () => {
      ctx.clearRect(0, 0, w, h);
      t += 0.016;

      // 6-point twinkling stars
      for (const s of stars) {
        // Blink pattern: fully bright for a moment, then fade out
        const cycle = (t * s.speed + s.blinkOffset) % 4;
        let a;
        if (cycle < 0.8) a = Math.sin(cycle / 0.8 * Math.PI); // fade in and out
        else a = 0; // dark
        a *= 0.9;
        if (a < 0.05) continue;

        const sz = s.size * (0.7 + a * 0.3);
        ctx.save();
        ctx.globalAlpha = a;
        ctx.fillStyle = 'rgba(220,235,255,1)';
        ctx.shadowColor = 'rgba(180,210,255,0.8)';
        ctx.shadowBlur = 10;

        // 6-point star shape
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const angle = (i / 6) * Math.PI * 2 - Math.PI / 2;
          const innerAngle = ((i + 0.5) / 6) * Math.PI * 2 - Math.PI / 2;
          ctx.lineTo(s.x + Math.cos(angle) * sz * 1.8, s.y + Math.sin(angle) * sz * 1.8);
          ctx.lineTo(s.x + Math.cos(innerAngle) * sz * 0.4, s.y + Math.sin(innerAngle) * sz * 0.4);
        }
        ctx.closePath();
        ctx.fill();

        // Bright center dot
        ctx.shadowBlur = 0;
        ctx.globalAlpha = a * 0.8;
        ctx.beginPath();
        ctx.arc(s.x, s.y, sz * 0.35, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Drifting dust
      for (const d of dust) {
        d.x += d.vx + Math.sin(t * 0.3 + d.phase) * 0.08;
        d.y += d.vy;
        if (d.y < -5) { d.y = h + 5; d.x = Math.random() * w; }

        const pulse = d.alpha * (0.5 + Math.sin(t * 0.8 + d.phase) * 0.5);
        if (pulse < 0.06) continue;

        ctx.save();
        ctx.globalAlpha = pulse;
        ctx.fillStyle = 'rgba(210,225,250,1)';
        ctx.shadowColor = 'rgba(180,200,240,0.5)';
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      animId = requestAnimationFrame(frame);
    };
    animId = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 2, width: '100%', height: '100%' }}
      aria-hidden="true"
    />
  );
});
StandardBannerOverlay.displayName = 'StandardBannerOverlay';

// Standard banner card — eliminates ~110 lines of copy-paste between standard char/weap banners
const StandardBannerSection = memo(({ bannerImage, altText, title, subtitle, items, itemKey, profileData, visualSettings }) => {
  const stdMask = generateMaskGradient(visualSettings.standardFadePosition ?? 50, visualSettings.standardFadeIntensity ?? 100);
  const stdOpacity = (visualSettings.standardOpacity ?? 100) / 100;
  const hasStats = profileData?.history?.length > 0;
  const isFull = visualSettings?.animationsEnabled === 'full';
  return (
    <div className="relative overflow-hidden rounded-xl border border-cyan-500/30" style={{ minHeight: '190px', isolation: 'isolate', zIndex: 5, boxShadow: '0 0 40px rgba(0,200,255,0.06), 0 4px 16px rgba(0,0,0,0.3)' }}>
      {bannerImage && (
        <img
          src={bannerImage}
          alt={altText}
          className="absolute inset-0 w-full h-full object-cover object-top"
          style={{ zIndex: 1, opacity: stdOpacity, maskImage: stdMask, WebkitMaskImage: stdMask }}
          loading="eager"
          onError={hideOnError}
        />
      )}
      {bannerImage && isFull && <StandardBannerOverlay w={0} h={0} />}
      <div className="absolute inset-0 z-10 p-3 flex flex-col justify-between" style={TEXT_SHADOW_STYLE}>
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[10px] px-2 py-0.5 rounded text-cyan-400 border border-cyan-500/40" style={{ backgroundColor: 'rgba(0,200,255,0.1)' }}>{subtitle}</span>
          </div>
          <h4 className="font-bold text-base text-white leading-tight">{title}</h4>
        </div>
        <div className={hasStats ? 'mb-14' : ''}>
          <div className="text-gray-300 text-[10px] mb-0.5 uppercase tracking-wider">Available 5★</div>
          <div className="flex gap-1 overflow-x-auto scrollbar-hide pb-0.5">
            {(items || []).map(item => <span key={typeof item === 'string' ? item : item[itemKey]} className="text-[10px] text-cyan-300 bg-cyan-500/30 px-1.5 py-0.5 rounded whitespace-nowrap flex-shrink-0 backdrop-blur-sm">{typeof item === 'string' ? item : item[itemKey]}</span>)}
          </div>
        </div>
      </div>
      {hasStats && (
        <div className="absolute bottom-0 left-0 right-0 z-10 border-t border-white/15" style={BANNER_CARD_OVERLAY_STYLE}>
          <div className="flex items-center gap-3">
            <div className="flex-1 flex items-center gap-3">
              <div className="text-center">
                <div className={`font-bold text-sm ${profileData.pity5 >= HARD_PITY ? 'text-red-500 font-bold animate-pulse' : profileData.pity5 >= 75 ? 'text-red-400' : profileData.pity5 >= SOFT_PITY_START ? 'text-amber-400' : 'text-cyan-400'}`}>{profileData.pity5}<span className="text-gray-400 text-[10px]">/{HARD_PITY}</span></div>
                <div className={`text-[10px] mt-0.5 ${profileData.pity5 >= HARD_PITY ? 'text-red-500 font-bold' : profileData.pity5 >= 75 ? 'text-red-400 font-medium' : profileData.pity5 >= SOFT_PITY_START ? 'text-amber-400 font-medium' : 'text-gray-400'}`}>{profileData.pity5 >= HARD_PITY ? '★ GUARANTEED!' : profileData.pity5 >= 75 ? '⚠ High Pity!' : profileData.pity5 >= SOFT_PITY_START ? 'Soft Pity!' : '5★ Pity'}</div>
              </div>
              <div className="text-center">
                <div className="text-purple-400 font-bold text-sm">{profileData.pity4}<span className="text-gray-400 text-[10px]">/10</span></div>
                <div className="text-gray-400 text-[10px] mt-0.5">4★ Pity</div>
              </div>
              <div className="text-center">
                <div className="text-white font-bold text-sm">{profileData.history.length}</div>
                <div className="text-gray-400 text-[10px] mt-0.5">Convenes</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});
StandardBannerSection.displayName = 'StandardBannerSection';

// Import guide data — eliminates ~90 lines of repetitive numbered-step JSX
const IMPORT_GUIDE_DATA = {
  pc: {
    title: 'PC',
    steps: [
      <>Open Wuthering Waves, go to <span className="text-gray-100 font-medium">Convene</span> → <span className="text-gray-100 font-medium">History</span> → <span className="text-gray-100 font-medium">View Details</span></>,
      <>Open <span className="text-gray-100 font-medium">PowerShell</span> and paste this command:</>,
      <><code className="block bg-black/40 rounded px-2 py-1.5 text-[9px] font-mono text-cyan-400 break-all select-all">iwr -useb https://raw.githubusercontent.com/WW-Andene/Whispering-Wishes/main/app/public/import.ps1 | iex</code></>,
      <>The URL is <span className="text-gray-100 font-medium">automatically copied</span> to your clipboard</>,
      <>Paste it in the <span className="text-gray-100 font-medium">URL field</span> below and click <span className="text-gray-100 font-medium">Import</span></>,
    ],
    footer: 'This script only reads game logs. It does not modify anything.',
  },
  android: {
    title: 'Android (11+)',
    steps: [
      <>Open Wuthering Waves, go to <span className="text-gray-100 font-medium">Convene</span> → <span className="text-gray-100 font-medium">History</span> → <span className="text-gray-100 font-medium">View Details</span></>,
      <>Copy the <span className="text-gray-100 font-medium">full URL</span> from the in-game browser address bar</>,
      <>Paste it in the <span className="text-gray-100 font-medium">URL field</span> below and click <span className="text-gray-100 font-medium">Import</span></>,
    ],
    footer: 'The URL expires after a few minutes. Use it quickly.',
  },
  ps5: {
    title: 'PS5',
    steps: [
      <>Open Wuthering Waves, go to <span className="text-gray-100 font-medium">Convene</span> → <span className="text-gray-100 font-medium">History</span> → <span className="text-gray-100 font-medium">View Details</span></>,
      <>Press <span className="text-gray-100 font-medium">Options</span> → <span className="text-gray-100 font-medium">Page Information</span> to see the URL</>,
      <>Use the <span className="text-gray-100 font-medium">camera scan</span> below to capture the URL from your screen</>,
      <>Or enter the <span className="text-gray-100 font-medium">IDs manually</span> from the URL</>,
    ],
    footer: 'The URL expires after some time. Use it as soon as possible.',
  },
};

const ImportGuide = memo(({ platform }) => {
  const guide = IMPORT_GUIDE_DATA[platform];
  if (!guide) return null;
  return (
    <div className="p-3 bg-white/5 border border-[var(--border-medium)] rounded-lg text-[10px] text-gray-200 space-y-2">
      <p className="text-gray-100 font-medium text-xs">{guide.title}</p>
      {guide.steps.map((step, i) => (
        <div key={i} className="flex items-start gap-2">
          <span className="flex-shrink-0 w-5 h-5 rounded bg-white/10 text-gray-200 flex items-center justify-center text-[10px] font-bold">{i + 1}</span>
          <p>{step}</p>
        </div>
      ))}
      {guide.footer && <p className="text-gray-400 text-[10px] pt-1 border-t border-[var(--border-medium)]">{guide.footer}</p>}
    </div>
  );
});
ImportGuide.displayName = 'ImportGuide';

// ═══════════════════════════════════════════════════════════════════════════════
// END EXTRACTED COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════════

// Load custom banners from localStorage
const loadCustomBanners = () => {
  if (!storageAvailable) return null;
  try {
    const saved = localStorage.getItem(ADMIN_BANNER_KEY);
    if (!saved) return null;
    const parsed = sanitizeStateObj(JSON.parse(saved));
    // P10-FIX: Validate loaded banner structure (Step 6 audit)
    if (typeof parsed !== 'object' || parsed === null || !Array.isArray(parsed.characters) || !Array.isArray(parsed.weapons)) {
      return null;
    }
    return parsed;
  } catch (e) {
    return null;
  }
};

// Get active banners (custom or default)
const getActiveBanners = () => {
  const custom = loadCustomBanners();
  return custom || CURRENT_BANNERS;
};

export { BannerCard, StandardBannerSection, EventCard, ProbabilityBar, ADMIN_BANNER_KEY, ADMIN_HASH, getActiveBanners };
