// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — engine/characterBlocks/cantarella.blocks.js
// Cantarella converted to TriggerBlocks. Sourced from characters.js's already-audited
// CHAR_BUFF_TABLE['Cantarella'], RESONANCE_CHAIN_DATA['Cantarella'] (+ its own detailed
// 2026-08-31 audit comment, read directly for each node's real mechanic),
// SKILL_MULTIPLIERS['Cantarella'], and CHARACTER_ROTATIONS['Cantarella']. No new numbers
// invented. Several real mechanics have no home in this schema yet and are documented
// rather than force-fit (Jolt's auto-proc hit, S4's healing-only effect, S5's +5
// Dreamweaver hit-count cap) — matching the same "don't fabricate a value" rule the
// source file's own audit already applied. The Diffusion Coordinated ATK summon chain
// WAS one of these (closed 2026-09-03, REMAINING_WORK.md 1a) — see
// cantarella.liberation.diffusion-summons below, built on a new `crossCharacterHit`
// windowed-proc variant (triggerBlocks.schema.js).
// ═══════════════════════════════════════════════════════════════════════════════

import { parseSkillMultiplierHits } from '../skillMultiplierParser.js';

const SOURCE = 'Cantarella';

/** @type {import('../triggerBlocks.schema.js').TriggerBlock[]} */
export const CANTARELLA_BLOCKS = [
  // ── Damage blocks (from SKILL_MULTIPLIERS) ──
  {
    id: 'cantarella.intro.ripple',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Intro:Cruise' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('42.25%×4') },
  },
  {
    id: 'cantarella.basic.stage3',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Basic ATK:Illusion Collapse Stage 3' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('72.57%×2'), category: 'basicDmg' },
    note: 'Intro (Ripple) primes her next Basic ATK to skip straight to Stage 3 — only that primed stage is a real CHARACTER_ROTATIONS step, Stage 1-2 not separately modeled here.',
  },
  {
    id: 'cantarella.skill.graceful-step',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Skill:Dance with Shadows' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('73.60%×2'), category: 'skillDmg' },
  },
  {
    // category fixed 2026-09-04 (Phase A audit, REMAINING_WORK.md 1c): kit text is explicit — "Flowing
    // Suffocation: Havoc DMG (considered Basic Attack DMG)" — this was wrongly `libDmg` despite the
    // override, silently rejecting real teammate Basic ATK DMG Bonus buffs and wrongly accepting
    // Liberation DMG Bonus ones instead. Confirmed independently by the dump's own Damage Profile
    // (Liberation 0%, Basic ATK 69.1% — the dominant bucket).
    id: 'cantarella.liberation.flowing-suffocation',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Liberation:Beneath the Sea' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('376.00%'), category: 'basicDmg' },
    note: 'Considered Basic Attack DMG per its own kit text despite being cast from the Liberation slot. Also applies Diffusion — see cantarella.liberation.diffusion-summons below for the modeled Coordinated ATK summon chain.',
  },
  {
    // Added 2026-09-03 (REMAINING_WORK.md 1a — the off-field summon-chain gap, closed): the numbers
    // were always fully sourced (SKILL_MULTIPLIERS['Cantarella']'s own Liberation row: '376.00% +
    // 14.54%×21'), the blocker was purely the engine — 'windowed-proc' only ever fired off the block
    // OWNER's own hits (Yinlin's S6 shape). Extended it with a `crossCharacterHit` flag (schema doc in
    // triggerBlocks.schema.js has the full design) so ANY team member's landed hit can advance the
    // window while it's open, not just Cantarella's own — matching the kit text exactly ("every hit
    // SHE OR THE TEAM lands"). `on` is deliberately omitted (no move-type filter, unlike Yinlin's S6)
    // since Diffusion procs off literally any hit. `minProcInterval: 1` enforces the real "up to 1 per
    // second" cap even when multiple qualifying hits land in close succession.
    id: 'cantarella.liberation.diffusion-summons',
    source: SOURCE, kind: 'damage',
    trigger: {
      type: 'windowed-proc',
      opensOnProc: ['cast:Liberation:Beneath the Sea'],
      windowSeconds: 30,
      maxProcs: 21,
      crossCharacterHit: true,
      minProcInterval: 1,
    },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('14.54%'), category: 'basicDmg' },
    // category fixed 2026-09-04 (Phase A audit, REMAINING_WORK.md 1c): kit text is explicit — "summons
    // Dreamweavers for Coordinated Attacks (Havoc DMG, considered Basic Attack DMG)" — this was wrongly
    // `coordDmg` despite the override, silently rejecting real teammate Basic ATK DMG Bonus and wrongly
    // accepting Coordinated ATK DMG Bonus instead. Same bug shape/fix as the Liberation block above.
    note: 'Diffusion: for 30s after Flowing Suffocation (or until 21 Dreamweavers are summoned, whichever first), every hit landed by her or the team can summon a Coordinated ATK (considered Basic Attack DMG per kit text), up to 1/second, 14.54% ATK Havoc DMG each, 21 max (S5 raises this cap to 26 — not modeled here, see the Resonance Chain section\'s own "S4/S5 correctly have NO block" comment below).',
  },
  {
    id: 'cantarella.heavy.delusive-dive',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Heavy ATK:Delusive Dive' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('53.05%×2') },
    note: 'Consumes all 5 Trance and enters 8s Mirage state.',
  },
  {
    id: 'cantarella.skill.flickering-reverie',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Skill:Flickering Reverie' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('196.23%'), category: 'skillDmg' },
    note: 'Mirage-state Skill replacement, considered an Echo Skill cast. Inflicts Hazy Dream, whose follow-up Jolt hit (198.81%, considered Basic ATK DMG) is a separate auto-triggered proc off the target\'s next hit taken — not anchored to its own CHARACTER_ROTATIONS step, not modeled.',
  },
  {
    id: 'cantarella.forte.phantom-sting',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Forte:Phantom Sting 1-3' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('35.33%×3+62.93%×2+64.62%×4'), category: 'basicDmg' },
    note: 'Mirage-state Basic ATK replacement (3-tap combo, builds Shiver).',
  },
  {
    id: 'cantarella.forte.perception-drain',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Forte:Perception Drain' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('667.99%×2'), category: 'basicDmg' },
    note: 'Considered Basic ATK DMG per its own kit text and also counted as an Echo Skill cast. Also heals the team and re-applies Hazy Dream — not modeled (no DPS component).',
  },

  // ── Buff blocks (from CHAR_BUFF_TABLE) ──
  {
    id: 'cantarella.outro.gentle-tentacles',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'swap-out' },
    timing: { duration: 14, forfeitOnRecipientSwapOut: true },
    target: { scope: 'next-on-field' },
    condition: { element: 'havoc' },
    effects: [
      { stat: 'elemDmg', value: 20, stacking: 'refresh' },
      { stat: 'skillDmg', value: 25, stacking: 'refresh' },
    ],
    // Retrofitted 2026-09-03 (REMAINING_WORK.md 1a): forfeitOnRecipientSwapOut now actually clamps
    // this to the buffed Resonator's own swap-out instant when it's shorter than the full 14s.
    note: 'Forfeited early if the buffed Resonator is swapped out before 14s expires.',
  },
  {
    id: 'cantarella.selfbuff.inherent-skill-poison',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'passive' },
    timing: { duration: 10 },
    target: { scope: 'self' },
    effects: [{ stat: 'elemDmg', value: 6, stacking: 'stacking', maxStacks: 2 }],
    note: 'Inherent Skill Poison: +6% Havoc DMG Bonus per Echo Skill cast, stacks up to 2x (12% cap) — modeled as per-stack 6% x2, matching the real stacking mechanic rather than a flat 12%. No Echo Skill cast step exists in CHARACTER_ROTATIONS to anchor the trigger precisely, kept passive per the source table\'s own condition text.',
  },

  // ── Resonance Chain blocks (from RESONANCE_CHAIN_DATA — see its own 2026-08-31 audit comment for
  //    each node's real mechanic; S4/S5 correctly have NO block — heal-only / hit-count-cap-only,
  //    no DPS component per that audit) ──
  {
    // Fixed 2026-09-04 (Phase A audit, REMAINING_WORK.md 1c): was a single unscoped totalMult:50
    // effect, silently boosting her ENTIRE kit's damage 50% instead of only the 3 named moves the kit
    // text actually specifies. Rescoped to 3 scopedToBlockId entries, same multi-block-scoping pattern
    // already used elsewhere (Camellya's chain.s5-twining, Changli's TRIPARTITE_FLAMES_BLOCK_IDS.map).
    id: 'cantarella.chain.s1',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'self' },
    effects: [
      { stat: 'totalMult', value: 50, scopedToBlockId: 'cantarella.skill.graceful-step' },
      { stat: 'totalMult', value: 50, scopedToBlockId: 'cantarella.skill.flickering-reverie' },
      { stat: 'totalMult', value: 50, scopedToBlockId: 'cantarella.forte.perception-drain' },
    ],
    note: "Real scope: Graceful Step / Flickering Reverie / Perception Drain's own DMG Multiplier +50% ONLY (mixed Skill+Forte-that-counts-as-Basic-ATK scope, doesn't cleanly map to one existing stat category — kept as totalMult per the audit comment's own reasoning, now correctly scoped to just those 3 blocks). Also grants 1 Resonance Skill cast Trance recovery and Perception Drain interrupt immunity, both utility, not modeled.",
  },
  {
    id: 'cantarella.chain.s2',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'self' },
    effects: [{ stat: 'totalMult', value: 245 }],
    note: "Jolt's own DMG Multiplier +245%. Jolt itself is a proc-only auto-trigger not anchored to a CHARACTER_ROTATIONS step (see cantarella.skill.flickering-reverie note), so this buff has no block to apply to in the current rotation simulation — recorded faithfully anyway per the audit's real value, same documented-but-currently-inert pattern as Buling's S6/libBuff overlap.",
  },
  {
    // stat fixed 2026-09-04 (Phase A audit, REMAINING_WORK.md 1c): was `libDmg`, matching the
    // pre-fix (wrong) `libDmg` category on cantarella.liberation.flowing-suffocation above. Now that
    // block is correctly `basicDmg` (kit text override — "considered Basic Attack DMG"), so this must
    // follow it to `basicDmg` too, else the bonus silently stops applying to anything at all. basicDmg
    // is shared with 3 other blocks (basic.stage3, forte.phantom-sting, forte.perception-drain), so
    // this now needs scopedToBlockId to stay scoped to only Flowing Suffocation, matching RESONANCE_
    // CHAIN_DATA's own updated s3.basicDmg row.
    id: 'cantarella.chain.s3',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'cast', on: 'Liberation:Beneath the Sea' },
    timing: {}, target: { scope: 'self' },
    effects: [{ stat: 'basicDmg', value: 370, scopedToBlockId: 'cantarella.liberation.flowing-suffocation' }],
    note: "Real mechanic: scoped to Flowing Suffocation's own DMG Multiplier +370%, cast-scoped (instant, no persistent duration) — same single-hit-scoped pattern as Calcharo's S5. Also causes Flowing Suffocation to enter Mirage on cast, utility, not modeled.",
  },
  {
    // Scoped 2026-09-04 (Phase A audit, REMAINING_WORK.md 1c): was unscoped basicDmg:80, which after
    // the Flowing Suffocation/Diffusion category fixes above now silently over-applies to 3 OTHER
    // basicDmg blocks (basic.stage3, forte.perception-drain, liberation.flowing-suffocation) that S6's
    // real kit text does NOT buff — only Phantom Sting specifically.
    id: 'cantarella.chain.s6-basic-mult',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'self' },
    effects: [{ stat: 'basicDmg', value: 80, scopedToBlockId: 'cantarella.forte.phantom-sting' }],
    note: "Phantom Sting's own DMG Multiplier +80% (Mirage-state Basic ATK combo, basicDmg category confirmed exact per the audit comment) — scoped to only that block.",
  },
  {
    id: 'cantarella.chain.s6-defignore',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'cast', on: 'Liberation:Beneath the Sea' },
    timing: { duration: 10 },
    target: { scope: 'self' },
    effects: [{ stat: 'defIgnore', value: 30 }],
    note: 'DEF Ignore +30% for 10s after casting Flowing Suffocation (confirmed exact per the audit comment) — split from the basicDmg node above since the two effects have different triggers/durations and the schema only allows one timing per block.',
  },
];
