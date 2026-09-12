// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — engine/characterBlocks/jingran.blocks.js
// [CHARACTER · JINGRAN] Jingran's TriggerBlock set.
//
// Rewritten 2026-09-07 against a real nanoka.cc .mht browser snapshot (Data dump/Jingran/
// Jingran.md, confirmed genuine via its own Snapshot-Content-Location header), captured
// 7/September/2026, showing "Version 3.6 (live)" — his real kit is now released. This
// replaces the prior 2026-09-06 sparse version (written ~4 days before his real release,
// from already-present-but-unconfirmed characters.js data, per direct user instruction
// "make the Jingran block even incomplete, he gets released in 3 days"). Every value below
// traces to that dump; no new numbers invented.
//
// Real, sourced fixes this pass made vs. the prior version (full rationale in the dump's own
// "App Data Comparison" section):
//   1. jingran.skill.netherworld-traverse / jingran.skill.afterlifes-guide were skillDmg —
//      the dump is explicit both are "considered Heavy Attack DMG." Fixed to heavyDmg.
//   2. Basic ATK Stage 3/4 (both stances) are explicitly "dealing Heavy Attack DMG," Stage
//      1/2 are not — previously one combined basicDmg block per stance; split into
//      Stage 1-2 (basicDmg) / Stage 3-4 (heavyDmg) blocks per stance.
//   3. Mid-air Attack and both Dodge Counter variants (Nether Dive/Light Watch) were
//      entirely missing — added. Both Dodge Counter variants are explicitly "considered
//      Heavy Attack DMG."
//   4. RESONANCE_CHAIN_DATA['Jingran']'s S1/S3/S4/S5 were unsourced placeholders (no basis
//      in the real kit text) — zeroed in characters.js; S1/S2 rebuilt here as real
//      scopedToBlockId buffs (S1 scoped to its 4 named moves, 2 of which are heavyDmg not
//      skillDmg — an unscoped flat skillDmg buff would never reach them; S2 scoped to
//      Soul Raid/Stardome Meander only, since an unscoped heavyDmg buff would now also
//      wrongly hit Netherworld Traverse/Afterlife's Guide after fix #1 above). S3/S4/S5 are
//      real but have no representable DPS-stat form in this schema — documented as inert
//      utility blocks, not fabricated. S6's heavyDmg:40 was already correct; S6 also
//      carries 2 more real effects newly found (Chimei Wangliang DMG Multiplier +80%, and
//      the Parade of Thousand Souls proc mechanic) — both added.
//   5. Minor Fortes (Crit Rate+8%, HP%+12%) and both Inherent Skills (Hark the Dust, Trace
//      the Vestige) had no block at all — added, same completeness-pass convention as every
//      other converted character.
//
// Still correctly absent: CHARACTER_ROTATIONS['Jingran'] does not exist — the dump's own
// guide content for him has no rotation/combo/team section written yet (confirmed in the
// dump's own "Build" section). Not fabricated here. Because of that, Jingran is still NOT
// part of BLOCKS_BY_CHARACTER's whole-team allMembersConverted gate in calcTeamStats.js
// (`BLOCKS_BY_CHARACTER[m.name] && CHARACTER_ROTATIONS[m.name]`) — a team including him
// still falls back to the legacy per-member RAW-tier formula and legacy FULL-tier buff
// accumulation, exactly as before. This file exists so that gap closes automatically the
// moment a real rotation is sourced, without another from-scratch rewrite.
//
// Basis corrected 2026-09-12 against a fresh prydwen.gg build-guide snapshot (Data dump/Jingran/
// Jingran.md's own closing Meta-position paragraph): every damage.basis below was 'HP' (an
// unsourced inference modeled on Cartethyia's real HP-scaling kit) — the fresh dump explicitly
// states Jingran is "HP-CONVERTING (like Brant is with Energy Regen), not HP-scaling like
// Cartethyia — his multipliers apply to ATK, with HP only feeding the ATK-conversion and
// %-bonus passives." His own kit text ("Yang Changes, Yin Unites": flat ATK +36 per 1000 Max HP)
// already described an HP→ATK conversion passive, not a raw-HP damage basis — CONTRIBUTING.md's
// own basis-selection rule ("Only use 'HP'/'DEF' when the character's own kit text says
// explicitly the hit scales off that stat instead") was never actually satisfied for him. Fixed:
// every damage.basis below is now 'ATK' (the schema default), matching Brant's own ATK-basis
// HP-conversion blocks; the Outro was already correctly 'ATK'. CHARACTER_DATA['Jingran'].
// statScaling and its ROTATION_DATA/totalMult row in characters.js corrected to match in the same
// pass.
//
// Two real mechanics still have no home in this schema, honestly left unmodeled rather than
// guessed: (1) Soul Raid/Stardome Meander's Fire-of-Life-conditional HP-scaling DMG-increase
// component (a real, sourced per-1000-HP rate, but conditional on a depleting 100-cap
// resource with no `resourceGain`/`resourceStepOn` wiring built for it yet, and no
// CHARACTER_ROTATIONS to drive the simulation regardless); (2) Shadow Step's flat (non-%)
// `30+25` damage, explicitly immune to all DMG Bonus effects — not representable as a
// %-basis hit without guessing what stat the flat number scales from.
// ═══════════════════════════════════════════════════════════════════════════════

import { parseSkillMultiplierHits } from '../math/hitParser.js';

const SOURCE = 'Jingran';

/** @type {import('../schema/block.schema.js').TriggerBlock[]} */
export const JINGRAN_BLOCKS = [
  // ── Damage blocks (from SKILL_MULTIPLIERS['Jingran']) ──
  // Basic ATK — real stance-swap kit (Yin Vessel/Yang Font), split per-stance AND per the dump's own
  // "Stage 3/4 considered Heavy Attack DMG" override (Stage 1/2 stay Basic Attack DMG). Gated by
  // condition.requiresStance, same as the prior version — no CHARACTER_ROTATIONS exists yet to drive
  // real stance-selection timing.
  {
    id: 'jingran.basic.drink-soul-stage1-2',
    source: SOURCE, kind: 'damage', section: 'BasicATK',
    trigger: { type: 'cast', on: 'Basic ATK:Drink Soul Stage 1-2' },
    condition: { requiresStance: 'Yin Vessel' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('44.74% → 37.28%×2'), category: 'basicDmg', basis: 'ATK' },
    note: 'Yin Vessel Basic ATK, Stage 1-2 only — Basic Attack DMG per the dump (no override for these 2 stages, unlike Stage 3/4 below).',
  },
  {
    id: 'jingran.basic.drink-soul-stage3-4',
    source: SOURCE, kind: 'damage', section: 'HeavyATK',
    trigger: { type: 'cast', on: 'Basic ATK:Drink Soul Stage 3-4' },
    condition: { requiresStance: 'Yin Vessel' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('27.33%×4 → 45.95%×2+30.63%×2'), category: 'heavyDmg', basis: 'ATK' },
    note: 'Yin Vessel Basic ATK, Stage 3-4 — the dump is explicit both stages are "dealing Heavy Attack DMG" despite firing off the Basic Attack button; also each restores 50 Qi (resource, not modeled — no CHARACTER_ROTATIONS to drive gauge simulation yet).',
  },
  {
    id: 'jingran.basic.devils-bane-stage1-2',
    source: SOURCE, kind: 'damage', section: 'BasicATK',
    trigger: { type: 'cast', on: "Basic ATK:Devil's Bane Stage 1-2" },
    condition: { requiresStance: 'Yang Font' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('39.82% → 59.68%+39.79%'), category: 'basicDmg', basis: 'ATK' },
    note: "Yang Font Basic ATK, Stage 1-2 only — Basic Attack DMG per the dump.",
  },
  {
    id: 'jingran.basic.devils-bane-stage3-4',
    source: SOURCE, kind: 'damage', section: 'HeavyATK',
    trigger: { type: 'cast', on: "Basic ATK:Devil's Bane Stage 3-4" },
    condition: { requiresStance: 'Yang Font' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('47.73%×2+63.64% → 86.95%+12.43%×3'), category: 'heavyDmg', basis: 'ATK' },
    note: "Yang Font Basic ATK, Stage 3-4 — explicit \"dealing Heavy Attack DMG\" per the dump, same as Drink Soul's own Stage 3-4 above; each restores 50 Qi (not modeled).",
  },
  {
    id: 'jingran.midair.attack',
    source: SOURCE, kind: 'damage', section: 'BasicATK',
    trigger: { type: 'cast', on: 'Mid-air:Attack' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('92.45%'), category: 'basicDmg', basis: 'ATK' },
    note: 'Base Mid-air Attack, previously entirely missing. No override text — kept basicDmg per this schema\'s established mid-air convention.',
  },
  {
    id: 'jingran.basic.dodge-counter-nether-dive',
    source: SOURCE, kind: 'damage', section: 'HeavyATK',
    trigger: { type: 'cast', on: 'Dodge Counter:Nether Dive' },
    condition: { requiresStance: 'Yin Vessel' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('49.70%×4'), category: 'heavyDmg', basis: 'ATK' },
    note: 'Yin Vessel Dodge Counter, previously entirely missing — explicitly "considered Heavy Attack DMG" per the dump (not the usual Basic-ATK-family Dodge Counter convention). Restores 100 Qi (not modeled).',
  },
  {
    id: 'jingran.basic.dodge-counter-light-watch',
    source: SOURCE, kind: 'damage', section: 'HeavyATK',
    trigger: { type: 'cast', on: 'Dodge Counter:Light Watch' },
    condition: { requiresStance: 'Yang Font' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('74.57%+74.57%+99.43%'), category: 'heavyDmg', basis: 'ATK' },
    note: 'Yang Font Dodge Counter, previously entirely missing — explicitly "considered Heavy Attack DMG" per the dump. Restores 100 Qi (not modeled).',
  },
  // Skill row 1: the dump gives ONE shared %-string for both stance names — modeled as two blocks
  // (one per stance, for the same "which stance is active" gating as the Basic ATK pair above)
  // sharing that one sourced hit list.
  {
    id: 'jingran.skill.encroaching-yin',
    source: SOURCE, kind: 'damage', section: 'Skill',
    trigger: { type: 'cast', on: 'Skill:Encroaching Yin' },
    condition: { requiresStance: 'Yin Vessel' },
    timing: { cooldown: 15 }, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('65.61%+32.81%×3'), category: 'skillDmg', basis: 'ATK' },
    note: 'Yin Vessel Resonance Skill. Real 15s cooldown per the dump. Grants Cleanse of Impurity (4s, resource-economy, not modeled).',
  },
  {
    id: 'jingran.skill.scorching-yang',
    source: SOURCE, kind: 'damage', section: 'Skill',
    trigger: { type: 'cast', on: 'Skill:Scorching Yang' },
    condition: { requiresStance: 'Yang Font' },
    timing: { cooldown: 15 }, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('65.61%+32.81%×3'), category: 'skillDmg', basis: 'ATK' },
    note: 'Yang Font Resonance Skill, same shared multiplier row as Encroaching Yin. Real 15s cooldown per the dump.',
  },
  // Skill row 2 (Netherworld Traverse/Afterlife's Guide) — fixed 2026-09-07: was skillDmg, but the
  // dump is explicit both are "considered Heavy Attack DMG."
  {
    id: 'jingran.skill.netherworld-traverse',
    source: SOURCE, kind: 'damage', section: 'HeavyATK',
    trigger: { type: 'cast', on: 'Skill:Netherworld Traverse' },
    condition: { requiresStance: 'Yin Vessel' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('51.69%+25.85%×2+38.77%×4'), category: 'heavyDmg', basis: 'ATK' },
    note: 'Yin Vessel Resonance Skill Heavy Attack follow-up — the dump is explicit "considered Heavy Attack DMG" (fixed 2026-09-07 from a wrong skillDmg category). Needs Cleanse of Impurity to cast; restores 100 Qi (not modeled).',
  },
  {
    id: 'jingran.skill.afterlifes-guide',
    source: SOURCE, kind: 'damage', section: 'HeavyATK',
    trigger: { type: 'cast', on: "Skill:Afterlife's Guide" },
    condition: { requiresStance: 'Yang Font' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('65.87%×2+131.74%'), category: 'heavyDmg', basis: 'ATK' },
    note: "Yang Font Resonance Skill Heavy Attack follow-up — same real \"considered Heavy Attack DMG\" fix as Netherworld Traverse above.",
  },
  // Heavy ATK — the character's real Forte Circuit Heavy Attacks. HP-scaling DMG-increase component
  // (Fire of Life-gated, see file header) intentionally not modeled — real but not representable yet.
  {
    id: 'jingran.heavy.soul-raid',
    source: SOURCE, kind: 'damage', section: 'HeavyATK',
    trigger: { type: 'cast', on: 'Heavy ATK:Soul Raid' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('16.40%×2+21.09%×3+138.22%'), category: 'heavyDmg', basis: 'ATK' },
    note: 'Real Fire-of-Life-conditional HP-scaling DMG increase beyond this % row (see file header) not modeled. Switches to Yang Font on cast.',
  },
  {
    id: 'jingran.heavy.stardome-meander',
    source: SOURCE, kind: 'damage', section: 'HeavyATK',
    trigger: { type: 'cast', on: 'Heavy ATK:Stardome Meander' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('24.04%+24.04%+48.08%+144.22%'), category: 'heavyDmg', basis: 'ATK' },
    note: 'Same unmodeled Fire-of-Life-conditional HP-scaling caveat as Soul Raid above. Switches to Yin Vessel on cast, castable mid-air.',
  },
  {
    id: 'jingran.liberation.burial-of-thousand-souls',
    source: SOURCE, kind: 'damage', section: 'Liberation',
    trigger: { type: 'cast', on: 'Liberation:Burial of Thousand Souls' },
    timing: { cooldown: 25 }, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('93.15%×8'), category: 'heavyDmg', basis: 'ATK' },
    // category fixed 2026-09-07: the dump is explicit this is "considered Heavy Attack DMG" despite
    // the Liberation slot — was previously libDmg-categorized (an unconfirmed guess in the prior
    // sparse version, since no source text was available then).
    note: 'Considered Heavy Attack DMG per the dump\'s own kit text (fixed 2026-09-07 from a guessed libDmg category). Real 25s cooldown, 20 Concerto Regen. Enters 15s Yinghuo, grants 100 Fire of Life, reduces current HP to 50% Max HP if above it (resource/state effects, not modeled).',
    concertoEnergyGain: 20,
  },
  {
    id: 'jingran.forte.chimei-wangliang',
    source: SOURCE, kind: 'damage', section: 'Forte',
    trigger: { type: 'cast', on: 'Forte:Chimei Wangliang' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('83.51%'), category: 'heavyDmg', basis: 'ATK' },
    // category fixed 2026-09-07: the dump is explicit this proc is "considered Heavy Attack DMG" too
    // (previously left uncategorized in the prior sparse version, since no source text existed yet).
    note: 'Real text: "summon proc on Heavy ATK," considered Heavy Attack DMG per the dump. A Forte-summon proc firing once per Soul Raid/Stardome Meander cast while in Yinghuo — modeled as its own cast-triggered block (best available trigger shape absent a CHARACTER_ROTATIONS to drive a real windowed-proc simulation) rather than dependency-linked to the Heavy ATK blocks above.',
  },
  {
    id: 'jingran.intro.question-the-tombs',
    source: SOURCE, kind: 'damage', section: 'Intro',
    trigger: { type: 'cast', on: 'Intro:Question the Tombs' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('198.81%'), basis: 'ATK' },
    concertoEnergyGain: 10,
  },
  {
    id: 'jingran.outro.rising-fortune-and-ebbing-evil',
    source: SOURCE, kind: 'damage', section: 'Outro',
    trigger: { type: 'swap-out' },
    timing: {}, target: { scope: 'self' }, effects: [],
    // Basis 'ATK' — the dump's own row text explicitly says "795% of Jingran's ATK." This was
    // already correct before the 2026-09-12 file-wide basis fix above (see header comment); it's
    // the one row that always stated its own basis in plain text.
    damage: { hits: parseSkillMultiplierHits('795%'), basis: 'ATK' },
  },

  // ── Buff blocks (Minor Fortes, Inherent Skills) ──
  // Added 2026-09-07: "Minor Fortes: Crit Rate+8%, HP%+12%" (Data dump/Jingran/Jingran.md, sourced as
  // the sum of every Combat-Skill-tree Stat Bonus breakpoint the dump lists) — previously had no
  // block at all, same class of gap as every other converted character's own missing Minor Fortes.
  // hpPct is still a real base-kit stat (his HP% growth genuinely matters — it feeds the "Yang
  // Changes, Yin Unites"/S3 flat-ATK-from-HP conversion and his Max-HP-scaled Fusion DMG Bonus/
  // Incoming Healing Bonus passives) but, after the 2026-09-12 basis fix above, no longer directly
  // scales any damage.basis:'HP' hit in this file (there are none) — it's modeled here purely as
  // the real stat bonus itself, not as a damage-scaling lever.
  {
    id: 'jingran.buff.minor-fortes',
    source: SOURCE, kind: 'buff', section: 'Buff',
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'self' },
    effects: [
      { stat: 'critRate', value: 8, source: 'self-kit' },
      { stat: 'hpPct', value: 12, source: 'self-kit' },
    ],
    note: 'Minor Fortes: Crit Rate+8%, HP%+12% (Data dump/Jingran/Jingran.md). Unconditional, always active.',
  },
  // Added 2026-09-07: his 2 Inherent Skills, previously not referenced anywhere in this file — real,
  // sourced, kind:'utility' with effects:[] since neither has a representable DPS stat.
  {
    id: 'jingran.inherent.hark-the-dust',
    source: SOURCE, kind: 'utility', section: 'Buff',
    trigger: { type: 'passive' }, timing: {}, target: { scope: 'self' }, effects: [],
    note: 'Hark the Dust — casting Intro/Encroaching Yin/Scorching Yang grants Earth Charm: while active, dealing damage grants an unstackable Shield = 1.6% Max HP + 700 (5s, 0.5s ICD), or 0.8% Max HP + 350 while in Yinghuo. Purely defensive, no DPS component to model.',
  },
  {
    id: 'jingran.inherent.trace-the-vestige',
    source: SOURCE, kind: 'utility', section: 'Buff',
    trigger: { type: 'passive' }, timing: {}, target: { scope: 'self' }, effects: [],
    note: 'Trace the Vestige — Ghost Shroud/Fixation resource-economy utility (restores Ghost Shroud on combat entry, gains stacks when a teammate gains a Shield). Purely resource-management, no DPS component to model.',
  },

  // ── Resonance Chain blocks (from RESONANCE_CHAIN_DATA['Jingran'] + the dump's own S1-S6 text) ──
  // S1: real effect scoped to 4 named moves (2 skillDmg, 2 heavyDmg after fix #1 above) — rebuilt as
  // scopedToBlockId, replacing the prior unscoped/wrong-category flat skillDmg:80.
  {
    id: 'jingran.chain.s1',
    source: SOURCE, kind: 'buff', section: 'Chain',
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'self' },
    effects: [
      { stat: 'skillDmg', value: 80, scopedToBlockId: 'jingran.skill.encroaching-yin', source: 'self-kit' },
      { stat: 'skillDmg', value: 80, scopedToBlockId: 'jingran.skill.scorching-yang', source: 'self-kit' },
      { stat: 'heavyDmg', value: 80, scopedToBlockId: 'jingran.skill.netherworld-traverse', source: 'self-kit' },
      { stat: 'heavyDmg', value: 80, scopedToBlockId: 'jingran.skill.afterlifes-guide', source: 'self-kit' },
    ],
    note: 'Real scope: DMG Multipliers of Encroaching Yin, Netherworld Traverse, Scorching Yang, and Afterlife\'s Guide all +80% — scoped to exactly those 4 blocks (2 skillDmg, 2 heavyDmg after this file\'s own category fix). Also grants those 4 moves interruption immunity, utility, not modeled.',
  },
  // S2: real effect scoped to Soul Raid/Stardome Meander only — rebuilt as scopedToBlockId (an
  // unscoped heavyDmg:46 would now also wrongly hit Netherworld Traverse/Afterlife's Guide after
  // fix #1 recategorized those to heavyDmg).
  {
    id: 'jingran.chain.s2',
    source: SOURCE, kind: 'buff', section: 'Chain',
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'self' },
    effects: [
      { stat: 'heavyDmg', value: 46, scopedToBlockId: 'jingran.heavy.soul-raid', source: 'self-kit' },
      { stat: 'heavyDmg', value: 46, scopedToBlockId: 'jingran.heavy.stardome-meander', source: 'self-kit' },
    ],
    note: 'Real scope: DMG Multipliers of Soul Raid and Stardome Meander +46% — scoped to only those 2 blocks. While in Yinghuo, the Fire-of-Life-based HP-scaling DMG increase on those same 2 moves is ALSO +46% (not modeled, see file header). Also grants combat-entry Qi/Netherworld\'s Boon (resource economy, utility, not modeled).',
  },
  {
    id: 'jingran.chain.s3',
    source: SOURCE, kind: 'utility', section: 'Chain',
    trigger: { type: 'passive' }, timing: {}, target: { scope: 'self' }, effects: [],
    note: 'Real S3: casting Soul Raid/Stardome Meander grants +5 Ghost Shroud; casting Liberation upgrades the base "Yang Changes, Yin Unites" passive (flat ATK +36 per 1000 Max HP, cap +1800) to Yin-Yang Everflow (flat ATK +50 per 1000 Max HP, cap +2500) for 15s. A flat-ATK-from-HP conversion, not a %ATK stat — this schema has no flat-ATK-from-HP mechanism, so left honestly unmodeled rather than approximated as atkPct (the prior version\'s unsourced atkPct:15 has been zeroed in RESONANCE_CHAIN_DATA).',
  },
  {
    id: 'jingran.chain.s4',
    source: SOURCE, kind: 'utility', section: 'Chain',
    trigger: { type: 'passive' }, timing: {}, target: { scope: 'self' }, effects: [],
    note: 'Real S4: when ANY Resonator on the team gains a Shield, the WHOLE TEAM gains +20% All-Attribute DMG Bonus for 30s (matches CHAR_BUFF_TABLE[\'Jingran\'].note). Conditional on a "Resonator gains a Shield" event this schema has no trigger type for — left unmodeled rather than approximated as an unconditional buff. The prior version\'s unsourced totalMult:10 has been zeroed in RESONANCE_CHAIN_DATA.',
  },
  {
    id: 'jingran.chain.s5',
    source: SOURCE, kind: 'utility', section: 'Chain',
    trigger: { type: 'passive' }, timing: {}, target: { scope: 'self' }, effects: [],
    note: 'Real S5: on taking a fatal blow, gain a Shield = 50% Max HP for 15s instead of falling (10min ICD). Purely defensive, zero DPS component. The prior version\'s unsourced totalMult:5 has been zeroed in RESONANCE_CHAIN_DATA.',
  },
  {
    id: 'jingran.chain.s6',
    source: SOURCE, kind: 'buff', section: 'Chain',
    trigger: { type: 'passive' }, timing: {}, target: { scope: 'self' },
    effects: [{ stat: 'heavyDmg', value: 40, source: 'self-kit' }],
    note: "Real S6 (confirmed correct, unchanged): \"Targets take 40% more Heavy Attack DMG from Jingran\" — an enemy-side vulnerability on his Heavy ATK hits, stored on the shared heavyDmg slot, same convention as every other character's RESONANCE_CHAIN_DATA row. See jingran.chain.s6-chimei-mult and jingran.chain.s6-parade below for 2 more real S6 effects newly found in the dump.",
  },
  // Added 2026-09-07: newly-found real S6 effect — Chimei Wangliang's own DMG Multiplier +80%,
  // scoped to that one block.
  {
    id: 'jingran.chain.s6-chimei-mult',
    source: SOURCE, kind: 'buff', section: 'Chain',
    trigger: { type: 'passive' }, timing: {}, target: { scope: 'self' },
    effects: [{ stat: 'totalMult', value: 80, scopedToBlockId: 'jingran.forte.chimei-wangliang', source: 'self-kit' }],
    note: "S6: Chimei Wangliang's own DMG Multiplier +80% — scoped to jingran.forte.chimei-wangliang only.",
  },
  // Added 2026-09-07: newly-found real S6 mechanic — Parade of Thousand Souls, a real proc-style
  // damage block using Chimei Wangliang's own sourced multiplier, gated to sequence 6 (sN-suffixed id
  // per sequenceGating.js's own convention). No CHARACTER_ROTATIONS exists to drive a real
  // windowed-proc simulation (see file header) — modeled as its own cast-triggered block on Yinghuo
  // entry (Liberation cast) as the best available trigger shape, same "documented but currently
  // inert absent a rotation" treatment as every other damage block in this file.
  {
    id: 'jingran.chain.s6-parade',
    source: SOURCE, kind: 'damage', section: 'Chain',
    trigger: { type: 'cast', on: 'Liberation:Burial of Thousand Souls' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('83.51%'), category: 'heavyDmg', basis: 'ATK' },
    note: 'S6 Parade of Thousand Souls: upon entering Yinghuo (via Liberation cast), dealing damage summons an extra Chimei Wangliang (Fusion DMG, considered Heavy Attack DMG), up to 1/second, max 8 summons over the 15s Yinghuo window — the real per-second/8-cap proc timing is not modeled (no CHARACTER_ROTATIONS to drive it), so this is recorded as a single real-valued instance anchored to the Yinghuo-entry cast rather than fabricating a repeat-count. Gated to sequence 6.',
  },
];
