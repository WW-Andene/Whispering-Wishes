# Phase 2 plan — wiring precise mechanics into the calc engine

## Status: not started. This is a planning document, not a log of work done.

Phase 1 (see `PHASE1_HANDOFF.md`) is rewriting `app/src/data/characters.js` so
every character's Forte/Outro/Resonance-Chain description and numbers are
mechanically precise and sourced. Phase 1 does **not** touch the calc engine
— it deliberately stops at "the data is now honest," including honest about
what it can't yet represent (every `// TODO: needs Phase 2 schema` comment
left across ~21 characters so far is a marker for this phase).

**Do not start Phase 2 until Phase 1 is closer to done and the user
explicitly says to start it.** This doc exists so that when that happens,
the next Claude isn't starting from zero on design.

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

1. **Schema shape.** Does each Resonance-Chain-node / Forte-mechanic get a
   small typed "condition" object (e.g.
   `{ type: 'cast-scoped', appliesTo: 'Discernment', stat: 'critDmg', value: 500 }`
   vs. `{ type: 'requires-prior-cast', requires: 'Ephemeral', withinSameRotation: true, bonus: {...} }`),
   or a more general small rule-expression format? A typed-object-per-
   mechanic-shape approach is probably more tractable to hand-author for 58
   characters than a generic DSL, but confirm with the user before
   committing — this is the single biggest design decision in Phase 2 and
   changes how much re-work the Phase-1-authored TODOs turn into.
2. **Where does the state live?** Cast-order dependencies and forfeit
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

## Suggested approach once the user greenlights Phase 2
1. Grep `app/src/data/characters.js` for every `// TODO: needs Phase 2
   schema` comment left by the Phase 1 passes — that's the actual, sourced
   backlog (not hypothetical), one entry per real conditional mechanic
   found in verified source material.
2. Design the schema shape against 3-4 of the hardest real cases already on
   file (Augusta's partner-Outro-back condition, Jinhsi's two 5s cast-order
   windows, Camellya's cast-before-Outro dependency, Shorekeeper's
   cast-scoped Crit DMG) rather than in the abstract — get the user's
   sign-off on the shape before applying it broadly.
3. Fix the fragile `rowName.includes(step.skill)` lookup pattern at the
   engine level (exact-match against a stable `id` field, not fuzzy
   substring) so the zero-damage bug class can't recur even if a future
   data edit introduces a new naming mismatch.
4. Decide and implement the state-machine/simulation piece needed for
   question 2/3 above — likely the biggest single chunk of engineering work
   in this phase.
5. Re-verify against `CharacterDetailModal.jsx` and `RotationTimeline.jsx`
   that the new schema renders correctly in the UI, not just computes
   correctly.

## Hard rules carried over from Phase 1
- Never touch `MapTab.jsx` or anything connected to it, ever, no exceptions.
- Follow the PerfectSuite numeric-scale rule (see `CLAUDE.md`) for any px
  values touched if this phase touches UI in `RotationTimeline.jsx` /
  `CharacterDetailModal.jsx`.
- Commit and push to whatever branch this phase is done on; no PR unless
  asked; no amend/rebase.
