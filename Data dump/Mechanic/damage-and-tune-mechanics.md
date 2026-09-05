# Wuthering Waves — Damage Calculation & Tune Mechanic Reference

Status: **partially sourced, partially open**. This file documents the real damage-calculation
pipeline and Tune Break/Tune Strain/Tune Rupture mechanic as far as it's been independently
verified against this project's own code and dump files. Sections marked `NEEDS SOURCE` are
open — do not treat anything in them as confirmed, and do not let a character's own block file
cite this doc for a number that lives in a `NEEDS SOURCE` section.

## 1. Core damage formula (confirmed, already implemented)

Every hit in this engine resolves through the same chain (see `engine/resolver/dps/resolveHitComposedDps.js`):

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
  the matching `%` stat (`atkPct`/`hpPct`/`defPct`).
- `avgCrit` — `1 + cr/100 * cd/100`-shaped expected-value blend of Crit Rate/Crit DMG (or a fixed
  `1 + cd/100` for a guaranteed-crit hit).
- `dmgBonus` — `1 + (elemDmg + category-specific %DMG bonus + amplify + deepen) / 100` roughly;
  see `calcDmgBonus()` in `features/teams/calcEngine.js` for the exact term-by-term formula.
- `defMult` — `ATTACKER_FACTOR / (ATTACKER_FACTOR + enemyDef * (1 - defShred/100) * (1 - defIgnore/100))`
  shape; see `calcDefMult()`.
- `resMult` — enemy RES-based multiplier; see `calcResMult()`.
- `totalMult` — a flat fallback multiplier for kit bonuses that don't map to a dedicated
  category stat.

This part is settled — it's the same formula the whole engine already runs on, independently
confirmed across every converted character's golden fixtures.

## 2. Tune Break / Tune Strain / Tune Rupture — what's confirmed vs. open

### 2a. Off-Tune Level gauge fill — `NEEDS SOURCE`

Real mechanic: each attack has a fixed, invisible Off-Tune accumulation value; Liberations >
Forte casts > Basic/Skill in raw fill efficiency; Echo Skills/DOT/most Coordinated Attacks
contribute 0. **No character-by-character per-move fill values are sourced anywhere in this
project's dump files yet.** Until they are, this cannot be simulated per-hit — only the
end-of-gauge event (Tune Break itself) is modeled, and only as a team-level aggregate (see 2b).

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
