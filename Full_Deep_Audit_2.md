# Full Deep Audit 2 — P6: Visual Design & Polish (Companion Mode)
## Whispering Wishes v3.2.3

---

# STEP 1: §0 — Aesthetic Context Block + Five-Axis Profile

**Skill reference**: design-aesthetic-audit §0, app-audit §I.4
**Date**: 2026-03-20

---

## §0 AESTHETIC CONTEXT BLOCK

```yaml
AESTHETIC CONTEXT — Whispering Wishes v3.2.3:

  Identity:
    Name:               Whispering Wishes
    Version:            3.2.3
    Type:               Single-page application (SPA)
    Domain:             Gacha tracker / planner / companion tool for Wuthering Waves
    Platform:           Web (PWA-capable, mobile-first responsive)
    Framework:          React 18 + Vite + Tailwind CSS
    Architecture:       Single-file SPA with modular barrel (AppCore → appcore-data, appcore-components, appcore-providers, appcore-engine)
    Persistence:        localStorage (client-only) + optional Firebase (leaderboard)
    Deployment:         Vercel (static hosting with security headers)
    Size class:         Large (~12,000+ lines across 5 JSX/JS source files)

  Tech Stack:
    Build:              Vite
    UI Framework:       React 18 (StrictMode)
    Styling:            Tailwind CSS + custom CSS-in-JS (KuroStyles) + CSS custom properties
    Charts:             Recharts (AreaChart, BarChart)
    Icons:              lucide-react (~40 icons imported)
    Fonts:              Rajdhani (display, Google Fonts), JetBrains Mono (data, Google Fonts)
    Service Worker:     Custom SW for offline/caching (production only)
    PWA:                Full manifest with install prompts

  Locale / i18n:        English only (Wuthering Waves community uses English + game-specific terminology)

  Constraints:
    - No backend server (client-only except Firebase leaderboard)
    - localStorage as primary persistence (5MB cap)
    - No build-time image optimization (external CDN images)
    - Single-page with tab-based navigation (8 tabs)
    - Must support OLED mode (pure-black variant)
    - Community/fan tool — NOT affiliated with Kuro Games

  Design Identity:
    Style:              Dark cyberpunk-luxe
    Primary background: #080c14 (deep blue-black, not pure black)
    OLED background:    #000000 (pure black variant)
    Primary accent:     #edaf18 (warm gold — brand signature)
    Secondary accents:  Cyan (#38bdf8), Purple (#8b5cf6), Pink (#ec4899), Emerald (#22c55e), Orange (#f97316), Red (#f87171)
    Gray scale:         Custom cool-tinted chromatic grays (f5f7fa → 0c1018) replacing Tailwind defaults
    Display font:       Rajdhani (slightly condensed, technical-feeling sans)
    Data font:          JetBrains Mono (monospaced, tabular numerals)
    Text body color:    #dfe5ef (cool blue-tinted white)
    Text heading color: #edf1f8 (brighter cool blue-tinted white)
    Surface model:      Glassmorphism (backdrop-blur + semi-transparent rgba backgrounds)
    Component system:   Custom "Kuro" prefixed design system (kuro-card, kuro-btn, kuro-input, kuro-stat, etc.)
    Border system:      5-level white-opacity tokens (--border-subtle 0.06 → --border-bright 0.2)
    Shadow system:      4-level color-matched shadow tokens (--shadow-sm → --shadow-xl) using rgba(6,10,24,x)
    Motion system:      Custom cubic-bezier(0.16, 1, 0.3, 1) easing throughout, 3 speed tokens (0.15s/0.25s/0.4s)
    Depth model:        Semi-transparent layered surfaces with inset highlights + color-matched shadows

  Protected Elements (DO NOT ALTER):
    - #080c14 base background color and blue-black tint
    - #edaf18 gold accent as primary brand color
    - Rajdhani + JetBrains Mono font pairing
    - Cool-tinted chromatic gray scale
    - Dark cyberpunk-luxe overall aesthetic
    - Game-community voice and terminology (pity, 50/50, Astrite, Convene, etc.)
    - OLED mode support

  Domain Rules (from code — [CODE] sourced):
    - [CODE] HARD_PITY = 80 (guaranteed 5★ at 80 pulls)
    - [CODE] SOFT_PITY_START = 65 (increased rates begin at 65)
    - [CODE] ASTRITE_PER_PULL = 160 (currency per standard pull)
    - [CODE] BEGINNER_ASTRITE_PER_PULL = 128 (80% of standard cost)
    - [CODE] LUNITE_DAILY_ASTRITE = 90 (daily subscription reward)
    - [CODE] MAX_CALC_PULLS = 2000 (calculator upper limit)
    - [CODE] HARD_PITY_4STAR = 10 (guaranteed 4★ every 10 pulls)
    - [CODE] 6 Wuthering Waves elements: Fusion, Electro, Aero, Glacio, Havoc, Spectro
    - [CODE] 5 banner types tracked (character, weapon, standard, beginner, etc.)
    - [CODE] 50/50 system: featured vs standard character on limited banners
    - [CODE] Rarity system: 5★, 4★, 3★ with distinct color coding

  Test Vectors:
    - Primary workflow: Import convene log → view pity status → check probability → plan pulls
    - All 8 tabs must render without error
    - OLED mode toggle must not break visual hierarchy
    - Collection images load from external CDNs (must handle failures gracefully)

  Workflows:
    - Tracker: Import → banner card display → pity counter → countdown timer
    - Events: Browse events → mark done/skip → track Astrite sources
    - Calculator: Input resources → simulate pull outcomes → view probability tables
    - Planner: Priority slider allocation → bookmark management → pull planning
    - Stats: View pull history → charts → luck analysis → trophy system
    - Collection: Browse characters/weapons → filter by element/rarity → detail modals
    - Teams: View team compositions → team suggestions
    - Profile: Username → settings → import/export → data management

  Growth Context:
    Likeliest Next Features:
      - Multi-account support
      - Cloud sync (beyond leaderboard)
      - More detailed pull analytics
      - Expanded team builder
      - Echo (artifact) tracking
    Planned Constraint Changes:
      - Possible migration from localStorage to IndexedDB or backend
```

---

## §0.1 DESIGN IDENTITY EXTRACTION (Current State — What The Design IS)

### COLOR ARCHITECTURE

**Primary Palette (CSS Custom Properties — Single Source of Truth):**

| Token | Value (Standard) | Value (OLED) | Role |
|-------|------------------|--------------|------|
| `--color-gold` | `237, 175, 24` | same | Brand accent, primary interactive color |
| `--color-cyan` | `56, 189, 248` | same | Secondary accent (Glacio element, info states) |
| `--color-purple` | `168, 85, 247` | same | Secondary accent (Electro element, 4★ rarity) |
| `--color-pink` | `236, 72, 153` | same | Secondary accent (Havoc element) |
| `--color-emerald` | `34, 197, 94` | same | Secondary accent (success states, Aero element) |
| `--color-red` | `248, 113, 113` | same | Error states, loss indicators |

**Surface Palette (Dual Mode):**

| Token | Standard Mode | OLED Mode | Role |
|-------|--------------|-----------|------|
| `--bg-card` | `rgba(12, 16, 24, 0.55)` | `rgba(0, 0, 0, 0.95)` | Card backgrounds (glassmorphic) |
| `--bg-card-inner` | `rgba(6, 10, 18, 1)` | `rgba(5, 5, 5, 1)` | Nested card backgrounds |
| `--bg-btn` | `rgba(15, 20, 28, 0.85)` | `rgba(0, 0, 0, 0.95)` | Button backgrounds |
| `--bg-input` | `rgba(15, 20, 28, 0.9)` | `rgba(0, 0, 0, 0.95)` | Input field backgrounds |
| `--bg-stat` | `rgba(10, 14, 22, 0.8)` | `rgba(0, 0, 0, 0.9)` | Stat box backgrounds |

**Border Opacity System (5-level):**

| Token | Value | Role |
|-------|-------|------|
| `--border-subtle` | `rgba(255,255,255,0.06)` | Decorative separators, sub-dividers |
| `--border-default` | `rgba(255,255,255,0.08)` | Card borders, default component edges |
| `--border-medium` | `rgba(255,255,255,0.1)` | Button borders, elevated components |
| `--border-hover` | `rgba(255,255,255,0.15)` | Hover state borders, stat boxes |
| `--border-bright` | `rgba(255,255,255,0.2)` | Input borders, high-emphasis elements |

**Shadow System (4-level, color-matched to dark surfaces):**

| Token | Value | Role |
|-------|-------|------|
| `--shadow-sm` | `0 1px 2px rgba(6, 10, 24, 0.4)` | Subtle depth for small elements |
| `--shadow-md` | `0 4px 12px rgba(6, 10, 24, 0.5)` | Standard card depth |
| `--shadow-lg` | `0 8px 24px rgba(6, 10, 24, 0.6)` | Elevated modals, hover states |
| `--shadow-xl` | `0 12px 40px rgba(6, 10, 24, 0.7)` | Maximum elevation, floating elements |

**Text Colors:**

| Token/Value | Hex | Role |
|------------|-----|------|
| `--text-heading` | `#edf1f8` | Heading text, high emphasis |
| `--text-body` | `#dfe5ef` | Body text, standard emphasis |
| Tailwind `text-gray-300` | `#c5ccda` | Secondary text |
| Tailwind `text-gray-400` | `#8f99ab` | Muted text, labels |
| Tailwind `text-gray-500` | `#646e7f` | Disabled text, subtle labels |

**Element Color Map (Game-Domain Semantic Colors):**

| Element | Hex | Background | Border |
|---------|-----|-----------|--------|
| Fusion | `#f97316` | `rgba(249,115,22,0.15)` | `rgba(249,115,22,0.4)` |
| Electro | `#a855f7` | `rgba(168,85,247,0.15)` | `rgba(168,85,247,0.4)` |
| Aero | `#10b981` | `rgba(16,185,129,0.15)` | `rgba(16,185,129,0.4)` |
| Glacio | `#06b6d4` | `rgba(6,182,212,0.15)` | `rgba(6,182,212,0.4)` |
| Havoc | `#ec4899` | `rgba(236,72,153,0.15)` | `rgba(236,72,153,0.4)` |
| Spectro | `#eab308` | `rgba(234,179,8,0.15)` | `rgba(234,179,8,0.4)` |

**Rarity Color Coding:**

| Rarity | Color | Usage |
|--------|-------|-------|
| 5★ | Gold (`text-yellow-400`, `bg-yellow-500/20`) | Premium characters/weapons |
| 4★ | Purple (`text-purple-400`, `bg-purple-500/20`) | Rare characters/weapons |
| 3★ | Blue (`text-blue-400`, `bg-blue-500/20`) | Common weapons |
| 2★ | Green (`text-green-400`, `bg-green-500/20`) | Low-tier items |
| 1★ | Gray (`text-gray-400`, `bg-gray-500/20`) | Lowest-tier items |

---

### TYPOGRAPHY SYSTEM

**Font Families:**
- **Display**: `Rajdhani, ui-sans-serif, system-ui, sans-serif` — Used for headings, labels, navigation, UI chrome. Slightly condensed gothic sans with a technical, institutional feel.
- **Data**: `JetBrains Mono, ui-monospace, SFMono-Regular, Menlo, Consolas, monospace` — Used for numbers, pull counts, pity values, calculator outputs. Strict tabular numerals.

**Text Size Scale (Tailwind):**

| Class | Approximate Size | Usage |
|-------|-----------------|-------|
| `text-[8px]`–`text-[11px]` | 8–11px | Micro labels, badge counts |
| `text-xs` | 12px | Small labels, secondary metadata |
| `text-sm` | 14px | Standard body text, descriptions |
| `text-base` | 16px | Primary body text |
| `text-lg` | 18px | Section headings, emphasized text |
| `text-xl` | 20px | Major section headers |
| `text-2xl` | 24px | Tab titles, major numbers |
| `text-5xl` | 48px | Hero numbers (pity count display) |

**Weight Scale:**
- `font-normal` (400) — Body text
- `font-medium` (500) — Labels, secondary emphasis
- `font-semibold` (600) — Section headings, stat values
- `font-bold` (700) — Primary headings, critical numbers

**Tracking (Letter-spacing):**
- `tracking-wide` (0.025em) — Standard labels
- `tracking-wider` (0.05em) — Uppercase labels, stat headers
- `tracking-widest` (0.1em) — Maximum tracking for all-caps micro labels

**Text Transforms:**
- `uppercase` — Used extensively for labels, category headers, stat names
- Most label text is uppercase + tracked for a technical instrument feel

---

### MOTION SYSTEM

**Easing:**
- **Primary**: `cubic-bezier(0.16, 1, 0.3, 1)` — Used throughout for all interactive transitions. Fast-out characteristic, smooth deceleration. This is the app's signature easing.
- **ease-out** — Used for entrance animations
- **ease-in-out** — Used for pulsing/looping animations
- **linear** — Used for continuous rotations (badge rotate)

**Duration Tokens:**

| Token | Value | Usage |
|-------|-------|-------|
| `--transition-fast` | `0.15s` | Color changes, opacity, micro-interactions |
| `--transition-normal` | `0.25s` | Button transforms, card hover, border state changes |
| `--transition-slow` | `0.4s` | Modal entrance, complex state transitions |

**Keyframe Animations (15+ defined):**

| Animation | Duration | Purpose |
|-----------|----------|---------|
| `slideUp` | 0.2s ease-out | Toast entrance |
| `scaleIn` | 0.3s ease-out | Modal entrance (scale 0.96 → 1) |
| `tabFadeIn` | 0.35s primary-bezier | Tab content entrance |
| `cardSlideIn` | 0.4s primary-bezier | Card entrance (staggered 50ms) |
| `borderGlow` | 2s ease-in-out infinite | Gold border pulse |
| `pulseScale` | 2s ease-in-out infinite | Subtle scale pulse (1 → 1.02) |
| `badgeRotate` | 8s linear infinite | Luck badge border rotation |
| `trophyShine` | 3s ease-in-out infinite | Trophy opacity pulse |
| `kuroShimmer` | 1.8s ease-in-out infinite | Skeleton loading shimmer |
| `emptyFadeIn` | 0.4s ease-out | Empty state entrance |
| `ghostPulse` | 2.5s ease-in-out infinite | Ghost grid cell pulse |
| `kuroPulseOrange/Cyan/Pink` | 2s ease-in-out infinite | Soft pity text glow |

**Hover Transforms:**
- Cards: `translateY(-2px)` on hover, `translateY(0) scale(0.98)` on active
- Buttons: `translateY(-2px)` on hover, `translateY(0) scale(0.97)` on active
- Collection cards: `translateY(-4px) scale(1.02)` on hover
- Stats: `translateY(-1px)` on hover
- Slider thumbs: `scale(1.15)` on hover

**Reduced Motion:**
- CSS `prefers-reduced-motion: reduce` → all animation durations set to 0.01ms
- JavaScript `.no-animations` class toggle for user preference

---

### SPATIAL SYSTEM

**Spacing Scale (Tailwind increments, base unit 4px):**
- Micro: `0.5` (2px), `1` (4px), `1.5` (6px)
- Small: `2` (8px), `2.5` (10px), `3` (12px)
- Medium: `4` (16px), `5` (20px)
- Large: `6` (24px), `8` (32px)
- XL: `12` (48px), `20` (80px), `24` (96px)

**Common Patterns:**
- Card padding: `p-3` (12px) to `p-4` (16px)
- Component gap: `gap-1.5` (6px) to `gap-3` (12px)
- Section spacing: `space-y-2` (8px) to `space-y-4` (16px)
- Inline element gap: `gap-0.5` (2px) to `gap-1` (4px)

**Border Radius Scale:**

| Class | Value | Usage |
|-------|-------|-------|
| `rounded-[3px]` | 3px | Small badges, micro elements |
| `rounded` | 4px | Inline badges |
| `rounded-md` | 6px | Buttons, inputs |
| `rounded-lg` | 8px | Cards, stat boxes |
| `rounded-xl` | 12px | Large cards, elevated panels |
| `rounded-t-2xl` | 16px | Modal top corners |
| `rounded-full` | 9999px | Pill badges, circular elements |

**Z-Index Scale:**

| Layer | Z-Index | Usage |
|-------|---------|-------|
| Background effects | `z-[2]` | Triangle wave, background glow |
| Content | `z-10` | Standard content layer |
| Elevated content | `z-20` | Sticky headers, floating controls |
| Modals/overlays | `z-50`, `z-[100]`, `z-[110]` | Modal backgrounds and foregrounds |
| System UI | `z-[9998]`, `z-[10000]` | PWA install banner, toasts |

---

### SURFACE & DEPTH MODEL

**Glassmorphic Layer Stack:**
1. **Base layer**: `#080c14` solid background (html/body)
2. **Atmospheric layer**: Radial gradient glow (`rgba(237,175,24,0.08)` gold ellipse at bottom)
3. **Card layer**: Semi-transparent `rgba(12,16,24,0.55)` + `backdrop-filter: blur(4px)` + multi-layer box-shadow (outer shadow + 1px border-light + inset top highlight)
4. **Inner card layer**: Solid `rgba(6,10,18,1)` nested surfaces
5. **Interactive layer**: Buttons at `rgba(15,20,28,0.85)` + `backdrop-filter: blur(8px)`
6. **Stat layer**: `rgba(10,14,22,0.8)` + colored top-gradient accent lines via `::before`

**Card Construction:**
```
.kuro-card:
  - Background: semi-transparent dark blue-black
  - Backdrop blur: 4px
  - Border: 1px solid rgba(255,255,255,0.08)
  - Shadow: 3-layer (outer depth + 1px inline glow + inset top highlight)
  - Hover: translateY(-2px) + enhanced shadow + gold micro-glow
  - Active: scale(0.98) + reset translateY
  - Decorative: shimmer line (::after) + corner accents (::before, ::after on inner)
```

**Button Construction:**
```
.kuro-btn:
  - Background: semi-transparent dark + blur(8px)
  - Border: 1px solid rgba(255,255,255,0.1)
  - Transition: transform + bg + border + shadow + color
  - Hover: translateY(-2px) + ripple (::before pseudo-element)
  - Active: scale(0.97) + color-specific glow
  - 6 active color variants: gold, pink, cyan, purple, emerald, red
  - Each active state: colored box-shadow + text-shadow + border-color
```

**Decorative Micro-Details:**
- Card shimmer line: 1px `::after` with linear-gradient white sweep
- Card corner decorations: 2px `::before` and `::after` positioned at corners
- Header icon: gold gradient `::before` accent mark
- Stat boxes: colored top-line via `::before` gradient (matches stat variant color)
- Luck badge: rotating conic gradient border
- Button ripple: `::before` radial-gradient white pulse on hover

---

### ICON SYSTEM

**Library**: lucide-react (~40 icons imported)
**Standard sizes**: 10px (micro), 12px (small inline), 16px (standard), 32px (large/onboarding)
**Coloring**: Inherit from parent text color + `currentColor` for filter effects
**Hover effect**: `filter: drop-shadow(0 0 3px currentColor)` on pointer devices
**Star fills**: `text-yellow-400 fill-yellow-400` for 5★ indicator
**Element icons**: Colored by game element (same element color map)

---

### RESPONSIVE APPROACH

**Strategy**: Mobile-first with desktop enhancement at 1024px
**Breakpoints used**: `sm:` (640px), `md:` (768px), `lg:` (1024px), `xl:` (1280px), `2xl:` (1536px)
**Desktop layout** (≥1024px): Fixed left sidebar navigation (220px) + main content area + optional right ad margin
**Mobile layout** (<1024px): Bottom tab bar navigation + full-width content
**Grid columns**: `grid-cols-2` → `sm:grid-cols-5` → `lg:grid-cols-4` → `xl:grid-cols-5` → `2xl:grid-cols-6`

---

## §I.4 FIVE-AXIS AESTHETIC PROFILE

> This profile governs ALL subsequent audit findings. Every recommendation must be consistent with these axes.

---

### AXIS 1 — Commercial Intent

**Classification**: `NON-REVENUE` — Community/fan tool

**Evidence** [CODE]:
- No paywall, no subscription, no premium tier in code
- No monetization logic, no payment processing
- Ad slots exist in desktop layout but are structural placeholders (`border: 1px dashed rgba(255,255,255,0.08)`, labeled "ad-slot")
- Firebase integration limited to voluntary leaderboard (no user accounts, no paid features)
- Open community tool for Wuthering Waves players
- No analytics SDK beyond basic service worker

**Implications for audit**:
- "Commercial polish" metrics (conversion-oriented CTA optimization, first-impression monetization signals) are **not applicable**
- Quality bar is driven by **community credibility** and **craft pride**, not conversion
- Visual investment signals "this person plays the game and cares" — not "this product wants your money"
- Copy voice should feel like a knowledgeable player talking to other players, not a brand talking to customers
- Design improvements should deepen the tool's utility and atmosphere, not optimize for retention metrics

---

### AXIS 2 — Use Context

**Classification**: `FOCUS-TOOL` with `EMOTIONAL-SECONDARY` layer

**Evidence** [CODE]:
- Primary use: checking pity status, calculating pull probability, tracking resources — precision instrument behavior
- Decision-critical: users decide whether to spend in-game currency (Astrite) based on this tool's output
- Calculator outputs directly influence spending decisions (probability tables, resource projections)
- Emotional layer: trophy system (114 trophies), luck ratings, win/loss streak tracking — celebration and commiseration
- Events tab tracks time-sensitive game events — urgency context
- Profile tab with username, settings — personalization
- Leaderboard — competitive/social context

**Implications for audit**:
- **Primary obligation**: Data accuracy and clarity above all else. Numbers must be instantly readable. Hierarchy must be unambiguous.
- **Every transition under 150ms** for data-critical interactions (pity counter, calculator, stats)
- **Zero decorative animation** that competes with data readability
- **Emotional layer is secondary but real**: Trophy unlocks, luck ratings, streak displays — these are celebration moments that deserve design investment without compromising the tool's precision feel
- **The focus-tool axis demands**: `font-variant-numeric: tabular-nums` everywhere numbers appear, clear visual hierarchy between primary data and metadata, no visual noise near critical outputs

---

### AXIS 3 — Audience

**Classification**: `ENTHUSIAST/EXPERT` — Wuthering Waves gacha community

**Evidence** [CODE]:
- Domain vocabulary used without explanation: "pity", "50/50", "soft pity", "hard pity", "Convene", "Astrite", "Resonator", "Sequence Node", "Forte", "Echo", "Sonata Effect"
- 114 trophy definitions using deep community humor and game knowledge ("Lingyang Main (Involuntary)", "Kuro Hates You", "Pity 1. Screenshot or Fake.")
- Import workflow assumes players know how to extract their Convene log
- Calculator assumes understanding of gacha probability mechanics
- No onboarding tutorial explains gacha concepts — tool assumes domain expertise
- Team composition tab references meta knowledge (tier lists, synergies)
- Community-specific references: "touch grass", "copium", "whale", "F2P BTW"

**Implications for audit**:
- **Domain vocabulary is a feature, not a bug** — DO NOT recommend simplifying game terminology
- **Trophy copy is a brand asset** — the community humor IS the personality; DO NOT sanitize or genericize
- **Expert-density is appropriate** — the interface can be information-dense without being confusing to this audience
- **Community credibility signals matter more than onboarding clarity** — a gacha player who opens this tool should immediately think "this person knows what they're talking about"
- **Visual language should reference Wuthering Waves aesthetic** — the cyberpunk-luxe style is not arbitrary, it mirrors the game's visual identity
- **Copy should sound like a player, not a product**: "your pity is cooked" > "your pity counter is high"

---

### AXIS 4 — Subject Identity

**Classification**: `NAMED-SOURCE` — Wuthering Waves (Kuro Games)

**Source**: Wuthering Waves, an action RPG gacha game by Kuro Games

**Evidence** [CODE]:
- App name "Whispering Wishes" is a play on Wuthering Waves' "Convene" (wishing/pulling) system
- All character data (33+ 5★ Resonators), weapon data, element system, banner history — all from Wuthering Waves
- Element colors map to game elements: Fusion (orange), Electro (purple), Aero (emerald), Glacio (cyan), Havoc (pink), Spectro (yellow)
- Banner names reference in-game banner types
- Events data tracks actual Wuthering Waves game events
- Trophy system references game-specific characters, mechanics, and community culture
- Echo sets, Sonata Effects, Resonance Chains — all game mechanics
- Character images loaded from external CDNs (wuwa.gg, wuwatracker.com, wiki sources)

**Fidelity level**: `L3 — Visual Vocabulary` (colors, typography character, spatial grammar aligned to Wuthering Waves' cyberpunk-luxe aesthetic, without literal UI replication)

**Implications for audit**:
- **The dark cyberpunk-luxe aesthetic is source-driven** — it mirrors Wuthering Waves' UI language (deep darks, cool blues, gold accents, angular precision)
- **Color choices are not arbitrary** — element colors match in-game element colors
- **Gold accent (#edaf18) echoes the game's premium/5★ color language**
- **Recommendations must respect the source material** — suggesting warm pastels or rounded-friendly aesthetics would break the identity
- **The "insider test" applies**: Would a Wuthering Waves player immediately recognize this as a WuWa companion tool? Currently: YES — the color palette, element colors, terminology, and visual tone all signal game familiarity
- **Source-material accuracy** for element colors, rarity colors, and game constants is a functional requirement, not just aesthetic

---

### AXIS 5 — Aesthetic Role

**Classification**: `FUNCTIONAL-PRIMARY` with `ATMOSPHERIC-SECONDARY`

**Evidence** [CODE]:
- The UI is primarily a data instrument — pity counters, probability tables, resource calculators, pull history charts
- Functional clarity dominates: numbers are large, hierarchy is clear, critical data is gold-highlighted
- Atmospheric elements exist but serve the functional core:
  - Background glow (radial gradient gold) creates ambient warmth without competing with data
  - Card glassmorphism (backdrop-blur) creates depth hierarchy that aids information scanning
  - Decorative micro-details (shimmer lines, corner accents) add polish without noise
  - Triangle mirror wave background is purely atmospheric, positioned behind content at z-[2]
- Charts use product palette (gold, cyan) rather than library defaults
- Trophy system is the most aesthetically expressive area — badges with rotating gradients, color-coded luck ratings
- Collection grid uses game character art — the most visually rich surface

**Implications for audit**:
- **Data readability is the primary aesthetic obligation** — if a visual treatment makes a number harder to read, it fails regardless of beauty
- **Atmospheric treatments should enhance, not compete** — the gold glow should frame data, not distract from it
- **The atmospheric secondary layer is what separates this from a spreadsheet** — it's what makes the tool feel like a game companion rather than a utility. This layer deserves investment.
- **UI chrome transitions under 100ms** so attention stays on data output
- **Output presentation (numbers, charts, probabilities) should receive full visual investment** — these are the product's deliverables
- **No interface element should compete with the primary data** — decorative elements must be ambient, not focal

---

## §0.2 AXIS PROFILE SUMMARY

```
FIVE-AXIS AESTHETIC PROFILE — Whispering Wishes v3.2.3

  A1  Commercial intent:    NON-REVENUE — Community fan tool
  A2  Use context:          FOCUS-TOOL (precision data) + EMOTIONAL-SECONDARY (trophies, luck)
  A3  Audience:             ENTHUSIAST/EXPERT — Wuthering Waves gacha community
  A4  Subject identity:     NAMED-SOURCE — Wuthering Waves (L3 visual vocabulary fidelity)
  A5  Aesthetic role:        FUNCTIONAL-PRIMARY + ATMOSPHERIC-SECONDARY

  Profile signature:
    A non-revenue precision tool for expert gacha players, visually
    aligned to Wuthering Waves' cyberpunk-luxe identity, where data
    clarity is the primary aesthetic obligation and atmospheric
    treatments serve as ambient context rather than focal decoration.

  What "good" looks like for THIS app:
    - Numbers are the hero — large, tabular, gold-highlighted, instantly parseable
    - The dark atmosphere says "game companion" not "generic dashboard"
    - Community humor and domain vocabulary signal insider credibility
    - Every decorative element earns its place by enhancing data hierarchy or game atmosphere
    - The tool feels like it was built by someone who plays daily

  What "bad" looks like for THIS app:
    - Generic SaaS dashboard aesthetic (light backgrounds, blue buttons, rounded-friendly)
    - Sanitized copy that strips community personality ("your statistics" instead of "your pity is cooked")
    - Decorative elements that compete with data (animated backgrounds behind numbers)
    - Onboarding that explains gacha to non-players (the audience already knows)
    - Visual treatments that break Wuthering Waves source fidelity (warm pastels, organic shapes)
```

---

## §0.3 GOVERNING PRINCIPLES FOR ALL SUBSEQUENT STEPS

Based on the Five-Axis Profile, these principles govern every finding in Steps 2–20:

1. **Data first**: Every visual recommendation must preserve or improve data readability. If a recommendation makes a number harder to read, it is rejected regardless of aesthetic merit.

2. **Source fidelity**: The Wuthering Waves cyberpunk-luxe identity is protected. Recommendations must work within this visual vocabulary — deep darks, cool blues, gold accents, angular precision, glassmorphic depth.

3. **Community voice**: The gacha community's vocabulary and humor are brand assets. Copy recommendations must sound like a knowledgeable player, not a product.

4. **Atmospheric enhancement, not decoration**: Visual treatments earn their place by strengthening data hierarchy or deepening the game-world atmosphere. Purely decorative additions are suspect.

5. **Precision instrument feel**: The app's emotional register is "focused calm of a precision instrument" — confident, knowledgeable, precise. Not playful, not corporate, not minimal.

6. **Expert-density is a feature**: Information density appropriate for an audience that understands gacha mechanics. DO NOT recommend simplification that would patronize the user base.

7. **OLED mode parity**: Every recommendation must work in both standard mode (blue-black surfaces) and OLED mode (pure-black surfaces).

---

**STEP 1 COMPLETE** — §0 Aesthetic Context Block + Five-Axis Profile established.

This document governs all subsequent audit steps (2–20). Every finding, every recommendation, every severity assessment traces back to the axis profile defined here.
