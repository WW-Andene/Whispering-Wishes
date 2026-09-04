// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — engine/characterBlocks/qiuyuan.blocks.js
// Qiuyuan converted to TriggerBlocks. Sourced from characters.js's already-audited
// CHAR_BUFF_TABLE['Qiuyuan'], RESONANCE_CHAIN_DATA['Qiuyuan'] (+ its own audit
// comment, read directly for each node's real mechanic), SKILL_MULTIPLIERS
// ['Qiuyuan'], and CHARACTER_ROTATIONS['Qiuyuan']. No new numbers invented.
// weaponBuffs (echoDmg+20 team on Signature Weapon Emerald Sentence's own pv) is
// intentionally NOT modeled — this file's own convention elsewhere already
// documents that hardcoding a weapon's own passive here double-counts it whenever
// that weapon is actually equipped (the calculator applies it separately).
//
// Re-audited from scratch 2026-09-04 (first full Phase A 9-dimension pass on Qiuyuan, zero deference to
// prior "already-audited" claims above): found 5 of 6 damage blocks below carried a wrong or entirely
// missing `damage.category` (basic/heavy swap on Inkwash; skillDmg/libDmg used instead of echoDmg on
// Skill/Liberation despite explicit "counted as Echo Skill DMG" kit text on both — same category:'echoDmg'
// precedent already established on Sigrika's/Galbrena's/Phrolova's own Liberation-slot moves; To Teach and
// the Outro damage block had NO category at all). Also found: Bamboo's Shade (base-kit +30% Echo Skill DMG
// at 400 Forte) entirely unmodeled; the S3 node's second component (+600% DMG Mult to To Teach/To
// Save/To Sacrifice) entirely unmodeled; the real S3+ move "Straw Cape in Drizzly Rain" (500% ATK, Echo
// Skill DMG) entirely missing as its own damage block despite S3's Crit-DMG buff and the new +600% buff
// both actually anchoring to its cast, not the Forte cast; S6's own "exiting Inksplash of Mind deals 600%
// ATK Aero DMG" damage effect entirely unmodeled. See each block's own note below and REMAINING_WORK.md
// §1c for the full writeup.
// ═══════════════════════════════════════════════════════════════════════════════

import { parseSkillMultiplierHits } from '../shared/skillMultiplierParser.js';

const SOURCE = 'Qiuyuan';

/** @type {import('../triggerBlocks.schema.js').TriggerBlock[]} */
export const QIUYUAN_BLOCKS = [
  // ── Damage blocks (from SKILL_MULTIPLIERS) ──
  {
    id: 'qiuyuan.intro.attack-the-must-defend',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Intro:Attack the Must-Defend' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('9.55%×5 + 47.72% + 143.15%'), category: 'heavyDmg' },
    note: 'Counted as Heavy ATK DMG per its own kit text. Grants 400 of 600 Forte, skips straight to Inkwash Stage 3.',
  },
  {
    id: 'qiuyuan.basic.inkwash-stage3-4',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Basic ATK:Inkwash Stage 3-4' },
    timing: {}, target: { scope: 'self' }, effects: [],
    // Row 'Inkwash 1-4' has 4 arrow-separated stages; this step uses stages 3-4 (per its own label,
    // since the Intro already skipped to Stage 3).
    // Category fixed 2026-09-04 from basicDmg to heavyDmg — the dump's own kit text is explicit:
    // "Basic Attack — Thus Spoke the Blade: Inkwash: ... replaces Basic Attack ... counted as Heavy
    // Attack DMG" — confirmed by the dump's own Damage-Type Breakdown table showing a flat 0% Basic ATK
    // share and 60.8% Heavy ATK share.
    damage: { hits: parseSkillMultiplierHits('14.58%×5+72.87% → 172.37%'), category: 'heavyDmg' },
    note: 'Fills Forte to 600. Counted as Heavy ATK DMG per its own kit text, not Basic ATK.',
  },
  {
    id: 'qiuyuan.skill.through-the-groves',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Skill:Through the Groves' },
    timing: {}, target: { scope: 'self' }, effects: [],
    // Category fixed 2026-09-04 from skillDmg to echoDmg — kit text: "Through the Groves: ... counted
    // as Echo Skill DMG" — same recategorization precedent already established on Sigrika's Liberation/
    // Forte-Heavy blocks (echoDmg despite the Skill/Heavy slot).
    damage: { hits: parseSkillMultiplierHits('71.84%×3'), category: 'echoDmg' },
    note: 'Optional — best cast before this rotation via quickswap, skipped if not needed for Energy. Counted as Echo Skill DMG per its own kit text.',
  },
  {
    id: 'qiuyuan.liberation.sundering-strike',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Liberation:Sundering Strike' },
    timing: {}, target: { scope: 'self' }, effects: [],
    // Category fixed 2026-09-04 from libDmg to echoDmg — kit text: "Sundering Strike: ... counted as
    // Echo Skill DMG" — the RESONANCE_CHAIN_DATA raw field name `s3.libDmg` is kept as a legacy
    // "Liberation-slot node" label only (same convention already documented on Galbrena's S3), not a
    // literal damage-category claim; the real engine effect below stays scoped to this block by id.
    damage: { hits: parseSkillMultiplierHits('795.24%'), category: 'echoDmg' },
    note: "Cancels the Skill's endlag on hit, grants self/team Crit DMG at 65%+ Crit Rate (see qiuyuan.libbuff.crit-dmg below). Counted as Echo Skill DMG per its own kit text, not Liberation DMG.",
  },
  {
    id: 'qiuyuan.forte.to-teach',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Forte:To Teach / To Save / To Sacrifice' },
    timing: {}, target: { scope: 'self' }, effects: [],
    // 3 alternative Heavy ATK finishers (91.44%×5 / 38.44%×3+31.45%×3 / 217.70%) — "To Teach" (the
    // strongest/first-listed) is used as a representative value; the other two follow-up effects are
    // not modeled.
    // category added 2026-09-04 — this block previously had NO damage.category at all (a real, silent
    // gap: it drew 0% Echo/Heavy DMG Bonus from any team buff regardless of source). Kit text: "Basic
    // Attack — Thus Spoke the Blade: Inkwash ... To Teach → To Save → To Sacrifice ... counted as Heavy
    // Attack DMG" — matches the dump's own 60.8% Heavy ATK damage-share figure (each of To
    // Teach/Save/Sacrifice "also counts as casting Echo Skill", but that's a trigger-flag for other
    // characters'/its own Echo-Skill-cast-gated effects, not a redeclaration of its own damage.category).
    damage: { hits: parseSkillMultiplierHits('91.44%×5'), category: 'heavyDmg' },
    note: 'Heavy ATK finisher sequence in Inkwash form, empties Forte and restores Concerto Energy. Only "To Teach" is modeled — "To Save"/"To Sacrifice" have different follow-up effects, not separately represented. Also counts as casting Echo Skill for other characters\' Echo-Skill-cast-gated effects (not its own damage category).',
  },
  {
    id: 'qiuyuan.outro.strike-before-ready',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'swap-out' },
    timing: {}, target: { scope: 'self' }, effects: [],
    // category added 2026-09-04 — this block previously had NO damage.category (silently drew 0% Echo
    // Skill DMG Bonus). Kit text: "Strike Before Ready: Attack, Aero DMG = 100% ATK, counted as Echo
    // Skill DMG."
    damage: { hits: [{ atkPct: 100 }], category: 'echoDmg' },
    note: 'Counted as Echo Skill DMG per its own kit text.',
  },
  {
    id: 'qiuyuan.chain.s3-straw-cape',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Skill:Straw Cape in Drizzly Rain' },
    timing: { cooldown: 20 }, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('500%'), category: 'echoDmg' },
    // Added 2026-09-04 — real S3+ move entirely missing from the engine before now. Only usable once
    // Concerto Energy is full outside Inksplash of Mind (once per 20s), consuming 60 Concerto Energy;
    // not added to CHARACTER_ROTATIONS (S0-S2's Standard Hybrid Rotation, the one modeled there, never
    // casts it — it belongs to the separate S3+ DPS Rotation, which repeats a whole second Basic/Forte
    // pass this engine has no per-sequence-rotation mechanism to represent). Modeled here, gated to S3+
    // automatically via the `chain.s3-` id prefix (sequenceGating.js), so it's available to any
    // hit-composed caller that explicitly includes it in a custom S3+ rotation.
    note: 'S3+ only: replaces Skill once Concerto Energy is full outside Inksplash of Mind. Counted as Echo Skill DMG per its own kit text. Restores 400 Soliloquy; next Basic Attack replaced with Inkwash Stage 3 (not separately modeled).',
  },
  {
    id: 'qiuyuan.chain.s6-exit-inksplash',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Forte:To Teach / To Save / To Sacrifice' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: [{ atkPct: 600 }], category: 'echoDmg' },
    // Added 2026-09-04 — real S6 damage effect entirely missing from the engine before now. Kit text:
    // "S6: ... While active on-field, exiting Inksplash of Mind deals Aero DMG = 600% ATK to targets in
    // range, counted as Echo Skill DMG." Anchored to the Forte finisher cast (the point at which
    // Inksplash of Mind actually ends once Soliloquy is used up) — same anchor already used for the
    // sibling qiuyuan.chain.s6 Crit DMG buff before this fix (see that block's own note for why its own
    // anchor was moved).
    note: 'S6 only: 600% ATK Aero DMG on exiting Inksplash of Mind (i.e. right after the Forte finisher sequence completes), counted as Echo Skill DMG.',
  },

  // ── Buff blocks (from CHAR_BUFF_TABLE) ──
  {
    id: 'qiuyuan.outro.strike-before-ready-buff',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'swap-out' },
    timing: { duration: 14 },
    target: { scope: 'next-on-field' },
    effects: [{ stat: 'echoDmg', value: 50, stacking: 'refresh' }],
  },
  {
    id: 'qiuyuan.libbuff.crit-dmg',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'cast', on: 'Liberation:Sundering Strike' },
    timing: { duration: 30 },
    // target fixed 2026-09-04 from 'whole-team' to 'self' — the kit text's "grants all nearby active
    // team members +2% Crit DMG" reads team-wide in isolation, but the dump's own Review section
    // explicitly disambiguates it: "Ultimate grants up to +30% Crit DMG to the active resonator (himself
    // included) at 65%+ Crit Rate — this and the 400-Forte Echo Skill buff apply only to the active
    // resonator, not Coordinated/off-field characters." Same over-scoped-to-team-when-kit-said-active-
    // only bug class as Lupa's under-scoped equivalent (opposite direction) — was silently granting this
    // Crit DMG to the whole bench, not just whoever is actually on-field.
    target: { scope: 'self' },
    effects: [{ stat: 'critDmg', value: 30, stacking: 'refresh' }],
    note: 'Requires 65%+ Crit Rate for full value; +2% Crit DMG per 1% Crit Rate over 50% — modeled at the flat ceiling value (the real conditional Crit-Rate-scaling formula is not modeled). Applies only to the active on-field Resonator per the dump\'s own Review text, not team-wide.',
  },
  {
    id: 'qiuyuan.buff.bamboos-shade',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'resource-threshold', resource: "Swordster's Soliloquy", threshold: 400, resourceStepOn: 'Basic ATK:Inkwash Stage 3-4' },
    timing: { duration: 30 },
    target: { scope: 'self' },
    effects: [{ stat: 'echoDmg', value: 30, stacking: 'refresh' }],
    // Added 2026-09-04 — real base-kit Forte Circuit effect ("Bamboo's Shade": at 400/600 Soliloquy,
    // +30% Echo Skill DMG Bonus for 30s) entirely missing from the engine before now (CHAR_BUFF_TABLE's
    // own selfBuffs was an empty array). Per the dump's own Review text this applies only to whoever is
    // the active on-field Resonator at cast time, not the whole bench — modeled target:'self' since
    // Qiuyuan himself is on-field when his own Forte gauge crosses 400 in his real rotation. The S2
    // Resonance Chain node (qiuyuan.chain.s2 below) correctly adds its own further +30% on top of this.
    note: "Bamboo's Shade: base-kit +30% Echo Skill DMG Bonus at 400 Forte, active on-field Resonator only.",
  },

  // ── Resonance Chain blocks (from RESONANCE_CHAIN_DATA — see its own audit comment for each node's
  //    real mechanic) ──
  {
    id: 'qiuyuan.chain.s1',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'self' },
    effects: [{ stat: 'critRate', value: 20 }],
    note: '+20% Crit Rate (confirmed exact). Also grants uninterruptible Heavy ATKs, not modeled (no DPS component).',
  },
  {
    id: 'qiuyuan.chain.s2',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'whole-team' },
    effects: [{ stat: 'echoDmg', value: 30 }],
    // Note updated 2026-09-04: value/scope re-confirmed unchanged (a genuine DMG-Bonus-pool echoDmg
    // buff, correctly team-wide and unscoped-by-block per its own kit text "to nearby team members" —
    // NOT the same active-resonator-only restriction as the base Bamboo's Shade effect it extends,
    // which the dump's Review text calls out specifically and only for the 400-Forte buff + the
    // Liberation Crit DMG buff, not this node). Now that the category fixes above give Qiuyuan real
    // echoDmg-categorized damage blocks (Skill/Liberation/Outro/Straw Cape/S6-exit), this buff actually
    // has real hits to apply to for the first time.
    note: "Bamboo's Shade: +30% additional team Echo Skill DMG (confirmed exact, team-wide) — no specific cast anchor sourced, kept passive.",
  },
  {
    id: 'qiuyuan.chain.s3',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'self' },
    // Fixed 2026-09-04: was `trigger:{type:'cast', on:'Liberation:Sundering Strike'}` + a single
    // unscoped `stat:'libDmg'` effect — a real category-gating bug (silently zero-effect) once the
    // Liberation block's own category above was corrected from libDmg to echoDmg (category-specific
    // stats only apply to hits whose damage.category matches exactly), same class of dead-effect bug as
    // Galbrena's S3. Converted to `totalMult` + `scopedToBlockId` (Brant/Augusta/Camellya pattern) so it
    // stays correctly scoped to ONLY Sundering Strike's own hit regardless of category, and switched to
    // `trigger:{type:'passive'}` (Brant's S3 pattern) so it actually fires every cast, not just once.
    // Also added the node's own SECOND component, entirely missing before now: "Casting [Straw Cape in
    // Drizzly Rain] also: ... gives To Teach/To Save/To Sacrifice +600% DMG Multiplier" — scoped to the
    // qiuyuan.forte.to-teach block. Kept unconditionally passive (same "no specific cast anchor sourced"
    // simplification already used elsewhere in this file) rather than fabricating precise timing to
    // require an actual prior Straw Cape cast — a documented conservative approximation, not a bug.
    effects: [
      { stat: 'totalMult', value: 500, scopedToBlockId: 'qiuyuan.liberation.sundering-strike' },
      { stat: 'totalMult', value: 600, scopedToBlockId: 'qiuyuan.forte.to-teach' },
    ],
    note: "Sundering Strike's own DMG Multiplier +500%, and To Teach/To Save/To Sacrifice's own DMG Multiplier +600% after casting Straw Cape in Drizzly Rain (both confirmed exact against the dump).",
  },
  {
    id: 'qiuyuan.chain.s4',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'self' },
    effects: [{ stat: 'atkPct', value: 20 }],
    note: '+20% ATK (confirmed exact, corrected from an earlier half-value 10) — no specific cast anchor sourced, kept passive.',
  },
  {
    id: 'qiuyuan.chain.s5',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'self' },
    effects: [{ stat: 'defIgnore', value: 15 }],
    note: 'Ignores 15% target DEF (confirmed exact) — no specific cast anchor sourced, kept passive.',
  },
  {
    id: 'qiuyuan.chain.s6',
    source: SOURCE, kind: 'buff',
    // Fixed 2026-09-04: trigger was `cast` on the Forte finisher (an approximation documented at the
    // time as standing in for Straw Cape, which wasn't yet modeled) — now that
    // qiuyuan.chain.s3-straw-cape exists as its own damage block, anchored correctly to the move the kit
    // text actually names: "Casting Straw Cape in Drizzly Rain grants +100% Crit DMG for 6s".
    trigger: { type: 'cast', on: 'Skill:Straw Cape in Drizzly Rain' },
    timing: { duration: 6 },
    target: { scope: 'self' },
    effects: [{ stat: 'critDmg', value: 100 }],
    note: 'Straw Cape grants +100% Crit DMG for 6s (confirmed exact) — now anchored to Straw Cape\'s own cast (qiuyuan.chain.s3-straw-cape) instead of the Forte finisher approximation used before that block existed.',
  },
];
