# Phase 2 plan — wiring precise mechanics into the calc engine

## Status: STARTED 2026-09-01. Scaffold + 6 of ~60 characters converted and
## verified (Rover: Electro, Shorekeeper, Augusta, Jinhsi, Camellya, Yinlin), PLUS a
## working rotation-history state machine (engine/rotationSimulator.js) that
## actually EVALUATES the conditional trigger types those conversions
## introduced, instead of every prior test hand-asserting the outcome. This
## doc is now also a log of what exists, not just a plan — read the "What
## actually exists now" section below before doing anything else in this
## phase.

Phase 1 (see `PHASE1_HANDOFF.md`) rewrote `app/src/data/characters.js` so
every character's Forte/Outro/Resonance-Chain description and numbers are
mechanically precise and sourced, including the full doc-listed roster
(finished 2026-09-01, see PHASE1_HANDOFF.md/git log for the last entry,
Rover: Electro). Phase 1 did **not** touch the calc engine — it deliberately
stopped at "the data is now honest," including honest about what it can't
yet represent (every `// TODO: needs Phase 2 schema` comment left across the
audited characters is a marker for this phase).

Phase 2 was greenlit by the user on 2026-09-01 with this framing: segment
each character's skills/Forte/Resonance-Chain/buffs/debuffs/timing into
separate logical blocks that interact by trigger, condition, timing, and
target — "basically like an engine" — so that once every character has this,
the blocks can be assembled and computed for any team composition
dynamically, not just looked up from a flat table. That request settled
design question 1 below (a typed block-per-mechanic schema, not a generic
DSL) — see "What actually exists now."

## The problem Phase 2 solves

Today, `RESONANCE_CHAIN_DATA[char].s1..s6` and similar fields are a flat
`{ statKey: numberValue }` shape — e.g. `{ skillDmg: 30 }`, `{ elemDmg: 15 }`.
`calcEngine.js` (`applyResonanceChain` around line 623) reads these and
applies them as **always-on, unconditional stat bonuses**. That's a fine
model for maybe half of real nodes. It cannot represent, even after Phase 1
has gotten the *numbers* right:

- **Cast-scoped effects** — a bonus that only applies during one specific
  skill's cast, not persistently (Shorekeeper S6: +42%/+500% Crit DMG, but
  only on the Discernment cast itself, not always-on).
- **Conditional/stateful triggers** — Augusta's Forte point that requires a
  specific partner to Outro back before a third swap; Camellya's Outro bonus
  damage that only applies if Ephemeral was cast earlier in the same
  rotation; Jinhsi's two 5-second cast-order windows that forfeit the
  empowered cast if missed.
- **Discrete extra-hit procs**, not %-modifiers — Yinlin S6 (a flat
  419.59%-ATK "Furious Thunder" proc, capped 4×/30s), Jianxin S6 (a
  556.67%-ATK Special Chi Counter proc gated on a specific input during a
  channel), Calcharo S6 (two separate flat-ATK Phantom hits).
- **Resource-economy effects** — Forte/Energy/stack gain rates, caps, and
  triggers (e.g. Jiyan S1: extra Windqueller charge + Resolve cost
  reduction; Cartethyia S1: a Zeal proc; Iuno S1: +1 Resonance Energy/s in a
  domain). None of this is a damage stat at all.
- **Team-wide vs. self-only scope collisions** — some nodes apply to the
  whole party, others only to the character holding the chain; the flat
  schema has no scope field, so today they're all implicitly treated the
  same way (check how `applyResonanceChain` actually scopes these before
  assuming either behavior).
- **Two multipliers on two different skills sharing one flat field** —
  Camellya S5 does this; the current schema can only hold one number per
  node key.
- **Non-DPS utility on nodes that Phase 1 correctly zeroed** — shields,
  heals, DEF-ignore-only-on-one-move, range increases, interrupt immunity.
  Zeroing was the right Phase-1 move (don't fabricate a DPS number for a
  non-DPS effect) but it means these nodes currently do *nothing* in the
  calc engine, which is its own gap once Phase 2 starts caring about
  non-damage stats (e.g. a future healing/survivability calculator).
- **The zero-damage rotation-step bug class** — Phase 1 is fixing the data
  side (making `CHARACTER_ROTATIONS[char][i].skill` strings actually
  substring-match a `SKILL_MULTIPLIERS[char]` row name), but the underlying
  lookup mechanism (`rowName.includes(step.skill)`, a fuzzy substring match
  with no validation) is fragile by construction — it silently returns
  wrong/zero results instead of erroring. That's worth fixing at the engine
  level too, not just patching each character's strings.

## What actually exists now (2026-09-01) — read this first

A working scaffold and one converted-and-verified character exist under
`app/src/engine/` — **entirely additive**, not yet wired into the live
calculator (`calcEngine.js`/`calcTeamStats.js`/`autoEquip.js` are byte-for-
byte unmodified by this phase so far):

- `app/src/engine/triggerBlocks.schema.js` — the actual schema (JSDoc
  typedefs, no runtime logic). A `TriggerBlock` is
  `{ id, source, kind, trigger, condition, timing, target, effects, note }`.
  Read this file directly — it's short and is the real source of truth for
  the shape, more current than any description of it in this doc. Key
  decisions baked in:
  - `trigger.type` is one of `cast | swap-in | swap-out | passive | on-hit |
    resource-threshold | negative-status-hit | field-time`.
  - `effects[].stat` deliberately **reuses calcEngine.js's existing stat
    vocabulary** (`atkPct`, `elemDmg`, `skillDmg`, `basicDmg`, `heavyDmg`,
    `libDmg`, `echoDmg`, `coordDmg`, `deepen`, `critRate`, `critDmg`,
    `defShred`, `resShred`, `defIgnore`, `totalMult`) instead of inventing a
    parallel one — a converted block resolves through the SAME `applyBuff()`
    switch calcEngine.js already has, so no second damage formula needs to
    be built or kept in sync.
  - This answers design question 1 below: typed-object-per-mechanic, not a
    generic rule DSL — confirmed by the user's own framing of the request.
- `app/src/engine/triggerEngine.js` — `resolveTriggerBlocks(blocks, ctx,
  stats)`, a resolver that walks a block array, checks `triggerFired()`
  against a `Set` of trigger keys that "occurred" in some rotation pass, and
  `conditionHolds()` for element/role gating, then applies matching effects
  via the real `applyBuff()`. This is intentionally minimal — no cooldown
  tracking, no stacking-mode enforcement, no state-machine/rotation-history
  yet (see design question 2, still open — this file does NOT answer it,
  it's stubbed with a hand-fed `firedTriggers` set for now).
- `app/src/engine/characterBlocks/roverElectro.blocks.js` — Rover: Electro
  (the character just fully audited in Phase 1) converted to 15 blocks: 5
  damage, 2 buff, 1 debuff, 6 Resonance Chain, 1 utility×2 (S1/S2, kept
  zeroed with the same "no fabricated DPS component" TODO the flat table
  has). **This is the reference example for converting every other
  character** — follow its structure and its sourcing-comment convention
  (cite characters.js's own already-audited fields, don't re-derive numbers
  from scratch).
- `app/src/__tests__/triggerEngine-rover-electro.test.js` — the parity gate
  pattern: asserts the block set's buff/Resonance-Chain values exactly
  match what the legacy `applyResonanceChain()`/`CHAR_BUFF_TABLE` path
  already produces for that character. **Every converted character needs an
  equivalent test before being trusted** — this is how a regression gets
  caught per-character instead of only being noticed after the whole roster
  is converted.

Known gaps in the scaffold itself (not yet solved, don't assume otherwise):
- **Cooldown enforcement: DONE 2026-09-01** — `RotationSimulator.isReady(blockId)`/
  `useCooldown(blockId, cooldownSeconds)` (a `blockId -> readyAt` Map) plus
  `simulateRotation()` auto-gating any `trigger.type: 'cast'` block whose
  `timing.cooldown` is set: a repeated cast within cooldown still fires its raw
  cast key (the input was pressed) but the specific block is added to a new
  per-step `ineligibleBlockIds` Set, which `resolveTriggerBlocks()` now checks
  (a new optional `ctx.ineligibleBlockIds` param) before applying a block's
  effects — same "name the shape in the state machine, apply it via ctx" split
  as every other conditional trigger type here. Proven with cooldown-blocked
  and cooldown-elapsed cases in `rotationSimulator.test.js` (5 new tests,
  using Yinlin's real 12s Magnetic Roar cooldown). Only matters for a
  multi-loop/repeated-cast simulation — a single canonical one-cast-per-skill
  rotation loop never hits it in practice, but it's a real correctness gap
  closed for anything simulating more than one loop (or team interleaving,
  once that lands).
- **Stacking-mode (`unique`/`stacking`/`refresh`) logic — DONE 2026-09-01.**
  Scoped with the user first (their explicit call: build the full
  time-integration driver now, single-character scope, rather than a
  narrower isolated patch or deferring to multi-character work) — see
  `engine/resolveSimulatedRotation.js`, a NEW module (not a
  `resolveTriggerBlocks()` patch): given one character's blocks + a step
  sequence, it runs `simulateRotation()`, tracks every `'buff'`/`'debuff'`
  block with a real `timing.duration` as a set of activation windows over
  the WHOLE simulated timeline (honoring each effect's own `stacking` mode
  — `'unique'` ignores a re-trigger while still active, `'refresh'` extends
  the open window instead of opening a 2nd, `'stacking'` opens genuinely
  concurrent windows capped at a new `Effect.maxStacks` field), then
  integrates each block's window history into a time-weighted average
  multiplier using the SAME overlap-fraction arithmetic
  `calcTeamStats.js`'s `overlapUptimeForSeg` already uses for its own
  single-instance cross-character buff uptime — generalized (via an exact
  boundary-sweep, not sampling) to sum N possibly-overlapping windows of
  the SAME block instead of one fixed window, since resolving one
  character's own kit has multiple self-re-triggering instances to
  reconcile that calcTeamStats never had. Verified with independently
  hand-computed timings for all three stacking modes (not just "whatever
  the code produces"), plus real end-to-end runs against Yinlin's actual
  `CHARACTER_ROTATIONS` data (`__tests__/resolveSimulatedRotation.test.js`,
  10 tests).
  A duration-less `'cast'`-triggered block (Shorekeeper's S6: active for
  exactly one hit, not a continuous window) is deliberately EXCLUDED from
  this driver's output rather than mis-time-averaged in either direction —
  reported separately via `perHitScopedBlockIds` for the not-yet-built
  per-hit damage-application path to consume later.
  **Also found and fixed while building this**: `simulateRotation()`
  tracked swap EVENTS for window bookkeeping (`registerSwap`/
  `resetSegment`) but never actually marked the plain `'swap-out'`/
  `'swap-in'` trigger keys as fired — meaning every outro-buff block in the
  ENTIRE roster (`trigger.type: 'swap-out'` is how every converted
  character's own outro buff is declared — Rover: Electro, Shorekeeper,
  Augusta, Yinlin, all of them) could never actually resolve through
  `simulateRotation()`, only through a test hand-feeding `firedTriggers`
  directly. Fixed by reusing the existing `isOutroCast`/`isSwapIn` flags to
  also add `'swap-out'`/`'swap-in'` to the fired set; regression-tested
  separately in `rotationSimulator.test.js` since it's a `simulateRotation`
  correctness fix any future caller depends on, not just this new driver.
- `firedTriggers` has to be hand-constructed by the caller; nothing yet
  walks `CHARACTER_ROTATIONS` to derive it automatically for a real
  rotation simulation. That's design question 2 below, still unresolved.
- Per-hit damage values (the actual `%ATK` numbers) still live only in
  `SKILL_MULTIPLIERS` — the PoC's damage blocks carry the trigger/timing
  wiring but `effects: []` for the raw hit %, since migrating the actual
  damage-per-hit formula path is a separate, larger step than wiring up
  buffs/conditions. Don't treat the empty `effects` arrays on damage blocks
  as a bug; it's the documented current boundary.
- Nothing in `calcTeamStats.js`/`CharacterDetailModal.jsx`/
  `RotationTimeline.jsx` reads any of this yet — nothing changed for a real
  user (or the calculator) yet. That's intentional (see rollout note in
  the schema file) but means "Phase 2 has UI-visible effect" is still 0%
  done regardless of how many characters get converted at the data layer.

## Where the current code lives (read before designing)
- `app/src/data/characters.js` — `CHARACTER_DATA`, `CHARACTER_ROTATIONS`,
  `RESONANCE_CHAIN_DATA`, `SKILL_MULTIPLIERS`, `CHAR_BUFF_TABLE` (the data
  Phase 1 is deepening)
- `app/src/features/teams/calcEngine.js` — `applyResonanceChain` (~line
  623) reads `RESONANCE_CHAIN_DATA` and applies it as flat stats; a rotation
  DPS-type-composition helper around line ~726-731 consumes
  `CHARACTER_ROTATIONS` for per-character move sequencing; line ~1197 notes
  the calculator "additionally consumes CHARACTER_ROTATIONS for its
  per-character skill sequence."
- `app/src/features/teams/calcTeamStats.js` — line ~450-455, a
  `richSequence` block that reads `CHARACTER_ROTATIONS[seg.name]` directly
  (separate from `CHAR_BUFF_TABLE`-derived buffs — note this file's own
  comment there for why it's kept separate)
- `app/src/features/teams/RotationTimeline.jsx` — renders the rotation
  step-by-step, keyed off `CHARACTER_ROTATIONS`' `type`/`note`/`skill`
  fields and `SKILL_MULTIPLIERS` row names for the same fuzzy substring
  lookup described above
- `app/src/shared/modals/CharacterDetailModal.jsx` — displays
  `RESONANCE_CHAIN_DATA` per-node (~line 481-486) and a localized rotation
  view; also has its own copy of the `rowName.includes(step.skill)`-style
  lookup used to show per-step damage in the modal (this is the exact
  lookup the zero-damage bug class exploits — worth searching this file for
  every place that pattern appears, there may be more than one)

## Design questions Phase 2 needs to answer before writing code
These aren't answered yet — surface them to the user rather than picking
silently, since they're real product/architecture decisions, not just
implementation details:

1. **Schema shape. ANSWERED 2026-09-01** — typed-object-per-mechanic
   (`TriggerBlock`, see `app/src/engine/triggerBlocks.schema.js`), not a
   generic rule DSL. Confirmed by the user's own request framing ("segment
   ... into separate logical blocks ... interacting by trigger, criteria,
   timing and condition"). Do not re-litigate this — extend the existing
   schema (add a new `trigger.type`, a new `Condition` field, etc.) rather
   than starting a second competing shape. If a real character's mechanic
   genuinely doesn't fit the current schema (this WILL happen — Jinhsi's
   two 5s cast-order windows and Augusta's partner-Outro condition are the
   likely first cases to break it), extend the schema file and its JSDoc,
   don't invent a parallel one-off format for just that character.
2. **Where does the state live? PARTIALLY ANSWERED 2026-09-01** — see
   `engine/rotationSimulator.js` (`RotationSimulator` class +
   `simulateRotation()`). It tracks exactly the two pieces of state the
   trigger types built so far actually need: elapsed time since a
   `windowed-cast` window opened (`_windows: Map<windowKey, openedAtTime>`)
   and swap count since a `partner-outro-return` outro buff was applied
   (`_outroWindows: Map<blockId, {swaps, maxInterveningSwaps}>`) — both
   proven against real success AND forfeit cases in
   `__tests__/rotationSimulator.test.js` (10 tests, e.g. a windowed cast
   landing at 4s of a 5s window fires, landing at 6s forfeits; a partner
   Outro-ing back as the very next swap fires, a 3rd-character swap first
   forfeits). **What this does NOT yet do**: derive its step sequence from
   a real `CHARACTER_ROTATIONS` array automatically (the caller still
   builds the `steps` array by hand — see the test file for the shape),
   assign real per-move timing (`DEFAULT_STEP_SECONDS` is an explicit,
   documented engineering placeholder, not sourced animation data), track
   MULTIPLE characters' rotations interleaved as a real team rotation
   would be (today's tests run one character's blocks against a hand-built
   step list, not a full team timeline), or feed its output into
   `calcTeamStats.js` at all. Those are the next layers, not solved by
   this module alone — but the core question ("track elapsed time + swap
   count as history, not just flat state") now has a working, tested
   answer to build on rather than being open.
3. **Scope of "done."** Is Phase 2's goal (a) just correctly *modeling* these
   conditions in data with TODOs resolved, (b) actually making the DPS
   calculator evaluate them (i.e. a rotation that violates a forfeit
   condition shows lower real DPS), or (c) surfacing them as warnings/hints
   in the UI (e.g. RotationTimeline flags "this step forfeits Augusta's
   extra Forte point because you swapped early")? These are very different
   amounts of engineering work — (b) in particular means the DPS calculator
   becomes a real small state machine, not a sum of static multipliers.
4. **Backward compatibility.** ~21+ characters' worth of Phase-1 TODOs
   already describe the specific gap in prose. Should Phase 2 process them
   character-by-character (matching the Phase-1 cadence, one at a time,
   precision over speed), or design the schema once against a handful of
   the hardest cases (Augusta, Jinhsi, Camellya, Shorekeeper) and then batch
   -apply it? Given the user's stated preference for precision, the
   one-character-at-a-time cadence is likely still right, but confirm.

## Actual current backlog / next steps (as of 2026-09-01)

Converted so far: **Rover: Electro** (PoC, all always-on/passive nodes),
**Shorekeeper** (cast-scoped node, no schema change needed), **Augusta**
(first schema extension — cross-character trigger), and **Jinhsi** (second
schema extension — same-character cast-order forfeit windows) (4 of ~60).

Shorekeeper's S6 (Discernment cast-scoped totalMult+critDmg) proved
`trigger.type: 'cast'` already models "only active during this specific
cast" correctly with NO schema change needed — a block only activates when
its trigger key is present in the caller's `firedTriggers` Set for that
rotation step. See `__tests__/triggerEngine-shorekeeper.test.js`'s "S6 is
cast-scoped" test for the proof.

Augusta's Majesty/Crown-of-Wills stack gain depends on a DIFFERENT
character's action — the resonator she buffed via her own Outro must cast
THEIR OWN Outro back before a third swap, or the condition is forfeited.
Added a new `trigger.type: 'partner-outro-return'` with
`requiresActiveBlock`/`maxInterveningSwaps` fields (see
`triggerBlocks.schema.js`'s Trigger typedef) to name which OTHER block's
active-window gates the trigger. Important limitation, made explicit in
both the schema doc and the block's own note: **this only records the
shape of the condition — it does not evaluate it.** Whether the referenced
block is actually still active when the partner Outros is a real rotation-
history question (design question 2, still open); resolveTriggerBlocks()
just checks whether the caller already put the right key in
`firedTriggers`, same as every other trigger type. Also confirmed Augusta's
S4 (whole-team ATK+20%) is cast-scoped-but-persistent — unlike
Shorekeeper's single-hit-scoped S6, it fires on a cast but then lasts 30s,
proving `timing.duration` composes correctly with a `cast` trigger.

Jinhsi's two 5s cast-order forfeit windows (Overflowing Radiance after
Basic ATK Stage 4/Intro Loong's Halo; Illuminous Epiphany after Incarnation-
Basic Attack Stage 4) are same-character — unlike Augusta's cross-character
Majesty condition, both the window-opening event and the windowed cast
belong to Jinhsi's own rotation. Added `trigger.type: 'windowed-cast'` with
`opensOn` (array of trigger keys — ANY of which opens the window, e.g.
Jinhsi's first window opens on EITHER Basic ATK Stage 4 landing OR Loong's
Halo casting) and `windowSeconds`. **Same limitation as
'partner-outro-return', stated explicitly again because it's the crux of
design question 2**: this field only names the window's shape (what opens
it, how long it stays open) — it does NOT track real elapsed time within a
simulated rotation to evaluate whether a cast actually landed inside that
window. `triggerEngine.js`'s `triggerKey()` keys this trigger type by its
`opensOn` list so multiple distinct windows on one character resolve
independently (proven in `triggerEngine-jinhsi.test.js`). Two conversions
in, the pattern was clear: EVERY conditional-timing mechanic needs its own
named trigger type in the schema (a real design decision, correctly
one-per-shape rather than a generic catch-all), but the actual EVALUATION
of any of them was deferred to a not-yet-built rotation-history state
machine.

**That state machine now exists** — `engine/rotationSimulator.js`, built
2026-09-01 immediately after Jinhsi, per the user's explicit choice to
build it before converting a 5th character (see "Where does the state
live?" in design question 2 above for what it does/doesn't cover yet).
Both `windowed-cast` (Jinhsi) and `partner-outro-return` (Augusta) now
have a real evaluator with passing success-AND-forfeit-path tests, not
just a hand-fed assertion — this was the actual blocker, and it's cleared
for any FUTURE character needing either of these two trigger types. A
character needing a genuinely NEW conditional shape (multi-skill-shared-
node, discrete flat-ATK procs) will still need its own schema field the
same way these two did, but the state-tracking pattern
(`RotationSimulator`'s Map-based window/swap tracking,
`simulateRotation()`'s per-step firedTriggers derivation) is now
established to extend rather than invent from scratch.

**Camellya converted 2026-09-01**, resolving both remaining questions from
her own kit — and revealing she actually needed THREE things, not one:

- Resonance Chain S5's multi-skill-shared-node question (one node, two
  multipliers on two different skills — Everblooming +303%, Twining +68%)
  turned out to need **no schema change at all**. The block model is
  already many-blocks-per-mechanic, so it just became two blocks
  (`camellya.chain.s5-everblooming` / `camellya.chain.s5-twining`) sharing
  one sourcing comment. This is the answer to the question Jinhsi's S4
  raised but didn't resolve: split the node into multiple blocks, don't
  add a multi-target-effect field. Proven in
  `triggerEngine-camellya.test.js`'s "S5 multi-skill split" test — Twining's
  +68% (`rc.s5.twining` is `undefined`) was genuinely unrepresentable in
  the flat `RESONANCE_CHAIN_DATA` table and is now captured.
- Her Outro Twining's bonus DMG turned out to be cast-order-dependent
  (Ephemeral must have been cast earlier the SAME on-field rotation) —
  a THIRD distinct conditional shape, same-character like Jinhsi's
  windowed-cast but NOT time-bounded (no 5s limit, just "was it seen this
  segment"). Added `trigger.type: 'requires-prior-cast'` +
  `RotationSimulator.recordCast()`/`hasCastThisSegment()`/`resetSegment()`
  (segment resets on swap-in) to evaluate it for real — proven in
  `rotationSimulator.test.js` with success, no-cast-yet, AND
  cast-in-a-prior-segment forfeit cases (5 tests total for this shape).

**Yinlin converted 2026-09-01**, resolving the last remaining unproven
mechanic shape: a discrete, repeatable, capped flat-ATK proc (Resonance
Chain S6 "Pursuit of Justice" — Furious Thunder, a separate 419.59%-ATK
Electro nuke, up to 4 procs within 30s of casting Liberation Thundering
Wrath), not a %-modifier to any existing hit. `RESONANCE_CHAIN_DATA
['Yinlin'].s6` was correctly zeroed by Phase 1 rather than fabricate a
totalMult guess for this — same non-negotiable as every other zeroed node.

- Added `trigger.type: 'windowed-proc'` (`opensOnProc`/`windowSeconds`/
  `maxProcs`/`on`) — same "name the window's shape here, evaluate for real
  in the state machine" split already established for `windowed-cast`/
  `partner-outro-return`/`requires-prior-cast`, but REPEATABLE up to a cap
  instead of one-shot (Jinhsi's `windowed-cast` fires at most once; a proc
  window can fire up to `maxProcs` times before closing).
- Added `TriggerBlock.proc` (a new `Proc` typedef: `{ atkPct, category }`)
  to carry the raw flat-ATK-scaling number itself — deliberately kept OUT
  of `effects`, since `effects[].stat` is %-modifier-only (resolved through
  calcEngine.js's `applyBuff()`) and a proc is a whole separate damage
  instance, not a modifier to one. This is the actual answer to the
  "`effects[].stat` needs a new value shape" question this backlog
  flagged: the fix was a sibling field, not overloading `effects`.
- Extended `rotationSimulator.js` with `openProcWindow(windowKey,
  windowSeconds, maxProcs)` / `tryProc(windowKey)` — real elapsed-time AND
  count-cap tracking, proven with success, expiry-forfeit, cap-exhaustion,
  and window-reopen-resets-count cases in `rotationSimulator.test.js`
  (8 new tests), plus an end-to-end 5-Basic-ATKs-in-one-window case proving
  the 4th procs and the 5th doesn't.
- Same documented boundary as every other empty-`effects` damage block in
  this codebase: `resolveTriggerBlocks()` does not yet route `proc` damage
  through `applyBuff()` (there's no formula path for a raw ATK-scaling
  extra hit yet, same gap SKILL_MULTIPLIERS' per-hit %s already have) —
  the real 419.59%/4-cap/30s-window figures are captured and the window/cap
  are now REALLY evaluated, but not yet summed into a DPS number. That's
  the same "computed correctly" vs. "modeled correctly" gap design
  question 3 already named, unresolved either way.

1. **DONE 2026-09-01**: the rotation-history state machine
   (`engine/rotationSimulator.js`), extended same-day for Camellya's
   `requires-prior-cast` and again for Yinlin's `windowed-proc` — see
   above. **DONE 2026-09-01**: the one remaining unproven mechanic shape
   (discrete flat-ATK procs) — Yinlin, above. Resume converting characters,
   same cadence as before (one character, parity test, commit+push, next),
   following `roverElectro.blocks.js`/`shorekeeper.blocks.js`/
   `augusta.blocks.js`/`jinhsi.blocks.js`/`camellya.blocks.js`/
   `yinlin.blocks.js`'s structure. Every schema-extension shape flagged in
   this doc's original backlog is now proven at least once; the next
   characters (Jianxin, Calcharo, and the rest of the ~60-character roster)
   should mostly reuse an existing trigger type rather than need a new one
   — but if one genuinely doesn't fit, extend the schema the same
   deliberate way these six did, and extend `RotationSimulator` (new Map,
   new open/try method pair) rather than inventing a second state-tracking
   mechanism alongside it.
2. **HALF DONE 2026-09-01**: `rotationSimulator.js` now has
   `deriveStepsFromRotation(rotation, blocks)` — walks a REAL
   `CHARACTER_ROTATIONS[charName]` array and auto-derives the `steps`
   array `simulateRotation()` needs (`isSwapIn`, `isSwap`/`isOutroCast`,
   `consumesWindowBlockId`, `triesProc`, `checksPriorCast`), instead of a
   human hand-building it per test. Required two small schema additions to
   make this possible: `windowed-cast.attemptOn` and
   `requires-prior-cast.checksAt` (both `TYPE:SKILL` labels naming WHICH
   rotation step attempts/checks the condition — previously nothing in the
   block itself said this, only a hand-set flag on a test's own step did).
   Verified end-to-end against REAL `CHARACTER_ROTATIONS` data (not test
   fixtures) for Jinhsi (both windowed-cast windows actually land, given
   her rotation's real move order) and Camellya (the prior-cast condition
   actually fires, since Ephemeral really does precede Outro Twining in
   her rotation) — see `rotationSimulator.test.js`'s new
   "deriveStepsFromRotation" describe block (8 tests). Yinlin's case
   surfaced a genuine, useful finding rather than a derivation bug: her
   real rotation's post-Liberation Basic ATK step is a single tap ("Stage
   1", to refill Judgment Points), a different skill label than the S6
   proc block's `on` ("Stage 1-4"), so the derived steps correctly do NOT
   attempt a proc there — the window opens but nothing in this specific
   optimized rotation lands a qualifying hit inside it. Still NOT derived
   automatically: `partnerReturnFor` for `partner-outro-return` blocks
   (Augusta-style) — evaluating whether a DIFFERENT character's Outro
   returned in time is fundamentally cross-character, which a single
   character's own `CHARACTER_ROTATIONS` array can't answer; that still
   needs either a hand-built step or the multi-character interleaving
   below. **Multi-character interleaving: DONE 2026-09-01.**
   `RotationSimulator`'s methods (`isReady`/`useCooldown`, `openWindow`/
   `tryWindowedCast`, `openProcWindow`/`tryProc`, `recordCast`/
   `hasCastThisSegment`/`resetSegment`) now take an optional `owner`
   namespace parameter, composed into their internal Map/Set keys —
   backward-compatible (every single-character call omits it, defaulting
   consistently to `''`, identical behavior to before). `_outroWindows`/
   `registerSwap()` deliberately have NO owner param: partner-outro-return
   and the swap clock are inherently cross-character/global, not
   per-character, by design. `simulateRotation(blocks, steps)` is now a
   thin wrapper over a new shared core (`simulateStepsCore`) — single- and
   multi-character resolution are the SAME code path, not two parallel
   implementations that could drift.
   New: `simulateTeamRotation(ownedSteps, blocksByOwner)` — the low-level
   multi-character entry point (an already owner-tagged, time-ordered step
   array + each member's own block set). New: `buildTeamSteps(members)` —
   the real-data entry point: reuses `deriveStepsFromRotation()` per member
   (no duplicated annotation logic), then adds exactly the two things a
   single character's own view can't know: (1) a guaranteed swap boundary
   between every consecutive member pair regardless of whether the
   outgoing member happens to have an outro-BUFF block (Camellya's
   `outroBuffs` is genuinely empty, but her swap-out still has to count
   against the team's shared swap clock or Augusta-style
   `maxInterveningSwaps` counting would silently undercount), and (2)
   `partnerReturnFor` cross-referencing for `partner-outro-return` blocks —
   when member `i` has one gating on their own outro, member `i+1` (the
   very next member in team order, matching how `'next-on-field'` buffs
   already resolve elsewhere in this codebase) has their own real Outro
   step tagged as the return attempt.
   Verified against REAL `CHARACTER_ROTATIONS` data for a genuine 3-member
   team (Augusta + Yinlin + Rover: Electro) in
   `__tests__/simulateTeamRotation.test.js` (10 tests) — this is the first
   time Augusta's Majesty/`partner-outro-return` condition (the ONLY reason
   that trigger type exists in the schema at all) has been proven against
   a real multi-character timeline rather than a single character's block
   set in isolation or a fully hand-fed `firedTriggers` set. Includes a
   discrimination test (not just an always-succeeds check): reordering the
   team so Rover: Electro sits between Augusta and Yinlin correctly
   redirects the cross-reference to Rover: Electro (the ACTUAL next
   member) instead of silently keeping it pinned to Yinlin.
   **Also found and fixed while building this**: `RotationSimulator`'s
   state was never actually isolated per character even conceptually
   before this refactor — a real fix, not just new capability, since any
   FUTURE multi-character caller would have silently cross-contaminated
   cooldowns/windows/segments between characters without it (verified
   explicitly in `simulateTeamRotation.test.js`'s "owner-namespaced state
   stays isolated" describe block).
   Follow-up same day (below): the time-integration driver WAS generalized
   to teams (`resolveSimulatedTeamRotation.js`), and a verification layer
   proved it agrees with `calcTeamStats.js` on real data — see that entry.
   `buildTeamSteps` still expects the caller to supply members in
   already-decided on-field order; reusing `calcTeamStats.js`'s own
   order-search logic (not reimplementing it) is what the verification
   layer below does by calling `calcTeamStats()` itself and reading its
   real `rotationTimeline.segments`, rather than `buildTeamSteps` needing
   its own copy of that search.

**`resolveSimulatedTeamRotation.js` + verification layer — DONE 2026-09-01.**
Scoped with the user first, explicitly: a real DPS-number cutover into
`calcTeamStats.js` isn't honestly possible yet regardless of caution, since
every converted character's damage blocks still carry `effects: []` (the
`SKILL_MULTIPLIERS`-to-engine per-hit migration is separate, larger, and
not started) — the engine only knows how to compute BUFF modifiers, not the
damage number they'd apply to. So this pass built the actual prerequisite
instead: proof that the engine's cross-character buff math agrees with
`calcTeamStats.js`'s own real algorithm, before any cutover is even
attempted.

- `engine/resolveSimulatedTeamRotation.js` — the team-level generalization
  of `resolveSimulatedRotation.js`: given `buildTeamSteps()`'s output and a
  `targetName`, computes that ONE team member's time-weighted received stat
  totals, routing `'self'`-scoped blocks only from their own owner,
  `'whole-team'`-scoped blocks from ANY member (including the target
  itself) via overlap with the target's own on-field segment, and
  `'next-on-field'`-scoped blocks only from whichever member is the
  IMMEDIATE predecessor in team order — exactly matching
  `calcTeamStats.js`'s own `outroStart()`/`blockStart()`/`overlapUptimeForSeg`
  conventions. Reuses `resolveSimulatedRotation.js`'s
  `timeWeightedAverageConcurrency` verbatim (exported specifically for
  this, generalized from a bare `totalTime` number to an arbitrary
  `{start, end}` recipient segment — single-character mode is now just the
  `{0, totalTime}` special case, same code, no drift risk between the two).
  Verified with 7 tests: self-scope isolation (Yinlin's own chain bonuses
  don't leak onto Augusta), whole-team routing with a real non-trivial
  uptime fraction (not always 0% or 100%), whole-team blocks reaching their
  OWN source too, next-on-field adjacency (only the immediate next member
  receives it, proven by reordering the team and watching the recipient
  change), and a not-on-the-team target resolving cleanly instead of
  crashing.
- **The verification layer itself**
  (`__tests__/verifyEngineAgainstCalcTeamStats.test.js`) — calls the REAL,
  UNMODIFIED `calcTeamStats()` (confirmed via `git diff --stat` showing
  zero changes to that file — this pass touched no live user-facing code
  at all) purely to read its own genuine `rotationTimeline.segments`
  (real on-field order from its actual order-search, real per-member
  timing), feeds that identical order into `buildTeamSteps`, and compares
  the engine's cross-character outro-buff uptime against
  `calcTeamStats.js`'s own `overlapUptimeForSeg` formula (reproduced
  verbatim in the test — not exported from the live file, since exposing
  test-only plumbing from the real calculator wasn't worth the risk) — on
  the SAME real segments, not hand-picked ones. The two independently
  computed uptime fractions match to floating-point precision.
  **Explicitly scoped, not swept under the rug**: this verifies the
  outro-buff (`'next-on-field'`) mechanism only. It deliberately does NOT
  attempt to reconcile `RESONANCE_CHAIN_DATA`'s legacy cross-character
  leakage — `calcTeamStats.js`'s own `applyResonanceChain` blanket-applies
  specific fields (`atkPct`/`critRate`/`critDmg`/`elemDmg`-via-`allDmg`/
  `basicDmg`/etc.) from EVERY team member's own chain data onto the main
  DPS's stats regardless of that node's real target scope, as a legacy
  approximation — against the engine's more precise per-block
  `target.scope` model. The two are EXPECTED to diverge in places (the
  engine is intentionally more correct than that blanket legacy
  heuristic); reconciling or fixing the legacy heuristic itself is a
  separate legacy-code question, not something to silently paper over
  here.
  **Still not done, and not attempted this pass**: any actual cutover of a
  real DPS number shown to users. That stays blocked on the per-hit-damage
  migration (SKILL_MULTIPLIERS → engine damage blocks), same as always —
  this pass only proves the buff-modifier half of the pipeline is
  trustworthy, which was the honestly achievable, correctly-scoped goal.
3. Grep `app/src/data/characters.js` for every `// TODO: needs Phase 2
   schema` comment left by the Phase 1 passes for the full sourced backlog
   of known-hard mechanics, one entry per real conditional mechanic found
   in verified source material — don't re-derive this list from scratch.
4. **PARTIALLY DONE 2026-09-01**: the fragile `rowName.includes(step.skill)`
   lookup was centralized into `characters.js`'s new
   `findSkillMultiplierRow(charName, step)` — the ONLY place in the code
   that actually did this lookup was `CharacterDetailModal.jsx` (line ~559;
   `calcEngine.js`/`calcTeamStats.js`/`RotationTimeline.jsx` all consume
   `CHARACTER_ROTATIONS` for other purposes and don't do this specific
   per-step damage lookup, contrary to what this doc's "Where the current
   code lives" section implied — verified by grepping, not assumed). The
   new function tries an EXACT `type`+`name` match first, only falling back
   to the historical fuzzy substring match, and in dev builds
   (`import.meta.env.DEV`) console.warns on every step that resolves via
   the fuzzy fallback OR fails to resolve at all — turning the silent-zero
   failure mode into a visible one during development. `CharacterDetailModal.jsx`
   now calls it instead of an inline `.find()`.
   A NEW automated regression test (`__tests__/data-integrity.test.js`,
   "CHARACTER_ROTATIONS / SKILL_MULTIPLIERS lookup integrity") runs this
   exact lookup against the full roster in CI. It is NOT a "must resolve
   for every step" assertion — most of the ~80 steps that don't resolve are
   legitimately non-damage (stance swaps, descriptive multi-move labels,
   Forte continuations), and telling those apart from a real naming bug
   needs per-step judgment this test can't make alone (that finer-grained
   classification IS the larger not-yet-done "stable id field" migration
   this backlog item originally asked for — still not done). What the test
   DOES do: snapshot the current ~80 unresolved steps as a known baseline
   and fail if a NEW one appears that isn't already in it — so a future
   data edit that breaks a PREVIOUSLY-RESOLVING step (a row rename, a typo)
   is caught by CI instead of waiting for another manual audit, without
   requiring this pass to retroactively classify every existing
   non-resolving step first. Still open: the actual stable-`id`-field
   migration (would let the baseline shrink to zero for real, and let
   fuzzy-match be removed entirely) — a larger, separate effort across all
   ~60 characters' SKILL_MULTIPLIERS rows, not attempted here.
5. Only once several more characters are converted AND item 2's
   `rotationSimulator.js` gaps (real `CHARACTER_ROTATIONS` derivation,
   multi-character interleaving) are closed: wire `triggerEngine.js`'s
   output into `calcTeamStats.js`, gated per-character (only use a
   character's blocks once that character has a verified parity test —
   fall back to the legacy flat-table path otherwise) so cutover is
   incremental and never all-or-nothing. Not started — nothing in the
   live calculator reads `app/src/engine/` yet.
6. Re-verify against `CharacterDetailModal.jsx` and `RotationTimeline.jsx`
   that the new schema renders correctly in the UI, not just computes
   correctly. Not started.

## Design doc: totalMult → hit-composed DPS (scoped 2026-09-01, NOT yet decided/built)

Asked for by the user after discovering (see the finding above, same date)
that `calcTeamStats.js`'s real DPS formula never consumed `SKILL_MULTIPLIERS`
in the first place — it multiplies `rEff × (d.totalMult / 100) × avgCrit ×
dmgBonus × defMult × resMult`, where `d.totalMult` is ONE hand-entered
scalar per character (`characters.js:1375`: "sum of ATK% multipliers in one
full rotation"). This section scopes what actually replacing that with real
per-hit composition would mean — explicitly a DESIGN DOC, not a decision to
build it. Nothing below has been implemented against `calcTeamStats.js`
itself; see "Stage 1" at the bottom for what WAS actually built this pass
(a standalone, unwired prototype).

### Why the current architecture is a real fidelity ceiling, not just "less precise"

`totalMult` isn't merely an approximation of the same information a
hit-composed sum would produce — it's structurally incapable of
representing anything Phase 2 exists to model:
- A buff that's only active for ONE specific hit (Shorekeeper's S6: +42%
  totalMult/+500% Crit DMG on the Discernment hit only) gets averaged
  across the WHOLE `totalMult` scalar instead of applying at full strength
  to exactly the hit it's meant for and zero elsewhere.
- A cast-order-dependent forfeit (Jinhsi's two 5s windows, Yinlin's 30s/
  4-proc Furious Thunder cap) has NO way to lower `totalMult` when the
  real-game condition is missed — the flat scalar assumes the average case
  always happens, so a rotation that actually violates the window shows
  IDENTICAL DPS to one that doesn't. This is the literal thing Phase 2 was
  greenlit to fix, and `totalMult` cannot express it no matter how precise
  the engine's trigger evaluation gets underneath it.
- Team-wide/cross-character buffs already get REAL uptime-weighted
  treatment via `overlapUptimeForSeg` (see the verification-layer entry
  above) — but that real uptime fraction still only scales the SAME flat
  `totalMult`, not individual hits, so a buff active for the first half of
  a character's combo (and NOT the crit-heavy second half) is
  indistinguishable from one active for the second half instead.

### Proposed architecture (not yet built beyond Stage 1 below)

1. **Data prerequisite — per-hit `%ATK` on damage blocks.** Every converted
   character's `kind: 'damage'` blocks currently carry `effects: []`
   (documented boundary since Rover: Electro's PoC). A real number needs to
   live somewhere — proposed as a new `TriggerBlock.damage` field (mirroring
   the `proc` field's precedent): `{ hits: [{ atkPct, statCategory }] }`,
   parsed from `SKILL_MULTIPLIERS`' existing percent-string rows (e.g.
   `'28.81% → 33.82%×2 → 13.99%×7 → 75.16%'`), so no new numbers are
   invented — same sourcing discipline as everything else in this schema.
2. **Point-in-time buff query.** Every existing driver
   (`resolveSimulatedRotation.js`/`resolveSimulatedTeamRotation.js`)
   answers "what's the time-WEIGHTED AVERAGE contribution of this block
   over a whole segment" — hit composition needs the opposite: "what's
   ACTIVE at this exact instant." Proposed: refactor the shared per-block
   window-building logic (identical in both existing drivers today) into
   one place with two aggregation modes — the existing
   `timeWeightedAverageConcurrency` (integrate over a segment) and a NEW
   `activeCountAt(windows, instant, cap)` (sample a single instant) — so a
   hit-composed calculator can ask "what buffs are live right when this
   specific hit lands" using the SAME window history the averaged drivers
   already build, not a third parallel implementation.
3. **Per-hit damage formula.** Reuses `calcEngine.js`'s existing, already-
   tested primitives verbatim — `calcAvgCrit`, `calcDmgBonus`,
   `calcDefMult`, `calcResMult` — exactly the same formula shape
   `calcTeamStats.js`'s FULL tier already uses per-character, just
   evaluated ONCE PER HIT with that hit's own point-in-time stats instead
   of once per character with a segment-averaged one.
4. **Rotation-level sum.** DPS = (sum of every hit's damage across one
   full simulated rotation) / rotation time — replacing `totalMult`'s
   single multiplication entirely for whichever character has real
   per-hit data.
5. **Where this would plug into `calcTeamStats.js`.** NOT a rewrite — a
   new, parallel, per-character-gated code path (same "verified parity
   test or fall back to the legacy path" rule this doc has stated since
   before Rover: Electro was even converted): a character with a verified
   block set AND real per-hit damage data could route through the new
   calculator instead of `totalMult`; every other character keeps working
   exactly as today. `calcTeamStats.js` itself is NOT touched by this
   design doc or by Stage 1 below.

### Verification strategy (if/when this is actually built out)

Exact equality with the legacy `totalMult` number is explicitly the WRONG
bar — the whole point is that hit composition is more precise, so it's
SUPPOSED to diverge whenever a conditional/cast-order mechanic the flat
scalar could never represent actually matters. The right checks: (a)
same-order-of-magnitude sanity bounds against the legacy number for a
rotation with no missed conditions (the common case), and (b) a rotation
that DELIBERATELY violates a cast-order window (e.g. a Jinhsi rotation that
misses her 5s Overflowing Radiance window) must show LOWER hit-composed DPS
than the same rotation executed correctly — a discrimination test the
legacy `totalMult` path structurally cannot pass either way, since it has
no mechanism to notice the difference at all.

### Open risks/questions, not resolved here

- Per-hit-scoped guaranteed-crit effects (Shorekeeper's S6: that ONE hit is
  a guaranteed crit, not `avgCrit`'s expected-value blend) need a new
  per-hit override the schema doesn't have yet.
- `DEFAULT_STEP_SECONDS` (1.5s, an explicit engineering placeholder, never
  real per-move animation timing) matters MORE under hit composition than
  under buff-averaging — exact hit ORDER and window timing now directly
  determines the DPS number, not just an averaged uptime fraction. Real
  animation timing may be worth sourcing before this is trusted broadly.
- Whether/how to surface this to users at all before every character has
  both a verified block set AND real per-hit data (a toggle? Only for
  characters where it's ready? None of this is decided.)

### Stage 1 — what was actually BUILT this pass (2026-09-01) — DONE

Scoped narrowly and deliberately: prove the architecture end-to-end for
ONE already-converted character, standalone, verified against hand-checked
numbers — NOT wired into `calcTeamStats.js`, NOT yet extended to the whole
roster or to team-level integration.

- `engine/skillMultiplierParser.js` — `parseSkillMultiplierHits(str)` turns
  a `SKILL_MULTIPLIERS`-style percent string (e.g. `'28.81% → 33.82%×2 →
  13.99%×7 → 75.16%'`) into a real per-hit array, expanding `×N` shorthand
  into N separate hit entries. No new numbers invented — re-expresses the
  same already-audited strings. Deliberately narrow: doesn't try to
  algorithmically tell apart "one skill's own multi-stage combo" from "two
  different skills combined in one row" (both use `→` in the source data)
  — that judgment call still needs a human reading the kit text, same as
  every other per-character interpretation this schema has ever needed
  (Camellya's S5 split is the precedent). 5 tests against real strings.
- New `TriggerBlock.damage` field (`{ hits: [{atkPct}], category }`) —
  kept OUT of `effects` for the same reason `proc` is (a hit is a whole
  damage instance, not a %-modifier `applyBuff()` can resolve).
- **Yinlin's damage blocks populated** with real per-hit data via the
  parser: Basic ATK (4-stage combo, 11 hits), Thundering Wrath (7 hits),
  Chameleon Cipher (2 hits). **Found and fixed a real gap while doing
  this**: Magnetic Roar and Lightning Execution had been folded into ONE
  combined block sharing Magnetic Roar's trigger — meaning Lightning
  Execution's own real `cast:Skill:Lightning Execution` key (exactly what
  `CHARACTER_ROTATIONS`' own separate Lightning Execution step produces)
  could never resolve through `simulateRotation()` on its own. Split into
  two blocks (`yinlin.skill.magnetic-roar` / `yinlin.skill.lightning-
  execution`), same "split shared multi-hit nodes into multiple blocks"
  precedent Camellya's S5 already established — not a new pattern, just a
  case that had been missed.
- `engine/blockWindows.js` — extracted the window-building logic that had
  been duplicated near-verbatim in `resolveSimulatedRotation.js` and
  `resolveSimulatedTeamRotation.js` into one shared place
  (`buildBlockWindows()`), so the two drivers can no longer silently drift
  apart on how `unique`/`refresh`/`stacking` behave. Both files refactored
  to use it; `timeWeightedAverageConcurrency` now lives here too
  (re-exported from `resolveSimulatedRotation.js` for backward
  compatibility). Added the actual NEW piece this stage needed:
  `activeCountAt(windows, instant, cap)` — the point-in-time counterpart
  to the existing time-INTEGRATED query, answering "is this buff active
  RIGHT NOW" instead of "what's its average contribution over a span."
- `engine/resolveHitComposedDps.js` — the actual prototype: sums real
  per-hit damage across a full simulated rotation using
  `calcEngine.js`'s existing, already-tested `calcAvgCrit`/`calcDmgBonus`/
  `calcDefMult`/`calcResMult` primitives (reused verbatim, same formula
  shape `calcTeamStats.js`'s own FULL tier already uses per character —
  just evaluated per HIT with that hit's own point-in-time stat snapshot
  instead of once per character with a segment-averaged one).
  Verified with 4 tests: a hand-computed baseline (zero DEF/RES, no buffs
  — the total matches an independently computed reference number, not
  just "whatever the code produces"), a passive buff correctly boosting
  only its own damage category (S1's skillDmg+70 raises Magnetic Roar's
  damage by exactly 70%, leaves Basic ATK's untouched), and a real
  end-to-end run against Yinlin's actual `CHARACTER_ROTATIONS` data.
  **Found and documented (not fixed) a further real gap** while writing
  the end-to-end test: `trigger.type: 'resource-threshold'` (Chameleon
  Cipher's own trigger — Judgment Points reaching 100) never fires through
  `simulateRotation()` at all — there is NO resource-gauge simulation
  anywhere in the engine, and `CHARACTER_ROTATIONS`' step data has no
  structured gauge values to derive one from (only prose notes). Real,
  separate, larger work than this prototype — documented in the test
  itself rather than silently asserted as working.
  S6 Furious Thunder (a `proc`, not `damage.hits`) correctly contributes
  ZERO to this prototype's total — proc composition (a discrete, capped,
  repeatable extra hit) is a distinct next increment on top of this one,
  not silently folded in as if already solved.

**Proc composition — DONE 2026-09-01 (same day, immediately after Stage 1).**
Turned out to need almost no new machinery: a `'windowed-proc'` block's
trigger key already only appears in a step's `firedTriggers` on the exact
step where `RotationSimulator.tryProc()` succeeded (same
`triggerFired()`/`triggerKey()` path every other trigger type already goes
through) — `resolveHitComposedDps.js` just needed to stop skipping blocks
whose real number lives in `proc` instead of `damage.hits`. Converts a
`proc` field to an equivalent single-hit `{atkPct, category}` on the fly.
Verified with 3 tests using Yinlin's real S6 Furious Thunder: a hand-built
rotation that actually lands a qualifying Basic ATK inside the 30s
post-Liberation window adds a real 419.59%-ATK hit; the same rotation with
the window closed first adds nothing; 5 qualifying attempts inside one
window produce exactly 4 proc hits (the `maxProcs` cap), not 5. Also
confirmed (not a regression, an already-known finding restated with the new
capability in place): her REAL `CHARACTER_ROTATIONS` sequence still
produces zero proc hits, since her canonical post-Liberation Basic ATK step
is a single tap ("Stage 1"), a different skill label than the proc's `on`
("Stage 1-4") — a genuine fact about this specific optimized rotation, not
an engine gap.

**`resource-threshold` triggers — DONE 2026-09-01 (same day).** Not real
gauge-accumulation simulation (no per-hit gain-rate data — Judgment
Points/Electric Surge/Concerto Energy gain-per-hit, caps — is sourced
anywhere in `characters.js` yet; that would be a genuinely separate, larger
modeling task). Instead added `trigger.resourceStepOn` — a `TYPE:SKILL`
label, same convention as `attemptOn`/`checksAt`/proc's `on` — naming which
`CHARACTER_ROTATIONS` step ITSELF represents the threshold being reached
(Yinlin's Chameleon Cipher: `'Forte:Chameleon Cipher'`; Rover: Electro's
Overshock damage AND selfbuff blocks: `'Forte:Overshock'`). This is honest,
not a shortcut dressed up as one: the rotation guide's own step sequence
already encodes "the gauge is full here" — Yinlin's own
`CHARACTER_ROTATIONS` note literally says "Once Judgment Points hit
100/100, her Heavy Attack is replaced by this automatically" — so reusing
that existing, sourced assertion doesn't invent anything, it just wasn't
being READ by the trigger-firing code before. `deriveStepsFromRotation()`
auto-tags the matching step (`firesResourceThreshold`);
`simulateRotation()`/`simulateTeamRotation()` fire the real
`'resource-threshold:...'` key there — the SAME key format `triggerKey()`
already produces, so this required zero changes to
`resolveTriggerBlocks()`/`resolveHitComposedDps()`, only teaching the
step-derivation/firing layer to read a field it was ignoring. Verified with
3 new tests (`rotationSimulator.test.js`) plus updated
`resolveHitComposedDps.test.js` end-to-end coverage — Yinlin's Chameleon
Cipher (2-hit, 178.93%×2) now correctly appears in a real rotation's hit
log, where it previously silently never fired. A future real gauge
simulator, if ever built, supersedes this rather than conflicting with it.

**Rover: Electro's `damage.hits` — DONE 2026-09-01 (same day).** Populated
every existing damage block, and found a real gap while doing it: his
4-stage Basic ATK combo (`Deterrence 1-4` — the very FIRST real damage step
in `CHARACTER_ROTATIONS['Rover: Electro']`) had NO block at all before this
— only its auto-chained follow-up (`Repel`) was ever modeled. Added
`rover-electro.basic.deterrence`, same "fill the gap found during
migration" precedent as Yinlin's Lightning Execution split. Verified with
2 new tests (hand-computed Thunderclap reference number, real end-to-end
rotation run confirming every block — including the newly-added Deterrence
block and the resource-threshold-gated Overshock — fires exactly once).

**Bigger finding, worth flagging explicitly**: Shorekeeper, Augusta,
Jinhsi, and Camellya have **NO damage blocks at all** — their conversions
only ever modeled buffs/Resonance Chain/utility, never their actual
skill-cast damage. "Extending `damage.hits` to the other 5 converted
characters" was written assuming a data-population task (like Yinlin/
Rover: Electro); for these four it's actually closer to a FRESH
damage-block conversion pass each (trigger wiring + SKILL_MULTIPLIERS
parsing + gap-checking against CHARACTER_ROTATIONS, the same amount of
work Yinlin/Rover: Electro's original damage-block sections took) — not
attempted in this pass, flagged here rather than started blind or silently
folded into a smaller-sounding checklist item.

**Shorekeeper/Augusta/Jinhsi/Camellya's damage blocks — DONE 2026-09-01
(same day).** All four converted from scratch (each had zero damage blocks
before this). Two genuinely new schema capabilities came out of this pass,
both reused across characters rather than one-offs:
- `damage.basis` (`'ATK'`/`'HP'`/`'DEF'`) + `damage.guaranteedCrit` —
  Shorekeeper's Discernment scales off HP and is a guaranteed Crit, both
  per its own already-sourced kit text. `resolveHitComposedDps.js` now
  takes `baseStats` as `{atk, hp, def}` (a bare number stays valid
  shorthand for `{atk}`) and throws a clear error if a block needs a base
  stat that wasn't provided, rather than silently computing off
  `undefined`.
- Confirmed (again) that `'/'`-separated `SKILL_MULTIPLIERS` rows combining
  multiple distinct moves in one string need splitting into separate
  blocks per real `CHARACTER_ROTATIONS` step (Augusta's Thunderoar row:
  Backstep/Spinslash/Uppercut; her Undying Sunlight row: Strike/Leap/
  Plunge; Jinhsi's Forte row: Incarnation-Basic-ATK/three Illuminous
  Epiphany sub-modes) — same precedent as Yinlin's Lightning Execution
  split, now proven across `/`-joined rows too, not just `→`-joined ones.

Two REAL, honestly-documented limitations found and left open rather than
forced or silently glossed over:
- **Camellya's `'Vining Waltz 1-4 / Blazing Waltz'` step appears twice in
  her canonical rotation with the IDENTICAL label**, once in Blossom Mode
  (Vining Waltz's real numbers) and once in Budding Mode (mechanically
  Blazing Waltz instead — a different row, `21.95%×19`). Because both
  occurrences share one `{type, skill}` key, one block fires identically
  both times using the Vining Waltz values for both — the 2nd occurrence's
  real damage is undercounted. Fixing this needs `CHARACTER_ROTATIONS`
  itself to give the two occurrences distinct skill strings — the same
  "zero-damage rotation-step" bug-class family this doc already tracks
  (item 4), not something the block schema alone can solve.
- **Camellya's Outro Twining's conditional +459.02% bonus (gated on Forte
  Ephemeral having been cast earlier that segment) is still NOT composed
  into a real hit** — only the unconditional base 329.24% is. The
  conditional half is already NAMED by
  `camellya.outro.twining-ephemeral-bonus` (a `'requires-prior-cast'`
  utility block), but turning that into an actual extra damage instance
  needs either a 2nd damage block sharing the Outro trigger plus the
  prior-cast condition, or a schema change letting one damage block carry
  a conditional bonus hit — neither attempted here. A real, separate next
  increment, not silently folded into "Camellya's damage blocks are done."

All 6 converted characters (Rover: Electro, Yinlin, Shorekeeper, Augusta,
Jinhsi, Camellya) now have real `damage.hits` data and pass real
end-to-end `resolveHitComposedDps` runs against their actual
`CHARACTER_ROTATIONS` data — verified with 731→735 total suite tests
across this whole session, all green, `calcTeamStats.js` untouched
throughout (confirmed via `git diff --stat` after every single commit in
this pass, not just checked once at the start).

**Team-level hit composition — DONE 2026-09-01 (same day).**
`engine/resolveHitComposedTeamDps.js`: given one target team member and a
full multi-character rotation, sums their real per-hit damage with
cross-character buffs correctly landing only on the hits that overlap the
buff's real active window — not a segment-averaged approximation. Built the
same way `resolveSimulatedTeamRotation.js` generalized
`resolveSimulatedRotation.js`: reuses the identical `target.scope` routing
rules (`'self'` only from the target's own blocks, `'whole-team'` from any
member including the target, `'next-on-field'` only from the immediately
preceding team member), just sampling each relevant block's window at the
hit's own instant (`activeCountAt`) instead of integrating over a segment.
Only the target's OWN damage/proc blocks ever contribute a hit to their own
total — another character's kit can only reach them via a buff, never
directly deal them damage, matching how the real game works.
Verified with 4 tests, the marquee one being a genuine per-hit
DISCRIMINATION proof (not just "the total is bigger"): a hand-built
2-member scenario where Yinlin casts the identical Basic ATK combo twice —
once while Augusta's 30s whole-team ATK+20% window is open, once well after
it closes — shows the buffed cast's damage-per-%ATK ratio is EXACTLY 1.2x
the unbuffed cast's, hit-for-hit. This is precisely the fidelity a flat
`totalMult`/segment-averaged uptime number can never express — the actual
point of the whole "totalMult → hit-composed DPS" design doc. Also verified
end-to-end against the real 3-member Augusta/Yinlin/Rover: Electro team
built from actual `CHARACTER_ROTATIONS` data, and that `dps` is measured
against the TARGET's own on-field segment duration (matching real-game
"how hard does this character hit while actually on field"), not the whole
team timeline.

**Camellya's Twining conditional-bonus gap — CLOSED 2026-09-01 (same day),
once there was somewhere real for it to land.** With
`resolveHitComposedDps.js`/`resolveHitComposedTeamDps.js` now existing,
`camellya.outro.twining-ephemeral-bonus` changed from `kind: 'utility'`
(a bare condition marker, `effects: []`) to `kind: 'damage'` with a real
`damage: { hits: [{atkPct: 459.02}] }`. No new wiring was needed —
`deriveStepsFromRotation()`'s existing `checksAt` tagging already fires
this block's `requires-prior-cast` key on the SAME step as
`camellya.outro.twining-base`'s cast key, so both blocks resolve together
automatically. Verified with success (Ephemeral cast earlier this segment
→ both 329.24% AND 459.02% hits land) and forfeit (never cast → only the
base 329.24%) cases, plus confirmed her REAL `CHARACTER_ROTATIONS`
sequence (Ephemeral at step 5, Twining at the last step) actually composes
the bonus now.

**Still not done, deliberately**: (1) Camellya's OTHER documented gap
(her repeated `'Vining Waltz 1-4 / Blazing Waltz'` step sharing one label
across two mechanically-different casts) — genuinely blocked without new
`CHARACTER_ROTATIONS` data (the two occurrences need distinct skill
strings to ever be told apart; not something to invent), (2) the actual
`calcTeamStats.js` gating/wiring decision — still requires its own
separate go-ahead, per the "never all-or-nothing" rule, and is not any
closer to being decided than before this stage — none of this proves
anything beyond the ARCHITECTURE being sound. (3) Converting the remaining
~54 unconverted characters to the engine at all — a separate, much larger,
ongoing roster-coverage effort, distinct from "finishing the engine"
itself.

## Hard rules carried over from Phase 1
- Never touch `MapTab.jsx` or anything connected to it, ever, no exceptions.
- Follow the PerfectSuite numeric-scale rule (see `CLAUDE.md`) for any px
  values touched if this phase touches UI in `RotationTimeline.jsx` /
  `CharacterDetailModal.jsx`.
- Commit and push to whatever branch this phase is done on; no PR unless
  asked; no amend/rebase.
