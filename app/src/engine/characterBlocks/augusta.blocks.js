// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — engine/characterBlocks/augusta.blocks.js
// Augusta converted to TriggerBlocks. Sourced from characters.js's already-audited
// CHAR_BUFF_TABLE['Augusta'], RESONANCE_CHAIN_DATA['Augusta'] (+ its own detailed
// 2026-08-31 audit comment, read directly for each node's real mechanic),
// SKILL_MULTIPLIERS['Augusta'], and CHARACTER_ROTATIONS['Augusta']. No new numbers
// invented. S6's real Thunder Rage add-on (2 separate 100%-ATK Electro Heavy-ATK
// hits) is modeled as a real proc-style damage block using the audit's own
// sourced figures, instead of the flat heavyDmg:200 approximation the table
// itself carries. The Outro's real "Majesty condition" (an extra Majesty +
// Crown of Wills stack if the same buffed partner Outros back to Augusta
// before a 3rd swap) is modeled via the engine's dedicated
// 'partner-outro-return' trigger type — see augusta.outro.battlesong and
// augusta.outro.majesty-condition below.
//
// Re-audited 2026-09-02 against a fresh the source.gg source dump (see
// characters.js's SKILL_MULTIPLIERS['Augusta'] for the full ratio verification):
// every damage block below was carrying the exact same value SKILL_MULTIPLIERS
// had — which was itself off by a consistent ~1.988x (roughly HALF the real
// value) across all 11 hits, the same "halving pattern" bug class already fixed
// for Camellya/Carlotta/Roccia/Phoebe/Brant, just missed for Augusta until now.
// Retightened every hit to the source's exact Lv.10 figures — a real, live-DPS-
// relevant fix, not cosmetic: this engine file feeds the actual damage calculator.
//
// Completeness pass 2026-09-06 (next character after Aemeath, alphabetically, same
// "verify against the real dump" discipline as Aalto/Aemeath): against `Data dump/
// Augusta/Augusta.md`, found and fixed the same class of gaps — Minor Fortes (Crit
// Rate+8%, ATK%+12%) had no block at all; concertoEnergyGain (Intro+10, Skill+10,
// Liberation+20, Undying Sunlight: Plunge+7) and real cooldowns (Warrior's Blade
// 15s, Sword of Eternal Oath 25s, Everbright Protector 3s) were entirely
// uncaptured; both Inherent Skills (Glory's Favor, Blazing Valor) had no block.
// Also added every real, sourced move from her base-kit combo string and Dodge
// Counter/Mid-air variants that SKILL_MULTIPLIERS['Augusta'] carries but had no
// block anywhere in this file (Hunter's Path 4-stage Basic combo, base Heavy ATK:
// Steelclash, Thunderoar: Uppercut, base Dodge Counter, Mid-air Attack, Mid-air
// Dodge Counter, Dodge Counter-Steelclash, Dodge Counter-Thunderoar: Backstep,
// Dodge Counter-Undying Sunlight: Strike) — none of these appear in
// CHARACTER_ROTATIONS['Augusta'] (her real optimal rotation never uses them, per
// the dump's own "confirmed unused in her real rotation" notes and Core Rotation
// text), so like Aalto's own inert-but-real blocks, these are present and
// sourced but don't fire in the standard modeled rotation.
// ═══════════════════════════════════════════════════════════════════════════════

import { parseSkillMultiplierHits } from '../math/hitParser.js';

const SOURCE = 'Augusta';

/** @type {import('../schema/block.schema.js').TriggerBlock[]} */
export const AUGUSTA_BLOCKS = [
  // ── Damage blocks (from SKILL_MULTIPLIERS) ──
  {
    id: 'augusta.intro.stride-of-goldenflare',
    source: SOURCE, kind: 'damage', section: 'Intro',
    trigger: { type: 'cast', on: 'Intro:Stride of Goldenflare' },
    timing: {}, target: { scope: 'self' }, effects: [],
    // category fixed 2026-09-02 against a fresh the source dump: the multiplier row is labeled generically
    // "Skill Damage" (not "Stride of Goldenflare DMG"), the same convention already confirmed on Lupa's
    // Try Focusing, Eh?/Ciaccona's Roaming with the Wind — a generic "Skill Damage" label means plain
    // Resonance Skill DMG.
    damage: { hits: parseSkillMultiplierHits('99.41%×2') , category: 'skillDmg', basis: 'ATK' },
    note: 'Fully restores Prowess and 20% Ascendancy.',
    // concertoEnergyGain added 2026-09-06 (completeness pass): dump's own "Concerto Regen: 10" row
    // for Stride of Goldenflare.
    concertoEnergyGain: 10,
  },
  {
    id: 'augusta.heavy.thunderoar-backstep',
    source: SOURCE, kind: 'damage', section: 'HeavyATK',
    trigger: { type: 'cast', on: 'Heavy ATK:Thunderoar: Backstep' },
    timing: {}, target: { scope: 'self' }, effects: [],
    // Row 'Thunderoar' has 3 slash-separated variants — the Backstep segment matches this step.
    damage: { hits: parseSkillMultiplierHits('53.68%'), category: 'heavyDmg' , basis: 'ATK' },
    note: 'Once Prowess is capped, replaces Heavy Attack — consumes all Prowess.',
  },
  {
    id: 'augusta.heavy.thunderoar-spinslash',
    source: SOURCE, kind: 'damage', section: 'HeavyATK',
    trigger: { type: 'cast', on: 'Heavy ATK:Thunderoar: Spinslash' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('141.72%×3'), category: 'heavyDmg' , basis: 'ATK' },
    note: 'Auto-chains off Backstep — a whirling follow-up hit. See augusta.chain.s6-thunder-rage below for the S6-granted bonus hits on this cast.',
  },
  {
    id: 'augusta.skill.warriors-blade',
    source: SOURCE, kind: 'damage', section: 'Skill',
    trigger: { type: 'cast', on: "Skill:Warrior's Blade" },
    // cooldown added 2026-09-06 (completeness pass): dump's own "Cooldown: 15s" row.
    timing: { cooldown: 15 }, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('218.70%×3'), category: 'skillDmg' , basis: 'ATK' },
    note: 'A dash-slam hit with a brief time-stop on cast, restores 10% Ascendancy.',
    // concertoEnergyGain added 2026-09-06: dump's own "Concerto Regen: 10" row for Warrior's Blade.
    concertoEnergyGain: 10,
  },
  {
    id: 'augusta.heavy.thunderoar-backstep-spinslash-repeat',
    source: SOURCE, kind: 'damage', section: 'HeavyATK',
    trigger: { type: 'cast', on: 'Heavy ATK:Thunderoar: Backstep → Spinslash' },
    timing: {}, target: { scope: 'self' }, effects: [],
    // 2nd Backstep-into-Spinslash pass, collapsed into one CHARACTER_ROTATIONS step — both segments
    // of the row combined.
    damage: { hits: [...parseSkillMultiplierHits('53.68%'), ...parseSkillMultiplierHits('141.72%×3')], category: 'heavyDmg' , basis: 'ATK' },
    note: 'Once Prowess refills, repeats the Backstep-into-Spinslash combo.',
  },
  {
    id: 'augusta.liberation.sword-of-eternal-oath',
    source: SOURCE, kind: 'damage', section: 'Liberation',
    trigger: { type: 'cast', on: 'Liberation:Sword of Eternal Oath' },
    // cooldown added 2026-09-06 (completeness pass): dump's own "Cooldown: 25s" row (also carries a
    // Resonance Cost of 125, which this schema has no field for — not modeled, same as elsewhere).
    timing: { cooldown: 25 }, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('32.99%×2 + 131.94%×3 + 32.99%×2 + 571.7%'), category: 'heavyDmg' , basis: 'ATK' },
    note: 'Counted as Heavy ATK DMG despite the Liberation slot. Restores the last 40% Ascendancy, capping it at 100%.',
    // concertoEnergyGain added 2026-09-06: dump's own "Concerto Regen: 20" row for Sword of Eternal Oath.
    concertoEnergyGain: 20,
  },
  {
    id: 'augusta.skill.undying-sunlight-strike',
    source: SOURCE, kind: 'damage', section: 'Skill',
    trigger: { type: 'cast', on: 'Skill:Undying Sunlight: Strike' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('139.17%×2'), category: 'skillDmg' , basis: 'ATK' },
    note: 'Once Ascendancy is capped, replaces Skill.',
  },
  {
    id: 'augusta.skill.undying-sunlight-leap',
    source: SOURCE, kind: 'damage', section: 'Skill',
    trigger: { type: 'cast', on: 'Skill:Undying Sunlight: Leap' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('222.67%+27.84%×2'), category: 'skillDmg' , basis: 'ATK' },
    note: 'Auto-chains off Strike.',
  },
  {
    id: 'augusta.skill.undying-sunlight-plunge',
    source: SOURCE, kind: 'damage', section: 'Skill',
    trigger: { type: 'cast', on: 'Skill:Undying Sunlight: Plunge' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('86.59%+779.24%'), category: 'heavyDmg' , basis: 'ATK' },
    note: 'Counted as Heavy ATK DMG. Consumes all Ascendancy, grants 1 Majesty stack.',
    // concertoEnergyGain added 2026-09-06 (completeness pass): dump's own "Concerto Regen: 7" row.
    concertoEnergyGain: 7,
  },
  {
    id: 'augusta.liberation.sunborne',
    source: SOURCE, kind: 'damage', section: 'Liberation',
    trigger: { type: 'cast', on: 'Liberation:Sublime is the Sun: Sunborne ×9' },
    timing: {}, target: { scope: 'self' }, effects: [],
    // Fixed 2026-09-02: was '119.29% ×9' (with a space before ×) — parseSkillMultiplierHits' token
    // regex requires × immediately after %, so the space silently dropped the ×9 count entirely,
    // producing a SINGLE hit instead of the 9 this block's own note (and its real kit) describes.
    damage: { hits: parseSkillMultiplierHits('119.29%×9'), category: 'heavyDmg' , basis: 'ATK' },
    note: '9 rapid Heavy ATK-type hits during the frozen time window of Sworn Allegiance.',
  },
  {
    // category corrected 2026-09-02 (final Augusta audit pass): had no `category` at all — the fresh
    // the source dump confirms "Deal Electro DMG, considered as Heavy Attack DMG", matching every other
    // Liberation-slot move in her kit (Sword of Eternal Oath, Sunborne — both already correctly tagged
    // heavyDmg above). This was the one omission.
    id: 'augusta.liberation.everbright-protector',
    source: SOURCE, kind: 'damage', section: 'Liberation',
    trigger: { type: 'cast', on: 'Liberation:Sublime is the Sun: Everbright Protector' },
    // cooldown added 2026-09-06 (completeness pass): dump's own "Cooldown: 3s" row.
    timing: { cooldown: 3 }, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('238.58% + 894.65% + 5.97%×10'), category: 'heavyDmg' , basis: 'ATK' },
    note: 'Ends Sworn Allegiance, consumes all Crown of Wills stacks, deploys Ruler\'s Realm.',
  },

  // Added 2026-09-06 (completeness pass): her base-kit Basic Attack combo string — a real, sourced
  // move with its own 4-stage multiplier row in SKILL_MULTIPLIERS['Augusta'], previously had no block
  // at all anywhere in this file. Not in CHARACTER_ROTATIONS['Augusta'] (her real optimal rotation
  // opens straight into the Thunderoar/Backstep combo, never a plain Basic ATK combo — matching the
  // dump's own Damage profile, which shows a genuine 0% Basic ATK share), so present and sourced but
  // inert, same "documented gap" status as Aalto's own inert blocks.
  {
    id: 'augusta.basic.hunters-path',
    source: SOURCE, kind: 'damage', section: 'BasicATK',
    trigger: { type: 'cast', on: "Basic ATK:Hunter's Path" },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('57.46% + 67.00%×2 + 65.61%×3 + 64.63%×3'), category: 'basicDmg', basis: 'ATK' },
    note: "Standard 4-stage combo string, builds toward Prowess/Ascendancy. Not in CHARACTER_ROTATIONS — real move, but her real optimal rotation never uses it (matches the dump's own 0% Basic ATK damage share).",
  },
  // Added 2026-09-06: base (non-Prowess-capped) Heavy Attack — replaced by the Thunderoar: Backstep
  // combo once Prowess caps, which is what actually fires in her modeled rotation instead.
  {
    id: 'augusta.heavy.steelclash',
    source: SOURCE, kind: 'damage', section: 'HeavyATK',
    trigger: { type: 'cast', on: 'Heavy ATK:Steelclash' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('46.39%×3'), category: 'heavyDmg', basis: 'ATK' },
    note: 'Base charged Heavy Attack combo, replaced by Thunderoar: Backstep once Prowess is capped. Not in CHARACTER_ROTATIONS — real move, but her real optimal rotation never uses it.',
  },
  // Added 2026-09-06: the dump's own Review text explicitly says her real combo goes Backstep into
  // Spinslash "NEVER Uppercut, which launches her airborne, undesirable since she wants to stay
  // grounded" — a sourced reason this specific Thunderoar variant is deliberately excluded from her
  // modeled rotation, not an oversight.
  {
    id: 'augusta.heavy.thunderoar-uppercut',
    source: SOURCE, kind: 'damage', section: 'HeavyATK',
    trigger: { type: 'cast', on: 'Heavy ATK:Thunderoar: Uppercut' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('178.93%×2'), category: 'heavyDmg', basis: 'ATK' },
    note: "Launches her airborne — the dump's own Review explicitly says her real rotation goes Backstep into Spinslash and NEVER Uppercut, since she wants to stay grounded. Deliberately excluded from CHARACTER_ROTATIONS for that sourced reason, not an oversight.",
  },
  // Added 2026-09-06: base Dodge Counter and its Mid-air Attack/Dodge Counter siblings — all three
  // share the same real multiplier rows in SKILL_MULTIPLIERS['Augusta'] and all three carry the
  // dump's own "confirmed unused in her real rotation" note.
  {
    id: 'augusta.basic.dodge-counter',
    source: SOURCE, kind: 'damage', section: 'BasicATK',
    trigger: { type: 'cast', on: 'Basic ATK:Dodge Counter' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('67.00%×2'), category: 'basicDmg', basis: 'ATK' },
    note: 'Post-Dodge Normal Attack. Not in CHARACTER_ROTATIONS — real move, but confirmed unused in her real rotation per the dump.',
  },
  {
    id: 'augusta.basic.midair-attack',
    source: SOURCE, kind: 'damage', section: 'BasicATK',
    trigger: { type: 'cast', on: 'Basic ATK:Mid-air Attack' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('59.65%×2'), category: 'basicDmg', basis: 'ATK' },
    note: 'Plunging Attack. Not in CHARACTER_ROTATIONS — real move, but confirmed unused in her real rotation per the dump.',
  },
  {
    id: 'augusta.basic.midair-dodge-counter',
    source: SOURCE, kind: 'damage', section: 'BasicATK',
    trigger: { type: 'cast', on: 'Basic ATK:Mid-air Dodge Counter' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('59.65%×2'), category: 'basicDmg', basis: 'ATK' },
    note: 'Post-mid-air-Dodge Plunging Attack. Not in CHARACTER_ROTATIONS — real move, but confirmed unused in her real rotation per the dump.',
  },
  // Added 2026-09-06: Dodge Counter variants of Steelclash/Thunderoar: Backstep — the dump's own kit
  // text says both are "considered Heavy Attack DMG" despite firing off a Dodge Counter input.
  {
    id: 'augusta.heavy.dodge-counter-steelclash',
    source: SOURCE, kind: 'damage', section: 'HeavyATK',
    trigger: { type: 'cast', on: 'Heavy ATK:Dodge Counter - Steelclash' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('46.39%×3'), category: 'heavyDmg', basis: 'ATK' },
    note: 'Replaces Dodge Counter at full Prowess, considered Heavy Attack DMG. Not in CHARACTER_ROTATIONS — real move, but confirmed unused in her real rotation per the dump.',
  },
  {
    id: 'augusta.heavy.dodge-counter-thunderoar-backstep',
    source: SOURCE, kind: 'damage', section: 'HeavyATK',
    trigger: { type: 'cast', on: 'Heavy ATK:Dodge Counter - Thunderoar: Backstep' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('53.68%'), category: 'heavyDmg', basis: 'ATK' },
    note: 'Replaces Dodge Counter and its Steelclash variant at full Ascendancy, considered Heavy Attack DMG, same Spinslash-chain window as base Backstep. Not in CHARACTER_ROTATIONS — real move, but confirmed unused in her real rotation per the dump.',
  },
  // Added 2026-09-06: Dodge Counter variant of Undying Sunlight: Strike — the dump's own kit text
  // says it's "considered Resonance Skill DMG" (not Heavy ATK, despite the Dodge Counter input),
  // matching base Strike's own skillDmg categorization above.
  {
    id: 'augusta.forte.dodge-counter-undying-sunlight-strike',
    source: SOURCE, kind: 'damage', section: 'Skill',
    trigger: { type: 'cast', on: 'Forte:Dodge Counter - Undying Sunlight: Strike' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('139.17%×2'), category: 'skillDmg', basis: 'ATK' },
    note: 'Grounded/mid-air Dodge Counter variant at full Ascendancy, considered Resonance Skill DMG, same Leap-chain rule as base Strike. Not in CHARACTER_ROTATIONS — real move, but confirmed unused in her real rotation per the dump.',
  },

  {
    id: 'augusta.outro.battlesong',
    source: SOURCE, kind: 'buff', section: 'Outro',
    trigger: { type: 'swap-out' },
    timing: { duration: 14 }, target: { scope: 'next-on-field' },
    // stat corrected 2026-09-01 (found via a recommendation-scoring audit that traced the same wrong
    // stat back into the live damage engine): this was 'elemDmg', silently scoping Battlesong of the
    // Unyielding to Electro-only teammates. Her own kit text is "+15% All-Attribute DMG Amp" — a real
    // damage engine gate difference existed here, matching the identical stale field CHAR_BUFF_TABLE.
    // Augusta already carried (note text there was corrected 2026-08-16 to say allDmg, but the field
    // itself never was) — meaning a non-Electro teammate receiving this outro was getting ZERO benefit
    // from it in the real Team-tab damage calculator, not just the recommendation scorer.
    effects: [{ stat: 'allDmg', value: 15, stacking: 'refresh', source: 'teammate-ally-action' }],
    note: 'Battlesong of the Unyielding. Ends immediately if the incoming Resonator is swapped off-field, not modeled. Also grants Augusta 1 Majesty stack. See augusta.outro.majesty-condition below for the conditional partner-Outro-return payoff.',
  },
  {
    id: 'augusta.outro.majesty-condition',
    source: SOURCE, kind: 'buff', section: 'Outro',
    trigger: { type: 'partner-outro-return', requiresActiveBlock: 'augusta.outro.battlesong', maxInterveningSwaps: 1 },
    timing: {}, target: { scope: 'self' },
    effects: [],
    note: 'The Majesty condition: if the same Resonator buffed by Battlesong of the Unyielding Outros back to Augusta before a 3rd swap, Augusta gains an extra Majesty stack AND an extra Crown of Wills stack. Stateful stack-count payoff, not a flat DPS-stat effect — effects intentionally empty; the trigger firing (see augusta.outro.battlesong\'s partner-outro-return window) is what this block records.',
  },

  // ── Buff blocks (from CHAR_BUFF_TABLE) ──
  {
    id: 'augusta.selfbuff.crown-of-wills-base',
    source: SOURCE, kind: 'buff', section: 'Buff',
    trigger: { type: 'passive' },
    timing: { duration: 99 }, // sentinel: base-kit passive, no natural decay sourced
    target: { scope: 'self' },
    effects: [{ stat: 'elemDmg', value: 15, source: 'self-kit' }],
    note: 'Crown of Wills: +15% Electro DMG Bonus per stack, max 1 stack at base kit (S0).',
  },
  // Added 2026-09-06 (completeness pass): "Minor Fortes: Crit Rate+8%, ATK%+12%" — a permanent,
  // always-on passive stat bonus unlocked via Forte-tree ascension, entirely separate from Crown of
  // Wills/Inherent Skills. Previously had no block anywhere in this file.
  {
    id: 'augusta.buff.minor-fortes',
    source: SOURCE, kind: 'buff', section: 'Buff',
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'self' },
    effects: [
      { stat: 'critRate', value: 8, source: 'self-kit' },
      { stat: 'atkPct', value: 12, source: 'self-kit' },
    ],
    note: 'Minor Fortes: Crit Rate+8%, ATK%+12% (Data dump/Augusta/Augusta.md). Unconditional, always active.',
  },

  // Added 2026-09-06 (completeness pass): her 2 Inherent Skills, previously not referenced anywhere
  // in this file — real, sourced, kind:'utility' with effects:[] since neither has a representable
  // DPS stat, same pattern as Aalto's/Aemeath's own inert Inherent Skill blocks.
  {
    id: 'augusta.inherent.glorys-favor',
    source: SOURCE, kind: 'utility', section: 'Buff',
    trigger: { type: 'passive' }, timing: {}, target: { scope: 'self' }, effects: [],
    note: "Glory's Favor — dealing damage grants a Shield = 350 + 2.5% Max HP for 5s (0.5s ICD, non-stackable, doesn't pass to an incoming Resonator). Purely defensive, no DPS component to model. S5 raises this shield's strength by 50% — see augusta.chain.s5's own note.",
  },
  {
    id: 'augusta.inherent.blazing-valor',
    source: SOURCE, kind: 'utility', section: 'Buff',
    trigger: { type: 'passive' }, timing: {}, target: { scope: 'self' }, effects: [],
    note: 'Blazing Valor — after 4s+ out of combat, gains (once per 4s): if Majesty < 1 stack, restore 1; fully restore Crown of Wills. Pure resource-management/opener-safety utility (the reason she starts every fight with 1 free Majesty stack, per the dump\'s own Review), no DPS component to model.',
  },

  // ── Resonance Chain blocks (from RESONANCE_CHAIN_DATA — see its own 2026-08-31 audit comment for
  //    each node's real mechanic) ──
  {
    id: 'augusta.chain.s1',
    source: SOURCE, kind: 'buff', section: 'Chain',
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'self' },
    effects: [{ stat: 'critDmg', value: 15, stacking: 'stacking', maxStacks: 2, source: 'self-kit' }],
    note: 'Crown of Wills +15% Crit DMG per stack (max stack raised 1->2) = 30% at 2 stacks (confirmed exact) — modeled as per-stack stacking rather than a flat 30%.',
  },
  {
    id: 'augusta.chain.s2',
    source: SOURCE, kind: 'buff', section: 'Chain',
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'self' },
    effects: [{ stat: 'critRate', value: 20, stacking: 'stacking', maxStacks: 2, source: 'self-kit' }],
    note: 'Crown of Wills +20% Crit Rate per stack (2 stacks = 40%) — modeled as per-stack stacking. Also converts excess Crit Rate over 100% into Crit DMG (up to +100% more at 150%+ CR), not modeled — flat critRate is the safe partial model per the audit\'s own reasoning.',
  },
  {
    id: 'augusta.chain.s3',
    source: SOURCE, kind: 'buff', section: 'Chain',
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'self' },
    // Fixed 2026-09-02 against a fresh the source dump: was a single unscoped totalMult effect — a prior
    // session's note claimed this was safe since "her only Heavy ATK hits anyway," but that's wrong:
    // totalMult applies unconditionally to EVERY hit regardless of category (calcEngine.js's `(1 +
    // stats.totalMult/100)` factor, not category-gated), so it was silently over-crediting her real
    // skillDmg hits too (Warrior's Blade, Undying Sunlight: Strike/Leap) and her Intro — none of which
    // are in S3's real move list. The kit text names exactly 6 moves: Thunderoar: Backstep/Spinslash/
    // Uppercut (+ their Dodge Counter equivalents), Undying Sunlight: Plunge, Sublime is the Sun:
    // Sunborne, and Sublime is the Sun: Everbright Protector — notably NOT Undying Sunlight: Strike/Leap
    // despite those being the same Forte family. Scoped via scopedToBlockId (Phase 0.5 gap #3's
    // mechanism) to each real block that fires in her modeled rotation; Uppercut has no block (never
    // used in the modeled rotation) so isn't listed.
    effects: [
      { stat: 'totalMult', value: 25, scopedToBlockId: 'augusta.heavy.thunderoar-backstep', source: 'self-kit' },
      { stat: 'totalMult', value: 25, scopedToBlockId: 'augusta.heavy.thunderoar-spinslash', source: 'self-kit' },
      { stat: 'totalMult', value: 25, scopedToBlockId: 'augusta.heavy.thunderoar-backstep-spinslash-repeat', source: 'self-kit' },
      { stat: 'totalMult', value: 25, scopedToBlockId: 'augusta.skill.undying-sunlight-plunge', source: 'self-kit' },
      { stat: 'totalMult', value: 25, scopedToBlockId: 'augusta.liberation.sunborne', source: 'self-kit' },
      { stat: 'totalMult', value: 25, scopedToBlockId: 'augusta.liberation.everbright-protector', source: 'self-kit' },
    ],
    note: '+25% DMG Multiplier specifically on Thunderoar: Backstep/Spinslash/Uppercut (+ Dodge Counter equivalents), Undying Sunlight: Plunge, and Sublime is the Sun: Sunborne/Everbright Protector — NOT a generic Heavy ATK buff (Undying Sunlight: Strike/Leap are excluded despite also being heavyDmg... actually skillDmg-categorized, and correctly excluded either way per the kit text\'s own explicit move list).',
  },
  {
    id: 'augusta.chain.s4-ascent-in-sun-and-glory',
    source: SOURCE, kind: 'buff', section: 'Chain',
    trigger: { type: 'cast', on: 'Intro:Stride of Goldenflare' },
    timing: { duration: 30 },
    target: { scope: 'whole-team' },
    effects: [{ stat: 'atkPct', value: 20, stacking: 'refresh', source: 'teammate-ally-action' }],
    note: 'Casting Intro Skill - Stride of Goldenflare grants the WHOLE TEAM +20% ATK for 30s (confirmed exact, team-wide).',
  },
  {
    // Zeroed 2026-09-02 (found while cross-checking a fresh the source source dump against this file):
    // was `totalMult: 15`, a fabricated number with the SAME "no basis in the node's own text" shape
    // this codebase's own rule elsewhere removes (see Brant's S1/Phrolova's S5, both zeroed for the
    // identical reason) — this node's own comment already admitted "not a real modeled effect," an
    // approximate DPS-uptime proxy standing in for a purely defensive stat (Glory's Favor shield value
    // +50%) with zero DPS component. That fabricated 15% was still live in this real damage-calculating
    // engine file (not just the legacy flat table), inflating any S5+ Augusta build's damage by a made-
    // up amount for a node that deals no damage at all.
    id: 'augusta.chain.s5',
    source: SOURCE, kind: 'utility', section: 'Chain',
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'self' }, effects: [],
    note: "Unshaken in Wrathful Tides: Inherent Skill Glory's Favor shield value +50% — purely defensive, no DPS component, not representable in this schema.",
  },
  {
    id: 'augusta.chain.s6-thunder-rage',
    source: SOURCE, kind: 'damage', section: 'Chain',
    trigger: { type: 'cast', on: 'Heavy ATK:Thunderoar: Spinslash' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: [{ atkPct: 100 }, { atkPct: 100 }], category: 'heavyDmg', basis: 'ATK' },
    note: 'Casting Thunderoar: Spinslash or Uppercut grants 2 Crown of Wills stacks (capped at 2 stacks/sec, not modeled) AND triggers Thunder Rage — 2 separate Electro Heavy-ATK hits at 100% ATK each (200% ATK total, on top of the move\'s own damage) — modeled as a real proc-style damage block using the audit\'s own sourced figures, instead of the flat heavyDmg:200 approximation RESONANCE_CHAIN_DATA itself carries (same "discrete proc, not a modifier" treatment as Yinlin\'s S6/Calcharo\'s S6). Also raises Crown of Wills max stacks 2->4 and the CR-over-150%->CD conversion (unmodeled, same caveat as S2), not represented here. See augusta.chain.s6-thunder-rage-repeat below for the SECOND Spinslash cast in her real modeled rotation — this block\'s own `trigger.on` only matches the FIRST cast\'s distinct rotation-step label.',
  },
  {
    // Added during a from-scratch Phase A redo (2026-09-04): CHARACTER_ROTATIONS['Augusta'] casts
    // Thunderoar: Spinslash TWICE per full rotation — once as its own step ('Heavy ATK:Thunderoar:
    // Spinslash', covered by augusta.chain.s6-thunder-rage above) and once as part of the combined
    // repeat step 'Heavy ATK:Thunderoar: Backstep → Spinslash' (see augusta.heavy.
    // thunderoar-backstep-spinslash-repeat). Trigger keys are matched by EXACT rotation-step label
    // (rotationSimulator.js's castKey = `cast:${type}:${skill}`), so the first block's trigger.on
    // never matches the second step's differently-worded label — Thunder Rage silently fired only
    // once per rotation in the live engine instead of twice, per the kit's own unconditional "Casting
    // Thunderoar: Spinslash or Thunderoar: Uppercut ALSO triggers Thunder Rage" text (no once-per-
    // rotation cap stated, only the separate 1s Crown-of-Wills-stack ICD, which doesn't gate this).
    // Same duplicate-trigger pattern as the S3 totalMult scoping already covering both Spinslash casts
    // via separate scopedToBlockId entries.
    id: 'augusta.chain.s6-thunder-rage-repeat',
    source: SOURCE, kind: 'damage', section: 'Chain',
    trigger: { type: 'cast', on: 'Heavy ATK:Thunderoar: Backstep → Spinslash' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: [{ atkPct: 100 }, { atkPct: 100 }], category: 'heavyDmg', basis: 'ATK' },
    note: 'Same Thunder Rage proc as augusta.chain.s6-thunder-rage, firing for the SECOND (repeat combo) Spinslash cast in her real modeled rotation instead of being silently dropped.',
  },
];
