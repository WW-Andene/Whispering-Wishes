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

### Rounding priority (tie-breaking)

When an off-suite value must be corrected, round to the mathematically nearest PerfectSuite value. When two candidates are **equidistant**, break the tie using this priority order — primary beats secondary beats tertiary:

- **Primary** (powers of 2): `1, 2, 4, 8, 16, 32, 64, 128, 256, 512, 1024`
- **Secondary** (3 × powers of 2): `3, 6, 12, 24, 48, 96, 192, 384, 768`
- **Tertiary**: every other PerfectSuite value not listed above (`14, 28, 30, 56, 60, 62, 120, 124, 126, 224, 240, 248, 252, 254, 448, 480, 496, 504, 508, 510, 896, 960, 992, 1008, 1016, 1020, 1022`)

`1` and `3` are valid PerfectSuite values (primary/secondary respectively) even though they weren't in the original list above — the full valid set is the union of all three tiers.

Worked examples:
- `10` → tie between `8` (primary) and `12` (secondary), both distance 2 → primary wins → **8**
- `13` → tie between `12` (secondary) and `14` (tertiary), both distance 1 → secondary wins → **12**
- `15` → tie between `14` (tertiary) and `16` (primary), both distance 1 → primary wins → **16**
- `11` → `12` is distance 1, `8` is distance 3 → not a tie, nearest wins → **12**
- `17` → `16` is distance 1, `24` is distance 7 → not a tie, nearest wins → **16**

This can and will collapse previously-distinct values onto the same PerfectSuite number (e.g. two font sizes both rounding to `12`) — that's an accepted outcome of strict suite compliance, not a bug to work around by picking a different rounding.

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
- `--size-icon-btn: 28px` (kuro.css) — compliant (28 is in the suite).
