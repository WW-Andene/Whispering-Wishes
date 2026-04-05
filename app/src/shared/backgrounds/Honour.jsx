// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — shared/backgrounds/Honour.jsx
// Procedural cloud renderer with sun rays, lightning, and atmospheric effects.
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useEffect, useRef, memo } from 'react';
import { throttledResize, seededRandom, _bgHash, _bgFbm, _bgRidged } from './backgroundHelpers.js';

const Honour = memo(({ oledMode, animationsEnabled = 'on', bgResolution, bgFps }) => {
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
    let groundCache = null;
    let swordGridCache = null;
    let honourParticles = null;
    let lastFrame = 0;
    let sceneClouds = null;
    let cloudBuildPending = false;
    let cloudRefreshIdx = 0;
    let cloudTime = 0;
    let skyCache = null;

    const isFull = animationsEnabled === 'full';
    const alphaScale = isFull ? 1.4 : 1.0;
    const bgBase = oledMode ? [0, 0, 0] : [12, 8, 4];

    const honourScale = (bgResolution || (isFull ? 100 : 50)) / 100;
    const honourFps = bgFps || (isFull ? 30 : 15);
    const honourInterval = Math.round(1000 / honourFps);

    let w, h;

    const init = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.ceil(w * honourScale);
      canvas.height = Math.ceil(h * honourScale);
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      groundCache = null;
      swordGridCache = null;
      honourParticles = null;
      skyCache = null;
    };
    init();
    const onResize = throttledResize(init);
    window.addEventListener('resize', onResize);

    // Pseudo-random hash function for deterministic randomness
    const hash = (n) => { const s = Math.sin(n) * 43758.5453; return s - Math.floor(s); };
    const sceneSeed = 29483;

    // === Cloud system from cloud-demo ===
    const CLOUD_DEFS = [
      { name: "fume", wispN: 3, densMul: 2.8, densPeak: 50, densFall: [0.4, 0.15, 0.04], baseAlpha: 0.15, hazeThresh: 2, maxDens: 40, depthLevels: 1, alphaCurve: 0 },
      { name: "small", wispN: 4, densMul: 2.2, densPeak: 100, densFall: [0.55, 0.22, 0.06], baseAlpha: 0.72, hazeThresh: 5, maxDens: 120, depthLevels: 2, alphaCurve: 1 },
      { name: "medium", wispN: 5, densMul: 2.0, densPeak: 100, densFall: [0.55, 0.25, 0.08], baseAlpha: 0.82, hazeThresh: 4, maxDens: 140, depthLevels: 3, alphaCurve: 2 },
      { name: "big", wispN: 6, densMul: 1.8, densPeak: 100, densFall: [0.55, 0.25, 0.08], baseAlpha: 0.90, hazeThresh: 4, maxDens: 140, depthLevels: 4, alphaCurve: 2 }
    ];
    function generateBalls(seed, baseRadius, cloudType) {
        const def = CLOUD_DEFS[cloudType];
        const rng = seededRandom(seed);
        const balls = [];

        function spawnCluster(cx, cy, radius, depth, maxDepth) {
            balls.push({ cx: cx, cy: cy, r: radius * (0.6 + rng() * 0.5) });
            if (depth >= maxDepth) return;
            const cc = Math.floor(2 + rng() * 3);
            for (let c = 0; c < cc; c++) {
                const a = rng() * Math.PI * 2;
                const d = radius * (0.3 + rng() * 0.7);
                const nx = (rng() - 0.5) * radius * 0.4;
                const ny = (rng() - 0.5) * radius * 0.4;
                spawnCluster(cx + Math.cos(a) * d + nx, cy + Math.sin(a) * d + ny, radius * (0.35 + rng() * 0.35), depth + 1, maxDepth);
            }
        }

        const fd = cloudType === 0 ? 1 : cloudType === 1 ? 2 : 3;
        const sc = cloudType === 0 ? 2 : cloudType === 1 ? 2 : cloudType === 2 ? 3 : 4;
        const sr = baseRadius * (cloudType === 0 ? 0.5 : 0.4);
        for (let s = 0; s < sc; s++) {
            const sa = rng() * Math.PI * 2;
            const sd = baseRadius * rng() * 0.2;
            spawnCluster(Math.cos(sa) * sd, Math.sin(sa) * sd, sr * (0.7 + rng() * 0.6), 0, fd);
        }

        const wc = def.wispN + Math.floor(rng() * 3);
        for (let w = 0; w < wc; w++) {
            const wa = rng() * Math.PI * 2;
            const wd = baseRadius * (0.4 + rng() * 0.6);
            const wr = baseRadius * (0.05 + rng() * 0.12);
            balls.push({
                cx: Math.cos(wa) * wd + (rng() - 0.5) * baseRadius * 0.3,
                cy: Math.sin(wa) * wd + (rng() - 0.5) * baseRadius * 0.3,
                r: wr
            });
        }

        return balls;
    }
    function bakeMetaball(balls, sunAngle, cloudType, depth, proximity, occlusion, resScale) {
      const def = CLOUD_DEFS[cloudType];
      const sc = resScale || 1;
      const margin = 2.5;
      let minX = 1e9, minY = 1e9, maxX = -1e9, maxY = -1e9;
      for (let i = 0; i < balls.length; i++) { const b = balls[i]; minX = Math.min(minX, b.cx - b.r * margin); minY = Math.min(minY, b.cy - b.r * margin); maxX = Math.max(maxX, b.cx + b.r * margin); maxY = Math.max(maxY, b.cy + b.r * margin); }
      const pad = 6;
      const fullW = Math.ceil(maxX - minX) + pad * 2, fullH = Math.ceil(maxY - minY) + pad * 2;
      if (fullW <= 0 || fullH <= 0 || fullW > 800 || fullH > 800) return null;
      const w = Math.max(4, Math.round(fullW * sc)), h = Math.max(4, Math.round(fullH * sc));
      const ox = (-minX + pad) * sc, oy = (-minY + pad) * sc;
      const dCvs = document.createElement("canvas"); dCvs.width = w; dCvs.height = h;
      const dCtx = dCvs.getContext("2d", { willReadFrequently: true }); dCtx.globalCompositeOperation = "lighter";
      const fo = def.densFall, pk = def.densPeak;
      for (let bi = 0; bi < balls.length; bi++) {
        const ball = balls[bi], bx = ox + ball.cx * sc, by = oy + ball.cy * sc, br = ball.r * def.densMul * sc;
        const grad = dCtx.createRadialGradient(bx, by, 0, bx, by, br);
        grad.addColorStop(0, "rgba(" + pk + "," + pk + "," + pk + ",1)");
        grad.addColorStop(0.25, "rgba(" + pk + "," + pk + "," + pk + "," + fo[0] + ")");
        grad.addColorStop(0.5, "rgba(" + pk + "," + pk + "," + pk + "," + fo[1] + ")");
        grad.addColorStop(0.75, "rgba(" + pk + "," + pk + "," + pk + "," + fo[2] + ")");
        grad.addColorStop(1, "rgba(0,0,0,0)");
        dCtx.fillStyle = grad; dCtx.beginPath(); dCtx.arc(bx, by, br, 0, Math.PI * 2); dCtx.fill();
      }
      const dd = dCtx.getImageData(0, 0, w, h).data;
      const oCvs = document.createElement("canvas"); oCvs.width = w; oCvs.height = h;
      const oCtx = oCvs.getContext("2d"), oD = oCtx.createImageData(w, h), od = oD.data;
      function dens(x, y) { return (x < 0 || x >= w || y < 0 || y >= h) ? 0 : dd[(y * w + x) * 4]; }
      const sdx = Math.cos(sunAngle), sdy = Math.sin(sunAngle), levels = def.depthLevels, bAlpha = def.baseAlpha, hT = def.hazeThresh, mD = def.maxDens;
      const lr = 1 - (occlusion || 0) * 0.7, ds = 1 - depth;
      // Sunset palette — matching warm amber-brown reference
      // Shadow: deep warm brown (like dark amber/chocolate, not olive)
      // Brighter amber palette + per-cloud brightness variation
      const bVar = 0.75 + hash(depth * 127 + proximity * 311) * 0.5;
      // Dramatic dark palette — near-black shadows, deep crimson mids, fiery highlights
      const shR = Math.round((3 + ds * 1 + lr * 1) * bVar), shG = Math.round((1 + ds * 0 + lr * 0) * bVar), shB = Math.round((0 + ds * 0 + lr * 0) * bVar);
      const ltR = Math.min(255, Math.round((115 + ds * 10 + proximity * 8) * bVar)), ltG = Math.min(255, Math.round((70 + ds * 6 + proximity * 4) * bVar)), ltB = Math.min(255, Math.round((35 + ds * 4 + proximity * 3) * bVar));
      const rmR = Math.min(255, Math.round((135 + ds * 6) * bVar)), rmG = Math.min(255, Math.round((82 + ds * 6 + proximity * 4) * bVar)), rmB = Math.min(255, Math.round((42 + ds * 4 + proximity * 3) * bVar));
      for (let py = 2; py < h - 2; py++) {
        for (let px = 2; px < w - 2; px++) {
          const idx = (py * w + px) * 4, density = dd[idx]; if (density < hT) continue;
          const thick = Math.min(1, (density - hT) / (mD - hT));
          const gx = (dens(px+1,py)*2+dens(px+2,py))-(dens(px-1,py)*2+dens(px-2,py));
          const gy = (dens(px,py+1)*2+dens(px,py+2))-(dens(px,py-1)*2+dens(px,py-2));
          const gl = Math.sqrt(gx*gx+gy*gy); let nx = 0, ny = 0; if (gl > 1) { nx = -gx/gl; ny = -gy/gl; }
          const sunF = (nx*sdx+ny*sdy)*0.5+0.5, thin = 1-thick;
          let rim = thin*thin*thin*Math.max(0,sunF)*0.7, sL = sunF*(0.35+thick*0.65);
          if (gl < 2) { sL *= 0.4; rim = 0; }
          // Banded shading — 5 bands: sun-facing → 1 deep → 2 stacked → 3 stacked → 4+
          // Floor at 0.25 (4+ only), 3 stacked = 0.38 (warmer than before)
          if (levels <= 1) sL = 0.55;
          else if (levels === 2) sL = sL > 0.45 ? 0.9 : 0.25;
          else if (levels === 3) sL = sL > 0.6 ? 0.92 : sL > 0.3 ? 0.48 : 0.2;
          else { sL = sL > 0.65 ? 0.95 : sL > 0.48 ? 0.62 : sL > 0.3 ? 0.38 : sL > 0.15 ? 0.22 : 0.12; }
          sL *= lr;
          // Darken bottom (dark orange), brighten center-top (light orange)
          const botT = py / h, botDark = botT > 0.55 ? 1 - (botT - 0.55) / 0.45 * 0.6 : 1;
          const topCen = botT < 0.4 ? (1 - botT / 0.4) * (1 - Math.abs(px / w - 0.5) * 2) : 0;
          sL = sL * botDark + topCen * 0.3;
          let r = Math.round(shR+(ltR-shR)*sL), g = Math.round(shG+(ltG-shG)*sL), bv = Math.round(shB+(ltB-shB)*sL);
          // Dark orange tint at bottom
          if (botT > 0.55) { const botStr = (botT - 0.55) / 0.45; r = Math.min(255, r + Math.round(botStr * 25)); g += Math.round(botStr * 6); }
          // Light orange tint at center-top
          if (topCen > 0) { r = Math.min(255, r + Math.round(topCen * 35)); g = Math.min(255, g + Math.round(topCen * 18)); bv = Math.min(255, bv + Math.round(topCen * 5)); }
          if (levels >= 2) { r = Math.min(255,r+Math.round(rmR*rim*0.4*lr)); g = Math.min(255,g+Math.round(rmG*rim*0.4*lr)); bv = Math.min(255,bv+Math.round(rmB*rim*0.4*lr)); }
          let alpha; if (def.alphaCurve===0) alpha=bAlpha*thick; else if (def.alphaCurve===1) alpha=bAlpha*thick*(0.4+thick*0.6); else alpha=bAlpha*thick*thick*(0.3+thick*0.7);
          od[idx]=r; od[idx+1]=g; od[idx+2]=bv; od[idx+3]=Math.round(alpha*255);
        }
      }
      oCtx.putImageData(oD, 0, 0);
      return { canvas: oCvs, ox: minX - pad, oy: minY - pad, w: fullW, h: fullH, sc: sc };
    }

    function buildCloudsForScene(W, H) {
        const sunX = W * 0.5;
        const sunY = H * 0.3;
        const sunR = H * 0.08;
        const minDist = sunR * 1.2;
        const clouds = [];
        // Limit maxReach to what's actually visible — orbit must intersect screen
        const screenDiag = Math.sqrt((W * 0.5) * (W * 0.5) + Math.max(sunY, H - sunY) * Math.max(sunY, H - sunY));
        const maxReach = screenDiag + 250; // + margin for cloud size
        let id = 0;

        function getCachedBake(seed, balls, sunAngle, cType, dep, prox, rs) {
            return bakeMetaball(balls, sunAngle, cType, dep, prox, 0, rs);
        }

        function addC(seed, dist, angle, radius, dep, spd, cType) {
            // Skip if orbit never intersects screen (orbit ellipse fully off-screen)
            const flatR = 0.7;
            const orbitLeft = sunX - dist, orbitRight = sunX + dist;
            const orbitTop = sunY - dist * flatR, orbitBot = sunY + dist * flatR;
            const margin = radius * 3;
            if (orbitRight + margin < 0 || orbitLeft - margin > W || orbitBot + margin < 0 || orbitTop - margin > H) return;
            const prox = Math.max(0, 1 - dist / maxReach);
            const balls = generateBalls(seed, radius, cType);
            const cx = sunX + Math.cos(angle) * dist;
            const cy = sunY + Math.sin(angle) * dist * 0.7;
            const rs = cType <= 1 ? 0.5 : 1;
            const baked = getCachedBake(seed, balls, Math.atan2(sunY - cy, sunX - cx), cType, dep, prox, rs);
            if (!baked) return;
            clouds.push({ id: id++, sunX: sunX, sunY: sunY, orbitDist: dist, angle: angle, orbitSpeed: spd, balls: balls, baked: baked, seed: seed, depth: dep, proximity: prox, baseRadius: radius, cloudType: cType, noRefresh: cType <= 1 });
        }

        function addHi(seed, dist, angle, radius, dep, spd, cType, layerY, layerFlat) {
            const orbitLeft = sunX - dist, orbitRight = sunX + dist;
            const orbitTop = layerY - dist * layerFlat, orbitBot = layerY + dist * layerFlat;
            const margin = radius * 3;
            if (orbitRight + margin < 0 || orbitLeft - margin > W || orbitBot + margin < 0 || orbitTop - margin > H) return;
            const prox = Math.max(0, 1 - dist / maxReach);
            const balls = generateBalls(seed, radius, cType);
            const hcx = sunX + Math.cos(angle) * dist;
            const hcy = layerY + Math.sin(angle) * dist * layerFlat;
            const rs = cType <= 1 ? 0.5 : 1;
            const baked = getCachedBake(seed, balls, Math.atan2(sunY - hcy, sunX - hcx), cType, dep, prox, rs);
            if (!baked) return;
            clouds.push({ id: id++, sunX: sunX, sunY: layerY, orbitDist: dist, angle: angle, orbitSpeed: spd, balls: balls, baked: baked, seed: seed, depth: dep, proximity: prox, baseRadius: radius, cloudType: cType, orbitFlatten: layerFlat, noRefresh: cType <= 1 });
        }

        const speeds = [0.04, 0.07, 0.11, 0.18, 0.28];
        const phases = [0, 1.0, 2.1, 3.4, 4.8];
        for (let s = 0; s < 5; s++) {
            const nCl = 16 + Math.floor(hash(s * 100) * 10);
            for (let c = 0; c < nCl; c++) {
                const cs = s * 1000 + c * 37;
                const rng2 = seededRandom(cs);
                const dist = Math.max(minDist, minDist + Math.sqrt(rng2()) * (maxReach - minDist));
                const ang = phases[s] + (c / nCl) * Math.PI * 2 + (rng2() - 0.5) * (Math.PI * 2 / nCl) * 1.5;
                const sr = rng2();
                let rad, cType;
                if (sr < 0.12) { rad = 110 + rng2() * 80; cType = 3; }
                else if (sr < 0.40) { rad = 55 + rng2() * 60; cType = 2; }
                else if (sr < 0.72) { rad = 28 + rng2() * 30; cType = 1; }
                else { rad = 14 + rng2() * 18; cType = 0; }
                const dep = Math.max(0, Math.min(1, (1 - s / 4) + (rng2() - 0.5) * 0.25));
                const spd = speeds[s] / (0.5 + rad / 60) * (0.55 + dep * 0.45) / (0.3 + dist / (H * 0.5));
                addC(cs, dist, ang, rad, dep, spd, cType);
                const nM = 3 + Math.floor(rng2() * 2);
                for (let m = 0; m < nM; m++) {
                    const ms = cs + 500 + m * 13;
                    const mr = seededRandom(ms);
                    const mRad = rad * (0.25 + mr() * 0.4);
                    const mType = cType > 0 ? cType - 1 : 0;
                    const mDist = Math.max(minDist, dist + (mr() - 0.5) * rad * 4);
                    const mAng = ang + (mr() - 0.5) * 1.0;
                    const mDep = Math.max(0, Math.min(1, dep + (mr() - 0.5) * 0.15));
                    addC(ms, mDist, mAng, mRad, mDep, speeds[s] / (0.5 + mRad / 60) * (0.55 + mDep * 0.45) / (0.3 + mDist / (H * 0.5)) * 1.1, mType);
                    const nSm = 1 + Math.floor(mr() * 2);
                    for (let sm = 0; sm < nSm; sm++) {
                        const ss = ms + 200 + sm * 7;
                        const sr2 = seededRandom(ss);
                        const sRad = mRad * (0.2 + sr2() * 0.35);
                        const sType = mType > 0 ? mType - 1 : 0;
                        const sDist = Math.max(minDist, mDist + (sr2() - 0.5) * mRad * 4);
                        const sAng = mAng + (sr2() - 0.5) * 1.2;
                        const sDep = Math.max(0, Math.min(1, mDep + (sr2() - 0.5) * 0.2));
                        addC(ss, sDist, sAng, sRad, sDep, speeds[s] / (0.5 + sRad / 60) * (0.55 + sDep * 0.45) / (0.3 + sDist / (H * 0.5)) * 1.3, sType);
                    }
                }
            }
        }

        const hiSunY = sunY - H * 0.12;
        const hiMin = minDist * 0.6;
        const hiMax = maxReach * 0.9;
        const hiSp = [0.30, 0.22, 0.15, 0.10];
        const hiPh = [0.5, 1.8, 3.3, 5.0];
        for (let hs = 0; hs < 4; hs++) {
            const hCl = 10 + Math.floor(hash(hs * 200 + 77) * 6);
            for (let hc = 0; hc < hCl; hc++) {
                const hcs = 50000 + hs * 1000 + hc * 41;
                const hrng = seededRandom(hcs);
                const hDist = Math.max(hiMin, hiMin + Math.pow(hrng(), 0.33) * (hiMax - hiMin));
                const hAng = hiPh[hs] + (hc / hCl) * Math.PI * 2 + (hrng() - 0.5) * (Math.PI * 2 / hCl) * 1.5;
                const hsr = hrng();
                let hRad, hcT;
                if (hsr < 0.15) { hRad = 30 + hrng() * 30; hcT = 2; }
                else if (hsr < 0.50) { hRad = 14 + hrng() * 18; hcT = 1; }
                else { hRad = 6 + hrng() * 10; hcT = 0; }
                const hDep = Math.max(0, Math.min(1, (1 - hs / 3) + (hrng() - 0.5) * 0.2));
                addHi(hcs, hDist, hAng, hRad, hDep, hiSp[hs] / (0.5 + hRad / 60) * (0.55 + hDep * 0.45) / (0.3 + hDist / (H * 0.5)), hcT, hiSunY, 0.35);
                const hnM = 1 + Math.floor(hrng() * 1);
                for (let hm = 0; hm < hnM; hm++) {
                    const hms = hcs + 600 + hm * 17;
                    const hmr = seededRandom(hms);
                    const hmRad = hRad * (0.3 + hmr() * 0.35);
                    const hmT = hcT > 0 ? hcT - 1 : 0;
                    const hmDist = Math.max(hiMin, hDist + (hmr() - 0.5) * hRad * 2);
                    const hmAng = hAng + (hmr() - 0.5) * 0.5;
                    addHi(hms, hmDist, hmAng, hmRad, Math.max(0, Math.min(1, hDep + (hmr() - 0.5) * 0.15)), hiSp[hs] / (0.5 + hmRad / 60) * (0.55 + hDep * 0.45) / (0.3 + hmDist / (H * 0.5)) * 1.15, hmT, hiSunY, 0.35);
                }
            }
        }

        const topY = sunY - H * 0.22;
        const topMin = minDist * 0.4;
        const topMax = maxReach * 0.95;
        const topSp = [0.35, 0.26, 0.18];
        const topPh = [0.3, 2.0, 4.2];
        for (let ts = 0; ts < 3; ts++) {
            const tCl = 8 + Math.floor(hash(ts * 300 + 99) * 6);
            for (let tc = 0; tc < tCl; tc++) {
                const tcs = 70000 + ts * 1000 + tc * 47;
                const trng = seededRandom(tcs);
                const tDist = Math.max(topMin, topMin + Math.pow(trng(), 0.33) * (topMax - topMin));
                const tAng = topPh[ts] + (tc / tCl) * Math.PI * 2 + (trng() - 0.5) * (Math.PI * 2 / tCl) * 1.5;
                const tsr2 = trng();
                let tRad, tcT;
                if (tsr2 < 0.35) { tRad = 10 + trng() * 15; tcT = 1; }
                else { tRad = 5 + trng() * 8; tcT = 0; }
                const tDep = Math.max(0, Math.min(1, (1 - ts / 2) + (trng() - 0.5) * 0.15));
                addHi(tcs, tDist, tAng, tRad, tDep, topSp[ts] / (0.5 + tRad / 60) * (0.55 + tDep * 0.45) / (0.3 + tDist / (H * 0.5)), tcT, topY, 0.2);
                const tnM = 1 + Math.floor(trng() * 2);
                for (let tm = 0; tm < tnM; tm++) {
                    const tms = tcs + 700 + tm * 19;
                    const tmr = seededRandom(tms);
                    const tmRad = tRad * (0.3 + tmr() * 0.4);
                    const tmDist = Math.max(topMin, tDist + (tmr() - 0.5) * tRad * 3);
                    const tmAng = tAng + (tmr() - 0.5) * 0.6;
                    addHi(tms, tmDist, tmAng, tmRad, Math.max(0, Math.min(1, tDep + (tmr() - 0.5) * 0.15)), topSp[ts] / (0.5 + tmRad / 60) * (0.55 + tDep * 0.45) / (0.3 + tmDist / (H * 0.5)) * 1.2, 0, topY, 0.2);
                }
            }
        }

        // Screen-space grid fill — place clouds across visible sky area
        // Convert screen position to orbit params around sun
        const skyBot = H * 0.72; // just above horizon
        const flatR = 0.7;
        const gCols = 8, gRows = 16;
        let gIdx = 0;
        for (let gr = 0; gr < gRows; gr++) {
            for (let gc2 = 0; gc2 < gCols; gc2++) {
                const gs = 90000 + gIdx * 71;
                const grng = seededRandom(gs);
                // Target screen position with jitter — bias rows toward bottom half
                const sx = ((gc2 + 0.15 + grng() * 0.7) / gCols) * W;
                const rowT = (gr + 0.15 + grng() * 0.7) / gRows;
                const sy = sunY * 0.3 + Math.pow(rowT, 0.7) * (skyBot - sunY * 0.3);
                // Convert to orbit distance + angle from sun center
                const dx = sx - sunX, dy = (sy - sunY) / flatR;
                const gDist = Math.max(minDist, Math.sqrt(dx * dx + dy * dy));
                const gAng = Math.atan2(dy, dx);
                const gRad = 18 + grng() * 50;
                const gT = gRad > 55 ? 3 : gRad > 35 ? 2 : gRad > 18 ? 1 : 0;
                const gDep = 0.15 + grng() * 0.55;
                const gSpd = 0.08 / (0.5 + gRad / 60) * (0.55 + gDep * 0.45) / (0.3 + gDist / (H * 0.5));
                addC(gs, gDist, gAng, gRad, gDep, gSpd, gT);
                // Companion cloud nearby
                const cs2 = gs + 500;
                const crng = seededRandom(cs2);
                const cRad = gRad * (0.3 + crng() * 0.4);
                const cT2 = gT > 0 ? gT - 1 : 0;
                const cDist = Math.max(minDist, gDist + (crng() - 0.5) * gRad * 3);
                const cAng2 = gAng + (crng() - 0.5) * 0.8;
                const cDep = Math.max(0, Math.min(1, gDep + (crng() - 0.5) * 0.2));
                addC(cs2, cDist, cAng2, cRad, cDep, 0.1 / (0.5 + cRad / 60) * (0.55 + cDep * 0.45) / (0.3 + cDist / (H * 0.5)), cT2);
                gIdx++;
            }
        }

        clouds.sort(function(a, b) { return a.depth - b.depth; });
        return clouds;
    }

    function refreshCloud(cloud, time2, sunX, sunY) {
        if (cloud.noRefresh) return;
        const flatR = cloud.orbitFlatten || 0.7;
        const x = sunX + Math.cos(cloud.angle) * cloud.orbitDist;
        const y = cloud.sunY + Math.sin(cloud.angle) * cloud.orbitDist * flatR;
        const sunAngle = Math.atan2(sunY - y, sunX - x);
        if (!cloud._rc) cloud._rc = 0;
        cloud._rc++;
        let useBalls = cloud.balls;
        if (cloud._rc % 30 === 0) {
            const drift = time2 * 0.0001;
            const drifted = [];
            for (let i = 0; i < cloud.balls.length; i++) {
                const b = cloud.balls[i];
                if (i === 0) { drifted.push(b); continue; }
                drifted.push({
                    cx: b.cx + Math.sin(drift * 3 + i * 1.7) * b.r * 0.12,
                    cy: b.cy + Math.cos(drift * 2.3 + i * 2.1) * b.r * 0.1,
                    r: b.r
                });
            }
            useBalls = drifted;
        }
        const baked = bakeMetaball(useBalls, sunAngle, cloud.cloudType, cloud.depth, cloud.proximity, 0);
        if (baked) cloud.baked = baked;
    }

    const rng = (i, off) => { const s = Math.sin((i + sceneSeed) * 217.3 + off * 341.7) * 73291.9; return s - Math.floor(s); };
    const ihash = (n, off) => { let h = Math.imul(n + off, 2654435761) | 0; h = Math.imul(h ^ (h >>> 16), 0x45d9f3b); h = Math.imul(h ^ (h >>> 13), 0x45d9f3b); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };

    const draw = (t) => {
      animId = requestAnimationFrame(draw);
      if (t - lastFrame < honourInterval) return;
      lastFrame = t;
      const time = t * 0.0005;

      // (all pre-battleground effects removed — only sky + sun in battleground)

      ctx.save();
      ctx.scale(honourScale, honourScale);

      // ===== BATTLEGROUND — ground-plan projected sword field =====
      {
        const W = w, H = h;
        const hY = H; // sky covers 100%

        // === SKY + SUN + CLOUDS (from cloud-demo) ===
        const sunX = W * 0.5, sunY = H * 0.3;
        const sunR = H * 0.09;

        // Sky — warm sunset gradient from ground-background.jsx
        if (!skyCache || skyCache.width !== W || skyCache.height !== H || !skyCache._v10) {
          skyCache = document.createElement('canvas'); skyCache.width = W; skyCache.height = H;
          const sc = skyCache.getContext('2d');
          // Base vertical gradient — dramatic dark sky
          const sk = sc.createLinearGradient(0,0,0,H);
          sk.addColorStop(0,"rgb(12,3,2)");sk.addColorStop(0.2,"rgb(15,4,3)");sk.addColorStop(0.4,"rgb(20,6,3)");
          sk.addColorStop(0.6,"rgb(26,8,4)");sk.addColorStop(0.75,"rgb(30,9,4)");sk.addColorStop(0.875,"rgb(38,12,5)");
          sk.addColorStop(0.9375,"rgb(42,14,5)");sk.addColorStop(0.96875,"rgb(58,18,6)");sk.addColorStop(0.98,"rgb(135,42,12)");sk.addColorStop(0.99,"rgb(215,85,22)");sk.addColorStop(1,"rgb(255,145,45)");
          sc.fillStyle=sk;sc.fillRect(0,0,W,H);
          // === SUPERNOVA SUN ===
          // Layer 1: Far-reaching atmospheric bloom — deep orange
          const sg0=sc.createRadialGradient(sunX,sunY,0,sunX,sunY,Math.max(W,H)*0.7);
          sg0.addColorStop(0,"rgba(255,130,35,0.6)");sg0.addColorStop(0.03,"rgba(255,100,25,0.45)");sg0.addColorStop(0.08,"rgba(240,70,15,0.28)");sg0.addColorStop(0.15,"rgba(190,45,8,0.15)");sg0.addColorStop(0.25,"rgba(120,25,4,0.07)");sg0.addColorStop(0.4,"rgba(50,8,2,0.03)");sg0.addColorStop(0.6,"rgba(15,2,0,0.01)");sg0.addColorStop(1,"rgba(2,0,0,0)");
          sc.fillStyle=sg0;sc.fillRect(0,0,W,H);
          // Layer 2: Intense mid corona — orange fire ring
          const sg1=sc.createRadialGradient(sunX,sunY,sunR*0.3,sunX,sunY,H*0.32);
          sg1.addColorStop(0,"rgba(255,170,70,0.9)");sg1.addColorStop(0.06,"rgba(255,130,40,0.75)");sg1.addColorStop(0.15,"rgba(255,95,22,0.5)");sg1.addColorStop(0.3,"rgba(220,60,10,0.25)");sg1.addColorStop(0.5,"rgba(155,32,5,0.1)");sg1.addColorStop(0.75,"rgba(75,12,2,0.03)");sg1.addColorStop(1,"rgba(20,3,0,0)");
          sc.fillStyle=sg1;sc.fillRect(0,0,W,H);
          // Layer 3: Hot plasma shell — gives corona visible edge/structure
          const sg2=sc.createRadialGradient(sunX,sunY,sunR*0.5,sunX,sunY,sunR*3.5);
          sg2.addColorStop(0,"rgba(255,200,130,0.95)");sg2.addColorStop(0.12,"rgba(255,170,85,0.8)");sg2.addColorStop(0.25,"rgba(255,135,50,0.55)");sg2.addColorStop(0.4,"rgba(255,100,30,0.3)");sg2.addColorStop(0.6,"rgba(210,65,12,0.12)");sg2.addColorStop(0.8,"rgba(145,35,6,0.04)");sg2.addColorStop(1,"rgba(75,15,2,0)");
          sc.fillStyle=sg2;sc.fillRect(0,0,W,H);
          // Layer 4: Overblown white-hot disc core — warm white to orange edge
          const sd = sc.createRadialGradient(sunX,sunY,0,sunX,sunY,sunR*1.2);
          sd.addColorStop(0,"rgba(255,252,245,1)");sd.addColorStop(0.2,"rgba(255,245,225,1)");sd.addColorStop(0.45,"rgba(255,220,160,0.95)");sd.addColorStop(0.65,"rgba(255,185,100,0.7)");sd.addColorStop(0.8,"rgba(255,150,55,0.35)");sd.addColorStop(1,"rgba(255,120,30,0)");
          sc.fillStyle=sd;sc.beginPath();sc.arc(sunX,sunY,sunR*1.2,0,Math.PI*2);sc.fill();
          // Layer 5: Nuance — slight asymmetric flare (plasma tendril feel)
          sc.save();sc.globalCompositeOperation='lighter';
          for(let fi=0;fi<5;fi++){
            const fAng=Math.PI*0.25+fi*Math.PI*0.38,fLen=sunR*(2.2+fi*0.4),fW=sunR*(0.35+fi*0.1);
            const fx2=sunX+Math.cos(fAng)*fLen*0.3,fy2=sunY+Math.sin(fAng)*fLen*0.3;
            const fg2=sc.createRadialGradient(fx2,fy2,0,fx2,fy2,fLen);
            const fA=0.08-fi*0.012;
            fg2.addColorStop(0,'rgba(255,175,80,'+fA+')');fg2.addColorStop(0.3,'rgba(255,120,35,'+(fA*0.6)+')');fg2.addColorStop(0.7,'rgba(195,60,10,'+(fA*0.2)+')');fg2.addColorStop(1,'rgba(95,22,3,0)');
            sc.save();sc.translate(fx2,fy2);sc.rotate(fAng);sc.scale(1,fW/fLen);sc.translate(-fx2,-fy2);
            sc.fillStyle=fg2;sc.beginPath();sc.arc(fx2,fy2,fLen,0,Math.PI*2);sc.fill();sc.restore();
          }
          sc.restore();
          // Horizontal sun flare streaks — anamorphic lens effect
          sc.save(); sc.globalCompositeOperation = 'lighter';
          for (var _hfi = 0; _hfi < 3; _hfi++) {
            var _hfW = W * (0.6 + _hfi * 0.25);
            var _hfH = sunR * (0.08 - _hfi * 0.02);
            var _hfA = 0.18 - _hfi * 0.05;
            var _hfGrad = sc.createLinearGradient(sunX - _hfW, sunY, sunX + _hfW, sunY);
            _hfGrad.addColorStop(0, 'rgba(255,100,20,0)');
            _hfGrad.addColorStop(0.3, 'rgba(255,130,40,' + (_hfA * 0.4) + ')');
            _hfGrad.addColorStop(0.45, 'rgba(255,170,70,' + _hfA + ')');
            _hfGrad.addColorStop(0.5, 'rgba(255,210,130,' + (_hfA * 1.3) + ')');
            _hfGrad.addColorStop(0.55, 'rgba(255,170,70,' + _hfA + ')');
            _hfGrad.addColorStop(0.7, 'rgba(255,130,40,' + (_hfA * 0.4) + ')');
            _hfGrad.addColorStop(1, 'rgba(255,100,20,0)');
            sc.fillStyle = _hfGrad;
            sc.fillRect(sunX - _hfW, sunY - _hfH * 0.5 + _hfi * sunR * 0.15, _hfW * 2, _hfH);
          }
          sc.restore();
          // Horizon haze band — warm glow at horizon
          const hz=sc.createLinearGradient(0,H*0.88,0,H);
          hz.addColorStop(0,"rgba(200,60,12,0)");hz.addColorStop(0.3,"rgba(220,75,18,0.08)");hz.addColorStop(0.6,"rgba(240,95,22,0.14)");hz.addColorStop(1,"rgba(250,115,30,0.2)");
          sc.fillStyle=hz;sc.fillRect(0,H*0.88,W,H*0.12);
          // Edge vignette on sky — darken corners/edges
          const vig=sc.createRadialGradient(sunX,sunY,H*0.15,sunX,sunY,Math.max(W,H)*0.85);
          vig.addColorStop(0,"rgba(0,0,0,0)");vig.addColorStop(0.35,"rgba(0,0,0,0)");vig.addColorStop(0.55,"rgba(2,1,0,0.15)");vig.addColorStop(0.7,"rgba(2,1,0,0.35)");vig.addColorStop(0.85,"rgba(1,0,0,0.55)");vig.addColorStop(1,"rgba(0,0,0,0.72)");
          sc.fillStyle=vig;sc.fillRect(0,0,W,H);
          // === STATIC ORANGE LIGHTNING across the sky ===
          // Seeded RNG for deterministic bolts
          let _ls = 91827364;
          const lRng = () => { _ls = (_ls * 1103515245 + 12345) & 0x7fffffff; return _ls / 0x7fffffff; };
          // Generate jagged bolt path from start to end
          function boltPath(sc2, x0, y0, x1, y1, depth, maxD) {
            if (depth >= maxD) {
              sc2.lineTo(x1, y1);
              return;
            }
            const mx = (x0 + x1) / 2, my = (y0 + y1) / 2;
            const dx = x1 - x0, dy = y1 - y0;
            const len = Math.sqrt(dx * dx + dy * dy);
            const jitter = len * (0.15 + depth * 0.05);
            const ox = mx + (lRng() - 0.5) * jitter;
            const oy = my + (lRng() - 0.5) * jitter;
            boltPath(sc2, x0, y0, ox, oy, depth + 1, maxD);
            // Branch chance on early subdivisions
            if (depth < maxD - 1 && lRng() < 0.35) {
              const bAng = (lRng() - 0.5) * 1.2;
              const bLen = len * (0.25 + lRng() * 0.3);
              const bx = ox + Math.cos(bAng + Math.atan2(dy, dx)) * bLen;
              const by = oy + Math.sin(bAng + Math.atan2(dy, dx)) * bLen;
              sc.save();
              sc.beginPath();
              sc.moveTo(ox, oy);
              boltPath(sc, ox, oy, bx, by, depth + 1, maxD);
              sc.globalAlpha *= 0.5;
              sc.stroke();
              sc.restore();
            }
            boltPath(sc2, ox, oy, x1, y1, depth + 1, maxD);
          }
          // Draw 5-7 bolts across the upper sky
          const nBolts = 5 + Math.floor(lRng() * 3);
          sc.save();
          sc.lineCap = 'round';
          sc.lineJoin = 'round';
          for (let bi = 0; bi < nBolts; bi++) {
            const sx = lRng() * W;
            const sy = lRng() * H * 0.45;
            const ang = (lRng() - 0.5) * 1.5 + Math.PI * 0.5;
            const bLen = H * (0.15 + lRng() * 0.35);
            const ex = sx + Math.cos(ang) * bLen;
            const ey = sy + Math.sin(ang) * bLen;
            // Outer glow
            sc.globalAlpha = 0.12 + lRng() * 0.08;
            sc.strokeStyle = 'rgb(255,140,40)';
            sc.lineWidth = 6 + lRng() * 4;
            sc.filter = 'blur(4px)';
            sc.beginPath();
            sc.moveTo(sx, sy);
            _ls = 91827364 + bi * 77777; // reset per bolt for reproducibility
            // re-seed for this bolt
            const bSeed = 91827364 + bi * 77777;
            _ls = bSeed;
            boltPath(sc, sx, sy, ex, ey, 0, 5);
            sc.stroke();
            // Mid glow
            sc.globalAlpha = 0.2 + lRng() * 0.1;
            sc.strokeStyle = 'rgb(255,180,80)';
            sc.lineWidth = 2.5;
            sc.filter = 'blur(2px)';
            sc.beginPath();
            sc.moveTo(sx, sy);
            _ls = bSeed;
            boltPath(sc, sx, sy, ex, ey, 0, 5);
            sc.stroke();
            // Core — bright white-orange
            sc.globalAlpha = 0.35 + lRng() * 0.15;
            sc.strokeStyle = 'rgb(255,225,180)';
            sc.lineWidth = 1;
            sc.filter = 'none';
            sc.beginPath();
            sc.moveTo(sx, sy);
            _ls = bSeed;
            boltPath(sc, sx, sy, ex, ey, 0, 5);
            sc.stroke();
          }
          sc.restore();
          skyCache._v10 = true;
        }
        ctx.drawImage(skyCache, 0, 0);

        // === LIVE CLOUD RENDERING ===
        if (!sceneClouds && !cloudBuildPending) {
          cloudBuildPending = true;
          setTimeout(() => { sceneClouds = buildCloudsForScene(W, H); }, 0);
        }
        if (sceneClouds) {
        cloudTime += honourInterval;
        // Refresh a few cloud shapes
        const rPerF = 2;
        for (let ri = 0; ri < rPerF; ri++) { refreshCloud(sceneClouds[(cloudRefreshIdx + ri) % sceneClouds.length], cloudTime, sunX, sunY); }
        cloudRefreshIdx = (cloudRefreshIdx + rPerF) % sceneClouds.length;
        // Draw clouds interleaved with god rays by depth
        // Back clouds (depth < 0.5) → god rays → front clouds (depth >= 0.5)
        function drawCloudRange(startIdx, endIdx) {
          for (let di = startIdx; di < endIdx; di++) {
            const cloud = sceneClouds[di], rawAng = cloud.orbitSpeed * 0.025, angSpeed = Math.max(0.3 / Math.max(50, cloud.orbitDist), rawAng);
            cloud.angle += angSpeed;
            const ca = cloud.angle, flatR2 = cloud.orbitFlatten || 0.7;
            const cx2 = cloud.sunX + Math.cos(ca) * cloud.orbitDist;
            const cy2 = cloud.sunY + Math.sin(ca) * cloud.orbitDist * flatR2;
            const bk = cloud.baked; const bkSrc = bk && (bk.bitmap || bk.canvas); if (!bkSrc) continue;
            const margin2 = Math.max(bk.w, bk.h) * 1.5;
            if (cx2 + bk.ox > W + margin2 || cx2 + bk.ox + bk.w < -margin2 || cy2 + bk.oy > H + margin2 || cy2 + bk.oy + bk.h < -margin2) continue;
            const vx = -Math.sin(ca) * cloud.orbitDist * angSpeed, vy = Math.cos(ca) * cloud.orbitDist * flatR2 * angSpeed;
            const speed = Math.sqrt(vx * vx + vy * vy);
            const drawW = bk.w, drawH = bk.h;
            if (speed > 0.01) {
              const stretchAmt = 1 + Math.min(1.2, speed * 0.5), squeezeAmt = 1 / Math.sqrt(stretchAmt);
              const centSkew = Math.max(-0.5, Math.min(0.5, angSpeed * cloud.orbitDist * 0.001));
              const vAngle = Math.atan2(vy, vx);
              const ccx = cx2 + bk.ox + drawW * 0.5, ccy = cy2 + bk.oy + drawH * 0.5;
              ctx.save(); ctx.translate(ccx, ccy); ctx.rotate(vAngle);
              ctx.transform(stretchAmt, centSkew, 0, squeezeAmt, 0, 0);
              ctx.rotate(-vAngle); ctx.drawImage(bkSrc, -drawW * 0.5, -drawH * 0.5, drawW, drawH); ctx.restore();
            } else {
              ctx.drawImage(bkSrc, cx2 + bk.ox, cy2 + bk.oy, drawW, drawH);
            }
          }
        }
        // Interleave clouds and rays at multiple depth layers
        // ray<cloud<ray<cloud<ray pattern
        const depthCuts = [0.3, 0.6]; // 3 cloud layers, rays between each
        const splits = [0, 0, sceneClouds.length];
        for (let di = 0; di < sceneClouds.length; di++) {
          if (splits[1] === 0 && sceneClouds[di].depth >= depthCuts[0]) splits[1] = di;
          if (sceneClouds[di].depth >= depthCuts[1]) { splits[2] = di; break; }
        }
        // Ray drawing function — geometry + gradients cached
        if (!sceneClouds._rayCache) {
          const rCount = 12;
          const rCenter = Math.PI * 0.5, rSpread = Math.PI * 0.55;
          const _rayData = [];
          for (let ri2 = 0; ri2 < rCount; ri2++) {
            const rRng = seededRandom(ri2 * 777 + 42);
            const t2 = (ri2 + rRng() * 0.6 - 0.3) / (rCount - 1);
            const rAng = rCenter - rSpread * 0.5 + t2 * rSpread;
            const rLen = (H - sunY) * (1.0 + rRng() * 0.3);
            const rW2 = sunR * (0.15 + rRng() * 0.45);
            const rex = sunX + Math.cos(rAng) * rLen;
            const rey = sunY + Math.sin(rAng) * rLen;
            const rBaseA = 0.35 + rRng() * 0.2;
            const rpx = -Math.sin(rAng), rpy = Math.cos(rAng);
            // Pre-build gradients for each alphaScale this ray is used with
            const group = ri2 % 3;
            const alphaScale = group === 0 ? 0.6 : group === 1 ? 1.0 : 0.5;
            const rA = rBaseA * alphaScale;
            const rG = ctx.createLinearGradient(sunX, sunY, rex, rey);
            rG.addColorStop(0, 'rgba(255,252,210,' + (rA * 0.25) + ')');
            rG.addColorStop(0.1, 'rgba(255,248,185,' + (rA * 0.5) + ')');
            rG.addColorStop(0.25, 'rgba(255,242,165,' + (rA * 0.85) + ')');
            rG.addColorStop(0.45, 'rgba(255,235,145,' + (rA * 1.1) + ')');
            rG.addColorStop(0.65, 'rgba(255,225,125,' + (rA * 0.8) + ')');
            rG.addColorStop(0.82, 'rgba(255,215,105,' + (rA * 0.4) + ')');
            rG.addColorStop(1, 'rgba(255,200,85,0)');
            _rayData.push({ group: group, grad: rG,
              x0: sunX + rpx * rW2 * 0.1, y0: sunY + rpy * rW2 * 0.1,
              x1: sunX - rpx * rW2 * 0.1, y1: sunY - rpy * rW2 * 0.1,
              x2: rex - rpx * rW2 * 2.2, y2: rey - rpy * rW2 * 2.2,
              x3: rex + rpx * rW2 * 2.2, y3: rey + rpy * rW2 * 2.2 });
          }
          sceneClouds._rayCache = _rayData;
          sceneClouds._rayBlur = 'blur(' + Math.max(1, Math.round(H * 0.005)) + 'px)';
        }
        function drawRays(alphaScale, group) {
          ctx.save(); ctx.globalCompositeOperation = 'lighter';
          ctx.filter = sceneClouds._rayBlur;
          const rays = sceneClouds._rayCache;
          for (let ri2 = 0; ri2 < rays.length; ri2++) {
            const r = rays[ri2];
            if (r.group !== group) continue;
            ctx.fillStyle = r.grad;
            ctx.beginPath();
            ctx.moveTo(r.x0, r.y0);
            ctx.lineTo(r.x1, r.y1);
            ctx.lineTo(r.x2, r.y2);
            ctx.lineTo(r.x3, r.y3);
            ctx.closePath(); ctx.fill();
          }
          ctx.restore();
        }
        // Static electricity — slow arcs with branches near clouds (paths cached)
        var _drawSparks = function(startIdx, endIdx) {
          ctx.save();
          ctx.globalCompositeOperation = 'lighter';
          ctx.lineCap = 'round'; ctx.lineJoin = 'round';
          var et = cloudTime * 0.15;
          for (var ei = startIdx; ei < endIdx; ei += 8) {
            var cl1 = sceneClouds[ei];
            if (!cl1 || !cl1.baked || cl1.cloudType < 2) continue;
            var ca1 = cl1.angle, flat1 = cl1.orbitFlatten || 0.7;
            var cx1 = cl1.sunX + Math.cos(ca1) * cl1.orbitDist;
            var cy1 = cl1.sunY + Math.sin(ca1) * cl1.orbitDist * flat1;
            var phase = Math.sin(et * 0.08 + ei * 1.3) * Math.sin(et * 0.05 + ei * 0.9);
            if (phase < 0.5) continue;
            var alpha = (phase - 0.5) * 1.5;
            var bw = cl1.baked.w, bh = cl1.baked.h;
            var ox = cx1 + cl1.baked.ox + bw * 0.5;
            var oy = cy1 + cl1.baked.oy + bh * 0.5;
            var seedT = Math.floor(et * 0.15 + ei * 0.1);
            // Cache path offsets on cloud — recompute only when seedT changes
            if (!cl1._sparkCache || cl1._sparkSeedT !== seedT) {
              var arcLen = Math.max(bw, bh) * (0.5 + Math.sin(ei * 3.7) * 0.2);
              var _es = (ei * 1640531527 + seedT * 9973) | 0;
              var eRng = function() { _es = Math.imul(_es ^ (_es >>> 16), 0x45d9f3b); _es = _es ^ (_es >>> 13); return ((_es >>> 0) % 1000) / 1000; };
              var mainDir = eRng() * Math.PI * 2;
              var dx0 = (eRng() - 0.5) * bw * 0.5, dy0 = (eRng() - 0.5) * bh * 0.4;
              var nSeg = 6 + (ei % 4);
              var segLen = arcLen / nSeg;
              var offx = [dx0], offy = [dy0];
              var curDir = mainDir;
              for (var si = 1; si <= nSeg; si++) {
                curDir += (eRng() - 0.5) * 1.4;
                offx.push(offx[si - 1] + Math.cos(curDir) * segLen + (eRng() - 0.5) * segLen * 0.5);
                offy.push(offy[si - 1] + Math.sin(curDir) * segLen + (eRng() - 0.5) * segLen * 0.4);
              }
              var branches = [];
              var nBranch = 2 + (ei % 2);
              for (var bi = 0; bi < nBranch; bi++) {
                var brIdx = 1 + Math.floor(eRng() * (offx.length - 2));
                var brAng = eRng() * Math.PI * 2;
                var brLen = arcLen * (0.2 + eRng() * 0.3);
                var brSegs = 3 + (bi % 2);
                var brSegLen = brLen / brSegs;
                var bCurDir = brAng;
                var bOffx = [offx[brIdx]], bOffy = [offy[brIdx]];
                for (var bsi = 1; bsi <= brSegs; bsi++) {
                  bCurDir += (eRng() - 0.5) * 1.2;
                  bOffx.push(bOffx[bsi - 1] + Math.cos(bCurDir) * brSegLen + (eRng() - 0.5) * brSegLen * 0.4);
                  bOffy.push(bOffy[bsi - 1] + Math.sin(bCurDir) * brSegLen + (eRng() - 0.5) * brSegLen * 0.3);
                }
                branches.push({ x: bOffx, y: bOffy });
              }
              cl1._sparkCache = { ox: offx, oy: offy, br: branches };
              cl1._sparkSeedT = seedT;
            }
            var sc = cl1._sparkCache;
            // Draw main arc
            ctx.beginPath();
            ctx.moveTo(ox + sc.ox[0], oy + sc.oy[0]);
            for (var mi = 1; mi < sc.ox.length; mi++) ctx.lineTo(ox + sc.ox[mi], oy + sc.oy[mi]);
            ctx.strokeStyle = 'rgba(255,100,10,' + (alpha * 0.22) + ')';
            ctx.lineWidth = 5; ctx.stroke();
            ctx.strokeStyle = 'rgba(255,140,30,' + (alpha * 0.4) + ')';
            ctx.lineWidth = 2.5; ctx.stroke();
            ctx.strokeStyle = 'rgba(255,190,90,' + (alpha * 0.6) + ')';
            ctx.lineWidth = 0.8; ctx.stroke();
            // Draw branches
            for (var bi2 = 0; bi2 < sc.br.length; bi2++) {
              var br = sc.br[bi2];
              ctx.beginPath();
              ctx.moveTo(ox + br.x[0], oy + br.y[0]);
              for (var bsi2 = 1; bsi2 < br.x.length; bsi2++) ctx.lineTo(ox + br.x[bsi2], oy + br.y[bsi2]);
              ctx.strokeStyle = 'rgba(255,110,15,' + (alpha * 0.15) + ')';
              ctx.lineWidth = 3; ctx.stroke();
              ctx.strokeStyle = 'rgba(255,170,60,' + (alpha * 0.4) + ')';
              ctx.lineWidth = 0.6; ctx.stroke();
            }
          }
          ctx.restore();
        };

        // Layer 0: rays group 0 behind all clouds (4 rays)
        drawRays(0.6, 0);
        // Layer 1: back clouds
        drawCloudRange(0, splits[1]);
        _drawSparks(0, splits[1]);
        // Layer 2: rays group 1 between cloud layers (4 rays)
        drawRays(1.0, 1);
        // Layer 3: mid clouds
        drawCloudRange(splits[1], splits[2]);
        _drawSparks(splits[1], splits[2]);
        // Layer 4: rays group 2 in front of mid clouds (4 rays)
        drawRays(0.5, 2);
        // Layer 5: front clouds
        drawCloudRange(splits[2], sceneClouds.length);
        _drawSparks(splits[2], sceneClouds.length);
        } // end if (sceneClouds)

        // Dynamic ambient — clouds darken the sky behind them
        // First pass: draw dark shadow under each cloud to occlude the bright sky
        ctx.save();
        ctx.globalCompositeOperation = 'multiply';
        if (sceneClouds) {
          for (let di = 0; di < sceneClouds.length; di++) {
            const cl = sceneClouds[di];
            // Skip fume and small — too transparent to occlude light
            if (cl.cloudType <= 1) continue;
            const bk = cl.baked; if (!bk) continue;
            const ca = cl.angle, flatR = cl.orbitFlatten || 0.7;
            const clx = cl.sunX + Math.cos(ca) * cl.orbitDist;
            const cly = cl.sunY + Math.sin(ca) * cl.orbitDist * flatR;
            const m2 = Math.max(bk.w, bk.h) * 2;
            if (clx + bk.ox > W + m2 || clx + bk.ox + bk.w < -m2 || cly + bk.oy > H + m2 || cly + bk.oy + bk.h < -m2) continue;
            const shadowR = Math.max(bk.w, bk.h) * 0.5;
            const cx3 = clx + bk.ox + bk.w * 0.5;
            const cy3 = cly + bk.oy + bk.h * 0.5;
            // Only medium and big clouds darken — color strings cached on cloud
            if (!cl._shCol0) {
              const darkness = cl.cloudType >= 3 ? 0.82 : 0.88;
              var _shR = Math.round(darkness * 255);
              var _shG = Math.round(darkness * 240);
              var _shB = Math.round(darkness * 210);
              var _shMidR = Math.round(_shR + (255 - _shR) * 0.6);
              var _shMidG = Math.round(_shG + (248 - _shG) * 0.6);
              var _shMidB = Math.round(_shB + (235 - _shB) * 0.6);
              cl._shCol0 = 'rgb(' + _shR + ',' + _shG + ',' + _shB + ')';
              cl._shCol1 = 'rgb(' + _shMidR + ',' + _shMidG + ',' + _shMidB + ')';
            }
            const shadowGrad = ctx.createRadialGradient(cx3, cy3, 0, cx3, cy3, shadowR);
            shadowGrad.addColorStop(0, cl._shCol0);
            shadowGrad.addColorStop(0.5, cl._shCol1);
            shadowGrad.addColorStop(1, 'rgb(255,250,240)');
            ctx.fillStyle = shadowGrad;
            ctx.beginPath(); ctx.arc(cx3, cy3, shadowR, 0, Math.PI * 2); ctx.fill();
          }
        }
        ctx.restore();

        // Sun lens flare — circles along the sun-to-center axis
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        const flareCX = W * 0.5, flareCY = H * 0.5;
        // Flare axis: from sun through screen center and beyond
        const flareDX = flareCX - sunX, flareDY = flareCY - sunY;
        const flareLen = Math.sqrt(flareDX * flareDX + flareDY * flareDY);
        const flareNX = flareDX / flareLen, flareNY = flareDY / flareLen;
        // Flare elements at different positions along the axis
        const flareElements = [
          { t: 0.3, r: sunR * 0.8, a: 0.025, cr: 255, cg: 220, cb: 140 },
          { t: 0.5, r: sunR * 0.4, a: 0.04, cr: 255, cg: 200, cb: 100 },
          { t: 0.7, r: sunR * 1.2, a: 0.015, cr: 255, cg: 180, cb: 80 },
          { t: 0.9, r: sunR * 0.3, a: 0.05, cr: 255, cg: 240, cb: 180 },
          { t: 1.2, r: sunR * 0.6, a: 0.02, cr: 200, cg: 150, cb: 60 },
          { t: 1.5, r: sunR * 1.5, a: 0.01, cr: 255, cg: 160, cb: 50 },
          { t: 1.8, r: sunR * 0.25, a: 0.04, cr: 255, cg: 255, cb: 200 },
        ];
        for (const fe of flareElements) {
          const fx = sunX + flareNX * flareLen * fe.t;
          const fy = sunY + flareNY * flareLen * fe.t;
          const fg = ctx.createRadialGradient(fx, fy, 0, fx, fy, fe.r);
          fg.addColorStop(0, 'rgba(' + fe.cr + ',' + fe.cg + ',' + fe.cb + ',' + fe.a + ')');
          fg.addColorStop(0.5, 'rgba(' + fe.cr + ',' + fe.cg + ',' + fe.cb + ',' + (fe.a * 0.3) + ')');
          fg.addColorStop(1, 'rgba(' + fe.cr + ',' + fe.cg + ',' + fe.cb + ',0)');
          ctx.fillStyle = fg; ctx.beginPath(); ctx.arc(fx, fy, fe.r, 0, Math.PI * 2); ctx.fill();
        }
        // Anamorphic streak — wide supernova bloom line through sun
        const streakW = W * 0.5;
        const streakGrad = ctx.createLinearGradient(sunX - streakW, sunY, sunX + streakW, sunY);
        streakGrad.addColorStop(0, 'rgba(255,140,40,0)');
        streakGrad.addColorStop(0.2, 'rgba(255,155,55,0.015)');
        streakGrad.addColorStop(0.4, 'rgba(255,175,80,0.05)');
        streakGrad.addColorStop(0.5, 'rgba(255,195,110,0.08)');
        streakGrad.addColorStop(0.6, 'rgba(255,175,80,0.05)');
        streakGrad.addColorStop(0.8, 'rgba(255,155,55,0.015)');
        streakGrad.addColorStop(1, 'rgba(255,140,40,0)');
        ctx.fillStyle = streakGrad;
        ctx.fillRect(sunX - streakW, sunY - sunR * 0.15, streakW * 2, sunR * 0.3);
        // Wider soft bloom streak
        const streakGrad2 = ctx.createLinearGradient(sunX - streakW, sunY, sunX + streakW, sunY);
        streakGrad2.addColorStop(0, 'rgba(255,120,30,0)');
        streakGrad2.addColorStop(0.35, 'rgba(255,140,45,0.02)');
        streakGrad2.addColorStop(0.5, 'rgba(255,165,65,0.035)');
        streakGrad2.addColorStop(0.65, 'rgba(255,140,45,0.02)');
        streakGrad2.addColorStop(1, 'rgba(255,120,30,0)');
        ctx.fillStyle = streakGrad2;
        ctx.fillRect(sunX - streakW, sunY - sunR * 0.6, streakW * 2, sunR * 1.2);
        ctx.restore();

        // Atmospheric haze near horizon
        const hazeY = H * 0.65;
        const haze = ctx.createLinearGradient(0, hazeY, 0, H);
        haze.addColorStop(0, 'rgba(200,90,25,0)');
        haze.addColorStop(0.3, 'rgba(200,90,25,0.08)');
        haze.addColorStop(0.6, 'rgba(180,70,18,0.15)');
        haze.addColorStop(1, 'rgba(150,55,15,0.2)');
        ctx.fillStyle = haze;
        ctx.fillRect(0, hazeY, W, H - hazeY);

        // === FLAT 3D GROUND PLANE (100m × 100m) + 500 SWORDS ===
        const edgeY = H * 0.75; // horizon line — 25% from bottom
        const focal = W * 0.8;

        // Flat ground — no bowl, wy = 0 everywhere
        const camZ = 8;
        const camH = 0.7;
        const groundCurve = 0.008;
        const projX = (wx, wz) => W * 0.5 + wx * focal / (wz - camZ);
        const projY = (wz, wx) => {
          const wy = wx !== undefined ? groundCurve * wx * wx : 0;
          return edgeY + (camH - wy) * focal / (wz - camZ);
        };

        // --- Baked ground from ground-background.jsx ---
        if (!groundCache || groundCache.width !== W || groundCache.height !== H || !groundCache._v4) {
          groundCache = document.createElement('canvas'); groundCache.width = W; groundCache.height = H;
          const gctx = groundCache.getContext('2d');
          const SEED = sceneSeed;
          const groundH = H - edgeY;
          const slx=0.08,sly=-0.5,slz=0.86,sLen=Math.sqrt(slx*slx+sly*sly+slz*slz);
          const snx=slx/sLen,sny=sly/sLen,snz=slz/sLen;
          const gScale=0.85,gW=Math.round(W*gScale),gHt=Math.round(groundH*gScale);
          if(gW>=4&&gHt>=4){
          const gC=document.createElement("canvas");gC.width=gW;gC.height=gHt;
          const gc=gC.getContext("2d"),gImg=gc.createImageData(gW,gHt),gd=gImg.data;
          const hMap=new Float32Array(gW*gHt);
          const feats=[];
          for(let i=0;i<18;i++)feats.push({cx:_bgHash(i*71+100),cy:0.005+_bgHash(i*71+101)*0.06,rx:0.05+_bgHash(i*71+102)*0.12,ry:0.02+_bgHash(i*71+103)*0.035,h:0.25+_bgHash(i*71+104)*0.4});
          for(let i=0;i<15;i++)feats.push({cx:_bgHash(i*61+150),cy:0.05+_bgHash(i*61+151)*0.14,rx:0.04+_bgHash(i*61+152)*0.1,ry:0.025+_bgHash(i*61+153)*0.04,h:0.18+_bgHash(i*61+154)*0.3});
          for(let i=0;i<18;i++)feats.push({cx:_bgHash(i*83+200),cy:0.15+_bgHash(i*83+201)*0.4,rx:0.04+_bgHash(i*83+202)*0.09,ry:0.03+_bgHash(i*83+203)*0.05,h:0.14+_bgHash(i*83+204)*0.28});
          for(let i=0;i<12;i++)feats.push({cx:_bgHash(i*79+250),cy:0.45+_bgHash(i*79+251)*0.35,rx:0.04+_bgHash(i*79+252)*0.08,ry:0.03+_bgHash(i*79+253)*0.05,h:0.1+_bgHash(i*79+254)*0.22});
          for(let i=0;i<12;i++)feats.push({cx:0.04+_bgHash(i*97+300)*0.92,cy:0.03+_bgHash(i*97+301)*0.8,rx:0.018+_bgHash(i*97+302)*0.04,ry:0.012+_bgHash(i*97+303)*0.03,h:-(0.12+_bgHash(i*97+304)*0.22)});
          feats.push({cx:-0.05,cy:0.85,rx:0.2,ry:0.15,h:0.35},{cx:1.05,cy:0.82,rx:0.18,ry:0.18,h:0.3},{cx:0.5,cy:0.22,rx:0.2,ry:0.16,h:-0.1});
          for(let py=0;py<gHt;py++){const ny=py/gHt,ds=0.7+ny*1.2;for(let px=0;px<gW;px++){const nx=px/gW;
            let h=_bgFbm(nx*2.2,ny*1.3,2,SEED+800)*0.4+_bgFbm(nx*4.5,ny*3,2,SEED+200)*0.3*ds+_bgRidged(nx*3.5,ny*2.5,2,SEED+500)*0.18*ds+_bgFbm(nx*9,ny*6,2,SEED+300)*0.1*ds;
            const pb=_bgFbm(nx*35,ny*22,1,SEED+900);if(pb>0.74)h+=(pb-0.74)*0.35*ds;
            const hn=_bgFbm(nx*28,ny*18,1,SEED+1100);if(hn<0.22)h-=(0.22-hn)*0.3*ds;
            for(const f of feats){const dx=(nx-f.cx)/f.rx,dy=(ny-f.cy)/f.ry,d2=dx*dx+dy*dy;if(d2<4){const tt=Math.max(0,1-Math.sqrt(d2)/2);h+=f.h*tt*tt*(3-2*tt);}}
            hMap[py*gW+px]=h;
          }}
          const brushMap=new Float32Array(gW*gHt);
          for(let py=0;py<gHt;py++)for(let px=0;px<gW;px++)brushMap[py*gW+px]=_bgFbm(px/gW*25+py/gHt*2,py/gHt*4,2,SEED+9000);
          // 4-tone shading with warm tones
          for(let py=0;py<gHt;py++){const dT=py/gHt,dC=Math.pow(dT,0.5);
            const contrast=0.7+dT*0.3,warmShift=(1-dT)*38,baseVal=40+dC*90;
            // Ground matching sky — muted warm brown, less orange
            const t0r=baseVal*0.28+warmShift*0.14, t0g=baseVal*0.18+warmShift*0.09, t0b=baseVal*0.13+warmShift*0.06;
            const t1r=baseVal*0.45+warmShift*0.24, t1g=baseVal*0.33+warmShift*0.15, t1b=baseVal*0.24+warmShift*0.10;
            // Mid-tone: warm brown
            const tmR=baseVal*0.70+warmShift*0.40, tmG=baseVal*0.52+warmShift*0.28, tmB=baseVal*0.36+warmShift*0.16;
            // Light tones: muted warm
            const t2r=baseVal*1.10+warmShift*0.65, t2g=baseVal*0.78+warmShift*0.44, t2b=baseVal*0.48+warmShift*0.24;
            const t3r=baseVal*1.45+warmShift*0.85, t3g=baseVal*1.0+warmShift*0.58, t3b=baseVal*0.60+warmShift*0.32;
            const tones=[[t0r,t0g,t0b],[t0r+(t1r-t0r)*contrast,t0g+(t1g-t0g)*contrast,t0b+(t1b-t0b)*contrast],[t0r+(tmR-t0r)*contrast,t0g+(tmG-t0g)*contrast,t0b+(tmB-t0b)*contrast],[t0r+(t2r-t0r)*contrast,t0g+(t2g-t0g)*contrast,t0b+(t2b-t0b)*contrast],[t0r+(t3r-t0r)*contrast,t0g+(t3g-t0g)*contrast,t0b+(t3b-t0b)*contrast]];
            for(let px=0;px<gW;px++){const nx=px/gW;
              const gH3=(x,y)=>hMap[Math.max(0,Math.min(gHt-1,y))*gW+Math.max(0,Math.min(gW-1,x))];
              const bs=6+dT*14,hL=(gH3(px-2,py)+gH3(px-1,py))*0.5,hR=(gH3(px+2,py)+gH3(px+1,py))*0.5;
              const hU=(gH3(px,py-2)+gH3(px,py-1))*0.5,hD=(gH3(px,py+2)+gH3(px,py+1))*0.5;
              const bx2=(hL-hR)*bs,by2=(hU-hD)*bs,bl=Math.sqrt(bx2*bx2+by2*by2+1);
              const rawDot=Math.max(0,(bx2/bl)*snx+(by2/bl)*sny+(1/bl)*snz);
              const shifted=rawDot+(brushMap[py*gW+px]-0.5)*0.1;
              // 5 hard bands: deep shadow / shadow / warm mid / light / highlight
              const ti=shifted>0.72?4:shifted>0.52?3:shifted>0.32?2:shifted>0.14?1:0;
              let rr=tones[ti][0],gg=tones[ti][1],bb=tones[ti][2];
              // Soil variation
              const sA=(_bgFbm(nx*2.8,dT*1.8,2,SEED+1000)-0.5)*2,sB=(_bgFbm(nx*1.5,dT*1.0,2,SEED+2000)-0.5)*2;
              rr+=(sA*3+sB*2.5)*dC;gg+=(sA*1.5+sB*1)*dC;bb+=(sA*-0.5+sB*-0.3)*dC;
              const sc2=_bgFbm(nx*3,dT*2,2,SEED+3000);if(sc2<0.25){const s2=Math.pow((0.25-sc2)/0.25,1.5)*0.12;rr*=(1-s2);gg*=(1-s2);bb*=(1-s2);}
              // Cracks — subtle
              const cn=_bgFbm(nx*10,dT*7,2,SEED+7000),ce=Math.abs(cn-0.5);if(ce<0.01){const cs=(1-ce/0.01);rr=rr*(1-cs*0.3)+tones[0][0]*cs*0.3;gg=gg*(1-cs*0.3)+tones[0][1]*cs*0.3;bb=bb*(1-cs*0.3)+tones[0][2]*cs*0.3;}
              // Curve clip highlight + edges
              const hg2=Math.pow(Math.max(0,1-dT*6),3),scx=Math.exp(-Math.pow((nx-0.5)*2,2));
              rr+=hg2*scx*45;gg+=hg2*scx*28;bb+=hg2*scx*12;
              const eDk=1-Math.pow(Math.abs(nx-0.5)*2,2)*0.1;rr*=eDk;gg*=eDk;bb*=eDk;
              const idx=(py*gW+px)*4;gd[idx]=Math.max(0,Math.min(255,Math.round(rr)));gd[idx+1]=Math.max(0,Math.min(255,Math.round(gg)));gd[idx+2]=Math.max(0,Math.min(255,Math.round(bb)));gd[idx+3]=255;
          }}
          gc.putImageData(gImg,0,0);
          // Ground curve
          const curveH = H * 0.035;
          const groundCurveY2 = (x, noisy) => {
            const base = edgeY - curveH * Math.pow((x / W - 0.5) * 2, 2);
            if (!noisy) return base;
            const ix = x / W;
            const n1 = _bgFbm(ix * 6, 0.5, 3, SEED + 6000) * 12 - 6;
            const n2 = _bgFbm(ix * 15, 0.5, 2, SEED + 6100) * 5 - 2.5;
            const n3 = _bgRidged(ix * 10, 0.5, 2, SEED + 6200) * 4 - 2;
            return base + n1 + n2 + n3;
          };
          // Draw ground clipped to curve
          gctx.save();
          gctx.beginPath();
          for (let i2 = 0; i2 <= 200; i2++) { const x2 = (i2 / 200) * W; gctx.lineTo(x2, groundCurveY2(x2, true)); }
          gctx.lineTo(W, H); gctx.lineTo(0, H); gctx.closePath(); gctx.clip();
          gctx.imageSmoothingEnabled=true;gctx.drawImage(gC, 0, edgeY - curveH, W, groundH + curveH);
          // Edge detection overlay
          const eC2=document.createElement("canvas");eC2.width=gW;eC2.height=gHt;const ec2=eC2.getContext("2d"),eImg2=ec2.createImageData(gW,gHt),ed2=eImg2.data;
          for(let py=1;py<gHt-1;py++){for(let px=1;px<gW-1;px++){const getL=(x,y)=>{const i2=(y*gW+x)*4;return gd[i2]*0.3+gd[i2+1]*0.59+gd[i2+2]*0.11;};const gx2=getL(px+1,py)-getL(px-1,py),gy2=getL(px,py+1)-getL(px,py-1),edge=Math.sqrt(gx2*gx2+gy2*gy2),dT2=py/gHt,threshold=6+dT2*10;if(edge>threshold){const strength=Math.min(1,(edge-threshold)/(threshold*0.7)),a=Math.round(strength*22*(0.3+dT2*0.7)),idx2=(py*gW+px)*4;ed2[idx2]=10;ed2[idx2+1]=8;ed2[idx2+2]=6;ed2[idx2+3]=a;}}}
          ec2.putImageData(eImg2,0,0);gctx.imageSmoothingEnabled=true;gctx.drawImage(eC2, 0, edgeY - curveH, W, groundH + curveH);
          // Top texture — sample from mid rows
          const topRows = Math.min(Math.round(gHt * 0.35), gHt);
          const srcOffset = Math.round(gHt * 0.3);
          const tpC2 = document.createElement("canvas"); tpC2.width = gW; tpC2.height = topRows;
          const tpc2 = tpC2.getContext("2d"), tpImg2 = tpc2.createImageData(gW, topRows), tpd2 = tpImg2.data;
          for (let py = 0; py < topRows; py++) {
            const fade = 1 - Math.pow(py / topRows, 1.5);
            const srcY = Math.min(gHt - 1, srcOffset + py);
            for (let px = 0; px < gW; px++) {
              const srcIdx = (srcY * gW + px) * 4;
              const dstIdx = (py * gW + px) * 4;
              let pr = gd[srcIdx], pg2 = gd[srcIdx+1], pb2 = gd[srcIdx+2];
              const ea = ed2[srcIdx+3] / 255;
              if (ea > 0) { pr = pr * (1 - ea) + ed2[srcIdx] * ea; pg2 = pg2 * (1 - ea) + ed2[srcIdx+1] * ea; pb2 = pb2 * (1 - ea) + ed2[srcIdx+2] * ea; }
              tpd2[dstIdx] = Math.round(pr); tpd2[dstIdx+1] = Math.round(pg2); tpd2[dstIdx+2] = Math.round(pb2); tpd2[dstIdx+3] = Math.round(fade * 220);
            }
          }
          tpc2.putImageData(tpImg2, 0, 0);
          gctx.imageSmoothingEnabled = true;
          gctx.drawImage(tpC2, 0, edgeY - curveH, W, Math.round(groundH * 0.35));
          gctx.restore();
          // Ground shade + amber multiply
          gctx.save();
          gctx.beginPath();
          for (let i2 = 0; i2 <= 200; i2++) { const x2 = (i2 / 200) * W; gctx.lineTo(x2, groundCurveY2(x2, true)); }
          gctx.lineTo(W, H); gctx.lineTo(0, H); gctx.closePath(); gctx.clip();
          const gShade=gctx.createLinearGradient(0,edgeY-curveH,0,edgeY+groundH);
          gShade.addColorStop(0,"rgba(25,12,4,0.0)");gShade.addColorStop(0.5,"rgba(20,10,3,0.03)");gShade.addColorStop(1,"rgba(12,5,2,0.08)");
          gctx.fillStyle=gShade;gctx.fillRect(0,edgeY-curveH,W,groundH+curveH);
          gctx.globalCompositeOperation="multiply";
          const amberShade=gctx.createLinearGradient(0,edgeY-curveH,0,edgeY+groundH);
          amberShade.addColorStop(0,"rgba(225,190,150,1)");amberShade.addColorStop(0.3,"rgba(210,175,130,1)");amberShade.addColorStop(0.7,"rgba(190,155,110,1)");amberShade.addColorStop(1,"rgba(170,140,95,1)");
          gctx.fillStyle=amberShade;gctx.fillRect(0,edgeY-curveH,W,groundH+curveH);
          gctx.restore();
          } // end if gW>=4&&gHt>=4
          groundCache._v4 = true;
        }
        ctx.drawImage(groundCache, 0, 0);

        // (floor electricity moved below swords)

        // === EMBER/SPARK PARTICLE SYSTEM from ground-background.jsx ===
        if (!honourParticles) {
          const _createParticle = (pW, pH, seed, type) => {
            const s = seed;
            const p = {
              type,
              x: _bgHash(s) * pW, y: pH * 0.15 + _bgHash(s+1) * pH * 0.83,
              vx: 0.5 + _bgHash(s+2) * 1.2,
              vy: -(0.4 + _bgHash(s+3) * 1.0),
              rot: _bgHash(s+4) * Math.PI * 2,
              rotSpeed: (_bgHash(s+5) - 0.5) * 0.07,
              wobbleAmp: 0.5 + _bgHash(s+6) * 1.4,
              wobbleFreq: 0.7 + _bgHash(s+7) * 2.0,
              wobblePhase: _bgHash(s+8) * Math.PI * 2,
              wobbleAmp2: 0.3 + _bgHash(s+17) * 0.8,
              wobbleFreq2: 0.4 + _bgHash(s+18) * 1.3,
              wobblePhase2: _bgHash(s+19) * Math.PI * 2,
              life: 0,
              maxLife: 400 + _bgHash(s+9) * 600,
              baseSize: 0,
              intensity: 0.4 + _bgHash(s+10) * 0.6,
              hueShift: (_bgHash(s+11) - 0.5) * 25,
              shape: [],
              fragments: [],
              disintegrateAt: 0,
            };
            if (type === 0) {
              p.baseSize = 10 + _bgHash(s+12) * 20; p.vy *= 0.7; p.curl = (_bgHash(s+14) - 0.5) * 0.45;
              p.disintegrateAt = 0.45 + _bgHash(s+15) * 0.25;
              const fragCount = 4 + Math.floor(_bgHash(s+16) * 5);
              for (let f = 0; f < fragCount; f++) p.fragments.push({ offX: (_bgHash(s+f*7+40)-0.5) * p.baseSize * 0.7, offY: (_bgHash(s+f*7+41)-0.5) * p.baseSize * 0.5, vx: 0.2 + _bgHash(s+f*7+42) * 0.5, vy: -(0.1 + _bgHash(s+f*7+43) * 0.3), size: 2.5 + _bgHash(s+f*7+44) * 5, rot: _bgHash(s+f*7+45) * Math.PI * 2, delay: _bgHash(s+f*7+46) * 0.3, active: false, x: 0, y: 0 });
            } else if (type === 1) {
              p.baseSize = 10 + _bgHash(s+12) * 22; p.vx *= 1.1;
              p.disintegrateAt = 0.5 + _bgHash(s+15) * 0.25;
              const fragCount = 2 + Math.floor(_bgHash(s+16) * 3);
              for (let f = 0; f < fragCount; f++) p.fragments.push({ offX: (_bgHash(s+f*7+40)-0.5) * p.baseSize, offY: (_bgHash(s+f*7+41)-0.5) * p.baseSize * 0.5, vx: 0.15 + _bgHash(s+f*7+42) * 0.4, vy: -(0.05 + _bgHash(s+f*7+43) * 0.2), size: 1.5 + _bgHash(s+f*7+44) * 3.5, rot: _bgHash(s+f*7+45) * Math.PI * 2, delay: _bgHash(s+f*7+46) * 0.25, active: false, x: 0, y: 0 });
            } else if (type === 2) {
              p.baseSize = 5 + _bgHash(s+12) * 12; p.vx *= 1.5; p.vy *= 1.5;
              p.disintegrateAt = 0.6 + _bgHash(s+15) * 0.2;
            } else {
              const sizeRoll = _bgHash(s+12);
              p.baseSize = sizeRoll < 0.12 ? (14 + _bgHash(s+13) * 8) : sizeRoll < 0.35 ? (5 + _bgHash(s+13) * 7) : (2 + sizeRoll * 5);
              p.vx *= 1.6 + _bgHash(s+16) * 0.8; p.vy *= 1.5 + _bgHash(s+17) * 0.6; p.vx += _bgHash(s+15) * 0.8;
              p.disintegrateAt = 0.65 + _bgHash(s+15) * 0.2;
            }
            if (type === 0) {
              const verts = 5 + Math.floor(_bgHash(s+13) * 4);
              p.aspectW = 0.4 + _bgHash(s+60) * 0.4; p.aspectH = 0.25 + _bgHash(s+61) * 0.3;
              for (let v = 0; v < verts; v++) p.shape.push({ a: (Math.PI * 2 / verts) * v + (_bgHash(s + v * 3 + 20) - 0.5) * 0.5, rad: 0.45 + _bgHash(s + v * 3 + 21) * 0.55 });
            } else if (type <= 2) {
              const verts = 3 + Math.floor(_bgHash(s+13) * 3);
              p.aspectW = 0.35; p.aspectH = 0.2;
              for (let v = 0; v < verts; v++) p.shape.push({ a: (Math.PI*2/verts)*v + _bgHash(s+v*3+20)*0.5, rad: 0.4+_bgHash(s+v*3+21)*0.6 });
            } else {
              p.aspectW = 0.3; p.aspectH = 0.3;
              for (let v = 0; v < 3; v++) p.shape.push({ a: (Math.PI*2/3)*v + _bgHash(s+v*3+20)*0.4, rad: 0.5+_bgHash(s+v*3+21)*0.5 });
            }
            // Cache hue-shifted color bases (constant per particle)
            p._cg_base = 235 + p.hueShift * 0.2;
            p._cb_base = 160 + p.hueShift * 0.15;
            p._mg_base = 140 + p.hueShift * 0.3;
            p._og_base = 55 + p.hueShift * 0.2;
            p._ohR_base = 200 + p.hueShift;
            p._scg_base = 200 + p.hueShift * 0.4;
            p._scb_base = 85 + p.hueShift * 0.2;
            p._sog_base = 60 + p.hueShift * 0.2;
            p._soR_base = 230 + p.hueShift;
            p._fR_base = 210 + p.hueShift;
            p._fG_base = 90 + p.hueShift * 0.3;
            return p;
          };
          const _particles = [];
          for (let i2 = 0; i2 < 40; i2++) _particles.push(_createParticle(W, H, i2*97+13000, 1));
          for (let i2 = 0; i2 < 50; i2++) _particles.push(_createParticle(W, H, i2*79+15000, 2));
          for (let i2 = 0; i2 < 70; i2++) _particles.push(_createParticle(W, H, i2*67+17000, 3));
          for (let i2 = 0; i2 < 30; i2++) _particles.push(_createParticle(W, H, i2*53+19000, 3));
          for (const pp of _particles) {
            const stagger = Math.random() * pp.maxLife * 0.8;
            pp.life = stagger; pp.x += pp.vx * stagger; pp.y += pp.vy * stagger;
          }
          honourParticles = _particles;
        }
        // Update and render particles
        {
          const pTime = performance.now() * 0.001;
          const windGustX = Math.sin(pTime * 0.35) * 0.3 + Math.sin(pTime * 0.8 + 2) * 0.15 + Math.sin(pTime * 1.7 + 5) * 0.08;
          const windGustY = Math.sin(pTime * 0.45 + 1) * 0.12 + Math.sin(pTime * 1.1 + 3) * 0.06;
          for (const p of honourParticles) {
            p.life++;
            if (p.life > p.maxLife || p.x < -50 || p.x > W + 50 || p.y < -50) {
              const side = Math.random();
              if (side < 0.30) { p.x = Math.random() * W; p.y = H * 0.55 + Math.random() * H * 0.45; }
              else if (side < 0.40) { p.x = -15 - Math.random() * 30; p.y = H * 0.15 + Math.random() * H * 0.7; }
              else if (side < 0.50) { p.x = W + 15 + Math.random() * 30; p.y = H * 0.15 + Math.random() * H * 0.7; }
              else if (side < 0.60) { p.x = Math.random() * W; p.y = H * 0.8 + Math.random() * H * 0.2; }
              else if (side < 0.70) { p.x = Math.random() * W; p.y = H * 0.12 + Math.random() * H * 0.35; }
              else if (side < 0.90) { p.x = Math.random() * W * 0.45; p.y = Math.random() * H * 0.5; }
              else { p.x = W * 0.6 + Math.random() * W * 0.4; p.y = H * 0.05 + Math.random() * H * 0.45; }
              p.life = 0; p.maxLife = 400 + Math.random() * 600; p.rot = Math.random() * Math.PI * 2;
              for (const f of p.fragments) f.active = false;
              continue;
            }
            const depth = Math.max(0, Math.min(1, p.y / H));
            const depthScale = 0.55 + depth * 0.45;
            const depthAlpha = 0.6 + depth * 0.4;
            const wobbleX = Math.sin(p.life * 0.02 * p.wobbleFreq + p.wobblePhase) * p.wobbleAmp;
            const wobbleY2 = Math.sin(p.life * 0.015 * p.wobbleFreq2 + p.wobblePhase2) * p.wobbleAmp2;
            p.x += (p.vx + wobbleX * 0.4 + windGustX) * depthScale;
            p.y += (p.vy + wobbleY2 * 0.3 + windGustY) * depthScale;
            p.rot += (p.rotSpeed + windGustX * 0.015) * depthScale;
            const lifeT = p.life / p.maxLife;
            const fadeIn = Math.min(1, p.life / 25);
            const fadeOut = Math.min(1, (p.maxLife - p.life) / 40);
            const alpha = fadeIn * fadeOut * depthAlpha;
            if (alpha < 0.01) continue;
            const burnT = lifeT > p.disintegrateAt ? (lifeT - p.disintegrateAt) / (1 - p.disintegrateAt) : 0;
            // Shed fragments
            if (p.fragments.length > 0 && burnT > 0) {
              for (const f of p.fragments) {
                if (burnT > f.delay && !f.active) { f.active = true; f.x = p.x + f.offX; f.y = p.y + f.offY; }
                if (!f.active) continue;
                f.x += f.vx + windGustX * 0.9 + wobbleX * 0.12;
                f.y += f.vy - 0.08 + windGustY * 0.6;
                f.rot += 0.03 + windGustX * 0.01;
                const fragLife = Math.min(1, (burnT - f.delay) / Math.max(0.01, 1 - f.delay));
                const fragAlpha = Math.max(0, 1 - fragLife * 1.2) * alpha;
                const fragSize = f.size * Math.max(0.1, 1 - fragLife * 0.9) * depthScale;
                if (fragAlpha < 0.02 || fragSize < 0.15) continue;
                ctx.save(); ctx.translate(f.x, f.y); ctx.rotate(f.rot);
                ctx.globalCompositeOperation = "lighter";
                const pulse = 0.5 + Math.sin(p.life * 0.08 + f.delay * 12) * 0.5;
                const fragFlicker = 0.7 + Math.sin(p.life * 0.15 + f.delay * 20) * 0.3;
                const fR = Math.round(p._fR_base * p.intensity * pulse);
                const fG = Math.round(p._fG_base * p.intensity * pulse);
                const fB = Math.round(20 * p.intensity * pulse);
                const glR2 = fragSize * (5 + pulse * 2);
                const gl = ctx.createRadialGradient(0,0,0,0,0,glR2);
                gl.addColorStop(0, "rgba("+Math.min(255,fR+30)+","+Math.min(255,fG+25)+","+Math.min(255,fB+15)+","+(fragAlpha*0.7*fragFlicker)+")");
                gl.addColorStop(0.25, "rgba("+fR+","+fG+","+fB+","+(fragAlpha*0.35*fragFlicker)+")");
                gl.addColorStop(0.6, "rgba("+Math.round(fR*0.6)+","+Math.round(fG*0.4)+",0,"+(fragAlpha*0.1)+")");
                gl.addColorStop(1, "rgba("+Math.round(fR*0.3)+",0,0,0)");
                ctx.fillStyle = gl; ctx.beginPath(); ctx.arc(0,0,glR2,0,Math.PI*2); ctx.fill();
                ctx.fillStyle = "rgba("+Math.min(255,fR+40)+","+Math.min(255,fG+20)+","+Math.min(255,fB+8)+","+(fragAlpha*0.8*fragFlicker)+")";
                ctx.beginPath(); ctx.arc(0,0,fragSize*0.6,0,Math.PI*2); ctx.fill();
                ctx.fillStyle = "rgba(255,240,180,"+(fragAlpha*0.6*fragFlicker)+")";
                ctx.beginPath(); ctx.arc(0,0,fragSize*0.2,0,Math.PI*2); ctx.fill();
                ctx.restore();
              }
            }
            ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.globalAlpha = alpha;
            if (p.type <= 2) {
              // Embers — round bokeh glowing dots
              ctx.globalCompositeOperation = "lighter";
              const pulse = 0.5 + Math.sin(p.life * 0.06 + p.wobblePhase) * 0.3 + Math.sin(p.life * 0.13) * 0.2;
              const flicker = 0.7 + Math.sin(p.life * 0.19 + p.wobblePhase * 3) * 0.15 + Math.sin(p.life * 0.31 + p.wobblePhase * 5) * 0.15;
              const dim = 1 - burnT * 0.7;
              const sz = p.baseSize * (1 - burnT * 0.4) * depthScale;
              const depthFocus = 0.6 + (p.y / H) * 0.4;
              const hotness = p.intensity * pulse * flicker;
              const coreR = Math.round(Math.min(255, 255 * hotness));
              const coreG = Math.round(Math.min(255, p._cg_base * hotness));
              const coreB = Math.round(Math.min(255, p._cb_base * hotness));
              const midR = Math.round(Math.min(255, (255 + p.hueShift * 0.5) * hotness));
              const midG = Math.round(Math.min(255, p._mg_base * hotness));
              const midB = Math.round(Math.min(80, 35 * hotness));
              const outerR = Math.round(Math.min(255, p._ohR_base * hotness * 0.7));
              const outerG = Math.round(Math.min(120, p._og_base * hotness * 0.5));
              const outerB = Math.round(8 * hotness * 0.3);
              if (sz > 0.3) {
                const bokehR = sz * (3.0 + (1 - depthFocus) * 3.0) * dim;
                const bk2 = ctx.createRadialGradient(0, 0, 0, 0, 0, bokehR);
                bk2.addColorStop(0, "rgba("+outerR+","+outerG+","+outerB+","+(0.5 * pulse * dim)+")");
                bk2.addColorStop(0.35, "rgba("+outerR+","+outerG+","+outerB+","+(0.2 * pulse * dim)+")");
                bk2.addColorStop(0.7, "rgba("+Math.round(outerR*0.6)+","+Math.round(outerG*0.4)+","+outerB+","+(0.07 * pulse * dim)+")");
                bk2.addColorStop(1, "rgba("+Math.round(outerR*0.3)+","+Math.round(outerG*0.2)+",0,0)");
                ctx.fillStyle = bk2; ctx.beginPath(); ctx.arc(0, 0, bokehR, 0, Math.PI * 2); ctx.fill();
                const midGlowR = sz * 1.4 * dim;
                const mg = ctx.createRadialGradient(0, 0, 0, 0, 0, midGlowR);
                mg.addColorStop(0, "rgba("+midR+","+midG+","+midB+","+(0.7 * pulse * dim)+")");
                mg.addColorStop(0.5, "rgba("+midR+","+midG+","+midB+","+(0.3 * pulse * dim)+")");
                mg.addColorStop(1, "rgba("+outerR+","+outerG+",0,0)");
                ctx.fillStyle = mg; ctx.beginPath(); ctx.arc(0, 0, midGlowR, 0, Math.PI * 2); ctx.fill();
                const coreSize = sz * 0.4 * dim * depthFocus;
                const cg3 = ctx.createRadialGradient(0, 0, 0, 0, 0, coreSize);
                cg3.addColorStop(0, "rgba("+coreR+","+coreG+","+coreB+","+(0.9 * flicker * dim)+")");
                cg3.addColorStop(0.4, "rgba("+midR+","+midG+","+midB+","+(0.5 * flicker * dim)+")");
                cg3.addColorStop(1, "rgba("+midR+","+Math.round(midG*0.5)+",0,0)");
                ctx.fillStyle = cg3; ctx.beginPath(); ctx.arc(0, 0, coreSize, 0, Math.PI * 2); ctx.fill();
                const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
                if (speed > 0.6 && sz > 1) {
                  const trailLen = Math.min(sz * 3.5, speed * 4) * dim;
                  const dx = -p.vx / speed, dy = -p.vy / speed;
                  const tg = ctx.createLinearGradient(0, 0, dx * trailLen, dy * trailLen);
                  tg.addColorStop(0, "rgba("+midR+","+midG+","+midB+","+(0.45 * pulse * dim)+")");
                  tg.addColorStop(0.5, "rgba("+outerR+","+outerG+",0,"+(0.15 * pulse * dim)+")");
                  tg.addColorStop(1, "rgba("+outerR+",0,0,0)");
                  ctx.fillStyle = tg;
                  const tw = sz * 0.35 * dim;
                  ctx.beginPath(); ctx.moveTo(-dy * tw, dx * tw); ctx.lineTo(dy * tw, -dx * tw); ctx.lineTo(dx * trailLen, dy * trailLen); ctx.closePath(); ctx.fill();
                }
              }
            } else {
              // Sparks — bright bokeh dots with motion streaks
              ctx.globalCompositeOperation = "lighter";
              const pulse = 0.5 + Math.sin(p.life * 0.09 + p.wobblePhase) * 0.3 + Math.sin(p.life * 0.17 + p.wobblePhase * 3) * 0.2;
              const rapidFlicker = 0.7 + Math.sin(p.life * 0.37 + p.wobblePhase * 7) * 0.2 + Math.sin(p.life * 0.53) * 0.1;
              const dim = 1 - burnT * 0.8;
              const sz = p.baseSize * dim * depthScale;
              const temp = p.intensity * pulse * rapidFlicker;
              const cr = Math.round(Math.min(255, 255 * temp));
              const cg4 = Math.round(Math.min(255, p._scg_base * temp));
              const cb4 = Math.round(Math.min(140, p._scb_base * temp));
              const outerCr = Math.round(Math.min(255, p._soR_base * temp * 0.7));
              const outerCg = Math.round(Math.min(120, p._sog_base * temp * 0.5));
              if (sz > 0.2) {
                const haloR = sz * (3.5 + (1 - p.y / H) * 2.5);
                const hg3 = ctx.createRadialGradient(0, 0, 0, 0, 0, haloR);
                hg3.addColorStop(0, "rgba("+outerCr+","+outerCg+",8,"+(0.4 * pulse * dim)+")");
                hg3.addColorStop(0.4, "rgba("+outerCr+","+Math.round(outerCg*0.5)+",0,"+(0.15 * pulse * dim)+")");
                hg3.addColorStop(0.75, "rgba("+Math.round(outerCr*0.4)+","+Math.round(outerCg*0.2)+",0,"+(0.04 * pulse * dim)+")");
                hg3.addColorStop(1, "rgba("+Math.round(outerCr*0.2)+",0,0,0)");
                ctx.fillStyle = hg3; ctx.beginPath(); ctx.arc(0, 0, haloR, 0, Math.PI * 2); ctx.fill();
                const coreR2 = sz * 0.5;
                const ccg = ctx.createRadialGradient(0, 0, 0, 0, 0, coreR2);
                ccg.addColorStop(0, "rgba("+cr+","+cg4+","+cb4+","+(0.85 * rapidFlicker * dim)+")");
                ccg.addColorStop(0.4, "rgba("+cr+","+Math.round(cg4*0.7)+","+Math.round(cb4*0.4)+","+(0.4 * rapidFlicker * dim)+")");
                ccg.addColorStop(1, "rgba("+outerCr+","+outerCg+",0,0)");
                ctx.fillStyle = ccg; ctx.beginPath(); ctx.arc(0, 0, coreR2, 0, Math.PI * 2); ctx.fill();
                const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
                if (speed > 0.4) {
                  const dx = -p.vx / speed, dy = -p.vy / speed;
                  const trailLen = Math.min(sz * 5, speed * 3.5) * dim;
                  const tw = sz * 0.25 * dim;
                  const sg4 = ctx.createLinearGradient(0, 0, dx * trailLen, dy * trailLen);
                  sg4.addColorStop(0, "rgba("+cr+","+cg4+","+cb4+","+(0.5 * pulse * dim)+")");
                  sg4.addColorStop(0.4, "rgba("+outerCr+","+outerCg+",0,"+(0.15 * pulse * dim)+")");
                  sg4.addColorStop(1, "rgba("+outerCr+",0,0,0)");
                  ctx.fillStyle = sg4;
                  ctx.beginPath(); ctx.moveTo(-dy * tw, dx * tw); ctx.lineTo(dy * tw, -dx * tw); ctx.lineTo(dx * trailLen, dy * trailLen); ctx.closePath(); ctx.fill();
                }
              }
            }
            ctx.globalAlpha = 1; ctx.restore();
          }
        }

        // --- SWORDS spread equally on 50m × 50m plane, 2m spacing ---
        if (!swordGridCache) {
        const planeSize = 50;
        const baseSpacing = 1;
        const _swords = [];
        let swordIdx = 0;

        // Walk the grid with per-sword spacing variation (0.5 to 2)
        for (let bz = 0; bz < planeSize; ) {
          // 4 density zones from camera (z=8) to far (z=50)
          const zoneT = Math.max(0, (bz - 7) / (planeSize - 7));
          let zoneDensity;
          if (zoneT < 0.125) zoneDensity = 0.2;       // zone 1a: z=7-12.4, tightest
          else {
            // z=12.4→0.75, z=20→0.75, z=30→0.75, z=40→0.95, z=50→1.20
            const zAbs = 7 + zoneT * (planeSize - 7);
            if (zAbs < 30) zoneDensity = 0.75;
            else if (zAbs < 40) zoneDensity = 0.75 + (zAbs - 30) / 10 * (0.95 - 0.75);
            else zoneDensity = 0.95 + (zAbs - 40) / 10 * (1.20 - 0.95);
          }
          const rowSpacingZ = (2.0 + ihash(swordIdx + 7000, sceneSeed) * 6.0) * zoneDensity;
          for (let bx = -planeSize / 2; bx < planeSize / 2; ) {
            const cellSpacingX = (2.0 + ihash(swordIdx + 8000, sceneSeed) * 6.0) * zoneDensity;
            const jx = bx + (ihash(swordIdx, sceneSeed + 101) - 0.5) * cellSpacingX * 0.3;
            const jz = bz + (ihash(swordIdx, sceneSeed + 100) - 0.5) * rowSpacingZ * 0.3 + 0.03;
            swordIdx++;
            bx += cellSpacingX;
            if (jz - camZ < 0.02) continue;  // skip swords too close
            // Halve swords in far zone (z > 25)
            if (jz > 25 && (swordIdx & 1)) continue;

            // Clearing — based on view angle, not absolute X
            const dz = jz - camZ;
            const pathEnd = 12;
            if (dz > 0.5 && dz < pathEnd) {
              const t = (dz - 0.5) / (pathEnd - 0.5);
              const viewAngle = Math.abs(jx) / dz;
              const innerA = 0.2 * (1 - t * t);   // angle threshold narrows with distance
              const fadeA = 0.08 * (1 - t * t);
              const jitter = (ihash(swordIdx, sceneSeed + 888) - 0.5) * 0.05;
              const effectiveA = viewAngle + jitter;
              if (effectiveA < innerA) continue;
              if (effectiveA < innerA + fadeA) {
                const grad = (effectiveA - innerA) / fadeA;
                if (ihash(swordIdx, sceneSeed + 999) > grad) continue;
              }
            }

            // Project to screen + ground curve
            const scrX = projX(jx, jz);
            const scrY = projY(jz, jx);
            if (scrX < -200 || scrX > W + 200 || scrY < -200 || scrY > H + 200) continue;

            const size = 2.8 * focal / (jz - camZ);

            // Curve lean — swords follow the ground curve outward at edges
            const curveLean = -2 * groundCurve * jx * 0.3;

            // Random lean + curve lean
            let lh = (swordIdx * 2654435761 + 4829) | 0; lh = Math.imul(lh ^ (lh >>> 16), 0x119de1f3); lh = Math.imul(lh ^ (lh >>> 13), 0x45d9f3b); lh = lh ^ (lh >>> 16);
            const lean = (((lh >>> 0) / 4294967296) * 2 - 1) * (Math.PI * 33.75 / 180) + curveLean;

            // Y-axis rotation — foreshortens width (cos of angle)
            const yAngle = rng(swordIdx, 606) * Math.PI;  // 0-180°
            const yRot = Math.cos(yAngle);

            _swords.push({ scrX, scrY, size, lean, yRot, yAngle, wz: jz, wx: jx, shuffle: rng(swordIdx, 200), idx: swordIdx });
          }
          bz += rowSpacingZ;
        }

        // Sort back-to-front
        _swords.sort((a, b) => b.wz - a.wz);
        swordGridCache = _swords;
        }
        const swords = swordGridCache;

        for (const s of swords) {
          // Sword type — hash independent of position grid
          let th = (s.idx * 1640531527 + 2747636419) | 0; th = Math.imul(th ^ (th >>> 16), 0x45d9f3b); th = th ^ (th >>> 13);
          const isGladius = ((th >>> 0) % 4) === 0;
          const overall = s.size;
          const bladeH = overall * (90.3 / 114.7);
          const mod = bladeH / 8;
          const bladeW = mod * 0.434;                  // 4.9 cm (transform handles rotation)
          const guardH = bladeW / 3;
          const guardW = mod * 1.772;                  // ~20 cm
          const gripW = bladeW * 2 / 3;
          const gripH = overall * (18.4 / 114.7);
          const pomDia = overall * (5.0 / 114.7);
          const pomRx = pomDia / 2;  // transform handles rotation
          const pomRy = pomDia / 2;            // height stays constant

          ctx.save();
          const gO2 = isGladius ? overall * 0.7 : 0;
          const actualBladeH = isGladius ? gO2 * 0.72 : bladeH;
          const buried = actualBladeH * (0.55 + rng(s.idx, 777) * 0.1);
          ctx.beginPath();
          ctx.rect(0, 0, W, s.scrY);
          ctx.clip();
          var _sFloat = Math.sin(cloudTime * 0.008 + s.idx * 2.3) * 2 * Math.min(1, overall / 100);
          ctx.translate(s.scrX, s.scrY - buried + _sFloat);
          ctx.scale(1, -1);
          ctx.rotate(-s.lean);
          // 3D Y-axis rotation — skew creates perspective effect
          ctx.transform(s._absYRot, 0, s._sinYSkew, 1, 0, 0);

          // 3D-informed lighting — cached on sword object
          if (s._lR === undefined) {
            const sdx2 = s.scrX - sunX, sdy2 = s.scrY - sunY;
            const sunDist2 = Math.sqrt(sdx2 * sdx2 + sdy2 * sdy2);
            const sunProx2 = Math.max(0, 1 - sunDist2 / (Math.max(W, H) * 0.7));
            s._lit = sunProx2 * sunProx2;
            s._leftLight = s.scrX > sunX;
            const faceCatch = 0.4 + Math.sin(s.yAngle) * 0.6;
            s._lightB = (0.25 + s._lit * 0.75) * faceCatch;
            s._darkB = 0.08 + s._lit * 0.12 + (1 - faceCatch) * 0.06;
            s._lR = Math.round(55 + 200 * s._lightB); s._lG = Math.round(35 + 145 * s._lightB); s._lB2 = Math.round(20 + 80 * s._lightB);
            s._dR = Math.round(30 + 75 * s._darkB); s._dG = Math.round(16 + 42 * s._darkB); s._dB = Math.round(8 + 22 * s._darkB);
            s._absYRot = Math.abs(s.yRot); s._sinYSkew = Math.sin(s.yAngle) * 0.15;
            // Pre-build color strings
            s._colLight = 'rgb('+s._lR+','+s._lG+','+s._lB2+')';
            s._colDark = 'rgb('+s._dR+','+s._dG+','+s._dB+')';
            s._ridgeStyle = 'rgba('+Math.min(255,s._lR+80)+','+Math.min(255,s._lG+75)+','+Math.min(255,s._lB2+65)+','+(0.3+s._lit*0.4)+')';
            var _shBr2 = 0.3 + s._lit * 0.4;
            s._shCol = 'rgb('+Math.round(30+180*_shBr2)+','+Math.round(22+130*_shBr2)+','+Math.round(14+60*_shBr2)+')';
            // Guard/grip base colors
            var _gB2 = (s._lightB + s._darkB) * 0.4;
            s._gR3 = Math.round(15 + 165 * _gB2); s._gG3 = Math.round(12 + 113 * _gB2); s._gBl3 = Math.round(10 + 40 * _gB2);
            var _gripBrL2 = _gB2 * 0.6;
            s._grR = Math.round(15 + 100 * _gripBrL2); s._grG = Math.round(12 + 68 * _gripBrL2); s._grBl = Math.round(10 + 24 * _gripBrL2);
          }
          const lit = s._lit, leftLight = s._leftLight, lightB = s._lightB, darkB = s._darkB;
          const lR = s._lR, lG = s._lG, lB2 = s._lB2, dR = s._dR, dG = s._dG, dB = s._dB;

          const tipEnd = -bladeH + pomDia * 2;
          const ov = 1;
          const gripBot = guardH + gripH;

          if (isGladius) {
            // Gladius proportions
            const gO = overall * 0.7;
            const gBL = gO * 0.72, gBW = gO * 0.048;
            const gTaperAt = gBL * 0.65;
            const gGuardR = gBW * 1.15, gGuardTh = gO * 0.015;
            const gGripL = gO * 0.13, gGripW = gBW * 0.9;
            const gPomR = gBW * 0.7, gKnobR = gGripW * 0.3;
            const gTip = -gBL, gBase = 0;
            const gGripTop = gBase + gGuardTh + gGuardR - gGripW * 0.3;
            const gGripBot = gGripTop + gGripL;
            const gPomCY = gGripBot + gPomR * 0.8;
            const gKnobY = gPomCY + gPomR + gKnobR * 0.5;
            const gTaperY = gTip + gBL - gTaperAt;
            const gGB = (lightB + darkB) * 0.4;
            const gGR2 = Math.round(18 + 95 * gGB), gGG2 = Math.round(17 + 88 * gGB), gGBl = Math.round(16 + 70 * gGB);
            const gripBr = 0.05 + lit * 0.08;
            // Blade left — 3D gradient
            const gBlGL = ctx.createLinearGradient(0, 0, -gBW, 0);
            if (leftLight) {
              gBlGL.addColorStop(0, `rgb(${Math.min(255,lR+55)},${Math.min(255,lG+50)},${Math.min(255,lB2+40)})`);
              gBlGL.addColorStop(0.2, `rgb(${lR},${lG},${lB2})`);
              gBlGL.addColorStop(1, `rgb(${Math.max(0,lR-30)},${Math.max(0,lG-25)},${Math.max(0,lB2-20)})`);
            } else {
              gBlGL.addColorStop(0, `rgb(${Math.min(255,dR+25)},${Math.min(255,dG+20)},${Math.min(255,dB+15)})`);
              gBlGL.addColorStop(0.2, `rgb(${dR},${dG},${dB})`);
              gBlGL.addColorStop(1, `rgb(${Math.max(0,dR-8)},${Math.max(0,dG-7)},${Math.max(0,dB-6)})`);
            }
            ctx.fillStyle = gBlGL;
            ctx.beginPath();
            ctx.moveTo(0, gTip);
            ctx.quadraticCurveTo(-gBW * 0.4, gTip + (gBL - gTaperAt) * 0.4, -gBW, gTaperY);
            ctx.quadraticCurveTo(-gBW * 1.08, (gTaperY + gBase) * 0.5, -gBW * 0.95, gBase);
            ctx.lineTo(0, gBase);
            ctx.closePath();
            ctx.fill();
            // Blade right — 3D gradient
            const gBlGR = ctx.createLinearGradient(0, 0, gBW, 0);
            if (leftLight) {
              gBlGR.addColorStop(0, `rgb(${Math.min(255,dR+25)},${Math.min(255,dG+20)},${Math.min(255,dB+15)})`);
              gBlGR.addColorStop(0.2, `rgb(${dR},${dG},${dB})`);
              gBlGR.addColorStop(1, `rgb(${Math.max(0,dR-8)},${Math.max(0,dG-7)},${Math.max(0,dB-6)})`);
            } else {
              gBlGR.addColorStop(0, `rgb(${Math.min(255,lR+55)},${Math.min(255,lG+50)},${Math.min(255,lB2+40)})`);
              gBlGR.addColorStop(0.2, `rgb(${lR},${lG},${lB2})`);
              gBlGR.addColorStop(1, `rgb(${Math.max(0,lR-30)},${Math.max(0,lG-25)},${Math.max(0,lB2-20)})`);
            }
            ctx.fillStyle = gBlGR;
            ctx.beginPath();
            ctx.moveTo(0, gTip);
            ctx.quadraticCurveTo(gBW * 0.4, gTip + (gBL - gTaperAt) * 0.4, gBW, gTaperY);
            ctx.quadraticCurveTo(gBW * 1.08, (gTaperY + gBase) * 0.5, gBW * 0.95, gBase);
            ctx.lineTo(0, gBase);
            ctx.closePath();
            ctx.fill();
            // Center ridge highlight
            ctx.strokeStyle = s._ridgeStyle;
            ctx.lineWidth = Math.max(0.3, gBW * 0.08);
            ctx.beginPath();
            ctx.moveTo(0, gTip + 1);
            ctx.lineTo(0, gBase);
            ctx.stroke();
            // Orange highlight on lit edge
            ctx.save();
            ctx.globalCompositeOperation = 'lighter';
            var _ghlAlpha = 0.12 + lit * 0.2;
            ctx.strokeStyle = 'rgba(255,130,35,' + _ghlAlpha + ')';
            ctx.lineWidth = Math.max(0.5, gBW * 0.2);
            var _ghlX = leftLight ? -gBW : gBW;
            ctx.beginPath();
            ctx.moveTo(0, gTip);
            ctx.quadraticCurveTo(_ghlX * 0.4, gTip + (gBL - gTaperAt) * 0.4, _ghlX, gTaperY);
            ctx.quadraticCurveTo(_ghlX * 1.08, (gTaperY + gBase) * 0.5, _ghlX * 0.95, gBase);
            ctx.stroke();
            ctx.restore();
            // Grip (drawn before guard) — cylindrical gradient
            const gGripGrad = ctx.createLinearGradient(-gGripW, 0, gGripW, 0);
            const gkR = Math.round(20 + 40 * gripBr), gkG = Math.round(12 + 20 * gripBr), gkB = Math.round(8 + 10 * gripBr);
            gGripGrad.addColorStop(0, `rgb(${Math.max(0,gkR-10)},${Math.max(0,gkG-6)},${Math.max(0,gkB-4)})`);
            gGripGrad.addColorStop(0.35, `rgb(${gkR},${gkG},${gkB})`);
            gGripGrad.addColorStop(0.5, `rgb(${Math.min(255,gkR+12)},${Math.min(255,gkG+8)},${Math.min(255,gkB+5)})`);
            gGripGrad.addColorStop(0.65, `rgb(${gkR},${gkG},${gkB})`);
            gGripGrad.addColorStop(1, `rgb(${Math.max(0,gkR-10)},${Math.max(0,gkG-6)},${Math.max(0,gkB-4)})`);
            ctx.fillStyle = gGripGrad;
            ctx.beginPath();
            const gg2 = gGripTop, ggl = gGripL;
            ctx.moveTo(-gGripW * 0.9, gg2);
            ctx.quadraticCurveTo(-gGripW * 0.5, gg2 + ggl * 0.1, -gGripW * 0.85, gg2 + ggl * 0.2);
            ctx.quadraticCurveTo(-gGripW * 1.05, gg2 + ggl * 0.35, -gGripW * 0.6, gg2 + ggl * 0.5);
            ctx.quadraticCurveTo(-gGripW * 1.05, gg2 + ggl * 0.65, -gGripW * 0.85, gg2 + ggl * 0.8);
            ctx.quadraticCurveTo(-gGripW * 0.5, gg2 + ggl * 0.9, -gGripW * 0.9, gg2 + ggl);
            ctx.lineTo(gGripW * 0.9, gg2 + ggl);
            ctx.quadraticCurveTo(gGripW * 0.5, gg2 + ggl * 0.9, gGripW * 0.85, gg2 + ggl * 0.8);
            ctx.quadraticCurveTo(gGripW * 1.05, gg2 + ggl * 0.65, gGripW * 0.6, gg2 + ggl * 0.5);
            ctx.quadraticCurveTo(gGripW * 1.05, gg2 + ggl * 0.35, gGripW * 0.85, gg2 + ggl * 0.2);
            ctx.quadraticCurveTo(gGripW * 0.5, gg2 + ggl * 0.1, gGripW * 0.9, gg2);
            ctx.closePath();
            ctx.fill();
            // Guard on top — 3D gradient
            const gGuardGrad = ctx.createLinearGradient(0, gBase - gGuardTh, 0, gBase + gGuardTh + gGuardR);
            gGuardGrad.addColorStop(0, `rgb(${Math.min(255,gGR2+20)},${Math.min(255,gGG2+15)},${Math.min(255,gGBl+10)})`);
            gGuardGrad.addColorStop(0.5, `rgb(${gGR2},${gGG2},${gGBl})`);
            gGuardGrad.addColorStop(1, `rgb(${Math.max(0,gGR2-12)},${Math.max(0,gGG2-8)},${Math.max(0,gGBl-5)})`);
            ctx.fillStyle = gGuardGrad;
            ctx.beginPath();
            ctx.moveTo(-gGuardR, gBase);
            ctx.lineTo(gGuardR, gBase);
            ctx.arc(0, gBase + gGuardTh, gGuardR, 0, Math.PI);
            ctx.closePath();
            ctx.fill();
            // Pommel — radial gradient for sphere
            const gPomGrad = ctx.createRadialGradient(-gPomR * 0.25, gPomCY - gPomR * 0.25, 0, 0, gPomCY, gPomR);
            gPomGrad.addColorStop(0, `rgb(${Math.min(255,gGR2+30)},${Math.min(255,gGG2+22)},${Math.min(255,gGBl+12)})`);
            gPomGrad.addColorStop(0.5, `rgb(${gGR2},${gGG2},${gGBl})`);
            gPomGrad.addColorStop(1, `rgb(${Math.max(0,gGR2-15)},${Math.max(0,gGG2-10)},${Math.max(0,gGBl-6)})`);
            ctx.fillStyle = gPomGrad;
            ctx.beginPath();
            ctx.arc(0, gPomCY, gPomR, 0, Math.PI * 2);
            ctx.fill();
            // Knob — radial gradient
            const gKnobGrad = ctx.createRadialGradient(-gKnobR * 0.2, gKnobY - gKnobR * 0.2, 0, 0, gKnobY, gKnobR);
            gKnobGrad.addColorStop(0, `rgb(${Math.min(255,gGR2+25)},${Math.min(255,gGG2+18)},${Math.min(255,gGBl+10)})`);
            gKnobGrad.addColorStop(0.6, `rgb(${gGR2},${gGG2},${gGBl})`);
            gKnobGrad.addColorStop(1, `rgb(${Math.max(0,gGR2-12)},${Math.max(0,gGG2-8)},${Math.max(0,gGBl-5)})`);
            ctx.fillStyle = gKnobGrad;
            ctx.beginPath();
            ctx.arc(0, gKnobY, gKnobR, 0, Math.PI * 2);
            ctx.fill();
          } else {

          // === LONGSWORD — broken blade: zigzag cuts, damaged edges, shards ===
          var _hw = bladeW / 2;
          var _sc = Math.min(1, overall / 100);
          if (!s._frac) {
            var _cs = (s.idx * 2246822519 + 314159) | 0;
            var _cr = function() { _cs = (_cs * 1103515245 + 12345) & 0x7fffffff; return _cs / 0x7fffffff; };
            _cr(); _cr();
            var _totalH = bladeH + guardH;
            var _guardZone = _totalH * 0.06125;
            var _nCuts = 4 + (_cr() * 2 | 0);
            var _cutTop = -bladeH * 0.9;
            var _cutBot = guardH - _guardZone;
            var _cutSpan = _cutBot - _cutTop;
            var _fCuts = [];
            for (var _ci = 0; _ci < _nCuts; _ci++) {
              var _y = _cutTop + _cutSpan * (_ci + 0.5) / _nCuts + (_cr() - 0.5) * _cutSpan * 0.12;
              var _dir = _ci % 2 === 0 ? 1 : -1;
              var _drop = Math.max(4 * _sc, bladeH * (0.05 + _cr() * 0.07)) * _dir;
              var _mx = (_cr() * 0.6 - 0.3) * _hw;
              var _midDev = Math.max(3 * _sc, bladeH * (0.01 + _cr() * 0.03));
              var _my = _y + _drop * 0.5 + (_cr() > 0.5 ? 1 : -1) * _midDev;
              _fCuts.push({ yL: _y, yR: _y + _drop, mx: _mx, my: _my });
            }
            _fCuts.sort(function(a,b){ return ((a.yL+a.yR)*0.5) - ((b.yL+b.yR)*0.5); });
            var _fNotchL = [], _fNotchR = [];
            var _nNotch = 6 + (_cr() * 5 | 0);
            for (var _ni = 0; _ni < _nNotch; _ni++) {
              var _ny = _cutTop + _cr() * (_cutSpan * 0.95);
              var _nd = Math.max(2 * _sc, _hw * (0.35 + _cr() * 0.65));
              var _nh = Math.max(3 * _sc, bladeH * (0.015 + _cr() * 0.035));
              if (_cr() > 0.25) _fNotchL.push({ y: _ny, d: _nd, h: _nh });
              if (_cr() > 0.25) _fNotchR.push({ y: _ny + (_cr()-0.5)*_nh, d: _nd, h: _nh });
            }
            _fNotchL.sort(function(a,b){ return a.y - b.y; });
            _fNotchR.sort(function(a,b){ return a.y - b.y; });
            // Cache per-piece params
            var _fPieces = [];
            for (var _pi = 0; _pi <= _nCuts; _pi++) {
              _fPieces.push({ dx: (_pi % 2 === 0 ? 1 : -1) * (1 + _cr() * 2) * _sc, fs: 0.4 + _cr() * 0.6, fa: (1.5 + _cr() * 2.5) * _sc, fp: _cr() * Math.PI * 2 });
            }
            // Cache shard params
            var _fShards = [];
            for (var _fsi = 0; _fsi < _fCuts.length; _fsi++) {
              _fShards.push({ sf: 0.5 + _cr() * 0.5, sp: _cr() * Math.PI * 2, sa: (1 + _cr() * 2) * _sc,
                lx: Math.max(3 * _sc, 2 + _cr() * 4) * _sc, lw: Math.max(5 * _sc, (3 + _cr() * 5) * _sc), lh: Math.max(4 * _sc, (3 + _cr() * 4) * _sc),
                rx: Math.max(3 * _sc, 2 + _cr() * 4) * _sc, rw: Math.max(5 * _sc, (3 + _cr() * 5) * _sc), rh: Math.max(4 * _sc, (3 + _cr() * 4) * _sc) });
            }
            // Cache notch shard params
            var _fNShL = [];
            for (var _fnli = 0; _fnli < _fNotchL.length; _fnli++) {
              var _fnSkip = _cr() > 0.5;
              _fNShL.push({ skip: _fnSkip, sf: 0.4 + _cr() * 0.5, sp: _cr() * Math.PI * 2, sa: (1 + _cr() * 1.5) * _sc,
                x: Math.max(2 * _sc, (1 + _cr() * 3) * _sc), sw: Math.max(2 * _sc, _fNotchL[_fnli].h * 0.4), sh: Math.max(2 * _sc, _fNotchL[_fnli].d * 0.5) });
            }
            var _fNShR = [];
            for (var _fnri = 0; _fnri < _fNotchR.length; _fnri++) {
              var _fnrSkip = _cr() > 0.5;
              _fNShR.push({ skip: _fnrSkip, sf: 0.4 + _cr() * 0.5, sp: _cr() * Math.PI * 2, sa: (1 + _cr() * 1.5) * _sc,
                x: Math.max(2 * _sc, (1 + _cr() * 3) * _sc), sw: Math.max(2 * _sc, _fNotchR[_fnri].h * 0.4), sh: Math.max(2 * _sc, _fNotchR[_fnri].d * 0.5) });
            }
            s._frac = { cuts: _fCuts, nL: _fNotchL, nR: _fNotchR, pcs: _fPieces, sh: _fShards, nsL: _fNShL, nsR: _fNShR };
          }
          var _cuts = s._frac.cuts, _nCuts = _cuts.length;
          var _notchL = s._frac.nL, _notchR = s._frac.nR;
          var _cutYat = function(c, x) {
            if (x <= c.mx) { var t = (x + _hw) / (c.mx + _hw); return c.yL + t * (c.my - c.yL); }
            var t2 = (x - c.mx) / (_hw - c.mx); return c.my + t2 * (c.yR - c.my);
          };
          var _inset = 3 * _sc;
          var _colL = leftLight ? s._colLight : s._colDark;
          var _colR = leftLight ? s._colDark : s._colLight;
          // Draw each piece
          for (var _si = 0; _si <= _nCuts; _si++) {
            var _top = _si > 0 ? _cuts[_si - 1] : null;
            var _bot = _si < _nCuts ? _cuts[_si] : null;
            var _pc = s._frac.pcs[_si];
            var _dx = _pc.dx;
            var _floatY = Math.sin(cloudTime * 0.012 * _pc.fs + _pc.fp) * _pc.fa;
            ctx.save();
            ctx.translate(_dx, _floatY);
            var _tYL = _top ? _cutYat(_top, -_hw) + _inset : tipEnd;
            var _tYR = _top ? _cutYat(_top, _hw) + _inset : tipEnd;
            var _bYL = _bot ? _cutYat(_bot, -_hw) - _inset : guardH;
            var _bYR = _bot ? _cutYat(_bot, _hw) - _inset : guardH;
            // --- LEFT HALF with edge notches ---
            ctx.fillStyle = _colL;
            ctx.beginPath();
            if (!_top) {
              ctx.moveTo(0, -bladeH);
              ctx.lineTo(-_hw * 0.3, -bladeH * 0.7);
              ctx.lineTo(-_hw, tipEnd);
            } else {
              ctx.moveTo(0, _cutYat(_top, 0) + _inset);
              ctx.lineTo(_top.mx, _top.my + _inset);
              ctx.lineTo(-_hw, _tYL);
            }
            // Walk down left edge with notches
            var _pY = _tYL;
            for (var _li = 0; _li < _notchL.length; _li++) {
              var _n = _notchL[_li];
              if (_n.y <= _pY || _n.y + _n.h > _bYL) continue;
              ctx.lineTo(-_hw, _n.y);
              ctx.lineTo(-_hw + _n.d, _n.y + _n.h * 0.4);
              ctx.lineTo(-_hw, _n.y + _n.h);
              _pY = _n.y + _n.h;
            }
            if (!_bot) {
              ctx.lineTo(-_hw, guardH); ctx.lineTo(0, guardH);
            } else {
              ctx.lineTo(-_hw, _bYL);
              ctx.lineTo(_bot.mx, _bot.my - _inset);
              ctx.lineTo(0, _cutYat(_bot, 0) - _inset);
            }
            ctx.closePath(); ctx.fill();
            // --- RIGHT HALF with edge notches ---
            ctx.fillStyle = _colR;
            ctx.beginPath();
            if (!_top) {
              ctx.moveTo(0, -bladeH);
              ctx.lineTo(_hw * 0.3, -bladeH * 0.7);
              ctx.lineTo(_hw, tipEnd);
            } else {
              ctx.moveTo(0, _cutYat(_top, 0) + _inset);
              ctx.lineTo(_top.mx, _top.my + _inset);
              ctx.lineTo(_hw, _tYR);
            }
            _pY = _tYR;
            for (var _ri = 0; _ri < _notchR.length; _ri++) {
              var _nr = _notchR[_ri];
              if (_nr.y <= _pY || _nr.y + _nr.h > _bYR) continue;
              ctx.lineTo(_hw, _nr.y);
              ctx.lineTo(_hw - _nr.d, _nr.y + _nr.h * 0.4);
              ctx.lineTo(_hw, _nr.y + _nr.h);
              _pY = _nr.y + _nr.h;
            }
            if (!_bot) {
              ctx.lineTo(_hw, guardH); ctx.lineTo(0, guardH);
            } else {
              ctx.lineTo(_hw, _bYR);
              ctx.lineTo(_bot.mx, _bot.my - _inset);
              ctx.lineTo(0, _cutYat(_bot, 0) - _inset);
            }
            ctx.closePath(); ctx.fill();
            // 1px black outline on broken edges (zigzag shape)
            ctx.strokeStyle = 'rgba(0,0,0,0.6)';
            ctx.lineWidth = 0.5 * _sc;
            if (_top) {
              ctx.beginPath();
              ctx.moveTo(-_hw, _tYL);
              ctx.lineTo(_top.mx, _top.my + _inset);
              ctx.lineTo(_hw, _tYR);
              ctx.stroke();
            }
            if (_bot) {
              ctx.beginPath();
              ctx.moveTo(-_hw, _bYL);
              ctx.lineTo(_bot.mx, _bot.my - _inset);
              ctx.lineTo(_hw, _bYR);
              ctx.stroke();
            }
            // Ridge
            ctx.strokeStyle = s._ridgeStyle;
            ctx.lineWidth = Math.max(0.3, bladeW * 0.06);
            var _rt = _top ? _cutYat(_top, 0) + _inset + 1 : -bladeH + 1;
            var _rb = _bot ? _cutYat(_bot, 0) - _inset - 1 : guardH;
            ctx.beginPath(); ctx.moveTo(0, _rt); ctx.lineTo(0, _rb); ctx.stroke();
            // Orange highlight on lit edge of this piece
            ctx.save();
            ctx.globalCompositeOperation = 'lighter';
            var _hlAlpha = 0.12 + lit * 0.2;
            ctx.strokeStyle = 'rgba(255,130,35,' + _hlAlpha + ')';
            ctx.lineWidth = Math.max(0.5, bladeW * 0.15);
            var _hlSide = leftLight ? -1 : 1;
            var _hlX = _hlSide * _hw;
            var _hlNotch = leftLight ? _notchL : _notchR;
            var _hlTop = leftLight ? _tYL : _tYR;
            var _hlBot = leftLight ? _bYL : _bYR;
            ctx.beginPath();
            if (!_top && _hlSide === -1) {
              ctx.moveTo(-_hw * 0.3, -bladeH * 0.7);
              ctx.lineTo(_hlX, tipEnd);
            } else if (!_top && _hlSide === 1) {
              ctx.moveTo(_hw * 0.3, -bladeH * 0.7);
              ctx.lineTo(_hlX, tipEnd);
            } else {
              ctx.moveTo(_hlX, _hlTop);
            }
            var _hlPY = _hlTop;
            for (var _hli = 0; _hli < _hlNotch.length; _hli++) {
              var _hln = _hlNotch[_hli];
              if (_hln.y <= _hlPY || _hln.y + _hln.h > _hlBot) continue;
              ctx.lineTo(_hlX, _hln.y);
              ctx.lineTo(_hlX - _hlSide * _hln.d, _hln.y + _hln.h * 0.4);
              ctx.lineTo(_hlX, _hln.y + _hln.h);
              _hlPY = _hln.y + _hln.h;
            }
            ctx.lineTo(_hlX, _hlBot);
            ctx.stroke();
            ctx.restore();
            ctx.restore();
          }
          // Shards — 2 per cut (one each side), triangular, pointing outward
          var _shCol = s._shCol;
          ctx.fillStyle = _shCol;
          for (var _shi = 0; _shi < _cuts.length; _shi++) {
            var _shc = _cuts[_shi];
            var _sy = (_shc.yL + _shc.yR) * 0.5;
            var _shd = s._frac.sh[_shi];
            var _shFloat = Math.sin(cloudTime * 0.01 * _shd.sf + _shd.sp) * _shd.sa;
            _sy += _shFloat;
            // Left shard — wider, shorter, pointing inward
            var _slx = -_hw - _shd.lx;
            ctx.beginPath();
            ctx.moveTo(_slx, _sy - _shd.lw * 0.5);
            ctx.lineTo(_slx + _shd.lh, _sy + _shd.lw * 0.1);
            ctx.lineTo(_slx, _sy + _shd.lw * 0.5);
            ctx.closePath(); ctx.fill();
            // Right shard — wider, shorter, pointing inward
            var _srx = _hw + _shd.rx;
            ctx.beginPath();
            ctx.moveTo(_srx, _sy - _shd.rw * 0.5);
            ctx.lineTo(_srx - _shd.rh, _sy + _shd.rw * 0.1);
            ctx.lineTo(_srx, _sy + _shd.rw * 0.5);
            ctx.closePath(); ctx.fill();
          }
          // Extra shards near notches
          for (var _sni = 0; _sni < _notchL.length; _sni++) {
            var _sn2 = _notchL[_sni];
            var _nsL = s._frac.nsL[_sni];
            if (_nsL.skip) continue;
            var _nfL = Math.sin(cloudTime * 0.01 * _nsL.sf + _nsL.sp) * _nsL.sa;
            var _sx2 = -_hw - _nsL.x;
            ctx.beginPath();
            ctx.moveTo(_sx2, _sn2.y + _sn2.h * 0.2 + _nfL);
            ctx.lineTo(_sx2 + _nsL.sh, _sn2.y + _sn2.h * 0.45 + _nfL);
            ctx.lineTo(_sx2, _sn2.y + _sn2.h * 0.7 + _nfL);
            ctx.closePath(); ctx.fill();
          }
          for (var _sri2 = 0; _sri2 < _notchR.length; _sri2++) {
            var _snr2 = _notchR[_sri2];
            var _nsR = s._frac.nsR[_sri2];
            if (_nsR.skip) continue;
            var _nfR = Math.sin(cloudTime * 0.01 * _nsR.sf + _nsR.sp) * _nsR.sa;
            var _sxr2 = _hw + _nsR.x;
            ctx.beginPath();
            ctx.moveTo(_sxr2, _snr2.y + _snr2.h * 0.2 + _nfR);
            ctx.lineTo(_sxr2 - _nsR.sh, _snr2.y + _snr2.h * 0.45 + _nfR);
            ctx.lineTo(_sxr2, _snr2.y + _snr2.h * 0.7 + _nfR);
            ctx.closePath(); ctx.fill();
          }
          // Guard — 3D gradient top-to-bottom
          const gB = (lightB + darkB) * 0.4;
          const gR3 = s._gR3, gG3 = s._gG3, gBl3 = s._gBl3;
          const guardGrad = ctx.createLinearGradient(0, -guardH * 0.5, 0, guardH * 1.5);
          guardGrad.addColorStop(0, `rgb(${Math.min(255,gR3+20)},${Math.min(255,gG3+15)},${Math.min(255,gBl3+10)})`);
          guardGrad.addColorStop(0.5, `rgb(${gR3},${gG3},${gBl3})`);
          guardGrad.addColorStop(1, `rgb(${Math.max(0,gR3-12)},${Math.max(0,gG3-8)},${Math.max(0,gBl3-5)})`);
          ctx.fillStyle = guardGrad;
          const guardType = ((s.idx * 2654435761 >>> 0) ^ (s.idx * 40503 >>> 0)) % 4;
          ctx.beginPath();
          if (guardType === 1) {
            const endH = guardH * 2;
            ctx.moveTo(-guardW / 2, guardH / 2 - endH / 2);
            ctx.lineTo(-guardW / 2, guardH / 2 + endH / 2);
            ctx.bezierCurveTo(-guardW / 4, guardH, guardW / 4, guardH, guardW / 2, guardH / 2 + endH / 2);
            ctx.lineTo(guardW / 2, guardH / 2 - endH / 2);
            ctx.bezierCurveTo(guardW / 4, 0, -guardW / 4, 0, -guardW / 2, guardH / 2 - endH / 2);
            ctx.closePath();
          } else if (guardType === 2) {
            ctx.moveTo(-guardW / 2, 0);
            ctx.lineTo(-guardW / 2, guardH);
            ctx.quadraticCurveTo(0, guardH * 3, guardW / 2, guardH);
            ctx.lineTo(guardW / 2, 0);
            ctx.quadraticCurveTo(0, guardH * 2, -guardW / 2, 0);
            ctx.closePath();
          } else if (guardType === 3) {
            const segW = guardW * 0.12;
            const segH = guardH * 1.5;
            ctx.rect(-guardW / 2 - segW / 2, -segH / 2 + guardH / 2, segW, segH);
            ctx.rect(-segW / 2, 0, segW, guardH);
            ctx.rect(guardW / 2 - segW / 2, -segH / 2 + guardH / 2, segW, segH);
            ctx.rect(-guardW / 2, 0, guardW, guardH);
          } else {
            const gHalf = guardW / 2;
            const flareH = guardH * 1.2;
            const mid = guardH / 2;
            ctx.moveTo(-gHalf * 0.65, -ov);
            ctx.quadraticCurveTo(-gHalf * 0.85, -flareH * 0.4, -gHalf, -flareH / 2);
            ctx.quadraticCurveTo(-gHalf * 1.06, mid, -gHalf, flareH / 2 + guardH);
            ctx.quadraticCurveTo(-gHalf * 0.85, guardH + flareH * 0.4, -gHalf * 0.65, guardH + ov);
            ctx.lineTo(gHalf * 0.65, guardH + ov);
            ctx.quadraticCurveTo(gHalf * 0.85, guardH + flareH * 0.4, gHalf, flareH / 2 + guardH);
            ctx.quadraticCurveTo(gHalf * 1.06, mid, gHalf, -flareH / 2);
            ctx.quadraticCurveTo(gHalf * 0.85, -flareH * 0.4, gHalf * 0.65, -ov);
            ctx.closePath();
          }
          ctx.fill();
          // Pommel type determines grip shape
          let ph = (s.idx * 2246822519 + 400) | 0; ph = Math.imul(ph ^ (ph >>> 16), 0x45d9f3b); ph = Math.imul(ph ^ (ph >>> 13), 0x45d9f3b); ph = ph ^ (ph >>> 16);
          const pommelType = (ph >>> 0) % 2;
          // Grip — cylindrical gradient
          const gripGrad = ctx.createLinearGradient(-gripW / 2, 0, gripW / 2, 0);
          const grR = s._grR, grG = s._grG, grBl = s._grBl;
          gripGrad.addColorStop(0, `rgb(${Math.max(0,grR-10)},${Math.max(0,grG-6)},${Math.max(0,grBl-4)})`);
          gripGrad.addColorStop(0.35, `rgb(${grR},${grG},${grBl})`);
          gripGrad.addColorStop(0.5, `rgb(${Math.min(255,grR+12)},${Math.min(255,grG+8)},${Math.min(255,grBl+5)})`);
          gripGrad.addColorStop(0.65, `rgb(${grR},${grG},${grBl})`);
          gripGrad.addColorStop(1, `rgb(${Math.max(0,grR-10)},${Math.max(0,grG-6)},${Math.max(0,grBl-4)})`);
          ctx.fillStyle = gripGrad;
          if (pommelType === 1) {
            const taperW = gripW * 0.65;
            ctx.beginPath();
            ctx.moveTo(-gripW / 2, guardH - ov);
            ctx.lineTo(gripW / 2, guardH - ov);
            ctx.lineTo(taperW / 2, gripBot + ov * 2);
            ctx.lineTo(-taperW / 2, gripBot + ov * 2);
            ctx.closePath();
            ctx.fill();
          } else {
            ctx.fillRect(-gripW / 2, guardH - ov, gripW, gripH + ov * 3);
          }
          // Pommel — radial gradient for sphere/volume
          ctx.beginPath();
          if (pommelType === 1) {
            const pomGrad = ctx.createRadialGradient(-pomRy * 0.25, gripBot + pomRy * 0.5 - pomRy * 0.25, 0, 0, gripBot + pomRy * 0.5, pomRy);
            pomGrad.addColorStop(0, `rgb(${Math.min(255,gR3+30)},${Math.min(255,gG3+22)},${Math.min(255,gBl3+12)})`);
            pomGrad.addColorStop(0.5, `rgb(${gR3},${gG3},${gBl3})`);
            pomGrad.addColorStop(1, `rgb(${Math.max(0,gR3-15)},${Math.max(0,gG3-10)},${Math.max(0,gBl3-6)})`);
            ctx.fillStyle = pomGrad;
            ctx.arc(0, gripBot + pomRy * 0.5, pomRy, 0, Math.PI * 2);
          } else {
            const fanBotW = gripW * 0.6;
            const fanTopW = bladeW * 0.8;
            const fanH = pomDia;
            const fanGrad = ctx.createLinearGradient(0, gripBot, 0, gripBot + fanH);
            fanGrad.addColorStop(0, `rgb(${Math.min(255,gR3+18)},${Math.min(255,gG3+12)},${Math.min(255,gBl3+8)})`);
            fanGrad.addColorStop(0.5, `rgb(${gR3},${gG3},${gBl3})`);
            fanGrad.addColorStop(1, `rgb(${Math.max(0,gR3-12)},${Math.max(0,gG3-8)},${Math.max(0,gBl3-5)})`);
            ctx.fillStyle = fanGrad;
            ctx.moveTo(-fanBotW, gripBot);
            ctx.lineTo(fanBotW, gripBot);
            ctx.quadraticCurveTo(fanBotW * 0.5, gripBot + fanH * 0.5,
                                  fanTopW, gripBot + fanH);
            ctx.quadraticCurveTo(0, gripBot + fanH + fanH * 0.5,
                                  -fanTopW, gripBot + fanH);
            ctx.quadraticCurveTo(-fanBotW * 0.5, gripBot + fanH * 0.5,
                                  -fanBotW, gripBot);
            ctx.closePath();
          }
          ctx.fill();

          } // end else (normal sword)

          ctx.restore();
        }

        // (floor electricity interleaved in sword loop above)

        // === BANNER — pole with round crest + vertical-only cloth ===
        {
          if (!swordGridCache._banner) {
            const bWx = 0.5, bWz = 22;
            swordGridCache._banner = {
              bScrX: projX(bWx, bWz), bScrY: projY(bWz, bWx),
              bScale: 2.8 * focal / (bWz - camZ)
            };
            const _b = swordGridCache._banner;
            _b.poleH = _b.bScale * 3.2;
            _b.poleW = Math.max(1, _b.bScale * 0.035);
            _b.poleBury = _b.bScale * 0.3;
            _b.poleTop = _b.bScrY - _b.poleH + _b.poleBury;
            _b.crossY = _b.poleTop + _b.bScale * 0.04;
            _b.armH = _b.bScale * 0.2;
            _b.crossW = _b.bScale * 0.7;
            _b.barThick = _b.poleW;
            _b.diaW = _b.poleW * 1.2;
            _b.diaOut = _b.poleW * 2.2;
            _b.diaIn = _b.poleW * 1.0;
            _b.ridgeTop = _b.crossY + _b.poleW / 2;
            _b.ridgeH = _b.bScale * 0.12;
            _b.ridgeW = _b.crossW * 0.85;
            _b.dTop = _b.ridgeTop + _b.ridgeH;
            _b.dW = _b.crossW * 0.55;
            _b.dH = _b.bScale * 1.6;
            _b.cellSize = Math.sqrt(10);
            _b.gridX = Math.max(2, Math.round(_b.dW / _b.cellSize));
            _b.gridY = Math.max(2, Math.round(_b.dH / _b.cellSize));
            _b.crestR = _b.bScale * 0.12;
            // Pre-build shaft gradient coords
            _b.shaftL = _b.bScrX - _b.poleW;
            _b.shaftR = _b.bScrX + _b.poleW;
          }
          const _b = swordGridCache._banner;
          const { bScrX, bScrY, bScale, poleH, poleW, poleTop, crossY, armH, crossW, barThick, diaW, diaOut, diaIn, ridgeTop, ridgeH, ridgeW, dTop, dW, dH, gridX, gridY, crestR } = _b;
          const wt = cloudTime * 0.5;
          const gD = 'rgb(140,95,25)', gM = 'rgb(200,155,45)', gH = 'rgb(245,215,100)';
          const bannerLean = -0.06;

          ctx.save();
          ctx.translate(bScrX, bScrY);
          ctx.rotate(bannerLean);
          ctx.translate(-bScrX, -bScrY);
          try {

          // Pole shaft
          const shaftGrad = ctx.createLinearGradient(_b.shaftL, 0, _b.shaftR, 0);
          shaftGrad.addColorStop(0, 'rgb(120,80,20)');
          shaftGrad.addColorStop(0.35, 'rgb(180,135,35)');
          shaftGrad.addColorStop(0.5, 'rgb(220,180,65)');
          shaftGrad.addColorStop(0.65, 'rgb(180,135,35)');
          shaftGrad.addColorStop(1, 'rgb(120,80,20)');
          ctx.fillStyle = shaftGrad;
          ctx.fillRect(bScrX - poleW / 2, poleTop, poleW, poleH);

          // Vertical arm above
          ctx.fillStyle = gM;
          ctx.fillRect(bScrX - barThick / 2, poleTop - armH, barThick, armH);

          ctx.fillRect(bScrX - crossW / 2, crossY - barThick / 2, crossW, barThick);
          // Left — points left
          ctx.beginPath();
          ctx.moveTo(bScrX - crossW / 2 - diaOut, crossY);
          ctx.lineTo(bScrX - crossW / 2, crossY - diaW);
          ctx.lineTo(bScrX - crossW / 2 + diaIn, crossY);
          ctx.lineTo(bScrX - crossW / 2, crossY + diaW);
          ctx.closePath(); ctx.fill();
          // Right — points right
          ctx.beginPath();
          ctx.moveTo(bScrX + crossW / 2 + diaOut, crossY);
          ctx.lineTo(bScrX + crossW / 2, crossY - diaW);
          ctx.lineTo(bScrX + crossW / 2 - diaIn, crossY);
          ctx.lineTo(bScrX + crossW / 2, crossY + diaW);
          ctx.closePath(); ctx.fill();
          // Top — points up
          ctx.beginPath();
          ctx.moveTo(bScrX, poleTop - armH - diaOut);
          ctx.lineTo(bScrX + diaW, poleTop - armH);
          ctx.lineTo(bScrX, poleTop - armH + diaIn);
          ctx.lineTo(bScrX - diaW, poleTop - armH);
          ctx.closePath(); ctx.fill();

          // Vertical ridged columns
          for (let ri = 0; ri < 7; ri++) {
            const rx = bScrX - ridgeW / 2 + (ri + 0.5) * (ridgeW / 7);
            const rw = ridgeW / 7 * 0.5;
            const rGrad = ctx.createLinearGradient(rx - rw, 0, rx + rw, 0);
            rGrad.addColorStop(0, gD); rGrad.addColorStop(0.5, gM); rGrad.addColorStop(1, gD);
            ctx.fillStyle = rGrad;
            ctx.fillRect(rx - rw, ridgeTop, rw * 2, ridgeH);
          }

          // Cloth — 2D grid mesh

          // Each row is a wave layer — displaced in X, Y, Z (depth→scale+opacity)
          // Wave field — slow traveling folds across cloth surface
          const _fw1 = (px, py, t) => px * 0.08 + Math.sin(py * 0.04) * 2.0 + Math.cos(py * 0.02 + px * 0.01) * 1.0 - t * 0.08;
          const _fw2 = (px, py, t) => (px * 0.05 + py * 0.06) + Math.sin(px * 0.03 - py * 0.02) * 1.5 - t * 0.06;
          const _fw3 = (px, py, t) => py * 0.07 + Math.sin(px * 0.05) * 1.8 + Math.cos(py * 0.03 + px * 0.02) * 0.9 - t * 0.045;

          // Precompute grid points into flat array for performance
          const pts = new Array((gridX + 1) * (gridY + 1));
          for (let gy = 0; gy <= gridY; gy++) {
            for (let gx = 0; gx <= gridX; gx++) {
              const u = gx / gridX, v = gy / gridY;
              const freedom = v; // linear — whole flag moves, not just bottom
              const px = u * dW, py = v * dH;
              const h1 = Math.sin(_fw1(px, py, wt));
              const h2 = Math.sin(_fw2(px, py, wt));
              const h3 = Math.sin(_fw3(px, py, wt));
              const totalH = h1 * 0.5 + h2 * 0.35 + h3 * 0.25;
              const dd = 2;
              const hR = Math.sin(_fw1(px+dd,py,wt))*0.5+Math.sin(_fw2(px+dd,py,wt))*0.35+Math.sin(_fw3(px+dd,py,wt))*0.25;
              const hD = Math.sin(_fw1(px,py+dd,wt))*0.5+Math.sin(_fw2(px,py+dd,wt))*0.35+Math.sin(_fw3(px,py+dd,wt))*0.25;
              const slopeX = hR - totalH, slopeY = hD - totalH;
              // Unified wind — one gust drives both push and lift coherently
              const windStr = 0.5 + Math.sin(wt * 0.035) * 0.35;
              // Wind blows to the right and upward at ~30° angle
              const windX = freedom * bScale * 0.35 * windStr + totalH * freedom * bScale * 0.06;
              const windY = -freedom * bScale * 0.2 * windStr + slopeY * freedom * bScale * 0.4;
              const wz = totalH * freedom * 0.2;
              const zScale = 1 + wz * 0.4;
              const slopeShift = slopeX * freedom * bScale * 0.4;
              pts[gy * (gridX + 1) + gx] = {
                x: bScrX + (u - 0.5) * dW * zScale + windX + slopeShift,
                y: dTop + v * dH + windY,
                z: wz
              };
            }
          }
          function gp(gx, gy) { return pts[gy * (gridX + 1) + gx]; }

          // Draw as TRIANGLES with sun lighting
          // Sun direction toward flag (sun is at W*0.5, H*0.3)
          const sunDx = sunX - bScrX, sunDy = sunY - (dTop + dH * 0.5);
          const sunDist = Math.sqrt(sunDx * sunDx + sunDy * sunDy) || 1;
          const snx = sunDx / sunDist, sny = sunDy / sunDist;
          // Shadow color, lit color, rim color
          const shCol = [65, 12, 8];
          const ltCol = [195, 65, 35];
          const rimCol = [255, 180, 100];

          function triColor(p0, p1, p2, v0, u0) {
            // Surface normal from cross product of edges + Z
            const ex1 = p1.x - p0.x, ey1 = p1.y - p0.y, ez1 = (p1.z - p0.z) * 200;
            const ex2 = p2.x - p0.x, ey2 = p2.y - p0.y, ez2 = (p2.z - p0.z) * 200;
            let nx = ey1 * ez2 - ez1 * ey2, ny = ez1 * ex2 - ex1 * ez2, nz = ex1 * ey2 - ey1 * ex2;
            const nl = Math.sqrt(nx*nx + ny*ny + nz*nz) || 1;
            nx /= nl; ny /= nl; nz /= nl;
            // Dot with sun direction (2D projected + Z facing camera)
            const ndot = nx * snx + ny * sny;
            const sunFace = ndot * 0.5 + 0.5; // 0=shadow, 1=lit
            // Z facing: positive Z = toward viewer = brighter
            const avgZ = (p0.z + p1.z + p2.z) / 3;
            const zFace = 0.5 + avgZ * 1.5;
            // Combined light
            const light = Math.max(0, Math.min(1, sunFace * 0.6 + zFace * 0.4));
            // Thin edge rim (high slope = edge)
            const tilt = Math.sqrt(nx*nx + ny*ny);
            const rim = Math.pow(Math.max(0, tilt - 0.3) / 0.7, 2) * 0.3 * Math.max(0, sunFace);
            const r = Math.round(Math.min(255, shCol[0] + (ltCol[0] - shCol[0]) * light + rimCol[0] * rim));
            const g = Math.round(Math.min(255, shCol[1] + (ltCol[1] - shCol[1]) * light + rimCol[1] * rim));
            const b = Math.round(Math.min(255, shCol[2] + (ltCol[2] - shCol[2]) * light + rimCol[2] * rim));
            return 'rgb(' + r + ',' + g + ',' + b + ')';
          }

          // Solid backdrop to fill subpixel gaps between triangles
          ctx.fillStyle = 'rgb(100,30,18)';
          ctx.beginPath();
          for (let gx = 0; gx <= gridX; gx++) { const p = gp(gx, 0); if (gx === 0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y); }
          for (let gy2 = 1; gy2 <= gridY; gy2++) { const p = gp(gridX, gy2); ctx.lineTo(p.x, p.y); }
          for (let gx2 = gridX - 1; gx2 >= 0; gx2--) { const p = gp(gx2, gridY); ctx.lineTo(p.x, p.y); }
          for (let gy3 = gridY - 1; gy3 >= 0; gy3--) { const p = gp(0, gy3); ctx.lineTo(p.x, p.y); }
          ctx.closePath(); ctx.fill();

          for (let gy = 0; gy < gridY; gy++) {
            const v0 = gy / gridY;
            for (let gx = 0; gx < gridX; gx++) {
              const p00 = gp(gx, gy), p10 = gp(gx+1, gy), p01 = gp(gx, gy+1), p11 = gp(gx+1, gy+1);
              const u0 = (gx + 0.5) / gridX;
              // Triangle A
              ctx.fillStyle = triColor(p00, p10, p01, v0, u0);
              ctx.beginPath(); ctx.moveTo(p00.x,p00.y); ctx.lineTo(p10.x,p10.y); ctx.lineTo(p01.x,p01.y); ctx.closePath(); ctx.fill();
              // Triangle B
              ctx.fillStyle = triColor(p10, p11, p01, (gy+0.5)/gridY, (gx+0.5)/gridX);
              ctx.beginPath(); ctx.moveTo(p10.x,p10.y); ctx.lineTo(p11.x,p11.y); ctx.lineTo(p01.x,p01.y); ctx.closePath(); ctx.fill();
            }
          }

          // Gold motif overlay — painted on top of cloth mesh
          // Top gold triangle corners: two triangles in the top corners
          ctx.fillStyle = 'rgba(210,165,50,0.55)';
          const tl = gp(0, 0), tr = gp(gridX, 0);
          const tm = gp(Math.round(gridX / 2), 0);
          const triRow = Math.round(gridY * 0.15);
          const bl = gp(0, triRow), br = gp(gridX, triRow);
          // Left gold corner triangle
          ctx.beginPath();
          ctx.moveTo(tl.x, tl.y); ctx.lineTo(tm.x, tm.y); ctx.lineTo(bl.x, bl.y);
          ctx.closePath(); ctx.fill();
          // Right gold corner triangle
          ctx.beginPath();
          ctx.moveTo(tr.x, tr.y); ctx.lineTo(tm.x, tm.y); ctx.lineTo(br.x, br.y);
          ctx.closePath(); ctx.fill();

          // Triangle outline below the gold — inverted V shape
          // Triangle outline below gold — same shape, shifted down uniformly
          // Outline frame — exact same shape as gold triangle, inset uniformly
          // The gold triangle: edges at (0, triRow) and (gridX, triRow), peak at (gridX/2, 0)
          // Outline: same shape shrunk inward by pad on all sides
          const pad = Math.round(gridY * 0.05);
          const padX = Math.max(1, Math.round(gridX * 0.08));
          // Peak: shifted down by pad from row 0
          const oMid = gp(Math.round(gridX / 2), pad);
          // Triangle sides: same row as gold (triRow), inset from edges by padX
          const oTL = gp(padX, triRow);
          const oTR = gp(gridX - padX, triRow);
          // Bottom corners: inset from bottom by pad, inset from edges by padX
          const botRow = gridY - pad;
          const oBL = gp(padX, botRow);
          const oBR = gp(gridX - padX, botRow);
          ctx.strokeStyle = 'rgba(210,165,50,0.45)';
          ctx.lineWidth = Math.max(0.8, bScale * 0.008);
          ctx.beginPath();
          // Bottom-left, up left side following cloth
          let p = gp(padX, botRow);
          ctx.moveTo(p.x, p.y);
          for (let gy = botRow - 1; gy >= triRow; gy--) { p = gp(padX, gy); ctx.lineTo(p.x, p.y); }
          // Triangle V — left side up to peak
          ctx.lineTo(oMid.x, oMid.y);
          // Peak down to right side
          p = gp(gridX - padX, triRow);
          ctx.lineTo(p.x, p.y);
          // Right side down following cloth
          for (let gy = triRow + 1; gy <= botRow; gy++) { p = gp(gridX - padX, gy); ctx.lineTo(p.x, p.y); }
          // Bottom line
          ctx.closePath();
          ctx.stroke();

          // Small 4-branch star below triangle peak
          const starY = oMid.y + bScale * 0.08;
          const starR = bScale * 0.04;
          ctx.fillStyle = 'rgba(210,165,50,0.5)';
          for (let si = 0; si < 4; si++) {
            const sAng = si * Math.PI / 2 - Math.PI / 2;
            ctx.save(); ctx.translate(oMid.x, starY); ctx.rotate(sAng);
            ctx.beginPath(); ctx.moveTo(0, -starR * 0.25); ctx.lineTo(starR, 0); ctx.lineTo(0, starR * 0.25);
            ctx.closePath(); ctx.fill(); ctx.restore();
          }

          // Emblem — griffin in sunburst
          const emPt = gp(Math.round(gridX / 2), Math.round(gridY * 0.5));
          const emCx = emPt.x, emCy = emPt.y, emS = dW * 0.35;
          const eA = 'rgba(210,155,50,';
          // Sunburst rays behind griffin
          ctx.fillStyle = eA + '0.2)';
          for (let ri = 0; ri < 12; ri++) {
            const ang = ri * Math.PI / 6, rLen = emS * 1.3, rW = emS * 0.12;
            ctx.save(); ctx.translate(emCx, emCy); ctx.rotate(ang);
            ctx.beginPath(); ctx.moveTo(emS*0.3,-rW); ctx.lineTo(rLen,0); ctx.lineTo(emS*0.3,rW);
            ctx.closePath(); ctx.fill(); ctx.restore();
          }
          // Outer circle
          ctx.strokeStyle = eA + '0.4)'; ctx.lineWidth = Math.max(0.8, bScale * 0.01);
          ctx.beginPath(); ctx.arc(emCx, emCy, emS * 0.85, 0, Math.PI * 2); ctx.stroke();
          // Griffin — rearing, facing right
          const gs = emS * 0.55;
          ctx.fillStyle = eA + '0.45)'; ctx.strokeStyle = eA + '0.5)'; ctx.lineWidth = Math.max(0.8, bScale * 0.007);
          ctx.beginPath();
          ctx.moveTo(emCx-gs*0.4,emCy+gs*0.9);
          ctx.lineTo(emCx-gs*0.5,emCy+gs*0.5); ctx.lineTo(emCx-gs*0.6,emCy+gs*0.3);
          ctx.bezierCurveTo(emCx-gs*0.55,emCy-gs*0.1,emCx-gs*0.35,emCy-gs*0.4,emCx-gs*0.1,emCy-gs*0.55);
          ctx.bezierCurveTo(emCx+gs*0.05,emCy-gs*0.7,emCx+gs*0.25,emCy-gs*0.8,emCx+gs*0.35,emCy-gs*0.65);
          ctx.lineTo(emCx+gs*0.55,emCy-gs*0.55); ctx.lineTo(emCx+gs*0.4,emCy-gs*0.5);
          ctx.bezierCurveTo(emCx+gs*0.35,emCy-gs*0.3,emCx+gs*0.4,emCy-gs*0.05,emCx+gs*0.45,emCy+gs*0.15);
          ctx.lineTo(emCx+gs*0.65,emCy+gs*0.05); ctx.lineTo(emCx+gs*0.7,emCy+gs*0.15); ctx.lineTo(emCx+gs*0.5,emCy+gs*0.25);
          ctx.lineTo(emCx+gs*0.45,emCy+gs*0.5); ctx.lineTo(emCx+gs*0.35,emCy+gs*0.9);
          ctx.bezierCurveTo(emCx+gs*0.1,emCy+gs*0.85,emCx-gs*0.15,emCy+gs*0.9,emCx-gs*0.4,emCy+gs*0.9);
          ctx.closePath(); ctx.fill(); ctx.stroke();
          // Wing
          ctx.fillStyle = eA + '0.3)';
          ctx.beginPath();
          ctx.moveTo(emCx-gs*0.2,emCy-gs*0.35);
          ctx.bezierCurveTo(emCx-gs*0.4,emCy-gs*0.8,emCx-gs*0.05,emCy-gs*1.0,emCx+gs*0.15,emCy-gs*0.85);
          ctx.bezierCurveTo(emCx+gs*0.3,emCy-gs*0.7,emCx+gs*0.2,emCy-gs*0.5,emCx+gs*0.05,emCy-gs*0.35);
          ctx.bezierCurveTo(emCx-gs*0.05,emCy-gs*0.25,emCx-gs*0.15,emCy-gs*0.3,emCx-gs*0.2,emCy-gs*0.35);
          ctx.closePath(); ctx.fill(); ctx.stroke();
          // Tail
          ctx.strokeStyle = eA + '0.4)'; ctx.lineWidth = Math.max(0.8, bScale * 0.008);
          ctx.beginPath();
          ctx.moveTo(emCx-gs*0.6,emCy+gs*0.3);
          ctx.bezierCurveTo(emCx-gs*0.8,emCy+gs*0.1,emCx-gs*0.85,emCy-gs*0.2,emCx-gs*0.65,emCy-gs*0.45);
          ctx.stroke();
          // Eye
          ctx.fillStyle = eA + '0.7)';
          ctx.beginPath(); ctx.arc(emCx+gs*0.2,emCy-gs*0.6,gs*0.06,0,Math.PI*2); ctx.fill();

          // Gold trim — outline using grid edge points
          ctx.strokeStyle = gM; ctx.lineWidth = Math.max(1, bScale * 0.02);
          ctx.beginPath();
          for (let gx = 0; gx <= gridX; gx++) { const p = gp(gx, 0); if (gx === 0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y); }
          for (let gy = 1; gy <= gridY; gy++) { const p = gp(gridX, gy); ctx.lineTo(p.x, p.y); }
          for (let gx = gridX - 1; gx >= 0; gx--) { const p = gp(gx, gridY); ctx.lineTo(p.x, p.y); }
          for (let gy = gridY - 1; gy >= 0; gy--) { const p = gp(0, gy); ctx.lineTo(p.x, p.y); }
          ctx.closePath(); ctx.stroke();

          // Gold crest — on top of everything, centered on crossbar
          const cBg = ctx.createRadialGradient(bScrX, crossY, 0, bScrX, crossY, crestR);
          cBg.addColorStop(0, 'rgb(120,30,18)'); cBg.addColorStop(0.6, 'rgb(95,22,12)'); cBg.addColorStop(1, 'rgb(75,16,8)');
          ctx.fillStyle = cBg;
          ctx.beginPath(); ctx.arc(bScrX, crossY, crestR, 0, Math.PI * 2); ctx.fill();
          // Bottom half — full thickness (matches crossbar)
          ctx.strokeStyle = gM; ctx.lineWidth = barThick;
          ctx.beginPath(); ctx.arc(bScrX, crossY, crestR, 0, Math.PI); ctx.stroke();
          // Top half — half thickness
          ctx.lineWidth = barThick * 0.5;
          ctx.beginPath(); ctx.arc(bScrX, crossY, crestR, Math.PI, Math.PI * 2); ctx.stroke();
          // 4-branch star
          ctx.fillStyle = gM;
          for (let si = 0; si < 4; si++) {
            const sAng = si * Math.PI / 2 - Math.PI / 2, sLen = crestR * 0.7, sW = crestR * 0.15;
            ctx.save(); ctx.translate(bScrX, crossY); ctx.rotate(sAng);
            ctx.beginPath(); ctx.moveTo(0, -sW); ctx.lineTo(sLen, 0); ctx.lineTo(0, sW); ctx.closePath(); ctx.fill(); ctx.restore();
          }
          ctx.fillStyle = gH;
          ctx.beginPath(); ctx.arc(bScrX, crossY, crestR * 0.12, 0, Math.PI * 2); ctx.fill();

          } catch(e) { /* prevent rotation leak */ }
          ctx.restore();
        }

        // God ray ON the flag
        {
          const flagScrX = projX(0.5, 22);
          const flagScrY = projY(22, 0.5);
          const rayAng = Math.atan2(flagScrY - sunY, flagScrX - sunX);
          const rayLen = Math.sqrt((flagScrX - sunX) ** 2 + (flagScrY - sunY) ** 2) * 1.15;
          const rayW = sunR * 0.8;
          const rex = sunX + Math.cos(rayAng) * rayLen;
          const rey = sunY + Math.sin(rayAng) * rayLen;
          const rpx = -Math.sin(rayAng), rpy = Math.cos(rayAng);
          ctx.save();
          ctx.globalCompositeOperation = 'lighter';
          ctx.filter = 'blur(' + Math.max(2, Math.round(H * 0.012)) + 'px)';
          const rG = ctx.createLinearGradient(sunX, sunY, rex, rey);
          rG.addColorStop(0, 'rgba(255,235,180,0.06)');
          rG.addColorStop(0.1, 'rgba(255,220,150,0.12)');
          rG.addColorStop(0.3, 'rgba(255,200,120,0.18)');
          rG.addColorStop(0.5, 'rgba(255,190,105,0.14)');
          rG.addColorStop(0.7, 'rgba(255,180,90,0.08)');
          rG.addColorStop(1, 'rgba(255,165,70,0)');
          ctx.fillStyle = rG;
          ctx.beginPath();
          ctx.moveTo(sunX + rpx * rayW * 0.1, sunY + rpy * rayW * 0.1);
          ctx.lineTo(sunX - rpx * rayW * 0.1, sunY - rpy * rayW * 0.1);
          ctx.lineTo(rex - rpx * rayW * 2.5, rey - rpy * rayW * 2.5);
          ctx.lineTo(rex + rpx * rayW * 2.5, rey + rpy * rayW * 2.5);
          ctx.closePath();
          ctx.fill();
          ctx.restore();
        }

        // Full-scene dramatic vignette
        ctx.save();
        const scVig = ctx.createRadialGradient(W*0.5, H*0.3, H*0.1, W*0.5, H*0.5, Math.max(W,H)*0.8);
        scVig.addColorStop(0, "rgba(0,0,0,0)");
        scVig.addColorStop(0.35, "rgba(0,0,0,0)");
        scVig.addColorStop(0.55, "rgba(1,0,0,0.12)");
        scVig.addColorStop(0.7, "rgba(1,0,0,0.3)");
        scVig.addColorStop(0.85, "rgba(0,0,0,0.5)");
        scVig.addColorStop(1, "rgba(0,0,0,0.68)");
        ctx.fillStyle = scVig;
        ctx.fillRect(0, 0, W, H);
        ctx.restore();
      } // end BATTLEGROUND block
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
Honour.displayName = 'Honour';


export { Honour };
