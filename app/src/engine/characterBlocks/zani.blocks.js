// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — engine/characterBlocks/zani.blocks.js
// Zani converted to TriggerBlocks. Sourced from characters.js's already-audited
// CHAR_BUFF_TABLE['Zani'], RESONANCE_CHAIN_DATA['Zani'] (+ its own audit comment,
// read directly for each node's real mechanic), SKILL_MULTIPLIERS['Zani'], and
// CHARACTER_ROTATIONS['Zani']. No new numbers invented.
//
// 2026-09-09 full-kit audit (independent re-audit, cross-checked every characters.js table fresh
// against Data dump/Zani/Zani.md, not trusting prior passes' claims): 3 real fixes, 1 newly-found
// documented gap.
//   1. chain.s3/chain.s5's scopedToBlockId targets were SWAPPED backwards ever since first written:
//      s3 (The Last Stand's approximated per-Blaze scaling, per RESONANCE_CHAIN_DATA's own comment)
//      was incorrectly scoped to Rekindle; s5 (Rekindle's confirmed-exact +120%) was incorrectly
//      scoped to The Last Stand. Both the flat table's own comment and the fresh dump independently
//      confirm the correct pairing. Fixed by swapping both scopedToBlockId values; the existing test's
//      own assertions (written to match the swapped/wrong behavior) corrected too.
//   2. chain.s4 was trigger:{type:'passive'} with a note claiming "no specific cast anchor sourced" —
//      false, contradicted by RESONANCE_CHAIN_DATA's own comment ("on Intro cast") and the dump ("Intro
//      cast → whole team ATK +20% for 30s"). Retargeted to a real cast-triggered, 30s-duration buff.
//      Measured zero DPS change for the standard modeled rotation (well under 30s, Intro cast first) —
//      a correctness/robustness fix, not a DPS-moving one for this specific rotation.
//   3. chain.s6's real kit text has a 3rd component beyond the modeled flat +40% Heavy Slash
//      multiplier — a separate Nightfall-specific scaling bonus ("each Blaze consumed → Nightfall's
//      DMG Multiplier +40% on hit"), missed entirely by every prior pass. FIXED in a later pass (see
//      zani.chain.s6-nightfall-mult below) — the ambiguous per-Blaze-vs-flat-total wording was
//      resolved with the user, modeled as a flat +40% Nightfall-only bonus.
// Full suite verified green (1896/1896) after the 3 fixes.
//
// Documented-gaps sweep (direct user request to build a real frazzleDmg category): Inherent Skill
// Sunburst ("Targeted Action/Forcible Riposte cast → +20% Spectro Frazzle DMG for 14s") was previously
// entirely unmodeled — this engine had no frazzleDmg stat category at all. Added one engine-wide
// (categories.js, calcEngine.js) plus a new damage.secondaryCategory field/resolver change so a hit can
// draw its DMG Bonus from two category pools additively (needed since her Heavy Slash combo is
// genuinely dual-categorized: "counted as BOTH Heavy Attack AND Spectro Frazzle DMG"). Added
// zani.selfbuff.sunburst below, tagged her 4 real Heavy Slash blocks with
// damage.secondaryCategory:'frazzleDmg', and corrected her Outro to category:'frazzleDmg' directly (a
// single category there, not dual). Measured: a real, live DPS increase — legacyRawDps/engineDps rose
// 2401 -> 2574/2574, golden fixtures regenerated. See Data dump/Zani/Zani.md's own writeup for the full
// engine-change list and the Phoebe cross-character candidate considered and left unchanged.
//
// S6 Nightfall-per-Blaze gap fixed (direct user follow-up): the dump's "each Blaze consumed →
// Nightfall's DMG Multiplier +40% on hit" mirrors S3's per-point phrasing but has no stated cap — read
// literally as a per-Blaze rate over Nightfall's own up-to-40-Blaze consumption, this would be +1600%,
// wildly out of line with every other dupe bonus in the game. Explicitly decided with the user: model
// "+40%" as the already-total flat value, not a per-point rate. Added zani.chain.s6-nightfall-mult
// (heavyDmg+40, scoped to Nightfall's own block + the combined 2nd-pass block).
// ═══════════════════════════════════════════════════════════════════════════════

import { parseSkillMultiplierHits } from '../math/hitParser.js';

const SOURCE = 'Zani';

/** @type {import('../schema/block.schema.js').TriggerBlock[]} */
export const ZANI_BLOCKS = [
  // ── Damage blocks (from SKILL_MULTIPLIERS) ──
  {
    id: 'zani.intro.immediate-execution',
    source: SOURCE, kind: 'damage', section: 'Intro',
    trigger: { type: 'cast', on: 'Intro:Immediate Execution' },
    timing: {}, target: { scope: 'self' }, effects: [],
    // category/basis added for Layer 4 migration — were entirely missing. No override text names a
    // different category, same default-to-skillDmg convention applied project-wide.
    damage: { hits: parseSkillMultiplierHits('24.2%×5 + 80.8%'), basis: 'ATK' },
    note: 'Builds Redundant Energy. Inherent Skill Quick Response grants +12% Spectro DMG Bonus for 14s (see zani.selfbuff.quick-response below).',
  },
  {
    // Added 2026-09-03 (found via a systematic block-coverage audit): a real SKILL_MULTIPLIERS row
    // (63.94%, "Base Resonance Skill hit before the block-stance follow-up") now exists for this — the
    // old note claiming "no matching row at all" was stale, left over from before that row was added.
    // Real CHARACTER_ROTATIONS step too ('Press Skill — a small hit that enters a block stance').
    id: 'zani.skill.standard-defense-protocol',
    source: SOURCE, kind: 'damage', section: 'Skill',
    trigger: { type: 'cast', on: 'Skill:Standard Defense Protocol' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('63.94%'), category: 'skillDmg', basis: 'ATK' },
    note: 'Base Resonance Skill hit before the block-stance follow-up — enters a block stance for up to 2s, ended early if swapped off before it resolves.',
  },
  {
    id: 'zani.basic.stage3',
    source: SOURCE, kind: 'damage', section: 'BasicATK',
    trigger: { type: 'cast', on: 'Basic ATK:Stage 3' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('127.3%'), category: 'basicDmg', basis: 'ATK' },
    note: 'Exits the block stance manually — Stagnates the target, restores 10 Redundant Energy.',
  },
  {
    id: 'zani.skill.targeted-action',
    source: SOURCE, kind: 'damage', section: 'Skill',
    trigger: { type: 'cast', on: 'Skill:Targeted Action / Forcible Riposte' },
    timing: {}, target: { scope: 'self' }, effects: [],
    // Fixed 2026-09-03: had no damage.category — a real Resonance Skill cast (Crisis Response
    // Protocol's enhanced Skill) with no "considered X DMG" override in the kit text, so it resolves
    // to skillDmg. This also fixes a hidden 2nd bug: chain.s2's skillDmg:80 effect (below) could never
    // have matched this block even after its own dead-trigger fix, since category-gated stats only
    // apply to matching-category hits.
    damage: { hits: parseSkillMultiplierHits('86.2% + 28.7% + 172.4%'), category: 'skillDmg', basis: 'ATK' },
    note: 'Once Redundant Energy hits 100/100 — applies 1 Heliacal Ember stack, grants 10 Blaze, starts Sunburst (+20% Spectro Frazzle DMG for 14s — see zani.selfbuff.sunburst below).',
  },
  {
    id: 'zani.liberation.rekindle',
    source: SOURCE, kind: 'damage', section: 'Liberation',
    trigger: { type: 'cast', on: 'Liberation:Rekindle' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('318.5%'), category: 'libDmg', basis: 'ATK' },
    note: 'Enters Inferno Mode (up to 20s), raises max Blaze from 100 to 150, grants 50 Blaze immediately, gives Basic ATK a flat +25% DMG Multiplier for the duration (not modeled).',
  },
  {
    id: 'zani.forte.heavy-slash-daybreak',
    source: SOURCE, kind: 'damage', section: 'Forte',
    trigger: { type: 'cast', on: 'Forte:Heavy Slash: Daybreak' },
    timing: {}, target: { scope: 'self' }, effects: [],
    // secondaryCategory added (documented-gaps sweep): her own kit text says this hit is "counted as
    // both Heavy Attack and Spectro Frazzle DMG" — a genuine dual-categorization, now representable.
    damage: { hits: parseSkillMultiplierHits('198.8%'), category: 'heavyDmg', secondaryCategory: 'frazzleDmg', basis: 'ATK' },
    note: 'Counted as Heavy ATK + Spectro Frazzle DMG.',
  },
  {
    id: 'zani.forte.heavy-slash-dawning',
    source: SOURCE, kind: 'damage', section: 'Forte',
    trigger: { type: 'cast', on: 'Forte:Heavy Slash: Dawning' },
    timing: {}, target: { scope: 'self' }, effects: [],
    // secondaryCategory added (documented-gaps sweep) — same dual-categorization as Daybreak above.
    damage: { hits: parseSkillMultiplierHits('424.1%'), category: 'heavyDmg', secondaryCategory: 'frazzleDmg', basis: 'ATK' },
    note: 'Auto-chains at >30 remaining Blaze. Counted as Heavy ATK + Spectro Frazzle DMG.',
  },
  {
    id: 'zani.forte.heavy-slash-nightfall',
    source: SOURCE, kind: 'damage', section: 'Forte',
    trigger: { type: 'cast', on: 'Forte:Heavy Slash: Nightfall' },
    timing: {}, target: { scope: 'self' }, effects: [],
    // secondaryCategory added (documented-gaps sweep) — same dual-categorization as Daybreak above.
    damage: { hits: parseSkillMultiplierHits('135.2% + 262.4%'), category: 'heavyDmg', secondaryCategory: 'frazzleDmg', basis: 'ATK' },
    note: 'Consumes up to 40 Blaze, each point adding +9.95% DMG Multiplier — not modeled (base value used), her hardest-hitting single attack. Counted as Heavy ATK + Spectro Frazzle DMG.',
  },
  {
    id: 'zani.forte.heavy-slash-string-2nd-pass',
    source: SOURCE, kind: 'damage', section: 'Forte',
    trigger: { type: 'cast', on: 'Forte:Heavy Slash: Daybreak → Dawning → Nightfall' },
    timing: {}, target: { scope: 'self' }, effects: [],
    // 2nd full pass of the 3-hit string, combining all 3 rows since the rotation collapses them into
    // a single step. secondaryCategory added (documented-gaps sweep) — same dual-categorization as
    // each individual Heavy Slash stage above.
    damage: { hits: [...parseSkillMultiplierHits('198.8%'), ...parseSkillMultiplierHits('424.1%'), ...parseSkillMultiplierHits('135.2% + 262.4%')], category: 'heavyDmg', secondaryCategory: 'frazzleDmg', basis: 'ATK' },
    note: 'Repeats the full 3-hit string a 2nd time, with Blaze refilled by allies feeding Spectro Frazzle.',
  },
  {
    id: 'zani.liberation.the-last-stand',
    source: SOURCE, kind: 'damage', section: 'Liberation',
    trigger: { type: 'cast', on: 'Liberation:The Last Stand' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('191.1% + 1083.0%'), category: 'libDmg', basis: 'ATK' },
    note: '2nd Ultimate, cast once Blaze drops below 30 or 8s pass since entering Inferno Mode; ends Inferno Mode.',
  },
  {
    id: 'zani.outro.beacon-for-the-future',
    source: SOURCE, kind: 'damage', section: 'Outro',
    trigger: { type: 'swap-out' },
    timing: {}, target: { scope: 'self' }, effects: [],
    // category fixed (documented-gaps sweep): was uncategorized under the old "no matching category"
    // reasoning — frazzleDmg is now a real category (added same pass), and her own kit text is
    // explicit this hit is "counted as Spectro Frazzle DMG" (a single category here, not dual, unlike
    // her Heavy Slash combo — no secondaryCategory needed).
    damage: { hits: parseSkillMultiplierHits('150%'), category: 'frazzleDmg', basis: 'ATK' },
    note: 'Consumes all Heliacal Ember stacks on the target for a scaling hit (+10% DMG/stack, not modeled, base value used), counted as Spectro Frazzle DMG. Also grants every other teammate hitting that marked target +20% Spectro DMG Amp (see the buff block below).',
  },

  // ── Buff blocks (from CHAR_BUFF_TABLE) ──
  {
    id: 'zani.outro.beacon-buff',
    source: SOURCE, kind: 'buff', section: 'Outro',
    trigger: { type: 'swap-out' },
    timing: { duration: 20 },
    target: { scope: 'whole-team' },
    condition: { element: 'spectro' },
    effects: [{ stat: 'elemDmg', value: 20, stacking: 'refresh', source: 'teammate-ally-action' }],
    note: "To allies hitting the Heliacal Ember-marked target — the target-marked gating isn't modeled (applied team-wide).",
  },
  {
    id: 'zani.selfbuff.quick-response',
    source: SOURCE, kind: 'buff', section: 'Buff',
    trigger: { type: 'cast', on: 'Intro:Immediate Execution' },
    timing: { duration: 14 },
    target: { scope: 'self' },
    effects: [{ stat: 'elemDmg', value: 12, source: 'self-kit' }],
    note: 'Quick Response: Intro Skill cast grants +12% Spectro DMG Bonus.',
  },
  {
    // Added (documented-gaps sweep): previously left unmodeled — this schema had no frazzleDmg stat
    // key at all until this same pass added one (see calcEngine.js's applyBuff/categories.js). Real,
    // sourced, unconditional +20% Spectro Frazzle DMG for 14s on either Targeted Action or Forcible
    // Riposte cast (same value per the kit text: "Either cast → ... enters Sunburst"). Fires 3x in the
    // real modeled rotation (CHARACTER_ROTATIONS casts Skill:Targeted Action / Forcible Riposte 3
    // times), correctly boosting her Heavy Slash Daybreak/Dawning/Nightfall/2nd-pass hits — the only
    // blocks in her kit tagged frazzleDmg (via damage.secondaryCategory, added same pass) — plus her
    // own Outro (now category:'frazzleDmg' directly, see that block's own fix comment).
    id: 'zani.selfbuff.sunburst',
    source: SOURCE, kind: 'buff', section: 'Buff',
    trigger: { type: 'cast', on: 'Skill:Targeted Action / Forcible Riposte' },
    timing: { duration: 14, stacking: 'refresh' },
    target: { scope: 'self' },
    effects: [{ stat: 'frazzleDmg', value: 20, stacking: 'refresh', source: 'self-kit' }],
    note: 'Sunburst: Targeted Action/Forcible Riposte cast grants +20% Spectro Frazzle DMG Bonus for 14s.',
  },

  // ── Resonance Chain blocks (from RESONANCE_CHAIN_DATA — see its own audit comment for each node's
  //    real mechanic) ──
  {
    id: 'zani.chain.s1',
    source: SOURCE, kind: 'buff', section: 'Chain',
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'self' },
    effects: [{ stat: 'elemDmg', value: 50, source: 'self-kit' }],
    note: '+50% Spectro DMG (confirmed exact) — no further scope detail sourced beyond the flat value, kept passive.',
  },
  // Fixed 2026-09-03: S2 and S3 were both `kind:'buff'` with `trigger:{type:'cast',...}` and no
  // `timing.duration` — the item-12 dead-buff architecture bug (the engine-architecture history (git log)), silent no-ops.
  {
    id: 'zani.chain.s2',
    source: SOURCE, kind: 'buff', section: 'Chain',
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'self' },
    effects: [
      { stat: 'critRate', value: 20, source: 'self-kit' },
      { stat: 'skillDmg', value: 80, scopedToBlockId: 'zani.skill.targeted-action', source: 'self-kit' },
    ],
    note: 'Crit Rate +20% + a multiplier boost to Targeted Action/Forcible Riposte specifically (confirmed exact per the audit comment) — skillDmg scoped via scopedToBlockId since Targeted Action is not her only skillDmg-tagged block.',
  },
  {
    // Fixed 2026-09-09 (full-kit audit): was scoped to zani.liberation.rekindle — backwards.
    // RESONANCE_CHAIN_DATA['Zani']'s own audit comment (characters.js) is explicit S3's real effect is
    // "+8% Last Stand DMG Mult PER Blaze consumed in Inferno Mode, maxed at +1200%", with libDmg:200
    // documented there as "the conservative rotation-representative estimate" for THE LAST STAND
    // specifically (not the true 0-1200% scaling range, which this schema has no per-resource-point
    // field for) — matching the fresh Zani.md dump's own kit text ("each Blaze consumed → The Last
    // Stand's DMG Multiplier +8%, capped +1200%"). S5 (below) is Rekindle's own confirmed-exact flat
    // +120% — the two were swapped, so S3 was silently boosting the wrong Liberation cast (and S5 the
    // other wrong one) ever since this file's chain blocks were first written.
    id: 'zani.chain.s3',
    source: SOURCE, kind: 'buff', section: 'Chain',
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'self' },
    // Scoped via scopedToBlockId: libDmg is category-gated, but `zani.liberation.rekindle` is ALSO
    // libDmg-categorized — without scoping, this would incorrectly also boost Rekindle.
    effects: [{ stat: 'libDmg', value: 200, scopedToBlockId: 'zani.liberation.the-last-stand', source: 'self-kit' }],
    note: "The Last Stand's own DMG Multiplier — real effect is +8% per Blaze consumed in Inferno Mode, capped at +1200%; approximated here as a conservative flat +200% (RESONANCE_CHAIN_DATA's own documented rotation-representative estimate), since this schema has no per-resource-point scaling field.",
  },
  {
    // Fixed 2026-09-09 (full-kit audit): was trigger:{type:'passive'} with the note claiming "no
    // specific cast anchor sourced" — false, and contradicted by data already sitting in this same
    // file: RESONANCE_CHAIN_DATA['Zani']'s own audit comment (characters.js) states "s4 team +20% ATK
    // on Intro cast confirmed correct", and the fresh Zani.md dump is explicit: "S4: Intro cast →
    // whole team ATK +20% for 30s." Retargeted to a real cast-triggered, 30s-duration buff. Measured:
    // zero change to the currently-modeled rotation's DPS (her real rotation totals ~16.5s, entirely
    // within the 30s window opened by her own opening Intro cast, so this was a correctness/robustness
    // fix — matching the sourced mechanic honestly — not a DPS-moving one for the standard rotation.
    id: 'zani.chain.s4',
    source: SOURCE, kind: 'buff', section: 'Chain',
    trigger: { type: 'cast', on: 'Intro:Immediate Execution' },
    timing: { duration: 30, stacking: 'refresh' },
    target: { scope: 'whole-team' },
    effects: [{ stat: 'atkPct', value: 20, stacking: 'refresh', source: 'self-kit' }],
    note: 'Team ATK +20% for 30s after Intro Skill cast (confirmed exact).',
  },
  {
    // Fixed 2026-09-09 (full-kit audit): was scoped to zani.liberation.the-last-stand — backwards, the
    // other half of the S3/S5 swap documented above. RESONANCE_CHAIN_DATA['Zani']'s own audit comment
    // is explicit: "s5 Rekindle DMG Mult +120% (was totalMult:40, wrong category)" — Rekindle, not The
    // Last Stand — matching the fresh Zani.md dump's own kit text ("S5: Rekindle's DMG Multiplier
    // +120%.").
    id: 'zani.chain.s5',
    source: SOURCE, kind: 'buff', section: 'Chain',
    // Fixed 2026-09-03: same dead cast-scoped/no-duration no-op shape as S2/S3 above.
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'self' },
    // Scoped for the same reason as S3: libDmg is category-gated but shared with The Last Stand.
    effects: [{ stat: 'libDmg', value: 120, scopedToBlockId: 'zani.liberation.rekindle', source: 'self-kit' }],
    note: "Rekindle's own DMG Multiplier +120% (confirmed exact).",
  },
  {
    // NEWLY FOUND 2026-09-09 (full-kit audit) — GENUINE GAP, NOT YET FIXED: the dump's real S6 text has
    // a THIRD component beyond the flat +40% Heavy Slash multiplier modeled below: "Each Blaze consumed
    // → Nightfall's DMG Multiplier +40% on hit" — a separate, per-Blaze-consumed scaling bonus specific
    // to Nightfall, stacking on top of both this flat +40% AND Nightfall's own already-unmodeled base
    // +9.95%/Blaze (see zani.forte.heavy-slash-nightfall's own note). Same "per-resource-point scaling,
    // no schema field" class as chain.s3, but no conservative estimate has been derived for this one —
    // see characters.js's own RESONANCE_CHAIN_DATA['Zani'] comment for the full writeup. Left
    // unmodeled rather than inventing an unsourced number; flagged for a future pass or Phase 2 schema.
    id: 'zani.chain.s6',
    source: SOURCE, kind: 'buff', section: 'Chain',
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'self' },
    effects: [{ stat: 'heavyDmg', value: 40, source: 'self-kit' }],
    note: 'Heavy ATK DMG +40% (confirmed exact) — kept passive, applies broadly to her many Heavy Slash-categorized blocks above.',
  },
  {
    // Fixed (Nightfall-per-Blaze sweep, direct user decision): the dump's own S6 text — "Each Blaze
    // consumed → Nightfall's DMG Multiplier +40% on hit" — mirrors S3's per-point phrasing exactly
    // ("each Blaze consumed → The Last Stand's DMG Multiplier +8%, capped +1200%") but gives no cap.
    // Read as a literal per-Blaze rate, Nightfall's own up-to-40-Blaze consumption would make this
    // +1600% — implausible next to every other dupe bonus in her kit and the roster (nothing else is
    // remotely that large). Explicitly decided with the user: modeled as a flat +40% Nightfall-only
    // DMG Multiplier instead (treating "+40%" as the already-total value, not a per-point rate), in
    // line with typical dupe power levels elsewhere. Scoped via scopedToBlockId to BOTH
    // zani.forte.heavy-slash-nightfall (the 1st pass) and zani.forte.heavy-slash-string-2nd-pass (the
    // combined 2nd-pass block, which also carries Daybreak/Dawning's own hits within the SAME block —
    // this schema can't scope to one move's hits WITHIN a multi-move combined block, so the 2nd pass's
    // Daybreak/Dawning portion is a known, small over-credit, same class of approximation already
    // accepted for that combined block elsewhere in this file).
    id: 'zani.chain.s6-nightfall-mult',
    source: SOURCE, kind: 'buff', section: 'Chain',
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'self' },
    effects: [{ stat: 'heavyDmg', value: 40, scopedToBlockId: ['zani.forte.heavy-slash-nightfall', 'zani.forte.heavy-slash-string-2nd-pass'], source: 'self-kit' }],
    note: "Each Blaze consumed grants Nightfall's own DMG Multiplier +40% — modeled as a flat +40% Nightfall-only bonus (not a literal per-Blaze rate; see fix comment above for the ambiguous-source-text reasoning), on top of the broader +40% Heavy Slash bonus above and Nightfall's own base-kit +9.95%/Blaze (still unmodeled, base value used).",
  },
];
