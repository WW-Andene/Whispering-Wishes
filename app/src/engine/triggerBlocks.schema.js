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
 * @property {Proc} [proc]          For a discrete, repeatable extra-hit proc (Yinlin S6-style —
 *                                   see Proc typedef below) — the raw flat-ATK-scaling damage
 *                                   instance this block represents. Kept OUT of `effects` on
 *                                   purpose: `effects[].stat` values are %-modifiers resolved
 *                                   through calcEngine.js's existing `applyBuff()` switch, but a
 *                                   proc is a whole separate damage instance (like a
 *                                   SKILL_MULTIPLIERS row), not a modifier to one — forcing it
 *                                   into `effects` would either silently no-op (applyBuff has no
 *                                   case for a raw %ATK value) or require inventing a fake
 *                                   modifier stat with no basis in the real mechanic, the same
 *                                   mistake Phase 1 already caught and reverted for Yinlin's S6
 *                                   (see RESONANCE_CHAIN_DATA['Yinlin'].s6's audit comment in
 *                                   characters.js). Same documented boundary as every `effects: []`
 *                                   damage block already in this codebase (Rover's Thunderclap,
 *                                   etc.) — resolveTriggerBlocks() does not compute proc damage
 *                                   yet; this field only names the shape.
 * @property {DamageHits} [damage]  For a `kind: 'damage'` block: the real per-hit `%ATK` values for
 *                                   this cast, parsed from SKILL_MULTIPLIERS via
 *                                   skillMultiplierParser.js's `parseSkillMultiplierHits()` — no new
 *                                   numbers invented, same sourcing discipline as everywhere else in
 *                                   this schema. Added 2026-09-01 alongside the "totalMult →
 *                                   hit-composed DPS" design doc in PHASE2_PLAN.md — this is that
 *                                   design's data prerequisite (step 1), populated for Yinlin as the
 *                                   Stage 1 proof-of-concept. Kept OUT of `effects` for the exact same
 *                                   reason `proc` is: `effects[].stat` is %-modifier-only
 *                                   (resolved through `applyBuff()`), while a hit's own raw %ATK is a
 *                                   whole damage instance, not a modifier. `effects: []` on a damage
 *                                   block WITHOUT a populated `damage` field is still the documented
 *                                   boundary it always was — this field is additive, not a
 *                                   requirement every damage block must carry yet (most of the
 *                                   roster's damage blocks still don't have one).
 */

/**
 * @typedef {Object} DamageHits
 * @property {{atkPct: number}[]} hits  One entry per individual hit in this cast (a multi-stage
 *                                        combo like Yinlin's 4-tap Basic ATK has one entry per stage,
 *                                        already expanded — a source row's `×N` shorthand becomes N
 *                                        separate entries, not one entry with a multiplier field).
 * @property {string} [category]        Which of calcEngine.js's existing damage-type categories
 *                                        (basicDmg/heavyDmg/libDmg/skillDmg/echoDmg/coordDmg) this
 *                                        cast's damage counts as — same vocabulary/purpose as
 *                                        `Proc.category`.
 */

/**
 * @typedef {Object} Trigger
 * @property {string} type   One of: 'cast' (pressing a specific input) | 'swap-in' | 'swap-out' |
 *                            'passive' (always-on once conditions are met) | 'on-hit' |
 *                            'resource-threshold' (a gauge/stack count crossing a value) |
 *                            'negative-status-hit' | 'field-time' | 'partner-outro-return'
 *                            (added for Augusta's Majesty/Crown-of-Wills mechanic — see below) |
 *                            'windowed-cast' (added for Jinhsi's cast-order forfeit windows —
 *                            see below) | 'requires-prior-cast' (added for Camellya's Twining —
 *                            see below) | 'windowed-proc' (added for Yinlin's Furious Thunder —
 *                            see below)
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
 * @property {string[]} [opensOn]     For 'windowed-cast': the trigger key(s) — same format
 *                                    triggerEngine.js's triggerKey() produces, e.g.
 *                                    'cast:Basic ATK:Slash of Breaking Dawn Stage 1-4' — whose firing
 *                                    opens this block's cast-order window. Multiple entries mean ANY
 *                                    of them opens it (Jinhsi's Overflowing Radiance window opens on
 *                                    EITHER landing Basic ATK Stage 4 OR casting Intro Loong's Halo).
 *                                    Same-character version of the cross-character problem
 *                                    'partner-outro-return' solves for Augusta: here the window-open
 *                                    and window-cast events both belong to THIS character's own
 *                                    rotation, but still require real elapsed-time tracking within
 *                                    that rotation to evaluate — this schema field only names the
 *                                    window's shape (what opens it, how long it stays open); it does
 *                                    not itself track whether real elapsed time in a simulated
 *                                    rotation fell inside `windowSeconds`. That evaluation is exactly
 *                                    PHASE2_PLAN.md's design question 2 (state machine / rotation
 *                                    history) — still open, same limitation as
 *                                    'partner-outro-return'.
 * @property {number} [windowSeconds] For 'windowed-cast': how long the window stays open after the
 *                                    `opensOn` trigger fires before the alternate/empowered cast this
 *                                    block represents is forfeited.
 * @property {string} [attemptOn]     For 'windowed-cast': the `TYPE:SKILL` label (matches a
 *                                    CHARACTER_ROTATIONS {type, skill} pair, same convention as the
 *                                    shared `on` field) of the rotation step that ATTEMPTS to consume
 *                                    this window — i.e. the empowered/alternate cast itself (Jinhsi's
 *                                    Overflowing Radiance window: attemptOn 'Skill:Overflowing
 *                                    Radiance'). Added alongside `deriveStepsFromRotation()` in
 *                                    rotationSimulator.js so a real CHARACTER_ROTATIONS array can be
 *                                    walked automatically — without this field there was no way to
 *                                    tell, from the block alone, WHICH step in the rotation should call
 *                                    `tryWindowedCast()` (previously only a hand-built test's
 *                                    `consumesWindowBlockId` flag on that one step could say so). Optional:
 *                                    older blocks without it simply can't be auto-derived yet and still
 *                                    need a hand-built `steps` array with `consumesWindowBlockId` set
 *                                    explicitly, same as before.
 * @property {string} [requiresPriorCast]  For 'requires-prior-cast': the trigger key (same format
 *                                    triggerEngine.js's triggerKey() produces) of a cast that must
 *                                    have occurred SOMEWHERE EARLIER in the current on-field segment
 *                                    — no time limit, unlike 'windowed-cast', just ordering within
 *                                    one continuous on-field window. Camellya's Outro Twining deals
 *                                    additional DMG only if her Forte Ephemeral was cast earlier that
 *                                    same on-field rotation (wutheringwaves.fandom.com/wiki/
 *                                    Camellya/Combat / CHARACTER_ROTATIONS['Camellya']'s own Outro
 *                                    note) — distinct from both other conditional trigger types:
 *                                    not cross-character (partner-outro-return) and not time-bounded
 *                                    (windowed-cast). Same evaluation limitation as those two: this
 *                                    field only names the dependency; a rotation simulator has to
 *                                    track "was this cast seen since the last swap-in" to evaluate it
 *                                    (see rotationSimulator.js's `recordCast`/`hasCastThisSegment`/
 *                                    `resetSegment`, added alongside this trigger type).
 * @property {string} [checksAt]      For 'requires-prior-cast': the `TYPE:SKILL` label (same
 *                                    convention as 'windowed-cast''s `attemptOn`) of the rotation step
 *                                    at which this dependency should be checked — Camellya's Outro
 *                                    Twining: checksAt 'Outro:Twining'. Added alongside
 *                                    `deriveStepsFromRotation()` for the same reason `attemptOn` was:
 *                                    without it, nothing in the block itself says WHICH step should
 *                                    call `hasCastThisSegment()` (previously only a hand-built test's
 *                                    `checksPriorCast` flag on that one step could say so). Optional,
 *                                    same fallback as `attemptOn`.
 * @property {string[]} [opensOnProc] For 'windowed-proc': trigger key(s) whose firing opens the
 *                                    proc window (same `opensOn` semantics as 'windowed-cast' —
 *                                    ANY of them opens it). Kept as a separate field name from
 *                                    'windowed-cast''s `opensOn` only to keep triggerKey() able to
 *                                    tell the two trigger types apart by field alone if ever
 *                                    needed; same list-of-trigger-keys shape otherwise.
 * @property {number} [windowSeconds] Reused for 'windowed-proc' too: how long the window stays
 *                                    open after `opensOnProc` fires.
 * @property {number} [maxProcs]      For 'windowed-proc': the cap on how many times this proc can
 *                                    fire within one open window (Yinlin S6 Furious Thunder: 4,
 *                                    within the 30s window opened by casting Liberation Thundering
 *                                    Wrath). Unlike 'windowed-cast' (a single empowered cast that's
 *                                    either landed in time or forfeited), a proc window is
 *                                    repeatable up to this count — every qualifying `on`-type hit
 *                                    (Yinlin: Basic ATK) while the window is open can independently
 *                                    trigger it, until the cap is hit or the window closes.
 * @property {string} [on]            Reused for 'windowed-proc' too: which hit type
 *                                    (CHARACTER_ROTATIONS-style, e.g. 'Basic ATK') can trigger the
 *                                    proc while its window is open — see the shared `on` doc above.
 *                                    Same evaluation limitation as every other conditional type
 *                                    added so far: this only names the window's shape (what opens
 *                                    it, how long, the cap, which hits qualify); real elapsed-time +
 *                                    count tracking is rotationSimulator.js's job (see
 *                                    `openProcWindow`/`tryProc`, added alongside this trigger type).
 */

/**
 * @typedef {Object} Proc
 * @property {number} atkPct   The discrete extra-hit's damage, as a percentage of ATK (e.g.
 *                                Yinlin S6 Furious Thunder: 419.59) — a whole separate damage
 *                                instance, not a %-modifier to an existing one.
 * @property {string} [category] Which of calcEngine.js's existing damage-type categories
 *                                (basicDmg/heavyDmg/libDmg/skillDmg/echoDmg/coordDmg) this proc's
 *                                damage is "considered" as for type-focus purposes, per the kit's
 *                                own text (Yinlin's Furious Thunder is explicitly "considered
 *                                Resonance Skill DMG" -> category: 'skillDmg'). Descriptive only —
 *                                resolveTriggerBlocks() doesn't route proc damage through
 *                                applyBuff() yet (see the TriggerBlock.proc doc above).
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
 * @property {number} [maxStacks] For 'stacking' only: the real cap on concurrent instances (e.g.
 *                                 Rover: Electro's Electro Flare debuff: 10, straight from its own
 *                                 kit text/note — "10 stacks of Electro Flare"). Added alongside
 *                                 resolveSimulatedRotation.js, which is the first thing that
 *                                 actually needs to know when a 'stacking' effect stops adding —
 *                                 every prior consumer (resolveTriggerBlocks) only ever applied a
 *                                 block once per call and never accumulated multiple instances, so
 *                                 this had no consumer to enforce it until now. Omit for a
 *                                 'stacking' effect whose real cap isn't sourced yet (kept
 *                                 uncapped rather than guessing a number — same "don't fabricate"
 *                                 rule as everywhere else in this schema).
 */

export const TRIGGER_TYPES = ['cast', 'swap-in', 'swap-out', 'passive', 'on-hit', 'resource-threshold', 'negative-status-hit', 'field-time', 'partner-outro-return', 'windowed-cast', 'requires-prior-cast', 'windowed-proc'];
export const BLOCK_KINDS = ['damage', 'buff', 'debuff', 'heal', 'utility'];
export const TARGET_SCOPES = ['self', 'on-field', 'next-on-field', 'whole-team', 'marked-enemy', 'all-enemies'];
export const STACKING_MODES = ['unique', 'stacking', 'refresh'];
