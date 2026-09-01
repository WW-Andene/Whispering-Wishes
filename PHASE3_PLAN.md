# Phase 3 — Cut `calcTeamStats.js` over to the TriggerBlock engine

## Current status (updated 2026-09-01)

**Done:**
- Stage 0 — coverage audit. Confirmed real per-hit damage and cross-character
  buff-uptime timing already have working engine equivalents from Phase 2;
  DOT reactions, energy-cycle-gated Liberation uptime, the rotation
  on-field order-search, and Coordinated ATK off-field snapshot semantics
  have no engine model at all yet.
- Stage 1 — parity harness. Built and swept across all 56 converted
  characters (`phase3-parityHarness.test.js`), comparing the engine's real
  per-hit damage against `calcTeamStats()`'s own RAW-tier `rawDps`. Found
  and fixed a real engine gap along the way: `resolveHitComposedDps` had no
  way to receive gear-side stats (weapon passives, echo sets) at all — added
  an additive `externalStats` param.
- Stage 2 — triage. Root-caused all 6 flagged outliers (Lucilla 40x,
  Hiyuki 12.7x, Roccia 8.8x, Sanhua 9.0x, Aemeath 6.7x, Iuno 6.5x) to a
  single systemic gap, not six separate bugs: no character's engine blocks
  gated Resonance Chain bonuses by owned sequence level — every `chain.sN`
  block fired unconditionally, as if every character were fully R6-awakened.
- Stage 3, item 1 of 5 — sequence-level gating. Added `engine/sequenceGating.js`
  (derives the required sequence from the existing `chain.sN` id convention,
  verified with zero exceptions across all 56 characters) and wired it into
  `resolveHitComposedDps`/`resolveSimulatedTeamRotation` as an opt-in,
  backward-compatible parameter. Re-ran the Stage 1 harness at a true S0
  baseline: roster-wide median dropped 3.13x → 2.03x, mean 4.20x → 2.34x,
  max 40.03x → 8.01x (Lucilla, now a real but much smaller residual, not
  the dominant systemic bug it was).
- Stage 3, item 2 of 5 — DOT reactions. Added `engine/dotReactions.js`,
  composing the five already-correct `calcEngine.js` DOT functions
  (Frazzle/Erosion/Fusion Burst/Electro Flare/Tune Break) around
  engine-derived rotation time and per-element enemy RES, matching
  `calcTeamStats.js`'s own per-reaction element routing exactly (Stage 0's
  "stays composed around the engine" treatment, same as gear — not a
  TriggerBlock port). 6 new tests.

- Stage 3, item 3 of 5 — energy-cycle-gated Liberation uptime. Added
  `engine/energyCycleGating.js` (`libUptimeOf()`, a small lookup over
  `calcEnergyCycles()`'s already-correct output) and wired a `libUptime`
  param into `resolveHitComposedDps`/`resolveHitComposedTeamDps` as an
  opt-in, backward-compatible parameter, same pattern as sequence gating.
  Unlike legacy's flat `libShare` heuristic (a guessed 20%/35% share of the
  WHOLE totalMult, since calcTeamStats.js has no per-source damage split),
  the engine gate discounts exactly the hits whose `damage.category` is
  `'libDmg'` — a documented precision improvement, not a behavior change to
  match. 8 new tests.

- Stage 3, item 4 of 5 — Coordinated ATK off-field snapshot semantics.
  Added `engine/coordinatedAtk.js` (`coordinatedMultShare()`, factoring out
  the coord/field-time mult blend duplicated between calcTeamStats.js's RAW
  and FULL tiers) and a `coordSnapshotDiscount` opt-in option on
  `resolveSimulatedTeamRotation`/`resolveHitComposedTeamDps` that discounts
  `'next-on-field'`-scoped buffs by legacy's exact 0.6 factor while leaving
  `'whole-team'` buffs untouched — mapping legacy's outroBuffs-vs-libBuffs
  distinction directly onto the engine's own scope vocabulary. 6 new tests.

- Stage 3, item 5 of 5 (final item) — the rotation on-field order-search.
  Added `engine/rotationOrderSearch.js`'s `chooseOnFieldOrder(members,
  mainDpsName)`: brute-forces every permutation of supports (Main DPS
  always last), scores each via `buildTeamSteps`/`simulateTeamRotation` +
  `buildBlockWindows`/`activeCountAt` (how much cross-character whole-team/
  next-on-field buff value survives to the instant the Main DPS's own
  on-field segment opens), keeps the highest (ties keep the input order) —
  the engine-native equivalent of calcTeamStats.js's own rotationTimeline
  IIFE. 5 new tests, including a load-bearing behavioral one: reordering so
  Rover: Electro's `next-on-field` outro actually reaches Yinlin (instead of
  landing on nobody, as the naive input order does) scores strictly higher
  and the search finds it.

**Stage 3 is now fully closed — all 5 items done.**

- Stage 4 kickoff: root-caused the residual ~2.03x roster-wide median (Case
  1, documented `totalMult`-heuristic-vs-real-sum improvement — see Stage 4
  kickoff section below) and individually confirmed Lucilla's 8.01x (same
  Case 1, compounded by her unusually short 5s `onField` vs. a typical
  Main DPS's 14-19s) — no open items left before the rewrite.

**Not started:** Stage 4 (the actual `calcTeamStats.js` rewrite) and Stage 5
(final verification + commit) — Stage 3 is now fully closed, so both are
unblocked per this plan's own ordering, but neither has started yet.

**Every commit through this stage has been additive** — new engine files,
new tests, an opt-in param on 2 existing engine functions. `calcTeamStats.js`
itself has not been touched at any point in Phase 3 (verified via
`git diff --stat` after every stage).

## Why this is its own phase, not a quick edit

`calcTeamStats.js` (1365 lines) is the live calculator every user's team score
comes from. It encodes years of hard-won correctness fixes that are easy to
lose in a rewrite if not treated as first-class requirements, not just
"legacy cruft to replace": overlap-based cross-character buff uptime
(`overlapUptimeForSeg`), shield-gated weapon DEF Ignore, sub-DPS snapshot
discounts for Coordinated ATK characters, ICD-aware DOT reactions (Frazzle/
Erosion/Fusion Burst/Electro Flare/Tune Break), energy-cycle-gated Liberation
uptime, echo-skill-buff routing (self/team/next + condition matching), the
rotation order-search (brute-force permutation scoring against real buff
durations), synergy scoring, and the warnings list. Phase 2 built the engine
and converted all 52 characters' buffs/damage to TriggerBlocks, but never
wired it into this file — `calcTeamStats.js` still reads the legacy flat
tables (`CHAR_BUFF_TABLE`, `RESONANCE_CHAIN_DATA` via `applyResonanceChain`,
`CHARACTER_DATA[name].totalMult`) directly.

Goal: replace calcTeamStats.js's internals with engine calls, with **zero
silent regressions** to the numbers players see, verified by a harness before
any cutover — not by re-reading the diff and hoping.

## Stage 0 — Coverage audit (what the engine does NOT model yet)

Inventory every mechanic `calcTeamStats.js` currently computes and check
whether an engine equivalent exists. This determines what Stage 2 needs to
build before the rewrite is possible, not just what to migrate 1:1.

Known engine gaps as of Phase 2's end (to confirm/expand in this stage):
- DOT reactions (Frazzle/Erosion/Fusion Burst/Electro Flare/Tune Break) —
  currently computed by dedicated `calcEngine.js` functions
  (`calcFrazzleDmg` etc.), no TriggerBlock/engine equivalent.
- Echo set bonuses (`ECHO_SETS`, `TEAM_SET_BUFFS`, `applyFullEchoSet`) and
  per-echo substat rolls (`applyEchoStats`) — gear, not character kit; out of
  TriggerBlock scope entirely so far.
- Weapon passives (`WEAPON_DATA`, `parsePassive`, `getWeaponPv`,
  `WEAPON_REFINE_SCALE`) — same, gear-side.
- 4-cost echo active-skill buffs (`ECHO_SKILL_BUFFS`).
- Energy-cycle / ER-gated Liberation uptime (`calcEnergyCycles`).
- The rotation order-search itself (brute-force permutation + duration-aware
  scoring) — this decides which member goes on-field when, which the engine's
  `buildTeamSteps`/`deriveStepsFromRotation` currently assume is given, not
  computed.
- Synergy score and the warnings list — presentation-adjacent, not raw DPS
  math, but part of calcTeamStats's return contract.
- Coordinated ATK snapshot-at-swap-out semantics and the 0.6 discount factor.
- Sub-DPS off-field field-time allocation (`fieldRatio`, proportional split
  across sub-DPS members sharing off-field time).

Deliverable: a written table (in this file) of every stat/mechanic
`calcTeamStats.js` touches, with an engine-equivalent column (exists / needs
building / stays gear-side and gets composed around the engine, not replaced
by it).

### Stage 0 result (confirmed 2026-09-01 by grepping engine/ exports)

Engine currently exports only: `resolveHitComposedDps` (per-hit damage for
one character's own blocks against one rotation), `resolveSimulatedTeamRotation`
+ `buildTeamSteps`/`simulateTeamRotation` (cross-character buff-uptime
composition, GIVEN an on-field order — does not choose one),
`deriveStepsFromRotation` (real `CHARACTER_ROTATIONS` → engine steps),
`buildBlockWindows`/`timeWeightedAverageConcurrency`/`activeCountAt` (buff
window math), `resolveTriggerBlocks` (single-block resolution primitive).
Nothing else exists yet.

| Mechanic | calcTeamStats.js today | Engine today | Stage 3 action |
|---|---|---|---|
| Per-character skill/hit damage | `SKILL_MULTIPLIERS`-derived `totalMult` flat % | `resolveHitComposedDps` (real per-hit) | Use engine — this IS the point of the cutover |
| Cross-character buff uptime (outro/lib/team) | `overlapUptimeForSeg` + hand-written per-source-type loops | `resolveSimulatedTeamRotation`/`buildBlockWindows` | Use engine |
| Resonance Chain bonuses | `applyResonanceChain` (blanket-apply legacy heuristic, imprecise target scope) | Per-block `target.scope`, already wired since Phase 2 | Use engine (documented improvement, not a bug — see verification test's own note) |
| DOT reactions (Frazzle/Erosion/Fusion Burst/Electro Flare/Tune Break) | `calcFrazzleDmg`/`calcErosionDmg`/`calcFusionBurstDmg`/`calcElectroFlareDmg`/`calcTuneBreakDmg` (calcEngine.js) | None | **Needs building** — no TriggerBlock/engine equivalent exists at all |
| Echo set bonuses (2pc/3pc/5pc, `TEAM_SET_BUFFS`) | `applyFullEchoSet`, `TEAM_SET_BUFFS` (calcEngine.js) | None (gear, not kit) | Stays gear-side — compose calcEngine.js calls around engine output, don't port into TriggerBlocks |
| Echo substat rolls | `applyEchoStats` (calcEngine.js) | None (gear) | Stays gear-side |
| Weapon passives (`pv`, `tv`) | `parsePassive`/`getWeaponPv`, `WEAPON_REFINE_SCALE` | None (gear) | Stays gear-side |
| 4-cost echo active-skill buffs | `ECHO_SKILL_BUFFS` lookup, hand-routed self/team/next | None (gear) | Stays gear-side |
| Energy-cycle / ER-gated Liberation uptime | `calcEnergyCycles` (calcEngine.js) | None | **Needs building** — must gate the engine's Liberation-derived hits by real `libUptime`, same as legacy `mult * (1 - libShare*(1-libUptime))` |
| Rotation on-field order-search | Brute-force permutation + duration-aware scoring, inline closure | None — engine takes a GIVEN order | **Needs building** — the order-search itself must be ported/reused, feeding its chosen order into `buildTeamSteps` |
| Coordinated ATK off-field snapshot + 0.6 discount | Inline in both RAW and FULL tiers, twice (sub-DPS + off-field damager cases) | None | **Needs building** — no engine concept of "coordinated/off-field damage" yet |
| Sub-DPS proportional off-field time allocation | Inline (`fieldRatio`, `offFieldTime * (subOnField/totalSubNeed)`) | Partially covered by `deriveStepsFromRotation` using real `CHARACTER_ROTATIONS`, but that assumes full on-field time, not a shared/reduced allocation | **Needs reconciling** — real rotations vs. proportional-share model may need to coexist |
| Synergy score, warnings list | Inline scoring/heuristics, not DPS math | N/A — presentation contract, not physics | Recompute from engine-derived stats in the Stage 4 rewrite, logic mostly unchanged |
| Shield-gated weapon DEF Ignore | `gateWeaponDefIgnore`/`SHIELD_GATED_WEAPONS` | None (gear) | Stays gear-side |
| ER-scaling selfBuffs (`erScale`) | `resolveBuffValue` | Not yet represented in any `.blocks.js` file (Sigrika/Mornye use flat cap values per their audit comments) | Flagged: Stage 3 should check whether Sigrika's/Mornye's blocks should gain a comparable engine-side ER-scale field, or whether calcTeamStats's discount stays a gear-composition step |

**Conclusion**: this is NOT a drop-in swap. Real per-hit damage and
cross-character buff timing (the two hardest, most error-prone parts) DO
have engine equivalents ready to use. But DOT reactions, energy-cycle
gating, the order-search, and Coordinated ATK snapshot semantics have **no
engine model at all** and must be built (Stage 3) before Stage 4's rewrite
can produce a correct number — attempting the rewrite before Stage 3 would
silently drop these mechanics from the live calculator, which is exactly
the class of regression this whole phase exists to prevent.

## Stage 1 result (in progress, 2026-09-01 — first 3 characters)

Before any comparison was possible, found and fixed a real engine gap:
`resolveHitComposedDps` had **no way to receive gear-side stats at all** —
`statsAtInstant` started from a bare `createStats()` and only ever folded in
the character's own TriggerBlocks, so weapon passives and echo set bonuses
(which dominate calcTeamStats.js's real numbers) could never reach it. Added
an additive, backward-compatible `externalStats` param (a pure delta object,
folded in every instant alongside the character's own blocks) — this is how
Stage 0's "gear stays composed around the engine" conclusion is actually
wired in. Covered by 2 new regression tests in
`resolveHitComposedDps.test.js` proving it's opt-in and additive.

Built `phase3-parityHarness.test.js`: for a solo (1-member) team, computes
`calcTeamStats()`'s real `rawDps` (the RAW tier — equipment-only, no team
buffs, no DOT, no order-search, no energy-cycle gating — the cleanest
solo-comparable slice per Stage 0) and diffs it against the engine's own
`resolveHitComposedDps` total (real per-hit damage from `deriveStepsFromRotation`
+ the character's real `.blocks.js`, with gear composed in via the new
`externalStats` param, using the SAME weapon/echo-set inference calcTeamStats
itself uses for an unbuilt character). First 3 real results:

| Character | calcTeamStats rawDps | engine dps | ratio (engine/legacy) |
|---|---|---|---|
| Augusta | 1748 | 2160 | 1.24x |
| Cartethyia | 1131 | 4967 | 4.39x |
| Calcharo | 1513 | 6758 | 4.47x |

Not yet triaged (that's Stage 2) — recorded here as raw Stage 1 output.
Augusta's 1.24x is close enough to plausibly be real per-hit-vs-flat-%
divergence (the whole point of the engine). Cartethyia's and Calcharo's
4x+ gaps are large enough that Stage 2 needs to check for a real bug before
assuming "the engine is just more precise" — candidates to check first:
whether `rawRotTime`'s time-window differs enough from the engine's own
simulated total combo time to explain a chunk of it (the two use different
denominators, not necessarily an error), and whether either character's
`.blocks.js` double-counts or over-scopes anything relative to its own
audit-comment source.

**Update — full sweep done (2026-09-01, all 56 converted characters):**
`phase3-parityHarness.test.js` now dynamically loads every `.blocks.js` file
(generated from the directory listing + each file's own `SOURCE`, not
hand-typed) and runs the same solo comparison for all 56. One harness bug
found and fixed along the way: several HP/DEF-scaling characters mix
ATK-basis hits into an otherwise HP/DEF kit (documented pattern, e.g.
Cartethyia's own audit comment on mixed "%"/"%HP" notation) — the harness
was only supplying the character's OWN scaling stat as `baseStats`, so 5
characters (Baizhi, Shorekeeper, Suisui, Taoqi, Youhu) threw
`needs baseStats.atk ... wasn't provided`. Fixed by always supplying all
three raw base stats (atk/hp/def), letting each block draw whichever basis
it actually declares — not a change to any character's `.blocks.js` file,
purely a harness-input fix.

All 56 pass (produce a real, finite ratio) once fixed. Summary across the
full roster: **min 0.056, max 40.03, median 3.13, mean 4.20** (engine/legacy).
Full per-character table is in the harness's own console output
(`npx vitest run src/__tests__/phase3-parityHarness.test.js --reporter=verbose`) —
not duplicated here since it's 56 rows and easily regenerated; the
distribution shape is what matters for triage:

- **4 characters land BELOW 1.0** (engine < legacy): Baizhi (0.056),
  Suisui (0.311), Shorekeeper (0.423), Youhu (0.417) — all four are
  Healer/Support-role characters whose real kit is mostly non-damage
  (healing, shields, buffs), so their converted `.blocks.js` files
  correctly have few/small damage blocks, while the legacy `totalMult`
  approximates a "personal power" baseline that doesn't really represent
  a healer's intended playstyle either. Plausible as expected divergence,
  but Stage 2 should confirm Baizhi's 0.056 (18x below) isn't hiding a
  real missing damage block rather than a genuinely thin healer kit.
- **The bulk (majority) cluster in the 1.5x–5.5x range** — consistent
  with "real per-hit composition legitimately differs from a flat
  totalMult%", the expected outcome per this file's own header note, but
  not yet individually confirmed bug-free.
- **Notable high outliers needing a real-bug check first**: Lucilla
  (40.03x), Roccia (8.80x), Sanhua (9.04x), Hiyuki (12.71x), Aemeath
  (6.72x), Iuno (6.46x). A 40x gap in particular is far outside "engine is
  more precise" territory and much likelier to be a real double-count,
  missing cooldown/ICD gate, or a rotation-step mismatch (e.g. a hit
  firing far more often in the derived steps than the real combo intends).

**Next**: Stage 2 — triage the outliers above first (they're the ones most
likely to hide a genuine bug rather than intended precision gain), then
work down through the mid-range cluster.

## Stage 2 result — root cause found: no sequence-level gating anywhere in the engine

Investigated Lucilla's 40.03x outlier first (the most extreme). Her
`lucilla.chain.s6` block grants `basicDmg +600` AND `echoDmg +600`,
unconditionally, as `trigger: 'passive'` — same as every OTHER chain block
(S1–S6) in every converted character's `.blocks.js` file. `resolveHitComposedDps`
has no concept of "which Resonance Chain nodes this character actually owns"
at all — every chain block simply always fires, as if every character were
fully R6-awakened.

`calcTeamStats.js`'s legacy path, by contrast, gates through
`applyResonanceChain(stats, charName, seqLevel, isMainDps)`
(`calcEngine.js:622-624`): `if (!rc || seqLevel <= 0) return 0;` — with no
sequence explicitly equipped (this harness's solo teams, and any real
player who hasn't built a character's chain), `seqLevel` defaults to `0`,
so the legacy RAW tier applies **zero** chain bonus. The engine applies
**all six**, unconditionally, always.

**Quantified on Lucilla**: stripping her `lucilla.chain.*` blocks (S0
baseline, matching what an unbuilt character should get) drops her engine
dps from 11946 → 1772 — her ratio falls from 40.03x to ~4.1x, landing right
in the middle of the roster's normal cluster.

**Confirmed as the same root cause across all 6 flagged outliers** — every
one has a large, unconditional, high-tier chain bonus:
- Iuno: S6 `heavyDmg +1600` (unconditional)
- Hiyuki: S6 `critDmg +500`
- Roccia: S6 `defIgnore +60`, S5 `libDmg +20`/`heavyDmg +80`
- Sanhua: S5 `critDmg +100`
- Aemeath: S1 `critDmg +300`, S3 `libDmg +100`/`critDmg +60`
- Lucilla: S6 `basicDmg +600`/`echoDmg +600` (the extreme case above)

This is not six separate bugs — it's **one missing engine feature**:
TriggerBlock's schema has no field for "the minimum owned Resonance Chain
sequence this block requires," and none of `resolveHitComposedDps`/
`resolveSimulatedTeamRotation`/`simulateRotation` take a sequence-level
input to gate against. It's also very likely a major (not sole) contributor
to the general elevated median (3.13x) across the WHOLE roster, not just
the 6 flagged outliers — every character in this sweep got free S1-S6
whether or not their engine-side chain-derived bonus was individually large
enough to make them an "outlier." The remaining ~4x baseline even in
Lucilla's S0-stripped case suggests a second, smaller, still-unidentified
factor beyond chain-gating (candidates: `rawRotTime`'s field-time-capped
window vs. the engine's full real-combo-length steps use different time
denominators; a real per-hit sum legitimately exceeding a flat "sustained
average" totalMult by design) — worth re-measuring once Stage 3 adds
sequence gating and the harness can re-run at a true, comparable S0
baseline across the whole roster, not just this one hand-checked case.

**Stage 3, revised priority**: add sequence-level gating as the FIRST closed
gap (ahead of DOT/energy-cycle/order-search from Stage 0 — this one affects
literally every character's number, all the time, not just specific
mechanics). Concretely: add `trigger.requiresSequence: N` (or an equivalent
block-level field) to chain blocks during a follow-up pass over every
`.blocks.js` file's `chain.s1`..`chain.s6` entries (numbered by their own id
suffix, so N is mechanical to derive — `s3` → `requiresSequence: 3`, etc.),
then thread a `sequence` parameter through `resolveHitComposedDps`/
`resolveSimulatedTeamRotation`/`simulateRotation` to gate on it, mirroring
`applyResonanceChain`'s own `s <= Math.min(seqLevel, 6)` loop exactly. Only
once that's done does re-running this Stage 1/2 harness produce a genuinely
apples-to-apples S0 (and, ideally, parameterized S1-S6) comparison.

## Stage 3, item 1 — sequence-level gating (done, 2026-09-01)

Implemented as a DERIVED convention rather than hand-editing ~300 chain
blocks across 56 files (verified via a full grep sweep that every single
converted character's chain block id already matches `<char>.chain.sN` or
`<char>.chain.sN-<suffix>`, N always 1-6, zero exceptions — a
`sequenceGating.test.js` test asserts this convention holds, so any future
character conversion that breaks it fails loudly rather than silently
un-gating):

- **`engine/sequenceGating.js`** (new): `requiredSequenceOf(block)` derives
  the required sequence from `trigger.requiresSequence` if explicitly set,
  else from the `chain.sN` id pattern, else `0` (always available).
  `sequenceAllows(block, sequence)` and `gateBlocksBySequence(blocks,
  sequence)` — `sequence == null` never gates (backward-compatible default),
  an explicit `0`-`6` actually filters, mirroring
  `applyResonanceChain`'s own `Math.min(seqLevel, 6)` semantics exactly.
  10 tests, including the full-roster convention check.
- **`resolveHitComposedDps`**: added an 8th param, `sequence = null`. Gates
  `blocks` at entry via `gateBlocksBySequence`. Every existing caller that
  doesn't pass it is unaffected (confirmed: full suite unchanged before this
  param existed vs. after, 1065/1065 either way).
- **`resolveSimulatedTeamRotation`**: added `opts.sequenceByOwner` (a
  `{name: seqLevel}` map) — a member missing from the map isn't gated,
  same no-gating-by-default pattern.

**Stage 1 harness re-run at a TRUE apples-to-apples S0 baseline** (passing
`sequence: 0` explicitly, matching `calcTeamStats()`'s own default for an
unbuilt character): the whole-roster distribution collapsed dramatically —

| | before (chain unconditional) | after (gated at S0) |
|---|---|---|
| min | 0.056 | 0.044 |
| max | 40.03 (Lucilla) | 8.01 (Lucilla) |
| median | 3.13 | 2.03 |
| mean | 4.20 | 2.34 |

Confirms Stage 2's hypothesis was correct and now quantified precisely: the
missing sequence gate was the dominant systemic driver of the whole
roster's inflation, not just the 6 flagged outliers. Lucilla remains the
single highest outlier post-fix (8.01x, ~4x the new median) — a real,
smaller residual worth one more look in a future Stage 2/3 pass (candidate
cause: `lucilla.basic.oblivion` shares the exact same `trigger.on` as
`lucilla.basic.tracing-forms`, so both fire together on every occurrence of
that rotation step — plausible as intentional per the block's own note, but
not yet independently confirmed against how often that step actually
recurs in her real `CHARACTER_ROTATIONS` sequence). Not blocking further
Stage 3 work — logged here so it isn't lost.

**Update (Stage 4 kickoff, 2026-09-01)**: independently confirmed — see the
"Stage 4 kickoff — Lucilla's 8.01x individually confirmed" section further
down. The candidate cause above was ruled out (that rotation step occurs
only once in her real `CHARACTER_ROTATIONS`, so both blocks fire once, not
duplicated); the real driver is the same `totalMult`-heuristic-vs-real-sum
root cause as the roster median, compounded by her unusually short 5s
`onField` allocation. Case 1 (documented improvement), not a bug.

Full suite: 1065/1065 passing. `calcTeamStats.js` untouched throughout
(confirmed via `git diff --stat`).

**Next**: Stage 3's remaining items from the Stage 0 table — DOT reactions,
energy-cycle-gated Liberation uptime, the rotation on-field order-search,
and Coordinated ATK off-field snapshot semantics. None of these are
individually as roster-wide-impactful as sequence gating was, but Stage 4's
rewrite can't start until each is closed or explicitly descoped.

## Stage 3, item 2 — DOT reactions (done, 2026-09-01)

Frazzle/Erosion/Fusion Burst/Electro Flare/Tune Break's real math (ICD-aware
stack/tick tables, hand-verified against the wiki per each function's own
audit comment) already lives correctly in calcEngine.js
(`calcFrazzleDmg`/`calcErosionDmg`/`calcFusionBurstDmg`/`calcElectroFlareDmg`/
`calcTuneBreakDmg`). Re-deriving that from scratch as TriggerBlocks would
mean rebuilding already-correct formulas for no benefit — so this item gets
the SAME treatment Stage 0's table already prescribed for gear ("stays
composed around the engine, not ported into TriggerBlocks"), not a
TriggerBlock port.

- **`engine/dotReactions.js`** (new): `resolveDotReactionDps(members,
  rotTime, defMult, resShred, getEnemyRes, mainResMult, energyCycleFactors)`
  composes all five calcEngine.js DOT functions, routing each reaction's RES
  from the enemy's RES to ITS OWN fixed element (Frazzle=Spectro,
  Erosion=Havoc, Fusion Burst=Fusion, Electro Flare=Electro) exactly like
  `calcTeamStats.js:941-953` already does — Tune Break has no single
  canonical element and keeps using the caller's own `mainResMult`, same as
  legacy. Returns `{totalDmg, dps, tuneBreakDeepenMult, breakdown}` so
  Stage 4's rewrite can call one function instead of hand-wiring five.
- **`rotTimeFromSteps(ownedSteps)`** (new, same file): sums a team step
  list's `stepSeconds` (defaulting missing entries to `DEFAULT_STEP_SECONDS`,
  same convention `resolveSimulatedTeamRotation.js`/
  `resolveHitComposedTeamDps.js` already use per-member) — gives Stage 4 an
  engine-derived rotation time to pass in, rather than requiring
  `calcTeamStats.js`'s own `rawRotTime` formula specifically.
- **`dotReactions.test.js`** (new, 6 tests): proves the composition is exact
  (byte-identical to calling the five calcEngine.js functions directly, per
  the same per-element RES routing) and that `rotTimeFromSteps` matches the
  sum-of-stepSeconds convention, plus edge cases (no DOT-applying members,
  zero rotTime doesn't produce NaN/Infinity).

Full suite: 1071/1071 passing (74 files). `calcTeamStats.js` untouched
throughout (confirmed via `git diff --stat`).

**Next**: Stage 3's remaining 3 items — energy-cycle-gated Liberation
uptime, the rotation on-field order-search, and Coordinated ATK off-field
snapshot semantics.

## Stage 3, item 3 — energy-cycle-gated Liberation uptime (done, 2026-09-01)

`calcEnergyCycles` (calcEngine.js:583-619) already derives each character's
real total ER (weapon/echo substats + set bonuses) and compares it against a
role-specific threshold to produce `libUptime` (1.0 once cleared, floored at
0.6 otherwise) — that formula was never the gap. The gap was that
`resolveHitComposedDps`/`resolveHitComposedTeamDps` had no concept of "this
hit came from Liberation" at all, so every Liberation-derived hit fired at
full strength regardless of the character's real ER investment.

- **`engine/energyCycleGating.js`** (new): `libUptimeOf(energyCycleFactors,
  name)` — a small lookup over `calcEnergyCycles()`'s own output, returning
  `null` (no gating) for a missing character/map, same no-gating-by-default
  convention as `sequenceGating.js`.
- **`resolveHitComposedDps`**: added a 9th param, `libUptime = null`. Only
  hits whose `damage.category`/`proc.category === 'libDmg'` are scaled by
  it — every other hit is untouched regardless of value. Omitting it (the
  default) leaves every existing caller byte-identical to before this param
  existed.
- **`resolveHitComposedTeamDps`**: added `opts.libUptime`, same semantics,
  scoped to `targetName`'s own Liberation-sourced hits only.
- This is deliberately a MORE PRECISE gate than calcTeamStats.js's own
  `mult * (1 - libShare*(1-libUptime))` (calcTeamStats.js:973-978): legacy
  has no per-source damage split, so it approximates "the Liberation
  portion" as a flat 20%/35% share of the character's WHOLE totalMult. The
  engine already tracks each hit's real category, so it discounts exactly
  the Liberation-sourced hits instead of guessing a share of everything —
  same "documented improvement, not a behavior change to match" treatment
  Stage 3 item 1 established for Resonance Chain `target.scope` precision.
- **`energyCycleGating.test.js`** (new, 8 tests): `libUptimeOf`'s lookup/
  no-gating-by-default behavior; the gate is opt-in/backward-compatible;
  it scales ONLY the libDmg-category block, proportionally, leaving a
  non-Liberation hit at the same instant untouched; `libUptime: 0` zeroes
  Liberation damage entirely; the team-level `opts.libUptime` variant.

Full suite: 1079/1079 passing (75 files). `calcTeamStats.js` untouched
throughout (confirmed via `git diff --stat`).

**Next**: Stage 3's remaining 2 items — the rotation on-field order-search,
and Coordinated ATK off-field snapshot semantics.

## Stage 3, item 4 — Coordinated ATK off-field snapshot semantics (done, 2026-09-01)

This name covers TWO separate legacy mechanics, duplicated verbatim between
calcTeamStats.js's RAW tier (:531-540) and FULL tier (:984-993, :1024-1090):

1. **The coord/field-time mult blend** — a Coordinated ATK sub-DPS's own
   damage-share blends a "coordinated" portion (scales with the MAIN DPS's
   own on-field uptime) and an ordinary on-field portion (scales with this
   character's own field-time ratio): `mult * (coordShare*coordUptime +
   (1-coordShare)*fieldRatio)`.
2. **The buff-snapshot discount** — an off-field Coordinated ATK character
   doesn't receive a support's outro buff if that support swaps in AFTER
   them (they already left); legacy applies a flat 0.6 discount specifically
   to buffs targeted `'next'` (calcTeamStats.js:1046-1052), while leaving
   whole-team/continuous buffs like libBuffs undiscounted (:1081-1089 has no
   discount at all).

- **`engine/coordinatedAtk.js`** (new): `coordinatedMultShare({coordShare,
  coordUptime, fieldRatio})` factors out mechanic 1's formula (identical in
  both legacy tiers) for Stage 4 reuse — pure math, no new engine mechanism
  needed. `COORD_SNAPSHOT_DISCOUNT = 0.6` is legacy's exact constant.
- Mechanic 2 maps directly onto the engine's EXISTING scope vocabulary:
  legacy's `'next'`-target outro buffs are exactly what `target.scope:
  'next-on-field'` already models (only reaches the team member immediately
  after the buff's source), while legacy's undiscounted continuous buffs are
  `target.scope: 'whole-team'`. So no new mechanism was needed here either —
  just an opt-in `coordSnapshotDiscount` boolean on
  `resolveSimulatedTeamRotation`/`resolveHitComposedTeamDps` that multiplies
  a `'next-on-field'`-scoped block's contribution by `COORD_SNAPSHOT_DISCOUNT`
  when set, and leaves `'whole-team'` blocks (and everything else) alone —
  same no-gating-by-default pattern as sequence/libUptime gating.
- **`coordinatedAtk.test.js`** (new, 6 tests): `coordinatedMultShare` matches
  calcTeamStats.js's formula exactly for both pure-coord and hybrid kits;
  `coordSnapshotDiscount` is opt-in/backward-compatible on both functions and
  discounts by exactly 0.6 when set, verified against Augusta's real
  `augusta.outro.battlesong` block (`elemDmg +15`, `next-on-field`).

Full suite: 1085/1085 passing (76 files). `calcTeamStats.js` untouched
throughout (confirmed via `git diff --stat`).

## Stage 3, item 5 — the rotation on-field order-search (done, 2026-09-01) — Stage 3 complete

calcTeamStats.js's own rotationTimeline IIFE (calcTeamStats.js:153-462) does
two things: (a) brute-forces every permutation of supports (Main DPS always
last) and scores each by how much cross-character buff value survives to
the instant the Main DPS's own on-field window opens, keeping the highest
(ties keep the original team-wide-outro-first/strongest-next-outro-last
heuristic order); (b) renders the result as the Rotation Guide's display
blocks. Its own in-file comment claims this "cannot change the real DPS
number, only which ordering the Rotation Guide presents" — checked against
the rest of the file and found stale: `rotSegByName` (calcTeamStats.js:
475-476) is built directly from this same rotationTimeline, and
`overlapUptimeForSeg` (fed by `rotSegByName` via `outroStart`/`blockStart`)
is what every cross-character buff-uptime figure in the FULL tier actually
uses — the file's own nearby comment on that function even cites a
quantitative audit finding "43.5% [of cross-character buffs] collapse to
exactly zero" once real ordering is accounted for. So the search's chosen
order IS load-bearing for the real number, confirming Stage 0's original
flag that an engine equivalent is required before Stage 4's rewrite, not
just cosmetic Rotation-Guide parity.

- **`engine/rotationOrderSearch.js`** (new): `chooseOnFieldOrder(members,
  mainDpsName)` — same brute-force-permutation-then-score structure as
  legacy, re-expressed against the engine's real primitives instead of
  CHAR_BUFF_TABLE's flat buff list: `buildTeamSteps`/`simulateTeamRotation`
  actually simulate each candidate order, then `buildBlockWindows`/
  `activeCountAt` (the same "was this buff live at this exact instant"
  primitive `resolveHitComposedTeamDps.js` already uses) answer legacy's
  `scoreOrder` question — is a cross-character (`source !== mainDpsName`),
  continuous, team-reaching (`target.scope` `'whole-team'`/`'next-on-field'`)
  block still active when the Main DPS's own segment starts — summing each
  qualifying block's effect values, matching legacy's `Math.abs(b.value||0)`
  sum exactly. No new simulation machinery — pure search+score composed on
  top of what Phase 2/3 already built and trusts.
- **`rotationOrderSearch.test.js`** (new, 5 tests): Main DPS always placed
  last; a solo team's own trivial single-member order; `null` for an absent
  mainDpsName; the chosen `ownedSteps`/`blocksByOwner` genuinely match
  `buildTeamSteps` run on the chosen order (not a stale/mismatched pair);
  and the one load-bearing behavioral test — Rover: Electro's real
  `'next-on-field'` outro block reaches nobody in the naive input order
  (Augusta, Yinlin, Rover: Electro — Yinlin isn't immediately after him),
  but the search correctly finds the reordering that puts him right before
  Yinlin instead, scoring strictly higher.

Full suite: 1090/1090 passing (77 files). `calcTeamStats.js` untouched
throughout (confirmed via `git status`/`git diff --stat`) — **this closes
Stage 3 in full**. Stage 4 (the actual rewrite) and Stage 5 (final
verification + commit) are next, per this plan's own ordering.

## Stage 1 — Parity harness

Extend `verifyEngineAgainstCalcTeamStats.test.js` (currently scoped to one
buff-uptime formula on one 3-member team) into a real harness:
- Run across every character with a `.blocks.js` file (all 52) in varied
  team compositions (solo-role sanity teams, then random real 3-member
  teams), each with representative equipment (a real weapon + real echo
  build, not empty slots — empty-slot teams degenerate the comparison to
  near-zero on both sides and prove nothing).
- Compute the engine's own `teamDps` (composing `resolveHitComposedDps` for
  each member's real per-hit damage + `resolveSimulatedTeamRotation` for
  cross-character buff uptime, summed the same way `calcTeamStats.js`'s
  `grandTotal`/`teamDps` is) and diff it against `calcTeamStats()`'s real
  `teamDps` for the same team/equipment.
- Log every divergence with its magnitude and suspected cause, not just
  pass/fail — Stage 2 consumes this list directly.

## Stage 2 — Triage divergences

For each logged divergence, classify as:
1. **Expected, documented engine improvement** — e.g. the existing test
   file's own note that the engine's `target.scope` precision is expected to
   diverge from `applyResonanceChain`'s blanket-apply legacy heuristic. These
   get written up, not "fixed" — the engine number is correct on purpose.
2. **Real engine gap** — a mechanic from the Stage 0 table with no engine
   model yet, or a converted character's blocks that miss something the
   legacy table has (re-check against that character's own audit comment).
3. **Genuine bug in either side** — fix wherever the bug actually is.

No case gets waved through without one of these three labels and a one-line
justification recorded here or in commit messages.

## Stage 3 — Close real engine gaps

Build out whatever Stage 2 requires: DOT-reaction TriggerBlocks or a
composed-in-parallel calcEngine.js reuse (gear-side mechanics likely stay as
direct calcEngine.js calls composed around the engine rather than becoming
TriggerBlocks themselves — echo/weapon data isn't character-kit data and
doesn't belong in `.blocks.js` files), the rotation order-search ported to
operate on engine-derived per-member timing, energy-cycle gating applied to
`resolveHitComposedDps`'s Liberation-derived hits, etc. Each addition gets
its own test before Stage 1's harness re-run.

## Stage 4 kickoff — root-causing the residual ~2x median gap (done, 2026-09-01)

Before touching the live file, root-caused the harness's still-unexplained
roster-wide median (2.03x engine/legacy, unchanged since Stage 3 item 1 —
flagged there as "a second, smaller, still-unidentified factor" and never
followed up). Rewriting `calcTeamStats.js` while that gap stayed
unexplained would have silently changed every player's displayed team score
by up to ~2x (8x for Lucilla) with no way to tell a real precision gain from
a bug — exactly the class of regression this whole phase exists to prevent,
so this had to be resolved BEFORE any rewrite, not after.

**Hypothesis 1 (partially right, not the driver): timing-window mismatch.**
`calcTeamStats.js`'s `rawRotTime` (`max(15, min(35, sumOnField+2))`, a
field-time-based window) and the engine's own `totalTime`
(`deriveStepsFromRotation`'s single non-repeating pass through
`CHARACTER_ROTATIONS`, paced at a flat `DEFAULT_STEP_SECONDS=1.5`/step) use
different denominators. Hand-verified on 7 characters
(Danjin/Camellya/Changli/Xiangli Yao/Lingyang/Hiyuki/Galbrena): the two
windows genuinely differ (ratio 0.97x-2.0x depending on rotation step
count), and for characters where `engine.totalTime < legacy.rotTime` this
does inflate the engine's dps. But it doesn't correlate with the total
ratio closely enough to be the dominant driver (e.g. Xiangli Yao/Hiyuki have
`timingRatio≈0.97` — engine's own window is if anything SLIGHTLY LONGER
than legacy's — yet still show a ~2x total ratio), so this is a real,
independent, smaller effect, not the explanation.

**Hypothesis 2 (real bug, fixed, but near-zero measured impact today):
missing cross-loop cooldown throttling.** `resolveHitComposedDps`'s
`totalDamage/totalTime` implicitly assumes every hit in the single derived
pass repeats every `totalTime` seconds forever — correct only for a hit
whose own cooldown is `<= totalTime`. Confirmed on Xiangli Yao: his
Liberation "Cogitation Model" is 1466.06% ATK with a real 25s cooldown
(`characters.js` SKILL_MULTIPLIERS row, `'25s cooldown'` in its own note
text) landing inside a derived pass only ~19.5s long — the engine credits
it every 19.5s instead of its real 25s cadence, a genuine over-count. Fixed
via a new opt-in `cooldownSteadyState` param on
`resolveHitComposedDps`/`resolveHitComposedTeamDps` (scales a block whose
`timing.cooldown` exceeds the pass/field-duration by
`min(1, duration/cooldown)`) — correct, tested (6 new tests in
`cooldownSteadyState.test.js`), and worth keeping for Stage 4. But re-running
the Stage 1 harness with it enabled moved the roster-wide median/mean by
**less than 0.03** (2.03x → 2.03x median, 2.34x → 2.31x mean): almost every
converted character's `damage.hits` blocks have `timing: {}` — no
`timing.cooldown` value populated at all (Yinlin's Liberation block, the one
this fix was tested against, is one of the few exceptions) — so the fix is
real but currently has almost nothing to gate. Populating real cooldowns
onto every damage block across all 56 characters is a large, separate
data-authoring task, not a Stage 4 blocker in itself (the gate is a no-op
until that data exists, same "opt-in, byte-identical when unset" contract
every other Stage 3 gate uses).

**Root cause (confirmed): `totalMult` was never meant to equal a real
per-hit sum.** `characters.js`'s own ROTATION_DATA section header
(`characters.js:1374-1378`) defines it plainly: *"totalMult: sum of ATK%
multipliers in one full rotation (all skills used)... Sources: Prydwen,
WutheringLab, community rotation testing"* — a **hand-authored heuristic
table**, entered per-character from community power-ranking/build-guide
impressions, not derived from `SKILL_MULTIPLIERS`' own real, verified
per-skill percentages at all. A nearby fix comment on the same table
(`characters.js:1396-1404`, the Cartethyia HP-scaling correction) confirms
this directly: fixing her `totalMult` to stop reusing an ATK%-calibrated
heuristic number "made her auto-calculated teamDps ~5x every other top-tier
DPS" before the fix — i.e. this table's own entries are acknowledged
(elsewhere in the same file) to have been wrong by multiples before,
independent of anything Phase 2/3 touches. The engine, by contrast, sums
`SKILL_MULTIPLIERS`' real per-skill values (e.g. Xiangli Yao's Liberation
alone is a verified 1466.06%, not a share of a single "totalMult: 2900"
heuristic spread across 13 hits) — genuinely more precise data, not a
different opinion about the same data.

**Conclusion, per Stage 2's own 3-way classification**: the roster-wide
elevated median is **Case 1 — expected, documented engine improvement**,
not Case 2/3 (a real engine gap or a bug to fix). This closes the "still-
unidentified factor" Stage 3 item 1 left open and satisfies Stage 4's own
precondition ("every remaining diff is Stage-2-labeled as an intentional
improvement") for the residual median gap specifically. It does NOT mean
every individual character's ratio is automatically fine — Lucilla's 8.01x
(the single largest outlier, already flagged in Stage 3 item 1 as not yet
independently confirmed) and any other outlier substantially above the new
~2x baseline still warrant a per-character look during Stage 4, the same
way Stage 2 triaged the original 6 outliers individually rather than waving
off the whole roster at once.

## Stage 4 kickoff — Lucilla's 8.01x individually confirmed (done, 2026-09-01)

Per Stage 2's own precedent (triage every outlier individually, don't wave
the whole roster off at once), checked Lucilla's 8.01x — the single largest
outlier, ~4x the new roster median — before starting the rewrite.

**Ruled out the specific candidate cause Stage 3 item 1 had flagged**:
`lucilla.basic.oblivion` and `lucilla.basic.tracing-forms` do share the
exact same trigger (`Basic ATK:Tracing Forms Stage 1-3`), but
`CHARACTER_ROTATIONS['Lucilla']` only contains that step ONCE
(`characters.js:4442`) — both blocks fire exactly once per solo pass, not
duplicated across repeated occurrences. Not a double-count bug.

**Real explanation, confirmed via a hit-by-hit breakdown** (real weapon
Freeze Frame + Wishes of Quiet Snowfall echo set, matching the harness's own
gear inference): every block fires exactly once, each contributing a
plausible, SKILL_MULTIPLIERS-accurate share of the 36407 total —
`lucilla.basic.oblivion` (10376, from 3×285.48%) and
`lucilla.basic.letting-it-go` (10274, from 84.81%×3+593.64%) alone account
for well over half; nothing resembles an engine artifact. The actual driver
is the SAME root cause as the roster median, compounded by Lucilla's
specific role data: her `totalMult` heuristic is only **700**
(`characters.js:1458`) against an **`onField` of just 5s** — both
dramatically lower than a typical Main DPS's 2200-3400/14-19s, because her
real kit is a brief-window Ultimate/buffer burst, not sustained on-field
damage. The engine's solo harness (per Stage 0's own design) runs her FULL
`CHARACTER_ROTATIONS` pass (Intro→Skill→Liberation→Basic combo→Outro,
~10.5s derived) exactly like every other character gets — over DOUBLE her
real 5s on-field allocation — while her `totalMult=700` was hand-calibrated
assuming she's realistically credited for only that short window. Two
compounding factors, both Case 1 (documented heuristic conservatism, not a
bug): the general totalMult-vs-real-sum gap every character has, PLUS an
unusually large legacy-side discount specific to her short-onField Sub-DPS/
buffer role.

**Conclusion**: Lucilla's 8.01x is independently confirmed as Case 1, same
classification as the roster median — closes the one open item Stage 3
item 1 left flagged. No further engine gap or bug found for her specifically;
nothing here blocks starting the actual Stage 4 rewrite.

**Practical consequence for the rewrite**: Stage 4 should NOT aim for
numeric parity with legacy's `rawDps`/`teamDps` — that was always the wrong
bar (this file's own header note said so from the start). The verification
bar is: no consumer breaks, the external return shape stays intact, and any
per-character ratio that's an outlier even against the new engine-wide
baseline gets the same individual triage Stage 2 gave Lucilla/Roccia/etc.,
not a blanket "engine is always right" assumption either.

## Stage 4 — Rewrite `calcTeamStats.js`

Only once Stage 1's harness is green (or every remaining diff is Stage-2-
labeled as an intentional improvement) does the actual rewrite happen:
replace the internal computation with engine calls while preserving the
exact external return shape (`members, mainDps, effAtk, critRate, critDmg,
elemDmg, skillDmg, ..., teamDps, memberDps, rotationTimeline, warnings, ...`)
so every consumer (`DamageCalculator.jsx`, `TeamsTab`, `DPSComparisonCard`,
`RotationTimeline.jsx`) keeps working unchanged.

### Stage 4 reconnaissance (done, 2026-09-01) — consumer contract, risk check, phased plan

Before writing a single line of the rewrite: mapped every real consumer of
`calcTeamStats()`'s return object, and measured (not guessed) the one
concrete risk that actually mattered — engine-call performance in the
autoEquip search loop.

**Consumer contract — every field actually read outside `calcTeamStats.js`**
(grepped field-by-field across every importer; anything not listed here is
internal-only and can change shape freely without breaking a consumer):

| Field | Consumers |
|---|---|
| `members` | `DamageCalculator.jsx`, `TeamsTab.jsx`, `autoEquip.js`, `DPSComparisonCard.jsx` |
| `mainDps` | `DamageCalculator.jsx`, `DPSComparisonCard.jsx`, `RotationGuideCard.jsx` |
| `allBuffs`, `allDebuffs` | `DamageCalculator.jsx` (buff/debuff list display) |
| `effAtk`, `critRate`, `critDmg`, `elemDmg`, `skillDmg`, `amplify`, `deepen`, `atkPct`, `defShred`, `resShred`, `defIgnore`, `avgCrit` | `DamageCalculator.jsx` (stat breakdown panel); `critRate`/`critDmg`/`elemDmg`/`skillDmg`/`atkPct` also read directly by `characterCardRenderer.js`; `effAtk`/`critRate`/`critDmg`/`elemDmg`/`amplify`/`defShred`/`resShred` also read by `DPSComparisonCard.jsx` |
| `score` | `TeamsTab.jsx`, `autoEquip.js` (team-suggestion ranking) |
| `soloDps` / `rawDps` (alias) | `DamageCalculator.jsx`, `DPSComparisonCard.jsx` |
| `teamDps` / `realDps` / `perfectDps` (aliases) | `DamageCalculator.jsx`, `TeamsTab.jsx`, `autoEquip.js`, `DPSComparisonCard.jsx` — `autoEquip.js`'s `teamDps` read is the hottest path (see perf check below) |
| `synergyUplift` / `synergy` (alias, clamped) | `DamageCalculator.jsx`, `DPSComparisonCard.jsx` |
| `dmgSources` | `DamageCalculator.jsx` (rotation/echo/DOT split bars) |
| `warnings` | `DamageCalculator.jsx` (warning list) |
| `memberDps` | `DamageCalculator.jsx` (per-member damage breakdown) |
| `rotationTimeline` | `DamageCalculator.jsx`, `CharacterDetailModal.jsx` (solo Rotation Guide reuses this exact shape) |
| `rotTime` | `DPSComparisonCard.jsx` |
| `dotDps`, `hasFrazzle`, `hasErosion`, `hasFusionBurst`, `hasElectroFlare`, `energyCycleFactors`, `defMult`, `resMult` | **No consumer found outside `calcTeamStats.js` itself** — free to reshape/rename/drop without touching any component, as long as `dmgSources`/`warnings` (which are internally derived from some of these) keep producing their own documented shape |

**Performance check (measured, not assumed)**: `autoEquip.js`'s
`pickBestTeamForEnemy`/`computeAutoEquipEntryOptimized` call `calcTeamStats`
in a search loop — potentially 50-100+ calls per "Auto Team" invocation
(candidate teams × echo-preset trials). This was the one plausible reason
NOT to do a straight cutover (a per-hit engine simulation is real work
compared to legacy's flat arithmetic multiply). Benchmarked directly:
legacy `calcTeamStats` (solo, 3-member team) averages **0.150ms/call**;
the engine-composed equivalent (`buildTeamSteps` +
`resolveHitComposedTeamDps` per member) averages **0.467ms/call** — ~3.1x
slower, but still sub-millisecond. Even at the search loop's worst realistic
volume (~100 calls, plus `chooseOnFieldOrder`'s own up-to-6x internal
permutation cost per call), total added latency is on the order of a few
hundred ms, not the multi-second UI freeze that would have been a real
blocker. **Verdict: performance is not a blocker** — worth a final sanity
check with real profiling once the rewrite lands (not a guess this time
either), but not a reason to delay or design around.

**Remaining wiring pieces** (not new engine gaps — Stage 3 closed all of
those — just plumbing the rewrite itself has to do, per Stage 0's original
"stays gear-side, composed around the engine" conclusion):
- Weapon passives / echo set bonuses / echo substat rolls / shield-gated DEF
  Ignore / 4-cost echo active-skill buffs: stay direct `calcEngine.js` calls
  (`getWeaponPv`, `applyFullEchoSet`, `applyEchoStats`, `gateWeaponDefIgnore`,
  `ECHO_SKILL_BUFFS` lookup) composed into each member's `externalStats`
  delta — exactly the pattern the Stage 1 harness's own
  `rawTierGearStats()`/`toExternalStatsDelta()` helpers already prove works.
- `warnings` and `synergyUplift`: presentation-layer logic reading team
  composition/`energyCycleFactors`/enemy RES, not DPS math — ports with
  effectively unchanged logic once `teamDps`/`soloDps` come from the engine.
- `dmgSources` (rotation/echo/DOT % split): a simple ratio of already-being-
  computed totals (engine `teamDps` contribution, echo active-skill damage,
  `dotReactions.js`'s `totalDmg`) — no new computation, just re-pointing the
  three inputs at their engine-composed sources.

**Proposed phased implementation (each its own commit, tested before the
next, per this project's standing "1 by 1, full precision" rule — NOT
attempted as one 1365-line diff)**:
1. **Solo/RAW tier first** — replace `soloDps`/`rawDps` with
   `resolveHitComposedDps` + gear `externalStats` + `sequence`. Lowest
   blast radius (feeds `DPSComparisonCard`'s solo column and
   `synergyUplift`'s denominator, nothing else yet); the Stage 1 harness
   already IS this slice's test.
2. **Team/FULL tier** — replace `teamDps`/`memberDps`/per-member stat
   breakdown with `chooseOnFieldOrder` (or a given order when
   `rotationOrderSearch` isn't warranted) → `resolveSimulatedTeamRotation` +
   `resolveHitComposedTeamDps` per member, `libUptime`/`coordSnapshotDiscount`
   wired per member's real role/focus. This is the actual cutover — every
   other consumer (`TeamsTab`, `autoEquip`, `DamageCalculator`'s main
   numbers) starts reading engine-derived `teamDps` here.
3. **DOT + `dmgSources`** — wire `dotReactions.js`'s `resolveDotReactionDps`
   in, re-derive the 3-way split.
4. **`rotationTimeline`** — re-derive from the engine's own chosen order +
   real block windows instead of the legacy hand-built segments/buffs
   arrays; verify `CharacterDetailModal.jsx`'s solo Rotation Guide (which
   reuses this exact shape) still renders.
5. **`warnings`** — port with energyCycleFactors/RES logic unchanged.
6. Delete the now-dead legacy code paths (`applyResonanceChain`,
   `overlapUptimeForSeg`'s calling code, the RAW/FULL tier duplication,
   the inline permutation search) — only after 1-5 are individually green,
   not before, so a revert of any single step stays cheap.

Each step gets its own before/after check against the full test suite
(1096 as of this recon) plus a manual pass through `DamageCalculator.jsx`
in the browser (per this project's own UI-verification standard) before
moving to the next step — no step ships on "the diff looks right."

**Decided (user, 2026-09-01)**: ship each phased step directly to `main` as
the live number, no feature-flag staging — Auto Team/Auto Equip's own perf
question is deliberately deferred to be looked at once the whole rewrite is
done, not per-step.

### Stage 4, step 1/6 — RAW tier (`soloDps`/`rawDps`) (done, 2026-09-01)

Replaced the RAW tier's per-member flat `totalMult%` formula with a real
`resolveHitComposedDps` call (gear composed into `externalStats` from the
SAME `rStats` object the legacy path already built — handed over BEFORE
`routeTypeBonuses` flattens it, since the engine reads
basicDmg/heavyDmg/libDmg/echoDmg/coordDmg by their own real per-hit category
and doesn't need that legacy-only flattening at all; `sequence` from the
member's own equipped Resonance Chain; `cooldownSteadyState: true` per the
Stage 4 kickoff root-cause finding) for any character with both a converted
`.blocks.js` and a `CHARACTER_ROTATIONS` entry. Falls back to the unchanged
legacy formula otherwise (currently only Jingran, unreleased).

- **`engine/characterBlocks/index.js`** (new): `BLOCKS_BY_CHARACTER`, a
  production name -> `TriggerBlock[]` registry — this mapping only existed
  before as a hardcoded array inside `phase3-parityHarness.test.js`,
  test-only. 57 entries (one per `.blocks.js` file), verified against
  `CHARACTER_DATA` for drift.
- The field-time/Coordinated-ATK discount (`coordinatedMultShare`) is
  computed once, as a plain 0-1 `fieldMultFactor`, and reused identically
  by both the engine and legacy branches — a character's realistic
  on-field time share doesn't depend on which formula produces their raw
  output, so this was factored out rather than duplicated a third time.
- 10 new tests across `characterBlocksIndex.test.js` (registry integrity)
  and `calcTeamStatsEngineRawTier.test.js` (solo/mixed-team/fallback/
  sequence-gating wiring, at the live `calcTeamStats()` level, not just the
  underlying engine primitives). Re-running the Stage 1 harness now shows
  ~1.000 ratios across the roster — expected and correct: the harness's
  "legacy" comparator IS this same code now, so it's validating the wiring
  stayed self-consistent, not an independent check anymore (small
  deviations like Yinlin's 1.027 come from `cooldownSteadyState`, which the
  harness itself still doesn't pass, being correctly live in production).

Full suite: 1104/1104 passing (80 files). Production build verified clean.

**Next**: step 2/6 — the Team/FULL tier (`teamDps`/`memberDps`), the actual
cutover every other consumer (`TeamsTab`, `autoEquip.js`,
`DamageCalculator.jsx`'s main numbers) starts reading from.

## Stage 5 — Final verification and commit

Re-run the full harness plus the existing full test suite (1065 tests as of
Stage 3 item 1; check the current count when this stage actually runs, it
will have grown), confirm no
consumer component broke (manual check of the Damage Calculator UI), then
commit. This is the only stage that touches the live file — everything
before it is additive (new tests, new engine code) and safe to land
independently, one commit at a time, one-by-one per this project's standing
"1 by 1, full precision" rule.

## Status

- [x] Stage 0 — coverage audit
- [x] Stage 1 — parity harness (all 56 converted characters swept; engine `externalStats` gap found+fixed; ratio distribution recorded, outliers flagged for Stage 2)
- [x] Stage 2 — triage (root cause found for all 6 flagged outliers: no sequence-level gating anywhere in the engine — one systemic gap, not six bugs; likely a major contributor to the whole roster's elevated median too)
- [x] Stage 3 — close gaps (item 1/5: sequence-level gating, roster-wide median 3.13x->2.03x, max 40.03x->8.01x; item 2/5: DOT reactions composed around the engine via engine/dotReactions.js; item 3/5: energy-cycle-gated Liberation uptime via engine/energyCycleGating.js's libUptimeOf() + a libUptime param on resolveHitComposedDps/resolveHitComposedTeamDps; item 4/5: Coordinated ATK off-field snapshot semantics via engine/coordinatedAtk.js's coordinatedMultShare() + a coordSnapshotDiscount option on resolveSimulatedTeamRotation/resolveHitComposedTeamDps; item 5/5: the rotation on-field order-search via engine/rotationOrderSearch.js's chooseOnFieldOrder() — ALL 5 ITEMS DONE)
- [x] Stage 4 kickoff — root-caused the residual ~2.03x median gap the Stage 1 harness never closed: confirmed via `characters.js`'s own ROTATION_DATA header comment that legacy `totalMult` is a hand-authored heuristic table ("sum of ATK% multipliers... Sources: Prydwen, WutheringLab, community rotation testing"), not derived from real `SKILL_MULTIPLIERS` data — Case 1 (expected, documented improvement) per Stage 2's own classification, not a bug. Also found and fixed a real (if currently low-impact, pending cooldown data) engine gap along the way: added an opt-in `cooldownSteadyState` param to `resolveHitComposedDps`/`resolveHitComposedTeamDps` so a long-cooldown hit landing once in a shorter derived pass doesn't get over-credited as if it recurs every pass.
- [x] Stage 4 reconnaissance — full consumer-contract map (every field read outside calcTeamStats.js, by which component), measured perf check (engine ~3.1x slower/call than legacy but still sub-ms — not a blocker for autoEquip.js's search loop), and a 6-step phased implementation plan (solo tier -> team tier -> DOT -> rotationTimeline -> warnings -> dead code removal), each step independently tested/committed
- [ ] Stage 4 — the actual rewrite (shipping cadence decided: each step lands directly on `main` as it's finished, not staged behind a flag; step 1/6 done — RAW tier/`soloDps`/`rawDps` now calls `resolveHitComposedDps` via new `engine/characterBlocks/index.js` registry, legacy fallback for not-yet-converted characters; steps 2-6 remaining)
- [ ] Stage 5 — final verify + commit

Work proceeds stage by stage; each stage's own sub-tasks are committed
individually rather than held until the whole phase is done, since only
Stage 4/5 touch the live file — everything earlier is purely additive.
