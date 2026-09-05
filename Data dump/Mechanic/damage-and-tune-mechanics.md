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

## 2. Session log — 2026-09-06 punch list (what got fixed, what's still open)

A single long session touching Aemeath's Resonance Mode, Between the Stars, Tune Break/Fusion
Burst timing, and a real per-event timeline. Logged here as one place to resume from, rather than
scattered across commit messages.

### Fixed and shipped this session (real, tested, committed)
- Resonance Mode: real manual per-character toggle (build panel + auto-build/auto-team search),
  replacing the old "guess from magnitude" heuristic.
- Between the Stars: real team-composition-dependent stack count (Aemeath counts as her own
  resonator too — a real correction after an initial wrong exclusion).
- Tune Rupture Response DMG: closed a `NEEDS SOURCE` boost-scaling gap — now genuinely
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
- **Tune Break's universal gate bug** — the biggest fix this session, roster-wide:
  `calcTuneBreakDmg()` no longer returns zero damage entirely for a team with no Rupture/Strain
  specialist; the base burst now derives from any team's real summed Off-Tune generation.

### Still open, in priority order this session ended on
1. **chain.s2's Fusion Burst-mode extensions** (+400% Duet mult in Stardust Resonance, +15%/stack
   on Fusion Trail removal) — all real numbers are sourced, just not yet wired into a block.
2. **Only Aemeath's Standard Rotation is modeled.** The Advanced (Quickswap) and S1+ Opener
   rotations the user provided (real, sourced, from a guide) aren't in `CHARACTER_ROTATIONS` at
   all — a real gap independent of anything else here.
3. Outro's 10%→20% inflictor-specific scaling — still blocked on a missing per-recipient-action
   gating mechanism, unrelated to anything fixed this session.
4. Roster-wide: only Aalto and Aemeath have had a full individual-character verification pass; the
   other 55 released characters haven't been checked the same way (the standing, pre-existing
   directive — not new this session).

## 3. What this file is for

Add a verified formula/number here the moment it's sourced, with the same citation discipline
as a character block file (where it came from, what it changes, what it doesn't). Remove a
`NEEDS SOURCE` marker only when a real source backs the replacement — never on inference alone.
