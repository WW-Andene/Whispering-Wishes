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

**Lucilla and Lynae — fixed 2026-09-02.** Originally flagged as lower-confidence
(ratios ≈0.31/≈0.37, judgment calls involved in reconstructing their rotations
by hand). Re-verified with a stricter method: both characters' `CHARACTER_ROTATIONS`
steps name the exact `SKILL_MULTIPLIERS` row they use at each step (including
Lucilla's "Spotlight" step matching one of 3 named alternatives on its row by
exact label) — a mechanical row-for-row match, not a judgment call. Recomputed
totals: Lucilla 700 → 2280, Lynae 1300 → 3558. Both corrected in `characters.js`
with an audit comment showing the exact step-by-step sum.

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

Noted in passing (2026-09-02, full-roster audit pass): `Denia` stores
`maxEnergy: 150` — a third distinct value, not matching the 125-default or the
175-miscopy pattern either. This is NOT a flagged discrepancy the way Mornye's
and Shorekeeper's were — those two had a fresh dump explicitly stating `125`
against a stored `175`, a real contradiction. Denia's own dump file just never
had its Base Stats section captured (a gap in that .md file, created in an
earlier session), so there is zero evidence either way on this number — it was
already live in the app before this whole audit thread started, same as every
other character's base stats, and nothing found so far contradicts it. Not
worth a "needs verification" flag on its own; only revisit if a fresh dump for
Denia happens to include her Stats tab anyway.

**Fix shape**: no code change — a data-accuracy backlog item. When any of
Verina/Baizhi/Suisui comes up for a dump-based audit, check `Max Energy`
specifically against the source before assuming it's fine.

---

## 6. Systematic sweep: `flagged as unverified` Resonance Chain nodes across `characterBlocks/*.js`

**Found**: 2026-09-02, while building the engine work list. A grep for the exact phrase "flagged as
unverified" across `characterBlocks/*.js` turns up 2 characters with untouched placeholder chain
nodes, same class as the Chisa/Mornye missed-S3 and Yangyang: Xuanling S1 bugs already fixed:

- **Yangyang: Xuanling S1** — fixed 2026-09-02 (see her own audit comment in `characters.js` and
  `yangyangxuanling.blocks.js`). Was `totalMult:10`; real effect is a discrete 337.98% ATK proc.
- **Rover: Aero** — S1/S3/S5 still flagged unverified in `roveraero.blocks.js`, not yet checked. No
  dump on file for this character; needs a fresh source before touching.

Re-run `grep -rn "flagged as unverified" app/src/engine/characterBlocks/*.js` after any future fix to
confirm the list has shrunk, not just moved.

**Fix shape**: character-by-character data-accuracy work, not an engine architecture change — handle
opportunistically as dumps become available, same process as every other character audit in this
project.

---

## 7. Process lesson: verify a "fresh dump" actually adds new information before citing it as the source

**Found**: 2026-09-02, on the Yangyang: Xuanling S1 fix above. The user supplied a dump in-chat to
confirm S1's real effect — but that exact text (337.98% ATK, Stagnate, interrupt immunity) was already
present, verbatim, in the existing `Characters data dump/Yangyang Xuanling/Yangyang Xuanling.md` file
from an earlier session. The fix itself was correct, confirmed independently against both copies of
the text — but the commit message said "confirmed against a fresh, user-provided Prydwen dump," which
overstated what the new message actually contributed (nothing — the answer was already on disk, an
earlier audit pass on the same file just never reached S1 before moving on).

**Takeaway, not a code fix**: before asking for or citing a "fresh dump" as the source of a fix, check
whether the answer is already sitting in an existing `Characters data dump/*/*.md` file. If it is, say
so plainly instead of implying new information was needed — the finding is still real and the fix
still stands, but the sourcing claim in the commit/explanation has to match what actually happened.
This applies to any future "flagged as unverified" character-data fix, including item 6 above.

---

## 8. Schema has no way to target "whoever triggers an external effect" — real bug on Qingxiao S4; Yangyang: Xuanling's own S4 FIXED (it was a simpler case)

**Found**: 2026-09-02, full-roster audit pass (Aemeath, Hiyuki, Luuk Herssen, Qingxiao, Sigrika,
Denia — requested explicitly, not opportunistic).

**Yangyang: Xuanling S4 — fixed 2026-09-02.** Turned out NOT to need new schema capability: her real
effect ("casting Intro, Sword Stance Switch: Azure/Feather, or Sword Stance Flow: Azure/Feather grants
the WHOLE TEAM +20% ATK for 20s") only needed the already-existing `whole-team` target scope plus a
real cast trigger, instead of `target: 'self'` + `trigger: 'passive'`. Split into
`yangyangxuanling.chain.s4-intro` and `yangyangxuanling.chain.s4-switch` (both refresh the same 20s
team buff rather than stacking). `RESONANCE_CHAIN_DATA['Yangyang: Xuanling'].s4`'s flat `atkPct:20`
value is unchanged (magnitude was always correct) — only the engine block's scope/trigger changed.

**Qingxiao S4 — still open, genuinely needs new schema capability.** `app/src/data/characters.js`,
`RESONANCE_CHAIN_DATA['Qingxiao'].s4` (`{ atkPct: 20 }`) and its matching `qingxiao.blocks.js` block
(`qingxiao.chain.s4`, `target: { scope: 'self' }`). Real effect (per
`Characters data dump/Qingxiao/Qingxiao.md`): *"After any teammate inflicts Shifting, THEIR ATK +20%
for 8s."* Unlike Xuanling's case, the buff belongs to whichever ally triggers the condition —
Qingxiao's own kit never casts anything at that moment, so there is no cast on HER block to anchor a
`whole-team` buff to; the recipient is specifically "whoever performed the triggering action," a
target scope that doesn't exist yet (`self`/`next-on-field`/`whole-team` are the only three). This one
does need the schema work described in the fix shape below.

**Fix shape**: needs a new trigger/target combination in the schema (something like "target: whoever
caused `trigger.type`", distinct from the existing `self`/`next-on-field`/`whole-team` scopes) — not a
value fix. Track alongside item 1's `condition` schema work, since both are the same underlying
"engine can't model buffs anchored to a cross-character action" limitation.

---

## Full-roster audit pass, 2026-09-02 — summary

User requested a full audit (not just tier/tags) of: Aemeath, Hiyuki, Luuk Herssen, Qingxiao, Sigrika,
Yangyang: Xuanling, Denia, Lucilla, Lynae, Qiuyuan, Chisa, Mornye, Suisui, The Shorekeeper. All 14 had
already been through at least one prior audit pass earlier in this same working session; this pass
re-verified each against its existing `Characters data dump/*/*.md` file.

- **Fixed this pass**: Sigrika's S3 (`totalMult:15` → `{}`, zero real DPS component, same class as
  Chisa's/Mornye's earlier missed-S3 bugs).
- **Found, not fixed** (schema limitation, item 8 above): Qingxiao's S4.
- Denia's `maxEnergy: 150` was initially over-flagged here as a "data gap needing verification" —
  corrected: it's not a discrepancy, just a missing section in her own dump file. See item 5's note.
- **Reviewed, confirmed already correct, no changes**: Aemeath (including a deliberately-left-flagged
  S2 — re-confirmed the existing caution was sound, not overridden), Hiyuki, Luuk Herssen, Denia's S1-S3/
  S5/S6, Qingxiao's S1-S3/S5/S6.
- **Already fixed earlier in this same session** (not re-touched, just re-verified clean): Yangyang:
  Xuanling, Lucilla, Lynae, Qiuyuan, Chisa, Mornye, Suisui, The Shorekeeper.

---

## 9. "Ally-action" reactive buffs — full audit + phased plan (item 8 generalized)

**Found**: 2026-09-02, generalizing item 8's Qingxiao/Yangyang: Xuanling S4 fixes into a full sweep.
Grepped every `characterBlocks/*.js` for the marker phrase "cross-character trigger" plus a broader
sweep for "a teammate"/"an ally"/"any team member" language, then cross-checked each hit's real kit
text against its `Characters data dump/` file.

The underlying pattern: an effect phrased as *"when ANY team member performs action X, [someone] gains
buff Y"* — not the buff owner's own cast, so nothing in `CHARACTER_ROTATIONS` for that character
anchors it. Splits into two shapes:

**Category A — target scope is already correct (self/whole-team/all-enemies); only the trigger is
wrong** (currently `passive`, i.e. always-on/overcredited, or anchored to the wrong character's own
cast as an approximation):
- Cartethyia S4 (whole-team +20% All DMG on any ally inflicting one of 6 named statuses)
- Galbrena's Afterflame (S1 self-stacking + the matching enemy debuff), stacks on ANY ally's Echo
  Skill cast
- Luuk Herssen S4 (whole-team +20% All DMG on ally Tune Break)
- Mornye's chain.s2 (whole-team Crit DMG, currently anchored to her own Inversion cast as a stand-in
  for the real "ally Tune Break hit" trigger)
- Sigrika S4 (whole-team ATK on ally Echo Skill cast)
- Hiyuki's Fine Snow self-buff (scales with ally Glacio Chafe/Havoc Bane applications)
- Sigrika's Blessing of Runes (targets "whichever Resonator is active," refreshed by ally Echo Skill
  casts — needs `next-on-field`-style dynamic self-tracking, not a fixed target, but not `trigger-actor`
  either since it always targets the active member regardless of who triggered it)

**Category B — genuinely needs a new dynamic target scope**, since the recipient is specifically
whoever performed the triggering action, not a fixed self/team/enemy scope:
- Qingxiao S4 (whoever inflicts Shifting gets +20% ATK) — fixed via item 8's investigation, not yet
  code-fixed (blocked on this schema work)
- **Denia S2, Fusion Burst mode** (whoever inflicts Fusion Burst gets +50% Fusion DMG Bonus, 15s) —
  found during this sweep, not previously flagged at all; `denia.chain.s2`'s current note doesn't even
  mention this half of the real effect, only the flat +40% Banish multiplier
- **Denia S2, Tune Strain mode** (whoever inflicts Tune Strain-Shifting gets +20 Tune Break Boost,
  15s) — same, found during this sweep, not previously flagged

**Out of scope for this mechanism** (state-transition or one-off procs on an ally's action, not a
simple stat buff — don't force-fit into the same fix):
- Mornye's Outro (an ally's Tune Break hit upgrades Observation Marker to Interfered Marker — a status
  transition, not a stat grant)
- Cartethyia (an ally maxing Erosion stacks on an already-capped target instantly procs bonus Erosion
  DMG — a one-off damage proc, not a buff)

**Fix shape — phased plan**:
1. **Schema — DONE 2026-09-02.** Added `trigger.type: 'ally-action'` (`{ type: 'ally-action', action:
   '<tag>' }`, fires off ANY team member's step carrying a matching tag) and `target.scope:
   'trigger-actor'` (resolves to whichever character's own step fired it) to `triggerBlocks.schema.js`,
   plus a new `appliesTags: string[]` field on damage blocks. Wired end to end:
   `rotationSimulator.js`'s `simulateStepsCore` now collects each step's fired `appliesTags` into a
   new `actionTags` Set on every result row (owner-tagged, but readable across owners — unlike every
   other trigger type, which stays intentionally owner-scoped); `blockWindows.js`'s
   `buildBlockWindows` matches `ally-action` blocks against `r.actionTags` instead of the normal
   `firedTriggers` key lookup; `resolveHitComposedTeamDps.js` and `resolveSimulatedTeamRotation.js`
   both gained a shared `resultsForBlock(block, targetName, allResults)` helper that routes to the
   right results subset (full team for `ally-action`, `targetName`'s own results for
   `trigger-actor`, unchanged owner-only for everything else). Proven with a new, fully synthetic
   test (`allyActionTrigger.test.js`, 6 tests, hand-built 2-character scenario — not real character
   data) covering both category shapes, including the specific negative case that mattered most:
   a `trigger-actor` block does NOT reach its own owning character when that character never performs
   the triggering action themselves (the exact bug class Qingxiao's S4 had). Purely additive — full
   suite (1221 tests, up from 1215) passing, zero existing behavior changed.
2. **Tags — Denia's mode-lock gap closed 2026-09-02.** `qingxiao.blocks.js`: tagged every real
   damage-dealing block (`appliesTags: ['shifting']`) — confirmed unconditional after the user
   supplied Draw and Sunder's exact raw text ("inflicts Tune Strain - Shifting on the target after
   dealing damage WITH SKILLS... each skill can only trigger this once for the same target" —
   "skills" is the game's generic term for her whole active kit, not narrowly the Resonance Skill
   button).

   **The mode-lock gap itself**, reframed by the user as a theoretical-optimizer question rather than
   live-game-state tracking ("le mode importe peu, on est sur du théorique... prend le mode qui donne
   le plus de dégâts" — the mode barely matters, this is theoretical, assume whichever mode gives the
   most damage): `appliesTags` entries can now optionally be `{tag, requiresStance}` objects instead
   of bare strings (schema doc updated, `triggerBlocks.schema.js`). `sequenceGating.js` gained
   `winningStanceForOwner(blocks, owner)`, which reuses the EXACT SAME "highest `blockMagnitude()`
   wins" rule `filterExclusiveModeBlocks` already applies to Denia's real outro rivalry (Tune Strain
   +15% All DMG vs Fusion Burst +60% elemDmg — Fusion Burst already silently won there before this
   change, any time Denia is on a team) — aggregated across every one of that owner's mode-tagged
   blocks, not just one trigger group, so one assumed mode comes out per owner.
   `rotationSimulator.js`'s `simulateStepsCore` now resolves each owner's stance once (cached) and, for
   an object `appliesTags` entry, only adds the tag when `requiresStance` matches that owner's resolved
   stance. `denia.basic.breakdown-stage1-4` and `denia.liberation.erosion-field` (the two blocks whose
   own notes already documented "Fusion Burst or Tune Strain - Shifting depending on Resonance Mode")
   are now tagged with both variants, correctly mutually exclusive. Full suite (1221 tests) passing,
   zero existing behavior changed (bare-string entries — Qingxiao's shape — are unaffected).

   Direct consequence for the app's assumed mode: Denia currently ALWAYS resolves to **Fusion Burst**
   (her own kit's rival-block magnitudes favor it, 60 > 15 — this was already true of her outro pick
   before today, `appliesTags` tagging just now agrees with it too). **Lynae still NOT tagged** — same
   mechanism now exists for her, but her actual dual-mode blocks (Tune Rupture / Tune Strain via
   Photochromic Flux, ~3 blocks per an earlier grep) haven't been read closely enough yet to tag
   correctly; that's the next concrete step, not a further architecture gap.
3. **Migration — not started.** Qingxiao S4 specifically still uses the old `target:{scope:'self'}` /
   flat `atkPct` approximation (not yet migrated to `ally-action`+`trigger-actor`); `denia.chain.s2`
   still only models its flat Banish multiplier, not the Fusion-Burst/Tune-Strain-mode reactive buff
   half of S2 at all (a real, previously-unflagged gap, found while re-reading `denia.blocks.js` for
   this item). Convert the 10 known cases one at a time (Category A first — simpler, no new target
   type needed — then Category B), each with its own dedicated test.

---

## How to add to this file

When an audit turns up a real engine/calculator limitation (as opposed to a
one-off wrong number in `characters.js`/`weapons.js`, which belongs in that
file's own inline audit comments, not here): add a dated entry with what was
found, where, a concrete symptom if one exists, how big the blast radius is,
and a fix shape — not a fix. Keep it a log of verified findings, not a
speculative wishlist.
