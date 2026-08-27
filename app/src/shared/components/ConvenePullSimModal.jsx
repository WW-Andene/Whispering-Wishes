// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — shared/components/ConvenePullSimModal.jsx
// Floating kuro-style panel opened by ConvenePullPills: plays the
// convene-sim video for the best rarity rolled (public/convene-sim/
// {common,4star,5star}.mp4), then — if a 4★+ tier landed on a specific
// character with its own convene clip (public/convene-animations/, same
// asset as BannerCard's ▶️ preview) — that character's video plays next,
// before finally revealing the 1 or 10 items.
//
// This is a display-only simulator (core/conveneSimulator.js) — no wallet
// is spent, no pity/history is written to state.profile.
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useState, useMemo, useEffect } from 'react';
import { X, Sparkles } from 'lucide-react';
import { FocusTrapModal } from './FocusTrapModal.jsx';
import { ConveneVideo } from './ConveneVideoLayer.jsx';
import { simulateConvenePulls } from '../../core/conveneSimulator.js';
import { DEFAULT_COLLECTION_IMAGES, getConveneAnimation } from '../../data/banners.js';
import { hideOnError } from '../utils/imageHelpers.js';
import { useImageFramingContext } from '../../providers/ImageFramingProvider.jsx';
import { t } from '../../utils/i18n.js';

const VIDEO_SRC = {
  common: './convene-sim/common.mp4',
  '4star': './convene-sim/4star.mp4',
  '5star': './convene-sim/5star.mp4',
};

// kuro-badge-* color variants (kuro.css) — same rarity→color mapping used
// throughout the app (WeaponDetailModal's WEAPON_RARITY_COLORS).
const RARITY_BADGE = { 5: 'kuro-badge-yellow', 4: 'kuro-badge-purple', 3: 'kuro-badge-cyan' };
const RARITY_RING = { 5: 'border-yellow-500/50', 4: 'border-purple-500/50', 3: 'border-cyan-500/40' };
// Same rgb triplet as BANNER_GRADIENT_MAP.Spectro's glow (BannerCard.jsx) —
// gold, matching kuro-badge-yellow, driving the .banner-card-glow beating
// outline (kuro.css: bannerGlow/bannerBorderGlow keyframes).
const FIVE_STAR_GLOW_RGB = '234,179,8';

// Item icon box mirrors BannerCard's "Featured 4★" preview tile exactly —
// same w-12 h-12 rounded-md bordered box, object-contain, and the
// collection-<name> framing (zoom/x/y) from useImageFraming.js, so a
// character's sprite sits identically here as it does on the banner card.
// The rarity badge below is stretched to the tile's own width (w-12)
// rather than sizing to its own content.
const PullResultIcon = ({ result, getImageFraming, onOpenDetail }) => {
  const imgUrl = DEFAULT_COLLECTION_IMAGES[result.name];
  const framing = getImageFraming(`collection-${result.name}`);
  const box = (
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
  );
  return (
    <button type="button" onClick={onOpenDetail} className="flex flex-col items-center gap-1" aria-label={result.name}>
      {result.rarity === 5
        ? <div className="banner-card-glow rounded-md" style={{ '--glow-color': FIVE_STAR_GLOW_RGB }}>{box}</div>
        : box}
      <span className={`kuro-badge ${RARITY_BADGE[result.rarity]} w-12 justify-center`}>{result.rarity}★</span>
    </button>
  );
};

const ConvenePullSimModal = ({ isOpen, onClose, kind, count, featuredNames, featured4Stars, startPity5, startPity4, startGuaranteed, visualSettings, setDetailModal }) => {
  const [phase, setPhase] = useState('rarity'); // 'rarity' | 'character' | 'revealed'
  const { getImageFraming } = useImageFramingContext();
  const isWeaponKind = kind === 'weapon' || kind === 'standardWeap';
  const muted = !visualSettings?.soundEnabled;

  const sim = useMemo(() => {
    if (!isOpen) return null;
    return simulateConvenePulls({ count, kind, featuredNames, featured4Stars, startPity5, startPity4, startGuaranteed });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // The specific character whose own convene video plays after the rarity
  // clip — the first 5★ result that both isn't a weapon pull and actually
  // has a recorded convene video (some characters don't).
  const characterVideoUrl = useMemo(() => {
    if (!sim || isWeaponKind) return null;
    const fiveStar = sim.results.find(r => r.rarity === 5);
    return fiveStar ? getConveneAnimation(fiveStar.name) : null;
  }, [sim, isWeaponKind]);

  useEffect(() => {
    if (isOpen) setPhase('rarity');
  }, [isOpen]);

  if (!sim) return null;

  const handleRarityEnded = () => setPhase(characterVideoUrl ? 'character' : 'revealed');
  const handleCharacterEnded = () => setPhase('revealed');

  const openDetail = (result) => {
    const type = result.rarity === 3 || isWeaponKind ? 'weapon' : 'character';
    setDetailModal?.({ show: true, type, name: result.name, imageUrl: DEFAULT_COLLECTION_IMAGES[result.name], framing: getImageFraming(`collection-${result.name}`) });
  };

  return (
    <FocusTrapModal isOpen={isOpen} onClose={onClose} onClick={onClose} ariaLabel={t('tracker.conveneSim.modalAria')} centered padding="p-3">
      <div className="kuro-card relative w-full max-w-md overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-3 right-3 z-20 p-3 min-w-[48px] min-h-[48px] flex items-center justify-center rounded-lg bg-black/50 text-white hover:bg-black/70 modal-close-btn" aria-label={t('tracker.conveneSim.closeAria')}>
          <X size={16} />
        </button>

        {phase !== 'revealed' ? (
          <div className="relative aspect-square bg-black">
            {phase === 'rarity'
              ? <ConveneVideo key="rarity" videoUrl={VIDEO_SRC[sim.video]} onEnded={handleRarityEnded} onError={handleRarityEnded} muted={muted} className="absolute inset-0" />
              : <ConveneVideo key="character" videoUrl={characterVideoUrl} onEnded={handleCharacterEnded} onError={handleCharacterEnded} muted={muted} className="absolute inset-0" />}
          </div>
        ) : (
          <div className="p-4">
            <div className={`grid gap-2 ${count === 1 ? 'grid-cols-1 max-w-[64px] mx-auto' : 'grid-cols-5'}`}>
              {sim.results.map((r, i) => <PullResultIcon key={i} result={r} getImageFraming={getImageFraming} onOpenDetail={() => openDetail(r)} />)}
            </div>
            <p className="text-gray-500 text-sm text-center mt-3">{t('tracker.conveneSim.disclaimer')}</p>
          </div>
        )}
      </div>
    </FocusTrapModal>
  );
};

export { ConvenePullSimModal };
