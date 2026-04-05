// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — shared/backgrounds/BackgroundGlow.jsx
// Animated glow background with wave interference pattern.
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useEffect, useRef, memo } from 'react';
import { throttledResize, _wf1, _wf2, _wf3 } from './backgroundHelpers.js';

const BackgroundGlow = memo(({ oledMode, animationsEnabled = 'on', bgResolution, bgFps }) => {
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
    const buf = document.createElement('canvas');
    const bctx = buf.getContext('2d');
    if (!bctx) return;
    let animId;
    const isFull = animationsEnabled === 'full';
    const BLUR_SCALE = (bgResolution || (isFull ? 100 : 50)) / 100;
    const frameInterval = bgFps ? Math.round(1000 / bgFps) : (isFull ? 33 : 66);
    let w, h, bw, bh, _glowGrid;

    // OLED mode uses darker base color
    const bgColor = oledMode ? 'rgb(0,0,0)' : 'rgb(2,3,6)';

    // Full mode: boost glow intensity
    const glowAlphaMax = isFull ? 0.45 : 0.3;
    const glowAlphaScale = isFull ? 1.0 : 0.7;
    const specMul = isFull ? 0.45 : 0.3;
    const peakMul = isFull ? 0.30 : 0.22;
    const colorBoost = isFull ? 1.4 : 1.0;

    const init = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w;
      canvas.height = h;
      bw = Math.ceil(w * BLUR_SCALE);
      bh = Math.ceil(h * BLUR_SCALE);
      buf.width = bw;
      buf.height = bh;
      // Pre-compute pixel screen coords
      const gs = 2;
      _glowGrid = [];
      for (let by = 0; by < bh; by += gs) {
        for (let bx = 0; bx < bw; bx += gs) {
          _glowGrid.push({ bx, by, sx: bx / BLUR_SCALE, sy: by / BLUR_SCALE });
        }
      }
    };
    init();
    const onResize = throttledResize(init);
    window.addEventListener('resize', onResize);

    let lastFrame = 0;

    const draw = (t) => {
      animId = requestAnimationFrame(draw);
      if (t - lastFrame < frameInterval) return;
      lastFrame = t;
      const time = t * 0.00075; // 25% slower
      bctx.fillStyle = bgColor;
      bctx.fillRect(0, 0, bw, bh);

      const gs = 2;
      for (let _gi = 0; _gi < _glowGrid.length; _gi++) {
        const _gg = _glowGrid[_gi];
        const sx = _gg.sx, sy = _gg.sy;

        const h1 = Math.sin(_wf1(sx, sy, time));
        const h2 = Math.sin(_wf2(sx, sy, time));
        const h3 = Math.sin(_wf3(sx, sy, time));
        const totalH = h1 * 0.7 + h2 * 0.5 + h3 * 0.4;

        const d = 10;
        const slX = (Math.sin(_wf1(sx+d,sy,time))-h1)*0.7 + (Math.sin(_wf2(sx+d,sy,time))-h2)*0.5 + (Math.sin(_wf3(sx+d,sy,time))-h3)*0.4;
        const slY = (Math.sin(_wf1(sx,sy+d,time))-h1)*0.7 + (Math.sin(_wf2(sx,sy+d,time))-h2)*0.5 + (Math.sin(_wf3(sx,sy+d,time))-h3)*0.4;
        const tilt = Math.sqrt(slX*slX + slY*slY);

        const spec = Math.pow(Math.max(0, 1 - tilt * 2.0), 2);
        const peak = Math.max(0, totalH / 1.5) * peakMul;
        const gI = spec * specMul + peak;

        if (gI > 0.008) {
          const a = Math.min(gI * glowAlphaScale, glowAlphaMax);
          const blend = Math.max(0, Math.min(1, (totalH + 1.6) / 3.2));
          const rr = Math.round(Math.min(255, (6 + blend * 25) * colorBoost));
          const gg = Math.round(Math.min(255, (12 + blend * 40) * colorBoost));
          const bb = Math.round(Math.min(255, (45 + blend * 70) * colorBoost));
          bctx.fillStyle = `rgba(${rr},${gg},${bb},${a})`;
          bctx.fillRect(_gg.bx, _gg.by, gs, gs);
        }
      }

      ctx.clearRect(0, 0, w, h);
      ctx.filter = 'blur(20px)';
      ctx.drawImage(buf, 0, 0, bw, bh, 0, 0, w, h);
      ctx.filter = 'none';
    };
    animId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', onResize);
      // P11-FIX: Explicitly release buffer canvas backing store memory (Step 7 audit — LOW-3h)
      buf.width = 0;
      buf.height = 0;
    };
  }, [oledMode, animationsEnabled, bgResolution, bgFps]);
  
  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none" style={{zIndex: 1, willChange: 'transform'}} aria-hidden="true" role="presentation" />;
});
BackgroundGlow.displayName = 'BackgroundGlow';


export { BackgroundGlow };
