# Engine development — known limitations & evolution points

Running log of real gaps found while auditing characters against fresh Prydwen
dumps (see `Characters data dump/`). Not a task list to blindly work through —
each entry should be re-verified before being acted on, since some are cheap
fixes and others are architectural (touch `calcTeamStats.js`, which
`PHASE3_PLAN.md` already treats as a first-class, no-regressions rewrite
target, not a place for quick edits).

---

## 1. Debuff `condition` text isn't machine-enforced for `defIgnore`/`defShred` — confirmed present in BOTH the legacy calc and the modern engine

**Found**: 2026-09-02, while auditing Chisa's Thread of Bane debuff. **Re-confirmed 2026-09-02** while
correcting this file's stale Phase 3 status (below) — this gap is NOT limited to the legacy tier the
way it first looked; it's structural in the modern engine's schema too.

**Where (legacy)**: `app/src/features/teams/calcEngine.js`, `applyBuff()` (~line 374). Only actually
*parses* the free-text `condition` field for 3 stat types — `elemDmg` (element-name match), and
`deepen`/`offTune`/`allDmg` (via `universalStatApplies`). For every other stat, including `defIgnore`
and `defShred`, `condition` is accepted as a parameter but never read — the value is just added
unconditionally.

**Where (modern engine)**: `app/src/engine/triggerBlocks.schema.js`'s `Condition` type +
`triggerEngine.js`'s `conditionHolds()` (~line 93). The engine's structured `condition` object only
supports `element`, `requiresRole`, `requiresStance`, and `assumedInactive` gates — there is no gate
type at all for "recipient must themselves apply/deal a specific status." Chisa's own engine block
(`chisa.blocks.js`, `chisa.debuff.thread-of-bane`) documents this explicitly in its own note: *"not
modeled as a per-teammate condition (schema condition doesn't have a 'deals Negative Status DMG'
gate), applied team-wide."* So this isn't a legacy-only quirk that Phase 3's engine cutover already
fixed — the engine was built without this gate type existing at all, and inherited the same blind spot.

**Concrete symptom**: Chisa's Thread of Bane debuff (`+18% defIgnore`) applies to the main DPS (or any
team-wide recipient) unconditionally, even when that DPS doesn't apply any Negative Status themselves
— in both the legacy fallback AND the now-primary engine path.

**Scope**: not Chisa-specific. Any character whose `debuffs`/buff entry carries a `condition` string
gated on the *recipient's own kit* (as opposed to `dpsElLower`-style element gating, which IS enforced
in both systems) has this same silent gap — grep `CHAR_BUFF_TABLE` for `debuffs`/`buffs` entries with a
prose `condition` string, and grep `characterBlocks/*.js` for a `note` admitting the same "not modeled
as a condition" pattern, to size the real blast radius before fixing.

**Fix shape**: this needs a real schema addition, not a one-off patch — add a new `Condition` gate type
(e.g. `requiresOwnEffect: 'negativeStatus' | ...`) to `triggerBlocks.schema.js`, teach
`conditionHolds()` to check it against the target's own `dmgFocus`/kit capability, and mirror the same
concept in legacy's `applyBuff`/`universalStatApplies` for the (now much smaller, Jingran-only)
fallback path. Since the engine is the primary path post-Phase-3, prioritize the engine-side fix.

---

## 2. Legacy fallback tier never applies a sub-DPS's own Resonance Chain — CONFIRMED low-impact, Phase 3 IS complete (correction below)

**Found**: 2026-09-02, while verifying Chisa's S3 fix was correctly wired. **Corrected 2026-09-02**:
this entry originally said Phase 3's `calcTeamStats.js` rewrite (Stage 4/5) "hasn't started" — that
was wrong, sourced from reading only the first ~150 lines of `PHASE3_PLAN.md` (an in-progress status
snapshot partway through that same day's work), not the full file. The file's own top banner and final
"Status" section are unambiguous: **Phase 3 is complete** (2026-09-01) — Stage 4 (the actual rewrite)
and Stage 5 (final verification) are both done, plus two follow-up passes after Stage 5 itself (a
Critical FULL-tier sequence-gating bug found+fixed, and the dead legacy computation physically gated
behind `!allMembersConverted` so it no longer even runs for a converted team). See
`PHASE3_PLAN.md`'s "Status" section (near the end of the file) for the real, current state — always
read the whole file, not just the top, since it's a working log that gets appended to, not a doc that
gets fully rewritten in place.

**Where**: `app/src/features/teams/calcTeamStats.js`, the single
`applyResonanceChain(seqStats, m.name, m.seqLevel, isMain)` call (~line 935) inside the main-DPS stats
block — this is legacy code specifically, now confirmed to only physically execute for a mixed team
(`!allMembersConverted`, i.e. any team including unreleased Jingran — currently no other case reaches
it at all).

**Real remaining impact**: effectively none today. The engine's `allMembersConverted` path
(`resolveHitComposedTeamDps` + `engine/sequenceGating.js`) is the actual, primary path for every real
team (56 of 57 characters converted), and correctly gates + applies each member's own sequence level
to their own damage — including a Critical bug fix in that exact area during Phase 3's post-completion
audit (see `PHASE3_PLAN.md`'s "FULL-tier teamDps ignored owned Resonance Chain sequence" writeup).

**Fix shape**: not worth fixing on its own — the only path that still hits this gap is the Jingran
mixed-team fallback, and Jingran is unreleased. Revisit only if a second unconverted character appears,
or fold it into whatever eventually replaces the legacy fallback entirely.

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

## 4. Phase 3 rewrite itself — COMPLETE, correcting an earlier wrong entry here

This entry previously (wrongly) said Stage 4/5 hadn't started — corrected in item 2 above. Phase 3
(`calcTeamStats.js`'s internals swapped for real engine calls) is fully complete as of 2026-09-01,
including two post-completion follow-up passes (a Critical sequence-gating bug in the FULL tier, and
physically gating the dead legacy computation). Nothing left to do here — this section stays only as a
pointer: if a future audit turns up a `calcTeamStats.js`-shaped gap, check `PHASE3_PLAN.md`'s own
"Status" section first to see whether it's already been through this rewrite before assuming it's
untouched legacy code.

---

## 5. `maxEnergy` sometimes miscopied from the Liberation's own Energy Cost

**Found**: 2026-09-02, first on Mornye, then confirmed again on Shorekeeper —
both stored `maxEnergy: 175` when the fresh Prydwen dump's Stats section
stated `125`, and both characters' Liberation happens to cost exactly 175
Resonance Energy. Same source page, two adjacent numbers, easy to grab the
wrong one when transcribing by hand.

**Not purely a data-accuracy footnote** — this is a real *pattern*, not two
isolated typos, so it's worth a systematic check rather than waiting for
each character to come up in a dump pass individually.

**Open, unverified**: `Verina`, `Baizhi`, and `Suisui` also currently store
`maxEnergy: 175` in `characters.js`'s `BASE_STATS` table — every other
character in that table is `125` except these + the two now-fixed cases.
Not touched, since none of these three has a corroborating fresh-dump
"Max Energy" figure in this pass (Suisui's Prydwen page has no stats
published at all yet; Verina/Baizhi weren't part of this audit). It's
plausible some or all of these are genuinely correct — some older-generation
healers may legitimately have a higher base Energy pool — so this needs a
real dump/wiki check per character, not a blind global "set to 125".

**Fix shape**: no code change — a data-accuracy backlog item. When any of
Verina/Baizhi/Suisui comes up for a dump-based audit, check `Max Energy`
specifically against the source before assuming it's fine.

---

## How to add to this file

When an audit turns up a real engine/calculator limitation (as opposed to a
one-off wrong number in `characters.js`/`weapons.js`, which belongs in that
file's own inline audit comments, not here): add a dated entry with what was
found, where, a concrete symptom if one exists, how big the blast radius is,
and a fix shape — not a fix. Keep it a log of verified findings, not a
speculative wishlist.
