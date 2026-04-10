// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — shared/components/bannerThemes.js
// Character particle theme data for banner card animations.
// ═══════════════════════════════════════════════════════════════════════════════

const CHARACTER_THEME_MAP = {
  Sigrika: 'sparkle',    // warm, magical, golden sparkles at feet, starry sky
  Qiuyuan: 'qiuyuan',    // dark forest, moon, crows, brume, swirling leaves
  Lynae: 'prismatic',     // rainbow-shifting light rays, prismatic sparkles
  Zani: 'radiance',       // golden-white burning light, clock-like geometry
  Phoebe: 'luminous',     // soft holy light rays, ethereal white-gold halos
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

  // 🎨 PRISMATIC (Lynae): liquid paint with depth → converge → explode
  prismatic: (w, h) => {
    const PAINT = [
      [0,210,200],    // teal
      [220,40,170],   // magenta
      [100,245,50],   // acid green
      [150,30,245],   // violet
      [245,60,140],   // pink
      [0,170,250],    // blue
    ];
    const rgb = (c,a) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;
    const lerp = (a,b,t) => [a[0]+(b[0]-a[0])*t|0, a[1]+(b[1]-a[1])*t|0, a[2]+(b[2]-a[2])*t|0];
    const darker = (c,f) => [c[0]*f|0, c[1]*f|0, c[2]*f|0];
    const lighter = (c,f) => [Math.min(255,c[0]+f)|0, Math.min(255,c[1]+f)|0, Math.min(255,c[2]+f)|0];
    const bz = (a,b,c,d,p) => {const u=1-p; return u*u*u*a+3*u*u*p*b+3*u*p*p*c+p*p*p*d;};

    const CYCLE = 9;
    const ccx = w * 0.45, ccy = h * 0.5;

    // Catmull-Rom spline through points
    const catmull = (ctx, pts) => {
      if (pts.length < 2) return;
      ctx.moveTo(pts[0][0], pts[0][1]);
      for (let i = 0; i < pts.length - 1; i++) {
        const p0 = pts[Math.max(0,i-1)], p1 = pts[i], p2 = pts[i+1], p3 = pts[Math.min(pts.length-1,i+2)];
        ctx.bezierCurveTo(
          p1[0]+(p2[0]-p0[0])/6, p1[1]+(p2[1]-p0[1])/6,
          p2[0]-(p3[0]-p1[0])/6, p2[1]-(p3[1]-p1[1])/6,
          p2[0], p2[1]
        );
      }
    };

    // Draw a filled fluid shape with per-point offset for twisting
    const drawFluidShape = (ctx, spine, widthScale, color, alpha, offsetFn) => {
      if (spine.length < 3) return;
      const top = spine.map((s, i) => {
        const off = typeof offsetFn === 'function' ? offsetFn(i, spine.length) : (offsetFn || 0);
        return [s.x + s.nx * (s.hw * widthScale + off), s.y + s.ny * (s.hw * widthScale + off)];
      });
      const bot = spine.map((s, i) => {
        const off = typeof offsetFn === 'function' ? offsetFn(i, spine.length) : (offsetFn || 0);
        return [s.x + s.nx * (off - s.hw * widthScale), s.y + s.ny * (off - s.hw * widthScale)];
      });
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = rgb(color, 1);
      ctx.beginPath();
      catmull(ctx, top);
      // Smooth tip connection
      const last = spine[spine.length-1];
      ctx.quadraticCurveTo(last.x, last.y, bot[bot.length-1][0], bot[bot.length-1][1]);
      catmull(ctx, bot.slice().reverse());
      const first = spine[0];
      ctx.quadraticCurveTo(first.x, first.y, top[0][0], top[0][1]);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    };

    const initSplash = (idx) => {
      const ci = idx % PAINT.length;
      const ci2 = (ci + 2) % PAINT.length;
      const ci3 = (ci + 4) % PAINT.length;
      const colA = PAINT[ci];                       // strand 1
      const colB = PAINT[ci2];                      // strand 2
      const colC = lerp(PAINT[ci3], [255,255,255], 0.25); // strand 3 (lighter)
      const colShadow = darker(PAINT[ci], 0.35);   // drop shadow
      const colEdge = lighter(PAINT[ci2], 60);      // bright edge highlight

      const sx = -w*0.15 + Math.random()*w*1.3;
      const sy = -h*0.1 + Math.random()*h*1.2;
      const ang = Math.random() * Math.PI * 2;
      const len = 120 + Math.random() * 200;
      const ex = sx + Math.cos(ang) * len;
      const ey = sy + Math.sin(ang) * len;
      const perp = ang + Math.PI * 0.5;
      const curv = (Math.random() - 0.5) * 180;
      const baseW = 22 + Math.random() * 38;

      // Width profile: aggressive variation — big swells + thin necks + random spikes
      const N = 24;
      const widths = Array.from({length: N+1}, (_, i) => {
        const t = i / N;
        const e = t < 0.1 ? t/0.1 : t > 0.9 ? (1-t)/0.1 : 1;
        const taper = e * e * (3 - 2*e);
        // Multi-frequency variation: low freq swell + high freq jaggedness
        const lo = 0.5 + 0.6 * Math.sin(t * Math.PI * 2.5 + idx * 2.1);
        const hi = 0.85 + 0.3 * Math.sin(t * Math.PI * 7 + idx * 4.3);
        const spike = Math.random() > 0.8 ? 1.3 + Math.random() * 0.5 : 1; // random spikes
        const wNoise = 0.7 + Math.random() * 0.6;
        return taper * lo * hi * spike * wNoise;
      });

      // Per-point noise for organic edges — very strong + directional
      const noise = Array.from({length: N+1}, () => ({
        ox: (Math.random()-0.5) * baseW * 1.0,
        oy: (Math.random()-0.5) * baseW * 0.8,
        wMul: 0.4 + Math.random() * 1.2, // extreme per-point width jitter
      }));

      // Splatter dots — more of them, spread wider
      const splatter = Array.from({length: 14+Math.floor(Math.random()*14)}, () => ({
        t: Math.random(), side: Math.random()>0.5?1:-1,
        dist: 0.6+Math.random()*0.5, r: 0.5+Math.random()*2.5,
      }));

      const drops = Array.from({length: 5+Math.floor(Math.random()*6)}, () => ({
        t: Math.random(), ox: (Math.random()-0.5)*45, oy: (Math.random()-0.5)*35,
        r: 1.5+Math.random()*4, ci: Math.random()>0.5?ci:ci2,
      }));

      return {
        sx, sy, ex, ey,
        cp1x: sx+(ex-sx)*0.3+Math.cos(perp)*curv,
        cp1y: sy+(ey-sy)*0.3+Math.sin(perp)*curv,
        cp2x: sx+(ex-sx)*0.7+Math.cos(perp)*curv*0.4,
        cp2y: sy+(ey-sy)*0.7+Math.sin(perp)*curv*0.4,
        colA, colB, colC, colShadow, colEdge, baseW, widths, noise, splatter, drops, N,
        twistFreq: 1.5 + Math.random() * 2, // how many twists along the path
        delay: idx * 0.6 + Math.random() * 0.3,
      };
    };

    const initAll = () => Array.from({length: 3+Math.floor(Math.random()*2)}, (_,i) => initSplash(i));
    const initDebris = () => Array.from({length: 40}, () => ({
      angle: Math.random()*Math.PI*2, speed: 25+Math.random()*110,
      r: 1.5+Math.random()*5, ci: Math.floor(Math.random()*PAINT.length),
      drag: 0.93+Math.random()*0.04,
    }));

    let splashes = initAll(), debris = initDebris(), cycleStart = -CYCLE;

    const ambDots = Array.from({length: 15}, () => ({
      x: Math.random()*w, y: Math.random()*h, r: 1+Math.random()*2.5,
      vx: (Math.random()-0.5)*0.25, vy: (Math.random()-0.5)*0.2,
      ci: Math.floor(Math.random()*PAINT.length), phase: Math.random()*Math.PI*2,
    }));

    // Build spine — suck acts like water draining: spiral pull, stretching, tip leads
    const buildSpine = (s, drawP, suckP) => {
      const spine = [];
      for (let i = 0; i <= s.N; i++) {
        const frac = i / s.N;
        const t = frac * drawP;
        let x = bz(s.sx, s.cp1x, s.cp2x, s.ex, t);
        let y = bz(s.sy, s.cp1y, s.cp2y, s.ey, t);

        // Add noise
        x += s.noise[i].ox * (1 - suckP);
        y += s.noise[i].oy * (1 - suckP);

        if (suckP > 0) {
          // Distance to center
          const dx = x - ccx, dy = y - ccy;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const angle = Math.atan2(dy, dx);

          // Tip gets sucked first, base trails behind
          const pull = Math.min(1, suckP * (0.4 + frac * 0.6));

          // Spiral toward center
          const spiral = pull * Math.PI * 1.5;
          const newAngle = angle + spiral;

          // Fully reach center at pull=1
          const newDist = dist * (1 - pull);

          x = ccx + Math.cos(newAngle) * newDist;
          y = ccy + Math.sin(newAngle) * newDist;
        }

        const tp = Math.min(1, t + 0.03);
        const tx = bz(s.sx,s.cp1x,s.cp2x,s.ex,tp) - bz(s.sx,s.cp1x,s.cp2x,s.ex,t);
        const ty = bz(s.sy,s.cp1y,s.cp2y,s.ey,tp) - bz(s.sy,s.cp1y,s.cp2y,s.ey,t);
        const tl = Math.sqrt(tx*tx+ty*ty) || 1;
        // Width collapses to zero as fully sucked
        const hw = s.baseW * s.widths[i] * s.noise[i].wMul * (1 - suckP);
        spine.push({ x, y, nx: -ty/tl, ny: tx/tl, hw: Math.max(0.5, hw) });
      }
      return spine;
    };

    return (ctx, t) => {
      let ct = t - cycleStart;
      if (ct > CYCLE) { cycleStart = t; ct = 0; splashes = initAll(); debris = initDebris(); }

      const APPEAR_END = 3.0, SUCK_END = 5.0, EXPLODE_T = 5.8;

      // Ambient dots
      for (const d of ambDots) {
        d.x += d.vx; d.y += d.vy;
        if (d.x<-5) d.x=w+5; if (d.x>w+5) d.x=-5;
        if (d.y<-5) d.y=h+5; if (d.y>h+5) d.y=-5;
        ctx.save(); ctx.globalAlpha = 0.3+0.2*Math.sin(t*1.5+d.phase);
        ctx.fillStyle = rgb(PAINT[d.ci],1);
        ctx.beginPath(); ctx.arc(d.x,d.y,d.r,0,Math.PI*2); ctx.fill();
        ctx.restore();
      }

      // ── Liquid paint splashes ──
      if (ct < EXPLODE_T + 0.3) {
        for (const s of splashes) {
          const age = ct - s.delay;
          if (age < 0) continue;
          const drawP = Math.min(1, age / 0.15);
          let suckP = 0;
          if (ct > APPEAR_END) {
            suckP = Math.min(1, (ct - APPEAR_END) / (SUCK_END - APPEAR_END));
            suckP = suckP * suckP; // quadratic ease-in (was cubic — too slow)
          }
          // Stay visible through entire suck, vanish at explosion
          const alpha = ct > EXPLODE_T ? Math.max(0, 1-(ct-EXPLODE_T)/0.3) : 0.92;
          if (alpha < 0.01) continue;

          const spine = buildSpine(s, drawP, suckP);
          if (spine.length < 3) continue;

          // Drop shadow behind everything
          ctx.shadowColor = 'rgba(0,0,0,0.4)';
          ctx.shadowBlur = 14;
          ctx.shadowOffsetX = 3; ctx.shadowOffsetY = 4;
          drawFluidShape(ctx, spine, 1.05, s.colShadow, alpha * 0.4, 0);
          ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0;
          ctx.shadowOffsetX = 0; ctx.shadowOffsetY = 0;

          // 3 twisting color strands — each sine-offset with 120° phase shift
          const gap = spine[0].hw * 0.75;
          const twist = (phase) => (i, len) => {
            const t = i / (len - 1);
            return Math.sin(t * Math.PI * 2 * s.twistFreq + phase) * gap;
          };
          // Draw back-to-front based on twist position at midpoint for correct overlap
          const strands = [
            { col: s.colA, phase: 0 },
            { col: s.colB, phase: Math.PI * 2 / 3 },
            { col: s.colC, phase: Math.PI * 4 / 3 },
          ];
          // Sort by z-order at midpoint (sine value at t=0.5)
          const mid = Math.floor(spine.length / 2);
          strands.sort((a, b) => {
            const za = Math.sin(0.5 * Math.PI * 2 * s.twistFreq + a.phase);
            const zb = Math.sin(0.5 * Math.PI * 2 * s.twistFreq + b.phase);
            return za - zb; // draw furthest-back first
          });
          for (const st of strands) {
            drawFluidShape(ctx, spine, 0.35, st.col, alpha * 0.92, twist(st.phase));
          }

          // Bright edge highlight follows the front strand
          const frontPhase = strands[2].phase;
          drawFluidShape(ctx, spine, 0.1, s.colEdge, alpha * 0.45, twist(frontPhase));

          // Edge splatter
          ctx.save();
          for (const sp of s.splatter) {
            if (sp.t > drawP) continue;
            const si = Math.floor(sp.t * (spine.length-1));
            const pt = spine[Math.min(si, spine.length-1)];
            const dx = pt.x + pt.nx * pt.hw * sp.dist * sp.side * (1-suckP*0.5);
            const dy = pt.y + pt.ny * pt.hw * sp.dist * sp.side * (1-suckP*0.5);
            ctx.globalAlpha = alpha * 0.7;
            ctx.fillStyle = rgb(s.colB, 1);
            ctx.beginPath(); ctx.arc(dx, dy, sp.r*(1-suckP*0.4), 0, Math.PI*2); ctx.fill();
          }
          ctx.restore();

          // Flying droplets
          for (const dr of s.drops) {
            if (dr.t > drawP) continue;
            const si2 = Math.floor(dr.t * (spine.length-1));
            const pt = spine[Math.min(si2, spine.length-1)];
            let dx = pt.x + dr.ox*(1-suckP*0.7);
            let dy = pt.y + dr.oy*(1-suckP*0.7);
            ctx.save(); ctx.globalAlpha = alpha*0.85;
            ctx.fillStyle = rgb(PAINT[dr.ci],1);
            ctx.beginPath(); ctx.arc(dx,dy,dr.r*(1-suckP*0.4),0,Math.PI*2); ctx.fill();
            if (dr.r > 2.5) {
              ctx.fillStyle='rgba(255,255,255,0.3)'; ctx.beginPath();
              ctx.arc(dx-dr.r*0.2,dy-dr.r*0.2,dr.r*0.25,0,Math.PI*2); ctx.fill();
            }
            ctx.restore();
          }
        }
      }

      // ── Mix swirl ──
      if (ct > APPEAR_END+1.5 && ct < EXPLODE_T+0.4) {
        const mP = Math.min(1,(ct-APPEAR_END-1.5)/1.5);
        const mA = ct<EXPLODE_T ? mP*0.5 : Math.max(0,0.5-(ct-EXPLODE_T)*2.5);
        if (mA > 0.01) {
          const sw=ct*6, mr=8+mP*18;
          for (let i=0;i<5;i++){
            const a=sw+i*Math.PI*0.4;
            const px=ccx+Math.cos(a)*mr*(0.3+i*0.14), py=ccy+Math.sin(a)*mr*(0.3+i*0.14);
            ctx.save(); ctx.globalAlpha=mA;
            const g=ctx.createRadialGradient(px,py,0,px,py,mr*0.35);
            g.addColorStop(0,rgb(PAINT[i%6],0.8)); g.addColorStop(1,rgb(PAINT[i%6],0));
            ctx.fillStyle=g; ctx.beginPath(); ctx.arc(px,py,mr*0.35,0,Math.PI*2); ctx.fill();
            ctx.restore();
          }
        }
      }

      // ── Explosion ──
      if (ct > EXPLODE_T) {
        const ea=ct-EXPLODE_T;
        if (ea<0.12){
          ctx.save(); ctx.globalAlpha=0.4*(1-ea/0.12);
          const fg=ctx.createRadialGradient(ccx,ccy,0,ccx,ccy,Math.max(w,h)*0.35);
          fg.addColorStop(0,'rgba(255,255,255,0.9)'); fg.addColorStop(1,'rgba(255,255,255,0)');
          ctx.fillStyle=fg; ctx.beginPath(); ctx.arc(ccx,ccy,Math.max(w,h)*0.35,0,Math.PI*2); ctx.fill();
          ctx.restore();
        }
        const da=ea<0.15?ea/0.15:Math.max(0,1-(ea-0.15)/3);
        if (da>0.01){
          for (const d of debris){
            const dist=d.speed*ea*Math.pow(d.drag,ea*30);
            const dx=ccx+Math.cos(d.angle)*dist, dy=ccy+Math.sin(d.angle)*dist+ea*ea*10;
            ctx.save(); ctx.globalAlpha=da*0.95;
            ctx.fillStyle=rgb(PAINT[d.ci],1); ctx.shadowColor=rgb(PAINT[d.ci],0.4); ctx.shadowBlur=3;
            ctx.beginPath(); ctx.arc(dx,dy,d.r,0,Math.PI*2); ctx.fill();
            ctx.restore();
          }
        }
      }
    };
  },


  // ⏰ RADIANCE (Zani): glitching timestamps → massive ornate clock with gears → explosion
  radiance: (w, h) => {
    if (!document.getElementById('ww-font-temporal')) {
      const s = document.createElement('style'); s.id = 'ww-font-temporal';
      s.textContent = `@font-face{font-family:'Temporal Shift';src:url('https://db.onlinewebfonts.com/t/14490ee451fc403e46ba565d82c4ab53.woff2') format('woff2');font-display:swap}`;
      document.head.appendChild(s);
    }
    const cx = w * 0.5, cy = h * 0.48;
    const clockR = Math.min(w, h) * 0.82; // 50% bigger — extends beyond card edges
    const CYCLE = 15;
    // More gears, interlocking, varied sizes
    // Gears with mechanically correct rotation:
    // When two gears mesh, speed ratio = teeth_driver / teeth_driven, direction flips.
    // Gear 0 is the driver. Each subsequent gear meshes with a neighbor.
    const BASE_SPEED = 0.1; // gear 0 rotation speed
    const gearDefs = [
      { x: -0.35, y: -0.10, r: 0.48, teeth: 24 },     // [0] large left
      { x: 0.30, y: 0.25, r: 0.38, teeth: 18 },        // [1] large right-bottom
      { x: 0.20, y: -0.35, r: 0.28, teeth: 14 },       // [2] medium top-right
      { x: -0.25, y: 0.42, r: 0.22, teeth: 12 },       // [3] medium bottom-left
      { x: 0.48, y: -0.15, r: 0.16, teeth: 10 },       // [4] small far right
      { x: -0.50, y: -0.35, r: 0.13, teeth: 8 },       // [5] small far top-left
      { x: 0.05, y: 0.50, r: 0.14, teeth: 8 },         // [6] small bottom
    ];
    // meshes: [gearIndex] = index of gear it meshes with
    const meshes = [-1, 0, 0, 0, 2, 0, 3];
    // Compute speeds: driver gear speed * (driver teeth / this teeth) * -1 per link
    const gearSpeeds = gearDefs.map((_, i) => {
      if (i === 0) return BASE_SPEED;
      let speed = BASE_SPEED;
      let cur = i;
      let flips = 0;
      while (meshes[cur] >= 0) {
        const parent = meshes[cur];
        speed *= gearDefs[parent].teeth / gearDefs[cur].teeth;
        flips++;
        cur = parent;
      }
      return speed * (flips % 2 === 1 ? -1 : 1);
    });
    const gears = gearDefs.map((g, i) => ({ ...g, speed: gearSpeeds[i] }));
    const nebulae = Array.from({ length: 20 }, () => ({
      angle: 0, dist: 0, speed: 0.3 + Math.random() * 1.5, size: 25 + Math.random() * 55,
      maxAlpha: 0.05 + Math.random() * 0.07, drift: (Math.random() - 0.5) * 0.4,
      color: ['255,210,90','255,170,60','255,130,40','255,240,160','220,180,80'][Math.floor(Math.random()*5)],
      active: false,
    }));
    const wisps = Array.from({ length: 8 }, () => ({
      angle: 0, dist: 0, speed: 0.4 + Math.random() * 1.2, len: 25 + Math.random() * 45,
      width: 10 + Math.random() * 18, maxAlpha: 0.03 + Math.random() * 0.04,
      rot: 0, rotV: (Math.random() - 0.5) * 0.015, active: false,
    }));
    // Explosion debris — only mini gears, lots of them, fly across full screen
    const miniGears = Array.from({ length: 35 }, () => ({
      x: 0, y: 0, vx: 0, vy: 0, rot: 0, rotV: (Math.random() - 0.5) * 0.25,
      size: 5 + Math.random() * 14, teeth: 6 + Math.floor(Math.random() * 6), active: false,
    }));
    let lastBoom = -1;
    // Timestamps — varied sizes, full spread, sequential
    const COUNT = 5;
    const SLOT_DUR = 8.0 / COUNT; // 1.6s each
    const sizes = [28, 16, 34, 20, 24]; // varied — some big, some small
    const timestamps = Array.from({ length: COUNT }, (_, i) => ({
      x: (i % 2 === 0 ? 0.1 + Math.random() * 0.35 : 0.55 + Math.random() * 0.35) * w, // alternate sides
      y: 0.08 * h + (i / COUNT) * h * 0.75 + Math.random() * h * 0.1,
      min: Math.floor(Math.random() * 60),
      glitchX: 0, glitchY: 0, timer: Math.random() * 0.1,
      size: sizes[i] || 22,
      start: i * SLOT_DUR,
    }));
    let lastCycleId = -1;
    let handFrozenAt = -1; // cT when hands locked at 6:30
    return (ctx, t) => {
      const cycle = t % CYCLE;
      const cycleId = Math.floor(t / CYCLE);
      // Re-randomize timestamp positions each cycle
      if (cycleId !== lastCycleId) {
        lastCycleId = cycleId;
        handFrozenAt = -1; // reset for new cycle
        for (let i = 0; i < timestamps.length; i++) {
          const ts = timestamps[i];
          ts.x = (i % 2 === 0 ? 0.1 + Math.random() * 0.35 : 0.55 + Math.random() * 0.35) * w;
          ts.y = 0.08 * h + (i / COUNT) * h * 0.75 + Math.random() * h * 0.1;
          ts.min = Math.floor(Math.random() * 60);
          ts.glitchX = 0; ts.glitchY = 0;
        }
      }
      // ── PHASE 1→3: TIMESTAMPS (appear sequentially, freeze, erased by explosion) ──
      if (cycle < 10.0) {
        for (const ts of timestamps) {
          const localT = cycle - ts.start;
          if (localT < 0) continue; // not spawned yet
          // Fade in during slot, then STAY (no fade out)
          const fadeIn = 0.15 * SLOT_DUR * 1.3;
          let a = localT < fadeIn ? localT / fadeIn : 1;
          // During clock phase (8-9.5): freeze, stop glitching
          const frozen = cycle >= 8.0;
          // Erased by explosion (9.5-11): fast fade out
          if (cycle >= 9.5) a *= Math.max(0, 1 - (cycle - 9.5) / 0.4);
          if (a < 0.01) continue;
          // Time: keeps ticking until clock appears at 8s, then freezes
          const runTime = Math.min(cycle, 8.0) - ts.start;
          if (runTime < 0) continue;
          const progress = ts.start / 8.0;
          const startMin = 23 * 60;
          const totalForward = 450;
          const slotMin = Math.floor(runTime * 8);
          const currentMin = (startMin + Math.floor(progress * totalForward) + slotMin) % 1440;
          const h2 = Math.floor(currentMin / 60);
          const m2 = currentMin % 60;
          const str = `${String(h2).padStart(2, '0')}:${String(m2).padStart(2, '0')}`;
          // Glitch only while not frozen
          if (!frozen) {
            ts.timer -= 0.016;
            if (ts.timer <= 0) {
              ts.glitchX = (Math.random() - 0.5) * 2;
              ts.glitchY = (Math.random() - 0.5) * 1.5;
              ts.timer = 0.1 + Math.random() * 0.15;
            }
          }
          const dx = ts.x + ts.glitchX, dy = ts.y + ts.glitchY;
          const fs = ts.size;
          ctx.save();
          ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.font = `${fs}px 'Temporal Shift', monospace`;
          ctx.letterSpacing = '2px';
          // Double shadow — second one glitch-offset
          const shGX = (Math.sin(t * 7 + ts.start * 3) * 3);
          const shGY = (Math.cos(t * 5 + ts.start * 2) * 2);
          ctx.globalAlpha = a * 0.35;
          ctx.fillStyle = 'rgba(0,0,0,0.7)';
          ctx.fillText(str, dx + shGX, dy + shGY); // glitched far shadow
          ctx.globalAlpha = a * 0.6;
          ctx.fillStyle = 'rgba(0,0,0,0.9)';
          ctx.fillText(str, dx + 1, dy + 1); // near shadow
          // RGB split
          const split = localT * 0.8;
          if (split > 0.3) {
            ctx.globalAlpha = a * 0.35;
            ctx.fillStyle = 'rgba(255,60,60,0.9)';
            ctx.fillText(str, dx - split, dy);
            ctx.fillStyle = 'rgba(60,160,255,0.9)';
            ctx.fillText(str, dx + split, dy);
          }
          // Main text — outlined + filled
          ctx.globalAlpha = a * 0.9;
          ctx.strokeStyle = 'rgba(255,200,80,0.6)';
          ctx.lineWidth = 1.5;
          ctx.strokeText(str, dx, dy);
          ctx.fillStyle = 'rgba(255,235,170,1)';
          ctx.shadowColor = 'rgba(255,200,80,1)';
          ctx.shadowBlur = 20;
          ctx.fillText(str, dx, dy);
          ctx.restore();
        }
        // Scanlines — only during active glitch phase, not when frozen
        if (cycle > 1.5 && cycle < 8.0) {
          const count = Math.floor(2 + (cycle - 1.5) * 1.2);
          for (let s = 0; s < count; s++) {
            const sy = Math.random() * h;
            ctx.save();
            ctx.globalAlpha = 0.06 + Math.random() * 0.08;
            ctx.fillStyle = 'rgba(255,220,120,0.5)';
            ctx.fillRect(0, sy, w, 1);
            ctx.restore();
          }
        }
      }
      // ── PHASE 2 (8–9.5s): MASSIVE CLOCK WITH FILLED GEARS ──
      // Draw gear — shared between clock and explosion mini gears
      const drawGear = (gx, gy, gr, teeth, rot, alpha) => {
        ctx.save(); ctx.globalAlpha = alpha; ctx.translate(gx, gy); ctx.rotate(rot);
        const tH = gr * 0.08, iR = gr * 0.92, oR = gr + tH;
        ctx.fillStyle = 'rgba(215,195,155,0.5)';
        ctx.strokeStyle = 'rgba(255,235,180,0.65)'; ctx.lineWidth = 1.2;
        ctx.beginPath();
        for (let i = 0; i < teeth; i++) {
          const a2 = (Math.PI * 2 / teeth) * i;
          const ht = Math.PI / teeth * 0.5;
          ctx.lineTo(Math.cos(a2 - ht) * iR, Math.sin(a2 - ht) * iR);
          ctx.lineTo(Math.cos(a2 - ht * 0.55) * oR, Math.sin(a2 - ht * 0.55) * oR);
          ctx.lineTo(Math.cos(a2 + ht * 0.55) * oR, Math.sin(a2 + ht * 0.55) * oR);
          ctx.lineTo(Math.cos(a2 + ht) * iR, Math.sin(a2 + ht) * iR);
        }
        ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.fillStyle = 'rgba(200,180,140,0.45)';
        ctx.beginPath(); ctx.arc(0, 0, gr * 0.42, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        const irR2 = gr * 0.6;
        ctx.strokeStyle = 'rgba(255,230,170,0.4)'; ctx.lineWidth = 0.8;
        ctx.beginPath(); ctx.arc(0, 0, irR2, 0, Math.PI * 2); ctx.stroke();
        if (gr > 8) { // thorns + spokes only on larger gears
          const thN = Math.max(10, Math.floor(teeth * 1.2));
          ctx.fillStyle = 'rgba(235,215,170,0.7)'; ctx.strokeStyle = 'rgba(255,235,180,0.5)'; ctx.lineWidth = 0.5;
          for (let th = 0; th < thN; th++) { const ta = (Math.PI * 2 / thN) * th; const thH2 = gr * 0.1; const thW = Math.PI / thN * 0.4; ctx.beginPath(); ctx.moveTo(Math.cos(ta - thW) * irR2, Math.sin(ta - thW) * irR2); ctx.lineTo(Math.cos(ta) * (irR2 - thH2), Math.sin(ta) * (irR2 - thH2)); ctx.lineTo(Math.cos(ta + thW) * irR2, Math.sin(ta + thW) * irR2); ctx.closePath(); ctx.fill(); ctx.stroke(); }
          const spkN = teeth >= 12 ? 6 : 4;
          ctx.strokeStyle = 'rgba(255,230,170,0.3)'; ctx.lineWidth = Math.max(1, gr * 0.02);
          for (let s = 0; s < spkN; s++) { const sa = (Math.PI * 2 / spkN) * s; ctx.beginPath(); ctx.moveTo(Math.cos(sa) * gr * 0.16, Math.sin(sa) * gr * 0.16); ctx.lineTo(Math.cos(sa) * gr * 0.4, Math.sin(sa) * gr * 0.4); ctx.stroke(); }
        }
        ctx.fillStyle = 'rgba(20,18,15,0.5)';
        ctx.beginPath(); ctx.arc(0, 0, gr * 0.12, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = 'rgba(255,230,170,0.4)'; ctx.lineWidth = 0.8; ctx.stroke();
        ctx.restore();
      };
      const clockVisible = cycle >= 8.0 && cycle < 9.7;
      if (clockVisible) {
        const cT = cycle - 8.0;
        const bIn = Math.min(1, cT / 0.12);
        const cFade = cycle >= 9.5 ? Math.max(0, 1 - (cycle - 9.5) / 0.2) : 1;
        const a = bIn * cFade * 0.9;
        const r = clockR * bIn;
        // Light bloom
        ctx.save(); ctx.globalAlpha = a * 0.5;
        const bloom = ctx.createRadialGradient(cx + r * 0.3, cy, 0, cx + r * 0.3, cy, r * 1.2);
        bloom.addColorStop(0, 'rgba(255,240,200,0.6)');
        bloom.addColorStop(0.4, 'rgba(255,210,130,0.15)');
        bloom.addColorStop(1, 'rgba(255,180,80,0)');
        ctx.fillStyle = bloom; ctx.beginPath(); ctx.arc(cx + r * 0.3, cy, r * 1.2, 0, Math.PI * 2); ctx.fill(); ctx.restore();
        // Gears + hands: full speed until hands cross 6:30, then everything freezes
        const stopped = handFrozenAt >= 0;
        const gearT = stopped ? handFrozenAt : cT;
        for (const g of gears) {
          const rot = g.speed * gearT * 5;
          drawGear(cx + g.x * r, cy + g.y * r, g.r * r, g.teeth, rot, a * (g.r > 0.2 ? 0.9 : g.r > 0.1 ? 0.7 : 0.5));
        }
        // Outer ring — double: thick + slim
        ctx.save(); ctx.globalAlpha = a * 0.9;
        ctx.strokeStyle = 'rgba(255,230,150,0.8)'; ctx.shadowColor = 'rgba(255,210,100,0.8)'; ctx.shadowBlur = 30; ctx.lineWidth = 6;
        ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
        ctx.restore();
        ctx.save(); ctx.globalAlpha = a * 0.7;
        ctx.strokeStyle = 'rgba(255,225,140,0.6)'; ctx.shadowColor = 'rgba(255,200,80,0.4)'; ctx.shadowBlur = 10; ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.arc(cx, cy, r * 0.94, 0, Math.PI * 2); ctx.stroke();
        ctx.restore();
        // Inner ring with inverted thorns
        ctx.save(); ctx.globalAlpha = a * 0.4;
        ctx.strokeStyle = 'rgba(255,220,140,0.5)'; ctx.lineWidth = 1.5;
        const cIR = r * 0.85;
        ctx.beginPath(); ctx.arc(cx, cy, cIR, 0, Math.PI * 2); ctx.stroke();
        // Thorns pointing inward on clock inner ring
        ctx.fillStyle = 'rgba(255,230,170,0.5)';
        const cThornN = 36;
        for (let ti = 0; ti < cThornN; ti++) {
          const ta = (Math.PI * 2 / cThornN) * ti;
          const tW = Math.PI / cThornN * 0.4;
          const tH = r * 0.03;
          ctx.beginPath();
          ctx.moveTo(cx + Math.cos(ta - tW) * cIR, cy + Math.sin(ta - tW) * cIR);
          ctx.lineTo(cx + Math.cos(ta) * (cIR - tH), cy + Math.sin(ta) * (cIR - tH));
          ctx.lineTo(cx + Math.cos(ta + tW) * cIR, cy + Math.sin(ta + tW) * cIR);
          ctx.closePath(); ctx.fill();
        }
        ctx.restore();
        // Hands — spin fast, lock exactly at 6:30 when they pass through it
        const minSpeed = Math.PI * 20; // much faster spin
        if (handFrozenAt < 0 && cT > 0.6) {
          const minRaw = cT * minSpeed;
          const minMod = ((minRaw % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
          if (minMod < 0.3 || minMod > Math.PI * 2 - 0.3) {
            handFrozenAt = cT;
          }
        }
        // When stopped, snap to exact 6:30 — not approximate
        const minA = stopped ? Math.PI : Math.PI + cT * minSpeed;
        const hourA = stopped ? Math.PI + Math.PI / 12 : (Math.PI + Math.PI / 12) + cT * minSpeed * 0.3;
        // Hand: diamond tip + smaller diamond + two flat teardrop wings
        const drawHand = (angle, len, hw, alpha) => {
          ctx.save(); ctx.globalAlpha = alpha;
          ctx.translate(cx, cy); ctx.rotate(angle + Math.PI / 2);
          ctx.fillStyle = 'rgba(255,248,215,1)';
          ctx.shadowColor = 'rgba(255,235,120,1)'; ctx.shadowBlur = 22;
          // Shaft — tapered
          ctx.beginPath();
          ctx.moveTo(-hw * 0.22, len * 0.04);
          ctx.lineTo(-hw * 0.08, -len * 0.55);
          ctx.lineTo(hw * 0.08, -len * 0.55);
          ctx.lineTo(hw * 0.22, len * 0.04);
          ctx.closePath(); ctx.fill();
          // Large diamond at tip
          const dY = -len * 0.85;
          const dH = len * 0.15;
          const dW = hw * 0.8;
          ctx.beginPath();
          ctx.moveTo(0, dY - dH);
          ctx.lineTo(dW, dY);
          ctx.lineTo(0, dY + dH);
          ctx.lineTo(-dW, dY);
          ctx.closePath(); ctx.fill();
          // Smaller diamond below
          const d2Y = -len * 0.58;
          const d2H = len * 0.07;
          const d2W = hw * 0.5;
          ctx.beginPath();
          ctx.moveTo(0, d2Y - d2H);
          ctx.lineTo(d2W, d2Y);
          ctx.lineTo(0, d2Y + d2H);
          ctx.lineTo(-d2W, d2Y);
          ctx.closePath(); ctx.fill();
          // Volute scrolls — thin stroked spirals, not filled blobs
          const wY = d2Y + d2H * 0.3;
          const sc = hw * 2.0;
          ctx.strokeStyle = 'rgba(255,248,215,1)';
          ctx.lineWidth = hw * 0.25;
          ctx.lineCap = 'round';
          // Right scroll: sweep out, arc up, spiral inward
          ctx.beginPath();
          ctx.moveTo(hw * 0.15, wY);
          ctx.bezierCurveTo(sc * 0.6, wY - sc * 0.5, sc * 1.3, wY - sc * 0.6, sc * 1.2, wY - sc * 0.1);
          ctx.bezierCurveTo(sc * 1.1, wY + sc * 0.25, sc * 0.6, wY + sc * 0.2, sc * 0.75, wY);
          ctx.stroke();
          // Left scroll: mirror
          ctx.beginPath();
          ctx.moveTo(-hw * 0.15, wY);
          ctx.bezierCurveTo(-sc * 0.6, wY - sc * 0.5, -sc * 1.3, wY - sc * 0.6, -sc * 1.2, wY - sc * 0.1);
          ctx.bezierCurveTo(-sc * 1.1, wY + sc * 0.25, -sc * 0.6, wY + sc * 0.2, -sc * 0.75, wY);
          ctx.stroke();
          // Counterweight circle
          ctx.beginPath(); ctx.arc(0, len * 0.06, hw * 0.35, 0, Math.PI * 2); ctx.fill();
          ctx.restore();
        };
        drawHand(minA, r * 0.82, 5, a * 1.5);
        drawHand(hourA, r * 0.5, 7, a * 1.4);
        // Center jewel
        ctx.save(); ctx.globalAlpha = Math.min(1, a * 2.5);
        ctx.fillStyle = 'rgba(255,245,200,1)'; ctx.shadowColor = 'rgba(255,230,120,1)'; ctx.shadowBlur = 25;
        ctx.beginPath(); ctx.arc(cx, cy, 5, 0, Math.PI * 2); ctx.fill(); ctx.restore();
      }
      // ── PHASE 3 (9.5s): SHATTER — flash + shards + mini gears ──
      if (cycleId !== lastBoom && cycle >= 9.5) {
        lastBoom = cycleId;
        for (const n of nebulae) { n.dist = 0; n.active = true; n.angle = Math.random() * Math.PI * 2; }
        for (const ws of wisps) { ws.dist = 0; ws.active = true; ws.angle = Math.random() * Math.PI * 2; ws.rot = Math.random() * Math.PI; }
        // Launch mini gears in all directions across the full screen
        for (const mg of miniGears) {
          mg.x = cx + (Math.random() - 0.5) * clockR * 0.6;
          mg.y = cy + (Math.random() - 0.5) * clockR * 0.6;
          const ang = Math.random() * Math.PI * 2;
          const spd = 3 + Math.random() * 8; // fast — reaches screen edges
          mg.vx = Math.cos(ang) * spd;
          mg.vy = Math.sin(ang) * spd;
          mg.rot = Math.random() * Math.PI * 2;
          mg.active = true;
        }
      }
      if (cycle >= 9.5 && cycle < 10.0) {
        const bT = (cycle - 9.5) / 0.5;
        // Flash
        ctx.save(); ctx.globalAlpha = 0.7 * (1 - bT);
        const fg = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(w, h));
        fg.addColorStop(0, 'rgba(255,255,240,1)'); fg.addColorStop(0.15, 'rgba(255,240,180,0.8)');
        fg.addColorStop(0.4, 'rgba(255,200,80,0.4)'); fg.addColorStop(1, 'rgba(255,160,30,0)');
        ctx.fillStyle = fg; ctx.beginPath(); ctx.arc(cx, cy, Math.max(w, h), 0, Math.PI * 2); ctx.fill();
        ctx.restore();
        // Shockwave ring
        const ringR = bT * clockR * 2.5;
        ctx.save(); ctx.globalAlpha = 0.5 * (1 - bT);
        ctx.strokeStyle = 'rgba(255,240,180,0.8)'; ctx.lineWidth = 3; ctx.shadowColor = 'rgba(255,220,100,0.8)'; ctx.shadowBlur = 20;
        ctx.beginPath(); ctx.arc(cx, cy, ringR, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
      }
      // ── PHASE 4 (9.5–15s): SHARDS + MINI GEARS + NEBULA ──
      if (cycle >= 9.5) {
        const nT = cycle - 9.5;
        // Mini gears flying across the full screen — use same drawGear as clock
        for (const mg of miniGears) {
          if (!mg.active) continue;
          mg.x += mg.vx; mg.y += mg.vy; mg.rot += mg.rotV;
          mg.vx *= 0.995; mg.vy *= 0.995;
          const fade = Math.max(0, 1 - nT / 4.2);
          if (fade < 0.01) { mg.active = false; continue; }
          drawGear(mg.x, mg.y, mg.size, mg.teeth, mg.rot, fade * 0.8);
        }
        // Nebula clouds
        for (const n of nebulae) { if (!n.active) continue; n.dist += n.speed * 0.7; n.angle += n.drift * 0.016; const x = cx + Math.cos(n.angle) * n.dist, y = cy + Math.sin(n.angle) * n.dist; const eS = n.size * (0.5 + nT * 0.35); const fd = Math.max(0, n.maxAlpha * (1 - nT / 3.5)); if (fd < 0.002) { n.active = false; continue; } ctx.save(); ctx.globalAlpha = fd; const g = ctx.createRadialGradient(x, y, 0, x, y, eS); g.addColorStop(0, `rgba(${n.color},0.5)`); g.addColorStop(0.4, `rgba(${n.color},0.15)`); g.addColorStop(1, `rgba(${n.color},0)`); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, eS, 0, Math.PI * 2); ctx.fill(); ctx.restore(); }
        // Wisps
        for (const ws of wisps) { if (!ws.active) continue; ws.dist += ws.speed * 0.5; ws.rot += ws.rotV; const x = cx + Math.cos(ws.angle) * ws.dist, y = cy + Math.sin(ws.angle) * ws.dist; const fd = Math.max(0, ws.maxAlpha * (1 - nT / 3.5)); if (fd < 0.002) { ws.active = false; continue; } ctx.save(); ctx.globalAlpha = fd; ctx.translate(x, y); ctx.rotate(ws.rot); ctx.fillStyle = 'rgba(255,220,130,0.25)'; ctx.beginPath(); ctx.ellipse(0, 0, ws.len * (0.8 + nT * 0.12), ws.width * (0.6 + nT * 0.08), 0, 0, Math.PI * 2); ctx.fill(); ctx.restore(); }
      }
    };
  },

  // 🌊 LUMINOUS (Phoebe): underwater caustics, rising bubbles, candle flickers, floating veils
  luminous: (w, h) => {
    // Caustic light pattern — shimmering refracted light on the "ceiling"
    const caustics = Array.from({ length: 8 }, () => ({
      x: Math.random() * w, y: Math.random() * h * 0.4,
      size: 30 + Math.random() * 50, phase: Math.random() * Math.PI * 2,
      speed: 0.2 + Math.random() * 0.3, vx: (Math.random() - 0.5) * 0.15,
    }));
    // Rising bubbles
    const bubbles = Array.from({ length: 10 }, () => ({
      x: Math.random() * w, y: h + Math.random() * h * 0.3,
      size: 1.5 + Math.random() * 3, vy: -0.15 - Math.random() * 0.25,
      wobbleAmp: 3 + Math.random() * 8, wobbleSpeed: 0.3 + Math.random() * 0.4,
      phase: Math.random() * Math.PI * 2, alpha: 0.2 + Math.random() * 0.25,
    }));
    // Candle flickers — warm points of light
    const candles = Array.from({ length: 5 }, () => ({
      x: w * 0.15 + Math.random() * w * 0.7, y: h * 0.5 + Math.random() * h * 0.4,
      phase: Math.random() * Math.PI * 2, speed: 2 + Math.random() * 3,
      size: 2 + Math.random() * 2.5,
    }));
    // Floating veil shapes — translucent arcs drifting slowly
    const veils = Array.from({ length: 3 }, () => ({
      x: Math.random() * w, y: h * 0.2 + Math.random() * h * 0.5,
      width: 60 + Math.random() * 80, height: 15 + Math.random() * 25,
      vx: -0.08 - Math.random() * 0.12, phase: Math.random() * Math.PI * 2,
      alpha: 0.04 + Math.random() * 0.03,
    }));
    return (ctx, t) => {
      // Caustic light ripples
      for (const c of caustics) {
        c.x += c.vx; if (c.x < -c.size) c.x = w + c.size;
        const a = c.alpha = 0.04 + Math.sin(t * c.speed + c.phase) * 0.03;
        ctx.save();
        ctx.globalAlpha = a;
        const g = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, c.size);
        g.addColorStop(0, 'rgba(180,230,255,0.5)');
        g.addColorStop(0.5, 'rgba(140,210,240,0.15)');
        g.addColorStop(1, 'rgba(100,180,220,0)');
        ctx.fillStyle = g;
        // Distort shape with sin for watery feel
        ctx.beginPath();
        for (let i = 0; i <= 24; i++) {
          const angle = (Math.PI * 2 / 24) * i;
          const wobble = 1 + Math.sin(angle * 3 + t * 1.5 + c.phase) * 0.2;
          const r = c.size * wobble;
          ctx[i === 0 ? 'moveTo' : 'lineTo'](c.x + Math.cos(angle) * r, c.y + Math.sin(angle) * r * 0.6);
        }
        ctx.closePath(); ctx.fill();
        ctx.restore();
      }
      // Floating veils
      for (const v of veils) {
        v.x += v.vx; if (v.x < -v.width) v.x = w + 10;
        const sway = Math.sin(t * 0.3 + v.phase) * 8;
        ctx.save();
        ctx.globalAlpha = v.alpha;
        ctx.fillStyle = 'rgba(220,240,255,0.5)';
        ctx.beginPath();
        ctx.moveTo(v.x, v.y + sway);
        ctx.quadraticCurveTo(v.x + v.width * 0.3, v.y - v.height + sway, v.x + v.width * 0.5, v.y + sway * 0.5);
        ctx.quadraticCurveTo(v.x + v.width * 0.7, v.y + v.height + sway, v.x + v.width, v.y + sway);
        ctx.fill();
        ctx.restore();
      }
      // Rising bubbles
      for (const b of bubbles) {
        b.y += b.vy;
        const wx = b.x + Math.sin(t * b.wobbleSpeed + b.phase) * b.wobbleAmp;
        if (b.y < -10) { b.y = h + 10; b.x = Math.random() * w; }
        ctx.save();
        ctx.globalAlpha = b.alpha;
        ctx.strokeStyle = 'rgba(180,220,255,0.7)';
        ctx.lineWidth = 0.8;
        ctx.beginPath(); ctx.arc(wx, b.y, b.size, 0, Math.PI * 2); ctx.stroke();
        // Highlight
        ctx.globalAlpha = b.alpha * 0.6;
        ctx.fillStyle = 'rgba(220,240,255,0.8)';
        ctx.beginPath(); ctx.arc(wx - b.size * 0.3, b.y - b.size * 0.3, b.size * 0.3, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      }
      // Candle flickers
      for (const c of candles) {
        const flicker = 0.4 + Math.sin(t * c.speed + c.phase) * 0.3 + Math.sin(t * c.speed * 1.7 + c.phase) * 0.2;
        ctx.save();
        ctx.globalAlpha = Math.max(0, flicker) * 0.5;
        ctx.fillStyle = 'rgba(255,230,170,1)';
        ctx.shadowColor = 'rgba(255,200,100,0.7)';
        ctx.shadowBlur = 14;
        ctx.beginPath(); ctx.arc(c.x, c.y, c.size * (0.6 + flicker * 0.4), 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      }
    };
  },
};


export { CHARACTER_THEME_MAP, ELEMENT_THEME_FALLBACK, BANNER_THEMES };
