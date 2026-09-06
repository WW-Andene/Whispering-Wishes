# calcTeamStats.js — dependency map (Layer 5, pre-extraction deliverable)

Full read-through of `calcTeamStats()`, 1674 lines, one function. This maps every
section's real inputs/outputs/gate before any code moves — extraction happens
section-by-section from this map, each verified against the full test suite before
the next, not as one blind pass.

**Confirmed while reading:** the legacy flat-table path is *not* one monolithic
fallback — it's cordoned off behind `allMembersConverted` (whole-team gate, ~4
places) and, in the RAW tier, an even finer **per-member** gate
(`BLOCKS_BY_CHARACTER[m.name] && CHARACTER_ROTATIONS[m.name]`, line 629). Since
every character except **Jingran** (unreleased, no sourced kit yet) has a block set,
the legacy branches are dead code for every real team today. This lowers the real
risk of extraction — the two branches are already structurally distinct, not
interleaved — but each branch still mutates a wide set of shared outer-scope
variables rather than returning values, which is what makes a blind mechanical
move unsafe.

## Section map

| # | Section | Lines | Gate | Reads (outer scope) | Writes (outer scope) | Calls out to |
|---|---|---|---|---|---|---|
| 1 | Member build (`mems`) | 66–120 | always | `slots`, `teamIdx`, `teamEquipment`, `CHARACTER_DATA`, `WEAPON_DATA`, `ECHO_SETS` | `mems` | — |
| 2 | Main DPS selection | 121–134 | always | `mems`, `mainDpsOverride` | `mainDps`, `allBuffs`, `allDebuffs` | — |
| 3 | Enemy scaling | 136–149 | always | `enemyEcho`, `enemyLevel`, `ECHO_DATA` | `enemyDef90`, `enemyResMap`, `getEnemyRes` (closure) | `getEnemyStatsAtLevel` |
| 4 | Shared team data | 151–179 | always | `mems`, `mainDps`, `teamEquipment` | `elCounts`, `sumOnField`, `rotTime`, `energyCycleFactors`, `allMembersConverted`, `engineChosenOrder` | `countTeamElements`, `calcEnergyCycles`, `chooseOnFieldOrder`, `gateBlocksBySequence`, `filterExclusiveModeBlocks` |
| 5 | **Rotation timeline** (IIFE) | 181–500 | **always runs**, but internally prefers `engineChosenOrder` when present (line 418) — legacy permutation search (`permutations`/`buildForOrder`/`scoreOrder`) is the fallback path, not gated out entirely | `mems`, `mainDps`, `rotTime`, `CHAR_BUFF_TABLE`, `TEAM_SET_BUFFS`, `ECHO_SKILL_BUFFS`, `CHARACTER_ROTATIONS`, `CHARACTER_DATA`, `STAT_LABELS_FULL`, `engineChosenOrder` | `rotationTimeline` | — |
| 6 | Overlap-uptime helpers | 502–534 | always | `rotationTimeline`, `mainDps` | `rotSegByName`, `dpsSeg`, `overlapUptimeForSeg`/`overlapUptime`/`outroStart`/`blockStart` (closures, consumed by §7 legacy block) | — |
| 7 | Shield-gated weapon helper | 536–553 | always | `mems`, `CHARACTER_DATA` | `gateWeaponDefIgnore` (closure, consumed by §7 legacy + §8 RAW) | — |
| 8 | **RAW tier** | 555–656 | **per-member** branch inside one loop: blocks-based (line 629, real path for every character but Jingran) vs. legacy `routeTypeBonuses` formula (648–654, Jingran only) | `mems`, `mainDps`, `rotRotTime`≡`rotTime`, `teamEquipment`, `BLOCKS_BY_CHARACTER`, `CHARACTER_ROTATIONS`, `elCounts` | `rawTotalRotDmg`, `gearDeltaByName` (both consumed later by FULL tier §10/§11 and §14 solo DPS) | `resolveHitComposedDps`, `deriveStepsFromRotation`, `applyFullEchoSet`, `applyEchoStats`, `routeTypeBonuses` (Jingran-only), `calcAvgCrit`/`calcResMult` (Jingran-only) |
| 9 | **FULL tier — legacy buff accumulation** | 657–1050 | `if (!allMembersConverted)` (whole block) | `mainDps`, `mems`, `teamEquipment`, `teamIdx`, `CHAR_BUFF_TABLE`, `dpsSeg`, `rotTime`, `elCounts`, `ECHO_SKILL_BUFFS`, `gateWeaponDefIgnore`, `overlapUptime`, `outroStart`, `blockStart`, `TEAM_SET_BUFFS`, `dpsFocus` | mutates local `atkPct/cr/cd/elemDmg/skillDmg/deepen/defShred/resShred/defIgnore/amplify/echoDmg/basicDmg/heavyDmg/libDmg/coordDmg/seqTotalMultBonus` (declared 666–669, **outside** the gate so §11 can read them either way) | `createStats`, `applyFullEchoSet`, `parsePassive`, `getSubstatGradeValue`, `applyBuff`, `applyResonanceChain`, `routeTypeBonuses` |
| 10 | **FULL tier — stat-panel engine override** | 1052–1108 | `if (allMembersConverted && engineChosenOrder)` overrides what §9 (or its skip) produced | `atkPct/cr/cd/...` (from §9 or defaults), `engineChosenOrder`, `gearDeltaByName`, `mainDps` | `effAtk`, `avgCrit`, `dmgBonus`, `defMult`, `resMult`, `score`, and re-assigns `atkPct/cr/cd/elemDmg/skillDmg/amplify/deepen/defShred/resShred/defIgnore` | `resolveSimulatedTeamRotation`, `projectMainDpsStatPanel` |
| 11 | **DOT tier** | 1110–1133 | always (self-contained call), but reads `engineChosenOrder?.blocksByOwner` | `mems`, `rotTime`, `defMult`, `resShred`, `getEnemyRes`, `resMult`, `energyCycleFactors`, `engineChosenOrder` | `dotResult`, `dotDmgPerRotation`, `hasFrazzle/hasErosion/hasFusionBurst/hasElectroFlare`, `tuneBreakDeepenMult`, `tuneBreakResolvedStances` (declared here, filled later in §13) | `resolveDotReactionDps` |
| 12 | **Legacy per-member damage loop** | 1134–1345 | `if (!allMembersConverted)` | `mainDps`, `rotTime`, `mems` | `totalRotDmg`, `memberDmgArr` (both **unconditionally overridden** by §13 for a real team — this section's only live consumer today is Jingran) | (large inline formula, no major external calls beyond what §9 already imported) |
| 13 | **Engine-composed damage override** | 1347–1392 | `if (allMembersConverted)` | `engineChosenOrder`, `mems`, `energyCycleFactors`, `gearDeltaByName`, `enemyDef90`, `getEnemyRes` | `totalRotDmg`, `memberDmgArr` (overwritten) | `resolveHitComposedTeamDps` |
| 14 | Per-member breakdown + echo active dmg | 1394–1460 | always | `memberDmgArr`, `mems`, `teamEquipment`, `avgCrit`, `defMult`, `resShred` | `memberDmg`, `echoActiveDmg` | `calcResMult`, `getWeaponPv` |
| 15 | Tune Break mode-exclusive resolution | 1462–1539 | always (reads `dotResult` from §11) | `dotResult`, `totalRotDmg`, `echoActiveDmg`, `mems`, `rotTime`, `defMult`, `engineChosenOrder` | `dotDmgPerRotation`, `tuneBreakDeepenMult`, `tuneBreakResolvedStances` (mutated in place) | `recomputeFusionBurstDmg` |
| 16 | DOT distribution to members | 1541–1552 | always | `mems`, `CHAR_BUFF_TABLE`, `dotDmgPerRotation` | `memberDmg[*].dotDmg/.total` | — |
| 17 | Team DPS / member DPS / solo DPS / synergy / warnings | 1554–1669 | always | everything computed above | `teamDps`, `memberDps`, `soloDps`, `synergyUplift`, `dmgSources`, `syn`, `warnings`, `dotDps` | `isHealerRole`, `universalStatApplies` |
| 18 | Return statement | 1671–1673 | always | nearly everything above | (return value) | — |

## What this means for extraction order

The safest section to extract first is the one with the **fewest external reads
and the narrowest, already-isolated gate**: §11 (DOT tier) — it's a single
self-contained call plus result-unpacking, already delegates its real logic to
`resolveDotReactionDps`, and doesn't mutate a wide shared-variable set (it
*declares* new locals, it doesn't rewrite ones §9/§10 also touch). §13 (engine
damage override) is the next-safest — narrow read set, single clear output pair
(`totalRotDmg`, `memberDmgArr`).

§9 (legacy buff accumulation, 393 lines) is the highest-risk section — it's the
one that genuinely needs the full mutate-to-return conversion, touching 15 shared
variables across dozens of scattered `+=` sites. Given it's already Jingran-only
dead code for every real team, the pragmatic order is: extract everything else
into named, independently-testable functions first (verified against the full
suite each time), then isolate §9 as `computeLegacyMainDpsStats()` last, once it's
the only remaining monolithic block — by then it can be extracted mechanically
(move the block, wrap in a function returning the 11-variable object) with much
lower risk, since every neighboring section will already have a clean boundary to
diff against.

## 2026-09-06 update — legacy-removal task, final state

Per direct user instruction, three things were attempted in sequence:

1. **Jingran blocks file** (`engine/characterBlocks/jingran.blocks.js`, new) — written from the
   real, already-sourced data in characters.js (`SKILL_MULTIPLIERS['Jingran']`,
   `RESONANCE_CHAIN_DATA['Jingran']`, `CHAR_BUFF_TABLE['Jingran']`, `CHARACTER_DATA['Jingran']`).
   Deliberately incomplete (no rotation-derived damage test, several unmodeled gaps noted inline) —
   matches the user's own "make the Jingran block even incomplete" instruction. **Not** added to
   `BLOCKS_BY_CHARACTER` (characterBlocks/index.js) — see next point for why.
2. **Cartethyia's Erosion migrated** — `DotApplier` extended with `requiresTeammate`/
   `valueWithTeammate` (block.schema.js), her 3 real erosion-applying blocks tagged with the real
   Rover: Aero-doubling condition (`value: 3` / `valueWithTeammate: 6`), and
   `resolveErosionFromBlocks` (dotReactionsFromBlocks.js) updated to apply it based on real team
   membership. This is a genuine bugfix, not just a migration: the legacy `CHAR_BUFF_TABLE` path
   hardcoded `erosion: 6` with NO runtime Rover: Aero check at all, so it silently overcounted
   Cartethyia's Erosion on any team without Rover: Aero. Every real Erosion applier in the roster is
   now block-tagged.
3. **Legacy removal — BLOCKED, not done.** The task's own premise was: "once (1) and (2) mean
   `allMembersConverted` is true for every real roster character," delete the dead legacy branches.
   Re-verifying against the live code (not assuming) found this premise doesn't hold and can't be
   made to hold without fabricating data:

   `allMembersConverted` (calcTeamStats.js line ~181) is
   `mems.every(m => BLOCKS_BY_CHARACTER[m.name] && CHARACTER_ROTATIONS[m.name])` — it requires BOTH
   a blocks file AND a `CHARACTER_ROTATIONS` entry for every team member. **No
   `CHARACTER_ROTATIONS['Jingran']` entry exists**, and characters.js's own comment on his entry
   (line ~1053) explicitly forbids adding one: "Re-checked 2026-08-31... still not fabricatable...
   do not fill this in until his kit is actually revealed post-release." Jingran has no sourced
   rotation because he hasn't released yet (~2026-09-10 per BANNER_HISTORY) — this is not something
   step (1) above could have changed, and inventing a rotation order to flip the gate would be
   exactly the fabrication this codebase's sourcing discipline forbids.

   Consequently, `BLOCKS_BY_CHARACTER['Jingran']` is deliberately left unset even though
   `JINGRAN_BLOCKS` now exists (see jingran.blocks.js's and index.js's own comments) — setting it
   without a paired rotation would make the `blocks && rotation`-style checks partially true in a
   way that crashes downstream (`chooseOnFieldOrder`/`buildTeamSteps` read
   `CHARACTER_ROTATIONS[m.name]` unconditionally once the blocks half passes). This means
   **`allMembersConverted` is still false for any team that includes Jingran**, exactly as before
   this task — the legacy FULL-tier buff accumulation (§9), the legacy per-member damage loop
   (§12), and the RAW-tier per-member legacy branch (`BLOCKS_BY_CHARACTER[m.name] &&
   CHARACTER_ROTATIONS[m.name]` at the per-member level, ~line 648) all remain genuinely reachable
   — Jingran is already selectable in the character roster today (`CHARACTER_DATA['Jingran']`
   exists, unconditionally), so a user building a team with him hits this path right now, not
   hypothetically. Deleting `legacyMainDpsStats.js`/`legacyMemberDamage.js` or their call sites
   would break real team calculations for any Jingran-inclusive team.

   Grepped the whole `app/src` tree (`legacyMainDpsStats|legacyMemberDamage|
   computeLegacyMainDpsStats|computeLegacyMemberDamage`): the only caller is `calcTeamStats.js`,
   confirming this is now a single-purpose, single-caller fallback that exists ONLY to keep Jingran
   usable — not stale dead weight left over from an incomplete migration. **Recommendation:** leave
   `legacyMainDpsStats.js`/`legacyMemberDamage.js` and the `!allMembersConverted`/per-member RAW-tier
   legacy branches exactly as they are (they're already well-commented as Jingran-only, dated
   2026-09-05/06) until `CHARACTER_ROTATIONS['Jingran']` is real, sourced data — at that point
   `Jingran: JINGRAN_BLOCKS` can be added to `BLOCKS_BY_CHARACTER`, `allMembersConverted` becomes
   unconditionally true, and this whole section-map's §9/§12 (and the RAW-tier legacy branch) can be
   deleted as truly dead code in one pass, verified against `phase3-parityGolden.test.js`.

   The legacy rotation-timeline IIFE (§5) and everything not gated behind Jingran-only branches was
   NOT touched — out of scope once (3) turned out to be blocked, and unrelated to either sourcing
   fix in (1)/(2).

This document is kept (not deleted) — the section map above (§1-§18) is still an accurate read of
the live file's structure as of this pass; only this final section is new.
