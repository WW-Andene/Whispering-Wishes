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

  // 🎨 PRISMATIC (Lynae): graffiti paint drips, neon glow tubes, pixel blocks, spray mist
  prismatic: (w, h) => {
    const NEON = ['255,50,80', '255,140,0', '240,220,0', '0,230,120', '0,160,255', '200,60,255'];
    // Paint drips — streaks running down from random points
    const drips = Array.from({ length: 10 }, () => ({
      x: Math.random() * w, y: -Math.random() * h * 0.5,
      speed: 0.3 + Math.random() * 0.5, width: 2 + Math.random() * 4,
      len: 20 + Math.random() * 60, ci: Math.floor(Math.random() * NEON.length),
      alpha: 0.3 + Math.random() * 0.35,
    }));
    // Pixel blocks — small squares appearing/dissolving like a glitchy screen
    const pixels = Array.from({ length: 25 }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      size: 3 + Math.random() * 6, phase: Math.random() * 10,
      lifeSpeed: 1.5 + Math.random() * 3, ci: Math.floor(Math.random() * NEON.length),
    }));
    // Neon tube segments — lines that "draw" themselves across the canvas
    const tubes = Array.from({ length: 4 }, () => ({
      x1: Math.random() * w, y1: Math.random() * h,
      angle: Math.random() * Math.PI * 2, len: 40 + Math.random() * 80,
      progress: Math.random(), speed: 0.3 + Math.random() * 0.4,
      ci: Math.floor(Math.random() * NEON.length), phase: Math.random() * 10,
    }));
    // Spray mist — fuzzy cloud drifting
    const sprays = Array.from({ length: 5 }, () => ({
      x: Math.random() * w, y: h * 0.3 + Math.random() * h * 0.5,
      size: 25 + Math.random() * 40, vx: (Math.random() - 0.5) * 0.3,
      ci: Math.floor(Math.random() * NEON.length), alpha: 0.04 + Math.random() * 0.04,
      phase: Math.random() * Math.PI * 2,
    }));
    return (ctx, t) => {
      // Spray mist clouds
      for (const s of sprays) {
        s.x += s.vx; if (s.x < -s.size) s.x = w + s.size; if (s.x > w + s.size) s.x = -s.size;
        ctx.save();
        ctx.globalAlpha = s.alpha * (0.7 + Math.sin(t * 0.3 + s.phase) * 0.3);
        const g = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.size);
        g.addColorStop(0, `rgba(${NEON[s.ci]},0.4)`);
        g.addColorStop(1, `rgba(${NEON[s.ci]},0)`);
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      }
      // Paint drips running down
      for (const d of drips) {
        d.y += d.speed;
        if (d.y > h + d.len) { d.y = -d.len - Math.random() * h * 0.3; d.x = Math.random() * w; d.ci = Math.floor(Math.random() * NEON.length); }
        ctx.save();
        ctx.globalAlpha = d.alpha;
        const g = ctx.createLinearGradient(d.x, d.y, d.x, d.y + d.len);
        g.addColorStop(0, `rgba(${NEON[d.ci]},0)`);
        g.addColorStop(0.3, `rgba(${NEON[d.ci]},0.9)`);
        g.addColorStop(1, `rgba(${NEON[d.ci]},0.6)`);
        ctx.fillStyle = g;
        ctx.shadowColor = `rgba(${NEON[d.ci]},0.6)`;
        ctx.shadowBlur = 6;
        // Drip shape: thin rect + round blob at bottom
        ctx.fillRect(d.x - d.width / 2, d.y, d.width, d.len * 0.85);
        ctx.beginPath(); ctx.arc(d.x, d.y + d.len, d.width * 0.8, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      }
      // Pixel blocks — flash in/out
      for (const p of pixels) {
        p.phase += 0.016 * p.lifeSpeed;
        const cycle = p.phase % 4;
        const a = cycle < 0.4 ? cycle / 0.4 : cycle < 1.2 ? 1 : cycle < 1.6 ? (1.6 - cycle) / 0.4 : 0;
        if (a < 0.02) { if (cycle > 3.5) { p.x = Math.random() * w; p.y = Math.random() * h; p.ci = Math.floor(Math.random() * NEON.length); } continue; }
        ctx.save();
        ctx.globalAlpha = a * 0.7;
        ctx.fillStyle = `rgba(${NEON[p.ci]},1)`;
        ctx.shadowColor = `rgba(${NEON[p.ci]},0.8)`;
        ctx.shadowBlur = 8;
        ctx.fillRect(p.x, p.y, p.size, p.size);
        ctx.restore();
      }
      // Neon tube lines drawing themselves
      for (const tb of tubes) {
        tb.phase += 0.016 * tb.speed;
        const cycle = tb.phase % 5;
        const prog = Math.min(1, cycle / 1.5);
        const fade = cycle > 3 ? (5 - cycle) / 2 : 1;
        if (fade < 0.02) { if (cycle > 4.8) { tb.x1 = Math.random() * w; tb.y1 = Math.random() * h; tb.angle = Math.random() * Math.PI * 2; tb.ci = Math.floor(Math.random() * NEON.length); } continue; }
        const x2 = tb.x1 + Math.cos(tb.angle) * tb.len * prog;
        const y2 = tb.y1 + Math.sin(tb.angle) * tb.len * prog;
        ctx.save();
        ctx.globalAlpha = fade * 0.55;
        ctx.strokeStyle = `rgba(${NEON[tb.ci]},1)`;
        ctx.shadowColor = `rgba(${NEON[tb.ci]},0.9)`;
        ctx.shadowBlur = 12;
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(tb.x1, tb.y1); ctx.lineTo(x2, y2); ctx.stroke();
        ctx.restore();
      }
    };
  },

  // ⏰ RADIANCE (Zani): big clock of light, arms rotate, stop, explode into particles
  radiance: (w, h) => {
    const cx = w * 0.5, cy = h * 0.42;
    const clockR = Math.min(w, h) * 0.28;
    // Cycle: 0-6s arms spin, 6-6.3s pause, 6.3-8s explode, 8-9s fade, 9+ reset
    const CYCLE = 9;
    // Explosion particles — pre-allocated, reset each cycle
    const particles = Array.from({ length: 40 }, () => ({
      angle: 0, speed: 0, size: 0, x: 0, y: 0, alpha: 0, active: false,
      color: Math.random() > 0.5 ? '255,220,100' : '255,170,50',
    }));
    let lastCycleId = -1;
    return (ctx, t) => {
      const cycle = t % CYCLE;
      const cycleId = Math.floor(t / CYCLE);
      // Phase detection
      const spinning = cycle < 6;
      const paused = cycle >= 6 && cycle < 6.3;
      const exploding = cycle >= 6.3 && cycle < 8;
      const fading = cycle >= 8;
      // Clock opacity: fade in at start, hold, flash bright at explosion, fade out
      const clockAlpha = spinning ? Math.min(1, cycle / 0.5) * 0.3
        : paused ? 0.45
        : exploding ? 0.3 * Math.max(0, 1 - (cycle - 6.3) / 0.8)
        : 0;
      // Spawn explosion particles at moment of detonation
      if (cycleId !== lastCycleId && exploding) {
        lastCycleId = cycleId;
        for (const p of particles) {
          p.angle = Math.random() * Math.PI * 2;
          p.speed = 1.5 + Math.random() * 4;
          p.size = 1.5 + Math.random() * 3;
          p.x = cx; p.y = cy;
          p.alpha = 0.6 + Math.random() * 0.4;
          p.active = true;
        }
      }
      if (clockAlpha > 0.01) {
        // Clock ring — big circle of light
        ctx.save();
        ctx.globalAlpha = clockAlpha;
        ctx.strokeStyle = 'rgba(255,220,120,0.7)';
        ctx.shadowColor = 'rgba(255,200,80,0.5)';
        ctx.shadowBlur = 15;
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(cx, cy, clockR, 0, Math.PI * 2); ctx.stroke();
        ctx.restore();
        // 12 tick marks
        for (let i = 0; i < 12; i++) {
          const a = (Math.PI * 2 / 12) * i - Math.PI / 2;
          const isMajor = i % 3 === 0;
          const inner = clockR * (isMajor ? 0.82 : 0.88);
          const outer = clockR * 0.96;
          ctx.save();
          ctx.globalAlpha = clockAlpha * (isMajor ? 1.2 : 0.7);
          ctx.strokeStyle = 'rgba(255,220,120,0.9)';
          ctx.lineWidth = isMajor ? 2.5 : 1;
          ctx.beginPath();
          ctx.moveTo(cx + Math.cos(a) * inner, cy + Math.sin(a) * inner);
          ctx.lineTo(cx + Math.cos(a) * outer, cy + Math.sin(a) * outer);
          ctx.stroke();
          ctx.restore();
        }
        // Arms — spin during spinning phase, freeze during pause
        const armSpeed = spinning ? cycle : 6; // freeze at cycle=6 position
        const hourA = (armSpeed * 0.15) % (Math.PI * 2) - Math.PI / 2;
        const minA = (armSpeed * 0.6) % (Math.PI * 2) - Math.PI / 2;
        // Minute hand — long, thin
        ctx.save();
        ctx.globalAlpha = clockAlpha * 1.2;
        ctx.strokeStyle = 'rgba(255,240,180,1)';
        ctx.shadowColor = 'rgba(255,220,100,0.8)';
        ctx.shadowBlur = 12;
        ctx.lineWidth = 1.5; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(minA) * clockR * 0.85, cy + Math.sin(minA) * clockR * 0.85);
        ctx.stroke(); ctx.restore();
        // Hour hand — shorter, thicker
        ctx.save();
        ctx.globalAlpha = clockAlpha * 1.2;
        ctx.strokeStyle = 'rgba(255,230,150,1)';
        ctx.shadowColor = 'rgba(255,200,80,0.6)';
        ctx.shadowBlur = 10;
        ctx.lineWidth = 2.5; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(hourA) * clockR * 0.55, cy + Math.sin(hourA) * clockR * 0.55);
        ctx.stroke(); ctx.restore();
        // Center jewel
        ctx.save();
        ctx.globalAlpha = clockAlpha * 1.5;
        ctx.fillStyle = 'rgba(255,240,180,1)';
        ctx.shadowColor = 'rgba(255,220,100,0.9)';
        ctx.shadowBlur = 12;
        ctx.beginPath(); ctx.arc(cx, cy, 3, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
        // Flash at explosion moment
        if (paused || (exploding && cycle < 6.6)) {
          const flash = paused ? 0.06 : 0.15 * (1 - (cycle - 6.3) / 0.3);
          ctx.save();
          ctx.globalAlpha = flash;
          const fg = ctx.createRadialGradient(cx, cy, 0, cx, cy, clockR * 1.5);
          fg.addColorStop(0, 'rgba(255,240,200,0.8)');
          fg.addColorStop(0.5, 'rgba(255,200,80,0.3)');
          fg.addColorStop(1, 'rgba(255,180,50,0)');
          ctx.fillStyle = fg;
          ctx.beginPath(); ctx.arc(cx, cy, clockR * 1.5, 0, Math.PI * 2); ctx.fill();
          ctx.restore();
        }
      }
      // Explosion particles flying outward
      if (exploding || fading) {
        const explodeT = cycle - 6.3;
        for (const p of particles) {
          if (!p.active) continue;
          p.x = cx + Math.cos(p.angle) * p.speed * explodeT * 40;
          p.y = cy + Math.sin(p.angle) * p.speed * explodeT * 40;
          const fadeOut = fading ? Math.max(0, 1 - (cycle - 8)) : 1;
          const a = p.alpha * fadeOut * (1 - explodeT / 2.5);
          if (a < 0.01) { p.active = false; continue; }
          ctx.save();
          ctx.globalAlpha = a;
          ctx.fillStyle = `rgba(${p.color},1)`;
          ctx.shadowColor = `rgba(${p.color},0.8)`;
          ctx.shadowBlur = 10;
          const sz = p.size * (1 - explodeT / 3);
          ctx.beginPath(); ctx.arc(p.x, p.y, Math.max(0.5, sz), 0, Math.PI * 2); ctx.fill();
          ctx.restore();
        }
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
