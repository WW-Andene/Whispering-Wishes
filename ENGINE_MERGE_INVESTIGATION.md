# Engine Merge Investigation — Legacy calcEngine/calcTeamStats vs Modern TriggerBlock Engine

Investigation date: 2026-09-04. Read-only research task; no code changed.

## 1. Where the legacy path is actually called from

`calcTeamStats.js` (`app/src/features/teams/calcTeamStats.js`) is the single live caller of the
legacy flat-table math (`applyResonanceChain`, `routeTypeBonuses`, `calcDefMult`/`calcResMult`,
`RESONANCE_CHAIN_DATA`/`CHAR_BUFF_TABLE`/`SKILL_MULTIPLIERS`/dmgFocus reads from
`app/src/data/characters.js`). It is invoked from `DamageCalculator.jsx`
(`app/src/features/teams/DamageCalculator.jsx:20,64-76`), which is the Team tab's calculation
entry point, threaded down through `TeamsTab.jsx`, `EnemyTargetSection.jsx`,
`DPSComparisonCard.jsx`, `characterCardRenderer.js`, `CollectionTab.jsx`, and
`CharacterDetailModal.jsx`. `calcEngine.js` also exports small pure utilities
(`isHealerRole`/`isSupportRole`/`calcDefMult`/`calcResMult`/`applyFullEchoSet`/`getWeaponPv`) that
are still directly imported elsewhere, independent of the legacy team-stat computation.

**Confirmed, not just claimed:** `calcTeamStats.js` already contains the merge. Since a prior
"PHASE3_PLAN.md Stage 4" pass, the file branches on whether **every** member of the team has a
converted `characterBlocks/*.blocks.js` file:
- `allMembersConverted` gate (`calcTeamStats.js:412-416`, `:658-677`, `:1131-1136`,
  `:1347-1352`): when true, the RAW tier calls `resolveHitComposedDps` (line 634) and the
  full-tier per-member loop calls `resolveHitComposedTeamDps` (line 1371) — the **modern** engine
  computes the real numbers. Legacy `applyResonanceChain`/`routeTypeBonuses`/flat-table math is
  the **fallback only**, and today only fires for a team containing **Jingran** — confirmed via
  `characters.js`'s own comments (`:1053-1059`, `:2204`, `:2469`, `:2654`) and
  `phase3-parityHarness.test.js`'s own header ("Covers all 56 characters with a converted
  `.blocks.js` file (Jingran excluded — unreleased, no rotation data)"). Jingran is unreleased
  (targeted 3.6-patch, ~2026-09-10) and has no `characterBlocks` entry, so he is the *only* gap,
  not a stand-in for a larger unconverted set.

So REMAINING_WORK.md §1's claim ("modern engine is the primary path for all 56 converted
characters; legacy only still executes for Jingran") is **accurate**, and is itself the strongest
evidence in this investigation — it's independently re-verified above via the actual gating code
and comments, not just quoted.

## 2. What legacy still does that modern doesn't fully replicate

### a. Tune Break / Hack Response aggregate DOT
Confirmed independently (REMAINING_WORK.md §1b, re-verified by reading the surrounding code):
`calcTuneBreakDmg()` in `calcEngine.js` computes Tune Break's base tick from
`TUNE_BREAK_BASE_DMG * (1 + totalBoost*0.01) * breaksPerRot * defMult`, where `breaksPerRot` is
derived from `rotTime` (whole-rotation length) and the team's *aggregate*
`tuneBreak.boostToTeam` value — **not** anchored to any specific character's cast/hit. This is
structurally different from the other 4 already-migrated DOT mechanics (Electro
Flare/Buling, Fusion Burst/Denia+Aemeath, Erosion/Ciaccona, Frazzle/Rover:Spectro), each of which
has a real `dotApplier`-tagged block — a specific rotation step that applies the DOT — for the
TriggerBlock engine's per-hit model to hang a trigger on. Tune Break has no such anchor; it's a
rotation-average heuristic, not an event. The ~9 characters sharing this (Lynae's Spectral
Analysis, Lucy's Data Crash, Rebecca's Meltdown, Aemeath's Starburst, Denia, Mornye, Luuk Herssen,
plus base Tune Break application itself) are individually well-sourced for their own "Response"
payoff numbers, but each is gated on the same un-anchored aggregate trigger. `grep`-verifying the
claim: `tuneBreak`/`ruptureDmgMult`/`hackDmg` all resolve only inside `calcEngine.js`/
`calcTeamStats.js`/`characters.js` (raw tables) plus test files — no modern-engine schema field
for any of them exists in `triggerBlocks.schema.js`. Rebecca's own per-hit Meltdown/Hack Response
value is otherwise migrated where it *is* per-hit-anchored (her `rebecca.blocks.js` file exists
and is in the converted 56), but the aggregate rupture-rate math (`tuneBreak.modeExclusive`/
`competesWithFusionBurstReaction` combinatorial mode-locking) stays legacy-only,
`calcTeamStats.js`-side, even for her.

This is the single largest remaining structural gap — it's not a data-sourcing problem, it needs
a genuinely new simulation primitive (a per-rotation aggregate-rate DOT model) that the
per-hit-triggered engine doesn't have a slot for today.

### b. `applyResonanceChain()`'s unscoped `totalMult`
`applyResonanceChain()` (`calcEngine.js:679-719`) sums every Resonance Chain level's `totalMult`
into one flat `totalMultBonus` number applied to the character's *entire* rotation-average output
— it has no concept of "this bonus only applies to these specific moves." The modern engine
replaced this with `scopedToBlockId` (an effect names the specific block IDs it multiplies).
These are **not two equally valid designs** — REMAINING_WORK.md's own audit trail (repeated
verbatim across Sigrika, Camellya, Carlotta, Augusta, Jiyan, Phrolova, Qingxiao, Qiuyuan, Roccia)
treats every case where a chain node's `totalMult` was left unscoped in `RESONANCE_CHAIN_DATA` as
a **bug**, not an intentional alternate design: the node's own kit text virtually always names
specific moves ("Basic - Elucidated / Dodge Counter - Decipher / ... " for Sigrika S1, etc.), and
the unscoped legacy value silently over-applies the bonus to unrelated damage (Intro/Outro/other
skills that were never meant to receive it). The correct fix pattern found repeatedly was:
correct `RESONANCE_CHAIN_DATA` to the real un-averaged `totalMult` and add `scopedToBlockId`
entries in the block file — i.e. the modern engine's scoped model is the more correct
representation, and the legacy flat value was in every audited case a *rotation-averaged
approximation* of that same real, scoped effect (an averaging that becomes wrong the moment the
scoped moves aren't taken at their assumed rate — exactly the class of two-path desync bug that
motivated this whole audit). There is no known character where the unscoped legacy semantics are
the intentionally-correct interpretation.

### c. `routeTypeBonuses()` vs `damage.category`
`routeTypeBonuses()` (`calcEngine.js:438-454`) buckets accumulated flat "Skill/Basic/Heavy/
Liberation/Echo/Coordinated ATK DMG%" pools by `dpsFocus` (an array of move types a character is
"specialized" in per `characters.js`), routing untouched buckets into `skillDmg` at a discounted
weight (0.5/0.5/0.3) only in the empty-dpsFocus fallback case. This is a coarse, whole-rotation
category-share model built for the flat single-number-per-rotation approach. The modern engine's
`damage.category` (`introDmg`/`outroDmg`/`basicDmg`/`echoDmg`/`coordDmg`/etc., tagged per
TriggerBlock) is doing the *same conceptual job* — deciding which flat DMG%-buff pools apply to
which damage — but at the correct granularity: per real damage-dealing block, not per
rotation-average category share. They are not reconcilable as parallel systems long-term; the
category tag is the finer-grained superset. The "two-path desync" bug class this audit found
repeatedly (missing `damage.category` on individual blocks — Sigrika Intro/Outro, Suisui Intro,
etc.) is a direct symptom of this same category system needing to be maintained accurately for
every block, which is naturally more error-prone at 400+ block granularity than at ~6-field
rotation-share granularity — an argument *for* the audit discipline continuing, not against the
migration.

### d. Other legacy-only computation found
- **Auto Equip / echo & weapon scoring** (`app/src/features/teams/autoEquip.js`) reads
  `CHARACTER_DATA[...].totalMult` (the legacy flat-table field) directly, plus
  `normalizedDpsPowerScore()`/`subDpsPool` scoring in `calcTeamStats.js:938-1084` (the
  "normalized DPS power score (0-25)" calibration, `:958-970`, `:1024-1084` sub-DPS pool
  selection) — these are legacy-table-driven heuristics for team-composition suggestions/rankings
  that have no modern-engine equivalent at all; they're not per-character DPS math being
  duplicated, they're aggregate team-building heuristics layered on top of the legacy
  `totalMult` number specifically. Migrating these would need a modern-engine-derived
  per-character "power score," not just reusing `resolveHitComposedDps` output directly (its
  output is real DPS, not the normalized 0-25 score these functions expect).
- **`calcDefMult`/`calcResMult`** (`calcEngine.js:466-480`) are shared pure math (not
  legacy-vs-modern duplicated) — both paths call the same functions, no divergence risk here.
- **`applyFullEchoSet`/`getWeaponPv`** — shared stat-aggregation utilities, also not duplicated;
  both paths consume the same equipment stat pipeline upstream of either damage formula.

## 3. What the modern engine does that legacy can't

- **True per-hit / per-step simulation**: `resolveHitComposedDps.js`/`triggerEngine.js` walk a
  real ordered sequence of steps (`rotationSimulator.js`/`deriveStepsFromRotation`), evaluating
  each `TriggerBlock`'s `trigger` (cast/passive/ally-action/windowed-proc/cross-character-hit)
  and `timing` (duration windows, `blockWindows.js`) against actual step timestamps — legacy has
  no concept of time or sequence at all, only a single rotation-average number.
- **Duration-gated buffs & window overlap**: a chain node buff can now genuinely only apply while
  its window is open, stacking/expiring correctly against a real timeline; legacy's
  `applyResonanceChain` just adds a flat bonus with no on/off state.
- **Cross-character / ally-action triggers**: `trigger.type:'ally-action'`,
  `crossCharacterHit`, `minProcInterval` (built for Cantarella's summon-chain, Galbrena's
  chain.s4, Sigrika/Qingxiao's ally-action retrofits) — a block can react to what a *different*
  team member does, something the legacy flat-table math structurally cannot express (it computes
  one character's stat sheet in isolation, team buffs folded in as more flat adds).
- **`forfeitOnRecipientSwapOut`** (recently added) — a buff on character B ending early because
  character B itself swaps out, computed against B's own real on-field segment. No legacy
  equivalent; legacy has no swap-timeline concept.
- **Coordinated Attack modeling** (`coordinatedAtk.js`) with real proc-rate/cooldown mechanics
  (e.g. Mortefi's Burning Rhapsody Marcato rate-cap) vs legacy's flat `coordDmg` bucket.
- **Confirms modern is the right convergence target**: nothing found in this investigation
  suggests calcEngine.js has a *damage-modeling* capability worth porting into the modern engine
  instead of retiring — its only genuinely unreplicated capability (Tune Break's aggregate DOT,
  §2a) is a *lesser*-fidelity model (a rotation-average heuristic) that the modern engine's
  higher-fidelity per-event model should eventually absorb by building a new aggregate-rate
  primitive, not by keeping calcEngine.js's version around as the "real" implementation. The
  team-composition scoring heuristics (§2d) are a separate concern (ranking/suggestion UI, not
  damage-per-character correctness) and could plausibly stay on a simplified legacy-derived
  number even after full retirement, or be rebuilt against real engine DPS output later — lower
  priority/risk either way since they don't feed displayed per-character damage.

## 4. Coverage across the 58 entries in `characterBlocks/`

Directory listing (58 files, one is `index.js` — 57 actual character block files, but two Rover
variants... let me be precise): `ls characterBlocks/` shows 57 `.blocks.js` files +
`index.js`. `phase3-parityHarness.test.js`'s own header states it "Covers all 56 characters with
a converted `.blocks.js` file" — the small discrepancy (57 files vs "56 characters") is because
`roverElectro.blocks.js`, `roveraero.blocks.js`, `roverhavoc.blocks.js`, `roverspectro.blocks.js`
are 4 files for what's counted as element-variants of one logical "Rover" roster slot in some
countings, or the "56" is simply slightly stale relative to the current 57-file directory (not
independently reconciled further in this pass — flagged as a minor discrepancy worth a one-line
recount, not a red flag).

**Team-level aggregation location**: confirmed NOT duplicated. `resolveHitComposedTeamDps.js`
does the real per-hit composition (each member's own on-field segment, their own real damage),
but `calcTeamStats.js` remains the orchestrator even for a fully-converted team — it still owns:
rotation-order resolution (`rotationOrderSearch.js`/engine-derived on-field order,
`calcTeamStats.js:165`), enemy DEF/RES context building, gear/echo/weapon stat aggregation
(`applyFullEchoSet`/`getWeaponPv`, shared util), and the cross-character buff *sourcing* (who
grants what to whom) before handing the assembled `blocksByOwner`/`baseStats`/`enemyContext` into
`resolveHitComposedTeamDps` per member (`calcTeamStats.js:1371`). So: legacy retirement is **not**
"delete calcTeamStats.js" — it's "delete calcEngine.js's flat-table formula path and
`calcTeamStats.js`'s `!allMembersConverted` fallback branches," while `calcTeamStats.js` itself
stays as the orchestration layer that already calls the modern engine. This substantially lowers
migration risk: the orchestration code is already exercised on every real team (since
`allMembersConverted` is true for virtually every real team today), only the Jingran fallback
branch is genuinely legacy-execution-path in production.

**Spot-check via existing tooling**: `phase3-parityHarness.test.js` already runs exactly this
check — for all 56/57 converted characters, it calls `resolveHitComposedDps` directly and
compares (non-strict, sanity-bounds only, per its own header) against `calcTeamStats.js`'s RAW
tier. It does NOT assert numeric equality (the header explicitly states divergence is often a
real precision *improvement*, not a bug — expected given §2b's totalMult-scoping fixes). This
means: full per-character parity has *not* been formally re-asserted after each fix; the harness
is a smoke test, not a regression gate. A tighter before/after golden-value harness per character
(§6) does not yet exist as a delete-blocking gate.

**Phase A audit progress** (from REMAINING_WORK.md §1c, independently spot-checked against 2
of its detailed write-ups for Sigrika and Suisui above): 41 of ~56-57 characters have been
through the full 9-dimension audit as of 2026-09-04; ~15-16 remain (the "~44 characters" figure
in REMAINING_WORK.md's older running count appears stale relative to its own newer per-character
list — the doc's own list of 41 named characters is the more trustworthy figure, consistent with
this task's framing of ~30 "so far" being an undercount as the audit continued same-day).

## 5. Concrete remaining gaps blocking full legacy retirement

1. **Tune Break/Hack Response aggregate DOT** (§2a) — needs a new "rotation-aggregate-rate DOT"
   primitive in the schema/engine; affects ~9 characters' Response payoffs plus base Tune Break
   application itself, all still legacy-computed even for otherwise-converted characters (this is
   computed by `calcTeamStats.js` as an *addition* on top of the engine result for those
   characters today, not a full-character fallback — confirm exact wiring before touching; not
   independently re-verified line-by-line in this pass beyond REMAINING_WORK.md's account).
2. **Danjin's HP-threshold condition** (+15% dmg at HP<60%) and **on-being-hit stack loss** — need
   live-HP/incoming-damage-timeline simulation; zero infrastructure exists (`grep`-confirmed: no
   `hpPct`/`currentHp` matches under `engine/*.js`).
3. **Denia's Erosion Field tick-rate change (4s→3s)** — needs the same sustained-tick-simulation
   layer as Baizhi's gap.
4. **Baizhi's Remnant Entities / Roccia's Reality Recreation** — both blocked purely on missing
   source-dump files, not engine capability; not investigable further without new source data.
5. **Opener-vs-Loop rotation modeling** (found 2026-09-04 on Jinhsi) — at least 9 characters
   (Jinhsi, Chisa, Rebecca, Lupa, Mornye, Lucy, Buling, Phrolova, Suisui) have source dumps
   distinguishing a one-time cold-swap-in Opener from a repeating Loop Rotation; the engine
   currently models only one fixed sequence per character, used for both solo and chained
   team-rotation calculation. For Jinhsi this is a real team-context inaccuracy (her Loop casts
   Intro every cycle, a real ~3.12% S0-total damage source the Opener-only model misses). Needs
   the rotation simulator to track "which lap" a character is on — a genuine new engine
   dimension, unaudited for the other 8 characters' magnitude of impact.
6. **`totalMult`-class chain-node scoping bugs** (§2b) are a recurring, not-yet-exhausted bug
   class — every completed 9-dimension audit so far has found at least one more instance
   (Sigrika, Camellya, Carlotta, Augusta, Jiyan, Phrolova, Qingxiao, Qiuyuan, Roccia so far); the
   ~15-16 not-yet-fully-audited characters should be assumed to contain more undiscovered
   instances until their own audit passes complete — this is the main reason full retirement is
   premature *right now*, independent of the Tune Break/HP-tracking structural gaps: retiring
   `calcEngine.js` before finishing Phase A would make it harder to notice future discrepancies
   between "what the raw table says" and "what the block actually does," since the raw-table
   comparison itself (however manual) has been the discovery mechanism for most of these bugs.
7. **Ally-action retrofit backlog** — Tune Break-cast tag (Luuk Herssen S4, Mornye chain.s2) and
   Cartethyia S4's 6 status tags are still open, blocked on the same Tune Break per-move data gap
   as #1.
8. **Team-composition/Auto-Equip scoring heuristics** (§2d) still read legacy `totalMult`
   directly — lower-priority (doesn't affect displayed per-character DPS) but is real remaining
   `CHARACTER_DATA[...].totalMult` production usage outside `calcTeamStats.js` that a naive
   "delete calcEngine.js" pass would break; `autoEquip.js` in particular needs its own
   migration/replacement design, not covered by the DPS-parity work at all.

## 6. Proposed staged migration plan

**Stage 0 (mostly done):** `calcTeamStats.js`'s `allMembersConverted` gating is already in place
and is the correct architecture — keep it as the seam; do not restructure it.

**Stage 1 — finish Phase A (highest-value, lowest-risk, do first):** Complete the remaining
~15-16 characters' 9-dimension audits. This is the actual bug-finding mechanism (every completed
audit so far has found real desync bugs), and it's the main thing standing between "legacy tables
are believed correct" and "legacy tables are verified redundant with the blocks." Low risk because
it's read/verify/fix-in-place work already following an established, tested methodology — no
architecture change.

**Stage 2 — build the Tune Break aggregate-rate primitive:** Design a schema addition (a new
`trigger.type` or a dedicated aggregate-DOT block shape, `boostToTeam`-equivalent input) so the 9
Tune Break characters' Response payoffs and the base tick can be computed inside the modern
engine instead of as a `calcTeamStats.js`-side addition. This is the largest scoped remaining
engine feature gap; do it before retiring anything, since it's the last DOT mechanic keeping any
converted character's real number partially legacy-sourced.

**Stage 3 — build a real golden-value parity gate:** Extend/replace
`phase3-parityHarness.test.js`'s sanity-bounds-only check with an explicit before/after
golden-value regression per character (store the current legacy-formula RAW output per character
as a snapshot; assert the modern engine's output for that same character stays within an
intentionally-documented tolerance, flagging — not failing — any character whose divergence
changes from its currently-recorded value, since some divergence is expected/correct per Stage 1
fixes). This turns "does deleting legacy silently change production numbers" from a manual
question into an automated one, and should be added *before* any deletion, not after.

**Stage 4 — retire the Jingran-only fallback last, or leave it until Jingran actually converts:**
Since Jingran already blocks the `allMembersConverted` gate today and is due to release ~2026-09-10,
the natural point to remove the `!allMembersConverted` fallback branches in `calcTeamStats.js`
(lines ~412-416, 658-677, 1131-1136, 1347-1352) is right after Jingran gets his own `.blocks.js`
file post-release — at that point `allMembersConverted` becomes unconditionally true and the
fallback branches become dead code, safely deletable. This is naturally sequenced, not urgent to
force early.

**Stage 5 — delete `calcEngine.js`'s flat-table formula surface:** Once Stage 1-4 are done, delete
`applyResonanceChain`/`routeTypeBonuses`/`RESONANCE_CHAIN_DATA`-as-computed-input (data itself may
be kept as documentation/source-of-truth for `.blocks.js` authoring, but should stop being
*executed*), `calcTuneBreakDmg` (superseded by Stage 2's primitive), and the flat per-member
damage loop in `calcTeamStats.js`. Keep `calcDefMult`/`calcResMult`/`isHealerRole`/
`isSupportRole`/`applyFullEchoSet`/`getWeaponPv` — these are shared utilities, not duplicated
legacy math, and are still needed regardless.

**Stage 6 — separately design a modern-engine-backed replacement for the team-composition/
Auto-Equip power-score heuristics** (§2d/#8) — decouple this from the DPS-correctness migration
above since it's a different kind of number (a 0-25 normalized ranking score, not real DPS) and
carries its own design work; can happen in parallel with Stages 1-5 or after, at lower priority.

**What's genuinely risky:** the only path from "silent behavior change to real production
numbers" left after Stage 0 (already done) is (a) Stage 1's own bug-fixing — expected and
desired — and (b) any future rewiring of `calcTeamStats.js`'s orchestration layer itself (rotation
order, enemy context, gear aggregation) since that layer is shared and already feeds the modern
path for virtually all real teams today. Deleting calcEngine.js's dead-for-99%-of-teams flat
formula code is comparatively low-risk *if* Stage 3's golden-value gate exists first to catch any
surprise (e.g. a heuristic score function accidentally reading a legacy field that turns out to
still matter).
