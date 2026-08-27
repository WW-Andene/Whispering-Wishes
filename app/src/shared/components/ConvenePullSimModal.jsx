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
import { X } from 'lucide-react';
import { FocusTrapModal } from './FocusTrapModal.jsx';
import { simulateConvenePulls } from '../../core/conveneSimulator.js';
import { DEFAULT_COLLECTION_IMAGES } from '../../data/banners.js';
import { hideOnError } from '../utils/imageHelpers.js';
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

// Mirrors WeaponDetailModal.jsx's WEAPON_RARITY_COLORS (kept local — that
// file doesn't export it, and this is a small enough palette that
// duplicating rather than refactoring a shared export felt like less
// churn for now).
const RARITY_COLORS = {
  5: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/50' },
  4: { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/50' },
  3: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/50' },
};

const PullResultIcon = ({ result }) => {
  const colors = RARITY_COLORS[result.rarity];
  const imgUrl = result.name ? DEFAULT_COLLECTION_IMAGES[result.name] : null;
  return (
    <div className={`relative rounded-lg overflow-hidden border ${colors.border} ${colors.bg} aspect-square flex items-center justify-center`}>
      {imgUrl
        ? <img src={imgUrl} alt={result.name} className="w-full h-full object-cover" onError={hideOnError} />
        : <span className={`text-2xl font-bold ${colors.text}`}>★</span>}
      {result.isFeatured && (
        <span className="absolute top-0.5 right-0.5 text-2xs bg-yellow-500 text-black px-1 rounded-full font-bold">{t('tracker.conveneSim.featuredBadge')}</span>
      )}
      <span className={`absolute bottom-0.5 left-0.5 text-2xs font-bold ${colors.text}`}>{result.rarity}★</span>
    </div>
  );
};

const ConvenePullSimModal = ({ isOpen, onClose, kind, count, featuredNames, featured4Stars, startPity5, startPity4, startGuaranteed }) => {
  const [phase, setPhase] = useState('playing'); // 'playing' | 'fading' | 'revealed'
  const [firedFade, setFiredFade] = useState(false);

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
      <div className="kuro-card relative w-full max-w-md overflow-hidden flex flex-col border border-cyan-500/30" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-3 right-3 z-20 p-3 min-w-[48px] min-h-[48px] flex items-center justify-center rounded-lg bg-black/50 text-white hover:bg-black/70 modal-close-btn" aria-label={t('tracker.conveneSim.closeAria')}>
          <X size={16} />
        </button>

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
            <h3 className="text-gray-100 font-bold text-lg mb-3 text-center">{t('tracker.conveneSim.resultsTitle', { count })}</h3>
            <div className={`grid gap-2 ${count === 1 ? 'grid-cols-1 max-w-[128px] mx-auto' : 'grid-cols-5'}`}>
              {sim.results.map((r, i) => <PullResultIcon key={i} result={r} />)}
            </div>
            <p className="text-gray-500 text-sm text-center mt-3">{t('tracker.conveneSim.disclaimer')}</p>
          </div>
        )}
      </div>
    </FocusTrapModal>
  );
};

export { ConvenePullSimModal };
