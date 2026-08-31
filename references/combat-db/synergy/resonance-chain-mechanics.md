# Resonance Chain, Swap-Cancel & Energy Mechanics — Wuthering Waves

General game-mechanics reference for how WuWa team rotation actually works at the engine level. This
is **not per-character** — it underpins every character's `kit.skills.intro`/`outro` fields in
`characters/<slug>.json` and every buff row in `buff-debuff-taxonomy.json`. Terminology is aligned with
`app/src/features/teams/calcEngine.js`, which already models several of these mechanics numerically
(cited inline below).

## Sources

- Prydwen.gg character build pages (rotation sections) — reachable via the `jsRender` bypass documented
  in `SOURCES_STATUS.md`.
- `wutheringwaves.fandom.com/wiki/Resonance_Chain` — reachable this session but the article body itself
  is a thin stub (unlocking method + a link to a separate "List" sub-page); does not contain swap-cancel
  or energy mechanics detail. Fetched 2026-08-31, confirmed thin rather than assumed.
- `wutheringwaves.fandom.com/wiki/Combat` — attempted this session; the JS-rendered fetch returned no
  usable text extract within the time budget (Fandom's Cloudflare challenge + client-side render is the
  slowest of the three sources tried in this whole combat-db effort, consistent with the "very slow"
  finding already logged in `SOURCES_STATUS.md`'s Fandom section). Not used as a source for this file —
  flagged here rather than silently worked around.
- `app/src/features/teams/calcEngine.js` — read directly (not modified) for the constants/comments that
  document how this repo's own damage engine already numerically models Frazzle, Erosion, Tune Break,
  and ER breakpoints. Cited inline as `calcEngine.js:<line-range concept>`.
- General mechanical knowledge of Wuthering Waves' combat system (Resonance Chain / Intro-Outro /
  Concerto Energy / Forte gauges), which is stable, widely-documented common knowledge among the
  playerbase and matches what the 60 already-scraped Prydwen character pages describe piecemeal in
  their individual rotation sections. Where a **specific number** is asserted below it is either sourced
  to a character file/calcEngine.js constant (cited) or explicitly marked as a rule-of-thumb, not a
  patch-exact value — consistent with this combat-db's existing standard of not inventing precision the
  source pages didn't give.

---

## 1. The three-resonator team & the swap loop

A WuWa team is exactly 3 resonators. Only one is "on-field" (actively controlled) at a time; the other
two sit off-field, generating a slower trickle of their own resource gauges (Forte, Concerto Energy) but
not attacking. The entire genre of "rotation" theorycrafting in this game is about **how to sequence
swaps** so that:

1. Each character's burst window (their Outro-buffed nuke, or their fully-charged Forte finisher) lands
   while its buffs are active.
2. Buff windows from different characters overlap on the character actually dealing damage (the "field"
   character) rather than being wasted on someone who has already left.
3. Energy for each character's Resonance Liberation (ultimate) is ready when they're back on-field.

## 2. Intro Skill vs. Outro Skill

Every playable resonator has exactly one **Intro Skill** and one **Outro Skill**, distinct from their
Basic Attack / Resonance Skill / Resonance Liberation / Forte kit:

- **Outro Skill** — cast automatically (for free, no extra input beyond the swap) when that character is
  swapped *out* under the right conditions (see §3). It typically deals a small amount of damage itself
  and, far more importantly for team-building, applies a **buff to the incoming character** (or, on some
  kits, to the whole team) — an elemental DMG bonus, an All DMG Amp, a Liberation DMG bonus, energy, etc.
  This is the buff captured as `outroBuffs` in the app's `CHAR_BUFF_TABLE` and as `kit.skills.outro` in
  each character JSON.
- **Intro Skill** — cast automatically when that character is swapped *in*, again for free. It usually
  deals a hit of damage and can carry its own conditional effect (e.g. Jinhsi's Intro can instantly
  trigger her Incarnation stance; several characters' Intros apply their signature debuff on entry so the
  very next attack benefits from it).

Because both are free actions bound to the swap itself, **every swap in a rotation is also a small extra
damage instance plus a buff application** — this is why WuWa rotations are written as explicit swap
sequences (e.g. Jinhsi's documented rotation: "Intro → Overflowing Radiance → Incarnation Basics →
Crescent Divinity → Illuminous Epiphany → Outro") rather than as a simple DPS-priority list.

## 3. Concerto Energy — what actually unlocks an Outro

An Outro Skill is not always available; it is gated behind a **Concerto Energy** gauge, filled by that
character's own Basic Attacks, Resonance Skill, Resonance Liberation, and taking/dealing certain hits
while on- or off-field. Once full, swapping that character out triggers their Outro automatically. This
is the resource that makes Outro→Intro chaining a *timing* puzzle, not a free always-on effect: a
character swapped out before their Concerto gauge is full does **not** grant their Outro buff at all,
which is why rotations are written to hold a swap until the gauge is confirmed full (usually signposted
in-game by a visual cue on the character's portrait).

## 4. Resonance Liberation & Resonance Energy

Separately, each character has a **Resonance Energy** gauge that charges their ultimate (Resonance
Liberation) — generated from Basic Attacks/Skills while on-field, at a slower background rate while
off-field, and boosted by "Energy Regen%" substats/buffs. This is the gauge `calcEngine.js` models with
its `ER_THRESHOLD_*` constants:

```
ER_THRESHOLD_MAIN_DPS  = 110%   // on-field Main DPS: builds energy every hit, needs less
ER_THRESHOLD_SUB_DPS   = 130%   // off-field Sub-DPS: less passive energy gen, needs more
ER_THRESHOLD_STANDARD  = 140%   // Support/other roles below the 175-cost healer cutoff
ER_THRESHOLD_HEALER    = 140%   // 175-cost healers
```

(`app/src/features/teams/calcEngine.js`, ER breakpoints section — the file's own comment explains the
split by role: an on-field attacker generates energy continuously, while an off-field support/sub-DPS
spends most of the rotation not generating their own energy and needs a higher ER% roll to reach full
Liberation uptime every cycle.) This is a role-differentiated rule-of-thumb from community
ER-breakpoint theorycrafting, not a single official number from the game itself.

## 5. Forte gauges — character-specific, not a shared system

Distinct from Concerto/Resonance Energy (which every character has in the same shape), each character
also has a unique **Forte** gauge system with its own name and mechanic — e.g. Jinhsi's Incandescence
(built by party attribute/coordinated-attack damage, spent on her Incarnation nuke), or a generic
"build meter via Basics, spend it on an empowered Skill/stance" pattern that recurs with different names
across the roster. This is why per-character `kit.skills.forte` text in `characters/<slug>.json` must be
read individually — it is not a shared formula the way Concerto Energy or ER breakpoints are.

## 6. Coordinated Attacks and off-field damage

Some characters' kits (notably older Aero/Coordinated-Attack-archetype supports) cause off-field
teammates to also strike when the on-field character attacks — "Coordinated Attack." This is a distinct
mechanic from Outro/Intro: it lets an off-field character contribute direct damage and, in some kits,
build their own Forte gauge passively without ever being swapped in. Per Prydwen's own review text
(synthesized into several character files' `communityNotes`), this archetype was central to the game's
early team-building meta but has received few new supporting kits since patch 2.2, making it a
comparatively dated (though still functional) team-building pattern rather than the current cutting edge
— see `jinhsi.json`'s `communityNotes` for one documented example of this exact framing.

## 7. Negative Status DOTs & Tune Break — the debuff side of rotation

Several elements carry a signature Negative Status effect applied by that element's attacks, which then
deals its own periodic damage independent of the applying character's own attacks — meaning teams can
stack DOT damage from an off-field applier while a different character is on-field attacking. `calcEngine.js`
models the two most common ones directly:

- **Frazzle** (Electro): ticks every 3s, consumes 1 stack per tick (`FRAZZLE_TICK_INTERVAL = 3`,
  `FRAZZLE_ICD_PER_SOURCE = 2.5`s application cooldown per source), non-linear stack-damage table
  (`FRAZZLE_STACK_TABLE`) sourced from the Fandom "Negative Status" page's Base DMG formula
  (`Level Mult × 1.25078 × Stack Mult`).
- **Erosion** (Aero): ticks every 3s but does **not** consume stacks on tick (`EROSION_TICK_INTERVAL = 3`,
  `EROSION_DURATION = 15`s before stacks decay), separate stack table (`EROSION_STACK_TABLE`), capped at
  3 stacks without a stack-cap-extending buff (the file notes stacks beyond 3 need Aero Rover's Outro).
- **Chafe** (Glacio) and **Bane** (Havoc) are the Glacio/Havoc equivalents, referenced throughout the
  character files' outro/buff text (e.g. Hiyuki's Outro triggering "vs. targets affected by Glacio
  Chafe") but not separately constant-tabled in `calcEngine.js` at the same granularity as
  Frazzle/Erosion as of this pass.
- **Tune Break / Tune Rupture / Tune Strain – Interfered** is a separate, element-agnostic mechanic:
  breaking an enemy's stagger ("Tune") gauge triggers a burst "Tune Rupture" hit and can inflict
  "Interfered," a stacking vulnerability window. `calcEngine.js` models a flat
  `TUNE_BREAK_BASE_DMG = 5000` base and several characters' kits (Lynae, Lucy, Rebecca) grant team-wide
  "Tune Break Boost" or extend the max Interfered-stack count — see those characters' entries in
  `buff-debuff-taxonomy.json`'s `negativeStatusApplication` row and `app/src/data/characters.js`'s
  `CHAR_BUFF_TABLE.Lynae.tuneBreak`/`.Lucy` inline comments (read for terminology alignment, not
  modified) for the fullest documented detail on this mechanic in the codebase.

## 8. Resonance Chains (Sequence Nodes) — separate from swap mechanics

A **Resonance Chain** (a.k.a. Sequence Node, S0–S6) is the game's dupe/constellation-equivalent system:
obtaining a repeat copy of a resonator (or purchasing their Waveband from the Aftershocked Coral Store,
or via story unlock for Rover) unlocks the next of up to 6 chain nodes, each adding a specific buff to
that character — anything from a numeric stat bump to a wholesale kit rework (e.g. Qingxiao's
Resonance Chain 3 grants +100% Crit DMG on a specific hit, per her character file's `selfBuffs` entry;
Jingran's Resonance Chain 4 grants the team +20% All-Attribute DMG Bonus on any Resonator gaining a
Shield). Resonance Chains are **per-character power investment**, orthogonal to the swap-rotation
mechanics above — a chain can change what a character's Outro/Intro/Forte does or how strong it is, but
does not change the underlying Concerto-Energy/swap-cancel timing rules every character shares. Source:
`wutheringwaves.fandom.com/wiki/Resonance_Chain` (thin, but confirms the unlock method above) plus the
`selfBuffs`/`debuffs` entries with `"condition": "Resonance Chain N — ..."` already present across
several `CHAR_BUFF_TABLE` entries in `app/src/data/characters.js` (read for terminology, not modified).

## 9. What this means for rotation-building (practical synthesis)

Putting §2–§8 together, a "good" WuWa rotation for a 3-member team is, at its core:

1. Open with the buffer/support's Skill(s)/Liberation to apply their buffs and any needed debuff,
2. swap to them out only once their Concerto gauge is confirmed full so their Outro actually fires,
3. let the Main DPS's Intro land into that Outro buff window,
4. sequence the Main DPS's own Basic/Skill/Forte-spender combo to maximize hits landed inside the
   buff's stated duration (the `durationApprox` field in `intro-outro-chains.json`),
5. and repeat, ideally chaining a second buffer/Outro before the first one's window fully expires so the
   Main DPS's field time is continuously buffed ("quickswap" teams push this to its extreme with very
   short per-character field windows; "hypercarry" teams instead keep one Main DPS on-field for most of
   the rotation and only briefly cycle the other two through for their Outros).

This synthesis is this document's own explanation of how the pieces fit together, not a single
directly-quoted source — it follows directly from the individually-sourced mechanics in §2–§8 above and
matches the rotation prose already present across the 60 `characters/<slug>.json` files (e.g. Jinhsi's
`rotation` field, which explicitly alternates her nukes with "the secondary buffer's own rotation").
