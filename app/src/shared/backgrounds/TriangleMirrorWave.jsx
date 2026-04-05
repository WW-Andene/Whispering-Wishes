// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — shared/backgrounds/TriangleMirrorWave.jsx
// Triangle mirror wave interference background animation.
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useEffect, useRef, memo } from 'react';
import { throttledResize, _wf1, _wf2, _wf3 } from './backgroundHelpers.js';

const TriangleMirrorWave = memo(({ oledMode, animationsEnabled = 'on', bgResolution, bgFps }) => {
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
    // P12-FIX: getContext can return null in low-memory / restricted environments (Step 12 audit — LOW-12p)
    if (!ctx) return;
    let animId;
    const isFull = animationsEnabled === 'full';
    const triScale = (bgResolution || (isFull ? 100 : 50)) / 100;
    const frameInterval = bgFps ? Math.round(1000 / bgFps) : (isFull ? 33 : 66);

    const TW = 36;
    const TH = 31;
    const HALF = TW / 2;
    let w, h, cols, rows, seeds, _triGrid;

    const init = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.ceil(w * triScale);
      canvas.height = Math.ceil(h * triScale);
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      cols = Math.ceil(w / HALF) + 4;
      rows = Math.ceil(h / TH) + 4;
      seeds = new Float32Array(cols * rows);
      for (let i = 0; i < seeds.length; i++) seeds[i] = Math.random() * 6.28;
      // Pre-compute static grid data
      _triGrid = [];
      for (let r = -1; r < rows; r++) {
        for (let c = -1; c < cols; c++) {
          const isUp = ((c + r) % 2 + 2) % 2 === 0;
          const cx = c * HALF;
          const cy = r * TH + (isUp ? TH * 0.33 : TH * 0.66);
          if (cx < -HALF || cx > w + HALF || cy < -TH || cy > h + TH) continue;
          const seedIdx = (r + 1) * cols + (c + 1);
          const seed = seedIdx >= 0 && seedIdx < seeds.length ? seeds[seedIdx] : 0;
          const so = seed * 0.05;
          _triGrid.push({ c, r, isUp, cx, cy, so, x: c * HALF, y: r * TH });
        }
      }
    };
    init();
    const onResize = throttledResize(init);
    window.addEventListener('resize', onResize);
    const twSpecMul = isFull ? 0.65 : 0.45;
    const twPeakMul = isFull ? 0.18 : 0.12;
    const twAlphaScale = isFull ? 0.6 : 0.45;
    const twAlphaMax = isFull ? 0.35 : 0.25;
    const twColorBoost = isFull ? 1.3 : 1.0;

    let lastFrame = 0;

    const draw = (t) => {
      animId = requestAnimationFrame(draw);
      if (t - lastFrame < frameInterval) return;
      lastFrame = t;
      ctx.save();
      ctx.scale(triScale, triScale);
      ctx.clearRect(0, 0, w, h);
      const time = t * 0.00075; // 25% slower

      for (let _ti = 0; _ti < _triGrid.length; _ti++) {
        const _tg = _triGrid[_ti];
        const { cx, cy, so, isUp, x, y } = _tg;

        const v1 = Math.sin(_wf1(cx, cy, time) + so);
        const v2 = Math.sin(_wf2(cx, cy, time) + so * 0.7);
        const v3 = Math.sin(_wf3(cx, cy, time) + so * 0.5);
        const totalH = v1 * 0.7 + v2 * 0.5 + v3 * 0.4;

        const dd = 4;
        const hR = Math.sin(_wf1(cx+dd,cy,time)+so)*0.7 + Math.sin(_wf2(cx+dd,cy,time)+so*0.7)*0.5 + Math.sin(_wf3(cx+dd,cy,time)+so*0.5)*0.4;
        const hD = Math.sin(_wf1(cx,cy+dd,time)+so)*0.7 + Math.sin(_wf2(cx,cy+dd,time)+so*0.7)*0.5 + Math.sin(_wf3(cx,cy+dd,time)+so*0.5)*0.4;
        const slopeX = hR - totalH;
        const slopeY = hD - totalH;
        const tilt = Math.sqrt(slopeX * slopeX + slopeY * slopeY);

        const specular = Math.pow(Math.max(0, 1 - tilt * 3.5), 5);
        const peakGlow = Math.max(0, totalH / 2.0) * twPeakMul;
        const intensity = specular * twSpecMul + peakGlow;
        if (intensity < 0.015) continue;

        ctx.beginPath();
        if (isUp) {
          ctx.moveTo(x - HALF, y + TH);
          ctx.lineTo(x, y);
          ctx.lineTo(x + HALF, y + TH);
        } else {
          ctx.moveTo(x - HALF, y);
          ctx.lineTo(x + HALF, y);
          ctx.lineTo(x, y + TH);
        }
        ctx.closePath();

        const sp = Math.min(specular * 3, 1);
        const ri = Math.round(Math.min(255, (60 + sp * 120) * twColorBoost));
        const gi = Math.round(Math.min(255, (85 + sp * 100) * twColorBoost));
        const bi = Math.round(Math.min(255, (150 + sp * 80) * twColorBoost));
        const alpha = Math.min(intensity * twAlphaScale, twAlphaMax);
        ctx.fillStyle = `rgba(${ri},${gi},${bi},${alpha})`;
        ctx.fill();
      }
      ctx.restore();
    };
    animId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', onResize);
    };
  }, [oledMode, animationsEnabled, bgResolution, bgFps]);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none" style={{zIndex: 2, willChange: 'transform'}} aria-hidden="true" role="presentation" />;
});
TriangleMirrorWave.displayName = 'TriangleMirrorWave';


export { TriangleMirrorWave };
