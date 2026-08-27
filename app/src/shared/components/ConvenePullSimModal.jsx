// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — shared/components/ConvenePullSimModal.jsx
// Floating kuro-style panel opened by ConvenePullPills: plays the
// convene-sim video for the best rarity rolled (public/convene-sim/
// {common,4star,5star}.mp4), then reveals the 1 or 10 items ONE AT A TIME
// — full-size icon, tap-to-continue, like a real convene or a trading-card
// unboxing rather than a stat sheet dumped all at once. A 5★ item's turn
// additionally opens with a reveal beat (public/convene-sim/5star-reveal.mp4)
// before anything else. If the item being revealed is a 4★/5★ character
// with its own convene clip (public/convene-animations/, same asset as
// BannerCard's ▶️ preview), that video plays next — right as we arrive at
// THAT item's turn, not eagerly after the rarity clip — then the item
// itself reveals. A Skip button (visible during any video) jumps straight
// to the summary. Each item's reveal
// plays a small chime (chime.js — public/convene-sim/item-reveal-chime.mp3).
// After the
// last item, a summary screen shows every result at a glance plus a
// persistent per-banner-kind stats tally (useConveneSimStats.js,
// localStorage-backed) with its own Reset button.
//
// This is a display-only simulator (core/conveneSimulator.js) — no wallet
// is spent, no pity/history is written to state.profile. The stats summary
// is the one thing that *does* persist, but it's entirely separate storage
// from the real tracked pity/history.
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { X, Sparkles } from 'lucide-react';
import { FocusTrapModal } from './FocusTrapModal.jsx';
import { ConveneVideo, resumeConveneAudioContext } from './ConveneVideoLayer.jsx';
import { simulateConvenePulls, HARD_PITY, HARD_PITY_4STAR } from '../../core/conveneSimulator.js';
import { DEFAULT_COLLECTION_IMAGES, getConveneAnimation } from '../../data/banners.js';
import { hideOnError } from '../utils/imageHelpers.js';
import { useImageFramingContext } from '../../providers/ImageFramingProvider.jsx';
import { useConveneSimStats } from '../../hooks/useConveneSimStats.js';
import { suspendAmbientMusic, resumeAmbientMusic } from '../../hooks/useAmbientMusic.js';
import { playItemRevealChime } from '../utils/chime.js';
import { t } from '../../utils/i18n.js';

const VIDEO_SRC = {
  common: './convene-sim/common.mp4',
  '4star': './convene-sim/4star.mp4',
  '5star': './convene-sim/5star.mp4',
};

// Plays right as a 5★ item's own turn comes up, BEFORE that item's character
// convene clip (itemVideoFor) — a short "light gathering" reveal beat that
// precedes the character-specific animation, same pacing idea as the
// rarity video preceding the item-by-item reveal.
const FIVE_STAR_REVEAL_SRC = './convene-sim/5star-reveal.mp4';

// Background music loop for the whole modal (public/audio/convene-screen.m4a)
// — separate from the rarity/item videos' own audio, gated on both the
// master sound toggle and its own Sound-section switch. Resolved against
// BASE_URL, not window.location.href — Vite's base is './' (relative, for
// subpath/native file:// builds), same fix as chime.js/useAmbientMusic.js.
const CONVENE_MUSIC_SRC = `${import.meta.env.BASE_URL || './'}audio/convene-screen.m4a`;
const CONVENE_MUSIC_VOLUME = 0.25;

// +100% (double) past the HTML5 <video> element's normal 100% ceiling
// (ConveneVideoLayer's GainNode boost) — the 5★ rarity clip, the 5★ reveal
// beat, and a 5★'s own character convene clip read as noticeably quieter
// than everything else at native volume. Was 1.2, then 1.5 — raised again
// to 2.0 per user feedback that the earlier bumps weren't audible; the
// real fix for that was ConveneVideoLayer.jsx's AudioContext (see its
// comment — a fresh, likely-still-suspended context per auto-chained video
// meant the boost may not have actually been applying at all before now).
const FIVE_STAR_GAIN = 2.0;

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

// Ambient backdrop tint per rarity — replaces flat black so the reveal
// stage doesn't read as "video ended, black screen" (the same rgb
// triplets driving the rarity badges/glow).
const RARITY_GLOW_RGB = { 5: FIVE_STAR_GLOW_RGB, 4: '168,85,247', 3: '56,189,248' };

// One-at-a-time full reveal — the icon fills the entire reveal stage (vs
// the summary grid's small 48px tile). Characters show the raw sprite
// (object-contain, no collection-<name> framing crop — that framing is
// tuned for the app's square thumbnails and was clipping full-body art
// here). Weapons keep the framing crop (their icons are meant to be zoomed
// to that box), but the crop's hard edge is softened with a feathered
// blur-halo (convene-weapon-feather, kuro.css) instead of a bare cutoff —
// two stacked copies of the same image: a fully sharp one masked to fade
// out past 70%, and a blurred one masked to only show in the 70%-100% ring
// (invisible under the sharp layer's opaque center), so only the edge
// itself blurs while the rest of the icon stays crisp. Characters (no crop
// to hide) get a larger box — 25% bigger than a weapon's — since there's
// no risk of clipping raw, non-transformed art.
// A quick white flash (keyed per item so it retriggers every reveal) plus
// the rarity glow sell the "card flips face-up" moment.
const ItemRevealFull = ({ result, getImageFraming }) => {
  const imgUrl = result.name ? DEFAULT_COLLECTION_IMAGES[result.name] : null;
  const isWeapon = result.type === 'weapon';
  const framing = (isWeapon && result.name) ? getImageFraming(`collection-${result.name}`) : null;
  const glowRgb = RARITY_GLOW_RGB[result.rarity];
  const weaponTransform = isWeapon ? { transform: `scale(${framing.zoom / 100}) translate(${-framing.x}%, ${-framing.y}%)` } : undefined;
  return (
    <div
      className="absolute inset-0 animate-[scaleIn_0.3s_cubic-bezier(0.16,1,0.3,1)]"
      style={{ background: `radial-gradient(circle at 50% 40%, rgba(${glowRgb},0.22), rgba(8,12,20,0.96) 75%)` }}
    >
      {imgUrl ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={`relative overflow-hidden ${isWeapon ? 'w-[75%] h-[75%]' : 'w-[93.75%] h-[93.75%]'}`}>
            <img
              src={imgUrl}
              alt={result.name}
              className={`absolute inset-0 w-full h-full object-contain pointer-events-none ${isWeapon ? 'convene-weapon-sharp' : ''}`}
              style={weaponTransform}
              onError={hideOnError}
            />
            {isWeapon && (
              <img
                src={imgUrl}
                alt=""
                aria-hidden="true"
                className="absolute inset-0 w-full h-full object-contain pointer-events-none convene-weapon-blur"
                style={weaponTransform}
              />
            )}
          </div>
        </div>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center text-cyan-300"><Sparkles size={72} /></div>
      )}
      {result.isFeatured && (
        <span className="absolute top-3 right-3 z-10 text-sm bg-yellow-500 text-black px-1.5 py-0.5 rounded-full font-bold">{t('tracker.conveneSim.featuredBadge')}</span>
      )}
      {/* Name/rarity overlay — same bottom gradient scrim as BannerCard's text overlay */}
      <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col items-center gap-1 px-4 pb-4 pt-10" style={{ background: 'linear-gradient(to top, rgba(8,12,20,0.9) 40%, transparent)' }}>
        {result.name && <span className="text-gray-100 text-xl font-bold text-center">{result.name}</span>}
        <span className={`kuro-badge ${RARITY_BADGE[result.rarity]}`}>{result.rarity}★</span>
      </div>
      {/* Flash — bright pulse on arrival, fading out fast */}
      <div className="absolute inset-0 pointer-events-none animate-[itemRevealFlash_0.5s_ease-out_forwards]" style={{ background: '#fff' }} />
    </div>
  );
};

// Small labeled stat tile — reuses the app's .kuro-stat card (same
// component CalculatorTab's results grid is built from) instead of a flat
// label/value row list, so the simulator's summary reads as a proper stat
// dashboard rather than a settings-style list.
const StatTile = ({ accentClass, value, label, wide }) => (
  <div className={`kuro-stat ${accentClass} ${wide ? 'col-span-2' : ''}`}>
    <div className="kuro-number text-gray-100 text-lg font-extrabold">{value}</div>
    <div className="text-gray-400 text-2xs mt-0.5 leading-tight">{label}</div>
  </div>
);

// Persistent per-banner summary (useConveneSimStats) — "Reset" clears only
// this banner kind's simulator tally, never anything in state.profile.
const ConveneSimStatsSummary = ({ stats, onReset }) => {
  const avgPity5 = stats.fiveStarCount > 0 ? (stats.fiveStarPitySum / stats.fiveStarCount).toFixed(1) : '—';
  return (
    <div className="mt-3 pt-3 border-t border-white/10">
      <div className="flex items-center justify-between mb-2">
        <span className="text-gray-300 text-sm font-semibold uppercase tracking-wider">{t('tracker.conveneSim.statsTitle')}</span>
        <button type="button" onClick={onReset} className="kuro-btn kuro-btn-sm">{t('tracker.conveneSim.statsReset')}</button>
      </div>
      <div className="grid grid-cols-2 gap-2 text-center">
        <StatTile accentClass="kuro-stat-gold" value={`${stats.pity5}/${HARD_PITY}`} label={t('tracker.conveneSim.statsPity5Label')} />
        <StatTile accentClass="kuro-stat-purple" value={`${stats.pity4}/${HARD_PITY_4STAR}`} label={t('tracker.conveneSim.statsPity4Label')} />
        <StatTile accentClass="kuro-stat-cyan" value={stats.totalPulls} label={t('tracker.conveneSim.statsTotalPulls')} />
        <StatTile accentClass="kuro-stat-cyan" value={avgPity5} label={t('tracker.conveneSim.statsAvgPity5')} />
        <StatTile accentClass="kuro-stat-emerald" value={stats.won50} label={t('tracker.conveneSim.stats50Won')} />
        <StatTile accentClass="kuro-stat-red" value={stats.lost50} label={t('tracker.conveneSim.stats50Lost')} />
        <StatTile accentClass="kuro-stat-gray" value={`×1 ${stats.x1Pulls} · ×10 ${stats.x10Pulls}`} label={t('tracker.conveneSim.statsPullBreakdown')} wide />
        <StatTile accentClass="kuro-stat-pink" value={`5★${stats.weaponsByRarity[5]} 4★${stats.weaponsByRarity[4]} 3★${stats.weaponsByRarity[3]}`} label={t('tracker.conveneSim.statsWeapons')} wide />
        <StatTile accentClass="kuro-stat-gold" value={`5★${stats.charactersByRarity[5]} 4★${stats.charactersByRarity[4]}`} label={t('tracker.conveneSim.statsCharacters')} wide />
      </div>
    </div>
  );
};

const ConvenePullSimModal = ({ isOpen, onClose, kind, count, featuredNames, featured4Stars, startPity5, startPity4, startGuaranteed, startGuaranteed4, visualSettings, setDetailModal }) => {
  const [phase, setPhase] = useState('rarity'); // 'rarity' | 'fiveStarReveal' | 'itemVideo' | 'itemReveal' | 'summary'
  const [itemIndex, setItemIndex] = useState(0);
  const { getImageFraming } = useImageFramingContext();
  const muted = !visualSettings?.soundEnabled;
  const { stats, record, reset } = useConveneSimStats(kind);
  const musicRef = useRef(null);

  // Background music loop, independent of the rarity/item videos' own
  // audio tracks — plays for as long as the modal is open, gated on both
  // the master sound toggle and its own Sound-section switch.
  useEffect(() => {
    if (!isOpen || muted || !visualSettings?.conveneMusicEnabled) {
      musicRef.current?.pause();
      return;
    }
    const audio = musicRef.current || new Audio(CONVENE_MUSIC_SRC);
    audio.loop = true;
    audio.volume = CONVENE_MUSIC_VOLUME;
    musicRef.current = audio;
    audio.play().catch(() => {});
    return () => { audio.pause(); };
  }, [isOpen, muted, visualSettings?.conveneMusicEnabled]);

  // Duck the app's own ambient Log Screen track (useAmbientMusic.js) for as
  // long as this modal is open — its rarity/item videos (and the convene
  // music loop above) would otherwise play on top of it. Resumed on close,
  // but only if the ambient track is still actually enabled by then — read
  // through a ref (kept fresh below) rather than closing over `visualSettings`
  // directly, since this effect only depends on `isOpen`: if the user
  // changed a sound setting while the modal was still open, the cleanup
  // would otherwise fire with whatever `visualSettings` was at the moment
  // the modal opened, not the current one.
  const visualSettingsRef = useRef(visualSettings);
  useEffect(() => { visualSettingsRef.current = visualSettings; }, [visualSettings]);
  useEffect(() => {
    if (!isOpen) return;
    suspendAmbientMusic();
    return () => resumeAmbientMusic(visualSettingsRef.current);
  }, [isOpen]);

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
    if (isOpen) {
      setPhase('rarity');
      setItemIndex(0);
      // Opening the modal is itself the direct result of the pull-pill
      // click — the best chance the shared convene AudioContext gets to
      // actually resume, since every video after the first one plays
      // automatically from a previous video's 'ended' event, not a click.
      resumeConveneAudioContext();
    }
  }, [isOpen]);

  // Advances to item `idx`'s turn. A 5★ item gets the reveal beat
  // (FIVE_STAR_REVEAL_SRC) first, then its own character convene video if
  // it has one; other items go straight to their video (if any) or the
  // full reveal. Past the last item, moves to the summary screen.
  const goToItem = useCallback((idx) => {
    if (!sim || idx >= sim.results.length) { setPhase('summary'); return; }
    setItemIndex(idx);
    const result = sim.results[idx];
    const hasVideo = itemVideoFor(result);
    if (result.rarity === 5) { setPhase('fiveStarReveal'); return; }
    setPhase(hasVideo ? 'itemVideo' : 'itemReveal');
    if (!hasVideo && !muted) playItemRevealChime();
  }, [sim, muted]);

  if (!sim) return null;

  const currentResult = sim.results[itemIndex];
  const currentItemVideoUrl = phase === 'itemVideo' ? itemVideoFor(currentResult) : null;

  const handleRarityEnded = () => goToItem(0);
  const handleFiveStarRevealEnded = () => {
    const hasVideo = itemVideoFor(currentResult);
    setPhase(hasVideo ? 'itemVideo' : 'itemReveal');
    if (!hasVideo && !muted) playItemRevealChime();
  };
  const handleItemVideoEnded = () => {
    setPhase('itemReveal');
    if (!muted) playItemRevealChime();
  };
  const handleItemTap = () => { resumeConveneAudioContext(); goToItem(itemIndex + 1); };

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

        {phase === 'fiveStarReveal' && (
          <div className="relative aspect-square bg-black">
            <ConveneVideo videoUrl={FIVE_STAR_REVEAL_SRC} onEnded={handleFiveStarRevealEnded} onError={handleFiveStarRevealEnded} muted={muted} gain={FIVE_STAR_GAIN} className="absolute inset-0" />
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
          <div key={itemIndex} className="relative aspect-square overflow-hidden cursor-pointer select-none" onClick={handleItemTap} role="button" tabIndex={0} aria-label={t('tracker.conveneSim.tapToContinue')}>
            <ItemRevealFull result={currentResult} getImageFraming={getImageFraming} />
            <span className="absolute top-3 left-0 right-0 z-10 text-center text-gray-300 text-sm pointer-events-none" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.8)' }}>
              {t('tracker.conveneSim.tapToContinue')}
            </span>
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
