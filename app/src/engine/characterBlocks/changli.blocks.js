// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — engine/characterBlocks/changli.blocks.js
// Changli converted to TriggerBlocks. Sourced from characters.js's already-audited
// CHAR_BUFF_TABLE['Changli'], RESONANCE_CHAIN_DATA['Changli'], SKILL_MULTIPLIERS['Changli'],
// CHARACTER_ROTATIONS['Changli'], and "Characters data dump/Changli/Changli.md"'s own detailed
// Standard Rotation prose (the only place the real cast order/count lives — CHARACTER_ROTATIONS
// itself is a 6-step abstraction of it). No new numbers invented anywhere in this file.
//
// Full re-segmentation pass, 2026-09-04: every named kit component in the dump was checked against
// this file move-by-move. Found and fixed:
//   - changli.intro.obedience-of-rules and changli.heavy.standard had NO damage.category at all —
//     silently rejecting every teammate skillDmg/heavyDmg buff. Fixed to the project's default-to-
//     skillDmg convention (Intro) and heavyDmg (Heavy ATK's own real category).
//   - Mid-air Attack Stage 1-4 (61.35%+50.87%×2+44.00%×3+38.03%+22.18%×4) was completely absent —
//     a real, sourced move the Standard Rotation text explicitly casts ("Basic: Mid-air Attack
//     (Instant Dash Cancel) ... Basic: Mid-air Attack 4") to open her 3rd True Sight window. Added.
//   - Skill (True Sight: Capture) and Forte Heavy (Flaming Sacrifice) are each cast TWICE per real
//     cycle (2 Skill charges both used; the Forte step's own note says "landing 2 casts per rotation
//     is the goal") but only 1 of each fired, since CHARACTER_ROTATIONS has only 1 step of each.
//     Added a 2nd instance of both, riding the same existing trigger (no new CHARACTER_ROTATIONS
//     steps — see the note on this pattern below).
//   - S1/S6/Fiery Feather/Sweeping Force were all unscoped stat buffs whose real kit text only
//     covers specific named casts, but whose stats (skillDmg/heavyDmg ARE category-gated; elemDmg/
//     defIgnore/atkPct are NOT) meant several of them were over- or under-applying once real Skill/
//     Conquest/Charge/Forte blocks existed to leak onto. All rescoped via scopedToBlockId to the
//     exact real block(s) their kit text names — see each block's own note.
//   - Dodge Counter and the standalone GROUND Basic ATK Stage 1-4 combo are real, sourced moves
//     (82.64%×3 and 29.49%×2→35.49%×2→36.45%×3→50.70%+29.58%×4) but appear NOWHERE in her Standard
//     Rotation text — deliberately left unmodeled, same "no mention in the modeled rotation" standard
//     already applied project-wide, not an oversight.
//
// Multiple blocks below share one existing CHARACTER_ROTATIONS trigger instead of each needing its
// own rotation step — adding new steps would inflate her simulated rotation time past the real
// sourced ~9.78s, since every step advances a flat 1.5s and no per-move animation-duration data
// exists anywhere to correct that. The engine already fires every block matching a trigger, not
// just one (confirmed in resolveHitComposedDps.js), so this is a safe, real-numbers-only technique —
// same one already used for Mortefi's chain S1/S5 bonus-Marcato blocks riding his Liberation cast.
// ═══════════════════════════════════════════════════════════════════════════════

import { parseSkillMultiplierHits } from '../math/hitParser.js';

const SOURCE = 'Changli';

// The real block-id groups Resonance Chain S1/S6's kit text names by SKILL NAME rather than by a
// single cast — "Tripartite Flames" is the Resonance Skill's own name, covering every one of its
// True Sight follow-ups too (Conquest/Charge's kit text is explicit "considered Resonance Skill
// DMG"); "Flaming Sacrifice" covers both real Forte Heavy casts. Declared once here so S1/S6 below
// don't hand-duplicate 6-9 nearly-identical scopedToBlockId effect entries.
const TRIPARTITE_FLAMES_BLOCK_IDS = [
  'changli.skill.true-sight-capture', 'changli.skill.true-sight-capture-2',
  'changli.skill.true-sight-charge-1', 'changli.skill.true-sight-charge-2', 'changli.skill.true-sight-charge-3',
  'changli.skill.true-sight-conquest-1',
];
const FLAMING_SACRIFICE_BLOCK_IDS = ['changli.forte.flaming-sacrifice', 'changli.forte.flaming-sacrifice-2'];
const LIBERATION_BLOCK_ID = 'changli.liberation.radiance-of-fealty';

/** @type {import('../triggerBlocks.schema.js').TriggerBlock[]} */
export const CHANGLI_BLOCKS = [
  // ── Damage blocks (from SKILL_MULTIPLIERS) ──
  {
    id: 'changli.intro.obedience-of-rules',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Intro:Obedience of Rules' },
    timing: {}, target: { scope: 'self' }, effects: [],
    // category added 2026-09-04 (full re-segmentation pass): was uncategorized, silently rejecting
    // teammate skillDmg buffs. No override text names a different category, same default-to-skillDmg
    // convention applied project-wide.
    damage: { hits: parseSkillMultiplierHits('44.50%+25.96%×4'), category: 'skillDmg' },
    note: 'Also opens a 12s True Sight window.',
  },
  {
    id: 'changli.skill.true-sight-capture',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Skill:True Sight: Capture' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('81.88%×3+163.76%'), category: 'skillDmg' },
    note: "1st of 2 real True Sight: Capture casts per rotation (2 charges, both used) — see changli.skill.true-sight-capture-2 for the 2nd. Row 'True Sight: Capture / Conquest / Charge' has 3 arrow-separated segments — only Capture's own segment used here; see changli.skill.true-sight-conquest-1/changli.skill.true-sight-charge-1/2/3 below for the other two.",
  },
  {
    // Added 2026-09-04 (full re-segmentation pass): the real Standard Rotation casts Skill (True
    // Sight: Capture) TWICE per cycle (2 charges, both used) — only 1 was ever credited, since
    // CHARACTER_ROTATIONS has only 1 'Skill' step. Rides the same existing trigger rather than a new
    // step (see file header note on this technique).
    id: 'changli.skill.true-sight-capture-2',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Skill:True Sight: Capture' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('81.88%×3+163.76%'), category: 'skillDmg' },
    note: '2nd of 2 real True Sight: Capture casts per rotation.',
  },
  {
    id: 'changli.heavy.standard',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Heavy ATK:Standard' },
    timing: {}, target: { scope: 'self' }, effects: [],
    // Row 'Standard / Mid-air Heavy' has 2 arrow-separated segments — the rotation step explicitly
    // does both (ground Heavy ATK, then again in the air), so both are combined here.
    // category added 2026-09-04 (full re-segmentation pass): was uncategorized, silently rejecting
    // teammate heavyDmg buffs despite dmgFocus (fixed same day) now correctly including Heavy ATK.
    damage: { hits: [...parseSkillMultiplierHits('28.99%×3+37.27%'), ...parseSkillMultiplierHits('123.27%')], category: 'heavyDmg' },
  },
  {
    // Added 2026-09-04 (full re-segmentation pass): Mid-air Attack Stage 1-4 was completely absent —
    // a real, sourced move (its own dedicated SKILL_MULTIPLIERS row) the Standard Rotation text
    // explicitly casts to open her 3rd/final True Sight window ("Basic: Mid-air Attack (Instant Dash
    // Cancel) ... Basic: Mid-air Attack 4"). Rides the Heavy ATK trigger (its nearest real-order
    // neighbor) rather than a new step. Plain "Fusion DMG" kit text (no "considered X" override) →
    // basicDmg, the default category for an unqualified Basic/Mid-air ATK move.
    id: 'changli.basic.mid-air-attack',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Heavy ATK:Standard' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('61.35%+50.87%×2+44.00%×3+38.03%+22.18%×4'), category: 'basicDmg' },
    note: 'The 1 real Mid-air Attack Stage 1-4 combo per rotation — releasing Stage 4 opens a fresh 12s True Sight window (consumed by changli.skill.true-sight-charge-3).',
  },
  {
    id: 'changli.liberation.radiance-of-fealty',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Liberation:Radiance of Fealty' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('1212.75%'), category: 'libDmg' },
    note: 'Grants 4 Enflamement (caps, does not stack past 4) and Fiery Feather (self +25% ATK on the 2nd, post-Ultimate Forte Heavy ATK within 10s — see changli.selfbuff.fiery-feather).',
  },
  {
    id: 'changli.forte.flaming-sacrifice',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Forte:Heavy ATK: Flaming Sacrifice' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('39.25%×5+457.85%'), category: 'heavyDmg' },
    note: "1st of 2 real Flaming Sacrifice casts per rotation (the one BEFORE Ultimate, consuming the 4 Enflamement built via True Sight follow-ups) — see changli.forte.flaming-sacrifice-2 for the 2nd (post-Ultimate) cast. 40% DMG reduction while casting, not modeled (no DPS component).",
  },
  {
    // Added 2026-09-04 (full re-segmentation pass): the real Standard Rotation casts Flaming
    // Sacrifice TWICE per cycle — the step's own note already said so ("landing 2 casts per rotation
    // is the goal") — only 1 was ever credited. This is specifically the 2nd, POST-ULTIMATE cast
    // (real order: "Ultimate → Heavy: Flaming Sacrifice (Swap)"), which is why Fiery Feather scopes
    // to this id specifically, not the 1st.
    id: 'changli.forte.flaming-sacrifice-2',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Forte:Heavy ATK: Flaming Sacrifice' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('39.25%×5+457.85%'), category: 'heavyDmg' },
    note: '2nd of 2 real Flaming Sacrifice casts per rotation — the post-Ultimate cast Fiery Feather (self ATK +25%) actually buffs.',
  },

  // ── Buff blocks (from CHAR_BUFF_TABLE) ──
  {
    id: 'changli.outro.strategy-of-duality',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'swap-out' },
    timing: { duration: 10, forfeitOnRecipientSwapOut: true },
    target: { scope: 'next-on-field' },
    condition: { element: 'fusion' },
    effects: [
      { stat: 'elemDmg', value: 20, stacking: 'refresh' },
      { stat: 'libDmg', value: 25, stacking: 'refresh' },
    ],
    // Retrofitted 2026-09-03 (REMAINING_WORK.md 1a): forfeitOnRecipientSwapOut now actually clamps
    // this to the incoming Resonator's own swap-out instant when it's shorter than the full 10s.
    note: 'Ends early if the incoming Resonator is swapped out before 10s.',
  },
  {
    id: 'changli.selfbuff.fiery-feather',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'cast', on: 'Liberation:Radiance of Fealty' },
    timing: { duration: 10 },
    target: { scope: 'self' },
    // scopedToBlockId added 2026-09-04 (full re-segmentation pass): atkPct isn't category-gated, so
    // before changli.forte.flaming-sacrifice-2 existed to scope to, this was silently unscoped (any
    // hit landing within the 10s window would have gotten +25% ATK, not just the real 2nd Forte
    // Heavy cast it's supposed to buff — a latent bug the old 1-Forte-block model happened not to
    // expose, since nothing else landed inside that window).
    effects: [{ stat: 'atkPct', value: 25, scopedToBlockId: 'changli.forte.flaming-sacrifice-2' }],
    note: 'Fiery Feather: self ATK +25% on the 2nd, post-Ultimate Forte Heavy ATK (Flaming Sacrifice) within 10s of Liberation — consuming it ends Fiery Feather early, not modeled (irrelevant here since it\'s now scoped to the exact real cast it buffs).',
  },

  // ── Resonance Chain blocks (from RESONANCE_CHAIN_DATA — see its own 2026-08-31 audit comment for
  //    each node's real mechanic) ──
  {
    // Rescoped 2026-09-04 (full re-segmentation pass): was unscoped passive skillDmg/heavyDmg — safe
    // by ACCIDENT before (skillDmg-category-gated, and the only skillDmg block in the file was the
    // real Tripartite Flames cast), but changli.intro.obedience-of-rules gaining its own skillDmg
    // category this same pass would have made this incorrectly also boost Intro, which S1's kit text
    // ("conditional to Resonance Skill Tripartite Flames AND Heavy Attack Flaming Sacrifice casts
    // specifically") doesn't cover. Rescoped to the exact real block-id groups.
    id: 'changli.chain.s1',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'self' },
    effects: [
      ...TRIPARTITE_FLAMES_BLOCK_IDS.map(id => ({ stat: 'skillDmg', value: 10, scopedToBlockId: id })),
      ...FLAMING_SACRIFICE_BLOCK_IDS.map(id => ({ stat: 'heavyDmg', value: 10, scopedToBlockId: id })),
    ],
    note: 'Real mechanic: conditional to Resonance Skill Tripartite Flames (+ its True Sight follow-ups, "considered Resonance Skill DMG") AND Heavy Attack Flaming Sacrifice casts specifically (+ interruption resistance, no stat field, not modeled) — scoped to the exact real blocks via scopedToBlockId rather than an unscoped category-wide passive.',
  },
  {
    id: 'changli.chain.s2',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'cast', on: 'Liberation:Radiance of Fealty' },
    timing: { duration: 8 },
    target: { scope: 'self' },
    effects: [{ stat: 'critRate', value: 25 }],
    // Note corrected 2026-09-04 (full re-segmentation pass): the True Sight follow-ups (Conquest/
    // Charge) now have real blocks and DO also grant Enflamement in reality, per the kit text — this
    // buff's real trigger is broader than just Liberation. Left scoped to only the Liberation cast on
    // purpose: the schema has no "OR" mechanism for a single buff block to listen on multiple
    // different casts, and duplicating this block per real Enflamement source (5 total) would double-
    // or-triple-count the +25% Crit Rate at any instant where more than one of those windows overlaps
    // (each block's own window is tracked independently — activeCountAt has no cross-block dedup).
    // Kept as the single safest real trigger rather than risk an over-count; a real (small) undercount,
    // not a fabricated number.
    note: 'Real mechanic: gaining Enflamement raises Crit Rate +25% for 8s. Scoped to Liberation\'s cast only — see this block\'s own comment above for why the True Sight follow-ups aren\'t also wired in.',
  },
  {
    id: 'changli.chain.s3',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'cast', on: 'Liberation:Radiance of Fealty' },
    timing: {}, target: { scope: 'self' },
    effects: [{ stat: 'libDmg', value: 80 }],
    note: "Real scope: Radiance of Fealty's own DMG Multiplier +80% — cast-scoped (instant, no persistent duration; only Liberation is libDmg-category, so this is unambiguous without scopedToBlockId). Confirmed actually applying as of the 2026-09-04 resolveHitComposedDps fix (previously silently dropped — see REMAINING_WORK.md).",
  },
  {
    id: 'changli.chain.s4',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'cast', on: 'Intro:Obedience of Rules' },
    timing: { duration: 30 },
    target: { scope: 'whole-team' },
    effects: [{ stat: 'atkPct', value: 20 }],
    note: 'Real mechanic: after Intro Skill, team ATK +20% for 30s — gated behind an Intro-Skill cast, not a flat always-on buff.',
  },
  {
    // Corrected 2026-09-03 against a fresh the source dump: this node has TWO separate, compounding +50%
    // effects — "Multiplier is increased by 50%" (a raw DMG Multiplier bonus, modeled via totalMult,
    // same stat/shape as Camellya's own S2/S5 totalMult nodes) AND "DMG dealt is increased by 50%" (a
    // heavyDmg-category bonus). Previously only the latter was modeled — this note used to say the flat
    // table "is the only value sourced for this node," which this pass fixes by sourcing the 2nd value
    // for real, rather than leaving it dropped.
    id: 'changli.chain.s5-heavydmg',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'cast', on: 'Forte:Heavy ATK: Flaming Sacrifice' },
    timing: {}, target: { scope: 'self' },
    effects: [{ stat: 'heavyDmg', value: 50 }],
    note: "Flaming Sacrifice's DMG dealt +50% (the 2nd, separate half of this node — see changli.chain.s5-totalmult for the DMG Multiplier half) — cast-scoped (instant, no persistent duration). heavyDmg is category-gated and both real Flaming Sacrifice casts share that category, so this correctly reaches both without needing scopedToBlockId.",
  },
  {
    id: 'changli.chain.s5-totalmult',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'cast', on: 'Forte:Heavy ATK: Flaming Sacrifice' },
    timing: {}, target: { scope: 'self' },
    effects: [{ stat: 'totalMult', value: 50 }],
    note: "Flaming Sacrifice's DMG Multiplier +50% (the 1st, separate half of this node — see changli.chain.s5-heavydmg for the DMG-dealt half) — cast-scoped (instant, no persistent duration). totalMult is a flat per-instant multiplier with no category gate at all, but the Forte step's own instant currently has no other damage block riding it besides the 2 real Flaming Sacrifice casts, so this is correct as-is; flagging for re-check if another block is ever added to this same trigger.",
  },
  {
    // Rescoped 2026-09-04 (full re-segmentation pass): was unscoped passive defIgnore — the same bug
    // class as the original Sweeping Force (defIgnore isn't category-gated), boosting ALL her hits
    // instead of only Tripartite Flames/Flaming Sacrifice/Radiance of Fealty as the kit text requires.
    id: 'changli.chain.s6',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'self' },
    effects: [
      ...TRIPARTITE_FLAMES_BLOCK_IDS.map(id => ({ stat: 'defIgnore', value: 40, scopedToBlockId: id })),
      ...FLAMING_SACRIFICE_BLOCK_IDS.map(id => ({ stat: 'defIgnore', value: 40, scopedToBlockId: id })),
      { stat: 'defIgnore', value: 40, scopedToBlockId: LIBERATION_BLOCK_ID },
    ],
    note: 'Tripartite Flames (+ its True Sight follow-ups), Flaming Sacrifice, and Radiance of Fealty ignore an additional 40% of target DEF — scoped to the exact real blocks via scopedToBlockId rather than an unscoped passive.',
  },

  // ── Inherent Skill (added 2026-09-04, Phase A audit, REMAINING_WORK.md 1c — dimension 8: was entirely
  //    unmodeled, no block existed for either of Changli's 2 Inherent Skills) ──
  {
    // Fixed 2026-09-04 (same day, same pass): was unscoped passive `elemDmg`/`defIgnore` — unlike s1's
    // skillDmg/heavyDmg (category-gated, so an unscoped passive only reaches skillDmg/heavyDmg-category
    // hits), elemDmg/defIgnore have NO category gate at all, so the original version was boosting
    // ALL of her Fusion damage (100% of her kit) instead of only Forte Heavy/Liberation as the kit text
    // requires. Split into 2 scopedToBlockId effects, same fix class as Mortefi's S3 critDmg bug.
    // Extended to cover BOTH real Flaming Sacrifice casts once the 2nd was added this same pass.
    id: 'changli.inherent.sweeping-force-forte',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'self' },
    effects: FLAMING_SACRIFICE_BLOCK_IDS.flatMap(id => [
      { stat: 'elemDmg', value: 20, scopedToBlockId: id },
      { stat: 'defIgnore', value: 15, scopedToBlockId: id },
    ]),
    note: 'Sweeping Force (Forte Heavy half): Flaming Sacrifice → Fusion DMG Bonus +20% and 15% target DEF Ignore, scoped to BOTH real Flaming Sacrifice casts — see changli.inherent.sweeping-force-liberation for the Liberation half.',
  },
  {
    id: 'changli.inherent.sweeping-force-liberation',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'self' },
    effects: [
      { stat: 'elemDmg', value: 20, scopedToBlockId: LIBERATION_BLOCK_ID },
      { stat: 'defIgnore', value: 15, scopedToBlockId: LIBERATION_BLOCK_ID },
    ],
    note: 'Sweeping Force (Liberation half): Radiance of Fealty → Fusion DMG Bonus +20% and 15% target DEF Ignore, scoped to only this cast.',
  },

  // ── True Sight: Conquest/Charge (added 2026-09-04, dimension 8: previously had NO block at all —
  //    changli.skill.true-sight-capture only ever modeled the initial Skill press). The Standard
  //    Rotation's own detailed step-by-step text (not the abbreviated 6-step CHARACTER_ROTATIONS array)
  //    names the real order: Charge → [Skill] → Charge → [Mid-air combo] → Charge → [Skill] → Conquest,
  //    i.e. exactly 3 real Charge casts + 1 real Conquest cast per rotation, each granting +1 Enflamement
  //    on hit (0/1/2/3 stacks respectively HELD AT CAST — the stat Secret Strategist scales off). All 4
  //    are triggered off the same existing 'Skill:True Sight: Capture' step rather than adding new
  //    CHARACTER_ROTATIONS steps (see file header note on this technique). Both moves' kit text is
  //    explicit "Fusion DMG (considered Resonance Skill DMG)" → skillDmg, same "counted as X" convention
  //    used throughout this project.
  {
    id: 'changli.skill.true-sight-charge-1',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Skill:True Sight: Capture' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('72.68%+109.02%'), category: 'skillDmg' },
    note: '1st of 3 real True Sight: Charge casts per rotation — cast while holding 0 Enflamement, so Secret Strategist contributes nothing here.',
  },
  {
    id: 'changli.skill.true-sight-charge-2',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Skill:True Sight: Capture' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('72.68%+109.02%'), category: 'skillDmg' },
    note: '2nd of 3 real True Sight: Charge casts per rotation — cast while holding 1 Enflamement stack; see changli.inherent.secret-strategist-charge-2 for its scoped +5% Fusion DMG bonus.',
  },
  {
    id: 'changli.skill.true-sight-charge-3',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Skill:True Sight: Capture' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('72.68%+109.02%'), category: 'skillDmg' },
    note: '3rd of 3 real True Sight: Charge casts per rotation — cast while holding 2 Enflamement stacks; see changli.inherent.secret-strategist-charge-3 for its scoped +10% Fusion DMG bonus.',
  },
  {
    id: 'changli.skill.true-sight-conquest-1',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Skill:True Sight: Capture' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('58.95%×2+82.52%+94.31%'), category: 'skillDmg' },
    note: 'The 1 real True Sight: Conquest cast per rotation (the 4th and final Enflamement-granting follow-up, landing right before the 1st Forte Heavy) — cast while holding 3 Enflamement stacks (the cap); see changli.inherent.secret-strategist-conquest-1 for its scoped +15% Fusion DMG bonus.',
  },
  {
    id: 'changli.inherent.secret-strategist-charge-2',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'self' },
    effects: [{ stat: 'elemDmg', value: 5, scopedToBlockId: 'changli.skill.true-sight-charge-2' }],
    note: 'Secret Strategist: +5% Fusion DMG Bonus per Enflamement stack held when casting True Sight: Conquest/Charge — this cast is held at 1 stack, so +5% (1×5%), scoped to only this specific hit via scopedToBlockId (elemDmg isn\'t category-gated, so an unscoped version would over-credit her other skillDmg hits too).',
  },
  {
    id: 'changli.inherent.secret-strategist-charge-3',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'self' },
    effects: [{ stat: 'elemDmg', value: 10, scopedToBlockId: 'changli.skill.true-sight-charge-3' }],
    note: 'Secret Strategist: this cast is held at 2 Enflamement stacks, so +10% (2×5%) Fusion DMG Bonus, scoped to only this specific hit.',
  },
  {
    id: 'changli.inherent.secret-strategist-conquest-1',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'self' },
    effects: [{ stat: 'elemDmg', value: 15, scopedToBlockId: 'changli.skill.true-sight-conquest-1' }],
    note: 'Secret Strategist: this cast is held at 3 Enflamement stacks (the cap), so +15% (3×5%) Fusion DMG Bonus, scoped to only this specific hit.',
  },
];
