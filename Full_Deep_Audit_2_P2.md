# Full Deep Audit 2 — Part 2
## Whispering Wishes v3.2.3 — Visual Design Audit (Continued)

> **Continuation of**: `Full_Deep_Audit_2_P1.md` (Steps 1–10, §0 through §E3)
> **This file begins at**: Step 11

---

# ═══════════════════════════════════════════════════════════════
# STEP 11 — §E4: TYPOGRAPHY CRAFT
# ═══════════════════════════════════════════════════════════════

> **Skill reference**: app-audit §E4 + design-aesthetic-audit §DT1–§DT4
> **Scope**: All 8 tabs — TRACKER, EVENTS, CALC, PLANNER, STATS, COLLECT, TEAMS, PROFILE
> **Axis context**: A1 NON-REVENUE · A2 FOCUS-TOOL + EMOTIONAL-SECONDARY · A3 ENTHUSIAST/EXPERT · A4 NAMED-SOURCE Wuthering Waves L3 · A5 FUNCTIONAL-PRIMARY + ATMOSPHERIC-SECONDARY

---

## §E4.1 — Heading Hierarchy Clarity

### Evidence Collection

**Semantic heading tags used across entire app:**

| Tag | Location | Content | Styling |
|-----|----------|---------|---------|
| `<h1>` | App.jsx:3177 | "Whispering Wishes" | App title in header — single instance |
| `<h2>` | App.jsx:3380 | "Time-Gated Content" | EVENTS tab — `text-white font-bold text-sm` |
| `<h3>` | App.jsx:4041 | "Leaderboard — Data Sharing Notice" | STATS tab — `text-white font-bold text-sm` |
| `<h3>` | App.jsx:4066 | "Community" | STATS tab — `text-white font-bold text-sm` |
| `<h3>` | App.jsx:7042 | Profile username | PROFILE tab — `text-white font-bold text-lg leading-tight` |

**Observation**: Only 5 semantic heading tags in ~8000 lines of JSX. The app relies almost entirely on CSS classes for visual hierarchy rather than HTML semantics.

---

**Visual hierarchy levels (actual rendering, largest → smallest):**

| Level | Size | Weight | Usage | Count |
|-------|------|--------|-------|-------|
| Display | 30px (`text-3xl`) | bold | Decorative / rare | 1 |
| H1-equivalent | 24px (`text-2xl`) | bold | Large projection numbers (PLANNER) | 5 |
| H2-equivalent | 20px (`text-xl`) | bold | Stat numbers (CALC, PLANNER, STATS, TEAMS) | 16 |
| H3-equivalent | 18px (`text-lg` / CSS) | bold | Profile username, scoreboard timer | 5 |
| Section header | 14px (CardHeader CSS) | semibold 600 | Universal card section titles | ~40+ |
| Body / labels | 14px (`text-sm`) | medium/bold | Primary UI text, inline labels | 74 |
| Form labels | 11px (kuro-label CSS) | semibold 600 + uppercase | Form group headers | ~25 |
| Secondary | 12px (`text-xs`) | medium | Input labels, counts, secondary info | 108 |
| Tertiary | 10px (`text-[10px]`) | medium/normal | Helper text, version info | 193 |
| Quaternary | 9px (`text-[9px]`) | normal/medium | Minimal labels, descriptions | 213 |
| Micro | 8px (`text-[8px]`) | medium | Smallest labels (weapon names) | 30 |

**Total unique font sizes: 12** — 8px, 9px, 10px, 11px, 12px, 13px, 14px, 16px, 18px, 20px, 24px, 30px

---

**Per-tab heading structure:**

| Tab | Effective H1 | Effective H2 | Effective H3 | Clear Scannable? |
|-----|-------------|-------------|-------------|-----------------|
| TRACKER | CardHeader 14px/600 | text-[10px] font-medium | text-[9px] labels | ✅ Yes |
| EVENTS | `<h2>` text-sm font-bold | text-xs font-medium | text-[10px] | ✅ Yes |
| CALC | CardHeader 14px/600 | kuro-label 11px uppercase | text-xs labels | ✅ Yes |
| PLANNER | CardHeader 14px/600 | kuro-label 11px uppercase | text-[10px] | ✅ Yes |
| STATS | CardHeader 14px/600 | `<h3>` text-sm font-bold | text-[10px] | ✅ Yes |
| COLLECT | CardHeader 14px/600 | text-xs font-medium | text-[9px] | ✅ Yes |
| TEAMS | CardHeader 14px/600 | kuro-label 11px uppercase | text-[10px] | ✅ Yes |
| PROFILE | CardHeader 14px/600 | `<h3>` text-lg font-bold | text-sm font-medium | ✅ Yes |

**Hierarchy assessment**: Every tab uses CardHeader (14px/600) as its primary section delimiter, creating a **consistent scanning rhythm across the entire app**. Sub-levels vary by tab content needs but maintain a clear size-weight progression.

---

### Findings

#### Finding E4-HH1: Semantic Heading Tags Minimal — LOW

**Issue**: Only 5 semantic heading tags (`<h1>`, `<h2>`, `<h3>`) in ~8000 lines of JSX. Visual hierarchy is communicated entirely through CSS classes and the CardHeader component, not HTML semantics. Screen readers and SEO tools cannot parse the document structure.

**Evidence**:
- 1× `<h1>` (app title only)
- 1× `<h2>` (EVENTS tab only)
- 3× `<h3>` (STATS and PROFILE tabs only)
- 0× `<h4>`, `<h5>`, `<h6>` anywhere
- CardHeader renders `<h3>` internally (~40+ instances) but these are all at the same level

**Impact**: LOW — This is a SPA with tab-based navigation, not a document. The visual hierarchy is clear and consistent. However, accessibility screen readers benefit from proper heading nesting.

**Solution**: Introduce a heading level prop to CardHeader that renders the appropriate semantic tag:
```jsx
// In CardHeader component:
const HeadingTag = `h${level || 3}`;
// Render: <HeadingTag className="...">
```
Assign `h2` to primary tab-level sections and `h3` to sub-sections within cards. This preserves visual appearance while improving accessibility tree structure. Low effort, no visual change.

---

#### Finding E4-HH2: Font Size Scale Not Ratio-Based — LOW

**Issue**: The 12 unique font sizes (8, 9, 10, 11, 12, 13, 14, 16, 18, 20, 24, 30) do not follow a standard typographic ratio (Major Third 1.25× or Perfect Fourth 1.333×).

**Evidence — scale analysis:**
```
Actual scale:    8  →  9  → 10 → 11 → 12 → 13 → 14 → 16 → 18 → 20 → 24 → 30
Step ratio:      — 1.13  1.11 1.10 1.09 1.08 1.08 1.14 1.13 1.11 1.20 1.25
Major Third:     8  → 10 → 12.5→15.6→19.5→ 24.4→ 30.5
Perfect Fourth:  8  → 10.7→14.2→18.9→ 25.2
```

The bottom of the scale (8–14px) is essentially a **linear 1px progression** rather than a geometric ratio. Above 14px, the jumps become larger (2px each) before reaching near–Major Third ratios at the top.

**Impact**: LOW — The dense 1px increments at small sizes are intentional for a data-dense mobile app where 9px vs 10px vs 11px create meaningful hierarchy distinctions. This is a pragmatic data-density choice, not a craft gap. The scale works visually even though it's non-standard.

**Solution**: No immediate change needed. If ever formalizing into design tokens, define named semantic roles rather than trying to force a mathematical ratio:
```css
--type-micro: 8px;    /* weapon names, badges */
--type-label: 9px;    /* minimal descriptions */
--type-helper: 10px;  /* secondary info */
--type-caption: 11px; /* tab buttons, kuro-label */
--type-small: 12px;   /* input labels, xs text */
--type-body: 14px;    /* card headers, inputs, body */
--type-title: 18px;   /* scoreboard, section emphasis */
--type-display: 20px; /* stat numbers */
--type-hero: 24px;    /* projection numbers */
```
This would reduce 12 raw sizes to 9 named tokens while preserving the existing visual hierarchy. The 13px and 16px sizes (2 and 2 uses respectively) could be absorbed into adjacent tokens.

---

#### Finding E4-HH3: Weight Hierarchy Narrow — LOW

**Issue**: Only 3 font-weight values used across the entire app (500, 600, 700), creating a narrow weight contrast range.

**Evidence:**
| Weight | Name | CSS-in-JS Uses | Tailwind Uses | Total |
|--------|------|---------------|---------------|-------|
| 700 | `font-bold` | 2 (pity ring, scoreboard) | 105 | ~107 |
| 600 | `font-semibold` | 3 (header, label, label) | 14 | ~17 |
| 500 | `font-medium` | 1 (button) | 99 | ~100 |
| 400 | `font-normal` | 0 | implicit default | — |

**Weight contrast analysis:**
- Bold (700) → Semibold (600): **1 step** — barely perceptible difference
- Semibold (600) → Medium (500): **1 step** — barely perceptible difference
- Bold (700) → Medium (500): **2 steps** — visible but modest contrast
- No use of 300 (light) or 800/900 (heavy) anywhere

**Impact**: LOW — The app compensates for narrow weight contrast through other hierarchy signals: size changes, color differentiation (gold vs gray vs white), uppercase transforms, and letter-spacing variations. The hierarchy reads clearly despite limited weight range.

**Solution**: Consider introducing `font-normal` (400) explicitly for body text descriptions to widen the perceived contrast range from 500–700 to 400–700. For display moments (large stat numbers at 20-24px), `font-extrabold` (800) would add dramatic weight contrast without affecting readability:
```
Proposed hierarchy:
400 — body descriptions, passive text
500 — interactive labels, secondary emphasis
600 — section headers (CardHeader, kuro-label)
700 — primary headings, highlighted stat values
800 — hero display numbers (24px+ only)
```

---

#### Finding E4-HH4: CardHeader Provides Excellent Consistency — PASS

**Evidence**: The CardHeader component (14px, weight 600, letter-spacing 0.03em, gradient background, ::before accent bar) is used as the primary section delimiter across **all 8 tabs** without exception. Every tab opens with CardHeader sections, creating a perfectly uniform scanning experience. Users learn the "card = section" pattern once and it holds everywhere.

**Solution**: Already excellent. CardHeader is the strongest typographic consistency signal in the entire app. Maintain as-is.

---

## §E4.2 — Line Length (Measure)

### Evidence Collection

**Layout width constraints (content containers):**

| Constraint | Pixel Value | Responsive Context | Usage |
|-----------|-------------|-------------------|-------|
| `px-3` (0.75rem each side) | 24px total padding | All viewports | Main content wrapper |
| `max-w-lg` | 512px | Default mobile/tablet | Primary content column |
| `md:max-w-2xl` | 672px | ≥768px tablet | Wider tablet layout |
| `lg:max-w-none` | No limit | ≥1024px desktop | Desktop full-width |
| `max-w-md` | 448px | Modals | Character/weapon detail panels |
| `max-w-sm` | 384px | Constrained cards | 4 occurrences in App.jsx |
| `max-w-xs` | 320px | Narrow elements | 1 occurrence |

**Effective content widths by viewport:**

| Viewport | Container | Padding | Effective Width |
|----------|-----------|---------|----------------|
| 360px (phone) | 360px (viewport-limited) | 24px | **336px** |
| 768px (tablet) | 672px (max-w-2xl) | 24px | **648px** |
| 1024px+ (desktop) | Fluid (max-w-none) | 24px + sidebar 72px | **~730-900px** |

---

**Character count estimates by font size and viewport:**

Using Rajdhani's average character width (~0.48em for proportional sans):

| Font Size | Mobile (336px) | Tablet (648px) | Desktop (~800px) | Optimal? |
|-----------|---------------|----------------|-------------------|----------|
| 9px (text-[9px]) | ~78 chars | ~150 chars | ~185 chars | ⚠️ Mobile borderline, tablet/desktop excessive |
| 10px (text-[10px]) | ~70 chars | ~135 chars | ~167 chars | ⚠️ Mobile OK, tablet/desktop excessive |
| 12px (text-xs) | ~58 chars | ~113 chars | ~139 chars | ✅ Mobile good, tablet/desktop high |
| 14px (text-sm) | ~50 chars | ~96 chars | ~119 chars | ✅ Mobile ideal, tablet over |
| 18px (text-lg) | ~39 chars | ~75 chars | ~93 chars | ✅ Mobile slightly narrow, tablet ideal |

**Key insight**: On mobile (336px), most text sizes produce line lengths within or near the 45–75 character optimal range. On tablet and desktop, smaller text sizes (9-10px) produce excessively long lines (>100 chars). However, the app's content is predominantly **short data labels, numbers, and values** — not prose paragraphs. True multi-line reading blocks are rare.

---

**Long-form text blocks identified (where measure matters most):**

| Location | Content Type | Font Size | Width Constraint | Estimated Chars | Has `leading-relaxed`? |
|----------|-------------|-----------|-----------------|-----------------|----------------------|
| appcore-components.jsx:230 | Character/weapon descriptions | text-sm (14px) | max-w-md (448px) | ~67 chars | ✅ Yes |
| App.jsx:4355 | Onboarding step descriptions | text-xs (12px) | 336px mobile | ~58 chars | ✅ Yes |
| App.jsx:5699 | Modal descriptions | text-[10px] | Modal width | ~55 chars | ✅ Yes |
| appcore-components.jsx:318 | Buff table notes | text-[10px] | Card width | ~50 chars | ✅ Yes |
| appcore-components.jsx:342 | Weapon passive effects | text-[9px] | Card width | ~55 chars | ✅ Yes |
| App.jsx:7502 | Metadata descriptions | text-[9px] | Card width | ~55 chars | ✅ Yes |
| App.jsx:8204 | Footer text | text-[8px] | Full width | ~70 chars | ✅ Yes |

**All 7 long-form text blocks** use `leading-relaxed` and are contained within card widths that produce acceptable line lengths on mobile.

---

### Findings

#### Finding E4-LL1: Desktop Line Length Unconstrained for Small Text — LOW

**Issue**: On desktop (≥1024px), `lg:max-w-none` removes all width constraints from the primary content area. For 9-10px text in full-width containers, this could theoretically produce lines >150 characters — far above the 75-character optimal maximum.

**Evidence**:
- App.jsx main content: `className="max-w-lg md:max-w-2xl lg:max-w-none mx-auto px-3 ..."`
- At 1024px viewport with sidebar (72px): ~900px content area
- text-[9px] at 900px effective width: ~185 characters per line

**Mitigating factors**:
- The app renders content in **cards** (`kuro-card`) which provide internal padding and implicit width limits
- Desktop layout uses sidebar + ad margin, significantly reducing actual content width
- Most 9-10px text appears in **grid cells, flex items, or inline label+value pairs** — not full-width paragraphs
- No true prose paragraphs exist at these small sizes

**Impact**: LOW — The theoretical line length exceeds standards, but practical content patterns (cards, grids, label+value pairs) prevent actual long-line reading. The concern is architectural, not experiential.

**Solution**: Add a `max-w-3xl` (768px) constraint to the desktop content area as a safety net:
```jsx
className="max-w-lg md:max-w-2xl lg:max-w-3xl xl:max-w-none mx-auto px-3 ..."
```
This maintains fluid width on ultra-wide screens while capping content width at a reasonable 768px on standard desktops. Alternatively, no change needed if the card-based layout continues to constrain actual text blocks.

---

#### Finding E4-LL2: Mobile Line Length Well-Controlled — PASS

**Evidence**: At 336px effective width:
- 14px body text: ~50 chars (within 45–75 optimal)
- 12px secondary: ~58 chars (within optimal)
- 10px tertiary: ~70 chars (within optimal)
- 9px quaternary: ~78 chars (slightly above, but these are labels not prose)

The `px-3` (12px) side padding provides consistent breathing room. All card content is further inset by card body padding (14px from CSS-in-JS), reducing effective text width to ~308px — even better measure control.

**Solution**: Already well-handled. Mobile typography measure is a strength of the current design.

---

#### Finding E4-LL3: Long-Form Text Blocks Properly Constrained — PASS

**Evidence**: All 7 identified multi-line text blocks:
1. Use `leading-relaxed` (1.625) for readable line-height ✅
2. Are contained within cards or modals with implicit width limits ✅
3. Produce estimated line lengths of 50–67 characters ✅
4. The primary long-text context (character descriptions at 14px within max-w-md modal) produces ~67 chars — near-ideal for sustained reading

**Solution**: Excellent craft. Long-form text receives both proper measure control and appropriate line-height. Maintain as-is.

---

#### Finding E4-LL4: No Orphan/Widow Control — PASS (Acceptable)

**Evidence**: No `text-wrap: balance`, `orphans`, `widows`, or manual `<br>` breakpoints found anywhere in the codebase.

**Assessment**: For a data-focused mobile app with predominantly short text elements (labels, values, section titles), orphan/widow control is a refinement that applies mainly to editorial or marketing contexts. The app's text blocks are short enough that orphans rarely occur, and when they do, the impact is minimal.

**Solution**: No action needed for current content. If the app ever adds an onboarding flow, changelog, or help section with longer paragraphs, apply `text-wrap: balance` to display-level headings:
```css
.kuro-header h3 { text-wrap: balance; }
```

---

## §E4.3 — Line Height

### Evidence Collection

**CSS-in-JS line-height declarations (appcore-providers.jsx):**

| Line | Selector | Value | Font Size | Purpose |
|------|----------|-------|-----------|---------|
| 831 | `.kuro-header h3` | 1.25 | 14px | Card section headers |
| 1044 | `.kuro-stat` | 1.3 | inherited | Stat box content |
| 1163 | `.kuro-label` | 1.3 | 11px | Uppercase form labels |
| 1287 | `.kuro-number` | 1.2 | inherited | Data display numbers |
| 1297 | `.kuro-scoreboard` | 1.0 | 18px | Countdown timer numerals |

**Tailwind leading-* classes used:**

| Class | Value | Occurrences | Primary Usage |
|-------|-------|-------------|---------------|
| `leading-tight` | 1.25 | 8 | Truncated names, small labels, headers |
| `leading-relaxed` | 1.625 | 7 | Descriptions, notes, weapon passives |
| `leading-normal` | 1.5 | 0 (implicit default) | Body text (Tailwind base) |
| `leading-snug` | 1.375 | 0 | Not used |
| `leading-loose` | 2.0 | 0 | Not used |

**Line-height inventory by typographic role:**

| Role | Line-Height | Source | Assessment |
|------|------------|--------|------------|
| Scoreboard numbers (18px) | 1.0 | CSS-in-JS | ✅ Appropriate — single-line display numerals |
| Data numbers | 1.2 | CSS-in-JS | ✅ Appropriate — compact numeric displays |
| Card headers (14px) | 1.25 | CSS-in-JS | ✅ Appropriate — short single-line titles |
| Stat boxes | 1.3 | CSS-in-JS | ✅ Appropriate — mixed content blocks |
| Form labels (11px uppercase) | 1.3 | CSS-in-JS | ✅ Appropriate — uppercase labels with letter-spacing |
| Body text (default) | 1.5 | Tailwind implicit | ✅ Within 1.4–1.6 optimal range |
| Truncated names (9-10px) | 1.25 | Tailwind `leading-tight` | ✅ Appropriate — single-line truncated |
| Long-form descriptions | 1.625 | Tailwind `leading-relaxed` | ✅ Slightly generous but appropriate for small sizes |

**Total explicit line-height declarations**: 5 CSS-in-JS + 15 Tailwind classes = 20 explicit instances
**Implicit (Tailwind default 1.5)**: Everything else (~600+ text elements)

---

### Findings

#### Finding E4-LH1: Line Height System Well-Calibrated — PASS

**Evidence**: The app uses a **4-tier line-height system** that maps cleanly to content type:

```
Tier 1 — Display numerals:  1.0–1.2  (numbers, timers, stats)
Tier 2 — Headings/labels:   1.25–1.3 (headers, uppercase labels, truncated text)
Tier 3 — Body text:         1.5      (implicit Tailwind default — all unlabeled text)
Tier 4 — Reading text:      1.625    (descriptions, notes, passives)
```

This progression follows best practice:
- Dense data (numbers) get tight line-height ✅
- Headings get slightly more air than data but less than body ✅
- Body text at 1.5 is squarely within the 1.4–1.6 optimal range ✅
- Long-form reading text gets the most generous line-height ✅

**Solution**: Already well-crafted. The 4-tier system is intentional and appropriate for each content type. Maintain as-is.

---

#### Finding E4-LH2: Small Text (8-9px) Relies on Default Line-Height — LOW

**Issue**: The 243 instances of 8-9px text (text-[8px] + text-[9px]) mostly rely on Tailwind's implicit line-height rather than an explicit `leading-*` class. At these very small sizes, the default 1.5 line-height produces only 12-13.5px of line spacing, which is technically correct but can feel cramped when text wraps to multiple lines.

**Evidence**:
- text-[8px]: 30 uses — 0 with explicit leading class
- text-[9px]: 213 uses — only ~8 with explicit `leading-tight` (for truncated single-line text)
- Most 8-9px text is single-line (labels, values) so line-height is irrelevant
- The few multi-line instances (weapon passives, descriptions) DO use `leading-relaxed` ✅

**Impact**: LOW — The vast majority of 8-9px text is single-line labels where line-height has no visual effect. The few multi-line cases are properly handled with `leading-relaxed`.

**Solution**: No change needed for current content. If new multi-line content at 8-9px is added, ensure it receives `leading-relaxed`:
```jsx
// Pattern for small multi-line text:
<p className="text-[9px] text-gray-400 leading-relaxed">{description}</p>
```

---

## §E4.4 — Font Pairing

### Evidence Collection

**Fonts declared:**

| Token | Font | Fallback Stack | Role |
|-------|------|---------------|------|
| `--font-display` | Rajdhani | ui-sans-serif, system-ui, sans-serif | Display, headings, UI text |
| `--font-data` | JetBrains Mono | ui-monospace, SFMono-Regular, Menlo, Consolas, monospace | Data, numbers, statistics |

**Font loading** (index.html — not in src, loaded externally via Google Fonts or bundled):
- Rajdhani: Geometric sans-serif with Indian Devanagari roots, high x-height, sharp terminals
- JetBrains Mono: Monospaced programming font with increased letter-height and distinctive character forms

**Usage distribution:**

| Font | Application Method | Usage Context | Approximate Scope |
|------|-------------------|---------------|-------------------|
| Rajdhani (--font-display) | `font-family: var(--font-display)` × 11 in CSS-in-JS | Headers, labels, buttons, inputs, general UI | ~90% of all text |
| JetBrains Mono (--font-data) | `font-family: var(--font-data)` × 5 in CSS-in-JS | Stat numbers, data values, scoreboard, pity counters | ~10% of all text |
| System sans-serif | Fallback in body selector (line 532) | Base fallback only | 0% (overridden) |

**Where each font appears:**

Rajdhani (via `var(--font-display)`):
- `.kuro-header h3` (line 833) — Card section titles
- `.kuro-tab` (line 867) — Tab navigation buttons
- `.kuro-input` (line 997) — Form inputs
- `.kuro-input-sm` (line 1031) — Small inputs
- `.kuro-label` (line 1167) — Form labels
- `.kuro-empty-state` (line 1344) — Empty state messages
- Plus body-level declaration making it the global default

JetBrains Mono (via `var(--font-data)`):
- `.kuro-stat` (line 1048) — Stat box numbers
- `.kuro-number` (line 1289) — Inline data numbers
- `.kuro-scoreboard` (line 1299) — Countdown timer
- Plus direct `style={{ fontFamily: 'var(--font-data)' }}` in JSX for inline data displays

---

### Findings

#### Finding E4-FP1: Rajdhani + JetBrains Mono — Excellent Pairing — PASS

**Evidence**: This pairing works on multiple levels:

1. **Contrast principle**: Geometric sans (Rajdhani) + monospace (JetBrains Mono) = high contrast in letterform structure while sharing similar x-heights and geometric DNA. They are clearly different fonts serving clearly different roles.

2. **Role clarity**: The division is absolute — Rajdhani for all human-readable UI text, JetBrains Mono for all machine-like data displays. No ambiguity about which font serves which purpose.

3. **Tonal coherence**: Both fonts share a technical, modern sensibility:
   - Rajdhani: sharp terminals, geometric construction → feels precise, futuristic, technical
   - JetBrains Mono: designed for code readability → feels data-focused, analytical, precise
   - Together: they create a **unified "mission control" aesthetic** that reinforces the cyberpunk/terminal classification

4. **Subject alignment (A4 — Wuthering Waves)**: The pairing evokes sci-fi/tech interfaces consistent with Wuthering Waves' post-apocalyptic sci-fi setting.

5. **Audience alignment (A3 — Enthusiast/Expert)**: Both fonts communicate technical competence. Experts expect data-dense interfaces with clear typography — this pairing delivers that without being cold or sterile (Rajdhani's slight warmth from its Devanagari heritage prevents that).

**Solution**: Outstanding font pairing. This is one of the app's strongest design decisions. Maintain as-is.

---

#### Finding E4-FP2: Font Role Boundaries Clean — PASS

**Evidence**: The `--font-display` / `--font-data` token system creates a strict boundary:
- 11 CSS-in-JS rules use `var(--font-display)` — all for UI/heading contexts ✅
- 5 CSS-in-JS rules use `var(--font-data)` — all for numeric/data contexts ✅
- No instances where data font is used for UI text or vice versa
- The tokens are defined in `:root` (lines 451-452), making the pairing centrally managed

**Solution**: Already excellent. The token-based font assignment ensures global consistency and makes the pairing trivially changeable if needed.

---

## §E4.5 — Letter Spacing

### Evidence Collection

**CSS-in-JS letter-spacing declarations (appcore-providers.jsx):**

| Line | Selector | Value | Font Size | Text Transform | Assessment |
|------|----------|-------|-----------|---------------|------------|
| 647 | `.pity-ring text` | -0.02em | ~14px | normal | ✅ Display tightening at 14px |
| 832 | `.kuro-header h3` | 0.03em | 14px | normal | ⚠️ Positive tracking on heading — unconventional |
| 865 | `.kuro-tab` | 0.02em | 11px | normal | ✅ Slight opening for small UI text |
| 1165 | `.kuro-label` | 0.08em | 11px | uppercase | ✅ Good — within 0.06–0.12em range for caps |
| 1296 | `.kuro-scoreboard` | -0.02em | 18px | normal | ✅ Display tightening at large size |
| 1342 | `.kuro-empty-state` | 0.01em | 13px | normal | ✅ Neutral, barely perceptible |
| 1595 | `.desktop-ad-margin .ad-slot` | 0.1em | 8px | uppercase | ✅ Wide tracking for tiny caps |
| 1679 | `.desktop-layout > header::after` | 0.2em | 8px | implied decorative | ⚠️ Extreme — decorative intent |

**Tailwind tracking-* classes:**

| Class | Value | Occurrences | Context |
|-------|-------|-------------|---------|
| `tracking-wider` | 0.05em | 25 | Various uppercase labels |
| `tracking-wide` | 0.025em | 4 | Secondary labels |
| `tracking-widest` | 0.1em | 2 | Emphatic caps (luck tier display) |

**Total: 31 Tailwind tracking instances + 8 CSS-in-JS letter-spacing declarations = 39 explicit tracking decisions**

---

**Assessment against typographic norms:**

| Size Category | Norm | Actual | Match? |
|---------------|------|--------|--------|
| Display (18px+) | -0.01em to -0.03em (tighten) | -0.02em (scoreboard) | ✅ Perfect |
| Headings (14px) | -0.01em to -0.03em (tighten) | +0.03em (kuro-header) | ⚠️ Opposite direction |
| Body (12-14px) | 0 to +0.01em (default) | 0.01em (empty-state), 0.02em (tab) | ✅ Close to norm |
| Small UI (10-11px) | +0.03em to +0.06em (open) | 0.02em (tab), 0.08em (label) | ✅ Bracket the norm |
| All-caps (any size) | +0.06em to +0.12em (mandatory) | 0.08em (kuro-label), 0.1em (ad-slot) | ✅ Within range |

---

### Findings

#### Finding E4-LS1: CardHeader Positive Tracking Unconventional — LOW

**Issue**: `.kuro-header h3` uses `letter-spacing: 0.03em` (positive/widening) at 14px. Typographic convention recommends **negative** tracking (-0.01em to -0.03em) for heading text, as larger text optically appears more spaced-out than body text.

**Evidence**:
- appcore-providers.jsx:832: `letter-spacing: 0.03em;`
- The CardHeader is the most-repeated heading in the app (~40+ instances)
- At 14px, this produces a slightly airy, "tracked-out" appearance
- Combined with semibold 600 weight, it creates a refined, technical feel

**Assessment**: This is likely **intentional as a design choice** — the positive tracking gives CardHeader an air of technical precision that aligns with the cyberpunk/terminal aesthetic. It reads as a "UI system label" rather than a "document heading." However, it contradicts the optical norm.

**Impact**: LOW — The positive tracking is internally consistent (every CardHeader uses it) and contributes to the app's distinctive voice. It's an unconventional choice, not a mistake.

**Solution**: If the intent is confirmed as deliberate (cyberpunk terminal aesthetic = spaced-out headings), document it in a comment:
```css
.kuro-header h3 {
  letter-spacing: 0.03em; /* intentional: terminal-style tracked headings */
}
```
If unintentional, tighten to -0.01em for a more conventional heading treatment. Either way, the current value works within the app's established visual language.

---

#### Finding E4-LS2: All-Caps Tracking Properly Applied — PASS

**Evidence**: Every uppercase text instance has appropriate positive tracking:
- `kuro-label` (11px uppercase): 0.08em ✅ — within 0.06–0.12em range
- `.desktop-ad-margin .ad-slot` (8px uppercase): 0.1em ✅
- Tailwind `tracking-wider` (0.05em) on various uppercase labels ✅
- `tracking-widest` (0.1em) on emphatic uppercase displays ✅

No instances of `text-transform: uppercase` without accompanying letter-spacing were found in CSS-in-JS. In Tailwind, the `uppercase` class co-occurs with `tracking-wider` or similar in all observed patterns.

**Solution**: Already well-crafted. All-caps text consistently receives appropriate tracking. Maintain as-is.

---

#### Finding E4-LS3: Display Text Tightening Correct — PASS

**Evidence**: The two largest display contexts both use proper negative tracking:
- `.pity-ring text` at ~14px: -0.02em ✅
- `.kuro-scoreboard` at 18px: -0.02em ✅

Both values fall within the -0.01em to -0.03em recommended range for display text. The scoreboard (the largest text element rendered by CSS-in-JS at 18px) receives optical tightening that makes it feel crafted rather than default.

**Solution**: Excellent attention to typographic detail. Maintain as-is.

---

## §E4.6 — Text Rendering

### Evidence Collection

**Font smoothing declarations:**

| File | Line | Property | Value |
|------|------|----------|-------|
| index.css | 22 | `-webkit-font-smoothing` | `antialiased` |
| index.css | 23 | `-moz-osx-font-smoothing` | `grayscale` |
| appcore-providers.jsx | 416 | `-webkit-font-smoothing` | `antialiased` |
| appcore-providers.jsx | 417 | `-moz-osx-font-smoothing` | `grayscale` |

**Applied at**: Both the CSS base (`body` in index.css) and the CSS-in-JS global (`*` selector in appcore-providers.jsx) — double-applied for absolute certainty.

**Text rendering declarations:**
- `text-rendering: optimizeLegibility` — **Not found** anywhere in codebase

**Other rendering properties:**
- No `font-variant-ligatures` declarations
- No `text-rendering` declarations
- No `font-kerning` declarations
- No `-webkit-text-stroke` or `paint-order` usage

---

### Findings

#### Finding E4-TR1: Font Smoothing Properly Applied — PASS

**Evidence**: `-webkit-font-smoothing: antialiased` and `-moz-osx-font-smoothing: grayscale` are applied at **two levels** — both the CSS body and the CSS-in-JS universal selector. This is the correct approach for a dark-mode-primary app:

- On dark backgrounds, subpixel antialiasing makes light text appear heavier/bolder than intended
- `antialiased` mode renders text with grayscale antialiasing, producing lighter, crisper letterforms
- The dual application (CSS + CSS-in-JS) ensures no element escapes the smoothing, regardless of rendering order

**Solution**: Correctly implemented. The dual-layer approach is belt-and-suspenders but harmless. Maintain as-is.

---

#### Finding E4-TR2: Missing `text-rendering: optimizeLegibility` — LOW

**Issue**: `text-rendering: optimizeLegibility` is not applied anywhere. This property enables kerning and ligatures for improved text quality, particularly at display sizes.

**Evidence**: No `text-rendering` property found in:
- index.css
- appcore-providers.jsx
- Any other source file

**Mitigating factors**:
- Modern browsers enable kerning by default for most fonts
- Rajdhani and JetBrains Mono both have good default kerning tables
- `optimizeLegibility` can cause performance issues on very long text blocks (not applicable here — no long prose)
- The visual impact on a data-dense mobile app is minimal

**Impact**: LOW — The absence is unlikely to produce visible quality differences given the app's short text elements and modern browser defaults.

**Solution**: Add to the global CSS-in-JS selector for marginal improvement:
```css
* {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility; /* enable kerning + ligatures */
}
```
This is a single-line addition with no downside for an app without long-form content.

---

## §E4.7 — Label Quality

### Evidence Collection

**Label inventory by type:**

| Label Type | Source | Count | Casing Pattern |
|-----------|--------|-------|---------------|
| kuro-label (form sections) | CSS-in-JS `text-transform: uppercase` | 16 unique | FORCED UPPERCASE |
| CardHeader (section titles) | Component | 28+ unique | Title Case |
| `<label>` tags | HTML | 6 unique | Title Case |
| Placeholders | `placeholder=""` | 17 unique | Sentence case |
| `aria-label` attributes | Accessibility | 84+ unique | Sentence case |
| Tooltips / `title` attributes | Hover text | 17 unique | Sentence case |

---

**kuro-label texts (rendered UPPERCASE via CSS):**

| Label Text (source case) | Rendered | Assessment |
|--------------------------|----------|------------|
| Astrite | ASTRITE | ✅ Clear, concise |
| Astrite Priority | ASTRITE PRIORITY | ✅ Clear |
| Astrite Priority (Standard) | ASTRITE PRIORITY (STANDARD) | ⚠️ Conditional suffix — contextual |
| Base Daily Astrite (Commissions, etc.) | BASE DAILY ASTRITE (COMMISSIONS, ETC.) | ⚠️ Long — 42 chars rendered uppercase |
| Base Convenes (per copy) | BASE CONVENES (PER COPY) | ✅ Descriptive |
| Multiplier | MULTIPLIER | ✅ Concise |
| Subscriptions | SUBSCRIPTIONS | ✅ Concise |
| Direct Top-Ups | DIRECT TOP-UPS | ✅ Clear |
| Featured Convene | FEATURED CONVENE | ✅ Domain-native term |
| Standard Convene | STANDARD CONVENE | ✅ Domain-native term |
| Damage Focus | DAMAGE FOCUS | ✅ Technical, clear |
| Buffs | BUFFS | ✅ Concise |
| Debuffs | DEBUFFS | ✅ Concise |
| Damage Stats (with team buffs) | DAMAGE STATS (WITH TEAM BUFFS) | ⚠️ Long parenthetical |
| Base Stats (Lv.90) | BASE STATS (LV.90) | ✅ Abbreviated, domain-native |
| Team Buffs | TEAM BUFFS | ✅ Clear |
| Enemy Debuffs | ENEMY DEBUFFS | ✅ Clear |

---

**CardHeader titles (28 unique):**

All CardHeaders use Title Case consistently: "Banner History", "Pity Counter", "Resources", "Combined Analysis", "Daily Income", "Add Purchases", "Income Projections", "Goal Progress", "Saved States", "Luck Rating", "Trophies", "5★ Pity Distribution", "Convene History", "Team Builder", "Team Overview", "DPS Comparison", "Team Suggestions", "Server Region", "Resonator Profile", "Display Settings", "Import Convene History", "Import Info", "About", "Save Current State", "Backup", "Admin Panel", and star-rated headers (★★★★★ Resonators, etc.)

**Casing: 100% Title Case** — perfectly consistent.

---

**Placeholder quality assessment:**

| Placeholder | Quality | Issue? |
|------------|---------|--------|
| "0" | ❌ Poor | Non-descriptive for Astrite input |
| "Phase" | ⚠️ Weak | Lacks context (what phase? range?) |
| "Enter your name..." | ✅ Good | Conversational, clear |
| "Search by name..." | ✅ Good | Action-oriented |
| "Search resonators..." | ✅ Good | Specific target |
| "Search weapons..." | ✅ Good | Specific target |
| "Paste your wuwatracker JSON here..." | ✅ Good | Includes format example |
| "Version (e.g., 3.1)" | ✅ Excellent | Shows expected format |
| "https://i.ibb.co/..." | ✅ Excellent | Shows URL pattern |
| "center 20%" | ✅ Good | CSS value hint |

---

**Accessibility label coverage:**
- 84+ unique `aria-label` attributes across the app
- Covers navigation, inputs, buttons, filters, and status elements
- All use sentence case consistently
- Comprehensive for a non-commercial SPA

---

### Findings

#### Finding E4-LQ1: Label Casing Consistent Within Each System — PASS

**Evidence**: The app uses a clear 3-tier casing system:
1. **UPPERCASE**: All kuro-label instances (forced via CSS `text-transform: uppercase`)
2. **Title Case**: All CardHeader titles (28+ consistent instances)
3. **Sentence case**: All placeholders, aria-labels, and tooltips

There is no mixing within tiers. Every kuro-label renders uppercase, every CardHeader is Title Case, every placeholder is sentence case. The boundaries are crisp.

**Solution**: Already well-organized. The 3-tier casing hierarchy reinforces the visual hierarchy: UPPERCASE for form group headers (small, emphatic), Title Case for section headers (medium, authoritative), sentence case for instructional text (conversational).

---

#### Finding E4-LQ2: Two Overly Long Uppercase Labels — LOW

**Issue**: Two kuro-label texts are 30+ characters, which when rendered in all-caps with 0.08em tracking becomes visually heavy and hard to scan:

1. "BASE DAILY ASTRITE (COMMISSIONS, ETC.)" — 42 chars uppercase
2. "DAMAGE STATS (WITH TEAM BUFFS)" — 30 chars uppercase

**Evidence**: kuro-label styling (appcore-providers.jsx:1162-1167):
```css
font-size: 11px;
text-transform: uppercase;
letter-spacing: 0.08em;
font-weight: 600;
```
At 11px with 0.08em tracking and all-caps, these long labels produce a dense uppercase wall that's harder to parse than shorter labels.

**Impact**: LOW — Only 2 of 17 labels are affected, and the parenthetical content provides genuinely useful context. The issue is aesthetic discomfort, not readability failure.

**Solution**: Shorten the primary label and move detail to a subtitle or tooltip:
```
Before: "BASE DAILY ASTRITE (COMMISSIONS, ETC.)"
After:  "DAILY ASTRITE" with tooltip "Commissions and other daily sources"

Before: "DAMAGE STATS (WITH TEAM BUFFS)"
After:  "DAMAGE STATS" with subtitle "incl. team buffs" in text-[9px] text-gray-400
```

---

#### Finding E4-LQ3: Two Weak Placeholders — LOW

**Issue**: Two placeholder texts fail to guide user input:

1. `placeholder="0"` — Astrite input: Tells the user nothing about what to enter. Is "0" the default? The minimum? Just a number format hint?
2. `placeholder="Phase"` — Admin panel: Ambiguous — phase of what? What values are valid?

**Evidence**: All other 15 placeholders are descriptive ("Enter your name...", "Search by name...", "Version (e.g., 3.1)"). These two are the clear outliers.

**Impact**: LOW — The Astrite input has a clear kuro-label above it ("ASTRITE") that provides context. The Phase input is admin-only. Neither causes real confusion.

**Solution**:
```
"0" → "e.g. 1600"  (shows realistic Astrite amount)
"Phase" → "e.g. 1"  (shows expected format, matching "Version (e.g., 3.1)" pattern)
```

---

#### Finding E4-LQ4: Comprehensive Aria-Labels — PASS

**Evidence**: 84+ unique aria-labels covering:
- All interactive controls (buttons, inputs, selects, toggles)
- All modal open/close actions
- All search/filter inputs
- All file upload and import areas
- Navigation elements

This is exceptionally thorough for a non-commercial SPA. The labels use clear, action-oriented language ("Clear all added purchases", "Search collection by name", "Toggle OLED mode").

**Solution**: Outstanding accessibility investment. Maintain as-is.

---

## §E4.8 — Typography as Character Signal

### Axis-Driven Assessment

The skill requires evaluating whether the typeface communicates the correct personality **before a single word is read**, using the Five-Axis Profile from §0.

---

**A1 — NON-REVENUE (Commercial Intent: None)**

> "Typeface credibility matters — a humanist sans signals approachability; a geometric sans signals precision."

**Assessment**: With zero commercial intent, Rajdhani doesn't need to signal trust, authority, or conversion-optimized readability. It is **free to be expressive**. The geometric, slightly angular character of Rajdhani is more distinctive than a "safe" choice like Inter or DM Sans would be. This is correct — a non-revenue app can afford typographic personality that a SaaS product cannot.

**Verdict**: ✅ APPROPRIATE — No trust constraint to violate.

---

**A2 — FOCUS-TOOL + EMOTIONAL-SECONDARY**

> "Typeface warmth, weight, and size directly affect emotional register."

**Assessment**: As a focus tool, the typeface must support **rapid scanning under concentration** — the user is checking pity counts, calculating resources, planning pulls. Rajdhani excels here:
- High x-height improves small-size legibility
- Geometric consistency reduces cognitive load during rapid scanning
- Sharp terminals create visual anchoring points at small sizes
- The emotional-secondary axis (gacha excitement/anxiety) is served by the font's slight tension — it's not warm/comforting, it's alert/precise, matching the emotional stakes of pity tracking

**Verdict**: ✅ STRONG MATCH — Rajdhani supports both focus-scanning and emotional alertness.

---

**A3 — ENTHUSIAST/EXPERT Audience**

> "Type density and precision are signals of domain competence. A clinical tool with oversized, rounded type feels like it's talking down to experts."

**Assessment**: This is where the typography choice **shines most strongly**:
- The dense type scale (8-10px labels, 11px caps, 14px body) signals "this interface respects your expertise"
- Rajdhani's geometric precision avoids the rounded, friendly softness of fonts like Plus Jakarta Sans or Nunito
- JetBrains Mono for data reinforces "this is a serious analytical tool"
- The uppercase tracking on kuro-labels reads as "system interface" rather than "consumer app"
- No text in the app is oversized or patronizing — even the largest text (24px) appears only for calculated results, not decoration

**Verdict**: ✅ EXCELLENT — The typography treats users as competent. The type density is a signal of respect for expert time.

---

**A4 — NAMED-SOURCE: Wuthering Waves L3**

> "Does the typeface feel tonally coherent with the subject?"

**Assessment**: Wuthering Waves is a post-apocalyptic sci-fi action RPG with a sleek, futuristic UI in-game. Rajdhani aligns on multiple levels:
- **Geometric sans-serif**: matches the game's own futuristic UI typography
- **Sharp terminals**: echo the game's angular, crystalline visual motifs
- **Devanagari heritage**: adds a subtle non-Western character that prevents generic tech feeling — tonally appropriate for a game set in a fictionalized world with diverse cultural influences
- **JetBrains Mono**: evokes the "data terminal" feel of sci-fi interfaces, consistent with the game's lore of Resonance technology and analytical systems

**Contrast test**: Would this font feel wrong on a different game's tracker?
- Genshin Impact (painterly, warm): Rajdhani would feel too cold ✅ (correct differentiation)
- Honkai Star Rail (retro-futuristic): Rajdhani would feel adjacent but not identical ✅
- Zenless Zone Zero (urban pop): Rajdhani would feel too serious ✅

**Verdict**: ✅ STRONG MATCH — Rajdhani is tonally coherent with Wuthering Waves' sci-fi aesthetic.

---

**A5 — FUNCTIONAL-PRIMARY + ATMOSPHERIC-SECONDARY**

> "If the typeface contradicts the intended personality, name a specific alternative."

**Assessment**: The typeface serves both functional clarity and atmospheric contribution:
- **Functional**: High legibility at small sizes, clean number rendering, strong label hierarchy
- **Atmospheric**: The geometric angularity creates a "luminous tactical interface" feeling that elevates the experience beyond purely utilitarian
- The atmospheric contribution is genuine but never interferes with function — text is always readable first, expressive second

**Verdict**: ✅ APPROPRIATE — Rajdhani serves function while contributing atmosphere. No alternative needed.

---

### Findings

#### Finding E4-CS1: Rajdhani Alignment with Character Profile — PASS

**Evidence**: Cross-referencing with the §DP2 Design Character Brief ("LUMINOUS TACTICAL COMPANION"):

| Character Trait | Typographic Signal | Match? |
|----------------|-------------------|--------|
| Tactical precision | Geometric construction, tight tracking at display sizes | ✅ |
| Luminous energy | Sharp terminals catch light metaphorically; gold color on Rajdhani headers | ✅ |
| Companion warmth | Subtle Devanagari heritage softness prevents clinical coldness | ✅ |
| Expert respect | Dense type scale, no oversized/patronizing text | ✅ |
| Cyberpunk/terminal | Uppercase labels + monospace data font | ✅ |
| Wuthering Waves sci-fi | Angular, futuristic feel matching game's own UI language | ✅ |

All 6 character traits map to concrete typographic evidence. The font choice is deeply aligned with the established character.

**Solution**: Rajdhani is one of the strongest identity-defining choices in the entire design system. It is not a default — it is a deliberate personality statement that succeeds across all 5 axes. Maintain as-is.

---

#### Finding E4-CS2: JetBrains Mono Reinforces Analytical Identity — PASS

**Evidence**: JetBrains Mono appears exclusively in data-presentation contexts:
- `.kuro-stat` — stat box numbers
- `.kuro-number` — inline data values
- `.kuro-scoreboard` — countdown timer

This creates a **"switching to analysis mode"** signal every time the user encounters monospaced text. The font acts as a semantic marker: "this is a calculated value, not a label." This reinforces the FOCUS-TOOL axis (A2) by creating a visual mode-shift between reading (Rajdhani) and analyzing (JetBrains Mono).

**Solution**: The dual-font semantic system is a genuine craft signal. Maintain strict font-role boundaries.

---

## §E4.9 — Type Craft Signals

### Evidence Collection

**Tabular numerals:**

| Selector | Has `tabular-nums`? | Line | Contains Numbers? |
|----------|-------------------|------|-------------------|
| `.kuro-stat` | ✅ Yes | 1047 | Stat box values — pity counts, percentages |
| `.kuro-number` | ✅ Yes | 1285 | Inline data numbers — projections, totals |
| `.kuro-scoreboard` | ✅ Yes | 1293 | Countdown timer — days/hours/minutes |
| Tailwind `tabular-nums` utility | ❌ Not used | — | Many number displays in JSX use text-xl/text-2xl without tabular-nums |

**Number displays WITHOUT tabular-nums:**

| Location | Content | Font | Size | Aligned in column? |
|----------|---------|------|------|-------------------|
| App.jsx: text-xl stat values | Pity counts, percentages | Rajdhani (default) | 20px | Yes — in stat grids |
| App.jsx: text-2xl projections | Resource projections | Rajdhani (default) | 24px | Yes — stacked |
| App.jsx: text-sm inline numbers | Pull counts, banner numbers | Rajdhani (default) | 14px | Some in lists |
| appcore-components.jsx: stat cards | Various numeric displays | Rajdhani (default) | Various | In grids |

**Key question**: Do these number displays use `kuro-number` or `kuro-stat` class (which provides tabular-nums)?

Checking: In App.jsx, number values displayed with `text-xl font-bold` often use `style={{ fontFamily: 'var(--font-data)' }}` inline — which triggers JetBrains Mono (a monospace font where tabular-nums is inherent). **Monospace fonts are always tabular by definition** — every character occupies the same width, including digits.

**Therefore**: All number displays using `var(--font-data)` (JetBrains Mono) automatically get tabular alignment, even without the `font-variant-numeric: tabular-nums` declaration. The declaration is technically redundant but documents intent.

**Remaining gap**: Number displays using Rajdhani (default font) without `kuro-number` or `kuro-stat` class — these use proportional numerals. Rajdhani's numerals are proportional by default.

---

**OpenType features:**

| Feature | Status | Evidence |
|---------|--------|---------|
| `font-kerning` | Not declared (browser default = auto) | No `font-kerning` in any file |
| `font-variant-ligatures` | Not declared | No ligature control anywhere |
| `font-variant-numeric: tabular-nums` | ✅ 3 CSS-in-JS declarations | Lines 1047, 1285, 1293 |
| `font-feature-settings` | Not used | No explicit OpenType feature activation |
| `font-variant-caps` | Not used | Caps handled via `text-transform: uppercase` |

---

**Weight contrast as craft signal:**

| Pairing | Weight Delta | Context | Perception |
|---------|-------------|---------|------------|
| CardHeader (600) + body text (implicit 400) | 200 | Section title → content | ✅ Clear hierarchy |
| kuro-label (600) + input value (400) | 200 | Label → input | ✅ Clear |
| font-bold (700) + font-medium (500) | 200 | Heading → label | ✅ Clear |
| font-bold (700) + font-semibold (600) | 100 | Primary → secondary emphasis | ⚠️ Subtle |
| font-medium (500) + implicit normal (400) | 100 | Label → body | ⚠️ Subtle |

---

**Tracked caps as craft signal:**

| Element | Tracking | Size | Transform | Craft Level |
|---------|----------|------|-----------|-------------|
| kuro-label | 0.08em | 11px | uppercase | ✅ Professional — deliberate tracked caps |
| Tailwind `uppercase tracking-wider` | 0.05em | various | uppercase | ✅ Consistent pattern |
| Tailwind `tracking-widest uppercase` | 0.1em | 10px | uppercase | ✅ Emphatic variant |
| Desktop ad slot | 0.1em | 8px | uppercase | ✅ Decorative |
| Desktop header marker | 0.2em | 8px | implied | ⚠️ Extreme — decorative only |

---

### Findings

#### Finding E4-TC1: Tabular Numerals Comprehensive via Monospace Strategy — PASS

**Evidence**: The app achieves universal tabular number alignment through a two-layer approach:

1. **JetBrains Mono** (`var(--font-data)`) — used for all significant number displays. Monospace fonts provide inherently tabular figures, making explicit `tabular-nums` redundant but harmlessly applied.

2. **Explicit `font-variant-numeric: tabular-nums`** — applied to `.kuro-stat`, `.kuro-number`, `.kuro-scoreboard` as documentation of intent and fallback protection.

Any number that matters for column alignment (pity counts, resource totals, projections, timers) uses the data font, which is monospace. The few numbers rendered in Rajdhani (like inline counts in labels) are not column-aligned and don't need tabular figures.

**Solution**: The monospace-for-data strategy is architecturally superior to sprinkling `tabular-nums` on Rajdhani text. Maintain as-is.

---

#### Finding E4-TC2: No OpenType Feature Exploitation — PASS (Acceptable)

**Evidence**: Neither Rajdhani nor JetBrains Mono is a variable font with advanced OpenType axes. Both are static font families:
- Rajdhani: 5 weights (300-700), no `wght` axis variation, no `opsz`, no custom axes
- JetBrains Mono: Static monospace, no variable font features

Without variable font capabilities, the absence of `font-feature-settings` or advanced OpenType declarations is **expected, not a gap**. The fonts simply don't have features to exploit.

**Solution**: No action needed. If the app ever upgrades to variable fonts (e.g., Inter Variable, Geist Variable), revisit OpenType feature utilization at that time.

---

#### Finding E4-TC3: Tracked Caps Create Distinctive Voice — PASS

**Evidence**: The `kuro-label` pattern (11px / uppercase / 0.08em tracking / 600 weight) is one of the app's most distinctive typographic voices. It appears across CALC, PLANNER, TEAMS, and PROFILE tabs, creating a "system label" aesthetic that:
- Differentiates form group headers from section titles (CardHeader)
- Communicates "these are input categories" through visual language alone
- Aligns with the cyberpunk/terminal classification (uppercase tracked labels are a hallmark of sci-fi interfaces)

The Tailwind `uppercase tracking-wider` pattern in other contexts echoes this voice at a lighter weight, creating a coherent "tracked caps family."

**Solution**: The tracked caps system is a genuine personality moment in the typography. It makes the app "feel designed rather than defaulted" — which is exactly what the skill framework tests for. Maintain and protect this pattern.

---

#### Finding E4-TC4: Rajdhani Inline Numbers Use Proportional Figures — LOW

**Issue**: Inline number values rendered in Rajdhani (the display font) use proportional figures rather than tabular. In rare cases where Rajdhani numbers appear in vertically-aligned contexts (e.g., stat grids without `kuro-stat` class), digits may misalign.

**Evidence**: Rajdhani is a proportional font — its "1" is narrower than its "8". In contexts like:
```jsx
<span className="text-xl font-bold text-yellow-400">157</span>
<span className="text-xl font-bold text-yellow-400">88</span>
```
...these would align correctly only if wrapped in a `kuro-number` or `kuro-stat` class (which forces JetBrains Mono + tabular-nums), or if the container uses a fixed width.

**Impact**: LOW — Most significant number displays already use `var(--font-data)` inline style or `kuro-number`/`kuro-stat` class. The remaining Rajdhani numbers are typically standalone values (not column-aligned) where proportional figures are fine.

**Solution**: For any future number displays that need column alignment, ensure they use `kuro-number` class or `var(--font-data)` inline style. No retroactive changes needed.

---

## §E4.10 — Cross-Reference with §DT1–§DT4

This section maps §E4 findings against the design-aesthetic-audit typography framework (§DT1–§DT4), identifying alignments, contradictions, and reinforcements across the audit.

---

### §DT1: Type Personality Matrix

**Framework requirement**: Place the typeface on the Sans-Serif personality spectrum and assess whether its position matches the §0 personality.

**Rajdhani placement:**
```
Geometric ←————●———————————→ Humanist
  (DM Sans, Geist)              (Inter, Plus Jakarta)
  [Precise, modern, cold]       [Approachable, warm, readable]
         ↑
    Rajdhani sits here:
    Geometric-leaning with slight warmth
    from Devanagari heritage
```

**Cross-reference with §E4.8 (Typography as Character Signal)**:
- §E4-CS1 PASS confirms Rajdhani maps to all 6 character traits from §DP2
- §DT1 placement (Geometric-leaning) aligns with the Cyberpunk/Terminal classification from §DS1
- The "slight warmth" from Devanagari heritage prevents the pure-cold feeling that Geist or DM Sans would produce — this softening aligns with the COMPANION trait in the character brief
- **No alternative needed** — Rajdhani occupies the correct position on the matrix

**Verdict**: ✅ §E4.8 and §DT1 fully agree. The typeface position matches personality.

---

### §DT2: Typographic Scale & Rhythm

**Framework requirement**: Extract every unique font-size, check for scale ratio coherence, assess weight contrast and tracking by size.

**Cross-reference with §E4.1 (Heading Hierarchy) and §E4.5 (Letter Spacing):**

| §DT2 Criterion | §E4 Finding | Assessment |
|----------------|-------------|------------|
| Scale follows ratio? | E4-HH2 LOW: 12 sizes, linear 1px steps at bottom | ⚠️ Non-standard but intentional |
| Weight contrast ≥2 steps between levels? | E4-HH3 LOW: Only 3 weights (500/600/700), 1-step gaps | ⚠️ Narrow range |
| Body tracking: 0 to +0.01em? | E4-LS: empty-state 0.01em, tab 0.02em | ✅ Near norm |
| UI labels (10-12px): +0.03 to +0.06em? | E4-LS: tab 0.02em (slightly under) | ⚠️ Slightly below norm |
| Headings (24px+): -0.01 to -0.03em? | E4-LS3 PASS: scoreboard -0.02em | ✅ Correct |
| All-caps: +0.06 to +0.12em? | E4-LS2 PASS: kuro-label 0.08em | ✅ Perfect |

**Cross-reference with §E2 (Visual Rhythm)**:
- §E2-VR1 LOW noted the CSS-in-JS 14px vs Tailwind 4px grid dual-rhythm
- The typographic scale reinforces this: CSS-in-JS text sizes (11px, 13px, 14px, 18px) don't align with Tailwind's standard sizes (12px, 14px, 16px, 18px, 20px, 24px)
- At 14px and 18px, the two systems converge; elsewhere they diverge
- This is the same "dual-system coherence" pattern identified in spacing — the typography has its own parallel issue

**Verdict**: ⚠️ Two LOW findings (E4-HH2, E4-HH3) map to §DT2 concerns. The scale is pragmatically effective but not ratio-based.

---

### §DT3: Advanced Type Craft Signals

**Framework requirement**: Tabular numerals, OpenType features, orphan/widow control, type rendering quality.

**Cross-reference with §E4.9 (Type Craft Signals) and §E4.6 (Text Rendering):**

| §DT3 Criterion | §E4 Finding | Assessment |
|----------------|-------------|------------|
| Tabular nums for number columns | E4-TC1 PASS: Monospace strategy provides inherent tabular alignment | ✅ |
| Kerning enabled | E4-TR2 LOW: No explicit `text-rendering: optimizeLegibility` | ⚠️ Relies on browser default |
| Ligatures in display text | E4-TC2 PASS: Not applicable (static fonts) | ✅ N/A |
| Orphan/widow control | E4-LL4 PASS: Not needed for current content | ✅ Acceptable |
| `-webkit-font-smoothing: antialiased` | E4-TR1 PASS: Dual-layer application | ✅ Excellent |
| `text-rendering: optimizeLegibility` | E4-TR2 LOW: Missing but low impact | ⚠️ |

**Cross-reference with §E1 (Design Token System)**:
- §E1-COV1 HIGH noted that spacing/radius/z-index have 0% token coverage
- Typography tokens are partially covered: `--font-display` and `--font-data` exist, but font sizes, weights, and line-heights have no token abstraction
- This reinforces the "30% token coverage" finding — typography contributes to the gap

**Verdict**: ✅ Mostly strong. The monospace-for-data strategy is architecturally clever. One minor gap (optimizeLegibility).

---

### §DT4: Typographic Voice and Expressiveness

**Framework requirement**: Assess measure as intimacy control, line-height as breathing room, typography as composition element, typographic personality moments.

**Cross-reference with §E4.2 (Line Length), §E4.3 (Line Height), §E4.8 (Character Signal):**

**Measure as intimacy control:**
- Mobile 336px at 14px body = ~50 chars → "conversational, efficient" register ✅
- This matches the COMPANION personality — not encyclopedic, not fragmented, but focused and personal
- Cross-refs §E4-LL2 PASS: mobile measure is a strength

**Line-height as breathing room:**
- Body at 1.5 = "standard, comfortable" → appropriate for interface text ✅
- Data numbers at 1.0-1.2 = "tight, dense, information-first" → appropriate for data tables ✅
- Descriptions at 1.625 = "generous, unhurried" → appropriate for reading moments ✅
- The progression (tight data → standard UI → generous reading) creates an **emotional gradient** from analytical to contemplative

**Typography as composition element:**
- **Scale contrast**: 8px micro labels alongside 24px hero numbers creates compositional energy ✅
- **Weight contrast**: Bold stat numbers + medium labels create hierarchy ✅ (though narrow range per E4-HH3)
- **Alignment**: No intentional alignment breaks detected — all text is left-aligned or centered ⚠️ (missed opportunity for emphasis through alignment variation)

**Typographic personality moments:**

| Moment | Typography Treatment | Expressiveness? |
|--------|---------------------|-----------------|
| Empty state | `kuro-empty-state`: 13px, 0.01em tracking, var(--font-display) | ⚠️ Minimal — text fills space but doesn't speak |
| Error state | Red text at same size as surrounding content | ⚠️ Color-only differentiation |
| Success state (pull results) | text-2xl yellow-400/emerald-400 (largest text in app) | ✅ Strong — size signals celebration |
| Loading/skeleton | No skeleton typography — loading spinners only | ⚠️ Missed opportunity |
| Scoreboard countdown | 18px, monospace, tabular-nums, tracking -0.02em, line-height 1.0 | ✅ Strong craft — timer feels urgent and precise |
| Luck rating | text-xl font-bold + text-[10px] tracking-widest uppercase tier label | ✅ Excellent scale contrast creates drama |

**Cross-reference with §DBI1 (Brand Archetype — MAGICIAN)**:
- The scoreboard countdown and luck rating display are the app's strongest "magic reveal" moments
- Typography here does express character — the tight monospace timer with dramatic scale contrast creates anticipation
- But the empty state and error state miss the opportunity to express the MAGICIAN or COMPANION voice

**Verdict**: ⚠️ Mixed. Strong personality moments exist (scoreboard, luck rating, pull results) but empty/error/loading states are typographically neutral.

---

### Cross-Reference Summary Table

| §DT Section | §E4 Alignment | Key Cross-References | Gap? |
|-------------|--------------|---------------------|------|
| §DT1 Type Personality | ✅ Full agreement | E4-CS1 PASS, E4-CS2 PASS | No |
| §DT2 Scale & Rhythm | ⚠️ Partial | E4-HH2 LOW (scale), E4-HH3 LOW (weight), E4-LS2 PASS | Minor |
| §DT3 Craft Signals | ✅ Mostly strong | E4-TC1 PASS, E4-TR1 PASS, E4-TR2 LOW | Minor |
| §DT4 Voice & Expression | ⚠️ Mixed | E4-CS1 PASS (character), E4-LL2 PASS (measure) | Empty/error states |

**Prior-step cross-references surfaced:**
- §E1-COV1 HIGH (token coverage) — typography tokens contribute to gap
- §E2-VR1 LOW (dual-rhythm) — CSS-in-JS vs Tailwind type sizes mirror the spacing duality
- §DS1 (Cyberpunk/Terminal) — typography strongly reinforces primary classification
- §DP2 (LUMINOUS TACTICAL COMPANION) — Rajdhani + JetBrains Mono fully embody this character
- §DBI1 (MAGICIAN archetype) — scoreboard/luck moments express it; empty states don't

---

## §E4 — STEP 11 SUMMARY

### Finding Registry

| ID | Section | Severity | Title |
|----|---------|----------|-------|
| E4-HH1 | §E4.1 | LOW | Semantic heading tags minimal |
| E4-HH2 | §E4.1 | LOW | Font size scale not ratio-based |
| E4-HH3 | §E4.1 | LOW | Weight hierarchy narrow (500-700) |
| E4-HH4 | §E4.1 | PASS | CardHeader provides excellent consistency |
| E4-LL1 | §E4.2 | LOW | Desktop line length unconstrained for small text |
| E4-LL2 | §E4.2 | PASS | Mobile line length well-controlled |
| E4-LL3 | §E4.2 | PASS | Long-form text blocks properly constrained |
| E4-LL4 | §E4.2 | PASS | No orphan/widow control (acceptable) |
| E4-LH1 | §E4.3 | PASS | Line height system well-calibrated |
| E4-LH2 | §E4.3 | LOW | Small text (8-9px) relies on default line-height |
| E4-FP1 | §E4.4 | PASS | Rajdhani + JetBrains Mono excellent pairing |
| E4-FP2 | §E4.4 | PASS | Font role boundaries clean |
| E4-LS1 | §E4.5 | LOW | CardHeader positive tracking unconventional |
| E4-LS2 | §E4.5 | PASS | All-caps tracking properly applied |
| E4-LS3 | §E4.5 | PASS | Display text tightening correct |
| E4-TR1 | §E4.6 | PASS | Font smoothing properly applied |
| E4-TR2 | §E4.6 | LOW | Missing text-rendering: optimizeLegibility |
| E4-LQ1 | §E4.7 | PASS | Label casing consistent within each system |
| E4-LQ2 | §E4.7 | LOW | Two overly long uppercase labels |
| E4-LQ3 | §E4.7 | LOW | Two weak placeholders |
| E4-LQ4 | §E4.7 | PASS | Comprehensive aria-labels |
| E4-CS1 | §E4.8 | PASS | Rajdhani alignment with character profile |
| E4-CS2 | §E4.8 | PASS | JetBrains Mono reinforces analytical identity |
| E4-TC1 | §E4.9 | PASS | Tabular numerals comprehensive via monospace |
| E4-TC2 | §E4.9 | PASS | No OpenType exploitation (acceptable) |
| E4-TC3 | §E4.9 | PASS | Tracked caps create distinctive voice |
| E4-TC4 | §E4.9 | LOW | Rajdhani inline numbers use proportional figures |

### Severity Distribution

| Severity | Count |
|----------|-------|
| HIGH | 0 |
| MEDIUM | 0 |
| LOW | 10 |
| PASS | 17 |
| **Total** | **27** |

### Assessment

**Typography is a clear strength of this app.** Zero HIGH or MEDIUM findings. The Rajdhani + JetBrains Mono pairing is one of the most intentional and well-executed design decisions in the entire system. Font smoothing, tabular numerals, tracked caps, and line-height tiers all demonstrate genuine typographic craft.

The 10 LOW findings are refinement opportunities — none represent systemic problems:
- 3 relate to the non-standard type scale (pragmatic choice for data density)
- 3 relate to minor missing features (optimizeLegibility, semantic headings, orphan control)
- 2 relate to label text quality (long labels, weak placeholders)
- 2 relate to edge cases (desktop measure, proportional Rajdhani numbers)

**Strongest signals**: Font pairing (§E4.4), character alignment (§E4.8), tracked caps voice (§E4.9), font smoothing (§E4.6), line-height calibration (§E4.3).

---

> **End of Step 11 — §E4: Typography Craft**
> **Lines added**: ~680
> **Next step**: Step 12 — §E5: Component Visual Quality (awaiting user instruction)

---

# STEP 12 — §E5: Component Visual Quality

**Audit date**: 2026-03-20
**Auditor**: Claude (Opus 4.6)
**Skill reference**: `app-audit-SKILL.md` §E5 + `design-aesthetic-audit-SKILL.md` §DCO1–§DCO6
**Scope**: Every UI component across ALL 8 tabs — assessed for visual consistency, state completeness, and craft
**App version**: Whispering Wishes v3.2.3

---

## §E5.1 — Core Interactive Components: Buttons

### Component inventory

The button system is built around a single CSS-in-JS base class `.kuro-btn` (appcore-providers.jsx:855–910) with 6 color-semantic active variants. Additional button patterns exist as one-off Tailwind compositions.

**Button class usage across codebase:**

| Pattern | Count | Location |
|---|---|---|
| `.kuro-btn` (base) | 39 instances | App.jsx, appcore-components.jsx |
| `active-gold` | 11 | Tracker categories, Calc featured char, Server select, Import |
| `active-cyan` | 5 | Calc standard char/weap, Profile actions |
| `active-emerald` | 6 | Calc "Both", Guarantee toggle, Lunite |
| `active-pink` | 2 | Calc featured weapon |
| `active-purple` | 1 | Bookmark save |
| `active-red` | 1 | Reset all data |
| Inline Tailwind buttons | ~100+ | Quick-add currency, modal close, onboarding, header controls |
| `<TabButton />` component | 8 | Main navigation bar (appcore-components.jsx:703–749) |

**Total onClick handlers**: 143 across App.jsx

---

### E5-BT1: Button state completeness

**Assessment**: **PASS**

The `.kuro-btn` base class implements all 5 required states:

| State | Implementation | Quality |
|---|---|---|
| **Default** | `bg: var(--bg-btn)`, `border: 1px solid var(--border-medium)`, `shadow: var(--shadow-md)`, `backdrop-filter: blur(8px)` | Glassy, atmospheric, on-character |
| **Hover** | `border-color: var(--border-bright)`, `color: #fff`, `transform: translateY(-2px)`, `shadow: var(--shadow-lg)`, ripple overlay via `::before` | Physical lift + luminous brightening — excellent |
| **Active/pressed** | `transform: translateY(0) scale(0.97)`, `transition: 0.1s ease` | Physical press-down — matches cyberpunk precision |
| **Focus-visible** | `outline: 2px solid rgba(gold, 0.8)`, `outline-offset: 2px`, `box-shadow: 0 0 0 4px rgba(gold, 0.15)` | Gold focus ring — character-appropriate |
| **Disabled** | `opacity: 0.4`, `filter: saturate(0.7) brightness(0.8)`, `cursor: not-allowed`, `pointer-events: none` | Desaturated + dimmed — clear and prevents interaction |

All 5 states are present with thoughtful, character-consistent treatment. The hover lift (`translateY(-2px)`) paired with enhanced shadow creates a physical dimensionality that reinforces the cyberpunk glass aesthetic. The active press (`scale(0.97)`) gives immediate tactile feedback.

**Evidence**: appcore-providers.jsx:855–910 (base), :496–509 (focus-visible)

**Solution (maintenance)**: The button state system is exemplary. Document the 5-state contract in a component guide so future contributors maintain it. Consider adding a 6th state: **loading** (in-progress with spinner that maintains button dimensions) for async actions like leaderboard submit.

---

### E5-BT2: Button hierarchy system

**Assessment**: **LOW**

The app uses a **flat** button hierarchy — every `.kuro-btn` shares identical visual weight at rest. There is no visual distinction between primary (most important action), secondary (supporting), and tertiary (low-stakes) buttons.

**Evidence across tabs**:

| Tab | Buttons at same weight | What needs hierarchy |
|---|---|---|
| CALC | 6 banner selectors + guarantee toggle + save bookmark | "Calculate" should be primary; selectors are secondary |
| PLANNER | Lunite toggle + income sources | Planning actions are all equal weight |
| PROFILE | Server select + leaderboard + export + reset | "Reset All Data" (destructive) is same weight as save — only differentiated when active (active-red) |
| TEAMS | Team slots + selectors | No primary action stands out |

**Specific concern**: The destructive "Reset All Data" button (active-red) is visually identical to all other buttons at rest. Per §DCO1, destructive buttons should be "visually distinct from primary — different color family entirely." The red treatment only appears when the button is in its active/toggled state, not at rest.

**Solution**:
```
/* Primary action — full accent, maximal weight */
.kuro-btn-primary {
  background: rgba(237, 175, 24, 0.15);
  border-color: rgba(237, 175, 24, 0.4);
  color: #fef08a;
  font-weight: 600;
}

/* Secondary — current default .kuro-btn (no change needed) */

/* Tertiary / ghost — reduced weight */
.kuro-btn-ghost {
  background: transparent;
  border-color: transparent;
  box-shadow: none;
  opacity: 0.7;
}
.kuro-btn-ghost:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: var(--border-medium);
  opacity: 1;
}

/* Destructive — always visually distinct, not just when active */
.kuro-btn-danger {
  border-color: rgba(239, 68, 68, 0.3);
  color: rgba(239, 68, 68, 0.7);
}
.kuro-btn-danger:hover {
  border-color: rgba(239, 68, 68, 0.6);
  color: #fecaca;
  background: rgba(239, 68, 68, 0.1);
}
```

---

### E5-BT3: Active color variant system

**Assessment**: **PASS**

The 6 active variants (gold, cyan, emerald, pink, purple, red) form a coherent glow-based system. Each variant applies:
- Tinted background at 15% opacity
- Saturated border at 70% opacity
- Light text color (pastel tint of the accent)
- Triple-layer box-shadow (outer glow + drop shadow + inner glow)
- Text-shadow for luminous readability
- Animated `borderGlow` keyframe (2s ease-in-out infinite) on gold variant

**Color-semantic mapping**:

| Color | Semantic meaning | Usage |
|---|---|---|
| **Gold** (#edaf18) | Featured/primary/selected | Featured char, server, import |
| **Cyan** (#38bdf8) | Standard/secondary/info | Standard banner, profile actions |
| **Emerald** (#22c55e) | Confirmed/toggled-on/both | Guarantee, Lunite, "Both" option |
| **Pink** (#ec4899) | Weapon/alternate | Featured weapon, forging tides |
| **Purple** (#a855f7) | Save/bookmark | Bookmark save action |
| **Red** (#ef4444) | Destructive/reset | Reset all data |

The semantic associations are consistent and learnable. Gold = character, pink = weapon is an intuitive mapping from gacha game conventions.

**Evidence**: appcore-providers.jsx:912–978

**Solution (maintenance)**: The color-semantic mapping is strong. Formalize it as a documented convention: gold = primary selection, cyan = secondary selection, emerald = confirmation/success, pink = weapon/alternate, purple = save/persist, red = destructive.

---

### E5-BT4: Tab navigation buttons

**Assessment**: **PASS**

The `<TabButton />` component (appcore-components.jsx:703–749) is a well-crafted navigation element:

- **Active state**: `text-yellow-400` + icon container with `bg-yellow-500/10 shadow-lg shadow-yellow-500/25` + drop-shadow glow
- **Inactive state**: `text-gray-500 hover:text-gray-300` + icon container with hover `bg-white/5`
- **Indicator**: Animated gold gradient bar (`linear-gradient(90deg, rgba(gold,0.6), rgba(gold,1), rgba(gold,0.6))`) with smooth position/width transition via `cubic-bezier(0.16, 1, 0.3, 1)`
- **Accessibility**: `role="tab"`, `aria-selected`, `aria-controls`, `tabIndex` management, `aria-label`
- **Typography**: `text-[10px] font-medium` — consistent, compact

The 8 tabs (Tracker, Events, Calculator, Planner, Analytics, Collection, Teams, Profile) each have a Lucide icon + text label. The active state is unmistakably clear through the gold color + background glow + animated indicator bar — a triple-signal approach that satisfies §DCO4's requirement for "unmistakably clear which item is active."

**Evidence**: appcore-components.jsx:703–749, App.jsx:3196–3212

**Solution (maintenance)**: Tab navigation is excellent. The gold active indicator with animated position tracking is both functional and character-expressive. No changes needed.

---

### E5-BT5: Inline button inconsistency

**Assessment**: **MEDIUM**

Approximately 100+ buttons outside the `.kuro-btn` system use ad-hoc Tailwind compositions. These buttons lack the unified state system (no ripple, no consistent hover lift, no `borderGlow` animation) and have inconsistent visual properties:

| Button type | Radius | Padding | Font size | Hover | Active |
|---|---|---|---|---|---|
| `.kuro-btn` | 12px | 10px 12px | 11px | lift + ripple | scale(0.97) |
| Quick-add currency | `rounded` (6px) | px-2 py-1 | 9px | bg opacity increase | none |
| Modal close icons | `rounded-lg` (8px) | p-2.5 | — | bg-white/10 | none |
| Consent modal | `rounded` (6px) | px-3 py-2 | 12px | bg opacity increase | none |
| Leaderboard tabs | `rounded-lg` (8px) | py-1.5 | 10px | none | none |
| Bookmark load/delete | `rounded` (6px) | px-3 py-1.5 | 10px | bg opacity increase | none |
| Onboarding nav | `rounded` (6px) | px-4 py-2 | 11px | text color change | none |
| Header controls | `rounded-lg` (8px) | p-2 | — | yellow tint | scale(0.95) |

**Key inconsistencies**:
1. **Border radius**: 3 different values (6px, 8px, 12px) across button types
2. **Active/press feedback**: Only `.kuro-btn` and header controls have press feedback; currency buttons, modal closes, and bookmark actions have none
3. **Hover pattern**: `.kuro-btn` uses lift + ripple; others use simple opacity/color changes
4. **No focus-visible override**: Inline buttons rely on the global `*:focus-visible` style (2px gold outline), which works but misses the enhanced `box-shadow: 0 0 0 4px` that `.kuro-btn` gets

**Solution**:
```css
/* Extend kuro-btn-sm for small inline buttons */
.kuro-btn-sm {
  font-size: 9px;
  padding: 4px 8px;
  border-radius: 8px;
  /* Inherits all 5 states from .kuro-btn */
}

/* For icon-only buttons */
.kuro-btn-icon {
  padding: 10px;
  border-radius: 8px;
  /* Inherits all 5 states from .kuro-btn */
}
```
Migrate the ~100 inline buttons to `.kuro-btn-sm` or `.kuro-btn-icon` variants. This gives them the full 5-state treatment (including ripple, lift, press feedback) while allowing size differentiation. Priority: currency quick-add buttons (highest frequency interaction in CALC tab).

---

### E5-BT6: Button loading state

**Assessment**: **LOW**

Only the leaderboard submit button has a loading/disabled-during-submit state:
```jsx
disabled={leaderboardSubmitting}
className={`... ${leaderboardSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
```

This is a simple opacity reduction, not a true loading state with spinner. No other async buttons (export, import, bookmark save) show loading feedback.

**Per §DCO1**: "Loading state: does the button have an in-progress state that maintains its size?"

**Solution**:
```css
.kuro-btn.loading {
  pointer-events: none;
  position: relative;
  color: transparent; /* Hide label text */
}
.kuro-btn.loading::after {
  content: '';
  position: absolute;
  inset: 0;
  margin: auto;
  width: 14px; height: 14px;
  border: 2px solid rgba(255,255,255,0.2);
  border-top-color: var(--text-heading);
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}
```
Apply to leaderboard submit, export, import, and bookmark save buttons during async operations.

---

### E5-BT7: Button character alignment (§DCO1 cross-reference)

**Assessment**: **PASS**

Per §DCO1's character-specific button table, a **Cyberpunk/terminal** character should use: "Outlined with glow on hover; `border: 1px solid accent`; text-only with terminal underline."

The `.kuro-btn` system delivers exactly this:
- **Outlined**: `border: 1px solid var(--border-medium)` at rest — border-primary, not fill-primary
- **Glow on hover**: `box-shadow: var(--shadow-lg)` + `border-color: var(--border-bright)` on hover
- **Active variants**: Full glow system with `borderGlow` animation, text-shadow, triple box-shadow
- **Glass material**: `backdrop-filter: blur(8px)` + semi-transparent background — extends beyond basic outline into atmospheric territory

The button system is one of the app's strongest character expressions. The combination of glass material, gold glow animation, and physical hover/press interactions creates a "luminous tactical companion" feel that directly supports the §DP2 character brief.

**Evidence**: All `.kuro-btn` definitions in appcore-providers.jsx:855–978

**Solution (maintenance)**: Preserve the outlined-glass-glow button vocabulary as a core brand element. Any new button variants must maintain: (1) border-primary (not fill-primary), (2) glass material, (3) glow on activation.

---

## §E5.2 — Core Interactive Components: Inputs, Sliders, Dropdowns, Search

### Component inventory

| Component | CSS class | Count | Tabs present |
|---|---|---|---|
| Text/number inputs | `.kuro-input` | 25 | CALC, PLANNER, PROFILE, TEAMS, ADMIN |
| Small inputs | `.kuro-input-sm` | ~8 | TEAMS (echo/pity counters), ADMIN |
| Select dropdowns | `.kuro-input` or inline | 12 | Header, PLANNER, COLLECTION, TEAMS |
| Textareas | `.kuro-input` + `font-mono` | 6 | PROFILE (import/export), ADMIN |
| Range sliders | `.kuro-slider` | 8+ | CALC (priority), PROFILE (visual settings), pity counters |
| Priority slider | `.priority-slider` | 1 | CALC (astrite allocation) |
| Toggle switches | Custom `role="switch"` | 3 | PROFILE (OLED, swipe nav, animations) |
| Radio groups | `role="radiogroup"` + `role="radio"` | 1 group (7 items) | TEAMS (resonance sequence S0–S6) |
| Pressed toggles | `aria-pressed` buttons | 12+ | CALC, PLANNER, COLLECTION, PROFILE |

---

### E5-IN1: Input field state completeness

**Assessment**: **PASS**

The `.kuro-input` class (appcore-providers.jsx:987–1030) implements 4 of 5 standard states:

| State | Implementation | Quality |
|---|---|---|
| **Default** | `bg: var(--bg-input)`, `border: 1px solid var(--border-bright)`, `border-radius: 8px`, `padding: 10px 12px`, `font-size: 14px`, `backdrop-filter: blur(8px)` | Glass material matching buttons |
| **Hover** | `border-color: rgba(255, 255, 255, 0.3)` | Subtle brightening — correct for inputs |
| **Focus** | `border-color: rgba(gold, 0.6)`, `box-shadow: 0 0 0 3px rgba(gold, 0.1), 0 0 20px rgba(gold, 0.08)` | Gold focus ring + ambient glow — character-consistent |
| **Placeholder** | `color: #6b7389` (default), `#8f99ab` (on focus — brightens) | Chromatic blue-gray, not generic gray — excellent |
| **Disabled** | Not explicitly styled | Relies on browser default — acceptable for current usage |
| **Error** | Not implemented | No input validation errors exist in UI |

The focus state is particularly well-crafted: the `0 0 20px rgba(gold, 0.08)` ambient glow creates a "sensing" effect as if the input detects the user's attention — perfectly on-character for the "luminous tactical companion."

**Evidence**: appcore-providers.jsx:987–1030

**Solution (maintenance)**: Add explicit disabled and error states for future-proofing:
```css
.kuro-input:disabled {
  opacity: 0.4;
  filter: saturate(0.7);
  cursor: not-allowed;
}
.kuro-input.error {
  border-color: rgba(239, 68, 68, 0.6);
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}
```

---

### E5-IN2: Input-button visual coherence (§DCO2 cross-reference)

**Assessment**: **PASS**

Per §DCO2: "Inputs should feel like they belong to the same world as the buttons."

| Property | `.kuro-btn` | `.kuro-input` | Coherence |
|---|---|---|---|
| Background | `var(--bg-btn)` rgba(15,20,28,0.85) | `var(--bg-input)` (same token family) | Matched |
| Border | `1px solid var(--border-medium)` | `1px solid var(--border-bright)` | Input slightly brighter — correct (data entry invites more) |
| Border-radius | 12px | 8px | Inputs tighter — appropriate (precision data entry) |
| Focus color | Gold outline | Gold border + glow | Same gold accent |
| Backdrop-filter | blur(8px) | blur(8px) | Identical |
| Font | var(--font-display) 11px | 14px (inherits display) | Input larger — appropriate for data entry |

The input and button systems share the same glass material vocabulary (backdrop blur, semi-transparent backgrounds, gold focus) while appropriately differentiating through radius (12px vs 8px — buttons more rounded, inputs more precise) and border weight (inputs brighter to invite data entry). A designer viewing isolated inputs and buttons would place them in the same product.

**Solution (maintenance)**: The coherence is excellent. Maintain the principle: buttons are slightly softer (12px radius), inputs are slightly sharper (8px radius), both share glass material.

---

### E5-IN3: Slider quality

**Assessment**: **PASS**

The `.kuro-slider` (appcore-providers.jsx:1173–1237) is a fully custom-styled range input:

- **Track**: 6px height, `rgba(255,255,255,0.15)` background, `border-radius: 3px`
- **Thumb**: 18px circle, gold gradient (`linear-gradient(135deg, #e6b030, #edaf18)`), `2px solid rgba(0,0,0,0.4)` border, `0 0 12px rgba(gold, 0.6)` glow
- **Hover**: Thumb scales to 1.15, shadow expands to `0 0 18px`
- **Firefox support**: Full `::-moz-range-*` duplication — cross-browser complete
- **Appearance**: `appearance: none` — fully custom, no system UI leak

The priority slider (`.priority-slider`) adds a special dual-track gradient showing gold/pink allocation split, with a white thumb (not gold) for contrast against the colored track.

**Evidence**: appcore-providers.jsx:1173–1237

**Solution (maintenance)**: Slider is well-crafted. The gold-glowing thumb is character-consistent. Consider adding a `focus-visible` state to the thumb for keyboard accessibility (currently uses global focus outline which may not render cleanly on a circular thumb).

---

### E5-IN4: Dropdown/select quality

**Assessment**: **LOW**

Select elements use mixed styling approaches:

| Location | Styling approach | Consistency |
|---|---|---|
| Header server | Inline Tailwind: `rounded-lg border border-white/10 focus:border-yellow-500/50` + `headerControlBg` | Custom, no `.kuro-input` |
| Planner selects | `.kuro-input w-full` | Correct — uses system |
| Collection filters | Inline: `px-2.5 py-1.5 min-h-[44px] rounded-lg border border-white/10` | Custom, no `.kuro-input` |
| Teams filters | Inline: `px-2 py-1.5 min-h-[44px] rounded-lg border border-white/10` | Custom, no `.kuro-input` |
| Teams sonata | `.kuro-input kuro-input-sm w-full text-[9px]` | Correct — uses system |

**Issue**: 3 of 5 select usage groups bypass the `.kuro-input` class and use inline Tailwind, losing:
- The glass `backdrop-filter: blur(8px)`
- The unified hover state (`border-color: rgba(255,255,255,0.3)`)
- The gold focus glow (`box-shadow: 0 0 0 3px rgba(gold, 0.1)`)

The Collection and Teams filter selects get a simpler `focus:border-yellow-500/50` which misses the ambient glow shadow. The header server select uses a dynamic background style instead of `var(--bg-input)`.

**Solution**:
Apply `.kuro-input` to all select elements:
```jsx
/* Collection filters — before */
className="px-2.5 py-1.5 min-h-[44px] rounded-lg border border-white/10 ..."

/* Collection filters — after */
className="kuro-input text-[10px] py-1.5 min-h-[44px] ..."
```
This unifies all 12 selects under the same glass-material + gold-focus system. Override padding/font-size as needed with utility classes.

---

### E5-IN5: Search bar quality

**Assessment**: **LOW**

Two search bars exist:

1. **Collection search** (App.jsx:4814): No `.kuro-input` class, uses default styling. Placeholder: "Search by name..."
2. **Teams resonator search** (App.jsx:6174): `.kuro-input w-full pl-8 text-xs`. Has Search icon (`<Search size={14}`) at left. Placeholder: "Search resonators..."
3. **Teams weapon search** (App.jsx:6369): `.kuro-input w-full text-xs`. Placeholder: "Search weapons..."

**Issues**:
- Collection search (highest-traffic search) lacks `.kuro-input` styling
- No **clear/cancel button** appears when text is entered (§E5 requirement: "Clear/cancel button appears when text is entered")
- Only the Teams resonator search has a Search icon; Collection and Teams weapon search do not
- No search suggestion/autocomplete dropdown on any search

**Solution**:
1. Apply `.kuro-input` to Collection search
2. Add Search icon consistently to all 3 search bars
3. Add a clear (X) button that appears when `searchValue.length > 0`:
```jsx
{searchValue && (
  <button
    onClick={() => setSearchValue('')}
    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-white"
    aria-label="Clear search"
  >
    <X size={12} />
  </button>
)}
```

---

### E5-IN6: Toggle switch quality

**Assessment**: **PASS**

Three custom toggle switches exist in the Profile tab (OLED mode, Swipe navigation, Animations):

- **Track**: `w-[52px] h-[24px] rounded-[3px]` — deliberately **square-ish** (3px radius, not pill-shaped)
- **Thumb**: `w-4 h-4` (16px), absolute positioned, transitions smoothly between left-[4px] (off) and left-[32px] (on)
- **ON colors**: White track (OLED), Cyan track (Swipe), Purple track (Animations) — each semantically distinct
- **OFF state**: `var(--bg-btn)` track + `bg-gray-400` thumb
- **Accessibility**: `role="switch"`, `aria-checked`, `aria-label`
- **Animation**: `transition-all` on both track and thumb

The square-cornered tracks (`rounded-[3px]`) are an intentional character choice — they match the cyberpunk/terminal aesthetic rather than the consumer-friendly pill shape. The distinct colors per switch (white/cyan/purple) provide semantic meaning beyond position alone, satisfying §E5's requirement that on/off be "visually unambiguous (not just color — also position, icon, or text)."

**Evidence**: App.jsx:6557 (OLED), :6584 (swipe), :6611 (animations)

**Solution (maintenance)**: The switches are well-crafted and on-character. The square-ish track shape is a distinctive brand detail — preserve it. Consider adding a subtle glow to the ON state thumb matching each switch's accent color.

---

### E5-IN7: Radio button quality (resonance sequence)

**Assessment**: **PASS**

One radio group exists: the resonance sequence selector (S0–S6) in the Teams tab.

- **Structure**: `role="radiogroup"` wrapper with 7 `role="radio"` buttons
- **Active**: `bg-yellow-500/20 border-yellow-500/40 text-yellow-400 border` — gold highlight
- **Inactive**: `border border-white/10 text-gray-500 hover:text-gray-300`
- **Typography**: `text-[9px] font-bold` — compact, high-density
- **Layout**: `flex-1` distribution — equal width across all 7 items

The gold active state matches the broader active-gold semantic. The `aria-checked` state management is correct.

**Evidence**: App.jsx:5819–5838 (approximate)

**Solution (maintenance)**: Radio group is functional and accessible. For consistency with the toggle switches, consider adding a subtle gold glow (`box-shadow: 0 0 8px rgba(237,175,24,0.2)`) to the active radio item.

---

### E5-IN8: Checkbox quality (aria-pressed toggles)

**Assessment**: **PASS**

The app uses `aria-pressed` buttons as checkbox equivalents (12+ instances across CALC, PLANNER, COLLECTION, PROFILE). These are implemented as `.kuro-btn` with active color variants, not as native checkboxes.

**Example — Guarantee toggle**:
```jsx
aria-pressed={state.calc.charGuaranteed}
aria-label={state.calc.charGuaranteed ? 'Guaranteed next 5-star: on' : '50/50 active: off'}
className={`kuro-btn w-full ${state.calc.charGuaranteed ? 'active-emerald' : 'active-gold'}`}
```

The toggle between `active-emerald` (guaranteed) and `active-gold` (50/50) provides clear visual + semantic differentiation. The `aria-label` changes based on state, providing screen reader context.

**One concern**: The Lunite subscription toggle uses a small square indicator (`w-4 h-4 rounded flex items-center justify-center`) inside the button that shows a Check icon when active — this is the only checkbox-like visual in the app. All others rely solely on the kuro-btn active color change.

**Evidence**: App.jsx:3493 (guarantee), :3775 (Lunite), :4904 (collection sort)

**Solution (maintenance)**: The button-as-checkbox pattern works well in this UI. The active color system provides clear on/off indication. No changes needed.

---

## §E5.3 — Container Components

### Component inventory

| Component | CSS class | Count | Tabs present |
|---|---|---|---|
| Card | `.kuro-card` + `.kuro-card-inner` | ~40+ | ALL 8 tabs |
| Card header | `.kuro-header` (via `<CardHeader>`) | 28+ | ALL 8 tabs |
| Card body | `.kuro-body` (via `<CardBody>`) | 28+ | ALL 8 tabs |
| Modals/dialogs | `role="dialog" aria-modal="true"` | 9 | STATS, TEAMS, PROFILE, COLLECTION |
| FocusTrapModal wrapper | `<FocusTrapModal>` | 3 | TEAMS (char selector, weapon selector) |
| Tab bar (main) | `<TabButton>` × 8 | 1 bar | Global navigation |
| Sub-tab bars | Inline button groups | 4 | TRACKER (categories), STATS (leaderboard), COLLECTION (sort), TEAMS (echo tabs) |
| Collapsible panels | Conditional render | 3+ | CALC (income panel), PLANNER (bookmarks), STATS (banner history) |

---

### E5-CT1: Card design quality (§DCO3 cross-reference)

**Assessment**: **PASS**

The `.kuro-card` system (appcore-providers.jsx:709–803) is the most distinctive component in the app. It implements a multi-layered glass surface:

**Card anatomy**:

| Layer | Implementation | Character contribution |
|---|---|---|
| **Background** | `var(--bg-card)` — semi-transparent dark surface | Glass material foundation |
| **Border** | `1px solid var(--border-default)` — subtle white opacity | Visible edge without harshness |
| **Shadow** | Triple: `0 4px 24px rgba(6,10,24,0.6)` + `0 0 0 1px rgba(white,0.03)` + `inset 0 1px 0 rgba(white,0.05)` | Depth + inner highlight |
| **Backdrop-filter** | `blur(4px)` | Glass frosting |
| **Corner radius** | 16px | Generous but not pill-shaped |
| **Top shimmer** | `::after` — `linear-gradient(90deg, transparent→white→transparent)` with `shimmer 3s` animation | Breathing luminosity — signature craft |
| **Corner decorations** | `.kuro-card-inner::before` (top-right) + `::after` (bottom-left) — 12px L-shaped border accents at `rgba(white,0.2)` | HUD/tactical frame detail — distinctive |
| **Hover** | `translateY(-2px)` + enhanced shadow with gold glow (`0 0 40px rgba(gold, 0.03)`) + brightened border | Physical lift response |
| **Interactive active** | `scale(0.98)` + faster transition (0.1s) | Press feedback |

**Staggered entry animation**:
```css
.tab-content > .kuro-card:nth-child(1) { animation-delay: 0.05s; }
.tab-content > .kuro-card:nth-child(2) { animation-delay: 0.1s; }
.tab-content > .kuro-card:nth-child(3) { animation-delay: 0.15s; }
.tab-content > .kuro-card:nth-child(4) { animation-delay: 0.2s; }
```

The card system is the app's primary character carrier. The combination of glass material, breathing shimmer, corner HUD decorations, and gold-tinted hover glow creates the "luminous tactical companion" identity. Every card across all 8 tabs uses this same system — visual consistency is perfect.

**Radius coherence assessment (§DCO3)**:

| Component | Radius | Relationship |
|---|---|---|
| Cards | 16px | Largest — containers are softest |
| Buttons | 12px | Slightly tighter — action elements |
| Inputs | 8px | Tightest — precision data entry |
| Badges/tags | 6px (Tailwind `rounded`) | Smallest — compact informational |
| Modals | 16px (`rounded-2xl`) | Matches cards — same container class |
| Toggle switches | 3px | Deliberately angular — cyberpunk character |

The radius family follows a coherent logic: **containers are softest (16px), actions are medium (12px), data entry is sharpest (8px), switches are angular (3px)**. This is a well-structured hierarchy that communicates function through shape.

**Evidence**: appcore-providers.jsx:709–803, appcore-components.jsx:156–161

**Solution (maintenance)**: The card system is the app's crown jewel. Preserve the shimmer animation, corner decorations, and glass material. Document the radius hierarchy as a design principle: 16px containers → 12px actions → 8px inputs → 3px switches.

---

### E5-CT2: CardHeader universal consistency

**Assessment**: **PASS**

The `<CardHeader>` component (appcore-components.jsx:158) renders identically across all 28+ cards:

```jsx
const CardHeader = memo(({ children, action }) => (
  <div className="kuro-header">
    <h3>{children}</h3>
    {action && <div className="kuro-header-action">{action}</div>}
  </div>
));
```

**Styling** (appcore-providers.jsx:805–847):
- Padding: 14px
- Border-bottom: `1px solid var(--border-subtle)`
- Background: subtle gradient `linear-gradient(90deg, rgba(white,0.02) 0%, transparent 40%, transparent 60%, rgba(white,0.02) 100%)`
- Typography: 14px / 600 weight / 0.03em tracking / 1.25 line-height
- Decoration: `::before` pseudo-element — 3px × 16px gold gradient bar with glow (`0 0 8px rgba(gold, 0.3)`)

The gold accent bar is a signature detail that appears before every section heading. It provides:
1. **Structural clarity** — instantly identifies section beginnings
2. **Brand expression** — gold gradient reinforces the luminous identity
3. **Visual rhythm** — consistent 14px padding + accent bar creates predictable scanning pattern

All 8 tabs use `<CardHeader>` without exception. No rogue heading patterns bypass this component.

**Evidence**: appcore-providers.jsx:805–847, verified across all tabs

**Solution (maintenance)**: The CardHeader gold accent bar is one of the app's most recognizable micro-details. Never remove it. If new card variants are needed, always include CardHeader for section labeling.

---

### E5-CT3: Modal/dialog quality (§DCO5 cross-reference)

**Assessment**: **PASS**

9 modals exist across the app:

| Modal | Location | Backdrop | Animation | Close mechanism | Focus trap |
|---|---|---|---|---|---|
| Character detail | COLLECTION | `bg-black/80 backdrop-blur-sm` | `scaleIn 0.3s ease-out` | X button + backdrop click + Escape | `useFocusTrap` |
| Weapon detail | COLLECTION | `bg-black/80 backdrop-blur-sm` | `scaleIn 0.3s ease-out` | X button + backdrop click + Escape | `useFocusTrap` |
| Consent | STATS | `bg-black/80 backdrop-blur-sm` | (inherits) | Button choices only | — |
| Leaderboard | STATS | `bg-black/80 backdrop-blur-sm` | (inherits) | X button + Escape | `useFocusTrap` |
| Trophy detail | STATS | `rgba(0,0,0,0.7) backdrop-blur(4px)` | (inherits) | Backdrop click + Escape | — |
| Team char selector | TEAMS | `bg-black/70 backdrop-blur-sm` | (inherits) | Backdrop click | `<FocusTrapModal>` |
| Team weapon selector | TEAMS | `bg-black/70 backdrop-blur-sm` | (inherits) | Backdrop click | `<FocusTrapModal>` |
| Bookmark | PROFILE | `bg-black/80 backdrop-blur-sm` | (inherits) | X button + backdrop click + Escape | `useFocusTrap` |
| Export/Import | PROFILE | `bg-black/80 backdrop-blur-sm` | (inherits) | X button + backdrop click + Escape | `useFocusTrap` |

**Consistency assessment**:

| Property | Consistent? | Detail |
|---|---|---|
| Backdrop opacity | Mostly | 80% on most, 70% on team selectors, 90% on ID card |
| Backdrop blur | Yes | `backdrop-blur-sm` (4px) on all |
| Z-index | Mostly | z-[100] on most, z-50 on team selectors |
| Corner radius | Yes | `rounded-2xl` (16px) — matches card radius |
| Max width | Yes | `max-w-sm` (384px) or `max-w-md` (448px) |
| Close button position | Yes | Top-right, always X icon |
| Close button size | Mixed | `min-w-[36px]` on char detail, `min-w-[44px]` on others |
| Body scroll prevention | Yes | All modals prevent background scroll |
| Escape key | Yes | All via `useEscapeKey` or inline handler |
| Focus trap | Yes | All use `useFocusTrap` or `<FocusTrapModal>` |
| Entry animation | Partial | Only character/weapon detail have explicit `scaleIn` |

**Modal stack management**: The `_modalStack` system (appcore-providers.jsx:274–294) correctly handles nested modals — only the topmost modal responds to Escape. This is a sophisticated accessibility feature.

**Per §DCO5 assessment**:
- Backdrop: Chromatic dark via `bg-black/80` — near-generic but the `backdrop-blur-sm` adds glass character
- Entry animation: Present on detail modals, absent on utility modals — acceptable hierarchy
- Radius: 16px matches card family — correct
- Internal spacing: Uses `<CardBody>` (14px padding) — same as cards, consistent
- Header: Uses `<CardHeader>` — same gold accent bar, consistent

**Solution (maintenance)**:
1. Normalize backdrop opacity to `bg-black/80` for all modals (team selectors currently use `bg-black/70`)
2. Normalize close button size to `min-w-[44px] min-h-[44px]` consistently (character detail uses 36px)
3. Add `scaleIn` animation to all modals for entrance consistency

---

### E5-CT4: Tab bar quality (§DCO4 cross-reference)

**Assessment**: **PASS**

Covered in depth at E5-BT4 (Tab navigation buttons). Summary:

The main tab bar uses the `<TabButton>` component with:
- Gold active indicator (animated gradient bar)
- Icon + text labels for all 8 tabs
- `role="tab"` + `aria-selected` + `aria-controls` accessibility
- Smooth position transition via `cubic-bezier(0.16, 1, 0.3, 1)`

**Sub-tab bars** (Tracker categories, Leaderboard tabs, Collection sort) use `.kuro-btn` with active color variants, maintaining visual consistency with the button system.

Per §DCO4, the active state uses a **triple signal** (color change + background glow + animated underline bar) making the current tab unmistakably clear.

**Solution (maintenance)**: No changes needed. Tab navigation is excellent.

---

### E5-CT5: Card internal padding consistency

**Assessment**: **PASS**

All cards use the `<CardBody>` component:
```jsx
const CardBody = memo(({ children, className = '', style }) => (
  <div className={`kuro-body ${className}`} style={style}>{children}</div>
));
```

`.kuro-body` applies `padding: 14px` and `color: var(--text-body)` consistently. Additional spacing is added via `className="space-y-3"` or similar Tailwind utilities, but the base 14px padding is universal.

**Evidence**: appcore-providers.jsx:849–852, appcore-components.jsx:160

**Solution (maintenance)**: 14px card padding is consistent and well-proportioned for the mobile-first layout. Preserve this value.

---

## §E5.4 — Informational Components

### Component inventory

| Component | Implementation | Count | Tabs present |
|---|---|---|---|
| Rarity badges | Inline `<Star>` icons | All character/weapon listings | TRACKER, COLLECTION, TEAMS, STATS |
| Element/role badges | Colored tag spans | Character detail modal | COLLECTION |
| Trophy badges | Tiered color system | ~20 trophy types | STATS |
| Luck rating badge | `.luck-badge` with animated gradient | 1 | STATS |
| Toast notifications | `<ToastProvider>` system | Global | ALL tabs |
| PityRing (circular progress) | SVG component | 4+ instances | CALC, TRACKER |
| ProbabilityBar (linear progress) | `role="meter"` div | Multiple | CALC |
| Goal progress bar | `role="progressbar"` div | 1 | PLANNER |
| Countdown timers | `<CountdownTimer>` component | Per active banner | EVENTS |
| Tooltips | `title` attributes only | Sparse | Various |
| Info banners | Colored `div` with border | 5+ | CALC, PLANNER, STATS |

---

### E5-IF1: Badge/chip/tag system

**Assessment**: **PASS**

Badges use a consistent pattern across the app:

**Rarity stars**: `<Star size={N} className="text-yellow-400 fill-yellow-400" />` — always yellow, always filled. Sizes: 8px–12px depending on context. Consistent across TRACKER pull history, COLLECTION grid, and character detail modals.

**Element/role badges** (character detail modal):
```jsx
<span className={`text-[10px] px-2 py-0.5 rounded ${colors.bg} ${colors.text} border ${colors.border}`}>
  {data.element}
</span>
```
Each element has a unique color mapping via `DETAIL_ELEMENT_COLORS` (Aero, Glacio, Electro, Fusion, Spectro, Havoc). The badges use the same construction pattern: `text-[10px] px-2 py-0.5 rounded border` — consistent padding, radius, and font size.

**Trophy tier badges**: 5 tiers with distinct colors:

| Tier | Color | Glow | Examples |
|---|---|---|---|
| Legendary | #edaf18 (gold) | Animated pulse | "Pity 1" |
| Gold | #edaf18 (gold) | Static | "Gotta Whale 'Em All", early pity |
| Purple | #a855f7 | Static | "4★ complete" sets |
| Blue | #3b82f6 | Static | "3★ Weapon complete" |
| Green | #22c55e | Static | "Echo of Fortune", back-to-back |

**Solution (maintenance)**: Badge system is consistent and well-tiered. The trophy tier colors map cleanly to game rarity conventions (gold = 5★ tier, purple = 4★ tier). No changes needed.

---

### E5-IF2: Toast/notification quality (§DCO6 cross-reference)

**Assessment**: **PASS**

The toast system (appcore-providers.jsx:185–241) implements a complete notification framework:

**Architecture**:
- React Context-based (`ToastContext`)
- Maximum 5 concurrent toasts (oldest dismissed if exceeded)
- Auto-dismiss: 3000ms default
- Position: `fixed bottom-24 left-3 right-3 z-[9998]`
- Entry animation: `slideUp 0.2s ease-out`
- `role="status" aria-live="polite" aria-atomic="true"` — correct ARIA live region

**4 severity variants**:

| Type | Background | Icon | Haptic feedback |
|---|---|---|---|
| Success | `rgba(34,197,94,0.9)` — emerald | `<CheckCircle>` | `haptic.success()` |
| Error | `rgba(248,113,113,0.9)` — red | `<AlertCircle>` | `haptic.error()` |
| Warning | `rgba(237,175,24,0.9)` — gold | `<AlertTriangle>` | `haptic.warning()` |
| Info | `rgba(56,189,248,0.9)` — cyan | `<Info>` | (none) |

**Per §DCO6 assessment**:
- **Visual character**: Semi-transparent backgrounds with white text and border (`border-white/20`) — matches glass vocabulary. Each color is from the app's established palette.
- **Motion**: Entry from bottom (`slideUp`) — correct for mobile app. Duration: 3s for all types — appropriate for success, possibly too short for errors.
- **Stacking**: Newest at bottom, vertical `gap-2` — clean, non-overlapping. Max 5 prevents toast flood.
- **Haptic**: Type-differentiated haptic feedback per toast — excellent UX detail for mobile PWA.
- **ARIA**: Live region with `polite` assertiveness — screen readers will announce toasts without interrupting.

**Solution (maintenance)**: The toast system is well-built. Two minor improvements:
1. Error toasts could use a longer duration (5000ms) since users need time to read error details
2. Consider adding swipe-to-dismiss for mobile users

---

### E5-IF3: Progress indicator quality

**Assessment**: **PASS**

Three distinct progress indicator types:

**1. PityRing (circular)** — appcore-components.jsx:885–927:
- SVG-based circular progress with configurable size (default 52px), strokeWidth (4px), color
- Soft pity zone visualization: When value ≥ 65/80, an orange danger zone arc appears
- Central numeric display: Current pity value
- `role="img"` with descriptive `aria-label` including soft pity state
- Color-coded per banner type (gold/cyan/pink/purple)
- `pulse-subtle` animation in soft pity zone

**2. ProbabilityBar (linear meter)** — appcore-components.jsx:1355–1366:
- `role="meter"` with `aria-valuenow`, `aria-valuemin`, `aria-valuemax`
- Percentage label + horizontal bar
- Color parameter (cyan/gold/pink)
- Width proportional to value

**3. Goal progress bar (linear)** — App.jsx:3928:
- `role="progressbar"` with `aria-valuenow`, `aria-valuemin=0`, `aria-valuemax=100`
- `h-2 rounded-full` — 8px height, pill-shaped
- Background: `var(--bg-stat)` — consistent with data display tokens
- Fill: Dynamic gradient (`linear-gradient(90deg, ${color}40, ${color})`)

All three progress types are:
- Semantically accessible (correct ARIA roles)
- Color-coded to match the app's color-semantic system
- Visually distinct in shape (ring vs bar) to communicate different data types (pity = finite cycle → ring, probability = percentage → bar, goal = linear progress → bar)

**Solution (maintenance)**: Progress indicators are excellent. The PityRing's soft-pity zone visualization is a particularly strong domain-specific design that would be unique to gacha trackers. Preserve it.

---

### E5-IF4: Tooltip quality

**Assessment**: **LOW**

The app uses `title` attributes for browser-native tooltips on some elements:
- Quick-add currency buttons: `title={tip}` (e.g., "1 month of dailies")
- No custom tooltip component exists
- No styled tooltips appear anywhere

**Issues per §E5**:
- Browser-native tooltips are unstyled and inconsistent across platforms
- They do not match the glass/cyberpunk aesthetic
- They're not accessible on touch devices (no long-press handler)
- No hover delay — appears instantly, which can be distracting

**Solution**:
```css
.kuro-tooltip {
  position: absolute;
  background: var(--bg-card);
  border: 1px solid var(--border-medium);
  border-radius: 8px;
  padding: 6px 10px;
  font-size: 10px;
  color: var(--text-body);
  backdrop-filter: blur(8px);
  box-shadow: var(--shadow-md);
  z-index: 50;
  pointer-events: none;
  animation: fadeIn 0.15s ease-out;
}
```
Replace `title` attributes with a custom `<Tooltip>` component that:
1. Matches the glass aesthetic
2. Shows on hover (desktop) and long-press (touch)
3. Positions automatically to avoid edge clipping

Note: This is a LOW finding because tooltips are used sparingly (only on currency quick-add buttons) and the core information is already communicated through button labels and aria-labels.

---

### E5-IF5: Banner/alert quality

**Assessment**: **PASS**

Several informational banners exist across tabs:

| Location | Style | Purpose |
|---|---|---|
| TRACKER new banner | `bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 text-center` | Highlights new banner availability |
| CALC astrite summary | `bg-yellow-500/10 border border-yellow-500/30 rounded-lg` | Resource summary display |
| PLANNER income | `bg-emerald-500/10 border border-emerald-500/30 rounded-lg` | Income tracking confirmation |
| PLANNER goal reached | `bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-center` | Goal completion celebration |
| PLANNER resources | `bg-white/5 rounded-lg` | Resource breakdown |

**Pattern**: Banners consistently use the color-semantic system:
- Gold border → featured/attention
- Emerald border → confirmation/positive
- White/neutral → informational

All banners use `rounded-lg` (8px), `p-2` or `p-3` padding, and `border` with color-at-30% opacity. The pattern is consistent enough to extract into a utility:

```css
.kuro-banner-{color} {
  background: rgba({color}, 0.1);
  border: 1px solid rgba({color}, 0.3);
  border-radius: 8px;
  padding: 8px 12px;
}
```

**Solution (maintenance)**: Banner pattern is consistent and clear. Consider extracting into reusable CSS classes to reduce Tailwind repetition, but this is a code organization improvement, not a visual quality issue.

---

### E5-IF6: Luck rating badge

**Assessment**: **PASS**

The luck rating badge (App.jsx:4005–4017) is a special informational component in the STATS tab:

- **Structure**: `.luck-badge` wrapper with gradient border → `.luck-badge-inner` with content
- **Color**: Dynamic `--badge-color` from `luckRating.color` (maps to rating tier)
- **Content**: Luck rating label + emoji + percentile
- **Sub-component**: Progress bar showing percentile position (`h-2 rounded-full`)
- **Sizing**: `min-width: 90px`, `rounded-xl`, `p-[2px]` gradient border trick

This is a unique, domain-specific component with personality. The gradient border + inner card pattern creates a "holographic card" feel reminiscent of rare collectible cards — perfect for a gacha app.

**Solution (maintenance)**: The luck badge is a character-positive delight moment. Preserve the gradient border pattern.

---

## §E5.5 — Content Display Components

### Component inventory

| Component | Implementation | Count | Tabs present |
|---|---|---|---|
| Pull history rows | Inline Tailwind flex rows | Dynamic (per pull data) | TRACKER |
| Banner history cards | `p-3 rounded-lg border border-white/10` | Dynamic | TRACKER |
| Collection grid items | `.collection-card` + `<CollectionGridSection>` | ~100+ items | COLLECTION |
| Team cards/slots | Card-based slots | 6 per team | TEAMS |
| Leaderboard rows | Flex rows | Dynamic | STATS |
| Trophy list | Grid layout | ~20 trophies | STATS |
| Icons (Lucide) | `lucide-react` library | 42 unique icons | ALL tabs |
| Character/weapon images | `<img>` with `hideOnError` | All characters/weapons | COLLECTION, TEAMS, TRACKER |
| Dividers | `.kuro-divider` + inline borders | ~20+ | Various |
| Empty states | `.kuro-empty-state` | 6+ distinct states | PLANNER, STATS, COLLECTION |
| Skeleton loading | `.kuro-skeleton-*` system | 4 variant classes | Loading states |

---

### E5-CD1: List item consistency

**Assessment**: **PASS**

List items across different tabs use context-appropriate patterns:

**Pull history rows** (TRACKER): Compact flex rows with rarity-colored left border, character/weapon name, pity count, and timestamp. Consistent `text-[9px]`–`text-[10px]` sizing. Alternating with subtle background differentiation.

**Banner history cards** (TRACKER): `p-3 rounded-lg border border-white/10 hover:border-white/15` with `var(--bg-btn)` background. Each card shows banner version, featured characters, and weapons with small 44px thumbnail images. Consistent padding and border treatment.

**Leaderboard rows** (STATS): Ranked list with position number, username, pull count, and luck rating. Consistent spacing with flex alignment.

**Income list items** (PLANNER): `flex items-center justify-between p-2 bg-white/5 rounded-lg text-xs` — consistent padding and background across all income entries.

**Bookmark list items** (PLANNER): Same pattern as income items with Load/Delete action buttons.

All list types share a common visual vocabulary: `rounded-lg` or `rounded` containers, `bg-white/5` or `var(--bg-btn)` subtle backgrounds, and consistent `text-xs` or `text-[10px]` typography. While not formally componentized, the patterns are sufficiently consistent.

**Solution (maintenance)**: List items are visually consistent within each context. Consider extracting a `<ListItem>` component for shared padding/background/border treatment, but this is a code organization improvement, not a visual quality issue.

---

### E5-CD2: Icon quality and consistency

**Assessment**: **PASS**

The app uses **Lucide React** exclusively for all icons. Two import statements cover the full icon set:

**App.jsx** (42 icons): AlertCircle, AlertTriangle, Archive, Award, BarChart3, BookmarkPlus, Calculator, Calendar, Check, ChevronDown, ClipboardList, Clover, Crown, Diamond, Download, Fish, Flame, Gamepad2, Gift, Heart, Info, Minus, Monitor, Plus, RefreshCcw, Search, Settings, Shield, Smartphone, Sparkles, Star, Sword, Swords, Target, TrendingDown, TrendingUp, Trophy, Upload, User, Users, X, Zap

**appcore-components.jsx** (24 icons): Sparkles, Swords, Sword, Star, User, TrendingUp, Check, Target, Zap, X, LayoutGrid, CheckCircle, AlertCircle, Gamepad2, Crown, Trophy, Flame, Diamond, Gift, Heart, Shield, TrendingDown, Fish, Clover

**Consistency assessment**:
- **Single icon family**: Lucide React throughout — no mixing with Font Awesome, Heroicons, or other libraries
- **Consistent stroke weight**: Lucide icons share uniform 2px stroke by default
- **Size consistency**: Icons use `size={N}` prop — common sizes are 12, 14, 16, 20, 24
- **Color application**: Via Tailwind `className` (e.g., `text-yellow-400`, `text-gray-400`) — consistent with text color system
- **Fill treatment**: Only star icons use `fill-yellow-400`; all others are stroke-only — consistent

The Lucide library choice is character-appropriate: clean geometric outlines that complement the cyberpunk/terminal aesthetic without competing with it.

**Solution (maintenance)**: Icon system is clean and consistent. Maintain single-library discipline. If new icons are needed, always use Lucide first.

---

### E5-CD3: Avatar/thumbnail quality

**Assessment**: **PASS**

Character and weapon images appear in:

| Context | Size | Shape | Fallback | Loading |
|---|---|---|---|---|
| Collection grid | ~80px × ~80px | `rounded-lg overflow-hidden` | Ghost grid cell (`.ghost-grid-cell`) | Skeleton placeholder |
| Character detail modal | h-48 (192px) | `rounded-t-2xl` header | `hideOnError` (hides element) | None |
| Banner history thumbnails | w-11 h-11 (44px) | `rounded-lg overflow-hidden` | `bg-black/30` fallback | None |
| Team member icons | w-7 h-7 (28px) | `rounded` | `bg-white/10` empty div | None |
| Weapon detail | h-36 (144px) | Positioned in header | `hideOnError` | None |

**Fallback system**: The `hideOnError` function (appcore-components.jsx:24) hides the image element on load failure. In team context, a `bg-white/10` fallback div shows. In collection, the skeleton placeholder persists.

**Image framing**: The app includes a custom framing system with per-image `x`, `y`, `zoom` parameters via `getImageFraming()`. This allows precise positioning of character art within constrained containers — a sophisticated detail for gacha apps where character art proportions vary.

**Solution (maintenance)**: Image handling is solid. The framing system is a notable quality feature. Consider adding a blur-up placeholder (low-res blurred image → full image) for collection grid items to improve perceived loading speed.

---

### E5-CD4: Divider quality

**Assessment**: **PASS**

Two divider patterns exist:

**1. `.kuro-divider`** (appcore-providers.jsx:1369–1373):
```css
.kuro-divider {
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--border-hover), transparent);
  margin: 12px 0;
}
```
A gradient divider that fades from transparent at edges to `var(--border-hover)` at center — a character-positive detail that avoids the harsh look of solid `border-top` lines.

**2. CardHeader bottom border**: `border-bottom: 1px solid var(--border-subtle)` — used in all CardHeader instances as the section separator within cards.

**3. Inline `border-t` / `border-b`**: Used sparingly (~19 instances total) for contextual separation within cards (e.g., between leaderboard header and list content).

**Usage assessment**: Dividers are structural, not decorative. The gradient `.kuro-divider` provides visual relief between major sections, while the solid `border-subtle` in CardHeaders separates header from body. There is no "divider overload" — the app relies more on spacing (`space-y-3`) and card boundaries for visual grouping.

**Solution (maintenance)**: Divider system is clean and purposeful. The gradient fade is a nice character detail. No changes needed.

---

### E5-CD5: Empty state design quality

**Assessment**: **PASS**

The `.kuro-empty-state` class (appcore-providers.jsx:1334–1351) provides an atmospheric empty state:

**Styling**:
- Background: `radial-gradient(ellipse at center, rgba(gold, 0.04) 0%, transparent 70%)` — subtle gold radiance
- Border: `1px dashed rgba(gold, 0.10)` — dashed, not solid, communicating "awaiting content"
- Entry: `emptyFadeIn 0.4s ease-out` animation — fades in + slides up 8px
- Top decoration: `::before` pseudo — 40px centered gold gradient line
- Typography: 13px / 500 weight / 0.01em tracking

**6+ empty states found**:

| Location | Message | Quality |
|---|---|---|
| PLANNER bookmarks | "No states archived. Use Save Current State in the Calculator to bookmark your configuration." | Action-oriented — tells user what to do |
| STATS trend | "Insufficient data for trend analysis" | Clear threshold explanation |
| STATS signal | "Insufficient signal data" | Clear threshold explanation |
| STATS 5★ history | "No 5★ signals detected" | Domain-specific vocabulary |
| STATS no data | "No Convene data on record" | Clean, informative |
| COLLECTION empty | Ghost grid cells (`.ghost-grid-cell`) with subtle pulse animation | Atmospheric — shows what the grid could contain |

Per §E5 requirement: "Every empty state designed (not default system text). Illustration or icon consistent in style? Message text helpful and action-oriented?"

The empty states use designed styling (gold radiance background, dashed border, fade-in animation) rather than plain text. The PLANNER bookmark empty state is particularly good — it tells users exactly how to populate the space. The Collection ghost grid cells are a distinctive touch, showing a "shadow" of future content rather than a blank void.

**Solution (maintenance)**: Empty states are well-designed and on-character. The gold radiance is a subtle "the companion is waiting" signal that reinforces the luminous identity. For the "Insufficient data" states, consider adding a minimum pull count: "Need at least 10 Convenes for trend analysis" instead of the vaguer "Insufficient data."

---

### E5-CD6: Image loading states

**Assessment**: **LOW**

Image loading behavior varies:

| Context | Loading state | Error state |
|---|---|---|
| Collection grid | Skeleton placeholder (`.kuro-skeleton`) → image appears | `hideOnError` hides element |
| Banner cards | `kuro-skeleton` background → image | `hideOnError` |
| Character detail modal | None — content jumps on load | `hideOnError` |
| Banner history thumbnails | None — `bg-black/30` placeholder shows | `hideOnError` |
| Team member avatars | None — `bg-white/10` shows | `hideOnError` fallback div |

**Issues**:
- **Character detail modal**: No loading placeholder — the header area may flash/jump when the image loads
- **Banner history**: No shimmer/skeleton — the 44px thumbnails just appear
- The `hideOnError` fallback simply hides the image — in some contexts, this leaves an empty space with no visual indicator that an image was expected

**Solution**:
1. Add `.kuro-skeleton` to character detail modal header image container for loading state
2. Add `bg-black/30` placeholder to all image containers that don't already have one
3. Consider replacing `hideOnError` (which hides entirely) with a generic fallback icon for critical contexts:
```jsx
const imgFallback = (e) => {
  e.target.style.display = 'none';
  e.target.nextSibling?.classList?.remove('hidden'); // Show fallback icon
};
```

This is LOW because the Collection grid (highest-frequency image display) already has proper skeleton loading, and the `hideOnError` approach prevents broken image icons.

---

## §E5.6 — Structural/Layout Components

### Component inventory

| Component | Implementation | Location |
|---|---|---|
| Skeleton/shimmer loading | `.kuro-skeleton` system (4 variants) | appcore-providers.jsx:1300–1327 |
| Custom scrollbar | `.kuro-scroll` | appcore-providers.jsx:1384–1397 |
| Tab content container | `.tab-content` with staggered card entry | appcore-providers.jsx:577–588 |
| Content layering | `.content-layer` (z-index:5) | appcore-providers.jsx:821–824 |
| Ghost grid cells | `.ghost-grid-cell` | appcore-providers.jsx:1353–1366 |
| Collection card hover | `.collection-card` transitions | appcore-providers.jsx:1376–1381 |

---

### E5-ST1: Skeleton/shimmer loading quality

**Assessment**: **PASS**

The `.kuro-skeleton` system (appcore-providers.jsx:1300–1327) implements character-consistent loading placeholders:

**Base shimmer**: `@keyframes kuroShimmer` — moves a gold-tinted gradient across the element:
```css
background-image: linear-gradient(90deg,
  transparent 0%,
  rgba(237, 175, 24, 0.06) 40%,
  rgba(237, 175, 24, 0.10) 50%,
  rgba(237, 175, 24, 0.06) 60%,
  transparent 100%
);
animation: kuroShimmer 1.8s ease-in-out infinite;
```

The gold tint in the shimmer is a character detail — standard skeleton shimmers use neutral gray; this one pulses with the app's signature gold. The 1.8s duration with ease-in-out creates a breathing rhythm.

**4 shape variants**:

| Variant | Height | Radius | Purpose |
|---|---|---|---|
| `.kuro-skeleton-row` | 36px | 8px | List item placeholders |
| `.kuro-skeleton-stat` | 72px | 10px | Stat card placeholders |
| `.kuro-skeleton-text` | 10px | 4px | Text line placeholders |
| `.kuro-skeleton-circle` | (configurable) | 50% | Avatar/icon placeholders |

The shapes match actual content layout — when data loads, the skeleton-to-content transition is seamless with minimal layout shift. This satisfies §E5's requirement: "Shimmer shapes match the actual content layout."

**Evidence**: appcore-providers.jsx:1300–1327

**Solution (maintenance)**: Skeleton system is excellent. The gold-tinted shimmer is a distinctive brand detail. Ensure all new loading states use this system rather than plain spinners.

---

### E5-ST2: Scroll quality

**Assessment**: **PASS**

The `.kuro-scroll` class (appcore-providers.jsx:1384–1397) provides custom scrollbar styling:

- **Firefox**: `scrollbar-width: thin`, `scrollbar-color: rgba(140,160,200,0.18) transparent`
- **Webkit**: 4px wide thumb, `rgba(140,160,200,0.18)` color, `border-radius: 4px`
- **Hover**: Thumb brightens to `rgba(140,160,200,0.35)`

The 4px thin scrollbar with blue-gray tint is unobtrusive and character-appropriate. It doesn't compete with content while remaining visible when needed.

**Solution (maintenance)**: Scrollbar is clean and minimal. No changes needed.

---

### E5-ST3: Collection card hover transitions

**Assessment**: **PASS**

The `.collection-card` class (appcore-providers.jsx:1376–1381) applies smooth transitions for interactive collection items:

```css
.collection-card {
  transition: transform var(--transition-fast), box-shadow var(--transition-fast), border-color var(--transition-fast);
  -webkit-mask-image: -webkit-radial-gradient(white, black);
  mask-image: radial-gradient(white, black);
}
```

The `mask-image` trick prevents `overflow: hidden` child content from bleeding outside rounded corners during transforms — a Safari-specific fix that shows attention to cross-browser detail.

**Solution (maintenance)**: Clean implementation with good cross-browser handling. No changes needed.

---

## §E5.7 — Component Quality Per Tab (Cross-Tab Coverage)

| Tab | Key components | Quality assessment |
|---|---|---|
| **TRACKER** | Pull history rows, banner history cards, BannerCard, pity counters | Cards use full kuro system. Banner cards (BannerCard component) are particularly rich with image framing, countdown timers, and visual settings. |
| **EVENTS** | EventCard, CountdownTimer | Consistent card usage with countdown timers. Timer colors match banner themes. |
| **CALC** | kuro-btn (6 selectors), kuro-input (4 number), kuro-slider (priority), PityRing (4), ProbabilityBar | Heaviest interactive component usage. All core inputs use kuro system. The astrite allocation slider with dual-color track is a craft highlight. |
| **PLANNER** | kuro-input (number), kuro-select (2), income list, bookmark list, progress bar | Clean usage of kuro system. Goal progress bar is well-designed. Empty state for bookmarks is action-oriented. |
| **STATS** | Trophy grid, leaderboard table, luck badge, trend charts, empty states | Most content-display components. Trophy system with tiered colors and the luck badge with gradient border are standout craft moments. |
| **COLLECTION** | Collection grid (CollectionGridSection), search, filters (3 selects), character/weapon detail modals | Largest component count. Ghost grid cells for empty state are distinctive. Detail modals with image framing show high craft. **Select filters bypass kuro-input** (noted in E5-IN4). |
| **TEAMS** | Team slot cards, character/weapon selector modals, radio group (S0–S6), echo management, search (2) | Complex multi-modal interactions. FocusTrapModal usage on selectors is good. |
| **PROFILE** | Toggle switches (3), server select, import/export textareas, bookmark modal, export modal, settings | Profile-specific components (switches, textareas) are well-crafted. Reset button needs hierarchy differentiation (noted in E5-BT2). |

---

## §E5.8 — Summary

### Findings table

| ID | Section | Severity | Component | Finding |
|---|---|---|---|---|
| **E5-BT1** | §E5.1 | **PASS** | Buttons: state completeness | All 5 states (default, hover, active, focus, disabled) implemented with character-consistent treatment |
| **E5-BT2** | §E5.1 | **LOW** | Buttons: hierarchy | Flat hierarchy — no visual distinction between primary, secondary, tertiary, destructive buttons at rest |
| **E5-BT3** | §E5.1 | **PASS** | Buttons: color variants | 6 active variants with coherent glow system and consistent semantic mapping |
| **E5-BT4** | §E5.1 | **PASS** | Tab navigation | Triple-signal active state (color + glow + animated indicator), full ARIA support |
| **E5-BT5** | §E5.1 | **MEDIUM** | Buttons: inline inconsistency | ~100+ inline buttons bypass kuro-btn system — no ripple, no consistent hover/press, 3 different border-radius values |
| **E5-BT6** | §E5.1 | **LOW** | Buttons: loading state | No true loading state with spinner — only opacity reduction on leaderboard submit |
| **E5-BT7** | §E5.1 | **PASS** | Buttons: character (§DCO1) | Cyberpunk outlined-glass-glow vocabulary — perfect character alignment |
| **E5-IN1** | §E5.2 | **PASS** | Inputs: state completeness | 4 states well-implemented, gold focus glow is character-positive |
| **E5-IN2** | §E5.2 | **PASS** | Inputs: button coherence (§DCO2) | Same glass material vocabulary, coherent radius differentiation |
| **E5-IN3** | §E5.2 | **PASS** | Sliders | Fully custom gold-glowing thumb, cross-browser, priority slider with dual-track |
| **E5-IN4** | §E5.2 | **LOW** | Dropdowns: mixed styling | 3 of 5 select groups bypass kuro-input, losing glass material and gold focus |
| **E5-IN5** | §E5.2 | **LOW** | Search bars | Collection search lacks kuro-input; no clear button on any search; inconsistent icon usage |
| **E5-IN6** | §E5.2 | **PASS** | Toggle switches | Square-cornered character choice, distinct colors per function, correct ARIA |
| **E5-IN7** | §E5.2 | **PASS** | Radio buttons | Gold active state, proper radiogroup/radio ARIA |
| **E5-IN8** | §E5.2 | **PASS** | Checkbox-like toggles | Button-as-checkbox with color-semantic active states |
| **E5-CT1** | §E5.3 | **PASS** | Cards (§DCO3) | Multi-layered glass surface with shimmer, corner decorations, coherent radius hierarchy — crown jewel |
| **E5-CT2** | §E5.3 | **PASS** | CardHeader consistency | Universal gold accent bar, 14px/600/0.03em across all 28+ cards |
| **E5-CT3** | §E5.3 | **PASS** | Modals (§DCO5) | 9 modals with consistent backdrop, radius, focus trap, escape key, modal stack management |
| **E5-CT4** | §E5.3 | **PASS** | Tab bar (§DCO4) | Gold animated indicator, 8 icon+text tabs, full ARIA |
| **E5-CT5** | §E5.3 | **PASS** | Card padding | 14px universal via CardBody |
| **E5-IF1** | §E5.4 | **PASS** | Badges/tags | Consistent pattern, game-aligned rarity tiers |
| **E5-IF2** | §E5.4 | **PASS** | Toasts (§DCO6) | 4 severity variants, haptic feedback, ARIA live region, character-tinted colors |
| **E5-IF3** | §E5.4 | **PASS** | Progress indicators | PityRing (circular), ProbabilityBar (meter), Goal bar — all accessible and color-coded |
| **E5-IF4** | §E5.4 | **LOW** | Tooltips | Browser-native `title` only — unstyled, not accessible on touch |
| **E5-IF5** | §E5.4 | **PASS** | Banners/alerts | Consistent color-semantic pattern (gold, emerald, white) |
| **E5-IF6** | §E5.4 | **PASS** | Luck rating badge | Gradient border card with holographic feel — character-positive delight moment |
| **E5-CD1** | §E5.5 | **PASS** | List items | Context-appropriate patterns with consistent padding/background vocabulary |
| **E5-CD2** | §E5.5 | **PASS** | Icons | Single library (Lucide), uniform stroke weight, consistent sizing and coloring |
| **E5-CD3** | §E5.5 | **PASS** | Avatars/thumbnails | Custom framing system, hideOnError fallback, skeleton loading on collection grid |
| **E5-CD4** | §E5.5 | **PASS** | Dividers | Gradient kuro-divider + structural border-subtle — purposeful, not decorative |
| **E5-CD5** | §E5.5 | **PASS** | Empty states | Gold-radiance atmospheric styling, action-oriented messages, ghost grid cells |
| **E5-CD6** | §E5.5 | **LOW** | Image loading | Character detail modal lacks loading placeholder; hideOnError leaves empty space in some contexts |
| **E5-ST1** | §E5.6 | **PASS** | Skeleton/shimmer | Gold-tinted kuroShimmer — character-consistent, 4 shape variants matching content layout |
| **E5-ST2** | §E5.6 | **PASS** | Scrollbar | 4px thin, blue-gray, unobtrusive |
| **E5-ST3** | §E5.6 | **PASS** | Collection hover | Smooth transitions with cross-browser mask-image fix |

### Severity distribution

| Severity | Count |
|---|---|
| HIGH | 0 |
| MEDIUM | 1 |
| LOW | 6 |
| PASS | 27 |
| **Total** | **34** |

### Key strengths

1. **Card system** (§E5-CT1): The multi-layered glass surface with breathing shimmer, corner HUD decorations, and gold-tinted hover glow is the app's single strongest design element. It alone carries 60%+ of the visual character.

2. **Button state completeness** (§E5-BT1): Full 5-state implementation with physical hover/press feedback and character-appropriate ripple/glow effects.

3. **Skeleton loading** (§E5-ST1): Gold-tinted shimmer animation turns a utility pattern into a brand expression.

4. **Toast system** (§E5-IF2): 4-variant severity system with haptic feedback, ARIA live region, and character-tinted colors — complete implementation.

5. **PityRing** (§E5-IF3): Domain-specific circular progress with soft-pity zone visualization — unique to gacha trackers and extremely well-crafted.

### Key concerns

1. **Inline button sprawl** (§E5-BT5 MEDIUM): ~100+ buttons outside the kuro-btn system creates visual inconsistency. This is the single most impactful fix opportunity in the component system — migrating inline buttons to kuro-btn variants would unify hover/press behavior across the entire app.

2. **Button hierarchy** (§E5-BT2 LOW): Flat visual weight means users can't scan for the most important action on a screen. Adding primary/secondary/ghost/danger variants would improve scanability.

3. **Select dropdown bypass** (§E5-IN4 LOW): Collection and Teams filter selects miss the glass material and gold focus glow by not using kuro-input.

### Connection to prior findings

- **§E1-COV1** (token coverage ~30%): The inline button sprawl (§E5-BT5) contributes to the token gap — buttons using ad-hoc Tailwind instead of kuro-btn tokens widen the coverage deficit.
- **§E1-RAD1** (rounded-lg monoculture): The radius hierarchy documented in §E5-CT1 (16px → 12px → 8px → 3px) shows the actual system is more nuanced than rounded-lg alone, but the ~100 inline buttons mostly use `rounded` (6px) or `rounded-lg` (8px), adding to the perceived monoculture.
- **§E2-MO1** (touch targets 36px): Some modal close buttons still use `min-w-[36px]` (character detail) while most are 44px — the touch target inconsistency persists at the component level.
- **§E3-NC1** (input border contrast 2.1:1): The gold focus glow on inputs (§E5-IN1) provides excellent contrast when focused, but the default border contrast issue from §E3 remains at rest.

---

> **End of Step 12 — §E5: Component Visual Quality**
> **Lines added**: ~720
> **Next step**: Step 13 — §E6: Interaction Design Quality (awaiting user instruction)

---

# Step 13 — §E6: Interaction Design Quality

**Skill reference**: app-audit §E6
**Cross-reference**: design-aesthetic-audit §DM1–§DM5
**Coverage**: ALL 8 tabs + global systems
**Axis profile**: A1 NON-REVENUE · A2 FOCUS-TOOL + EMOTIONAL-SECONDARY · A3 ENTHUSIAST/EXPERT · A4 NAMED-SOURCE Wuthering Waves L3 · A5 FUNCTIONAL-PRIMARY + ATMOSPHERIC-SECONDARY

---

## §E6.1 — Hover Feedback Audit

**Protocol**: Every interactive element must have a perceptible hover state that communicates interactivity — a change beyond just the cursor.

### E6-HV1 · kuro-btn hover system · **PASS**

| Property | Value | Notes |
|----------|-------|-------|
| Guard | `@media (hover: hover)` | Touch-safe — no phantom hover on mobile |
| Border | `var(--border-bright)` → rgba(255,255,255,0.2) | Brightens from 0.1 → 0.2 |
| Color | `#ffffff` | Text whitens for emphasis |
| Transform | `translateY(-2px)` | Lift effect — physical metaphor |
| Shadow | `var(--shadow-lg)` | Depth increase confirms hovering |
| Ripple | `::before` opacity 0 → 1 | Radial-gradient white glow centered |
| Duration | `var(--transition-normal)` = 0.25s | Cubic-bezier(0.16, 1, 0.3, 1) |

**Evidence**: `appcore-providers.jsx:886-896`
**Assessment**: Five simultaneous hover signals (border, color, lift, shadow, ripple) — this is one of the strongest hover systems in the codebase. The 0.25s duration with the custom easing produces a "considered but brisk" feel appropriate for A2 FOCUS-TOOL. The `@media (hover: hover)` guard is exactly correct — prevents sticky hover on touch devices.

**Solution (maintenance)**: This is the gold standard for the app. All other interactive elements should aspire to this level of hover feedback. No changes needed.

---

### E6-HV2 · kuro-card hover · **PASS**

| Property | Value | Notes |
|----------|-------|-------|
| Guard | `@media (hover: hover)` | Touch-safe |
| Border | `var(--border-hover)` → rgba(255,255,255,0.15) | Subtle brightening |
| Transform | `translateY(-2px)` | Lift matches button lift |
| Shadow | Enhanced (0.4 → 0.5 alpha + gold tint) | Gold glow on hover |
| Duration | 0.3s cubic-bezier(0.16, 1, 0.3, 1) | Slightly slower than buttons — correct, cards are larger |

**Evidence**: `appcore-providers.jsx:726-735`
**Assessment**: Card hover is elegant — the gold-tinted shadow on hover connects to the brand palette. The 2px lift matches the button lift for visual consistency. The 0.3s vs 0.25s duration difference for larger elements is a good motion-design instinct.

**Solution (maintenance)**: No changes needed. The card hover is the second strongest interaction in the system.

---

### E6-HV3 · kuro-input hover · **PASS**

| Property | Value | Notes |
|----------|-------|-------|
| Guard | `@media (hover: hover)` | Touch-safe |
| Border | rgba(255,255,255,0.3) | Brightens to confirm hoverable |
| Duration | `var(--transition-fast)` = 0.15s | Faster — inputs need immediate response |

**Evidence**: `appcore-providers.jsx:1001-1003`
**Assessment**: Input hover is deliberately minimal — a single border brightening. This is correct for form elements: hover should confirm "I am interactive" without competing with the focus state (gold glow). The 0.15s duration is appropriately fast for a micro-feedback moment.

**Solution (maintenance)**: No changes needed.

---

### E6-HV4 · kuro-stat hover · **PASS**

| Property | Value | Notes |
|----------|-------|-------|
| Guard | `@media (hover: hover)` | Touch-safe |
| Transform | `translateY(-1px)` | Subtle lift — less than buttons/cards |
| Border | `var(--border-bright)` | Brightens |
| Shadow | `0 4px 16px rgba(0,0,0,0.3)` | Depth increase |
| Color variants | Gold/cyan/purple/etc. each add colored shadow | Character expression |

**Evidence**: `appcore-providers.jsx:1052-1156`
**Assessment**: Stat boxes have a 1px lift (vs 2px for buttons/cards) — this creates a correct hierarchy: stats are informational, not primary actions. The color-specific shadows on variant stats (gold, cyan, purple) are a nice character touch.

**Solution (maintenance)**: No changes needed.

---

### E6-HV5 · kuro-slider hover · **PASS**

| Property | Value | Notes |
|----------|-------|-------|
| Thumb scale | `scale(1.15)` | Grows to confirm interaction target |
| Shadow | `0 0 18px rgba(237,175,24,0.8)` | Gold glow on thumb hover |
| Duration | 0.15s | Fast micro-feedback |
| Firefox | Separate `::-moz-range-thumb:hover` | Cross-browser support |

**Evidence**: `appcore-providers.jsx:1194-1215`
**Assessment**: Slider thumb hover is well-crafted — the scale increase communicates "I am the draggable part" and the gold glow connects to the brand. Firefox-specific styling shows attention to cross-browser detail.

**Solution (maintenance)**: No changes needed.

---

### E6-HV6 · Icon SVG hover glow · **PASS**

| Property | Value | Notes |
|----------|-------|-------|
| Transition | `color var(--transition-fast), filter var(--transition-fast)` | 0.15s |
| Filter | `drop-shadow(0 0 3px currentColor)` | Atmospheric glow in icon's own color |
| Scope | `button svg, a svg, [role="button"] svg` | All interactive icon containers |
| Disabled | Filter suppressed for `button:disabled svg` | Correct exclusion |

**Evidence**: `appcore-providers.jsx:912-930`
**Assessment**: This is a standout feature — icons inside interactive elements gain an atmospheric glow matching their own color on hover. This is genuinely character-positive and reinforces the "LUMINOUS TACTICAL COMPANION" personality. The `currentColor` approach means every icon automatically matches its context.

**Solution (maintenance)**: No changes needed. This is a signature interaction detail.

---

### E6-HV7 · Collection card hover · **PASS**

| Property | Value | Notes |
|----------|-------|-------|
| Guard | `@media (hover: hover)` | Touch-safe |
| Transform | `translateY(-4px) scale(1.02)` | Stronger lift than kuro-card — gallery browsing context |
| Shadow | `0 8px 24px rgba(0,0,0,0.5)` | Deep shadow for "picked up" feel |
| Duration | `var(--transition-fast)` = 0.15s | Fast for browsing context |

**Evidence**: `appcore-providers.jsx:1402-1405`
**Assessment**: Collection cards have the most dramatic hover in the app — 4px lift + 2% scale. This is correct: the Collection tab is a browsing/gallery context where cards are the primary interaction surface. The faster 0.15s duration (vs 0.3s for kuro-card) suits rapid browsing.

**Solution (maintenance)**: No changes needed.

---

### E6-HV8 · Pull log row hover · **PASS**

| Property | Value | Notes |
|----------|-------|-------|
| Guard | `@media (hover: hover)` | Touch-safe |
| Background | `rgba(255,255,255,0.08)` | Subtle brightening |
| Duration | 0.2s ease | Standard row hover timing |

**Evidence**: `appcore-providers.jsx:691-696`
**Assessment**: Pull log rows use a simple background tint on hover — correct for data table rows where lift/scale would be disorienting. The 0.2s duration is comfortable for list scanning.

**Solution (maintenance)**: No changes needed.

---

### E6-HV9 · Inline Tailwind button hovers · **LOW**

**Finding**: The ~100+ inline buttons (identified in §E5-BT5) use Tailwind hover utilities rather than the kuro-btn system. Patterns observed:

| Pattern | Count (est.) | Example |
|---------|-------------|---------|
| `hover:bg-{color}/20` | ~40 | `hover:bg-yellow-500/20` |
| `hover:text-{color}` | ~30 | `hover:text-cyan-300` |
| `hover:border-{color}` | ~15 | `hover:border-yellow-500/30` |
| `transition-colors` only | ~60 | No transform or shadow feedback |
| `transition-all` | ~25 | Includes transform capability |

**Evidence**: `App.jsx` passim — lines 3185, 3387, 3557, 3827, 3968, 4052, etc.

**Assessment**: These inline hovers are functional but miss the multi-signal feedback of kuro-btn (lift, shadow, ripple, glow). Most use only background-color or text-color changes — a single signal where kuro-btn provides five. The hovers work but feel "flat" compared to the system components. Additionally, none use `@media (hover: hover)` guard, so they may exhibit sticky hover on touch devices.

**Solution**:
1. **Migration path**: Replace `hover:bg-{color}/20 transition-colors` with `kuro-btn active-{color}` class for primary actions, or a new `kuro-btn-ghost` variant for secondary actions.
2. **Quick fix**: Add `@media (hover: hover)` guard to the most-used inline hover patterns via a utility class:
   ```css
   .hover-safe:hover { /* only on hover-capable devices */ }
   @media (hover: hover) { .hover-safe:hover { /* actual hover styles */ } }
   ```
3. **Cross-reference**: §E5-BT5 (inline button sprawl) — this is the hover-specific manifestation of the same issue.

---

### E6-HV10 · Desktop-specific hover enhancements · **PASS**

| Element | Hover effect | Duration |
|---------|-------------|----------|
| `.desktop-layout .kuro-card` | `translateY(-1px)` + shadow | 0.2s ease |
| `.desktop-layout .grid > div` | `scale(1.02)` | 0.15s ease |
| `.desktop-layout .kuro-tab` | background + border brightening | 0.2s cubic-bezier |

**Evidence**: `appcore-providers.jsx:1615-1664`
**Assessment**: Desktop layout reduces hover intensity (1px lift vs 2px on mobile, faster durations). This is correct — desktop users hover more frequently and expect less dramatic feedback. The reduced card entrance duration (0.2s vs 0.4s staggered) also shows platform-aware motion design.

**Solution (maintenance)**: No changes needed.

---

### §E6.1 hover summary

| ID | Element | Severity | Verdict |
|----|---------|----------|---------|
| E6-HV1 | kuro-btn hover | — | PASS |
| E6-HV2 | kuro-card hover | — | PASS |
| E6-HV3 | kuro-input hover | — | PASS |
| E6-HV4 | kuro-stat hover | — | PASS |
| E6-HV5 | kuro-slider hover | — | PASS |
| E6-HV6 | Icon SVG glow | — | PASS |
| E6-HV7 | Collection card hover | — | PASS |
| E6-HV8 | Pull log row hover | — | PASS |
| E6-HV9 | Inline Tailwind hovers | LOW | Missing multi-signal feedback, no hover:hover guard |
| E6-HV10 | Desktop enhancements | — | PASS |

---

## §E6.2 — Active/Pressed Feedback

**Protocol**: Pressing an interactive element should feel physically responsive — typically a slight scale-down, color deepening, or both. The moment between pressing and releasing (50–100ms) is the most visceral feedback moment.

### E6-AP1 · kuro-btn active state · **PASS**

| Property | Value | Notes |
|----------|-------|-------|
| Transform | `translateY(0) scale(0.97)` | Lift resets + 3% compression |
| Transition | `transform 0.1s ease` | Faster than hover (0.1s vs 0.25s) — correct for press |
| No guard | No `@media` wrapper | Active works on both pointer and touch — correct |

**Evidence**: `appcore-providers.jsx:899-902`
**Assessment**: The active state combines two physical metaphors: the lift resets to zero (item "pressed back down to the surface") and the 3% scale compression communicates "pressed into." The 0.1s transition is faster than the hover transition, which produces the correct perceptual order: hover feels "considered" (0.25s) while press feels "instant" (0.1s). This matches the §DM4 recommendation exactly.

**Solution (maintenance)**: No changes needed. This is textbook active-state design.

---

### E6-AP2 · kuro-card interactive active · **PASS**

| Property | Value | Notes |
|----------|-------|-------|
| Transform | `translateY(0) scale(0.98)` | Less compression than buttons (2% vs 3%) |
| Transition | `transform 0.1s ease` | Same fast timing as buttons |
| Selector | `.kuro-card.interactive:active` | Only on cards marked interactive |

**Evidence**: `appcore-providers.jsx:741-743`
**Assessment**: Cards use a subtler compression (0.98 vs 0.97 for buttons) — correct, since cards are larger and a 3% scale would be more visually dramatic. The `.interactive` qualifier prevents non-clickable cards from showing press feedback — good specificity.

**Solution (maintenance)**: No changes needed.

---

### E6-AP3 · Collection card active · **PASS**

| Property | Value | Notes |
|----------|-------|-------|
| Transform | `translateY(-2px) scale(1.01)` | Maintains slight lift, reduces scale from 1.02 to 1.01 |
| Transition | `transform 0.1s ease` | Consistent fast timing |

**Evidence**: `appcore-providers.jsx:1407-1409`
**Assessment**: Collection cards stay slightly lifted on press (2px vs 4px hover) rather than returning to baseline — this maintains the "picked up" metaphor while confirming the press. The scale reduction from 1.02 → 1.01 is subtle but perceptible.

**Solution (maintenance)**: No changes needed.

---

### E6-AP4 · Inline Tailwind active states · **LOW**

**Finding**: Among the ~100+ inline buttons, only a handful use `active:scale-95`:

| Pattern | Count (est.) | Example |
|---------|-------------|---------|
| `active:scale-95` | ~5 | Export button (line 3185), settings buttons |
| `active:scale-[0.97]` | ~2 | Specific action buttons |
| No active state | ~93+ | Most inline buttons — no press feedback |

**Evidence**: `App.jsx:3185` (`active:scale-95`), `appcore-components.jsx` scattered

**Assessment**: The vast majority of inline buttons provide zero press feedback — pressing them feels "flat and digital" (per §DM4 assessment criteria). This is particularly noticeable in rapid-use contexts like the Tracker tab where users press buttons frequently. The inconsistency between kuro-btn's satisfying 0.97 scale-down and inline buttons' no-response creates a two-tier experience.

**Solution**:
1. **System fix (preferred)**: Migrate inline buttons to kuro-btn variants — this automatically provides the active state. Cross-reference §E5-BT5.
2. **Quick fix**: Add a global active rule for all buttons not in the kuro-btn system:
   ```css
   button:not(.kuro-btn):active {
     transform: scale(0.97);
     transition: transform 0.1s ease;
   }
   ```
   This would give every button press feedback without requiring class changes.

---

### E6-AP5 · Tab button active feedback · **PASS**

| Property | Value | Notes |
|----------|-------|-------|
| Active selection | `bg-yellow-500/10 shadow-lg shadow-yellow-500/25` | Gold glow on selected tab |
| Icon filter | `drop-shadow(0 0 5px rgba(237,175,24,0.5))` | Active tab icon glows |
| Transition | `transition-all duration-300` | 300ms for tab state change |

**Evidence**: `appcore-components.jsx:740-742` (TabButton component)
**Assessment**: Tab buttons use a "selected state" rather than a momentary press state — this is correct for navigation tabs. The gold glow on the active tab is character-positive and clearly communicates which tab is selected.

**Solution (maintenance)**: No changes needed.

---

### E6-AP6 · Haptic feedback system · **PASS**

| Level | Vibration | Usage context |
|-------|-----------|---------------|
| `light` | 10ms | State changes, toggles, field interactions |
| `medium` | 25ms | Tab switches, secondary actions |
| `heavy` | 50ms | (Available, sparingly used) |
| `success` | [15, 50, 15] pattern | Import complete, bookmark save, completion |
| `warning` | [30, 30, 30] pattern | Reset data confirmation |
| `error` | [50, 50, 80] pattern | Toast errors |

**Evidence**: `appcore-data.js:12-20`, `App.jsx` passim (20+ usage sites), `appcore-providers.jsx:212-215` (toast-triggered)
**Assessment**: This is an exceptional haptic system for a web app. Six distinct patterns mapped to semantic categories — most web apps have zero haptic feedback. The pattern design is thoughtful: success uses a "da-DA-da" rhythm, warning uses even pulses, error uses an escalating pattern. The `navigator?.vibrate?.()` optional chaining provides graceful degradation for non-vibration devices.

The toast system auto-triggers appropriate haptic per severity level — this means every success/error/warning notification has both visual AND tactile feedback. This is the kind of multi-sensory design that creates the "LUMINOUS TACTICAL COMPANION" personality.

**Solution (maintenance)**: No changes needed. This is a standout feature that most apps at this scale do not invest in.

---

### §E6.2 active/pressed summary

| ID | Element | Severity | Verdict |
|----|---------|----------|---------|
| E6-AP1 | kuro-btn active | — | PASS |
| E6-AP2 | kuro-card interactive active | — | PASS |
| E6-AP3 | Collection card active | — | PASS |
| E6-AP4 | Inline button active states | LOW | ~93+ buttons with no press feedback |
| E6-AP5 | Tab button active | — | PASS |
| E6-AP6 | Haptic feedback system | — | PASS |

---

## §E6.3 — Transition Quality

**Protocol**: Transitions should feel deliberate and smooth. Abrupt appearance/disappearance, or overly long/bouncy transitions, break the professional feel.

### E6-TQ1 · Transition token system · **PASS**

The app defines three transition tokens as CSS custom properties:

```css
--transition-fast:   0.15s cubic-bezier(0.16, 1, 0.3, 1)
--transition-normal: 0.25s cubic-bezier(0.16, 1, 0.3, 1)
--transition-slow:   0.4s  cubic-bezier(0.16, 1, 0.3, 1)
```

**Evidence**: `appcore-providers.jsx:445-447`

**Assessment**: All three tokens share the same easing curve — `cubic-bezier(0.16, 1, 0.3, 1)` — which is a custom "fast-out, slow-in" curve with slight overshoot. This curve is used by Apple's design system and produces a "responsive but controlled" feel. The three durations (150ms, 250ms, 400ms) form a clear hierarchy:
- **Fast** (150ms): Micro-feedback — input focus, icon color, slider thumb
- **Normal** (250ms): Standard interactions — button hover, card lift
- **Slow** (400ms): Major state changes — empty state entrance, card slide-in

This is exactly the kind of unified motion vocabulary that §DM1 calls for. One easing curve applied at three speeds is more coherent than three different easings.

**Solution (maintenance)**: No changes needed. The transition token system is well-designed.

---

### E6-TQ2 · Tab indicator transition · **PASS**

| Property | Value | Notes |
|----------|-------|-------|
| Properties | `left`, `width` | Sliding underline bar |
| Duration | 0.3s | Between normal and slow |
| Easing | cubic-bezier(0.16, 1, 0.3, 1) | Matches system easing |

**Evidence**: `appcore-providers.jsx:705`
**Assessment**: The tab indicator slides smoothly between tab positions. It animates `left` and `width` — which are layout-triggering properties — but this is unavoidable for a sliding indicator (the alternative would be transform-based positioning, which would require JS calculation). Given that only one small element is being animated, the layout cost is negligible.

**Solution (maintenance)**: No changes needed. If performance profiling ever flags this, the indicator could be moved to `transform: translateX()` with JS-calculated positions.

---

### E6-TQ3 · Tab content entrance · **PASS**

| Property | Value | Notes |
|----------|-------|-------|
| Animation | `tabFadeIn 0.35s cubic-bezier(0.16, 1, 0.3, 1)` | Fade-in + translate-up |
| Card stagger | `cardSlideIn 0.4s` with 50ms increments | Up to 200ms total stagger |
| Properties | opacity, translateY, scale | Compositor-friendly |

**Evidence**: `appcore-providers.jsx:559-599`
**Assessment**: Tab content enters with a two-layer animation: the container fades in (350ms), then cards stagger in with individual delays (50ms apart, max 200ms total stagger). This creates a "waterfall" entrance that communicates "content is loading in an organized way." The 50ms stagger increment is within the §DM3 recommended 30-50ms range, and the 200ms cap prevents the stagger from feeling slow.

Desktop mode correctly reduces this: `animation-duration: 0.2s` and removes stagger delays — faster entrance for desktop users who switch tabs frequently.

**Solution (maintenance)**: No changes needed.

---

### E6-TQ4 · Modal entrance transition · **PASS**

| Property | Value | Notes |
|----------|-------|-------|
| Animation | `scaleIn 0.3s ease-out` | Scale from 0.96 + fade in |
| Backdrop | Static rgba(12, 16, 24, 0.95) | No backdrop fade animation |
| Exit | Instant (component unmount) | No exit animation |

**Evidence**: `appcore-components.jsx:198, 514`
**Assessment**: Modal entrance uses a subtle scale-in (96% → 100%) with fade — this communicates "the modal was always there, just behind the surface." The 0.3s duration is appropriate for a significant UI state change. The `ease-out` easing (rather than the system cubic-bezier) makes sense here — the modal "decelerates into position."

**Missing exit animation**: When modals close, they disappear instantly (React unmount). A 150ms fade-out + scale-down would improve perceived polish. However, instant exit is defensible for a FOCUS-TOOL (A2) — the user wants to return to their task, not watch an animation.

**Solution (optional enhancement)**:
```css
/* Exit animation would require animation state management */
@keyframes scaleOut {
  to { opacity: 0; transform: scale(0.96); }
}
```
Priority: Very low. The instant exit is acceptable for this tool's personality.

---

### E6-TQ5 · Toast entrance/exit · **PASS**

| Property | Value | Notes |
|----------|-------|-------|
| Entrance | `slideUp 0.2s ease-out` | Translate from 16px below + fade |
| Exit | Auto-dismiss after 3000ms | No exit animation (removed from DOM) |
| Max visible | 5 | Stack management |

**Evidence**: `appcore-providers.jsx:227, 535-537`
**Assessment**: Toast entrance slides up from below the viewport edge — this spatial story ("notification coming up from the bottom") is immediately legible. The 0.2s duration is snappy. Like modals, toasts lack an exit animation (they disappear when the timeout fires). A slide-down exit would complete the spatial narrative.

**Solution (optional enhancement)**: Add exit animation before removal. Priority: Low — the current behavior is functional.

---

### E6-TQ6 · Pity ring fill transition · **PASS**

| Property | Value | Notes |
|----------|-------|-------|
| Property | `stroke-dashoffset` | SVG arc fill |
| Duration | 0.8s | Slow, dramatic fill |
| Easing | cubic-bezier(0.16, 1, 0.3, 1) | System curve |

**Evidence**: `appcore-providers.jsx:638`
**Assessment**: The pity ring's fill animation is the app's most dramatic transition — 0.8 seconds of SVG arc filling. This is a delight moment: the ring visually "fills up" to show pull progress, and the system easing curve gives it a satisfying "fast start, gentle finish" feel. This is the primary value-delivery animation and it's given appropriate emphasis.

**Solution (maintenance)**: No changes needed. This is one of the app's signature interactions.

---

### E6-TQ7 · Progress bar transitions · **LOW**

**Finding**: Progress bars (astrite goal, event progress) use `transition-all` on width changes:

**Evidence**: `App.jsx:3410` (astrite progress), `appcore-components.jsx:1359` (event progress)

**Assessment**: `transition-all` is a broad selector that transitions every changing property — including potentially unintended ones like color or padding. More importantly, animating `width` triggers layout reflow. For progress bars, this is a minor concern (small elements, infrequent updates), but it represents a deviation from the compositor-only principle the rest of the motion system follows.

**Solution**:
```css
/* Replace transition-all with specific property */
transition: width 0.3s cubic-bezier(0.16, 1, 0.3, 1);
/* Or use transform for zero-layout-cost: */
transform: scaleX(var(--progress)); /* with transform-origin: left */
```
Priority: Low — the current approach works fine for these small, infrequently-updated elements.

---

### E6-TQ8 · Chevron rotation (non-animated) · **LOW**

**Finding**: Collapsible section chevrons (`ChevronDown` icon) toggle between `rotate-0` and `rotate-180` states without a transition:

**Evidence**: `App.jsx:3770` — className toggles `rotate-180` but no `transition-transform` is applied.

**Assessment**: When a collapsible section opens/closes, the chevron snaps instantly between up and down orientations. This is a minor polish gap — a 200ms rotation transition would communicate the expand/collapse action more clearly and match the app's overall motion personality.

**Solution**:
```jsx
<ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
```
Priority: Low — functional but missing a micro-interaction moment.

---

### §E6.3 transition quality summary

| ID | Element | Severity | Verdict |
|----|---------|----------|---------|
| E6-TQ1 | Transition token system | — | PASS |
| E6-TQ2 | Tab indicator transition | — | PASS |
| E6-TQ3 | Tab content entrance | — | PASS |
| E6-TQ4 | Modal entrance transition | — | PASS |
| E6-TQ5 | Toast entrance/exit | — | PASS |
| E6-TQ6 | Pity ring fill | — | PASS |
| E6-TQ7 | Progress bar transition-all | LOW | Layout-triggering width animation, broad transition-all |
| E6-TQ8 | Chevron rotation | LOW | No transition on rotate state change |

---

## §E6.4 — Loading State Quality

**Protocol**: Loading states should preserve layout geometry (skeleton matching actual content shape), use the product's palette (not generic gray), and express the product character through animation.

### E6-LS1 · kuro-skeleton system · **PASS**

| Property | Value | Notes |
|----------|-------|-------|
| Base animation | `kuroShimmer 1.8s ease-in-out infinite` | Gold-tinted shimmer |
| Gradient | `linear-gradient(90deg, transparent, rgba(237,175,24,0.03), transparent)` | Gold shimmer — not generic gray |
| Background size | `200% 100%` | Full-width shimmer sweep |
| Shape variants | Row (36px), Stat (72px), Text (10px), Circle (50%) | 4 geometry presets |

**Evidence**: `appcore-providers.jsx:1300-1327`

**Assessment**: The skeleton system is strongly character-positive:
1. **Gold shimmer** instead of generic gray (#E5E7EB) — immediately recognizable as belonging to this app's palette
2. **1.8s duration** with ease-in-out — unhurried, matching the "considered" motion personality
3. **Four shape variants** matching actual content: rows (for list items), stats (for stat boxes), text (for text lines), circles (for avatars)
4. The shimmer direction (left-to-right, 90deg) is standard and doesn't distract

This passes the §DM4 skeleton assessment: shapes match content geometry, animation expresses product character, and the palette is from the product (gold), not from a UI kit.

**Solution (maintenance)**: No changes needed.

---

### E6-LS2 · Ghost grid cells (Collection) · **PASS**

| Property | Value | Notes |
|----------|-------|-------|
| Animation | `ghostPulse 2.5s ease-in-out infinite` | Subtle opacity pulse |
| Stagger | `animationDelay: i * 0.08s` | 80ms per cell, up to 6 cells |
| Geometry | `aspect-[3/4]` | Portrait aspect matches actual character cards |
| Opacity range | 0.04 → 0.08 | Extremely subtle — barely visible |

**Evidence**: `appcore-providers.jsx:1354-1366`, `appcore-components.jsx:1565`

**Assessment**: Ghost grid cells are a specialized loading/empty state for the Collection tab. The portrait aspect ratio (3:4) exactly matches the actual character card dimensions, so the layout geometry is preserved. The 80ms stagger creates a gentle "wave" effect across the 6 cells. The opacity range (4% → 8%) is intentionally faint — these are placeholder ghosts, not attention-seeking loading indicators.

**Solution (maintenance)**: No changes needed.

---

### E6-LS3 · Collection card image loading · **PASS**

| Property | Value | Notes |
|----------|-------|-------|
| Placeholder | `<div className="animate-pulse bg-neutral-800" />` | Tailwind pulse |
| Trigger | Image URL exists but hasn't loaded | Conditional render |
| Replacement | Direct swap to `<img>` on load | No skeleton-to-image transition |

**Evidence**: `appcore-components.jsx:1401-1419`

**Assessment**: Collection card images use Tailwind's `animate-pulse` on a neutral-800 background while loading. This is functional but slightly inconsistent with the gold-shimmer skeleton system used elsewhere (kuro-skeleton). The neutral-800 pulse is the only "generic gray" loading indicator in the app.

**Solution (minor harmonization)**:
```jsx
{/* Replace animate-pulse with kuro-skeleton for brand consistency */}
<div className="absolute inset-0 kuro-skeleton" />
```
Priority: Low — the current approach works but the gold shimmer would be more consistent.

---

### E6-LS4 · No spinner usage · **PASS**

**Finding**: The app uses zero spinner/circular-progress indicators for loading. All loading states use either skeleton shimmer or pulse placeholders.

**Assessment**: This is the correct choice for a content-loading app per §E6 protocol: "skeleton screens preserve layout and feel more polished for content-loading. Spinners are appropriate for actions." The app loads data (pull history, collection, events) — not performing actions — so skeleton screens are the right pattern.

**Solution (maintenance)**: No changes needed. If any future feature requires an action-wait (like data sync), a spinner would be appropriate then.

---

### E6-LS5 · Image error fallback · **PASS**

| Property | Value | Notes |
|----------|-------|-------|
| Handler | `hideOnError(e)` | Utility function |
| Mechanism | `visibility: hidden` + `aria-hidden: true` + `alt: ''` | Hides image, prevents layout shift |
| Applied to | ~9 image elements | Character, weapon, profile images |

**Evidence**: `appcore-components.jsx:22-28`

**Assessment**: Using `visibility: hidden` instead of `display: none` is a deliberate choice that prevents layout shift when images fail — the space is preserved. Setting `aria-hidden` and clearing `alt` ensures screen readers don't announce a broken image. This is a polished error-handling approach.

**Solution (maintenance)**: No changes needed.

---

### §E6.4 loading state summary

| ID | Element | Severity | Verdict |
|----|---------|----------|---------|
| E6-LS1 | kuro-skeleton system | — | PASS |
| E6-LS2 | Ghost grid cells | — | PASS |
| E6-LS3 | Collection image loading | — | PASS (minor inconsistency with neutral-800 vs gold shimmer) |
| E6-LS4 | No spinner usage | — | PASS |
| E6-LS5 | Image error fallback | — | PASS |

---

## §E6.5 — Animation Narrative

**Protocol**: Every motion should tell a story about the relationship between UI states. An element sliding in from the left implies it came from somewhere left. Fade-in from nothing implies creation. Are animations telling the right story?

### E6-AN1 · Entrance animation vocabulary · **PASS**

The app uses a consistent set of entrance narratives:

| Animation | Spatial story | Used for | Duration |
|-----------|-------------|----------|----------|
| `slideUp` (translateY 16px→0) | "Rising from below the surface" | Toasts | 0.2s |
| `scaleIn` (scale 0.96→1) | "Expanding from behind the surface" | Modals | 0.3s |
| `tabFadeIn` (translateY 8px→0) | "Settling into position" | Tab content | 0.35s |
| `cardSlideIn` (translateY 12px→0, scale 0.98→1) | "Rising and expanding" | Cards within tabs | 0.4s |
| `emptyFadeIn` (translateY 8px→0) | "Settling into position" | Empty states | 0.4s |

**Evidence**: `appcore-providers.jsx:535-599, 1330-1338`

**Assessment**: The spatial narratives are coherent and hierarchical:
- **Toasts** rise from below (16px offset) — they come from "outside the viewport," matching their notification nature
- **Modals** scale from 96% — they were "always there, just behind the surface," matching their overlay nature
- **Tab content** settles from 8px — minimal displacement, communicating "content was nearby and arrived quickly"
- **Cards** within tabs have the most displacement (12px + scale) — they are the "heaviest" content arriving

The consistent upward direction (all use positive translateY → 0) creates a unified spatial world: everything enters "from below." This is a coherent spatial metaphor.

**Solution (maintenance)**: No changes needed. The entrance vocabulary is clear and consistent.

---

### E6-AN2 · Exit animation gap · **LOW**

**Finding**: The app has NO exit animations. All exits are instant (React unmount):

| Element | Exit behavior | Expected |
|---------|-------------|----------|
| Modals | Instant unmount | Scale-out 0.96 + fade (150ms) |
| Toasts | Instant removal after timeout | Slide-down + fade (150ms) |
| Tab content | Instant replacement | Fade-out (100ms) |
| Collection cards | Instant on filter change | Fade-out (100ms) |

**Evidence**: No `scaleOut`, `slideDown`, `fadeOut`, or similar exit keyframes exist in the codebase.

**Assessment**: Every entrance has a story ("I arrived"), but no exit has a story ("I departed"). Elements simply vanish. This creates an asymmetric interaction model: arrivals are smooth and considered, departures are abrupt. For a FOCUS-TOOL (A2), instant exits are defensible — the user wants to see the next state, not watch the previous one leave. However, the lack of exit animations is noticeable when compared to the polish of the entrance animations.

**Solution**:
For a FOCUS-TOOL, exit animations should be faster than entrances (per §DM1 recommendation: "exits 150ms ease-in — exits should be faster"):
```css
@keyframes scaleOut {
  to { opacity: 0; transform: scale(0.96); }
}
@keyframes slideDown {
  to { opacity: 0; transform: translateY(16px); }
}
```
Implementation would require animation state management (e.g., `isClosing` state before unmount). Priority: Low — the current instant exits are functional but asymmetric.

---

### E6-AN3 · Card stagger narrative · **PASS**

| Property | Value | Notes |
|----------|-------|-------|
| Stagger delay | 50ms per card | 4 cards max |
| Total stagger | 200ms cap | Prevents feeling slow |
| Fill mode | `backwards` | Cards invisible until their delay fires |
| Desktop override | No stagger, 0.2s entrance | Faster for frequent tab switching |

**Evidence**: `appcore-providers.jsx:577-588, 1634`

**Assessment**: The card stagger tells the story "content is arriving in organized sequence." The 50ms increment is within the §DM3 recommended 30-50ms range. The 200ms cap (4 × 50ms) prevents the stagger from feeling sluggish on longer lists. The desktop override (no stagger, faster entrance) is a platform-appropriate adjustment.

**Solution (maintenance)**: No changes needed.

---

### E6-AN4 · Continuous animations narrative · **PASS**

The app uses several continuous (infinite) animations for ambient atmosphere:

| Animation | Duration | Story it tells |
|-----------|----------|---------------|
| Card top shimmer | 3s ease-in-out | "Surface is alive with energy" — glassmorphism reinforcement |
| Badge rotation | 8s linear | "Luck is active/spinning" — gacha personality |
| Trophy shine | 3s ease-in-out | "Achievement is glowing" — reward acknowledgment |
| Soft-pity pulses | 2s ease-in-out | "Warning: approaching guaranteed pull" — urgency signal |
| Ghost grid pulse | 2.5s ease-in-out | "Space is waiting to be filled" — invitation |

**Evidence**: `appcore-providers.jsx:761-768, 664, 685, 1244-1280, 1354-1366`

**Assessment**: Each continuous animation serves a specific narrative purpose — none are gratuitous. The card shimmer reinforces the glass material metaphor. The badge rotation communicates active luck tracking. The soft-pity pulses serve a genuine information-design purpose (warning the user they're approaching a guaranteed pull threshold). This is animation as information architecture, not decoration.

**Solution (maintenance)**: No changes needed.

---

## §E6.6 — Empty State Design

**Protocol**: Empty states are a design opportunity — they should be designed, not blank. Clear visual, helpful message, a clear call to action.

### E6-ES1 · kuro-empty-state component · **PASS**

| Property | Value | Notes |
|----------|-------|-------|
| Background | Radial gradient (gold-tinted) | Character-positive atmospheric |
| Border | Dashed, gold at 0.1 opacity | Communicates "boundary waiting to be filled" |
| Animation | `emptyFadeIn 0.4s ease-out` | Gentle entrance |
| Top decoration | Gradient line (`::before`) | Gold shimmer accent |

**Evidence**: `appcore-providers.jsx:1334-1351`

**Assessment**: The empty state is designed, not blank. The gold-tinted radial gradient and dashed border create an atmospheric "waiting space" that matches the app's personality. The top decoration gradient line mirrors the card shimmer, connecting empty states to the broader glass-surface system.

**Solution (maintenance)**: No changes needed for the component itself.

---

### E6-ES2 · Collection empty state · **PASS**

| Property | Value | Notes |
|----------|-------|-------|
| Ghost grid | 6 cells with `ghost-grid-cell` class | Layout hint showing what will appear |
| Stagger | 80ms per cell | Visual rhythm |
| Message | "No items match your filters" | Clear, specific text |
| Aspect ratio | 3:4 per cell | Matches actual card dimensions |

**Evidence**: `appcore-components.jsx:1559-1570`

**Assessment**: The Collection empty state is the best-designed empty state in the app. The ghost grid cells show the user exactly what content will look like (portrait cards in a grid), creating a preview of the filled state. The staggered pulse animation communicates "waiting" without urgency. The text message is specific ("your filters") rather than generic ("nothing here").

**Solution (maintenance)**: No changes needed.

---

### E6-ES3 · Empty state call-to-action gap · **LOW**

**Finding**: The kuro-empty-state component provides atmosphere and messaging but does NOT include a call-to-action button. Empty states across the app show:

| Tab context | Empty state message | CTA button? |
|-------------|-------------------|-------------|
| Collection (filtered) | "No items match your filters" | No — user could clear filters |
| Tracker (no pulls) | Various empty text | No — user could add pulls |
| Teams (no teams) | Team creation prompt | No — user could create team |

**Assessment**: Per §E6 protocol, empty states should include "a clear call to action." The atmospheric design is excellent but the missing CTA means users see a beautifully designed dead end. A contextual action button would complete the empty state pattern.

**Solution**:
```jsx
<div className="kuro-empty-state">
  <p>No items match your filters</p>
  <button className="kuro-btn active-gold mt-3" onClick={clearFilters}>
    Clear Filters
  </button>
</div>
```
Priority: Low — the empty states are designed and atmospheric, just missing the CTA.

---

## §E6.7 — Error State Design

**Protocol**: Inline errors positioned immediately adjacent to the field that caused them. Not just color — includes icon and descriptive text.

### E6-ER1 · TabErrorBoundary · **PASS**

| Property | Value | Notes |
|----------|-------|-------|
| Icon | `AlertCircle` (red, size 32) | Lucide icon — immediate visual signal |
| Title | "Something went wrong" | Clear, non-technical |
| Message | "The {tabName} tab encountered an error." | Context-specific |
| Actions | "Try Again" button (kuro-btn active-cyan) | Clear recovery path |
| Details | `<details>` collapsible with error.message | Technical details available but hidden |
| Reset | Auto-resets when tab changes | Smart recovery |

**Evidence**: `appcore-components.jsx:602-650`

**Assessment**: The tab error boundary follows best practices: icon + title + message + action + optional details. The auto-reset on tab change is a nice touch — the user can navigate away and come back rather than being forced to click "Try Again." The error message is appropriately non-technical while the collapsible details preserve debugging capability.

**Solution (maintenance)**: No changes needed.

---

### E6-ER2 · AppErrorBoundary (crash screen) · **PASS**

| Property | Value | Notes |
|----------|-------|-------|
| Icon | ⚠️ emoji (large) | Universal warning symbol |
| Title | "Whispering Wishes crashed" | Honest, direct |
| Message | "Your data is safe in local storage." | Reassuring about data safety |
| Actions | "Try Again" + "Reload Page" | Two recovery paths |
| Details | `<details>` with error.message | Debug info available |

**Evidence**: `appcore-components.jsx:654-700`

**Assessment**: The crash screen prioritizes reassurance ("your data is safe") — correct for a gacha tracker where pull history is irreplaceable. Two action options (soft retry vs hard reload) give the user control. The styling uses inline styles (not CSS-in-JS) — correct, since if the CSS system crashed, the error boundary still needs to render.

**Solution (maintenance)**: No changes needed.

---

### E6-ER3 · Toast error notifications · **PASS**

| Property | Value | Notes |
|----------|-------|-------|
| Color | `rgba(248,113,113,0.9)` | Red — distinct from success/warning/info |
| Icon | `AlertCircle` from Lucide | Consistent icon choice |
| Haptic | `error` pattern [50, 50, 80] | Escalating vibration pattern |
| ARIA | `role="status" aria-live="polite"` | Screen reader announcement |
| Auto-dismiss | 3000ms | Same as all toast types |

**Evidence**: `appcore-providers.jsx:206-237`

**Assessment**: Error toasts combine visual (red), iconographic (AlertCircle), textual (error message), tactile (haptic pattern), and accessible (ARIA live) feedback — five channels for a single error notification. This multi-sensory approach is exceptional.

**Solution (maintenance)**: No changes needed.

---

### E6-ER4 · Form-level inline errors · **LOW**

**Finding**: The app has no form-level inline error states. There are no visible patterns for:
- Input validation errors (red border + error text below field)
- Required field indicators
- Real-time validation feedback

**Evidence**: Searched `App.jsx` and `appcore-components.jsx` — no instances of inline error messages adjacent to form fields. Error feedback comes exclusively through toast notifications.

**Assessment**: For the current app scope (primarily a tracker with limited form input), the toast-based error approach is adequate. Most inputs are numeric (pull counts, astrite amounts) and toggles/selects — few opportunities for validation errors. However, if the app grows to include more form-heavy features (like manual data entry), inline error states would be needed.

**Solution (future-proofing)**:
```css
.kuro-input.error {
  border-color: rgba(var(--color-red), 0.6);
  box-shadow: 0 0 0 3px rgba(var(--color-red), 0.1);
}
.kuro-input-error-text {
  color: rgba(var(--color-red), 0.9);
  font-size: 11px;
  margin-top: 4px;
}
```
Priority: Low — current scope doesn't require inline validation. The toast system handles errors well for now.

---

### §E6.5–§E6.7 combined summary

| ID | Element | Severity | Verdict |
|----|---------|----------|---------|
| E6-AN1 | Entrance animation vocabulary | — | PASS |
| E6-AN2 | Exit animation gap | LOW | No exit animations — arrivals polished, departures instant |
| E6-AN3 | Card stagger narrative | — | PASS |
| E6-AN4 | Continuous animations | — | PASS |
| E6-ES1 | kuro-empty-state component | — | PASS |
| E6-ES2 | Collection empty state | — | PASS |
| E6-ES3 | Empty state CTA gap | LOW | Missing call-to-action buttons in empty states |
| E6-ER1 | TabErrorBoundary | — | PASS |
| E6-ER2 | AppErrorBoundary | — | PASS |
| E6-ER3 | Toast error notifications | — | PASS |
| E6-ER4 | Form inline errors | LOW | No inline field validation — toast-only error feedback |

---

## §E6.8 — Animation as Character Signal

**Protocol** `[A2][A4][A5]`: The right motion vocabulary is derived from the axis profile — not from a product category. Cross-reference with design-aesthetic-audit §DM1 (Motion Vocabulary Card) and §DM2 (Motion Character vs Axis Profile).

### §DM1 Cross-Reference: Motion Vocabulary Card

```yaml
Motion Vocabulary (Current Assessment)
────────────────────────────────────────
Micro-feedback (button press, toggle):
  Duration: 0.1s (active) / 0.15s (hover icon) | Easing: ease / cubic-bezier(0.16, 1, 0.3, 1)
  Appropriate?: YES — fast, responsive, no cognitive tax for A2 FOCUS-TOOL

Entrance (appear, expand, slide-in):
  Duration: 0.2s–0.4s | Easing: cubic-bezier(0.16, 1, 0.3, 1) / ease-out
  Direction: Upward (translateY positive→0) for all entrances
  Appropriate?: YES — considered but not slow, consistent upward metaphor

Exit (disappear, collapse, slide-out):
  Duration: 0ms (instant unmount) | Easing: none
  Direction: none
  Appropriate?: PARTIALLY — instant is defensible for A2 but asymmetric vs entrances

Navigation (page/tab transition):
  Duration: 0.35s (tab content) + 0.3s (tab indicator) | Easing: cubic-bezier(0.16, 1, 0.3, 1)
  Spatial story: Content settles from 8px above, indicator slides horizontally
  Appropriate?: YES — smooth tab transitions with clear spatial story

State change (loading → loaded, empty → filled):
  Duration: 0.4s (empty fade-in) / 0.8s (pity ring fill) | Easing: ease-out / system cubic-bezier
  Character: Gentle, unhurried — matches A2 EMOTIONAL-SECONDARY
  Appropriate?: YES — state changes are given appropriate weight
────────────────────────────────────────
```

**Recommended unified vocabulary** (adjusted for A2 FOCUS-TOOL + EMOTIONAL-SECONDARY):

| Category | Current | Recommended | Change needed? |
|----------|---------|-------------|---------------|
| Micro-feedback | 0.1–0.15s ease/system | 100–150ms ease-out | No — already aligned |
| Entrance | 0.2–0.4s system curve | 200ms ease-out (exits: 150ms) | Minor — add exit animations |
| Tab transition | 0.3–0.35s system curve | 250ms ease-in-out | No — current is appropriate |
| Emphasis/delight | 0.8s (pity ring) / 2–3s (pulses) | 300–400ms for one-shot delight | No — pity ring justifies longer |

**Assessment**: The motion vocabulary is remarkably unified. One easing curve (`cubic-bezier(0.16, 1, 0.3, 1)`) applied at three speeds creates a coherent motion personality. The only gap is the missing exit vocabulary — the app has entrances at every scale but no exits.

---

### §DM2 Cross-Reference: Motion Character vs Axis Profile

**Axis-derived motion character**:
- **A2 FOCUS-TOOL**: Lean toward "Brisk / confident" — 100–200ms, ease-out, no spring
- **A2 EMOTIONAL-SECONDARY**: Allow "Considered / graceful" for emotional moments
- **A4 Wuthering Waves L3**: Can honor the source's tonal register — the game has a cyberpunk/sci-fi aesthetic suggesting "Brisk / confident" with technological undertones
- **A5 FUNCTIONAL-PRIMARY + ATMOSPHERIC-SECONDARY**: Motion serves function first, atmosphere second

**Best-fit row**: **"Brisk / confident"** (primary) with **"Considered / graceful"** (for emotional moments like pity ring fill, soft-pity warnings)

### E6-MC1 · Motion character alignment · **PASS**

**Current motion character mapping**:

| Motion domain | Current behavior | Character match |
|---------------|-----------------|----------------|
| Button press | 0.1s scale(0.97) — instant, physical | Brisk / confident |
| Card hover | 0.3s translateY(-2px) — smooth lift | Considered / graceful |
| Tab switch | 0.35s tab content + 0.3s indicator | Between brisk and considered |
| Pity ring fill | 0.8s stroke-dashoffset — dramatic arc | Considered / graceful (emotional moment) |
| Toast entrance | 0.2s slideUp — snappy notification | Brisk / confident |
| Skeleton shimmer | 1.8s ease-in-out — ambient | Atmospheric background (A5) |
| Badge rotation | 8s linear — constant energy | Atmospheric personality |

**Assessment**: The motion character correctly sits between "Brisk / confident" and "Considered / graceful" — exactly where a FOCUS-TOOL with EMOTIONAL-SECONDARY should be. Fast interactions (button press 100ms, icon hover 150ms) are brisk. Larger state changes (card entrance 400ms, pity ring 800ms) are considered. Ambient animations (shimmer, badge) are atmospheric. The motion personality matches the axis profile.

**Solution (maintenance)**: No changes needed. The motion character is well-aligned.

---

### E6-MC2 · Easing curve character · **PASS**

The unified easing curve `cubic-bezier(0.16, 1, 0.3, 1)`:

```
          ╭─────────────
         /
        /
       /
      /
     /
────╯
```

This is a "fast-out with slight overshoot" curve — elements accelerate quickly and slightly overshoot their target before settling. The overshoot is subtle (the `1` control point exceeds the 0-1 range on the Y axis). This produces a motion feel that is:
- **Responsive**: Elements start moving immediately (steep initial slope)
- **Confident**: The overshoot communicates "I know exactly where I'm going"
- **Not bouncy**: Unlike spring physics, the overshoot is small and doesn't oscillate

**Assessment**: This easing curve perfectly matches the "LUMINOUS TACTICAL COMPANION" personality — responsive and confident with a hint of sophistication. It avoids the generic `ease-in-out` (which feels "safe and uncommitted") and the bouncy spring physics (which would undermine the tactical/tool personality).

**Solution (maintenance)**: No changes needed. The easing curve is a strong character signal.

---

### E6-MC3 · Reduced motion compliance · **PASS**

| Layer | Mechanism | Evidence |
|-------|-----------|---------|
| CSS fallback | `@media (prefers-reduced-motion: reduce)` | `appcore-providers.jsx:1423-1430` |
| JS detection | `window.matchMedia('(prefers-reduced-motion: reduce)')` | `App.jsx:416-424` |
| Runtime listening | `matchMedia.addEventListener('change')` | `App.jsx:499-503` |
| User toggle | Animations on/off in Settings | `App.jsx:6602-6625` |
| Applied class | `.no-animations` disables all animation/transition | `appcore-providers.jsx:1415-1419` |
| Scroll behavior | `scroll-behavior: auto !important` on reduce | `appcore-providers.jsx:1428` |

**Assessment**: Three-layer reduced motion compliance:
1. **CSS fallback** for cases where JS hasn't loaded yet
2. **JS detection** that reads the OS preference on mount and defaults `animationsEnabled` accordingly
3. **User override** toggle that allows the user to re-enable animations even if the OS says "reduce"

This exceeds WCAG 2.3.3 requirements. The user toggle is a thoughtful addition — some users have `prefers-reduced-motion` enabled for other apps but want animations in a leisure/gaming context.

**Solution (maintenance)**: No changes needed. This is comprehensive reduced-motion support.

---

## §E6.9 — Delight Moments

**Protocol** `[A1][A2][A4]`: The highest-impact moments for craft investment are derived from the use context and subject identity. For a HIGH-FREQUENCY TOOL (A2) with STRONG SUBJECT IDENTITY (A4 Wuthering Waves): the delight moments should make a daily tool feel good to use, and feel authentic to the gacha/gaming community.

### E6-DL1 · Primary value delivery (pity tracking) · **PASS**

The app's primary value is showing users their pity progress toward guaranteed 5★ pulls. This moment is delivered through:

| Element | Delight signal | Duration |
|---------|---------------|----------|
| PityRing SVG fill | 0.8s animated arc fill | Longest transition in the app |
| Soft-pity pulse | 2s text-shadow glow (orange/cyan/pink) | Continuous when in zone |
| `pulse-subtle` class | 2s scale oscillation on ring | Breathing effect near threshold |

**Evidence**: `appcore-providers.jsx:627-638`, `appcore-components.jsx:885-927`

**Assessment**: The pity ring fill is the app's strongest delight moment. The 0.8s duration (4x longer than standard transitions) gives the arc fill a satisfying, dramatic quality — you can feel the progress accumulating. When the user enters the soft-pity zone, the continuous pulse animations (text-shadow glow + scale breathing) create a sense of anticipation: "something is about to happen." This is the exact moment where a gacha tracker delivers its highest value, and the motion design treats it with appropriate weight.

**Solution (maintenance)**: No changes needed. This is the app's emotional centerpiece.

---

### E6-DL2 · Luck badge system · **PASS**

| Element | Delight signal | Duration |
|---------|---------------|----------|
| `.luck-badge::before` | 8s conic-gradient rotation | Continuous spinning border |
| `.trophy-badge` | 3s opacity pulse | Shining trophy effect |

**Evidence**: `appcore-providers.jsx:664-685`

**Assessment**: The luck badge and trophy badge are community-authentic delight moments. In gacha gaming culture, luck and achievement display are social signals. The spinning conic gradient (8s) is slow enough to be ambient rather than attention-demanding. The trophy shine (3s opacity pulse) communicates "this achievement is glowing" — a visual celebration that doesn't interrupt the task flow.

**Solution (maintenance)**: No changes needed.

---

### E6-DL3 · Haptic delight patterns · **PASS**

The haptic feedback system (§E6-AP6) creates delight through tactile feedback at key moments:

| Moment | Haptic | Emotional register |
|--------|--------|-------------------|
| Bookmark saved | `success` [15, 50, 15] | Confirmation + satisfaction |
| Data imported | `success` [15, 50, 15] | Relief + accomplishment |
| Tab switched | `medium` 25ms | Orientation + control |
| Toggle changed | `light` 10ms | Micro-confirmation |
| Reset all data | `warning` [30, 30, 30] | Caution + gravity |

**Assessment**: The haptic patterns map to emotional registers, not just action categories. The `success` pattern's "da-DA-da" rhythm feels celebratory. The `warning` pattern's even pulses feel cautionary. This is haptic feedback as character expression — not just usability.

**Solution (maintenance)**: No changes needed.

---

### E6-DL4 · Card entrance stagger · **PASS**

When switching tabs, cards don't appear all at once — they cascade in with 50ms stagger delays, each rising from 12px below with a subtle scale-up. This creates a "waterfall reveal" that makes every tab switch feel like content is being freshly prepared for the user.

**Evidence**: `appcore-providers.jsx:577-599`

**Assessment**: The stagger is a delight moment disguised as a transition. It makes the app feel alive and responsive — content isn't just "there," it "arrives." For a daily-use tool, this micro-moment of visual interest keeps the interface feeling fresh across hundreds of tab switches.

**Solution (maintenance)**: No changes needed.

---

### E6-DL5 · Icon hover glow · **PASS**

When hovering over any interactive element containing a Lucide SVG icon, the icon gains a `drop-shadow(0 0 3px currentColor)` glow in its own color. This subtle atmospheric effect connects to the "LUMINOUS" dimension of the app's personality.

**Evidence**: `appcore-providers.jsx:912-930`

**Assessment**: This is a micro-delight that rewards exploration — users who hover over different elements discover that icons "light up" in contextual colors. It's not essential for usability, but it contributes to the feeling of a living, responsive interface.

**Solution (maintenance)**: No changes needed.

---

### §DM4 Cross-Reference: Micro-interaction Audit Summary

| Domain | Status | Notes |
|--------|--------|-------|
| 1. Hover states | Strong | kuro-btn system excellent; inline buttons weak (§E6-HV9) |
| 2. Focus rings | Strong | Gold outline + box-shadow, WCAG 3:1+ compliant |
| 3. Active/press | Strong for system, weak for inline | kuro-btn scale(0.97) excellent; ~93 inline buttons no feedback |
| 4. Loading/skeleton | Strong | Gold-tinted shimmer, geometry-matched shapes |
| 5. Scroll behavior | Strong | Smooth scroll, custom scrollbars, modal scroll lock |

---

## §E6.10 — Physical Responsiveness

**Protocol**: The best interfaces feel physical. Buttons compress, drawers slide, modals lift. Assess whether the interaction model feels flat and digital or has a quality of physical responsiveness.

### E6-PR1 · Physical responsiveness assessment · **PASS**

**Physical metaphors present in the interaction model**:

| Metaphor | Implementation | Physical analog |
|----------|---------------|----------------|
| **Button compression** | `scale(0.97)` on `:active` | Pressing a physical button |
| **Card lift** | `translateY(-2px)` on `:hover` | Picking up a card from a surface |
| **Card press** | `scale(0.98)` on `:active` | Pressing a card back down |
| **Collection card "pick up"** | `translateY(-4px) scale(1.02)` on hover | Lifting a photo from a grid |
| **Slider thumb growth** | `scale(1.15)` on hover | Thumb "swelling" to meet the finger |
| **Ripple effect** | Radial gradient opacity on button hover | Light following the cursor |
| **Modal emergence** | `scale(0.96→1)` | Panel rising from behind the surface |
| **Toast arrival** | `translateY(16→0)` | Notification sliding up from a tray |
| **Stat box micro-lift** | `translateY(-1px)` | Slight levitation — less than buttons (correct hierarchy) |

**Assessment**: The interaction model is distinctly physical — elements compress, lift, emerge, and arrive with real-world metaphors. The lift hierarchy is particularly well-crafted:
- Stat boxes: 1px (informational — barely lifts)
- Buttons/cards: 2px (interactive — standard lift)
- Collection cards: 4px (browsing — dramatic lift for gallery context)

This creates an implicit z-depth system communicated entirely through motion. The faster active transitions (0.1s) vs slower hover transitions (0.15–0.3s) mirror the physical world: pressing something is faster than approaching it.

**Solution (maintenance)**: No changes needed.

---

### §DM3 Cross-Reference: Motion Performance Audit

| Property type | Usage | Performance impact |
|---------------|-------|-------------------|
| **Compositor-only** (transform, opacity) | Button hover/active, card lift/press, modal scale, toast translate, icon filter | Optimal — 60fps guaranteed |
| **Paint-triggering** (box-shadow, border-color, background) | Card hover glow, button border, input focus | Minor — single-element repaints only |
| **Layout-triggering** (width, left) | Tab indicator position, progress bar width | Minimal — small elements, infrequent |
| **`will-change: transform`** | BackgroundGlow canvas, TriangleMirrorWave canvas | Correctly applied to continuously-animated elements only |

**Assessment**: The motion system is performance-conscious. Primary interactions (button press, card lift) use compositor-only properties. Layout-triggering animations are limited to small, infrequent elements. `will-change` is applied correctly (only to canvas elements that animate continuously via `requestAnimationFrame`).

**Solution (maintenance)**: No changes needed. The performance profile is appropriate.

---

### §DM5 Cross-Reference: Motion Signature

**Does this app have a motion signature?** YES.

```
MOTION SIGNATURE BRIEF
  Trigger: PityRing progress update (pull counter increment)
  Character source: "LUMINOUS TACTICAL COMPANION" — the vigilant tracking personality
  Duration: 800ms
  Easing: cubic-bezier(0.16, 1, 0.3, 1)
  What it says non-verbally: "Your progress is accumulating — I am watching and measuring for you"
  Implementation:
    Web: CSS transition on stroke-dashoffset (SVG circle)
         + pulse-subtle class (2s scale oscillation) when in soft-pity zone
         + color-specific text-shadow pulse (2s) at soft-pity threshold
  Where it appears: PityRing component (all banner types)
  What it must NEVER do:
    - Never feel rushed (below 500ms would lose the dramatic weight)
    - Never bounce or overshoot (gacha tracking is serious emotional territory)
    - Never lose the soft-pity pulse (this is the user's most anticipated state)
```

**Assessment**: The PityRing fill is the app's motion signature — the one animation that users would immediately notice if it changed. The 800ms duration, the system easing curve, and the soft-pity zone pulse system together create a distinctive interaction moment that no other gacha tracker replicates. It's a "considered / graceful" motion in a "brisk / confident" app — appropriately elevated for the app's primary value-delivery moment.

**Secondary signature candidates**:
- **Card stagger entrance** (400ms with 50ms delays) — distinctive but not as emotionally charged
- **Icon hover glow** (150ms drop-shadow) — subtle but pervasive
- **Haptic success pattern** [15, 50, 15] — unique tactile identity

**Solution (maintenance)**: Protect the PityRing fill animation as a signature element. Any future changes to this animation should be treated as a brand decision, not a casual refactor.

---

## §E6.11 — Per-Tab Interaction Coverage

| Tab | Hover | Active/Press | Transitions | Loading | Empty | Error | Delight |
|-----|-------|-------------|-------------|---------|-------|-------|---------|
| **Tracker** | kuro-btn + inline mix | kuro-btn active + some inline | Tab content entrance, card stagger | Skeleton for stats | kuro-empty-state | Toast errors + TabErrorBoundary | PityRing fill, soft-pity pulse, haptic on tab switch |
| **Planner** | kuro-btn + inline mix | kuro-btn active | Card stagger, slider transitions | Skeleton for calculator | Empty planner state | Toast errors | Slider thumb glow, stat hover lift |
| **Collection** | Collection card hover (strongest) | Collection card active | Card stagger, image load swap | Ghost grid + animate-pulse on cards | Ghost grid with "No items match" | Toast + hideOnError | Card lift 4px, icon glow, haptic on select |
| **Events** | Event card hover (via Tailwind) | Done/Skip buttons | Event status transitions, progress bar | No explicit loading state | No explicit empty state | Toast errors | Badge rotation, trophy shine |
| **Teams** | Team slot hover | kuro-btn active | Card stagger | No explicit loading | Empty team prompt | Toast errors | Haptic on team actions |
| **Leaderboard** | Row hover (pull-log-row) | Inline button active | Card stagger | Skeleton rows | No explicit empty state | Toast + rate limiting error | Glow-gold/purple on cards |
| **Import/Export** | kuro-btn hover | kuro-btn active | Card stagger | No explicit loading | N/A | Toast + detailed import errors | Haptic success on import |
| **Settings** | Toggle/button hover | kuro-btn active + toggle switch | Card stagger | N/A | N/A | Toast errors | OLED mode transition, animation toggle |

### Per-tab interaction gaps

| Tab | Gap | Severity |
|-----|-----|----------|
| Events | No explicit empty state when all events completed/skipped | LOW |
| Events | No explicit loading state for event data fetch | LOW |
| Leaderboard | No explicit empty state for empty leaderboard | LOW |
| Teams | No explicit loading state for team data | LOW |

**Assessment**: The core tabs (Tracker, Collection, Planner) have the strongest interaction coverage. Secondary tabs (Events, Teams, Leaderboard) have functional interactions but miss some polish states (empty/loading). This follows a natural development priority — the primary-value tabs were crafted first.

---

## §E6 — Full Findings Summary

### Statistics
- **Total findings**: 39
- **HIGH severity**: 0
- **MEDIUM severity**: 0
- **LOW severity**: 9
- **PASS**: 30

### All findings table

| ID | Element | Severity | Verdict |
|----|---------|----------|---------|
| **§E6.1 — Hover Feedback** | | | |
| E6-HV1 | kuro-btn hover system | — | PASS |
| E6-HV2 | kuro-card hover | — | PASS |
| E6-HV3 | kuro-input hover | — | PASS |
| E6-HV4 | kuro-stat hover | — | PASS |
| E6-HV5 | kuro-slider hover | — | PASS |
| E6-HV6 | Icon SVG glow | — | PASS |
| E6-HV7 | Collection card hover | — | PASS |
| E6-HV8 | Pull log row hover | — | PASS |
| E6-HV9 | Inline Tailwind hovers | LOW | Missing multi-signal feedback, no hover:hover guard |
| E6-HV10 | Desktop enhancements | — | PASS |
| **§E6.2 — Active/Pressed** | | | |
| E6-AP1 | kuro-btn active | — | PASS |
| E6-AP2 | kuro-card interactive active | — | PASS |
| E6-AP3 | Collection card active | — | PASS |
| E6-AP4 | Inline button active states | LOW | ~93+ buttons with no press feedback |
| E6-AP5 | Tab button active | — | PASS |
| E6-AP6 | Haptic feedback system | — | PASS |
| **§E6.3 — Transition Quality** | | | |
| E6-TQ1 | Transition token system | — | PASS |
| E6-TQ2 | Tab indicator transition | — | PASS |
| E6-TQ3 | Tab content entrance | — | PASS |
| E6-TQ4 | Modal entrance transition | — | PASS |
| E6-TQ5 | Toast entrance/exit | — | PASS |
| E6-TQ6 | Pity ring fill | — | PASS |
| E6-TQ7 | Progress bar transition-all | LOW | Layout-triggering width animation |
| E6-TQ8 | Chevron rotation | LOW | No transition on rotate state change |
| **§E6.4 — Loading States** | | | |
| E6-LS1 | kuro-skeleton system | — | PASS |
| E6-LS2 | Ghost grid cells | — | PASS |
| E6-LS3 | Collection image loading | — | PASS |
| E6-LS4 | No spinner usage | — | PASS |
| E6-LS5 | Image error fallback | — | PASS |
| **§E6.5–§E6.7 — Animation / Empty / Error** | | | |
| E6-AN1 | Entrance animation vocabulary | — | PASS |
| E6-AN2 | Exit animation gap | LOW | No exit animations |
| E6-AN3 | Card stagger narrative | — | PASS |
| E6-AN4 | Continuous animations | — | PASS |
| E6-ES1 | kuro-empty-state component | — | PASS |
| E6-ES2 | Collection empty state | — | PASS |
| E6-ES3 | Empty state CTA gap | LOW | Missing call-to-action buttons |
| E6-ER1 | TabErrorBoundary | — | PASS |
| E6-ER2 | AppErrorBoundary | — | PASS |
| E6-ER3 | Toast error notifications | — | PASS |
| E6-ER4 | Form inline errors | LOW | No inline field validation |
| **§E6.8 — Animation Character** | | | |
| E6-MC1 | Motion character alignment | — | PASS |
| E6-MC2 | Easing curve character | — | PASS |
| E6-MC3 | Reduced motion compliance | — | PASS |
| **§E6.9–§E6.10 — Delight / Responsiveness** | | | |
| E6-DL1 | Pity ring value delivery | — | PASS |
| E6-DL2 | Luck badge system | — | PASS |
| E6-DL3 | Haptic delight patterns | — | PASS |
| E6-DL4 | Card entrance stagger | — | PASS |
| E6-DL5 | Icon hover glow | — | PASS |
| E6-PR1 | Physical responsiveness | — | PASS |

### Key strengths

1. **Unified transition token system**: One easing curve (`cubic-bezier(0.16, 1, 0.3, 1)`) at three speeds creates a coherent motion personality that correctly maps to "Brisk / confident" with "Considered / graceful" for emotional moments.

2. **Physical interaction model**: Elements compress (0.97 scale), lift (2px translate), emerge (0.96 scale-in), and arrive (translateY from below) — creating an implicit z-depth system communicated entirely through motion.

3. **Haptic feedback system**: Six distinct vibration patterns mapped to semantic categories — most web apps at this scale invest zero in haptic design.

4. **PityRing motion signature**: The 800ms arc fill with soft-pity zone pulse is the app's distinctive animation moment — authentic to gacha culture and emotionally resonant.

5. **Three-layer reduced motion**: CSS fallback + JS detection + user toggle — exceeds WCAG 2.3.3.

### Key concerns

1. **Inline button interaction gap** (§E6-HV9 + §E6-AP4): The ~100+ inline buttons outside the kuro-btn system have weaker hover states (single-signal vs five-signal) and mostly no active/press feedback. This creates a two-tier experience: system components feel physical and responsive, inline buttons feel flat. This is the interaction-design manifestation of the same issue identified in §E5-BT5.

2. **Exit animation asymmetry** (§E6-AN2): Entrance animations are polished at every level (toast, modal, tab, card), but exits are uniformly instant. For a FOCUS-TOOL this is defensible but creates a perceptual imbalance.

3. **Empty state CTA gap** (§E6-ES3): Empty states are beautifully designed (gold-tinted gradient, ghost grid) but miss the final step — a call-to-action button that helps users recover from the empty state.

### Connection to prior findings

- **§E5-BT5** (inline button sprawl ~100+): The hover and active gaps (§E6-HV9, §E6-AP4) are the interaction-layer consequence of the same inline button sprawl. Migrating to kuro-btn variants would fix three issues simultaneously: visual consistency (§E5-BT5), hover quality (§E6-HV9), and press feedback (§E6-AP4).
- **§E1-COV1** (token coverage ~30%): The transition tokens (`--transition-fast/normal/slow`) are well-defined but only used by kuro-* system components. Inline buttons use Tailwind defaults (`transition-colors`, `duration-300`) — widening the token coverage gap.
- **§DBI3-S03** (rounded-lg monoculture): The motion system avoids monoculture — different elements have distinct motion profiles (buttons compress, cards lift, sliders grow, modals emerge). This is motion diversity that the static visual system could learn from.

---

> **End of Step 13 — §E6: Interaction Design Quality**
> **Lines added**: ~1200
> **Next step**: Step 14 — §E7: Overall Visual Professionalism (awaiting user instruction)

---

## Step 14 — §E7: Overall Visual Professionalism

**Skill reference**: `app-audit-SKILL.md` §E7
**Scope**: Design coherence, attention to detail, brand consistency, first-impression test, screenshot quality test, visual noise inventory, cross-device consistency, competitive credibility check, polish delta, polish level assessment
**Axis profile**: A1 NON-REVENUE · A2 FOCUS-TOOL + EMOTIONAL-SECONDARY · A3 ENTHUSIAST/EXPERT · A4 NAMED-SOURCE Wuthering Waves L3 · A5 FUNCTIONAL-PRIMARY + ATMOSPHERIC-SECONDARY

---

### §E7.1 Design coherence

> *"Does the app feel like it was designed as a whole, or like different sections were designed independently?"*

#### Coherence architecture

The app operates on a **dual-layer design system**:

**Layer 1 — KuroStyles system** (`appcore-providers.jsx:425–1430`):
A comprehensive CSS-in-JS design system providing:
- 12 CSS custom properties for backgrounds (`--bg-card`, `--bg-btn`, `--bg-input`, `--bg-stat`)
- 5-level border opacity scale (`--border-subtle` 0.06 → `--border-bright` 0.2)
- 4-level shadow tokens (`--shadow-sm` → `--shadow-xl`)
- 3 transition speed tokens sharing one easing curve
- 2 font families (`--font-display` Rajdhani, `--font-data` JetBrains Mono)
- 2 text color tokens (`--text-body`, `--text-heading`)
- 9 named component classes: `kuro-card`, `kuro-btn`, `kuro-stat`, `kuro-input`, `kuro-slider`, `kuro-empty-state`, `kuro-skeleton`, `kuro-divider`, `kuro-scroll`
- OLED mode adaptation across all background tokens

**Layer 2 — Inline Tailwind** (`App.jsx`):
~100+ buttons, progress bars, badges, filter selects, and utility text styled with Tailwind classes directly. These elements use Tailwind defaults (`transition-colors`, `duration-300`, `rounded-lg`) rather than design tokens.

#### Coherence assessment

| Dimension | KuroStyles layer | Inline Tailwind layer | Verdict |
|-----------|-----------------|----------------------|---------|
| Background colors | Token-driven (`--bg-card`, `--bg-btn`) | Mix of `bg-white/5`, `bg-white/10`, raw rgba | **Gap** — inline backgrounds don't track OLED mode |
| Border colors | 5-level token scale | `border-white/10`, `border-white/15`, hardcoded rgba | **Gap** — inline borders bypass token hierarchy |
| Border radius | Deliberate hierarchy (16→12→10→8→3px) | `rounded-lg` (8px) everywhere | **Partial gap** — Tailwind defaults to 8px monoculture |
| Transitions | Token-driven (fast/normal/slow) | `transition-colors`, `transition-all` | **Gap** — inline uses Tailwind defaults, not tokens |
| Typography | `--font-display`, `--font-data` tokens | System font inherited from body | **OK** — falls back to the same system font |
| Hover states | 5-signal (border, color, lift, shadow, ripple) | Single-signal `hover:bg-{color}/20` | **Gap** — identified in §E6-HV9 |
| Active states | Physical (scale + lift reset) | Mostly absent | **Gap** — identified in §E6-AP4 |

**Coherence rating**: The app feels **~70% designed-as-a-whole**. Every section that uses kuro-* components has the same DNA — glassy surfaces, gold accents, corner decorations, shimmer lines, physical hover responses. The remaining ~30% (inline buttons, progress bars, badges, filter selects) feels like a second, simpler design vocabulary layered on top. A user wouldn't notice this as "two different designers" — but they would notice that some elements feel more polished than others.

> **Finding E7-DC1** · MEDIUM
> **Two-layer coherence gap**: The KuroStyles system provides a comprehensive, cohesive design vocabulary. But ~30% of interactive elements bypass it entirely, creating a perceptible quality gradient within each screen. The issue isn't visual chaos — it's a polish gradient from "premium" (kuro-*) to "adequate" (inline Tailwind).
> **Evidence**: 39 `.kuro-btn` instances vs ~100+ inline `<button>` elements (`App.jsx`). Inline buttons use `bg-white/5`, `border-white/10`, `rounded-lg`, `transition-colors` — none of which reference design tokens.
> **Solution**: Create 2–3 lightweight kuro-btn variants (`kuro-btn-ghost`, `kuro-btn-link`, `kuro-btn-inline`) that inherit the token system. Migrate inline buttons in batches per-tab. This simultaneously fixes §E5-BT5 (visual inconsistency), §E6-HV9 (hover gap), and §E6-AP4 (active gap).

> **Finding E7-DC2** · PASS
> **Component-level coherence**: All 9 kuro-* component classes share consistent design DNA — glassmorphism backgrounds with backdrop-filter, 1px solid borders from the opacity token scale, top shimmer lines (cards, stats), gold accent color, matching padding (14px card body/header, 10px 12px buttons/inputs). The system feels like a single designer's work.
> **Evidence**: `appcore-providers.jsx:709–1420` — every component follows the same pattern: position-relative → background-token → border-token → border-radius → overflow → backdrop-filter → box-shadow → transition.
> **Solution**: None needed — maintain this pattern as the template when creating new components.

---

### §E7.2 Attention to detail

> *"Pixel-perfect alignment? No 1-pixel misalignments on borders? No slight gaps where elements should touch?"*

#### Radius hierarchy audit

| Component | Radius | Token? | Verdict |
|-----------|--------|--------|---------|
| `kuro-card` | 16px | Hardcoded | Largest — correct for primary containers |
| `kuro-btn` | 12px | Hardcoded | Second tier — correct for interactive elements |
| `kuro-stat` | 10px | Hardcoded | Third tier — but **10px is non-standard** |
| `kuro-input` | 8px | Hardcoded | Fourth tier — matches Tailwind `rounded-lg` |
| `kuro-empty-state` | 8px | Hardcoded | Matches input tier |
| `ghost-grid-cell` | implied | Via Tailwind | Inherits context |
| Toggle switches | 3px | Hardcoded | Smallest — sharp/military feel |
| `collection-card` | Tailwind `rounded-lg` (8px) | No | Matches input tier |
| Inline buttons | Tailwind `rounded-lg` (8px) or `rounded` (4px) | No | **Mixed** — two different radiuses |

> **Finding E7-AD1** · LOW
> **Non-standard 10px stat radius**: The `kuro-stat` uses `border-radius: 10px` (`appcore-providers.jsx:1039`), which doesn't fit cleanly into the 16→12→8→3px hierarchy. The 2px difference from inputs (8px) and 2px from buttons (12px) is visually imperceptible.
> **Solution**: Standardize to either 12px (group with buttons) or 8px (group with inputs). Recommend 12px — stats are standalone display elements closer in visual weight to buttons than inputs.

> **Finding E7-AD2** · LOW
> **No radius tokens**: All 5 radius values are hardcoded in each component definition. The hierarchy is deliberate but not tokenized.
> **Evidence**: `border-radius: 16px` (line 714), `12px` (line 859), `10px` (line 1039), `8px` (line 990), `3px` (switches in `App.jsx`).
> **Solution**: Add radius tokens to `:root`: `--radius-card: 16px; --radius-btn: 12px; --radius-input: 8px; --radius-switch: 3px`. Reference these in component definitions. Enables future radius adjustments from a single location.

#### Padding consistency audit

| Component | Padding | Notes |
|-----------|---------|-------|
| `kuro-header` | `14px` | Internal card header |
| `kuro-body` | `14px` | Internal card body — **matches header** ✓ |
| `kuro-btn` | `10px 12px` | Button padding — asymmetric (taller than wide) |
| `kuro-input` | `10px 12px` | Input padding — **matches button** ✓ |
| `kuro-stat` | `14px` | Stat box — **matches card body** ✓ |
| `kuro-divider` | `margin: 12px 0` | Vertical rhythm spacer |
| `.tab-content` | `0.75rem` (12px) | Tab content area |
| Inline badge (element) | `px-2 py-0.5` (8px 2px) | Character detail modal |
| Inline badge (buff) | `px-1.5 py-0.5` (6px 2px) | Same modal, different padding |

> **Finding E7-AD3** · PASS
> **Card padding alignment**: `kuro-header` and `kuro-body` both use exactly `14px` padding. `kuro-stat` also uses `14px`. Buttons and inputs share `10px 12px`. Two padding tiers are internally consistent.
> **Solution**: None needed — the two-tier system (14px containers, 10px×12px interactive) is logical.

> **Finding E7-AD4** · LOW
> **Badge padding inconsistency**: Element badges use `px-2 py-0.5` (8px horizontal) while buff badges in the same modal use `px-1.5 py-0.5` (6px horizontal) (`appcore-components.jsx:216` vs `244`). The 2px difference creates subtle misalignment when badges appear near each other.
> **Solution**: Standardize all badges to `px-1.5 py-0.5` (the more compact option fits the data-dense aesthetic better), or create a `.kuro-badge` class with fixed padding.

#### Shadow system audit

| Token | Value | Usage |
|-------|-------|-------|
| `--shadow-sm` | `0 1px 2px rgba(6,10,24,0.4)` | Subtle elevation |
| `--shadow-md` | `0 4px 12px rgba(6,10,24,0.5)` | Standard cards |
| `--shadow-lg` | `0 8px 24px rgba(6,10,24,0.6)` | Elevated elements |
| `--shadow-xl` | `0 12px 40px rgba(6,10,24,0.7)` | Modals/overlays |

> **Finding E7-AD5** · PASS
> **Shadow token hierarchy**: Four-level shadow scale with consistent color (`rgba(6,10,24,*)`) and progressive blur/offset. The base color `6,10,24` matches the app's deep navy background, creating shadows that feel integrated rather than generic.
> **Evidence**: `appcore-providers.jsx:441–444`.
> **Solution**: None needed — well-designed shadow scale.

> **Finding E7-AD6** · LOW
> **Shadow token under-usage**: The 4-level shadow scale exists but `kuro-card` defines its own 3-layer composite shadow inline (`0 4px 24px rgba(6,10,24,0.6), 0 0 0 1px rgba(255,255,255,0.03), inset 0 1px 0 rgba(255,255,255,0.05)`) rather than referencing `--shadow-lg`. The tokens are defined but barely consumed.
> **Evidence**: `appcore-providers.jsx:718–721` — card shadow doesn't use `--shadow-lg`.
> **Solution**: Refactor `kuro-card` shadow to: `box-shadow: var(--shadow-lg), 0 0 0 1px rgba(255,255,255,0.03), inset 0 1px 0 rgba(255,255,255,0.05)` — composites the token with the decorative layers.

#### Unit system audit

> **Finding E7-AD7** · LOW
> **Mixed units across paradigms**: KuroStyles uses `px` consistently (14px, 10px, 12px, 16px). Tab content uses `rem` (0.75rem). Tailwind uses its own scale. Three unit systems coexist.
> **Evidence**: `appcore-providers.jsx:807` (14px), `562` (0.75rem), `App.jsx` uses Tailwind spacing (`gap-2`, `p-3`, `space-y-3`).
> **Solution**: Low priority — the px-in-CSS-in-JS + rem-in-layout + Tailwind-scale pattern is standard in React apps with utility CSS. Would only matter if font-size scaling were critical (it's a fixed-viewport mobile-first app). Document the convention: "kuro-* components use px, layout uses rem/Tailwind."

#### Border token usage

> **Finding E7-AD8** · PASS
> **Border opacity scale**: The 5-level scale (`--border-subtle` 0.06 → `--border-default` 0.08 → `--border-medium` 0.1 → `--border-hover` 0.15 → `--border-bright` 0.2) provides fine-grained control over border visibility. Each level serves a specific purpose: subtle for internal dividers, default for card borders, hover for interactive feedback, bright for stat boxes.
> **Evidence**: `appcore-providers.jsx:459–463`. Used by: `kuro-card` (line 713, `--border-default`), `kuro-btn` (line 858, `--border-medium`), `kuro-stat` (line 1038, `--border-hover`), card hover (line 727, `--border-hover`).
> **Solution**: None needed — well-structured opacity hierarchy.

---

### §E7.3 Brand consistency

> *"Is the app's visual identity consistent from section to section?"*

#### Brand signal inventory

The app's brand identity is defined by 6 signals:
1. **Gold accent** (`#edaf18` / `rgba(237,175,24,*)`) — primary brand color
2. **Glassmorphism surfaces** — `backdrop-filter: blur(4px)` + translucent backgrounds
3. **Shimmer lines** — 1px gradient highlight on card tops, stat tops
4. **Corner HUD decorations** — 4px×12px lines at top-left and bottom-right of `kuro-card-inner`
5. **Rajdhani display font** — `var(--font-display)` for headings, buttons, labels
6. **JetBrains Mono data font** — `var(--font-data)` for numbers, stat values

#### Per-tab brand signal presence

| Tab | Gold accent | Glass surfaces | Shimmer | Corner HUD | Display font | Data font |
|-----|------------|----------------|---------|------------|-------------|-----------|
| Tracker | ✅ Category tabs, pity ring | ✅ Banner cards | ✅ Card tops | ✅ Card inners | ✅ Card headers | ✅ Pity numbers |
| Events | ✅ Countdown gold | ✅ Event cards | ✅ Card tops | ✅ Card inners | ✅ Card headers | ✅ Timer digits |
| Calculator | ✅ Gold result highlights | ✅ Calc cards | ✅ Card tops | ✅ Card inners | ✅ Card headers | ✅ Calc values |
| Planner | ✅ Priority slider gold | ✅ Goal cards | ✅ Card tops | ✅ Card inners | ✅ Card headers | ✅ Resource counts |
| Stats | ✅ Luck badge, charts | ✅ Stat cards | ✅ Card tops | ✅ Card inners | ✅ Card headers | ✅ Stat values |
| Collection | ✅ Progress bar, glow | ⚠️ Summary uses `bg-white/5` | ⚠️ Not on summary | ⚠️ Not on summary | ✅ Card headers | ✅ Collection counts |
| Teams | ✅ Team analysis | ✅ Team cards | ✅ Card tops | ✅ Card inners | ✅ Card headers | ✅ DPS numbers |
| Profile | ✅ Gold CTA button | ✅ Settings cards | ✅ Card tops | ✅ Card inners | ✅ Card headers | ✅ Toggle states |

> **Finding E7-BC1** · LOW
> **Collection summary box bypasses kuro-card**: The Collection Progress section (`App.jsx:4789`) uses `className="p-3 rounded-lg border border-white/10 bg-white/5 content-layer"` — a raw Tailwind container instead of a `kuro-card`. It misses the shimmer line, corner HUD decorations, glass background token, and backdrop-filter blur. It's the only "card-like" element that doesn't use the kuro-card system.
> **Solution**: Wrap in `<Card><CardBody>...</CardBody></Card>` to inherit all 6 brand signals.

> **Finding E7-BC2** · PASS
> **Gold accent presence across all tabs**: Every tab has at least one gold-accented element — active tab states, section highlights, CTA buttons, or data emphasis. The gold thread is consistent throughout the app.
> **Solution**: None needed.

> **Finding E7-BC3** · PASS
> **Font family consistency**: `--font-display` (Rajdhani) is used for all card headers via `kuro-header h3` (`appcore-providers.jsx:828`), and `--font-data` (JetBrains Mono) is used for stat values via `.kuro-stat` (`line 1043`). Both fonts appear in every tab through the kuro-card system.
> **Solution**: None needed.

> **Finding E7-BC4** · MEDIUM
> **Gray text vs brand identity**: 459 instances of achromatic gray text classes (`text-gray-300`, `text-gray-400`, `text-gray-500`) across the app. While gray is appropriate for secondary/tertiary text, the sheer volume means most of the app's visible text is achromatic — weakening the gold brand identity. This was previously identified in §DBI3-S07 (HIGH) and §E1-COL1 (HIGH).
> **Cross-ref**: §DBI3-S07, §E1-COL1, §E1-COL3, §E3-WC2.
> **Solution**: Replace `text-gray-300` with `text-[var(--text-body)]` (which maps to `#dfe5ef` — a cool-tinted near-white), and `text-gray-400`/`text-gray-500` with opacity-reduced versions of `--text-body`. This maintains the hierarchy while adding a cool-tint that aligns with the navy-and-gold palette. Prioritize high-visibility text (tab labels, card descriptions, stat labels).

---

### §E7.4 First-impression test

> *"Show the app to someone for 7 seconds, then take it away. What do they perceive?"*

#### 7-second visual audit — Header + Tracker tab (default view)

A first-time user opening the app sees:

1. **Header** (`App.jsx:3163–3211`):
   - Gold-glowing app icon with blur halo — **premium signal** ✓
   - "Whispering Wishes" in white bold + "WUTHERING WAVES - COMPANION" uppercase subtitle — **purpose clarity** ✓
   - Server select + export button — **utility visible** ✓
   - 8 tab icons with gold gradient indicator bar — **navigation clear** ✓

2. **Tracker tab** (default):
   - Category tabs (Character / Weapon / Standard) using `kuro-btn` with color-coded active states — **interactive affordance** ✓
   - Banner cards with character art, countdown timers, pity counters, PityRing — **data-rich** ✓
   - TabBackground canvas glow — **atmospheric** ✓
   - Card stagger entrance animation — **polished motion** ✓

#### First-impression signals

| Signal | Present? | Details |
|--------|---------|---------|
| "What kind of app?" | ✅ Clear | Gacha tracker — banner names, pity counts, character art visible immediately |
| "Does it feel professional?" | ✅ Yes | Glassmorphism cards, gold accents, shimmer lines, corner HUD decorations |
| "Template/generic?" | ❌ Not generic | Corner HUD decorations, PityRing, luck badge, gold shimmer — custom craft elements |
| "Polished?" | ✅ Mostly | Card animations, physical hover states, backdrop blur, layered shadows |
| "Trustworthy?" | ✅ Yes | Data displayed clearly, version number visible, export button in header |

> **Finding E7-FI1** · PASS
> **First impression reads as purpose-built**: The header's gold icon glow, the tab indicator gradient bar, the banner card system with countdowns and PityRings, and the corner HUD decorations all signal "custom-built gaming tool" rather than "template with data plugged in." A 7-second viewer would identify it as a polished Wuthering Waves companion app.
> **Solution**: None needed.

> **Finding E7-FI2** · LOW
> **Subtitle gray dilutes first impression**: The "WUTHERING WAVES - COMPANION" subtitle (`App.jsx:3178`) uses `text-gray-400`, which is low-contrast against the dark header. At 7 seconds, this might read as a generic subtitle. A subtle gold tint would reinforce the brand.
> **Evidence**: `<p className="text-gray-400 text-[10px] tracking-wider uppercase">Wuthering Waves - Companion</p>`
> **Solution**: Change to `text-yellow-400/50` or `style={{color: 'rgba(237,175,24,0.45)'}}` — a muted gold that reads as intentional branding rather than default gray.

> **Finding E7-FI3** · PASS
> **Navigation legibility at 7 seconds**: 8 tabs visible with Lucide icons (18px) + text labels. The gold gradient indicator bar under the active tab provides clear wayfinding. Tab names are concise (Tracker, Events, Calc, Plan, Stats, Collection, Teams, Profile).
> **Solution**: None needed.

> **Finding E7-FI4** · PASS
> **Data density appropriate for A3 audience**: The Tracker tab shows banner names, countdown timers, pity counters, PityRing progress, and pull history — all visible without scrolling on a standard phone. For the ENTHUSIAST/EXPERT (A3) audience, this data density signals "this app respects my expertise" rather than "this app is overwhelming."
> **Solution**: None needed.

---

### §E7.5 Screenshot quality test

> *"Take a single static screenshot of each primary screen. Would it look good in an App Store listing?"*

#### Per-screen screenshot assessment

| Screen | Hero element | Visual anchor | Screenshot-worthy? | Notes |
|--------|-------------|---------------|-------------------|-------|
| **Tracker** | Banner cards with character art + PityRing | Countdown timers, pity counters | ✅ **Strong** | Character art provides visual richness; PityRing is distinctive |
| **Events** | Event cards with banner images + countdowns | Astrite progress bar, timer displays | ✅ **Strong** | Image-rich event cards create visual variety |
| **Calculator** | Probability gauge + resource summary | Colored stat boxes, priority slider | ⚠️ **Adequate** | Data-heavy; lacks a single hero visual moment |
| **Planner** | Goal cards with resonator icons | Priority indicators, resource counts | ⚠️ **Adequate** | Functional layout; resonator icons add personality |
| **Stats** | Luck badge with rotating gradient border | Pull history chart, win/loss ratios | ✅ **Strong** | Luck badge is the most visually distinctive element |
| **Collection** | Character portrait grid with glow effects | Collection progress bar, filter row | ✅ **Strong** | Grid of character art creates immediate visual appeal |
| **Teams** | Team builder with character slots | DPS analysis, team synergy | ⚠️ **Adequate** | Complex interface; visually busy in a screenshot |
| **Profile** | Resonator ID Card (modal) | Settings toggles, import UI | ⚠️ **Adequate** | Settings screens rarely screenshot well |

> **Finding E7-SQ1** · PASS
> **4 of 8 screens are screenshot-strong**: Tracker (character art + PityRing), Events (banner images + countdown), Stats (luck badge), and Collection (character grid) all have strong visual anchors that would work in an App Store listing or social media post.
> **Solution**: None needed for these screens.

> **Finding E7-SQ2** · LOW
> **Calculator lacks a visual hero moment**: The Calculator tab is the most data-heavy screen with no single element that creates visual impact. It relies entirely on stat boxes and text-heavy inputs. A screenshot would read as "spreadsheet tool" rather than "gaming companion."
> **Solution**: Add a small visual flourish to the probability result — e.g., a compact PityRing-style gauge for the "chance of getting" percentage, or a gold-accented result card that stands out from the input cards. Keep it lightweight (A2 FOCUS-TOOL) but give the screenshot one focal point.

> **Finding E7-SQ3** · PASS
> **Luck badge system creates screenshot moments**: The luck badge with its rotating conic-gradient border (`appcore-providers.jsx:656–676`), tier name, and rating number is the app's most screenshot-worthy element. Users are likely to share their luck rating on social media.
> **Solution**: None needed — this is a natural sharing moment.

---

### §E7.6 Visual noise inventory

> *"List every element on each primary screen that could be removed, reduced, or hidden behind progressive disclosure."*

#### Decorative layer inventory

| Element | Location | Purpose | Noise level | Verdict |
|---------|----------|---------|-------------|---------|
| Card shimmer line | `kuro-card::after` (line 747) | Premium polish signal | **Low** — 1px, subtle opacity pulse | ✅ KEEP — brand signature |
| Corner HUD decorations | `kuro-card-inner::before/::after` (lines 777–803) | Cyberpunk identity, distinctive | **Low** — small 12×12px, 0.85 opacity | ✅ KEEP — brand differentiation |
| Card backdrop blur | `backdrop-filter: blur(4px)` | Glass surface effect | **None** — invisible unless overlapping content | ✅ KEEP |
| Stat box top shimmer | `.kuro-stat::before` (line 1059) | Hierarchy signal (colored per variant) | **Low** — 1px gradient line | ✅ KEEP |
| TabBackground canvas glow | `BackgroundGlow` component | Atmospheric ambient light | **Low-Medium** — subtle, per-tab color | ✅ KEEP — adds depth |
| Text shadows on headers | `.kuro-header h3` (line 836) | Depth/legibility on glass | **Low** — single `0 2px 4px` | ✅ KEEP |
| Card hover gold glow | `.kuro-card:hover` (lines 726–734) | Interactive feedback | **None** — only on interaction | ✅ KEEP |
| Soft-pity zone pulse | `kuroPulseOrange/Cyan/Pink` (lines 1244–1280) | Emotional signaling (near-pity) | **Low** — 2s cycle, text-shadow only | ✅ KEEP — narrative function |

#### Noise candidates (potential reductions)

| Element | Location | Current state | Noise contribution | Recommendation |
|---------|----------|--------------|-------------------|---------------|
| Double text shadows on timer | `TEXT_SHADOW_STYLE` (`appcore-components.jsx:883`) | `0 2px 8px rgba(0,0,0,0.9), 0 1px 3px rgba(0,0,0,0.8)` — two layers | **Medium** — overkill for legibility | Reduce to single shadow: `0 2px 6px rgba(0,0,0,0.8)` |
| Collection card inline box-shadow | `App.jsx` collection grid | `boxShadow: '0 0 16px rgba(251,146,60,0.7)'` — bright orange glow | **Medium-High** — competing with card system glow | Reduce opacity to 0.3, or use `glow-gold` class |
| Events Astrite progress box | `App.jsx:3402` | `bg-yellow-500/10 border border-yellow-500/30` — inline styled | **Low** — but breaks visual pattern (not a kuro-card) | Wrap in Card component for consistency |
| Server reset note (Events) | `App.jsx:3442` | Sticky footer with gradient fade | **Low** — informational | OK as-is — progressive disclosure of utility info |
| Swipe hint | `App.jsx:3209` | `← swipe to navigate →` | **Very Low** — only when swipe enabled | ✅ OK — conditional display |

> **Finding E7-VN1** · PASS
> **Decorative elements are brand-functional**: The shimmer lines, corner HUD decorations, and backdrop blur are not "visual noise" — they are the cyberpunk/tactical identity that differentiates the app from generic trackers. Each decorative layer serves the §DS1 classification (Cyberpunk/Terminal primary + Glassmorphism secondary). Removing them would make the app generic.
> **Solution**: None needed — the decorative budget is well-allocated.

> **Finding E7-VN2** · LOW
> **Stacked text shadows reduce clarity**: The timer display uses double text-shadow (`0 2px 8px rgba(0,0,0,0.9), 0 1px 3px rgba(0,0,0,0.8)`) at `appcore-components.jsx:883`. A second occurrence at `line 1440` (collection card gradient overlay) adds another heavy shadow. On dark backgrounds, this creates a "muddy halo" effect rather than crisp legibility.
> **Solution**: Consolidate to a single text-shadow: `text-shadow: 0 2px 6px rgba(0,0,0,0.8)`. The dark background already provides sufficient contrast; the double shadow is redundant.

> **Finding E7-VN3** · LOW
> **Collection card glow competes with card system**: Individual collection cards apply inline `boxShadow: '0 0 16px rgba(251,146,60,0.7)'` — a high-opacity orange glow that's visually louder than the `glow-gold` class's more refined shadow. When multiple 5★ cards appear in a grid, the cumulative glow creates visual noise.
> **Solution**: Reduce to `boxShadow: '0 0 12px rgba(251,146,60,0.3)'` or apply the existing `glow-gold` class which has better-calibrated opacity and includes a radial background gradient.

> **Finding E7-VN4** · PASS
> **Signal-to-noise ratio appropriate for A3 audience**: For ENTHUSIAST/EXPERT users, high data density is a feature, not noise. The app shows pity counts, pull history, banner timers, resource calculations — all information that this audience actively seeks. The decorative elements (shimmer, HUD corners, glow) add atmosphere without obscuring data.
> **Solution**: None needed.

---

### §E7.7 Cross-device visual consistency

> *"Does the app look equally intentional on different screen sizes and system themes?"*

#### Device adaptation architecture

The app has 3 viewport modes:

1. **Mobile (default)**: Single-column layout, horizontal tab bar, `max-w-lg` content area, `px-3` horizontal padding.
2. **Tablet (md breakpoint)**: `max-w-2xl`, some grids expand to 2 columns via `sm:grid-cols-*`.
3. **Desktop (lg+ / `desktop-layout` class)**: 72px fixed sidebar, multi-column grids, 160px right ad margin, expanded modals.

#### Cross-device audit

| Dimension | Mobile | Desktop | Verdict |
|-----------|--------|---------|---------|
| Navigation | Horizontal tab bar, scrollable | 72px sidebar, vertical icon tabs | ✅ **Intentional adaptation** |
| Card layout | Single column, `space-y-3` | 2-column grids (`.desktop-grid-2`) | ✅ **Intentional** |
| Card hover | Multi-signal (5-signal) | Reduced to `translateY(-1px)` + subtle shadow | ✅ **Intentional** — desktop reduces hover intensity |
| Card entrance | 50ms stagger, 0.4s duration | No stagger, 0.2s duration | ✅ **Intentional** — desktop faster |
| Tab transition | `all 0.2s` on sidebar | Custom cubic-bezier | ✅ **Intentional** |
| Modals | Full-width `max-w-lg` | Expanded to 560px | ✅ **Intentional** |
| Touch targets | 44px via `@media (pointer: coarse)` | Standard sizing | ✅ **Intentional** |

> **Finding E7-CD1** · PASS
> **Desktop layout is a genuine adaptation**: The desktop mode (`appcore-providers.jsx:1450–1670`) doesn't just stretch the mobile layout — it reorganizes navigation (horizontal → vertical sidebar), adjusts motion (reduced stagger, faster transitions), expands grids (2-column), and adds ad margin space. This is a deliberate desktop experience, not a responsive afterthought.
> **Solution**: None needed.

> **Finding E7-CD2** · MEDIUM
> **Banner grid `minmax(420px)` overflows on small phones**: The desktop `.banner-grid` uses `grid-template-columns: repeat(auto-fit, minmax(420px, 1fr))` (`appcore-providers.jsx:1556`). On mobile, this grid class is not active (it's inside `.desktop-layout`), but the same class name is used in the mobile `App.jsx:3255` layout where banner cards stack in `space-y-2`. However, the `.event-grid` at line 1561 uses `minmax(380px, 1fr)` — if this ever applies outside desktop context, phones narrower than 380px would get horizontal overflow.
> **Evidence**: `.desktop-layout .event-grid { grid-template-columns: repeat(auto-fill, minmax(380px, 1fr)) }` — scoped to `.desktop-layout`, so mobile is safe. But the minmax values are still aggressive for smallest desktop windows.
> **Solution**: Reduce desktop minmax to `minmax(340px, 1fr)` for event-grid and `minmax(380px, 1fr)` for banner-grid — provides safety margin for 768px–1024px tablet-desktop range where sidebar (72px) + content + ad margin (160px) = 536px content width.

> **Finding E7-CD3** · PASS
> **OLED mode as device adaptation**: The OLED mode (`visualSettings.oledMode`) switches all background tokens from translucent navy to true black — `rgba(0,0,0,0.95)` for cards, `rgba(5,5,5,1)` for card inners. This respects the device's display technology (OLED pixel-off for battery savings) while maintaining all other design elements (borders, shadows, gold accents, text colors).
> **Solution**: None needed — well-implemented device adaptation.

> **Finding E7-CD4** · LOW
> **No light theme**: The app is dark-only. The §E7 criterion mentions "different system themes (light/dark)" — but for a gacha tracker with cyberpunk/terminal aesthetic, a light theme would be incongruous. The dark theme IS the brand.
> **Solution**: No light theme needed. The cyberpunk identity (A4 NAMED-SOURCE, §DS1) requires dark backgrounds. OLED mode provides the only device-driven theme variation needed. Document this as an intentional constraint.

---

### §E7.8 Competitive credibility check

> *"Name the 2–3 most polished apps in the same category. Compare specific craft elements side-by-side."*

#### Competitive landscape

The WuWa tracker ecosystem includes:

1. **WuWa Tracker** (wuwatracker.com) — Referenced in-app as data source (`App.jsx:182, 6634, 6780, 6785, 6792`). Web-based tracker with import/export capabilities.
2. **GenGamer Countdown** (wuthering-countdown.gengamer.in) — Referenced as banner countdown source (`App.jsx:6793`).
3. **Paimon.moe / similar Genshin trackers** — The established gacha tracker UX paradigm from the older Genshin Impact ecosystem.

#### Craft comparison (Whispering Wishes vs typical WuWa web trackers)

| Dimension | Whispering Wishes | Typical web tracker | Assessment |
|-----------|-------------------|-------------------|------------|
| **Design system** | 9-component kuro-* system with tokens | Bootstrap/Tailwind defaults | ✅ **Ahead** — custom system vs generic framework |
| **Motion design** | 15+ named keyframes, transition tokens, physical hover, haptic | Basic CSS transitions, no haptic | ✅ **Significantly ahead** |
| **Typography** | Dual font system (display + data), letter-spacing, text-shadow | System font or single web font | ✅ **Ahead** |
| **Atmospheric design** | Canvas glow backgrounds, glassmorphism, corner HUD | Flat cards, solid backgrounds | ✅ **Ahead** |
| **Color system** | Gold + 5 accent colors, 5-level border scale, OLED mode | Basic theme colors, light/dark toggle | ✅ **Ahead** |
| **Spacing** | Consistent 14px/10px system, 0.75rem tab content | Mixed, often inconsistent | ⚠️ **Parity** — Whispering Wishes has gaps too (§E7-DC1) |
| **Empty states** | Themed empty state with gold gradient + ghost grid | "No data" plain text | ✅ **Ahead** |
| **Error handling** | TabErrorBoundary + AppErrorBoundary + toast system | Generic error page | ✅ **Ahead** |
| **Loading states** | Gold-tinted skeleton shimmer, ghost grid | Spinner or blank | ✅ **Ahead** |
| **Accessibility** | Focus-visible states, ARIA roles, keyboard nav, reduced motion | Often minimal | ✅ **Ahead** |
| **Feature depth** | 8 tabs: tracker, events, calc, planner, stats, collection, teams, profile | Typically 2–4 features | ✅ **Ahead** |
| **Unique features** | PityRing, luck badge system, team DPS calculator, resonator ID card | Standard pity counter | ✅ **Significantly ahead** |

> **Finding E7-CC1** · PASS
> **Competitive credibility is strong**: Whispering Wishes is the most design-invested WuWa tracker in its category. The custom design system, motion design, atmospheric effects, and feature breadth are unmatched by typical web trackers in this niche. A user comparing this to wuwatracker.com would perceive Whispering Wishes as the more polished option.
> **Solution**: None needed.

> **Finding E7-CC2** · LOW
> **Parity gap on spacing consistency**: While Whispering Wishes leads in visual craft, the dual-layer system (kuro-* vs inline Tailwind) creates spacing inconsistencies that more minimalist trackers avoid by having simpler designs. The fix isn't to simplify — it's to extend the design system to cover the remaining inline elements (§E7-DC1).
> **Solution**: Same as §E7-DC1 — migrate inline elements to kuro-* variants.

> **Finding E7-CC3** · PASS
> **Unique motion signature creates differentiation**: No competing WuWa tracker has anything resembling the PityRing animation (800ms arc fill), luck badge rotating gradient, card stagger entrance, or haptic feedback system. These are genuine competitive moats — they can be copied but require significant effort.
> **Solution**: None needed — continue investing in the motion system as a differentiator.

---

### §E7.9 Polish delta

> *"For each section — list specific changes that would move it from 'functional' to 'intentional' within the existing design language."*

#### Per-tab polish delta

**Tracker tab** — Current: 9/10 polish
| Change | Impact | Effort |
|--------|--------|--------|
| Inline category sub-filter buttons → `kuro-btn-sm` variant | Unifies hover/active quality | Low |
| Pull log row `hover:bg-white/5` → add `@media (hover: hover)` guard | Touch-device safety | Trivial |

**Events tab** — Current: 8/10 polish
| Change | Impact | Effort |
|--------|--------|--------|
| Astrite progress box `bg-yellow-500/10` → wrap in `<Card>` | Brand consistency | Low |
| Event status buttons (Done/Skip) → `kuro-btn-ghost` variant | Interaction quality | Low |
| Sticky server-reset note → reduce visual weight (smaller text, dimmer) | Noise reduction | Trivial |

**Calculator tab** — Current: 7/10 polish
| Change | Impact | Effort |
|--------|--------|--------|
| Increment buttons (`+1`, `+5`, `+10`) → `kuro-btn-sm` variants | Hover/active consistency | Low |
| Probability result → add visual flourish (gold-accented result card) | Screenshot hero moment | Medium |
| Priority slider → add tick marks at 0/25/50/75/100 | Affordance clarity | Low |

**Planner tab** — Current: 7.5/10 polish
| Change | Impact | Effort |
|--------|--------|--------|
| Goal priority/removal buttons → `kuro-btn-ghost` | Interaction quality | Low |
| Resource summary → use `kuro-stat` color variants | Brand alignment | Low |

**Stats tab** — Current: 9/10 polish
| Change | Impact | Effort |
|--------|--------|--------|
| Leaderboard modal sub-tabs (Rankings/Most Convened) → use consistent tab pattern | Pattern consistency | Low |
| Consent modal buttons → `kuro-btn` | Brand consistency | Low |
| Chart `text-gray-400` labels → `var(--text-body)` at reduced opacity | Gray text reduction | Trivial |

**Collection tab** — Current: 8/10 polish
| Change | Impact | Effort |
|--------|--------|--------|
| Collection Progress box → wrap in `<Card>` | Brand consistency (§E7-BC1) | Low |
| Search input → use `kuro-input` class | Token alignment | Trivial |
| Filter selects → add focus gold glow | Focus consistency | Low |
| Collection card inline glow → use `glow-gold` class | Noise reduction (§E7-VN3) | Trivial |

**Teams tab** — Current: 7.5/10 polish
| Change | Impact | Effort |
|--------|--------|--------|
| Team slot buttons → `kuro-btn` variants | Interaction quality | Low |
| DPS analysis inline styling → token-driven | Maintainability | Medium |
| Empty team state → `kuro-empty-state` component | Brand alignment | Low |

**Profile tab** — Current: 8.5/10 polish
| Change | Impact | Effort |
|--------|--------|--------|
| Import method buttons (File/Paste) → `kuro-btn` | Consistency | Trivial |
| Header subtitle `text-gray-400` → muted gold | Brand reinforcement (§E7-FI2) | Trivial |
| Toggle switch description alignment → consistent left padding | Detail alignment | Trivial |

> **Finding E7-PD1** · MEDIUM
> **Primary polish lever — inline button migration**: The single change with the highest impact across ALL tabs is creating `kuro-btn-ghost` and `kuro-btn-sm` variants and migrating the ~100+ inline buttons. This simultaneously improves: hover quality (§E6-HV9), active feedback (§E6-AP4), visual consistency (§E5-BT5), token coverage (§E1-COV1), and the two-layer coherence gap (§E7-DC1). Every tab has at least 2–5 inline buttons that would benefit.
> **Solution**: Priority migration order: Calculator tab (most inline buttons in a data-focused context) → Events tab → Collection tab → remaining tabs.

> **Finding E7-PD2** · LOW
> **Secondary polish lever — `<Card>` wrapping for inline containers**: 3–4 inline containers (`bg-white/5 border border-white/10 rounded-lg`) across Events, Collection, and Stats could be replaced with `<Card>` components to gain shimmer lines, corner decorations, and token-driven backgrounds. Low effort, high brand consistency gain.
> **Solution**: Identify all `bg-white/5 border border-white/10 rounded-lg` patterns in `App.jsx` and wrap in `<Card>`.

---

### §E7.10 Polish level assessment `[A1][A2][A5]`

#### [A1] NON-REVENUE — Credibility signal checklist

| Credibility signal | Present? | Evidence |
|-------------------|----------|----------|
| Consistent 4/8-based spacing | ⚠️ **Partial** | kuro-* uses 14px (not 8-based), Tailwind uses 4-based. Two spacing systems coexist |
| Subtle shadows with intentional offset and blur | ✅ **Yes** | 4-level shadow token scale with progressive blur + card composite shadows |
| Smooth 200–300ms transitions | ✅ **Yes** | `--transition-normal: 0.25s`, `--transition-slow: 0.4s` — right in the range |
| Letter-spacing on headings | ✅ **Yes** | `letter-spacing: 0.03em` on `.kuro-header h3` (`line 832`) |
| Antialiased type | ✅ **Yes** | System font stack with `-apple-system` priority |
| Hover states that feel physical | ✅ **Yes** | kuro-btn 5-signal hover, card 2px lift, stat 1px lift, slider thumb 15% scale |
| Skeleton loaders that mirror content shape | ✅ **Yes** | `kuro-skeleton` with gold-tinted shimmer, ghost grid cells for collection |
| Contextual empty states | ✅ **Yes** | `kuro-empty-state` with gold gradient + context-specific messaging per tab |
| Confirmation animations on success | ⚠️ **Partial** | Toast appears with `slideUp 0.2s` but no success-specific animation (no confetti, no checkmark animation) |

**A1 assessment**: 7/9 signals present. The app communicates credibility effectively despite being NON-REVENUE. The two partial gaps (spacing system and success confirmation) are minor — the spacing issue is cosmetic (users don't consciously notice 14px vs 16px), and the toast success is functional if not celebratory.

> **Finding E7-PL1** · LOW
> **No success confirmation animation**: When a user successfully imports data, changes settings, or completes an action, the only feedback is a toast notification with `slideUp 0.2s`. There's no success-specific animation (checkmark morphing, confetti burst, or color flash). For a gacha tracker with emotional investment (A2 EMOTIONAL-SECONDARY), success moments deserve richer feedback.
> **Solution**: Add a brief 0.3s checkmark animation to the success toast variant — a line-draw SVG checkmark that animates on mount. This adds delight without complexity.

#### [A2] FOCUS-TOOL — Distraction assessment

> *"The polish goal inverts — the absence of distraction IS the polish."*

| Dimension | Assessment |
|-----------|-----------|
| Does the interface demand attention? | **No** — decorative elements (shimmer, HUD corners) are subtle (1px, 0.85 opacity) and don't compete with data |
| Can the user scan data quickly? | **Yes** — pity counts, banner timers, and stat values use `--font-data` (JetBrains Mono) with `tabular-nums` for digit alignment |
| Do animations distract from tasks? | **No** — entrance animations are brief (0.15–0.4s), and the `no-animations` toggle disables everything |
| Is cognitive load managed? | **Mostly** — each tab focuses on one domain; progressive disclosure via modals for detail views |
| Do decorative elements recede during data work? | **Yes** — canvas glow is behind content, card decorations are subtle, gold accents highlight data rather than decoration |

**A2 assessment**: The FOCUS-TOOL axis is well-served. The interface provides atmosphere without distraction. The three-layer reduced motion system (§E6-MC3) gives users full control over visual intensity. Data typography (JetBrains Mono + tabular-nums) prioritizes scannability.

> **Finding E7-PL2** · PASS
> **Focus-tool polish achieved through restraint**: Despite having 15+ keyframe animations, glassmorphism, and canvas backgrounds, the app maintains focus-tool clarity. Decorative elements are calibrated to be "noticeable once, then background" — the shimmer fades to 0.6 opacity, corners are 0.85 opacity, hover lifts are 1–2px. The polish is in the calibration, not the quantity.
> **Solution**: None needed.

#### [A2] EMOTIONAL-SECONDARY — Warmth assessment

> *"Polish means warmth and safety — gentle corners, calm palette, generous spacing, transitions that feel unhurried."*

| Dimension | Assessment |
|-----------|-----------|
| Gentle corners | ✅ 16px card radius, 12px button radius — generous and warm |
| Calm palette | ⚠️ Dark navy + gold is dramatic, not calm — but appropriate for gacha/gaming |
| Generous spacing | ✅ 14px card padding, `space-y-3` between cards — comfortable breathing room |
| Unhurried transitions | ⚠️ 0.15–0.25s for most interactions — "brisk" per §E6, not "unhurried" |
| Safety signals | ✅ AppErrorBoundary's "your data is safe" message, toast confirmations |

**A2 emotional assessment**: The emotional warmth comes through in card radius, spacing, and safety messaging — but the motion character is "brisk/confident" rather than "unhurried/gentle." This is a correct calibration: A2 is FOCUS-TOOL primary, EMOTIONAL-SECONDARY. The briskness serves the primary axis; the warmth serves the secondary.

> **Finding E7-PL3** · PASS
> **Emotional-secondary correctly weighted**: The app doesn't sacrifice focus-tool efficiency for emotional warmth, but it provides warmth where it matters most: error recovery ("your data is safe"), generous spacing for readability, and gentle card radiuses. The PityRing's 0.8s fill is the one "unhurried" moment — reserved for the most emotionally charged interaction (approaching pity).
> **Solution**: None needed.

#### [A5] FUNCTIONAL-PRIMARY + ATMOSPHERIC-SECONDARY

> *"Polish means the UI chrome recedes so the output shines."*

| Dimension | Assessment |
|-----------|-----------|
| Does the UI chrome recede? | ✅ Glass surfaces are translucent, borders are subtle (0.08 opacity), backgrounds use low-alpha rgba |
| Does the functional output shine? | ✅ PityRing values, stat numbers, countdown timers — all high-contrast against glass surfaces |
| Does the atmospheric layer complement or compete? | ✅ Canvas glow, shimmer lines, corner decorations — complement without competition |
| Is the atmosphere optional? | ✅ Three-layer reduced motion + OLED mode removes all atmospheric elements |

> **Finding E7-PL4** · PASS
> **Functional-primary + atmospheric-secondary axis well-calibrated**: The glass surfaces, low-opacity borders, and subtle decorations create atmosphere while keeping functional data (numbers, charts, timers) as the primary visual layer. The atmospheric elements can be fully disabled via reduced motion toggle without losing functionality.
> **Solution**: None needed.

#### Universal baseline

> *"Is there one detail that clearly took extra effort?"*

**Yes** — multiple details show extra effort:
1. **PityRing** — SVG arc fill with soft-pity zone pulse animation
2. **Luck badge** — rotating conic-gradient border with tier-based coloring
3. **Corner HUD decorations** — cyberpunk identity element on every card
4. **Haptic feedback** — 6 distinct vibration patterns mapped to semantic events
5. **Three-layer reduced motion** — CSS fallback + JS detection + user toggle

> *"Does the app look intentional rather than defaulted?"*

**Yes** — the app looks intentional. The gold accent, glassmorphism surfaces, cyberpunk decorations, and dual font system are clearly chosen, not inherited from a template or framework default.

> *"Is spacing consistent enough that nothing feels accidental?"*

**Mostly** — the kuro-* system maintains rigorous 14px/10px spacing. The inline Tailwind layer introduces some variation (§E7-DC1) but not enough to feel accidental to most users.

> **Finding E7-PL5** · PASS
> **Universal baseline exceeded**: The app passes all three universal baseline tests — multiple details show extra effort, the design is clearly intentional, and spacing is consistent enough that nothing feels accidental. For a NON-REVENUE app, this level of polish is exceptional.
> **Solution**: None needed.

---

### §E7.11 Per-tab coverage matrix

All 10 §E7 criteria were assessed across all 8 tabs:

| Criterion | Tracker | Events | Calc | Planner | Stats | Collection | Teams | Profile |
|-----------|---------|--------|------|---------|-------|------------|-------|---------|
| §E7.1 Coherence | ✅ | ✅ | ⚠️ | ⚠️ | ✅ | ⚠️ | ⚠️ | ✅ |
| §E7.2 Detail | ✅ | ✅ | ✅ | ✅ | ✅ | ⚠️ | ✅ | ✅ |
| §E7.3 Brand | ✅ | ✅ | ✅ | ✅ | ✅ | ⚠️ | ✅ | ✅ |
| §E7.4 First impression | ✅ | ✅ | ⚠️ | ⚠️ | ✅ | ✅ | ⚠️ | ⚠️ |
| §E7.5 Screenshot | ✅ | ✅ | ⚠️ | ⚠️ | ✅ | ✅ | ⚠️ | ⚠️ |
| §E7.6 Noise | ✅ | ✅ | ✅ | ✅ | ✅ | ⚠️ | ✅ | ✅ |
| §E7.7 Cross-device | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| §E7.8 Competitive | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| §E7.9 Polish delta | ✅ | ⚠️ | ⚠️ | ⚠️ | ✅ | ⚠️ | ⚠️ | ⚠️ |
| §E7.10 Polish level | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

Legend: ✅ = passes criterion · ⚠️ = minor gap identified

**Tab polish ranking** (highest to lowest):
1. **Tracker** — 9/10 — Hero tab, most polished, kuro-btn throughout
2. **Stats** — 9/10 — Luck badge hero moment, strong visual identity
3. **Events** — 8/10 — Image-rich, atmospheric, minor inline container gaps
4. **Profile** — 8.5/10 — Clean settings UX, kuro-* components throughout
5. **Collection** — 8/10 — Strong grid visual, but summary box bypasses kuro-card
6. **Planner** — 7.5/10 — Functional, needs inline button migration
7. **Teams** — 7.5/10 — Complex interface, inline styling in DPS analysis
8. **Calculator** — 7/10 — Most inline buttons, no visual hero moment

---

### §E7 Summary

#### All findings

| ID | Finding | Severity | Verdict |
|----|---------|----------|---------|
| E7-DC1 | Two-layer coherence gap (kuro-* vs Tailwind) | MEDIUM | ISSUE |
| E7-DC2 | Component-level coherence | — | PASS |
| E7-AD1 | Non-standard 10px stat radius | LOW | ISSUE |
| E7-AD2 | No radius tokens | LOW | ISSUE |
| E7-AD3 | Card padding alignment | — | PASS |
| E7-AD4 | Badge padding inconsistency | LOW | ISSUE |
| E7-AD5 | Shadow token hierarchy | — | PASS |
| E7-AD6 | Shadow token under-usage | LOW | ISSUE |
| E7-AD7 | Mixed units across paradigms | LOW | ISSUE |
| E7-AD8 | Border opacity scale | — | PASS |
| E7-BC1 | Collection summary bypasses kuro-card | LOW | ISSUE |
| E7-BC2 | Gold accent presence all tabs | — | PASS |
| E7-BC3 | Font family consistency | — | PASS |
| E7-BC4 | Gray text vs brand identity | MEDIUM | ISSUE |
| E7-FI1 | First impression reads purpose-built | — | PASS |
| E7-FI2 | Subtitle gray dilutes first impression | LOW | ISSUE |
| E7-FI3 | Navigation legibility at 7 seconds | — | PASS |
| E7-FI4 | Data density appropriate for A3 | — | PASS |
| E7-SQ1 | 4 of 8 screens screenshot-strong | — | PASS |
| E7-SQ2 | Calculator lacks visual hero moment | LOW | ISSUE |
| E7-SQ3 | Luck badge screenshot moments | — | PASS |
| E7-VN1 | Decorative elements are brand-functional | — | PASS |
| E7-VN2 | Stacked text shadows reduce clarity | LOW | ISSUE |
| E7-VN3 | Collection card glow competes | LOW | ISSUE |
| E7-VN4 | Signal-to-noise for A3 audience | — | PASS |
| E7-CD1 | Desktop layout genuine adaptation | — | PASS |
| E7-CD2 | Banner/event grid minmax overflow risk | MEDIUM | ISSUE |
| E7-CD3 | OLED mode as device adaptation | — | PASS |
| E7-CD4 | No light theme (intentional) | LOW | NOTE |
| E7-CC1 | Competitive credibility strong | — | PASS |
| E7-CC2 | Parity gap on spacing consistency | LOW | ISSUE |
| E7-CC3 | Unique motion signature differentiation | — | PASS |
| E7-PD1 | Primary polish lever — button migration | MEDIUM | ISSUE |
| E7-PD2 | Secondary polish lever — Card wrapping | LOW | ISSUE |
| E7-PL1 | No success confirmation animation | LOW | ISSUE |
| E7-PL2 | Focus-tool polish via restraint | — | PASS |
| E7-PL3 | Emotional-secondary correctly weighted | — | PASS |
| E7-PL4 | Functional-primary + atmospheric well-calibrated | — | PASS |
| E7-PL5 | Universal baseline exceeded | — | PASS |

**Totals**: 39 findings — 0 HIGH · 4 MEDIUM · 15 LOW · 1 NOTE · 19 PASS

### Key strengths

1. **Design system cohesion where applied**: The 9-component kuro-* system creates a unified visual language — glassmorphism, gold accents, shimmer lines, corner decorations, physical hover. When a UI element uses the system, it feels premium and intentional.

2. **Desktop adaptation is genuine**: The 72px sidebar, 2-column grids, expanded modals, reduced hover intensity, and faster entrance animations show desktop was designed as a separate experience — not just a wider viewport.

3. **Competitive position is strong**: In the WuWa tracker niche, Whispering Wishes leads on design craft (motion, typography, atmospheric design, empty states, error handling) and feature breadth (8 tabs vs typical 2–4).

4. **Polish calibration respects axes**: The A2 FOCUS-TOOL axis is served by restrained decorations, data-first typography, and optional animations. The A5 FUNCTIONAL-PRIMARY axis is served by receding UI chrome. The EMOTIONAL-SECONDARY axis is served by generous spacing, gentle radiuses, and safety messaging.

5. **Multiple "extra effort" details**: PityRing, luck badge, corner HUD decorations, haptic feedback patterns, three-layer reduced motion — each represents design investment beyond functional necessity.

### Key concerns

1. **Two-layer coherence gap** (§E7-DC1, §E7-PD1): The kuro-* system covers ~70% of the UI. The remaining ~30% (inline Tailwind buttons, badges, progress bars, filter selects) uses a simpler design vocabulary that doesn't benefit from design tokens, multi-signal hover, or physical active states. This is the single most impactful professionalism gap and the one that cascades across multiple prior findings (§E5-BT5, §E6-HV9, §E6-AP4, §E1-COV1).

2. **Gray text volume** (§E7-BC4): 459 achromatic gray text instances weaken the gold brand identity. This is a cosmetic issue that compounds across the entire app — the overall color impression is "gray with gold highlights" rather than "gold with gray support."

3. **Desktop grid overflow risk** (§E7-CD2): The `minmax(420px)` and `minmax(380px)` values in desktop grids could overflow on narrow desktop/tablet windows where sidebar (72px) + content + ad margin (160px) compress the content area.

### Connection to prior findings

- **§E5-BT5** (inline button sprawl): The professionalism impact of the button sprawl is confirmed — it's the primary source of the two-layer coherence gap (§E7-DC1) and the primary polish lever (§E7-PD1).
- **§E6-HV9 + §E6-AP4** (hover/active gaps): These interaction-layer consequences of the button sprawl now have a professionalism framing — they create a perceptible polish gradient within each screen.
- **§E1-COV1** (token coverage ~30%): The professionalism audit confirms that token coverage is the root cause of the coherence gap. Extending the kuro-* system to cover inline elements would simultaneously fix multiple findings.
- **§DBI3-S07 + §E1-COL1** (gray text): The brand consistency assessment (§E7-BC4) confirms that gray text is not just a token issue but a brand identity issue visible in every tab.
- **§DBI3-S03** (rounded-lg monoculture): The radius audit (§E7-AD1, §E7-AD2) shows the kuro-* system has a deliberate 5-level hierarchy — the monoculture is in the inline Tailwind layer's default `rounded-lg`.

---

> **End of Step 14 — §E7: Overall Visual Professionalism**
> **Lines added**: ~470
> **Next step**: Step 15 — §E8: Product Aesthetics (Axis-Driven) (awaiting user instruction)
