// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — shared/components/BannerCard.jsx
// Main banner card component with particle overlay and probability bar.
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useState, useMemo, useCallback, useEffect, useRef, memo } from 'react';
import { Info, Star, X } from 'lucide-react';
import { FocusTrapModal } from '../../providers/FocusTrapModal.jsx';
import { HARD_PITY, SOFT_PITY_START } from '../../data/constants.js';
import { haptic, getElementColor } from '../../utils/helpers.js';
import { getTimeRemaining, getServerAdjustedEnd } from '../../core/time.js';
import { hideOnError } from '../utils/imageHelpers.js';
import { CountdownTimer } from './CountdownTimer.jsx';
import { SpinePlayer, getSpineId, SPINE_CHARACTERS } from './SpinePlayer.jsx';

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
// L-FIX: Extracted inline style constants to avoid re-creating objects every render

const IMG_LAYER_STYLE = Object.freeze({ zIndex: 1 });
const BANNER_SUBTLE_SHADOW = '0 0 40px rgba(237,175,24,0.06), 0 4px 16px rgba(0,0,0,0.3)';


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



const BannerCard = memo(({ item, type, stats, bannerImage, visualSettings, endDate, timerColor }) => {
  const isChar = type === 'character';
  const style = BANNER_GRADIENT_MAP[item.element] || BANNER_GRADIENT_MAP.Fusion;
  const imgUrl = item.imageUrl || bannerImage;
  const [spineFailed, setSpineFailed] = useState(false);

  // Use unified mask generator
  const maskGradient = visualSettings
    ? generateMaskGradient(visualSettings.fadePosition, visualSettings.fadeIntensity)
    : generateMaskGradient();
  const pictureOpacity = visualSettings ? visualSettings.pictureOpacity / 100 : 0.9;
  const isFull = visualSettings?.animationsEnabled === 'full';
  const spineId = isChar ? getSpineId(item.name) : null;
  const useSpine = isFull && spineId && !spineFailed;

  return (
    <div className={isFull ? 'banner-card-glow rounded-xl' : ''} style={isFull ? { '--glow-color': style.glow, zIndex: 5 } : { zIndex: 5 }}>
    <div className="relative overflow-hidden rounded-xl border banner-card" style={{ minHeight: 'var(--height-banner)', isolation: 'isolate', borderColor: style.borderColor, boxShadow: isFull ? 'none' : BANNER_SUBTLE_SHADOW }}>
      {imgUrl && (
        <div
          className="absolute inset-0"
          style={{
            ...IMG_LAYER_STYLE,
            opacity: 1,
            filter: useSpine ? 'blur(10px)' : undefined,
            transform: useSpine ? 'scale(2)' : undefined,
          }}
        >
          <img
            src={imgUrl}
            alt={item.name}
            className={`w-full h-full object-cover ${useSpine ? '' : 'breath-zoom'}`}
            style={{
              opacity: useSpine ? 0.7 : pictureOpacity,
              objectPosition: 'center 100%',
              maskImage: maskGradient,
              WebkitMaskImage: maskGradient,
            }}
            loading="eager"
            onError={hideOnError}
          />
        </div>
      )}
      {useSpine && (
        <div className="absolute inset-0" style={{ zIndex: 2 }}>
          <SpinePlayer
            characterId={spineId}
            className="w-full h-full"
            style={{ opacity: pictureOpacity }}
            backgroundColor="#00000000"
            onError={() => setSpineFailed(true)}
          />
        </div>
      )}

      {endDate && (
        <div className="absolute top-2 right-2 z-20">
          <CountdownTimer endDate={endDate} color={timerColor || 'yellow'} />
        </div>
      )}
      
      <div className="absolute inset-0 z-10 p-3 flex flex-col justify-between" style={TEXT_SHADOW_STYLE}>
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            {item.isNew && <span className="text-sm bg-yellow-500 text-black px-1.5 py-0.5 rounded-full font-bold" style={{textShadow: 'none'}}>NEW</span>}
            <span className={`kuro-badge ${style.text}`} style={{ borderColor: style.borderColor, backgroundColor: style.bgColor }}>{isChar ? item.element : item.type}</span>
          </div>
          <h4 className="font-bold text-xl text-white leading-tight">{item.name}</h4>
          {item.title && <p className="text-gray-200 text-sm mt-0.5 line-clamp-1">{item.title}</p>}
        </div>
        
        <div className={stats ? 'mb-14' : ''}>
          <div className="text-gray-300 text-sm mb-0.5 uppercase tracking-wider">Featured 4★</div>
          <div className="flex gap-1 flex-wrap">
            {(item.featured4Stars || []).map(n => <span key={n} className="text-sm text-cyan-300 bg-cyan-500/30 px-1.5 py-0.5 rounded backdrop-blur-sm">{n}</span>)}
          </div>
        </div>
      </div>
      
      {stats && (
        <div className="absolute bottom-0 left-0 right-0 z-10 border-t border-white/15" style={BANNER_CARD_OVERLAY_STYLE}>
          <div className="flex items-center gap-3">
            <div className="flex-1 flex items-center gap-3">
                <div className="text-center">
                  <div className={`font-bold text-xl kuro-number ${stats.pity5 >= HARD_PITY ? 'text-red-500 font-bold animate-pulse' : stats.pity5 >= 75 ? 'text-red-400' : stats.pity5 >= SOFT_PITY_START ? 'text-amber-400' : isChar ? 'text-yellow-400' : 'text-pink-400'}`}>{stats.pity5}<span className="text-gray-400 text-sm ml-0.5">/{HARD_PITY}</span></div>
                  <div className={`text-sm mt-0.5 ${stats.pity5 >= HARD_PITY ? 'text-red-500 font-bold' : stats.pity5 >= 75 ? 'text-red-400 font-medium' : stats.pity5 >= SOFT_PITY_START ? 'text-amber-400 font-medium' : 'text-gray-400'}`}>{stats.pity5 >= HARD_PITY ? '★ GUARANTEED!' : stats.pity5 >= 75 ? '⚠ High Pity!' : stats.pity5 >= SOFT_PITY_START ? 'Soft Pity!' : '5★ Pity'}</div>
                </div>
                <div className="text-center">
                  <div className="text-purple-400 font-bold text-xl kuro-number">{stats.pity4}<span className="text-gray-400 text-sm ml-0.5">/10</span></div>
                  <div className={`text-sm mt-0.5 ${stats.guaranteed4Star ? 'text-emerald-400 font-medium' : 'text-gray-400'}`}>{stats.guaranteed4Star ? '4★ Featured ✓' : '4★ Pity'}</div>
                </div>
                <div className="text-center">
                  <div className="text-white font-bold text-xl kuro-number">{stats.totalPulls}</div>
                  <div className="text-gray-400 text-sm mt-0.5">Convenes</div>
                </div>
              </div>
              {/* MED-27: Escalated from text-sm to text-base font-bold for visual weight */}
              {isChar ? (
                <div className={`text-base font-bold px-2 py-0.5 rounded-full backdrop-blur-sm ${stats.guaranteed ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-orange-500/20 text-orange-400 border border-orange-500/30'}`}>
                  {stats.guaranteed ? '✓ Guaranteed' : '50/50'}
                </div>
              ) : (
                <div className={`text-base font-bold px-2 py-0.5 rounded-full backdrop-blur-sm ${stats.guaranteed ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-pink-500/20 text-pink-400 border border-pink-500/30'}`}>
                  {stats.guaranteed ? '✓ Guaranteed' : 'No Guarantee'}
                </div>
              )}
            </div>
          </div>
        )}
      {/* Gacha info icon — bottom-left corner */}
      <GachaInfoButton isChar={isChar} />
    </div>
    </div>
  );
});
BannerCard.displayName = 'BannerCard';

// Gacha system explanation — kuro-styled modal
const GachaInfoButton = memo(({ isChar }) => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        className="absolute bottom-2 right-2 z-20 w-7 h-7 rounded-full flex items-center justify-center bg-black/50 border border-white/20 text-gray-300 hover:text-white hover:bg-black/70 transition-all backdrop-blur-sm"
        onClick={(e) => { e.stopPropagation(); setOpen(true); haptic.light(); }}
        aria-label="Convene system information"
      >
        <Info size={14} />
      </button>
      <FocusTrapModal isOpen={open} onClose={() => setOpen(false)} className="" onClick={() => setOpen(false)} ariaLabel="Convene system information" centered>
        <div className="kuro-card w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
          <div className="px-4 py-3 border-b border-[var(--border-medium)] flex items-center justify-between" data-sheet-header>
            <div className="flex items-center gap-2">
              <Info size={16} className="text-yellow-400" />
              <h3 className="text-white font-semibold text-lg">Convene System</h3>
            </div>
            <button onClick={() => setOpen(false)} className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all" aria-label="Close"><X size={16} /></button>
          </div>
          <div className="p-4 space-y-3">
            <div className="space-y-2.5 text-sm text-gray-300 leading-relaxed">
              <div className="flex items-start gap-2">
                <span className="text-yellow-400 text-lg leading-none mt-0.5">★</span>
                <div><span className="text-white font-medium">Base 5★ rate:</span> 0.8% per Convene</div>
              </div>
              <div className="p-2.5 rounded-lg space-y-1.5" style={{ background: 'var(--bg-stat)', border: '1px solid var(--border-hover)' }}>
                <div className="flex justify-between"><span className="text-amber-400 font-medium">Soft Pity</span><span className="text-white">Pull 66+</span></div>
                <div className="text-gray-400 text-xs">Rate increases by ~6.6% per pull after pull 65. By pull 79, rate exceeds 90%.</div>
              </div>
              <div className="p-2.5 rounded-lg space-y-1.5" style={{ background: 'var(--bg-stat)', border: '1px solid var(--border-hover)' }}>
                <div className="flex justify-between"><span className="text-red-400 font-medium">Hard Pity</span><span className="text-white">Pull 80</span></div>
                <div className="text-gray-400 text-xs">Guaranteed 5★ at pull 80. Average is ~71 pulls.</div>
              </div>
              <div className="p-2.5 rounded-lg space-y-1.5" style={{ background: 'var(--bg-stat)', border: '1px solid var(--border-hover)' }}>
                <div className="flex justify-between"><span className="text-purple-400 font-medium">4★ Guarantee</span><span className="text-white">Every 10 pulls</span></div>
                <div className="text-gray-400 text-xs">Base rate 6%. Independent from 5★ pity counter.</div>
              </div>
              {isChar ? (
                <div className="p-2.5 rounded-lg space-y-1.5" style={{ background: 'var(--bg-stat)', border: '1px solid var(--border-hover)' }}>
                  <div className="flex justify-between"><span className="text-orange-400 font-medium">50/50 System</span><span className="text-white">Featured Resonator</span></div>
                  <div className="text-gray-400 text-xs">50% chance for the featured Resonator. Losing the 50/50 guarantees the featured Resonator on your next 5★ pull. Both pity counter and guarantee carry over to the next featured banner.</div>
                </div>
              ) : (
                <div className="p-2.5 rounded-lg space-y-1.5" style={{ background: 'var(--bg-stat)', border: '1px solid var(--border-hover)' }}>
                  <div className="flex justify-between"><span className="text-pink-400 font-medium">No 50/50</span><span className="text-white">Featured Weapon</span></div>
                  <div className="text-gray-400 text-xs">The featured weapon is guaranteed when you pull a 5★. Pity counter carries over to the next featured weapon banner.</div>
                </div>
              )}
            </div>
            <div className="text-gray-500 text-xs text-center pt-1 border-t border-[var(--border-medium)]">Each banner type has its own independent pity counter</div>
          </div>
        </div>
      </FocusTrapModal>
    </>
  );
});
GachaInfoButton.displayName = 'GachaInfoButton';

const ProbabilityBar = memo(({ label, value, color = 'cyan' }) => (
  <div className="flex items-center gap-2" role="meter" aria-label={`${label}: ${value}%`} aria-valuenow={value} aria-valuemin={0} aria-valuemax={100}>
    <span className="text-gray-400 text-sm w-12">{label}</span>
    <div className="flex-1 h-5 bg-neutral-800 rounded overflow-hidden">
      <div className={`h-full ${color === 'cyan' ? 'bg-cyan-500' : color === 'pink' ? 'bg-pink-500' : 'bg-yellow-500'} transition-[width] duration-300 flex items-center justify-end pr-1`} style={{ width: `${Math.max(value, 1)}%` }}>
        {value > 10 && <span className="text-sm text-black font-bold">{value}%</span>}
      </div>
    </div>
    {value <= 10 && <span className="text-sm text-gray-400 w-10">{value}%</span>}
  </div>
));
ProbabilityBar.displayName = 'ProbabilityBar';

export { BannerCard, ProbabilityBar, generateMaskGradient, BANNER_GRADIENT_MAP, EVENT_ACCENT_COLORS, BANNER_CARD_OVERLAY_STYLE, TEXT_SHADOW_STYLE, IMG_LAYER_STYLE, BANNER_SUBTLE_SHADOW };
