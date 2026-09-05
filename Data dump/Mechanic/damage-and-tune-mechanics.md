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

**What's still missing, precisely:** the real numeric `Base Value` for any SPECIFIC move of any
SPECIFIC character (e.g. "Aemeath's Heavenfall Edict: Overdrive has Base Value X"). Only the
relative ranking is sourced, not one concrete number for one move anywhere in this project's
dump files. Until a real base value is sourced, the formula above can't be run per-hit for any
character — only the end-of-gauge event (Tune Break itself, see 2b) is modeled, and only as a
team-level aggregate, not derived from real per-action gauge accumulation.

### 2b. Tune Break damage — confirmed, already implemented

`engine/resolver/dot/dotFormulas.js`'s `calcTuneBreakDmg()`:

```
dmg = TUNE_BREAK_BASE_DMG * (1 + totalBoost * 0.01) * breaksPerRot * defMult
```

where `totalBoost` sums each contributing character's own sourced `baseTuneBreakBoost` +
`boostToTeam` (from `CHAR_BUFF_TABLE[name].tuneBreak`). `TUNE_BREAK_BASE_DMG` is itself a sourced
constant, not derived here.

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

### 2d. Tune Rupture bonus DMG — confirmed formula shape, but a real open question

Currently implemented as a **flat, per-character sourced value** (`ruptureDmgMult`, read
directly from `CHAR_BUFF_TABLE[name].tuneBreak`), added as its own damage term — NOT scaled by
team Tune Break Boost:

```
dmg += DOT_LEVEL_MULT * DOT_BASE_FACTOR * (ruptureDmgMult / 100) * breaksPerRot * defMult * resMult
```

The same external description above claims Rupture *also* scales with team Boost:
`Base × (1 + team Boost multiplier)`. **Not yet reconciled** — it's unclear whether
`ruptureDmgMult` already IS a pre-computed value that folds in a boost assumption for the
specific characters currently using it, or whether a real boost-scaling term is missing
entirely. `NEEDS SOURCE` before either changing the formula or declaring it correct as-is.

### 2e. Tune Rupture-Shifting application — not modeled at all, engine-wide

No `dotApplier` mechanic exists in `DOT_MECHANICS` (`schema/block.schema.js`) for Tune
Rupture-Shifting — only `frazzle`/`erosion`/`fusionBurst`/`electroFlare`/`tuneBreak` exist.
Checked 2026-09-05: neither Lynae's nor Mornye's block files (the two named Tune Rupture
specialists) have a single `dotApplier` entry. This is a real, cross-character engine gap, not
specific to any one character — building it means adding a new `DOT_MECHANICS` entry and
wiring the shared reaction system (`dotReactions.js`) to consume it, which touches every
Tune-affiliated character, not one.

## 3. What this file is for

Add a verified formula/number here the moment it's sourced, with the same citation discipline
as a character block file (where it came from, what it changes, what it doesn't). Remove a
`NEEDS SOURCE` marker only when a real source backs the replacement — never on inference alone.
