// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — engine/characterBlocks/buling.blocks.js
// Buling converted to TriggerBlocks. Sourced from characters.js's already-audited
// CHAR_BUFF_TABLE['Buling'], RESONANCE_CHAIN_DATA['Buling'] (+ its own detailed audit
// comment), SKILL_MULTIPLIERS['Buling'], and CHARACTER_ROTATIONS['Buling']. No new
// numbers invented. A healer — several Heavy ATK variants and S2-S5 chain nodes are
// intentionally non-damage (healing/utility), correctly zeroed/unmodeled per the
// audit comment.
//
// Cooldown/concertoEnergyGain added 2026-09-06 (completeness pass, same "bring every character up
// to Aalto's reference standard" direction as the Aalto/Aemeath/Augusta/Baizhi/Brant passes) —
// sourced from Data dump/Buling/Buling.md's own Cooldown/Concerto Regen rows (Thunder Talisman,
// Flashing Thunder Spell/Harmony, Summon and Smite, and the shared Heavy Attack Concerto Regen
// value). See buling.liberation.flashing-thunder-spell-harmony's own note for the one non-literal
// step in that sourcing (Harmony inherits the base Liberation's listed cooldown/regen, since it
// replaces that same ability slot rather than being a separately-costed move).
//
// Trigram-gauge modeling added 2026-09-06 (same pass, deeper mechanical accuracy per direct user
// request — "not just about cooldown and energy... if you can do it accurately then do it"). Her
// real Forte gate (Basic Stage 2/Mid-air/Skill/Basic Stage 4 build Trigram-Mountain/Trigram-Thunder,
// consumed by Heavy Attack - Mountain Over Thunder) is modeled via a real `resource-threshold`
// trigger on the gated Heavy Attack, using the same `resourceStepOn` pattern already proven for
// Yinlin's Chameleon Cipher — see buling.heavy.mountain-over-thunder's own note for why a
// single-resource (Trigram-Mountain) threshold correctly represents the real two-resource AND-gate,
// AND for a real double-fire bug found and fixed while building this (do not add `resourceGain` for
// the same resource name — read that note before touching this mechanic again). Real Electro Flare
// stack-count scaling (S5: "+6 more stacks on Array generation") stays unmodeled — the engine has no
// per-character stack-value field for Electro Flare at all yet (a structural gap flagged elsewhere
// in this file, not specific to Buling, and not attempted in this pass).
// ═══════════════════════════════════════════════════════════════════════════════

import { parseSkillMultiplierHits } from '../math/hitParser.js';

const SOURCE = 'Buling';

/** @type {import('../schema/block.schema.js').TriggerBlock[]} */
export const BULING_BLOCKS = [
  // ── Damage blocks (from SKILL_MULTIPLIERS) ──
  {
    id: 'buling.intro.summon-and-smite',
    source: SOURCE, kind: 'damage', section: 'Intro',
    trigger: { type: 'cast', on: 'Intro:Summon and Smite' },
    timing: {}, target: { scope: 'self' }, effects: [],
    // category added 2026-09-04 (Phase A REDO, REMAINING_WORK.md 1c): was uncategorized, silently
    // rejecting Resonance Skill DMG Bonus. The source dump's own Intro Skill multiplier table literally
    // labels this row "Skill Damage" (not "Intro DMG"), same generic-labeling convention already fixed
    // for Aalto/Calcharo/Encore/Jianxin's own Intro rows.
    damage: { hits: parseSkillMultiplierHits('131.10%') , category: 'skillDmg', basis: 'ATK' },
    // concertoEnergyGain added 2026-09-06 (completeness pass): Data dump/Buling/Buling.md's own
    // "Concerto Regen: 10" row for Intro:Summon and Smite.
    concertoEnergyGain: 10,
    // dotApplier added 2026-09-02 (the engine-merge history (git log) Phase 2, first migration target): her own kit
    // text — "applies Electro Flare (Inherent Skill)" on Intro — confirmed in CHARACTER_ROTATIONS's
    // own step note. No per-character stack value sourced for Electro Flare anywhere (calcEngine.js's
    // own calcElectroFlareDmg starts from a hardcoded seed of 10, not read from CHAR_BUFF_TABLE either
    // — flagged as an open question in the engine-merge history (git log) 1.4, not invented here).
    dotApplier: { mechanic: 'electroFlare' },
  },
  {
    id: 'buling.basic.stage1',
    source: SOURCE, kind: 'damage', section: 'BasicATK',
    trigger: { type: 'cast', on: 'Basic ATK:Hexagram Calls, Lightning Falls: Stage 1' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('20.73%×2'), category: 'basicDmg' , basis: 'ATK' },
  },
  {
    id: 'buling.basic.stage2',
    source: SOURCE, kind: 'damage', section: 'BasicATK',
    trigger: { type: 'cast', on: 'Basic ATK:Hexagram Calls, Lightning Falls: Stage 2' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('33.45%×2'), category: 'basicDmg' , basis: 'ATK' },
    // Real mechanic (Data dump/Buling/Buling.md): "Trigram-Mountain gained on Basic Attack Stage 2
    // hit" — the ONLY source of Trigram-Mountain in her whole kit (Thunder is generated by 3
    // different moves below; Mountain only by this one), which is why Mountain, not Thunder, is the
    // real bottleneck gating Mountain Over Thunder below. NOT modeled as `resourceGain` — see that
    // block's own note for why (a real firing-order bug found and fixed 2026-09-06: `resourceGain`
    // on this block plus a `resource-threshold` trigger reading the SAME resource name on Mountain
    // Over Thunder made it fire twice — once the instant this cast's own gain crossed the threshold
    // dynamically, again at the real cast step via `resourceStepOn`. `resourceStepOn` alone,
    // anchored to the real rotation step, is the correct, singly-firing model here.
  },
  {
    id: 'buling.basic.midair',
    source: SOURCE, kind: 'damage', section: 'BasicATK',
    trigger: { type: 'cast', on: 'Basic ATK:Mid-air Attack' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('73.96%'), category: 'basicDmg' , basis: 'ATK' },
    // Real mechanic (Data dump/Buling/Buling.md): "Trigram-Thunder gained on ... Mid-air Attack hit".
    // Not modeled as `resourceGain` — see buling.heavy.mountain-over-thunder's own note for why
    // (a real double-fire bug this exact pattern caused, found and fixed 2026-09-06).
  },
  {
    id: 'buling.skill.thunder-talisman',
    source: SOURCE, kind: 'damage', section: 'Skill',
    trigger: { type: 'cast', on: 'Skill:In Shadow Thunder Stirs: Thunder Talisman' },
    // cooldown added 2026-09-06 (completeness pass): Data dump/Buling/Buling.md's own "Cooldown: 15s"
    // row for Resonance Skill "In Shadow Thunder Stirs".
    timing: { cooldown: 15 }, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('58.40%'), category: 'skillDmg' , basis: 'ATK' },
    // concertoEnergyGain added 2026-09-06 (completeness pass): Data dump/Buling/Buling.md's own
    // "Concerto Regen: 23" row for the same Resonance Skill.
    concertoEnergyGain: 23,
    // Real mechanic (Data dump/Buling/Buling.md): "Trigram-Thunder gained on ... Resonance Skill
    // cast" — a 2nd real Thunder source, distinct from the Mid-air/Stage 4 gains, confirmed by the
    // rotation's own step-by-step trigram count reaching exactly 4 (FIFO cap) by Stage 4:
    // Mountain(1, Stage2) + Thunder(1, Mid-air) + Thunder(1, this Skill cast) + Thunder(1, Stage 4)
    // = 4, matching CHARACTER_ROTATIONS['Buling']'s own "now holding 4 Trigrams" note on the Stage 4
    // step below. Not modeled as `resourceGain` — see buling.heavy.mountain-over-thunder's own note.
  },
  {
    id: 'buling.basic.stage4',
    source: SOURCE, kind: 'damage', section: 'BasicATK',
    trigger: { type: 'cast', on: 'Basic ATK:Hexagram Calls, Lightning Falls: Stage 4' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('93.64%'), category: 'basicDmg' , basis: 'ATK' },
    // Real mechanic (Data dump/Buling/Buling.md): "Trigram-Thunder gained on Basic Attack Stage 4
    // ... hit". CHARACTER_ROTATIONS['Buling']'s own note on this exact step ("now holding 4
    // Trigrams") independently confirms the running total reaches the real 4-Trigram FIFO cap here.
    // Not modeled as `resourceGain` — see buling.heavy.mountain-over-thunder's own note.
  },
  {
    id: 'buling.heavy.mountain-over-thunder',
    source: SOURCE, kind: 'damage', section: 'HeavyATK',
    // trigger upgraded 2026-09-06 (Trigram-gauge modeling pass) from a plain 'cast' to a real
    // 'resource-threshold', same established pattern already proven for Yinlin's Chameleon Cipher
    // (yinlin.blocks.js) — `resourceStepOn` anchors the fire to the exact CHARACTER_ROTATIONS step
    // where the real gauge is known (from the dump's own step notes) to have reached the threshold,
    // rather than either (a) fabricating a fixed cooldown for a mechanic that isn't timer-gated, or
    // (b) inventing a two-resource AND-gate the schema doesn't support (Mountain Over Thunder needs
    // BOTH >=1 Trigram-Mountain AND >=1 Trigram-Thunder). Anchored on Trigram-Mountain specifically
    // since the dump's own Review section confirms it's the real bottleneck resource ("Thunder
    // Trigrams far more easily than Mountain Trigrams (only Basic 2)") — Thunder is never the
    // binding constraint in her real rotation, so a single-resource threshold on the scarce one is
    // an accurate representation of the real gate, not an approximation.
    //
    // IMPORTANT — deliberately NO `resourceGain` anywhere in this file for 'Trigram-Mountain' or
    // 'Trigram-Thunder' (a real bug found and fixed while building this): the engine has TWO
    // independent ways a 'resource-threshold' trigger can fire — (1) `resourceStepOn`, which trusts
    // the labeled rotation step directly, and (2) a real accumulated `resourceGain` total crossing
    // `threshold` dynamically, checked fresh every step (rotationSimulator.js's own resourceGain/
    // resourceAtLeast handling). Wiring BOTH for the same resource name double-fired this block —
    // once dynamically the instant Basic Stage 2's own gain first crossed threshold:1, and again at
    // the real cast step via resourceStepOn — verified by isolating the two mechanisms with a
    // marker-damage diagnostic (2x the expected total). `resourceStepOn` alone is the correct,
    // singly-firing, real-rotation-accurate model; the granting blocks' real Trigram gains are
    // documented in their own notes as plain prose instead, not as a `resourceGain` field.
    trigger: { type: 'resource-threshold', resource: 'Trigram-Mountain', threshold: 1, resourceStepOn: 'Basic ATK:Heavy Attack - Mountain Over Thunder' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('178.93%'), category: 'basicDmg' , basis: 'ATK' },
    // concertoEnergyGain added 2026-09-06 (completeness pass): Data dump/Buling/Buling.md's own
    // "Heavy Attacks Concerto Regen (Mountain Over Thunder/Thunder Over Mountain/Twin Mountains/Twin
    // Thunders, each): 15" row — explicitly the SAME value for all 4 Heavy ATK variants, so this one
    // real sourced number applies here even though only this variant has a damage block (the other 3
    // are pure-heal/utility with no damage block to attach it to, per this file's own header).
    concertoEnergyGain: 15,
    // Real Trigram consumption on cast ("consumes Mountain+Thunder Trigrams" per
    // CHARACTER_ROTATIONS['Buling']'s own step note) has no matching schema field (resourceGain is
    // gain-only, no symmetric resourceSpend) — left unmodeled; doesn't affect this one canonical
    // rotation's correctness since no later step re-checks the Mountain-Trigram threshold.
  },
  // Heavy Attack - Twin Thunders correctly has NO damage block — removed 2026-09-03 against a fresh
  // the source dump: SKILL_MULTIPLIERS['Buling']'s own row for this move ("169 flat + 18.30% ATK") is
  // explicitly labeled "Healing" by the source's Multipliers table (same as Twin Mountains, which
  // already correctly has no damage block) — Twin Thunders deals ZERO direct damage, it's a pure
  // team-heal (once/s for 8s). The previous block wrongly modeled this healing formula as a real
  // 'basicDmg'-category damage hit, over-crediting the character's DPS with a number that was never a
  // damage multiplier at all. CHARACTER_ROTATIONS['Buling'] still casts this step — it now correctly
  // resolves to 0 direct damage, same as her Outro (a real, intentional zero-DMG utility step, not the
  // "silent lookup mismatch" bug class).
  {
    id: 'buling.liberation.flashing-thunder-spell-harmony',
    source: SOURCE, kind: 'damage', section: 'Liberation',
    trigger: { type: 'cast', on: 'Liberation:Flashing Thunder Spell: Harmony' },
    // cooldown/concertoEnergyGain added 2026-09-06 (completeness pass): Data dump/Buling/Buling.md's
    // own "Resonance Liberation — Flashing Thunder Spell" section states "Cooldown 24s... Concerto
    // Regen 20" for the BASE Liberation. Harmony isn't a separate ability with its own listed
    // cooldown/regen — the dump's own kit text is explicit it's the enhanced form that REPLACES the
    // base Liberation in the same ability slot once Yin-Yang Balance is active ("Resonance Liberation
    // is replaced by Flashing Thunder Spell: Harmony"), so the base move's cooldown/resource numbers
    // are the real, applicable ones for this block too — not a fabricated guess, but not a directly-
    // labeled "Harmony" row either, so flagged here for visibility.
    timing: { cooldown: 24 }, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('536.79%'), category: 'libDmg' , basis: 'ATK' },
    concertoEnergyGain: 20,
    // dotApplier added 2026-09-02 (the engine-merge history (git log) Phase 2) — her own kit text: "enhanced
    // Liberation deploys the Five Thunders Spell Array (Electro Flare)", confirmed in
    // CHARACTER_ROTATIONS's own step note. A SECOND real Electro Flare application point (alongside
    // her Intro above) — dotReactionsFromBlocks.js's own "has ANY applier" boolean gate means this
    // doesn't double the reaction's damage, matching calcElectroFlareDmg's own pre-existing behavior
    // (a single boolean flag on her CHAR_BUFF_TABLE entry today, same non-scaling gate).
    dotApplier: { mechanic: 'electroFlare' },
  },

  // ── Buff blocks (from CHAR_BUFF_TABLE) ──
  {
    id: 'buling.outro.exorcism-spell',
    source: SOURCE, kind: 'buff', section: 'Outro',
    trigger: { type: 'swap-out' },
    timing: { duration: 30 },
    target: { scope: 'whole-team' },
    effects: [{ stat: 'allDmg', value: 15, stacking: 'refresh', source: 'teammate-ally-action' }],
    note: 'Also heals the active character 18% ATK/s for 16s, not modeled (no DPS component).',
  },
  {
    id: 'buling.libbuff.five-thunders-skill-ramp',
    source: SOURCE, kind: 'buff', section: 'Buff',
    trigger: { type: 'cast', on: 'Liberation:Flashing Thunder Spell: Harmony' },
    timing: { duration: 24 },
    target: { scope: 'whole-team' },
    effects: [{ stat: 'skillDmg', value: 25, stacking: 'refresh', source: 'self-kit' }],
    note: 'Five Thunders Spell Array: team Resonance Skill DMG Bonus ramps +10%->+25% as allies cast Intro Skill during it — modeled at the ceiling value (25%), the ramp-up mechanic itself not modeled. See buling.chain.s6 below for the S6 upgrade of this same buff to 50%.',
  },

  // ── Resonance Chain blocks (from RESONANCE_CHAIN_DATA — see its own audit comment for each
  //    node's real mechanic; S2-S5 correctly have NO block — pure Energy-regen/healing utility with
  //    no DPS component) ──
  {
    id: 'buling.chain.s1',
    source: SOURCE, kind: 'buff', section: 'Chain',
    trigger: { type: 'cast', on: 'Liberation:Flashing Thunder Spell: Harmony' },
    timing: { duration: 24 }, // matches the Five Thunders Spell Array's own 24s duration, since this is conditional on it being active
    target: { scope: 'self' },
    effects: [{ stat: 'critRate', value: 20, source: 'self-kit' }],
    note: 'Real mechanic: enhanced Liberation (Flashing Thunder Spell: Harmony) grants +20% Crit Rate upon dealing DMG, while the Five Thunders Spell Array is active — modeled as firing on the same cast, lasting the array\'s own 24s.',
  },
  {
    id: 'buling.chain.s6',
    source: SOURCE, kind: 'buff', section: 'Chain',
    trigger: { type: 'cast', on: 'Liberation:Flashing Thunder Spell: Harmony' },
    timing: { duration: 24 },
    target: { scope: 'whole-team' },
    // Fixed 2026-09-04 (Phase A REDO, REMAINING_WORK.md 1c): value was the S6 mechanic's absolute
    // ceiling (50), stacking ADDITIVELY on top of buling.libbuff.five-thunders-skill-ramp's own 25%
    // (both fire on the same Liberation cast) — this engine, unlike the legacy flat-table path, has no
    // separate "replace instead of add" step, so the old flat-50 value silently gave 75% total instead
    // of the real 50%. Modeled here as the DELTA on top of the base 25% ramp buff (25+25=50, the real
    // ceiling) — the RESONANCE_CHAIN_DATA/CHAR_BUFF_TABLE legacy path still stores the absolute 50 (its
    // own separate, still-undocumented-as-fixed additive-double-count limitation, unchanged by this
    // pass — out of scope for a single-character engine-block audit).
    effects: [{ stat: 'skillDmg', value: 25, source: 'self-kit' }],
    note: "Real mechanic: upgrades the Five Thunders Spell Array's own Resonance Skill DMG Bonus from 25% to 50% at S6. Modeled as the +25% delta over buling.libbuff.five-thunders-skill-ramp's base 25% (see fix note above) rather than a flat 50%, so the two blocks sum to the correct real ceiling instead of double-counting.",
  },
];
