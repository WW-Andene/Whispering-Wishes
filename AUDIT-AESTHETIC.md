# Design Aesthetic Audit — Whispering Wishes

**Audit Date:** 2026-02-27
**Version:** 3.2.3
**Branch:** `claude/audit-whispering-wishes-11-FcoEf`
**Scope:** Visual design, color science, typography, motion, surfaces, hierarchy, iconography, brand identity, competitive positioning

---

## §0. AESTHETIC CONTEXT

```yaml
Design Identity:
  App Name:        Whispering Wishes
  Domain:          Wuthering Waves gacha companion (probability engine, pity tracker, resource planner, collection showcase)
  Current style:   Dark cyberpunk-luxe with frosted glass surfaces, neon element-color accents, animated canvas backgrounds
  Intended style:  Premium dark gaming companion — "Kuro Games" aesthetic (gold/black/deep blue)
  Personality:     Mystical, high-tech, insider-premium; like a secret weapon only serious players use
  Protected elements:
    - Gold (#fbbf24) accent as primary identity color
    - Element-color mapping (Fusion=orange, Electro=purple, Aero=emerald, Glacio=cyan, Havoc=pink, Spectro=yellow)
    - Deep blue-black base (#080c14)
    - Canvas wave/glow background animations
    - Corner-decoration motif on cards (top-right + bottom-left L-shapes)
    - Shimmer line on card top edges

Five-Axis Quick Profile:
  A1 Commercial intent: Non-revenue (free community tool)
  A2 Use context:       Leisure + Emotional (gacha = anticipation/excitement/FOMO)
  A3 Audience:          Enthusiast (Wuthering Waves players, gacha-literate)
  A4 Subject identity:  Strong aesthetic — Wuthering Waves has its own visual identity (dark sci-fi/fantasy)
  A5 Aesthetic role:     Amplifies value — the aesthetic signals "insider quality" and keeps users engaged
```

---

## I. AESTHETIC STYLE CLASSIFICATION

### §DS1. Design Language Identification

```
Primary style:        Cyberpunk / Terminal (OLED-dark, neon accents, glow effects, high-contrast edges)
Secondary influences: Glassmorphism (frosted blur surfaces, translucent cards, backdrop-filter)
                      + Aurora/Liquid (canvas-based procedural wave backgrounds, chromatic glow)
Coherence score:      COHERENT
Style-appropriate execution:
  The Cyberpunk foundation is well-executed — deep near-black (#080c14) base, neon element colors at
  controlled saturation, glow box-shadows, monospace numerals for data. The glassmorphism layer
  (backdrop-filter: blur(4px-8px), semi-transparent rgba backgrounds) adds depth without competing
  with the cyberpunk identity. The canvas wave background provides atmospheric motion consistent
  with the "mystical high-tech" personality. Style rules are followed with discipline.
```

### §DS2. Style Coherence Assessment

**Coherent elements:** Cards, buttons, inputs, stat boxes, modals — all share the same frosted-glass-on-void vocabulary with consistent border treatment (`rgba(255,255,255,0.08-0.15)`), consistent glow behavior, and consistent radius scale.

**Minor style breaks found:**

| Finding | Severity | Location |
|---------|----------|----------|
| `min-w-[36px]` on modal close button in CharacterDetailModal (line 177) vs `min-h-[44px]` everywhere else | [LOW] | `appcore-components.jsx:177` |
| System font stack (`ui-sans-serif, system-ui...`) is stylistically neutral — it doesn't commit to the cyberpunk personality | [MEDIUM] | See §DT1 |
| Tailwind gray-400/500 text hierarchy is chromatically neutral — doesn't carry the cool-blue temperature of the surface palette | [MEDIUM] | See §DC2 |

---

## II. COLOR SCIENCE

### §DC1. Perceptual Color Architecture

**Base palette temperature:** Cool-blue. Background `#080c14` has a blue undertone (H≈220°). Surface cards use `rgba(12,16,24,...)` — consistently cool. The palette reads as coherent deep-ocean/void.

**Accent color calibration:**

| Element | Hex | HSL | OKLCH (approx) | Assessment |
|---------|-----|-----|-----------------|------------|
| Gold (primary) | `#fbbf24` | 45°, 97%, 56% | `oklch(82% 0.17 85)` | High chroma, warm — strong contrast against cool surface. Reads as intentional "premium signal." |
| Cyan (Glacio) | `#06b6d4` | 189°, 95%, 43% | `oklch(62% 0.14 210)` | Well-calibrated cool accent |
| Pink (Havoc) | `#ec4899` | 330°, 81%, 60% | `oklch(63% 0.22 350)` | High chroma — reads energetic |
| Purple (Electro) | `#a855f7` | 271°, 91%, 65% | `oklch(58% 0.24 300)` | Highest chroma — very vivid |
| Orange (Fusion) | `#f97316` | 25°, 95%, 53% | `oklch(68% 0.19 55)` | Warm punch, reads well on dark |
| Emerald (Aero) | `#22c55e` | 142°, 71%, 45% | `oklch(64% 0.18 155)` | Slightly low perceived brightness vs others |

**Color temperature coherence:** ✓ — Warm gold accent on cool-blue surfaces creates intentional temperature contrast. This is the correct pattern: warm = action/identity, cool = environment/depth.

**Issue:** The element colors (Fusion orange, Electro purple, etc.) are at inconsistent perceived brightness. Purple at `oklch(58%)` reads darker than Gold at `oklch(82%)`. In the current context (small badges, borders) this is acceptable, but on larger surfaces it would create hierarchy confusion.

### §DC2. Palette Architecture Audit

| Role | Current Value | Assessment |
|------|---------------|------------|
| Background (deepest) | `#080c14` / CSS gradient starting `#010204` | ✓ Chromatic near-black with blue undertone — refined |
| Surface layer 1 (cards) | `rgba(12,16,24,0.55)` | ✓ Cool-blue tint, translucent — correct glassmorphism |
| Surface layer 2 (card-inner) | `rgba(6,10,18,1)` | ✓ Slightly darker inner panel — creates depth |
| Surface layer 3 (modals) | `rgba(12,16,24,0.95)` | ✓ Nearly opaque, elevated |
| Primary text | `var(--text-heading)` = `#e2e8f0` (Tailwind slate-200) | ⚠ Slightly warm-neutral — could be cooler to match surfaces |
| Secondary text | `text-gray-300` = `#d1d5db` | ⚠ Neutral gray — no blue temperature |
| Muted text | `text-gray-400` = `#9ca3af` | ⚠ Neutral gray — chromatically dead |
| Accent primary | `#fbbf24` (gold) | ✓ Strong identity signal |
| Accent active | `rgba(251,191,36,0.15)` bg + `rgba(251,191,36,0.7)` border | ✓ Layered glow — premium feel |
| Border default | `rgba(255,255,255,0.08)` | ✓ Subtle, adapts to surface — good technique |
| Border hover | `rgba(255,255,255,0.15)` | ✓ Clear state signal without over-brightening |

**[MEDIUM] D-COLOR-1: Text hierarchy uses Tailwind's neutral grays — no chromatic temperature**

The surfaces are beautifully chromatic (`rgba(12,16,24,...)` — cool blue tint), but the text colors are plain grays from Tailwind's default palette. This creates a subtle dissonance: the surfaces say "designed" while the text says "default."

**Recommendation:** Replace neutral grays with cool-tinted equivalents:
- Primary text: `#e2e8f0` → `oklch(92% 0.01 240)` ≈ `#dfe5ef` (cool-tinted)
- Secondary: `#d1d5db` → `oklch(80% 0.01 240)` ≈ `#bcc3d1` (cool-tinted)
- Muted: `#9ca3af` → `oklch(62% 0.015 240)` ≈ `#8892a4` (cool-tinted)

This is a small shift but would make the entire text stack feel integrated with the surface palette.

### §DC3. Dark Mode Craft Assessment

**Elevation-as-lightness system:** The app uses lightness + translucency + glow to communicate depth, which is the correct dark-mode approach:
- Background: `#010204` (OKLCH ~2%) — deepest void
- Card surface: `rgba(12,16,24,0.55)` (~7% lightness) — elevated
- Card inner: `rgba(6,10,18,1)` (~5% lightness) — grounded inner panel
- Modal: `rgba(12,16,24,0.95)` — most elevated

**✓ No shadows used for elevation** — shadows are only used for glow effects (accent-colored), which is correct.

**✓ OLED mode:** The app has a user-toggleable OLED mode that pushes backgrounds to true `#000000` — appropriate for OLED devices, correctly implemented as an option rather than default.

### §DC4. Brand Color Distinctiveness

**Hue ownership:** Gold (#fbbf24) as primary accent is an excellent choice for a Wuthering Waves companion — it references the game's own Astrite/premium currency color. However, the exact hex `#fbbf24` is Tailwind's `amber-400` — a default value.

**[LOW] D-COLOR-2: Primary gold accent uses Tailwind's default amber-400**

The gold identity is correct for the product. The calibration could be more intentional:
- Current: `#fbbf24` = `oklch(82% 0.17 85)` — Tailwind default
- Option A (minimal): `oklch(80% 0.18 80)` ≈ `#f5b820` — slight hue shift toward pure gold, +1 chroma
- Option B (owned): `oklch(78% 0.19 78)` ≈ `#edaf18` — richer, less "amber," more "Astrite gold"

### §DC5. Color as Narrative

**Color harmony:** Split-complementary — primary warm gold + cool blue-cyan environment + pink/purple as secondary energy. This is a strong, intentional-feeling structure.

**Tension color:** Pink (`#ec4899`) functions as the tension color in the palette — it appears on weapon banners and Havoc element, creating dynamic contrast with the gold. This is used at appropriate frequency (not overloaded).

**Color state narrative:**
```
Onboarding  → Deep void with gold card entrance animations — reads as "opening a treasure chest"
Engagement  → Cool-blue environment with element-colored accents — focused, data-rich
Achievement → Gold pulse animations (kuroPulseOrange), trophy shine effects — celebratory
Error       → Red badges/indicators — proportionate, not panic-inducing
Empty       → Gray-400 text + "Go to Profile tab" button — ✓ action-oriented (P15 fix)
```

**[POLISH] D-COLOR-3: Empty states could use a subtle atmospheric treatment**

Current empty states are functional (`text-gray-400` + button) but lack the atmospheric quality present everywhere else. A faint gold radial glow behind empty-state text would maintain character.

---

## III. TYPOGRAPHY

### §DT1. Type Personality Matrix

**Current typeface:** System font stack (`ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif`)

**Position on matrix:** Neo-grotesque (Helvetica/SF Pro family). Neutral authority.

**Assessment:** The system font stack is a safe, performant choice (zero font loading overhead). However, for a product with a strong Cyberpunk aesthetic where the visual design IS part of the value proposition, a system font stack is a missed opportunity. The type doesn't express the product's character — it's invisible.

**[MEDIUM] D-TYPE-1: System font stack underdelivers for a Cyberpunk/aesthetic-primary product**

Given the axis profile (A4: Strong aesthetic, A5: Amplifies value), the typeface should contribute to the character, not stay neutral.

**Recommendations (zero-load-time options):**
- **Option A: Geist Sans** (Vercel's variable font) — geometric precision, modern, pairs well with cyberpunk. Available via CDN, small download.
- **Option B: Stay with system stack but add character through treatment** — increase `letter-spacing: 0.03em` on all uppercase labels (already done on some), apply `font-variant-numeric: tabular-nums` globally for all number displays.

### §DT2. Typographic Scale & Rhythm

**Extracted sizes:** `text-xl` (20px), `text-lg` (18px), `text-sm` (14px), `text-xs` (12px), `text-[11px]`, `text-[10px]`, `text-[9px]`

**Scale coherence:** The standard Tailwind sizes follow a ratio, but the custom sizes (`9px`, `10px`, `11px`) are tightly packed. This is appropriate for the data-dense gacha companion context — many small labels, stats, and secondary info need to be readable but not competing.

**Weight contrast:**
- 700 (bold) — headers
- 600 (semibold) — labels, emphasis
- 500 (medium) — buttons, interactive text
- 400 (normal) — body

✓ Three weight steps between heading (700) and body (400) — strong hierarchy.

**[LOW] D-TYPE-2: Small text sizes (9-10px) need tabular-nums for stat displays**

Many number-heavy stat displays use `text-[9px]` or `text-[10px]`. At these sizes, proportional numerals cause visible misalignment in columns.

**Fix:** Add `font-variant-numeric: tabular-nums` to the `.kuro-stat` class family and any element displaying numeric data in columns.

### §DT3. Type Craft Signals

**Tracking (letter-spacing):**
- `.kuro-header h3`: `letter-spacing: 0.03em` ✓ appropriate for 13px semibold
- Uppercase labels: `tracking-wider` (0.05em) ✓ applied correctly
- Body text: default (0) ✓ correct for body

**Text rendering:** Not explicitly set.

**[LOW] D-TYPE-3: Missing `-webkit-font-smoothing: antialiased`**

On macOS/Retina displays, `antialiased` smoothing produces thinner, more refined dark-mode type. Without it, text on dark backgrounds can look heavy/blurry.

**Fix:** Add to root CSS: `body { -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }`

### §DT4. Typographic Voice and Expressiveness

**The measure (line length):**

| Context | Current Measure | Assessment |
|---------|----------------|------------|
| Card body text | ~35–45 characters (constrained by card width on mobile) | ✓ Appropriate — tight, editorial, efficient for a data companion |
| Stat labels | ~15–25 characters | ✓ Short, punchy — correct for label context |
| Modal body text | ~50–65 characters | ✓ Comfortable reading range for detail views |
| Empty state messages | ~40–55 characters | ✓ Adequate, though these could benefit from tighter constraint for more impact |

The mobile-first layout naturally constrains measure. No text blocks exceed 75 characters — the app avoids the "wide paragraph on large screen" anti-pattern by keeping content in cards.

**Line-height assessment:**

| Context | Current | Assessment |
|---------|---------|------------|
| Body text (14px) | Tailwind default ~1.5 | ✓ Standard, comfortable for UI text |
| Stat values (9-12px) | Tailwind default ~1.5 | ⚠ At small sizes, 1.5 is generous — could tighten to 1.3 for denser, more "precision instrument" feel |
| Headings (18-20px) | Tailwind default ~1.5 | ⚠ Slightly loose for headings — 1.25-1.3 would feel more confident |

**Typography as composition element:**

The app currently does *not* use typography as a compositional tool — display text is not used as a hero element, no scale contrast creates visual energy, and weight contrast tops out at 400→700 (adequate but not dramatic). This is consistent with the data-dense companion role, but given A5 (Amplifies value), there is one key opportunity:

**[POLISH] D-TYPE-4: Banner countdown timers could use type as visual element**

The pity countdown numbers (e.g., "47 pulls remaining") are the app's highest-emotional-value data point — the number every gacha player watches. Currently rendered at the same scale as surrounding text with `font-weight: 700`. A larger, more dramatic numeral treatment (28-32px, `tabular-nums`, slight `letter-spacing: -0.02em` tightening) would make this moment feel like the "scoreboard" it is for the user — type *as* illustration, not type as label.

**Variable font utilization:** N/A — system font stack does not guarantee variable font availability. If §DT1 recommendation (Geist Sans) is adopted, its `wght` axis (100–900) would enable micro-weight variation: 350 for body (slightly lighter than 400 = more refined dark-mode rendering), 650 for subheadings (more contrast than 600), 800 for key numerals (heavier impact).

**Typographic personality moments:**

| State | Current Type Treatment | Assessment |
|-------|----------------------|------------|
| Empty state | `text-gray-400` body text + action button — plain | ⚠ No typographic expression — could use a larger, lighter-weight statement |
| Error state | Standard red-tinted text | ✓ Appropriate — clinical precision, not dramatic |
| Success state | Standard green-tinted text within stat boxes | ⚠ Gold pulse animation adds motion character, but type remains neutral |
| Loading state | No dedicated loading typography | ⚠ No skeleton text rhythm — staggered card entrance compensates |

---

## IV. MOTION ARCHITECTURE

### §DM1. Motion Vocabulary Card

```
Motion Vocabulary (Current Assessment)
────────────────────────────────────────
Micro-feedback (button press, toggle):
  Duration: 100ms | Easing: ease
  Appropriate?: YES — snappy, immediate

Entrance (cards, modals):
  Duration: 300ms (scaleIn), 400ms (cardSlideIn) | Easing: ease-out
  Appropriate?: YES — elegant staggered reveals with slight scale

Exit (dismiss):
  Duration: 150ms (via transition-fast) | Easing: cubic-bezier(0.16, 1, 0.3, 1)
  Appropriate?: YES — exits faster than entrances

Tab Navigation:
  Duration: 350ms (tabFadeIn) | Easing: ease-out
  Appropriate?: YES — considered but not slow

Ambient (background glow, shimmer, pulse):
  Duration: 2-8s infinite | Easing: ease-in-out / linear
  Appropriate?: YES — atmospheric, not distracting

State change (hover, active):
  Duration: 300ms transform + box-shadow | Easing: cubic-bezier(0.16, 1, 0.3, 1)
  Appropriate?: YES — this "bounce-out" easing (0.16, 1, 0.3, 1) is the app's motion signature
```

**Motion character: Expressive/Playful** — matching the game companion context. Spring-like easing, card entrance stagger, ambient pulse animations all project "this app is alive."

### §DM2. Motion Character vs Axis Profile

Given A2 (Leisure/Emotional) and A4 (Strong aesthetic), the correct motion character is **Expressive/Playful** → Current motion matches perfectly. The custom easing `cubic-bezier(0.16, 1, 0.3, 1)` is used consistently as the primary easing — this IS a motion signature.

### §DM3. Motion Performance

**Compositor-only properties:** ✓ — Animations use `transform` and `opacity` exclusively. No layout/paint-triggering animations found.

**Reduced motion:** ✓ — `.no-animations` class sets all durations to `0.01ms`. Also respects `prefers-reduced-motion: reduce` on initial load.

**Stagger pattern:** Card entrances stagger at 50ms intervals (50, 100, 150, 200ms) — within the ideal 30-50ms range, capped at 200ms. ✓ Correct.

### §DM4. Micro-interaction Design

**1. Hover states:**

| Element | Hover Treatment | Assessment |
|---------|----------------|------------|
| `.kuro-card:hover` | Border brightens (`0.08→0.15`), `translateY(-2px)`, enhanced box-shadow with faint gold glow `rgba(237,175,24,0.03)` | ✓ Excellent — multi-layered response: lift + brighten + glow. Communicates interactivity with character. |
| `.kuro-btn:hover` | Border brightens (`→0.2`), text goes white, `translateY(-2px)`, ripple pseudo-element fades in | ✓ Strong — consistent lift behavior with cards. Ripple effect adds personality. |
| `.kuro-input:hover` | Border subtly brightens (`0.2→0.3`) | ✓ Appropriate — inputs should respond but not distract |
| `.pull-log-row:hover` | Background `rgba(255,255,255,0.08)` | ✓ Subtle list-row hover — correct for data-dense context |
| `.glow-gold:hover` (5-star pulls) | `box-shadow: 0 0 30px rgba(237,175,24,0.25)` | ✓ Character-positive — gold glow on premium items signals rarity |
| Element-glow variants (`.glow-purple`, `.glow-cyan`, etc.) | Element-colored 30px glow at 0.25 opacity | ✓ Consistent system — each game element gets its own glow color |

**Hover consistency:** ✓ All interactive elements respond. The consistent pattern is: border brighten + subtle lift + optional glow. Transition timing uses the signature `cubic-bezier(0.16, 1, 0.3, 1)` — the "bouncy precision" feel carries through every hover.

**2. Focus rings:**

```
*:focus-visible {
  outline: 2px solid rgba(var(--color-gold), 0.7);
  outline-offset: 2px;
}

button:focus-visible, input:focus-visible {
  outline: 2px solid rgba(var(--color-gold), 0.8);
  outline-offset: 2px;
  box-shadow: 0 0 0 4px rgba(var(--color-gold), 0.15);  /* halo effect */
}
```

✓ **Character-positive focus system.** Gold focus rings match the primary accent identity. The 4px halo at 0.15 opacity creates a glow effect consistent with the app's atmospheric vocabulary. This is significantly better than browser defaults and expresses the product character at the accessibility layer.

**3. Active/press states:**

| Element | Active Treatment | Assessment |
|---------|-----------------|------------|
| `.kuro-btn:active` | `translateY(0) scale(0.97)`, `transition: 0.1s ease` | ✓ Physical compression — fast (100ms), returns to baseline. Feels "pressed into surface." |
| `.kuro-card.interactive:active` | `translateY(0) scale(0.98)` | ✓ Slightly less compression than buttons — proportional to visual weight. Correct. |
| Active toggle states (`.active-gold`, `.active-pink`, etc.) | Full glow envelope: accent bg at 0.15 + border at 0.7 + `box-shadow: 0 0 25px` + `animation: borderGlow 2s infinite` | ✓ Exceptional — active toggles get the full atmospheric treatment. The 2s breathing glow on selected elements is a strong personality moment. |

**4. Loading and skeleton states:**

**[MEDIUM] D-MOTION-1: No skeleton/loading state system**

The app has no dedicated skeleton loaders, shimmer placeholders, or loading indicators. Content appears via staggered card entrance animations (50ms intervals), which masks brief load times effectively. However, for longer operations (initial data import, API fetches), there is no designed loading state — the user sees nothing, then everything appears at once.

**Recommendation:** Design a character-appropriate loading system:
- **Skeleton color:** Use `rgba(12,16,24,0.55)` with the gold shimmer line treatment already on cards — skeletons as "empty cards" with the shimmer line still pulsing, signaling "something is coming"
- **Animation:** The existing 3s shimmer pulse is perfect as a loading indicator — apply to skeleton blocks
- **No spinner** — spinners contradict the atmospheric character. The shimmer pulse IS the loading signal.

**5. Scroll behavior:**

✓ **Custom scrollbar styling implemented:**
- Vertical scroll containers: `scrollbar-width: thin`, 3px webkit scrollbar with `rgba(255,255,255,0.15)` thumb
- Nav/horizontal: scrollbar hidden entirely (`scrollbar-width: none`)
- Hover: scrollbar thumb brightens to `rgba(255,255,255,0.25)`

✓ **Scroll character matches product:** Thin, nearly invisible scrollbars that brighten on hover — consistent with the "void with floating content" spatial character. The 3px width is unusually refined for a web app.

**No scroll-triggered reveals or parallax** — appropriate for a utility companion app. The canvas wave background provides ambient atmospheric motion without scroll-linked effects.

### §DM5. Motion Signature

**Identified:** The app HAS a motion signature — the `cubic-bezier(0.16, 1, 0.3, 1)` easing applied to all interactive transitions. This produces a distinctive "bouncy precision" feel — elements move quickly then settle with a slight deceleration overshoot. It's used on cards, buttons, inputs, and hover states. This should be protected across updates.

---

## V. VISUAL HIERARCHY & GESTALT

### §DH1. Hierarchy Engineering

**Squint test (Tracker tab):**
1. Eye lands on: Banner card character artwork + countdown timer — ✓ correct (these are the primary info)
2. Eye moves to: Gold/pink/cyan element-colored stat boxes — ✓ strong secondary reading
3. Then to: Pull history list — ✓ tertiary detail

**✓ Hierarchy is well-engineered.** The element-color coding creates natural grouping (Gestalt similarity) while the gold accent draws attention to primary CTAs.

### §DH2. Reading Pattern

The app uses a mobile-first single-column layout with tab navigation. This naturally creates an F-pattern where the top (header + server selector) and left-aligned content dominate reading flow. ✓ Correct for the form factor.

### §DH3. Visual Weight Distribution

**Weight map — Tracker tab (primary screen):**

```
Visual Weight Distribution (size × saturation × contrast)
──────────────────────────────────────────────────────────
┌─────────────────────────────────────┐
│  Header (semi-transparent, sticky)  │  LOW weight — recedes correctly
│  Server selector                    │
├─────────────────────────────────────┤
│  ████ BANNER CARD ████████████████  │  HIGHEST weight — character artwork
│  ████ (character art + countdown) █ │  + gold accent + large surface area
│  ████████████████████████████████████│  → ✓ Primary user focus
├─────────────────────────────────────┤
│  [Gold stat] [Cyan stat] [Pink stat]│  HIGH weight — element-colored
│  Pity counts + % probabilities      │  glow badges at full saturation
│                                     │  → ✓ Secondary reading (key data)
├─────────────────────────────────────┤
│  Pull history row 1                 │  MEDIUM weight — text-dominant,
│  Pull history row 2                 │  muted colors, smaller elements
│  Pull history row 3                 │  → ✓ Tertiary (historical data)
│  ...                                │
├─────────────────────────────────────┤
│  [Tracker] [Stats] [Collection]     │  LOW weight — tab bar is navigation
│  [Profile]                          │  scaffold, not content
└─────────────────────────────────────┘
```

**Weight concentration:** ✓ Visual weight is concentrated at the banner card (top 30% of viewport) where the primary information lives. The element-colored stat boxes create a strong secondary band. Pull history rows correctly recede into tertiary reading.

**Heavy corner test:** No heavy corner detected. The single-column mobile layout prevents asymmetric weight accumulation. Content is center-weighted with consistent left-aligned text.

**The 80/20 test:** ✓ A user can accomplish their primary task (check pity count, see next banner) by interacting with only the top 25% of the screen (banner card + stat boxes). The pull history below is supplementary detail, not required for the core task.

**Weight distribution by tab:**

| Tab | Weight Anchor | Secondary | Assessment |
|-----|--------------|-----------|------------|
| Tracker | Banner card (character art) | Element-colored stat boxes | ✓ Clear hierarchy — primary info dominates |
| Stats | Probability charts + large numbers | Secondary stat breakdowns | ✓ Numbers carry appropriate weight |
| Collection | Character grid (40×40px portraits) | Detail modal on tap | ✓ Grid creates even weight — intentional for browsing |
| Profile | Import button (emerald glow) | Settings toggles | ✓ Primary action (import) is the heaviest element |

**[POLISH] D-HIERARCHY-2: Collection tab has uniform visual weight across all characters**

In the Collection grid, all characters have identical visual weight (same size portrait, same border treatment). For a gacha companion, 5-star characters could carry slightly more weight (larger portrait, glow border, or element-color tint) to create a natural hierarchy that mirrors the game's rarity system. This would make the grid scannable by rarity without requiring the user to read star counts.

### §DH4. Contrast as Composition

**Value contrast:** Excellent. The near-black void (`#010204`) creates maximum contrast with the translucent card surfaces, which in turn contrast with bright accent colors. The hierarchy is: void → card → accent glow.

**Chroma contrast:** Strong. Most of the interface is achromatic (gray/blue-tint surfaces), making the element-colored accents (orange, purple, cyan, etc.) immediately focal when they appear. This is the correct application of the isolation principle.

**[POLISH] D-HIERARCHY-1: Card corner decorations (L-shapes) are too subtle to read as intentional**

The `.kuro-card-inner::before` and `::after` pseudo-elements create 12×12px L-shaped corner decorations at `rgba(255,255,255,0.1) × opacity(0.7)` — this is ~7% visible. At this opacity, they read as rendering artifacts rather than design details. Either increase opacity to `0.15-0.2` to make the motif legible, or remove entirely.

---

## VI. SURFACE & ATMOSPHERE

### §DSA1. Background as Material

**Background type:** Gradient mesh (procedural canvas) + chromatic near-black. The `BackgroundGlow` canvas animation creates a subtle, living atmospheric effect — dark blue-green waves that breathe slowly. This is premium-tier background treatment for a web app.

**✓ Matches axis profile.** For A4 (Strong aesthetic) and A5 (Amplifies value), an active background that provides atmosphere without competing with content is correct.

### §DSA2. Elevation System

**Current elevation system:**

| Layer | Treatment | Value |
|-------|-----------|-------|
| Void (background) | Canvas + gradient | `#010204` → `#030610` |
| Cards | Frosted glass + border + inset highlight | `rgba(12,16,24,0.55)`, blur(4px) |
| Card inner | Solid dark | `rgba(6,10,18,1)` |
| Modals | High-opacity frosted | `rgba(12,16,24,0.95)`, scaleIn entrance |
| Header | Semi-transparent + blur | `rgba(8,12,18,0.92)`, blur(20px), sticky |

✓ Clear elevation hierarchy. Each layer is perceptually distinct. No shadows used for elevation (correct for dark mode) — only glow effects on hover.

### §DSA3. Atmosphere Signals

**Border opacity treatment:** ✓ `rgba(255,255,255,0.08)` default borders — semi-transparent, adapts to surface. This is the refined approach.

**Inset highlight:** ✓ `inset 0 1px 0 rgba(255,255,255,0.05)` on cards — subtle top-edge light that implies a light source above. Consistent.

**Shimmer line:** The `.kuro-card::after` 1px gradient shimmer at the top of every card is a distinctive atmospheric detail. Its slow 3s pulse gives cards a "breathing" quality.

**Corner decorations:** L-shaped corner marks on cards are a design motif reference to sci-fi/cyberpunk UI frames. See D-HIERARCHY-1 regarding visibility.

### §DSA4. Light Physics

**Light source identification:**

```
Light direction: Ambient top — no strong directional source
Light quality:   Soft / diffuse — no hard shadows anywhere
Light warmth:    Cool-white (implied by blue-tinted surfaces)
Light intensity: Low (atmospheric) — deep void absorbs light; surfaces glow from within
```

**Light source consistency:**

✓ **All shadows are vertical-only** — shadow custom properties use `0 Ypx` offsets exclusively:
- `--shadow-sm: 0 1px 2px rgba(0,0,0,0.3)`
- `--shadow-md: 0 4px 12px rgba(0,0,0,0.4)`
- `--shadow-lg: 0 8px 24px rgba(0,0,0,0.5)`
- `--shadow-xl: 0 12px 40px rgba(0,0,0,0.6)`

No horizontal shadow offsets → consistent "above" light source. No shadow angle conflicts found.

✓ **Highlights appear on correct edge** — `inset 0 1px 0 rgba(255,255,255,0.05)` places the highlight on the top edge of cards, consistent with light from above.

**Light-surface interaction:**

| Surface Type | Treatment | Physics Assessment |
|-------------|-----------|-------------------|
| Cards (glass) | Inset top highlight + shimmer line + frosted blur | ✓ Correct glass physics — top-edge specular + translucency |
| Buttons (glass) | Border glow + ripple pseudo-element on hover | ✓ Luminous surface — emits its own light on interaction |
| Active states | Element-colored outward glow `0 0 25px rgba(color, 0.3)` | ✓ Self-luminous — glow emanates from element's own color, not white |
| Background (void) | Canvas wave animation — procedural blue-green light | ✓ Background acts as a distant light source beneath the UI layer |
| Stat boxes | Element-color border glow | ✓ Each element produces its own colored light — physically coherent |

**Dark mode light physics:**

✓ The app correctly treats its dark UI as looking *up* toward diffuse light:
- Higher elevation = lighter OKLCH value (cards at ~7% > void at ~2%)
- Shadows are purely for depth cue, not for catching directional light
- No shadows on cards (correct — shadows invisible on dark) — only glow effects
- Glow effects replace shadow as the primary "this element is elevated" signal

**Light coherence verdict:** ✓ Excellent. The entire light system is coherent: ambient overhead light illuminates card top edges, surfaces glow from within using their accent color, and the canvas background functions as a subsurface luminous plane. No conflicting light directions found.

### §DSA5. Focal vs Ambient Atmosphere

**Atmosphere hierarchy map:**

```
Background atmosphere  → Canvas wave glow (BackgroundGlow + TriangleMirrorWave)
   ↓                     Opacity: 0.3 max | Always present | z-index: 1-2
   ↓                     Color: blue-green procedural waves + triangle mesh specular
Surface atmosphere     → Card shimmer line (::after 1px gradient, 3s pulse)
   ↓                     Border glow (rgba white 0.08) | Present on all cards
   ↓                     Inset highlight (1px top edge)
Focal atmosphere       → Element-colored glow on stat boxes and active states
   ↓                     Gold glow on banner countdown | 0.25-0.3 opacity
   ↓                     Active button border pulse (borderGlow 2s infinite)
Accent atmosphere      → 5-star pull glow (gold 30px glow on hover)
                         Trophy shine animation (3s pulsing opacity)
```

**Ambient/focal distinction:** ✓ Clear — the canvas background provides constant atmospheric motion at low intensity. Card shimmer lines are surface-level atmosphere (present on every card but subtle). Focal glow concentrates on interactive moments (hover, active toggle) and high-value data (5-star pulls, pity countdown). The 5-star pull gold glow appears only on premium items — correctly reserved.

**Glow frequency analysis:**

| Glow Type | Frequency | Assessment |
|-----------|-----------|------------|
| Canvas wave (ambient) | Always visible on every screen | ✓ Atmosphere baseline — never competes with content |
| Card shimmer (surface) | Every card, every screen | ✓ High frequency but extremely subtle (3s pulse, ~50% opacity gradient) |
| Border glow on hover (focal) | Only on hover — transient | ✓ Appears only on interaction — earned, not default |
| Active state glow (focal) | Only on selected elements (1-2 per screen) | ✓ Concentrated on the user's current selection |
| 5-star/trophy glow (accent) | Rare — only premium items | ✓ Rarest glow = highest value signal |

**[POLISH] D-ATMOSPHERE-1: Atmosphere hierarchy could be more pronounced at the focal level**

The ambient layer (canvas) and surface layer (card shimmer) are excellently calibrated. The focal layer, however, is only active on *hover* — when the user is not hovering, the stat boxes and banner card sit at the same atmospheric intensity as every other card. The banner card (the single most important element) could benefit from a persistent subtle glow (gold at 0.05 opacity) to signal its primacy even at rest — creating a "breathing focal point" effect that strengthens the hierarchy without requiring interaction.

---

## VII. ICONOGRAPHY

### §DI1. Icon Language

**Library:** Lucide React (single source ✓)
**Style:** Line icons, consistent 24px grid
**Coherence:** ✓ All icons from one family with consistent stroke weight

**[LOW] D-ICON-1: Default Lucide icons are stylistically neutral for a cyberpunk product**

Lucide is a competent library but reads as "starter kit" — the rounded terminals and friendly proportions slightly contradict the Cyberpunk character. For this product's axis profile, **Phosphor Icons** with `weight="thin"` or `weight="light"` would project more precision/edge while maintaining the same semantic coverage.

**Priority:** Low — the current icons don't actively hurt the design, they just don't amplify it.

### §DI2. Icon Grid & Optical Sizing

**Icon grid compliance:**

Lucide icons use a 24×24 grid with 2px internal padding (20×20 content area). The app renders icons at three primary sizes:

| Render Size | Usage | Optical Assessment |
|-------------|-------|-------------------|
| 12px | Rarity stars (`<Star size={12} />`) | ⚠ At 12px, the 24px-designed icon is scaled to 50% — fine for simple shapes (star) but complex icons would lose detail |
| 14px | Section headers, indicators (`<Target>`, `<Swords>`, `<Zap>`, `<Star>`) | ✓ Most common size — 58% scale. Simple Lucide icons remain legible. Stroke weight renders at ~0.87px effective — slightly thin but functional |
| 16px | Modal close button (`<X size={16} />`) | ✓ Close/dismiss — large enough for touch, simple glyph |
| 32px | Onboarding step icons (`<Sparkles size={32} />`) | ✓ Display size — full detail preserved, appropriate for decorative role |

**Icon-to-text alignment:**

Icons are aligned via `flex items-center justify-center` inside container `div`s (typically `w-8 h-8` containers for 14px icons). This creates mathematical centering rather than optical centering.

**[POLISH] D-ICON-2: 14px icons in 32px containers create excessive padding**

The common pattern of a 14px icon inside a `w-8 h-8` (32×32px) container means the icon occupies only 19% of the container area. This is generous spacing that reads as "icon in a box" rather than "icon as label." Reducing containers to `w-6 h-6` (24×24px) would tighten the optical relationship between icon and surrounding text, matching the app's dense spatial character.

**Interactive icon states:**

Icon-only buttons (modal close `<X>`) rely on the parent button's hover/active state. The icon itself does not change color or weight on hover. This is acceptable given the app's current icon investment level (Utilitarian), but if icons are upgraded to Signature level per §DI3, individual icon state transitions would strengthen the micro-interaction vocabulary.

### §DI3. Icon Expressiveness Spectrum

**Current position:** **Utilitarian** — Standard Lucide library, no customization, zero modification to default rendering. Icons function purely as semantic indicators.

**Appropriate position given axis profile:** **Signature** — Given A4 (Strong aesthetic) and A5 (Amplifies value), the icon system should express the cyberpunk character. The app has invested heavily in atmospheric surfaces, motion, and color — icons are the one visual layer that remains at "starter kit" level.

**Gap: Utilitarian → Signature** (2 levels)

**Character alignment check:**

| App Character | Current Icon Choice | Assessment |
|---------------|-------------------|------------|
| Cyberpunk/Terminal | Lucide (rounded terminals, friendly proportions) | ✗ Misaligned — Lucide's rounded, humanist endpoints contradict the angular, precision-oriented character |
| Cold precision | Lucide default weight (2px stroke) | ⚠ Slightly heavy — a thinner stroke (1.5px or `weight="light"`) would read as more precise |
| Void/atmospheric | Icons at neutral gray with no glow | ⚠ Icons don't participate in the atmospheric layer — they sit as flat vector shapes on a living surface |

**Recommendation path to Signature level:**

1. **Immediate (no library change):** Add `color` transitions to icons on hover (fade from `text-gray-400` to element-appropriate accent color). Icons should participate in the interactive glow system.
2. **Short-term:** Switch to **Phosphor Icons** with `weight="thin"` — sharper terminals, more geometric construction, configurable weight. Same semantic coverage as Lucide, better character fit.
3. **Long-term (if design investment continues):** Commission a small set of 8-10 custom icons for the most-used functions (star/rarity, element icons, pity counter, import) with angular terminal treatments matching the card corner-decoration motif.

---

## VIII. DESIGN TREND CALIBRATION

### §DDT1. Trend Inventory

| Trend | Present? | Execution Quality | Appropriate? |
|-------|----------|-------------------|--------------|
| Glassmorphism | Yes (cards, buttons, inputs) | HIGH — blur on dark surfaces with chromatic underlayer works. Text contrast maintained. | ✓ Yes — the dark base with procedural glow beneath glass surfaces creates the "vivid backdrop" glassmorphism requires |
| Aurora/chromatic gradients | Yes (canvas background) | HIGH — procedural, subtle, living atmosphere | ✓ Yes — appropriate for aesthetic-primary gaming companion |
| Dot/grid texture | No | — | Not needed |
| Neo-brutalism | No | — | Would be wrong for this product |

**Trend posture:** Trend Selective — uses glassmorphism and aurora where they serve the cyberpunk character, ignores irrelevant trends. ✓ Correct posture for this product.

### §DDT2. Trend Strategy

**Appropriate posture:** **Trend Selective** — Given A1 (Non-revenue), A2 (Leisure/Emotional), and A4 (Strong aesthetic), the product should use trends where they serve the aesthetic vision and ignore them elsewhere. It should not chase trends (wrong for a companion tool with a specific identity) nor be trend-agnostic (wrong for a product where aesthetics amplify value).

**Actual posture:** **Trend Selective** — ✓ Aligned. Glassmorphism is used because frosted glass surfaces serve the "content floating in void" spatial character. Aurora gradients are used because procedural canvas backgrounds serve the "living atmosphere" personality. Neo-brutalism, neumorphism, bento grids, and dot textures are correctly absent.

**Posture gap:** None — intended and actual trend posture are aligned.

**Trend adoption quality bar assessment:**

| Trend In Use | Quality Bar | Current Execution | Above Bar? |
|-------------|-------------|-------------------|------------|
| **Glassmorphism** | Requires vivid backdrop, text 4.5:1 contrast, sufficient blur | Backdrop = procedural canvas glow (vivid ✓). Blur at 4-8px (adequate). Text contrast maintained on semi-transparent surfaces. | ✓ Yes — the procedural canvas beneath glass surfaces creates the "something to blur through" that glassmorphism requires |
| **Aurora/chromatic gradients** | Must feel organic and living; no banding; text zones clean | Procedural canvas (sine wave functions) = truly organic. No CSS gradient banding. Text zones are on card surfaces above the aurora, not directly over it. | ✓ Yes — implementation uses canvas (no banding risk), and content sits on elevated frosted surfaces above the aurora |

**Trend debt check:** No trend debt found. Neither glassmorphism (cooling but not passed) nor aurora gradients (currently peak) have reached "dated" status. The procedural canvas implementation future-proofs the aurora trend — it can be subtly adjusted (color, speed, pattern) without replacing the system.

**Trend risk forecast:**

```
Glassmorphism:  Currently COOLING — may feel dated in 2-3 years.
  Mitigation:   The app's glassmorphism is subtle (low blur, translucent cards) rather
                than heavy (full-screen frosted panels). This means it will age gracefully
                as "translucent dark UI" rather than "2022 glassmorphism."
  Action:       No change needed now. If the trend passes fully, reduce blur values and
                increase card background opacity — the transition from glass to solid-dark
                can be seamless.

Aurora gradients: Currently PEAK — will cool within 1-2 years.
  Mitigation:   Procedural canvas is not a CSS gradient — it's a living, unique animation.
                This reads as "custom atmospheric background" rather than "trend-following
                gradient." It will age as "distinctive" rather than "dated."
  Action:       No change needed. The canvas system is a signature element (§DBI2),
                not a trend adoption.
```

---

## IX. BRAND IDENTITY

### §DBI1. Brand Personality Archetype

**Current archetype:** **Magician** — premium, transformative (probability engine that reveals hidden gacha math), mystical (gold glow, wave backgrounds, the name "Whispering Wishes")

**Visual alignment:** ✓ Strong — the dark void + gold accent + living background + data precision creates the "Magician" feel: "I know something you don't, and I'll show you."

### §DBI2. Design DNA — Signature Elements

| Signature | Type | Distinctiveness | Visibility |
|-----------|------|-----------------|------------|
| Gold shimmer line on card top edges | Surface | HIGH — not seen in competitor apps | Every screen (all cards) |
| Corner L-shape decorations | Surface | MEDIUM — cyberpunk motif, uncommon in web | Every card (but too subtle — see D-HIERARCHY-1) |
| Canvas wave background | Atmosphere | HIGH — procedural, unique to this app | Always visible behind content |
| `cubic-bezier(0.16, 1, 0.3, 1)` easing | Motion | MEDIUM — distinctive bounce-settle | All transitions |
| Element-color-coded glow on stat boxes | Color | HIGH — maps to game's element system | Tracker + stats tabs |

**Assessment:** The app has 5 viable signature elements — a strong portfolio. The shimmer line and canvas background are the most distinctive. These should be formally protected.

### §DBI3. Anti-Genericness Audit

| # | Signal | Present? | Severity |
|---|--------|----------|----------|
| 1 | Default Tailwind blue (`#3b82f6`) as accent | ✗ No — gold is the accent | n/a |
| 2 | Inter at default weight | ✗ No — system stack used | n/a |
| 3 | `rounded-lg` on everything | ✗ No — radius varies: 16px cards, 12px buttons, full badges | n/a |
| 4 | 16px grid spacing only | ✗ No — uses 14px card padding, varied gaps | n/a |
| 5 | `shadow-sm` on cards | ✗ No — custom multi-layer shadow + glow | n/a |
| 6 | Default Lucide icons | ⚠ Partial — Lucide used, but with intent | [LOW] D-ICON-1 |
| 7 | Gray-900/500/400 text stack | ⚠ Yes — neutral grays without blue temperature | [MEDIUM] D-COLOR-1 |
| 8 | `#ffffff` / `#0f1117` backgrounds | ✗ No — uses chromatic `#080c14` | n/a |
| 9 | `transition: all 0.2s ease-in-out` | ✗ No — custom easing + specific properties | n/a |
| 10 | Full-width buttons | ✗ No — buttons sized to content | n/a |
| 11 | Single separator style | ✗ No — borders at multiple opacities | n/a |
| 12 | Default placeholder color | Not checked (inputs minimal) | n/a |

**Genericness score: 2/12** — Only the text color stack and icon library register as generic signals. This is a well-differentiated product visually.

---

## X. COMPETITIVE POSITIONING

### §DCP1. Benchmarks

**Benchmark A: Paimon.moe (Genshin Impact)**
- Visual character: Clean light-mode utility tool, minimal styling
- Genericness score: 2/5 — recognizable but functional, not distinctive
- Relation to this app: Whispering Wishes is significantly ahead in visual quality

**Benchmark B: WuWa Tracker (wuwatracker.com)**
- Visual character: Dark mode utility, basic Tailwind styling, data-forward
- Genericness score: 1/5 — template-level design
- Relation to this app: Whispering Wishes is dramatically ahead

**Benchmark C: Prydwen.gg**
- Visual character: Content-dense, editorial, professional but generic
- Genericness score: 2/5 — competent but not distinctive
- Relation to this app: Whispering Wishes is ahead in visual identity, Prydwen ahead in content breadth

**Whitespace opportunity:**
```
Available position: "Premium dark gacha companion with atmospheric design quality"
Why it's available: All competitors optimize for utility, none invest in visual craft
Fit for this app: Perfect — already occupying this position
Claim strategy: Protect the canvas background, deepen the card shimmer, and refine the text color stack
```

### §DCP2. Positioning Matrix

**Axes chosen for gacha companion domain:** Generic ←→ Authentic × Polished ←→ Raw

```
                        POLISHED
                           │
                           │
        Whispering         │
         Wishes ●          │
                           │
                           │
  GENERIC ─────────────────┼──────────────────── AUTHENTIC
                           │
               Prydwen ●   │
                           │
                           │
        Paimon.moe ●       │       ● WuWa Tracker
                           │
                        RAW
```

**Positioning analysis:**

| Product | Position | Rationale |
|---------|----------|-----------|
| **Whispering Wishes** | Polished + Generic-leaning-Authentic | Premium visual craft (polished axis), game-derived element colors and terminology (authentic axis), but system font and neutral gray text hold it back from fully authentic |
| **Paimon.moe** | Mid-Raw + Generic | Clean light-mode UI, functional but visually generic. No atmospheric investment. Reads as "community utility." |
| **WuWa Tracker** | Raw + Slightly Authentic | Dark mode with basic Tailwind, game-appropriate colors but template execution. Raw craft level. |
| **Prydwen.gg** | Mid-Polished + Generic-Mid | Professional editorial layout, competent design, but generic — could be any content wiki. No game-specific atmosphere. |

**Whitespace identified:** The **Polished + Fully Authentic** quadrant is unoccupied. No gacha companion in the Wuthering Waves ecosystem achieves both premium visual craft AND deep game-aesthetic authenticity (using the game's own design language, not just its colors).

**Whispering Wishes is closest** to this position. The gap is narrow: replacing the neutral text stack with cool-tinted chromatic text (D-COLOR-1) and adopting a character-positive typeface (D-TYPE-1) would move the app into the unoccupied quadrant — a position no competitor currently threatens.

### §DCP3. Visual Differentiation Opportunities

```
Differentiator 1: Atmospheric depth
  Current state:   Canvas wave background + frosted glass cards — already distinctive
  Target state:    Maintain and protect. This is the primary visual differentiator.
                   No competitor has procedural background animation.
  Effort:          None (already implemented)
  Competitive value: Differentiates from ALL benchmarks — none invest in ambient atmosphere

Differentiator 2: Chromatic text integration
  Current state:   Neutral Tailwind grays (text-gray-300/400/500)
  Target state:    Cool-blue-tinted text stack: oklch(92% 0.01 240) primary,
                   oklch(80% 0.01 240) secondary, oklch(62% 0.015 240) muted
  Effort:          Low — CSS variable replacement, ~15 minutes
  Competitive value: No competitor uses chromatically integrated text. This would
                     make Whispering Wishes the only tool in the space where the
                     text feels "designed" rather than "defaulted."

Differentiator 3: Game-authentic typography
  Current state:   System font stack (invisible, personality-absent)
  Target state:    Geist Sans (geometric precision, cyberpunk-adjacent) or
                   alternative with angular character
  Effort:          Low-Medium — font import + weight configuration
  Competitive value: Paimon.moe uses Inter. Prydwen uses system stack. WuWa Tracker
                     uses system stack. A distinctive typeface would be immediately
                     noticeable as "this product was designed."
```

---

## XIII. DESIGN CHARACTER SYSTEM

### §DP0. Character Extraction

```
CHARACTER EXTRACTION — read from code

Color character:
  Background values: #080c14, gradient #010204→#030610 (chromatic deep blue-black)
  Surface values: rgba(12,16,24,0.55) cards, rgba(6,10,18,1) inner panels
  Accent values: #fbbf24 gold (high-chroma warm), element colors at Tailwind 400-500
  Overall palette feeling: "Cold void with warm gold signature — controlled neon accents per game element"

Spatial character:
  Dominant padding: 14px (cards), 10-12px (buttons), 4px (tight elements)
  Spacing rhythm: Tight — dense data presentation with controlled breathing room
  Gap between sections: 8-12px between cards, 16px between major sections
  Overall density: Information-dense / balanced — appropriate for stat-heavy gacha companion

Typography character:
  Typeface: System stack (SF Pro / Segoe UI depending on OS)
  Weight range: 400–700
  Size range: 9px–20px
  Overall type feeling: Neutral/clinical — does not express the cyberpunk character

Component character:
  Border radius: Varied (16px cards, 12px buttons, full badges) — shows intentional assignment
  Shadow: Multi-layer with glow effects — premium craft
  Border: Semi-transparent white at 0.08–0.15 opacity — sophisticated technique
  Button: Frosted glass filled with glow on active — expressive

Motion character:
  Durations: 100-400ms range, staggered entrances, ambient 2-8s pulses
  Easing: cubic-bezier(0.16, 1, 0.3, 1) as signature easing
  Overall: Expressive/alive — the app breathes, elements respond, transitions have personality

Icon character:
  Library: Lucide (line style, consistent weight)
  Overall: Generic-kit — functional but personality-neutral

Copy/voice character:
  Formality: Expert casual ("Resonators", "Astrite", game-native terminology)
  Personality: Voiced in places ("Nothing to show yet"), domain-fluent
  Overall: Insider-expert — speaks the game's language

Emergent personality statement:
  "Based on these decisions, this app reads as: atmospheric precision instrument"
  Strongest signals: (1) Canvas wave background, (2) Gold shimmer card lines, (3) Element-color glow system
  Weakest/incoherent: (1) Neutral gray text stack, (2) System font with no character, (3) Corner decorations too faint
```

### §DP1. Character Dimensions Analysis

#### Dimension 1 — Visual Voice

```
Terse ━━━━━━━━━━●━━━━━━━━━━ Expansive
                 ↑ CURRENT (7/10 terse)
                 ↑ TARGET  (7/10 terse) ✓ ALIGNED
Dense cards, tight spacing (14px padding), small text (9-10px stats).
No decoration for decoration's sake. Every element serves a data function.

Cold ━━━━━━━━●━━━━━━━━━━━━━ Warm
              ↑ CURRENT (8/10 cold)
              ↑ TARGET  (7/10 cold) ≈ ALIGNED
Cool-blue surfaces, void background, cyan/purple accents. Gold accent introduces
controlled warmth — but text stack is neutral gray (should be cool-tinted).
Gap: Neutral gray text is neither cold nor warm — it's absent. Fix: D-COLOR-1.

Formal ━━━━━━━●━━━━━━━━━━━━ Casual
               ↑ CURRENT (7/10 formal)
               ↑ TARGET  (6/10 formal) ≈ ALIGNED
Structured card layouts, consistent borders, hierarchical tabs. Copy is expert-casual
("Resonators", game-native terminology) — slightly less formal than the visual language.
Acceptable tension between visual formality and copy casualness.

Restrained ━━━━━━━━━●━━━━━━ Expressive
                     ↑ CURRENT (6/10 expressive)
                     ↑ TARGET  (7/10 expressive) ≈ ALIGNED
Canvas wave backgrounds, element-color glow, shimmer lines, staggered card entrances —
the app is more expressive than most utility tools. Could push further on typography
expressiveness (D-TYPE-4 banner countdown treatment).
```

#### Dimension 2 — Spatial Character

```
Dense ━━━━━━━━●━━━━━━━━━━━━ Airy
              ↑ CURRENT: 7/10 dense — 14px card padding, 8-12px gaps, 9-10px text
              ↑ TARGET:  7/10 dense ✓ ALIGNED

Flat ━━━━━━━━━━━━━━━●━━━━━━ Deep
                     ↑ CURRENT: 8/10 deep — 6 distinct Z-layers (void→canvas→vignette→cards→content→modals)
                     ↑ TARGET:  8/10 deep ✓ ALIGNED

Rigid ━━━━━━━━●━━━━━━━━━━━━ Fluid
              ↑ CURRENT: 7/10 rigid — single-column, tab-based, grid-locked cards
              ↑ TARGET:  7/10 rigid ✓ ALIGNED

Anchored ━━━━━━━━━━━━●━━━━━ Floating
                      ↑ CURRENT: 7/10 floating — content appears to float above void
                      ↑ TARGET:  7/10 floating ✓ ALIGNED
```

All four spatial dimensions are aligned. The "dense + deep + rigid + floating" combination creates the "atmospheric precision instrument" spatial character correctly.

#### Dimension 3 — Material Character

**Current material:** **Glass + Void** — Translucent frosted-glass cards (`backdrop-filter: blur`, semi-transparent `rgba` backgrounds, inset top highlight) float in luminous void (`#010204` near-black with canvas wave animation beneath).

| Material Property | Evidence |
|------------------|----------|
| Glass indicators | Blur filter, translucency, thin borders, top-edge specular highlight |
| Void indicators | Near-black base, no material "floor," content floats without ground plane |
| Luminous indicators | Element-colored glow emanates from interactive elements; canvas provides subsurface light |

**Target material:** Glass + Void — ✓ **Aligned with axis profile.** For a cyberpunk/atmospheric product (A4: Strong aesthetic), the glass-on-void material feels premium, digital-native, and game-appropriate.

**Material contradictions:** No component contradicts the dominant glass/void material. Every card, button, and input uses the same frosted-glass vocabulary. The only neutral elements are the text colors (Tailwind grays carry no material quality — they read as "no material" rather than "glass material"). Fix: D-COLOR-1 chromatic tinting.

#### Dimension 4 — Interaction Character

```
Mechanical ━━━━━━━━━━━━━●━━ Physical
                         ↑ CURRENT: 7/10 physical — scale(0.97) press, translateY(-2px) lift, glow
                         ↑ TARGET:  7/10 physical ✓ ALIGNED

Snappy ━━━━━━●━━━━━━━━━━━━━ Considered
              ↑ CURRENT: 100ms micro, 300ms entrance, 150ms exit — snappy-leaning
              ↑ TARGET:  6/10 snappy ✓ ALIGNED

Passive ━━━━━━━━━━━━━●━━━━━ Reactive
                      ↑ CURRENT: 7/10 reactive — generous hover (lift + brighten + glow), focus ring
                      ↑ TARGET:  7/10 reactive ✓ ALIGNED

Silent ━━━━━━━━━━━━━━━━●━━━ Expressive
                        ↑ CURRENT: 7/10 expressive — borderGlow animation, gold pulse, staggered reveal
                        ↑ TARGET:  7/10 expressive ✓ ALIGNED
```

Interaction character is fully coherent. The `cubic-bezier(0.16, 1, 0.3, 1)` signature easing produces a consistent "bouncy precision" feel across all interactions.

#### Dimension 5 — State Character Consistency

| State | Character from §DP0 | Character Here | Consistent? |
|-------|-------------------|----------------|------------|
| First arrival (onboarding) | Atmospheric precision instrument | Gold-accented step cards, canvas background visible, clear action sequence | ✓ Yes — onboarding is atmospheric and precise |
| Active engagement (tracker) | Atmospheric precision instrument | Element-colored glow, staggered card reveals, gold shimmer lines, dense data | ✓ Yes — peak character expression |
| Success / completion | Atmospheric precision instrument | Gold pulse animation (`kuroPulseOrange`), trophy shine, emerald active glow | ✓ Yes — celebration maintains character temperature |
| Error / failure | Atmospheric precision instrument | Red-tinted text/badges at controlled saturation; not panic-inducing | ✓ Yes — errors are clinical, not alarming |
| Loading / waiting | Atmospheric precision instrument | Staggered card entrance animations; no dedicated loading state | ⚠ Partial — canvas background provides atmosphere, but no skeleton/placeholder maintains the precision feel during waits |
| Edge/empty (no data) | Atmospheric precision instrument | `text-gray-400` + action button — functional but flat | ⚠ Weak — empty states lose atmospheric quality (D-COLOR-3). Character drops to "generic utility." |

**Character break points:** Loading and empty states. Both lose the atmospheric quality that defines the active experience. See D-MOTION-1 (skeleton system) and D-COLOR-3 (empty state atmosphere).

#### Dimension 6 — Overall Character Coherence

```
Character Coherence: PARTIALLY COHERENT
Dominant character: "atmospheric precision instrument"
Conflicting signals:
  1. Neutral gray text stack (text-gray-300/400) — no temperature, no character
  2. System font (invisible) — doesn't participate in the character at all
  3. Empty/loading states — character collapses to generic when data is absent
  4. Corner decorations at 7% opacity — too faint to read as intentional (D-HIERARCHY-1)
Primary coherence fix: Replace neutral text grays with cool-tinted chromatic equivalents
  (D-COLOR-1) — this single change touches every screen and every state, raising the
  character floor across the entire app.
```

### §DP2. Design Character Brief

```
━━━ DESIGN CHARACTER BRIEF ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
App: Whispering Wishes
Axis Profile: Non-revenue · Leisure/Emotional · Enthusiast · Strong aesthetic · Amplifies value

EXISTING CHARACTER (extracted from §DP0)
  What the design already says:  "Atmospheric precision instrument for insiders —
                                   a mystical tool that reveals hidden math beneath beautiful surfaces"
  Strongest signals:             Canvas wave background (alive/atmospheric),
                                  Gold shimmer card lines (premium/crafted),
                                  Element-color glow system (domain-authentic)
  Weakest/incoherent signals:    Neutral gray text stack (generic),
                                  System font (invisible),
                                  Corner decorations at 7% opacity (unreadable)

TARGET CHARACTER
  Voice:      Terse-leaning, Cold, Formal, Expressive — "precision with atmosphere"
  Space:      Dense, Deep (multi-layer Z), Rigid (grid), Anchored
  Material:   Light/Void — content floats in luminous dark space
  Interaction: Snappy→Considered (100-300ms), Reactive (generous hover), Expressive
  States:      Character should hold across error, empty, loading

CHARACTER STATEMENT
  "This app's design reads as an atmospheric precision instrument. The strongest
   expression is the living canvas background paired with gold-shimmer frosted-glass cards.
   It should never feel generic or template-like — which currently happens when
   neutral gray text appears without the cool-blue temperature of the surrounding surfaces."

CHARACTER TESTS
  ✓ ON CHARACTER: Cool-tinted, semi-transparent, uses glow instead of shadow
  ✗ OFF CHARACTER: Warm wood/paper textures, pure white surfaces, rounded-friendly icons
  ✓ ON CHARACTER: Data-precise, monospace numerals in stats, tight spacing
  ✗ OFF CHARACTER: Generic Tailwind defaults (gray-400 text, shadow-sm, rounded-lg uniform)

PROTECT
  - Gold (#fbbf24) accent identity
  - Canvas wave background animations
  - Card shimmer line (::after pseudo-element)
  - cubic-bezier(0.16, 1, 0.3, 1) signature easing
  - Element-color glow system on stat boxes
  - Semi-transparent border technique (rgba(255,255,255,0.08))
  - OLED mode toggle

REJECT
  - Flat/Material design patterns (solid backgrounds, sharp elevation shadows)
  - Light mode (would destroy the void/atmospheric character)
  - Rounded-friendly icon styles
  - Warm/neutral gray text
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### §DP3. Character Deepening Protocol

#### 1. Character Token Extraction

```
EXPRESSES the "atmospheric precision instrument" character:
  background: #080c14 (chromatic near-black, cool-blue undertone)
  surface: rgba(12,16,24,0.55) (translucent, chromatically consistent)
  accent: #fbbf24 (warm gold — intentional temperature contrast)
  border: rgba(255,255,255,0.08) (semi-transparent — adapts to surface)
  easing: cubic-bezier(0.16, 1, 0.3, 1) (bouncy precision)
  shadow: 0 0 25px rgba(color, 0.3) (glow instead of shadow — luminous)
  radius: 16px cards, 12px buttons (varied — intentional assignment)

UNDERMINES the character:
  text: text-gray-300/400/500 (neutral — no temperature, no material quality)
  font: system-ui stack (invisible — carries zero personality)
  corner-deco: opacity 0.07 (too faint to register as intentional)
  empty states: text-gray-400 + button (no atmosphere, no character)

CHARACTER TOKEN SET (the correct values for this app):
  --text-primary:   oklch(92% 0.01 240)  ≈ #dfe5ef  (cool-tinted)
  --text-secondary: oklch(80% 0.01 240)  ≈ #bcc3d1  (cool-tinted)
  --text-muted:     oklch(62% 0.015 240) ≈ #8892a4  (cool-tinted)
  --surface-card:   rgba(12,16,24,0.55)  (existing — protect)
  --accent-gold:    oklch(78% 0.19 78)   ≈ #edaf18  (calibrated — Option B from D-COLOR-2)
  --glow-intensity: 0.25                  (focal) | 0.03 (ambient)
  --easing-sig:     cubic-bezier(0.16, 1, 0.3, 1)  (protect)
```

#### 2. Character Stress Testing

| Stress Scenario | Character Holds? | Gap |
|----------------|-----------------|-----|
| Error states | ✓ Yes — red at controlled saturation, clinical not alarming | None |
| Empty states | ⚠ Partial — functional but flat, loses atmosphere | D-COLOR-3: Add subtle gold radial glow behind empty-state text |
| Loading states | ✗ No — no dedicated loading state exists | D-MOTION-1: Design shimmer-line skeleton system |
| Edge-case components (tooltips, date pickers) | N/A — app doesn't use these components | No gap |
| Mobile breakpoints | ✓ Yes — mobile-first design, character survives compression | None |

#### 3. Sensory Vocabulary

```
Character: "atmospheric precision instrument"
Sensory reference: "the cockpit of a stealth fighter at night — dark glass panels with
  focused instrument glow, precise readouts, the hum of systems running beneath the
  surface, nothing decorative, everything functional but beautiful in its precision"

Design implications not yet fully expressed:
  - Text should feel instrument-grade: cool-tinted, slightly condensed, tabular numerals
    on all data displays → partially present (tabular-nums missing on small stats)
  - Empty states should feel like "instruments powered on, awaiting signal" — not
    "nothing here" but "ready to receive data" → currently too passive
  - The gold accent should feel like a critical status indicator — the one warm
    instrument light on a cool dashboard → correctly used but could be more concentrated
  - Loading should feel like "systems initializing" — structured shimmer, not spinning
    → currently no loading state at all
```

#### 4. Character Hierarchy

```
PRIMARY CARRIERS — character expressed at maximum intensity:
  - Banner card (character artwork + pity countdown) — the "main instrument"
  - Element-colored stat boxes — the "dashboard gauges"
  - Canvas wave background — the "cockpit windshield"
  - Card shimmer lines — the "instrument panel edge lighting"

SECONDARY CARRIERS — character present but not dominant:
  - Pull history rows — data readouts
  - Tab navigation — navigation scaffold
  - Settings toggles — control panel
  - Collection grid — inventory display

BACKGROUND ELEMENTS — character-consistent but recede:
  - Scrollbars (3px, subtle — correct)
  - Borders (rgba semi-transparent — correct)
  - Section headers (tracking + semibold — correct)
  - Footer/copyright text
```

#### 5. The One Unavoidable Moment

**The moment:** Checking pity count on the Tracker tab — specifically, seeing the number of pulls remaining until the next guaranteed 5-star. This is the atomic unit of value delivery for a gacha companion.

**Current expression:** The pity count is displayed inside stat boxes with element-colored borders and glow. The number uses `font-weight: 700` at the same text scale as surrounding content.

**Character assessment:** The *context* (glow border, element color, atmospheric background) is strongly on-character. The *data itself* (the number) is underplayed — it doesn't receive special typographic treatment that marks it as "the most important number on this screen."

**Deepening recommendation:** The pity countdown number should be the typographic hero of the stat box — 28-32px, `tabular-nums`, slightly tightened tracking (`-0.02em`), full accent-color rendering. This elevates it from "a number in a card" to "the readout" — consistent with the "instrument panel" sensory vocabulary. See D-TYPE-4.

#### 6. Character-Neutral Audit

| Element | Current Treatment | Character-Positive Treatment | Impact |
|---------|------------------|----------------------------|--------|
| Text colors | `text-gray-300/400/500` (neutral) | `oklch(92/80/62% 0.01-0.015 240)` (cool-tinted) | HIGH — touches every screen |
| Scrollbar thumb | `rgba(255,255,255,0.15)` (white-neutral) | `oklch(30% 0.02 240 / 0.25)` (cool-tinted) | LOW — barely visible but contributes to integration |
| Disabled button | `opacity: 0.5` (generic fade) | `opacity: 0.35` + slight blue tint on text | LOW — maintains character at reduced intensity |
| Empty state text | `text-gray-400` (dead neutral) | `oklch(55% 0.01 240)` + faint gold radial glow behind | MEDIUM — first-use impression |

#### 7. Character Future-Proofing

```
Character Rules (non-negotiable as new features are added):
  1. Every new surface uses rgba(12,16,24,X) — never neutral gray backgrounds
  2. Every new interactive element uses cubic-bezier(0.16, 1, 0.3, 1) — the signature easing
  3. Text colors always use cool-tinted chromatic values — never Tailwind neutral grays
  4. Glow effects use the element's own accent color — never white glow
  5. Card shimmer line (::after) must appear on every new card component
  6. Element-color mapping (Fusion=orange, Electro=purple, etc.) is canonical — never deviate

Character Risks (watch for these as the product scales):
  - Settings/admin sections: These typically revert to generic UI kit defaults. Apply
    the glass-on-void vocabulary explicitly to every new section.
  - Third-party embeds (charts, graphs): Chart libraries ship with their own color palettes
    and backgrounds. Override chart theme to use the app's chromatic dark surfaces and
    cool-tinted text colors. Never allow a white/light-gray chart in the dark void.
  - New game elements: As Wuthering Waves adds elements, assign colors that maintain
    perceptual brightness consistency (OKLCH lightness within ±5% of existing elements).
  - Feature expansion (resource planner, team builder): Complex tools with many inputs
    risk dense-neutral-gray fatigue. Maintain atmospheric breaks — every 3-4 dense data
    sections, allow a breathing card with the shimmer line and element glow.
```

---

## XV. STATE DESIGN SYSTEM

### §DST1. Empty State Design

**Audit of all empty states:**

```
State location: Tracker tab (no imported history)
  Current treatment: text-gray-400 message "Import your Convene history in Profile tab"
                     + emerald-tinted action button "Go to Profile tab to import"
  Character consistency: PARTIAL
    ✓ Action button uses element-color glow (emerald active state)
    ✗ Body text is neutral gray-400 — drops below the chromatic character floor
    ✗ No atmospheric element — the void behind is visible but no focal atmosphere
      marks this as a meaningful space
  Recommendation:
    - Replace text-gray-400 with oklch(55% 0.01 240) (cool-tinted muted text)
    - Add a faint gold radial glow (opacity: 0.04) centered behind the text block —
      a "waiting signal" that maintains the instrument-panel metaphor
    - Consider larger typographic treatment for the primary message: 16-18px, font-weight: 500,
      reading as "Ready to receive data" rather than "Nothing to show"

State location: Stats tab (no data)
  Current treatment: Similar to Tracker — text prompt + action button
  Character consistency: PARTIAL (same gaps as Tracker)
  Recommendation: Same treatment — share the empty state component pattern

State location: Collection tab (no characters imported)
  Current treatment: Grid area empty with minimal text
  Character consistency: PARTIAL
  Recommendation: The empty collection grid could show a ghost-grid of card placeholders
    (8-12 empty card outlines at 0.05 opacity) with the shimmer line still pulsing —
    a "this space is designed and waiting" signal rather than blank void.

State location: Profile tab (not yet configured)
  Current treatment: Import flow with step-by-step onboarding cards
  Character consistency: ✓ CONSISTENT — onboarding uses gold-accented step cards with
    proper atmospheric treatment. This is the strongest empty-state design in the app.
```

**[MEDIUM] D-STATE-1: Empty states lose atmospheric character**

The Profile onboarding flow demonstrates that character-positive empty states are achievable in this app (gold-accented cards, atmospheric treatment). The Tracker, Stats, and Collection empty states should receive the same investment level — a shared empty-state component with cool-tinted text, subtle gold radial glow, and larger typographic treatment for the primary message.

### §DST2. Loading State Design

**Audit of all loading states:**

```
Location: Initial app load
  Type: None — canvas background renders immediately, content stagger-enters
  Geometry match: N/A
  Palette match: N/A
  Animation character: Canvas wave begins immediately, providing atmosphere while
    content populates. Card stagger (50ms intervals) creates a progressive reveal.
  Assessment: ✓ Effective for short load times — the canvas animation IS the
    loading state. The app feels "alive" immediately.

Location: Tab switches (Tracker → Stats → Collection → Profile)
  Type: Tab fade animation (tabFadeIn, 350ms ease-out)
  Geometry match: N/A — cross-fade between full tab content
  Palette match: ✓ — tab content maintains the same surface vocabulary
  Animation character: ✓ — uses the app's signature easing
  Assessment: ✓ Correct — tab switches are fast enough that no dedicated
    loading state is needed.

Location: Data import (Profile tab → import Convene history)
  Type: None — async operation with no loading indicator
  Geometry match: N/A
  Palette match: N/A
  Animation character: N/A
  Assessment: ⚠ GAP — data import is the longest user-facing operation.
    During import, the user sees no feedback. This is the one location
    where a designed loading state is needed.

Location: Character detail modal (collection)
  Type: None — modal opens immediately with data already available
  Geometry match: N/A
  Palette match: N/A
  Assessment: ✓ No loading state needed — data is client-side.
```

**[MEDIUM] D-STATE-2: Data import has no loading feedback**

The Convene history import (Profile tab) is the longest operation a user performs. Currently there is no visual feedback during the import process. Design a character-appropriate loading treatment:

```
LOADING STATE SPECIFICATION — Data Import
  Type:       Ambient pulse (unknown duration, background process)
  Visual:     The import button transitions to a "processing" state:
              - Button text changes to "Importing..."
              - Gold border pulse animation (borderGlow 2s infinite, already exists)
              - Stat boxes below could show shimmer-line skeleton cards
                (card outlines with the existing ::after shimmer line pulsing)
  Color:      Gold accent at 0.15 opacity (matches active-gold button state)
  Duration:   Indeterminate — use the breathing pulse, not a progress bar
  Character:  "Systems processing" — the instrument panel is working. The gold
              pulse says "something valuable is being computed." No spinner.
```

---

## FINDINGS SUMMARY

| ID | Severity | Finding | Section |
|----|----------|---------|---------|
| D-COLOR-1 | [MEDIUM] | Text hierarchy uses Tailwind's neutral grays — no chromatic temperature matching the cool-blue surfaces | §DC2 |
| D-COLOR-2 | [LOW] | Primary gold `#fbbf24` is Tailwind's default amber-400 — not calibrated for ownership | §DC4 |
| D-COLOR-3 | [POLISH] | Empty states lack atmospheric treatment (faint glow/character) | §DC5 |
| D-TYPE-1 | [MEDIUM] | System font stack underdelivers for aesthetic-primary cyberpunk product | §DT1 |
| D-TYPE-2 | [LOW] | Small stat displays (9-10px) need `tabular-nums` for column alignment | §DT2 |
| D-TYPE-3 | [LOW] | Missing `-webkit-font-smoothing: antialiased` for refined dark-mode type | §DT3 |
| D-HIERARCHY-1 | [POLISH] | Card corner decorations at ~7% opacity too subtle to read as intentional design motif | §DH4 |
| D-ICON-1 | [LOW] | Default Lucide icons are stylistically neutral — don't amplify the cyberpunk character | §DI1 |

**Total: 8 findings (0 Critical, 0 High, 2 Medium, 4 Low, 2 Polish)**

---

## PRODUCTION AESTHETIC SCORE

| Dimension | Score | Notes |
|-----------|-------|-------|
| Color architecture | 8.5/10 | Excellent palette, strong temperature contrast; neutral text stack is the gap |
| Typography | 6.5/10 | Functional but personality-absent; weight hierarchy is good |
| Motion | 9/10 | Signature easing, staggered reveals, ambient atmosphere, reduced-motion support |
| Surface & atmosphere | 9.5/10 | Canvas backgrounds, frosted glass cards, shimmer lines — premium tier |
| Visual hierarchy | 9/10 | Clear reading order, effective use of chroma contrast and glow |
| Brand identity | 8.5/10 | 5 signature elements, low genericness (2/12), strong competitive differentiation |
| Icon system | 7/10 | Consistent library, appropriate sizes, but generic personality |
| Overall coherence | 8.5/10 | Strong identity with minor chrome gaps (text stack, font, corner decorations) |

**Composite aesthetic score: 8.4/10**

This is a well-designed product that is significantly ahead of its competitive landscape in visual quality. The primary investment opportunities are in the text color stack (chromatically match surfaces) and typography (add character to the typeface choice).
