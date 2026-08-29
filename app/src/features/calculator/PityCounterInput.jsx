// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — features/calculator/PityCounterInput.jsx
// PityCounterInput component
// ═══════════════════════════════════════════════════════════════════════════════

import React, { memo } from 'react';
import { PityRing } from './PityRing.jsx';
import { SOFT_PITY_START } from '../../data/constants.js';
import { t } from '../../utils/i18n.js';

// Deferred by one tick (setTimeout 0) rather than called synchronously —
// see the Target-input comment below for why a bare e.target.select() in
// onFocus doesn't reliably stick on Android WebView.
function selectOnFocus(e) {
  const el = e.target;
  setTimeout(() => el.select(), 0);
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
    {/* type="text" + inputMode="numeric", NOT type="number" — this is the
        actual root cause the previous two attempts both missed. Per the
        HTML living standard, HTMLInputElement.select() and
        setSelectionRange() are only defined for text-like input types
        (text, search, tel, url, password); for type="number" (what this
        was until now) they're explicitly unsupported and are a silent
        no-op — or throw — in WebView/Chromium. So the select-on-focus
        call below was never actually selecting anything on a
        type="number" input, regardless of the setTimeout deferral: there
        was nothing wrong with the DEFERRAL, the input type itself
        couldn't be selected via script at all. inputMode="numeric" still
        gets the numeric soft keyboard on Android without that
        selection-API restriction, since the underlying element is a real
        text input.
        Tapping into either field selects its whole current value so the
        very next keystroke replaces it — these are fields with an
        already-nonzero default (usually 1) that people actively retype,
        unlike astrite/lunite which start at 0 and are rarely edited more
        than once, so "typing 2 after an existing 1 appends to 12 instead
        of replacing it" is far more visible here. The select() itself is
        still deferred by one tick (setTimeout 0): a bare synchronous call
        in onFocus loses to the browser's own default cursor placement,
        which runs after the focus handler and overrides an immediate
        select() — deferring runs it after that placement instead of
        racing it. onMouseUp/onTouchEnd re-select too, since re-tapping an
        ALREADY-focused input doesn't fire onFocus again on some WebView
        builds. */}
    <div className="grid grid-cols-2 gap-2 text-base">
      <div className="flex items-center justify-between">
        <span style={{ color }}>5★ Target:</span>
        <input type="text" inputMode="numeric" pattern="[0-9]*" value={copies} onFocus={selectOnFocus} onMouseUp={selectOnFocus} onTouchEnd={selectOnFocus} onChange={e => { const v = parseInt(e.target.value, 10) || 1; onCopiesChange(Math.max(1, Math.min(maxCopies, v))); }} className="kuro-input kuro-input-sm" aria-label={`${ariaPrefix} 5-star copies`} />
      </div>
      <div className="flex items-center justify-between">
        <span className="text-purple-400">4★ Target:</span>
        <input type="text" inputMode="numeric" pattern="[0-9]*" value={fourStarCopies} onFocus={selectOnFocus} onMouseUp={selectOnFocus} onTouchEnd={selectOnFocus} onChange={e => { const v = parseInt(e.target.value, 10) || 0; onFourStarChange(Math.max(0, Math.min(maxFourStar, v))); }} className="kuro-input kuro-input-sm" aria-label={`${ariaPrefix} 4-star copies`} />
      </div>
    </div>
  </div>
));
PityCounterInput.displayName = 'PityCounterInput';

export { PityCounterInput };
