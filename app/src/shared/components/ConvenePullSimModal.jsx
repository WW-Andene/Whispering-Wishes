// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — shared/components/ConvenePullSimModal.jsx
// Floating kuro-style panel opened by ConvenePullPills: plays one of the
// three convene-sim videos (public/convene-sim/{common,4star,5star}.mp4,
// chosen by the best rarity rolled), then reveals the 1 or 10 items.
//
// This is a display-only simulator (core/conveneSimulator.js) — no wallet
// is spent, no pity/history is written to state.profile.
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { X, Sparkles } from 'lucide-react';
import { FocusTrapModal } from './FocusTrapModal.jsx';
import { simulateConvenePulls } from '../../core/conveneSimulator.js';
import { DEFAULT_COLLECTION_IMAGES } from '../../data/banners.js';
import { hideOnError } from '../utils/imageHelpers.js';
import { useImageFramingContext } from '../../providers/ImageFramingProvider.jsx';
import { t } from '../../utils/i18n.js';

// Same fade timing as ConveneVideoLayer.jsx's ConveneVideo, per the design
// request that this reuse the identical fade-in/fade-out feel.
const FADE_OUT_SECONDS = 1.5;
const FADE_IN_SECONDS = 0.4;

const VIDEO_SRC = {
  common: './convene-sim/common.mp4',
  '4star': './convene-sim/4star.mp4',
  '5star': './convene-sim/5star.mp4',
};

// kuro-badge-* color variants (kuro.css) — same rarity→color mapping used
// throughout the app (WeaponDetailModal's WEAPON_RARITY_COLORS).
const RARITY_BADGE = { 5: 'kuro-badge-yellow', 4: 'kuro-badge-purple', 3: 'kuro-badge-cyan' };
const RARITY_RING = { 5: 'border-yellow-500/50', 4: 'border-purple-500/50', 3: 'border-cyan-500/40' };

// Item icon box mirrors BannerCard's "Featured 4★" preview tile exactly —
// same w-12 h-12 rounded-md bordered box, object-contain, and the
// collection-<name> framing (zoom/x/y) from useImageFraming.js, so a
// character's sprite sits identically here as it does on the banner card.
const PullResultIcon = ({ result, getImageFraming }) => {
  const imgUrl = result.name ? DEFAULT_COLLECTION_IMAGES[result.name] : null;
  const framing = result.name ? getImageFraming(`collection-${result.name}`) : null;
  return (
    <div className="flex flex-col items-center gap-1">
      <div className={`relative w-12 h-12 rounded-md overflow-hidden border bg-black/25 ${RARITY_RING[result.rarity]}`}>
        {imgUrl ? (
          <img
            src={imgUrl}
            alt={result.name}
            className="w-full h-full object-contain pointer-events-none"
            style={{ transform: `scale(${framing.zoom / 100}) translate(${-framing.x}%, ${-framing.y}%)` }}
            onError={hideOnError}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-cyan-300"><Sparkles size={16} /></div>
        )}
        {result.isFeatured && (
          <span className="absolute top-0 right-0 text-2xs bg-yellow-500 text-black px-1 rounded-bl font-bold leading-tight">{t('tracker.conveneSim.featuredBadge')}</span>
        )}
      </div>
      <span className={`kuro-badge ${RARITY_BADGE[result.rarity]}`}>{result.rarity}★</span>
    </div>
  );
};

const ConvenePullSimModal = ({ isOpen, onClose, kind, count, featuredNames, featured4Stars, startPity5, startPity4, startGuaranteed }) => {
  const [phase, setPhase] = useState('playing'); // 'playing' | 'fading' | 'revealed'
  const [firedFade, setFiredFade] = useState(false);
  const { getImageFraming } = useImageFramingContext();

  const sim = useMemo(() => {
    if (!isOpen) return null;
    return simulateConvenePulls({ count, kind, featuredNames, featured4Stars, startPity5, startPity4, startGuaranteed });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) { setPhase('playing'); setFiredFade(false); }
  }, [isOpen]);

  const handleTimeUpdate = useCallback((e) => {
    const v = e.currentTarget;
    if (!firedFade && v.duration && v.duration - v.currentTime <= FADE_OUT_SECONDS) {
      setFiredFade(true);
      setPhase('fading');
    }
  }, [firedFade]);

  const handleEnded = useCallback(() => setPhase('revealed'), []);

  if (!sim) return null;

  return (
    <FocusTrapModal isOpen={isOpen} onClose={onClose} onClick={onClose} ariaLabel={t('tracker.conveneSim.modalAria')} centered padding="p-3">
      <div className="kuro-card relative w-full max-w-md overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
        {/* Header — same row pattern as Card/CardHeader (icon + title, border-b) used across the app */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10">
          <Sparkles size={14} className="text-cyan-400 flex-shrink-0" />
          <h3 className="text-gray-100 font-bold text-lg flex-1">{t('tracker.conveneSim.resultsTitle', { count })}</h3>
          <button onClick={onClose} className="kuro-btn kuro-btn-sm kuro-btn-icon" aria-label={t('tracker.conveneSim.closeAria')}>
            <X size={14} />
          </button>
        </div>

        {phase !== 'revealed' ? (
          <div className="relative aspect-square bg-black">
            <video
              key={VIDEO_SRC[sim.video]}
              src={VIDEO_SRC[sim.video]}
              className="w-full h-full object-cover"
              style={{
                opacity: phase === 'fading' ? 0 : 1,
                transition: `opacity ${phase === 'fading' ? FADE_OUT_SECONDS : FADE_IN_SECONDS}s linear`,
              }}
              autoPlay
              muted
              playsInline
              preload="auto"
              onTimeUpdate={handleTimeUpdate}
              onEnded={handleEnded}
              onError={handleEnded}
            />
          </div>
        ) : (
          <div className="p-4">
            <div className={`grid gap-2 ${count === 1 ? 'grid-cols-1 max-w-[64px] mx-auto' : 'grid-cols-5'}`}>
              {sim.results.map((r, i) => <PullResultIcon key={i} result={r} getImageFraming={getImageFraming} />)}
            </div>
            <p className="text-gray-500 text-sm text-center mt-3">{t('tracker.conveneSim.disclaimer')}</p>
          </div>
        )}
      </div>
    </FocusTrapModal>
  );
};

export { ConvenePullSimModal };
