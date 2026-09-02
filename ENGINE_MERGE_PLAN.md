# Engine Merge Plan — merging the legacy calculator into the TriggerBlock engine

**Mandate** (user, 2026-09-02): "deux engine c'est trop. merge l'ancien et nouveaux engine, puis
nettoies entiere de fond en comble. puis reconstruit tout proprement de A à Z. tout les bloc à réparé,
créé ou modifié." Full authority to take however long this needs; every step must be documented with
surgical precision, nothing forgotten. **Hard constraint: never touch `CharacterDetailModal` data or
the `Characters data dump/` files** — this plan and every step under it respects that boundary.

This document is the living engineering record for the merge — status, inventory, phase-by-phase
findings, and the full character checklist. Update it as work happens, the same discipline
`Engine development.md` already established for individual findings (which this plan supersedes for
anything architecture-scale — individual character data bugs unrelated to the merge still go there).

---

## ORDER CORRECTION (user, 2026-09-02) — mandatory phase gate, applies retroactively to everything below

The original Phase 2 work (Buling/Denia/Aemeath/Ciaccona/Rover: Spectro DOT migrations) jumped straight
to CROSS-character interaction logic (Denia/Aemeath's Fusion Burst combinatorial resolver) before every
character was individually, atomically decomposed. **Corrected, explicit order, binding for all
remaining work:**

1. **Phase A — solo block-decomposition, per character, one at a time.** Every character gets broken
   down into blocks along EVERY one of these dimensions, sourced from their own kit dump + real
   `CHARACTER_ROTATIONS`/`SKILL_MULTIPLIERS` — nothing cross-referencing another character yet:
   - **élément** (element) — the block's own damage element, and any element-scoped condition
   - **dot** — which shared DOT reaction (if any) this block feeds (`dotApplier`)
   - **type dégât** (damage type) — `kind:'damage'`, its `damage.category`
     (basicDmg/heavyDmg/libDmg/skillDmg/echoDmg/coordDmg) or lack thereof, and why
   - **type buff** — `kind:'buff'`, its `effects[].stat`
   - **type debuff** — `kind:'debuff'`, its `effects[].stat`, target (self vs enemy)
   - **timing** — `trigger.type`, `timing.duration`/`cooldown`, stacking mode
   - **condition** — `condition.element`/`requiresRole`/`requiresStance`/`assumedInactive` — every
     conditional fact from the kit text, not just the ones that happened to matter for a prior fix
   - **context** — `target.scope`, sequence/Resonance-Chain gating (`requiredSequenceOf`), and which
     real rotation step/context this block fires in
   Done ONE character at a time, verified complete on all 8 dimensions before moving to the next.
2. **Phase B — cross-character interactions.** Only once every character in a given team/comparison has
   passed Phase A: shared DOT-reaction aggregation, `ally-action` reactive buffs, mode-resolution
   spanning multiple characters, etc. (This is what Denia/Aemeath's Fusion Burst resolver already is —
   valid work, but it should be revisited/re-verified once both their OWN Phase A passes are confirmed
   complete, not assumed complete because a narrow slice of it — Tune Break/Fusion Burst specifically —
   was already touched.)
3. **Phase C — theorize.** Team-composition optimization, "which mode should I actually run" advice,
   etc. — only once B is solid.

The rest of this document (the old "Phase 0/1/2" numbering) is being restructured under this corrected
order below — old phase numbers are kept as headers for continuity with prior commits, but their
CONTENT is now understood as partial Phase-A/Phase-B work, not a separately-numbered track.

### Phase 0.5 — schema-completeness inventory (MUST happen before resuming Phase A)

User correction: the schema (`triggerBlocks.schema.js`) has been extended reactively, per-character,
as each new shape was hit (`dotApplier` only when DOT migration started, `ally-action`/`trigger-actor`
only when Qingxiao's S4 was investigated, `requiresStance` on `appliesTags` only for Denia/Lynae,
`confirmedWinningStance` only for Lynae's specific edge case) — never surveyed completely up front. That
means Aemeath/Denia/Lynae/Qingxiao's Phase A audits were checked against a schema that might still be
incomplete, not a stable vocabulary. Correct order: inventory every distinct mechanic SHAPE the roster
actually needs, first — a real `grep` sweep (`"this schema"`/`"no home"`/`"not representable"` across
every `characterBlocks/*.js` file, 275 raw hits, deduplicated below into 17 distinct primitive gaps),
not from memory. Then decide, per gap, whether it's worth a real schema addition or a legitimate,
permanent scope boundary (a non-DPS mechanic this calculator correctly never modeled) — and only THEN
resume Phase A with a vocabulary that isn't still shifting under it.

**Real gaps — affect an actual computed DPS/buff number, worth a schema primitive eventually:**

| # | Gap | Example characters | What's missing |
|---|---|---|---|
| 1 | Nonlinear/multi-tier per-stack curve | Qingxiao (Mindlock: 7 stacks@7% + rest@2%), Yangyang: Xuanling (Unbroken Vow: 3@10%+3@12%), Sigrika (2%/1% ER above 125%, capped) | `effects[].stacking` only supports a flat value × count; no tiered or formula curve |
| 2 | Cross-character `ally-action` trigger NOT YET RETROFITTED onto existing blocks | ~~Qingxiao S4~~ **fixed 2026-09-02**. ~~Sigrika S4~~ **fixed 2026-09-02** (also introduced the new universal `'echo-skill-cast'` action tag in `rotationSimulator.js`, fired directly off any step's own `{type:'Echo'}` shape — using an equipped Echo isn't a per-character kit fact the way Shifting/Tune Break application is, so no per-character `appliesTags` declaration would make sense; benefits any future "ally casts Echo Skill" mechanic too, not just Sigrika). **Luuk Herssen S4 — investigated, deferred** (gap #2a, blocked on Tune Break cast tagging). **Cartethyia S4 — investigated, deferred** (gap #2b, blocked on 6 missing status tags roster-wide). **Mornye ×2 (`outro.recursion`'s marker-upgrade note, `chain.s2`'s Interfered Marker scope) — investigated, deferred**: both are upgraded by an ALLY's Tune Break hit, the exact same missing `'tune-break-cast'` prerequisite as Luuk Herssen's S4 (gap #2a) — not independently fixable, no new finding, just another consumer of the same blocker. **Galbrena (`debuff.afterflame`, `chain.s1`) — investigated, deferred** (gap #2c): both gained from ANY teammate's Echo Skill cast — same universal `'echo-skill-cast'` tag Sigrika now uses — but the real mechanic needs per-unique-Echo-NAME dedup ("capped once per Echo name") and clears on Demon Hypostasis exit, neither of which the schema's stacking effect can express without fabricating unsourced numbers; kept as the existing documented max-value passive approximation, same judgment call as Sigrika's Blessing of Runes blocks. **Gap #2 backlog is now fully investigated — 2 fixed, 4 deferred with real, specific reasons, nothing left unexamined.** | The MECHANISM exists (built this session) — Qingxiao's and Sigrika's own retrofits prove the pattern. Every remaining case got its own real kit-text check before being deferred — not a blanket skip. |
| 2b | Cartethyia S4 deferral detail | Dump/block's exact text: "After any team member inflicts Havoc Bane/Fusion Burst/Spectro Frazzle/Electro Flare/Glacio Chafe/Aero Erosion, the whole team gains +20% DMG Bonus for ALL Attributes for 20s." Confirmed via `grep -rn "appliesTags" characterBlocks/*.js` that NONE of these six statuses exist anywhere in the roster as an `appliesTags` entry yet (the only near-miss, `denia.blocks.js`'s `fusionBurst` flag, is the unrelated `debuffs.fusionBurst` legacy-table field, not an `appliesTags` tag). Retrofitting this block properly requires first auditing every character in the roster who inflicts each of the six statuses and adding real `appliesTags` entries to their own damage/debuff blocks — a roster-wide prerequisite, not a single-block fix, structurally the same class of blocker as Luuk Herssen's S4. Deferred 2026-09-02, not fixed. | — |
| 2a | Luuk Herssen S4 deferral detail | Dump's exact text: "S4: After any team member deals Tune Break DMG, the whole team deals +20% DMG for 20s (unstackable)." Needs a `'tune-break-cast'` action tag that doesn't exist anywhere in the roster yet — ties to the much larger, previously-identified "Off-Tune Level gauge" mechanic (requires knowing which of the ~9 characters who can cast Tune Break — Qingxiao, Yangyang: Xuanling, Lucilla, Sigrika, Hiyuki, Suisui, Mornye, Lynae, Aemeath — actually do so in their modeled rotations, each needing individual kit-text verification before the tag can be applied anywhere). Deferred, not fixed, same reasoning class as Cartethyia's/Phoebe's DOT deferrals — the prerequisite is bigger than this one block. **Also found, separately, not yet acted on:** Luuk Herssen's own dump (line 67) describes an "Uncaused Diagnosis" self-buff — "After any nearby teammate inflicts Shifting or deals Tune Break DMG, Luuk's ATK +25% for 20s" — with NO matching block anywhere in `luukherssen.blocks.js` (confirmed via grep). This is a second, previously-unflagged real gap (missing block entirely, not a wrong existing one), same `'tune-break-cast'` prerequisite plus the already-existing `'shifting'` tag for its other half. Logged here 2026-09-02 for future work. | — |
| 3 | Per-move-type-scoped stat (not a whole damage category) | Aemeath (Finale-specific deepen, Heavy-ATK-only Crit DMG), Iuno (Absolute-Fullness-specific bonuses) | Stats route to a whole category (basicDmg/heavyDmg/etc.), not one specific move within a category |
| 4 | Resource-cap-increase field (raises a stack cap, not a %stat) | Qingxiao S1 (Mindlock cap 15→25), Chisa (Negative Status/Electro Rage cap +3) | **Reclassified 2026-09-02, not fixed as a simple field.** Investigated: Chisa's case is a genuine zero-DPS scope boundary (grants an ALLY +3 max stacks, no DPS component at all — already correctly has no block, same "no basis" pattern already established for Mornye S1/S3/S4). Qingxiao's case is real but NOT independently fixable as a flat cap field: `qingxiao.selfbuff` already models Mindlock as a flat pre-computed value AT the 15-stack ceiling (~49%, gap #1's nonlinear-curve problem — 7%×7 first stacks + 2%×rest — approximated as one flat number, not a real per-stack counter), so raising the cap to 25 needs gap #1's real stacking-curve field solved FIRST, then real evidence the modeled rotation actually reaches 25 stacks (not sourced). Moved to the "complex calc shapes" tier of the priority order, tied to gap #1, not the simple-fields tier. |
| 5 | Frequency/tick-rate stat (changes DOT interval, not a flat %) | Denia S4 (Erosion Field 4s→3s tick rate) | **Reclassified 2026-09-02, not fixed as a simple field.** Investigated: Denia's own Erosion Field block (`denia.liberation.erosion-field`) is ALREADY modeled as "one representative tick, not the full sustained-duration mechanic" per its own note — a frequency-scaling stat has nothing real to scale until Erosion Field is a genuine repeating-tick block, which is gap #9's territory (sustained/continuous channel, deliberately LAST in the priority order — the most structurally novel simulation mechanic). Adding a bare `frequency` stat now would have no consumer and risk a false sense of completeness. Moved to the "structurally novel, last" tier, tied to gap #9, not the simple-fields tier. |
| 6 | Percent-of-another-block's-damage | Brant (secondary blast = 30% of a DIFFERENT hit's own damage) | Damage hits scale off ATK/HP/DEF only, never off another block's resolved output |
| 7 | Per-resource-unit-consumed scalar | Denia (+150%/Dark Core consumed), Chisa (+2.59%/Ring of Chainsaw stack, up to 100) | No stacking-scalar field tied to a spent-at-cast-time resource count |
| 8 | Flat (non-%) damage component alongside %ATK | Buling ("169 flat + 18.30% ATK") | **Fixed 2026-09-02.** Added optional `hit.flat` field (`triggerBlocks.schema.js`), read by both `resolveHitComposedDps.js` and `resolveHitComposedTeamDps.js` as `(effBase*(atkPct/100) + flat) * avgCrit * dmgBonus * defMult * resMult * ...` (added to the base-damage term before the multiplier chain, matching WuWa's own formula — not a separate standalone hit). `parseSkillMultiplierHits()` gained an optional 2nd `flat` argument, attached to the first parsed hit only. Applied to `buling.heavy.twin-thunders` (was previously dropping the flat 169 entirely, only modeling the 18.30% ATK portion). 4 new tests, full suite green (1259/1259), no parity regression on Buling's Stage 1 harness check. |
| 9 | Sustained/continuous channel or repeated-tick-from-one-cast | Baizhi (Remnant Entities auto-attack every 2.5s; a 48.86%/s continuous channel) | A block is a discrete hit-list, not a sustained/repeating effect |
| 10 | Early-forfeit/consumption trigger (duration cut short by a specific event) | Carlotta, Changli, Yinlin (buff ends early if the recipient swaps out before its full duration) | **Investigated 2026-09-02, not fixed — real infrastructure gap, correctly scoped as non-trivial.** `blockWindows.js`'s `buildBlockWindows()` only receives the block's OWNER's own step results (`ownResults`, see its own jsdoc) — for a `target.scope:'next-on-field'` buff, "forfeit early if the RECIPIENT swaps out" needs that recipient's OWN swap-out time, a different character's step data this function has no access to at all today. A real fix needs a new optional param (the recipient's own swap-out instants) threaded through `blockWindows.js` AND both `resolveSimulatedTeamRotation.js`/`resolveHitComposedTeamDps.js`'s own call sites (the only two places that actually know both the source's and the recipient's step timelines at once) — a genuine multi-file structural change, not a `timing` field addition. Deferred to a dedicated pass, not attempted as a quick fix. |
| 11 | Buff-of-a-buff / multiplier-of-a-multiplier | Youhu (a buff that DOUBLES another already-active effect) | `effects[].value` is always additive to a base stat, never multiplicative on another buff |
| 12 | Defensive/reactive "on being hit" trigger | Danjin (loses a stack per hit SHE takes) | **Investigated 2026-09-02, not fixed — needs unsourced data, not just a trigger type.** Even if a `'on-hit-taken'` trigger type were added, it needs an enemy-attack timeline (when the character gets hit, how often) — nothing in the engine or the character data sources this at all (real fights have variable, per-encounter enemy attack patterns, not a fixed script like a Resonator's own combo). Adding the trigger type alone would have no real data to drive it. Deferred — same class of blocker as the DOT deferrals (Cartethyia's Erosion, Phoebe's Frazzle): the mechanism would be easy, the DATA isn't there. |
| 13 | HP-threshold condition | Danjin S5 (+15% more when HP<60%) | **Investigated 2026-09-02, not fixed — needs a whole new simulation dimension, not a condition field.** Confirmed via `grep -rn "hpPct\|currentHp"` across `engine/*.js`: the engine has NO live-HP tracking anywhere, solo or team — every resolver works off buffs/debuffs and static base stats, never a character's own HP changing over time from damage taken/healing received. A real HP-threshold condition needs that whole simulation layer built first (which itself needs sourced damage-taken/healing-received data per fight, not just a formula). Reclassified out of the "new condition/trigger types" tier into "structurally novel, last" alongside gaps #9/#14/#15 — this is bigger than a condition field. |
| 14 | Off-field summon-chain/repeating proc | Cantarella (Diffusion: up to 21 Coordinated ATK summons over 30s) | Different shape than the existing `windowed-proc` (self-cast-triggered, capped) — this is team-hit-triggered |
| 15 | Stateful re-cast/extra-move-loop unlock | Roccia (Reality Recreation — a re-triggering follow-up loop) | No "this cast unlocks a repeatable extra action" primitive |
| 16 | Dedicated damage-type category missing | Xiangli Yao ("Outro DMG" — no such stat exists separate from libDmg/etc.) | **Fixed 2026-09-02.** Added a 7th `outroDmg` category alongside the existing 6: `createStats()`/`applyBuff()` (`calcEngine.js`) and both resolvers' `EXTERNAL_STAT_KEYS` now recognize it. `xianglyao.outro.chain-rule` tagged `category:'outroDmg'`; new `xianglyao.chain.s5-outro` block captures the previously-unrepresented +222% Outro Chain Rule DMG Multiplier (was entirely missing before, not just mis-categorized — the audit's own TODO had left it out). 3 new tests, full suite green (1262/1262). |
| 17 | Per-hit basis split within one block | Cartethyia (some hits in the same real mechanic scale off a DIFFERENT basis than others) | **Investigated 2026-09-02 — likely NOT a real gap, downgraded.** Checked the actual source row (`characters.js` SKILL_MULTIPLIERS['Cartethyia'], Heavy ATK Fleurdelys Enhanced: `'7.78%×2 + 3.89%HP'`). Cartethyia's own block-file header already confirms her ENTIRE kit scales off Max HP, not ATK, confirmed via her own base-stat sheet — so the inconsistent `%HP` suffix on only the second term reads as a source-formatting quirk (some SKILL_MULTIPLIERS rows label the basis explicitly, most don't), not a genuine per-hit mixed-basis mechanic. No other roster character has a documented real mixed-basis-within-one-move case either. `cartethyia.heavy.fleurdelys-enhanced` is already coded `basis:'HP'` for the whole block, which is very likely already correct — no code change made, no per-hit `basis` field added on unconfirmed grounds. Left as a documented approximation with reduced confidence noted, not escalated to a schema addition without real evidence of the gap. |

**Legitimate scope boundaries — NOT schema gaps, deliberately never modeled (this is a DPS calculator,
not a full combat simulator) — listed so they're never mistaken for a TODO:** heal amounts (Baizhi,
Shorekeeper, Chisa, Buling, Mornye), shield values (Augusta, Chisa, Aemeath S5), interruption immunity /
cooldown resets / non-DPS resource grants (Camellya, Iuno), survivability/revive mechanics (Aemeath S5,
Augusta). These stay exactly as documented in each file — "no DPS component, not modeled" is the
correct, final answer for these, not a gap awaiting a primitive.

**Decision on what to build now vs defer**: gap #2 (the `ally-action` retrofit backlog) is the highest-
value, lowest-risk one to close first — the mechanism already exists and is tested, this is purely
applying it to ~7 already-identified blocks, each independently verifiable against its own character's
real kit text (same rigor as Qingxiao's own appliesTags work). Gaps #1/#3/#4/#5/#7/#8/#9/#17 each need a
real schema design decision (a new field shape) before touching any character — those are the next
Phase 0.5 sub-step, not started yet. Gaps #6/#10/#11/#12/#13/#14/#15/#16 are each currently single-
character-scoped (only one roster member needs them so far) — lower priority than the multi-character
gaps, deferred until either a second character needs the same shape (confirming it's a real pattern, not
a one-off) or they're reached in the per-character Phase A pass.

### Phase A tracker — solo, per-character, all 8 dimensions

One row per character (58 total, Jingran excluded — unreleased). `Audited` = actually re-read block by
block against all 8 dimensions this pass, not assumed correct because it was touched for a different
reason earlier in the session. Default status for every character not yet listed: **not started**.

| Character | Status | Findings |
|---|---|---|
| Aemeath | **Audited 2026-09-02** | Clean — every damage block's category justified (present or deliberately absent with a reason), all 4 real Fusion-Burst-applying moves tagged, mode-symmetric self-buffs correctly unconditional, Sync Strike consistently unmodeled (matches her own un-modeled CHARACTER_ROTATIONS — not a gap). No fixes needed. |
| Denia | **Audited 2026-09-02** | Clean — same standard. Stage-1-only block correctly NOT tagged as a Fusion Burst applier (only Stage 3/4 do per kit text); Final Act: Breakdown Form correctly left untagged (no kit-text confirmation it applies Fusion Burst, not assumed). No fixes needed. |
| Lynae | **Audited 2026-09-02** | **1 real fix**: her file's own header comment (written before the `confirmedWinningStance` marker block existed) still said "neither appliesTags stance-gated tag fires yet" — stale; the marker block, added later in the same file, already resolves this (verified: `winningStanceForOwner` returns `'Tune Rupture mode'`, not `null`, per her own passing test). Comment corrected to match reality. Everything else clean — no `dotApplier` needed (she doesn't apply Frazzle/Erosion/Fusion Burst/Electro Flare, only Tune Rupture/Strain-Shifting, a separate un-migrated Tune Break mechanic), categories all justified. |
| Qingxiao | **Audited 2026-09-02, chain.s4 retrofitted** | Every damage block correctly `appliesTags:['shifting']` per the user-confirmed broad reading of "skills". `chain.s4` FIXED (Phase 0.5 gap #2): the dump's own exact text — "After any teammate inflicts Shifting, THEIR ATK +20% for 8s" — confirms the recipient is whoever inflicts Shifting (not always Qingxiao), a real `ally-action`/`trigger-actor`/8s-window mechanic, not the unconditional permanent self-buff it was modeled as. 3 new tests. |
| *(remaining 54 characters)* | Not started | — |

**Realistic pacing note**: a genuine 8-dimension audit takes real reading time per character (both
already-audited ones here had ~15-17 blocks each, cross-checked individually). At this rate, the full
roster is a multi-session undertaking, consistent with the user's own "even a year" framing — this
tracker is the mechanism for resuming correctly across sessions without re-deriving what's already been
verified, and for making visible, at a glance, exactly how much of the roster is actually done versus
assumed.

---

## 0. Why two engines exist today (as-found, verified by reading code, not assumed)

**System A — Legacy** (`characters.js`'s `CHAR_BUFF_TABLE`/`RESONANCE_CHAIN_DATA`/`SKILL_MULTIPLIERS`/
`CHARACTER_ROTATIONS` read by `calcTeamStats.js` + `calcEngine.js`'s per-character functions). Predates
the TriggerBlock engine. Flat per-character tables: `outroBuffs`/`libBuffs`/`selfBuffs`/`debuffs`
arrays with a free-text `condition` field that is **only partially enforced** (element name and a
narrow `MECHANIC_DAMAGE_APPLIERS` check — confirmed via `universalStatApplies()`, `calcEngine.js:731`;
"mode" text and most other conditions are NOT checked, historically a source of double-counting bugs
this session fixed several of), plus five hand-written DOT-reaction functions
(`calcFrazzleDmg`/`calcErosionDmg`/`calcFusionBurstDmg`/`calcElectroFlareDmg`/`calcTuneBreakDmg`).

**System B — TriggerBlock engine** (`engine/characterBlocks/*.js` + `rotationSimulator.js` +
`resolveHitComposedTeamDps.js`/`resolveSimulatedTeamRotation.js` + `sequenceGating.js` +
`triggerEngine.js`). Built across PHASE1/2/3_PLAN.md (2026, deleted once complete per user's own prior
instruction — their content lives on in file header comments throughout `engine/`). Typed blocks
(`kind`/`trigger`/`condition`/`timing`/`target`/`effects`/`damage`), a real per-step rotation simulator,
real trigger-firing/condition/sequence gating. **This is authoritative for per-hit damage and buffs for
any "fully converted" team** (`calcTeamStats.js`'s own `allMembersConverted` gate,
`calcTeamStats.js:167`) — confirmed this session (Denia/Aemeath whole-team buff investigation) that
System A's equivalent code path is genuinely dead once every team member has a TriggerBlocks file.

**The actual entanglement** (why "deux engine" is real, not just historical residue): DOT reactions
(Frazzle/Erosion/Fusion Burst/Electro Flare/Tune Break) were a **deliberate, documented decision NOT to
port** — `dotReactions.js`'s own header: "these are ICD-aware, hand-verified-against-the-wiki mechanics
that already live correctly in calcEngine.js... porting their stack/tick math into TriggerBlocks would
mean re-deriving already-correct formulas from scratch for no benefit." This session's mandate
overrides that decision — the DOT layer is the concrete piece that has to actually move for there to be
one engine, and it's exactly the layer this session's own bug-hunting (Lynae/Aemeath/Denia/Rebecca) has
been fighting friction with (mode-exclusivity having to be bolted on across TWO separate reaction
functions, a combinatorial resolver needed only because of the split).

**Also entangled, lower stakes, found during this audit**: `outroBuffs`/`libBuffs`/`selfBuffs`/
`debuffs`'s `condition` text is genuinely dead for a converted team (System A's buff-application loop
never runs), but the SAME System A tables still feed: the synergy-score computation, the
rotation-timeline display heuristic, and (as established above) the whole DOT-reaction layer. So
`characters.js`'s flat tables can't simply be deleted even once the merge is done — parts of them
(`tuneBreak`, the DOT-relevant `debuffs` entries) need to become real TriggerBlocks; other parts
(display/scoring-only fields) are a separate, smaller cleanup this plan will scope once the DOT
migration is done and the actual remaining footprint is visible.

---

## 1. Inventory (Phase 0 — DONE 2026-09-02, script-verified, not from memory)

- **58 released characters total.** `Jingran` (unreleased) is the only one NOT fully converted (no
  TriggerBlocks file, no `CHARACTER_ROTATIONS` entry) — out of scope until released.
- **Every released character has a `CHAR_BUFF_TABLE` entry.**
- **12 characters are DOT-reaction-flagged** (own a `debuffs` entry for frazzle/erosion/fusionBurst, an
  `electroFlare` field, or a `tuneBreak` object) — these are the ones whose damage this merge actually
  has to move, in order, without changing their computed numbers unexpectedly:

  | # | Character | DOT mechanic(s) flagged | This session's status |
  |---|---|---|---|
  | 1 | Aemeath | tuneBreak (ruptureDmgMult, modeExclusive, competesWithFusionBurstReaction) | Mode-exclusivity fixed; tuneBreak itself still legacy-only |
  | 2 | Buling | `electroFlare: true` (no `debuffs` entry — Electro Flare application confirmed via this flag alone) | Untouched this session |
  | 3 | Cartethyia | `debuffs.erosion` (6 stacks w/ Rover, HP-scaling) + two `elemDmg` debuffs (Wind's Indelible Imprint scaling amp, Sig weapon amp) — the `elemDmg` entries are ordinary legacy debuffs, NOT DOT-reaction inputs; only `erosion` is in scope for this merge | Untouched this session |
  | 4 | Ciaccona | `debuffs.erosion` (3 stacks, ticks every 2s) | Untouched this session |
  | 5 | Denia | tuneBreak (strainDmgPerStack, modeExclusive, competesWithFusionBurstReaction) | Mode-exclusivity fixed; tuneBreak itself still legacy-only |
  | 6 | Lucy | tuneBreak (baseTuneBreakBoost only) | Untouched this session |
  | 7 | Luuk Herssen | tuneBreak (strainDmgPerStack, maxStrainStacks) | Untouched this session |
  | 8 | Lynae | tuneBreak (ruptureDmgMult, strainDmgPerStack, modeExclusive) | Mode-exclusivity + appliesTags fixed; tuneBreak itself still legacy-only |
  | 9 | Mornye | tuneBreak (ruptureDmgMult, strainDmgPerStack, interferedDmgAmp) — generic responder, not mode-locked | Verified correct-as-is (not exclusive by design) |
  | 10 | Phoebe | `debuffs.frazzle` (18 stacks/rotation, "in Confession mode" — her real mode is Absolution, so per item 9/11's own Phoebe finding this Frazzle application is likely ALSO supposed to be inactive; needs the same real-mode check before migrating, not a blind port) | Untouched this session |
  | 11 | Rebecca | tuneBreak (baseTuneBreakBoost only — no rupture/strain of her own) | Huntress/Guts self-buff bug fixed (unrelated to her tuneBreak) |
  | 12 | Rover: Spectro | `debuffs.frazzle` (Forte Resonating Spin→Echoes 2 stacks +Shimmer; Liberation Echoing Orchestra 6 stacks; Shimmer prevents decay for 9s) | Untouched this session |

  Confirmed via a script pass (2026-09-02) — every flagged stat above is real and sourced from the
  existing `condition` text already in `characters.js`, not re-derived from memory.

- **Every other character** (46 of 58) has no DOT-reaction footprint at all — their System A tables are
  ENTIRELY dead for a converted team already (buff-application loop only), except whatever
  display/scoring-only usage Phase 3 below maps out.

---

## 2. Target architecture

One engine: the TriggerBlock system. Concretely:

1. Every DOT reaction becomes real `kind:'damage'` (or `kind:'buff'` for a %-deepen-shaped effect, e.g.
   Mornye's `interferedDmgAmp`) TriggerBlocks, sourced from the SAME verified formulas
   `calcFrazzleDmg`/`calcErosionDmg`/`calcFusionBurstDmg`/`calcElectroFlareDmg`/`calcTuneBreakDmg`
   already encode (`dotReactions.js`'s own header is right that these formulas are correct — the merge
   ports the FORMULA's real behavior into a block-shaped representation, it does not re-derive numbers
   from scratch or re-guess anything already sourced).
2. `resolveHitComposedTeamDps`/`resolveSimulatedTeamRotation` become the ONLY place damage is computed
   for a real team — `calcEngine.js`'s five DOT functions and `dotReactions.js` are deleted once every
   consumer is ported, not kept as a parallel path.
3. `calcTeamStats.js`'s `allMembersConverted` branch and its `!allMembersConverted` legacy fallback
   collapse into ONE path (the fallback was already only for the hypothetical mixed-team case, which
   only `Jingran` — unreleased — currently triggers).
4. `CHAR_BUFF_TABLE`'s `outroBuffs`/`libBuffs`/`selfBuffs`/`debuffs`/`tuneBreak` arrays are retired once
   nothing reads them for real damage — what's LEFT after that (if anything still legitimately needs a
   flat per-character table — e.g. `dmgFocus`, `tier`, base stats, which are NOT part of this merge)
   stays exactly where it is.
5. The combinatorial mode-resolver built this session (`calcTeamStats.js`'s Fusion/Rupture/Strain
   enumeration) moves to operate purely over TriggerBlocks (real magnitude comparison via
   `winningStanceForOwner`-family logic, not the current `tuneBreakExclusiveCandidates` shape that only
   exists because of the System A/B split) — this SIMPLIFIES once there's one data source, not adds
   more machinery.

---

## 3. Phases

**Phase 0 — Inventory.** DONE (section 1 above). Re-run the DOT-flag script for the 5 unconfirmed
characters before Phase 2 starts on them.

**Phase 1 — Per-mechanic formula extraction.** For each of the five DOT functions, write down (in this
document, one subsection each, before touching any character file) the exact formula, its real
constants (`DOT_LEVEL_MULT`, `DOT_BASE_FACTOR`, per-mechanic stack tables), and what a faithful
TriggerBlock representation of it looks like (a `kind:'damage'` block's `damage.hits`, or a `kind:'buff'`
block's `effects`, whichever the mechanic actually is) — a design decision made ONCE per mechanic, then
applied consistently to every character who has it, not re-decided per character.

**Phase 2 — Per-character migration**, one at a time, following the DOT-flagged list in section 1,
ordered simplest-mechanic-first (single-mechanic characters before Aemeath/Denia/Lynae's already-fixed
mode-exclusive cases, so the simple cases validate the block SHAPE before the exclusivity logic is
layered back on top). For each: real damage-block(s) added to that character's `characterBlocks/*.js`
file, a parity test proving the new block-computed number matches (within rounding) the OLD
`calcEngine.js` function's own output for that same character/context, full suite green, commit.

**Phase 3 — Retire the legacy path.** Once every DOT-flagged character is migrated: delete
`calcEngine.js`'s five DOT functions + `dotReactions.js`, collapse `calcTeamStats.js`'s
`allMembersConverted` branch, audit what's left of `outroBuffs`/`libBuffs`/`selfBuffs`/`debuffs`/
`tuneBreak` for any REMAINING real consumer (synergy score, rotation timeline) and either port that
consumer too or make an explicit, documented call that it's display-only and can keep reading the flat
table (not every remaining read is a "second engine" — a cosmetic synergy-score heuristic reading
`characters.js` directly is not the same problem as two engines independently computing DPS).

**Phase 4 — Full-roster regression sweep.** Every one of the 58 characters gets its own before/after
DPS comparison (solo and in at least one real team context), not just the DOT-flagged 12 — the merge
touches shared files (`calcTeamStats.js`, `calcEngine.js`) that every character's number flows through.

---

## Phase 1 — formula extraction (DONE 2026-09-02, verbatim from `calcEngine.js`, not re-derived)

Shared constants (`calcEngine.js:16-43`): `DOT_LEVEL_MULT = 3674`, `DOT_BASE_FACTOR = 1.25078` (used by
every mechanic below).

### 1.1 Frazzle (`calcFrazzleDmg`)
- Constants: `FRAZZLE_TICK_INTERVAL = 3`, `FRAZZLE_ICD_PER_SOURCE = 2.5`,
  `FRAZZLE_STACK_TABLE = [0, 0.240, 0.4355, 0.6298, 0.8251, 1.020, 1.216, 1.409, 1.605, 1.800, 1.995]`
  (index = stack count).
- `numSources` = count of team members flagged `debuffs.frazzle`; `effectiveRate = numSources / 2.5`.
- `maxStacksRaw` = sum of every flagged member's own `debuffs.frazzle.value` (their per-rotation stack
  contribution).
- `stacks = min(maxStacksRaw, floor(effectiveRate * rotTime))`; `numTicks = min(floor(rotTime/3), stacks)`.
- Sums `DOT_LEVEL_MULT * DOT_BASE_FACTOR * FRAZZLE_STACK_TABLE[s]` for `s` counting DOWN from `stacks`
  for `numTicks` ticks (a decaying-stack tick sequence, not a flat per-tick value).
- **Phoebe-specific ×2.0 multiplier** applied to the whole `total` if she's on the team (hardcoded
  `hasPhoebe` check, not itself an ICD/stack mechanic — needs its own real, sourced justification check
  before porting; likely a genuine kit effect of hers doubling Frazzle damage, to be confirmed against
  her own kit text before this becomes a TriggerBlock condition rather than a blind port).
- TriggerBlock shape: this is fundamentally a TEAM-WIDE shared DOT tied to how many appliers/how much
  stack each contributes — doesn't fit a single owner's `kind:'damage'` block cleanly. Needs either (a)
  one block per applier contributing its own share, gated by an `ally-action`-style shared tag so the
  TOTAL naturally emerges from summing real per-applier blocks (closer to how the real game staggers
  application), or (b) a dedicated aggregate resolver parallel to (not duplicating) the per-hit engine,
  the same way `resolveDotReactionDps` is today just reimplemented on top of TriggerBlock data instead
  of `CHAR_BUFF_TABLE`. Design decision NOT yet made — flag for the start of Phase 2's Frazzle-flagged
  characters (Phoebe, Rover: Spectro), don't guess ahead of that.

### 1.2 Erosion (`calcErosionDmg`)
- Constants: `EROSION_TICK_INTERVAL = 3`, `EROSION_DURATION = 15`,
  `EROSION_STACK_TABLE = [0, 0.360, 0.899, 1.799, 2.698, 3.597, 4.497]` (stacks >3 need Aero Rover Outro
  per the table's own comment — a real, sourced conditional ceiling, not yet enforced anywhere either).
- `baseStacks` = MAX (not sum) of every flagged member's own `debuffs.erosion.value`, floor 3.
- `uptime = min(1, 15/rotTime)`; `ticks = floor(15/3) = 5` (constant, not rotTime-dependent — the DURATION
  bounds the tick count, not the rotation length, then `uptime` separately scales for a short rotation).
- Sums `DOT_LEVEL_MULT * DOT_BASE_FACTOR * EROSION_STACK_TABLE[baseStacks]` for exactly 5 ticks (flat,
  no decay unlike Frazzle), then multiplies the WHOLE total by `uptime`.
- Same team-wide-aggregate shape question as Frazzle — MAX not SUM of appliers is a real, different
  interaction rule to preserve exactly, not simplify away.

### 1.3 Fusion Burst (`calcFusionBurstDmg`) — already gained `excludeNames` this session (item 9)
- Constants: `FUSION_BURST_THRESHOLD = 10`, `FUSION_TRAIL_MULT = 3.0`. Own comment: "stack-DMG table
  isn't published on the wiki... stays a rough approximation."
- `has` = boolean (ANY non-excluded flagged member) — the formula does NOT scale with applier count or
  their own `debuffs.fusionBurst.value` at all (confirmed this session while investigating Aemeath).
- `explosions = max(1, floor(rotTime / max(10, 8)))` = `floor(rotTime/10)`, minimum 1.
- `dmg = DOT_LEVEL_MULT * DOT_BASE_FACTOR * (10 * 0.5) * 3.0` (a FLAT per-explosion value, independent
  of team composition beyond the boolean gate) `* explosions`.
- Simplest of the five to port — a real "is anyone applying it" boolean gate maps naturally onto an
  `ally-action`-triggered block once a proper `'fusion-burst-status'` tag exists roster-wide (partially
  already true — Denia/Lynae/Aemeath's `appliesTags` work this session already tags some of this).

### 1.4 Electro Flare (`calcElectroFlareDmg`)
- Constants: `FLARE_TICK_INTERVAL = 4`, `FLARE_STACK_MULT = 0.12`. Own comment: stack table also
  unpublished, "stack halving on tick is confirmed by the wiki, the tick interval/mult stay
  approximations."
- `has` = boolean (`CHAR_BUFF_TABLE[name].electroFlare` truthy — a bare flag, not a value like the
  others; only Buling has this today). `ticks = min(4, floor(rotTime/4))`.
- Starts `stacks = 10` (hardcoded seed, not sourced from the applier's own kit value — worth checking
  against Buling's real kit before porting, since every OTHER mechanic here reads a real per-character
  value and this one doesn't). Each tick: `total += DOT_LEVEL_MULT * DOT_BASE_FACTOR * (stacks * 0.12)`,
  then `stacks = ceil(stacks/2)` (halving, per the wiki-confirmed mechanic).
- Single-applier mechanic today (only Buling) — simplest migration target after Fusion Burst, a
  straightforward cast/passive-triggered block on her own file, no cross-character aggregation needed.

### 1.5 Tune Break (`calcTuneBreakDmg`) — already substantially reworked this session (items 9-11)
- Constants: `TUNE_BREAK_BASE_DMG = 5000`.
- Already has: `exclusiveCandidates` extraction (`modeExclusive` members' own rupture/strain pulled out
  of the unconditional sum), `competesWithFusionBurstReaction` cross-reaction handling, and
  `calcTeamStats.js`'s own combinatorial resolver consuming its output. The REMAINING legacy-only piece
  is the base formula itself: `totalBoost` = sum of every tbMember's `baseTuneBreakBoost + boostToTeam`;
  `hasAccel = any tbMember's boostToTeam > 20`; `breaksPerRot = hasAccel ? min(2, max(1, floor(rotTime/12))) : 1`;
  base `dmg = 5000 * (1 + totalBoost*0.01) * breaksPerRot * defMult`, then each non-exclusive member's
  own `ruptureDmgMult` adds `DOT_LEVEL_MULT * DOT_BASE_FACTOR * (ruptureDmgMult/100) * breaksPerRot *
  defMult * resMult`; `deepenMult` separately folds in Mornye's `interferedDmgAmp` (ER-scaled) and the
  shared-`maxStrain`/`strainDmgPerStack` percentage, each gated by `uptimeFactor = min(1, 8*breaksPerRot/rotTime)`.
- Most complex of the five to port faithfully — genuinely team-wide (`totalBoost` sums across EVERY
  tbMember, not just the one being evaluated), and already has the most session-added special-casing.
  Do this one LAST in Phase 2, after the simpler four have proven the porting methodology.

## Phase 2 — infrastructure built + first real migration (2026-09-02)

Built `engine/dotReactionsFromBlocks.js`: real, tested (`dotReactionsFromBlocks.test.js`, 7 tests)
TriggerBlock-native resolvers for Frazzle/Erosion/Fusion Burst/Electro Flare — each proven to match its
`calcEngine.js` legacy counterpart's exact formula, including the real interaction rules (Frazzle SUMS
across applying blocks, Erosion takes the MAX, Fusion Burst/Electro Flare are pure boolean gates).
Added the `dotApplier` field to `triggerBlocks.schema.js` (a new `DotApplier` typedef) for characters to
declare their own real, sourced contribution on the block whose trigger IS the actual applying move.

**Buling migrated (Electro Flare) — the first real end-to-end character migration, proof that the
whole approach works in production, not just in isolated tests.** Her two real Electro Flare
application points (`buling.intro.summon-and-smite`, `buling.liberation.flashing-thunder-spell-harmony`
— both confirmed via her own `CHARACTER_ROTATIONS` step notes) now carry `dotApplier: {mechanic:
'electroFlare'}`. `dotReactions.js`'s `resolveDotReactionDps` gained an optional `blocksByOwner` param;
when supplied (every real `calcTeamStats.js` call now passes `engineChosenOrder.blocksByOwner`),
Electro Flare resolves from her real blocks instead of `CHAR_BUFF_TABLE.electroFlare` — legacy
`calcElectroFlareDmg()` stays only as the fallback for a caller with no blocks available (this file's
own test, proving the pre-migration behavior still works standalone). Her `CHAR_BUFF_TABLE.electroFlare
= true` flag was DELIBERATELY kept, not removed — it still has a real, separate live use
(`calcTeamStats.js`'s `dotContributors` filter, which decides who gets a share of the DOT total in the
per-member damage breakdown display) that migrating the damage FORMULA doesn't retire. Verified
end-to-end with a real `calcTeamStats(['Buling','Aemeath'],...)` call (not just unit tests):
`hasElectroFlare: true`, real `dotDps`, Buling correctly attributed her share. Full suite: 1242 tests
passing (up from 1235).

**Migration checklist** (DOT-flagged characters from Phase 0's table, in the order Phase 2 intends to
tackle them — simplest mechanic/fewest interactions first):

| Character | Mechanic | Status |
|---|---|---|
| Buling | Electro Flare | **Migrated 2026-09-02** |
| Denia | Fusion Burst | **Migrated 2026-09-02** (tuneBreak itself deferred to 1.5) |
| Aemeath | Fusion Burst | **Migrated 2026-09-02** (tuneBreak itself deferred to 1.5) |
| Ciaccona | Erosion | **Migrated 2026-09-02** |
| Cartethyia | Erosion | **Deliberately deferred** — see note above |
| Rover: Spectro | Frazzle | **Migrated 2026-09-02** |
| Phoebe | Frazzle | **Deliberately deferred** — see note below |
| Lynae, Aemeath, Denia, Mornye, Luuk Herssen, Rebecca, Lucy | Tune Break | Not started (1.5, last) |

### Frazzle migration — Rover: Spectro done, Phoebe deferred (a real, pre-existing data bug found)

Rover: Spectro's two real Frazzle-applying moves (`roverspectro.forte.resonating-whirl`: 2 stacks,
`roverspectro.liberation.echoing-orchestra`: 6 stacks) sum to his legacy pre-combined value (8) exactly
— a clean port, same shape as Ciaccona's Erosion migration.

**Phoebe deferred, and a pre-existing bug found, not introduced by this migration**: her own
`characterBlocks` file header already states her real modeled `CHARACTER_ROTATIONS` stays entirely in
Absolution mode, never Confession (her two Confession-only buff blocks are already marked
`assumedInactive: true` for exactly this reason). But her `CHAR_BUFF_TABLE.debuffs.frazzle` value (18)
is explicitly scoped "18 stacks per rotation **in Confession mode**" — meaning this value is ALREADY
inert/wrong for her real modeled scenario on the CURRENT legacy path too, today, independent of this
merge. Her kit text does confirm she applies SOME Frazzle in Absolution mode too ("Enters Absolution
mode, applies 1 Spectro Frazzle stack" per Forte cast), but no sourced aggregate total for that exists
yet in anything read so far. Migrating her now would mean either porting the wrong (Confession-mode)
number forward, unchanged, or inventing a new Absolution-mode total — both rejected. Logged here (not
silently fixed) since it's a real, separate, pre-existing correctness issue independent of the engine
merge itself: worth a dedicated audit pass sourcing her real Absolution-mode Frazzle total before either
the legacy value or a migrated block gets a real number.

2 new tests (mirroring Erosion's mixed-migration safety pair) prove Rover: Spectro's migration doesn't
drop Phoebe's (still-wrong-but-unchanged) legacy contribution. Full suite: 1249 tests passing (up from
1247).

**All four non-Tune-Break DOT mechanics now have a working TriggerBlock-native resolver, proven in
production on 5 real characters** (Buling, Denia, Aemeath, Ciaccona, Rover: Spectro). Only Tune Break
(1.5, the most complex, deliberately saved for last) remains before Phase 3 (retiring the legacy DOT
functions entirely) can start — and even Phase 3 will keep Cartethyia and Phoebe's legacy paths alive
until their own real data gaps are resolved, not silently ported.

### Erosion migration — Ciaccona done, Cartethyia deferred, and a real mixed-migration safety issue found

Ciaccona's own `debuffs.erosion.value: 3` matches her real per-move kit values exactly (2/1/2 stacks
across 3 real applying moves, all tagged) — a clean, unconditional port, same shape as Buling's Electro
Flare. Cartethyia's legacy value is `6`, with its own comment "6 stacks with Rover (3 base)" — this
isn't a literal per-move stack value at all, it's an ALREADY-CONDITIONAL number that assumes an uncounted
Rover: Aero teammate raises her effective cap (consistent with `EROSION_STACK_TABLE`'s own comment,
"stacks >3 need Aero Rover Outro" — a real, pre-existing conditional fact in the legacy data itself,
not something this migration is introducing). Porting her blindly with `value: 6` would misrepresent it
as an unconditional per-move stack; porting with her real per-move values (not yet extracted from her
kit text) would silently change her computed number without resolving whether the Rover assumption is
still valid. Deferred rather than guessed.

**Found and fixed a real mixed-migration safety gap while wiring this**: the same
`blocksByOwner ? resolveXFromBlocks(...) : calcXDmg(...)` pattern that was SAFE for Electro Flare and
Fusion Burst (every real roster applier for those two mechanics is now fully migrated) would have been
UNSAFE for Erosion — switching wholesale the moment `blocksByOwner` exists would silently make
Cartethyia's real, still-legacy-only contribution invisible on any team with her AND a migrated
character (Ciaccona) both present, since the blocks-only resolver only reads `dotApplier`-tagged blocks
and has no way to know about her. Fixed by checking, at the point of computing `erosion`, whether EVERY
erosion-flagged member actually present in THIS team has a `dotApplier`-tagged block — only then
prefer the blocks path; otherwise fall back to the full legacy calculation for the whole mechanic. This
same check needs to be applied when Frazzle is migrated too (Phoebe/Rover: Spectro, both still legacy
today — a team with one migrated and one not-yet-migrated Frazzle applier would hit the identical gap).
2 new tests prove this exact scenario doesn't drop Cartethyia. Full suite: 1247 tests passing (up from
1245).

### Denia/Aemeath Fusion Burst migration — the mode-conditional case, solved properly

Unlike Buling's unconditional applier, Denia's/Aemeath's real Fusion Burst application is
mode-conditional (`dotApplier.requiresStance: 'Fusion Burst mode'`, new field, same shape as
`appliesTags`'s own `{tag, requiresStance}`). This surfaced a real architectural tension worth
recording: `collectAppliers()`'s default resolution (`winningStanceForOwner()`) answers "what does this
owner's OWN blocks naturally resolve to", but `calcTeamStats.js`'s combinatorial mode resolver needs to
TEST hypotheses ("what if Denia picked Strain") — reusing the single fixed natural answer inside a
search meant to explore alternatives would collapse every hypothesis to the same result. Solved with a
`stanceOverrides` param (keyed by owner name) that takes priority over `winningStanceForOwner()` when
supplied — the combinatorial resolver passes an explicit override per candidate per combo; every other
caller (the live rotation simulator, `appliesTags` gating, etc.) omits it and gets the natural
resolution. `recomputeFusionBurstDmg()` (`dotReactions.js`) threads `blocksByOwner`/`stanceOverrides`
through; `calcTeamStats.js`'s resolver now ALWAYS computes an explicit hypothesis per combo (previously
it shortcut to reusing the baseline when nothing was excluded — removed, since that baseline reflected
the natural resolution, not necessarily the combo being tested).

Verified end-to-end: `calcTeamStats(['Aemeath','Denia','Lynae'],...)` produces byte-identical numbers
to the pre-migration run (244,892 / 107,156 / 188,670 / teamDps 17,443) — the migration is provably
transparent, not just "still passes the existing tests." 3 new dedicated tests
(`dotReactionsFromBlocks.test.js`) prove `stanceOverrides` on Denia's real blocks: natural resolution
(Fusion Burst, matches her outro rivalry), forced-out override, forced-in override matching natural
exactly. Full suite: 1245 tests passing (up from 1242).

## Status

**Current phase: mixed — Phase 2 (DOT migration) substantially done for 4 of 5 mechanics (Electro Flare/
Buling, Fusion Burst/Denia+Aemeath, Erosion/Ciaccona, Frazzle/Rover: Spectro all migrated and verified;
Tune Break deliberately last, untouched); Phase A (per-character 8-dimension solo audit) at 4/58
characters (Aemeath, Denia, Lynae, Qingxiao); Phase 0.5 gap #2 (ally-action retrofit backlog) is now **fully investigated and closed out**: Qingxiao S4
and Sigrika S4 fixed and tested 2026-09-02 (the latter also added a new universal `'echo-skill-cast'`
action tag, reusable for any future "ally casts Echo Skill" mechanic); Luuk Herssen S4, Cartethyia S4,
Mornye ×2, and Galbrena's Afterflame blocks all investigated with real kit-text checks and deferred with
specific, documented reasons (2 blocked on a missing `'tune-break-cast'` tag prerequisite spanning ~9
characters, 1 blocked on 6 missing status tags roster-wide, 1 blocked on unsourced per-Echo-name-dedup/
mode-clearing behavior the schema can't express without fabricating numbers). Nothing in the backlog was
skipped without a real reason. Gaps #1, #3–#17 have had no schema design work yet. Full suite green:
1255 passing (115 files).

Gap category (2) — simple additive schema fields — is now also fully investigated and closed out:
**#8 (flat damage component) fixed** — new `hit.flat` field, applied to Buling's Twin Thunders.
**#16 (missing damage category) fixed** — new `outroDmg` category, applied to Xiangli Yao's S5/outro
(previously entirely unrepresented, not just mis-categorized). **#4 (resource-cap-increase) and #5
(frequency/tick-rate) reclassified, not fixed as simple fields** — both turned out entangled with
still-unbuilt infrastructure (gap #1's nonlinear stacking curve for #4/Qingxiao, gap #9's sustained-tick
simulation for #5/Denia — Chisa's #4 case is a genuine zero-DPS scope boundary, no fix needed). **#17
(per-hit basis split) investigated and downgraded** — checked Cartethyia's actual source row, her kit's
own "entirely HP-scaling" confirmation makes this very likely a source-formatting quirk, not a real
mixed-basis mechanic; no schema change made on unconfirmed grounds. Full suite green: 1262 passing
(117 files).

Gap category (3) — new condition/trigger types — is now also fully investigated: all three candidates
(#13 HP-threshold, #10 early-forfeit-on-swap, #12 on-being-hit) turned out to need real infrastructure
this session hasn't built (a live-HP simulation layer, cross-character step access inside
`blockWindows.js`, and an enemy-attack timeline respectively) rather than a quick field/trigger-type
addition — none forced through as a shallow fix. #13 reclassified into the "structurally novel, last"
tier; #10 deferred to a dedicated multi-file pass; #12 deferred pending sourced data, same class as the
DOT deferrals.

Remaining gap categories per the priority order: (4) complex calc shapes (#1 nonlinear stacking curve —
now also the blocker for #4/Qingxiao, #3 per-move-scoped stat, #6 %-of-another-block's-damage, #7
per-resource-consumed scalar, #11 buff-of-a-buff); (5) structurally novel simulation mechanics, last (#9
sustained channel — now also the blocker for #5/Denia, #13 HP-threshold, #14 off-field summon-chain, #15
stateful re-cast loop). Every one of the 17 originally-inventoried gaps has now had at least one real
investigation pass; none remain purely theoretical.

## Constraints (repeated here, not just in the mandate, so they're never missed mid-phase)

- Never edit `CharacterDetailModal` or its data.
- Never edit anything under `Characters data dump/`.
- Every phase: full test suite green before commit, every commit pushed, every real finding logged here
  (architecture-scale) or in `Engine development.md` (individual character data facts unrelated to the
  merge itself).
