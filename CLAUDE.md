# Whispering Wishes — Project Rules

Read this before making any UI/styling change. These are hard rules, not suggestions — do not bypass them by reaching for a default Tailwind class, an arbitrary one-off pixel value, or a "close enough" number.

## PerfectSuite — the only valid numeric scale

Every numeric dimension in the app — font-size, width, height, padding, margin, gap, icon size, border-radius input, anything measured in px — **must** be one of these values:

```
2, 4, 6, 8, 12, 14, 16, 24, 28, 30, 32, 48, 56, 60, 62, 64,
96, 112, 120, 124, 126, 128, 192, 224, 240, 248, 252, 254, 256,
384, 448, 480, 496, 504, 508, 510, 512, 768, 896, 960, 992,
1008, 1016, 1020, 1022, 1024
```

No other number is permitted. This applies everywhere, not just to new code — when you touch an existing value that isn't in this list, fix it to the nearest PerfectSuite value as part of that change instead of leaving it.

**Before setting any dimension:**
- Tailwind's default scale does NOT reliably map to PerfectSuite (e.g. `text-sm` even after this project's `kuro.css` override is 11px, and `--font-sm` in `index.css` is 10px — neither is in the suite). Never assume a default utility class is compliant; check the computed px value against the list above.
- If a token (`--font-*`, `--size-*`, `--space-*`, etc.) already resolves to a PerfectSuite value, use it.
- If the nearest existing token is off-suite, either fix the token (if the change is meant to apply everywhere that token is used) or use an explicit arbitrary-value override like `text-[12px]` / `w-[48px]` scoped to just that element (if the change is local-only) — same pattern already used for the header nav's `w-[48px] h-[48px]` profile button.
- When rounding to the nearest valid value, prefer the direction that matches surrounding elements already on the grid (see the Header/Navbar precedent below) over always rounding up or down mechanically.

## Corner radius

`radius = 0.24 × the element's height`, then rounded down to the nearest PerfectSuite value.

## Card aspect ratios

Only these ratios are valid for card-shaped elements: `1:1`, `2:3`, `3:4`, `3:5`.

## Header / Navbar

Visually 192px wide × 64px tall (both PerfectSuite values), even though the actual implementation is responsive/fluid rather than hard-coded — treat 192×64 as the reference proportions when sizing anything meant to align with the header/nav.

## Precedent already in the codebase

Confirms this scale predates being written down here — match it, don't reinvent it:
- Nav icons: `w-4 h-4` (16px), `w-6 h-6` (24px)
- Nav profile button: `w-[48px] h-[48px]`
- `--size-icon-btn: 28px` (kuro.css) — ⚠ 28 is NOT in PerfectSuite; treat as a known pre-existing violation to fix opportunistically, not a precedent to copy.
