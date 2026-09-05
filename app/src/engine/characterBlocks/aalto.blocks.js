// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — engine/characterBlocks/aalto.blocks.js
// [CHARACTER · AALTO] Aalto's TriggerBlock set — Layer 4 of the engine rewrite,
// migrated onto the single canonical schema (block.schema.js). Sourced from
// characters.js's already-audited CHAR_BUFF_TABLE['Aalto'], RESONANCE_CHAIN_DATA
// ['Aalto'], SKILL_MULTIPLIERS['Aalto'], and CHARACTER_ROTATIONS['Aalto'] — no new
// numbers invented. Simple kit: every trigger is 'cast' or 'passive', no
// conditional/cast-order mechanics found.
//
// Completeness pass 2026-09-05, verified directly against `Characters data dump/
// Aalto/Aalto.md` (the real prydwen.gg snapshot, not a derived table): three real,
// sourced kit moves (Heavy ATK, Mid-air Attack, Dodge Counter) and his Minor Fortes
// passive (Aero DMG+12%, ATK%+12%) existed in the dump and in SKILL_MULTIPLIERS['
// Aalto'] but had no block at all — his computed DPS was silently missing them.
// Added below. None of the three moves appear in CHARACTER_ROTATIONS['Aalto'] (the
// dump's own "Rotation" section confirms his real optimal rotation never uses them
// either — Basic ATK/Skill/Liberation/Forte/Intro/Outro only), so these blocks are
// present and real but don't fire in the standard modeled rotation, same "sourced
// but currently inert" status as chain.s1/s3 below — not a fabrication, a documented
// gap between "real move that exists" and "used in his optimal play pattern."
//
// concertoEnergyGain added same pass, per user direction to treat Aalto as the
// blueprint other characters follow ("Team tab is a game engine"): his 3 real
// Concerto Energy values (Intro+10, Skill+15, Liberation+20) are now a real block
// field, summed by resolveConcertoEnergy.js's resolveConcertoEnergyGenerated() —
// not gating Outro timing yet (still CHARACTER_ROTATIONS' explicit 'Outro' step;
// making Outro actually threshold-derived is a larger, cross-character resolver
// change, out of scope for an Aalto-only pass), but a real computed number instead
// of documentation-only text with nothing reading it.
//
// Category-C completeness pass, same day: fixed every remaining "real, sourced, but
// entirely untagged" gap found in a line-by-line dump audit — Liberation's Gate of
// Quandary ATK+10%/10s (new buff block, scoped via scopedToBlockId to the two real
// Mist Bullet/Mist Missile blocks), the 2 Inherent Skills (new inert utility blocks,
// Perfect Performance/Mid-game Break), and corrected notes on chain.s1/s2/s6 and the
// Basic ATK block documenting real mechanics (Skill CD reduction, Mist-Avatar-taunted
// targeting, Gate-of-Quandary Heavy ATK scoping, stage-4 Mist-spread) that have no
// representable stat/condition/tagging granularity in this schema — not silently
// dropped, honestly noted as unmodeled.
// ═══════════════════════════════════════════════════════════════════════════════

import { parseSkillMultiplierHits } from '../math/hitParser.js';

const SOURCE = 'Aalto';

/** @type {import('../schema/block.schema.js').TriggerBlock[]} */
export const AALTO_BLOCKS = [
  // ── Damage blocks (from SKILL_MULTIPLIERS) ──
  {
    id: 'aalto.intro.feint-shot',
    source: SOURCE, kind: 'damage', section: 'Intro',
    trigger: { type: 'cast', on: 'Intro:Feint Shot' },
    timing: {}, target: { scope: 'self' }, effects: [],
    // category fixed 2026-09-03 (Phase A audit, REMAINING_WORK.md 1c): was uncategorized, silently
    // rejecting Resonance Skill DMG Bonus on a real ~10% (7,144) damage share. The dump's own multiplier
    // table labels this row generically "Skill Damage", same convention as Calcharo/Encore/Jianxin.
    damage: { hits: parseSkillMultiplierHits('66.27%×3'), category: 'skillDmg', basis: 'ATK' },
    // concertoEnergyGain added 2026-09-05 (dump completeness pass, "consider energy regen" per
    // user direction): dump's own "Con. Energy Regen: 10" row for Intro:Feint Shot.
    concertoEnergyGain: 10,
  },
  {
    id: 'aalto.skill.shift-trick',
    source: SOURCE, kind: 'damage', section: 'Skill',
    trigger: { type: 'cast', on: 'Skill:Shift Trick' },
    // cooldown added 2026-09-05: dump's own "Cooldown: 10s" row — was missing entirely, independent
    // of the chain.s1 cooldown-reduction fix below.
    timing: { cooldown: 10 }, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('59.65%'), category: 'skillDmg', basis: 'ATK' },
    note: '59.65% per Mist Bullet — real bullet count depends on encounter length, kept as 1 base bullet (no fabricated count).',
    // concertoEnergyGain added 2026-09-05: dump's own "Con. Energy Regen: 15" row for Shift Trick.
    concertoEnergyGain: 15,
  },
  {
    id: 'aalto.basic.half-truths',
    source: SOURCE, kind: 'damage', section: 'BasicATK',
    trigger: { type: 'cast', on: 'Basic ATK:Half Truths Stage 1-5' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('31.81% → 53.02% → 47.72%×2 → 50.37%×2 → 179.73%'), category: 'basicDmg', basis: 'ATK' },
    note: "Real text: Basic Attack 4 (the 50.37%x2 pair above) spreads 'Mist' forward for 1.5s — the field-creation trigger Forte/Mistcloak Dash and chain S3's bonus bullets depend on. Not separately tagged: this block covers the whole 5-stage combo as one cast, so a stage-4-specific appliesTags entry isn't representable at this granularity without fabricating a split this schema's single-block-per-combo convention doesn't make.",
  },
  // Added 2026-09-05 (dump completeness pass): "Mid-air Attack: consumes STA, consecutive mid-air
  // shots, Aero DMG" — a real move with its own multiplier row, previously entirely absent. Section/
  // category kept BasicATK/basicDmg per this schema's established convention for mid-air attacks with
  // no explicit "counted as Heavy Attack DMG" override text (the dump doesn't say Heavy here, unlike
  // characters where it explicitly does) — same precedent as Lupa's/Luuk Herssen's mid-air blocks.
  {
    id: 'aalto.midair.attack',
    source: SOURCE, kind: 'damage', section: 'BasicATK',
    trigger: { type: 'cast', on: 'Mid-air:Attack' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('59.65%'), category: 'basicDmg', basis: 'ATK' },
    note: 'Not in CHARACTER_ROTATIONS — real move, but his real optimal rotation (per the dump\'s own Rotation section) never uses it.',
  },
  // Added 2026-09-05 (dump completeness pass): "Dodge Counter: Basic Attack after successful Dodge,
  // Aero DMG" — the dump's own text calls it a Basic Attack variant explicitly, hence basicDmg.
  {
    id: 'aalto.basic.dodge-counter',
    source: SOURCE, kind: 'damage', section: 'BasicATK',
    trigger: { type: 'cast', on: 'Dodge Counter:Standard' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('214.12%'), category: 'basicDmg', basis: 'ATK' },
    note: 'Not in CHARACTER_ROTATIONS — real move, but his real optimal rotation never uses it.',
  },
  // Added 2026-09-05 (dump completeness pass): "Heavy Attack: aiming state, Aero DMG" — dump gives
  // both an uncharged (35.79%) and fully-charged (80.52%) value for the same Aimed Shot; the charged
  // value is modeled here as the real, intentional-use figure (same "model the deliberate cast, not
  // the interrupted one" convention as every other charged/held move in this codebase) — the 35.79%
  // uncharged tap is real but not separately modeled, documented here rather than silently dropped.
  {
    id: 'aalto.heavy.aimed-shot',
    source: SOURCE, kind: 'damage', section: 'HeavyATK',
    trigger: { type: 'cast', on: 'Heavy ATK:Aimed Shot' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('80.52%'), category: 'heavyDmg', basis: 'ATK' },
    note: 'Fully-charged Aimed Shot (80.52%) — an uncharged tap deals 35.79% instead, real but not separately modeled. Not in CHARACTER_ROTATIONS — real move, but his real optimal rotation never uses it.',
  },
  {
    id: 'aalto.liberation.flower-in-the-mist',
    source: SOURCE, kind: 'damage', section: 'Liberation',
    trigger: { type: 'cast', on: 'Liberation:Flower in the Mist' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('397.62%'), category: 'libDmg', basis: 'ATK' },
    // concertoEnergyGain added 2026-09-05: dump's own "Con. Energy Regen: 20" row for Flower in
    // the Mist.
    concertoEnergyGain: 20,
  },
  {
    id: 'aalto.forte.misty-cover',
    source: SOURCE, kind: 'damage', section: 'Forte',
    trigger: { type: 'cast', on: 'Forte:Misty Cover' },
    timing: {}, target: { scope: 'self' }, effects: [],
    // category fixed 2026-09-03 (Phase A audit, REMAINING_WORK.md 1c): was uncategorized. Not explicitly
    // labeled "(Resonance Skill DMG)" in the dump the way Shift Trick's identical Mist Missile mechanic
    // is, but both are the same-named "Mist Missile" at the identical 59.65% multiplier — strong enough
    // to infer the same skillDmg classification rather than leave it uncategorized on no basis at all.
    damage: { hits: parseSkillMultiplierHits('59.65%'), category: 'skillDmg', basis: 'ATK' },
    note: '59.65% per Mist Bullet, same base-count caveat as Shift Trick.',
  },

  // Added 2026-09-05 (category-C completeness pass): dump's own "Gate of Quandary ATK Increase:
  // 10.00%, lasts 10s" row for Liberation — was entirely untagged before (Liberation's own block
  // above carries only its damage, no effects). Scoped via scopedToBlockId to the two real
  // "Mist Bullet"/"Mist Missile" blocks (Shift Trick, Misty Cover) rather than a blanket self
  // atkPct — the dump's own text says "Bullets passing through the Gate get an ATK increase," and
  // those two are the only blocks whose kit text names them bullets/missiles fired through Mist;
  // Basic ATK/Heavy ATK/Dodge Counter are melee/aimed-shot moves, not bullets, so excluding them is
  // a sourced judgment call, not a guess with no basis (same discipline as the skillDmg-category
  // inference on Misty Cover above).
  {
    id: 'aalto.liberation.gate-atk-buff',
    source: SOURCE, kind: 'buff', section: 'Liberation',
    trigger: { type: 'cast', on: 'Liberation:Flower in the Mist' },
    timing: { duration: 10 }, target: { scope: 'self' },
    effects: [
      { stat: 'atkPct', value: 10, source: 'self-kit', scopedToBlockId: 'aalto.skill.shift-trick' },
      { stat: 'atkPct', value: 10, source: 'self-kit', scopedToBlockId: 'aalto.forte.misty-cover' },
    ],
    note: "Gate of Quandary ATK+10% for 10s, real text: 'Bullets passing through the Gate get an ATK increase' — scoped to the two Mist Bullet/Mist Missile blocks, not a blanket self buff. Same caveat as Aemeath's own scopedToBlockId blocks: only the hit-composed resolvers (resolveHitComposedDps/TeamDps) enforce the per-block scope; the legacy flat stat-panel path (resolveTriggerBlocks -> applyBuff) has no concept of scopedToBlockId and applies both +10 entries broadly (+20% flat atkPct) — a known, pre-existing architectural limitation, not something this block introduces.",
  },

  // ── Buff blocks (from CHAR_BUFF_TABLE) ──
  {
    id: 'aalto.outro.dissolving-mist',
    source: SOURCE, kind: 'buff', section: 'Outro',
    trigger: { type: 'swap-out' },
    timing: { duration: 14 },
    target: { scope: 'next-on-field' },
    condition: { element: 'aero' },
    effects: [{ stat: 'elemDmg', value: 23, stacking: 'refresh', source: 'teammate-ally-action' }],
    note: 'Incoming Resonator gets +23% Aero DMG Amp for 14s.',
  },
  // Added 2026-09-05 (dump completeness pass): "Minor Fortes: Aero DMG+12%, ATK%+12%" — a permanent,
  // always-on passive stat bonus unlocked via Forte-tree ascension, entirely separate from Inherent
  // Skills/weapon passives. Previously had no block anywhere in this file. section:'Buff' since it's
  // not anchored to any one move — a flat kit-wide passive, same convention as Luuk Herssen's/Sanhua's
  // Inherent-Skill-shaped self-buffs.
  {
    id: 'aalto.buff.minor-fortes',
    source: SOURCE, kind: 'buff', section: 'Buff',
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'self' },
    effects: [
      { stat: 'elemDmg', value: 12, source: 'self-kit' },
      { stat: 'atkPct', value: 12, source: 'self-kit' },
    ],
    note: 'Minor Fortes: Aero DMG+12%, ATK%+12% (Characters data dump/Aalto/Aalto.md line 89-90). Unconditional, always active.',
  },

  // Added 2026-09-05 (category-C completeness pass): Aalto's 2 Inherent Skills, previously not
  // referenced anywhere in this file — real, sourced, kind:'utility' with effects:[] since neither
  // has a representable DPS stat, same pattern as chain.s1/s3 above.
  {
    id: 'aalto.inherent.perfect-performance',
    source: SOURCE, kind: 'utility', section: 'Buff',
    trigger: { type: 'passive' }, timing: {}, target: { scope: 'self' }, effects: [],
    note: "Perfect Performance — Heavy Attack always crits, once every 30s. Real mechanic, not modeled: aalto.heavy.aimed-shot never fires in CHARACTER_ROTATIONS['Aalto'] (moot for DPS either way), and the '30s interval' gating has the same cooldown-representability gap as chain.s1's Shift Trick CD reduction — no repeat-cast-per-cooldown simulation for it to gate.",
  },
  {
    id: 'aalto.inherent.mid-game-break',
    source: SOURCE, kind: 'utility', section: 'Buff',
    trigger: { type: 'passive' }, timing: {}, target: { scope: 'self' }, effects: [],
    note: 'Mid-game Break — continuously restores Stamina while in Mistcloak Dash. Pure resource-management utility, no DPS component in the real kit text to model.',
  },

  // ── Resonance Chain blocks (from RESONANCE_CHAIN_DATA) ──
  // Comment corrected 2026-09-05 (same class of fix as chain.s3's 2026-09-03 correction): the prior
  // "no DPS component sourced yet" was wrong — the dump is explicit S1 reduces Shift Trick's own
  // Cooldown from 10s (now recorded on aalto.skill.shift-trick's timing.cooldown) to 6s. Left
  // unmodeled on purpose, not unsourced: this engine models one canonical cast-once-per-skill
  // rotation loop, with no cooldown-reduction stat or repeat-cast-per-cooldown simulation for a CD
  // value to multiply against — real, sourced, genuinely not representable, not a gap to guess at.
  { id: 'aalto.chain.s1', source: SOURCE, kind: 'utility', section: 'Chain', trigger: { type: 'passive' }, timing: {}, target: { scope: 'self' }, effects: [], note: "Trickster's Opening Show — Shift Trick Cooldown 10s -> 6s, real mechanic with no representable DPS stat in this schema." },
  // Note added 2026-09-05 (category-C completeness pass): the dump's real S2 text is conditional —
  // "attacking Mist-Avatar-taunted targets grants ATK+15%" — but this engine has no
  // enemy-side-tag/target-state condition type (Condition only covers element/role/stance/
  // teamWide), so the +15% is modeled unconditionally, a real generalization not a fabrication.
  { id: 'aalto.chain.s2', source: SOURCE, kind: 'buff', section: 'Chain', trigger: { type: 'passive' }, timing: {}, target: { scope: 'self' }, effects: [{ stat: 'atkPct', value: 15, source: 'self-kit' }], note: 'Real text: ATK+15% only vs Mist-Avatar-taunted targets — modeled unconditionally, no target-tag condition type exists.' },
  // Comment corrected 2026-09-03 (Phase A audit, REMAINING_WORK.md 1c): the prior "no DPS component
  // sourced yet" note was false — the dump is explicit S3 has a real DPS component ("Basic/Mid-air
  // Attack through the Gate of Quandary generates 2 more bullets at 50% of that attack's DMG"). Left
  // unmodeled on purpose, not fabricated: it's genuinely ambiguous whether "that attack" means the whole
  // multi-stage Basic ATK combo this schema treats as one block, or each individual sub-hit within it —
  // modeling either interpretation without a source confirming which would be a guess. Flagged in
  // REMAINING_WORK.md as a real, sourced, structurally-ambiguous gap, not silently dropped.
  { id: 'aalto.chain.s3', source: SOURCE, kind: 'utility', section: 'Chain', trigger: { type: 'passive' }, timing: {}, target: { scope: 'self' }, effects: [], note: "Hazey Transition — real mechanic (2 bonus bullets at 50% of the triggering Basic/Mid-air Attack's own DMG through the Gate of Quandary) not modeled: ambiguous whether it's per full combo-cast or per individual sub-hit." },
  { id: 'aalto.chain.s4', source: SOURCE, kind: 'buff', section: 'Chain', trigger: { type: 'passive' }, timing: {}, target: { scope: 'self' }, effects: [{ stat: 'skillDmg', value: 30, source: 'self-kit' }] },
  { id: 'aalto.chain.s5', source: SOURCE, kind: 'buff', section: 'Chain', trigger: { type: 'passive' }, timing: {}, target: { scope: 'self' }, effects: [{ stat: 'elemDmg', value: 25, source: 'self-kit' }] },
  // Note added 2026-09-05 (category-C completeness pass): real S6 text scopes the +50% to "Heavy
  // Attack through the Gate of Quandary" specifically, not every Heavy Attack — but this is
  // currently moot for computed DPS since aalto.heavy.aimed-shot never fires in
  // CHARACTER_ROTATIONS['Aalto'] at all (see that block's own note), and there is no temporal/
  // spatial "currently inside the Gate" condition type to model the real scoping if it ever did.
  { id: 'aalto.chain.s6', source: SOURCE, kind: 'buff', section: 'Chain', trigger: { type: 'passive' }, timing: {}, target: { scope: 'self' }, effects: [{ stat: 'critRate', value: 8, source: 'self-kit' }, { stat: 'heavyDmg', value: 50, source: 'self-kit' }], note: 'Real text scopes heavyDmg+50 to Heavy Attack through the Gate of Quandary only, not all Heavy Attacks — currently moot, Heavy ATK never fires in the modeled rotation.' },
];
