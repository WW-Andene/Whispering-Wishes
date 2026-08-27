// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — shared/components/ConvenePullPills.jsx
// Two "x1 / x10" cost pills (this banner's tide currency, or Astrite) that
// open ConvenePullSimModal — a display-only pull simulator, not a real
// convene (no wallet is spent, no pity/history is written). Sits to the
// left of BannerCard's convene-video ▶️ button, or standalone on
// StandardBannerSection (which has no ▶️ button at all).
//
// The tide icon only shows when the player has actually entered that
// currency in the Calculator tab (state.calc.radiant/forging/lustrous) —
// showTide is that boolean, passed down from TrackerTab. With no tide
// input the pill just shows the Astrite cost, since showing a tide count
// the player hasn't told the app they have would be misleading.
//
// Sizing follows the project's PerfectSuite scale (CLAUDE.md): reuses
// .kuro-btn-sm as-is (30px min-height, 8px radius — 0.24×30=7.2, nearest
// suite value 8, which is exactly what the class already uses) rather than
// introducing a new size. Icons 14px (w-3.5 h-3.5 — same convention as
// BannerCard's element/weapon-type badges), gaps 4/8px.
// ═══════════════════════════════════════════════════════════════════════════════

import React from 'react';
import { ASTRITE_PER_PULL } from '../../data/gachaRates.js';
import { hideOnError } from '../utils/imageHelpers.js';
import { t } from '../../utils/i18n.js';

const TIDE_ICON_BY_KIND = {
  character: './ui-icons/Currency-Radiant-Tide.webp',
  weapon: './ui-icons/Currency-Forging-Tide.webp',
  standardChar: './ui-icons/Currency-Lustrous-Tide.webp',
  standardWeap: './ui-icons/Currency-Lustrous-Tide.webp',
};
const ASTRITE_ICON = './ui-icons/Currency-Astrite.webp';

const PullPill = ({ tideIcon, count, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="kuro-btn kuro-btn-sm flex items-center gap-1"
    aria-label={t('tracker.conveneSim.pullAria', { count })}
  >
    {tideIcon && (<>
      <img src={tideIcon} alt="" className="w-3.5 h-3.5" onError={hideOnError} />
      <span className="text-2xs text-gray-200 kuro-number">×{count}</span>
      <span className="text-2xs text-gray-500">/</span>
    </>)}
    <img src={ASTRITE_ICON} alt="" className="w-3.5 h-3.5" onError={hideOnError} />
    <span className="text-2xs text-gray-200 kuro-number">×{count * ASTRITE_PER_PULL}</span>
  </button>
);

/**
 * @param {'character'|'weapon'|'standardChar'|'standardWeap'} kind
 * @param {(count: 1|10) => void} onPull - opens ConvenePullSimModal for that pull count
 * @param {boolean} [showTide] - true when the player has this banner's tide entered in the Calculator tab
 */
const ConvenePullPills = ({ kind, onPull, showTide = false, className = '' }) => {
  const tideIcon = showTide ? TIDE_ICON_BY_KIND[kind] : null;
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <PullPill tideIcon={tideIcon} count={1} onClick={() => onPull(1)} />
      <PullPill tideIcon={tideIcon} count={10} onClick={() => onPull(10)} />
    </div>
  );
};

export { ConvenePullPills };
