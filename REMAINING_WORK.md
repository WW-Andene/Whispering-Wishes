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
Jinhsi, Changli, Youhu, Zhezhi, Xiangli Yao, Shorekeeper — added
2026-09-03/04, first twenty characters audited under the updated
9-dimension methodology** (see below). Many more
have had *partial*, targeted fixes from later sessions' dump-verification
passes (see the `Characters data dump/` audit trail and an earlier
session's `auditBlockCoverage.mjs` sweep — that sweep covers 3 of the 9
dimensions: rotation-step/chain/buff-table coverage, not the full set).
The remaining ~46 characters have not had a full Phase A pass. Not
urgent — the coverage-audit sweep already closed the highest-risk gaps
(unmatched rotation steps = silent 0-DMG bugs) roster-wide — but the full
8-dimension methodology itself is not complete.

**Open item needing a human decision (2026-09-04):** Shorekeeper's
`weaponAlts.alt5` lists `["Firstlight's Herald", 'Cosmic Ripples']`, but
her own dump's Best Weapons table only names 4 total options (signature
+ 3 4★s, no other 5★) — neither alt5 weapon appears anywhere in it. Not
changed since the dump extraction may simply not be an exhaustive weapon
list (unlike its Resonance Chain/SKILL_MULTIPLIERS tables); flagged
rather than guessed at.

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
