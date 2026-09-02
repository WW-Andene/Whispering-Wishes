# Engine development — known limitations & evolution points

Running log of real gaps found while auditing characters against fresh Prydwen
dumps (see `Characters data dump/`). Not a task list to blindly work through —
each entry should be re-verified before being acted on, since some are cheap
fixes and others are architectural (touch `calcTeamStats.js`, which
`PHASE3_PLAN.md` already treats as a first-class, no-regressions rewrite
target, not a place for quick edits).

---

## 1. Debuff `condition` text isn't machine-enforced for `defIgnore`/`defShred`

**Found**: 2026-09-02, while auditing Chisa's Thread of Bane debuff.

**Where**: `app/src/features/teams/calcEngine.js`, `applyBuff()` (~line 374).

`applyBuff` only actually *parses* the free-text `condition` field for 3 stat
types — `elemDmg` (element-name match), and `deepen`/`offTune`/`allDmg` (via
`universalStatApplies`). For every other stat, including `defIgnore` and
`defShred`, `condition` is accepted as a parameter but never read — the value
is just added unconditionally.

**Concrete symptom**: Chisa's Thread of Bane debuff
(`{ stat: 'defIgnore', value: 18, condition: "only benefits teammates who
themselves apply/deal Negative Status DMG" }`, `CHAR_BUFF_TABLE.Chisa` in
`characters.js`) currently applies its +18% DEF Ignore to the main DPS
unconditionally, even when that DPS doesn't apply any Negative Status
themselves — the condition is documentation-only in the data, not enforced by
the calculator.

**Scope**: not Chisa-specific. Any character whose `debuffs` entry carries a
`condition` string gated on the *recipient's* own kit (as opposed to
`dpsElLower`-style element gating, which IS enforced) has this same silent
gap. Worth a grep across `CHAR_BUFF_TABLE` for `debuffs` entries with a
`condition` string to size the real blast radius before fixing.

**Fix shape**: extend `applyBuff`'s gating (or add a sibling helper next to
`universalStatApplies`) to recognize a `condition` pattern like "only
benefits teammates who themselves apply/deal Negative Status DMG" and check
it against the recipient's own `dmgFocus`/debuff-application capability,
mirroring how `elemDmg` conditions are already parsed. Needs its own care —
`universalStatApplies` already encodes a specific string-matching convention
worth following rather than inventing a second one.

---

## 2. Legacy fallback tier never applies a sub-DPS's own Resonance Chain

**Found**: 2026-09-02, while verifying Chisa's S3 fix was correctly wired.

**Where**: `app/src/features/teams/calcTeamStats.js`, the single
`applyResonanceChain(seqStats, m.name, m.seqLevel, isMain)` call (~line 935)
inside the main-DPS stats block.

`applyResonanceChain` is called exactly once per team, looping over every
member but only ever accumulating into `seqStats`, which feeds the **main
DPS's** stats. A team member who isn't the main DPS never gets their own
Resonance Chain applied to their own personal (sub-DPS) damage anywhere in
the legacy RAW/FULL-tier formula — regardless of what stat type their nodes
use, including nodes that legitimately should self-apply (e.g. a sub-DPS's
own `libDmg`/`basicDmg`/`heavyDmg` sequence bonus).

**Mitigated in practice**: `PHASE3_PLAN.md` Stage 4's `allMembersConverted`
path (`resolveHitComposedTeamDps` + `engine/sequenceGating.js`) already
applies each member's own sequence level correctly for any team where every
member has a converted `characterBlocks/*.js` file — which is effectively
every team today (per Stage 4's own note, the only unconverted holdout is
Jingran, unreleased). So this gap is real but currently low-blast-radius:
it only bites the day a second unconverted character exists, or for direct
callers of the legacy RAW/FULL tier that bypass the engine path.

**Fix shape**: this is exactly the kind of thing `PHASE3_PLAN.md` Stage 4/5
(the actual `calcTeamStats.js` rewrite, not yet started as of this writing)
is meant to retire wholesale rather than patch piecemeal — flagging here so
it isn't lost, not proposing a standalone patch.

---

## 3. `totalMult` heuristic — precision varies, no single source of truth

**Found**: 2026-09-02, while sweeping `totalMult` across the 13 characters
already covered by `Characters data dump/` (see conversation history around
that date for the full ratio table).

`totalMult` (`ROTATION_STATS`-style tables in `characters.js`, header comment
"sum of ATK% multipliers in one full rotation") is a hand-authored heuristic,
not derived programmatically from `SKILL_MULTIPLIERS` + `CHARACTER_ROTATIONS`.
When a character's `SKILL_MULTIPLIERS` row has a **provable, exact-ratio**
bug (the "halving bug" already found and fixed on Augusta, Qiuyuan, and
Chisa — all three landed within a percent or two of 0.5x/2x when
cross-checked against independently reconstructed rotation sums), `totalMult`
was very likely derived from the same broken source and inherited the same
error — worth checking whenever a `SKILL_MULTIPLIERS` row gets corrected.

**Open, lower-confidence items** (found but *not* touched, since the
evidence isn't as clean as the 3 confirmed fixes above): Lucilla
(stored/reconstructed ratio ≈0.31) and Lynae (≈0.37) stood out as the two
largest outliers among the 13 characters checked. Both are plausible real
bugs, but my reconstruction carries real uncertainty (which combo
stage/hold-duration/optional-step to count is a judgment call, not something
read verbatim off a table) — not confident enough to edit blind. Worth a
fresh, careful pass (ideally cross-checked against a Prydwen calc-notes
rotation string or a video) before touching either number.

Mornye (2026-09-02): reconstructed ratio ≈0.57 (stored 800 vs. a reconstructed
~1405 using her Loop Rotation) — flagged, not fixed. Weaker evidence than the
3 confirmed cases for a different reason: her `SKILL_MULTIPLIERS` row was
missing the Wide Field Observation Mode Basic Attack entirely until this same
audit pass added it (see the `characters.js`/`mornye.blocks.js` commit), so
`totalMult` was very likely hand-set against an incomplete rotation rather
than uniformly halved — a different failure mode than Augusta/Qiuyuan/Chisa's
clean 2x. Also lower real-world stakes than the other three: Prydwen's own
guide explicitly skips personal-damage calculations for her ("her performance
... almost entirely revolve[s] around her team"), so this is a low-priority
backlog item, not a live-score concern.

**Fix shape**: no code change needed — this is a data-accuracy backlog item,
not an engine architecture gap. Tracking here mainly so "Lucilla/Lynae
totalMult" doesn't get lost between conversations.

---

## 4. Phase 3 rewrite itself — carried over from `PHASE3_PLAN.md`

Not rediscovered here, just cross-referenced so this file is a real single
list: `PHASE3_PLAN.md` documents Stage 4 (`calcTeamStats.js`'s actual
internals swapped for engine calls) and Stage 5 (final verification + commit)
as **not started**. Everything through Stage 3 (coverage audit, parity
harness, sequence gating, DOT reactions, energy-cycle-gated Liberation
uptime, Coordinated ATK snapshot semantics, rotation order-search) is done
and additive-only — `calcTeamStats.js` itself hasn't been touched by that
effort yet. Items 1 and 2 above are exactly the kind of legacy-tier
correctness gap Stage 4 is meant to retire.

---

## How to add to this file

When an audit turns up a real engine/calculator limitation (as opposed to a
one-off wrong number in `characters.js`/`weapons.js`, which belongs in that
file's own inline audit comments, not here): add a dated entry with what was
found, where, a concrete symptom if one exists, how big the blast radius is,
and a fix shape — not a fix. Keep it a log of verified findings, not a
speculative wishlist.
