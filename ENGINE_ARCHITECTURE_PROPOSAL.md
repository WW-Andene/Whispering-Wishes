# Engine Architecture Proposal — Single-Engine Restructuring (v2)

Status: DESIGN ONLY, not yet approved, no code changed. v1 written 2026-09-04 in response to the
user's mandate ("I want only one engine... Restructure everything: Name, Section, Layer, Function,
Category, Logic, Trigger, Characters... delete the legacy calcEngine.js path as part of this
restructuring, resolving routeTypeBonuses() as part of the redesign"). This v2 is a critical
second pass over v1, requested explicitly to stress-test it for long-term extensibility ("The base
must be solid and fully adaptable for growth and modification") — not a new document from scratch.
Builds on `ENGINE_MERGE_INVESTIGATION.md` and `REMAINING_WORK.md` §1/§1a-1c; this document does not
re-derive facts already established there.

**What changed from v1, and why** (full detail inline at each section, summarized here so a reader
of both versions can see the delta at a glance):

1. **§5 corrected a factual bug in v1's own design.** v1 claimed the `routeTypeBonuses` replacement
   would sum "the composed result's real per-category damage totals." Re-reading
   `calcTeamStats.js:1074-1103` line by line (not just its own summary) shows `routeTypeBonuses`
   operates on **received %DMG-bonus stat buckets** (`stats.basicDmg`/`heavyDmg`/`libDmg`/etc. —
   buff accumulation, gated by `dpsFocus`), not on realized damage amounts. v1's proposed
   `categoryTotals` design would have summed the wrong kind of number entirely and produced a
   silently wrong stat panel. Fixed below with a design that is actually equivalent to today's
   behavior for every existing character, verified against the real code path.
2. **Schema versioning added** (`schemaVersion` field, §3.4) — v1 had no story for "the schema
   changes again in 2027"; now every block is self-describing and old/new shapes can coexist
   indefinitely, not just during one bounded migration window.
3. **`category` becomes a namespaced, lint-checked string instead of a hard enum** (§3.2) — v1's
   flat closed enum would force a code change (schema file edit + validator edit + every call-site
   that switches on category) every time the game adds a new move type, which is a recurring cost
   for a live-service game, not a one-time cost. The revised design keeps typo protection without
   that recurring tax.
4. **Taxonomy gaps named and given real slots** (§1) — Echo Set bonuses, Weapon passives,
   cross-character-sourced buffs, Concerto/resource economy, elemental reaction chaining, and
   duration/stacking semantics were present in v1's file inventory but not actually placed in the
   Layer/Section/Category/Trigger/Logic/Function taxonomy; each now has an explicit home or an
   explicit justification for why it's a sub-concept of an existing term.
5. **Projection layer generalized** (§1, §6) — v1's `projectMainDpsStatPanel` was one hard-coded
   function for one UI surface. Restated as a small, registrable-projection pattern so a future
   comparison view or build-planner view doesn't require re-opening this design again.
6. **Migration plan merged with Phase A instead of sequenced before it** (§7) — v1's Phase 0 → 1 →
   "Phase A resumes" put a 57-file mechanical reformatting pass (Phase 1) as a separate blast-radius
   event. v2 makes the schema additive-by-default (enabled by `schemaVersion`) so each Phase A audit
   upgrades that one character's file to the new shape as part of doing the audit — no separate
   flag-day rewrite of all 57 files.
7. **Enforcement strengthened** (§8) — a required shared test-utility import per character test
   file, a CI schema-validator gate (not just dev-mode warn), and the naming-convention lint check
   are now specified as blocking CI checks with concrete shapes, not just "add a lint check
   later."
8. **File/folder layer restructuring (v1 §2.1) is unchanged** — re-verified against the current
   `app/src/engine/` listing, still sound, kept below with only wording tightened.

**Hard boundary, restated (unchanged from v1):** `MapTab.jsx` and anything connected to it (its
hooks, sub-components, map-specific state/utils) is never touched by this restructuring, or by any
phase of it, for any reason, per CLAUDE.md's standing exception. Nothing below references or
depends on map code; if any implementation step is found to require touching it, that step stops
and gets flagged, not silently worked around.

---

## 0. Current-state inventory (facts this proposal is built on)

Independently re-verified for v2 (not just carried over from v1): read `calcTeamStats.js` around
line 1085, `calcEngine.js`'s `routeTypeBonuses`/`applyBuff`/`TYPE_FOCUS_MAP`, and
`resolveHitComposedTeamDps.js`'s actual return shape and `hitLog` structure directly. All facts
below hold.

### 0.1 `app/src/engine/` — every file, what it does, its role

| File | Lines | Role |
|---|---|---|
| `triggerBlocks.schema.js` | 529 | The block type definitions (`TriggerBlock`, `trigger`, `timing`, `target`, `condition`, `effects`, `damage`) — the schema itself, plus JSDoc. Everything else imports its shapes. |
| `triggerEngine.js` | 114 | Core per-block resolver: given a block + a step context, decides if it fires and what it contributes. The innermost layer. |
| `resolveHitComposedDps.js` | 245 | Solo/single-character composition: walks a character's own step sequence, calls `triggerEngine` per block, sums real per-hit damage. |
| `resolveHitComposedTeamDps.js` | 243 | Team composition: same job as above but across all team members' interleaved on-field segments, cross-character triggers included. Returns `{ totalDamage, targetSegment, dps, hitLog }`, where `hitLog` is an array of `{ time, blockId, atkPct, damage, category }` — i.e. **real per-hit damage IS tagged with its category** in the output, just not pre-aggregated by category (see §5's corrected design, which uses this). |
| `resolveSimulatedRotation.js` | 131 | Produces the ordered step sequence for one character from `CHARACTER_ROTATIONS` text. |
| `resolveSimulatedTeamRotation.js` | 189 | Team variant — also the function `calcTeamStats.js`'s stat-panel branch calls to get the main DPS's real *received-buff* stats (not damage) for the summary panel (§0.4 below). Returns `stats` (a bag of `atkPct/cr/cd/elemDmg/skillDmg/basicDmg/heavyDmg/libDmg/echoDmg/coordDmg/amplify/deepen/defShred/resShred/defIgnore`) plus `totalMultBonus`. |
| `rotationSimulator.js` | 566 | Largest file. Parses rotation notation into discrete timed steps; owns cast-order/timing mechanics. |
| `rotationOrderSearch.js` | 130 | Determines real team on-field ordering (who's on field when) for team rotations. |
| `blockWindows.js` | 132 | Duration-window math (buff on/off state over time) — used by both trigger resolution and DOT logic. |
| `sequenceGating.js` | 152 | Resonance-chain sequence-level (S0-S6) gating of blocks/effects. |
| `tieredStacking.js` | 40 | Stack-count math for tiered buffs. |
| `energyCycleGating.js` | 29 | Energy-regen cycle gating. |
| `coordinatedAtk.js` | 53 | Coordinated Attack proc-rate/cooldown modeling (Mortefi etc.). |
| `skillMultiplierParser.js` | 50 | Parses `"66.27%×3"`-style multiplier strings into hit arrays — used by nearly every `.blocks.js` file. |
| `dotFormulas.js` | 212 | DOT tick-damage formulas (moved out of `calcEngine.js` in commit `66afc1d2`) — Electro Flare, Fusion Burst, Erosion, Frazzle, Tune Break base tick. |
| `dotReactions.js` | 178 | Aggregates which DOT reactions are active for a team and composes their total damage (calls into `dotFormulas.js`). |
| `dotReactionsFromBlocks.js` | 128 | Bridges DOT reactions to the block system — reads `.blocks.js`-tagged `dotApplier` blocks to know when a DOT reaction is actually anchored to a real cast, per §2a of the investigation. |
| `characterBlocks/*.blocks.js` × 57 + `index.js` | — | Per-character data: the actual `TriggerBlock[]` arrays. `index.js` is a static import map, name → blocks array. |

**Total modern engine code (excluding characterBlocks data): ~3,121 lines across 17 files.**

### 0.2 Legacy surface

- `app/src/features/teams/calcEngine.js` — 1,219 lines. Contains: `applyResonanceChain` (flat,
  unscoped chain-bonus application), `routeTypeBonuses` (flat %DMG-bucket routing by `dpsFocus`,
  operating on **stat accumulators**, not realized damage — see §5), `applyBuff` (the shared
  gate-and-accumulate helper `routeTypeBonuses`'s sibling `TYPE_FOCUS_MAP` also serves),
  `RESONANCE_CHAIN_DATA`/`CHAR_BUFF_TABLE`/`SKILL_MULTIPLIERS` consumption, `calcTuneBreakDmg`
  (superseded by `dotFormulas.js`'s Tune Break formula per commit `66afc1d2`, but likely still
  wired somewhere — verify at implementation time), plus the **genuinely shared, non-duplicated
  utilities**: `calcDefMult`, `calcResMult`, `calcAvgCrit`, `calcDmgBonus`, `calcEnergyCycles`,
  `isHealerRole`/`isSupportRole`, `applyFullEchoSet`, `getWeaponPv`, `countTeamElements`.
- `app/src/features/teams/calcTeamStats.js` — 1,669 lines. The orchestrator both paths run
  through: rotation-order resolution, enemy DEF/RES context, gear/echo/weapon stat aggregation,
  cross-character buff sourcing, then either (a) the modern per-hit composition
  (`allMembersConverted` branch, calling `resolveHitComposedDps`/`resolveHitComposedTeamDps`) or
  (b) the legacy flat-table fallback (currently exercised only for Jingran, per the investigation).
  It *also* calls `routeTypeBonuses` from inside the modern-path branch itself, at line 1085, to
  build the main-DPS stat-panel summary numbers (effAtk/avgCrit/dmgBonus/defMult/resMult/score) —
  this is the specific entanglement the user asked to be resolved as part of the redesign, not
  deferred. **Its actual job at that line, confirmed by re-reading the code**: `finalStats` is a
  bag of received %-bonus stats already correctly time-averaged over the main DPS's own on-field
  segment by `resolveSimulatedTeamRotation` (real per-block accuracy, not a legacy heuristic — this
  part is already modern), *except* the `basicDmg/heavyDmg/libDmg/echoDmg/coordDmg` sub-buckets
  still need collapsing into the single `skillDmg` number `calcDmgBonus`'s one-line formula expects,
  because the stat panel is a **decomposed multiplicative display** (`effAtk × avgCrit × dmgBonus ×
  defMult × resMult`), not a re-derivation of total damage — total damage is already computed
  correctly elsewhere (RAW/FULL tiers via `resolveHitComposedTeamDps`'s own `totalDamage`). This
  distinction is the entire reason v1's §5 design was wrong (see §5 below).

### 0.3 `characterBlocks/` naming — confirmed inconsistencies

Directory listing shows real inconsistency, exactly as the user's framing anticipated:
- **Rover variants**: `roverElectro.blocks.js` (camelCase suffix) vs `roveraero.blocks.js`,
  `roverhavoc.blocks.js`, `roverspectro.blocks.js` (all-lowercase suffix). One of four is
  differently cased from its three siblings for no functional reason.
- **Multi-word names collapsed with no separator**: `luukherssen.blocks.js` (for "Luuk Herssen"),
  `yangyangxuanling.blocks.js` (for "Yangyang: Xuanling" per `REMAINING_WORK.md`'s own listing,
  which names both "Yangyang" and "Yangyang: Xuanling" as distinct roster entries — confirms these
  are two separate characters sharing a name prefix, not one character with an ambiguous key).
- Every other file is a single lowercase word matching a single-word character name (`aalto`,
  `jiyan`, `verina`, ...) — the convention is consistent there, it only breaks down for
  multi-word/multi-variant names, which is precisely where naming ambiguity does the most damage.
- The `index.js` import map already works around this today by hand: it imports each file under an
  inconsistent literal path but re-exports each under a clean `WHATEVER_BLOCKS` constant name keyed
  correctly by the display name string used in `CHARACTER_DATA`/`CHARACTER_ROTATIONS`. So the
  *runtime* lookup is currently safe (the map is the source of truth, not the filename), but the
  *filenames themselves* are not self-describing/consistent — exactly the drift CLAUDE.md's hygiene
  section calls out as non-negotiable to fix, not tolerate. **This codebase's proven track record of
  written-convention drift (Rebecca's `ruptureDmgMult` desync, inconsistent `characterBlocks`
  casing, the exact camelCase/lowercase split found here) is the reason §8 below specifies this as
  an enforced CI check, not a written rule alone — writing it down has already been tried and has
  already failed here at least twice.**

### 0.4 Block schema shape today (from `aalto.blocks.js` and `mornye.blocks.js`)

A block today looks like:

```js
{
  id: 'aalto.intro.feint-shot',
  source: SOURCE,                          // = character display name, repeated per block
  kind: 'damage' | 'buff',
  trigger: { type: 'cast', on: 'Intro:Feint Shot' },
  timing: {},                               // duration windows for buffs
  target: { scope: 'self' | 'next-on-field' | ... },
  condition: { element: 'aero' },           // optional
  effects: [],                              // buff-kind payload
  damage: { hits: parseSkillMultiplierHits('66.27%×3'), category: 'skillDmg', basis: 'ATK'|'DEF' },
  note: '...',                              // free-text audit trail, present on most but not all
}
```

Observed inconsistencies across files:
- **Field order** is not fixed — some files put `note` before `damage`, some after; some omit
  `timing`/`target`/`effects` as empty literals, others omit the key entirely.
- **`basis`** defaults implicitly to ATK when omitted (only DEF-scaling characters like Mornye set
  it explicitly) — an implicit default is exactly the kind of "silent, undocumented convention"
  CLAUDE.md's hygiene mandate says to eliminate, not preserve.
- **`note`** is doing at least three different jobs across files: (1) a genuine mechanical
  clarification for future readers, (2) an audit-changelog entry, (3) a flag for a known
  unrepresentable gap. These are three different *kinds* of information collapsed into one
  free-text field with no structure — a future tool (or a future audit pass) cannot query "show me
  every block with an open known-gap" without grepping prose.
- **`damage.category`** values in actual use today (grepped from every `.blocks.js` file):
  `skillDmg` (120), `basicDmg` (111), `libDmg` (75), `heavyDmg` (63), `echoDmg` (21), `coordDmg`
  (6), `introDmg` (2), `outroDmg` (2, both freshly added on the same 2026-09-04 audit visible in
  `sigrika.blocks.js`). `introDmg`/`outroDmg` are dramatically under-represented relative to how
  many characters plainly have real Intro/Outro damage shares per the audit notes already in this
  codebase — direct evidence the categorization gap the investigation already named (§2c) is still
  substantially open across the ~15-16 not-yet-audited characters, which is why §7 below keeps the
  audit and the schema migration as one motion rather than two sequential ones: every character that
  gets its category set corrected during audit should land on the new schema *at the same time*,
  not be touched twice.

### 0.5 Call graph (file:line)

```
DamageCalculator.jsx:20,64-76   (Team tab entry point)
  -> calcTeamStats.js            (orchestrator: rotation order, enemy context, gear aggregation,
                                   buff sourcing)
       -> allMembersConverted gate (calcTeamStats.js:412-416, :658-677, :1131-1136, :1347-1352)
            true  -> resolveHitComposedDps.js       (RAW tier, calcTeamStats.js:634)
                  -> resolveHitComposedTeamDps.js    (FULL tier, calcTeamStats.js:1371)
                       -> triggerEngine.js
                            -> characterBlocks/<name>.blocks.js (via characterBlocks/index.js)
            false (Jingran only) -> calcEngine.js: applyResonanceChain, routeTypeBonuses,
                                     flat SKILL_MULTIPLIERS/CHAR_BUFF_TABLE/RESONANCE_CHAIN_DATA math
       -> stat-panel summary (calcTeamStats.js:1051-1103, ALWAYS runs; the `allMembersConverted`
                               branch at :1074 overrides it with real per-block-derived received
                               stats before the SAME routeTypeBonuses collapse at :1085)
            -> resolveSimulatedTeamRotation.js  (real received-buff stats for main DPS)
            -> routeTypeBonuses(...)             (calcTeamStats.js:1085 — the entanglement)
            -> calcDmgBonus/calcDefMult/calcResMult/calcAvgCrit (shared utils, calcEngine.js)
       -> DOT damage (calcTeamStats.js:1118) -> dotReactions.js -> dotFormulas.js /
                                                  dotReactionsFromBlocks.js
```

Also invoked outside the Team tab: `characterCardRenderer.js`, `CollectionTab.jsx`,
`CharacterDetailModal.jsx`, `EnemyTargetSection.jsx`, `DPSComparisonCard.jsx`,
`TeamsTab.jsx` — all downstream consumers of `calcTeamStats.js`'s output, not independent callers
of the engine.

### 0.6 Genuinely shared utilities (must survive, regardless of restructuring)

Confirmed non-duplicated, used by both paths and/or the stat panel today:
`calcDefMult`, `calcResMult`, `calcAvgCrit`, `calcDmgBonus`, `isHealerRole`, `isSupportRole`,
`applyFullEchoSet`, `getWeaponPv`, `calcEnergyCycles`, `countTeamElements`, `applyBuff` (the
gate-and-accumulate helper — see §1's Logic entry). These are pure math / stat-aggregation, not
flat-table damage modeling — they need a permanent home in the new structure (§2), not deletion.

---

## 1. Taxonomy — completeness audit and revised definitions

v1 defined 8 terms (Layer/Section/Category/Trigger/Logic/Function/Character/Name) and mapped
today's files onto them. Re-reading the codebase adversarially against that taxonomy surfaces real
concepts that either had no clean home or were silently folded into a term that doesn't actually fit
them. Each is addressed below rather than glossed over.

### 1.1 The 8 terms, revised

- **Layer** — a tier of the engine's call graph, by responsibility, not by file. Unchanged from v1,
  five layers outermost to innermost: **Orchestration** (rotation order, enemy context, gear
  aggregation, buff sourcing — today's `calcTeamStats.js`), **Composition** (turns an ordered step
  sequence + a character's blocks into real per-hit totals — `resolveHitComposedDps.js`/
  `resolveHitComposedTeamDps.js`/`resolveSimulatedRotation.js`/`resolveSimulatedTeamRotation.js`),
  **Trigger resolution** (per-block fire decision — `triggerEngine.js`, `blockWindows.js`,
  `sequenceGating.js`, `tieredStacking.js`, `energyCycleGating.js`, `coordinatedAtk.js`),
  **Character blocks** (per-character data — `characterBlocks/*.blocks.js`), **Projection** (turns
  composed engine output into a *specific UI's* shape — does not exist as a first-class concept
  today; generalized in §6, not just the one stat-panel instance v1 proposed).

- **Section** — a grouping within one character's kit, corresponding to the game's own move
  categories: Basic ATK, Heavy ATK, Skill, Liberation, Forte/Resonance Skill, Intro, Outro, Chain
  (Resonance Chain / sequence nodes), Echo (the character's own Echo-slot-specific behavior, when
  distinct from equipped-Echo-Set bonuses — see 1.2 below), Buff (passive/kit-sourced, not a "move"
  at all). Used to group blocks for a character and to derive `id` prefixes (§4.2).

- **Category** — `damage.category`, the tag deciding which flat DMG%-buff pools a damage block
  receives. **Revised from v1's closed enum to a namespaced string, see §3.2** — this is the
  single largest substantive change in this taxonomy from v1, driven directly by the "what happens
  when the game adds a 9th move type" adversarial question.

- **Trigger** — `block.trigger`, the condition under which a block activates:
  `type: 'cast' | 'passive' | 'swap-out' | 'ally-action' | 'windowed-proc' | 'dotApplier' | ...`
  plus its `on`/scoping fields. Every block has exactly one Trigger.

- **Logic** — the conditional/derived rules layered on top of a Trigger, deciding *whether a fired
  trigger's effect applies at full value*: `condition` (element/role/HP gates), `sequenceGating`
  (S-level gates), `tieredStacking` (stack-count rules), `energyCycleGating`, and **`applyBuff`'s
  `TYPE_FOCUS_MAP`/`dpsFocus` gate** (v1 did not place this explicitly — it is Logic, not Category:
  it decides whether an *already-categorized* buff contribution counts toward a *specific
  character's* stat accumulation, the same job `condition`/`sequenceGating` do, just keyed on
  `dpsFocus` instead of element/sequence).

- **Function** — a named, pure, reusable computation with no character-specific data: the §0.6
  shared-utilities list plus formula modules (`dotFormulas.js`). Belongs to no Layer specifically;
  called from whichever layer needs it.

- **Character(s)** — the ~57 roster entries, each owning exactly one `.blocks.js` file (or, for
  Rover, one file per element variant — §4.2). A Layer-4 data boundary: data, not logic. No
  character's `.blocks.js` file should contain branching engine logic not already expressible via
  Trigger/Logic/Category fields.

- **Name** — the literal display string used as the roster key across `characters.js`,
  `CHARACTER_DATA`, `CHARACTER_ROTATIONS`, and `characterBlocks/index.js`'s map keys. The single
  canonical identity a character is looked up by everywhere; filenames must derive from it
  mechanically (§4.2), enforced by CI (§8), never diverge from it by hand.

### 1.2 Concepts that don't map cleanly onto the 8 terms — named and placed

The task brief specifically asked whether Resonance Chain nodes, Echo Set bonuses, Weapon passives,
team-composition buffs from other characters, Concerto/resource economy, elemental
reaction/Tune-Break mechanics, timing/duration semantics, and stacking/tiered-stack logic have real
homes. Going through each:

- **Resonance Chain nodes** — already a Section value (`Chain`) plus ordinary blocks gated by
  `sequenceGating` (Logic). No new term needed; v1 already covered this correctly, just implicitly.
  Made explicit here.

- **Echo Set bonuses** — genuinely *not* character-kit data (they're equipment-sourced, shared
  across every character who slots that Echo Set) and today live entirely in `applyFullEchoSet`
  (a Function, §0.6), outside the block system. This is correct as-is, not a gap — but it means
  "every damage-affecting bonus is a TriggerBlock" is **false** as a blanket claim, and future
  documentation/tooling must not assume it. Echo Set bonuses are **Function-layer, Orchestration-
  sourced, not Character-block-sourced** — a third source of stat contribution alongside kit blocks
  and gear, and should be named as such explicitly rather than left implicit.

- **Weapon passives** — same shape as Echo Set bonuses: equipment-sourced, handled via `getWeaponPv`
  (a Function) at Orchestration time, not per-character blocks. Same placement as Echo Set bonuses.

- **Team-composition buffs from other characters** — these ARE TriggerBlocks (a support character's
  buff block, targeting `scope: 'ally' | 'next-on-field' | ...`), already covered by existing
  Trigger/Target machinery (`trigger.type: 'ally-action'`, cross-character-hit triggers per the
  investigation §3). Not a gap; v1 undersold how well-covered this already is.

- **Concerto/resource economy (energy, Concerto Energy, Resonance/Outro-gating resource math)** —
  **a real, partially-covered gap.** `energyCycleGating.js` covers energy-regen cycle gating as a
  Logic concept, and `calcEnergyCycles` (a Function) computes cycle counts, but there is no
  first-class "resource" concept in the schema the way `damage`/`effects` are first-class — a
  block cannot today declare "this consumes N Concerto Energy" or "this requires Concerto Energy
  ≥ N to fire" as structured data; it's folded into ad hoc Trigger/Logic fields per character as
  needed. **Named here as an explicit future schema extension point** (a `resource` field
  alongside `damage`/`effects`, additive under `schemaVersion`, §3.4) rather than left unaddressed
  — not built now (no character audit currently blocked on it, unlike Tune Break), but the schema's
  extensibility story (§3) must be able to add it without another restructuring, which is exactly
  the adversarial test this pass was asked to apply.

- **Elemental reaction / Tune Break mechanics** — already identified in the investigation (§2a) as
  the single largest structural gap (an un-anchored, rotation-aggregate mechanic with no per-event
  Trigger to hang off). v1 deferred this to "Stage 2, out of scope for restructuring" — **that
  deferral is reaffirmed here, but with an explicit taxonomy placement so Stage 2 isn't inventing
  vocabulary from scratch later**: an aggregate reaction is a new Trigger `type` (e.g.
  `'aggregate-rate'`) at Layer 3, consumed by a dedicated Composition-layer aggregator analogous to
  `dotReactionsFromBlocks.js`, not a new Layer. This keeps Stage 2 (still deferred, §7) forward-
  compatible with the taxonomy defined here instead of needing its own vocabulary later.

- **Timing/duration semantics** — already covered (`timing`, `blockWindows.js`, Trigger resolution
  Layer). Not a gap.

- **Stacking/tiered-stack logic** — already covered (`tieredStacking.js`, Logic). Not a gap.

**Net effect on the taxonomy**: the 8 terms remain the right vocabulary, but three things needed
saying that v1 left implicit: (1) not every damage/buff contribution is a TriggerBlock — Echo Set
and Weapon-passive contributions are Function/Orchestration-sourced and must stay documented as a
third source, not silently assumed to be blocks; (2) `applyBuff`'s `dpsFocus` gate is Logic, not an
unplaced mechanism; (3) Concerto/resource economy has no first-class schema field today and needs
one *reserved* (not built) as a named extension point so a future addition is additive, not another
taxonomy debate.

---

## 2. Proposed file/folder structure

### 2.1 `app/src/engine/` — reorganized by Layer (unchanged from v1, re-verified sound)

```
app/src/engine/
  orchestration/
    calcTeamStats.js          # stays here, loses everything below extracts out of it
    rotationOrderSearch.js
    gearAggregation.js        # extracted: applyFullEchoSet/getWeaponPv/calcEnergyCycles/
                               # countTeamElements, currently scattered in calcEngine.js
  composition/
    resolveHitComposedDps.js
    resolveHitComposedTeamDps.js
    resolveSimulatedRotation.js
    resolveSimulatedTeamRotation.js
    rotationSimulator.js
  triggers/
    triggerEngine.js
    blockWindows.js
    sequenceGating.js
    tieredStacking.js
    energyCycleGating.js
    coordinatedAtk.js
  dot/
    dotFormulas.js
    dotReactions.js
    dotReactionsFromBlocks.js
    tuneBreakAggregate.js     # new, Stage-2-equivalent primitive, deferred — see §7
  projection/
    statPanelProjection.js    # the routeTypeBonuses replacement, see §5
    registry.js                # new — the small extensible-projection mechanism, see §6
  shared/
    combatMath.js             # calcDefMult/calcResMult/calcAvgCrit/calcDmgBonus — pure formulas
    roleHelpers.js             # isHealerRole/isSupportRole
    buffAccumulation.js        # applyBuff/TYPE_FOCUS_MAP — the dpsFocus-gated Logic helper (§1.2)
    skillMultiplierParser.js
  schema/
    triggerBlocks.schema.js
    validateBlock.js           # new — the CI-enforced runtime validator, see §8
  characterBlocks/
    <see 4.2>
```

Rationale unchanged from v1: this is the Layer taxonomy from §1 made literal as folders, so "which
layer is this file" is answerable by its path alone. `triggerBlocks.schema.js` keeps its own
`schema/` folder because it's the one file every other layer imports types from.

---

## 3. Block schema — extensible, versioned shape

### 3.1 Why v1's "one canonical shape" needed a versioning story

v1 proposed a single new canonical field order/shape and a migration that mechanically rewrites all
57 files into it (its Phase 1). That is sound *for this one migration*, but it has no answer for
"what happens the next time the schema needs to change" — six months from now, adding the
Concerto/resource field named in §1.2, or a field for a new mechanic type, would again mean either
(a) a flag-day rewrite of every file, repeating the exact risk this restructuring exists to retire,
or (b) informally tolerating two shapes with no way to tell them apart, which is the same
undocumented-convention problem CLAUDE.md's hygiene section forbids. Neither is acceptable for a
"base that must be solid for growth" — so v2 adds a version field and makes every future schema
change additive-by-default against it.

### 3.2 `category` — namespaced string, not a closed enum

v1 proposed `category` as a closed, validator-enforced enum of the 8 known values. Re-examined
against "what happens when the game adds a 9th move type" (a real, expected event for a
live-service game — WuWa has added new Section-shaped mechanics before, e.g. Outro/Intro
categories themselves are relatively recent to this codebase per §0.4's low counts): a closed enum
means every new category requires editing `triggerBlocks.schema.js`'s enum list, the validator, and
every switch/lookup keyed on the enum — a recurring maintenance tax that scales with how often the
game adds content, which is indefinitely.

**Revised design: `category` is a string matching a required, lint-checked pattern**
(`^[a-z][a-zA-Z]*Dmg$`, e.g. `skillDmg`, `basicDmg`, a hypothetical future `bandDmg`) **plus a
separate, append-only registry file** (`schema/knownCategories.js`) that lists every category
currently in use, with a one-line description each. The validator checks two things, not one:
(1) the string matches the naming pattern (catches typos like `skilDmg`/`Skilldmg` — the actual
protection an enum gives), (2) the value exists in the registry (catches a genuinely new,
undocumented category being introduced silently). Adding a real new category becomes: add one line
to `knownCategories.js` (a data file, reviewable in a one-line diff, no logic touched) — not a
schema-file edit, not a validator-logic edit, not touching every categorized switch statement. This
keeps the exact typo-protection an enum gives (§0.4's "missing category → silent zero-credit" bug
class is still structurally caught) while removing the recurring code-change tax for legitimate
growth. This is the actual tradeoff the task asked for: rigid-but-safe enums and
flexible-but-typo-prone strings are not the only two options — a pattern-plus-registry is safer
than a bare string and cheaper to extend than a hard enum.

### 3.3 Canonical block shape

```js
{
  // ── identity (required, in this order) ──
  schemaVersion: 2,                // NEW, required on every block going forward — see §3.4
  id: 'aalto.intro.feint-shot',    // <name-slug>.<section>.<move-slug>, lint-enforced (§4.3)
  source: 'Aalto',                 // canonical Name (§1) — must equal the file's SOURCE const
  section: 'Intro',                // the Section (§1) this block belongs to: BasicATK/HeavyATK/
                                    // Skill/Liberation/Forte/Intro/Outro/Chain/Echo/Buff —
                                    // currently only implicit in `id`/`trigger.on` text
  kind: 'damage' | 'buff',         // required, unchanged

  // ── activation (required) ──
  trigger: { type: ..., on: ... },
  condition: {},                   // present as {} when unused, never omitted

  // ── timing/targeting (required, {} when unused) ──
  timing: {},
  target: { scope: 'self' },

  // ── payload — exactly one of the following, matching `kind` ──
  damage: {
    hits: [...],
    category: 'skillDmg',          // REQUIRED, pattern + registry checked (§3.2), no implicit
                                    // default
    basis: 'ATK',                  // REQUIRED, explicit even for the common ATK case
  },
  effects: [],                     // present as [] when kind:'damage', populated when kind:'buff'
  resource: undefined,             // RESERVED, not built yet — Concerto/energy consumption or
                                    // requirement, see §1.2. Present in the schema type as an
                                    // optional field from day one so a future addition here is
                                    // additive (bumps nothing), not a new top-level field needing
                                    // its own migration.

  // ── documentation (structured, not one free-text field) ──
  mechanicNote: '...',             // optional — genuine mechanical clarification for readers
  knownGap: '...',                 // optional — explicit "this real sub-effect is not modeled" flag
  auditLog: [                      // optional array, replaces today's inline changelog prose
    { date: '2026-09-04', change: 'category added — was missing, silently rejecting...' },
  ],
}
```

### 3.4 `schemaVersion` — the actual answer to "what happens in 6 months"

Every block carries `schemaVersion: <integer>`, starting at `2` for this migration (today's
unversioned shape is implicitly `1`). Rules, permanent, not just for this migration:

- A block missing `schemaVersion` is treated as version 1 (today's shape) by every reader —
  version 1 semantics never get deleted from the codebase's parsing logic, only added to.
- Any future schema change that **adds** an optional field bumps nothing (it's additive against
  whatever version is already declared) — this is why `resource` above is pre-declared as reserved
  rather than added later as a version-3 field: reserving space for known-likely additions inside
  the current version avoids version churn for the easy cases.
- Any future schema change that **changes the meaning** of an existing field, or makes a
  previously-optional field required, bumps `schemaVersion` and both the validator and every
  Layer-3 reader (`triggerEngine.js` etc.) must handle both the old and new version simultaneously
  until every character file is migrated — exactly the coexistence property v1's Phase 1 needed but
  didn't have a name for. `validateBlock.js` (§8) becomes the single place version-branching logic
  lives, so readers don't each reimplement "if v1 then... else if v2 then...".
- This means a second schema change six months from now costs "add a v3 branch to the validator and
  to whichever specific reader cares" — not "reformat 57 files again." The blast radius of a future
  schema change is bounded by how many readers actually care about the changed field, not by file
  count.

This is a strict superset of today's real fields (nothing removed) and is mechanically migratable
per-file (old `note` auto-classified into `mechanicNote`/`knownGap`/`auditLog` by pattern-matching,
human review only for ambiguous cases) — see §7 for how this migration merges into the Phase A
audit cycle instead of running as a separate pass.

---

## 4. Naming, identity, and enforceability

### 4.1 Why "write it down" is not sufficient here

This codebase has already drifted from written naming/casing conventions at least twice
(Rebecca's `ruptureDmgMult` desync, the Rover camelCase/lowercase split in `characterBlocks/`,
per §0.3) — both while a working, documented convention already existed. A third written-only
convention in this document would have the same failure mode. Every naming rule below is therefore
paired with a concrete, automatable check (§8), not left as prose alone.

### 4.2 `characterBlocks/` naming fix

Rule: **filename = the character's canonical `Name` (§1), lowercased, spaces and
non-alphanumerics stripped, `.blocks.js` appended.** No manual exceptions.

- `luukherssen.blocks.js` → stays as-is ("Luuk Herssen" → `luukherssen`).
- `yangyangxuanling.blocks.js` → "Yangyang: Xuanling" → `yangyangxuanling` under the rule; confirm
  the exact string against `characters.js` at implementation time, but the rule itself already
  resolves it unambiguously (colon stripped like any other non-alphanumeric).
- Rover: four distinct roster entries (`Rover (Electro)`, `Rover (Aero)`, `Rover (Havoc)`,
  `Rover (Spectro)`), so four distinct filenames under the rule —
  `roverelectro.blocks.js`/`roveraero.blocks.js`/`roverhavoc.blocks.js`/`roverspectro.blocks.js`.
  Fixes `roverElectro.blocks.js`'s camelCase to match its three already-correct siblings.

### 4.3 Block `id` convention (unchanged from v1)

`<name-slug>.<section>.<kebab-case-move-name>` — already the de facto convention in
`aalto.blocks.js`/`mornye.blocks.js`. Codified as a required, lint-checked pattern (§8).

---

## 5. `routeTypeBonuses()` resolution — corrected design

**v1's design was wrong and is replaced here, not just refined.** v1 proposed summing "the composed
result's real per-category damage totals" (a `categoryTotals`/`categoryBreakdown` object). Re-reading
`calcTeamStats.js:1074-1103` and `calcEngine.js`'s `routeTypeBonuses` directly for this pass shows
`routeTypeBonuses` does not operate on realized damage at all — it operates on **received %DMG-bonus
stat accumulators** (`stats.basicDmg`/`heavyDmg`/`libDmg`/`echoDmg`/`coordDmg`/`skillDmg`, each a sum
of buff percentages gated by `dpsFocus` via `applyBuff`/`TYPE_FOCUS_MAP` on the way in), then
collapses the type-specific buckets into the single `skillDmg` number `calcDmgBonus`'s one-line
formula (`(1 + (elemDmg + skillDmg)/100) × (1 + amplify/100) × (1 + deepen/100)`) expects. v1's
design would have summed the wrong kind of number (damage amounts instead of %-bonus accumulators)
and produced a stat panel with an incorrect `dmgBonus` multiplier for every fully-converted team —
a regression, not an improvement, had it shipped as designed. Caught here by the "don't trust prior
claims, re-verify against real code" discipline this task explicitly asked for.

**Why `dpsFocus`-gating is itself the actual (correct) thing being modeled, not a legacy artifact
to eliminate:** the stat panel deliberately shows a single decomposed `dmgBonus` multiplier as one
term of `effAtk × avgCrit × dmgBonus × defMult × resMult` — a *display* decomposition for the user
to read stat-by-stat, not the total-damage computation itself (total damage is already computed
correctly, per real per-hit category, by `resolveHitComposedTeamDps`'s own `totalDamage`/`dps`
output, independent of this stat-panel branch entirely). Collapsing several %-bonus buckets into one
number for that display is inherent to the decomposition, not an artifact `dpsFocus` invented —
*something* has to decide "does this character's stat panel credit a Basic-ATK-specific buff into
its shown dmgBonus number." `dpsFocus` (the character's kit-declared move-type specialization) is a
reasonable, already-correct signal for that — the bug §0.4/investigation found was never
"`dpsFocus`-gating is wrong," it was specific missing/incorrect `damage.category` tags on individual
blocks feeding the *real* per-hit damage totals shown elsewhere, an unrelated code path.

**Corrected replacement — a faithful, testably-equivalent extraction, not a redesign:**

```js
// projection/statPanelProjection.js
export function projectMainDpsStatPanel(receivedStats, mainDpsMember, enemyContext, dpsFocus) {
  // `receivedStats` is resolveSimulatedTeamRotation's real output (already correctly time-averaged
  // over the main DPS's own on-field segment, per-block accurate — this part was already modern
  // before this proposal and is untouched). This function's ONLY job is the same one
  // routeTypeBonuses did: collapse the type-specific %-bonus buckets into `skillDmg` per the same
  // dpsFocus-gated rule (extracted verbatim from calcEngine.js, not reimplemented from scratch —
  // zero behavior change is the goal here, this is a relocation + naming fix, not a redesign).
  const stats = collapseDmgTypeBuckets(receivedStats, dpsFocus); // same logic as routeTypeBonuses,
                                                                   // moved into projection/ and
                                                                   // renamed for what it does
  const effAtk = Math.round(mainDpsMember.baseStat * (1 + stats.atkPct / 100));
  const avgCrit = calcAvgCrit(stats.cr, stats.cd);
  const dmgBonus = calcDmgBonus(stats.elemDmg, stats.skillDmg, stats.amplify, stats.deepen);
  const defMult = calcDefMult(enemyContext.def90, stats.defShred, stats.defIgnore);
  const resMult = calcResMult(enemyContext.baseRes, stats.resShred);
  const score = Math.round(effAtk * avgCrit * dmgBonus * defMult * resMult
                             * (1 + (receivedStats.totalMultBonus || 0) / 100));
  return { effAtk, avgCrit, dmgBonus, defMult, resMult, score };
}
```

This is deliberately a **relocation-and-rename**, not a behavior change: `collapseDmgTypeBuckets` is
`routeTypeBonuses`'s exact existing logic, moved into `projection/statPanelProjection.js` and given a
name that says what it does (collapses move-type buckets, per `dpsFocus`, into the one bucket the
display formula needs) instead of a name (`routeTypeBonuses`) that reads as generic damage-type
routing and invited v1's mistaken assumption that it operated on damage rather than stat
accumulators. The `dpsFocus`-gated collapse rule itself is preserved exactly (§1.2 places this Logic
correctly, in `shared/buffAccumulation.js`, shared between `applyBuff`'s per-buff gate and this
projection's per-bucket collapse, so there is exactly one place `TYPE_FOCUS_MAP` semantics live, not
two).

**Verification requirement before merge:** extend `phase3-parityGolden.test.js` (already referenced
in the migration plan, §7) to snapshot the stat panel's `effAtk/avgCrit/dmgBonus/defMult/resMult/
score` fields per character, not just rotation DPS, and assert byte-identical output before/after
this extraction — since this is a pure relocation, the golden values must not move at all (unlike
Phase A's audit fixes, where divergence is expected and desired). Any diff here is a bug in the
extraction, full stop, not an intentional improvement.

---

## 6. Projection layer — generalized beyond the one stat-panel case

v1's `projectMainDpsStatPanel` was hard-coded as one function for one UI surface. The task brief
asks explicitly whether this scales to a future comparison view or build-planner view. As written
in v1 it does not — a second UI surface needing a different reshaping of composed engine output
would mean either awkwardly overloading `projectMainDpsStatPanel` with surface-specific branches, or
inventing a second one-off function with no shared discipline, repeating the exact "informal
convention that drifts" problem this whole restructuring exists to fix.

**Revised design — a small registrable-projection pattern, not a new heavyweight abstraction:**

```js
// projection/registry.js
const projections = new Map();
export function registerProjection(name, fn) { projections.set(name, fn); }
export function project(name, composedResult, context) {
  const fn = projections.get(name);
  if (!fn) throw new Error(`Unknown projection: ${name}`);
  return fn(composedResult, context);
}
```

`projectMainDpsStatPanel` (§5) registers itself under `'mainDpsStatPanel'`. A future comparison view
or build-planner view adds its own `projectXyz` function in `projection/`, registers it under its
own name, and both consumers call the same `project(name, composedResult, context)` entry point —
each projection is independently testable, independently owned, and the registry itself (not
per-caller conventions) is the enforced single place all reshaping of engine output happens. This
keeps the actual extensibility property the task asked for (a new UI surface's need doesn't require
touching `calcTeamStats.js` or any existing projection) without inventing speculative machinery for
projections that don't exist yet — the registry is ~10 lines, not a plugin framework.

---

## 7. Migration plan — merged with the Phase A audit cycle, not sequenced before it

v1 proposed Phase 0 (folder/schema restructuring) → Phase 1 (mechanically reformat all 57 files) →
"Phase A resumes." Re-evaluated against the extensibility mandate: Phase 1, as a standalone pass
touching every character file in one blast radius, is itself the kind of large disruptive event
this restructuring is meant to prevent recurring — and it's avoidable, because §3.4's
`schemaVersion` already makes the new schema additive-by-default. There is no technical reason old
(`schemaVersion` absent/1) and new (`schemaVersion: 2`) blocks can't coexist indefinitely while
Phase A continues.

**Revised plan:**

**Phase 0 — folder/schema/projection restructuring, zero character-data changes:**
1. Create the new folder layout (§2) — pure file moves + import-path updates, no logic changes. Run
   the whole existing test suite (including `phase3-parityGolden.test.js`) after, expect zero diffs.
2. Extract §0.6's shared Functions into `shared/combatMath.js`/`shared/roleHelpers.js`/
   `shared/buffAccumulation.js` — pure relocation, same signatures.
3. Land the schema additions from §3 as additive fields under `schemaVersion` (readers accept
   `schemaVersion` absent as v1). Runtime validator (`schema/validateBlock.js`) ships in
   **CI-blocking mode from day one** for any block declaring `schemaVersion: 2`, and in warn-only
   mode for undeclared/v1 blocks — see §8 for why warn-only-forever is not acceptable here.
4. Land `projectMainDpsStatPanel` + the projection registry (§5, §6) as a verified pure extraction,
   gated on the extended `phase3-parityGolden.test.js` (byte-identical requirement, §5).
5. Rename the Rover/naming inconsistencies (§4.2) and land the naming-convention CI check (§8) —
   this one is small and self-contained enough to do immediately rather than defer.

**Phase A + schema migration, merged (replaces v1's separate Phase 1):**
6. Each remaining character audit (~15-16 characters) upgrades that character's `.blocks.js` file to
   `schemaVersion: 2` as part of doing the audit — the audit is already reading and often rewriting
   every block's `category`/`basis`/mechanic values; adding `schemaVersion: 2`, `section`, and
   splitting `note` into `mechanicNote`/`knownGap`/`auditLog` for that same file costs marginal
   effort during an audit that's already touching every block, versus zero marginal value from doing
   it as a separate blanket pass later.
7. Already-audited characters (the ~41 done as of this writing) are **not** required to upgrade
   immediately — they stay on `schemaVersion` absent/1 (still valid, still readable, still
   warn-only-validated) until each one is separately touched for any reason (a future re-audit, a
   patch-driven kit change, a bug report). This is the direct payoff of §3.4's coexistence design:
   the migration cost is amortized across normal maintenance instead of paid in one lump sum, and no
   already-correct character's data is touched purely for reformatting's own sake.
8. Once every character is on `schemaVersion: 2` (a natural byproduct of the audit cycle continuing,
   not a tracked separate milestone), flip the validator from mixed warn/enforce to enforce-only
   across the board — at that point `schemaVersion` absent becomes a CI failure, closing the
   coexistence window cleanly.

**"Done" checkpoint:** Phase 0 complete, validator enforcing for all `schemaVersion: 2` blocks,
`phase3-parityGolden.test.js` (extended per §5) green including stat-panel fields, naming CI check
green, `calcTeamStats.js` fully decoupled from `routeTypeBonuses`/`calcEngine.js`'s flat-table
functions. Phase A continues exactly as before, now also naturally converging every file onto the
new schema — restructuring and ongoing audit are one motion, not two sequential ones.

**Deferred, explicitly not part of this restructuring (unchanged from v1's reasoning):**
- Stage 2's Tune Break aggregate-rate primitive (§1.2 places its taxonomy slot; build deferred).
- Stage 4's Jingran fallback-branch deletion — sequenced to his release (~2026-09-10).
- Auto-Equip/team-composition power-score heuristics — separate design task.
- Physical deletion of `calcEngine.js` — once Phase 0 lands and Jingran converts, its only
  remaining content is dead code; delete then, as a separate small follow-up PR.

**What never gets touched by any phase above:** `MapTab.jsx` and anything connected to it.

---

## 8. Governance / enforcement — automated, not written-down-and-hoped-for

Given this codebase's proven record of violating written conventions (§4.1), every rule in this
document that can be checked mechanically must be, as a CI-blocking check, not left to future
human or agent discipline. Concrete list:

1. **`schema/validateBlock.js`** — runs at `characterBlocks/index.js` load time. Checks, per block:
   `id` matches the naming pattern (§4.3); `source` matches the file's declared `SOURCE` const;
   `category` (for `kind:'damage'` blocks) matches the `Dmg`-suffix pattern AND exists in
   `schema/knownCategories.js` (§3.2); `basis` present; `section` present and one of the enumerated
   Section values (§1.1 — Section is a small, genuinely-closed set tied to the game's own UI move
   categories, unlike `category`, so an enum is correct there, not a namespaced string — a
   deliberately different tradeoff from §3.2 because the two have different growth rates). Runs in
   **CI on every PR touching `characterBlocks/**` or `engine/**`**, not just dev-mode console warns
   — a warn a human can scroll past is not enforcement for a codebase with this project's proven
   drift history.
2. **Naming CI check** — a small Node script (`scripts/checkCharacterBlockNaming.js`) asserting
   every key in `characterBlocks/index.js`'s map, passed through the §4.2 slugification rule, equals
   its own import's filename. Run in CI, blocking.
3. **Shared test-utility requirement** — every `*.blocks.test.js`/character-specific test file must
   import and call a new `expectValidBlockFile(blocksArray, expectedSource)` helper (lives in
   `schema/validateBlock.js`, reused by both the runtime loader and tests) as its first assertion.
   A future character's test file that skips this — the exact way a future contributor might
   individually re-derive "what does a valid block look like" incorrectly — fails immediately and
   visibly, rather than silently shipping a malformed block that only the loader's console-warn
   would have caught.
4. **`phase3-parityGolden.test.js`** — extended per §5 to cover stat-panel fields, remains the
   blocking regression gate for any change touching Orchestration/Composition/Projection layers.
5. **Enforcement cadence** — this document's own restructuring is itself subject to CLAUDE.md's
   existing "every ~50 commits, run `app-restructuring` + a code-audit pass" mandate; nothing here
   creates a new cadence, it plugs into the existing one. The one addition worth naming: once §7's
   migration reaches its "done" checkpoint (validator enforce-only), that checkpoint itself should
   be one of the things a future `app-restructuring` pass verifies hasn't regressed (e.g. a
   `schemaVersion`-absent block reappearing would mean either a new character was added without
   going through the enforced path, or the validator's enforce-only flip was itself reverted by
   accident) — a one-line addition to that skill's own checklist, not a new process.

---

## 9. Summary of what changes vs. what's preserved

**Changes from today's code (unchanged from v1's scope):** folder layout of `app/src/engine/`
(Layer-based), `characterBlocks/` filename consistency, block schema shape (additive fields,
structured docs, enforced `category`/`basis`/`section`), `routeTypeBonuses` relocated to
`projectMainDpsStatPanel` behind a small projection registry, `calcTeamStats.js`'s three
responsibilities (context assembly / composition dispatch / result assembly) made explicit and
separately testable.

**Changes from v1 itself (this pass):** `routeTypeBonuses`'s replacement corrected to operate on
the right kind of data (received %-bonus stats, not realized damage — v1's design was wrong and
would have shipped a stat-panel regression); `schemaVersion` added so schema evolution never again
requires a flag-day rewrite; `category` changed from closed enum to pattern-plus-registry so new
move types don't require code changes; six previously-implicit taxonomy placements made explicit
(Echo Set/Weapon-passive as a third, non-block contribution source; `dpsFocus` gating as Logic;
Concerto/resource reserved as a schema extension point; aggregate-reaction Triggers named for
Stage 2's future use); the projection layer generalized into a tiny registry instead of one
hard-coded function; the migration plan merged into the ongoing Phase A audit cycle instead of
running as a separate blanket reformatting pass; enforcement upgraded from "add a lint check" to
five concrete CI-blocking mechanisms.

**Preserved unchanged:** every shared Function, the existing `trigger`/`timing`/`target`/
`condition`/`effects`/`damage.hits` fields and their semantics, every already-audited character's
actual multiplier/category/mechanic values, the `allMembersConverted` gate architecture (already
the right seam), `phase3-parityGolden.test.js`'s golden-value gate (extended, not replaced), and —
absolute, non-negotiable — `MapTab.jsx` and everything connected to it.
