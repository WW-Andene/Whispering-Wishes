# Monsters — Coverage Index

**Status: not started this pass.** Per the task brief's own triage instruction ("prioritize weapons and echoes over monsters if you have to triage for time"), and given the time actually available in this session, effort went entirely into weapons (122/122 sourced, full BiS cross-check passed) and echoes (32/34 sets, cross-checked against the character files and `calcEngine.js`'s `TEAM_SET_BUFFS`) — see `weapons/INDEX.md` and `echoes/INDEX.md`. Zero `references/combat-db/monsters/<monster-slug>.json` files exist yet.

## What's already in the app (do not duplicate)

`app/src/data/enemyLevelStats.json` already has **181** monster entries, each a per-level `[DEF, RES-related-stat, HP]`-shaped array (indexed by level 1-90+) — e.g. `"Abyssal Gladius": [[485,75,800], [511,82,808], ...]`. `app/src/data/enemyStaggerStats.json` holds stagger/Tune Break data per monster. This is the generic level-scaling data; it is NOT touched by this pass (per the "do not touch app/src/data/*.js" rule) and does not need to be re-derived here.

## What this category is actually supposed to add

Per the task brief: enemy **element weaknesses/RES**, **notable mechanics**, and **Tune Break/stagger thresholds if documented** for Tower of Adversity bosses and major overworld bosses — data the app does not yet model, not a restatement of the per-level DEF/HP arrays it already has.

## Candidate boss list (identified, not yet fetched)

Cross-referencing the 181 `enemyLevelStats.json` keys against Echo "Class: Overlord" / "Class: Calamity" entries (captured from Prydwen's echo list page during the echoes pass, see `echoes/INDEX.md`'s provenance note) narrows the roster to boss-tier enemies whose Echo forms are drops from Tacet Field / Tower of Adversity encounters. Overlord-class (18): Crownless, Nightmare: Crownless, Impermanence Heron, Nightmare: Impermanence Heron, Thundering Mephis, Nightmare: Thundering Mephis, Tempest Mephis, Nightmare: Tempest Mephis, Dreamless (Calamity), Hecate (Calamity), Nightmare: Hecate (Calamity), Sentry Construct, Lorelei, Inferno Rider, Nightmare: Inferno Rider, Fallacy of No Return, Mourning Aix, Nightmare: Mourning Aix, Bell-Borne Geochelone (Calamity), Jué (Calamity), Sigillum (Calamity, Aemeath-specific), Lampylumen Myriad, Nightmare: Lampylumen Myriad, Feilian Beringal, Nightmare: Feilian Beringal, Dragon of Dirge, Lady of the Sea, Lioness of Glory, Mech Abomination, Hyvatia, Nightmare: Kelpie, Reminiscence: Fenrico, Reminiscence: Fleurdelys (Calamity), Reminiscence: Threnodian - Leviathan (Calamity), Reminiscence: Threnodian - Voidborne Construct (Calamity), Reminiscence: Denia (Calamity), Reminiscence - Nightmare: Adam Smasher, Thousand-Puppet Pavilion, Voidwing Moth, The False Sovereign.

This list (~35+ names, many being "Nightmare:" hard-mode variants of a base boss) should be triaged down to the ~15-25 the task brief asks for by collapsing each base-boss/Nightmare-variant pair into one entry (noting the Nightmare version's differences) and confirming which are actually Tower of Adversity vs. standard open-world Tacet Field bosses.

## Planned technique for a follow-up pass

1. `ww.nanoka.cc/monster/<numeric-id>` — SOURCES_STATUS.md documents nanoka's numeric-ID URL scheme (discovered for characters; the same `/monster/` path likely needs its own ID map, not yet captured). Start by fetching `ww.nanoka.cc/monster` (list page) the same way the character list page was fetched, to get the ID map.
2. `wutheringwaves.fandom.com/wiki/<Boss_Name>` per boss, same `jsRender:true, waitMs:15000-20000` technique documented as working-but-slow in SOURCES_STATUS.md's Fandom section.
3. Record per boss: element weakness(es)/RES if published, stagger/Tune Break threshold if documented, and 2-4 sentences of notable mechanics relevant to rotation planning (e.g. phase transitions, shield/parry windows, elemental-swap gimmicks) — explicitly not a re-statement of `enemyLevelStats.json`'s numbers.

## Honesty note

No monster file exists in this directory as of this commit. Nothing here should be read as partial coverage — this INDEX exists so the next pass has a concrete starting list and technique instead of starting from zero research.
