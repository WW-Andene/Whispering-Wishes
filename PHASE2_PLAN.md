# Phase 2 plan — wiring precise mechanics into the calc engine

## Status: STARTED 2026-09-01. Scaffold + 1 of ~60 characters converted and
## verified. This doc is now also a log of what exists, not just a plan —
## read the "What actually exists now" section below before doing anything
## else in this phase.

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
- No cooldown enforcement, no stacking-mode (`unique`/`stacking`/`refresh`)
  logic — `STACKING_MODES` is declared in the schema but `triggerEngine.js`
  doesn't read it yet.
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
2. **Where does the state live? STILL OPEN — the scaffold does NOT solve
   this.** Cast-order dependencies and forfeit
   windows are inherently about a rotation's *history* (what was cast
   before, how long ago, whether a swap happened since). The rotation
   simulator/calculator needs to track that as it walks through
   `CHARACTER_ROTATIONS`, not just sum flat multipliers. That's a real
   simulation-state design, not a data-schema tweak alone.
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

Converted so far: **Rover: Electro** (PoC, all always-on/passive nodes) and
**Shorekeeper** (2 of ~60). Shorekeeper's S6 (Discernment cast-scoped
totalMult+critDmg) proved `trigger.type: 'cast'` already models "only
active during this specific cast" correctly with NO schema change needed —
a block only activates when its trigger key is present in the caller's
`firedTriggers` Set for that rotation step, so a cast-scoped bonus and a
passive/always-on one are naturally distinguished by which trigger.type is
used, not by extra condition logic. See
`__tests__/triggerEngine-shorekeeper.test.js`'s "S6 is cast-scoped" test
for the proof (asserts the bonus is absent when Discernment wasn't cast
this step, present when it was).

Still not stress-tested by either conversion: cast-order/forfeit-window
dependencies (Jinhsi's two 5s windows, Augusta's partner-Outro-back
condition), cross-character partner conditions, multi-skill-shared-node
values (Camellya S5), and discrete flat-ATK procs instead of %-modifiers
(Yinlin/Jianxin/Calcharo S6-style). These will very likely require a real
schema extension, not just another block file — see the updated backlog
below.

1. **Convert one more character per pass, hardest cases first**, following
   `roverElectro.blocks.js`/`shorekeeper.blocks.js`'s structure and writing
   a parity test (`triggerEngine-<name>.test.js`) for each one before
   moving on — same cadence/discipline as the Phase 1 data audit (one
   character, verify, commit+push, next). Remaining priority order:
   Augusta (partner-Outro-back condition — needs a new trigger/condition
   shape entirely, since it depends on ANOTHER character's action, not
   just this character's own trigger history), Jinhsi (two 5s cast-order
   forfeit windows — this is what actually answers design question 2),
   Camellya (cast-before-Outro dependency + one node with two multipliers
   on two different skills — tests whether one block can/should have
   per-effect trigger overrides or needs to split into two blocks),
   Yinlin/Jianxin/Calcharo (discrete flat-ATK procs, not %-modifiers —
   `effects[].stat` may need a new 'flatProc' variant, not just the
   existing % stats).
2. Grep `app/src/data/characters.js` for every `// TODO: needs Phase 2
   schema` comment left by the Phase 1 passes for the full sourced backlog
   of known-hard mechanics, one entry per real conditional mechanic found
   in verified source material — don't re-derive this list from scratch.
3. Once 2-3 of the hard cases above are converted and the schema has
   proven it can represent them (extending the schema file itself is
   expected and fine; starting a second parallel shape is not), implement
   the state-machine/rotation-history piece for design question 2 — this
   is the biggest remaining chunk of real engineering work in this phase,
   bigger than converting the rest of the roster. `triggerEngine.js`'s
   current hand-fed `firedTriggers` Set is a stand-in for this, not a
   solution to it.
4. Fix the fragile `rowName.includes(step.skill)` lookup pattern at the
   engine level (exact-match against a stable `id` field, not fuzzy
   substring) so the zero-damage bug class can't recur even if a future
   data edit introduces a new naming mismatch. Not started.
5. Only once the schema is proven against the hard cases AND the state-
   machine piece exists: wire `triggerEngine.js`'s output into
   `calcTeamStats.js`, gated per-character (only use a character's blocks
   once that character has a verified parity test — fall back to the
   legacy flat-table path otherwise) so cutover is incremental and never
   all-or-nothing. Not started — nothing in the live calculator reads
   `app/src/engine/` yet.
6. Re-verify against `CharacterDetailModal.jsx` and `RotationTimeline.jsx`
   that the new schema renders correctly in the UI, not just computes
   correctly. Not started.

## Hard rules carried over from Phase 1
- Never touch `MapTab.jsx` or anything connected to it, ever, no exceptions.
- Follow the PerfectSuite numeric-scale rule (see `CLAUDE.md`) for any px
  values touched if this phase touches UI in `RotationTimeline.jsx` /
  `CharacterDetailModal.jsx`.
- Commit and push to whatever branch this phase is done on; no PR unless
  asked; no amend/rebase.
