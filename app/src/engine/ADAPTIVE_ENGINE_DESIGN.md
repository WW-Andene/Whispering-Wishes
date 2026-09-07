# Adaptive Character Engine — Design Proposal

## Problem

Today, a character's `.blocks.js` file is a flat table of TriggerBlocks (real
damage/buff values, real trigger labels) played back against **one
hand-authored `CHARACTER_ROTATIONS` sequence**. Nothing about a character
actually *runs* as a state machine:

- `condition.requiresStance` is documented in the schema as **"purely
  descriptive"** — no live tracker holds "which stance is this character in
  right now." `sequenceGating.js`'s `winningStanceForOwner()` resolves ONE
  fixed stance for the whole rotation pass (a build-level assumption), not a
  value that can change mid-rotation as moves are cast.
- Resource meters (Concerto Energy, Chi, Frostheart, Incandescence, Snow
  Rust, Dedication, Sentience, Photos, ...) have **real partial infra**
  already (`resourceGain` on a block, `resource-threshold` trigger type,
  `RotationSimulator#gainResource`/`#resourceAtLeast` in
  `resolver/dps/rotationSimulator.js`) — but only ONE character (Aemeath)
  uses it, and it only ever accumulates by replaying the fixed curated
  rotation; nothing chooses a next action based on the running total.
- Cross-character/team-composition-reactive conditions (Hiyuki's Glacio Bite
  extending to any teammate's Chafe application, Aemeath's Between the
  Stars) exist only as bespoke, one-off resolvers
  (`resolver/dot/resolveBetweenTheStars.js`-style) built per specific case —
  there's no general "this block's condition can query the real live
  teammate roster" mechanism.
- The rotation itself — what button gets pressed next — is 100%
  hand-transcribed prose in `CHARACTER_ROTATIONS`, not derived from kit
  rules. Change the team, and nothing adapts: the same fixed button sequence
  plays back regardless of who else is on the field.

That's the gap the user is pointing at: a character's kit data (multipliers,
costs, caps, cooldowns, stance transitions) is almost entirely present and
sourced already — it's just never wired into anything that computes with it
live.

## Scope boundary (per direct instruction)

Tune Break/Off-Tune and similarly unquantifiable procs (no sourced
detonation frequency, no stack table) stay explicitly excluded, same as this
session's existing precedent (`dotFormulas.js`'s own note on why Tune Break
was removed 2026-09-05). "Pretty much everything else in the kits is
computable" is the working assumption for this design.

## Proposed architecture

### 1. `CharacterRuntimeState` — real per-character live state

A plain object per character-in-team, replacing the implicit state that
today only exists as "wherever the curated rotation script happens to be":

```js
{
  stance: string | null,        // current Resonance Mode / stage, if the kit has one
  resources: {                  // gauge name -> { value, cap }
    'Chi': { value: 0, cap: 120 },
    ...
  },
  cooldowns: {                  // blockId -> time remaining
    'jianxin.skill.calming-air': 0,
  },
  stacks: {                     // status/buff stack name -> count
    'Snow Rust': 0,
  },
}
```

This is the missing piece `winningStanceForOwner()` and
`gainResource()`/`resourceAtLeast()` were each independently reaching for —
unifying them into one real state object per character is what lets a
condition query "what stance/resource/stack state is this character in
right now," not just "what does the curated script say happens here."

### 2. Schema extensions — encode kit RULES, not just kit VALUES

Most of these values already exist in `characters.js`'s comments/Data
dumps; they need dedicated fields instead of prose:

- `resourceCost: { resource, value }` — a cast's real gauge cost (already
  half-present via `resourceGain`; cost is the missing mirror).
- `stanceTransition: { from, to }` — a cast that changes stance (e.g.
  Iuno's Flux: Moonbow Half Moon → New Moon), replacing the current
  "descriptive-only" `requiresStance`.
- `timing.cooldown` already exists and is real — needs to be ENFORCED by the
  decision layer below, not just used for the existing steady-state DPS
  discount (`cooldownSteadyState` in `resolveHitComposedDps.js`).

### 3. Decision layer — replaces authored `CHARACTER_ROTATIONS`

A greedy, priority-list-driven chooser: given current `CharacterRuntimeState`
+ team roster + a per-character **priority list** (sourced from the same
real player-guide reasoning `CHARACTER_ROTATIONS`' own step notes already
encode — "press X once Y is full", "cancel into Z" — just expressed as
ordered rules instead of hand-narrated prose), pick the next real action
each tick: highest-priority action whose `resourceCost`/`condition`/
`cooldown` are currently satisfiable, else fall through the list.

This is a genuinely new module (`engine/resolver/decision/` — new engine
subdirectory, flagged here as the structural addition it is per this
project's own hygiene rules) — not a small addition to the existing
resolvers.

### 4. Cross-character reactivity — generalize the one-off resolvers

Extend `condition` to optionally query a real, passed-in team roster of
`CharacterRuntimeState`s (stance, tags applied this tick) instead of each
cross-character interaction needing its own bespoke resolver file. The
existing `ally-action` trigger + `appliesTags` mechanism is the right shape
for this already — it needs to read live per-teammate state instead of only
this-tick tags.

## What this replaces vs. keeps

- **Keeps:** every real sourced number already in `SKILL_MULTIPLIERS`,
  `CHAR_BUFF_TABLE`, `RESONANCE_CHAIN_DATA`, and every `.blocks.js` file —
  none of that data changes.
- **Replaces:** `CHARACTER_ROTATIONS` as ground truth for "what happens" —
  it becomes, at most, a fallback/validation reference once the decision
  layer can derive the same sequence itself from kit rules.

## Migration plan (not a single big-bang change)

Given ~60 characters, this needs a small number of pilot characters to prove
the pattern before any broad rollout — proposed as a SEPARATE decision from
this doc, once the design itself is confirmed. Candidates already have the
most groundwork done this session: Hiyuki (state: Present/Foreclaimed Self,
Frostheart/Dedication/Whiteout Bitterfrost/Snowforged Blade resources, Iai
stance) or a simpler single-resource character as a smaller first proof.

## Status

Design only — no code changes yet. Flagged per this repo's own rule that a
new top-level engine subdirectory / architecture change is a structural
decision requiring confirmation before implementation starts.
