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
version of this pass; **Calcharo, Encore, Jianxin — added 2026-09-03, first
three characters audited under the updated 9-dimension methodology** (see
below). Many more
have had *partial*, targeted fixes from later sessions' dump-verification
passes (see the `Characters data dump/` audit trail and an earlier
session's `auditBlockCoverage.mjs` sweep — that sweep covers 3 of the 9
dimensions: rotation-step/chain/buff-table coverage, not the full set).
The remaining ~47 characters have not had a full Phase A pass. Not
urgent — the coverage-audit sweep already closed the highest-risk gaps
(unmatched rotation steps = silent 0-DMG bugs) roster-wide — but the full
8-dimension methodology itself is not complete.

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
