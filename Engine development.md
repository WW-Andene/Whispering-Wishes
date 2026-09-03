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
   before today, `appliesTags` tagging just now agrees with it too).

   **Lynae tagged AND resolved 2026-09-02** — `lynae.intro.time-to-show-some-colors`,
   `lynae.basic.polychrome-leap`, `lynae.forte.visual-impact` (every real Photochromic-Flux-inflicting
   block) carry `{tag:'tune-rupture-shifting', requiresStance:'Tune Rupture mode'}` /
   `{tag:'shifting', requiresStance:'Tune Strain mode'}`, sourced verbatim from her dump's own
   "Resonance Mode" line. Initially left deliberately unresolved: `winningStanceForOwner()`'s generic
   `blockMagnitude()` comparator needs both mode candidates to be the same SHAPE of stat bonus to
   compare honestly, and Lynae's real difference isn't that shape — Rupture's Spectral Analysis is a
   flat proc computed through the DOT-reaction engine's own Lv.90 formula, Strain's response is a
   %-deepen multiplier; forcing those through the same comparator would mean fabricating a fake
   conversion rate, which was correctly rejected rather than done.

   **Closed properly, in two steps, rather than faked:**
   1. **Fixed a real, separate legacy bug found during this investigation**: `calcTuneBreakDmg()`
      (`calcEngine.js`) was applying Lynae's `ruptureDmgMult` AND `strainDmgPerStack`/`maxStrainStacks`
      SIMULTANEOUSLY for any team containing her — her own kit's two mode-locked response fields have
      no mutual exclusivity enforced at all, unlike a genuine dual-mode split (Mornye has the same two
      field names, but legitimately CAN have both active — she's a generic responder to whichever
      Interfered type the team's OTHER appliers produce, not herself mode-locked, so nothing to fix
      there). Added `tuneBreak.modeExclusive: true` (Lynae only, `characters.js`) and restructured
      `calcTuneBreakDmg()` to return a mode-locked member's own rupture/strain contributions as
      `exclusiveCandidates` instead of folding them in unconditionally. `calcTeamStats.js` resolves each
      candidate right after its own real `grandTotal` is known (before `dotDmgPerRotation`'s per-member
      distribution, so the breakdown stays consistent) by comparing the ACTUAL total damage under each
      candidate and keeping the larger — real numbers, not a fabricated unit conversion — and exposes
      the resolution as `stats.tuneBreakResolvedStances`.
   2. **Wired that same real resolution into the tag-gating question**: `winningStanceForOwner()` gained
      a `confirmedWinningStance` check (an explicit, sourced pointer used only when the generic magnitude
      comparison genuinely can't apply — never a substitute for it when it can, as Denia's case still
      proves) — checked before the magnitude fallback. `lynae.blocks.js` gained one inert marker block
      (`lynae.stancevote.tune-rupture`, `kind:'utility'`, empty `effects`, costs nothing in any DPS path)
      carrying `condition:{requiresStance:'Tune Rupture mode', confirmedWinningStance:true}`. The verdict
      itself wasn't hand-computed — `calcTeamStats(['Lynae'], ...)` and
      `calcTeamStats(['Lynae','Aemeath','Mornye'], ...)` were actually RUN against the now-fixed
      resolver: both resolved to Tune Rupture mode, matching the dump's own meta text ("always Tune
      Rupture — bigger raw damage increase — unless the Main DPS has a direct Tune Strain synergy, e.g.
      Luuk Herssen"), two independent real sources agreeing.

   New test file `lynaeTuneBreakModeExclusivity.test.js` (5 tests) proves both fixes end-to-end: the
   exclusivity split, a no-regression check that Mornye's own legitimate dual response is untouched, the
   real `calcTeamStats` resolution, `winningStanceForOwner` no longer returning `null` for Lynae, and the
   rotation simulator actually tagging `tune-rupture-shifting` (not `shifting`) on her real blocks. Full
   suite (1226 tests, up from 1221) passing.

   **Aemeath — same class of bug found and fixed 2026-09-02, cross-reaction this time.** Investigating
   which mode a theoretical Aemeath+Denia+Lynae team should assume (user's own question) surfaced a real
   bug distinct from Lynae's: Aemeath's Tune Rupture Response - Starburst (596.43% Tune AMP, sourced
   from a fresh Prydwen dump AND cross-confirmed identically on a second source, nanoka.cc — filled in
   after her own `tuneBreak` comment had flagged it "not confirmed, omitted rather than guessed" since
   2026-08-18) and her participation in the SHARED `calcFusionBurstDmg()` reaction were both being
   counted unconditionally, even though her own kit text marks each as active in exactly one, opposite
   Resonance Mode. Worth recording the reasoning misstep that preceded the fix: an early pass concluded
   "no Fusion-Burst-specific bonus is written in her kit text, so Rupture must be the stronger choice
   numerically" — a text-only deduction, not a computed one. Actually running the numbers
   (`calcTuneBreakDmg` vs `calcFusionBurstDmg` for her solo, real rotation time) showed the opposite:
   the generic Fusion Burst reaction (40,645 dmg/rotation) outweighs Starburst (19,765) — because her
   Fusion-mode strength was never a bespoke per-character number to begin with, it flows through the
   SAME shared reaction formula every Fusion Burst applier in the roster uses. Lesson: "the text doesn't
   name a number" and "the mechanic is weak" are not the same claim — always compute before concluding
   one implies the other.

   Also found while tracing this: her `debuffs: [{stat:'fusionBurst', value:30, condition:'Rupturous
   Trail/Fusion Trail...'}]` entry's `value`/`condition` were pure inert documentation — `applyBuff()`
   has no `case 'fusionBurst'`, so the ONLY real effect of that entry anywhere in the codebase is
   marking her as a participant in `calcFusionBurstDmg()`'s boolean "does anyone apply this" gate. The
   entry's own comment described her Trail-stack-removal DMG Mult scaling (a real, sourced, but
   currently unrepresentable-by-this-schema mechanic, same class of gap as Qingxiao's Mindlock curve) —
   misleading, since that value was never actually applied. Recomposed the entry's `condition` text to
   describe what it ACTUALLY does (her mode-conditional Fusion Burst status application), and flagged
   the Trail-removal scaling as a separate, still-open, unmodeled gap in her own `note`.

   **First fix attempt (marginal delta) — extending Lynae's pattern, turned out unsound with a second
   competitor.** `calcFusionBurstDmg()` gained an `excludeNames` param (default `[]`, every existing
   caller unaffected). `dotReactions.js` computed, for a `tuneBreak.exclusiveCandidates` entry flagged
   `competesWithFusionBurstReaction`, a `fusionBurstDeltaIfExcluded` (today's total minus the total
   without them), and `calcTeamStats.js` compared Fusion/Rupture/Strain totals using that single delta.
   Verified against `calcTeamStats(['Aemeath'], ...)` alone: correctly resolved Fusion Burst mode.

   **Then found broken while also fixing Denia's own, separate, real gap** — she was completely absent
   from `calcFusionBurstDmg()`'s applier gate despite her own kit inflicting real, sourced Fusion Burst
   status in Fusion Burst mode (`denia.blocks.js`'s own damage-block notes already said so); added her
   `debuffs.fusionBurst` entry and the same `modeExclusive`/`competesWithFusionBurstReaction` flags as
   Aemeath's fix, both fully legitimate on their own. But adding a SECOND real competitor for the same
   shared reaction broke the marginal-delta approach: for a real Aemeath+Denia+Lynae team, Aemeath's own
   `fusionBurstDeltaIfExcluded` collapsed to ~0 (excluding just Aemeath still leaves Denia alone keeping
   the reaction active), making her Rupture option look free — which flipped her resolved stance to
   Tune Rupture, inconsistent with her own solo resolution and the real meta text, and cascaded into
   flipping Denia to Tune Strain too via the SAME stale-baseline bug (candidates were evaluated against
   a `preGrandTotal` frozen before earlier candidates in the same pass were resolved). A marginal
   "delta if this ONE member is excluded" is a real trap once TWO members can each independently keep a
   boolean-gated reaction alive — excluding one reads as free precisely because the other covers it,
   which says nothing about whether that member's OWN mode choice is actually free.

   **Real fix: full combinatorial resolution**, not another delta patch. `calcTeamStats.js`'s resolution
   block now enumerates every exclusive candidate's own valid option set (`{fusion, rupture, strain}` for
   a fusion-competing character, `{rupture, strain}` otherwise — a Cartesian product, 18 combinations for
   this 3-candidate case, trivial to evaluate since real teams have at most a couple of mode-locked
   members) and computes each combination's REAL final total directly — including a fresh
   `calcFusionBurstDmg()` call (via `dotReactions.js`'s new `recomputeFusionBurstDmg()` wrapper) for
   whichever subset opted into Fusion for that specific combination — then keeps the best. No marginal
   deltas, no stale baselines, no order dependency.

   Verified end-to-end: `calcTeamStats(['Aemeath'], ...)` and the real
   `calcTeamStats(['Aemeath','Denia','Lynae'], ...)` now agree — Aemeath resolves to **Fusion Burst
   mode** in both (matching her own solo answer AND the real meta text), Denia resolves to **Tune
   Strain mode** (not redundantly co-covering Fusion Burst once Aemeath already does — she gets more
   from her own Strain response instead), Lynae stays **Tune Rupture mode** (unaffected, as expected —
   she doesn't compete with the Fusion Burst reaction at all). Two new test files:
   `aemeathTuneBreakModeExclusivity.test.js` (3 tests) and `aemeathDeniaLynaeModeResolution.test.js` (2
   tests, the real 3-member interaction, including a consistency check that Aemeath's resolved stance
   doesn't change between solo and team runs — the exact invariant the marginal-delta bug violated).
   Full suite: 1231 tests passing (up from 1226).

   **Still open**: this whole resolution mechanism only compares what THIS single-target rotation
   calculator can see. Prydwen's own text says Fusion Burst is Aemeath's strongest mode specifically
   because of AoE/quickswap value — nothing this app models. The computed answer (Fusion Burst) happens
   to agree with the real meta verdict here, but that agreement isn't guaranteed in general for a
   dual-mode character whose real advantage is AoE-shaped; flag this explicitly rather than treat every
   future resolved stance as automatically meta-correct. Also: the combinatorial search only spans
   `tuneBreakExclusiveCandidates` (characters with a `tuneBreak.modeExclusive` flag) — Denia's own
   Outro-buff mode split (resolved separately via `filterExclusiveModeBlocks` in the TriggerBlock engine)
   and this Tune Break resolution are still two independent mechanisms that don't cross-check each
   other; a composition where they'd disagree hasn't been found, but nothing guarantees they can't.
3. **Migration — not started.** Qingxiao S4 specifically still uses the old `target:{scope:'self'}` /
   flat `atkPct` approximation (not yet migrated to `ally-action`+`trigger-actor`); `denia.chain.s2`
   still only models its flat Banish multiplier, not the Fusion-Burst/Tune-Strain-mode reactive buff
   half of S2 at all (a real, previously-unflagged gap, found while re-reading `denia.blocks.js` for
   this item). Convert the 10 known cases one at a time (Category A first — simpler, no new target
   type needed — then Category B), each with its own dedicated test.

---

## 10. `outroBuffs` `target: 'team'` — real legacy gap found, low practical impact (2026-09-02)

**Where**: `calcTeamStats.js`'s three consumers of `CHAR_BUFF_TABLE[name].outroBuffs` (the non-main
buff-application loop, the rotation-timeline builder, the synergy-score loop) — none of them ever
checked for `b.target === 'team'`, only `'next'/'enemy'/'ally'`. Found while investigating why
Aemeath's resolved Tune Break stance seemed to ignore Denia's own resolved stance.

**Symptom**: a `target: 'team'` `outroBuffs` entry is inert data — contributes exactly 0 to any
computed stat, in any team composition. 11 real, sourced entries across the roster have this shape
(Denia's Fusion Burst mode Outro +60% elemDmg, Lucilla's Glacio Chafe mode Outro +60% elemDmg,
Aemeath's own +10% All DMG Outro, Buling, Ciaccona, Rover: Havoc, and others — full list in the
2026-09-02 commit that fixed this).

**Blast radius, corrected after over-claiming it once**: initially reported this as breaking Denia's
real synergy with Aemeath in the exact composition under discussion — WRONG, based on a broken test (a
`CHAR_BUFF_TABLE['Denia'] = {...}` reassignment from a separate script silently failed to propagate,
almost certainly a module-resolution quirk between the debug script and the app's own import graph, not
a real finding). The CORRECT test — comparing `calcTeamStats(['Aemeath','Denia','Lynae'],...)` against
`calcTeamStats(['Aemeath','Lynae'],...)` (two full real calls, no in-place mutation) — showed Denia
contributes +110,034 to Aemeath's damage, and a direct `resolveHitComposedTeamDps` call (also
unmutated) confirmed her Fusion Burst outro block correctly reaches Aemeath via the MODERN TriggerBlock
engine, provided team order puts the main DPS last (which `chooseOnFieldOrder` always guarantees). So:
**the modern, converted-character path was never broken** — `outroBuffs`'s `target:'team'` dead code
only affects the LEGACY per-member buff loop, which is itself gated behind `!allMembersConverted` and
therefore already skipped for any fully-converted team (the overwhelming majority of real usage today).
Real bug, real fix (now merged), but it only matters for a mixed team with an unconverted member —
currently none exist in the released roster.

**Process lesson, stated plainly since it happened twice in one session**: verify a "before/after"
comparison via two INDEPENDENT calls to the real function (different team compositions), never via
in-place mutation of shared module state — a silently-failed mutation looks identical to "this data has
no effect," and the two are not distinguishable without this kind of second check.

---

## 11. Systematic roster-wide dual-mode audit (started 2026-09-02)

The user asked for a full, structured audit of every character's mode-conditional mechanics rather
than continuing to find these one at a time by accident. Manually re-reading 60+ character files isn't
tractable in reasonable time, so this audit is **script-driven**: a scan over `CHAR_BUFF_TABLE` and
`BLOCKS_BY_CHARACTER` for every `condition`/`requiresStance` string containing the literal word "mode"
(the same marker `sequenceGating.js`'s own `filterExclusiveModeBlocks`/`winningStanceForOwner` already
use), surfacing every character with SOME dual-mode signal, in either system, for individual review.
Kept intentionally re-runnable (not a one-off script) — re-run this scan any time a new character is
converted or a `characters.js` edit touches a `condition` string, to catch regressions the same way.

**First pass results (9 characters flagged):**

| Character | Status | Action |
|---|---|---|
| Camellya | `Budding Mode` — single stance, no rival, a real always-entered part of her rotation (documented exception in `sequenceGating.js`'s own comment) | None needed |
| Phoebe | Legacy + TriggerBlock both reference `Confession mode`, but her real mode is Absolution — already handled via `condition.assumedInactive` on the Confession-mode blocks | None needed (legacy `condition` text is dead for a converted character anyway, per item 10 above) |
| Lynae | `tuneBreak.modeExclusive`, resolved via `confirmedWinningStance` | Already fixed this session |
| Mornye | `tuneBreak` has both rupture+strain fields, `modeExclusive: false` | Correct as-is — she's a generic responder to whichever Interfered type the team's OTHER appliers produce, not herself mode-locked (verified against her own kit text earlier this session) |
| Luuk Herssen | `tuneBreak.strainDmgPerStack` only, no rupture side | Correct as-is — no rival field to be exclusive against |
| Aemeath | `tuneBreak.modeExclusive` + `competesWithFusionBurstReaction` | Already fixed this session |
| **Rebecca** | **Huntress/Guts self-buffs both `trigger:'passive'` — always active simultaneously, contradicting her own kit's mutually-exclusive in-combo states** | **Fixed below** |
| Lucilla | Legacy + TriggerBlock both correctly reference `Glacio Chafe mode`/`Echo mode`, matching stance strings in both systems | Verified consistent, no action needed |
| Denia | `tuneBreak.modeExclusive` + `competesWithFusionBurstReaction`, TriggerBlock outro split | Already fixed this session |

**Rebecca fix**: `rebecca.selfbuff.huntress` (+30% Crit DMG) and `rebecca.selfbuff.guts` (+15% DEF
Ignore) were both `trigger:'passive'` — always on for her ENTIRE modeled rotation simultaneously, even
though her own kit text (confirmed via her own `CHARACTER_ROTATIONS` step notes) describes them as
mutually exclusive in-combo states she alternates through mid-rotation: Intro starts Huntress then
auto-switches Guts; Basic ATK: Guts Stage 1-3 happens in Guts; Skill "switches her back to Huntress
mode (gains +30% Crit DMG there)"; every step after Skill stays Huntress. A real double-counting bug —
same class as Lynae/Aemeath/Denia's Tune Break fixes, just within one character's own combo timeline
instead of a team-composition choice, so the fix shape is different: not a mode-exclusivity RESOLVER
(nothing to choose between — the real game alternates both, deterministically, within one rotation),
just correcting each block's `trigger` to fire at its own real, kit-text-confirmed transition point
(`cast` on `Basic ATK:Guts Stage 1-3` for Guts, `cast` on `Skill:It's Big Boomin' Time!` for Huntress)
instead of firing from t=0 unconditionally. Guts's window is bounded to 2s (an estimate scoped to that
one real 3-hit combo segment, not a sourced exact timer — documented as such); Huntress's is left at
the existing `999` sentinel since no further mode switch happens after Skill in her modeled rotation.
4 new tests (`rebeccaHuntressGutsModeFix.test.js`) verify both blocks now have real, partial uptime
(`avgMultiplier < 1`, where a passive block would show full uptime) and that Guts's window opens before
Huntress's, matching the real combo order. Full suite: 1235 tests passing (up from 1231).

**Next in this audit**: re-run the scan after any future character conversion; the script itself only
catches the "mode" text marker, not every possible double-counting shape (Rebecca's own bug wasn't a
`requiresStance` condition at all — it was two unconditional `passive` triggers that SHOULD have been
mutually exclusive per plain kit-text reading, which the script's narrow "mode" grep didn't catch on
its own; found by reading her kit text directly after the script flagged her legacy `selfBuffs`
conditions as a starting point). A broader pass — every character's `passive`-triggered TriggerBlocks,
cross-checked against whether their own kit text implies a state that isn't actually always-on — is the
logical next audit layer, not yet run.

---

## 12. `kind:'buff'` blocks with `trigger:{type:'cast',...}` and no `timing.duration` are a silent no-op in every hit-composed resolver — found 2026-09-02, ~65 occurrences roster-wide, not yet fixed broadly

**Found**: while fixing Lupa's S4 (Dance With the Wolf: Climax's own +125% DMG Multiplier). Its block was
`kind:'buff', trigger:{type:'cast', on:'Liberation:Dance With the Wolf: Climax'}, timing:{}` — a cast-
scoped, same-move-only, non-persistent buff, a shape used throughout this codebase (documented inline
elsewhere as "cast-scoped (instant, no persistent duration), same single-hit-scoped pattern as Calcharo's
S5"). Fixing an unrelated `CHARACTER_ROTATIONS` bug (see `characters.js`'s own Lupa comment) finally gave
this block a real cast to fire from — and a test proving it actually raised computed damage
(`withS4.totalDamage > noS4.totalDamage`) FAILED: the two totals were byte-identical.

**Root cause**: `resolveHitComposedDps.js`'s `statsAtInstant()` (~line 128) builds its per-hit stats
snapshot from exactly two sources — `passiveBlocks` (`trigger.type === 'passive'`) and `buffWindows`
(buff/debuff blocks where `timing.duration != null`, built once via `buildBlockWindows()`). A block that
is BOTH `trigger.type === 'cast'` AND has no `timing.duration` matches neither filter — `buffBlocks`'s own
filter (~line 115) explicitly requires `timing?.duration != null`. It is silently invisible to every
per-hit stats computation, including at the exact instant of its own trigger cast. `resolveHitComposedTeamDps.js`
shares this same architecture (not independently re-verified per-line here, but uses the identical
`buildBlockWindows`/passiveBlocks split) — worth confirming when acted on.

**Scope**: a rough regex scan (`kind:'buff'` blocks with a `trigger:{type:'cast',...}` and `timing:{}`
within ~80 chars) found **~65 matches across `engine/characterBlocks/*.js`** — not manually verified one
by one (the regex is crude and likely has some false positives/negatives), but the shape is clearly
common, not a one-off. Some of these may be harmless in practice (e.g. `assumedInactive`/mode-conditional
ones already gated out some other way, or genuinely low-value effects), but any of them representing a
real, sourced, non-trivial DMG Multiplier — the exact shape Lupa's S4 was — is silently contributing
ZERO to computed DPS today, the same false-negative class as the already-found-and-fixed `totalMult`
architecture bug.

**Already fixed this session, as individual cases, NOT via an architecture change**: Lupa's S4 — converted
from a `libDmg` buff-effect to a real `kind:'damage'` proportional-2nd-hit block (945.325% = 125% of
Dance With the Wolf: Climax's own 756.26% base total), same pattern already established for Brant's
S6/Denia's S4/Chisa's S4 gap #6/#7 fixes. This works precisely BECAUSE those cases are "boost THIS one
move's own damage by X%" — expressible as a proportional second hit at the same instant. A genuinely
different shape (e.g. a cast-scoped buff meant to persist a few seconds and apply to OTHER subsequent
hits, not just its own trigger) would need a real `timing.duration` added instead — a data fix, not an
architecture fix, once identified.

**3rd confirmed instance, 2026-09-02**: Carlotta's `chain.s2` (Fatal Finale DMG Multiplier +126%,
exact same `kind:'buff', trigger:{type:'cast',...}, timing:{}` shape). Fixed via a DIFFERENT individual
pattern than Lupa's S4/Verina's S6 (both converted to proportional-2nd-hit damage blocks) — since S2 is
a pure multiplier on an EXISTING single hit rather than an additional hit of its own, it was instead
converted to `trigger:{type:'passive'}` + `effects[0].scopedToBlockId:'carlotta.liberation.fatal-finale'`
(the scoping mechanism already built for Augusta's S3 over-crediting fix), which makes it visible to
`statsAtInstant()` via the `passiveBlocks` bucket while staying scoped to only the one move it's sourced
to boost. **4th confirmed instance, same pass**: Carlotta's `chain.s1` (+12.5% Crit Rate on DMG dealt
to a Deconstructed target) has the identical dead-buff shape and was initially left unfixed on the
theory that its runtime debuff-presence condition ("any hit landing on a Deconstructed target") can't
be expressed via `scopedToBlockId` without guessing which blocks to include — but a closer re-read of
the source found the fix didn't need that mechanism at all: the pasted text's own Review section states
outright that Deconstruction, "with the Inherent Ability active, it should always be active." That's a
direct, sourced basis for modeling S1 as an unconditional passive (not scoped to specific blocks like
S2), so it was fixed the same pass by converting to `trigger:{type:'passive'}`.

**5th confirmed instance, 2026-09-02**: Galbrena's `chain.s3` (Hellfire Absolution DMG Multiplier
+130%), same `kind:'buff', trigger:{type:'cast',...}, timing:{}` shape — found only after a new test
proved the "fixed" block (its `stat` had already been corrected from a separate `libDmg`→`echoDmg`
category-gating bug) still produced byte-identical totals with/without it, the exact same
detection method used on Lupa's S4 originally. Fixed the same way as Carlotta's S2 — converted to
`trigger:{type:'passive'}` + `scopedToBlockId:'galbrena.echo.hellfire-absolution'`. Worth noting for
any future roster sweep: a block can carry BOTH the dead-trigger bug AND an unrelated category
mismatch at once (as this one did) — fixing only the visible stat/category bug without also checking
the trigger shape leaves it silently broken.

**6th and 7th confirmed instances, 2026-09-02**: Lucy's `chain.s2` (Multi-threading SQL DMG Mult
approximation) AND `chain.s3` (Old Net Deep Dive DMG Mult +50%/Crit DMG +100%) — found together while
processing her first-ever unblocked .mht snapshot (prior audits had been blocked from the exact
per-move Multipliers tables, which render client-side). Both were the same
`kind:'buff', trigger:{type:'cast',...}, timing:{}` no-op shape, and `chain.s3`'s `libDmg` effect
carried the SAME double-bug shape as Galbrena's S3 (its target block, Old Net Deep Dive's Override, is
`category:'heavyDmg'` despite being a Liberation-slot ability — "considered Heavy Attack DMG" per its
own kit text — so `libDmg` never matched). Both fixed via `trigger:{type:'passive'}` +
`scopedToBlockId`, `chain.s3`'s stat corrected to `heavyDmg`. By this point the pattern is clear enough
to state as a standing rule for any future per-character pass: **whenever a `RESONANCE_CHAIN_DATA` node
is modeled as `kind:'buff'` with `trigger:{type:'cast',...}` and no `timing.duration`, check it for
this bug on sight — don't wait to stumble onto it via a coincidental "no visible effect" test.** 3 of
the last 3 characters processed (Carlotta, Galbrena, Lucy) each had at least one instance.

**8th confirmed instance, 2026-09-02**: Rover: Aero's `chain.s5` (Omega Storm DMG Mult +20%) — same
`kind:'buff', trigger:{type:'cast',...}, timing:{}` shape, found immediately on sight per the standing
rule above rather than via a coincidental test failure. Fixed the same way — `trigger:{type:'passive'}`
+ `scopedToBlockId`. 4 of the last 4 characters processed (Carlotta, Galbrena, Lucy, Rover: Aero) each
had at least one instance — this shape is clearly not rare, and checking for it is now a standard part
of this project's per-character pass, not an occasional lucky find.

**9th/10th confirmed instances, 2026-09-03 — IMPORTANT scope correction**: Jiyan's `chain.s5-outro-mult`
(Outro Discipline DMG Mult +120%) turned out to be `trigger:{type:'swap-out'}`, not `'cast'` — every
prior instance this session happened to use a `'cast'` trigger, which had (wrongly) narrowed how this
bug was described and searched for. Re-reading `resolveHitComposedDps.js`'s actual filter — `buffBlocks`
requires `b.timing?.duration != null && b.trigger.type !== 'passive'` — makes clear the real condition
is **ANY non-passive trigger type with no duration**, not specifically `trigger.type === 'cast'`. Fixed
via the same passive+scopedToBlockId pattern. Also fixed Jiyan's `chain.s6` (a familiar `'cast'`-shaped
instance) for correctness, though it currently has zero live impact — no `jiyan.forte.emerald-storm-
finale` damage block exists to scope to (Finale is never cast in the modeled `CHARACTER_ROTATIONS`).
**Updated standing rule**: when auditing a `RESONANCE_CHAIN_DATA` node's engine block, check
`trigger.type !== 'passive'` AND `timing.duration == null` together — regardless of which specific
non-passive trigger type is used (`'cast'`, `'swap-out'`, or any other) — not just blocks that happen to
read `trigger:{type:'cast',...}`.

**11th-16th confirmed instances, 2026-09-03 — Phoebe, by far the worst case found**: applying the
updated standing rule to Phoebe's blocks (`phoebe.blocks.js`) turned up SIX separate instances at once
— `phoebe.kit.dawn-of-enlightenment-absolution-mult` (+255% Liberation DMG Mult), `phoebe.kit.
attentive-heart-absolution-mult` (+255% Outro DMG Mult), `phoebe.kit.starflash-frazzle-amp` (+256%
Starflash Frazzle-target Amp), `chain.s1` (+225% additional Liberation Mult), `chain.s2` (+120% Outro
Frazzle Amp), `chain.s3` (+91% Starflash Mult). Together these ARE essentially her entire kit's
multiplier stack — the two headline +255% bonuses on her two biggest hits, plus a further +256% Amp on
her main burst-window Heavy Attack, were ALL silent no-ops. Every one fixed via the same
passive+scopedToBlockId pattern (chain.s3 didn't need `scopedToBlockId` since `heavyDmg` is
category-gated and Starflash is her only `heavyDmg`-tagged block — a useful reminder that
`scopedToBlockId` is only NEEDED when the stat isn't already category-gated to exactly one real target,
per Brant's `chain.s6` case). This is the single worst concentration of this bug found in any character
this session, and reinforces that the fix-shape decisions below (a real architecture-level fix, not
continued one-off patching) are worth prioritizing — at this rate, most of the roster likely has at
least one instance, and probably several characters have Phoebe-scale concentrations still undiscovered.

**17th-19th confirmed instances, 2026-09-03**: Zani's `chain.s2`/`chain.s3`/`chain.s5` — same
`kind:'buff', trigger:{type:'cast',...}, timing:{}` shape, found immediately on sight per the standing
rule. `chain.s3` (Rekindle DMG Mult +200%) and `chain.s5` (The Last Stand DMG Mult +120%) both needed
`scopedToBlockId` on top of the trigger fix: both are `libDmg`-categorized, and Zani has TWO real
`libDmg` blocks (`zani.liberation.rekindle` and `zani.liberation.the-last-stand`) — without scoping,
fixing either one's trigger alone would have made it cross-bleed onto the WRONG Liberation cast (S3's
+200% belongs to Rekindle only; S5's +120% belongs to The Last Stand only). This is a new wrinkle worth
flagging: whenever two or more damage blocks on the same character share a category, a
`scopedToBlockId`-less fix for either one's dead-buff bug is itself a NEW bug, not a fix — always check
for sibling same-category blocks before deciding scoping is unnecessary (contrast Phoebe's `chain.s3`
and Brant's `chain.s6`, where the stat's category legitimately had only one real target).
`zani.chain.s2` also uncovered a related category bug on the block it's meant to boost: its `skillDmg`
effect could never have matched `zani.skill.targeted-action` even after the trigger fix, because that
damage block had no `damage.category` set at all — fixed alongside it.

**Fix shape, not yet done**: (1) a real architecture fix — either make `statsAtInstant()` also check a
3rd bucket of "cast-scoped, same-instant-only" buffs (blocks matching this shape, applied only to hits at
their own exact trigger instant, not before/after), or add a cheap default `timing.duration` (e.g. 0.1s)
so `buildBlockWindows()` treats them as a 1-instant window; (2) OR a systematic per-block sweep: for each
of the ~65 matches, read the real kit text and either (a) it's genuinely a same-move-only multiplier →
convert to the Brant/Denia/Lupa-S4 proportional-2nd-hit pattern, (b) it has a real, sourced duration that
was simply never entered → add `timing.duration`, or (c) it's meant to apply broadly to future hits with
no clean sourced duration → flag as a real, documented gap, same "don't force-fit a lossy value" rule
already used throughout this file. Neither path attempted broadly yet — Lupa's S4 was fixed as an
isolated case because it was directly in scope, not as a template applied roster-wide.

---

## How to add to this file

When an audit turns up a real engine/calculator limitation (as opposed to a
one-off wrong number in `characters.js`/`weapons.js`, which belongs in that
file's own inline audit comments, not here): add a dated entry with what was
found, where, a concrete symptom if one exists, how big the blast radius is,
and a fix shape — not a fix. Keep it a log of verified findings, not a
speculative wishlist.
