# Engine Merge Plan — merging the legacy calculator into the TriggerBlock engine

**Mandate** (user, 2026-09-02): "deux engine c'est trop. merge l'ancien et nouveaux engine, puis
nettoies entiere de fond en comble. puis reconstruit tout proprement de A à Z. tout les bloc à réparé,
créé ou modifié." Full authority to take however long this needs; every step must be documented with
surgical precision, nothing forgotten. **Hard constraint: never touch `CharacterDetailModal` data or
the `Characters data dump/` files** — this plan and every step under it respects that boundary.

This document is the living engineering record for the merge — status, inventory, phase-by-phase
findings, and the full character checklist. Update it as work happens, the same discipline
`Engine development.md` already established for individual findings (which this plan supersedes for
anything architecture-scale — individual character data bugs unrelated to the merge still go there).

---

## 0. Why two engines exist today (as-found, verified by reading code, not assumed)

**System A — Legacy** (`characters.js`'s `CHAR_BUFF_TABLE`/`RESONANCE_CHAIN_DATA`/`SKILL_MULTIPLIERS`/
`CHARACTER_ROTATIONS` read by `calcTeamStats.js` + `calcEngine.js`'s per-character functions). Predates
the TriggerBlock engine. Flat per-character tables: `outroBuffs`/`libBuffs`/`selfBuffs`/`debuffs`
arrays with a free-text `condition` field that is **only partially enforced** (element name and a
narrow `MECHANIC_DAMAGE_APPLIERS` check — confirmed via `universalStatApplies()`, `calcEngine.js:731`;
"mode" text and most other conditions are NOT checked, historically a source of double-counting bugs
this session fixed several of), plus five hand-written DOT-reaction functions
(`calcFrazzleDmg`/`calcErosionDmg`/`calcFusionBurstDmg`/`calcElectroFlareDmg`/`calcTuneBreakDmg`).

**System B — TriggerBlock engine** (`engine/characterBlocks/*.js` + `rotationSimulator.js` +
`resolveHitComposedTeamDps.js`/`resolveSimulatedTeamRotation.js` + `sequenceGating.js` +
`triggerEngine.js`). Built across PHASE1/2/3_PLAN.md (2026, deleted once complete per user's own prior
instruction — their content lives on in file header comments throughout `engine/`). Typed blocks
(`kind`/`trigger`/`condition`/`timing`/`target`/`effects`/`damage`), a real per-step rotation simulator,
real trigger-firing/condition/sequence gating. **This is authoritative for per-hit damage and buffs for
any "fully converted" team** (`calcTeamStats.js`'s own `allMembersConverted` gate,
`calcTeamStats.js:167`) — confirmed this session (Denia/Aemeath whole-team buff investigation) that
System A's equivalent code path is genuinely dead once every team member has a TriggerBlocks file.

**The actual entanglement** (why "deux engine" is real, not just historical residue): DOT reactions
(Frazzle/Erosion/Fusion Burst/Electro Flare/Tune Break) were a **deliberate, documented decision NOT to
port** — `dotReactions.js`'s own header: "these are ICD-aware, hand-verified-against-the-wiki mechanics
that already live correctly in calcEngine.js... porting their stack/tick math into TriggerBlocks would
mean re-deriving already-correct formulas from scratch for no benefit." This session's mandate
overrides that decision — the DOT layer is the concrete piece that has to actually move for there to be
one engine, and it's exactly the layer this session's own bug-hunting (Lynae/Aemeath/Denia/Rebecca) has
been fighting friction with (mode-exclusivity having to be bolted on across TWO separate reaction
functions, a combinatorial resolver needed only because of the split).

**Also entangled, lower stakes, found during this audit**: `outroBuffs`/`libBuffs`/`selfBuffs`/
`debuffs`'s `condition` text is genuinely dead for a converted team (System A's buff-application loop
never runs), but the SAME System A tables still feed: the synergy-score computation, the
rotation-timeline display heuristic, and (as established above) the whole DOT-reaction layer. So
`characters.js`'s flat tables can't simply be deleted even once the merge is done — parts of them
(`tuneBreak`, the DOT-relevant `debuffs` entries) need to become real TriggerBlocks; other parts
(display/scoring-only fields) are a separate, smaller cleanup this plan will scope once the DOT
migration is done and the actual remaining footprint is visible.

---

## 1. Inventory (Phase 0 — DONE 2026-09-02, script-verified, not from memory)

- **58 released characters total.** `Jingran` (unreleased) is the only one NOT fully converted (no
  TriggerBlocks file, no `CHARACTER_ROTATIONS` entry) — out of scope until released.
- **Every released character has a `CHAR_BUFF_TABLE` entry.**
- **12 characters are DOT-reaction-flagged** (own a `debuffs` entry for frazzle/erosion/fusionBurst, an
  `electroFlare` field, or a `tuneBreak` object) — these are the ones whose damage this merge actually
  has to move, in order, without changing their computed numbers unexpectedly:

  | # | Character | DOT mechanic(s) flagged | This session's status |
  |---|---|---|---|
  | 1 | Aemeath | tuneBreak (ruptureDmgMult, modeExclusive, competesWithFusionBurstReaction) | Mode-exclusivity fixed; tuneBreak itself still legacy-only |
  | 2 | Buling | `electroFlare: true` (no `debuffs` entry — Electro Flare application confirmed via this flag alone) | Untouched this session |
  | 3 | Cartethyia | `debuffs.erosion` (6 stacks w/ Rover, HP-scaling) + two `elemDmg` debuffs (Wind's Indelible Imprint scaling amp, Sig weapon amp) — the `elemDmg` entries are ordinary legacy debuffs, NOT DOT-reaction inputs; only `erosion` is in scope for this merge | Untouched this session |
  | 4 | Ciaccona | `debuffs.erosion` (3 stacks, ticks every 2s) | Untouched this session |
  | 5 | Denia | tuneBreak (strainDmgPerStack, modeExclusive, competesWithFusionBurstReaction) | Mode-exclusivity fixed; tuneBreak itself still legacy-only |
  | 6 | Lucy | tuneBreak (baseTuneBreakBoost only) | Untouched this session |
  | 7 | Luuk Herssen | tuneBreak (strainDmgPerStack, maxStrainStacks) | Untouched this session |
  | 8 | Lynae | tuneBreak (ruptureDmgMult, strainDmgPerStack, modeExclusive) | Mode-exclusivity + appliesTags fixed; tuneBreak itself still legacy-only |
  | 9 | Mornye | tuneBreak (ruptureDmgMult, strainDmgPerStack, interferedDmgAmp) — generic responder, not mode-locked | Verified correct-as-is (not exclusive by design) |
  | 10 | Phoebe | `debuffs.frazzle` (18 stacks/rotation, "in Confession mode" — her real mode is Absolution, so per item 9/11's own Phoebe finding this Frazzle application is likely ALSO supposed to be inactive; needs the same real-mode check before migrating, not a blind port) | Untouched this session |
  | 11 | Rebecca | tuneBreak (baseTuneBreakBoost only — no rupture/strain of her own) | Huntress/Guts self-buff bug fixed (unrelated to her tuneBreak) |
  | 12 | Rover: Spectro | `debuffs.frazzle` (Forte Resonating Spin→Echoes 2 stacks +Shimmer; Liberation Echoing Orchestra 6 stacks; Shimmer prevents decay for 9s) | Untouched this session |

  Confirmed via a script pass (2026-09-02) — every flagged stat above is real and sourced from the
  existing `condition` text already in `characters.js`, not re-derived from memory.

- **Every other character** (46 of 58) has no DOT-reaction footprint at all — their System A tables are
  ENTIRELY dead for a converted team already (buff-application loop only), except whatever
  display/scoring-only usage Phase 3 below maps out.

---

## 2. Target architecture

One engine: the TriggerBlock system. Concretely:

1. Every DOT reaction becomes real `kind:'damage'` (or `kind:'buff'` for a %-deepen-shaped effect, e.g.
   Mornye's `interferedDmgAmp`) TriggerBlocks, sourced from the SAME verified formulas
   `calcFrazzleDmg`/`calcErosionDmg`/`calcFusionBurstDmg`/`calcElectroFlareDmg`/`calcTuneBreakDmg`
   already encode (`dotReactions.js`'s own header is right that these formulas are correct — the merge
   ports the FORMULA's real behavior into a block-shaped representation, it does not re-derive numbers
   from scratch or re-guess anything already sourced).
2. `resolveHitComposedTeamDps`/`resolveSimulatedTeamRotation` become the ONLY place damage is computed
   for a real team — `calcEngine.js`'s five DOT functions and `dotReactions.js` are deleted once every
   consumer is ported, not kept as a parallel path.
3. `calcTeamStats.js`'s `allMembersConverted` branch and its `!allMembersConverted` legacy fallback
   collapse into ONE path (the fallback was already only for the hypothetical mixed-team case, which
   only `Jingran` — unreleased — currently triggers).
4. `CHAR_BUFF_TABLE`'s `outroBuffs`/`libBuffs`/`selfBuffs`/`debuffs`/`tuneBreak` arrays are retired once
   nothing reads them for real damage — what's LEFT after that (if anything still legitimately needs a
   flat per-character table — e.g. `dmgFocus`, `tier`, base stats, which are NOT part of this merge)
   stays exactly where it is.
5. The combinatorial mode-resolver built this session (`calcTeamStats.js`'s Fusion/Rupture/Strain
   enumeration) moves to operate purely over TriggerBlocks (real magnitude comparison via
   `winningStanceForOwner`-family logic, not the current `tuneBreakExclusiveCandidates` shape that only
   exists because of the System A/B split) — this SIMPLIFIES once there's one data source, not adds
   more machinery.

---

## 3. Phases

**Phase 0 — Inventory.** DONE (section 1 above). Re-run the DOT-flag script for the 5 unconfirmed
characters before Phase 2 starts on them.

**Phase 1 — Per-mechanic formula extraction.** For each of the five DOT functions, write down (in this
document, one subsection each, before touching any character file) the exact formula, its real
constants (`DOT_LEVEL_MULT`, `DOT_BASE_FACTOR`, per-mechanic stack tables), and what a faithful
TriggerBlock representation of it looks like (a `kind:'damage'` block's `damage.hits`, or a `kind:'buff'`
block's `effects`, whichever the mechanic actually is) — a design decision made ONCE per mechanic, then
applied consistently to every character who has it, not re-decided per character.

**Phase 2 — Per-character migration**, one at a time, following the DOT-flagged list in section 1,
ordered simplest-mechanic-first (single-mechanic characters before Aemeath/Denia/Lynae's already-fixed
mode-exclusive cases, so the simple cases validate the block SHAPE before the exclusivity logic is
layered back on top). For each: real damage-block(s) added to that character's `characterBlocks/*.js`
file, a parity test proving the new block-computed number matches (within rounding) the OLD
`calcEngine.js` function's own output for that same character/context, full suite green, commit.

**Phase 3 — Retire the legacy path.** Once every DOT-flagged character is migrated: delete
`calcEngine.js`'s five DOT functions + `dotReactions.js`, collapse `calcTeamStats.js`'s
`allMembersConverted` branch, audit what's left of `outroBuffs`/`libBuffs`/`selfBuffs`/`debuffs`/
`tuneBreak` for any REMAINING real consumer (synergy score, rotation timeline) and either port that
consumer too or make an explicit, documented call that it's display-only and can keep reading the flat
table (not every remaining read is a "second engine" — a cosmetic synergy-score heuristic reading
`characters.js` directly is not the same problem as two engines independently computing DPS).

**Phase 4 — Full-roster regression sweep.** Every one of the 58 characters gets its own before/after
DPS comparison (solo and in at least one real team context), not just the DOT-flagged 12 — the merge
touches shared files (`calcTeamStats.js`, `calcEngine.js`) that every character's number flows through.

---

## Phase 1 — formula extraction (DONE 2026-09-02, verbatim from `calcEngine.js`, not re-derived)

Shared constants (`calcEngine.js:16-43`): `DOT_LEVEL_MULT = 3674`, `DOT_BASE_FACTOR = 1.25078` (used by
every mechanic below).

### 1.1 Frazzle (`calcFrazzleDmg`)
- Constants: `FRAZZLE_TICK_INTERVAL = 3`, `FRAZZLE_ICD_PER_SOURCE = 2.5`,
  `FRAZZLE_STACK_TABLE = [0, 0.240, 0.4355, 0.6298, 0.8251, 1.020, 1.216, 1.409, 1.605, 1.800, 1.995]`
  (index = stack count).
- `numSources` = count of team members flagged `debuffs.frazzle`; `effectiveRate = numSources / 2.5`.
- `maxStacksRaw` = sum of every flagged member's own `debuffs.frazzle.value` (their per-rotation stack
  contribution).
- `stacks = min(maxStacksRaw, floor(effectiveRate * rotTime))`; `numTicks = min(floor(rotTime/3), stacks)`.
- Sums `DOT_LEVEL_MULT * DOT_BASE_FACTOR * FRAZZLE_STACK_TABLE[s]` for `s` counting DOWN from `stacks`
  for `numTicks` ticks (a decaying-stack tick sequence, not a flat per-tick value).
- **Phoebe-specific ×2.0 multiplier** applied to the whole `total` if she's on the team (hardcoded
  `hasPhoebe` check, not itself an ICD/stack mechanic — needs its own real, sourced justification check
  before porting; likely a genuine kit effect of hers doubling Frazzle damage, to be confirmed against
  her own kit text before this becomes a TriggerBlock condition rather than a blind port).
- TriggerBlock shape: this is fundamentally a TEAM-WIDE shared DOT tied to how many appliers/how much
  stack each contributes — doesn't fit a single owner's `kind:'damage'` block cleanly. Needs either (a)
  one block per applier contributing its own share, gated by an `ally-action`-style shared tag so the
  TOTAL naturally emerges from summing real per-applier blocks (closer to how the real game staggers
  application), or (b) a dedicated aggregate resolver parallel to (not duplicating) the per-hit engine,
  the same way `resolveDotReactionDps` is today just reimplemented on top of TriggerBlock data instead
  of `CHAR_BUFF_TABLE`. Design decision NOT yet made — flag for the start of Phase 2's Frazzle-flagged
  characters (Phoebe, Rover: Spectro), don't guess ahead of that.

### 1.2 Erosion (`calcErosionDmg`)
- Constants: `EROSION_TICK_INTERVAL = 3`, `EROSION_DURATION = 15`,
  `EROSION_STACK_TABLE = [0, 0.360, 0.899, 1.799, 2.698, 3.597, 4.497]` (stacks >3 need Aero Rover Outro
  per the table's own comment — a real, sourced conditional ceiling, not yet enforced anywhere either).
- `baseStacks` = MAX (not sum) of every flagged member's own `debuffs.erosion.value`, floor 3.
- `uptime = min(1, 15/rotTime)`; `ticks = floor(15/3) = 5` (constant, not rotTime-dependent — the DURATION
  bounds the tick count, not the rotation length, then `uptime` separately scales for a short rotation).
- Sums `DOT_LEVEL_MULT * DOT_BASE_FACTOR * EROSION_STACK_TABLE[baseStacks]` for exactly 5 ticks (flat,
  no decay unlike Frazzle), then multiplies the WHOLE total by `uptime`.
- Same team-wide-aggregate shape question as Frazzle — MAX not SUM of appliers is a real, different
  interaction rule to preserve exactly, not simplify away.

### 1.3 Fusion Burst (`calcFusionBurstDmg`) — already gained `excludeNames` this session (item 9)
- Constants: `FUSION_BURST_THRESHOLD = 10`, `FUSION_TRAIL_MULT = 3.0`. Own comment: "stack-DMG table
  isn't published on the wiki... stays a rough approximation."
- `has` = boolean (ANY non-excluded flagged member) — the formula does NOT scale with applier count or
  their own `debuffs.fusionBurst.value` at all (confirmed this session while investigating Aemeath).
- `explosions = max(1, floor(rotTime / max(10, 8)))` = `floor(rotTime/10)`, minimum 1.
- `dmg = DOT_LEVEL_MULT * DOT_BASE_FACTOR * (10 * 0.5) * 3.0` (a FLAT per-explosion value, independent
  of team composition beyond the boolean gate) `* explosions`.
- Simplest of the five to port — a real "is anyone applying it" boolean gate maps naturally onto an
  `ally-action`-triggered block once a proper `'fusion-burst-status'` tag exists roster-wide (partially
  already true — Denia/Lynae/Aemeath's `appliesTags` work this session already tags some of this).

### 1.4 Electro Flare (`calcElectroFlareDmg`)
- Constants: `FLARE_TICK_INTERVAL = 4`, `FLARE_STACK_MULT = 0.12`. Own comment: stack table also
  unpublished, "stack halving on tick is confirmed by the wiki, the tick interval/mult stay
  approximations."
- `has` = boolean (`CHAR_BUFF_TABLE[name].electroFlare` truthy — a bare flag, not a value like the
  others; only Buling has this today). `ticks = min(4, floor(rotTime/4))`.
- Starts `stacks = 10` (hardcoded seed, not sourced from the applier's own kit value — worth checking
  against Buling's real kit before porting, since every OTHER mechanic here reads a real per-character
  value and this one doesn't). Each tick: `total += DOT_LEVEL_MULT * DOT_BASE_FACTOR * (stacks * 0.12)`,
  then `stacks = ceil(stacks/2)` (halving, per the wiki-confirmed mechanic).
- Single-applier mechanic today (only Buling) — simplest migration target after Fusion Burst, a
  straightforward cast/passive-triggered block on her own file, no cross-character aggregation needed.

### 1.5 Tune Break (`calcTuneBreakDmg`) — already substantially reworked this session (items 9-11)
- Constants: `TUNE_BREAK_BASE_DMG = 5000`.
- Already has: `exclusiveCandidates` extraction (`modeExclusive` members' own rupture/strain pulled out
  of the unconditional sum), `competesWithFusionBurstReaction` cross-reaction handling, and
  `calcTeamStats.js`'s own combinatorial resolver consuming its output. The REMAINING legacy-only piece
  is the base formula itself: `totalBoost` = sum of every tbMember's `baseTuneBreakBoost + boostToTeam`;
  `hasAccel = any tbMember's boostToTeam > 20`; `breaksPerRot = hasAccel ? min(2, max(1, floor(rotTime/12))) : 1`;
  base `dmg = 5000 * (1 + totalBoost*0.01) * breaksPerRot * defMult`, then each non-exclusive member's
  own `ruptureDmgMult` adds `DOT_LEVEL_MULT * DOT_BASE_FACTOR * (ruptureDmgMult/100) * breaksPerRot *
  defMult * resMult`; `deepenMult` separately folds in Mornye's `interferedDmgAmp` (ER-scaled) and the
  shared-`maxStrain`/`strainDmgPerStack` percentage, each gated by `uptimeFactor = min(1, 8*breaksPerRot/rotTime)`.
- Most complex of the five to port faithfully — genuinely team-wide (`totalBoost` sums across EVERY
  tbMember, not just the one being evaluated), and already has the most session-added special-casing.
  Do this one LAST in Phase 2, after the simpler four have proven the porting methodology.

## Phase 2 — infrastructure built + first real migration (2026-09-02)

Built `engine/dotReactionsFromBlocks.js`: real, tested (`dotReactionsFromBlocks.test.js`, 7 tests)
TriggerBlock-native resolvers for Frazzle/Erosion/Fusion Burst/Electro Flare — each proven to match its
`calcEngine.js` legacy counterpart's exact formula, including the real interaction rules (Frazzle SUMS
across applying blocks, Erosion takes the MAX, Fusion Burst/Electro Flare are pure boolean gates).
Added the `dotApplier` field to `triggerBlocks.schema.js` (a new `DotApplier` typedef) for characters to
declare their own real, sourced contribution on the block whose trigger IS the actual applying move.

**Buling migrated (Electro Flare) — the first real end-to-end character migration, proof that the
whole approach works in production, not just in isolated tests.** Her two real Electro Flare
application points (`buling.intro.summon-and-smite`, `buling.liberation.flashing-thunder-spell-harmony`
— both confirmed via her own `CHARACTER_ROTATIONS` step notes) now carry `dotApplier: {mechanic:
'electroFlare'}`. `dotReactions.js`'s `resolveDotReactionDps` gained an optional `blocksByOwner` param;
when supplied (every real `calcTeamStats.js` call now passes `engineChosenOrder.blocksByOwner`),
Electro Flare resolves from her real blocks instead of `CHAR_BUFF_TABLE.electroFlare` — legacy
`calcElectroFlareDmg()` stays only as the fallback for a caller with no blocks available (this file's
own test, proving the pre-migration behavior still works standalone). Her `CHAR_BUFF_TABLE.electroFlare
= true` flag was DELIBERATELY kept, not removed — it still has a real, separate live use
(`calcTeamStats.js`'s `dotContributors` filter, which decides who gets a share of the DOT total in the
per-member damage breakdown display) that migrating the damage FORMULA doesn't retire. Verified
end-to-end with a real `calcTeamStats(['Buling','Aemeath'],...)` call (not just unit tests):
`hasElectroFlare: true`, real `dotDps`, Buling correctly attributed her share. Full suite: 1242 tests
passing (up from 1235).

**Migration checklist** (DOT-flagged characters from Phase 0's table, in the order Phase 2 intends to
tackle them — simplest mechanic/fewest interactions first):

| Character | Mechanic | Status |
|---|---|---|
| Buling | Electro Flare | **Migrated 2026-09-02** |
| Denia | Fusion Burst (+ tuneBreak, deferred to 1.5) | Not started |
| Aemeath | Fusion Burst (+ tuneBreak, deferred to 1.5) | Not started |
| Ciaccona | Erosion | Not started |
| Cartethyia | Erosion | Not started |
| Phoebe | Frazzle (real-mode check needed first — see Phase 0 note) | Not started |
| Rover: Spectro | Frazzle | Not started |
| Lynae, Aemeath, Denia, Mornye, Luuk Herssen, Rebecca, Lucy | Tune Break | Not started (1.5, last) |

## Status

**Current phase: 2, in progress.** Infrastructure (`dotReactionsFromBlocks.js`) built and tested. One
character (Buling) fully migrated end-to-end and verified in production. Next: Fusion Burst
(Denia/Aemeath) — reuses the same boolean-gate pattern Electro Flare just proved, lowest-risk next step
before tackling Erosion's MAX-aggregation or Frazzle's SUM-aggregation + Phoebe's real-mode question.

## Constraints (repeated here, not just in the mandate, so they're never missed mid-phase)

- Never edit `CharacterDetailModal` or its data.
- Never edit anything under `Characters data dump/`.
- Every phase: full test suite green before commit, every commit pushed, every real finding logged here
  (architecture-scale) or in `Engine development.md` (individual character data facts unrelated to the
  merge itself).
