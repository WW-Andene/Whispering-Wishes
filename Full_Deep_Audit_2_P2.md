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
