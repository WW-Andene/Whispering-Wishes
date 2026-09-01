# Phase 3 — Cut `calcTeamStats.js` over to the TriggerBlock engine

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

Full suite: 1065/1065 passing. `calcTeamStats.js` untouched throughout
(confirmed via `git diff --stat`).

**Next**: Stage 3's remaining items from the Stage 0 table — DOT reactions,
energy-cycle-gated Liberation uptime, the rotation on-field order-search,
and Coordinated ATK off-field snapshot semantics. None of these are
individually as roster-wide-impactful as sequence gating was, but Stage 4's
rewrite can't start until each is closed or explicitly descoped.

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

## Stage 4 — Rewrite `calcTeamStats.js`

Only once Stage 1's harness is green (or every remaining diff is Stage-2-
labeled as an intentional improvement) does the actual rewrite happen:
replace the internal computation with engine calls while preserving the
exact external return shape (`members, mainDps, effAtk, critRate, critDmg,
elemDmg, skillDmg, ..., teamDps, memberDps, rotationTimeline, warnings, ...`)
so every consumer (`DamageCalculator.jsx`, `TeamsTab`, `DPSComparisonCard`,
`RotationTimeline.jsx`) keeps working unchanged.

## Stage 5 — Final verification and commit

Re-run the full harness plus the existing 996-test suite, confirm no
consumer component broke (manual check of the Damage Calculator UI), then
commit. This is the only stage that touches the live file — everything
before it is additive (new tests, new engine code) and safe to land
independently, one commit at a time, one-by-one per this project's standing
"1 by 1, full precision" rule.

## Status

- [x] Stage 0 — coverage audit
- [x] Stage 1 — parity harness (all 56 converted characters swept; engine `externalStats` gap found+fixed; ratio distribution recorded, outliers flagged for Stage 2)
- [x] Stage 2 — triage (root cause found for all 6 flagged outliers: no sequence-level gating anywhere in the engine — one systemic gap, not six bugs; likely a major contributor to the whole roster's elevated median too)
- [ ] Stage 3 — close gaps (item 1/5 done: sequence-level gating, roster-wide median 3.13x->2.03x, max 40.03x->8.01x; remaining: DOT, energy-cycle gating, order-search, Coordinated ATK snapshot)
- [ ] Stage 4 — rewrite
- [ ] Stage 5 — final verify + commit

Work proceeds stage by stage; each stage's own sub-tasks are committed
individually rather than held until the whole phase is done, since only
Stage 4/5 touch the live file — everything earlier is purely additive.
