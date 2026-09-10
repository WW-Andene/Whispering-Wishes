// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — shared/components/TargetInput.jsx
// A clamped numeric text input that clears itself on focus instead of relying
// on the browser's select-to-replace behavior.
// ═══════════════════════════════════════════════════════════════════════════════
//
// Extracted out of features/calculator/PityCounterInput.jsx (where it was
// originally built for the copies-target field) so any other numeric input in
// the app can reuse the same fix — direct user request 2026-09-10 to apply
// this same "free text" behavior to plain <input type="number"> fields
// elsewhere (starting with Plan tab's Daily Astrite field), which don't get
// it just by existing in the same app.

import React, { useState } from 'react';

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
// onClamp (optional): called with the input element when a typed value actually exceeded
// max/min and got clamped — lets a caller add its own one-shot visual feedback (e.g. the
// Calculator tab's astrite/lunite fields briefly flashing an error border) without this
// component needing to know anything about that effect itself.
function TargetInput({ value, min, max, onChange, onClamp, ariaLabel, className, placeholder }) {
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
        if (Number.isFinite(v)) {
          const clamped = Math.max(min, Math.min(max, v));
          if (clamped !== v) onClamp?.(e.target);
          onChange(clamped);
        }
      }}
      className={className}
      aria-label={ariaLabel}
      placeholder={placeholder}
    />
  );
}

export { TargetInput };
