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

**RESOLVED 2026-08-31 (commit 76df3e6a):** implemented exactly this general
mechanism — every `role === 'Sub DPS'` teammate is now credited for their own
normalized power score, discounted by `calcSubDpsFieldMultRatio()` (a direct
port of `calcTeamStats.js`'s real `fieldRatio`/`coordShare`/`coordUptime`
off-field-time-share math, not a re-approximation). CA characters benefit
automatically through the real `coordShare` term for any `dmgFocus` that
includes `'Coordinated ATK'`, with no per-character CA list hardcoded. The
Redundant-DPS -20 penalty for a second Main DPS was also relaxed to credit
real off-field contribution instead of an all-or-nothing buff-vs-penalty
split. See `calcEngine.js` for `normalizedDpsPowerScore`/
`calcSubDpsFieldMultRatio`.

## Resolved: `'Hypercarry'` tag name collision with the archetype-shape name

`scoreTeamComposition` (calcEngine.js, ~line 909) pushed a `'Hypercarry'` tag
meaning "the team's real carry isn't the statically role-tagged Main DPS" (an
off-role carry, e.g. a Sub DPS run solo). `team-archetypes.json`'s
`archetypeShapes.Hypercarry` names a completely different concept: "one Main
DPS + two pure buffers, no other damage dealer at all." These are unrelated
and could collide if/when real archetype-shape detection is ever added to
this same `tags` array. **Fixed 2026-08-31:** renamed the engine tag to
`'Off-Role Carry'`. No other code or locale string depended on the literal
`'Hypercarry'` tag value (checked: no test, no i18n string keys on it — the
only other `Hypercarry`-adjacent hit in the app was an unrelated local
variable name in `TeamsTab.jsx`, `ownedHypercarry`, which doesn't read this
tag). `team-archetypes.json`'s archetype-shape name is untouched.

## Not an engine gap: Hsin has no `CHAR_BUFF_TABLE`/`CHARACTER_DATA` entry at all

`references/combat-db/characters/hsin.json` is explicitly marked
`"PARTIAL DATA"` — Prydwen's Hsin page exists but all detail sections (Skills,
Resonance Chain, Minor Fortes, Stats, Upgrade Materials, Review) are still
unpublished as of the 2026-08-31 scrape. Hsin has no entry anywhere in
`app/src/data/characters.js` (`CHARACTER_DATA`, `CHAR_BUFF_TABLE`, or
`RESONANCE_CHAIN_DATA`) — consistent with the character being wholly unreleased
in the live app, not a missed buff-table entry. No action taken; re-check once
Prydwen's Hsin kit page is complete.

## Recommendation-pipeline audit (2026-08-31, second pass) — autoEquip.js, TeamSelector/TeamsTab, full scoreTeamComposition re-read

Scope: `autoEquip.js` (never audited before this pass), `scoreTeamComposition`
re-read end to end for internal consistency after the 76df3e6a sub-DPS patch,
`TeamSelector.jsx`/`TeamsTab.jsx` UI-layer surfacing of scores/tags, and a
sample cross-check of characters' `bestEchoes`/`dmgFocus`/`substatPriority`
against `references/combat-db/characters/*.json`.

### FIXED: `libDmg` buffs not gated by Liberation `dmgFocus` in `scoreTeamComposition`

`scoreTeamComposition`'s local `typeFocusMap` (calcEngine.js, was line 989)
gates `basicDmg`/`heavyDmg`/`echoDmg`/`coordDmg`/`skillDmg` buffs to only
apply when the receiving DPS's `dmgFocus` actually includes that attack
type — but omitted `libDmg` entirely, so any Liberation-DMG outro buff fell
through to `buffApplies`'s final `return true` (the "atkPct/critRate/critDmg
are universal" catch-all) and was scored as applicable to ANY DPS regardless
of whether Liberation is even part of their kit.

Four real characters carry a `target:'next'` `libDmg` outro in
`CHAR_BUFF_TABLE` (`app/src/data/characters.js`): Jianxin (+38%), Lynae
(+25%), Changli (+25%), Yinlin (+25%). All four were being scored as
full-value teammates for every DPS in the recommendation engine, including
non-Liberation-focused ones who mechanically get zero benefit from the buff.

Confirmed against the real damage calculator in the same codebase, not
guessed: `calcEngine.js`'s own `TYPE_FOCUS_MAP` (line 366, used by
`applyBuff`/`routeTypeBonuses` for actual DPS math) already contains
`libDmg: 'Liberation'`, and `calcTeamStats.js:1314` independently applies the
identical gate (`b.stat === 'libDmg' && dpsFocus.includes('Liberation')`) in
its own sub-DPS synergy-scoring code. `scoreTeamComposition`'s local map was
simply missing the one entry the rest of the codebase already agrees on.

**Fixed**: added `libDmg: 'Liberation'` to `typeFocusMap`. `cd app && npm
test`: 611/612 passing (same one pre-existing, unrelated SSR failure as
every prior pass on this branch — not touched).

### Checked and clean: `autoEquip.js` (first audit of this file)

Read in full. Findings:

- `bestEchoes`/`bestWeapon`/`weaponAlts` are read directly from
  `CHARACTER_DATA`, which is the same source `references/combat-db` was
  cross-checked against in earlier passes (e.g. Jinhsi:
  `bestEchoes: ['Jué', 'Celestial Light 5pc']`, `bestWeapon: 'Ages of
  Harvest'` matches `characters/jinhsi.json`'s `buildGuide.echoSet` /
  `bestWeapons[0]` exactly) — no drift found in the sample checked (Jinhsi,
  Verina, Yinlin, Camellya, Cartethyia, Xiangli Yao, Baizhi).
- The multi-build-entry parsing (`stripAnnotation`, the `totalRequestedPc
  >= 5` stop condition) and the 2pc+2pc hybrid-set handling are already
  correctly implemented and documented in-file with worked reasoning tied to
  real characters (Chisa/Aemeath/Denia's multi-build entries, Rebecca/Lucy's
  intentional 3-piece 1pc+2pc target) — re-verified the logic against those
  specific characters' actual `bestEchoes` strings and it parses as
  intended.
- `pickEcho`'s fallback chain (direct-name match → pure-set match → any-set
  match → element/dead-weight-aware fallback → any unused echo) is
  internally consistent and never returns `null` while any echo remains
  unused, so it can't silently leave a gear slot empty the way an earlier
  version (per its own in-file changelog comments) apparently did.
- `computeAutoEquipEntryOptimized`'s search over `['default','er','support']`
  presets for an ambiguous non-headline DPS actually re-runs
  `calcTeamStats` per candidate and keeps the highest real `teamDps` — a
  measured choice, not a heuristic guess, and its in-file comment documents
  a concrete case (a previously-tried "spare DPS → ER when no healer"
  heuristic regressed teamDps 12613 → 9767) that was reverted once measured
  against the real engine. No further gap found here.
- No character's `bestEchoes` in the checked sample contradicts its own
  `substatPriority`/`mainStats` fields from combat-db in any way autoEquip's
  set-matching logic would mishandle.

One known, already-documented simplification (not a new bug, not fixed):
combat-db's `substatPriority` for nearly every character (including pure
Crit DPS) lists "Energy Regen (until satisfied)" as the #1 substat —
reflecting real players itemizing ER echoes only until they clear their
rotation's energy requirement, then switching purely to Crit. `autoEquip.js`
has no per-character energy-requirement model to know when "satisfied" is
reached, so its `default` (Crit DPS) preset omits Energy Regen from the
substat list entirely rather than guessing a breakpoint — a decision already
made and measured in-file (see the reverted "spare DPS → ER" experiment
above, which found trading Crit for ER a straight DPS loss without a real
uptime model backing it). Flagging for awareness only: a future
energy-cycle-aware substat allocator would be a real improvement, but
building one safely is a data/measurement project of its own, not a
surgical fix.

### Checked and clean: `TeamSelector.jsx` / `TeamsTab.jsx` UI-layer surfacing

- `TeamSelector.jsx`'s "Recommended" badge rank (`recommendedOrder.indexOf(name)
  + 1`) is derived from `recommendedNames`' Map insertion order, which
  `TeamsTab.jsx` builds via `[...candidateScores.entries()].sort((a,b) =>
  b[1]-a[1])` — insertion order does equal descending-score order in a plain
  JS `Map`, so the displayed rank badge always matches the real score
  ranking. No stale-order bug found.
- `filteredChars`' own sort in `TeamsTab.jsx` (~line 401) uses the same
  `candidateScores` map as the primary sort key, so the grid's actual left-
  to-right/top-to-bottom order also matches score order, not just the badge.
  (Its inline comment — "Higher vote count... ranks first" — is stale/
  imprecise leftover phrasing from an earlier curated-votes-only version;
  the code itself already correctly sorts by the full synergy score, which
  includes but isn't limited to curated votes. Cosmetic comment drift only,
  not a functional bug — not fixed since no code change is needed.)
- The "Team Suggestions" list (`teamSuggestions` `useMemo`) and the
  character-selector's own live `candidateScores` computation both call
  the identically-shared `scoreTeamComposition`, so a fix to the scorer
  (like the `libDmg` fix above) automatically applies to both surfaces —
  confirmed no second, drifted copy of the ranking math exists in either
  file.
- `applySuggestion`'s handling of `dpsOverride` (set for custom/roster-built
  teams, left unset/cleared for curated `CHARACTER_DATA.teams` entries) is
  intentional and already documented in-file; re-verified it doesn't leave
  a stale override from a previously-loaded team, since it's explicitly
  dispatched to `null` whenever the loaded suggestion doesn't carry one.

No new UI-layer bug found in this pass — a correct score already reliably
drives what the player sees.
