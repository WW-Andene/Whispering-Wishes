// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — engine/schema/block.schema.js
// THE canonical shape for every skill/Forte/Resonance Chain node/buff/debuff in the
// game: one self-contained TriggerBlock, resolved generically by the resolver core
// for ANY team composition. There is exactly one schema — no version field, no
// "legacy shape stays valid" carve-out. A block either matches this shape or it is
// invalid and must be fixed before it loads.
//
// This file defines the SHAPE only — no engine logic, no character data. See:
//   - validate.js         — the validator that enforces this shape, called at
//                            characterBlocks/index.js load time (hard failure).
//   - characterBlocks/*.js — per-character block sets, migrated one character at a
//                            time onto this shape (see Layer 4 of the engine rewrite).
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * @typedef {Object} TriggerBlock
 * @property {string} id            Stable unique id: `<name-slug>.<section>.<kebab-move-name>`
 *                                   (e.g. 'rover-electro.forte.overshock').
 * @property {string} source        Character name this block belongs to (CHARACTERS key) —
 *                                   must match the owning file's own SOURCE const.
 * @property {string} section       The game's own move-category this block belongs to: one of
 *                                   BasicATK/HeavyATK/Skill/Liberation/Forte/Intro/Outro/Chain/
 *                                   Echo/Buff (closed enum — the game's own UI move categories,
 *                                   a slow-growing set).
 * @property {string} kind          One of: 'damage' | 'buff' | 'debuff' | 'heal' | 'utility'
 * @property {Trigger} trigger      What causes this block to activate
 * @property {Condition} [condition] Extra gating beyond the trigger itself (element match,
 *                                    stance/resource state, role of the block's target, etc.)
 * @property {Timing} timing        When/how long the block's effects are live
 * @property {Target} target        Who the block's effects apply to
 * @property {Effect[]} effects     The actual stat/damage contributions, applied only while
 *                                   the block is active and its condition holds
 * @property {DamageHits} [damage]  Required for `kind: 'damage'`: the real per-hit %ATK values
 *                                   for this cast, parsed via skillMultiplierParser.js — no new
 *                                   numbers invented, ever.
 * @property {Proc} [proc]          For a discrete, repeatable extra-hit proc — a whole separate
 *                                   damage instance, not a modifier (kept out of `effects`, whose
 *                                   `stat` values are %-modifiers only).
 * @property {DotApplier} [dotApplier] Marks a block as one character's real, sourced contribution
 *                                   to a shared, team-wide DOT reaction (Frazzle/Erosion/Fusion
 *                                   Burst/Electro Flare/Tune Break).
 * @property {Array<string|{tag: string, requiresStance: string}>} [appliesTags]  Names which
 *                                   real-game status/action this block's own resolution counts as
 *                                   applying (e.g. `['shifting']`), sourced strictly from that
 *                                   move's own kit text, never inferred. Lets a DIFFERENT
 *                                   character's `ally-action` trigger react to this block firing.
 * @property {string} [note]        Human-readable sourcing/mechanic note — every non-obvious
 *                                   value must cite where it came from (kit text, wiki page,
 *                                   specific audit). Required in practice for anything not
 *                                   self-evident from the id/effects alone.
 */

/**
 * @typedef {Object} DamageHits
 * @property {{atkPct: number, flat?: number}[]} hits  One entry per individual hit in this cast —
 *                                        a source row's `×N` shorthand becomes N separate entries.
 *                                        `flat`: an additive non-%ATK damage component some kit
 *                                        text carries alongside the %ATK term.
 * @property {string} category          REQUIRED. Which damage-type category (see categories.js)
 *                                        this cast's damage counts as.
 * @property {string} basis             REQUIRED. Which base stat these hits scale off: 'ATK'
 *                                        (the common case) | 'HP' | 'DEF' — never assumed silently.
 * @property {boolean} [guaranteedCrit] True if this cast is a guaranteed Crit per its own kit text.
 */

/**
 * @typedef {Object} Trigger
 * @property {string} type   One of: 'cast' | 'swap-in' | 'swap-out' | 'passive' | 'on-hit' |
 *                            'resource-threshold' | 'negative-status-hit' | 'field-time' |
 *                            'partner-outro-return' | 'windowed-cast' | 'requires-prior-cast' |
 *                            'windowed-proc' | 'ally-action'
 * @property {string} [on]   The specific skill/move id this trigger fires on
 * @property {string} [action]  For 'ally-action': the appliesTags name this fires on, from ANY
 *                            team member's block, not just this block's own owner.
 * @property {string} [resource]      Gauge name, for 'resource-threshold'
 * @property {number} [threshold]     Value the resource must reach/cross
 * @property {string} [resourceStepOn]  The rotation step id representing this threshold being hit.
 * @property {string} [requiresActiveBlock]  For 'partner-outro-return': id of another block that
 *                            must still be active when the buffed teammate casts their own Outro.
 * @property {number} [maxInterveningSwaps]  Swaps allowed before that condition forfeits.
 * @property {string[]} [opensOn]     For 'windowed-cast'/'windowed-proc' (as `opensOnProc`): trigger
 *                            key(s) whose firing opens this block's window.
 * @property {number} [windowSeconds] How long the window stays open.
 * @property {string} [attemptOn]     The rotation step that attempts to consume a 'windowed-cast'.
 * @property {string} [requiresPriorCast]  For 'requires-prior-cast': a trigger key that must have
 *                            occurred earlier in the current on-field segment.
 * @property {string} [checksAt]      The rotation step at which that dependency is checked.
 * @property {string[]} [opensOnProc] For 'windowed-proc': trigger key(s) opening the proc window.
 * @property {number} [maxProcs]      Cap on how many times a 'windowed-proc' can fire per window.
 * @property {boolean} [crossCharacterHit] When true, ANY team member's landed hit can advance this
 *                            proc window, not just the block owner's own.
 * @property {number} [minProcInterval] Real-time rate limit in seconds between successful procs.
 */

/**
 * @typedef {Object} Proc
 * @property {number} atkPct    The discrete extra-hit's damage, as a % of ATK.
 * @property {string} category  REQUIRED. Which damage-type category this proc counts as.
 */

/**
 * @typedef {Object} DotApplier
 * @property {'frazzle'|'erosion'|'fusionBurst'|'electroFlare'|'tuneBreak'} mechanic
 * @property {number} [value]  This character's own sourced stack contribution (omit for
 *                            fusionBurst/electroFlare, boolean-gated mechanics with no per-applier
 *                            value).
 * @property {string} [requiresStance]  Only counts when the owner's resolved mode matches.
 */

/**
 * @typedef {Object} Condition
 * @property {string} [element]        Restrict to a specific element.
 * @property {string[]} [requiresRole] Block only applies if its target has one of these roles.
 * @property {string} [requiresStance] Stance-gated moves. Purely descriptive unless
 *                            `assumedInactive` or the exclusive-mode-block filter applies.
 * @property {boolean} [assumedInactive] True marks a block whose stance is CONFIRMED (via this
 *                            character's own real rotation/kit text) to never occur.
 * @property {boolean} [teamWide]      True if this affects the whole team, not just target.
 */

/**
 * @typedef {Object} Timing
 * @property {number} [duration]   Seconds the effect persists once triggered (omit = instant).
 * @property {number} [cooldown]   Seconds before this block can trigger again.
 * @property {number} [delay]      Seconds between trigger firing and effect starting.
 * @property {number} [tickInterval] For DOT-style repeating effects.
 * @property {boolean} [forfeitOnRecipientSwapOut] For a `target.scope:'next-on-field'` buff that
 *                            ends early if the RECIPIENT (not this block's owner) swaps out.
 */

/**
 * @typedef {Object} Target
 * @property {string} scope   One of: 'self' | 'on-field' | 'next-on-field' | 'whole-team' |
 *                              'marked-enemy' | 'all-enemies' | 'trigger-actor' (whichever team
 *                              member's own step caused an 'ally-action' trigger to fire).
 * @property {string} [filter] Optional extra restriction within scope.
 */

/**
 * @typedef {Object} Effect
 * @property {string} stat     Matches the engine's stat vocabulary (atkPct, elemDmg, skillDmg,
 *                               basicDmg, heavyDmg, libDmg, echoDmg, coordDmg, deepen, critRate,
 *                               critDmg, defShred, resShred, defIgnore, totalMult).
 * @property {number} value    The numeric contribution (%, unless stat is a flat multiplier).
 * @property {string} source   REQUIRED for a `kind:'buff'` block's effects. Where the buff comes
 *                               from (see buffSource.js) — distinct from `target` (who receives it).
 * @property {string} [stacking] One of: 'unique' (default) | 'stacking' | 'refresh'.
 * @property {number} [maxStacks] For 'stacking' only: the real, sourced cap on concurrent
 *                               instances. Omit rather than guess if the real cap isn't sourced.
 * @property {string} [scopedToBlockId]  Scopes this effect to ONE SPECIFIC damage block's id,
 *                               instead of its whole `damage.category`.
 * @property {{count: number, value: number}[]} [tiers]  A nonlinear/multi-tier per-stack curve.
 *                               When present, `value` is unused and should be omitted.
 */

export const TRIGGER_TYPES = ['cast', 'swap-in', 'swap-out', 'passive', 'on-hit', 'resource-threshold', 'negative-status-hit', 'field-time', 'partner-outro-return', 'windowed-cast', 'requires-prior-cast', 'windowed-proc', 'ally-action'];
export const BLOCK_KINDS = ['damage', 'buff', 'debuff', 'heal', 'utility'];
export const SECTIONS = ['BasicATK', 'HeavyATK', 'Skill', 'Liberation', 'Forte', 'Intro', 'Outro', 'Chain', 'Echo', 'Buff'];
export const TARGET_SCOPES = ['self', 'on-field', 'next-on-field', 'whole-team', 'marked-enemy', 'all-enemies', 'trigger-actor'];
export const STACKING_MODES = ['unique', 'stacking', 'refresh'];
export const DOT_MECHANICS = ['frazzle', 'erosion', 'fusionBurst', 'electroFlare', 'tuneBreak'];
