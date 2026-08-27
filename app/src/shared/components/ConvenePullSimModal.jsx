// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — shared/components/ConvenePullSimModal.jsx
// Floating kuro-style panel opened by ConvenePullPills: plays the
// convene-sim video for the best rarity rolled (public/convene-sim/
// {common,4star,5star}.mp4), then reveals the 1 or 10 items ONE AT A TIME
// — full-size icon, tap-to-continue, like a real convene or a trading-card
// unboxing rather than a stat sheet dumped all at once. If the item being
// revealed is a 4★/5★ character with its own convene clip (public/
// convene-animations/, same asset as BannerCard's ▶️ preview), that video
// plays first — right as we arrive at THAT item's turn, not eagerly after
// the rarity clip — then the item itself reveals. A Skip button (visible
// during either video) jumps straight to the summary. After the last item,
// a summary screen shows every result at a glance plus a persistent
// per-banner-kind stats tally (useConveneSimStats.js, localStorage-backed)
// with its own Reset button.
//
// This is a display-only simulator (core/conveneSimulator.js) — no wallet
// is spent, no pity/history is written to state.profile. The stats summary
// is the one thing that *does* persist, but it's entirely separate storage
// from the real tracked pity/history.
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { X, Sparkles } from 'lucide-react';
import { FocusTrapModal } from './FocusTrapModal.jsx';
import { ConveneVideo } from './ConveneVideoLayer.jsx';
import { simulateConvenePulls, HARD_PITY, HARD_PITY_4STAR } from '../../core/conveneSimulator.js';
import { DEFAULT_COLLECTION_IMAGES, getConveneAnimation } from '../../data/banners.js';
import { hideOnError } from '../utils/imageHelpers.js';
import { useImageFramingContext } from '../../providers/ImageFramingProvider.jsx';
import { useConveneSimStats } from '../../hooks/useConveneSimStats.js';
import { t } from '../../utils/i18n.js';

const VIDEO_SRC = {
  common: './convene-sim/common.mp4',
  '4star': './convene-sim/4star.mp4',
  '5star': './convene-sim/5star.mp4',
};

// +20% past the HTML5 <video> element's normal 100% ceiling (ConveneVideoLayer's
// GainNode boost) — the 5★ rarity clip and a 5★'s own character convene clip
// read as noticeably quieter than everything else at native volume.
const FIVE_STAR_GAIN = 1.2;

// kuro-badge-* color variants (kuro.css) — same rarity→color mapping used
// throughout the app (WeaponDetailModal's WEAPON_RARITY_COLORS).
const RARITY_BADGE = { 5: 'kuro-badge-yellow', 4: 'kuro-badge-purple', 3: 'kuro-badge-cyan' };
const RARITY_RING = { 5: 'border-yellow-500/50', 4: 'border-purple-500/50', 3: 'border-cyan-500/40' };
// Same rgb triplet as BANNER_GRADIENT_MAP.Spectro's glow (BannerCard.jsx) —
// gold, matching kuro-badge-yellow, driving the .banner-card-glow beating
// outline (kuro.css: bannerGlow/bannerBorderGlow keyframes).
const FIVE_STAR_GLOW_RGB = '234,179,8';

// A 4★/5★ character result gets its own convene video played right as its
// turn comes up in the one-by-one reveal — not every 4★/5★ has one yet.
const itemVideoFor = (result) => {
  if (!result || result.rarity < 4 || result.type !== 'character') return null;
  return getConveneAnimation(result.name);
};

// Small tile used on the final summary grid — same w-12 h-12 bordered box
// BannerCard uses for its "Featured 4★" preview.
const PullResultTile = ({ result, getImageFraming, onOpenDetail }) => {
  const imgUrl = result.name ? DEFAULT_COLLECTION_IMAGES[result.name] : null;
  const framing = result.name ? getImageFraming(`collection-${result.name}`) : null;
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
  const badge = <span className={`kuro-badge ${RARITY_BADGE[result.rarity]} w-12 justify-center`}>{result.rarity}★</span>;
  const glowBox = result.rarity === 5
    ? <div className="banner-card-glow rounded-md" style={{ '--glow-color': FIVE_STAR_GLOW_RGB }}>{box}</div>
    : box;
  if (!result.name) {
    return <div className="flex flex-col items-center gap-1">{glowBox}{badge}</div>;
  }
  return (
    <button type="button" onClick={onOpenDetail} className="flex flex-col items-center gap-1" aria-label={result.name}>
      {glowBox}{badge}
    </button>
  );
};

// One-at-a-time full reveal — 128px icon (vs the summary grid's 48px tile),
// same object-contain + collection-<name> framing so the sprite sits
// identically to everywhere else it's shown.
const ItemRevealFull = ({ result, getImageFraming }) => {
  const imgUrl = result.name ? DEFAULT_COLLECTION_IMAGES[result.name] : null;
  const framing = result.name ? getImageFraming(`collection-${result.name}`) : null;
  const box = (
    <div className={`relative w-32 h-32 rounded-xl overflow-hidden border-2 bg-black/25 ${RARITY_RING[result.rarity]}`}>
      {imgUrl ? (
        <img
          src={imgUrl}
          alt={result.name}
          className="w-full h-full object-contain pointer-events-none"
          style={{ transform: `scale(${framing.zoom / 100}) translate(${-framing.x}%, ${-framing.y}%)` }}
          onError={hideOnError}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-cyan-300"><Sparkles size={48} /></div>
      )}
      {result.isFeatured && (
        <span className="absolute top-1 right-1 text-sm bg-yellow-500 text-black px-1.5 py-0.5 rounded-full font-bold">{t('tracker.conveneSim.featuredBadge')}</span>
      )}
    </div>
  );
  return (
    <div className="flex flex-col items-center gap-2 animate-[scaleIn_0.25s_cubic-bezier(0.16,1,0.3,1)]">
      {result.rarity === 5
        ? <div className="banner-card-glow rounded-xl" style={{ '--glow-color': FIVE_STAR_GLOW_RGB }}>{box}</div>
        : box}
      {result.name && <span className="text-gray-100 text-lg font-bold">{result.name}</span>}
      <span className={`kuro-badge ${RARITY_BADGE[result.rarity]}`}>{result.rarity}★</span>
    </div>
  );
};

// Persistent per-banner summary (useConveneSimStats) — "Reset" clears only
// this banner kind's simulator tally, never anything in state.profile.
const StatRow = ({ label, value }) => (
  <div className="flex items-center justify-between">
    <span className="text-gray-400 text-sm">{label}</span>
    <span className="text-gray-100 text-sm font-medium kuro-number">{value}</span>
  </div>
);

const ConveneSimStatsSummary = ({ stats, onReset }) => {
  const avgPity5 = stats.fiveStarCount > 0 ? (stats.fiveStarPitySum / stats.fiveStarCount).toFixed(1) : '—';
  return (
    <div className="mt-3 pt-3 border-t border-white/10 space-y-1.5">
      <div className="flex items-center justify-between mb-1">
        <span className="text-gray-300 text-sm font-semibold uppercase tracking-wider">{t('tracker.conveneSim.statsTitle')}</span>
        <button type="button" onClick={onReset} className="kuro-btn kuro-btn-sm">{t('tracker.conveneSim.statsReset')}</button>
      </div>
      <StatRow label={t('tracker.conveneSim.statsCurrentPity')} value={`5★ ${stats.pity5}/${HARD_PITY} · 4★ ${stats.pity4}/${HARD_PITY_4STAR}`} />
      <StatRow label={t('tracker.conveneSim.statsTotalPulls')} value={stats.totalPulls} />
      <StatRow label={t('tracker.conveneSim.statsPullBreakdown')} value={`×1: ${stats.x1Pulls} · ×10: ${stats.x10Pulls}`} />
      <StatRow label={t('tracker.conveneSim.statsWeapons')} value={`5★ ${stats.weaponsByRarity[5]} · 4★ ${stats.weaponsByRarity[4]} · 3★ ${stats.weaponsByRarity[3]}`} />
      <StatRow label={t('tracker.conveneSim.statsCharacters')} value={`5★ ${stats.charactersByRarity[5]} · 4★ ${stats.charactersByRarity[4]}`} />
      <StatRow label={t('tracker.conveneSim.stats5050')} value={t('tracker.conveneSim.stats5050Value', { won: stats.won50, lost: stats.lost50 })} />
      <StatRow label={t('tracker.conveneSim.statsAvgPity5')} value={avgPity5} />
    </div>
  );
};

const ConvenePullSimModal = ({ isOpen, onClose, kind, count, featuredNames, featured4Stars, startPity5, startPity4, startGuaranteed, startGuaranteed4, visualSettings, setDetailModal }) => {
  const [phase, setPhase] = useState('rarity'); // 'rarity' | 'itemVideo' | 'itemReveal' | 'summary'
  const [itemIndex, setItemIndex] = useState(0);
  const { getImageFraming } = useImageFramingContext();
  const muted = !visualSettings?.soundEnabled;
  const { stats, record, reset } = useConveneSimStats(kind);

  // Simulated pity persists across pulls (useConveneSimStats) instead of
  // resetting to the real live pity every time — seeded from the real
  // pity only on the very first pull ever made in this banner's
  // simulator (stats.seeded===false), same as a fresh pity counter would
  // be. See useConveneSimStats.js's file header for why this matters:
  // without it, soft pity (66+) was essentially unreachable.
  const sim = useMemo(() => {
    if (!isOpen) return null;
    const seedPity5 = stats.seeded ? stats.pity5 : startPity5;
    const seedPity4 = stats.seeded ? stats.pity4 : startPity4;
    const seedGuaranteed = stats.seeded ? stats.guaranteed : startGuaranteed;
    const seedGuaranteed4 = stats.seeded ? stats.guaranteed4 : startGuaranteed4;
    return simulateConvenePulls({ count, kind, featuredNames, featured4Stars, startPity5: seedPity5, startPity4: seedPity4, startGuaranteed: seedGuaranteed, startGuaranteed4: seedGuaranteed4 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Tallied the moment a pull is rolled (not gated on watching the video or
  // reaching the summary) — once initiated, a pull "happened" the same way
  // a real convene commits immediately, matching the fix that makes closing
  // early always reroll on the next attempt rather than replaying this one.
  useEffect(() => {
    if (sim) record(sim, count);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sim]);

  useEffect(() => {
    if (isOpen) { setPhase('rarity'); setItemIndex(0); }
  }, [isOpen]);

  // Advances to item `idx`'s turn — its own convene video first if it has
  // one, otherwise straight to its full reveal. Past the last item, moves
  // to the summary screen.
  const goToItem = useCallback((idx) => {
    if (!sim || idx >= sim.results.length) { setPhase('summary'); return; }
    setItemIndex(idx);
    setPhase(itemVideoFor(sim.results[idx]) ? 'itemVideo' : 'itemReveal');
  }, [sim]);

  if (!sim) return null;

  const currentResult = sim.results[itemIndex];
  const currentItemVideoUrl = phase === 'itemVideo' ? itemVideoFor(currentResult) : null;

  const handleRarityEnded = () => goToItem(0);
  const handleItemVideoEnded = () => setPhase('itemReveal');
  const handleItemTap = () => goToItem(itemIndex + 1);

  const openDetail = (result) => {
    if (!result.name) return;
    setDetailModal?.({ show: true, type: result.type, name: result.name, imageUrl: DEFAULT_COLLECTION_IMAGES[result.name], framing: getImageFraming(`collection-${result.name}`) });
  };

  return (
    <FocusTrapModal isOpen={isOpen} onClose={onClose} onClick={onClose} ariaLabel={t('tracker.conveneSim.modalAria')} centered padding="p-3">
      <div className="kuro-card relative w-full max-w-md overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-3 right-3 z-20 p-3 min-w-[48px] min-h-[48px] flex items-center justify-center rounded-lg bg-black/50 text-white hover:bg-black/70 modal-close-btn" aria-label={t('tracker.conveneSim.closeAria')}>
          <X size={16} />
        </button>

        {phase === 'rarity' && (
          <div className="relative aspect-square bg-black">
            <ConveneVideo videoUrl={VIDEO_SRC[sim.video]} onEnded={handleRarityEnded} onError={handleRarityEnded} muted={muted} gain={sim.video === '5star' ? FIVE_STAR_GAIN : 1} className="absolute inset-0" />
            <button onClick={() => setPhase('summary')} className="kuro-btn kuro-btn-sm absolute bottom-3 right-3 z-20">{t('tracker.conveneSim.skip')}</button>
          </div>
        )}

        {phase === 'itemVideo' && (
          <div className="relative aspect-square bg-black">
            <ConveneVideo key={itemIndex} videoUrl={currentItemVideoUrl} onEnded={handleItemVideoEnded} onError={handleItemVideoEnded} muted={muted} gain={currentResult.rarity === 5 ? FIVE_STAR_GAIN : 1} className="absolute inset-0" />
            <button onClick={() => setPhase('summary')} className="kuro-btn kuro-btn-sm absolute bottom-3 right-3 z-20">{t('tracker.conveneSim.skip')}</button>
          </div>
        )}

        {phase === 'itemReveal' && (
          <div className="relative aspect-square bg-black flex items-center justify-center cursor-pointer select-none" onClick={handleItemTap} role="button" tabIndex={0} aria-label={t('tracker.conveneSim.tapToContinue')}>
            <ItemRevealFull result={currentResult} getImageFraming={getImageFraming} />
            <div className="absolute bottom-3 left-0 right-0 flex flex-col items-center gap-1 pointer-events-none">
              <span className="text-gray-400 text-sm">{t('tracker.conveneSim.tapToContinue')}</span>
              <span className="text-gray-500 text-2xs kuro-number">{itemIndex + 1} / {sim.results.length}</span>
            </div>
          </div>
        )}

        {phase === 'summary' && (
          <div className="p-4">
            <div className={`grid gap-2 ${count === 1 ? 'grid-cols-1 max-w-[64px] mx-auto' : 'grid-cols-5'}`}>
              {sim.results.map((r, i) => <PullResultTile key={i} result={r} getImageFraming={getImageFraming} onOpenDetail={() => openDetail(r)} />)}
            </div>
            <p className="text-gray-500 text-sm text-center mt-3">{t('tracker.conveneSim.disclaimer')}</p>
            <ConveneSimStatsSummary stats={stats} onReset={reset} />
          </div>
        )}
      </div>
    </FocusTrapModal>
  );
};

export { ConvenePullSimModal };
