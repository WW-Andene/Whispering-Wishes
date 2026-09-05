# Authoring / remaking a character's TriggerBlock file

This is the standalone spec for touching exactly one character's `.blocks.js` file —
remaking it from scratch, fixing one value, or converting a not-yet-touched one. You
should be able to do this having read only this file, `engine/schema/block.schema.js`,
and `aalto.blocks.js` as the reference example — not by having watched the whole
engine rewrite happen.

## The contract

Every block in `<name>.blocks.js` is validated against `engine/schema/validate.js` at
**module load time** (`engine/characterBlocks/index.js` calls `expectValidBlockFile()`
on every character's array). A block that doesn't match the shape throws immediately,
in every test and in the running app — there is no warn-only mode. If your edit breaks
validation, `npx vitest run` will fail loudly and tell you exactly which field is
missing or invalid.

## Required fields on every block

- `id` — `<name-slug>.<section>.<kebab-move-name>`, e.g. `aalto.forte.misty-cover`.
- `source` — the character's exact display name (the file's own `SOURCE` const),
  cross-checked against the array key in `index.js`.
- `kind` — one of `damage` / `buff` / `debuff` / `heal` / `utility`.
- `section` — one of `BasicATK`/`HeavyATK`/`Skill`/`Liberation`/`Forte`/`Intro`/`Outro`/
  `Chain`/`Echo`/`Buff`. This is the game's own move category, not a computed label —
  derive it from the block's own `trigger.on` value or its place in the kit, never
  guess from the id alone if it's ambiguous. `Buff` is the fallback for a generic,
  non-move-anchored kit passive (an Inherent Skill with no single cast to anchor to).
- `trigger` — what causes the block to fire. See `block.schema.js`'s `Trigger` typedef
  for the full set of trigger types and when each applies.
- `timing`, `target`, `effects` — always present, `effects: []` is valid for a block
  with no stat contribution (e.g. a damage-only block, or a documented-inert one).

## `damage.basis` and `damage.category` — read this before touching a damage block

- `damage.basis` is **required** on every `kind: 'damage'` block. Default `'ATK'`.
  Only use `'HP'`/`'DEF'` when the character's own kit text says explicitly the hit
  scales off that stat instead (e.g. Shorekeeper's Discernment).
- `damage.category` is **optional**. This is not a gap to fill by default — omission
  is a real, deliberate statement that this hit draws no category-specific %DMG Bonus
  (an Intro/Outro cast excluded from routing per the game's own mechanics, or a hit no
  audit has yet confirmed a category for). **Never invent a category to satisfy the
  validator** — it doesn't require one. If you do set one, it must be a real,
  registered value from `engine/schema/categories.js` and must match what the
  character's own kit text says the hit counts as (a move's own "considered X DMG"
  line, or the source dump's own damage-type breakdown) — not a guess based on section.
  Layer 4 of the engine rewrite hit this exact mistake: a batch migration defaulted
  every previously-uncategorized block to `skillDmg`, which silently changed computed
  damage for two characters and was only caught by a golden-snapshot parity test. Don't
  repeat it — an uncategorized block computing 0 category-specific bonus is correct
  more often than a guessed category is.

## Buff `effects[].source` — required on every `kind: 'buff'` block's effects

One of:
- `'self-kit'` — a passive/Chain/self-buff from the block's own owner, landing on the
  owner or the whole team via the owner's own trigger (their own cast, their own
  passive).
- `'teammate-ally-action'` — granted via an Intro/Outro cast, an `ally-action`/
  `partner-outro-return` trigger, or any buff whose `target.scope` is
  `'next-on-field'`/`'on-field'`/`'trigger-actor'` — i.e. specifically meant to land on
  someone other than the owner via a handoff.
- `'echo'` / `'weapon'` — from equipped gear, not from a character's own kit. These
  don't apply to characterBlocks files (that's echo/weapon-data territory) — don't use
  them here.

Judge by the block's own `trigger.type` and `target.scope`, not by guessing. `debuff`-
kind blocks don't require `source` on their effects (only `buff` does), though adding
one for documentation clarity doesn't hurt.

## Sourcing discipline

Every numeric value must trace to the character's own kit text, the source data dump,
or an existing sourced comment already in the file. Never invent a multiplier, a
category, a duration, or a stack cap to fill a gap — an honestly-omitted or zeroed
value beats a fabricated one every time. When a real mechanic can't be modeled with the
current schema (a shared cross-character stack pool, a state machine this engine
doesn't track), leave it unmodeled and say so in a `note`, the same way the existing
files document dozens of such gaps — don't approximate silently.

## Verification checklist for any edit

1. Run that one character's own test file:
   `npx vitest run src/__tests__/triggerEngine-<name>.test.js`
   (filename convention varies slightly for Rover variants — check with `ls`).
2. Confirm it has an `expectValidBlockFile(<NAME>_BLOCKS, '<DisplayName>')` assertion
   — add one if it's missing (every character got this in the Layer 4 migration; a
   brand-new character needs it added).
3. Run the full suite: `npx vitest run`. `phase3-parityGolden.test.js` in particular
   catches a category/basis change that silently shifts computed damage.
4. If you changed a category or basis on a block that was already categorized, explain
   why in a comment — same convention as every existing "category fixed because..."
   note in the files today.
