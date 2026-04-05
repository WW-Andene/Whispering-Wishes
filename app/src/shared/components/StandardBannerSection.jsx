// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — shared/components/StandardBannerSection.jsx
// Standard (permanent) banner section with particle overlay.
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useState, useMemo, useCallback, useEffect, useRef, memo } from 'react';
import { Star } from 'lucide-react';
import { haptic } from '../../utils/helpers.js';
import { hideOnError } from '../utils/imageHelpers.js';
import { generateMaskGradient, BANNER_CARD_OVERLAY_STYLE, IMG_LAYER_STYLE, BANNER_SUBTLE_SHADOW } from './BannerCard.jsx';

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

export { StandardBannerSection };
