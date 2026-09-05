# Wuthering Waves — Damage Calculation & Tune Mechanic Reference

Status: **partially sourced, partially open**. This file documents the real damage-calculation
pipeline and Tune Break/Tune Strain/Tune Rupture mechanic as far as it's been independently
verified against this project's own code and dump files. Sections marked `NEEDS SOURCE` are
open — do not treat anything in them as confirmed, and do not let a character's own block file
cite this doc for a number that lives in a `NEEDS SOURCE` section.

## 1. Core damage formula

### 1a. The real game formula, per a wiki-style mechanics reference (user-provided, 2026-09-05)

```
DMG = Base DMG × Resistances × Bonuses

Base DMG = Base Ability DMG + Flat DMG + %Flat Bonus
Base Ability DMG = Ability Attribute × %MV        (Ability Attribute = ATK unless the skill
                                                     itself specifies HP/DEF scaling)

Resistances = RES Multiplier × DEF Multiplier × DMG Reduction_Total × Elem Reduction_Total

  RES_Total = Base RES_Enemy + Res PEN_Attacker    (most enemies: base RES 10%; bosses with
                                                     element-specific RES: +30% more, 40% total)
  RES Multiplier =
    1 - RES_Total/2                  if RES_Total < 0
    1 - RES_Total                    if 0 <= RES_Total < 0.8
    1 / (1 + 5*RES_Total)            if RES_Total >= 0.8

  Enemy DEF = 8 × LVL_Enemy + 792
  %DEF = (800 + 8×LVL_Attacker) / (800 + 8×LVL_Attacker + DEF_Target×(1-DEF_Ignore_Target))
    (DEF Reduction/Shred is a stat change applied to DEF_Target BEFORE this formula, not a
    separate term inside it. %DEF capped at 200%.)

  DMG Reduction_Total  = 1 - (DMG Reduction_Base + DMG Reduction_Additional)
  Elem Reduction_Total = 1 - (Elem Reduction_Base + Elem Reduction_Additional)

Bonuses = %DMG Bonus × DMG Amplify × %Special DMG × Crit DMG

  %DMG Bonus = 1 + All DMG Bonus
  DMG Amplify_Total = 1 + (DMG Amplify_Target + DMG Amplify_Attacker)   (can be negative — a
                                                                          reduction, not just a gain)
  %Special DMG = 1 + Special_Base + Special_Bonus   (confirmed by this same source: unused
                                                       anywhere in the current game — no known
                                                       source of Special DMG exists, so this
                                                       term is always 1)
```

Also documented by this source, outside the DMG formula itself — **Hardness/stagger**, not
currently modeled anywhere in this engine (a pure DPS calculator has no reason to simulate
enemy stagger unless some character's real kit conditions a DPS bonus on it):
```
Hardness DMG = (DMG_dealt × Hardness_Skill + Tough) × Modifiers + Parry
```
Parrying depletes a flat 12.5% of an enemy's Hardness bar regardless of the formula above; most
bosses break in 8 parries.

### 1b. Cross-check against this engine's actual implementation

Independently verified 2026-09-05 — the following are **exact, byte-for-byte matches** between
1a's real formula and this engine's existing code (`engine/math/damageFormula.js`), found before
ever seeing 1a's source, which is strong corroborating evidence both are the real formula:

- **Enemy DEF = 8×LVL+792** — identical to the `792 + 8 * 90` constant used in every damage
  call across this engine (`resolveHitComposedDps.js` and siblings).
- **RES Multiplier** piecewise formula — `calcResMult()` is the exact same 3-branch piecewise
  function, term for term.
- **DEF Multiplier** — `calcDefMult()`'s `ATTACKER_FACTOR / (ATTACKER_FACTOR + effectiveDef)`
  shape (`ATTACKER_FACTOR = 800 + 8*90 = 1520`) matches 1a's `%DEF` formula exactly, including
  DEF Shred being applied to `DEF_Target` BEFORE DEF Ignore, not as a separate formula term.
- **%Special DMG** — 1a confirms it's unused game-wide, matching this engine correctly having
  no stat or formula term for it at all.

**One real, unresolved discrepancy — flagged, not silently fixed:** 1a's `Bonuses` treats DMG
Amplify as ONE additive term: `1 + (Amplify_Target + Amplify_Attacker)`. This engine's
`calcDmgBonus()` instead applies `amplify` and `deepen` as TWO SEPARATE MULTIPLICATIVE layers:
`(1 + amplify/100) × (1 + deepen/100)`. These are not mathematically equivalent whenever both
are nonzero on the same hit (multiplicative compounding vs. one additive sum). Unresolved
whether this engine's `deepen` corresponds to 1a's `Amplify_Attacker` (in which case the current
multiplicative treatment may be overcrediting any hit with both amplify AND deepen active) or
represents a distinct real mechanic 1a's source doesn't cover at all. `NEEDS SOURCE` before
changing `calcDmgBonus()` — this touches every converted character's golden fixture, so it is
NOT a small change and should not be made on inference alone.

### 1c. This engine's actual resolved chain

Every hit resolves through (see `engine/resolver/dps/resolveHitComposedDps.js`):

```
damage = (effBase * (hit.atkPct / 100) + hit.flat)
        * avgCrit
        * dmgBonus
        * defMult
        * resMult
        * libGate
        * cooldownGate
        * (1 + totalMult / 100)
```

- `effBase` — the scaling base stat (ATK, HP, or DEF depending on `damage.basis`), inflated by
  the matching `%` stat (`atkPct`/`hpPct`/`defPct`). Maps to 1a's `Base Ability DMG`.
- `avgCrit` — `1 + cr/100 * (cd/100 - 1)`, an expected-value blend across many hits (a
  calculator-specific choice — 1a's `Crit DMG` term describes one deterministic roll, not an
  average; this engine intentionally averages instead of simulating RNG).
- `dmgBonus` — see 1b's flagged discrepancy above.
- `defMult`/`resMult` — see 1b, confirmed exact matches.
- `totalMult` — a flat fallback multiplier for kit bonuses that don't map to a dedicated
  category stat; not present in 1a's formula as its own term (folds into `%DMG Bonus` in the
  real game, most likely).

## 2. Tune Break / Tune Strain / Tune Rupture — what's confirmed vs. open

### 2a. Off-Tune Level gauge fill — formula known, one real number still missing

The formula itself IS sourced (user-provided, 2026-09-05, citing r/WutheringWaves "Tune Break
mode explanations"):

```
Off-Tune Accumulation = Base Value of the action × (1 + Off-Tune Accumulation Rate)
```

- `Base Value` depends only on WHICH ACTION was used, not on numeric damage dealt. Relative
  tier, confirmed: Liberations (highest, to force a break fast) > Forte Circuit attacks (their
  own specific gauge) > Resonance Skills (moderate) > Basic Attacks/perfect Dodges (low but
  constant). Echo Skills, DOT, and most Coordinated Attacks: 0 (strict exclusions, no fill at
  all — pre-v3.0-kit-specific exceptions aside).
- `Off-Tune Accumulation Rate` is a real character stat, shown in-game since v3.0. Two sources:
  (1) direct team-wide grants from specific Resonators (Mornye's Syntony/High Syntony Field:
  +50%/+20% more, confirmed in her own dump); (2) synergy-tier thresholds — reaching 140%
  accumulation rate activates passives (e.g. Denia's) granting an instant +40 to +50 Tune Break
  Boost, per this same source.

**Indicative Base Value ranges, per action TYPE (user-provided, 2026-09-05, same source) —
gauge total 100 points:**

| Action type | Base Value (points) | Gauge efficiency |
|---|---|---|
| Resonance Liberation (Ultimate) | 40–50 | Very high (~half the gauge in one hit) |
| Intro Skill (entry QTE) | 15–20 | Moderate–high |
| Forte Circuit attack (nuke / full-gauge move) | 15–25 | High |
| Resonance Skill | 8–12 | Moderate |
| Heavy Attack / Perfect Dodge | 4–6 | Low |
| Basic Attack | 1–3 | Very low |
| Echo Skill, DOT, most Coordinated Attacks | 0 | None |

**What's still missing, precisely:** these are GENERIC, per-action-TYPE ranges (explicitly
"indicative" per the source), not exact per-character-per-move values — e.g. this table can say
a Liberation is "40–50," but not "Aemeath's Heavenfall Edict: Overdrive is exactly 47." Using a
range to simulate a specific move means picking one value inside it (this engine picks the
midpoint), which is a modeling approximation, not a sourced exact number — documented explicitly
as "approximated within the sourced range," never presented as if it were an exact Lv.10 value
the way `damage.hits` numbers are.

**Applied PER REAL HIT, for every action type (fixed 2026-09-06, direct user correction)**: "there
is literally a per hit value for each skill, attack, intro/outro or whatever in every character's
kit" — "action does X, fills gauge, gauge full, break" is universal and per-hit, the same way real
damage is already tracked per real hit (`damage.hits`), not per cast. The engine previously only
applied this per real hit for Basic Attacks and treated every other action type as "once per cast
regardless of real hit count" — an inconsistency, now fixed (`engine/math/offTuneFormula.js`'s
`offTuneValueForBlock()`): a real hit count is already a sourced kit fact for every move (same
data `damage.hits.length` already provides for damage), so this isn't a new sourcing burden, just
consistent application of what was already on file. No risk of an unbalanced "spam a high-hit-
count move to dominate Off-Tune" exploit — a rotation's real hit counts are fixed, sourced kit
facts, not a free variable a caller can inflate.

**Worked example of the formula (user-provided, 2026-09-05, same source), confirms the
Accumulation Rate term is the same real stat as "Tune Break Boost":** a Liberation with Base
Value 40, cast by a character with +50% accumulation bonus (from stats or a weapon passive),
generates `40 × (1 + 0.50) = 60` real points — meaning two well-placed Liberations alone can
fully saturate a boss-tier (200pt) gauge for a heavily-invested Tune Break Boost build.

**Character-side multiplier overrides — qualitative only, `NEEDS SOURCE` for exact values:**
"3.x" Resonators (Lynae, Mornye named specifically) have Forte Circuit attacks or dedicated
skills with native multipliers "almost doubling" these generic base values. Real, but no
concrete number given — do not assume exactly 2x without a per-character source.

**Enemy-side gauge TOTALS — real, sourced, and this is new: previously this project had ZERO
enemy-side Tune data anywhere.** Gauge total scales by enemy tier:

| Enemy category | Total gauge | Fill difficulty | Tune Break trigger |
|---|---|---|---|
| Common mobs | 30–50 pts | Very fast (1–2 skills) | Automatic — triggers on the hit that fills it |
| Elite (medium) | 100 pts | Moderate (one standard rotation) | Manual or automatic, varies by elite |
| Boss / Overlord | 200 pts | Slow (needs Ultimates or real Tune Break Boost investment) | Manual QTE — freezes time, unique Finisher animation |

**Post-break cooldown/immunity (real, sourced):** once the gauge fills and Tune Break
consumes it, the enemy's gauge resets to 0 and enters a 10–15s immunity window — greyed out,
no accumulation possible from any attack during that window.

**Special case — mechanic-driven accumulation blocks (real, sourced, boss-specific):** certain
boss animations/stances block gauge accumulation entirely (e.g. during their own ultimate
wind-up) until a Perfect Dodge or Parry lands, which then grants a large lump-sum of points
instantly. Not currently representable in this engine (no boss-animation-state tracking exists
anywhere), and not needed unless a specific boss fight is being modeled rather than a
generic enemyDef/enemyRes target the way this engine currently treats every enemy.

### 2b. Tune Break damage — CONFIRMED, universal-gate bug fixed (2026-09-06)

`engine/resolver/dot/dotFormulas.js`'s `calcTuneBreakDmg()`:

```
dmg = TUNE_BREAK_BASE_DMG * (1 + totalBoost * 0.01) * breaksPerRot * defMult
```

where `totalBoost` sums each contributing character's own sourced `baseTuneBreakBoost` +
`boostToTeam` (from `CHAR_BUFF_TABLE[name].tuneBreak`). `TUNE_BREAK_BASE_DMG` is itself a sourced
constant, not derived here.

**Real bug, direct user correction (2026-09-06)**: "tune break is universal (when off tune gauge is
full and you break it). what is not universal is Tune Rupture and Tune Strain." Confirmed via a
real AI-chat summary the user provided, itself corroborated by primary sources already on file in
this doc (§2a's own Off-Tune fill mechanic, generic and universal by design) — the BASE Tune Break
burst (gauge fills → Mistune → press the prompt → heavy AoE damage) is a universal mechanic every
team gets, structurally identical to Frazzle/Erosion (any real hit contributes, no character-
specific gate). Only the FLAVOR (Rupture vs Strain — mutually exclusive, overwrite each other) and
the bonus Response damage on top require a specific character's own kit.

The code previously got this backwards:
```js
const tbMembers = members.filter(m => CHAR_BUFF_TABLE[m.name]?.tuneBreak);
if (!tbMembers.length) return { dmg: 0, deepenMult: 1, exclusiveCandidates: [] };
```
Any team with ZERO `tuneBreak`-flagged characters (the ~9 Rupture/Strain specialists — Lynae,
Aemeath, Denia, Rebecca, Lucy, Mornye, Luuk Herssen, +2 more) got **zero** Tune Break damage — a
real, roster-wide gap affecting the large majority of possible team compositions, not specific to
any one character.

**Fixed same day**: `breaksPerRot` now sums EVERY team member's own `resolveOffTuneGenerated()`
total (§2a), not just `tbMembers`, crossing the real enemy gauge (`ENEMY_OFF_TUNE_GAUGE`) — the
same real machinery already built for the timed-event infrastructure. The early `{dmg:0}` return
only fires when there's genuinely nothing to compute from (no real blocks AND no specialist to fall
back to the old flat heuristic for). The Rupture/Strain BONUS layer
(`ruptureDmgMult`/`strainDmgPerStack`, Mornye's `interferedDmgAmp`, `exclusiveCandidates`) stays
correctly gated on `tbMembers` — that part genuinely is character-specific, unchanged. Verified
sane: a non-specialist team gets a real but modest universal burst (~2% of team DPS); a specialist
still gets a much larger contribution (base + their own bonus stacked on top). Test coverage:
`tuneBreakUniversalGate.test.js`.

### 2c. Tune Strain bonus DMG — confirmed, cross-checked

```
strainPct = maxStrainStacks * totalBoost * strainDmgPerStack   // strainDmgPerStack default 0.12
```

Independently cross-checked 2026-09-05 against an external (unsourced, but internally
consistent) description: *"Augmentation Totale DMG% = Stacks × (Tune Break Boost × 0.0012)"* —
identical formula, expressed as a fraction (0.0012) instead of this codebase's
percent-per-point constant (0.12). Same numeric result. Treated as corroborating evidence, not
as a new source on its own — `strainDmgPerStack` is still read per-character from
`CHAR_BUFF_TABLE`, never hardcoded to 0.12 blindly.

### 2d. Tune Rupture bonus DMG — CONFIRMED, boost-scaling gap closed (2026-09-06)

Resolved 2026-09-06 via user-provided French text citing r/WutheringWaves, the Fandom Tune
Rupture/Tune Rupture-Shifting/Tune Rupture-Interfered pages, and two YouTube sources. Real
mechanic, full state machine:

1. **Tune Rupture - Shifting**: a mark, not damage on its own. Certain resonators (Lynae,
   Aemeath, ...) apply it via their own attacks (see §2e). Lasts 25s. An enemy cannot carry both
   Rupture-Shifting and Strain-Shifting at once (mutually exclusive per-enemy state).
2. **Tune Break** (the detonation): once the enemy's Off-Tune gauge is full, ANY character can
   trigger it.
3. **Tune Rupture - Interfered**: the instant a Tune Break lands on a Shifting-marked enemy, the
   mark is consumed and becomes Interfered for 8s — this transition is what fires the Tune
   Rupture Response (the burst/nuke).
4. **Damage attribution**: credited to whichever character's own kit provided the Shifting
   debuff, NOT whoever pressed the Tune Break button.
5. **Formula** (real, confirmed):
   ```
   Tune Rupture Response DMG = resonator's own Tune AMP % (their kit's own fixed Forte Circuit
                                value) × (1 + Tune Break Boost)
   ```
   - Tune AMP is the SAME value already implemented as `ruptureDmgMult` (per-character, read from
     `CHAR_BUFF_TABLE[name].tuneBreak`) — e.g. Lynae 1880.75%, Aemeath 596.43% (both already
     correctly on file, independently confirmed by the user's own citation matching Aemeath's
     dump value exactly).
   - Tune Break Boost is the SAME value already tracked as `totalBoost` in `calcTuneBreakDmg`
     (`baseTuneBreakBoost` + `boostToTeam`, summed across every Tune-Break-flagged team member) —
     previously only applied to the BASE Tune Break DMG term and to Tune Strain's own term, never
     to Rupture's. **This was the exact gap this section previously flagged as `NEEDS SOURCE`.**
   - No in-combat accumulation: the burst is identical every Tune Break as long as the
     resonator's own stats and the team's total Boost don't change (unlike Strain, which stacks
     over the fight).

Fixed in `engine/resolver/dot/dotFormulas.js`'s `calcTuneBreakDmg()`: both the shared-members
Rupture term and each mode-exclusive candidate's own `ruptureDmgDelta` now multiply by
`(1 + totalBoost * 0.01)`, matching the base-DMG term's existing `* 0.01` convention (totalBoost
stored as whole points, e.g. `40` for "+40 Tune Break Boost", not a pre-divided fraction).

### 2e. Tune Rupture-Shifting application — not modeled at all, engine-wide

No `dotApplier` mechanic exists in `DOT_MECHANICS` (`schema/block.schema.js`) for Tune
Rupture-Shifting — only `frazzle`/`erosion`/`fusionBurst`/`electroFlare`/`tuneBreak` exist.
Checked 2026-09-05: neither Lynae's nor Mornye's block files (the two named Tune Rupture
specialists) have a single `dotApplier` entry. This is a real, cross-character engine gap, not
specific to any one character — building it means adding a new `DOT_MECHANICS` entry and
wiring the shared reaction system (`dotReactions.js`) to consume it, which touches every
Tune-affiliated character, not one.

## 3. Vibration Strength (Poise/Stagger) — a DISTINCT gauge from Off-Tune, source confidence LOWER

Logged 2026-09-05 from user-provided French text citing wutheringwaves.gg's starter guide, a
Reddit thread, and the Fandom wiki's own "Vibration Strength" page — **not** the character dump's
own primary text, and not cross-checked against any in-game screenshot the way the general damage
formula and the Off-Tune ranges were. Treat everything below as a real, plausible mechanic worth
having on file, but LOWER confidence than this doc's other sections — the user's own words:
"not sure about it but might be good." Do not build an engine resolver from this section without
either a stronger primary source or explicit go-ahead, given the ranges below are guide-site
approximations, not exact kit-text numbers.

**What it is, and how it differs from Off-Tune**: the white poise/stagger bar under an enemy's HP
bar — a real, separate, long-standing mechanic (present since launch), NOT the same system as
Off-Tune Level (introduced later, element-based). The two now interact (see the Tune Break
transfer note below) but are two distinct gauges with two distinct fill mechanisms.

**Accumulation formula** (structurally identical shape to Off-Tune's, different inputs):
```
Vibration reduction = attack's own base Vibration value × (1 + character's own Vibration
                       Breakdown Amplification stat) × combat modifiers
```
- Base value differs by ACTION TYPE, same `section`-keyed shape Off-Tune uses, but the ranking is
  inverted from Off-Tune's: Heavy Attacks carry the single highest base value (not Liberation);
  plain Basic Attacks are the lowest; Skill/Liberation are moderate-to-high and scale per
  character (a "Breaker"-archetype character like Yuanwu has an unusually large multiplier here).
- Vibration Breakdown Amplification: a character-level stat (passives/weapons/echoes), a direct
  multiplier on the attacker's own stagger output — structurally like Off-Tune's per-character
  multiplier overrides (§2a), not yet given as a concrete number for any specific character here.
- Combat modifiers, the two named ones:
  - **Parry**: the single strongest modifier — parrying a boss's gold-circle-telegraphed attack
    removes roughly 15–30% of its CURRENT Vibration bar in one hit (proportional to the bar, not a
    flat point value).
  - **Perfect Dodge Counter**: a flat bonus on top of a normal hit's own value (~20 points cited;
    "-15% Vibration" cited for "certain bosses" specifically, an inconsistent unit — flat points vs
    %, not reconciled here).

**Enemy-side gauge totals** (mirrors Off-Tune's own §2a table shape):
| Enemy type | Total Vibration gauge | Resistance to plain hits | Parry impact |
|---|---|---|---|
| Common mob | 0 (no gauge) | none — staggers on any hit | n/a |
| Elite (Mech, Guardian, etc.) | 100–150 | medium (empties in 1-2 heavy combos) | instantly removes ~30–50% |
| Standard/Overlord boss | 300–400 | high (needs a full rotation) | removes a flat ~60–80 pts |
| Tactical Hologram (max difficulty) | 500–600 | extreme, very rigid bar | breaking it is the whole fight |

**Base point values per action** (guide-site approximation, NOT per-character exact numbers):
- Basic ATK (full combo): ~5–10 pts total
- Heavy Attack: ~15–25 pts (the single most efficient basic-move stagger tool)
- Perfect Dodge Counter: ~20 pts
- A "Breaker"-archetype character's Skill/Liberation (Yuanwu, Jiyan cited): ~30–50 pts
- Tune Break's own QTE (the v3.0+ crossover, see below): ~100–150 pts flat, once

**Tune Break crossover** (the mechanical link between the two systems, v3.0+): while an enemy is
in Mistune and the player triggers the Tune Break skill, the game applies an instant, large flat
reduction to the enemy's CLASSIC Vibration gauge on top of Tune Break's own separate damage:
```
Tune Break's own Vibration damage = large fixed Rupture value × (1 + Tune Break Boost multiplier)
```
This is a genuinely different mechanism from a normal hit's own Vibration contribution (a flat
finisher-style deduction, not a per-hit accumulation) — matches this doc's own §2b/§2c Tune
Break/Strain formulas in shape (fixed value × boost multiplier) but is NOT the same reaction; it
reduces a DIFFERENT gauge (Vibration, not Off-Tune Level).

**On break**: gauge hits 0 → enemy enters Stagger/Immobilized for a fixed window (5–8s cited),
taking increased damage before the gauge fully refills.

**Engine status**: not modeled anywhere — no schema field, no math file, no resolver. Building it
would mean a new base-value table (mirroring `offTuneFormula.js`'s shape but inverted-priority and
keyed to different action types), a new character-level "Vibration Breakdown Amplification" stat
(not yet known for any character), and separate Parry/Dodge-Counter combat-modifier handling this
schema has no trigger shape for yet (no character block anywhere models a Parry action). A real,
buildable-in-principle single-character "how much Vibration does THIS character's own rotation
generate" resolver (same scope discipline as `resolveOffTune.js`) is possible once/if the source
confidence here is raised — not done as part of logging this reference.

## 4. Session log — 2026-09-06 punch list (what got fixed, what's still open)

A single long session touching Aemeath's Resonance Mode, Between the Stars, Tune Break/Fusion
Burst timing, and a real per-event timeline. Logged here as one place to resume from, rather than
scattered across commit messages.

### Fixed and shipped this session (real, tested, committed)
- Resonance Mode: real manual per-character toggle (build panel + auto-build/auto-team search),
  replacing the old "guess from magnitude" heuristic.
- Between the Stars: real team-composition-dependent stack count (Aemeath counts as her own
  resonator too — a real correction after an initial wrong exclusion).
- Tune Rupture Response DMG: closed the `NEEDS SOURCE` boost-scaling gap in §2d — now genuinely
  `Tune AMP % × (1 + Tune Break Boost)`.
- Tune Break trigger timing: real gauge-crossing rate instead of a flat "~1 per rotation" guess.
- Fusion Burst: real per-hit stack values (Aemeath +1, Denia +1/+2) and real detonation
  count/timing, including Aemeath's own 5-stack early-detonation override and Duet-forced
  detonation.
- Real per-event timeline infrastructure: `RotationSimulator` now tags a real, timestamped
  `fusion-burst-detonation`/`tune-break-detonation` event into the exact step it happens, reusing
  the existing `ally-action`/`actionTags` mechanism — not just a per-rotation rate anymore.
- Two real bugs caught and fixed: (1) `windowed-cast` blocks (Aemeath's Duet casts) were silently
  excluded from Off-Tune/Fusion Burst tracking everywhere (`trigger.on` vs `trigger.attemptOn`) —
  corrected her real Off-Tune total from 204.5 to 224.5 and shifted her real detonation from the
  pre-Outro Form Switch to Finale. (2) Solo-mode's owner-key convention (`''`) vs team-mode's
  (real character name) broke every "is this Aemeath" check that assumed the key was her name.
- Added her real, previously-unmodeled Forte "Unlanded Melody" (fires off the real gauge-crossing
  event, no fabricated damage value).
- **Tune Break's universal gate bug** (§2b above) — the biggest fix this session, roster-wide:
  `calcTuneBreakDmg()` no longer returns zero damage entirely for a team with no Rupture/Strain
  specialist; the base burst now derives from any team's real summed Off-Tune generation.

### Still open, in priority order this session ended on
1. **chain.s2's Tune-Rupture-mode stacking bonus** (the original motivating goal for building the
   real timeline) — infrastructure (`tune-break-detonation` tag) is ready; the block itself isn't
   built. Currently inert even if built: in Aemeath's own modeled Standard Rotation, the real
   detonation lands during Finale, not on a Duet cast, so "Duet-triggered" wouldn't fire. Revisit
   once/if the Advanced (Quickswap) rotation is modeled (item 3) — the timing may line up there.
2. **chain.s2's Fusion Burst-mode extensions** (+400% Duet mult in Stardust Resonance, +15%/stack
   on Fusion Trail removal) — all real numbers are sourced (see §2d/2e-adjacent kit text), just not
   yet wired into a block.
3. **Only Aemeath's Standard Rotation is modeled.** The Advanced (Quickswap) and S1+ Opener
   rotations the user provided (real, sourced, from a guide) aren't in `CHARACTER_ROTATIONS` at
   all — a real gap independent of anything else here.
4. Outro's 10%→20% inflictor-specific scaling — still blocked on a missing per-recipient-action
   gating mechanism, unrelated to anything fixed this session.
5. Vibration Strength (Poise/Stagger, §3) — still gated on stronger sourcing per the user's own
   caution; not touched this session.
6. Tune Rupture-Shifting's own damage-reaction consumer (§2e) — still no live consumer anywhere in
   the engine (the `appliesTags` marker exists on Aemeath's blocks, nothing reacts to it yet).
7. Roster-wide: only Aalto and Aemeath have had a full individual-character verification pass; the
   other 55 released characters haven't been checked the same way (the standing, pre-existing
   directive — not new this session).

## 5. What this file is for

Add a verified formula/number here the moment it's sourced, with the same citation discipline
as a character block file (where it came from, what it changes, what it doesn't). Remove a
`NEEDS SOURCE` marker only when a real source backs the replacement — never on inference alone.
