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

## Not an engine gap: Hsin has no `CHAR_BUFF_TABLE`/`CHARACTER_DATA` entry at all

`references/combat-db/characters/hsin.json` is explicitly marked
`"PARTIAL DATA"` — Prydwen's Hsin page exists but all detail sections (Skills,
Resonance Chain, Minor Fortes, Stats, Upgrade Materials, Review) are still
unpublished as of the 2026-08-31 scrape. Hsin has no entry anywhere in
`app/src/data/characters.js` (`CHARACTER_DATA`, `CHAR_BUFF_TABLE`, or
`RESONANCE_CHAIN_DATA`) — consistent with the character being wholly unreleased
in the live app, not a missed buff-table entry. No action taken; re-check once
Prydwen's Hsin kit page is complete.
