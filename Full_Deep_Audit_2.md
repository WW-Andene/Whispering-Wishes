# Full Deep Audit 2 — P6: Visual Design & Polish
## Whispering Wishes v3.2.3

---

# STEP 1: §0 Aesthetic Context Block + Five-Axis Profile

## §0 — Design Identity (Extracted from Code)

### Current Style
**Dark cyberpunk-luxe** with glassy frosted-glass card system. Deep navy-blue backgrounds (`#080c14`) with warm gold (`#edaf18`) as the dominant accent. Cards use `backdrop-filter: blur(4px)` with multi-layered `box-shadow` and decorative corner borders. A curated design system ("KuroStyles") spanning ~960 lines of CSS-in-JS governs all component styling. The palette is dark-mode-only with an OLED mode toggle. Element-based color coding (Fusion=orange, Electro=purple, Aero=emerald, Glacio=cyan, Havoc=pink, Spectro=yellow) maps to Wuthering Waves' in-game element system.

### Intended Style
A premium companion app for Wuthering Waves (gacha game) that feels like it belongs to the game's universe. The design language references the game's cyberpunk-fantasy aesthetic while maintaining tool-level usability for pity tracking, pull calculations, event timelines, and collection management.

### Personality
Focused precision with atmospheric depth. The app should feel like a precision instrument (JetBrains Mono for data, tabular numerals, calculated pity rings) wrapped in the game's emotional atmosphere (gold accent, deep blue-black void, corner decorations, shimmer effects, element-colored glows).

### Protected Elements (Must NOT Be Altered)
1. **Gold accent** `#edaf18` — primary brand color, used for active states, tab indicator, pity rings, accent glows
2. **Deep navy background** `#080c14` — the foundational surface color
3. **Rajdhani + JetBrains Mono** font pairing — display + data typography
4. **Element color mapping** — Fusion/Electro/Aero/Glacio/Havoc/Spectro color system from WuWa
5. **KuroStyles card system** — glassy cards with corner decorations and shimmer
6. **Pity ring SVG** — circular progress indicator for gacha pity tracking
7. **Tab navigation model** — 8-tab horizontal scroll with gold indicator bar
8. **OLED mode toggle** — pure black alternative for OLED screens

---

## §I.4 — Five-Axis Aesthetic Profile

### AXIS 1 — Commercial Intent
**Classification: Non-revenue (community tool)**

The app is a free, open-source companion tool for Wuthering Waves players. No monetization, no subscriptions, no ads (ad space reserved but currently unused). However, the app has a public presence (PWA, shareable, leaderboard via Firebase) and represents its creator's craft.

**Implications**: Polish signals craft pride and community respect, not conversion optimization. Visual trust is about "this tool is reliable and well-made" rather than "this is worth paying for."

| Item | Status | Finding | Solution |
|------|--------|---------|----------|
| Commercial classification | **PASSED** | Correctly identified as non-revenue community tool | *Optional improvement*: Consider the "portfolio piece" lens — the app IS commercial intent for the developer's reputation. This means screenshot quality and first-impression test (§E7) should be treated with care matching a portfolio showcase. |

---

### AXIS 2 — Use Context
**Classification: Leisure / Enthusiast Tool (with focus-critical data moments)**

Primary use is casual — checking banners, browsing events, managing collection. But Calculator and Stats tabs involve focus-critical moments: users input precise pity counts and read probability outputs that influence real spending decisions ($1-$100+ in gacha currency).

**Implications**: The default emotional register is relaxed and atmospheric (game-world immersion), but data-entry and data-reading moments demand clarity, precision, and zero cognitive tax.

| Item | Status | Finding | Solution |
|------|--------|---------|----------|
| Use context classification | **PASSED** | Correctly hybrid: leisure atmosphere + focus-critical data | *Optional improvement*: Explicitly differentiate "atmospheric" tabs (Tracker, Events, Collection) from "precision" tabs (Calculator, Stats, Planner) in motion/density decisions. Atmospheric tabs can use richer animation (stagger, glow, parallax); precision tabs should lean toward brisk, minimal motion and higher information density. |
| Emotional register match | **PASSED** | Gold accent + dark void = game-world atmosphere for leisure use | *Optional improvement*: For the Calculator tab specifically, consider reducing ambient glow effects and increasing data contrast to signal "precision mode" without breaking the overall aesthetic. A subtle surface-level shift (slightly lighter card backgrounds in Calculator) could subconsciously cue "this is where you focus." |

---

### AXIS 3 — Audience
**Classification: Expert / Enthusiast**

Target users are active Wuthering Waves players who understand gacha mechanics: pity, soft pity, 50/50, guarantee, resonance chains, echo sets, ascension materials. The vocabulary is domain-specific and assumed understood (no glossary or tooltip explanations for terms like "soft pity" or "5★ guarantee").

**Implications**: Information density should respect expertise — don't over-explain or over-space. Domain vocabulary must be precise (wrong term = instant credibility loss with this audience). Power-user features should be accessible, not buried.

| Item | Status | Finding | Solution |
|------|--------|---------|----------|
| Audience classification | **PASSED** | Expert gacha community — correct density and vocabulary approach | *Optional improvement*: Verify every domain term matches the in-game English localization exactly. WuWa uses specific terms ("Convene", "Radiant Star", "Lustrous Tide") — if the app uses any non-canonical term, it's an insider signal failure. Audit all labels against official terminology. |
| Density calibration | **PASSED** | Stats and Calculator tabs show appropriate data density for expert users | *Optional improvement*: Consider adding a "compact mode" toggle for power users who want even higher density (smaller cards, less padding, more data per viewport). This signals "we respect your expertise" without forcing it on everyone. |

---

### AXIS 4 — Subject Visual Identity
**Classification: Strong aesthetic — Wuthering Waves (gacha game IP)**

Wuthering Waves has a distinct visual identity: cyberpunk-fantasy with post-apocalyptic undertones, signature element system (6 elements with established colors), character art style, and UI design language. The app explicitly references this through element colors, character/weapon data, banner artwork, and the "Kuro" naming convention (Kuro Games is the developer).

**Implications**: The app's visual language should feel tonally coherent with WuWa's aesthetic without directly copying the game's UI. It should feel like a tool made by someone who deeply understands and loves the game. Visual choices that contradict WuWa's tonal register (e.g., pastel colors, bubbly rounded shapes, Comic Sans) would be credibility failures.

| Item | Status | Finding | Solution |
|------|--------|---------|----------|
| Subject identity classification | **PASSED** | Strong aesthetic (WuWa game IP) correctly identified | *Optional improvement*: Document the "Minimum Authentic Set" per art-direction-engine §SOURCE — the 3-5 elements from WuWa's visual identity that are non-negotiable for authenticity: (1) element color system, (2) dark atmospheric palette, (3) angular/technical UI shapes, (4) gold/amber accent warmth, (5) character artwork integration. |
| Tonal coherence | **PASSED** | Deep blue-black + gold + angular corners + monospace data = tonally aligned with WuWa's cyberpunk-fantasy register | *Optional improvement*: Research WuWa's actual in-game UI more deeply (§SR0 5-pass) to identify specific palette temperatures, border treatments, and motion patterns from the game UI. The app currently captures the *spirit* but could increase fidelity by matching specific surface temperatures and gradient directions from the game. |
| Insider signals | **PASSED** | "Kuro" naming, element color mapping, game terminology, banner artwork — all signal insider knowledge | *Optional improvement*: The luck rating tiers use WuWa-themed names (Arbiter, Sentinel, Resonator, Drifter, Civilian) — excellent insider signal. Verify these terms resonate with the community. Consider whether the trophy/achievement system names also carry WuWa community flavor or feel generic. |

---

### AXIS 5 — Aesthetic Role
**Classification: Aesthetic amplifies value**

The aesthetic is not invisible (it's atmospheric and immersive) but it's not THE product either (the product is the data/tracking). The design amplifies the core value by making pity tracking feel exciting rather than spreadsheet-like, making event countdowns feel urgent and game-world-connected, and making collection viewing feel rewarding.

**Implications**: The aesthetic should enhance every functional interaction without obstructing it. Motion and atmosphere should make the tool feel alive without adding cognitive load. The design should never compete with the data for attention — it should frame and elevate it.

| Item | Status | Finding | Solution |
|------|--------|---------|----------|
| Aesthetic role classification | **PASSED** | "Amplifies value" — correct. The atmospheric design makes gacha tracking emotionally engaging rather than clinical | *Optional improvement*: Audit whether any atmospheric element (background glow, shimmer, corner decorations) actively competes with data readability in any tab. If the shimmer animation on cards draws the eye more than the pity counter value, the aesthetic has crossed from "amplifies" to "competes." Particularly check the Calculator results area and Stats tab metrics. |
| Chrome vs content balance | **PASSED** | Card decorations (corner borders, shimmer) are subtle enough not to compete with content | *Optional improvement*: Measure the visual weight ratio: how much screen area is decorative vs informational? In the Stats tab, if decorative elements (glow, gradients, corner marks) occupy >15% of visual attention on a primary metric card, consider reducing their intensity or removing them from data-heavy cards while keeping them on atmospheric cards (Tracker, Events). |

---

## Five-Axis Quick Profile Summary

```yaml
Design Identity:
  Current style:      Dark cyberpunk-luxe with glassy frosted card system
  Intended style:     Premium WuWa companion tool — precision instrument in game atmosphere
  Personality:        Focused precision with atmospheric depth
  Protected elements: Gold accent, navy background, Rajdhani+JetBrains Mono, element colors,
                      KuroStyles cards, pity rings, tab navigation, OLED mode

Five-Axis Quick Profile:
  A1 Commercial intent:  Non-revenue (community/portfolio tool)
  A2 Use context:        Leisure + focus-critical data moments (hybrid)
  A3 Audience:           Expert / Enthusiast (gacha community)
  A4 Subject identity:   Strong aesthetic (Wuthering Waves game IP)
  A5 Aesthetic role:     Aesthetic amplifies value (frames and elevates data)
```

---

## Step 1 Findings Summary

| # | Aspect | Status | Severity | Finding Summary |
|---|--------|--------|----------|----------------|
| 1.1 | Commercial classification | PASSED | — | Correctly non-revenue; portfolio lens recommended |
| 1.2 | Use context classification | PASSED | — | Hybrid leisure+focus correctly identified |
| 1.3 | Emotional register match | PASSED | — | Atmospheric tabs vs precision tabs differentiation opportunity |
| 1.4 | Audience classification | PASSED | — | Expert gacha community; verify canonical terminology |
| 1.5 | Density calibration | PASSED | — | Appropriate for expert users; compact mode opportunity |
| 1.6 | Subject identity | PASSED | — | WuWa aesthetic correctly referenced; deeper fidelity possible |
| 1.7 | Tonal coherence | PASSED | — | Dark+gold+angular = correct register; game UI research opportunity |
| 1.8 | Insider signals | PASSED | — | Kuro naming, element colors, WuWa terms — strong |
| 1.9 | Aesthetic role | PASSED | — | "Amplifies value" correct; verify no competition with data |
| 1.10 | Chrome vs content | PASSED | — | Decorations subtle; visual weight ratio check recommended |

**Step 1 Score: 9.5/10** — The aesthetic context and axis profile are well-defined and internally consistent. All axes correctly identified. The app demonstrates strong intentionality in its design identity. Optional improvements focus on deepening fidelity and edge-case refinement rather than correcting errors.

---

*End of Step 1. Steps 2-20 pending.*
