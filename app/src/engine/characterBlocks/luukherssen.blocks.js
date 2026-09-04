// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — engine/characterBlocks/luukherssen.blocks.js
// Luuk Herssen converted to TriggerBlocks. Sourced from characters.js's already-
// audited CHAR_BUFF_TABLE['Luuk Herssen'] (all zero, plus its own Tune Break
// sub-object — no DPS-representable buffs), RESONANCE_CHAIN_DATA['Luuk Herssen']
// (+ its own audit comment, read directly for each node's real mechanic),
// SKILL_MULTIPLIERS['Luuk Herssen'], and CHARACTER_ROTATIONS['Luuk Herssen']. No
// new numbers invented. S1/S3/S5's approximated totalMult/basicDmg values are
// kept as documented approximations per the source table's own reasoning, not
// re-derived further.
//
// Full independent 9-dimension re-audit 2026-09-04 (Phase A): found and fixed a
// real damage.category bug affecting 5 of his core damage blocks (Aureole of
// Execution's 3 forms, Gavel of Earthshaker, and the Liberation itself) — the
// dump's own kit text is explicit all 5 are "considered Basic Attack DMG", and
// were wrongly skillDmg/libDmg/uncategorized, silently rejecting his entire
// Basic-ATK-focused weapon/echo-set kit's DMG Bonus buffs (dmgFocus is
// ['Basic ATK'] only). Fixed the resulting dead chain.s2/chain.s6 stat mismatch
// the same way (see each block's own note). Also added a previously entirely
// missing base-kit Inherent Skill buff (Uncaused Diagnosis's ATK+25%) and fixed
// a weaponAlts rarity-tier bug in characters.js (Pulsation Bracer, a real 5★
// weapon, was misfiled under alt4). See REMAINING_WORK.md §1c for the full
// write-up.
// ═══════════════════════════════════════════════════════════════════════════════

import { parseSkillMultiplierHits } from '../skillMultiplierParser.js';

const SOURCE = 'Luuk Herssen';

/** @type {import('../triggerBlocks.schema.js').TriggerBlock[]} */
export const LUUK_HERSSEN_BLOCKS = [
  // ── Damage blocks (from SKILL_MULTIPLIERS) ──
  {
    id: 'luukherssen.intro.before-injection-of-dawn',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Intro:Before Injection of Dawn' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('72.67%×3') },
    note: 'Restores 100 Ichor Flow, grants Dawnlit Keep (free damage-reduction/interruption-immunity charge, not modeled). Also inflicts Tune Strain.',
  },
  {
    id: 'luukherssen.midair.jump-scythe-resection-stage2-3',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Mid-air:Jump: Scythe Resection Stage 2-3' },
    timing: {}, target: { scope: 'self' }, effects: [],
    // category fixed 2026-09-02: WuWa's own general mechanic (Mid-air/Plunging Attacks inherit Basic
    // ATK or Heavy ATK DMG, never their own type) plus the dump's own kit structure — listed under
    // "Basic Attack — Such is Light", not Heavy Attack — confirms basicDmg.
    damage: { hits: parseSkillMultiplierHits('50.42%×2 → 74.92%×2'), category: 'basicDmg' },
    note: 'Jump-input airborne combo (does slightly more damage/Energy than the Basic-input variant), restores Ichor Flow, applies Tune Strain.',
  },
  {
    id: 'luukherssen.skill.aureole-ring',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Skill:Aureole of Execution: Ring' },
    timing: {}, target: { scope: 'self' }, effects: [],
    // category fixed 2026-09-04 (Phase A audit): the dump's own kit text is explicit — "Aureole of
    // Execution: ... Deals Basic Attack DMG" (all 3 forms) — and the dump's own Damage Profile shows a
    // genuine 0% Skill share against 88.9% Basic, confirming this. Was wrongly skillDmg, silently
    // rejecting every real Basic Attack DMG Bonus buff (his weapon/echo-set kit is built entirely
    // around Basic ATK DMG) on one of his 3 core damage casts — same bug class already fixed on
    // Camellya/Cantarella/Zhezhi/Rebecca's "considered Basic Attack DMG" moves.
    damage: { hits: parseSkillMultiplierHits('26.56%×5+88.53%'), category: 'basicDmg' },
    note: 'Resets the Mid-air Attack cycle, grants 1 Endnotes stack. Unlocks a Golden Impale follow-up.',
  },
  {
    id: 'luukherssen.basic.golden-impale',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Basic ATK:Golden Impale' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('155.47%'), category: 'basicDmg' },
    note: 'Follow-up dash hit after Ring or Breach (its wind-up is long, cancelled early in the real rotation, barely damaging by design). Fires twice.',
  },
  {
    id: 'luukherssen.midair.basic1-jump-resection2-3',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Mid-air:Basic 1 → Jump: Resection 2-3' },
    timing: {}, target: { scope: 'self' }, effects: [],
    // No separate SKILL_MULTIPLIERS row for the "Basic 1" prefix hit — the Resection Stage 2-3 segment
    // is used as a representative value for the combo cycle this step performs. category fixed
    // 2026-09-02: same basis as the sibling Mid-air block above (Basic Attack section, no Heavy
    // override) — basicDmg.
    damage: { hits: parseSkillMultiplierHits('50.42%×2 → 74.92%×2'), category: 'basicDmg' },
    note: 'Jump back into the airborne combo for a further cycle. No separate row for the leading Basic Attack input, not modeled. Fires twice in the real rotation.',
  },
  {
    id: 'luukherssen.skill.aureole-breach',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Skill:Aureole of Execution: Breach' },
    timing: {}, target: { scope: 'self' }, effects: [],
    // category fixed 2026-09-04 (Phase A audit): same kit-text override as Ring above — Aureole of
    // Execution "Deals Basic Attack DMG" regardless of form. Was wrongly skillDmg.
    damage: { hits: parseSkillMultiplierHits('95.91%×3'), category: 'basicDmg' },
    note: 'Resets the Mid-air Attack cycle, hurls an Ichor Blade, grants another Endnotes stack.',
  },
  {
    id: 'luukherssen.skill.aureole-glare',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Skill:Aureole of Execution: Glare' },
    timing: {}, target: { scope: 'self' }, effects: [],
    // category fixed 2026-09-04 (Phase A audit): same kit-text override as Ring/Breach above — Aureole
    // of Execution "Deals Basic Attack DMG" regardless of form. Was wrongly skillDmg.
    damage: { hits: parseSkillMultiplierHits('354.11%'), category: 'basicDmg' },
    note: 'Hurls Solid-State Ichor forming an Ichor Deposit, grants the 3rd Endnotes stack, unlocks the plunging Mid-air Attack finisher.',
  },
  {
    id: 'luukherssen.forte.gavel-of-earthshaker',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Forte:Mid-air Attack: Gavel of Earthshaker' },
    timing: {}, target: { scope: 'self' }, effects: [],
    // category added 2026-09-04 (Phase A audit): the dump's own kit text is explicit — "press Normal
    // Attack mid-air to slam down and detonate it — Spectro DMG (considered Basic Attack DMG)". Was
    // previously entirely uncategorized, silently rejecting every real Basic Attack DMG Bonus buff —
    // same bug class as Lynae's own Forte "Basic Attack - Visual Impact" fix.
    damage: { hits: parseSkillMultiplierHits('306.90%'), category: 'basicDmg' },
    note: 'Plunge attack that detonates his Ichor Deposit, fully restores STA.',
  },
  {
    id: 'luukherssen.liberation.rewritten-in-winters-margins',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: "Liberation:Rewritten in Winter's Margins" },
    timing: {}, target: { scope: 'self' }, effects: [],
    // category fixed 2026-09-04 (Phase A audit): the dump's own kit text is explicit — "Spectro DMG,
    // considered Basic Attack DMG" — and the dump's own Damage Profile confirms Liberation is a genuine
    // 0% bucket while Basic is 88.9% (his Ultimate's huge single hit is folded into that Basic total).
    // Was wrongly libDmg, silently rejecting every real Basic Attack DMG Bonus buff (incl. his own
    // signature weapon Daybreaker's Spine and 5pc Rite of Gilded Revelation's Liberation-cast Basic ATK
    // Bonus) on his single biggest hit — same bug class already fixed on Lucy's own Liberation (which
    // is likewise not libDmg-categorized, per its own kit-text override). Losing energy-cycle libUptime
    // gating on this hit is an accepted, precedented side effect of a kit-text category override (see
    // Lucy's Liberation, also non-libDmg) — the DMG-bonus-pool the hit draws from is a real, sourced
    // property of its own damage type, not a proxy for "is this the Ultimate move".
    damage: { hits: parseSkillMultiplierHits('745.54% + 49.71%×5'), category: 'basicDmg' },
    note: 'Ultimate nuke, empowered +25% per Endnotes stack (up to +75% with all 3 banked) — real Endnotes stack scaling not modeled (base value used), see luukherssen.chain.s6 below for the S6 chain-boosted upgrade of that same mechanic.',
  },
  {
    id: 'luukherssen.skill.golden-reflux',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Skill:Golden Reflux' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('201.20%'), category: 'skillDmg' },
    note: 'Dash strike, unlocks the 3-stage Aureole of Execution. Cast a 2nd time near the end of the rotation to bank Concerto Energy for the Outro.',
  },
  {
    id: 'luukherssen.outro.bow-to-the-last-light',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'swap-out' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('500%') },
    note: 'Flat 500% ATK Spectro hit, also refreshes Golden Rule on the team (25s cycle, full-Forte swap-in) — not modeled (no DPS component).',
  },

  // ── Base-kit Inherent Skill buff (Uncaused Diagnosis) ──
  {
    id: 'luukherssen.inherent.uncaused-diagnosis-atk',
    source: SOURCE, kind: 'buff',
    // Added 2026-09-04 (Phase A audit): Uncaused Diagnosis (a base S0 Inherent Skill, entirely
    // unmodeled before this) has TWO real components per the dump — (1) "Luuk's skills directly
    // damaging an Interfered target Amplify that instance of damage by 5% per 10 TBB points, up to
    // 30%" — this is the same generic Tune Strain response formula the tuneBreak sub-object above
    // already represents (shared engine-wide infra, not re-derived here); (2) "After any nearby
    // teammate inflicts Shifting or deals Tune Break DMG, Luuk's ATK +25% for 20s" — a genuinely
    // separate, previously entirely unmodeled ATK buff. Modeled here using the existing
    // `ally-action`/action:'shifting' mechanism (same infra Qingxiao's chain.s4 already uses) for the
    // "inflicts Shifting" half. The "OR deals Tune Break DMG" half is NOT modeled — same
    // `'tune-break-cast'`-tag infra gap already documented for S4 (REMAINING_WORK.md §1a): Tune Break
    // application isn't tracked per-move anywhere yet. This makes the buff's real uptime a
    // (conservative) undercount whenever a teammate lands Tune Break DMG without also inflicting
    // Shifting in the same window, but is still strictly better than leaving a real, sourced, ATK+25%
    // self-buff at zero. Per Qingxiao's chain.s4's own established precedent, `ally-action` fires
    // regardless of which Resonator (including Luuk himself, whose own kit inflicts Shifting
    // constantly via Golden Reflux/Aureole of Execution/Mid-air Resection Stage 3) performed the
    // tagged action — the dump's "nearby teammate" wording can't be narrowed to exclude self-triggers
    // with this schema, so in practice this buff is close to permanently up during his own rotation
    // (which also roughly matches real play, since his best teams — Denia/Lynae/Mornye — apply
    // Shifting off-field too).
    trigger: { type: 'ally-action', action: 'shifting' },
    timing: { duration: 20 },
    target: { scope: 'self' },
    effects: [{ stat: 'atkPct', value: 25, stacking: 'refresh' }],
    note: 'Uncaused Diagnosis: after any nearby teammate inflicts Shifting, Luuk\'s ATK +25% for 20s (Tune Break DMG branch not modeled — see comment above).',
  },

  // ── Resonance Chain blocks (from RESONANCE_CHAIN_DATA — see its own audit comment for each node's
  //    real mechanic) ──
  {
    id: 'luukherssen.chain.s1',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'self' },
    effects: [{ stat: 'basicDmg', value: 15 }],
    note: '+150% Mid-air ATK DMG — simplified as a basicDmg ~15 DPS-impact approximation, documented and kept per the source table\'s own reasoning (not a literal Mid-air-only category in this schema).',
  },
  {
    id: 'luukherssen.chain.s2',
    source: SOURCE, kind: 'buff',
    // Fixed 2026-09-04 (Phase A audit): stat:'libDmg' targeted the same category-gated stat pool as its
    // target block (luukherssen.liberation.rewritten-in-winters-margins), which was just corrected to
    // category:'basicDmg' (kit text: "considered Basic Attack DMG") — same 2-bug shape already found and
    // fixed on Lucy's own chain.s3 (stat mismatched its target block's real, kit-text-overridden
    // category). Fixed to 'basicDmg' + scopedToBlockId so it lands only on this one named move, not
    // every basicDmg-categorized hit in the rotation.
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'self' },
    effects: [{ stat: 'basicDmg', value: 60, scopedToBlockId: "luukherssen.liberation.rewritten-in-winters-margins" }],
    note: "Rewritten in Winter's Margins DMG Multiplier +60% — scoped to that one move only (stacks with Endnotes on the Endgame's own bonus).",
  },
  {
    id: 'luukherssen.chain.s3',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'self' },
    effects: [{ stat: 'totalMult', value: 15 }],
    note: 'Aureole of Execution forms +136% in Aureate Judge (conditional, no flat unconditional %) — kept as an approximated totalMult per the source table\'s own reasoning, not the literal 136% conditional figure.',
  },
  {
    id: 'luukherssen.chain.s4',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'whole-team' },
    effects: [{ stat: 'allDmg', value: 20 }],
    note: 'Team All DMG +20% (not Basic DMG) on ally Tune Break — a cross-character trigger (an ALLY applying Tune Break, not Luuk\'s own cast) this schema has no clean anchor for, kept passive team-wide as an approximation.',
  },
  {
    id: 'luukherssen.chain.s5',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'self' },
    effects: [{ stat: 'totalMult', value: 15 }],
    note: 'Intro (Before Injection of Dawn) and Outro (Bow to the Last Light) DMG Bonus +80%, plus Golden Reflux DMG Multiplier +50% (cooldown -2s, +1 charge, unrepresentable here) — two separate conditional pieces, kept as the same totalMult documented-approximation pattern as S1/S3 (corrected 2026-09-02: the prior note wrongly claimed this was a single confirmed-exact flat bonus).',
  },
  {
    id: 'luukherssen.chain.s6',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'self' },
    // stat fixed 2026-09-04 (Phase A audit): same libDmg/basicDmg category mismatch as chain.s2 above —
    // its target block (the Liberation cast) is now correctly category:'basicDmg', so this must scope
    // to 'basicDmg' too (with scopedToBlockId, matching Lucy's chain.s3 fix pattern) or it's a silent
    // no-op against every hit in the rotation.
    effects: [{ stat: 'basicDmg', value: 40, stacking: 'stacking', maxStacks: 3, scopedToBlockId: "luukherssen.liberation.rewritten-in-winters-margins" }],
    note: 'Endnotes stacking grants Liberation DMG +40%/stack up to +120% (3 stacks) — modeled as per-stack 40% x3 cap, matching the real stacking mechanic (Endnotes stacks are gained on each Aureole of Execution cast above, consumed/read at Liberation cast time) rather than a flat 120%.',
  },
];
