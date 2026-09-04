# Whispering Wishes — Remaining Work (consolidated audit, 2026-09-03)

Replaces `Update_report.md`, `Implementation_Plan.md`, `ENGINE_MERGE_PLAN.md`,
`CAPACITOR_APP.md`, and `Engine development.md` (deleted same commit — all were
append-only running logs, mostly resolved history, that had grown too large to
tell "still open" from "done years ago" at a glance). This file keeps ONLY what
is still genuinely open, verified against the current codebase state, not
copied from the old files' own (frequently stale) status claims.

Character-data sourcing conventions (fresh-dump verification, no-fabrication
rule, commit/test workflow) are established practice in this project, not
repeated here — this file tracks engine-architecture and content-refresh gaps
only.

---

## 1. Engine merge — legacy calculator + TriggerBlock engine still not fully unified

Two systems compute damage today: the legacy flat-table calculator
(`calcEngine.js`/`calcTeamStats.js`) and the modern TriggerBlock engine
(`triggerEngine.js`, `resolveHitComposedDps.js`, `resolveHitComposedTeamDps.js`).
The modern engine is the **primary path** for all 56 converted characters;
legacy only still executes for Jingran (unreleased, unconverted). The end
goal — one fused engine, legacy retired — is not reached.

**Resolver bug fixed 2026-09-04 (found auditing Changli's S3, dimension 8):**
`resolveHitComposedDps.js`'s `statsAtInstant()` only read 2 buckets of buff
blocks — duration-based (`timing.duration` set) and always-on
(`trigger.type: 'passive'`). A `cast`-triggered buff with NO duration (an
instant, one-shot "this cast's own DMG is boosted by X%" node — the most
common shape for a flat Resonance Chain stat bonus) fell into neither
bucket and was **silently never applied at all**, confirmed by removing
Changli's `chain.s3` block and getting byte-identical damage output.
Scope check found **52 such blocks across ~30 characters** sharing the
exact shape (Calcharo, Carlotta, Cartethyia, Changli ×2, Chisa, Chixia,
Ciaccona, Danjin, Denia ×3, Encore, Galbrena ×2, Hiyuki, Iuno, Lingyang,
Lumi, Lupa, Luukherssen, Lynae ×3, Mornye ×2, Phrolova, Qingxiao ×3,
Qiuyuan, Rebecca ×2, Rover: Spectro, Sanhua, Shorekeeper, Sigrika ×2,
Suisui ×2, Taoqi ×2, Xiangli Yao ×3, Yangyang ×3, Yangyang: Xuanling,
Yuanwu) — all were silently dead in `resolveHitComposedDps`/
`calcTeamStats.js`'s "converted character" real-damage path (production
numbers, not just this test suite) for any player at the relevant
Resonance Chain sequence. Fixed at the resolver level (one function, not
52 individual block edits): each step's own `firedTriggers` set (built
fresh per step, not cumulative) is now also checked against a new
`instantCastBuffBlocks` bucket, so a no-duration `cast` buff applies
exactly once, scoped to hits landing in that same step. Regression-tested
directly in `resolveHitComposedDps.test.js` with a minimal hand-built
repro; full suite green afterward (1418/1418), no ratio regressions in
`phase3-parityHarness.test.js`. Not yet spot-checked per-character beyond
Changli's own S3 — a broader before/after DPS diff across all 52 affected
blocks would confirm nothing else relied on the old (wrong) silent-drop
behavior, but nothing in the current suite suggests it did.

### 1a. Schema gaps — 7 of 17 originally-inventoried, still open (down from 10 — early-forfeit-on-swap, Youhu's buff-of-a-buff, and Cantarella's summon-chain closed 2026-09-03)

Every gap below was individually investigated (not guessed at) and has a
documented reason it's still open — either missing source data or missing
infrastructure. None need HP/live-state tracking except where noted.

**Buildable now, no new simulation dimension needed:**
- **Ally-action retrofit backlog** (partial — Qingxiao S4, Sigrika S4, and now
  Galbrena's chain.s4 fixed). Mechanism (`trigger.type:'ally-action'` +
  `target.scope:'trigger-actor'`/`'whole-team'`) already exists and is tested.
  **Galbrena's chain.s4 closed 2026-09-03**: its real trigger ("any teammate
  casts Echo Skill") is exactly the same shape Sigrika's S4 already uses the
  universal `'echo-skill-cast'` action tag for — no new tag needed, just
  wired to the existing mechanism (was previously an unconditional passive
  approximation). Her own Afterflame mechanic (the debuff + chain.s1) stays
  deferred on purpose — its real cap is per-Echo-**name** (not per-cast), a
  dedup shape `appliesTags` can't express without fabricating which specific
  Echo names a given team runs.
  **Remaining, each genuinely bigger than "missing action tag" turned out to
  be on inspection**: Luuk Herssen S4 and Mornye's chain.s2 both need a
  `'tune-break-cast'` tag, which isn't a simple tag addition — Tune Break
  application isn't tracked per-move anywhere yet (only a per-character
  aggregate rate exists in `characters.js`), so building the tag means
  sourcing which specific moves apply Tune Break across ~9 characters, not
  just adding one string. Cartethyia S4 needs 6 separate status tags
  (Havoc Bane/Fusion Burst/Spectro Frazzle/Electro Flare/Glacio Chafe/Aero
  Erosion) built the same way, roster-wide. Mornye's OTHER case (her Outro)
  isn't an ally-action candidate at all — it's a status transition (upgrades
  a marker type), not a stat grant, explicitly out of scope for this
  mechanism.
- ~~Mortefi's base-kit Burning Rhapsody Coordinated Attack~~ — **found and
  closed 2026-09-04.** Distinct from the chain-node backlog above — this is
  base S0 kit, not a Resonance Chain node. Liberation Violent Finale's own
  kit text ("on-field character's Basic Attack hit → 1 Marcato; Heavy Attack
  hit → 2 Marcato") is a real, sourced, always-on proc for 10s after cast,
  folded into his real 67% Liberation damage share per the dump's own calc
  methodology note, but no block modeled it — only the S1/S5 CHAIN-bonus
  procs existed. No ally-hit-rate infrastructure exists to know how often a
  real teammate actually lands hits, so per explicit user instruction it's
  modeled as a flat rate-cap saturation instead: the kit's own "max 1 proc
  per 0.35s" cap over the 10s window = `floor(10/0.35) = 28` procs, at the
  base (non-doubled) Marcato value since the ally's real Basic-vs-Heavy mix
  isn't known — a documented simplifying assumption (the 31.81% Marcato
  value and 0.35s/10s figures are all directly sourced), not a guess. Added
  `mortefi.liberation.burning-rhapsody-marcato` (`coordDmg`); `chain.s3`'s
  Marcato Crit DMG scoping extended to cover it too. 2 new tests, full
  suite green: 1414/1414.
- ~~Youhu S2~~ — **closed 2026-09-03, correctly still no block, for a different
  reason than originally stated.** The "no dump file" blocker is gone
  (`Characters data dump/Youhu/Youhu.md` now exists and sources all 3 base
  values it doubles). But her real modeled `CHARACTER_ROTATIONS` never casts
  Poetic Essence at all — she always spends each drawn Antique immediately via
  Ruyi rather than banking to 4 Auspices. Same zero-DPS-in-context boundary as
  Chisa's S4/Mornye's S1/S4, not a schema or data gap. Comments in
  `youhu.blocks.js` and `characters.js`'s own audit note updated to reflect
  this; no engine change needed.
- ~~Early-forfeit-on-swap~~ — **closed 2026-09-03.** Correction while
  investigating: the real 3 characters with this exact mechanic (a buff on
  ANOTHER character ends early if THAT character swaps out before its full
  duration) are **Cantarella, Changli, Yinlin** — Carlotta's flagged case
  turned out to be a different mechanic entirely (a self-scoped buff tied to
  her own internal "Twilight Tango" state, not a recipient-swap forfeit;
  left untouched). Added `timing.forfeitOnRecipientSwapOut` (schema doc in
  `triggerBlocks.schema.js`): `blockWindows.js`'s `buildBlockWindows()`
  gained an optional `recipientSwapOutAt` param that clamps a window's end
  to it when the flag is set; both `resolveSimulatedTeamRotation.js` and
  `resolveHitComposedTeamDps.js` already compute the recipient's own
  on-field segment for other reasons, so both just pass `targetSegment.end`
  through — no new cross-character data collection needed. Stated
  simplifying assumption: treats the recipient's segment as one contiguous
  on-field window, not a general multi-visit swap history (true for every
  currently-modeled single-pass rotation in this app). Flipped on for
  Cantarella's/Changli's/Yinlin's real outro blocks. New test file
  `forfeitOnRecipientSwapOut.test.js` (4 tests, synthetic mechanism proof)
  plus 1 new assertion in each of the 3 characters' own test files. A ~6
  other similar-sounding blocks (Carlotta, Cartethyia, Iuno, Jinhsi,
  Phrolova, Shorekeeper) were checked and confirmed to be different
  mechanics (self-scoped internal state windows, or Iuno's dynamic
  "whichever Resonator received the shield" case) — correctly left alone,
  not silently missed.
- ~~Cantarella's off-field summon-chain~~ — **closed 2026-09-03.** Added
  `windowed-proc`'s cross-character variant: `trigger.crossCharacterHit`
  (ANY team member's landed step can advance a window opened by someone
  else's cast, not just the owner's own — schema doc in
  `triggerBlocks.schema.js` has the full design) and `trigger.minProcInterval`
  (real-time rate limit between successful procs on the same window, for
  Diffusion's "up to 1 per second" cap). `RotationSimulator` gained
  `minInterval` support on `tryProc()`; `rotationSimulator.js`'s main step
  loop gained an owner-agnostic advancement pass so no `ev.triesProc` flag is
  needed; `resolveHitComposedTeamDps.js` gained a second scan (ALL team
  results, not just the target's own) for this one block shape specifically —
  every other damage block is unaffected. `cantarella.liberation.diffusion-
  summons` added using the already-sourced 14.54%/21-max/30s numbers, no new
  data invented. New test files `crossCharacterWindowedProc.test.js` (5
  tests, synthetic mechanism proof) plus 3 new tests in
  `triggerEngine-cantarella.test.js` (real character, both solo and team
  contexts). S5's cap raise to 26 stays unmodeled (documented, sequence-
  conditional on top of an already-new mechanism — a follow-up, not part of
  this fix).

**Still blocked on missing source data (no dump file / no dump section covers it):**
- Baizhi — sustained-channel gap (Remnant Entities), no dump file at all.
- Roccia — stateful re-cast loop (Reality Recreation), no dump file at all.
- Qingxiao's Mindlock stack-cap-raise to 25 — the nonlinear-stacking
  primitive is already built (`effects[].tiers`/`cumulativeTieredValue()`),
  but no source confirms her real rotation actually reaches 25 stacks.

**Genuinely need a new simulation layer (excluded per user's own framing —
same tier as HP tracking):**
- Danjin S5 — HP-threshold condition (+15% more when HP<60%), needs live-HP
  tracking. Confirmed via `grep -rn "hpPct|currentHp" engine/*.js`: zero
  matches, the engine has no live-HP simulation anywhere.
- Danjin — on-being-hit trigger (loses a stack per hit taken), needs an
  enemy-attack timeline; no such data exists anywhere.
- Denia's Erosion Field tick-rate (4s→3s) — blocked on the same
  sustained-tick-simulation prerequisite as Baizhi's gap.
- **Opener-vs-Loop rotation modeling — found 2026-09-04, auditing Jinhsi.**
  At least 9 characters' source dumps explicitly split their real rotation
  guidance into a one-time "Opener" (cold swap-in, no incoming buffs) and a
  separate, differently-sequenced "Loop Rotation" (what actually repeats on
  every subsequent cycle in a real team rotation) — confirmed via
  `grep -rl "Loop Rotation\|(Opener" "Characters data dump/"`: Jinhsi,
  Chisa, Rebecca, Lupa, Mornye, Lucy, Buling, Phrolova, Suisui.
  `CHARACTER_ROTATIONS` currently models only ONE fixed sequence per
  character, used both for the solo view and chained into Team tab
  calculations — for Jinhsi specifically this is the Opener (which never
  casts her own Intro Skill), while every real Loop Rotation variant in her
  dump (Standard/Advanced/Expert) casts Intro on every single cycle,
  meaningfully feeding her S3 ATK stack and dealing real damage (3.12% of
  her S0 total per the dump's own Damage Profile) — a real team-context
  inaccuracy, not the harmless "alternate unused variant" case most other
  deliberately-unmodeled moves fall under. Properly fixing this needs the
  rotation simulator to track which cycle a character is on (first-ever
  swap-in vs. a repeat within a longer team loop) and model two distinct
  sequences per affected character — a real engine feature, not a
  per-character data edit; same "needs a new simulation dimension" tier as
  the items above, not attempted piecemeal on Jinhsi alone. Whether/when to
  build this, and whether the other 8 characters' Loop variants differ from
  their Openers in a similarly damage-relevant way, is unaudited — flagged
  here rather than guessed at.
### 1b. Phase 2 — DOT-mechanic migration to the modern engine

4 of 5 mechanics migrated and verified (Electro Flare/Buling, Fusion
Burst/Denia+Aemeath, Erosion/Ciaccona, Frazzle/Rover: Spectro). **Tune Break
deliberately left for last, still untouched.**

**Investigated 2026-09-03, confirmed genuinely not buildable without either
fabricating data or faking a migration.** The other 4 mechanics all migrated
cleanly because each has a real `dotApplier`-tagged block — a specific move
in `CHARACTER_ROTATIONS` that applies it. Tune Break's base damage tick
(`calcTuneBreakDmg()` in `calcEngine.js`) has no such anchor: `dmg =
TUNE_BREAK_BASE_DMG * (1 + totalBoost*0.01) * breaksPerRot * defMult`, where
`breaksPerRot`/`uptimeFactor` are derived purely from `rotTime` (the whole
rotation's length) and the team's aggregate `tuneBreak.boostToTeam` — not
from any specific character's hit. There is nothing here to attach a
TriggerBlock's `trigger` to; it's an aggregate "roughly how many times does
this happen across the whole rotation" heuristic, not an event.

The 7 real Tune Break characters' own "Response" abilities (Lynae's Spectral
Analysis, Lucy's Data Crash, Rebecca's Meltdown, Aemeath's Starburst, plus
Denia/Mornye/Luuk Herssen) ARE individually well-sourced, exact values with
a stated cadence — genuinely promising at first glance, the same shape as
Yinlin's Furious Thunder windowed-proc. But each one is gated on "the team's
own Tune Break trigger occurring," which traces back to the same
rotTime-based aggregate above, not a real modeled step.

Building this now would mean one of: (a) fabricating a fake per-move trigger
for a mechanic that doesn't have one, or (b) porting the exact same
rotTime-based heuristic into a TriggerBlock with a hollow/always-true
trigger — not a real migration, just relabeling the same legacy math under
a different file. Neither was done. Confirmed: this belongs in the same
"structurally novel, needs a new simulation dimension" tier as the already-
deferred HP-threshold (#13) and sustained-channel (#9) gaps, not a
data-sourcing problem alone — the per-character rupture/strain
mode-locking already built for the legacy path (`tuneBreak.modeExclusive`/
`competesWithFusionBurstReaction`/combinatorial resolution in
`calcTeamStats.js`) stays legacy-only. Revisit only if/when a real
per-hit-anchored formulation of Tune Break's base tick is found — not
attempted again on a hunch.

### 1c. Phase A — per-character full audit, mostly not done

The plan's own methodology for reaching "fully merged": a 9-dimension solo
audit per character, all cross-checked against a fresh source dump:
1. SKILL_MULTIPLIERS
2. CHARACTER_ROTATIONS
3. RESONANCE_CHAIN_DATA
4. CHAR_BUFF_TABLE
5. dmgFocus
6. weapon data (bestWeapon/weaponAlts)
7. echo data (bestEchoes)
8. engine-block parity — **updated 2026-09-03**: every component, element,
   and mechanic of the character's kit (every named move/state/proc the kit
   text describes, not just the moves already present in
   `<name>.blocks.js`) must actually be segmented, categorized (a real
   `damage.category`, matching kit-text override language where present —
   e.g. "considered Resonance Skill DMG" on a move cast from a different
   slot), and wired into the engine — not just "does every existing block
   have a category," but "does every real kit component that should have a
   block, have one."
9. icons — **added 2026-09-03**: every skill/rotation-step icon
   (`SKILL_ICONS`) and Resonance Chain node icon (`CHAIN_NODE_ICONS`) is
   actually wired, including reusing an existing generic/shared icon
   (Basic ATK, Liberation, etc.) where the character has no unique art
   sourced yet rather than leaving the slot unpopulated.

9 characters (Aemeath, Denia, Lynae, Qingxiao, Rover: Spectro, Rover: Havoc,
Rover: Aero, Jiyan, Yinlin) have gone through the original 8-dimension
version of this pass; **Calcharo, Encore, Jianxin, Lingyang, Verina,
Aalto, Baizhi, Chixia, Danjin, Yangyang, Sanhua, Taoqi, Yuanwu, Mortefi,
Jinhsi, Changli, Youhu, Zhezhi, Xiangli Yao, Shorekeeper, Lumi, Augusta,
Brant, Buling, Camellya, Cantarella, Carlotta, Cartethyia, Chisa — added 2026-09-03/04, first
twenty-eight characters audited under the updated 9-dimension methodology** (see below). Many more
have had *partial*, targeted fixes from later sessions' dump-verification
passes (see the `Characters data dump/` audit trail and an earlier
session's `auditBlockCoverage.mjs` sweep — that sweep covers 3 of the 9
dimensions: rotation-step/chain/buff-table coverage, not the full set).
The remaining ~45 characters have not had a full Phase A pass. Not
urgent — the coverage-audit sweep already closed the highest-risk gaps
(unmatched rotation steps = silent 0-DMG bugs) roster-wide — but the full
8-dimension methodology itself is not complete.

**Open question (2026-09-04):** Lumi's own dump Damage Profile shows a
real 26.3% "Skill" damage bucket, but no block in `lumi.blocks.js` is
skillDmg-categorized for anywhere near that share (only Intro, ~4.1%).
Energized Pounce/Rebound are explicitly "counted as Basic Attack DMG"
per kit text, not Skill. Neither the dump's "Rotation" tips text nor its
Standard Rotation mentions casting base (non-Energized) Pounce/Rebound.
Not added to `dmgFocus` — flagged as unattributed rather than guessed.

**Rover: Spectro pass (2026-09-03)**: her `Characters data dump/` already
had 6 of 8 dimensions verified clean from an earlier pass (SKILL_MULTIPLIERS,
CHARACTER_ROTATIONS, RESONANCE_CHAIN_DATA, weapon data, echo data, tier —
plus 3 real bugs already fixed then: wrong `bestEchoes`, wrong `weaponAlts`,
wrong tier row). This pass closed the remaining 2 dimensions and found 2
more real bugs in doing so: `roverspectro.heavy.standard-resonance-aftertune`
had no `damage.category` at all (silently rejected any teammate's Heavy ATK
DMG Bonus on a real 9.2%-of-total hit); `roverspectro.forte.resonating-echoes`
was miscategorized `basicDmg` despite its own kit text explicitly saying
"considered Resonance Skill DMG" (the same override-text pattern found
repeatedly elsewhere this session). Also added `'Heavy ATK'` to `dmgFocus`
(9.2% share, above the "low single digits" exclusion precedent already
established for Lucy's dropped Liberation focus). 3 new tests, full suite
green: 1369/1369.

**Rover: Havoc pass (2026-09-03)**: his dump already had 6 real bugs found
and fixed in an earlier pass (wrong `bestEchoes`/`weaponAlts`/tier/teams
entry, and a completely missing base-kit selfBuff, Metamorph). This pass
closed the remaining 2 dimensions and found 2 more real, bigger bugs:
`dmgFocus` was `['Heavy ATK', 'Basic ATK']` only — **Liberation was missing
entirely despite being his 2nd-LARGEST damage bucket** (26.2%/113,642 of his
total per the dump's own Damage Profile), and Skill (10.9%) was also
missing, both already correctly `libDmg`/`skillDmg`-categorized in
`roverhavoc.blocks.js` — silently rejecting real teammate Liberation/Skill
DMG Bonus buffs. Also `roverhavoc.outro.soundweaver` (his Outro's own real
direct damage, 7.2% of total, explicitly "not a team buff" per the kit
text) had no `damage.category` at all — fixed to `outroDmg` (the category
built for exactly this shape, Xiangli Yao's precedent). Checked and
confirmed NOT a bug: his real modeled `CHARACTER_ROTATIONS` never includes
a Basic ATK step — deliberate, it's the "Short Burst Combo" variant which
the dump's own Review section says explicitly "ignores Basic Attacks
entirely"; Basic ATK stays in `dmgFocus` regardless since it's still real
kit capability. 2 new tests, full suite green: 1371/1371.

**Rover: Aero pass (2026-09-03)**: her dump already had 7 real bugs found
and fixed in an earlier pass (wrong `bestWeapon`/`bestEchoes`/`teams`,
fabricated `totalMult` in CHAR_BUFF_TABLE, 3 dead-buff/mis-scoped chain
nodes). This pass closed the remaining 2 dimensions (dmgFocus, engine-block
parity — the latter was already clean) and found 2 more real bugs neither
earlier pass had caught: `dmgFocus` was `['Skill']` only — Liberation is a
genuine 18.9% (21,860) share, her 2nd-largest damage bucket, already
correctly `libDmg`-categorized — was silently rejecting a real teammate
Liberation DMG Bonus. Separately, her stored tier (`T1.5`/`T2`) didn't
match the dump's own DPS Tier rating (`T1`/`T1.5`, per the same "DPS Tier
not Value Tier" convention already established for Rover: Spectro) — a full
tier low on both axes, missed by both earlier passes. Also fixed a smaller
internal-consistency bug found in passing: `weaponAlts.alt5` duplicated
`bestWeapon` itself as its own "alternative" — no other character in this
file does that. 2 new tests, full suite green: 1373/1373.

**Jiyan pass (2026-09-03)**: his dump already had 3 real bugs found and
fixed in an earlier pass (missing `coordDmg` category on his Outro, 2
dead-buff-architecture chain nodes), with SKILL_MULTIPLIERS/RESONANCE_CHAIN_
DATA/weapon/echo data all already confirmed clean. This pass closed the
remaining dimensions and found a genuine dmgFocus bug the same shape as
Augusta's earlier fix: `dmgFocus` included `'Liberation'`, but his own
dump's Damage Profile shows a genuine **0% Liberation share** — his kit
text is explicit both Liberation-slot casts (Prelude, which enters Qingloong
Mode with no direct damage of its own, and Finale) are "considered Heavy
Attack DMG," and confirmed no block in `jiyan.blocks.js` is `libDmg`-
categorized at all. `'Skill'` (8.9%, real, already correctly `skillDmg`-
categorized, fires twice in his real rotation) was missing and added
instead. CHARACTER_ROTATIONS, CHAR_BUFF_TABLE, tier, and teams were all
independently re-checked and confirmed already correct. 2 new tests, full
suite green: 1375/1375.

**Yinlin pass (2026-09-03)**: her dump already had 3 real bugs found and
fixed in an earlier pass (Judgment Strike's real `coordDmg` category —
which also surfaced and fixed a missing `coordDmg` branch in the legacy
engine's `applyResonanceChain()` — and an entirely-missing Inherent Skill,
Deadly Focus), with SKILL_MULTIPLIERS/CHARACTER_ROTATIONS/CHAR_BUFF_TABLE/
RESONANCE_CHAIN_DATA/weapon/echo/tier/teams all already confirmed clean.
Closing the last dimension found `dmgFocus` was `['Coordinated ATK',
'Skill']` only — Liberation (14.3%/51,751) and Heavy ATK (6.8%/24,590) are
both real, already correctly `libDmg`/`heavyDmg`-categorized damage per her
own dump's Damage Profile, silently rejecting real teammate buffs. 1 new
test, full suite green: 1376/1376.

**Calcharo pass (2026-09-03) — first character audited under the updated
9-dimension methodology (dimension 8 broadened to real kit-component
coverage, dimension 9 icons added)**: his `Characters data dump/` file
already existed from an earlier pass, with SKILL_MULTIPLIERS/
CHARACTER_ROTATIONS/RESONANCE_CHAIN_DATA/CHAR_BUFF_TABLE/weapon/echo/tier
all already confirmed clean, and one real bug already fixed then
(`chain.s4`'s scope/trigger/duration). Closing dimensions 8-9 this pass
found 2 more real bugs, both the same shape: `calcharo.intro.wanted-outlaw`
and `calcharo.outro.shadowy-raid` were both entirely uncategorized
(`damage.category` missing) despite being real, sourced damage — Intro
5.1% (20,081) and Outro 7.6% (29,693) of his total per the dump's Damage
Profile — silently rejecting Resonance Skill DMG Bonus and Outro DMG Bonus
respectively on that damage. Fixed to `skillDmg` (Intro — the dump's own
multiplier row is labeled generically "Skill Damage", same convention as
Augusta's Stride of Goldenflare) and `outroDmg` (Outro — his own direct
damage on swap-out, not a team buff, same shape as Rover: Havoc's
Soundweaver). `dmgFocus` gained `'Outro'` accordingly; `'Skill'` (Intro's
5.1%) stays excluded — it sits in the ambiguous gap between this project's
own established exclude precedent (4.6%/5.5%, Rover: Spectro) and include
precedent (6.8%+, Yinlin/Denia/Iuno), nearer the exclude side. Resonance
Skill (Extermination Order, 2.3%) stays unmodeled — real but never fires in
the app's own CHARACTER_ROTATIONS, same "deliberately unmodeled" precedent
as Rover: Havoc's skipped Basic ATK step. Icons (dimension 9) checked and
confirmed already fully wired — every rotation move and all 6 Resonance
Chain nodes have a real icon, including 2 correctly-reused shared/generic
icons (Basic ATK weapon icon, also covering Heavy ATK/Mid-air/Dodge
Counter/Hounds Roar) — no gap found. 3 new tests, full suite green:
1379/1379.

**Encore pass (2026-09-03)**: her `Characters data dump/` file already
existed from an earlier pass, with SKILL_MULTIPLIERS/CHARACTER_ROTATIONS/
CHAR_BUFF_TABLE/base stats/tier/`bestWeapon`/`bestEchoes` all already
confirmed clean, and 2 real bugs already fixed then (`weaponAlts.alt4`
missing Radiant Dawn; `chain.s3`'s dead/no-op `heavyDmg` buff — both her
Liberation-DMG-categorized finishers are `libDmg`, not `heavyDmg`, fixed to
match). Closing dimensions 8-9 this pass found 2 more real bugs, the same
shape as Calcharo's: `encore.intro.woolies-helpers` and
`encore.outro.thermal-field` were both entirely uncategorized despite being
real, sourced damage — Intro 2.85% (10,587) and Outro 12.9% (39,258, her
2nd-largest bucket after Basic ATK) of her total per the dump's Damage
Profile — silently rejecting Resonance Skill DMG Bonus and Outro DMG Bonus
respectively. Fixed to `skillDmg` (Intro — no override text names a
different category, default convention) and `outroDmg` (Outro — a
free-to-quickswap DoT proc, explicitly not a team buff, same shape as
Calcharo's Shadowy Raid). `dmgFocus` gained `'Liberation'` (14.6%, already
correctly `libDmg`-categorized on `encore.forte.cosmos-rupture`) and
`'Outro'` accordingly; Echo (7.1%, generic equipped-Echo damage, not her
own kit's Echo Skill button) and Intro (2.85%, low single digits) both stay
excluded per established precedent. Icons (dimension 9) checked and
confirmed already fully wired for every rotation move and all 6 Resonance
Chain nodes — no gap found. 4 new tests, full suite green: 1382/1382.

**Jianxin pass (2026-09-03)**: her `Characters data dump/` file already
existed from an earlier pass with no bugs found there (SKILL_MULTIPLIERS/
CHARACTER_ROTATIONS/RESONANCE_CHAIN_DATA/CHAR_BUFF_TABLE/weapon/echo/tier/
teams/base stats all confirmed clean) — but that pass predated this
session's dimensions 5/8/9 rigor. Redoing those found the largest
discrepancy of any character audited so far: `dmgFocus` was `['Skill']`
only (8%) — Liberation is her single BIGGEST damage bucket (36.1%/56,486)
and Basic ATK her 2nd-biggest (30.9%/48,268) per the dump's own Damage
Profile, both already correctly `libDmg`/`basicDmg`-categorized in
`jianxin.blocks.js`, silently rejecting real teammate DMG Bonus buffs on
the majority of her damage. Dimension 8's full-kit-component pass also
found `jianxin.intro.essence-of-tao` and `jianxin.forte.primordial-chi-
spiral` (Pushing Punch) both entirely uncategorized — Intro ~5% (7,749,
fixed to `skillDmg`, generic "Skill Damage" row label) and Forte 12.1%
(18,878, fixed to `heavyDmg`). The Forte fix also surfaced and corrected a
real transcription error propagated into both `SKILL_MULTIPLIERS`' own row
note and the `CHARACTER_ROTATIONS` step note: both said Primordial Chi
Spiral is entered by "hold Basic ATK," but the dump's kit text is explicit
it's "hold Heavy Attack" — the same input-slot convention already used for
Yinlin's Forte:Chameleon Cipher confirms `heavyDmg` is correct. `dmgFocus`
fixed to `['Skill', 'Liberation', 'Basic ATK', 'Heavy ATK']`; Echo (7.9%,
generic equipped-Echo damage) stays excluded. Icons (dimension 9) checked
and confirmed already fully wired. 3 new tests, full suite green:
1385/1385.

**Lingyang pass (2026-09-03)**: his `Characters data dump/` file already
existed from an earlier pass, which had already fixed 3 real bugs
(`bestEchoes` set-name mismatch, a wrong ToA/WW tier swap, and his
Inherent Skill Diligent Practice being entirely missing) — but predated
this session's dimensions 5/8/9 rigor. Redoing those found the biggest
kit-segmentation gap yet: his OTHER Inherent Skill, **Lion's Pride** (+50%
DMG on Intro Skill Lion Awakens), was ALSO entirely missing from both
`CHAR_BUFF_TABLE` and `lingyang.blocks.js` — a whole kit component with no
block at all, not caught by the earlier pass's narrower check. Added as a
self-buff scoped only to the Intro hit via `scopedToBlockId`. Dimension 8's
full pass also found `lingyang.intro.lion-awakens`, `lingyang.forte.
glorious-plunge` (Glorious Plunge), and `lingyang.outro.frosty-marks` all
entirely uncategorized — Intro ~4.25% (13,631, fixed to `skillDmg`), Forte
5.8% (10,209, fixed to `heavyDmg` — entered by holding Heavy Attack per the
dump's own kit text, same convention as Jianxin's Forte), and Outro 13.9%
(44,664, his 3rd-largest bucket, fixed to `outroDmg`). `dmgFocus` was
`['Basic ATK']` only (33.8%) while Skill was a near-tied 2nd-biggest bucket
(31.7%, entirely missing) and Liberation a real 7.3% — both already
correctly categorized in the engine. Fixed to `['Basic ATK', 'Skill',
'Outro', 'Liberation']`; Heavy ATK (5.8%), Echo (5.77%, generic equipped-
Echo damage), and Intro (~4.25%) all stay excluded per the established
ambiguous-zone/generic-damage precedent. Icons (dimension 9) checked and
confirmed already fully wired. 5 new tests, full suite green: 1390/1390.

**Verina pass (2026-09-03)**: her `Characters data dump/` file already
existed (an earlier, differently-formatted dump — no "App Data Comparison"
bug-list section, and no Damage Profile percentages since she's a pure
Support with no calc site DPS breakdown published for her), but
`verina.blocks.js`'s own history shows it had already been through several
real-bug correction passes (Outro's `deepen` vs `allDmg` fix, a dead-buff-
shape S5→S6 rebuild, S6's entirely-missing Coordinated Attack proc).
Redoing dimensions 5/8/9 with this session's rigor found one more:
`dmgFocus` was `['Liberation']` only, despite 2 real `basicDmg`-categorized
blocks already existing — her actual Basic ATK combo (Cultivation Stage
3-5) AND Forte's Mid-air Starflower Blooms (override-categorized
"considered Basic Attack damage" per its own kit text, firing 3x in her
real rotation) — both silently rejecting real teammate Basic Attack DMG
Bonus. Fixed to `['Liberation', 'Basic ATK']`. Coordinated ATK (from her
S6-gated proc) stays excluded — dupe-conditional, not part of her S0
baseline kit. Confirmed Intro (Verdant Growth) correctly has no block at
all, matching `CHARACTER_ROTATIONS` never including it — the dump's own
Review section calls it "functionally unusable," and her real rotation
swaps in cold. Icons (dimension 9) checked and confirmed already fully
wired. 1 new test, full suite green: 1391/1391.

**Aalto pass (2026-09-03)**: his `Characters data dump/` file already
existed, with an earlier pass having fixed 2 real bugs (base stats off-by-
1, a wrong `teams` partner). Redoing dimensions 5/8/9 found the clearest
bug of any character audited so far: `dmgFocus` was `['Coordinated ATK']`
— entirely **fabricated**, since Aalto has no Coordinated Attack mechanic
anywhere in his kit (no mention in the dump, no `coordDmg` block in
`aalto.blocks.js` at all), while his real dump's Damage Profile (Basic ATK
35.7% dominant, Skill 31%, Liberation 14.8%, Intro ~10%) was entirely
absent. Fixed to `['Basic ATK', 'Skill', 'Liberation']` — Echo (11.9%)
stays excluded as generic equipped-Echo damage. Dimension 8 also found
`aalto.intro.feint-shot` and `aalto.forte.misty-cover` both uncategorized
— fixed to `skillDmg` (Intro: dump's generic "Skill Damage" row label;
Forte: same-named "Mist Missile" at the identical 59.65% multiplier as
Shift Trick's explicitly-Skill-DMG-labeled version, a strong enough
inference to categorize rather than leave with no basis at all). Also
found and corrected a false claim: `aalto.chain.s3`'s own comment said "no
DPS component sourced yet," but the dump is explicit S3 has a real
mechanic (Basic/Mid-air Attack through the Gate of Quandary generates 2
bonus bullets at 50% of that attack's own DMG) — comment fixed to state
this accurately. **Left unmodeled on purpose, not fabricated**: genuinely
ambiguous whether "that attack" means the whole multi-stage Basic ATK
combo this schema treats as one block, or each individual sub-hit within
it — a real, sourced, structurally-ambiguous S3 gap for a future pass to
resolve once that ambiguity can be settled, not silently dropped. Icons
(dimension 9) checked and confirmed already fully wired. 3 new tests, full
suite green: 1393/1393.

**Baizhi pass (2026-09-03)**: her `Characters data dump/` file already
existed, with an earlier pass having fixed 3 real bugs (base stats off-by-
1, a wrong ToA/WW tier, a wrong `bestEchoes` main-echo pick) and correctly
noting no Damage Profile percentages exist for her (source: "Baizhi
calculations aren't available yet," a genuine gap in the source itself,
not extraction). Redoing dimensions 5/8/9 found `baizhi.intro.overflowing-
frost` uncategorized (fixed to `skillDmg`, generic "Skill Damage" row
label) and `dmgFocus` missing `'Liberation'`/`'Heavy ATK'` despite both
already being real, correctly `libDmg`/`heavyDmg`-categorized blocks
(Momentary Union, Destined Promise channel) firing in her real
`CHARACTER_ROTATIONS` — fixed to `['Skill', 'Liberation', 'Heavy ATK']`.
Icons (dimension 9) checked and confirmed already fully wired. 2 new
tests, full suite green: 1395/1395.

**Chixia pass (2026-09-03)**: her `Characters data dump/` file already
existed, with an earlier pass having fixed 3 real bugs (base stats off-
by-1, a wrong `bestWeapon`, a wrong `teams` partner). Redoing dimensions
5/8 found the largest miscategorization impact of any character audited
so far: `chixia.forte.daka-daka` (her single BIGGEST damage source — 30
hits at 19.89% each) and `chixia.forte.boom-boom` (her single
hardest-hitting individual move, 437.39%) were BOTH uncategorized, despite
the kit text explicitly labeling both "(Resonance Skill DMG)" — not
ambiguous at all, unlike most other characters' default-convention fixes.
Boom Boom specifically is triggered by pressing the Basic Attack button
but is NOT Basic Attack DMG per its own kit text; the actual "(Basic
Attack DMG)" exit path only fires below 30 Thermobaric Bullets, a branch
that never occurs in her real modeled rotation (confirmed by the dump's
own Damage Profile: Basic 0%). This also exposed `dmgFocus` was actively
WRONG, not just incomplete: it included `'Basic ATK'` despite her genuine
0% Basic ATK share (no `basicDmg` block exists anywhere in
`chixia.blocks.js`), while Liberation (32.5%, her 2nd-largest bucket) and
Outro (9.6%, also fixed to `outroDmg`, was uncategorized) were both
missing. Fixed to `['Skill', 'Liberation', 'Outro']`. Intro (~3.35%) also
got its missing `skillDmg` category fixed but folds into the already-
included Skill category. Icons (dimension 9) checked and confirmed already
fully wired. 3 new tests, full suite green: 1398/1398.

**Danjin pass (2026-09-04)**: her `Characters data dump/` file already
existed, with an earlier pass having fixed 4 real bugs (a wrong
`bestEchoes` set, a missing `weaponAlts.alt5` entry, a stale Scatterbloom
multiplier plus 2 missing higher-tier Forte rows, and an entirely-missing
Inherent Skill Overflow). Redoing dimensions 5/8 found `danjin.intro.
vindication` uncategorized (fixed to `skillDmg`, default convention) and
`dmgFocus` actively wrong the same way as Chixia's: it included `'Basic
ATK'` despite no `basicDmg`-categorized block existing anywhere in
`danjin.blocks.js`, and her real `CHARACTER_ROTATIONS` never casting a
standalone Basic Attack step (Basic ATK 2/3 are only referenced as
prerequisites unlocking her Skill combos). Meanwhile Liberation — her
single BIGGEST damage bucket (29.7%/56,602) — was entirely missing despite
already being correctly `libDmg`-categorized. Fixed to `['Heavy ATK',
'Skill', 'Liberation']`. Icons (dimension 9) checked and confirmed already
fully wired. 2 new tests, full suite green: 1400/1400.

**Yangyang pass (2026-09-04)**: her `Characters data dump/` file already
existed, with an earlier pass having fixed 3 real bugs (a `bestEchoes`
entry with no main echo named, a wrong `bestWeapon`, a stale multiplier
digit). Redoing dimensions 5/8 found `yangyang.intro.cerulean-song`
uncategorized (fixed to `skillDmg`, default convention) and a genuine
miscategorization: `yangyang.heavy.zephyr-song` was `heavyDmg`, but the
kit text is explicit "Zephyr Song is a Basic ATK follow-up after Heavy
Attack or Dodge Counter" — the "Heavy ATK" rotation-step type is just the
input leading into it (same shape as Chixia's Boom Boom), confirmed by the
dump's own Damage Profile showing an explicit 0% Heavy share. Fixed to
`basicDmg`. Also found `yangyang.forte.feather-release` uncategorized
despite its own kit text saying "counted as Basic Attack DMG" — initially
left unmodeled pending clarification on whether that label covers the
whole multi-hit row (`21.73%×5 + 126.81%×2`) or only its landing sub-hit;
user confirmed this project's own "counted as X" convention applies the
label to the whole named move, not just the nearest sub-clause, so fixed
to `basicDmg` in full. `dmgFocus` was `['Skill']` only, missing Liberation
(42.1%, her single biggest bucket, already correctly `libDmg`-categorized);
Basic ATK gained 2 real sources once Zephyr Song and Feather Release were
correctly categorized. Fixed to `['Skill', 'Liberation', 'Basic ATK']`.
Icons (dimension 9) checked and confirmed already fully wired. 4 new
tests, full suite green: 1404/1404.

**Sanhua pass (2026-09-04)**: her `Characters data dump/` file already
existed, with an earlier pass having fixed 4 real bugs (a backwards
`bestEchoes` main+set pairing, a fabricated `teams` partner, a stale
ToA/WW tier mix, and 2 entirely-missing Inherent Skills). Redoing
dimensions 5/8 found the same class of gap as the earlier pass but one
level deeper: `sanhua.forte.clarity-of-mind-detonate` combined Detonate
and Ice Burst into ONE `heavyDmg`-categorized hit-list, despite the kit
text separately labeling each — "Detonate... (considered Heavy Attack
DMG)" vs. "Ice Burst... (considered Resonance Skill DMG)" — a real,
confirmed miscategorization (not just missing), matching the dump's own
Damage Profile showing Heavy (34.7%) and Skill (26.9%) as two distinct
substantial buckets. Split into 2 blocks (`sanhua.forte.detonate` =
`heavyDmg`, `sanhua.forte.ice-burst` = `skillDmg`); this also let 2 other
blocks that were riding on the old combined shape finally be modeled
correctly instead of approximated: Avalanche (previously blanket
`heavyDmg`, now `skillDmg` scoped to `sanhua.forte.ice-burst` only) and
S5 (previously unscoped `critDmg` — which would have boosted crit damage
on her WHOLE kit, not just Ice Burst as the kit text specifies — now
scoped correctly). Also found `sanhua.intro.freezing-thorns`
uncategorized (fixed to `skillDmg`, default convention). `dmgFocus` was
`['Basic ATK']` — WRONG, a genuine 0% real share with no `basicDmg` block
anywhere — while all 3 of her real categories (Heavy/Liberation/Skill)
were entirely missing. Fixed to `['Heavy ATK', 'Liberation', 'Skill']`.
Icons (dimension 9) checked and confirmed already fully wired. 5 new
tests, full suite green: 1407/1407.

**Taoqi pass (2026-09-04)**: her `Characters data dump/` file already
existed, with an earlier pass having fixed 2 real bugs (a `bestWeapon`
QOL-vs-raw-% mismatch, a malformed `bestEchoes` pairing). Redoing
dimensions 5/8 found `taoqi.intro.defense-formation` uncategorized (fixed
to `skillDmg`, default convention) and a striking `dmgFocus` inversion:
`'Skill'` alone (5.8%) was actually her SMALLEST modeled bucket, while
Basic ATK (43.1%, dominant, via Power Shift's Timed Counters) and
Liberation (37.3%, Unmovable) — her two biggest — were both entirely
missing despite already being correctly `basicDmg`/`libDmg`-categorized.
Fixed to `['Skill', 'Basic ATK', 'Liberation']`. Icons (dimension 9)
checked and confirmed already fully wired. 2 new tests, full suite green:
1409/1409.

**Yuanwu pass (2026-09-04)**: his `Characters data dump/` file already
existed (an earlier, differently-formatted dump — no "App Data
Comparison" bug-list section), with `yuanwu.blocks.js`'s own history
showing a real prior fix (every block defaulted to ATK-scaling when he's
actually a DEF-scaler, corrected 2026-09-02). Redoing dimensions 5/8 found
a self-contradicting bug: `yuanwu.liberation.blazing-might` combined
Thunder Wedge Detonation with Blazing Might's own hit into one `libDmg`
block — the block's OWN comment already said the detonation is "counted
as Resonance Skill DMG," but the code never applied it. Confirmed by
`SKILL_MULTIPLIERS['Yuanwu']` carrying "Thunder Wedge Detonation" as its
own dedicated row with that exact label. Split into 2 blocks: Blazing
Might's own hit stays `libDmg`; the detonation is now its own `skillDmg`
block (`yuanwu.forte.thunder-wedge-detonation-liberation`). Also fixed
`yuanwu.intro.thunder-bombardment`, uncategorized (default convention).
`dmgFocus` was `['Coordinated ATK']` only — unlike Aalto's fabricated
case, this one has real textual basis (his Thunder Field's Coordinated
Attack is genuine base kit), just no engine-representable block for it
(an any-ally-can-trigger-it repeated proc with no home in this schema,
same class as his own already-zeroed S1-S4/S6 chain nodes) — kept as-is,
but `'Skill'`/`'Liberation'` were both missing despite real, now-correctly
-categorized damage. Fixed to `['Skill', 'Liberation', 'Coordinated
ATK']`. Icons (dimension 9) checked and confirmed already fully wired. 4
new tests, full suite green: 1411/1411.

**Mortefi pass (2026-09-04)**: his `Characters data dump/` file already
existed and had already been carefully re-audited (2026-09-01), including
a real `chain.s3` over-crediting fix. Redoing dimensions 5/8 found
`mortefi.intro.dissonance` uncategorized (fixed to `skillDmg`, default
convention) and `dmgFocus` was `['Heavy ATK', 'Coordinated ATK']` — 'Heavy
ATK' WRONG, a genuine 0% real share (his Outro grants a Heavy ATK buff to
an ally, it's not his own damage), while Liberation (67%, his dominant
bucket), Skill (17.8%), and Basic ATK (8.2%) were all entirely missing
despite already being correctly categorized. Fixed to `['Liberation',
'Skill', 'Basic ATK', 'Coordinated ATK']`. Dimension 8's full pass also
surfaced a genuinely bigger gap, logged in §1a above rather than
force-fit here: his base-kit Burning Rhapsody Coordinated Attack (ally
Basic/Heavy ATK hits triggering off-field Marcato procs) is real, sourced
S0 kit — not a Resonance Chain node — and per the dump's own calc
methodology is folded into his 67% Liberation share, but no block models
it; only the S1/S5 chain-BONUS procs are modeled. `'Coordinated ATK'`
stays in `dmgFocus` regardless — real per his kit, same "no engine block
yet" treatment as Yuanwu's Thunder Field. Icons (dimension 9) checked and
confirmed already fully wired. 2 new tests, full suite green: 1413/1413.
(Follow-up same day: the flagged base-kit Marcato gap above was itself
closed via a rate-cap saturation model — see §1a, full suite 1414/1414.)

**Jinhsi pass (2026-09-04) — clean, no bugs found.** Her `Characters data
dump/` file already existed, with an earlier pass having fixed 1 real bug
(a stale/combined `SKILL_MULTIPLIERS` Forte row) and already carefully
scoping every Resonance Chain node's real mechanic, including 2
sophisticated existing fixes (S4's team-wide dual-trigger note, S6's
`scopedToBlockId`-doubled Illuminous-Epiphany-specific rate bonus).
Redoing dimensions 5/8/9 found nothing further: `dmgFocus`
(`['Skill', 'Liberation']`) already matched her dump's dominant 84.3%/
11.3% split exactly; every damage block's category already matches its
kit text's own "counted as X DMG" language; Intro (Loong's Halo, 3.12%)
correctly has no block since her canonical modeled rotation genuinely
never casts it (a real, dump-confirmed no-Intro quickswap variant, not an
oversight); Crescent Divinity correctly stays unmodeled since the app's
chosen "Standard Rotation/Opener" variant doesn't use it (the dump's
separate "Loop Rotation" does, a real alternate not selected). Icons
(dimension 9) checked and confirmed already fully wired. No code changes,
no new tests needed — logged here as verification, not a no-op skip.

**Augusta pass (2026-09-04) — near-clean, 1 real completeness gap found and
fixed.** Her `Characters data dump/` file and `augusta.blocks.js` already
carried an unusually deep prior audit trail (2026-09-02 "final Augusta
audit pass"): the halving-pattern bug across all 22 Lv.10 hit values
already retightened, Everbright Protector's missing `damage.category`
already fixed to `heavyDmg`, S3's unscoped `totalMult` already rescoped to
its 6 real named moves via `scopedToBlockId`, S5's fabricated `totalMult:15`
already zeroed, S6's Thunder Rage already modeled as a real 2×100%-ATK proc
block (not the flat `heavyDmg:200` legacy-table approximation), the Outro's
`allDmg` stat and `dmgFocus` (`['Heavy ATK', 'Skill']`, correctly excluding
Liberation since every Liberation-slot cast is explicitly "considered Heavy
Attack DMG" per her own kit text) both already matching the dump exactly,
and her tier/weapon/echo/icon/chain-node data all already verified clean.
Redoing all 9 dimensions against the fresh dump found everything above
still correct, plus one real gap dimension 1/8 flagged: `SKILL_MULTIPLIERS`
was missing reference rows for 6 real named kit moves the dump's own Basic
Attack/Forte multiplier lists document — Mid-air Attack (59.65%×2), Dodge
Counter (67.00%×2), Mid-air Dodge Counter (59.65%×2), and the "at full
Prowess/Ascendancy" Dodge Counter replacement variants (Dodge Counter -
Heavy Attack: Steelclash 46.39%×3, Dodge Counter - Thunderoar: Backstep
53.68%, Dodge Counter - Undying Sunlight: Strike 139.17%×2, considered
Resonance Skill DMG). None of these fire in her real modeled
`CHARACTER_ROTATIONS` (the rotation's real combo path is Backstep→
Spinslash, never Dodge Counter), so — matching the existing Lucy
Dodge-Counter-row precedent — added as documented reference rows only, no
new engine blocks. Full suite green: 1442/1442 — no new tests needed, since
the fix was reference-data-only (no new/changed engine behavior) and the
prior 2026-09-02 pass already added `triggerEngine-augusta.test.js` and
`augustaHalvedMultipliersFix.test.js` covering every real engine-block fix.

**Brant pass (2026-09-04) — verification only, all real fixes already
landed in a prior same-day pass.** His `Characters data dump/` file (a real
prydwen.gg snapshot dated 20/Aug/2026, created earlier the same day since
none existed before) and `brant.blocks.js` already carried a full 9-dimension
audit: SKILL_MULTIPLIERS/RESONANCE_CHAIN_DATA/CHAR_BUFF_TABLE all confirmed
matching the dump exactly (including the already-logged S2 Outro-proc gap —
440% ATK, Basic Attack DMG type, max 1/sec, max 2 explosions total);
`weaponAlts.alt4` had held 2 unsourced weapons (`'Overture'`,
`'Commando of Conviction'`) not present anywhere in the dump's exhaustive
5-weapon Best Weapons list — fixed by moving the 2 real missing alts (Red
Spring 73.1%, Emerald of Genesis 71.3%) into `alt5` and clearing `alt4`
rather than backfilling it with unsourced data; `brant.midair.
stage-2-3-charged-flip` had no `damage.category` — fixed to `basicDmg` per
the established Mid-air Attack convention (inherits Basic/Heavy ATK DMG,
never its own type); `chain.s3` (Returned from Ashes DMG Multiplier +42%)
and `chain.s6` (Mid-air Attack DMG Multiplier +30%) were both the same
Augusta-S3-shape unscoped `totalMult` over-crediting bug — silently
boosting his entire kit instead of only their real named target — both
fixed via `scopedToBlockId`. SKILL_MULTIPLIERS also gained reference-only
rows for base Heavy Attack (197.55%), Plunging Attack (104.78%), and Dodge
Counter (38.03%×3+57.04%×2), confirmed unused in his real modeled
`CHARACTER_ROTATIONS` (goes straight from Intro/Liberation into Mid-air
combat, matching the Lucy/Augusta Dodge-Counter-row precedent). dmgFocus,
tier, echo data, and icons (dimension 9) were all independently re-checked
against the fresh dump this pass and confirmed already correct — no
remaining gaps found. Re-running the full 9-dimension audit today
surfaced nothing new. Full suite green: 1442/1442 (no new tests needed —
the prior pass's 8 tests in `triggerEngine-brant.test.js` already cover
every real engine-block fix, including the cross-character
`roveraero.midair.plunging-attack` category fix caught in passing during
that same pass).

**Buling pass (2026-09-04) — 1 real bug found and fixed (dmgFocus).** A
full prior fix pass had already landed same-day (commit `7a283919`, no
write-up entry existed yet): her `Characters data dump/` file (a real
prydwen.gg snapshot dated 20/Aug/2026, created that pass since none existed
before — her Calculations tab explicitly states damage-profile percentages
aren't published for her at all, unlike every DPS-focused dump) already had
SKILL_MULTIPLIERS/CHARACTER_ROTATIONS/RESONANCE_CHAIN_DATA/CHAR_BUFF_TABLE/
base stats/`bestWeapon`/`weaponAlts` all independently re-verified exactly
matching this pass, plus 3 real fixes already landed then: `bestEchoes` had
the same Sanhua-shape orphaned-main-echo bug (`getSonataLoadouts()`'s
sequential `[main, set]` pairing left 1 of 2 same-set alt Main Echoes
without a paired set string) — fixed by repeating the set name per alt;
`buling.heavy.twin-thunders` wrongly modeled a value the source's own
Multipliers table explicitly labels "Healing" as real `basicDmg` damage —
removed (Twin Thunders is a pure team-heal, same as Twin Mountains, which
already correctly has no block); the DPS tier row was `['T1.5','T2']`
against the source's own `T2`/`T3`. Redoing all 9 dimensions against the
fresh dump this pass confirmed all of the above still correct, plus found
one more real gap dimension 5 flagged: `dmgFocus` was `['Liberation']`
only — 'Basic ATK' (5 real, already `basicDmg`-categorized blocks: Stage
1/2/4, Mid-air Attack, Heavy Attack - Mountain Over Thunder, all firing
every real `CHARACTER_ROTATIONS` loop) and 'Skill' (Thunder Talisman,
already `skillDmg`-categorized, also firing every loop) were both entirely
missing, silently rejecting real teammate DMG Bonus buffs on the majority
of her real personal damage — fixed to `['Basic ATK', 'Skill',
'Liberation']`, same "no Damage Profile % data, include all real
always-fired blocks" resolution as Youhu/Yuanwu. Dimension 8 (engine-block
parity) confirmed clean: Heavy Attack - Thunder Over Mountain (89.47%,
real but strictly worse/slower-to-reach than Mountain Over Thunder per the
dump's own Review text) and Basic Attack Stage 3/Dodge Counter (skipped by
the dump's own real Loop Rotation via a Jump-cancel straight from Stage 2
into Mid-air Attack) both correctly stay reference-only in
SKILL_MULTIPLIERS with no engine block, same Lucy/Augusta/Brant
Dodge-Counter-row precedent — neither fires in the real modeled rotation.
Icons (dimension 9) checked and confirmed already fully wired for every
rotation move and all 6 Resonance Chain nodes. 1 new test, full suite
green: 1443/1443.

**Camellya pass (2026-09-04) — 3 real bug classes found and fixed, the biggest
categorization miscall found in this audit series so far.** Her
`Characters data dump/` file and an "App Data Comparison" section already
existed from a same-day-earlier pass claiming SKILL_MULTIPLIERS/
CHARACTER_ROTATIONS/RESONANCE_CHAIN_DATA/CHAR_BUFF_TABLE/base stats/
`bestWeapon`/`weaponAlts`/`bestEchoes`/tier were all clean, plus 2 real fixes
already landed then (5 missing SKILL_MULTIPLIERS rows including the
consequential Floral Ravage 0-DMG-rotation-step gap, and a straight ToA/WW
tier swap). Per this pass's own instructions, all 9 dimensions were
independently re-verified from scratch against the fresh dump rather than
trusting that write-up, and it found real bugs the prior pass's narrower
check missed:
1. **Miscategorization, dimension 8 — the largest found in this audit series.**
   Camellya's kit text is explicit that Crimson Blossom, the Vining
   Waltz/Blazing Waltz combo, Ephemeral, and Floral Ravage are ALL
   "considered Basic Attack DMG" (Blossom/Budding Mode replaces her whole
   Basic/Heavy/Dodge-Counter/Skill kit with this combo) — yet all 5 of her
   `camellya.*` damage blocks covering those moves (`basic.vining-waltz-1`,
   `skill.crimson-blossom`, `skill.vining-waltz-combo`, `forte.ephemeral`,
   `skill.floral-ravage`) were categorized `skillDmg`. Confirmed by the
   dump's own Damage Profile showing a genuine **0% Skill share** against
   **67.1% Basic** (her dominant bucket) — none of her real modeled damage
   is actually Skill-type. Fixed all 5 to `basicDmg`.
2. **`dmgFocus` was wrong as a direct consequence of (1) and also missing a
   real bucket**: `['Basic ATK', 'Skill']` — 'Skill' had a genuine 0% share
   (now 0 skillDmg blocks exist in the file at all), while 'Liberation'
   (16.5%/78,645, her 2nd-largest bucket, already correctly
   `libDmg`-categorized on `camellya.liberation.fervor-efflorescent`) was
   entirely missing. Fixed to `['Basic ATK', 'Liberation']`.
3. **Unscoped `totalMult` over-crediting, dimension 8 — same bug class as
   Augusta's S3/S5 and Brant's S3/S6**: `chain.s2` (Ephemeral's own DMG
   Multiplier +120%), `chain.s5-everblooming` (Everblooming's own +303%),
   `chain.s5-twining` (Twining's own +68%), and `chain.s6-bloom-...` (Sweet
   Dream's own +150%, Budding-Mode-conditioned) were all unscoped
   `totalMult` buffs — per `resolveHitComposedDps.js`'s real application
   (`stats.totalMult` multiplies EVERY hit, not just the named move), each
   was silently over-crediting Camellya's entire kit instead of only the one
   real move its own kit text names. All 4 fixed via `scopedToBlockId`
   (`s5-twining`/`s6-bloom` each needed 2 scoped effect entries since Twining
   has 2 damage blocks and Budding Mode's real affected moves in the modeled
   rotation are the Vining Waltz combo + Floral Ravage). Fixing this also
   surfaced a **5th real bug in the same node**: `chain.s3`'s single block
   wrapped BOTH of its node's real effects — Fervor Efflorescent's
   unconditional totalMult +50% AND a genuinely Budding-Mode-conditional ATK
   +58% — under one `condition: { requiresStance: 'Budding Mode' }`, so the
   totalMult half never applied at all in the real modeled rotation
   (Liberation casts BEFORE Ephemeral/Budding Mode there). Split into 2
   blocks: `chain.s3-fervor-mult` (unconditional, scoped to
   `camellya.liberation.fervor-efflorescent`) and the original
   `chain.s3-a-bud-adorned-by-thorns` (kept conditional, atkPct only — not
   move-scoped since ATK isn't category-gated).
   RESONANCE_CHAIN_DATA's own flat-table s2/s3/s5/s6 rows were re-checked and
   left unchanged — they still match the dump's raw values exactly; only the
   TriggerBlocks' application scope was wrong.
Icons (dimension 9), weapon data, echo data, and CHAR_BUFF_TABLE were all
independently re-verified against the fresh dump and confirmed already
correct. 2 new tests added to `triggerEngine-camellya.test.js`
(categorization + scoping assertions) plus 1 existing test updated for the
S3 split; full suite green: 1445/1445.

**Augusta redo (2026-09-04) — genuine from-scratch re-audit (not a check-if-
already-done pass), found 1 real engine-block-parity bug the earlier same-day
Augusta pass missed.** Per this pass's own explicit instruction not to trust
any prior write-up's "already audited"/"final pass" claims, all 9 dimensions
were independently re-verified from scratch against `Characters data dump/
Augusta/Augusta.md` as if auditing her for the first time, rather than
treating the earlier 2026-09-04 "near-clean, 1 gap" entry above as ground
truth:
1. **SKILL_MULTIPLIERS** — every Lv.10 value (Basic/Heavy/Skill/Liberation/
   Forte/Intro/Outro, including the 6 reference-only rows the earlier pass
   added) re-checked digit-for-digit against the dump's own Multipliers
   lists. Confirmed exact, no drift.
2. **CHARACTER_ROTATIONS** — all 14 steps re-checked against the dump's own
   "Core Rotation" text and step-by-step Notes. Confirmed an exact match,
   including the Backstep→Spinslash repeat step and the Echo/Outro tail.
3. **RESONANCE_CHAIN_DATA** — every node (S1-S6) re-read against the dump's
   own R1-R6 kit text, including re-checking S3's scoping (does its +25% DMG
   Multiplier apply kit-wide, or only to its 6 real named moves?) and S5
   (still correctly zeroed — a purely defensive Glory's Favor shield bonus,
   no DPS component). Confirmed all already correct.
4. **CHAR_BUFF_TABLE** — Outro (`allDmg`, not `elemDmg`) and the Crown of
   Wills self-buff (`elemDmg`) both re-verified against the dump's own "+15%
   DMG Amplification for ALL Attributes" / "each stack grants +15% Electro
   DMG Bonus" text. Confirmed correct.
5. **dmgFocus** — re-checked against the dump's own Damage Profile (Heavy
   ~74.6%, Skill ~16.7%, Liberation 0% since every Liberation-slot cast is
   explicitly "considered Heavy Attack DMG", Intro/Echo minor slices).
   `['Heavy ATK', 'Skill']` confirmed correct; Echo's real 6.46% share
   confirmed correctly excluded — it's gear-Echo damage (The False
   Sovereign's own Transform hit), not a kit move explicitly categorized as
   Echo Skill DMG the way Phrolova/Galbrena/Sigrika's OWN kit abilities are,
   so it doesn't belong in this kit-damage-type gate.
6. **Weapon data** — `bestWeapon` (Thunderflare Dominion) and `weaponAlts`
   (alt5: Verdant Summit/Ages of Harvest; alt4: Aureate Zenith/Autumntrace;
   alt3: Guardian Broadblade) re-checked against the dump's full 12-weapon
   Best Weapons list. Confirmed correct, matching the established "alt4
   reserved for the best 4-star options, not every ranked 5-star" convention
   used elsewhere.
7. **Echo data** — `bestEchoes` (`['The False Sovereign', 'Crown of Valor
   3pc + Void Thunder 2pc']`) re-checked against the dump's Best Echo Set
   section. Confirmed correct.
8. **Engine-block parity — 1 real bug found.** Re-decomposed the dump's real
   rotation move-by-move against `augusta.blocks.js` looking specifically
   for the patterns flagged going into this pass (miscategorization against
   kit-text override language, unscoped chain-node buffs, wrongly-nested
   conditions). Categorization and S3's `scopedToBlockId` scoping were both
   confirmed already correct (no repeat of Camellya's miscategorization bug
   or an unscoped-totalMult bug here). Found instead: `augusta.chain.
   s6-thunder-rage` (Thunder Rage, the S6-granted 2×100%-ATK proc on casting
   Thunderoar: Spinslash) only fired on the FIRST of the two real Spinslash
   casts in her modeled rotation. The engine's trigger-key matching is
   exact-label (`cast:${type}:${skill}`, rotationSimulator.js), and the
   SECOND Spinslash cast is folded into the combined repeat step `'Heavy
   ATK:Thunderoar: Backstep → Spinslash'` (a different label than the first
   step's bare `'Heavy ATK:Thunderoar: Spinslash'`) — so the single S6 block
   only ever matched the first cast, silently dropping one of the two real
   Thunder Rage procs per rotation. The kit's own text ("Casting Thunderoar:
   Spinslash or Thunderoar: Uppercut ALSO triggers Thunder Rage") states no
   once-per-rotation cap — only a separate 1s Crown-of-Wills-stack ICD that
   doesn't gate the Thunder Rage hits themselves. Fixed by adding
   `augusta.chain.s6-thunder-rage-repeat`, an identical damage block
   triggered on the repeat step's own label — same "one block per real
   rotation-step label" pattern already used for `augusta.heavy.
   thunderoar-backstep-spinslash-repeat`.
9. **Icons** — `SKILL_ICONS['Augusta']`/`CHAIN_NODE_ICONS['Augusta']`
   re-checked against every real rotation-step skill name (via
   `getSkillIcon`'s `skillName.includes(key)` matching) and all 6 chain
   nodes. Confirmed fully wired, no gap.

1 new test added to `triggerEngine-augusta.test.js` (asserts Thunder Rage
fires — with 2 hits each — on both the first AND repeat Spinslash casts, at
two genuinely different simulated times). Full suite green: 1446/1446.

**Brant redo (2026-09-04) — genuine from-scratch re-audit (not a check-if-
already-done pass), found 2 real bugs the earlier same-day Brant pass missed
(that pass trusted the dump/blocks' own in-code comments and only added a
missing write-up entry, finding no new bugs).** All 9 dimensions were
independently re-verified from scratch against `Characters data dump/
Brant/Brant.md`, specifically re-checking every damage block and chain node
for the 3 bug classes found on Camellya/Augusta (miscategorization against
kit-text override language, unscoped `totalMult` chain buffs, and
repeat-step trigger-label mismatches):
1. **SKILL_MULTIPLIERS** — every Lv.10 row (Basic ATK Stage 1-4, Mid-air's
   5-stage Charged Combo, Heavy ATK/Rhapsodic Riff, Dodge Counter, Skill,
   Liberation, Forte, Intro, Outro) re-checked digit-for-digit against the
   dump's own Multipliers tables. Confirmed exact (aggregated sums match:
   e.g. Stage 3 = 22.06%×3+33.08%×2 = 132.34% ≈ the stored 132.3%). The
   Mid-air combo's known Stage-1-vs-Stage-2-Charged-Attack branch ambiguity
   (flagged since 2026-08-31: which grapple-swing stage a real Charged
   Attack chains off is a player-input branch the flat schema can't
   express) remains an explicitly-documented TODO, not a silent bug.
2. **CHARACTER_ROTATIONS** — all 5 steps re-checked against the dump's own
   Standard Rotation text. Confirmed an exact match. No step repeats a
   combo (unlike Augusta's Spinslash), so the repeat-trigger-label bug class
   does not apply here — checked and confirmed not applicable.
3. **RESONANCE_CHAIN_DATA** — every node (S1-S6) re-read against the dump's
   own kit text, specifically re-checking S3/S6's `scopedToBlockId` scoping
   (already fixed in the prior pass) for correctness rather than trusting
   it: S3's +42% Returned from Ashes multiplier and S6's +30% Mid-air
   Attack multiplier are both still correctly scoped to only their named
   move (+ S6's own secondary-blast block for S3), not unscoped `totalMult`
   over-crediting the whole kit. Confirmed correct, no repeat of Brant's own
   earlier-fixed bug or Camellya's.
4. **CHAR_BUFF_TABLE** — Outro (`elemDmg`+`skillDmg`, condition-gated to
   Fusion incoming Resonators, matching Roccia's established
   elemDmg-buff-to-incoming-Resonator convention exactly) and the Trial by
   Fire and Tide self-buff (`elemDmg`) both re-verified against the dump's
   kit text. Confirmed correct.
5. **dmgFocus — 1 real bug found.** `['Basic ATK', 'Skill']` was wrong:
   'Skill' has a genuine 0% real share per the dump's own Damage Profile —
   his Skill button (Anchors Aweigh!) is never cast for damage in the real
   rotation (only Plunging Attack, optionally and immediately
   Ultimate-cancelled, itself "considered Basic Attack DMG"), and no block
   in `brant.blocks.js` is `skillDmg`-categorized for any real rotation
   damage. 'Liberation' (18.1%/44,052, his 2nd-largest bucket, already
   correctly `libDmg`-categorized on `brant.liberation.to-the-horizon`) was
   entirely missing — the exact same shape as this same session's Camellya
   fix. Fixed to `['Basic ATK', 'Liberation']`.
6. **Weapon data** — `bestWeapon` (Unflickering Valor) and `weaponAlts`
   (alt5: Laser Shearer/Bloodpact's Pledge/Red Spring/Emerald of Genesis,
   the prior pass's own fix; alt3: Sword of Night, the universal Sword
   starter-weapon convention used by 12 other Sword characters) re-checked
   against the dump's exhaustive 5-weapon Best Weapons list. Confirmed
   correct.
7. **Echo data** — `bestEchoes` (`['Dragon of Dirge', 'Tidebreaking Courage
   5pc']`) re-checked against the dump's Best Echo Set section. Confirmed
   correct.
8. **Engine-block parity — 1 real bug found.** Re-decomposed the dump's kit
   text move-by-move against `brant.blocks.js`: `brant.intro.applaud-for-me`
   had no `damage.category` at all, silently rejecting Resonance Skill DMG
   Bonus on a real 1.63% (10,359) damage share. His Intro carries no
   "considered X DMG" override in the kit text ("Attack target, Fusion DMG,
   grants Interlude Applause"), so per the established default convention
   for an un-overridden Intro Skill hit (Calcharo's Wanted Outlaw/Encore's
   Woolies' Helpers, both fixed the same way this session) it resolves to
   `skillDmg`. Fixed. Every other real named move/state (Mid-air combo,
   Liberation, Forte, S6 secondary blast) already has a correctly-scoped
   block and category; Skill (Anchors Aweigh!)/Heavy ATK/Dodge Counter
   confirmed deliberately unmodeled (never cast for damage in the real
   rotation, per the dump's own Standard Rotation and reference-data-only
   SKILL_MULTIPLIERS comment).
9. **Icons** — `SKILL_ICONS['Brant']`/`CHAIN_NODE_ICONS['Brant']`
   re-checked against every real rotation-step skill name and all 6 chain
   nodes. Confirmed fully wired (including 3 correctly-reused shared/generic
   Sword icon slots), no gap.

2 new tests added to `triggerEngine-brant.test.js` (Intro's `skillDmg`
category; `dmgFocus` equals `['Basic ATK', 'Liberation']`). Full suite
green: 1448/1448.

**Buling redo (2026-09-04) — genuine from-scratch re-audit (not a check-if-
already-done pass), found 2 real bugs the earlier same-day Buling passes
missed (the first pass mostly trusted a prior commit and found 1 bug, a
follow-up pass closed dimensions 8/9 and found 1 more — this pass
independently re-verified all 9 dimensions from scratch against
`Characters data dump/Buling/Buling.md` rather than trusting either prior
write-up, specifically re-checking every damage block and chain node for
the 3 bug classes found on Camellya/Augusta/Brant** (miscategorization
against kit-text override language, unscoped chain-node buffs stacking
kit-wide instead of scoped to one move, and repeat-step trigger-label
mismatches):
1. **SKILL_MULTIPLIERS** — every Lv.10 row (Basic ATK Stage 1-4, Mid-air
   Attack, Dodge Counter, both Heavy Attack combos, Skill/Pull-in Effect,
   both Liberation forms, Five Thunders Spell Array, Intro, Outro)
   re-checked digit-for-digit against the dump's own Multipliers tables.
   Confirmed exact, no drift.
2. **CHARACTER_ROTATIONS** — all 10 Loop Rotation steps re-checked against
   the dump's own "Loop Rotation" text. Confirmed an exact match. No step
   repeats a combo under a differently-worded combined label, so the
   repeat-trigger-label bug class (Augusta's) does not apply here — checked
   and confirmed not applicable.
3. **RESONANCE_CHAIN_DATA** — every node (S1-S6) re-read against the dump's
   own Resonance Chain text, specifically re-checking S1's Crit Rate scoping
   (is it scoped to just Flashing Thunder Spell: Harmony, or unscoped over
   Buling's whole kit like Camellya's bug?) and S6's stacking behavior
   against `buling.libbuff.five-thunders-skill-ramp` (both fire on the same
   Liberation cast). S1: confirmed the existing unscoped `self`-scope
   modeling is the documented, accepted class of imprecision — the schema's
   own `scopedToBlockId` caveat only enforces scoping on `trigger.type:
   'passive'` blocks, and S1 is a real `cast`+`duration` buff-window block
   (not passive), so `scopedToBlockId` would be a structural no-op here;
   left as-is, matching precedent elsewhere for this exact engine
   limitation. S6: **1 real bug found** — `buling.chain.s6` stored the flat
   absolute ceiling value (50), which stacks ADDITIVELY on top of the base
   ramp buff's own 25% (both fire on the same Liberation cast, no
   replace-instead-of-add mechanism in this engine), giving a wrong 75%
   total instead of the real 50% the dump's own kit text describes ("now
   grants 50% ... up from the base 25%"). The block's own prior comment
   explicitly flagged this as a "known imprecision ... not fixed in this
   conversion" — not taken at face value. Fixed by modeling `chain.s6` as
   the +25-point DELTA over the base ramp buff instead of the flat 50, so
   the two blocks now sum to the correct 50% ceiling (the
   RESONANCE_CHAIN_DATA/CHAR_BUFF_TABLE legacy flat-table path keeps its own
   separate, still-undocumented-as-fixed additive-double-count limitation —
   a cross-cutting `calcEngine.js` architecture gap out of scope for a
   single-character engine-block audit, not modified this pass).
4. **CHAR_BUFF_TABLE** — `outroBuffs` (`allDmg`, 15%, 30s) and `libBuffs`
   (`skillDmg`, 25%, 24s) both re-verified against the dump's own Outro and
   Forte Circuit kit text. Confirmed correct.
5. **dmgFocus** — re-verified `['Basic ATK', 'Skill', 'Liberation']` (this
   source has no Damage Profile % breakdown at all) against which blocks
   actually fire every real Loop Rotation loop: 5 real `basicDmg` blocks
   (Stage 1/2/4, Mid-air Attack, Heavy Attack - Mountain Over Thunder), 1
   real `skillDmg` block (Thunder Talisman) plus the Intro fix below, and
   Liberation (Flashing Thunder Spell: Harmony). Confirmed correct, no
   fabricated or omitted entries.
6. **Weapon data** — `bestWeapon` (Stringmaster) and `weaponAlts` (alt5:
   Lethean Elegy/Rime-Draped Sprouts/Luminous Hymn/Cosmic Ripples; alt4:
   Waltz in Masquerade) re-checked against the dump's full 6-weapon Best
   Weapons list. Confirmed correct.
7. **Echo data** — `bestEchoes` (`['Fallacy of No Return', 'Rejuvenating
   Glow 5pc', 'Bell-Borne Geochelone', 'Rejuvenating Glow 5pc']`) re-checked
   against the dump's Best Echo Set section (one set, two alternative Main
   Echoes). Confirmed correct, including the earlier pass's own
   repeated-set-name fix for `getSonataLoadouts()`'s sequential pairing.
8. **Engine-block parity — 1 real bug found (plus the S6 fix under
   dimension 3 above).** Re-decomposed the dump's kit text move-by-move
   against `buling.blocks.js`: `buling.intro.summon-and-smite` had no
   `damage.category` at all, silently rejecting Resonance Skill DMG Bonus on
   her Intro's real, always-fires-every-loop hit. The dump's own Intro Skill
   multiplier table literally labels this row "Skill Damage" (not "Intro
   DMG") — the same generic-labeling-defaults-to-skillDmg convention already
   fixed for Aalto/Calcharo/Encore/Jianxin/Brant's own Intro rows. Fixed to
   `category: 'skillDmg'`. Every other real named move (Basic ATK Stages
   1/2/4, Mid-air Attack, Thunder Talisman, Mountain Over Thunder,
   Liberation both forms) already has a correctly-categorized block; Stage
   3/Dodge Counter/Heavy Attack - Thunder Over Mountain/Twin Mountains
   confirmed deliberately unmodeled (never cast in the real Loop Rotation,
   matching the established "SKILL_MULTIPLIERS row present but no block
   needed when never cast in the modeled rotation" convention, e.g. Aalto's
   own un-blocked Dodge Counter).
9. **Icons** — `SKILL_ICONS['Buling']`/`CHAIN_NODE_ICONS['Buling']`
   re-checked against every real rotation-step skill name (via
   `getSkillIcon`'s `skillName.includes(key)` matching, including the Outro
   step's own `'Exorcism Spell'` key) and all 6 chain nodes. Confirmed
   already fully wired, no gap.

2 new tests added to `triggerEngine-buling.test.js` (Intro's `skillDmg`
category; S6 + base-ramp-buff sum to the real 50% ceiling instead of
double-counting to 75%), 1 existing test updated (S6's own value changed
from the flat 50 to the 25-point delta). Full suite green: 1450/1450.

**Cantarella pass (2026-09-04) — genuine from-scratch re-audit (not a
check-if-already-done pass), found 5 real bugs a prior same-day pass (which
only found 3 Kit-tab/teams/tier issues and explicitly signed off dimensions
3/4/5/8 as clean) missed. Independently re-verified all 9 dimensions against
`Characters data dump/Cantarella/Cantarella.md`, specifically re-checking
every damage block and chain node for the 3 bug classes found on Camellya/
Augusta/Brant/Buling (miscategorization against kit-text override language,
unscoped chain-node buffs stacking kit-wide instead of scoped to one move,
and repeat-step trigger-label mismatches):**
1. **Damage-category override bug, the same shape as Rover: Spectro's/
   Jiyan's, found twice**: `cantarella.liberation.flowing-suffocation`
   (Flowing Suffocation, cast from the Liberation slot) was `libDmg`, but
   its own kit text is explicit — "Havoc DMG (**considered Basic Attack
   DMG**)". `cantarella.liberation.diffusion-summons` (the off-field
   Dreamweaver Coordinated ATK summon chain) was `coordDmg`, but its own kit
   text is equally explicit — "Coordinated Attacks (Havoc DMG, **considered
   Basic Attack DMG**)". Both silently accepted the wrong teammate DMG Bonus
   type (Liberation/Coordinated ATK) and rejected the real one (Basic ATK).
   Independently confirmed by the dump's own Damage Profile: Liberation is a
   genuine **0%** share, Basic ATK the dominant **69.1%** one — exactly what
   this fix produces. Both fixed to `basicDmg`.
2. **Unscoped chain-node buff, S1** (bug class (b)): `cantarella.chain.s1`
   was a single unscoped `totalMult: 50` self-passive — the real kit text
   scopes this to 3 specific moves only (Graceful Step, Flickering Reverie,
   Perception Drain's own DMG Multiplier), not her entire kit. Was silently
   boosting every damage block she has. Rescoped to 3 `scopedToBlockId`
   entries, one per real move, same multi-block-scoping pattern already used
   for Camellya's chain.s5-twining/chain.s6-vining and Changli's tag-mapped
   entries.
3. **Cascading category fix, S3**: `cantarella.chain.s3` (Flowing
   Suffocation's own +370% DMG Multiplier) was keyed to `libDmg`, matching
   the pre-fix (wrong) category on the damage block above — once that block
   became `basicDmg`, this buff would have silently stopped applying to
   anything at all. Rescoped to `basicDmg` + a new `scopedToBlockId` (basicDmg
   is now shared with 3 other blocks that must NOT receive this +370%).
   `RESONANCE_CHAIN_DATA['Cantarella'].s3` updated to match (`libDmg: 370` →
   `basicDmg: 370`).
4. **Newly-created leak, S6**: `cantarella.chain.s6-basic-mult` (Phantom
   Sting's own +80% DMG Multiplier) was already `basicDmg`-categorized and
   correct in isolation, but unscoped — once fix #1 made `basicDmg` a
   4-block-wide category (was 3), this node would have started silently
   over-crediting Flowing Suffocation too, a move S6's own kit text never
   mentions. Added `scopedToBlockId: 'cantarella.forte.phantom-sting'`.
5. **dmgFocus/buffs, the same shape as Zhezhi's fix in the same table**:
   `dmgFocus` was `['Coordinated ATK']` only — with fix #1 applied she has
   **zero** real `coordDmg`-category damage at all. Real, already-correctly-
   categorized, non-negligible shares missing entirely: Basic ATK (69.1%,
   dominant), Skill (9.8%, Graceful Step + Flickering Reverie), Heavy ATK
   (7.2%, Delusive Dive). Fixed to `['Basic ATK', 'Skill', 'Heavy ATK']`.
   The `buffs` display column had the same wrong `'Coordinated ATK'` tag;
   fixed to what she actually grants (`['Havoc DMG Amp', 'Skill DMG Amp',
   'Heal']`, matching `CHAR_BUFF_TABLE['Cantarella'].outroBuffs`/`selfBuffs`
   exactly). Liberation stays excluded from `dmgFocus` — confirmed genuinely
   0% by the dump's own Damage Profile, consistent with fix #1.

Also found and fixed a smaller **SKILL_MULTIPLIERS completeness gap**: the
Intro Skill's Mirage-state replacement, Tidal Surge (16.90%×3+118.30%), was
entirely missing despite being a real row in the dump's own Multipliers
table — added, same Kit-tab-completeness treatment (never cast in
`CHARACTER_ROTATIONS`, per the dump's own Review: "essentially never
realistically used") already given to Mid-air Attack/Dodge Counter/Abysmal
Vortex/Shadowy Sweep in the earlier same-day pass.

**Carlotta pass (2026-09-04) — genuine from-scratch re-audit** (an earlier
2026-08-31/09-02 pass had already fixed 3 real bugs — 2 dead cast-scoped/
no-duration chain nodes, S1/S2, and 3 missing SKILL_MULTIPLIERS rows — and
had explicitly signed off dimensions 1-7 as clean; independently
re-verified all 9 dimensions from scratch against `Characters data dump/
Carlotta/Carlotta.md` rather than trusting that sign-off, per this
session's own "genuine first-time audit" instruction). SKILL_MULTIPLIERS,
CHARACTER_ROTATIONS (including the repeat `'Skill:Art of Violence →
Chromatic Splendor'` combined-step label — confirmed it matches its
block's `trigger.on` exactly, no bug class (c) instance here), weapon
data, and echo data all re-confirmed clean. Found and fixed 6 more real
bugs, all missed by the earlier pass:
1. **A 3rd unscoped-passive-`totalMult` whole-kit leak, on top of the 2
   already found** (bug class (b)): `carlotta.chain.s5` (Imminent
   Oblivion's own +47% DMG Multiplier) was `trigger:{type:'cast',
   on:'Forte:Imminent Oblivion'}` with no `timing.duration` — the exact
   dead no-op shape already found and fixed on this file's own S1/S2 (the
   engine-architecture history item 12) — a 6th confirmed instance
   project-wide, missed by the pass that fixed S1/S2 in the same file.
   Fixed to passive + `scopedToBlockId:'carlotta.forte.imminent-oblivion'`.
2. **Two unscoped-`totalMult`-on-passive-node whole-kit leaks** (bug class
   (b), a different shape from #1 — these already had `trigger:
   {type:'passive'}`, so they DID fire, but `resolveHitComposedDps.js`
   applies `stats.totalMult` unconditionally to every hit the character
   lands, not gated by `damage.category` the way `elemDmg`/`skillDmg`/etc.
   are): `carlotta.chain.s3` (+93%, real scope: Art of Violence +
   Chromatic Splendor only) and `carlotta.chain.s6` (+186.6%, real scope:
   Death Knell only) were both unscoped, silently boosting Carlotta's
   WHOLE kit — Intro, Outro, Imminent Oblivion, Era of New Wave/Fatal
   Finale, everything — not just their real named moves. Rescoped: S3 to
   3 `scopedToBlockId` effects (Art of Violence, Chromatic Splendor, AND
   the repeat-pass combined block `...-chromatic-splendor-2`, so the 2nd
   occurrence isn't silently dropped); S6 to Death Knell only.
3. **Fabricated-zero `dmgFocus` entry** (bug class (e), the same shape as
   Jiyan's/Cantarella's fixes): `dmgFocus` was `['Skill', 'Liberation']` —
   but the dump's own Damage Profile shows a literal **0%** Liberation
   share (all 3 Twilight Tango moves are explicitly "considered Resonance
   Skill DMG" per kit text, already correctly `skillDmg`-categorized, none
   `libDmg`), and the dump's own Substats priority list names only
   "Resonance Skill DMG" — no Liberation DMG substat at all. Fixed to
   `['Skill']`. Basic ATK (8.3%, real) has no wired `basicDmg` block at
   all — her real rotation never casts plain Basic Attack — and isn't
   named in the Substats priority either, left out rather than guessed
   (Lumi's "flagged not guessed" precedent).
4. **Cascading dead-buff target, `selfbuff.final-bow`**: was an unscoped
   `{stat:'libDmg', value:80}` self-passive — but with fix #3 confirming
   NO block in `carlotta.blocks.js` is `libDmg`-categorized at all, this
   buff was a complete silent no-op, a `libDmg` stat pool nothing in her
   kit ever reads (Final Bow's own kit text is a flat "+80% DMG
   Multiplier" on Era of New Wave/Death Knell/Fatal Finale specifically,
   not a general Liberation-category bonus anyway). Fixed to 3
   `totalMult` effects, each `scopedToBlockId`'d to one of those 3 blocks
   (Aemeath S3's multi-scoped-effects-on-one-block pattern).
5. **Missing `damage.category`, bug class (d)**: `carlotta.outro.closing-
   remark` (794.2% ATK, 3.77%/43,872 of her total per the Damage Profile)
   and `carlotta.chain.s3-kaleidoscope-sparks` (the S3 extra Outro strike)
   both had NO `damage.category` at all — her own real swap-out damage,
   explicitly not a team buff, same shape already fixed to `outroDmg` on
   Calcharo/Encore/Lingyang/Rover: Havoc's Outros. Fixed both to
   `outroDmg`. Not added to `dmgFocus` — 3.77% sits below the established
   ambiguous-exclude zone (4.6-5.5%, e.g. Xiangli Yao's Outro).
6. **Wrong Whimpering Wastes tier**: stored as `T3`, but the dump's Review
   section states DPS Tier explicitly as `T1` (ToA) / `T4` (WW) — Value
   Tier is a separate `T1.5`/`T3`, not what this column stores, per the
   established "DPS Tier not Value Tier" convention (Rover: Aero/Iuno).
   Fixed WW to `T4`.

Checked and confirmed correct, not bugs: chain.s1's unconditional Crit
Rate (sourced, unchanged from the earlier pass); chain.s4's whole-team
`skillDmg` buff (correctly team-scoped per its own real mechanic, no
narrowing needed); Intro Wintertime Aria staying uncategorized (only
1.25% share, no kit-text override and no generic "Skill Damage" row label
to base a guess on, unlike Calcharo/Encore/Jianxin/Aalto/Baizhi/
Lingyang's Intro fixes which all had that specific basis). Icons
(dimension 9) re-confirmed fully wired, including the already-present
generic-Pistols-icon reuse for Basic ATK/Necessary Measures/Plunging
Attack. 9 new tests
(`src/__tests__/triggerEngine-carlotta.test.js`), full suite green:
1453/1453.

Checked and confirmed NOT a bug: Jolt (198.81% Havoc DMG, "considered Basic
Attack DMG", auto-triggered when a Hazy-Dream'd target next takes damage) —
a real, deterministic hit in the realistic rotation (her own next Phantom
Sting connects immediately after Flickering Reverie) but with no existing
trigger mechanism that actually fires it: `'negative-status-hit'` is
declared in `TRIGGER_TYPES` (`triggerBlocks.schema.js`) but has zero
resolver support anywhere in the engine (`resolveHitComposedDps.js`/
`resolveHitComposedTeamDps.js`/the legacy resolvers all have no case for
it) — adding a block with this trigger would be silently inert, the exact
"don't fabricate a value that doesn't actually apply" class this schema
already warns against elsewhere. Building real `negative-status-hit` support
is an engine-capability gap, out of scope for a per-character data pass —
left correctly documented as unmodeled, same conclusion the prior pass
reached but now for a verified reason (checked the resolvers directly)
rather than trusted secondhand. CHAR_BUFF_TABLE, remaining RESONANCE_CHAIN_DATA
nodes (S2, S4/S5's correct empty `{}`), CHARACTER_ROTATIONS steps, weapon
data, echo data, tier, and icons were all independently re-verified against
the dump and confirmed already correct.

6 new tests added/updated in `triggerEngine-cantarella.test.js` (S1's 3-way
scoping, S3's basicDmg rescope + scoping, S6-basic-mult's scoping, Diffusion's
basicDmg category, Flowing Suffocation's basicDmg category). Full suite
green: 1452/1452.

**Cartethyia pass (2026-09-04) — genuine from-scratch re-audit**: all 9
dimensions independently re-checked against a fresh dump read start-to-
finish, not trusted from the file's own extensive prior-audit comments.
2 real bugs found, both matching bug classes flagged elsewhere this session:

1. **Missing rotation step, silent zero-DMG gap (dimension 8/engine-block
   parity + dimension 2/CHARACTER_ROTATIONS + dimension 1/SKILL_MULTIPLIERS)**:
   the dump's own "Full rotation" listing explicitly includes "Mid-air Attack
   Stage 3 (Fleurdelys, hold Basic during Skill)" immediately after Skill 1
   (Sword to Answer Waves' Call) — a real, always-cast step. It had NO
   SKILL_MULTIPLIERS row, NO CHARACTER_ROTATIONS step, and NO engine block
   anywhere. Added all 3: SKILL_MULTIPLIERS row `['Mid-air', 'Fleurdelys
   Stage 3', '2.20%', ...]` (the dump's own Forte Circuit multiplier table),
   a CHARACTER_ROTATIONS step between Skill 1 and the Basic P3-P5 string, and
   engine block `cartethyia.midair.fleurdelys-stage-3` (`basicDmg`, `HP`
   basis — no kit-text override names a different category, same
   mid-air-inherits-Basic-ATK-DMG convention already used for her other
   Mid-air block).
2. **Unscoped `totalMult` leaking onto her whole kit (bug class b)**:
   `cartethyia.chain.s2`'s real effect ("DMG Multiplier of Mid-air Attack
   +200% specifically") was modeled as a bare `{ stat: 'totalMult', value:
   200 }` with no `scopedToBlockId` — since `totalMult` is not category-gated,
   `resolveHitComposedDps.js` was applying it unconditionally to EVERY hit in
   her kit (Basic/Skill/Liberation included), not just Mid-air Attack.
   Rescoped via 2 `scopedToBlockId` entries (Camellya/Cantarella/Carlotta's
   own multi-block-scoping pattern) to both of her real Mid-air Attack blocks
   — including the newly-added Stage 3 block above (checked for the
   cascading-widening pattern explicitly: since bug #1 added a 2nd real
   Mid-air Attack block, the S2 fix has to scope to both, not just the
   pre-existing one, or it would silently under-credit the new block).

All other dimensions independently re-verified clean against the fresh dump:
SKILL_MULTIPLIERS' other 10 rows (verbatim match), RESONANCE_CHAIN_DATA (all
6 nodes, including S5's correct empty defensive-only omission), CHAR_BUFF_TABLE
(outro/debuff values), `dmgFocus` (`['Basic ATK', 'Liberation']`, correctly
excluding Skill's borderline 6.6% per established precedent), weapon data
(`bestWeapon`/`weaponAlts`/tier bucketing by rarity all match the dump's
ranked list), echo data (`bestEchoes` matches Windward Pilgrimage 5pc +
Reminiscence: Fleurdelys), tier (`T0.5`/`T1.5` matches exactly), base stats
(HP/ATK/DEF/Energy all matches exactly), and icons (SKILL_ICONS/
CHAIN_NODE_ICONS fully wired, including the new Stage 3 step resolving via
the existing `'Fleurdelys'` generic-icon substring match with no changes
needed). Heavy Attack/Enhanced Heavy Attack/Dodge Counter/Upward Cut stay
deliberately unmodeled — the dump's own Damage Profile shows a genuine 0%
Heavy Attack bucket for this exact benchmark rotation, confirming they're
correctly swap-cancelled out rather than a coverage gap.

3 new tests added to `triggerEngine-cartethyia.test.js` (Stage 3's damage/
category/firing, S2's totalMult scoping), plus a 1-line index-shift fix in
`data-integrity.test.js`'s `KNOWN_UNRESOLVED_BASELINE` (`Cartethyia[7]` →
`Cartethyia[8]`, since the new rotation step pushed a later known-baseline
step's index up by 1 — not a new bug, that step's legacy-calculator lookup
mismatch pre-dates this pass). Full suite green: 1455/1455.

**Chisa pass (2026-09-04) — genuine from-scratch re-audit**: all 9 dimensions
independently re-checked against a fresh dump read start-to-finish, not
trusted from `chisa.blocks.js`'s own extensive prior-audit comments (several
of which turned out to be stale or simply wrong on re-check). 4 real bugs
found, all matching bug classes flagged elsewhere this session:

1. **Death Snip miscategorized against its own kit-text override (bug class
   a)**: `chisa.basic.stage2-death-snip` folded Basic ATK Stage 2 + Rending
   Lunge + Death Snip into one `basicDmg` block, but the dump's own kit text
   is explicit for Death Snip specifically: "**Counted as Resonance
   Liberation DMG.**" Split into 2 blocks — `chisa.basic.stage2-rending-
   lunge` (`basicDmg`) and a new `chisa.basic.death-snip` (`libDmg`) — both
   still firing off the same combined rotation step.
2. **4 real damage blocks with no `damage.category` at all (bug class d)**:
   `chisa.forte.sawring-blitz-2-3`, `chisa.forte.sawring-eradication` (+ its
   ring-scalar twin), `chisa.skill.serrated-loop`, and
   `chisa.intro.reverberance-return` were all uncategorized. Sawring - Blitz
   and Sawring - Eradication are both explicitly "counted as Resonance
   Liberation DMG" per kit text (fixed to `libDmg`); Serrated Loop is an
   un-overridden base Skill move (fixed to `skillDmg`, the default); the
   Intro's own multiplier row is literally labeled "Skill DMG" in the dump
   (fixed to `skillDmg`, same convention already used for Aalto/Calcharo/
   Buling's own Intro rows). Fixing the Liberation-categorized pair also
   un-broke a cascading gap: S3's/S5's own `libDmg`-gated chain buffs
   (+120%/+100%) had been silently applying to the Liberation ultimate's
   single hit ONLY, not to Blitz/Eradication/Death Snip despite the kit text
   naming all of them as Liberation-categorized too — checked for over-
   crediting risk (none of Chisa's own blocks use `scopedToBlockId`, so
   widening `libDmg` coverage here is a pure fix, not a leak).
3. **3 chain/buff blocks dead against the actual modeled rotation (bug class
   c)**: `chisa.chain.s1`, `chisa.debuff.thread-of-bane`, and
   `chisa.chain.s6` all triggered on `cast:Skill:Eye of Unraveling` — but
   `CHARACTER_ROTATIONS['Chisa']` (the Loop Rotation, Intro available) never
   casts base Skill at all, only Serrated Loop, so these 3 real, sourced
   Unseen-Snare-application effects (S1's +30% ATK, Thread of Bane's 18%
   DEF Ignore, S6's Unseen Snare-Finality +30% deepen) never fired in the
   modeled rotation. The dump's own kit text confirms Unseen Snare is
   applied "via Skill hit, hitting shortly after **Serrated Loop**, [...] or
   simply locking onto a target" — retargeted all 3 to `Skill:Serrated
   Loop`, the move actually cast.
4. **Missing rotation step, silently dropped real damage (bug class f)**:
   Rending Lunge is a real, always-cast step named in both the dump's
   Opener and Loop "Full rotation" text, and its own multiplier row
   (`15.11%×4+90.66%`) is right there in the dump's Basic ATK table — but it
   had no `SKILL_MULTIPLIERS` row at all, despite this file's own prior note
   incorrectly asserting it was "not sourced anywhere." Added the row
   (`characters.js`) and its hits (folded into the Stage-2 block above,
   since both cast together as one combined rotation step).

All other dimensions independently re-verified clean against the fresh dump:
SKILL_MULTIPLIERS' other rows (verbatim match once Rending Lunge was added),
CHARACTER_ROTATIONS (matches the dump's own Loop Rotation step-for-step),
RESONANCE_CHAIN_DATA (all 6 nodes' stored values, including S4's correctly-
unmodeled proc-rate-only effect), CHAR_BUFF_TABLE (selfBuffs/debuffs values
and durations), `dmgFocus` (`['Basic ATK', 'Liberation']` — Skill's real
share is a "trivial slice" by the dump's own Damage Profile, ~4%, same
exclusion precedent as Cartethyia's dropped 6.6% Skill), weapon data
(`bestWeapon`/`weaponAlts`/tier all match the dump's ranked list and rarity
buckets), echo data (`bestEchoes` matches both the Rejuvenating Glow and
Thread of Severed Fate builds and their correct main-echo pairings), tier
(`T0`/`T0` matches the dump's own standard ToA/WW Ratings section exactly,
not its separate Value Tier List), base stats (HP/ATK/DEF/Energy all match),
and icons (SKILL_ICONS/CHAIN_NODE_ICONS fully wired, including Rending
Lunge's own already-present icon key).

12 tests in `triggerEngine-chisa.test.js` (was 8; added category-coverage,
libDmg-categorization, Rending-Lunge-hit-sum, and trigger-retarget checks).
Full suite green: 1459/1459.

---

## 2. Legacy-calculator correctness — real, unresolved finding

**8 of 24 characters' declared `bestWeapon` still disagree with what the
app's own engine actually computes as highest-DPS**, after two real bugs in
this comparison were already found and fixed (shield-gating on Moongazer's
Sigil/Thunderflare Dominion; `skillDmg` weapon-passive credit not gated by
`dmgFocus`, which also uncovered and fixed a bigger bug — 100
`RESONANCE_CHAIN_DATA` entries across the roster whose category-specific DMG
Mult chain bonuses were silently discarded because the routing step ran
before the chain-bonus block, not after). The remaining 8 disagreements have
**not been root-caused** — could be a further real bug in `calcTeamStats.js`,
stale hand-authored `bestWeapon` data, or a legitimate real-world factor this
simplified model doesn't capture (e.g. AoE/quickswap value, same caveat
already flagged for Aemeath's Fusion Burst resolution). Needs its own
diagnostic-first pass, same rigor as the two fixes that already came out of
this same audit thread.

---

## How to add to this file

Same convention as the file it replaces: when an audit turns up a real,
verified architecture or content gap, add a dated entry here with what was
found, where, and why it's still open — not a speculative wishlist, and not
re-logging something already fixed. When an item here gets closed, delete its
entry rather than marking it done — this file should only ever describe what
remains.
