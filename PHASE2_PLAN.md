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
2. Once 1-2 more characters are converted, revisit `rotationSimulator.js`'s
   own known gaps (see design question 2 above): deriving `steps`
   automatically from a real `CHARACTER_ROTATIONS` array instead of a
   hand-built list, and tracking multiple characters' interleaved
   rotations as a real team timeline instead of one character's blocks in
   isolation. Both are needed before any of this can feed
   `calcTeamStats.js` for real.
3. Grep `app/src/data/characters.js` for every `// TODO: needs Phase 2
   schema` comment left by the Phase 1 passes for the full sourced backlog
   of known-hard mechanics, one entry per real conditional mechanic found
   in verified source material — don't re-derive this list from scratch.
4. Fix the fragile `rowName.includes(step.skill)` lookup pattern at the
   engine level (exact-match against a stable `id` field, not fuzzy
   substring) so the zero-damage bug class can't recur even if a future
   data edit introduces a new naming mismatch. Not started.
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

## Hard rules carried over from Phase 1
- Never touch `MapTab.jsx` or anything connected to it, ever, no exceptions.
- Follow the PerfectSuite numeric-scale rule (see `CLAUDE.md`) for any px
  values touched if this phase touches UI in `RotationTimeline.jsx` /
  `CharacterDetailModal.jsx`.
- Commit and push to whatever branch this phase is done on; no PR unless
  asked; no amend/rebase.
