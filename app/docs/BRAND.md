# BRAND.md — Whispering Wishes

The identity contract. When in doubt about a visual or verbal decision, this is the final reference.

---

## Identity Thesis

> **"A HUD inside a cosmic observatory — tactical precision meets gacha anticipation, expressed in gold-on-void with Rajdhani display type, game-lore voice, 1.25px Lucide icons, corner-bracket card frames, and a single branded ease curve — for enthusiast WuWa players who want an insider-authentic companion tool, not a corporate gacha calculator."**

_(Self-declared at `src/styles/kuro.css:12`; extracted and extended per the design audit §DP2 brief.)_

---

## Five-Axis Profile

| Axis | Value | Implication |
|---|---|---|
| **A1 Commercial intent** | Non-revenue (community gift / fan tool) | Visual goals shift to craft, clarity, authenticity. Trust signals irrelevant; insider authenticity matters. |
| **A2 Use context** | Enthusiast daily-use · emotional (gacha anticipation) | Density is a feature; delight moments are appropriate; abrupt jarring transitions are wrong. |
| **A3 Audience** | WuWa enthusiast players (strong insider register) | Domain vocabulary expected; visual complexity permitted; explanatory tooltips not required. |
| **A4 Subject identity** | STRONG — Wuthering Waves has a definitive aesthetic | Palette, typography, and voice should feel inspired by the game, never imported from a different world. |
| **A5 Aesthetic role** | Aesthetic AMPLIFIES value | Good craft builds trust in calculator accuracy and rewards daily use. |

---

## Protected Elements (non-negotiable)

These cannot change without a formal rebrand. Every feature addition is tested against them.

| Element | Exact value | Reason |
|---|---|---|
| **Primary accent** | `#edaf18` / OKLCH 78% 0.17 85° | Gold signifies gacha reward + 5★ rarity. Any other accent breaks the "transformation" archetype. |
| **Background void** | `#080c14` / OKLCH 8% 0.02 260° | Cosmic observatory base. OLED override `#000000`. Never `#ffffff` or neutral gray. |
| **Display typeface** | Rajdhani (weights 400/500/600/700) | Geometric + slightly condensed. Game-HUD personality. |
| **Data typeface** | JetBrains Mono | Precision for numerals, pity, percentages. |
| **Ceremonial typeface** | Cinzel | Reserved for hero / trophy / ritual moments. |
| **Branded easing** | `cubic-bezier(0.16, 1, 0.3, 1)` | Single curve for all interactive transitions. No spring, no bounce. |
| **Corner-bracket card frame** | `::before` + `::after` pseudo motif | Signature compositional element across the card family. |
| **Icon stroke weight** | Lucide at 1.25px override | Refined from default 2px. Matches body type weight. |
| **Voice register** | Game-lore insider | "Convene / Resonator / Tacet / Sequence / Forte". Never "Pull / Character / Error / OK". |
| **Shadow model** | 0-offset ambient blur + subtle gold tint | No directional light. The observatory has no sun. |
| **Shape radius family** | 1 / 3 / 5 / 7 / 11 / 15 / pill — tiered per-component | No single radius across all elements. |
| **Spacing base** | 6px (non-standard) | Distinctive rhythm; coexists with Tailwind 4px grid via documented dual-rhythm. |

---

## Always / Never

### Always

- Use `--color-gold` for the primary CTA, 5★ indicator, focus ring, and hover glow
- Use game-lore vocabulary in every user-visible string
- Use `--ease-branded` for every interactive transition
- Use chromatic blue-hinted grays (`--text-heading/body/secondary/muted`) — never neutral grays
- Use per-component radius tokens, not a single `rounded-lg`
- Design all 6 states (empty, loading, error, partial, success, saturated) with character
- Test each new visual addition against the §DP2 brief and the protected-elements list
- Preserve existing canvas-animated backgrounds as atmospheric layer — they are part of the material

### Never

- Introduce Tailwind-default hexes as accent (`#3b82f6`, `#8b5cf6`, `#10b981`, `#ef4444`)
- Write "Submit / OK / Click here / No data found / Something went wrong"
- Use `transition: all` — always target specific properties
- Use `rgba(0, 0, 0, ...)` for shadows — use the gold-navy ambient tokens
- Introduce bouncy-spring easing — violates tactical-precision character
- Apply a single border-radius to every component
- Import figurative stock illustrations (Undraw / Storyset / Humaaans) — breaks diegetic feel
- Use pure white on pure black — always chromatic near-extremes

---

## Sensory Vocabulary

A shared mental model for new visual decisions.

> **"The UI is a HUD inside a cosmic observatory."**

| Implication | Manifestation |
|---|---|
| There is no physical sun | Shadows are 0-offset ambient, not directional |
| Surfaces are emissive | Buttons glow gold on hover; focus rings emit outward |
| The void is navy, not black | Background has 260° hue undertone, not pure `#000` |
| Gold is starlight, not decoration | Used only at primary moments, never filler |
| Text is readable because it's chromatic | Even "muted" text carries the 250° hue |
| Motion is physical but cold | 180ms ease-out; no bounce, no spring, no warmth |

When a new component asks "what should my shadow look like?" — the answer comes from this model: a 0-offset navy-gold ambient glow, never a top-left drop shadow.

---

## Visual Signatures (the product's fingerprints)

A user should recognize a Whispering Wishes screenshot from any of these alone:

1. **Gold-on-void palette** — the exact temperature contrast
2. **Corner-bracket card frames** — geometric HUD motif
3. **Rajdhani + JetBrains Mono pairing** — display + data tier
4. **Game-lore voice** — "Awaiting signal resonance" where others say "No data found"
5. **Ambient 0-offset glow shadows** — no physical light source
6. **Canvas-animated per-character atmosphere** — procedural art, not stock

Any of these six, alone, should be enough to identify the app.

---

## Archetype

**Magician + Sage** (self-declared at `kuro.css:14`)

- **Magician**: the transformation archetype — converting astrite + anxiety into a probability-informed decision. Gold signifies the reward moment.
- **Sage**: the data mastery archetype — dense tabular numerals, percentile indicators, uncertainty disclosure.

Design decisions should serve one or both. A playful brand element would violate the Magician/Sage pairing.

---

## References

- Design language: `src/styles/kuro.css` (2926 LOC with P-FIX audit history)
- Token architecture: `docs/DESIGN-SYSTEM.md`
- Voice & copy rules: `docs/VOICE.md`
- Module map: `docs/ARCHITECTURE.md`
