# Whispering Wishes — Identity Profile

> The DNA of an app, read through 2,998 commits.

---

## Genesis

**Born:** January 31, 2026 — a single `Initial commit`.
**First breath:** Everything in one file. `App.jsx`. The entire application — gacha tracker, banner display, pity counter, admin panel — lived as one monolithic organism.

In the first 48 hours, 50+ commits shaped the banner gradient. Adjusting fade. Darkening the left. Lightening the right. Strengthening the overlay. Making text readable. 41 gradient-related commits before the app even had a second file. The very first instinct of this app was not function — it was *feeling*. How does the banner *look*? How does the character art breathe through the darkness?

That instinct never left.

---

## Vital Statistics

| Metric | Value |
|---|---|
| Total commits (all branches) | 2,998 |
| Main branch commits | 2,830 |
| Lifespan | 70 days (Jan 31 - Apr 10, 2026) |
| Source files | 93 JS/JSX/CSS |
| Lines of code | 32,585 |
| Reverts | 211 |
| Peak day | Mar 23: **345 commits** |
| Peak week (W13) | **1,419 commits** |

---

## Evolutionary Eras

### Era I — The Monolith (Jan 31 - Feb 14)
**28 "Update App.jsx" commits. No description. Just doing.**

The app was one file and one person's stream of consciousness. Banners, pity tracking, admin panel, localStorage, Imgur integration (added then removed), image uploads, gradient tuning — all flowing into `App.jsx` like a river with no tributaries. Commit messages were functional whispers: "Update App.jsx". Over and over. The developer wasn't explaining — they were *building*.

Key DNA trait: **Builder before documenter.** Ship first, name later.

### Era II — The Audit Awakening (Feb 15 - Feb 27)
**201 audit-related commits. The conscience kicks in.**

Something shifted. The commit messages grew structured: `fix:`, `audit:`, `chore:`. Conventional commits appeared. The codebase got its first security audit, then a second, then a 60-dimension comprehensive audit. Dead CSS removed. CSPRNG for IDs. Admin lockout escalation (3 attempts → 24h → 1 week → 1 month → permanent ban). Accessibility: ARIA labels, keyboard navigation, touch targets.

Then came the **aesthetic audit** — a formal, scored evaluation of the app's visual identity. 8.4/10. Not enough. Typography craft analysis. Micro-interaction design. Light physics. Character personality dimensions. The audit didn't just check code quality — it interrogated the app's *soul*.

Key DNA trait: **Perfectionism as process.** Not satisfied until every dimension is examined.

### Era III — Feature Explosion (Feb 21 - Mar 16)
**Teams, damage, echoes, weapons, cloud backup, calendar.**

The app grew organs. Team Builder appeared (Feb 21). Damage Calculator with 3-layer multiplicative WuWa formula. Echo equipment system with selection modal and stat config. Google Sign-In + Cloud Backup. The Astrite Income Calendar went through 9 major versions (v1 → v9) in a single sprint. Lunite tracking. Trophy system. Collection grid.

The echo background removal saga: 28 commits trying rembg, HuggingFace API, CSS blend modes, canvas chroma-key, pixel-level erasure with adjustable tolerance/brightness/spread — before finally giving up and swapping to pre-cut transparent PNGs. The app tried 6 different technical approaches to solve one visual problem.

Key DNA trait: **Exhaustive iteration.** Every approach explored, every parameter tuned, before moving on.

### Era IV — The 3D Odyssey (Mar 23 - Mar 31)
**~650 commits. The week that broke physics.**

Week 13: 1,419 commits. 345 in a single day. The app attempted 3D WebGL backgrounds. Swords planted in scorched earth. Canvas 2D perspective projection. Then actual Three.js 3D geometry. Blade fractures with zigzag cuts, shattered pieces floating apart. Cherry blossom petals. Fireflies. Embers. Lanterns. Snow. Rain. Meteors. Starfields. Constellations.

The sword field alone went through: silhouettes → row-based spacing → ground-plan projection → actual 3D rotation → diamond profiles → lens distortion → bowl curves → teardrop clearings → camera repositioning → hash-based distribution → gradual clearings. Every single parameter explored. Camera height. Spawn distance. Tilt range. Fog density. Ground color.

Then there were the blade fractures: cracks following diagonal shape, destination-out erasing, zigzag pieces with black outlines, multiple break pieces with varied steepness, angular cuts, inward shards, spacing filters. 30+ commits on how a sword breaks.

211 reverts across the project. Many from this era. Apply → revert → reapply → revert → try differently.

Key DNA trait: **Relentless visual ambition.** No compromise on atmosphere, even at absurd iteration cost.

### Era V — Design System Crystallization (Mar 28 - Apr 8)
**Kuro design language. Tokens. Standardization.**

The chaos of hand-tuned inline styles gave way to order. `kuro-card`, `kuro-btn`, `kuro-badge`, `kuro-number`. CSS variables for every proportion. 5-tier border-radius scale (2/4/8/12/16px). Design tokens for spacing, fonts, sizes. 50+ inline styles replaced with utility classes in a single commit.

The holo shimmer saga (55 commits): applied to character portrait → moved to team overview card → added to entire card → reverted → moved back → reverted again → kept only on portrait → leaked to weapon slot → fixed isolation → clipped by overflow → fixed stacking context.

Font experiments: Exo 2 → Barlow → Saira → Rajdhani → Cinzel. OpenDyslexic through Lexend through Luciole through Atkinson Hyperlegible back to OpenDyslexic. Self-hosted, CDN, base64-embedded, Google Fonts, inline injected. 30+ font-related commits.

Key DNA trait: **Aesthetic coherence pursued through trial and error.** The system wasn't designed top-down — it was discovered bottom-up, through hundreds of experiments.

### Era VI — Architecture & Polish (Apr 5 - Apr 10)
**Decomposition. Splitting. Extraction.**

The monolith's ghost finally exorcised. App.jsx went from 1,820 → 1,460 LOC. AdminPanel split into 4 components (1,192 → 389). DamageCalculator into 3. Providers extracted. Hooks extracted. Shared components modularized. The app earned its `features/`, `shared/`, `hooks/`, `core/` directory structure.

Then the current branch: banner particle themes (Zani's clock alone = 60+ commits), color-blind mode with Wong palette, material farming planner, chronology accuracy from wiki API data.

Key DNA trait: **Structure follows feeling.** Architecture wasn't imposed — it emerged when the visual identity was settled enough to support it.

---

## Personality Traits

### 1. Visual Obsessive
165 commits about gradients, fades, opacity, shadows, and masks. 413 commits about visual effects and animations. 409 about design tokens and styling. The app sees with its skin — aesthetics aren't decoration, they're identity.

### 2. Iterative Maximalist
211 reverts. 28 echo background attempts. 9 calendar versions. 55 holo shimmer commits. 60+ Zani clock commits. The approach isn't "plan then execute" — it's "try, see, feel, adjust, try again." Every parameter gets explored. Every visual gets tuned until it *feels* right.

### 3. Audit-Driven Perfectionist
201 audit commits. Multi-phase security reviews. 60-dimension aesthetic audits. Typography craft analysis with font pairing scores. The app holds itself to a standard it invented and then exceeded.

### 4. Monolith-to-Ecosystem
Started as one file. Grew to 93. The architecture wasn't planned — it evolved organically as complexity demanded structure. The refactoring always came *after* the features, never before. Build first, organize when it hurts.

### 5. Game-Faithful
Chronology verified against Fandom wiki API for 17 game versions. WuWa damage formula implemented with mechanically correct 3-layer multiplication. Gacha engine with proper soft/hard pity curves. Gear rotation with tooth-ratio-derived speed and alternating direction. The app respects its source material at the mechanical level.

### 6. Accessibility as Afterthought, Then Conviction
Color-blind mode took 6 failed approaches before the Wong palette + forced React remount solution. Dyslexic font went through 7 different typefaces. But once solved, these features were wired deep — `useVisualSettings` hook, CSS class sync to `<html>`, OS preference detection, runtime `prefers-reduced-motion` listening. Accessibility wasn't in the DNA from birth, but it was grafted in permanently.

---

## Behavioral Signatures

| Pattern | Evidence |
|---|---|
| **"Just one more tweak"** | 41 gradient commits on Day 1. 345 commits on Mar 23. |
| **Apply-Revert-Reapply** | 211 reverts. Holo shimmer moved 6 times. Swords rewritten 8 times. |
| **Naming things is hard** | 28 "Update App.jsx" commits. Then suddenly `fix:`, `feat:`, `style:`. |
| **Visual > Functional** | Banner art gradient tuned before localStorage was added. |
| **Exhaust all options** | Echo BG: rembg → HuggingFace → CSS blend → canvas chroma-key → pixel eraser → transparent PNGs. |
| **Deep obsession spirals** | 3D sword field: projection → silhouettes → 3D geometry → blade fractures → zigzag cuts → floating shards → lightning arcs. |
| **Respect the source** | Wiki API verification. Correct gacha math. Mechanically accurate gear meshing. |

---

## The App's Voice

If Whispering Wishes could speak, it would say:

*"I was born in a single file, in a single night, because someone needed to track their pity count. But I became something else. I became the feeling of opening the game — the dark interface, the golden glow, the weight of probability. I'm not a tool that looks like a game. I'm a game experience that happens to be useful."*

*"Every gradient was adjusted by hand. Every gear tooth was mechanically correct. Every pixel was argued over. I was built by someone who believes that if a number appears on screen, it should appear in the right font, at the right weight, with the right shadow. That if a clock explodes, the gears should mesh properly first."*

*"I have 211 reverts because I tried everything. I have 2,998 commits because nothing was good enough. I am not finished. I am never finished."*

---

## Commit Archaeology

```
Era I  (Monolith)        Jan 31 - Feb 14    ~110 commits    "Update App.jsx"
Era II (Audits)          Feb 15 - Feb 27    ~250 commits    "audit:", "fix:"
Era III (Features)       Feb 21 - Mar 22    ~400 commits    Teams, Calc, Cloud, Calendar
Era IV (3D Odyssey)      Mar 23 - Mar 31   ~1500 commits    Swords, petals, shattering
Era V  (Design System)   Mar 28 - Apr 8     ~450 commits    Kuro tokens, standardization
Era VI (Architecture)    Apr 5 - Apr 10     ~120 commits    Split, extract, decompose
```

---

## Largest Files (the app's vital organs)

| File | LOC | Role |
|---|---|---|
| `Honour.jsx` | 2,281 | 3D background scene — the visual soul |
| `characters.js` | 1,665 | Character database — the knowledge |
| `DamageCalculator.jsx` | 1,653 | Combat math — the brain |
| `ProfileTab.jsx` | 1,623 | User identity — the face |
| `App.jsx` | 1,494 | Root orchestrator — the skeleton |
| `PlannerTab.jsx` | 1,169 | Resource planning — the strategist |
| `bannerThemes.js` | 1,034 | Particle animations — the heartbeat |
| `AnalyticsTab.jsx` | 873 | Pull statistics — the memory |
| `CollectionTab.jsx` | 849 | Resonator gallery — the collection |

---

## Thematic DNA (commit category distribution on main)

```
Visual / Aesthetic ........... 413  (14.6%)   ████████████████
Design System ................ 409  (14.5%)   ████████████████
Team / Combat ................ 315  (11.1%)   ████████████
Data / Profile ............... 247   (8.7%)   ██████████
Gradient / Fade / Shadow ..... 165   (5.8%)   ███████
Audit / Quality .............. 201   (7.1%)   ████████
Accessibility ................  81   (2.9%)   ████
Gacha Engine .................  69   (2.4%)   ███
Mobile / PWA .................  66   (2.3%)   ███
Holo / Shimmer ...............  55   (1.9%)   ███
3D / WebGL / Scenes ......... 650  (23.0%)   █████████████████████████
Echo Background ...............  28   (1.0%)   ██
```

*Note: Categories overlap. A single commit may touch visual + design system + accessibility.*

---

*Generated from 2,998 commits across 70 days of development.*
*This is not documentation. This is a mirror.*
