// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — shared/components/BannerCard.jsx
// Main banner card component with particle overlay and probability bar.
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useState, useMemo, useCallback, useEffect, useRef, memo } from 'react';
import { Info, X, Play } from 'lucide-react';
import { FocusTrapModal } from './FocusTrapModal.jsx';
import { HARD_PITY, SOFT_PITY_START } from '../../data/constants.js';
import { DEFAULT_COLLECTION_IMAGES, getConveneAnimation } from '../../data/banners.js';
import { haptic } from '../../utils/haptics.js';
import { getElementIcon, getWeaponTypeIcon } from '../utils/elementVisuals.js';
import { hideOnError } from '../utils/imageHelpers.js';
import { CountdownTimer } from './CountdownTimer.jsx';
import { useImageFramingContext } from '../../providers/ImageFramingProvider.jsx';
import { SpinePlayer, getSpineId } from './SpinePlayer.jsx';
import { FullSpineViewerButton } from './FullSpineViewerButton.jsx';
import { ConveneVideo } from './ConveneVideoLayer.jsx';
import { ConvenePullPills } from './ConvenePullPills.jsx';
import { ConvenePullSimModal } from './ConvenePullSimModal.jsx';
import { t } from '../../utils/i18n.js';

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

const BANNER_CARD_OVERLAY_STYLE = Object.freeze({ background: 'linear-gradient(to top, rgba(8,12,20,0.85) 60%, transparent)', padding: '8px 12px 12px', textShadow: '0 2px 8px rgba(0,0,0,0.9), 0 1px 3px rgba(0,0,0,0.8)' });
const TEXT_SHADOW_STYLE = Object.freeze({ textShadow: '0 2px 8px rgba(0,0,0,0.9), 0 1px 3px rgba(0,0,0,0.8)' });
// L-FIX: Extracted inline style constants to avoid re-creating objects every render

// Feature flag: Spine banner animations are disabled app-wide. Set to true to re-enable.
const SPINE_BANNERS_ENABLED = false;

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

const BannerCard = memo(({ item, type, bannerImage, visualSettings, endDate, timerColor, collectionImages, setDetailModal, pity, calc }) => {
  const isChar = type === 'character';
  const style = BANNER_GRADIENT_MAP[item.element] || BANNER_GRADIENT_MAP.Fusion;
  const imgUrl = item.imageUrl || bannerImage;
  const [spineFailed, setSpineFailed] = useState(false);
  const [conveneVideoPlaying, setConveneVideoPlaying] = useState(false);
  const [pullSim, setPullSim] = useState(null); // count of the in-progress pull sim, or null
  // Bumped on every pull request so <ConvenePullSimModal> below gets a fresh
  // `key` and fully remounts — otherwise closing early (before the video/
  // reveal finishes) and pulling again reused the same component instance,
  // and its memoized sim result never rerolled.
  const [pullSimId, setPullSimId] = useState(0);

  // Use unified mask generator
  const maskGradient = visualSettings
    ? generateMaskGradient(visualSettings.fadePosition, visualSettings.fadeIntensity)
    : generateMaskGradient();
  const pictureOpacity = visualSettings ? visualSettings.pictureOpacity / 100 : 0.9;
  const isFull = visualSettings?.animationsEnabled === 'full';
  const spineId = isChar ? getSpineId(item.name) : null;
  // No longer isChar-gated — weapon convene clips exist now too (getConveneAnimation
  // already returns null for anything with no clip, character or weapon).
  const conveneVideoUrl = getConveneAnimation(item.name);
  const { getImageFraming, framingMode, editingImage, setEditingImage } = useImageFramingContext();
  // Spine banners disabled app-wide (kept encapsulated here, not removed, for easy re-enable).
  const useSpine = SPINE_BANNERS_ENABLED && isFull && spineId && !spineFailed;

  return (
    <div className={isFull ? 'banner-card-glow rounded-xl' : ''} style={isFull ? { '--glow-color': style.glow, zIndex: 5 } : { zIndex: 5 }}>
    <div className="relative overflow-hidden rounded-xl border banner-card" style={{ minHeight: 'var(--height-banner)', isolation: 'isolate', borderColor: style.borderColor, boxShadow: isFull ? 'none' : BANNER_SUBTLE_SHADOW }}>
      {imgUrl && (
        <div
          className="absolute inset-0"
          style={{
            ...IMG_LAYER_STYLE,
            opacity: useSpine ? 0.5 : 1,
            filter: useSpine ? 'blur(2.5px)' : undefined,
            transform: useSpine ? 'scale(2)' : undefined,
          }}
        >
          <img
            src={imgUrl}
            alt={item.name}
            className={`w-full h-full object-cover ${useSpine ? '' : 'breath-zoom'}`}
            style={{
              opacity: useSpine ? 1 : pictureOpacity,
              objectPosition: item.imagePosition || 'center 100%',
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

      {/* Convene video plays directly in the banner itself (in place of the
          static image/Spine layer) rather than opening a separate modal —
          same card, same frame, just swapping what's showing in it. z-index
          3 so it sits above both the image and Spine layers but still below
          the text overlay (z-10) and the play/stop button (z-20). Fades out
          over its last ~1.5s (see ConveneVideoLayer.jsx) instead of cutting
          straight to the static image. */}
      {conveneVideoPlaying && conveneVideoUrl && (
        <ConveneVideo videoUrl={conveneVideoUrl} onEnded={() => setConveneVideoPlaying(false)} zIndex={3} visualSettings={visualSettings} />
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
            <span className={`kuro-badge ${style.text} inline-flex items-center gap-1`} style={{ borderColor: style.borderColor, backgroundColor: style.bgColor }}>
              {isChar && getElementIcon(item.element) && <img src={getElementIcon(item.element)} alt="" className="w-3.5 h-3.5" onError={hideOnError} />}
              {!isChar && getWeaponTypeIcon(item.type) && <img src={getWeaponTypeIcon(item.type)} alt="" className="w-3.5 h-3.5" onError={hideOnError} />}
              {isChar ? item.element : item.type}
            </span>
          </div>
          <h4 className="font-bold text-xl text-white leading-tight">{item.name}</h4>
          {item.title && <p className="text-gray-200 text-sm mt-0.5 line-clamp-1">{item.title}</p>}
        </div>
        
        <div>
          <div className="text-gray-300 text-sm mb-0.5 uppercase tracking-wider">Featured 4★</div>
          <div className="flex gap-2 flex-wrap">
            {(item.featured4Stars || []).map(n => {
              const previewImg = (collectionImages || DEFAULT_COLLECTION_IMAGES)[n];
              const framingKey = `collection-${n}`;
              const framing = getImageFraming(framingKey);
              const isEditingThis = framingMode && editingImage === framingKey;
              return (
                <div key={n} className="inline-flex flex-col items-center gap-0.5">
                  {previewImg && (
                    <div
                      className={`w-12 h-12 rounded-md overflow-hidden border bg-black/25 ${isEditingThis ? 'border-emerald-400 ring-2 ring-emerald-500/50' : 'border-cyan-400/40'} ${framingMode ? 'cursor-pointer' : ''}`}
                      onClick={framingMode ? () => setEditingImage(framingKey) : undefined}
                    >
                      <img
                        src={previewImg}
                        alt=""
                        aria-hidden="true"
                        className="w-full h-full object-contain pointer-events-none"
                        style={{ transform: `scale(${framing.zoom / 100}) translate(${-framing.x}%, ${-framing.y}%)` }}
                        onError={hideOnError}
                      />
                    </div>
                  )}
                  <span
                    className="block w-12 text-[8px] text-cyan-300 bg-cyan-500/30 px-1.5 py-0.5 rounded backdrop-blur-sm text-center truncate cursor-pointer"
                    title={n}
                    onClick={() => setDetailModal?.({ show: true, type: isChar ? 'character' : 'weapon', name: n, imageUrl: previewImg, framing })}
                  >{n}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      {/* Pull simulator pills (display-only — see core/conveneSimulator.js) sit
          immediately left of the ▶️ convene-video preview button. The two
          are independent features: pills appear for both character and
          weapon banners regardless of whether a convene-video preview
          exists for this item. */}
      <div className="absolute bottom-2 right-2 z-20 flex items-center gap-1">
        <ConvenePullPills kind={isChar ? 'character' : 'weapon'} onPull={(c) => { setPullSim(c); setPullSimId(id => id + 1); }} showTide={isChar ? (calc?.radiant > 0) : (calc?.forging > 0)} />
        {conveneVideoUrl ? (
          <button
            onClick={(e) => { e.stopPropagation(); setConveneVideoPlaying(p => !p); }}
            className="kuro-btn w-8 h-8 !p-0 rounded-full flex items-center justify-center"
            aria-label={conveneVideoPlaying ? t('modals.characterDetail.closeConveneVideoAria') : t('modals.characterDetail.viewConveneVideoAria', { name: item.name })}
          >
            {conveneVideoPlaying ? <X size={14} /> : <Play size={12} className="fill-current ml-0.5" />}
          </button>
        ) : isChar ? (
          // Spine fallback preview is character-only — weapons never had one, so an
          // isChar-but-no-convene-clip weapon (still most of them) shows nothing here.
          <FullSpineViewerButton name={item.name} imageUrl={imgUrl} />
        ) : null}
      </div>
      <ConvenePullSimModal
        key={pullSimId}
        isOpen={pullSim != null}
        onClose={() => setPullSim(null)}
        kind={isChar ? 'character' : 'weapon'}
        count={pullSim || 1}
        featuredNames={[item.name]}
        featured4Stars={item.featured4Stars || []}
        startPity5={pity?.pity5 ?? 0}
        startPity4={pity?.pity4 ?? 0}
        startGuaranteed={!!pity?.guaranteed}
        startGuaranteed4={!!pity?.guaranteed4Star}
        visualSettings={visualSettings}
        setDetailModal={setDetailModal}
      />
    </div>
    </div>
  );
});
BannerCard.displayName = 'BannerCard';

// Gacha system explanation — kuro-styled modal. Rendered once above the
// banner list (TrackerTab) rather than per-card, since its content is the
// same regardless of which banner it's opened from.
// Compact pity tracker — extracted from BannerCard's old bottom-overlay stats bar (which
// repeated identically on every card of a category, since it always showed the same
// account-wide pity/convene numbers regardless of which specific banner card it sat on).
// Rendered once, in TrackerTab's header row immediately left of GachaInfoButton, instead of
// once per card. Sized to sit inline at the same ~28px row height as that button (w-7 h-7) —
// text-sm/text-xs here, versus the old overlay's text-xl, since this is now a compact summary
// next to an icon rather than a full-width bar of its own.
const PityTrackerCompact = memo(({ stats, isChar, showGuaranteed = true }) => {
  if (!stats) return null;
  const pity5Color = stats.pity5 >= HARD_PITY
    ? 'text-red-500'
    : stats.pity5 >= 75
    ? 'text-red-400'
    : stats.pity5 >= SOFT_PITY_START
    ? 'text-amber-400'
    : isChar ? 'text-yellow-400' : 'text-pink-400';
  const guaranteed = isChar
    ? (stats.guaranteed ? { text: '✓', cls: 'text-emerald-400' } : { text: '50/50', cls: 'text-orange-400' })
    : (stats.guaranteed ? { text: '✓', cls: 'text-emerald-400' } : { text: '—', cls: 'text-pink-400' });
  return (
    <div className="flex items-center gap-1.5 text-sm leading-none">
      <span className={`font-bold kuro-number ${pity5Color}`}>{stats.pity5}<span className="text-gray-400 font-normal">/{HARD_PITY}</span></span>
      <span className="text-gray-600">·</span>
      <span className="text-purple-400 font-medium kuro-number">{stats.pity4}<span className="text-gray-400">/10</span></span>
      {/* Standard banners have no 50/50 rate-up mechanic — nothing to be "guaranteed" out
          of — so this segment only makes sense for the featured character/weapon banners. */}
      {showGuaranteed && (
        <>
          <span className="text-gray-600">·</span>
          <span className={`font-semibold ${guaranteed.cls}`}>{guaranteed.text}</span>
        </>
      )}
    </div>
  );
});
PityTrackerCompact.displayName = 'PityTrackerCompact';

const GachaInfoButton = memo(({ isChar, className = '' }) => {
  const [open, setOpen] = useState(false);
  const ci = 'tracker.conveneInfo.';
  return (
    <>
      <button
        className={`w-7 h-7 rounded-full flex items-center justify-center bg-black/50 border border-white/20 text-gray-300 hover:text-white hover:bg-black/70 transition-all backdrop-blur-sm ${className}`}
        onClick={(e) => { e.stopPropagation(); setOpen(true); haptic.light(); }}
        aria-label={t(ci + 'buttonAria')}
      >
        <Info size={14} />
      </button>
      <FocusTrapModal isOpen={open} onClose={() => setOpen(false)} className="" onClick={() => setOpen(false)} ariaLabel={t(ci + 'buttonAria')} centered padding="p-3">
        <div className="kuro-card w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
          <div className="px-4 py-3 border-b border-[var(--border-medium)] flex items-center justify-between" data-sheet-header>
            <div className="flex items-center gap-2">
              <Info size={16} className="text-yellow-400" />
              <h3 className="text-white font-semibold text-lg">{t(ci + 'title')}</h3>
            </div>
            <button onClick={() => setOpen(false)} className="p-3 min-w-[48px] min-h-[48px] flex items-center justify-center rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all" aria-label={t(ci + 'closeAria')}><X size={16} /></button>
          </div>
          <div className="p-4 space-y-3">
            <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
              <div className="flex items-start gap-2">
                <span className="text-yellow-400 text-lg leading-none mt-0.5">★</span>
                <div><span className="text-white font-medium">{t(ci + 'baseRateLabel')}</span> {t(ci + 'baseRateValue')}</div>
              </div>
              <div className="p-3 rounded-lg space-y-1.5" style={{ background: 'var(--bg-stat)', border: '1px solid var(--border-hover)' }}>
                <div className="flex justify-between"><span className="text-amber-400 font-medium">{t(ci + 'softPityLabel')}</span><span className="text-white">{t(ci + 'softPityValue')}</span></div>
                <div className="text-gray-400 text-xs">{t(ci + 'softPityDesc')}</div>
              </div>
              <div className="p-3 rounded-lg space-y-1.5" style={{ background: 'var(--bg-stat)', border: '1px solid var(--border-hover)' }}>
                <div className="flex justify-between"><span className="text-red-400 font-medium">{t(ci + 'hardPityLabel')}</span><span className="text-white">{t(ci + 'hardPityValue')}</span></div>
                <div className="text-gray-400 text-xs">{t(ci + 'hardPityDesc')}</div>
              </div>
              <div className="p-3 rounded-lg space-y-1.5" style={{ background: 'var(--bg-stat)', border: '1px solid var(--border-hover)' }}>
                <div className="flex justify-between"><span className="text-purple-400 font-medium">{t(ci + 'guarantee4StarLabel')}</span><span className="text-white">{t(ci + 'guarantee4StarValue')}</span></div>
                <div className="text-gray-400 text-xs">{t(ci + 'guarantee4StarDesc')}</div>
              </div>
              {isChar ? (
                <div className="p-3 rounded-lg space-y-1.5" style={{ background: 'var(--bg-stat)', border: '1px solid var(--border-hover)' }}>
                  <div className="flex justify-between"><span className="text-orange-400 font-medium">{t(ci + 'fiftyFiftyLabel')}</span><span className="text-white">{t(ci + 'fiftyFiftyValue')}</span></div>
                  <div className="text-gray-400 text-xs">{t(ci + 'fiftyFiftyDesc')}</div>
                </div>
              ) : (
                <div className="p-3 rounded-lg space-y-1.5" style={{ background: 'var(--bg-stat)', border: '1px solid var(--border-hover)' }}>
                  <div className="flex justify-between"><span className="text-pink-400 font-medium">{t(ci + 'noFiftyFiftyLabel')}</span><span className="text-white">{t(ci + 'noFiftyFiftyValue')}</span></div>
                  <div className="text-gray-400 text-xs">{t(ci + 'noFiftyFiftyDesc')}</div>
                </div>
              )}
            </div>
            <div className="text-gray-500 text-xs text-center pt-1 border-t border-[var(--border-medium)]">{t(ci + 'footerNote')}</div>
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
    <div className="flex-1 h-4 bg-neutral-800 rounded overflow-hidden">
      <div className={`h-full ${color === 'cyan' ? 'bg-cyan-500' : color === 'pink' ? 'bg-pink-500' : 'bg-yellow-500'} transition-[width] duration-300 flex items-center justify-end pr-1`} style={{ width: `${Math.max(value, 1)}%` }}>
        {value > 10 && <span className="text-sm text-black font-bold">{value}%</span>}
      </div>
    </div>
    {value <= 10 && <span className="text-sm text-gray-400 w-12">{value}%</span>}
  </div>
));
ProbabilityBar.displayName = 'ProbabilityBar';

export { BannerCard, GachaInfoButton, PityTrackerCompact, ProbabilityBar, generateMaskGradient, BANNER_GRADIENT_MAP, EVENT_ACCENT_COLORS, BANNER_CARD_OVERLAY_STYLE, TEXT_SHADOW_STYLE, IMG_LAYER_STYLE, BANNER_SUBTLE_SHADOW };
