// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — engine/characterBlocks/lingyang.blocks.js
// Lingyang converted to TriggerBlocks. Sourced from characters.js's already-audited
// CHAR_BUFF_TABLE['Lingyang'], RESONANCE_CHAIN_DATA['Lingyang'] (+ its own detailed
// 2026-08-31 audit comment, read directly for each node's real mechanic),
// SKILL_MULTIPLIERS['Lingyang'], and CHARACTER_ROTATIONS['Lingyang']. No new numbers
// invented. S1/S2 correctly have NO block — pure poise/resource-gain utility with
// zero DPS component, per the audit's own zeroing. S5 is modeled as a real proc-
// style damage block using the source's own "200% of ATK" figure instead of the
// flat totalMult approximation the table itself carried.
//
// Full-kit audit, 2026-09-09: 3 real bugs found and fixed. (1) Feral Gyrate's own
// "Part 1"/"Part 2" (genuinely different multipliers) were being modeled as ONE
// block using only Part 1's value — the dump's own Sample Rotation proves these
// are 2 SEPARATE alternating casts (with a Mountain Roamer cast between each),
// not one combined combo. Split into lingyang.basic.feral-gyrate-p1/p2, with
// CHARACTER_ROTATIONS['Lingyang'] rebuilt to the real 5-Basic/4-Skill alternating
// sequence (was silently only 1 Basic + 1 Skill, dropping 80% of the real
// rotation). (2) Diligent Practice split into 2 matching P1/P2-anchored blocks for
// the same reason. (3) Minor Fortes had no block at all.
// ═══════════════════════════════════════════════════════════════════════════════

import { parseSkillMultiplierHits } from '../math/hitParser.js';

const SOURCE = 'Lingyang';

/** @type {import('../schema/block.schema.js').TriggerBlock[]} */
export const LINGYANG_BLOCKS = [
  // ── Damage blocks (from SKILL_MULTIPLIERS) ──
  {
    id: 'lingyang.intro.lion-awakens',
    source: SOURCE, kind: 'damage', section: 'Intro',
    trigger: { type: 'cast', on: 'Intro:Lion Awakens' },
    timing: {}, target: { scope: 'self' }, effects: [],
    // category fixed 2026-09-03 (Phase A audit, REMAINING_WORK.md 1c): was uncategorized, silently
    // rejecting Resonance Skill DMG Bonus on a real ~4.25% (13,631) damage share. No override text
    // names a different category, same default-to-skillDmg convention as Calcharo/Encore/Jianxin.
    damage: { hits: parseSkillMultiplierHits('99.41%×2'), category: 'skillDmg', basis: 'ATK' },
    note: 'One of three casts (with Furious Punches and Strive: Lion\'s Vigor) that restore Lion\'s Spirit; exact restore amount per trigger not published, not modeled.',
  },
  {
    // Added 2026-09-03 (Phase A audit, REMAINING_WORK.md 1c): Inherent Skill Lion's Pride was entirely
    // missing — a whole kit component with no block at all, not just a categorization gap. Scoped only
    // to the Intro hit above via scopedToBlockId, cast-scoped to the same trigger (instant, no
    // persistent duration), same "single-hit-scoped" pattern as Calcharo's S5.
    id: 'lingyang.selfbuff.lions-pride',
    source: SOURCE, kind: 'buff', section: 'Buff',
    trigger: { type: 'cast', on: 'Intro:Lion Awakens' },
    timing: {}, target: { scope: 'self' },
    effects: [{ stat: 'totalMult', value: 50, scopedToBlockId: 'lingyang.intro.lion-awakens', source: 'self-kit' }],
    note: "Inherent Skill Lion's Pride: DMG of Intro Skill Lion Awakens +50%.",
  },
  {
    id: 'lingyang.liberation.strive-lions-vigor',
    source: SOURCE, kind: 'damage', section: 'Liberation',
    trigger: { type: 'cast', on: "Liberation:Strive: Lion's Vigor" },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('397.62%'), category: 'libDmg', basis: 'ATK' },
    note: "20s cooldown. Also grants self +50% Glacio DMG Bonus for 14s (see lingyang.selfbuff.strive below) and restores Lion's Spirit.",
  },
  {
    id: 'lingyang.forte.glorious-plunge',
    source: SOURCE, kind: 'damage', section: 'Forte',
    trigger: { type: 'cast', on: 'Forte:Unification of Spirits' },
    timing: {}, target: { scope: 'self' }, effects: [],
    // Row 'Unification of Spirits (Striding Lion)' has 5 named components — only Glorious Plunge (the
    // Forte's own entry hit) is used here; Feral Gyrate/Mountain Roamer/Stormy Kicks/Tail Strike are
    // separately modeled below as the Basic ATK/Skill blocks the real rotation actually casts.
    // category fixed 2026-09-03 (Phase A audit, REMAINING_WORK.md 1c): was uncategorized, silently
    // rejecting Heavy ATK DMG Bonus on a real 5.8% (10,209) damage share. Entered by holding Heavy
    // Attack per the dump's own kit text ("HOLD Heavy Attack for Glorious Plunge"), same input-slot
    // convention as Jianxin's Forte:Primordial Chi Spiral/Yinlin's Forte:Chameleon Cipher.
    damage: { hits: parseSkillMultiplierHits('172.37%'), category: 'heavyDmg', basis: 'ATK' },
    note: "At full Lion's Spirit, HOLD Heavy Attack for Glorious Plunge and enter the airborne Striding Lion state.",
  },
  {
    // Found 2026-09-09 (full-kit audit): was ONE block using only Feral Gyrate's "Part 1" multiplier
    // (87.08%×2+116.11%) — Part 2 (31.77%×6), a genuinely different value from its own dump table row,
    // was entirely missing. The dump's own Sample Rotation text proves these are 2 SEPARATE
    // alternating casts ("Basic: Feral Gyrate P1 → Skill: Mountain Roamer → Basic: Feral Gyrate P2 →
    // ..."), not one combined combo — see SKILL_MULTIPLIERS['Lingyang']'s own split-row comment for
    // the full reasoning (including why hitParser.js's own "→" semantics would have been wrong to
    // combine them into one cast). Split into 2 blocks matching CHARACTER_ROTATIONS' now-real
    // alternating P1/P2/P1/P2/P1 step sequence.
    id: 'lingyang.basic.feral-gyrate-p1',
    source: SOURCE, kind: 'damage', section: 'BasicATK',
    trigger: { type: 'cast', on: 'Basic ATK:Majestic Fists P1' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('87.08%×2+116.11%'), category: 'basicDmg', basis: 'ATK' },
    note: "Feral Gyrate Part 1 (Striding Lion Basic ATK replacement, 1st of 2 alternating parts). Once Lion's Spirit drops below 10, this becomes the 8-hit+finisher Stormy Kicks instead (36.03%×8+192.15%, see lingyang.basic.stormy-kicks below).",
  },
  {
    id: 'lingyang.basic.feral-gyrate-p2',
    source: SOURCE, kind: 'damage', section: 'BasicATK',
    trigger: { type: 'cast', on: 'Basic ATK:Majestic Fists P2' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('31.77%×6'), category: 'basicDmg', basis: 'ATK' },
    note: 'Feral Gyrate Part 2 (Striding Lion Basic ATK replacement, 2nd of 2 alternating parts — cycles back to Part 1 on the next tap).',
  },
  {
    id: 'lingyang.skill.ancient-arts',
    source: SOURCE, kind: 'damage', section: 'Skill',
    trigger: { type: 'cast', on: 'Skill:Ancient Arts' },
    timing: {}, target: { scope: 'self' }, effects: [],
    // Row segment for Mountain Roamer, the Striding Lion Skill replacement this step actually casts.
    damage: { hits: parseSkillMultiplierHits('82.88%×2'), category: 'skillDmg', basis: 'ATK' },
    note: 'Mountain Roamer (Striding Lion Skill replacement, airborne).',
  },
  {
    // Added 2026-09-04 (Phase A audit, REMAINING_WORK.md 1c): Stormy Kicks (the low-Lion's-Spirit
    // Basic ATK replacement within Striding Lion) had a real, published multiplier
    // (36.03%×8+192.15%) but no damage block at all — CHARACTER_ROTATIONS' own sample rotation ends
    // its Striding Lion loop with this exact move before Tail Strike/Outro.
    id: 'lingyang.basic.stormy-kicks',
    source: SOURCE, kind: 'damage', section: 'BasicATK',
    trigger: { type: 'cast', on: 'Basic ATK:Stormy Kicks' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('36.03%×8+192.15%'), category: 'basicDmg', basis: 'ATK' },
    note: "Stormy Kicks (Striding Lion Basic ATK replacement once Lion's Spirit drops below 10, replacing Feral Gyrate). Unlocks the Tail Strike Mid-air Attack.",
  },
  {
    // Added 2026-09-04 (Phase A audit, REMAINING_WORK.md 1c): same gap as Stormy Kicks above — Tail
    // Strike (174.96%×2) is a real Mid-air Attack the source's own sample rotation casts as the final
    // hit of the Striding Lion window, with no engine block modeling it. Categorized basicDmg per this
    // project's convention of folding Mid-air Attack into the Basic ATK bucket (no separate profile
    // bucket exists for it in the source's own Damage Profile section).
    id: 'lingyang.midair.tail-strike',
    source: SOURCE, kind: 'damage', section: 'BasicATK',
    trigger: { type: 'cast', on: 'Mid-air:Tail Strike' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('174.96%×2'), category: 'basicDmg', basis: 'ATK' },
    note: 'Tail Strike (Mid-air Attack unlocked by Stormy Kicks) — the final real hit of the Striding Lion window per the source\'s own sample rotation.',
  },
  {
    id: 'lingyang.outro.frosty-marks',
    source: SOURCE, kind: 'damage', section: 'Outro',
    trigger: { type: 'swap-out' },
    timing: {}, target: { scope: 'self' }, effects: [],
    // category fixed 2026-09-03 (Phase A audit, REMAINING_WORK.md 1c): was uncategorized, silently
    // rejecting Outro DMG Bonus on a real 13.9% (44,664) damage share — his 3rd-largest bucket. His own
    // kit text is explicit this is pure damage, not a team buff — same outroDmg shape already fixed for
    // Rover: Havoc's Soundweaver/Calcharo's Shadowy Raid/Encore's Thermal Field.
    damage: { hits: parseSkillMultiplierHits('587.94%'), category: 'outroDmg', basis: 'ATK' },
    note: "Pure-damage AoE finisher — no baseline team buff (S4 Resonance Chain grants team Glacio DMG +20%/30s on this Outro, see lingyang.chain.s4 below).",
  },

  // ── Buff blocks (from CHAR_BUFF_TABLE) ──
  {
    // Added 2026-09-03 against a real browser snapshot: this Inherent Skill (Diligent
    // Practice) was entirely missing before this pass, despite CHARACTER_ROTATIONS['Lingyang']
    // already alternating Basic ATK and Skill (Mountain Roamer) specifically to exploit it, per the
    // source's own Rotation section. Scoped to lingyang.skill.ancient-arts (Mountain Roamer) only via
    // scopedToBlockId, avoiding over-crediting Feral Gyrate or any other skillDmg-categorized hit —
    // same "over-crediting" caution as Augusta's S3 fix.
    //
    // Split into 2 blocks 2026-09-09 (full-kit audit): the real trigger is "each Basic Attack"
    // regardless of which Feral Gyrate part lands, but CHARACTER_ROTATIONS' now-real alternating
    // P1/P2/P1/P2/P1 sequence (see lingyang.basic.feral-gyrate-p1/p2's own retargeting comment) means
    // a single 'Basic ATK:Majestic Fists' trigger label no longer matches anything. Verified no
    // double-counting risk: each Basic cast's own 3s window only needs to survive until the ONE
    // Skill cast that immediately follows it (~1.5s later in the coarse step model) — by the time the
    // NEXT Basic cast (P1 or P2) opens its own window ~3s later, the prior window has already closed,
    // so at most one window is ever active at a time.
    id: 'lingyang.selfbuff.diligent-practice-p1',
    source: SOURCE, kind: 'buff', section: 'Buff',
    trigger: { type: 'cast', on: 'Basic ATK:Majestic Fists P1' },
    timing: { duration: 3 },
    target: { scope: 'self' },
    effects: [{ stat: 'totalMult', value: 150, scopedToBlockId: 'lingyang.skill.ancient-arts', source: 'self-kit' }],
    note: "Inherent Skill Diligent Practice: in Striding Lion state, within 3s after each Basic Attack (Feral Gyrate), the next Mountain Roamer deals an additional 150% of its own damage, considered Resonance Skill DMG.",
  },
  {
    id: 'lingyang.selfbuff.diligent-practice-p2',
    source: SOURCE, kind: 'buff', section: 'Buff',
    trigger: { type: 'cast', on: 'Basic ATK:Majestic Fists P2' },
    timing: { duration: 3 },
    target: { scope: 'self' },
    effects: [{ stat: 'totalMult', value: 150, scopedToBlockId: 'lingyang.skill.ancient-arts', source: 'self-kit' }],
    note: 'Inherent Skill Diligent Practice, same real effect as the Part 1 version above — anchored separately since Feral Gyrate Part 2 is a distinct cast label.',
  },
  // Added 2026-09-09 (full-kit audit): Minor Fortes had no block anywhere in this file — a real,
  // previously-missed completeness gap, unlike every other character audited this session.
  {
    id: 'lingyang.buff.minor-fortes',
    source: SOURCE, kind: 'buff', section: 'Buff',
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'self' },
    effects: [
      { stat: 'elemDmg', value: 12, source: 'self-kit' },
      { stat: 'atkPct', value: 12, source: 'self-kit' },
    ],
    note: 'Minor Fortes: Glacio DMG+12%, ATK%+12% (Data dump/Lingyang/Lingyang.md line 99-100). Unconditional, always active.',
  },
  {
    id: 'lingyang.selfbuff.strive',
    source: SOURCE, kind: 'buff', section: 'Buff',
    trigger: { type: 'cast', on: "Liberation:Strive: Lion's Vigor" },
    timing: { duration: 14 },
    target: { scope: 'self' },
    effects: [{ stat: 'elemDmg', value: 50, stacking: 'refresh', source: 'self-kit' }],
    note: "While active, Striding Lion's Lion's Spirit drain is halved (extending the state from 5s to 10s), not modeled (no DPS component).",
  },

  // ── Resonance Chain blocks (from RESONANCE_CHAIN_DATA — see its own 2026-08-31 audit comment for
  //    each node's real mechanic; S1/S2 correctly have NO block — pure poise/resource-gain utility,
  //    zero DPS component per the audit's own zeroing) ──
  // S1 correctly has NO block — during Liberation Lion's Vigor, Anti-Interruption is enhanced, pure
  // poise/interrupt-resistance utility.
  // S2 correctly has NO block — Intro Skill Lion Awakens additionally recovers 10 Resonance Energy,
  // triggered once every 20s, pure Resonance Energy resource-gain.
  {
    id: 'lingyang.chain.s3',
    source: SOURCE, kind: 'buff', section: 'Chain',
    trigger: { type: 'cast', on: "Liberation:Strive: Lion's Vigor" },
    timing: { duration: 14 }, // matches Lion's Vigor's own 14s window, since this is conditional on it being active
    target: { scope: 'self' },
    effects: [
      { stat: 'basicDmg', value: 20, source: 'self-kit' },
      { stat: 'skillDmg', value: 10, source: 'self-kit' },
    ],
    note: "During Resonance Liberation Lion's Vigor, Basic Attack DMG Bonus +20%, Resonance Skill DMG Bonus +10% (confirmed exact) — modeled scoped to Lion's Vigor's own 14s window.",
  },
  {
    id: 'lingyang.chain.s4',
    source: SOURCE, kind: 'buff', section: 'Chain',
    trigger: { type: 'swap-out' },
    timing: { duration: 30 },
    target: { scope: 'whole-team' },
    condition: { element: 'glacio' },
    effects: [{ stat: 'elemDmg', value: 20, stacking: 'refresh', source: 'teammate-ally-action' }],
    note: 'Outro Skill Frosty Marks increases the Glacio DMG Bonus of all team members by 20% for 30s (confirmed exact, team-wide).',
  },
  {
    id: 'lingyang.chain.s5-bonus-hit',
    source: SOURCE, kind: 'damage', section: 'Chain',
    trigger: { type: 'cast', on: "Liberation:Strive: Lion's Vigor" },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: [{ atkPct: 200 }], category: 'libDmg', basis: 'ATK' },
    note: "Resonance Liberation Strive: Lion's Vigor additionally deals Glacio DMG equal to 200% of Lingyang's ATK — modeled as a real proc-style damage block using the source's own exact figure instead of the flat totalMult:200 approximation the table itself carried (same 'discrete proc, not a modifier' treatment as Yinlin's S6/Calcharo's S6).",
  },
  {
    id: 'lingyang.chain.s6',
    source: SOURCE, kind: 'buff', section: 'Chain',
    trigger: { type: 'cast', on: 'Skill:Ancient Arts' },
    timing: { duration: 3 },
    target: { scope: 'self' },
    effects: [{ stat: 'basicDmg', value: 100, source: 'self-kit' }],
    note: "In Striding Lion state, during the first 3s after every Mountain Roamer, the Basic Attack DMG Bonus for Lingyang's NEXT Basic Attack is increased by 100% (confirmed exact) — the 'next Basic Attack only' scoping (vs. every Basic Attack within the window) isn't capturable by this flat schema, per the audit's own TODO; modeled as a flat 3s window instead.",
  },
];
