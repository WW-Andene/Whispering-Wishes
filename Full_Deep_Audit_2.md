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

---

## STEP 2 — §DS1 + §DS2: Style Classification & Coherence

---

### §DS1 — Style Classification

#### DS1.1 PRIMARY DESIGN SCHOOL

**Classification: CYBERPUNK / TERMINAL — with Glassmorphism execution layer**

The app's visual language maps most strongly to the **Cyberpunk/Terminal** school from the full taxonomy, executed through a **Glassmorphism** rendering pipeline. This is not a 50/50 split — Cyberpunk/Terminal is the *identity*, Glassmorphism is the *material*.

**Evidence for Cyberpunk/Terminal as primary:**

| Signal | Location | Detail |
|--------|----------|--------|
| Dark ambient base | `appcore-providers.jsx:408` | `#080c14` blue-black, `#000000` OLED — not neutral gray, cool-shifted |
| Gold accent system | `:root` vars, lines 435–440 | `--color-gold: 237,175,24` as primary accent — sci-fi instrument gold, not luxury gold |
| Corner bracket decorations | `.kuro-card-inner::before/::after`, lines 777–803 | Geometric L-shaped corner marks on every card — a HUD/terminal motif |
| Top shimmer line | `.kuro-card::after`, lines 747–763 | Animated horizontal scanline across card tops — CRT/holographic reference |
| Monospace data font | `--font-data`, line 452 | JetBrains Mono for all numerical data — terminal typography |
| Text-shadow on labels | `.kuro-label`, line 1167 | `text-shadow: 0 1px 2px rgba(0,0,0,0.5)` — holographic floating text |
| Header gold bar accent | `.kuro-header h3::before`, lines 840–847 | Vertical gold gradient bar with glow — instrument panel indicator |
| Animation vocabulary | `borderGlow`, `pulseScale`, `shimmer` | Pulsing borders, scale breathing, shimmer — all sci-fi UI patterns |
| OLED dual-mode | Throughout KuroStyles | Pure black vs blue-black toggle — AMOLED optimization is a Cyberpunk-native concern |
| Uppercase labels | `.kuro-label`, line 1164 | `text-transform: uppercase; letter-spacing: 0.08em` — HUD readout style |

**Why NOT pure Glassmorphism as primary:**
Glassmorphism's defining identity is *frosted glass over colorful backgrounds*. Whispering Wishes uses glassmorphism's *techniques* (backdrop-blur, semi-transparent surfaces, layered shadows) but not its *identity*. The backgrounds are dark and moody, not colorful. The blur serves depth, not transparency. The emotional register is "precision instrument in a dark command center" — not "floating cards over a gradient."

**Confidence: HIGH** — 10/10 primary signals align with Cyberpunk/Terminal. No competing primary classification.

---

#### DS1.2 SECONDARY INFLUENCES

**Secondary 1: GLASSMORPHISM (execution layer — L2 influence)**

| Signal | Location | Detail |
|--------|----------|--------|
| `backdrop-filter: blur()` | `.kuro-card` (line 716), `.kuro-btn` (line 871), `.kuro-stat` (line 1045), `.kuro-input` (line 996) | Every major surface uses backdrop-blur |
| Semi-transparent backgrounds | `--bg-card`, `--bg-btn`, `--bg-input`, `--bg-stat` | All use `rgba()` with alpha channels (0.55, 0.85, 0.9, 0.8) |
| Layered box-shadows | `.kuro-card`, lines 718–721 | Triple shadow stack: ambient shadow + 1px ring + inset highlight |
| Inset light edge | `.kuro-card`, line 721 | `inset 0 1px 0 rgba(255,255,255,0.05)` — glass edge highlight |
| Variable border opacity | `--border-subtle` through `--border-bright` | 5-tier border system from 0.06 to 0.2 opacity — frosted glass edges |

**Relationship to primary:** Glassmorphism is subordinate. It provides the *material rendering* for Cyberpunk/Terminal *structures*. The cards are terminal panels built from glass. This is intentional fusion, not confusion.

**Secondary 2: DATA VISUALIZATION / Dashboard (atmospheric influence — L1 influence)**

| Signal | Location | Detail |
|--------|----------|--------|
| Stat box grid system | `.kuro-stat` + color variants | 7 colored stat variants (gold/cyan/purple/emerald/red/pink/gray) — dashboard-native |
| Color-coded data hierarchy | Active button states | Gold/pink/cyan/purple/emerald/red — each color carries semantic meaning |
| Tabular numerics | `.kuro-stat`, line 1047 | `font-variant-numeric: tabular-nums` — data-dense alignment |
| Pity ring visualization | Inline SVG | Circular progress indicators — a dashboard/analytics convention |

**Relationship to primary:** This influence is *content-appropriate*, not a style leak. A gacha tracker IS a dashboard. These patterns reinforce the Cyberpunk/Terminal identity (data instruments) rather than diluting it.

**No other secondary influences detected.** The app does not exhibit Material/Elevation, Neo-Brutalist, Skeuomorphic, or Minimal/Flat characteristics.

---

#### DS1.3 COHERENCE SCORE

**Score: MIXED-INTENTIONAL**

The app's *design system* (KuroStyles in `appcore-providers.jsx`) is coherent. The Cyberpunk/Terminal + Glassmorphism fusion is consistent and well-executed at the system level. However, the *application layer* (`App.jsx`, `appcore-components.jsx`) introduces style vocabulary breaks through hardcoded values that bypass the design system, creating localized incoherence.

**Why not COHERENT:**
- 121 hardcoded hex/rgba color instances in `App.jsx` alone bypass CSS custom properties
- 10+ modal backdrop values hardcode `rgba(12,16,24,0.95)` instead of using a token
- Pity tier colors (`#22c55e`, `#84cc16`, `#edaf18`, `#f97316`, `#ef4444`) are repeated in 5+ places without tokenization
- Border radius values span 7 different sizes (3px, 4px, 6px, 8px, 10px, 12px, 15px, 16px) without a scale token
- Desktop sidebar uses a different easing curve (`cubic-bezier(0.4, 0, 0.2, 1)`) than the rest of the app (`cubic-bezier(0.16, 1, 0.3, 1)`)

**Why not ACCIDENTALLY MIXED:**
- The *intentional* design decisions are strong and consistent: card system, button system, stat system, color accent system all speak the same language
- The mixing happens at the *implementation* level (hardcoded values), not the *conceptual* level (conflicting design philosophies)
- Every tab uses the same structural vocabulary (kuro-card → kuro-header → kuro-body)
- The Cyberpunk/Terminal + Glassmorphism fusion reads as a single voice, not two competing styles

**Verdict:** The *design intent* is coherent. The *implementation* leaks. This is fixable without redesign — it requires tokenization, not reconceptualization.

---

#### DS1.4 STYLE-APPROPRIATE EXECUTION ASSESSMENT

Assessing whether the Cyberpunk/Terminal + Glassmorphism fusion is executed at the quality level the chosen style demands:

| Execution Axis | Rating | Detail |
|----------------|--------|--------|
| **Surface depth model** | STRONG | 4-layer depth (bg → card → inner → content) with proper z-index scale, backdrop-blur on every surface, inset highlights — Glassmorphism executed correctly |
| **Color temperature** | STRONG | Cool-shifted throughout. `#080c14` base, blue-tinted grays in Tailwind config, gold as warm accent against cold field — Cyberpunk temperature nailed |
| **Typography hierarchy** | STRONG | Dual-font system (Rajdhani display + JetBrains Mono data) with proper scale. Uppercase labels, tracking, text-shadows — all Terminal-native |
| **Animation vocabulary** | STRONG | `shimmer`, `borderGlow`, `pulseScale`, stagger animations, spring easing `cubic-bezier(0.16, 1, 0.3, 1)` — sci-fi appropriate, not playful |
| **Spatial rhythm** | GOOD | Consistent 14px body padding, 10px gaps, but no formal spacing scale token. Works by convention, not by system |
| **Detail ornaments** | STRONG | Corner brackets, gold bar accents, shimmer lines, inset edges — HUD chrome is consistent and restrained |
| **Interactive states** | GOOD | Hover lifts, active scales, glow effects all appropriate. But: button active colors hardcode light pastels (`#fef08a`, `#fbcfe8`, `#bae6fd`) that feel slightly off-brand for a dark terminal aesthetic |
| **Dark mode execution** | STRONG | OLED mode properly implemented with conditional backgrounds throughout. Dual-mode is a first-class citizen |
| **Token utilization** | WEAK | Strong token *definitions* in `:root`, but weak *adoption*. ~121 hardcoded colors in App.jsx, transitions hardcoded on cards, shadows hardcoded in stat hover. The design system is well-designed but under-used |
| **Responsive adaptation** | GOOD | Mobile-first with desktop sidebar layout. Touch targets addressed. But style vocabulary doesn't degrade gracefully — same complexity on small screens |

**Overall Execution: 7/10 — GOOD with specific gaps**

The design *vision* is excellent: a Cyberpunk/Terminal gacha command center rendered in Glassmorphism materials. Execution is strong at the system definition level but degrades at the application layer where developers bypassed tokens with hardcoded values. The path to 9/10 is tokenization and consistency, not redesign.

**Specific execution gaps (with solutions):**

| # | Gap | Severity | Solution |
|---|-----|----------|----------|
| DS1-E1 | Card transition hardcodes `0.3s` instead of `var(--transition-normal)` | LOW | Replace `transition: transform 0.3s ...` with `transition: transform var(--transition-normal), box-shadow var(--transition-normal), border-color var(--transition-normal)` in `.kuro-card` (line 722) |
| DS1-E2 | `.kuro-stat:hover` hardcodes `rgba(0, 0, 0, 0.3)` shadow | LOW | Replace with `box-shadow: var(--shadow-md)` or define `--shadow-hover` token |
| DS1-E3 | Button active state text colors use light pastels (`#fef08a`, `#fbcfe8`, `#bae6fd`, `#e9d5ff`, `#86efac`, `#fecaca`) | LOW | These are intentionally light for readability against dark glowing backgrounds. **PASSED — style-appropriate.** The pastels serve as high-contrast legibility aids within the glow effect. No change needed. |
| DS1-E4 | Desktop sidebar easing `cubic-bezier(0.4, 0, 0.2, 1)` differs from app standard `cubic-bezier(0.16, 1, 0.3, 1)` | LOW | Unify to `var(--transition-slow)` which uses the standard spring curve. The sidebar expand/collapse should feel like the rest of the app |
| DS1-E5 | `.kuro-input` text color hardcodes `#ffffff` (line 992) | LOW | Replace with `color: var(--text-heading)` — heading token is `#edf1f8`, nearly white but theme-consistent |
| DS1-E6 | `.kuro-btn:hover` hardcodes `color: #ffffff` (line 889) | LOW | Replace with `color: var(--text-heading)` |
| DS1-E7 | Slider thumb gradients hardcode `#e6b030, #edaf18` (lines 1190, 1206) | LOW | Replace with `linear-gradient(135deg, rgba(var(--color-gold), 1), rgba(var(--color-gold), 0.85))` |
| DS1-E8 | Placeholder colors `#6b7389` and `#8f99ab` not tokenized (lines 1017, 1022) | LOW | Add `--text-placeholder: #6b7389` and `--text-placeholder-focus: #8f99ab` to `:root` |
| DS1-E9 | No spacing scale tokens | MEDIUM | Add `--space-xs: 4px`, `--space-sm: 8px`, `--space-md: 14px`, `--space-lg: 20px`, `--space-xl: 32px` to `:root`. Current 14px padding works but isn't systematic |
| DS1-E10 | `.kuro-input:hover` border hardcodes `rgba(255,255,255,0.3)` (line 1002) | LOW | Replace with `border-color: var(--border-bright)` (0.2 opacity) or add `--border-focus: rgba(255,255,255,0.3)` |

---

### §DS2 — Coherence Audit

---

#### DS2.1 STYLE VOCABULARY ACROSS ALL 8 TABS

**Methodology:** Each tab audited for adherence to the KuroStyles vocabulary: `kuro-card` → `kuro-header` → `kuro-body` structure, `kuro-stat` data boxes, `kuro-btn` buttons, `TabBackground` backdrop, and CSS custom property usage vs hardcoded bypasses.

##### TAB 1: TRACKER (`[TAB-TRACKER]`, lines ~3215–3371)

| Dimension | Status | Detail |
|-----------|--------|--------|
| Card structure | **PASS** | Uses `Card` → `CardHeader` → `CardBody` consistently |
| Stat boxes | **PASS** | Uses `kuro-stat` for banner history |
| Buttons | **PASS** | `kuro-btn` with `active-gold`, `active-pink`, `active-cyan` states |
| TabBackground | **PASS** | `<TabBackground id="tracker" glowColor="gold" />` |
| Token adherence | **MINOR ISSUE** | Banner ended alert uses Tailwind `bg-yellow-500/10`, `border-yellow-500/30` instead of design system classes |
| Custom components | **PASS** | `BannerCard` and `StandardBannerSection` are structural wrappers, not style-breaking |

**Solution for minor issue:** The Tailwind alert styling is contextual (temporary status indicator) and sits within the card system. Acceptable as-is, but could be unified into a `kuro-alert-gold` class for reuse. **LOW priority — cosmetic.**

##### TAB 2: EVENTS (`[TAB-EVENTS]`, lines ~3372–3447)

| Dimension | Status | Detail |
|-----------|--------|--------|
| Card structure | **PASS** | Standard `Card` → `CardHeader` → `CardBody` |
| Stat boxes | **PASS** | Uses styled progress bars within card bodies |
| Buttons | **PASS** | Refresh button with `text-cyan-400` |
| TabBackground | **PASS** | `<TabBackground id="events" />` |
| Token adherence | **MINOR ISSUE** | Progress bar uses Tailwind `bg-emerald-400` and `bg-yellow-500/10` directly |
| Custom components | **PASS** | `EventCard` is a structural wrapper, style-consistent |

**Solution for minor issue:** Progress bars are dynamic-width elements that require inline `style={{ width }}`. The color choice (`bg-emerald-400`) is consistent with the emerald semantic color used throughout. **PASSED — style-appropriate.** For maximal consistency, could add `--color-emerald-solid: #34d399` token.

##### TAB 3: CALC (`[TAB-CALC]`, lines ~3448–3733)

| Dimension | Status | Detail |
|-----------|--------|--------|
| Card structure | **PASS** | Multiple `Card` sections with proper hierarchy |
| Stat boxes | **PASS** | Heavy `kuro-stat` usage with color variants (`kuro-stat-emerald`, `kuro-stat-gold`, `kuro-stat-pink`, `kuro-stat-cyan`, `kuro-stat-red`) — excellent system usage |
| Buttons | **PASS** | Extensive `kuro-btn` with `active-gold`, `active-pink`, `active-cyan`, `active-emerald` |
| TabBackground | **PASS** | `<TabBackground id="calc" />` |
| Token adherence | **ISSUE** | `PityCounterInput` receives hardcoded hex colors as props: `color="#edaf18"`, `color="#f9a8d4"`, `color="#22d3ee"`. Priority slider gradient hardcodes `#edaf18` and `#ec4899` in inline style |
| Custom components | **MINOR ISSUE** | `PityCounterInput` and `CalcResultsCard` are custom but follow card conventions |

**Solution:** Replace hardcoded color props with semantic tokens. `PityCounterInput` should accept a color *name* (e.g., `"gold"`, `"pink"`, `"cyan"`) and resolve to `rgba(var(--color-gold), 1)` internally. Priority slider gradient should reference `rgba(var(--color-gold), 1)` and `rgba(var(--color-pink), 1)`. **MEDIUM priority — repeated hardcoded values.**

##### TAB 4: PLANNER (`[TAB-PLANNER]`, lines ~3735–3974)

| Dimension | Status | Detail |
|-----------|--------|--------|
| Card structure | **PASS** | Consistent `Card` → `CardHeader` → `CardBody` throughout all sections |
| Stat boxes | **PASS** | Multiple `kuro-stat` grids for projections and "By Banner End" data |
| Buttons | **PASS** | `kuro-btn` with `active-emerald` for Lunite toggle |
| TabBackground | **PASS** | `<TabBackground id="planner" />` |
| Token adherence | **MINOR ISSUE** | Lunite indicator uses Tailwind `bg-emerald-500/10`, daily income uses `bg-yellow-500/10` — status indicators |
| Custom components | **PASS** | No custom components — fully standard card system. Most structurally disciplined tab |

**Solution for minor issue:** Status indicator pills could use existing `kuro-stat-emerald` and `kuro-stat-gold` classes instead of inline Tailwind. **LOW priority — visual result identical.**

**Planner is the gold standard tab** — best structural discipline, highest token adherence, no style-breaking elements.

##### TAB 5: STATS (`[TAB-STATS]`, lines ~3981–4759)

| Dimension | Status | Detail |
|-----------|--------|--------|
| Card structure | **PASS** | Uses `Card` system for all major sections |
| Stat boxes | **PASS** | Very heavy `kuro-stat` usage — stats tab is the stat system's showcase |
| Buttons | **PASS** | `kuro-btn` with `active-cyan` for mode switches |
| TabBackground | **PASS** | `<TabBackground id="stats" />` |
| Token adherence | **MAJOR ISSUE** | Heaviest hardcoding of any tab. Luck badge uses inline `style={{color: luckRating.color, textShadow: ...}}`. Trophy cards use inline `style={{ background: linear-gradient..., border, boxShadow }}`. Leaderboard medal colors from `MEDAL_COLORS` constant. Chart tooltip and legend fully inline. Pity histogram neon dots use hardcoded box-shadows |
| Custom components | **ISSUE** | `luck-badge` custom CSS class, Recharts `AreaChart` with inline SVG gradients, trophy grid with custom card styling — significant departure from card system |

**Solution:** Stats is the most complex tab and legitimately needs dynamic colors (luck rating, element-based trophies, chart data). However:
1. **Luck badge:** Extract to a `kuro-badge` variant with `--badge-color` already used as CSS variable — just needs to be formalized as a design system component
2. **Trophy cards:** Their gradient/glow styling should use the same `kuro-stat-{color}` patterns rather than rebuilding the effect inline
3. **MEDAL_COLORS constant:** Move `['#edaf18','#c0c0c0','#cd7f32']` to CSS variables `--color-medal-gold`, `--color-medal-silver`, `--color-medal-bronze`
4. **Chart styling:** Recharts requires inline SVG attributes — this is a library constraint, not a design system failure. **PASSED — library constraint.**
5. **Pity histogram dots:** Extract to `kuro-legend-dot` class with color variants

**MEDIUM-HIGH priority — Stats is the public showcase tab (leaderboards, trophies) and deserves the tightest execution.**

##### TAB 6: COLLECT (`[TAB-COLLECT]`, lines ~4760–5032)

| Dimension | Status | Detail |
|-----------|--------|--------|
| Card structure | **PASS** | Standard `Card` system for all sections |
| Stat boxes | **MINOR ISSUE** | Uses `style={{ background: 'var(--bg-stat)' }}` inline instead of `kuro-stat` class |
| Buttons | **PASS** | Filter and sort buttons use `kuro-btn` |
| TabBackground | **PASS** | `<TabBackground id="gathering" />` |
| Token adherence | **GOOD** | Most inline styles reference CSS variables (`var(--bg-stat)`, `var(--bg-btn)`) rather than hardcoded hex |
| Custom components | **PASS** | `CollectionGridSection` is a reusable structural component |

**Solution for stat box issue:** Replace `style={{ background: 'var(--bg-stat)' }}` with `className="kuro-stat"` to get the full stat box treatment (border, backdrop-filter, hover effects) rather than just the background color. **LOW priority — functional but under-styled.**

**Collect tab has the best inline-style discipline** — when it does use inline styles, they reference CSS variables rather than hardcoded values.

##### TAB 7: TEAMS (`[TAB-TEAMS]`, lines ~5033–6463)

| Dimension | Status | Detail |
|-----------|--------|--------|
| Card structure | **PASS** | Primary `Card` wrapper with proper hierarchy |
| Stat boxes | **PASS** | Team stats use styled containers |
| Buttons | **PASS** | `kuro-btn` with `active-gold` for compare, team selector tabs |
| TabBackground | **PASS** | `<TabBackground id="teams" />` |
| Token adherence | **MAJOR ISSUE** | Element-based dynamic colors are entirely hardcoded via `getElementColor()`, `getElementBg()`, `getElementBorder()` functions returning raw hex values. Character stats badges use inline `boxShadow`. Damage analysis sections have heavy inline styling |
| Custom components | **ISSUE** | Character slot UI, team comparison system, damage analysis calculator — all custom-built with inline styles |

**Solution:** The Teams tab faces the same challenge as Stats — dynamic, data-driven colors. However:
1. **Element color functions:** `getElementColor()` should return CSS variable references, not hex values. Define `--element-fusion`, `--element-glacio`, `--element-electro`, etc. in `:root`. The functions then return `rgba(var(--element-fusion), 1)`
2. **Character slot styling:** Extract the overlay/gradient patterns to `kuro-char-slot` class
3. **Damage analysis:** Complex inline calculations are acceptable for dynamic data. Focus on extracting the *static* patterns (badge backgrounds, text shadows) to classes
4. **Text shadow on character names:** `textShadow: '0 2px 8px rgba(0,0,0,0.9)'` should be a utility class `kuro-text-shadow-heavy` since it's used across multiple components

**MEDIUM priority — Teams is complex but the static patterns are extractable.**

##### TAB 8: PROFILE (`[TAB-PROFILE]`, lines ~6464–6809)

| Dimension | Status | Detail |
|-----------|--------|--------|
| Card structure | **PASS** | Multiple `Card` sections: Server Region, Resonator Profile, Display Settings, Import |
| Stat boxes | **N/A** | Profile doesn't use stat boxes — appropriate, it's a settings tab |
| Buttons | **PASS** | Heavy `kuro-btn` with `active-gold` for server/platform selection |
| TabBackground | **PASS** | `<TabBackground id="profile" />` |
| Token adherence | **MINOR ISSUE** | Profile pic container uses complex inline style with hardcoded `boxShadow` and `border` that replicate existing tokens. OLED toggle uses conditional inline styles |
| Custom components | **PASS** | Toggle switches are custom but visually consistent. `ImportGuide` is structural |

**Solution:**
1. **Profile pic container:** Replace inline `style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)' }}` with `box-shadow: var(--shadow-md)` + existing inset pattern
2. **OLED toggle:** The conditional background (`#fff` vs `var(--bg-btn)`) is a legitimate toggle widget styling need. However, the track and thumb should use `kuro-toggle-track` / `kuro-toggle-thumb` classes for consistency. **LOW priority.**

**Profile tab is well-structured** — settings tabs naturally have fewer style-breaking patterns.

---

**TAB VOCABULARY SUMMARY:**

| Tab | Structural Compliance | Token Adherence | Style Breaks | Overall |
|-----|----------------------|-----------------|--------------|---------|
| Tracker | FULL | GOOD | 1 minor | A |
| Events | FULL | GOOD | 1 minor | A |
| Calc | FULL | MODERATE | 2 (hardcoded color props) | B+ |
| Planner | FULL | EXCELLENT | 0 | A+ |
| Stats | FULL | WEAK | 5+ (heaviest offender) | C+ |
| Collect | FULL | GOOD | 1 minor | A |
| Teams | FULL | WEAK | 4+ (element color system) | B- |
| Profile | FULL | GOOD | 2 minor | A- |

**Key finding: Structural compliance is 100% — all 8 tabs use the kuro-card system and TabBackground without exception.** The style vocabulary breaks are exclusively at the *token adherence* level, not the *structural* level. This confirms the MIXED-INTENTIONAL coherence score: the architecture is coherent, the value implementation leaks.

---

#### DS2.2 STYLE INFLECTION POINTS

Every component or pattern that breaks the established visual language. An inflection point is a moment where the user's eye encounters a different design "voice."

| # | Inflection Point | Location | Established Language | What Breaks | Intentional? | Solution |
|---|-----------------|----------|---------------------|-------------|--------------|----------|
| IP-1 | **Luck badge** | Stats tab, line ~4005 | `kuro-stat` boxes with token colors | Custom `luck-badge` / `luck-badge-inner` CSS classes with dynamic inline `color`, `textShadow`, percentage-width gradient — a completely different component model | INTENTIONAL — luck rating is a hero element deserving unique treatment | Formalize as `kuro-badge` in KuroStyles. Keep the unique visual but bring it under system governance. Define `.kuro-badge { --badge-color: ... }` with the same glass + glow grammar as `kuro-stat` |
| IP-2 | **Trophy card grid** | Stats tab, lines ~4296–4340 | `kuro-card` with standard border/shadow | Inline `style={{ background: linear-gradient(...), border: 1px solid ..., boxShadow: ... }}` rebuilds the card effect from scratch per trophy | ACCIDENTAL — same visual intent as kuro-card-inner but reimplemented inline | Extract to `.kuro-trophy-card` class with color variants, reusing `kuro-card-inner` patterns. The gradient/glow should use `rgba(var(--color-gold), 0.x)` syntax |
| IP-3 | **PityCounterInput color props** | Calc tab, lines ~3510–3540 | CSS custom properties (`--color-gold`, `--color-pink`, `--color-cyan`) | Hardcoded hex strings passed as React props: `color="#edaf18"`, `color="#f9a8d4"`, `color="#22d3ee"` | ACCIDENTAL — developer shortcut bypassing the token layer | Refactor to accept semantic color names and resolve internally: `colorName="gold"` → `rgba(var(--color-gold), 1)` |
| IP-4 | **Element color system** | Teams tab, lines ~5232+ | Token-based colors | `getElementColor()`, `getElementBg()`, `getElementBorder()` return raw hex values applied inline | ACCIDENTAL — a parallel color system that should feed from CSS variables | Define `--element-{name}` CSS custom properties in `:root`. Refactor utility functions to return `rgba(var(--element-fusion), 1)` etc. |
| IP-5 | **Recharts visualization** | Stats tab, lines ~4600+ | KuroStyles surfaces and colors | Recharts components require inline SVG attributes for fills, strokes, gradients — completely outside CSS | INTENTIONAL — library constraint. Recharts does not support CSS custom properties in SVG gradients | **PASSED — library constraint.** Mitigate by defining chart color constants that reference the same RGB values as CSS tokens, ensuring visual alignment even without direct token usage |
| IP-6 | **Error boundary** | `appcore-components.jsx` | KuroStyles card system | Fully hardcoded inline styles: colors, backgrounds, borders, shadows — zero token usage | ACCIDENTAL — likely built as standalone fallback before design system existed | Rewrite error boundary to use `kuro-card`, `kuro-header`, `kuro-body` classes. It already renders within the app shell, so design system classes are available |
| IP-7 | **Modal backdrop** | `appcore-components.jsx`, 10+ instances | Should use a single token | `rgba(12,16,24,0.95)` repeated as hardcoded value in every modal | ACCIDENTAL — copy-paste propagation | Add `--bg-overlay: rgba(12, 16, 24, 0.95)` to `:root` (with OLED variant `rgba(0, 0, 0, 0.98)`). Replace all instances with `var(--bg-overlay)` |
| IP-8 | **Priority slider gradient** | Calc tab, line ~3626 | Token colors | Inline `background: linear-gradient(to right, #edaf18 0%, #edaf18 ${pct}%, #ec4899 ${pct}%, #ec4899 100%)` | ACCIDENTAL — dynamic gradient built from hardcoded hex | Use `rgba(var(--color-gold), 1)` and `rgba(var(--color-pink), 1)` in the template literal |
| IP-9 | **`.kuro-calc` font-family** | `appcore-providers.jsx`, line 532 | `var(--font-display)` (Rajdhani) | Uses system font stack `ui-sans-serif, system-ui...` without Rajdhani — every other component uses Rajdhani | ACCIDENTAL — fallback stack written without the primary font | Prepend `var(--font-display)` to the `.kuro-calc` font-family declaration. The system stack should be the *fallback*, not the primary |
| IP-10 | **OLED toggle widget** | Profile tab, line ~6560 | `kuro-btn` / `kuro-stat` toggle patterns | Custom toggle with hardcoded `#fff` track color and conditional `bg-black` / `bg-gray-400` thumb | INTENTIONAL — toggle widgets are a specialized UI element with unique state-visual requirements | Formalize as `.kuro-toggle` in KuroStyles with `--toggle-track-on`, `--toggle-track-off`, `--toggle-thumb` tokens. The toggle is repeated (OLED toggle, swipe toggle) and should be a first-class design system component |

**Inflection point breakdown:**
- **Intentional (keep, formalize):** 3 (IP-1 luck badge, IP-5 Recharts, IP-10 toggle)
- **Accidental (fix):** 7 (IP-2 trophy, IP-3 pity counter, IP-4 elements, IP-6 error boundary, IP-7 modal, IP-8 slider, IP-9 font)

---

#### DS2.3 INTENTIONAL TENSION VS ACCIDENTAL MIXING

**Intentional Tensions (style-appropriate, keep):**

1. **Cyberpunk/Terminal × Glassmorphism fusion** — This is the app's identity, not a tension. The HUD chrome (corner brackets, shimmer lines, gold accents) is rendered through glass materials (backdrop-blur, alpha surfaces, layered shadows). Both schools serve the same emotional register: precision instrumentation.

2. **Monospace data × Display headings** — JetBrains Mono for numbers, Rajdhani for labels. This dual-font system is *required* by the content: tabular-nums data must be monospace, display text should be branded. The tension is functional, not aesthetic.

3. **Warm gold accent × Cool blue-black field** — The gold is an intentional chromatic outlier. It draws attention to interactive elements and data highlights against the cool void. This is a classic sci-fi UI technique (think: cockpit HUD gold on black).

4. **Playful trophy copy × Serious data UI** — Trophy names ("Down Bad (Financially)", "Rover's Plot Armor") contrast with the precision-instrument visual language. This tension is the app's personality — the community voice emerging through formal structures. It's a *feature*, not a bug.

**Accidental Mixing (needs fixing):**

1. **Token-governed system × Hardcoded application layer** — The design system (KuroStyles) is well-tokenized. The application code (App.jsx) frequently bypasses tokens with raw hex/rgba values. This creates visual *near-matches* that are worse than deliberate differences — the eye notices a `#ffffff` that should be `#edf1f8` as "something's off" without being able to name it.

2. **Tailwind color utilities × CSS custom properties** — The app uses both `text-yellow-400` (Tailwind) and `rgba(var(--color-gold), 1)` (design system) for conceptually identical gold text. These resolve to different values (`#facc15` vs `rgb(237,175,24)`) creating a split-gold problem.

3. **Consistent card chrome × Inconsistent data visualization** — Cards, buttons, stats, and inputs all follow the glass-on-dark grammar. But charts, badges, and inline data visualizations each invent their own surface treatment. The vocabulary diverges exactly where complexity increases.

**Solution for accidental mixing category:**
The fix is singular: **enforce token usage at the application layer.** The design system definitions are correct. The violations are all in `App.jsx` and `appcore-components.jsx`. A systematic search-and-replace pass would resolve 80% of the issues without any visual change.

---

#### DS2.4 HARDCODED VALUE AUDIT

Systematic inventory of hex/rgba values that bypass the CSS custom property system. Grouped by category with per-finding solutions.

##### CATEGORY A: PITY TIER COLORS (CRITICAL — most repeated pattern)

The pity tier color scale (`green → lime → yellow → orange → red`) appears in **5+ separate locations** across `App.jsx`, each time re-declared as inline Tailwind classes:

| Color | Tailwind Class | Hex Value | Instances | Used For |
|-------|---------------|-----------|-----------|----------|
| Green (safe) | `text-emerald-400` | `#34d399` | ~20 | Pity 1–30, wins, positive states |
| Lime (good) | `text-lime-400` | `#a3e635` | ~15 | Pity 31–50 |
| Yellow (caution) | `text-yellow-400` | `#facc15` | ~40 | Pity 51–64, gold accent, warnings |
| Orange (danger) | `text-orange-400` | `#fb923c` | ~20 | Pity 65–74, soft pity zone |
| Red (critical) | `text-red-400` | `#f87171` | ~25 | Pity 75–80, losses, errors |

**Total: ~120 Tailwind color class instances** across the app.

**Solution:** These are the app's semantic data scale — they need to be design system citizens, not ad-hoc Tailwind. Add to `:root`:
```css
--pity-safe: 52, 211, 153;      /* emerald-400 */
--pity-good: 163, 230, 53;      /* lime-400 */
--pity-caution: 250, 204, 21;   /* yellow-400 */
--pity-danger: 251, 146, 60;    /* orange-400 */
--pity-critical: 248, 113, 113; /* red-400 */
```
Then create utility classes: `.kuro-text-safe`, `.kuro-text-good`, `.kuro-text-caution`, `.kuro-text-danger`, `.kuro-text-critical`.

**Severity: MEDIUM** — Not a visual bug (Tailwind values are consistent) but a maintainability and theming gap. If the color palette ever changes, 120+ class references need updating.

**Note on Tailwind vs token duality:** The Tailwind `text-yellow-400` (`#facc15`) and the CSS variable `--color-gold` (`rgb(237,175,24)`) are *different yellows*. Tailwind yellow is a pure bright yellow; the design system gold is a warmer amber. Both are used for "gold" semantics, creating a **split-gold problem**. Recommendation: audit every `text-yellow-400` usage and determine if it should be `rgba(var(--color-gold), 1)` (the branded amber) or keep as-is (generic yellow).

##### CATEGORY B: TROPHY SYSTEM COLORS (~100 instances in `App.jsx`)

The trophy system (lines ~1621–1968) assigns hardcoded hex colors to every trophy:

| Trophy Tier | Color | Hex | Count |
|-------------|-------|-----|-------|
| Legendary | Gold/Red | `#edaf18`, `#ff0000` | ~12 |
| Gold | Gold | `#edaf18` | ~15 |
| Purple | Purple | `#a855f7` | ~8 |
| Pink | Pink | `#ec4899` | ~6 |
| Orange | Orange | `#f97316` | ~8 |
| Green | Green | `#22c55e` | ~10 |
| Cyan | Cyan | `#06b6d4` | ~6 |
| Blue | Blue | `#3b82f6` | ~4 |
| Gray | Gray | `#6b7280` | ~15 |
| Red | Red | `#ef4444` | ~8 |

**Total: ~92 hardcoded color assignments** in the trophy computation function alone.

**Solution:** Define a `TROPHY_TIER_COLORS` map in `appcore-data.js`:
```js
const TROPHY_TIER_COLORS = {
  legendary: 'rgba(var(--color-gold), 1)',
  gold: 'rgba(var(--color-gold), 1)',
  purple: 'rgba(var(--color-purple), 1)',
  pink: 'rgba(var(--color-pink), 1)',
  orange: '#f97316',  // no existing token — add --color-orange
  green: 'rgba(var(--color-emerald), 1)',
  cyan: 'rgba(var(--color-cyan), 1)',
  blue: '#3b82f6',    // no existing token — add --color-blue
  gray: '#6b7280',    // no existing token — add --color-muted
  red: 'rgba(var(--color-red), 1)',
};
```
Then each trophy references `color: TROPHY_TIER_COLORS[tier]` instead of repeating hex values. This also enables future theming (e.g., OLED-adjusted trophy glow intensities).

**New tokens needed:** `--color-orange: 249, 115, 22`, `--color-blue: 59, 130, 246`, `--color-muted: 107, 114, 128`

**Severity: MEDIUM** — The trophy colors are functionally correct but create a maintenance hazard. If the app's gold shifts from `#edaf18` to a different hue, 27 trophy definitions need manual updates.

##### CATEGORY C: MODAL BACKDROP (`appcore-components.jsx`)

| Value | Instances | Location |
|-------|-----------|----------|
| `rgba(12,16,24,0.95)` | ~10 | Every modal's backdrop overlay |

**Solution:** Already identified in IP-7. Add `--bg-overlay` token to `:root` with OLED variant. Single-point-of-change.

**Severity: LOW** — Consistent value (always the same rgba), just not tokenized.

##### CATEGORY D: ELEMENT_COLORS SYSTEM (`appcore-data.js`)

The `ELEMENT_COLORS` object (lines 1966–1972) stores hardcoded hex values for game elements:

```js
ELEMENT_COLORS = {
  Fusion:  { hex: '#f97316', bg: 'rgba(249,115,22,0.15)', border: 'rgba(249,115,22,0.4)' },
  Electro: { hex: '#a855f7', bg: 'rgba(168,85,247,0.15)', border: 'rgba(168,85,247,0.4)' },
  Aero:    { hex: '#10b981', ... },
  Glacio:  { hex: '#06b6d4', ... },
  Havoc:   { hex: '#ec4899', ... },
  ...
}
```

**Current state:** This is a *centralized* color system (single source of truth, used via `getElementColor()` etc.), which is better than inline hex. But it bypasses CSS custom properties.

**Solution:** Move to CSS custom properties:
```css
:root {
  --element-fusion: 249, 115, 22;
  --element-electro: 168, 85, 247;
  --element-aero: 16, 185, 129;
  --element-glacio: 6, 182, 212;
  --element-havoc: 236, 72, 153;
  --element-spectro: 237, 175, 24;
}
```
Then `ELEMENT_COLORS` derives from these: `hex: 'rgb(var(--element-fusion))'`. This enables OLED-mode element color adjustments and future theming.

**Severity: LOW-MEDIUM** — Already centralized, just needs CSS variable migration.

##### CATEGORY E: MEDAL_COLORS (`appcore-data.js`)

```js
const MEDAL_COLORS = ['#edaf18', '#c0c0c0', '#cd7f32'];
```

Three hardcoded hex values for gold/silver/bronze medals in the leaderboard.

**Solution:** Add to `:root`: `--color-medal-gold: #edaf18`, `--color-medal-silver: #c0c0c0`, `--color-medal-bronze: #cd7f32`. Array becomes `[var(--color-medal-gold), ...]`.

**Severity: LOW** — Only used in one location, but should be tokenized for OLED compatibility (silver `#c0c0c0` may need adjustment on pure black).

##### CATEGORY F: PITY COUNTER INPUT PROPS (`App.jsx`)

| Prop | Value | Line |
|------|-------|------|
| `color` | `"#edaf18"` | ~3510 |
| `softColor` | `"#fb923c"` | ~3510 |
| `softGlow` | `"rgba(251,146,60,0.5)"` | ~3510 |
| `color` | `"#f9a8d4"` | ~3520 |
| `softColor` | `"#ec4899"` | ~3520 |
| `color` | `"#22d3ee"` | ~3530 |
| `softColor` | `"#67e8f9"` | ~3530 |

**Solution:** Already covered in IP-3. Refactor `PityCounterInput` to accept semantic color names and resolve internally via CSS variables.

**Severity: MEDIUM** — These props are the Calc tab's most prominent visual elements.

##### CATEGORY G: MANIFEST & META COLORS (`App.jsx`)

```js
background_color: '#0a0a1a'   // line 463
theme_color: '#0c0820'         // line 464
```

**Solution:** These are PWA manifest values and must be static strings (cannot use CSS variables). However, they should match the actual `html` background. Current values (`#0a0a1a`, `#0c0820`) differ from the app's actual background (`#080c14`).

**Fix:** Update to `background_color: '#080c14'` and `theme_color: '#080c14'` to match the actual app background.

**Severity: LOW** — Only visible during PWA splash screen, but the mismatch creates a flash of incorrect color.

##### HARDCODED VALUE AUDIT SUMMARY

| Category | Instances | Severity | Fix Complexity |
|----------|-----------|----------|----------------|
| A. Pity tier Tailwind colors | ~120 | MEDIUM | Add 5 pity tokens + utility classes, gradual migration |
| B. Trophy system colors | ~92 | MEDIUM | Create TROPHY_TIER_COLORS map + 3 new tokens |
| C. Modal backdrop | ~10 | LOW | Add 1 token, search-replace |
| D. Element colors | 6 entries | LOW-MEDIUM | Migrate ELEMENT_COLORS to CSS vars |
| E. Medal colors | 3 values | LOW | Add 3 tokens |
| F. Pity counter props | 9 values | MEDIUM | Refactor component API |
| G. Manifest colors | 2 values | LOW | Update to match actual bg |
| **Total** | **~240+** | | |

**Critical path:** Categories A and B account for ~88% of all hardcoded color instances. Fixing these two categories would bring the app from ~240 hardcoded values to ~50, dramatically improving token adherence.

---

#### DS2.5 SHAPE SYSTEM CONSISTENCY

Audit of `border-radius` values across the entire design system to identify the shape language and any inconsistencies.

##### BORDER-RADIUS INVENTORY

All `border-radius` values found in `appcore-providers.jsx` (KuroStyles):

| Value | Component | Line | Role |
|-------|-----------|------|------|
| `16px` | `.kuro-card` | 714 | Primary card container |
| `15px` | `.kuro-card-inner` | 773 | Inner card content |
| `12px` | `.kuro-btn` | 859 | Buttons |
| `10px` | `.kuro-stat` | 1039 | Stat boxes |
| `8px` | `.kuro-input` | 990 | Input fields |
| `8px` | `.kuro-toggle-track` (responsive) | 1337 | Toggle switches |
| `6px` | `.kuro-badge` (responsive) | 1310 | Badges at small size |
| `4px` | `.kuro-card-inner::before/::after` corner brackets | 786, 800 | Decorative corners |
| `3px` | `.kuro-slider` track | 1178 | Slider track |
| `3px` | Scrollbar thumb | 490 | Scrollbar |
| `2px` | `.kuro-header h3::before` gold bar | 845 | Header accent |
| `1px` | `.tab-indicator` | 704 | Tab underline |
| `50%` | `.kuro-slider` thumb | 1189 | Circular slider handle |

**Analysis:**

The shape system uses **13 different radius values** across the design system. This is NOT a formal scale — it's an *organic* gradient from pill-shaped cards (16px) down to sharp accents (1px).

| # | Finding | Status | Solution |
|---|---------|--------|----------|
| SH-1 | **Card vs card-inner mismatch: 16px vs 15px** | **ISSUE** | The 1px difference between `.kuro-card` (16px) and `.kuro-card-inner` (15px) is *likely intentional* — the inner element is 1px smaller to account for the parent's 1px border, ensuring the inner content doesn't clip the rounded corners. **PASSED — structural intent.** However, this should be documented with a comment: `/* 15px = parent 16px - 1px border */` |
| SH-2 | **No border-radius tokens** | **ISSUE** | All radius values are hardcoded numbers. Define a scale: `--radius-xs: 2px`, `--radius-sm: 4px`, `--radius-md: 8px`, `--radius-lg: 12px`, `--radius-xl: 16px`, `--radius-full: 50%`. Then components reference tokens instead of magic numbers |
| SH-3 | **Button (12px) vs Input (8px) vs Stat (10px)** | **PASS** | The descending scale (card 16 → button 12 → stat 10 → input 8) creates a natural hierarchy where larger containers have softer edges and smaller elements are more compact. This reads as intentional differentiation, not inconsistency |
| SH-4 | **Responsive badge uses 6px, 8px, 10px** | **PASS** | These responsive breakpoint adjustments (lines 1310, 1315, 1319) appropriately scale the radius with the element size. Smaller screen → smaller radius → more compact feel |
| SH-5 | **Tailwind rounded-* classes in App.jsx** | **MINOR ISSUE** | App.jsx also uses Tailwind `rounded-lg`, `rounded-xl`, `rounded-full` which resolve to different values than the KuroStyles scale. `rounded-lg` = 8px in Tailwind ≠ 12px `.kuro-btn`. Potential confusion. Solution: Where possible, prefer KuroStyles classes over Tailwind radius utilities for consistency |

**Shape system verdict: GOOD — organically consistent, needs formalization.**

The radius values form a logical hierarchy but aren't governed by tokens. The 16→12→10→8 descending scale is appropriate for the Cyberpunk/Terminal style (cards are soft, elements are progressively sharper). Formalize with `--radius-*` tokens to prevent future drift.

---

#### DS2.6 STYLE-APPROPRIATE DETAIL LEVEL

Assessing whether the level of visual detail matches the Cyberpunk/Terminal + Glassmorphism classification:

| Aspect | Assessment | Detail |
|--------|-----------|--------|
| **Chrome density** | **APPROPRIATE** | Corner brackets, shimmer lines, gold bar accents, inset edges — enough HUD chrome to establish the sci-fi register without overwhelming data readability |
| **Animation count** | **APPROPRIATE** | 6 keyframe animations (`slideUp`, `scaleIn`, `borderGlow`, `pulseScale`, `shimmer`, `tabFadeIn`, `cardSlideIn`, `kuroPulseOrange`) — rich enough for atmosphere, not so many as to create visual noise |
| **Shadow complexity** | **APPROPRIATE** | Triple-stack shadows on cards (ambient + ring + inset) is Glassmorphism-correct. Single shadows on hover states. Proper escalation from rest → hover → active |
| **Backdrop-filter usage** | **APPROPRIATE** | Applied to cards, buttons, stats, inputs — every interactive surface. This is correct for Glassmorphism: the blur creates depth without visual weight |
| **Color accent count** | **APPROPRIATE** | 6 accent colors (gold, pink, cyan, purple, emerald, red) each with semantic meaning (banner types, data states). For a gacha tracker with multiple banner types, this palette is necessary |
| **Typography detail** | **APPROPRIATE** | Uppercase labels with letter-spacing, text-shadows, dual fonts — Terminal-native without being cosplay. The labels look like instrument readouts |
| **Transition coverage** | **GOOD** | Most interactive elements have transitions. However, some Tailwind-styled elements lack transitions (inline `text-*` classes don't transition). Solution: Add `transition: color var(--transition-fast)` to base text elements that change color dynamically |
| **Decorative elements** | **APPROPRIATE** | The only purely decorative elements are: corner brackets (establish HUD frame), shimmer line (establish glass surface), gold bar accent (establish section hierarchy). All three serve the Cyberpunk/Terminal identity rather than being arbitrary decoration |
| **Information density** | **EXCELLENT** | Expert-appropriate density. Stats tab shows pity histograms, luck ratings, trophy grids, leaderboards — all without simplification. This matches the A3 axis (ENTHUSIAST/EXPERT audience) |

**Detail level verdict: APPROPRIATE for classification.**

The Cyberpunk/Terminal school expects *more* detail than Minimal/Flat but *less* than full Skeuomorphism. This app sits correctly in that range: HUD chrome provides atmosphere, glass materials provide depth, but the visual noise never overwhelms the data. The one area for improvement is transition consistency on dynamically-colored text elements.

---

### §DS2 FINDINGS SUMMARY

| ID | Finding | Severity | Category |
|----|---------|----------|----------|
| DS2-F1 | Structural compliance 100% across all 8 tabs | **PASS** | Vocabulary |
| DS2-F2 | Stats tab has weakest token adherence (5+ major style breaks) | MEDIUM-HIGH | Vocabulary |
| DS2-F3 | Teams tab element color system bypasses CSS variables | MEDIUM | Vocabulary |
| DS2-F4 | Planner tab is the gold standard (zero style breaks) | **PASS** | Vocabulary |
| DS2-F5 | 10 style inflection points identified (3 intentional, 7 accidental) | MEDIUM | Inflection |
| DS2-F6 | Cyberpunk × Glassmorphism fusion is intentional and well-executed | **PASS** | Tension |
| DS2-F7 | Tailwind yellow-400 ≠ design system gold creates split-gold | MEDIUM | Tension |
| DS2-F8 | ~240 hardcoded color values across 7 categories | MEDIUM | Hardcoded |
| DS2-F9 | Pity tier + trophy colors account for 88% of hardcoded values | MEDIUM | Hardcoded |
| DS2-F10 | Modal backdrop repeated 10+ times without token | LOW | Hardcoded |
| DS2-F11 | PWA manifest colors don't match actual app background | LOW | Hardcoded |
| DS2-F12 | Border-radius uses 13 values without tokens but forms logical hierarchy | LOW | Shape |
| DS2-F13 | Card (16px) vs card-inner (15px) is structural intent, not error | **PASS** | Shape |
| DS2-F14 | Detail level appropriate for Cyberpunk/Terminal classification | **PASS** | Detail |
| DS2-F15 | `.kuro-calc` font-family missing Rajdhani as primary | LOW | Inflection |
| DS2-F16 | No spacing scale tokens defined | MEDIUM | Shape |

---

**STEP 2 COMPLETE** — §DS1 Style Classification + §DS2 Coherence Audit established.

**Classification:** Cyberpunk/Terminal (primary) + Glassmorphism (secondary execution layer) + Dashboard (secondary atmospheric)
**Coherence:** MIXED-INTENTIONAL — Design system is coherent, application layer leaks through hardcoded values.
**Execution:** 7/10 GOOD — Strong vision, strong system definitions, weak token adoption in application code.
**Critical fix path:** Tokenize pity tier colors and trophy colors to eliminate 88% of hardcoded value violations.

---
---

# STEP 3: §DP0 — CHARACTER EXTRACTION

> **Extraction method**: Read from code, not from intent. This documents what the design IS, not what it should be.
> **Source files**: `appcore-providers.jsx` (KuroStyles CSS-in-JS), `App.jsx` (application layer), `appcore-components.jsx` (shared components), `appcore-data.js` (data/color definitions), `index.css` (base styles), `tailwind.config.js` (theme config)

---

## §DP0.1 — Color Character

### Background Values

| Layer | Standard Mode | OLED Mode | Temperature |
|-------|--------------|-----------|-------------|
| **App body** | `#080c14` (RGB 8,12,20) | `#000000` | Deep cool navy — blue-shifted near-black |
| **Card surface** | `rgba(12, 16, 24, 0.55)` | `rgba(0, 0, 0, 0.95)` | Cool slate, 55% translucent glass |
| **Card inner** | `rgba(6, 10, 18, 1)` | `rgba(5, 5, 5, 1)` | Solid dark panel |
| **Button** | `rgba(15, 20, 28, 0.85)` | `rgba(0, 0, 0, 0.95)` | Cool dark, 85% glass |
| **Input** | `rgba(15, 20, 28, 0.9)` | `rgba(0, 0, 0, 0.95)` | Cool dark, 90% glass |
| **Stat box** | `rgba(10, 14, 22, 0.8)` | `rgba(0, 0, 0, 0.9)` | Cool dark, 80% glass |
| **Modal backdrop** | `rgba(12, 16, 24, 0.95)` | Same | Near-opaque cool dark |
| **Scrollbar track** | `#0f1520` | — | Slightly lighter than body |

**Background character**: All backgrounds sit in the `hsl(220°-230°, ~40-60%, 3-8%)` range — deeply cool-shifted, consistently blue-tinted. OLED mode flattens to pure black. The standard mode maintains chromatic depth with a navy undertone that reads as "deep space" or "command center darkness." No warm backgrounds exist anywhere in the system.

### Surface Values

| Surface | Value | Treatment |
|---------|-------|-----------|
| **Glass card** | `rgba(12, 16, 24, 0.55)` + `backdrop-blur(4px)` | Frosted glass at 55% opacity |
| **Glass button** | `rgba(15, 20, 28, 0.85)` + `backdrop-blur(8px)` | Denser glass at 85% |
| **Glass input** | `rgba(15, 20, 28, 0.9)` + `backdrop-blur(8px)` | Near-solid glass at 90% |
| **Glass stat** | `rgba(10, 14, 22, 0.8)` + `backdrop-blur(4px)` | Medium glass at 80% |
| **Solid card inner** | `rgba(6, 10, 18, 1)` | Fully opaque dark panel |
| **Modal surface** | `rgba(12, 16, 24, 0.95)` | Near-opaque overlay |

**Surface character**: Three-material system — (1) frosted glass at varying opacity (55%-90%), (2) solid dark panels, (3) near-opaque overlays. All surfaces share the same cool-navy hue family. Blur values range from 4px (cards) to 8px (buttons, inputs) to 20px (desktop sidebar). This is a **glass-over-void** material language.

### Accent Values

| Accent | CSS Variable | Hex | RGB | Character |
|--------|-------------|-----|-----|-----------|
| **Gold** (primary) | `--color-gold` | `#edaf18` | `237, 175, 24` | Warm amber — oversaturated, high-contrast against cool backgrounds |
| **Pink** | `--color-pink` | `#ec4899` | `236, 72, 153` | Hot pink — vivid, synthetic |
| **Cyan** | `--color-cyan` | `#38bdf8` | `56, 189, 248` | Electric cyan — cool, technical |
| **Purple** | `--color-purple` | `#a855f7` | `168, 85, 247` | Vivid purple — neon-range saturation |
| **Emerald** | `--color-emerald` | `#22c55e` | `34, 197, 94` | Bright green — success/positive signal |
| **Red** | `--color-red` | `#f87171` | `248, 113, 113` | Warm coral-red — softer than pure red |

**Accent character**: Six accent colors, all at high saturation (80-100% in HSL). Gold dominates as the primary accent — it appears in focus rings, active states, header chrome, glow effects, and the primary navigation indicator. The remaining five form a **role-based chromatic system**: pink (limited/featured), cyan (standard/weapon), purple (4-star), emerald (success/positive), red (error/negative). The palette is **neon-on-void** — intensely saturated accents against near-black backgrounds, classic cyberpunk chromatics.

### Text Colors

| Role | Value | Character |
|------|-------|-----------|
| **Body text** | `--text-body: #dfe5ef` | Cool blue-white, ~88% lightness |
| **Heading text** | `--text-heading: #edf1f8` | Slightly brighter cool white, ~95% |
| **Pure emphasis** | `#ffffff` | White for maximum contrast moments |
| **Secondary** | `#9ca3af` / `#bcc3d1` | Muted cool gray, 60-75% lightness |
| **Tertiary** | `#6b7280` / `#4b5563` | Dark gray, 40-50% lightness |
| **Input placeholder** | `#6b7389` → focus: `#8f99ab` | Cool gray shifting lighter on focus |

**Text color character**: Three-tier hierarchy — bright cool-white for headers, medium cool-white for body, and two levels of muted gray for secondary/tertiary. All text colors carry the same cool blue undertone as the backgrounds. No warm text colors exist in the base system (warm appears only via accent classes like `text-yellow-400`).

### Gradient Values

| Type | Values | Use |
|------|--------|-----|
| **Gold bar** | `linear-gradient(180deg, rgba(237,175,24,0.9), rgba(237,175,24,0.4))` | Header accent bar |
| **Card shimmer** | `linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)` | Top-edge shimmer line |
| **Banner fade** | `linear-gradient(to top, rgba(8,12,20,0.85) 60%, transparent)` | Image overlay text protection |
| **Empty state glow** | `radial-gradient(ellipse at center, rgba(237,175,24,0.04), transparent 70%)` | Subtle gold ambient |
| **Gold glow** | `radial-gradient(ellipse at 50% 80%, rgba(237,175,24,0.08), transparent 60%)` | 5-star card background glow |
| **Luck badge** | `conic-gradient(from 0deg, var(--badge-color), transparent 50%, var(--badge-color))` | Rotating badge ring |
| **Soft pity pulse** | `linear-gradient(to top, rgba(COLOR,0.15), transparent)` | Animated pity warning |

**Gradient character**: Gradients serve three purposes: (1) gold chrome accents (header bars, glow fields), (2) depth-fading overlays (banner cards, image protection), (3) animated atmospheric effects (shimmer, pulse, badge rotation). All gradients use the accent palette — no neutral or warm gradients exist.

### Overall Palette Feeling

**"Neon-on-void with a single warm anchor."** The palette is overwhelmingly cool (navy/black backgrounds, blue-tinted text, cool-shifted grays) with high-saturation neon accents. Gold functions as the warm anchor point — it's the only consistently warm element, creating a strong temperature contrast that draws the eye to interactive and important elements. The remaining accents (pink, cyan, purple, emerald, red) are all cool-to-neutral, creating a cohesive neon field. This reads as **cyberpunk command interface** — dark operational surfaces with luminous data points.

**Solution for all color findings**: Color extraction is ground truth documentation. No solutions needed at this stage — findings emerge in §DP1 when extraction is compared against intent.

---

## §DP0.2 — Spatial Character

### Dominant Padding Values

| Source | Value | Frequency | Context |
|--------|-------|-----------|---------|
| **CSS (KuroStyles)** | `14px` | Cards, headers, bodies, stats | Primary structural padding |
| **Tailwind** | `p-2` (8px) | 54 uses | Most common general padding |
| **Tailwind** | `p-3` (12px) | 24 uses | Secondary structural padding |
| **Tailwind** | `p-1` (4px) | 14 uses | Tight element padding |
| **CSS (KuroStyles)** | `10px 12px` | Buttons, inputs | Interactive element padding |
| **CSS (KuroStyles)** | `4px 8px` | Small inputs | Compact variant |

### Spacing Rhythm

| Axis | Dominant Value | Frequency | Secondary | Frequency |
|------|---------------|-----------|-----------|-----------|
| **Gap (flex/grid)** | `gap-2` (8px) | 72 uses | `gap-1` (4px) | 41 uses |
| **Gap secondary** | `gap-1.5` (6px) | 29 uses | `gap-3` (12px) | 11 uses |
| **Vertical spacing** | `space-y-2` (8px) | 36 uses | `space-y-3` (12px) | — |
| **Y-axis padding** | `py-0.5` (2px) | 33 uses | `py-1` (4px) | 29 uses |
| **X-axis padding** | `px-1.5` (6px) | 26 uses | `px-3` (12px) | 19 uses |

**Spacing base unit**: 4px — all values are multiples (2px, 4px, 6px, 8px, 10px, 12px, 14px, 16px). The rhythm is consistent and grid-aligned.

### Gap Between Sections

| Context | Gap | Source |
|---------|-----|--------|
| **Card body items** | `gap-2` (8px) | Dominant flex gap |
| **Stat group** | `gap-1.5` (6px) | Tighter for data clusters |
| **Tab content** | `space-y-2` (8px) | Vertical section spacing |
| **Card stacks** | `gap-3` (12px) | Between major sections |

### Overall Density Feeling

**COMFORTABLE-TO-DENSE** — The app balances two spatial modes:
- **Data display**: Dense (9-10px text, gap-1 to gap-2, py-0.5) — information-rich areas like pity counters, stats tables, and trophy grids pack data tightly
- **Structural layout**: Generous (14px card padding, gap-2 to gap-3 section spacing) — cards and sections breathe

This dual density is **intentional for a data tool**: the structural envelope is generous enough to avoid claustrophobia, while data zones are dense enough to show meaningful amounts of information without scrolling. The 8px grid (gap-2) as the dominant rhythm creates a comfortable, not cramped, baseline.

**Solution**: Spatial extraction is ground truth. Findings assessed in §DP1.

---

## §DP0.3 — Typography Character

### Typefaces in Use

| Role | Font | Fallback Chain | Character |
|------|------|---------------|-----------|
| **Display** | Rajdhani | `ui-sans-serif, system-ui, sans-serif` | Geometric, angular, tech-forward — designed for UI/HUD display |
| **Data/Mono** | JetBrains Mono | `ui-monospace, SFMono-Regular, Menlo, Consolas, monospace` | Developer-grade monospace for numeric precision |
| **Body** | System UI stack | `ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif` | Platform-native fallback |

**Type personality**: Two-font system with clear role separation. Rajdhani handles display/UI text (headers, labels, navigation) — its geometric letterforms and angular design reinforce the cyberpunk/HUD aesthetic. JetBrains Mono handles numeric data (pity counters, stats, timers) — its monospace precision communicates data accuracy. The system stack serves as a body text fallback. This reads as **technical instrument typography** — prioritizing clarity and data legibility over warmth.

### Weight Range

| Weight | CSS Value | Tailwind | Frequency | Role |
|--------|-----------|----------|-----------|------|
| **Normal** | `400` | `font-normal` | 7 uses | Rare — body text fallback |
| **Medium** | `500` | `font-medium` | 71 uses | **DOMINANT** — standard UI text |
| **Semibold** | `600` | `font-semibold` | 12 uses | Headers, labels (KuroStyles) |
| **Bold** | `700` | `font-bold` | 66 uses | Numbers, emphasis, stats |

**Weight character**: The weight center sits at 500 (medium) — this avoids both the thinness of 300/400 and the heaviness of 700/800. The system is **medium-biased**, creating a professional, confident-but-not-aggressive feel. Bold is reserved for numeric data and emphasis moments, not for general headings. This is a **measured weight system** that avoids shouting.

### Size Range

| Category | Values | Frequency | Context |
|----------|--------|-----------|---------|
| **Micro** | `text-[8px]` | 26 uses | Ultra-compact labels, badges |
| **Small** | `text-[9px]` | 158 uses | **DOMINANT** — primary data text |
| **Small+** | `text-[10px]` | 153 uses | **CO-DOMINANT** — secondary data text |
| **System small** | `text-xs` (12px) | 95 uses | Standard small text |
| **System base** | `text-sm` (14px) | 45 uses | Standard body text |
| **Heading** | `text-lg` (18px) | 4 uses | Section headers |
| **Hero** | `text-xl` (20px) | 10 uses | Major stats, hero numbers |
| **Display** | `text-2xl` (24px) | 3 uses | Prominent numbers |
| **Feature** | `text-5xl` (48px) | 1 use | Single hero moment |

**Size character**: The type scale is **bottom-heavy** — 9-10px custom sizes dominate with 311 combined uses, more than all standard Tailwind sizes combined (144 uses). This signals **data density priority** — the app optimizes for showing maximum information in minimum space, consistent with a gacha tracker tool identity. The jump from 10px body to 18-20px headers is aggressive (~2× ratio), creating clear hierarchy without intermediate steps.

**Notable**: Heavy use of arbitrary pixel values (`text-[9px]`, `text-[10px]`) rather than Tailwind's scale suggests the standard scale didn't fit the tool's density requirements.

### Letter-Spacing Values

| Value | Tailwind | Context | Character |
|-------|----------|---------|-----------|
| `0.08em` | — | `.kuro-label` (uppercase labels) | Wide — technical HUD labeling |
| `0.1em` | — | Desktop AD margin text | Widest — display/decorative |
| `0.03em` | — | `.kuro-header h3` | Slight — heading refinement |
| `0.02em` | — | `.kuro-btn` | Subtle — button text |
| `0.01em` | — | `.kuro-empty-state` | Minimal — body text |
| `-0.02em` | — | Pity ring text, scoreboard | Tight — numeric display |
| — | `tracking-wider` (0.05em) | 12 uses | Uppercase label convention |

**Tracking character**: The system uses **negative tracking for numbers** (tight, precise data display) and **positive tracking for labels** (wide, HUD-like labeling). This split reinforces the technical instrument personality — numbers compress for density, labels expand for scannability. The `0.08em` on `.kuro-label` with uppercase transform is a classic **HUD/terminal convention**.

### Line-Height Values

| Value | Context | Character |
|-------|---------|-----------|
| `1.0` | Scoreboard numbers | **Ultra-tight** — data display, no leading |
| `1.2` | Pity ring numbers | Tight — numeric display |
| `1.25` | Card headers | Tight — heading compression |
| `1.3` | Stat values, labels | Moderate — balanced |
| `leading-tight` | 3 uses | Tailwind tight |
| `leading-relaxed` | 4 uses | Tailwind relaxed |

**Line-height character**: Predominantly tight (1.0-1.3 range). The system avoids generous leading — even body areas use 1.3 rather than 1.5+. This contributes to the **dense, technical feel** — text blocks are compact, not airy.

### Text Effects

| Effect Type | Values | Count | Character |
|-------------|--------|-------|-----------|
| **Depth shadow** | `0 2px 4px rgba(0,0,0,0.5)` | Headers, labels | Subtle depth — text floats above surface |
| **Color glow** | `0 0 12px rgba(COLOR, 0.6)` | 6 color variants | Active state neon glow |
| **Pity pulse** | `0 0 8px → 0 0 15px + 0 0 25px` | 3 animations | Double-layer animated glow |
| **Dynamic glow** | `0 0 20px ${color}40` | Luck badge, stats | Data-driven color glow |
| **Uppercase** | `text-transform: uppercase` | Labels only | Technical/HUD convention |

**Text effect character**: The glow system is the most distinctive typography feature — text literally emits light in the accent colors, creating a **holographic/neon signage** feeling. Combined with uppercase + wide tracking on labels, this produces the characteristic **HUD data readout** aesthetic. No underlines, no decorative fonts, no text decorations beyond shadow and glow.

### Overall Type Feeling

**TECHNICAL-PRECISION with CYBERPUNK FLAIR.** The typography system communicates "data instrument operated by an expert." Rajdhani's geometric forms + JetBrains Mono's precision + tight leading + wide-tracked uppercase labels + colored text-shadow glows = a **HUD terminal readout** personality. This is not warm, not editorial, not casual — it's purpose-built for dense data display with aesthetic flair through glow effects.

**Solution**: Typography extraction is ground truth. Findings assessed in §DP1.

---

## §DP0.4 — Component Character

### Border Radius Inventory

| Value | Component | Personality Signal |
|-------|-----------|-------------------|
| `1px` | Tab indicator | Near-zero — sharp data accent |
| `2px` | Header accent bar | Minimal — chrome detail |
| `3px` | Scrollbar thumb | Minimal — functional element |
| `4px` | Skeleton loading, corner bracket corners | Small — structural |
| `6px` | Skeleton text | Small — placeholder |
| `8px` | Input, empty state | **Medium — interactive elements** |
| `10px` | Stat box | Medium — data containers |
| `12px` | Button | **Medium-large — primary interactive** |
| `15px` | Card inner wrapper | Large — structural accommodation (16px - 1px border) |
| `16px` | Card outer | **Large — primary container** |
| `rounded-xl` (12px) | Install banner, luck badge | Large — promotional/hero |
| `rounded-2xl` (16px) | Onboarding modal | Large — modal |
| `rounded-full` | Decorative circles, progress bars | Circular — non-structural |

**Radius character**: The system uses a **graduated scale** from 1px (sharp data accents) to 16px (container cards). Interactive elements cluster around 8-12px, containers at 15-16px. This is **moderately rounded** — not sharp/technical (0-4px) and not pill-shaped/friendly (20px+). The rounding softens the cyberpunk sharpness just enough to feel **approachable without losing authority**. No fully-square components exist; no pill-shaped buttons exist.

### Shadow Presence

| Level | Token | Value | Usage |
|-------|-------|-------|-------|
| **Small** | `--shadow-sm` | `0 1px 2px rgba(6,10,24,0.4)` | Subtle depth — minimal elevation |
| **Medium** | `--shadow-md` | `0 4px 12px rgba(6,10,24,0.5)` | Default button shadow |
| **Large** | `--shadow-lg` | `0 8px 24px rgba(6,10,24,0.6)` | Hover states, elevated cards |
| **XL** | `--shadow-xl` | `0 12px 40px rgba(6,10,24,0.7)` | Modals, prominent elements |
| **Glow (gold)** | Inline | `0 0 24px rgba(237,175,24,0.20)` | 5-star card glow |
| **Glow (purple)** | Inline | `0 0 16px rgba(168,85,247,0.12)` | 4-star card glow |
| **Inset** | Inline | `inset 0 0 20px rgba(COLOR,0.06-0.08)` | Active button inner glow |

**Shadow character**: **PROMINENT** — shadows are always present, always cool-tinted (`rgba(6,10,24,*)` base), and always multi-layered. Cards use a **triple-stack** shadow: `4px blur + 1px ring + inset highlight`. Active states add **color-emissive glows** (24-36px radius). The shadow system creates a clear **floating-panel** metaphor — components don't sit on a surface, they hover in the void. This reinforces the **command center / holographic display** personality.

### Border Style

| Component | Border Treatment | Character |
|-----------|-----------------|-----------|
| **Card** | `1px solid var(--border-default)` (8% white) | Ghost border — barely visible structural outline |
| **Card hover** | `var(--border-hover)` (15% white) | Brightens on interaction |
| **Button** | `1px solid var(--border-medium)` (10% white) | Slightly more visible than card |
| **Button active** | `rgba(COLOR, 0.7)` | Strong accent color border |
| **Input** | `1px solid var(--border-bright)` (20% white) | Most visible — interactive affordance |
| **Input focus** | `rgba(237,175,24,0.5)` + `3px ring` | Gold focus ring — strong affordance |
| **Stat** | `1px solid var(--border-hover)` (15% white) | Medium visibility |
| **Stat hover** | Color-specific at 0.7 opacity | Strong accent on hover |
| **Element borders** | `rgba(ELEMENT_COLOR, 0.4)` | Semi-transparent element color |

**Border character**: All borders use **opacity-based white** (`rgba(255,255,255,0.06-0.20)`) rather than discrete colors. This creates **ghost outlines** that define shapes without competing with content. The 5-step opacity scale (subtle→default→medium→hover→bright) is a **luminance hierarchy** — borders brighten to indicate interactivity and state changes. Active/focus states switch from white-opacity to **accent-color borders**, creating a dramatic shift from "structural outline" to "emissive edge." This is distinctly **sci-fi panel** language.

### Button Style

| State | Treatment | Character |
|-------|-----------|-----------|
| **Default** | Filled glass (`rgba(15,20,28,0.85)` + `backdrop-blur(8px)`) + ghost border | **Glassy filled** — not flat, not outlined |
| **Hover** | Lightened background (`rgba(255,255,255,0.05)` additive) + elevated shadow | Subtle lift |
| **Active (pressed)** | `scale(0.97)` + reduced shadow | Micro-press feedback |
| **Active (selected)** | Accent-colored border (0.7) + color glow shadow + inset glow + text glow | **Full emissive state** — button "lights up" |
| **Ripple effect** | `::before` radial gradient overlay | Material-like ripple on click |

**Button personality**: Buttons are **translucent glass panels** in default state — they let background show through via backdrop-blur. When activated, they transform into **emissive light sources** with colored borders, outer glow, inner glow, and text glow. This creates a **toggle switch / control panel** metaphor — off buttons are dim glass, on buttons are lit indicators. No flat buttons, no outlined-only buttons, no pill buttons exist.

### Pseudo-Element Chrome Decorations

| Decoration | Element | Visual |
|------------|---------|--------|
| **Corner brackets** | `.kuro-card-inner::before/::after` | L-shaped 12×12px borders at top-right and bottom-left, `var(--border-bright)` |
| **Header accent bar** | `.kuro-header h3::before` | 3×16px gold gradient bar with glow shadow |
| **Card shimmer line** | `.kuro-card::after` | Full-width 1px gradient line at top edge, animated opacity |
| **Stat shimmer line** | `.kuro-stat::before` | Full-width 1px color-tinted gradient at top edge |
| **Button ripple** | `.kuro-btn::before` | Radial gradient from center, triggered on active |
| **Luck badge ring** | `.luck-badge::before` | Conic gradient rotating ring (8s infinite) |
| **Version watermark** | `.desktop-layout > header::after` | `content: 'WW'` text watermark |

**Chrome character**: The pseudo-element decorations are the most **distinctive personality feature** of the component system. Corner brackets (HUD targeting reticle), gold accent bars (status indicator), shimmer lines (energy/power flow) — these are all **sci-fi interface chrome** conventions. They transform standard card/stat components into **control panel readouts**. The corner brackets in particular are a signature element that no other common design system uses — they reference **military/tactical HUD overlays**.

### Overall Component Character

**"Glass panels in a command center."** Components are translucent glass surfaces (backdrop-blur + semi-transparent backgrounds) floating in a dark void, outlined by ghost borders that brighten on interaction, decorated with HUD chrome (corner brackets, shimmer lines, gold accent bars), and capable of emitting colored light when activated. The component language is **consistently sci-fi** — every element reinforces the "futuristic control interface" metaphor.

**Solution**: Component extraction is ground truth. Findings assessed in §DP1.

---

## §DP0.5 — Depth & Surface Character

### Depth Levels

| Layer | Z-Index | Elements | Visual Treatment |
|-------|---------|----------|-----------------|
| **L0 — Void** | 0 | `#080c14` body background | Flat dark surface, no texture |
| **L1 — Panels** | 5 | `.kuro-card` glass panels | Glass + blur(4px) + triple shadow |
| **L2 — Controls** | — | Buttons, inputs, stats | Denser glass + blur(8px) |
| **L3 — Chrome** | 10 | Corner brackets, shimmer lines, headers | Pseudo-element decorations above panels |
| **L4 — Overlays** | 100 | Modals, detail views | Near-opaque dark + blur(6px) |
| **L5 — System** | 9998-10000 | Toasts, install prompt, offline indicator | Highest priority floating UI |

**Depth character**: **5-level elevation system** — void (dark nothing) → glass panels (floating, semi-transparent) → controls (embedded in panels) → chrome accents (decorative overlay) → modals (full takeover) → system alerts (highest priority). The depth is communicated through **three simultaneous cues**: z-index (stacking), opacity (glass transparency), and shadow (drop-shadow intensity). This is a **rich layered system** — not flat, not merely 2-level.

### Surface Material

| Material | Where | Visual Character |
|----------|-------|-----------------|
| **Void/matte** | Body background | Flat dark, no texture, no pattern — pure emptiness |
| **Frosted glass** | Cards (55%), buttons (85%), inputs (90%), stats (80%) | Translucent with backdrop-blur — content behind is softly visible |
| **Solid dark** | Card inner panels | Opaque dark surface — no transparency |
| **Chrome/metal** | Header accent bars, slider thumbs | Gold gradient with light emission (box-shadow glow) |
| **Holographic** | Luck badge, shimmer animations | Conic gradients, rotating light, animated opacity |

**Material character**: The dominant material is **frosted glass** — appearing at different opacity levels (55%-90%) with consistent backdrop-blur. This creates a cohesive "looking through tinted glass" experience. The glass sits over a **matte void** (no texture, no pattern, just dark). Chrome/metal accents appear only at small scale (bars, thumbs, lines) — they are **detail elements, not surface treatments**. The holographic material (luck badge conic gradient, shimmer animations) adds a premium/magical quality to key interactive moments.

### Blur Scale

| Value | Usage | Effect |
|-------|-------|--------|
| `blur(3px)` | Luck badge conic gradient | Very subtle diffusion |
| `blur(4px)` | Cards, stat boxes | Light glass — content shows through |
| `blur(6px)` | Onboarding modal | Medium glass |
| `blur(8px)` | Buttons, inputs | Dense glass — mostly opaque |
| `blur(20px)` | Desktop sidebar | Heavy frosting — near-opaque |
| `blur-md` (12px) | Header logo glow | Decorative diffusion |
| `blur-xl` (24px) | Onboarding decorative circles | Heavy decorative blur |
| `blur-2xl` (40px) | Onboarding decorative circles | Maximum decorative blur |

**Blur character**: Functional blur ranges from 4-8px (glass surfaces). Decorative blur goes up to 40px (ambient glow effects). The 4px card blur is deliberately light — it allows a hint of background content to show through without being distracting. The 8px button/input blur is denser — controls read as more solid than their parent cards, creating a **control-embedded-in-glass** depth relationship.

### Overall Depth/Surface Feeling

**"Glass instruments floating in dark space."** The depth system creates a clear spatial hierarchy: dark void → floating glass panels → embedded controls → decorative chrome → overlay modals. Every surface communicates its depth through a consistent combination of opacity, blur, and shadow. The frosted glass metaphor is the **unifying material** — it connects all interactive surfaces while the dark void behind them creates infinite depth. This is **holographic display** language — interfaces projected into darkness, with glass-like materiality and light-emissive accents.

**Solution**: Depth/surface extraction is ground truth. Findings assessed in §DP1.

---

## §DP0.6 — Motion Character

### Transition Duration Values

| Token/Value | Duration | Category | Usage |
|-------------|----------|----------|-------|
| `--transition-fast` | `0.15s` | **Snappy** (100-200ms) | Color changes, border shifts, small state changes |
| `--transition-normal` | `0.25s` | **Considered** (200-300ms) | Button interactions, input focus |
| `--transition-slow` | `0.4s` | **Deliberate** (300-500ms) | Card entrances, layout transitions |
| Hardcoded `0.3s` | `0.3s` | Considered | Card hover (should use `--transition-normal`) |
| Hardcoded `0.1s` | `0.1s` | **Instant** (<100ms) | Button active press |
| Hardcoded `0.8s` | `0.8s` | **Slow** (>500ms) | Pity ring SVG stroke animation |

**Duration profile**: Three-tier system — fast (0.15s) for micro-interactions, normal (0.25s) for standard interactions, slow (0.4s) for entrance animations. The range 0.15s-0.4s is **snappy-to-considered** — never sluggish, never instant. The 0.8s pity ring animation is the slowest transition, reserved for the most dramatic data reveal moment.

### Easing Values

| Easing | Curve | Usage | Character |
|--------|-------|-------|-----------|
| **Primary** | `cubic-bezier(0.16, 1, 0.3, 1)` | ALL transition tokens, tab indicator, card entrance | **Bouncy overshoot** — starts fast, overshoots slightly, settles |
| **Secondary** | `ease-out` | `slideUp`, `emptyFadeIn` | Standard deceleration |
| **Tertiary** | `ease-in-out` | `shimmer`, `trophyShine`, `badgeRotate`, soft pity pulses | Symmetric — ambient loops |
| **Linear** | `linear` | `badgeRotate` (8s rotation) | Constant speed — mechanical rotation |
| **Desktop sidebar** | `cubic-bezier(0.4, 0, 0.2, 1)` | Desktop header nav width | Different curve — **inconsistency** |
| **Collection card** | `ease` | Card hover | Generic — **inconsistency** |

**Easing character**: The primary curve `cubic-bezier(0.16, 1, 0.3, 1)` is the **signature motion curve** — it's a springy, physics-based easing that overshoots its target and bounces back. This creates a **lively, energetic** feel — elements don't just move, they arrive with a subtle bounce. This is more playful than a standard `ease-out` and less mechanical than `linear`. The curve is used consistently across all transition tokens, making it the **motion identity** of the app.

### Animation Inventory

| Animation | Duration | Timing | Transform | Purpose |
|-----------|----------|--------|-----------|---------|
| `slideUp` | 0.2s | ease-out | `translateY(16px)→0` + opacity | Content entrance |
| `scaleIn` | — | — | `scale(0.96)→1` + opacity | Modal/card scale entrance |
| `tabFadeIn` | 0.35s | primary curve | `translateY(8px)→0` + opacity | Tab content switch |
| `cardSlideIn` | 0.4s | primary curve | `translateY(12px) scale(0.98)→identity` | Staggered card entrance |
| `shimmer` | 3s | ease-in-out ∞ | opacity 0.6→1→0.6 | Card top-edge shimmer |
| `trophyShine` | 3s | ease-in-out ∞ | opacity 0.5→1 | Trophy highlight pulse |
| `badgeRotate` | 8s | linear ∞ | `rotate(360deg)` | Luck badge ring spin |
| `kuroPulseOrange` | 2s | ease-in-out ∞ | text-shadow glow cycle | Soft pity warning |
| `kuroPulseCyan` | 2s | ease-in-out ∞ | text-shadow glow cycle | Soft pity warning |
| `kuroPulsePink` | 2s | ease-in-out ∞ | text-shadow glow cycle | Soft pity warning |
| `kuroShimmer` | 1.8s | ease-in-out ∞ | background-position shift | Skeleton loading |
| `emptyFadeIn` | 0.4s | ease-out | `translateY(8px)→0` + opacity | Empty state entrance |
| `ghostPulse` | 2.5s | ease-in-out ∞ | opacity 0.04→0.08 | Placeholder ghost grid |
| `borderGlow` | — | — | border-color pulse | Accent highlight |
| `pulseScale` | — | — | scale(1→1.02→1) | Emphasis pulse |

**Animation character**: 15 custom `@keyframes` definitions — **no Tailwind animate classes used**. All animations are hand-crafted CSS. Two categories:
1. **Entrance animations** (slideUp, scaleIn, tabFadeIn, cardSlideIn, emptyFadeIn): Y-axis translation + opacity = **"rising from below"** metaphor — content materializes upward, like data appearing on a heads-up display.
2. **Ambient loops** (shimmer, trophyShine, badgeRotate, kuroPulse*, ghostPulse): Continuous energy — the interface is **always subtly alive** with pulsing light, rotating rings, and shimmering edges. This communicates **active monitoring / live data feed**.

### Card Entrance Stagger

```css
.kuro-card:nth-child(1) { animation-delay: 0.05s; }
.kuro-card:nth-child(2) { animation-delay: 0.1s; }
.kuro-card:nth-child(3) { animation-delay: 0.15s; }
.kuro-card:nth-child(4) { animation-delay: 0.2s; }
```

Cards stagger their entrance by 50ms intervals, creating a **cascading waterfall** effect. This is a premium touch that communicates **orchestrated data loading** rather than an instant dump.

### Reduced Motion Support

| Path | Implementation |
|------|---------------|
| **User toggle** | `.no-animations *` → `animation-duration: 0.01ms !important; transition-duration: 0.01ms !important;` |
| **OS preference** | `@media (prefers-reduced-motion: reduce)` → same |

Both paths covered — **accessible**.

### Overall Motion Feeling

**SNAPPY & ALIVE.** The motion system has two personalities working together:
1. **Interaction motion** (0.15s-0.4s, bouncy overshoot curve): Responsive, energetic, slightly playful — elements snap to position with a subtle bounce
2. **Ambient motion** (1.8s-8s, ease-in-out loops): Always-on subtle animation — the interface breathes, shimmers, and pulses

This combination reads as **"live monitoring system"** — the UI feels like it's connected to real-time data, always active, always subtly moving. The bouncy interaction curve adds a touch of **personality and delight** that prevents the interface from feeling cold or clinical.

**Solution**: Motion extraction is ground truth. Findings assessed in §DP1.

---

## §DP0.7 — Icon Character

### Library in Use

**Lucide React** — line-style icon library, imported as React components from `lucide-react`.

### Icon Inventory

**42 unique icons imported** in `App.jsx` (line 22):

| Category | Icons | Count |
|----------|-------|-------|
| **Navigation/UI** | `X`, `ChevronDown`, `Plus`, `Minus`, `Search`, `Settings`, `RefreshCcw`, `Check`, `Info` | 9 |
| **Game/Domain** | `Crown`, `Sword`, `Swords`, `Shield`, `Diamond`, `Star`, `Sparkles`, `Zap`, `Flame`, `Target`, `Gamepad2` | 11 |
| **Data/Analytics** | `BarChart3`, `TrendingUp`, `TrendingDown`, `Calculator`, `ClipboardList`, `Trophy`, `Award` | 7 |
| **Content/Media** | `Calendar`, `Archive`, `Gift`, `Heart`, `Clover`, `Fish`, `BookmarkPlus` | 7 |
| **Users/Social** | `User`, `Users` | 2 |
| **Device/System** | `Monitor`, `Smartphone`, `Download`, `Upload` | 4 |
| **Alert/Status** | `AlertCircle`, `AlertTriangle` | 2 |

### Icon Style

| Property | Value | Character |
|----------|-------|-----------|
| **Style** | Line/outline (stroke-based) | Clean, precise, technical |
| **Stroke weight** | 2px (Lucide default) | Consistent — uniform visual weight |
| **Fill** | None — all stroke-only | Transparent, lightweight |
| **Color method** | Inherits from parent text color or inline `style={{ color }}` | Semantic — icon color matches text context |

### Icon Sizing Scale

| Size | Context | Frequency |
|------|---------|-----------|
| `7-9px` | Ultra-compact inline (badges, micro-labels) | Rare |
| `10-12px` | Inline text accompaniment | Common |
| `14-16px` | Standard UI actions (buttons, headers) | **Dominant** |
| `18px` | Tab navigation icons | Primary nav |
| `32px` | Onboarding hero icons | Rare — feature moments |

### Icon Usage by Tab

| Tab | Primary Icons | Character Signal |
|-----|--------------|-----------------|
| **Tracker** | `Sparkles`, `Crown`, `Swords`, `Star` | Fantasy/game — rarity, combat |
| **Events** | `Calendar`, `Gift`, `Check` | Time-based, rewards |
| **Calc** | `Calculator`, `Plus`, `Minus` | Mathematical, precise |
| **Planner** | `TrendingUp`, `Calendar`, `Zap` | Growth, energy, planning |
| **Stats** | `BarChart3`, `Trophy`, `Clover`, `TrendingUp/Down` | Analytics, luck, achievement |
| **Collection** | `Archive`, `Search`, `Crown`, `Sword` | Catalog, search, game items |
| **Teams** | `Users`, `Target`, `Swords`, `Shield` | Group, combat, defense |
| **Profile** | `User`, `Settings`, `Monitor`, `Upload/Download` | Personal, config, data management |

### Overall Icon Feeling

**CLINICAL-PRECISE with DOMAIN FLAVOR.** Lucide's line-style icons provide a clean, technical foundation — consistent 2px stroke weight, no fills, transparent centers. The icon selection itself is **domain-aware** — game-specific icons (Crown, Sword, Swords, Shield, Diamond, Star, Sparkles) inject Wuthering Waves fantasy flavor into an otherwise clinical icon set. The most-used icon is `X` (close) at 19 uses — functional UI priority. No custom icons exist; no icon inconsistency (all from same library, same stroke weight).

**Solution**: Icon extraction is ground truth. Findings assessed in §DP1.

---

## §DP0.8 — Copy / Voice Character

### Formality Register

| Context | Register | Examples |
|---------|----------|---------|
| **Game actions** | NEUTRAL | "Convene History", "Banner Selection", "Resonator Convenes" |
| **Settings/config** | NEUTRAL-FORMAL | "Display Settings", "Astrite allocation", "Import/Export" |
| **Error messages** | TECHNICAL | "Invalid backup format — missing required 'state' object", "File too large (3.2MB). Maximum is 5MB." |
| **Achievement descriptions** | CASUAL-HUMOROUS | "go outside.", "nobody believes you", "guilty of whaling in the first degree" |
| **Legal/privacy** | FORMAL | "Your generated user ID, average pity, Convene count... are sent to a shared database and displayed publicly" |
| **Success feedback** | POSITIVE-CASUAL | "ID Card saved!", "Imported 42 Convenes!", "Banner data refreshed!" |
| **Instructions** | IMPERATIVE | "Import", "Clear", "Reset", "Tap another image to edit it" |

### Personality Presence

| Signal | Evidence | Level |
|--------|----------|-------|
| **Direct address** | "Good luck on your Convenes, Rover!" | VISIBLE — uses game protagonist name |
| **Humor** | Trophy descriptions: "it only gets worse", "go outside.", "your team cannot die. ever." | VISIBLE — dry, self-aware humor |
| **Personality shifts** | Professional onboarding → humorous achievements → technical errors | CONTEXT-AWARE — voice adapts to situation |
| **Empty state tone** | "No Convene data on record" / "Import your Convene history to unlock achievements" | NEUTRAL-HELPFUL — guides without personality |

### Domain Fluency

| Term | WuWa-Authentic? | Generic Alternative (NOT used) |
|------|-----------------|-------------------------------|
| **Convene** | ✅ Yes | "Pull", "Summon", "Gacha" |
| **Resonator** | ✅ Yes | "Character", "Unit", "Hero" |
| **Astrite** | ✅ Yes | "Premium currency", "Gems" |
| **Radiant Tide** | ✅ Yes | "Character currency", "Tickets" |
| **Forging Tide** | ✅ Yes | "Weapon currency" |
| **Lustrous Tide** | ✅ Yes | "Standard currency" |
| **Pity** | ✅ Community term | "Counter", "Progress" |
| **50/50** | ✅ Community term | "Win rate", "Chance" |
| **Resonance Chain** | ✅ Yes | "Constellation", "Duplicate bonus" |
| **Echo** | ✅ Yes | "Artifact", "Equipment" |
| **5★ / 4★** | ✅ Standard notation | "5-star", "Legendary" |

**Domain fluency**: **EXPERT-LEVEL** — the app uses authentic Wuthering Waves terminology throughout, never substituting generic gacha terms. A player familiar with Wuthering Waves instantly recognizes every label. This is the vocabulary of **an insider tool built by a player, for players**.

### Tab Labels

```
Tracker  |  Events  |  Calc  |  Plan  |  Stats  |  Collection  |  Teams  |  Profile
```

**Label style**: Mix of abbreviated nouns ("Calc", "Stats") and full words ("Collection", "Profile"). Action verbs ("Plan") mixed with descriptive nouns ("Tracker"). All single-word. Maximum 10 characters. This is **scannable and compact** — optimized for mobile tab bar width.

### Button Label Patterns

| Pattern | Examples | Tone |
|---------|----------|------|
| **Action verbs** | "Save", "Load", "Delete", "Clear", "Refresh", "Import", "Export" | Direct, imperative |
| **Action + object** | "Import Data", "Export Backup", "Add Purchases", "Download ID Card", "Clear All" | Specific, unambiguous |
| **State toggle** | "50/50 active: off", "Guaranteed next 5-star: on" | Technical state readout |
| **Instructional** | "Tap another image to edit it", "Go to Collection tab..." | Conversational help |

### Toast/Notification Voice

| Type | Pattern | Example |
|------|---------|---------|
| **Success** | Past tense + exclamation | "Imported 42 Convenes!", "Banner data refreshed!" |
| **Error** | Problem + solution | "Storage full — data may not be saved. Try clearing old Convene history." |
| **Warning** | Condition + consequence | "Storage at 4.2MB of ~5MB. Consider exporting a backup." |
| **Info** | Neutral statement | "Data synced from another tab" |

### Overall Voice Feeling

**EXPERT-COMPANION with HIDDEN HUMOR.** The dominant voice is **knowledgeable and efficient** — it uses expert terminology, gives clear instructions, and reports states precisely. But tucked into achievement descriptions and occasional UI moments is a layer of **dry, self-aware humor** ("go outside.", "nobody believes you", "guilty of whaling in the first degree") that reveals a playful personality behind the technical surface. The voice addresses the user as "Rover" (game protagonist) in the onboarding close, establishing a **personal companion relationship**. This is not a generic tool — it's a tool built by someone who plays the game and speaks the language.

**Solution**: Copy/voice extraction is ground truth. Findings assessed in §DP1.

---

## §DP0.9 — Emergent Personality Statement

### Character Name

Based on all extracted design decisions across color, space, typography, components, depth, motion, icons, and voice:

> **"Based on these decisions, this app reads as: LUMINOUS TACTICAL COMPANION"**

### Strongest Signals That Produce This Character

1. **Neon-on-void color palette** — High-saturation accents (gold, pink, cyan, purple, emerald) against near-black blue-tinted backgrounds create the signature cyberpunk/holographic feeling. The gold-as-warm-anchor against a cold palette is the single most distinctive visual decision.

2. **Glass-over-darkness material system** — Frosted glass surfaces at varying opacity (55%-90%) with backdrop-blur, floating over a dark void with multi-layer shadows, create the "holographic display" spatial metaphor. Every interactive surface is translucent, reinforcing the sci-fi control panel identity.

3. **HUD chrome decorations** — Corner brackets (L-shaped targeting reticles), gold accent bars (status indicators), top-edge shimmer lines (energy flow), colored text-shadow glows (emissive data) — these pseudo-element decorations are the most unique personality feature. No other gacha tracker or dashboard app uses tactical HUD chrome as its decorative language.

### Weakest / Most Incoherent Elements

1. **Hardcoded values in application layer** — ~240+ hardcoded color instances bypass the design token system, creating subtle inconsistencies (e.g., Tailwind `text-yellow-400` `#facc15` vs CSS variable gold `#edaf18`). The design system defines a coherent character, but the application code doesn't fully respect it. This doesn't destroy the character, but it **fuzzes the precision** — a tactical display should feel calibrated, not approximate.

2. **Voice register whiplash** — The copy voice shifts from formal (privacy disclosure) to technical (error messages) to humorous (trophy descriptions) to companion (Rover address). While each register fits its context, the transitions can feel abrupt. The humor in achievement descriptions is the most potentially jarring — trophy text like "go outside." and "nobody believes you" is tonally distant from the rest of the professional interface. This isn't necessarily wrong (it's intentional personality injection), but it's the **most likely place for a new user to feel tonal dissonance**.

---

### §DP0 Complete Extraction Summary

| Character Axis | Extracted Identity | Strength |
|---------------|-------------------|----------|
| **Color** | Neon-on-void — cool navy backgrounds, high-saturation neon accents, gold as warm anchor | **STRONG** — consistent, distinctive |
| **Spatial** | Comfortable-to-dense — 8px grid, 14px card padding, dual density (generous structure, dense data) | **MODERATE** — consistent but untokenized |
| **Typography** | Technical-precision — Rajdhani display + JetBrains Mono data, bottom-heavy size scale (9-10px dominant), wide-tracked uppercase labels, colored text-shadow glows | **STRONG** — distinctive font pairing + HUD conventions |
| **Component** | Glass panels in command center — frosted glass surfaces, ghost borders, HUD chrome (corner brackets, shimmer, gold bars), emissive active states | **STRONG** — most distinctive axis |
| **Depth/Surface** | Glass-over-void — 5-level elevation, frosted glass at varying opacity, holographic accents | **STRONG** — consistent material language |
| **Motion** | Snappy & alive — bouncy overshoot curve, 0.15s-0.4s range, vertical entrance metaphor, always-on ambient animation | **STRONG** — distinctive signature curve |
| **Icon** | Clinical-precise with domain flavor — Lucide line-style, consistent 2px stroke, game-specific icon selection | **MODERATE** — functional but not distinctive |
| **Copy/Voice** | Expert-companion with hidden humor — WuWa-authentic terminology, dry achievement humor, Rover address | **STRONG** — domain expertise + personality |

**Overall character strength**: **7/10** — The design system (KuroStyles) defines a strong, distinctive character. The weakness is at the application layer, where hardcoded values and Tailwind overrides dilute the precision of the design system's character.

---

**STEP 3 COMPLETE** — §DP0 Character Extraction established.

**Character**: LUMINOUS TACTICAL COMPANION
**Dominant signals**: Neon-on-void palette, glass-over-darkness materials, HUD chrome decorations
**Strongest axes**: Color, Component, Depth/Surface, Motion, Copy/Voice
**Weakest axis**: Spatial (untokenized spacing), Icons (functional but not distinctive)
**Character coherence**: Strong at system level, diluted at application layer by hardcoded values
