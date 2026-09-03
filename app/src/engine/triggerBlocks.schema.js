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
 * @property {Array<string|{tag: string, requiresStance: string}>} [appliesTags]  Added 2026-09-02
 *                                   alongside the 'ally-action' trigger/'trigger-actor' target (see
 *                                   triggerBlocks.schema.js's Trigger/Target docs, and Engine
 *                                   development.md item 9 for the audit this closes): names which
 *                                   real-game status/action this block's own resolution counts as
 *                                   applying (e.g. `['shifting']`, `['fusion-burst']`,
 *                                   `['havoc-bane']`, `['echo-skill-cast']`) — sourced strictly from
 *                                   that move's own kit text ("inflicts Shifting", "counted as
 *                                   casting Echo Skill", etc.), never inferred. Any OTHER character's
 *                                   `ally-action` trigger naming this same tag fires the instant this
 *                                   block resolves, regardless of whose block it is — this is what
 *                                   makes `appliesTags` do real work instead of being flavor
 *                                   metadata: it's the only thing that makes a Denia/Lynae/Qingxiao
 *                                   Shifting-application step visible to another character's
 *                                   reactive buff at all. A bare string entry is unconditional
 *                                   (Qingxiao's shape — her Shifting application never depends on a
 *                                   mode). An `{tag, requiresStance}` object entry (Denia/Lynae's
 *                                   shape — needed because a SINGLE mode-invariant-damage block can
 *                                   apply a DIFFERENT status per Resonance Mode) only fires when
 *                                   `sequenceGating.js`'s `winningStanceForOwner()` resolves that
 *                                   owner's assumed mode to this exact stance text — see that
 *                                   function's own comment for why this is a theoretical-optimizer
 *                                   "assume whichever mode nets more value" read, not live mode
 *                                   tracking (no state machine exists for that). Omit entirely for
 *                                   the common case (a block that applies no tracked status).
 * @property {DotApplier} [dotApplier]  Added 2026-09-02 (the engine-merge history (git log) Phase 2): marks a block
 *                                   as one character's real, sourced contribution to a shared,
 *                                   team-wide DOT reaction (Frazzle/Erosion/Fusion Burst/Electro
 *                                   Flare/Tune Break) — the exact same five mechanics
 *                                   `calcEngine.js`'s `calcFrazzleDmg` etc. compute today from
 *                                   `CHAR_BUFF_TABLE[name].debuffs`/`.electroFlare`/`.tuneBreak`, now
 *                                   sourced from the block that actually casts the applying move
 *                                   instead of a flat per-character table entry disconnected from any
 *                                   trigger. Read by `engine/dotReactionsFromBlocks.js`, NOT by
 *                                   `resolveHitComposedTeamDps`/`resolveSimulatedTeamRotation` (a DOT
 *                                   reaction's damage isn't a per-hit or per-target buff in the sense
 *                                   those resolvers model — it's a shared pool every real applier
 *                                   contributes to, matching `calcEngine.js`'s own per-mechanic
 *                                   aggregation rule, which `dotReactionsFromBlocks.js` reproduces
 *                                   exactly: SUM of appliers' `value` for Frazzle, MAX for Erosion, a
 *                                   boolean "does anyone apply it" gate for Fusion Burst, single-value
 *                                   for Electro Flare's starting stack seed). Put on the block whose
 *                                   own `trigger` is the REAL move that applies the status per that
 *                                   character's kit text (e.g. Buling's Intro and enhanced Liberation
 *                                   both deploy Electro Flare) — never a synthetic marker block, so a
 *                                   block that stops firing (cooldown-ineligible, sequence-gated below
 *                                   the owner's real chain level) correctly stops contributing too,
 *                                   something the old flat-table approach couldn't express at all.
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
 * @property {{atkPct: number, flat?: number}[]} hits  One entry per individual hit in this cast (a
 *                                        multi-stage combo like Yinlin's 4-tap Basic ATK has one entry
 *                                        per stage, already expanded — a source row's `×N` shorthand
 *                                        becomes N separate entries, not one entry with a multiplier
 *                                        field).
 *                                        The field is always named `atkPct` even when `basis` is
 *                                        `'HP'`/`'DEF'` (matches calcTeamStats.js's own convention —
 *                                        e.g. its `sKey`/`baseStat` handling — of keeping one %-value
 *                                        field regardless of which base stat it scales off).
 *                                        `flat` (optional, added 2026-09-02, Phase 0.5 gap #8): a
 *                                        non-%ATK additive damage component some real kit text carries
 *                                        alongside the %ATK term (e.g. Buling's "169 flat + 18.30%
 *                                        ATK") — `resolveHitComposedDps.js`/`resolveHitComposedTeamDps.js`
 *                                        add it to the base-damage term before crit/dmgBonus/defMult/
 *                                        resMult, matching WuWa's own formula (it is NOT a separate
 *                                        standalone hit). Omit for the common all-%ATK case.
 * @property {string} [category]        Which of calcEngine.js's existing damage-type categories
 *                                        (basicDmg/heavyDmg/libDmg/skillDmg/echoDmg/coordDmg) this
 *                                        cast's damage counts as — same vocabulary/purpose as
 *                                        `Proc.category`.
 * @property {string} [basis]           Which base stat these hits scale off: `'ATK'` (default,
 *                                        omit for the common case) | `'HP'` | `'DEF'`. Added
 *                                        2026-09-01 for Shorekeeper's Discernment (Intro), whose own
 *                                        kit text says explicitly "scales off her HP, not ATK" — a
 *                                        real, sourced fact, not a guess. `resolveHitComposedDps.js`
 *                                        reads this to pick the right base value instead of silently
 *                                        assuming every hit is ATK-scaling.
 * @property {boolean} [guaranteedCrit] True if this cast is a guaranteed Crit per its own kit text
 *                                        (Shorekeeper's Discernment: "a guaranteed-Crit hit," sourced
 *                                        from the same CHARACTER_ROTATIONS note the rest of this
 *                                        block's data comes from) — `resolveHitComposedDps.js` uses
 *                                        the full `(1 + cd/100)` crit multiplier for these hits
 *                                        instead of `calcAvgCrit`'s expected-value blend, which would
 *                                        otherwise silently undercount a hit that can never actually
 *                                        NOT crit.
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
 *                            see below) | 'ally-action' (added 2026-09-02 for the "when ANY team
 *                            member performs action X, [someone] gains buff Y" pattern audited in
 *                            the engine-architecture history (git log) item 9 — Qingxiao's/Denia's Shifting/Fusion Burst
 *                            reactive buffs, Cartethyia's/Sigrika's/Luuk Herssen's/Galbrena's/
 *                            Mornye's whole-team buffs on an ally's own action, none of which are
 *                            anchored to the block OWNER's own cast — see below)
 * @property {string} [on]   The specific skill/move id this trigger fires on (matches a
 *                            CHARACTER_ROTATIONS-style {type, skill} pair when type === 'cast');
 *                            omitted for triggers that aren't tied to one specific move
 * @property {string} [action]  For 'ally-action': the tag name (matches a damage block's own
 *                            `appliesTags` entry, see DamageHits below) this trigger fires on,
 *                            regardless of WHICH team member's step actually applied that tag —
 *                            unlike every other trigger type, this one is NOT scoped to the block's
 *                            own owner's steps; it fires the instant any team member's own damage
 *                            block with a matching tag resolves. E.g. `{ type: 'ally-action',
 *                            action: 'shifting' }` fires whenever Denia, Lynae, Qingxiao, or anyone
 *                            else in the team lands a hit tagged `appliesTags: ['shifting']`.
 * @property {string} [resource]      Name of the gauge this trigger reads, for 'resource-threshold'
 * @property {number} [threshold]     Value the resource must reach/cross
 * @property {string} [resourceStepOn]  For 'resource-threshold': the `TYPE:SKILL` label (same
 *                                    convention as `attemptOn`/`checksAt`/proc's `on`) of the
 *                                    CHARACTER_ROTATIONS step that itself represents this threshold
 *                                    being reached (Yinlin's Chameleon Cipher: resourceStepOn
 *                                    'Forte:Chameleon Cipher'). Added 2026-09-01 rather than building
 *                                    real gauge-accumulation simulation (tracking Judgment Points/
 *                                    Electric Surge/Concerto Energy gain-per-hit, caps, etc. — a much
 *                                    larger, currently-unsourced modeling task with no per-hit gain-rate
 *                                    data anywhere in characters.js yet): a rotation guide's own step
 *                                    sequence ALREADY encodes "the gauge is full here" simply by
 *                                    placing this step at this point (Yinlin's own
 *                                    CHARACTER_ROTATIONS note literally says "Once Judgment Points hit
 *                                    100/100, her Heavy Attack is replaced by this automatically") —
 *                                    reusing that existing, sourced assertion is honest (it derives
 *                                    from real data, not a guess) even though it does NOT track a real
 *                                    numeric gauge value the way `windowed-proc`'s time/count tracking
 *                                    does. `deriveStepsFromRotation()` auto-tags the matching step;
 *                                    `simulateRotation()`/`simulateTeamRotation()` fire the
 *                                    'resource-threshold:...' key there. A future real gauge simulator
 *                                    (if ever built) would supersede this, not conflict with it — this
 *                                    field just names which step to trust in the meantime.
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
 * @property {boolean} [crossCharacterHit] Added 2026-09-03 (Cantarella's Diffusion — REMAINING_WORK.md
 *                                    1a's off-field summon-chain gap): when true, ANY team member's
 *                                    landed hit can advance this proc window, not just the block
 *                                    owner's own — combining 'ally-action''s "fires off anyone's step"
 *                                    shape with 'windowed-proc''s window/cap tracking, the cross-
 *                                    character variant the plain mechanism never needed before (every
 *                                    prior windowed-proc block, e.g. Yinlin's S6, only cared about its
 *                                    OWN owner's hits). `on` is typically omitted with this flag —
 *                                    Diffusion's real text is "every hit SHE OR THE TEAM lands", no
 *                                    move-type filter — meaning every real step everywhere qualifies,
 *                                    not just one named move. The window itself still only OPENS off
 *                                    the owner's own `opensOnProc` cast, same as always; only which
 *                                    hits can ADVANCE it once open is cross-character. Evaluated in
 *                                    rotationSimulator.js's main step loop directly (no `ev.triesProc`
 *                                    needed — every qualifying step across the whole team is checked
 *                                    automatically), and in resolveHitComposedTeamDps.js's damage loop
 *                                    (scans ALL team members' result rows for a matching fired key on
 *                                    this specific block, not just the block owner's own rows, since
 *                                    the proc can now land on a step belonging to someone else).
 * @property {number} [minProcInterval] Added alongside `crossCharacterHit`: a real-time rate limit in
 *                                    seconds between successful procs on the SAME window (Diffusion:
 *                                    "up to 1 Coordinated Attack per second" — multiple qualifying
 *                                    hits landing within the same second still only proc once).
 *                                    Omitted (or 0) means no rate limit beyond `maxProcs` itself, the
 *                                    same behavior every prior windowed-proc block already had.
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
 * @typedef {Object} DotApplier
 * @property {'frazzle'|'erosion'|'fusionBurst'|'electroFlare'} mechanic  Which shared DOT reaction
 *   this block contributes to — same five mechanics `calcEngine.js`'s five `calc*Dmg` functions
 *   compute today, see the engine-merge history (git log) Phase 1 for each one's exact formula/constants.
 * @property {number} [value]  This character's own real, sourced stack contribution (Frazzle: summed
 *   across every real applier on the team; Erosion: the MAX across appliers, not summed — see
 *   the engine-merge history (git log) 1.1/1.2 for why these differ). Omit for `fusionBurst`/`electroFlare`, whose
 *   `calcEngine.js` formulas don't scale by a per-applier value at all (a boolean "does anyone apply
 *   it" gate) — see the engine-merge history (git log) 1.3/1.4.
 * @property {string} [requiresStance]  Added for Denia/Aemeath's Fusion Burst migration: this
 *   applier block only counts when `sequenceGating.js`'s `winningStanceForOwner()` resolves the
 *   OWNER's own assumed mode to this exact stance text — same shape and resolution mechanism as
 *   `appliesTags`'s own `{tag, requiresStance}` form (reused, not duplicated), since a mode-locked
 *   character's real DOT-reaction participation is exactly as mode-conditional as their `appliesTags`
 *   already are. Omit for an unconditional applier (Buling's Electro Flare).
 */

/**
 * @typedef {Object} Condition
 * @property {string} [element]        Restrict to a specific element (e.g. Ciaccona's Outro:
 *                                       "Aero Erosion DMG Amp only")
 * @property {string[]} [requiresRole] Block only applies if its target has one of these roles
 * @property {string} [requiresStance] e.g. 'Parry Stance', 'Apex Resonance', 'Ephemeral
 *                                       Transcendence' — kit-specific stance-gated moves. Purely
 *                                       descriptive by default: conditionHolds() has no state machine
 *                                       tracking which stance is actually active, so a block naming one
 *                                       still fires whenever its trigger fires (same limitation as every
 *                                       other not-yet-simulated conditional type in this schema — see
 *                                       'windowed-cast'/'requires-prior-cast' above). Two purpose-built
 *                                       exceptions DO get enforced, both added 2026-09-02 after a real
 *                                       audit found this silence was live-DPS-relevant, not cosmetic:
 *                                       (1) `assumedInactive` (below) for a stance explicitly confirmed
 *                                       never entered by this character's own modeled rotation; (2) when
 *                                       ≥2 sibling blocks (same `source`) each name a DISTINCT stance
 *                                       whose text contains "mode" — a real, mutually-exclusive
 *                                       Resonance-Mode choice, not just descriptive flavor text — only
 *                                       the single highest-value one is kept (filterExclusiveModeBlocks
 *                                       in sequenceGating.js). Every other requiresStance value (HP/RES
 *                                       thresholds, enemy states, stacking gauges, etc.) is still purely
 *                                       descriptive and needs its own real state-tracking mechanism
 *                                       before it can be enforced — do not assume it's already gated.
 * @property {boolean} [assumedInactive] True marks a block whose stance is CONFIRMED (via this
 *                                       character's own real CHARACTER_ROTATIONS/desc — not a guess)
 *                                       to never actually occur, so conditionHolds() always rejects it.
 *                                       Currently only Phoebe's two Confession-mode outro blocks: her
 *                                       modeled rotation is Absolution-only, and her own `note` field
 *                                       already said "her real rotation stays in Absolution mode, so
 *                                       this block does not fire" before this flag existed to actually
 *                                       enforce it. NOT a general "assume every untagged stance is off"
 *                                       switch — e.g. Camellya's Budding Mode chain blocks (s3/s6) have
 *                                       no rival stance and no such confirmation; they're a real, always-
 *                                       entered part of her own rotation (her own note's accepted TODO
 *                                       says they currently apply unconditionally, same as the legacy
 *                                       flat table) and must NOT get this flag.
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
 * @property {boolean} [forfeitOnRecipientSwapOut] Added 2026-09-03 (REMAINING_WORK.md 1a — the
 *                                   early-forfeit-on-swap gap): for a `target.scope:'next-on-field'`
 *                                   buff whose real kit text says it ends EARLY if the RECIPIENT (not
 *                                   the block's own owner) swaps out before `duration` fully elapses
 *                                   (Cantarella/Changli/Yinlin's outros: "ends early if the buffed
 *                                   Resonator is swapped out"). Read by blockWindows.js's
 *                                   `buildBlockWindows()` via its own `recipientSwapOutAt` param —
 *                                   clamps each window's `end` to the recipient's own on-field segment
 *                                   end, when provided. Simplifying assumption, stated plainly: this
 *                                   treats the recipient's segment as ONE contiguous on-field window
 *                                   (true for every currently-modeled single-pass rotation in this
 *                                   app), not a general multi-visit swap history — a recipient who
 *                                   swaps on/off multiple times isn't modeled more precisely than
 *                                   that. Omit (or false) for the ~6 other duration blocks with a
 *                                   similar-sounding but DIFFERENT mechanic (a self-scoped internal
 *                                   state window like Carlotta's Twilight Tango or Jinhsi's Incarnation
 *                                   entry window, not "the recipient swaps out") — those stay
 *                                   unmodeled, this flag only fits the "another character's own
 *                                   swap-out cuts MY buff on THEM short" shape specifically.
 */

/**
 * @typedef {Object} Target
 * @property {string} scope   One of: 'self' | 'on-field' | 'next-on-field' | 'whole-team' |
 *                              'marked-enemy' | 'all-enemies' | 'trigger-actor' (added 2026-09-02
 *                              alongside the 'ally-action' trigger type — see its own doc above —
 *                              for a buff whose recipient is specifically whichever team member's
 *                              own step caused the trigger to fire, e.g. Qingxiao S4: "after any
 *                              teammate inflicts Shifting, THEIR ATK +20%" goes to that specific
 *                              ally, not Qingxiao and not the whole team. Only meaningful paired
 *                              with `trigger.type: 'ally-action'` — resolved per-candidate-target by
 *                              checking whether THAT target's own steps fired the named action, not
 *                              pre-filterable the way self/whole-team/next-on-field are)
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
 *                                 rule as everywhere else in this schema). For a `tiers`-bearing
 *                                 effect (see below), set this to the SUM of every tier's own
 *                                 `count` (the real total stack cap).
 * @property {string} [scopedToBlockId]  the engine-merge history (git log) Phase 0.5 gap #3, added 2026-09-02: some
 *                                 real kit bonuses are scoped to ONE SPECIFIC move, not a whole damage
 *                                 category (e.g. Aemeath's "+300% Crit DMG for Heavy ATK specifically"
 *                                 — she has only one Heavy ATK damage block, but plenty of OTHER hits
 *                                 also carry a Crit DMG stat pool that shouldn't receive this). Set to
 *                                 the exact `id` of the ONE damage block this effect should apply to —
 *                                 every OTHER hit (including other hits sharing the same `category`)
 *                                 gets none of it. Only enforced by the two HIT-COMPOSED resolvers
 *                                 (`resolveHitComposedDps.js`/`resolveHitComposedTeamDps.js`, which
 *                                 already iterate per-hit); the two time-averaged legacy resolvers
 *                                 (`resolveSimulatedRotation.js`/`resolveSimulatedTeamRotation.js`)
 *                                 compute one flat stat snapshot for the WHOLE rotation and have no
 *                                 per-hit granularity to scope against — a scoped effect still applies
 *                                 there at its category's normal (broader, over-crediting) scope, the
 *                                 same class of accepted imprecision already documented for other
 *                                 stat-panel-vs-real-engine gaps in this codebase.
 *                                 CAVEAT (found 2026-09-02, Phase 0.5 gap #7): only works on a real
 *                                 `trigger.type: 'passive'` block — `statsAtInstant()` in the two
 *                                 hit-composed resolvers only ever reads from `passiveBlocks`
 *                                 (any-duration-ignored) or `buffWindows` (requires `timing.duration !=
 *                                 null`). A `trigger.type: 'cast'` buff with NO duration (the established
 *                                 "cast-scoped instant" shape used throughout this schema, e.g.
 *                                 Calcharo's S5) matches NEITHER filter and is silently never applied by
 *                                 either hit-composed resolver at all — `scopedToBlockId` on such a
 *                                 block is a no-op, not a scoping restriction. For a genuinely
 *                                 cast-scoped, same-instant bonus, use the proportional-second-hit
 *                                 pattern instead (a real `kind:'damage'` block with its own
 *                                 `damage.hits`, computed as the target fraction × the base hit's own
 *                                 summed %ATK — see Brant's `chain.s6-secondary-blast` or Denia's Dark
 *                                 Core scalar for worked examples).
 * @property {{count: number, value: number}[]} [tiers]  the engine-merge history (git log) Phase 0.5 gap #1, added
 *                                 2026-09-02: a nonlinear/multi-tier per-stack curve (e.g. Qingxiao's
 *                                 Mindlock — first 7 stacks worth 7% each, remaining 8 worth 2% each,
 *                                 `[{count:7,value:7},{count:8,value:2}]`) that a single flat `value`
 *                                 can't represent losslessly. When present, every resolver's own
 *                                 `applyEffects()` computes the real cumulative value via
 *                                 `tieredStacking.js`'s `cumulativeTieredValue(tiers, stackCount)`
 *                                 INSTEAD of `value * stackCount` — `value` is then unused/should be
 *                                 omitted. Only meaningful on a real `stacking`-mode effect whose
 *                                 stack count is genuinely tracked by a real trigger (this field alone
 *                                 does not retrofit a flat passive approximation into a dynamic
 *                                 mechanic — the block also needs a real per-stack trigger, e.g. an
 *                                 `ally-action` tag for a cross-character stacking condition, which may
 *                                 itself be a separate prerequisite).
 */

export const TRIGGER_TYPES = ['cast', 'swap-in', 'swap-out', 'passive', 'on-hit', 'resource-threshold', 'negative-status-hit', 'field-time', 'partner-outro-return', 'windowed-cast', 'requires-prior-cast', 'windowed-proc', 'ally-action'];
export const BLOCK_KINDS = ['damage', 'buff', 'debuff', 'heal', 'utility'];
export const TARGET_SCOPES = ['self', 'on-field', 'next-on-field', 'whole-team', 'marked-enemy', 'all-enemies', 'trigger-actor'];
export const STACKING_MODES = ['unique', 'stacking', 'refresh'];
