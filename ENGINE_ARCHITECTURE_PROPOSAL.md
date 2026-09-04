# Engine Architecture Proposal — Single-Engine Restructuring

Status: DESIGN ONLY, not yet approved, no code changed. Written 2026-09-04 in response to the
user's mandate ("I want only one engine... Restructure everything: Name, Section, Layer, Function,
Category, Logic, Trigger, Characters... delete the legacy calcEngine.js path as part of this
restructuring, resolving routeTypeBonuses() as part of the redesign"). Builds directly on
`ENGINE_MERGE_INVESTIGATION.md` and `REMAINING_WORK.md` §1/§1a-1c — read those first; this document
does not re-derive facts already established there, it proposes what to do about them.

**Hard boundary, restated up front:** `MapTab.jsx` and anything connected to it (its hooks,
sub-components, map-specific state/utils) is never touched by this restructuring, or by any phase
of it, for any reason, per CLAUDE.md's standing exception. Nothing below references or depends on
map code; if any future implementation step is found to require touching it, that step stops and
gets flagged, not silently worked around.

---

## 0. Current-state inventory (facts this proposal is built on)

### 0.1 `app/src/engine/` — every file, what it does, its role

| File | Lines | Role |
|---|---|---|
| `triggerBlocks.schema.js` | 529 | The block type definitions (`TriggerBlock`, `trigger`, `timing`, `target`, `condition`, `effects`, `damage`) — the schema itself, plus JSDoc. Everything else imports its shapes. |
| `triggerEngine.js` | 114 | Core per-block resolver: given a block + a step context, decides if it fires and what it contributes. The innermost layer. |
| `resolveHitComposedDps.js` | 245 | Solo/single-character composition: walks a character's own step sequence, calls `triggerEngine` per block, sums real per-hit damage. |
| `resolveHitComposedTeamDps.js` | 243 | Team composition: same job as above but across all team members' interleaved on-field segments, cross-character triggers included. |
| `resolveSimulatedRotation.js` | 131 | Produces the ordered step sequence for one character from `CHARACTER_ROTATIONS` text. |
| `resolveSimulatedTeamRotation.js` | 189 | Team variant — also the function `calcTeamStats.js`'s stat-panel branch calls to get the main DPS's real *received-buff* stats (not damage) for the summary panel (§0.4 below). |
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
  unscoped chain-bonus application), `routeTypeBonuses` (flat DMG%-pool routing by `dpsFocus`),
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
  deferred.

### 0.3 `characterBlocks/` naming — confirmed inconsistencies

Directory listing shows real inconsistency, exactly as the user's framing anticipated:
- **Rover variants**: `roverElectro.blocks.js` (camelCase suffix) vs `roveraero.blocks.js`,
  `roverhavoc.blocks.js`, `roverspectro.blocks.js` (all-lowercase suffix). One of four is
  differently cased from its three siblings for no functional reason.
- **Multi-word names collapsed with no separator**: `luukherssen.blocks.js` (for "Luuk Herssen"),
  `yangyangxuanling.blocks.js` (for what is presumably "Yangyang Xuanling" or a compound
  identifier — needs confirming against `characters.js`'s own key). This is the exact class of bug
  the task brief flagged — a lookup by display name vs file-derived name can silently miss.
- Every other file is a single lowercase word matching a single-word character name (`aalto`,
  `jiyan`, `verina`, ...) — the convention is consistent there, it only breaks down for
  multi-word/multi-variant names, which is precisely where naming ambiguity does the most damage.
- The `index.js` import map already works around this today by hand: it imports each file under an
  inconsistent literal path but re-exports each under a clean `WHATEVER_BLOCKS` constant name keyed
  correctly by the display name string used in `CHARACTER_DATA`/`CHARACTER_ROTATIONS`. So the
  *runtime* lookup is currently safe (the map is the source of truth, not the filename), but the
  *filenames themselves* are not self-describing/consistent, which is exactly the kind of drift
  CLAUDE.md's hygiene section calls out as non-negotiable to fix, not tolerate.

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
  clarification for future readers ("59.65% per Mist Bullet, real bullet count depends on..."),
  (2) an audit-changelog entry ("category fixed 2026-09-03 (Phase A audit)..."), (3) a flag for a
  known unrepresentable gap ("S5's real second component... flagged as a known,
  unrepresentable-in-schema gap"). These are three different *kinds* of information collapsed into
  one free-text field with no structure — a future tool (or a future audit pass) cannot query "show
  me every block with an open known-gap" without grepping prose.
- **`damage.category`** values in actual use today (grepped from every `.blocks.js` file):
  `skillDmg` (120), `basicDmg` (111), `libDmg` (75), `heavyDmg` (63), `echoDmg` (21), `coordDmg`
  (6), `introDmg` (2), `outroDmg` (2, both freshly added on the same 2026-09-04 audit visible in
  `sigrika.blocks.js`). Two things worth flagging: `introDmg`/`outroDmg` are dramatically
  under-represented (2 each, out of ~400 damage blocks total) relative to how many characters
  plainly have real Intro/Outro damage shares per the audit notes already in this codebase (Sigrika,
  Mornye, and others were each found *missing* their Intro/Outro category during Phase A and had to
  be fixed one at a time) — this strongly suggests the categorization gap the investigation already
  named (§2c) is still substantially open across the ~15-16 not-yet-audited characters, not just a
  historical artifact. This is direct, first-party evidence for why Stage 1 (finish Phase A) must
  happen on a stable schema, not be re-run again after a second schema change.

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
       -> stat-panel summary (calcTeamStats.js:1074-1103, ALWAYS runs for allMembersConverted too)
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
`applyFullEchoSet`, `getWeaponPv`, `calcEnergyCycles`, `countTeamElements`. These are pure math /
stat-aggregation, not flat-table damage modeling — they need a permanent home in the new structure
(§1.2), not deletion, and not another "legacy" label.

---

## 1. Proposed taxonomy

The user asked for precise, shared vocabulary for: Name, Section, Layer, Function, Category, Logic,
Trigger, Character(s). Defined below, specific to this codebase, so this document and all future
work (human or agent) can use these words unambiguously.

- **Layer** = a tier of the engine's call graph, by responsibility, not by file. Five layers,
  outermost to innermost:
  1. **Orchestration** — team/rotation-order resolution, enemy context, gear aggregation, buff
     sourcing. (Today: most of `calcTeamStats.js`.)
  2. **Composition** — turns an ordered step sequence + a character's blocks into real per-hit
     damage/buff totals. (Today: `resolveHitComposedDps.js`/`resolveHitComposedTeamDps.js`,
     `resolveSimulatedRotation.js`/`resolveSimulatedTeamRotation.js`.)
  3. **Trigger resolution** — decides, for one block and one step, whether it fires and what it
     contributes. (Today: `triggerEngine.js`, `blockWindows.js`, `sequenceGating.js`,
     `tieredStacking.js`, `energyCycleGating.js`, `coordinatedAtk.js`.)
  4. **Character blocks** — the per-character data: what moves exist, what they do.
     (Today: `characterBlocks/*.blocks.js`.)
  5. **Projection** — turns composed engine output into a *specific UI's* shape (the stat panel,
     the comparison card, the collection tab). This layer does not exist as a first-class concept
     today — `routeTypeBonuses` at `calcTeamStats.js:1085` is an ad hoc instance of it. Making it
     explicit is the core of the `routeTypeBonuses` resolution (§3).

- **Section** = a grouping within one character's kit, corresponding to the game's own move
  categories: Basic ATK, Heavy ATK, Skill, Liberation, Forte, Intro, Outro, Chain (Resonance
  Chain / sequence nodes), Buff (passive/echo/weapon-sourced, not a "move" at all). This is a kit
  vocabulary, used to group blocks for a character (and to derive `id` prefixes, §2.2), distinct
  from Category.

- **Category** = precisely `damage.category` — the tag that decides which flat DMG%-buff pools a
  damage block receives. The full, current set of values in production use (§0.4):
  `basicDmg`, `heavyDmg`, `skillDmg`, `libDmg`, `introDmg`, `outroDmg`, `echoDmg`, `coordDmg`. This
  proposal does not add or remove values from this set (that's Phase A audit work, not a
  restructuring decision) — it only insists the set becomes closed/enumerated in the schema
  (§2.1) instead of an implicit string convention, and that every damage block must carry one
  (no more silent "uncategorized" default).

- **Trigger** = precisely `block.trigger` — the condition under which a block activates:
  `type: 'cast' | 'passive' | 'swap-out' | 'ally-action' | 'windowed-proc' | 'dotApplier' | ...`
  plus its `on`/scoping fields. Trigger is a Layer-3 concept; every block has exactly one.

- **Logic** = the actual conditional/derived rules layered on top of a trigger — `condition`
  (element/role/HP gates), `sequenceGating` (S-level gates), `tieredStacking` (stack-count rules),
  `energyCycleGating`. Logic is what decides *whether a fired trigger's effect actually applies at
  full value*, distinct from the trigger firing itself.

- **Function** = a named, pure, reusable computation with no character-specific data — the §0.6
  shared-utilities list (`calcDefMult`, `calcResMult`, `calcDmgBonus`, etc.) plus formula modules
  (`dotFormulas.js`). Functions belong to no Layer specifically; they're called from whichever
  layer needs them (mostly Orchestration and Composition).

- **Character(s)** = the ~57 roster entries, each owning exactly one `.blocks.js` file (or, for
  Rover, one file per element variant — see §2.2 for the proposed naming fix). "Character" is a
  Layer-4 data boundary — it is data, not logic; no character's `.blocks.js` file should contain
  branching engine logic that isn't already expressible via Trigger/Logic/Category fields, since
  that would silently create a sixth, ungoverned "layer" per character.

- **Name** = the literal display string used as the roster key across `characters.js`,
  `CHARACTER_DATA`, `CHARACTER_ROTATIONS`, and `characterBlocks/index.js`'s map keys. This is the
  single canonical identity a character is looked up by everywhere; filenames must derive from it
  mechanically (§2.2), never diverge from it by hand.

---

## 2. Proposed file/folder structure

### 2.1 `app/src/engine/` — reorganized by Layer

```
app/src/engine/
  orchestration/
    calcTeamStats.js          # renamed conceptually to "orchestrator", see §4 — stays here,
                               # loses everything §5 moves out of it
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
    tuneBreakAggregate.js     # new, Stage-2-equivalent primitive, see §6 Phase 2
  projection/
    statPanelProjection.js    # new — the routeTypeBonuses replacement, see §3
  shared/
    combatMath.js             # calcDefMult/calcResMult/calcAvgCrit/calcDmgBonus — pure formulas
    roleHelpers.js             # isHealerRole/isSupportRole
    skillMultiplierParser.js
  schema/
    triggerBlocks.schema.js
  characterBlocks/
    <see 2.2>
```

Rationale: this is the Layer taxonomy from §1 made literal as folders, so "which layer is this file"
is answerable by its path alone, and a future contributor (human or agent) adding a new file knows
immediately which folder it belongs in from what it *does*, not from historical accretion order (the
current flat `engine/` directory has 17 files with no grouping at all — itself an off-suite
violation of CLAUDE.md's structuring mandate applied to code, not just CSS).

`triggerBlocks.schema.js` gets its own `schema/` folder despite being one file, because it's the
one file every other layer imports types from — giving it a distinct location signals "this is the
contract," not "this is arbitrarily grouped with the trigger-resolution layer it happens to be
closest to."

### 2.2 `characterBlocks/` naming fix

Proposed rule, applied uniformly: **filename = the character's canonical `Name` (§1), lowercased,
spaces and non-alphanumerics stripped, `.blocks.js` appended.** No manual exceptions.

- `luukherssen.blocks.js` → stays as-is under this rule ("Luuk Herssen" → `luukherssen`) — it was
  already right, just undocumented as a rule, which is itself the bug (a rule that exists only in
  one person's head isn't a rule).
- Rover: the four variants are not "one character with four filenames," they're four distinct
  roster entries (`Rover (Electro)`, `Rover (Aero)`, `Rover (Havoc)`, `Rover (Spectro)` — confirm
  exact `Name` strings against `characters.js` at implementation time). Under the rule above they
  become `roverelectro.blocks.js`, `roveraero.blocks.js`, `roverhavoc.blocks.js`,
  `roverspectro.blocks.js` — i.e. fix `roverElectro.blocks.js`'s camelCase to match its three
  already-correct siblings, one-line rename.
- `yangyangxuanling.blocks.js` — confirm its real `Name` key before renaming; if the canonical name
  is actually "Yangyang: Xuanling" or similar, the stripped form should still resolve unambiguously,
  but this needs a direct read of `characters.js`'s entry before any rename, not an assumption here.
- Add a one-time lint check (a small Node script, run in CI or as a pre-commit-style check) that
  asserts every key in `characterBlocks/index.js`'s map, when passed through the naming rule above,
  equals its own import's filename — turning "inconsistent casing has already caused real bugs"
  from a manual-audit finding into a permanently-enforced invariant.

### 2.3 Block `id` convention

Standardize on `<name-slug>.<section>.<kebab-case-move-name>` (already the de facto convention in
`aalto.blocks.js`/`mornye.blocks.js` — `aalto.intro.feint-shot`, `mornye.basic.wide-field-stage1-3`)
— codify it as a required, lint-checked pattern rather than an informal habit, since it's already
correct in the two files inspected and should simply be locked in, not redesigned.

---

## 3. Block schema standardization (canonical shape)

Proposed canonical field order and required-vs-optional status for every block, replacing today's
undocumented convention:

```js
{
  // ── identity (required, in this order) ──
  id: 'aalto.intro.feint-shot',   // <name-slug>.<section>.<move-slug>, lint-enforced (§2.3)
  source: 'Aalto',                 // canonical Name (§1) — must equal the file's SOURCE const
  section: 'Intro',                // NEW, required — the Section (§1) this block belongs to,
                                    // one of: BasicATK/HeavyATK/Skill/Liberation/Forte/Intro/
                                    // Outro/Chain/Buff — currently only implicit in `id`/`trigger.on`
                                    // text; making it a real enumerated field lets tooling query
                                    // "every Intro block across the roster" without string-parsing.
  kind: 'damage' | 'buff',         // required, unchanged

  // ── activation (required) ──
  trigger: { type: ..., on: ... },
  condition: {},                   // present as {} when unused, never omitted — omission today
                                    // is ambiguous between "no condition" and "forgot to add one"

  // ── timing/targeting (required, {} when unused) ──
  timing: {},
  target: { scope: 'self' },

  // ── payload — exactly one of the following two blocks, matching `kind` ──
  damage: {
    hits: [...],
    category: 'skillDmg',          // REQUIRED for every damage block, no implicit default,
                                    // enumerated against the closed Category set (§1) — a missing
                                    // category should be a schema-validation error, not a silent
                                    // zero-credit bug (the exact bug class §0.4 found repeatedly)
    basis: 'ATK',                  // REQUIRED, explicit even for the common ATK case — no more
                                    // implicit ATK-when-omitted default (§0.4)
  },
  effects: [],                     // present as [] when kind:'damage', populated when kind:'buff'

  // ── documentation (structured, not one free-text field) ──
  mechanicNote: '...',             // optional — genuine mechanical clarification for readers
  knownGap: '...',                 // optional — explicit "this real sub-effect is not modeled"
                                    // flag, replaces today's prose-buried gap mentions; a future
                                    // tool can grep every knownGap across the roster directly
  auditLog: [                      // optional array, replaces today's inline changelog prose in
    { date: '2026-09-04', change: 'category added — was missing, silently rejecting...' },
  ],
}
```

This is a strict superset of today's real fields (nothing removed, `note` is split into three
purpose-specific fields, `section`/explicit `basis`/required `category` added) — every existing
`.blocks.js` file can be mechanically migrated (§6) rather than hand-rewritten, since the old
`note` string can be auto-classified into `mechanicNote`/`knownGap`/`auditLog` by simple pattern
matching most of the time, with a human/audit pass only needed for ambiguous cases.

A JSON-schema-style runtime validator (a new `schema/validateBlock.js`, checked at
`characterBlocks/index.js` load time in dev/test builds) should enforce: `category` present and in
the closed enum for every `kind:'damage'` block, `basis` present, `id` matches the naming pattern,
`source` matches the file's declared name. This turns today's manual Phase A audit finding
("missing category → silent zero-credit") into a build-time guarantee going forward, which is the
single highest-leverage change in this proposal relative to effort — it doesn't just fix past bugs,
it makes the entire bug *class* structurally unrepresentable.

---

## 4. Single entry point — `calcTeamStats.js`'s new role

Once `calcEngine.js`'s flat-table path is gone, `calcTeamStats.js` is Orchestration only (§1 Layer
1). Proposed changes:

- Rename the file's *conceptual* role (not necessarily its path, to minimize churn on a
  1,669-line file with many external importers) to make explicit that it now has exactly three
  jobs, each independently testable:
  1. **Context assembly** — rotation order, enemy DEF/RES, gear/echo/weapon aggregation, buff
     sourcing. Pure input-building, no damage math.
  2. **Composition dispatch** — call `resolveHitComposedDps`/`resolveHitComposedTeamDps` with the
     assembled context. No fallback branch once Stage 4 (Jingran conversion) lands — this becomes
     an unconditional call, not a gate.
  3. **Result assembly** — take composition + DOT output and shape it into whatever
     `DamageCalculator.jsx` and friends currently expect (RAW/FULL tiers, member breakdowns).
- Extract job 3's stat-panel-specific piece (today's `calcTeamStats.js:1074-1103`) into the new
  `projection/statPanelProjection.js` (§1 Layer 5, §3 below) — it stops being inline orchestrator
  code and becomes a named, separately-testable function: `projectMainDpsStatPanel(composedResult,
  mainDpsMember, enemyContext) -> { effAtk, avgCrit, dmgBonus, defMult, resMult, score, ... }`.
- These three jobs should be three separately-exported, separately-unit-testable functions inside
  the orchestration module, even if they still live in one file initially — splitting the *file*
  further is optional polish, splitting the *responsibility* is the actual requirement, since job 1
  (context assembly) is reused by every consumer regardless of engine path and should not be
  re-tangled with result shaping again in the future.

---

## 5. `routeTypeBonuses()` resolution — concrete design

Today `routeTypeBonuses` does one real job: given a bag of flat DMG%-bonus totals bucketed by move
type (`basicDmg`/`heavyDmg`/`libDmg`/`echoDmg`/`coordDmg`/`skillDmg`) and a character's `dpsFocus`
array, it collapses everything into a single `skillDmg` number for the stat-panel's one-line
`calcDmgBonus` formula. This was the right shortcut for a flat, rotation-average model — it is not
the right *design* going forward, because the modern engine already knows, per-block, exactly which
`Category` (§1) each point of damage belongs to; collapsing that real per-category breakdown back
down into one number via a `dpsFocus`-based heuristic is strictly less accurate than what the
composition layer already computed for the real per-hit totals.

**Proposed design:** replace `routeTypeBonuses` with a projection function that reads the composed
result's own per-category totals directly, instead of re-deriving an approximation:

```js
// projection/statPanelProjection.js
export function projectMainDpsStatPanel(composed, mainDpsMember, enemyContext) {
  // `composed` is resolveHitComposedTeamDps's real output — it already carries damage broken down
  // by `category` per block, because every block declares one (schema-enforced, §3). No need to
  // re-bucket basicDmg/heavyDmg/libDmg/echoDmg/coordDmg into skillDmg via a dpsFocus heuristic —
  // sum the composed result's actual per-category contribution directly.
  const categoryTotals = composed.categoryBreakdown; // { basicDmg, heavyDmg, skillDmg, libDmg,
                                                        //   introDmg, outroDmg, echoDmg, coordDmg }
  const skillDmgEquivalent = Object.values(categoryTotals).reduce((a, b) => a + b, 0);
  // ...then combine with atkPct/cr/cd/elemDmg/etc. from `composed`'s own received-stats output
  // (resolveSimulatedTeamRotation already computes this correctly, §0.5) into the existing
  // calcDmgBonus/calcDefMult/calcResMult/calcAvgCrit formulas (shared Functions, §1, unchanged).
}
```

Two things make this strictly better than the current `routeTypeBonuses` call, not just an
equivalent rename:
1. It uses the **real composed per-category totals** (the actual damage the engine computed each
   category received) instead of `dpsFocus`-gated flat pools, which were always an approximation of
   what `dpsFocus` merely *implies* a character should receive.
2. It eliminates the `!dpsFocus.includes(type)` zeroing logic entirely — that logic existed only
   because the flat model had no better way to know which pools actually applied; the composed
   result already only contains damage that really happened, so there is nothing left to gate.

This function lives in the new `projection/` layer (§1 Layer 5), is called once from
`calcTeamStats.js`'s result-assembly job (§4), and has zero remaining dependency on
`calcEngine.js`. `dpsFocus`/`CHAR_BUFF_TABLE`'s move-type-focus data itself is not deleted — it
still documents which move types a character's *kit text* names as their specialization, which is
useful data for other UI (character cards, team-suggestion heuristics, §6.4) — it simply stops being
the mechanism for gating the stat panel's own number, since the composed engine result is now the
authoritative source for that.

---

## 6. Migration path

Given ~27 of 57 characters still lack a Phase A audit, and the user's explicit intent is
restructure-then-resume-Phase-A ("when on a good base we will start again properly"), order of
operations:

**Phase 0 — schema and folder restructuring only, zero character-data changes (this is the "good
base"):**
1. Create the new folder layout (§2.1) — pure file moves + import-path updates, no logic changes.
   Run the whole existing test suite (including `phase3-parityGolden.test.js` from `bc32dfe1`)
   after, expect zero diffs.
2. Extract §0.6's shared Functions out of `calcEngine.js` into `shared/combatMath.js` +
   `shared/roleHelpers.js` — pure relocation, same signatures, same call sites' imports updated.
3. Land the schema additions from §3 (`section`, required `category`, explicit `basis`,
   `mechanicNote`/`knownGap`/`auditLog` split) as **additive, non-breaking** schema fields — every
   existing block still parses; the runtime validator is added in **warn-only** mode first (log,
   don't throw), so Phase 0 never blocks on migrating all 57 files' `note` fields at once.
4. Land the `projectMainDpsStatPanel` replacement (§5) and cut `calcTeamStats.js`'s line-1085 call
   over to it. This is the one behavior-sensitive change in Phase 0 — gate it behind the existing
   `phase3-parityGolden.test.js` golden values (extend that test to also assert the stat-panel
   score field, not just rotation DPS, if it doesn't already) before merging.
5. Rename the Rover/naming inconsistencies (§2.2) and add the index-map lint check.

**Phase 1 — mechanical block-schema migration (still zero character-*data* changes, this is
reformatting, not re-auditing):**
6. Auto-migrate all 57 `.blocks.js` files' `note` field into
   `mechanicNote`/`knownGap`/`auditLog` via a one-time script (pattern-match "category
   fixed"/"audit"/date-stamps → `auditLog`; "not modeled"/"flagged as a known gap" → `knownGap`;
   everything else → `mechanicNote`). Add the derivable `section` field per block from its existing
   `id`/`trigger.on` text (mechanical, not a judgment call for ~95% of blocks). Flip the validator
   from warn-only to enforcing once every file passes it.
7. This is explicitly **not** Phase A work — no multiplier, category, or mechanic value changes,
   only structural reformatting of already-correct data into the new shape. Already-audited
   characters keep every fix they have; unaudited characters carry forward whatever they currently
   have, correctly reformatted but not re-verified.

**"Done" checkpoint before Phase A resumes:** Phase 0 + Phase 1 complete, validator enforcing,
`phase3-parityGolden.test.js` green, all 57 files on the new schema shape and folder layout,
`calcTeamStats.js` fully decoupled from `routeTypeBonuses`/`calcEngine.js`. At this point Phase A
audits resume on the new structure — each audit now also has the benefit of the enforced
`category`/`basis` requirements catching the exact "silently uncategorized" bug class (§0.4) at
write-time instead of needing a human to notice it during the audit.

**Deferred, explicitly not part of this restructuring (per the investigation's own findings,
unchanged by this proposal):**
- Stage 2's Tune Break aggregate-rate primitive (§2a of the investigation) — a genuine new engine
  capability, not a restructuring concern; do after Phase 0/1, before or during resumed Phase A.
- Stage 4's Jingran fallback-branch deletion — naturally sequenced to his release (~2026-09-10);
  `calcEngine.js`'s actual flat-table *execution* path (not just its file) can only be deleted once
  this lands, since it is still the only live caller of `applyResonanceChain` in production.
- §2d's Auto-Equip/team-composition power-score heuristics — explicitly out of scope for this
  DPS-correctness/structure restructuring; a separate design task.
- Physical deletion of `calcEngine.js` itself: once Phase 0-1 land and Jingran converts, the file's
  only remaining content is dead code (flat-table functions with zero callers) — delete it then, not
  before, and not as part of this proposal's approval (a separate, small, low-risk follow-up PR).

**What never gets touched by any phase above:** `MapTab.jsx` and anything connected to it — no
phase, no step, references, imports, or depends on map code in any way.

---

## 7. Summary of what changes vs. what's preserved

**Changes:** folder layout of `app/src/engine/` (Layer-based), `characterBlocks/` filename
consistency, block schema shape (additive fields, structured docs, enforced category/basis),
`routeTypeBonuses` replaced by `projectMainDpsStatPanel`, `calcTeamStats.js`'s three responsibilities
made explicit/separately testable.

**Preserved unchanged:** every shared Function (`calcDefMult`/`calcResMult`/etc.), the existing
`trigger`/`timing`/`target`/`condition`/`effects`/`damage.hits` fields and their semantics, every
already-audited character's actual multiplier/category/mechanic values, the `allMembersConverted`
gate architecture (correctly identified in the investigation as already the right seam — not
touched), `phase3-parityGolden.test.js`'s golden-value gate (extended, not replaced), and — absolute,
non-negotiable — `MapTab.jsx` and everything connected to it.
