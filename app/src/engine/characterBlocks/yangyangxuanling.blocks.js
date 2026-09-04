// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — engine/characterBlocks/yangyangxuanling.blocks.js
// Yangyang: Xuanling converted to TriggerBlocks. Sourced from characters.js's
// already-audited CHAR_BUFF_TABLE['Yangyang: Xuanling'], RESONANCE_CHAIN_DATA
// ['Yangyang: Xuanling'], SKILL_MULTIPLIERS['Yangyang: Xuanling'], and
// CHARACTER_ROTATIONS['Yangyang: Xuanling']. No new numbers invented.
// Hush of a Thousand Voices is counted as Heavy Attack DMG per its own kit text
// despite being cast from the Liberation slot. Two real CHARACTER_ROTATIONS steps
// (Mid-air:Feather Fall, Basic ATK:Havoc in Bloom Stage 1-3) previously had NO
// matching SKILL_MULTIPLIERS row at all, silently dealing 0 DMG — fixed 2026-09-02
// against a fresh the source dump, both now modeled with real numbers (heavyDmg).
// ═══════════════════════════════════════════════════════════════════════════════

import { parseSkillMultiplierHits } from '../math/hitParser.js';

const SOURCE = 'Yangyang: Xuanling';

/** @type {import('../schema/block.schema.js').TriggerBlock[]} */
export const YANGYANG_XUANLING_BLOCKS = [
  // ── Damage blocks (from SKILL_MULTIPLIERS) ──
  {
    id: 'yangyangxuanling.intro.skybound-feather',
    source: SOURCE, kind: 'damage', section: 'Intro',
    trigger: { type: 'cast', on: 'Intro:Skybound Feather' },
    timing: {}, target: { scope: 'self' }, effects: [],
    // category/basis added for Layer 4 migration — were entirely missing (block previously silently
    // uncategorized). No override text names a different category, same default-to-skillDmg convention
    // applied project-wide for a generically-labeled opener hit.
    damage: { hits: parseSkillMultiplierHits('116.59%'), basis: 'ATK' },
    note: 'Applies 1 stack of Havoc Bane, grants 1 point of Azure Plume.',
  },
  {
    id: 'yangyangxuanling.basic.azure-sword-stance-stage1-4',
    source: SOURCE, kind: 'damage', section: 'BasicATK',
    trigger: { type: 'cast', on: 'Basic ATK:Azure Sword Stance Stage 1-4' },
    timing: {}, target: { scope: 'self' }, effects: [],
    // Row has separate Azure/Feather variant segments — the Azure variant matches this step.
    damage: { hits: parseSkillMultiplierHits('47.72% → 20.14%×2+60.41% → 30.21%+70.48% → 18.57%×2+148.49%'), category: 'basicDmg', basis: 'ATK' },
    note: 'Consumes Melody as it goes, Stage 4 applies another Havoc Bane stack.',
  },
  {
    id: 'yangyangxuanling.skill.sword-stance-switch',
    source: SOURCE, kind: 'damage', section: 'Skill',
    trigger: { type: 'cast', on: 'Skill:Sword Stance Switch' },
    timing: {}, target: { scope: 'self' }, effects: [],
    // Row has separate Azure/Feather variant segments for switching each direction — the Azure
    // segment is used as a representative value for both real casts (Azure->Feather and Feather->
    // Azure), since neither the rotation nor the row disambiguates per-direction damage precisely.
    damage: { hits: parseSkillMultiplierHits('69.95%+15.55%×3'), category: 'skillDmg', basis: 'ATK' },
    note: 'Switches Sword Stance, fires the new stance\'s Stage 1 automatically. Fires twice in the real rotation.',
  },
  {
    id: 'yangyangxuanling.heavy.feather-sword-stance',
    source: SOURCE, kind: 'damage', section: 'HeavyATK',
    trigger: { type: 'cast', on: 'Heavy ATK:Heavy Attack: Feather Sword Stance' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('21.71%+195.34%'), category: 'heavyDmg', basis: 'ATK' },
    note: 'Once Azure Plume is capped — applies 2 Havoc Bane stacks, grants Streaming Storm (+160% Crit DMG on the next few Feather-stance hits, see yangyangxuanling.selfbuff.bated-breath below), auto-chains into Mid-air Attack: Feather Fall (see block below).',
  },
  {
    id: 'yangyangxuanling.midair.feather-fall',
    source: SOURCE, kind: 'damage', section: 'HeavyATK',
    trigger: { type: 'cast', on: 'Mid-air:Feather Fall' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('14.80%×3+66.57%'), category: 'heavyDmg', basis: 'ATK' },
    note: 'Added 2026-09-02 against a fresh the source dump — this real CHARACTER_ROTATIONS step had no matching SKILL_MULTIPLIERS row at all, silently dealing 0 DMG. Consumes all Azure Plume, grants Hark the Wind (12s, upgrades Basic Attack to Havoc in Bloom).',
  },
  {
    id: 'yangyangxuanling.basic.havoc-in-bloom-stage1-3',
    source: SOURCE, kind: 'damage', section: 'BasicATK',
    trigger: { type: 'cast', on: 'Basic ATK:Havoc in Bloom Stage 1-3' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('39.79%×3 → 89.25%+66.94%×2 → 23.98%×5+279.69%'), category: 'heavyDmg', basis: 'ATK' },
    note: "Added 2026-09-02 against a fresh the source dump — this real CHARACTER_ROTATIONS step had no matching SKILL_MULTIPLIERS row at all, silently dealing 0 DMG. Replaces Basic Attack during Hark the Wind; considered Heavy Attack DMG despite the Basic Attack slot, per the kit's own text.",
  },
  {
    id: 'yangyangxuanling.liberation.hush-of-a-thousand-voices',
    source: SOURCE, kind: 'damage', section: 'Liberation',
    trigger: { type: 'cast', on: 'Liberation:Hush of a Thousand Voices' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('1988.10%'), category: 'heavyDmg', basis: 'ATK' },
    note: 'Counted as Heavy ATK DMG despite the Liberation slot. Consumes all Melody, restores 1 Azure Plume, maxes Havoc Bane on hit.',
  },
  {
    id: 'yangyangxuanling.heavy.azure-sword-stance',
    source: SOURCE, kind: 'damage', section: 'HeavyATK',
    trigger: { type: 'cast', on: 'Heavy ATK:Heavy Attack: Azure Sword Stance' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('135.16%×2+180.21%'), category: 'heavyDmg', basis: 'ATK' },
    note: 'Once Azure Plume is capped again — a big cyclone hit applying 2 more Havoc Bane stacks, can gain bonus Crit DMG from Bated Breath (see selfbuff below).',
  },
  {
    id: 'yangyangxuanling.outro.as-the-wind-wills',
    source: SOURCE, kind: 'damage', section: 'Outro',
    trigger: { type: 'swap-out' },
    timing: {}, target: { scope: 'self' }, effects: [],
    // category/basis added for Layer 4 migration — were entirely missing. Outro-slot cast, same
    // outroDmg convention already used for Sigrika/Xiangli Yao's own Outro damage blocks.
    damage: { hits: [{ atkPct: 300 }], basis: 'ATK' },
    note: 'Also grants every other teammate Tonal Switch for 20s (see the buff block below).',
  },

  // ── Buff blocks (from CHAR_BUFF_TABLE) ──
  {
    id: 'yangyangxuanling.outro.as-the-wind-wills-buff',
    source: SOURCE, kind: 'buff', section: 'Outro',
    trigger: { type: 'swap-out' },
    timing: { duration: 20 },
    target: { scope: 'whole-team' },
    condition: { element: 'havoc' },
    effects: [{ stat: 'elemDmg', value: 20, stacking: 'refresh', source: 'teammate-ally-action' }],
    note: "Havoc Bane appliers only, via As the Wind Wills — the 'only appliers benefit' gating isn't modeled (applied team-wide).",
  },
  {
    id: 'yangyangxuanling.selfbuff.feathered-oath',
    source: SOURCE, kind: 'buff', section: 'Buff',
    trigger: { type: 'passive' },
    timing: { duration: 4 },
    target: { scope: 'self' },
    effects: [{ stat: 'critDmg', value: 25, stacking: 'stacking', maxStacks: 6, source: 'self-kit' }],
    note: 'Feathered Oath, up to 6 stacks (150% max) — modeled as per-stack 25% x6 cap, matching the real stacking mechanic rather than a flat 150%.',
  },
  {
    id: 'yangyangxuanling.selfbuff.bated-breath',
    source: SOURCE, kind: 'buff', section: 'Buff',
    trigger: { type: 'cast', on: 'Heavy ATK:Heavy Attack: Azure Sword Stance' },
    timing: { duration: 999 }, // sentinel: gated once every 25s, no natural decay sourced beyond the gate
    target: { scope: 'self' },
    effects: [{ stat: 'critDmg', value: 160, source: 'self-kit' }],
    note: 'Bated Breath/Streaming Storm — Heavy ATK Crit DMG, once every 25s — the 25s gate is not modeled, kept passive on this Heavy ATK cast.',
  },
  {
    id: 'yangyangxuanling.selfbuff.unbroken-vow',
    source: SOURCE, kind: 'buff', section: 'Buff',
    trigger: { type: 'passive' },
    timing: { duration: 999 }, // sentinel: stacking condition, no natural decay sourced
    target: { scope: 'self' },
    effects: [{ stat: 'elemDmg', value: 36, source: 'self-kit' }],
    note: 'Inherent Skill Unbroken Vow: Havoc Bane DMG Amp, +10%/stack (1-3), +12%/stack (4-6), up to 36% at 6 stacks — modeled at the flat ceiling value rather than the real two-tier nonlinear per-stack curve, which this schema\'s single value+maxStacks stacking shape can\'t represent losslessly.',
  },

  // ── Resonance Chain blocks (from RESONANCE_CHAIN_DATA — no per-node detail beyond S2/S3's own
  //    confirmed-exact comment, S1/S4/S5/S6 flagged as unverified beyond their flat values) ──
  {
    id: 'yangyangxuanling.chain.s1',
    source: SOURCE, kind: 'damage', section: 'Chain',
    // Sword Stance Flow: Azure/Feather is the source's Forte-Circuit name for the same dash-cancel move
    // modeled elsewhere in this file (and in CHARACTER_ROTATIONS) as "Sword Stance Switch: Azure/
    // Feather" — the base Resonance Skill kit section never uses "Flow" at all, only "Switch", for
    // what's otherwise an identical Heavy-ATK-categorized stance-swap move. Gated on the same trigger
    // as yangyangxuanling.skill.sword-stance-switch above so this proc actually fires in her real
    // modeled rotation (which casts Sword Stance Switch twice), rather than a "Sword Stance Flow"
    // trigger string with no matching CHARACTER_ROTATIONS step that would silently never fire.
    trigger: { type: 'cast', on: 'Skill:Sword Stance Switch' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: [{ atkPct: 337.98 }], category: 'heavyDmg', basis: 'ATK' },
    note: "Corrected 2026-09-02 against a fresh the source dump (was a flat totalMult:10 buff, flagged unverified — not a real %-stat effect at all): S1 makes Sword Stance Flow/Switch summon Shadow of Xuanling: Unfaltering, a discrete 337.98% ATK Havoc DMG proc considered Heavy Attack DMG. Also Stagnates nearby enemies and grants 3 specific moves interruption immunity — pure utility, no DPS component, not modeled.",
  },
  {
    id: 'yangyangxuanling.chain.s2',
    source: SOURCE, kind: 'buff', section: 'Chain',
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'self' },
    effects: [{ stat: 'heavyDmg', value: 100, source: 'self-kit' }],
    note: 'Heavy/Mid-air/Havoc-in-Bloom DMG +100% (confirmed exact) — kept passive, applies to Heavy ATK-categorized blocks above.',
  },
  {
    id: 'yangyangxuanling.chain.s3',
    source: SOURCE, kind: 'buff', section: 'Chain',
    trigger: { type: 'cast', on: 'Liberation:Hush of a Thousand Voices' },
    timing: {}, target: { scope: 'self' },
    effects: [{ stat: 'heavyDmg', value: 175, source: 'self-kit' }],
    note: "Hush of a Thousand Voices' own DMG Multiplier +175% (confirmed exact) — cast-scoped (instant, no persistent duration). Corrected 2026-09-02 from libDmg to heavyDmg: the damage block this node scopes to (yangyangxuanling.liberation.hush-of-a-thousand-voices) is itself categorized heavyDmg (counted as Heavy Attack DMG per kit text), so a libDmg buff never actually applied to it — same bug class as Sigrika's S5, which this note used to cite as its own (also-buggy) precedent.",
  },
  // S4 corrected 2026-09-02 against a fresh the source dump: real effect is "casting Intro, Sword Stance
  // Switch: Azure/Feather, or Sword Stance Flow: Azure/Feather grants the WHOLE TEAM +20% ATK for
  // 20s" — was modeled as a passive Yangyang-only self-buff (target: 'self', trigger: 'passive'),
  // matching neither the real target (whole-team) nor the real trigger (specific casts). Split into
  // one block per real trigger (her kit only has one modeled name for both stance-switch directions
  // and for the Forte-Circuit-named "Flow" variant — see chain.s1's own note above), both refreshing
  // the same team-wide 20s buff rather than stacking.
  {
    id: 'yangyangxuanling.chain.s4-intro',
    source: SOURCE, kind: 'buff', section: 'Chain',
    trigger: { type: 'cast', on: 'Intro:Skybound Feather' },
    timing: { duration: 20 }, target: { scope: 'whole-team' },
    effects: [{ stat: 'atkPct', value: 20, stacking: 'refresh', source: 'self-kit' }],
  },
  {
    id: 'yangyangxuanling.chain.s4-switch',
    source: SOURCE, kind: 'buff', section: 'Chain',
    trigger: { type: 'cast', on: 'Skill:Sword Stance Switch' },
    timing: { duration: 20 }, target: { scope: 'whole-team' },
    effects: [{ stat: 'atkPct', value: 20, stacking: 'refresh', source: 'self-kit' }],
  },
  {
    id: 'yangyangxuanling.chain.s5',
    source: SOURCE, kind: 'utility', section: 'Chain', effects: [],
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'self' },
    note: 'S5 (fatal-blow save: no-down + heal 50% Max HP + 3s DMG/interruption immunity, once per 10 min) is purely survivability/utility — no DPS component per its own kit text. Was a fabricated totalMult:5, corrected 2026-09-02: independently confirmed via the source\'s own simulation, S4 and S5 produce byte-identical DMG/DPS (2,783,354 / 274,492 both).',
  },
  {
    id: 'yangyangxuanling.chain.s6',
    source: SOURCE, kind: 'buff', section: 'Chain',
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'self' },
    effects: [{ stat: 'heavyDmg', value: 40, source: 'self-kit' }],
    note: 'Flat value used as-is — no adjacent audit comment beyond the RESONANCE_CHAIN_DATA line itself, flagged as unverified. Kept passive.',
  },
];
