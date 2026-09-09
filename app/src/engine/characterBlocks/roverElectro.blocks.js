// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — engine/characterBlocks/roverElectro.blocks.js
// Rover: Electro converted to TriggerBlocks — proof-of-concept for the Phase 2
// trigger-driven engine (see ../triggerBlocks.schema.js). Sourced directly from
// characters.js's already-audited SKILL_MULTIPLIERS['Rover: Electro'],
// CHARACTER_ROTATIONS['Rover: Electro'], RESONANCE_CHAIN_DATA['Rover: Electro'],
// and CHAR_BUFF_TABLE['Rover: Electro'] (2026-09-01 audit) — no new numbers
// invented here, only the same values re-expressed as declarative blocks.
//
// Verified for parity against the legacy flat-table path by
// __tests__/triggerEngine-rover-electro.test.js.
//
// Full kit audit 2026-09-09: fixed S3 (was unscoped skillDmg:20, silently over-crediting
// rover-electro.skill.thunderclap — now scopedToBlockId'd to Overshock only, matching its
// real kit text) and S6 (was unscoped skillDmg:20 with no matching block for its real named
// targets, Thrum of All Sounds/Thunder Bane — now a real no-op, kind:'utility'). Both are now a
// documented, deliberate divergence from RESONANCE_CHAIN_DATA's own coarser skillDmg:20+20=40 sum
// (its flat applyResonanceChain() has no per-move scoping mechanism to express this precisely).
// Also flagged (not fixed — out of scope, would need a new stance-tracking mechanism): S5's
// condition.requiresStance:'Apex Resonance' is purely descriptive for a plain buff block per
// block.schema.js, so its +20% Crit DMG currently applies unconditionally rather than only in
// Apex Resonance (which the modeled Standard Rotation never enters).
// ═══════════════════════════════════════════════════════════════════════════════

import { parseSkillMultiplierHits } from '../math/hitParser.js';

const SOURCE = 'Rover: Electro';

/** @type {import('../schema/block.schema.js').TriggerBlock[]} */
export const ROVER_ELECTRO_BLOCKS = [
  // ── Damage blocks (from SKILL_MULTIPLIERS, split per the 2026-09-01 audit fix). `damage.hits`
  //    populated 2026-09-01 alongside the "totalMult -> hit-composed DPS" design doc — real per-hit
  //    %ATK parsed from these same already-audited strings, no new numbers invented. ──
  {
    id: 'rover-electro.basic.deterrence',
    source: SOURCE,
    kind: 'damage', section: 'BasicATK',
    // A real gap found while populating damage.hits: this 4-stage combo — the very FIRST real damage
    // step in CHARACTER_ROTATIONS['Rover: Electro'] — had no block of its own at all (only its
    // auto-chained follow-up, Repel, was modeled). Added now, same "fill the gap found during
    // migration" precedent as Yinlin's Lightning Execution split.
    trigger: { type: 'cast', on: 'Basic ATK:Deterrence 1-4' },
    timing: {},
    target: { scope: 'self' },
    effects: [],
    damage: { hits: parseSkillMultiplierHits('51.08% → 26.00%+39.00% → 13.27%×7 → 72.82%+109.22%'), category: 'basicDmg', basis: 'ATK' },
    note: 'Tap Basic Attack 4 times in a row — each hit builds more Electric Surge.',
  },
  {
    id: 'rover-electro.skill.thunderclap',
    source: SOURCE,
    kind: 'damage', section: 'Skill',
    trigger: { type: 'cast', on: 'Skill:Thunderclap' },
    timing: { cooldown: 10 },
    target: { scope: 'self' },
    effects: [{ stat: 'skillDmg', value: 0 }], // no-op placeholder, kept as-is (harmless — applyBuff's
    // default case ignores it); the real damage now lives in `damage.hits` below.
    damage: { hits: parseSkillMultiplierHits('100.20%×2'), category: 'skillDmg', basis: 'ATK' },
  },
  {
    id: 'rover-electro.basic.repel',
    source: SOURCE,
    kind: 'damage', section: 'BasicATK',
    trigger: { type: 'cast', on: 'Basic ATK:Repel' },
    condition: { requiresStance: undefined },
    timing: { delay: 0 },
    target: { scope: 'self' },
    effects: [],
    damage: { hits: parseSkillMultiplierHits('56.12%+84.17%'), category: 'basicDmg', basis: 'ATK' },
    note: 'Auto-chains from a single Basic Attack tap right after Thunderclap lands.',
  },
  {
    id: 'rover-electro.forte.overshock',
    source: SOURCE,
    kind: 'damage', section: 'Forte',
    trigger: { type: 'resource-threshold', resource: 'Electric Surge', threshold: 120, resourceStepOn: 'Forte:Overshock' },
    condition: {},
    timing: {},
    target: { scope: 'self' },
    effects: [],
    damage: { hits: parseSkillMultiplierHits('80.72%×7+423.77%+423.77%'), category: 'skillDmg', basis: 'ATK' },
    note: 'TAP at max Electric Surge (HOLD enters Apex Resonance instead) — counted as Resonance Skill DMG per its own kit text. Forte-type per the 2026-09-01 rotation fix.',
  },
  {
    id: 'rover-electro.liberation.ultimate-tactics',
    source: SOURCE,
    kind: 'damage', section: 'Liberation',
    trigger: { type: 'cast', on: 'Liberation:Ultimate Tactics' },
    timing: { cooldown: 25 },
    target: { scope: 'self' },
    effects: [],
    // Fixed 2026-09-03 against a fresh the source dump: was 1192.86%, real value is 1109.22%.
    damage: { hits: parseSkillMultiplierHits('1109.22%'), category: 'libDmg', basis: 'ATK' },
  },
  {
    id: 'rover-electro.intro.thunderous-fury',
    source: SOURCE,
    kind: 'damage', section: 'Intro',
    trigger: { type: 'swap-in' },
    timing: {},
    target: { scope: 'self' },
    effects: [],
    // category added for Layer 4 schema migration (validate.js requires damage.category on every
    // damage block) — no override text names a different category for this Intro cast, same
    // default-to-skillDmg convention used throughout this migration sweep (e.g. Aalto/Roccia's own
    // Intro blocks). Previously left uncategorized on purpose since legacy calcEngine.js's own
    // dmgFocus-routing buckets exclude Intro/Outro casts from category-specific DMG Bonus anyway
    // (see ROTATION_RAW_TYPE_TO_FOCUS's own comment there) — that legacy routing is unaffected by
    // this addition; it's needed for schema validity only.
    damage: { hits: parseSkillMultiplierHits('33.41%×2+100.21%'), basis: 'ATK' },
  },

  // ── Buff blocks (from CHAR_BUFF_TABLE) ──
  {
    id: 'rover-electro.selfbuff.overshock-atk',
    source: SOURCE,
    kind: 'buff', section: 'Forte',
    trigger: { type: 'resource-threshold', resource: 'Electric Surge', threshold: 120, resourceStepOn: 'Forte:Overshock' },
    condition: {},
    timing: { duration: 20 },
    target: { scope: 'whole-team' },
    effects: [{ stat: 'atkPct', value: 10, stacking: 'refresh', source: 'self-kit' }],
    note: 'Tap-cast Overshock at max Electric Surge grants team ATK +10% (20s).',
  },
  {
    id: 'rover-electro.outro.rumbling-thunders',
    source: SOURCE,
    kind: 'buff', section: 'Outro',
    trigger: { type: 'swap-out' },
    condition: {},
    timing: { duration: 14 },
    target: { scope: 'next-on-field' },
    effects: [{ stat: 'allDmg', value: 25, stacking: 'refresh', source: 'teammate-ally-action' }],
    note: 'Grants Electro Core; next Negative Status hit from the incoming Resonator consumes it for All DMG Amp +25% (14s). Modeled here as applying on swap-out — the real Negative-Status-hit gate is a Phase-2-engine TODO (needs a negative-status-tracking trigger type not yet modeled by calcEngine.js either).',
  },

  // ── Debuff blocks (from CHAR_BUFF_TABLE) ──
  {
    id: 'rover-electro.debuff.electro-flare',
    source: SOURCE,
    kind: 'debuff', section: 'Forte',
    trigger: { type: 'cast', on: 'Forte:Overshock' },
    condition: {},
    timing: { duration: 99 },
    target: { scope: 'marked-enemy' },
    effects: [{ stat: 'flare', value: 10, stacking: 'stacking', maxStacks: 10 }],
    note: 'Hold-cast Overshock (Inherent Skill "Decipher") inflicts 10 stacks of Electro Flare.',
  },

  // ── Resonance Chain blocks (from RESONANCE_CHAIN_DATA — S1/S2 zeroed per the 2026-09-01 audit,
  //    no real DPS component/schema category yet) ──
  {
    id: 'rover-electro.chain.s1-celestial-ingenuity',
    source: SOURCE,
    kind: 'utility', section: 'Chain',
    trigger: { type: 'passive' },
    timing: {},
    target: { scope: 'self' },
    effects: [],
    note: 'Interruption-resistance utility — no DPS component; TODO: needs Phase 2 schema category.',
  },
  {
    id: 'rover-electro.chain.s2-thousandfold-artifice',
    source: SOURCE,
    kind: 'utility', section: 'Chain',
    trigger: { type: 'passive' },
    timing: {},
    target: { scope: 'self' },
    effects: [],
    note: 'Electro Flare stack mechanic — no DPS component; TODO: needs Phase 2 schema category.',
  },
  {
    id: 'rover-electro.chain.s3-alchemy-of-wonders',
    source: SOURCE,
    kind: 'buff', section: 'Chain',
    trigger: { type: 'passive' },
    timing: {},
    target: { scope: 'self' },
    // Fixed 2026-09-09 (full-kit audit): was an unscoped skillDmg:20, which — since skillDmg applies
    // to EVERY skillDmg-categorized block unconditionally — silently over-credited
    // rover-electro.skill.thunderclap too (also skillDmg-categorized), even though S3's own kit text
    // names only Overshock ("Overshock's DMG Multiplier+20%"). Confirmed via direct measurement:
    // Thunderclap's own hit damage rose from S0 to S3 before this fix, despite S3 naming Overshock
    // only. Same over-crediting bug class already found/fixed on Jiyan/Phrolova/Qingxiao/Qiuyuan/
    // Roccia/Lumi/Lupa/Rover: Aero's own S6. Fixed via scopedToBlockId.
    effects: [{ stat: 'skillDmg', value: 20, scopedToBlockId: 'rover-electro.forte.overshock', source: 'self-kit' }],
    note: "Overshock's own DMG Multiplier +20%.",
  },
  {
    id: 'rover-electro.chain.s4-earthquaking-rumble',
    source: SOURCE,
    kind: 'buff', section: 'Chain',
    trigger: { type: 'passive' },
    timing: {},
    target: { scope: 'self' },
    effects: [{ stat: 'libDmg', value: 20, source: 'self-kit' }],
    note: 'Liberation DMG +20%.',
  },
  {
    id: 'rover-electro.chain.s5-principle-of-change',
    source: SOURCE,
    kind: 'buff', section: 'Chain',
    trigger: { type: 'passive' },
    condition: { requiresStance: 'Apex Resonance' },
    timing: {},
    target: { scope: 'self' },
    // Flagged 2026-09-09 (full-kit audit): condition.requiresStance is purely descriptive for a plain
    // `kind:'buff'` block unless it participates in the exclusive-mode appliesTags/winningStanceForOwner
    // gating system (block.schema.js's own documented limitation, same "unenforced condition.
    // requiresStance" gap already flagged on Aemeath's audit) — there is no rival Apex-Resonance-tagged
    // block group here for that system to resolve against, so this +20% Crit DMG currently applies
    // UNCONDITIONALLY (confirmed via direct measurement: enabling S5 alone raised
    // rover-electro.skill.thunderclap's own hit damage even though the modeled Standard Rotation never
    // enters Apex Resonance at all — only TAP-Overshock is modeled, matching the dump's own Review
    // verdict that Apex Resonance is "best avoided"). Left as-is rather than force-built into a new
    // stance-tracking mechanism (out of scope for a single-character fix); real effect is a known,
    // documented overstatement of S5's contribution in the modeled rotation, not a value/scoping error.
    effects: [{ stat: 'critDmg', value: 20, source: 'self-kit' }],
    note: 'Crit DMG +20% while in Apex Resonance — requiresStance not enforced for a plain buff block (see comment above); currently applies unconditionally.',
  },
  {
    id: 'rover-electro.chain.s6-minds-depths',
    source: SOURCE,
    kind: 'utility', section: 'Chain',
    trigger: { type: 'passive' },
    timing: {},
    target: { scope: 'self' },
    // Fixed 2026-09-09 (full-kit audit): was an unscoped skillDmg:20 — S6's own kit text names ONLY
    // Thrum of All Sounds and Thunder Bane ("Thrum of All Sounds and Thunder Bane's DMG Multiplier is
    // increased by 20%"), neither of which has a block of its own in this file (both live behind the
    // HOLD-Overshock -> Apex Resonance branch, which the dump's own Review section calls "best avoided"
    // and which the modeled Standard Rotation never enters — only TAP-Overshock is modeled). As coded,
    // the unscoped effect did nothing for its real named targets (they don't exist as blocks) while
    // silently over-crediting rover-electro.skill.thunderclap and rover-electro.forte.overshock instead
    // (both skillDmg-categorized) — confirmed via direct measurement: Thunderclap's own hit damage rose
    // again from S3 to S6 despite neither move being named by S6's kit text. Converted to a real no-op
    // (kind:'utility', empty effects), same treatment already used for S1/S2's genuinely-unmodeled
    // mechanics — correct until Thrum of All Sounds/Thunder Bane get their own blocks (out of scope for
    // this fix: that branch isn't part of the modeled Standard Rotation at all).
    effects: [],
    note: "Thrum of All Sounds/Thunder Bane DMG +20% — correctly unmodeled (no block exists for either move; both live behind the HOLD-Overshock Apex Resonance branch, which isn't part of the modeled Standard Rotation).",
  },
];
