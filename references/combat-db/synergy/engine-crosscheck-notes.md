# Engine cross-check notes — unresolved conflicts

Logged during the 2026-08-31 pass cross-referencing `app/src/data/characters.js`
`CHAR_BUFF_TABLE` against `references/combat-db/synergy/intro-outro-chains.json`
and the individual `references/combat-db/characters/<slug>.json` files. These are
cases where two sourced references disagree and it isn't safe to guess which is
right — left for a human to resolve (ideally by checking the in-game tooltip or a
frame-counted video) rather than silently overwritten in the engine.

## Iuno — Outro "From Gloom to Gleam" duration: 14s vs 10s

- `app/src/data/characters.js` `CHAR_BUFF_TABLE.Iuno.outroBuffs`: `duration: 14`
  (50% Heavy Attack DMG Amplification to next character).
- `references/combat-db/characters/iuno.json` `kit.skills.outro` (Prydwen build
  page, https://www.prydwen.gg/wuthering-waves/characters/iuno): **"...for 14s."**
  — agrees with the app.
- `references/combat-db/synergy/intro-outro-chains.json` character entry for
  Iuno: `outro.durationApprox` is `"10s"`, and its `crossCheckedSources` entry
  for `wutheringwaves.fandom.com/wiki/Outro_Skill` (official skill-database
  list, fetched 2026-08-31) reads: **"Incoming Resonator gains 50% Heavy Attack
  DMG Amplification for 10s."** — disagrees with both the app and Prydwen.

Two sources (app + Prydwen) say 14s, one source (Fandom's official Outro Skill
list) says 10s. The Fandom skill-database page is normally the most reliable
"official numbers" source used elsewhere in this cross-check pass, which is why
this isn't dismissed outright — but Prydwen's build-page text and the app's
existing (already-cross-checked, dated 2026-08-16) entry both independently say
14s, so the app was left unchanged. **Needs a human to confirm the real value**
(e.g. against an in-game tooltip or frame-counted clip) before it's safe to
change either way; do not resolve this by majority-of-sources alone since two
of the three ultimately trace back to the same Prydwen text.

## scoreTeamComposition three-item review (2026-08-31)

Investigated per explicit task: (1) archetype-pattern bonus, (2) Outro→Intro
timing/quickswap bonus, (3) Coordinated Attack presence bonus. Read
`scoreTeamComposition` (calcEngine.js:837-1077) and its supporting functions
end-to-end plus `calcTeamStats.js`'s equivalent real-math handling before
concluding on each. No code changes made — see reasoning per item below.

### (1) Archetype-pattern bonus — no safe general-purpose gap found

`team-archetypes.json`'s 31 archetypes map onto 6 `shapeDefinitions`:
Hypercarry, Dual DPS, Mono, Rupture, Echo, Fusion Burst. Checked each against
existing `scoreTeamComposition` tag logic:

- **Hypercarry** and **Mono** are already generically detected
  (calcEngine.js:1061 `elSet.size === 1` → 'Mono' tag; the buff-synergy loop
  already rewards a single mainDps receiving concentrated Outro/Lib buffs from
  non-damage-dealing teammates, which IS the Hypercarry shape's reward
  function). Note: the existing `'Hypercarry'` tag (calcEngine.js:862) is a
  *different* concept than the archetype's Hypercarry shape — it flags an
  off-role carry (dpsOverride ≠ statically-tagged Main DPS), not "one DPS +
  two pure buffers." Worth a naming disambiguation next time this code is
  touched, but out of scope for this pass (not a scoring gap, a label
  collision).
- **Dual DPS** is already generically detected (calcEngine.js:1043-1054,
  gated on the second DPS demonstrably buffing the first — the exact
  "traded on-field time pays for itself" condition the shapeDefinition
  describes).
- **Rupture**, **Echo**, and **Fusion Burst** are NOT generalizable patterns
  in the current data: `shapeDefinitions` itself names Echo and Fusion Burst
  as named for ONE character's kit-specific mechanic each (Phrolova, Aemeath
  respectively) — encoding either as a detectable "archetype" would really
  just be a single-character special case dressed up as a pattern. Rupture
  is element-agnostic in principle, but which characters/hits actually
  trigger Tune Break/Rupture isn't tracked as a per-character flag anywhere
  in `CHARACTER_DATA`/`CHAR_BUFF_TABLE` today, so detecting "this team is a
  Rupture team" would require guessing from role/kit text rather than reading
  an existing field — exactly the "false-positive archetype match recommends
  a bad team" risk the task explicitly warned against. Not implemented;
  would need a `CHARACTER_DATA` field for Rupture-contribution (e.g. which
  attacks apply Tune Break) added and cross-checked first, which is future
  combat-db work, not a scoreTeamComposition change.

Conclusion: no fix made. The generalizable archetype shapes are already
captured by existing tag logic; the remaining ones are single-character
mechanics or lack the underlying per-character data needed to detect safely.

### (2) Outro→Intro timing/quickswap bonus — already implemented, not a gap

`uptimeScaledUplift` (calcEngine.js:821-825, merged in PR #285 alongside this
review) already scales every Outro/Lib buff's scored uplift by
`min(1, buffDuration / dpsOnField)` before adding it to score — i.e. a buff
whose duration doesn't fully cover the incoming DPS's on-field window is
already discounted proportionally, which is precisely the "does Outro timing
actually cover the next DPS's window" signal item 2 asked to check for. This
mirrors (without duplicating) `calcTeamStats.js`'s own per-segment buff
application, and does NOT reintroduce the removed `composeTeamRotation`
duplicate-rotation-composer (calcEngine.js:1111-1119 explicitly warns against
that) — it uses the DPS's already-known `onField`/`rotTime` field, not a
re-simulated timeline. Confirmed already handled; no further change needed.

### (3) Coordinated Attack presence bonus — real gap identified, NOT implemented (unsafe to hardcode narrowly)

Confirmed `coordDmg` as a **buff stat** (e.g. Youhu's Outro, "+100%
Coordinated ATK DMG Amp") is already correctly gated and scored
(calcEngine.js:928-930,941: routed through `typeFocusMap` only when the
receiving DPS's `dmgFocus` includes `'Coordinated ATK'`). That part is NOT
the gap.

The real gap: none of the 7 Fandom-confirmed CA-role characters (Baizhi,
Cantarella, Mortefi, Verina, Yinlin, Yuanwu, Zhezhi) has a Main DPS role in
`CHARACTER_DATA` — the `'Coordinated ATK'` dmgFocus tag only appears on
sub-DPS/support-type characters (Yinlin, Zhezhi, Cantarella, Mortefi, Aalto,
Yuanwu — Youhu is CA-*Amp* only, not CA-role, per
`resonance-chain-mechanics.md` §6). Their own value AS an off-field
coordinated-attack damager (their own `totalMult`, discounted/boosted by
`calcTeamStats.js`'s `coordShare`/`coordUptime` formula at
calcTeamStats.js:984-996) is real and already modeled in the real damage
calc — but `scoreTeamComposition` has **no equivalent for ANY non-mainDps
member's own damage output**, CA or otherwise; it only scores buffs a
teammate lands ON the mainDps, tier/element/weapon points, and the
redundant-second-Main-DPS penalty. Adding a bonus that credits ONLY the 7 CA
characters' presence (without a general "sub-DPS's own totalMult"
mechanism, which doesn't exist in this scorer at all) would inconsistently
favor CA sub-DPS picks over an equally- or better-performing non-CA sub-DPS
in the same slot with no principled basis for the difference — the "false
positive is worse than no bonus" risk applies here too, just via omission
bias instead of a wrong pattern match. Additionally, the CA trigger
condition differs per character (some trigger off the on-field ally's Basic
ATK, others off Heavy ATK or Skill hits — see per-character `note` fields at
calcEngine.js:2257,2303 etc.), so a correct gate would also need to check
the mainDps's own attack-type focus against each CA character's specific
trigger, not just "any of these 7 in team" — more surface area than a
"small, targeted bonus" can safely cover in one pass.

Not implemented. If this is revisited: the right fix is a general "credit a
sub-DPS's own scaled totalMult contribution" mechanism in
`scoreTeamComposition` (benefiting all sub-DPS, not just CA ones), with CA's
`coordShare`/`coordUptime` math as one input to that general formula — not a
CA-specific bonus bolted onto the current mainDps-buffs-only model.

## Not an engine gap: Hsin has no `CHAR_BUFF_TABLE`/`CHARACTER_DATA` entry at all

`references/combat-db/characters/hsin.json` is explicitly marked
`"PARTIAL DATA"` — Prydwen's Hsin page exists but all detail sections (Skills,
Resonance Chain, Minor Fortes, Stats, Upgrade Materials, Review) are still
unpublished as of the 2026-08-31 scrape. Hsin has no entry anywhere in
`app/src/data/characters.js` (`CHARACTER_DATA`, `CHAR_BUFF_TABLE`, or
`RESONANCE_CHAIN_DATA`) — consistent with the character being wholly unreleased
in the live app, not a missed buff-table entry. No action taken; re-check once
Prydwen's Hsin kit page is complete.
