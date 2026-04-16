# DESIGN-SYSTEM.md — Whispering Wishes

The LAHAI-ROI design language — token inventory, component conventions, and authoring rules.

> Source of truth: `src/styles/kuro.css` (2926 LOC, with P-FIX audit markers throughout).
> Companion docs: [BRAND.md](./BRAND.md) · [VOICE.md](./VOICE.md) · [ARCHITECTURE.md](./ARCHITECTURE.md)

---

## Token Architecture — 3 Layers

### Layer 1 — Primitives (raw values, no meaning)

Defined in `src/styles/kuro.css:112-249` and `tailwind.config.js`.

```css
/* Color components (as RGB so tokens can interpolate alpha) */
--color-gold:    237, 175, 24;   /* oklch(78% 0.17 85°) */
--color-pink:    236, 72, 153;
--color-cyan:    56, 189, 248;
--color-purple:  168, 85, 247;
--color-emerald: 34, 197, 94;
--color-red:     248, 113, 113;

/* Spacing (non-standard 6px base) */
--space-xs: 4px; --space-base: 6px; --space-sm: 8px;
--space-md: 12px; --space-lg: 16px; --space-xl: 24px; --space-2xl: 32px;

/* Radius (7-tier scale) */
--radius-micro: 1px; --radius-xs: 3px; --radius-sm: 5px;
--radius-md: 7px;    --radius-lg: 11px; --radius-xl: 15px;
--radius-pill: 9999px; --radius-full: 100px;

/* Type scale (Major Second 1.125×) */
--font-2xs: 10px; --font-sm: 11px; --font-base: 13px;
--font-md: 14px;  --font-lg: 16px; --font-xl: 17px;
--font-2xl: 19px; --font-3xl: 20px; --font-4xl: 22px;
--font-5xl: 23px; --font-6xl: 25px;

/* Font families */
--font-display: 'Rajdhani', ui-sans-serif, system-ui, sans-serif;
--font-accent:  'Cinzel', 'Rajdhani', ui-serif, Georgia, serif;
--font-data:    'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;

/* Motion */
--transition-fast:   0.1s  var(--ease-branded);
--transition-normal: 0.18s var(--ease-branded);
--transition-slow:   0.4s  cubic-bezier(0.16, 1, 0.3, 1);
--ease-branded:      cubic-bezier(0.16, 1, 0.3, 1);  /* single curve */
```

### Layer 2 — Semantic (what things mean)

```css
/* Surfaces — lightness-based elevation (no shadows on dark mode) */
--bg-card:       rgba(14, 19, 30, 0.55);
--bg-card-inner: rgba(6, 10, 18, 1);
--bg-elevated:   rgba(20, 26, 38, 0.7);
--bg-btn:        rgba(15, 20, 28, 0.85);
--bg-input:      rgba(15, 20, 28, 0.9);
--bg-stat:       rgba(10, 14, 22, 0.8);

/* Text — chromatic blue-hinted grays (hue ≈250°) */
--text-heading:   #edf1f8;   /* oklch ~95% 0.008 250 */
--text-body:      #dfe5ef;
--text-secondary: #c5ccda;   /* oklch 82% 0.010 250 */
--text-muted:     #8f99ab;   /* oklch 65% 0.012 250 */
--text-disabled:  #8b95a5;

/* Borders — 5-tier opacity scale */
--border-subtle:  rgba(255,255,255,0.06);
--border-default: rgba(255,255,255,0.08);
--border-medium:  rgba(255,255,255,0.1);
--border-hover:   rgba(255,255,255,0.15);
--border-bright:  rgba(255,255,255,0.2);
--border-focus:   rgba(var(--color-gold), 0.5);

/* Accent */
--accent-hover:  rgba(var(--color-gold), 0.8);
--accent-cyan:   #67e8f9;
--accent-purple: #c084fc;

/* State */
--state-error:   #f87171;
--state-success: #2dd4bf;
--state-info:    #38bdf8;
--color-warning: #f59e0b;

/* Domain — element colors */
--element-fusion:  #ef4444;
--element-electro: #a855f7;
--element-aero:    #10b981;
--element-glacio:  #38bdf8;
--element-havoc:   #ec4899;
--element-spectro: #edaf18;

/* Domain — rarity */
--rarity-3star: #60a5fa;
--rarity-4star: var(--accent-purple);
--rarity-5star: rgba(var(--color-gold), 1);

/* Shadow — ambient 0-offset glow with gold tint */
--shadow-sm: 0 0 4px  rgba(6,10,24,0.5), 0 0 4px  rgba(var(--color-gold),0.03);
--shadow-md: 0 0 12px rgba(6,10,24,0.6), 0 0 8px  rgba(var(--color-gold),0.04);
--shadow-lg: 0 0 24px rgba(6,10,24,0.7), 0 0 12px rgba(var(--color-gold),0.05);
--shadow-xl: 0 0 40px rgba(6,10,24,0.8), 0 0 16px rgba(var(--color-gold),0.06);

/* Z-index scale */
--z-base: 0;        --z-elevated: 10;   --z-sticky: 100;
--z-overlay: 1000;  --z-modal: 9000;    --z-toast: 9500;
--z-install: 9800;  --z-max: 9999;

/* Backdrop blur */
--blur-sm: 4px; --blur-md: 8px; --blur-lg: 16px;
```

### Layer 3 — Component (values-in-context)

```css
--card-radius: var(--radius-xl);
--card-padding: 14px;
--btn-radius: var(--radius-lg);
--btn-padding: 10px 12px;
--input-radius: var(--radius-md);
--input-padding: 10px 12px;
--stat-radius: var(--radius-lg);
--label-margin: var(--space-base);
--divider-margin: var(--space-md);

/* Dimension tokens */
--height-banner:  190px;  --height-card-sm: 140px;
--height-card-md: 160px;
--size-avatar-lg: 110px;  --size-avatar-md: 68px;
--size-avatar-sm: 28px;
--size-touch-min: 44px;   --size-icon-btn: 28px;
```

---

## Spacing — Dual-Rhythm System

The app intentionally uses **two coordinated spacing rhythms**. This is documented at `kuro.css:99` (ref `E2-VR1`).

| Rhythm | Unit | Used for | Example |
|---|---|---|---|
| **Tactical (CSS tokens)** | 6px multiples | Within-component density (card padding, input padding, gap between inline elements) | `--space-base=6`, `--card-padding: 14px` |
| **Standard (Tailwind)** | 4px multiples | Layout spacing (page padding, section gaps, margin between cards) | `p-3`, `gap-4`, `mt-8` |

### When to use which

- **Within a component** (e.g. stat cell internal padding, form-row gap): reach for `--space-*` tokens
- **Between components or sections** (e.g. `space-y-3` on a card list): Tailwind utilities
- **Never mix** inside the same layout — pick one rhythm per container scope

### Visual reference

```
┌─ Tab container (Tailwind space-y-3 = 12px between cards) ───┐
│                                                               │
│  ┌─ Card (--card-padding: 14px internal) ─────────────────┐  │
│  │ Header (--space-base: 6px gap from content)             │  │
│  │ ┌───┐  ┌─────────┐  ┌─────────┐                         │  │
│  │ │ic │  │ value   │  │ value   │  ← --space-sm gap (8px) │  │
│  │ └───┘  └─────────┘  └─────────┘                         │  │
│  │ Divider: --divider-margin (12px) above                  │  │
│  │ Body (--space-md gap between rows)                      │  │
│  └─────────────────────────────────────────────────────────┘  │
│                            ↕ space-y-3 (12px, Tailwind)       │
│  ┌─ Next card ─────────────────────────────────────────────┐  │
│  │                                                           │
```

### Rule of thumb

> If you're writing JSX layout → use Tailwind `p-*`, `gap-*`, `space-y-*`.
> If you're writing CSS inside a `.kuro-*` component class → use `--space-*` / `--card-padding` / `--btn-padding` tokens.

---

## Typography System

| Level | Size | Weight | Family | Use |
|---|---|---|---|---|
| Hero display | 25px | 700 | Rajdhani | Page title, primary result card |
| Display | 22-23px | 600-700 | Rajdhani | Section headings, card titles |
| Subhead | 19-20px | 500-600 | Rajdhani | Card subtitles, stat labels |
| Body large | 17px | 500 | Rajdhani | Primary text, button labels |
| Body | 16px | 400-500 | Rajdhani | Default body |
| Body compact | 14px | 400 | Rajdhani / system | Dense content areas |
| Small | 13px | 400 | System (`.kuro-calc`) | Captions, metadata |
| Micro | 10-12px | 400-500 | JetBrains Mono for numbers | Labels, tags |
| Data | any | 500 | JetBrains Mono | Pity, %, cost — tabular-nums |
| Ceremonial | 20px+ | 600-700 | Cinzel | Trophy names, ritual moments |

### Tracking rules

- **Body** (14-18px): 0 to +0.01em
- **UI labels** (10-12px): +0.03 to +0.06em
- **Buttons**: +0.02em (see `kuro.css:779`)
- **Caps labels**: +0.06em minimum
- **Display** (24px+): -0.01 to -0.02em

---

## Component Conventions

### Button (`kuro-btn`)

```css
Background:   var(--bg-btn)              /* dark glass */
Border:       1px solid var(--border-medium)
Radius:       var(--btn-radius)           /* 11px */
Padding:      var(--btn-padding)          /* 10px 12px */
Font:         var(--font-display), 500, var(--font-base), letter-spacing: 0.02em
Shadow:       var(--shadow-md)            /* ambient glow */
Backdrop:     blur(var(--blur-md))
Hover:        border-bright + translateY(-2px) + shadow-lg
Active:       scale(0.97) via active: utility
Focus:        outline 2px gold + 4px halo box-shadow (AAA contrast)
```

Variants: `kuro-btn-primary` (gold fill), `active-gold/cyan/red/emerald` (state colors), `kuro-btn-sm` (compact).

### Card (`kuro-card`)

```css
Background:   var(--bg-card)              /* 55% dark navy glass */
Radius:       var(--card-radius)          /* 15px */
Padding:      var(--card-padding)         /* 14px */
Shadow:       var(--shadow-lg)            /* ambient glow */
Backdrop:     blur(var(--blur-lg))
Frame:        ::before + ::after corner brackets (signature motif)
Hover:        translateY(-2px), shadow intensifies
Inner:        .kuro-card-inner (opaque substrate)
```

### Input (`kuro-input`)

```css
Background:   var(--bg-input)             /* 90% dark glass */
Border:       1px solid var(--border-bright)
Radius:       var(--input-radius)         /* 7px — smaller than button */
Padding:      var(--input-padding)        /* 10px 12px */
Focus:        border gold + outline gold + halo
Error:        kuro-input-error class — coral border + red-tinted box-shadow
Select:       custom SVG chevron replaces native dropdown
```

### Toast (`kuro-toast`)

```css
Position:     fixed bottom-20, pill layout
Stack:        max 5, newest on top, auto-dismiss 3000ms (5000ms for errors)
Animation:    slideUp 0.18s cubic-bezier(0.16, 1, 0.3, 1)
Variants:     info / success / warning / error via border-color
Haptic:       paired per severity
Aria:         role="status" aria-live="polite" aria-atomic="true"
```

---

## Motion Vocabulary

| Purpose | Duration | Easing | Example |
|---|---|---|---|
| Micro-feedback (button press) | 100ms | ease-branded | Ripple, color shift |
| Component state change | 180ms | ease-branded | Hover lift, tab switch |
| Page/sheet transition | 400ms | ease-branded | Bottom-sheet slideUp, tab fade |
| Signature loops | 3-8s | ease-in-out | `moonGlowPulse`, `trophyShine`, `bannerBorderGlow` |

**Always:** use `--ease-branded` for interactive transitions.
**Never:** use `transition: all` or `ease-in-out` for single interactions.
**Reduced motion:** `@media (prefers-reduced-motion: reduce)` + `useVisualSettings.animationsEnabled`.

---

## Color Harmony Quick Reference

```
Primary palette:
  Background: #080c14 void (cosmic, cold)
  Primary:    #edaf18 gold (warm strike, ONLY for primary moments)
  Text stack: blue-hinted grays (#edf1f8 → #8f99ab)

Complementary tension:
  Cyan #38bdf8 — info, standard banner, Glacio
  Purple #a855f7 — 4★, Electro
  Pink #ec4899 — weapon banner, Havoc
  Emerald #10b981 — Aero, success-adjacent
  Amber #f59e0b — warning (distinct from brand gold)

State colors (calibrated, not raw):
  Error:   #f87171 (desaturated coral)
  Success: #2dd4bf (teal, not traffic-light green)
  Info:    #38bdf8 (matches cyan accent)
```

---

## Authoring Rules (new components)

Before adding a new component to `kuro.css`:

1. ✅ Does it use token values only? (no raw hex, no magic numbers)
2. ✅ Does it have all 5+ states designed? (rest / hover / active / focus / disabled / error)
3. ✅ Does it pass §BAN — no Tailwind-default hex, no `transition: all`, no shadow-sm clones?
4. ✅ Does the radius come from the 7-tier scale?
5. ✅ Does the shadow use ambient gold-navy glow?
6. ✅ Does keyboard focus get the 2px + 4px halo treatment?
7. ✅ Does it respect `prefers-reduced-motion`?
8. ✅ Does touch meet 44px minimum on coarse pointers?
9. ✅ Is new copy in the voice of `docs/VOICE.md`?
10. ✅ Is any domain term a canonical one from the vocabulary table?

If any answer is no, revise before merging.

---

## Related docs

- [BRAND.md](./BRAND.md) — identity thesis, protected elements, five-axis profile
- [VOICE.md](./VOICE.md) — copy voice rules, domain vocabulary, anti-examples
- [ARCHITECTURE.md](./ARCHITECTURE.md) — module layers, API routes, persistence map
- `src/styles/kuro.css` — implementation source, with P-FIX history
