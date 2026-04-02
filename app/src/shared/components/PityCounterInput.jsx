// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — shared/components/PityCounterInput.jsx
// PityCounterInput component
// ═══════════════════════════════════════════════════════════════════════════════

import React, { memo } from 'react';
import { PityRing } from './PityRing.jsx';
import { SOFT_PITY_START } from '../../data/constants.js';

// P8-FIX: HIGH-15 — Extracted pity counter input component (eliminates ~120 lines of duplication across 4 banners)
const PityCounterInput = memo(({ label, pity, onPityChange, copies, maxCopies, onCopiesChange, fourStarCopies, maxFourStar, onFourStarChange, color, softColor, softGlow, sliderClass, softPityClass, SoftPityIcon, ariaPrefix }) => (
  <div>
    <div className="flex items-center gap-4 mb-2">
      <PityRing value={pity} max={80} size={56} strokeWidth={4} color={pity >= SOFT_PITY_START ? softColor : color} glowColor={pity >= SOFT_PITY_START ? softGlow : `${color}66`} />
      <div className="flex-1">
        <div className="text-sm font-medium mb-1" style={{ color }}>{label} <span className="text-gray-500 cursor-help" title="Soft pity starts at pull 64 (increasing rate). Hard pity at pull 80 (guaranteed 5★). 50/50 means a 50% chance for the featured character; losing gives a guarantee next time.">ⓘ</span></div>
        <input type="range" min="0" max="79" value={pity} onChange={e => onPityChange(+e.target.value)} className={`kuro-slider ${sliderClass}`} aria-label={`${ariaPrefix} pity`} />
        {pity >= SOFT_PITY_START && <p className={`text-[10px] ${softPityClass}`} style={{ color: softColor }}><SoftPityIcon size={10} className="inline mr-1" style={{ color: softColor, filter: `drop-shadow(0 0 4px ${softColor})` }} />Soft Pity Zone!</p>}
      </div>
      <div className="text-right">
        <span style={{ color: pity >= SOFT_PITY_START ? softColor : color }} className={`text-2xl kuro-number ${pity >= SOFT_PITY_START ? softPityClass : ''}`}>{pity}</span>
        <span className="text-gray-200 text-sm ml-0.5">/80</span>
      </div>
    </div>
    <div className="grid grid-cols-2 gap-2 text-xs">
      <div className="flex items-center justify-between">
        <span style={{ color }}>5★ Target:</span>
        <input type="text" inputMode="numeric" value={copies} onChange={e => { const v = parseInt(e.target.value, 10) || 1; onCopiesChange(Math.max(1, Math.min(maxCopies, v))); }} className="kuro-input kuro-input-sm" aria-label={`${ariaPrefix} 5-star copies`} />
      </div>
      <div className="flex items-center justify-between">
        <span className="text-purple-400">4★ Target:</span>
        <input type="text" inputMode="numeric" value={fourStarCopies} onChange={e => { const v = parseInt(e.target.value, 10) || 0; onFourStarChange(Math.max(0, Math.min(maxFourStar, v))); }} className="kuro-input kuro-input-sm" aria-label={`${ariaPrefix} 4-star copies`} />
      </div>
    </div>
  </div>
));
PityCounterInput.displayName = 'PityCounterInput';

export { PityCounterInput };
