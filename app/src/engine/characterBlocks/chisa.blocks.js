// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — engine/characterBlocks/chisa.blocks.js
// Chisa converted to TriggerBlocks. Sourced from characters.js's already-audited
// CHAR_BUFF_TABLE['Chisa'], RESONANCE_CHAIN_DATA['Chisa'] (+ its own audit comment,
// read directly for each node's real mechanic), SKILL_MULTIPLIERS['Chisa'], and
// CHARACTER_ROTATIONS['Chisa']. No new numbers invented. The Intro's own self-buff
// (+20% Havoc DMG/Healing, 12s) is sourced from CHARACTER_ROTATIONS' note text — it
// was entirely missing from CHAR_BUFF_TABLE['Chisa'].selfBuffs (empty array), a real
// omission caught by reading the rotation data directly rather than only the flat
// buff table. S3's real mechanic is not detailed anywhere in its own audit comment
// (unlike every other node in this row) — its flat totalMult:10 value is used as-is,
// documented as unverified rather than guessed at.
//
// Phase A audit (2026-09-04, REMAINING_WORK.md 1c) — genuine from-scratch re-audit against a
// fresh dump found several real bugs matching bug classes flagged elsewhere this session:
// (a) Death Snip was categorized basicDmg despite the dump's own kit text explicitly saying
// "Counted as Resonance Liberation DMG" — split off into its own libDmg-categorized block.
// (d) Sawring - Blitz 2-3, Sawring - Eradication (+ its ring-scalar twin), Serrated Loop, and the
// Intro all had NO damage.category at all despite being real sourced damage — Blitz/Eradication
// are explicitly "counted as Resonance Liberation DMG" per kit text (fixed to libDmg); Serrated
// Loop is a base Skill move with no override (fixed to skillDmg, the default for an uncategorized
// Skill-type move, same convention as Aalto/Calcharo/Buling's own Intro fixes); the Intro's own
// multiplier row is literally labeled "Skill DMG" in the dump (fixed to skillDmg, same exact
// pattern as those same three characters' Intro rows). These 4 missing categories also meant the
// libDmg-gated chain buffs below (S3 +120%, S5 +100%) were silently NOT applying to Blitz/
// Eradication/Death Snip at all before this fix — only to the Liberation ultimate itself.
// (c) chisa.chain.s1/chisa.debuff.thread-of-bane/chisa.chain.s6 were all triggered on 'cast:
// Skill:Eye of Unraveling' — but CHARACTER_ROTATIONS['Chisa'] (the Loop Rotation, Intro
// available) never casts base Skill at all, only Serrated Loop ('cast:Skill:Serrated Loop'),
// so these 3 Unseen-Snare-application blocks NEVER fired in the modeled rotation. The dump's own
// kit text confirms Unseen Snare is applied "via Skill hit, hitting shortly after Serrated Loop,
// [...] or simply locking onto a target" — retargeted to fire off Serrated Loop's cast instead,
// the move actually cast in the modeled rotation.
// (f) Rending Lunge (real, dump-sourced '15.11%×4+90.66%', a real always-cast step named in both
// the dump's Opener and Loop rotations, and already named in this file's own combined rotation
// step label) had no SKILL_MULTIPLIERS row and no hit data anywhere — silently dropped from every
// rotation pass despite this file's own prior note incorrectly claiming it was "not sourced
// anywhere." Added the row (characters.js) and its hits here.
// ═══════════════════════════════════════════════════════════════════════════════

import { parseSkillMultiplierHits } from '../math/hitParser.js';

const SOURCE = 'Chisa';

/** @type {import('../schema/block.schema.js').TriggerBlock[]} */
export const CHISA_BLOCKS = [
  // ── Damage blocks (from SKILL_MULTIPLIERS) ──
  {
    id: 'chisa.intro.reverberance-return',
    source: SOURCE, kind: 'damage', section: 'Intro',
    trigger: { type: 'cast', on: 'Intro:Reverberance - Return' },
    timing: {}, target: { scope: 'self' }, effects: [],
    // category added Phase A audit 2026-09-04: was uncategorized, silently rejecting Resonance Skill
    // DMG Bonus — the dump's own Intro multiplier table literally labels this row "Skill DMG", same
    // generic-labeling convention already fixed for Aalto/Calcharo/Buling's own Intro rows.
    damage: { hits: parseSkillMultiplierHits('95.43%'), category: 'skillDmg' , basis: 'ATK' },
  },
  {
    id: 'chisa.basic.stage2-rending-lunge',
    source: SOURCE, kind: 'damage', section: 'BasicATK',
    trigger: { type: 'cast', on: 'Basic ATK:Stage 2, Rending Lunge, Death Snip' },
    timing: {}, target: { scope: 'self' }, effects: [],
    // Stage 2 (from the 'Stage 1-2' row's 2nd segment) + Rending Lunge's own row, both real Basic
    // ATK DMG with no override text. Rending Lunge row added Phase A audit 2026-09-04 — was
    // entirely missing from SKILL_MULTIPLIERS despite being dump-sourced and named in this same
    // combined rotation step (bug class f).
    damage: { hits: [...parseSkillMultiplierHits('9.55%+19.09%+66.81%'), ...parseSkillMultiplierHits('15.11%×4+90.66%')], category: 'basicDmg' , basis: 'ATK' },
  },
  {
    id: 'chisa.basic.death-snip',
    source: SOURCE, kind: 'damage', section: 'BasicATK',
    trigger: { type: 'cast', on: 'Basic ATK:Stage 2, Rending Lunge, Death Snip' },
    timing: {}, target: { scope: 'self' }, effects: [],
    // Split off from the combined Stage2/Rending-Lunge block (Phase A audit 2026-09-04) — the dump's
    // own kit text is explicit: "Counted as Resonance Liberation DMG." Was wrongly folded into the
    // basicDmg block above, silently rejecting real teammate Liberation DMG Bonus (and missing the
    // libDmg-gated chain buffs, S3/S5 below) on a real, sizeable hit.
    damage: { hits: parseSkillMultiplierHits('29.81% + 14.91% + 104.34%') , category: 'libDmg', basis: 'ATK' },
  },
  {
    id: 'chisa.liberation.moment-of-nihility',
    source: SOURCE, kind: 'damage', section: 'Liberation',
    trigger: { type: 'cast', on: 'Liberation:Moment of Nihility' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('954.29%'), category: 'libDmg' , basis: 'ATK' },
    note: 'Also heals the team for 117.60% ATK and enters Woven Myriad - Convergence, neither modeled (no DPS component).',
  },
  {
    id: 'chisa.skill.serrated-loop',
    source: SOURCE, kind: 'damage', section: 'Skill',
    trigger: { type: 'cast', on: 'Skill:Serrated Loop' },
    timing: {}, target: { scope: 'self' }, effects: [],
    // category added Phase A audit 2026-09-04: was uncategorized, silently rejecting Resonance Skill
    // DMG Bonus — base Resonance Skill move with no "counted as X" override text, default skillDmg.
    damage: { hits: parseSkillMultiplierHits('17.45%×8'), category: 'skillDmg' , basis: 'ATK' },
    note: 'Non-hold variant used (rotation does not specify holding). At full Ring of Chainsaw, entering this enters Chainsaw Mode.',
  },
  {
    id: 'chisa.forte.sawring-blitz-2-3',
    source: SOURCE, kind: 'damage', section: 'Forte',
    trigger: { type: 'cast', on: 'Forte:Sawring - Blitz 2-3' },
    timing: {}, target: { scope: 'self' }, effects: [],
    // Row 'Sawring - Blitz 1-3' has 3 arrow-separated stages; this step starts from stage 2
    // (per its own "Blitz 2-3" label) through the end.
    // category added Phase A audit 2026-09-04: was uncategorized despite the dump's own kit text
    // being explicit — "Sawring - Blitz [...] counted as Resonance Liberation DMG" — silently
    // rejecting real teammate Liberation DMG Bonus (and the libDmg-gated S3/S5 chain buffs below)
    // on a large chunk of her real Chainsaw-state damage.
    damage: { hits: [...parseSkillMultiplierHits('10.64%×8'), ...parseSkillMultiplierHits('15.98%×8')], category: 'libDmg' , basis: 'ATK' },
    note: 'Stages 2-3 of the 3-stage Sawring - Blitz combo (Chainsaw Mode).',
  },
  {
    id: 'chisa.forte.sawring-eradication',
    source: SOURCE, kind: 'damage', section: 'Forte',
    trigger: { type: 'cast', on: 'Forte:Sawring - Eradication' },
    timing: {}, target: { scope: 'self' }, effects: [],
    // category added Phase A audit 2026-09-04: was uncategorized despite the dump's own kit text
    // being explicit — "Sawring - Eradication [...] Counted as Resonance Liberation DMG." — silently
    // rejecting real teammate Liberation DMG Bonus on her single biggest Forte hit.
    damage: { hits: parseSkillMultiplierHits('51.54% + 206.13%'), category: 'libDmg' , basis: 'ATK' },
    note: 'Real DMG also scales +2.59% per Ring of Chainsaw consumed, up to 100 — the per-Ring scalar is now modeled as chisa.forte.sawring-eradication-ring-scalar below (Phase 0.5 gap #7, fixed 2026-09-02), at the documented cap. Also grants the team a Shield, not modeled (no DPS component).',
  },
  {
    id: 'chisa.forte.sawring-eradication-ring-scalar',
    source: SOURCE, kind: 'damage', section: 'Forte',
    trigger: { type: 'cast', on: 'Forte:Sawring - Eradication' },
    timing: {}, target: { scope: 'self' }, effects: [],
    // the engine-merge history (git log) Phase 0.5 gap #7, fixed 2026-09-02: same proportional-second-hit pattern as
    // Denia's Dark Core scalar and gap #6 (Brant's S6 secondary blast) — a same-instant, same-category
    // hit scales in exact proportion through the shared multiplier chain. Eradication is cast after
    // consuming ALL remaining Ring of Chainsaw and ending Chainsaw Mode (dump: "Consumes all remaining
    // Ring of Chainsaw and ends Chainsaw Mode"), modeled at the documented 100-point cap: base hit sums
    // to 257.67% (51.54+206.13), ×2.59 (i.e. 2.59% per point × 100 points) = 667.365% additional hit.
    // category added Phase A audit 2026-09-04, same-category twin of the base Eradication hit above —
    // was also uncategorized (bug class d).
    damage: { hits: [{ atkPct: 667.365 }], category: 'libDmg', basis: 'ATK' },
    note: '+2.59% DMG Multiplier per Ring of Chainsaw consumed (up to 100), modeled at the documented cap (259% total, i.e. this hit = 2.59× the base hit).',
  },

  // ── Buff blocks (from CHAR_BUFF_TABLE, plus the Intro self-buff sourced from CHARACTER_ROTATIONS'
  //    own note text — real, but entirely missing from CHAR_BUFF_TABLE['Chisa'].selfBuffs) ──
  {
    id: 'chisa.selfbuff.reverberance-return',
    source: SOURCE, kind: 'buff', section: 'Intro',
    trigger: { type: 'cast', on: 'Intro:Reverberance - Return' },
    timing: { duration: 12 },
    target: { scope: 'self' },
    effects: [{ stat: 'elemDmg', value: 20, source: 'self-kit' }],
    note: 'Inherent Skill: Intro grants +20% Havoc DMG/Healing Bonus for 12s. Sourced from CHARACTER_ROTATIONS\' own Intro step note (only the Havoc DMG half is modeled — Healing Bonus has no stat key in this schema); was entirely absent from CHAR_BUFF_TABLE[\'Chisa\'].selfBuffs (empty array) before this read.',
  },
  {
    id: 'chisa.outro.unraveling-law-zero',
    source: SOURCE, kind: 'utility', section: 'Outro',
    trigger: { type: 'swap-out' },
    timing: { duration: 20 }, target: { scope: 'next-on-field' }, effects: [],
    note: 'Grants the incoming Resonator +3 max Negative Status/Electro Rage stacks for 20s — a resource-cap increase, not a %-stat buff, no DPS component representable in this schema.',
  },
  {
    id: 'chisa.debuff.thread-of-bane',
    source: SOURCE, kind: 'buff', section: 'Skill',
    trigger: { type: 'cast', on: 'Skill:Serrated Loop' },
    timing: { duration: 30 },
    target: { scope: 'whole-team' },
    effects: [{ stat: 'defIgnore', value: 18, stacking: 'refresh', source: 'teammate-ally-action' }],
    // trigger retargeted Phase A audit 2026-09-04 (bug class c): was 'cast:Skill:Eye of Unraveling',
    // but CHARACTER_ROTATIONS['Chisa'] (the Loop Rotation) never casts base Skill — only Serrated
    // Loop — so this never fired in the modeled rotation at all. The dump's own kit text confirms
    // Unseen Snare (this debuff's real activation condition) is applied "via Skill hit, hitting
    // shortly after Serrated Loop, [...] or simply locking onto a target" — retargeted to the move
    // actually cast in the modeled rotation.
    note: "Thread of Bane: only benefits teammates who themselves apply/deal Negative Status DMG — not modeled as a per-teammate condition (schema condition doesn't have a 'deals Negative Status DMG' gate), applied team-wide. Stored under CHAR_BUFF_TABLE's debuffs array by convention despite being an ally-side effect (mirrors the same defIgnore-as-ally-buff pattern used for Cantarella/Changli).",
  },
  {
    id: 'chisa.debuff.havoc-bane',
    source: SOURCE, kind: 'debuff', section: 'Buff',
    trigger: { type: 'on-hit' },
    timing: { duration: 2 },
    target: { scope: 'all-enemies' },
    effects: [{ stat: 'defShred', value: 2, stacking: 'stacking', maxStacks: 6 }],
    note: 'Havoc Bane: 1 stack (2% DEF Shred) per hit on an Unseen Snare target, up to 6 stacks (12% cap), refreshed every 2s — modeled as a real per-stack stacking debuff rather than the flat 12% cap total.',
  },

  // ── Resonance Chain blocks (from RESONANCE_CHAIN_DATA — see its own audit comment for each node's
  //    real mechanic where documented) ──
  {
    id: 'chisa.chain.s1',
    source: SOURCE, kind: 'buff', section: 'Chain',
    trigger: { type: 'cast', on: 'Skill:Serrated Loop' },
    timing: { duration: 99 }, // sentinel: conditional on the target carrying Unseen Snare, no natural decay sourced
    target: { scope: 'self' },
    effects: [{ stat: 'atkPct', value: 30, source: 'self-kit' }],
    // trigger retargeted Phase A audit 2026-09-04 (bug class c) — see chisa.debuff.thread-of-bane's
    // note for why 'Skill:Eye of Unraveling' never fired in the modeled Loop Rotation.
    note: 'ATK +30% on Unseen Snare (confirmed exact per the audit comment, NOT defShred as an earlier version of this table had it) — modeled as triggered by the Unseen Snare-applying cast.',
  },
  {
    id: 'chisa.chain.s2-alldmg',
    source: SOURCE, kind: 'buff', section: 'Chain',
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'whole-team' },
    effects: [{ stat: 'allDmg', value: 50, source: 'self-kit' }],
    note: 'Team +50% All-Attribute DMG for allies with Thread of Bane already active (confirmed exact per the audit comment) — the larger of S2\'s two real effects.',
  },
  {
    id: 'chisa.chain.s2-resshred',
    source: SOURCE, kind: 'debuff', section: 'Chain',
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'all-enemies' },
    effects: [{ stat: 'resShred', value: 10 }],
    note: "Havoc RES ignore +10% — the smaller of S2's two real effects, per the audit comment ('real 10% Havoc RES ignore is the smaller of two S2 effects'). RESONANCE_CHAIN_DATA['Chisa'].s2 only stores the larger allDmg:50 value; this second real, sourced number is used directly rather than left out, same pattern as Calcharo's S6.",
  },
  {
    id: 'chisa.chain.s3',
    source: SOURCE, kind: 'buff', section: 'Chain',
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'self' },
    effects: [{ stat: 'libDmg', value: 120, source: 'self-kit' }],
    note: "Corrected 2026-09-02 against a fresh the source dump (RESONANCE_CHAIN_DATA.Chisa.s3 fixed the same way): real effect is Sawring-Blitz/Chainsaw Mode Dodge Counter/Sawring-Eradication DMG Multiplier +120% (a 2nd copy of Woven Myriad-Convergence's own +120%). Those 3 moves are explicitly 'considered Resonance Liberation DMG' per her own kit text, so modeled as libDmg. The smaller secondary effect (a further +120% to just the Ring-of-Chainsaw consumption bonus) is left unmodeled, same as S2's own resShred/allDmg split above.",
  },
  // S4 correctly has NO block — per its own audit comment ('improves Havoc Bane trigger rate
  // (utility)'), S4's real effect is a proc-rate utility bonus with zero DPS component, despite
  // RESONANCE_CHAIN_DATA still storing a stale totalMult:10 for it (not force-fit into a block here,
  // same "don't fabricate a DPS number for a non-DPS effect" rule already applied elsewhere in this file).
  {
    id: 'chisa.chain.s5',
    source: SOURCE, kind: 'buff', section: 'Chain',
    trigger: { type: 'cast', on: 'Liberation:Moment of Nihility' },
    timing: {}, target: { scope: 'self' },
    effects: [{ stat: 'libDmg', value: 100, source: 'self-kit' }],
    note: "Moment of Nihility's own DMG Multiplier +100% (was totalMult:10 with no basis, corrected) — cast-scoped (instant, no persistent duration), same single-hit-scoped pattern as Calcharo's S5.",
  },
  {
    id: 'chisa.chain.s6',
    source: SOURCE, kind: 'debuff', section: 'Chain',
    trigger: { type: 'cast', on: 'Skill:Serrated Loop' },
    timing: { duration: 99 }, // sentinel: conditional on Unseen Snare-Finality state, no natural decay sourced
    target: { scope: 'all-enemies' },
    effects: [{ stat: 'deepen', value: 30 }],
    // trigger retargeted Phase A audit 2026-09-04 (bug class c) — see chisa.debuff.thread-of-bane's
    // note for why 'Skill:Eye of Unraveling' never fired in the modeled Loop Rotation.
    note: 'Unseen Snare-Finality: targets take 30% more Negative Status DMG (was deepen:15, wrong value, corrected) — an enemy-side debuff, modeled as triggered by the Unseen Snare-applying cast.',
  },
];
