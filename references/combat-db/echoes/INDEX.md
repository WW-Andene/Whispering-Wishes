# Echoes — Coverage Index

32 of Prydwen's 34 listed echo sonata sets have a structured `references/combat-db/echoes/<slug>.json` file. Each file carries: `element`, `bonuses` (`2pc`/`3pc`/`5pc` text as applicable), `usedBy` (characters whose `buildGuide.echoSet` in `references/combat-db/characters/*.json` names this set), and `inEngineTeamSetBuffs` (whether the set appears in `app/src/features/teams/calcEngine.js`'s `TEAM_SET_BUFFS` table).

## Provenance — read before trusting a number

These 32 entries were **not** independently re-scraped from Prydwen's per-set pages in this pass. They were generated from `app/src/data/echoes.js`'s `ECHO_SETS` table, which per that file's own audit comments (dated 2026-08-18) was itself checked against nanoka.cc's live echo pages at that time — a real source, but one step removed from Prydwen and roughly a year stale relative to this session's date (2026-08-31). Prydwen's live echo list page (`https://www.prydwen.gg/wuthering-waves/echoes`, fetched 2026-08-31) was used only to confirm the **set name list**, not to re-verify every 2pc/5pc value. Treat every `bonuses` field here as "app-data-derived, not source-verified this session" until a follow-up pass fetches each set's own Prydwen page and checks the numbers directly.

## Known gaps vs. Prydwen's live set list

Prydwen's echo list page (fetched 2026-08-31) shows **34** named sets; the app's `ECHO_SETS` table (and therefore this index) has 32. Missing from `app/src/data/echoes.js` entirely, and so **not present here**:

- **Endless Resonance** — no entry anywhere in the app or here. Needs a fresh Prydwen fetch of its set page.
- **Flamewing's Shadow** — referenced only in a comment in `echoes.js` (as `"Flamewing's Shadow"`, alongside the v2.7-2.8 "Chronorift" set batch) but has no dictionary entry, no p2/p5 text, and no file here. Needs the same treatment.

Both should be added in a follow-up pass: fetch `https://www.prydwen.gg/wuthering-waves/echoes` for the set-select detail (or the set's own sub-page if Prydwen has one), record `2pc`/`5pc` text, and cross-check whether either belongs in `calcEngine.js`'s `TEAM_SET_BUFFS` for a team-wide effect.

## `TEAM_SET_BUFFS` cross-check (calcEngine.js line ~1161)

Every set name in `TEAM_SET_BUFFS` has a matching file here with `inEngineTeamSetBuffs: true` (11 sets: Rejuvenating Glow, Moonlit Clouds, Empyrean Anthem, Tidebreaking Courage, Halo of Starry Radiance, Pact of Neonlight Leap, Gusts of Welkin, Windward Pilgrimage, Flaming Clawprint, Midnight Veil, Chromatic Foam). No further discrepancy was found beyond what `echoes.js`'s own in-file audit comments already document (several `p5val` numbers were previously wrong and were already corrected in-app on 2026-08-18 — see comments in `app/src/data/echoes.js` for Empyrean Anthem, Gusts of Welkin, Windward Pilgrimage, Pact of Neonlight Leap). Since `TEAM_SET_BUFFS`'s numeric values were derived from the same `p5val` fields, no NEW discrepancy is flagged in `synergy/engine-crosscheck-notes.md` from this pass — this is a "no new finding," not a full independent re-verification.

## Usage cross-reference (from `buildGuide.echoSet` across the 60 character files)

Sets used by the most characters: Moonlit Clouds (27), Rejuvenating Glow (12), Molten Rift (5), Windward Pilgrimage (5), Empyrean Anthem (5). Two sets show `usedBy: []` (no character file's `buildGuide.echoSet` currently names them) — **Lingering Tunes** and **Lamp of Nether Road** — flagged here as either genuinely niche/unused-in-current-meta sets, or a sign that some character's `echoSet` text uses different wording than the set's canonical name (worth a spot check in a follow-up pass rather than assumed to be a real gap).

## Open work for a follow-up pass

1. Add Endless Resonance and Flamewing's Shadow (fetch from Prydwen directly).
2. Re-verify all 32 existing sets' 2pc/5pc text and numbers against Prydwen's own per-set pages (this pass used the app's already-existing nanoka-derived data as a shortcut, not a fresh Prydwen scrape per set).
3. Confirm whether Lingering Tunes / Lamp of Nether Road are genuinely absent from all 60 characters' recommended echo sets, or a naming mismatch.
