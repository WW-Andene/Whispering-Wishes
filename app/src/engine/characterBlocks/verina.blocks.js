// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — engine/characterBlocks/verina.blocks.js
// Verina converted to TriggerBlocks. Sourced from characters.js's already-audited
// CHAR_BUFF_TABLE['Verina'], RESONANCE_CHAIN_DATA['Verina'] (+ its own detailed
// audit comment, read directly for each node's real mechanic), SKILL_MULTIPLIERS
// ['Verina'], and CHARACTER_ROTATIONS['Verina']. No new numbers invented. S1/S2/
// S3/S5 correctly have NO block — pure resource/healing-percent utility with zero
// DPS component, per the audit's own zeroing. Her real rotation cancels Botany
// Experiment's hit with the Liberation, so it deals no damage, and she has no
// Intro cast at all (the source rates it "unusable").
// ═══════════════════════════════════════════════════════════════════════════════

import { parseSkillMultiplierHits } from '../math/hitParser.js';

const SOURCE = 'Verina';

/** @type {import('../triggerBlocks.schema.js').TriggerBlock[]} */
export const VERINA_BLOCKS = [
  // ── Damage blocks (from SKILL_MULTIPLIERS) ──
  {
    id: 'verina.basic.cultivation-stage3-5',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Basic ATK:Cultivation Stage 1-5' },
    timing: {}, target: { scope: 'self' }, effects: [],
    // CHARACTER_ROTATIONS' own note says she swaps in cold with no Intro, starting the combo straight
    // at Stage 3 — only stages 3-5 of the row's 5-stage combo are used.
    damage: { hits: parseSkillMultiplierHits('25.58%×2 → 67.32% → 71.62%'), category: 'basicDmg' },
    note: 'Stage 5 on hit grants 1 Photosynthesis Energy.',
  },
  {
    id: 'verina.liberation.arboreal-flourish',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Liberation:Arboreal Flourish' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('198.81%'), category: 'libDmg' },
    note: '175 Energy, 25s cooldown. Heals the team (950 + 23.80% ATK), applies a 12s Photosynthesis Mark for Coordinated-Attack healing — not modeled (no DPS component).',
  },
  {
    id: 'verina.forte.starflower-blooms-midair',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Forte:Mid-air Attack: Starflower Blooms' },
    timing: {}, target: { scope: 'self' }, effects: [],
    // category fixed 2026-09-02 against a fresh, user-pasted the source text: was unset — the kit text
    // explicitly says "Mid-air Attack: Starflower Blooms deals Spectro DMG, considered as Basic Attack
    // damage" — confirmed basicDmg.
    damage: { hits: parseSkillMultiplierHits('67.64%+63.82%+30.50%×3'), category: 'basicDmg' },
    note: 'Consumes 1 Photosynthesis Energy (cap 4) per cast to heal the team (1188 + 29.75% ATK) and restore 12 Concerto Energy — not modeled (no DPS component).',
  },
  {
    id: 'verina.outro.blossom',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'swap-out' },
    timing: { duration: 30 }, target: { scope: 'whole-team' },
    effects: [{ stat: 'deepen', value: 15, stacking: 'refresh' }],
    note: 'Also heals the incoming Resonator 19% ATK/s for 6s, not modeled (no DPS component). Corrected 2026-09-02 against a fresh, user-pasted the source text (priority source): the kit text explicitly says "15% all-Type DMG Deepen for 30s" — was wrongly stat:\'allDmg\' (a prior session\'s note claimed "confirmed Amplified, not Deepen," but this file\'s own dmgFocus buff-tag entry (characters.js, structured combat-data table) already said [\'ATK Buff\', \'DMG Deepen\', \'Heal\'] — an internal contradiction the prior check missed). Fixed to deepen.',
  },

  // ── Buff blocks (from CHAR_BUFF_TABLE) ──
  {
    id: 'verina.libbuff.gift-of-nature',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'cast', on: 'Liberation:Arboreal Flourish' },
    timing: { duration: 20 },
    target: { scope: 'whole-team' },
    effects: [{ stat: 'atkPct', value: 20, stacking: 'refresh' }],
    note: 'Inherent Gift of Nature: team ATK +20%/20s on Forte/Liberation/Outro triggers — modeled anchored to the Liberation cast used in her real rotation.',
  },

  // ── Resonance Chain blocks (from RESONANCE_CHAIN_DATA — see its own detailed audit comment for each
  //    node's real mechanic; S1/S2/S3/S5 correctly have NO block — pure resource/healing-percent
  //    utility with zero DPS component, per the audit's own zeroing) ──
  // S1 correctly has NO block — Moment of Emergence's real effect has zero DPS component.
  // S2 correctly has NO block — Resonance Skill Botany Experiment additionally grants 1
  // Photosynthesis Energy and 10 Concerto Energy on cast, pure resource-economy.
  // S3 correctly has NO block — Healing of Liberation's Photosynthesis Mark +12%, pure heal% node.
  {
    id: 'verina.chain.s4',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'cast', on: 'Forte:Mid-air Attack: Starflower Blooms' },
    timing: { duration: 24 },
    target: { scope: 'whole-team' },
    condition: { element: 'spectro' },
    effects: [{ stat: 'elemDmg', value: 15, stacking: 'refresh' }],
    note: 'Casting Heavy/Mid-air Attack Starflower Blooms, Liberation, or Outro Blossom raises the whole team\'s Spectro DMG Bonus by 15% for 24s (confirmed exact, team-wide) — modeled anchored to the Starflower Blooms cast used in her real rotation.',
  },
  // S5 correctly has NO block — when Verina heals a team member below 50% HP, her Healing is
  // increased by 20% (conditional, non-DPS), zero DPS component.
  // Corrected 2026-09-02, 2nd pass: this block was `kind:'buff'`, `trigger:{type:'cast',...}`, no
  // `timing.duration` — the exact dead shape logged as an architecture-scale finding in Engine
  // development.md item 12 (found on Lupa's own S4). `resolveHitComposedDps.js`'s `statsAtInstant()`
  // only reads `passiveBlocks`/`buffWindows`, neither of which this shape matches — a silent no-op even
  // once its trigger cast is real. Converted to a real `kind:'damage'` proportional-2nd-hit block
  // instead, same pattern as Brant's S6/Denia's S4/Lupa's S4. Delta = Mid-air Starflower Blooms' own
  // base total (67.64+63.82+30.50×3 = 222.96) at +20% (×1.2 = 267.552) minus the base = 44.592.
  {
    id: 'verina.chain.s6',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Forte:Mid-air Attack: Starflower Blooms' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('44.592%'), category: 'basicDmg' },
    note: "S6: Heavy/Mid-air Attack Starflower Blooms deal 20% more DMG (confirmed exact), modeled as a proportional 2nd hit at the same instant as verina.forte.starflower-blooms-midair, same category. Also triggers a real Coordinated Attack + team heal on cast (equal to Liberation's Photosynthesis Mark values, 9.95% ATK DMG + 428 + 10.71% ATK heal) — added below as its own gated block.",
  },
  // Added 2026-09-02: S6's Coordinated Attack proc, previously entirely unmodeled (not just the dead
  // buff above — a real, separate additional hit). Value sourced from the same Coordinated Attack DMG
  // Liberation's Photosynthesis Mark already uses (9.95% ATK, confirmed identical per S6's own kit
  // text: "The DMG of this Coordinated Attack... [is] equal to those of the Resonance Liberation's
  // Photosynthesis Mark").
  {
    id: 'verina.chain.s6-coordinated-attack',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Forte:Mid-air Attack: Starflower Blooms' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('9.95%'), category: 'coordDmg' },
    note: 'S6: casting Heavy/Mid-air Attack Starflower Blooms triggers 1 Coordinated Attack (9.95% ATK Spectro DMG, same value as Liberation\'s own Photosynthesis Mark proc) and heals all nearby characters (heal not modeled, no DPS component).',
  },
];
