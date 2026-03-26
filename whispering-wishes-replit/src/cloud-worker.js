/* Cloud baking Web Worker — generates all cloud bitmaps off main thread */
/* eslint-disable no-restricted-globals */

function hash(n) { var x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }
function seededRandom(seed) { var s = seed; return function() { s = (s * 9301 + 49297) % 233280; return s / 233280; }; }

var CLOUD_DEFS = [
  { name: "fume", wispN: 3, densMul: 2.8, densPeak: 50, densFall: [0.4, 0.15, 0.04], baseAlpha: 0.06, hazeThresh: 2, maxDens: 40, depthLevels: 1, alphaCurve: 0 },
  { name: "small", wispN: 4, densMul: 2.2, densPeak: 100, densFall: [0.55, 0.22, 0.06], baseAlpha: 0.35, hazeThresh: 5, maxDens: 120, depthLevels: 2, alphaCurve: 1 },
  { name: "medium", wispN: 5, densMul: 2.0, densPeak: 100, densFall: [0.55, 0.25, 0.08], baseAlpha: 0.42, hazeThresh: 4, maxDens: 140, depthLevels: 3, alphaCurve: 2 },
  { name: "big", wispN: 6, densMul: 1.8, densPeak: 100, densFall: [0.55, 0.25, 0.08], baseAlpha: 0.48, hazeThresh: 4, maxDens: 140, depthLevels: 4, alphaCurve: 2 }
];

function generateBalls(seed, baseRadius, cloudType) {
  var def = CLOUD_DEFS[cloudType]; var rng = seededRandom(seed); var balls = [];
  function spawnCluster(cx, cy, radius, depth, maxDepth) {
    balls.push({ cx: cx, cy: cy, r: radius * (0.6 + rng() * 0.5) });
    if (depth >= maxDepth) return;
    var cc = Math.floor(1 + rng() * 2);
    for (var c = 0; c < cc; c++) {
      var a = rng() * Math.PI * 2, d = radius * (0.3 + rng() * 0.7);
      var nx = (rng() - 0.5) * radius * 0.4, ny = (rng() - 0.5) * radius * 0.4;
      spawnCluster(cx + Math.cos(a) * d + nx, cy + Math.sin(a) * d + ny, radius * (0.35 + rng() * 0.35), depth + 1, maxDepth);
    }
  }
  var fd = cloudType === 0 ? 1 : cloudType === 1 ? 1 : 2;
  var sc = cloudType === 0 ? 1 : cloudType === 1 ? 1 : cloudType === 2 ? 2 : 3;
  var sr = baseRadius * (cloudType === 0 ? 0.5 : 0.4);
  for (var s = 0; s < sc; s++) {
    var sa = rng() * Math.PI * 2, sd = baseRadius * rng() * 0.2;
    spawnCluster(Math.cos(sa) * sd, Math.sin(sa) * sd, sr * (0.7 + rng() * 0.6), 0, fd);
  }
  var wc = def.wispN + Math.floor(rng() * 3);
  for (var w = 0; w < wc; w++) {
    var wa = rng() * Math.PI * 2, wd = baseRadius * (0.4 + rng() * 0.6), wr = baseRadius * (0.05 + rng() * 0.12);
    balls.push({ cx: Math.cos(wa) * wd + (rng() - 0.5) * baseRadius * 0.3, cy: Math.sin(wa) * wd + (rng() - 0.5) * baseRadius * 0.3, r: wr });
  }
  return balls;
}

function bakeMetaball(balls, sunAngle, cloudType, depth, proximity, occlusion, resScale) {
  var def = CLOUD_DEFS[cloudType]; var sc = resScale || 1;
  var margin = 2.5, minX = 1e9, minY = 1e9, maxX = -1e9, maxY = -1e9;
  for (var i = 0; i < balls.length; i++) { var b = balls[i]; minX = Math.min(minX, b.cx - b.r * margin); minY = Math.min(minY, b.cy - b.r * margin); maxX = Math.max(maxX, b.cx + b.r * margin); maxY = Math.max(maxY, b.cy + b.r * margin); }
  var pad = 6; var fullW = Math.ceil(maxX - minX) + pad * 2, fullH = Math.ceil(maxY - minY) + pad * 2;
  if (fullW <= 0 || fullH <= 0 || fullW > 400 || fullH > 400) return null;
  var w = Math.max(4, Math.round(fullW * sc)), h = Math.max(4, Math.round(fullH * sc));
  var ox = (-minX + pad) * sc, oy = (-minY + pad) * sc;
  var dCvs = new OffscreenCanvas(w, h);
  var dCtx = dCvs.getContext("2d"); dCtx.globalCompositeOperation = "lighter";
  var fo = def.densFall, pk = def.densPeak;
  for (var bi = 0; bi < balls.length; bi++) {
    var ball = balls[bi], bx = ox + ball.cx * sc, by = oy + ball.cy * sc, br = ball.r * def.densMul * sc;
    var grad = dCtx.createRadialGradient(bx, by, 0, bx, by, br);
    grad.addColorStop(0, "rgba(" + pk + "," + pk + "," + pk + ",1)");
    grad.addColorStop(0.25, "rgba(" + pk + "," + pk + "," + pk + "," + fo[0] + ")");
    grad.addColorStop(0.5, "rgba(" + pk + "," + pk + "," + pk + "," + fo[1] + ")");
    grad.addColorStop(0.75, "rgba(" + pk + "," + pk + "," + pk + "," + fo[2] + ")");
    grad.addColorStop(1, "rgba(0,0,0,0)");
    dCtx.fillStyle = grad; dCtx.beginPath(); dCtx.arc(bx, by, br, 0, Math.PI * 2); dCtx.fill();
  }
  var dd = dCtx.getImageData(0, 0, w, h).data;
  var oCvs = new OffscreenCanvas(w, h);
  var oCtx = oCvs.getContext("2d"), oD = oCtx.createImageData(w, h), od = oD.data;
  function dens(x, y) { return (x < 0 || x >= w || y < 0 || y >= h) ? 0 : dd[(y * w + x) * 4]; }
  var sdx = Math.cos(sunAngle), sdy = Math.sin(sunAngle), levels = def.depthLevels, bAlpha = def.baseAlpha, hT = def.hazeThresh, mD = def.maxDens;
  var lr = 1 - (occlusion || 0) * 0.7, ds = 1 - depth;
  var shR = Math.round(8 + ds * 12 + lr * 40), shG = Math.round(4 + ds * 6 + lr * 40), shB = Math.round(3 + ds * 4 + lr * 40);
  var ltR = Math.round(55 + ds * 50 + proximity * 30 + lr * 40), ltG = Math.round(32 + ds * 25 + proximity * 15 + lr * 30), ltB = Math.round(18 + ds * 14 + proximity * 8 + lr * 25);
  var rmR = Math.min(255, Math.round(140 + ds * 50 + proximity * 60)), rmG = Math.min(255, Math.round(80 + ds * 25 + proximity * 30)), rmB = Math.min(255, Math.round(30 + ds * 10 + proximity * 12));
  for (var py = 2; py < h - 2; py += 2) { for (var px = 2; px < w - 2; px += 2) {
    var idx = (py * w + px) * 4, density = dd[idx]; if (density < hT) continue;
    var thick = Math.min(1, (density - hT) / (mD - hT));
    var gx = (dens(px+1,py)*2+dens(px+2,py))-(dens(px-1,py)*2+dens(px-2,py));
    var gy = (dens(px,py+1)*2+dens(px,py+2))-(dens(px,py-1)*2+dens(px,py-2));
    var gl = Math.sqrt(gx*gx+gy*gy), nx2 = 0, ny2 = 0; if (gl > 1) { nx2 = -gx/gl; ny2 = -gy/gl; }
    var sunF = (nx2*sdx+ny2*sdy)*0.5+0.5, thin = 1-thick;
    var rim = thin*thin*thin*Math.max(0,sunF)*0.7, sL = sunF*(0.35+thick*0.65);
    if (gl < 2) { sL *= 0.4; rim = 0; }
    if (levels <= 1) sL = 0.5;
    else if (levels === 2) sL = sL > 0.45 ? 0.85 : 0.2;
    else if (levels === 3) sL = sL > 0.6 ? 0.9 : sL > 0.3 ? 0.5 : 0.15;
    else { var band = sL > 0.7 ? 0.92 : sL > 0.45 ? 0.65 : sL > 0.2 ? 0.35 : 0.1; sL = band + (sL - band) * 0.3; }
    sL *= lr;
    var r = Math.round(shR+(ltR-shR)*sL), g = Math.round(shG+(ltG-shG)*sL), bv = Math.round(shB+(ltB-shB)*sL);
    if (levels >= 2) { r = Math.min(255,r+Math.round(rmR*rim*0.4*lr)); g = Math.min(255,g+Math.round(rmG*rim*0.4*lr)); bv = Math.min(255,bv+Math.round(rmB*rim*0.4*lr)); }
    var alpha; if (def.alphaCurve===0) alpha=bAlpha*thick; else if (def.alphaCurve===1) alpha=bAlpha*thick*(0.4+thick*0.6); else alpha=bAlpha*thick*thick*(0.3+thick*0.7);
    od[idx]=r; od[idx+1]=g; od[idx+2]=bv; od[idx+3]=Math.round(alpha*255);
    if(px+1<w){var i2=idx+4;od[i2]=r;od[i2+1]=g;od[i2+2]=bv;od[i2+3]=od[idx+3];}
    if(py+1<h){var i3=idx+w*4;od[i3]=r;od[i3+1]=g;od[i3+2]=bv;od[i3+3]=od[idx+3];if(px+1<w){var i4=i3+4;od[i4]=r;od[i4+1]=g;od[i4+2]=bv;od[i4+3]=od[idx+3];}}
  } }
  oCtx.putImageData(oD, 0, 0);
  return { canvas: oCvs, ox: minX - pad, oy: minY - pad, w: fullW, h: fullH, sc: sc };
}

function buildClouds(W, H) {
  var sunX = W * 0.5, sunY = H * 0.3, sunR = H * 0.08;
  var minDist = sunR * 2, clouds = [], maxReach = Math.max(W, H) * 1.5, id = 0;
  function addC(seed, dist, angle, radius, dep, spd, cType) {
    var prox = Math.max(0, 1 - dist / maxReach);
    var balls = generateBalls(seed, radius, cType);
    var cx = sunX + Math.cos(angle) * dist, cy = sunY + Math.sin(angle) * dist * 0.7;
    var rs = cType <= 1 ? 0.5 : 1;
    var baked = bakeMetaball(balls, Math.atan2(sunY - cy, sunX - cx), cType, dep, prox, 0, rs);
    if (!baked) return;
    clouds.push({ id: id++, sunX: sunX, sunY: sunY, orbitDist: dist, angle: angle, orbitSpeed: spd, balls: balls, baked: baked, seed: seed, depth: dep, proximity: prox, baseRadius: radius, cloudType: cType });
  }
  function addHi(seed, dist, angle, radius, dep, spd, cType, layerY, layerFlat) {
    var prox = Math.max(0, 1 - dist / maxReach);
    var balls = generateBalls(seed, radius, cType);
    var hcy = layerY + Math.sin(angle) * dist * layerFlat;
    var rs = cType <= 1 ? 0.5 : 1;
    var baked = bakeMetaball(balls, Math.atan2(sunY - hcy, sunX - Math.cos(angle) * dist - sunX), cType, dep, prox, 0, rs);
    if (!baked) return;
    clouds.push({ id: id++, sunX: sunX, sunY: layerY, orbitDist: dist, angle: angle, orbitSpeed: spd, balls: balls, baked: baked, seed: seed, depth: dep, proximity: prox, baseRadius: radius, cloudType: cType, orbitFlatten: layerFlat });
  }
  var speeds = [0.04, 0.07, 0.11, 0.18, 0.28], phases = [0, 1.0, 2.1, 3.4, 4.8];
  for (var s = 0; s < 5; s++) {
    var nCl = 8 + Math.floor(hash(s * 100) * 5);
    for (var c = 0; c < nCl; c++) {
      var cs = s*1000+c*37, rng2 = seededRandom(cs);
      var dist = Math.max(minDist, minDist + rng2() * (maxReach - minDist));
      var ang = phases[s] + rng2() * Math.PI * 2, sr = rng2(), rad, cType;
      if (sr < 0.12) { rad = 75+rng2()*55; cType = 3; } else if (sr < 0.40) { rad = 35+rng2()*40; cType = 2; } else if (sr < 0.72) { rad = 18+rng2()*20; cType = 1; } else { rad = 8+rng2()*12; cType = 0; }
      var dep = Math.max(0, Math.min(1, (1-s/4)+(rng2()-0.5)*0.25));
      var spd = speeds[s]/(0.5+rad/60)*(0.55+dep*0.45)/(0.3+dist/(H*0.5));
      addC(cs, dist, ang, rad, dep, spd, cType);
      var nM = 3+Math.floor(rng2()*2);
      for (var m = 0; m < nM; m++) {
        var ms = cs+500+m*13, mr = seededRandom(ms), mRad = rad*(0.25+mr()*0.4), mType = cType>0?cType-1:0;
        var mDist = Math.max(minDist, dist+(mr()-0.5)*rad*4), mAng = ang+(mr()-0.5)*1.0;
        var mDep = Math.max(0, Math.min(1, dep+(mr()-0.5)*0.15));
        addC(ms, mDist, mAng, mRad, mDep, speeds[s]/(0.5+mRad/60)*(0.55+mDep*0.45)/(0.3+mDist/(H*0.5))*1.1, mType);
        var nSm = 1+Math.floor(mr()*2);
        for (var sm = 0; sm < nSm; sm++) {
          var ss = ms+200+sm*7, sr2 = seededRandom(ss), sRad = mRad*(0.2+sr2()*0.35), sType = mType>0?mType-1:0;
          var sDist = Math.max(minDist, mDist+(sr2()-0.5)*mRad*4), sAng = mAng+(sr2()-0.5)*1.2;
          var sDep = Math.max(0, Math.min(1, mDep+(sr2()-0.5)*0.2));
          addC(ss, sDist, sAng, sRad, sDep, speeds[s]/(0.5+sRad/60)*(0.55+sDep*0.45)/(0.3+sDist/(H*0.5))*1.3, sType);
        }
      }
    }
  }
  // High layer
  var hiSunY = sunY - H * 0.12, hiMin = minDist * 0.6, hiMax = maxReach * 0.9;
  var hiSp = [0.30, 0.22, 0.15, 0.10], hiPh = [0.5, 1.8, 3.3, 5.0];
  for (var hs = 0; hs < 4; hs++) {
    var hCl = 5+Math.floor(hash(hs*200+77)*3);
    for (var hc = 0; hc < hCl; hc++) {
      var hcs = 50000+hs*1000+hc*41, hrng = seededRandom(hcs);
      var hDist = Math.max(hiMin, hiMin+Math.pow(hrng(),0.33)*(hiMax-hiMin)), hAng = hiPh[hs]+hrng()*Math.PI*2, hsr = hrng();
      var hRad, hcT; if (hsr<0.15){hRad=30+hrng()*30;hcT=2;} else if(hsr<0.50){hRad=14+hrng()*18;hcT=1;} else{hRad=6+hrng()*10;hcT=0;}
      var hDep = Math.max(0, Math.min(1, (1-hs/3)+(hrng()-0.5)*0.2));
      addHi(hcs, hDist, hAng, hRad, hDep, hiSp[hs]/(0.5+hRad/60)*(0.55+hDep*0.45)/(0.3+hDist/(H*0.5)), hcT, hiSunY, 0.35);
      var hnM = 1+Math.floor(hrng()*1);
      for (var hm = 0; hm < hnM; hm++) {
        var hms = hcs+600+hm*17, hmr = seededRandom(hms), hmRad = hRad*(0.3+hmr()*0.35), hmT = hcT>0?hcT-1:0;
        var hmDist = Math.max(hiMin, hDist+(hmr()-0.5)*hRad*2), hmAng = hAng+(hmr()-0.5)*0.5;
        addHi(hms, hmDist, hmAng, hmRad, Math.max(0,Math.min(1,hDep+(hmr()-0.5)*0.15)), hiSp[hs]/(0.5+hmRad/60)*(0.55+hDep*0.45)/(0.3+hmDist/(H*0.5))*1.15, hmT, hiSunY, 0.35);
      }
    }
  }
  // Top layer
  var topY = sunY - H * 0.22, topMin = minDist * 0.4, topMax = maxReach * 0.95;
  var topSp = [0.35, 0.26, 0.18], topPh = [0.3, 2.0, 4.2];
  for (var ts = 0; ts < 3; ts++) {
    var tCl = 4+Math.floor(hash(ts*300+99)*3);
    for (var tc = 0; tc < tCl; tc++) {
      var tcs = 70000+ts*1000+tc*47, trng = seededRandom(tcs);
      var tDist = Math.max(topMin, topMin+Math.pow(trng(),0.33)*(topMax-topMin)), tAng = topPh[ts]+trng()*Math.PI*2, tsr2 = trng();
      var tRad, tcT; if(tsr2<0.35){tRad=10+trng()*15;tcT=1;} else{tRad=5+trng()*8;tcT=0;}
      var tDep = Math.max(0, Math.min(1, (1-ts/2)+(trng()-0.5)*0.15));
      addHi(tcs, tDist, tAng, tRad, tDep, topSp[ts]/(0.5+tRad/60)*(0.55+tDep*0.45)/(0.3+tDist/(H*0.5)), tcT, topY, 0.2);
      var tnM = 1+Math.floor(trng()*2);
      for (var tm = 0; tm < tnM; tm++) {
        var tms = tcs+700+tm*19, tmr = seededRandom(tms), tmRad = tRad*(0.3+tmr()*0.4);
        var tmDist = Math.max(topMin, tDist+(tmr()-0.5)*tRad*3), tmAng = tAng+(tmr()-0.5)*0.6;
        addHi(tms, tmDist, tmAng, tmRad, Math.max(0,Math.min(1,tDep+(tmr()-0.5)*0.15)), topSp[ts]/(0.5+tmRad/60)*(0.55+tDep*0.45)/(0.3+tmDist/(H*0.5))*1.2, 0, topY, 0.2);
      }
    }
  }
  // Mid-zone fill
  var midLo = minDist, midHi2 = maxReach * 0.85;
  for (var mf = 0; mf < 30; mf++) {
    var mfs = 90000+mf*71, mfr = seededRandom(mfs), mfDist = midLo+mfr()*(midHi2-midLo), mfAng = mfr()*Math.PI*2;
    var mfRad = 15+mfr()*40, mfT = mfRad>50?3:mfRad>30?2:mfRad>15?1:0, mfDep = 0.25+mfr()*0.5;
    addC(mfs, mfDist, mfAng, mfRad, mfDep, 0.12/(0.5+mfRad/60)*(0.55+mfDep*0.45)/(0.3+mfDist/(H*0.5)), mfT);
  }
  // Outer fill
  var outLo = minDist+(maxReach-minDist)*0.2, outHi = maxReach;
  for (var of2 = 0; of2 < 45; of2++) {
    var ofs = 80000+of2*53, ofr = seededRandom(ofs), ofDist = outLo+ofr()*(outHi-outLo), ofAng = ofr()*Math.PI*2;
    var ofRad = 20+ofr()*55, ofT = ofRad>50?3:ofRad>30?2:ofRad>15?1:0, ofDep = 0.1+ofr()*0.4;
    addC(ofs, ofDist, ofAng, ofRad, ofDep, 0.08/(0.5+ofRad/60)*(0.55+ofDep*0.45)/(0.3+ofDist/(H*0.5)), ofT);
  }
  clouds.sort(function(a, b) { return a.depth - b.depth; });
  return clouds;
}

// Handle messages
self.onmessage = async function(e) {
  if (e.data.type === 'build') {
    var clouds = buildClouds(e.data.W, e.data.H);
    // Convert OffscreenCanvas bitmaps to ImageBitmap for transfer
    var bitmaps = [];
    for (var i = 0; i < clouds.length; i++) {
      var c = clouds[i];
      if (c.baked && c.baked.canvas) {
        var bmp = await createImageBitmap(c.baked.canvas);
        bitmaps.push(bmp);
        c.baked.bitmap = bmp;
        c.baked.canvas = null; // can't transfer OffscreenCanvas
      }
      // Strip balls array to reduce transfer size
      c.balls = null;
    }
    self.postMessage({ type: 'built', clouds: clouds }, bitmaps);
  }
};
