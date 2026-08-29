// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — features/calculator/PityCounterInput.jsx
// PityCounterInput component
// ═══════════════════════════════════════════════════════════════════════════════

import React, { memo, useState } from 'react';
import { PityRing } from './PityRing.jsx';
import { SOFT_PITY_START } from '../../data/constants.js';
import { t } from '../../utils/i18n.js';

// Clears the field to blank the instant it's focused, rather than trying to
// select() the existing value so the next keystroke overwrites it — two
// earlier attempts at that (type="number" + select(), then type="text" +
// a setTimeout-deferred select()) both still lost to real-device timing:
// typing fast enough after tapping in landed the keystroke before the
// selection actually took effect, so it inserted next to the old digit
// instead of replacing it (typing "3" into an existing "1" produced "13",
// which then clamped to this field's max — "1 then 3 = 13, clamped to
// max" was the exact reported symptom). Clearing on focus needs no browser
// selection API and no timing window to race at all: there's simply
// nothing left in the field for a keystroke to combine with by the time
// any digit can be typed. draft is local, separate from the value prop —
// it's what's actually displayed while focused; blurring drops it back to
// showing the (by then already-clamped, already-committed) prop value.
function TargetInput({ value, min, max, onChange, ariaLabel, className }) {
  const [draft, setDraft] = useState(null);
  return (
    <input
      type="text"
      inputMode="numeric"
      pattern="[0-9]*"
      value={draft !== null ? draft : value}
      onFocus={() => setDraft('')}
      onBlur={() => setDraft(null)}
      onChange={(e) => {
        const raw = e.target.value;
        setDraft(raw);
        const v = parseInt(raw, 10);
        if (Number.isFinite(v)) onChange(Math.max(min, Math.min(max, v)));
      }}
      className={className}
      aria-label={ariaLabel}
    />
  );
}

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
    <div className="grid grid-cols-2 gap-2 text-base">
      <div className="flex items-center justify-between">
        <span style={{ color }}>5★ Target:</span>
        <TargetInput value={copies} min={1} max={maxCopies} onChange={onCopiesChange} className="kuro-input kuro-input-sm" ariaLabel={`${ariaPrefix} 5-star copies`} />
      </div>
      <div className="flex items-center justify-between">
        <span className="text-purple-400">4★ Target:</span>
        <TargetInput value={fourStarCopies} min={0} max={maxFourStar} onChange={onFourStarChange} className="kuro-input kuro-input-sm" ariaLabel={`${ariaPrefix} 4-star copies`} />
      </div>
    </div>
  </div>
));
PityCounterInput.displayName = 'PityCounterInput';

export { PityCounterInput };
