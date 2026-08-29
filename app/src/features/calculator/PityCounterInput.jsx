// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — features/calculator/PityCounterInput.jsx
// PityCounterInput component
// ═══════════════════════════════════════════════════════════════════════════════

import React, { memo } from 'react';
import { PityRing } from './PityRing.jsx';
import { SOFT_PITY_START } from '../../data/constants.js';
import { t } from '../../utils/i18n.js';

// P8-FIX: HIGH-15 — Extracted pity counter input component (eliminates ~120 lines of duplication across 4 banners)
const PityCounterInput = memo(({ label, pity, onPityChange, copies, maxCopies, onCopiesChange, fourStarCopies, maxFourStar, onFourStarChange, color, softColor, softGlow, sliderClass, softPityClass, SoftPityIcon, ariaPrefix }) => (
  <div>
    <div className="flex items-center gap-4 mb-2">
      <PityRing value={pity} max={80} size={56} strokeWidth={4} color={pity >= SOFT_PITY_START ? softColor : color} glowColor={pity >= SOFT_PITY_START ? softGlow : `${color}66`} />
      <div className="flex-1">
        <div className="text-md font-medium mb-1" style={{ color }}>{label} <span className="text-gray-500  cursor-help" title={t('pity.tooltip', { start: SOFT_PITY_START })}>ⓘ</span></div>
        <input type="range" min="0" max="79" value={pity} onChange={e => onPityChange(+e.target.value)} className={`kuro-slider ${sliderClass}`} aria-label={`${ariaPrefix} pity`} />
        {pity >= SOFT_PITY_START && <p className={`text-sm ${softPityClass}`} style={{ color: softColor }}><SoftPityIcon size={12} className="inline mr-1" style={{ color: softColor, filter: `drop-shadow(0 0 4px ${softColor})` }} />Soft Pity Zone!</p>}
      </div>
      <div className="text-right">
        <span style={{ color: pity >= SOFT_PITY_START ? softColor : color }} className={`text-3xl kuro-number ${pity >= SOFT_PITY_START ? softPityClass : ''}`}>{pity}</span>
        <span className="text-gray-200 text-md ml-0.5">/80</span>
      </div>
    </div>
    {/* type="number" with a plain value/onChange, matching the Resources
        card's astrite/lunite inputs elsewhere in this tab — not the
        previous type="text" + onFocus-select() combo, which didn't
        reliably select-all on-device: typing "2" after an existing "1"
        appended to "12" instead of replacing it, since the next keystroke
        landed after the un-selected existing digit rather than replacing
        it. A native number input's own value/selection handling doesn't
        have that failure mode. */}
    <div className="grid grid-cols-2 gap-2 text-base">
      <div className="flex items-center justify-between">
        <span style={{ color }}>5★ Target:</span>
        <input type="number" min="1" max={maxCopies} value={copies} onChange={e => { const v = parseInt(e.target.value, 10) || 1; onCopiesChange(Math.max(1, Math.min(maxCopies, v))); }} className="kuro-input kuro-input-sm" aria-label={`${ariaPrefix} 5-star copies`} />
      </div>
      <div className="flex items-center justify-between">
        <span className="text-purple-400">4★ Target:</span>
        <input type="number" min="0" max={maxFourStar} value={fourStarCopies} onChange={e => { const v = parseInt(e.target.value, 10) || 0; onFourStarChange(Math.max(0, Math.min(maxFourStar, v))); }} className="kuro-input kuro-input-sm" aria-label={`${ariaPrefix} 4-star copies`} />
      </div>
    </div>
  </div>
));
PityCounterInput.displayName = 'PityCounterInput';

export { PityCounterInput };
