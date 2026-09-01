// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — engine/triggerBlocks.schema.js
// Phase 2 combat-logic schema: every skill/Forte/Resonance Chain node/buff/debuff
// becomes one self-contained TRIGGER_BLOCK instead of a flat stat table + separate
// imperative gating code. A team's active blocks can then be assembled and resolved
// generically by triggerEngine.js for ANY team composition, instead of needing
// hand-written gating logic per mechanic (as calcEngine.js's applyBuff/
// universalStatApplies/routeTypeBonuses do today).
//
// This file defines the SHAPE only — no engine logic, no character data. See:
//   - triggerEngine.js   — the resolver that walks TRIGGER_BLOCKS for a team/rotation
//   - characterBlocks/*.js — per-character block sets (converted incrementally,
//     one character per file, same cadence as the characters.js data audit)
//
// Rollout: converting all ~60 characters in one pass is not attempted here — each
// character's block set is verified against the existing calcEngine.js/
// calcTeamStats.js output for that character before being trusted, and the legacy
// flat tables (characters.js's SKILL_MULTIPLIERS/CHARACTER_ROTATIONS/
// RESONANCE_CHAIN_DATA/CHAR_BUFF_TABLE) stay authoritative until every character
// referenced in a given calculation has a verified block set. See
// characterBlocks/README.md for per-character migration status.
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * @typedef {Object} TriggerBlock
 * @property {string} id            Stable unique id, e.g. 'rover-electro.forte.overshock'
 * @property {string} source        Character name this block belongs to (CHARACTERS key)
 * @property {string} kind          One of: 'damage' | 'buff' | 'debuff' | 'heal' | 'utility'
 * @property {Trigger} trigger      What causes this block to activate
 * @property {Condition} [condition] Extra gating beyond the trigger itself (element match,
 *                                    stance/resource state, role of the block's target, etc.)
 * @property {Timing} timing        When/how long the block's effects are live
 * @property {Target} target        Who the block's effects apply to
 * @property {Effect[]} effects     The actual stat/damage contributions, applied only while
 *                                   the block is active and its condition holds
 * @property {string} [note]        Human-readable sourcing/mechanic note (same convention as
 *                                   the free-text `note` fields already used throughout
 *                                   characters.js — keep provenance attached to the data)
 */

/**
 * @typedef {Object} Trigger
 * @property {string} type   One of: 'cast' (pressing a specific input) | 'swap-in' | 'swap-out' |
 *                            'passive' (always-on once conditions are met) | 'on-hit' |
 *                            'resource-threshold' (a gauge/stack count crossing a value) |
 *                            'negative-status-hit' | 'field-time' | 'partner-outro-return'
 *                            (added for Augusta's Majesty/Crown-of-Wills mechanic — see below)
 * @property {string} [on]   The specific skill/move id this trigger fires on (matches a
 *                            CHARACTER_ROTATIONS-style {type, skill} pair when type === 'cast');
 *                            omitted for triggers that aren't tied to one specific move
 * @property {string} [resource]      Name of the gauge this trigger reads, for 'resource-threshold'
 * @property {number} [threshold]     Value the resource must reach/cross
 * @property {string} [requiresActiveBlock]  For 'partner-outro-return': the id of ANOTHER block
 *                                    (this character's own outro buff, applied to a teammate) that
 *                                    must still be active — not yet expired, and not yet ended by an
 *                                    intervening swap past the allowance below — when the buffed
 *                                    teammate casts THEIR OWN Outro. This is the first trigger type
 *                                    in this schema that depends on a DIFFERENT character's action
 *                                    (the buffed partner's Outro cast), not just this character's own
 *                                    trigger history — Augusta's Majesty stack only grants if the
 *                                    exact resonator she buffed Outros back before a third swap
 *                                    (wutheringwaves.fandom.com/wiki/Augusta/Combat). Whether the
 *                                    referenced block is still active is a rotation-history/state-
 *                                    machine question this schema does not itself answer (see
 *                                    PHASE2_PLAN.md design question 2, still open) — this field only
 *                                    records WHICH other block's active-window gates this trigger; a
 *                                    real rotation simulator has to be the thing that evaluates it.
 * @property {number} [maxInterveningSwaps]  How many character-swap events are allowed between this
 *                                    trigger's own prior activation and the partner's return-Outro
 *                                    before the condition is forfeited (Augusta: 1 — the partner's own
 *                                    Outro-out IS that one swap; a swap to a third character before
 *                                    that forfeits it).
 */

/**
 * @typedef {Object} Condition
 * @property {string} [element]        Restrict to a specific element (e.g. Ciaccona's Outro:
 *                                       "Aero Erosion DMG Amp only")
 * @property {string[]} [requiresRole] Block only applies if its target has one of these roles
 * @property {string} [requiresStance] e.g. 'Parry Stance', 'Apex Resonance', 'Ephemeral
 *                                       Transcendence' — kit-specific stance-gated moves
 * @property {boolean} [teamWide]      True if this affects the whole team, not just target
 */

/**
 * @typedef {Object} Timing
 * @property {number} [duration]   Seconds the effect persists once triggered (omit = instant/
 *                                   one-shot, e.g. a single damage tick)
 * @property {number} [cooldown]   Seconds before this block can trigger again
 * @property {number} [delay]      Seconds between trigger firing and effect starting (e.g. a
 *                                   swap-cancel window)
 * @property {number} [tickInterval] For DOT-style repeating effects
 */

/**
 * @typedef {Object} Target
 * @property {string} scope   One of: 'self' | 'on-field' | 'next-on-field' | 'whole-team' |
 *                              'marked-enemy' | 'all-enemies'
 * @property {string} [filter] Optional extra restriction within scope (e.g. 'Coordinated ATK
 *                               role only')
 */

/**
 * @typedef {Object} Effect
 * @property {string} stat     Matches calcEngine.js's existing stat vocabulary (atkPct, elemDmg,
 *                               skillDmg, basicDmg, heavyDmg, libDmg, echoDmg, coordDmg, deepen,
 *                               critRate, critDmg, defShred, resShred, defIgnore, totalMult) —
 *                               deliberately reused rather than inventing a parallel vocabulary,
 *                               so a converted block can be resolved by the SAME applyBuff()
 *                               stat switch calcEngine.js already has.
 * @property {number} value    The numeric contribution (%, unless stat is a flat multiplier)
 * @property {string} [stacking] One of: 'unique' (default — doesn't stack with itself) |
 *                                 'stacking' (multiple instances add, e.g. Electro Flare stacks) |
 *                                 'refresh' (re-triggering resets duration instead of adding)
 */

export const TRIGGER_TYPES = ['cast', 'swap-in', 'swap-out', 'passive', 'on-hit', 'resource-threshold', 'negative-status-hit', 'field-time', 'partner-outro-return'];
export const BLOCK_KINDS = ['damage', 'buff', 'debuff', 'heal', 'utility'];
export const TARGET_SCOPES = ['self', 'on-field', 'next-on-field', 'whole-team', 'marked-enemy', 'all-enemies'];
export const STACKING_MODES = ['unique', 'stacking', 'refresh'];
