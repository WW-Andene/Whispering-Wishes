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
