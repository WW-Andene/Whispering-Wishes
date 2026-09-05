// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — engine/characterBlocks/sigrika.blocks.js
// Sigrika converted to TriggerBlocks. Sourced from characters.js's already-audited
// CHAR_BUFF_TABLE['Sigrika'], RESONANCE_CHAIN_DATA['Sigrika'] (+ its own audit
// comment, read directly for each node's real mechanic), SKILL_MULTIPLIERS
// ['Sigrika'], and CHARACTER_ROTATIONS['Sigrika']. No new numbers invented. Her
// selfBuffs' real ER-scaling formula (erScale in CHAR_BUFF_TABLE, +2% Echo Skill
// DMG per 1% ER above 125%, capped at 50%) is modeled at its documented cap
// rather than the real formula, which this schema can't express.
//
// Full re-audit 2026-09-04 (Phase A, fresh dump, zero deference to prior claims) found and fixed two
// real bugs: (1) Runic Chain Whip was wrongly sourced from the 'Runic Outburst' SKILL_MULTIPLIERS row
// — the dump DOES publish a distinct multiplier for it (49.70%×4+66.26%×3), now its own row/block.
// (2) chain.s1's totalMult:15 was applied UNSCOPED to ALL of Sigrika's own damage, when the node's
// real effect ("+70% DMG Multiplier") only applies to 4 specific named moves — 2 of which
// (BIG BOOMY BOOM!, Soliskin to the Aid) had no damage block at all despite being in the dump's own
// multiplier tables, and a 3rd (Dodge Counter - Decipher) shares Elucidated's exact multipliers but
// was also entirely missing. All 4 now have their own blocks and chain.s1 is scopedToBlockId'd to
// exactly those 4 at the real, un-averaged 70% value. BIG BOOMY BOOM! / Soliskin to the Aid / Dodge
// Counter - Decipher are modeled here (real multipliers exist) but deliberately NOT added to
// CHARACTER_ROTATIONS — the dump's own Standard Rotation text never calls them (Divergent/Convergent
// routes her generated Runes into the Basic - Elucidated / Forte Heavy path instead), so adding them
// to the rotation would fabricate play the source doesn't document.
// ═══════════════════════════════════════════════════════════════════════════════

import { parseSkillMultiplierHits } from '../math/hitParser.js';

const SOURCE = 'Sigrika';

/** @type {import('../schema/block.schema.js').TriggerBlock[]} */
export const SIGRIKA_BLOCKS = [
  // ── Damage blocks (from SKILL_MULTIPLIERS) ──
  {
    id: 'sigrika.intro.solsworn-etymology',
    source: SOURCE, kind: 'damage', section: 'Intro',
    trigger: { type: 'cast', on: 'Intro:Solsworn Etymology' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('163.42%'), category: 'introDmg', basis: 'ATK' },
    note: 'Primes the next Basic ATK combo to start from Stage 2. category:introDmg added 2026-09-04 (fresh dump re-audit) — was missing entirely; the dump\'s own Damage Profile shows a real, distinct 0.8% Intro share.',
  },
  {
    id: 'sigrika.basic.stage2-4',
    source: SOURCE, kind: 'damage', section: 'BasicATK',
    trigger: { type: 'cast', on: 'Basic ATK:Stage 2-4' },
    timing: {}, target: { scope: 'self' }, effects: [],
    // Row 'Stage 1-4' has 4 arrow-separated stages; this step uses stages 2-4 (per its own label).
    damage: { hits: parseSkillMultiplierHits('50.34%×2 → 33.41%×2+44.54% → 41.36%+51.70%×2+62.03%'), category: 'basicDmg', basis: 'ATK' },
    note: 'Enters Decipher state for 5s on the last hit. Fires twice in the real rotation.',
  },
  {
    id: 'sigrika.basic.elucidated',
    source: SOURCE, kind: 'damage', section: 'BasicATK',
    trigger: { type: 'cast', on: 'Basic ATK:Elucidated' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('61.56%×3+123.11%'), category: 'echoDmg', basis: 'ATK' },
    note: 'Echo-type finisher from Decipher state; counted as Echo Skill DMG. Grants 1 Rune. Fires twice in the real rotation.',
  },
  {
    id: 'sigrika.forte.schemata-chain-whip',
    source: SOURCE, kind: 'damage', section: 'Forte',
    trigger: { type: 'cast', on: 'Forte:Heavy ATK: Schemata of Runes (Chain Whip)' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('49.70%×4+66.26%×3'), category: 'echoDmg', basis: 'ATK' },
    note: 'Consumes 2 Runes of the same type for Runic Chain Whip (Stagnates nearby targets, not modeled). Multiplier corrected 2026-09-04 (fresh dump re-audit) from the borrowed "Runic Outburst" row to its own real, distinct "Runic Chain Whip" SKILL_MULTIPLIERS row — the dump does publish a per-variant breakdown after all. Category: echoDmg — the kit text explicitly says "Heavy Attack - Schemata of Runes deals Echo Skill DMG" and Runic Chain Whip itself is "(considered Echo Skill DMG)"; a fresh the source dump\'s damage-output simulation shows Heavy at a genuine 0% share.',
  },
  {
    id: 'sigrika.skill.big-boomy-boom',
    source: SOURCE, kind: 'damage', section: 'Skill',
    trigger: { type: 'cast', on: 'Skill:BIG BOOMY BOOM!' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('28.81%×4+172.85%'), category: 'echoDmg', basis: 'ATK' },
    note: 'Added 2026-09-04 (fresh dump re-audit) — Decipher-state ground Skill-press upgrade, "(Echo Skill DMG)" per kit text, ends Decipher, grants Rune: Answer. Real multiplier already existed in SKILL_MULTIPLIERS but had no damage block. Not in CHARACTER_ROTATIONS — the dump\'s own Standard Rotation never routes into this move (Divergent/Convergent send generated Runes into the Basic - Elucidated/Forte Heavy path instead); modeled here solely because chain.s1 explicitly names it.',
  },
  {
    id: 'sigrika.skill.soliskin-to-the-aid',
    source: SOURCE, kind: 'damage', section: 'Skill',
    trigger: { type: 'cast', on: 'Skill:Soliskin to the Aid' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('27.83%×3+194.77%'), category: 'echoDmg', basis: 'ATK' },
    note: 'Added 2026-09-04 (fresh dump re-audit) — Decipher-state ground Skill-press upgrade at >=50 Full Stop, "(Echo Skill DMG)" per kit text, ends Decipher, grants Rune: Answer. Was entirely missing both a SKILL_MULTIPLIERS row and a damage block despite chain.s1 explicitly naming it. Not in CHARACTER_ROTATIONS for the same reason as BIG BOOMY BOOM! above.',
  },
  {
    id: 'sigrika.basic.dodge-counter-decipher',
    source: SOURCE, kind: 'damage', section: 'BasicATK',
    trigger: { type: 'cast', on: 'Dodge Counter:Decipher' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('61.56%×3+123.11%'), category: 'echoDmg', basis: 'ATK' },
    note: 'Added 2026-09-04 (fresh dump re-audit) — post-Dodge ground Normal Attack in Decipher state, same multipliers as Basic - Elucidated, "(Echo Skill DMG)" per kit text, ends Decipher, grants Rune: Trust. Was entirely missing both a SKILL_MULTIPLIERS row and a damage block despite chain.s1 explicitly naming it. Not in CHARACTER_ROTATIONS — the dump\'s Standard Rotation never calls for a Dodge mid-combo; modeled here solely because chain.s1 explicitly names it.',
  },
  {
    id: 'sigrika.liberation.where-trust-leads-me',
    source: SOURCE, kind: 'damage', section: 'Liberation',
    trigger: { type: 'cast', on: 'Liberation:Where Trust Leads Me!' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('861.43%'), category: 'echoDmg', basis: 'ATK' },
    note: 'Counted as Echo Skill DMG despite the Liberation slot. Grants Divergent for 20s (next Rune gain doubles into 2 Runes of opposite types), not modeled.',
  },
  {
    id: 'sigrika.forte.schemata-runic-outburst',
    source: SOURCE, kind: 'damage', section: 'Forte',
    trigger: { type: 'cast', on: 'Forte:Heavy ATK: Schemata of Runes (Runic Outburst)' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('117.67%+205.92%+264.75%'), category: 'echoDmg', basis: 'ATK' },
    note: 'Consumes 2 different-type Runes for Runic Outburst (pure bonus DMG, no extra effect). Category corrected 2026-09-02 from heavyDmg to echoDmg — same fix and reasoning as the Chain Whip block above.',
  },
  {
    id: 'sigrika.forte.learn-my-true-name',
    source: SOURCE, kind: 'damage', section: 'Forte',
    trigger: { type: 'cast', on: 'Forte:Learn My True Name' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('302.87%+908.61%'), category: 'echoDmg', basis: 'ATK' },
    note: 'Once Full Stop hits 100/100; her big Forte nuke finisher, counted as Echo Skill DMG.',
  },
  {
    id: 'sigrika.outro.in-this-very-moment',
    source: SOURCE, kind: 'damage', section: 'Outro',
    trigger: { type: 'swap-out' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: [{ atkPct: 795 }], category: 'outroDmg', basis: 'ATK' },
    note: 'Also grants Sigrika (if she re-enters) 2 stacks of Encapsulated for 30s, Stagnating targets whenever a nearby teammate casts their own Echo Skill — not modeled. category:outroDmg added 2026-09-04 (fresh dump re-audit) — was missing entirely; the dump\'s own Damage Profile shows a real, distinct 4.8% Outro share.',
  },

  // ── Buff blocks (from CHAR_BUFF_TABLE) ──
  {
    id: 'sigrika.selfbuff.aligned-names',
    source: SOURCE, kind: 'buff', section: 'Buff',
    trigger: { type: 'passive' },
    timing: { duration: 15 },
    target: { scope: 'self' },
    effects: [{ stat: 'echoDmg', value: 50, source: 'self-kit' }],
    note: 'Inherent Aligned Names 2: +2% Echo Skill DMG per 1% ER above 125% (up to 50%) — modeled at the documented cap value rather than the real ER-scaling formula, which this schema can\'t express.',
  },
  {
    id: 'sigrika.libbuff.blessing-of-runes-elemdmg',
    source: SOURCE, kind: 'buff', section: 'Buff',
    trigger: { type: 'passive' },
    timing: { duration: 99 }, // sentinel: refreshed by teammates' Echo Skill casts, no natural decay sourced
    target: { scope: 'whole-team' },
    condition: { element: 'aero' },
    effects: [{ stat: 'elemDmg', value: 48, source: 'self-kit' }],
    note: "Inherent True Names Aligned — Blessing of Runes, max 6 stacks (18% base + 30% at max): +48% Aero DMG to whichever Resonator is active, refreshed by teammates' Echo Skill casts — modeled at the max-stack value, team-wide.",
  },
  {
    id: 'sigrika.libbuff.blessing-of-runes-echodmg',
    source: SOURCE, kind: 'buff', section: 'Buff',
    trigger: { type: 'passive' },
    timing: { duration: 99 },
    target: { scope: 'whole-team' },
    effects: [{ stat: 'echoDmg', value: 48, source: 'self-kit' }],
    note: 'Same Blessing of Runes stacks as above, +48% Echo Skill DMG to the active Resonator — modeled at the max-stack value, team-wide.',
  },

  // ── Resonance Chain blocks (from RESONANCE_CHAIN_DATA — see its own audit comment for each node's
  //    real mechanic) ──
  {
    id: 'sigrika.chain.s1',
    source: SOURCE, kind: 'buff', section: 'Chain',
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'self' },
    effects: [
      { stat: 'totalMult', value: 70, scopedToBlockId: 'sigrika.basic.elucidated', source: 'self-kit' },
      { stat: 'totalMult', value: 70, scopedToBlockId: 'sigrika.basic.dodge-counter-decipher', source: 'self-kit' },
      { stat: 'totalMult', value: 70, scopedToBlockId: 'sigrika.skill.big-boomy-boom', source: 'self-kit' },
      { stat: 'totalMult', value: 70, scopedToBlockId: 'sigrika.skill.soliskin-to-the-aid', source: 'self-kit' },
    ],
    note: 'Corrected 2026-09-04 (fresh dump re-audit) — was an UNSCOPED totalMult:15, a "rotation-averaged" approximation that inflated ALL of Sigrika\'s own damage (Basic combo, Intro, Outro, every Forte hit) instead of only the 4 moves the node actually names: "Basic - Elucidated / Dodge Counter - Decipher / BIG BOOMY BOOM! / Soliskin to the Aid DMG Multipliers +70%". Now that all 4 have their own damage blocks, scoped via scopedToBlockId to exactly those 4 at the real, un-averaged 70% value — same unscoped-totalMult bug class already found and fixed on Jiyan/Phrolova/Qingxiao/Qiuyuan/Roccia. Known schema gap, documented honestly rather than hacked around: S1\'s node also grants (a) Interruption immunity while casting those same 3 Echo-type moves and (b) Encapsulated cap raised 2->3 with Outro granting 1 extra stack — neither is a DPS%-shaped effect this schema can express, and Encapsulated itself is not modeled anywhere in this file (see sigrika.outro.in-this-very-moment\'s own note), so both are left unmodeled rather than approximated.',
  },
  {
    id: 'sigrika.chain.s2',
    source: SOURCE, kind: 'buff', section: 'Chain',
    trigger: { type: 'cast', on: 'Forte:Learn My True Name' },
    timing: {}, target: { scope: 'self' },
    effects: [{ stat: 'echoDmg', value: 120, source: 'self-kit' }],
    note: "Learn My True Name's own DMG Multiplier +120% (considered Echo Skill DMG, confirmed exact) — cast-scoped (instant, no persistent duration).",
  },
  // S3 correctly has NO block — corrected 2026-09-02: Innate Gift stack cap raised to 4 (+ persists
  // through Learn My True Name cast/swap-out) is pure resource utility, zero DPS component, unlike
  // S1's genuine +70% multiplier that legitimately warrants a totalMult approximation.
  // RESONANCE_CHAIN_DATA['Sigrika'].s3 is now correctly {} to match.
  {
    id: 'sigrika.chain.s4',
    source: SOURCE, kind: 'buff', section: 'Chain',
    // Retrofitted 2026-09-02 (the engine-merge history (git log) Phase 0.5 gap #2), same pattern as Qingxiao's
    // chain.s4, using the dump's own exact text: "Any teammate's Echo Skill cast grants the whole
    // team +20% ATK for 20s." Casting an Echo isn't a per-character kit fact (any character can use
    // any equipped Echo), so this reads the new universal 'echo-skill-cast' action tag
    // (rotationSimulator.js, fired directly off any step's own {type:'Echo'} shape) rather than a
    // per-character appliesTags declaration. Was previously modeled as an unconditional, permanent,
    // passive team buff — wrong on two counts: wrong trigger (passive instead of ally-action) and
    // wrong duration (indefinite instead of the real 20s window).
    trigger: { type: 'ally-action', action: 'echo-skill-cast' },
    timing: { duration: 20 },
    target: { scope: 'whole-team' },
    effects: [{ stat: 'atkPct', value: 20, stacking: 'refresh', source: 'teammate-ally-action' }],
    note: "Any teammate's Echo Skill cast grants the whole team +20% ATK for 20s — confirmed verbatim from the dump.",
  },
  {
    id: 'sigrika.chain.s5',
    source: SOURCE, kind: 'buff', section: 'Chain',
    trigger: { type: 'cast', on: 'Liberation:Where Trust Leads Me!' },
    timing: {}, target: { scope: 'self' },
    effects: [{ stat: 'echoDmg', value: 30, source: 'self-kit' }],
    note: "Where Trust Leads Me!'s own DMG Multiplier +30% — cast-scoped (instant, no persistent duration). Corrected 2026-09-02 from libDmg to echoDmg: the damage block this node scopes to (sigrika.liberation.where-trust-leads-me, above) is itself categorized echoDmg (counted as Echo Skill DMG per kit text), so a libDmg buff never actually applied to it.",
  },
  {
    id: 'sigrika.chain.s6',
    source: SOURCE, kind: 'buff', section: 'Chain',
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'self' },
    effects: [{ stat: 'amplify', value: 30, source: 'self-kit' }],
    note: 'Targets take +30% more DMG from Sigrika (a flat DMG-taken debuff) — kept passive. Corrected 2026-09-02 from an unsourced defIgnore:15: the real primary S6 effect is this +30% amplify, not a DEF Ignore figure (a separate, smaller Innate Gift? enhancement grants +7.5%/stack DEF Ignore up to 30%, not modeled here, same documented-approximation limits as elsewhere in this file).',
  },
];
