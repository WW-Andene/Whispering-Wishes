// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — features/tracker/StandardBannerSection.jsx
// Standard (permanent) banner section.
// ═══════════════════════════════════════════════════════════════════════════════

// BUG FIX (direct user request 2026-09-11): full-animation mode used to show a bespoke
// twinkling-star/dust-mote canvas overlay (StandardBannerOverlay) unique to this banner,
// instead of the same "breath-zoom" slow scale-pulse every other banner's art gets in
// full-animation mode (BannerCard.jsx, CharacterDetailModal.jsx, etc. — see kuro.css's
// `.animations-full .breath-zoom` rule). Removed that overlay entirely and applied
// `breath-zoom` to this banner's own img instead, for the same look as everywhere else.

import React, { useState, memo } from 'react';
import { ChevronUp } from 'lucide-react';

import { hideOnError } from '../../shared/utils/imageHelpers.js';
import { generateMaskGradient, TEXT_SHADOW_STYLE } from '../../shared/components/BannerCard.jsx';
import { ConvenePullPills } from '../../shared/components/ConvenePullPills.jsx';
import { ConvenePullSimModal } from '../../shared/components/ConvenePullSimModal.jsx';
import { FocusTrapModal } from '../../shared/components/FocusTrapModal.jsx';
import { useImageFramingContext } from '../../providers/ImageFramingProvider.jsx';
import { storageAvailable } from '../../core/storage.js';
import { STANDARD_WEAPON_TARGET_KEY } from '../../shared/constants/appConstants.js';
import { DEFAULT_COLLECTION_IMAGES } from '../../data/banners.js';
import { t } from '../../utils/i18n.js';

// Direct user request 2026-09-11: the Standard banner's old horizontally-scrolling row of
// weapon/character tags is replaced by a single (^) button that opens this kuro-styled panel —
// a grid of preview pictures (5x5 for the Standard Weapon banner's target picker, 3x3 for the
// Standard Character banner's roster) instead of small text pills. Clicking a preview picture
// opens its detail modal (same click-to-open pattern as BannerCard's featured-4★ previews);
// for the weapon banner, the panel entry itself is also the target-select control.
const StandardPoolPicker = memo(({ isOpen, onClose, title, items, itemKey, columns, selectable, targetWeapon, selectTarget, setDetailModal }) => {
  const { getImageFraming } = useImageFramingContext();
  const gridColsClass = columns === 3 ? 'grid-cols-3' : 'grid-cols-5';

  const renderTile = (item) => {
    const name = typeof item === 'string' ? item : item[itemKey];
    const selected = selectable && targetWeapon === name;
    const previewImg = DEFAULT_COLLECTION_IMAGES[name];
    const framingKey = `collection-${name}`;
    const framing = getImageFraming(framingKey);
    return (
      <div key={name} className="flex flex-col items-center gap-1">
        <div
          className={`w-full aspect-square rounded-md overflow-hidden border bg-black/25 cursor-pointer ${selected ? 'border-yellow-400 ring-2 ring-yellow-500/50' : 'border-cyan-400/40'}`}
          onClick={() => setDetailModal?.({ show: true, type: selectable ? 'weapon' : 'character', name, imageUrl: previewImg, framing })}
          title={t('tracker.conveneSim.viewDetailAria', { name })}
        >
          {previewImg && (
            <img
              src={previewImg}
              alt=""
              aria-hidden="true"
              className="w-full h-full object-contain pointer-events-none"
              style={{ transform: `scale(${framing.zoom / 100}) translate(${-framing.x}%, ${-framing.y}%)` }}
              onError={hideOnError}
            />
          )}
        </div>
        <button
          type="button"
          onClick={selectable ? () => selectTarget(name) : undefined}
          className={`w-full text-2xs px-1 py-0.5 rounded truncate text-center ${selectable ? 'cursor-pointer' : 'cursor-default'} ${selected ? 'bg-yellow-500 text-black font-bold' : 'text-cyan-300 bg-cyan-500/30'}`}
          title={selectable ? t('tracker.conveneSim.targetWeaponHint') : name}
        >
          {selected && '★ '}{name}
        </button>
      </div>
    );
  };

  // Direct user clarification 2026-09-11: the Standard Weapon pool is two distinct
  // collections (the five original standard 5★ weapons, and five added later), not
  // one flat list — grouped and labeled separately here whenever items carry a
  // `collection` field (banners.js's standardWeapons). standardCharacters has no
  // such field and falls through to the single flat grid below.
  const hasCollections = (items || []).some(i => i && typeof i === 'object' && i.collection != null);
  const collections = hasCollections
    ? [...new Map((items || []).map(i => [i.collection, true])).keys()].sort((a, b) => a - b)
    : null;

  return (
    <FocusTrapModal isOpen={isOpen} onClose={onClose} centered padding="p-3" onClick={onClose}>
      <div className="kuro-card w-full max-w-sm max-h-[80vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-medium)]" data-sheet-header>
          <h3 className="text-white text-lg font-semibold">{title}</h3>
          <button onClick={onClose} className="p-3 min-w-[calc(48px*var(--ui-scale,1))] min-h-[calc(48px*var(--ui-scale,1))] flex items-center justify-center rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all" aria-label={t('tracker.conveneSim.closePickerAria')}>
            <ChevronUp size={16} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {collections ? collections.map(col => (
            <div key={col}>
              <div className="text-gray-400 text-2xs uppercase tracking-wider mb-1">{t('tracker.conveneSim.collectionLabel', { number: col })}</div>
              <div className={`grid gap-2 ${gridColsClass}`}>
                {items.filter(i => i.collection === col).map(renderTile)}
              </div>
            </div>
          )) : (
            <div className={`grid gap-2 ${gridColsClass}`}>
              {(items || []).map(renderTile)}
            </div>
          )}
        </div>
      </div>
    </FocusTrapModal>
  );
});
StandardPoolPicker.displayName = 'StandardPoolPicker';

// Standard banner card — eliminates ~110 lines of copy-paste between standard char/weap banners
const StandardBannerSection = memo(({ bannerImage, altText, title, subtitle, items, itemKey, profileData, visualSettings, imagePosition, kind, calc, setDetailModal }) => {
  const stdMask = generateMaskGradient(visualSettings.standardFadePosition ?? 50, visualSettings.standardFadeIntensity ?? 100);
  const stdOpacity = (visualSettings.standardOpacity ?? 100) / 100;
  const isFull = visualSettings?.animationsEnabled === 'full';
  const [pullSim, setPullSim] = useState(null);
  const [pullSimId, setPullSimId] = useState(0);
  const [pickerOpen, setPickerOpen] = useState(false);
  // Winter Brume's "Target Weapon" system (standardWeap only, see
  // conveneSimulator.js's file header) — persisted so the pick survives
  // between visits, same as a real Epitomized-Path-style selection would.
  const [targetWeapon, setTargetWeapon] = useState(() => {
    if (kind !== 'standardWeap' || !storageAvailable) return null;
    try { return localStorage.getItem(STANDARD_WEAPON_TARGET_KEY) || null; } catch { return null; }
  });
  const selectTarget = (name) => {
    const next = targetWeapon === name ? null : name;
    setTargetWeapon(next);
    if (storageAvailable) {
      try {
        if (next) localStorage.setItem(STANDARD_WEAPON_TARGET_KEY, next);
        else localStorage.removeItem(STANDARD_WEAPON_TARGET_KEY);
      } catch {}
    }
  };
  return (
    <div className="relative overflow-hidden rounded-xl border border-cyan-500/30 kuro-shadow-standard-banner" style={{ minHeight: 'var(--height-banner)', isolation: 'isolate', zIndex: 5 }}>
      {bannerImage && (
        <img
          src={bannerImage}
          alt={altText}
          className={`absolute inset-0 w-full h-full object-cover ${isFull ? 'breath-zoom' : ''}`}
          style={{ zIndex: 1, opacity: stdOpacity, maskImage: stdMask, WebkitMaskImage: stdMask, objectPosition: imagePosition ?? 'center top' }}
          loading="eager"
          onError={hideOnError}
        />
      )}
      {/* Bottom-right, same as BannerCard's pills elsewhere. The pity/convene stat bar this
          used to share the banner card with now lives in TrackerTab's header row instead
          (see PityTrackerCompact usage there), so the pills no longer need to reserve space
          above it. */}
      <div className="absolute right-2 bottom-2 z-20">
        <ConvenePullPills kind={kind} onPull={(c) => { setPullSim(c); setPullSimId(id => id + 1); }} showTide={calc?.lustrous > 0} />
      </div>
      <ConvenePullSimModal
        key={pullSimId}
        isOpen={pullSim != null}
        onClose={() => setPullSim(null)}
        kind={kind}
        count={pullSim || 1}
        featuredNames={targetWeapon ? [targetWeapon] : undefined}
        startPity5={profileData?.pity5 ?? 0}
        startPity4={profileData?.pity4 ?? 0}
        visualSettings={visualSettings}
        setDetailModal={setDetailModal}
      />
      <div className="absolute inset-0 z-10 p-3 flex flex-col justify-between" style={TEXT_SHADOW_STYLE}>
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="kuro-badge kuro-badge-cyan" style={{ backgroundColor: 'rgba(0,200,255,0.1)' }}>{subtitle}</span>
          </div>
          <h4 className="font-bold text-xl text-white leading-tight">{title}</h4>
        </div>
        <div>
          <div className="text-gray-300 text-sm mb-0.5 uppercase tracking-wider">
            {kind === 'standardWeap' ? t('tracker.conveneSim.targetWeaponLabel') : 'Available 5★'}
          </div>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setPickerOpen(true); }}
            className="flex items-center gap-1.5 text-sm text-cyan-300 bg-cyan-500/30 backdrop-blur-sm px-2 py-1 rounded"
            aria-label={t('tracker.conveneSim.openPickerAria')}
          >
            {kind === 'standardWeap' && targetWeapon ? <>★ {targetWeapon}</> : t('tracker.conveneSim.openPickerLabel')}
            <ChevronUp size={12} />
          </button>
        </div>
      </div>
      <StandardPoolPicker
        isOpen={pickerOpen}
        onClose={() => setPickerOpen(false)}
        title={kind === 'standardWeap' ? t('tracker.conveneSim.targetWeaponLabel') : title}
        items={items}
        itemKey={itemKey}
        columns={kind === 'standardWeap' ? 5 : 3}
        selectable={kind === 'standardWeap'}
        targetWeapon={targetWeapon}
        selectTarget={selectTarget}
        setDetailModal={setDetailModal}
      />
    </div>
  );
});
StandardBannerSection.displayName = 'StandardBannerSection';

// Import guide data — eliminates ~90 lines of repetitive numbered-step JSX

export { StandardBannerSection };
