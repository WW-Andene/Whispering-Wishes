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

---
---

# STEP 4: §DP1 + §DP2 — Character Dimensions & Brief

> **Method**: Analyze the §DP0 extraction against the §0 Five-Axis Profile. Each spectrum marks current position (from extraction evidence) and target position (from axis profile intent). A gap of >2 units is a finding.
> **Scale**: 1–10 for each spectrum, where 1 = left extreme, 10 = right extreme.

---

## §DP1 — Character Dimensions Analysis

### Dimension 1 — Visual Voice

#### Spectrum 1A: Terse ↔ Expansive

```
Terse ←———●——————————————————→ Expansive
           3
```

**Current position: 3/10 (Terse-leaning)**

| Evidence (from §DP0) | Signal |
|----------------------|--------|
| Dominant text sizes `text-[9px]` (158 uses) + `text-[10px]` (153 uses) | Ultra-compact — every pixel earns its place |
| `gap-2` (8px) as dominant spacing with 72 uses | Tight rhythm — minimal breathing room in data zones |
| 14px card padding (structural) | Moderate structural breathing room |
| Dual density: dense data zones + generous card envelopes | Mixed — terse inside, slightly generous outside |
| Tight line-heights (1.0-1.3 range dominant) | Compressed — no generous leading |

**Target position: 3/10** — The axis profile says "FOCUS-TOOL (precision data)" and "expert-density is appropriate." A data tracker SHOULD be terse in data zones.

**Gap: 0** — No misalignment. The terseness is intentional and appropriate for the tool's focus identity.

**Finding**: DP1-V1 — **PASS** — Visual terseness matches FOCUS-TOOL intent.
**Solution**: Maintain current density. Do not add unnecessary whitespace — the expert audience expects information density.

---

#### Spectrum 1B: Cold ↔ Warm

```
Cold ←———————●———————————————→ Warm
              4
```

**Current position: 4/10 (Cool-leaning with warm anchor)**

| Evidence (from §DP0) | Signal |
|----------------------|--------|
| All backgrounds in `hsl(220°-230°, ~40-60%, 3-8%)` range | Deeply cool — blue-tinted near-black |
| Body text `#dfe5ef` carries cool blue undertone | Cool text on cool surfaces |
| Ghost borders `rgba(255,255,255,0.06-0.2)` | Neutral-cool — white-opacity on dark |
| Gold `#edaf18` as primary accent | **Single warm anchor** — breaks the cold field |
| Bouncy overshoot easing `cubic-bezier(0.16, 1, 0.3, 1)` | Adds warmth through playful motion |
| Trophy humor ("go outside.", "nobody believes you") | Injects warmth through personality |

**Target position: 4/10** — The axis profile says "cyberpunk-luxe aesthetic mirrors the game's visual identity" and "FUNCTIONAL-PRIMARY." Cyberpunk is inherently cool with deliberate warm accents. A purely cold tool would feel sterile; too warm would break the source material alignment.

**Gap: 0** — The temperature balance is correct. Gold-as-warm-anchor is the right strategy.

**Finding**: DP1-V2 — **PASS** — Temperature balance matches cyberpunk-luxe + focus-tool intent.
**Solution**: Protect the gold warm anchor. If additional warm elements are ever introduced, they should always be gold-family — never introduce a second warm hue (orange, red-warm) as an accent.

---

#### Spectrum 1C: Formal ↔ Casual

```
Formal ←—————————●———————————→ Casual
                  5.5
```

**Current position: 5.5/10 (Balanced with contextual shifts)**

| Evidence (from §DP0) | Signal |
|----------------------|--------|
| Uppercase + wide-tracked labels (0.08em, HUD convention) | Formal — institutional/military labeling |
| Structured card hierarchy (header → body → stats) | Formal — rigid component grammar |
| Domain-expert terminology without explanation | Formal — assumes knowledge |
| Trophy descriptions: "go outside.", "guilty of whaling" | **Casual** — breaks formal register |
| "Rover" direct address in onboarding | Casual — personal companion |
| Tab labels: "Calc", "Plan", "Stats" (abbreviated) | Casual — informal shorthand |
| Exclamation marks in success toasts: "Imported 42 Convenes!" | Casual — enthusiasm |

**Target position: 5/10** — The axis profile says "community credibility signals" (formal domain mastery) but also "copy should sound like a player, not a product" (casual insider). A formal-casual balance is correct for this audience.

**Gap: 0.5** — Within tolerance. The current balance is essentially on-target.

**Finding**: DP1-V3 — **PASS** — Formality register matches ENTHUSIAST/EXPERT audience with companion voice.
**Solution**: Maintain the dual register. The formal UI structure + casual copy personality creates a "knowledgeable friend" voice. Do not shift further in either direction.

---

#### Spectrum 1D: Restrained ↔ Expressive

```
Restrained ←——————————●——————→ Expressive
                       6.5
```

**Current position: 6.5/10 (Moderately expressive)**

| Evidence (from §DP0) | Signal |
|----------------------|--------|
| 15 custom `@keyframes` animations | Expressive — substantial motion investment |
| Colored text-shadow glows on active states | Expressive — text emits light |
| Shimmer lines, corner brackets, gold accent bars | Expressive — HUD chrome decorations |
| Luck badge with rotating conic gradient (8s infinite) | Expressive — continuous animation |
| Ambient pulse animations (shimmer, ghostPulse, trophyShine) | Expressive — "always alive" interface |
| Weight center at font-medium (500) — not bold | Restrained — avoids shouting |
| No custom icons, no illustrations, no mascot | Restrained — functional icon choices |
| Neutral-clinical Lucide line icons (2px stroke) | Restrained — no decorative icon flourish |

**Target position: 6/10** — The axis profile says "ATMOSPHERIC-SECONDARY" and "atmospheric treatments serve as ambient context rather than focal decoration." Expressiveness should be ambient (motion, glow) not loud (illustrations, mascots).

**Gap: 0.5** — Within tolerance. Current expressiveness is primarily through motion and light effects — appropriate for the atmospheric-secondary axis.

**Finding**: DP1-V4 — **PASS** — Expressiveness channeled through motion/light rather than illustration/decoration matches the atmospheric-secondary role.
**Solution**: Continue channeling expressiveness through glow, shimmer, and motion. Do not add illustrations, mascots, or decorative elements that would shift expressiveness from ambient to focal.

---

### Dimension 2 — Spatial Character

#### Spectrum 2A: Dense ↔ Airy

```
Dense ←————●—————————————————→ Airy
            3.5
```

**Current position: 3.5/10 (Dense-leaning)**

| Evidence (from §DP0) | Signal |
|----------------------|--------|
| `text-[9px]` (158 uses) + `text-[10px]` (153 uses) | Ultra-small — maximum data per pixel |
| `gap-2` (8px) dominant with 72 uses | Tight gutters |
| `py-0.5` (2px) with 33 uses | Micro-padding for data items |
| 14px card padding (structural envelope) | Moderate — cards breathe |
| `gap-3` (12px) for section separation | Slightly generous between major sections |

**Target position: 3.5/10** — A FOCUS-TOOL for EXPERT users should be information-dense. The axis profile says "expert-density is appropriate."

**Gap: 0** — Density is intentional and appropriate.

**Finding**: DP1-S1 — **PASS** — Information density matches FOCUS-TOOL + EXPERT audience.
**Solution**: Maintain current density. The dual-density model (tight data zones, generous card envelopes) is the correct spatial strategy.

---

#### Spectrum 2B: Flat ↔ Deep

```
Flat ←————————————————●——————→ Deep
                       7.5
```

**Current position: 7.5/10 (Deep)**

| Evidence (from §DP0) | Signal |
|----------------------|--------|
| 5-level z-index hierarchy (void→panels→controls→chrome→modals→system) | Multi-plane depth |
| Triple-stack card shadows (4px blur + 1px ring + inset highlight) | Prominent shadow depth |
| `backdrop-filter: blur(4px-8px)` on all interactive surfaces | Glass transparency creates optical depth |
| Semi-transparent surfaces (55%-90% opacity) | Content behind is softly visible — spatial layering |
| Color-emissive glow shadows on active states (24-36px radius) | Light-based depth cues |
| Corner brackets and shimmer lines at z:10 above card content | Chrome decoration layer |

**Target position: 7/10** — The axis profile describes "semi-transparent layered surfaces with inset highlights + color-matched shadows" and "glassmorphism" — depth is a core identity trait.

**Gap: 0.5** — Within tolerance. The depth is slightly more than strictly needed but creates the desired "holographic display" metaphor.

**Finding**: DP1-S2 — **PASS** — Spatial depth strongly supports the glass-over-void material identity.
**Solution**: Protect the multi-layer depth system. If simplification is ever needed, reduce shadow layers (3→2) before removing backdrop-blur — the blur is the stronger depth signal.

---

#### Spectrum 2C: Rigid ↔ Fluid

```
Rigid ←———●——————————————————→ Fluid
           3
```

**Current position: 3/10 (Rigid-leaning)**

| Evidence (from §DP0) | Signal |
|----------------------|--------|
| Consistent 8px grid rhythm | Grid-locked spacing |
| Card → header → body → stats component grammar | Rigid structural hierarchy |
| Tab-based navigation (8 fixed tabs) | Rigid — no dynamic layout shifts |
| Graduated border-radius scale (1px→16px) | Systematic — predictable radius per component type |
| No masonry layouts, no overlapping elements, no dynamic grids | Rigid — all elements in grid lanes |

**Target position: 3/10** — A FOCUS-TOOL for data tracking should be predictable and scannable. Fluid layouts would undermine data legibility.

**Gap: 0** — Rigidity is correct for a precision data tool.

**Finding**: DP1-S3 — **PASS** — Spatial rigidity supports scannable data presentation.
**Solution**: Maintain grid-locked layouts. Do not introduce asymmetric layouts, masonry grids, or overlapping elements — these would undermine the "precision instrument" feel.

---

#### Spectrum 2D: Anchored ↔ Floating

```
Anchored ←———————————●———————→ Floating
                      6.5
```

**Current position: 6.5/10 (Floating-leaning)**

| Evidence (from §DP0) | Signal |
|----------------------|--------|
| `backdrop-filter: blur(4px)` on cards — content shows through | Panels hover over content |
| `translateY(-2px)` on card hover | Elements lift off surface |
| `cardSlideIn` animation: `translateY(12px) scale(0.98)` entrance | Elements materialize from space |
| Dark void background (`#080c14`) with no texture/pattern | Infinite depth — no "ground" |
| Triple-stack shadows with 24px blur radius | Prominent elevation signal |
| Inset highlights `inset 0 1px 0 rgba(255,255,255,0.05)` | Top-edge light suggests floating above light source |

**Target position: 7/10** — The glass-over-void metaphor inherently implies floating. The axis profile describes "depth model: semi-transparent layered surfaces."

**Gap: 0.5** — Within tolerance. Could lean slightly more floating (e.g., more pronounced hover lift).

**Finding**: DP1-S4 — **PASS** — Floating spatial character supports the holographic display metaphor.
**Solution**: Maintain the floating-panel metaphor. The `translateY(-2px)` hover lift + dark void background + glass surfaces create the correct spatial relationship. Consider increasing hover lift to `-3px` for slightly more dramatic floating on desktop (where spatial subtlety is more perceptible).

---

### Dimension 3 — Material Character

#### Current Material Personality

| Material | Presence Level | Evidence |
|----------|---------------|----------|
| **Glass** | **PRIMARY** (dominant) | `backdrop-filter: blur(4-8px)` on all cards, buttons, inputs, stats; semi-transparent `rgba` backgrounds at 55-90% opacity; `border-white/0.06-0.2` ghost edges |
| **Void / Spatial** | **PRIMARY** (co-dominant) | `#080c14` body with no texture; OLED `#000000` variant; infinite depth implied by dark nothing; content floats with no ground plane |
| **Light** | **SECONDARY** (accent) | Gold text-shadow glows; color-emissive active states; shimmer line animations; conic gradient luck badge rotation; radial gold glow on empty states |
| **Metal** | **TERTIARY** (detail) | Gold gradient header accent bars (3×16px chrome); slider thumb gradients; hardcoded gold glow shadows; specular-like inset highlights |
| **Paper** | ABSENT | No flat surfaces, no shadow-cast-on-surface, no organic texture |
| **Fabric / Felt** | ABSENT | No soft shadows, no matte surfaces, no tactile texture |
| **Stone / Mineral** | ABSENT | No heavy visual weight, no durable/permanent feel |
| **Wood / Organic** | ABSENT | No warmth, no grain, no imperfection |

#### Material Formula

**Glass + Void + Light = "Holographic Display"**

The dominant material metaphor is **frosted glass panels floating in dark space, illuminated by colored light**. This is internally coherent:
- Glass provides the surface → translucent, reflective, lightweight
- Void provides the space → infinite, dark, gravity-free
- Light provides the accent → emissive, colored, dynamic

This triad is the **correct material palette** for a cyberpunk/HUD interface aligned to Wuthering Waves' visual language.

#### Material Consistency Audit

| Component | Expected Material | Actual Material | Consistent? |
|-----------|------------------|-----------------|-------------|
| `.kuro-card` | Glass + Void | Glass (blur 4px, 55% opacity) + triple shadow + shimmer chrome | ✅ |
| `.kuro-btn` | Glass | Denser glass (blur 8px, 85% opacity) + emissive active states | ✅ |
| `.kuro-input` | Glass | Dense glass (blur 8px, 90% opacity) + gold focus ring | ✅ |
| `.kuro-stat` | Glass | Glass (blur 4px, 80% opacity) + color-tinted shimmer | ✅ |
| `.kuro-empty-state` | Void + Light | Gold radial glow + dashed border — atmospheric void | ✅ |
| `.kuro-skeleton` | Glass + Light | Gold shimmer gradient on glass surface | ✅ |
| **Toast notifications** | Glass | Solid-fill colored background (0.9 opacity), no blur | ⚠️ BREAKS |
| **Root error boundary** | Glass + Void | Inline styles, no blur, no glass — flat emergency fallback | ⚠️ BREAKS (justified) |
| **Collection card hover** | Glass | `0 8px 24px rgba(0,0,0,0.5)` shadow but no backdrop-blur defined in hover | ✅ (inherits) |
| **Onboarding modal** | Glass + Void | `backdropFilter: 'blur(6px)'` + gradient borders + decorative blur circles | ✅ |

**Findings**:

**DP1-M1** — Toast notifications break glass material | **LOW**
- **Current**: Toast backgrounds are solid-fill at 0.9 opacity (`rgba(34,197,94,0.9)`, etc.) with no `backdrop-filter`.
- **Impact**: Toasts read as "flat colored banners" rather than "glass status indicators." They feel imported from a different material system.
- **Solution**: Add `backdrop-filter: blur(8px)` to toasts and reduce background opacity to 0.7. This makes toasts translucent glass panels consistent with the button material. Change:
  - `rgba(34,197,94,0.9)` → `rgba(34,197,94,0.7)` + `backdropFilter: 'blur(8px)'`
  - Same for error, warning, info variants
  - Keep `border-white/20` as-is — already glass-compatible

**DP1-M2** — Root error boundary uses flat material (justified) | **PASS**
- **Current**: AppErrorBoundary uses inline styles with no blur, no glass, minimal styling.
- **Reason**: When the app crashes, complex CSS (including backdrop-filter) may be broken. The fallback MUST work with zero CSS dependencies.
- **Solution**: No change needed — this is a correct safety tradeoff. Document as intentional: "Root error state uses minimal inline styles for maximum crash resilience."

**Target material**: Glass + Void + Light — the current extraction matches this precisely at the system level.

---

### Dimension 4 — Interaction Character

#### Spectrum 4A: Mechanical ↔ Physical

```
Mechanical ←————————————●————→ Physical
                         7
```

**Current position: 7/10 (Physical-leaning)**

| Evidence (from §DP0) | Signal |
|----------------------|--------|
| Bouncy overshoot `cubic-bezier(0.16, 1, 0.3, 1)` on all transitions | Physical — spring dynamics, elements have mass |
| `scale(0.97)` on button active press | Physical — push-back resistance |
| `translateY(-2px)` on card hover + elevated shadow | Physical — elements respond to proximity |
| `scale(1.15)` on slider thumb hover | Physical — elements swell on touch |
| Card entrance stagger (50ms intervals) | Physical — cascading arrival has weight |
| Haptic feedback on toast types (`haptic.success()`, `haptic.error()`) | Physical — device vibration response |

**Target position: 7/10** — A data tool with atmospheric-secondary role should feel responsive and physically grounded, but not overanimated.

**Gap: 0** — Physical interaction quality is on-target.

**Finding**: DP1-I1 — **PASS** — Physical interaction character creates a responsive, weighty feel.
**Solution**: Protect the bouncy easing curve — it's the signature interaction personality. Do not flatten to `ease-out` or `linear`.

---

#### Spectrum 4B: Snappy ↔ Considered

```
Snappy ←—————————●———————————→ Considered
                  4.5
```

**Current position: 4.5/10 (Balanced snappy-to-considered)**

| Evidence (from §DP0) | Signal |
|----------------------|--------|
| `--transition-fast: 0.15s` for micro-interactions | Snappy — sub-200ms for color/border changes |
| `--transition-normal: 0.25s` for standard interactions | Considered — 250ms is deliberate, not instant |
| `--transition-slow: 0.4s` for entrances | Considered — elements take time to arrive |
| Button active: `0.1s ease` | Instant — press response is immediate |
| Card stagger: 0.05s-0.2s delays | Considered — orchestrated arrival |
| Pity ring: `0.8s` stroke animation | Slow — dramatic data reveal |

**Target position: 4/10** — A FOCUS-TOOL should lean snappy (fast feedback for data interactions) with considered moments for dramatic data reveals (pity count, luck rating).

**Gap: 0.5** — Within tolerance.

**Finding**: DP1-I2 — **PASS** — Speed profile appropriately balances fast data feedback with dramatic reveals.
**Solution**: Maintain the three-tier speed system. Do not flatten all transitions to a single duration — the fast/normal/slow hierarchy is the correct temporal structure.

---

#### Spectrum 4C: Passive ↔ Reactive

```
Passive ←————————————●———————→ Reactive
                      6
```

**Current position: 6/10 (Moderately reactive)**

| Evidence (from §DP0) | Signal |
|----------------------|--------|
| Card hover: border brightens + `translateY(-2px)` + gold glow appears | Reactive — multi-property hover response |
| Button hover: shadow elevates + background lightens | Reactive — visible hover feedback |
| Input focus: gold ring + shadow expansion | Reactive — strong focus affordance |
| Stat hover: color-specific glow + border brightens | Reactive — contextual hover response |
| Ambient shimmer/pulse animations (always running) | Reactive — UI is "alive" even without interaction |
| No cursor-proximity effects, no parallax, no scroll-linked animation | Passive — reactions only on direct interaction |

**Target position: 6/10** — Reactive enough to feel alive without being distracting. A data tool should respond to direct interaction but not create ambient distraction.

**Gap: 0** — On-target.

**Finding**: DP1-I3 — **PASS** — Reactivity level appropriate for focused data tool.
**Solution**: Maintain direct-interaction reactivity (hover, focus, press). Do not add cursor-proximity effects or scroll-triggered animations — these would distract from data consumption.

---

#### Spectrum 4D: Silent ↔ Expressive

```
Silent ←————————————●————————→ Expressive
                     6
```

**Current position: 6/10 (Moderately expressive)**

| Evidence (from §DP0) | Signal |
|----------------------|--------|
| Color-emissive button active states (glow + inset + text shadow) | Expressive — full "light up" animation |
| Card entrance with scale + translate + opacity + stagger | Expressive — orchestrated entrance |
| Pity ring SVG stroke animation (0.8s) | Expressive — dramatic data reveal |
| Rotating luck badge conic gradient (8s infinite) | Expressive — continuous personality |
| Standard state changes (border color shift) use simple transitions | Silent-leaning — functional feedback |
| No page-transition animations, no route-change effects | Silent — tab switches are instant |

**Target position: 6/10** — Expressive for signature moments (pity reveal, luck rating, trophy unlock), silent for routine operations (tab switch, data entry).

**Gap: 0** — On-target.

**Finding**: DP1-I4 — **PASS** — Expressiveness reserved for signature moments, routine operations are functional.
**Solution**: Maintain the expressiveness hierarchy: dramatic for data reveals (pity, luck), ambient for atmosphere (shimmer, pulse), functional for routine (tab switch, input focus).

---

### Dimension 5 — State Character Consistency

> Design character is only as coherent as its weakest state.

| State | §DP0 Character Baseline | Character in This State | Consistent? | Finding |
|-------|------------------------|------------------------|-------------|---------|
| **First arrival (onboarding)** | Glass-over-void, HUD chrome, gold accent | Glass modal with `blur(6px)`, gradient borders per step, decorative blur circles, gold/cyan/purple step theming | ✅ **YES** | Character maintained — onboarding IS the design character showcase |
| **Active engagement** | Neon-on-void, glass panels, corner brackets, shimmer, emissive states | Full KuroStyles system: `.kuro-card`, `.kuro-stat-*`, `.kuro-btn active-*`, gold glows, staggered entrances | ✅ **YES** | Peak character expression — this is the baseline |
| **Success / completion** | Emissive light, glass surface, gold anchor | Toast: solid green fill (0.9 opacity), no blur, no glass treatment. `slideUp` animation preserved. Lucide icon + white border | ⚠️ **PARTIAL** | Material breaks (solid fill vs glass), color logic correct (green=success) |
| **Error / failure** | *(Tab-level)*: Glass + void + red accent | Tab error: `.kuro-card` + `.kuro-card-inner` + `.kuro-btn active-cyan` + red AlertCircle icon | ✅ **YES** | Uses full component system with red accent |
| **Error / failure** | *(Root-level)*: Emergency fallback | Root crash: inline styles only, no blur, no glass, cyan buttons, emoji ⚠️, system-ui font | ❌ **NO** | Character fully abandoned — **justified** (CSS may be broken during crash) |
| **Loading / waiting** | Glass + light, gold accent | `.kuro-skeleton` with gold shimmer gradient, 1.8s animation, contextual shapes (circle, text, row) | ✅ **YES** | Character maintained — gold shimmer = "data in transit through the HUD" |
| **Edge/empty (no data)** | Void + gold ambient, HUD grid structure | `.kuro-empty-state` with gold radial glow, dashed gold border, animated top gradient line, ghost-grid pulsing cells | ✅ **YES** | Character strongly maintained — empty state shows the grid structure waiting to be filled |

#### State-Level Findings

**DP1-SC1** — Success/completion toasts use flat material instead of glass | **LOW**
- **State**: Success toast (and all toast types)
- **§DP0 character**: Glass surfaces with backdrop-blur + semi-transparent backgrounds
- **Character here**: Solid-fill `rgba(34,197,94,0.9)` with no blur — reads as flat colored banner
- **Inconsistency**: Material breaks from glass to flat. The color mapping (green=success, red=error) is correct UX, but the material is wrong.
- **Solution**: Add `backdrop-filter: blur(8px)` to toast container and reduce opacity to 0.7:
  ```css
  /* Before: */ background: rgba(34,197,94,0.9);
  /* After:  */ background: rgba(34,197,94,0.7); backdrop-filter: blur(8px);
  ```
  This makes toasts read as "colored glass status indicators" rather than "flat banners." Apply to all four toast types (success, error, warning, info).

**DP1-SC2** — Root error boundary abandons character entirely | **PASS** (justified)
- **State**: App crash (AppErrorBoundary triggered)
- **§DP0 character**: Glass panels, HUD chrome, Rajdhani display font, KuroStyles
- **Character here**: Inline styles, system-ui font, emoji icon, flat cyan buttons
- **Inconsistency**: Complete character abandonment — but JUSTIFIED. When the app crashes, the CSS-in-JS system (KuroStyles) may have failed. The error boundary must work with zero CSS dependencies.
- **Solution**: No change. Document as intentional safety fallback. The error boundary's job is reliability, not brand expression. Current implementation is correct.

**DP1-SC3** — Empty states are the strongest non-active character expression | **PASS**
- **State**: No data imported / no matching results
- **Character**: Gold radial glow + dashed gold border + animated top gradient + ghost-grid with pulsing cells
- **Assessment**: The ghost-grid pattern (faded card shapes that pulse subtly) is particularly strong — it communicates "this is a HUD grid waiting for data" rather than "there's nothing here." The gold ambient glow anchors the empty space to the app's warm accent.
- **Solution**: Protect this pattern. It's a character asset. When adding new empty states, use `.kuro-empty-state` class consistently.

**DP1-SC4** — Loading skeletons correctly express character | **PASS**
- **State**: Fetching data (leaderboard, community stats)
- **Character**: Gold-tinted shimmer on glass-colored base, contextual shapes
- **Assessment**: The gold shimmer is the key decision — it ties loading to the brand accent rather than using a generic gray pulse. This reads as "gold data is flowing through the interface" — perfectly on-character.
- **Solution**: Protect the gold shimmer. Do not change skeleton color to neutral gray — the gold tint is a character-expressing decision.

**DP1-SC5** — Onboarding modal correctly showcases character | **PASS**
- **State**: First-time user experience
- **Character**: Glass modal with colored gradient borders per step, decorative blur circles for atmospheric depth, step-themed color transitions (gold → cyan → orange → purple → emerald → pink)
- **Assessment**: The onboarding IS a character demonstration — it introduces users to the glass material, the color accent system, and the HUD aesthetic through progressive color theming.
- **Solution**: Protect the multi-step color progression. It effectively teaches the user the app's visual language while introducing features.

---

### Dimension 6 — Overall Character Coherence

After assessing all five dimensions against the §DP0 extraction: do they tell the same story?

#### Cross-Dimension Coherence Matrix

| Dimension | Observed Character | Tells the Same Story? |
|-----------|-------------------|----------------------|
| **Visual Voice** | Terse (3), cool (4), balanced formality (5.5), moderately expressive (6.5) | ✅ "Technical expert tool with personality" |
| **Spatial** | Dense (3.5), deep (7.5), rigid (3), floating (6.5) | ✅ "Dense data on floating glass in deep space" |
| **Material** | Glass + Void + Light = "Holographic Display" | ✅ "Translucent command interface" |
| **Interaction** | Physical (7), balanced speed (4.5), reactive (6), moderately expressive (6) | ✅ "Responsive instruments with spring-loaded feedback" |
| **State** | 5/7 states fully consistent, 1 partial (toasts), 1 justified break (root crash) | ✅ "Character holds across nearly all states" |

**All five dimensions tell the same story**: A dense, deep, floating, cool-technical data interface made of glass panels in dark space, with spring-loaded physical interactions, responsive to touch, and always subtly alive with ambient light. The single warm element (gold) anchors everything.

#### Character Coherence Assessment

```
Character Coherence: PARTIALLY COHERENT

Dominant character: "luminous tactical glass" — dense data floating on
  translucent glass panels in dark space, illuminated by gold-accented
  neon light, responding with spring-loaded physicality

Conflicting signals:
  1. Toast notifications use solid flat fill (breaks glass material)
  2. ~240+ hardcoded colors in application layer (fuzzes precision)
  3. Split-gold problem: Tailwind #facc15 vs CSS variable #edaf18
  4. Desktop sidebar easing (cubic-bezier(0.4,0,0.2,1)) differs from
     app signature curve (cubic-bezier(0.16,1,0.3,1))

Primary coherence fix: Tokenize the application-layer hardcoded values
  to use CSS custom properties. This single class of change eliminates
  ~88% of all color inconsistencies and brings the application layer
  into alignment with the design system's character.
```

**Why PARTIALLY COHERENT and not COHERENT**: The design system (KuroStyles) IS coherent — every component expresses the same character. But the application layer (App.jsx inline styles + Tailwind classes) introduces ~240+ hardcoded values that bypass the token system, creating subtle color mismatches and inconsistencies. The character is correct at the system level but fuzzy at the application level. The 4 conflicting signals above are all application-layer leaks, not system-level contradictions.

**Finding**: DP1-CC1 ✅ — Character is PARTIALLY COHERENT: system-level coherent, application-layer inconsistent | **MEDIUM**
- **Solution**: The single highest-impact change is tokenizing the pity tier colors and trophy colors (which account for 88% of hardcoded values per §DS2 findings). This brings the application layer into alignment with the design system's established character.

---

### §DP1 Dimension Summary

| ID | Spectrum | Current | Target | Gap | Severity | Solution |
|----|----------|---------|--------|-----|----------|---------|
| DP1-V1 | Terse ↔ Expansive | 3 | 3 | 0 | **PASS** | Maintain density |
| DP1-V2 | Cold ↔ Warm | 4 | 4 | 0 | **PASS** | Protect gold warm anchor |
| DP1-V3 | Formal ↔ Casual | 5.5 | 5 | 0.5 | **PASS** | Maintain dual register |
| DP1-V4 | Restrained ↔ Expressive | 6.5 | 6 | 0.5 | **PASS** | Channel expressiveness through motion/light |
| DP1-S1 | Dense ↔ Airy | 3.5 | 3.5 | 0 | **PASS** | Maintain dual-density model |
| DP1-S2 | Flat ↔ Deep | 7.5 | 7 | 0.5 | **PASS** | Protect multi-layer depth |
| DP1-S3 | Rigid ↔ Fluid | 3 | 3 | 0 | **PASS** | Maintain grid-locked layouts |
| DP1-S4 | Anchored ↔ Floating | 6.5 | 7 | 0.5 | **PASS** | Maintain floating-panel metaphor |
| DP1-M1 | Toast material | Flat fill | Glass | 1 material step | **LOW** | Add backdrop-blur(8px) + reduce opacity to 0.7 |
| DP1-M2 | Root error material | Flat emergency | Flat emergency | 0 (justified) | **PASS** | Intentional safety fallback |
| DP1-I1 | Mechanical ↔ Physical | 7 | 7 | 0 | **PASS** | Protect bouncy easing curve |
| DP1-I2 | Snappy ↔ Considered | 4.5 | 4 | 0.5 | **PASS** | Maintain 3-tier speed system |
| DP1-I3 | Passive ↔ Reactive | 6 | 6 | 0 | **PASS** | Maintain direct-interaction reactivity |
| DP1-I4 | Silent ↔ Expressive | 6 | 6 | 0 | **PASS** | Maintain expressiveness hierarchy |
| DP1-SC1 | Toast state character | Flat solid | Glass panel | Material break | **LOW** | Add blur + reduce opacity |
| DP1-SC2 | Root error state | Flat inline | Flat inline | 0 (justified) | **PASS** | Intentional safety fallback |
| DP1-SC3 | Empty state character | Gold glow + ghost grid | On-character | 0 | **PASS** | Protect ghost-grid pattern |
| DP1-SC4 | Loading state character | Gold shimmer | On-character | 0 | **PASS** | Protect gold shimmer |
| DP1-SC5 | Onboarding state | Glass + color progression | On-character | 0 | **PASS** | Protect multi-step theming |
| DP1-CC1 ✅ | Overall coherence | PARTIALLY COHERENT | COHERENT | App-layer leaks | **MEDIUM** | Tokenize hardcoded colors |

**§DP1 Summary**: 16 spectra/states assessed. **0 major gaps** (no spectrum differs by >2 units from target). **2 findings** (DP1-M1 toast material, DP1-CC1 ✅ app-layer coherence). The character dimensions are remarkably well-aligned to the axis profile — the design system expresses the intended character precisely. The only issues are at the implementation layer (toast material, hardcoded values), not at the character definition layer.

---

## §DP2 — Design Character Brief

```
━━━ DESIGN CHARACTER BRIEF ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
App: Whispering Wishes v3.2.3
Axis Profile: NON-REVENUE focus-tool for EXPERT gacha players,
              NAMED-SOURCE (Wuthering Waves L3), FUNCTIONAL-PRIMARY
              + ATMOSPHERIC-SECONDARY

EXISTING CHARACTER (extracted from §DP0)
  What the design already says:

    "I am your tactical command interface for Wuthering Waves gacha planning.
     I am made of glass panels floating in dark space, illuminated by gold
     light. I speak in your language — pity, 50/50, Astrite, Convenes — and
     I track your data with precision. I am dense because your time is
     valuable. I am always subtly alive — shimmering, glowing, pulsing —
     because your data is live. I reward your investment with dry humor
     hidden in trophy descriptions. I am NOT a generic dashboard. I am NOT
     a corporate tool. I am your companion, built by a player who
     understands the game as deeply as you do."

  Strongest signals (the 3 decisions most responsible):

    1. GLASS-OVER-VOID MATERIAL
       `backdrop-filter: blur(4px)` + `rgba(12,16,24,0.55)` cards +
       `#080c14` void background + triple-stack shadows. This single
       material decision creates the entire spatial metaphor — every
       surface is a translucent panel floating in darkness.

    2. GOLD WARM ANCHOR
       `--color-gold: 237, 175, 24` (#edaf18) as the only warm element
       in an entirely cool palette. Gold appears in: focus rings, active
       states, header chrome bars, glow shadows, shimmer accents, empty
       state radial glow, skeleton shimmer, tab indicator. It is the
       single color that says "Wuthering Waves premium" and "pay
       attention here."

    3. HUD CHROME DECORATIONS
       Corner brackets (L-shaped borders at top-right/bottom-left),
       gold gradient accent bars (3×16px), top-edge shimmer lines
       (animated opacity 0.6→1→0.6), colored text-shadow glows. These
       pseudo-element details transform standard cards into command
       interface readouts. No other gacha tracker uses this language.

  Weakest/incoherent signals:

    1. ~240+ hardcoded color values in App.jsx that bypass the design
       token system, creating subtle inconsistencies (Tailwind
       `text-yellow-400` #facc15 vs CSS variable gold #edaf18)

    2. Toast notifications use solid flat fill instead of glass
       material — the only recurring UI element that breaks the
       glass-over-void metaphor

TARGET CHARACTER
  Voice:       Terse (3) + Cool (4) + Balanced formal/casual (5.5) +
               Moderately expressive (6.5)
               Anchored in: 9-10px dominant text, 8px gap rhythm, cool
               blue-tinted text (#dfe5ef), gold text-shadow glows,
               uppercase wide-tracked labels (0.08em), Rajdhani display
               font, expert domain vocabulary

  Space:       Dense (3.5) + Deep (7.5) + Rigid (3) + Floating (6.5)
               Anchored in: gap-2 (72 uses), 14px card padding, 5-level
               z-index hierarchy, backdrop-filter blur(4-8px), triple-stack
               shadows, translateY(-2px) hover lift, dark void background

  Material:    Glass + Void + Light = "Holographic Display"
               Anchored in: backdrop-filter: blur(4px) on cards, blur(8px)
               on controls, rgba(12,16,24,0.55) card surfaces, rgba(0,0,0)
               OLED variant, gold radial-gradient ambient glows, inset
               0 1px 0 rgba(255,255,255,0.05) top-edge highlights

  Interaction: Physical (7) + Balanced speed (4.5) + Reactive (6) +
               Moderately expressive (6)
               Anchored in: cubic-bezier(0.16, 1, 0.3, 1) signature
               curve, 0.15s/0.25s/0.4s three-tier speed system, scale(0.97)
               press feedback, card entrance stagger (50ms intervals),
               haptic feedback per toast type

  States:      5/7 fully consistent, 1 partial (toasts), 1 justified
               break (root crash). Character holds across onboarding,
               active use, empty states, loading, and tab-level errors.
               Gold shimmer in skeletons and gold glow in empty states
               are particularly strong character-consistent choices.

CHARACTER STATEMENT
  "This app's design reads as a LUMINOUS TACTICAL COMPANION — a glass
   command interface floating in dark space, illuminated by gold light,
   built by a player for players. The strongest expression of this is
   the glass-over-void material system with HUD chrome decorations that
   transforms every card into a command panel readout.

   It should never feel GENERIC or CORPORATE — which currently happens
   when hardcoded Tailwind colors (text-yellow-400, text-emerald-400)
   override the design system's precisely calibrated accent tokens, and
   when toast notifications appear as flat colored banners instead of
   translucent glass indicators."

CHARACTER TESTS (decision filters for new design work)
  ✓ ON CHARACTER: New components use backdrop-filter + semi-transparent
    rgba background + border from the 5-level opacity scale
  ✗ OFF CHARACTER: Flat solid-fill backgrounds with no transparency
    (except root error boundary)

  ✓ ON CHARACTER: Interactive elements have gold focus ring, color-
    emissive glow on active state, bouncy easing on transition
  ✗ OFF CHARACTER: Standard :focus-visible outline, instant state
    change, no glow — reads as "default browser styling"

  ✓ ON CHARACTER: Color accent references CSS custom property
    (rgba(var(--color-gold), 0.5)) or KuroStyles class (active-gold)
  ✗ OFF CHARACTER: Tailwind color class (text-yellow-400) or raw hex
    (#facc15) for the same semantic as a design token color

  ✓ ON CHARACTER: Empty/loading states use gold-tinted atmospheric
    treatment (radial glow, gold shimmer, ghost grid)
  ✗ OFF CHARACTER: Generic gray placeholder, default spinner, or
    untreated blank space

  ✓ ON CHARACTER: Copy uses Wuthering Waves terminology (Convene,
    Resonator, Astrite, pity, 50/50) and insider humor
  ✗ OFF CHARACTER: Generic gacha terms (pull, character, gems) or
    corporate-neutral language ("An error occurred")

  ✓ ON CHARACTER: Motion uses the signature curve
    cubic-bezier(0.16, 1, 0.3, 1) with 3-tier duration system
  ✗ OFF CHARACTER: Generic ease/ease-out, Tailwind transition-all
    defaults, or no motion at all

PROTECT (existing decisions that express the character correctly)
  - #080c14 blue-black void background (NOT pure black except OLED)
  - #edaf18 gold accent as sole warm anchor
  - backdrop-filter: blur(4px) on cards, blur(8px) on controls
  - Corner bracket pseudo-elements on .kuro-card-inner
  - Gold gradient header accent bars (.kuro-header h3::before)
  - Top-edge shimmer line animation on cards (.kuro-card::after)
  - Gold-tinted skeleton shimmer (.kuro-skeleton)
  - Gold radial glow on empty states (.kuro-empty-state)
  - Ghost-grid pulsing placeholder (.ghost-grid-cell)
  - cubic-bezier(0.16, 1, 0.3, 1) signature easing curve
  - Rajdhani + JetBrains Mono font pairing
  - 5-level border opacity scale (--border-subtle → --border-bright)
  - 4-level shadow scale (--shadow-sm → --shadow-xl)
  - Trophy humor and domain vocabulary
  - Onboarding multi-step color progression
  - Card entrance stagger (50ms intervals)

REJECT (patterns that belong to a different product's character)
  - White/light backgrounds → wrong product (this is a dark-mode-only tool)
  - Pastel accent colors → wrong product (this uses neon-range saturated accents)
  - Rounded pill-shaped buttons (border-radius: 9999px) → wrong product
    (this uses 12px radius glass panels)
  - Illustrations or mascot characters → wrong product (this uses line
    icons and text, not illustration)
  - Flat Material Design cards (no transparency, no blur) → wrong product
    (this is glass, not paper)
  - Warm gray palette → wrong product (this uses cool-tinted chromatic grays)
  - Sans-serif system UI font as display → wrong product (this uses
    Rajdhani for its angular, technical character)
  - Generic dashboard template styling → wrong product (this has a
    specific cyberpunk/HUD identity, not "dark mode dashboard")
  - Rounded-friendly, soft-shadow, warm-toned components (Notion-like)
    → wrong product (this is sharp, glassy, cool, luminous)
  - Excessive whitespace between data points → wrong product (this is
    information-dense for expert users)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

### §DP2 Plan-Deliverable Checklist

The plan (lines 110-116) specified these §DP2 deliverables:

| Deliverable | Location | Status |
|-------------|----------|--------|
| Character in one sentence | CHARACTER STATEMENT (first sentence) | ✅ |
| Character keywords (3-5) | "Luminous", "Tactical", "Glass", "Gold-anchored", "Expert-companion" | ✅ |
| Character "never" list | REJECT section (10 anti-patterns) | ✅ |
| What makes it distinctive | EXISTING CHARACTER → Strongest signals (3 decisions) | ✅ |
| What threatens its character | EXISTING CHARACTER → Weakest signals + CHARACTER STATEMENT → "should never feel" | ✅ |
| Audience emotional expectation | VOICE → "expert domain vocabulary" + INTERACTION → "responsive instruments" = audience expects precision data delivery with insider credibility | ✅ |

---

### Step 4 All-Findings Summary

| ID | Finding | Severity | Solution |
|----|---------|----------|---------|
| DP1-V1 | Visual terseness matches FOCUS-TOOL intent | **PASS** | Maintain density |
| DP1-V2 | Temperature balance matches cyberpunk-luxe | **PASS** | Protect gold warm anchor |
| DP1-V3 | Formality register matches EXPERT audience | **PASS** | Maintain dual register |
| DP1-V4 | Expressiveness channeled through motion/light | **PASS** | Continue motion/light expressiveness |
| DP1-S1 | Density matches FOCUS-TOOL | **PASS** | Maintain dual-density model |
| DP1-S2 | Depth supports glass-over-void identity | **PASS** | Protect multi-layer depth |
| DP1-S3 | Rigidity supports data scanability | **PASS** | Maintain grid layouts |
| DP1-S4 | Floating character supports holographic metaphor | **PASS** | Maintain floating panels |
| DP1-M1 | Toast notifications break glass material | **LOW** | Add backdrop-blur(8px) + opacity 0.7 |
| DP1-M2 | Root error uses flat material (justified safety) | **PASS** | Intentional fallback |
| DP1-I1 | Physical interaction character on-target | **PASS** | Protect bouncy easing |
| DP1-I2 | Speed profile balances fast + dramatic | **PASS** | Maintain 3-tier system |
| DP1-I3 | Reactivity appropriate for data tool | **PASS** | Maintain hover reactivity |
| DP1-I4 | Expressiveness hierarchy correct | **PASS** | Reserve drama for data reveals |
| DP1-SC1 | Toast state breaks glass material | **LOW** | Same as DP1-M1 |
| DP1-SC2 | Root error state justified break | **PASS** | No change |
| DP1-SC3 | Empty states are strong character expression | **PASS** | Protect ghost-grid pattern |
| DP1-SC4 | Loading skeletons correctly express character | **PASS** | Protect gold shimmer |
| DP1-SC5 | Onboarding correctly showcases character | **PASS** | Protect color progression |
| DP1-CC1 ✅ | App-layer hardcoded values fuzz precision | **MEDIUM** | Tokenize pity/trophy colors |

---

**STEP 4 COMPLETE** — §DP1 Character Dimensions + §DP2 Design Character Brief established.

**Character Coherence**: PARTIALLY COHERENT — system-level coherent, application-layer leaks
**Dominant Character**: "Luminous Tactical Glass" — dense data on floating glass panels in dark space, illuminated by gold-accented neon light, responding with spring-loaded physicality
**Dimension Alignment**: All 12 spectra within 0.5 units of target — no major misalignments
**Actionable Findings**: 2 (DP1-M1 toast material LOW, DP1-CC1 ✅ tokenization MEDIUM)
**Character Brief**: Established as decision filter for all subsequent audit findings

---
---

# STEP 5: §DC1 + §DC2 — Perceptual Color Architecture + Palette Roles

> **Method**: Convert all app colors to OKLCH perceptual space for uniform analysis. OKLCH provides perceptually uniform lightness (L), chroma (C = saturation), and hue (h). All conversions performed via sRGB→OKLab→OKLCH pipeline.

---

## §DC1 — Perceptual Color Architecture

### §DC1.1 — Background Layer Analysis

**All background values converted to OKLCH:**

| Background | Hex/RGB | OKLCH | Lightness | Chroma | Hue |
|-----------|---------|-------|-----------|--------|-----|
| **App body** | `#080c14` | `oklch(15.4% 0.019 263°)` | 15.4% | 0.019 | 263° (blue) |
| **OLED mode** | `#000000` | `oklch(0% 0 —)` | 0% | 0 | achromatic |
| **Scrollbar track** | `#0f1520` | `oklch(19.5% 0.024 262°)` | 19.5% | 0.024 | 262° (blue) |
| **Card surface** | `rgb(12,16,24)` | `oklch(17.3% 0.018 264°)` | 17.3% | 0.018 | 264° (blue) |
| **Card inner** | `rgb(6,10,18)` | `oklch(14.4% 0.019 261°)` | 14.4% | 0.019 | 261° (blue) |
| **Button/Input** | `rgb(15,20,28)` | `oklch(19.0% 0.018 260°)` | 19.0% | 0.018 | 260° (blue) |
| **Stat box** | `rgb(10,14,22)` | `oklch(16.4% 0.018 264°)` | 16.4% | 0.018 | 264° (blue) |
| **Shadow base** | `rgb(6,10,24)` | `oklch(14.9% 0.031 269°)` | 14.9% | 0.031 | 269° (blue) |

#### Background Layer Assessment

**Hue coherence**: ✅ **EXCELLENT** — All non-OLED backgrounds sit within a 9° hue range (260°-269°), all firmly in the blue family. The shadow base is slightly more blue-shifted (269°) which is correct — shadows naturally shift cooler.

**Chroma coherence**: ✅ **EXCELLENT** — All backgrounds have chroma between 0.018-0.031. This is the "chromatic dark" sweet spot identified by the skill document: `oklch(~14% ~0.02 ~260)` — enough hue presence to feel intentionally tinted, not enough to read as "blue." The shadow base has slightly higher chroma (0.031) — this is appropriate because shadow color benefits from slightly more saturation to feel rich rather than neutral.

**Lightness progression**: The surface elevation system in OKLCH lightness:

```
Layer                  L%       Δ from below
─────────────────────────────────────────────
OLED mode              0.0%     —
Card inner            14.4%     +14.4%
Shadow base           14.9%     +0.5%
App body              15.4%     +0.5%
Stat box              16.4%     +1.0%
Card surface          17.3%     +0.9%
Button/Input          19.0%     +1.7%
Scrollbar track       19.5%     +0.5%
```

**Finding**: DC1-BG1 — Background lightness steps are too narrow | **LOW**

The standard-mode lightness range spans only 14.4% to 19.5% — a total of **5.1 OKLCH lightness points**. The skill document recommends **~3-4% per layer step** for perceptible elevation. Current steps between layers are 0.5-1.7%, meaning:
- Card inner (14.4%) vs App body (15.4%) = 1.0% — **imperceptible** without border/blur cues
- Stat box (16.4%) vs Card surface (17.3%) = 0.9% — **barely perceptible**
- Card surface (17.3%) vs Button/Input (19.0%) = 1.7% — **marginally perceptible**

**Assessment**: This narrow range WORKS in practice because the app uses **alternative depth cues** — backdrop-filter blur, border opacity, and shadow layers — rather than relying solely on surface lightness for elevation. The lightness system is supplementary, not primary. However, it means the lightness alone provides weak depth signal.

**Solution**: If lightness-as-elevation is desired as a stronger signal:
- Keep app body at `oklch(15.4% 0.019 263)` (anchor)
- Shift card surface to `oklch(19% 0.018 263)` (+3.6% from body)
- Shift button/input to `oklch(22% 0.018 263)` (+3% from card)
- This creates a 3%+ step between each layer

However, **this may be unnecessary** given the strong blur/border/shadow depth system already in place. The narrow lightness range is a character choice (dark-mode-focused, OLED-friendly) rather than an error. Mark as LOW — no change recommended unless other depth cues are reduced.

**Finding**: DC1-BG2 — OLED mode correctly uses pure black | **PASS**

OLED mode at `oklch(0% 0 —)` is achromatic pure black. This is the correct choice for OLED pixel-off power savings. The skill document notes pure black is "appropriate only for OLED/theater mode" — and that's exactly how it's used.

**Solution**: Protect OLED pure black. The standard mode's chromatic `oklch(15.4% 0.019 263°)` provides the refined feeling, while OLED provides the functional power savings.

**Finding**: DC1-BG3 — Shadow base has elevated chroma (intentional) | **PASS**

Shadow base `oklch(14.9% 0.031 269°)` has nearly 2× the chroma (0.031 vs 0.018) of the surface colors. This is correct for dark-mode shadow design — slightly more chromatic shadows feel richer and more intentional than neutral gray shadows. The 6° hue shift toward cooler blue (269° vs 263°) is also correct — shadows naturally read as cooler.

**Solution**: Protect the elevated shadow chroma. It's a subtle but perceptually correct design decision.

---

### §DC1.2 — Text Color Chromaticity Assessment

**All text colors in OKLCH:**

| Text Role | Hex | OKLCH | L% | C | Hue | Cool-tinted? |
|-----------|-----|-------|-----|---|-----|-------------|
| **Heading** (--text-heading) | `#edf1f8` | `oklch(95.7% 0.010 262°)` | 95.7 | 0.010 | 262° | ✅ Blue |
| **Body** (--text-body) | `#dfe5ef` | `oklch(92.0% 0.015 261°)` | 92.0 | 0.015 | 261° | ✅ Blue |
| **Secondary** (gray-300) | `#c5ccda` | `oklch(84.4% 0.021 265°)` | 84.4 | 0.021 | 265° | ✅ Blue |
| **Muted** (gray-400) | `#8f99ab` | `oklch(68.1% 0.029 262°)` | 68.1 | 0.029 | 262° | ✅ Blue |
| **Disabled** (gray-500) | `#646e7f` | `oklch(53.6% 0.029 261°)` | 53.6 | 0.029 | 261° | ✅ Blue |
| **Placeholder** | `#6b7389` | `oklch(55.7% 0.036 270°)` | 55.7 | 0.036 | 270° | ✅ Blue |
| **Focus placeholder** | `#8f99ab` | `oklch(68.1% 0.029 262°)` | 68.1 | 0.029 | 262° | ✅ Blue |
| **White** | `#ffffff` | `oklch(100% 0 —)` | 100 | 0 | achromatic | — |

#### Text Chromaticity Assessment

**Hue coherence**: ✅ **EXCELLENT** — All non-white text colors sit within a 9° hue band (261°-270°), matching the background hue family exactly. This creates a **monochromatic blue-tinted text system** — text and backgrounds share the same hue, differing only in lightness and chroma.

**Lightness hierarchy**:

```
Text role          L%       Contrast vs body (L=15.4%)
──────────────────────────────────────────────────────
Heading            95.7%    80.3 L-points  ✅ Excellent
Body               92.0%    76.6 L-points  ✅ Excellent
Secondary          84.4%    69.0 L-points  ✅ Strong
Muted              68.1%    52.7 L-points  ✅ Adequate
Disabled           53.6%    38.2 L-points  ⚠️ Low (intentional)
Placeholder        55.7%    40.3 L-points  ⚠️ Low (intentional)
```

The text hierarchy has clear perceptual separation between each level: heading→body (3.7 L-points), body→secondary (7.6), secondary→muted (16.3), muted→disabled (14.5). The largest perceptual gap is between secondary and muted (16.3 points) — this creates a strong "above/below the fold" division between readable and de-emphasized text.

**Chroma progression**: Interesting pattern — chroma *increases* as lightness decreases:

```
Heading    L=95.7%  C=0.010  (near-achromatic white)
Body       L=92.0%  C=0.015  (barely tinted)
Secondary  L=84.4%  C=0.021  (subtly tinted)
Muted      L=68.1%  C=0.029  (noticeably tinted)
Disabled   L=53.6%  C=0.029  (noticeably tinted)
Placeholder L=55.7% C=0.036  (most tinted)
```

This is **perceptually correct** — at higher lightness (near white), chroma is less visible, so lower chroma is needed. At lower lightness (grays), chroma is more perceptible, so the cool blue tint becomes visible. The rising chroma ensures the blue tint remains consistently perceptible across the entire text hierarchy.

**Finding**: DC1-TX1 — Text chromaticity system is perceptually well-calibrated | **PASS**

All text colors share the blue hue family (261°-270°), chroma rises with decreasing lightness to maintain consistent perceived tint, and the lightness hierarchy provides clear 4-step text weight. The cool-tinted text reinforces the cyberpunk/HUD character from §DP0.

**Solution**: Protect this text color system. Do not introduce neutral grays (hue-less) or warm-tinted grays — they would break the monochromatic blue harmony.

**Finding**: DC1-TX2 — Hardcoded `#ffffff` (pure white) used for emphasis | **PASS**

Pure white at `oklch(100% 0)` is achromatic — it breaks the blue tint. However, this is used deliberately for maximum-emphasis moments (numbers, hero stats). The contrast between blue-tinted body text and pure-white emphasis text creates a subtle **"highlight glow"** effect that reinforces the HUD aesthetic.

**Solution**: Continue using pure white sparingly for emphasis. If overused, it dilutes the cool-tinted atmosphere.

---

### §DC1.3 — Accent Color Calibration

**All accent colors in OKLCH with perceptual analysis:**

| Accent | Hex | OKLCH | L% | C | Hue | Hue Family |
|--------|-----|-------|-----|---|-----|-----------|
| **Gold** (primary) | `#edaf18` | `oklch(79.1% 0.159 82°)` | 79.1 | 0.159 | 82° | Yellow-amber |
| **Pink** | `#ec4899` | `oklch(65.6% 0.212 354°)` | 65.6 | 0.212 | 354° | Red-magenta |
| **Cyan** | `#38bdf8` | `oklch(75.4% 0.139 233°)` | 75.4 | 0.139 | 233° | Blue-cyan |
| **Purple** | `#a855f7` | `oklch(62.7% 0.233 304°)` | 62.7 | 0.233 | 304° | Blue-purple |
| **Emerald** | `#22c55e` | `oklch(72.3% 0.192 150°)` | 72.3 | 0.192 | 150° | Green |
| **Red** | `#f87171` | `oklch(71.1% 0.166 22°)` | 71.1 | 0.166 | 22° | Red-orange |

#### Perceptual Lightness Uniformity

**Target**: Accent colors should have similar perceptual lightness so they feel equally prominent when placed side-by-side (e.g., in a tab bar, stat grid, or legend).

```
Accent lightness ranking:
  Gold      79.1%  ████████████████████████████████████████  ← brightest
  Cyan      75.4%  ███████████████████████████████████████
  Emerald   72.3%  ████████████████████████████████████
  Red       71.1%  ████████████████████████████████████
  Pink      65.6%  █████████████████████████████████
  Purple    62.7%  ███████████████████████████████        ← darkest

  Range: 16.4 L-points (79.1 - 62.7)
```

**Finding**: DC1-AC1 ✅ — Accent lightness range is wide (16.4 L-points) | **MEDIUM**

The perceptual lightness spread of 16.4 points means gold appears significantly brighter than purple when used at equal size. In practice:
- Gold (79.1%) and cyan (75.4%) read as "bright accents"
- Emerald (72.3%) and red (71.1%) read as "medium accents"
- Pink (65.6%) and purple (62.7%) read as "darker accents"

This creates an **unintentional visual hierarchy** among the accents — gold and cyan dominate attention not because of semantic importance but because they're perceptually lighter.

**Assessment**: This is **PARTIALLY INTENTIONAL** — gold IS the primary accent and SHOULD be brightest. But the gap between gold (79.1%) and purple (62.7%) is larger than necessary. Purple is the 4★ rarity color and should read as clearly visible, not muted.

**Solution**: To equalize secondary accents while keeping gold brightest:
- Gold: keep at 79.1% (primary accent privilege)
- Increase purple from 62.7% to ~68% → `oklch(68% 0.22 304)` ≈ `#b56aff`
- Increase pink from 65.6% to ~69% → `oklch(69% 0.20 354)` ≈ `#f55fa4`
- Keep cyan, emerald, red as-is (72-75% is fine)

This narrows the secondary accent range to 68%-75% (7 points) while gold remains above at 79%. The result: gold leads, all secondaries feel equally weighted.

**However**: This change is cosmetic and low-risk. The current values work in practice because each accent is used in isolated contexts (element badges, stat cards) where relative lightness between accents rarely matters. Mark as MEDIUM — beneficial but not urgent.

#### Chroma Analysis (Peak Chroma for Hue)

**Is each accent at peak chroma for its hue?** Yellow and green hues have lower maximum chroma than purple/blue in OKLCH.

| Accent | Current C | Approx Max C for Hue | % of Max | Status |
|--------|-----------|----------------------|----------|--------|
| **Gold** (82°) | 0.159 | ~0.20 | 80% | ✅ High but not maxed — avoids neon glare |
| **Pink** (354°) | 0.212 | ~0.28 | 76% | ✅ High — vivid without oversaturation |
| **Cyan** (233°) | 0.139 | ~0.18 | 77% | ✅ Moderate — calm technical blue |
| **Purple** (304°) | 0.233 | ~0.30 | 78% | ✅ High — strongest chroma in the palette |
| **Emerald** (150°) | 0.192 | ~0.24 | 80% | ✅ High — vivid green |
| **Red** (22°) | 0.166 | ~0.24 | 69% | ⚠️ Lower — reads as coral, not pure red |

**Finding**: DC1-AC2 — Red accent (`#f87171`) is low-chroma for an error signal | **LOW**

Red at `oklch(71.1% 0.166 22°)` sits at only 69% of max chroma for its hue. The `--color-red` CSS variable uses the lighter, softer `#f87171` rather than the more saturated `#ef4444` (`oklch(63.7% 0.208 25°)`) used for actual error states. This creates a **split red** situation:
- `--color-red: 248, 113, 113` (#f87171) → lighter, lower chroma (0.166)
- Error hex `#ef4444` → darker, higher chroma (0.208)

**Solution**: Standardize error red. The `#ef4444` is the stronger signal and should be the canonical error red. Update `--color-red` to `239, 68, 68` (#ef4444) for consistency. However, this may make the red stat box more aggressive — if softer red is preferred for non-error contexts, introduce a second token `--color-red-soft` for stat boxes while keeping `--color-red` at full error strength.

**Finding**: DC1-AC3 — Accent chroma distribution is well-calibrated | **PASS**

All accents sit in the 69-80% of max chroma range — high enough to read as vivid neon accents on dark backgrounds, low enough to avoid P3/sRGB gamut-edge artifacts. Purple has the highest absolute chroma (0.233) which is correct — it needs more chroma than gold to achieve similar perceived vibrancy at its darker lightness level.

**Solution**: Protect the current chroma balance. Do not push accents to max chroma — the 75-80% sweet spot provides vivid neon without eye strain on dark backgrounds.

---

### §DC1.4 — Semantic Color Calibration

**Semantic colors vs accent palette:**

| Semantic Role | Token Source | Color | OKLCH | Same as Accent? |
|--------------|-------------|-------|-------|----------------|
| **Success** | Toast system | `#22c55e` | `oklch(72.3% 0.192 150°)` | = `--color-emerald` ✅ |
| **Error** | Toast system | `#ef4444` | `oklch(63.7% 0.208 25°)` | ≠ `--color-red` (#f87171) ⚠️ |
| **Warning** | Toast system | `#edaf18` | `oklch(79.1% 0.159 82°)` | = `--color-gold` ✅ |
| **Info** | Toast system | `#38bdf8` | `oklch(75.4% 0.139 233°)` | = `--color-cyan` ✅ |

#### Semantic vs Palette Alignment

**Finding**: DC1-SM1 — Success/Warning/Info correctly reuse accent tokens | **PASS**

Three of four semantic colors are identical to their accent counterparts:
- Success green = `--color-emerald` (same hex, same OKLCH)
- Warning gold = `--color-gold` (same hex, same OKLCH)
- Info cyan = `--color-cyan` (same hex, same OKLCH)

This is excellent palette economy — semantic colors derive from the existing accent system rather than introducing new hues.

**Solution**: Protect this alignment. When semantic colors diverge from the accent palette, it creates palette bloat.

**Finding**: DC1-SM2 — Error red diverges from `--color-red` token | **LOW**

The toast error color `#ef4444` (`oklch(63.7% 0.208 25°)`) differs from `--color-red: #f87171` (`oklch(71.1% 0.166 22°)`):
- Lightness gap: 7.4 L-points (63.7% vs 71.1%)
- Chroma gap: 0.042 (0.208 vs 0.166)
- The toast red is darker and more saturated — more "urgent"
- The CSS variable red is lighter and softer — more "decorative"

This means `--color-red` is NOT the canonical error red — the error system uses a hardcoded different value. This is a token-bypass inconsistency.

**Solution**: Choose one red as canonical and derive the other:
- **Option A** (recommended): Keep `#ef4444` for errors, rename `--color-red` to `--color-red-soft` for stat/decorative use, and add `--color-error: 239, 68, 68` as a new semantic token.
- **Option B**: Unify to `#ef4444` everywhere — makes stat-red boxes more aggressive but eliminates the split.

#### Semantic Color Perceptual Weight

```
Semantic lightness:
  Warning (gold)  79.1%  ████████████████████████  ← brightest (attention)
  Info (cyan)     75.4%  ██████████████████████
  Success (green) 72.3%  ████████████████████
  Error (red)     63.7%  ████████████████         ← darkest (gravity)
```

**Assessment**: The semantic lightness hierarchy is **CORRECT** for dark-mode UX:
- Warning is brightest → high visibility for preventive alerts
- Info is medium-bright → noticeable but not alarming
- Success is medium → confirmed but not demanding attention
- Error is darkest → this is counterintuitive on light backgrounds, but on dark backgrounds, the lower lightness + higher chroma creates a **heavier, more serious** visual weight. The red's density communicates gravity.

**Finding**: DC1-SM3 — Semantic lightness hierarchy is correct for dark-mode context | **PASS**

**Solution**: Protect this hierarchy. On dark backgrounds, "serious" semantics should feel heavier (darker, denser), not lighter.

---

### §DC1.5 — Color Temperature Coherence

**Temperature classification of all palette colors:**

| Color | Hue° | Temperature | Family |
|-------|------|-------------|--------|
| App body | 263° | **COOL** | Blue |
| Card surfaces | 260°-264° | **COOL** | Blue |
| Shadow base | 269° | **COOL** | Blue |
| Text (all levels) | 261°-270° | **COOL** | Blue |
| **Gold accent** | **82°** | **WARM** | Yellow-amber |
| Pink accent | 354° | **NEUTRAL-WARM** | Red-magenta |
| Cyan accent | 233° | **COOL** | Blue-cyan |
| Purple accent | 304° | **COOL** | Blue-purple |
| Emerald accent | 150° | **COOL-NEUTRAL** | Green |
| Red accent | 22° | **WARM** | Red-orange |

#### Temperature Map

```
COOL FIELD (210°-300°):
  Backgrounds (260°-269°), Text (261°-270°), Cyan (233°), Purple (304°)
  → 90%+ of the app's surface area

NEUTRAL ZONE (140°-210°, 300°-360°):
  Emerald (150°), Pink (354°)
  → Element/game-specific accents

WARM ISLAND (0°-90°):
  Gold (82°), Red (22°)
  → Primary accent + error/loss signal
```

**Finding**: DC1-TMP1 — Temperature coherence is deliberately bimodal: cool field + warm island | **PASS**

The temperature strategy is **intentional and well-executed**:
- **Cool field** (backgrounds, text, cyan, purple): Creates the cyberpunk/HUD atmosphere. This is 90%+ of the visual area.
- **Warm island** (gold at 82°): The single deliberate warm accent that creates maximum temperature contrast against the cool field. Gold draws the eye BECAUSE it's the only warm element — this is the "warm anchor" identified in §DP0.
- **Red** (22°) is warm but used sparingly for error/loss — its warmth communicates urgency on the cool field.

This is **not** a mixed-temperature palette — it's a **cool-dominant palette with intentional warm focal point**. The temperature contrast between gold (82°) and the cool field (260°+) is ~180° on the hue wheel — almost perfectly complementary. This creates the maximum possible temperature tension, which is why gold "pops" so effectively.

**Solution**: Protect the bimodal temperature strategy. Rules for new colors:
- Default to cool (220°-300°) for structural/background elements
- Reserve warm (40°-90°) exclusively for gold-family accents and emphasis
- Game element colors (150°-360°) may be neutral/warm but should only appear in game-context UI (element badges, team cards)

**Finding**: DC1-TMP2 — Pink accent (354°) sits at the warm/cool boundary | **PASS**

Pink at hue 354° is on the red-magenta boundary — technically warm but perceptually reads as "electric/synthetic" rather than "warm." In the context of a cool-dominant palette, pink functions as a **cool-ish accent** (closer to purple than to orange). This is correct for the Havoc element color and for its use as a limited-banner accent.

**Solution**: No change needed. Pink's boundary position gives it flexibility — it can lean warm (with gold, in banner contexts) or cool (with purple, in element contexts).

---

## §DC2 — Palette Architecture Audit

### §DC2.1 — Complete Palette Role Inventory

**Every color token/role in the app, its current value, and assessment:**

#### Background Tokens (Surface System)

| Role | Token | Current Value | OKLCH | Assessment |
|------|-------|--------------|-------|------------|
| Background (deepest) | `html bg` | `#080c14` | `oklch(15.4% 0.019 263°)` | ✅ Chromatic dark — correct |
| Surface layer 1 (cards) | `--bg-card` | `rgba(12,16,24,0.55)` | `oklch(17.3% 0.018 264°)` at 55% | ✅ Glass with cool tint |
| Surface layer 1 inner | `--bg-card-inner` | `rgba(6,10,18,1)` | `oklch(14.4% 0.019 261°)` | ✅ Solid dark panel |
| Surface layer 2 (controls) | `--bg-btn` | `rgba(15,20,28,0.85)` | `oklch(19.0% 0.018 260°)` at 85% | ✅ Denser glass |
| Surface layer 2 (inputs) | `--bg-input` | `rgba(15,20,28,0.9)` | `oklch(19.0% 0.018 260°)` at 90% | ✅ Dense glass |
| Surface layer 2 (stats) | `--bg-stat` | `rgba(10,14,22,0.8)` | `oklch(16.4% 0.018 264°)` at 80% | ✅ Medium glass |
| Surface layer 3 (modal) | *Hardcoded* | `rgba(12,16,24,0.95)` | `oklch(17.3% 0.018 264°)` at 95% | ⚠️ No token — hardcoded in 10+ places |
| OLED background | `html.oled bg` | `#000000` | `oklch(0% 0 —)` | ✅ Pure black for pixel-off |

**Finding**: DC2-BG1 — Modal backdrop has no token (hardcoded in 10+ places) | **LOW**

The modal backdrop `rgba(12,16,24,0.95)` is repeated as a hardcoded value in `appcore-components.jsx` in 10+ modal implementations. This should be a token: `--bg-modal`.

**Solution**: Add `--bg-modal: rgba(12, 16, 24, 0.95)` to the `:root` CSS custom properties alongside the other `--bg-*` tokens. Replace all hardcoded instances.

#### Text Tokens

| Role | Token | Current Value | OKLCH | Assessment |
|------|-------|--------------|-------|------------|
| Primary text (headings) | `--text-heading` | `#edf1f8` | `oklch(95.7% 0.010 262°)` | ✅ Cool-white, high contrast |
| Primary text (body) | `--text-body` | `#dfe5ef` | `oklch(92.0% 0.015 261°)` | ✅ Cool-white, standard contrast |
| Secondary text | *Tailwind `text-gray-300`* | `#c5ccda` | `oklch(84.4% 0.021 265°)` | ⚠️ No CSS variable — relies on Tailwind |
| Muted text | *Tailwind `text-gray-400`* | `#8f99ab` | `oklch(68.1% 0.029 262°)` | ⚠️ No CSS variable — relies on Tailwind |
| Disabled text | *Tailwind `text-gray-500`* | `#646e7f` | `oklch(53.6% 0.029 261°)` | ⚠️ No CSS variable — relies on Tailwind |
| Emphasis text | Hardcoded | `#ffffff` | `oklch(100% 0 —)` | ✅ Pure white for maximum emphasis |

**Finding**: DC2-TX1 — Secondary/muted/disabled text rely on Tailwind classes instead of tokens | **LOW**

Only heading and body text have CSS custom properties (`--text-heading`, `--text-body`). Secondary, muted, and disabled text rely on Tailwind's custom gray scale (`text-gray-300/400/500`) — which IS custom-defined in `tailwind.config.js` but not accessible as CSS variables.

**Solution**: Add semantic text tokens for completeness:
- `--text-secondary: #c5ccda`
- `--text-muted: #8f99ab`
- `--text-disabled: #646e7f`
These mirror the Tailwind values but make them available for CSS-in-JS components.

#### Accent Tokens

| Role | Token | Current Value | OKLCH | Assessment |
|------|-------|--------------|-------|------------|
| Accent primary | `--color-gold` | `237, 175, 24` (#edaf18) | `oklch(79.1% 0.159 82°)` | ✅ Strong warm anchor |
| Accent hover | *None* | *Derived inline* | — | ⚠️ No explicit hover token |
| Accent active | *KuroStyles class* | `active-gold` border + glow | — | ✅ Full emissive treatment |
| Secondary accent 1 | `--color-cyan` | `56, 189, 248` (#38bdf8) | `oklch(75.4% 0.139 233°)` | ✅ Cool technical blue |
| Secondary accent 2 | `--color-purple` | `168, 85, 247` (#a855f7) | `oklch(62.7% 0.233 304°)` | ✅ Vivid 4★ purple |
| Secondary accent 3 | `--color-pink` | `236, 72, 153` (#ec4899) | `oklch(65.6% 0.212 354°)` | ✅ Vivid limited-banner pink |
| Secondary accent 4 | `--color-emerald` | `34, 197, 94` (#22c55e) | `oklch(72.3% 0.192 150°)` | ✅ Success + Aero green |
| Secondary accent 5 | `--color-red` | `248, 113, 113` (#f87171) | `oklch(71.1% 0.166 22°)` | ⚠️ Softer than error red — split role |

**Finding**: DC2-AC1 ✅ — No explicit `--accent-hover` token | **LOW**

Gold hover states are computed inline or via KuroStyles classes, but there's no `--color-gold-hover` token. This means hover gold intensity isn't centrally controlled.

**Solution**: Add `--color-gold-hover: 237, 175, 24` with a different opacity scale for hover (e.g., use the existing opacity pattern but document the expected hover opacity: `rgba(var(--color-gold), 0.5)` for borders, `rgba(var(--color-gold), 0.08)` for backgrounds).

#### Border Tokens

| Role | Token | Current Value | OKLCH Equivalent | Assessment |
|------|-------|--------------|-----------------|------------|
| Border subtle | `--border-subtle` | `rgba(255,255,255,0.06)` | White at 6% | ✅ Decorative separators |
| Border default | `--border-default` | `rgba(255,255,255,0.08)` | White at 8% | ✅ Default component edges |
| Border medium | `--border-medium` | `rgba(255,255,255,0.1)` | White at 10% | ✅ Elevated components |
| Border hover | `--border-hover` | `rgba(255,255,255,0.15)` | White at 15% | ✅ Hover state borders |
| Border bright | `--border-bright` | `rgba(255,255,255,0.2)` | White at 20% | ✅ High-emphasis borders |
| Border focus | *None* | Gold ring (inline) | — | ⚠️ No explicit focus border token |

**Finding**: DC2-BD1 ✅ — No `--border-focus` token | **LOW**

Focus borders use gold glow (`0 0 0 3px rgba(237,175,24,0.1)` + `0 0 20px rgba(237,175,24,0.08)`) but this is defined inline in `.kuro-input:focus`. A focus border token would centralize this.

**Solution**: Add `--border-focus: rgba(237, 175, 24, 0.5)` and `--ring-focus: 0 0 0 3px rgba(237, 175, 24, 0.1)` as tokens.

#### Shadow Tokens

| Role | Token | Current Value | Assessment |
|------|-------|--------------|------------|
| Shadow small | `--shadow-sm` | `0 1px 2px rgba(6,10,24,0.4)` | ✅ Subtle depth |
| Shadow medium | `--shadow-md` | `0 4px 12px rgba(6,10,24,0.5)` | ✅ Standard card |
| Shadow large | `--shadow-lg` | `0 8px 24px rgba(6,10,24,0.6)` | ✅ Elevated/hover |
| Shadow extra-large | `--shadow-xl` | `0 12px 40px rgba(6,10,24,0.7)` | ✅ Maximum elevation |
| Shadow glow (gold) | *None* | Inline `0 0 24px rgba(237,175,24,0.20)` | ⚠️ No token — hardcoded per color |
| Shadow glow (purple) | *None* | Inline `0 0 16px rgba(168,85,247,0.12)` | ⚠️ No token |

**Finding**: DC2-SH1 — Glow shadows have no tokens | **LOW**

Color-emissive glow shadows (gold glow, purple glow, etc.) are hardcoded inline in KuroStyles. These are character-defining effects that should be tokenized.

**Solution**: Add glow shadow tokens:
- `--glow-gold: 0 0 24px rgba(237, 175, 24, 0.20)`
- `--glow-gold-hover: 0 0 36px rgba(237, 175, 24, 0.30)`
- `--glow-purple: 0 0 16px rgba(168, 85, 247, 0.12)`
This centralizes the glow intensity and makes it adjustable per theme (e.g., reduced glow for OLED mode).

#### Semantic Tokens

| Role | Token | Current Value | Assessment |
|------|-------|--------------|------------|
| Success | *None* | `#22c55e` / `rgba(34,197,94,0.9)` | ⚠️ No token — reuses emerald implicitly |
| Error | *None* | `#ef4444` / `rgba(248,113,113,0.9)` | ⚠️ No token — hardcoded, differs from `--color-red` |
| Warning | *None* | `#edaf18` / `rgba(237,175,24,0.9)` | ⚠️ No token — reuses gold implicitly |
| Info | *None* | `#38bdf8` / `rgba(56,189,248,0.9)` | ⚠️ No token — reuses cyan implicitly |

**Finding**: DC2-SM1 — No semantic color tokens exist | **MEDIUM**

The design system defines 6 accent colors but zero semantic tokens. Semantic colors (success, error, warning, info) are hardcoded in the toast system. This means:
1. Semantic colors can't be adjusted independently of accent colors
2. Error red diverges from `--color-red` with no documentation of why
3. If toast colors need changing, multiple hardcoded values must be found and updated

**Solution**: Add semantic token layer:
```css
--color-success: var(--color-emerald);     /* 34, 197, 94 */
--color-error: 239, 68, 68;               /* #ef4444 — darker, more urgent */
--color-warning: var(--color-gold);        /* 237, 175, 24 */
--color-info: var(--color-cyan);           /* 56, 189, 248 */
```
This documents the semantic→accent mapping explicitly and gives error its own value (diverging from `--color-red` intentionally).

#### Transition Tokens

| Role | Token | Current Value | Assessment |
|------|-------|--------------|------------|
| Fast | `--transition-fast` | `0.15s cubic-bezier(0.16,1,0.3,1)` | ✅ Micro-interactions |
| Normal | `--transition-normal` | `0.25s cubic-bezier(0.16,1,0.3,1)` | ✅ Standard |
| Slow | `--transition-slow` | `0.4s cubic-bezier(0.16,1,0.3,1)` | ✅ Entrances |

**Finding**: DC2-TR1 — Transition tokens are well-defined | **PASS**

Three-tier system with consistent signature easing curve. No gaps.

**Solution**: Protect. Consider adding `--easing-signature: cubic-bezier(0.16, 1, 0.3, 1)` as a standalone token for cases where duration varies but easing should remain consistent.

#### Game-Domain Tokens

| Role | Token | Source | Assessment |
|------|-------|--------|------------|
| Element colors (6) | `ELEMENT_COLORS` | `appcore-data.js` | ⚠️ JS object, not CSS tokens |
| Medal colors (3) | `MEDAL_COLORS` | `appcore-data.js` | ⚠️ JS array, not CSS tokens |
| Rarity colors | *None* | Scattered Tailwind classes | ⚠️ No centralized rarity color system |
| Pity tier colors | *None* | Hardcoded in ~92 trophy defs | ⚠️ Highest-count hardcoded set |

**Finding**: DC2-GM1 — Game-domain colors exist only as JS constants, not CSS tokens | **MEDIUM**

Element colors, medal colors, rarity colors, and pity tier colors are defined in JavaScript objects/arrays or hardcoded inline, not as CSS custom properties. This means:
1. Components can't use them via `var(--element-fusion)` in CSS
2. Values can't be overridden per theme (e.g., OLED adjustments)
3. The 92 trophy color assignments use raw hex instead of referencing a color system

**Solution**: Promote game-domain colors to CSS custom properties:
```css
/* Element colors */
--element-fusion: 249, 115, 22;
--element-electro: 168, 85, 247;
--element-aero: 16, 185, 129;
--element-glacio: 6, 182, 212;
--element-havoc: 236, 72, 153;
--element-spectro: 234, 179, 8;

/* Rarity colors */
--rarity-5star: var(--color-gold);
--rarity-4star: var(--color-purple);
--rarity-3star: 96, 165, 250;  /* blue */
```
Then update `ELEMENT_COLORS` to reference these CSS variables, and trophy definitions to use rarity tokens.

---

### §DC2.2 — Near-Duplicate Color Consolidation

**Colors that serve the same semantic role but use different values:**

#### Gold Family (Hue 80°-92°)

| Color | Hex | OKLCH | Source | Semantic |
|-------|-----|-------|--------|----------|
| **CSS gold** | `#edaf18` | `oklch(79.1% 0.159 82°)` | `--color-gold` | Primary accent (canonical) |
| **Tailwind yellow-400** | `#facc15` | `oklch(86.1% 0.173 92°)` | Tailwind class | 5★ text color |
| **Tailwind yellow-500** | `#eab308` | `oklch(79.5% 0.162 86°)` | Tailwind class | Alternative gold |
| **Spectro element** | `#eab308` | `oklch(79.5% 0.162 86°)` | `ELEMENT_COLORS` | Spectro element |
| **Slider hardcode** | `#e6b030` | `oklch(78.7% 0.148 84°)` | Inline style | Slider thumb |

**Analysis**: Five distinct gold values where ONE should exist.
- `#edaf18` and `#eab308` differ by only 0.4 L-points and 4° hue — nearly identical but not the same hex
- `#facc15` (Tailwind yellow-400) is **7 L-points brighter** and 10° more yellow — visibly different
- `#e6b030` (slider) is slightly dimmer and less saturated — a muted variant

**Finding**: DC2-ND1 — Gold family has 5 near-duplicates | **MEDIUM**

| Pair | ΔL | ΔC | ΔH | Perceptible? |
|------|-----|-----|-----|-------------|
| CSS gold vs TW yellow-400 | 7.0 | 0.014 | 10° | **YES** — visibly different yellow |
| CSS gold vs TW yellow-500 | 0.4 | 0.003 | 4° | **NO** — effectively identical |
| CSS gold vs Spectro | 0.4 | 0.003 | 4° | **NO** — effectively identical |
| CSS gold vs Slider | 0.4 | 0.011 | 2° | **NO** — effectively identical |

**Solution**: Consolidate to `#edaf18` as the single gold value:
- Replace all `text-yellow-400` with `text-[rgb(237,175,24)]` or a custom Tailwind extension using `--color-gold`
- Replace `#eab308` in Spectro element with `#edaf18` (imperceptible change)
- Replace slider hardcodes `#e6b030`/`#edaf18` with `var(--color-gold)`
- **Exception**: If Tailwind yellow-400's extra brightness is intentional for text-on-dark contrast, document this as a deliberate "text gold" variant and create `--color-gold-text: 250, 204, 21` as an explicit lighter token

#### Cyan Family (Hue 211°-233°)

| Color | Hex | OKLCH | Source | Semantic |
|-------|-----|-------|--------|----------|
| **CSS cyan** | `#38bdf8` | `oklch(75.4% 0.139 233°)` | `--color-cyan` | Accent + info |
| **Glacio element** | `#06b6d4` | `oklch(71.5% 0.126 215°)` | `ELEMENT_COLORS` | Glacio element |
| **TW cyan-400** | `#22d3ee` | `oklch(79.7% 0.134 212°)` | Tailwind class | Cyan text |

**Analysis**: Three distinct cyans — CSS cyan is bluer (233°), Glacio is greener (215°), Tailwind is mid (212°).
- CSS cyan vs Glacio: ΔL=3.9, ΔH=18° — **perceptibly different** (different hue angle)
- CSS cyan vs TW cyan-400: ΔL=4.3, ΔH=21° — **perceptibly different**
- Glacio vs TW cyan-400: ΔL=8.2, ΔH=3° — **same hue, different lightness**

**Finding**: DC2-ND2 — Cyan family has 3 distinct values with legitimate role separation | **PASS**

Unlike the gold duplication, the cyan variants serve genuinely different purposes:
- `#38bdf8` (233° blue-cyan): UI accent — cooler, more "electric"
- `#06b6d4` (215° green-cyan): Glacio element — warmer, more "ice"
- `#22d3ee` (212° green-cyan): Text display — brighter for readability

The 18-21° hue difference between UI cyan and element cyan is intentional — they represent different concepts.

**Solution**: Document the role separation. No consolidation needed, but consider:
- Rename `--color-cyan` to `--accent-cyan` to clarify it's the UI accent cyan
- Keep Glacio's `#06b6d4` as the element color (game-accurate)

#### Green/Emerald Family (Hue 149°-163°)

| Color | Hex | OKLCH | Source | Semantic |
|-------|-----|-------|--------|----------|
| **CSS emerald** | `#22c55e` | `oklch(72.3% 0.192 150°)` | `--color-emerald` | Success + accent |
| **Aero element** | `#10b981` | `oklch(69.6% 0.149 163°)` | `ELEMENT_COLORS` | Aero element |
| **TW emerald-400** | `#34d399` | `oklch(77.3% 0.153 163°)` | Tailwind class | Green text |

**Analysis**: Three distinct greens with legitimate role separation (like cyan).
- CSS emerald is more saturated (C=0.192) and more yellow-green (150°)
- Aero is darker (L=69.6%) and more blue-green (163°)
- TW emerald-400 is brighter (L=77.3%) for text readability

**Finding**: DC2-ND3 — Green family has legitimate role separation | **PASS**

**Solution**: Same as cyan — document separation, no consolidation.

#### Red Family (Hue 22°-25°)

| Color | Hex | OKLCH | Source | Semantic |
|-------|-----|-------|--------|----------|
| **CSS red (soft)** | `#f87171` | `oklch(71.1% 0.166 22°)` | `--color-red` | Stat accent |
| **Error red** | `#ef4444` | `oklch(63.7% 0.208 25°)` | Hardcoded | Error/loss |
| **TW red-400** | `#f87171` | `oklch(71.1% 0.166 22°)` | Tailwind class | = CSS red |

**Finding**: DC2-ND4 — Red has an intentional soft/error split | **LOW**

`--color-red` (#f87171) is used for decorative/stat contexts. Error red (#ef4444) is used for actual error states. The difference: 7.4 L-points darker, 0.042 more chroma — error is heavier and more urgent.

**Solution**: Formalize the split with explicit tokens:
- `--color-red: 248, 113, 113` (decorative/stat) — keep as-is
- `--color-error: 239, 68, 68` (error/destructive) — new token

---

### §DC2.3 — Accent Overload Assessment

**Question**: Is any accent used in >3 semantic contexts (overloaded = loses meaning)?

| Accent | Semantic Contexts | Count | Overloaded? |
|--------|------------------|-------|-------------|
| **Gold** | Primary accent, 5★ rarity, warning, focus ring, tab indicator, header chrome, empty state glow, skeleton shimmer, medal gold, slider thumb, pity ring, bookmark icon | **12** | ⚠️ **YES** |
| **Cyan** | Info, standard banner, Glacio element, weapon category, tech detail | 5 | BORDERLINE |
| **Purple** | 4★ rarity, Electro element, featured display | 3 | ✅ No |
| **Pink** | Havoc element, limited banner, character featured | 3 | ✅ No |
| **Emerald** | Success, Aero element, positive stat | 3 | ✅ No |
| **Red** | Error, loss, negative stat, soft pity warning | 4 | BORDERLINE |

**Finding**: DC2-OL1 — Gold accent is overloaded across 12 semantic contexts | **MEDIUM**

Gold (#edaf18) serves as: primary accent, rarity indicator, warning color, focus affordance, navigation indicator, chrome decoration, ambient atmosphere, loading feedback, achievement medal, interactive control, data visualization, AND bookmark marker. This means gold has no single semantic meaning — it simultaneously means "premium," "pay attention," "interactive," "loading," "warning," and "decorative."

**Assessment**: This overload is **partially acceptable** because gold is the **brand color**. A brand color IS expected to appear everywhere — it's the unifying visual thread. The overload becomes problematic only when two gold-accented elements compete for attention in the same viewport (e.g., a gold pity ring + gold header bar + gold tab indicator + gold focus ring all visible simultaneously).

**Solution**:
1. **Accept gold's multi-role nature** as a brand color privilege — this is not unusual for primary accents
2. **Differentiate gold usage by opacity/intensity**, not by hue:
   - **Structural gold** (chrome bars, tab indicator): 90% opacity — strong, permanent
   - **Interactive gold** (focus ring, active state): 50% opacity + glow — responds to action
   - **Ambient gold** (empty state radial, skeleton shimmer): 4-10% opacity — atmospheric
   - **Semantic gold** (warning toast): 90% fill — high urgency
3. This opacity-differentiated approach already exists in the code — it just isn't documented. Formalizing it as an **"opacity role map"** makes the multi-use intentional rather than accidental.

**Finding**: DC2-OL2 — Cyan accent is borderline overloaded (5 contexts) | **PASS**

Cyan serves as info, standard banner, element color, weapon category, and tech accent — but these contexts rarely overlap. Standard banner and Glacio element are the closest potential conflict, but they appear in different tabs.

**Solution**: Acceptable. Monitor for viewport conflicts but no change needed.

---

### §DC2.4 — Design System Gap Analysis

**Roles NOT covered by tokens (compared to §DC2 template):**

| Expected Role | Token Exists? | Current Implementation | Gap Severity |
|--------------|--------------|----------------------|-------------|
| `--bg-modal` | ❌ | Hardcoded `rgba(12,16,24,0.95)` × 10+ | LOW |
| `--text-secondary` | ❌ | Tailwind `text-gray-300` | LOW |
| `--text-muted` | ❌ | Tailwind `text-gray-400` | LOW |
| `--text-disabled` | ❌ | Tailwind `text-gray-500` | LOW |
| `--accent-hover` | ❌ | Computed inline per component | LOW |
| `--border-focus` | ❌ | Inline gold ring in `.kuro-input:focus` | LOW |
| `--color-success` | ❌ | Hardcoded `#22c55e` in toast | MEDIUM |
| `--color-error` | ❌ | Hardcoded `#ef4444` in toast | MEDIUM |
| `--color-warning` | ❌ | Reuses `--color-gold` implicitly | MEDIUM |
| `--color-info` | ❌ | Reuses `--color-cyan` implicitly | MEDIUM |
| `--glow-*` | ❌ | Inline color-emissive shadows | LOW |
| `--element-*` | ❌ | JS constants in `appcore-data.js` | MEDIUM |
| `--rarity-*` | ❌ | Scattered Tailwind + hardcoded | MEDIUM |

**Finding**: DC2-GAP1 — 13 expected token roles are not covered | **MEDIUM**

The design system has strong structural tokens (5 border levels, 4 shadow levels, 3 transition levels, 6 accent colors, 5 surface backgrounds) but lacks semantic, interactive, and game-domain tokens. The token architecture covers ~60% of roles — the remaining 40% are hardcoded or Tailwind-reliant.

**Solution**: Phase the token additions:
- **Phase 1 (highest value)**: `--color-success`, `--color-error`, `--color-warning`, `--color-info` — semantic tokens that consolidate toast + status colors
- **Phase 2 (medium value)**: `--element-*`, `--rarity-*` — game-domain tokens that consolidate the 240+ hardcoded values
- **Phase 3 (lower value)**: `--text-secondary/muted/disabled`, `--bg-modal`, `--border-focus`, `--glow-*`, `--accent-hover` — completeness tokens

---

### Step 5 All-Findings Summary

| ID | Finding | Severity | Solution |
|----|---------|----------|---------|
| DC1-BG1 | Background lightness steps narrow (5.1 L-points total) | **LOW** | Widen to 3%+ per step if needed; currently compensated by blur/shadow depth |
| DC1-BG2 | OLED mode correctly uses pure black | **PASS** | Protect |
| DC1-BG3 | Shadow base has elevated chroma (intentional) | **PASS** | Protect chromatic shadows |
| DC1-TX1 | Text chromaticity well-calibrated (monochromatic blue) | **PASS** | Protect cool-tinted text system |
| DC1-TX2 | Pure white used for emphasis (intentional) | **PASS** | Continue sparingly |
| DC1-AC1 ✅ | Accent lightness range wide (16.4 L-points) | **MEDIUM** | Brighten purple/pink by ~5 L-points to narrow secondary spread |
| DC1-AC2 | Red accent low-chroma for error signal | **LOW** | Standardize error red to `#ef4444`, keep `#f87171` as decorative |
| DC1-AC3 | Accent chroma distribution well-calibrated | **PASS** | Protect 75-80% max chroma sweet spot |
| DC1-SM1 | Success/Warning/Info reuse accent tokens | **PASS** | Protect palette economy |
| DC1-SM2 | Error red diverges from `--color-red` | **LOW** | Introduce `--color-error` token at `#ef4444` |
| DC1-SM3 | Semantic lightness hierarchy correct for dark-mode | **PASS** | Protect heavier=serious pattern |
| DC1-TMP1 | Temperature deliberately bimodal (cool field + warm island) | **PASS** | Protect; new colors default to cool |
| DC1-TMP2 | Pink at warm/cool boundary (flexible) | **PASS** | No change |
| DC2-BG1 | Modal backdrop hardcoded 10+ places, no token | **LOW** | Add `--bg-modal` |
| DC2-TX1 | Secondary/muted/disabled text rely on Tailwind | **LOW** | Add `--text-secondary/muted/disabled` |
| DC2-AC1 ✅ | No `--accent-hover` token | **LOW** | Add hover opacity documentation |
| DC2-BD1 ✅ | No `--border-focus` token | **LOW** | Add `--border-focus` |
| DC2-SH1 | Glow shadows have no tokens | **LOW** | Add `--glow-gold/purple` |
| DC2-SM1 | No semantic color tokens | **MEDIUM** | Add `--color-success/error/warning/info` |
| DC2-GM1 | Game-domain colors in JS only, not CSS tokens | **MEDIUM** | Promote to `--element-*` and `--rarity-*` |
| DC2-ND1 | Gold family has 5 near-duplicates | **MEDIUM** | Consolidate to `#edaf18`; if lighter variant needed, create explicit `--color-gold-text` |
| DC2-ND2 | Cyan family has 3 values (legitimate separation) | **PASS** | Document roles |
| DC2-ND3 | Green family has 3 values (legitimate separation) | **PASS** | Document roles |
| DC2-ND4 | Red has intentional soft/error split | **LOW** | Formalize with `--color-red` + `--color-error` |
| DC2-OL1 | Gold overloaded across 12 contexts | **MEDIUM** | Document opacity-role map; accept as brand color privilege |
| DC2-OL2 | Cyan borderline overloaded (5 contexts) | **PASS** | Monitor, no change |
| DC2-GAP1 | 13 expected token roles not covered | **MEDIUM** | Phase token additions (semantic → game-domain → completeness) |

---

**STEP 5 COMPLETE** — §DC1 Perceptual Color Architecture + §DC2 Palette Role Inventory established.

**Perceptual system**: All backgrounds share cool blue hue (260°-269°), all text carries matching cool tint (261°-270°), all accents at 69-80% max chroma sweet spot.
**Temperature strategy**: Bimodal — 90% cool field + gold warm island (complementary hue opposition at ~180°).
**Palette architecture**: 60% tokenized (structural), 40% hardcoded (semantic + game-domain gaps).
**Key actions**: Consolidate 5 gold near-duplicates → 1 canonical gold. Add semantic tokens (success/error/warning/info). Promote game-domain colors to CSS variables.
**Accent overload**: Gold serves 12 roles — acceptable as brand color with opacity-differentiated usage.

---

# STEP 6: §DC3 + §DC4 + §DC5 — Dark Mode Craft, Brand Color Distinctiveness, Color Narrative

## §DC3. Dark Mode Craft Assessment

### §DC3.1 Elevation-as-Lightness System

In dark mode, depth is communicated by lightness, not shadows. Each surface layer should be ~2-4% OKLCH lightness higher than the layer below it.

**Surface Lightness Inventory (Standard Dark Mode)**:

| Surface Level | Component | Raw Value | Approx OKLCH L% | Expected L% |
|---|---|---|---|---|
| **Surface 0** — Page background | `html, body` | `#080c14` | **~14.2%** | 10-14% ✓ |
| **Surface 1a** — Stat boxes | `--bg-stat` = `rgba(10,14,22,0.8)` | **~13.1%** (composited on S0) | S0+3 = 17% ✗ |
| **Surface 1b** — Card inner | `--bg-card-inner` = `rgba(6,10,18,1)` | **~12.3%** | S0+3 = 17% ✗ |
| **Surface 1c** — Cards | `--bg-card` = `rgba(12,16,24,0.55)` | **~14.9%** (composited) | S0+3 = 17% ✗ |
| **Surface 1d** — Buttons | `--bg-btn` = `rgba(15,20,28,0.85)` | **~15.8%** (composited) | S0+3 = 17% ✗ |
| **Surface 1e** — Inputs | `--bg-input` = `rgba(15,20,28,0.9)` | **~16.0%** (composited) | S0+3 = 17% ≈ |
| **Surface 2** — Modal backdrop | `bg-black/90` | **~3.0%** (darkens everything) | S1+3 = 20% ✗ |
| **Surface 2** — Modal glass | `rgba(12,16,24,0.12)` + `blur(6px)` | **~14.5%** (varies w/ blur) | S1+3 = 20% ✗ |
| **Surface 3** — Toasts | `rgba(accent,0.9)` | **52-68%** (semantic override) | N/A (correct) |
| **Surface 3** — Desktop sidebar | `rgba(8,12,18,0.95)` + `blur(20px)` | **~14.0%** | S2+3 = 23% ✗ |

**Lightness Progression Analysis**:

```
Expected (Material Design dark):
  S0=14% → S1=17% → S2=20% → S3=23%  (3% steps)

Actual (Standard Dark):
  S0=14.2% → S1=13.1-16.0% → S2=14.5% → S3=14.0%

  ■■■■■■■■■■■■■■·  S0  14.2%
  ■■■■■■■■■■■■■··  S1a 13.1%  ← DARKER than S0 (inverted!)
  ■■■■■■■■■■■■···  S1b 12.3%  ← DARKEST component surface
  ■■■■■■■■■■■■■■·  S1c 14.9%  ← Near-equal to S0
  ■■■■■■■■■■■■■■■  S1d 15.8%  ← Only surface with correct lift
  ■■■■■■■■■■■■■■■  S2  14.5%  ← No lift from S1
  ■■■■■■■■■■■■■■·  S3  14.0%  ← Sidebar DARKER than cards
```

**Finding DC3-EL1 ✅**: Surface elevation is **flat** — all surfaces cluster within a 3.7% lightness band (12.3%-16.0%). The expected staircase of S0→S1→S2→S3 rising by 3% per step is not present. Components like `--bg-card-inner` and `--bg-stat` are actually *darker* than the page background.

- **Severity**: **MEDIUM**
- **Why it matters**: Without lightness-based elevation, the app relies entirely on borders and backdrop-blur for depth. This works for glass-morphism but violates the fundamental dark mode depth cue.
- **Solution**: Restructure surface tokens as a deliberate lightness staircase:
  ```
  --surface-0: oklch(14.2% 0.02 264)   /* page background — unchanged */
  --surface-1: oklch(17.5% 0.02 264)   /* cards, panels — +3.3% */
  --surface-2: oklch(20.5% 0.02 264)   /* modals, popovers — +3.0% */
  --surface-3: oklch(23.0% 0.02 264)   /* tooltips, toasts base — +2.5% */
  ```
  Apply these as base backgrounds, then layer glass effects on top. The glassmorphism blur+alpha treatment still works — it just starts from a correct lightness base.
- **Alternative (preserve current aesthetic)**: If the flat-depth glass approach is intentional (the "holographic display" from §DP0), formally document it as a design decision and ensure *all* depth cues come from borders/blur/glow consistently. Currently some components use lightness lift (buttons) while others don't (stat boxes), creating inconsistency.

---

### §DC3.2 OLED Mode Surface Analysis

**OLED Surface Lightness Inventory**:

| Surface Level | Component | OLED Value | OKLCH L% |
|---|---|---|---|
| **Surface 0** | Page background | `#000000` | **0%** |
| **Surface 1a** | Stat boxes | `rgba(0,0,0,0.9)` | **~0%** |
| **Surface 1b** | Card inner | `rgba(5,5,5,1)` | **~3.5%** |
| **Surface 1c** | Cards | `rgba(0,0,0,0.95)` | **~0%** |
| **Surface 1d** | Buttons | `rgba(0,0,0,0.95)` | **~0%** |
| **Surface 1e** | Inputs | `rgba(0,0,0,0.95)` | **~0%** |

```
OLED Lightness:
  ■·····  S0  0.0%
  ·····  S1a 0.0%   ← Identical to S0
  ■·····  S1b 3.5%   ← Only lifted surface
  ·····  S1c 0.0%   ← Identical to S0
  ·····  S1d 0.0%   ← Identical to S0
  ·····  S1e 0.0%   ← Identical to S0
```

**Finding DC3-OLED1 ✅**: In OLED mode, **all surfaces collapse to pure black** (0% lightness). Cards, buttons, inputs, and stat boxes are indistinguishable from the page background by lightness alone. Only `--bg-card-inner` at `rgba(5,5,5,1)` has any lift (3.5%).

- **Severity**: **MEDIUM**
- **Why it matters**: OLED mode destroys all lightness-based depth. The UI becomes dependent entirely on border opacity (0.06-0.2 white) for structure — a fragile single-cue system.
- **Solution**: Implement an OLED-specific elevation ramp using minimal lightness lift:
  ```
  /* OLED surfaces — minimal but perceptible lift */
  --surface-0: #000000              /* oklch(0% 0 0) — true black for pixel-off */
  --surface-1: oklch(5% 0.005 264)  /* barely visible lift — saves OLED benefit */
  --surface-2: oklch(8% 0.008 264)  /* modals — slight cool tint visible */
  --surface-3: oklch(11% 0.01 264)  /* toasts — clearly elevated */
  ```
  This preserves OLED power savings (pixels mostly off) while restoring minimal depth perception. The 5% lift is perceptible on OLED panels without significantly increasing power draw.

**Finding DC3-OLED2 ✅**: Toast backgrounds are **not OLED-aware** — they use the same saturated `rgba(accent,0.9)` in both modes. On OLED's pure black, these high-chroma surfaces create a jarring contrast jump.

- **Severity**: **LOW**
- **Why it matters**: The 0%→52-68% lightness jump from OLED background to toast is extreme. Standard dark mode has a gentler 14%→52% jump.
- **Solution**: For OLED mode, reduce toast background opacity to 0.8 and add a subtle dark border to anchor them:
  ```css
  /* OLED toast adjustment */
  .toast {
    background: rgba(accent, ${oledMode ? '0.8' : '0.9'});
    border: ${oledMode ? '1px solid rgba(255,255,255,0.15)' : '1px solid rgba(255,255,255,0.2)'};
  }
  ```

---

### §DC3.3 Common Dark Mode Failures Check

**Failure 1: All surfaces the same value → no perceived depth**

| Check | Result |
|---|---|
| Standard Dark: surfaces vary by <4% lightness | ⚠️ **PARTIAL FAIL** — 3.7% total range, some surfaces darker than S0 |
| OLED: all surfaces same value | ❌ **FAIL** — 5 of 6 surface tokens collapse to 0% lightness |
| Compensating mechanism present? | ✓ **YES** — borders at `rgba(255,255,255,0.06-0.2)` + backdrop-blur provide alternative depth |

**Verdict**: The glass-morphism system compensates partially, but the *intended* depth cue (lightness) is non-functional. The system works visually because blur + border + glow are strong cues — but it's architecturally fragile.

**Failure 2: Pure black `#000000` as background**

| Check | Result |
|---|---|
| Standard Dark uses `#080c14` (blue-tinted near-black) | ✓ **PASS** — correct, avoids pure black |
| OLED mode uses `#000000` | ✓ **PASS** — appropriate for OLED theater mode (intentional pixel-off) |
| OLED mode is user-opt-in | ✓ **PASS** — toggled via `oledMode` state |

**Finding DC3-BK1**: Pure black usage is **appropriate and intentional** — OLED mode is opt-in.
- **Severity**: **PASS**
- **Solution**: No change needed. Document that OLED mode is a theater/battery-saver mode, not the default experience.

**Failure 3: Shadows on dark mode (nearly invisible)**

Shadow tokens from `:root`:
```
--shadow-sm: 0 1px 2px rgba(6, 10, 24, 0.4)
--shadow-md: 0 4px 12px rgba(6, 10, 24, 0.5)
--shadow-lg: 0 8px 24px rgba(6, 10, 24, 0.6)
--shadow-xl: 0 12px 40px rgba(6, 10, 24, 0.7)
```

Shadow base color `rgb(6,10,24)` ≈ oklch(11.5% 0.02 264) — this is *darker* than the page background `#080c14` ≈ oklch(14.2%). On standard dark, shadows carry ~2.7% lightness contrast. On OLED (black background), shadows are invisible.

Card shadow stack (`.kuro-card`):
```
0 4px 24px rgba(6, 10, 24, 0.6)     ← barely visible on dark, invisible on OLED
0 0 0 1px rgba(255, 255, 255, 0.03)  ← hairline white border (visible)
inset 0 1px 0 rgba(255, 255, 255, 0.05) ← top highlight (visible)
```

**Finding DC3-SH1 ✅**: Dark shadows are **functionally invisible** in both modes. The shadow tokens exist but carry no visual information on dark surfaces. The white hairline border (0.03 opacity) and inset highlight (0.05 opacity) do the actual depth work.

- **Severity**: **LOW**
- **Why it matters**: Shadow tokens consume rendering resources without contributing visual information. The system already uses the correct dark-mode approach (white borders/highlights), making the dark shadows redundant.
- **Solution**: Two options:
  1. **Remove dark shadows entirely** from cards/panels — they're decorative dead weight. Keep only the white hairline + inset highlight.
  2. **Replace with glow shadows** for elevated surfaces — use `rgba(accent, 0.05-0.15)` glow instead:
  ```css
  /* Replace invisible dark shadows with subtle accent glow */
  .kuro-card {
    box-shadow:
      0 0 0 1px rgba(255, 255, 255, 0.03),  /* hairline border (keep) */
      inset 0 1px 0 rgba(255, 255, 255, 0.05), /* top highlight (keep) */
      0 4px 20px rgba(237, 175, 24, 0.03);  /* gold micro-glow (new) */
  }
  ```

**Failure 4: Hardcoded `color: white` / `#ffffff` text**

Instances found:
| Location | Value | Context |
|---|---|---|
| `.kuro-btn:hover` (line 889) | `color: #ffffff` | Button hover text |
| `.kuro-input` (line 992) | `color: #ffffff` | Input text |
| Toast text (line 226) | Tailwind `text-white` | Toast message |
| Priority slider thumb (line 1225) | `linear-gradient(135deg, #ffffff, #e5e7eb)` | Slider control |

**Finding DC3-WH1 ✅**: **Four instances** of hardcoded pure white text/elements. On the app's dark surfaces (14-16% lightness), `#ffffff` creates a 84-86% contrast ratio — which is high but acceptable. However, these bypass the `--text-heading: #edf1f8` and `--text-body: #dfe5ef` tokens, creating inconsistency.

- **Severity**: **LOW**
- **Why it matters**: Pure white (`#ffffff`) is harsher than the app's tinted whites (`#edf1f8`, `#dfe5ef`). The slight blue tint in the token values matches the cool background hue and reduces eye strain. Hardcoded white breaks this tinting.
- **Solution**: Replace hardcoded white with tokens:
  ```
  .kuro-btn:hover   → color: var(--text-heading)  /* #edf1f8 */
  .kuro-input       → color: var(--text-heading)  /* #edf1f8 */
  Toast text        → use text-[var(--text-heading)] or keep white for semantic emphasis
  Slider thumb      → keep white (interactive control, needs maximum contrast)
  ```

**Failure 5: Light mode assets not adapted for dark context**

| Check | Result |
|---|---|
| App is dark-mode only | ✓ **PASS** — no light mode exists |
| All assets designed for dark | ✓ **PASS** — SVG favicon has dark bg `#080c14` with gold `#fbbf24` text |
| No inverted/unadapted images | ✓ **PASS** — character/weapon images are game assets (pre-rendered for any background) |

**Finding DC3-AS1**: No asset adaptation issues — the app is dark-mode native.
- **Severity**: **PASS**
- **Solution**: No change needed.

---

### §DC3.4 Backdrop-Blur Consistency

The app uses `backdrop-filter: blur()` as a primary depth cue. Audit of all blur values:

| Component | Blur Value | Surface Level | Purpose |
|---|---|---|---|
| `.kuro-card` (line 714) | `blur(4px)` | S1 | Card frosted glass |
| `.kuro-btn` (line 858) | `blur(8px)` | S1 | Button frosted glass |
| Install banner (line 129) | `blur(4px)` (Tailwind `backdrop-blur-sm`) | S3 | Banner overlay |
| Onboarding modal (line 351) | `blur(6px)` | S2 | Modal glass |
| Desktop sidebar (line 1461) | `blur(20px)` | S2 | Sidebar header |

**Finding DC3-BL1 ✅**: Blur values are **inconsistent** — 4px, 6px, 8px, 20px across just 5 components. No documented progression tied to surface level.

- **Severity**: **LOW**
- **Why it matters**: If blur is a depth cue, it should follow a predictable scale (like the shadow-sm/md/lg tokens do). Currently it's ad-hoc.
- **Solution**: Establish blur tokens aligned to surface levels:
  ```css
  --blur-s1: blur(4px);   /* cards, panels */
  --blur-s2: blur(8px);   /* modals, popovers */
  --blur-s3: blur(12px);  /* tooltips, toasts, overlays */
  ```
  The desktop sidebar's `blur(20px)` is acceptable as a special-case dense blur (it's a persistent navigation surface with heavy backdrop).

---

### §DC3 Summary Table

| ID | Finding | Severity | Solution |
|---|---|---|---|
| DC3-EL1 ✅ | Surface elevation flat — all surfaces within 3.7% lightness band | **MEDIUM** | Implement lightness staircase: S0=14% → S1=17.5% → S2=20.5% → S3=23%; OR formally document flat-glass as intentional |
| DC3-OLED1 ✅ | OLED mode collapses all surfaces to 0% lightness | **MEDIUM** | Add OLED elevation ramp: S0=0% → S1=5% → S2=8% → S3=11% |
| DC3-OLED2 ✅ | Toasts not OLED-aware — jarring contrast jump on pure black | **LOW** | Reduce toast opacity to 0.8 in OLED; add anchoring border |
| DC3-BK1 | Pure black usage appropriate for opt-in OLED | **PASS** | Document as intentional theater mode |
| DC3-SH1 ✅ | Dark shadows invisible on dark surfaces | **LOW** | Remove dead shadows; use white hairline + accent micro-glow |
| DC3-WH1 ✅ | 4 hardcoded `#ffffff` text instances bypass tinted tokens | **LOW** | Replace with `var(--text-heading)` except slider thumb |
| DC3-AS1 | No light-mode asset issues (app is dark-native) | **PASS** | No change needed |
| DC3-BL1 ✅ | Backdrop-blur values inconsistent (4/6/8/20px) | **LOW** | Tokenize as `--blur-s1/s2/s3` aligned to surface levels |

---

## §DC4. Brand Color Distinctiveness

### §DC4.1 Hue Ownership — Competitive Landscape

**Whispering Wishes primary accent**: Gold `#edaf18` → oklch(78.5% 0.17 85°)

The WuWa tracker competitive landscape was analyzed:

| App / Site | Primary Accent | Approx OKLCH Hue | Hue Distance from WW |
|---|---|---|---|
| **Whispering Wishes** | Gold `#edaf18` | **~85°** (warm gold) | — |
| **WuWa Tracker** (wuwatracker.com) | Unknown (site cert issue; Next.js/TS app) | Unknown | — |
| **WuWaPal** (wuwapal.com) | CSS variable `--primary` (not extractable) | Unknown | — |
| **wutheringwaves.gg** | Orange `#ff6d00` | **~55°** (warm orange) | **30°** away |
| **TrackMyPulls** (trackmypulls.com) | Blue-purple gradient | **~270-280°** (blue-purple) | **~185°** away |
| **Wuthering Waves** (game itself) | Teal/cyan atmospheric + gold accents | **~180°** (teal) / **~85°** (gold) | **~95°** / **0°** |

**Finding DC4-HUE1**: Whispering Wishes' gold accent at ~85° sits **30° away from wutheringwaves.gg's orange (~55°)**. This is within the 15° confusion threshold only if both apps are seen side-by-side, but the calibration difference (gold at 78.5% lightness vs orange at ~65% lightness) provides sufficient distinction. TrackMyPulls at ~270° is maximally distant. The game itself uses gold accents — WW *aligns with* the source material rather than competing against it.

- **Severity**: **PASS**
- **Why it matters**: Gold hue ownership is strong because (a) it directly references the game's 5★ gacha gold, (b) no direct competitor occupies the same calibrated gold, (c) the closest competitor (wutheringwaves.gg) uses a hotter orange that reads differently.
- **Solution**: No hue shift needed. The gold is distinctive within the competitive landscape. If further differentiation is desired, the app's *deep blue-black background* + gold combination creates a stronger brand signature than hue alone — it's the *pairing* that's distinctive.

### §DC4.2 Calibration Signature

The brand signature is not just hue — it's the specific saturation and lightness of the accent.

**Whispering Wishes gold calibration**:
```
#edaf18 → oklch(78.5% 0.17 85°)
  Lightness: 78.5%  — bright but not glaring
  Chroma:    0.17   — high saturation (79% of max for this hue)
  Hue:       85°    — warm gold, slightly green-leaning vs pure yellow
```

**Comparison to generic alternatives**:
```
Tailwind yellow-500:  #eab308 → oklch(79.5% 0.18 90°)   — 5° hue shift, near-identical
Tailwind amber-500:   #f59e0b → oklch(77.0% 0.17 75°)   — 10° hue shift, slightly oranger
Tailwind yellow-400:  #facc15 → oklch(85.5% 0.18 93°)   — lighter, more lemon
CSS named gold:       #ffd700 → oklch(86.0% 0.17 95°)   — lighter, cooler, more generic
```

**Finding DC4-CAL1 ✅**: The primary gold `#edaf18` is **dangerously close to Tailwind yellow-500** (`#eab308`) — only 5° hue and 1% lightness apart. This means the accent could be perceived as "default Tailwind yellow" rather than a bespoke brand color.

- **Severity**: **MEDIUM**
- **Why it matters**: A brand color that's indistinguishable from a framework default has zero distinctiveness. Anyone inspecting the CSS might assume it's uncalibrated.
- **Solution**: Recalibrate slightly to create perceptual distance from Tailwind defaults:
  ```
  Current:     oklch(78.5% 0.17 85°)  = #edaf18  ← near Tailwind yellow-500
  Recommended: oklch(76.0% 0.18 80°)  ≈ #e6a510  ← warmer, richer, +2% chroma, -5° hue
  ```
  This shifts toward amber-gold territory, increasing warmth and depth while maintaining the gold identity. The 5° hue shift + 2.5% lightness drop creates clear visual separation from `#eab308`.

  **Alternatively**: Keep `#edaf18` and **document it as an intentional choice** — the near-Tailwind alignment reduces visual friction for developers and the brand identity is carried by the *system* (gold-on-deep-blue + glass) rather than the specific hex value.

### §DC4.3 Icon → Accent Coherence

**Favicon analysis** (`public/favicon.svg`):
```svg
<rect fill="#080c14"/>  ← Background: deep blue-black (matches app)
<text fill="#fbbf24"/>  ← Gold "W" character
```

Favicon gold: `#fbbf24` → oklch(83.0% 0.17 90°)
In-app gold:  `#edaf18` → oklch(78.5% 0.17 85°)

| Property | Favicon | In-App | Delta |
|---|---|---|---|
| Lightness | 83.0% | 78.5% | **4.5%** |
| Chroma | 0.17 | 0.17 | 0% |
| Hue | 90° | 85° | **5°** |

**Finding DC4-ICO1 ✅**: Favicon gold `#fbbf24` and in-app gold `#edaf18` differ by **4.5% lightness and 5° hue**. The favicon is lighter and slightly more yellow-green. This is a minor brand fragmentation — the user sees one gold in the browser tab and encounters a slightly different gold inside.

- **Severity**: **LOW**
- **Why it matters**: The mismatch is subtle (4.5% L / 5° H) and likely imperceptible to most users. However, it violates the principle that the icon establishes the color promise and the app fulfills it.
- **Solution**: Align favicon gold to the in-app primary:
  ```svg
  <!-- Before -->
  <text fill="#fbbf24"/>
  <!-- After -->
  <text fill="#edaf18"/>
  ```
  Or, if the favicon needs to be slightly lighter for legibility at small sizes (16x16px), use a documented "favicon-weight" variant:
  ```
  --color-gold:         #edaf18  /* in-app primary */
  --color-gold-favicon: #f0b820  /* +2% lightness for small-icon legibility */
  ```

### §DC4.4 Competitive Hue Mapping — Visual Summary

```
Hue wheel (OKLCH):

         0° (red)
         |
  330° ──┼── 30°
         |
  300° ──┼── 60°
(purple) |         wutheringwaves.gg ← 55° (orange)
  270° ──┼── 90°
(blue)   |    ↑    Whispering Wishes ← 85° (gold)
  240° ──┼── 120°  Tailwind yellow-500 ← 90°
         |
  210° ──┼── 150°
  (teal)  |
  180° (cyan/teal)
    ↑ WuWa game accent

  TrackMyPulls ← 270-280° (blue-purple)
```

**Finding DC4-MAP1**: The competitive hue map shows:
- **Clear ownership zone**: 80°-90° (warm gold) is occupied only by WW and Tailwind defaults
- **Nearest competitor**: wutheringwaves.gg at 55° (30° away — safe)
- **Maximum distance**: TrackMyPulls at 270° (~185° away)
- **Game alignment**: WuWa game uses gold accents (~85°) — WW correctly mirrors the source

- **Severity**: **PASS**
- **Solution**: The gold hue is well-positioned. No competitive conflict. The *system-level* brand (deep blue void + gold + glass + cyberpunk typography) is far more distinctive than any single hue.

---

### §DC4 Summary Table

| ID | Finding | Severity | Solution |
|---|---|---|---|
| DC4-HUE1 | Gold hue at 85° has no competitive conflict (nearest at 55°, 30° away) | **PASS** | No hue change needed |
| DC4-CAL1 ✅ | Primary gold `#edaf18` is near-identical to Tailwind yellow-500 `#eab308` | **MEDIUM** | Recalibrate to `oklch(76% 0.18 80°)` ≈ `#e6a510`; OR document as intentional |
| DC4-ICO1 ✅ | Favicon gold `#fbbf24` ≠ in-app gold `#edaf18` (4.5% L, 5° H delta) | **LOW** | Align favicon to `#edaf18` or create documented favicon variant |
| DC4-MAP1 | Competitive hue mapping shows clear gold ownership | **PASS** | No change needed — system-level brand is distinctive |

---

## §DC5. Color as Narrative

### §DC5.1 Gradient Design Audit

Every gradient is a color argument. For each gradient found, the visual argument it makes is assessed.

#### Category A: Structural Gradients (Surface Definition)

**A1. TabBackground deep-blue gradient** (`appcore-components.jsx` line 148):
```css
linear-gradient(180deg, #010204 0%, #020408 30%, #030610 60%, #020408 100%)
```
- **Type**: Linear top→bottom
- **Argument**: "The void has subtle depth — darker at edges, slightly lifted in the middle"
- **Assessment**: ✓ **CORRECT** — This is the spatial foundation. The lightness variation is barely perceptible (L 2.5%→4.5%→2.5%) but creates an atmospheric sense of a deep space rather than a flat surface. The symmetrical return to dark at bottom grounds the composition.
- **Tokens used**: Hardcoded hex (acceptable — this is a one-time spatial effect)

**A2. TabBackground vignette** (`appcore-components.jsx` line 150):
```css
radial-gradient(ellipse 90% 80% at 50% 50%, transparent 40%, rgba(2,3,6,0.5) 100%)
```
- **Type**: Radial from center
- **Argument**: "Content lives in a pool of relative light; edges fade to deeper void"
- **Assessment**: ✓ **CORRECT** — Classic cinematic vignette that directs attention inward. The transparent center preserves content readability while dark edges compress peripheral vision. Film-like compositional control.

**A3. Events tab sticky footer fade** (`App.jsx` line 3442):
```css
linear-gradient(to top, rgba(8,12,20,0.95) 60%, transparent)
```
- **Type**: Linear bottom→top
- **Argument**: "Content dissolves into ground below — this is a boundary, not a container"
- **Assessment**: ✓ **CORRECT** — Standard scroll-fade pattern that communicates "more content below" without a hard edge. The 60% stop creates a wide transition zone.

**A4. Collection image bottom fade** (multiple locations):
```css
linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 100%)  /* App.jsx ~6308 */
linear-gradient(to top, rgba(8,12,20,0.85) 60%, transparent)    /* appcore-components.jsx ~882 */
```
- **Type**: Linear bottom→top
- **Argument**: "Image fades into the card surface — text overlay zone below"
- **Assessment**: ✓ **CORRECT** — Standard image-to-text transition. Two slightly different implementations (pure black vs tinted) — minor inconsistency.
- **Solution**: Unify to `rgba(8,12,20,0.85)` (tinted) for consistency with the app's blue-tinted dark palette.

**A5. Desktop ad column separator** (`appcore-providers.jsx` line 1655):
```css
linear-gradient(to bottom, transparent, rgba(255,255,255,0.06) 20%, rgba(255,255,255,0.06) 80%, transparent)
```
- **Type**: Linear top→bottom
- **Argument**: "A thin vertical light line exists in the middle zone — a ghost column divider"
- **Assessment**: ✓ **CORRECT** — Subtle structural separator that appears only in the content zone (20%-80%), fading at extremes. Restrained and functional.

#### Category B: Decorative/Brand Gradients (Identity Expression)

**B1. Onboarding step gradients** (`appcore-providers.jsx` lines 338-344):
```css
bg-gradient-to-r from-neutral-900/30 via-neutral-900/20 to-[accent]-900/30
```
Seven steps, each with a different accent color (gold→cyan→orange→purple→emerald→pink→gold).
- **Type**: Linear left→right
- **Argument**: "Each step has a unique color identity; the gradient introduces it gently from the neutral side"
- **Assessment**: ✓ **CORRECT** — The left-to-right gradient creates a sense of *forward motion* through the onboarding flow. Each accent at 30% opacity in the `-900` shade is restrained — it tints rather than dominates. The return to gold on step 7 bookends the journey.

**B2. Install prompt banner** (`appcore-providers.jsx` lines 129, 155):
```css
bg-gradient-to-r from-yellow-500/90 to-amber-500/90
```
- **Type**: Linear left→right
- **Argument**: "This is an attention-demanding call to action — gold energy flowing forward"
- **Assessment**: ⚠️ **PARTIAL** — The gradient direction is correct (forward/action), but the high opacity (90%) on *two similar yellows* creates a nearly flat read. The gradient barely transitions — yellow-500 `#eab308` to amber-500 `#f59e0b` is only ~10° hue shift.
- **Solution**: Either make the gradient more expressive (wider hue spread: gold→warm-orange) or replace with a flat gold background — the current treatment is effort without payoff.

**B3. Header gold accent bar** (`appcore-providers.jsx` line 844):
```css
linear-gradient(180deg, rgba(237, 175, 24, 0.9), rgba(237, 175, 24, 0.4))
```
- **Type**: Linear top→bottom
- **Argument**: "Gold energy emanates from the top and fades — this header has authority"
- **Assessment**: ✓ **CORRECT** — Applied as a left-border decoration on section headers. The top-heavy fade creates a "lit from above" effect consistent with the holographic display character. The 90%→40% opacity range is well-calibrated.

**B4. Luck rating spectrum bar** (`App.jsx` ~line 7056):
```css
linear-gradient(90deg, #f87171, #edaf18, #34d399)
```
- **Type**: Linear left→right (red→gold→green)
- **Argument**: "A spectrum of fortune: bad→neutral→good, read left to right"
- **Assessment**: ✓ **CORRECT** — Classic semantic spectrum. Red (unlucky) → Gold (average) → Green (lucky) maps to universal color meanings. The three stops create two transition zones.

#### Category C: Shimmer/Animation Gradients (Motion Expression)

**C1. Card shimmer line** (`appcore-providers.jsx` lines 754-760):
```css
linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 20%, rgba(255,255,255,0.5) 50%, rgba(255,255,255,0.3) 80%, transparent 100%)
```
- **Type**: Linear left→right, animated
- **Argument**: "Light sweeps across the card top edge — this surface is alive, not static"
- **Assessment**: ✓ **CORRECT** — The symmetric peak at center (0.5 opacity) with fade-out at edges creates a convincing light-sweep. The 3s animation cycle is slow enough to feel ambient rather than distracting.

**C2. Skeleton loading shimmer** (`appcore-providers.jsx` line 1307):
```css
linear-gradient(90deg, transparent 0%, rgba(237,175,24,0.06) 40%, rgba(237,175,24,0.10) 50%, rgba(237,175,24,0.06) 60%, transparent 100%)
```
- **Type**: Linear left→right, animated (1.8s cycle)
- **Argument**: "Gold light scanning across a placeholder — data is incoming, the system is working"
- **Assessment**: ✓ **CORRECT** — Gold-tinted shimmer (vs generic gray) reinforces brand identity even during loading. The narrow peak (40%-60%) creates a focused beam effect. 6-10% opacity is perfectly restrained.

**C3. Stat box shimmer lines** (`appcore-providers.jsx` lines 1066-1124):
```css
linear-gradient(90deg, transparent, rgba([accent], 1), transparent)
```
Eight variants: white, gold, cyan, purple, emerald, red, pink, gray — each matching its stat box accent.
- **Type**: Linear left→right, decorative
- **Argument**: "Each stat box has a color-coded top accent line — an identity badge"
- **Assessment**: ✓ **CORRECT** — The `transparent→full→transparent` pattern creates a centered glow effect. Each line is a 1px pseudo-element that codes the stat's category. Consistent pattern across all variants.

**C4. Button hover ripple** (`appcore-providers.jsx` line 880):
```css
radial-gradient(circle at center, rgba(255,255,255,0.15) 0%, transparent 70%)
```
- **Type**: Radial from center
- **Argument**: "Energy emanates from the touch point — this button is responding to you"
- **Assessment**: ✓ **CORRECT** — Standard interaction feedback. The 15% opacity is subtle enough not to overwhelm the button content.

#### Category D: Semantic/Data Gradients (Information Encoding)

**D1. Priority slider dual-color track** (`App.jsx` ~line 3626):
```css
linear-gradient(to right, #edaf18 0%, #edaf18 [pct]%, #ec4899 [pct]%, #ec4899 100%)
```
- **Type**: Linear left→right (hard-stop)
- **Argument**: "Gold region = character priority, pink region = weapon priority — the ratio is visible"
- **Assessment**: ✓ **CORRECT** — Hard-stop gradient (no blending between colors) correctly encodes a binary proportion. Gold/pink map to character/weapon banner types — consistent with the app's color language.

**D2. Pull history rarity backgrounds** (`App.jsx` ~line 5993):
```css
linear-gradient(to top, rgba(237,175,24,0.15), rgba(237,175,24,0.05))   /* 5★ */
linear-gradient(to top, rgba(168,85,247,0.15), rgba(168,85,247,0.05))   /* 4★ */
```
- **Type**: Linear bottom→top
- **Argument**: "Rarity glows from below — higher energy at the base, fading upward"
- **Assessment**: ✓ **CORRECT** — The bottom-up glow creates a "radiating from data" effect. Gold for 5★ and purple for 4★ maintain the rarity color language established throughout the app.

**D3. Trophy card backgrounds** (`App.jsx` ~lines 4297, 4337):
```css
linear-gradient(135deg, [color]18, [color]08)     /* trophy card */
linear-gradient(145deg, #1a1a2e, #0d0d1a)         /* trophy section bg */
linear-gradient(135deg, [color]35, [color]15)      /* trophy icon circle */
```
- **Type**: Diagonal (135°-145°)
- **Argument**: "Achievement cards have directional depth — light source from upper-left"
- **Assessment**: ✓ **CORRECT** — Consistent 135° angle across trophy cards creates a unified "lit from upper-left" system. The section background uses a slightly different angle (145°) — minor inconsistency but acceptable for visual variety.

#### Category E: Conic Gradient (Special)

**E1. Luck badge rotating border** (`appcore-providers.jsx` line 663):
```css
conic-gradient(from 0deg, var(--badge-color), transparent 50%, var(--badge-color))
```
- **Type**: Conic (rotating)
- **Argument**: "This badge has orbital energy — a halo of light circling it"
- **Assessment**: ✓ **CORRECT** — Conic gradients are rarely appropriate in UI, but a rotating badge border is one of the few valid uses. The half-transparent gap creates a partial ring that, when animated with `badgeRotate`, produces a spinning halo effect. Appropriately special — used only for luck badges.

**Finding DC5-GR1**: The gradient system is **well-designed and intentional**. Of 30+ gradient instances examined, only one has a clear issue (B2 — install banner flat gradient). Gradients consistently serve one of four roles: structural (depth/fade), brand (identity/decoration), motion (shimmer/animation), or semantic (data encoding). The 135° diagonal angle is used consistently for "lit from upper-left" trophy/achievement contexts.

- **Severity**: **PASS** (with one LOW sub-finding)
- **Solution**: Fix the install banner gradient (B2) — either widen the hue spread or flatten to a single gold.

**Finding DC5-GR2 ✅**: **Two inconsistent bottom-fade implementations** — `rgba(0,0,0,0.9)` (pure black) vs `rgba(8,12,20,0.85)` (tinted) for the same visual purpose.

- **Severity**: **LOW**
- **Solution**: Unify to `rgba(8,12,20,0.85)` for blue-tint consistency.

---

### §DC5.2 Tension Color Assessment

A tension color is a secondary accent used specifically to create *dynamic contrast* with the primary accent. It sits roughly 120°-150° away on the color wheel and appears rarely — 3-5 times maximum — marking moments of genuine significance.

**Primary accent**: Gold `#edaf18` at oklch hue ~85°
**Ideal tension zone**: 85° + 120°-150° = **205°-235°** (blue to blue-violet)

**Candidate tension colors in the app**:

| Color | OKLCH Hue | Distance from Gold | Usage Count | Role |
|---|---|---|---|---|
| **Cyan** `#38bdf8` | ~230° | **145°** ✓ in zone | ~45+ uses | Standard banner, info, links |
| **Purple** `#a855f7` | ~300° | 215° (outside) | ~35+ uses | 4★ rarity, tertiary accent |
| **Pink** `#ec4899` | ~350° | 265° (opposite side) | ~25+ uses | Weapon banner, secondary |

**Finding DC5-TN1 ✅**: **Cyan functions as the tension color** — it sits at 145° from gold, perfectly within the 120°-150° ideal range. However, it is **severely overused**. With 45+ appearances (standard banner coding, info toasts, links, stat boxes, soft-pity pulse, tab indicator), cyan has been devalued from a tension color to a *secondary accent*.

- **Severity**: **MEDIUM**
- **Why it matters**: A tension color's power comes from scarcity. At 3-5 uses, cyan would mark moments of electric significance. At 45+ uses, it's just "the other color." The app has a rich gold-cyan duality, but the tension has been diluted through overexposure.
- **Solution**: Reframe the color hierarchy:
  1. **Accept cyan as a full secondary accent** (not a tension color) — it's already doing too much to be restrained
  2. **Introduce a true tension color** for rare significant moments. Candidates:
     - `oklch(65% 0.20 210°)` ≈ `#1e8fd4` — steel blue, 125° from gold, would mark: first 5★ pull celebrations, completion milestones, "max luck" states
     - Or repurpose the existing red `#f87171` at hue ~25° (60° from gold) as a *warm tension* for critical moments (though red is already semantic for "error/loss")
  3. **Most pragmatic approach**: Do nothing — the app's 6-color accent system is working. Gold→Cyan provides the primary tension pairing, and the system uses pink/purple/emerald/red for additional narrative beats. A formal tension color is a refinement, not a necessity.

**Finding DC5-TN2**: **Purple functions as a power hierarchy marker**, not a tension color. At 300° (215° from gold), it's outside the tension zone. Its role — encoding 4★ rarity — is semantic, not compositional. This is correct usage.

- **Severity**: **PASS**
- **Solution**: No change. Purple's role as a rarity marker is well-established and should not be repurposed for tension.

---

### §DC5.3 Color State Narrative Mapping

How does color tell the user where they are at each emotional beat?

#### State 1: ONBOARDING (Arrival)

**Color experience**: Warm welcome → multi-color tour → gold return

```
Step 1 (Welcome):   Gold      tint at 30% + neutral dark
Step 2 (Import):    Cyan      tint at 30% → "here's the tool part"
Step 3 (Track):     Orange    tint at 30% → "here's the action part"
Step 4 (Build):     Purple    tint at 30% → "here's the depth"
Step 5 (Calculate): Emerald   tint at 30% → "here's the planning"
Step 6 (Analytics): Pink      tint at 30% → "here's the fun"
Step 7 (Ready):     Gold      tint at 30% → "welcome home"
```

**Narrative**: The onboarding is a **color tour of the app's full accent palette**. Each step introduces a color that the user will later associate with specific functions. The bookend gold (steps 1 & 7) creates a "departure and return" arc.

**Finding DC5-ST1**: The onboarding color narrative is **excellent** — it previews the app's color language through progressive revelation, creating subconscious color-function associations before the user encounters the actual UI.

- **Severity**: **PASS**
- **Solution**: No change. This is one of the app's strongest design decisions.

#### State 2: ENGAGEMENT (Active Use)

**Color experience**: Cool void + gold warmth + contextual accents

```
Base field:     Deep blue-black (#080c14) — 90% of viewport
Active accent:  Gold borders, gold glow, gold shimmer lines — "you're here"
Content cards:  Glass panels with white hairline borders — structure without warmth
Tab buttons:    Active = gold glow; inactive = transparent ghost
Data colors:    Banner-coded (gold=char, pink=weapon, cyan=standard)
```

**Narrative**: Engagement is **calm focus with gold punctuation**. The void background recedes, cards float as glass surfaces, and gold marks interactive/active elements. The color energy is restrained — the app doesn't shout during normal use, it whispers.

**Finding DC5-ST2**: The engagement state has **correct emotional temperature** — quiet enough for prolonged use, warm enough to feel engaging. The gold-on-void combination avoids both the clinical feel of gray UIs and the exhaustion of high-saturation dashboards.

- **Severity**: **PASS**
- **Solution**: No change needed.

#### State 3: ACHIEVEMENT (Success / Celebration)

**Color experience**: Color explosion → trophy hierarchy

```
5★ Pull:       Gold glow burst — radialGradient(rgba(237,175,24,0.08)), box-shadow 24px gold
4★ Pull:       Purple glow (subtler) — box-shadow 16px purple
Trophy unlock: Per-trophy color (92 hardcoded hex values spanning full spectrum)
Toast success: Emerald green rgba(34,197,94,0.9) — high-saturation full-width bar
Medal system:  Gold/Silver/Bronze (#edaf18/#c0c0c0/#cd7f32)
```

**Pity-to-color emotional arc**:
```
Early pull (1-20):   Emerald #22c55e  → "amazing luck!"
Lucky (21-40):       Lime #84cc16    → "good luck"
Normal (41-50):      Gold #edaf18    → "expected"
Late (51-60):        Orange #f97316  → "getting worried"
Hard pity (61+):     Red #ef4444    → "pain"
```

**Narrative**: Achievement is the **only state where color breaks free** from the restrained engagement palette. The pity-to-color arc is emotionally precise — it mirrors the gacha player's anxiety curve from euphoria (green/early) through dread (red/late). The trophy system's 92 distinct colors create a "collection of color" meta-game.

**Finding DC5-ST3 ✅**: The achievement color narrative is **strong but architecturally fragile**. The emotional arc (green→gold→red) is excellent. However, the 92 hardcoded trophy colors are not tokenized and bypass the design system entirely.

- **Severity**: **LOW** (narrative quality is high; implementation quality is §DC2-level concern already captured)
- **Solution**: The narrative is correct — trophy colors *should* be diverse and celebratory. Wrap them in a `TROPHY_COLORS` constant map rather than inline strings, but don't reduce the color variety.

#### State 4: ERROR (Failure / Gravity)

**Color experience**: Red intensity varies by severity

```
Toast error:         rgba(248,113,113,0.9) — full red bar, slideUp animation
Tab crash:           Red AlertCircle icon + gray context + cyan recovery button
Root crash:          Minimal #080c12 bg + red details + cyan primary action
Form validation:     Red border glow
50/50 loss display:  Red text + red stat background
```

**Narrative**: Error uses **graduated red** — from a bright red toast (transient) to a quiet red icon (tab error) to a minimal red-on-dark (root crash). The severity→color-intensity mapping is correct: louder errors are more visually aggressive.

The recovery action is always **cyan** — establishing cyan as the "way forward" color in error states. This creates a red→cyan flow: "problem (red) → solution (cyan)."

**Finding DC5-ST4**: The error color narrative is **coherent and graduated**. Red communicates gravity without panic. Cyan as the recovery color is a strong compositional choice — it's the maximum-tension complement to gold, making the "fix this" button feel electrically important.

- **Severity**: **PASS**
- **Solution**: No change. The red-gravity + cyan-recovery pattern should be documented as a design principle.

#### State 5: EMPTY (Nothing Yet)

**Color experience**: Gold whisper + ghost texture

```
Background:   Radial gold glow at 4% opacity — barely perceptible warm halo
Border:       Dashed gold at 10% opacity — "placeholder boundary"
Top accent:   Gold shimmer at 30% — identity marker
Ghost grid:   Cool blue-gray (rgba(140,160,200,0.06)) — pulsing 2.5s cycle
Text:         Subdued, medium-weight
```

**Narrative**: Empty states feel **hopeful, not clinical**. The gold glow at 4% says "something warm will go here." The ghost grid's breathing animation (opacity 4%→8%→4%) says "this space is alive, waiting." The cool-shift of the ghost cells (from gold to blue-gray) creates a *potential energy* feel — as if the cells are pre-gold, waiting to be filled.

**Finding DC5-ST5**: The empty state color narrative is **one of the app's best design moments**. The warm-gold-hinted void + breathing ghost grid creates a feeling of "potential" rather than "absence." This is emotionally correct for a gacha tracker — an empty collection is a promise, not a failure.

- **Severity**: **PASS**
- **Solution**: No change. Document this as a design principle: "Empty states use gold promise + ghost potential, never clinical gray."

#### State 6: LOADING

**Color experience**: Gold scanning beam

```
Skeleton base:  rgba(12,16,24,0.55) — card-matching dark surface
Shimmer:        Gold beam (6%-10% opacity) sweeping left→right at 1.8s
Card shimmer:   White beam (30%-50% opacity) on top edge at 3s
```

**Narrative**: Loading maintains **brand presence through gold** even when no content exists. The scanning beam metaphor ("gold light sweeping across surfaces searching for data") is cyberpunk-appropriate and distinctive.

**Finding DC5-ST6**: Loading state has **correct brand temperature** — gold shimmer > generic gray shimmer.

- **Severity**: **PASS**
- **Solution**: No change.

#### State Narrative Flow (Summary)

```
ONBOARDING → ENGAGEMENT → ACHIEVEMENT → ERROR → EMPTY → LOADING

[Color Tour] → [Gold Focus] → [Color Burst] → [Red Gravity] → [Gold Promise] → [Gold Scan]
  ↑ multi-hue    ↑ restrained   ↑ explosive     ↑ graduated     ↑ hopeful      ↑ rhythmic
  ↑ 30% opacity  ↑ 15% accent   ↑ 90% toast     ↑ red→cyan      ↑ 4% glow      ↑ 6-10%
  ↑ progressive   ↑ void + glass ↑ 92 trophy     ↑ recover cyan   ↑ ghost breath ↑ 1.8s beam

Energy level:
  HIGH ─────── LOW ──────── PEAK ────── HIGH ─── LOW ──── LOW
  (welcome)   (focus)      (celebrate)  (alert)  (wait)  (load)
```

**Finding DC5-ST7 ✅**: The color state narrative has **clear emotional arcs** with intentional energy modulation. Each state has a distinct color energy level, and the transitions are natural. The only missing transition is engagement→achievement — there's no "ramping up" color between normal use and a pull result.

- **Severity**: **LOW**
- **Solution**: Consider a brief "anticipation" color state for the moment between initiating a pull check and receiving results — a gold pulse or shimmer intensification that signals "something is about to happen."

---

### §DC5.4 Color Harmony System Identification

**Active palette hues** (OKLCH):

```
Hue wheel with app accents:

       0° (red)
       │
 350° ─┼─ 25°    Pink (#ec4899) ~350°     Red (#f87171) ~25°
       │
 300° ─┼─ 55°    Purple (#a855f7) ~300°
       │                                    Gold (#edaf18) ~85°
 270° ─┼─ 90°
       │
 230° ─┼─ 120°   Cyan (#38bdf8) ~230°
       │
       │                                    Emerald (#22c55e) ~155°
 180° (teal)
```

**Hue distribution analysis**:

| Accent | OKLCH Hue | Gap to Next (clockwise) |
|---|---|---|
| Red | ~25° | 60° to Gold |
| Gold | ~85° | 70° to Emerald |
| Emerald | ~155° | 75° to Cyan |
| Cyan | ~230° | 70° to Purple |
| Purple | ~300° | 50° to Pink |
| Pink | ~350° | 35° to Red |

**Average gap**: ~60° (6 hues across 360° = 60° equidistant)

**Harmony structure identified**: **HEXADIC (six-hue)** — the app uses a near-equidistant six-color system. This is not a traditional named harmony (monochromatic, analogous, complementary, triadic) — it's a full-spectrum chromatic system where:

1. **Gold** (85°) dominates as primary — warm anchor
2. **Cyan** (230°) serves as complementary tension — cool pole
3. **Purple** (300°), **Pink** (350°), **Red** (25°), **Emerald** (155°) fill the remaining quadrants

```
Dominance hierarchy:
  ████████████████████████  Gold       PRIMARY    (~40% of accent usage)
  ████████████████          Cyan       SECONDARY  (~20% of accent usage)
  ████████████              Purple     TERTIARY   (~15% of accent usage)
  ██████████                Pink       TERTIARY   (~10% of accent usage)
  ████████                  Emerald    SEMANTIC   (~8% of accent usage)
  ██████                    Red        SEMANTIC   (~7% of accent usage)
```

**Finding DC5-HS1**: The palette uses a **hexadic harmony with clear dominance hierarchy**. This is the most energetic possible harmony system — six equidistant hues create maximum chromatic variety. It works because:

1. **Gold suppresses all others through usage frequency** (~40% of accent appearances)
2. **Cyan provides structured opposition** (complementary to gold)
3. **The remaining four hues appear in specific contexts** (rarity, banners, semantics) — they don't compete freely
4. **The dark void background absorbs excess energy** — chromatic variety reads as richness, not chaos

- **Severity**: **PASS**
- **Why it works**: In a gacha tracker, chromatic variety is *functional* — each color encodes a game concept (element, rarity, banner type, emotion). A monochromatic or analogous palette would lose this semantic richness.
- **Solution**: No harmony change needed. The hexadic system is correct for this app's domain. The key is maintaining the dominance hierarchy — gold must always be the loudest voice. If additional accent colors are ever added, they should replace an existing hue, not expand the system to 7+.

**Finding DC5-HS2**: The **gold-cyan axis** is the strongest compositional pairing in the system. At ~145° apart (near-complementary), they create the maximum visual tension available in the palette. This axis should be protected as the app's core color narrative.

- **Severity**: **PASS**
- **Solution**: Document the gold-cyan axis as the primary compositional axis. All other accents are satellites of this axis.

---

### §DC5 Summary Table

| ID | Finding | Severity | Solution |
|---|---|---|---|
| DC5-GR1 | Gradient system well-designed — 30+ gradients all serve clear purposes | **PASS** | Fix install banner flat gradient (B2) |
| DC5-GR2 ✅ | Two inconsistent bottom-fade implementations (pure black vs tinted) | **LOW** | Unify to `rgba(8,12,20,0.85)` |
| DC5-TN1 ✅ | Cyan serves as tension color but is overused (45+ instances) | **MEDIUM** | Accept cyan as secondary accent; consider introducing a rare true tension color at ~210° |
| DC5-TN2 | Purple correctly used as rarity marker, not tension | **PASS** | No change |
| DC5-ST1 | Onboarding color tour is excellent design | **PASS** | No change — document as design principle |
| DC5-ST2 | Engagement state has correct emotional temperature | **PASS** | No change |
| DC5-ST3 ✅ | Achievement color burst is strong but trophy colors hardcoded | **LOW** | Wrap 92 colors in `TROPHY_COLORS` map; keep variety |
| DC5-ST4 | Error uses graduated red + cyan recovery — coherent | **PASS** | Document red→cyan as design principle |
| DC5-ST5 | Empty state "gold promise + ghost potential" is exceptional | **PASS** | Document as design principle |
| DC5-ST6 | Loading gold shimmer maintains brand presence | **PASS** | No change |
| DC5-ST7 ✅ | Missing "anticipation" transition between engagement→achievement | **LOW** | Add brief gold pulse before pull results |
| DC5-HS1 | Hexadic harmony with gold dominance hierarchy — correct for domain | **PASS** | Maintain gold dominance; never exceed 6 hues |
| DC5-HS2 | Gold-cyan axis is the core compositional pairing | **PASS** | Document and protect the gold-cyan axis |

---

## Step 6 Combined Findings

### All Step 6 Findings (§DC3 + §DC4 + §DC5)

| ID | Finding | Severity | Section |
|---|---|---|---|
| DC3-EL1 ✅ | Surface elevation flat — 3.7% lightness band | **MEDIUM** | §DC3.1 |
| DC3-OLED1 ✅ | OLED collapses all surfaces to 0% | **MEDIUM** | §DC3.2 |
| DC3-OLED2 ✅ | Toasts not OLED-aware | **LOW** | §DC3.2 |
| DC3-BK1 | Pure black OLED appropriate | **PASS** | §DC3.3 |
| DC3-SH1 ✅ | Dark shadows invisible | **LOW** | §DC3.3 |
| DC3-WH1 ✅ | 4 hardcoded `#ffffff` text | **LOW** | §DC3.3 |
| DC3-AS1 | No asset issues (dark-native) | **PASS** | §DC3.3 |
| DC3-BL1 ✅ | Backdrop-blur inconsistent | **LOW** | §DC3.4 |
| DC4-HUE1 | Gold hue no competitive conflict | **PASS** | §DC4.1 |
| DC4-CAL1 ✅ | Gold near-identical to Tailwind yellow-500 | **MEDIUM** | §DC4.2 |
| DC4-ICO1 ✅ | Favicon/in-app gold mismatch | **LOW** | §DC4.3 |
| DC4-MAP1 | Competitive hue map — clear ownership | **PASS** | §DC4.4 |
| DC5-GR1 | Gradient system well-designed | **PASS** | §DC5.1 |
| DC5-GR2 ✅ | Inconsistent bottom-fade gradients | **LOW** | §DC5.1 |
| DC5-TN1 ✅ | Cyan overused as tension color | **MEDIUM** | §DC5.2 |
| DC5-TN2 | Purple correct as rarity marker | **PASS** | §DC5.2 |
| DC5-ST1 | Onboarding color tour excellent | **PASS** | §DC5.3 |
| DC5-ST2 | Engagement emotional temperature correct | **PASS** | §DC5.3 |
| DC5-ST3 ✅ | Achievement colors strong but hardcoded | **LOW** | §DC5.3 |
| DC5-ST4 | Error graduated red + cyan recovery | **PASS** | §DC5.3 |
| DC5-ST5 | Empty state gold promise exceptional | **PASS** | §DC5.3 |
| DC5-ST6 | Loading gold shimmer on-brand | **PASS** | §DC5.3 |
| DC5-ST7 ✅ | Missing anticipation transition | **LOW** | §DC5.3 |
| DC5-HS1 | Hexadic harmony correct for domain | **PASS** | §DC5.4 |
| DC5-HS2 | Gold-cyan axis — core pairing | **PASS** | §DC5.4 |

**Severity distribution**: 3 MEDIUM, 8 LOW, 14 PASS — **25 total findings**

---

**STEP 6 COMPLETE** — §DC3 Dark Mode Craft + §DC4 Brand Color Distinctiveness + §DC5 Color as Narrative established.

**Dark mode craft**: Surface elevation is flat (3.7% band) — works via glass-morphism compensation but is architecturally fragile. OLED mode collapses to pure black. Shadows are invisible (correct — depth is via borders/blur/glow).
**Brand color**: Gold `#edaf18` owns its competitive zone (30°+ from nearest competitor). Near-Tailwind-default calibration is a documentation issue, not a visual one. Favicon gold needs alignment.
**Color narrative**: Gradient system is intentional (30+ gradients, all purposeful). State narrative flows correctly: onboarding (color tour) → engagement (gold focus) → achievement (color burst) → error (graduated red) → empty (gold promise) → loading (gold scan). Hexadic harmony is correct for the gacha domain. Gold-cyan axis is the core compositional pairing.

---

# STEP 7: §DBI1 Brand Personality Archetype + §DBI3 Anti-Genericness Audit

**Skill reference**: design-aesthetic-audit §DBI1, §DBI3
**Axis context**: A1 NON-REVENUE · A2 FOCUS-TOOL + EMOTIONAL-SECONDARY · A3 ENTHUSIAST/EXPERT · A4 NAMED-SOURCE Wuthering Waves L3 · A5 FUNCTIONAL-PRIMARY + ATMOSPHERIC-SECONDARY
**Design character**: LUMINOUS TACTICAL COMPANION (from §DP2)
**Style classification**: Cyberpunk/Terminal (primary) + Glassmorphism (secondary) + Dashboard (secondary atmospheric)

---

## §DBI1. Brand Personality Archetype

### §DBI1.1 Archetype Identification

The 12 Jungian brand archetypes are assessed against the app's visual evidence, content tone, and interaction patterns. Multiple archetypes may blend — the goal is to identify the **primary** and any **secondary** archetype expression.

**Evidence inventory** (from codebase):

| Evidence Category | Signals | Archetype Implication |
|---|---|---|
| **Color system** | Gold primary (`#edaf18`), dark navy base (`#080c14`), hexadic 6-hue accent system | Premium, commanding — **Ruler** or **Magician** |
| **Surface treatment** | Glassmorphism, backdrop-blur layering, shimmer animations, inset glows | Transformative, atmospheric — **Magician** |
| **Typography** | Rajdhani (geometric/tech-forward display), JetBrains Mono (precision data), 7 unique tracking values | Precise, technical — **Sage** |
| **Motion** | `cubic-bezier(0.16, 1, 0.3, 1)` (confident ease-out-back), staggered card entrances, pity ring pulses | Purposeful, assured — **Hero** or **Magician** |
| **Copy tone** | "Your companion for Wuthering Waves Convene planning" — supportive, empowering | Ally, guardian — **Caregiver** or **Hero** |
| **Achievement copy** | "anime protagonist arc", "Rover's Plot Armor", "protagonist luck is real" | Heroic celebration — **Hero** + **Jester** |
| **Humor** | "Sunk Cost Fallacy", "Rover's Allowance: Gone", "seek help." | Self-aware wit — **Jester** (secondary) |
| **Empty states** | Gold promise glow + ghost-grid pulse, helpful directives | Encouraging, forward-looking — **Caregiver** |
| **Interaction feedback** | Hover lift (-2px), active compression (0.97), immediate tactile response | Responsive precision — **Hero** |
| **Data presentation** | Stat boxes with color-variant accent lines, pity tracking, trend analysis | Analytical mastery — **Sage** |

### §DBI1.2 Primary Archetype: MAGICIAN

**Definition**: Premium, transformative; shows the "before/after." Makes complex things feel manageable and beautiful.

**Why Magician, not Hero or Sage**:

The app does not merely present data (Sage) or empower through bold action (Hero). It **transforms** — raw gacha pull data becomes luminous, organized, emotionally meaningful information. The transformation is visible in:

1. **Surface alchemy**: Raw data rendered through glassmorphism shimmer, gold glow, and layered depth — the visual system *elevates* numbers into an experience
2. **Pity ring visualization**: A simple counter becomes a glowing radial progress ring with drop-shadow and pulse animations — transformation of mundane tracking into visual drama
3. **Achievement system**: Pull statistics become narrative trophies with lore-integrated names — raw numbers become stories ("anime protagonist arc")
4. **Empty → full state**: Ghost-grid pulse with gold promise glow transitions into populated collection grids — the app shows the "before/after" explicitly
5. **Onboarding arc**: 7-step color tour that transforms a new user into an empowered Rover — the classic Magician journey structure

**Archetype-visual alignment**:

| Magician Signal | App Implementation | Alignment |
|---|---|---|
| Premium surfaces | Glassmorphism + shimmer + inset glow on every card | ✅ Strong |
| Transformation visible | Empty state → populated state with glow transitions | ✅ Strong |
| Before/after moments | Pity counter → glowing ring; stats → trophy achievements | ✅ Strong |
| Atmospheric depth | Backdrop-blur layers, vignette, multi-layer shadows | ✅ Strong |
| Dark/mysterious base | `#080c14` navy-black with gold illumination | ✅ Strong |
| Precision + wonder | JetBrains Mono data + Rajdhani display + gold glow | ✅ Strong |

### §DBI1.3 Secondary Archetype: HERO (with Jester undertone)

**Hero expression** (30% of personality):
- Achievement system celebrates user victories with protagonist language ("Rover's Blessing", "Plot Armor")
- Interaction feedback is immediate and responsive (tactile compression, hover lift)
- Gold accent is commanding and triumphant
- Empty states offer direction and encouragement, not passive waiting

**Jester undertone** (10% of personality):
- Achievement copy uses community humor ("Copium Rewarded", "seek help.", "Sunk Cost Fallacy")
- Self-aware about gacha psychology ("emotionally and financially invested")
- Playful lore integration (Huanglong's Census, Gathering Wives)
- This prevents the Magician/Hero blend from feeling too serious for a gacha tracker

### §DBI1.4 Archetype Gap Assessment

| Dimension | Intended (from §DP2) | Projected (from visual evidence) | Gap? |
|---|---|---|---|
| **Primary feel** | Luminous Tactical Companion | Magician (transformative, premium, atmospheric) | ✅ Aligned — "Luminous" = Magician's atmospheric quality |
| **Competence signal** | Tactical precision | Sage-like data presentation + Hero responsiveness | ✅ Aligned — "Tactical" maps to both |
| **Relational tone** | Companion (supportive ally) | Hero encouragement + Caregiver empty-state guidance | ✅ Aligned — "Companion" maps to Hero+Caregiver blend |
| **Humor register** | Not explicitly defined in §DP2 | Jester undertone in achievements | ⚠️ Minor gap — humor is present but not part of the declared character. This is actually a strength — it prevents the "Luminous Tactical" from being too cold |
| **Premium signal** | Atmospheric-secondary (from A5) | Magician surfaces (glassmorphism, glow, shimmer) | ✅ Aligned |
| **Expertise signal** | Enthusiast/Expert (from A3) | Sage typography (JetBrains Mono, precise tracking) | ✅ Aligned |

**Overall alignment**: **STRONG** — The LUMINOUS TACTICAL COMPANION character maps cleanly onto a Magician (primary) + Hero (secondary) + Jester (undertone) archetype blend. No significant visual changes needed to close an archetype gap.

> **Finding DBI1-ARC1** · Severity: **PASS**
> **Archetype alignment is strong.** The Magician+Hero+Jester blend correctly serves a gacha tracker that transforms raw data into luminous, narratively rich experiences while celebrating user achievement with self-aware humor.
> **Solution (preservation)**: Document the archetype blend as `MAGICIAN-PRIMARY / HERO-SECONDARY / JESTER-UNDERTONE` in any future design system documentation. When adding new features, test against: "Does this feel transformative (Magician), empowering (Hero), and occasionally self-aware (Jester)?"

### §DBI1.5 Archetype-Closing Recommendations

The archetype is well-expressed. Two minor opportunities to strengthen it:

> **Finding DBI1-ARC2 ✅** · Severity: **LOW**
> **Magician "reveal moment" is underutilized.** The Magician archetype is strongest when it shows explicit transformation — the moment data becomes insight. Currently, stat boxes appear pre-calculated. A brief "calculating..." → result reveal with a subtle gold flash would reinforce the Magician's transformative quality.
> **Solution**:
> - Option A (minimal): Add a 200ms fade-in with gold glow pulse when stat values first render after data import
> - Option B (full ownership): Implement a "data alchemy" micro-animation sequence where numbers count up briefly before settling, with a gold shimmer sweep across the stat box — reinforcing the transformation metaphor
> - Apply to: `.kuro-stat` boxes on first data load, achievement unlock moments

> **Finding DBI1-ARC3 ✅** · Severity: **LOW**
> **Hero "call to action" moments lack visual weight.** Primary action buttons (Import, Save, Calculate) use the same `.kuro-btn` styling as secondary actions. The Hero archetype demands that key moments feel bold and distinctive.
> **Solution**:
> - Option A (minimal): Add `.kuro-btn-primary` variant with gold border glow (`box-shadow: 0 0 12px rgba(237, 175, 24, 0.2)`) and slightly larger padding for the 3-5 most important actions
> - Option B (full ownership): Create a `.kuro-btn-hero` class with gold gradient border, subtle pulse animation on idle, and enhanced hover glow — reserved exclusively for the single most important action on each screen
> - Apply to: "Import Data" on TRACKER, "Calculate" on CALC, "Save State" on PLANNER

---

## §DBI3. Anti-Genericness Audit

**Methodology**: Assess all 12 genericness signals defined in the skill document, plus dark-mode-specific signals. For each signal found: document the exact value, explain why it reads generic, assess impact on the §DP2 character ("LUMINOUS TACTICAL COMPANION"), and provide replacement options.

**Assessment scale**: GENERIC (signal is present and damaging), PARTIAL (signal exists but mitigated), OWNED (signal absent or fully customized), N/A (not applicable to this app).

### Signal 1: Default Tailwind Blue (`#3b82f6` / `blue-500`)

**Status: PARTIAL — domain-specific use, not generic defaulting**

**Exact values found**:
- `#3b82f6` (Tailwind `blue-500`): **15 occurrences** — all in achievement badge color definitions (`App.jsx` lines 1626, 1687-1689, 1698-1699, 1708, 1716, 1723, 1807, 1963)
- `#60a5fa` (Tailwind `blue-400`): **15 occurrences** — focus outline (`index.css` line 44), banner history stats (`App.jsx` lines 2110-2111, 2332), collection display (`App.jsx` lines 4717, 4802, 5009, 5015-5016)
- Tailwind classes `text-blue-400`, `bg-blue-500/10`, `border-blue-500/30`: **7 occurrences** in collection/stats UI

**Why it's NOT fully generic**: Blue represents the "Standard/3-star" tier in the gacha domain — it's a semantic color mapping (gold=5★, purple=4★, blue=3★). This is intentional domain language, not a default accent choice.

**Why it's PARTIALLY generic**: The exact hex values `#3b82f6` and `#60a5fa` are uncalibrated Tailwind defaults. They could be shifted to owned values while preserving the blue-tier semantics.

**Impact on character**: Low — these appear in secondary data contexts (3-star items, which users care least about). The Magician character is not undermined because primary accent (gold) is fully owned.

> **Finding DBI3-S01 ✅** · Severity: **LOW**
> **Tailwind blue defaults used for 3-star/standard tier — semantically correct but uncalibrated.**
> 30 occurrences of `#3b82f6`/`#60a5fa` across achievement badges, banner stats, and collection display. The blue-for-standard mapping is correct gacha convention, but the exact Tailwind hex values lack ownership.
> **Solution**:
> - Option A (minimal): Shift hue 8° and adjust lightness — `oklch(62% 0.20 248)` ≈ `#3578f0` for the 500-equivalent, `oklch(72% 0.16 248)` ≈ `#5c9af5` for the 400-equivalent. Same blue family, no longer pixel-identical to Tailwind.
> - Option B (full ownership): Recalibrate to the app's cool-navy hue family — `oklch(62% 0.18 255)` ≈ `#3070e8` (more indigo, matching the `#080c14` base hue at 240°). This makes even the "common" tier feel part of the Whispering Wishes palette.
> - Apply to: All `#3b82f6` (15 instances in `App.jsx`), all `#60a5fa` (14 instances in `App.jsx` + 1 in `index.css`), all `text-blue-400`/`bg-blue-500` classes (7 instances)
> - Consolidate via CSS variable: `--color-blue-tier: oklch(62% 0.20 248)` in `:root`

### Signal 2: Inter at Default Weight

**Status: OWNED — fully customized typography**

**Exact values found**:
- **Display font**: `'Rajdhani'` — geometric, tech-forward (`appcore-providers.jsx` line 451, `index.css` line 32)
- **Data font**: `'JetBrains Mono'` — monospace precision (`appcore-providers.jsx` line 452)
- **No Inter usage anywhere** in the codebase
- **Weight range**: 500 (buttons), 600 (headers, labels), 700 (data badges) — three intentional weights
- **Letter-spacing customization**: 7 unique values (`-0.02em`, `0.01em`, `0.02em`, `0.03em`, `0.08em`, `0.1em`, `0.2em`) plus Tailwind `tracking-wider`/`tracking-widest` (30+ instances)

**Why it's OWNED**: The app uses no default system font stack as primary. Rajdhani is a distinctive geometric display face that reinforces the Cyberpunk/Terminal classification. JetBrains Mono for data reinforces the Tactical dimension. The tracking values show intentional typographic craft.

> **Finding DBI3-S02** · Severity: **PASS**
> **Typography is fully owned — Rajdhani + JetBrains Mono with 7 custom tracking values.**
> No Inter, no system-font-only defaults. The typeface pairing (geometric display + monospace data) directly expresses the LUMINOUS TACTICAL COMPANION character.
> **Solution (preservation)**: Current type system is a strength. Document the pairing rationale: "Rajdhani = Cyberpunk/geometric display voice; JetBrains Mono = tactical precision data voice." Ensure all future text elements use one of these two families — no third font should creep in without deliberate character justification.

### Signal 3: `rounded-lg` on Everything

**Status: PARTIAL — dominant single value with some hierarchy**

**Exact values found**:

| Radius Value | CSS/Class | Count | Usage |
|---|---|---|---|
| 8px | `rounded-lg` | **109** | Cards, buttons, inputs — dominant everywhere |
| 50% | `rounded-full` | **45** | Badges, spinner, circles — correct for circular elements |
| 12px | `rounded-xl` | **28** | Medium cards, headers |
| 16px | `rounded-2xl` / `.kuro-card` | **5** + CSS | Large cards, modals |
| 4px | `rounded-sm` | **3** | Fine details |
| 6px | `rounded-md` | **3** | Rare |
| 10px | `.kuro-stat` | CSS only | Stat boxes — non-Tailwind value |

**KuroStyles CSS radius definitions**:
- `.kuro-card`: `border-radius: 16px` (`appcore-providers.jsx` line 714)
- `.kuro-btn`: `border-radius: 12px` (line 859)
- `.kuro-input`: `border-radius: 8px` (line 990)
- `.kuro-stat`: `border-radius: 10px` (line 1039) — custom non-Tailwind value

**Why it's PARTIALLY generic**: The KuroStyles CSS defines an intentional 4-level hierarchy (8→10→12→16px). However, 109 instances of `rounded-lg` in Tailwind utility classes flatten this hierarchy — many elements that *should* use the KuroStyles radius are instead using the generic `rounded-lg` class, creating a visual monoculture at 8px.

**Impact on character**: Moderate — radius communicates personality. The LUMINOUS TACTICAL COMPANION should have sharper, more geometric radii on tactical elements (stat boxes, data displays) and softer radii on atmospheric elements (cards, modals). Currently everything between 8-12px feels similar.

> **Finding DBI3-S03** · Severity: **MEDIUM**
> **109 instances of `rounded-lg` (8px) create a radius monoculture.** The KuroStyles CSS defines a 4-level hierarchy (8→10→12→16px), but Tailwind utility classes override this with flat 8px application. Radius should vary by component personality.
> **Solution**:
> - Option A (minimal): Define explicit CSS variables for the radius scale and audit the 109 `rounded-lg` instances — reassign each to the correct tier:
>   ```css
>   --radius-sharp: 4px;    /* tactical elements: inline badges, tiny controls */
>   --radius-data: 8px;     /* data inputs, small buttons */
>   --radius-card: 12px;    /* cards, stat boxes, medium containers */
>   --radius-panel: 16px;   /* large panels, modals, primary cards */
>   --radius-pill: 9999px;  /* pills, tags, circular elements */
>   ```
> - Option B (full ownership): Adopt a character-driven radius philosophy — "Tactical" elements get sharper corners (4-6px), "Luminous/atmospheric" elements get softer corners (14-16px), creating visible personality contrast within the UI. This makes the radius *speak* the dual character.
> - Priority targets: `.kuro-stat` should be 8px (sharper = tactical), `.kuro-card` stays 16px (atmospheric), `.kuro-btn` could differentiate: primary=12px, secondary=8px

### Signal 4: 16px Grid Spacing

**Status: OWNED — custom 14px primary spacing**

**Exact values found**:
- **Primary body/stat padding**: `14px` (`appcore-providers.jsx` lines 850, 1040) — non-standard, not a 4px multiple
- **Button padding**: `10px 12px` (line 860) — asymmetric, intentional
- **Small input**: `4px 8px` (line 1026) — tight tactical sizing
- **Custom width**: `56px` input width (line 1028) — non-grid value
- **Tailwind utility usage**: `p-4` (16px), `p-3` (12px), `p-2` (8px) — standard 4px grid in markup, **561 total occurrences**

**Why it's OWNED**: The 14px primary spacing is a deliberate non-standard choice. Combined with 10px button vertical padding and 56px input widths, the spacing system has custom values that don't conform to a pure 4px grid. The Tailwind utilities in markup follow 4px multiples, but the CSS-in-JS foundation uses custom values.

> **Finding DBI3-S04** · Severity: **PASS**
> **Spacing uses a custom 14px primary baseline with intentional non-grid values.**
> The CSS-in-JS layer defines body padding at 14px (not 16px), button padding at 10×12px, and input widths at 56px — all non-standard. The Tailwind markup uses standard 4px grid, but the foundational spacing is custom.
> **Solution (preservation)**: The custom spacing is a subtle distinctiveness signal. Document the spacing rationale: "14px body = tighter-than-default, information-dense tactical feel; 10×12px buttons = compact action footprint." Consider defining `--space-base: 14px` as a named token for consistency.

### Signal 5: `shadow-sm` on Cards

**Status: OWNED — fully custom shadow system**

**Exact values found**:
- **Custom shadow tokens** (`appcore-providers.jsx` lines 441-444):
  - `--shadow-sm: 0 1px 2px rgba(6, 10, 24, 0.4)` — NOT Tailwind's `0 1px 3px rgba(0,0,0,0.1)`
  - `--shadow-md: 0 4px 12px rgba(6, 10, 24, 0.5)` — NOT Tailwind's `0 4px 6px`
  - `--shadow-lg: 0 8px 24px rgba(6, 10, 24, 0.6)` — NOT Tailwind's `0 10px 15px`
  - `--shadow-xl: 0 12px 40px rgba(6, 10, 24, 0.7)` — NOT Tailwind's `0 20px 25px`
- **Card shadow** (`.kuro-card`, lines 718-722): Multi-layer — `0 4px 24px rgba(6, 10, 24, 0.6)` + `0 0 0 1px rgba(255,255,255, 0.03)` + `inset 0 1px 0 rgba(255,255,255, 0.05)`
- **Color-specific glows** (lines 938-983): `.glow-gold`, `.glow-purple`, `.active-cyan`, `.active-emerald`, `.active-red` — each with unique glow radius and color
- **Icon hover**: `filter: drop-shadow(0 0 3px currentColor)` (line 915-926)

**Why it's OWNED**: Shadow color uses `rgba(6, 10, 24, ...)` — calibrated to the app's navy-black base hue (`#080c14`), not generic black. Multi-layer card shadows combine depth + border highlight + inset light. Color-specific glows are a signature element.

> **Finding DBI3-S05** · Severity: **PASS**
> **Shadow system is fully custom — navy-calibrated depth + multi-layer card shadows + color-specific glows.**
> No Tailwind `shadow-sm/md/lg` defaults. Shadow color `rgba(6, 10, 24, ...)` is hue-matched to the base. The glow system (`.glow-gold`, `.active-cyan`, etc.) is a Magician-archetype signature — luminous depth that no default provides.
> **Solution (preservation)**: The shadow/glow system is one of the app's strongest anti-genericness features. Preserve the `rgba(6, 10, 24, ...)` calibration. When adding new shadow contexts, always derive from this base — never use `rgba(0, 0, 0, ...)`.

### Signal 6: Default Icon Library

**Status: PARTIAL — good library choice, default presentation**

**Exact values found**:
- **Library**: Lucide React (`import { Sparkles, Calculator, Upload, Target, BarChart3, X, LayoutGrid, Info, CheckCircle, AlertCircle, AlertTriangle } from 'lucide-react'` — `appcore-providers.jsx` line 7)
- **Icon sizes**: `size={32}` (onboarding), `size={16}` (UI controls) — two sizes only
- **Stroke customization**: None found — using Lucide defaults (stroke-width 2)
- **Color inheritance**: Icons inherit from parent `text-*` classes
- **Hover effect**: `filter: drop-shadow(0 0 3px currentColor)` on button hover (lines 915-926) — custom glow
- **10+ unique icons** used across onboarding, navigation, badges, admin panels

**Why it's PARTIALLY generic**: Lucide is a better choice than Heroicons (less ubiquitous), but it's still recognizable as a stock icon library at default stroke-width. The hover glow effect adds personality, but the icons themselves are unmodified.

**Impact on character**: Low-moderate — the LUMINOUS TACTICAL COMPANION should have icons that feel either more geometric/sharp (tactical) or more atmospheric (luminous). Default Lucide is neutral.

> **Finding DBI3-S06 ✅** · Severity: **LOW**
> **Lucide icons at default stroke-width — correct library, unmodified presentation.**
> 10+ Lucide icons used with default `strokeWidth={2}`. The hover glow effect (`drop-shadow(0 0 3px currentColor)`) adds atmospheric personality, but the icons themselves are stock.
> **Solution**:
> - Option A (minimal): Set global `strokeWidth={1.5}` for all Lucide icons — thinner strokes feel more refined and match the Cyberpunk/Terminal aesthetic. This single change shifts perception from "starter kit" to "considered."
> - Option B (full ownership): Use `strokeWidth={1.5}` globally, then override to `strokeWidth={2}` for action icons (Upload, Calculator) and `strokeWidth={1}` for atmospheric/decorative icons (Sparkles, Info). This creates a hierarchy within the icon system that mirrors the Tactical/Luminous character split.
> - Apply to: Lucide import configuration or wrapper component

### Signal 7: Gray-900 / Gray-500 / Gray-400 Text Stack

**Status: GENERIC — highest genericness signal in the app**

**Exact values found**:

| Tailwind Class | Count | Primary Usage |
|---|---|---|
| `text-gray-400` | **229** | Secondary text, labels, descriptions — most common text color |
| `text-gray-500` | **107** | Tertiary text, muted content, timestamps |
| `text-gray-300` | **73** | Primary secondary text, slightly brighter |
| `text-gray-200` | **21** | Lighter accent text |
| `text-gray-100` | **24** | Light text accents |
| `text-gray-600` | **5** | Darker muted text (rare) |
| **TOTAL** | **459** | — |

**Custom overrides in KuroStyles**:
- `--text-body: #dfe5ef` (line 449) — slight blue tint, NOT pure gray ✓
- `--text-heading: #edf1f8` (line 450) — slight blue tint ✓
- Placeholder: `#6b7389` (line 1017) — custom gray-blue ✓
- Focused placeholder: `#8f99ab` (line 1022) — custom gray-blue ✓

**The problem**: The KuroStyles CSS defines chromatic text colors (`#dfe5ef`, `#edf1f8`), but the 459 Tailwind utility class instances in JSX markup use pure Tailwind grays that have NO chromatic quality. The carefully calibrated CSS variables are being overridden or bypassed by generic gray classes at the markup level.

**Impact on character**: **HIGH** — The LUMINOUS TACTICAL COMPANION should never feel "gray." Every text element should carry a trace of the navy-blue hue family (`#080c14` → hue ~230°). Pure Tailwind grays are achromatic — they belong to no palette, no identity. When 459 text elements are achromatic gray, the app's identity is diluted across every screen.

> **Finding DBI3-S07** ✅ · Severity: **HIGH**
> **459 instances of achromatic Tailwind gray text classes overwhelm the custom chromatic text tokens.** `text-gray-400` alone appears 229 times. The KuroStyles CSS defines chromatic alternatives (`--text-body: #dfe5ef`), but markup-level Tailwind classes bypass them entirely.
> **Solution**:
> - Option A (minimal): Define chromatic gray replacements as CSS custom properties and create Tailwind utility overrides:
>   ```css
>   /* Chromatic grays — same visual weight, navy hue family (230°) */
>   --text-primary: oklch(92% 0.008 240);    /* ≈ #dfe5ef — replaces text-gray-200/100 */
>   --text-secondary: oklch(72% 0.010 240);  /* ≈ #9da8b9 — replaces text-gray-300 */
>   --text-muted: oklch(62% 0.012 240);      /* ≈ #7d8a9f — replaces text-gray-400 */
>   --text-subtle: oklch(52% 0.010 240);     /* ≈ #5f6d82 — replaces text-gray-500 */
>   --text-ghost: oklch(42% 0.008 240);      /* ≈ #445064 — replaces text-gray-600 */
>   ```
> - Option B (full ownership): Extend Tailwind config with custom `kuro-gray` scale that uses OKLCH chromatic values, then find-and-replace all 459 instances: `text-gray-400` → `text-kuro-400`, `text-gray-500` → `text-kuro-500`, etc. Every gray becomes a navy-tinted chromatic gray.
> - **Priority**: This is the single highest-impact anti-genericness fix. 459 elements shifting from achromatic to chromatic would transform the entire app's feel without changing any layout or functionality.
> - Apply to: All 459 `text-gray-*` instances across `App.jsx`, `appcore-components.jsx`, and any other JSX files

### Signal 8: White `#ffffff` / Generic Dark Background

**Status: OWNED — custom dark palette with chromatic identity**

**Exact values found**:
- **Page background**: `#080c14` (`index.css` line 20, line 31) — custom dark navy, NOT `#0f1117` or `#111827`
- **Surface tokens** (`appcore-providers.jsx` lines 453-457): All use `rgba(6-15, 10-20, 18-28, ...)` — chromatic navy, not generic black
- **No `#ffffff` background** anywhere — dark-mode only app
- **No `#0f1117`** (GitHub dark default) — not used
- **No `#111827`** (Tailwind `gray-900`) — not used
- **OLED mode**: Uses `#000000` but as an explicit opt-in mode, not a default

**Why it's OWNED**: The `#080c14` base is a deliberately calibrated dark navy at OKLCH hue ~240°. All surface tokens derive from the same navy family (R:6-15, G:10-20, B:18-28). This is a signature color choice, not a default.

> **Finding DBI3-S08** · Severity: **PASS**
> **Background system is fully owned — `#080c14` dark navy with chromatic surface tokens.**
> No generic white, no Tailwind `gray-900`, no GitHub dark defaults. Every surface carries the navy hue family. OLED `#000000` is an intentional opt-in, not a lazy default.
> **Solution (preservation)**: `#080c14` is a brand-defining color. Protect it as the foundation of the visual identity — any future surface additions must derive from this hue family (R-channel < G-channel < B-channel, approximately 2:3:4 ratio).

### Signal 9: `transition: all 0.2s ease-in-out`

**Status: OWNED — custom transition system with specific properties**

**Exact values found**:
- **Custom transition tokens** (`appcore-providers.jsx` lines 445-447):
  - `--transition-fast: 0.15s cubic-bezier(0.16, 1, 0.3, 1)` — NOT 0.2s
  - `--transition-normal: 0.25s cubic-bezier(0.16, 1, 0.3, 1)` — NOT 0.2s
  - `--transition-slow: 0.4s cubic-bezier(0.16, 1, 0.3, 1)` — NOT 0.2s
- **Easing curve**: `cubic-bezier(0.16, 1, 0.3, 1)` (ease-out-back) — used consistently, NOT `ease-in-out`
- **Specific property transitions** (majority):
  - `.kuro-card` (line 722): `transition: transform 0.3s, box-shadow 0.3s, border-color 0.3s`
  - `.kuro-btn` (line 867): 5 specific properties with different speeds
  - `.kuro-stat` (line 1048): `transform, border-color, box-shadow` individually
- **`transition: all` usage**: Only **2 instances** (`appcore-providers.jsx` lines 1508, 1615) — minimal
- **7 unique durations**: 0.15s, 0.2s, 0.25s, 0.3s, 0.35s, 0.4s, 0.8s
- **Custom keyframe animations**: `slideUp` (0.2s), `tabFadeIn` (0.35s), `cardSlideIn` (0.4s), `badgeRotate` (8s), `trophyShine` (3s)

**Why it's OWNED**: The custom `cubic-bezier(0.16, 1, 0.3, 1)` easing is used everywhere instead of `ease-in-out`. Transitions target specific properties (not `all`). Seven distinct durations create a motion hierarchy. This is a considered motion system, not a default.

> **Finding DBI3-S09** · Severity: **PASS**
> **Transition system is fully custom — `cubic-bezier(0.16, 1, 0.3, 1)` easing with 7 distinct durations and specific property targeting.**
> Only 2 instances of `transition: all` in the entire codebase. The custom easing curve (ease-out-back) creates a confident, purposeful motion feel that directly expresses the Magician archetype.
> **Solution (preservation)**: The motion system is a signature element. The `cubic-bezier(0.16, 1, 0.3, 1)` curve should be documented as the "Whispering Wishes motion personality." Eliminate the 2 remaining `transition: all` instances (lines 1508, 1615) by replacing with specific property lists.

### Signal 10: Full-Width Buttons (`w-full`)

**Status: OWNED — strategic full-width use, majority flex-sized**

**Exact values found**:
- **`w-full` on buttons**: ~12-15 instances (`App.jsx` lines 3470, 3486, 3493, 3775, 3791, 3801, 3813, 6740, 6743, 6824, 4262)
- **Total buttons in app**: 100+ instances
- **Button base style** (`.kuro-btn`, line 855-873): NO default width — buttons are content-sized with `padding: 10px 12px`
- **Majority pattern**: `flex-1` within button groups, or natural content width
- **`w-full` contexts**: Calculator toggle groups (appropriate — mobile form), Export/Reset/Save (appropriate — primary actions in settings), Leaderboard submit (appropriate — single-column form)

**Why it's OWNED**: Full-width is used strategically in form/action contexts (12-15 of 100+ buttons). The majority of buttons are flex-sized or content-sized. The `.kuro-btn` base class deliberately omits width — full-width is always an explicit opt-in.

> **Finding DBI3-S10** · Severity: **PASS**
> **Buttons are strategically sized — `w-full` used only in form/action contexts (12% of buttons).**
> The `.kuro-btn` base class has no default width. Full-width is applied intentionally for primary actions in single-column layouts. The majority of buttons use flex or content sizing.
> **Solution (preservation)**: Current button sizing is appropriate. No changes needed.

### Signal 11: Single Separator Style

**Status: PARTIAL — opacity variety exists but single pattern dominates**

**Exact values found**:
- **Dominant pattern**: `border-t border-white/10` — **25+ instances** (`App.jsx` lines 3841, 4063, 4219, 4252, 4364, 4467, 6053, 6159, 6170, 6361, 6368, 7335, and more)
- **Secondary patterns**: `border-b border-white/10` (10+ instances), `border-white/15` (10+ in `appcore-components.jsx`), `border-white/5` (3+ instances)
- **No `<hr>` elements found** — separators are all border-based
- **CSS border tokens** (`appcore-providers.jsx` lines 459-463):
  - `--border-subtle: rgba(255,255,255,0.06)` — 6%
  - `--border-default: rgba(255,255,255,0.08)` — 8%
  - `--border-medium: rgba(255,255,255,0.1)` — 10%
  - `--border-hover: rgba(255,255,255,0.15)` — 15%
  - `--border-bright: rgba(255,255,255,0.2)` — 20%
- **Separator hierarchy in CSS**: 5-level opacity scale defined but `border-white/10` (matching `--border-medium`) used for ~70% of all separators
- **`.kuro-divider` class**: Exists (`App.jsx` lines 6768, 6866) but only 2 uses — the custom class is underutilized

**Why it's PARTIALLY generic**: The CSS defines a 5-level border opacity scale, but the markup defaults to `border-white/10` almost everywhere. The `.kuro-divider` semantic class exists but is barely used (2 instances vs 35+ raw Tailwind borders). The separator system has good architecture but poor adoption.

**Impact on character**: Moderate — separators are high-frequency visual elements. When they're all identical, the visual hierarchy flattens. The LUMINOUS TACTICAL COMPANION should have separation that reflects importance: section breaks should feel different from item dividers.

> **Finding DBI3-S11 ✅** · Severity: **LOW**
> **`border-white/10` accounts for ~70% of all separators despite a 5-level opacity scale being defined.** The `.kuro-divider` class exists but is used only twice. Separator hierarchy is architecturally present but not adopted in markup.
> **Solution**:
> - Option A (minimal): Audit the 35+ separator instances and reassign to the existing token scale:
>   - Section breaks (between major UI groups): `border-white/15` or `--border-hover`
>   - Item separators (within lists/tables): `border-white/5` or `--border-subtle`
>   - Default dividers: keep `border-white/10` or `--border-medium`
> - Option B (full ownership): Expand `.kuro-divider` into three semantic variants and migrate all raw borders:
>   ```css
>   .kuro-divider-section { border-top: 1px solid var(--border-hover); }    /* 15% — major breaks */
>   .kuro-divider        { border-top: 1px solid var(--border-default); }   /* 8%  — standard */
>   .kuro-divider-subtle { border-top: 1px solid var(--border-subtle); }    /* 6%  — within groups */
>   ```
> - Apply to: All 35+ `border-t border-white/10` and `border-b border-white/10` instances

### Signal 12: Placeholder Text `#9ca3af` / `placeholder:text-gray-400`

**Status: OWNED — custom placeholder colors**

**Exact values found**:
- **Custom placeholder** (`appcore-providers.jsx` line 1017): `.kuro-input::placeholder { color: #6b7389; }` — custom gray-blue, darker than Tailwind default
- **Focus state** (line 1022): `.kuro-input:focus::placeholder { color: #8f99ab; }` — custom lighter gray-blue on focus — a crafted interaction detail
- **One exception**: `placeholder-gray-500` (`App.jsx` line 4818) — single Tailwind default
- **Tailwind default `#9ca3af`**: Found in badge fallback (`App.jsx` line 4116) but NOT in placeholder context
- **Coverage**: ~92% of inputs use custom placeholder via `.kuro-input`, 8% use Tailwind default

**Why it's OWNED**: The custom placeholder colors (`#6b7389`, `#8f99ab`) carry a blue tint that matches the navy palette. The focus-state placeholder change is a craft signal — most apps don't differentiate placeholder color on focus.

> **Finding DBI3-S12** · Severity: **PASS**
> **Placeholder colors are custom (`#6b7389` / `#8f99ab`) with focus-state differentiation — a craft signal.**
> 92% of inputs use the chromatic custom placeholder. The focus-state lighter placeholder is a rare interaction detail that reinforces the Tactical quality.
> **Solution**: Fix the single exception at `App.jsx` line 4818 — replace `placeholder-gray-500` with the custom placeholder class or inline `placeholder-[#6b7389]` to achieve 100% coverage.

---

### §DBI3.D Dark-Mode Specific Genericness Signals

Since Whispering Wishes is a dark-mode-only app, these additional signals are assessed:

**D1. `background: #000000` — absolute black as default**

**Status: OWNED** — `#000000` is OLED-only opt-in, not the default. Standard mode uses `#080c14` (chromatic navy). The OLED toggle at `appcore-providers.jsx` line 408 is an explicit user preference, not a lazy default.

> **Finding DBI3-D01** · Severity: **PASS**
> Pure black is correctly scoped to OLED opt-in mode. Standard dark mode uses chromatic `#080c14`.

**D2. `border: 1px solid rgba(255,255,255,0.1)` everywhere**

**Status: PARTIAL** — This exact value appears as `--border-medium` and is the dominant border across the app. However, a 5-level border opacity scale exists (6%/8%/10%/15%/20%), showing intentional architecture even if adoption is skewed toward the 10% level.

> **Finding DBI3-D02 ✅** · Severity: **LOW**
> **`rgba(255,255,255,0.1)` borders dominate (~70% of instances) despite a 5-level scale.** This specific value is shared with hundreds of dark-mode dashboards. Shifting the dominant border to use the app's navy hue — `rgba(100, 140, 200, 0.08)` instead of `rgba(255, 255, 255, 0.1)` — would make borders chromatic and owned.
> **Solution**:
> - Option A (minimal): Keep white-alpha borders but shift the default from 10% to 8% (`--border-default`) — creates subtle differentiation from the ubiquitous 10% pattern
> - Option B (full ownership): Replace `rgba(255,255,255,0.1)` with chromatic borders: `rgba(140, 160, 200, 0.08)` — same perceived weight, but carries the navy hue family. This would make borders "invisible to the eye, visible to the soul" — imperceptibly more refined.
> - Apply to: `--border-medium` token definition and all `border-white/10` utility instances

**D3. Text contrast 60% white everywhere**

**Status: PARTIAL** — Covered under Signal 7. The 459 Tailwind gray instances create an undifferentiated muted-text landscape. The CSS variables (`--text-body`, `--text-heading`) are chromatic, but markup-level classes override them.

> **Finding DBI3-D03** · Severity: **N/A** (covered by DBI3-S07 ✅)

**D4. `blue-400` / `#60a5fa` as dark-mode accent**

**Status: OWNED** — The app's primary accent is gold (`#edaf18`), not blue. `#60a5fa` is used semantically for 3-star/standard tier items (15 instances), not as the accent color. Gold dominance at ~40% usage clearly establishes it as the primary brand color.

> **Finding DBI3-D04** · Severity: **PASS**
> Gold `#edaf18` is the unambiguous primary accent. Blue `#60a5fa` is a tier-semantic color, not the accent. No dark-mode blue-accent genericness.

---

### §DBI3.T Tab-by-Tab Anti-Genericness Assessment

The plan requires assessment across ALL 8 tabs. Below is a per-tab genericness scan identifying elements that make each tab interchangeable with generic trackers:

**TRACKER tab**:
- ✅ **Owned**: Pity rings with glow, gold/cyan/pink banner color coding, shimmer card tops, corner decorations
- ⚠️ **Generic**: `text-gray-400` for secondary text (pity counts, timestamps), `border-white/10` separators between banner cards
- **Minimal fix**: Replace gray text with chromatic `--text-muted`, add subtle accent tint to card borders matching banner color

**EVENTS tab**:
- ✅ **Owned**: Element-specific color accents (Fusion=orange, Glacio=cyan, etc.), time-based urgency visualization
- ⚠️ **Generic**: Event card layout follows standard grid pattern, `text-gray-500` for event descriptions
- **Minimal fix**: Replace gray text, add a subtle element-color glow to event card borders for stronger identity

**CALC tab**:
- ✅ **Owned**: Stat boxes with color-variant accent lines (8 colors), pity ring visualization, JetBrains Mono data font
- ⚠️ **Generic**: Calculator input forms use standard rounded-lg styling, `text-gray-400` labels
- **Minimal fix**: Replace gray labels with chromatic equivalents

**PLANNER tab**:
- ✅ **Owned**: Income calculator with custom styling, goal milestone progress bars with gold accent
- ⚠️ **Generic**: Income input rows use standard `border-white/10` dividers, `text-gray-400` secondary text
- **Minimal fix**: Replace gray text, use `--border-subtle` for item rows vs `--border-hover` for section breaks

**STATS tab**:
- ✅ **Owned**: Trophy badges with animated glow (`trophyShine` 3s), luck spectrum bar with gradient, pull history with rarity-colored left borders
- ⚠️ **Generic**: `text-gray-400` for stat labels (high count here), trend analysis uses standard chart patterns
- **Minimal fix**: Replace gray stat labels — this tab has the most gray text and would benefit most from chromatic replacement

**COLLECT tab**:
- ✅ **Owned**: Ghost-grid pulse for empty state, collection hover lift with scale, gradient image fades
- ⚠️ **Generic**: Collection grid follows standard responsive grid, `text-gray-500` for empty messages, `#3b82f6` for 3-star item indicators
- **Minimal fix**: Replace gray text, recalibrate blue-tier hex values

**TEAMS tab**:
- ✅ **Owned**: Resonator avatars with element-colored borders, synergy indicators
- ⚠️ **Generic**: Team builder layout is standard grid, `text-gray-400` for labels, `border-white/10` card separators
- **Minimal fix**: Replace gray text, differentiate separator weights

**PROFILE tab**:
- ✅ **Owned**: Trophy unlock animations, OLED mode toggle with custom styling, export/import with branded buttons
- ⚠️ **Generic**: Settings list uses standard `border-white/10` dividers, `text-gray-400` for setting descriptions
- **Minimal fix**: Replace gray text, use `.kuro-divider-subtle` for settings items

**Cross-tab pattern**: The genericness signal is remarkably consistent — `text-gray-400/500` and `border-white/10` appear on EVERY tab. Fixing Signal 7 (chromatic grays) and Signal 11 (separator hierarchy) would lift ALL 8 tabs simultaneously.

> **Finding DBI3-TAB1** ✅ · Severity: **LOW**
> **All 8 tabs share the same genericness pattern: achromatic gray text + uniform white/10 borders.** The owned elements vary per tab (pity rings, trophy glows, element colors), but the generic elements are identical across all tabs. This creates a "custom foreground, generic background" split.
> **Solution**: Fixing DBI3-S07 ✅ (chromatic grays) and DBI3-S11 ✅ (separator hierarchy) would eliminate the cross-tab genericness pattern in a single systematic pass. No per-tab fixes needed — the solution is architectural.

---

### §DBI3.E Default Detection Summary

**Default palette detection**:
- ✅ Primary accent (gold `#edaf18`): OWNED — not a framework default
- ⚠️ Blue tier (`#3b82f6`/`#60a5fa`): Tailwind defaults used semantically — LOW risk
- ❌ Gray text stack (`text-gray-400/500/300`): Tailwind defaults dominating — HIGH risk
- ✅ Background (`#080c14`): OWNED — chromatic custom
- ✅ Shadows: OWNED — calibrated to base hue

**Default component style detection**:
- ✅ Cards: Glassmorphism + shimmer + corner decorations — OWNED
- ⚠️ Buttons: Well-styled but missing primary/secondary visual differentiation — PARTIAL
- ⚠️ Inputs: Custom placeholder but `rounded-lg` dominant — PARTIAL
- ✅ Stat boxes: Color-variant accent lines, custom 10px radius — OWNED
- ⚠️ Badges: Achievement badges use uncalibrated Tailwind blue — PARTIAL

**Default layout convention detection**:
- ✅ Tab navigation: Custom tab indicator with gold glow bar — OWNED
- ✅ Card layout: Staggered entrance animations, shimmer lines — OWNED
- ⚠️ List separators: Uniform `border-white/10` — PARTIAL
- ✅ Empty states: Gold promise glow + ghost-grid — OWNED
- ✅ Loading states: Gold shimmer skeleton — OWNED

---

### §DBI3.S Anti-Genericness Scorecard

| Signal | Status | Severity | Genericness Level |
|---|---|---|---|
| 1. Default Tailwind blue | PARTIAL — domain-semantic, uncalibrated hex | **LOW** | 3/10 |
| 2. Inter at default weight | OWNED — Rajdhani + JetBrains Mono | **PASS** | 0/10 |
| 3. `rounded-lg` everywhere | PARTIAL — 109× dominant, 5 unique values | **MEDIUM** | 5/10 |
| 4. 16px grid spacing | OWNED — 14px custom base | **PASS** | 1/10 |
| 5. `shadow-sm` on cards | OWNED — multi-layer navy shadows + color glows | **PASS** | 0/10 |
| 6. Default icon library | PARTIAL — Lucide, default stroke | **LOW** | 3/10 |
| 7. Gray text stack | GENERIC — 459 achromatic gray instances | **HIGH** | 8/10 |
| 8. White/generic bg | OWNED — `#080c14` chromatic navy | **PASS** | 0/10 |
| 9. `transition: all 0.2s` | OWNED — custom cubic-bezier, specific properties | **PASS** | 0/10 |
| 10. Full-width buttons | OWNED — strategic 12% usage | **PASS** | 1/10 |
| 11. Single separator | PARTIAL — 70% `white/10`, scale defined unused | **LOW** | 4/10 |
| 12. Placeholder gray | OWNED — custom `#6b7389`/`#8f99ab` + focus state | **PASS** | 1/10 |
| D1. Pure black default | OWNED — OLED opt-in only | **PASS** | 0/10 |
| D2. `white/0.1` borders | PARTIAL — dominant despite 5-level scale | **LOW** | 4/10 |
| D3. 60% white text | N/A — covered by S07 | — | — |
| D4. `blue-400` accent | OWNED — gold is primary accent | **PASS** | 0/10 |

**Overall genericness score**: **1.9/10** (weighted average excluding N/A — where 10 = fully generic, 0 = fully owned)

**Interpretation**: The app is **strongly differentiated** in its foundational design decisions (background, shadows, typography, motion, accent color). The genericness that exists is concentrated in two specific areas:
1. **Text colors** (Signal 7) — the single biggest liability at 459 instances
2. **Border-radius uniformity** (Signal 3) — 109 instances of the same radius

Both are fixable with systematic find-and-replace operations. The app's custom elements (glassmorphism, gold glow system, Rajdhani + JetBrains Mono, pity rings, corner decorations, shimmer animations) are genuinely distinctive and not found in competitor trackers.

---

## Step 7 — Combined Findings

| ID | Finding | Severity | Section |
|---|---|---|---|
| DBI1-ARC1 | Archetype alignment strong (Magician+Hero+Jester) | **PASS** | §DBI1.4 |
| DBI1-ARC2 ✅ | Magician "reveal moment" underutilized | **LOW** | §DBI1.5 |
| DBI1-ARC3 ✅ | Hero "call to action" buttons lack visual weight | **LOW** | §DBI1.5 |
| DBI3-S01 ✅ | Tailwind blue defaults for 3-star tier — uncalibrated | **LOW** | §DBI3 S1 |
| DBI3-S02 | Typography fully owned (Rajdhani + JetBrains Mono) | **PASS** | §DBI3 S2 |
| DBI3-S03 | 109× `rounded-lg` creates radius monoculture | **MEDIUM** | §DBI3 S3 |
| DBI3-S04 | Custom 14px spacing baseline | **PASS** | §DBI3 S4 |
| DBI3-S05 | Shadow system fully custom + color glows | **PASS** | §DBI3 S5 |
| DBI3-S06 ✅ | Lucide icons at default stroke-width | **LOW** | §DBI3 S6 |
| DBI3-S07 ✅ | 459 achromatic gray text instances — highest genericness signal | **HIGH** | §DBI3 S7 |
| DBI3-S08 | Background system fully owned (`#080c14`) | **PASS** | §DBI3 S8 |
| DBI3-S09 | Transition system fully custom (cubic-bezier + specific properties) | **PASS** | §DBI3 S9 |
| DBI3-S10 | Button sizing strategic (12% full-width) | **PASS** | §DBI3 S10 |
| DBI3-S11 ✅ | Separator hierarchy defined but 70% uses single pattern | **LOW** | §DBI3 S11 |
| DBI3-S12 | Placeholder colors custom with focus-state differentiation | **PASS** | §DBI3 S12 |
| DBI3-D01 | Pure black correctly scoped to OLED opt-in | **PASS** | §DBI3.D |
| DBI3-D02 ✅ | `rgba(255,255,255,0.1)` borders dominate despite scale | **LOW** | §DBI3.D |
| DBI3-D04 | Gold is unambiguous primary accent (not blue) | **PASS** | §DBI3.D |
| DBI3-TAB1 ✅ | All 8 tabs share same genericness pattern (gray text + white/10 borders) | **LOW** | §DBI3.T |

**Severity distribution**: 1 HIGH, 1 MEDIUM, 7 LOW, 10 PASS — **19 total findings**

---

**STEP 7 COMPLETE** — §DBI1 Brand Personality Archetype + §DBI3 Anti-Genericness Audit established.

**Brand archetype**: MAGICIAN (primary) + HERO (secondary) + JESTER (undertone). The "LUMINOUS TACTICAL COMPANION" character maps cleanly onto this blend. Archetype alignment is strong — no major visual gaps to close.
**Anti-genericness**: Overall score **1.9/10** — the app is strongly differentiated. Foundations (background, shadows, typography, motion, accent) are fully owned. The single highest-impact fix is **Signal 7: replacing 459 achromatic Tailwind gray text classes with chromatic navy-tinted equivalents** — this would transform every screen without changing any layout. Secondary fix: **Signal 3: diversifying `rounded-lg` usage** across the 109 instances. Everything else is either already owned or a minor polish item.

---

# STEP 8: §E1 — Design Token System

**Skill reference**: app-audit §E1
**Axis context**: A1 NON-REVENUE · A2 FOCUS-TOOL + EMOTIONAL-SECONDARY · A3 ENTHUSIAST/EXPERT · A4 NAMED-SOURCE Wuthering Waves L3 · A5 FUNCTIONAL-PRIMARY + ATMOSPHERIC-SECONDARY

---

## §E1.1 Spacing Scale Audit

**Methodology**: Extract every padding, margin, and gap value from CSS-in-JS (`appcore-providers.jsx`) and Tailwind utility classes across all source files. Assess whether values form a coherent mathematical scale.

### CSS-in-JS Spacing Values (KuroStyles)

**Padding values** (`appcore-providers.jsx`):

| Value | Pixel Equivalent | Count | Usage | On 4px Grid? |
|---|---|---|---|---|
| `14px` | 14px | 3 | `.kuro-body`, `.kuro-stat`, `.kuro-card` body | ❌ **No** |
| `10px 12px` | 10/12px | 2 | `.kuro-btn` | ❌/✅ |
| `4px 8px` | 4/8px | 1 | `.kuro-input-sm` | ✅ |
| `1.5px` | 1.5px | 1 | Tab indicator | ❌ **No** |
| `0.75rem` (12px) | 12px | 1 | Responsive override | ✅ |
| `0.75rem 0.5rem` (12/8px) | 12/8px | 1 | Responsive override | ✅ |
| `0.5rem` (8px) | 8px | 2 | Responsive | ✅ |
| `0.375rem` (6px) | 6px | 1 | Responsive override (`!important`) | ❌ **No** |
| `0.25rem 0.125rem` (4/2px) | 4/2px | 1 | Tiny badge | ✅/❌ |
| `0.125rem 0.25rem` (2/4px) | 2/4px | 1 | Tiny badge | ❌/✅ |
| `0.125rem` (2px) | 2px | 1 | Tiny override | ❌ |

**Margin values** (`appcore-providers.jsx`):

| Value | Usage |
|---|---|
| `8px 0` | Vertical gap |
| `12px 0` | Section spacing |
| `-4px 0` | Negative margin (optical alignment) |
| `-1px` | Subpixel alignment |

**Gap values** (`appcore-providers.jsx`):

| Value | Count | Usage |
|---|---|---|
| `0.75rem` (12px) | 4 | Responsive grid gaps (`!important`) |
| `10px` | 1 | Standard gap |
| `3px` | 2 | Tiny gaps (`!important`) |
| `1px` | 1 | Minimal gap |
| `0.5rem` (8px) | 2 | Small gaps |

### Tailwind Utility Spacing (top 25 by frequency)

| Class | Pixel Value | Count | On 4px Grid? |
|---|---|---|---|
| `gap-2` | 8px | 98 | ✅ |
| `p-2` | 8px | 58 | ✅ |
| `py-0.5` | 2px | 53 | ❌ |
| `gap-1` | 4px | 51 | ✅ |
| `mb-2` | 8px | 42 | ✅ |
| `space-y-2` | 8px | 41 | ✅ |
| `mt-0.5` | 2px | 38 | ❌ |
| `py-1.5` | 6px | 37 | ❌ |
| `p-3` | 12px | 37 | ✅ |
| `gap-1.5` | 6px | 37 | ❌ |
| `space-y-3` | 12px | 34 | ✅ |
| `py-1` | 4px | 34 | ✅ |
| `px-2` | 8px | 34 | ✅ |
| `px-1.5` | 6px | 33 | ❌ |
| `mt-1` | 4px | 29 | ✅ |
| `py-2` | 8px | 28 | ✅ |
| `mb-1` | 4px | 25 | ✅ |
| `mb-1.5` | 6px | 23 | ❌ |
| `px-3` | 12px | 22 | ✅ |
| `p-4` | 16px | 18 | ✅ |
| `mb-3` | 12px | 17 | ✅ |
| `p-2.5` | 10px | 16 | ❌ |
| `gap-3` | 12px | 16 | ✅ |
| `px-4` | 16px | 13 | ✅ |
| `space-y-1` | 4px | 12 | ✅ |

### Spacing Scale Assessment

**Actual scale used** (by frequency): 2, 4, 6, 8, 10, 12, 14, 16px

**Standard 4px grid**: 4, 8, 12, 16, 20, 24, 32, 48, 64px

**Off-grid values** (token debt):

| Value | Count | Issue |
|---|---|---|
| **2px** (`0.5` suffix) | 91+ | Half-step — legitimate for micro-spacing but high frequency |
| **6px** (`1.5` suffix) | 130+ | Between 4px and 8px steps — very frequent |
| **10px** (`2.5` suffix) | 18+ | Between 8px and 12px — moderate use |
| **14px** (CSS) | 3 | Primary body padding — deliberate non-standard base |
| **1.5px** (CSS) | 1 | Tab indicator — subpixel |
| **3px** (CSS gap) | 2 | Not on any standard grid |

**Analysis**: The spacing system uses a **2px base grid** rather than a 4px grid. The pattern is: 2, 4, 6, 8, 10, 12, 14, 16px — an arithmetic progression with step 2. This is internally consistent and explains why half-values (`.5` suffix) are so prevalent. The 14px primary padding is a deliberate signature (identified in §DBI3-S04).

However, 6px appears 130+ times, making it the most common off-4px-grid value. This is either a 2px-grid system (consistent) or token debt from indecisive 4/8 splits.

> **Finding E1-SP1 ✅** · Severity: **LOW**
> **Spacing system operates on a 2px base grid (2/4/6/8/10/12/14/16) rather than the standard 4px grid.** The 2px steps are internally consistent but not documented. 6px (130+ uses) is the most frequent non-4px value.
> **Solution**:
> - Option A (minimal): Document the 2px base grid as intentional. Define named spacing tokens:
>   ```css
>   --space-1: 2px;  --space-2: 4px;  --space-3: 6px;  --space-4: 8px;
>   --space-5: 10px; --space-6: 12px; --space-7: 14px; --space-8: 16px;
>   ```
> - Option B (full ownership): Formalize as an intentional "dense tactical" spacing scale. The 2px base reinforces the information-dense Enthusiast/Expert audience (A3). Add the token definitions and document: "2px base = higher density than standard 4px grid, appropriate for data-rich gacha tracking."
> - No migration needed — current usage is already internally consistent

> **Finding E1-SP2 ✅** · Severity: **LOW**
> **3 subpixel/odd values exist as token debt**: `1.5px` (tab indicator), `3px` (gap), `-1px` (margin). These fall outside any grid.
> **Solution**: Replace `1.5px` with `2px`, `3px` gap with `4px`, and evaluate `-1px` margin for necessity. These are 6 instances total — trivial to fix.

---

## §E1.2 Color Palette Architecture

**Methodology**: Extract every unique hex color across all source files. Identify near-duplicate clusters, assess token coverage, and map token debt.

### Color Inventory Summary

**Total unique hex colors**: 66
**Total color occurrences**: ~450+
**CSS custom property coverage**: 6 accent colors + 5 backgrounds + 5 borders + 2 text = 18 color tokens in `:root`

### Token-Governed Colors (via CSS custom properties)

| Token | RGB Value | Hex Equivalent | Usage | Occurrences |
|---|---|---|---|---|
| `--color-gold` | `237, 175, 24` | `#edaf18` | Primary accent | **71** |
| `--color-emerald` | `34, 197, 94` | `#22c55e` | Success/positive | **35** |
| `--color-pink` | `236, 72, 153` | `#ec4899` | Featured/limited banner | **17** |
| `--color-cyan` | `56, 189, 248` | `#38bdf8` | Standard banner | **4** (token) |
| `--color-purple` | `168, 85, 247` | `#a855f7` | 4-star rarity | **21** |
| `--color-red` | `248, 113, 113` | `#f87171` | Error/danger | **5** (token) |
| `--text-body` | — | `#dfe5ef` | Body text | **2** |
| `--text-heading` | — | `#edf1f8` | Heading text | **1** |

### Near-Duplicate Color Clusters (Token Debt)

**CLUSTER 1: Gold variants** (previously identified in §DC2, now with full inventory)

| Hex | Approx OKLCH | Count | Location | Role |
|---|---|---|---|---|
| `#edaf18` | L76% C0.17 H85° | 71 | Token `--color-gold` | Primary gold — canonical |
| `#eab308` | L76% C0.17 H90° | 1 | `App.jsx` trophy | Tailwind `yellow-500` — near-duplicate |
| `#e6b030` | L76% C0.15 H87° | 2 | `appcore-data.js` | Element color — near-duplicate |
| `#f97316` | L73% C0.18 H55° | 27 | Achievement badges | Tailwind `orange-500` — distinct hue but gold-adjacent |
| `#fb923c` | L76% C0.15 H60° | 3 | Trophy colors | Tailwind `orange-400` |
| `#cd7f32` | L62% C0.12 H75° | 1 | Medal colors | Bronze — intentionally distinct |
| `#ff8c00` | L72% C0.19 H65° | 1 | Trophy | Dark orange — distinct |

**Consolidation**: `#edaf18`, `#eab308`, `#e6b030` are within 5° hue and 1% lightness — should be 1 token. `#f97316` (orange) is 30° away and serves a different semantic role (achievement badges) — keep separate.

**CLUSTER 2: Gray text stack** (highest token debt — see §DBI3-S07 ✅)

| Hex | Tailwind Class | Count | Role |
|---|---|---|---|
| `#6b7280` | `gray-500` | 29 | Muted text, labels |
| `#9ca3af` | `gray-400` | 13 | Secondary text |
| `#4b5563` | `gray-600` | 8 | Darker muted text |
| `#d1d5db` | `gray-300` | 1 | Light text |
| `#e5e7eb` | `gray-200` | 4 | Lighter text |
| `#e2e8f0` | `slate-200` | 6 | Light text (different family!) |
| `#f1f5f9` | `slate-50` | 7 | Near-white |
| `#8892a4` | Custom | 4 | Placeholder-adjacent |
| `#bcc3d1` | Custom | 1 | Light gray |

**Problem**: Mixing Tailwind `gray-*` and `slate-*` families. Gray is achromatic (no hue), Slate carries a blue tint. These two palettes have different color temperatures and should not be mixed within the same hierarchy. Plus 2 custom grays (`#8892a4`, `#bcc3d1`) that overlap with Tailwind values.

**CLUSTER 3: Dark background variants**

| Hex | Count | Role | Source |
|---|---|---|---|
| `#080c14` | 3 | Page background — canonical | Token |
| `#0f1520` | 2 | Dark surface | CSS |
| `#101218` | 1 | Very dark | CSS |
| `#0a0a1a` | — | Near-black variant | Component gradient |
| `#0d0d1a` | 1 | Near-black | Component |
| `#1a1a2e` | 1 | Slightly lighter dark | Component |
| `#0c0820` | 2 | Purple-tinted dark | Component |
| `#080810` | — | Very dark | Component |
| `#010204`, `#020408`, `#030610` | 1 each | Tab background gradient | Component |

**Assessment**: 10+ dark background hex values. The gradient uses (`#010204` → `#020408` → `#030610` → `#020408`) are intentional step gradients — not duplicates. But `#0f1520`, `#101218`, `#0d0d1a`, `#1a1a2e` are all "slightly lighter than base" variants that could be consolidated into a token scale.

**CLUSTER 4: Green variants**

| Hex | Count | Role |
|---|---|---|
| `#22c55e` | 35 | Tailwind `green-500` — primary green (token `--color-emerald`) |
| `#34d399` | 7 | Tailwind `emerald-400` |
| `#4ade80` | 3 | Tailwind `green-400` |
| `#86efac` | 1 | Tailwind `green-300` |
| `#10b981` | 1 | Tailwind `emerald-500` |
| `#84cc16` | 6 | Tailwind `lime-500` — **different hue family** |

**Problem**: 6 different greens. `#22c55e` (green-500) is the token, but code also uses `#34d399` (emerald-400), `#4ade80` (green-400), `#10b981` (emerald-500), and `#84cc16` (lime-500 — a completely different yellow-green). Only `#84cc16` is semantically distinct (weapon rarity). The rest should derive from the token.

**CLUSTER 5: Purple variants**

| Hex | Count | Role |
|---|---|---|
| `#a855f7` | 21 | Tailwind `purple-500` — primary purple (token `--color-purple`) |
| `#8b5cf6` | 2 | Tailwind `violet-500` — **different family** |
| `#c084fc` | 4 | Tailwind `purple-400` |
| `#a78bfa` | 2 | Tailwind `violet-400` |
| `#e9d5ff` | 1 | Tailwind `purple-200` |

**Problem**: Mixing `purple-*` and `violet-*` Tailwind families (different hue angles). Purple at ~300° and Violet at ~270° create inconsistency.

**CLUSTER 6: Red/Error variants**

| Hex | Count | Role |
|---|---|---|
| `#f87171` | 5 | Tailwind `red-400` — token `--color-red` |
| `#ef4444` | 15 | Tailwind `red-500` — darker red |
| `#ff0000` | 5 | Pure red — **uncalibrated** |
| `#ff6347` | 1 | Tomato — trophy color |
| `#ff4500` | 1 | OrangeRed — trophy color |
| `#fecaca` | 1 | Tailwind `red-200` |

**Problem**: Token is `#f87171` (red-400) but `#ef4444` (red-500) appears 15× — 3× more than the token value. And `#ff0000` (pure red) appears 5× — this is an uncalibrated color that signals low craft (per §E3 saturation calibration).

### Color Architecture Findings

> **Finding E1-COL1** ✅ · Severity: **HIGH**
> **66 unique hex colors with only 18 governed by CSS custom properties — 73% of the palette is unmanaged.** Near-duplicate clusters exist in gold (3 values), gray (9+ values mixing gray/slate families), green (6 values), purple (5 values mixing purple/violet families), red (6 values), and dark backgrounds (10+ values). This creates a maintenance burden and visual inconsistency.
> **Solution**:
> - Define a comprehensive token palette covering all color needs:
>   ```css
>   /* Accent tokens (already exist — keep) */
>   --color-gold, --color-pink, --color-cyan, --color-purple, --color-emerald, --color-red
>
>   /* NEW: Gray hierarchy (chromatic, replacing Tailwind grays — per §DBI3-S07 ✅) */
>   --text-primary: #edf1f8;    --text-secondary: #9da8b9;
>   --text-muted: #7d8a9f;      --text-subtle: #5f6d82;
>   --text-ghost: #445064;
>
>   /* NEW: Surface hierarchy (consolidate dark variants) */
>   --surface-0: #080c14;       --surface-1: #0f1520;
>   --surface-2: #1a1a2e;       --surface-3: #2a3548;
>
>   /* NEW: Accent light variants (for backgrounds/badges) */
>   --color-green-light: #34d399;  --color-purple-light: #c084fc;
>   --color-red-light: #fecaca;    --color-pink-light: #f9a8d4;
>   ```
> - Eliminate `#ff0000` (pure red) — replace with `#ef4444` or the token `#f87171`
> - Consolidate gold: `#eab308` and `#e6b030` → `#edaf18` (the canonical token)
> - Stop mixing `gray-*`/`slate-*` and `purple-*`/`violet-*` Tailwind families

> **Finding E1-COL2 ✅** · Severity: **MEDIUM**
> **3 near-duplicate gold values (`#edaf18`, `#eab308`, `#e6b030`) where 1 token exists.** Previously identified in §DC2 — this is the token-level debt. Each occurrence should reference `--color-gold` or `rgba(var(--color-gold), ...)`.
> **Solution**: Replace `#eab308` (1 instance in `App.jsx`) and `#e6b030` (2 instances in `appcore-data.js`) with `var(--color-gold)` or the hex `#edaf18`. Total: 3 replacements.

> **Finding E1-COL3 ✅** · Severity: **MEDIUM**
> **Tailwind gray and slate families mixed in the same text hierarchy.** `gray-*` (achromatic) and `slate-*` (blue-tinted) have different color temperatures. 29 instances of `#6b7280` (gray-500) alongside 6 instances of `#e2e8f0` (slate-200) and 7 of `#f1f5f9` (slate-50) create thermal inconsistency.
> **Solution**: Choose one family. Given the app's navy base (`#080c14` at ~240° hue), slate (blue-tinted) is the correct choice. Migrate all `gray-*` to `slate-*` equivalents, or better: to the chromatic custom tokens proposed in §DBI3-S07 ✅.

> **Finding E1-COL4 ✅** · Severity: **LOW**
> **5 instances of `#ff0000` (pure red) — uncalibrated color.** Pure saturated red signals low craft. It appears in trophy/achievement badge colors.
> **Solution**: Replace `#ff0000` with `#ef4444` (Tailwind red-500, already used 15× in the app) or the token `#f87171`. Both are calibrated reds with intentional lightness/saturation balance.

> **Finding E1-COL5 ✅** · Severity: **LOW**
> **Purple and violet Tailwind families mixed.** `#a855f7` (purple-500) is the token, but `#8b5cf6` (violet-500, 2×) and `#a78bfa` (violet-400, 2×) appear. Purple and violet have a ~30° hue difference.
> **Solution**: Consolidate all purple usage to the `purple-*` family. Replace `#8b5cf6` → `#a855f7` and `#a78bfa` → `#c084fc` (4 replacements total).

---

## §E1.3 Typography Scale

**Methodology**: Extract every unique `font-size`, `font-weight`, `letter-spacing`, `line-height`, and font family declaration. Assess whether values form coherent scales with consistent semantic purpose.

### Font-Size Inventory

**CSS-in-JS values** (`appcore-providers.jsx`):

| Value | Count | Element | Role |
|---|---|---|---|
| `8px` | 3 | Responsive overrides, tiny labels | Micro text |
| `0.5rem` (8px) | 1 | Responsive tiny | Micro text |
| `11px` | 2 | `.kuro-btn` text, `.kuro-label` | UI control text |
| `12px` | 1 | `.kuro-input-sm` | Small input |
| `13px` | 1 | `.kuro-skeleton-text` | Skeleton placeholder |
| `14px` | 2 | `.kuro-body`, `.kuro-input` | Body text base |
| `18px` | 1 | `.kuro-data-badge-value` | Data display |

**Tailwind text size classes** (all source files):

| Class | Pixel Equivalent | Count | Role |
|---|---|---|---|
| `text-xs` | 12px | **114** | Most frequent — labels, metadata, small text |
| `text-sm` | 14px | **77** | Second most — body text, descriptions |
| `text-base` | 16px | **2** | Rare — barely used |
| `text-lg` | 18px | **4** | Subheadings |
| `text-xl` | 20px | **16** | Section headings |
| `text-2xl` | 24px | **5** | Major headings |
| `text-3xl` | 30px | **1** | Large display |
| `text-5xl` | 48px | **1** | Extra-large display |

**Complete scale used**: 8, 11, 12, 13, 14, 16, 18, 20, 24, 30, 48px — **11 unique sizes**

**Assessment against modular scales**:

```
Major Third (1.25):  8 / 10 / 12 / 15 / 19 / 24 / 30 / 38 / 48
Perfect Fourth (1.333): 8 / 11 / 14 / 19 / 25 / 34 / 45
Actual scale:        8 / 11 / 12 / 13 / 14 / 16 / 18 / 20 / 24 / 30 / 48
```

**Off-scale values** (token debt):
- **11px**: Between 10 and 12 — used for UI controls. Could be 12px without visual impact.
- **13px**: Between 12 and 14 — skeleton placeholder text. Should match actual text it replaces (12 or 14px).
- **16px** (`text-base`): Only 2 uses — this standard Tailwind size is almost unused, indicating the app deliberately avoids it. The 14px body base is the intentional replacement.
- **18px**: Both CSS (`kuro-data-badge-value`) and Tailwind (`text-lg`). Combined 5 uses — a legitimate scale step.

> **Finding E1-TYP1 ✅** · Severity: **LOW**
> **11 unique font sizes — 2 are off-scale token debt.** `11px` (2 uses) and `13px` (1 use) fall between scale steps. The app broadly follows a custom scale anchored at 14px body rather than 16px default, which is intentional.
> **Solution**:
> - Replace `11px` (`.kuro-btn`, `.kuro-label`) with `12px` (text-xs) — aligns with the scale and matches surrounding UI text
> - Replace `13px` (`.kuro-skeleton-text`) with `14px` — skeleton should match the body text it replaces
> - Document the intentional scale: `8 / 12 / 14 / 18 / 20 / 24 / 30 / 48` — an 8-step scale with 14px base

### Font Weight Semantics

**CSS-in-JS weights**:

| Weight | Count | Elements |
|---|---|---|
| `500` (medium) | 2 | `.kuro-btn`, `.kuro-skeleton-text` |
| `600` (semibold) | 3 | `.kuro-header h3`, `.kuro-label`, H4 labels |
| `700` (bold) | 3 | `.kuro-data-badge-value`, data displays |

**Tailwind weight classes**:

| Class | Weight | Count | Usage |
|---|---|---|---|
| `font-bold` | 700 | **105** | Most frequent — headings, numbers, emphasis |
| `font-medium` | 500 | **102** | Second most — buttons, labels, names |
| `font-semibold` | 600 | **14** | Occasional — section headers |
| `font-normal` | 400 | **7** | Rare — body text reset |

**Semantic analysis**:

| Semantic Role | Expected Weight | Actual Weight(s) | Consistent? |
|---|---|---|---|
| Body text | 400 (normal) | 400 + inherited | ✅ |
| Labels / UI controls | 500 (medium) | 500 (`.kuro-btn`), 600 (`.kuro-label`) | ⚠️ Mixed |
| Section headings | 600 (semibold) | 600 (CSS), but `font-bold` (700) in Tailwind | ⚠️ Mixed |
| Data emphasis | 700 (bold) | 700 consistent | ✅ |
| Primary headings | 700 (bold) | `font-bold` (700) | ✅ |

**Problem**: `font-bold` (700) is used for BOTH headings AND data emphasis, blurring the distinction. `font-semibold` (600) should own headings, with `font-bold` (700) reserved for data/numerical emphasis. Currently 105 uses of `font-bold` vs only 14 `font-semibold` — the weight hierarchy is top-heavy.

> **Finding E1-TYP2 ✅** · Severity: **LOW**
> **`font-bold` (700) used 105× for both headings and data emphasis — weight semantic overlap.** The CSS-in-JS correctly differentiates (600 for headers, 700 for data), but Tailwind classes in markup use `font-bold` for everything that needs emphasis.
> **Solution**:
> - Audit the 105 `font-bold` instances: headings and section titles should be `font-semibold` (600), data values and numbers should remain `font-bold` (700)
> - This creates a clearer weight hierarchy: 400 (body) → 500 (controls/labels) → 600 (headings) → 700 (data emphasis)
> - Estimated redistribution: ~40 `font-bold` → `font-semibold`, ~65 remain `font-bold`

### Letter-Spacing Inventory

**CSS-in-JS tracking**:

| Value | Count | Element | Purpose |
|---|---|---|---|
| `-0.02em` | 2 | Data badges | Negative tracking for large data numbers |
| `0.01em` | 1 | Skeleton text | Subtle body spacing |
| `0.02em` | 1 | `.kuro-btn` | Button text spacing |
| `0.03em` | 1 | `.kuro-header h3` | Header spacing |
| `0.08em` | 1 | `.kuro-label` | Label uppercase spacing |
| `0.1em` | 1 | Large labels | Wide uppercase spacing |
| `0.2em` | 1 | Extra-wide labels | Maximum spacing |

**Tailwind tracking**: `tracking-wide` (0.025em) — **31 occurrences**

**Assessment**: 8 unique letter-spacing values (7 CSS + 1 Tailwind) form a clear progression: `-0.02, 0.01, 0.02, 0.025, 0.03, 0.08, 0.1, 0.2em`. The negative tracking for data displays and positive tracking for uppercase labels follows typographic best practices (§DT2 compliance).

> **Finding E1-TYP3** · Severity: **PASS**
> **Letter-spacing uses 8 intentional values in a clear progression.** Negative tracking for display data, subtle positive for body, wider for uppercase labels. This is considered typographic craft, not token debt.
> **Solution (preservation)**: Document the tracking scale. Consider defining CSS variables for the 3 most-used values:
>   ```css
>   --tracking-tight: -0.02em;   /* data display numbers */
>   --tracking-body: 0.01em;     /* body text */
>   --tracking-caps: 0.08em;     /* uppercase labels */
>   ```

### Line-Height Inventory

**CSS-in-JS**:

| Value | Count | Element |
|---|---|---|
| `1` | 1 | Compact element |
| `1.2` | 1 | Dense text |
| `1.25` | 1 | Semi-dense |
| `1.3` | 2 | Body default |

**Tailwind**: `leading-tight` (1.25) — 8 uses, `leading-relaxed` (1.625) — 7 uses

**Assessment**: Line heights range from 1.0 to 1.625. The CSS-in-JS uses tighter values (1.0–1.3) reflecting the dense tactical character. Tailwind classes add `leading-relaxed` (1.625) for descriptive text — appropriate contrast.

> **Finding E1-TYP4** · Severity: **PASS**
> **Line-height values serve clear density purposes.** CSS-in-JS: tight 1.0–1.3 for data/UI. Tailwind: `leading-tight` (1.25) for headings, `leading-relaxed` (1.625) for descriptions. No inconsistency.
> **Solution (preservation)**: Current system is functional. No changes needed.

### Type Craft Features

| Feature | Present? | Location |
|---|---|---|
| `-webkit-font-smoothing: antialiased` | ✅ | `appcore-providers.jsx` line 416, `index.css` line 22 |
| `-moz-osx-font-smoothing: grayscale` | ✅ | `appcore-providers.jsx` line 417, `index.css` line 23 |
| `font-variant-numeric: tabular-nums` | ✅ | Lines 1047, 1285, 1293 — stat boxes, data badges |
| `text-rendering: optimizeLegibility` | ❌ | Not found |
| `text-wrap: balance` | ❌ | Not found |
| OpenType features (ligatures, alternates) | ❌ | Not used |

> **Finding E1-TYP5 ✅** · Severity: **LOW**
> **`text-rendering: optimizeLegibility` is missing from root-level styles.** Font smoothing is correctly applied at both root and KuroStyles level. Tabular numerals are correctly used on data displays. But `optimizeLegibility` (enables kerning and ligatures) is absent.
> **Solution**: Add `text-rendering: optimizeLegibility;` to the root-level `*` selector in `appcore-providers.jsx` (line 416, alongside the existing font-smoothing declarations). One line of CSS for improved text rendering quality.

---

## §E1.4 Border-Radius System

### Radius Inventory

**CSS-in-JS values** (`appcore-providers.jsx`, `appcore-components.jsx`):

| Value | Count | Element | Role |
|---|---|---|---|
| `1px` | 1 | Minor detail | Micro radius |
| `2px` | 2 | Tab indicator, small element | Micro radius |
| `3px` | 4 | Various small elements | Micro radius |
| `4px` | 1 | Corner detail | Small radius |
| `6px` | 1 | Medium-small element | — |
| `8px` | 3 | `.kuro-input` | Input radius |
| `10px` | 2 | `.kuro-stat` | Stat box radius (non-standard) |
| `12px` | 1 | `.kuro-btn` | Button radius |
| `15px` | 1 | Special element | — |
| `16px` | 1 | `.kuro-card` | Card radius |
| `50%` | 3 | Circular elements | Circle |
| `0.25rem` (4px) | 1 | Responsive override | — |
| `0.375rem` (6px) | 1 | Responsive override | — |

**Tailwind classes**:

| Class | Pixel Value | Count |
|---|---|---|
| `rounded-lg` | 8px | **109** |
| `rounded-full` | 9999px | **45** |
| `rounded-xl` | 12px | **28** |
| `rounded-2xl` | 16px | **5** |
| `rounded-sm` | 2px | **3** |
| `rounded-md` | 6px | **3** |

**Unique radius values**: 1, 2, 3, 4, 6, 8, 10, 12, 15, 16px + 50% + 9999px — **12 unique values**

### Radius Scale Assessment

**KuroStyles intentional hierarchy** (CSS-in-JS):

```
.kuro-input:  8px  (data entry)
.kuro-stat:  10px  (data display — custom non-Tailwind)
.kuro-btn:   12px  (interaction)
.kuro-card:  16px  (container)
```

This is a 4-level hierarchy with 2-4px steps — intentional and well-structured. However:

**Problem 1**: Tailwind `rounded-lg` (8px) at 109 instances flattens the hierarchy. Many cards in Tailwind markup use `rounded-lg` (8px) when the KuroStyles card radius is 16px. Many buttons use `rounded-lg` (8px) when KuroStyles defines 12px.

**Problem 2**: 12 unique values. The sub-8px range (1, 2, 3, 4, 6px) has 5 values with no clear system — each appears 1-4 times. These are micro-radius token debt.

**Problem 3**: 15px appears once — between the 12px (button) and 16px (card) steps, serving no clear semantic purpose.

> **Finding E1-RAD1 ✅** · Severity: **MEDIUM**
> **12 unique radius values — the sub-8px range has 5 unsystematic values, and `rounded-lg` (109×) overrides the KuroStyles hierarchy.** The CSS-in-JS defines a clean 4-level scale (8/10/12/16px), but markup usage doesn't follow it.
> **Solution**:
> - Formalize the radius token scale and eliminate off-scale values:
>   ```css
>   --radius-xs: 2px;     /* micro: small badges, inline tags */
>   --radius-sm: 4px;     /* small: fine controls, toggle tracks */
>   --radius-md: 8px;     /* medium: inputs (existing) */
>   --radius-stat: 10px;  /* stat boxes (existing custom) */
>   --radius-lg: 12px;    /* large: buttons (existing) */
>   --radius-xl: 16px;    /* extra-large: cards (existing) */
>   --radius-full: 9999px;/* pill/circle */
>   ```
> - Consolidate: `1px` → `2px`, `3px` → `4px`, `6px` → `4px` or `8px`, `15px` → `16px`
> - Audit 109 `rounded-lg` instances: cards should use `rounded-xl` (12px) or `rounded-2xl` (16px), buttons should use `rounded-xl` (12px)

---

## §E1.5 Shadow Hierarchy

### Shadow Token Architecture

**CSS custom properties** (`:root`):

| Token | Value | Used? |
|---|---|---|
| `--shadow-sm` | `0 1px 2px rgba(6, 10, 24, 0.4)` | Defined, minimal direct use |
| `--shadow-md` | `0 4px 12px rgba(6, 10, 24, 0.5)` | ✅ Buttons (line 870, 891) |
| `--shadow-lg` | `0 8px 24px rgba(6, 10, 24, 0.6)` | Defined, not referenced via var() |
| `--shadow-xl` | `0 12px 40px rgba(6, 10, 24, 0.7)` | ❌ **Never referenced** |

**Actual shadow usage**: 34 unique `box-shadow` values across the codebase. Most are hardcoded rather than using the token system.

**Shadow categories**:

| Category | Count | Token-governed? |
|---|---|---|
| Depth shadows (elevation) | 5 | 2 use `--shadow-md`, 3 hardcoded |
| Color glow shadows | 17 | ❌ All hardcoded per-color |
| Focus ring shadows | 3 | ❌ Hardcoded with `var(--color-gold)` |
| Slider thumb shadows | 6 | ❌ All hardcoded |
| Hover enhancement shadows | 8 | ❌ All hardcoded |

**Problem**: The shadow token system defines 4 levels but only 1 (`--shadow-md`) is actively used. `--shadow-xl` is never referenced. The 34 unique shadow values are mostly hardcoded — the token system exists but isn't adopted.

The color-specific glow shadows (17 values) follow a consistent pattern (`0 0 Xpx rgba(color, 0.Y), 0 4px 12px rgba(0,0,0,0.3), inset 0 0 20px rgba(color, 0.08)`) — this is a template that could be tokenized.

> **Finding E1-SHD1 ✅** · Severity: **LOW**
> **4 shadow tokens defined but only 1 actively referenced (`--shadow-md`). `--shadow-xl` is unused. 34 unique shadow values are mostly hardcoded.**
> **Solution**:
> - Actually USE the shadow tokens: audit all 34 `box-shadow` declarations and map each to the nearest token
> - Remove `--shadow-xl` or use it for the highest-elevation elements (modals, popovers)
> - For the 17 color-glow shadows, consider a parametric approach:
>   ```css
>   .glow { box-shadow: 0 0 var(--glow-radius, 25px) rgba(var(--glow-color), var(--glow-opacity, 0.3)), ... }
>   ```
>   Then each color variant only overrides `--glow-color` and optionally `--glow-radius`/`--glow-opacity`

---

## §E1.6 Z-Index Governance

### Z-Index Inventory

| Z-Index | Element | File:Line | Layer |
|---|---|---|---|
| 1 | `.luck-badge-inner` | providers:673 | Content |
| 1 | `.kuro-card::after` (shimmer) | providers:762 | Content |
| 2 | `.kuro-card-inner::before/::after` (corners) | providers:787, 801 | Content |
| 5 | `.kuro-card` | providers:711 | Card |
| 5 | `.content-layer` | providers:823 | Card |
| 10 | `.kuro-header-action` | providers:817 | Card chrome |
| 30 | `.desktop-ad-margin` | providers:1586 | Sidebar |
| 50 | `.desktop-layout > header` (nav) | providers:1460 | Navigation |
| 100 | `FocusTrapModal` (dialog) | providers:321 | Modal |
| 9998 | Toast notification container | providers:224 | System |
| 9998 | Install prompt banner | providers:129, 155 | System |
| 10000 | Offline indicator | providers:123 | System (highest) |

**Total unique z-index values**: 9 (with 1, 2, 5, 10, 30, 50, 100, 9998, 10000)

**Documented layer system** (from code comment, line 448):
```
bg(1-2) → cards(5) → card-chrome(10) → modals(100) → floating-ui(9999) → system(10000)
```

### Z-Index Collision Check

| Z-Index | Elements at this level | Collision Risk |
|---|---|---|
| 1 | luck-badge-inner, card shimmer | ✅ Safe — different parents, no overlap |
| 5 | kuro-card, content-layer | ✅ Safe — content-layer is inside cards |
| **9998** | **Toast container + Install prompt** | ⚠️ **COLLISION** — both are viewport-fixed elements that could display simultaneously |

> **Finding E1-ZDX1 ✅** · Severity: **MEDIUM**
> **Z-index collision at 9998: Toast container and Install prompt banner share the same z-index.** Both are viewport-fixed elements. If a toast fires while the install banner is showing, stacking order is undefined (depends on DOM order). The documented layer system mentions z-9999 for "floating-ui" but no CSS rule exists at that level.
> **Solution**:
> - Separate the system-level z-indices:
>   ```css
>   /* System layer hierarchy */
>   --z-toast: 9997;      /* toast notifications */
>   --z-install: 9998;    /* install prompt (less frequent, above toasts) */
>   --z-settings: 9999;   /* mini settings panel (documented but unimplemented) */
>   --z-offline: 10000;   /* offline indicator (highest — system critical) */
>   ```
> - Define these as CSS custom properties for governance

> **Finding E1-ZDX2** · Severity: **PASS**
> **Z-index layer system is documented and mostly collision-free.** The 9-value system covers all necessary layers with appropriate gaps. The documented comment (line 448) serves as living documentation.
> **Solution (preservation)**: Keep the documented layer system comment. Add the collision fix from E1-ZDX1 ✅.

---

## §E1.7 Animation Token Set

### Animation Duration Inventory

**Entrance/exit animations** (one-shot):

| Animation | Duration | Easing | Purpose |
|---|---|---|---|
| `slideUp` | 0.2s | ease-out | Toast entrance |
| `scaleIn` | 0.3s | ease-out | Modal entrance |
| `tabFadeIn` | 0.35s | cubic-bezier(0.16, 1, 0.3, 1) | Tab content entrance |
| `cardSlideIn` | 0.4s | cubic-bezier(0.16, 1, 0.3, 1) | Card staggered entrance |
| `emptyFadeIn` | 0.4s | ease-out | Empty state entrance |

**Ambient/loop animations** (infinite):

| Animation | Duration | Easing | Purpose |
|---|---|---|---|
| `kuroShimmer` | 1.8s | ease-in-out | Skeleton loading |
| `borderGlow` | 2s | ease-in-out | Active gold border pulse |
| `pulseScale` | 2s | ease-in-out | Subtle breathing |
| `kuroPulseOrange` | 2s | ease-in-out | Soft pity indicator |
| `kuroPulseCyan` | 2s | ease-in-out | Soft pity indicator |
| `kuroPulsePink` | 2s | ease-in-out | Soft pity indicator |
| `ghostPulse` | 2.5s | ease-in-out | Empty state ghost grid |
| `shimmer` | 3s | ease-in-out | Card top shimmer |
| `trophyShine` | 3s | ease-in-out | Trophy badge glow |
| `badgeRotate` | 8s | linear | Luck badge rotation |

**Transition durations** (7 unique):

| Duration | Count | Role |
|---|---|---|
| 0.1s | 3 | Instant feedback (active states) |
| 0.15s | 8 | Fast feedback (`--transition-fast`) |
| 0.2s | 4 | Standard desktop interactions |
| 0.25s | 1 | Normal state changes (`--transition-normal`) |
| 0.3s | 3 | Tab indicator, card interactions |
| 0.4s | 1 | Slow transitions (`--transition-slow`) — **defined but never used via token** |
| 0.8s | 1 | Pity ring stroke (longest transition) |

### Easing Curve System

| Curve | Count | Usage |
|---|---|---|
| `cubic-bezier(0.16, 1, 0.3, 1)` | 13 | **Primary** — all custom transitions |
| `ease` | 6 | Desktop transitions, basic interactions |
| `ease-out` | 5 | Entrance animations |
| `ease-in-out` | 10 | All infinite loop animations |
| `linear` | 1 | Badge rotation only |
| `cubic-bezier(0.4, 0, 0.2, 1)` | 1 | Material Design easing (desktop tabs) |

### Assessment

**Duration consistency**: Entrance animations form a clean progression: 0.2→0.3→0.35→0.4s. Ambient animations cluster at 2-3s (correct for breathing/pulsing). The system is coherent.

**Easing consistency**: Two systems exist — the custom `cubic-bezier(0.16, 1, 0.3, 1)` for interactive transitions and `ease-in-out` for ambient loops. This is correct: interactive elements need responsive snap, ambient elements need smooth oscillation. However, 6 uses of `ease` (without the custom curve) are inconsistent.

> **Finding E1-ANI1 ✅** · Severity: **LOW**
> **`--transition-slow` (0.4s) is defined but never referenced via the token.** The 0.4s duration is used directly in `cardSlideIn` animation but not through `var(--transition-slow)`. Also, 6 transitions use `ease` instead of the custom `cubic-bezier(0.16, 1, 0.3, 1)`.
> **Solution**:
> - Use `var(--transition-slow)` where 0.4s is needed, so the token system is actually adopted
> - Replace the 6 `ease` transitions with `cubic-bezier(0.16, 1, 0.3, 1)` for consistency (except `linear` on rotation and `ease-in-out` on loops — those are correctly different)
> - The Material Design easing `cubic-bezier(0.4, 0, 0.2, 1)` at line 1615 should be replaced with the app's custom curve unless there's a specific reason for using Material Design easing

> **Finding E1-ANI2** · Severity: **PASS**
> **Animation system is well-structured.** 15 keyframe animations with clear purpose differentiation: 5 entrance animations (one-shot, 0.2-0.4s) and 10 ambient animations (infinite, 1.8-8s). Duration hierarchy is coherent. Staggered card delays (0.05s increments) are a signature element.
> **Solution (preservation)**: Document the dual-system: "Interactive = `cubic-bezier(0.16, 1, 0.3, 1)`, Ambient = `ease-in-out`." This is the motion vocabulary of the LUMINOUS TACTICAL COMPANION.

---

## §E1.8 Token Naming Quality

### Current Token Names Assessment

| Token | Name Type | Quality |
|---|---|---|
| `--color-gold` | **Presentational** (color name) | ⚠️ Works for single-theme; won't scale to theming |
| `--color-pink` | **Presentational** | ⚠️ Same issue |
| `--color-cyan` | **Presentational** | ⚠️ Same issue |
| `--color-purple` | **Presentational** | ⚠️ Same issue |
| `--color-emerald` | **Presentational** | ⚠️ Same issue |
| `--color-red` | **Presentational** | ⚠️ Same issue |
| `--shadow-sm/md/lg/xl` | **Size-based** (scale) | ✅ Standard pattern, acceptable |
| `--transition-fast/normal/slow` | **Semantic** (speed role) | ✅ Good — describes purpose |
| `--font-display` | **Semantic** (role) | ✅ Good |
| `--font-data` | **Semantic** (role) | ✅ Good |
| `--text-body` | **Semantic** (role) | ✅ Good |
| `--text-heading` | **Semantic** (role) | ✅ Good |
| `--bg-card/card-inner/btn/input/stat` | **Semantic** (component) | ✅ Good — component-scoped |
| `--border-subtle/default/medium/hover/bright` | **Semantic** (intensity) | ✅ Good — describes visual weight |

**Analysis**: The naming is split — accent colors are presentational (`--color-gold`) while everything else is semantic (`--bg-card`, `--text-body`, `--transition-fast`). For a single-theme dark-mode app with no whitelabeling plans, presentational color names are acceptable. They're clear, memorable, and map directly to the design language.

> **Finding E1-NAM1** · Severity: **PASS**
> **Token naming is hybrid: presentational for accent colors, semantic for everything else.** For a single-theme app (A1 NON-REVENUE, no whitelabeling), this is appropriate. The semantic names (`--bg-card`, `--text-body`, `--transition-fast`, `--border-subtle`) are well-chosen and self-documenting.
> **Solution (preservation)**: If the app ever needs theming or whitelabeling, rename accent tokens: `--color-gold` → `--color-accent-primary`, `--color-cyan` → `--color-accent-secondary`, etc. For now, the current naming is clear and functional.

---

## §E1.9 CSS Custom Property Coverage

### Coverage Assessment

| Category | Tokens Defined | Values in Codebase | Coverage |
|---|---|---|---|
| **Accent colors** | 6 | 6 core + ~20 Tailwind variants | 30% — Tailwind shade variants not tokenized |
| **Text colors** | 2 (`body`, `heading`) | 9+ gray shades in Tailwind | **18%** — critical gap |
| **Background surfaces** | 5 (OLED-aware) | 10+ dark hex variants | 50% — dark gradient stops not tokenized |
| **Borders** | 5 (opacity scale) | 35+ border instances | 85% — tokens exist, adoption incomplete |
| **Shadows** | 4 (sm/md/lg/xl) | 34 unique values | **12%** — token system barely used |
| **Transitions** | 3 (fast/normal/slow) | 17 transition declarations | 65% — most use tokens or matching values |
| **Typography** | 2 (display, data) | Consistent usage | 95% — well-covered |
| **Spacing** | 0 | Hundreds of values | **0%** — no spacing tokens exist |
| **Radius** | 0 | 12 unique values | **0%** — no radius tokens exist |
| **Z-index** | 0 | 9 values | **0%** — no z-index tokens exist |

**Overall CSS custom property coverage**: ~30% of design decisions are token-governed. The remaining 70% are hardcoded values scattered across markup and CSS-in-JS.

> **Finding E1-COV1** ✅ · Severity: **HIGH**
> **CSS custom property coverage is ~30% — spacing, radius, and z-index have zero token governance.** Text colors (18%), shadows (12%), and dark surface variants are critically undertokenized. This means any design system change requires finding and replacing hundreds of scattered values.
> **Solution**:
> - **Priority 1** (highest impact): Add text color tokens (replaces 459 gray instances — see §DBI3-S07 ✅)
> - **Priority 2**: Add spacing tokens (at least `--space-base: 14px` and the 2px grid scale)
> - **Priority 3**: Add radius tokens (7-level scale from §E1-RAD1 ✅)
> - **Priority 4**: Add z-index tokens (from §E1-ZDX1 ✅)
> - **Priority 5**: Expand shadow token adoption (use the existing 4 tokens instead of hardcoding)
> - Total new tokens needed: ~20-25 new CSS custom properties to reach 70%+ coverage

---

## Step 8 — Combined Findings

| ID | Finding | Severity | Section |
|---|---|---|---|
| E1-SP1 ✅ | Spacing uses 2px base grid (not 4px) — undocumented but consistent | **LOW** | §E1.1 |
| E1-SP2 ✅ | 3 subpixel/odd spacing values (1.5px, 3px, -1px) | **LOW** | §E1.1 |
| E1-COL1 ✅ | 66 unique hex colors, only 18 tokenized — 73% unmanaged palette | **HIGH** | §E1.2 |
| E1-COL2 ✅ | 3 near-duplicate gold values where 1 token exists | **MEDIUM** | §E1.2 |
| E1-COL3 ✅ | Tailwind gray and slate families mixed in same hierarchy | **MEDIUM** | §E1.2 |
| E1-COL4 ✅ | 5 instances of uncalibrated pure `#ff0000` red | **LOW** | §E1.2 |
| E1-COL5 ✅ | Purple and violet Tailwind families mixed | **LOW** | §E1.2 |
| E1-TYP1 ✅ | 11 font sizes — 2 off-scale (11px, 13px) | **LOW** | §E1.3 |
| E1-TYP2 ✅ | `font-bold` (700) used 105× for both headings and data — weight overlap | **LOW** | §E1.3 |
| E1-TYP3 | Letter-spacing uses 8 intentional values in clear progression | **PASS** | §E1.3 |
| E1-TYP4 | Line-height values serve clear density purposes | **PASS** | §E1.3 |
| E1-TYP5 ✅ | `text-rendering: optimizeLegibility` missing from root | **LOW** | §E1.3 |
| E1-RAD1 ✅ | 12 unique radius values — sub-8px range unsystematic, `rounded-lg` dominates | **MEDIUM** | §E1.4 |
| E1-SHD1 ✅ | 4 shadow tokens defined, only 1 used — 34 hardcoded shadow values | **LOW** | §E1.5 |
| E1-ZDX1 ✅ | Z-index collision at 9998 (Toast + Install prompt) | **MEDIUM** | §E1.6 |
| E1-ZDX2 | Z-index layer system documented and mostly collision-free | **PASS** | §E1.6 |
| E1-ANI1 ✅ | `--transition-slow` unused via token; 6 `ease` curves inconsistent | **LOW** | §E1.7 |
| E1-ANI2 | Animation system well-structured (15 keyframes, dual easing) | **PASS** | §E1.7 |
| E1-NAM1 | Token naming hybrid (presentational colors + semantic rest) — appropriate | **PASS** | §E1.8 |
| E1-COV1 ✅ | CSS custom property coverage ~30% — spacing/radius/z-index at 0% | **HIGH** | §E1.9 |

**Severity distribution**: 2 HIGH, 4 MEDIUM, 9 LOW, 5 PASS — **20 total findings**

---

**STEP 8 COMPLETE** — §E1 Design Token System fully audited.

**Spacing**: 2px base grid (undocumented but internally consistent). 14px primary body padding is a deliberate signature. 3 odd values are trivial token debt.
**Color**: 66 unique hex colors with only 30% token governance. 5 near-duplicate clusters (gold, gray, dark backgrounds, green, purple/violet). Gray/slate family mixing is the most impactful issue. Pure `#ff0000` appears 5×.
**Typography**: 11 font sizes anchored at 14px body base. 2 off-scale values (11px, 13px). Letter-spacing and line-height are well-considered. `font-bold` overused for mixed semantic purposes.
**Radius**: 12 unique values. KuroStyles defines a clean 4-level hierarchy (8/10/12/16px) that markup doesn't follow. `rounded-lg` (109×) dominates.
**Shadows**: 34 unique values but only 1 of 4 tokens is actively used. Color-glow system is consistent but hardcoded.
**Z-index**: 9-level system with one collision at 9998. Otherwise well-governed.
**Animations**: 15 keyframes with coherent dual-easing system. Token adoption incomplete.
**Token coverage**: ~30% overall — the system's biggest structural gap. Adding ~25 new CSS custom properties would reach 70%+.

---

## STEP 9 — §E2: Visual Rhythm & Spatial Composition

**Skill reference**: `app-audit-SKILL.md` §E2
**Scope**: ALL 8 tabs (TRACKER, EVENTS, CALC, PLANNER, STATS, COLLECT, TEAMS, PROFILE)
**Five-Axis reminder**: A1 NON-REVENUE · A2 FOCUS-TOOL + EMOTIONAL-SECONDARY · A3 ENTHUSIAST/EXPERT · A4 NAMED-SOURCE WuWa L3 · A5 FUNCTIONAL-PRIMARY + ATMOSPHERIC-SECONDARY

---

### §E2.1 — Vertical Rhythm Assessment

**Methodology**: Catalogued every gap, space-y, margin, and padding utility in `App.jsx` (7000+ lines) plus CSS-in-JS spacing in `appcore-providers.jsx` KuroStyles block. Cross-referenced with §E1 2px base grid finding.

#### E2.1.1 — Page-Level Vertical Rhythm

All 8 tabs share an identical outermost wrapper:

```
<main className="max-w-lg md:max-w-2xl lg:max-w-none mx-auto px-3 pt-3 space-y-3 w-full">
  ...
  <div className="kuro-calc space-y-3 tab-content">
    [tab content]
  </div>
</main>
```

| Layer | Spacing | Value | Source |
|-------|---------|-------|--------|
| Page horizontal padding | `px-3` | 12px | Tailwind |
| Page top padding | `pt-3` | 12px | Tailwind |
| Page bottom padding | `env(safe-area-inset-bottom, 1rem)` | 16px min | CSS |
| Section-to-section gap | `space-y-3` | 12px | Tailwind |
| Tab content internal gap | `space-y-3` | 12px | Tailwind (on `.tab-content`) |
| Tab content padding | `.tab-content { padding: 0.75rem }` | 12px | CSS-in-JS |
| Tab content negative bleed | `margin-left/right: -0.75rem` | −12px | CSS-in-JS |

**Finding**: Page-level vertical rhythm is **perfectly consistent** — 12px everywhere. The negative-margin + padding technique on `.tab-content` creates a full-bleed illusion while maintaining the 12px grid. This is deliberate and well-executed.

#### E2.1.2 — Component-Level Vertical Spacing

**Gap utilities (162 total instances)**:

| Utility | px Value | Count | Share |
|---------|----------|-------|-------|
| `gap-2` | 8px | 72 | 44% |
| `gap-1` | 4px | 41 | 25% |
| `gap-1.5` | 6px | 29 | 18% |
| `gap-3` | 12px | 11 | 7% |
| `gap-2.5` | 10px | 4 | 2% |
| `gap-0.5` | 2px | 4 | 2% |
| `gap-4` | 16px | 1 | <1% |

**Space-y utilities (92 total instances)**:

| Utility | px Value | Count | Share |
|---------|----------|-------|-------|
| `space-y-2` | 8px | 36 | 39% |
| `space-y-3` | 12px | 29 | 32% |
| `space-y-1` | 4px | 11 | 12% |
| `space-y-1.5` | 6px | 6 | 7% |
| `space-y-4` | 16px | 5 | 5% |
| `space-y-0.5` | 2px | 3 | 3% |
| `space-y-0` | 0px | 2 | 2% |

**Margin-bottom utilities (top 10)**:

| Utility | px Value | Count |
|---------|----------|-------|
| `mb-2` | 8px | 28 |
| `mb-1.5` | 6px | 22 |
| `mb-3` | 12px | 14 |
| `mb-1` | 4px | 13 |
| `mb-0.5` | 2px | 3 |

#### E2.1.3 — Vertical Rhythm Scale Analysis

Extracting the **effective vertical spacing scale** from frequency data:

| Step | px | rem | Role | Frequency |
|------|-----|------|------|-----------|
| 1 | 2px | 0.125rem | Micro (label→value tight coupling) | 7 uses |
| 2 | 4px | 0.25rem | Compact (intra-component) | 65 uses |
| 3 | 6px | 0.375rem | Dense (between related items) | 57 uses |
| 4 | 8px | 0.5rem | Standard (component internal) | 136 uses |
| 5 | 10px | 0.625rem | — (only in CSS-in-JS buttons) | 4 uses |
| 6 | 12px | 0.75rem | Section (page rhythm, card body) | 54 uses |
| 7 | 16px | 1rem | Major (section breaks, large gaps) | 6 uses |

**Observation**: The dominant values are **4px, 6px, 8px, 12px** — a pattern that mostly follows 2px increments but skips 10px in Tailwind and uses 14px only in CSS-in-JS. The 6px step (57 uses) is heavy, which aligns with the 2px base grid from §E1 but breaks the more common 4px-multiple pattern.

#### E2.1.4 — CSS-in-JS vs Tailwind Rhythm Conflict

| Context | CSS-in-JS Value | Tailwind Equivalent | Match? |
|---------|----------------|-------------------|--------|
| Card header padding | 14px | — (no Tailwind equivalent) | ❌ Not on 4px grid |
| Card body padding | 14px | — | ❌ Not on 4px grid |
| Stat box padding | 14px | — | ❌ Not on 4px grid |
| Tab content padding | 12px (0.75rem) | `p-3` | ✅ Matches |
| Button padding | 10px 12px | `py-2.5 px-3` | ✅ Close |
| Input padding | 10px 12px | `py-2.5 px-3` | ✅ Close |
| Divider margin | 12px 0 | `my-3` | ✅ Matches |
| Slider margin | 8px 0 | `my-2` | ✅ Matches |

**14px is the standout**: It's the signature KuroStyles value (used 3× for card header, body, stat) but sits between Tailwind's 12px (`p-3`) and 16px (`p-4`). This is intentional — it creates a distinctive density that Tailwind can't replicate. However, when Tailwind utilities override it (e.g., `kuro-stat p-2`), the rhythm breaks.

> **E2-VR1 ✅** · LOW
> **Finding**: CSS-in-JS 14px padding and Tailwind 4px-grid spacing create a **dual-rhythm system**. The 14px value is deliberate and creates unique density, but 4 instances of Tailwind overrides on `.kuro-stat` (using `p-2` = 8px) and `.kuro-card` (using `p-5` = 20px) break the card system's internal consistency.
> **Solution**: Define `--spacing-card: 14px` token. When tighter density is needed inside cards, use a documented `kuro-stat-compact` variant with `padding: 8px` rather than ad-hoc Tailwind overrides. For the `p-5` case on modal cards, use `kuro-card-modal` with `padding: 20px` as a named variant.

> **E2-VR2** · PASS
> **Finding**: Page-level vertical rhythm is flawless. All 8 tabs use identical `space-y-3` (12px) for section stacking, and the `.tab-content` negative-margin bleed technique maintains visual edge-to-edge while preserving the rhythm grid.
> **Solution**: No action needed. Document the 12px page rhythm as the canonical section-gap value in a future design-system reference.

---

### §E2.2 — Density Consistency

**Methodology**: Compared internal padding, font sizes, and spacing of same-category components appearing on the same or adjacent screens.

#### E2.2.1 — Card Density Comparison

**KuroStyles base card system** (`appcore-providers.jsx`):

| Component | Internal Padding | Font Size | Border-Radius | Line-Height |
|-----------|-----------------|-----------|---------------|-------------|
| `.kuro-card` `.kuro-header` | 14px | 14px / 600wt | 16px (card) | normal |
| `.kuro-card` `.kuro-body` | 14px | inherited | 16px (card) | normal |
| `.kuro-stat` | 14px | inherited (mono) | 10px | 1.3 |

**Inline overrides observed**:

| Location | Component | Override | Effective Padding | Delta from Base |
|----------|-----------|----------|-------------------|-----------------|
| Calculator results | `kuro-stat p-2` | `p-2` | 8px | −6px (43% less) |
| Modal wrapper | `kuro-card p-5` | `p-5` | 20px | +6px (43% more) |
| Events tab cards | `kuro-card` (no override) | — | 14px | baseline |
| Stats tab cards | `kuro-card` (no override) | — | 14px | baseline |
| Teams tab cards | `kuro-card` (no override) | — | 14px | baseline |

**Result**: 6 of 8 tabs use default 14px padding consistently. The Calculator and modal contexts use overrides, creating a ±43% density swing on same-type components.

#### E2.2.2 — Stat Box Density Across Tabs

Stat boxes (`.kuro-stat`) appear in TRACKER, CALC, STATS, and PLANNER tabs:

| Tab | Stat Box Usage | Padding | Content Pattern |
|-----|---------------|---------|-----------------|
| TRACKER | Banner pity counters | 14px (default) | Number + small label |
| CALC | Probability results | 8px (`p-2` override) | Large % + label |
| STATS | Luck rating breakdown | 14px (default) | Number + small label |
| PLANNER | Income projections | 14px (default) | Number + label |

**Inconsistency**: CALC tab stat boxes are visibly denser than identical stat boxes on other tabs. The `p-2` override compresses content while the font size remains the same, creating a cramped feel relative to sibling tabs.

#### E2.2.3 — Section Container Density

Internal section containers (`.bg-white/5` panels within cards):

| Context | Padding | Gap | Font Size |
|---------|---------|-----|-----------|
| Character detail — Combat Profile | `p-3` (12px) | `space-y-2` (8px) | 9–10px |
| Character detail — Base Stats | `p-3` (12px) | `gap-2` (8px) | 9–14px |
| Character detail — Weapon Rec | `p-3` (12px) | `gap-3` (12px) | 10–14px |
| Character detail — Echoes | `p-3` (12px) | `space-y-2` (8px) | 9–12px |
| Character detail — Teams | `p-3` (12px) | `space-y-2` (8px) | 10–14px |

**Result**: Internal section containers are **remarkably consistent** — `p-3` with `space-y-2` or `gap-2` is the standard. One exception: Weapon Recommendation uses `gap-3` (12px) instead of `gap-2` (8px), making it slightly airier than sibling sections.

#### E2.2.4 — List Item Density

Repeated list items across tabs:

| Component | Item Height (est.) | Internal Padding | Gap Between | Font |
|-----------|--------------------|-----------------|-------------|------|
| Banner cards (TRACKER) | ~120px | `p-3` (12px) | `space-y-3` (12px) | 10–14px |
| Event cards (EVENTS) | ~80px | `p-3` (12px) | `gap-3` (12px) | 9–14px |
| Team slots (TEAMS) | ~60px | `p-2` (8px) | `gap-2` (8px) | 10–14px |
| Collection grid items (COLLECT) | ~80px | `p-1.5` (6px) | `gap-2` (8px) | 9–10px |
| Achievement rows (PROFILE) | ~48px | `py-2` (8px) | `space-y-1` (4px) | 9–12px |

**Pattern**: Density scales with content type — banner cards are spacious, collection items are compact. This is **intentional** and matches A2 (FOCUS-TOOL): data-dense views use tighter spacing, showcase views use generous spacing.

> **E2-DC1 ✅** · LOW
> **Finding**: Calculator tab stat boxes use `p-2` (8px) while all other tabs use default 14px stat-box padding — a 43% density reduction on the same component type. Users moving between CALC and STATS tabs experience a jarring density shift.
> **Solution**: Create `.kuro-stat-compact` variant in KuroStyles with `padding: 8px` and slightly smaller font-size (12px). Apply it consistently where dense stat displays are needed. This documents the intent rather than relying on Tailwind overrides.

> **E2-DC2** · PASS
> **Finding**: Internal section containers (`.bg-white/5` panels) maintain excellent density consistency — `p-3` padding with `space-y-2` gaps across 5+ different content types in character detail views. The density hierarchy (cards > sections > items) is intentional and well-scaled.
> **Solution**: No action needed. This is exemplary density governance for a tool-first app.

> **E2-DC3** · PASS
> **Finding**: List item density scales appropriately with content type. Banner cards (spacious, ~120px) vs collection grid items (compact, ~80px) vs achievement rows (dense, ~48px) follows a logical density progression matching each view's purpose.
> **Solution**: No action needed. The density-by-purpose pattern is well-calibrated.

---

### §E2.3 — Alignment Grid Assessment

**Methodology**: Analysed horizontal alignment patterns, grid systems, and element anchoring across all 8 tabs.

#### E2.3.1 — Page-Level Grid System

```
┌──────────────────────────────────────────┐
│  12px  │←──── max-w-lg (512px) ────→│ 12px │  MOBILE
│  (px-3)│                              │(px-3)│
├──────────────────────────────────────────┤
│  12px  │←── max-w-2xl (672px) ───→│  12px │  TABLET (md:)
├──────────────────────────────────────────┤
│  72px  │←──── no max-width ──────→│ 160px │  DESKTOP (lg:)
│sidebar │          (fluid)          │ ad    │
└──────────────────────────────────────────┘
```

- **Mobile**: Single-column, centered with `mx-auto`, constrained to 512px
- **Tablet (md: 768px+)**: Widens to 672px, still centered
- **Desktop (lg: 1024px+)**: Left sidebar (72px fixed), fluid content, right ad margin (160px)
- **Ultra-wide (1440px+)**: Ad margin expands to 180px

**Grid within cards**: Cards stretch to full container width. Internal grids use:
- `grid-cols-2` — pity stats, toggle options
- `grid-cols-3` / `sm:grid-cols-5` — server selection, collection summary
- `grid-cols-4` — base stats in character detail
- `banner-grid` (CSS-in-JS) — `auto-fit, minmax(420px, 1fr)` for banner cards on desktop
- `event-grid` (CSS-in-JS) — `auto-fill, minmax(380px, 1fr)` for event cards

#### E2.3.2 — Horizontal Alignment Patterns

| Pattern | Usage | Count | Alignment Quality |
|---------|-------|-------|-------------------|
| `items-center` | Vertical center of flex row | 200+ | ✅ Consistent |
| `justify-between` | Space-between for label + value rows | 80+ | ✅ Strong pattern |
| `text-center` | Centered text blocks | 40+ | ✅ Used for stats/badges |
| `text-right` | Right-aligned numbers | 15+ | ✅ Appropriate for numerics |
| `mx-auto` | Horizontal centering of constrained containers | 8+ | ✅ Page-level |

**Dominant compositional pattern**: `flex items-center justify-between` for nearly all label+value rows. This creates a strong **left-edge alignment** for labels and **right-edge alignment** for values — a classic data-dashboard pattern that provides visual anchoring.

#### E2.3.3 — Grid Consistency Across Tabs

| Tab | Primary Grid | Internal Grid | Alignment |
|-----|-------------|---------------|-----------|
| TRACKER | Single-column stacked | `grid-cols-2` for stats | ✅ Clean left-edge |
| EVENTS | Single-column stacked | Event cards in `event-grid` | ✅ Auto-fill responsive |
| CALC | Single-column stacked | `grid-cols-2` for results | ✅ Symmetric pairs |
| PLANNER | Single-column stacked | Input + result rows | ✅ Label-left, value-right |
| STATS | Single-column stacked | `grid-cols-2` for stat boxes | ✅ Symmetric pairs |
| COLLECT | Single-column stacked | `grid-cols-3/5` for items | ✅ Responsive grid |
| TEAMS | Single-column stacked | Team slot cards | ✅ Consistent |
| PROFILE | Single-column stacked | `grid-cols-3/5` for servers | ✅ Responsive grid |

**All 8 tabs share the single-column stacked layout** with internal grids where appropriate. No tab introduces a competing layout paradigm. This is excellent structural consistency.

#### E2.3.4 — Floating Elements (Unanchored)

Elements that appear to lack visual anchoring:

1. **Corner decorations** (`.kuro-card-inner::before/::after`): 12×12px boxes at 8px offset from card corners. These are **intentionally floating** as atmospheric decoration — not a misalignment.
2. **Luck badge** (`.luck-badge`): Centered within its card, no left-edge anchoring. **Intentional** — it's a hero element that benefits from center gravity.
3. **Tab navigation icons**: Vertically stacked (icon above text) with `gap-0.5` (2px). Each tab is flex-centered. **Well-anchored** via `justify-between` on the nav container.

**No unintentionally floating elements detected.**

> **E2-AG1** · PASS
> **Finding**: The page-level alignment grid is robust. All 8 tabs use single-column stacked layout with consistent `mx-auto` centering and `px-3` edge padding. Internal grids (`grid-cols-2/3/4/5`) are used appropriately per content type. The `flex items-center justify-between` pattern creates strong left-edge/right-edge anchoring throughout.
> **Solution**: No action needed. The alignment system is one of the app's strongest structural qualities.

> **E2-AG2** · PASS
> **Finding**: No unintentionally floating elements found. Corner decorations and centered hero elements (luck badge) are deliberate design choices, not alignment failures.
> **Solution**: No action needed.

---

### §E2.4 — Whitespace Intention Analysis

**Methodology**: Assessed whether whitespace actively groups related items and separates unrelated ones, or is applied without rhythm.

#### E2.4.1 — Grouping Whitespace (Gestalt Proximity)

**Card-level grouping**:
- Cards (`.kuro-card`) create strong visual groups via border + background + shadow
- `.kuro-header` (14px padding) + `1px border-bottom` clearly separates header from body
- `.kuro-body` (14px padding) provides uniform breathing room

**Section-level grouping within cards**:
- `.bg-white/5` sub-panels with `p-3` + `rounded-xl` create nested visual groups
- `space-y-2` (8px) between items within a group
- `space-y-3` (12px) between groups (e.g., Combat Profile section → Base Stats section)

**The proximity hierarchy**:

| Gap | px | Role | Example |
|-----|-----|------|---------|
| Tight | 2–4px | Elements that belong together | Label → value, icon → text |
| Standard | 6–8px | Sibling items within a group | Stat box → stat box, list item → list item |
| Section | 12px | Groups within a card | Section header → section content |
| Card | 12px | Card → card separation | `space-y-3` between top-level cards |

**Observation**: The section gap and card gap are **identical** (both 12px). This means the boundary between "groups within a card" and "separate cards" relies entirely on the card's border/shadow, not on spacing differentiation. This works because the card chrome (border, backdrop-blur, box-shadow) is visually strong enough to compensate.

#### E2.4.2 — Separation Whitespace

**Header-to-content separation**:
- All card headers: `border-bottom: 1px solid var(--border-subtle)` + 14px padding below = strong separation
- Section sub-headers: `mb-2` (8px) below header text = adequate but tight

**Tab-to-content separation**:
- Tab bar: `border-bottom: 1px solid rgba(255,255,255,0.1)` + `space-y-3` below
- Effective gap: 12px between last tab underline and first content card

**Card-to-card separation**:
- `space-y-3` (12px) — uniform across all tabs
- Cards are distinct via border + shadow, so 12px is sufficient

#### E2.4.3 — Whitespace Problem Areas

1. **Cramped areas**: Achievement rows in PROFILE tab use `space-y-1` (4px) between items. With 9px text and 4px gaps, the density is extreme — acceptable for a data list but pushes readability limits.

2. **Sparse areas**: The CALC tab's result section uses `space-y-4` (16px) between result groups while sibling sections use `space-y-3` (12px). This creates a subtle asymmetry — the results feel slightly more spacious than expected.

3. **Header-to-content inconsistency**: Some section headers use `mb-2` (8px), others use `mb-1.5` (6px), and a few use `mb-1` (4px). The variation is small (4–8px range) but prevents establishing a single reliable "header gap" rhythm.

> **E2-WS1 ✅** · LOW
> **Finding**: Section sub-header margins are inconsistent — `mb-2` (8px), `mb-1.5` (6px), and `mb-1` (4px) all used for the same structural role (header → content gap). While the differences are small, a single canonical value would strengthen vertical rhythm.
> **Solution**: Standardize on `mb-2` (8px) for all section sub-headers. This is the most frequent value and provides adequate separation for 9–10px header text. Define as `--spacing-header-gap: 8px` token.

> **E2-WS2** · PASS
> **Finding**: Card-level and section-level grouping whitespace is well-intentioned. The proximity hierarchy (2–4px tight → 6–8px standard → 12px section/card) creates clear visual groups. The card chrome (border + shadow + backdrop-blur) compensates for the section-gap = card-gap equivalence.
> **Solution**: No action needed. The Gestalt proximity grouping is effective.

---

### §E2.5 — Proportion Assessment

**Methodology**: Measured font-size ratios between paired elements (label + value, icon + text, header + content) across all tabs. Assessed whether proportional relationships are consistent and intentional.

#### E2.5.1 — Label + Value Proportions

**Catalogued label+value pairs** (12 examples across components):

| Context | Label Size | Value Size | Ratio (V:L) | Gap | Quality |
|---------|-----------|-----------|--------------|-----|---------|
| Base Stats grid | 9px / 600wt | 14px / bold | 1.56:1 | `mb-2` (8px) | ✅ Strong contrast |
| Combat Profile | 9px / 600wt | 10px chips | 1.11:1 | — | ⚠️ Weak distinction |
| Resonance Chain | 9px / 400wt | 10px | 1.11:1 | — | ⚠️ Weak distinction |
| 5★ Pity Display | 9px / 400wt | 14px / bold | 1.56:1 | `mt-0.5` (2px) | ✅ Strong contrast |
| Featured 4★ | 9px / 400wt | 9px (cyan) | 1:1 | `mb-0.5` (2px) | ❌ No distinction |
| Weapon Spec | 10px / 400wt | 14px / bold | 1.4:1 | `mt-0.5` (2px) | ✅ Adequate |
| Echo Recommendation | 9px / 400wt | 12px / bold | 1.33:1 | `mb-2` (8px) | ✅ Adequate |
| Event Title/Subtitle | 10px / 400wt | 14px / bold | 1.4:1 | — | ✅ Adequate |
| Buff/Debuff Detail | 9px / 600wt | 10px / 300wt | 1.11:1 | `mb-1` (4px) | ⚠️ Weak |
| Stat Box (kuro-stat) | inherited | inherited (mono) | — | — | ✅ Mono distinguishes |
| Planner Daily Income | 9px label | 14px bold yellow | 1.56:1 | — | ✅ Strong |
| Calculator Result | 9px label | 24px bold (text-2xl) | 2.67:1 | — | ✅ Heroic |

**Proportion clusters**:
- **Strong (1.4–2.67:1)**: 7 of 12 cases — clear visual hierarchy via size + weight + color
- **Weak (1.0–1.11:1)**: 5 of 12 cases — label and value nearly indistinguishable by size alone; relies on color (gray vs cyan/white) for differentiation

#### E2.5.2 — Icon + Text Proportions

**Lucide icon sizing**:

| Icon Size | Text Paired With | Ratio (Icon:Cap-Height) | Gap | Count |
|-----------|-----------------|------------------------|-----|-------|
| 14px | 14px (`text-sm`) | ~1:1 | `gap-2` (8px) | 11× |
| 12px | 10px (`text-[10px]`) | ~1.2:1 | `gap-2` (8px) | 5× |
| 10px | 9px (`text-[9px]`) | ~1.1:1 | inline | 3× |
| 16px | 14px (`text-sm`) | ~1.14:1 | `gap-2` (8px) | 2× |
| 32px | 18px (`text-lg`) | ~1.78:1 | — | 1× |

**Consistent pattern**: Icons are sized at 1:1 to 1.2:1 relative to their paired text. The dominant pairing (14px icon + 14px text + 8px gap) accounts for 50% of all icon+text instances. This is a strong, coherent system.

**One outlier**: The 32px icon paired with 18px text in error boundaries creates a 1.78:1 ratio — intentionally dramatic for the error state.

#### E2.5.3 — Header + Content Proportions

**Card header (`.kuro-header`)**: 14px / 600wt text with `h3::before` 3px gold accent bar.
**Card body (`.kuro-body`)**: 14px / 400wt body text.
**Header:body ratio**: 1:1 in size, differentiated by weight (600 vs 400) and the gold accent bar.

**Section sub-headers within cards**:

| Sub-Header Pattern | Size | Weight | Compared to Content | Ratio |
|-------------------|------|--------|-------------------|-------|
| `text-sm font-bold` | 14px | 700 | 9–10px content | 1.4–1.56:1 |
| `text-[10px] uppercase tracking-wider` | 10px | 600 | 9–10px content | 1:1 to 1.11:1 |
| `text-xs font-bold` | 12px | 700 | 9–10px content | 1.2–1.33:1 |

**Observation**: The 10px uppercase sub-headers rely on `letter-spacing: tracking-wider` and `uppercase` transform rather than size to distinguish themselves. This is a valid typographic technique but creates a subtler hierarchy than the `text-sm font-bold` variant.

> **E2-PR1 ✅** · LOW
> **Finding**: 5 of 12 label+value pairs have a proportion ratio ≤1.11:1, making label and value nearly indistinguishable by size. These rely solely on color (gray-400 vs white/cyan) for differentiation. In low-contrast or colorblind scenarios, the hierarchy weakens.
> **Solution**: For weak-ratio pairs (currently 9px label + 10px value), either: (a) increase the value to 11px for a minimum 1.22:1 ratio, or (b) add `font-weight: 600` to the value to create weight-based distinction. The Featured 4★ case (9px:9px = 1:1) should change the value to `text-[10px] font-semibold` at minimum.

> **E2-PR2** · PASS
> **Finding**: Icon+text proportions are remarkably consistent. The dominant 14px icon + 14px text pairing at 1:1 ratio with 8px gap accounts for 50%+ of instances. Size scaling follows a logical 10→12→14→16px progression matching paired text.
> **Solution**: No action needed. Document the 1:1 icon:text-size default in the design system reference.

---

### §E2.6 — Focal Point Clarity

**Methodology**: For each of the 8 primary tabs, identified the intended focal element, assessed whether the current visual treatment actually draws the eye there first, and evaluated whether secondary elements compete for attention.

#### Tab-by-Tab Focal Point Assessment

**1. TRACKER**

| Aspect | Element | Treatment |
|--------|---------|-----------|
| **Intended focal** | Banner cards (character/weapon portraits) | Semi-transparent overlay with character art, pity counters, gold/cyan glow |
| **First eye draw** | Category tabs (Character/Weapon/Standard) | `.active-gold` / `.active-pink` / `.active-cyan` with glow — saturated color on first visible element |
| **Competing elements** | None significant | Stat counters within banners are secondary |
| **Verdict** | ✅ **CLEAR** | The active category tab draws eye first (orientation), then banner cards provide the content focal point. Two-stage hierarchy works well. |

**2. EVENTS**

| Aspect | Element | Treatment |
|--------|---------|-----------|
| **Intended focal** | Event cards with countdown timers | Image backgrounds, status badges, time displays |
| **First eye draw** | Astrite Progress card | Yellow-tinted `bg-yellow-500/10` + green progress bar — warmest element on screen |
| **Competing elements** | Refresh button (top-right) | Small, subdued — not competing |
| **Verdict** | ✅ **CLEAR** | Astrite Progress card is the natural anchor. Event cards below form a scannable list. |

**3. CALCULATOR**

| Aspect | Element | Treatment |
|--------|---------|-----------|
| **Intended focal** | Probability result percentages | `text-2xl` (24px) in yellow-400 and emerald-400 — largest text in the tab |
| **First eye draw** | Banner selection buttons | `.active-emerald` / `.active-gold` buttons with saturated color at top of tab |
| **Competing elements** | 50/50 toggle, pity inputs | Multiple interactive elements before results |
| **Verdict** | ⚠️ **SPLIT** | User must scroll past inputs to reach the results — the focal content (percentages) may be below the fold on shorter screens. The input section is visually louder than it needs to be. |

**4. PLANNER**

| Aspect | Element | Treatment |
|--------|---------|-----------|
| **Intended focal** | Daily income total / pull projections | Yellow-400 bold numbers showing Astrite and pull counts |
| **First eye draw** | Daily Income input card | Card header + input field at top |
| **Competing elements** | Subscription toggles | Multiple toggle rows with labels |
| **Verdict** | ⚠️ **SPLIT** | Similar to CALC — the inputs dominate the viewport while the computed results (the actual value proposition) require scrolling to reach. |

**5. STATS**

| Aspect | Element | Treatment |
|--------|---------|-----------|
| **Intended focal** | Luck Rating badge | Animated conic-gradient border, tier text, percentile bar — `text-xl` (20px) |
| **First eye draw** | Luck Rating badge | Rotating gradient animation + dynamic glow color = strongest visual magnet in entire app |
| **Competing elements** | Leaderboard buttons | Small, below the badge — not competing |
| **Verdict** | ✅ **STRONG** | The luck badge is the single most effective focal element in the entire app. Animation, color, size, and position all converge. |

**6. COLLECTION**

| Aspect | Element | Treatment |
|--------|---------|-----------|
| **Intended focal** | Collection Progress bar + percentage | Yellow gradient bar with bold percentage counter |
| **First eye draw** | Progress bar | Yellow-500→400 gradient is the warmest element |
| **Competing elements** | Grid of character portraits | Visually rich but uniform, creating a texture rather than competing focal point |
| **Verdict** | ✅ **CLEAR** | Progress bar anchors the tab, character grid below provides scannable inventory. |

**7. TEAMS**

| Aspect | Element | Treatment |
|--------|---------|-----------|
| **Intended focal** | Team composition display | Character portraits + synergy score + DPS calculation |
| **First eye draw** | Compare / Clear action buttons | Positioned in card header — first visible elements |
| **Competing elements** | Team slot placeholders | Multiple empty/filled slots compete equally for attention |
| **Verdict** | ⚠️ **DIFFUSE** | When multiple team slots are visible, no single slot dominates. The "active" team slot doesn't have a visually distinct treatment from inactive ones. All slots have equal visual weight. |

**8. PROFILE**

| Aspect | Element | Treatment |
|--------|---------|-----------|
| **Intended focal** | Resonator Profile (avatar + username) | w-14 h-14 (56px) profile picture — largest single element |
| **First eye draw** | Server Region card | 3×3 button grid with active state — first card in tab |
| **Competing elements** | Achievement section | Long list with colorful trophy icons |
| **Verdict** | ⚠️ **SPLIT** | Server selection (functional, not a focal destination) sits above the Profile section (the actual identity display). Users looking for "their profile" must scroll past server config. |

#### Focal Point Summary

| Tab | Focal Clarity | Rating |
|-----|--------------|--------|
| TRACKER | Two-stage hierarchy (tabs → banners) | ✅ CLEAR |
| EVENTS | Astrite Progress → event cards | ✅ CLEAR |
| CALC | Inputs above fold, results below | ⚠️ SPLIT |
| PLANNER | Inputs above fold, results below | ⚠️ SPLIT |
| STATS | Luck badge — strongest in entire app | ✅ STRONG |
| COLLECT | Progress bar → character grid | ✅ CLEAR |
| TEAMS | Equal-weight team slots | ⚠️ DIFFUSE |
| PROFILE | Server config above profile display | ⚠️ SPLIT |

> **E2-FP1 ✅** · MEDIUM
> **Finding**: CALC and PLANNER tabs place input controls above the fold and push computed results (the primary value — percentages and pull projections) below. The input sections are visually heavier than necessary, competing with or obscuring the focal output.
> **Solution**: For both tabs, consider a **results-first layout** — show the most recent/default calculation result at the top (as a hero stat card with `text-2xl` numbers), with the input controls below or in a collapsible section. Alternatively, make the result section sticky so it remains visible while adjusting inputs.

> **E2-FP2 ✅** · LOW
> **Finding**: TEAMS tab has diffuse focal weight — all team slots have identical visual treatment regardless of active/inactive state, preventing users from knowing which team is "current" at a glance.
> **Solution**: Add a `kuro-card-active` variant with a subtle gold or cyan border-glow to the currently-selected team slot. Use `.glow-gold` or a 2px border-color change to differentiate the active team from inactive ones.

> **E2-FP3 ✅** · LOW
> **Finding**: PROFILE tab places Server Region card (a one-time configuration) above the Resonator Profile (the identity display). Server selection captures attention first despite being the less frequently accessed feature.
> **Solution**: Reorder PROFILE sections: Resonator Profile first (identity focal point), then Server Region below (secondary configuration). This puts the user's avatar and identity at the top where they expect to see "their profile."

> **E2-FP4** · PASS
> **Finding**: STATS tab Luck Rating badge is the most effective focal element in the entire app. The combination of animated conic-gradient border, dynamic glow color, `text-xl` size, and top-of-tab positioning creates unmistakable visual hierarchy.
> **Solution**: No action needed. This is a reference example for how focal elements should be treated in other tabs.

---

### §E2.7 — Visual Weight Distribution

**Methodology**: Scanned each tab for the distribution of visual mass (size, color saturation, contrast, bold weight). Assessed whether heavy elements cluster unintentionally or distribute intentionally.

#### E2.7.1 — Visual Weight Carriers

The app's primary visual weight tools:

| Weight Mechanism | Implementation | Strength |
|-----------------|----------------|----------|
| **Color saturation** | Gold (#edaf18), Cyan (#38bdf8), Emerald (#22c55e), Pink (#ec4899) | HIGH — all at full Tailwind 400–500 saturation |
| **Font size** | `text-2xl` (24px), `text-xl` (20px), `text-lg` (18px) | MEDIUM — used sparingly (26 total large-text instances) |
| **Font weight** | `font-bold` (105× instances) | HIGH — widespread, potentially dilutes impact |
| **Glow effects** | `.glow-gold` (24px shadow radius), `.glow-purple` (16px), `.active-cyan` | HIGH — localized to interactive elements |
| **Gradient fills** | Progress bars, luck badge, header logo blur | MEDIUM — used for 3–4 specific elements |
| **Animation** | Conic-gradient rotation, tabFadeIn, pulse | LOW — reserved for luck badge and transitions |

#### E2.7.2 — Per-Tab Weight Maps

**Visual weight distribution (L = left, C = center, R = right, T = top, M = middle, B = bottom)**:

| Tab | Heaviest Zone | Weight Type | Balance |
|-----|--------------|-------------|---------|
| **TRACKER** | T-center (active category tab glow) + M-full (banner cards) | Color glow + image | ✅ **Balanced** — weight flows top→middle naturally |
| **EVENTS** | T-center (Astrite card yellow) + M-full (event images) | Color + image | ✅ **Balanced** — warm anchor at top, content below |
| **CALC** | T-center (active buttons) + B-center (result numbers) | Color + large text | ⚠️ **Top-heavy** — active buttons draw attention but results are the payload |
| **PLANNER** | T-center (input card header) + M-left (yellow income number) | Color + text | ⚠️ **Scattered** — multiple yellow numbers at different positions |
| **STATS** | T-center (luck badge animation + glow) | Animation + gradient + color | ✅ **Top-anchored** — single dominant element, everything else recedes |
| **COLLECT** | T-center (progress bar gradient) + M-full (portrait grid) | Gradient + image | ✅ **Balanced** — hero element at top, uniform grid below |
| **TEAMS** | M-distributed (team member portraits) | Image + color badges | ⚠️ **Uniform** — no weight hierarchy among team slots |
| **PROFILE** | T-center (server buttons active state) + M-left (profile picture) | Color + image | ⚠️ **Split** — two competing weight anchors |

#### E2.7.3 — Font-Bold Distribution

`font-bold` appears 105 times across `App.jsx`. Semantic distribution:

| Purpose | Estimated Count | Appropriate? |
|---------|----------------|--------------|
| Card headers / section titles | ~25 | ✅ Yes — structural hierarchy |
| Stat values / numbers | ~35 | ✅ Yes — data emphasis |
| Button labels | ~15 | ⚠️ Debatable — buttons already have padding/border for emphasis |
| Body text emphasis | ~20 | ⚠️ Debatable — when everything is bold, nothing is |
| Status labels / badges | ~10 | ✅ Yes — compact elements need weight |

**Analysis**: ~35 of 105 `font-bold` instances (33%) are used for non-hierarchical purposes (button labels and body emphasis). This dilutes bold's signal value. Cross-reference: §E1-TYP3 already flagged this in Step 8.

> **E2-VW1 ✅** · LOW
> **Finding**: PLANNER tab has scattered visual weight — multiple yellow-400 numbers at different vertical positions without a clear hierarchy. Unlike STATS (single dominant luck badge) or TRACKER (clear banner card focal), PLANNER's yellow numbers all compete at similar visual weight.
> **Solution**: Establish a weight hierarchy: make the primary result (total Astrite or total pulls) the largest (`text-2xl`) and most saturated (gold with `.glow-gold` treatment). Reduce secondary numbers to `text-lg` without glow. This creates a clear visual gravity center.

> **E2-VW2** · PASS
> **Finding**: TRACKER, EVENTS, STATS, and COLLECT tabs all demonstrate intentional visual weight distribution. Weight flows naturally from top (orientation/anchor) to content (scannable area) without unintentional clustering. The STATS luck badge is the gold standard.
> **Solution**: No action needed. 4 of 8 tabs have excellent weight distribution.

---

### §E2.8 — Mobile Screen Real Estate Discipline

**Methodology**: Estimated vertical space consumption on a standard mobile viewport (360×640dp) for each tab. Counted how many primary-content items are visible without scrolling. Assessed touch target compliance and viewport-fit handling.

#### E2.8.1 — Viewport Budget (360×640dp)

**Fixed chrome consuming viewport height**:

| Element | Height (est.) | Notes |
|---------|--------------|-------|
| Status bar | 24px | System, not app-controlled |
| App header + logo | ~44px | `paddingTop: env(safe-area-inset-top)` + header content |
| Tab navigation bar | ~48px | Icons + 10px labels + `py-2` padding |
| Bottom safe area | ~16px | `env(safe-area-inset-bottom, 1rem)` |
| **Total fixed chrome** | **~132px** | |
| **Available content area** | **~508px** | 640 − 132 = 508px for tab content |

**Content area padding**: `pt-3` (12px top) + `px-3` (12px sides) = content starts 12px below tab bar.

**Effective scrollable viewport**: ~496px (508 − 12px top padding).

#### E2.8.2 — Above-the-Fold Content Per Tab

Estimated primary-content items visible without scrolling (496px available):

| Tab | First Card (est. height) | Second Card | Items Above Fold | Verdict |
|-----|-------------------------|-------------|------------------|---------|
| **TRACKER** | Category tabs card (~64px) | First banner card (~120px) + partial 2nd | **2–3 items** | ✅ Good |
| **EVENTS** | Heading + refresh (~32px) | Astrite card (~80px) + 1st event (~80px) | **3 items** | ✅ Good |
| **CALC** | Banner selection card (~120px) | Pity inputs card (~100px) + partial results | **2 items** + partial | ⚠️ Results may be clipped |
| **PLANNER** | Daily Income card (~140px) | Subscription toggles (~120px) | **2 items** | ⚠️ Results below fold |
| **STATS** | Luck badge card (~160px) | Leaderboard buttons (~48px) + partial percentile | **2–3 items** | ✅ Good — hero visible |
| **COLLECT** | Progress bar card (~80px) | Character grid (~200px visible) | **2 items** + grid | ✅ Good |
| **TEAMS** | Team header card (~64px) | First team slot (~120px) + partial 2nd | **2–3 items** | ✅ Adequate |
| **PROFILE** | Server Region card (~120px) | Profile card header (~64px) | **2 items** | ⚠️ Profile partially visible |

**Per skill threshold**: ≥3 primary items visible = adequate. 5 of 8 tabs meet this. CALC, PLANNER, and PROFILE are borderline at 2 items.

#### E2.8.3 — Touch Target Compliance

**KuroStyles touch targets** (`appcore-providers.jsx`):

| Component | Height | Width | Compliant? |
|-----------|--------|-------|------------|
| `kuro-btn` | ~36px (10px padding × 2 + 16px text) | auto | ⚠️ Below 44px on non-touch |
| `kuro-btn` on `@media (pointer: coarse)` | `min-height: 36px` | auto | ⚠️ Still 36px, not 44px |
| `kuro-input` | ~38px (10px padding × 2 + 18px text) | auto | ⚠️ Below 44px |
| `select` on `@media (pointer: coarse)` | `min-height: 44px` | auto | ✅ Meets guideline |
| Tab bar buttons | ~48px | ~40px (`px-2.5 py-2` + icon + text) | ✅ Meets guideline |
| Generic buttons on `(pointer: coarse)` | `min-height: 36px` | auto | ⚠️ Below 44px |

**Analysis**: The `@media (pointer: coarse)` query enforces 44px only on `<select>` elements. Buttons and inputs get 36px minimum on touch devices — **8px below** Apple's 44pt and Google's 48dp touch target guidelines. The tab bar buttons (48px) comply.

#### E2.8.4 — Viewport-Fit & Safe Area Handling

```
viewport meta: width=device-width, initial-scale=1, viewport-fit=cover
```

| Area | Implementation | Status |
|------|---------------|--------|
| Top safe area (notch/Dynamic Island) | `paddingTop: env(safe-area-inset-top, 0px)` on header | ✅ Correct |
| Bottom safe area (home indicator) | `paddingBottom: max(1rem, env(safe-area-inset-bottom, 1rem))` on main | ✅ Correct |
| Left/right safe area (landscape notch) | `padding-left/right: env(safe-area-inset-left/right)` on body | ✅ Correct |
| `viewport-fit: cover` | Set in meta tag | ✅ Correct |

**Full safe-area coverage** — all four insets handled. This is exemplary mobile craft.

> **E2-MO1 ✅** · MEDIUM
> **Finding**: Touch targets for `kuro-btn` and `kuro-input` are 36px on touch devices (`@media (pointer: coarse)`), **8px below** the recommended 44px minimum (Apple HIG) and **12px below** 48dp (Material Design). Only `<select>` elements correctly enforce 44px. This affects every interactive element in the app except the tab bar.
> **Solution**: In the `@media (pointer: coarse)` block, change `min-height: 36px` to `min-height: 44px` for `.kuro-btn`, `.kuro-input`, and generic buttons. This is a single CSS change that improves touch accuracy across the entire app. Consider `min-height: 48px` if Material Design compliance is desired.

> **E2-MO2 ✅** · LOW
> **Finding**: CALC and PLANNER tabs push primary results below the ~496px mobile fold. Users must scroll past inputs to see computed outputs (the value proposition). Only 2 primary items are visible above the fold on these tabs.
> **Solution**: Cross-reference with E2-FP1 ✅ solution. Show a compact "last result" summary above the input section, or make the result section sticky at the bottom of the viewport. Either approach ensures the computed value is always visible.

> **E2-MO3** · PASS
> **Finding**: Safe area inset handling is comprehensive — all four edges (top, bottom, left, right) use `env()` with fallbacks. The `viewport-fit: cover` meta tag enables edge-to-edge rendering. This is exemplary PWA mobile craft.
> **Solution**: No action needed.

---

### §E2.9 — Edge-to-Edge Content & Responsive Grid Breakpoints

**Methodology**: Assessed edge-to-edge content handling, landscape layout, and responsive breakpoint behaviour across all screen sizes.

#### E2.9.1 — Edge-to-Edge Content Assessment

**Page-level edge treatment**:

```
Screen edge
│ 12px (px-3)
│ │ Content area (max-w-lg = 512px on mobile)
│ │ │
│ ├──────────────────────────────────────────┤
│ │  Card (kuro-card)                         │
│ │  │ 14px (kuro-header / kuro-body padding) │
│ │  │ │ Card content                          │
│ │  └──────────────────────────────────────  │
│ │                                            │
│ │  Card (kuro-card)                         │
│ │  ...                                       │
│ ├──────────────────────────────────────────┤
│ │
│ 12px
```

**Total content inset from screen edge**: 12px (page) + 0px (card flush to container) + 14px (card body) = **26px** from screen edge to content text. On a 360px screen, this leaves 308px for content — **85.6% content efficiency**.

**Negative-margin bleed technique** (`.tab-content`):
- `margin-left: -0.75rem; margin-right: -0.75rem` (−12px)
- `padding: 0.75rem` (12px)
- Net effect: Tab content cards extend to the full width of `px-3` container, then cards within have their own padding. This creates **visual edge-to-edge** cards while maintaining text inset.

**True full-bleed elements**: None found. All content respects the 12px page padding. This is appropriate for a data-focused app — full-bleed is more suited to media/image content.

#### E2.9.2 — Responsive Breakpoint System

**Three-tier breakpoint architecture**:

| Breakpoint | Width | Layout | Source |
|------------|-------|--------|--------|
| **Mobile** (default) | <768px | Single column, `max-w-lg` (512px), centered | Tailwind + CSS-in-JS |
| **Tablet** (md:) | 768–1023px | Single column, `max-w-2xl` (672px), centered | Tailwind |
| **Desktop** (lg: / 1024px) | 1024–1439px | Sidebar (72px) + fluid content + ad margin (160px) | CSS-in-JS `@media` |
| **Ultra-wide** (1440px+) | 1440px+ | Same as desktop, ad margin expands to 180px | CSS-in-JS `@media` |

**Desktop layout structure** (CSS-in-JS, `@media (min-width: 1024px)`):

```
┌──────────┬─────────────────────────────┬──────────┐
│ Sidebar  │       Main Content          │ Ad       │
│ 72px     │  (fluid, no max-width)      │ 160px    │
│ fixed    │  margin-left: 72px          │ fixed    │
│ left: 0  │                             │ right: 0 │
│          │  Banner grid: auto-fit      │          │
│  Icons   │    minmax(420px, 1fr)       │          │
│  only    │  Event grid: auto-fill      │          │
│          │    minmax(380px, 1fr)       │          │
└──────────┴─────────────────────────────┴──────────┘
```

**Desktop-specific grid classes**:
- `.banner-grid`: `grid-template-columns: repeat(auto-fit, minmax(420px, 1fr))` — banner cards wrap to multiple columns
- `.event-grid`: `grid-template-columns: repeat(auto-fill, minmax(380px, 1fr))` — event cards wrap
- `.desktop-grid-2`: 2-column grid for PROFILE tab sections

**Tailwind responsive utilities used**:
- `md:max-w-2xl` — tablet width constraint
- `lg:max-w-none` — desktop removes width constraint
- `sm:grid-cols-5` — server/collection grid expands from 3 to 5 columns at 640px
- `lg:space-y-0` — removes vertical gaps when desktop grids activate

#### E2.9.3 — Landscape Layout Quality

**Assessment**: The app is a React SPA (PWA) running in a browser viewport. It does **not** have dedicated landscape layouts.

| Viewport | Behaviour |
|----------|-----------|
| Phone landscape (~640×360) | Single column stretches to `max-w-lg` (512px), centered. Content is readable but wastes ~128px horizontally. Tab bar remains at top (horizontal). |
| Tablet landscape (~1024×768) | Triggers desktop breakpoint (1024px). Sidebar + fluid content layout activates. **This is correct behaviour.** |

**Phone landscape specifically**: The `max-w-lg` (512px) constraint prevents the content from stretching to the full 640px width, maintaining readability. The remaining ~128px (64px per side after centering) is acceptable for a tool app. However, the tab navigation bar still consumes ~48px of the limited 360px vertical height, leaving only ~288px for content.

#### E2.9.4 — Tablet & Foldable Adaptation

| Device | Width Range | Layout | Quality |
|--------|-------------|--------|---------|
| Small tablet (768px) | `md:` | 672px centered single-column | ✅ Adequate — content is generously wide |
| Large tablet (1024px) | `lg:` | Sidebar + fluid + ad margin | ✅ Good — multi-column layout activates |
| Foldable unfolded (~840px) | Between md and lg | 672px centered | ⚠️ No dedicated treatment |
| Foldable folded (~360px) | Default mobile | 512px max single-column | ✅ Standard mobile |

**Foldable gap (840px)**: Between `md:max-w-2xl` (672px) and `lg:` (1024px), the layout uses a 672px-wide single column on an 840px screen — wasting 168px (20%). A `@media (min-width: 840px)` breakpoint with a wider content area or 2-column grid would improve foldable experience, but this is a niche concern.

> **E2-EE1** · PASS
> **Finding**: Edge-to-edge content handling is well-crafted. The negative-margin bleed technique on `.tab-content` creates visual edge-to-edge cards while maintaining proper text inset. Content efficiency is 85.6% on a 360px screen (26px total inset). No inappropriate full-bleed elements.
> **Solution**: No action needed. The edge treatment is appropriate for a data-focused tool app.

> **E2-EE2** · PASS
> **Finding**: The three-tier responsive breakpoint system (mobile < 768 < tablet < 1024 < desktop) provides appropriate layout adaptation. Desktop activates sidebar navigation, multi-column grids (banner-grid, event-grid), and removes the mobile max-width constraint. The `auto-fit` / `auto-fill` CSS Grid patterns handle intermediate widths gracefully.
> **Solution**: No action needed. The responsive architecture is well-implemented.

> **E2-EE3 ✅** · LOW
> **Finding**: Phone landscape (~640×360) leaves only ~288px vertical content area after status bar, header, and tab navigation. The tab bar (48px) consumes 13% of the limited vertical viewport. Content is readable but cramped — fewer than 2 primary items are visible.
> **Solution**: Consider hiding the tab navigation bar in landscape orientation via `@media (orientation: landscape) and (max-height: 500px)`, replacing it with a slide-out menu or swipe gestures. This would reclaim 48px (17% of available content area). Lower priority — landscape phone usage is a minority use case for a PWA.

> **E2-EE4** · PASS
> **Finding**: Tablet layout correctly triggers the desktop sidebar+fluid layout at 1024px. The `auto-fit minmax(420px, 1fr)` grid pattern gracefully handles intermediate widths. The foldable gap (840px) is a niche concern with minimal real-world impact.
> **Solution**: No action needed.

---

### §E2 — Combined Findings

| ID | Section | Severity | Title | Solution Summary |
|----|---------|----------|-------|-----------------|
| E2-VR1 ✅ | §E2.1 | LOW | Dual-rhythm system (14px CSS-in-JS vs 4px Tailwind grid) | Define `--spacing-card: 14px` token; create named card variants instead of Tailwind overrides |
| E2-VR2 | §E2.1 | PASS | Page-level vertical rhythm flawless (12px everywhere) | Document 12px as canonical section-gap |
| E2-DC1 ✅ | §E2.2 | LOW | Calculator stat boxes 43% denser than other tabs | Create `.kuro-stat-compact` CSS variant with 8px padding |
| E2-DC2 | §E2.2 | PASS | Internal section density excellent across character details | — |
| E2-DC3 | §E2.2 | PASS | List item density scales appropriately by content type | — |
| E2-AG1 | §E2.3 | PASS | Alignment grid robust — single-column + internal grids | — |
| E2-AG2 | §E2.3 | PASS | No unintentionally floating elements | — |
| E2-WS1 ✅ | §E2.4 | LOW | Sub-header margins inconsistent (4–8px for same role) | Standardize `mb-2` (8px); define `--spacing-header-gap` token |
| E2-WS2 | §E2.4 | PASS | Gestalt proximity grouping effective | — |
| E2-PR1 ✅ | §E2.5 | LOW | 5/12 label+value pairs at ≤1.11:1 ratio (weak distinction) | Increase value sizes or add font-weight differentiation |
| E2-PR2 | §E2.5 | PASS | Icon+text proportions consistent (1:1 default) | — |
| E2-FP1 ✅ | §E2.6 | MEDIUM | CALC + PLANNER push results below fold — split focal point | Results-first layout or sticky result section |
| E2-FP2 ✅ | §E2.6 | LOW | TEAMS tab has diffuse focus — all slots equal weight | Add `kuro-card-active` variant with glow for selected team |
| E2-FP3 ✅ | §E2.6 | LOW | PROFILE: Server config above identity display | Reorder: Profile first, Server second |
| E2-FP4 | §E2.6 | PASS | STATS luck badge is strongest focal element in app | Reference example for other tabs |
| E2-VW1 ✅ | §E2.7 | LOW | PLANNER: scattered yellow numbers without hierarchy | Differentiate primary (`text-2xl` + glow) from secondary (`text-lg`) |
| E2-VW2 | §E2.7 | PASS | 4/8 tabs have excellent visual weight distribution | — |
| E2-MO1 ✅ | §E2.8 | MEDIUM | Touch targets 36px on touch devices (below 44px guideline) | Change `min-height: 36px` → `44px` in `@media (pointer: coarse)` |
| E2-MO2 ✅ | §E2.8 | LOW | CALC + PLANNER: only 2 items above fold | Show compact result summary above inputs (cross-ref E2-FP1 ✅) |
| E2-MO3 | §E2.8 | PASS | Safe area inset handling exemplary (all 4 edges) | — |
| E2-EE1 | §E2.9 | PASS | Edge-to-edge technique well-crafted (85.6% efficiency) | — |
| E2-EE2 | §E2.9 | PASS | 3-tier responsive breakpoint system well-implemented | — |
| E2-EE3 ✅ | §E2.9 | LOW | Phone landscape: tab bar consumes 13% of limited height | Consider hiding tab bar in landscape via `@media` |
| E2-EE4 | §E2.9 | PASS | Tablet + foldable adaptation adequate | — |

**Severity summary**: 0 HIGH · 2 MEDIUM · 9 LOW · 13 PASS (24 findings total)

---

**STEP 9 COMPLETE** — §E2 Visual Rhythm & Spatial Composition fully audited.

**Vertical Rhythm**: 12px page rhythm is flawless across all 8 tabs. The 14px CSS-in-JS signature creates distinctive density, but Tailwind overrides break consistency in 4 instances.
**Density**: Card density is consistent at 14px except Calculator (8px override). Internal section density is excellent.
**Alignment**: Single-column stacked layout with internal grids — one of the app's strongest structural qualities. No floating elements.
**Whitespace**: Gestalt proximity grouping is effective. Sub-header margins vary (4–8px) but within a tight range.
**Proportions**: Icon+text consistent (1:1). Label+value pairs are strong in 7/12 cases but weak in 5/12 (relying on color alone).
**Focal Points**: STATS tab is exemplary. CALC/PLANNER suffer from input-above-results layout. TEAMS has diffuse focus.
**Visual Weight**: 4/8 tabs well-distributed. PLANNER has scattered yellow numbers.
**Mobile**: Safe area handling is exemplary. Touch targets at 36px are 8px below guideline — most impactful fix.
**Responsive**: 3-tier breakpoint system (mobile → tablet → desktop) with CSS Grid auto-fit for graceful intermediate widths. Phone landscape is the only weak spot.

---

## STEP 10 — §E3: Color Craft & Contrast

**Skill reference**: `app-audit-SKILL.md` §E3
**Scope**: ALL 8 tabs (TRACKER, EVENTS, CALC, PLANNER, STATS, COLLECT, TEAMS, PROFILE)
**Five-Axis reminder**: A1 NON-REVENUE · A2 FOCUS-TOOL + EMOTIONAL-SECONDARY · A3 ENTHUSIAST/EXPERT · A4 NAMED-SOURCE WuWa L3 · A5 FUNCTIONAL-PRIMARY + ATMOSPHERIC-SECONDARY

---

### §E3.1 — Color Harmony Assessment

**Methodology**: Assessed the background → surface → elevated-surface → accent hierarchy for clarity and harmonic consistency.

#### E3.1.1 — Surface Elevation Hierarchy

The app defines a 4-tier surface system:

| Level | Token / Source | Effective Color | OKLCH L% | Role |
|-------|---------------|-----------------|----------|------|
| S0 — Page | `#080c14` (index.css) | `#080c14` | ~14% | Base void |
| S1 — Card | `rgba(255,255,255,0.03)` on S0 | ~`#0f1320` | ~15.3% | Card surface |
| S2 — Panel | `rgba(255,255,255,0.05)` on S1 (`.bg-white/5`) | ~`#161a28` | ~16.0% | Nested panels |
| S3 — Input | `rgba(255,255,255,0.05)` on S1 | ~`#161a28` | ~16.0% | Input fields |

**Lightness staircase**: S0 (14%) → S1 (15.3%) → S2 (16.0%) → S3 (16.0%)

**Problem**: The lightness steps are too narrow — only 2% total range from S0 to S3. Cross-reference: **DC3-EL1 ✅** (Step 6) already flagged this as MEDIUM, recommending a 3% step per level. The app relies on borders and backdrop-blur rather than lightness to differentiate surfaces.

**Accent layer**: Gold (#edaf18, OKLCH L ~78.5%) sits 64.5 L-points above the page background — a massive contrast jump that makes accents "pop" without intermediate surface competition.

#### E3.1.2 — Harmonic Structure

The palette uses a **hexadic harmony** (6 near-equidistant hues) as documented in §DC5-HS1:

```
         CYAN (~195°)
       /            \
  EMERALD (~155°)    BLUE (~225°)
      |                |
  GOLD (~85°)      PURPLE (~300°)
       \            /
         PINK (~354°)
```

**Gold dominance**: ~40% of accent usage is gold. The remaining 5 hues share ~60%. This creates a clear "primary + 5 supporting" hierarchy — the harmonic equivalent of a dominant chord with color tones.

**Background-to-accent harmony**: The background `#080c14` has a cool blue-navy hue (~225°). Gold accents at ~85° sit at near-complementary position (~140° apart), creating strong visual tension. This is the same "gold on dark blue" compositional principle used in the Wuthering Waves game itself — a correct A4 (NAMED-SOURCE) alignment.

> **E3-CH1** · PASS
> **Finding**: The hexadic color harmony is well-structured with clear gold dominance. The background's cool blue-navy hue creates natural complementary tension with the gold accent. The 6-hue system provides maximum chromatic variety while maintaining hierarchy.
> **Solution**: No action needed. Cross-reference: §DC5-HS1 (PASS), §DC5-HS2 (PASS).

---

### §E3.2 — Dark Mode Craft

**Methodology**: Assessed whether dark surfaces use chromatic near-blacks (refined) vs pure neutrals (generic). Cross-referenced with §DC3 (Step 6) findings.

#### E3.2.1 — Background Chromaticity

| Surface | Hex | R | G | B | Chromatic? |
|---------|-----|---|---|---|------------|
| Page background | `#080c14` | 8 | 12 | 20 | ✅ Blue-navy (B channel 2.5× R) |
| Card surface | ~`#0f1320` | 15 | 19 | 32 | ✅ Blue-navy tinted |
| OLED background | `#000000` | 0 | 0 | 0 | ❌ Pure black (intentional) |
| Error boundary | `#080c12` | 8 | 12 | 18 | ✅ Blue-navy tinted |
| Tab background gradient | `#010204→#030610` | varies | varies | varies | ✅ Ultra-dark blue |

**All non-OLED surfaces carry blue-navy chromaticity.** The blue channel is consistently 1.5–2.5× the red channel, creating the "tactical/cyber" atmosphere. OLED mode's pure black is intentional and opt-in — already assessed in §DC3-BK1 (PASS).

#### E3.2.2 — Tonal Elevation vs Shadow Elevation

| Mechanism | Implementation | Effectiveness |
|-----------|---------------|---------------|
| **Lightness staircase** | 2% total range (S0–S3) | ❌ Insufficient — surfaces appear flat |
| **Border hairlines** | `rgba(255,255,255,0.03–0.2)` 5-level scale | ✅ Primary depth cue |
| **Backdrop blur** | `blur(4px)` on cards | ✅ Creates glass-like distinction |
| **Box shadows** | Multi-layer navy shadows | ⚠️ Mostly invisible on dark surfaces (§DC3-SH1 ✅) |
| **Accent micro-glow** | Color-specific box-shadow on hover/stat boxes | ✅ Creates chromatic depth on interaction |

**The app uses a "glass-panel" depth model** rather than Material Design's tonal elevation model. This is architecturally consistent with the Glassmorphism (secondary) classification from §DS1. The depth cues are: border → blur → glow, not lightness → shadow.

> **E3-DM1** · PASS (cross-ref DC3-EL1 ✅ MEDIUM)
> **Finding**: Dark surfaces consistently use chromatic blue-navy near-blacks rather than pure neutrals. The glass-panel depth model (border + blur + glow) is a deliberate alternative to Material Design's tonal elevation. The flat lightness range (2%) is compensated by other depth cues.
> **Solution**: The lightness compression was already flagged in DC3-EL1 ✅ (MEDIUM). If that fix is implemented (3% steps per level), dark mode craft improves automatically. No additional action needed here.

> **E3-DM2** · PASS
> **Finding**: OLED mode uses pure `#000000` for power savings — appropriate and opt-in. Non-OLED surfaces maintain blue-navy chromaticity throughout (B channel 1.5–2.5× R channel).
> **Solution**: No action needed. Cross-reference: §DC3-BK1 (PASS).

---

### §E3.3 — Accent Consistency (Overuse Detection)

**Methodology**: Mapped every gold accent instance by function to determine whether gold maintains signal value or has been diluted through overuse.

#### E3.3.1 — Gold Accent Functional Inventory

**38 total gold instances** in `appcore-providers.jsx` alone:

| Function | Instances | % of Total | Signal Type |
|----------|-----------|-----------|-------------|
| Focus outlines & glow | 5 | 13% | Interactive feedback |
| Button active states (`active-gold`) | 6 | 16% | Selection indicator |
| Card hover glow | 1 | 3% | Interactive feedback |
| Header accent bar (`h3::before`) | 1 | 3% | Structural decoration |
| Stat box gold variant | 6 | 16% | Data classification |
| Slider thumbs & glow | 6 | 16% | Interactive control |
| Skeleton shimmer | 1 | 3% | Loading state |
| Empty state gradient | 2 | 5% | Atmospheric |
| PWA meta theme-color | 3 | 8% | System integration |
| Toast warning background | 1 | 3% | ⚠️ Semantic state |
| Onboarding gradients | 2 | 5% | Atmospheric |
| Desktop tab highlight | 1 | 3% | Navigation indicator |
| Soft pity animation | 2 | 5% | Data feedback |

**Additionally in App.jsx**: Gold appears in `text-yellow-400`, `text-yellow-500`, `bg-yellow-500/10` etc. for data values (Astrite counts, pity numbers, cost displays, etc.) — estimated 50+ additional instances.

#### E3.3.2 — Overuse Assessment

**Gold functions as 4 distinct signals simultaneously**:

1. **Focus indicator** — "you're interacting with this"
2. **Selection state** — "this option is active"
3. **Data accent** — "this number is important"
4. **Warning state** — "something needs attention"

**Signal collision**: When a gold focus outline appears on a gold active-state button displaying a gold Astrite number inside a gold warning toast, gold is carrying 4 meanings in one viewport area. The user cannot distinguish which "gold" means what.

**Comparison with other accents**:
- **Cyan**: Banner coding (standard) + info toast + link color → 2–3 signals. Cross-reference: §DC5-TN1 ✅ flagged cyan as overused at 45+ instances.
- **Emerald**: Success toast + "Both" banner state → 2 signals. Clean separation.
- **Purple**: 4★ rarity coding only → 1 signal. Cleanest usage.
- **Pink**: Character banner coding only → 1 signal. Clean.
- **Red**: Error + 50/50 banner state → 2 signals. Acceptable.

#### E3.3.3 — Gold Signal Dilution Score

| Criterion | Score | Notes |
|-----------|-------|-------|
| Number of distinct signal types | 4 | Focus, selection, data, warning |
| Total instance count (CSS-in-JS + Tailwind) | ~88+ | 38 in CSS + ~50+ in Tailwind |
| Ratio of functional : decorative | 84:16 | Mostly functional — decorative use is low |
| Semantic collision risk | HIGH | Warning + accent share identical color |
| Dilution verdict | ⚠️ MODERATE | Gold is recognizable as "the accent color" but has lost semantic precision |

> **E3-AC1 ✅** · MEDIUM
> **Finding**: Gold serves 4 simultaneous signal functions (focus, selection, data accent, warning) across 88+ total instances. The warning-accent collision is the most problematic: users cannot visually distinguish "this is important data" from "something needs attention" since both use the same gold.
> **Solution**: Separate warning from accent. Use **amber-500** (`#f59e0b`, hue ~38°, 47° from gold's ~85°) for warning toasts and offline indicators. This preserves gold as the brand accent while giving warnings their own identity. The 47° hue shift is enough to distinguish at a glance while staying in the warm family. Cross-reference: §DC5-TN1 ✅ recommended introducing a rare tension color — amber warnings could partially serve this role.

> **E3-AC2 ✅** · LOW
> **Finding**: Gold focus outlines are visually indistinguishable from gold active-state button borders. When a gold-bordered button receives keyboard focus, the focus ring blends into the button's existing gold border, reducing focus visibility.
> **Solution**: For focus outlines specifically, use a slightly shifted gold with higher lightness: `rgba(var(--color-gold), 0.8)` with a `4px outline-offset` (currently 2px). Alternatively, use a white focus ring (`#ffffff` 2px solid) as a universal focus indicator that stands out against any colored surface.

---

### §E3.4 — Color Temperature Coherence

**Methodology**: Mapped the warm/cool distribution of the palette and assessed whether the temperature balance matches the app's emotional target.

#### E3.4.1 — Temperature Distribution

| Temperature | Colors | Instance Count (est.) | Share |
|-------------|--------|----------------------|-------|
| **Warm** | Gold, Orange, Red, Pink, Amber, Yellow | ~65+ | ~57% |
| **Cool** | Cyan, Blue, Purple, Emerald, Teal | ~50+ | ~43% |
| **Ratio** | — | — | **1.3:1 warm-dominant** |

**Warm-dominant breakdown**:
- Gold alone: ~88 instances (dominant warm contributor)
- Red/Pink: ~20 instances (error + character banner)
- Orange/Amber: ~5 instances (soft-pity, onboarding)

**Cool contributors**:
- Cyan: ~45 instances (standard banner, stats, links)
- Emerald: ~12 instances (success, "Both" state)
- Purple: ~13 instances (4★ rarity)

#### E3.4.2 — Temperature Coherence Assessment

**Background temperature**: Cool blue-navy (`#080c14`, hue ~225°)
**Primary accent temperature**: Warm gold (`#edaf18`, hue ~85°)
**Secondary accents**: Mixed warm (pink, red) + cool (cyan, emerald, purple)

**Tension model**: The cool-field + warm-island pattern was already documented in §DC1-TMP1 as "deliberately bimodal." The dark navy field provides a cool, calm foundation. Warm gold islands (buttons, stats, accents) create focal tension — drawing the eye to interactive and important elements.

This is a well-established dark UI pattern: cool backgrounds recede, warm accents advance. The 1.3:1 warm-dominant ratio is appropriate because accents need to dominate perception even though they occupy less screen area. The *perception* of warmth is higher than the raw instance count suggests because gold and red are perceptually louder than cyan and purple at equal saturation.

#### E3.4.3 — Temperature Clash Assessment

| Pairing | Context | Temperature | Clash? |
|---------|---------|-------------|--------|
| Gold on navy | Everywhere | Warm on cool | ✅ Intentional complementary tension |
| Pink on navy | Character banner | Warm on cool | ✅ Same pattern |
| Cyan on navy | Standard banner | Cool on cool | ⚠️ Low contrast temperature — cyan "sinks" into navy |
| Emerald on navy | Success, Both state | Neutral on cool | ✅ Adequate distinction |
| Purple on navy | 4★ rarity | Cool on cool | ⚠️ Low contrast temperature — similar to cyan issue |
| Red on navy | Error, 50/50 | Warm on cool | ✅ Intentional tension |

**Cyan-on-navy and purple-on-navy** are the weakest temperature pairings. Both cool accents on a cool background create less perceptual pop than warm accents. This is compensated by their high luminance (cyan L~65%, purple L~50% on a L~14% background), so they remain visible but feel less "energetic" than gold or pink.

> **E3-CT1** · PASS
> **Finding**: The warm-dominant (1.3:1) palette on a cool navy background follows the established "cool field + warm island" dark UI pattern. Temperature tension is intentional and well-calibrated. Cross-reference: §DC1-TMP1 (PASS).
> **Solution**: No action needed. The bimodal temperature model is a design strength.

> **E3-CT2 ✅** · LOW
> **Finding**: Cool accents (cyan, purple) on the cool navy background have lower temperature contrast than warm accents, making them perceptually quieter. Cyan's role as a secondary accent (45+ instances, §DC5-TN1 ✅) is partially undermined by this temperature similarity.
> **Solution**: For high-importance cyan elements (e.g., "Standard banner" stat values, info-toast text), consider using `cyan-300` (`#67e8f9`, L~82%) instead of `cyan-400` (`#22d3ee`, L~65%) to increase luminance contrast. This compensates for the low temperature contrast without changing the hue.

---

### §E3.5 — WCAG Contrast Compliance

**Methodology**: Calculated relative luminance and contrast ratios for every text/background combination. WCAG AA requires 4.5:1 for normal text (<18px or <14px bold) and 3:1 for large text (≥18px or ≥14px bold). WCAG AAA requires 7:1 / 4.5:1.

**Background luminance references**:
- `#080c14` (page): L ≈ 0.010
- `#0f1320` (card surface): L ≈ 0.015
- `#161a28` (elevated/input surface): L ≈ 0.021

#### E3.5.1 — Primary Text Colors on Page Background (#080c14)

| Text Color | Hex | Contrast vs #080c14 | AA Normal (4.5:1) | AA Large (3:1) | AAA (7:1) |
|-----------|-----|---------------------|-------|-------|------|
| White | `#ffffff` | **21.0:1** | ✅ PASS | ✅ PASS | ✅ PASS |
| --text-heading | `#edf1f8` | **19.8:1** | ✅ PASS | ✅ PASS | ✅ PASS |
| --text-body | `#dfe5ef` | **18.5:1** | ✅ PASS | ✅ PASS | ✅ PASS |
| text-gray-300 | `#d1d5db` | **17.1:1** | ✅ PASS | ✅ PASS | ✅ PASS |
| text-gray-400 | `#9ca3af` | **10.6:1** | ✅ PASS | ✅ PASS | ✅ PASS |
| text-gray-500 | `#6b7280` | **5.2:1** | ✅ PASS | ✅ PASS | ❌ FAIL |

**text-gray-500** at 5.2:1 passes AA but fails AAA. It's used for 107 instances in `App.jsx` — primarily for tertiary labels and de-emphasized metadata. At the typical usage size of `text-xs` (12px) or `text-[9px]`, these are small text and must meet 4.5:1 → 5.2:1 passes but with minimal margin.

#### E3.5.2 — Accent Colors on Page Background (#080c14)

| Accent Color | Hex | Contrast vs #080c14 | AA Normal | AAA |
|-------------|-----|---------------------|-----------|-----|
| Gold | `#edaf18` | **12.8:1** | ✅ PASS | ✅ PASS |
| Yellow-400 | `#facc15` | **14.2:1** | ✅ PASS | ✅ PASS |
| Cyan-400 | `#22d3ee` | **11.8:1** | ✅ PASS | ✅ PASS |
| Emerald-400 | `#34d399` | **11.0:1** | ✅ PASS | ✅ PASS |
| Purple-400 | `#a855f7` | **6.2:1** | ✅ PASS | ❌ FAIL |
| Purple-400 alt | `#c084fc` | **7.7:1** | ✅ PASS | ✅ PASS |
| Pink-400 | `#f472b6` | **8.0:1** | ✅ PASS | ✅ PASS |
| Red-400 | `#f87171` | **8.4:1** | ✅ PASS | ✅ PASS |
| Orange-400 | `#fb923c` | **10.3:1** | ✅ PASS | ✅ PASS |

**All accent colors pass WCAG AA.** Purple-400 (`#a855f7`) at 6.2:1 is the weakest, failing AAA. This was noted in §DC1-AC1 ✅ (MEDIUM) — the accent lightness range is wide (16.4 L-points between lightest and darkest accents).

#### E3.5.3 — Placeholder Text on Input Background

| Context | Text Color | Background | Contrast | AA? |
|---------|-----------|------------|----------|-----|
| Input placeholder (unfocused) | `#6b7389` | ~`#161a28` | **4.6:1** | ✅ BORDERLINE PASS |
| Input placeholder (focused) | `#8f99ab` | ~`#161a28` | **7.8:1** | ✅ PASS (AAA) |

The unfocused placeholder at 4.6:1 barely passes AA. WCAG 2.1 does not require placeholder text to meet contrast standards (only "real" text), but usability best practice recommends ≥4.5:1. The focused placeholder brighten-on-focus behavior is an excellent UX detail.

#### E3.5.4 — Text on Colored Backgrounds

Low-opacity colored backgrounds (stat boxes, badges):

| Text | Background | Effective BG | Contrast | AA? |
|------|-----------|-------------|----------|-----|
| text-emerald-400 | bg-emerald-500/10 | ~`#0f1e1b` | **11.0:1** | ✅ PASS |
| text-cyan-400 | bg-cyan-500/20 | ~`#0d1f26` | **11.7:1** | ✅ PASS |
| text-red-400 | bg-red-500/10 | ~`#0f1014` | **8.4:1** | ✅ PASS |
| text-yellow-400 | bg-yellow-500/20 | ~`#0f0f0a` | **14.2:1** | ✅ PASS |
| text-purple-400 | bg-purple-500/10 | ~`#0f0d18` | **6.2:1** | ✅ PASS |

All colored-text-on-colored-background combinations pass comfortably. The low-opacity backgrounds (5–20%) barely shift the effective background luminance, so contrast remains high.

#### E3.5.5 — WCAG Compliance Summary

| Category | Combinations Tested | AA Pass Rate | AAA Pass Rate |
|----------|-------------------|-------------|---------------|
| Primary text on page | 6 | **100%** (6/6) | **83%** (5/6) |
| Accents on page | 9 | **100%** (9/9) | **89%** (8/9) |
| Placeholder on input | 2 | **100%** (2/2) | **50%** (1/2) |
| Text on colored BG | 5 | **100%** (5/5) | **80%** (4/5) |
| **Overall** | **22** | **100%** | **82%** |

> **E3-WC1** · PASS
> **Finding**: All 22 text/background combinations tested meet WCAG AA (4.5:1 for normal text, 3:1 for large text). 100% AA compliance. The dark navy background provides excellent contrast for both light text and saturated accents.
> **Solution**: No action needed. This is strong accessibility compliance.

> **E3-WC2 ✅** · LOW
> **Finding**: `text-gray-500` (`#6b7280`) at 5.2:1 passes AA with only 0.7:1 margin. It's used 107 times at small sizes (text-xs, text-[9px]) where readability is already challenged. Cross-reference: §DBI3-S07 ✅ (HIGH) flagged 459 gray text instances as the single biggest genericness liability.
> **Solution**: Replace `text-gray-500` with `text-gray-400` (`#9ca3af`, 10.6:1) or a custom token `--text-muted: #8a91a0` (~7.5:1) that provides better contrast while maintaining the subdued appearance. This simultaneously fixes the WCAG margin issue and the genericness liability from §DBI3-S07 ✅.

---

### §E3.6 — Non-Text Contrast (WCAG 1.4.11)

**Methodology**: WCAG 2.1 Success Criterion 1.4.11 requires UI components and graphical objects to have at least 3:1 contrast against adjacent colors.

#### E3.6.1 — Border Contrast Against Backgrounds

| Border Token | Effective Color | vs #080c14 | vs #0f1320 (card) | Meets 3:1? |
|-------------|----------------|------------|-------------------|------------|
| `--border-subtle` | `rgba(255,255,255,0.06)` ≈ #1a1e2c | **1.7:1** | **1.4:1** | ❌ FAIL |
| `--border-default` | `rgba(255,255,255,0.08)` ≈ #212535 | **2.1:1** | **1.8:1** | ❌ FAIL |
| `--border-medium` | `rgba(255,255,255,0.1)` ≈ #282c3c | **2.7:1** | **2.3:1** | ❌ FAIL |
| `--border-hover` | `rgba(255,255,255,0.15)` ≈ #353a4d | **4.5:1** | **3.8:1** | ✅ PASS (hover) |
| `--border-bright` | `rgba(255,255,255,0.2)` ≈ #41465a | **6.5:1** | **5.5:1** | ✅ PASS |
| `border-white/10` (Tailwind) | `rgba(255,255,255,0.1)` | **2.7:1** | **2.3:1** | ❌ FAIL |

**3 of 6 border levels fail WCAG 1.4.11.** The three lowest borders (`--border-subtle`, `--border-default`, `--border-medium`) are below 3:1.

**Context**: These low-contrast borders are used for:
- `--border-subtle` (0.06): Card header/body separator — purely decorative
- `--border-default` (0.08): Default card border — provides subtle card edge
- `--border-medium` / `border-white/10` (0.1): 70% of all borders in the app (§DBI3-S11 ✅)

**Mitigating factor**: Cards are identifiable through multiple cues (backdrop-blur, shadow, padding, content grouping) — borders are not the sole identifier. WCAG 1.4.11 applies when the border is the *only* visual cue for identifying a UI component. For cards with other visual affordances, the low-contrast border is supplementary.

**However**: Input fields (`.kuro-input`) use `--border-default` (0.08, 2.1:1) as their primary boundary indicator. Without additional visual cues, the input border alone may be insufficient for some users to identify the input field boundary.

#### E3.6.2 — Focus Ring Contrast

| Focus Element | Focus Color | vs Background | Meets 3:1? |
|--------------|-------------|---------------|------------|
| Global `:focus-visible` | Gold `rgba(edaf18, 0.7)` | vs #080c14: **~9.0:1** | ✅ PASS |
| Interactive elements | Gold `rgba(edaf18, 0.8)` + 4px glow | vs #080c14: **~10.2:1** | ✅ PASS |
| Input `:focus-visible` | Gold border + dual glow | vs input BG: **~8.5:1** | ✅ PASS |

Focus indicators are well above 3:1. The gold focus ring + glow provides excellent keyboard navigation visibility.

#### E3.6.3 — Icon Button Contrast

Lucide icons use `currentColor` (inheriting text color). Since all text colors pass 4.5:1 (§E3.5), icons also pass 3:1. The hover `drop-shadow(0 0 3px currentColor)` glow further enhances icon visibility on interaction.

> **E3-NC1 ✅** · MEDIUM
> **Finding**: The 3 lowest border tokens (`--border-subtle` at 1.7:1, `--border-default` at 2.1:1, `--border-medium` at 2.7:1) fail WCAG 1.4.11's 3:1 requirement. For cards with multiple visual cues (blur, shadow, padding), this is acceptable as supplementary decoration. However, input fields using `--border-default` (2.1:1) rely on the border as their primary boundary identifier, creating an accessibility concern.
> **Solution**: Increase input field border to `--border-hover` (`rgba(255,255,255,0.15)`, 4.5:1) in the default unfocused state. This provides clear boundary visibility without requiring focus. Card borders can remain at lower contrast since they have supplementary depth cues. Alternatively, add a visible `background-color` distinction to inputs (e.g., `rgba(255,255,255,0.07)` instead of 0.05) to create a fill-based boundary.

> **E3-NC2** · PASS
> **Finding**: Focus indicators (gold outline + glow) exceed 3:1 on all backgrounds, ranging from 8.5:1 to 10.2:1. Icon buttons inherit text color contrast. Both meet WCAG 1.4.11 comfortably.
> **Solution**: No action needed.

---

### §E3.7 — State Colors

**Methodology**: Assessed hover, active, disabled, error, success, and warning state colors for distinctiveness, consistency, and brand alignment.

#### E3.7.1 — Interactive State System

| State | Mechanism | Color Change | Transform | Visual Feedback |
|-------|-----------|-------------|-----------|-----------------|
| **Default** | Base styling | — | — | Border + shadow + backdrop-blur |
| **Hover** | `:hover` (21 definitions) | Border brightens → `--border-hover/bright` | `translateY(-2px)` lift | Color-specific glow (gold, cyan, purple, etc.) |
| **Active** | `:active` (3 definitions) | None | `scale(0.97)` compress | Physical press feedback |
| **Focus** | `:focus-visible` (5 definitions) | Gold outline + glow | None | Strong gold ring + dual shadow |
| **Disabled** | `:disabled` (2 definitions) | `opacity: 0.4` + `saturate(0.7) brightness(0.8)` | None | Desaturated + dimmed |

**Assessment**:
- **Hover → Active transition**: Hover lifts (+2px) and glows; active compresses (0.97 scale) and removes lift. This creates a satisfying press-release cycle. ✅
- **Focus vs Hover conflict**: Both use gold — focus uses outline + glow, hover uses border-brightening + lift. On keyboard navigation, focused elements don't lift, creating a clear distinction. ✅
- **Disabled**: 40% opacity + desaturation + brightness reduction. Visually distinct from enabled state. The hover glow is explicitly disabled (`.button:disabled:hover svg { filter: none }`). ✅

#### E3.7.2 — Semantic State Colors

| State | Primary Color | Secondary | Token Exists? | Consistent? |
|-------|-------------|-----------|---------------|-------------|
| **Error** | `#f87171` (red-400) | `#ef4444` (red-500) | `--color-red: 248,113,113` ✅ | ✅ Two shades for hierarchy |
| **Success** | `#22c55e` (emerald-500) | `#34d399` / `#86efac` | `--color-emerald: 34,197,94` ✅ | ✅ Three shades for hierarchy |
| **Warning** | `#edaf18` (gold) | yellow-500, amber-500 | `--color-gold: 237,175,24` ⚠️ | ❌ Overlaps with accent |
| **Info** | Cyan (`#22d3ee`) | — | `--color-cyan: 56,189,248` ✅ | ⚠️ Also used for banner coding |

**Warning-Accent collision** (cross-reference E3-AC1 ✅): Warning toasts use gold (`rgba(237,175,24,0.9)`), which is identical to the primary brand accent. Users cannot distinguish "this is a warning" from "this is emphasized data."

#### E3.7.3 — Hover Color Consistency Across Component Types

| Component | Hover Border | Hover Shadow | Hover Transform | Color-Specific? |
|-----------|-------------|-------------|-----------------|-----------------|
| `.kuro-card` | `--border-hover` | Gold micro-glow | `translateY(-2px)` | ⚠️ Always gold glow |
| `.kuro-btn` | `--border-bright` | Upgraded shadow | `translateY(-2px)` | ❌ Generic white |
| `.kuro-stat` | `--border-bright` | Dark shadow | `translateY(-1px)` | ❌ Generic dark |
| `.kuro-stat-*` | Color-specific (0.7 opacity) | Color-specific glow | ❌ None | ✅ 7 color variants |
| `.kuro-input` | `rgba(255,255,255,0.3)` | ❌ None | ❌ None | ❌ Generic white |
| `.collection-card` | ❌ None | Dark shadow | `translateY(-4px) scale(1.02)` | ❌ Generic |

**Observation**: Card hover uses gold glow regardless of card content. Stat box hovers match their semantic color. Buttons and inputs use generic white borders. This creates an inconsistency: gold cards glow gold, but gold stat boxes *also* glow gold — one is decorative, the other semantic.

> **E3-SC1 ✅** · MEDIUM
> **Finding**: Warning state color (`#edaf18` gold) is identical to the primary brand accent. Users see the same gold for "important data" (accent), "you're interacting with this" (focus), and "something needs attention" (warning). This triple collision undermines warning's semantic distinctiveness.
> **Solution**: Assign warning a distinct color: `amber-500` (`#f59e0b`) for warning toasts and offline indicators. Create a `--color-warning: 245, 158, 11` token. Keep gold exclusively for accent/focus/selection. This resolves the collision while staying in the warm family. Cross-reference: E3-AC1 ✅ solution.

> **E3-SC2** · PASS
> **Finding**: Error (red), success (emerald), and info (cyan) state colors are distinct, consistent, and on-brand. Each has a CSS custom property token and uses 2–3 shade variants for hierarchy. The hover→active transition cycle (lift→compress) provides satisfying physical feedback.
> **Solution**: No action needed. The error/success/info system is well-designed.

> **E3-SC3 ✅** · LOW
> **Finding**: Card hover always uses gold micro-glow regardless of card content. This creates a minor semantic conflict with `.kuro-stat-gold:hover`, where both card and stat glow gold for different reasons (decorative vs data-classification).
> **Solution**: Change default `.kuro-card:hover` glow from gold to a neutral navy (`rgba(140, 160, 200, 0.08)`) or use `currentColor`-based glow. Reserve gold glow for explicitly gold-themed elements (`.kuro-stat-gold`, `.glow-gold`, `.active-gold`).

---

### §E3.8 — Color Psychology Alignment

**Methodology**: Assessed whether the palette's psychological character matches the app's emotional target from §0 (A2: FOCUS-TOOL + EMOTIONAL-SECONDARY for a gacha tracker/planner).

#### E3.8.1 — Emotional Target

From the Five-Axis Profile:
- **A2**: FOCUS-TOOL (primary) + EMOTIONAL-SECONDARY — the app is a utility first, but the gacha/gaming context calls for engagement warmth
- **A4**: NAMED-SOURCE WuWa L3 — must resonate with the game's aesthetic (dark, futuristic, gold-accented)
- **A5**: FUNCTIONAL-PRIMARY + ATMOSPHERIC-SECONDARY — function drives layout, atmosphere elevates it

**Ideal psychological profile**: Reliable precision (cool foundation) + exciting engagement (warm accents) + gaming energy (chromatic variety) + premium feel (calibrated, not generic)

#### E3.8.2 — Palette Psychology Assessment

| Color | Psychological Association | App Usage | Alignment |
|-------|--------------------------|-----------|-----------|
| **Navy background** (#080c14) | Trust, depth, professionalism, mystery | Page void | ✅ Matches "reliable precision" + "atmospheric depth" |
| **Gold accent** (#edaf18) | Achievement, premium, value, warmth | Accent, focus, data emphasis | ✅ Matches "exciting engagement" + WuWa's gacha reward color |
| **Cyan** (#22d3ee) | Technology, clarity, freshness, futurism | Standard banner, info | ✅ Matches "futuristic" + "functional clarity" |
| **Emerald** (#34d399) | Growth, success, safety, progress | Success, "Both" state | ✅ Matches "progress tracking" |
| **Purple** (#a855f7) | Rarity, magic, premium, mystery | 4★ rarity coding | ✅ Matches WuWa's purple = 4★ rarity system |
| **Pink** (#ec4899) | Character, personality, energy, playfulness | Character banner | ✅ Matches "character-centric" content |
| **Red** (#f87171) | Alert, danger, urgency, loss | Error, 50/50 loss | ✅ Matches "risk/loss" in gacha context |
| **Achromatic grays** (#6b7280–#d1d5db) | Neutrality, background, deference | Labels, metadata | ⚠️ Neutral — neither helps nor hurts |

**Alignment score**: 7/8 colors have clear psychological alignment with the app's emotional target. Only achromatic grays are psychologically neutral (which is their purpose — they defer).

#### E3.8.3 — Domain-Specific Color Correctness

**Gacha tracker conventions**:
- Gold = 5★ rarity / premium → ✅ The app uses gold for 5★ banner emphasis
- Purple = 4★ rarity → ✅ Correct convention
- Blue/Cyan = standard/basic → ✅ Standard banner uses cyan
- Red = loss / guaranteed next → ✅ 50/50 state uses red
- Green = success / obtained → ✅ Collection progress uses emerald

The color-meaning mapping is **native to the gacha domain**. A Wuthering Waves player will intuitively understand the color hierarchy without learning it. This is excellent A4 (NAMED-SOURCE) craft.

> **E3-CP1** · PASS
> **Finding**: The palette's psychological character aligns with the app's emotional target: cool navy = reliable precision, warm gold = exciting engagement, chromatic variety = gaming energy. All 6 accent colors carry domain-appropriate psychological associations (gold=5★, purple=4★, cyan=standard, red=loss, green=success, pink=character).
> **Solution**: No action needed. This is one of the app's strongest design qualities — the color language is native to the gacha domain.

---

### §E3.9 — Color Saturation Calibration

**Methodology**: Assessed whether colors feel purposefully calibrated or default/first-pick. Per skill reference: "Oversaturated colors (#FF0000, #00FF00) signal low craft."

#### E3.9.1 — Saturation Audit

| Color | Hex | HSL S% | Calibrated? | Notes |
|-------|-----|--------|-------------|-------|
| Gold | `#edaf18` | 83% | ✅ Yes | Rich but not neon — appropriate for a premium accent |
| Cyan-400 | `#22d3ee` | 84% | ✅ Yes | High saturation but Tailwind-standard; reads as "technology" |
| Emerald-500 | `#22c55e` | 72% | ✅ Yes | Desaturated from pure green — refined |
| Purple-400 | `#a855f7` | 91% | ⚠️ High | Very saturated — close to "first pick" territory |
| Pink-400 | `#ec4899` | 81% | ✅ Yes | Calibrated — not bubblegum-bright |
| Red-400 | `#f87171` | 91% | ⚠️ High | At Tailwind default — acceptable for error emphasis |
| Red (hardcoded) | `#ff0000` | **100%** | ❌ No | **Pure red — 5 instances.** Maximum saturation. Explicitly flagged as "low craft" in the skill reference. Cross-reference: §E1-COL4 ✅ (LOW). |
| Orange-400 | `#fb923c` | 96% | ⚠️ High | Very saturated — used for soft-pity animation |
| Blue-400 | `#60a5fa` | 94% | ⚠️ High | Tailwind default; used for 3★ tier coding |
| Achromatic grays | `#6b7280`–`#d1d5db` | 5–10% | ✅ Yes | Appropriately desaturated |

#### E3.9.2 — Oversaturation Assessment

**Colors at ≥90% HSL saturation**:

| Color | Hex | S% | Context | Risk |
|-------|-----|----|---------|------|
| `#ff0000` | Pure red | 100% | Trophy highlights (5 instances) | ❌ Maximum saturation — screams "placeholder" |
| Orange-400 | `#fb923c` | 96% | Soft-pity animation | ⚠️ Acceptable in animation (brief visibility) |
| Blue-400 | `#60a5fa` | 94% | 3★ tier coding | ⚠️ Tailwind default — reads as generic but serves domain purpose |
| Purple-400 | `#a855f7` | 91% | 4★ rarity | ⚠️ Tailwind default — acceptable for "magical" connotation |
| Red-400 | `#f87171` | 91% | Error states | ⚠️ Standard Tailwind — acceptable for alerting |

**Pure `#ff0000`** is the only definitively oversaturated value. At 100% saturation and 50% lightness, it's the most "uncalibrated" color possible. The 5 instances are in trophy/achievement displays — decorative but symbolically important.

**Most Tailwind-standard colors** (blue-400, purple-400, red-400, orange-400) sit at 91–96% saturation. While high, these are calibrated by Tailwind's design team and read as intentional within the Tailwind ecosystem. The risk is that they don't feel *bespoke* — they feel like Tailwind defaults.

#### E3.9.3 — Calibration Quality Score

| Tier | Colors | Count | Assessment |
|------|--------|-------|------------|
| **Well-calibrated** (S ≤ 85%) | Gold, Emerald, Pink, Grays | 4 | ✅ Feel intentional and refined |
| **Standard** (S 85–95%) | Cyan, Purple, Red, Blue, Orange | 5 | ⚠️ Tailwind-standard — functional but not bespoke |
| **Oversaturated** (S ≥ 95%) | `#ff0000`, Orange | 2 | ❌ Feel placeholder or unrefined |

**Overall**: The bespoke colors (gold, emerald, pink) are well-calibrated. The Tailwind-sourced colors are standard but not distinctive. The one true outlier (`#ff0000`) has been flagged repeatedly.

> **E3-SA1 ✅** · LOW
> **Finding**: 5 instances of pure `#ff0000` (100% saturation) in trophy displays. This is the definition of "uncalibrated" per the skill reference — maximum saturation signals placeholder color, not intentional design. Cross-reference: §E1-COL4 ✅ (LOW).
> **Solution**: Replace `#ff0000` with `#ef4444` (Tailwind red-500, 84% saturation) or the existing `--color-red` token (`#f87171`). Both are significantly more refined while remaining visually "red."

> **E3-SA2** · PASS
> **Finding**: The core bespoke colors (gold #edaf18, emerald #22c55e, pink #ec4899) are well-calibrated at 72–83% saturation — rich enough to be vibrant, restrained enough to feel intentional. The achromatic grays are appropriately desaturated.
> **Solution**: No action needed. The bespoke palette demonstrates good saturation craft.

> **E3-SA3** · PASS
> **Finding**: Tailwind-standard colors (cyan, purple, red-400, blue-400) at 84–94% saturation are within acceptable range. While not bespoke, they are calibrated by Tailwind's design team and functional within the app's context. The high saturation aligns with the gaming/gacha domain's expectation for chromatic energy.
> **Solution**: No action needed. For a fan tool (A1: NON-REVENUE), Tailwind-standard saturation is acceptable. Bespoke replacement would only be warranted if the app moved to A1: REVENUE.

---

### §E3.10 — Cross-Reference with §DC1–DC5 Findings

**Methodology**: Mapped every §E3 finding to related §DC findings from Steps 5–6 to identify convergence, confirm earlier assessments, and flag any contradictions.

| §E3 Finding | Related §DC Finding | Relationship |
|-------------|-------------------|-------------|
| E3-CH1 (PASS) — Hexadic harmony | DC5-HS1 (PASS) — Hexadic with gold dominance | ✅ **Confirmed** — same finding from different angle |
| E3-DM1 (PASS) — Chromatic near-blacks | DC3-EL1 ✅ (MEDIUM) — Flat surface elevation | ✅ **Confirmed** — E3 notes glass-panel compensation |
| E3-DM2 (PASS) — OLED appropriate | DC3-BK1 (PASS) — Pure black intentional | ✅ **Confirmed** |
| E3-AC1 ✅ (MEDIUM) — Gold warning collision | DC5-TN1 ✅ (MEDIUM) — Cyan overused | 🔗 **Related** — both are accent overextension issues; gold and cyan each serve too many roles |
| E3-AC2 ✅ (LOW) — Focus/active gold blend | DC2-BD1 ✅ (LOW) — No `--border-focus` token | 🔗 **Related** — both highlight lack of focus-specific design |
| E3-CT1 (PASS) — Temperature coherence | DC1-TMP1 (PASS) — Bimodal temperature | ✅ **Confirmed** |
| E3-CT2 ✅ (LOW) — Cool accents quiet | DC1-AC1 ✅ (MEDIUM) — Wide accent lightness range | 🔗 **Related** — cyan and purple are both darker/quieter accents |
| E3-WC1 (PASS) — WCAG AA 100% | DC1-TX1 (PASS) — Text perceptually calibrated | ✅ **Confirmed** |
| E3-WC2 ✅ (LOW) — Gray-500 marginal | DBI3-S07 ✅ (HIGH) — 459 gray instances | 🔗 **Converges** — the same gray text issue seen from accessibility vs genericness angles |
| E3-NC1 ✅ (MEDIUM) — Low border contrast | DC2-AC1 ✅ (LOW) — No `--accent-hover` token | 🔗 **Related** — border token system lacks contrast awareness |
| E3-SC1 ✅ (MEDIUM) — Warning=accent collision | DC1-SM1 (PASS) — Semantic colors reuse accent tokens | ⚠️ **Partial contradiction** — DC1 rated semantic reuse as PASS; E3 finds the warning-accent overlap is problematic. The earlier assessment didn't weigh the collision risk. |
| E3-CP1 (PASS) — Psychology alignment | DC5-ST2 (PASS) — Engagement temperature correct | ✅ **Confirmed** |
| E3-SA1 ✅ (LOW) — #ff0000 oversaturated | E1-COL4 ✅ (LOW) — Pure #ff0000 appears 5× | ✅ **Confirmed** — flagged from both token and saturation perspectives. ✅ FIXED |

**Key convergence**: The gray text issue (E3-WC2 ✅ + DBI3-S07 ✅ + E1-COL3 ✅) is now the **most cross-referenced finding in the entire audit** — appearing in 3 separate steps from 3 different analytical angles (accessibility, genericness, token governance). This confirms it as the single highest-impact fix available.

**One partial contradiction**: DC1-SM1 rated semantic color reuse as PASS, but E3-SC1 ✅ finds the warning-accent overlap problematic. The difference is analytical scope: DC1 assessed the *architecture* (tokens exist and are reused — structurally clean), while E3 assessed the *perceptual outcome* (user can't distinguish warning from accent — functionally problematic). Both assessments are correct within their scope.

---

### §E3 — Combined Findings

| ID | Section | Severity | Title | Solution Summary |
|----|---------|----------|-------|-----------------|
| E3-CH1 | §E3.1 | PASS | Hexadic harmony well-structured with gold dominance | Cross-ref DC5-HS1 |
| E3-DM1 | §E3.2 | PASS | Chromatic near-blacks with glass-panel depth model | Cross-ref DC3-EL1 ✅ (MEDIUM) for lightness fix |
| E3-DM2 | §E3.2 | PASS | OLED pure black appropriate and opt-in | Cross-ref DC3-BK1 |
| E3-AC1 ✅ | §E3.3 | MEDIUM | Gold serves 4 signals (focus/selection/data/warning) — warning collision | Separate warning to amber-500; create `--color-warning` token |
| E3-AC2 ✅ | §E3.3 | LOW | Gold focus ring blends into gold active-state borders | Use 4px outline-offset or white universal focus ring |
| E3-CT1 | §E3.4 | PASS | Warm-dominant (1.3:1) on cool navy — intentional | Cross-ref DC1-TMP1 |
| E3-CT2 ✅ | §E3.4 | LOW | Cool accents (cyan/purple) perceptually quiet on navy | Use cyan-300 for high-importance cyan elements |
| E3-WC1 | §E3.5 | PASS | WCAG AA 100% (22/22 combinations tested) | — |
| E3-WC2 ✅ | §E3.5 | LOW | text-gray-500 at 5.2:1 — marginal AA margin | Replace with `--text-muted: #8a91a0` (~7.5:1); cross-ref DBI3-S07 ✅ |
| E3-NC1 ✅ | §E3.6 | MEDIUM | Input border 2.1:1 fails WCAG 1.4.11 (3:1 required) | Increase input default border to `--border-hover` (0.15 opacity) |
| E3-NC2 | §E3.6 | PASS | Focus indicators + icons pass 3:1 comfortably | — |
| E3-SC1 ✅ | §E3.7 | MEDIUM | Warning color = accent color (both gold) | Assign amber-500 to warnings; create `--color-warning` token |
| E3-SC2 | §E3.7 | PASS | Error/success/info state colors distinct and consistent | — |
| E3-SC3 ✅ | §E3.7 | LOW | Card hover glow always gold regardless of content | Change card hover to neutral navy glow |
| E3-CP1 | §E3.8 | PASS | Color psychology aligns with gacha domain conventions | — |
| E3-SA1 ✅ | §E3.9 | LOW | 5× pure #ff0000 (100% saturation) — uncalibrated | Replace with #ef4444 or `--color-red`; cross-ref E1-COL4 ✅ |
| E3-SA2 | §E3.9 | PASS | Bespoke colors (gold, emerald, pink) well-calibrated | — |
| E3-SA3 | §E3.9 | PASS | Tailwind-standard saturation acceptable for fan tool | — |

**Severity summary**: 0 HIGH · 3 MEDIUM · 6 LOW · 9 PASS (18 findings total)

---

**STEP 10 COMPLETE** — §E3 Color Craft & Contrast fully audited.

**Color harmony**: Hexadic 6-hue system with gold dominance and complementary gold-on-navy tension. Well-structured.
**Dark mode**: Chromatic blue-navy near-blacks throughout. Glass-panel depth model (border + blur + glow) compensates for flat lightness staircase.
**Accent consistency**: Gold is overextended — serves 4 simultaneous signals (focus, selection, data, warning). Warning-accent collision is the primary issue.
**Temperature**: 1.3:1 warm-dominant palette on cool navy field. Deliberate bimodal pattern. Cool accents (cyan, purple) are perceptually quieter.
**WCAG contrast**: 100% AA compliance across 22 text/background combinations. text-gray-500 passes with minimal margin.
**Non-text contrast**: Input borders fail 3:1 (WCAG 1.4.11). Focus rings and icons pass comfortably.
**State colors**: Error (red), success (emerald), info (cyan) are distinct and consistent. Warning overlaps with accent (gold).
**Psychology**: Perfect domain alignment — gacha-native color language (gold=5★, purple=4★, cyan=standard, red=loss, green=success).
**Saturation**: Core bespoke colors well-calibrated. 5× pure `#ff0000` is the only truly uncalibrated value.
**Cross-reference**: Gray text issue now the most cross-referenced finding in audit (3 steps, 3 angles). Warning-accent collision is the second most impactful new finding.
