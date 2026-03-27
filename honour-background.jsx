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

    const isFull = animationsEnabled === 'full';
    const alphaScale = isFull ? 1.4 : 1.0;
    const bgBase = oledMode ? [0, 0, 0] : [12, 8, 4];

    let w, h;

    const init = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w;
      canvas.height = h;
    };
    init();
    window.addEventListener('resize', init);

    // Pseudo-random hash function for deterministic randomness
    const hash = (n) => { const s = Math.sin(n) * 43758.5453; return s - Math.floor(s); };
    const sceneSeed = 52908;

    // === Cloud system from cloud-demo ===
    const CLOUD_DEFS = [
      { name: "fume", wispN: 3, densMul: 2.8, densPeak: 50, densFall: [0.4, 0.15, 0.04], baseAlpha: 0.06, hazeThresh: 2, maxDens: 40, depthLevels: 1, alphaCurve: 0 },
      { name: "small", wispN: 4, densMul: 2.2, densPeak: 100, densFall: [0.55, 0.22, 0.06], baseAlpha: 0.35, hazeThresh: 5, maxDens: 120, depthLevels: 2, alphaCurve: 1 },
      { name: "medium", wispN: 5, densMul: 2.0, densPeak: 100, densFall: [0.55, 0.25, 0.08], baseAlpha: 0.42, hazeThresh: 4, maxDens: 140, depthLevels: 3, alphaCurve: 2 },
      { name: "big", wispN: 6, densMul: 1.8, densPeak: 100, densFall: [0.55, 0.25, 0.08], baseAlpha: 0.48, hazeThresh: 4, maxDens: 140, depthLevels: 4, alphaCurve: 2 }
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
      const shR = Math.round(50 + ds * 15 + lr * 10), shG = Math.round(16 + ds * 6 + lr * 4), shB = Math.round(5 + ds * 3 + lr * 2);
      // Lit: warm golden amber (NOT cream-white — warm gold like the reference)
      const ltR = Math.min(255, Math.round(210 + ds * 30 + proximity * 10)), ltG = Math.min(255, Math.round(140 + ds * 20 + proximity * 8)), ltB = Math.min(255, Math.round(70 + ds * 10 + proximity * 5));
      // Rim: bright warm orange-gold edge
      const rmR = Math.min(255, Math.round(220 + ds * 20)), rmG = Math.min(255, Math.round(150 + ds * 15 + proximity * 8)), rmB = Math.min(255, Math.round(60 + ds * 10 + proximity * 5));
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
          else if (levels === 2) sL = sL > 0.45 ? 0.85 : 0.4;
          else if (levels === 3) sL = sL > 0.6 ? 0.88 : sL > 0.3 ? 0.55 : 0.38;
          else { sL = sL > 0.65 ? 0.9 : sL > 0.48 ? 0.68 : sL > 0.3 ? 0.48 : sL > 0.15 ? 0.38 : 0.25; }
          sL *= lr;
          let r = Math.round(shR+(ltR-shR)*sL), g = Math.round(shG+(ltG-shG)*sL), bv = Math.round(shB+(ltB-shB)*sL);
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
        const minDist = sunR * 2;
        const clouds = [];
        const maxReach = Math.max(W, H) * 1.5;
        let id = 0;

        function getCachedBake(seed, balls, sunAngle, cType, dep, prox, rs) {
            return bakeMetaball(balls, sunAngle, cType, dep, prox, 0, rs);
        }

        function addC(seed, dist, angle, radius, dep, spd, cType) {
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
            const nCl = 15 + Math.floor(hash(s * 100) * 10);
            for (let c = 0; c < nCl; c++) {
                const cs = s * 1000 + c * 37;
                const rng2 = seededRandom(cs);
                const dist = Math.max(minDist, minDist + rng2() * (maxReach - minDist));
                const ang = phases[s] + rng2() * Math.PI * 2;
                const sr = rng2();
                let rad, cType;
                if (sr < 0.12) { rad = 75 + rng2() * 55; cType = 3; }
                else if (sr < 0.40) { rad = 35 + rng2() * 40; cType = 2; }
                else if (sr < 0.72) { rad = 18 + rng2() * 20; cType = 1; }
                else { rad = 8 + rng2() * 12; cType = 0; }
                const dep = Math.max(0, Math.min(1, (1 - s / 4) + (rng2() - 0.5) * 0.25));
                const spd = speeds[s] / (0.5 + rad / 60) * (0.55 + dep * 0.45) / (0.3 + dist / (H * 0.5));
                addC(cs, dist, ang, rad, dep, spd, cType);
                const nM = 6 + Math.floor(rng2() * 4);
                for (let m = 0; m < nM; m++) {
                    const ms = cs + 500 + m * 13;
                    const mr = seededRandom(ms);
                    const mRad = rad * (0.25 + mr() * 0.4);
                    const mType = cType > 0 ? cType - 1 : 0;
                    const mDist = Math.max(minDist, dist + (mr() - 0.5) * rad * 4);
                    const mAng = ang + (mr() - 0.5) * 1.0;
                    const mDep = Math.max(0, Math.min(1, dep + (mr() - 0.5) * 0.15));
                    addC(ms, mDist, mAng, mRad, mDep, speeds[s] / (0.5 + mRad / 60) * (0.55 + mDep * 0.45) / (0.3 + mDist / (H * 0.5)) * 1.1, mType);
                    const nSm = 3 + Math.floor(mr() * 3);
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
            const hCl = 9 + Math.floor(hash(hs * 200 + 77) * 6);
            for (let hc = 0; hc < hCl; hc++) {
                const hcs = 50000 + hs * 1000 + hc * 41;
                const hrng = seededRandom(hcs);
                const hDist = Math.max(hiMin, hiMin + Math.pow(hrng(), 0.33) * (hiMax - hiMin));
                const hAng = hiPh[hs] + hrng() * Math.PI * 2;
                const hsr = hrng();
                let hRad, hcT;
                if (hsr < 0.15) { hRad = 30 + hrng() * 30; hcT = 2; }
                else if (hsr < 0.50) { hRad = 14 + hrng() * 18; hcT = 1; }
                else { hRad = 6 + hrng() * 10; hcT = 0; }
                const hDep = Math.max(0, Math.min(1, (1 - hs / 3) + (hrng() - 0.5) * 0.2));
                addHi(hcs, hDist, hAng, hRad, hDep, hiSp[hs] / (0.5 + hRad / 60) * (0.55 + hDep * 0.45) / (0.3 + hDist / (H * 0.5)), hcT, hiSunY, 0.35);
                const hnM = 2 + Math.floor(hrng() * 2);
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
                const tAng = topPh[ts] + trng() * Math.PI * 2;
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

        const midLo = minDist;
        const midHi2 = maxReach * 0.85;
        for (let mf = 0; mf < 60; mf++) {
            const mfs = 90000 + mf * 71;
            const mfr = seededRandom(mfs);
            const mfDist = midLo + mfr() * (midHi2 - midLo);
            const mfAng = mfr() * Math.PI * 2;
            const mfRad = 15 + mfr() * 40;
            const mfT = mfRad > 50 ? 3 : mfRad > 30 ? 2 : mfRad > 15 ? 1 : 0;
            const mfDep = 0.25 + mfr() * 0.5;
            addC(mfs, mfDist, mfAng, mfRad, mfDep, 0.12 / (0.5 + mfRad / 60) * (0.55 + mfDep * 0.45) / (0.3 + mfDist / (H * 0.5)), mfT);
        }

        const outLo = minDist + (maxReach - minDist) * 0.2;
        const outHi = maxReach;
        for (let of2 = 0; of2 < 90; of2++) {
            const ofs = 80000 + of2 * 53;
            const ofr = seededRandom(ofs);
            const ofDist = outLo + ofr() * (outHi - outLo);
            const ofAng = ofr() * Math.PI * 2;
            const ofRad = 20 + ofr() * 55;
            const ofT = ofRad > 50 ? 3 : ofRad > 30 ? 2 : ofRad > 15 ? 1 : 0;
            const ofDep = 0.1 + ofr() * 0.4;
            addC(ofs, ofDist, ofAng, ofRad, ofDep, 0.08 / (0.5 + ofRad / 60) * (0.55 + ofDep * 0.45) / (0.3 + ofDist / (H * 0.5)), ofT);
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

    let lastFrame = 0;
    let sceneClouds = null;
    let cloudBuildPending = false;
    let cloudRefreshIdx = 0;
    let cloudTime = 0;
    let skyCache = null;
    let groundTexture = null; // pre-baked sky gradient canvas

    const honourFps = bgFps || (isFull ? 30 : 15);
    const honourInterval = Math.round(1000 / honourFps);

    const rng = (i, off) => { const s = Math.sin((i + sceneSeed) * 217.3 + off * 341.7) * 73291.9; return s - Math.floor(s); };
    const ihash = (n, off) => { let h = Math.imul(n + off, 2654435761) | 0; h = Math.imul(h ^ (h >>> 16), 0x45d9f3b); h = Math.imul(h ^ (h >>> 13), 0x45d9f3b); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };

    const draw = (t) => {
      animId = requestAnimationFrame(draw);
      if (t - lastFrame < honourInterval) return;
      lastFrame = t;
      const time = t * 0.0005;

      // (all pre-battleground effects removed — only sky + sun in battleground)

      // ===== BATTLEGROUND — ground-plan projected sword field =====
      {
        const W = canvas.width, H = canvas.height;
        const hY = H; // sky covers 100%

        // === SKY + SUN + CLOUDS (from cloud-demo) ===
        const sunX = W * 0.5, sunY = H * 0.3;
        const sunR = H * 0.06;

        // Sky — warm sunset gradient, light comes from sun, darkness from clouds only
        if (!skyCache || skyCache.width !== W || skyCache.height !== H) {
          skyCache = document.createElement('canvas'); skyCache.width = W; skyCache.height = H;
          const sc = skyCache.getContext('2d');
          // Base vertical gradient — warm sunset sky (light near horizon)
          const skyBg = sc.createLinearGradient(0, 0, 0, H);
          skyBg.addColorStop(0, 'rgb(35,18,10)');
          skyBg.addColorStop(0.15, 'rgb(65,30,12)');
          skyBg.addColorStop(0.30, 'rgb(120,55,20)');
          skyBg.addColorStop(0.45, 'rgb(180,95,40)');
          skyBg.addColorStop(0.60, 'rgb(230,150,75)');
          skyBg.addColorStop(0.75, 'rgb(250,190,95)');
          skyBg.addColorStop(0.88, 'rgb(255,215,120)');
          skyBg.addColorStop(1, 'rgb(255,235,155)');
          sc.fillStyle = skyBg; sc.fillRect(0, 0, W, H);
          // Sun warm radial glow — brightens the area around the sun
          const sunGlow = sc.createRadialGradient(sunX, sunY, 0, sunX, sunY, Math.max(W, H) * 0.6);
          sunGlow.addColorStop(0, 'rgba(255,240,180,0.5)');
          sunGlow.addColorStop(0.1, 'rgba(255,210,120,0.35)');
          sunGlow.addColorStop(0.25, 'rgba(255,180,80,0.2)');
          sunGlow.addColorStop(0.5, 'rgba(255,140,50,0.08)');
          sunGlow.addColorStop(1, 'rgba(255,100,30,0)');
          sc.fillStyle = sunGlow; sc.fillRect(0, 0, W, H);
          // Hot inner glow
          const skyR2 = sc.createRadialGradient(sunX, sunY, 0, sunX, sunY, H * 0.25);
          skyR2.addColorStop(0, 'rgba(255,245,200,0.6)');
          skyR2.addColorStop(0.2, 'rgba(255,220,140,0.35)');
          skyR2.addColorStop(0.5, 'rgba(255,180,90,0.12)');
          skyR2.addColorStop(1, 'rgba(200,120,50,0)');
          sc.fillStyle = skyR2; sc.fillRect(0, 0, W, H);
          // Sun disc halo
          const sh = sc.createRadialGradient(sunX, sunY, 0, sunX, sunY, sunR * 5);
          sh.addColorStop(0, 'rgba(255,255,230,0.8)');
          sh.addColorStop(0.05, 'rgba(255,245,180,0.5)');
          sh.addColorStop(0.12, 'rgba(255,220,110,0.25)');
          sh.addColorStop(0.3, 'rgba(255,180,60,0.08)');
          sh.addColorStop(1, 'rgba(200,100,20,0)');
          sc.fillStyle = sh; sc.fillRect(0, 0, W, H);
          // Sun disc core
          const sd = sc.createRadialGradient(sunX, sunY, 0, sunX, sunY, sunR);
          sd.addColorStop(0, 'rgba(255,255,240,1)');
          sd.addColorStop(0.3, 'rgba(255,250,200,0.9)');
          sd.addColorStop(0.6, 'rgba(255,225,140,0.5)');
          sd.addColorStop(1, 'rgba(255,190,80,0)');
          sc.fillStyle = sd; sc.beginPath(); sc.arc(sunX, sunY, sunR * 1.8, 0, Math.PI * 2); sc.fill();
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
        // Draw clouds with velocity stretch
        for (let di = 0; di < sceneClouds.length; di++) {
          const cloud = sceneClouds[di], angSpeed = cloud.orbitSpeed * 0.025;
          cloud.angle += angSpeed;
          const ca = cloud.angle, flatR = cloud.orbitFlatten || 0.7;
          const cx2 = cloud.sunX + Math.cos(ca) * cloud.orbitDist;
          const cy2 = cloud.sunY + Math.sin(ca) * cloud.orbitDist * flatR;
          const bk = cloud.baked; const bkSrc = bk && (bk.bitmap || bk.canvas); if (!bkSrc) continue;
          const margin2 = Math.max(bk.w, bk.h) * 1.5;
          if (cx2 + bk.ox > W + margin2 || cx2 + bk.ox + bk.w < -margin2 || cy2 + bk.oy > H + margin2 || cy2 + bk.oy + bk.h < -margin2) continue;
          const vx = -Math.sin(ca) * cloud.orbitDist * angSpeed, vy = Math.cos(ca) * cloud.orbitDist * flatR * angSpeed;
          const speed = Math.sqrt(vx * vx + vy * vy);
          const drawW = bk.w, drawH = bk.h;
          if (speed > 0.01) {
            const stretchAmt = 1 + Math.min(0.6, speed * 0.25), squeezeAmt = 1 / Math.sqrt(stretchAmt);
            const centSkew = Math.max(-0.3, Math.min(0.3, angSpeed * cloud.orbitDist * 0.0004));
            const vAngle = Math.atan2(vy, vx);
            const ccx = cx2 + bk.ox + drawW * 0.5, ccy = cy2 + bk.oy + drawH * 0.5;
            ctx.save(); ctx.translate(ccx, ccy); ctx.rotate(vAngle);
            ctx.transform(stretchAmt, centSkew, 0, squeezeAmt, 0, 0);
            ctx.rotate(-vAngle); ctx.drawImage(bkSrc, -drawW * 0.5, -drawH * 0.5, drawW, drawH); ctx.restore();
          } else {
            ctx.drawImage(bkSrc, cx2 + bk.ox, cy2 + bk.oy, drawW, drawH);
          }
        }
        // God rays — fan downward from sun toward ground, matching camera angle
        ctx.save(); ctx.globalCompositeOperation = 'lighter';
        const rayCount = 12;
        // Rays fan from sun downward toward the ground plane
        // Camera looks up at sun (sun at 30% height, horizon at 75%)
        // Center ray direction: straight down from sun to ground center
        const rayCenterAngle = Math.PI * 0.5; // straight down
        const rayConeSpread = Math.PI * 0.55; // wide fan covering most of the ground
        for (let ri2 = 0; ri2 < rayCount; ri2++) {
          const rayRng = seededRandom(ri2 * 777 + 42);
          // Distribute rays across the cone with randomized spacing
          const t = (ri2 + rayRng() * 0.6 - 0.3) / (rayCount - 1);
          const rayAngle = rayCenterAngle - rayConeSpread * 0.5 + t * rayConeSpread;
          // Rays extend from sun all the way to bottom of screen
          const rayLen = (H - sunY) * (1.0 + rayRng() * 0.3);
          // Width varies — some thick, some thin, like real crepuscular rays
          const rayW = sunR * (0.3 + rayRng() * 1.2);
          const ex = sunX + Math.cos(rayAngle) * rayLen;
          const ey = sunY + Math.sin(rayAngle) * rayLen;
          // Warm golden color, varying opacity
          const rayAlpha = 0.03 + rayRng() * 0.05;
          const rayGrad = ctx.createLinearGradient(sunX, sunY, ex, ey);
          rayGrad.addColorStop(0, 'rgba(255,240,170,' + (rayAlpha * 1.2) + ')');
          rayGrad.addColorStop(0.15, 'rgba(255,215,120,' + rayAlpha + ')');
          rayGrad.addColorStop(0.5, 'rgba(255,180,70,' + (rayAlpha * 0.4) + ')');
          rayGrad.addColorStop(0.8, 'rgba(255,140,40,' + (rayAlpha * 0.12) + ')');
          rayGrad.addColorStop(1, 'rgba(255,100,20,0)');
          ctx.fillStyle = rayGrad;
          ctx.beginPath();
          const perpX = -Math.sin(rayAngle), perpY = Math.cos(rayAngle);
          // Narrow at sun, widens as it reaches the ground
          ctx.moveTo(sunX + perpX * rayW * 0.1, sunY + perpY * rayW * 0.1);
          ctx.lineTo(sunX - perpX * rayW * 0.1, sunY - perpY * rayW * 0.1);
          ctx.lineTo(ex - perpX * rayW * 3.5, ey - perpY * rayW * 3.5);
          ctx.lineTo(ex + perpX * rayW * 3.5, ey + perpY * rayW * 3.5);
          ctx.closePath(); ctx.fill();
        }
        ctx.restore();
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
            // Only medium and big clouds darken — and less aggressively
            const darkness = cl.cloudType >= 3 ? 0.82 : 0.88;
            const dStr = Math.round(darkness * 255);
            const midStr = Math.round(darkness * 255 + (255 - darkness * 255) * 0.6);
            const shadowGrad = ctx.createRadialGradient(cx3, cy3, 0, cx3, cy3, shadowR);
            shadowGrad.addColorStop(0, 'rgb(' + dStr + ',' + dStr + ',' + dStr + ')');
            shadowGrad.addColorStop(0.5, 'rgb(' + midStr + ',' + midStr + ',' + midStr + ')');
            shadowGrad.addColorStop(1, 'rgb(255,255,255)');
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
        // Anamorphic streak — horizontal line through sun
        const streakGrad = ctx.createLinearGradient(sunX - W * 0.4, sunY, sunX + W * 0.4, sunY);
        streakGrad.addColorStop(0, 'rgba(255,200,100,0)');
        streakGrad.addColorStop(0.3, 'rgba(255,220,140,0.02)');
        streakGrad.addColorStop(0.5, 'rgba(255,240,180,0.04)');
        streakGrad.addColorStop(0.7, 'rgba(255,220,140,0.02)');
        streakGrad.addColorStop(1, 'rgba(255,200,100,0)');
        ctx.fillStyle = streakGrad;
        ctx.fillRect(sunX - W * 0.4, sunY - sunR * 0.3, W * 0.8, sunR * 0.6);
        ctx.restore();

        // Atmospheric haze near horizon
        const hazeY = H * 0.65;
        const haze = ctx.createLinearGradient(0, hazeY, 0, H);
        haze.addColorStop(0, 'rgba(200,140,60,0)');
        haze.addColorStop(0.3, 'rgba(200,140,60,0.08)');
        haze.addColorStop(0.6, 'rgba(180,110,40,0.15)');
        haze.addColorStop(1, 'rgba(150,80,25,0.2)');
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

        // --- Draw curved ground strips ---
        const zNear = camZ + 0.05, zFar = 50, zSlices = 200;
        const xSegs = 12;

        // Dark base fill — follows curve
        ctx.fillStyle = 'rgb(18,10,6)';
        ctx.beginPath();
        for (let j = 0; j <= xSegs; j++) {
          const sx = W * j / xSegs;
          const wx = (sx - W * 0.5) * (zFar - camZ) / focal;
          j === 0 ? ctx.moveTo(sx, projY(zFar, wx)) : ctx.lineTo(sx, projY(zFar, wx));
        }
        ctx.lineTo(W, H); ctx.lineTo(0, H);
        ctx.closePath(); ctx.fill();

        // Smooth ground strips — full width, no cell splitting
        for (let i = zSlices - 1; i >= 0; i--) {
          const t0 = i / zSlices, t1 = (i + 1) / zSlices;
          const wz0 = zNear * Math.pow(zFar / zNear, t0);
          const wz1 = zNear * Math.pow(zFar / zNear, t1);

          const depthT = Math.pow(t0, 0.6);
          const r = Math.round(90 - 72 * depthT);
          const g = Math.round(55 - 45 * depthT);
          const b = Math.round(32 - 26 * depthT);
          ctx.fillStyle = `rgb(${r},${g},${b})`;

          ctx.beginPath();
          for (let j = 0; j <= xSegs; j++) {
            const sx = W * j / xSegs;
            const wx = (sx - W * 0.5) * (wz1 - camZ) / focal;
            j === 0 ? ctx.moveTo(sx, projY(wz1, wx)) : ctx.lineTo(sx, projY(wz1, wx));
          }
          for (let j = xSegs; j >= 0; j--) {
            const sx = W * j / xSegs;
            const wx = (sx - W * 0.5) * (wz0 - camZ) / focal;
            ctx.lineTo(sx, projY(wz0, wx));
          }
          ctx.closePath();
          ctx.fill();
        }

        // 3D ground lighting — radial warm glow from sun's ground projection
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        const sunGroundX = W * 0.5; // sun is directly above center
        const sunGroundY = edgeY + 5; // just below horizon
        const lightR = Math.max(W, H) * 0.6;
        const groundLight = ctx.createRadialGradient(sunGroundX, sunGroundY, 0, sunGroundX, sunGroundY, lightR);
        groundLight.addColorStop(0, 'rgba(180,120,50,0.12)');
        groundLight.addColorStop(0.3, 'rgba(140,80,30,0.06)');
        groundLight.addColorStop(0.7, 'rgba(80,40,15,0.02)');
        groundLight.addColorStop(1, 'rgba(30,15,5,0)');
        ctx.fillStyle = groundLight;
        ctx.fillRect(0, edgeY - 10, W, H - edgeY + 10);
        ctx.restore();

        // Baked dirt/dust noise texture overlaid on ground
        if (!groundTexture || groundTexture.width !== W) {
          groundTexture = document.createElement('canvas');
          groundTexture.width = W; groundTexture.height = Math.ceil(H * 0.3);
          const gtx = groundTexture.getContext('2d');
          const gW = groundTexture.width, gH = groundTexture.height;
          // Paint soft noise blotches — varying brightness for natural ground
          for (let p = 0; p < 300; p++) {
            const pSeed = p * 59 + sceneSeed + 8000;
            const px = hash(pSeed) * gW;
            const py = hash(pSeed + 100) * gH;
            const pSize = 3 + hash(pSeed + 200) * 20;
            const pBright = hash(pSeed + 300);
            const pAlpha = 0.03 + pBright * 0.05;
            // Alternately lighten or darken
            if (pBright > 0.5) {
              const grad = gtx.createRadialGradient(px, py, 0, px, py, pSize);
              grad.addColorStop(0, `rgba(120,80,40,${pAlpha})`);
              grad.addColorStop(1, 'rgba(120,80,40,0)');
              gtx.fillStyle = grad;
            } else {
              const grad = gtx.createRadialGradient(px, py, 0, px, py, pSize);
              grad.addColorStop(0, `rgba(5,3,1,${pAlpha})`);
              grad.addColorStop(1, 'rgba(5,3,1,0)');
              gtx.fillStyle = grad;
            }
            gtx.beginPath(); gtx.arc(px, py, pSize, 0, Math.PI * 2); gtx.fill();
          }
        }
        ctx.drawImage(groundTexture, 0, edgeY - 5, W, H * 0.3);

        // --- SWORDS spread equally on 50m × 50m plane, 2m spacing ---
        const planeSize = 50;
        const baseSpacing = 1;
        const swords = [];
        let swordIdx = 0;

        // Walk the grid with per-sword spacing variation (0.5 to 2)
        for (let bz = 0; bz < planeSize; ) {
          const rowSpacingZ = 0.5 + ihash(swordIdx + 7000, sceneSeed) * 1.5;
          for (let bx = -planeSize / 2; bx < planeSize / 2; ) {
            const cellSpacingX = 0.5 + ihash(swordIdx + 8000, sceneSeed) * 1.5;
            const jx = bx + (ihash(swordIdx, sceneSeed + 101) - 0.5) * cellSpacingX * 0.3;
            const jz = bz + (ihash(swordIdx, sceneSeed + 100) - 0.5) * rowSpacingZ * 0.3 + 0.03;
            swordIdx++;
            bx += cellSpacingX;
            if (jz - camZ < 0.02) continue;  // skip swords too close
            // Halve sword density in the far half of the field
            const midZ = camZ + (planeSize - camZ) * 0.5;
            if (jz > midZ && (swordIdx & 1)) continue;

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

            swords.push({ scrX, scrY, size, lean, yRot, yAngle, wz: jz, wx: jx, shuffle: rng(swordIdx, 200), idx: swordIdx });
          }
          bz += rowSpacingZ;
        }

        // Sort back-to-front
        swords.sort((a, b) => b.wz - a.wz);

        for (const s of swords) {
          // Overall 114.7cm: blade 90.3, guard ~1, grip 18.4, pommel ~5
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
          // Flip sword so blade points down into ground, hilt sticks up
          const buried = bladeH * (0.55 + rng(s.idx, 777) * 0.1);
          ctx.beginPath();
          ctx.rect(0, 0, W, s.scrY);
          ctx.clip();
          ctx.translate(s.scrX, s.scrY - buried);
          ctx.scale(1, -1);
          ctx.rotate(-s.lean);
          // 3D Y-axis rotation — skew creates perspective effect
          ctx.transform(Math.abs(s.yRot), 0, Math.sin(s.yAngle) * 0.15, 1, 0, 0);

          // Metallic sword shading — sun proximity + direction
          const sdx2 = s.scrX - sunX, sdy2 = s.scrY - sunY;
          const sunDist2 = Math.sqrt(sdx2 * sdx2 + sdy2 * sdy2);
          const sunProx2 = Math.max(0, 1 - sunDist2 / (Math.max(W, H) * 0.7));
          const lit = sunProx2 * sunProx2;
          const leftLight = s.scrX > sunX;
          const dR = Math.round(20 + lit * 30), dG = Math.round(20 + lit * 18), dB = Math.round(22 + lit * 8);
          const lR = Math.round(55 + lit * 100), lG = Math.round(52 + lit * 60), lB = Math.round(55 + lit * 25);
          const darkSide = `rgb(${dR},${dG},${dB})`;
          const lightSide = `rgb(${lR},${lG},${lB})`;

          // Blade — split into two halves along Y axis
          const tipEnd = -bladeH + pomDia * 2;
          const ov = 1;
          // Left half
          ctx.fillStyle = leftLight ? lightSide : darkSide;
          ctx.beginPath();
          ctx.moveTo(0, -bladeH);
          ctx.bezierCurveTo(-bladeW * 0.25, -bladeH + pomDia * 0.5,
                            -bladeW * 0.5, tipEnd - pomDia,
                            -bladeW / 2, tipEnd);
          ctx.lineTo(-bladeW / 2, ov);
          ctx.lineTo(0, ov);
          ctx.closePath();
          ctx.fill();
          // Right half
          ctx.fillStyle = leftLight ? darkSide : lightSide;
          ctx.beginPath();
          ctx.moveTo(0, -bladeH);
          ctx.bezierCurveTo(bladeW * 0.25, -bladeH + pomDia * 0.5,
                            bladeW * 0.5, tipEnd - pomDia,
                            bladeW / 2, tipEnd);
          ctx.lineTo(bladeW / 2, ov);
          ctx.lineTo(0, ov);
          ctx.closePath();
          ctx.fill();
          ctx.fillStyle = darkSide;
          // Guard — varies per sword
          const guardType = ((s.idx * 2654435761 >>> 0) ^ (s.idx * 40503 >>> 0)) % 4;
          ctx.beginPath();
          if (guardType === 1) {
            // Tapered — wider at ends, narrow in middle, spans 0 to guardH
            const endH = guardH * 2;
            ctx.moveTo(-guardW / 2, guardH / 2 - endH / 2);
            ctx.lineTo(-guardW / 2, guardH / 2 + endH / 2);
            ctx.bezierCurveTo(-guardW / 4, guardH, guardW / 4, guardH, guardW / 2, guardH / 2 + endH / 2);
            ctx.lineTo(guardW / 2, guardH / 2 - endH / 2);
            ctx.bezierCurveTo(guardW / 4, 0, -guardW / 4, 0, -guardW / 2, guardH / 2 - endH / 2);
            ctx.closePath();
          } else if (guardType === 2) {
            // Curved down — flat ends, spans 0 to guardH
            ctx.moveTo(-guardW / 2, 0);
            ctx.lineTo(-guardW / 2, guardH);
            ctx.quadraticCurveTo(0, guardH * 3, guardW / 2, guardH);
            ctx.lineTo(guardW / 2, 0);
            ctx.quadraticCurveTo(0, guardH * 2, -guardW / 2, 0);
            ctx.closePath();
          } else if (guardType === 3) {
            // Three segmented — center block + two end blocks
            const segW = guardW * 0.12;
            const segH = guardH * 1.5;
            ctx.rect(-guardW / 2 - segW / 2, -segH / 2 + guardH / 2, segW, segH);
            ctx.rect(-segW / 2, 0, segW, guardH);
            ctx.rect(guardW / 2 - segW / 2, -segH / 2 + guardH / 2, segW, segH);
            ctx.rect(-guardW / 2, 0, guardW, guardH);
          } else {
            // Straight (default)
            ctx.rect(-guardW / 2, 0, guardW, guardH);
          }
          ctx.fill();
          // Grip — straight rectangle (overlap into guard and pommel)
          const gripBot = guardH + gripH;
          ctx.fillRect(-gripW / 2, guardH - ov, gripW, gripH + ov * 2);
          // Pommel — sits directly on grip
          let ph = (s.idx * 2246822519 + 400) | 0; ph = Math.imul(ph ^ (ph >>> 16), 0x45d9f3b); ph = Math.imul(ph ^ (ph >>> 13), 0x45d9f3b); ph = ph ^ (ph >>> 16);
          const pommelType = (ph >>> 0) % 2;
          ctx.beginPath();
          if (pommelType === 1) {
            // Circle
            ctx.arc(0, gripBot + pomRy, pomRy, 0, Math.PI * 2);
          } else {
            // Fan — narrow flat bottom at grip, inward curved sides, wide curved top
            const fanBotW = gripW * 0.6;    // half-width at bottom (narrow, at grip)
            const fanTopW = bladeW * 0.8;   // half-width at top
            const fanH = pomDia;
            ctx.moveTo(-fanBotW, gripBot);  // flat bottom-left (grip connection)
            ctx.lineTo(fanBotW, gripBot);   // flat bottom-right
            // Right side — curves inward
            ctx.quadraticCurveTo(fanBotW * 0.5, gripBot + fanH * 0.5,
                                  fanTopW, gripBot + fanH);
            // Top — curves outward (away from grip)
            ctx.quadraticCurveTo(0, gripBot + fanH + fanH * 0.5,
                                  -fanTopW, gripBot + fanH);
            // Left side — curves inward
            ctx.quadraticCurveTo(-fanBotW * 0.5, gripBot + fanH * 0.5,
                                  -fanBotW, gripBot);
            ctx.closePath();
          }
          ctx.fill();

          ctx.restore();
        }

      } // end BATTLEGROUND block
    };

    animId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', init);
    };
  }, [oledMode, animationsEnabled, bgResolution, bgFps]);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none" style={{zIndex: 1, willChange: 'transform'}} aria-hidden="true" role="presentation" />;
});
Honour.displayName = 'Honour';
